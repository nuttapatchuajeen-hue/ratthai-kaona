/* ══════════════════════════════════════════════════════════════════════
   app.js — เครื่องยนต์ของแผนที่ระบบสุริยะ
     · คำนวณตำแหน่งจากองค์ประกอบวงโคจรเคปเลอร์ (ไม่ดาวน์โหลดตำแหน่งจากใคร)
     · วาดด้วย three.js โดยเลื่อนจุดกำเนิดของฉากไปที่วัตถุเป้าหมายทุกเฟรม
       เพื่อให้ตัวเลข float ไม่สั่นเวลาซูมเข้าไปใกล้ผิวดาว
   ══════════════════════════════════════════════════════════════════════ */
'use strict';

/* ── สถานะ ─────────────────────────────────────────────────────────── */
const S = {
  lang: 'th',
  time: Date.now(),
  tzMode: 'local',
  live: true,
  playing: true,
  rateIdx: 0,
  sign: 1,
  focus: 'earth',
  orbits: true, labels: true, moons: true, belt: true, kuiper: true, oort: true,
  stars: true, galaxy: true, grid: false, trails: false,
  asteroids: true, comets: true, dwarfs: true, craft: true,
  enlarge: false,
  measureA: 'earth', measureB: 'mars'
};
const L = () => UI[S.lang];

/* ── มาตราส่วนใหญ่: จากผิวดาวถึงกาแล็กซี ───────────────────────────── */
const LY = 9.4607304726e12;        // กิโลเมตรต่อหนึ่งปีแสง
const GAL_U = 0.001;               // 1 หน่วยในฉากกาแล็กซี = 1,000 ปีแสง
const SUN_R_GAL = 26.0;            // ดวงอาทิตย์ห่างใจกลางทางช้างเผือก 26,000 ปีแสง
const MAX_DIST = 260000 * LY;      // ซูมออกได้ไกลสุด: มองทางช้างเผือกจากภายนอก
const log10 = Math.log10 || (x => Math.log(x) / Math.LN10);
const step01 = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

const RINGS = {
  saturn: { in: 1.24, out: 2.35, gaps: [[0.702, 0.045], [0.949, 0.012]], col: [230, 214, 184], alpha: 1.0 },
  uranus: { in: 1.62, out: 2.02, gaps: [[0.34, 0.30], [0.72, 0.14]], col: [148, 164, 176], alpha: 0.55 }
};

const REG = {};                 // ทะเบียนวัตถุทั้งหมด keyed by id
const ORDER = [];               // ลำดับสำหรับเมนู
const $ = s => document.querySelector(s);
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

/* ══ ดาราศาสตร์ ══════════════════════════════════════════════════════ */
const days = ms => (ms - J2000) / 86400000;
const norm2pi = a => { a %= 2 * Math.PI; return a < 0 ? a + 2 * Math.PI : a; };

function kepler(M, e) {
  M = norm2pi(M + Math.PI) - Math.PI;
  let E = M + e * Math.sin(M);
  for (let k = 0; k < 8; k++) {
    const d = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-12) break;
  }
  return E;
}

/* ตำแหน่งดาวเคราะห์ในระบบพิกัดสุริยวิถี J2000 (หน่วย: กม.) */
function planetPos(id, ms, out) {
  const E = ELEMENTS[id], T = days(ms) / 36525;
  const a = E.a[0] + E.a[1] * T;
  const e = E.e[0] + E.e[1] * T;
  const inc = (E.i[0] + E.i[1] * T) * DEG;
  const Lo = (E.L[0] + E.L[1] * T) * DEG;
  const pi = (E.w[0] + E.w[1] * T) * DEG;
  const nd = (E.n[0] + E.n[1] * T) * DEG;
  const om = pi - nd;
  const Ecc = kepler(Lo - pi, e);
  const xp = a * (Math.cos(Ecc) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(Ecc);
  const cw = Math.cos(om), sw = Math.sin(om), cn = Math.cos(nd), sn = Math.sin(nd),
        ci = Math.cos(inc), si = Math.sin(inc);
  out.x = ((cw * cn - sw * sn * ci) * xp + (-sw * cn - cw * sn * ci) * yp) * AU;
  out.y = ((cw * sn + sw * cn * ci) * xp + (-sw * sn + cw * cn * ci) * yp) * AU;
  out.z = ((sw * si) * xp + (cw * si) * yp) * AU;
  return out;
}

/* วัตถุขนาดเล็กบางดวงรีเกือบเป็นเส้นตรง (ดาวหาง e ถึง 0.999) วิธีนิวตันแบบ
   ปล่อยอิสระจะกระโดดข้ามคำตอบ จึงจำกัดความยาวก้าวไว้ให้ลู่เข้าแน่นอน */
function keplerE(M, e) {
  M = norm2pi(M + Math.PI) - Math.PI;
  let E = M + e * Math.sin(M);
  for (let k = 0; k < 60; k++) {
    let d = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    if (Math.abs(d) > 0.6) d = Math.sign(d) * 0.6;
    E -= d;
    if (Math.abs(d) < 1e-13) break;
  }
  return E;
}

/* วงโคจรไฮเพอร์โบลา (e > 1): M = e·sinh H − H  — วัตถุจากนอกระบบสุริยะ */
function keplerH(M, e) {
  let H = Math.asinh(M / e);
  for (let k = 0; k < 80; k++) {
    let d = (e * Math.sinh(H) - H - M) / (e * Math.cosh(H) - 1);
    if (Math.abs(d) > 1) d = Math.sign(d);
    H -= d;
    if (Math.abs(d) < 1e-13) break;
  }
  return H;
}

/* หมุนพิกัดในระนาบวงโคจร (x ชี้ไปจุดใกล้ที่สุด) เข้าสู่พิกัดสุริยวิถี */
function perifocal(xp, yp, wDeg, iDeg, omDeg, out) {
  const w = wDeg * DEG, i = iDeg * DEG, n = omDeg * DEG;
  const cw = Math.cos(w), sw = Math.sin(w), cn = Math.cos(n), sn = Math.sin(n),
        ci = Math.cos(i), si = Math.sin(i);
  out.x = ((cw * cn - sw * sn * ci) * xp + (-sw * cn - cw * sn * ci) * yp) * AU;
  out.y = ((cw * sn + sw * cn * ci) * xp + (-sw * sn + cw * cn * ci) * yp) * AU;
  out.z = ((sw * si) * xp + (cw * si) * yp) * AU;
  return out;
}

/* ตำแหน่งวัตถุขนาดเล็ก: นับมุมจากเวลาที่ผ่านจุดใกล้ดวงอาทิตย์สุด (tp)
   M = n × (JD − tp) ใช้ได้ทั้งวงรีและไฮเพอร์โบลา */
function smallPos(def, ms, out) {
  const E = def.el;
  const M = E.n * (2451545 + days(ms) - E.tp) * DEG;
  let xp, yp;
  if (E.e < 1) {
    const Ecc = keplerE(M, E.e);
    xp = E.a * (Math.cos(Ecc) - E.e);
    yp = E.a * Math.sqrt(1 - E.e * E.e) * Math.sin(Ecc);
  } else {
    const A = Math.abs(E.a), H = keplerH(M, E.e);
    xp = A * (E.e - Math.cosh(H));
    yp = A * Math.sqrt(E.e * E.e - 1) * Math.sinh(H);
  }
  return perifocal(xp, yp, E.w, E.i, E.om, out);
}

/* ยานอวกาศ: ปกติใช้สูตรเดียวกับวัตถุขนาดเล็ก ยกเว้นลำที่ประจำอยู่จุดสมดุล L2
   ของระบบดวงอาทิตย์–โลก ซึ่งต้องอ้างจากตำแหน่งโลกโดยตรง (จึงต้องเรียกหลังโลก) */
function craftPos(def, ms, out) {
  if (def.special !== 'l2') return smallPos(def, ms, out);
  const e = worldOf('earth');
  const r = Math.sqrt(e.x * e.x + e.y * e.y + e.z * e.z);
  const k = 1 + 1.5e6 / r;                   // L2 ไกลจากดวงอาทิตย์กว่าโลก 1.5 ล้าน กม.
  out.x = e.x * k; out.y = e.y * k; out.z = e.z * k;
  // ของจริงไม่ได้นิ่งอยู่ที่จุดนั้น แต่วนรอบจุดเป็นวงกว้างราว 8 แสน กม. คาบราวครึ่งปี
  const a = days(ms) / 182.6 * 2 * Math.PI;
  out.x += (-e.y / r) * 4.0e5 * Math.cos(a);
  out.y += (e.x / r) * 4.0e5 * Math.cos(a);
  out.z += 2.0e5 * Math.sin(a);
  return out;
}

/* ดวงจันทร์ของโลก — สูตรความละเอียดต่ำมาตรฐาน คลาดเคลื่อนระดับลิปดา */
function lunarPos(ms, out) {
  const d = days(ms);
  const Lp = (218.316 + 13.176396 * d) * DEG;
  const M  = (134.963 + 13.064993 * d) * DEG;
  const Ms = (357.529 + 0.98560028 * d) * DEG;
  const F  = (93.272 + 13.229350 * d) * DEG;
  const D  = (297.850 + 12.190749 * d) * DEG;
  const lon = Lp + (6.289 * Math.sin(M) - 1.274 * Math.sin(2 * D - M) + 0.658 * Math.sin(2 * D)
            + 0.214 * Math.sin(2 * M) - 0.186 * Math.sin(Ms) - 0.114 * Math.sin(2 * F)) * DEG;
  const lat = (5.128 * Math.sin(F) + 0.281 * Math.sin(M + F) - 0.278 * Math.sin(F - M)
            - 0.173 * Math.sin(F - 2 * D)) * DEG;
  const r = 385001 - 20905 * Math.cos(M) - 3699 * Math.cos(2 * D - M)
          - 2956 * Math.cos(2 * D) - 570 * Math.cos(2 * M);
  const cb = Math.cos(lat);
  out.x = r * cb * Math.cos(lon);
  out.y = r * cb * Math.sin(lon);
  out.z = r * Math.sin(lat);
  return out;
}

/* แกนหมุนของดาว: เวกเตอร์หนึ่งหน่วยในระบบสุริยวิถี */
function axisVector(tiltDeg, nodeDeg) {
  const t = tiltDeg * DEG, n = nodeDeg * DEG;
  return new THREE.Vector3(Math.sin(t) * Math.cos(n), Math.sin(t) * Math.sin(n), Math.cos(t));
}

/* ดวงจันทร์ทั่วไป: วงรีเคปเลอร์ในระนาบศูนย์สูตรของดาวแม่ */
function satellitePos(m, ms, out) {
  const d = days(ms);
  const n = 2 * Math.PI / m.period;
  const Ecc = kepler(n * d + m._phase, m.e);
  const xp = m.a * (Math.cos(Ecc) - m.e), yp = m.a * Math.sqrt(1 - m.e * m.e) * Math.sin(Ecc);
  const ci = Math.cos(m.inc * DEG), si = Math.sin(m.inc * DEG);
  const cn = Math.cos(m.node * DEG), sn = Math.sin(m.node * DEG);
  // หมุนด้วยความเอียงและโหนดภายในระนาบศูนย์สูตรของดาวแม่
  const x1 = xp * cn - yp * ci * sn;
  const y1 = xp * sn + yp * ci * cn;
  const z1 = yp * si;
  const B = m._basis;                       // [i, j, k] ของระนาบศูนย์สูตรดาวแม่
  out.x = B[0].x * x1 + B[1].x * y1 + B[2].x * z1;
  out.y = B[0].y * x1 + B[1].y * y1 + B[2].y * z1;
  out.z = B[0].z * x1 + B[1].z * y1 + B[2].z * z1;
  return out;
}

/* ══ ฉาก 3 มิติ ══════════════════════════════════════════════════════ */
let renderer, scene, camera, skyScene, skyCam, sunLight, labelLayer;
let starFade = 1, galFade = 0;
const origin = { x: 0, y: 0, z: 0 };          // จุดกำเนิดฉาก = ตำแหน่งเป้าหมาย (กม.)
const camState = { dist: 0, az: 0.9, el: 0.42, tDist: 0 };
const trans = { on: false, from: null, to: null, t: 0, dur: 1.5, d0: 0, d1: 0 };
const tmp = new THREE.Vector3();
const V = () => ({ x: 0, y: 0, z: 0 });

function toScene(w, v) {
  v.set((w.x - origin.x) / KMU, (w.y - origin.y) / KMU, (w.z - origin.z) / KMU);
  return v;
}

function initScene() {
  const canvas = $('#gl');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x05070c, 1);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.autoClear = false;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(48, 1, 0.001, 1e10);
  camera.up.set(0, 0, 1);

  skyScene = new THREE.Scene();
  skyCam = new THREE.PerspectiveCamera(48, 1, 1, 4000);
  skyCam.up.set(0, 0, 1);

  sunLight = new THREE.PointLight(0xfff3e0, 2.1, 0, 0);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0x2a3550, 0.5));

  labelLayer = $('#labels');
  buildSky();
  buildGalaxy();
  buildGrid();
  buildBelt();
  resize();
  addEventListener('resize', resize);
}

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = skyCam.aspect = galCam.aspect = w / h;
  camera.updateProjectionMatrix();
  skyCam.updateProjectionMatrix();
  galCam.updateProjectionMatrix();
}

/* ── ดาวฤกษ์พื้นหลัง + แถบทางช้างเผือก (สร้างเองทั้งหมด) ───────────── */
function buildSky() {
  const N = 7000, MW = 5200;
  const pos = new Float32Array((N + MW) * 3), col = new Float32Array((N + MW) * 3), siz = new Float32Array(N + MW);
  let s = 991;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff), s / 0x7fffffff);
  // ขั้วของระนาบกาแล็กซีในพิกัดสุริยวิถี (โดยประมาณ)
  const pl = 180.02 * DEG, pb = 29.81 * DEG;
  const P = new THREE.Vector3(Math.cos(pb) * Math.cos(pl), Math.cos(pb) * Math.sin(pl), Math.sin(pb));
  const A = new THREE.Vector3().crossVectors(P, new THREE.Vector3(0, 0, 1)).normalize();
  const Bv = new THREE.Vector3().crossVectors(P, A).normalize();
  const put = (i, dir, bright, size) => {
    pos[i * 3] = dir.x * 1200; pos[i * 3 + 1] = dir.y * 1200; pos[i * 3 + 2] = dir.z * 1200;
    const warm = rnd();
    const r = bright * (warm > 0.72 ? 1 : warm > 0.34 ? 0.96 : 0.86);
    const g = bright * (warm > 0.72 ? 0.88 : 0.95);
    const b = bright * (warm > 0.72 ? 0.74 : warm > 0.34 ? 0.94 : 1);
    col[i * 3] = r; col[i * 3 + 1] = g; col[i * 3 + 2] = b;
    siz[i] = size;
  };
  for (let i = 0; i < N; i++) {
    const u = rnd() * 2 - 1, th = rnd() * 2 * Math.PI, k = Math.sqrt(1 - u * u);
    const dir = new THREE.Vector3(k * Math.cos(th), k * Math.sin(th), u);
    const m = Math.pow(rnd(), 2.6);
    put(i, dir, 0.30 + m * 0.70, 1.1 + m * 3.4);
  }
  for (let i = 0; i < MW; i++) {                       // แถบสว่างรอบระนาบกาแล็กซี
    const ang = rnd() * 2 * Math.PI;
    let g = 0; for (let k = 0; k < 4; k++) g += rnd();
    const off = (g / 2 - 1) * 0.30 * (0.5 + rnd());
    const dir = new THREE.Vector3()
      .addScaledVector(A, Math.cos(ang)).addScaledVector(Bv, Math.sin(ang))
      .addScaledVector(P, off).normalize();
    put(N + i, dir, 0.10 + Math.pow(rnd(), 3) * 0.42, 0.9 + rnd() * 1.7);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(siz, 1));
  const pts = new THREE.Points(geo, starMaterial());
  pts.frustumCulled = false;
  pts.name = 'stars';
  skyScene.add(pts);
}

/* จุดดาวใช้เชเดอร์เดียวกันทั้งท้องฟ้ารอบตัวและกาแล็กซี — ขนาดคงที่เป็นพิกเซล
   และมีตัวคูณ fade ไว้ไล่สลับกันตอนซูมออกจากย่านดวงอาทิตย์ */
