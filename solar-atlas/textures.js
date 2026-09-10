/* ══════════════════════════════════════════════════════════════════════
   textures.js — พื้นผิวทุกชิ้นในแผนที่นี้ถูก "วาดด้วยโค้ด" ตอนเปิดหน้าเว็บ
   ไม่มีไฟล์ภาพ ไม่มีภาพถ่ายจากที่ใด จึงไม่มีประเด็นลิขสิทธิ์ภาพเลย
   วิธีทำ: Perlin noise 3 มิติ สุ่มค่าบนทิศทางของจุดบนผิวทรงกลม
   (ทำให้ไม่มีรอยต่อและไม่บิดเบี้ยวที่ขั้ว) แล้วระบายสีตามสูตรของแต่ละดวง
   ══════════════════════════════════════════════════════════════════════ */
'use strict';

/* ── Perlin noise 3 มิติ ───────────────────────────────────────────── */
const PERM = new Uint8Array(512);
(function seedPerm(seed) {
  let s = seed >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 4294967296);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = (rnd() * (i + 1)) | 0, t = p[i]; p[i] = p[j]; p[j] = t; }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
})(20260910);

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a, b, t) { return a + (b - a) * t; }
function grad3(h, x, y, z) {
  h &= 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}
function noise3(x, y, z) {
  const fx = Math.floor(x), fy = Math.floor(y), fz = Math.floor(z);
  const X = fx & 255, Y = fy & 255, Z = fz & 255;
  x -= fx; y -= fy; z -= fz;
  const u = fade(x), v = fade(y), w = fade(z);
  const A = PERM[X] + Y, AA = PERM[A & 255] + Z, AB = PERM[(A + 1) & 255] + Z;
  const B = PERM[(X + 1) & 255] + Y, BA = PERM[B & 255] + Z, BB = PERM[(B + 1) & 255] + Z;
  return lerp(
    lerp(lerp(grad3(PERM[AA & 255], x, y, z), grad3(PERM[BA & 255], x - 1, y, z), u),
         lerp(grad3(PERM[AB & 255], x, y - 1, z), grad3(PERM[BB & 255], x - 1, y - 1, z), u), v),
    lerp(lerp(grad3(PERM[(AA + 1) & 255], x, y, z - 1), grad3(PERM[(BA + 1) & 255], x - 1, y, z - 1), u),
         lerp(grad3(PERM[(AB + 1) & 255], x, y - 1, z - 1), grad3(PERM[(BB + 1) & 255], x - 1, y - 1, z - 1), u), v), w);
}
/* งบเวลา: อ็อกเทฟสุดท้ายมักละเอียดกว่าขนาดพิกเซลของแผนที่ที่เราสร้าง
   ตัดออกหนึ่งชั้นจึงเร็วขึ้นราวหนึ่งในสี่โดยแทบไม่เห็นความต่าง */
const OCT_TRIM = 1;
function fbm(x, y, z, oct, gain) {
  gain = gain || 0.5;
  oct = oct > 2 ? oct - OCT_TRIM : oct;
  let a = 1, f = 1, sum = 0, norm = 0;
  for (let i = 0; i < oct; i++) { sum += a * noise3(x * f, y * f, z * f); norm += a; a *= gain; f *= 2; }
  return sum / norm;
}
function ridge(x, y, z, oct) {
  oct = oct > 2 ? oct - OCT_TRIM : oct;
  let a = 1, f = 1, sum = 0, norm = 0;
  for (let i = 0; i < oct; i++) { sum += a * (1 - Math.abs(noise3(x * f, y * f, z * f))); norm += a; a *= 0.5; f *= 2; }
  return sum / norm;
}

/* ── ตัวช่วยสี ─────────────────────────────────────────────────────── */
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (a, b, t) => { t = clamp01((t - a) / (b - a)); return t * t * (3 - 2 * t); };
function mix(c1, c2, t, out) {
  t = clamp01(t);
  out[0] = c1[0] + (c2[0] - c1[0]) * t;
  out[1] = c1[1] + (c2[1] - c1[1]) * t;
  out[2] = c1[2] + (c2[2] - c1[2]) * t;
  return out;
}
const rgb = (r, g, b) => [r, g, b];

