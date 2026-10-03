/**
 * /api/traffic — ภาพจราจรสด (raster tile) สำหรับชั้น "จราจรสด" ใน stats/bkk-city.html
 *
 * ต้นทาง: TomTom Traffic API (แพ็กเกจ Freemium ของเจ้าของเว็บ — ฟรี 200,000 แผ่นภาพ/เดือน)
 *   - คีย์: ตัวแปรแวดล้อม TOMTOM_KEY (ตั้งใน Vercel) หรือไฟล์ ~/.tomtom-key (เซิร์ฟเวอร์ในเครื่อง) — ห้ามส่งคีย์ไปเบราว์เซอร์
 *   - ขอภาพแผ่น 512 px (tileSize=512) → จำนวนแผ่นต่อหนึ่งจอลดลง 4 เท่าจากแผ่น 256 px
 *   - แคช CDN 5 นาที ต่อ URL → คนที่ดูพื้นที่เดียวกันในช่วงเดียวกันใช้ภาพแผ่นเดียวกัน ประหยัดโควตา
 *
 * ใช้: /api/traffic?k=flow&s=relative0-dark&z=13&x=6382&y=3778
 *   k = flow (ความเร็วเทียบตอนถนนโล่ง) | inc (จุดเกิดเหตุ/ปิดถนน)
 *   s = สไตล์ของ TomTom (flow: relative0 | relative0-dark | relative-delay | reduced-sensitivity · inc: s0 | s0-dark | s1 | s2 | s3 | night)
 *   ไม่มีคีย์ → 503 { error: "no-key" }
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const STYLES = {
  flow: ['relative0', 'relative0-dark', 'relative-delay', 'reduced-sensitivity'],
  inc: ['s0', 's0-dark', 's1', 's2', 's3', 'night']
};

function apiKey() {
  if (process.env.TOMTOM_KEY) return process.env.TOMTOM_KEY.trim();
  try { return fs.readFileSync(path.join(os.homedir(), '.tomtom-key'), 'utf8').trim() || null; } catch (e) { return null; }
}

function fail(res, code, msg) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ error: msg }));
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  const q = new URL(req.url, 'http://x').searchParams;
  const k = q.get('k') === 'inc' ? 'inc' : 'flow';
  const s = STYLES[k].includes(q.get('s')) ? q.get('s') : STYLES[k][0];
  const z = parseInt(q.get('z'), 10), x = parseInt(q.get('x'), 10), y = parseInt(q.get('y'), 10);
  if (!(z >= 0 && z <= 22) || !(x >= 0 && x < 2 ** z) || !(y >= 0 && y < 2 ** z)) return fail(res, 400, 'bad-tile');
  const key = apiKey();
  if (!key) return fail(res, 503, 'no-key');
  const url = 'https://api.tomtom.com/traffic/map/4/tile/' + (k === 'inc' ? 'incidents' : 'flow') + '/' + s + '/' + z + '/' + x + '/' + y + '.png?tileSize=512&key=' + encodeURIComponent(key);
  const up = https.get(url, { headers: { 'User-Agent': 'ratthai-kaona bkk-city traffic layer' }, timeout: 15000 }, (r) => {
    if (r.statusCode !== 200) {
      r.resume();
      // ไม่บอกรายละเอียดจากต้นทาง (อาจมีคีย์ในข้อความ) — บอกแค่รหัส
      return fail(res, r.statusCode === 403 ? 502 : r.statusCode >= 500 ? 502 : r.statusCode, 'upstream ' + r.statusCode);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', r.headers['content-type'] || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300, stale-while-revalidate=120');
    r.pipe(res);
  });
  up.on('timeout', () => up.destroy(new Error('timeout')));
  up.on('error', () => { if (!res.headersSent) fail(res, 504, 'upstream-timeout'); else res.end(); });
};
