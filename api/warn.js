/**
 * /api/warn — ธงเตือนภัยน้ำหลาก-ดินถล่มรายหมู่บ้าน + ประกาศเตือนภัยรายจังหวัด สำหรับชั้น "ธงเตือนภัย" ใน stats/bkk-city.html
 *
 * ต้นทาง (ข้อมูลเปิดของรัฐ ไม่ต้องใช้คีย์)
 *   1) กรมทรัพยากรน้ำ — ระบบเตือนภัยล่วงหน้า น้ำท่วมฉับพลัน-น้ำป่าไหลหลาก (ews.dwr.go.th)
 *      - สถานะปัจจุบันทุกสถานี: POST ews/web-service/stn action=LoadStation (ตัวเดียวกับที่แผนที่ของกรมฯ ใช้ ต้องมีคุกกี้ PHPSESSID ก่อน)
 *        status 1 เฝ้าระวัง (เขียว) · 2 เตรียมพร้อม/เตือนภัย (เหลือง) · 3 วิกฤติ/อพยพ (แดง = "ธงแดง") · 9 มีฝน · 0 ปกติ
 *      - ประวัติ 20 ครั้งล่าสุด: ews/ews_rss.php (กรมฯ เปิดให้เว็บอื่นนำไปแสดง) — มีหมู่บ้านครอบคลุม + จุดปลอดภัย
 *      - สรุปจำนวนหมู่บ้าน: ews/service-status (หน้าสำหรับฝังในเว็บอื่น)
 *   2) กรมอุตุนิยมวิทยา — CAP (Common Alerting Protocol) www.tmd.go.th/api/xml/CAP → ไฟล์ CAP แต่ละฉบับมีรหัสจังหวัด + รูปหลายเหลี่ยมพื้นที่เสี่ยง
 *
 * คืนค่า {
 *   now,
 *   sum:  { evac, warn, watch, rainSt, covered } — จำนวนหมู่บ้าน/สถานีตามหน้าสรุปของกรมทรัพยากรน้ำ
 *   st:   [[รหัส, ชื่อสถานี, lat, lon, ระดับ 1–3, ตำบล, อำเภอ, จังหวัด, ชนิด rain|wl, ฝน 12 ชม., ระดับน้ำ ม., เวลา, [หมู่บ้านครอบคลุม], ลุ่มน้ำย่อย], ...]  สถานีที่กำลังเตือน
 *   hist: [[เวลา ISO, ระดับ 1–3, ชื่อสถานี, ตำบล, อำเภอ, จังหวัด, สาเหตุ, ฝน 12/24/48 ชม. [..], ระดับน้ำ, [หมู่บ้าน], lat, lon, สถานะตอนนี้], ...]  20 ครั้งล่าสุดจาก RSS
 *   rainSt: จำนวนสถานีที่มีฝนตอนนี้, total: สถานีทั้งหมด
 *   cap:  [{ id, event, sev, urg, eff, exp, head, desc, inst, prov:[ชื่อ], iso:[TH-xx], poly:[[[lon,lat],...]], active }, ...]
 * }
 */
const https = require('https');
const tls = require('tls');

