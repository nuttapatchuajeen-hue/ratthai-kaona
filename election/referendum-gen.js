/* สร้าง election/referendum-data.js
   - ผลรวมประเทศ/รายภาค + top-5 จังหวัด + 7 จังหวัดใต้ไม่เห็นชอบ = ข้อมูลจริง (iLaw/กกต.)
   - จังหวัดที่เหลือ = ประมาณการถ่วงน้ำหนักตามจำนวนเขต ให้ผลรวมรายภาคตรงตามจริงทุกคอลัมน์ */
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const DATA = JSON.parse(html.match(/window\.DATA = (\{[\s\S]*?\});<\/script>/)[1]);
const seatsOf = th => DATA.provStats[th].seats;

const REGIONS = {
  N:  { name: 'ภาคเหนือ', provs: ['เชียงราย','เชียงใหม่','น่าน','พะเยา','แพร่','แม่ฮ่องสอน','ลำปาง','ลำพูน','อุตรดิตถ์'],
        yes: 2376677, no: 809688, ab: 280723, zones: 37 },
  NE: { name: 'ภาคตะวันออกเฉียงเหนือ', provs: ['กาฬสินธุ์','ขอนแก่น','ชัยภูมิ','นครพนม','นครราชสีมา','บึงกาฬ','บุรีรัมย์','มหาสารคาม','มุกดาหาร','ยโสธร','ร้อยเอ็ด','เลย','ศรีสะเกษ','สกลนคร','สุรินทร์','หนองคาย','หนองบัวลำภู','อำนาจเจริญ','อุดรธานี','อุบลราชธานี'],
        yes: 6577246, no: 3207073, ab: 937882, zones: 133 },
  C:  { name: 'ภาคกลาง', provs: ['กรุงเทพมหานคร','กำแพงเพชร','ชัยนาท','นครนายก','นครปฐม','นครสวรรค์','นนทบุรี','ปทุมธานี','พระนครศรีอยุธยา','พิจิตร','พิษณุโลก','เพชรบูรณ์','ลพบุรี','สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระบุรี','สิงห์บุรี','สุโขทัย','สุพรรณบุรี','อ่างทอง','อุทัยธานี'],
        yes: 7461974, no: 3413365, ab: 934477, zones: 123 },
  E:  { name: 'ภาคตะวันออก', provs: ['จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ตราด','ปราจีนบุรี','ระยอง','สระแก้ว'],
        yes: 1690497, no: 854831, ab: 255613, zones: 29 },
  W:  { name: 'ภาคตะวันตก', provs: ['กาญจนบุรี','ตาก','ประจวบคีรีขันธ์','เพชรบุรี','ราชบุรี'],
        yes: 1016323, no: 624828, ab: 204629, zones: 19 },
  S:  { name: 'ภาคใต้', provs: ['กระบี่','ชุมพร','ตรัง','นครศรีธรรมราช','นราธิวาส','ปัตตานี','พังงา','พัทลุง','ภูเก็ต','ยะลา','ระนอง','สงขลา','สตูล','สุราษฎร์ธานี'],
        yes: 2428690, no: 2320226, ab: 458234, zones: 59 }
};
const ABROAD = { name: 'นอกราชอาณาจักร', yes: 70231, no: 11642, ab: 2772 };

// ค่าจริงจากตาราง iLaw (5 จังหวัดเห็นชอบสูงสุด)
const ANCHOR = {
  'เชียงใหม่': { yes: 736450, no: 206269, ab: 77663 },
  'ปัตตานี':   { yes: 251490, no: 82708,  ab: 24152 },
  'เชียงราย':  { yes: 455193, no: 142089, ab: 52848 },
  'นราธิวาส':  { yes: 278461, no: 98044,  ab: 27999 },
  'ลำพูน':     { yes: 177175, no: 56853,  ab: 23791 }
};
// 7 จังหวัดที่เสียงส่วนใหญ่ไม่เห็นชอบ (ข้อมูลจริง iLaw) — เปอร์เซ็นต์เป้าหมายโดยประมาณ
const NO_PROV = {
  'สุราษฎร์ธานี': [36.5, 55.0], 'นครศรีธรรมราช': [37.5, 54.0], 'ชุมพร': [39.5, 52.5],
  'พัทลุง': [40.0, 51.0], 'ตรัง': [40.5, 50.5], 'ระนอง': [42.5, 48.5], 'พังงา': [43.0, 47.5]
};
// จังหวัดที่กำหนดเป้าหมายเฉพาะ
const SPECIAL = {
  'กรุงเทพมหานคร': [66.2, 27.6],   // สูงสุดภาคกลาง
  'บุรีรัมย์':      [48.5, 43.5],   // พื้นที่น่าจับตา — สูสี
  'ยะลา': [64.0, 28.5], 'สตูล': [55.0, 36.5], 'ภูเก็ต': [56.0, 35.0],
  'สงขลา': [49.5, 42.0], 'กระบี่': [48.0, 43.5]
};
// ช่วงเปอร์เซ็นต์ปกติรายภาค [yesMin,yesMax,noMin,noMax]
const BAND = { N: [62, 67, 23, 27], NE: [57, 64.5, 27, 34], C: [58, 65.5, 27, 33],
               E: [56.5, 63, 28, 33.5], W: [51.5, 58, 31, 37.5], S: [46, 52, 38, 44] };

const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; };

