/* build-year-shapes.js — สร้างไฟล์รูปร่างเขตเลือกตั้งของปีเก่า
   จากไฟล์รูปร่างฐาน (ปี 2569) + ตารางประวัติเขตเลือกตั้งบนวิกิพีเดีย
   ใช้: node build-year-shapes.js <จังหวัดไทย> <ปี> [--write]
   ตรรกะ: รูปร่างตำบล (d) เหมือนเดิมทุกปี เปลี่ยนแค่ z = เลขเขตเลือกตั้งของปีนั้น */
const fs = require("fs"), vm = require("vm"), path = require("path"), { execSync } = require("child_process");
const { clean, parseYearCell } = require("./parse-zones.js");

const EL = __dirname;
const SP = path.join(__dirname, ".wiki-cache");

const PROV = process.argv[2];
const YEAR = process.argv[3];
const WRITE = process.argv.includes("--write");
if (!PROV || !YEAR) { console.error("ใช้: node build-year-shapes.js <จังหวัด> <ปี> [--write]"); process.exit(1); }

function loadJs(file) {
  const c = vm.createContext({ console }); c.window = c;
  vm.runInContext(fs.readFileSync(file, "utf8"), c);
  return c;
}
function api(page, out) {
  execSync(`curl -sL --max-time 60 -G "https://th.wikipedia.org/w/api.php" ` +
    `--data-urlencode "action=parse" --data-urlencode "prop=wikitext" ` +
    `--data-urlencode "format=json" --data-urlencode "page=${page}" -o "${out}"`, { stdio: "ignore" });
  return JSON.parse(fs.readFileSync(out, "utf8"));
}

/* ── ตารางประวัติการเปลี่ยนแปลงเขตปกครอง ──────────────────────────────────
   รูปร่างฐานเป็นของปี 2569 แต่เราจะปูเลขเขตของปีเก่า ช่วงนั้นบางอำเภอ/จังหวัด
   ยังไม่ถูกแยกออกมา จึงต้องเทียบชื่อเก่า ↔ พื้นที่ปัจจุบันให้ตรงกัน           */

// อำเภอที่ตั้งขึ้นภายหลัง — ปีเก่ายังนับรวมอยู่กับอำเภอแม่
const AMP_ALIAS = {
  "เชียงใหม่": { "แม่แจ่ม": ["แม่แจ่ม", "กัลยาณิวัฒนา"] }        // กัลยาณิวัฒนา แยกจากแม่แจ่ม พ.ศ. 2552
};
// จังหวัดที่แยกออกไปภายหลัง — ปีก่อนหน้านั้นต้องรวมพื้นที่กลับเข้ามา
const PROV_MERGE = {
  "หนองคาย": { since: 2554, take: ["บึงกาฬ"] }                    // บึงกาฬ แยกจากหนองคาย พ.ศ. 2554
};

/* ── 1. รูปร่างฐาน ── */
const idx = loadJs(path.join(EL, "district-shapes/index.js")).DISTRICT_INDEX;
const slug = idx[PROV];
if (!slug) { console.error("ไม่พบจังหวัด " + PROV + " ใน index.js"); process.exit(1); }
const base = loadJs(path.join(EL, "district-shapes/" + slug + ".js")).DISTRICT_SHAPES[PROV];

// รวมพื้นที่จังหวัดที่ยังไม่แยกออกไปในปีนั้น
const mg = PROV_MERGE[PROV];
if (mg && +YEAR < mg.since) {
  mg.take.forEach(p2 => {
    const s2 = idx[p2]; if (!s2) return;
    const b2 = loadJs(path.join(EL, "district-shapes/" + s2 + ".js")).DISTRICT_SHAPES[p2];
    base.tambons = base.tambons.concat(b2.tambons.map(t => ({ z: 0, amp: t.amp, tam: t.tam, d: t.d })));
    base.bbox = [Math.min(base.bbox[0], b2.bbox[0]), Math.min(base.bbox[1], b2.bbox[1]),
                 Math.max(base.bbox[2], b2.bbox[2]), Math.max(base.bbox[3], b2.bbox[3])];
    console.log("รวมพื้นที่ " + p2 + " เข้ามา (" + b2.tambons.length + " ตำบล) — แยกจาก " + PROV + " เมื่อ พ.ศ. " + mg.since);
  });
}
const ampSet = new Set(base.tambons.map(t => t.amp));
console.log("ฐาน: " + slug + ".js — ตำบล/แขวง " + base.tambons.length + " · อำเภอ/เขต " + ampSet.size);

