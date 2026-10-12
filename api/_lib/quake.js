/**
 * /api/quake — แผ่นดินไหวจากกรมอุตุนิยมวิทยา สำหรับชั้น "แผ่นดินไหว" ใน stats/bkk-city.html
 *
 * ต้นทาง (ข้อมูลเปิด ไม่ต้องสมัคร — ไม่มี CORS จึงต้องผ่านตรงนี้)
 *   1) data.tmd.go.th/api/DailySeismicEvent/v1 — ทุกเหตุตั้งแต่ 1 ม.ค. ของปีนี้ ในไทยและประเทศใกล้เคียง (~1,000+ เหตุ, XML ~0.7 MB, ช้า ~8 วินาที)
 *      uid/ukey = ค่าสาธารณะที่กรมอุตุฯ แจกในหน้าเอกสาร API
 *   2) earthquake.tmd.go.th/feed/rss_tmd.xml — 10 เหตุล่าสุด มีรหัสเหตุ (ลิงก์หน้ารายละเอียด) + ตำแหน่งเทียบอำเภอใกล้สุด
 *
 * คืนค่า { now, from, to, n, rssAt, ev: [[เวลา UTC ms, lat, lon, ลึก กม., ขนาด, สถานที่ไทย, สถานที่อังกฤษ, รหัสเหตุ|null, "ทางทิศ…ของ อ.… ประมาณ … กม."|null], ...] }
 *   เรียงใหม่ → เก่า
 */
const https = require('https');

const DAILY = 'https://data.tmd.go.th/api/DailySeismicEvent/v1/?uid=api&ukey=api12345';
const RSS = 'https://earthquake.tmd.go.th/feed/rss_tmd.xml';
const UA = 'ratthai-kaona bkk-city earthquake layer';
let memo = null;

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 30000, headers: { 'User-Agent': UA } }, (res) => {
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

function dec(s) {
  return String(s || '').replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}
function tag(s, k) { const m = s.match(new RegExp('<' + k + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + k + '>')); return m ? dec(m[1]).trim() : ''; }
function num(v, d) { const n = parseFloat(v); return isFinite(n) ? +n.toFixed(d) : null; }
function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
// "แผ่นดินไหว ต.เขาพัง อ.บ้านตาขุน จ.สุราษฎร์ธานี (Tambon Khao Phang, ...)" → ["ต.เขาพัง อ.บ้านตาขุน จ.สุราษฎร์ธานี", "Tambon Khao Phang, ..."]
function place(title, origin) {
  let s = clean(title || origin).replace(/^แผ่นดินไหว\s*/, '');
  const i = s.lastIndexOf(' (');
  let th = s, en = '';
  if (i > 0 && s.endsWith(')')) { th = s.slice(0, i); en = s.slice(i + 2, -1); }
  return [clean(th), clean(en)];
}
// "2026-09-28 06:48:18.000" (UTC) → ms
function utc(s) { const t = Date.parse(String(s).trim().replace(' ', 'T').replace(/(\.\d+)?$/, '') + 'Z'); return isFinite(t) ? t : null; }

async function build() {
  const [xml, rss] = await Promise.all([get(DAILY), get(RSS).catch(e => ({ err: e }))]);
  const ev = [];
  for (const it of xml.split('<DailyEarthquakes>').slice(1)) {
    const t = utc(tag(it, 'DateTimeUTC'));
    const lat = num(tag(it, 'Latitude'), 3), lon = num(tag(it, 'Longitude'), 3);
    if (t == null || lat == null || lon == null) continue;
    const [th, en] = place(tag(it, 'TitleThai'), tag(it, 'OriginThai'));
    ev.push([t, lat, lon, num(tag(it, 'Depth'), 1), num(tag(it, 'Magnitude'), 1), th, en, null, null]);
  }
  if (!ev.length) throw new Error('tmd: no events');
  // RSS: เติมรหัสเหตุ + ตำแหน่งเทียบอำเภอ (จับคู่ด้วยเวลา UTC ถึงวินาที)
  let rssAt = null;
  if (typeof rss === 'string') {
    rssAt = Date.now();
    for (const it of rss.split('<item>').slice(1)) {
      const t = utc(tag(it, 'tmd:time').replace(/\s*UTC$/, ''));
      const id = (tag(it, 'link').match(/earthquake=(\d+)/) || [])[1];
      const near = clean(tag(it, 'comments'));
      if (t == null) continue;
      let e = ev.find(x => Math.abs(x[0] - t) < 1500);
      if (!e) {   // ยังไม่เข้า API รายวัน — เพิ่มจาก RSS
        const [th, en] = place(tag(it, 'title'));
        e = [t, num(tag(it, 'geo:lat'), 3), num(tag(it, 'geo:long'), 3), num(tag(it, 'tmd:depth'), 1), num(tag(it, 'tmd:magnitude'), 1), th, en, null, null];
        if (e[1] == null || e[2] == null) continue;
        ev.push(e);
      }
      if (id) e[7] = +id;
      if (near) e[8] = near;
    }
  }
  ev.sort((a, b) => b[0] - a[0]);
  return { now: Date.now(), from: ev[ev.length - 1][0], to: ev[0][0], n: ev.length, rssAt, ev };
}

async function load() {
  if (memo && Date.now() - memo.at < 4 * 60000) return memo.body;
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
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
    res.statusCode = 200;
    res.end(JSON.stringify(body));
  } catch (e) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String(e.message || e) }));
  }
};
