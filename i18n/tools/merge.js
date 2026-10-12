// รวมคำแปลจาก .scratch/i18n/out/*.json → เขียนไฟล์ชุดคำแปล i18n/en/*.js + _manifest.js
//   node i18n/tools/merge.js           รวม + ตรวจ + เขียนไฟล์
//   node i18n/tools/merge.js --check   ตรวจอย่างเดียว ไม่เขียน
//
// รูปแบบไฟล์ใน out/
//   <chunk-id>.json          {"0":"Home","1":"About",...}   ← คำแปลตามลำดับในก้อนงาน chunks/<chunk-id>.json
//   glossary*.json           {"ไทย":"English",...}           ← ศัพท์กลาง ใส่ชุด common
//   direct-<ชุด>--*.json      {"ไทย":"English",...}           ← เพิ่ม/แก้คำแปลเฉพาะชุดนั้น (ทับของเดิม)
// ชุดที่มีอยู่แล้วใน i18n/en ถือเป็นต้นฉบับ: คำแปลเดิมจะถูกเก็บไว้เสมอ (out/ ทับได้)
const fs = require("fs");
const path = require("path");
const L = require("./lib");

const CHECK = process.argv.includes("--check");
const OUT = path.join(L.WORK, "out"), CH = path.join(L.WORK, "chunks"), SEG = path.join(L.WORK, "seg");
const issues = [];

function validate(th, en, where) {
  if (typeof en !== "string" || !en.trim()) { issues.push({ where, th, en, why: "empty" }); return false; }
  if (L.TH.test(en)) { issues.push({ where, th, en, why: "thai-left" }); return false; }
  const dTh = (th.match(/\d+/g) || []).join(","), dEn = (en.match(/\d+/g) || []).join(",");
  if (dTh && dTh !== dEn) {
    const a = new Set(th.match(/\d+/g)), b = new Set(en.match(/\d+/g) || []);
    const lost = [...a].filter((x) => !b.has(x));
    if (lost.length) issues.push({ where, th, en, why: "digits " + lost.join(","), warn: true });
  }
  return true;
}

// ---- คำแปลเดิมจากไฟล์ชุด ----
const existing = {}; // bundle → payload
const TM = new Map();
if (fs.existsSync(L.OUT_EN)) for (const f of fs.readdirSync(L.OUT_EN)) {
  if (!f.endsWith(".js") || f.startsWith("_")) continue;
  const name = f.slice(0, -3), b = L.readBundle(name);
  if (!b) continue;
  existing[name] = b;
  for (const k in b.d) if (!TM.has(k)) TM.set(k, b.d[k]);
}

// ---- คำกำกวม (แปลแยกตามชุด ไม่ใช้คำแปลกลาง) ----
const AF = path.join(L.WORK, "ambiguous.json");
const AMBIG = new Set(fs.existsSync(AF) ? JSON.parse(fs.readFileSync(AF, "utf8")) : []);

// ---- คำแปลใหม่ ----
const forced = {};    // bundle → {th: en}   (direct-*: ใช้เฉพาะชุดนั้น)
const perBundle = {}; // bundle → {th: en}   (ผลแปลของก้อนงานที่ชุดนั้นเป็นเจ้าของ)
let fresh = 0;
if (fs.existsSync(OUT)) for (const f of fs.readdirSync(OUT).sort()) {
  if (!f.endsWith(".json")) continue;
  let o;
  try { o = JSON.parse(fs.readFileSync(path.join(OUT, f), "utf8")); }
  catch (e) { issues.push({ where: f, why: "bad json: " + e.message }); continue; }
  const id = f.slice(0, -5);
  if (id.startsWith("glossary") || id.startsWith("direct-")) {
    const glossary = id.startsWith("glossary");
    const bundle = glossary ? "common" : id.slice(7).split("--")[0];
    forced[bundle] = forced[bundle] || {};
    for (const th in o) {
      const k = L.norm(th);
      if (!L.TH.test(k)) continue;
      if (validate(k, o[th], f)) {
        forced[bundle][k] = o[th];
        if (glossary && !AMBIG.has(k)) TM.set(k, o[th]);   // อภิธานศัพท์ = คำแปลกลางของทั้งเว็บ / direct- = เฉพาะชุด
        fresh++;
      }
    }
    continue;
  }
  const cf = path.join(CH, id + ".json");
  if (!fs.existsSync(cf)) { issues.push({ where: f, why: "no chunk " + id }); continue; }
  const chunk = JSON.parse(fs.readFileSync(cf, "utf8"));
  const pb = (perBundle[chunk.bundle] = perBundle[chunk.bundle] || {});
  let missing = 0;
  for (const it of chunk.items) {
    const en = o[it[0]] ?? o[String(it[0])];
    if (en == null) { missing++; continue; }
    if (validate(it[1], en, id + "#" + it[0])) {
      pb[it[1]] = en;
      if (!AMBIG.has(it[1])) TM.set(it[1], en);
      fresh++;
    }
  }
  if (missing) issues.push({ where: id, why: "missing " + missing + "/" + chunk.items.length, warn: missing < 3 });
}