/* ── ระบายผิวทรงกลมแบบ equirectangular ─────────────────────────────── */
function paintSphere(w, h, fn) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const col = [0, 0, 0];
  for (let j = 0; j < h; j++) {
    const lat = (0.5 - (j + 0.5) / h) * Math.PI;
    const cl = Math.cos(lat), sl = Math.sin(lat);
    for (let i = 0; i < w; i++) {
      const lon = ((i + 0.5) / w) * 2 * Math.PI;
      fn(col, cl * Math.cos(lon), sl, cl * Math.sin(lon), lat, lon);
      const k = (j * w + i) << 2;
      d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; d[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

/* ── หลุมอุกกาบาต: วาดทับหลังระบายสีพื้น ───────────────────────────── */
function drawCraters(cv, count, opts) {
  opts = opts || {};
  const ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
  const rimLight = opts.rim || 'rgba(255,255,255,.20)';
  const floor = opts.floor || 'rgba(0,0,0,.34)';
  let s = opts.seed || 7;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff), s / 0x7fffffff);
  for (let n = 0; n < count; n++) {
    const lat = Math.asin(rnd() * 2 - 1);
    const lon = rnd() * 2 * Math.PI;
    const p = rnd();
    const rr = (opts.min || 0.004) + Math.pow(p, 3.2) * (opts.max || 0.055);   // การกระจายแบบกฎยกกำลัง
    const rp = rr * h;
    const stretch = Math.min(6, 1 / Math.max(0.16, Math.cos(lat)));
    const cx = (lon / (2 * Math.PI)) * w, cy = (0.5 - lat / Math.PI) * h;
    for (const off of [-w, 0, w]) {                       // ทำซ้ำสองข้างเพื่อไม่ให้ขาดตรงรอยต่อ
      if (Math.abs(cx + off - w / 2) > w / 2 + rp * stretch) continue;
      ctx.save();
      ctx.translate(cx + off, cy);
      ctx.scale(stretch, 1);
      const g = ctx.createRadialGradient(0, 0, rp * 0.1, 0, 0, rp);
      g.addColorStop(0, floor);
      g.addColorStop(0.62, 'rgba(0,0,0,.10)');
      g.addColorStop(0.86, rimLight);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, rp, 0, 6.2832); ctx.fill();
      ctx.restore();
    }
  }
  return cv;
}