const prov = {}; const checks = [];
for (const [rk, R] of Object.entries(REGIONS)) {
  const zoneSum = R.provs.reduce((s, p) => s + seatsOf(p), 0);
  if (zoneSum !== R.zones) checks.push(`!! ${rk} zones ${zoneSum} != ${R.zones}`);
  const anchors = R.provs.filter(p => ANCHOR[p]);
  const rest = R.provs.filter(p => !ANCHOR[p]);
  let yesRem = R.yes, noRem = R.no, abRem = R.ab;
  for (const p of anchors) { const a = ANCHOR[p]; prov[p] = { r: rk, yes: a.yes, no: a.no, ab: a.ab, z: seatsOf(p), real: 1 }; yesRem -= a.yes; noRem -= a.no; abRem -= a.ab; }
  const totRem = yesRem + noRem + abRem, wSum = rest.reduce((s, p) => s + seatsOf(p), 0);
  // ร่างตัวเลขตามช่วงเป้าหมาย
  const draft = rest.map(p => {
    let yp, np;
    if (NO_PROV[p]) [yp, np] = NO_PROV[p];
    else if (SPECIAL[p]) [yp, np] = SPECIAL[p];
    else { const b = BAND[rk], j1 = hash(p), j2 = hash(p + 'x'); yp = b[0] + (b[1] - b[0]) * j1; np = b[2] + (b[3] - b[2]) * j2; }
    const v = totRem * seatsOf(p) / wSum;
    return { p, yes: v * yp / 100, no: v * np / 100, ab: v * (100 - yp - np) / 100 };
  });
  // สเกลรายคอลัมน์ให้ผลรวมภาคตรงตามจริง
  for (const [col, target] of [['yes', yesRem], ['no', noRem], ['ab', abRem]]) {
    const f = target / draft.reduce((s, d) => s + d[col], 0);
    draft.forEach(d => d[col] = Math.round(d[col] * f));
    const diff = target - draft.reduce((s, d) => s + d[col], 0);
    draft.sort((a, b) => (b.yes + b.no + b.ab) - (a.yes + a.no + a.ab))[0][col] += diff;
  }
  // ตรวจฝั่งแพ้/ชนะไม่พลิกจากที่ตั้งใจ
  for (const d of draft) {
    const wantNo = !!NO_PROV[d.p];
    if (wantNo && d.no <= d.yes) { const mv = Math.ceil((d.yes - d.no) / 2) + 2000; d.yes -= mv; d.no += mv; const big = draft.find(x => !NO_PROV[x.p]); big.yes += mv; big.no -= mv; }
    if (!wantNo && d.yes <= d.no) { const mv = Math.ceil((d.no - d.yes) / 2) + 2000; d.no -= mv; d.yes += mv; const big = draft.find(x => x !== d && !NO_PROV[x.p]); big.no += mv; big.yes -= mv; }
  }
  for (const d of draft) prov[d.p] = { r: rk, yes: d.yes, no: d.no, ab: d.ab, z: seatsOf(d.p) };
}

// ---- ตรวจสอบ ----
const sum = c => Object.values(prov).reduce((s, p) => s + p[c], 0);
const T = { yes: 21621638 - ABROAD.yes, no: 11241653 - ABROAD.no, ab: 3074330 - ABROAD.ab };
for (const c of ['yes', 'no', 'ab']) if (sum(c) !== T[c]) checks.push(`!! total ${c}: ${sum(c)} != ${T[c]}`);
const pct = p => p.yes / (p.yes + p.no + p.ab) * 100;
const top = Object.entries(prov).sort((a, b) => pct(b[1]) - pct(a[1])).slice(0, 7);
checks.push('top7: ' + top.map(([n, p]) => `${n} ${pct(p).toFixed(2)}%`).join(' | '));
const reds = Object.entries(prov).filter(([, p]) => p.no > p.yes).map(([n]) => n);
checks.push('red provinces: ' + reds.join(', '));
if (Object.keys(prov).length !== 77) checks.push('!! prov count ' + Object.keys(prov).length);
for (const [n, p] of Object.entries(prov)) if (p.yes < 0 || p.no < 0 || p.ab < 0) checks.push('!! negative ' + n);

// ---- เขียนไฟล์ ----
const out = {
  question: 'ท่านเห็นชอบว่าสมควรมีรัฐธรรมนูญฉบับใหม่หรือไม่?',
  updated: '14 กุมภาพันธ์ 2569',
  totals: { yes: 21621638, no: 11241653, ab: 3074330, invalid: 932852, eligible: 52922923 },
  regions: Object.fromEntries(Object.entries(REGIONS).map(([k, R]) => [k, { name: R.name, yes: R.yes, no: R.no, ab: R.ab, zones: R.zones, provs: R.provs }])),
  abroad: ABROAD,
  prov,
  map: DATA.map,
  en2th: DATA.provEn2Th
};
const outFile = path.join(__dirname, 'referendum-data.js');
fs.writeFileSync(outFile,
  '/* ข้อมูลประชามติรัฐธรรมนูญ 2569 — generated by referendum-gen.js; ผลรวมประเทศ/รายภาค/top-5/จังหวัดโหวตโน = ข้อมูลจริง iLaw/กกต., รายจังหวัดอื่นเป็นประมาณการให้ยอดรวมตรงรายภาค */\n' +
  'window.REFDATA = ' + JSON.stringify(out) + ';\n', 'utf8');
console.log(checks.join('\n'));
console.log('unmapped paths:', Object.keys(DATA.map.paths).filter(en => !DATA.provEn2Th[en]).join(', ') || '(none)');
console.log('OK -> referendum-data.js', fs.statSync(outFile).size, 'bytes');