let starSprite = null;
function starMaterial() {
  if (!starSprite) starSprite = new THREE.CanvasTexture(glowTexture([
    [0, 'rgba(255,255,255,1)'], [0.28, 'rgba(255,255,255,.72)'],
    [0.6, 'rgba(255,255,255,.16)'], [1, 'rgba(255,255,255,0)']], 64));
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: starSprite }, scale: { value: 1 }, fade: { value: 1 } },
    vertexShader: `attribute float size; varying vec3 vC; uniform float scale;
      void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.0);
        gl_PointSize = size * scale; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D map; uniform float fade; varying vec3 vC;
      void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(vC,1.0) * t * fade; }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true
  });
}

/* ── ระนาบสุริยวิถี: วงกลมอ้างอิงทุก ๆ ระยะ ────────────────────────── */
let gridGroup;
function buildGrid() {
  gridGroup = new THREE.Group();
  gridGroup.visible = false;
  const rings = [1, 5, 10, 20, 30, 40];
  for (const r of rings) {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = i / 128 * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r * AU / KMU, Math.sin(a) * r * AU / KMU, 0));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    gridGroup.add(new THREE.Line(g, new THREE.LineBasicMaterial({
      color: 0x2a3d55, transparent: true, opacity: r === 1 ? 0.55 : 0.34 })));
  }
  for (let k = 0; k < 12; k++) {
    const a = k / 12 * Math.PI * 2, R = 40 * AU / KMU;
    const g = new THREE.BufferGeometry().setFromPoints(
      [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0)]);
    gridGroup.add(new THREE.Line(g, new THREE.LineBasicMaterial({
      color: 0x22334a, transparent: true, opacity: 0.26 })));
  }
  scene.add(gridGroup);
}

/* ── วงแหวนวัตถุเล็ก: แถบดาวเคราะห์น้อย และแถบไคเปอร์ ───────────────── */
function makeRing(cfg) {
  const N = cfg.count;
  const pos = new Float32Array(N * 3);
  const data = { a: new Float32Array(N), th: new Float32Array(N), n: new Float32Array(N), z: new Float32Array(N) };
  let s = cfg.seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff), s / 0x7fffffff);
  let i = 0;
  while (i < N) {
    const a = cfg.aMin + rnd() * (cfg.aMax - cfg.aMin);
    let ok = true;
    for (const g of (cfg.gaps || [])) if (Math.abs(a - g[0]) < g[1]) { ok = false; break; }
    if (!ok) continue;
    data.a[i] = a * AU / KMU;
    data.th[i] = rnd() * 2 * Math.PI;
    data.n[i] = 2 * Math.PI / (365.25 * Math.pow(a, 1.5));
    data.z[i] = (rnd() - 0.5) * cfg.thick * a * AU / KMU;
    i++;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color: cfg.color, size: cfg.size, sizeAttenuation: false,
    transparent: true, opacity: cfg.opacity, depthWrite: false }));
  pts.frustumCulled = false;
  scene.add(pts);
  return { pts, data };
}

let belt, kuiper, oort;
function buildBelt() {
  // ช่องว่างเคิร์กวูด: วงโคจรที่สั่นพ้องกับดาวพฤหัสบดีจนถูกกวาดจนเกลี้ยง
  belt = makeRing({ count: 2800, seed: 4242, aMin: 2.06, aMax: 3.36, thick: 0.30,
    gaps: [[2.502, 0.020], [2.825, 0.016], [2.958, 0.013], [3.279, 0.022]],
    color: 0x8d9bb0, size: 1.4, opacity: 0.5 });
  kuiper = makeRing({ count: 2600, seed: 8181, aMin: 34, aMax: 51, thick: 0.34,
    color: 0x7f93b4, size: 1.3, opacity: 0.42 });

  // เมฆออร์ต: เปลือกทรงกลมล้อมทั้งระบบ ไกลถึงหนึ่งปีแสงครึ่ง (คาบโคจรนับล้านปี จึงวางนิ่ง)
  const N = 5200, arr = new Float32Array(N * 3);
  let s = 31337;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff), s / 0x7fffffff);
  for (let i = 0; i < N; i++) {
    const r = (2000 + Math.pow(rnd(), 2.4) * 98000) * AU / KMU;
    const u = rnd() * 2 - 1, th = rnd() * 2 * Math.PI, k = Math.sqrt(1 - u * u);
    arr[i * 3] = r * k * Math.cos(th); arr[i * 3 + 1] = r * k * Math.sin(th); arr[i * 3 + 2] = r * u;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  oort = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0x6f7f9c, size: 1.1, sizeAttenuation: false, transparent: true, opacity: 0.30, depthWrite: false }));
  oort.frustumCulled = false;
  scene.add(oort);
}

let beltTick = 0;
function updateRing(ring) {
  const d = days(S.time), p = ring.pts.geometry.attributes.position, arr = p.array, D = ring.data;
  for (let i = 0; i < D.a.length; i++) {
    const th = D.th[i] + D.n[i] * d;
    arr[i * 3] = Math.cos(th) * D.a[i] - origin.x / KMU;
    arr[i * 3 + 1] = Math.sin(th) * D.a[i] - origin.y / KMU;
    arr[i * 3 + 2] = D.z[i] - origin.z / KMU;
  }
  p.needsUpdate = true;
}
function updateBelts() {
  if (beltTick++ % 3) return;
  if (belt.pts.visible) updateRing(belt);
  if (kuiper.pts.visible) updateRing(kuiper);
  oort.position.set(-origin.x / KMU, -origin.y / KMU, -origin.z / KMU);
}

/* ── ทางช้างเผือก: กาแล็กซีกังหันที่ปั่นขึ้นจากสูตร ไม่ใช่ภาพถ่าย ───────
   วาดในฉากของตัวเองที่ย่อมาตราส่วนลง (1 หน่วย = 1,000 ปีแสง)
   ทำให้ระยะระดับแสนปีแสงอยู่ในช่วงที่ตัวเลข float รับไหว                */
let galScene, galCam, galPts, galGlow, galDisc, galSunPos;
function buildGalaxy() {
  galScene = new THREE.Scene();
  galCam = new THREE.PerspectiveCamera(48, 1, 0.02, 6000);
  galCam.up.set(0, 0, 1);

  // ขั้วเหนือกาแล็กซี และทิศไปยังใจกลาง — แปลงเป็นพิกัดสุริยวิถีแล้ว
  const P = new THREE.Vector3(
    Math.cos(29.81 * DEG) * Math.cos(180.02 * DEG),
    Math.cos(29.81 * DEG) * Math.sin(180.02 * DEG),
    Math.sin(29.81 * DEG));
  const C = new THREE.Vector3(
    Math.cos(-5.54 * DEG) * Math.cos(266.84 * DEG),
    Math.cos(-5.54 * DEG) * Math.sin(266.84 * DEG),
    Math.sin(-5.54 * DEG));
  C.addScaledVector(P, -C.dot(P)).normalize();
  const Q = new THREE.Vector3().crossVectors(P, C).normalize();
  const group = new THREE.Group();
  group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(C, Q, P));
  galScene.add(group);
  galSunPos = C.clone().multiplyScalar(-SUN_R_GAL);

  const ARMS = 4, PITCH = 0.235, N_DISC = 96000, N_BULGE = 18000, N_HAZE = 52000;
  const N = N_DISC + N_BULGE + N_HAZE;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), siz = new Float32Array(N);
  let s = 20260910;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff), s / 0x7fffffff);
  const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 0.75;
  let i = 0;
  const put = (x, y, z, r, g, b, sz) => {
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    col[i * 3] = r; col[i * 3 + 1] = g; col[i * 3 + 2] = b;
    siz[i] = sz; i++;
  };
  for (let k = 0; k < N_DISC; k++) {                    // จานและแขนกังหัน
    const r = 2.2 - 11 * Math.log(1 - rnd() * 0.9987);
    if (r > 48) { k--; continue; }
    const arm = (rnd() * ARMS) | 0;
    const spread = 0.17 + 1.9 / (r + 2);
    const th = Math.log(r / 2.2) / PITCH + arm * (2 * Math.PI / ARMS) + gauss() * spread;
    const z = gauss() * (0.55 + 0.020 * r) * Math.exp(-r / 26);
    const young = rnd();
    const warm = Math.exp(-r / 15);
    let R = 0.52 + warm * 0.48, G = 0.56 + warm * 0.34, B = 0.86 - warm * 0.18;
    if (young > 0.965) { R = 1.0; G = 0.52; B = 0.62; }            // กระจุกก๊าซเรืองแสง
    else if (young > 0.86) { R = 0.62; G = 0.74; B = 1.0; }        // ดาวอายุน้อยสีน้ำเงิน
    const dim = 0.34 + 0.66 * Math.pow(rnd(), 1.7);
    put(r * Math.cos(th), r * Math.sin(th), z, R * dim, G * dim, B * dim, 0.9 + rnd() * 1.5);
  }
  for (let k = 0; k < N_BULGE; k++) {                   // ดุมกลางสีเหลืองอุ่น
    const r = Math.abs(gauss()) * 3.4;
    const u = rnd() * 2 - 1, th = rnd() * 2 * Math.PI, q = Math.sqrt(1 - u * u);
    const dim = 0.42 + 0.58 * Math.pow(rnd(), 1.5);
    put(r * q * Math.cos(th), r * q * Math.sin(th), r * u * 0.62,
        1.0 * dim, 0.86 * dim, 0.62 * dim, 0.8 + rnd() * 1.3);
  }
  for (let k = 0; k < N_HAZE; k++) {                    // แสงรวมจากดาวที่แยกไม่ออก
    const r = 1 + Math.pow(rnd(), 0.6) * 47;
    const th = rnd() * 2 * Math.PI;
    const z = gauss() * (0.8 + 0.035 * r) * Math.exp(-r / 30);
    const warm = Math.exp(-r / 18), dim = 0.055 + 0.115 * rnd();
    put(r * Math.cos(th), r * Math.sin(th), z,
        (0.6 + warm * 0.4) * dim, (0.62 + warm * 0.28) * dim, (0.82 - warm * 0.1) * dim, 0.75 + rnd() * 1.2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(siz, 1));
  galPts = new THREE.Points(geo, starMaterial());
  galPts.frustumCulled = false;
  group.add(galPts);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(glowTexture([
      [0, 'rgba(255,240,206,.62)'], [0.20, 'rgba(255,214,150,.26)'],
      [0.55, 'rgba(255,190,130,.06)'], [1, 'rgba(255,180,120,0)']], 256)),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.setScalar(22);
  group.add(glow);
  galGlow = glow;

  /* แสงพื้นของจาน: คำนวณความสว่างจากสูตรโดยตรงในเชเดอร์ แทนที่จะโปรยจุดให้ถี่
     ได้ผิวเรียบไร้เม็ด และแขนกังหันวางตัวตามเกลียวเดียวกับจุดดาวด้านบนพอดี */
  galDisc = new THREE.Mesh(new THREE.CircleGeometry(50, 128), new THREE.ShaderMaterial({
    uniforms: { fade: { value: 0 } },
    vertexShader: `varying vec2 vP;
      void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `precision highp float; varying vec2 vP; uniform float fade;
      void main(){
        float r = length(vP);
        float th = atan(vP.y, vP.x);
        float disc  = exp(-r / 12.0);
        float bulge = exp(-r / 2.6) * 1.55;
        float phase = th - log(max(r, 1.2) / 2.2) / 0.235;
        float arm = pow(0.5 + 0.5 * cos(4.0 * phase), 2.0);
        float armAmt = smoothstep(1.5, 7.0, r) * (1.0 - smoothstep(28.0, 46.0, r));
        float I = disc * (0.42 + 0.92 * arm * armAmt) + bulge;
        I *= 1.0 - smoothstep(38.0, 50.0, r);
        vec3 c = mix(vec3(0.60, 0.70, 1.0), vec3(1.0, 0.87, 0.63), exp(-r / 13.0));
        gl_FragColor = vec4(c * I * fade * 0.9, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
  }));
  group.add(galDisc);
}

/* ══ สร้างวัตถุ ══════════════════════════════════════════════════════ */
/* ผ้าใบหนึ่งผืน = พื้นผิวหนึ่งชิ้นใน GPU แม้จะมีหลายวัตถุใช้ร่วมกัน */
const texCache = new WeakMap();
function texShared(canvas) {
  let t = texCache.get(canvas);
  if (!t) { t = tex(canvas); texCache.set(canvas, t); }
  return t;
}

function tex(canvas, srgb) {
  const t = new THREE.CanvasTexture(canvas);
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  if (srgb !== false) t.encoding = THREE.sRGBEncoding;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

/* หัวฟุ้งของดาวหาง: จุดสว่างฟุ้งกลม ๆ สร้างครั้งเดียวใช้ร่วมกันทุกดวง */
let _comaTex = null;
function comaTex() {
  if (!_comaTex) _comaTex = new THREE.CanvasTexture(glowTexture([
    [0, 'rgba(220,255,250,.95)'], [0.14, 'rgba(150,230,225,.55)'],
    [0.45, 'rgba(110,200,210,.14)'], [1, 'rgba(90,180,200,0)']], 128));
  return _comaTex;
}

/* หางดาวหาง: ไล่จางจากโคนไปปลาย และบานออกตามความยาว (อบไว้ในภาพ) */
let _tailTex = null;
function tailTex() {
  if (_tailTex) return _tailTex;
  const w = 256, h = 96, c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d'), img = g.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const v = (y / (h - 1)) * 2 - 1;
    for (let x = 0; x < w; x++) {
      const u = x / (w - 1);
      const sig = 0.05 + 0.34 * Math.pow(u, 0.75);          // โคนแคบ ปลายบาน
      const across = Math.exp(-(v * v) / (2 * sig * sig));
      const edge = Math.max(0, 1 - Math.pow(Math.abs(v) / 0.95, 4));   // กันขอบตรงของแผ่นภาพ
      const along = Math.pow(1 - u, 1.35);
      // ริ้วจาง ๆ ตามยาว ให้ดูเป็นสายฝุ่นไม่ใช่แผ่นทึบ
      const streak = 0.80 + 0.20 * Math.sin(v * 13 + u * 2.5) * Math.sin(v * 5.5 - 1.1);
      const a = across * edge * along * streak * 0.85;
      const i = (y * w + x) * 4;
      img.data[i] = 150 + 90 * (1 - u);                     // โคนออกขาว ปลายออกฟ้า
      img.data[i + 1] = 215 + 35 * (1 - u);
      img.data[i + 2] = 235;
      img.data[i + 3] = Math.max(0, Math.min(255, a * 255)) | 0;
    }
  }
  g.putImageData(img, 0, 0);
  _tailTex = new THREE.CanvasTexture(c);
  _tailTex.wrapS = _tailTex.wrapT = THREE.ClampToEdgeWrapping;
  return _tailTex;
}

const cometRecs = [];

/* ── โมเดลยานอวกาศ ─────────────────────────────────────────────────────
   ปั้นจากรูปทรงพื้นฐานของ three.js ทั้งหมด ไม่มีไฟล์โมเดลจากที่ไหน
   สร้างด้วยหน่วย "เมตร" แล้วค่อยย่อ/ขยายตอนแสดง (ดู craftPose)          */
function craftModel(kind) {
  const g = new THREE.Group();
  const M = {
    white: new THREE.MeshStandardMaterial({ color: 0xe6ebf2, roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide }),
    foil:  new THREE.MeshStandardMaterial({ color: 0xc9a961, roughness: 0.5, metalness: 0.8 }),
    dark:  new THREE.MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.9 }),
    gold:  new THREE.MeshStandardMaterial({ color: 0xe0b040, roughness: 0.3, metalness: 0.95, side: THREE.DoubleSide }),
    shield: new THREE.MeshBasicMaterial({ color: 0xb9c4d4, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  };
  const put = (mesh, x, y, z, rx, ry, rz) => {
    mesh.position.set(x, y, z);
    if (rx) mesh.rotation.x = rx;
    if (ry) mesh.rotation.y = ry;
    if (rz) mesh.rotation.z = rz;
    g.add(mesh);
    return mesh;
  };
  const cyl = (rt, rb, h, seg, mat, open) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!open), mat);
  const HALF = Math.PI / 2;                    // หมุนแกนทรงกระบอกจาก +Y ไป +Z

  if (kind === 'probe' || kind === 'nh') {
    const R = kind === 'nh' ? 1.05 : 1.85;     // รัศมีจานสื่อสาร (เมตร)
    put(cyl(R, R * 0.14, R * 0.5, 28, M.white, true), 0, 0, R * 0.25, HALF);
    put(cyl(R * 0.05, R * 0.05, R * 0.55, 6, M.white), 0, 0, R * 0.62, HALF);
    put(new THREE.Mesh(new THREE.SphereGeometry(R * 0.09, 10, 8), M.dark), 0, 0, R * 0.88);
    if (kind === 'probe') {
      put(cyl(R * 0.62, R * 0.62, R * 0.34, 10, M.foil), 0, 0, -R * 0.3, HALF);
      // คานยาวสองข้าง: ข้างหนึ่งคือเครื่องวัดสนามแม่เหล็ก อีกข้างคือเครื่องกำเนิดไฟฟ้า
      put(cyl(0.05, 0.05, R * 5.2, 6, M.white), R * 2.6, 0, -R * 0.3, 0, 0, HALF);
      const rtg = cyl(0.22, 0.22, 1.5, 8, M.dark);
      put(rtg, -R * 1.5, 0, -R * 0.3, 0, 0, HALF);
      put(cyl(0.22, 0.22, 1.5, 8, M.dark), -R * 2.4, 0, -R * 0.3, 0, 0, HALF);
      put(cyl(0.04, 0.04, R * 2.6, 6, M.white), -R * 1.0, 0, -R * 0.3, 0, 0, HALF);
      put(cyl(0.04, 0.04, R * 1.6, 6, M.white), 0, -R * 1.0, -R * 0.3, HALF);
    } else {
      put(new THREE.Mesh(new THREE.BoxGeometry(R * 1.5, R * 1.3, R * 0.7), M.foil), 0, 0, -R * 0.45);
      put(cyl(0.28, 0.28, 2.4, 10, M.dark), -R * 1.5, 0, -R * 0.45, 0, 0, HALF);
    }
  } else if (kind === 'parker') {
    put(cyl(1.15, 1.15, 0.11, 6, M.white), 0, 0, 1.25, HALF);        // โล่กันความร้อน
    put(cyl(0.5, 0.62, 1.0, 8, M.foil), 0, 0, 0.4, HALF);            // ตัวยาน
    put(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 0.04), M.dark), 1.15, 0, 0.35);
    put(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 0.04), M.dark), -1.15, 0, 0.35);
    put(cyl(0.06, 0.06, 1.1, 6, M.white), 0, 0, -0.5, HALF);
    put(cyl(0.62, 0.05, 0.3, 16, M.white, true), 0, 0, -1.0, HALF);   // จานสื่อสารด้านหลังโล่
  } else if (kind === 'jwst') {
    const dia = (hx, hy) => {                                        // ม่านกันแดดรูปว่าว
      const s = new THREE.Shape();
      s.moveTo(0, hy); s.lineTo(hx, 0); s.lineTo(0, -hy); s.lineTo(-hx, 0); s.closePath();
      return new THREE.ShapeGeometry(s);
    };
    for (let k = 0; k < 5; k++) {
      const f = 1 - k * 0.06;
      put(new THREE.Mesh(dia(10.5 * f, 7.0 * f), M.shield), 0, 0, 1.2 + k * 0.42);
    }
    put(cyl(3.3, 3.3, 0.22, 6, M.gold), 0, 0, -1.4, HALF, 0, Math.PI / 6);   // กระจกหลัก 18 แผ่นรวมเป็นหกเหลี่ยม
    put(new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.5, 0.9), M.dark), 0, -3.0, -1.9);
    put(cyl(0.75, 0.75, 0.12, 12, M.gold), 0, 0, -7.2, HALF);                // กระจกรอง
    for (const sx of [-1, 1]) put(cyl(0.07, 0.07, 6.2, 5, M.white), sx * 1.6, -0.9, -4.4, 0.28 * sx * 0, sx * 0.26);
    put(cyl(0.07, 0.07, 6.0, 5, M.white), 0, 2.6, -4.4, -0.42);
  }
  return g;
}

/* ทะเบียนยาน: หน้าตาต่างจากดาว (ไม่ใช่ลูกกลม ไม่มีพื้นผิว ไม่หมุนรอบตัวเอง) */
function makeCraft(def) {
  const holder = new THREE.Group();
  const spin = new THREE.Group();
  holder.add(spin);
  const model = craftModel(def.model);
  spin.add(model);
  scene.add(holder);
  return {
    def, isMoon: false, craft: true, holder, spin, mesh: model,
    R: def.radius / KMU, world: V(), parent: null,
    axis: new THREE.Vector3(0, 0, 1)
  };
}

/* ภาพวงกลมเล็กในแผงข้อมูล — ยานไม่มีพื้นผิวให้ตัดมาโชว์ จึงวาดสัญลักษณ์แทน */
function craftDisc(color, size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const hex = '#' + color.toString(16).padStart(6, '0');
  const grd = g.createRadialGradient(size * 0.4, size * 0.34, size * 0.04, size * 0.5, size * 0.5, size * 0.58);
  grd.addColorStop(0, hex);
  grd.addColorStop(1, '#141a24');
  g.fillStyle = grd;
  g.beginPath(); g.arc(size / 2, size / 2, size / 2, 0, 6.2832); g.fill();
  g.strokeStyle = 'rgba(12,16,22,.75)'; g.lineWidth = size * 0.055;
  g.beginPath(); g.arc(size * 0.5, size * 0.60, size * 0.27, Math.PI * 1.12, Math.PI * 1.88); g.stroke();
  g.beginPath(); g.moveTo(size * 0.5, size * 0.33); g.lineTo(size * 0.5, size * 0.72); g.stroke();
  return c;
}

function makeBody(def, isMoon) {
  const R = def.radius / KMU;
  const holder = new THREE.Group();            // ตำแหน่งในฉาก
  const spin = new THREE.Group();              // แกนเอียง + การหมุนรอบตัวเอง
  holder.add(spin);

  const small = !!def.el;
  const geo = new THREE.SphereGeometry(1, small ? 24 : (isMoon ? 40 : 64), small ? 16 : (isMoon ? 24 : 40));
  const map = small ? texShared(def._tex) : tex(def._tex);
  let mat;
  if (def.id === 'sun') {
    mat = new THREE.MeshBasicMaterial({ map });
  } else {
    mat = new THREE.MeshStandardMaterial({ map, roughness: 0.94, metalness: 0 });
    if (def.kind !== 'planet' || ['mercury', 'mars', 'venus'].includes(def.id)) {
      mat.bumpMap = map; mat.bumpScale = 0.012;
    }
  }
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.setScalar(R);
  spin.add(mesh);

  const rec = {
    def, isMoon, holder, spin, mesh, R,
    world: V(), parent: def.parent || null,
    axis: axisVector(def.tilt != null ? def.tilt : 0, def.axisNode || 0)
  };
  spin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rec.axis);

  if (def.id === 'earth') {                    // ชั้นเมฆ
    const cm = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40),
      new THREE.MeshStandardMaterial({ map: tex(def._clouds), transparent: true, roughness: 1, depthWrite: false }));
    cm.scale.setScalar(R * 1.012);
    spin.add(cm);
    rec.clouds = cm;
  }

  if (def.id === 'sun') {                      // แสงเรือง
    const gt = new THREE.CanvasTexture(glowTexture([
      [0, 'rgba(255,226,170,.95)'], [0.16, 'rgba(255,178,84,.55)'],
      [0.42, 'rgba(255,140,50,.16)'], [1, 'rgba(255,120,40,0)']], 256));
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: gt, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.scale.setScalar(R * 7);
    holder.add(sp);
    rec.glow = sp;
  }

  if (def.active) {                            // ดาวหาง: หัวฟุ้ง + หางชี้ออกจากดวงอาทิตย์
    const cm = new THREE.Sprite(new THREE.SpriteMaterial({
      map: comaTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
    holder.add(cm);
    rec.coma = cm;
    const tg = new THREE.PlaneGeometry(1, 1, 1, 1);
    tg.translate(0.5, 0, 0);                   // ให้โคนหางอยู่ที่ตัวดาวหาง ปลายหางที่ x = 1
    const tm = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({
      map: tailTex(), transparent: true, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
    tm.matrixAutoUpdate = false;
    tm.frustumCulled = false;
    holder.add(tm);
    rec.tail = tm;
    cometRecs.push(rec);
  }

  const ringCfg = RINGS[def.id];
  if (ringCfg) {
    const inner = R * ringCfg.in, outer = R * ringCfg.out;
    const rg = new THREE.RingGeometry(inner, outer, 192, 1);
    const p = rg.attributes.position, uv = rg.attributes.uv, v3 = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v3.fromBufferAttribute(p, i);
      uv.setXY(i, (v3.length() - inner) / (outer - inner), 0.5);
    }
    const rt = tex(ringTexture(1024, ringCfg.gaps, ringCfg.col));
    const rm = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({
      map: rt, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: ringCfg.alpha }));
    rm.rotation.x = Math.PI / 2;               // RingGeometry อยู่ระนาบ XY → หมุนให้ตรงศูนย์สูตร
    spin.add(rm);
    rec.ring = rm;
  }

  scene.add(holder);
  return rec;
}

/* ── ร่องรอยการเคลื่อนที่ ───────────────────────────────────────────────
   เก็บตำแหน่งย้อนหลังเป็นพิกัด "เทียบกับดาวแม่" แล้วเลื่อนเส้นทั้งเส้นไปวาง
   ที่ดาวแม่ทุกเฟรม (วิธีเดียวกับเส้นวงโคจร) จึงเขียนจุดลง GPU เฉพาะตอน
   เก็บตัวอย่างใหม่ ไม่ใช่ทุกเฟรม — และร่องรอยของดวงจันทร์จะเป็นวงรอบดาวแม่
   ไม่ใช่เส้นยาวที่ลากตามดาวแม่ไปทั่วระบบ                                  */
const TRAIL_MAX = 200;
const ZERO = { x: 0, y: 0, z: 0 };

function trailLine(rec) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL_MAX * 3), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(TRAIL_MAX * 3), 3));
  geo.setDrawRange(0, 0);
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  line.frustumCulled = false;
  line.visible = false;
  scene.add(line);
  const c = new THREE.Color(rec.def.color);
  rec.trail = { line, n: 0, pts: new Float64Array(TRAIL_MAX * 3), rgb: [c.r, c.g, c.b], last: null };
  return line;
}

function clearTrails() {
  for (const id in REG) {
    const t = REG[id] && REG[id].trail;
    if (!t) continue;
    t.n = 0; t.last = null;
    t.line.geometry.setDrawRange(0, 0);
    t.line.visible = false;
  }
}

/* ต้องขยับไปได้เท่าไรก่อนจะเก็บจุดใหม่ — วงโคจรใหญ่ก็เก็บห่างได้ */
function trailStep(rec) {
  if (rec.isMoon) return rec.def.a / 90;
  return Math.max(1, rec.def._ref || (rec.def.aAU || 1) * AU) / 90;
}

function pushTrail(t, x, y, z) {
  const P = t.pts;
  if (t.n === TRAIL_MAX) { P.copyWithin(0, 3); t.n--; }   // เต็มแล้ว: ทิ้งจุดเก่าสุด
  P[t.n * 3] = x; P[t.n * 3 + 1] = y; P[t.n * 3 + 2] = z;
  t.n++;
  const g = t.line.geometry, pos = g.attributes.position.array, col = g.attributes.color.array;
  const n = t.n, r = t.rgb;
  for (let k = 0; k < n; k++) {
    pos[k * 3] = P[k * 3] / KMU;
    pos[k * 3 + 1] = P[k * 3 + 1] / KMU;
    pos[k * 3 + 2] = P[k * 3 + 2] / KMU;
    // หัวสว่างเท่าสีดาว หางไล่จางลงจนกลืนกับพื้นหลัง
    const f = Math.pow(n < 2 ? 1 : k / (n - 1), 1.7) * 0.9;
    col[k * 3] = r[0] * f; col[k * 3 + 1] = r[1] * f; col[k * 3 + 2] = r[2] * f;
  }
  g.attributes.position.needsUpdate = true;
  g.attributes.color.needsUpdate = true;
  g.setDrawRange(0, n);
}

function updateTrails() {
  for (const id in REG) {
    const rec = REG[id], t = rec.trail;
    if (!t) continue;
    if (!S.trails || (rec.isMoon && !S.moons) || (rec.def.el && !rec.holder.visible)) {
      t.line.visible = false; continue;
    }
    const pw = rec.parent ? worldOf(rec.parent) : ZERO;
    const x = rec.world.x - pw.x, y = rec.world.y - pw.y, z = rec.world.z - pw.z;
    const L0 = t.last;
    if (!L0 || Math.hypot(x - L0[0], y - L0[1], z - L0[2]) > trailStep(rec)) {
      pushTrail(t, x, y, z);
      t.last = [x, y, z];
    }
    toScene(pw, t.line.position);
    t.line.visible = t.n > 1;
  }
}

/* ── เส้นวงโคจร ────────────────────────────────────────────────────── */
function orbitLine(rec) {
  const seg = rec.isMoon ? 180 : 420;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((seg + 1) * 3), 3));
  const mat = new THREE.LineBasicMaterial({
    color: rec.def.color, transparent: true, opacity: rec.isMoon ? 0.30 : 0.42, depthWrite: false });
  const line = new THREE.Line(geo, mat);
  line.frustumCulled = false;
  scene.add(line);
  rec.line = line;
  rec.lineSeg = seg;
  rec.lineT = -1e9;
  return line;
}

function refreshOrbit(rec, ms) {
  const seg = rec.lineSeg, arr = rec.line.geometry.attributes.position.array;
  if (rec.isMoon) {
    const m = rec.def;
    if (m.ecl) {                                  // ดวงจันทร์ของโลก: วงโคจรโดยประมาณ
      const d = days(ms);
      const node = (125.08 - 0.0529539 * d) * DEG, inc = m.inc * DEG;
      for (let i = 0; i <= seg; i++) {
        const a = i / seg * 2 * Math.PI;
        const x = Math.cos(a) * m.a, y = Math.sin(a) * m.a * Math.cos(inc), z = Math.sin(a) * m.a * Math.sin(inc);
        arr[i * 3] = (x * Math.cos(node) - y * Math.sin(node)) / KMU;
        arr[i * 3 + 1] = (x * Math.sin(node) + y * Math.cos(node)) / KMU;
        arr[i * 3 + 2] = z / KMU;
      }
    } else {
      const ci = Math.cos(m.inc * DEG), si = Math.sin(m.inc * DEG);
      const cn = Math.cos(m.node * DEG), sn = Math.sin(m.node * DEG), B = m._basis;
      for (let i = 0; i <= seg; i++) {
        const E = i / seg * 2 * Math.PI;
        const xp = m.a * (Math.cos(E) - m.e), yp = m.a * Math.sqrt(1 - m.e * m.e) * Math.sin(E);
        const x1 = xp * cn - yp * ci * sn, y1 = xp * sn + yp * ci * cn, z1 = yp * si;
        arr[i * 3] = (B[0].x * x1 + B[1].x * y1 + B[2].x * z1) / KMU;
        arr[i * 3 + 1] = (B[0].y * x1 + B[1].y * y1 + B[2].y * z1) / KMU;
        arr[i * 3 + 2] = (B[0].z * x1 + B[1].z * y1 + B[2].z * z1) / KMU;
      }
    }
  } else if (rec.def.el) {
    const E = rec.def.el, k = AU / KMU;
    if (E.e < 1) {
      for (let i = 0; i <= seg; i++) {
        const Ecc = i / seg * 2 * Math.PI;
        const xp = E.a * (Math.cos(Ecc) - E.e), yp = E.a * Math.sqrt(1 - E.e * E.e) * Math.sin(Ecc);
        perifocal(xp, yp, E.w, E.i, E.om, tmpV);
        arr[i * 3] = tmpV.x / KMU; arr[i * 3 + 1] = tmpV.y / KMU; arr[i * 3 + 2] = tmpV.z / KMU;
      }
    } else {
      // ไฮเพอร์โบลา: เส้นเปิด ลากให้เลยตำแหน่งปัจจุบันของวัตถุออกไปอีกหน่อย
      const A = Math.abs(E.a);
      const rNow = Math.sqrt(rec.world.x ** 2 + rec.world.y ** 2 + rec.world.z ** 2) / AU;
      const far = Math.max(60, rNow * 1.4);
      const Hmax = Math.acosh(Math.max(1.0001, (far / A + 1) / E.e));
      for (let i = 0; i <= seg; i++) {
        const H = (i / seg * 2 - 1) * Hmax;
        const xp = A * (E.e - Math.cosh(H)), yp = A * Math.sqrt(E.e * E.e - 1) * Math.sinh(H);
        perifocal(xp, yp, E.w, E.i, E.om, tmpV);
        arr[i * 3] = tmpV.x / KMU; arr[i * 3 + 1] = tmpV.y / KMU; arr[i * 3 + 2] = tmpV.z / KMU;
      }
    }
  } else {
    const E = ELEMENTS[rec.def.id], T = days(ms) / 36525;
    const a = E.a[0] + E.a[1] * T, e = E.e[0] + E.e[1] * T;
    const inc = (E.i[0] + E.i[1] * T) * DEG, pi = (E.w[0] + E.w[1] * T) * DEG, nd = (E.n[0] + E.n[1] * T) * DEG;
    const om = pi - nd;
    const cw = Math.cos(om), sw = Math.sin(om), cn = Math.cos(nd), sn = Math.sin(nd),
          ci = Math.cos(inc), si = Math.sin(inc), k = AU / KMU;
    for (let i = 0; i <= seg; i++) {
      const Ecc = i / seg * 2 * Math.PI;
      const xp = a * (Math.cos(Ecc) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(Ecc);
      arr[i * 3] = ((cw * cn - sw * sn * ci) * xp + (-sw * cn - cw * sn * ci) * yp) * k;
      arr[i * 3 + 1] = ((cw * sn + sw * cn * ci) * xp + (-sw * sn + cw * cn * ci) * yp) * k;
      arr[i * 3 + 2] = ((sw * si) * xp + (cw * si) * yp) * k;
    }
  }
  rec.line.geometry.attributes.position.needsUpdate = true;
  rec.line.geometry.computeBoundingSphere();
  rec.lineT = ms;
}

/* ══ วงรอบจำลอง ══════════════════════════════════════════════════════ */
const tmpV = { x: 0, y: 0, z: 0 };

function updatePositions(ms) {
  const sun = REG.sun;
  sun.world.x = sun.world.y = sun.world.z = 0;
  for (const id in ELEMENTS) planetPos(id, ms, REG[id].world);
  for (const s of SMALL) smallPos(s, ms, REG[s.id].world);
  for (const c of CRAFT) craftPos(c, ms, REG[c.id].world);   // หลังโลก เพราะลำที่อยู่ L2 อ้างจากโลก
  for (const m of MOONS) {
    const rec = REG[m.id], p = REG[m.parent].world;
    if (m.ecl) lunarPos(ms, rec.world); else satellitePos(m, ms, rec.world);
    rec.world.x += p.x; rec.world.y += p.y; rec.world.z += p.z;
  }
}

function worldOf(id) { return REG[id].world; }
function dist(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function updateOrigin(dt) {
  if (trans.on) {
    trans.t = Math.min(1, trans.t + dt / trans.dur);
    const e = trans.t < 0.5 ? 4 * trans.t ** 3 : 1 - Math.pow(-2 * trans.t + 2, 3) / 2;
    const A = worldOf(trans.from), B = worldOf(trans.to);
    origin.x = A.x + (B.x - A.x) * e;
    origin.y = A.y + (B.y - A.y) * e;
    origin.z = A.z + (B.z - A.z) * e;
    camState.dist = Math.exp(Math.log(trans.d0) + (Math.log(trans.d1) - Math.log(trans.d0)) * e);
    if (trans.t >= 1) { trans.on = false; S.focus = trans.to; syncCrumb(); }
  } else {
    const w = worldOf(S.focus);
    origin.x = w.x; origin.y = w.y; origin.z = w.z;
  }
}

function updateScene() {
  const d = days(S.time);
  for (const id in REG) {
    const rec = REG[id], def = rec.def;
    toScene(rec.world, rec.holder.position);
    const scale = (S.enlarge && id !== 'sun') ? 25 : 1;
    if (!rec.craft) rec.mesh.scale.setScalar(rec.R * scale);
    if (rec.clouds) rec.clouds.scale.setScalar(rec.R * scale * 1.012);
    if (rec.ring) rec.ring.scale.setScalar(scale);
    if (rec.glow) rec.glow.scale.setScalar(rec.R * 7);
    const rotH = def.rotH != null ? def.rotH : (def.period != null ? def.period * 24 : null);
    if (!rec.craft) {
      rec.spin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rec.axis);
      if (rotH) rec.spin.rotateY((2 * Math.PI * d / (rotH / 24)) % (2 * Math.PI));
    }
    const shown = rec.craft ? craftShown(rec)
                : def.el ? smallShown(rec)
                : (!rec.isMoon || S.moons);
    if (rec.craft && shown) craftPose(rec);
    if (rec.line) {
      const pw = rec.parent ? worldOf(rec.parent) : ZERO;
      toScene(pw, rec.line.position);
      // วงรีของวัตถุเล็กไม่เปลี่ยนตามเวลา วาดครั้งเดียวพอ ส่วนวงโคจรไฮเพอร์โบลา
      // เป็นเส้นเปิดที่ต้องยืดตามตัววัตถุซึ่งวิ่งออกไปเรื่อย ๆ
      const openPath = def.el && def.el.e >= 1;
      if ((!def.el || openPath) && Math.abs(S.time - rec.lineT) > (rec.isMoon ? 3.15e10 : 1.6e11)) refreshOrbit(rec, S.time);
      rec.line.visible = S.orbits && (rec.craft ? shown : def.el ? smallLineShown(rec) : shown);
    }
    rec.holder.visible = shown;
  }
  updateComets();
  toScene(worldOf('sun'), sunLight.position);
  gridGroup.visible = S.grid && camState.dist < 900 * AU;
  gridGroup.position.set(-origin.x / KMU, -origin.y / KMU, -origin.z / KMU);
  belt.pts.visible = S.belt && camState.dist < 4000 * AU;
  kuiper.pts.visible = S.kuiper && camState.dist < 4000 * AU;
  oort.visible = S.oort && camState.dist > 20 * AU && camState.dist < 24 * LY;
  updateBelts();

  // ไล่สลับ: ท้องฟ้าที่มองจากย่านดวงอาทิตย์ ⇄ ทางช้างเผือกทั้งใบ
  const dly = camState.dist / LY;
  const f = step01(log10(5), log10(3200), log10(Math.max(1e-12, dly)));
  const px = Math.min(2, (innerHeight / 900) * (renderer.getPixelRatio() || 1));
  starFade = S.stars ? 1 - f : 0;
  galFade = S.galaxy ? f : 0;
  const st = skyScene.getObjectByName('stars');
  st.visible = starFade > 0.01;
  st.material.uniforms.scale.value = px;
  st.material.uniforms.fade.value = starFade;
  galPts.material.uniforms.scale.value = px * 1.7;
  galPts.material.uniforms.fade.value = galFade;
  galGlow.material.opacity = galFade * 0.85;
  galDisc.material.uniforms.fade.value = galFade;
}

/* วัตถุเล็กมี 33 ดวง ถ้าโชว์หมดทุกระยะมองจะรกจนอ่านไม่ได้
   จึงให้โผล่เฉพาะเมื่อระยะมองใกล้เคียงขนาดวงโคจรของมันเอง
   (เป้าหมายที่กำลังเจาะจงอยู่ให้โชว์เสมอ) */
function smallShown(rec) {
  const def = rec.def;
  if (!S[def.layer]) return false;
  if (def.id === (trans.on ? trans.to : S.focus)) return true;
  return camState.dist > def._ref * 0.05 && camState.dist < def._ref * 14;
}

/* เส้นวงโคจรกินพื้นที่ทั้งจอ ต่างจากตัววัตถุที่เป็นแค่จุด จึงต้องเข้มงวดกว่า
   ไม่งั้นวงรีของวัตถุ 20 ดวงจะพันกันเป็นเส้นสปาเกตตีทับฉากทั้งหมด */
function smallLineShown(rec) {
  const def = rec.def;
  if (!S[def.layer]) return false;
  if (def.id === (trans.on ? trans.to : S.focus)) return true;
  return camState.dist > def._ref * 0.45 && camState.dist < def._ref * 8;
}

/* ยานมีแค่ 7 ลำและเป็นของที่คนอยากเห็น จึงไม่ซ่อนตามระยะมองแบบวัตถุจิ๋ว
   ซ่อนเฉพาะเมื่อซูมออกไปไกลกว่าตัวยานลำที่ไกลสุดเท่านั้น */
function craftShown(rec) {
  if (!S.craft) return false;
  if (rec.def.id === (trans.on ? trans.to : S.focus)) return true;
  return camState.dist < 1200 * AU;
}

/* ท่าของยาน: จานสื่อสารหันเข้าหาโลก (หรือโล่กันความร้อนหันเข้าหาดวงอาทิตย์)
   และขนาด: ตัวจริงยาวไม่กี่เมตร ถ้าวาดตามจริงจะมองไม่เห็นเลยในทุกระยะ
   จึงขยายให้กว้างราว 18 พิกเซลบนจอเสมอ แต่ไม่เล็กกว่าขนาดจริง
   ผลคือซูมเข้าไปใกล้ ๆ จะได้เห็นยานขนาดเท่าของจริง */
const cpDir = new THREE.Vector3(), cpZ = new THREE.Vector3(0, 0, 1);
function craftPose(rec) {
  const def = rec.def;
  const camDist = Math.max(1e-12, rec.holder.position.distanceTo(camera.position));
  const fovK = innerHeight / (2 * Math.tan(camera.fov * DEG / 2));
  const TRUE = 1e-6;                                  // 1 เมตร = 1e-6 หน่วยฉาก
  rec.spin.scale.setScalar(Math.max(TRUE, 18 * camDist / (fovK * def.span)));
  const tgt = def.point === 'sun' ? ZERO : worldOf('earth');
  cpDir.set(tgt.x - rec.world.x, tgt.y - rec.world.y, tgt.z - rec.world.z);
  if (cpDir.lengthSq() > 0) rec.spin.quaternion.setFromUnitVectors(cpZ, cpDir.normalize());
}

/* หางดาวหาง: ยาวขึ้นเมื่อเข้าใกล้ดวงอาทิตย์ และชี้ออกจากดวงอาทิตย์เสมอ
   (ลมสุริยะกับแรงดันแสงพัดฝุ่นและไอออนออกไปทางตรงข้ามดวงอาทิตย์) */
const tDir = new THREE.Vector3(), tSide = new THREE.Vector3(), tUp = new THREE.Vector3();
function updateComets() {
  const fovK = innerHeight / (2 * Math.tan(camera.fov * DEG / 2));
  for (const rec of cometRecs) {
    const t = rec.tail, c = rec.coma;
    if (!rec.holder.visible) { t.visible = c.visible = false; continue; }
    const rAU = Math.sqrt(rec.world.x ** 2 + rec.world.y ** 2 + rec.world.z ** 2) / AU;
    const act = Math.max(0, Math.min(1, (3.6 - rAU) / 3.0));      // เริ่มคุกรุ่นราว 3.6 AU
    if (act < 0.02) { t.visible = c.visible = false; continue; }
    const camDist = Math.max(1e-6, rec.holder.position.distanceTo(camera.position));
    // หัวฟุ้ง
    let comaR = (0.0008 + 0.006 * act) * AU / KMU;
    comaR = Math.min(Math.max(comaR, 7 * camDist / fovK), camDist * 0.06);
    c.visible = true;
    c.scale.setScalar(comaR);
    c.material.opacity = 0.35 + 0.5 * act;
    // หาง
    let len = (0.02 + 0.30 * act * act) * AU / KMU;
    len = Math.min(Math.max(len, 42 * camDist / fovK), camDist * 0.30);
    tDir.set(rec.world.x, rec.world.y, rec.world.z).normalize();  // ออกจากดวงอาทิตย์
    tUp.subVectors(camera.position, rec.holder.position).normalize();
    tSide.crossVectors(tDir, tUp);
    if (tSide.lengthSq() < 1e-10) tSide.set(0, 0, 1).cross(tDir);  // หางชี้ตรงเข้ากล้อง
    tSide.normalize().multiplyScalar(len * 0.42);
    tUp.crossVectors(tDir, tSide).normalize();
    t.visible = true;
    t.material.opacity = 0.30 + 0.55 * act;
    t.matrix.makeBasis(tDir.clone().multiplyScalar(len), tSide, tUp);
    t.matrix.setPosition(0, 0, 0);
    t.matrixWorldNeedsUpdate = true;
  }
}

/* ══ กล้อง ═══════════════════════════════════════════════════════════ */
function focusRadius(id) {
  const r = REG[id].def.radius;
  return r * (S.enlarge && id !== 'sun' ? 25 : 1);
}
function defaultDist(id) {
  const rec = REG[id];
  if (rec && rec.craft) return rec.def.span * 1.6e-3;   // ขนาดตัวยาน (เมตร) → กิโลเมตร × 1.6
  return focusRadius(id) * (id === 'sun' ? 9 : 6.2);
}

function setFocus(id, instant) {
  if (id === S.focus && !trans.on) { camState.dist = defaultDist(id); return; }
  if (instant) {
    S.focus = id; camState.dist = defaultDist(id); trans.on = false;
  } else {
    trans.from = trans.on ? trans.to : S.focus;
    trans.to = id; trans.t = 0; trans.on = true;
    trans.d0 = camState.dist;
    trans.d1 = defaultDist(id);
    const sep = dist(worldOf(trans.from), worldOf(id));
    trans.dur = Math.min(2.6, 0.9 + Math.log10(1 + sep / 1e6) * 0.42);
  }
  syncCrumb();
  renderInfo();
}

const camDir = new THREE.Vector3();
function applyCamera() {
  const d = Math.max(1e-4, camState.dist / KMU);
  const ce = Math.cos(camState.el);
  camera.position.set(d * ce * Math.cos(camState.az), d * ce * Math.sin(camState.az), d * Math.sin(camState.el));
  camera.near = Math.max(1e-9, d * 2e-4);      // 1e-9 หน่วย ≈ 1 มิลลิเมตร
  camera.far = Math.max(1e7, d * 1e6);
  camera.updateProjectionMatrix();
  camera.lookAt(0, 0, 0);
  skyCam.quaternion.copy(camera.quaternion);

  // กล้องของฉากกาแล็กซี: ทิศเดียวกัน แต่ยืนอยู่ที่ตำแหน่งดวงอาทิตย์ในกาแล็กซี
  const dg = (camState.dist / LY) * GAL_U;
  camDir.copy(camera.position).normalize();
  galCam.position.copy(galSunPos).addScaledVector(camDir, dg);
  galCam.quaternion.copy(camera.quaternion);
  galCam.near = Math.max(0.004, dg * 0.02);
  galCam.far = Math.max(2000, dg * 40);
  galCam.updateProjectionMatrix();
}

function initControls() {
  const cv = $('#gl');
  let drag = false, px = 0, py = 0, moved = 0;
  cv.addEventListener('pointerdown', e => {
    drag = true; moved = 0; px = e.clientX; py = e.clientY;
    cv.setPointerCapture(e.pointerId); cv.classList.add('dragging');
  });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - px, dy = e.clientY - py;
    px = e.clientX; py = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    camState.az -= dx * 0.0052;
    camState.el = Math.max(-1.5, Math.min(1.5, camState.el + dy * 0.0052));
  });
  const end = e => {
    if (drag && moved < 4) pickAt(e.clientX, e.clientY);
    drag = false; cv.classList.remove('dragging');
  };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', () => { drag = false; cv.classList.remove('dragging'); });
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    zoomBy(Math.exp(e.deltaY * 0.0019));
  }, { passive: false });
  // นิ้วสองนิ้วบนจอสัมผัส
  let pinch = 0;
  cv.addEventListener('touchmove', e => {
    if (e.touches.length !== 2) return;
    const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY;
    const d = Math.hypot(dx, dy);
    if (pinch) zoomBy(pinch / d);
    pinch = d;
  }, { passive: true });
  cv.addEventListener('touchend', () => { pinch = 0; });
}

function zoomBy(f) {
  const minD = focusRadius(trans.on ? trans.to : S.focus) * 1.22;
  camState.dist = Math.max(minD, Math.min(MAX_DIST, camState.dist * f));
}

/* บันไดมาตราส่วน: ระยะกล้อง (กม.) ของแต่ละขั้น */
function ladderDist(k) {
  const id = trans.on ? trans.to : S.focus;
  switch (k) {
    case 0: return focusRadius(id) * 1.45;
    case 1: return defaultDist(id);
    case 2: return 34 * AU;
    case 3: return 120 * AU;
    case 4: return 90000 * AU;
    case 5: return 70 * LY;
    default: return 125000 * LY;
  }
}
function gotoScale(k) {
  if (k >= 2 && S.focus !== 'sun' && !trans.on) setFocus('sun');
  const d = ladderDist(k);
  if (trans.on) trans.d1 = d; else camState.dist = d;
  if (k === 2 || k === 3) camState.el = Math.max(camState.el, 0.42);
  // ขั้นกาแล็กซี: หันกล้องไปทางขั้วเหนือของทางช้างเผือก จะได้เห็นแขนกังหันเต็มใบ
  if (k === 6) { camState.az = Math.PI; camState.el = 0.90; }
}

/* ── ป้ายชื่อ ──────────────────────────────────────────────────────── */
const labelRecs = [];
function buildLabels() {
  for (const id of ORDER) {
    const rec = REG[id];
    const node = el('button', 'lbl' + (rec.isMoon ? ' moon' : rec.def.craft ? ' craft' : (rec.def.el ? ' small' : '')));
    node.style.color = '#' + rec.def.color.toString(16).padStart(6, '0');
    node.innerHTML = `<span class="ring"></span><span class="nm"></span>`;
    node.querySelector('.nm').textContent = rec.def.nm[S.lang];
    node.addEventListener('click', ev => { ev.stopPropagation(); setFocus(id); });
    labelLayer.appendChild(node);
    rec.label = node;
    rec.labelName = node.querySelector('.nm');
    rec.labelRing = node.querySelector('.ring');
    labelRecs.push(rec);
  }
}

const projV = new THREE.Vector3();
function updateLabels() {
  const W = innerWidth, H = innerHeight;
  const focus = trans.on ? trans.to : S.focus;
  const fovK = H / (2 * Math.tan(camera.fov * DEG / 2));
  const wide = camState.dist > 2600 * AU;      // ไกลจนดาวเคราะห์ทั้งระบบทับกันเป็นจุดเดียว
  for (const rec of labelRecs) {
    const node = rec.label;
    if (!S.labels || (rec.isMoon && !S.moons)) { node.hidden = true; continue; }
    if (rec.def.el && !rec.holder.visible) { node.hidden = true; continue; }
    if (wide && rec.def.id !== 'sun') { node.hidden = true; continue; }
    toScene(rec.world, projV);
    const camDist = projV.distanceTo(camera.position);
    projV.project(camera);
    if (projV.z > 1 || projV.x < -1.25 || projV.x > 1.25 || projV.y < -1.25 || projV.y > 1.25) {
      node.hidden = true; continue;
    }
    const scale = (S.enlarge && rec.def.id !== 'sun') ? 25 : 1;
    const rpx = (rec.R * scale) / Math.max(1e-9, camDist) * fovK;
    if (rec.isMoon && rec.def.id !== focus) {                 // ซ่อนดวงจันทร์เมื่ออยู่ชิดดาวแม่เกินไป
      toScene(worldOf(rec.parent), tmp).project(camera);
      const sep = Math.hypot((projV.x - tmp.x) * W * 0.5, (projV.y - tmp.y) * H * 0.5);
      if (sep < 24) { node.hidden = true; continue; }
    }
    node.hidden = false;
    node.style.left = ((projV.x * 0.5 + 0.5) * W).toFixed(1) + 'px';
    node.style.top = ((-projV.y * 0.5 + 0.5) * H - Math.max(11, rpx + 13)).toFixed(1) + 'px';
    node.classList.toggle('on', rec.def.id === focus);
    node.classList.toggle('dim', rpx < 0.7 && rec.def.id !== focus);
    rec.labelRing.style.display = rpx > 16 ? 'none' : '';
  }
}

function pickAt(cx, cy) {
  let best = null, bestD = 30;
  for (const rec of labelRecs) {
    if (rec.label.hidden) continue;
    toScene(rec.world, projV).project(camera);
    const x = (projV.x * 0.5 + 0.5) * innerWidth, y = (-projV.y * 0.5 + 0.5) * innerHeight;
    const d = Math.hypot(x - cx, y - cy);
    if (d < bestD) { bestD = d; best = rec.def.id; }
  }
  if (best) setFocus(best);
}

/* ── ท้องฟ้าจากจุดที่ยืนอยู่บนโลก ────────────────────────────────────────
   แปลงพิกัดสุริยวิถี (ที่ทั้งแผนที่ใช้) → พิกัดศูนย์สูตร → มุมเงย/ทิศ ของผู้สังเกต
   คิดพารัลแลกซ์จากการที่ผู้สังเกตยืนบนผิวโลก ไม่ใช่ที่ใจกลางโลกด้วย
   (สำคัญกับดวงจันทร์ ซึ่งเยื้องได้ถึงราวหนึ่งองศา)                        */
const OBLIQ = 23.4392911 * DEG;
const EARTH_R = 6378.14;
const norm360 = a => { a %= 360; return a < 0 ? a + 360 : a; };
const norm180 = a => { a = norm360(a); return a > 180 ? a - 360 : a; };

/* เวลาดาราคติที่กรีนิช (องศา) */
function gmstDeg(ms) { return norm360(280.46061837 + 360.98564736629 * days(ms)); }

/* ตำแหน่งโลกในพิกัดสุริยวิถี (กม.) — ผู้สังเกตทุกคนอ้างจากจุดนี้ */
const _e = V(), _o = V(), _m = V();
function earthAt(ms) { return planetPos('earth', ms, _e); }

/* วัตถุอยู่ตรงไหนบนท้องฟ้าของผู้สังเกต
   vec = ตำแหน่งวัตถุในพิกัดสุริยวิถี (กม.) · lat/lon = องศา (ตะวันออกเป็นบวก) */
function horizonOf(vec, ms, lat, lon, out) {
  const e = earthAt(ms);
  // เวกเตอร์จากใจกลางโลกไปยังวัตถุ แล้วเอียงเข้าระนาบศูนย์สูตร
  const x0 = vec.x - e.x, y0 = vec.y - e.y, z0 = vec.z - e.z;
  const ce = Math.cos(OBLIQ), se = Math.sin(OBLIQ);
  let x = x0, y = y0 * ce - z0 * se, z = y0 * se + z0 * ce;
  const lst = norm360(gmstDeg(ms) + lon) * DEG;
  const la = lat * DEG, cla = Math.cos(la), sla = Math.sin(la);
  // ย้ายจุดอ้างอิงจากใจกลางโลกมาที่ตัวผู้สังเกตบนผิวโลก
  x -= EARTH_R * cla * Math.cos(lst);
  y -= EARTH_R * cla * Math.sin(lst);
  z -= EARTH_R * sla;
  const r = Math.sqrt(x * x + y * y + z * z);
  const ra = Math.atan2(y, x), dec = Math.asin(z / r);
  const ha = lst - ra;
  const alt = Math.asin(sla * Math.sin(dec) + cla * Math.cos(dec) * Math.cos(ha));
  const az = Math.atan2(Math.sin(ha), Math.cos(ha) * sla - Math.tan(dec) * cla);
  out.alt = alt / DEG;
  out.az = norm360(az / DEG + 180);          // นับจากทิศเหนือ วนตามเข็ม
  out.ra = norm360(ra / DEG);
  out.dec = dec / DEG;
  out.dist = r;
  return out;
}

/* ตำแหน่งของวัตถุที่แผนที่รู้จัก ณ เวลาใดก็ได้ (ใช้กับตัวไล่หาเหตุการณ์) */
function bodyAt(id, ms, out) {
  if (id === 'sun') { out.x = out.y = out.z = 0; return out; }
  if (id === 'moon') {
    lunarPos(ms, out);
    const e = earthAt(ms);
    out.x += e.x; out.y += e.y; out.z += e.z;
    return out;
  }
  return planetPos(id, ms, out);
}

/* มุมระหว่างวัตถุสองดวงเมื่อมองจากโลก (องศา) */
const _a1 = V(), _a2 = V();
function sepDeg(idA, idB, ms) {
  const e = earthAt(ms);
  bodyAt(idA, ms, _a1); bodyAt(idB, ms, _a2);
  const ax = _a1.x - e.x, ay = _a1.y - e.y, az = _a1.z - e.z;
  const bx = _a2.x - e.x, by = _a2.y - e.y, bz = _a2.z - e.z;
  const da = Math.sqrt(ax * ax + ay * ay + az * az), db = Math.sqrt(bx * bx + by * by + bz * bz);
  const c = (ax * bx + ay * by + az * bz) / (da * db);
  return Math.acos(Math.max(-1, Math.min(1, c))) / DEG;
}

/* ลองจิจูดสุริยวิถีของดวงจันทร์เทียบดวงอาทิตย์ (0 = จันทร์ดับ, 180 = จันทร์เต็มดวง)
   และละติจูดสุริยวิถีของดวงจันทร์ ซึ่งเป็นตัวชี้ว่าจะเกิดอุปราคาหรือไม่ */
function moonPhaseAngle(ms) {
  const e = earthAt(ms);
  lunarPos(ms, _m);
  const sunLon = Math.atan2(-e.y, -e.x) / DEG;         // ดวงอาทิตย์เมื่อมองจากโลก
  const moonLon = Math.atan2(_m.y, _m.x) / DEG;
  const moonLat = Math.asin(_m.z / Math.sqrt(_m.x * _m.x + _m.y * _m.y + _m.z * _m.z)) / DEG;
  return { d: norm180(moonLon - sunLon), lat: moonLat };
}

/* ส่วนสว่างของดวงจันทร์ที่เห็นจากโลก 0–1 และข้างขึ้น/ข้างแรม */
function moonIllum(ms) {
  const el = sepDeg('sun', 'moon', ms);
  const p = moonPhaseAngle(ms);
  return { frac: (1 - Math.cos(el * DEG)) / 2, waxing: p.d > 0, elong: el };
}

/* เวลาขึ้น–ตกของวัตถุ: ไล่มุมเงยทีละ 6 นาทีตลอด 24 ชั่วโมง แล้วบีบหาจุดตัดขอบฟ้า
   h0 = มุมเงยที่ถือว่า “ขึ้น” (ดวงอาทิตย์กับดวงจันทร์ใช้ −0.833° เผื่อการหักเหและขนาดจาน) */
const _h1 = {}, _h2 = {};
function riseSet(id, ms0, lat, lon, h0) {
  const step = 360000;                     // 6 นาที
  let prev = null, rise = null, set = null;
  const tmp = V();
  for (let k = 0; k <= 240; k++) {
    const t = ms0 + k * step;
    bodyAt(id, t, tmp);
    horizonOf(tmp, t, lat, lon, _h1);
    const cur = _h1.alt - h0;
    if (prev !== null && prev.v <= 0 && cur > 0 && rise === null) rise = refineCross(id, prev.t, t, lat, lon, h0);
    if (prev !== null && prev.v > 0 && cur <= 0 && set === null) set = refineCross(id, prev.t, t, lat, lon, h0);
    prev = { t, v: cur };
  }
  return { rise, set };
}
function refineCross(id, t0, t1, lat, lon, h0) {
  const tmp = V();
  for (let i = 0; i < 22; i++) {
    const tm = (t0 + t1) / 2;
    bodyAt(id, tm, tmp);
    horizonOf(tmp, tm, lat, lon, _h2);
    const vm = _h2.alt - h0;
    bodyAt(id, t0, tmp);
    horizonOf(tmp, t0, lat, lon, _h1);
    if ((_h1.alt - h0) * vm <= 0) t1 = tm; else t0 = tm;
  }
  return (t0 + t1) / 2;
}

/* ── ตัวไล่หาเหตุการณ์บนท้องฟ้า ──────────────────────────────────────────
   ไม่ได้เปิดตารางสำเร็จรูปจากที่ไหน แต่ไล่คำนวณตำแหน่งจริงไปข้างหน้าทีละ 6 ชั่วโมง
   แล้วจับ "จังหวะที่ค่าพลิก" เช่น ตอนที่ดวงจันทร์แซงดวงอาทิตย์พอดี (จันทร์ดับ)
   หรือตอนที่มุมห่างของดาวสองดวงแคบที่สุด แล้วบีบหาเวลาให้ละเอียดขึ้นด้วยการแบ่งครึ่ง
   ยกเว้นฝนดาวตกที่ใช้วันที่ประกาศไว้ เพราะขึ้นกับธารฝุ่นไม่ใช่ตำแหน่งดาว     */

const MET_SHOWERS = [
  { m: 1,  d: 3,  zhr: 110, id: 'quadrantids', nm:{th:'ควอดรานติดส์', en:'Quadrantids'},
    parent:{th:'ดาวเคราะห์น้อย 2003 EH1', en:'asteroid 2003 EH1'} },
  { m: 4,  d: 22, zhr: 18,  id: 'lyrids', nm:{th:'ไลริดส์', en:'Lyrids'},
    parent:{th:'ดาวหางแทตเชอร์', en:'comet Thatcher'} },
  { m: 5,  d: 6,  zhr: 50,  id: 'etaaquariids', nm:{th:'อีตาอควาริดส์', en:'Eta Aquariids'},
    parent:{th:'ดาวหางฮัลเลย์', en:'comet Halley'}, body:'halley' },
  { m: 8,  d: 12, zhr: 100, id: 'perseids', nm:{th:'เพอร์เซอิดส์', en:'Perseids'},
    parent:{th:'ดาวหางสวิฟต์–ทัตเทิล', en:'comet Swift–Tuttle'}, body:'swifttuttle' },
  { m: 10, d: 21, zhr: 20,  id: 'orionids', nm:{th:'โอไรออนิดส์', en:'Orionids'},
    parent:{th:'ดาวหางฮัลเลย์', en:'comet Halley'}, body:'halley' },
  { m: 11, d: 17, zhr: 15,  id: 'leonids', nm:{th:'ลีโอนิดส์', en:'Leonids'},
    parent:{th:'ดาวหางเทมเพล–ทัตเทิล', en:'comet Tempel–Tuttle'}, body:'tempeltuttle' },
  { m: 12, d: 14, zhr: 120, id: 'geminids', nm:{th:'เจมินิดส์', en:'Geminids'},
    parent:{th:'ดาวเคราะห์น้อยเฟธอน', en:'asteroid Phaethon'} }
];

const PAIRS = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];
const OUTER = ['mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const INNER = ['mercury', 'venus'];

/* หาเวลาที่ค่าจากฟังก์ชัน f พลิกจากลบเป็นบวก ระหว่าง t0 กับ t1 */
function bisect(f, t0, t1) {
  for (let i = 0; i < 34; i++) {
    const m = (t0 + t1) / 2;
    if (f(m) < 0) t0 = m; else t1 = m;
  }
  return (t0 + t1) / 2;
}

/* เฟสของดวงจันทร์: d = 0 คือจันทร์ดับ, 180 คือจันทร์เต็มดวง */
function phaseDiff(ms, target) { return norm180(moonPhaseAngle(ms).d - target); }

function scanEvents(fromMs, days) {
  const out = [];
  const STEP = 6 * 3600000;
  const N = Math.ceil(days * 86400000 / STEP);
  const toMs = fromMs + days * 86400000;

  /* ── จันทร์ดับ · จันทร์เต็มดวง · อุปราคา ── */
  for (const [target, kind] of [[0, 'new'], [180, 'full']]) {
    let prev = phaseDiff(fromMs, target);
    for (let k = 1; k <= N; k++) {
      const t = fromMs + k * STEP;
      const cur = phaseDiff(t, target);
      if (prev < 0 && cur >= 0 && cur - prev < 90) {
        const tm = bisect(x => phaseDiff(x, target), t - STEP, t);
        const lat = Math.abs(moonPhaseAngle(tm).lat);
        // ดวงจันทร์ต้องอยู่ใกล้ระนาบสุริยวิถีพอ เงาถึงจะพาดถึงกัน
        const ecl = kind === 'new' ? (lat < 1.25) : (lat < 0.95);
        out.push({
          t: tm,
          type: ecl ? (kind === 'new' ? 'eclipseSun' : 'eclipseMoon') : (kind === 'new' ? 'newMoon' : 'fullMoon'),
          body: 'moon',
          beta: lat
        });
      }
      prev = cur;
    }
  }

  /* ── ดาวเคราะห์วงนอกอยู่ตรงข้ามดวงอาทิตย์ (คืนที่สว่างและอยู่บนฟ้าทั้งคืน) ── */
  for (const id of OUTER) {
    let p2 = sepDeg('sun', id, fromMs - STEP), p1 = sepDeg('sun', id, fromMs);
    for (let k = 1; k <= N; k++) {
      const t = fromMs + k * STEP;
      const p0 = sepDeg('sun', id, t);
      if (p1 > p2 && p1 >= p0 && p1 > 168) out.push({ t: t - STEP, type: 'opposition', body: id, val: p1 });
      p2 = p1; p1 = p0;
    }
  }

  /* ── ดาวพุธ/ดาวศุกร์ ห่างดวงอาทิตย์มากที่สุด (ช่วงที่หาดูง่ายที่สุด) ── */
  for (const id of INNER) {
    let p2 = sepDeg('sun', id, fromMs - STEP), p1 = sepDeg('sun', id, fromMs);
    for (let k = 1; k <= N; k++) {
      const t = fromMs + k * STEP;
      const p0 = sepDeg('sun', id, t);
      if (p1 > p2 && p1 >= p0 && p1 > 15) {
        // ตะวันออกของดวงอาทิตย์ = เห็นหัวค่ำ · ตะวันตก = เห็นเช้ามืด
        const e = earthAt(t - STEP);
        const sunLon = Math.atan2(-e.y, -e.x) / DEG;
        const pv = V(); planetPos(id, t - STEP, pv);
        const pl = Math.atan2(pv.y - e.y, pv.x - e.x) / DEG;
        out.push({ t: t - STEP, type: 'elongation', body: id, val: p1, evening: norm180(pl - sunLon) < 0 });
      }
      p2 = p1; p1 = p0;
    }
  }

  /* ── ดาวเคราะห์สองดวงเข้าใกล้กันบนท้องฟ้า ── */
  for (let i = 0; i < PAIRS.length; i++) {
    for (let j = i + 1; j < PAIRS.length; j++) {
      const A = PAIRS[i], B = PAIRS[j];
      let p2 = sepDeg(A, B, fromMs - STEP), p1 = sepDeg(A, B, fromMs);
      for (let k = 1; k <= N; k++) {
        const t = fromMs + k * STEP;
        const p0 = sepDeg(A, B, t);
        if (p1 < p2 && p1 <= p0 && p1 < 3.5) {
          // บีบหาจุดต่ำสุดให้ละเอียดขึ้น
          let a = t - 2 * STEP, b = t, best = p1, bt = t - STEP;
          for (let s = 0; s <= 24; s++) {
            const tt = a + (b - a) * s / 24, v = sepDeg(A, B, tt);
            if (v < best) { best = v; bt = tt; }
          }
          out.push({ t: bt, type: 'conjunction', body: A, body2: B, val: best });
        }
        p2 = p1; p1 = p0;
      }
    }
  }

  /* ── ฝนดาวตกประจำปี ── */
  const y0 = new Date(fromMs).getUTCFullYear();
  for (let y = y0; y <= y0 + Math.ceil(days / 365) + 1; y++) {
    for (const s of MET_SHOWERS) {
      const t = Date.UTC(y, s.m - 1, s.d, 20, 0);      // คืนที่มักตกชุกที่สุด
      if (t >= fromMs && t <= toMs) out.push({ t, type: 'meteor', shower: s, body: s.body || null });
    }
  }

  /* ── ดาวหางเข้าใกล้ดวงอาทิตย์ที่สุด ── */
  for (const s of (typeof SMALL !== 'undefined' ? SMALL : [])) {
    if (s.kind !== 'comet' && s.kind !== 'ism') continue;
    let tp = s.el.tp;
    if (s.orbitDays) {
      const from = 2451545 + (fromMs - J2000) / 86400000;
      const k = Math.ceil((from - tp) / s.orbitDays);
      tp += Math.max(0, k) * s.orbitDays;
    }
    const ms = (tp - 2451545) * 86400000 + J2000;
    if (ms >= fromMs && ms <= toMs) out.push({ t: ms, type: 'perihelion', body: s.id });
  }

  out.sort((a, b) => a.t - b.t);
  return out;
}

/* ══ รูปแบบตัวเลข ════════════════════════════════════════════════════ */
const nf = (v, d) => v.toLocaleString(S.lang === 'th' ? 'th-TH' : 'en-US',
  { minimumFractionDigits: d == null ? 0 : d, maximumFractionDigits: d == null ? 0 : d });

function fmtKm(km) {
  const t = L();
  if (km < 1e6) return `${nf(km, 0)}<u>${t.km}</u>`;
  const au = km / AU;
  if (au < 0.01) return `${nf(km / 1e6, 2)}<u>ล้าน ${t.km}</u>`.replace('ล้าน', S.lang === 'th' ? 'ล้าน' : 'M');
  return `${nf(au, au < 1 ? 4 : 3)}<u>${t.au}</u>`;
}
/* ระยะแบบสั้น ใช้กับบันไดมาตราส่วนและแถบบอกระยะมอง */
function fmtSpan(km) {
  const t = L();
  if (km < 1e6) return nf(km, 0) + ' ' + t.km;
  const au = km / AU;
  if (au < 0.02) return nf(km / 1e6, 2) + (S.lang === 'th' ? ' ล้าน กม.' : ' M km');
  if (au < 9000) return nf(au, au < 10 ? 2 : 0) + ' ' + t.au;
  const ly = km / LY;
  return nf(ly, ly < 10 ? 2 : 0) + ' ' + t.ly;
}
function fmtLight(km) {
  const t = L(), s = km / 299792.458;
  if (s < 90) return `${nf(s, 1)}<u>${t.sec}</u>`;
  if (s < 5400) return `${nf(s / 60, 1)}<u>${t.min}</u>`;
  return `${nf(s / 3600, 2)}<u>${t.hr}</u>`;
}
function fmtMass(kg) {
  if (kg < 1e7) return `${nf(kg, 0)}<u>${S.lang === 'th' ? 'กก.' : 'kg'}</u>`;
  const e = Math.floor(Math.log10(kg));
  const m = kg / Math.pow(10, e);
  return `${nf(m, 3)} × 10<sup>${e}</sup><u>${S.lang === 'th' ? 'กก.' : 'kg'}</u>`;
}
function fmtRot(h) {
  const t = L(), a = Math.abs(h);
  const s = a < 48 ? `${nf(a, 2)}<u>${t.hr}</u>` : `${nf(a / 24, 2)}<u>${t.day}</u>`;
  return h < 0 ? `${s} <u>(${t.retro})</u>` : s;
}
/* วันแบบจูเลียน (JD) → วันที่อ่านได้ */
function fmtJD(jd) {
  return fmtDate((jd - 2451545) * 86400000 + J2000);
}

/* ไล่เวลาผ่านจุดใกล้ดวงอาทิตย์สุดไปข้างหน้าทีละคาบจนเลยเวลาที่กำลังแสดง */
function nextPerihelion(def) {
  const now = 2451545 + days(S.time);
  let tp = def.el.tp;
  if (!def.orbitDays) return tp > now ? tp : null;
  const k = Math.ceil((now - tp) / def.orbitDays);
  return tp + Math.max(0, k) * def.orbitDays;
}

function fmtPeriod(days) {
  const t = L();
  return days < 700 ? `${nf(days, days < 10 ? 3 : 2)}<u>${t.day}</u>` : `${nf(days / 365.25, 2)}<u>${t.yr}</u>`;
}

/* ══ ส่วนติดต่อผู้ใช้ ════════════════════════════════════════════════ */
function syncCrumb() {
  const rec = REG[trans.on ? trans.to : S.focus];
  const t = L();
  const kind = rec.isMoon ? t.kind.moon : t.kind[rec.def.kind];
  $('#crumb').innerHTML = `<i>▸</i><b></b><i>·</i><span></span>`;
  $('#crumb b').textContent = rec.def.nm[S.lang];
  $('#crumb span').textContent = kind;
}

function renderInfo() {
  const t = L();
  const id = trans.on ? trans.to : S.focus;
  const rec = REG[id], def = rec.def;
  const pane = $('#pane-info');
  pane.innerHTML = '';

  const head = el('div', 'sec');
  const hd = el('div', 'obj-head');
  const sw = el('div', 'obj-swatch');
  sw.style.setProperty('--glow', def.glow || '#' + def.color.toString(16).padStart(6, '0'));
  const swImg = el('img');
  swImg.src = def._discURL; swImg.alt = '';
  swImg.style.cssText = 'width:100%;height:100%;display:block';
  sw.appendChild(swImg);
  const ti = el('div', 'obj-title');
  ti.innerHTML = `<h2></h2><div class="kind"><em></em><span></span></div>`;
  ti.querySelector('h2').textContent = def.nm[S.lang];
  ti.querySelector('.kind em').style.background = def.glow || '#888';
  ti.querySelector('.kind span').textContent =
    (rec.isMoon ? `${t.kind.moon} · ${REG[rec.parent].def.nm[S.lang]}` : t.kind[def.kind]);
  hd.append(sw, ti);
  head.appendChild(hd);
  const p = el('p', 'desc');
  p.textContent = def.desc[S.lang];
  head.appendChild(p);
  pane.appendChild(head);

  const live = el('div', 'sec');
  live.innerHTML = `<h3>${t.secLive}</h3><dl class="readout live" id="liveOut"></dl>`;
  pane.appendChild(live);

  const phys = el('div', 'sec');
  const rows = [];
  if (def.craft) {
    rows.push([t.craftSpan, `${nf(def.span, 0)}<u>${t.metre} · ${t.rApprox}</u>`]);
    rows.push([t.launch, fmtDate(Date.parse(def.launch + 'T00:00Z'))]);
    rows.push([t.status, def.status[S.lang]]);
  } else {
    rows.push([t.radius, `${nf(def.radius, def.radius < 100 ? (def.radius < 1 ? 3 : 1) : 0)}<u>${t.km}${def.rEst ? ' · ' + t.rApprox : ''}</u>`]);
  }
  if (def.mass != null) rows.push([t.mass, fmtMass(def.mass)]);
  if (def.gravity != null) rows.push([t.grav, `${nf(def.gravity, def.gravity < 0.01 ? 5 : 2)}<u>m/s²</u>`]);
  if (def.rotH != null) rows.push([t.rot, fmtRot(def.rotH)]);
  if (def.tilt != null && !def.el) rows.push([t.tilt, `${nf(def.tilt, 2)}<u>${t.deg}</u>`]);
  if (rec.isMoon) rows.push([t.period, fmtPeriod(Math.abs(def.period))]);
  else if (def.orbitDays) rows.push([t.period, fmtPeriod(def.orbitDays)]);
  if (!rec.isMoon && def.aAU) rows.push([t.semi, `${nf(def.aAU, 3)}<u>${t.au}</u>`]);
  const escaping = def.el && def.el.e >= 1;
  // ยานที่ถูกเหวี่ยงหนีระบบไปแล้ว จุดใกล้ดวงอาทิตย์สุดเป็นแค่จุดทางเรขาคณิต ไม่มีความหมาย
  if (def.q != null && !(def.craft && escaping)) rows.push([t.peri, `${nf(def.q, 3)}<u>${t.au}</u>`]);
  if (def.ad != null) rows.push([t.apo, `${nf(def.ad, def.ad < 100 ? 3 : 1)}<u>${t.au}</u>`]);
  // ความเร็วที่เหลือเมื่อพ้นแรงดึงของดวงอาทิตย์ไปแล้ว: v∞ = √(GM/|a|)
  if (escaping) rows.push([t.vInf, `${nf(29.7847 / Math.sqrt(Math.abs(def.el.a)), 2)}<u>${t.kms}</u>`]);
  if (def.cls) rows.push([t.sbClass, (SBCLASS[def.cls] || { th: def.cls, en: def.cls })[S.lang]]);
  if (def.el && def.special !== 'l2') {
    rows.push([t.elEpoch, fmtJD(def.epoch)]);
    if (!(def.craft && escaping)) {
      const next = def.orbitDays ? nextPerihelion(def) : (def.el.tp > 2451545 + days(S.time) ? def.el.tp : null);
      if (next) rows.push([t.nextPeri, fmtJD(next)]);
      else rows.push([t.lastPeri, fmtJD(def.el.tp)]);
    }
  }
  if (def.moons !== undefined) rows.push([t.nmoons, def.moons === '—' ? '—' : nf(def.moons)]);
  if (def.temp) rows.push([t.temp, S.lang === 'th' ? def.temp : (def.tempEn || def.temp)]);
  phys.innerHTML = `<h3>${t.secPhys}</h3><dl class="readout">` +
    rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('') + `</dl>`;
  if (def.special === 'l2') {
    const n2 = el('div', 'note');
    n2.innerHTML = `<span></span><p></p>`;
    n2.querySelector('span').textContent = t.sbClass;
    n2.querySelector('p').textContent = t.l2note;
    phys.appendChild(n2);
  }
  if (def.origin) {
    const note = el('div', 'note');
    note.innerHTML = `<span></span><p></p>`;
    note.querySelector('span').textContent = t.origin;
    note.querySelector('p').textContent = def.origin[S.lang];
    phys.appendChild(note);
  }
  pane.appendChild(phys);

  const kids = MOONS.filter(m => m.parent === id);
  if (kids.length) {
    const sec = el('div', 'sec');
    sec.innerHTML = `<h3>${t.secMoons}</h3>`;
    const chips = el('div', 'chips');
    for (const m of kids) {
      const c = el('button', 'chip', `<em style="background:#${m.color.toString(16).padStart(6, '0')}"></em>`);
      c.append(m.nm[S.lang]);
      c.addEventListener('click', () => setFocus(m.id));
      chips.appendChild(c);
    }
    sec.appendChild(chips);
    pane.appendChild(sec);
  }
  updateLive();
}

let liveT = 0;
function updateLive() {
  const box = $('#liveOut');
  if (!box) return;
  const t = L();
  const id = trans.on ? trans.to : S.focus;
  const rec = REG[id], def = rec.def;
  const w = rec.world, sun = worldOf('sun'), earth = worldOf('earth');
  const out = [];
  if (id !== 'sun') out.push([t.dSun, fmtKm(dist(w, sun))]);
  if (rec.isMoon) out.push([t.dParent, fmtKm(dist(w, worldOf(rec.parent)))]);
  if (id !== 'earth') {
    const de = dist(w, earth);
    out.push([t.dEarth, fmtKm(de)]);
    out.push([t.light, fmtLight(de)]);
    if (def.craft) out.push([t.lightRT, fmtLight(de * 2)]);
  } else {
    out.push([t.light, `${nf(dist(w, sun) / 299792.458 / 60, 2)}<u>${t.min} ${S.lang === 'th' ? 'จากดวงอาทิตย์' : 'from Sun'}</u>`]);
  }
  if (id !== 'sun') {                        // ความเร็วในวงโคจร: หาจากผลต่างตำแหน่ง 120 วินาที
    const a = V(), b = V();
    if (rec.isMoon) {
      const m = def;
      if (m.ecl) { lunarPos(S.time, a); lunarPos(S.time + 120000, b); }
      else { satellitePos(m, S.time, a); satellitePos(m, S.time + 120000, b); }
    } else if (def.craft) {
      craftPos(def, S.time, a); craftPos(def, S.time + 120000, b);
    } else {
      planetPos(id, S.time, a); planetPos(id, S.time + 120000, b);
    }
    // วัตถุวงโคจรไฮเพอร์โบลาไม่ได้ “โคจร” รอบดวงอาทิตย์ จึงเรียกแค่ความเร็ว
    const vLabel = (def.el && def.el.e >= 1) ? t.speedNow : t.speed;
    out.push([vLabel, `${nf(dist(a, b) / 120, 2)}<u>${t.kms}</u>`]);
  }
  box.innerHTML = out.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('');
}

/* ── เครื่องมือ ────────────────────────────────────────────────────── */
function renderTools() {
  const t = L(), pane = $('#pane-tools');
  pane.innerHTML = '';

  const cmp = el('div', 'sec');
  cmp.innerHTML = `<h3>${t.tCompare}</h3><div class="cmp" id="cmpBox"></div><dl class="readout" id="cmpOut"></dl>`;
  pane.appendChild(cmp);

  const ms = el('div', 'sec');
  ms.innerHTML = `<h3>${t.tMeasure}</h3>
    <div class="seg" style="margin-bottom:8px">
      <select id="mA" style="flex:1;height:30px;background:#0c121c;border:0;color:var(--ink);font-size:12px;padding:0 8px"></select>
      <select id="mB" style="flex:1;height:30px;background:#0c121c;border:0;color:var(--ink);font-size:12px;padding:0 8px"></select>
    </div>
    <dl class="readout live" id="mOut"></dl>`;
  pane.appendChild(ms);

  for (const sel of ['#mA', '#mB']) {
    const s = $(sel);
    for (const id of ORDER) {
      const o = el('option'); o.value = id; o.textContent = REG[id].def.nm[S.lang];
      s.appendChild(o);
    }
    s.value = sel === '#mA' ? S.measureA : S.measureB;
    s.addEventListener('change', () => {
      S.measureA = $('#mA').value; S.measureB = $('#mB').value; updateTools();
    });
  }
  updateTools();
}

function updateTools() {
  const t = L(), box = $('#cmpBox');
  if (!box) return;
  const id = trans.on ? trans.to : S.focus;
  const a = REG[id].def, b = REG[id === 'earth' ? 'sun' : 'earth'].def;
  const big = Math.max(a.radius, b.radius), MAXPX = 86;
  box.innerHTML = '';
  for (const d of [a, b]) {
    const px = Math.max(1.5, (d.radius / big) * MAXPX);
    const f = el('figure');
    const disc = el('div', 'disc');
    disc.style.cssText = `width:${px}px;height:${px}px;background-image:url(${d._discURL});background-size:cover`;
    const cap = el('figcaption');
    cap.innerHTML = `<b></b>${nf(d.radius, 0)} ${t.km}`;
    cap.querySelector('b').textContent = d.nm[S.lang];
    f.append(disc, cap);
    box.appendChild(f);
  }
  const ratio = a.radius / b.radius;
  $('#cmpOut').innerHTML =
    `<dt>${a.nm[S.lang]} ${t.cmpWith} ${b.nm[S.lang]}</dt><dd>${nf(ratio, ratio < 10 ? 2 : 1)} ×</dd>` +
    `<dt>${S.lang === 'th' ? 'ปริมาตรโดยประมาณ' : 'Volume ratio'}</dt><dd>${nf(Math.pow(ratio, 3), 2)} ×</dd>`;

  const A = worldOf(S.measureA), B = worldOf(S.measureB);
  const dkm = dist(A, B);
  $('#mOut').innerHTML =
    `<dt>${t.sep}</dt><dd>${fmtKm(dkm)}</dd>` +
    `<dt>${S.lang === 'th' ? 'เป็นกิโลเมตร' : 'In kilometres'}</dt><dd>${nf(dkm, 0)}<u>${t.km}</u></dd>` +
    `<dt>${t.lightTime}</dt><dd>${fmtLight(dkm)}</dd>`;
}

/* ── มุมมอง ────────────────────────────────────────────────────────── */
function renderView() {
  const t = L(), pane = $('#pane-view');
  pane.innerHTML = '';

  const lad = el('div', 'sec');
  lad.innerHTML = `<h3>${t.vScale}</h3><div class="ladder" id="ladder"></div>
    <p class="desc" style="font-size:12px">${t.ladderNote}</p>`;
  const lbox = lad.querySelector('#ladder');
  t.ladder.forEach((name, k) => {
    const b = el('button', 'rung');
    b.innerHTML = `<i></i><span></span><small class="num"></small>`;
    b.querySelector('span').textContent = name;
    b.querySelector('small').textContent = fmtSpan(ladderDist(k));
    b.addEventListener('click', () => gotoScale(k));
    lbox.appendChild(b);
  });
  pane.appendChild(lad);

  const cam = el('div', 'sec');
  cam.innerHTML = `<h3>${t.vCam}</h3><div class="seg" id="camSeg">
    <button data-c="near">${t.camNear}</button>
    <button data-c="top">${t.camTop}</button>
    <button data-c="edge">${t.camEdge}</button></div>`;
  pane.appendChild(cam);
  cam.querySelectorAll('#camSeg button').forEach(b => b.addEventListener('click', () => camPreset(b.dataset.c)));

  const toggles = [
    ['orbits', t.vOrbits], ['labels', t.vLabels], ['moons', t.vMoons],
    ['belt', t.vBelt], ['kuiper', t.vKuiper], ['oort', t.vOort],
    ['craft', t.vCraft], ['asteroids', t.vAsteroids], ['comets', t.vComets], ['dwarfs', t.vDwarfs],
    ['stars', t.vStars], ['galaxy', t.vGalaxy], ['grid', t.vGrid], ['trails', t.vTrails]
  ];
  const show = el('div', 'sec');
  show.innerHTML = `<h3>${t.vShow}</h3>`;
  const rows = el('div', 'rows');
  for (const [key, label] of toggles) {
    const r = el('div', 'row');
    const lb = el('label', null, label);
    const sw = el('button', 'sw' + (S[key] ? ' on' : ''));
    sw.setAttribute('aria-pressed', String(!!S[key]));
    const flip = () => {
      S[key] = !S[key];
      sw.classList.toggle('on', S[key]);
      sw.setAttribute('aria-pressed', String(S[key]));
      if (key === 'orbits') $('#tglOrb').classList.toggle('on', S.orbits);
      if (key === 'labels') $('#tglLbl').classList.toggle('on', S.labels);
      if (key === 'trails' && !S.trails) clearTrails();
    };
    lb.addEventListener('click', flip);
    sw.addEventListener('click', flip);
    r.append(lb, sw);
    rows.appendChild(r);
  }
  show.appendChild(rows);
  const sn = el('p', 'desc');
  sn.style.fontSize = '12px';
  sn.textContent = t.smallNote;
  show.appendChild(sn);
  pane.appendChild(show);

  const size = el('div', 'sec');
  size.innerHTML = `<h3>${t.vSize}</h3><div class="seg" id="szSeg">
      <button data-e="0" class="${S.enlarge ? '' : 'on'}">${t.sizeReal}</button>
      <button data-e="1" class="${S.enlarge ? 'on' : ''}">${t.sizeBig}</button></div>
    <p class="desc" style="font-size:12.5px">${t.sizeNote}</p>`;
  pane.appendChild(size);
  size.querySelectorAll('#szSeg button').forEach(b => b.addEventListener('click', () => {
    S.enlarge = b.dataset.e === '1';
    size.querySelectorAll('#szSeg button').forEach(x => x.classList.toggle('on', x === b));
    camState.dist = Math.max(camState.dist, focusRadius(S.focus) * 1.3);
  }));
}

function camPreset(kind) {
  if (kind === 'near') gotoScale(1);
  else if (kind === 'top') camState.el = 1.45;
  else camState.el = 0.05;
}

/* ── แท็บ “ท้องฟ้า”: มองจากจุดที่ยืนอยู่บนโลก + ปฏิทินเหตุการณ์ ────────── */
const SKY_PLACES = [
  { id:'bkk',    lat:13.7563, lon:100.5018, nm:{th:'กรุงเทพมหานคร', en:'Bangkok'} },
  { id:'cnx',    lat:18.7883, lon:98.9853,  nm:{th:'เชียงใหม่', en:'Chiang Mai'} },
  { id:'kkc',    lat:16.4419, lon:102.8360, nm:{th:'ขอนแก่น', en:'Khon Kaen'} },
  { id:'ubon',   lat:15.2448, lon:104.8473, nm:{th:'อุบลราชธานี', en:'Ubon Ratchathani'} },
  { id:'korat',  lat:14.9799, lon:102.0978, nm:{th:'นครราชสีมา', en:'Nakhon Ratchasima'} },
  { id:'hky',    lat:7.0086,  lon:100.4747, nm:{th:'หาดใหญ่', en:'Hat Yai'} },
  { id:'hkt',    lat:7.8804,  lon:98.3923,  nm:{th:'ภูเก็ต', en:'Phuket'} }
];
const SKY_BODIES = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const skyState = { lat: 13.7563, lon: 100.5018, place: 'bkk', events: null, evFrom: 0, evBusy: false };

function compass8(azDeg) {
  const k = Math.round(norm360(azDeg) / 45) % 8;
  return L().compass[k];
}

/* วงกลมท้องฟ้าทั้งใบ: กลางวง = เหนือหัว ขอบวง = ขอบฟ้า เหนืออยู่บน */
function domeSVG(rows) {
  const R = 86, C = 96;
  const pt = (alt, az) => {
    const r = (90 - alt) / 90 * R;
    return [C + r * Math.sin(az * DEG), C - r * Math.cos(az * DEG)];
  };
  let s = `<svg class="dome" viewBox="0 0 192 192" role="img">`;
  s += `<circle cx="${C}" cy="${C}" r="${R}" class="d-edge"/>`;
  s += `<circle cx="${C}" cy="${C}" r="${R * 2 / 3}" class="d-ring"/>`;
  s += `<circle cx="${C}" cy="${C}" r="${R / 3}" class="d-ring"/>`;
  s += `<line x1="${C - R}" y1="${C}" x2="${C + R}" y2="${C}" class="d-ring"/>`;
  s += `<line x1="${C}" y1="${C - R}" x2="${C}" y2="${C + R}" class="d-ring"/>`;
  const cd = L().cardinal;
  s += `<text x="${C}" y="${C - R - 4}" class="d-card" text-anchor="middle">${cd[0]}</text>`;
  s += `<text x="${C + R + 4}" y="${C + 4}" class="d-card" text-anchor="start">${cd[1]}</text>`;
  s += `<text x="${C}" y="${C + R + 12}" class="d-card" text-anchor="middle">${cd[2]}</text>`;
  s += `<text x="${C - R - 4}" y="${C + 4}" class="d-card" text-anchor="end">${cd[3]}</text>`;
  for (const r of rows) {
    if (r.alt <= 0) continue;
    const [x, y] = pt(r.alt, r.az);
    const rad = r.id === 'sun' ? 7 : r.id === 'moon' ? 6 : 3.4;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad}" fill="${r.col}" opacity="${r.dim ? 0.55 : 1}"/>`;
    s += `<text x="${x.toFixed(1)}" y="${(y - rad - 3).toFixed(1)}" class="d-lbl" text-anchor="middle" fill="${r.col}">${r.nm}</text>`;
  }
  s += `</svg>`;
  return s;
}

