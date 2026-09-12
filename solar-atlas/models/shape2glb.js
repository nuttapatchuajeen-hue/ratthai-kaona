/* แปลงโมเดลรูปทรงจริงของวัตถุจิ๋ว (PDS SBN · JAXA · DAMIT) → .glb บีบแบบ Draco
   อ่านได้ 5 รูปแบบ:
     obj     Wavefront (v / f)
     wrl     VRML IndexedFaceSet (point [...] + coordIndex [...])
     ver     PDS Gaskell "vertex" : บรรทัดแรก = จำนวนจุด จำนวนหน้า แล้วตามด้วยรายการ
     stooke  ตารางรัศมี  lon lat r   (ทีละ 5 องศา)
     thomas  ตารางรัศมี  lat lon r   (ทีละ 5 องศา)

   ทุกไฟล์ต้นทางวางแกนหมุนไว้ที่ +Z (ขั้วเหนือ) ลองจิจูด 0° ที่ +X
   แต่ฉากของเราใช้ทรงกลมของ three.js ที่ขั้วอยู่ +Y — จึงหมุน (x,y,z) → (x, z, −y) ฝังไว้ในไฟล์เลย

   ขนาดทำให้เป็น "รัศมีเทียบเท่าปริมาตร = 1" เพื่อให้หน้าเว็บคูณด้วย def.radius ได้ตรง ๆ เหมือนทรงกลมเดิม

   ใช้: node shape2glb.js <ไฟล์เข้า> <รูปแบบ> <ไฟล์ออก.glb> [จำนวนสามเหลี่ยมสูงสุด]           */
'use strict';
const fs = require('fs');
const path = require('path');
const { Document, NodeIO } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const { weld, dedup, prune, draco, simplify } = require('@gltf-transform/functions');
const { MeshoptSimplifier } = require('meshoptimizer');
const draco3d = require('draco3d');

/* ── ตัวอ่านแต่ละรูปแบบ → { pos: number[] (x,y,z ...), idx: number[] } ───────── */

function readObj(txt) {
  const pos = [], idx = [];
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();                       // บางไฟล์ของ PDS เว้นวรรคหน้าบรรทัด
    if (line[0] === 'v' && line[1] === ' ') {
      const p = line.split(/\s+/);
      pos.push(+p[1], +p[2], +p[3]);
    } else if (line[0] === 'f' && line[1] === ' ') {
      const p = line.split(/\s+/).slice(1).map(s => parseInt(s.split('/')[0], 10));
      // เผื่อหน้ามีมากกว่า 3 มุม: ซอยเป็นพัด
      for (let k = 1; k + 1 < p.length; k++) idx.push(p[0] - 1, p[k] - 1, p[k + 1] - 1);
    }
  }
  return { pos, idx };
}

