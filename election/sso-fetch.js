/* ดึงผลนับคะแนนเลือกตั้งคณะกรรมการประกันสังคม (อย่างไม่เป็นทางการ) จาก Dashboard ของ สปส.
   → เขียน sso-data.js (window.SSO — ข้อมูลสำรองที่หน้าเว็บแสดงทันที ก่อน/ถ้าดึงสดผ่าน /api/sso ไม่ได้)
     + รูปผู้สมัคร sso-photos/{e|i}-<เบอร์>.jpg

   วิธีใช้ (จากโฟลเดอร์ election/):   node sso-fetch.js            ดึงข้อมูล + รูปที่ยังไม่มี
                                     node sso-fetch.js --no-photos ดึงเฉพาะตัวเลข

   ตัวดึง/แปลงข้อมูลอยู่ที่ ../api/sso.js (build) ตัวเดียวกับฟังก์ชัน Vercel ที่หน้าเว็บเรียกสด
   ⚠️ ฟิลด์ profilePictureFile ของต้นทางมีเลขประจำตัวประชาชนอยู่ในชื่อไฟล์ → ห้ามเก็บลงไฟล์ใด ๆ */
const fs = require('fs');
const path = require('path');
const https = require('https');
const sso = require('../api/sso.js');

const OUT = path.join(__dirname, 'sso-data.js');
const PHOTO_DIR = path.join(__dirname, 'sso-photos');
const WANT_PHOTOS = !process.argv.includes('--no-photos');

function getBuf(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (md-election sso-fetch)', Accept: 'image/*' } }, res => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(res.statusCode + ' ' + url)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject).setTimeout(45000, function () { this.destroy(new Error('timeout ' + url)); });
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('• ดึงทั้งประเทศ + 77 จังหวัด');
  const data = await sso.build({ raw: true });
  const raw = data._raw; delete data._raw;

  // รูปผู้สมัคร: ขอผ่าน endpoint รูปของ Dashboard (ไม่ใช้ path ต้นทางที่มีเลขบัตร) → ชื่อไฟล์ตามฝ่าย+เบอร์
  const photos = { e: {}, i: {} };
  if (!fs.existsSync(PHOTO_DIR)) fs.mkdirSync(PHOTO_DIR);
  let got = 0, miss = 0;
  for (const [s, side] of [['e', 'employer'], ['i', 'employee']]) {
    for (const c of raw[s]) {
      if (!c.pic) continue;
      const fp = path.join(PHOTO_DIR, s + '-' + c.no + '.jpg');
      if (!fs.existsSync(fp) && WANT_PHOTOS) {
        try {
          const buf = await getBuf(sso.API + '/image/' + side + '/' + c.id);
          if (buf[0] !== 0xFF || buf[1] !== 0xD8) throw new Error('ไม่ใช่ JPEG');
          fs.writeFileSync(fp, buf); got++;
          await sleep(120);
        } catch (e) { miss++; console.warn('  รูปไม่ได้', path.basename(fp), e.message); }
      }
      if (fs.existsSync(fp)) photos[s][c.no] = 1;
    }
  }
  data.photos = photos;

  const head = '/* ผลนับคะแนนเลือกตั้งคณะกรรมการประกันสังคม 2569 (อย่างไม่เป็นทางการ) — สร้างโดย sso-fetch.js ห้ามแก้มือ\n' +
    '   ต้นทาง: สำนักงานประกันสังคม ' + data.source + '\n' +
    '   ข้อมูล ณ ' + data.asof + ' · employer/employee เรียงตามคะแนนรวมประเทศ · provinces[ชื่อ].se/.si = คะแนนรายจังหวัดตามลำดับเดียวกัน\n' +
    '   photos = รายการรูปที่มีใน sso-photos/ (หน้าเว็บใช้ชุดนี้ต่อ แม้ข้อมูลสดจาก /api/sso จะไม่มีฟิลด์นี้) */\n';
  fs.writeFileSync(OUT, head + 'window.SSO=' + JSON.stringify(data) + ';\n');
  const n = data.nation;
  console.log('✓ เขียน', path.basename(OUT), (fs.statSync(OUT).size / 1024).toFixed(0) + 'KB · ข้อมูล ณ', data.asof);
  console.log('  นับแล้ว', n.stRep + '/' + n.stAll, 'หน่วย · ผู้มาใช้สิทธิ', n.voted.toLocaleString(), '/', n.reg.toLocaleString());
  console.log('  รูป: ใหม่', got, '· ไม่ได้', miss, '· รวม e', Object.keys(photos.e).length, 'i', Object.keys(photos.i).length);
})().catch(e => { console.error('✗', e.message); process.exit(1); });
