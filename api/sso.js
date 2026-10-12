/**
 * /api/sso — ผลนับคะแนนเลือกตั้งคณะกรรมการประกันสังคม (อย่างไม่เป็นทางการ) สำหรับ election/sso.html
 *
 * ต้นทาง: Dashboard SBE0304 ของสำนักงานประกันสังคม (JSON สาธารณะที่หน้า Dashboard ใช้เอง)
 *   https://sbe2.sso.go.th/inter/report/dashboard-sbe0304/api/data[?provinceCode=NN]
 *   ⚠️ ถ้ามี header Origin ต้นทางตอบ 403 → เบราว์เซอร์ดึงตรงไม่ได้ ต้องผ่านตรงนี้
 *   ⚠️ ฟิลด์ profilePictureFile มีเลขประจำตัวประชาชนในชื่อไฟล์ → ไม่ส่งต่อเด็ดขาด (ส่งแค่ว่ามีรูปไหม)
 *
 * คืนค่ารูปแบบเดียวกับ window.SSO ใน election/sso-data.js:
 *   { asof, fetched, source, nation, employer[], employee[], areas, provinces{ชื่อ: {code, ..., se[], si[]}} }
 *   employer/employee เรียงตามคะแนนรวมประเทศ · provinces[*].se/.si = คะแนนรายจังหวัดตามลำดับเดียวกัน
 * ดึงทั้งประเทศ + 77 จังหวัด (ต้นทางตอบครั้งละ ~0.3–0.6 วินาที · ยิงพร้อมกันทีละ 8) แล้วแคชไว้ 3 นาที
 *
 * election/sso-fetch.js ใช้ build() ตัวเดียวกันนี้เขียนไฟล์สำรอง sso-data.js + รูปผู้สมัคร
 */
const https = require('https');

const BASE = 'https://sbe2.sso.go.th/inter';
const PAGE = BASE + '/report/dashboard-sbe0304';
const API = PAGE + '/api';
const UA = 'ratthai-kaona election/sso.html (unofficial results mirror)';
const CONCURRENCY = 8;
const TTL = 3 * 60000;
let memo = null, inflight = null, provCache = null;

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 20000, headers: { 'User-Agent': UA, Accept: 'application/json,text/html' } }, (res) => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode + ' ' + url)); }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout ' + url)); });
  });
}
async function retry(fn, n) {
  for (let i = 0; ; i++) {
    try { return await fn(); } catch (e) { if (i >= n - 1) throw e; await new Promise(r => setTimeout(r, 800 * (i + 1))); }
  }
}
const getJSON = (q) => retry(() => get(API + '/data?t=' + Date.now() + (q || '')).then(JSON.parse), 3);

// ชื่อ: ตัดคำนำหน้าที่หลุดมาในช่องชื่อ + ช่องว่างซ้ำ
const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
const nameOf = c => clean(clean(c.firstName).replace(/^(นางสาว|นาง|นาย)\s*/, '') + ' ' + clean(c.lastName));
function candRow(c, side) {
  const r = { no: c.candidateNo, name: nameOf(c), score: c.totalScore || 0, rank: c.rank };
  if (side === 'e') r.org = clean(c.accountName);
  return r;
}
const sideTotals = d => ({
  reg: d.totalVoters || 0, voted: d.actualVoters || 0,
  stRep: d.reportedPollingStations || 0, stAll: d.totalPollingStations || 0,
  e: { reg: d.totalEmployerRegistered || 0, voted: d.totalEmployerVoters || 0, counted: d.countedEmployerScore || 0 },
  i: { reg: d.totalEmployeeRegistered || 0, voted: d.totalEmployeeVoters || 0, counted: d.countedEmployeeScore || 0 },
  score: d.totalCandidateScore || 0
});
const areaList = arr => (arr || []).map(x => ({ p: x.provinceName || '', a: clean(x.amphurName || '').replace(/\s*\([^)]*\)$/, ''), pct: +(+x.turnoutPct || 0).toFixed(3) }));

