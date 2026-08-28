/* tools-photo-coverage.js — นับว่าแต่ละปีมีรูป ส.ส. แล้วกี่คน
   ใช้ตัวเทียบชื่อชุดเดียวกับ photoOf() ใน index.html (คีย์ตรง → ไม่ตรงค่อยตัดคำนำหน้า)
   รัน: node tools-photo-coverage.js
*/
const fs = require('fs'), path = require('path'), vm = require('vm');
const DIR = __dirname;
const bare = s => (s || '')
  .replace(/^(นางสาว|นาง|นาย|ว่าที่ร้อยตรีหญิง|ว่าที่ร้อยตรี|ว่าที่|ดร\.|ผศ\.|รศ\.|ศ\.|พล[^ ]*|พ\.[^ ]*|ร\.[^ ]*|น\.[^ ]*|จ\.[^ ]*)\s*/, '')
  .replace(/\s+/g, ' ').trim();
const loadGlobal = f => { const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(DIR, f), 'utf8'), c); return c.window; };

const PHOTOS = loadGlobal('index-photos.js').PHOTOS;
const have = new Set(Object.keys(PHOTOS).map(bare));
const years = fs.readdirSync(DIR).filter(f => /^year-\d+b?\.js$/.test(f))
  .sort((a, b) => a.replace(/\D/g, '') - b.replace(/\D/g, ''));

console.log('ปี\tส.ส.เขต\tมีรูป\t%');
for (const f of years) {
  let d = loadGlobal(f).DATA;
  if (!Array.isArray(d)) d = [].concat(...Object.values(d));
  const names = [...new Set(d.map(r => bare(r.name)).filter(Boolean))];
  const hit = names.filter(n => have.has(n)).length;
  console.log(f.replace(/\D/g, '') + (/b\.js$/.test(f) ? 'b' : '') + '\t' + names.length + '\t' + hit + '\t' + (100 * hit / names.length).toFixed(0) + '%');
}
console.log('รวมรูปในคลัง window.PHOTOS = ' + Object.keys(PHOTOS).length + ' ชื่อ');
