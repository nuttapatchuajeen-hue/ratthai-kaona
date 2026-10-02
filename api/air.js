/**
 * /api/air — ฝุ่น PM2.5 รายสถานี สำหรับชั้น "ฝุ่น PM2.5" ใน stats/bkk-city.html
 *
 * ต้นทาง: Air4Thai กรมควบคุมมลพิษ (air4thai.pcd.go.th) — ไม่มี CORS จึงต้องผ่านตัวนี้
 *   - services/getNewAQI_JSON.php  ค่าล่าสุดทุกสถานี (~170 สถานี: ของกรมฯ "GROUND" + ของ กทม. "BKK")
 *       PM25.value = ค่าเฉลี่ย 24 ชม. (ตรวจแล้ว: เท่ากับค่าเฉลี่ยของรายชั่วโมง 24 ค่าล่าสุด) · color_id 1–5 = ระดับ AQI ไทย
 *   - forweb/getHistoryData.php     PM2.5 รายชั่วโมง — ยิงทีละ ~45 สถานีพร้อมกัน (ก้อนเดียว 170 สถานีใช้ ~10 วินาที)
 *
 * คืนค่า {
 *   now, t: "YYYY-MM-DD HH:00" ชั่วโมงล่าสุด (เวลาไทย), hours: ["YYYY-MM-DD HH:00" × 24 เก่า→ใหม่],
 *   st: [[id, lat, lon, ชื่อ, พื้นที่, ชนิด G/B/M, "วันที่ เวลา", PM2.5 เฉลี่ย 24 ชม., color_id, AQI, AQI มาจาก,
 *         PM10, O3, CO, NO2, SO2, [PM2.5 รายชั่วโมง × 24 (null = ไม่มีค่า)]], ...]
 *   ค่าที่สถานีไม่ได้วัด (-1) = null
 * }
 */
const https = require('https');
const tls = require('tls');

// air4thai.pcd.go.th ส่งใบกลางผิดชุดมา (ใบเว็บออกโดย Let's Encrypt YR1 แต่แนบใบกลางของ Sectigo) → Node ตอบ "unable to verify the first certificate"
// เติมใบกลาง YR1 (AIA http://yr1.i.lencr.org/) + Root YR ที่ ISRG Root X1 เซ็นข้าม (AIA http://yr.i.lencr.org/) — X1 อยู่ใน root store ของ Node อยู่แล้ว
// ยังตรวจใบรับรองครบตามปกติ ไม่ได้ปิดการตรวจ · YR1 หมดอายุ 2 ก.ย. 2028 — ถ้า Air4Thai เปลี่ยนใบให้ดึงใหม่จาก AIA ของใบเว็บ
const LE_YR1 = `-----BEGIN CERTIFICATE-----
MIIE2zCCAsOgAwIBAgIRAKICU/FfJpHAXcHOE7m8yk4wDQYJKoZIhvcNAQELBQAw
LjELMAkGA1UEBhMCVVMxDTALBgNVBAoTBElTUkcxEDAOBgNVBAMTB1Jvb3QgWVIw
HhcNMjUwOTAzMDAwMDAwWhcNMjgwOTAyMjM1OTU5WjAzMQswCQYDVQQGEwJVUzEW
MBQGA1UEChMNTGV0J3MgRW5jcnlwdDEMMAoGA1UEAxMDWVIxMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoVi8X2xCYgMXvJxNPKp/oF13UMgmPABB07VC
LNDtoXmt9luEZNJSBV10VyT1Pz6LD8Zq1d2gc43WNl1AdRrj4sEnazbOiz0nPpmG
Bp2hui49oZtDIY6wdKeZAi5BbNU20CH6RSBBMLSQ9cXrH8dxdv4PAJ45ssGML68U
SE3BsjC2a6cAN9L5CgXVIQi5tfNiTPoFZZ3S0OlXqLmmtdV95udWAb5b6e/F49Di
CsH0Y00Ag72BVIb1hzynmKe+X0mERBTtsb3BwmpV9ipeBjMLoR/D9cHxHQCWoi5l
TmXwY015J5rGelz1nZjJuxc2kioaX29XJBnhMkP531rSdG5uMwIDAQABo4HuMIHr
MA4GA1UdDwEB/wQEAwIBhjATBgNVHSUEDDAKBggrBgEFBQcDATASBgNVHRMBAf8E
CDAGAQH/AgEAMB0GA1UdDgQWBBQfLzW+RhSCzUCxrnksVXj699Ro+zAfBgNVHSME
GDAWgBTe51tg0CJtQCh9Pw0B/qS1UrRRlDAyBggrBgEFBQcBAQQmMCQwIgYIKwYB
BQUHMAKGFmh0dHA6Ly95ci5pLmxlbmNyLm9yZy8wEwYDVR0gBAwwCjAIBgZngQwB
AgEwJwYDVR0fBCAwHjAcoBqgGIYWaHR0cDovL3lyLmMubGVuY3Iub3JnLzANBgkq
hkiG9w0BAQsFAAOCAgEA0+zvMq3kHig1ddTmmm+RibTr9/RpX7k4buanMMRqbV/y
IvP82zAHN3mvaw+cASuVsdpd0ikjhr4hnhJQLQOzOp2ccKrsdGOAgo0vddeISFAq
EWEV4lmUM3vFF796up+bSgmJ1u6RupDCMxDgF8M3eLvGuj6L0lu3zkQ0KuQLnKxL
tB0oQqn1Idg5CuuGpMvQzk29Pa3D/qHurc0EIM9SxukQuJqq63lxsYyRQFU8yMBO
hq1w5LbfaWNRrz1uklOfI/pYkAb2E2MTZrAMQkBIE2S8Jt1F8gRc96o/xOsrgvSk
a84AisX6xq1lz1Z7jGvrnXc4TMcjxZTjiTaihcYI1JIXZiLtEMSCa5l3cu8YWd6z
dLRQlqRdclVjuQfNHawRJ6GWlkK0QJosivTKwdBw3KxEtzGo8yMHERbsy57gP1UX
HOMcmZYQC0gtyR3SxfenIM/MxC3Ia2Ypab/kQ/CTnlIn2KQ5JUC6NYrGCbhFN9bp
5lKJStEwCUnLpntcrXk5XVDCNv/5RyWpRThkGOV7GetKkQ0qAY8hCzWK6oqnAhDZ
cjlYVdWfqOw3DIOX6EDNBgAqHarRVxyF9QZdOaXSyPJ0ueD2BYJEBgaCGQ8rAaU/
Qc123V5LTXDZW4CcsPBDyhy4v+c8hClAyw/IkJlfBqxB9D+/wvIMHgECZ4ptP6o=
-----END CERTIFICATE-----`;
const LE_ROOT_YR_X1 = `-----BEGIN CERTIFICATE-----
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
-----END CERTIFICATE-----`;
const A4T_CA = tls.rootCertificates.concat([LE_YR1, LE_ROOT_YR_X1]);

