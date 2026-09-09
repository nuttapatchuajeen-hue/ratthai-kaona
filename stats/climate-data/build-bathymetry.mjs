#!/usr/bin/env node
/*
 * ดึง "ความลึกท้องทะเลทั้งโลก" มาทำกริดให้แผงจำลองสึนามิ
 *
 * ทำไมต้องมี
 *   สึนามิเดินทางเร็วเท่ากับ √(g·h) — ลึก 4 กม. ได้ราว 713 กม./ชม. · ลึก 100 ม. เหลือ 113 กม./ชม.
 *   ความลึกท้องทะเลจึงเป็น "ตัวกำหนดทุกอย่าง" ทั้งเวลาที่คลื่นไปถึงและทิศที่คลื่นหักเห
 *   ไฟล์ที่สคริปต์นี้สร้างคือพื้นทะเลที่ tsunami-sim.js เอาไปเดินสมการน้ำตื้น
 *
 * แหล่งข้อมูล
 *   ETOPO1 ของ NOAA NCEI ผ่าน ERDDAP (ชุด etopo180) ซึ่งย่อยให้เรียกทีละแถบและ
 *   หยิบทุก N ช่องได้จากฝั่งเซิร์ฟเวอร์ จึงไม่ต้องโหลดไฟล์ NetCDF ทั้งก้อนหลายร้อยเมกะไบต์
 *
 * ทำไมตัดที่ ±66°
 *   ใกล้ขั้วโลกช่องกริดแคบลงตาม cos(ละติจูด) เงื่อนไข CFL เลยบีบให้ dt เล็กลงเรื่อย ๆ
 *   จนคำนวณไม่ไหว · และไม่มีแหล่งกำเนิดสึนามิสำคัญอยู่นอกช่วงนี้ (คลิปของ NOAA ก็ตัดคล้ายกัน)
 *
 * ใช้ยังไง
 *   node build-bathymetry.mjs                 # ค่าตั้งต้น 10 ลิปดา (2160×793 ≈ 3.3 MB)
 *   node build-bathymetry.mjs --stride 15     # หยาบลงเป็น 15 ลิปดา
 *   node build-bathymetry.mjs --save-csv raw  # เก็บ CSV ดิบไว้ทำซ้ำโดยไม่ต้องโหลดใหม่
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = "https://coastwatch.pfeg.noaa.gov/erddap/griddap/etopo180.csv";
const LAT_MAX = 66, LAT_MIN = -66;      // ขอบเหนือ-ใต้ของโดเมนจำลอง
const SRC_STEP = 1 / 60;                 // ETOPO1 = 1 ลิปดา
const BAND_DEG = 12;                     // ขอทีละ 12° กันคำขอใหญ่เกินจนเซิร์ฟเวอร์ตัด

function args(argv) {
  const a = { stride: 10, outDir: HERE, saveCsv: null, fromCsv: null };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i], next = () => argv[++i];
    if (k === "--stride") a.stride = parseInt(next(), 10);
    else if (k === "--out-dir") a.outDir = next();
    else if (k === "--save-csv") a.saveCsv = next();
    else if (k === "--from-csv") a.fromCsv = next();
    else die("ไม่รู้จักตัวเลือก " + k);
  }
  if (!(a.stride >= 1 && a.stride <= 60)) die("--stride ต้องอยู่ระหว่าง 1 ถึง 60");
  return a;
}
const fmt = (n) => n.toLocaleString("en-US");
function die(m) { console.error("\n✗ " + m); process.exit(2); }

function url(stride, latFrom, latTo) {
  const span = `[(${latFrom}):${stride}:(${latTo})][(-180):${stride}:(180)]`;
  return BASE + "?altitude" + span;
}
async function get(u) {
  const r = await fetch(u, { signal: AbortSignal.timeout(600000) });
  const t = await r.text();
  if (!r.ok) die("ERDDAP ตอบ HTTP " + r.status + "\n  " + t.slice(0, 300).replace(/\s+/g, " "));
  return t;
}

async function fetchBands(stride, saveCsv) {
  const parts = [];
  const n = Math.ceil((LAT_MAX - LAT_MIN) / BAND_DEG);
  for (let k = 0; k < n; k++) {
    const lo = LAT_MIN + k * BAND_DEG;
    const hi = Math.min(LAT_MAX, lo + BAND_DEG);
    process.stdout.write(`  แถบ ${k + 1}/${n}  lat ${lo}…${hi}  `);
    const txt = await get(url(stride, lo, hi));
    console.log(fmt(txt.split("\n").length - 2) + " แถว");
    parts.push(txt);
    if (saveCsv) fs.writeFileSync(path.join(saveCsv, `band${k}.csv`), txt);
  }
  return parts;
}

/* ---------- CSV → กริด Int16 ---------- */
function toGrid(parts, stride) {
  const step = SRC_STEP * stride;
  const nx = Math.round(360 / step);                       // เส้น +180 ซ้ำกับ -180 จึงไม่นับ
  const ny = Math.round((LAT_MAX - LAT_MIN) / step) + 1;
  const grid = new Int16Array(nx * ny).fill(1);            // ตั้งต้นเป็นแผ่นดิน
  const seen = new Uint8Array(nx * ny);
  let filled = 0, skipped = 0;

  for (const txt of parts) {
    const lines = txt.split("\n");
    for (let k = 2; k < lines.length; k++) {               // 2 บรรทัดแรกเป็นหัวตารางกับหน่วย
      const L = lines[k]; if (!L) continue;
      const c1 = L.indexOf(","), c2 = L.indexOf(",", c1 + 1);
      if (c1 < 0 || c2 < 0) continue;
      const lat = +L.slice(0, c1), lon = +L.slice(c1 + 1, c2), v = +L.slice(c2 + 1);
      const j = Math.round((LAT_MAX - lat) / step);
      let i = Math.round((lon + 180) / step);
      if (i >= nx) i -= nx;
      if (j < 0 || j >= ny || i < 0) { skipped++; continue; }
      const p = j * nx + i;
      grid[p] = (!Number.isFinite(v) || v === 32767) ? 1 : Math.max(-32000, Math.min(32000, Math.round(v)));
      if (!seen[p]) { seen[p] = 1; filled++; }
    }
  }
  return { grid, nx, ny, step, filled, skipped };
}

