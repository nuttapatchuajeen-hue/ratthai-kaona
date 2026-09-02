/* แยกตาราง "ประวัติเขตเลือกตั้ง" ของวิกิพีเดีย → { เลขเขต: [ {amp, only[], except[]} ] } */
const fs = require("fs");

// ตัดมาร์กอัปวิกิให้เหลือข้อความล้วน
function clean(s) {
  return s.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")   // [[ลิงก์|ข้อความ]]
    .replace(/\[\[([^\]]+)\]\]/g, "$1")                    // [[ลิงก์]]
    .replace(/'''/g, "")
    .replace(/<\/?br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/​/g, "")
    .trim();
}

/* แยกรายชื่ออำเภอ/เขต ในบรรทัดเดียว เช่น
   "เขตตลิ่งชันและเขตภาษีเจริญ (เฉพาะแขวงคลองขวาง แขวงบางแวก และแขวงบางด้วน)" */
function parseLine(txt, ampWord, subWord) {
  const out = [];
  // ตัดหัว "· เขตเลือกตั้งที่ N :" ทิ้งไปแล้วก่อนเรียก
  // เดินอ่านทีละ "<อำเภอ> (วงเล็บ)" โดยตัวคั่นคือ และ / , / ·
  const re = new RegExp(ampWord + "([^,()·]+?)(?=\\s*(?:\\(|,|·|และ" + ampWord + "|$))", "g");
  // วิธีข้างบนเปราะ — ใช้การไล่ตำแหน่งแทนเพื่อผูกวงเล็บกับอำเภอที่อยู่ติดกันจริง ๆ
  out.length = 0;
  let i = 0;
  while (i < txt.length) {
    const at = txt.indexOf(ampWord, i);
    if (at < 0) break;
    let j = at + ampWord.length;
    // ชื่ออำเภอ = อักษรจนกว่าจะเจอ ( , · และ หรือจบ
    let name = "";
    const nextItem = new RegExp("^\\s*(?:และ)?\\s*" + ampWord);
    while (j < txt.length) {
      const rest = txt.slice(j);
      if (/^[(,·]/.test(rest)) break;
      if (/^และ/.test(rest)) break;
      if (/^\s*$/.test(rest)) break;
      // บางจังหวัดคั่นชื่ออำเภอด้วยช่องว่างเฉย ๆ เช่น "อำเภอปาย อำเภอขุนยวม"
      // ถ้าเจอช่องว่างแล้วตามด้วยคำว่าอำเภอ/เขต แปลว่าขึ้นรายการใหม่แล้ว
      if (name && nextItem.test(rest)) break;
      name += txt[j]; j++;
    }
    name = name.trim();
    const rec = { amp: name, only: [], except: [] };
    // มีวงเล็บต่อท้ายไหม (ข้ามช่องว่าง)
    let k = j; while (k < txt.length && txt[k] === " ") k++;
    if (txt[k] === "(") {
      const close = txt.indexOf(")", k);
      const inner = txt.slice(k + 1, close);
      // วิกิบางหน้าพิมพ์ "ตาบล" แทน "ตำบล" (สระอำหาย) → ตัดทั้งสองแบบ
      const stripSub = new RegExp("^(?:" + subWord + "|ตาบล)");
      const list = inner.replace(/^(เฉพาะ|ยกเว้น)/, "").split(new RegExp("\\s*(?:และ|,)\\s*|\\s+"))
        .map(s => s.replace(stripSub, "").trim()).filter(Boolean);
      if (/^เฉพาะ/.test(inner)) rec.only = list;
      else if (/^ยกเว้น/.test(inner)) rec.except = list;
      j = close + 1;
    }
    if (rec.amp) out.push(rec);
    i = j > at ? j : at + 1;
  }
  return out;
}

function parseYearCell(cellText, ampWord, subWord) {
  const zones = {};
  clean(cellText).split("\n").forEach(line => {
    const m = line.match(/เขตเลือกตั้งที่\s*(\d+)\s*[:：]\s*(.+)$/);
    if (!m) return;
    zones[+m[1]] = parseLine(m[2].trim(), ampWord, subWord);
  });
  return zones;
}

module.exports = { clean, parseLine, parseYearCell };

if (require.main === module) {
  const j = JSON.parse(fs.readFileSync(process.argv[2] || "bkkmp.json", "utf8"));
  const t = j.parse.wikitext["*"];
  const year = process.argv[3] || "2544";
  const key = "พ.ศ. " + year + "|พ.ศ. " + year;
  const at = t.indexOf(key);
  if (at < 0) { console.log("ไม่พบปี " + year); process.exit(1); }
  // เซลล์ของปีนั้นจบที่ "||" ท้ายแถว หรือ "\n|-"
  const from = t.indexOf("||", at) + 2;
  let end = t.indexOf("\n|-", from); if (end < 0) end = t.length;
  const cell = t.slice(from, end);
  const zones = parseYearCell(cell, "เขต", "แขวง");
  const nums = Object.keys(zones).map(Number).sort((a, b) => a - b);
  console.log("ปี " + year + " — เขตที่แยกได้: " + nums.length + " (" + nums[0] + "-" + nums[nums.length - 1] + ")");
  nums.forEach(n => {
    console.log("  " + String(n).padStart(2) + ": " + zones[n].map(r =>
      r.amp + (r.only.length ? " [เฉพาะ " + r.only.join("/") + "]" : "") +
      (r.except.length ? " [ยกเว้น " + r.except.join("/") + "]" : "")).join("  +  "));
  });
}
