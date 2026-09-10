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
  live: true,
  playing: true,
  rateIdx: 0,
  sign: 1,
  focus: 'earth',
  orbits: true, labels: true, moons: true, belt: true, kuiper: true, oort: true,
  stars: true, galaxy: true, grid: false,
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
function tex(canvas, srgb) {
  const t = new THREE.CanvasTexture(canvas);
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  if (srgb !== false) t.encoding = THREE.sRGBEncoding;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

function makeBody(def, isMoon) {
  const R = def.radius / KMU;
  const holder = new THREE.Group();            // ตำแหน่งในฉาก
  const spin = new THREE.Group();              // แกนเอียง + การหมุนรอบตัวเอง
  holder.add(spin);

  const geo = new THREE.SphereGeometry(1, isMoon ? 40 : 64, isMoon ? 24 : 40);
  const map = tex(def._tex);
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
function updatePositions(ms) {
  const sun = REG.sun;
  sun.world.x = sun.world.y = sun.world.z = 0;
  for (const id in ELEMENTS) planetPos(id, ms, REG[id].world);
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
    rec.mesh.scale.setScalar(rec.R * scale);
    if (rec.clouds) rec.clouds.scale.setScalar(rec.R * scale * 1.012);
    if (rec.ring) rec.ring.scale.setScalar(scale);
    if (rec.glow) rec.glow.scale.setScalar(rec.R * 7);
    const rotH = def.rotH != null ? def.rotH : (def.period * 24);
    const ang = 2 * Math.PI * d / (rotH / 24);
    rec.spin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rec.axis);
    rec.spin.rotateY(ang % (2 * Math.PI));
    if (rec.line) {
      const pw = rec.parent ? worldOf(rec.parent) : { x: 0, y: 0, z: 0 };
      toScene(pw, rec.line.position);
      if (Math.abs(S.time - rec.lineT) > (rec.isMoon ? 3.15e10 : 1.6e11)) refreshOrbit(rec, S.time);
      rec.line.visible = S.orbits && (!rec.isMoon || S.moons);
    }
    rec.holder.visible = !rec.isMoon || S.moons;
  }
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

/* ══ กล้อง ═══════════════════════════════════════════════════════════ */
function focusRadius(id) {
  const r = REG[id].def.radius;
  return r * (S.enlarge && id !== 'sun' ? 25 : 1);
}
function defaultDist(id) { return focusRadius(id) * (id === 'sun' ? 9 : 6.2); }

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
  camera.near = Math.max(0.0005, d * 2e-4);
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
    const node = el('button', 'lbl' + (rec.isMoon ? ' moon' : ''));
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
  const e = Math.floor(Math.log10(kg));
  const m = kg / Math.pow(10, e);
  return `${nf(m, 3)} × 10<sup>${e}</sup><u>${S.lang === 'th' ? 'กก.' : 'kg'}</u>`;
}
function fmtRot(h) {
  const t = L(), a = Math.abs(h);
  const s = a < 48 ? `${nf(a, 2)}<u>${t.hr}</u>` : `${nf(a / 24, 2)}<u>${t.day}</u>`;
  return h < 0 ? `${s} <u>(${t.retro})</u>` : s;
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
  rows.push([t.radius, `${nf(def.radius, def.radius < 100 ? 1 : 0)}<u>${t.km}</u>`]);
  rows.push([t.mass, fmtMass(def.mass)]);
  rows.push([t.grav, `${nf(def.gravity, 2)}<u>m/s²</u>`]);
  if (def.rotH != null) rows.push([t.rot, fmtRot(def.rotH)]);
  if (def.tilt != null) rows.push([t.tilt, `${nf(def.tilt, 2)}<u>${t.deg}</u>`]);
  if (rec.isMoon) rows.push([t.period, fmtPeriod(Math.abs(def.period))]);
  else if (def.orbitDays) rows.push([t.period, fmtPeriod(def.orbitDays)]);
  if (!rec.isMoon && def.aAU) rows.push([t.semi, `${nf(def.aAU, 3)}<u>${t.au}</u>`]);
  if (def.moons !== undefined) rows.push([t.nmoons, def.moons === '—' ? '—' : nf(def.moons)]);
  if (def.temp) rows.push([t.temp, S.lang === 'th' ? def.temp : (def.tempEn || def.temp)]);
  phys.innerHTML = `<h3>${t.secPhys}</h3><dl class="readout">` +
    rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('') + `</dl>`;
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
  } else {
    out.push([t.light, `${nf(dist(w, sun) / 299792.458 / 60, 2)}<u>${t.min} ${S.lang === 'th' ? 'จากดวงอาทิตย์' : 'from Sun'}</u>`]);
  }
  if (id !== 'sun') {                        // ความเร็วในวงโคจร: หาจากผลต่างตำแหน่ง 120 วินาที
    const a = V(), b = V();
    if (rec.isMoon) {
      const m = def;
      if (m.ecl) { lunarPos(S.time, a); lunarPos(S.time + 120000, b); }
      else { satellitePos(m, S.time, a); satellitePos(m, S.time + 120000, b); }
    } else {
      planetPos(id, S.time, a); planetPos(id, S.time + 120000, b);
    }
    out.push([t.speed, `${nf(dist(a, b) / 120, 2)}<u>${t.kms}</u>`]);
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
    ['stars', t.vStars], ['galaxy', t.vGalaxy], ['grid', t.vGrid]
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
    };
    lb.addEventListener('click', flip);
    sw.addEventListener('click', flip);
    r.append(lb, sw);
    rows.appendChild(r);
  }
  show.appendChild(rows);
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