function skyRows() {
  const t = L(), rows = [], p = V(), o = {};
  const ids = SKY_BODIES.slice();
  const focus = trans.on ? trans.to : S.focus;
  if (REG[focus] && ids.indexOf(focus) < 0 && focus !== 'earth') ids.push(focus);
  for (const id of ids) {
    const rec = REG[id];
    if (!rec) continue;
    p.x = rec.world.x; p.y = rec.world.y; p.z = rec.world.z;
    horizonOf(p, S.time, skyState.lat, skyState.lon, o);
    rows.push({
      id, nm: rec.def.nm[S.lang], col: '#' + rec.def.color.toString(16).padStart(6, '0'),
      alt: o.alt, az: o.az, dim: o.alt < 10
    });
  }
  return rows;
}

function renderSky() {
  const t = L(), pane = $('#pane-sky');
  pane.innerHTML = '';

  const where = el('div', 'sec');
  where.innerHTML = `<h3>${t.skyWhere}</h3>
    <div class="seg" style="margin-bottom:8px">
      <select id="skyPlace" style="flex:1;height:30px;background:#0c121c;border:0;color:var(--ink);font-size:12px;padding:0 8px"></select>
      <button id="skyGeo" style="flex:none;padding:0 12px;height:30px;background:rgba(255,255,255,.04);font-size:11px">${t.skyHere}</button>
    </div>
    <p class="desc" id="skyCoord" style="font-size:12px;margin-top:0"></p>`;
  pane.appendChild(where);
  const sel = where.querySelector('#skyPlace');
  for (const pl of SKY_PLACES) {
    const op = el('option');
    op.value = pl.id; op.textContent = pl.nm[S.lang];
    sel.appendChild(op);
  }
  if (skyState.place === 'me') {
    const op = el('option');
    op.value = 'me'; op.textContent = t.skyMine;
    sel.appendChild(op);
  }
  sel.value = skyState.place;
  sel.addEventListener('change', () => {
    const pl = SKY_PLACES.find(x => x.id === sel.value);
    if (pl) { skyState.place = pl.id; skyState.lat = pl.lat; skyState.lon = pl.lon; updateSky(); }
  });
  where.querySelector('#skyGeo').addEventListener('click', () => {
    if (!navigator.geolocation) { toast(t.skyNoGeo); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      skyState.lat = pos.coords.latitude;
      skyState.lon = pos.coords.longitude;
      skyState.place = 'me';
      renderSky();
    }, () => toast(t.skyNoGeo), { timeout: 8000 });
  });

  const now = el('div', 'sec');
  now.innerHTML = `<h3>${t.skyNow}</h3><div id="skyDome"></div><dl class="readout live" id="skyList"></dl>
    <p class="desc" style="font-size:11.5px">${t.skyDomeNote}</p>`;
  pane.appendChild(now);

  const sm = el('div', 'sec');
  sm.innerHTML = `<h3>${t.skySunMoon}</h3><dl class="readout" id="skySM"></dl>`;
  pane.appendChild(sm);

  const evs = el('div', 'sec');
  evs.innerHTML = `<h3>${t.skyEvents}</h3><div id="skyEvents"><p class="desc">${t.skyCalc}</p></div>
    <p class="desc" style="font-size:11.5px">${t.skyEventNote}</p>`;
  pane.appendChild(evs);

  updateSky();
  // คำนวณปฏิทินหลังจากวาดหน้าเสร็จ จะได้ไม่ค้างตอนกดแท็บ
  setTimeout(() => renderEvents(), 30);
}

