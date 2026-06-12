// fetch-zone-areas.js — ดึง "พื้นที่เขตเลือกตั้ง" (อำเภอ/เขตปกครอง) ของทั้ง 400 เขต เลือกตั้ง 2569
// แหล่งข้อมูล: วิกิพีเดียไทย 2 ชั้น
//   1) ฐาน: หน้า "จังหวัดXในการเลือกตั้งสมาชิกสภาผู้แทนราษฎรไทยเป็นการทั่วไป พ.ศ. 2566"
//   2) ทับด้วยแบ่งเขตจริงปี 2569 (ประกาศ กกต. 16 ธ.ค. 2568) จากตารางประวัติเขตเลือกตั้ง
//      ในหน้า "สมาชิกสภาผู้แทนราษฎรจังหวัดX" เมื่อมีแถว พ.ศ. 2569 และ parse ได้ครบ
// ผลลัพธ์: zone-areas.js → window.ZONE_AREAS = { "จังหวัด|เลขเขต": "พื้นที่..." }
const fs = require('fs');
const path = require('path');

global.window = {};
require(path.join(__dirname, 'parliament-data.js'));
const zone = window.PDATA.zone;
const seats = {};
for (const r of zone) seats[r.prov] = Math.max(seats[r.prov] || 0, +r.no);
const provs = Object.keys(seats);
console.log('provinces:', provs.length, '· districts:', zone.length);

const title66 = p => (p === 'กรุงเทพมหานคร' ? p : 'จังหวัด' + p) +
  'ในการเลือกตั้งสมาชิกสภาผู้แทนราษฎรไทยเป็นการทั่วไป พ.ศ. 2566';
const titleMP = p => 'สมาชิกสภาผู้แทนราษฎร' + (p === 'กรุงเทพมหานคร' ? p : 'จังหวัด' + p);

function cleanWikitext(s) {
  return s
    .replace(/<ref[^>]*\/>/g, '')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '')
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/\[\[ไฟล์:[^\]]*\]\]/g, '')
    .replace(/\[\[(?:[^\[\]|]*\|)?([^\[\]]+)\]\]/g, '$1')
    .replace(/'''?/g, '')
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function api(titles) {
  const body = new URLSearchParams({
    action: 'query', prop: 'revisions', rvprop: 'content', rvslots: 'main',
    format: 'json', formatversion: '2', redirects: '1', titles: titles.join('|'),
  });
  const res = await fetch('https://th.wikipedia.org/w/api.php', {
    method: 'POST', body,
    headers: { 'User-Agent': 'md-election-site/1.0 (zone area builder)' },
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

// ดึงเนื้อหาหลายหน้า → { ชื่อจังหวัด: wikitext }
async function fetchPages(titleOf, label) {
  const out = {}, missing = [];
  for (let i = 0; i < provs.length; i += 20) {
    const batch = provs.slice(i, i + 20);
    const data = await api(batch.map(titleOf));
    const norm = {};
    for (const n of (data.query.normalized || [])) norm[n.to] = n.from;
    for (const r of (data.query.redirects || [])) norm[r.to] = norm[r.from] || r.from;
    for (const page of data.query.pages) {
      const reqTitle = norm[page.title] || page.title;
      const prov = batch.find(p => titleOf(p) === reqTitle) || batch.find(p => page.title.includes(p));
      if (!prov) { missing.push('UNMATCHED: ' + page.title); continue; }
      if (page.missing) { missing.push('MISSING: ' + page.title); continue; }
      out[prov] = page.revisions[0].slots.main.content;
    }
    await new Promise(r => setTimeout(r, 250));
  }
  if (missing.length) console.log(label, 'missing pages:\n  ' + missing.join('\n  '));
  return out;
}

// ---- ชั้นที่ 1: เขตเลือกตั้ง 2566 (รูปแบบ "เขตเลือกตั้งที่ N ประกอบด้วย...") ----
function parse66(text) {
  const out = {};
  const re = /เขตเลือกตั้งที่\s*(\d+)\s*(?:ประกอบไปด้วย|ประกอบด้วย|ประกอบ)\s*[::]?\s*([^\n]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const no = +m[1];
    if (out[no]) continue; // เอาที่พบครั้งแรก (ตารางผลเลือกตั้ง)
    const area = cleanWikitext(m[2].replace(/\|\|[\s\S]*$/, ''));
    if (area) out[no] = area;
  }
  return out;
}

// ---- ชั้นที่ 2: แถวแบ่งเขต พ.ศ. 2569 ในตารางประวัติของหน้า ส.ส. จังหวัด ----
function parse69(text) {
  const head = text.split(/==\s*รายนามสมาชิก/)[0]; // ตัดตารางรายนาม ส.ส. ทิ้ง
  const rows = head.split(/\n\|-/).filter(r => r.includes('พ.ศ. 2569') && /เขตเลือกตั้งที่\s*\d+\s*'*\s*[::]/.test(r));
  if (!rows.length) return null;
  const row = rows[rows.length - 1]
    .replace(/<\/?br\s*\/?>/g, '\n')
    .replace(/'''/g, '')
    .replace(/[·•]/g, '\n');
  const out = {};
  const re = /เขตเลือกตั้งที่\s*(\d+)\s*[::]\s*([^\n]+)/g;
  let m;
  while ((m = re.exec(row)) !== null) {
    const no = +m[1];
    const area = cleanWikitext(m[2].replace(/\|\|[\s\S]*$/, ''));
    if (area && !out[no]) out[no] = area;
  }
  return Object.keys(out).length ? out : null;
}

