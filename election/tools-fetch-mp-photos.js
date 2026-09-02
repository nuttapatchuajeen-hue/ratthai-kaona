/* tools-fetch-mp-photos.js — ไล่หารูป ส.ส. ปีย้อนหลัง (2539–2569) จากวิกิพีเดียไทย + คอมมอนส์
   ────────────────────────────────────────────────────────────────────────
   ทำอะไร
     1) รวบรวมชื่อ ส.ส. ผู้ชนะรายเขตทุกปีใน YEARS ที่ "ยังไม่มีรูป" ใน photos/
     2) ถามวิกิพีเดียไทยทีละ 50 ชื่อ (prop=pageimages|categories) → ได้ชื่อไฟล์รูปประจำบทความ
        ชื่อที่หาไม่เจอ → ยิง list=search อีกรอบ แล้วรับเฉพาะหัวข้อที่ชื่อ "ตรงเป๊ะ" หลังตัดคำนำหน้า
     3) กรองด้วยหมวดหมู่ ต้องเป็นบทความนักการเมือง (กันคนชื่อซ้ำ เช่น นักร้อง/นักกีฬา)
     4) ขอ imageinfo (url ย่อ 500px + extmetadata) → ดาวน์โหลด
     5) เขียนเครดิตลง photos/credits.json และรวม window.PHOTOS ใหม่ลง index-photos.js

   สำคัญ: imagerepository ของไฟล์บอกว่าเป็น
     "shared" = คอมมอนส์ (สัญญาอนุญาตเสรี ใช้ได้เลย)  → ลง photos/ และเข้า window.PHOTOS
     "local"  = ไฟล์อัปในวิกิพีเดียไทยเอง มักเป็น non-free → ลง photos-review/ ไว้รอตรวจ ยังไม่ใช้ในเว็บ

   รัน:  node tools-fetch-mp-photos.js            (ค้น + ดาวน์โหลด + เขียนไฟล์)
         node tools-fetch-mp-photos.js --dry      (ค้นอย่างเดียว รายงานผล ไม่แตะไฟล์)
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DRY = process.argv.includes('--dry');
const DIR = __dirname;
const PHOTO_DIR = path.join(DIR, 'photos');
const REVIEW_DIR = path.join(DIR, 'photos-review');
const YEARS = [2539, 2544, 2548, 2550, 2554, 2562, 2566, 2569];
const UA = { 'User-Agent': 'RatthaiKaonaSite/1.0 (educational; nuttapat.chuajeen@gmail.com)' };
const TH = 'https://th.wikipedia.org/w/api.php';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const stripTags = s => (s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

/* ---------- ตัดคำนำหน้า (ชุดเดียวกับ photoOf ใน index.html) ---------- */
const bare = s => (s || '')
  .replace(/^(นางสาว|นาง|นาย|ว่าที่ร้อยตรีหญิง|ว่าที่ร้อยตรี|ว่าที่|ดร\.|ผศ\.|รศ\.|ศ\.|พล[^ ]*|พ\.[^ ]*|ร\.[^ ]*|น\.[^ ]*|จ\.[^ ]*)\s*/, '')
  .replace(/\s+/g, ' ').trim();

function loadGlobal(file) {
  const c = { window: {} }; vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(DIR, file), 'utf8'), c);
  return c.window;
}

/* ---------- helper: เรียก API ---------- */
async function api(params, tries = 3) {
  const qs = new URLSearchParams({ format: 'json', formatversion: '2', ...params });
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(TH + '?' + qs, { headers: UA });
      if (res.status === 429) { await sleep(3000 * (i + 1)); continue; }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) { console.warn('\n  api fail:', e.message); return null; }
      await sleep(1200 * (i + 1));
    }
  }
  return null;
}
const fileKey = t => String(t).replace(/^[^:]+:/, '').replace(/_/g, ' ').trim();

