// addphotos.js — copy matched photos into เลือกตั้ง69/photos/ and inject window.PHOTOS into pages
const fs = require('fs');
const path = require('path');
const SITE = path.join(__dirname, '..', 'เลือกตั้ง69');
const PHOTO_DIR = path.join(__dirname, '..', 'รูปส.ส 500 คน พ.ศ 2569 md');

const map = JSON.parse(fs.readFileSync(path.join(__dirname, 'photomap.json'), 'utf8')); // sig -> filename
const all = JSON.parse(fs.readFileSync(path.join(__dirname, 'prep.json'), 'utf8'));

const nameToFile = {};
for (const r of all.records) {
  const sig = r.type + '|' + r.prov + '|' + r.no + '|' + r.name;
  if (map[sig]) nameToFile[r.name] = map[sig];
}

// copy photos
const outDir = path.join(SITE, 'photos');
fs.mkdirSync(outDir, { recursive: true });
const uniq = [...new Set(Object.values(nameToFile))];
let copied = 0;
for (const f of uniq) {
  try { fs.copyFileSync(path.join(PHOTO_DIR, f), path.join(outDir, f)); copied++; }
  catch (e) { console.warn('copy fail:', f, e.message); }
}

// inject PHOTOS global into pages (idempotent)
const blob = '<script>window.PHOTOS=' + JSON.stringify(nameToFile) + ';</script>';
for (const page of ['index.html', 'partylist.html']) {
  const fp = path.join(SITE, page);
  let html = fs.readFileSync(fp, 'utf8');
  html = html.replace(/<script>window\.PHOTOS=[\s\S]*?<\/script>\s*/, '');   // strip old
  html = html.replace('<script>window.DATA = ', blob + '\n<script>window.DATA = ');
  fs.writeFileSync(fp, html);
}
console.log('copied', copied, 'photos to เลือกตั้ง69/photos/');
console.log('injected window.PHOTOS with', Object.keys(nameToFile).length, 'names into index.html + partylist.html');
