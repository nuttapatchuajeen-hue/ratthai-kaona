// ดึงข้อความไทยทุกไฟล์ → แยกตามชุดคำแปล → ตัดเป็น "ก้อนงาน" (chunk) ของคำที่ยังไม่มีคำแปล
//   node i18n/tools/extract.js            สร้าง .scratch/i18n/seg/*.json + chunks/*.json
//   node i18n/tools/extract.js --stats    แค่สรุปตัวเลข
const fs = require("fs");
const path = require("path");
const L = require("./lib");
const B = require("./bundles");

const STATS = process.argv.includes("--stats");
const UI_MAX = 300, UI_CHARS = 16000, DATA_MAX = 1000, DATA_CHARS = 24000;

// ---- ไฟล์ → ชุด ----
const plan = []; // {bundle, kind, files}
const claimed = new Set();
for (const [name, pats] of Object.entries(B.ui)) {
  const files = [...new Set(pats.flatMap(L.glob))];
  files.forEach((f) => claimed.add(f));
  plan.push({ bundle: name, kind: "ui", files });
}
const dataFiles = [...new Set(B.data.flatMap(L.glob))].filter((f) => !claimed.has(f));
const byBundle = new Map();
for (const f of dataFiles) {
  const g = Object.keys(B.groups).find((p) => f.startsWith(p));
  const name = g ? B.groups[g] : "d-" + f.replace(/\.js$/, "").replace(/[\/]/g, "-");
  if (!byBundle.has(name)) byBundle.set(name, []);
  byBundle.get(name).push(f);
}
for (const [name, files] of byBundle) plan.push({ bundle: name, kind: "data", files });

// ---- คำแปลที่มีอยู่แล้ว (จากไฟล์ชุดใน i18n/en) ----
const TM = new Map();
const HAS = {}; // ชุด → Set(คำที่ชุดนั้นมีคำแปลแล้ว)
if (fs.existsSync(L.OUT_EN)) {
  for (const f of fs.readdirSync(L.OUT_EN)) {
    if (!f.endsWith(".js") || f.startsWith("_")) continue;
    const b = L.readBundle(f.slice(0, -3));
    if (!b) continue;
    HAS[f.slice(0, -3)] = new Set(Object.keys(b.d).map(L.norm));
    for (const k in b.d) if (!TM.has(L.norm(k))) TM.set(L.norm(k), b.d[k]);
  }
}
// คำกำกวม (เช่น ชื่อย่อพรรคที่เป็นคำทั่วไปด้วย "ประชาชน", "เขต") → แปลแยกทุกชุดตามบริบท ไม่ใช้คำแปลกลาง
const AF = path.join(L.WORK, "ambiguous.json");
const AMBIG = new Set(fs.existsSync(AF) ? JSON.parse(fs.readFileSync(AF, "utf8")) : []);

// ---- ดึงข้อความ ----
fs.mkdirSync(path.join(L.WORK, "seg"), { recursive: true });
const cssReport = {};
let total = 0;
const segsOf = {};
for (const p of plan) {
  const seen = new Map();
  for (const f of p.files) {
    const { src, items } = L.extractFile(f, { data: p.kind === "data" });
    if (f.endsWith(".html")) { const c = L.cssContent(src); if (c.length) cssReport[f] = c; }
    for (const it of items) {
      if (it.k.length > 4000) continue;            // ก้อนข้อมูลดิบยาวผิดปกติ ไม่ใช่ข้อความที่แสดง
      // URL / ชื่อไฟล์รูป / ชิ้นส่วนลิงก์วิกิ (มี _ ไม่มีช่องว่าง) — ไม่ใช่ข้อความที่ต้องแปล
      if (/^(https?:|www\.)|<a\s|\.(jpe?g|png|webp|svg|gif)$/i.test(it.k) || (/_/.test(it.k) && !/\s/.test(it.k))) continue;
      if (!seen.has(it.k)) seen.set(it.k, p.kind === "ui" ? [f, L.ctxAt(src, it.at, 45)] : [f]);
    }
  }
  segsOf[p.bundle] = seen;
  total += seen.size;
  if (!STATS) fs.writeFileSync(path.join(L.WORK, "seg", p.bundle + ".json"),
    JSON.stringify({ bundle: p.bundle, kind: p.kind, files: p.files, segs: [...seen.keys()] }));
}

