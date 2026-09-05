#!/usr/bin/env node
/*
 * ดึงข้อมูล "กระแสน้ำลึก" กับ "การเคลื่อนที่แนวดิ่ง" จาก SODA 3.3.1 ผ่าน NOAA ERDDAP
 *
 * ทำไมต้องคนละแหล่งกับผิวน้ำ
 *   ไฟล์ผิวน้ำ (ocean-uv.bin) มาจากดาวเทียมวัดระดับน้ำ — วัดได้เฉพาะผิว
 *   ส่วนกระแสน้ำ "ใต้ผิว" ไม่มีดาวเทียมไหนมองเห็น ต้องใช้แบบจำลองที่กลืนข้อมูลตรวจวัดเข้าไป
 *   SODA 3.3.1 ให้ u,v ครบ 50 ชั้นความลึก (5–5,395 ม.) และมี wt = ความเร็วผ่านระนาบ
 *   ซึ่งก็คือน้ำที่เอ่อขึ้น (upwelling) กับจมลง (downwelling) ตรง ๆ
 *
 *   ข้อแลกเปลี่ยน: SODA มีถึง ธ.ค. 2015 เท่านั้น คนละช่วงเวลากับไฟล์ผิวน้ำ (2026)
 *   ต้องเขียนกำกับบนหน้าเว็บให้ชัด ห้ามปล่อยให้เข้าใจว่าเป็นภาพวันเดียวกัน
 *
 * ใช้ยังไง
 *   node build-ocean-deep.mjs --var uv --depth 997  --out ocean-deep-997
 *   node build-ocean-deep.mjs --var uv --depth 2071 --out ocean-deep-2071
 *   node build-ocean-deep.mjs --var wt --depth 110  --out ocean-vert
 *   เพิ่ม --bands 4 ถ้ายิงทีเดียวแล้ว timeout · --from-csv <ไฟล์> ถ้าโหลดมาไว้แล้ว
 *
 * ผลลัพธ์ — สเกลคิดจากค่าจริงที่เจอ (กระแสน้ำลึกกับ wt ตัวเลขเล็กมาก
 * ถ้าใช้สเกลของไฟล์ผิวน้ำจะถูกปัดเป็นศูนย์เกือบหมด) meta จึงบอก scale มาด้วยเสมอ
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE    = path.dirname(fileURLToPath(import.meta.url));
const BASE    = "https://coastwatch.pfeg.noaa.gov/erddap";
const DATASET = "erdSoda331oceanmday";
const NODATA  = -32768;
const LAT     = [-74.75, 89.75];      // ขอบเขตจริงของชุดข้อมูล
const LON     = [0.25, 359.75];       // ไล่ 0..360 — ตัวจัดกริดย้ายให้เป็น -180..180 เอง

function args(argv) {
  const a = { varName:"uv", depth:997, out:null, bands:1, outDir:HERE, fromCsv:null, saveCsv:null };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i], next = () => argv[++i];
    if (k === "--var") a.varName = next();
    else if (k === "--depth") a.depth = parseFloat(next());
    else if (k === "--out") a.out = next();
    else if (k === "--bands") a.bands = parseInt(next(), 10);
    else if (k === "--out-dir") a.outDir = next();
    else if (k === "--from-csv") a.fromCsv = next();
    else if (k === "--save-csv") a.saveCsv = next();
    else if (k === "--print-url") a.printUrl = true;
    else if (k === "-h" || k === "--help") a.help = true;
    else die("ไม่รู้จักตัวเลือก " + k);
  }
  if (a.varName !== "uv" && a.varName !== "wt") die("--var รับได้แค่ uv หรือ wt");
  if (!a.out) a.out = a.varName === "wt" ? "ocean-vert" : "ocean-deep-" + Math.round(a.depth);
  return a;
}
const fmt = (n) => n.toLocaleString("en-US");
function die(msg) { console.error("\n✗ " + msg); process.exit(2); }

function buildUrl(a, latFrom, latTo) {
  const span = "[(last)][(" + a.depth + ")][(" + latFrom + "):(" + latTo + ")][(" + LON[0] + "):(" + LON[1] + ")]";
  const vars = a.varName === "wt" ? ["wt"] : ["u", "v"];
  return BASE + "/griddap/" + DATASET + ".csv?" + vars.map((v) => v + span).join(",");
}

async function get(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(600000) });
  const t = await r.text();
  if (!r.ok) die("ERDDAP ตอบ HTTP " + r.status + "\n  " + t.slice(0, 300));
  return t;
}

async function fetchCsv(a) {
  if (a.bands > 1) {
    const step = (LAT[1] - LAT[0]) / a.bands;
    const parts = [];
    for (let k = 0; k < a.bands; k++) {
      const f = LAT[0] + step * k;
      const t = (k === a.bands - 1) ? LAT[1] : LAT[0] + step * (k + 1) - 1e-6;
      console.log("  แถบ " + (k + 1) + "/" + a.bands + "  lat " + f.toFixed(2) + "…" + t.toFixed(2));
      parts.push(await get(buildUrl(a, f, t)));
    }
    // ตัดหัวตาราง 2 บรรทัดของแถบที่ 2 เป็นต้นไปออก แล้วต่อกัน
    return parts[0] + parts.slice(1).map((q) => "\n" + q.split("\n").slice(2).join("\n")).join("");
  }
  const url = buildUrl(a, LAT[0], LAT[1]);
  console.log("ดึงข้อมูล (อาจใช้เวลาหลายนาที)…\n  " + url);
  return get(url);
}

/* ---------- CSV → กริด ---------- */
function toGrid(text, a) {
  const head = text.trimStart().slice(0, 400).toLowerCase();
  if (head.startsWith("<") || head.indexOf("<table") >= 0)
    die("ได้ HTML กลับมาแทน CSV — ถ้าโหลดจากฟอร์มเว็บ ต้องตั้ง File type เป็น .csv");

  const lines = text.split("\n");
  const cols = lines[0].trim().split(",").map((s) => s.trim());
  const iLat = cols.findIndex((c) => c.toLowerCase().startsWith("lat"));
  const iLon = cols.findIndex((c) => c.toLowerCase().startsWith("lon"));
  const iDep = cols.findIndex((c) => c.toLowerCase().startsWith("depth"));
  const want = a.varName === "wt" ? ["wt"] : ["u", "v"];
  const iVar = want.map((v) => cols.indexOf(v));
  if (iLat < 0 || iLon < 0 || iVar.some((i) => i < 0))
    die("หัวตารางไม่มีคอลัมน์ที่ต้องการ — ได้: " + lines[0]);

  const rows = [];
  const latSet = new Set(), lonSet = new Set();
  let tstamp = null, depth = null;
  for (let n = 2; n < lines.length; n++) {
    const line = lines[n];
    if (!line) continue;
    const r = line.split(",");
    if (r.length < cols.length) continue;
    const la = Number(r[iLat]), lo = Number(r[iLon]);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) continue;
    if (tstamp === null) { tstamp = r[0].trim(); if (iDep >= 0) depth = Number(r[iDep]); }
    latSet.add(la); lonSet.add(lo);
    rows.push([la, lo, iVar.map((i) => {
      const s = r[i].trim();
      return (s === "" || s.toUpperCase() === "NAN") ? NaN : Number(s);
    })]);
  }
  if (!rows.length) die("อ่านข้อมูลไม่ได้สักแถว");

  const lats = Array.from(latSet).sort((x, y) => x - y);
  const lons = Array.from(lonSet).sort((x, y) => x - y);
  const nlat = lats.length, nlon = lons.length, ncomp = want.length;
  const jOf = new Map(lats.map((x, i) => [x, i]));
  const iOf = new Map(lons.map((x, i) => [x, i]));
  const dlat = Math.round((lats[1] - lats[0]) * 1e6) / 1e6;
  const dlon = Math.round((lons[1] - lons[0]) * 1e6) / 1e6;
  const shift = lons.some((l) => l > 180);

  // สเกลคิดจากค่าสูงสุดจริง เพื่อให้ int16 กินย่านเต็มโดยไม่ตัดยอด
  let maxAbs = 0;
  for (const [, , vals] of rows) for (const v of vals) if (Number.isFinite(v)) maxAbs = Math.max(maxAbs, Math.abs(v));
  if (!(maxAbs > 0)) die("ค่าที่ได้เป็นศูนย์หรือว่างทั้งหมด");
  const scale = maxAbs / 32000;

  const out = new Int16Array(nlat * nlon * ncomp).fill(NODATA);
  let valid = 0;
  for (const [la, lo, vals] of rows) {
    const j = jOf.get(la), i0 = iOf.get(lo);
    if (j === undefined || i0 === undefined) continue;
    if (vals.some((v) => !Number.isFinite(v))) continue;
    const i = shift ? (i0 + (nlon >> 1)) % nlon : i0;
    const k = (j * nlon + i) * ncomp;
    for (let c = 0; c < ncomp; c++) out[k + c] = Math.round(vals[c] / scale);
    valid++;
  }

  const meta = {
    source: "SODA 3.3.1 Ocean State Reanalysis (Carton, Chepurin & Chen) ผ่าน NOAA CoastWatch ERDDAP",
    sourceUrl: BASE + "/griddap/" + DATASET + ".html",
    dataset: DATASET,
    variables: want.slice(),
    unit: "m/s",
    kind: a.varName === "wt" ? "vertical" : "horizontal",
    note: a.varName === "wt"
      ? "wt = dia-surface velocity ค่าบวกคือน้ำเอ่อขึ้น (upwelling) ค่าลบคือจมลง (downwelling)"
      : "กระแสน้ำแนวราบที่ความลึกนี้ — คนละชุดข้อมูลกับผิวน้ำ และเป็นค่าเฉลี่ยรายเดือน",
    time: tstamp || "unknown",
    depth: depth,
    dtype: "int16", endian: "little",
    scale: scale, noData: NODATA,
    components: ncomp,
    nlat: nlat, nlon: nlon,
    lat0: lats[0], lon0: shift ? lons[0] - 180 : lons[0], dlat: dlat, dlon: dlon,
    layout: ncomp === 2
      ? "interleaved u,v per cell; row-major lat then lon; Int16 little-endian * scale = m/s"
      : "one value per cell; row-major lat then lon; Int16 little-endian * scale = m/s",
    validCells: valid, totalCells: nlat * nlon,
    maxAbs: maxAbs,
    builtBy: "build-ocean-deep.mjs",
  };
  return { vals: out, meta: meta };
}