/* ── ผู้ระบายสีของแต่ละดวง ─────────────────────────────────────────── */
const PAINTERS = {

  sun(w, h) {
    const hot = rgb(255, 246, 214), warm = rgb(255, 178, 62), deep = rgb(226, 110, 26);
    const t = [0, 0, 0];
    return paintSphere(w, h, (c, x, y, z) => {
      const gran = fbm(x * 26, y * 26, z * 26, 4);
      const cell = ridge(x * 9, y * 9, z * 9, 3);
      const spot = fbm(x * 3.2 + 11, y * 3.2, z * 3.2, 3);
      let v = 0.52 + gran * 0.30 + cell * 0.24;
      if (spot < -0.30) v -= smooth(-0.30, -0.58, spot) * 0.16;   // จุดมืดจาง ๆ บนผิว
      v = clamp01(v);
      mix(deep, warm, smooth(0.15, 0.62, v), t);
      mix(t, hot, smooth(0.62, 0.95, v), c);
    });
  },

  mercury(w, h) {
    const dark = rgb(74, 70, 66), mid = rgb(126, 120, 112), lite = rgb(176, 169, 158);
    const t = [0, 0, 0];
    const cv = paintSphere(w, h, (c, x, y, z) => {
      const base = fbm(x * 2.6, y * 2.6, z * 2.6, 5);
      const fine = fbm(x * 12 + 4, y * 12, z * 12, 4);
      const v = 0.5 + base * 0.34 + fine * 0.16;
      mix(dark, mid, smooth(0.18, 0.58, v), t);
      mix(t, lite, smooth(0.58, 0.92, v), c);
    });
    return drawCraters(cv, 520, { seed: 3, max: 0.06 });
  },

  venus(w, h) {
    const deep = rgb(176, 132, 56), mid = rgb(224, 186, 106), pale = rgb(246, 228, 176);
    const t = [0, 0, 0];
    return paintSphere(w, h, (c, x, y, z, lat) => {
      const warp = fbm(x * 1.8, y * 3.4, z * 1.8, 4) * 0.55;
      const band = Math.sin((lat + warp) * 7.5) * 0.5 + 0.5;
      const swirl = fbm(x * 4.4 + 9, y * 8.5, z * 4.4, 5);
      const v = 0.42 + band * 0.26 + swirl * 0.30;
      mix(deep, mid, smooth(0.15, 0.55, v), t);
      mix(t, pale, smooth(0.55, 0.95, v), c);
    });
  },

  earth(w, h) {
    const abyss = rgb(6, 26, 58), sea = rgb(18, 68, 122), shelf = rgb(40, 116, 156);
    const sand = rgb(196, 172, 122), grass = rgb(74, 112, 62), forest = rgb(44, 82, 48),
          rock = rgb(126, 112, 96), snow = rgb(238, 242, 246);
    const t = [0, 0, 0], t2 = [0, 0, 0];
    return paintSphere(w, h, (c, x, y, z, lat) => {
      const cont = fbm(x * 1.55, y * 1.55, z * 1.55, 6, 0.52);
      const detail = fbm(x * 6.5 + 3, y * 6.5, z * 6.5, 4) * 0.22;
      const e = cont + detail;
      const al = Math.abs(lat);
      if (e < 0.035) {                                    // ทะเล
        const d = smooth(-0.45, 0.035, e);
        mix(abyss, sea, d, t);
        mix(t, shelf, smooth(0.72, 1, d), c);
      } else {                                            // แผ่นดิน
        const dry = smooth(0.22, 0.62, Math.abs(Math.sin(lat * 2.9)) + fbm(x * 3 + 7, y * 3, z * 3, 3) * 0.45);
        mix(forest, grass, dry * 0.6, t);
        mix(t, sand, smooth(0.42, 0.9, dry), t2);
        mix(t2, rock, smooth(0.16, 0.34, e), c);
      }
      const ice = smooth(1.07, 1.30, al + fbm(x * 7, y * 7, z * 7, 3) * 0.16);
      if (ice > 0) mix(c, snow, ice, c);
    });
  },

  earthClouds(w, h) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(w, h), d = img.data;
    for (let j = 0; j < h; j++) {
      const lat = (0.5 - (j + 0.5) / h) * Math.PI;
      const cl = Math.cos(lat), sl = Math.sin(lat);
      const zone = 0.5 + 0.5 * Math.cos(lat * 6.1);        // แถบเมฆตามละติจูด
      for (let i = 0; i < w; i++) {
        const lon = ((i + 0.5) / w) * 2 * Math.PI;
        const x = cl * Math.cos(lon), y = sl, z = cl * Math.sin(lon);
        const warp = fbm(x * 1.6, y * 3.2, z * 1.6, 3) * 0.5;
        const n = fbm(x * 3.4 + warp, y * 5.6, z * 3.4, 5, 0.55);
        const a = smooth(0.02, 0.42, n * 0.75 + zone * 0.34 - 0.16);
        const k = (j * w + i) << 2;
        d[k] = d[k + 1] = d[k + 2] = 255;
        d[k + 3] = a * 235;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cv;
  },

  mars(w, h) {
    const dark = rgb(96, 58, 42), rust = rgb(158, 84, 54), ochre = rgb(196, 122, 78),
          pale = rgb(222, 168, 122), ice = rgb(236, 238, 240);
    const t = [0, 0, 0];
    const cv = paintSphere(w, h, (c, x, y, z, lat) => {
      const region = fbm(x * 1.9, y * 1.9, z * 1.9, 5);
      const fine = fbm(x * 9 + 6, y * 9, z * 9, 4);
      let v = 0.5 + region * 0.36 + fine * 0.18;
      mix(rust, ochre, smooth(0.28, 0.62, v), t);
      mix(t, pale, smooth(0.62, 0.95, v), c);
      if (region < -0.16) mix(c, dark, smooth(-0.16, -0.42, region) * 0.85, c);   // เขตอัลบีโดคล้ำ
      const cap = smooth(1.24, 1.42, Math.abs(lat) + fbm(x * 8, y * 8, z * 8, 3) * 0.13);
      if (cap > 0) mix(c, ice, cap, c);
    });
    // ร่องหุบเหวยาวใกล้เส้นศูนย์สูตร
    const ctx = cv.getContext('2d');
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = 'rgba(58,32,22,.9)';
    ctx.lineWidth = cv.height * 0.022;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cv.width * 0.30, cv.height * 0.545);
    ctx.bezierCurveTo(cv.width * 0.38, cv.height * 0.52, cv.width * 0.46, cv.height * 0.575, cv.width * 0.54, cv.height * 0.55);
    ctx.stroke();
    ctx.restore();
    return drawCraters(cv, 300, { seed: 11, max: 0.045, floor: 'rgba(40,20,12,.30)', rim: 'rgba(255,210,170,.16)' });
  },

  jupiter(w, h) {
    const belts = [
      [-1.57, rgb(150, 132, 118)], [-1.05, rgb(198, 168, 138)], [-0.72, rgb(158, 116, 86)],
      [-0.42, rgb(226, 202, 172)], [-0.20, rgb(176, 122, 86)], [0.02, rgb(232, 210, 180)],
      [0.22, rgb(168, 118, 84)], [0.46, rgb(224, 200, 168)], [0.78, rgb(150, 112, 88)],
      [1.10, rgb(196, 176, 156)], [1.57, rgb(142, 126, 116)]
    ];
    const t = [0, 0, 0];
    const cv = paintSphere(w, h, (c, x, y, z, lat) => {
      const warp = fbm(x * 2.1, y * 5.0, z * 2.1, 5) * 0.16 + fbm(x * 6 + 3, y * 14, z * 6, 3) * 0.045;
      const L = Math.max(-1.5699, Math.min(1.5699, lat + warp));
      let i = 0;
      while (i < belts.length - 2 && belts[i + 1][0] < L) i++;
      const a = belts[i], b = belts[i + 1];
      mix(a[1], b[1], smooth(a[0], b[0], L), t);
      const streak = fbm(x * 8, y * 42, z * 8, 3) * 0.09 + 1;
      c[0] = t[0] * streak; c[1] = t[1] * streak; c[2] = t[2] * streak;
    });
    // จุดแดงใหญ่
    const ctx = cv.getContext('2d');
    const cx = w * 0.62, cy = h * (0.5 + 0.20 / Math.PI * 2), rx = w * 0.085, ry = h * 0.062;
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, rx * 0.15, 0, 0, rx);
    g.addColorStop(0, 'rgba(196,86,52,.95)');
    g.addColorStop(0.55, 'rgba(178,92,58,.75)');
    g.addColorStop(0.85, 'rgba(206,158,120,.42)');
    g.addColorStop(1, 'rgba(206,180,150,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, rx, 0, 6.2832); ctx.fill();
    ctx.restore();
    return cv;
  },

  saturn(w, h) {
    const belts = [
      [-1.57, rgb(176, 154, 118)], [-0.95, rgb(214, 190, 146)], [-0.55, rgb(232, 212, 168)],
      [-0.18, rgb(244, 226, 184)], [0.18, rgb(236, 214, 168)], [0.60, rgb(220, 196, 150)],
      [1.05, rgb(196, 176, 140)], [1.57, rgb(158, 148, 132)]
    ];
    const t = [0, 0, 0];
    return paintSphere(w, h, (c, x, y, z, lat) => {
      const warp = fbm(x * 1.9, y * 4.4, z * 1.9, 4) * 0.11;
      const L = Math.max(-1.5699, Math.min(1.5699, lat + warp));
      let i = 0;
      while (i < belts.length - 2 && belts[i + 1][0] < L) i++;
      const a = belts[i], b = belts[i + 1];
      mix(a[1], b[1], smooth(a[0], b[0], L), t);
      const streak = fbm(x * 7, y * 34, z * 7, 3) * 0.055 + 1;
      c[0] = t[0] * streak; c[1] = t[1] * streak; c[2] = t[2] * streak;
    });
  },

  uranus(w, h) {
    const a = rgb(140, 196, 206), b = rgb(186, 226, 230);
    return paintSphere(w, h, (c, x, y, z, lat) => {
      const band = Math.sin(lat * 5 + fbm(x * 2, y * 4, z * 2, 3) * 0.5) * 0.5 + 0.5;
      const n = fbm(x * 3.5, y * 7, z * 3.5, 4);
      mix(a, b, clamp01(0.42 + band * 0.22 + n * 0.24), c);
    });
  },

  neptune(w, h) {
    const deep = rgb(36, 62, 148), mid = rgb(62, 96, 190), pale = rgb(126, 158, 226);
    const t = [0, 0, 0];
    const cv = paintSphere(w, h, (c, x, y, z, lat) => {
      const band = Math.sin(lat * 6 + fbm(x * 2.2, y * 4.4, z * 2.2, 4) * 0.6) * 0.5 + 0.5;
      const n = fbm(x * 4, y * 9, z * 4, 5);
      const v = 0.40 + band * 0.24 + n * 0.30;
      mix(deep, mid, smooth(0.12, 0.58, v), t);
      mix(t, pale, smooth(0.62, 0.96, v), c);
    });
    const ctx = cv.getContext('2d');
    ctx.save();
    ctx.translate(w * 0.36, h * 0.62); ctx.scale(1.7, 1);
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, h * 0.075);
    g.addColorStop(0, 'rgba(16,32,96,.80)');
    g.addColorStop(1, 'rgba(16,32,96,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, h * 0.075, 0, 6.2832); ctx.fill();
    ctx.restore();
    return cv;
  },

  pluto(w, h) {
    const dark = rgb(78, 62, 54), mid = rgb(140, 118, 100), tan = rgb(196, 172, 142);

    const t = [0, 0, 0];
    const cv = paintSphere(w, h, (c, x, y, z) => {
      const region = fbm(x * 2.4, y * 2.4, z * 2.4, 5);
      const fine = fbm(x * 10 + 2, y * 10, z * 10, 4);
      const v = 0.5 + region * 0.38 + fine * 0.16;
      mix(dark, mid, smooth(0.16, 0.52, v), t);
      mix(t, tan, smooth(0.52, 0.9, v), c);
    });
    const ctx = cv.getContext('2d');   // ที่ราบน้ำแข็งสว่าง
    ctx.save();
    ctx.translate(w * 0.55, h * 0.56); ctx.scale(1.35, 1);
    const g = ctx.createRadialGradient(0, 0, h * 0.03, 0, 0, h * 0.20);
    g.addColorStop(0, 'rgba(240,234,220,.95)');
    g.addColorStop(0.7, 'rgba(232,224,206,.62)');
    g.addColorStop(1, 'rgba(232,224,206,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, h * 0.20, 0, 6.2832); ctx.fill();
    ctx.restore();
    return cv;
  },

  /* ── ดวงจันทร์ ─────────────────────────────────────────────────── */
  moon(w, h) {
    const dark = rgb(58, 56, 54), mid = rgb(122, 118, 112), lite = rgb(186, 182, 174);
    const t = [0, 0, 0];
    const cv = paintSphere(w, h, (c, x, y, z) => {
      const maria = fbm(x * 1.7, y * 1.7, z * 1.7, 4);
      const fine = fbm(x * 11 + 5, y * 11, z * 11, 4);
      let v = 0.52 + fine * 0.20;
      if (maria < -0.05) v -= smooth(-0.05, -0.40, maria) * 0.34;
      mix(dark, mid, smooth(0.10, 0.50, v), t);
      mix(t, lite, smooth(0.50, 0.86, v), c);
    });
    return drawCraters(cv, 420, { seed: 21, max: 0.055 });
  },

  io(w, h) {
    const dark = rgb(126, 88, 34), mid = rgb(216, 176, 74), lite = rgb(244, 226, 152);
    const t = [0, 0, 0];
    return paintSphere(w, h, (c, x, y, z) => {
      const n = fbm(x * 3.2, y * 3.2, z * 3.2, 5);
      const spot = fbm(x * 9 + 3, y * 9, z * 9, 3);
      const v = 0.5 + n * 0.32 + spot * 0.2;
      mix(dark, mid, smooth(0.18, 0.55, v), t);
      mix(t, lite, smooth(0.58, 0.92, v), c);
      if (spot < -0.42) mix(c, rgb(52, 34, 22), smooth(-0.42, -0.62, spot), c);
    });
  },

  europa(w, h) {
    const base = rgb(214, 208, 196), lite = rgb(240, 238, 232);
    const cv = paintSphere(w, h, (c, x, y, z) => {
      const n = fbm(x * 5, y * 5, z * 5, 4);
      mix(base, lite, clamp01(0.5 + n * 0.5), c);
    });
    const ctx = cv.getContext('2d');    // รอยแตกสีสนิม
    let s = 5;
    const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff), s / 0x7fffffff);
    ctx.lineCap = 'round';
    for (let i = 0; i < 44; i++) {
      ctx.beginPath();
      let x = rnd() * w, y = rnd() * h, ang = rnd() * 6.28;
      ctx.moveTo(x, y);
      for (let k = 0; k < 14; k++) {
        ang += (rnd() - 0.5) * 0.55;
        x += Math.cos(ang) * w * 0.035; y += Math.sin(ang) * h * 0.022;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rnd() > 0.4 ? 'rgba(150,96,66,.42)' : 'rgba(120,110,104,.34)';
      ctx.lineWidth = 0.6 + rnd() * 2.4;
      ctx.stroke();
    }
    return cv;
  },

  ganymede(w, h) {
    const dark = rgb(84, 78, 72), mid = rgb(140, 134, 126), lite = rgb(190, 186, 178);
    const t = [0, 0, 0];
    const cv = paintSphere(w, h, (c, x, y, z) => {
      const region = fbm(x * 2.1, y * 2.1, z * 2.1, 4);
      const groove = ridge(x * 14, y * 6, z * 14, 3);
      let v = 0.48 + region * 0.30 + groove * 0.20;
      mix(dark, mid, smooth(0.16, 0.54, v), t);
      mix(t, lite, smooth(0.54, 0.88, v), c);
    });
    return drawCraters(cv, 200, { seed: 33, max: 0.035 });
  },

  callisto(w, h) {
    const dark = rgb(52, 44, 38), mid = rgb(104, 92, 80), lite = rgb(152, 140, 126);
    const t = [0, 0, 0];
    const cv = paintSphere(w, h, (c, x, y, z) => {
      const n = fbm(x * 3, y * 3, z * 3, 5);
      const v = 0.48 + n * 0.36;
      mix(dark, mid, smooth(0.14, 0.52, v), t);
      mix(t, lite, smooth(0.52, 0.9, v), c);
    });
    return drawCraters(cv, 700, { seed: 44, max: 0.05, rim: 'rgba(255,246,230,.26)' });
  },

  titan(w, h) {
    const deep = rgb(158, 96, 26), mid = rgb(206, 148, 60), pale = rgb(232, 190, 112);
    const t = [0, 0, 0];
    return paintSphere(w, h, (c, x, y, z, lat) => {
      const n = fbm(x * 2.6, y * 4.2, z * 2.6, 4);
      const haze = 0.5 + 0.5 * Math.cos(lat * 2.2);
      const v = 0.44 + n * 0.22 + haze * 0.22;
      mix(deep, mid, smooth(0.2, 0.6, v), t);
      mix(t, pale, smooth(0.6, 0.95, v), c);
    });
  },

  enceladus(w, h) {
    const base = rgb(226, 232, 238), lite = rgb(248, 250, 252);
    const cv = paintSphere(w, h, (c, x, y, z) => {
      const n = ridge(x * 9, y * 9, z * 9, 4);
      mix(base, lite, clamp01(n * 1.1), c);
    });
    return drawCraters(cv, 90, { seed: 55, max: 0.03, floor: 'rgba(120,140,160,.22)' });
  },

  /* หินและน้ำแข็งทั่วไป — ใช้กับดวงจันทร์ที่เหลือ */
  rocky(w, h, tint, craterCount) {
    const base = tint || rgb(140, 132, 124);
    const dark = rgb(base[0] * 0.42, base[1] * 0.42, base[2] * 0.42);
    const lite = rgb(Math.min(255, base[0] * 1.34), Math.min(255, base[1] * 1.34), Math.min(255, base[2] * 1.34));
    const t = [0, 0, 0];
    const cv = paintSphere(w, h, (c, x, y, z) => {
      const n = fbm(x * 3.4, y * 3.4, z * 3.4, 5);
      const f = fbm(x * 12 + 8, y * 12, z * 12, 3);
      const v = 0.5 + n * 0.32 + f * 0.18;
      mix(dark, base, smooth(0.15, 0.55, v), t);
      mix(t, lite, smooth(0.55, 0.92, v), c);
    });
    return drawCraters(cv, craterCount == null ? 260 : craterCount, { seed: 66 + (tint ? tint[0] : 0), max: 0.05 });
  }
};

