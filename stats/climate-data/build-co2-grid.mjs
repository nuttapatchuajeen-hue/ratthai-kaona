#!/usr/bin/env node
/*
 * build-co2-grid.mjs — สร้างไฟล์กริด CO₂ ไล่วันสำหรับแผง "CO₂ 1 ปีของโลก" (stats/explore.html)
 *
 * ทำไมต้องมี
 *   คลิป NASA "A Year in the Life of Earth's CO2" เป็น "แบบจำลอง" GEOS-5 ของปี ค.ศ. 2006
 *   แผงในเว็บอยากได้ของจริงปีเดียวกัน จึงใช้ NOAA CarbonTracker (CT2025) ซึ่งเป็นชุด
 *   ผสานข้อมูลตรวจวัดจริงกับแบบจำลองการไหลเวียนอากาศ ให้ค่า CO₂ ทั้งโลกรายวัน
 *
 * ตัวแปรที่ดึง (มีอยู่ในไฟล์เดียวกัน ดาวน์โหลดรอบเดียวได้ทั้งคู่)
 *   xco2      = CO₂ เฉลี่ยทั้งคอลัมน์อากาศ (ppm) — ตัวเดียวกับที่คลิป NASA ระบายสี
 *   co2_400m  = CO₂ ที่ระดับ 400 เมตรเหนือพื้น (ppm) — เห็นแหล่งปล่อย/ป่าหายใจชัดกว่า
 *
 * กริดต้นทาง 3°×2° : lon -178.5…178.5 (120 ช่อง) · lat -89…89 (90 ช่อง)
 *   ไฟล์ที่เขียนออกจะ "กลับด้านละติจูด" ให้แถวแรกเป็นขั้วโลกเหนือ (วาดบนจอง่ายกว่า)
 *
 * รูปแบบไฟล์ผลลัพธ์
 *   co2-<var>-<ปี>.bin   Uint8 [เฟรม][ละติจูด 90][ลองจิจูด 120]
 *                        ppm จริง = min + ค่า × scale  (min/scale อยู่ใน meta)
 *   co2-<var>-<ปี>.json  รายละเอียดกริด + วันที่ทุกเฟรม + ค่าเฉลี่ยโลกถ่วง cos(lat)
 *
 * ต้องมี h5wasm (ไฟล์ต้นทางเป็น NetCDF-4/HDF5) — โปรเจกต์นี้ไม่มี node_modules
 *   ติดตั้งชั่วคราวที่ไหนก็ได้ แล้วชี้ผ่านตัวแปรแวดล้อม H5WASM:
 *     npm i h5wasm            (ในโฟลเดอร์ชั่วคราว)
 *     H5WASM=/path/node_modules/h5wasm/dist/node/hdf5_hl.js node build-co2-grid.mjs 2006 2024
 *
 * ใช้ยังไง
 *   node build-co2-grid.mjs 2006 2024          # ปีที่ต้องการ (ค่าเริ่มต้น 2006 กับ 2024)
 *   node build-co2-grid.mjs 2006 --step 3      # ทุกกี่วันต่อ 1 เฟรม (ค่าเริ่มต้น 3)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = "https://gml.noaa.gov/aftp/products/carbontracker/co2/CT2025/molefractions/xCO2_1330LST";
const VERSION = "CT2025";
const NLON = 120, NLAT = 90;
const VARS = [
  { key:"xco2",     out:"xco2", label:"CO₂ เฉลี่ยทั้งคอลัมน์อากาศ (XCO₂)" },
  { key:"co2_400m", out:"sfc",  label:"CO₂ ที่ระดับ 400 ม. เหนือพื้น" },
];

const argv = process.argv.slice(2);
let step = 3;
const si = argv.indexOf("--step");
if (si >= 0) { step = parseInt(argv[si+1], 10) || 3; argv.splice(si, 2); }
const years = argv.filter(a => /^\d{4}$/.test(a)).map(Number);
if (!years.length) years.push(2006, 2024);

const h5mod = process.env.H5WASM || "h5wasm";
const h5wasm = (await import(h5mod)).default;
const { FS } = await h5wasm.ready;

/* ---------- รายชื่อวันของปี เว้นทีละ step วัน ---------- */
function daysOfYear(year, step) {
  const out = [];
  const d = new Date(Date.UTC(year, 0, 1));
  while (d.getUTCFullYear() === year) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + step);
  }
  return out;
}