function readWrl(txt) {
  const pStart = txt.indexOf('point [');
  const pEnd = txt.indexOf(']', pStart);
  const cStart = txt.indexOf('coordIndex [', pEnd);
  const cEnd = txt.indexOf(']', cStart);
  if (pStart < 0 || cStart < 0) throw new Error('ไม่เจอ point[] หรือ coordIndex[] ใน WRL');
  const nums = s => s.replace(/#[^\n]*/g, ' ').split(/[\s,]+/).filter(x => x.length && !isNaN(+x)).map(Number);
  const pos = nums(txt.slice(pStart + 7, pEnd));
  const raw = nums(txt.slice(cStart + 12, cEnd));
  const idx = [];
  let face = [];
  for (const v of raw) {
    if (v === -1) {
      for (let k = 1; k + 1 < face.length; k++) idx.push(face[0], face[k], face[k + 1]);
      face = [];
    } else face.push(v);
  }
  if (face.length >= 3) for (let k = 1; k + 1 < face.length; k++) idx.push(face[0], face[k], face[k + 1]);
  return { pos, idx };
}

function readVer(txt) {
  const lines = txt.split(/\r?\n/);
  const head = lines[0].trim().split(/\s+/);
  const nv = +head[0], nf = +head[1];
  const pos = [], idx = [];
  for (let i = 0; i < nv; i++) {
    const p = lines[1 + i].trim().split(/\s+/);
    pos.push(+p[1], +p[2], +p[3]);
  }
  for (let i = 0; i < nf; i++) {
    const p = lines[1 + nv + i].trim().split(/\s+/);
    idx.push(+p[1] - 1, +p[2] - 1, +p[3] - 1);
  }
  return { pos, idx };
}

/* ตารางรัศมีบนกริด lon/lat — สร้างเป็นทรงกลมที่ถูกดันออกตามรัศมี
   ขั้วบนกับขั้วล่างในไฟล์ซ้ำหลายจุด (ค่าเดียวกันทุกลองจิจูด) ใช้ได้เลยเพราะ weld() จะเชื่อมให้ */
function readRadiusGrid(txt, lonFirst) {
  const rows = txt.split(/\r?\n/).map(l => l.trim()).filter(l => l.length)
    .map(l => l.split(/\s+/).map(Number));
  const map = new Map();                                  // "lon,lat" → r
  const lons = new Set(), lats = new Set();
  for (const r of rows) {
    const lon = ((lonFirst ? r[0] : r[1]) % 360 + 360) % 360;
    const lat = lonFirst ? r[1] : r[0];
    const rad = r[2];
    map.set(lon + ',' + lat, rad);
    lons.add(lon); lats.add(lat);
  }
  const LO = [...lons].sort((a, b) => a - b);
  const LA = [...lats].sort((a, b) => a - b);
  const pos = [], idx = [];
  const at = (i, j) => {
    const lon = LO[i % LO.length], lat = LA[j];
    const r = map.get(lon + ',' + lat);
    if (r == null) throw new Error('ตารางรัศมีไม่ครบที่ lon ' + lon + ' lat ' + lat);
    return r;
  };
  for (let j = 0; j < LA.length; j++) {
    const lat = LA[j] * Math.PI / 180;
    for (let i = 0; i < LO.length; i++) {
      const lon = LO[i] * Math.PI / 180, r = at(i, j);
      pos.push(r * Math.cos(lat) * Math.cos(lon), r * Math.cos(lat) * Math.sin(lon), r * Math.sin(lat));
    }
  }
  const W = LO.length;
  for (let j = 0; j + 1 < LA.length; j++)
    for (let i = 0; i < W; i++) {
      const i2 = (i + 1) % W;
      const a = j * W + i, b = j * W + i2, c = (j + 1) * W + i, d = (j + 1) * W + i2;
      idx.push(a, c, b, b, c, d);
    }
  return { pos, idx };
}

/* ── เครื่องมือเรขาคณิต ───────────────────────────────────────────────── */

// ปริมาตรและจุดศูนย์กลางมวลของรูปทรงหลายหน้า (สูตรเทตระฮีดรอนจากจุดกำเนิด)
function volumeCentroid(pos, idx) {
  let V = 0, cx = 0, cy = 0, cz = 0;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ax = pos[a], ay = pos[a + 1], az = pos[a + 2];
    const bx = pos[b], by = pos[b + 1], bz = pos[b + 2];
    const cx3 = pos[c], cy3 = pos[c + 1], cz3 = pos[c + 2];
    const v = (ax * (by * cz3 - bz * cy3) - ay * (bx * cz3 - bz * cx3) + az * (bx * cy3 - by * cx3)) / 6;
    V += v;
    cx += v * (ax + bx + cx3) / 4; cy += v * (ay + by + cy3) / 4; cz += v * (az + bz + cz3) / 4;
  }
  return { V, c: V ? [cx / V, cy / V, cz / V] : [0, 0, 0] };
}

