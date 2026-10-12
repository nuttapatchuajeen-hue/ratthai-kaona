/**
 * /api/floodhub — สถานะน้ำท่วมคาดการณ์ล่าสุดของจุดวัดน้ำ Google Flood Hub ในประเทศไทย (ชั้น "ฝน & น้ำท่วม" ใน stats/bkk-city.html)
 *
 * ต้นทาง: Google Flood Forecasting API (floodforecasting.googleapis.com) — ต้องมีคีย์ที่ได้รับอนุมัติจาก Google ก่อน
 *   คีย์อ่านจาก env FLOODHUB_KEY (ตั้งบน Vercel) หรือไฟล์ ~/.floodhub-key (เครื่องที่พัฒนา) — ห้ามใส่คีย์ในโค้ด/หน้าเว็บ
 *   ไม่มีคีย์ → คืน { enabled: false } ให้หน้าเว็บแสดงแค่ปุ่มลัดไป Flood Hub
 *
 * คืนค่า { enabled: true, now, g: [[gaugeId, lat, lon, severity, trend, issuedTime, ชื่อจุด, แม่น้ำ, qualityVerified], ...] }
 *   severity: EXTREME / SEVERE / ABOVE_NORMAL / NO_FLOODING / UNKNOWN
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const API = 'https://floodforecasting.googleapis.com/v1/';
let memo = null, gaugeMemo = null;

function apiKey() {
  if (process.env.FLOODHUB_KEY) return process.env.FLOODHUB_KEY.trim();
  try { return fs.readFileSync(path.join(os.homedir(), '.floodhub-key'), 'utf8').trim(); } catch (e) { return ''; }
}

function post(method, key, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(API + method + '?key=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout: 20000
    }, (res) => {
      let out = '';
      res.setEncoding('utf8');
      res.on('data', c => out += c);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode + ' ' + out.slice(0, 200)));
        try { resolve(JSON.parse(out)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end(data);
  });
}

async function all(method, key, field) {
  let token = '', list = [];
  for (let i = 0; i < 10; i++) {
    const j = await post(method, key, Object.assign({ regionCode: 'TH' }, token ? { pageToken: token } : {}));
    list = list.concat(j[field] || []);
    if (!j.nextPageToken) break;
    token = j.nextPageToken;
  }
  return list;
}

async function load(key) {
  if (memo && Date.now() - memo.at < 10 * 60000) return memo.body;
  // ชื่อจุด/แม่น้ำเปลี่ยนน้อย — แคชไว้ 1 วัน
  if (!gaugeMemo || Date.now() - gaugeMemo.at > 86400000) {
    try {
      const gs = await all('gauges:searchGaugesByArea', key, 'gauges');
      const m = {};
      gs.forEach(g => { m[g.gaugeId] = [g.siteName || '', g.river || '']; });
      gaugeMemo = { at: Date.now(), m };
    } catch (e) { if (!gaugeMemo) gaugeMemo = { at: 0, m: {} }; }
  }
  const st = await all('floodStatus:searchLatestFloodStatusByArea', key, 'floodStatuses');
  const g = [];
  for (const s of st) {
    const p = s.gaugeLocation || {};
    if (typeof p.latitude !== 'number' || typeof p.longitude !== 'number') continue;
    const nm = gaugeMemo.m[s.gaugeId] || ['', ''];
    g.push([s.gaugeId, +p.latitude.toFixed(5), +p.longitude.toFixed(5), s.severity || 'UNKNOWN', s.forecastTrend || '', s.issuedTime || '', nm[0], nm[1], !!s.qualityVerified]);
  }
  const body = { enabled: true, now: Date.now(), g };
  memo = { at: Date.now(), body };
  return body;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  const key = apiKey();
  if (!key) {
    res.setHeader('Cache-Control', 'public, s-maxage=3600');
    res.statusCode = 200;
    res.end(JSON.stringify({ enabled: false }));
    return;
  }
  try {
    const body = await load(key);
    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
    res.statusCode = 200;
    res.end(JSON.stringify(body));
  } catch (e) {
    if (memo) { res.statusCode = 200; res.end(JSON.stringify(memo.body)); return; }
    res.statusCode = 502;
    res.end(JSON.stringify({ enabled: true, error: String(e && e.message || e) }));
  }
};
