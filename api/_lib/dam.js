/**
 * /api/dam — ปริมาณน้ำในเขื่อน/อ่างเก็บน้ำทั่วประเทศ สำหรับชั้น "เขื่อน & อ่างเก็บน้ำ" ใน stats/bkk-city.html
 *
 * ต้นทาง (ข้อมูลเปิดของรัฐ ไม่ต้องใช้คีย์)
 *   - กรมชลประทาน ระบบฐานข้อมูลน้ำในอ่างเก็บน้ำ (app.rid.go.th/reservoir)
 *       เขื่อนใหญ่ 35 แห่ง:  GET  api/dam/public/<YYYY-MM-DD>            (API สาธารณะมีหน้าเอกสาร · ไม่มีพิกัด)
 *       อ่างขนาดกลาง ~460:   POST api/rsvmiddles  date=<YYYY-MM-DD>       (ตัวเดียวกับที่หน้า rsvmiddle ของกรมฯ ใช้ · มีพิกัด)
 *   - คลังข้อมูลน้ำแห่งชาติ thaiwater.net (สสน.)  analyst/dam — พิกัดเขื่อนใหญ่ + อ่างเล็กมีโทรมาตร (สสน.) ~60 แห่ง
 *       analyst/dam_yearly_graph · dam_medium_graph — กราฟรายปี + เส้นควบคุมบน/ล่าง (rule curve) ตอนกดดูเขื่อน
 *
 * ?          → { now, date, large:[…], medium:[…], small:[…] }   (ย้อนหลัง 8 วันเป็น % รายวัน · แคช 30 นาที)
 * ?g=large&id=<thaiwater dam id>&y=<ปี ค.ศ.>   → กราฟปริมาณน้ำรายวันทั้งปี + rule curve (ล้านลูกบาศก์เมตร)
 * ?g=medium&id=<thaiwater medium id>&y=<ปี>    → กราฟอ่างขนาดกลาง (มีเฉพาะอ่างที่ thaiwater เก็บ)
 *
 * แถว large : [twId, ชื่อ, lat, lon, จังหวัด, อำเภอ, ลุ่มน้ำ, เจ้าของ, ความจุสูงสุด, ความจุปกติ(รนก.), ปริมาณน้ำ, %รนก., น้ำไหลเข้า, ระบาย, ล้นทางระบายน้ำล้น, วันที่, [%ย้อนหลัง 8 วัน], น้ำใช้การได้]
 * แถว medium: [twId|0, ชื่อ, lat, lon, จังหวัด, สำนักงานชลประทาน/โครงการ, ความจุ(รนก.), ปริมาณน้ำ, %รนก., น้ำไหลเข้า, ระบาย, วันที่, [%ย้อนหลัง 8 วัน], %วันเดียวกันปีก่อน, น้ำใช้การได้, รหัสอ่างของกรมชลฯ]
 * แถว small : [ชื่อ, lat, lon, จังหวัด, อำเภอ, ความจุ, ปริมาณน้ำ, %รนก., เวลา, ระดับน้ำ ม.รทก., ระดับสันทางระบายน้ำล้น]
 * หน่วยปริมาณน้ำ = ล้าน ลบ.ม. · น้ำไหลเข้า/ระบาย = ล้าน ลบ.ม./วัน · % เทียบระดับเก็บกักปกติ (เกิน 100% = สูงกว่าระดับเก็บกัก)
 */
const https = require('https');
const querystring = require('querystring');

const RID = 'https://app.rid.go.th/reservoir/';
const TW = 'https://api-v3.thaiwater.net/api/v1/thaiwater30/analyst/';
const DAYS = 8;
let memo = null;
const gmemo = new Map();

