/**
 * /api/ships — ตำแหน่งเรือจริง (AIS) ในอ่าวไทยตอนบน–แม่น้ำเจ้าพระยา–แหลมฉบัง สำหรับชั้นท่าเรือ 3 มิติใน stats/bkk-city.html
 *
 * ต้นทาง: aisstream.io (WebSocket, ฟรีแต่ต้องมีคีย์ส่วนตัว)
 *   - คีย์: ตัวแปรแวดล้อม AISSTREAM_KEY (ตั้งใน Vercel) หรือไฟล์ ~/.aisstream-key (สำหรับเซิร์ฟเวอร์ในเครื่อง)
 *   - aisstream ไม่ยอมให้เบราว์เซอร์ต่อตรง (กันคีย์รั่ว) → ฟังก์ชันนี้เปิด WebSocket ~7 วินาที เก็บเรือที่ส่งสัญญาณเข้ามา
 *     แล้วรวมกับที่จำไว้ในหน่วยความจำ (ลืมเรือที่เงียบเกิน 15 นาที) · แคชที่ CDN 20 วินาที = ผู้ชมกี่คนก็เปิดต้นทางไม่เกิน ~3 ครั้ง/นาที
 *
 * คืนค่า { ok, now, src, n, ships: [[mmsi, ชื่อ, lat, lon, sog(นอต), cog, heading, ชนิด, ยาว, กว้าง, สถานะเดินเรือ, อายุข้อมูล(วินาที), ปลายทาง]] }
 *   ไม่มีคีย์ → { ok: false, error: "no-key" }
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const BOX = [[12.85, 100.30], [14.05, 101.05]];     // [lat, lon] มุมใต้-ตะวันตก → เหนือ-ตะวันออก
const WINDOW_MS = 7000;
const FORGET_MS = 15 * 60 * 1000;
const TYPES = ['PositionReport', 'StandardClassBPositionReport', 'ExtendedClassBPositionReport', 'ShipStaticData', 'StaticDataReport'];

const mem = new Map();      // mmsi → ข้อมูลล่าสุด (อยู่ได้ตราบที่ฟังก์ชันยังอุ่น)
let busy = null, lastRun = 0;

function apiKey() {
  if (process.env.AISSTREAM_KEY) return process.env.AISSTREAM_KEY.trim();
  try { return fs.readFileSync(path.join(os.homedir(), '.aisstream-key'), 'utf8').trim() || null; } catch (e) { return null; }
}
function WS() {
  if (typeof WebSocket !== 'undefined') return WebSocket;
  try { return require('ws'); } catch (e) { return null; }
}
function num(v, d) { return typeof v === 'number' && isFinite(v) ? +v.toFixed(d) : null; }
function clean(s) { return typeof s === 'string' ? s.replace(/@+/g, '').trim() : ''; }

function ingest(j) {
  const md = j.MetaData || {}, msg = j.Message || {}, t = j.MessageType;
  const mmsi = md.MMSI || (msg[t] && msg[t].UserID);
  if (!mmsi) return;
  const s = mem.get(mmsi) || { mmsi };
  const nm = clean(md.ShipName);
  if (nm) s.name = nm;
  const m = msg[t] || {};
  if (t === 'PositionReport' || t === 'StandardClassBPositionReport' || t === 'ExtendedClassBPositionReport') {
    const lat = m.Latitude != null ? m.Latitude : (md.latitude != null ? md.latitude : md.Latitude);
    const lon = m.Longitude != null ? m.Longitude : (md.longitude != null ? md.longitude : md.Longitude);
    if (typeof lat !== 'number' || typeof lon !== 'number' || Math.abs(lat) > 90 || Math.abs(lon) > 180) return;
    s.lat = lat; s.lon = lon;
    s.sog = m.Sog != null && m.Sog < 102.3 ? m.Sog : null;
    s.cog = m.Cog != null && m.Cog < 360 ? m.Cog : null;
    s.hdg = m.TrueHeading != null && m.TrueHeading < 360 ? m.TrueHeading : null;
    if (m.NavigationalStatus != null) s.nav = m.NavigationalStatus;
    s.t = Date.now();
  } else if (t === 'ShipStaticData') {
    if (m.Type != null) s.type = m.Type;
    const d = m.Dimension || {};
    if (d.A != null || d.B != null) { s.len = (d.A || 0) + (d.B || 0); s.beam = (d.C || 0) + (d.D || 0); }
    if (clean(m.Name)) s.name = clean(m.Name);
    if (clean(m.Destination)) s.dest = clean(m.Destination);
  } else if (t === 'StaticDataReport') {
    const a = m.ReportA || {}, b = m.ReportB || {};
    if (a.Valid !== false && clean(a.Name)) s.name = clean(a.Name);
    if (b.Valid !== false && b.ShipType != null) s.type = b.ShipType;
    const d = b.Dimension || {};
    if (b.Valid !== false && (d.A || d.B)) { s.len = (d.A || 0) + (d.B || 0); s.beam = (d.C || 0) + (d.D || 0); }
  }
  s.seen = Date.now();
  mem.set(mmsi, s);
}

function collect(key) {
  const W = WS();
  if (!W) return Promise.reject(new Error('no-websocket'));
  return new Promise((resolve, reject) => {
    let done = false, got = 0;
    const ws = new W('wss://stream.aisstream.io/v0/stream');
    try { ws.binaryType = 'arraybuffer'; } catch (e) {}
    const finish = (err) => {
      if (done) return;
      done = true;
      try { ws.close(); } catch (e) {}
      if (err && !got) reject(err); else resolve(got);
    };
    const timer = setTimeout(() => finish(null), WINDOW_MS);
    ws.onopen = () => ws.send(JSON.stringify({ APIKey: key, BoundingBoxes: [BOX], FilterMessageTypes: TYPES }));
    ws.onmessage = (ev) => {
      let txt = ev.data;
      if (typeof txt !== 'string') txt = Buffer.from(txt instanceof ArrayBuffer ? new Uint8Array(txt) : txt).toString('utf8');
      let j;
      try { j = JSON.parse(txt); } catch (e) { return; }
      if (j.error) { clearTimeout(timer); return finish(new Error(/key/i.test(j.error) ? 'bad-key' : j.error)); }
      got++;
      ingest(j);
    };
    ws.onerror = (e) => { clearTimeout(timer); finish(new Error('ws error')); };
    ws.onclose = () => { clearTimeout(timer); finish(null); };
  });
}

/* เซิร์ฟเวอร์ที่รันค้าง (static_server.js ในเครื่อง) → เปิด WebSocket ค้างไว้ตลอด รับทุกข้อความ (สถานีแถวนี้ส่งมาไม่ถี่ — เปิดทีละ 7 วินาทีตกหล่นเยอะ)
   บน Vercel (serverless) ใช้แบบเปิดเป็นช่วงตามเดิม · AIS_WINDOW_MODE=1 บังคับแบบช่วง (สคริปต์ทดสอบ) */