/* ---------- ตรวจความสมเหตุสมผล ---------- */
function sampleAt(vals, m, lat, lon) {
  const j = Math.round((lat - m.lat0) / m.dlat);
  if (!(j >= 0 && j < m.nlat)) return null;
  const i = Math.round(((((lon - m.lon0) % 360) + 360) % 360) / m.dlon) % m.nlon;
  const k = (j * m.nlon + i) * m.components;
  const o = [];
  for (let c = 0; c < m.components; c++) {
    if (vals[k + c] === m.noData) return null;
    o.push(vals[k + c] * m.scale);
  }
  return o;
}
// ค่าเฉลี่ยในกล่องพื้นที่ ใช้ตรวจทิศทางรวมของบริเวณ ไม่ให้จุดเดียวชี้ขาด
function boxMean(vals, m, latA, latB, lonA, lonB, comp) {
  let s = 0, n = 0;
  for (let la = latA; la <= latB; la += m.dlat)
    for (let lo = lonA; lo <= lonB; lo += m.dlon) {
      const c = sampleAt(vals, m, la, lo);
      if (c) { s += c[comp]; n++; }
    }
  return n ? { mean: s / n, n: n } : { mean: NaN, n: 0 };
}

function sanity(vals, m, a) {
  console.log("\n=== ตรวจความสมเหตุสมผล ===");
  let bad = 0;
  const say = (ok, txt) => { if (!ok) bad++; console.log("  " + (ok ? "✓" : "✗") + " " + txt); };

  say(sampleAt(vals, m, 45, 90.5) === null, "กลางทวีปเอเชีย ไม่มีข้อมูล (ต้องเป็นบก)");
  say(sampleAt(vals, m, 23, 10.5) === null, "กลางทะเลทรายซาฮารา ไม่มีข้อมูล (ต้องเป็นบก)");

  const frac = m.validCells / m.totalCells;
  if (a.varName === "wt") {
    say(frac > 0.3 && frac < 0.85, "สัดส่วนช่องที่มีข้อมูล " + (frac * 100).toFixed(1) + "% (ชั้นตื้น ควรใกล้พื้นที่มหาสมุทร)");
    /* ตรวจทั้งสองเครื่องหมาย ไม่ใช่แค่ฝั่งเดียว — ถ้าเครื่องหมายกลับด้านจะจับได้ทันที
       เลือกบริเวณที่กว้างพอกับกริด 0.5°:
         เอ่อขึ้น — ศูนย์สูตรแปซิฟิก (ลมค้าดันน้ำแยกออกจากกัน) และแถบแยกตัวรอบแอนตาร์กติกา
         จมลง   — ใจกลางวงวนกึ่งเขตร้อน ที่ลมหมุนกดน้ำลง (Ekman pumping ลง)
       ไม่ใช้ชายฝั่งเปรู ทั้งที่เป็น upwelling ดังที่สุดในตำรา เพราะแถบที่เอ่อขึ้นจริงกว้างแค่
       ไม่กี่สิบกิโลเมตร กริด 0.5° (~55 กม.) เก็บไม่ไหว ค่าเฉลี่ยช่องจึงถูกวงวนที่จมลงกลบ
       — ลองแล้วติดลบทุกปีทั้งปีเอลนีโญและลานีญา ไม่ใช่ความผิดของข้อมูล */
    const eq   = boxMean(vals, m, -2, 2, 200, 260, 0);
    const sthn = boxMean(vals, m, -65, -55, 0.25, 359.75, 0);
    const gyN  = boxMean(vals, m, 25, 35, 180, 220, 0);
    const gyS  = boxMean(vals, m, -30, -20, 200, 260, 0);
    say(eq.mean > 0,   "แปซิฟิกศูนย์สูตร เอ่อขึ้น (" + eq.mean.toExponential(2) + " m/s · " + eq.n + " ช่อง)");
    say(sthn.mean > 0, "แถบมหาสมุทรใต้ 65–55°S เอ่อขึ้น (" + sthn.mean.toExponential(2) + " m/s · " + sthn.n + " ช่อง)");
    say(gyN.mean < 0,  "วงวนกึ่งเขตร้อนแปซิฟิกเหนือ จมลง (" + gyN.mean.toExponential(2) + " m/s · " + gyN.n + " ช่อง)");
    say(gyS.mean < 0,  "วงวนกึ่งเขตร้อนแปซิฟิกใต้ จมลง (" + gyS.mean.toExponential(2) + " m/s · " + gyS.n + " ช่อง)");
    say(m.maxAbs < 1e-2, "ความเร็วแนวดิ่งสูงสุด " + m.maxAbs.toExponential(2) + " m/s (ต้องเล็กกว่าแนวราบมาก)");
  } else {
    say(frac > 0.15 && frac < 0.8, "สัดส่วนช่องที่มีข้อมูล " + (frac * 100).toFixed(1) + "% (ยิ่งลึกยิ่งน้อยลงตามแอ่งสมุทร)");
    say(m.maxAbs < 1.5, "เร็วสุด " + m.maxAbs.toFixed(3) + " m/s (กระแสน้ำลึกต้องช้ากว่าผิวน้ำมาก)");
    // จุดที่คลิปพูดถึง: ใต้กัลฟ์สตรีมมีกระแสไหลสวนลงใต้ (Deep Western Boundary Current)
    const dwbc = boxMean(vals, m, 32, 40, 283, 292, 1);
    console.log("  · ใต้กัลฟ์สตรีม (32–40°N) v เฉลี่ย = " + dwbc.mean.toFixed(4) + " m/s " +
                (dwbc.mean < 0 ? "→ ไหลลงใต้ สวนทางกับผิวน้ำ ✓" : "→ ไหลขึ้นเหนือ (ไม่สวนทาง)"));
  }
  return bad;
}