/* ── 2. เขตที่ต้องมีจริงตามผลเลือกตั้ง ── */
const P = loadJs(path.join(EL, "parliament-" + YEAR + ".js")).PDATA.zone || [];
const need = [...new Set(P.filter(r => r.prov === PROV).map(r => +r.no))].sort((a, b) => a - b);
console.log("ผลเลือกตั้ง " + YEAR + ": " + need.length + " เขต [" + need[0] + "-" + need[need.length - 1] + "]");

/* ── 3. ตารางแบ่งเขตจากวิกิพีเดีย ── */
const title = "สมาชิกสภาผู้แทนราษฎร" + (PROV === "กรุงเทพมหานคร" ? PROV : "จังหวัด" + PROV);
const cacheFile = path.join(SP, "wiki-" + slug + ".json");
const j = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, "utf8")) : api(title, cacheFile);
if (j.error) { console.error("วิกิ: " + j.error.info); process.exit(1); }
const wt = j.parse.wikitext["*"];
const at = wt.indexOf("พ.ศ. " + YEAR + "|พ.ศ. " + YEAR);
if (at < 0) { console.error("ไม่พบแถวปี " + YEAR + " ในหน้า " + title); process.exit(1); }
const isBkk = PROV === "กรุงเทพมหานคร";
const AMPW = isBkk ? "เขต" : "อำเภอ", SUBW = isBkk ? "แขวง" : "ตำบล";

/* เซลล์ "การแบ่งเขต" = ระหว่าง || ตัวแรกหลังชื่อปี ถึง || ตัวถัดไป (คอลัมน์ถัดไป)
   หรือจบแถว (\n|-) แล้วแต่ว่าอะไรมาก่อน — ถ้าไม่ตัดที่ || จะลากเอา
   "||rowspan=3| || rowspan=3|4 คน" ของคอลัมน์จำนวน ส.ส. ติดมาด้วย */
function cellAt(pos) {
  const from = wt.indexOf("||", pos) + 2;
  let end = wt.indexOf("\n|-", from); if (end < 0) end = wt.length;
  const nextCol = wt.indexOf("||", from);
  if (nextCol > 0 && nextCol < end) end = nextCol;
  return wt.slice(from, end);
}
let zones = parseYearCell(cellAt(at), AMPW, SUBW);
/* ตารางวิกิใช้ rowspan รวมหลายปีที่แบ่งเขตเหมือนกันไว้ในเซลล์เดียว
   (เช่น กทม. 2544 กับ 2548) แถวปีหลังจึงว่าง → ไล่ย้อนขึ้นไปหาเซลล์ที่ครอบอยู่ */
if (!Object.keys(zones).length) {
  const rows = [...wt.matchAll(/พ\.ศ\. (\d{4})\|พ\.ศ\. \1/g)].map(m => ({ y: +m[1], i: m.index }));
  const prev = rows.filter(r => r.i < at).reverse();
  for (const r of prev) {
    const cell = cellAt(r.i);
    if (!/rowspan/.test(cell)) continue;
    const z = parseYearCell(cell, AMPW, SUBW);
    if (Object.keys(z).length) {
      console.log("แถวปี " + YEAR + " ว่าง (rowspan) → ใช้เซลล์ของปี " + r.y);
      zones = z; break;
    }
  }
}

/* ── 4. กรองรายการที่ไม่ใช่ชื่ออำเภอจริง (ข้อความหมายเหตุท้ายตาราง) ── */
const junk = [];
Object.keys(zones).forEach(z => {
  zones[z] = zones[z].filter(r => {
    if (ampSet.has(r.amp)) return true;
    junk.push("เขต " + z + ": " + r.amp);
    return false;
  });
});
if (junk.length) console.log("ตัดทิ้ง (ไม่ใช่ชื่ออำเภอในไฟล์รูปร่าง): " + junk.join(" · "));

const got = Object.keys(zones).map(Number).sort((a, b) => a - b);
console.log("วิกิให้มา " + got.length + " เขต [" + got.join(",").slice(0, 60) + (got.length > 20 ? "…" : "") + "]");

