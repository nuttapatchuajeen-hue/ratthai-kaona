#!/usr/bin/env node
/*
 * สร้างไฟล์สนามความเร็วกระแสน้ำจาก CSV ของ NOAA ERDDAP — ฉบับ Node
 *
 * ทำไมมีสองภาษา
 *   build-ocean-uv.py คือฉบับหลัก (ดึงจากเน็ตเองได้ด้วย) แต่เครื่อง Windows บางเครื่อง
 *   ไม่มี Python ติดตั้งไว้ ไฟล์นี้จึงทำเฉพาะขั้น "CSV → .bin" ให้ผลลัพธ์ไบต์ต่อไบต์
 *   เหมือนกัน (int16 little-endian · scale 0.0005 · noData -32768 · u,v สลับกันช่องละคู่)
 *   พร้อมชุดตรวจความสมเหตุสมผลชุดเดียวกัน ถ้าไม่ผ่านจะไม่เขียนทับไฟล์เดิม
 *
 * ใช้ยังไง
 *   node build-ocean-uv.mjs --from-csv ~/Downloads/nesdisSSH1day_xxx.csv
 *   node build-ocean-uv.mjs --from-csv <ไฟล์> --stride 2 --out ocean-uv-lo
 *
 * ตัวเลือก
 *   --from-csv <ไฟล์>    CSV จาก ERDDAP (จำเป็น — ไฟล์นี้ไม่ดึงเน็ตเอง ใช้ฉบับ .py ถ้าต้องการ)
 *   --stride K           เอาทุก K ช่อง (K=2 → 0.5° ไฟล์เล็กลง 4 เท่า)
 *   --out <ชื่อ>         ชื่อไฟล์ผลลัพธ์ไม่รวมนามสกุล (ปริยาย ocean-uv)
 *   --out-dir <โฟลเดอร์> โฟลเดอร์ปลายทาง (ปริยาย = โฟลเดอร์ของสคริปต์)
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const HERE    = path.dirname(fileURLToPath(import.meta.url));
const BASE    = "https://coastwatch.pfeg.noaa.gov/erddap";
const DATASET = "nesdisSSH1day";
const UVARS   = ["ugos", "vgos"];
// int16 เก็บได้ ±32767 · สเกล 0.0005 m/s ต่อหน่วย → รองรับถึง ±16.3 m/s
// กระแสน้ำแรงสุดในโลกราว 3 m/s จึงไม่ถูกตัดยอดเหมือนไฟล์ int8 เดิม (เพดาน 2.54 m/s)
const SCALE  = 0.0005;
const NODATA = -32768;

function args(argv) {
  const a = { stride: 1, out: "ocean-uv", outDir: HERE, fromCsv: null };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i], next = () => argv[++i];
    if (k === "--from-csv") a.fromCsv = next();
    else if (k === "--stride") a.stride = parseInt(next(), 10);
    else if (k === "--out") a.out = next();
    else if (k === "--out-dir") a.outDir = next();
    else if (k === "-h" || k === "--help") a.help = true;
    else die("ไม่รู้จักตัวเลือก " + k);
  }
  return a;
}
const fmt = (n) => n.toLocaleString("en-US");
function die(msg) { console.error("\n✗ " + msg); process.exit(2); }

/* ---------- อ่าน CSV ---------- */
// ERDDAP ส่งมาเป็นตารางล้วน ไม่มีเครื่องหมายคำพูดคร่อม จึงตัดด้วย split(",") ได้ตรง ๆ
async function parseCsv(file) {
  const st = fs.statSync(file);
  console.log("อ่าน CSV จาก " + file + "  (" + fmt(st.size) + " ไบต์)");
  const rl = readline.createInterface({
    input: fs.createReadStream(file, { encoding: "utf8" }), crlfDelay: Infinity,
  });

  let iLat = -1, iLon = -1, iU = -1, iV = -1, iTime = -1, maxIdx = 0;
  let ln = 0, tstamp = null;
  // เก็บทีละแถวไว้ในอาเรย์ที่โตเองได้ แล้วค่อยจัดเป็นกริดตอนจบ (ไม่ต้องเดาลำดับแถวจากแหล่ง)
  let cap = 1 << 20, n = 0;
  let aLat = new Float64Array(cap), aLon = new Float64Array(cap),
      aU   = new Float32Array(cap), aV   = new Float32Array(cap);
  const grow = () => {
    cap *= 2;
    const g = (old, T) => { const x = new T(cap); x.set(old); return x; };
    aLat = g(aLat, Float64Array); aLon = g(aLon, Float64Array);
    aU   = g(aU, Float32Array);   aV   = g(aV, Float32Array);
  };
  const num = (s) => {
    s = s.trim();
    if (s === "" || s.toUpperCase() === "NAN") return NaN;
    const x = Number(s);
    return Number.isFinite(x) ? x : NaN;
  };

  for await (const line of rl) {
    ln++;
    if (ln === 1) {
      const h = line.trim(), low = h.toLowerCase();
      if (low.startsWith("<") || low.includes("<table") || low.includes("<!doctype")) {
        die("ไฟล์นี้เป็น HTML ไม่ใช่ CSV\n" +
            "  ในฟอร์ม ERDDAP ช่อง File type ค่าเริ่มต้นคือ .htmlTable ต้องเปลี่ยนเป็น .csv ก่อนกด Submit\n" +
            "  (หรือแก้ .htmlTable ใน URL เป็น .csv แล้วโหลดใหม่)");
      }
      const cols = h.split(",").map((s) => s.trim());
      cols.forEach((c, i) => {
        const lc = c.toLowerCase();
        if (iLat < 0 && lc.startsWith("lat")) iLat = i;
        if (iLon < 0 && lc.startsWith("lon")) iLon = i;
        if (iTime < 0 && lc.startsWith("time")) iTime = i;
        if (c === UVARS[0]) iU = i;
        if (c === UVARS[1]) iV = i;
      });
      if (iLat < 0 || iLon < 0) die("หาคอลัมน์ latitude/longitude ไม่เจอ — หัวตาราง: " + h);
      if (iU < 0 || iV < 0) die("หาคอลัมน์ " + UVARS.join("/") + " ไม่เจอ — หัวตาราง: " + h);
      maxIdx = Math.max(iLat, iLon, iU, iV);
      continue;
    }
    if (ln === 2) continue;                      // บรรทัดหน่วย
    if (!line) continue;
    const r = line.split(",");
    if (r.length <= maxIdx) continue;
    const lat = Number(r[iLat]), lon = Number(r[iLon]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (tstamp === null && iTime >= 0) tstamp = r[iTime].trim();
    if (n === cap) grow();
    aLat[n] = lat; aLon[n] = lon; aU[n] = num(r[iU]); aV[n] = num(r[iV]);
    n++;
  }
  if (!n) die("อ่านข้อมูลไม่ได้สักแถว — ตรวจว่าไฟล์เป็น CSV จาก ERDDAP จริง");
  return { lat: aLat, lon: aLon, u: aU, v: aV, n, tstamp };
}

/* ---------- CSV → กริด ---------- */
function toGrid(pts, stride) {
  const uniq = (arr, n) => {
    const s = new Set();
    for (let i = 0; i < n; i++) s.add(arr[i]);
    return Array.from(s).sort((a, b) => a - b);
  };
  let lats = uniq(pts.lat, pts.n), lons = uniq(pts.lon, pts.n);
  if (lats.length < 2 || lons.length < 2)
    die("ข้อมูลที่ได้มีน้อยเกินไป (lat=" + lats.length + " lon=" + lons.length + ")");

  if (stride > 1) {                              // ลดความละเอียดโดยหยิบทุก K ช่อง
    lats = lats.filter((_, i) => i % stride === 0);
    lons = lons.filter((_, i) => i % stride === 0);
  }
  const jOf = new Map(lats.map((x, i) => [x, i]));
  const iOf = new Map(lons.map((x, i) => [x, i]));

  const nlat = lats.length, nlon = lons.length;
  const dlat = Math.round((lats[1] - lats[0]) * 1e6) / 1e6;
  const dlon = Math.round((lons[1] - lons[0]) * 1e6) / 1e6;
  const shift = lons.some((l) => l > 180);       // แหล่งบางที่ให้ 0..360 — หน้าเว็บคาด -180..180

  const out = new Int16Array(nlat * nlon * 2).fill(NODATA);
  let valid = 0, maxspd = 0, clipped = 0;
  for (let p = 0; p < pts.n; p++) {
    const j = jOf.get(pts.lat[p]); if (j === undefined) continue;   // แถวที่ stride ข้าม
    const i = iOf.get(pts.lon[p]); if (i === undefined) continue;
    const u = pts.u[p], v = pts.v[p];
    if (!Number.isFinite(u) || !Number.isFinite(v)) continue;       // NaN = บนบก/ไม่มีข้อมูล
    const spd = Math.hypot(u, v); if (spd > maxspd) maxspd = spd;
    let qu = Math.round(u / SCALE), qv = Math.round(v / SCALE);
    if (Math.abs(qu) > 32767 || Math.abs(qv) > 32767) {
      clipped++;
      qu = Math.max(-32767, Math.min(32767, qu));
      qv = Math.max(-32767, Math.min(32767, qv));
    }
    const tgt = shift ? (i + (nlon >> 1)) % nlon : i;               // 0..360 → -180..180
    const k = (j * nlon + tgt) * 2;
    out[k] = qu; out[k + 1] = qv; valid++;
  }

  const meta = {
    source: "NOAA CoastWatch / NESDIS — Sea Surface Height Anomalies and Geostrophic " +
            "Currents from Altimetry (" + DATASET + ", RADS)",
    sourceUrl: BASE + "/griddap/" + DATASET + ".html",
    variables: UVARS.slice(), unit: "m/s",
    time: pts.tstamp || "unknown",
    dtype: "int16", endian: "little",
    scale: SCALE, noData: NODATA,
    nlat: nlat, nlon: nlon,
    lat0: lats[0], lon0: shift ? lons[0] - 180 : lons[0], dlat: dlat, dlon: dlon,
    layout: "interleaved u,v per cell; row-major lat then lon; Int16 little-endian * scale = m/s",
    validCells: valid, totalCells: nlat * nlon,
    maxSpeed: Math.round(maxspd * 1e4) / 1e4,
    builtBy: "build-ocean-uv.mjs",
  };
  if (clipped) meta.clippedCells = clipped;
  if (stride > 1) meta.stride = stride;
  return { vals: out, meta: meta };
}

/* ---------- ตรวจความสมเหตุสมผล ---------- */
// ทิศกระแสน้ำต้องตรงกับที่โลกรู้จัก ไม่งั้นแปลว่าอ่านคอลัมน์สลับหรือแกนกลับด้าน
function sanity(vals, meta) {
  const at = (lat, lon) => {
    const j = Math.round((lat - meta.lat0) / meta.dlat);
    if (!(j >= 0 && j < meta.nlat)) return null;
    const i = Math.round(((((lon - meta.lon0) % 360) + 360) % 360) / meta.dlon) % meta.nlon;
    const k = (j * meta.nlon + i) * 2, u = vals[k], v = vals[k + 1];
    return (u === meta.noData || v === meta.noData) ? null : [u * meta.scale, v * meta.scale];
  };
  const checks = [
    ["กัลฟ์สตรีมนอกฝั่งฟลอริดา",  27,  -79.5, (c) => !!c && c[1] > 0.3, "ต้องไหลขึ้นเหนือ"],
    ["คุโรชิโอะใต้ญี่ปุ่น",        34,  141.5, (c) => !!c && c[0] > 0.1, "ต้องไหลไปตะวันออก"],
    ["อะกุลลัสใต้แอฟริกา",        -36,   22.5, (c) => !!c && c[0] < 0,   "ต้องไหลไปตะวันตก"],
    ["กลางทวีปเอเชีย",             45,   90.5, (c) => c === null,        "ต้องไม่มีข้อมูล (บนบก)"],
    ["กลางทะเลทรายซาฮารา",         23,   10.5, (c) => c === null,        "ต้องไม่มีข้อมูล (บนบก)"],
  ];
  console.log("\n=== ตรวจความสมเหตุสมผล ===");
  let bad = 0;
  for (const [name, la, lo, ok, why] of checks) {
    const c = at(la, lo), good = ok(c);
    if (!good) bad++;
    const shown = c === null ? "ไม่มีข้อมูล" : "u=" + c[0].toFixed(2) + " v=" + c[1].toFixed(2);
    console.log("  " + (good ? "✓" : "✗") + " " + name + "  " + shown + "  (" + why + ")");
  }
  const frac = meta.validCells / meta.totalCells, okfrac = frac > 0.3 && frac < 0.85;
  if (!okfrac) bad++;
  console.log("  " + (okfrac ? "✓" : "✗") + " สัดส่วนช่องที่เป็นน้ำ " + (frac * 100).toFixed(1) +
              "% (คาดราว 55% ของผิวโลกที่เป็นทะเลเปิด)");
  return bad;
}

/* ---------- main ---------- */
const a = args(process.argv);
if (a.help || !a.fromCsv) {
  console.log("ใช้: node build-ocean-uv.mjs --from-csv <ไฟล์.csv> [--stride K] [--out ชื่อ] [--out-dir โฟลเดอร์]");
  process.exit(a.help ? 0 : 2);
}
if (!Number.isInteger(a.stride) || a.stride < 1) die("--stride ต้องเป็นจำนวนเต็ม ≥ 1");
if (!fs.existsSync(a.fromCsv)) die("ไม่พบไฟล์ " + a.fromCsv);

const pts = await parseCsv(a.fromCsv);
console.log("อ่านได้ " + fmt(pts.n) + " จุด");
const built = toGrid(pts, a.stride);
const bad = sanity(built.vals, built.meta);

const binp  = path.join(a.outDir, a.out + ".bin");
const metap = path.join(a.outDir, a.out + "-meta.json");
if (bad) {
  console.error("\n✗ ไม่ผ่านการตรวจ " + bad + " ข้อ — ไม่เขียนทับไฟล์เดิม");
  process.exit(1);
}
// เขียนแบบระบุ endian ชัดเจน ไม่พึ่งว่าเครื่องที่รันเป็น little-endian
const buf = Buffer.allocUnsafe(built.vals.length * 2);
for (let k = 0; k < built.vals.length; k++) buf.writeInt16LE(built.vals[k], k * 2);
fs.writeFileSync(binp, buf);
fs.writeFileSync(metap, JSON.stringify(built.meta, null, 2) + "\n", "utf8");

console.log("\n✓ เขียนแล้ว");
console.log("  " + binp + "  (" + fmt(fs.statSync(binp).size) + " ไบต์)");
console.log("  " + metap);
console.log("  กริด " + built.meta.dlat + "° × " + built.meta.dlon + "° (" + built.meta.nlon + " × " +
            built.meta.nlat + ") · เร็วสุด " + built.meta.maxSpeed.toFixed(2) + " m/s · ช่องที่เป็นน้ำ " +
            fmt(built.meta.validCells));
