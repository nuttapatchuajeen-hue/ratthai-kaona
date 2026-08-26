/* tools-make-credits.js — สร้าง <โฟลเดอร์>/credits.json จากชื่อไฟล์ต้นฉบับบนวิกิมีเดียคอมมอนส์
   ใช้เฉพาะกับรูปที่ "รู้ชื่อไฟล์ต้นทางแน่นอน" เท่านั้น — ไม่เดา ไม่จับคู่แบบ fuzzy
   เพราะการให้เครดิตผิดคนแย่กว่าการไม่ให้เครดิต

   รัน:  node "tools-make-credits.js" leaders
*/
const fs = require('fs');
const path = require('path');

const UA = { headers: { 'User-Agent': 'RatthaiKaonaSite/1.0 (educational; nuttapat.chuajeen@gmail.com)' } };
const stripTags = s => (s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
// ชื่อไฟล์บางอันมีอักขระควบคุมทิศทาง (U+200E/200F/202A-202E) ติดมาจากการก๊อปชื่อจากหน้าเว็บ
// ถ้าไม่ล้างออก MediaWiki จะหาไฟล์ไม่เจอทั้งที่ไฟล์มีอยู่
const cleanTitle = s => (s || '').replace(/[‎‏‪-‮⁦-⁩]/g, '').trim();

/* ---------- แหล่งชื่อไฟล์ต้นทาง ---------- */
// leaders/ : intro-data.js เก็บ imgs = ชื่อไฟล์บนคอมมอนส์ไว้ตั้งแต่ตอนดาวน์โหลด
function leaderMap() {
  global.window = {};
  require('./intro-data.js');
  const I = window.INTRO, m = {};
  for (const y in I) {
    const d = I[y];
    if (!d.imgs) continue;
    for (const party in d.imgs) {
      const person = d.leaders && d.leaders[party];
      if (person) m[person] = cleanTitle(d.imgs[party]);
    }
  }
  return m;
}

const SOURCES = {
  leaders: { dir: 'leaders', map: leaderMap }
};

/* ---------- ดึง extmetadata จากคอมมอนส์ ---------- */
async function fetchMeta(fileTitles) {
  const meta = {};
  for (let i = 0; i < fileTitles.length; i += 20) {
    const batch = fileTitles.slice(i, i + 20).map(t => 'File:' + t);
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json'
      + '&prop=imageinfo&iiprop=extmetadata|url&titles=' + encodeURIComponent(batch.join('|'));
    const j = await (await fetch(url, UA)).json();
    const pages = (j.query && j.query.pages) || {};
    for (const id in pages) {
      const p = pages[id];
      if (!p.imageinfo) { meta[p.title] = null; continue; }   // ไม่มีไฟล์นี้บนคอมมอนส์
      const m = p.imageinfo[0].extmetadata || {};
      meta[p.title] = {
        artist: stripTags(m.Artist && m.Artist.value) || 'ไม่ระบุ',
        license: (m.LicenseShortName && m.LicenseShortName.value) || 'ดูที่วิกิมีเดียคอมมอนส์',
        licenseUrl: (m.LicenseUrl && m.LicenseUrl.value) || '',
        source: p.imageinfo[0].descriptionurl || ''
      };
    }
    process.stdout.write(`  ดึงข้อมูลแล้ว ${Math.min(i + 20, fileTitles.length)}/${fileTitles.length}\r`);
    await new Promise(r => setTimeout(r, 300));   // เกรงใจเซิร์ฟเวอร์คอมมอนส์
  }
  return meta;
}

/* ---------- main ---------- */
(async () => {
  const key = process.argv[2];
  const conf = SOURCES[key];
  if (!conf) { console.error('ใช้: node tools-make-credits.js ' + Object.keys(SOURCES).join('|')); process.exit(1); }

  const dir = path.join(__dirname, conf.dir);
  const name2commons = conf.map();
  const files = fs.readdirSync(dir).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
  console.log(`โฟลเดอร์ ${conf.dir}/ : ${files.length} ไฟล์`);

  // stem ของไฟล์ = ชื่อคน
  const wanted = {};   // ชื่อไฟล์บนคอมมอนส์ -> [ไฟล์ในเครื่อง...]
  const orphan = [];
  files.forEach(f => {
    const stem = f.replace(/\.(png|jpe?g|webp)$/i, '');
    const src = name2commons[stem];
    if (!src) { orphan.push(f); return; }
    (wanted[src] = wanted[src] || []).push(f);
  });

  const titles = Object.keys(wanted);
  console.log(`สืบที่มาได้ : ${titles.length} ไฟล์ต้นทาง · ไม่ทราบที่มา : ${orphan.length}`);

  const meta = await fetchMeta(titles);
  console.log('');

  const out = {};
  let ok = 0, miss = 0;
  titles.forEach(t => {
    const m = meta['File:' + t.replace(/_/g, ' ')] ?? meta['File:' + t];
    wanted[t].forEach(local => {
      const person = local.replace(/\.(png|jpe?g|webp)$/i, '');
      if (m) {
        out[local] = { name: person, ...m, commonsFile: t };
        ok++;
      } else {
        out[local] = {
          name: person, artist: 'ไม่ทราบ', license: 'ยังไม่ยืนยัน', licenseUrl: '',
          source: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(t), commonsFile: t
        };
        miss++;
      }
    });
  });
  orphan.forEach(f => {
    out[f] = {
      name: f.replace(/\.(png|jpe?g|webp)$/i, ''),
      artist: 'ไม่ทราบ', license: 'ยังไม่ยืนยัน — ต้องตรวจสอบก่อนเผยแพร่', licenseUrl: '', source: ''
    };
  });

  fs.writeFileSync(path.join(dir, 'credits.json'), JSON.stringify(out, null, 1));
  console.log(`เขียน ${conf.dir}/credits.json แล้ว — ยืนยันที่มา ${ok} · ยังไม่ยืนยัน ${miss + orphan.length}`);
})();