function vertexNormals(pos, idx) {
  const n = new Float64Array(pos.length);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const e1x = pos[b] - pos[a], e1y = pos[b + 1] - pos[a + 1], e1z = pos[b + 2] - pos[a + 2];
    const e2x = pos[c] - pos[a], e2y = pos[c + 1] - pos[a + 1], e2z = pos[c + 2] - pos[a + 2];
    // ผลคูณไขว้ไม่ปรับความยาว = ถ่วงน้ำหนักด้วยพื้นที่หน้าโดยอัตโนมัติ
    const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
    for (const o of [a, b, c]) { n[o] += nx; n[o + 1] += ny; n[o + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) {
    const L = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= L; n[i + 1] /= L; n[i + 2] /= L;
  }
  return n;
}

/* พิกัดพื้นผิวแบบทรงกลม + ผ่าตะเข็บ
   จุดที่อยู่คนละฝั่งของเส้นลองจิจูด ±180° จะทำให้สามเหลี่ยมยืดพาดทั้งใบ
   จึงโคลนจุดของสามเหลี่ยมที่คร่อมตะเข็บออกมาใหม่ แล้วเลื่อน u ไปอีกหนึ่งรอบ  */
function sphericalUV(pos, nrm, idx) {
  const P = Array.from(pos), N = Array.from(nrm), I = idx.slice();
  const uv = [];
  for (let i = 0; i < P.length; i += 3) {
    const x = P[i], y = P[i + 1], z = P[i + 2];
    const r = Math.hypot(x, y, z) || 1;
    uv.push(0.5 + Math.atan2(z, x) / (2 * Math.PI), 0.5 + Math.asin(Math.max(-1, Math.min(1, y / r))) / Math.PI);
  }
  const clone = new Map();                                  // จุดเดิม → จุดที่เลื่อน u แล้ว
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t], b = I[t + 1], c = I[t + 2];
    const ua = uv[a * 2], ub = uv[b * 2], uc = uv[c * 2];
    const mx = Math.max(ua, ub, uc), mn = Math.min(ua, ub, uc);
    if (mx - mn <= 0.5) continue;                           // ไม่คร่อมตะเข็บ
    for (const k of [0, 1, 2]) {
      const v = I[t + k];
      if (uv[v * 2] > 0.5) continue;                        // ฝั่งขวาอยู่แล้ว
      let nv = clone.get(v);
      if (nv == null) {
        nv = P.length / 3;
        P.push(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]);
        N.push(N[v * 3], N[v * 3 + 1], N[v * 3 + 2]);
        uv.push(uv[v * 2] + 1, uv[v * 2 + 1]);
        clone.set(v, nv);
      }
      I[t + k] = nv;
    }
  }
  return { P, N, I, uv };
}