/* ── 5. ปูเลขเขตลงตำบล ── */
const assign = new Map();          // "amp|tam" -> [zone,...]
function put(key, z) { if (!assign.has(key)) assign.set(key, []); assign.get(key).push(z); }

const byAmp = {};
base.tambons.forEach(t => { (byAmp[t.amp] = byAmp[t.amp] || []).push(t); });

const alias = AMP_ALIAS[PROV] || {};
Object.keys(zones).forEach(zs => {
  const z = +zs;
  zones[zs].forEach(r => {
    // ชื่ออำเภอในปีเก่าอาจครอบคลุมหลายอำเภอในปัจจุบัน (อำเภอใหม่แยกออกไปทีหลัง)
    const amps = alias[r.amp] || [r.amp];
    const list = amps.reduce((a, nm) => a.concat(byAmp[nm] || []), []);
    list.forEach(t => {
      if (r.only.length) { if (r.only.includes(t.tam)) put(t.amp + "|" + t.tam, z); }
      else if (r.except.length) { if (!r.except.includes(t.tam)) put(t.amp + "|" + t.tam, z); }
      else put(t.amp + "|" + t.tam, z);
    });
    // เตือนถ้าชื่อแขวง/ตำบลในวงเล็บไม่ตรงกับที่มีจริง
    [...r.only, ...r.except].forEach(nm => {
      if (!list.some(t => t.tam === nm)) console.log("  ⚠ เขต " + z + ": ไม่พบ " + r.amp + "/" + nm + " ในไฟล์รูปร่าง");
    });
  });
});

/* ── 6. ตรวจความครบถ้วน ── */
const none = [], dup = [];
base.tambons.forEach(t => {
  const k = t.amp + "|" + t.tam, v = assign.get(k);
  if (!v || !v.length) none.push(k);
  else if (v.length > 1) dup.push(k + " → " + v.join(","));
});
const used = new Set([...assign.values()].flat());
const missZ = need.filter(z => !used.has(z));
const extraZ = [...used].filter(z => !need.includes(z)).sort((a, b) => a - b);

console.log("\n── ผลตรวจ ──");
console.log("ตำบลที่ไม่ได้เขต: " + none.length + (none.length ? " → " + none.slice(0, 8).join(", ") : ""));
console.log("ตำบลที่ได้หลายเขต: " + dup.length + (dup.length ? " → " + dup.slice(0, 8).join(" · ") : ""));
console.log("เขตที่ยังไม่มีตำบล: " + (missZ.length ? missZ.join(",") : "ไม่มี"));
console.log("เขตเกินจากผลเลือกตั้ง: " + (extraZ.length ? extraZ.join(",") : "ไม่มี"));

const ok = !none.length && !dup.length && !missZ.length && !extraZ.length;
console.log(ok ? "✅ ครบถ้วน พร้อมเขียนไฟล์" : "❌ ยังไม่ครบ — ต้องแก้ก่อนเขียนไฟล์");

/* ── 6.5 เรขาคณิต: จุดวางเลขเขต (labels) + เส้นแบ่งเขต (bounds) ──
   ไฟล์รายปีที่มีอยู่เดิมมี 2 ฟิลด์นี้ด้วย ถ้าขาดไป วงหมายเลขเขตจะถูกโปรยมั่ว
   แทนที่จะวางกลางเขต และจะไม่มีเส้นแบ่งเขตทับบนโมเสก                       */
function pts(d) {
  const out = []; const re = /([ML])\s*(-?[\d.]+)[ ,]\s*(-?[\d.]+)/g; let m;
  while ((m = re.exec(d))) out.push([+m[2], +m[3]]);
  return out;
}
function polyArea(p) {
  let a = 0;
  for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; }
  return a / 2;
}
function polyCentroid(p) {
  let a = 0, x = 0, y = 0;
  for (let i = 0; i < p.length; i++) {
    const q = p[(i + 1) % p.length], f = p[i][0] * q[1] - q[0] * p[i][1];
    a += f; x += (p[i][0] + q[0]) * f; y += (p[i][1] + q[1]) * f;
  }
  a /= 2;
  return a ? [x / (6 * a), y / (6 * a)] : [p[0][0], p[0][1]];
}
const r1 = n => Math.round(n * 10) / 10;