// www.tmd.go.th บางเครื่องไม่ส่ง intermediate CA มาด้วย → Node ตอบ "unable to verify the first certificate"
// เติมใบกลางของ GlobalSign (ดึงจาก AIA http://secure.globalsign.com/cacert/gsgccr6alphasslca2025.crt, ออกโดย GlobalSign Root R6 ที่อยู่ใน root store อยู่แล้ว)
// ยังตรวจใบรับรองครบตามปกติ ไม่ได้ปิดการตรวจ · ใบนี้หมดอายุ 21 พ.ค. 2027 — ถ้า tmd เปลี่ยนใบให้ดึงใหม่จาก AIA ของใบเว็บ
const GS_R6_ALPHASSL_2025 = `-----BEGIN CERTIFICATE-----
MIIFjTCCA3WgAwIBAgIRAIN9TriekS/nLK07x2kt3CAwDQYJKoZIhvcNAQELBQAw
TDEgMB4GA1UECxMXR2xvYmFsU2lnbiBSb290IENBIC0gUjYxEzARBgNVBAoTCkds
b2JhbFNpZ24xEzARBgNVBAMTCkdsb2JhbFNpZ24wHhcNMjUwNTIxMDIzNjUyWhcN
MjcwNTIxMDAwMDAwWjBVMQswCQYDVQQGEwJCRTEZMBcGA1UEChMQR2xvYmFsU2ln
biBudi1zYTErMCkGA1UEAxMiR2xvYmFsU2lnbiBHQ0MgUjYgQWxwaGFTU0wgQ0Eg
MjAyNTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJ/oiu0Bviq52UUE
ADbFWmgu3rC7KDSMoorLN1Wd03McG3Z1aP71DlPCE33838r72Dfuj5M9LXfiQLJp
Au6MwNExmKOzothw4x0zGf5oBYyrCMGm3fBpLPafwYQ3MchBOWMTbf83rKUPLH48
KCJ0MnU8GUl8oA/J81wIvbbKPuNrFf6hvJDccjzc4NyxLz3A89zjV2g5whCg5O0u
9YX4Zxk9JHuc/LvllOJO4waAYLjbWBJkz3rV3ts1SmSYnJqmyRTIjXwQgRvhEYqt
DbRskt0W7M6cPwCze3GTBN2UHNpHkMs3YmVxku68I0aOQn5+uz//fDROP3z1Z/7I
APteRtECAwEAAaOCAV8wggFbMA4GA1UdDwEB/wQEAwIBhjAdBgNVHSUEFjAUBggr
BgEFBQcDAQYIKwYBBQUHAwIwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQU
xbSTj28r3B5Iv7cQMIXO0bK7SC0wHwYDVR0jBBgwFoAUrmwFo5MT4qLn4tcc1sfw
f8hnU6AwewYIKwYBBQUHAQEEbzBtMC4GCCsGAQUFBzABhiJodHRwOi8vb2NzcDIu
Z2xvYmFsc2lnbi5jb20vcm9vdHI2MDsGCCsGAQUFBzAChi9odHRwOi8vc2VjdXJl
Lmdsb2JhbHNpZ24uY29tL2NhY2VydC9yb290LXI2LmNydDA2BgNVHR8ELzAtMCug
KaAnhiVodHRwOi8vY3JsLmdsb2JhbHNpZ24uY29tL3Jvb3QtcjYuY3JsMCEGA1Ud
IAQaMBgwCAYGZ4EMAQIBMAwGCisGAQQBoDIKAQMwDQYJKoZIhvcNAQELBQADggIB
AB/uvBuZf4CiuSahwiXn4geF52roAH+6jxsEPTXTfb7bbeMDXsYgRRsOTNA70ruZ
Tnz5DfFMuBhNoFhIFb0qR1izdy6VkdKOqFPNF2dOFI1EcnY9l2ory9mrzHqVbrL4
vzUd17FLUVyjTVU7PAv4nxyhnO1GTeT83YlrdRF31NyR6bvZVTEERHmpbWSgeveJ
LRtaMzlGWiLZ8IwkH7o6GH3jp/KPtDW4Npu8w64HrRZdN2pqQhi7+YKwfHM7H+2U
dM1BGN0sjOWMVbMSB9MtCsleS2Mb7TRZEbOHxECJLLIluQypZr7Pol3+hAqrhyKI
k+6y+Da0NeDuWxW59Ku4NvClqW1UFX1SpfNGhzVfp/CH+vPM1tySomx2jE0EnYZu
GwVucXPBsp5nUWqUV9+143glVuS7GTg9hFPjNBInn17HbCoIIQIOzj5Vd9bK3A9U
GxXNpwenDHEalCsD/4eQYDHPhFE7sNe0D/OXu+FAM02VZkARx37Jp4bDdujvgL9P
vZPR3wThvDN1CTU8Bc3xea3yKFAraKcPZLkhReQUAm2VpR+HSJRPlUpYizlF9WkL
h3KcAVCBJWvnOkVwxyU5QJMcnwW95JlOtx+9100GL99jHE5rs3gXp7F4bg8H01QT
9jVOhBBmQ7nQoXuwI0tqal2QUqZz3eeu62CU7xBwtfYR
-----END CERTIFICATE-----`;
const TMD_CA = tls.rootCertificates.concat([GS_R6_ALPHASSL_2025]);