function updateSky() {
  const t = L();
  if (!$('#skyList')) return;
  $('#skyCoord').textContent =
    `${Math.abs(skyState.lat).toFixed(2)}° ${skyState.lat >= 0 ? t.latN : t.latS} · ` +
    `${Math.abs(skyState.lon).toFixed(2)}° ${skyState.lon >= 0 ? t.lonE : t.lonW}`;

  const rows = skyRows();
  $('#skyDome').innerHTML = domeSVG(rows);
  const sunAlt = rows[0].alt;
  const dark = sunAlt < -6;
  $('#skyList').innerHTML = rows.map(r => {
    const up = r.alt > 0;
    const good = up && dark && r.id !== 'sun';
    const mark = good ? ` <em class="up"></em>` : '';
    return `<dt${up ? '' : ' style="opacity:.45"'}>${r.nm}${mark}</dt>` +
      `<dd${up ? '' : ' style="opacity:.45;color:var(--muted)"'}>` +
      (up ? `${nf(r.alt, 0)}°<u>${compass8(r.az)} ${nf(r.az, 0)}°</u>` : `<u>${t.belowHorizon}</u>`) + `</dd>`;
  }).join('');

  // ดวงอาทิตย์ขึ้น–ตก และเฟสดวงจันทร์
  const key = Math.floor(S.time / 86400000) + '|' + skyState.lat.toFixed(3) + '|' + skyState.lon.toFixed(3);
  if (skyState.rsKey !== key) {
    const dayStart = S.time - 14 * 3600000;
    skyState.rsKey = key;
    skyState.su = riseSet('sun', dayStart, skyState.lat, skyState.lon, -0.833);
    skyState.mo = riseSet('moon', dayStart, skyState.lat, skyState.lon, -0.833);
  }
  const su = skyState.su, mo = skyState.mo;
  if (Math.abs(S.time - skyState.evFrom) > 30 * 86400000 &&
      performance.now() - (skyState.lastScan || 0) > 4000) renderEvents();

  const mi = moonIllum(S.time);
  const hm = ms => ms ? fmtClock(ms) : '—';
  const dur = (a, b) => (a && b) ? nf(Math.abs(b - a) / 3600000, 2) + '<u>' + t.hr + '</u>' : '—';
  $('#skySM').innerHTML =
    `<dt>${t.sunRise}</dt><dd>${hm(su.rise)}</dd>` +
    `<dt>${t.sunSet}</dt><dd>${hm(su.set)}</dd>` +
    `<dt>${t.dayLen}</dt><dd>${dur(su.rise, su.set)}</dd>` +
    `<dt>${t.moonRise}</dt><dd>${hm(mo.rise)}</dd>` +
    `<dt>${t.moonSet}</dt><dd>${hm(mo.set)}</dd>` +
    `<dt>${t.moonPhase}</dt><dd>${nf(mi.frac * 100, 0)}%<u>${mi.waxing ? t.waxing : t.waning}</u></dd>` +
    `<dt>${t.skyTwilight}</dt><dd>${sunAlt > -0.833 ? t.isDay : sunAlt > -18 ? t.isTwilight : t.isNight}</dd>`;
}

