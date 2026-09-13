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
  asteroids: true, comets: true, dwarfs: true, craft: true, figures: true, deep: true, exo: true,
  shadows: true, cosmic: true, cmb: true, ism: true, darkmatter: true,
  enlarge: false,
  measureA: 'earth', measureB: 'mars'
};
const L = () => UI[S.lang];

/* ── มาตราส่วนใหญ่: จากผิวดาวถึงกาแล็กซี ───────────────────────────── */
const LY = 9.4607304726e12;        // กิโลเมตรต่อหนึ่งปีแสง
const GAL_U = 0.001;               // 1 หน่วยในฉากกาแล็กซี = 1,000 ปีแสง
const SUN_R_GAL = 26.0;            // ดวงอาทิตย์ห่างใจกลางทางช้างเผือก 26,000 ปีแสง
const MAX_DIST = 150000e6 * LY;    // ซูมออกได้ไกลสุด: เห็นขอบเอกภพที่สังเกตได้ทั้งวง
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

/* ดวงจันทร์ของโลก — ทฤษฎี ELP-2000/82 ฉบับย่อของ Jean Meeus
   (Astronomical Algorithms ฉบับที่ 2 บทที่ 47): 60 พจน์สำหรับลองจิจูดและระยะทาง
   อีก 60 พจน์สำหรับละติจูด แม่นราว 10″ ในลองจิจูด และ 4″ ในละติจูด
   ผลของสูตรอ้างกับวิษุวัตเฉลี่ย "ของวันนั้น" แต่ดาวเคราะห์ทุกดวงในแผนที่อ้างกรอบ J2000
   จึงต้องหมุนกลับด้วยการหมุนควง (precession) ก่อนใช้ — ถ้าไม่หมุน ปี 2570 จะคลาดกัน 0.38°
   ซึ่งเท่ากับดวงจันทร์เดินราว 40 นาที เงาสุริยุปราคาจะเลื่อนไปทั้งทวีป
   ตัวเลขตรวจกับตัวอย่าง 47.a ของ Meeus และกับ JPL Horizons แล้ว                          */

/* ต่อแถว: D, M, M′, F, Σl (หน่วย 10⁻⁶ องศา), Σr (หน่วย เมตร) */
const MOON_LR = [
  0, 0, 1, 0, 6288774, -20905355,    2, 0, -1, 0, 1274027, -3699111,
  2, 0, 0, 0, 658314, -2955968,      0, 0, 2, 0, 213618, -569925,
  0, 1, 0, 0, -185116, 48888,        0, 0, 0, 2, -114332, -3149,
  2, 0, -2, 0, 58793, 246158,        2, -1, -1, 0, 57066, -152138,
  2, 0, 1, 0, 53322, -170733,        2, -1, 0, 0, 45758, -204586,
  0, 1, -1, 0, -40923, -129620,      1, 0, 0, 0, -34720, 108743,
  0, 1, 1, 0, -30383, 104755,        2, 0, 0, -2, 15327, 10321,
  0, 0, 1, 2, -12528, 0,             0, 0, 1, -2, 10980, 79661,
  4, 0, -1, 0, 10675, -34782,        0, 0, 3, 0, 10034, -23210,
  4, 0, -2, 0, 8548, -21636,         2, 1, -1, 0, -7888, 24208,
  2, 1, 0, 0, -6766, 30824,          1, 0, -1, 0, -5163, -8379,
  1, 1, 0, 0, 4987, -16675,          2, -1, 1, 0, 4036, -12831,
  2, 0, 2, 0, 3994, -10445,          4, 0, 0, 0, 3861, -11650,
  2, 0, -3, 0, 3665, 14403,          0, 1, -2, 0, -2689, -7003,
  2, 0, -1, 2, -2602, 0,             2, -1, -2, 0, 2390, 10056,
  1, 0, 1, 0, -2348, 6322,           2, -2, 0, 0, 2236, -9884,
  0, 1, 2, 0, -2120, 5751,           0, 2, 0, 0, -2069, 0,
  2, -2, -1, 0, 2048, -4950,         2, 0, 1, -2, -1773, 4130,
  2, 0, 0, 2, -1595, 0,              4, -1, -1, 0, 1215, -3958,
  0, 0, 2, 2, -1110, 0,              3, 0, -1, 0, -892, 3258,
  2, 1, 1, 0, -810, 2616,            4, -1, -2, 0, 759, -1897,
  0, 2, -1, 0, -713, -2117,          2, 2, -1, 0, -700, 2354,
  2, 1, -2, 0, 691, 0,               2, -1, 0, -2, 596, 0,
  4, 0, 1, 0, 549, -1423,            0, 0, 4, 0, 537, -1117,
  4, -1, 0, 0, 520, -1571,           1, 0, -2, 0, -487, -1739,
  2, 1, 0, -2, -399, 0,              0, 0, 2, -2, -381, -4421,
  1, 1, 1, 0, 351, 0,                3, 0, -2, 0, -340, 0,
  4, 0, -3, 0, 330, 0,               2, -1, 2, 0, 327, 0,
  0, 2, 1, 0, -323, 1165,            1, 1, -1, 0, 299, 0,
  2, 0, 3, 0, 294, 0,                2, 0, -1, -2, 0, 8752
];

/* ต่อแถว: D, M, M′, F, Σb (หน่วย 10⁻⁶ องศา) */
const MOON_B = [
  0, 0, 0, 1, 5128122,    0, 0, 1, 1, 280602,     0, 0, 1, -1, 277693,
  2, 0, 0, -1, 173237,    2, 0, -1, 1, 55413,     2, 0, -1, -1, 46271,
  2, 0, 0, 1, 32573,      0, 0, 2, 1, 17198,      2, 0, 1, -1, 9266,
  0, 0, 2, -1, 8822,      2, -1, 0, -1, 8216,     2, 0, -2, -1, 4324,
  2, 0, 1, 1, 4200,       2, 1, 0, -1, -3359,     2, -1, -1, 1, 2463,
  2, -1, 0, 1, 2211,      2, -1, -1, -1, 2065,    0, 1, -1, -1, -1870,
  4, 0, -1, -1, 1828,     0, 1, 0, 1, -1794,      0, 0, 0, 3, -1749,
  0, 1, -1, 1, -1565,     1, 0, 0, 1, -1491,      0, 1, 1, 1, -1475,
  0, 1, 1, -1, -1410,     0, 1, 0, -1, -1344,     1, 0, 0, -1, -1335,
  0, 0, 3, 1, 1107,       4, 0, 0, -1, 1021,      4, 0, -1, 1, 833,
  0, 0, 1, -3, 777,       4, 0, -2, 1, 671,       2, 0, 0, -3, 607,
  2, 0, 2, -1, 596,       2, -1, 1, -1, 491,      2, 0, -2, 1, -451,
  0, 0, 3, -1, 439,       2, 0, 2, 1, 422,        2, 0, -3, -1, 421,
  2, 1, -1, 1, -366,      2, 1, 0, 1, -351,       4, 0, 0, 1, 331,
  2, -1, 1, 1, 315,       2, -2, 0, -1, 302,      0, 0, 1, 3, -283,
  2, 1, 1, -1, -229,      1, 1, 0, -1, 223,       1, 1, 0, 1, 223,
  0, 1, -2, -1, -220,     2, 1, -1, -1, -220,     1, 0, 1, 1, -185,
  2, -1, -2, -1, 181,     0, 1, 2, 1, -177,       4, 0, -2, -1, 176,
  4, -1, -1, -1, 166,     1, 0, 1, -1, -164,      4, 0, 1, -1, 132,
  1, 0, -1, -1, -119,     4, -1, 0, -1, 115,      2, -2, 0, 1, 107
];

/* ΔT = TT − UT (วินาที) — นาฬิกาปรมาณูเดินเร็วกว่าการหมุนของโลก
   ดวงจันทร์เดินราว 1 กม./วินาที ถ้าไม่ชดเชย 69 วินาที เงาจะคลาดราว 70 กม.
   ค่า 1950–2025 จากการวัดจริง (IERS) หลังจากนั้นเป็นการประมาณ ก่อนหน้าใช้สูตรระยะยาวของ Espenak–Meeus */
const DELTA_T = [1950, 29.1, 1955, 31.1, 1960, 33.2, 1965, 35.7, 1970, 40.2, 1975, 45.5, 1980, 50.5,
                 1985, 54.3, 1990, 56.9, 1995, 60.8, 2000, 63.8, 2005, 64.7, 2010, 66.1, 2015, 67.6,
                 2020, 69.4, 2025, 69.2];
function deltaT(ms) {
  const y = 2000 + days(ms) / 365.25;
  const n = DELTA_T.length;
  if (y <= DELTA_T[0]) { const u = (y - 1820) / 100; return -20 + 32 * u * u - 4.98; }
  if (y >= DELTA_T[n - 2]) { const k = y - DELTA_T[n - 2]; return DELTA_T[n - 1] + 0.3 * k + 0.004 * k * k; }
  for (let i = 0; i < n - 2; i += 2) {
    if (y < DELTA_T[i + 2]) {
      const f = (y - DELTA_T[i]) / (DELTA_T[i + 2] - DELTA_T[i]);
      return DELTA_T[i + 1] + (DELTA_T[i + 3] - DELTA_T[i + 1]) * f;
    }
  }
  return DELTA_T[n - 1];
}

/* T = ศตวรรษจูเลียนนับจาก J2000 ในเวลา TT → ลองจิจูด/ละติจูด (เรเดียน) กับวิษุวัตของวันนั้น + ระยะ (กม.) */
function moonEclDate(T) {
  const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  const Lp = (218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000) * DEG;
  const D  = (297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000) * DEG;
  const M  = (357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000) * DEG;
  const Mp = (134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000) * DEG;
  const F  = (93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000) * DEG;
  const A1 = (119.75 + 131.849 * T) * DEG;
  const A2 = (53.09 + 479264.290 * T) * DEG;
  const A3 = (313.45 + 481266.484 * T) * DEG;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const ecc = [1, E, E * E];                   // พจน์ที่มี M ต้องคูณ E ตามจำนวนเท่าของ M
  let sl = 0, sr = 0, sb = 0;
  for (let i = 0; i < MOON_LR.length; i += 6) {
    const m = MOON_LR[i + 1];
    const a = MOON_LR[i] * D + m * M + MOON_LR[i + 2] * Mp + MOON_LR[i + 3] * F;
    const e = ecc[m < 0 ? -m : m];
    sl += MOON_LR[i + 4] * e * Math.sin(a);
    sr += MOON_LR[i + 5] * e * Math.cos(a);
  }
  for (let i = 0; i < MOON_B.length; i += 5) {
    const m = MOON_B[i + 1];
    const a = MOON_B[i] * D + m * M + MOON_B[i + 2] * Mp + MOON_B[i + 3] * F;
    sb += MOON_B[i + 4] * ecc[m < 0 ? -m : m] * Math.sin(a);
  }
  sl += 3958 * Math.sin(A1) + 1962 * Math.sin(Lp - F) + 318 * Math.sin(A2);
  sb += -2235 * Math.sin(Lp) + 382 * Math.sin(A3) + 175 * Math.sin(A1 - F) + 175 * Math.sin(A1 + F)
      + 127 * Math.sin(Lp - Mp) - 115 * Math.sin(Lp + Mp);
  return { lon: Lp + sl * 1e-6 * DEG, lat: sb * 1e-6 * DEG, r: 385000.56 + sr / 1000, sl, sb, sr };
}

/* หมุนพิกัดสุริยวิถีจากวิษุวัตของวันนั้น (T) กลับไปกรอบ J2000 — Meeus สมการ 21.5–21.6
   โดยตั้งยุคเริ่ม = วันนั้น และช่วงเวลา t = −T                                         */
const ARCSEC = DEG / 3600;
function eclDateToJ2000(lon, lat, T) {
  const t = -T, TT = T * T;
  const eta = ((47.0029 - 0.06603 * T + 0.000598 * TT) * t + (-0.03302 + 0.000598 * T) * t * t + 0.00006 * t * t * t) * ARCSEC;
  const Pi = 174.876384 * DEG + (3289.4789 * T + 0.60622 * TT - (869.8089 + 0.50491 * T) * t + 0.03536 * t * t) * ARCSEC;
  const p = ((5029.0966 + 2.22226 * T - 0.000042 * TT) * t + (1.11113 - 0.000042 * T) * t * t - 0.000006 * t * t * t) * ARCSEC;
  const ce = Math.cos(eta), se = Math.sin(eta), cb = Math.cos(lat), sb = Math.sin(lat);
  const s = Math.sin(Pi - lon), c = Math.cos(Pi - lon);
  return [p + Pi - Math.atan2(ce * cb * s - se * sb, cb * c), Math.asin(ce * sb + se * cb * s)];
}

function lunarPos(ms, out) {
  const T = (days(ms) + deltaT(ms) / 86400) / 36525;
  const m = moonEclDate(T);
  const [lon, lat] = eclDateToJ2000(m.lon, m.lat, T);
  const cb = Math.cos(lat);
  out.x = m.r * cb * Math.cos(lon);
  out.y = m.r * cb * Math.sin(lon);
  out.z = m.r * Math.sin(lat);
  return out;
}

/* แกนหมุนของดาว: เวกเตอร์หนึ่งหน่วยในระบบสุริยวิถี */
function axisVector(tiltDeg, nodeDeg) {
  const t = tiltDeg * DEG, n = nodeDeg * DEG;
  return new THREE.Vector3(Math.sin(t) * Math.cos(n), Math.sin(t) * Math.sin(n), Math.cos(t));
}

/* ฐานพิกัดของระนาบศูนย์สูตร [i, j, k] โดย k คือแกนหมุน — ใช้วางวงโคจรของดวงจันทร์ */
function equatorBasis(tiltDeg, nodeDeg) {
  const k = axisVector(tiltDeg || 0, nodeDeg || 0);
  const i = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 0, 1), k);
  if (i.lengthSq() < 1e-9) i.set(1, 0, 0);                 // แกนหมุนตั้งฉากกับสุริยวิถีพอดี
  i.normalize();
  const j = new THREE.Vector3().crossVectors(k, i).normalize();
  return [i, j, k];
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
let renderer, scene, camera, skyScene, skyCam, sunLight, craftLight, labelLayer;
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

  // ฉากดาวฤกษ์จริง: 1 หน่วย = 1 ปีแสง กล้องยืนที่ตำแหน่งจริงเทียบดวงอาทิตย์
  starScene = new THREE.Scene();
  starCam = new THREE.PerspectiveCamera(48, 1, 1e-4, 24000);
  starCam.up.set(0, 0, 1);

  sunLight = new THREE.PointLight(0xfff3e0, 2.1, 0, 0);
  scene.add(sunLight);
  // ไฟนุ่ม ๆ จากทางกล้อง เปิดเฉพาะตอนเข้าไปดูยานใกล้ ๆ ไม่งั้นด้านที่หันหนีดวงอาทิตย์จะมืดสนิท
  craftLight = new THREE.DirectionalLight(0xdfe8f5, 0);
  scene.add(craftLight);
  scene.add(craftLight.target);
  scene.add(new THREE.AmbientLight(0x2a3550, 0.5));

  labelLayer = $('#labels');
  buildSky();
  buildRealStars();
  buildConstellations();
  buildGalaxy();
  buildGalaxyMarks();
  buildDeep();
  buildExo();
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
let galDust = null, galHii = null, galHalo = null;
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

  /* สสารระหว่างดาว (ISM)
     · ฝุ่น: จุดมืดเกาะขอบด้านในของแขนกังหัน ผสมแบบ "ลบแสง" (ReverseSubtract) จึงกินแสงดาวข้างหลังจริง ๆ
       ลบฟ้ามากกว่าแดงเล็กน้อย แสงที่ลอดผ่านจึงออกแดง — แบบเดียวกับที่ฝุ่นทำกับแสงดาวจริง
     · ก๊าซไฮโดรเจนเรืองแสง (บริเวณ HII): ก้อนสีชมพูตามแขน ที่ดาวมวลมากเพิ่งเกิดกระตุ้นให้ก๊าซเรืองแสง */
  {
    let sd = 424242;
    const rn = () => ((sd = (sd * 1103515245 + 12345) & 0x7fffffff), sd / 0x7fffffff);
    const gs = () => (rn() + rn() + rn() + rn() - 2) * 0.75;
    const ND = 34000, NH = 1500;
    const dp = new Float32Array(ND * 3), ds = new Float32Array(ND), da = new Float32Array(ND);
    for (let k = 0; k < ND; k++) {
      const r = 2.6 + Math.pow(rn(), 0.85) * 38;
      const arm = (rn() * ARMS) | 0;
      const th = Math.log(r / 2.2) / PITCH + arm * (2 * Math.PI / ARMS) - 0.16 + gs() * (0.05 + 0.5 / (r + 3));
      dp[k * 3] = r * Math.cos(th); dp[k * 3 + 1] = r * Math.sin(th); dp[k * 3 + 2] = gs() * 0.12;
      ds[k] = 2.3 + rn() * 3.3;
      da[k] = (0.028 + 0.066 * rn()) * Math.exp(-r / 34);
    }
    const hp = new Float32Array(NH * 3), hs = new Float32Array(NH), ha = new Float32Array(NH);
    for (let k = 0; k < NH; k++) {
      const r = 3.5 + Math.pow(rn(), 0.9) * 34;
      const arm = (rn() * ARMS) | 0;
      const th = Math.log(r / 2.2) / PITCH + arm * (2 * Math.PI / ARMS) + gs() * (0.04 + 0.45 / (r + 3));
      hp[k * 3] = r * Math.cos(th); hp[k * 3 + 1] = r * Math.sin(th); hp[k * 3 + 2] = gs() * 0.08;
      hs[k] = 2.2 + rn() * 4.5;
      ha[k] = 0.35 + 0.6 * rn();
    }
    const pointsMat = (fragBody, blend) => new THREE.ShaderMaterial({
      uniforms: { fade: { value: 0 }, scale: { value: 1 } },
      vertexShader: `attribute float size; attribute float alpha; uniform float scale; uniform float fade; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * scale; vA = alpha * fade; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying float vA; void main(){ float q = length(gl_PointCoord - 0.5); if (q > 0.5) discard; ${fragBody} }`,
      transparent: true, depthWrite: false, depthTest: false, ...blend
    });
    const mkPts = (p, s, a, mat, order) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(p, 3));
      g.setAttribute('size', new THREE.BufferAttribute(s, 1));
      g.setAttribute('alpha', new THREE.BufferAttribute(a, 1));
      const pts = new THREE.Points(g, mat);
      pts.frustumCulled = false;
      pts.renderOrder = order;
      group.add(pts);
      return pts;
    };
    galDust = mkPts(dp, ds, da, pointsMat(
      'float a = smoothstep(0.5, 0.0, q) * vA; gl_FragColor = vec4(vec3(0.42, 0.5, 0.62) * a, a);',
      { blending: THREE.CustomBlending, blendEquation: THREE.ReverseSubtractEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor }), 5);
    galHii = mkPts(hp, hs, ha, pointsMat(
      'float a = exp(-q * q * 14.0) * vA; gl_FragColor = vec4(vec3(1.0, 0.34, 0.52) * a, 1.0);',
      { blending: THREE.AdditiveBlending }), 6);
  }

  /* ฮาโลสสารมืด: ทรงกลมรัศมีราว 650,000 ปีแสง (หน่วยฉาก 1 = 1,000 ปีแสง) ห่อทั้งกาแล็กซี
     ความเข้มตามความหนาแน่นที่ทอดยาวบนแนวสายตา (โพรไฟล์คล้าย NFW ที่ฉายลงบนภาพ รัศมีลักษณะ 65,000 ปีแสง)
     สีม่วงเป็นสีสมมุติตามธรรมเนียมภาพสสารมืด — ของจริงไม่เปล่งแสง มองไม่เห็น */
  galHalo = new THREE.Mesh(new THREE.SphereGeometry(650, 64, 32), new THREE.ShaderMaterial({
    uniforms: { fade: { value: 0 }, rs: { value: 65.0 }, camPos: { value: new THREE.Vector3() } },
    vertexShader: `varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float fade; uniform float rs; uniform vec3 camPos; varying vec3 vW;
      void main(){
        vec3 dir = normalize(vW - camPos);
        float t = dot(-camPos, dir);
        float b = length(-camPos - dir * t);
        float I = pow(1.0 + (b * b) / (rs * rs), -0.85);
        gl_FragColor = vec4(vec3(0.42, 0.30, 0.95) * I * fade, 1.0);
      }`,
    transparent: true, depthWrite: false, depthTest: false, side: THREE.BackSide, blending: THREE.AdditiveBlending
  }));
  galHalo.renderOrder = -5;
  galHalo.frustumCulled = false;
  group.add(galHalo);
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
  // วัตถุจิ๋วกับดวงจันทร์เล็กไม่ใช่ทรงกลม — ปั้นเป็นก้อนหินไว้ก่อน แล้วค่อยสลับเป็น
  // รูปทรงจริงตอนเจาะจงดวงนั้น (ดู SHAPE_SRC / requestShapeModel)
  const rocky = ROCK[def.id] || (small && ['asteroid', 'comet', 'ism'].includes(def.kind));
  const geo = rocky ? rockGeometry(def)
    : new THREE.SphereGeometry(1, small ? 24 : (isMoon ? 40 : 64), small ? 16 : (isMoon ? 24 : 40));
  const map = small ? texShared(def._tex) : tex(def._tex);
  def._map = map;                       // เก็บไว้สลับตอนวาดฉบับเต็ม
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
    def, isMoon, holder, spin, mesh, R, rockGeo: !!rocky,
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
    if (m.ecl) {                                  // ดวงจันทร์ของโลก: เส้นทางจริงตลอดหนึ่งเดือนดาราคติ
      const P = 27.321661 * 86400000, q = {};    // ครึ่งเดือนก่อน–หลังเวลาปัจจุบัน ดวงจันทร์จึงอยู่บนเส้นพอดี
      for (let i = 0; i <= seg; i++) {
        lunarPos(ms + (i / seg - 0.5) * P, q);
        arr[i * 3] = q.x / KMU;
        arr[i * 3 + 1] = q.y / KMU;
        arr[i * 3 + 2] = q.z / KMU;
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
    let eo = e, w = 0;
    if (trans.peak > 0) {
      // บินข้ามหลายปีแสง: ช่วงแรกถอยกล้องออก (เป้ายังไม่ขยับ) · ช่วงกลางเลื่อนข้ามไปขณะมองจากไกล · ช่วงท้ายพุ่งเข้าหาเป้า
      const u = Math.min(1, Math.max(0, (trans.t - 0.22) / 0.56));
      eo = u < 0.5 ? 4 * u ** 3 : 1 - Math.pow(-2 * u + 2, 3) / 2;
      w = step01(0, 0.24, trans.t) * (1 - step01(0.76, 1, trans.t));
    }
    origin.x = A.x + (B.x - A.x) * eo;
    origin.y = A.y + (B.y - A.y) * eo;
    origin.z = A.z + (B.z - A.z) * eo;
    const lg = Math.log(trans.d0) + (Math.log(trans.d1) - Math.log(trans.d0)) * e;
    camState.dist = Math.exp(w > 0 ? lg + (Math.log(trans.peak) - lg) * w : lg);
    if (trans.t >= 1) { trans.on = false; S.focus = trans.to; syncCrumb(); }
  } else {
    const w = worldOf(S.focus);
    origin.x = w.x; origin.y = w.y; origin.z = w.z;
  }
}

/* ดวงจันทร์ทุกดวงในแอตลาสหมุนรอบตัวเองพอดีหนึ่งรอบต่อหนึ่งวงโคจร จึงหันด้านเดิมเข้าหาดาวแม่เสมอ
   ของเดิมหมุนตามคาบเฉย ๆ โดยเฟสเริ่มต้นสุ่ม ด้านที่หันเข้าดาวแม่จึงไม่ตรง — พอโฟบอส ไดมอส
   และไดมอร์ฟอสมีรูปทรงจริงแล้วก็เห็นชัด ตรงนี้จึงบังคับให้แกน +X (ลองจิจูด 0° ของแผนที่ผิว
   ซึ่งสหพันธ์ดาราศาสตร์นิยามให้เป็นจุดที่หันเข้าดาวแม่) ชี้ไปที่ดาวแม่ทุกเฟรม */
const _fpA = new THREE.Vector3(), _fpE = new THREE.Vector3(), _fpF = new THREE.Vector3();
function faceParent(rec) {
  const p = REG[rec.parent].world, w = rec.world;
  _fpA.set(p.x - w.x, p.y - w.y, p.z - w.z);
  _fpA.addScaledVector(rec.axis, -_fpA.dot(rec.axis));      // หมุนได้รอบแกนตัวเองอย่างเดียว
  if (_fpA.lengthSq() < 1e-12) return;
  _fpA.normalize();
  // ทิศของแกน +X และ +Z หลังเอียงแกนแล้ว: rotateY(θ) ส่ง +X ไปที่ cosθ·E − sinθ·F
  _fpE.set(1, 0, 0).applyQuaternion(rec.spin.quaternion);
  _fpF.set(0, 0, 1).applyQuaternion(rec.spin.quaternion);
  rec.spin.rotateY(Math.atan2(-_fpA.dot(_fpF), _fpA.dot(_fpE)));
}

function updateScene() {
  const d = days(S.time);
  for (const id in REG) {
    const rec = REG[id], def = rec.def;
    toScene(rec.world, rec.holder.position);
    const scale = (S.enlarge && id !== 'sun') ? 25 : 1;
    if (!rec.craft && !rec.far) rec.mesh.scale.setScalar(rec.R * scale);
    if (rec.clouds) rec.clouds.scale.setScalar(rec.R * scale * 1.012);
    if (rec.ring) rec.ring.scale.setScalar(scale);
    if (rec.glow) rec.glow.scale.setScalar(rec.R * 7);
    const rotH = def.rotH != null ? def.rotH : (def.period != null ? def.period * 24 : null);
    if (id === 'earth') earthOrient(S.time, rec.spin.quaternion);
    else if (!rec.craft && !rec.far) {
      rec.spin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rec.axis);
      if (rec.isMoon && rec.parent) faceParent(rec);        // หันด้านเดิมเข้าหาดาวแม่
      else if (rotH) rec.spin.rotateY((2 * Math.PI * d / (rotH / 24)) % (2 * Math.PI));
    }
    const shown = rec.craft ? craftShown(rec)
                : rec.far ? farShown(rec)
                : def.el ? smallShown(rec)
                : (!rec.isMoon || S.moons);
    if (rec.craft && shown) craftPose(rec);
    if (rec.far && shown) farPose(rec);
    if (rec.line) {
      const pw = rec.parent ? worldOf(rec.parent) : ZERO;
      toScene(pw, rec.line.position);
      // วงรีของวัตถุเล็กไม่เปลี่ยนตามเวลา วาดครั้งเดียวพอ ส่วนวงโคจรไฮเพอร์โบลา
      // เป็นเส้นเปิดที่ต้องยืดตามตัววัตถุซึ่งวิ่งออกไปเรื่อย ๆ
      const openPath = def.el && def.el.e >= 1;
      if ((!def.el || openPath) && Math.abs(S.time - rec.lineT) > (def.ecl ? 1.7e8 : rec.isMoon ? 3.15e10 : 1.6e11)) refreshOrbit(rec, S.time);
      rec.line.visible = S.orbits && (rec.craft ? shown : def.el ? smallLineShown(rec) : shown);
    }
    rec.holder.visible = shown;
  }
  updateComets();
  updateShadows();
  toScene(worldOf('sun'), sunLight.position);
  // ไฟส่องยาน: แรงขึ้นเมื่อเข้าใกล้ ดับสนิทเมื่อถอยออกไปไกลกว่าราวหนึ่งกิโลเมตร
  const fo = REG[trans.on ? trans.to : S.focus];
  if (fo && fo.craft) {
    const k = 1 - step01(-1, 0.3, log10(Math.max(1e-9, camState.dist)));
    craftLight.intensity = 1.35 * k;
    craftLight.position.copy(camera.position).multiplyScalar(1.4);
    craftLight.target.position.set(0, 0, 0);
  } else craftLight.intensity = 0;
  const atHome = !(fo && fo.far);                // ไปดูหลุมดำ/ซากซูเปอร์โนวาอยู่: ของในระบบสุริยะไม่เกี่ยวแล้ว
  gridGroup.visible = S.grid && atHome && camState.dist < 900 * AU;
  gridGroup.position.set(-origin.x / KMU, -origin.y / KMU, -origin.z / KMU);
  belt.pts.visible = S.belt && atHome && camState.dist < 4000 * AU;
  kuiper.pts.visible = S.kuiper && atHome && camState.dist < 4000 * AU;
  oort.visible = S.oort && atHome && camState.dist > 20 * AU && camState.dist < 24 * LY;
  updateBelts();

  // ไล่สลับ: ท้องฟ้าที่มองจากย่านดวงอาทิตย์ ⇄ ทางช้างเผือกทั้งใบ
  const dly = camState.dist / LY;
  // ใช้ระยะของตัวกล้องจากดวงอาทิตย์ด้วย — ไปดูหลุมดำใจกลางกาแล็กซี ฉากหลังต้องเป็นกาแล็กซีแม้กล้องจะอยู่ชิดเป้า
  const dEye = Math.max(dly, eyeLy());
  const f = step01(log10(5), log10(3200), log10(Math.max(1e-12, dEye)));
  const px = Math.min(2, (innerHeight / 900) * (renderer.getPixelRatio() || 1));
  starFade = S.stars ? (1 - f) * 0.5 : 0;      // ดาวสุ่มเหลือไว้เป็นฝุ่นดาวพื้นหลังเท่านั้น
  starFadeR = S.stars ? 1 - f : 0;            // ดาวฤกษ์จริงเป็นตัวหลักแล้ว
  // พ้นกาแล็กซีไปแล้ว แบบจำลองแขนกังหันไม่มีความหมาย ปล่อยให้ฉากไกลรับช่วงต่อ
  const galOut = 1 - step01(log10(0.3), log10(4), log10(Math.max(1e-12, dEye / 1e6)));
  galFade = S.galaxy ? f * galOut : 0;
  const st = skyScene.getObjectByName('stars');
  st.visible = starFade > 0.01;
  st.material.uniforms.scale.value = px;
  st.material.uniforms.fade.value = starFade;
  galPts.material.uniforms.scale.value = px * 1.7;
  galPts.material.uniforms.fade.value = galFade;
  // จานแบนดูดีเมื่อมองจากนอกกาแล็กซีเท่านั้น ใกล้กว่านั้นขอบแผ่นจะเป็นรอยตัดขวางจอ
  const discFade = step01(log10(150), log10(2600), log10(Math.max(1e-12, dly)));
  galGlow.material.opacity = galFade * 0.85 * discFade;
  if (galDust) {
    const im = S.ism ? galFade : 0;
    galDust.visible = galHii.visible = im > 0.01;
    galDust.material.uniforms.fade.value = im;
    galDust.material.uniforms.scale.value = px * 1.7;
    galHii.material.uniforms.fade.value = im;
    galHii.material.uniforms.scale.value = px * 1.7;
  }
  if (galHalo) {
    // ในกาแล็กซีจาง ๆ พอให้รู้ว่าอยู่ในฮาโล พอถอยออกไปจนเห็นทั้งฮาโลค่อยเข้มขึ้น
    const hf = S.darkmatter ? galFade * (0.1 + 0.45 * step01(log10(6e4), log10(6e5), log10(Math.max(1e-12, dly)))) : 0;
    galHalo.visible = hf > 0.004;
    galHalo.material.uniforms.fade.value = hf;
  }
  galDisc.material.uniforms.fade.value = galFade * discFade;
  starPts.visible = starFadeR > 0.01;
  starPts.material.uniforms.scale.value = px * 1.2;
  starPts.material.uniforms.fade.value = starFadeR;
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
  return r * (S.enlarge && id !== 'sun' && !REG[id].far ? 25 : 1);
}
function defaultDist(id) {
  const rec = REG[id];
  if (rec && (rec.craft || rec.far)) return rec.def.span * 1.6e-3;   // ขนาดตัวยาน (เมตร) → กิโลเมตร × 1.6
  return focusRadius(id) * (id === 'sun' ? 9 : 6.2);
}

function setFocus(id, instant) {
  starSel = -1; exoSel = -1; deepSel = -1;
  if (REG[id] && REG[id].craft) requestCraftModel(id);
  requestShapeModel(id);                               // รูปทรงจริงของวัตถุจิ๋ว
  if (REG[id] && REG[id].far) requestFarModel(id);      // โมเดลจริงโหลดตอนนี้
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
    trans.peak = 0;
    if (sep > 0.5 * LY) {
      trans.peak = Math.max(sep * 0.55, trans.d0, trans.d1);
      trans.dur = Math.min(6, 3 + Math.log10(1 + sep / LY) * 0.5);
    }
  }
  syncCrumb();
  renderInfo();
}

const camDir = new THREE.Vector3();
function applyCamera() {
  const d = Math.max(1e-9, camState.dist / KMU);   // 1e-9 หน่วย = 1 มิลลิเมตร
  const ce = Math.cos(camState.el);
  camera.position.set(d * ce * Math.cos(camState.az), d * ce * Math.sin(camState.az), d * Math.sin(camState.el));
  camera.near = Math.max(1e-9, d * 2e-4);      // 1e-9 หน่วย ≈ 1 มิลลิเมตร
  camera.far = Math.max(1e7, d * 1e6);
  camera.updateProjectionMatrix();
  camera.lookAt(0, 0, 0);
  skyCam.quaternion.copy(camera.quaternion);

  // กล้องของฉากกาแล็กซี: ทิศเดียวกัน แต่ยืนอยู่ที่ตำแหน่งดวงอาทิตย์ในกาแล็กซี
  const dg = (camState.dist / LY) * GAL_U;
  // ตำแหน่งจริงของกล้องเทียบดวงอาทิตย์ (ปีแสง) — ไปดูหลุมดำใจกลางกาแล็กซี กล้องในฉากนี้ก็ต้องตามไปอยู่ตรงนั้นด้วย
  starCameraPos(camDir);
  galCam.position.copy(galSunPos).addScaledVector(camDir, GAL_U);
  galCam.quaternion.copy(camera.quaternion);
  galCam.near = Math.max(0.004, dg * 0.02);
  galCam.far = Math.max(2000, dg * 40);
  galCam.updateProjectionMatrix();
  updateStarCam();
  updateDeepCam();
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
    case 6: return 125000 * LY;
    case 7: return 12e6 * LY;          // กลุ่มท้องถิ่น
    case 8: return 700e6 * LY;         // กระจุกและกลุ่มกระจุกกาแล็กซี
    default: return 120000e6 * LY;     // เอกภพที่สังเกตได้ทั้งใบ
  }
}
function gotoScale(k) {
  if (k >= 2 && S.focus !== 'sun' && !trans.on) setFocus('sun');
  const d = ladderDist(k);
  if (trans.on) trans.d1 = d; else camState.dist = d;
  if (k === 2 || k === 3) camState.el = Math.max(camState.el, 0.42);
  // ขั้นกาแล็กซี: หันกล้องไปทางขั้วเหนือของทางช้างเผือก จะได้เห็นแขนกังหันเต็มใบ
  if (k === 6) { camState.az = Math.PI; camState.el = 0.90; }
  if (k >= 7) { camState.el = Math.max(camState.el, 0.35); }
}