const BASE = 'https://air4thai.pcd.go.th/';
const CHUNK = 45;
let memo = null;

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      ca: A4T_CA,
      headers: { 'User-Agent': 'ratthai-kaona bkk-city air layer', 'Accept': 'application/json' },
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

function num(v, d) {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return typeof n === 'number' && isFinite(n) && n >= 0 ? +n.toFixed(d) : null;
}
function ymd(t) { return new Date(t).toISOString().slice(0, 10); }
// เวลาไทย (UTC+7) — เซิร์ฟเวอร์ Vercel ใช้ UTC
function bkkMs(s) { return Date.parse(s.replace(' ', 'T') + '+07:00'); }
function bkkStr(ms) { return new Date(ms + 7 * 3600000).toISOString().slice(0, 13).replace('T', ' ') + ':00'; }

async function history(ids) {
  const today = ymd(Date.now() + 7 * 3600000), yday = ymd(Date.now() + 7 * 3600000 - 86400000);
  const parts = [];
  for (let i = 0; i < ids.length; i += CHUNK) parts.push(ids.slice(i, i + CHUNK));
  const res = await Promise.all(parts.map(p => fetchJSON(BASE + 'forweb/getHistoryData.php?stationID=' + p.join(',') +
    '&param=PM25&type=hr&sdate=' + yday + '&edate=' + today + '&stime=00&etime=23').catch(() => null)));
  const out = new Map();
  for (const r of res) {
    for (const s of (r && r.stations) || []) {
      const m = new Map();
      for (const x of s.data || []) {
        const v = num(x.PM25, 1);
        if (v != null && x.DATETIMEDATA) m.set(bkkMs(x.DATETIMEDATA), v);
      }
      out.set(s.stationID, m);
    }
  }
  return out;
}

async function build() {
  const a = await fetchJSON(BASE + 'services/getNewAQI_JSON.php');
  const list = (a && a.stations) || [];
  if (!list.length) throw new Error('no stations');
  const hist = await history(list.map(s => s.stationID)).catch(() => new Map());
  // แกนเวลา = 24 ชั่วโมงที่ลงท้ายด้วยชั่วโมงล่าสุดที่มีสถานีรายงาน
  let last = 0;
  for (const m of hist.values()) for (const t of m.keys()) if (t > last) last = t;
  for (const s of list) {
    const L = s.AQILast || {};
    if (L.date && L.time) { const t = bkkMs(L.date + ' ' + L.time.slice(0, 5)); if (t > last) last = t; }
  }
  const hours = [];
  for (let i = 23; i >= 0; i--) hours.push(last - i * 3600000);
  const st = [];
  for (const s of list) {
    const lat = num(s.lat, 5), lon = num(s.long, 5);
    if (lat == null || lon == null) continue;
    const L = s.AQILast || {}, P = k => L[k] || {};
    const m = hist.get(s.stationID);
    st.push([
      s.stationID, lat, lon, (s.nameTH || s.nameEN || '').trim(), (s.areaTH || s.areaEN || '').trim(),
      s.stationType === 'BKK' ? 'B' : s.stationType === 'MOBILE' ? 'M' : 'G',
      ((L.date || '') + ' ' + (L.time || '')).trim(),
      num(P('PM25').value, 1), +(P('PM25').color_id || 0) || null, num(P('AQI').aqi, 0), P('AQI').param || '',
      num(P('PM10').value, 1), num(P('O3').value, 0), num(P('CO').value, 2), num(P('NO2').value, 0), num(P('SO2').value, 0),
      m ? hours.map(t => m.has(t) ? m.get(t) : null) : null
    ]);
  }
  return { now: Date.now(), t: bkkStr(last), hours: hours.map(bkkStr), st };
}

async function load() {
  if (memo && Date.now() - memo.at < 10 * 60000) return memo.body;
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
