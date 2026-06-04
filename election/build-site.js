// build-site.js — inject per-page data subsets into the 3 HTML files in ../เลือกตั้ง69/
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'เลือกตั้ง69');

const all = JSON.parse(fs.readFileSync(path.join(__dirname, 'prep.json'), 'utf8'));
const zone = all.records.filter(r => r.type === 'แบ่งเขต')
  .map(r => ({ prov: r.prov, no: r.no, name: r.name, code: r.code, votes: r.votes }));
const list = all.records.filter(r => r.type === 'บัญชีรายชื่อ')
  .map(r => ({ no: r.no, name: r.name, code: r.code }));

const data = {
  'index.html': { partyMeta: all.partyMeta, map: all.map, provStats: all.provStats,
                  provTh2En: all.provTh2En, provEn2Th: all.provEn2Th, zone },
  'partylist.html': { partyMeta: all.partyMeta, list },
  'standings.html': { partyMeta: all.partyMeta, seatTotals: all.seatTotals,
                      seatByType: all.seatByType, meta: all.meta },
};

const PH = '"@@DATA@@"';
for (const [file, obj] of Object.entries(data)) {
  const fp = path.join(OUT, file);
  let html = fs.readFileSync(fp, 'utf8');
  if (!html.includes(PH)) { console.log('SKIP (already built):', file); continue; }
  html = html.replace(PH, JSON.stringify(obj));
  fs.writeFileSync(fp, html);
  console.log('built', file, '·', (fs.statSync(fp).size / 1024).toFixed(1), 'KB');
}
console.log('done.');
