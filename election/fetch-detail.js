/* fetch-detail.js — ดึงผลการเลือกตั้งรายเขต (ผู้สมัครทุกคน + สถิติผู้มาใช้สิทธิ)
   จากวิกิพีเดียไทย หน้า "จังหวัด<X>ในการเลือกตั้งสมาชิกสภาผู้แทนราษฎรไทยเป็นการทั่วไป พ.ศ. <ปี>"
   เติมลงไฟล์ detail-<ปี>.js เฉพาะเขตที่ยังไม่มี (ไม่ทับของเดิม)

   ใช้:  node fetch-detail.js <จังหวัด> <ปี> [--write]
         node fetch-detail.js <จังหวัด> <ปี> --verify   เทียบกับข้อมูลที่มีอยู่แล้ว

   รูปแบบต้นทางเป็นเทมเพลต {{กล่องการเลือกตั้ง …}} ซึ่งคงที่ทุกหน้า
   รหัสพรรค: ถ้ามีใน partyMeta ของปีนั้นใช้รหัสนั้น ถ้าไม่มีใช้ชื่อไทยที่ตัดคำว่า "พรรค" ออก */
const fs = require("fs"), vm = require("vm"), path = require("path"), { execSync } = require("child_process");

const EL = __dirname;
const CACHE = path.join(EL, ".wiki-cache");
const PROV = process.argv[2], YEAR = process.argv[3];
const WRITE = process.argv.includes("--write");
const VERIFY = process.argv.includes("--verify");
if (!PROV || !YEAR) { console.error("ใช้: node fetch-detail.js <จังหวัด> <ปี> [--write|--verify]"); process.exit(1); }

function loadJs(f) { const c = vm.createContext({ console }); c.window = c; vm.runInContext(fs.readFileSync(f, "utf8"), c); return c; }
function wiki(page, cacheName) {
  if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE);
  const cf = path.join(CACHE, cacheName + ".json");
  if (fs.existsSync(cf)) {
    const j = JSON.parse(fs.readFileSync(cf, "utf8"));
    if (j.parse) return j;
    fs.unlinkSync(cf);
  }
  execSync(`curl -sL --max-time 60 -G "https://th.wikipedia.org/w/api.php" ` +
    `--data-urlencode "action=parse" --data-urlencode "prop=wikitext" ` +
    `--data-urlencode "format=json" --data-urlencode "page=${page}" -o "${cf}"`, { stdio: "ignore" });
  const raw = fs.readFileSync(cf, "utf8");
  if (!raw.trim().startsWith("{")) { fs.unlinkSync(cf); throw new Error("วิกิตอบไม่ใช่ JSON (น่าจะโดนจำกัดจำนวนคำขอ) — รอสักครู่แล้วลองใหม่"); }
  const j = JSON.parse(raw);
  if (j.error) { fs.unlinkSync(cf); throw new Error("วิกิ: " + j.error.info); }
  return j;
}

/* ── ตารางรหัสพรรคของปีนั้น ── */
const PY = loadJs(path.join(EL, "parliament-" + YEAR + ".js"));
const meta = (PY.PDATA && PY.PDATA.partyMeta) || PY.partyMeta || {};
const byTh = {};
Object.entries(meta).forEach(([code, m]) => { if (m && m.th) byTh[m.th] = code; });
function partyCode(name) {
  const n = name.trim();
  if (byTh[n]) return byTh[n];
  return n.replace(/^พรรค/, "");          // พรรคที่ไม่มีรหัส ใช้ชื่อไทยตัดคำว่า "พรรค"
}

/* วิกิหลายหน้าปล่อยช่องสถิติว่างไว้ (โดยเฉพาะปี 2562 ที่ว่างเกินครึ่งประเทศ)
   ต้องคืน null ไม่ใช่ NaN ไม่งั้นจะเผลอเขียน NaN ทับข้อมูลจริง */
