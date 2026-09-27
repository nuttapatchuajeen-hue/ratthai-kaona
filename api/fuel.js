/**
 * /api/fuel — ราคาน้ำมันขายปลีกสำหรับชั้น "ปั๊มน้ำมัน" ใน stats/bkk-city.html
 *
 *   /api/fuel             → ราคาวันนี้ทุกแบรนด์ (กทม.และปริมณฑล) + ราคาพรุ่งนี้จากบางจาก (ประกาศปรับราคาล่วงหน้า)
 *   /api/fuel?prov=จังหวัด → ราคา ปตท. รายอำเภอของจังหวัดนั้น (ต่างจังหวัดราคาสูงกว่า กทม. ตามค่าขนส่ง)
 *   /api/fuel?hist=90     → ราคา ปตท. ย้อนหลัง (สุ่มทุก 2 วัน) สำหรับกราฟ
 *
 * ต้นทาง (ไม่มีตัวไหนเปิด CORS ครบ จึงรวมไว้ที่นี่)
 *   - ปตท. (PTT OR) OilPrice web service: orapiweb.pttor.com/oilservice/OilPrice.asmx — ราคาทางการ รายอำเภอ และย้อนหลัง
 *   - บางจาก: oil-price.bangchak.co.th/ApiOilPrice2/th — ราคาเมื่อวาน/วันนี้/พรุ่งนี้
 *   - ราคาแบรนด์อื่น (เชลล์ คาลเท็กซ์ PT ซัสโก้ เพียว): api.chnwt.dev/thai-oil-api (บริการรวบรวมราคาของบุคคลทั่วไป — ไม่ใช่ทางการ)
 *
 * รหัสชนิดน้ำมัน: b7 ดีเซล · b20 ดีเซล B20 · pd ดีเซลพรีเมียม · gh95 แก๊สโซฮอล์ 95 · gh91 แก๊สโซฮอล์ 91 · e20 · e85
 *                 g95 เบนซิน 95 · pg แก๊สโซฮอล์พรีเมียม · ngv
 */
const https = require('https');

const PTT = 'https://orapiweb.pttor.com/oilservice/OilPrice.asmx';
const BCP = 'https://oil-price.bangchak.co.th/ApiOilPrice2/th';
const CHN = 'https://api.chnwt.dev/thai-oil-api/latest';
const memo = {};

function request(url, opt, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, Object.assign({ timeout: 8000 }, opt), (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', c => data += c);
      res.on('end', () => res.statusCode === 200 ? resolve(data) : reject(new Error('HTTP ' + res.statusCode)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end(body);
  });
}
const getJSON = url => request(url, { headers: { 'User-Agent': 'ratthai-kaona bkk-city fuel layer', Accept: 'application/json' } }).then(JSON.parse);

function soap(op, inner) {
  const body = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>' +
    '<' + op + ' xmlns="http://www.pttor.com">' + inner + '</' + op + '></soap:Body></soap:Envelope>';
  return request(PTT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '"http://www.pttor.com/' + op + '"', 'Content-Length': Buffer.byteLength(body) }
  }, body).then(x => x.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
}
function rows(xml, tag) {
  const out = [];
  const re = new RegExp('<' + tag + '>([\\s\\S]*?)</' + tag + '>', 'g');
  let m;
  while ((m = re.exec(xml))) {
    const r = {};
    m[1].replace(/<([A-Z_]+)>([^<]*)<\/\1>/g, (_, k, v) => { r[k] = v.trim(); });
    out.push(r);
  }
  return out;
}
const esc = s => String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

// ชื่อสินค้าหลากหลายรูปแบบ → รหัสกลาง
function code(name) {
  const n = String(name).toLowerCase();
  if (/ngv/.test(n)) return 'ngv';
  if (/b20/.test(n)) return 'b20';
  if (/ดีเซล|diesel|disel/.test(n)) return /พรีเมียม|premium|super ?power|v-?power|วี-เพาเวอร์/.test(n) ? 'pd' : 'b7';
  if (/e85/.test(n)) return 'e85';
  if (/e20/.test(n)) return 'e20';
  if (/99|98|x99|พรีเมียม|premium|v-?power|วี-เพาเวอร์|super ?power/.test(n)) return 'pg';
  if (/91/.test(n)) return 'gh91';
  if (/แก๊สโซฮอล์|gasohol|gsh/.test(n)) return 'gh95';
  if (/เบนซิน|gasoline|benzine/.test(n)) return 'g95';
  return null;
}
// คีย์ของ api.chnwt.dev → รหัสกลาง
const CHN_KEY = {
  gasoline_95: 'g95', gasohol_95: 'gh95', gasohol_91: 'gh91', gasohol_e20: 'e20', gasohol_e85: 'e85',
  diesel: 'b7', disel: 'b7', fuelsafe_diesel: 'b7', diesel_b20: 'b20', premium_diesel: 'pd', vpower_diesel: 'pd',
  premium_gasohol_95: 'pg', superpower_gasohol_95: 'pg', vpower_gasohol_95: 'pg', ngv: 'ngv'
};
const CHN_BRAND = { ptt: 'ptt', bcp: 'bcp', shell: 'shell', caltex: 'caltex', pt: 'pt', susco: 'susco', pure: 'pure', irpc: 'pure' };

async function cached(key, ms, fn) {
  const m = memo[key];
  if (m && Date.now() - m.at < ms) return m.body;
  try {
    const body = await fn();
    memo[key] = { at: Date.now(), body };
    return body;
  } catch (e) {
    if (m) return m.body;                         // ต้นทางล่มชั่วคราว — ส่งของล่าสุดไปก่อน
    throw e;
  }
}