/* เวลาเฉพาะชั่วโมง:นาที ตามเขตเวลาที่คอนโซลกำลังใช้ */
function fmtClock(ms) {
  const d = new Date(ms), p = n => String(n).padStart(2, '0');
  return S.tzMode === 'utc'
    ? `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`
    : `${p(d.getHours())}:${p(d.getMinutes())}`;
}

const EV_ICON = {
  newMoon: '●', fullMoon: '○', eclipseSun: '◉', eclipseMoon: '◐',
  opposition: '◆', elongation: '◇', conjunction: '⊕', meteor: '✦', perihelion: '☄'
};

function eventText(e) {
  const t = L(), nm = id => (REG[id] ? REG[id].def.nm[S.lang] : id);
  switch (e.type) {
    case 'newMoon': return [t.evNewMoon, ''];
    case 'fullMoon': return [t.evFullMoon, ''];
    case 'eclipseSun': return [t.evEclipseSun, t.evBeta + ' ' + nf(e.beta, 2) + '°'];
    case 'eclipseMoon': return [t.evEclipseMoon, t.evBeta + ' ' + nf(e.beta, 2) + '°'];
    case 'opposition': return [nm(e.body) + ' ' + t.evOpposition, t.evOppNote];
    case 'elongation': return [nm(e.body) + ' ' + t.evElongation,
      nf(e.val, 1) + '° · ' + (e.evening ? t.evEvening : t.evMorning)];
    case 'conjunction': return [nm(e.body) + ' + ' + nm(e.body2), t.evSeparation + ' ' + nf(e.val, 2) + '°'];
    case 'meteor': return [t.evMeteor + ' ' + e.shower.nm[S.lang],
      '~' + e.shower.zhr + t.evPerHour + ' · ' + t.evFrom + ' ' + e.shower.parent[S.lang]];
    case 'perihelion': return [nm(e.body) + ' ' + t.evPerihelion, ''];
  }
  return ['', ''];
}