// ---- คำที่ยังไม่มีคำแปล → ก้อนงาน (ซ้ำกันข้ามชุด แปลครั้งเดียว: ชุดแรกที่เจอเป็นเจ้าของ) ----
const owner = new Set();
const chunks = [];
const order = plan.slice().sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "ui" ? -1 : 1));
for (const p of order) {
  const todo = [];
  for (const [k, info] of segsOf[p.bundle]) {
    if (AMBIG.has(k)) {
      if (p.bundle === "common" || (HAS[p.bundle] && HAS[p.bundle].has(k)) || owner.has(p.bundle + "|" + k)) continue;
      owner.add(p.bundle + "|" + k);
      todo.push([k, ...info]);
      continue;
    }
    if (TM.has(k) || owner.has(k)) continue;
    owner.add(k);
    todo.push([k, ...info]);
  }
  const max = p.kind === "ui" ? UI_MAX : DATA_MAX, maxc = p.kind === "ui" ? UI_CHARS : DATA_CHARS;
  let cur = [], chars = 0, n = 0;
  const flush = () => {
    if (!cur.length) return;
    const id = p.bundle + "--" + String(++n).padStart(3, "0");
    chunks.push({ id, bundle: p.bundle, kind: p.kind, items: cur.map((x, i) => [i, ...x]) });
    cur = []; chars = 0;
  };
  for (const x of todo) {
    if (cur.length >= max || chars + x[0].length > maxc) flush();
    cur.push(x);
    chars += x[0].length;
  }
  flush();
}

const sum = {};
for (const p of plan) sum[p.bundle] = { kind: p.kind, files: p.files.length, segs: segsOf[p.bundle].size };
for (const c of chunks) { sum[c.bundle].todo = (sum[c.bundle].todo || 0) + c.items.length; sum[c.bundle].chunks = (sum[c.bundle].chunks || 0) + 1; }

if (!STATS) {
  // --kind=ui | --kind=data → เขียนเฉพาะก้อนงานชนิดนั้น (อีกชนิดที่อาจกำลังแปลอยู่จะไม่ถูกแตะ)
  const KIND = (process.argv.find((a) => a.startsWith("--kind=")) || "").slice(7);
  const cdir = path.join(L.WORK, "chunks");
  fs.mkdirSync(cdir, { recursive: true });
  const kindOf = Object.fromEntries(plan.map((p) => [p.bundle, p.kind]));
  for (const f of fs.readdirSync(cdir)) {
    const b = f.replace(/--\d+\.json$/, "");
    if (!KIND || kindOf[b] === KIND || !(b in kindOf)) fs.rmSync(path.join(cdir, f));
  }
  const mine = chunks.filter((c) => !KIND || c.kind === KIND);
  for (const c of mine) {
    const head = JSON.stringify({ id: c.id, bundle: c.bundle, kind: c.kind }).slice(0, -1);
    fs.writeFileSync(path.join(cdir, c.id + ".json"), head + ',"items":[\n' + c.items.map((x) => JSON.stringify(x)).join(",\n") + "\n]}\n");
  }
  for (const k of KIND ? [KIND] : ["ui", "data"]) {
    const list = chunks.filter((c) => c.kind === k).map((c) => ({
      id: c.id, bundle: c.bundle, n: c.items.length,
      avg: Math.round(c.items.reduce((a, x) => a + x[1].length, 0) / c.items.length)
    }));
    fs.writeFileSync(path.join(L.WORK, "chunks-" + k + ".json"), JSON.stringify(list));
  }
  fs.writeFileSync(path.join(L.WORK, "css-content.json"), JSON.stringify(cssReport, null, 1));
  fs.writeFileSync(path.join(L.WORK, "plan.json"), JSON.stringify(plan, null, 1));
}

const rows = Object.entries(sum);
const ui = rows.filter(([, v]) => v.kind === "ui"), data = rows.filter(([, v]) => v.kind === "data");
const fmt = ([b, v]) => b.padEnd(34) + String(v.files).padStart(4) + " ไฟล์ " + String(v.segs).padStart(7) + " ข้อความ  ค้างแปล " + String(v.todo || 0).padStart(6) + " (" + (v.chunks || 0) + " ก้อน)";
console.log(ui.map(fmt).join("\n"));
console.log("… ชุดข้อมูล " + data.length + " ชุด, ค้างแปลรวม " + data.reduce((a, [, v]) => a + (v.todo || 0), 0) + " ข้อความ, " + data.reduce((a, [, v]) => a + (v.chunks || 0), 0) + " ก้อน");
console.log("รวมข้อความ (นับซ้ำข้ามชุด) " + total + " | มีคำแปลแล้ว " + TM.size + " | ก้อนงาน " + chunks.length);
