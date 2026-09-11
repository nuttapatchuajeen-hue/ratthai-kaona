/* ══════════════════════════════════════════════════════════════════════
   build-earth-land.js — สร้าง earth-land.js (เส้นขอบแผ่นดินของโลก) จากไฟล์ของเว็บแม่
   วิธีใช้:  node build-earth-land.js
   ต้นทาง:  ../hub/data/land-110m.json = Natural Earth 1:110m land (สาธารณสมบัติ)
   รูปแบบ:  วงละหนึ่งแถว [lon0, lat0, dLon1, dLat1, …] หน่วย 0.1 องศา
            คู่แรกเป็นค่าจริง คู่ถัดไปเป็นผลต่างจากจุดก่อนหน้า (ไฟล์เล็กลงราวครึ่ง)
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'hub', 'data', 'land-110m.json');
const OUT = path.join(__dirname, 'earth-land.js');
const Q = 10;                                   // 1 หน่วย = 0.1 องศา ละเอียดกว่าพิกเซลของพื้นผิว (0.4°) อยู่แล้ว

const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const rings = [];
let pts = 0;
for (const f of geo.features) {
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const poly of polys) {
    for (const ring of poly) {                  // วงแรกคือขอบนอก วงถัดไปคือรู (ทะเลแคสเปียน) — ระบายแบบ evenodd
      const out = [];
      let px = null, py = null;
      for (const [lon, lat] of ring) {
        const x = Math.round(Math.max(-180, Math.min(180, lon)) * Q);
        const y = Math.round(lat * Q);
        if (px === null) out.push(x, y);
        else if (x !== px || y !== py) out.push(x - px, y - py);
        else continue;
        px = x; py = y;
      }
      if (out.length >= 6) { rings.push(out); pts += out.length / 2; }
    }
  }
}

const body = rings.map(r => '[' + r.join(',') + ']').join(',\n');
const js = `/* ══════════════════════════════════════════════════════════════════════
   earth-land.js — เส้นขอบแผ่นดินของโลก ใช้วาดทวีปบนพื้นผิวโลกใน textures.js
   ต้นทาง: Natural Earth 1:110m land (naturalearthdata.com) — สาธารณสมบัติ ใช้ได้โดยไม่ต้องขออนุญาต
   ไฟล์นี้สร้างด้วย build-earth-land.js — อย่าแก้ด้วยมือ
   ${rings.length} วง · ${pts} จุด · วงละแถว [lon0, lat0, dLon, dLat, …] หน่วย 0.1 องศา
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const EARTH_LAND = [
${body}
];
`;
fs.writeFileSync(OUT, js);
console.log(`earth-land.js เขียนแล้ว · ${rings.length} วง · ${pts} จุด · ${(Buffer.byteLength(js) / 1024).toFixed(0)} KB`);