/* ── ป้ายชื่อ ──────────────────────────────────────────────────────── */
const labelRecs = [];
function buildLabels() {
  for (const id of ORDER) {
    const rec = REG[id];
    const node = el('button', 'lbl' + (rec.isMoon ? ' moon' : rec.def.craft ? ' craft' : rec.far ? ' bhn' : (rec.def.el ? ' small' : '')));
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
  const farFoc = !!(REG[focus] && REG[focus].far);   // ไปดูของไกลอยู่: ป้ายในระบบสุริยะไม่เกี่ยว
  for (const rec of labelRecs) {
    const node = rec.label;
    if (rec.far) continue;                       // ป้ายหลุมดำ/ซากซูเปอร์โนวา จัดใน updateFarLabels
    if (!S.labels || (rec.isMoon && !S.moons)) { node.hidden = true; continue; }
    if (rec.def.el && !rec.holder.visible) { node.hidden = true; continue; }
    if ((wide || farFoc) && rec.def.id !== 'sun') { node.hidden = true; continue; }
    if (rec.def.id === 'sun' && (galFade > 0.5 || deepFade > 0.3)) { node.hidden = true; continue; }
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
    const lx = (projV.x * 0.5 + 0.5) * W, ly = (-projV.y * 0.5 + 0.5) * H - Math.max(11, rpx + 13);
    node.style.left = lx.toFixed(1) + 'px';
    node.style.top = ly.toFixed(1) + 'px';
    labelBoxes.push(lx, ly, labelWidth(rec.def.nm[S.lang], 7.6) / 2 + 9, 11);
    if (rpx > 14) labelBoxes.push(lx, (-projV.y * 0.5 + 0.5) * H, rpx, rpx);   // จานดาวบังดาวฤกษ์ข้างหลัง
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
  else if (!pickExo(cx, cy) && !pickDeep(cx, cy)) pickStar(cx, cy);
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

/* เมทริกซ์หมุนควงพิกัดศูนย์สูตร J2000 → วิษุวัตของวันนั้น (IAU 1976, Meeus สมการ 21.2–21.3)
   เวลาดาราคติวัดจากวิษุวัตของวันนั้น แต่ทั้งแผนที่อ้างกรอบ J2000 ถ้าไม่หมุน ปี 2570 จะคลาด 0.38°
   (เวลาขึ้น–ตกคลาดราว 1–2 นาที) · หมุนควงวันละ 0.14″ จึงคิดใหม่วันละครั้งพอ              */
const _prec = { day: NaN, m: new Float64Array(9) };
function precessMatrix(ms) {
  const dd = Math.floor(days(ms));
  if (dd === _prec.day) return _prec.m;
  _prec.day = dd;
  const t = dd / 36525, t2 = t * t, t3 = t2 * t;
  const zeta = (2306.2181 * t + 0.30188 * t2 + 0.017998 * t3) * ARCSEC;
  const zz = (2306.2181 * t + 1.09468 * t2 + 0.018203 * t3) * ARCSEC;
  const th = (2004.3109 * t - 0.42665 * t2 - 0.041833 * t3) * ARCSEC;
  const cz = Math.cos(zeta), sz = Math.sin(zeta), cZ = Math.cos(zz), sZ = Math.sin(zz);
  const ct = Math.cos(th), st = Math.sin(th), m = _prec.m;
  m[0] = cZ * ct * cz - sZ * sz;  m[1] = -cZ * ct * sz - sZ * cz;  m[2] = -cZ * st;
  m[3] = sZ * ct * cz + cZ * sz;  m[4] = -sZ * ct * sz + cZ * cz;  m[5] = -sZ * st;
  m[6] = st * cz;                 m[7] = -st * sz;                 m[8] = ct;
  return m;
}

/* การหันของโลกในฉาก — ขั้วเหนือชี้ตามแกนหมุนจริง และเมริเดียนกรีนิชหันตามเวลาดาราคติ
   พื้นผิวโลก (textures.js) วางลองจิจูด 0° ไว้กลางภาพ ซึ่ง SphereGeometry หันไปทาง +X ของตัวเอง
   และตะวันออก 90° ไปทาง −Z จึงประกอบแกนทั้งสามตรง ๆ แทนการเอียงแกนแล้วหมุนแบบดาวดวงอื่น
   ผลคือกลางวัน–กลางคืนบนโลกตรงกับเวลาจริง และเงาสุริยุปราคาตกลงบนประเทศที่ถูกต้อง       */
const _gX = new THREE.Vector3(), _gY = new THREE.Vector3(), _gZ = new THREE.Vector3(), _gM = new THREE.Matrix4();
function earthOrient(ms, q) {
  const P = precessMatrix(ms), g = gmstDeg(ms) * DEG;
  const ce = Math.cos(OBLIQ), se = Math.sin(OBLIQ);
  // เวกเตอร์ในกรอบศูนย์สูตรของวันนั้น → J2000 (ทรานสโพสของ P) → สุริยวิถี J2000
  const put = (v, a, b, c) => {
    const x = P[0] * a + P[3] * b + P[6] * c, y = P[1] * a + P[4] * b + P[7] * c, z = P[2] * a + P[5] * b + P[8] * c;
    return v.set(x, y * ce + z * se, -y * se + z * ce);
  };
  const cg = Math.cos(g), sg = Math.sin(g);
  put(_gX, cg, sg, 0);                         // ลองจิจูด 0° บนเส้นศูนย์สูตร
  put(_gY, 0, 0, 1);                           // ขั้วเหนือ
  put(_gZ, sg, -cg, 0);                        // ลองจิจูด 90° ตะวันตก
  return q.setFromRotationMatrix(_gM.makeBasis(_gX, _gY, _gZ));
}

/* วัตถุอยู่ตรงไหนบนท้องฟ้าของผู้สังเกต
   vec = ตำแหน่งวัตถุในพิกัดสุริยวิถี (กม.) · lat/lon = องศา (ตะวันออกเป็นบวก) */
function horizonOf(vec, ms, lat, lon, out) {
  const e = earthAt(ms);
  // เวกเตอร์จากใจกลางโลกไปยังวัตถุ แล้วเอียงเข้าระนาบศูนย์สูตร
  const x0 = vec.x - e.x, y0 = vec.y - e.y, z0 = vec.z - e.z;
  const ce = Math.cos(OBLIQ), se = Math.sin(OBLIQ);
  let x = x0, y = y0 * ce - z0 * se, z = y0 * se + z0 * ce;
  const P = precessMatrix(ms);
  const xq = P[0] * x + P[1] * y + P[2] * z, yq = P[3] * x + P[4] * y + P[5] * z;
  z = P[6] * x + P[7] * y + P[8] * z; x = xq; y = yq;
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

/* อุปราคาเกิดจริงไหม: หาเวลาที่ดวงจันทร์เข้าใกล้ดวงอาทิตย์ (หรือจุดตรงข้ามดวงอาทิตย์) ที่สุดในช่วง ±4 ชม.
   แล้วเทียบกับขนาดจานและกรวยเงาของคืนนั้นจริง ๆ (แนวทาง Meeus บทที่ 54)
   · สุริยุปราคา: มีสักจุดบนผิวโลกที่เห็นจานซ้อนกัน → ระยะ < พารัลแลกซ์จันทร์ − พารัลแลกซ์ดวงอาทิตย์ + รัศมีจานทั้งสอง
   · จันทรุปราคา: ดวงจันทร์แตะเงามืดของโลก (ขยาย 2% เผื่อบรรยากาศ) ไม่นับเงามัวที่ตาแทบมองไม่ออก */
const _ecm = V();
function eclipseHappens(tm, kind) {
  const sep = ms => { const d = sepDeg('sun', 'moon', ms); return kind === 'new' ? d : 180 - d; };
  let a = tm - 4 * 3600000, b = tm + 4 * 3600000;
  for (let i = 0; i < 36; i++) {                     // ค้นแบบอัตราส่วนทอง
    const m1 = b - (b - a) * 0.618, m2 = a + (b - a) * 0.618;
    if (sep(m1) < sep(m2)) b = m2; else a = m1;
  }
  const t = (a + b) / 2, d = sep(t);
  const e = earthAt(t), rs = Math.hypot(e.x, e.y, e.z);
  lunarPos(t, _ecm);
  const rm = Math.hypot(_ecm.x, _ecm.y, _ecm.z);
  const pm = Math.asin(EARTH_R / rm) / DEG, ps = Math.asin(EARTH_R / rs) / DEG;
  const sm = Math.asin(REG.moon.def.radius / rm) / DEG, ss = Math.asin(REG.sun.def.radius / rs) / DEG;
  if (kind === 'new') return d < pm - ps + sm + ss;
  return d < 1.02 * (pm - ss + ps) + sm;
}

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
        // ดวงจันทร์ต้องอยู่ใกล้ระนาบสุริยวิถีพอ เงาถึงจะพาดถึงกัน — กรองหยาบด้วยละติจูด แล้วคิดกรวยเงาจริง
        const ecl = lat < 1.7 && eclipseHappens(tm, kind);
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

/* ── ดาวฤกษ์จริงรอบดวงอาทิตย์ ──────────────────────────────────────────
   วาดในฉากของตัวเอง (starScene) ที่ 1 หน่วย = 1 ปีแสง โดยวางกล้องไว้ที่
   ตำแหน่งจริงของผู้ชมเทียบดวงอาทิตย์ วิธีเดียวกับฉากกาแล็กซี — ทำให้
   ตัวเลขที่เข้า GPU ไม่บานปลาย และได้ "พารัลแลกซ์จริง" คือพอบินออกไป
   ไม่กี่ปีแสง ดาวใกล้จะเลื่อนแซงดาวไกล รูปกลุ่มดาวจะค่อย ๆ บิดเบี้ยว
   ความสว่างคำนวณในเชเดอร์จากความสว่างสัมบูรณ์ + ระยะถึงกล้อง จึงหรี่/สว่าง
   ตามจริงเมื่อเข้าใกล้หรือถอยห่าง                                         */
const PC_PER_LY = 1 / 3.2615638;
const SUN_ABSMAG = 4.83;
let starScene, starCam, starPts, starFadeR = 1;
const starLabels = [];
let starSel = -1;                       // ดาวที่กำลังเลือกดูข้อมูล (−1 = ไม่ได้เลือก)

function buildRealStars() {
  const n = STARS.length + 1;                       // +1 = ดวงอาทิตย์ (มองจากนอกระบบ)
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const amag = new Float32Array(n);
  const c = new THREE.Color();
  for (let i = 0; i < STARS.length; i++) {
    const s = STARS[i];
    pos[i * 3] = s.x; pos[i * 3 + 1] = s.y; pos[i * 3 + 2] = s.z;
    c.setHex(SP_TINT[s.c] || 0xffd9a0);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    amag[i] = starAbsMag(s);
  }
  // ดวงอาทิตย์เอง: จากระยะ 10 ปีแสงจะเห็นเป็นดาวธรรมดาดวงหนึ่งเท่านั้น
  const k = STARS.length;
  pos[k * 3] = pos[k * 3 + 1] = pos[k * 3 + 2] = 0;
  c.setHex(SP_TINT.G);
  col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
  amag[k] = SUN_ABSMAG;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('absMag', new THREE.BufferAttribute(amag, 1));
  starPts = new THREE.Points(geo, realStarMaterial());
  starPts.frustumCulled = false;
  starScene.add(starPts);
}

/* ความสว่างสัมบูรณ์: ความสว่างที่จะเห็นถ้าดาวดวงนั้นอยู่ห่าง 10 พาร์เซก */
function starAbsMag(s) {
  const V = s.V == null ? 17 : s.V;
  return V + 5 - 5 * Math.log10(Math.max(1e-4, s.d * PC_PER_LY));
}

/* ความสว่างปรากฏเมื่อมองจากระยะ r ปีแสง (ใช้ทั้งกับป้ายชื่อและการคลิก) */
function starAppMag(absMag, rLy) {
  return absMag - 5 + 5 * Math.log10(Math.max(1e-4, rLy * PC_PER_LY));
}

function realStarMaterial() {
  if (!starSprite) starMaterial();                  // ให้สร้างสไปรต์ร่วมกันไว้ก่อน
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: starSprite }, scale: { value: 1 }, fade: { value: 1 } },
    vertexShader: `attribute float absMag; varying vec3 vC; varying float vB;
      uniform float scale;
      void main(){
        vC = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float dLy = max(0.05, length(mv.xyz));
        float dPc = dLy * 0.30660139;
        float m = absMag - 5.0 + 5.0 * (log(dPc) / 2.302585093);
        // อันดับความสว่างเป็นสเกลลอการิทึมอยู่แล้ว ไล่ขนาดกับความเข้มตามอันดับตรง ๆ
        // จะได้ภาพใกล้เคียงที่ตาเห็น: อันดับ 6.5 คือขีดจำกัดตาเปล่า อันดับติดลบคือดาวเด่น
        float t = clamp((6.6 - m) / 3.0, 0.0, 3.4);
        gl_PointSize = clamp(scale * (0.9 + 4.4 * t), 0.7, 30.0);
        vB = clamp((7.2 - m) / 5.6, 0.03, 1.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform sampler2D map; uniform float fade; varying vec3 vC; varying float vB;
      void main(){
        vec4 t = texture2D(map, gl_PointCoord);
        gl_FragColor = vec4(vC, 1.0) * t * (vB * fade);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true
  });
}

/* ตำแหน่งจริงของกล้องเทียบดวงอาทิตย์ (หน่วยปีแสง) */
const starEye = new THREE.Vector3();
function starCameraPos(out) {
  out.set(
    (origin.x + camera.position.x * KMU) / LY,
    (origin.y + camera.position.y * KMU) / LY,
    (origin.z + camera.position.z * KMU) / LY
  );
  return out;
}

function updateStarCam() {
  starCameraPos(starEye);
  starCam.position.copy(starEye);
  starCam.quaternion.copy(camera.quaternion);
  const d = Math.max(1e-4, camState.dist / LY);
  starCam.near = Math.max(1e-5, d * 1e-4);
  starCam.far = Math.max(24000, d * 60);
  starCam.aspect = camera.aspect;
  starCam.updateProjectionMatrix();
}

/* ── ป้ายชื่อดาว ────────────────────────────────────────────────────────
   ป้ายมีจำนวนจำกัด เลือกให้ดาวที่ "สว่างที่สุดเมื่อมองจากตรงนี้" ก่อน
   พอบินออกไปไกล ๆ ดาวที่เคยจางจะกลายเป็นดาวเด่นแทน ป้ายก็สลับตามเอง   */
const STAR_LABELS = 22;
function buildStarLabels() {
  for (let i = 0; i < STAR_LABELS; i++) {
    const node = el('button', 'lbl star');
    node.innerHTML = `<span class="ring"></span><span class="nm"></span>`;
    node.hidden = true;
    node.addEventListener('click', ev => {
      ev.stopPropagation();
      if (node._si != null) selectStar(node._si);
    });
    labelLayer.appendChild(node);
    starLabels.push(node);
  }
}

const _sv = new THREE.Vector3();
function updateStarLabels() {
  const W = innerWidth, H = innerHeight;
  if (!S.stars || starFadeR < 0.05) {
    for (const n of starLabels) n.hidden = true;
    return;
  }
  const farOut = camState.dist / LY > 20;
  const cand = [];
  for (let i = 0; i < STARS.length; i++) {
    const s = STARS[i];
    if (!s.th && !s.named2) {
      if (!/^[A-Za-z’' .-]+$/.test(s.n)) continue;      // ข้ามดาวที่มีแต่รหัสแคตาล็อก
      s.named2 = true;
    }
    if (farOut && !s.th && bayerOf(s)) continue;            // ออกไปไกลแล้ว ป้ายรหัสดาวมีแต่รก
    const r = Math.hypot(s.x - starEye.x, s.y - starEye.y, s.z - starEye.z);
    const m = starAppMag(starAbsMag(s), r);
    if (m > 4.4) continue;                                   // จางเกินกว่าจะเขียนชื่อ
    _sv.set(s.x, s.y, s.z).project(starCam);
    if (_sv.z > 1 || Math.abs(_sv.x) > 1.05 || Math.abs(_sv.y) > 1.05) continue;
    cand.push({ i, m, x: (_sv.x * 0.5 + 0.5) * W, y: (-_sv.y * 0.5 + 0.5) * H });
  }
  cand.sort((a, b) => a.m - b.m);
  if (starSel >= 0 && !cand.some(c => c.i === starSel)) {     // ดวงที่เลือกไว้ต้องเห็นเสมอ
    const s = STARS[starSel];
    _sv.set(s.x, s.y, s.z).project(starCam);
    if (_sv.z <= 1) cand.unshift({ i: starSel, m: -99, x: (_sv.x * 0.5 + 0.5) * W, y: (-_sv.y * 0.5 + 0.5) * H });
  }
  let k = 0;
  for (const c of cand) {
    if (k >= STAR_LABELS) break;
    const s = STARS[c.i];
    const bay = !(S.lang === 'th' && s.th) && bayerOf(s);
    const txt = (S.lang === 'th' && s.th) ? s.th : (bay || s.n);
    // กันป้ายทับกันเอง และทับป้ายของระบบอื่นที่จองที่ไว้ก่อน
    if (!claimLabel(c.x, c.y - 13, labelWidth(txt, 6.7), 17)) continue;
    const node = starLabels[k++];
    node._si = c.i;
    node.hidden = false;
    node.style.left = c.x.toFixed(1) + 'px';
    node.style.top = (c.y - 13).toFixed(1) + 'px';
    node.style.color = '#' + (SP_TINT[s.c] || 0xffd9a0).toString(16).padStart(6, '0');
    node.querySelector('.nm').textContent = txt;
    node.classList.toggle('bay', !!bay);
    node.classList.toggle('on', c.i === starSel);
    node.style.opacity = String(Math.max(0.3, Math.min(1, (4.6 - c.m) / 3)) * starFadeR);
  }
  for (; k < STAR_LABELS; k++) starLabels[k].hidden = true;
}

/* คลิกที่ว่าง ๆ แล้วโดนดาวดวงไหน */
function pickStar(cx, cy) {
  if (!S.stars || starFadeR < 0.05) return false;
  let best = -1, bestD = 16;
  for (let i = 0; i < STARS.length; i++) {
    const s = STARS[i];
    const r = Math.hypot(s.x - starEye.x, s.y - starEye.y, s.z - starEye.z);
    if (starAppMag(starAbsMag(s), r) > 6.5) continue;
    _sv.set(s.x, s.y, s.z).project(starCam);
    if (_sv.z > 1) continue;
    const x = (_sv.x * 0.5 + 0.5) * innerWidth, y = (-_sv.y * 0.5 + 0.5) * innerHeight;
    const d = Math.hypot(x - cx, y - cy);
    if (d < bestD) { bestD = d; best = i; }
  }
  if (best < 0) return false;
  selectStar(best);
  return true;
}

function selectStar(i) {
  starSel = i; exoSel = -1; deepSel = -1;
  syncCrumb();
  renderInfo();
}

/* หันกล้องไปทางดาวดวงนั้น (กล้องยังโคจรรอบเป้าหมายเดิม แค่หันหน้าไปอีกทาง) */
function aimAtStar(i) {
  const s = STARS[i];
  const dx = s.x - starEye.x, dy = s.y - starEye.y, dz = s.z - starEye.z;
  const r = Math.hypot(dx, dy, dz) || 1;
  camState.az = Math.atan2(-dy / r, -dx / r);
  camState.el = Math.max(-1.5, Math.min(1.5, Math.asin(-dz / r)));
}

/* ── แผงข้อมูลของดาว ─────────────────────────────────────────────────── */
function renderStarInfo() {
  const t = L(), s = STARS[starSel], pane = $('#pane-info');
  pane.innerHTML = '';
  const hex = '#' + (SP_TINT[s.c] || 0xffd9a0).toString(16).padStart(6, '0');

  const head = el('div', 'sec');
  const hd = el('div', 'obj-head');
  const sw = el('div', 'obj-swatch');
  sw.style.setProperty('--glow', hex);
  sw.style.background = `radial-gradient(circle at 42% 38%, ${hex}, rgba(10,15,24,.95) 68%)`;
  const ti = el('div', 'obj-title');
  ti.innerHTML = `<h2></h2><div class="kind"><em></em><span></span></div>`;
  ti.querySelector('h2').textContent = (S.lang === 'th' && s.th) ? s.th : s.n;
  ti.querySelector('.kind em').style.background = hex;
  ti.querySelector('.kind span').textContent =
    t.kind.star + ' · ' + ((SP_CLASS[s.c] || { th: '', en: '' })[S.lang] || '');
  hd.append(sw, ti);
  head.appendChild(hd);
  if (s.de) {
    const p = el('p', 'desc');
    p.textContent = s.de[S.lang];
    head.appendChild(p);
  }
  pane.appendChild(head);

  const rNow = Math.hypot(s.x - starEye.x, s.y - starEye.y, s.z - starEye.z);
  const abs = starAbsMag(s);
  const rows = [
    [t.stDist, `${nf(s.d, s.d < 100 ? 2 : 0)}<u>${t.ly}</u>`],
    [t.stFromHere, `${nf(rNow, rNow < 100 ? 2 : 0)}<u>${t.ly}</u>`]
  ];
  if (s.V != null) rows.push([t.stMagApp, `${nf(starAppMag(abs, rNow), 2)}`]);
  rows.push([t.stMagAbs, `${nf(abs, 2)}`]);
  // ความสว่างจริงเทียบดวงอาทิตย์ จากผลต่างความสว่างสัมบูรณ์
  rows.push([t.stLum, `${fmtLum(Math.pow(10, (SUN_ABSMAG - abs) / 2.5))}<u>${t.timesSun}</u>`]);
  if (s.sp) rows.push([t.stSpec, s.sp]);
  rows.push([t.stNaked, starAppMag(abs, rNow) < 6.0 ? t.yes : t.no]);

  const phys = el('div', 'sec');
  phys.innerHTML = `<h3>${t.secStar}</h3><dl class="readout">` +
    rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('') + `</dl>`;

  // แสงที่เห็นตอนนี้ออกเดินทางมาตั้งแต่เมื่อไร
  const leftYear = new Date(S.time).getFullYear() - Math.round(s.d);
  const note = el('div', 'note');
  note.innerHTML = `<span></span><p></p>`;
  note.querySelector('span').textContent = t.stLight;
  note.querySelector('p').textContent = t.stLightNote
    .replace('{ly}', nf(s.d, s.d < 100 ? 1 : 0))
    // ปีไม่ใส่เครื่องหมายคั่นหลักพัน
    .replace('{year}', S.lang === 'th' ? (leftYear + 543) + ' (พ.ศ.)' : String(leftYear));
  phys.appendChild(note);

  // ถ้าเดินทางด้วยความเร็วของวอยเอเจอร์ 1 จะใช้เวลาเท่าไร
  const yrs = s.d * 9.4607304726e12 / 16.92 / 3.15576e7;
  const note2 = el('div', 'note');
  note2.innerHTML = `<span></span><p></p>`;
  note2.querySelector('span').textContent = t.stTravel;
  note2.querySelector('p').textContent = t.stTravelNote.replace('{yr}', nf(Math.round(yrs / 1000) * 1000));
  phys.appendChild(note2);
  pane.appendChild(phys);

  const act = el('div', 'sec');
  const b1 = el('button', 'chip');
  b1.textContent = t.stAim;
  b1.addEventListener('click', () => aimAtStar(starSel));
  const b2 = el('button', 'chip');
  b2.textContent = t.stBack;
  b2.addEventListener('click', () => { starSel = -1; syncCrumb(); renderInfo(); });
  const chips = el('div', 'chips');
  chips.append(b1, b2);
  act.appendChild(chips);
  pane.appendChild(act);
}

function fmtLum(x) {
  if (x >= 1000) return nf(Math.round(x / 100) * 100);
  if (x >= 10) return nf(x, 0);
  if (x >= 0.1) return nf(x, 2);
  return x.toExponential(1).replace('e-', ' × 10⁻');
}

/* ── กันป้ายต่างระบบวางทับกัน ─────────────────────────────────────────────
   ป้ายวัตถุ ป้ายกาแล็กซี ป้ายกลุ่มดาว และป้ายดาวฤกษ์ ต่างคนต่างคำนวณ จึงเคยซ้อนกันกลางจอ
   ทุกเฟรมล้างรายการกล่องครั้งเดียว แล้วให้แต่ละระบบ "จองที่" ตามลำดับความสำคัญ
   กล่องเก็บเป็น [x กลาง, y กลาง, ครึ่งกว้าง, ครึ่งสูง] เรียงต่อกันในอาร์เรย์เดียว       */
const labelBoxes = [];
function resetLabelBoxes() { labelBoxes.length = 0; }
function labelWidth(txt, perChar) { return 18 + txt.length * perChar; }
function claimLabel(x, y, w, h) {
  const hw = w / 2, hh = h / 2;
  for (let i = 0; i < labelBoxes.length; i += 4) {
    if (Math.abs(labelBoxes[i] - x) < hw + labelBoxes[i + 2] &&
        Math.abs(labelBoxes[i + 1] - y) < hh + labelBoxes[i + 3]) return false;
  }
  labelBoxes.push(x, y, hw, hh);
  return true;
}

/* ชื่อดาวที่มีแต่รหัสไบเออร์จาก SIMBAD ("gam Lup") → อักษรกรีกแบบที่นักดาราศาสตร์เขียน ("γ Lup") */
const GREEK = { alf: 'α', bet: 'β', gam: 'γ', del: 'δ', eps: 'ε', zet: 'ζ', eta: 'η', tet: 'θ',
  iot: 'ι', kap: 'κ', lam: 'λ', mu: 'μ', nu: 'ν', ksi: 'ξ', omi: 'ο', pi: 'π', rho: 'ρ',
  sig: 'σ', tau: 'τ', ups: 'υ', phi: 'φ', chi: 'χ', psi: 'ψ', ome: 'ω' };
function bayerOf(s) {
  if (s._bay === undefined) {
    // ตัวย่อกลุ่มดาวมีตัวใหญ่ปน (TrA, CMa) · ดาวบางดวงใช้อักษรละตินแทนกรีก (d Cen)
    const m = /^([a-z]{1,3})\.?\s+([A-Z][A-Za-z]{2})$/.exec(s.n);
    s._bay = m ? (GREEK[m[1]] || m[1]) + ' ' + m[2] : null;
  }
  return s._bay;
}

/* ── เส้นกลุ่มดาว ────────────────────────────────────────────────────────
   ลากเส้นเชื่อมดาวจริงในฉากเดียวกับดาว (starScene) จุดปลายเส้นคือตำแหน่งดาวจริง
   ไม่ใช่รูปที่แปะไว้บนทรงกลมท้องฟ้า — พอบินออกจากดวงอาทิตย์ เส้นจะยืดและ
   รูปกลุ่มดาวจะบิดเบี้ยวไปเองตามจริง
   มองจากนอกระบบสุริยะจึงเห็นแบบเดียวกับ NASA Eyes: เส้นสีฟ้าพุ่งกระจายรอบดวงอาทิตย์
   เพราะดาวในกลุ่มเดียวกันอยู่ห่างเราต่างกันเป็นร้อยปีแสง ส่วนที่อยู่ใกล้กล้องจะสว่างกว่า
   ส่วนที่ลึกเข้าไปด้านหลัง เส้นคงอยู่จนดาวจริงจางหายตอนเข้าสู่ฉากกาแล็กซี             */
let consLines = null, consBase = null;
const consLast = { x: NaN, y: NaN, z: NaN, o: NaN };
const consLabels = [];
const CONS_LABELS = 30;
const CONS_RGB = [0.33, 0.62, 1.0];

function buildConstellations() {
  const segs = [];
  for (const c of CONSTELLATIONS) {
    for (let i = 0; i < c.s.length; i += 2) segs.push(c.s[i], c.s[i + 1]);
  }
  const pos = new Float32Array(segs.length * 3);
  for (let i = 0; i < segs.length; i++) {
    const s = STARS[segs[i]];
    pos[i * 3] = s.x; pos[i * 3 + 1] = s.y; pos[i * 3 + 2] = s.z;
  }
  consBase = pos;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(pos.length), 3));
  consLines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.24, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending }));
  consLines.frustumCulled = false;
  starScene.add(consLines);
}

/* ความสว่างรายจุด: ใกล้กล้องสว่าง ลึกเข้าไปจางลง (คิดใหม่เฉพาะตอนกล้องขยับ) */
function shadeConsLines(out, dly) {
  if (consLast.x === starEye.x && consLast.y === starEye.y && consLast.z === starEye.z &&
      Math.abs(consLast.o - out) < 0.002) return;
  consLast.x = starEye.x; consLast.y = starEye.y; consLast.z = starEye.z; consLast.o = out;
  const col = consLines.geometry.attributes.color, a = col.array, p = consBase;
  const ref = Math.max(3, dly);
  for (let i = 0; i < a.length; i += 3) {
    const dv = Math.hypot(p[i] - starEye.x, p[i + 1] - starEye.y, p[i + 2] - starEye.z);
    const near = Math.min(1, 1.35 / (1 + 0.45 * dv / ref));
    const k = 1 - out + out * near;
    a[i] = CONS_RGB[0] * k; a[i + 1] = CONS_RGB[1] * k; a[i + 2] = CONS_RGB[2] * k;
  }
  col.needsUpdate = true;
}

function buildConsLabels() {
  for (let i = 0; i < CONS_LABELS; i++) {
    const node = el('button', 'lbl cons');
    node.innerHTML = `<span class="ring"></span><span class="nm"></span>`;
    node.hidden = true;
    node.addEventListener('click', ev => {
      ev.stopPropagation();
      if (node._ci != null) aimAtCons(node._ci);
    });
    labelLayer.appendChild(node);
    consLabels.push(node);
  }
}

function aimAtCons(i) {
  const c = CONSTELLATIONS[i];
  const dx = c.x - starEye.x, dy = c.y - starEye.y, dz = c.z - starEye.z;
  const r = Math.hypot(dx, dy, dz) || 1;
  camState.az = Math.atan2(-dy / r, -dx / r);
  camState.el = Math.max(-1.5, Math.min(1.5, Math.asin(-dz / r)));
}

const _cv = new THREE.Vector3();
function updateConstellations() {
  const dly = camState.dist / LY;
  // 0 = อยู่ในระบบสุริยะ เห็นเป็นรูปบนท้องฟ้า · 1 = ออกมามองจากข้างนอก เห็นเป็นโครงสามมิติ
  const out = step01(log10(0.05), log10(3), log10(Math.max(1e-12, dly)));
  const reach = Math.min(1, starFadeR * 1.6);
  const on = S.figures && reach > 0.03;
  if (consLines) {
    consLines.visible = on;
    consLines.material.opacity = (0.24 + 0.61 * out) * reach;
    if (on) shadeConsLines(out, dly);
  }
  if (!on) {
    for (const n of consLabels) n.hidden = true;
    return;
  }
  const W = innerWidth, H = innerHeight;
  const far = out > 0.5, th = S.lang === 'th';
  const cand = [];
  for (let i = 0; i < CONSTELLATIONS.length; i++) {
    const c = CONSTELLATIONS[i];
    _cv.set(c.x, c.y, c.z).project(starCam);
    if (_cv.z > 1 || Math.abs(_cv.x) > 0.96 || Math.abs(_cv.y) > 0.94) continue;
    cand.push({ i, b: c.b, x: (_cv.x * 0.5 + 0.5) * W, y: (-_cv.y * 0.5 + 0.5) * H });
  }
  cand.sort((a, b) => a.b - b.b);
  const limit = far ? CONS_LABELS : 16;
  const perChar = far ? (th ? 6.4 : 11.2) : (th ? 5.2 : 7.2);
  const alpha = String((0.62 + 0.3 * out) * reach);
  let k = 0;
  for (const c of cand) {
    if (k >= limit) break;
    const C = CONSTELLATIONS[c.i];
    const txt = th ? C.th : C.la;
    if (!claimLabel(c.x, c.y, labelWidth(txt, perChar), far ? 22 : 16)) continue;
    const node = consLabels[k++];
    node._ci = c.i;
    node.hidden = false;
    node.classList.toggle('far', far);
    node.classList.toggle('th', th);
    node.style.left = c.x.toFixed(1) + 'px';
    node.style.top = c.y.toFixed(1) + 'px';
    const nm = node.querySelector('.nm');
    if (nm.textContent !== txt) nm.textContent = txt;
    node.style.opacity = alpha;
  }
  for (; k < CONS_LABELS; k++) consLabels[k].hidden = true;
}

/* ลำดับการจองที่ของป้าย: ในระบบสุริยะให้ชื่อดาวฤกษ์มาก่อน
   ออกมานอกระบบแล้วให้ชื่อกลุ่มดาวมาก่อน (แบบ Eyes) */
function updateSkyLabels() {
  if (camState.dist / LY > 0.3) { updateConstellations(); updateStarLabels(); }
  else { updateStarLabels(); updateConstellations(); }
}

/* ── ป้ายบอกตำแหน่งในกาแล็กซี ─────────────────────────────────────────
   ฉากกาแล็กซีเป็นแบบจำลองเชิงศิลป์: จานเอ็กซ์โพเนนเชียล + ดุมกลาง + แขนกังหัน
   ลอการิทึม 4 แขน (pitch 0.235) แต่ "ตำแหน่งของเรา" เป็นค่าจริง คือดวงอาทิตย์
   อยู่ห่างใจกลาง 26,000 ปีแสง — และเมื่อไล่รัศมีที่แขนตัดผ่านแนวเดียวกับดวงอาทิตย์
   จะได้ราว 9,600 · 13,900 · 20,100 · 29,200 ปีแสง ซึ่งเรียงตรงกับโครงสร้างจริง
   (นอร์มา → สคูตัม–เซนทอรัส → ซาจิตทาเรียส–คารินา → ดวงอาทิตย์ → เพอร์ซิอัส)
   จึงติดชื่อแขนตามลำดับนั้นได้ โดยระบุไว้ชัดว่ารูปร่างเป็นแบบจำลอง ไม่ใช่แผนที่สำรวจ */
const GAL_PITCH = 0.235;
const galMarks = [];
const galMarkNodes = [];

function buildGalaxyMarks() {
  // r ที่แขนแต่ละเส้นตัดผ่านแนวอะซิมุทของดวงอาทิตย์ (th = π ในพิกัดของกลุ่มกาแล็กซี)
  const at = (rSun, dth) => {
    const th = Math.PI + dth;
    const r = rSun * Math.exp(GAL_PITCH * dth);
    return { r, th };
  };
  const marks = [
    { key: 'gCentre', r: 0, th: 0, big: true },
    { key: 'gNorma', ...at(9.63, -2.0) },
    { key: 'gScutum', ...at(13.9, 2.0) },
    { key: 'gSagittarius', ...at(20.15, -1.0) },
    { key: 'gPerseus', ...at(29.2, 1.0) },
    { key: 'gSun', r: SUN_R_GAL, th: Math.PI, big: true }
  ];
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
  for (const m of marks) {
    const x = m.r * Math.cos(m.th), y = m.r * Math.sin(m.th);
    galMarks.push({
      key: m.key, big: !!m.big,
      v: new THREE.Vector3().addScaledVector(C, x).addScaledVector(Q, y)
    });
  }
  galMarks.push({ key: 'gHalo', big: false, v: P.clone().multiplyScalar(230) });   // ป้ายฮาโลสสารมืด ลอยเหนือระนาบกาแล็กซี

  // วงโคจรของดวงอาทิตย์รอบใจกลางกาแล็กซี (รอบละราว 230 ล้านปี)
  const pts = [];
  for (let i = 0; i <= 180; i++) {
    const a = i / 180 * Math.PI * 2;
    pts.push(new THREE.Vector3()
      .addScaledVector(C, SUN_R_GAL * Math.cos(a))
      .addScaledVector(Q, SUN_R_GAL * Math.sin(a)));
  }
  const ring = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0xffb454, transparent: true, opacity: 0.2, depthWrite: false }));
  ring.frustumCulled = false;
  galScene.add(ring);
  galSunRing = ring;

  for (let i = 0; i < galMarks.length; i++) {
    const node = el('button', 'lbl gal' + (galMarks[i].big ? ' big' : ''));
    node.innerHTML = `<span class="ring"></span><span class="nm"></span>`;
    node.hidden = true;
    labelLayer.appendChild(node);
    node.addEventListener('click', ev => { ev.stopPropagation(); selectDeep(0); });   // กดป้ายในกาแล็กซี = ดูข้อมูลทางช้างเผือก
    galMarkNodes.push(node);
  }
}

let galSunRing = null;
const _gv = new THREE.Vector3();
function updateGalaxyMarks() {
  const t = L();
  if (galHalo) galHalo.material.uniforms.camPos.value.copy(galCam.position);
  const show = S.galaxy && galFade > 0.12;
  if (galSunRing) {
    galSunRing.visible = show;
    // วงนี้ผ่านตัวเราพอดี มองจากใกล้ ๆ จึงกลายเป็นเส้นตรงพาดทั้งจอ ให้โผล่เมื่อถอยไกลจนเห็นเป็นวง
    galSunRing.material.opacity = 0.22 * galFade * step01(log10(800), log10(5000), log10(Math.max(1e-12, camState.dist / LY)));
  }
  if (!show) {
    for (const n of galMarkNodes) n.hidden = true;
    return;
  }
  const W = innerWidth, H = innerHeight;
  for (let i = 0; i < galMarks.length; i++) {
    const m = galMarks[i], node = galMarkNodes[i];
    if (m.key === 'gHalo' && (!galHalo || galHalo.material.uniforms.fade.value < 0.08)) { node.hidden = true; continue; }
    _gv.copy(m.v).project(galCam);
    if (_gv.z > 1 || _gv.z < -1 || Math.abs(_gv.x) > 1 || Math.abs(_gv.y) > 1) { node.hidden = true; continue; }
    const gx = (_gv.x * 0.5 + 0.5) * W, gy = (-_gv.y * 0.5 + 0.5) * H;
    if (!claimLabel(gx, gy, labelWidth(t[m.key], 7.6) + 14, 18)) { node.hidden = true; continue; }
    node.hidden = false;
    node.style.left = gx.toFixed(1) + 'px';
    node.style.top = gy.toFixed(1) + 'px';
    node.querySelector('.nm').textContent = t[m.key];
    node.style.opacity = String(Math.min(1, galFade * 1.5));
  }
}

/* ── ไกลกว่าทางช้างเผือก ────────────────────────────────────────────────
   ฉากที่ห้า: 1 หน่วย = 1 ล้านปีแสง ในพิกัดสุริยวิถี · กล้องยืนที่ตำแหน่งจริงของผู้ชม
   · กาแล็กซีมีชื่อ (deep.js) — ภาพปั้นตามชนิดด้วยโค้ด ขนาดตามเส้นผ่านศูนย์กลางจริง
     จานของกาแล็กซีกังหันวางเอียงในสามมิติ ตามมุมแกนยาวบนท้องฟ้าและอัตราส่วนแกนที่วัดได้
   · แผนที่กาแล็กซีจริง 43,439 แห่งจาก 2MASS Redshift Survey (cosmic.js โหลดตอนซูมออกไกลครั้งแรก)
   · ขอบเอกภพที่สังเกตได้ เคลือบด้วยแผนที่รังสีไมโครเวฟพื้นหลังจากข้อมูล WMAP ของ NASA (cmb.jpg)       */
const MLY = 1e6;                      // ปีแสงต่อหนึ่งหน่วยของฉากนี้
const OBS_RADIUS = 46500;             // รัศมีเอกภพที่สังเกตได้ (ล้านปีแสง)
let deepScene, deepCam, deepFade = 0, obsShell = null;
let cosmicPts = null, cosmicState = 0, cmbState = 0;
const deepNodes = [];
const deepSprites = [];
const deepHalos = [];
let deepSel = -1;                     // ลำดับใน deepSprites ที่กำลังดูข้อมูล (0 = ทางช้างเผือก · −1 = ไม่ได้เลือก)

/* แกนของทางช้างเผือกในพิกัดสุริยวิถี: C = ทิศใจกลาง · Q = ทิศ l = 90° · P = ขั้วเหนือกาแล็กซี */
function galBasis() {
  const P = new THREE.Vector3(Math.cos(29.81 * DEG) * Math.cos(180.02 * DEG),
    Math.cos(29.81 * DEG) * Math.sin(180.02 * DEG), Math.sin(29.81 * DEG));
  const C = new THREE.Vector3(Math.cos(-5.54 * DEG) * Math.cos(266.84 * DEG),
    Math.cos(-5.54 * DEG) * Math.sin(266.84 * DEG), Math.sin(-5.54 * DEG));
  C.addScaledVector(P, -C.dot(P)).normalize();
  const Q = new THREE.Vector3().crossVectors(P, C).normalize();
  return { P, C, Q };
}

function deepGlowTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,252,240,.95)');
  gr.addColorStop(0.18, 'rgba(226,232,246,.55)');
  gr.addColorStop(0.48, 'rgba(150,175,220,.16)');
  gr.addColorStop(1, 'rgba(120,150,200,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ภาพกาแล็กซีตามชนิด — ปั้นจากสูตร ไม่ใช่ภาพถ่าย · เก็บผ้าใบไว้ใช้ทำรูปในแผงข้อมูลด้วย */
const GAL_TEX = {};
function galaxyTex(type) {
  if (GAL_TEX[type]) return GAL_TEX[type];
  const N = 256, c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d'), img = g.createImageData(N, N), d = img.data;
  let seed = 977 + type.length * 7919;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff), seed / 0x7fffffff);
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const blobs = [];
  const nBlob = type === 'irregular' ? 46 : type === 'cluster' ? 70 : type === 'ring' ? 36 : 0;
  for (let k = 0; k < nBlob; k++) {
    const a = rnd() * Math.PI * 2;
    const rr = type === 'ring' ? 0.62 + (rnd() - 0.5) * 0.08 : Math.pow(rnd(), 0.7) * 0.75;
    blobs.push([Math.cos(a) * rr * (type === 'irregular' ? 1.0 : 1), Math.sin(a) * rr * (type === 'irregular' ? 0.7 : 1),
      0.03 + rnd() * (type === 'cluster' ? 0.05 : 0.07), 0.4 + rnd() * 0.8, rnd()]);
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = (x + 0.5) / N * 2 - 1, v = (y + 0.5) / N * 2 - 1;
    const r = Math.hypot(u, v), th = Math.atan2(v, u);
    let R = 0, G = 0, B = 0;
    const add = (i, cr, cg, cb) => { R += i * cr; G += i * cg; B += i * cb; };
    const edge = 1 - sm(0.82, 1.0, r);
    if (type === 'spiral' || type === 'barred') {
      const bulge = Math.exp(-((r / 0.13) ** 2)) * 1.25;
      const disc = Math.exp(-r / 0.3);
      const r0 = type === 'barred' ? 0.28 : 0.06;
      const ph = th - Math.log(Math.max(r, r0) / r0) / 0.30;
      const arm = Math.pow(0.5 + 0.5 * Math.cos(2 * ph), 3);
      const amt = sm(type === 'barred' ? 0.24 : 0.08, 0.32, r) * (1 - sm(0.7, 0.98, r));
      const dust = 1 - 0.6 * Math.pow(0.5 + 0.5 * Math.cos(2 * (ph + 0.42)), 8) * amt;
      const knot = hash(Math.floor(u * 60), Math.floor(v * 60)) > 0.985 ? arm * amt * 1.3 : 0;
      add(disc * (0.22 + 1.05 * arm * amt) * dust * edge, 0.70, 0.80, 1.0);
      add(knot * edge, 1.0, 0.45, 0.62);
      add(bulge, 1.0, 0.90, 0.72);
      if (type === 'barred') add(Math.exp(-((u / 0.34) ** 2) - (v / 0.06) ** 2) * 0.85, 1.0, 0.88, 0.70);
    } else if (type === 'elliptical') {
      const I = Math.min(1.6, 0.05 * Math.exp(-7.67 * (Math.pow(Math.max(r, 0.004) / 0.42, 0.25) - 1)));
      add(I * edge, 1.0, 0.86, 0.66);
    } else if (type === 'lenticular') {
      add(Math.exp(-((r / 0.15) ** 2)) * 1.2, 1.0, 0.9, 0.74);
      add(Math.exp(-r / 0.26) * 0.42 * edge * (1 - 0.35 * Math.exp(-(((r - 0.42) / 0.05) ** 2))), 0.95, 0.9, 0.84);
    } else if (type === 'irregular') {
      add(Math.exp(-Math.hypot(u, v * 1.4) / 0.3) * 0.28 * edge, 0.72, 0.8, 1.0);
      for (const [bx, by, bs, bi, bc] of blobs) {
        const q = Math.exp(-((u - bx) ** 2 + (v - by) ** 2) / (bs * bs)) * bi * 0.8;
        if (bc > 0.8) add(q, 1.0, 0.5, 0.66); else add(q, 0.66, 0.78, 1.0);
      }
    } else if (type === 'dwarf') {
      add(Math.exp(-((r / 0.42) ** 2)) * 0.62 * edge, 0.95, 0.9, 0.8);
    } else if (type === 'ring') {
      add(Math.exp(-((r / 0.13) ** 2)) * 1.15, 1.0, 0.86, 0.6);
      add(Math.exp(-(((r - 0.62) / 0.07) ** 2)) * 0.75 * edge, 0.62, 0.78, 1.0);
      for (const [bx, by, bs, bi] of blobs) add(Math.exp(-((u - bx) ** 2 + (v - by) ** 2) / (bs * bs * 0.4)) * bi * 0.5, 0.7, 0.82, 1.0);
    } else if (type === 'merger') {
      for (const [cx, cy, sgn] of [[-0.22, -0.06, 1], [0.24, 0.08, -1]]) {
        const du = u - cx, dv = v - cy, rc = Math.hypot(du, dv), tc = Math.atan2(dv, du);
        add(Math.exp(-((rc / 0.1) ** 2)) * 1.1, 1.0, 0.9, 0.74);
        add(Math.exp(-rc / 0.16) * 0.45, 0.8, 0.84, 1.0);
        let dph = (tc - sgn * Math.log(Math.max(rc, 0.08) / 0.08) / 0.55) % (Math.PI * 2);
        if (dph < -Math.PI) dph += Math.PI * 2; else if (dph > Math.PI) dph -= Math.PI * 2;
        add(Math.exp(-(dph * dph) / 0.06) * sm(0.1, 0.3, rc) * (1 - sm(0.55, 0.95, rc)) * 0.6 * edge, 0.7, 0.8, 1.0);
      }
    } else if (type === 'quasar') {
      add(Math.exp(-((r / 0.035) ** 2)) * 2.2 + Math.exp(-r / 0.13) * 0.35, 0.8, 0.95, 1.0);
      add((Math.exp(-Math.abs(u) / 0.012) * Math.exp(-Math.abs(v) / 0.4) + Math.exp(-Math.abs(v) / 0.012) * Math.exp(-Math.abs(u) / 0.4)) * 0.45 * edge, 0.8, 0.95, 1.0);
    } else if (type === 'distant') {
      add(Math.exp(-((r / 0.22) ** 2)) * 1.0 + Math.exp(-r / 0.3) * 0.2 * edge, 1.0, 0.5, 0.36);
    } else {                                                         // กระจุกกาแล็กซี
      add(Math.exp(-r / 0.35) * 0.22 * edge, 0.95, 0.9, 0.82);
      for (const [bx, by, bs, bi] of blobs) add(Math.exp(-((u - bx) ** 2 + (v - by) ** 2) / (bs * bs * 0.25)) * bi, 1.0, 0.88, 0.7);
    }
    const i = (y * N + x) * 4;
    d[i] = Math.min(255, R * 255); d[i + 1] = Math.min(255, G * 255); d[i + 2] = Math.min(255, B * 255); d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  GAL_TEX[type] = t;
  return t;
}

/* จานกาแล็กซีเอียงในสามมิติ: แกนยาวตามมุมบนท้องฟ้า (pa) · มุมเอียงจากอัตราส่วนแกน (ar = cos i) */
const FLAT_TYPES = new Set(['spiral', 'barred', 'lenticular', 'ring', 'irregular', 'merger']);
function discQuat(o, north) {
  const l = new THREE.Vector3(o.x, o.y, o.z).normalize();
  const n = north.clone().addScaledVector(l, -north.dot(l)).normalize();     // ทิศเหนือบนท้องฟ้า ณ ตำแหน่งนั้น
  const e = new THREE.Vector3().crossVectors(n, l);                          // ทิศตะวันออก
  const pa = (o.pa || 0) * DEG, inc = Math.acos(Math.max(0.12, Math.min(1, o.ar || 1)));
  const m = n.clone().multiplyScalar(Math.cos(pa)).addScaledVector(e, Math.sin(pa));
  const s = n.clone().multiplyScalar(-Math.sin(pa)).addScaledVector(e, Math.cos(pa));
  const nrm = l.clone().multiplyScalar(Math.cos(inc)).addScaledVector(s, Math.sin(inc));
  const v = new THREE.Vector3().crossVectors(nrm, m);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(m, v, nrm));
}

function buildDeep() {
  deepScene = new THREE.Scene();
  deepCam = new THREE.PerspectiveCamera(48, 1, 1e-4, 4e6);
  deepCam.up.set(0, 0, 1);
  const GB = galBasis();
  const north = new THREE.Vector3(0, Math.sin(OBLIQ), Math.cos(OBLIQ));      // ขั้วฟ้าเหนือในพิกัดสุริยวิถี
  const plane = new THREE.PlaneGeometry(1, 1);

  // ทางช้างเผือกเอง อยู่ที่จุดกำเนิดของฉากนี้ วางจานตามระนาบกาแล็กซีจริง
  const home = { th: null, en: null, x: 0, y: 0, z: 0, dly: 100000, t: 'barred', home: true };
  const all = [home].concat(DEEP);
  for (const o of all) {
    const flat = o.home || FLAT_TYPES.has(o.t);
    const matOpt = { map: galaxyTex(o.home ? 'barred' : o.t), transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, depthTest: false, opacity: 0 };
    let obj;
    if (flat) {
      obj = new THREE.Mesh(plane, new THREE.MeshBasicMaterial(Object.assign(matOpt, { side: THREE.DoubleSide })));
      if (o.home) obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(GB.C, GB.Q, GB.P));
      else obj.quaternion.copy(discQuat(o, north));
    } else {
      obj = new THREE.Sprite(new THREE.SpriteMaterial(matOpt));
    }
    obj.position.set(o.x, o.y, o.z);
    obj.frustumCulled = false;
    deepScene.add(obj);
    deepSprites.push({ sp: obj, o });
    const idx = deepSprites.length - 1;
    const node = el('button', 'lbl deep' + (o.home || o.de || o.t === 'cluster' ? ' big' : ''));
    node.innerHTML = `<span class="ring"></span><span class="nm"></span>`;
    node.hidden = true;
    node.addEventListener('click', ev => { ev.stopPropagation(); selectDeep(idx); aimAtDeep(o); });
    labelLayer.appendChild(node);
    deepNodes.push(node);
  }

  // ฮาโลสสารมืดของทางช้างเผือกและแอนดรอเมดา (สีม่วงสมมุติ) กว้างราว 1.3 และ 1.6 ล้านปีแสง — ขอบเกือบแตะกัน
  const haloTex = new THREE.CanvasTexture(glowTexture([[0, 'rgba(150,110,255,.5)'], [0.35, 'rgba(120,90,240,.2)'],
    [0.75, 'rgba(100,80,220,.05)'], [1, 'rgba(90,70,200,0)']], 128));
  for (const o of all) {
    if (!(o.home || o.id === 'm31')) continue;
    const hs = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, opacity: 0 }));
    hs.position.set(o.x, o.y, o.z);
    hs.scale.setScalar(o.home ? 1.3 : 1.6);
    hs.frustumCulled = false;
    deepScene.add(hs);
    deepHalos.push(hs);
  }

  const obsNode = el('button', 'lbl deep big');
  obsNode.id = 'obsLabel';
  obsNode.innerHTML = '<span class="ring"></span><span class="nm"></span>';
  obsNode.hidden = true;
  labelLayer.appendChild(obsNode);

  // ขอบเอกภพที่สังเกตได้: ทรงกลมเคลือบแผนที่รังสีไมโครเวฟพื้นหลัง
  // ภาพเก็บเป็นพิกัดกาแล็กซี (u = l/360, v = b) จึงแปลงทิศในเชเดอร์ด้วยแกน C Q P
  obsShell = new THREE.Mesh(new THREE.SphereGeometry(OBS_RADIUS, 96, 48), new THREE.ShaderMaterial({
    uniforms: { map: { value: null }, opacity: { value: 0 }, uHas: { value: 0 },
      uC: { value: GB.C }, uQ: { value: GB.Q }, uP: { value: GB.P } },
    vertexShader: `varying vec3 vDir;
      void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D map; uniform float opacity; uniform float uHas;
      uniform vec3 uC; uniform vec3 uQ; uniform vec3 uP; varying vec3 vDir;
      void main(){
        vec3 d = normalize(vDir);
        float l = atan(dot(uQ, d), dot(uC, d));
        float b = asin(clamp(dot(uP, d), -1.0, 1.0));
        vec2 uv = vec2(fract(l / 6.2831853), 0.5 + b / 3.1415927);
        gl_FragColor = vec4(texture2D(map, uv).rgb * uHas, opacity * uHas);
      }`,
    transparent: true, depthWrite: false, depthTest: false, side: THREE.BackSide
  }));
  obsShell.renderOrder = -10;
  obsShell.frustumCulled = false;
  obsShell.visible = false;
  deepScene.add(obsShell);
}

function loadCmb() {
  cmbState = 1;
  new THREE.TextureLoader().load('cmb.jpg', tx => {
    tx.minFilter = THREE.LinearFilter;        // ไม่ใช้ mipmap — ไม่งั้นรอยต่อ l = 0/360 จะเป็นเส้น
    tx.generateMipmaps = false;
    tx.wrapS = THREE.RepeatWrapping;
    obsShell.material.uniforms.map.value = tx;
    obsShell.material.uniforms.uHas.value = 1;
    cmbState = 2;
  }, undefined, () => { cmbState = -1; });
}

/* แผนที่กาแล็กซี 2MRS: จุดละกาแล็กซี สีตามชนิด ขนาดตามความสว่างจริง */
function loadCosmic() {
  cosmicState = 1;
  addScript('cosmic.js').then(ok => {
    const CM = window.COSMIC;
    if (!ok || !CM) { cosmicState = -1; return; }
    const dec = s => { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
    const p8 = dec(CM.pos), cls = dec(CM.cls), mag = dec(CM.mag);
    const p16 = new Int16Array(p8.buffer, 0, CM.n * 3);
    const pos = new Float32Array(CM.n * 3), col = new Float32Array(CM.n * 3), lum = new Float32Array(CM.n);
    // ไม่ทราบชนิด · รี · เลนส์ · กังหัน · ไร้รูปร่าง · เควซาร์
    const PAL = [[0.84, 0.86, 0.92], [1.0, 0.78, 0.55], [1.0, 0.87, 0.7], [0.62, 0.76, 1.0], [0.55, 0.7, 1.0], [0.5, 1.0, 0.95]];
    for (let i = 0; i < CM.n; i++) {
      pos[i * 3] = p16[i * 3] * CM.scale; pos[i * 3 + 1] = p16[i * 3 + 1] * CM.scale; pos[i * 3 + 2] = p16[i * 3 + 2] * CM.scale;
      const k = PAL[cls[i]] || PAL[0];
      col[i * 3] = k[0]; col[i * 3 + 1] = k[1]; col[i * 3 + 2] = k[2];
      lum[i] = Math.pow(10, -0.4 * (mag[i] / 25 - 27 + 24));          // เทียบกาแล็กซีที่ M_K = −24
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('lum', new THREE.BufferAttribute(lum, 1));
    cosmicPts = new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: { fade: { value: 0 }, scale: { value: 1 } },
      vertexShader: `attribute float lum; attribute vec3 color; uniform float fade; uniform float scale;
        varying vec3 vCol; varying float vA;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float s = scale * sqrt(lum) * 900.0 / max(-mv.z, 0.5);
          gl_PointSize = clamp(s, 1.3, 6.5);
          vA = fade * clamp(s / 2.0, 0.28, 1.0);
          vCol = color;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `varying vec3 vCol; varying float vA;
        void main(){
          float q = length(gl_PointCoord - 0.5);
          if (q > 0.5) discard;
          gl_FragColor = vec4(vCol * smoothstep(0.5, 0.05, q) * vA, 1.0);
        }`,
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending
    }));
    cosmicPts.frustumCulled = false;
    deepScene.add(cosmicPts);
    cosmicState = 2;
  });
}