const EWS = 'https://ews.dwr.go.th/ews/';
const TMD_CAP = 'https://www.tmd.go.th/api/xml/CAP';
const UA = 'ratthai-kaona bkk-city warning layer';
let memo = null;
const capMemo = new Map();   // ไฟล์ CAP แต่ละฉบับไม่เปลี่ยนแล้ว — จำไว้เลย

function request(url, opts, body) {
  return new Promise((resolve, reject) => {
    const extra = url.indexOf('https://www.tmd.go.th/') === 0 ? { ca: TMD_CA } : {};
    const req = https.request(url, Object.assign({ timeout: +process.env.EWS_TIMEOUT_MS || 25000 }, extra, opts, {   // เครื่องถ่ายทอดตั้งให้รอนานขึ้นได้ (EWS บางทีตอบช้า >25 วิ)
      headers: Object.assign({ 'User-Agent': UA }, (opts && opts.headers) || {})
    }), (res) => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode + ' ' + url)); }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', c => data += c);
      res.on('end', () => resolve({ body: data, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout ' + url)); });
    if (body) req.write(body);
    req.end();
  });
}
const get = (url, headers) => request(url, { method: 'GET', headers: headers || {} });

function num(v, d) { const n = typeof v === 'string' ? parseFloat(v.replace(/,/g, '')) : v; return typeof n === 'number' && isFinite(n) ? +n.toFixed(d) : null; }
function tag(s, k) { const a = s.indexOf('<' + k + '>'), b = s.indexOf('</' + k + '>', a); return a < 0 || b < 0 ? '' : s.slice(a + k.length + 2, b).trim(); }
function unxml(s) { return String(s || '').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'); }
function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
function stName(s) { return clean(s).replace(/\*$/, ''); }
const TH_MONTH = { 'มกราคม': 1, 'กุมภาพันธ์': 2, 'มีนาคม': 3, 'เมษายน': 4, 'พฤษภาคม': 5, 'มิถุนายน': 6, 'กรกฎาคม': 7, 'สิงหาคม': 8, 'กันยายน': 9, 'ตุลาคม': 10, 'พฤศจิกายน': 11, 'ธันวาคม': 12 };

// ---------------------------------------------------------------- กรมทรัพยากรน้ำ
async function ewsStations() {
  // ขอคุกกี้จากหน้าสรุป (หน้านี้กรมฯ ทำไว้ให้ฝังในเว็บอื่นอยู่แล้ว) แล้วใช้หน้าเดียวกันอ่านจำนวนหมู่บ้าน
  const ss = await get(EWS + 'service-status');
  const cookie = (ss.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
  const t = clean(ss.body.replace(/<[^>]+>/g, ' '));
  const pick = (re) => { const m = t.match(re); return m ? parseInt(m[1], 10) : null; };
  const sum = {
    evac: pick(/อพยพ\s*([\d,]+)\s*หมู่บ้าน/), warn: pick(/เตือนภัย\s*([\d,]+)\s*หมู่บ้าน/), watch: pick(/เฝ้าระวัง\s*([\d,]+)\s*หมู่บ้าน/),
    rainSt: pick(/มีฝน\s*([\d,]+)\s*สถานี/), covered: pick(/ครอบคลุม\s*([\d,]+)\s*หมู่บ้าน/)
  };
  const boundary = '----ratthai' + Date.now();
  const body = '--' + boundary + '\r\nContent-Disposition: form-data; name="action"\r\n\r\nLoadStation\r\n--' + boundary + '--\r\n';
  const r = await request(EWS + 'web-service/stn', {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary, 'Content-Length': Buffer.byteLength(body), 'Cookie': cookie, 'Referer': EWS + 'index.php' }
  }, body);
  const all = JSON.parse(r.body);
  if (!Array.isArray(all) || !all.length) throw new Error('ews: empty');
  return { sum, all };
}

async function ewsRss() {
  const r = await get(EWS + 'ews_rss.php');
  const out = [];
  for (const it of r.body.split('<item>').slice(1)) {
    const html = unxml(tag(it, 'description'));
    const col = (html.match(/color=#?([0-9A-Fa-f]{6})/) || [])[1] || '';
    const txt = clean(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' '));
    const lv = /FF0000/i.test(col) ? 3 : /FFCC00/i.test(col) ? 2 : /669900/i.test(col) ? 1 : (/แจ้ง วิกฤติ/.test(txt) ? 3 : /แจ้ง เตรียมพร้อม/.test(txt) ? 2 : 1);
    // "วันที่ 27 กันยายน พ.ศ. 2569 เวลา 17:35:00 น."
    const dm = txt.match(/วันที่\s*(\d+)\s*(\S+)\s*พ\.ศ\.\s*(\d{4})\s*เวลา\s*(\d{1,2}):(\d{2})/);
    const when = dm && TH_MONTH[dm[2]] ? new Date(Date.UTC(+dm[3] - 543, TH_MONTH[dm[2]] - 1, +dm[1], +dm[4] - 7, +dm[5])).toISOString() : null;
    const title = clean(unxml(tag(it, 'title')));
    const tm = title.match(/^(\S+)\s+(.+?)\s+ต\.(\S+)\s+อ\.(\S+)\s+จ\.(\S+)/);
    const why = (txt.match(/ด้วย(ระดับน้ำ|ปริมาณน้ำฝน)/) || [])[1] || '';
    const rain = [12, 24, 48].map(h => { const m = txt.match(new RegExp('สะสม\\s*' + h + '\\s*ชั่วโมง\\s*([\\d.]+)\\s*มิลลิเมตร')); return m ? num(m[1], 1) : null; });
    const wl = (txt.match(/ระดับน้ำ\s*([\d.]+)\s*เมตร/) || [])[1];
    const vill = [];
    const vs = txt.split('หมู่บ้านครอบคลุม')[1] || '';
    for (const m of vs.split('และหมู่บ้านใกล้เคียง')[0].matchAll(/\d+\.\s*(บ้าน\S*(?:\s(?!ตำบล)\S+)*?)\s+ตำบล/g)) vill.push(clean(m[1]));
    out.push([when, lv, tm ? stName(tm[2]) : title, tm ? tm[3] : '', tm ? tm[4] : '', tm ? tm[5] : '', why, rain, num(wl, 2), Array.from(new Set(vill)).slice(0, 12)]);
  }
  return out;
}

// ---------------------------------------------------------------- กรมอุตุนิยมวิทยา (CAP)
function capParse(xml, id) {
  const info = xml.split('<info>')[1] || xml;
  const area = info.split('<area>').slice(1);
  const iso = [], poly = [];
  let prov = [];
  for (const a of area) {
    prov = prov.concat(clean(tag(a, 'areaDesc')).split(/\s+/).filter(Boolean));
    for (const m of a.matchAll(/<value>(TH-\d+)<\/value>/g)) iso.push(m[1]);
    for (const m of a.matchAll(/<polygon>([\s\S]*?)<\/polygon>/g)) {
      // CAP = "lat,lon lat,lon ..." → [lon,lat] ปัด 3 ตำแหน่ง (~100 ม.) + ตัดจุดซ้ำ
      const pts = [];
      for (const p of m[1].trim().split(/\s+/)) {
        const [la, lo] = p.split(',').map(Number);
        if (!isFinite(la) || !isFinite(lo)) continue;
        const q = [+lo.toFixed(3), +la.toFixed(3)];
        const l = pts[pts.length - 1];
        if (!l || l[0] !== q[0] || l[1] !== q[1]) pts.push(q);
      }
      if (pts.length >= 4) poly.push(pts);
    }
  }
  return {
    id, event: tag(info, 'event'), sev: tag(info, 'severity'), urg: tag(info, 'urgency'),
    eff: tag(info, 'effective'), exp: tag(info, 'expires'), sent: tag(xml, 'sent'),
    head: clean(unxml(tag(info, 'headline'))), desc: clean(unxml(tag(info, 'description'))), inst: clean(unxml(tag(info, 'instruction'))),
    web: tag(info, 'web'), prov, iso: Array.from(new Set(iso)), poly
  };
}
async function tmdCap() {
  const feed = (await get(TMD_CAP)).body;
  const items = feed.split('<item>').slice(1).map(it => ({ link: tag(it, 'link'), pub: Date.parse(tag(it, 'pubDate')) }))
    .filter(x => /^https:\/\/www\.tmd\.go\.th\/uploads\/CAP\/[\w-]+\.xml$/.test(x.link));
  // ย้อนหลัง 48 ชม. พอ (ฉบับใหม่ออกทุก ~12 ชม.)
  const recent = items.filter(x => !(x.pub < Date.now() - 48 * 3600000)).slice(0, 8);
  // ดึงทีละไฟล์ (ยิงพร้อมกัน 8 ไฟล์แล้วเซิร์ฟเวอร์กรมอุตุฯ ตัดบางคำขอ)
  const out = [];
  for (const x of recent) {
    if (capMemo.has(x.link)) { out.push(capMemo.get(x.link)); continue; }
    try {
      const c = capParse((await get(x.link)).body.replace(/^﻿/, ''), x.link.split('/').pop().replace(/\.xml$/, ''));
      if (capMemo.size > 60) capMemo.clear();
      capMemo.set(x.link, c);
      out.push(c);
    } catch (e) { /* ข้ามฉบับที่โหลดไม่ได้ */ }
  }
  const seen = new Set();
  const list = out.sort((a, b) => Date.parse(b.eff) - Date.parse(a.eff) || (b.id > a.id ? 1 : -1))
    // กรมอุตุฯ บางครั้งออกซ้ำช่วงเวลาเดียวกัน — เก็บฉบับล่าสุด
    .filter(c => { const k = c.event + '|' + c.eff; if (seen.has(k)) return false; seen.add(k); return true; });
  if (!list.length) throw new Error('cap: empty');
  return list;
}
let lastCap = null, capErr = null;
// สถานะ "มีผล" คิดตอนส่ง (ชุดที่จำไว้ก็ยังถูก) · รูปหลายเหลี่ยมส่งเฉพาะฉบับที่ยังมีผล (ฉบับเก่าแสดงเป็นรายการ)
function capOut(list) {
  const now = Date.now();
  return (list || []).map(c => {
    const active = Date.parse(c.exp) > now && Date.parse(c.eff) - 6 * 3600000 < now;
    return Object.assign({}, c, { active, poly: active ? c.poly : [] });
  });
}
// ---------------------------------------------------------------- ธงกรมทรัพยากรน้ำ (สด หรือผ่านเครื่องถ่ายทอดในไทย)
// ews.dwr.go.th ไม่ตอบเซิร์ฟเวอร์นอกประเทศ (Vercel ทั้ง iad1 และ sin1 = ETIMEDOUT) → เครื่องในไทยรัน scripts/ews-relay.js
// ทุก ~15 นาที ดึงชุดเดียวกันนี้แล้วดันขึ้น branch ews-data ของเรโป · ที่นี่อ่านไฟล์นั้นแทนเมื่อดึงตรงไม่ได้
const RELAY = process.env.EWS_RELAY_URL || 'https://raw.githubusercontent.com/nuttapatchuajeen-hue/ratthai-kaona/ews-data/ews.json';
const RELAY_MAX_AGE = 2 * 3600000;   // เก่ากว่านี้ถือว่าเครื่องถ่ายทอดหยุด (ปิดเครื่อง) — ไม่แสดงธงค้าง

async function ewsBundle() {
  const [ews, rss] = await Promise.all([ewsStations(), ewsRss().catch(() => [])]);
  const all = ews.all || [];
  const byName = new Map();
  for (const s of all) byName.set(stName(s.name) + '|' + clean(s.province), s);
  const st = all.filter(s => ['1', '2', '3'].includes(String(s.status))).map(s => [
    s.stn, stName(s.name), num(s.latitude, 5), num(s.longitude, 5), +s.status, clean(s.tambon), clean(s.amphoe), clean(s.province),
    String(s.warning_type || s.stn_type || '').toLowerCase(), num(s.rain12h, 1), num(s.wl, 2), s.report_date || '',
    Array.from(new Set((s.sub_station || []).map(v => clean(v.name)))).slice(0, 15), clean(s.sub_basin)
  ]).filter(r => r[2] != null && r[3] != null)
    // บางสถานีค้างสถานะเตือนมาหลายปี (เครื่องเสีย/ไม่ได้รีเซ็ต) — เอาเฉพาะที่แจ้งภายใน 3 วัน
    .filter(r => { const t = Date.parse(String(r[11]).replace(' ', 'T') + '+07:00'); return !(t < Date.now() - 3 * 86400000); });
  // ประวัติจาก RSS: เติมพิกัดจากรายชื่อสถานี
  const hist = rss.map(h => {
    const s = byName.get(h[2] + '|' + h[5]);
    return h.concat([s ? num(s.latitude, 5) : null, s ? num(s.longitude, 5) : null, s ? +s.status : null]);
  });
  return { at: Date.now(), sum: ews.sum || null, st, hist, rainSt: all.filter(s => String(s.status) === '9').length, total: all.length };
}
async function ewsFromRelay() {
  const j = JSON.parse((await get(RELAY)).body);
  if (!j || !j.at || !Array.isArray(j.st)) throw new Error('relay: bad file');
  if (Date.now() - j.at > RELAY_MAX_AGE) throw new Error('relay: เก่า ' + Math.round((Date.now() - j.at) / 60000) + ' นาที');
  return j;
}

async function build() {
  // บน Vercel ดึงตรงไม่ได้แน่นอน (รอ timeout เปล่า ๆ ~25 วินาที) → อ่านไฟล์ถ่ายทอดอย่างเดียว · เครื่องในไทย (เซิร์ฟเวอร์พรีวิว) ดึงตรงก่อน
  const direct = process.env.VERCEL ? Promise.reject(new Error('ews: บล็อกเซิร์ฟเวอร์นอกประเทศ')) : ewsBundle();
  const [ews, cap] = await Promise.all([
    direct.then(b => ({ b, src: 'direct' }))
      .catch(e => ewsFromRelay().then(b => ({ b, src: 'relay' }))
        .catch(e2 => ({ err: String(e.message || e) + ' · ' + String(e2.message || e2) }))),
    tmdCap().then(l => { capErr = null; return (lastCap = l); }).catch(e => { capErr = String(e.message || e); return lastCap; })   // โหลดไม่ได้ = ใช้ชุดล่าสุดที่เคยได้
  ]).then(r => [r[0], capOut(r[1])]);
  const b = ews.b || { sum: null, st: [], hist: [], rainSt: 0, total: 0 };
  if (!b.st.length && !b.hist.length && !cap.length && ews.err) throw new Error(ews.err);
  return {
    now: Date.now(), sum: b.sum, st: b.st, hist: b.hist, cap, ewsErr: ews.err || null, ewsSrc: ews.src || null, ewsAt: b.at || null, capErr,
    rainSt: b.rainSt, total: b.total
  };
}

async function load() {
  if (memo && Date.now() - memo.at < 4 * 60000) return memo.body;
  try {
    const body = await build();
    memo = { at: Date.now(), body };
    return body;
  } catch (e) {
    if (memo && Date.now() - memo.at < 3 * 3600000) return memo.body;   // ต้นทางล่มชั่วคราว — ส่งของล่าสุดไปก่อน
    throw e;
  }
}

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  try {
    const body = await load();
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
    res.statusCode = 200;
    res.end(JSON.stringify(body));
  } catch (e) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String(e && e.message || e) }));
  }
};

module.exports = handler;
// ให้ scripts/ews-relay.js (เครื่องถ่ายทอดในไทย) เรียกชุดเดียวกันได้
module.exports.ewsBundle = ewsBundle;