function buildLabels(tambons) {
  const byZ = {};
  tambons.forEach(t => { (byZ[t.z] = byZ[t.z] || []).push(t); });
  return Object.keys(byZ).map(Number).sort((a, b) => a - b).map(z => {
    let ax = 0, ay = 0, aa = 0;
    byZ[z].forEach(t => {
      const p = pts(t.d); if (p.length < 3) return;
      const A = Math.abs(polyArea(p)), c = polyCentroid(p);
      ax += c[0] * A; ay += c[1] * A; aa += A;
    });
    return { no: z, x: r1(aa ? ax / aa : 0), y: r1(aa ? ay / aa : 0) };
  });
}
/* เส้นแบ่งเขต = ขอบที่ "ไม่ได้ถูกใช้ร่วมกันโดยตำบลในเขตเดียวกัน"
   (ขอบริมจังหวัด + รอยต่อระหว่างเขต) — ขอบภายในเขตเดียวกันจะหักล้างกันไป */
function buildBounds(tambons) {
  const seen = new Map();
  tambons.forEach(t => {
    const p = pts(t.d);
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      const k = [a, b].map(q => q[0].toFixed(2) + "," + q[1].toFixed(2)).sort().join("|");
      const rec = seen.get(k);
      if (rec) rec.zones.add(t.z);
      else seen.set(k, { a: a, b: b, zones: new Set([t.z]) });
    }
  });
  const segs = [];
  seen.forEach(e => {
    // ขอบที่ตำบลสองฝั่งอยู่คนละเขต หรือเป็นขอบนอกสุด → เป็นเส้นแบ่ง
    if (e.zones.size > 1 || e.count === 1) segs.push(e);
    else if (e.zones.size === 1) { /* ภายในเขตเดียวกัน — ไม่วาด */ }
  });
  // ขอบริมจังหวัด (ปรากฏครั้งเดียว) ต้องนับแยก เพราะ zones.size = 1 เหมือนกัน
  const once = new Map();
  tambons.forEach(t => {
    const p = pts(t.d);
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      const k = [a, b].map(q => q[0].toFixed(2) + "," + q[1].toFixed(2)).sort().join("|");
      once.set(k, (once.get(k) || 0) + 1);
    }
  });
  const out = [];
  seen.forEach((e, k) => {
    if (e.zones.size > 1 || once.get(k) === 1) {
      out.push("M" + r1(e.a[0]) + " " + r1(e.a[1]) + "L" + r1(e.b[0]) + " " + r1(e.b[1]));
    }
  });
  return out.join("");
}

/* ── 7. เขียนไฟล์ ── */
if (WRITE) {
  if (!ok) { console.error("ไม่เขียนไฟล์เพราะข้อมูลยังไม่ครบ"); process.exit(1); }
  const tambons = base.tambons.map(t => ({ z: assign.get(t.amp + "|" + t.tam)[0], amp: t.amp, tam: t.tam, d: t.d }));
  const labels = buildLabels(tambons);
  const bounds = buildBounds(tambons);
  console.log("labels: " + labels.length + " จุด · bounds: " + Math.round(bounds.length / 1024) + " KB");
  const out = { en: base.en, bbox: base.bbox, tambons: tambons, bounds: bounds, labels: labels };
  const name = slug + "-" + YEAR;
  const body = "/* " + name + ".js — รูปร่างเขตเลือกตั้ง " + PROV + " ปี พ.ศ. " + YEAR + "\n" +
    "   รูปร่างตำบล/แขวงใช้ชุดเดียวกับไฟล์ฐาน (" + slug + ".js) เปลี่ยนเฉพาะ z = เลขเขตเลือกตั้ง\n" +
    "   ที่มาการแบ่งเขต: วิกิพีเดียไทย หน้า \"" + title + "\" ตารางประวัติเขตเลือกตั้ง */\n" +
    "window.DISTRICT_SHAPES=window.DISTRICT_SHAPES||{};window.DISTRICT_SHAPES[" +
    JSON.stringify(PROV) + "]=" + JSON.stringify(out) + ";\n";
  fs.writeFileSync(path.join(EL, "district-shapes", name + ".js"), body, "utf8");
  console.log("เขียนแล้ว: district-shapes/" + name + ".js (" + Math.round(body.length / 1024) + " KB)");
}