function aimAtDeep(o) {
  const p = deepEye;
  const dx = o.x - p.x, dy = o.y - p.y, dz = o.z - p.z;
  const r = Math.hypot(dx, dy, dz) || 1;
  camState.az = Math.atan2(-dy / r, -dx / r);
  camState.el = Math.max(-1.5, Math.min(1.5, Math.asin(-dz / r)));
}

function selectDeep(i) {
  deepSel = i; starSel = -1; exoSel = -1;
  syncCrumb();
  renderInfo();
}

function pickDeep(cx, cy) {
  if (!S.deep || deepFade < 0.05) return false;
  let best = -1, bestD = 18;
  for (let i = 0; i < deepSprites.length; i++) {
    const o = deepSprites[i].o;
    _dv.set(o.x, o.y, o.z).project(deepCam);
    if (_dv.z > 1) continue;
    const d = Math.hypot((_dv.x * 0.5 + 0.5) * innerWidth - cx, (-_dv.y * 0.5 + 0.5) * innerHeight - cy);
    if (d < bestD) { bestD = d; best = i; }
  }
  if (best < 0) return false;
  selectDeep(best);
  return true;
}

const deepEye = new THREE.Vector3();
function updateDeepCam() {
  // ผู้ชมอยู่ห่างจากดวงอาทิตย์เท่าไร แปลงเป็นหน่วยล้านปีแสง
  starCameraPos(deepEye);
  deepEye.multiplyScalar(1 / MLY);
  deepCam.position.copy(deepEye);
  deepCam.quaternion.copy(camera.quaternion);
  const d = Math.max(1e-6, camState.dist / LY / MLY);
  deepCam.near = Math.max(1e-6, d * 1e-4);
  deepCam.far = Math.max(2e5, d * 80);
  deepCam.aspect = camera.aspect;
  deepCam.updateProjectionMatrix();
}

const _dv = new THREE.Vector3();
function updateDeep() {
  const dMly = Math.max(camState.dist / LY, eyeLy()) / MLY;   // ไปดู M87* ก็เห็นกระจุกกาแล็กซีหญิงสาวรอบตัว
  const ld = log10(Math.max(1e-12, dMly));
  // เริ่มเห็นเพื่อนบ้านตอนออกพ้นทางช้างเผือก (ราวห้าหมื่นปีแสง) และเต็มที่ที่หนึ่งล้านปีแสง
  deepFade = S.deep ? step01(log10(0.05), log10(1.2), ld) : 0;
  const on = deepFade > 0.01;
  const fovK = innerHeight / (2 * Math.tan(camera.fov * DEG / 2));
  const homeFade = step01(log10(0.4), log10(3), ld);        // ทางช้างเผือกละเอียดในฉากกาแล็กซีจางไปก่อน แล้วค่อยเป็นภาพนี้
  for (const { sp, o } of deepSprites) {
    if (!on) { sp.visible = false; continue; }
    sp.visible = true;
    const camDist = Math.max(1e-9, sp.position.distanceTo(deepCam.position));
    const minPx = o.t === 'quasar' || o.t === 'distant' ? 9 : o.t === 'dwarf' ? 11 : 16;
    const real = (o.dly || 3000) / MLY;
    if (camDist < real * 0.6) { sp.visible = false; continue; }   // กล้องอยู่ในกาแล็กซีนั้นเอง
    sp.scale.setScalar(Math.max(real, minPx * camDist / fovK));
    // เล็กกว่าขนาดขั้นต่ำบนจอ = ดูไม่ออกว่าหน้าตาอย่างไร จึงหรี่ลง (เควซาร์/กาแล็กซียุคแรกเป็นเครื่องหมาย ไม่หรี่มาก)
    const floor = o.home ? 0.35 : (o.t === 'quasar' || o.t === 'distant') ? 0.7 : 0.14;
    const res = Math.min(1, Math.max(floor, (real / camDist * fovK) / minPx));
    sp.material.opacity = (o.home ? deepFade * homeFade * 0.9 : deepFade * (o.t === 'dwarf' ? 0.6 : 0.85)) * res;
  }

  for (const hs of deepHalos) {
    hs.visible = on && S.darkmatter;
    hs.material.opacity = deepFade * 0.55 * step01(log10(0.25), log10(1.5), ld);
  }

  // แผนที่กาแล็กซี 2MRS
  if (S.cosmic && on && cosmicState === 0 && dMly > 8) loadCosmic();
  if (cosmicPts) {
    const cf = S.cosmic ? deepFade * step01(log10(15), log10(250), ld) : 0;
    cosmicPts.visible = cf > 0.01;
    cosmicPts.material.uniforms.fade.value = cf;
    cosmicPts.material.uniforms.scale.value = Math.min(2, innerHeight / 900);
  }

  // ขอบเอกภพที่สังเกตได้ + รังสีไมโครเวฟพื้นหลัง
  if (obsShell) {
    const sh = step01(log10(800), log10(20000), ld);
    if (S.cmb && on && sh > 0.01 && cmbState === 0) loadCmb();
    const u = obsShell.material.uniforms;
    u.opacity.value = S.cmb ? 0.95 * sh * deepFade : 0;
    obsShell.visible = on && u.opacity.value > 0.004 && u.uHas.value > 0;
    obsShell.material.side = deepEye.length() < OBS_RADIUS ? THREE.BackSide : THREE.FrontSide;
    const node = $('#obsLabel');
    if (node) {
      if (!on || sh < 0.01) node.hidden = true;
      else {
        _dv.set(0, 0, OBS_RADIUS).project(deepCam);
        if (_dv.z > 1 || Math.abs(_dv.x) > 1 || Math.abs(_dv.y) > 1) node.hidden = true;
        else {
          const x = (_dv.x * 0.5 + 0.5) * innerWidth, y = (-_dv.y * 0.5 + 0.5) * innerHeight;
          node.hidden = !claimLabel(x, y, labelWidth(L().obsEdge, 6.4) + 14, 18);
          node.style.left = x.toFixed(1) + 'px';
          node.style.top = y.toFixed(1) + 'px';
          node.querySelector('.nm').textContent = L().obsEdge;
          node.style.opacity = String(sh);
        }
      }
    }
  }
  if (!on || deepFade < 0.3) { for (const n of deepNodes) n.hidden = true; return; }

  // ป้ายชื่อ: เรียงความสำคัญ (ที่เลือกอยู่ · ทางช้างเผือก · มีคำบรรยาย · ใหญ่บนจอ) แล้วจองที่ร่วมกับป้ายอื่น
  const W = innerWidth, H = innerHeight, t = L();
  const cand = [];
  for (let i = 0; i < deepNodes.length; i++) {
    const o = deepSprites[i].o;
    _dv.set(o.x, o.y, o.z).project(deepCam);
    if (_dv.z > 1 || Math.abs(_dv.x) > 0.98 || Math.abs(_dv.y) > 0.96) continue;
    const camDist = Math.max(1e-9, deepSprites[i].sp.position.distanceTo(deepCam.position));
    if (camDist < ((o.dly || 3000) / MLY) * 0.6) continue;
    const px = ((o.dly || 3000) / MLY) / camDist * fovK;
    const score = (i === deepSel ? 1e9 : 0) + (o.home ? 1e8 : 0) + (o.de ? 2000 : 0) + (o.t === 'cluster' ? 800 : 0) + px;
    cand.push({ i, x: (_dv.x * 0.5 + 0.5) * W, y: (-_dv.y * 0.5 + 0.5) * H, score });
  }
  cand.sort((a, b) => b.score - a.score);
  const vis = new Uint8Array(deepNodes.length);
  let shown = 0;
  for (const c of cand) {
    if (shown >= 36) break;
    const o = deepSprites[c.i].o, node = deepNodes[c.i];
    const txt = o.home ? t.milkyWay : (S.lang === 'th' ? o.th : o.en);
    if (!claimLabel(c.x, c.y, labelWidth(txt, 6.4) + 12, 16)) continue;
    vis[c.i] = 1; shown++;
    node.hidden = false;
    node.style.left = c.x.toFixed(1) + 'px';
    node.style.top = c.y.toFixed(1) + 'px';
    const nm = node.querySelector('.nm');
    if (nm.textContent !== txt) nm.textContent = txt;
    node.classList.toggle('on', c.i === deepSel);
    node.style.opacity = String(o.home ? Math.max(deepFade * homeFade, 0.35 * deepFade) : deepFade);
  }
  for (let i = 0; i < deepNodes.length; i++) if (!vis[i]) deepNodes[i].hidden = true;
}

/* ── แผงข้อมูลกาแล็กซี ── */
const DEEP_COL = { spiral: '#9fc0ff', barred: '#a8c4ff', lenticular: '#f2dcb8', elliptical: '#ffd49a', irregular: '#8fb4ff',
  dwarf: '#d8d2c4', ring: '#9fd0ff', merger: '#c8b8ff', quasar: '#7ff0ff', distant: '#ff9a7a', cluster: '#e8d8b8' };
const UNIVERSE_AGE_GYR = 13.79;                      // Planck 2018: 13.787 ± 0.020
const escHtml2 = s => String(s).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
function fmtLy(ly) {
  const t = L();
  if (ly >= 1e9) return `${nf(ly / 1e9, 2)}<u>${t.gly}</u>`;
  if (ly >= 1e6) return `${nf(ly / 1e6, ly >= 1e8 ? 0 : ly >= 1e7 ? 1 : 2)}<u>${t.mly}</u>`;
  return `${nf(ly, 0)}<u>${t.ly}</u>`;
}
function fmtYears(gyr) {
  const t = L();
  return gyr >= 1 ? `${nf(gyr, 2)}<u>${t.gyr}</u>` : `${nf(gyr * 1000, 0)}<u>${t.myr}</u>`;
}

function renderDeepInfo() {
  const t = L(), o = deepSprites[deepSel].o, pane = $('#pane-info');
  pane.innerHTML = '';
  const type = o.home ? 'barred' : o.t;
  const col = DEEP_COL[type] || '#cfd8e8';

  const head = el('div', 'sec');
  const hd = el('div', 'obj-head');
  const sw = el('div', 'obj-swatch');
  sw.style.setProperty('--glow', col);
  sw.style.background = `#04060a url(${galaxyTex(type).image.toDataURL('image/png')}) center/cover`;
  const ti = el('div', 'obj-title');
  ti.innerHTML = `<h2></h2><div class="kind"><em></em><span></span></div>`;
  ti.querySelector('h2').textContent = o.home ? t.milkyWay : (S.lang === 'th' ? o.th : o.en);
  ti.querySelector('.kind em').style.background = col;
  ti.querySelector('.kind span').textContent = t.galType[type] + (o.g && t.galGroup[o.g] ? ' · ' + t.galGroup[o.g] : '');
  hd.append(sw, ti);
  head.appendChild(hd);
  const desc = o.home ? t.mwDesc : (o.de ? o.de[S.lang] : '');
  if (desc) { const p = el('p', 'desc'); p.textContent = desc; head.appendChild(p); }
  pane.appendChild(head);

  const hereMly = Math.hypot(o.x - deepEye.x, o.y - deepEye.y, o.z - deepEye.z);
  const rows = [];
  if (!o.home) rows.push([t.stDist, fmtLy(o.mly * MLY)]);
  rows.push([t.stFromHere, fmtLy(hereMly * MLY)]);
  if (o.dly) rows.push([t.galDiam, (o.home ? '~' : '') + fmtLy(o.dly)]);
  if (o.m) rows.push([t.galMorph, escHtml2(o.m)]);
  if (o.zr != null) {
    rows.push([t.galZ, nf(o.zr, o.zr < 1 ? 4 : 2)]);
    rows.push([t.galLookback, fmtYears(o.lb)]);
    rows.push([t.galAgeThen, fmtYears(Math.max(0.01, UNIVERSE_AGE_GYR - o.lb))]);
  }
  const sec = el('div', 'sec');
  sec.innerHTML = `<h3>${t.secGalaxy}</h3><dl class="readout">` + rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('') + `</dl>`;
  if (!o.home) {
    const note = el('div', 'note');
    note.innerHTML = '<span></span><p></p>';
    if (o.zr != null) {
      note.querySelector('span').textContent = t.galComovTitle;
      note.querySelector('p').textContent = t.galComovNote;
    } else {
      note.querySelector('span').textContent = t.galLightTitle;
      // ระยะใกล้ ๆ แสงเดินทางมาเกือบเท่าระยะ (หน่วยปีแสง = ปี) · th: "2.5 ล้านปีก่อน" / "163,000 ปีก่อน"
      const n = o.mly >= 1 ? nf(o.mly, o.mly >= 100 ? 0 : 1) + (S.lang === 'th' ? ' ล้าน' : ' million')
                           : nf(o.mly * MLY, 0) + (S.lang === 'th' ? ' ' : '');
      note.querySelector('p').textContent = t.galLightNote.replace('{n}', n);
    }
    sec.appendChild(note);
  }
  const act = el('div', 'chips');
  const aim = el('button', 'chip', t.galAim);
  aim.addEventListener('click', () => aimAtDeep(o));
  act.appendChild(aim);
  // หลุมดำ/ซากซูเปอร์โนวาในกาแล็กซีนี้ — บินไปดูได้
  const farId = o.home ? 'sgra' : o.id === 'm87' ? 'm87bh' : o.id === 'lmc' ? 'sn1987a' : null;
  if (farId && REG[farId]) {
    const go = el('button', 'chip');
    go.textContent = t.farGo.replace('{n}', REG[farId].def.nm[S.lang]);
    go.addEventListener('click', () => setFocus(farId));
    act.appendChild(go);
  }
  sec.appendChild(act);
  pane.appendChild(sec);
  if (o.home) mwExtraSections(pane);
}

