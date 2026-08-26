/* tools-verify-mp-photos.js — สืบและ "พิสูจน์" ที่มาของรูป ส.ส. ในโฟลเดอร์ photos/
   ────────────────────────────────────────────────────────────────────────
   หลักการ: ห้ามให้เครดิตจากการเดา ต้องมีหลักฐานว่ารูปในเครื่อง = รูปบนคอมมอนส์จริง
   ระดับหลักฐานที่ยอมรับ (เรียงจากแน่นอนที่สุด):
     1) sha1 ตรงกัน        → ไฟล์เดียวกันแบบไบต์ต่อไบต์   = ยืนยัน
     2) ขนาดภาพตรงกันเป๊ะ  → ไฟล์เดียวกันแต่แปลงนามสกุล    = ยืนยัน
     3) นอกนั้น            → บันทึกเป็น "ยังไม่ยืนยัน" พร้อมชื่อไฟล์ที่สงสัย ให้คนตรวจต่อ

   รัน:  node "tools-verify-mp-photos.js"
*/
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR = path.join(__dirname, 'photos');
const UA = { headers: { 'User-Agent': 'RatthaiKaonaSite/1.0 (educational; nuttapat.chuajeen@gmail.com)' } };
const stripTags = s => (s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- ตัดคำนำหน้า (ชุดเดียวกับ photomatch.js) ---------- */
const TITLES = ['นางสาว','นาง','นาย',
 'ว่าที่ร้อยตรีหญิง','ว่าที่ร้อยตรี','ว่าที่ร้อยโท','ว่าที่ร้อยเอก','ว่าที่พันตรี','ว่าที่',
 'จ่าสิบเอก','จ่าสิบโท','จ่าสิบตรี','จ่าอากาศเอก','จ่าอากาศโท','จ่าอากาศตรี','จ่าเอก','จ่าโท','จ่าตรี','สิบเอก','สิบโท','สิบตรี',
 'พลตำรวจเอก','พลตำรวจโท','พลตำรวจตรี','พันตำรวจเอก','พันตำรวจโท','พันตำรวจตรี','ร้อยตำรวจเอก','ร้อยตำรวจโท','ร้อยตำรวจตรี','ดาบตำรวจ','สิบตำรวจเอก','สิบตำรวจโท','พลตำรวจ',
 'พลอากาศเอก','พลอากาศโท','พลอากาศตรี','พลเรือเอก','พลเรือโท','พลเรือตรี','พลเอก','พลโท','พลตรี',
 'นาวาอากาศเอก','นาวาอากาศโท','นาวาอากาศตรี','นาวาเอก','นาวาโท','นาวาตรี','เรืออากาศเอก','เรือเอก','เรือโท','เรือตรี',
 'พันเอก','พันโท','พันตรี','ร้อยเอก','ร้อยโท','ร้อยตรี',
 'ศาสตราจารย์พิเศษ','รองศาสตราจารย์','ผู้ช่วยศาสตราจารย์','ศาสตราจารย์',
 'นายแพทย์','แพทย์หญิง','ทันตแพทย์','เภสัชกรหญิง','เภสัชกร','ดอกเตอร์','ดร.','ดร'
].sort((a, b) => b.length - a.length);

function stripTitles(s) {
  s = s.trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const t of TITLES) {
      if (s.startsWith(t)) { s = s.slice(t.length).replace(/^[\s_]+/, ''); changed = true; break; }
    }
  }
  return s;
}

/* ---------- อ่านขนาดภาพจากส่วนหัวไฟล์ (ไม่ต้องพึ่งไลบรารีนอก) ---------- */
function imageSize(buf) {
  // PNG
  if (buf.length > 24 && buf.toString('ascii', 1, 4) === 'PNG')
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };

  // WEBP  (RIFF....WEBP)
  if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const c = buf.toString('ascii', 12, 16);
    if (c === 'VP8 ')  return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    if (c === 'VP8L') { const b = buf.readUInt32LE(21);
                        return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 }; }
    if (c === 'VP8X')  return { w: (buf.readUIntLE(24, 3) & 0xffffff) + 1, h: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
  }

  // JPEG — ไล่หา marker SOF
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      if (m === 0xd8 || (m >= 0xd0 && m <= 0xd9)) { i += 2; continue; }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

/* ---------- เรียก MediaWiki API เป็นชุด ---------- */
async function apiBatch(base, params, titles, per = 20, label = '') {
  const out = {};
  for (let i = 0; i < titles.length; i += per) {
    const batch = titles.slice(i, i + per);
    const url = base + '?' + params + '&titles=' + encodeURIComponent(batch.join('|'));
    try {
      const j = await (await fetch(url, UA)).json();
      if (j.query) {
        out.pages = Object.assign(out.pages || {}, j.query.pages || {});
        out.normalized = (out.normalized || []).concat(j.query.normalized || []);
        out.redirects  = (out.redirects  || []).concat(j.query.redirects  || []);
      }
    } catch (e) { console.error('\n  ! ข้ามชุดที่ ' + i + ':', e.message); }
    process.stdout.write(`  ${label} ${Math.min(i + per, titles.length)}/${titles.length}\r`);
    await sleep(300);
  }
  return out;
}