/* upload.wikimedia.org ตอบ 429 ถ้ายิงถี่เกิน → ถอยแล้วลองใหม่ (รอ 3/8/15/25 วินาที) */
async function download(url, tries = 5) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA });
      if (res.status === 429 || res.status >= 500) throw new Error('HTTP ' + res.status);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep([3000, 8000, 15000, 25000][i] || 25000);
    }
  }
}

const chunk = (a, n) => { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; };

/* หมวดหมู่ที่ยืนยันว่าเป็นบทความนักการเมืองคนนี้จริง */
const POL = /นักการเมือง|สมาชิกสภาผู้แทนราษฎร|ส\.ส\.|รัฐมนตรี|นายกรัฐมนตรี|พรรค|ผู้ว่าราชการ|วุฒิสภา/;
const isDab = cats => cats.some(c => /การแก้ความกำกวม/.test(c));

/* ถามทีละ 50 ชื่อ: มีบทความไหม + มีรูปประจำบทความไหม + หมวดหมู่ */
async function queryTitles(list, label) {
  const out = new Map();
  const batches = chunk(list, 50);
  for (const [bi, batch] of batches.entries()) {
    let cont = {}; const pages = new Map(), norm = new Map(), redir = new Map();
    for (let guard = 0; guard < 12; guard++) {
      const j = await api({
        action: 'query', titles: batch.join('|'), redirects: '1',
        prop: 'pageimages|categories', piprop: 'name', cllimit: 'max', clshow: '!hidden', ...cont
      });
      if (!j || !j.query) break;
      (j.query.normalized || []).forEach(n => norm.set(n.to, n.from));
      (j.query.redirects || []).forEach(r => redir.set(r.to, r.from));
      for (const p of j.query.pages || []) {
        const cur = pages.get(p.title) || { title: p.title, missing: !!p.missing, pageimage: null, cats: [] };
        if (p.pageimage) cur.pageimage = p.pageimage;
        (p.categories || []).forEach(c => cur.cats.push(c.title));
        pages.set(p.title, cur);
      }
      if (j.continue) cont = j.continue; else break;
    }
    /* map ผลกลับไปหา "ชื่อที่ขอ" ผ่าน redirect / normalize */
    for (const [title, inf] of pages) {
      let req = title;
      if (redir.has(req)) req = redir.get(req);
      if (norm.has(req)) req = norm.get(req);
      out.set(req, inf);
      out.set(title, inf);
    }
    process.stdout.write('\r  ' + label + ' ' + Math.min((bi + 1) * 50, list.length) + '/' + list.length + '   ');
    await sleep(150);
  }
  console.log('');
  return out;
}

/* รันซ้ำได้ปลอดภัย: ทุกรอบจะอ่าน index-photos.js ปัจจุบันก่อน แล้วไล่เฉพาะคนที่ยังไม่มีรูป
   (รอบก่อนโดน 429 ตกไปกี่คน รอบใหม่จะเก็บให้ครบเอง) */