/* ── ทางช้างเผือก: มวลส่วนใหญ่มองไม่เห็น ─────────────────────────────────
   แผงข้อมูลเสริมเมื่อเลือกทางช้างเผือก: สัดส่วนมวล + กราฟความเร็วการหมุนรอบใจกลาง
   ตัวเลขประมาณจาก Licquia & Newman 2015 (ดาว 6.1×10¹⁰) · Kalberla & Kerp 2009 (ก๊าซ ~1×10¹⁰)
   Cautun et al. 2020 (มวลรวม ~1.1×10¹²) · ความเร็ววัดจริงอิง Eilers et al. 2019 (229 กม./วิ ที่ดวงอาทิตย์)
   เส้น "ถ้ามีแต่สสารที่มองเห็น" เป็นค่าประมาณเพื่อการเปรียบเทียบ ไม่ใช่ค่าวัด                          */
const SUP_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
function fmtSolar(m) {
  const e = Math.floor(Math.log10(m)), mant = m / Math.pow(10, e);
  return `${nf(mant, 1)} × 10${String(e).split('').map(ch => SUP_DIGITS[+ch]).join('')}<u>${L().timesSun}</u>`;
}

function mwExtraSections(pane) {
  const t = L();
  const parts = [[t.mwDark, 1.0e12, '#8a6cff'], [t.mwStars, 6.1e10, '#ffd49a'], [t.mwGas, 1.0e10, '#ff7aa8']];
  const total = parts.reduce((a, p) => a + p[1], 0);
  let x = 0, bars = '';
  for (const [, m, col] of parts) {
    const w = m / total * 100;
    bars += `<rect x="${x.toFixed(3)}" y="0" width="${w.toFixed(3)}" height="10" fill="${col}"/>`;
    x += w;
  }
  const mass = el('div', 'sec');
  mass.innerHTML = `<h3>${t.mwMassTitle}</h3>
    <svg viewBox="0 0 100 10" preserveAspectRatio="none" style="width:100%;height:12px;display:block;border-radius:3px;margin:4px 0 8px">${bars}</svg>
    <dl class="readout">` + parts.map(([nm, m, col]) =>
      `<dt><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${col};margin-right:6px"></i>${nm}</dt>` +
      `<dd>${fmtSolar(m)} · ${nf(m / total * 100, m / total < 0.02 ? 1 : 0)}%</dd>`).join('') +
    `</dl><p class="desc" style="font-size:11.5px">${t.mwMassNote}</p>`;
  pane.appendChild(mass);

  const W = 300, H = 178, X0 = 34, Y0 = 150, XS = (W - X0 - 12) / 80, YS = (Y0 - 14) / 300;
  const P = pts => pts.map(([r, v]) => `${(X0 + r * XS).toFixed(1)},${(Y0 - v * YS).toFixed(1)}`).join(' ');
  const obs = [[1, 170], [2, 200], [4, 215], [6, 222], [10, 228], [15, 230], [20, 230], [26.7, 229], [35, 225], [45, 219], [60, 212], [80, 201]];
  const vis = [[1, 170], [2, 200], [4, 215], [6, 222], [10, 224], [15, 214], [20, 200], [26.7, 185], [35, 168], [45, 150], [60, 132], [80, 115]];
  let grid = '';
  for (const v of [0, 100, 200, 300]) grid += `<line x1="${X0}" x2="${W - 12}" y1="${(Y0 - v * YS).toFixed(1)}" y2="${(Y0 - v * YS).toFixed(1)}" stroke="#223246" stroke-width="0.6"/><text x="${X0 - 5}" y="${(Y0 - v * YS + 3).toFixed(1)}" text-anchor="end" font-size="8.5" fill="#7f90a8">${v}</text>`;
  for (const r of [0, 20, 40, 60, 80]) grid += `<text x="${(X0 + r * XS).toFixed(1)}" y="${Y0 + 12}" text-anchor="middle" font-size="8.5" fill="#7f90a8">${r}</text>`;
  const sx = (X0 + 26.7 * XS).toFixed(1), sy = (Y0 - 229 * YS).toFixed(1);
  const chart = el('div', 'sec');
  chart.innerHTML = `<h3>${t.mwRotTitle}</h3>
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">${grid}
      <polyline points="${P(vis)}" fill="none" stroke="#7fb0ff" stroke-width="1.6" stroke-dasharray="4 3"/>
      <polyline points="${P(obs)}" fill="none" stroke="#ffb454" stroke-width="2.2"/>
      <circle cx="${sx}" cy="${sy}" r="3.6" fill="#ffb454"/>
      <text x="${sx}" y="${(+sy - 8).toFixed(1)}" text-anchor="middle" font-size="8.5" fill="#ffd49a">${t.mwSun}</text>
      <text x="${W - 12}" y="${H - 2}" text-anchor="end" font-size="8.5" fill="#7f90a8">${t.mwAxisR}</text>
      <text x="4" y="10" font-size="8.5" fill="#7f90a8">${t.mwAxisV}</text>
    </svg>
    <div class="chips" style="margin:6px 0 2px">
      <span class="chip" style="pointer-events:none"><em style="background:#ffb454"></em>${t.mwObs}</span>
      <span class="chip" style="pointer-events:none"><em style="background:#7fb0ff"></em>${t.mwVis}</span>
    </div>
    <p class="desc" style="font-size:11.5px">${t.mwRotNote}</p>`;
  pane.appendChild(chart);
}

/* ── หลุมดำและซากซูเปอร์โนวา: เป้าหมายที่บินไปดูได้ ─────────────────────
   อยู่ในทะเบียนเดียวกับดาวเคราะห์ (REG) แต่ตำแหน่งคงที่ในพิกัดสุริยวิถี (กม.) ห่างไปหลายพันถึงหลายสิบล้านปีแสง
   ระบบเลื่อนจุดกำเนิดของฉากทำให้ตัวเลขที่เข้า GPU ยังเล็กอยู่แม้ห่างขนาดนั้น (double มีความละเอียดพอ)
   · หลุมดำ: วาดในเชเดอร์บนแผ่นที่หันเข้ากล้องเสมอ — เงาหลุมดำ (รัศมี √27/2 Rs) วงแหวนโฟตอน
     และจานพอกพูนมวล (เฉพาะดวงที่กำลังกลืนก๊าซ) ด้านหลังของจานถูกแรงโน้มถ่วงดัดแสงให้โค้งข้ามเหนือและใต้เงา
     ด้านที่หมุนเข้าหาผู้ชมสว่างกว่า (Doppler beaming) — ภาพเชิงคุณภาพ ไม่ใช่การจำลองรังสีตามสัมพัทธภาพเต็มรูป
   · ซากซูเปอร์โนวา: โมเดลสามมิติที่ NASA เผยแพร่ ขยายเท่าขนาดจริง (เนบิวลาปู 11 ปีแสง · วงแหวน SN 1987A 1.3 ปีแสง)
   · ฉากหลังอิงระยะของ "ตัวกล้อง" จากดวงอาทิตย์ (eyeLy) ไม่ใช่ระยะมอง — ไปถึงใจกลางกาแล็กซีจึงเห็นกาแล็กซีรอบตัว */
const farRecs = [];
const _eye = { x: 0, y: 0, z: 0 };

/* ตำแหน่งจริงของกล้องในพิกัดสุริยวิถี (กม.) คิดจากสถานะกล้องโดยตรง ใช้ได้ก่อน applyCamera */
function eyeWorld(out) {
  const ce = Math.cos(camState.el), d = camState.dist;
  out.x = origin.x + d * ce * Math.cos(camState.az);
  out.y = origin.y + d * ce * Math.sin(camState.az);
  out.z = origin.z + d * Math.sin(camState.el);
  return out;
}
function eyeLy() {
  eyeWorld(_eye);
  return Math.hypot(_eye.x, _eye.y, _eye.z) / LY;
}

/* ขั้วฟ้าเหนือในพิกัดสุริยวิถี */
function celNorth() { return new THREE.Vector3(0, Math.sin(OBLIQ), Math.cos(OBLIQ)); }

/* หันภาพเข้าหาโลก ทิศเหนือขึ้นบน ตะวันออกไปทางซ้าย แบบภาพถ่ายดาราศาสตร์ */
function skyQuat(w) {
  const l = new THREE.Vector3(w.x, w.y, w.z).normalize();
  const nn = celNorth();
  const n = nn.addScaledVector(l, -nn.dot(l)).normalize();
  const e = new THREE.Vector3().crossVectors(n, l);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(e.negate(), n, l.negate()));
}

function farPrepare() {
  const ce = Math.cos(OBLIQ), se = Math.sin(OBLIQ);
  for (const f of FAR) {
    ORDER.push(f.id);
    f.far = true;
    f.nm = { th: f.th, en: f.en };
    f.kind = f.t;
    f.color = f.t === 'bh' ? 0xffb070 : f.t === 'pulsar' ? 0x21e6c8 : 0x9fd0ff;
    f.glow = f.t === 'bh' ? '#ffb070' : f.t === 'pulsar' ? '#21e6c8' : '#9fd0ff';
    f.desc = f.de || { th: '', en: '' };
    if (f.t === 'bh') {
      f.rs = 2.953 * f.mass;                        // รัศมีชวาร์สชิลด์ (กม.) = 2GM/c²
      f.ext = f.ext || (f.acc ? 30 : 9);            // ครึ่งความกว้างของแผ่นภาพ (หน่วย M)
      f.span = f.rs * f.ext * 1000;                 // ความกว้างของแผ่นภาพ (เมตร)
      f.radius = f.rs * 4;                          // กม. — ซูมเข้าได้จนเงาเกือบเต็มจอ
    } else if (f.t === 'pulsar') {
      f.span = f.size * LY * 1000;
      f.radius = f.size * LY * 0.005;
    } else {
      f.span = f.size * LY * 1000;                  // แสงฟุ้ง = ขนาดเนบิวลาทั้งก้อน
      f.radius = f.size * LY * 0.3;
      // โมเดลเนบิวลาปูของ NASA คือโครงสร้างที่เห็นในรังสีเอกซ์ ซึ่งกว้างราว 40% ของเนบิวลาในแสงปกติ (Chandra)
      if (f.id === 'crab') f.modelFrac = 0.4;
    }
    f.tilt = 0; f.axisNode = 0;
    // RA/Dec (J2000) → พิกัดสุริยวิถี ห่างจากดวงอาทิตย์ตามระยะจริง
    const ra = f.ra * DEG, de = f.dec * DEG, d = f.dly * LY;
    const x = Math.cos(de) * Math.cos(ra), y = Math.cos(de) * Math.sin(ra), z = Math.sin(de);
    f._world = { x: x * d, y: (y * ce + z * se) * d, z: (-y * se + z * ce) * d };
    if (f.kerr) kerrFrame(f);
  }
}

// ความกว้างขั้นต่ำบนจอเมื่ออยู่ไกล — หลุมดำและพัลซาร์แบบคำนวณจริงต้องเล็ก ไม่งั้นค้างเป็นก้อนใหญ่ตอนซูมออก
const farMinPx = def => def.t === 'bh' ? (def.kerr ? 0 : def.acc ? 64 : 30) : def.t === 'pulsar' ? 0 : 44;

function blackHoleMaterial(def) {
  return new THREE.ShaderMaterial({
    uniforms: { uExt: { value: def.ext }, uAcc: { value: def.acc ? 1 : 0 },
      uIncl: { value: (def.incl || 0) * DEG }, uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float uExt; uniform float uAcc; uniform float uIncl; uniform float uTime; varying vec2 vUv;
      void main(){
        vec2 p = (vUv - 0.5) * uExt;                       // หน่วย = รัศมีชวาร์สชิลด์
        float r = length(p);
        const float SH = 2.598;                            // ขอบเงา √27/2
        float inShadow = 1.0 - smoothstep(SH - 0.07, SH + 0.07, r);
        float ring = exp(-pow((r - 2.64) / 0.075, 2.0));   // วงแหวนโฟตอน
        vec3 col = vec3(0.0);
        float alpha = 0.0;
        if (uAcc > 0.5) {
          float ci = max(cos(uIncl), 0.12), si = sin(uIncl);
          float yd = p.y / ci;
          float rd = length(vec2(p.x, yd));                // รัศมีบนจาน
          float near = step(p.y, 0.0);                     // ครึ่งล่าง = ด้านใกล้ผู้ชม ทับหน้าเงาได้
          float disk = smoothstep(2.7, 3.3, rd) * (1.0 - smoothstep(8.5, 13.5, rd));
          float temp = 1.0 / (0.55 + rd * 0.17);
          float dop = 1.0 + 0.8 * si * clamp(p.x / max(rd, 0.001), -1.0, 1.0);
          float swirl = 0.78 + 0.22 * sin(atan(yd, p.x) * 3.0 - uTime * 0.7 + rd * 1.5);
          float direct = disk * temp * dop * swirl;
          direct *= mix(1.0 - inShadow, 1.0, near);        // ด้านไกลที่อยู่หลังเงาถูกบัง
          float band = smoothstep(2.75, 3.1, r) * (1.0 - smoothstep(5.0, 8.0, r));
          float lens = band * (0.3 + 0.7 * abs(p.y) / max(r, 0.001)) / (0.6 + r * 0.22)
                     * (1.0 + 0.5 * si * clamp(p.x / max(r, 0.001), -1.0, 1.0));
          vec3 hot = vec3(1.0, 0.93, 0.78), warm = vec3(1.0, 0.52, 0.16);
          vec3 dc = mix(warm, hot, clamp(temp * 1.25 - 0.35, 0.0, 1.0));
          col = dc * (direct * 1.5 + lens * 0.95) + vec3(1.0, 0.86, 0.62) * ring * 1.3;
          float glow = clamp(max(max(direct, lens), ring) * 1.6, 0.0, 1.0);
          alpha = max(inShadow * (1.0 - near * clamp(direct * 2.0, 0.0, 1.0)), glow);
        } else {
          float halo = exp(-max(r - 2.6, 0.0) * 1.8) * step(2.6, r) * 0.3;   // แสงดาวข้างหลังที่ถูกเลนส์รวม
          col = vec3(0.82, 0.88, 1.0) * (ring * 0.8 + halo * 0.35);
          alpha = max(inShadow, clamp(ring * 0.9 + halo, 0.0, 1.0));
        }
        float edge = 1.0 - smoothstep(0.4, 0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
        gl_FragColor = vec4(col * edge, alpha * edge);
      }`,
    transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide
  });
}

/* ── หลุมดำวาดแยกลงเป้าหมายย่อ แล้วค่อยซ้อนกลับ ──────────────────────────
   การเดินรังสีกินแรงตามจำนวนพิกเซลตรง ๆ — วัดจริงได้ 25 ms/เฟรมตอนอยู่ไกล
   แต่พอบินเข้าไปใกล้จนหลุมดำเต็มจอกลายเป็น 322 ms (3 เฟรม/วินาที)
   จึงวาดมันลงเป้าหมายที่ย่อส่วน (ปรับอัตราส่วนเองตามความลื่นของเฟรม) แล้วขยายกลับมาซ้อน
   ภาพหลุมดำไล่สีนุ่มอยู่แล้ว ย่อแล้วแทบไม่เห็นต่าง ต่างจากการลดจำนวนก้าวซึ่งทำให้ฟิสิกส์เพี้ยน
   และได้แสงฟุ้ง (bloom) มาฟรีจากเป้าหมายเดียวกัน: ตัดส่วนสว่าง → เบลอสองแกน → บวกทับ
   หลุมดำจึงไม่อยู่ใน layer 0 อีกต่อไป ฉากหลักไม่วาดมัน — ท่อนี้เป็นคนวาดและซ้อนเอง */
const BH_LAYER = 3;
const BH_MOVE = 40000;                      // งบพิกเซลตอนกล้องขยับ — เอาความลื่นไว้ก่อน
const BH_STILL = 2400000;                   // งบตอนภาพนิ่ง — เผื่อให้วาดใหญ่กว่าจอแล้วย่อลงได้
const BH_SS = 1.4;                          // ตอนนิ่งวาดใหญ่กว่าจอได้กี่เท่า (ลบรอยหยัก)
const BH_TILEN = 4;                         // ตอนวาดใหญ่ ซอยเป็นกี่ช่องต่อด้าน (เฟรมละช่อง)
let glowRec = null, bhScale = 0.55, bhBias = 1, bhStill = 0, bhCamStill = 0, bhDrawn = 0, bhDirty = true, bhNeedDraw = true, _bhOrb = 0, _bhOrbRaw = 0, _bhOrbWait = 0, glowScene = null, glowCam = null, glowQuad = null,
    bhTile = 0, bhRT = null, glowA = null, glowB = null, glowC = null, glowD = null, glowE = null, glowF = null,
    bhCopy = null, glowCut = null, glowBlur = null, glowAdd = null, bhW = 0, bhH = 0;

function glowInit() {
  const rtOpt = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false };
  bhRT = new THREE.WebGLRenderTarget(4, 4, rtOpt);
  glowA = new THREE.WebGLRenderTarget(4, 4, rtOpt);    // ชั้นละเอียด 1/2
  glowB = new THREE.WebGLRenderTarget(4, 4, rtOpt);
  glowC = new THREE.WebGLRenderTarget(4, 4, rtOpt);
  glowD = new THREE.WebGLRenderTarget(4, 4, rtOpt);    // ชั้นกลาง 1/4
  glowE = new THREE.WebGLRenderTarget(4, 4, rtOpt);
  glowF = new THREE.WebGLRenderTarget(4, 4, rtOpt);    // ชั้นหยาบ 1/8
  const vs = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  // ซ้อนภาพหลุมดำ: สีในเป้าหมายคูณอัลฟามาแล้ว จึงผสมแบบ src + dst·(1−a) เงาดำจึงบังฉากหลังได้จริง
  bhCopy = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: null }, uTexel: { value: new THREE.Vector2() } }, vertexShader: vs,
    fragmentShader: `uniform sampler2D uTex; uniform vec2 uTexel; varying vec2 vUv;
      void main(){
        // เฉลี่ยห้าจุดตอนขยายกลับ กลบขั้นบันไดจากการย่อ · uTexel = 0 เมื่อไม่ได้ย่อ จึงคมเท่าเดิม
        vec4 c = texture2D(uTex, vUv) * 0.44;
        c += texture2D(uTex, vUv + vec2(uTexel.x, 0.0)) * 0.14;
        c += texture2D(uTex, vUv - vec2(uTexel.x, 0.0)) * 0.14;
        c += texture2D(uTex, vUv + vec2(0.0, uTexel.y)) * 0.14;
        c += texture2D(uTex, vUv - vec2(0.0, uTexel.y)) * 0.14;
        gl_FragColor = c;
      }`,
    depthTest: false, depthWrite: false, transparent: true, blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor });
  glowCut = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: null }, uCut: { value: 0.45 } }, vertexShader: vs,
    fragmentShader: `uniform sampler2D uTex; uniform float uCut; varying vec2 vUv;
      void main(){ vec3 c = texture2D(uTex, vUv).rgb;
        gl_FragColor = vec4(max(c - uCut, 0.0) / max(1.0 - uCut, 1e-3), 1.0); }`,
    depthTest: false, depthWrite: false });
  glowBlur = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: null }, uDir: { value: new THREE.Vector2() } }, vertexShader: vs,
    fragmentShader: `uniform sampler2D uTex; uniform vec2 uDir; varying vec2 vUv;
      void main(){
        vec3 s = texture2D(uTex, vUv).rgb * 0.2270270;
        s += (texture2D(uTex, vUv + uDir * 1.3846154).rgb + texture2D(uTex, vUv - uDir * 1.3846154).rgb) * 0.3162162;
        s += (texture2D(uTex, vUv + uDir * 3.2307692).rgb + texture2D(uTex, vUv - uDir * 3.2307692).rgb) * 0.0702703;
        gl_FragColor = vec4(s, 1.0);
      }`,
    depthTest: false, depthWrite: false });
  glowAdd = new THREE.ShaderMaterial({
    uniforms: { uT1: { value: null }, uT2: { value: null }, uT3: { value: null },
      uW: { value: new THREE.Vector3(0.55, 0.42, 0.34) } }, vertexShader: vs,
    fragmentShader: `uniform sampler2D uT1, uT2, uT3; uniform vec3 uW; varying vec2 vUv;
      void main(){ gl_FragColor = vec4(texture2D(uT1, vUv).rgb * uW.x
                                     + texture2D(uT2, vUv).rgb * uW.y
                                     + texture2D(uT3, vUv).rgb * uW.z, 1.0); }`,
    depthTest: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending });
  glowQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bhCopy);
  glowQuad.frustumCulled = false;
  glowScene = new THREE.Scene();
  glowScene.add(glowQuad);
  glowCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
}

function glowPass(mat, target) {
  glowQuad.material = mat;
  renderer.setRenderTarget(target);
  renderer.clear(true, false, false);
  renderer.render(glowScene, glowCam);
}

/* คืนค่า true ถ้ามีหลุมดำรอซ้อนอยู่ · ต้องเรียกก่อนวาดภาพหลักเพราะสลับเป้าหมายการวาดชั่วคราว */
function bhRender() {
  if (!glowRec || !glowRec.holder.visible) return false;
  if (!glowScene) glowInit();
  if (!bhDirty && bhW) return true;          // ไม่มีอะไรเปลี่ยน — ซ้อนภาพเดิมไปเลย ไม่ต้องเดินรังสีใหม่
  const sz = renderer.getDrawingBufferSize(_bhV2);
  const w = Math.max(16, Math.round(sz.x * bhScale)), h = Math.max(16, Math.round(sz.y * bhScale));
  let resized = false;
  if (w !== bhW || h !== bhH) {
    bhW = w; bhH = h; bhTile = 0; resized = true;
    bhRT.setSize(w, h);
    const sz2 = (rt, d) => rt.setSize(Math.max(8, Math.floor(w / d)), Math.max(8, Math.floor(h / d)));
    sz2(glowA, 2); sz2(glowB, 2); sz2(glowC, 4); sz2(glowD, 4); sz2(glowE, 8); sz2(glowF, 8);
  }
  // วาดใหญ่กว่าจอ = งานหนักเกินจะจบในเฟรมเดียว จึงซอยเป็นช่อง วาดเฟรมละช่อง
  // ไม่ล้างทั้งผืน ภาพความละเอียดก่อนหน้าจึงค้างอยู่ในช่องที่ยังไม่ถึงคิว ไม่มีวาบดำให้เห็น
  const n = bhScale > 1.05 ? BH_TILEN : 1;
  const keep = camera.layers.mask;
  camera.layers.set(BH_LAYER);                 // เฉพาะหลุมดำ ไม่มีอย่างอื่นในเป้าหมายนี้
  renderer.setRenderTarget(bhRT);
  renderer.setClearColor(0x000000, 0);
  if (resized) renderer.clear(true, true, false);
  if (n > 1) {
    const tw = Math.ceil(bhW / n), th = Math.ceil(bhH / n);
    renderer.setScissorTest(true);
    renderer.setScissor((bhTile % n) * tw, Math.floor(bhTile / n) * th, tw, th);
  }
  renderer.clear(true, true, false);
  renderer.render(scene, camera);
  renderer.setScissorTest(false);
  camera.layers.mask = keep;
  renderer.setClearColor(0x05070c, 1);
  if (n > 1 && ++bhTile < n * n) { renderer.setRenderTarget(null); return true; }
  bhTile = 0;
  // ตัดเก็บเฉพาะส่วนสว่าง แล้วเบลอลงไปทีละชั้น ชั้นถัดไปย่อครึ่งหนึ่งเสมอ
  // การอ่านภาพชั้นก่อนหน้าที่ความละเอียดต่ำกว่าเท่ากับย่อและเบลอไปในตัว แสงจึงฟุ้งไกลขึ้นทุกชั้น
  glowCut.uniforms.uTex.value = bhRT.texture;
  glowPass(glowCut, glowA);
  const blurTo = (src, mid, dst) => {
    glowBlur.uniforms.uTex.value = src.texture;
    glowBlur.uniforms.uDir.value.set(1.4 / mid.width, 0);
    glowPass(glowBlur, mid);
    glowBlur.uniforms.uTex.value = mid.texture;
    glowBlur.uniforms.uDir.value.set(0, 1.4 / dst.height);
    glowPass(glowBlur, dst);
  };
  blurTo(glowA, glowB, glowA);          // ชั้น 1/2
  blurTo(glowA, glowC, glowD);          // ชั้น 1/4
  blurTo(glowD, glowE, glowF);          // ชั้น 1/8
  renderer.setRenderTarget(null);
  bhDrawn = bhScale;
  bhNeedDraw = false;
  return true;
}

function bhComposite() {
  bhCopy.uniforms.uTex.value = bhRT.texture;
  const soft = Math.max(0, 1 - bhScale) * 0.6;
  bhCopy.uniforms.uTexel.value.set(soft / bhRT.width, soft / bhRT.height);
  glowQuad.material = bhCopy;
  renderer.render(glowScene, glowCam);
  glowAdd.uniforms.uT1.value = glowA.texture;
  glowAdd.uniforms.uT2.value = glowD.texture;
  glowAdd.uniforms.uT3.value = glowF.texture;
  glowQuad.material = glowAdd;
  renderer.render(glowScene, glowCam);
}

/* ── ท้องฟ้าของกาแล็กซีแม่ (ใช้กับหลุมดำที่อยู่นอกทางช้างเผือก) ──────────
   ทรงกลมกลับด้านที่เกาะไปกับกล้อง ดาวคิดจากทิศในพิกัดโลกจึงอยู่นิ่งบนฟ้าเวลาหมุนกล้อง
   เป็นภาพจำลอง ไม่ใช่ตำแหน่งดาวจริง — กาแล็กซีทรงรีอย่าง M87 ยังไม่มีแคตาล็อกดาวรายดวง */
let hostSky = null, _hostV = new THREE.Vector3();

function hostSkyInit() {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uFade: { value: 0 }, uCore: { value: new THREE.Vector3(0, 0, 1) }, uCoreAmt: { value: 1 } },
    vertexShader: `varying vec3 vDir;
      void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float uFade, uCoreAmt; uniform vec3 uCore; varying vec3 vDir;
      float h31(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y) * p.z); }
      float layer(vec3 d, float sc, float thr, float rad){
        vec3 p = d * sc, ip = floor(p), fp = p - ip;
        float h = h31(ip);
        if (h < thr) return 0.0;
        vec3 c = vec3(h31(ip + 11.3), h31(ip + 27.7), h31(ip + 41.1)) * 0.5 + 0.25;
        return smoothstep(rad, 0.0, length(fp - c)) * (0.35 + fract(h * 91.0));
      }
      void main(){
        vec3 d = normalize(vDir);
        // ใจกลางกาแล็กซีแน่นกว่าขอบ — ยิ่งหันเข้าหาแกนกลาง ดาวยิ่งเยอะและมีแสงเรืองรวม
        float toCore = max(dot(d, uCore), 0.0);
        float dens = mix(0.55, 1.0, pow(toCore, 1.5)) * uCoreAmt;
        float s = layer(d, 210.0, 0.9955 - 0.003 * dens, 0.12) * 1.0
                + layer(d, 95.0, 0.9975 - 0.002 * dens, 0.10) * 0.7;
        // ประชากรดาวเก่าของกาแล็กซีทรงรี = เหลืองส้ม ไม่ใช่ฟ้าขาวแบบดาวเกิดใหม่
        vec3 col = vec3(1.0, 0.86, 0.66) * s * 1.6;
        col += vec3(0.30, 0.22, 0.14) * pow(toCore, 6.0) * 0.5 * dens;   // แสงเรืองรวมของใจกลาง
        gl_FragColor = vec4(col * uFade, 1.0);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, side: THREE.BackSide
  });
  hostSky = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), mat);
  hostSky.scale.setScalar(1e7);
  hostSky.frustumCulled = false;
  hostSky.renderOrder = -100;
  hostSky.visible = false;
  scene.add(hostSky);
}

/* เรียกจาก farPose ของหลุมดำที่อยู่นอกทางช้างเผือก */
function hostSkyPose(rec) {
  if (!hostSky) hostSkyInit();
  // ห่างจากหลุมดำกี่ปีแสง — เข้าใกล้กว่าขนาดกาแล็กซีเมื่อไรถึงเปิดฟ้าชุดนี้
  const ly = rec.holder.position.distanceTo(camera.position) * KMU / LY;
  const fade = 1 - smoothClamp(ly, 20000, 90000);
  hostSky.visible = fade > 0.004;
  if (!hostSky.visible) return;
  hostSky.position.copy(camera.position);
  hostSky.material.uniforms.uFade.value = fade;
  hostSky.material.uniforms.uCoreAmt.value = 1;
  _hostV.copy(rec.holder.position).sub(camera.position);
  if (_hostV.lengthSq() > 0) hostSky.material.uniforms.uCore.value.copy(_hostV.normalize());
}

const smoothClamp = (x, a, b) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ตัวแปรร่วมของหลุมดำเคอร์ — งบการเดินรังสีปรับตามความลื่นของเฟรม */
let bhSteps = 170, bhBusy = false;
const _bhV = new THREE.Vector3(), _bhR = new THREE.Vector3(), _bhU = new THREE.Vector3();
const _bhV2 = new THREE.Vector2();
const _qVela = new THREE.Quaternion(), _vVela = new THREE.Vector3(), _cVela = new THREE.Vector3();
const _bhSig = [0, 0, 0, 0, 0, 0, 0];       // สภาพของภาพเฟรมก่อน ใช้ดูว่ามีอะไรเปลี่ยนไหม

/* วางแกนหมุนของหลุมดำในพิกัดจริง: เอียง incl องศาจากแนวสายตา ไปทางมุมตำแหน่ง axisPA บนท้องฟ้า
   (มุมตำแหน่งวัดจากทิศเหนือของท้องฟ้าไปทางตะวันออก) แล้วสร้างฐานตั้งฉากไว้ให้เชเดอร์ใช้
   M87*: EHT 2019 (Paper V) สรุปว่าโมเมนตัมเชิงมุมชี้ออกจากโลก บนท้องฟ้าจึงเห็นก๊าซหมุนตามเข็มนาฬิกา
   ทำให้ขอบด้านใต้ของวงสว่างกว่า ตรงกับภาพที่ EHT ถ่ายได้ */