function renderEvents() {
  const box = $('#skyEvents');
  if (!box) return;
  const t = L();
  if (!skyState.events || Math.abs(S.time - skyState.evFrom) > 30 * 86400000) {
    skyState.evFrom = S.time;
    skyState.lastScan = performance.now();
    skyState.events = scanEvents(S.time, 400);
  }
  const p = V(), o = {};
  box.innerHTML = '';
  const list = el('div', 'events');
  for (const e of skyState.events.slice(0, 26)) {
    const [title, sub] = eventText(e);
    const row = el('button', 'ev');
    let vis = '';
    if (e.type === 'eclipseMoon' || e.type === 'eclipseSun') {
      const id = e.type === 'eclipseSun' ? 'sun' : 'moon';
      bodyAt(id, e.t, p);
      horizonOf(p, e.t, skyState.lat, skyState.lon, o);
      vis = o.alt > 0 ? t.evAboveHere : t.evBelowHere;
    }
    row.innerHTML = `<i>${EV_ICON[e.type] || '·'}</i><span class="when"></span><span class="what"><b></b><small></small></span>`;
    row.querySelector('.when').textContent = fmtDate(e.t) + ' ' + fmtClock(e.t);
    row.querySelector('b').textContent = title;
    row.querySelector('small').textContent = [sub, vis].filter(Boolean).join(' · ');
    row.addEventListener('click', () => {
      S.time = e.t; S.live = false; S.playing = false;
      if (e.body && REG[e.body]) setFocus(e.body);
      else if (e.type !== 'meteor') setFocus('earth');
      clearTrails();
      syncConsole();
      updateSky();
    });
    list.appendChild(row);
  }
  box.appendChild(list);
}