async function main() {
  /* ---------- 1) ชื่อที่ยังไม่มีรูป ---------- */
  const PHOTOS = loadGlobal('index-photos.js').PHOTOS;
  const have = new Set(Object.keys(PHOTOS).map(bare));
  const targets = new Map();                      // ชื่อ (ตัดคำนำหน้า) -> ปีที่เป็น ส.ส.
  for (const y of YEARS) {
    let d = loadGlobal('year-' + y + '.js').DATA;
    if (!Array.isArray(d)) d = [].concat(...Object.values(d));
    for (const r of d) {
      const b = bare(r.name);
      if (!b || have.has(b)) continue;
      if (!targets.has(b)) targets.set(b, []);
      if (!targets.get(b).includes(y)) targets.get(b).push(y);
    }
  }
  const names = [...targets.keys()];
  console.log('ชื่อ ส.ส. ที่ยังไม่มีรูป (' + YEARS[0] + '–' + YEARS[YEARS.length - 1] + '): ' + names.length + ' คน');

  /* ---------- 2) หาบทความตรงชื่อ ---------- */
  const info = await queryTitles(names, 'ถามบทความ');

  /* ---------- 2b) ที่ยังไม่เจอ → list=search แล้วรับเฉพาะชื่อตรงเป๊ะ ---------- */
  const notFound = names.filter(n => !info.has(n) || info.get(n).missing);
  console.log('หาบทความตรงชื่อไม่เจอ ' + notFound.length + ' คน → ลองค้นหาอีกรอบ');
  const searchHit = new Map();
  for (const [i, n] of notFound.entries()) {
    const j = await api({ action: 'query', list: 'search', srsearch: n, srlimit: '5', srnamespace: '0' });
    for (const h of (j && j.query && j.query.search) || []) {
      const t = h.title.replace(/\s*\([^)]*\)\s*$/, '');
      if (bare(t) === n) { searchHit.set(n, h.title); break; }
    }
    if (i % 25 === 0) process.stdout.write('\r  ค้นหา ' + i + '/' + notFound.length + ' (เจอ ' + searchHit.size + ')   ');
    await sleep(120);
  }
  console.log('\r  ค้นหาเจอเพิ่ม ' + searchHit.size + ' คน                    ');
  if (searchHit.size) {
    const more = await queryTitles([...new Set(searchHit.values())], 'ถามบทความรอบสอง');
    for (const [n, t] of searchHit) if (more.has(t)) info.set(n, more.get(t));
  }

  /* ---------- 3) กรอง ---------- */
  const wanted = [];
  let noArticle = 0, noImage = 0, notPolitician = 0;
  for (const n of names) {
    const p = info.get(n);
    if (!p || p.missing) { noArticle++; continue; }
    if (!p.pageimage) { noImage++; continue; }
    if (isDab(p.cats) || !p.cats.some(c => POL.test(c))) { notPolitician++; continue; }
    wanted.push({ name: n, title: p.title, file: 'File:' + p.pageimage, years: targets.get(n) });
  }
  console.log('สรุปการค้น: มีรูปให้โหลด ' + wanted.length + ' · ไม่มีบทความ ' + noArticle +
    ' · บทความไม่มีรูป ' + noImage + ' · ไม่ใช่หน้านักการเมือง ' + notPolitician);
  if (!wanted.length) return;

  /* ---------- 4) imageinfo ---------- */
  const meta = new Map();
  const files = [...new Set(wanted.map(w => w.file))];
  for (const [bi, batch] of chunk(files, 50).entries()) {
    const j = await api({
      action: 'query', titles: batch.join('|'),
      prop: 'imageinfo', iiprop: 'url|extmetadata|mime|size|sha1', iiurlwidth: '500'
    });
    for (const p of (j && j.query && j.query.pages) || []) {
      const ii = p.imageinfo && p.imageinfo[0]; if (!ii) continue;
      const em = ii.extmetadata || {};
      /* วิกิไทยคืนชื่อไฟล์เป็น "ไฟล์:xxx yyy.jpg" (ไม่ใช่ "File:xxx_yyy.jpg")
         → คีย์ = ชื่อไฟล์ล้วน เปลี่ยน _ เป็นช่องว่าง ให้ตรงกันทั้งสองฝั่ง */
      meta.set(fileKey(p.title), {
        repo: p.imagerepository,
        url: ii.thumburl || ii.url, mime: ii.mime, sha1: ii.sha1,
        artist: stripTags(em.Artist && em.Artist.value) || 'ไม่ทราบ',
        license: stripTags(em.LicenseShortName && em.LicenseShortName.value) ||
                 stripTags(em.UsageTerms && em.UsageTerms.value) || 'ไม่ทราบ',
        licenseUrl: stripTags(em.LicenseUrl && em.LicenseUrl.value) || '',
        descUrl: ii.descriptionurl || ''
      });
    }
    process.stdout.write('\r  ขอข้อมูลไฟล์ ' + Math.min((bi + 1) * 50, files.length) + '/' + files.length + '   ');
    await sleep(150);
  }
  console.log('');

  /* ---------- 5) ดาวน์โหลด ---------- */
  const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.png' };
  const safe = s => s.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '__');
  const creditsPath = path.join(PHOTO_DIR, 'credits.json');
  const credits = JSON.parse(fs.readFileSync(creditsPath, 'utf8'));
  const reviewPath = path.join(REVIEW_DIR, 'credits.json');
  const reviewCredits = fs.existsSync(reviewPath) ? JSON.parse(fs.readFileSync(reviewPath, 'utf8')) : {};
  const added = {};
  let okFree = 0, okReview = 0, fail = 0;
  if (!DRY) { fs.mkdirSync(PHOTO_DIR, { recursive: true }); fs.mkdirSync(REVIEW_DIR, { recursive: true }); }

  for (const [i, w] of wanted.entries()) {
    const m = meta.get(fileKey(w.file));
    if (!m || !m.url) { fail++; continue; }
    const free = m.repo === 'shared';
    const fname = safe(w.name) + (EXT[m.mime] || '.jpg');
    const entry = {
      name: w.name, file: fname,
      artist: m.artist, license: m.license, licenseUrl: m.licenseUrl,
      source: m.descUrl, sha1: m.sha1,
      repo: free ? 'wikimedia commons' : 'วิกิพีเดียไทย (ไฟล์ท้องถิ่น)',
      article: 'https://th.wikipedia.org/wiki/' + encodeURIComponent(w.title.replace(/ /g, '_')),
      years: w.years,
      evidence: free ? 'ดาวน์โหลดจากคอมมอนส์ผ่าน API (imagerepository=shared)'
                     : 'ไฟล์อัปโหลดในวิกิพีเดียไทย อาจไม่ใช่สัญญาอนุญาตเสรี — รอตรวจก่อนใช้'
    };
    if (DRY) { free ? okFree++ : okReview++; continue; }
    try {
      const buf = await download(m.url);
      fs.writeFileSync(path.join(free ? PHOTO_DIR : REVIEW_DIR, fname), buf);
      if (free) { credits[fname] = entry; added[w.name] = fname; okFree++; }
      else { reviewCredits[fname] = entry; okReview++; }
    } catch (e) { fail++; console.warn('\n  โหลดไม่ได้ ' + w.name + ': ' + e.message); }
    if (i % 10 === 0) process.stdout.write('\r  ดาวน์โหลด ' + i + '/' + wanted.length + ' (เสรี ' + okFree + ' · รอตรวจ ' + okReview + ')   ');
    await sleep(400);
  }
  console.log('\nดาวน์โหลดเสร็จ: คอมมอนส์(ใช้ได้เลย) ' + okFree + ' · วิกิไทยไฟล์ท้องถิ่น(รอตรวจ) ' + okReview + ' · พลาด ' + fail);

  /* ---------- 6) เขียน credits + index-photos.js ---------- */
  if (DRY) return;
  if (okFree) {
    fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 1), 'utf8');
    const merged = Object.assign({}, PHOTOS, added);
    fs.writeFileSync(path.join(DIR, 'index-photos.js'),
      '/* รูปผู้สมัคร ส.ส. รายเขต — window.PHOTOS (ย้ายออกจาก index.html 2026-07-13)\n' +
      '   เติมรูปปีย้อนหลัง 2539–2566 จากคอมมอนส์ด้วย tools-fetch-mp-photos.js */\n' +
      'window.PHOTOS=' + JSON.stringify(merged) + ';\n', 'utf8');
    console.log('เขียน index-photos.js: ' + Object.keys(PHOTOS).length + ' → ' + Object.keys(merged).length + ' ชื่อ');
  }
  if (okReview) {
    fs.writeFileSync(reviewPath, JSON.stringify(reviewCredits, null, 1), 'utf8');
    console.log('รูปรอตรวจลิขสิทธิ์อยู่ที่ photos-review/ (' + Object.keys(reviewCredits).length + ' ไฟล์) — ยังไม่ถูกใช้ในเว็บ');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
