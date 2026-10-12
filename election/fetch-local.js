/* fetch-local.js — สร้างข้อมูล "ท้องถิ่น" รายจังหวัด (นายก อบจ. / นายกเทศมนตรี / นายก อบต. + สภา)
   เขียนเป็น local/<Slug>.js สำหรับแท็บ "ท้องถิ่น" ในหน้ารายเขต (index.html + local.js)

   ใช้:  node fetch-local.js <จังหวัด>            ดึง + สร้าง local/<Slug>.js (เทศบาล/อบต. ทุกแห่ง — ใช้แคชที่มีอยู่)
         node fetch-local.js <จังหวัด> --refresh  ดึงรายชื่อจาก NLC ใหม่ทั้งหมด
         node fetch-local.js --all                ทุกจังหวัด (~7,800 อปท. · ราว 2 ชม. · หยุดกลางทางแล้วสั่งใหม่ได้ ใช้แคชต่อ)
         node fetch-local.js --pao [--refresh]    นายก อบจ. ครบ 76 จังหวัด → local/pao.js + local/pao-team.js

   แหล่งข้อมูล
   1. NLC ศูนย์ข้อมูลการเลือกตั้งท้องถิ่นแห่งชาติ (กรมส่งเสริมการปกครองท้องถิ่น) nlc.dla.go.th
      หน้า /public/appointment.do = ผู้ดำรงตำแหน่งปัจจุบันของ อปท. ทีละแห่ง (นายก รองนายก ประธานสภา สมาชิกสภา + วันดำรงตำแหน่ง)
      ⚠ มีแต่ "ผู้ชนะ" ไม่มีคะแนน · ต้องส่งฟอร์มทีละแห่งพร้อม session (JSESSIONID) · หน้าเป็น TIS-620
      ⚠ ดึงช้า ๆ ทีละคำขอ (DELAY) — เป็นเซิร์ฟเวอร์ราชการ อย่ายิงรัว
   2. รายการ อปท. + ตำบลที่ตั้ง: .local-cache/nlc-meta-<รหัสจังหวัด>.txt (จาก DlaService.listDlaOrgByAmphur ของหน้าเดียวกัน)
      ถ้าไม่มีไฟล์นี้ จะไล่เอาชื่อ อปท. จากตัวเลือกในฟอร์มแทน แล้วเดาตำบลจากชื่อ (อบต.X / เทศบาลตำบลX → ต.X)
   3. ผลนายก อบจ. (ผู้สมัครทุกคน + คะแนน) ครบ 76 จังหวัด จาก JSON ของไทยพีบีเอส election68-data.thaipbs.or.th
      47 จังหวัดเลือก 1 ก.พ. 2568 · อีก 29 จังหวัดเลือกไปก่อนแล้ว (ปี 2565–2567 หลังนายกคนเดิมลาออก)
      ⚠ ไทยพีบีเอสติดป้าย "ไม่เป็นทางการ" ไว้ — แสดงบนหน้าเว็บพร้อมป้ายนี้เสมอ
      ⚠ ช่อง partyRefCode ของไทยพีบีเอสเชื่อไม่ได้ (เช่น ผู้สมัครในนาม "พรรคเพื่อไทย" ถูกใส่ partyRef เป็นภูมิใจไทย)
        → ใช้ factionRefCode (กลุ่ม/พรรคที่ส่งลงสมัคร) อย่างเดียว
   ประกาศผลของ กกต. (PDF) เป็นภาพสแกนและมีแต่รายชื่อผู้ชนะ ไม่มีคะแนน จึงไม่ได้ใช้ */
const fs = require("fs"), vm = require("vm"), path = require("path");

const EL = __dirname;
const CACHE = path.join(EL, ".local-cache");
const OUT = path.join(EL, "local");
const ARGS = process.argv.slice(2);
const PAO = ARGS.includes("--pao");
const ALL = ARGS.includes("--all");
const PROV = ARGS.find(a => !a.startsWith("--"));
const REFRESH = ARGS.includes("--refresh");
const DELAY = 600;                         // ms ระหว่างคำขอ NLC
const NLC = "https://nlc.dla.go.th/public/appointment.do";
const TPBS = "https://election68-data.thaipbs.or.th/";
if (!PROV && !PAO && !ALL) { console.error("ใช้: node fetch-local.js <จังหวัด> | --all | --pao  [--refresh]"); process.exit(1); }

/* ตำบลที่ อปท. ครอบคลุมแต่ชื่อไม่ตรง/ไม่มี อปท. ที่ตั้งอยู่ในตำบลนั้น → กำหนดเอง ("อำเภอ|ตำบล": [ชื่อเต็ม อปท.])
   ใส่เฉพาะที่ตรวจแล้ว — สคริปต์จะพิมพ์รายการตำบลที่ยังไม่มีเจ้าของออกมาให้ดู */