function kerrFrame(f) {
  const los = new THREE.Vector3(f._world.x, f._world.y, f._world.z).normalize();   // จากโลกออกไปหาหลุมดำ
  const nn = celNorth();
  const north = nn.clone().addScaledVector(los, -nn.dot(los)).normalize();
  const east = new THREE.Vector3().crossVectors(north, los).normalize();           // ตะวันออกบนท้องฟ้า
  const pa = (f.axisPA || 0) * DEG, inc = (f.incl || 0) * DEG;
  const onSky = north.clone().multiplyScalar(Math.cos(pa)).addScaledVector(east, Math.sin(pa));
  f._axis = los.clone().multiplyScalar(Math.cos(inc)).addScaledVector(onSky, Math.sin(inc)).normalize();
  const seed = Math.abs(f._axis.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
  f._ax = new THREE.Vector3().crossVectors(seed, f._axis).normalize();
  f._ay = new THREE.Vector3().crossVectors(f._axis, f._ax).normalize();
}

/* ── M87*: คำนวณเส้นทางแสงจริงในเมตริกเคอร์ ─────────────────────────────
   ยิงรังสีย้อนกลับจากกล้องทีละพิกเซล แล้วเดินสมการจีโอเดสิกไร้มวลในกาลอวกาศของหลุมดำหมุน
   (พิกัด Boyer–Lindquist · หน่วย M = GM/c² · พลังงานที่อนันต์ E = 1 · L = p_φ คงที่)
   ด้วยรูปแบบแฮมิลโทเนียน H = ½ g^{μν} p_μ p_ν = 0 และวิธีรุงเง-คุตตาอันดับสี่ ก้าวยาวปรับเอง
   สิ่งที่โผล่มาเองจากการคำนวณ ไม่ได้วาดเพิ่ม:
     · เงาหลุมดำที่เบี้ยวไม่กลม (สปินดันขอบเงาไปข้างหนึ่ง)
     · วงแหวนโฟตอน = ภาพอันดับสูงของจานที่วนรอบหลุมดำก่อนหลุดออกมา
     · จานด้านหลังที่ถูกดัดแสงให้โค้งข้ามเหนือเงา และผิวล่างของจานที่โผล่ใต้เงา
     · ดอปเพลอร์บีมมิง + เรดชิฟต์จากแรงโน้มถ่วง (I ∝ g⁴ · อุณหภูมิที่เห็น ∝ g) — ด้านที่วิ่งเข้าหาเราจึงสว่างกว่ามาก
   วางแกนหมุนตามของจริง: เอียง 17° จากแนวสายตา มุมตำแหน่งบนท้องฟ้าตามลำอนุภาคของ M87
   ดูจากโลกจึงเห็นเป็นวงแบบภาพ EHT — บินไปดูจากด้านข้างถึงจะเห็นจานม้วนแบบในหนัง */
function kerrBlackHoleMaterial(def) {
  const a = Math.min(Math.max(def.spin != null ? def.spin : 0.9, 0), 0.998);
  // รัศมีวงโคจรเสถียรวงในสุด (ISCO) ของเคอร์ — Bardeen, Press & Teukolsky 1972
  const z1 = 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
  const z2 = Math.sqrt(3 * a * a + z1 * z1);
  const isco = 3 + z2 - Math.sqrt(Math.max((3 - z1) * (3 + z1 + 2 * z2), 0));
  return new THREE.ShaderMaterial({
    uniforms: {
      uA: { value: a },
      uCam: { value: new THREE.Vector3(0, 0, 60) },      // ตำแหน่งกล้องในกรอบหลุมดำ (M)
      uRight: { value: new THREE.Vector3(1, 0, 0) },     // แกนของแผ่นภาพในกรอบหลุมดำ
      uUp: { value: new THREE.Vector3(0, 1, 0) },
      uHalf: { value: def.ext },                         // ครึ่งความกว้างของแผ่นภาพ (หน่วย M)
      uRin: { value: isco }, uRout: { value: def.rout != null ? def.rout : 18 },
      uSteps: { value: 170 }, uOrb: { value: 0 }, uFlick: { value: 0 },
      uExpo: { value: 3.2 }, uStars: { value: def.acc ? 0.55 : 1.1 }, uStarSc: { value: 400 },
      uJet: { value: def.jet || 0 }
    },
    vertexShader: `varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `precision highp float;
      uniform float uA, uHalf, uRin, uRout, uSteps, uOrb, uFlick, uExpo, uStars, uStarSc, uJet;
      uniform vec3 uCam, uRight, uUp;
      varying vec2 vUv;
      #define MAXSTEP 200
      #define JBETA 0.95                      // ความเร็วพลาสมาในลำ (เท่าความเร็วแสง)
      #define JGAM 3.2026                     // แฟกเตอร์ลอเรนซ์ที่ความเร็วนั้น

      float hash31(vec3 p){
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }
      float hash21(vec2 p){
        vec3 q = fract(vec3(p.x, p.y, p.x) * 0.1031);
        q += dot(q, q.yzx + 33.33);
        return fract((q.x + q.y) * q.z);
      }
      float vnoise(vec2 p){
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
                   mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      /* พิกัด Boyer–Lindquist → คาร์ทีเซียน (ทรงรีแบน) */
      vec3 blCart(float r, float th, float ph, float a){
        float sr = sqrt(r * r + a * a), s = sin(th);
        return vec3(sr * s * cos(ph), sr * s * sin(ph), r * cos(th));
      }
/* สีของวัตถุดำโดยประมาณ: t = 0 แดงเข้ม · 0.5 ส้ม · 1 ขาว · เกิน 1 ออกฟ้า
         ขอบนอกจานเย็นกว่ามาก ต้องมีปลายแดงเข้มด้วย ไม่งั้นทั้งจานเป็นส้มโทนเดียว */
      vec3 bbCol(float t){
        t = clamp(t, 0.0, 1.7);
        vec3 c = mix(vec3(0.60, 0.09, 0.02), vec3(1.0, 0.33, 0.05), smoothstep(0.0, 0.24, t));
        c = mix(c, vec3(1.0, 0.62, 0.18), smoothstep(0.20, 0.50, t));
        c = mix(c, vec3(1.0, 0.90, 0.70), smoothstep(0.46, 0.86, t));
        return mix(c, vec3(0.80, 0.89, 1.0), smoothstep(0.90, 1.45, t));
      }
      /* ดาวฉากหลังแบบสุ่มตามทิศทาง — ใช้เฉพาะบริเวณที่แสงถูกดัดแรง ๆ จึงไม่ซ้อนกับดาวจริงในฉาก */
      float starField(vec3 d, float sc){
        float acc = 0.0;
        vec3 p = d * sc, ip = floor(p), fp = p - ip;
        float h = hash31(ip);
        if (h > 0.88) {
          vec3 c = vec3(hash31(ip + 11.3), hash31(ip + 27.7), hash31(ip + 41.1)) * 0.5 + 0.25;
          acc += smoothstep(0.14, 0.0, length(fp - c)) * (0.25 + fract(h * 91.0));
        }
        p = d * sc * 2.3; ip = floor(p); fp = p - ip;
        h = hash31(ip + 5.0);
        if (h > 0.93) {
          vec3 c = vec3(hash31(ip + 3.1), hash31(ip + 7.7), hash31(ip + 13.1)) * 0.5 + 0.25;
          acc += smoothstep(0.10, 0.0, length(fp - c)) * (0.2 + fract(h * 57.0)) * 0.7;
        }
        return acc;
      }
      /* ลายก๊าซบนจาน: ป้อนมุมที่หมุนไปแล้วเข้ามา จึงหมุนลายได้โดยไม่มีรอยต่อที่ φ = 0
         (สุ่มบนวงกลมหนึ่งหน่วย เลขคลื่นเชิงมุมโตตามรัศมี ให้วงนอกมีลายละเอียดขึ้น) */
      float diskTurb(float rd, float ph, float flick){
        // ความถี่เชิงมุมต่ำ (1.35 รอบต่อการวนหนึ่งรอบ) แต่ตามรัศมีสูง (1.8 ต่อหนึ่ง M)
        // ลายจึงยืดยาวไปตามทางที่ก๊าซวิ่ง แทนที่จะแตกเป็นก้อนกลม ๆ กระจายเต็มจาน
        vec2 b = vec2(cos(ph), sin(ph)) * 1.35 + vec2(rd * 1.8, flick * 0.03);
        float v = 0.0, amp = 0.5, sc = 1.0;
        for (int i = 0; i < 4; i++) { v += amp * vnoise(b * sc); sc *= 2.5; amp *= 0.62; }
        return v * 0.892;                                   // ผลรวมแอมพลิจูด 1.121 → ปรับกลับเป็น 0..1
      }
      /* ACES filmic tone mapping (สูตรย่อของ Narkowicz) — ไฮไลต์ม้วนเข้าหาขาวอย่างนุ่ม
         ไม่แบนเป็นแผ่นขาวเหมือน 1 − exp(−x) จึงยังเห็นลายในส่วนที่สว่างจัด */
      vec3 aces(vec3 x){
        return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
      }
      /* อนุพันธ์ของเส้นจีโอเดสิกไร้มวลในเมตริกเคอร์ (M = 1, E = 1, L = p_φ คงที่)
         ได้จาก dx/dλ = ∂H/∂p, dp/dλ = −∂H/∂x กับ H = F/(2Σ)
         รูปแบบนี้ผ่านจุดกลับตัวได้เองโดยไม่ต้องคอยสลับเครื่องหมายรากอย่างสมการของคาร์เตอร์ */
      void deriv(float a, float a2, float L, float L2, float r, float th, float pr, float pth,
                 out float dr, out float dth, out float dph, out float dpr, out float dpth){
        float s = sin(th), c = cos(th);
        s = (s < 0.0 ? -1.0 : 1.0) * max(abs(s), 3e-3);      // กันหารศูนย์บนแกนหมุน
        float r2 = r * r;
        float Sig = r2 + a2 * c * c;
        float Del = max(r2 - 2.0 * r + a2, 1e-3);             // การเดินหยุดก่อนถึงขอบฟ้าอยู่แล้ว
        float iS = 1.0 / s, iSig = 1.0 / Sig, iDel = 1.0 / Del;   // หารสามครั้ง ที่เหลือคูณส่วนกลับ
        float s2 = s * s, iS2 = iS * iS;
        float rr = r2 + a2;
        float das = Del - a2 * s2;
        float N = -(rr * rr - a2 * Del * s2) + 4.0 * a * r * L + das * L2 * iS2;
        float F = Del * pr * pr + pth * pth + N * iDel;
        dr  = Del * pr * iSig;
        dth = pth * iSig;
        dph = (4.0 * a * r + 2.0 * L * das * iS2) * (0.5 * iSig * iDel);
        float Delr = 2.0 * r - 2.0;
        float Nr = -(4.0 * r * rr - a2 * s2 * Delr) + 4.0 * a * L + Delr * L2 * iS2;
        float Pr = (Nr * Del - N * Delr) * iDel * iDel;
        float sc = s * c;
        dpr = -(Delr * pr * pr + Pr) * (0.5 * iSig) + F * r * iSig * iSig;
        float Pth = 2.0 * a2 * sc - 2.0 * L2 * c * iS2 * iS;
        dpth = -Pth * (0.5 * iSig) - F * a2 * sc * iSig * iSig;
      }

      void main(){
        float a = uA, a2 = uA * uA;
        float rh = 1.0 + sqrt(max(1.0 - a2, 0.0));            // ขอบฟ้าเหตุการณ์ของเคอร์

        // จุดบนแผ่นภาพ (คาร์ทีเซียนในกรอบหลุมดำ หน่วย M) → ทิศของรังสีที่เข้ากล้องพิกเซลนี้
        vec3 tgt = uRight * ((vUv.x - 0.5) * 2.0 * uHalf) + uUp * ((vUv.y - 0.5) * 2.0 * uHalf);
        vec3 d0 = normalize(tgt - uCam);

        // รังสีที่เฉียดห่างมากและไม่ตัดระนาบจาน — ไม่ต้องเดินเลย (แผ่นภาพกินพื้นที่จอเยอะตอนเข้าใกล้)
        float bImp = length(cross(uCam, d0));
        float tPl = abs(d0.z) > 1e-6 ? -uCam.z / d0.z : -1.0;
        float rPl = tPl > 0.0 ? length(uCam + d0 * tPl) : 1e9;
        if (bImp > uRout + 6.0 && rPl > uRout + 2.0) { gl_FragColor = vec4(0.0); return; }

        // กล้อง → พิกัด Boyer–Lindquist
        float R2 = dot(uCam, uCam), dd = R2 - a2;
        float r0 = sqrt(max(0.5 * (dd + sqrt(dd * dd + 4.0 * a2 * uCam.z * uCam.z)), 1e-4));
        float th0 = acos(clamp(uCam.z / r0, -1.0, 1.0));
        float ph0 = atan(uCam.y, uCam.x);
        float s0 = sin(th0), c0 = cos(th0), sr0 = sqrt(r0 * r0 + a2);

        // ฐานตั้งฉากท้องถิ่น แล้วแตกทิศของรังสีลงบนฐานนั้น
        vec3 er = normalize(vec3(r0 * s0 * cos(ph0) / sr0, r0 * s0 * sin(ph0) / sr0, c0));
        vec3 eth = normalize(vec3(sr0 * c0 * cos(ph0), sr0 * c0 * sin(ph0), -r0 * s0));
        vec3 eph = vec3(-sin(ph0), cos(ph0), 0.0);
        float nr = dot(d0, er), nt = dot(d0, eth), np = dot(d0, eph);

        // โมเมนตัมเริ่มต้นผ่านผู้สังเกตแบบ ZAMO (กรอบที่ไม่หมุนเทียบท้องถิ่น) แล้วปรับให้ E = 1
        float Sig0 = r0 * r0 + a2 * c0 * c0;
        float Del0 = max(r0 * r0 - 2.0 * r0 + a2, 1e-4);
        float A0 = (r0 * r0 + a2) * (r0 * r0 + a2) - a2 * Del0 * s0 * s0;
        float om0 = 2.0 * a * r0 / A0;
        float al0 = sqrt(max(Sig0 * Del0 / A0, 1e-9));
        float L = np * sqrt(A0 / Sig0) * s0;
        float E = al0 + om0 * L;
        L /= E;
        float pr = nr * sqrt(Sig0 / Del0) / E;
        float pth = nt * sqrt(Sig0) / E;
        float Ecam = (1.0 - om0 * L) / al0;                   // พลังงานที่กล้องวัดได้

        float r = r0, th = th0, ph = ph0;
        float rPrev = r, thPrev = th, phPrev = ph, cPrev = cos(th);
        float rEsc = max(uRout * 1.6, 30.0);
        float rpk = 1.3611 * uRin;
        float fpk = max(1.0 - sqrt(uRin / rpk), 1e-6) / (rpk * rpk * rpk);
        vec3 col = vec3(0.0);
        float trans = 1.0, fate = 0.0;                        // 1 = ตกลงหลุม · 2 = หลุดออกไป

        float L2 = L * L;
        float camZn = uCam.z / max(length(uCam), 1e-6);      // cos ของมุมระหว่างแกนหมุนกับแนวสายตา
        for (int i = 0; i < MAXSTEP; i++) {
          if (float(i) >= uSteps) break;
          float k1r, k1t, k1p, k1a, k1b;
          deriv(a, a2, L, L2, r, th, pr, pth, k1r, k1t, k1p, k1a, k1b);

          // ก้าวยาวปรับเอง: จำกัดทั้งมุมที่กวาดต่อก้าวและสัดส่วนที่รัศมีเปลี่ยน
          // ใกล้ขอบฟ้า การลากกรอบอวกาศดัน dφ/dλ ขึ้นเป็นอนันต์ ซึ่งเป็นภาวะเอกฐานของพิกัด
          // Boyer–Lindquist ไม่ใช่ฟิสิกส์ · รังสีที่ถึงตรงนั้นถูกกลืนแน่แล้ว φ ไม่มีผลต่อภาพ
          // ถ้าไม่ผ่อนตัวจำกัดมุมลง ก้าวจะถูกบีบเหลือ 4e-4 แล้วคลานอยู่เหนือขอบฟ้าจนงบหมด
          float wd = smoothstep(rh + 0.02, rh + 0.9, r);
          float h = min(0.060 / max(abs(k1t) + abs(k1p) * wd, 1e-9), 0.30 * r / max(abs(k1r), 1e-9));
          h = min(h, 0.30 * (r - rh) + 0.006);
          // ลำอนุภาคเป็นก๊าซโปร่งแสง ต้องมีจุดตัวอย่างตกในลำจริง ๆ ถึงจะเห็น
          // ถ้าปล่อยให้ก้าวยาวตามปกติ รังสีจะกระโดดข้ามทั้งลำไปเลย จึงบีบก้าวเฉพาะย่านที่ลำอยู่
          if (uJet > 0.0 && r < 24.0) h = min(h, 1.0);
          h = min(h, 50.0);

          // สะสมผลถ่วงน้ำหนักไปทีละขั้น แล้วนำ k ชุดเก่ามาใช้ซ้ำ — k ที่ต้องอยู่พร้อมกันจึงเหลือสองชุด
          float sr = k1r, st = k1t, sp = k1p, sa = k1a, sb = k1b;
          float hh = 0.5 * h;
          float k2r, k2t, k2p, k2a, k2b;
          deriv(a, a2, L, L2, r + hh * k1r, th + hh * k1t, pr + hh * k1a, pth + hh * k1b, k2r, k2t, k2p, k2a, k2b);
          sr += 2.0 * k2r; st += 2.0 * k2t; sp += 2.0 * k2p; sa += 2.0 * k2a; sb += 2.0 * k2b;
          deriv(a, a2, L, L2, r + hh * k2r, th + hh * k2t, pr + hh * k2a, pth + hh * k2b, k1r, k1t, k1p, k1a, k1b);
          sr += 2.0 * k1r; st += 2.0 * k1t; sp += 2.0 * k1p; sa += 2.0 * k1a; sb += 2.0 * k1b;
          deriv(a, a2, L, L2, r + h * k1r, th + h * k1t, pr + h * k1a, pth + h * k1b, k2r, k2t, k2p, k2a, k2b);
          sr += k2r; st += k2t; sp += k2p; sa += k2a; sb += k2b;

          rPrev = r; thPrev = th; phPrev = ph; cPrev = cos(th);
          float h6 = h / 6.0;
          r += h6 * sr; th += h6 * st; ph += h6 * sp; pr += h6 * sa; pth += h6 * sb;
          if (!(r > 0.0)) { fate = 1.0; break; }               // ตัวเลขพัง = นับว่าตกลงไป

          // ── ลำอนุภาค: พลาสมาพุ่งออกสองข้างตามแกนหมุน · โปร่งแสง จึงบวกสะสมไปตามทาง ไม่บังอะไร
          if (uJet > 0.0) {
            float zj = r * cos(th), az = abs(zj);
            float rho = sqrt(r * r + a2) * abs(sin(th));
            if (az > 2.0 && az < 22.0 && rho < 13.0) {        // คัดออกเร็ว ๆ ก่อน จะได้ไม่เสียแรงกับรังสีแถวศูนย์สูตร
              float w = 0.80 * pow(az, 0.58);                 // ฐานเป็นพาราโบลาตามที่ VLBI วัดของ M87 ได้
              // ผนังลำบาง ๆ และปล่อยให้เกาส์เซียนจางเองจนสุด — ถ้าตัดด้วยขอบเขตทรงกระบอก ลำจะกลายเป็นแท่งขอบตรง
              float shell = exp(-pow((rho / max(w, 0.05) - 0.80) / 0.26, 2.0));
              // ลายพลาสมาในลำ ไม่ให้เป็นกรวยเรียบ ๆ · ไล่จางแบบเลขชี้กำลัง ปลายลำจึงไม่มีรอยตัด
              float jn = 0.45 + 0.95 * vnoise(vec2(cos(ph), sin(ph)) * 1.2 + vec2(az * 0.85 - uOrb * 0.01, 0.0));
              float dens = shell * jn * smoothstep(2.0, 4.5, az) * exp(-az * 0.20);
              if (dens > 0.002) {
                // บีบลำแสงเชิงสัมพัทธภาพ: ด้านที่พุ่งเข้าหาเราสว่างกว่าด้านไกลหลายหมื่นเท่า
                float dop = 1.0 / (JGAM * (1.0 - JBETA * sign(zj) * camZn));
                col += trans * dens * dop * dop * dop * h * uJet * vec3(0.45, 0.66, 1.0);
              }
            }
          }

          // ตัดผ่านระนาบศูนย์สูตร = ชนจานพอกพูนมวล (จานบาง ทึบแสง)
          float cNow = cos(th);
          if (cPrev * cNow < 0.0) {
            float f = cPrev / (cPrev - cNow);
            float rd = mix(rPrev, r, f);
            if (rd > uRin && rd < uRout) {
              float phd = mix(phPrev, ph, f);
              // ความส่องสว่างตามแบบจานบางของ Novikov–Thorne อย่างง่าย F ∝ (1 − √(r_in/r)) / r³
              float em = (max(1.0 - sqrt(uRin / rd), 0.0) / (rd * rd * rd)) / fpk;
              // ลายก๊าซหมุนตามคาบเคปเลอร์ของแต่ละรัศมี (uOrb = เวลาจำลองในหน่วย t_g)
              // วงในหมุนเร็วกว่าวงนอกมาก ใช้เฟสเดียวลายจะถูกเฉือนจนยืดเป็นวงเรียบไปเรื่อย ๆ
              // จึงคิดสองรอบเวลาที่เหลื่อมกันแล้วค่อย ๆ สลับ ลายจึงสดใหม่ตลอดและต่อเนื่องตอนวนรอบ
              float om = 1.0 / (pow(rd, 1.5) + a);
              float cyc = 60.0;
              float tc = mod(uOrb, cyc), bl = tc / cyc;
              float turb = mix(diskTurb(rd, phd - (tc + cyc) * om, uFlick),
                               diskTurb(rd, phd - tc * om, uFlick), bl);
              // g = พลังงานที่กล้องวัด ÷ พลังงานที่จุดกำเนิดวัด (วงโคจรวงกลมในระนาบศูนย์สูตร)
              float Om = 1.0 / (pow(rd, 1.5) + a);
              float gtt = -(1.0 - 2.0 / rd), gtp = -2.0 * a / rd, gpp = rd * rd + a2 + 2.0 * a2 / rd;
              float ut = inversesqrt(max(-(gtt + 2.0 * Om * gtp + Om * Om * gpp), 1e-6));
              float g = Ecam / max(ut * (1.0 - Om * L), 1e-4);
              float g2 = g * g;
              float op = smoothstep(uRin, uRin + 0.35, rd) * (1.0 - smoothstep(uRout * 0.76, uRout, rd));
              // ยกกำลังบีบค่ากลาง ๆ ลง เหลือแต่สันสว่างเป็นริ้ว — ต่างจากคูณตรง ๆ ที่ได้หมอกเรียบ
              float fil = pow(clamp(turb * 1.25, 0.0, 1.0), 2.2);
              col += trans * op * em * g2 * g2 * (0.25 + 1.7 * fil) * bbCol(pow(em, 0.25) * g);
              // ร่องมืดโปร่งแสงบ้าง เห็นชั้นที่อยู่หลังลาง ๆ จานจึงดูเป็นก๊าซ ไม่ใช่แผ่นทึบ
              trans *= 1.0 - op * (0.62 + 0.36 * fil);
              if (trans < 0.02) { fate = 3.0; break; }
            }
          }
          if (r < rh + 0.035) { fate = 1.0; break; }
          if (r > rEsc && pr > 0.0) { fate = 2.0; break; }
        }

        // หลุดออกไป: ดาวฉากหลังที่ถูกเลนส์ดัด · ตกลงไปหรือเดินไม่จบ: ดำสนิท (บังฉากหลัง)
        // เดินจนหมดงบ: ถ้ากำลังวิ่งออกและพ้นจานไปแล้ว ยังไงก็หลุด อย่าเหมาว่าถูกกลืน
        if (fate == 0.0 && pr > 0.0 && r > uRout) fate = 2.0;
        if (fate == 2.0) {
          if (trans > 0.01 && uStars > 0.0) {
            vec3 dEsc = normalize(blCart(r, th, ph, a) - blCart(rPrev, thPrev, phPrev, a));
            float amt = uStars * smoothstep(0.01, 0.12, 1.0 - dot(dEsc, d0));
            if (amt > 0.002) col += trans * amt * starField(dEsc, uStarSc) * vec3(0.95, 0.97, 1.0);
          }
        } else {
          trans = 0.0;                                        // ตกลงหลุม · จานบังหมด · เดินไม่จบ = ทึบ
        }

        float alpha = 1.0 - trans;
        float edge = 1.0 - smoothstep(0.44, 0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
        gl_FragColor = vec4(aces(col * uExpo) * edge, alpha * edge);
      }`,
    transparent: true, premultipliedAlpha: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide
  });
}

/* ── แบบจำลอง 3 มิติของ Vela Pulsar (ถอดแบบจากโมเดลฟิสิกส์ 3 มิติ) ────────── */
let _velaSpriteTex = null;
function velaSpriteTexture() {
  if (!_velaSpriteTex) {
    _velaSpriteTex = new THREE.CanvasTexture(glowTexture([
      [0, 'rgba(255,255,255,1)'],
      [0.25, 'rgba(255,255,255,0.6)'],
      [0.55, 'rgba(255,255,255,0.18)'],
      [1, 'rgba(255,255,255,0)']
    ], 128));
  }
  return _velaSpriteTex;
}

function buildVelaPulsar3D(def) {
  const root = new THREE.Group();
  // สเกลอิงตามความกว้าง def.span (8 ปีแสง) โดยในพิกัดจำลอง 80 หน่วยเทียบเท่า def.span
  root.scale.setScalar(def.span / 80);

  const spriteTex = velaSpriteTexture();

  // 1) แกนกลาง: ดาวนิวตรอน + ฮาโลเรืองแสง 2 ชั้น
  const core = new THREE.Group();
  const coreMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  core.add(coreMesh);

  const haloA = new THREE.Sprite(new THREE.SpriteMaterial({
    map: spriteTex, color: 0xbfe9ff,
    transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  haloA.scale.set(7, 7, 1);
  core.add(haloA);

  const haloB = new THREE.Sprite(new THREE.SpriteMaterial({
    map: spriteTex, color: 0x6fd0ff,
    transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  haloB.scale.set(18, 18, 1);
  core.add(haloB);
  root.add(core);

  // 2) เส้นสนามแม่เหล็กไดโพล (Magnetic dipole field lines: r = L·sin²θ)
  const fieldGroup = new THREE.Group();
  fieldGroup.rotation.set(-18 * DEG, 0, -30 * DEG);
  [2.2, 3.4, 4.8, 6.4, 8.2, 10.2].forEach((L, li) => {
    const pts = [];
    for (let d = 3; d <= 177; d += 2) {
      const th = d * DEG, r = L * Math.sin(th) ** 2;
      if (r < 0.6) continue;
      pts.push(new THREE.Vector3(r * Math.sin(th), r * Math.cos(th), 0));
    }
    if (pts.length < 2) return;
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const copies = 8 + li * 2;
    for (let k = 0; k < copies; k++) {
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: 0xe8f2ff, transparent: true, opacity: 0.16 + (k % 3) * 0.08,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      line.rotation.y = k * (Math.PI * 2 / copies) + li * 0.21;
      fieldGroup.add(line);
    }
  });
  root.add(fieldGroup);

  // 3) แกนหมุนพัลซาร์ + ลำแสงเจ็ตเชิงสัมพัทธภาพเอียง 35° พร้อมกรวยกวาด
  const spinAxis = new THREE.Group();
  spinAxis.rotation.set(10 * DEG, 0, -14 * DEG);

  const magTilt = new THREE.Group();
  magTilt.rotation.z = (def.jetAngle || 35) * DEG;
  spinAxis.add(magTilt);

  const BEAM_LEN = 180;
  function makeBeam(s) {
    const g = new THREE.Group();
    const cMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, BEAM_LEN, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xeafffb, transparent: true, opacity: 1 * s,
        blending: THREE.AdditiveBlending, depthWrite: false })
    );
    const gMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, BEAM_LEN, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x21e6c8, transparent: true, opacity: 0.34 * s,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    const hMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, BEAM_LEN, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x12c9b4, transparent: true, opacity: 0.10 * s,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    g.add(cMesh, gMesh, hMesh);
    g.userData.core = cMesh;
    return g;
  }

  const beamMain = makeBeam(1);
  magTilt.add(beamMain);

  // 5 ghost trailing beams สำหรับแสดงความต่อเนื่องของลำแสงหมุนเร็ว
  const GHOSTS = 5, ghosts = [], ghostGroup = new THREE.Group();
  spinAxis.add(ghostGroup);
  for (let i = 1; i <= GHOSTS; i++) {
    const lag = new THREE.Group();
    const tilt = new THREE.Group();
    tilt.rotation.z = (def.jetAngle || 35) * DEG;
    tilt.add(makeBeam(0.42 * (1 - i / (GHOSTS + 1))));
    lag.add(tilt);
    ghostGroup.add(lag);
    ghosts.push(lag);
  }

  // กรวยกวาดลำแสง (Sweep cones)
  const sweepCone = new THREE.Group();
  spinAxis.add(sweepCone);
  [1, -1].forEach(s => {
    const h = 80, R = h * Math.tan((def.jetAngle || 35) * DEG);
    const c = new THREE.Mesh(
      new THREE.ConeGeometry(R, h, 48, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x16d9bd, transparent: true, opacity: 0.035,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    c.position.y = s * h / 2;
    c.rotation.z = s > 0 ? 0 : Math.PI;
    sweepCone.add(c);
  });
  sweepCone.visible = false;
  root.add(spinAxis);

  // สไปรต์วาบแสงของลำแสง (Flash flare)
  const beamFlare = new THREE.Sprite(new THREE.SpriteMaterial({
    map: spriteTex, color: 0x9bfff0,
    transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  beamFlare.scale.set(9, 9, 1);
  core.add(beamFlare);

  // 4) วงแหวนคู่รังสีเอกซ์ (Vela X-ray Arcs)
  const arcGroup = new THREE.Group();
  arcGroup.rotation.set(10 * DEG, 0, -14 * DEG);
  [[4.2, 2.2], [6.6, 3.6]].forEach(([R, y]) => {
    const t = new THREE.Mesh(
      new THREE.TorusGeometry(R, 0.13, 12, 80),
      new THREE.MeshBasicMaterial({ color: 0xff7ad1, transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false })
    );
    t.rotation.x = Math.PI / 2; t.position.y = y; arcGroup.add(t);
    const g = new THREE.Mesh(
      new THREE.TorusGeometry(R, 0.45, 10, 60),
      new THREE.MeshBasicMaterial({ color: 0xff4fb0, transparent: true, opacity: 0.18,
        blending: THREE.AdditiveBlending, depthWrite: false })
    );
    g.rotation.x = Math.PI / 2; g.position.y = y; arcGroup.add(g);
  });
  root.add(arcGroup);

  // 5) เจ็ตเกลียว (Helical jets จากการสังเกตการณ์ของกล้องจันทรา)
  const helixGroup = new THREE.Group();
  helixGroup.rotation.set(10 * DEG, 0, -14 * DEG);
  function helixJet(len, rad, turns, dir) {
    const pts = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100, a = turns * Math.PI * 2 * t, r = rad * (0.15 + 0.85 * t);
      pts.push(new THREE.Vector3(Math.cos(a) * r, dir * t * len, Math.sin(a) * r));
    }
    return new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.09, 8, false),
      new THREE.MeshBasicMaterial({ color: 0x7fd4ff, transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false })
    );
  }
  const helixA = helixJet(20, 1.9, 2.4, 1);
  const helixB = helixJet(9, 1.2, 1.4, -1);
  helixGroup.add(helixA, helixB);
  root.add(helixGroup);

  // 6) เนบิวลาซากซูเปอร์โนวาสีแดง 3 ชั้น (Supernova remnant particle clouds)
  const nebula = new THREE.Group();
  nebula.rotation.set(6 * DEG, 0, -4 * DEG);
  function buildNebulaLayer(count, rMin, rMax, thick, size, opacity, hueA, hueB) {
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * 3) * (Math.PI * 2 / 3);
      const t = Math.pow(Math.random(), 0.65);
      const r = rMin + (rMax - rMin) * t;
      const a = arm + t * 3.1 + (Math.random() - 0.5) * 1.15;
      const puff = (Math.random() - 0.5) * thick * (0.35 + t);
      pos[i * 3]     = Math.cos(a) * r + (Math.random() - 0.5) * 2.2;
      pos[i * 3 + 1] = puff + (Math.random() - 0.5) * 1.1;
      pos[i * 3 + 2] = Math.sin(a) * r * 0.92 + (Math.random() - 0.5) * 2.2;
      c.setHSL(hueA + Math.random() * (hueB - hueA), 0.95, 0.18 + Math.random() * 0.36);
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      size, map: spriteTex, vertexColors: true, transparent: true, opacity,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
  }
  nebula.add(buildNebulaLayer(5000, 4.5, 19, 5.0, 2.5, 0.55, 0.985, 1.02));
  nebula.add(buildNebulaLayer(3500, 9.0, 26, 7.5, 4.5, 0.30, 0.965, 1.00));
  nebula.add(buildNebulaLayer(1500, 15.0, 34, 9.0, 7.0, 0.14, 0.955, 0.995));

  // 14 เส้นใยฟิลาเมนต์เรืองแสง (Glowing filaments)
  const filaments = new THREE.Group();
  nebula.add(filaments);
  for (let k = 0; k < 14; k++) {
    const R0 = 5 + Math.random() * 13, turns = 0.9 + Math.random() * 1.5;
    const off = Math.random() * Math.PI * 2, lift = (Math.random() - 0.5) * 4.5;
    const pts = [];
    for (let i = 0; i <= 50; i++) {
      const t = i / 50, a = off + turns * Math.PI * 2 * t, r = R0 + t * 7.5;
      pts.push(new THREE.Vector3(
        Math.cos(a) * r,
        lift * Math.sin(t * Math.PI) + (Math.random() - 0.5) * 0.4,
        Math.sin(a) * r * 0.92
      ));
    }
    filaments.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 70, 0.085 + Math.random() * 0.06, 6, false),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.99, 0.95, 0.55),
        transparent: true, opacity: 0.52, blending: THREE.AdditiveBlending, depthWrite: false
      })
    ));
  }
  root.add(nebula);

  return {
    root, core, haloA, haloB, fieldGroup, spinAxis, magTilt, beamMain,
    beamCore: beamMain.userData.core, beamFlare, ghosts, ghostGroup,
    sweepCone, arcGroup, helixGroup, helixA, helixB, nebula, filaments,
    def
  };
}

function makeFar(def) {
  const holder = new THREE.Group();
  const spin = new THREE.Group();
  holder.add(spin);
  let mesh;
  if (def.t === 'bh') {
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), def.kerr ? kerrBlackHoleMaterial(def) : blackHoleMaterial(def));
    if (def.kerr) mesh.layers.set(BH_LAYER);          // ย้ายออกจากฉากหลัก ไปวาดในเป้าหมายย่อแทน
  } else {
    // แสงฟุ้งรอบซาก · ระหว่างรอโมเดลของ NASA ก็เป็นตัวแทนไปก่อน
    mesh = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(glowTexture(def.id === 'crab'
        ? [[0, 'rgba(210,232,255,.85)'], [0.3, 'rgba(140,190,255,.35)'], [0.7, 'rgba(110,160,240,.08)'], [1, 'rgba(90,140,220,0)']]
        : [[0, 'rgba(255,220,200,.7)'], [0.3, 'rgba(255,160,130,.3)'], [0.7, 'rgba(220,120,110,.06)'], [1, 'rgba(200,100,100,0)']], 128)),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
  }
  mesh.scale.setScalar(def.span);
  mesh.renderOrder = 20;
  mesh.frustumCulled = false;
  spin.add(mesh);
  scene.add(holder);
  const rec = {
    def, isMoon: false, far: true, holder, spin, mesh,
    R: def.radius / KMU, world: { x: def._world.x, y: def._world.y, z: def._world.z }, parent: null,
    axis: new THREE.Vector3(0, 0, 1)
  };
  if (def.id === 'sn1987a') {
    // วงแหวนเอียง 42.85° จากแนวสายตา แกนยาวห่างทิศตะวันตก 6.24° (ภาพกล้องฮับเบิล 1994–2022) — จากโลกจึงเห็นเป็นวงรีแบบในภาพถ่าย
    rec.fixedQuat = discQuat({ x: def._world.x, y: def._world.y, z: def._world.z, pa: 83.76, ar: Math.cos(42.85 * DEG) }, celNorth());
  } else if (def.t !== 'bh') {
    rec.fixedQuat = skyQuat(def._world);
  }
  if (def.id === 'vela' || def.t === 'pulsar') {
    rec.vela = buildVelaPulsar3D(def);
    spin.add(rec.vela.root);
    mesh.visible = false;
  } else if (def.t !== 'bh') {
    // ตัวแทนที่ซ่อนไว้: ให้วัสดุของโมเดลถูกคอมไพล์ตั้งแต่หน้าโหลด โมเดลมาถึงระหว่างบินจะได้ไม่สะดุด
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(9), 3));
    const M = nebulaMats();
    for (const m of def.id === 'crab' ? [M.rim] : [M.flatRed]) {
      const d = new THREE.Mesh(g, m);
      d.visible = false;
      holder.add(d);
    }
  }
  return rec;
}


/* ภาพวงกลมเล็กในแผงข้อมูล */
function farDisc(def, size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d'), m = size / 2;
  if (def.t === 'bh') {
    const gr = g.createRadialGradient(m, m, size * 0.12, m, m, m);
    gr.addColorStop(0, '#000'); gr.addColorStop(0.28, '#000');
    gr.addColorStop(0.34, 'rgba(255,214,150,1)'); gr.addColorStop(0.5, 'rgba(255,140,50,.55)'); gr.addColorStop(1, 'rgba(255,120,40,0)');
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
  } else if (def.id === 'vela' || def.t === 'pulsar') {
    const gr = g.createRadialGradient(m, m, 0, m, m, m);
    gr.addColorStop(0, '#ffffff');
    gr.addColorStop(0.18, 'rgba(126,240,216,1)');
    gr.addColorStop(0.42, 'rgba(33,230,200,0.7)');
    gr.addColorStop(0.70, 'rgba(255,80,120,0.3)');
    gr.addColorStop(1, 'rgba(255,60,100,0)');
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
  } else {
    const gr = g.createRadialGradient(m, m, 0, m, m, m);
    gr.addColorStop(0, 'rgba(230,240,255,1)'); gr.addColorStop(0.35, 'rgba(120,180,255,.65)'); gr.addColorStop(1, 'rgba(80,120,220,0)');
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
  }
  return c;
}

function farShown(rec) {
  // หลุมดำและพัลซาร์ที่คำนวณโครงสร้างจริงไม่ถูกขยายเป็นเครื่องหมายขนาดคงที่อีกแล้ว
  // มองจากไกลจึงต้องไม่เห็นตัวมัน แม้จะกำลังเพ่งอยู่ก็ตาม (ของจริงเล็กเกินกว่าจะเห็นจากระยะนั้นมาก)
  // ปล่อยให้ป้ายชื่อกับวงกลมบอกตำแหน่ง (labelRing) ทำหน้าที่แทน แล้วค่อยโผล่เมื่อเข้าใกล้จริง ๆ
  if (rec.def.id === (trans.on ? trans.to : S.focus) && !rec.def.kerr && rec.def.t !== 'pulsar') return true;
  // ใกล้พอให้ขนาดจริงบนจอเกินราว 2–3 พิกเซล (ไม่เกิน 400 เท่าของขนาด · span เป็นเมตร)
  eyeWorld(_eye);
  return Math.hypot(rec.world.x - _eye.x, rec.world.y - _eye.y, rec.world.z - _eye.z) < rec.def.span * 0.4;
}

function farPose(rec) {
  const def = rec.def;
  const camDist = Math.max(1e-12, rec.holder.position.distanceTo(camera.position));
  const fovK = innerHeight / (2 * Math.tan(camera.fov * DEG / 2));
  // ขนาดจริงเมื่อเข้าใกล้ · จากไกลขยายให้เห็นเป็นเครื่องหมาย (หน่วยของ spin: 1 เมตร = 1e-6 หน่วยฉาก)
  rec.spin.scale.setScalar(Math.max(1e-6, farMinPx(def) * camDist / (fovK * def.span)));
  if (def.t === 'bh') {
    rec.spin.quaternion.copy(camera.quaternion);
    const u = rec.mesh.material.uniforms;
    if (def.kerr) {
      // เชเดอร์คิดในหน่วย M = GM/c² (ครึ่งหนึ่งของรัศมีชวาร์สชิลด์) — แผ่นภาพกว้าง 2·uHalf M เสมอ
      const spm = 0.5 * def.span * rec.spin.scale.x / u.uHalf.value;   // หน่วยฉากต่อ 1 M
      _bhV.copy(camera.position).sub(rec.holder.position).divideScalar(spm);
      const ax = def._ax, ay = def._ay, az = def._axis;
      u.uCam.value.set(_bhV.dot(ax), _bhV.dot(ay), _bhV.dot(az));
      _bhR.set(1, 0, 0).applyQuaternion(camera.quaternion);
      _bhU.set(0, 1, 0).applyQuaternion(camera.quaternion);
      u.uRight.value.set(_bhR.dot(ax), _bhR.dot(ay), _bhR.dot(az));
      u.uUp.value.set(_bhU.dot(ax), _bhU.dot(ay), _bhU.dot(az));
      // ดาวฉากหลังต้องละเอียดขึ้นตามกำลังขยาย (ตอนอยู่ไกล ภาพถูกขยายเหมือนมองผ่านกล้องโทรทรรศน์)
      u.uStarSc.value = Math.min(3000, Math.max(26, 26 * _bhV.length() / u.uHalf.value));
      // ลายจานหมุนตามเวลาจำลองจริง หน่วย t_g = GM/c³ (M87* ราว 8.9 ชั่วโมงต่อหนึ่งหน่วย)
      // เวลาจำลองเดินเร็วจนก๊าซหมุนเห็นได้ = ภาพเปลี่ยนทุกเฟรม ซึ่งการ์ดจอวาดเต็มความละเอียดไม่ทัน
      // ถ้าปล่อยตามนั้น ระบบจะถือว่าภาพไม่เคยนิ่ง แล้วค้างที่คุณภาพต่ำสุดตลอด = เบลอไม่หาย
      // จึง "ตรึงลายจานไว้" จนกว่าจะวาดเสร็จคมแล้ว ค่อยขยับไปขั้นถัดไป
      // ผลคือก๊าซหมุนเป็นจังหวะ (ราว 2–3 ครั้ง/วินาที) แต่ทุกจังหวะเป็นภาพคมเต็มที่
      // และเว้นอย่างน้อยหกเฟรมให้หน้าจอตอบสนองก่อนจะวาดหนักอีกรอบ
      const rawOrb = (S.time / 1000 / (def.mass * 4.9255e-6)) % 1e5;
      const orbRunning = Math.abs(rawOrb - _bhOrbRaw) > 2e-3;
      _bhOrbRaw = rawOrb;
      if (!bhDirty) _bhOrbWait++;
      if (bhCamStill < 2 || _bhOrbWait > 6) { if (_bhOrb !== rawOrb) bhNeedDraw = true; _bhOrb = rawOrb; _bhOrbWait = 0; }
      u.uOrb.value = _bhOrb;
      u.uFlick.value = performance.now() / 1000;
      u.uSteps.value = bhSteps;
      bhBusy = true;
      glowRec = rec;
      if (def.dly > 2e5) hostSkyPose(rec);      // อยู่นอกทางช้างเผือก → ต้องมีฟ้าของกาแล็กซีแม่ให้
      // มีอะไรเปลี่ยนไปจากเฟรมก่อนไหม — แยกสองอย่าง เพราะคุณภาพที่ทำได้ต่างกันคนละเรื่อง
      //   กล้องขยับ  = ภาพเคลื่อน ตาจับรายละเอียดไม่ทัน ย่อได้มาก
      //   เวลาเดินเร็วจนก๊าซหมุนเห็นได้ = ภาพเปลี่ยนทุกเฟรม ต้องวาดใหม่ทั้งผืนทุกเฟรม (ซอยเป็นช่องไม่ได้ ภาพจะเหลื่อม)
      //     แต่กล้องนิ่ง ตายังจับรายละเอียดได้ จึงต้องให้คุณภาพสูงกว่าตอนขยับกล้องมาก
      const cv = u.uCam.value, rv = u.uRight.value;
      const camMoved = Math.abs(cv.x - _bhSig[0]) + Math.abs(cv.y - _bhSig[1]) + Math.abs(cv.z - _bhSig[2])
                     + 60 * (Math.abs(rv.x - _bhSig[3]) + Math.abs(rv.y - _bhSig[4]) + Math.abs(rv.z - _bhSig[5]));
      const orbMoved = Math.abs(u.uOrb.value - _bhSig[6]);
      if (camMoved > 1e-3 + cv.length() * 2e-4) {
        _bhSig[0] = cv.x; _bhSig[1] = cv.y; _bhSig[2] = cv.z;
        _bhSig[3] = rv.x; _bhSig[4] = rv.y; _bhSig[5] = rv.z;
        bhCamStill = 0; bhStill = 0; bhNeedDraw = true;
      } else {
        bhCamStill++;
        if (orbMoved > 2e-3) bhStill = 0; else bhStill++;
      }
      _bhSig[6] = u.uOrb.value;
      // แผ่นภาพกินพื้นที่จอกี่พิกเซล → ย่อลงเท่าไรถึงจะอยู่ในงบ (ไกล = ไม่ต้องย่อ · ใกล้จนเต็มจอ = ย่อมาก)
      const wpx = fovK * rec.spin.scale.x * def.span / camDist * renderer.getPixelRatio();
      // ตอนเข้าใกล้ แผ่นภาพใหญ่ล้นจอ ส่วนที่ล้นไม่ได้ถูกวาดจริง จึงไม่ต้องเอามานับเป็นงาน
      const cv2 = renderer.domElement;
      const area = Math.min(wpx * wpx, cv2.width * cv2.height * 1.15);
      // กล้องนิ่งเมื่อไร ให้ไล่ความละเอียดขึ้นได้เต็มที่ ถึงเวลาจำลองจะเดินเร็วจนก๊าซหมุนก็ตาม
      // ส่วนการวาดใหญ่กว่าจอ (ซอยเป็นช่อง) ทำได้เฉพาะตอนภาพนิ่งสนิท ไม่งั้นช่องจะเหลื่อมกัน
      const budget = bhCamStill > 3 ? BH_STILL : BH_MOVE;
      // วาดใหญ่กว่าจอ (ซอยเป็นช่องหลายเฟรม) ทำได้เฉพาะตอนเวลาหยุดจริง ๆ
      // ถ้าลายจานยังขยับ ช่องแต่ละช่องจะเป็นคนละจังหวะเวลา ภาพจะเหลื่อมเป็นตาราง
      const want = Math.min(!orbRunning && bhStill > 3 ? BH_SS : 1,
                            Math.max(0.18, Math.sqrt(budget * bhBias / Math.max(1, area))));
      if (want < bhScale && bhCamStill < 2) bhScale = want;     // ลดทันทีเฉพาะตอนกล้องขยับ ไม่งั้นความคมจะวูบวาบ
      else if (want > bhScale) bhScale = Math.min(want, bhScale + 0.06);   // นิ่งแล้ว = ไล่ขึ้นทีละนิด
      bhDirty = bhNeedDraw || bhScale !== bhDrawn;
    } else {
      u.uTime.value = performance.now() / 1000;
    }
  } else if (rec.fixedQuat) {
    rec.spin.quaternion.copy(rec.fixedQuat);
  }
  if (rec.vela) {
    const v = rec.vela;
    const rps = def.freq || 11.2;
    const tSec = performance.now() * 0.001;

    // หมุนแกนพัลซาร์ด้วยความถี่จริง 11.2 รอบ/วินาที (คาบ 89.33 ms)
    v.spinAxis.rotation.y = (tSec * Math.PI * 2 * rps) % (Math.PI * 2);

    // เงาตามหลัง (ghost trails)
    const lag = Math.min(0.35, 0.08 * (rps / 11.2));
    for (let i = 0; i < v.ghosts.length; i++) {
      v.ghosts[i].rotation.y = -(i + 1) * lag;
    }

    // ส่วนโครงสร้างแวดล้อมหมุนช้าๆ
    v.nebula.rotation.y     = (tSec * 0.045) % (Math.PI * 2);
    v.filaments.rotation.y  = (tSec * 0.020) % (Math.PI * 2);
    v.fieldGroup.rotation.y = (tSec * 0.280) % (Math.PI * 2);
    v.arcGroup.rotation.y   = (tSec * 0.050) % (Math.PI * 2);
    v.helixA.rotation.y     = (tSec * 0.250) % (Math.PI * 2);
    v.helixB.rotation.y     = (-tSec * 0.180) % (Math.PI * 2);

    // วาบแสงเมื่อลำแสงเจ็ตกวาดผ่านแนวสายตากล้อง (Lighthouse pulse flash)
    v.beamCore.getWorldQuaternion(_qVela);
    _vVela.set(0, 1, 0).applyQuaternion(_qVela);
    _cVela.copy(camera.position).sub(rec.holder.position).normalize();
    const flash = Math.pow(Math.abs(_vVela.dot(_cVela)), 12);

    const pulse = 0.82 + 0.18 * Math.sin(tSec * 7);
    v.haloA.scale.setScalar(7 * pulse + flash * 6);
    v.haloB.material.opacity = 0.32 + 0.18 * Math.sin(tSec * 3.1) + flash * 0.35;
    v.beamCore.material.opacity = 0.8 + 0.2 * Math.sin(tSec * 9);
    v.beamFlare.material.opacity = 0.35 + flash * 0.85;
    v.beamFlare.scale.setScalar(9 + flash * 14);
  }
}

/* โมเดลของ NASA เป็นไฟล์สำหรับพิมพ์สามมิติ (สีเดียว) — วาดให้เรืองแสงแบบโปร่ง
   เนบิวลาปูมีทิศผิว จึงให้ขอบที่ผิวเอียงหนีสายตาสว่างกว่า เห็นโครงสร้างเป็นชั้น ๆ */
let nebMats = null;
function nebulaMats() {
  if (nebMats) return nebMats;
  nebMats = {
    rim: new THREE.ShaderMaterial({
      uniforms: { uCol: { value: new THREE.Color(0x6fa8ff) } },
      vertexShader: `varying vec3 vN; varying vec3 vV;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = -mv.xyz; vN = normalMatrix * normal; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uCol; varying vec3 vN; varying vec3 vV;
        void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(uCol * (0.03 + 0.2 * f * f), 1.0); }`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, side: THREE.DoubleSide
    }),
    flatBlue: new THREE.MeshBasicMaterial({ color: 0x6fa8ff, transparent: true, opacity: 0.12,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, side: THREE.DoubleSide }),
    flatRed: new THREE.MeshBasicMaterial({ color: 0xff7050, transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, side: THREE.DoubleSide })
  };
  return nebMats;
}

function nebulaLook(model, def) {
  const crab = def.id === 'crab', M = nebulaMats();
  model.traverse(o => {
    if (!o.isMesh) return;
    o.material = crab ? (o.geometry.attributes.normal ? M.rim : M.flatBlue) : M.flatRed;
    o.renderOrder = 21;
    o.frustumCulled = false;
  });
  if (!crab) return null;
  // พัลซาร์ใจกลาง: ดาวนิวตรอนหมุนรอบตัวเอง 30 รอบต่อวินาที เป็นแหล่งพลังงานของทั้งเนบิวลา
  const p = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(glowTexture([[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(215,235,255,.65)'], [1, 'rgba(160,200,255,0)']], 64)),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
  p.scale.setScalar(def.span * 0.03);
  p.renderOrder = 22;
  return p;
}

/* โหลดโมเดลตอนที่กลายเป็นเป้าหมาย (ใช้ตัวโหลด glTF + Draco ชุดเดียวกับยานอวกาศ) */
function requestFarModel(id) {
  const rec = REG[id];
  if (!rec || !rec.def.model || rec.gltfDone) return;
  rec.gltfDone = true;
  ensureGltfLoader().then(loader => {
    if (!loader) { rec.gltfDone = false; return; }
    const file = rec.def.model;
    if (!gltfCache[file]) gltfCache[file] = new Promise((res, rej) => loader.load(file, g => res(g.scene), undefined, rej));
    gltfCache[file].then(sc => {
      const model = fitCraftModel(sc, { span: rec.def.span * (rec.def.modelFrac || 1) }, null);
      const extra = nebulaLook(model, rec.def);
      if (extra) model.add(extra);
      rec.spin.add(model);
      rec.model = model;
      rec.mesh.material.opacity = 0.45;             // แสงฟุ้งเดิมเหลือเป็นเรืองรอบ ๆ
      if ((trans.on ? trans.to : S.focus) === id) renderInfo();
    }).catch(() => { rec.gltfDone = false; });
  });
}

/* ภาพของหลุมดำ/ซากซูเปอร์โนวาที่อยู่บนจอบังป้ายอื่น — จองที่ไว้ก่อนป้ายในกาแล็กซี กลุ่มดาว และชื่อกาแล็กซี */
function reserveFarImages() {
  const W = innerWidth, H = innerHeight;
  const fovK = H / (2 * Math.tan(camera.fov * DEG / 2));
  for (const rec of farRecs) {
    rec.scr = null;
    if (!rec.holder.visible) continue;
    toScene(rec.world, projV);
    const camDist = projV.distanceTo(camera.position);
    projV.project(camera);
    if (projV.z > 1 || projV.z < -1) continue;
    const def = rec.def;
    const wpx = Math.max(farMinPx(def), def.span * 1e-6 / Math.max(1e-12, camDist) * fovK);
    const half = wpx * (def.t === 'bh' ? (def.acc ? 0.43 : 0.3) : def.modelFrac ? def.modelFrac / 2 : 0.5);
    const cx = (projV.x * 0.5 + 0.5) * W, cy = (-projV.y * 0.5 + 0.5) * H;
    if (Math.abs(cx - W / 2) < W && Math.abs(cy - H / 2) < H) labelBoxes.push(cx, cy, Math.min(half, W), Math.min(half, H));
    rec.scr = { off: Math.min(half, H * 0.32) + 12 };
  }
}

/* ป้ายชื่อ: โผล่เมื่อเป็นเป้าหมาย · อยู่ใกล้ · หรือกำลังดูทั้งกาแล็กซี (เฉพาะที่อยู่ในทางช้างเผือกและเมฆแมกเจลแลน)
   จองที่ต่อจากป้ายในกาแล็กซี จะได้ไม่ทับชื่อแขนกังหันกับตำแหน่งดวงอาทิตย์ */
function updateFarLabels() {
  const W = innerWidth, H = innerHeight, focus = trans.on ? trans.to : S.focus;
  const galView = galFade > 0.35 && deepFade < 0.5;
  for (const rec of farRecs) {
    const node = rec.label, def = rec.def, isF = def.id === focus;
    if (!node) continue;
    if (!S.labels || !(isF || rec.holder.visible || (galView && def.dly < 2e5))) { node.hidden = true; continue; }
    toScene(rec.world, projV).project(camera);
    if (projV.z > 1 || projV.z < -1 || Math.abs(projV.x) > 1.1 || Math.abs(projV.y) > 1.1) { node.hidden = true; continue; }
    const off = rec.scr ? rec.scr.off : 11;
    const lx = (projV.x * 0.5 + 0.5) * W, ly = (-projV.y * 0.5 + 0.5) * H - off;
    const w = labelWidth(def.nm[S.lang], 6.6) + 10;
    if (isF) labelBoxes.push(lx, ly, w / 2, 9);
    else if (!claimLabel(lx, ly, w, 18)) { node.hidden = true; continue; }
    node.hidden = false;
    node.style.left = lx.toFixed(1) + 'px';
    node.style.top = ly.toFixed(1) + 'px';
    node.classList.toggle('on', isF);
    rec.labelRing.style.display = rec.holder.visible ? 'none' : '';
  }
}

/* ── แผงข้อมูล ── */
function renderFarInfo(rec) {
  const t = L(), def = rec.def, pane = $('#pane-info');
  pane.innerHTML = '';
  const head = el('div', 'sec');
  const hd = el('div', 'obj-head');
  const sw = el('div', 'obj-swatch');
  sw.style.setProperty('--glow', def.glow);
  const img = el('img');
  img.src = def._discURL; img.alt = '';
  img.style.cssText = 'width:100%;height:100%;display:block';
  sw.appendChild(img);
  const ti = el('div', 'obj-title');
  ti.innerHTML = `<h2></h2><div class="kind"><em></em><span></span></div>`;
  ti.querySelector('h2').textContent = def.nm[S.lang];
  ti.querySelector('.kind em').style.background = def.glow;
  ti.querySelector('.kind span').textContent = t.kind[def.kind];
  hd.append(sw, ti);
  head.appendChild(hd);
  if (def.desc[S.lang]) { const p = el('p', 'desc'); p.textContent = def.desc[S.lang]; head.appendChild(p); }
  pane.appendChild(head);

  eyeWorld(_eye);
  const hereKm = Math.hypot(def._world.x - _eye.x, def._world.y - _eye.y, def._world.z - _eye.z);
  const rows = [[t.stDist, fmtLy(def.dly)], [t.stFromHere, hereKm >= LY ? fmtLy(hereKm / LY) : fmtKm(hereKm)]];
  if (def.t === 'bh') {
    rows.push([t.bhMass, def.mass < 1000 ? `${nf(def.mass, 1)}<u>${t.timesSun}</u>` : fmtSolar(def.mass)]);
    rows.push([t.bhRs, fmtKm(def.rs)]);
    // ขนาดเชิงมุมของเงาเมื่อมองจากโลก = 2 × 2.598 Rs ÷ ระยะ → ไมโครพิลิปดา
    const muas = 2 * 2.598 * def.rs / (def.dly * LY) * 206264.806e6;
    rows.push([t.bhShadow, `${muas >= 1 ? nf(muas, 1) : muas >= 0.001 ? nf(muas, 4) : muas.toExponential(1)}<u>${t.muas}</u>`]);
    rows.push([t.bhAcc, def.acc ? t.bhAccYes : t.bhAccNo]);
  } else if (def.t === 'pulsar') {
    rows.push([t.pulsarPeriod, `${nf(def.period, 2)}<u>ms</u>`]);
    rows.push([t.pulsarFreq, `${nf(def.freq, 1)}<u>rev/s</u>`]);
    rows.push([t.pulsarBField, `${def.bfield}`]);
    rows.push([t.pulsarJetAngle, `${def.jetAngle || 35}°`]);
    rows.push([t.nebSize, `${nf(def.size, 1)}<u>${t.ly}</u>`]);
  } else {
    rows.push([t.nebSize, `${nf(def.size, def.size < 10 ? 1 : 0)}<u>${t.ly}</u>`]);
    rows.push([t.modelSrc, t.modelNasa]);
  }
  rows.push([t.refSrc, escHtml2(def.ref || '')]);
  const sec = el('div', 'sec');
  sec.innerHTML = `<h3>${def.t === 'bh' ? t.secBh : def.t === 'pulsar' ? t.secPulsar : t.secNeb}</h3><dl class="readout">` +
    rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('') + `</dl>`;
  const addNote = (title, text) => {
    const note = el('div', 'note');
    note.innerHTML = '<span></span><p></p>';
    note.querySelector('span').textContent = title;
    note.querySelector('p').textContent = text;
    sec.appendChild(note);
  };
  if (def.t === 'bh') addNote(t.bhNoteTitle, def.kerr ? t.bhNoteKerr : t.bhNote);
  const n = def.dly >= 1e6 ? nf(def.dly / 1e6, 1) + (S.lang === 'th' ? ' ล้าน' : ' million')
                           : nf(def.dly, 0) + (S.lang === 'th' ? ' ' : '');
  addNote(t.galLightTitle, t.galLightNote.replace('{n}', n));
  if (def.t !== 'bh') addNote(t.modelSrc, t['nebNote_' + def.id] || t.nebNote);
  pane.appendChild(sec);
}

/* ── ดาวเคราะห์นอกระบบ ──────────────────────────────────────────────────
   ดาวแม่วาดเป็น "วงแหวนเล็ก" ซ้อนอยู่ในฉากดาวฤกษ์ (พิกัดเดียวกัน หน่วยปีแสง)
   จึงอ่านได้ว่าเป็นเครื่องหมายกำกับว่าดาวดวงนี้มีดาวเคราะห์ ไม่ใช่ดาวอีกดวง
   กดแล้วได้ "แผนผังระบบ" ที่วางดาวเคราะห์บนแกนลอการิทึมพร้อมแถบเขตอาศัยได้
   และแถวเทียบกับระบบสุริยะของเราไว้ข้างล่าง                                 */
let exoPts = null, exoSel = -1;
const exoLabels = [];
const EXO_LABELS = 12;

function exoRingTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(120,240,200,.95)';
  g.lineWidth = 5;
  g.beginPath(); g.arc(32, 32, 20, 0, 6.2832); g.stroke();
  g.strokeStyle = 'rgba(120,240,200,.28)';
  g.lineWidth = 9;
  g.beginPath(); g.arc(32, 32, 20, 0, 6.2832); g.stroke();
  return new THREE.CanvasTexture(c);
}

function buildExo() {
  const pos = new Float32Array(EXO.length * 3);
  for (let i = 0; i < EXO.length; i++) {
    pos[i * 3] = EXO[i].x; pos[i * 3 + 1] = EXO[i].y; pos[i * 3 + 2] = EXO[i].z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  exoPts = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: { map: { value: exoRingTex() }, scale: { value: 1 }, fade: { value: 0 } },
    vertexShader: `uniform float scale;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0);
        gl_PointSize = clamp(scale * 9.0, 5.0, 22.0);
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D map; uniform float fade;
      void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = t * fade; }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  exoPts.frustumCulled = false;
  starScene.add(exoPts);

  for (let i = 0; i < EXO_LABELS; i++) {
    const node = el('button', 'lbl exo');
    node.innerHTML = `<span class="ring"></span><span class="nm"></span>`;
    node.hidden = true;
    node.addEventListener('click', ev => { ev.stopPropagation(); if (node._ei != null) selectExo(node._ei); });
    labelLayer.appendChild(node);
    exoLabels.push(node);
  }
}

function exoName(h) { return h.alt || h.n; }

const _ev = new THREE.Vector3();
function updateExo() {
  const on = S.exo && starFadeR > 0.05;
  if (exoPts) {
    exoPts.visible = on;
    exoPts.material.uniforms.fade.value = starFadeR * 0.9;
    exoPts.material.uniforms.scale.value = Math.min(2, (innerHeight / 900) * (renderer.getPixelRatio() || 1));
  }
  if (!on) { for (const n of exoLabels) n.hidden = true; return; }
  const W = innerWidth, H = innerHeight;
  const cand = [];
  for (let i = 0; i < EXO.length; i++) {
    const h = EXO[i];
    _ev.set(h.x, h.y, h.z).project(starCam);
    if (_ev.z > 1 || Math.abs(_ev.x) > 1 || Math.abs(_ev.y) > 1) continue;
    // เรียงความสำคัญ: ดาวเคราะห์เยอะก่อน แล้วค่อยใกล้ก่อน
    cand.push({ i, k: -h.p.length * 100 + h.d, x: (_ev.x * 0.5 + 0.5) * W, y: (-_ev.y * 0.5 + 0.5) * H });
  }
  cand.sort((a, b) => a.k - b.k);
  if (exoSel >= 0 && !cand.some(c => c.i === exoSel)) {
    const h = EXO[exoSel];
    _ev.set(h.x, h.y, h.z).project(starCam);
    if (_ev.z <= 1) cand.unshift({ i: exoSel, k: -1e9, x: (_ev.x * 0.5 + 0.5) * W, y: (-_ev.y * 0.5 + 0.5) * H });
  }
  let k = 0;
  for (const c of cand) {
    if (k >= EXO_LABELS) break;
    const txt = exoName(EXO[c.i]) + ' · ' + EXO[c.i].p.length;
    if (!claimLabel(c.x, c.y + 13, labelWidth(txt, 5.9), 14)) continue;
    const node = exoLabels[k++];
    node._ei = c.i;
    node.hidden = false;
    node.style.left = c.x.toFixed(1) + 'px';
    node.style.top = (c.y + 13).toFixed(1) + 'px';
    node.querySelector('.nm').textContent = txt;
    node.classList.toggle('on', c.i === exoSel);
    node.style.opacity = String(starFadeR);
  }
  for (; k < EXO_LABELS; k++) exoLabels[k].hidden = true;
}

function pickExo(cx, cy) {
  if (!S.exo || starFadeR < 0.05) return false;
  let best = -1, bestD = 16;
  for (let i = 0; i < EXO.length; i++) {
    const h = EXO[i];
    _ev.set(h.x, h.y, h.z).project(starCam);
    if (_ev.z > 1) continue;
    const x = (_ev.x * 0.5 + 0.5) * innerWidth, y = (-_ev.y * 0.5 + 0.5) * innerHeight;
    const d = Math.hypot(x - cx, y - cy);
    if (d < bestD) { bestD = d; best = i; }
  }
  if (best < 0) return false;
  selectExo(best);
  return true;
}

function selectExo(i) {
  exoSel = i;
  starSel = -1; deepSel = -1;
  syncCrumb();
  renderInfo();
}

function aimAtExo(i) {
  const h = EXO[i];
  const dx = h.x - starEye.x, dy = h.y - starEye.y, dz = h.z - starEye.z;
  const r = Math.hypot(dx, dy, dz) || 1;
  camState.az = Math.atan2(-dy / r, -dx / r);
  camState.el = Math.max(-1.5, Math.min(1.5, Math.asin(-dz / r)));
}

/* กำลังส่องสว่างของดาวแม่ เทียบดวงอาทิตย์ */
function exoLum(h) {
  if (h.lum != null) return Math.pow(10, h.lum);
  if (h.sr != null && h.teff != null) return h.sr * h.sr * Math.pow(h.teff / 5772, 4);
  return null;
}

/* แผนผังระบบ: แกนนอนเป็นลอการิทึมของระยะจากดาวแม่ */
function exoChart(h) {
  const t = L();
  const W = 292, H = 132, pad = 16;
  const As = h.p.map(p => p.a).filter(a => a != null && a > 0);
  const lo = Math.min(0.008, As.length ? Math.min(...As) / 2 : 0.01);
  const hi = Math.max(2.2, As.length ? Math.max(...As) * 1.8 : 3);
  const L0 = Math.log10(lo), L1 = Math.log10(hi);
  const X = a => pad + (Math.log10(Math.max(a, lo)) - L0) / (L1 - L0) * (W - 2 * pad);
  const yStar = 52, ySol = 104;
  let s = `<svg class="exochart" viewBox="0 0 ${W} ${H}" role="img">`;

  // เขตที่น้ำอาจเป็นของเหลวได้
  const lum = exoLum(h);
  if (lum) {
    const hin = 0.95 * Math.sqrt(lum), hout = 1.37 * Math.sqrt(lum);
    if (hout > lo && hin < hi) {
      const x0 = X(Math.max(hin, lo)), x1 = X(Math.min(hout, hi));
      s += `<rect x="${x0.toFixed(1)}" y="${yStar - 22}" width="${Math.max(1.5, x1 - x0).toFixed(1)}" height="44" class="hz"/>`;
      s += `<text x="${((x0 + x1) / 2).toFixed(1)}" y="${yStar - 27}" class="hzt" text-anchor="middle">${t.exoHZ}</text>`;
    }
  }
  // แกนของระบบนี้
  s += `<line x1="${pad}" y1="${yStar}" x2="${W - pad}" y2="${yStar}" class="axis"/>`;
  for (const tick of [0.01, 0.1, 1, 10]) {
    if (tick < lo || tick > hi) continue;
    s += `<line x1="${X(tick).toFixed(1)}" y1="${yStar - 5}" x2="${X(tick).toFixed(1)}" y2="${yStar + 5}" class="axis"/>`;
    s += `<text x="${X(tick).toFixed(1)}" y="${yStar + 16}" class="tick" text-anchor="middle">${tick} AU</text>`;
  }
  s += `<circle cx="${pad - 6}" cy="${yStar}" r="4.5" class="host"/>`;
  for (const p of h.p) {
    if (p.a == null) continue;
    const r = p.re ? Math.max(2.2, Math.min(8.5, 2.3 * Math.pow(p.re, 0.42))) : 3;
    const cls = p.re == null ? 'pl' : p.re < 1.6 ? 'pl rocky' : p.re < 4 ? 'pl mid' : 'pl giant';
    s += `<circle cx="${X(p.a).toFixed(1)}" cy="${yStar}" r="${r.toFixed(1)}" class="${cls}"><title>${p.n}</title></circle>`;
    s += `<text x="${X(p.a).toFixed(1)}" y="${yStar - r - 4}" class="pn" text-anchor="middle">${p.n}</text>`;
  }
  // แถวเทียบกับระบบสุริยะ
  s += `<line x1="${pad}" y1="${ySol}" x2="${W - pad}" y2="${ySol}" class="axis dim"/>`;
  s += `<text x="${pad}" y="${ySol + 17}" class="tick">${t.exoOurs}</text>`;
  for (const [nm, a, r] of [['☿', 0.387, 2.4], ['♀', 0.723, 3], ['⊕', 1, 3.1], ['♂', 1.524, 2.6], ['♃', 5.204, 6.5]]) {
    if (a < lo || a > hi) continue;
    s += `<circle cx="${X(a).toFixed(1)}" cy="${ySol}" r="${r}" class="pl sol"/>`;
    s += `<text x="${X(a).toFixed(1)}" y="${ySol - r - 4}" class="pn" text-anchor="middle">${nm}</text>`;
  }
  s += `</svg>`;
  return s;
}

function renderExoInfo() {
  const t = L(), h = EXO[exoSel], pane = $('#pane-info');
  pane.innerHTML = '';

  const head = el('div', 'sec');
  const hd = el('div', 'obj-head');
  const sw = el('div', 'obj-swatch');
  sw.style.setProperty('--glow', '#78f0c8');
  sw.style.background = 'radial-gradient(circle at 42% 38%, #ffe6a8, rgba(10,15,24,.95) 70%)';
  const ti = el('div', 'obj-title');
  ti.innerHTML = `<h2></h2><div class="kind"><em></em><span></span></div>`;
  ti.querySelector('h2').textContent = exoName(h);
  ti.querySelector('.kind em').style.background = '#78f0c8';
  ti.querySelector('.kind span').textContent = t.exoSystem + ' · ' + h.p.length + ' ' + t.exoPlanets;
  hd.append(sw, ti);
  head.appendChild(hd);
  if (h.de) {
    const p = el('p', 'desc');
    p.textContent = h.de[S.lang];
    head.appendChild(p);
  }
  pane.appendChild(head);

  const chart = el('div', 'sec');
  chart.innerHTML = `<h3>${t.exoChart}</h3>` + exoChart(h) +
    `<p class="desc" style="font-size:11.5px">${t.exoChartNote}</p>`;
  pane.appendChild(chart);

  const rows = [[t.stDist, `${nf(h.d, h.d < 100 ? 2 : 0)}<u>${t.ly}</u>`]];
  if (h.sp) rows.push([t.stSpec, h.sp]);
  if (h.teff != null) rows.push([t.exoTeff, `${nf(h.teff, 0)}<u>K</u>`]);
  const lum = exoLum(h);
  if (lum != null) rows.push([t.stLum, `${fmtLum(lum)}<u>${t.timesSun}</u>`]);
  if (h.sm != null) rows.push([t.exoSmass, `${nf(h.sm, 2)}<u>${t.timesSun}</u>`]);
  const star = el('div', 'sec');
  star.innerHTML = `<h3>${t.exoHost}</h3><dl class="readout">` +
    rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('') + `</dl>`;
  pane.appendChild(star);

  const tab = el('div', 'sec');
  let html = `<h3>${t.exoList}</h3><div class="exotab">`;
  for (const p of h.p) {
    const bits = [];
    if (p.a != null) bits.push(nf(p.a, p.a < 0.1 ? 3 : 2) + ' AU');
    if (p.per != null) bits.push(nf(p.per, p.per < 10 ? 2 : 0) + ' ' + t.day);
    if (p.re != null) bits.push(nf(p.re, 2) + ' R⊕');
    if (p.me != null) bits.push(nf(p.me, p.me < 10 ? 2 : 0) + ' M⊕');
    if (p.t != null) bits.push(nf(p.t, 0) + ' K');
    html += `<div class="exorow"><b>${p.n}</b><span>${bits.join(' · ')}</span>` +
            `<small>${p.y ? p.y + (p.m ? ' · ' + p.m : '') : ''}</small></div>`;
  }
  html += `</div>`;
  tab.innerHTML = html;
  pane.appendChild(tab);

  const act = el('div', 'sec');
  const chips = el('div', 'chips');
  const b1 = el('button', 'chip');
  b1.textContent = t.stAim;
  b1.addEventListener('click', () => aimAtExo(exoSel));
  const b2 = el('button', 'chip');
  b2.textContent = t.stBack;
  b2.addEventListener('click', () => { exoSel = -1; syncCrumb(); renderInfo(); });
  chips.append(b1, b2);
  act.appendChild(chips);
  pane.appendChild(act);
}

/* ── โมเดลยานจากไฟล์ glTF ของ NASA ────────────────────────────────────
   ยานสามลำมีโมเดลสามมิติที่ NASA เผยแพร่ให้ใช้ได้ (ดู models/README.md)
   โหลด "เมื่อผู้ใช้เจาะจงยานลำนั้น" เท่านั้น ไม่ได้โหลดตอนเปิดหน้า
   ระหว่างรอ (หรือถ้าโหลดไม่ได้) ใช้โมเดลที่ปั้นด้วยโค้ดไปก่อน — ไฟล์เดียวจบ
   ที่ไม่มีโฟลเดอร์ models/ จึงยังทำงานได้ตามปกติ
   ไฟล์ต้นทางวางแกนกันคนละแบบ จึงต้องจัดกึ่งกลาง ปรับมาตราส่วนตามขนาดจริง
   และหมุนให้ด้านที่ต้อง "หันเข้าหาเป้าหมาย" ชี้ไปทาง +Z เหมือนโมเดลที่ปั้นเอง */
const HALF_PI = Math.PI / 2;
const GLTF_SRC = {
  // ค่าการหมุนหาจากการลองวางจริง: หมุนแล้วด้านที่ต้องหันเข้าเป้าหมาย (จานสื่อสาร
  // หรือโล่กันความร้อน) ต้องมาอยู่ทาง +Z เหมือนโมเดลที่ปั้นเอง
  // รอบ 16 ตรวจซ้ำทุกไฟล์: ทิศเฉลี่ยของผิว (NORMAL) + ตำแหน่งจานเทียบตัวยาน + ภาพที่มองจากทิศเป้าหมายตรง ๆ
  voyager1:    { file: 'models/voyager.glb',      rot: [-HALF_PI, 0, 0] },
  voyager2:    { file: 'models/voyager.glb',      rot: [-HALF_PI, 0, 0] },
  newhorizons: { file: 'models/new-horizons.glb', rot: [HALF_PI, 0, 0] },    // จานอยู่ด้าน +Y ของไฟล์
  parker:      { file: 'models/parker.glb',       rot: [Math.PI, 0, 0] },
  pioneer10:   { file: 'models/pioneer.glb',      rot: [Math.PI, 0, 0] }, // จานหัน −Z · 10 กับ 11 หน้าตาเหมือนกัน ใช้ไฟล์เดียว
  pioneer11:   { file: 'models/pioneer.glb',      rot: [Math.PI, 0, 0] },
  jwst:        { file: 'models/jwst.glb',         rot: [-HALF_PI, 0, 0] },
  clipper:     { file: 'models/europa-clipper.glb', rot: [0, 0, 0] }     // ผิวแผงโซลาร์หัน +Z อยู่แล้ว
};
/* ── รูปทรงสามมิติของจริง ─────────────────────────────────────────────
   ดาวเคราะห์น้อย ดาวหาง และดวงจันทร์เล็กไม่ใช่ทรงกลม การวาดเป็นลูกกลม
   เกลี้ยงจึงผิดตั้งแต่ต้น ไฟล์ในตารางนี้คือรูปทรงที่วัดได้จริง — จากยานที่บิน
   ผ่าน จากเรดาร์ หรือจากการกลับด้านเส้นโค้งแสง — แปลงจากคลัง PDS/JAXA/DAMIT
   ทุกไฟล์ปรับให้ "รัศมีเทียบเท่าปริมาตร = 1" แล้ว หน้าเว็บจึงคูณด้วย def.radius
   ได้ตรง ๆ เหมือนทรงกลมเดิม และหมุนแกนมาให้ขั้วเหนืออยู่ทาง +Y เรียบร้อย
   โหลดตอนเจาะจงวัตถุนั้นครั้งแรกเท่านั้น (ไฟล์ละ 5–90 KB บีบแบบ Draco)
   rot = หมุนเพิ่มเฉพาะดวงที่คลังวางแกนยาวไว้ที่ Z แทนแกนหมุน (พวกที่ตีลังกา) */
const SHAPE_SRC = {
  eros:       { f: 'eros',       cr: { th: 'ยานเนียร์ ชูเมกเกอร์ · PDS', en: 'NEAR Shoemaker · PDS' } },
  itokawa:    { f: 'itokawa',    cr: { th: 'ยานฮายาบูสะ · PDS', en: 'Hayabusa · PDS' } },
  bennu:      { f: 'bennu',      cr: { th: 'ยานโอไซริส-เรกซ์ · PDS', en: 'OSIRIS-REx · PDS' } },
  ryugu:      { f: 'ryugu',      cr: { th: 'ยานฮายาบูสะ 2 · JAXA', en: 'Hayabusa2 · JAXA' } },
  vesta:      { f: 'vesta',      cr: { th: 'ยานดอว์น · PDS', en: 'Dawn · PDS' } },
  ceres:      { f: 'ceres',      cr: { th: 'ยานดอว์น · PDS', en: 'Dawn · PDS' } },
  didymos:    { f: 'didymos',    cr: { th: 'ยานดาร์ท · PDS', en: 'DART · PDS' } },
  arrokoth:   { f: 'arrokoth',   cr: { th: 'ยานนิวฮอไรซันส์ · PDS', en: 'New Horizons · PDS' } },
  apophis:    { f: 'apophis',    cr: { th: 'เรดาร์ · JPL · PDS', en: 'radar · JPL · PDS' } },
  toutatis:   { f: 'toutatis',   cr: { th: 'เรดาร์ · PDS', en: 'radar · PDS' }, rot: [Math.PI / 2, 0, 0] },
  geographos: { f: 'geographos', cr: { th: 'เรดาร์ · PDS', en: 'radar · PDS' } },
  ida:        { f: 'ida',        cr: { th: 'ยานกาลิเลโอ · PDS', en: 'Galileo · PDS' } },
  mathilde:   { f: 'mathilde',   cr: { th: 'ยานเนียร์ ชูเมกเกอร์ · PDS', en: 'NEAR Shoemaker · PDS' } },
  pallas:     { f: 'pallas',     cr: { th: 'เส้นโค้งแสง + การบัง · DAMIT', en: 'light curves + occultations · DAMIT' } },
  hygiea:     { f: 'hygiea',     cr: { th: 'เส้นโค้งแสง + กล้อง VLT · DAMIT', en: 'light curves + VLT · DAMIT' } },
  psyche:     { f: 'psyche',     cr: { th: 'เส้นโค้งแสง + การบัง · DAMIT', en: 'light curves + occultations · DAMIT' } },
  phaethon:   { f: 'phaethon',   cr: { th: 'เส้นโค้งแสง + เรดาร์ · DAMIT', en: 'light curves + radar · DAMIT' } },
  leucus:     { f: 'leucus',     cr: { th: 'เส้นโค้งแสง · DAMIT', en: 'light curves · DAMIT' } },
  churyumov:  { f: 'churyumov',  cr: { th: 'ยานโรเซตตา · PDS', en: 'Rosetta · PDS' } },
  wild2:      { f: 'wild2',      cr: { th: 'ยานสตาร์ดัสต์ · PDS', en: 'Stardust · PDS' } },
  tempel1:    { f: 'tempel1',    cr: { th: 'ยานดีปอิมแพกต์ + สตาร์ดัสต์ · PDS', en: 'Deep Impact + Stardust · PDS' } },
  hartley2:   { f: 'hartley2',   cr: { th: 'ยานอีพอกซี · PDS', en: 'EPOXI · PDS' }, rot: [Math.PI / 2, 0, 0] },
  halley:     { f: 'halley',     cr: { th: 'ยานเวกา + จอตโต · PDS', en: 'Vega + Giotto · PDS' }, rot: [Math.PI / 2, 0, 0] },
  phobos:     { f: 'phobos',     cr: { th: 'ยานไวกิง + MGS · PDS', en: 'Viking + MGS · PDS' } },
  deimos:     { f: 'deimos',     cr: { th: 'ยานไวกิง · PDS', en: 'Viking · PDS' } },
  dimorphos:  { f: 'dimorphos',  cr: { th: 'ยานดาร์ท · PDS', en: 'DART · PDS' } }
};
const shapeCache = {};                 // ไฟล์ → Promise ของรูปทรงที่โหลดแล้ว

const gltfCache = {};          // ไฟล์ → Promise ของฉากที่โหลดแล้ว
let gltfLoader = null, gltfLoaderTried = false;

const THREE_EX = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
function addScript(src) {
  return new Promise(res => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => res(true);
    s.onerror = () => res(false);
    document.head.appendChild(s);
  });
}

let gltfLoaderP = null;
function ensureGltfLoader() {
  // ทุกคนรอ Promise ตัวเดียวกัน: เลือกยานหลายลำติดกันระหว่างที่ตัวโหลดยังมาไม่ถึง ทุกลำต้องได้โมเดล
  if (gltfLoaderP) return gltfLoaderP;
  gltfLoaderTried = true;
  return (gltfLoaderP = (THREE.GLTFLoader ? Promise.resolve(true) : addScript(THREE_EX + 'loaders/GLTFLoader.js'))
    .then(ok => (ok && !THREE.DRACOLoader ? addScript(THREE_EX + 'loaders/DRACOLoader.js') : ok))
    .then(() => {
      if (!THREE.GLTFLoader) return (gltfLoader = null);
      gltfLoader = new THREE.GLTFLoader();
      // ไฟล์โมเดลทุกไฟล์บีบแบบ Draco (เล็กลง 5–25 เท่า) ตัวถอดรหัส (~350 KB) โหลดจาก CDN เดียวกันตอนใช้ครั้งแรก
      if (THREE.DRACOLoader) gltfLoader.setDRACOLoader(new THREE.DRACOLoader().setDecoderPath(THREE_EX + 'libs/draco/'));
      return gltfLoader;
    }));
}

/* จัดโมเดลให้อยู่กึ่งกลาง ขนาดเท่าของจริง และหันหน้าถูกทาง */
function fitCraftModel(obj, def, rot) {
  const g = new THREE.Group();
  const inner = new THREE.Group();
  inner.add(obj);
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3(), ctr = new THREE.Vector3();
  box.getSize(size); box.getCenter(ctr);
  obj.position.sub(ctr);                                   // ย้ายจุดกึ่งกลางมาที่ศูนย์
  const longest = Math.max(size.x, size.y, size.z) || 1;
  inner.scale.setScalar(def.span / longest);               // โมเดลของเราใช้หน่วยเมตร
  if (rot) inner.rotation.set(rot[0], rot[1], rot[2]);
  g.add(inner);
  obj.traverse(o => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    const m = o.material;
    if (m && m.map) m.map.encoding = THREE.sRGBEncoding;
    if (m && m.emissive) m.emissiveIntensity = 0.35;
  });
  return g;
}