(async () => {
  console.log('\n[1/2] ดึงหน้าเลือกตั้ง 2566 ...');
  const pages66 = await fetchPages(title66, '2566');
  console.log('[2/2] ดึงหน้า ส.ส. จังหวัด (หาแถวแบ่งเขต 2569) ...');
  const pagesMP = await fetchPages(titleMP, 'MP');

  const AREAS = {};
  const report = { use69: [], partial69: [], only66: [], problems: [] };

  for (const prov of provs) {
    const want = seats[prov];
    const base = pages66[prov] ? parse66(pages66[prov]) : {};
    const over = pagesMP[prov] ? parse69(pagesMP[prov]) : null;
    const overNos = over ? Object.keys(over).map(Number) : [];
    const overComplete = over && overNos.length >= want &&
      Array.from({ length: want }, (_, i) => i + 1).every(n => over[n]);

    for (let no = 1; no <= want; no++) {
      let v = (overComplete && over[no]) || (over && over[no]) || base[no];
      if (!v) continue;
      // วงเล็บเหลี่ยมหลงรูปแบบจากต้นทาง (มี ] โดยไม่มี [ คู่กัน) → แปลงเป็นวงเล็บโค้ง
      if (v.includes(']') && !v.includes('[')) v = v.replace(/\]/g, ')');
      AREAS[prov + '|' + no] = v;
    }
    if (overComplete) report.use69.push(prov);
    else if (over) report.partial69.push(prov + ' (' + overNos.join(',') + ')');
    else report.only66.push(prov);
  }

  let missing = 0;
  for (const r of zone) if (!AREAS[r.prov + '|' + (+r.no)]) { missing++; report.problems.push('NO AREA: ' + r.prov + ' เขต ' + r.no); }

  console.log('\n— ใช้แบ่งเขต 2569 เต็มจังหวัด:', report.use69.length, 'จังหวัด');
  console.log(report.use69.join(', ') || '(none)');
  console.log('— มีแถว 2569 แต่ parse ได้บางเขต (ใช้ผสม 2566):', report.partial69.length ? report.partial69.join(' | ') : '(none)');
  console.log('— ใช้ 2566 ล้วน:', report.only66.length, 'จังหวัด');
  console.log('\ntotal areas:', Object.keys(AREAS).length, '/', zone.length, '· missing:', missing);
  if (report.problems.length) console.log('PROBLEMS:\n' + report.problems.join('\n'));

  const banner = '// zone-areas.js — พื้นที่เขตเลือกตั้ง ส.ส. รายเขต เลือกตั้ง 2569 (เรียบเรียงจากวิกิพีเดีย: แบ่งเขต กกต. 2569 ทับฐาน 2566)\n';
  fs.writeFileSync(path.join(__dirname, 'zone-areas.js'),
    banner + 'window.ZONE_AREAS=' + JSON.stringify(AREAS) + ';\n');
  console.log('wrote zone-areas.js', (fs.statSync(path.join(__dirname, 'zone-areas.js')).size / 1024).toFixed(1) + ' KB');
})().catch(e => { console.error(e); process.exit(1); });