const TAMBON_OVERRIDE = {
  "กระบี่": {
    "เมืองกระบี่|กระบี่ใหญ่": ["เทศบาลเมืองกระบี่"],   // ไม่มี อปท. อื่นตั้งอยู่ใน ต.กระบี่ใหญ่ — อยู่ในเขต ทม.กระบี่
  },
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
const ensureDir = d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); };
function loadJs(f) { const c = vm.createContext({ console }); c.window = c; vm.runInContext(fs.readFileSync(f, "utf8"), c); return c; }
const decodeTis = buf => new TextDecoder("windows-874").decode(buf);
const strip = s => s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
/* คำพิมพ์ผิดที่เจอบ่อยในระบบ NLC: สระเอ 2 ตัว (เเ) แทนสระแอ (แ) — เช่น "นางเเว่นฟ้า" */
const fixThai = s => s.replace(/เเ/g, "แ");
/* "11/01/2569" → "2569-01-11" (เก็บเป็น พ.ศ. ตามต้นทาง) */
const thDate = s => { const m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s || ""); return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : null; };

/* ── NLC session + ฟอร์มค้นหา ── */
let cookie = "";
const NLC_BASE = "https://nlc.dla.go.th";
/* fetch ที่ลองใหม่เองเมื่อเน็ตสะดุด/เซิร์ฟเวอร์ตอบ 5xx (รอนานขึ้นทุกครั้ง) — งานดึงทั้งประเทศยาวหลายชั่วโมง */
async function fetchRetry(url, opt, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { ...opt, signal: AbortSignal.timeout(45000) });
      if (r.status >= 500 && i < tries) throw new Error("HTTP " + r.status);
      return r;
    } catch (e) {
      if (i >= tries) throw e;
      console.warn(`\n  ⟳ ${e.message} — ลองใหม่ใน ${i * 15} วินาที`);
      await sleep(i * 15000);
    }
  }
}
function keepCookie(r) { const sc = r.headers.get("set-cookie"); if (sc) { const m = /JSESSIONID=[^;]+/.exec(sc); if (m) cookie = m[0]; } }
async function nlc(params) {
  const opt = params
    ? { method: "POST", body: new URLSearchParams({ cmd: "list", ...params }), headers: { Cookie: cookie, "Content-Type": "application/x-www-form-urlencoded" } }
    : { headers: cookie ? { Cookie: cookie } : {} };
  const r = await fetchRetry(NLC, opt);
  keepCookie(r);
  if (!r.ok) throw new Error("NLC HTTP " + r.status);
  return decodeTis(await r.arrayBuffer());
}
async function newSession() { cookie = ""; dwrSid = null; return nlc(null); }

/* ── DWR (DlaService.* ที่หน้าเว็บใช้เติมรายการอำเภอ/อปท.) ──
   ต้องส่ง httpSessionId ให้ตรงกับคุกกี้ JSESSIONID และ scriptSessionId = _origScriptSessionId (จาก engine.js) + เลขสุ่ม 3 หลัก
   ไม่งั้นได้ "Session Error" · คำตอบเป็นโค้ด JS ล้วนคำสั่งกำหนดค่า (var s0={}; s0.key=…;) → แยกเองด้วย parseDwr ไม่ eval */