/* เรียกตอนที่ยานลำนี้กลายเป็นเป้าหมาย */
function requestCraftModel(id) {
  const src = GLTF_SRC[id];
  const rec = REG[id];
  if (!src || !rec || rec.gltfDone) return;
  rec.gltfDone = true;                                     // ขอครั้งเดียวพอ
  ensureGltfLoader().then(loader => {
    if (!loader) { rec.gltfDone = false; return; }        // ไม่มีตัวโหลด (ออฟไลน์) — ปล่อยให้ขอใหม่ได้
    if (!gltfCache[src.file]) {
      gltfCache[src.file] = new Promise((res, rej) =>
        loader.load(src.file, gltf => res(gltf.scene), undefined, rej));
    }
    gltfCache[src.file].then(scene => {
      const model = fitCraftModel(scene.clone(true), rec.def, src.rot);
      rec.spin.remove(rec.mesh);
      rec.spin.add(model);
      rec.mesh = model;
      rec.usingGltf = true;
      if (typeof updateModelThumb === 'function') updateModelThumb(id);
      if ((trans.on ? trans.to : S.focus) === id) renderInfo();
    }).catch(() => { rec.gltfDone = false; });              // โหลดไม่ได้ก็ใช้ของเดิมต่อไป
  });
}

/* ── เงาที่ทอดลงบนดาวจริง ─────────────────────────────────────────────
   สามอย่างที่คำนวณในเชเดอร์ ไม่ได้ใช้ shadow map (ซึ่งรับช่วงมาตราส่วน
   ตั้งแต่เมตรถึงพันล้านกิโลเมตรไม่ไหว):
     1. เงาวงแหวนทาบลงบนตัวดาว — แถบมืดพาดดาวเสาร์ที่ทุกคนจำได้
     2. เงาตัวดาวทาบลงบนวงแหวน — ส่วนของวงแหวนที่ลับหลังดาวจะมืดลง
     3. เงาดวงจันทร์ทาบลงบนดาวแม่ — คือสุริยุปราคาเมื่อมองจากอวกาศ
   ทุกอย่างคิดในพิกัดของตัวดาวเอง โดยใช้ "รัศมีดาว" เป็นหน่วย ทำให้ตัวเลข
   ในเชเดอร์อยู่ราว ๆ 1 เสมอ ไม่ว่าดาวจะใหญ่แค่ไหน                        */