/* ── คอนโซลเวลา ────────────────────────────────────────────────────── */
const PLAY_ICON = '<svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 16 16"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z"/></svg>';

function fmtDate(ms) {
  const d = new Date(ms);
  const M = MONTHS[S.lang][d.getUTCMonth()];
  return `${d.getUTCDate()} ${M} ${d.getUTCFullYear()}`;
}
function fmtTime(ms) {
  const d = new Date(ms);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
}
function syncConsole() {
  const t = L(), r = RATES[S.rateIdx];
  $('#cDate').textContent = fmtDate(S.time);
  $('#cTime').textContent = fmtTime(S.time);
  $('#rateVal').textContent = (S.sign < 0 && S.rateIdx > 0 ? '− ' : '') + r[S.lang][0];
  $('#rateUnit').textContent = S.playing ? r[S.lang][1] : t.paused;
  $('#liveDot').classList.toggle('on', S.live && S.playing && S.rateIdx === 0 && S.sign > 0);
  $('#liveDot span').textContent = t.live;
  $('#play').innerHTML = S.playing ? PAUSE_ICON : PLAY_ICON;
  $('#scrub').value = String(S.sign * S.rateIdx);
  $('#scaleTxt').textContent = fmtSpan(camState.dist);
  $('#viewLbl').textContent = t.viewDist;
  const d = new Date(S.time);
  $('#jump').value = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
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
    [t.gMoons, MOONS.map(m => m.id)]
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
}

/* ── ผูกปุ่มทั้งหมด ────────────────────────────────────────────────── */
function initUI() {
  document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
    for (const k of ['info', 'tools', 'view']) $('#pane-' + k).hidden = (k !== b.dataset.tab);
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
    S.time = Date.UTC(y, m - 1, d, cur.getUTCHours(), cur.getUTCMinutes());
    S.live = false;
    syncConsole();
  });
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
    if (b.id !== 'sun') orbitLine(REG[b.id]);
  }
  for (const m of MOONS) {
    REG[m.id] = makeBody(m, true);
    REG[m.id].parent = m.parent;
    m._disc = discPreview(m._tex, 96);
    m._discURL = m._disc.toDataURL('image/png');
    orbitLine(REG[m.id]);
  }
  updatePositions(S.time);
  for (const id in REG) if (REG[id].line) refreshOrbit(REG[id], S.time);
}

let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.12, (now - last) / 1000);
  last = now;

  if (S.playing) {
    if (S.live && S.rateIdx === 0 && S.sign > 0) S.time = Date.now();
    else S.time += dt * 1000 * RATES[S.rateIdx].s * S.sign;
  }
  updatePositions(S.time);
  updateOrigin(dt);
  updateScene();
  applyCamera();
  updateLabels();

  renderer.clear();
  if (galFade > 0.01) renderer.render(galScene, galCam);
  if (starFade > 0.01) renderer.render(skyScene, skyCam);
  renderer.clearDepth();
  renderer.render(scene, camera);

  liveT += dt;
  if (liveT > 0.25) {
    liveT = 0;
    syncConsole();
    updateLive();
    if (!$('#pane-tools').hidden) updateTools();
  }
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