function request(url, opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, Object.assign({
      headers: Object.assign({ 'User-Agent': 'ratthai-kaona bkk-city dam layer', 'Accept': 'application/json' }, (opts && opts.headers) || {}),
      timeout: 25000
    }, opts || {}), (res) => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', c => data += c);
      res.on('end', () => {
        // ต้นทาง PHP บางครั้งพ่นข้อความเตือน HTML นำหน้า JSON
        const i = data.search(/[{[]/);
        try { resolve(JSON.parse(i > 0 ? data.slice(i) : data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (body) req.write(body);
    req.end();
  });
}
const getJSON = (url) => request(url, { method: 'GET' });
function postForm(url, form) {
  const body = querystring.stringify(form);
  return request(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } }, body);
}

function num(v, d) { const n = typeof v === 'string' ? parseFloat(v.replace(/,/g, '')) : v; return typeof n === 'number' && isFinite(n) ? +n.toFixed(d) : null; }
function th(o) { return (o && (o.th || o.en) || '').trim(); }
function key(s) { return String(s || '').replace(/^(เขื่อน|อ่างเก็บน้ำ)/, '').replace(/[\s.]/g, '').replace(/^(เขื่อน|อ่างเก็บน้ำ)/, ''); }
function ymd(t) { return new Date(t + 7 * 3600000).toISOString().slice(0, 10); }   // วันที่ตามเวลาไทย

async function ridLargeDay(d) {
  const j = await getJSON(RID + 'api/dam/public/' + d);
  const out = {};
  for (const r of j.data || []) for (const x of r.dam || []) out[key(x.name)] = x;
  return filled(out, 'percent_storage');
}
async function ridMediumDay(d) {
  const j = await postForm(RID + 'api/rsvmiddles', { date: d, region: '', percent: '', percent_from: '', percent_to: '', status: 1 });
  const out = {};
  for (const r of j.region || []) for (const x of r.reservoir || []) out[x.cresv] = x;
  return filled(out, 'percent_resv_curr');
}
// วันที่กรมฯ เพิ่งเปิดแถวแต่ยังไม่ได้ลงตัวเลข (ช่วงเช้า) ถือว่ายังไม่มีข้อมูล
function filled(out, f) {
  const v = Object.values(out);
  return v.length && v.filter(x => num(x[f], 2) != null).length >= v.length * 0.1 ? out : null;
}
// วันล่าสุดที่ "อ่างนี้" มีตัวเลขจริง — วันนี้กรมฯ อาจลงข้อมูลได้แค่บางอ่าง
function latest(days, id, f) {
  for (let i = days.length - 1; i >= 0; i--) { const v = days[i].v[id]; if (v && num(v[f], 2) != null) return { d: days[i].d, v }; }
  return null;
}

// ดึงย้อนหลัง DAYS วัน — วันล่าสุดที่มีข้อมูลคือ "วันนี้" (กรมฯ ลงข้อมูลช่วงเช้า บางวันยังไม่มา)
async function series(fetchDay) {
  const today = Date.now(), dates = [];
  for (let k = DAYS; k >= 0; k--) dates.push(ymd(today - k * 86400000));
  const res = await Promise.all(dates.map(d => fetchDay(d).catch(() => null)));
  const days = [];
  dates.forEach((d, i) => { if (res[i]) days.push({ d, v: res[i] }); });
  return days.slice(-DAYS);
}

async function build() {
  const [tw, L, M] = await Promise.all([
    getJSON(TW + 'dam').then(j => j.data).catch(() => null),
    series(ridLargeDay),
    series(ridMediumDay)
  ]);
  if (!L.length && !M.length && !tw) throw new Error('no source');

  // ---------- เขื่อนใหญ่: พิกัด/ลุ่มน้ำจาก thaiwater (แถวของกรมชลฯ) + ตัวเลขรายวันจาก RID
  const twLarge = {};
  for (const x of (tw && tw.dam_daily) || []) {
    const k = key(th(x.dam.dam_name));
    const rid = x.agency && x.agency.id === 12;
    if (!twLarge[k] || rid) twLarge[k] = x;
  }
  const large = [];
  const lk = {};
  for (const day of L) for (const k of Object.keys(day.v)) lk[k] = latest(L, k, 'percent_storage');
  const names = Array.from(new Set(Object.keys(twLarge).concat(Object.keys(lk))))
    .sort((a, b) => (lk[b] ? 1 : 0) - (lk[a] ? 1 : 0));
  for (const k of names) {
    const t = twLarge[k], hit = lk[k], r = hit && hit.v;
    if (!t || !t.dam || t.dam.dam_lat == null) continue;
    // แถวที่มีแต่ใน thaiwater (ของ กฟผ.) แต่อยู่ห่างเขื่อนที่มีแล้วไม่ถึง 3 กม. = เขื่อนเดียวกันคนละชื่อ (แม่งัด)
    if (!r && large.some(x => Math.abs(x[2] - t.dam.dam_lat) < 0.03 && Math.abs(x[3] - t.dam.dam_long) < 0.03)) continue;
    const g = t.geocode || {};
    const hist = L.map(day => { const v = day.v[k]; return v ? num(v.percent_storage, 1) : null; });
    large.push([
      t.dam.id, 'เขื่อน' + th(t.dam.dam_name), num(t.dam.dam_lat, 5), num(t.dam.dam_long, 5),
      th(g.province_name), th(g.amphoe_name), th(t.basin && t.basin.basin_name),
      r ? r.owner : th(t.agency && t.agency.agency_name),
      num(r ? r.capacity : t.dam.max_storage, 2), num(r ? r.storage : t.dam.normal_storage, 2),
      num(r ? r.volume : t.dam_storage, 2), num(r ? r.percent_storage : t.dam_storage_percent, 2),
      num(r ? r.inflow : t.dam_inflow, 3), num(r ? r.outflow : t.dam_released, 3), num(t.dam_spilled, 3),
      r ? hit.d : t.dam_date, hist, num(t.dam_uses_water, 2)
    ]);
  }

  // ---------- อ่างขนาดกลาง: RID (มีพิกัดในตัว) + จับคู่ id ของ thaiwater ไว้ขอกราฟรายปี
  const twMed = {};
  for (const x of (tw && tw.dam_medium) || []) if (x.dam) twMed[key(th(x.dam.dam_name)) + '|' + th(x.geocode && x.geocode.province_name)] = x.dam.id;
  const medium = [];
  const ids = new Set();
  for (const day of M) for (const id of Object.keys(day.v)) ids.add(id);
  {
    for (const id of ids) {
      const hit = latest(M, id, 'percent_resv_curr') || { d: null, v: M[M.length - 1].v[id] || M[0].v[id] };
      const r = hit.v;
      const lat = num(r.cresv_lat, 5), lon = num(r.cresv_lng, 5);
      if (lat == null || lon == null || !lat || !lon) continue;
      const hist = M.map(day => { const v = day.v[id]; return v ? num(v.percent_resv_curr, 1) : null; });
      medium.push([
        twMed[key(r.nresv) + '|' + (r.tprov || '').trim()] || 0, (r.nresv || '').replace(/\s+/g, ' ').trim(), lat, lon, (r.tprov || '').trim(),
        [(r.rid || '').trim(), (r.project_name || '').trim()].filter(Boolean).join(' · '),
        num(r.cap_resv, 3), num(r.qdisc_curr, 3), num(r.percent_resv_curr, 2), num(r.q_info, 3), num(r.q_outfo, 3),
        hit.d, hist, num(r.percent_resv_prev, 1), num(r.water_workable, 3), id
      ]);
    }
  }

  // ---------- อ่างเล็กมีโทรมาตร (สสน.)
  const small = [];
  for (const x of (tw && tw.dam_small_tele) || []) {
    const s = x.dam || {};
    const lat = num(s.tele_station_lat, 5), lon = num(s.tele_station_long, 5);
    if (lat == null || lon == null) continue;
    const g = x.geocode || {};
    small.push([
      th(s.smalldam_name), lat, lon, th(g.province_name), th(g.amphoe_name),
      num(s.normal_storage, 3), num(x.volume, 3), num(x.percent_storage, 1), (x.smalldam_datetime || '').slice(0, 16),
      num(x.water_level, 2), num(s.spillway, 2)
    ]);
  }

  return { now: Date.now(), date: M.length ? M[M.length - 1].d : L.length ? L[L.length - 1].d : null, days: M.map(d => d.d), daysL: L.map(d => d.d), large, medium, small };
}

async function load() {
  if (memo && Date.now() - memo.at < 20 * 60000) return memo.body;
  try {
    const body = await build();
    memo = { at: Date.now(), body };
    return body;
  } catch (e) {
    if (memo && Date.now() - memo.at < 12 * 3600000) return memo.body;   // ต้นทางล่มชั่วคราว — ส่งของล่าสุดไปก่อน
    throw e;
  }
}

// กราฟรายปี: ย่อเป็น [วันของปี 0–365, ค่า] และ rule curve เป็นค่ารายวัน
function doy(s) { const d = new Date(String(s).slice(0, 10) + 'T00:00:00Z'); return Math.round((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000); }
function pts(arr) { return (arr || []).filter(p => p && p.value != null).map(p => [doy(p.date), num(p.value, 2)]); }
async function graph(kind, id, y) {
  const k = kind + ':' + id + ':' + y;
  const hit = gmemo.get(k);
  if (hit && Date.now() - hit.at < 3 * 3600000) return hit.body;
  const url = kind === 'large'
    ? TW + 'dam_yearly_graph?data_type=dam_storage&dam_id=' + id + '&year=' + y
    : TW + 'dam_medium_graph?data_type=mediumdam_storage&medium_id=' + id + '&year=' + y;
  const j = await getJSON(url);
  if (j.result !== 'OK' || !j.data) throw new Error('no graph');
  const d = j.data;
  const body = {
    y, cur: pts(d.graph_data && d.graph_data[0] && d.graph_data[0].data).sort((a, b) => a[0] - b[0]),
    upper: pts(d.upper_rule_curve), lower: pts(d.lower_rule_curve),
    max: num(d.upper_bound, 2), normal: num(d.normal_bound, 2), min: num(d.lower_bound, 2)
  };
  if (gmemo.size > 300) gmemo.clear();
  gmemo.set(k, { at: Date.now(), body });
  return body;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  const q = querystring.parse(String(req.url || '').split('?')[1] || '');
  try {
    let body;
    if (q.g === 'large' || q.g === 'medium') {
      const id = parseInt(q.id, 10), y = parseInt(q.y, 10) || new Date().getFullYear();
      if (!(id > 0) || y < 2000 || y > 2100) { res.statusCode = 400; res.end('{"error":"bad id"}'); return; }
      body = await graph(q.g, id, y);
      res.setHeader('Cache-Control', 'public, s-maxage=10800, stale-while-revalidate=86400');
    } else {
      body = await load();
      res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=7200');
    }
    res.statusCode = 200;
    res.end(JSON.stringify(body));
  } catch (e) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String(e && e.message || e) }));
  }
};