/* ---------- ราคาวันนี้ + พรุ่งนี้ ---------- */
async function today() {
  const [pttX, bcp, chn] = await Promise.allSettled([
    soap('CurrentOilPrice', '<Language>thai</Language>'), getJSON(BCP), getJSON(CHN)
  ]);
  const brands = {}, names = {};
  const put = (b, c, price, name) => {
    const p = parseFloat(price);
    if (!c || !(p > 0)) return;
    brands[b] = brands[b] || {};
    if (brands[b][c] == null) { brands[b][c] = p; if (name) (names[b] = names[b] || {})[c] = name; }
  };
  let date = '', src = [];
  // ปตท. ทางการก่อน
  if (pttX.status === 'fulfilled') {
    rows(pttX.value, 'FUEL').forEach(r => { put('ptt', code(r.PRODUCT), r.PRICE, r.PRODUCT); if (!date && r.PRICE_DATE) date = r.PRICE_DATE; });
    src.push('pttor');
  }
  // บางจาก: วันนี้ + พรุ่งนี้
  const tomorrow = [];
  let bcpNote = '';
  if (bcp.status === 'fulfilled' && bcp.value && bcp.value[0]) {
    const b = bcp.value[0];
    const list = typeof b.OilList === 'string' ? JSON.parse(b.OilList) : (b.OilList || []);
    list.forEach(o => {
      const c = code(o.OilName);
      put('bcp', c, o.PriceToday, o.OilName);
      if (c && o.PriceTomorrow != null && o.PriceToday != null) tomorrow.push([c, o.OilName, +o.PriceToday, +o.PriceTomorrow, +o.PriceYesterday]);
    });
    bcpNote = (b.OilRemark2 || '').trim();
    src.push('bangchak');
  }
  // แบรนด์อื่นจากบริการรวบรวม
  let chnDate = '';
  if (chn.status === 'fulfilled' && chn.value && chn.value.response) {
    const st = chn.value.response.stations || {};
    for (const k in st) {
      const b = CHN_BRAND[k];
      if (!b) continue;
      for (const p in st[k]) put(b, CHN_KEY[p] || code(st[k][p].name), st[k][p].price, st[k][p].name);
    }
    chnDate = chn.value.response.date || '';
    src.push('chnwt');
  }
  if (!Object.keys(brands).length) throw new Error('no price source');
  return { now: Date.now(), date, chnDate, bcpNote, brands, names, tomorrow, src };
}

/* ---------- ราคา ปตท. รายอำเภอ ---------- */
async function provincial(prov) {
  const x = await soap('CurrentOilPriceProvincial', '<Language>thai</Language><Province>' + esc(prov) + '</Province>');
  const loc = {};
  let date = '';
  rows(x, 'FUEL_PROVINCIAL').forEach(r => {
    const c = code(r.PRODUCT), p = parseFloat(r.PRICE);
    if (!c || !(p > 0) || !r.LOCATION) return;
    (loc[r.LOCATION] = loc[r.LOCATION] || {})[c] = p;
    if (!date) date = r.PRICE_DATE || '';
  });
  if (!Object.keys(loc).length) throw new Error('no provincial data');
  return { now: Date.now(), prov, date, loc };
}

/* ---------- ราคา ปตท. ย้อนหลัง ---------- */
async function history(days) {
  const dates = [];
  const t0 = Date.now() + 7 * 3600000;                 // เวลาไทย
  for (let d = days; d >= 0; d -= 2) dates.push(new Date(t0 - d * 86400000));
  if (dates[dates.length - 1].getTime() !== new Date(t0).getTime()) dates.push(new Date(t0));
  const out = new Array(dates.length);
  let i = 0;
  const worker = async () => {
    while (i < dates.length) {
      const k = i++, d = dates[k];
      try {
        const x = await soap('GetOilPrice', '<Language>thai</Language><DD>' + d.getUTCDate() + '</DD><MM>' + (d.getUTCMonth() + 1) + '</MM><YYYY>' + d.getUTCFullYear() + '</YYYY>');
        const r = {};
        rows(x, 'FUEL').forEach(f => { const c = code(f.PRODUCT), p = parseFloat(f.PRICE); if (c && p > 0 && r[c] == null) r[c] = p; });
        out[k] = [d.toISOString().slice(0, 10), r];
      } catch (e) { out[k] = null; }
    }
  };
  await Promise.all(Array.from({ length: 12 }, worker));
  const series = out.filter(x => x && Object.keys(x[1]).length);
  if (!series.length) throw new Error('no history');
  return { now: Date.now(), days, series };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  const q = new URL(req.url, 'http://x').searchParams;
  try {
    let body, age;
    if (q.get('prov')) {
      const prov = q.get('prov').slice(0, 40);
      body = await cached('p:' + prov, 3 * 3600000, () => provincial(prov)); age = 3600;
    } else if (q.get('hist')) {
      const days = Math.max(14, Math.min(180, parseInt(q.get('hist'), 10) || 90));
      body = await cached('h:' + days, 6 * 3600000, () => history(days)); age = 6 * 3600;
    } else {
      body = await cached('t', 10 * 60000, today); age = 900;
    }
    res.setHeader('Cache-Control', 'public, s-maxage=' + age + ', stale-while-revalidate=' + age * 4);
    res.statusCode = 200;
    res.end(JSON.stringify(body));
  } catch (e) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String(e && e.message || e) }));
  }
};