/* ── คอนโซลเวลา ────────────────────────────────────────────────────── */
const PLAY_ICON = '<svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 16 16"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z"/></svg>';

function getTzDisplay(d, lang) {
  let tzId = '';
  try { tzId = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const hrs = Math.floor(Math.abs(off) / 60);
  const mins = Math.abs(off) % 60;
  const gmt = `GMT${sign}${hrs}${mins ? ':' + String(mins).padStart(2, '0') : ''}`;

  if (tzId === 'Asia/Bangkok' || (sign === '+' && hrs === 7 && mins === 0)) {
    return lang === 'th' ? 'เวลาไทย' : 'Thai Time';
  }
  if (tzId.startsWith('Europe/')) {
    return lang === 'th' ? `เวลายุโรป (${gmt})` : `Europe (${gmt})`;
  }
  if (tzId.startsWith('America/')) {
    return lang === 'th' ? `อเมริกา (${gmt})` : `US (${gmt})`;
  }
  if (tzId.startsWith('Asia/Tokyo')) {
    return lang === 'th' ? 'เวลาญี่ปุ่น (JST)' : 'Japan (JST)';
  }
  return gmt;
}

function fmtDate(ms) {
  const d = new Date(ms);
  if (S.tzMode === 'utc') {
    const M = MONTHS[S.lang][d.getUTCMonth()];
    return `${d.getUTCDate()} ${M} ${d.getUTCFullYear()}`;
  }
  const M = MONTHS[S.lang][d.getMonth()];
  return `${d.getDate()} ${M} ${d.getFullYear()}`;
}

function fmtTime(ms) {
  const d = new Date(ms);
  const p = n => String(n).padStart(2, '0');
  if (S.tzMode === 'utc') {
    return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} <span class="tz-tag">UTC</span>`;
  }
  const tz = getTzDisplay(d, S.lang);
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} <span class="tz-tag">${tz}</span>`;
}

function syncConsole() {
  const t = L(), r = RATES[S.rateIdx];
  const d = new Date(S.time);
  $('#cDate').textContent = fmtDate(S.time);
  $('#cTime').innerHTML = fmtTime(S.time);
  $('#rateVal').textContent = (S.sign < 0 && S.rateIdx > 0 ? '− ' : '') + r[S.lang][0];
  $('#rateUnit').textContent = S.playing ? r[S.lang][1] : t.paused;
  $('#liveDot').classList.toggle('on', S.live && S.playing && S.rateIdx === 0 && S.sign > 0);
  $('#liveDot span').textContent = t.live;
  $('#play').innerHTML = S.playing ? PAUSE_ICON : PLAY_ICON;
  $('#scrub').value = String(S.sign * S.rateIdx);
  $('#scaleTxt').textContent = fmtSpan(camState.dist);
  $('#viewLbl').textContent = t.viewDist;
  if (S.tzMode === 'utc') {
    $('#jump').value = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  } else {
    $('#jump').value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  const clockBox = $('.clock');
  if (clockBox) {
    const tzDesc = getTzDisplay(d, S.lang);
    let iana = '';
    try { iana = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch(e) {}
    clockBox.title = S.tzMode === 'utc'
      ? (S.lang === 'th' ? `เวลาสากล (UTC) · คลิกเพื่อสลับเป็นเวลาเครื่อง (${tzDesc})` : `UTC · Click to switch to local time (${tzDesc})`)
      : (S.lang === 'th' ? `เวลาเครื่องผู้ใช้: ${tzDesc}${iana ? ' · ' + iana : ''} · คลิกเพื่อสลับเป็นเวลาสากล (UTC)` : `Device Local Time: ${tzDesc}${iana ? ' · ' + iana : ''} · Click to switch to UTC`);
  }
}
function setRate(v) {
  S.sign = v < 0 ? -1 : 1;
  S.rateIdx = Math.min(RATES.length - 1, Math.abs(v));
  if (S.rateIdx !== 0 || S.sign < 0) S.live = false;
  syncConsole();
}
function goNow() { S.time = Date.now(); S.live = true; S.sign = 1; S.rateIdx = 0; S.playing = true; syncConsole(); }

/* ── ค้นหา ─────────────────────────────────────────────────────────── */
function renderFind(filter) {
  const t = L(), body = $('#findBody');
  const q = (filter || '').trim().toLowerCase();
  const match = id => {
    const d = REG[id].def;
    return !q || d.nm.th.toLowerCase().includes(q) || d.nm.en.toLowerCase().includes(q) || id.includes(q);
  };
  const groups = [
    [t.gPlanets, BODIES.filter(b => b.kind === 'planet').map(b => b.id)],
    [t.gOther, BODIES.filter(b => b.kind !== 'planet').map(b => b.id)],
    [t.gMoons, MOONS.map(m => m.id)],
    [t.gCraft, CRAFT.map(c => c.id)],
    [t.gDwarfs, SMALL.filter(s => s.layer === 'dwarfs').map(s => s.id)],
    [t.gAsteroids, SMALL.filter(s => s.layer === 'asteroids').map(s => s.id)],
    [t.gComets, SMALL.filter(s => s.layer === 'comets').map(s => s.id)]
  ];
  body.innerHTML = '';
  let any = false;
  for (const [title, ids] of groups) {
    const hits = ids.filter(match);
    if (!hits.length) continue;
    any = true;
    const g = el('div', 'group', `<h4>${title}</h4>`);
    const grid = el('div', 'hits');
    for (const id of hits) {
      const d = REG[id].def;
      const b = el('button', 'hit',
        `<em style="color:#${d.color.toString(16).padStart(6, '0')};background:#${d.color.toString(16).padStart(6, '0')}"></em><span></span>`);
      const s = b.querySelector('span');
      s.innerHTML = `<b></b><small></small>`;
      s.querySelector('b').textContent = d.nm[S.lang];
      s.querySelector('small').textContent = REG[id].isMoon
        ? REG[REG[id].parent].def.nm[S.lang] : t.kind[d.kind];
      b.addEventListener('click', () => { setFocus(id); closeSheets(); });
      grid.appendChild(b);
    }
    g.appendChild(grid);
    body.appendChild(g);
  }
  if (!any) body.innerHTML = `<p class="prose">${t.noHit}</p>`;
}
function closeSheets() { $('#findSheet').hidden = true; $('#aboutSheet').hidden = true; }

/* ── สลับภาษา ──────────────────────────────────────────────────────── */
function applyLang() {
  const t = L();
  document.documentElement.lang = S.lang;
  $('#btnLang').textContent = S.lang === 'th' ? 'EN' : 'ไทย';
  $('#btnFind').querySelector('span').textContent = t.find;
  $('#btnHome').querySelector('span').textContent = t.home;
  $('#btnHome').title = t.homeTip;
  $('#btnShare').querySelector('span').textContent = t.share;
  $('#btnShare').title = t.shareTip;
  $('#btnShot').title = t.shotTip;
  $('#q').placeholder = t.findPh;
  document.querySelectorAll('[data-close]').forEach(b => b.textContent = t.close);
  document.querySelectorAll('.tabs button').forEach((b, i) => b.textContent = t.tabs[i]);
  $('#btnNow').textContent = t.now;
  $('#btnFrame').textContent = t.frame;
  $('#aboutTitle').textContent = t.about;
  $('#aboutBody').innerHTML = ABOUT[S.lang];
  $('#hint').textContent = t.hint;
  for (const rec of labelRecs) rec.labelName.textContent = rec.def.nm[S.lang];
  syncCrumb(); syncConsole(); renderInfo(); renderTools(); renderView(); renderFind($('#q').value);
  if (!$('#pane-sky').hidden) renderSky(); else $('#pane-sky').innerHTML = '';
}

/* ── กล่องแจ้งเตือนชั่วคราว ─────────────────────────────────────────── */
let toastTimer = 0;
function toast(msg) {
  const n = $('#toast');
  n.textContent = msg;
  n.hidden = false;
  requestAnimationFrame(() => n.classList.add('on'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    n.classList.remove('on');
    setTimeout(() => { n.hidden = true; }, 260);
  }, 2800);
}

/* ── สถานะในลิงก์: แชร์มุมมองนี้ให้คนอื่นเปิดเห็นภาพเดียวกัน ────────────
   รูปแบบ  #/earth?t=2026-09-10T15:45Z&d=39500&a=0.900,0.420
   ค่าที่ยังเป็นค่าเริ่มต้นจะไม่ถูกเขียนลงลิงก์ ลิงก์จึงสั้นเท่าที่สั้นได้     */
const LAYER_KEYS = ['orbits', 'labels', 'moons', 'belt', 'kuiper', 'oort', 'stars', 'galaxy', 'grid', 'trails',
                    'asteroids', 'comets', 'dwarfs', 'craft'];
const LAYER_DEF = { orbits: 1, labels: 1, moons: 1, belt: 1, kuiper: 1, oort: 1, stars: 1, galaxy: 1, grid: 0, trails: 0,
                    asteroids: 1, comets: 1, dwarfs: 1, craft: 1 };
let hashDist = 0;

function buildHash() {
  const q = [];
  q.push('t=' + (S.live && S.rateIdx === 0 && S.sign > 0
    ? 'live'
    : new Date(S.time).toISOString().slice(0, 16) + 'Z'));
  q.push('d=' + Number(camState.dist.toPrecision(5)));
  q.push('a=' + camState.az.toFixed(3) + ',' + camState.el.toFixed(3));
  if (S.rateIdx) q.push('r=' + S.sign * S.rateIdx);
  if (!S.playing) q.push('stop=1');
  if (S.enlarge) q.push('big=1');
  if (S.lang !== 'th') q.push('lang=' + S.lang);
  const off = LAYER_KEYS.filter(k => LAYER_DEF[k] && !S[k]);
  const on = LAYER_KEYS.filter(k => !LAYER_DEF[k] && S[k]);
  if (off.length) q.push('off=' + off.join(','));
  if (on.length) q.push('on=' + on.join(','));
  return '#/' + (trans.on ? trans.to : S.focus) + '?' + q.join('&');
}

let hashPrev = '', hashT = 0;
function writeHash(force) {
  const h = buildHash();
  if (h === hashPrev && !force) return;
  hashPrev = h;
  // เขียนแบบไม่เพิ่มประวัติ และไม่ถี่เกินไป — บางเบราว์เซอร์จำกัดจำนวนครั้ง
  try { history.replaceState(null, '', h); } catch (e) {}
}

function readHash() {
  const raw = (location.hash || '').replace(/^#\/?/, '');
  if (!raw) return;
  const cut = raw.indexOf('?');
  const id = decodeURIComponent(cut < 0 ? raw : raw.slice(0, cut));
  const p = new URLSearchParams(cut < 0 ? '' : raw.slice(cut + 1));
  if (p.get('lang') === 'en') S.lang = 'en';
  const t = p.get('t');
  if (t && t !== 'live') {
    const ms = Date.parse(t);
    if (!isNaN(ms)) { S.time = ms; S.live = false; }
  }
  const r = parseInt(p.get('r') || '0', 10);
  if (r) { S.sign = r < 0 ? -1 : 1; S.rateIdx = Math.min(RATES.length - 1, Math.abs(r)); S.live = false; }
  if (p.get('stop') === '1') S.playing = false;
  if (p.get('big') === '1') S.enlarge = true;
  for (const k of (p.get('off') || '').split(',')) if (LAYER_DEF[k] !== undefined) S[k] = false;
  for (const k of (p.get('on') || '').split(',')) if (LAYER_DEF[k] !== undefined) S[k] = true;
  const ae = (p.get('a') || '').split(',').map(Number);
  if (ae.length === 2 && isFinite(ae[0]) && isFinite(ae[1])) {
    camState.az = ae[0];
    camState.el = Math.max(-1.5, Math.min(1.5, ae[1]));
  }
  const d = parseFloat(p.get('d'));
  if (isFinite(d) && d > 0) hashDist = d;
  if (id && ORDER.indexOf(id) >= 0) S.focus = id;
}

function shareLink() {
  writeHash(true);
  const url = location.href;
  const ok = () => toast(L().shareOk);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(ok, () => copyFallback(url, ok));
  } else copyFallback(url, ok);
}

function copyFallback(text, ok) {
  const ta = el('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;top:-2000px;left:0;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  let done = false;
  try { done = document.execCommand('copy'); } catch (e) {}
  ta.remove();
  if (done) ok(); else toast(L().shareFail);
}

/* ── บันทึกภาพหน้าจอเป็นไฟล์ PNG ───────────────────────────────────────
   ต้องวาดใหม่แล้วอ่านภาพในจังหวะเดียวกัน เพราะบัฟเฟอร์ของ WebGL
   จะถูกล้างหลังคอมโพสิต (จึงไม่ต้องเปิด preserveDrawingBuffer ให้เปลืองแรม)
   ป้ายชื่อวัตถุเป็น DOM ไม่ได้อยู่ในบัฟเฟอร์ จึงวาดซ้ำลงผ้าใบ 2 มิติเอง     */
function snapshot() {
  const gl = renderer.domElement;
  renderFrame();
  const out = document.createElement('canvas');
  out.width = gl.width; out.height = gl.height;
  const g = out.getContext('2d');
  g.drawImage(gl, 0, 0);
  const k = gl.width / Math.max(1, innerWidth);
  drawLabelsOnto(g, k);
  drawStampOnto(g, k, out.width, out.height);
  const nm = REG[trans.on ? trans.to : S.focus].def.nm.en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const stamp = new Date(S.time).toISOString().slice(0, 16).replace('T', '_').replace(':', '');
  const a = el('a');
  a.download = `solar-atlas_${nm}_${stamp}.png`;
  a.href = out.toDataURL('image/png');
  a.click();
  toast(L().shotOk);
}

function drawLabelsOnto(g, k) {
  if (!S.labels) return;
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.lineWidth = 1.5 * k;
  for (const rec of labelRecs) {
    const node = rec.label;
    if (node.hidden) continue;
    const cx = parseFloat(node.style.left) * k, cy = parseFloat(node.style.top) * k;
    if (!isFinite(cx) || !isFinite(cy)) continue;
    const moon = rec.isMoon;
    const size = (moon ? 9.5 : 11) * k;
    g.font = `400 ${size.toFixed(2)}px "IBM Plex Mono", ui-monospace, monospace`;
    try { g.letterSpacing = (size * 0.09).toFixed(2) + 'px'; } catch (e) {}
    const txt = rec.def.nm[S.lang].toUpperCase();
    const tw = g.measureText(txt).width;
    const rr = (moon ? 3.5 : 5.5) * k;                     // รัศมีวงกลมนำหน้าชื่อ
    const showRing = rec.labelRing.style.display !== 'none';
    const gap = 7 * k;
    const total = (showRing ? rr * 2 + gap : 0) + tw;
    const x0 = cx - total / 2;
    g.globalAlpha = node.classList.contains('dim') ? 0.45 : 1;
    const col = '#' + rec.def.color.toString(16).padStart(6, '0');
    if (showRing) {
      g.strokeStyle = col;
      g.beginPath();
      g.arc(x0 + rr, cy, rr, 0, 6.2832);
      g.stroke();
    }
    g.shadowColor = '#000'; g.shadowBlur = 6 * k; g.shadowOffsetY = 1 * k;
    g.fillStyle = node.classList.contains('on') ? '#ffb454' : (moon ? '#a7b7cc' : '#e8eef7');
    g.fillText(txt, x0 + (showRing ? rr * 2 + gap : 0), cy);
    g.shadowBlur = 0; g.shadowOffsetY = 0;
    g.globalAlpha = 1;
  }
  try { g.letterSpacing = '0px'; } catch (e) {}
}

function drawStampOnto(g, k, W, H) {
  const pad = 20 * k;
  const focus = REG[trans.on ? trans.to : S.focus].def.nm[S.lang];
  const clock = fmtTime(S.time).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const line2 = `${focus} · ${fmtDate(S.time)} ${clock} · ${L().viewDist} ${fmtSpan(camState.dist)}`;
  g.save();
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 10 * k;
  g.font = `600 ${(14 * k).toFixed(2)}px "IBM Plex Sans Thai", system-ui, sans-serif`;
  g.fillStyle = 'rgba(232,238,247,.95)';
  g.fillText(S.lang === 'th' ? 'แผนที่ระบบสุริยะ' : 'Solar Atlas', pad, H - pad - 17 * k);
  g.font = `400 ${(10.5 * k).toFixed(2)}px "IBM Plex Mono", ui-monospace, monospace`;
  g.fillStyle = 'rgba(255,180,84,.92)';
  g.fillText(line2, pad, H - pad);
  g.restore();
}

/* ── ผูกปุ่มทั้งหมด ────────────────────────────────────────────────── */
function initUI() {
  document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
    for (const k of ['info', 'tools', 'view', 'sky']) $('#pane-' + k).hidden = (k !== b.dataset.tab);
    if (b.dataset.tab === 'sky' && !$('#skyList')) renderSky();
    $('#rail').classList.remove('closed');
  }));
  $('#railToggle').addEventListener('click', () => {
    const r = $('#rail');
    r.classList.toggle('closed');
    $('#railToggle').textContent = r.classList.contains('closed') ? '›' : '‹';
  });
  $('#play').addEventListener('click', () => { S.playing = !S.playing; syncConsole(); });
  $('#slower').addEventListener('click', () => setRate(S.sign * S.rateIdx - 1));
  $('#faster').addEventListener('click', () => setRate(S.sign * S.rateIdx + 1));
  $('#scrub').addEventListener('input', e => setRate(parseInt(e.target.value, 10)));
  $('#btnNow').addEventListener('click', goNow);
  $('#btnFrame').addEventListener('click', () => camPreset('near'));
  $('#jump').addEventListener('change', e => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split('-').map(Number);
    const cur = new Date(S.time);
    if (S.tzMode === 'utc') {
      S.time = Date.UTC(y, m - 1, d, cur.getUTCHours(), cur.getUTCMinutes());
    } else {
      const next = new Date(cur.getTime());
      next.setFullYear(y, m - 1, d);
      S.time = next.getTime();
    }
    S.live = false;
    syncConsole();
  });
  const clockEl = $('.clock');
  if (clockEl) {
    clockEl.addEventListener('click', () => {
      S.tzMode = S.tzMode === 'local' ? 'utc' : 'local';
      syncConsole();
    });
  }
  $('#zin').addEventListener('click', () => zoomBy(0.45));
  $('#zout').addEventListener('click', () => zoomBy(2.2));
  $('#topView').addEventListener('click', () => camPreset('top'));
  $('#tglLbl').addEventListener('click', () => { S.labels = !S.labels; $('#tglLbl').classList.toggle('on', S.labels); renderView(); });
  $('#tglOrb').addEventListener('click', () => { S.orbits = !S.orbits; $('#tglOrb').classList.toggle('on', S.orbits); renderView(); });
  $('#full').addEventListener('click', () => {
    const p = document.fullscreenElement
      ? document.exitFullscreen()
      : (document.documentElement.requestFullscreen && document.documentElement.requestFullscreen());
    if (p && p.catch) p.catch(() => {});      // บางบริบท เช่นใน iframe จะไม่อนุญาต
  });
  $('#btnFind').addEventListener('click', () => {
    $('#findSheet').hidden = false; renderFind(''); $('#q').value = ''; $('#q').focus();
  });
  $('#btnAbout').addEventListener('click', () => { $('#aboutSheet').hidden = false; });
  // ถูกฝังอยู่ในหน้าอื่น: หน้าแม่มีเมนูของตัวเองแล้ว ไม่ต้องมีปุ่มกลับซ้อน
  if (window.top !== window.self) $('#btnHome').hidden = true;
  $('#btnShare').addEventListener('click', shareLink);
  $('#btnShot').addEventListener('click', snapshot);
  $('#q').addEventListener('input', e => renderFind(e.target.value));
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeSheets));
  document.querySelectorAll('.overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) closeSheets(); }));
  $('#btnLang').addEventListener('click', () => { S.lang = S.lang === 'th' ? 'en' : 'th'; applyLang(); });

  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
      if (e.key === 'Escape') { closeSheets(); e.target.blur(); }
      return;
    }
    if (e.key === ' ') { e.preventDefault(); S.playing = !S.playing; syncConsole(); }
    else if (e.key === 'ArrowRight') setRate(S.sign * S.rateIdx + 1);
    else if (e.key === 'ArrowLeft') setRate(S.sign * S.rateIdx - 1);
    else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); $('#btnFind').click(); }
    else if (e.key === 'n' || e.key === 'N') goNow();
    else if (e.key === 'l' || e.key === 'L') shareLink();
    else if (e.key === 'p' || e.key === 'P') snapshot();
    else if (e.key === 't' || e.key === 'T') {
      S.trails = !S.trails;
      if (!S.trails) clearTrails();
      renderView();
      toast(L().vTrails + ' · ' + (S.trails ? (S.lang === 'th' ? 'เปิด' : 'on') : (S.lang === 'th' ? 'ปิด' : 'off')));
    }
    else if (e.key === 'Escape') closeSheets();
  });
}