const PERSIST = !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.AIS_WINDOW_MODE;
let sock = null, sockErr = null, sockSince = 0, backoff = 2000;
function ensureSocket(key) {
  if (sock) return;
  const W = WS();
  if (!W) { sockErr = 'no-websocket'; return; }
  const ws = new W('wss://stream.aisstream.io/v0/stream');
  sock = ws; sockSince = Date.now();
  try { ws.binaryType = 'arraybuffer'; } catch (e) {}
  ws.onopen = () => { backoff = 2000; ws.send(JSON.stringify({ APIKey: key, BoundingBoxes: [BOX], FilterMessageTypes: TYPES })); };
  ws.onmessage = (ev) => {
    let txt = ev.data;
    if (typeof txt !== 'string') txt = Buffer.from(txt instanceof ArrayBuffer ? new Uint8Array(txt) : txt).toString('utf8');
    let j;
    try { j = JSON.parse(txt); } catch (e) { return; }
    if (j.error) { sockErr = /key/i.test(j.error) ? 'bad-key' : j.error; try { ws.close(); } catch (e) {} return; }
    sockErr = null;
    ingest(j);
  };
  ws.onerror = () => {};
  ws.onclose = () => {
    sock = null;
    const t = setTimeout(() => ensureSocket(apiKey() || key), sockErr === 'bad-key' ? 60000 : backoff);
    if (t.unref) t.unref();
    backoff = Math.min(60000, backoff * 2);
  };
}

function snapshot() {
  const now = Date.now(), out = [];
  for (const [id, s] of mem) {
    if (now - s.seen > FORGET_MS) { mem.delete(id); continue; }
    if (s.lat == null || s.t == null || now - s.t > FORGET_MS) continue;       // ยังไม่มีตำแหน่ง (ได้แค่ข้อมูลเรือ) หรือเงียบนานเกิน
    out.push([id, s.name || '', num(s.lat, 5), num(s.lon, 5), num(s.sog, 1), num(s.cog, 1), s.hdg != null ? s.hdg : null,
      s.type || 0, s.len || 0, s.beam || 0, s.nav != null ? s.nav : null, Math.round((now - s.t) / 1000), s.dest || '']);
  }
  return { ok: true, now, src: 'aisstream.io', n: out.length, ships: out };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  const key = apiKey();
  if (!key) {
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: false, error: 'no-key' }));
    return;
  }
  if (PERSIST) {
    ensureSocket(key);
    // เพิ่งเปิดท่อ → รอข้อความชุดแรกสักครู่
    const wait = 7000 - (Date.now() - sockSince);
    if (wait > 0 && !mem.size) await new Promise(r => setTimeout(r, wait));
    if (sockErr) {
      res.statusCode = sockErr === 'bad-key' ? 401 : 502;
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify({ ok: false, error: sockErr }));
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 200;
    res.end(JSON.stringify(snapshot()));
    return;
  }
  try {
    // เรียกถี่กว่า 15 วินาที → ส่งของที่จำไว้ ไม่เปิดต้นทางซ้ำ (aisstream จำกัด 3 การเชื่อมต่อต่อคีย์)
    if (Date.now() - lastRun > 15000) {
      if (!busy) busy = collect(key).finally(() => { busy = null; lastRun = Date.now(); });
      await busy;
    }
    res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=40');
    res.statusCode = 200;
    res.end(JSON.stringify(snapshot()));
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = e.message === 'bad-key' ? 401 : 502;
    res.end(JSON.stringify({ ok: false, error: e.message || 'failed' }));
  }
};