const num = s => { const d = String(s == null ? "" : s).replace(/[^\d]/g, ""); return d ? parseInt(d, 10) : null; };
const flt = s => { const d = String(s == null ? "" : s).replace(/[^\d.]/g, ""); return d && !isNaN(parseFloat(d)) ? parseFloat(d) : null; };
const clean = s => s.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([^\]]+)\]\]/g, "$1")
  .replace(/'{2,}/g, "").replace(/<[^>]+>/g, "").trim();

/* ── ดึงค่าพารามิเตอร์จากเทมเพลต ── */
function tplParams(body) {
  const o = {};
  body.split("|").slice(1).forEach(seg => {
    const i = seg.indexOf("=");
    if (i > 0) o[seg.slice(0, i).trim()] = seg.slice(i + 1).trim();
  });
  return o;
}
function eachTpl(text, name, cb) {
  const re = new RegExp("\\{\\{กล่องการเลือกตั้ง\\s+" + name + "([^}]*)\\}\\}", "g");
  let m; while ((m = re.exec(text))) cb(tplParams("|" + m[1]));
}

const page = (PROV === "กรุงเทพมหานคร" ? PROV : "จังหวัด" + PROV) +
  "ในการเลือกตั้งสมาชิกสภาผู้แทนราษฎรไทยเป็นการทั่วไป พ.ศ. " + YEAR;
const wt = wiki(page, "detail-" + YEAR + "-" + PROV).parse.wikitext["*"];

/* ── ตัดเป็นส่วน ๆ ตามหัวข้อ "=== เขตเลือกตั้งที่ N ===" ── */
const secs = [];
// หัวข้อมี 2 แบบตามยุคของหน้า: "เขตเลือกตั้งที่ N" กับ "เขต N"
const hre = /^===+\s*เขต(?:เลือกตั้งที่)?\s*(\d+)\s*===+\s*$/gm;
let m, prev = null;
while ((m = hre.exec(wt))) {
  if (prev) secs.push({ no: prev.no, text: wt.slice(prev.at, m.index) });
  prev = { no: +m[1], at: m.index + m[0].length };
}
if (prev) secs.push({ no: prev.no, text: wt.slice(prev.at) });

const out = {};
secs.forEach(s => {
  const cands = [];
  ["ผู้ชนะและพรรค", "ผู้สมัครและพรรค"].forEach(kind => {
    eachTpl(s.text, kind, p => {
      const raw = clean(p["ผู้สมัคร"] || "");
      const bm = raw.match(/\((\d+)\)/);
      const name = raw.replace(/\s*\(\d+\)\s*[*✔†]*\s*$/, "").replace(/[*✔†]+$/, "").trim();
      // ผู้สมัครที่วิกิไม่ลงคะแนนไว้ (ใส่ – หรือเว้นว่าง) ไฟล์เดิมไม่เก็บ → ข้ามให้ตรงกัน
      if (!name) return;
      const votes = num(p["คะแนนเสียง"]);
      if (votes == null) return;
      cands.push({
        b: bm ? +bm[1] : null, name: name,
        code: partyCode(clean(p["พรรค"] || "")),
        votes: votes,
        pct: flt(p["เปอร์เซนต์"])
      });
    });
  });
  if (!cands.length) return;
  cands.sort((a, b) => b.votes - a.votes);

  const st = {};
  eachTpl(s.text, "ผู้มีสิทธิเลือกตั้ง", p => { st.reg = num(p["ผู้มีสิทธิเลือกตั้ง"]); });
  eachTpl(s.text, "ผู้มาใช้สิทธิเลือกตั้ง", p => { st.turnout = num(p["ผู้มาใช้สิทธิเลือกตั้ง"]); st.tpct = flt(p["เปอร์เซนต์"]); });
  eachTpl(s.text, "บัตรดี", p => { st.valid = num(p["บัตรดี"]); });
  eachTpl(s.text, "บัตรเสีย", p => { st.invalid = num(p["บัตรเสีย"]); });
  eachTpl(s.text, "ไม่ประสงค์ลงคะแนน", p => { st.blank = num(p["ไม่ประสงค์ลงคะแนน"]); });

  out[PROV + "|" + s.no] = { stats: st, cands: cands };
});

console.log("หน้า: " + page);
console.log("แยกได้ " + Object.keys(out).length + " เขต · ผู้สมัครรวม " +
  Object.values(out).reduce((a, v) => a + v.cands.length, 0) + " คน");

/* ── โหมดตรวจ: เทียบกับข้อมูลที่มีอยู่แล้ว ── */
const detailFile = path.join(EL, "detail-" + YEAR + ".js");
const cur = loadJs(detailFile).EDETAIL || {};
if (VERIFY) {
  let same = 0, diff = [];
  Object.entries(out).forEach(([k, v]) => {
    const o = cur[k]; if (!o) return;
    const a = JSON.stringify(v), b = JSON.stringify(o);
    if (a === b) same++;
    else {
      const ds = [];
      const os = o.stats || {};
      Object.keys(v.stats).forEach(f => { if (v.stats[f] !== os[f]) ds.push(f + " " + os[f] + "→" + v.stats[f]); });
      if (!o.cands) ds.push("ของเดิมไม่มีผู้สมัคร");
      else if (v.cands.length !== o.cands.length) ds.push("ผู้สมัคร " + o.cands.length + "→" + v.cands.length);
      else v.cands.forEach((c, i) => {
        const oc = o.cands[i]; if (!oc) return;
        if (c.name !== oc.name || c.votes !== oc.votes || c.code !== oc.code || c.b !== oc.b)
          ds.push("#" + i + " " + JSON.stringify(oc) + " → " + JSON.stringify(c));
      });
      diff.push(k + ": " + (ds.slice(0, 4).join(" · ") || "ต่างเล็กน้อย"));
    }
  });
  console.log("\nเทียบกับของเดิม: ตรงเป๊ะ " + same + " · ต่าง " + diff.length);
  diff.slice(0, 8).forEach(d => console.log("  " + d));
  process.exit(0);
}

/* ── โหมดเติมสถิติให้เขตที่มีผู้สมัครแล้วแต่ไม่มีตัวเลขผู้มาใช้สิทธิ ──
   เติมเฉพาะฟิลด์ที่ว่าง ไม่แตะรายชื่อผู้สมัครและไม่ทับค่าที่มีอยู่ */
if (process.argv.includes("--fill")) {
  const FIELDS = ["reg", "turnout", "tpct", "valid", "invalid", "blank"];
  let src2 = fs.readFileSync(detailFile, "utf8");
  const done = [];
  Object.entries(out).forEach(([k, v]) => {
    const o = cur[k]; if (!o) return;
    const os = o.stats || {};
    const need = FIELDS.filter(f => os[f] == null && v.stats[f] != null);
    if (!need.length) return;
    const merged = {}; FIELDS.forEach(f => { merged[f] = os[f] != null ? os[f] : (v.stats[f] != null ? v.stats[f] : null); });
    const oldJson = JSON.stringify(o);
    const newJson = JSON.stringify(Object.assign({}, o, { stats: merged }));
    const needle = JSON.stringify(k) + ":" + oldJson;
    if (src2.indexOf(needle) < 0) { console.log("  ⚠ หาข้อความเดิมของ " + k + " ไม่เจอ — ข้าม"); return; }
    src2 = src2.replace(needle, JSON.stringify(k) + ":" + newJson);
    done.push(k + " (+" + need.join(",") + ")");
  });
  console.log("เติมสถิติได้ " + done.length + " เขต" + (done.length ? ":" : ""));
  done.forEach(d => console.log("  " + d));
  if (done.length && WRITE) { fs.writeFileSync(detailFile, src2, "utf8"); console.log("บันทึกแล้ว"); }
  else if (done.length) console.log("(ยังไม่บันทึก — ใส่ --write ด้วย)");
  process.exit(0);
}

/* ── เขียนเฉพาะเขตที่ยังไม่มี ── */
const add = Object.entries(out).filter(([k]) => !cur[k]);
console.log("เขตที่ยังไม่มีในไฟล์: " + add.length +
  (add.length ? " → " + add.map(([k]) => k.split("|")[1]).join(",") : ""));
if (!add.length || !WRITE) process.exit(0);

const bad = add.filter(([, v]) => !v.stats.reg || !v.cands.length);
if (bad.length) { console.error("ข้อมูลไม่ครบ ไม่เขียน: " + bad.map(([k]) => k).join(", ")); process.exit(1); }

let src = fs.readFileSync(detailFile, "utf8");
const marker = "window.EDETAIL={";
const at = src.indexOf(marker);
if (at < 0) { console.error("ไม่พบ window.EDETAIL= ใน " + detailFile); process.exit(1); }
const ins = add.map(([k, v]) => JSON.stringify(k) + ":" + JSON.stringify(v)).join(",") + ",";
src = src.slice(0, at + marker.length) + ins + src.slice(at + marker.length);
fs.writeFileSync(detailFile, src, "utf8");
console.log("เขียนแล้ว: detail-" + YEAR + ".js (+" + add.length + " เขต)");