/* ── ก้อนหินที่ปั้นด้วยโค้ด ────────────────────────────────────────────
   วัตถุที่ยังไม่มีใครวัดรูปทรงไว้ ถ้าวาดเป็นทรงกลมเกลี้ยงก็ผิดพอ ๆ กัน
   จึงดันผิวทรงกลมด้วยเสียงรบกวนสามชั้นแล้วเจาะหลุมอุกกาบาตทับ
   ค่า elong (แกนยาว ÷ แกนสั้น) มาจากที่วัดได้จริงเท่าที่มี ไม่ได้เดาเอาเอง
   ตัวเลขสุ่มผูกกับชื่อวัตถุ รูปร่างจึงเหมือนเดิมทุกครั้งที่เปิดหน้าเว็บ    */
const ROCK = {
  dinkinesh:   { elong: 1.45, rough: 0.10 },   // 790 × 760 × 640 ม. (ยานลูซี 2566)
  eurybates:   { elong: 1.30, rough: 0.09 },
  polymele:    { elong: 1.35, rough: 0.10 },
  orus:        { elong: 1.25, rough: 0.09 },
  patroclus:   { elong: 1.10, rough: 0.06 },   // คู่แฝดเกือบกลมทั้งสองก้อน
  midas:       { elong: 1.60, rough: 0.12 },
  adonis:      { elong: 1.50, rough: 0.13 },
  hermes:      { elong: 1.15, rough: 0.11 },
  braille:     { elong: 2.10, rough: 0.13 },   // 2.1 × 1 × 1 กม. (ยานดีปสเปซ 1)
  icarus:      { elong: 1.10, rough: 0.10 },
  encke:       { elong: 1.80, rough: 0.12 },
  tempeltuttle:{ elong: 1.40, rough: 0.12 },
  swifttuttle: { elong: 1.60, rough: 0.12 },
  halebopp:    { elong: 1.30, rough: 0.10 },
  neowise:     { elong: 1.35, rough: 0.12 },
  borrelly:    { elong: 2.10, rough: 0.14 },   // ทรงลูกโบว์ลิ่ง 8 × 3.2 กม. (ยานดีปสเปซ 1)
  oumuamua:    { elong: 6.00, rough: 0.05 },   // ยาวผิดปกติ — จากความสว่างที่แกว่งถึง 2.5 เท่า
  borisov:     { elong: 1.30, rough: 0.10 },
  atlas3i:     { elong: 1.40, rough: 0.10 },
  haumea:      { axes: [1161, 513, 852], rough: 0.004, smooth: true },  // ไข่หมุนเร็ว วัดจากการบังดาว (กม.)
  // สามดวงนี้มีรูปทรงจริงอยู่แล้ว ก้อนที่ปั้นไว้ใช้ระหว่างรอไฟล์โหลดเท่านั้น
  phobos:      { axes: [27, 18, 22], rough: 0.09 },
  deimos:      { axes: [15, 10.4, 12.2], rough: 0.08 },
  dimorphos:   { axes: [177, 116, 174], rough: 0.07 }   // ม. · ยานดาร์ทวัดไว้ก่อนชน
};

function rockRand(seed) {              // ตัวสุ่มที่ให้ผลเดิมทุกครั้ง (mulberry32)
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rockHash(x, y, z, seed) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1103515245) + seed | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function rockNoise(x, y, z, seed) {    // เสียงรบกวนแบบค่าจุดกริด ไล่ระดับด้วยเส้นโค้งนุ่ม
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  const c = (i, j, k) => rockHash(xi + i, yi + j, zi + k, seed);
  const lx = (a, b) => a + (b - a) * u;
  const ly = (a, b) => a + (b - a) * v;
  return ly(lx(c(0, 0, 0), c(1, 0, 0)) + (lx(c(0, 0, 1), c(1, 0, 1)) - lx(c(0, 0, 0), c(1, 0, 0))) * w,
            lx(c(0, 1, 0), c(1, 1, 0)) + (lx(c(0, 1, 1), c(1, 1, 1)) - lx(c(0, 1, 0), c(1, 1, 0))) * w);
}

/* ปริมาตรของรูปทรงหลายหน้า (ผลรวมเทตระฮีดรอนจากจุดกำเนิด) ใช้ปรับขนาดให้ตรงกับ def.radius */
function meshVolume(pos, idx) {
  let V = 0;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    V += (pos[a] * (pos[b + 1] * pos[c + 2] - pos[b + 2] * pos[c + 1])
        - pos[a + 1] * (pos[b] * pos[c + 2] - pos[b + 2] * pos[c])
        + pos[a + 2] * (pos[b] * pos[c + 1] - pos[b + 1] * pos[c])) / 6;
  }
  return Math.abs(V);
}

function rockGeometry(def) {
  const cfg = ROCK[def.id] || { elong: 1.3, rough: 0.11 };
  let seed = 0;
  for (let i = 0; i < def.id.length; i++) seed = (Math.imul(seed, 131) + def.id.charCodeAt(i)) | 0;
  const rnd = rockRand(seed ^ 0x9e3779b9);
  const geo = new THREE.SphereGeometry(1, 48, 28);
  const p = geo.attributes.position, n = p.count;

  // หลุมอุกกาบาต: ยิ่งก้อนใหญ่ยิ่งเก่า หลุมยิ่งเยอะ
  const nCrater = cfg.smooth ? 0 : Math.round(4 + rnd() * 5);
  const craters = [];
  for (let i = 0; i < nCrater; i++) {
    const z = rnd() * 2 - 1, a = rnd() * 6.2832, s = Math.sqrt(1 - z * z);
    craters.push({ x: s * Math.cos(a), y: z, z: s * Math.sin(a),
                   R: 0.18 + rnd() * 0.35, d: (0.05 + rnd() * 0.09) * (cfg.rough / 0.11) });
  }

  const rough = cfg.rough != null ? cfg.rough : 0.11;
  for (let i = 0; i < n; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);      // อยู่บนทรงกลมหนึ่งหน่วยอยู่แล้ว
    let r = 1, amp = rough, f = 1.7;
    for (let k = 0; k < 3; k++) {
      r += amp * (rockNoise(x * f, y * f, z * f, seed + k * 7919) * 2 - 1);
      amp *= 0.48; f *= 2.4;
    }
    for (const c of craters) {
      const dot = Math.max(-1, Math.min(1, x * c.x + y * c.y + z * c.z));
      const t = Math.acos(dot) / c.R;
      if (t < 1) r -= c.d * (1 - t * t);                    // แอ่งก้นหลุม
      else if (t < 1.6) r += c.d * 0.3 * Math.exp(-(((t - 1) / 0.22) ** 2));   // ขอบหลุมที่ยกขึ้น
    }
    p.setXYZ(i, x * r, y * r, z * r);
  }

  // อัตราส่วนแกน: X = แกนยาว · Y = แกนหมุน · Z = แกนกลาง
  const ax = cfg.axes || [cfg.elong || 1.3, 0.85, 1];
  const g = Math.cbrt(ax[0] * ax[1] * ax[2]);
  for (let i = 0; i < n; i++)
    p.setXYZ(i, p.getX(i) * ax[0] / g, p.getY(i) * ax[1] / g, p.getZ(i) * ax[2] / g);

  // ปรับให้ปริมาตรเท่าทรงกลมรัศมี 1 พอดี — def.radius จึงยังหมายถึงรัศมีเฉลี่ยเหมือนเดิม
  const k = Math.cbrt((4 * Math.PI / 3) / meshVolume(p.array, geo.index.array));
  for (let i = 0; i < n; i++) p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/* เรียกตอนที่วัตถุดวงนี้กลายเป็นเป้าหมาย — สลับเฉพาะ "รูปทรง" ไม่แตะวัสดุ
   (วัสดุเดิมคอมไพล์เชเดอร์ไปตั้งแต่ตอนบูตแล้ว เปลี่ยนแค่รูปทรงจึงไม่กระตุก) */
function requestShapeModel(id) {
  const src = SHAPE_SRC[id];
  const rec = REG[id];
  if (!src || !rec || rec.shapeDone) return;
  rec.shapeDone = true;
  ensureGltfLoader().then(loader => {
    if (!loader) { rec.shapeDone = false; return; }        // ออฟไลน์ — ให้ขอใหม่ได้
    const file = 'models/shapes/' + src.f + '.glb';
    if (!shapeCache[file]) {
      shapeCache[file] = new Promise((res, rej) => loader.load(file, gltf => {
        let geo = null;
        gltf.scene.traverse(o => { if (!geo && o.isMesh) geo = o.geometry; });
        geo ? res(geo) : rej(new Error('ไม่มีรูปทรงในไฟล์'));
      }, undefined, rej));
    }
    shapeCache[file].then(geo => {
      const g = geo.clone();
      if (src.rot) {
        // บางคลังวางแกนยาวไว้ที่ Z (วัตถุที่ตีลังกาไม่มีแกนหมุนเดียว) — จับให้นอนลง
        const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(src.rot[0], src.rot[1], src.rot[2]));
        g.applyMatrix4(m);
      }
      if (rec.mesh.geometry) rec.mesh.geometry.dispose();
      rec.mesh.geometry = g;
      rec.usingShape = true;
      if (typeof updateModelThumb === 'function') updateModelThumb(id);
      if ((trans.on ? trans.to : S.focus) === id) renderInfo();
    }).catch(() => { rec.shapeDone = false; });             // โหลดไม่ได้ก็ใช้ก้อนที่ปั้นเองต่อ
  });
}

const MAX_SHADOW_MOONS = 4;

function injectShadowShader(mat, hasRing) {
  mat.userData.sh = {
    uSunL:   { value: new THREE.Vector3(1, 0, 0) },
    uRing:   { value: new THREE.Vector2(hasRing ? hasRing[0] : 0, hasRing ? hasRing[1] : 0) },
    uMoons:  { value: Array.from({ length: MAX_SHADOW_MOONS }, () => new THREE.Vector4(0, 0, 0, 0)) },
    uMoonN:  { value: 0 },
    uSunA:   { value: 0.0047 }               // รัศมีเชิงมุมของดวงอาทิตย์เมื่อมองจากดาวดวงนี้ (เรเดียน)
  };
  mat.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, mat.userData.sh);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vPosL;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPosL = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vPosL;
        uniform vec3 uSunL;
        uniform vec2 uRing;
        uniform vec4 uMoons[${MAX_SHADOW_MOONS}];
        uniform int uMoonN;
        uniform float uSunA;`)
      .replace('#include <tonemapping_fragment>', `
        float shade = 1.0;
        if (uRing.y > 0.0 && abs(uSunL.y) > 0.0001) {
          float t = -vPosL.y / uSunL.y;                 // เดินจากผิวดาวไปหาดวงอาทิตย์ จนตัดระนาบวงแหวน
          if (t > 0.0) {
            vec3 q = vPosL + uSunL * t;
            float r = length(q.xz);
            float edge = smoothstep(0.0, 0.06, min(r - uRing.x, uRing.y - r));
            if (r > uRing.x && r < uRing.y) shade *= mix(1.0, 0.30, edge);
          }
        }
        for (int i = 0; i < ${MAX_SHADOW_MOONS}; i++) {
          if (i >= uMoonN) break;
          vec3 m = uMoons[i].xyz;
          float rad = uMoons[i].w;
          float tm = dot(m - vPosL, uSunL);             // ดวงจันทร์ต้องอยู่ "ระหว่าง" จุดนี้กับดวงอาทิตย์
          if (tm > 0.0) {
            float d = length((vPosL + uSunL * tm) - m);
            // ดวงอาทิตย์ไม่ใช่จุด เงาจึงบานออกตามระยะ: ขอบเงามัว = รัศมีจันทร์ + ระยะ × รัศมีเชิงมุมดวงอาทิตย์
            float spread = tm * uSunA;
            float umb = rad - spread, pen = rad + spread;
            float core = umb > 0.0 ? 0.05 : 1.0 - 0.94 * clamp((rad * rad) / max(spread * spread, 1e-12), 0.0, 1.0);
            shade *= mix(core, 1.0, smoothstep(max(umb, 0.0), pen, d));
          }
        }
        gl_FragColor.rgb *= shade;
        #include <tonemapping_fragment>`);
  };
  mat.needsUpdate = true;
}

/* วงแหวน: ส่วนที่ลับหลังดาวต้องมืดลง */
function injectRingShadow(mat, Rscene) {
  mat.userData.sh = {
    uSunL: { value: new THREE.Vector3(1, 0, 0) },
    uPr:   { value: Rscene }                      // รัศมีดาวในหน่วยฉาก ใช้แปลงพิกัดวงแหวนให้เป็นหน่วยรัศมีดาว
  };
  mat.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, mat.userData.sh);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRingP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRingP = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRingP;\nuniform vec3 uSunL;\nuniform float uPr;')
      .replace('#include <tonemapping_fragment>', `
        vec3 rp = vec3(vRingP.x, 0.0, vRingP.y) / uPr;  // RingGeometry อยู่ระนาบ XY จึงสลับแกน แล้วหารด้วยรัศมีดาว
        float tp = dot(-rp, uSunL);
        if (tp > 0.0) {
          float d = length(rp + uSunL * tp);
          gl_FragColor.rgb *= mix(0.18, 1.0, smoothstep(0.94, 1.06, d));
        }
        #include <tonemapping_fragment>`);
  };
  mat.needsUpdate = true;
}

/* อัปเดตทิศดวงอาทิตย์และตำแหน่งดวงจันทร์ (หน่วย = รัศมีดาว) ทุกเฟรม */
const _sw = new THREE.Vector3(), _sq = new THREE.Quaternion(), _mv = new THREE.Vector3();
function updateShadows() {
  if (!S.shadows) return;
  for (const rec of shadowRecs) {
    const sh = rec.mesh.material.userData.sh;
    if (!sh) continue;
    const w = rec.world;
    _sw.set(-w.x, -w.y, -w.z).normalize();               // ดวงอาทิตย์อยู่ที่จุดกำเนิดของพิกัดโลก
    rec.spin.getWorldQuaternion(_sq).invert();
    _sw.applyQuaternion(_sq);
    sh.uSunL.value.copy(_sw);
    sh.uSunA.value = REG.sun.def.radius / Math.max(1, Math.hypot(w.x, w.y, w.z));
    if (rec.ringMat && rec.ringMat.userData.sh) rec.ringMat.userData.sh.uSunL.value.copy(_sw);

    let n = 0;
    const Rkm = rec.def.radius * ((S.enlarge && rec.def.id !== 'sun') ? 25 : 1);
    for (const mid of rec.shadowMoons) {
      if (n >= MAX_SHADOW_MOONS) break;
      const mw = worldOf(mid), md = REG[mid].def;
      _mv.set(mw.x - w.x, mw.y - w.y, mw.z - w.z).multiplyScalar(1 / Rkm).applyQuaternion(_sq);
      sh.uMoons.value[n].set(_mv.x, _mv.y, _mv.z, md.radius / Rkm);
      n++;
    }
    sh.uMoonN.value = S.moons ? n : 0;
    if (rec.clouds && rec.clouds.material.userData.sh) {
      const cs = rec.clouds.material.userData.sh;
      cs.uSunL.value.copy(sh.uSunL.value); cs.uSunA.value = sh.uSunA.value; cs.uMoonN.value = sh.uMoonN.value;
      for (let i = 0; i < MAX_SHADOW_MOONS; i++) cs.uMoons.value[i].copy(sh.uMoons.value[i]);
    }
  }
}

const shadowRecs = [];
function setupShadows() {
  for (const b of BODIES) {
    if (b.id === 'sun') continue;
    const rec = REG[b.id];
    const ring = RINGS[b.id];
    const moons = MOONS.filter(m => m.parent === b.id).map(m => m.id).slice(0, MAX_SHADOW_MOONS);
    if (!ring && !moons.length) continue;
    injectShadowShader(rec.mesh.material, ring ? [ring.in, ring.out] : null);
    if (rec.clouds) injectShadowShader(rec.clouds.material, null);   // ชั้นเมฆก็ต้องมืดตามเงาดวงจันทร์
    if (rec.ring) { injectRingShadow(rec.ring.material, rec.R); rec.ringMat = rec.ring.material; }
    rec.shadowMoons = moons;
    shadowRecs.push(rec);
  }
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
  if (ly >= 1e9) return nf(ly / 1e9, ly < 1e10 ? 1 : 0) + ' ' + t.gly;
  if (ly >= 1e6) return nf(ly / 1e6, ly < 1e7 ? 1 : 0) + ' ' + t.mly;
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
  if (deepSel >= 0) {
    const o = deepSprites[deepSel].o, t0 = L();
    $('#crumb').innerHTML = '<i>▸</i><b></b><i>·</i><span></span>';
    $('#crumb b').textContent = o.home ? t0.milkyWay : (S.lang === 'th' ? o.th : o.en);
    $('#crumb span').textContent = t0.galType[o.home ? 'barred' : o.t];
    return;
  }
  if (exoSel >= 0) {
    const h = EXO[exoSel], t0 = L();
    $('#crumb').innerHTML = '<i>▸</i><b></b><i>·</i><span></span>';
    $('#crumb b').textContent = exoName(h);
    $('#crumb span').textContent = t0.exoSystem;
    return;
  }
  if (starSel >= 0) {
    const s = STARS[starSel], t0 = L();
    $('#crumb').innerHTML = '<i>▸</i><b></b><i>·</i><span></span>';
    $('#crumb b').textContent = (S.lang === 'th' && s.th) ? s.th : s.n;
    $('#crumb span').textContent = t0.kind.star;
    return;
  }
  const rec = REG[trans.on ? trans.to : S.focus];
  const t = L();
  const kind = rec.isMoon ? t.kind.moon : t.kind[rec.def.kind];
  $('#crumb').innerHTML = `<i>▸</i><b></b><i>·</i><span></span>`;
  $('#crumb b').textContent = rec.def.nm[S.lang];
  $('#crumb span').textContent = kind;
}

function renderInfo() {
  if (deepSel >= 0) return renderDeepInfo();
  if (exoSel >= 0) return renderExoInfo();
  if (starSel >= 0) return renderStarInfo();
  const frec = REG[trans.on ? trans.to : S.focus];
  if (frec && frec.far) return renderFarInfo(frec);
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
    if (rec.usingGltf) rows.push([t.model, t.modelNasa]);
  } else {
    rows.push([t.radius, `${nf(def.radius, def.radius < 100 ? (def.radius < 1 ? 3 : 1) : 0)}<u>${t.km}${def.rEst ? ' · ' + t.rApprox : ''}</u>`]);
    // รูปทรงที่เห็นมาจากไหน: วัดมาจริง หรือปั้นด้วยโค้ด
    if (rec.usingShape && SHAPE_SRC[def.id]) rows.push([t.shapeSrc, SHAPE_SRC[def.id].cr[S.lang]]);
    else if (rec.rockGeo) rows.push([t.shapeSrc, t.shapeMade]);
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
  // ยานที่ยังจุดเครื่องอยู่: บอกให้ชัดว่าวิถีตรงเฉพาะช่วงใกล้ยุคของข้อมูล
  if (def.powered) {
    const pw = el('div', 'note');
    pw.innerHTML = `<span></span><p></p>`;
    pw.querySelector('span').textContent = t.poweredTitle;
    pw.querySelector('p').textContent = t.poweredNote.replace('{d}', fmtJD(def.epoch));
    phys.appendChild(pw);
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
    } else if (def.el) {
      // วัตถุจิ๋วไม่มีอยู่ใน ELEMENTS (ตารางของดาวเคราะห์เท่านั้น) ต้องคิดจากองค์ประกอบวงโคจรของตัวเอง
      smallPos(def, S.time, a); smallPos(def, S.time + 120000, b);
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
      if (REG[id].far) continue;                 // วัดระยะเฉพาะในระบบสุริยะ
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
  const a0 = REG[id].def, b = REG[id === 'earth' ? 'sun' : 'earth'].def;
  // หลุมดำเทียบขนาดขอบฟ้าเหตุการณ์ · ซากซูเปอร์โนวาเทียบครึ่งหนึ่งของความกว้าง
  const a = a0.far ? Object.assign({}, a0, { radius: a0.t === 'bh' ? a0.rs : a0.size * LY / 2 }) : a0;
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
    ['shadows', t.vShadows], ['craft', t.vCraft], ['asteroids', t.vAsteroids], ['comets', t.vComets], ['dwarfs', t.vDwarfs],
    ['stars', t.vStars], ['figures', t.vFigures], ['exo', t.vExo], ['galaxy', t.vGalaxy], ['ism', t.vIsm], ['darkmatter', t.vDark], ['deep', t.vDeep], ['cosmic', t.vCosmic], ['cmb', t.vCmb], ['grid', t.vGrid], ['trails', t.vTrails]
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
  const cn = el('p', 'desc');
  cn.style.fontSize = '11.5px';
  cn.textContent = t.consNote;
  show.appendChild(cn);
  const gn = el('p', 'desc');
  gn.style.fontSize = '11.5px';
  gn.textContent = t.galNote;
  show.appendChild(gn);
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

/* ── เรนเดอร์รูปโมเดล 3 มิติสำหรับบัตรค้นหา (Offscreen 3D Model Thumbnail) ── */
let thumbRenderer = null, thumbScene = null, thumbCamera = null;
const MODEL_THUMB_CACHE = {};

function initThumbRenderer() {
  if (thumbRenderer) return;
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 80;
  thumbRenderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true
  });
  thumbRenderer.setPixelRatio(1);
  thumbRenderer.setSize(120, 80, false);
  thumbRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  thumbRenderer.toneMappingExposure = 1.25;

  thumbScene = new THREE.Scene();

  const key = new THREE.DirectionalLight(0xffffff, 1.45);
  key.position.set(2.4, 2.8, 3.2).normalize();
  thumbScene.add(key);

  const fill = new THREE.DirectionalLight(0x8fa8d6, 0.45);
  fill.position.set(-2.5, -1.2, 1.2).normalize();
  thumbScene.add(fill);

  thumbScene.add(new THREE.AmbientLight(0x283040, 0.4));

  thumbCamera = new THREE.PerspectiveCamera(35, 120 / 80, 0.1, 100);
}