/* ══ ลำดับการโหลด ════════════════════════════════════════════════════ */
const TEXSIZE = { big: [896, 448], mid: [640, 320], small: [512, 256], moon: [320, 160], tiny: [160, 80] };
const BIG = ['earth', 'jupiter'], MID = ['mars', 'saturn', 'mercury', 'venus'];

function textureJobs() {
  const jobs = [];
  const size = id => BIG.includes(id) ? TEXSIZE.big : MID.includes(id) ? TEXSIZE.mid : TEXSIZE.small;
  for (const b of BODIES) {
    jobs.push({ label: b.nm, run: () => {
      const [w, h] = size(b.id);
      b._tex = PAINTERS[b.id](w, h);
      if (b.id === 'earth') b._clouds = PAINTERS.earthClouds(384, 192);
    }});
  }
  const tints = {
    phobos: [128, 116, 104], deimos: [140, 128, 116], rhea: [200, 196, 188],
    titania: [162, 152, 144], oberon: [140, 130, 124], triton: [206, 198, 188], charon: [150, 142, 134]
  };
  for (const m of MOONS) {
    jobs.push({ label: m.nm, run: () => {
      const [w, h] = (m.radius < 50 ? TEXSIZE.tiny : TEXSIZE.moon);
      m._tex = PAINTERS[m.id]
        ? PAINTERS[m.id](w, h)
        : PAINTERS.rocky(w, h, tints[m.id] || [140, 132, 124], m.radius < 50 ? 150 : 260);
    }});
  }
  jobs.push({ label: { th:'วัตถุขนาดเล็ก', en:'Small bodies' }, run: () => {
    // พื้นผิวร่วมสี่แบบ: หินสว่าง · หินคาร์บอนคล้ำ · น้ำแข็ง · นิวเคลียสดาวหาง
    const shared = {
      rock: PAINTERS.rocky(256, 128, [150, 142, 132], 240),
      dark: PAINTERS.rocky(256, 128, [74, 70, 66], 240),
      ice:  PAINTERS.rocky(256, 128, [206, 200, 192], 170),
      nuc:  PAINTERS.rocky(192, 96, [66, 62, 60], 130)
    };
    for (const s of SMALL) {
      const lum = ((s.color >> 16 & 255) * 0.3 + (s.color >> 8 & 255) * 0.6 + (s.color & 255) * 0.1) / 255;
      s._tex = (s.kind === 'comet' || s.kind === 'ism') ? shared.nuc
             : (s.kind === 'tno' || s.kind === 'dwarf') ? shared.ice
             : (lum < 0.35 ? shared.dark : shared.rock);
    }
  }});
  return jobs;
}

function prepareData() {
  for (const b of BODIES) { REG[b.id] = null; ORDER.push(b.id); }
  for (const m of MOONS) ORDER.push(m.id);
  // ฐานพิกัดระนาบศูนย์สูตรของดาวแม่ สำหรับวงโคจรดวงจันทร์
  const bases = {};
  for (const b of BODIES) {
    const k = axisVector(b.tilt || 0, b.axisNode || 0);
    const i = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 0, 1), k);
    if (i.lengthSq() < 1e-9) i.set(1, 0, 0);
    i.normalize();
    const j = new THREE.Vector3().crossVectors(k, i).normalize();
    bases[b.id] = [i, j, k];
  }
  for (const c of CRAFT) {
    ORDER.push(c.id);
    c.radius = c.span / 2000;                  // ครึ่งหนึ่งของขนาดตัวยาน หน่วยกิโลเมตร
    c.tilt = 0; c.axisNode = 0;
  }
  for (const s of SMALL) {
    ORDER.push(s.id);
    s.tilt = 0; s.axisNode = 0;
    // ระยะมองที่ควรเห็นวัตถุนี้: อ้างจากขนาดวงโคจร (ไฮเพอร์โบลาใช้ระยะใกล้สุด)
    s._ref = (s.el.e < 1 ? s.aAU : s.q) * AU;
  }
  let seed = 1;
  for (const m of MOONS) {
    m._basis = bases[m.parent];
    m._phase = (seed = (seed * 9301 + 49297) % 233280) / 233280 * 6.283;
    m.kind = 'moon';
    m.rotH = m.period * 24;                 // ดวงจันทร์เหล่านี้หันด้านเดิมเข้าหาดาวแม่
    m.tilt = 0; m.axisNode = 0;
    m.glow = '#' + m.color.toString(16).padStart(6, '0');
  }
}

function buildAll() {
  for (const b of BODIES) {
    REG[b.id] = makeBody(b, false);
    b._disc = discPreview(b._tex, 96);
    b._discURL = b._disc.toDataURL('image/png');
    if (b.id !== 'sun') { orbitLine(REG[b.id]); trailLine(REG[b.id]); }
  }
  for (const c of CRAFT) {
    REG[c.id] = makeCraft(c);
    c._disc = craftDisc(c.color, 96);
    c._discURL = c._disc.toDataURL('image/png');
    if (c.special !== 'l2') {                  // ลำที่อยู่ L2 ไม่วาดวงโคจร เพราะมันเกาะไปกับโลก
      orbitLine(REG[c.id]);
      REG[c.id].line.material.opacity = 0.34;
    }
    trailLine(REG[c.id]);
  }
  for (const s of SMALL) {
    REG[s.id] = makeBody(s, false);
    s._disc = discPreview(s._tex, 96);
    s._discURL = s._disc.toDataURL('image/png');
    orbitLine(REG[s.id]);
    REG[s.id].line.material.opacity = 0.24;
    trailLine(REG[s.id]);
  }
  for (const m of MOONS) {
    REG[m.id] = makeBody(m, true);
    REG[m.id].parent = m.parent;
    m._disc = discPreview(m._tex, 96);
    m._discURL = m._disc.toDataURL('image/png');
    orbitLine(REG[m.id]);
    trailLine(REG[m.id]);
  }
  updatePositions(S.time);
  for (const id in REG) if (REG[id].line) refreshOrbit(REG[id], S.time);
}

let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.12, (now - last) / 1000);
  last = now;

  const tPrev = S.time;
  if (S.playing) {
    if (S.live && S.rateIdx === 0 && S.sign > 0) S.time = Date.now();
    else S.time += dt * 1000 * RATES[S.rateIdx].s * S.sign;
  }
  // เวลากระโดด (เลือกวันที่ · ปุ่มตอนนี้ · เปิดลิงก์ที่แชร์มา) → ร่องรอยเดิมใช้ต่อไม่ได้
  if (Math.abs(S.time - tPrev) > Math.max(3000, 5000 * dt * RATES[S.rateIdx].s)) clearTrails();
  updatePositions(S.time);
  updateOrigin(dt);
  updateScene();
  updateTrails();
  applyCamera();
  updateLabels();
  renderFrame();

  liveT += dt;
  if (liveT > 0.25) {
    liveT = 0;
    syncConsole();
    updateLive();
    if (!$('#pane-tools').hidden) updateTools();
    if (!$('#pane-sky').hidden) updateSky();
  }
  hashT += dt;
  if (hashT > 1.2) { hashT = 0; writeHash(); }
}

/* วาดสามชั้นเรียงจากไกลไปใกล้ — แยกออกมาเพื่อให้ปุ่มบันทึกภาพเรียกซ้ำได้ */
function renderFrame() {
  renderer.clear();
  if (galFade > 0.01) renderer.render(galScene, galCam);
  if (starFade > 0.01) renderer.render(skyScene, skyCam);
  renderer.clearDepth();
  renderer.render(scene, camera);
}

/* คืนคิวให้เบราว์เซอร์วาดหน้าจอโดยไม่ใช้ requestAnimationFrame
   เพราะ rAF จะถูกหน่วงเหลือ 1 ครั้ง/วินาที เมื่อแท็บไม่ได้อยู่หน้าสุด */
function yieldToPaint() {
  return new Promise(r => {
    const ch = new MessageChannel();
    ch.port1.onmessage = () => r();
    ch.port2.postMessage(0);
  });
}

async function boot() {
  const bar = $('#loadBar'), txt = $('#loadTxt');
  const step = (i, n, name) => {
    bar.style.width = (i / n * 100).toFixed(1) + '%';
    txt.textContent = (S.lang === 'th' ? 'กำลังสร้างพื้นผิว · ' : 'Painting surfaces · ') + name + `  ${i}/${n}`;
    return yieldToPaint();
  };
  initScene();
  prepareData();
  readHash();                       // ลิงก์ที่แชร์มากำหนดภาษา เวลา เป้าหมาย และกล้อง
  const jobs = textureJobs();
  for (let i = 0; i < jobs.length; i++) {
    await step(i, jobs.length, jobs[i].label[S.lang]);
    jobs[i].run();
  }
  txt.textContent = S.lang === 'th' ? 'กำลังประกอบฉาก' : 'Assembling scene';
  bar.style.width = '100%';
  await yieldToPaint();

  buildAll();
  buildLabels();
  initControls();
  initUI();
  applyLang();
  camState.dist = defaultDist(S.focus);
  setFocus(S.focus, true);
  if (hashDist) camState.dist = Math.max(focusRadius(S.focus) * 1.22, Math.min(MAX_DIST, hashDist));
  syncConsole();
  requestAnimationFrame(loop);
  setTimeout(() => { $('#loading').classList.add('gone'); }, 220);
  setTimeout(() => { $('#loading').remove(); }, 1200);
  setTimeout(() => { const h = $('#hint'); if (h) h.style.opacity = '0'; }, 9000);
}

if (typeof THREE === 'undefined') {
  $('#loadTxt').textContent = 'ไม่สามารถโหลด three.js ได้ — ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
} else {
  boot();
}