/* ── วงแหวน: แถบ 1 มิติ ตามระยะจากศูนย์กลาง มีช่องว่างจริงของดาวเสาร์ ── */
function ringTexture(width, gaps, baseCol) {
  const cv = document.createElement('canvas');
  cv.width = width; cv.height = 1;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(width, 1), d = img.data;
  for (let i = 0; i < width; i++) {
    const u = i / (width - 1);
    let a = 0.86;
    // ความหนาแน่นย่อยจากคลื่นรบกวน
    a *= 0.55 + 0.45 * (fbm(u * 60, 3.1, 7.7, 4) * 0.5 + 0.5);
    a *= smooth(0, 0.05, u) * (1 - smooth(0.93, 1, u));
    for (const g of gaps) {
      const gc = (u - g[0]) / g[1];
      if (Math.abs(gc) < 1) a *= 0.06 + 0.94 * smooth(0.55, 1, Math.abs(gc));
    }
    const shade = 0.72 + 0.28 * (fbm(u * 22 + 4, 1.3, 2.2, 3) * 0.5 + 0.5);
    const k = i << 2;
    d[k] = baseCol[0] * shade; d[k + 1] = baseCol[1] * shade; d[k + 2] = baseCol[2] * shade;
    d[k + 3] = clamp01(a) * 255;
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

/* ── สไปรต์: แสงเรืองของดวงอาทิตย์ และจุดดาว ───────────────────────── */
function glowTexture(stops, size) {
  size = size || 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const s of stops) g.addColorStop(s[0], s[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return cv;
}

/* ── แผ่นกลมเล็กสำหรับแผงข้อมูล: ฉายผิวลงทรงกลมพร้อมแสงเงา ────────── */
function discPreview(srcCanvas, size) {
  size = size || 96;
  const src = srcCanvas.getContext('2d').getImageData(0, 0, srcCanvas.width, srcCanvas.height).data;
  const sw = srcCanvas.width, sh = srcCanvas.height;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(size, size), d = img.data;
  const R = size / 2 - 1;
  const lx = -0.42, ly = 0.42, lz = 0.80;                 // ทิศแสงจากซ้ายบน
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const nx = (i - size / 2 + 0.5) / R, ny = (size / 2 - j - 0.5) / R;
      const k = (j * size + i) << 2;
      const r2 = nx * nx + ny * ny;
      if (r2 > 1) { d[k + 3] = 0; continue; }
      const nz = Math.sqrt(1 - r2);
      const lat = Math.asin(Math.max(-1, Math.min(1, ny)));
      const lon = Math.atan2(nx, nz) * 0.5 + 0.9;
      const sx = Math.min(sw - 1, Math.max(0, Math.floor(((lon / (2 * Math.PI)) % 1 + 1) % 1 * sw)));
      const sy = Math.min(sh - 1, Math.max(0, Math.floor((0.5 - lat / Math.PI) * sh)));
      const s = (sy * sw + sx) << 2;
      const diff = Math.max(0.08, nx * lx + ny * ly + nz * lz);
      const edge = 1 - smooth(0.88, 1, Math.sqrt(r2)) * 0.5;
      d[k] = src[s] * diff * edge;
      d[k + 1] = src[s + 1] * diff * edge;
      d[k + 2] = src[s + 2] * diff * edge;
      d[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}