/* ---------- main ---------- */
const a = args(process.argv);
if (a.help) {
  console.log("ใช้: node build-ocean-deep.mjs --var uv|wt --depth <เมตร> [--out ชื่อ] [--bands N] [--from-csv ไฟล์]");
  process.exit(0);
}
if (a.printUrl) { console.log(buildUrl(a, LAT[0], LAT[1])); process.exit(0); }

const text = a.fromCsv
  ? (console.log("อ่าน CSV จาก " + a.fromCsv), fs.readFileSync(a.fromCsv, "utf8"))
  : await fetchCsv(a);
if (a.saveCsv) { fs.writeFileSync(a.saveCsv, text, "utf8"); console.log("  เก็บ CSV ไว้ที่ " + a.saveCsv); }

const built = toGrid(text, a);
console.log("อ่านได้ " + fmt(built.meta.validCells) + " ช่องที่มีข้อมูล จาก " + fmt(built.meta.totalCells) +
            " · ความลึกจริง " + (built.meta.depth != null ? built.meta.depth.toFixed(1) + " ม." : "?") +
            " · เวลา " + built.meta.time);
const bad = sanity(built.vals, built.meta, a);

const binp  = path.join(a.outDir, a.out + ".bin");
const metap = path.join(a.outDir, a.out + "-meta.json");
if (bad) { console.error("\n✗ ไม่ผ่านการตรวจ " + bad + " ข้อ — ไม่เขียนไฟล์"); process.exit(1); }

const buf = Buffer.allocUnsafe(built.vals.length * 2);
for (let k = 0; k < built.vals.length; k++) buf.writeInt16LE(built.vals[k], k * 2);
fs.writeFileSync(binp, buf);
fs.writeFileSync(metap, JSON.stringify(built.meta, null, 2) + "\n", "utf8");

console.log("\n✓ เขียนแล้ว");
console.log("  " + binp + "  (" + fmt(fs.statSync(binp).size) + " ไบต์)");
console.log("  " + metap);
console.log("  กริด " + built.meta.dlon + "° × " + built.meta.dlat + "° (" + built.meta.nlon + " × " + built.meta.nlat +
            ") · สเกล " + built.meta.scale.toExponential(3) + " m/s ต่อหน่วย");
