/**
 * /api/thaiwater — ระดับน้ำในแม่น้ำ/คลอง + ฝนสะสม 24 ชม. ทั่วประเทศ สำหรับชั้น "ฝน & น้ำท่วม" ใน stats/bkk-city.html
 *
 * ต้นทาง: คลังข้อมูลน้ำแห่งชาติ (thaiwater.net) ของ สสน. — API สาธารณะ ไม่ต้องใช้คีย์ แต่ไม่ส่ง CORS header จึงต้องผ่านตัวนี้
 *   waterlevel_load ≈ 1.4 MB · rain_24h ≈ 4.5 MB → ย่อเหลือเฉพาะคอลัมน์ที่ใช้ (~150 KB) · แคชที่ CDN 10 นาที
 *
 * คืนค่า {
 *   now,
 *   wl:   [[lat, lon, ชื่อสถานี, ลำน้ำ, อำเภอ, จังหวัด, เวลา, ระดับน้ำ ม.รทก., ระดับครั้งก่อน, ระดับตลิ่ง ม.รทก., %ความจุลำน้ำ, ระดับสถานการณ์ 1–5, หน่วยงาน], ...],
 *   rain: [[lat, lon, ชื่อสถานี, อำเภอ, จังหวัด, เวลา, ฝน 24 ชม. (มม.), หน่วยงาน], ...]   (เฉพาะสถานีที่มีฝน > 0)
 * }
 * ระดับสถานการณ์ตามเกณฑ์ thaiwater: 1 น้ำน้อยวิกฤติ (≤10%) · 2 น้ำน้อย · 3 ปกติ · 4 น้ำมาก (>70%) · 5 ล้นตลิ่ง (>100%)
 */
const https = require('https');

const BASE = 'https://api-v3.thaiwater.net/api/v1/thaiwater30/public/';
let memo = null;

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'ratthai-kaona bkk-city flood layer', 'Accept': 'application/json' },
      timeout: 20000
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
function geo(g) { return [th(g && g.amphoe_name), th(g && g.province_name)]; }

function waterlevel(j) {
  const list = (j.waterlevel_data && j.waterlevel_data.data) || [];
  const out = [];
  for (const x of list) {
    const s = x.station || {};
    const lat = num(s.tele_station_lat, 5), lon = num(s.tele_station_long, 5);
    if (lat == null || lon == null) continue;
    const [amp, prov] = geo(x.geocode);
    out.push([
      lat, lon, th(s.tele_station_name), x.river_name || '', amp, prov, x.waterlevel_datetime || '',
      num(x.waterlevel_msl, 2), num(x.waterlevel_msl_previous, 2), num(s.min_bank, 2), num(x.storage_percent, 1),
      x.situation_level || 0, th(x.agency && x.agency.agency_shortname)
    ]);
  }
  return out;
}

function rain(j) {
  const out = [];
  for (const x of j.data || []) {
    const s = x.station || {};
    const lat = num(s.tele_station_lat, 5), lon = num(s.tele_station_long, 5), r = num(x.rain_24h, 1);
    if (lat == null || lon == null || !(r > 0)) continue;
    const [amp, prov] = geo(x.geocode);
    out.push([lat, lon, th(s.tele_station_name), amp, prov, x.rainfall_datetime || '', r, th(x.agency && x.agency.agency_shortname)]);
  }
  return out;
}

async function load() {
  if (memo && Date.now() - memo.at < 5 * 60000) return memo.body;
  try {
    const [w, r] = await Promise.all([fetchJSON(BASE + 'waterlevel_load'), fetchJSON(BASE + 'rain_24h')]);
    const body = { now: Date.now(), wl: waterlevel(w), rain: rain(r) };
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
