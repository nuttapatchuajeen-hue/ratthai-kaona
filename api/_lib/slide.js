/**
 * /api/slide — ฝนตกหนัก 24 ชม. + ฝนสะสม 7 วัน รายสถานี สำหรับชั้น "ดินถล่ม" ใน stats/bkk-city.html
 *
 * ต้นทาง: คลังข้อมูลน้ำแห่งชาติ (thaiwater.net) ของ สสน. — API สาธารณะ ไม่มี CORS จึงต้องผ่านตัวนี้
 *   rain_24h ≈ 4.5 MB · rain_7day ≈ 3.3 MB → จับคู่ด้วยรหัสสถานี แล้วส่งเฉพาะสถานีที่ฝนมาก (~ไม่กี่ร้อยแถว)
 * เกณฑ์ที่หน้าเว็บใช้: กรมทรัพยากรธรณีระบุว่าดินถล่มเกิดเมื่อ "มีฝนตกหนักต่อเนื่องกันเป็นระยะเวลานาน (มากกว่า 100 มิลลิเมตรต่อวัน)"
 *
 * คืนค่า {
 *   now, n24: สถานีที่รายงานฝน 24 ชม., n7: สถานีที่มีฝนสะสม 7 วัน,
 *   st: [[lat, lon, ชื่อสถานี, ตำบล, อำเภอ, จังหวัด, เวลา 24 ชม., ฝน 24 ชม. มม., ฝน 7 วัน มม., ช่วง 7 วัน "เริ่ม–สิ้นสุด", หน่วยงาน], ...]
 *       เฉพาะสถานีที่ฝน 24 ชม. ≥ 35 มม. หรือสะสม 7 วัน ≥ 150 มม.
 * }
 */
const https = require('https');

const BASE = 'https://api-v3.thaiwater.net/api/v1/thaiwater30/public/';
let memo = null;

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'ratthai-kaona bkk-city landslide layer', 'Accept': 'application/json' },
      timeout: 25000
    }, (res) => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function num(v, d) { const n = typeof v === 'string' ? parseFloat(v) : v; return typeof n === 'number' && isFinite(n) ? +n.toFixed(d) : null; }
function th(o) { return (o && (o.th || o.en) || '').trim(); }

async function build() {
  const [a, b] = await Promise.all([fetchJSON(BASE + 'rain_24h'), fetchJSON(BASE + 'rain_7day').catch(() => ({ data: [] }))]);
  const r7 = new Map();
  for (const x of b.data || []) {
    const id = x.station && x.station.id;
    if (id != null) r7.set(id, [num(x.rain_7d, 1), (x.rainfall_start_date || '') + '–' + (x.rainfall_end_date || '')]);
  }
  const seen = new Set(), st = [];
  const add = (s, g, time, v24, v7, rng, ag) => {
    const lat = num(s.tele_station_lat, 5), lon = num(s.tele_station_long, 5);
    if (lat == null || lon == null) return;
    if (!((v24 || 0) >= 35 || (v7 || 0) >= 150)) return;
    st.push([lat, lon, th(s.tele_station_name), th(g && g.tumbon_name), th(g && g.amphoe_name), th(g && g.province_name), time, v24, v7, rng, th(ag && ag.agency_shortname)]);
  };
  for (const x of a.data || []) {
    const s = x.station || {};
    seen.add(s.id);
    const w = r7.get(s.id) || [null, ''];
    add(s, x.geocode, x.rainfall_datetime || '', num(x.rain_24h, 1), w[0], w[1], x.agency);
  }
  // สถานีที่มีแต่ฝนสะสม 7 วัน (24 ชม. ไม่รายงาน)
  for (const x of b.data || []) {
    const s = x.station || {};
    if (seen.has(s.id)) continue;
    add(s, x.geocode, '', null, num(x.rain_7d, 1), (x.rainfall_start_date || '') + '–' + (x.rainfall_end_date || ''), x.agency);
  }
  st.sort((p, q) => (q[7] || 0) - (p[7] || 0) || (q[8] || 0) - (p[8] || 0));
  return { now: Date.now(), n24: (a.data || []).length, n7: (b.data || []).length, st };
}

async function load() {
  if (memo && Date.now() - memo.at < 8 * 60000) return memo.body;
  try {
    const body = await build();
    memo = { at: Date.now(), body };
    return body;
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
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    res.statusCode = 200;
    res.end(JSON.stringify(body));
  } catch (e) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String(e && e.message || e) }));
  }
};