function renderModelThumb(id) {
  if (MODEL_THUMB_CACHE[id]) return MODEL_THUMB_CACHE[id];
  const rec = REG[id];
  if (!rec) return null;
  initThumbRenderer();

  const group = new THREE.Group();
  const def = rec.def;

  if (rec.craft) {
    if (rec.mesh) {
      const craftClone = rec.mesh.clone(true);
      craftClone.position.set(0, 0, 0);
      craftClone.rotation.set(0.32, -0.62, 0.18);
      group.add(craftClone);
    }
  } else if (rec.far && rec.mesh && !rec.mesh.geometry) {
    return def._discURL || null;
  } else if (rec.mesh && rec.mesh.geometry) {
    let mat;
    if (def.id === 'sun') {
      mat = new THREE.MeshBasicMaterial({
        map: rec.mesh.material ? rec.mesh.material.map : null,
        color: 0xffd27d
      });
    } else {
      let map = (rec.mesh.material && rec.mesh.material.map) || def._map;
      if (!map && def._tex && typeof texShared === 'function') {
        map = texShared(def._tex);
      }
      mat = new THREE.MeshStandardMaterial({
        map: map,
        roughness: (def.kind === 'asteroid' || def.kind === 'comet' || def.kind === 'tno' || def.kind === 'dwarf') ? 0.92 : 0.85,
        metalness: 0.04
      });
      if (rec.mesh.material && rec.mesh.material.bumpMap) {
        mat.bumpMap = rec.mesh.material.bumpMap;
        mat.bumpScale = 0.025;
      }
    }

    const meshClone = new THREE.Mesh(rec.mesh.geometry.clone(), mat);
    meshClone.scale.set(1, 1, 1);

    if (rec.rockGeo || (def && (def.kind === 'asteroid' || def.kind === 'comet' || def.kind === 'tno' || def.kind === 'dwarf'))) {
      meshClone.rotation.set(0.38, -0.72, 0.25);
    } else {
      meshClone.rotation.set(0.2, -0.3, 0);
    }
    group.add(meshClone);

    if (rec.clouds && rec.clouds.material) {
      const cloudMat = new THREE.MeshStandardMaterial({
        map: rec.clouds.material.map,
        transparent: true,
        roughness: 1,
        opacity: 0.85
      });
      const cm = new THREE.Mesh(new THREE.SphereGeometry(1.02, 36, 24), cloudMat);
      cm.rotation.set(0.2, -0.15, 0);
      group.add(cm);
    }

    if (rec.ring && rec.ring.material) {
      const ringMat = new THREE.MeshStandardMaterial({
        map: rec.ring.material.map,
        transparent: true,
        side: THREE.DoubleSide,
        opacity: 0.95
      });
      const ringGeo = rec.ring.geometry.clone();
      if (rec.R && rec.R > 0) ringGeo.scale(1 / rec.R, 1 / rec.R, 1 / rec.R);
      const rm = new THREE.Mesh(ringGeo, ringMat);
      rm.rotation.set(Math.PI * 0.38, 0, 0.22);
      group.add(rm);
    }
  }

  if (!group.children.length) return null;

  thumbScene.add(group);

  const box = new THREE.Box3().setFromObject(group);
  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);

  if (sphere.radius > 0) {
    group.position.sub(sphere.center);
    const radius = Math.max(sphere.radius || 1, 0.001);
    const fov = thumbCamera.fov * (Math.PI / 180);
    const dist = (radius / Math.sin(fov / 2)) * 1.18;
    thumbCamera.position.set(0, 0, dist);
    thumbCamera.lookAt(0, 0, 0);

    thumbRenderer.setClearColor(0x000000, 0);
    thumbRenderer.clear();
    thumbRenderer.render(thumbScene, thumbCamera);

    const dataUrl = thumbRenderer.domElement.toDataURL('image/png');
    MODEL_THUMB_CACHE[id] = dataUrl;
    thumbScene.remove(group);
    return dataUrl;
  }

  thumbScene.remove(group);
  return null;
}

function updateModelThumb(id) {
  delete MODEL_THUMB_CACHE[id];
  const url = renderModelThumb(id);
  if (url) {
    document.querySelectorAll(`img[data-thumb-id="${id}"]`).forEach(img => {
      img.src = url;
    });
  }
}

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
    [t.gFar, FAR.map(f => f.id)],
    [t.gDwarfs, SMALL.filter(s => s.layer === 'dwarfs').map(s => s.id)],
    [t.gAsteroids, SMALL.filter(s => s.layer === 'asteroids').map(s => s.id)],
    [t.gComets, SMALL.filter(s => s.layer === 'comets').map(s => s.id)]
  ];
  body.innerHTML = '';
  let any = false;
  // ดาวฤกษ์อยู่คนละทะเบียนกับวัตถุในระบบสุริยะ จึงทำเป็นหมวดของตัวเอง
  const stHits = [];
  for (let i = 0; i < STARS.length; i++) {
    const s = STARS[i];
    if (!s.th && !/^[A-Za-z’' .-]+$/.test(s.n)) continue;
    if (q && !(s.n.toLowerCase().includes(q) || (s.th || '').toLowerCase().includes(q))) continue;
    stHits.push(i);
    if (stHits.length > 40) break;
  }
  const exHits = [];
  for (let i = 0; i < EXO.length; i++) {
    const h = EXO[i];
    if (q && !exoName(h).toLowerCase().includes(q) && !h.n.toLowerCase().includes(q)) continue;
    exHits.push(i);
    if (exHits.length > 30) break;
  }
  if (exHits.length) {
    any = true;
    const g = el('div', 'group', '<h4>' + t.gExo + '</h4>');
    const grid = el('div', 'hits');
    for (const i of exHits) {
      const h = EXO[i];
      const b = el('button', 'hit');
      const info = el('span', 'hit-info');
      const bName = el('b');
      bName.textContent = exoName(h);
      const sKind = el('small');
      sKind.textContent = h.p.length + ' ' + t.exoPlanets + ' · ' + nf(h.d, h.d < 100 ? 1 : 0) + ' ' + t.ly;
      info.append(bName, sKind);
      const thumb = el('span', 'hit-thumb');
      const icon = el('span', 'exo-icon');
      thumb.appendChild(icon);
      b.append(info, thumb);
      b.addEventListener('click', () => { selectExo(i); aimAtExo(i); closeSheets(); });
      grid.appendChild(b);
    }
    g.appendChild(grid);
    body.appendChild(g);
  }
  // กาแล็กซีและกระจุกกาแล็กซี (ลำดับ 0 คือทางช้างเผือกเอง ข้ามไป)
  const dpHits = [];
  for (let i = 1; i < deepSprites.length; i++) {
    const o = deepSprites[i].o;
    if (q && !(o.en.toLowerCase().includes(q) || o.th.toLowerCase().includes(q) || String(o.m || '').toLowerCase().includes(q))) continue;
    dpHits.push(i);
    if (dpHits.length > 40) break;
  }
  if (dpHits.length) {
    any = true;
    const g = el('div', 'group', '<h4>' + t.gGalaxies + '</h4>');
    const grid = el('div', 'hits');
    for (const i of dpHits) {
      const o = deepSprites[i].o, col = DEEP_COL[o.t] || '#cfd8e8';
      const b = el('button', 'hit');
      const info = el('span', 'hit-info');
      const bName = el('b');
      bName.textContent = S.lang === 'th' ? o.th : o.en;
      const sKind = el('small');
      sKind.textContent = t.galType[o.t] + ' · ' + fmtLy(o.mly * MLY).replace(/<\/?u>/g, ' ').replace(/\s+/g, ' ').trim();
      info.append(bName, sKind);
      const thumb = el('span', 'hit-thumb');
      const thumbUrl = o.id ? renderModelThumb(o.id) : null;
      if (thumbUrl) {
        const img = el('img');
        img.src = thumbUrl;
        img.alt = '';
        img.setAttribute('data-thumb-id', o.id);
        thumb.appendChild(img);
      } else {
        const icon = el('span', 'deep-icon');
        icon.style.color = col;
        thumb.appendChild(icon);
      }
      b.append(info, thumb);
      b.addEventListener('click', () => { selectDeep(i); aimAtDeep(o); closeSheets(); });
      grid.appendChild(b);
    }
    g.appendChild(grid);
    body.appendChild(g);
  }
  const cnHits = [];
  for (let i = 0; i < CONSTELLATIONS.length; i++) {
    const c = CONSTELLATIONS[i];
    if (q && !(c.la.toLowerCase().includes(q) || c.th.toLowerCase().includes(q) || c.ab.toLowerCase() === q)) continue;
    cnHits.push(i);
    if (cnHits.length > 24) break;
  }
  if (cnHits.length) {
    any = true;
    const g = el('div', 'group', '<h4>' + t.gCons + '</h4>');
    const grid = el('div', 'hits');
    for (const i of cnHits) {
      const c = CONSTELLATIONS[i];
      const b = el('button', 'hit');
      const info = el('span', 'hit-info');
      const bName = el('b');
      bName.textContent = S.lang === 'th' ? c.th : c.la;
      const sKind = el('small');
      sKind.textContent = S.lang === 'th' ? c.la : c.th;
      info.append(bName, sKind);
      const thumb = el('span', 'hit-thumb');
      const icon = el('span', 'cons-icon');
      icon.innerHTML = `<svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M10 2l1.8 5.5H17.5l-4.6 3.4 1.8 5.5-4.7-3.4-4.7 3.4 1.8-5.5L2.5 7.5h5.7z"/></svg>`;
      thumb.appendChild(icon);
      b.append(info, thumb);
      b.addEventListener('click', () => { aimAtCons(i); closeSheets(); });
      grid.appendChild(b);
    }
    g.appendChild(grid);
    body.appendChild(g);
  }
  if (stHits.length) {
    any = true;
    const g = el('div', 'group', '<h4>' + t.gStars + '</h4>');
    const grid = el('div', 'hits');
    for (const i of stHits) {
      const s = STARS[i];
      const hex = '#' + (SP_TINT[s.c] || 0xffd9a0).toString(16).padStart(6, '0');
      const b = el('button', 'hit');
      const info = el('span', 'hit-info');
      const bName = el('b');
      bName.textContent = (S.lang === 'th' && s.th) ? s.th : s.n;
      const sKind = el('small');
      sKind.textContent = nf(s.d, s.d < 100 ? 1 : 0) + ' ' + t.ly;
      info.append(bName, sKind);
      const thumb = el('span', 'hit-thumb');
      const icon = el('span', 'star-icon');
      icon.style.cssText = `color:${hex};background:${hex}`;
      thumb.appendChild(icon);
      b.append(info, thumb);
      b.addEventListener('click', () => { selectStar(i); aimAtStar(i); closeSheets(); });
      grid.appendChild(b);
    }
    g.appendChild(grid);
    body.appendChild(g);
  }
  for (const [title, ids] of groups) {
    const hits = ids.filter(match);
    if (!hits.length) continue;
    any = true;
    const g = el('div', 'group', `<h4>${title}</h4>`);
    const grid = el('div', 'hits');
    for (const id of hits) {
      const d = REG[id].def;
      // โหลดโมเดล 3 มิติของ NASA เบื้องหลังหากยังไม่ได้โหลด
      if (SHAPE_SRC[id] && !REG[id].shapeDone) requestShapeModel(id);
      if (GLTF_SRC[id] && !REG[id].gltfDone) requestCraftModel(id);

      const thumbUrl = renderModelThumb(id) || d._discURL;
      const b = el('button', 'hit');
      b.setAttribute('data-id', id);

      const info = el('span', 'hit-info');
      const bName = el('b');
      bName.textContent = d.nm[S.lang];
      const sKind = el('small');
      sKind.textContent = REG[id].isMoon
        ? REG[REG[id].parent].def.nm[S.lang] : t.kind[d.kind];
      info.append(bName, sKind);

      const thumb = el('span', 'hit-thumb');
      if (thumbUrl) {
        const img = el('img');
        img.src = thumbUrl;
        img.alt = '';
        img.setAttribute('data-thumb-id', id);
        img.loading = 'lazy';
        thumb.appendChild(img);
      } else {
        const hex = '#' + d.color.toString(16).padStart(6, '0');
        const dot = el('span', 'hit-dot');
        dot.style.cssText = `color:${hex};background:${hex}`;
        thumb.appendChild(dot);
      }

      b.append(info, thumb);
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
  updateRailToggle();
  updateConsoleToggle();
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
                    'asteroids', 'comets', 'dwarfs', 'craft', 'figures', 'deep', 'exo', 'shadows', 'cosmic', 'cmb', 'ism', 'darkmatter'];
const LAYER_DEF = { orbits: 1, labels: 1, moons: 1, belt: 1, kuiper: 1, oort: 1, stars: 1, galaxy: 1, grid: 0, trails: 0,
                    asteroids: 1, comets: 1, dwarfs: 1, craft: 1, figures: 1, deep: 1, exo: 1, shadows: 1, cosmic: 1, cmb: 1, ism: 1, darkmatter: 1 };
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
  drawStarLabelsOnto(g, k);
  try { g.letterSpacing = '0px'; } catch (e) {}
}

/* ป้ายชื่อดาวฤกษ์อยู่คนละชุดกับป้ายวัตถุในระบบสุริยะ ต้องวาดลงภาพแยก */
function drawStarLabelsOnto(g, k) {
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  for (const node of starLabels.concat(consLabels, galMarkNodes, deepNodes)) {
    if (node.hidden) continue;
    const cx = parseFloat(node.style.left) * k, cy = parseFloat(node.style.top) * k;
    if (!isFinite(cx) || !isFinite(cy)) continue;
    const far = node.classList.contains('far'), th = node.classList.contains('th');
    const size = (far ? (th ? 12.5 : 12) : 9.5) * k;
    g.font = `400 ${size.toFixed(2)}px "IBM Plex Mono", ui-monospace, monospace`;
    try { g.letterSpacing = (size * (far && !th ? 0.34 : 0.1)).toFixed(2) + 'px'; } catch (e) {}
    g.globalAlpha = Math.max(0.25, Math.min(1, parseFloat(node.style.opacity) || 1));
    g.fillStyle = far ? '#5d9ee8' : (node.style.color || '#e8eef7');
    g.shadowColor = '#000'; g.shadowBlur = 6 * k;
    const tx = node.querySelector('.nm').textContent;
    g.fillText(far && !th ? tx.toUpperCase() : tx, cx, cy);
    g.shadowBlur = 0;
    g.globalAlpha = 1;
  }
  g.textAlign = 'left';
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

function updateRailToggle() {
  const r = $('#rail');
  if (!r) return;
  const closed = r.classList.contains('closed');
  const isMobile = window.innerWidth <= 900;
  const btn = $('#railToggle');
  if (btn) {
    btn.setAttribute('aria-expanded', String(!closed));
    if (S.lang === 'en') {
      btn.title = closed ? (isMobile ? 'Expand panel' : 'Expand panel (›)') : (isMobile ? 'Collapse panel' : 'Collapse panel (‹)');
    } else {
      btn.title = closed ? (isMobile ? 'ขยายแผง' : 'ขยายแผง (›)') : (isMobile ? 'ย่อแผง' : 'ย่อแผง (‹)');
    }
  }
}

function updateConsoleToggle() {
  const c = $('#console');
  const btn = $('#consoleToggle');
  if (!c || !btn) return;
  const isCol = c.classList.contains('collapsed');
  btn.setAttribute('aria-expanded', String(!isCol));
  if (S.lang === 'en') {
    btn.title = isCol ? 'Expand time controls' : 'Collapse time controls';
  } else {
    btn.title = isCol ? 'ขยายแถบเวลา' : 'ย่อแถบเวลา';
  }
}

/* ── ผูกปุ่มทั้งหมด ────────────────────────────────────────────────── */
function initUI() {
  document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
    const r = $('#rail');
    const isClosed = r.classList.contains('closed');
    const wasActive = b.classList.contains('on');

    if (wasActive && !isClosed && window.innerWidth <= 900) {
      r.classList.add('closed');
      updateRailToggle();
      return;
    }

    document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
    for (const k of ['info', 'tools', 'view', 'sky']) $('#pane-' + k).hidden = (k !== b.dataset.tab);
    if (b.dataset.tab === 'sky' && !$('#skyList')) renderSky();
    r.classList.remove('closed');
    updateRailToggle();
  }));

  const rToggle = $('#railToggle');
  if (rToggle) {
    rToggle.addEventListener('click', () => {
      const r = $('#rail');
      r.classList.toggle('closed');
      updateRailToggle();
    });
  }

  // ปัดขึ้น/ลงบนแถบแท็บเพื่อกาง/ย่อแผงบนมือถือ
  let touchStartY = 0;
  let touchStartX = 0;
  const tabsEl = $('.tabs');
  if (tabsEl) {
    tabsEl.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    tabsEl.addEventListener('touchend', e => {
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX);
      if (Math.abs(deltaY) > 30 && Math.abs(deltaY) > deltaX) {
        const r = $('#rail');
        if (deltaY > 0 && !r.classList.contains('closed')) {
          r.classList.add('closed');
          updateRailToggle();
        } else if (deltaY < 0 && r.classList.contains('closed')) {
          r.classList.remove('closed');
          updateRailToggle();
        }
      }
    }, { passive: true });
  }

  // ปุ่มย่อ/ขยายแถบเวลาบนมือถือ
  const cToggle = $('#consoleToggle');
  if (cToggle) {
    cToggle.addEventListener('click', () => {
      const c = $('#console');
      c.classList.toggle('collapsed');
      updateConsoleToggle();
    });
  }

  updateRailToggle();
  updateConsoleToggle();
  addEventListener('resize', updateRailToggle);
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
// tiny ใช้กับโฟบอสและไดมอสเท่านั้น — สองดวงนี้มีรูปทรงจริงแล้ว (6.20) กล้องเข้าไปได้ใกล้ จึงต้องใหญ่ตาม
const TEXSIZE = { big: [896, 448], mid: [640, 320], small: [512, 256], moon: [320, 160], tiny: [1024, 512] };
const BIG = ['earth', 'jupiter'], MID = ['mars', 'saturn', 'mercury', 'venus'];
const DISC_LON = { earth: (100 + 180) / 360 * 2 * Math.PI };   // แผ่นกลมของโลกหันเอเชียตะวันออกเฉียงใต้เข้าหาผู้ดู

/* q = ตัวหารความละเอียด (4 = ฉบับย่อสำหรับโชว์ก่อน, 1 = ฉบับเต็ม) */
function texSizeOf(id, q) {
  const s = BIG.includes(id) ? TEXSIZE.big : MID.includes(id) ? TEXSIZE.mid : TEXSIZE.small;
  return [Math.max(64, Math.round(s[0] / q)), Math.max(32, Math.round(s[1] / q))];
}

function textureJobs(q) {
  q = q || 1;
  const jobs = [];
  for (const b of BODIES) {
    jobs.push({ label: b.nm, run: () => {
      const [w, h] = texSizeOf(b.id, q);
      b._tex = PAINTERS[b.id](w, h);
      if (b.id === 'earth') b._clouds = PAINTERS.earthClouds(Math.round(384 / q), Math.round(192 / q));
    }});
  }
  const tints = {
    phobos: [128, 116, 104], deimos: [140, 128, 116], rhea: [200, 196, 188],
    titania: [162, 152, 144], oberon: [140, 130, 124], triton: [206, 198, 188], charon: [150, 142, 134]
  };
  for (const m of MOONS) {
    jobs.push({ label: m.nm, run: () => {
      const base = (m.radius < 50 ? TEXSIZE.tiny : TEXSIZE.moon);
      const [w, h] = [Math.max(48, Math.round(base[0] / q)), Math.max(24, Math.round(base[1] / q))];
      m._tex = PAINTERS[m.id]
        ? PAINTERS[m.id](w, h)
        : PAINTERS.rocky(w, h, tints[m.id] || [140, 132, 124], m.radius < 50 ? 150 : 260);
    }});
  }
  jobs.push({ label: { th:'วัตถุขนาดเล็ก', en:'Small bodies' }, run: () => {
    // พื้นผิวร่วมสี่แบบ: หินสว่าง · หินคาร์บอนคล้ำ · น้ำแข็ง · นิวเคลียสดาวหาง
    const R = (w, h, tint, n) => PAINTERS.rocky(Math.max(64, Math.round(w / q)), Math.max(32, Math.round(h / q)), tint, n);
    const shared = {
      rock: R(256, 128, [150, 142, 132], 240),
      dark: R(256, 128, [74, 70, 66], 240),
      ice:  R(256, 128, [206, 200, 192], 170),
      nuc:  R(192, 96, [66, 62, 60], 130)
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

/* วาดฉบับเต็มทับลงผ้าใบเดิม แล้วบอก GPU ให้อัปโหลดใหม่
   (ใช้ผ้าใบใบเดิมเพื่อไม่ต้องไล่เปลี่ยน material ของทุกวัตถุที่ใช้ร่วมกัน) */
function upgradeCanvas(oldCv, newCv, tex) {
  oldCv.width = newCv.width;
  oldCv.height = newCv.height;
  oldCv.getContext('2d').drawImage(newCv, 0, 0);
  if (tex) tex.needsUpdate = true;
}

async function refineTextures() {
  const step = () => yieldToPaint();
  for (const b of BODIES) {
    const [w, h] = texSizeOf(b.id, 1);
    if (b._tex.width >= w) continue;
    upgradeCanvas(b._tex, PAINTERS[b.id](w, h), b._map);
    if (b.id === 'earth' && b._clouds && REG.earth.clouds) {
      upgradeCanvas(b._clouds, PAINTERS.earthClouds(384, 192), REG.earth.clouds.material.map);
    }
    b._disc = discPreview(b._tex, 96, DISC_LON[b.id]);
    b._discURL = b._disc.toDataURL('image/png');
    await step();
  }
  for (const m of MOONS) {
    const base = (m.radius < 50 ? TEXSIZE.tiny : TEXSIZE.moon);
    if (m._tex.width >= base[0]) continue;
    const tints = {
      phobos: [128, 116, 104], deimos: [140, 128, 116], dimorphos: [146, 136, 124],
      rhea: [200, 196, 188],
      titania: [162, 152, 144], oberon: [140, 130, 124], triton: [206, 198, 188], charon: [150, 142, 134]
    };
    const neo = PAINTERS[m.id] ? PAINTERS[m.id](base[0], base[1])
      : PAINTERS.rocky(base[0], base[1], tints[m.id] || [140, 132, 124], m.radius < 50 ? 150 : 260);
    upgradeCanvas(m._tex, neo, m._map);
    m._disc = discPreview(m._tex, 96);
    m._discURL = m._disc.toDataURL('image/png');
    await step();
  }
  // วัตถุขนาดเล็กใช้ผ้าใบร่วมกันสี่ผืน อัปเกรดผ้าใบก็อัปเกรดครบทุกดวงพร้อมกัน
  // 1024×512 เพราะรอบรูปทรงจริง (6.20) กล้องเข้าไปใกล้ผิวก้อนหินได้จริง ๆ แล้ว
  // ของเดิม 256×128 พอแปะบนรูปทรงจริงจะเห็นเป็นบล็อกสี่เหลี่ยมชัดมาก
  const specs = [
    [[1024, 512, [150, 142, 132], 240], s => s.kind === 'asteroid' && lum(s) >= 0.35],
    [[1024, 512, [74, 70, 66], 240],    s => s.kind === 'asteroid' && lum(s) < 0.35],
    [[1024, 512, [206, 200, 192], 170], s => s.kind === 'tno' || s.kind === 'dwarf'],
    [[1024, 512, [66, 62, 60], 130],    s => s.kind === 'comet' || s.kind === 'ism']
  ];
  function lum(s) {
    return ((s.color >> 16 & 255) * 0.3 + (s.color >> 8 & 255) * 0.6 + (s.color & 255) * 0.1) / 255;
  }
  for (const [args, pick] of specs) {
    const one = SMALL.find(pick);
    if (!one || one._tex.width >= args[0]) continue;
    upgradeCanvas(one._tex, PAINTERS.rocky(args[0], args[1], args[2], args[3]), texCache.get(one._tex));
    for (const s of SMALL) if (pick(s)) { s._disc = discPreview(s._tex, 96); s._discURL = s._disc.toDataURL('image/png'); }
    await step();
  }
  if (!$('#pane-info').hidden) renderInfo();
}

function prepareData() {
  for (const b of BODIES) { REG[b.id] = null; ORDER.push(b.id); }
  for (const m of MOONS) ORDER.push(m.id);
  // ฐานพิกัดระนาบศูนย์สูตรของดาวแม่ สำหรับวงโคจรดวงจันทร์
  // วัตถุจิ๋วก็ต้องมีด้วย เพราะดิดีมอสมีดวงจันทร์ของตัวเอง (ไดมอร์ฟอส)
  const bases = {};
  const defById = {};
  for (const b of BODIES) { bases[b.id] = equatorBasis(b.tilt, b.axisNode); defById[b.id] = b; }
  for (const c of CRAFT) {
    ORDER.push(c.id);
    c.radius = c.span / 2000;                  // ครึ่งหนึ่งของขนาดตัวยาน หน่วยกิโลเมตร
    c.tilt = 0; c.axisNode = 0;
  }
  for (const s of SMALL) {
    ORDER.push(s.id);
    s.tilt = s.tilt || 0; s.axisNode = s.axisNode || 0;     // ดิดีมอสตั้งขั้วหมุนจริงไว้ใน data.js
    bases[s.id] = equatorBasis(s.tilt, s.axisNode);
    defById[s.id] = s;
    // ระยะมองที่ควรเห็นวัตถุนี้: อ้างจากขนาดวงโคจร (ไฮเพอร์โบลาใช้ระยะใกล้สุด)
    s._ref = (s.el.e < 1 ? s.aAU : s.q) * AU;
  }
  farPrepare();
  let seed = 1;
  for (const m of MOONS) {
    m._basis = bases[m.parent];
    m._phase = (seed = (seed * 9301 + 49297) % 233280) / 233280 * 6.283;
    m.kind = 'moon';
    m.rotH = m.period * 24;                 // ดวงจันทร์เหล่านี้หันด้านเดิมเข้าหาดาวแม่
    // บริวารปกติหมุนรอบแกนที่เกือบตรงกับขั้วของดาวแม่ ไม่ใช่ขั้วของสุริยวิถี — แต่ดวงจันทร์ของโลก
    // เอียงจากสุริยวิถีแค่ 1.5° และไทรทันโคจรสวนทาง จึงใส่ธงเฉพาะดวงที่ขั้วตามดาวแม่จริง ๆ
    const par = m.poleFromParent ? defById[m.parent] : null;
    m.tilt = par ? (par.tilt || 0) : (m.tilt || 0);
    m.axisNode = par ? (par.axisNode || 0) : (m.axisNode || 0);
    m.glow = '#' + m.color.toString(16).padStart(6, '0');
  }
}

function buildAll() {
  for (const b of BODIES) {
    REG[b.id] = makeBody(b, false);
    b._disc = discPreview(b._tex, 96, DISC_LON[b.id]);
    b._discURL = b._disc.toDataURL('image/png');
    if (b.id !== 'sun') { orbitLine(REG[b.id]); trailLine(REG[b.id]); }
  }
  for (const c of CRAFT) {
    REG[c.id] = makeCraft(c);
    c._disc = craftDisc(c.color, 96);
    c._discURL = c._disc.toDataURL('image/png');
    if (c.special !== 'l2') {                  // ลำที่อยู่ L2 ไม่วาดวงโคจร เพราะมันเกาะไปกับโลก
      orbitLine(REG[c.id]);
      REG[c.id].line.material.opacity = c.powered ? 0.2 : 0.34;
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
  for (const f of FAR) {
    REG[f.id] = makeFar(f);
    farRecs.push(REG[f.id]);
    f._disc = farDisc(f, 96);
    f._discURL = f._disc.toDataURL('image/png');
  }
  updatePositions(S.time);
  setupShadows();
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
  if (hostSky) hostSky.visible = false;        // เปิดใหม่เฉพาะเฟรมที่หลุมดำนอกกาแล็กซีโผล่อยู่
  updateScene();
  updateTrails();
  applyCamera();
  resetLabelBoxes();
  updateLabels();
  reserveFarImages();
  updateGalaxyMarks();
  updateFarLabels();
  updateSkyLabels();
  updateDeep();
  updateExo();
  renderFrame();

  // หลุมดำเคอร์กินแรงมาก — เฟรมตกก็ลดจำนวนก้าวของการเดินรังสี ยังลื่นก็เพิ่มคืน
  if (bhBusy) {
    // เฟรมที่ยาวเพราะแท็บถูกหน่วง (ซ่อนอยู่ · สลับหน้าต่าง) ไม่ได้แปลว่าการ์ดจอทำไม่ไหว จึงไม่นับ
    // และขยับทีละน้อย เพราะงบหลักมาจากพื้นที่บนจอซึ่งแม่นกว่าอยู่แล้ว
    if (!document.hidden && dt < 0.09 && bhCamStill < 4) {
      if (dt > 0.045) bhBias = Math.max(0.3, bhBias - 0.04);
      else if (dt < 0.022) bhBias = Math.min(1.6, bhBias + 0.015);
    }
    bhBusy = false;
  }

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
  const bh = bhRender();              // ต้องทำก่อน เพราะสลับเป้าหมายการวาดชั่วคราว
  renderer.clear();
  if (deepFade > 0.01) renderer.render(deepScene, deepCam);
  if (galFade > 0.01) renderer.render(galScene, galCam);
  if (starFade > 0.01) renderer.render(skyScene, skyCam);
  if (starFadeR > 0.01) renderer.render(starScene, starCam);
  renderer.clearDepth();
  renderer.render(scene, camera);
  if (bh) bhComposite();              // ซ้อนหลุมดำ + แสงฟุ้งทับภาพที่วาดเสร็จแล้ว
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
  const jobs = textureJobs(4);      // รอบแรกวาดฉบับย่อ ให้ฉากขึ้นเร็วที่สุด
  for (let i = 0; i < jobs.length; i++) {
    await step(i, jobs.length, jobs[i].label[S.lang]);
    jobs[i].run();
  }
  txt.textContent = S.lang === 'th' ? 'กำลังประกอบฉาก' : 'Assembling scene';
  bar.style.width = '100%';
  await yieldToPaint();

  buildAll();
  buildLabels();
  buildStarLabels();
  buildConsLabels();
  initControls();
  initUI();
  applyLang();
  camState.dist = defaultDist(S.focus);
  setFocus(S.focus, true);
  if (hashDist) camState.dist = Math.max(focusRadius(S.focus) * 1.22, Math.min(MAX_DIST, hashDist));
  syncConsole();
  // คอมไพล์เชเดอร์ของทุกฉากไว้ก่อน (รวมวัตถุที่ยังซ่อนอยู่) — ไม่งั้นจะไปค้างตอนซูมออกไปดูกาแล็กซีหรือบินไปหาหลุมดำครั้งแรก
  txt.textContent = S.lang === 'th' ? 'กำลังเตรียมกราฟิก' : 'Preparing graphics';
  applyCamera();
  for (const [sc, cam] of [[scene, camera], [skyScene, skyCam], [starScene, starCam], [galScene, galCam], [deepScene, deepCam]]) {
    await yieldToPaint();
    renderer.compile(sc, cam);
  }
  // วาดมุมมองทั้งกาแล็กซีหนึ่งเฟรมไว้ใต้หน้าโหลด พื้นผิวของฉากไกลจะขึ้นการ์ดจอไว้ก่อน แล้วค่อยคืนกล้อง
  {
    const keep = [camState.dist, camState.az, camState.el];
    camState.dist = 125000 * LY; camState.az = Math.PI; camState.el = 0.9;
    updateOrigin(0); updateScene(); applyCamera(); updateDeep(); renderFrame();
    [camState.dist, camState.az, camState.el] = keep;
    updateOrigin(0); updateScene(); applyCamera(); updateDeep();
    await yieldToPaint();
  }
  requestAnimationFrame(loop);
  setTimeout(() => { $('#loading').classList.add('gone'); }, 220);
  setTimeout(() => { $('#loading').remove(); }, 1200);
  // ฉากขึ้นแล้ว — ค่อยวาดพื้นผิวฉบับเต็มทับทีละผืนอยู่เบื้องหลัง
  setTimeout(() => { refineTextures(); }, 400);
  setTimeout(() => { const h = $('#hint'); if (h) h.style.opacity = '0'; }, 9000);
}

if (typeof THREE === 'undefined') {
  $('#loadTxt').textContent = 'ไม่สามารถโหลด three.js ได้ — ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
} else {
  boot();
}