/* ---------- main ---------- */
(async () => {
  const files = fs.readdirSync(DIR).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
  console.log(`โฟลเดอร์ photos/ : ${files.length} ไฟล์\n`);

  // ชื่อคน -> ไฟล์ในเครื่อง
  const name2file = {};
  files.forEach(f => {
    const stem = f.replace(/\.(png|jpe?g|webp)$/i, '').replace(/_+/g, ' ').trim();
    name2file[stripTitles(stem)] = f;
  });
  const names = Object.keys(name2file);
  console.log(`ชื่อหลังตัดคำนำหน้า : ${names.length}\n`);

  // 1) ชื่อคน -> ไฟล์ภาพหลักบนวิกิพีเดียไทย
  console.log('ขั้นที่ 1 — หาไฟล์ภาพหลักจากวิกิพีเดียไทย');
  const q1 = await apiBatch('https://th.wikipedia.org/w/api.php',
    'action=query&redirects=1&prop=pageimages&piprop=name&format=json', names, 20, 'ค้นหา');
  console.log('');

  const back = {};                       // ชื่อที่ API คืนมา -> ชื่อที่เราส่งไป
  (q1.normalized || []).forEach(n => back[n.to] = n.from);
  (q1.redirects  || []).forEach(n => back[n.to] = back[n.from] || n.from);

  const name2commons = {};
  Object.values(q1.pages || {}).forEach(p => {
    if (!p.pageimage) return;
    let orig = p.title;
    for (let k = 0; k < 4 && back[orig]; k++) orig = back[orig];
    if (name2file[orig]) name2commons[orig] = p.pageimage;
  });
  console.log(`  พบภาพหลักบนวิกิพีเดีย : ${Object.keys(name2commons).length}/${names.length}\n`);

  // 2) ไฟล์บนคอมมอนส์ -> sha1 / ขนาด / สัญญาอนุญาต
  console.log('ขั้นที่ 2 — ดึง sha1 + ขนาด + สัญญาอนุญาตจากคอมมอนส์');
  const titles = [...new Set(Object.values(name2commons))].map(t => 'File:' + t);
  const q2 = await apiBatch('https://commons.wikimedia.org/w/api.php',
    'action=query&format=json&prop=imageinfo&iiprop=sha1|size|url|extmetadata', titles, 20, 'ดึงข้อมูล');
  console.log('');

  const meta = {};
  Object.values(q2.pages || {}).forEach(p => {
    if (!p.imageinfo) return;
    const ii = p.imageinfo[0], m = ii.extmetadata || {};
    meta[p.title.replace(/^File:/, '')] = {
      sha1: ii.sha1, w: ii.width, h: ii.height,
      artist: stripTags(m.Artist && m.Artist.value) || 'ไม่ระบุ',
      license: (m.LicenseShortName && m.LicenseShortName.value) || 'ดูที่วิกิมีเดียคอมมอนส์',
      licenseUrl: (m.LicenseUrl && m.LicenseUrl.value) || '',
      source: ii.descriptionurl || ''
    };
  });

  // 3) พิสูจน์ทีละไฟล์
  console.log('ขั้นที่ 3 — เทียบไฟล์ในเครื่องกับต้นฉบับ\n');
  const out = {};
  const tallies = { sha1: 0, dim: 0, nomatch: 0, nopage: 0 };

  for (const person of names) {
    const local = name2file[person];
    const commonsName = name2commons[person];
    const base = { name: person, file: local };

    if (!commonsName || !meta[commonsName.replace(/_/g, ' ')] && !meta[commonsName]) {
      out[local] = { ...base, artist: 'ไม่ทราบ', license: 'ยังไม่ยืนยัน', licenseUrl: '', source: '',
                     evidence: 'ไม่พบภาพของบุคคลนี้บนวิกิพีเดีย' };
      tallies.nopage++; continue;
    }
    const m = meta[commonsName.replace(/_/g, ' ')] || meta[commonsName];

    const buf = fs.readFileSync(path.join(DIR, local));
    const sha1 = crypto.createHash('sha1').update(buf).digest('hex');
    const dim = imageSize(buf);

    if (sha1 === m.sha1) {
      out[local] = { ...base, artist: m.artist, license: m.license, licenseUrl: m.licenseUrl,
                     source: m.source, commonsFile: commonsName, evidence: 'sha1 ตรงกับต้นฉบับ' };
      tallies.sha1++;
    } else if (dim && dim.w === m.w && dim.h === m.h) {
      out[local] = { ...base, artist: m.artist, license: m.license, licenseUrl: m.licenseUrl,
                     source: m.source, commonsFile: commonsName,
                     evidence: `ขนาดภาพตรงกับต้นฉบับ (${dim.w}×${dim.h})` };
      tallies.dim++;
    } else {
      out[local] = { ...base, artist: 'ไม่ทราบ', license: 'ยังไม่ยืนยัน', licenseUrl: '', source: '',
                     candidate: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(commonsName),
                     evidence: `ไม่ตรงกับภาพบนวิกิพีเดีย (ในเครื่อง ${dim ? dim.w + '×' + dim.h : '?'} · ต้นฉบับ ${m.w}×${m.h})` };
      tallies.nomatch++;
    }
  }

  fs.writeFileSync(path.join(DIR, 'credits.json'), JSON.stringify(out, null, 1));

  const ok = tallies.sha1 + tallies.dim;
  console.log('─'.repeat(52));
  console.log(`  ยืนยันได้ — sha1 ตรง          : ${tallies.sha1}`);
  console.log(`  ยืนยันได้ — ขนาดภาพตรง        : ${tallies.dim}`);
  console.log(`  ยังไม่ยืนยัน — คนละภาพ        : ${tallies.nomatch}`);
  console.log(`  ยังไม่ยืนยัน — ไม่มีบนวิกิ    : ${tallies.nopage}`);
  console.log('─'.repeat(52));
  console.log(`  รวมยืนยันได้ ${ok}/${names.length} (${(ok / names.length * 100).toFixed(1)}%)`);
  console.log(`\nเขียน photos/credits.json แล้ว`);
})();
