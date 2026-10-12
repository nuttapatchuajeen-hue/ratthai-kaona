/* api/[name].js — ฟังก์ชัน Vercel ตัวเดียวรับทุก /api/<ชื่อ>
   แพ็กเกจ Hobby รับได้ไม่เกิน 12 ฟังก์ชันต่อ deploy (มี 13 ตัวแล้ว deploy ล้ม) จึงรวมไว้ที่นี่
   ตัวจัดการจริงอยู่ใน api/_lib/<ชื่อ>.js (โฟลเดอร์ขึ้นต้นด้วย _ = Vercel ไม่นับเป็นฟังก์ชัน)
   เพิ่ม API ใหม่ = สร้าง api/_lib/<ชื่อ>.js แล้วเติมบรรทัดใน H ด้านล่าง (ต้องเขียน require ตรง ๆ ให้ Vercel รวมไฟล์ไปด้วย)
   URL เดิมใช้ได้ทุกตัว · req.url ยังเป็น /api/<ชื่อ>?… เหมือนเดิม ตัวจัดการอ่านพารามิเตอร์จาก URL เอง */
const H = {
  air: () => require('./_lib/air.js'),
  dam: () => require('./_lib/dam.js'),
  flights: () => require('./_lib/flights.js'),
  floodhub: () => require('./_lib/floodhub.js'),
  fuel: () => require('./_lib/fuel.js'),
  quake: () => require('./_lib/quake.js'),
  ships: () => require('./_lib/ships.js'),
  slide: () => require('./_lib/slide.js'),
  sso: () => require('./_lib/sso.js'),
  thaiwater: () => require('./_lib/thaiwater.js'),
  traffic: () => require('./_lib/traffic.js'),
  warn: () => require('./_lib/warn.js'),
  'yt-search': () => require('./_lib/yt-search.js'),
};

module.exports = (req, res) => {
  const name = String((req.query && req.query.name) || '').replace(/\.js$/, '');
  const load = Object.prototype.hasOwnProperty.call(H, name) ? H[name] : null;
  if (!load) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'unknown api: ' + name }));
    return;
  }
  return load()(req, res);
};
// เผื่อตัวที่นานที่สุด (sso ดึง 78 หน้า ~5–8 วินาที) — ทุกตัวได้เพดานเดียวกัน
module.exports.config = { maxDuration: 60 };