/* ── หลัก ─────────────────────────────────────────────────────────────── */
(async () => {
  const [src, fmt, out, maxTriArg] = process.argv.slice(2);
  const txt = fs.readFileSync(src, 'utf8');
  let g;
  if (fmt === 'obj') g = readObj(txt);
  else if (fmt === 'wrl') g = readWrl(txt);
  else if (fmt === 'ver') g = readVer(txt);
  else if (fmt === 'stooke') g = readRadiusGrid(txt, true);
  else if (fmt === 'thomas') g = readRadiusGrid(txt, false);
  else throw new Error('ไม่รู้จักรูปแบบ ' + fmt);

  const nvIn = g.pos.length / 3, nfIn = g.idx.length / 3;
  if (!nvIn || !nfIn) throw new Error('อ่านได้ 0 จุด/0 หน้า');

  // 1. ย้ายจุดกำเนิดไปที่ศูนย์กลางมวล แล้วปรับขนาดให้รัศมีเทียบเท่าปริมาตร = 1
  let { V, c } = volumeCentroid(g.pos, g.idx);
  if (V < 0) {                                     // ลำดับมุมกลับด้าน — พลิกให้หน้าหันออก
    for (let t = 0; t < g.idx.length; t += 3) { const s = g.idx[t + 1]; g.idx[t + 1] = g.idx[t + 2]; g.idx[t + 2] = s; }
    V = -V; c = [-c[0], -c[1], -c[2]];
    ({ V, c } = volumeCentroid(g.pos, g.idx));
  }
  const Req = Math.cbrt(3 * V / (4 * Math.PI));
  const dim = [[Infinity, -Infinity], [Infinity, -Infinity], [Infinity, -Infinity]];
  const pos = new Float64Array(g.pos.length);
  for (let i = 0; i < g.pos.length; i += 3) {
    // แกนเดิม +Z = ขั้วเหนือ → ฉากของเราใช้ +Y เป็นขั้ว : (x, y, z) → (x, z, −y)
    const x = (g.pos[i] - c[0]) / Req, y = (g.pos[i + 1] - c[1]) / Req, z = (g.pos[i + 2] - c[2]) / Req;
    pos[i] = x; pos[i + 1] = z; pos[i + 2] = -y;
    for (let a = 0; a < 3; a++) {
      const v = pos[i + a];
      if (v < dim[a][0]) dim[a][0] = v;
      if (v > dim[a][1]) dim[a][1] = v;
    }
  }

  // 2. เวกเตอร์ตั้งฉากแบบเฉลี่ยถ่วงพื้นที่ + พิกัดพื้นผิว
  const nrm = vertexNormals(pos, g.idx);
  const { P, N, I, uv } = sphericalUV(pos, nrm, g.idx);

  // 3. ประกอบเป็นเอกสาร glTF
  const doc = new Document();
  const buf = doc.createBuffer();
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(P)).setBuffer(buf))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(N)).setBuffer(buf))
    .setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(new Float32Array(uv)).setBuffer(buf))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(I)).setBuffer(buf))
    .setMaterial(doc.createMaterial('rock').setBaseColorFactor([1, 1, 1, 1]).setRoughnessFactor(0.94).setMetallicFactor(0));
  doc.createScene('scene').addChild(doc.createNode('shape').setMesh(doc.createMesh('shape').addPrimitive(prim)));

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'draco3d.encoder': await draco3d.createEncoderModule(),
    'draco3d.decoder': await draco3d.createDecoderModule()
  });
  await MeshoptSimplifier.ready;
  const maxTri = parseInt(maxTriArg || '0', 10);
  const steps = [weld({ tolerance: 1e-5 }), dedup()];
  if (maxTri && nfIn > maxTri) steps.push(simplify({ simplifier: MeshoptSimplifier, ratio: maxTri / nfIn, error: 0.004 }));
  // keepAttributes: วัสดุในไฟล์ไม่มีพื้นผิว prune จึงจะทิ้ง TEXCOORD_0 ทิ้งไป
  // ทั้งที่หน้าเว็บเอาไปใช้กับผ้าใบผิวหินที่แชร์กัน — ต้องสั่งให้เก็บไว้
  steps.push(prune({ keepAttributes: true }), draco());
  await doc.transform(...steps);
  await io.write(out, doc);

  let tris = 0, verts = 0;
  for (const m of doc.getRoot().listMeshes())
    for (const p of m.listPrimitives()) {
      const ix = p.getIndices();
      tris += (ix ? ix.getCount() : p.getAttribute('POSITION').getCount()) / 3;
      verts += p.getAttribute('POSITION').getCount();
    }
  const kmDim = dim.map(d => +((d[1] - d[0]) * Req).toFixed(3));
  console.log(JSON.stringify({
    file: path.basename(out), fmt,
    srcVerts: nvIn, srcTris: nfIn, tris: Math.round(tris), verts,
    kb: +(fs.statSync(out).size / 1024).toFixed(1),
    Req_km: +Req.toFixed(4),
    dim_km: kmDim,                                   // กว้าง × สูง(แกนหมุน) × ลึก หลังหมุนแกนแล้ว
    offset_km: c.map(v => +v.toFixed(4))
  }));
})().catch(e => { console.error('พัง:', e.stack || e.message); process.exit(1); });
