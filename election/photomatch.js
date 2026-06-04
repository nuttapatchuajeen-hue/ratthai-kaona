// photomatch.js — match MP names to photo files (title-aware + fuzzy on first/last name)
const fs = require('fs');
const path = require('path');
const PHOTO_DIR = path.join(__dirname, '..', 'รูปส.ส 500 คน พ.ศ 2569 md');

const all = JSON.parse(fs.readFileSync(path.join(__dirname, 'prep.json'), 'utf8'));
const files = fs.readdirSync(PHOTO_DIR).filter(f => /\.(png|jpe?g|webp)$/i.test(f));

const TITLES = ['นางสาว','นาง','นาย',
 'ว่าที่ร้อยตรีหญิง','ว่าที่ร้อยตรี','ว่าที่ร้อยโท','ว่าที่ร้อยเอก','ว่าที่พันตรี','ว่าที่',
 'จ่าสิบเอก','จ่าสิบโท','จ่าสิบตรี','จ่าเอก','จ่าโท','จ่าตรี','สิบเอก','สิบโท','สิบตรี',
 'พลตำรวจเอก','พลตำรวจโท','พลตำรวจตรี','พันตำรวจเอก','พันตำรวจโท','พันตำรวจตรี','ร้อยตำรวจเอก','ร้อยตำรวจโท','ร้อยตำรวจตรี','ดาบตำรวจ','สิบตำรวจเอก','สิบตำรวจโท','พลตำรวจ',
 'พลอากาศเอก','พลอากาศโท','พลอากาศตรี','พลเรือเอก','พลเรือโท','พลเรือตรี','พลเอก','พลโท','พลตรี',
 'นาวาอากาศเอก','นาวาอากาศโท','นาวาอากาศตรี','นาวาเอก','นาวาโท','นาวาตรี','เรืออากาศเอก','เรือเอก','เรือโท','เรือตรี',
 'พันเอก','พันโท','พันตรี','ร้อยเอก','ร้อยโท','ร้อยตรี',
 'ศาสตราจารย์พิเศษ','รองศาสตราจารย์','ผู้ช่วยศาสตราจารย์','ศาสตราจารย์',
 'นายแพทย์','แพทย์หญิง','ทันตแพทย์','เภสัชกรหญิง','เภสัชกร','ดอกเตอร์','ดร.','ดร'
].sort((a,b)=>b.length-a.length);

const nfc = s => s.normalize('NFC');
function stripTitles(s){ // strip leading titles repeatedly
  s = s.trim();
  let changed = true;
  while (changed){ changed = false;
    for (const t of TITLES){ if (s.startsWith(t)){ s = s.slice(t.length).replace(/^[\s_]+/,''); changed = true; break; } }
  }
  return s;
}
const squash = s => nfc(s).replace(/[\s_​.\-]/g,'');         // remove all separators
const keyGlued = s => squash(stripTitles(nfc(s).replace(/_/g,' ')));  // title-stripped, separators removed

// tokens (first..last) after removing titles
function tokens(name){
  const parts = nfc(name).split(/[\s_]+/).filter(Boolean);
  // strip leading title tokens AND title glued to first token
  let i = 0;
  // glued title on first token:
  if (parts.length) parts[0] = stripTitles(parts[0]) || parts[0];
  while (i < parts.length && TITLES.includes(parts[i])) i++;
  const rest = parts.slice(i).filter(Boolean);
  return rest;
}

// index photos
const byGlued = {}; const photoTokens = {};
for (const f of files){
  const base = f.replace(/\.(png|jpe?g|webp)$/i,'');
  byGlued[keyGlued(base)] = byGlued[keyGlued(base)] || f;
  photoTokens[f] = tokens(base);
}

const map = {}; const used = new Set();
const sigOf = r => r.type+'|'+r.prov+'|'+r.no+'|'+r.name;
const unmatched = [];
for (const r of all.records){
  const g = keyGlued(r.name);
  let f = byGlued[g];
  if (f && !used.has(f)){ map[sigOf(r)] = f; used.add(f); continue; }
  unmatched.push(r);
}
// fuzzy pass: lastname match + firstname overlap, against unused photos
const unusedFiles = files.filter(f => !used.has(f));
for (const r of unmatched.slice()){
  const et = tokens(r.name); if (et.length < 2) continue;
  const eFirst = et[0], eLast = et[et.length-1];
  let best = null;
  for (const f of unusedFiles){
    if (used.has(f)) continue;
    const pt = photoTokens[f]; if (pt.length < 2) continue;
    const pLast = pt[pt.length-1];
    if (pLast !== eLast) continue;
    if (pt.includes(eFirst) || et.includes(pt[0])){ best = f; break; }
  }
  if (best){ map[sigOf(r)] = best; used.add(best); unmatched.splice(unmatched.indexOf(r),1); }
}

// tier 3: unique surname (last token) match among remaining unused photos
const lastIndex = {};
files.filter(f=>!used.has(f)).forEach(f=>{const pt=photoTokens[f];if(pt.length){const l=pt[pt.length-1];(lastIndex[l]=lastIndex[l]||[]).push(f);}});
for (const r of unmatched.slice()){
  const et=tokens(r.name); if(et.length<2) continue;
  const cands=(lastIndex[et[et.length-1]]||[]).filter(f=>!used.has(f));
  if(cands.length===1){ map[sigOf(r)]=cands[0]; used.add(cands[0]); }
}

const zone = all.records.filter(r=>r.type==='แบ่งเขต');
const list = all.records.filter(r=>r.type==='บัญชีรายชื่อ');
const zoneM = zone.filter(r=>map[sigOf(r)]).length;
const listM = list.filter(r=>map[sigOf(r)]).length;
console.log('photo files:', files.length);
console.log('MATCHED:', Object.keys(map).length, '/ 500   (เขต', zoneM+'/'+zone.length+', บัญชี', listM+'/'+list.length+')');
console.log('unused photos:', files.length - used.size);
files.filter(f=>!used.has(f)).forEach(f=>console.log('   unused:', f));
fs.writeFileSync(path.join(__dirname,'photomap.json'), JSON.stringify(map));
console.log('wrote photomap.json');