// รายชื่อ 77 จังหวัด (รหัส → ชื่อ) จากตัวเลือกในหน้า Dashboard — แทบไม่เปลี่ยน จำไว้ทั้งอินสแตนซ์
async function provinces() {
  if (provCache) return provCache;
  const html = await retry(() => get(PAGE), 3);
  const list = [];
  html.replace(/<option value="(\d{2})"[^>]*>\s*([^<]+?)\s*</g, (_, code, name) => { list.push({ code, name: clean(name) }); });
  if (list.length !== 77) throw new Error('sso: expected 77 provinces, got ' + list.length);
  return (provCache = list);
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) { const k = next++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

/* opts.raw = true → คืน candidateId/มีรูปไหม ของต้นทางด้วย (ให้ sso-fetch.js ดาวน์โหลดรูป) — ไม่ส่งออกทาง API */
async function build(opts) {
  opts = opts || {};
  const [provs, nat] = await Promise.all([provinces(), getJSON('')]);
  const E = nat.employerCandidates.map(c => candRow(c, 'e'));
  const I = nat.employeeCandidates.map(c => candRow(c, 'i'));
  const idxE = new Map(nat.employerCandidates.map((c, k) => [c.candidateId, k]));
  const idxI = new Map(nat.employeeCandidates.map((c, k) => [c.candidateId, k]));

  const per = await pool(provs, CONCURRENCY, p => getJSON('&provinceCode=' + p.code));
  const out = {};
  provs.forEach((p, k) => {
    const d = per[k];
    const se = new Array(E.length).fill(0), si = new Array(I.length).fill(0);
    (d.employerCandidates || []).forEach(c => { const j = idxE.get(c.candidateId); if (j != null) se[j] = c.totalScore || 0; });
    (d.employeeCandidates || []).forEach(c => { const j = idxI.get(c.candidateId); if (j != null) si[j] = c.totalScore || 0; });
    out[p.name] = Object.assign({ code: p.code }, sideTotals(d), { se, si });
  });

  const body = {
    asof: nat.lastUpdated,                 // เวลาเซิร์ฟเวอร์ สปส. (เวลาไทย ไม่มีโซน)
    fetched: new Date().toISOString(),
    source: PAGE,
    nation: sideTotals(nat),
    employer: E,
    employee: I,
    areas: {
      provHi: areaList(nat.top10HighestByProvince), provLo: areaList(nat.top10LowestByProvince),
      amphHi: areaList(nat.top10HighestByAmphur), amphLo: areaList(nat.top10LowestByAmphur)
    },
    provinces: out
  };
  if (opts.raw) body._raw = {
    e: nat.employerCandidates.map(c => ({ id: c.candidateId, no: c.candidateNo, pic: !!c.profilePictureFile })),
    i: nat.employeeCandidates.map(c => ({ id: c.candidateId, no: c.candidateNo, pic: !!c.profilePictureFile }))
  };
  return body;
}

async function load() {
  if (memo && Date.now() - memo.at < TTL) return memo.body;
  if (!inflight) inflight = build().then(body => { memo = { at: Date.now(), body }; return body; }).finally(() => { inflight = null; });
  try {
    return await inflight;
  } catch (e) {
    if (memo && Date.now() - memo.at < 6 * 3600000) return memo.body;   // ต้นทางล่มชั่วคราว — ส่งของล่าสุดไปก่อน
    throw e;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  try {
    const body = await load();
    res.setHeader('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=600');
    res.statusCode = 200;
    res.end(JSON.stringify(body));
  } catch (e) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String(e.message || e) }));
  }
};
module.exports.build = build;
module.exports.API = API;
// ดึง 78 หน้าใช้ราว 5–8 วินาที — เผื่อเวลาไว้
module.exports.config = { maxDuration: 60 };