/* ---------- เขียนไฟล์ ---------- */
function write(outDir, stride, G) {
  const name = `bathy-${stride}min`;
  const buf = Buffer.alloc(G.nx * G.ny * 2);
  for (let p = 0; p < G.grid.length; p++) buf.writeInt16LE(G.grid[p], p * 2);
  fs.writeFileSync(path.join(outDir, name + ".bin"), buf);

  const meta = {
    label: "ความลึกท้องทะเลและระดับพื้นแผ่นดินทั้งโลก",
    source: `NOAA NCEI ETOPO1 (ผ่าน ERDDAP ชุด etopo180) — หยิบทุก ${stride} ลิปดาจากกริดต้นฉบับ 1 ลิปดา`,
    sourceUrl: "https://coastwatch.pfeg.noaa.gov/erddap/griddap/etopo180.html",
    dataset: "etopo180",
    variable: "altitude",
    unit: "เมตร",
    sign: "บวก = สูงกว่าระดับน้ำทะเล · ลบ = ความลึกใต้ทะเล",
    dtype: "int16", endian: "little",
    encoding: "raw = ระดับพื้นเป็นเมตรตรง ๆ ไม่มีการสเกล",
    noData: 32767,
    nx: G.nx, ny: G.ny, step: G.step,
    lat0: LAT_MAX, lat1: LAT_MIN, lon0: -180,
    order: "แถวแรก = ละติจูด 66°N · คอลัมน์แรก = ลองจิจูด 180°W · ไล่ลงใต้และไปตะวันออก",
    note: "ตัดที่ ±66° เพราะใกล้ขั้วโลกช่องกริดจะแคบลงตาม cos(ละติจูด) จนเงื่อนไข CFL บีบให้ dt เล็กเกินจะคำนวณไหว — และไม่มีแหล่งกำเนิดสึนามิสำคัญอยู่นอกช่วงนี้",
    builtBy: "climate-data/build-bathymetry.mjs"
  };
  fs.writeFileSync(path.join(outDir, name + ".json"), JSON.stringify(meta, null, 2) + "\n");
  return { name, bytes: buf.length };
}

/* ---------- main ---------- */
const a = args(process.argv);
console.log(`สร้างกริดพื้นทะเลที่ ${a.stride} ลิปดา (lat ${LAT_MIN}…${LAT_MAX})`);
if (a.saveCsv) fs.mkdirSync(a.saveCsv, { recursive: true });

let parts;
if (a.fromCsv) {
  parts = fs.readdirSync(a.fromCsv).filter(f => f.endsWith(".csv")).sort()
            .map(f => fs.readFileSync(path.join(a.fromCsv, f), "utf8"));
  console.log(`อ่าน CSV ที่เก็บไว้ ${parts.length} ไฟล์`);
} else {
  parts = await fetchBands(a.stride, a.saveCsv);
}

const G = toGrid(parts, a.stride);
if (G.filled < G.nx * G.ny) die(`กริดไม่ครบ — เติมได้ ${fmt(G.filled)} จาก ${fmt(G.nx * G.ny)} ช่อง`);

let ocean = 0, deepest = 0, highest = 0;
for (const v of G.grid) { if (v < 0) { ocean++; if (-v > deepest) deepest = -v; } else if (v > highest) highest = v; }

const w = write(a.outDir, a.stride, G);
console.log(`\n✓ ${w.name}.bin  ${G.nx}×${G.ny}  ${(w.bytes / 1048576).toFixed(2)} MB`);
console.log(`  เป็นทะเล ${(100 * ocean / G.grid.length).toFixed(1)}%  ·  ลึกสุด ${fmt(deepest)} ม.  ·  สูงสุด ${fmt(highest)} ม.`);
if (G.skipped) console.log(`  (ข้ามแถวนอกช่วง ${fmt(G.skipped)} แถว — ปกติ เพราะแถบที่ขอคาบเกี่ยวกัน)`);