/* ---------- ดาวน์โหลดไฟล์เดียว (ลองซ้ำได้ เพราะเซิร์ฟเวอร์ NOAA หลุดเป็นครั้งคราว) ---------- */
async function grab(date, tries = 4) {
  const url = `${BASE}/${VERSION}.xCO2_1330_glb3x2_${date}.nc`;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return Buffer.from(await r.arrayBuffer());
    } catch (e) {
      if (i === tries - 1) { console.warn("  ! ข้าม", date, "—", e.message); return null; }
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

/* ---------- อ่านทั้งสองตัวแปรออกมาเป็น Float32 พร้อมกลับด้านละติจูด ---------- */
function readFrame(buf, name) {
  FS.writeFile(name, buf);
  const f = new h5wasm.File(name, "r");
  const res = {};
  for (const v of VARS) {
    const raw = f.get(v.key).value;              // [1][lat ใต้→เหนือ][lon]
    const flip = new Float32Array(NLAT * NLON);  // เขียนใหม่ให้แถว 0 = เหนือสุด
    for (let y = 0; y < NLAT; y++) {
      const src = (NLAT - 1 - y) * NLON, dst = y * NLON;
      for (let x = 0; x < NLON; x++) flip[dst + x] = raw[src + x];
    }
    res[v.out] = flip;
  }
  f.close();
  FS.unlink(name);
  return res;
}

/* ---------- น้ำหนักตามพื้นที่ (cos ละติจูด) ใช้หาค่าเฉลี่ยทั้งโลก ---------- */
const W = new Float64Array(NLAT);
for (let y = 0; y < NLAT; y++) W[y] = Math.cos((89 - y * 2) * Math.PI / 180);

for (const year of years) {
  const dates = daysOfYear(year, step);
  console.log(`\n=== ปี ${year} · ${dates.length} เฟรม (ทุก ${step} วัน) ===`);
  const frames = { xco2: [], sfc: [] };
  const kept = [];
  const LIMIT = 6;
  let done = 0;

  for (let i = 0; i < dates.length; i += LIMIT) {
    const chunk = dates.slice(i, i + LIMIT);
    const bufs = await Promise.all(chunk.map(d => grab(d)));
    chunk.forEach((d, j) => {
      if (!bufs[j]) return;
      const fr = readFrame(bufs[j], `t${year}_${d}.nc`);
      kept.push(d);
      frames.xco2.push(fr.xco2);
      frames.sfc.push(fr.sfc);
    });
    done += chunk.length;
    process.stdout.write(`\r  โหลดแล้ว ${done}/${dates.length}`);
  }
  console.log(`\n  ใช้ได้ ${kept.length} เฟรม`);

  for (const v of VARS) {
    const arr = frames[v.out];
    if (!arr.length) continue;
    let lo = Infinity, hi = -Infinity;
    for (const f of arr) for (const x of f) { if (x < lo) lo = x; if (x > hi) hi = x; }
    const scale = (hi - lo) / 255;
    const bin = Buffer.alloc(arr.length * NLAT * NLON);
    const means = [];
    arr.forEach((f, k) => {
      let s = 0, w = 0;
      for (let y = 0; y < NLAT; y++) {
        for (let x = 0; x < NLON; x++) {
          const val = f[y * NLON + x];
          bin[k * NLAT * NLON + y * NLON + x] = Math.max(0, Math.min(255, Math.round((val - lo) / scale)));
          s += val * W[y]; w += W[y];
        }
      }
      means.push(+(s / w).toFixed(2));
    });
    const stem = `co2-${v.out}-${year}`;
    fs.writeFileSync(path.join(HERE, stem + ".bin"), bin);
    fs.writeFileSync(path.join(HERE, stem + ".json"), JSON.stringify({
      variable: v.key, label: v.label, year, unit: "ppm",
      source: `NOAA CarbonTracker ${VERSION} — xCO2_1330LST (เวลาท้องถิ่น 13:30 น.)`,
      url: `${BASE}/`,
      nlat: NLAT, nlon: NLON, lat0: 89, dlat: -2, lon0: -178.5, dlon: 3,
      stepDays: step, frames: kept.length, dates: kept,
      min: +lo.toFixed(3), max: +hi.toFixed(3), scale: +scale.toFixed(6),
      globalMean: means,
    }, null, 1));
    console.log(`  เขียน ${stem}.bin (${(bin.length/1048576).toFixed(2)} MB) · ${lo.toFixed(1)}–${hi.toFixed(1)} ppm`);
  }
}
console.log("\nเสร็จแล้ว");
