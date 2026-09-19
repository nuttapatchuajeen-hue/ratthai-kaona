/**
 * /api/flights — ตำแหน่งเครื่องบินจริง (ADS-B) รอบกรุงเทพฯ สำหรับชั้นสนามบิน 3 มิติใน stats/bkk-city.html
 *
 * ต้นทาง: api.adsb.lol (ODbL, ไม่ต้องใช้คีย์) → สำรอง opendata.adsb.fi
 * ทั้งสองไม่ส่ง CORS header จึงต้องผ่านตัวนี้ · แคชที่ CDN 4 วินาที = ผู้ชมกี่คนก็ยิงต้นทางแค่ ~15 ครั้ง/นาที
 *
 * คืนค่า { now, src, ac: [[hex, callsign, reg, type, lat, lon, alt, gs, track, heading, vrate, category, seenPos, squawk], ...] }
 *   alt = ฟุต (ความสูงความกดอากาศ) หรือ "g" = อยู่บนพื้น
 */
const https = require('https');

const CENTER = { lat: 13.80, lon: 100.68 };   // กึ่งกลางระหว่างดอนเมืองกับสุวรรณภูมิ
const RADIUS_NM = 80;                         // ครอบทางร่อนลง/ทางบินขึ้นของทั้งสองสนาม
const SOURCES = [
  { id: 'adsb.lol', url: 'https://api.adsb.lol/v2/point/' + CENTER.lat + '/' + CENTER.lon + '/' + RADIUS_NM },
  { id: 'adsb.fi', url: 'https://opendata.adsb.fi/api/v2/lat/' + CENTER.lat + '/lon/' + CENTER.lon + '/dist/' + RADIUS_NM }
];

let memo = null;   // แคชในหน่วยความจำ (เซิร์ฟเวอร์เดียวกันเรียกถี่ ๆ)

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (ratthai-kaona bkk-city airport layer)', 'Accept': 'application/json' },
      timeout: 6000
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

function num(v, d) { return typeof v === 'number' && isFinite(v) ? +v.toFixed(d) : null; }

function compact(json) {
  const list = json.ac || json.aircraft || [];
  const out = [];
  for (const a of list) {
    if (typeof a.lat !== 'number' || typeof a.lon !== 'number') continue;
    if (a.seen_pos != null && a.seen_pos > 60) continue;            // ตำแหน่งเก่าเกินหนึ่งนาที
    const alt = a.alt_baro === 'ground' ? 'g' : num(a.alt_baro, 0);
    out.push([
      a.hex || '', (a.flight || '').trim(), a.r || '', a.t || '',
      num(a.lat, 5), num(a.lon, 5), alt,
      num(a.gs, 1), num(a.track, 1), num(a.true_heading != null ? a.true_heading : a.mag_heading, 1),
      num(a.baro_rate != null ? a.baro_rate : a.geom_rate, 0), a.category || '', num(a.seen_pos, 1), a.squawk || ''
    ]);
  }
  return out;
}

async function load() {
  if (memo && Date.now() - memo.at < 3000) return memo.body;
  let lastErr = null;
  for (const s of SOURCES) {
    try {
      const j = await fetchJSON(s.url);
      const body = { now: typeof j.now === 'number' ? j.now : Date.now(), src: s.id, ac: compact(j) };
      memo = { at: Date.now(), body };
      return body;
    } catch (e) { lastErr = e; }
  }
  if (memo && Date.now() - memo.at < 60000) return memo.body;       // ต้นทางล่มชั่วคราว — ส่งของล่าสุดไปก่อน
  throw lastErr || new Error('no source');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  try {
    const body = await load();
    res.setHeader('Cache-Control', 'public, s-maxage=4, stale-while-revalidate=8');
    res.statusCode = 200;
    res.end(JSON.stringify(body));
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 502;
    res.end(JSON.stringify({ error: 'upstream', message: String(err && err.message || err) }));
  }
};