// ---- เขียนชุดคำแปล ----
const segFiles = fs.existsSync(SEG) ? fs.readdirSync(SEG).filter((f) => f.endsWith(".json")) : [];
const report = [];
const manifest = {};
let common = {};
const order = segFiles.map((f) => JSON.parse(fs.readFileSync(path.join(SEG, f), "utf8")))
  .sort((a, b) => (a.bundle === "common" ? -1 : b.bundle === "common" ? 1 : 0));
for (const s of order) {
  const prev = existing[s.bundle] || { d: {} };
  const d = {};
  let have = 0;
  for (const k of s.segs) {
    const en = (forced[s.bundle] && forced[s.bundle][k]) ?? (perBundle[s.bundle] && perBundle[s.bundle][k]) ??
      (AMBIG.has(k) ? prev.d[k] ?? (s.bundle === "common" ? undefined : common[k]) : TM.get(k));
    if (en == null) continue;
    have++;
    if (s.bundle !== "common" && !AMBIG.has(k) && common[k] === en) continue;   // ซ้ำกับ common ไม่ต้องเก็บซ้ำ
    d[k] = en;
  }
  // คงคำแปลที่เคยใส่มือไว้ในชุด (ไม่อยู่ในรายการดึงอัตโนมัติ) + คำบังคับของชุดนี้
  for (const k in prev.d) if (!(k in d) && !(s.bundle !== "common" && !AMBIG.has(k) && common[k] === prev.d[k])) d[k] = (forced[s.bundle] && forced[s.bundle][k]) ?? prev.d[k];
  for (const k in forced[s.bundle] || {}) d[k] = forced[s.bundle][k];
  if (s.bundle === "common") common = d;
  const payload = { d, p: prev.p || [], w: s.kind === "data" ? 1 : 0 };
  const pf = path.join(L.ROOT, "i18n", "src", "patterns.json");
  if (fs.existsSync(pf)) { const pp = JSON.parse(fs.readFileSync(pf, "utf8")); if (pp[s.bundle]) payload.p = pp[s.bundle]; }
  // แผนที่ไฟล์ → ชุด: ไฟล์ข้อมูล + ไฟล์ JS ของชุดหน้าเว็บ (หน้าอื่นที่ยืมสคริปต์ไปใช้ เช่น explore ใช้ election/timeline-data.js
  // จะได้ชุดคำแปลของมันไปด้วย) — common ไม่ต้อง เพราะโหลดทุกหน้าอยู่แล้ว
  if (s.kind === "data" || s.bundle !== "common") for (const f of s.files) if (s.kind === "data" || f.endsWith(".js")) manifest[f] = s.bundle;
  report.push([s.bundle, s.kind, s.segs.length, have]);
  if (!CHECK && (Object.keys(d).length || payload.p.length || s.bundle === "common"))
    L.writeBundle(s.bundle, payload, "คำแปลอังกฤษ ชุด " + s.bundle + " — สร้างโดย i18n/tools/merge.js (แก้คำแปลได้ตรงนี้ หรือผ่าน .scratch/i18n/out/direct-*.json)");
}
if (!CHECK) {
  const body = "/* แผนที่ ไฟล์ข้อมูล → ชุดคำแปล (ระบบดึงชุดให้เองเมื่อหน้าโหลดไฟล์นั้น) — สร้างโดย i18n/tools/merge.js */\nMDI18N.manifest(" +
    JSON.stringify(manifest, null, 0).replace(/,"/g, ',\n"') + ");\nMDI18N.add(\"_manifest\",{\"d\":{}});\n";
  fs.writeFileSync(path.join(L.OUT_EN, "_manifest.js"), body);
  fs.writeFileSync(path.join(L.WORK, "issues.json"), JSON.stringify(issues, null, 1));
}

const tot = report.reduce((a, r) => [a[0] + r[2], a[1] + r[3]], [0, 0]);
for (const r of report.filter((r) => r[1] === "ui")) console.log(r[0].padEnd(20) + String(r[3]).padStart(6) + " / " + String(r[2]).padEnd(6) + (r[2] ? Math.round((100 * r[3]) / r[2]) : 100) + "%");
const dr = report.filter((r) => r[1] === "data"), ds = dr.reduce((a, r) => [a[0] + r[2], a[1] + r[3]], [0, 0]);
console.log("ชุดข้อมูล " + dr.length + " ชุด".padEnd(8) + ds[1] + " / " + ds[0]);
console.log("รวม " + tot[1] + " / " + tot[0] + " | คำแปลใหม่รอบนี้ " + fresh + " | ปัญหา " + issues.filter((i) => !i.warn).length + " (+เตือน " + issues.filter((i) => i.warn).length + ")");