let dwrSid = null;
async function dwr(method, arg) {
  if (!cookie) await newSession();
  if (!dwrSid) {
    const r = await fetchRetry(NLC_BASE + "/dwr/engine.js", { headers: { Cookie: cookie } });
    const m = /_origScriptSessionId\s*=\s*"([0-9A-F]+)"/.exec(await r.text());
    if (!m) throw new Error("DWR: หา _origScriptSessionId ไม่เจอ");
    dwrSid = m[1] + Math.floor(Math.random() * 1000);
  }
  const body = ["callCount=1", "page=/public/appointment.do", "httpSessionId=" + cookie.replace("JSESSIONID=", ""),
    "scriptSessionId=" + dwrSid, "c0-scriptName=DlaService", "c0-methodName=" + method, "c0-id=0", "c0-param0=string:" + arg, "batchId=0", ""].join("\n");
  const r = await fetchRetry(`${NLC_BASE}/dwr/call/plaincall/DlaService.${method}.dwr`, { method: "POST", body, headers: { Cookie: cookie, "Content-Type": "text/plain" } });
  return parseDwr(await r.text());
}
function parseDwr(txt) {
  const i = txt.indexOf("//#DWR-REPLY"); const s = i >= 0 ? txt.slice(i + 12) : txt;
  if (/_remoteHandle(Batch)?Exception/.test(s)) throw new Error("DWR: " + (/message:'([^']*)'/.exec(s) || [, "exception"])[1]);
  /* แบ่งเป็นคำสั่งด้วย ; ที่อยู่นอกสตริง */
  const st = []; let cur = "", q = false;
  for (let k = 0; k < s.length; k++) {
    const c = s[k];
    if (q) { cur += c; if (c === "\\") { cur += s[++k]; } else if (c === '"') q = false; continue; }
    if (c === '"') { q = true; cur += c; continue; }
    if (c === ";") { st.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  const V = {}; let result;
  const val = x => {
    x = x.trim();
    if (x === "null") return null; if (x === "true") return true; if (x === "false") return false;
    if (/^s\d+$/.test(x)) return V[x];
    if (/^-?\d/.test(x)) return +x;
    let m;
    if ((m = /^new Date\((-?\d+)\)$/.exec(x))) return +m[1];
    if (x[0] === '"') return JSON.parse(x.replace(/\\'/g, "'"));
    if ((m = /^\[(.*)\]$/s.exec(x))) return m[1].trim() ? m[1].split(",").map(val) : [];
    throw new Error("DWR: ค่าที่ไม่รู้จัก " + x.slice(0, 40));
  };
  for (const t of st) {
    let m;
    if (!t) continue;
    if ((m = /^var (s\d+)=(\{\}|\[\])$/.exec(t))) { V[m[1]] = m[2] === "{}" ? {} : []; continue; }
    if ((m = /^(s\d+)(?:\.([A-Za-z_$][\w$]*)|\['([^']+)'\]|\[(\d+)\])=([\s\S]*)$/.exec(t))) { V[m[1]][m[2] || m[3] || +m[4]] = val(m[5]); continue; }
    if ((m = /^dwr\.engine\._remoteHandleCallback\('[^']*','[^']*',([\s\S]*)\)$/.exec(t))) { result = val(m[1]); continue; }
  }
  if (result === undefined) throw new Error("DWR: ไม่มีผลลัพธ์ (session หมดอายุ?)");
  return result;
}
function options(html, name) {
  const m = new RegExp(`name="${name.replace(/\./g, "\\.")}"[\\s\\S]*?</select>`).exec(html); if (!m) return [];
  return [...m[0].matchAll(/<option[^>]*value="([^"]+)"[^>]*>([^<]*)</g)].map(o => ({ id: o[1], name: strip(o[2]) }));
}
/* ผู้ดำรงตำแหน่ง: แต่ละคน = <h5>ชื่อ</h5> … ตำแหน่ง <span>…</span> … วันที่ดำรงตำแหน่ง <span>ก - ข</span> */
function holders(html) {
  const out = { exec: [], council: [] };
  const iE = html.indexOf("ผู้ดำรงตำแหน่งฝ่ายบริหาร"), iC = html.indexOf("ผู้ดำรงตำแหน่งฝ่ายสภา");
  if (iE < 0 && iC < 0) return null;
  const part = (a, b) => html.slice(a, b < 0 ? undefined : b);
  const people = s => [...s.matchAll(/<h5[^>]*>([\s\S]*?)<\/h5>[\s\S]*?ตำแหน่ง\s*<span[^>]*>([\s\S]*?)<\/span>[\s\S]*?วันที่ดำรงตำแหน่ง\s*<span[^>]*>([\s\S]*?)<\/span>/g)]
    .map(m => { const d = strip(m[3]).split(/\s+-\s+/); return { n: fixThai(strip(m[1])), p: strip(m[2]), s: thDate(d[0]), e: thDate(d[1]) }; });
  if (iE >= 0) out.exec = people(part(iE, iC > iE ? iC : -1));
  if (iC >= 0) out.council = people(part(iC, iE > iC ? iE : -1));
  return out;
}

/* ── รายการ อปท. ของจังหวัด ── */
const TYPE_SHORT = { "อบจ.": "อบจ", "เทศบาลนคร": "ทน", "เทศบาลเมือง": "ทม", "เทศบาลตำบล": "ทต", "อบต.": "อบต" };
const bareOrg = full => full.replace(/^(อบจ\.|อบต\.|องค์การบริหารส่วนตำบล|องค์การบริหารส่วนจังหวัด|เทศบาลนคร|เทศบาลเมือง|เทศบาลตำบล)\s*/, "");
function typeOf(full) { for (const k of ["เทศบาลนคร", "เทศบาลเมือง", "เทศบาลตำบล"]) if (full.startsWith(k)) return k; return full.startsWith("อบจ") ? "อบจ." : "อบต."; }

async function orgList(provId, firstHtml) {
  const mf = path.join(CACHE, `nlc-meta-${provId}.txt`);
  if (fs.existsSync(mf)) {
    return fs.readFileSync(mf, "utf8").split(/\r?\n/).filter(l => l && !l.startsWith("#")).map(l => {
      const [id, type, full, amp, tam, , code, area, vil, year] = l.split("|");
      return { id, type, full, amp, tam, code, area: +area || null, vil: vil === "" ? null : +vil || 0, year: /^\d{4}$/.test(year) ? +year : null };
    });
  }
  /* ยังไม่มีไฟล์ → ถาม DWR ทีละอำเภอ (ได้ตำบลที่ตั้ง/รหัส/พื้นที่ของทุก อปท.) แล้วเขียนแคชเป็นรูปแบบเดียวกับไฟล์ที่ทำมือ */
  await sleep(DELAY);
  const amps = await dwr("listAmphurByProvince", provId);
  const rows = [];
  for (const a of amps) {
    await sleep(DELAY);
    const orgs = await dwr("listDlaOrgByAmphur", String(a.id));
    orgs.forEach(o => rows.push([o.id, o.typeLabel, o.label, a.name, o.district && o.district.name, o.district && o.district.id,
      o.code, o.area, o.amountAll, o.createYear, o.sizeLabel].map(v => v == null ? "" : String(v).replace(/[|\r\n]/g, " ")).join("|")));
  }
  if (!rows.length) throw new Error("DWR ไม่คืนรายการ อปท. ของจังหวัด " + provId);
  fs.writeFileSync(mf, `# NLC DlaService.listDlaOrgByAmphur — provinceId ${provId} ดึง ${new Date().toISOString().slice(0, 10)}\n` +
    "# id|ประเภท|ชื่อ|อำเภอ|ตำบลที่ตั้ง|รหัสตำบล|รหัส อปท.|พื้นที่ ตร.กม.|หมู่บ้าน|ปีที่ตั้ง|ขนาด\n" + rows.map(r => fixThai(r)).join("\n") + "\n");
  return orgList(provId, firstHtml);
}

/* ── ไทยพีบีเอส: ผลนายก อบจ. 2568 ── */
async function tpbs(code) {
  const cf = path.join(CACHE, "tpbs-" + code + ".json");
  if (fs.existsSync(cf) && !REFRESH) return JSON.parse(fs.readFileSync(cf, "utf8"));
  const idx = await (await fetch(TPBS + "election68/index.json")).json();
  const rev = idx.datasetRevisions.find(d => d.dataSetRefCode === code);
  if (!rev || !rev.revisionPathPrefix) return null;
  const j = await (await fetch(TPBS + rev.revisionPathPrefix)).json();
  fs.writeFileSync(cf, JSON.stringify(j));
  return j;
}
/* กลุ่ม/พรรคที่ส่งลงสมัคร (factionRefCode) — ถ้าเป็น "พรรค…" ใช้สีพรรคจาก partyMeta ปี 2569
   (พรรคที่ไม่มีในปี 2569 เช่น ชาติไทยพัฒนา ใช้สีที่ไทยพีบีเอสกำหนด) · กลุ่มท้องถิ่น/อิสระ = null */
function affOf(name, PM, tpColor) {
  if (!name || !/^พรรค/.test(name)) return null;
  const pm = Object.values(PM).find(m => m.th === name);
  return { n: name, s: pm ? pm.short : name.replace(/^พรรค/, ""), c: pm ? pm.color : tpColor || "#8A99A6" };
}
const ceToBe = s => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ""); return m ? `${+m[1] + 543}-${m[2]}-${m[3]}` : null; };
async function paoAll(PM) {
  const [com, mm, res] = await Promise.all(["DATASET-MASTER-COMMON", "DATASET-MASTER-MAYOR", "DATASET-RESULT-MAYOR"].map(tpbs));
  const T = o => (o && o.translations && o.translations.th) || {};
  const facObj = ref => com.factions.find(x => x.refCode === ref);
  const faction = ref => { const f = facObj(ref); return f ? T(f).name : null; };
  const facColor = ref => { const f = facObj(ref); return (f && f.colors && f.colors.color) || null; };
  const badge = ref => { const b = (com.mayorCandidateBadges || []).find(x => x.refCode === ref); return b ? T(b).name : null; };
  const out = {};
  for (const area of mm.mayorElectionAreas) {
    const sum = res.mayorResultSummaries.find(s => s.electionAreaRefCode === area.refCode) || {};
    const rs = res.mayorResults.filter(r => r.electionAreaRefCode === area.refCode);
    const cands = mm.mayorCandidates.filter(c => c.electionAreaRefCode === area.refCode).map(c => {
      const r = rs.find(x => x.candidateRefCode === c.refCode) || {}, g = faction(c.factionRefCode);
      return { b: c.number, n: fixThai(T(c).name || ""), v: r.voteTotal == null ? null : r.voteTotal, pct: r.votePercent == null ? null : r.votePercent,
        win: !!r.isWinner, g: g === "อิสระ/กลุ่มการเมือง" ? "อิสระ" : g, aff: affOf(g, PM, facColor(c.factionRefCode)), badge: badge(c.mayorCandidateBadgeRefCode) };
    }).sort((a, b) => (b.v || 0) - (a.v || 0) || a.b - b.b);
    const src = [...new Set(rs.map(r => r.dataSource))];
    out[area.provinceRefCode.replace("PROVINCE-", "")] = {
      date: ceToBe(area.dateElection),                        // พ.ศ.
      held: area.electionPhase === "active",                  // false = เลือกไปก่อนแล้ว (ก่อน 1 ก.พ. 2568)
      src: src.includes("counting") ? "counting" : src.includes("official") && src.length === 1 ? "official" : "unofficial",
      stats: { turnout: sum.allVotes && sum.allVotes.total, valid: sum.goodVotes && sum.goodVotes.total,
        invalid: sum.badVotes && sum.badVotes.total, blank: sum.noVotes && sum.noVotes.total },
      /* แชมป์เก่า: win = นายกคนเดิมชนะ · conn = เครือข่าย/เครือญาติแชมป์เก่าชนะ · out = คนนอกเครือข่ายเดิมชนะ */
      inc: sum.isPreviousMayorWin ? "win" : sum.isPreviousConnectionWin ? "conn" : "out",
      cands,
    };
  }
  return out;
}
/* ชื่อตรงกันไหม (NLC มีคำนำหน้า/ยศติดชื่อ "นายสมศักดิ์ …" · ไทยพีบีเอสมีบ้างไม่มีบ้าง "พล.ต.อ.สมศักดิ์ …") */
function samePerson(nlcName, tpName) {
  if (!nlcName || !tpName) return false;
  nlcName = fixThai(nlcName); tpName = fixThai(tpName);
  const sur = s => s.trim().split(/\s+/).pop();
  const first = tpName.trim().split(/\s+/)[0].replace(/^(?:[ก-๙]{1,4}\.)+/, "");
  return sur(nlcName) === sur(tpName) && nlcName.includes(first);
}
const todayBE = () => { const d = new Date(); return `${d.getFullYear() + 543}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
function writeIndex(DIDX) {
  /* ดัชนีจังหวัดที่มีข้อมูลเทศบาล/อบต. ครบแล้ว (local.js โหลดไฟล์ทีละจังหวัดตอนกดเข้าไป) */
  /* + ดัชนีค้นหา local/search.js: อปท. ทุกแห่งทุกจังหวัด แถวละ [จังหวัด, id, ประเภท, ชื่อ, อำเภอ, ตำบล, นายก, วันเริ่มวาระ]
       (โหลดตอนพิมพ์ค้นหาครั้งแรก — ไม่ต้องโหลดไฟล์ทุกจังหวัด) */
  const idx = {}, sp = [], rows = [];
  fs.readdirSync(OUT).filter(f => /^[A-Z][A-Za-z]*\.js$/.test(f)).forEach(f => {     // ไม่รวม <Slug>-team.js
    const s = f.replace(/\.js$/, ""), th = Object.keys(DIDX).find(k => DIDX[k] === s); if (!th) return;
    const d = loadJs(path.join(OUT, f)).LOCAL_DATA[th];
    idx[th] = { s, n: d.orgs.length, upd: d.updated };
    const pi = sp.push(th) - 1;
    d.orgs.forEach(o => { if (o.t !== "อบจ") rows.push([pi, o.id, o.t, o.n, o.amp, o.tam, o.m ? o.m.n : "", o.m ? o.m.s : ""]); });
  });
  fs.writeFileSync(path.join(OUT, "index.js"), "/* จังหวัดที่มีข้อมูลเทศบาล/อบต. ครบแล้ว — fetch-local.js สร้างให้ */\nwindow.LOCAL_INDEX=" + JSON.stringify(idx) + ";\n");
  fs.writeFileSync(path.join(OUT, "search.js"), "/* ดัชนีค้นหา อปท. ทุกจังหวัดที่มีข้อมูลแล้ว — fetch-local.js สร้างให้ */\nwindow.LOCAL_SEARCH=" + JSON.stringify({ p: sp, r: rows }) + ";\n");
  console.log(`ดัชนี local/index.js: ${Object.keys(idx).length} จังหวัด · search.js ${rows.length} แห่ง`);
}
/* ผู้ดำรงตำแหน่งของ อปท. 1 แห่ง (แคช HTML)
   ⚠ แคชเฉพาะหน้าที่มีส่วน "ผู้ดำรงตำแหน่ง" จริง — ถ้า session หลุดเซิร์ฟเวอร์ตอบหน้าเปล่า → เปิด session ใหม่แล้วลองอีกครั้ง */
async function holdersOf(provId, ampId, orgId) {
  const cf = path.join(CACHE, "nlc", orgId + ".html");
  if (!REFRESH && fs.existsSync(cf)) return { h: holders(fs.readFileSync(cf, "utf8")), fresh: false };
  const ask = () => nlc({ "searchCondition.provinceId": provId, "searchCondition.amphurId": ampId, "searchCondition.orgId": orgId });
  await sleep(DELAY);
  let html = await ask(), h = holders(html);
  if (!h) { await sleep(DELAY); await newSession(); await sleep(DELAY); html = await ask(); h = holders(html); }
  if (h) fs.writeFileSync(cf, html);
  return { h, fresh: true };
}

/* ── --pao : นายก อบจ. ครบ 76 จังหวัด ── */
async function buildPao(DIDX, PM) {
  console.log("ไทยพีบีเอส: ผลนายก อบจ. ทุกจังหวัด…");
  const tp = await paoAll(PM);
  console.log(`  ${Object.keys(tp).length} จังหวัด`);

  console.log("NLC: เปิด session…");
  const provs = options(await nlc(null), "searchCondition.provinceId");
  const mf = path.join(CACHE, "nlc-pao-orgs.json");
  const orgMap = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, "utf8")) : {};
  const pao = {}, team = {}, warn = [];
  let n = 0;
  for (const p of provs) {
    if (!DIDX[p.name]) { warn.push("ไม่รู้จักชื่อจังหวัดของ NLC: " + p.name); continue; }
    /* หา อบจ. ของจังหวัด: ส่วนใหญ่อยู่ในอำเภอเมือง (รหัส <จังหวัด>01) ถ้าไม่เจอค่อยไล่ทุกอำเภอ */
    if (!orgMap[p.id]) {
      const find = async amp => { await sleep(DELAY); const h = await nlc({ "searchCondition.provinceId": p.id, "searchCondition.amphurId": amp, "searchCondition.orgId": "" });
        const o = options(h, "searchCondition.orgId").find(x => /^อบจ/.test(x.name)); return { o, h }; };
      let amp = p.id + "01", { o, h } = await find(amp);
      if (!o) for (const a of options(h, "searchCondition.amphurId")) { if (a.id === amp) continue; ({ o } = await find(a.id)); if (o) { amp = a.id; break; } }
      if (!o) { warn.push("NLC ไม่มี อบจ. ของ " + p.name); continue; }
      orgMap[p.id] = { org: o.id, amp };
      fs.writeFileSync(mf, JSON.stringify(orgMap));
    }
    const { org, amp } = orgMap[p.id];
    const { h, fresh } = await holdersOf(p.id, amp, org);
    if (fresh) process.stdout.write(`\r  NLC ${++n} จังหวัด`);
    const ex = h ? h.exec : [], mayor = ex.find(x => /^นายก/.test(x.p)) || null;
    const r = tp[p.id];
    if (!r) { warn.push("ไทยพีบีเอสไม่มีผลของ " + p.name); continue; }
    const win = r.cands.find(c => c.win);
    r.nlc = mayor ? { id: +org, n: mayor.n, s: mayor.s, e: mayor.e, same: samePerson(mayor.n, win && win.n) } : { id: +org, n: null };
    if (!mayor) warn.push(`${p.name}: NLC ไม่มีชื่อนายก อบจ. (ว่าง/รอเลือกตั้งใหม่?)`);
    else if (!r.nlc.same) warn.push(`${p.name}: นายกปัจจุบัน (NLC) "${mayor.n}" ตั้งแต่ ${mayor.s} ≠ ผู้ชนะ ${r.date} "${win && win.n}"`);
    pao[p.name] = r;
    team[p.name] = { x: ex.filter(x => x !== mayor), c: h ? h.council : [] };
  }
  if (n) console.log();
  const head = "/* สร้างโดย fetch-local.js --pao — อย่าแก้มือ · ผลนายก อบจ.: ไทยพีบีเอส (ไม่เป็นทางการ) · ผู้ดำรงตำแหน่งปัจจุบัน: NLC กรมส่งเสริมการปกครองท้องถิ่น */\n";
  fs.writeFileSync(path.join(OUT, "pao.js"), head + "window.LOCAL_PAO_META=" + JSON.stringify({ updated: todayBE() }) + ";\nwindow.LOCAL_PAO=" + JSON.stringify(pao) + ";\n");
  fs.writeFileSync(path.join(OUT, "pao-team.js"), head + "window.LOCAL_PAO_TEAM=" + JSON.stringify(team) + ";\n");
  ["pao.js", "pao-team.js"].forEach(f => console.log(`เขียน local/${f} (${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1)} KB)`));
  console.log(`  ${Object.keys(pao).length} จังหวัด`);
  warn.forEach(w => console.warn("  ⚠ " + w));
}

/* ── <จังหวัด> : เทศบาล/อบต. ทุกแห่งในจังหวัด ── */
const norm = s => fixThai(String(s || "")).replace(/\s+/g, "");
function lev(a, b) {                                   // ระยะแก้ไข (Levenshtein) ใช้เทียบชื่อตำบลที่สะกดต่างกัน
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
async function buildProvince(DIDX, P, provId) {
  const slug = DIDX[P]; if (!slug) throw new Error("ไม่รู้จักจังหวัด: " + P);
  const shapes = loadJs(path.join(EL, "district-shapes", slug + ".js")).DISTRICT_SHAPES[P];
  if (!provId) {
    console.log("NLC: เปิด session…");
    const prov = options(await newSession(), "searchCondition.provinceId").find(o => o.name === P);
    if (!prov) throw new Error("NLC ไม่มีจังหวัด " + P);
    provId = prov.id;
  }
  const orgs = await orgList(provId);
  console.log(`  ${orgs.length} อปท.`);

  /* ผู้ดำรงตำแหน่ง — แคชเป็น HTML (แปลง TIS-620 → UTF-8 แล้ว) ทีละแห่ง */
  let fetched = 0; const failed = [];
  for (const o of orgs) {
    const ampId = String(o.code || "").slice(2, 6) || "";      // รหัส อปท. 8 หลัก = ประเภท 2 + จังหวัด 2 + อำเภอ 2 + ลำดับ 2
    const { h, fresh } = await holdersOf(provId, ampId, o.id);
    if (fresh) process.stdout.write(`\r  ดึงแล้ว ${++fetched} แห่ง`);
    if (!h) { failed.push(`${o.full} (${o.id})`); o.h = { exec: [], council: [] }; }
    else o.h = h;
  }
  if (fetched) console.log();
  if (failed.length) console.warn("  ⚠ ไม่พบข้อมูลผู้ดำรงตำแหน่ง:", failed.join(", "));

  /* ตำบล ↔ อปท. : อปท. ที่ "ตั้งอยู่" ในตำบลไหน = เจ้าของตำบลนั้น (อบต. มาก่อน เพราะคลุมทั้งตำบล · เทศบาลตามมา)
     ตำบลที่ไม่มี อปท. ตั้งอยู่เลย = อยู่ในเขตเทศบาลที่ตั้งสำนักงานในตำบลข้างเคียง
       → TAMBON_OVERRIDE (ตรวจแล้ว) ก่อน ถ้าไม่มี: ทน./ทม. แห่งเดียวในอำเภอ หรือเทศบาลแห่งเดียวในอำเภอ (บันทึกเป็น "ประมาณ")
     ชื่อเทียบแบบตัดช่องว่าง + แก้ "เเ" (ชื่อในไฟล์รูปตำบลกับ NLC สะกดต่างกันได้) */
  const ov = TAMBON_OVERRIDE[P] || {};
  const RANK = { "อบต.": 0, "เทศบาลตำบล": 1, "เทศบาลเมือง": 2, "เทศบาลนคร": 3 };
  const byRank = (a, b) => RANK[a.type] - RANK[b.type];
  const local = orgs.filter(o => o.type !== "อบจ.");
  const sameAmp = amp => local.filter(o => norm(o.amp) === norm(amp));
  const tam = {}, approx = [];
  const placedIds = () => new Set(Object.values(tam).flat().map(String));
  const keyOf = t => t.amp + "|" + t.tam;
  // 1) ตรงตัว: ตำบลที่ตั้งของ อปท. = ชื่อตำบลในรูป (หรือ TAMBON_OVERRIDE ที่ตรวจแล้ว)
  shapes.tambons.forEach(t => {
    const key = keyOf(t);
    const ids = ov[key]
      ? ov[key].map(f => (orgs.find(o => o.full === f) || {}).id).filter(Boolean)
      : sameAmp(t.amp).filter(o => norm(o.tam) === norm(t.tam)).sort(byRank).map(o => o.id);
    if (ids.length) tam[key] = ids.map(Number);
  });
  // 2) สะกดต่างกันเล็กน้อย (โพรงจรเข้/โพรงจระเข้): ตำบลที่ยังว่าง × อปท. ที่ยังไม่ได้วาง ในอำเภอเดียวกัน ต่างกันไม่เกิน 2 ตัวอักษร
  shapes.tambons.filter(t => !tam[keyOf(t)]).forEach(t => {
    const placed = placedIds(), nt = norm(t.tam);
    const c = sameAmp(t.amp).filter(o => !placed.has(String(o.id)))
      .map(o => ({ o, d: Math.min(lev(norm(o.tam), nt), lev(norm(bareOrg(o.full)), nt)) })).filter(x => x.d <= 2 && nt.length >= 4);
    if (!c.length) return;
    const best = Math.min(...c.map(x => x.d));
    tam[keyOf(t)] = c.filter(x => x.d === best).map(x => x.o).sort(byRank).map(o => +o.id);
  });
  // 3) ไม่มี อปท. ตั้งสำนักงานในตำบล = อยู่ในเขตเทศบาลข้างเคียง (บันทึกเป็น "ประมาณ")
  //    ทน./ทม. แห่งเดียวในอำเภอ → เทศบาลแห่งเดียวในอำเภอ → เทศบาลในอำเภอที่ตำบลที่ตั้งอยู่ใกล้ที่สุด (วัดจากกึ่งกลางรูปตำบล)
  const cen = {};
  shapes.tambons.forEach(t => { const n = (t.d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number); let x = 0, y = 0, k = 0;
    for (let i = 0; i + 1 < n.length; i += 2) { x += n[i]; y += n[i + 1]; k++; } if (k) cen[keyOf(t)] = [x / k, y / k]; });
  const cenOf = o => { const t = shapes.tambons.find(t => norm(t.amp) === norm(o.amp) && norm(t.tam) === norm(o.tam)); return t && cen[keyOf(t)]; };
  shapes.tambons.filter(t => !tam[keyOf(t)]).forEach(t => {
    const s = sameAmp(t.amp), big = s.filter(o => o.type === "เทศบาลนคร" || o.type === "เทศบาลเมือง"), muni = s.filter(o => /^เทศบาล/.test(o.type));
    let pick = big.length === 1 ? big[0] : muni.length === 1 ? muni[0] : null;
    if (!pick && muni.length && cen[keyOf(t)]) {
      const [cx, cy] = cen[keyOf(t)];
      pick = muni.map(o => { const c = cenOf(o); return { o, d: c ? Math.hypot(c[0] - cx, c[1] - cy) : Infinity }; }).sort((a, b) => a.d - b.d)[0];
      pick = pick && pick.d < Infinity ? pick.o : null;
    }
    if (pick) { tam[keyOf(t)] = [+pick.id]; approx.push(keyOf(t)); }
  });
  // 4) อปท. ที่ยังไม่ได้วาง → ลองชื่อ อปท. เอง (อบต.X → ต.X)
  local.filter(o => !placedIds().has(String(o.id))).forEach(o => {
    const t = shapes.tambons.find(t => norm(t.amp) === norm(o.amp) && norm(t.tam) === norm(bareOrg(o.full)));
    if (t) (tam[keyOf(t)] = tam[keyOf(t)] || []).push(+o.id);
  });
  const missing = shapes.tambons.filter(t => !tam[keyOf(t)]).map(keyOf);
  const unplaced = local.filter(o => !placedIds().has(String(o.id))).map(o => o.full + " (ต." + o.tam + ")");
  if (approx.length) console.log(`  ~ ตำบลที่ใช้เทศบาลในอำเภอเดียวกันแทน (ประมาณ): ${approx.length} ตำบล`);
  if (missing.length) console.warn("  ⚠ ตำบลที่ยังไม่มีเจ้าของ (เติม TAMBON_OVERRIDE):", missing.join(", "));
  if (unplaced.length) console.warn("  ⚠ อปท. ที่ไม่ได้วางบนแผนที่:", unplaced.join(", "));

  /* ไฟล์หลัก <Slug>.js = รายชื่อ อปท. + นายก + จำนวนทีม (ใช้วาดแผนที่/รายการ — เล็ก)
     ไฟล์ <Slug>-team.js = ทีมบริหาร + สภาทุกคน (โหลดตอนกดกางครั้งแรก — จังหวัดใหญ่หลายร้อย KB) */
  const counts = {}; orgs.forEach(o => { const k = TYPE_SHORT[o.type] || o.type; counts[k] = (counts[k] || 0) + 1; });
  const team = {};
  const data = {
    prov: P, slug, updated: todayBE(), counts,
    orgs: orgs.map(o => {
      const mayor = o.h.exec.find(p => /^นายก/.test(p.p)) || null, x = o.h.exec.filter(p => p !== mayor);
      team[o.id] = { x, c: o.h.council };
      return { id: +o.id, t: TYPE_SHORT[o.type] || o.type, n: bareOrg(o.full), full: o.full, amp: o.amp, tam: o.tam,
        area: o.area, vil: o.vil, year: o.year,
        m: mayor ? { n: mayor.n, s: mayor.s, e: mayor.e } : null,
        nx: x.length, nc: o.h.council.filter(p => p.p !== "เลขานุการสภา").length };
    }),
    tam, approx,
  };
  const head = "/* สร้างโดย fetch-local.js — อย่าแก้มือ · ที่มา: NLC กรมส่งเสริมการปกครองท้องถิ่น (ผู้ดำรงตำแหน่ง) · ผลนายก อบจ. อยู่ใน pao.js */\n";
  const out = path.join(OUT, slug + ".js"), outT = path.join(OUT, slug + "-team.js");
  fs.writeFileSync(out, head + "window.LOCAL_DATA=window.LOCAL_DATA||{};window.LOCAL_DATA[" + JSON.stringify(P) + "]=" + JSON.stringify(data) + ";\n");
  fs.writeFileSync(outT, head + "window.LOCAL_TEAM=window.LOCAL_TEAM||{};window.LOCAL_TEAM[" + JSON.stringify(P) + "]=" + JSON.stringify(team) + ";\n");
  const kb = f => (fs.statSync(f).size / 1024).toFixed(1);
  console.log(`  เขียน ${path.relative(EL, out)} (${kb(out)} KB) + ทีม/สภา ${path.basename(outT)} (${kb(outT)} KB)`);
  writeIndex(DIDX);
  const noMayor = data.orgs.filter(o => !o.m).map(o => o.full);
  if (noMayor.length) console.warn("  ⚠ ไม่มีชื่อนายก (ว่าง/รอเลือกตั้ง?):", noMayor.join(", "));
  return { n: orgs.length, missing: missing.length, unplaced: unplaced.length, approx: approx.length, failed: failed.length, noMayor: noMayor.length };
}

/* ── --all : ทุกจังหวัดเรียงตามรายการของ NLC · จังหวัดที่ดึงครบแล้วใช้แคช (หยุดกลางทางแล้วสั่งใหม่ได้ต่อจากเดิม) ── */
async function buildAll(DIDX) {
  const provs = options(await newSession(), "searchCondition.provinceId").filter(p => DIDX[p.name]);
  const t0 = Date.now(), sum = [], bad = [];
  for (const [i, p] of provs.entries()) {
    console.log(`\n[${i + 1}/${provs.length}] ${p.name}  (${Math.round((Date.now() - t0) / 60000)} นาที)`);
    try { sum.push([p.name, await buildProvince(DIDX, p.name, p.id)]); }
    catch (e) { console.error("  ✗", e.message); bad.push(p.name); await sleep(30000); await newSession().catch(() => {}); }
  }
  console.log(`\nเสร็จใน ${Math.round((Date.now() - t0) / 60000)} นาที · ${sum.reduce((a, [, r]) => a + r.n, 0)} อปท. ใน ${sum.length} จังหวัด`);
  const tot = k => sum.reduce((a, [, r]) => a + r[k], 0);
  console.log(`  ตำบลประมาณ ${tot("approx")} · ตำบลไม่มีเจ้าของ ${tot("missing")} · อปท. ไม่ได้วางบนแผนที่ ${tot("unplaced")} · ดึงไม่สำเร็จ ${tot("failed")} · ไม่มีชื่อนายก ${tot("noMayor")}`);
  if (bad.length) console.error("  ✗ จังหวัดที่ล้ม (สั่ง --all ใหม่เพื่อต่อ):", bad.join(", "));
}

(async () => {
  ensureDir(CACHE); ensureDir(path.join(CACHE, "nlc")); ensureDir(OUT);
  const DIDX = loadJs(path.join(EL, "district-shapes", "index.js")).DISTRICT_INDEX;
  const PM = loadJs(path.join(EL, "year-2569.js")).DATA.partyMeta;
  if (PAO) await buildPao(DIDX, PM);
  if (ALL) await buildAll(DIDX);
  else if (PROV) await buildProvince(DIDX, PROV);
})().catch(e => { console.error("\n✗", e.message); process.exit(1); });
