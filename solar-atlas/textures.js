/* ══════════════════════════════════════════════════════════════════════
   textures.js — พื้นผิวทุกชิ้นในแผนที่นี้ถูก "วาดด้วยโค้ด" ตอนเปิดหน้าเว็บ
   ไม่มีไฟล์ภาพ ไม่มีภาพถ่ายจากที่ใด จึงไม่มีประเด็นลิขสิทธิ์ภาพเลย
   วิธีทำ: Perlin noise 3 มิติ สุ่มค่าบนทิศทางของจุดบนผิวทรงกลม
   (ทำให้ไม่มีรอยต่อและไม่บิดเบี้ยวที่ขั้ว) แล้วระบายสีตามสูตรของแต่ละดวง
   ยกเว้นโลก ที่รูปทวีปมาจากเส้นขอบแผ่นดิน Natural Earth (earth-land.js · สาธารณสมบัติ)
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

/* ══ แผนที่โลก ═══════════════════════════════════════════════════════════
   รูปทวีปมาจาก earth-land.js (Natural Earth · สาธารณสมบัติ) ส่วนข้างล่างนี้เป็นภูมิศาสตร์
   ที่ลงไว้ด้วยมืออย่างหยาบ ๆ พอให้สีของผืนดินอยู่ถูกที่: ทะเลทรายเป็นทราย ป่าฝนเป็นเขียวเข้ม
   ภูเขามีหิมะ — ทุกพิกัดเป็นองศา [ลองจิจูด, ละติจูด] ตะวันออกและเหนือเป็นบวก            */

/* ทะเลสาบใหญ่ที่เส้นขอบแผ่นดินมาตราส่วนนี้ไม่ได้เจาะไว้ (โครงร่างโดยประมาณ) */
const EARTH_LAKES = [
  [-92, 46.7, -90, 46.6, -87.5, 46.5, -84.8, 46.5, -84.6, 47, -85, 47.9, -86.5, 48.7, -88.5, 48.4, -89.6, 48, -90.8, 47.3],        // สุพีเรีย
  [-87.5, 41.7, -86.6, 41.9, -86.2, 43, -86.5, 44.2, -85.6, 45.2, -84.8, 45.8, -85.5, 46, -86.6, 45.8, -87.6, 45.1, -87.8, 44, -87.9, 42.5], // มิชิแกน
  [-82.4, 43, -82.6, 44, -83.9, 43.7, -83.3, 44.3, -83.4, 45, -84.6, 45.8, -84, 46.2, -82.5, 46.1, -80.7, 45.9, -79.9, 45.2,
   -80.2, 44.6, -81.6, 45.2, -81.7, 44.3, -81.7, 43.4],                                                                            // ฮูรอน
  [-83.5, 41.7, -82.5, 41.4, -81, 41.8, -79, 42.8, -80.2, 42.8, -81.5, 42.6, -82.5, 42, -83.2, 42],                                // อีรี
  [-79.8, 43.3, -78.5, 43.35, -76.8, 43.3, -76.2, 43.5, -76.3, 44.1, -77.5, 44, -79.2, 43.8],                                      // ออนแทรีโอ
  [-96.8, 50.4, -96.3, 51.5, -97, 52.5, -97.8, 53.8, -98.7, 53.6, -98.2, 52.4, -97.5, 51.3, -97.3, 50.4],                          // วินนิเพก
  [-117, 61, -114.5, 61.3, -112.5, 62, -110.5, 62.7, -111.5, 62.9, -113.5, 62.5, -115.5, 62.2, -116.8, 61.7],                      // เกรตสเลฟ
  [-124, 65, -121, 65.4, -118, 66.2, -119.5, 66.9, -122, 66.8, -123.8, 66.3, -125, 65.7],                                          // เกรตแบร์
  [31.8, -0.2, 33, 0.4, 34.1, 0.1, 34.6, -0.5, 34, -1.1, 33.9, -2.2, 32.9, -2.8, 31.7, -2.5, 31.6, -1.3],                         // วิกตอเรีย
  [29.2, -3.4, 29.4, -4.5, 29.6, -6, 30.4, -7.2, 30.8, -8.6, 31.2, -8.5, 30.7, -7, 29.9, -5.7, 29.5, -4.2, 29.4, -3.3],            // แทนกันยิกา
  [34, -9.5, 34.3, -11, 34.5, -12.5, 34.9, -14.3, 35.3, -14.3, 34.9, -12, 34.6, -10.5, 34.1, -9.5],                               // มาลาวี
  [103.8, 51.7, 105.5, 51.8, 106.5, 52.5, 108.3, 53.4, 109.5, 55, 109.8, 55.8, 109.3, 55.8, 108, 54.2, 106.5, 53.2, 105, 52.2, 103.7, 51.9], // ไบคาล
  [73.5, 46.4, 75, 46, 76.5, 46.3, 78.5, 46.1, 79.2, 46.6, 77, 46.8, 75.3, 46.8, 74, 46.9],                                        // บัลคาช
  [30, 60.2, 31.8, 60, 33, 60.6, 32.5, 61.3, 31, 61.7, 30.2, 61.2],                                                                // ลาโดกา
  [34.8, 61, 36, 61.1, 36.4, 62, 35.5, 62.9, 34.6, 62.3],                                                                          // โอเนกา
  [103.6, 13.1, 104.2, 12.9, 104.5, 12.6, 104.3, 12.5, 103.9, 12.8, 103.5, 13],                                                   // โตนเลสาบ
  [-70, -15.5, -69.2, -15.3, -68.7, -16.1, -69.4, -16.4, -69.9, -16]                                                               // ติติกากา
];

/* เขตภูมิอากาศ: วงรีฟุ้ง [ลองจิจูด, ละติจูด, รัศมีตามลองจิจูด°, รัศมีตามละติจูด°, หมุนทวนเข็ม°, ความเข้ม 0–1] */
const EARTH_ZONES = {
  arid: [                                    // ทะเลทรายและเขตแห้ง
    [8, 23.5, 27, 8.5, 0, 1], [-11, 21, 6, 7, 0, 0.9], [4, 15, 27, 3.5, 0, 0.55],                          // ซาฮารา · ซาเฮล
    [35, 30, 2.5, 2.5, 0, 0.8], [47, 21, 10, 7, -25, 1], [40, 31, 6, 3.5, 0, 0.8],                           // ไซนาย · อาหรับ · ซีเรีย
    [56, 31, 8, 4.5, 0, 0.8], [64, 29, 5, 3.5, 0, 0.8], [71, 26.5, 3.5, 3, 0, 0.8],                           // อิหร่าน · บาลูจิสถาน · ธาร์
    [61, 41, 9, 4, 0, 0.8], [68, 47, 17, 4, 0, 0.45], [83, 39, 7, 2.3, 0, 1], [92, 40, 5, 2.5, 0, 0.7],       // คาราคุม · คาซัค · ทากลามากัน
    [104, 42, 11, 3.5, 0, 0.85], [104, 47, 12, 3, 0, 0.45], [86, 33, 11, 4, 0, 0.55],                          // โกบี · มองโกเลีย · ทิเบต
    [45, 7, 6, 5, 0, 0.7], [40, 3, 3, 3, 0, 0.5], [22, -22.5, 7, 5, 0, 0.6], [15, -22, 2.2, 7, 12, 1],       // โซมาเลีย · คาลาฮารี · นามิบ
    [21, -31, 5, 2.3, 0, 0.55], [126, -25, 14, 6.5, 0, 1], [134, -26, 21, 10, 0, 0.55],                        // คารู · ออสเตรเลีย
    [-70, -23, 2, 8, 0, 1], [-76, -11, 1.8, 6, 38, 0.8], [-68, -45, 4, 7, 0, 0.6], [-66, -30, 4, 6, 0, 0.4], // อาตากามา · เปรู · ปาตาโกเนีย
    [-116, 37, 6.5, 5.5, 0, 0.85], [-112, 32, 4, 3, 0, 0.8], [-105, 29, 4.5, 4, 0, 0.8],                       // เกรตเบซิน · โซโนรัน · ชิวาวา
    [-113, 28, 1.5, 4.5, 40, 0.8], [-103, 42, 5, 9, 0, 0.35], [-40, -8, 4, 3, 0, 0.4]                         // บาฮา · เกรตเพลนส์ · บราซิลอีสาน
  ],
  forest: [                                  // ป่าทึบ
    [-62, -4, 14, 8, 0, 1], [-74, 3, 4, 5, 0, 0.8], [-55, 4, 5, 3, 0, 0.8], [-45, -20, 3, 6, 25, 0.55],     // แอมะซอน · กิอานา · ป่าแอตแลนติก
    [-86, 13, 6, 4, -28, 0.75], [21, 0, 10, 5, 0, 1], [-5, 6.5, 9, 2, 0, 0.7], [49, -18, 1.5, 6, -15, 0.6], // อเมริกากลาง · คองโก · มาดากัสการ์
    [101, 17, 5, 7, 0, 0.75], [112, 0, 16, 5, 0, 1], [142, -5, 7, 3, 0, 1], [123, 11, 3, 6, 0, 0.75],        // อินโดจีน · อินโดนีเซีย · นิวกินี · ฟิลิปปินส์
    [112, 26, 9, 4, 0, 0.55], [92, 25, 4, 3, 0, 0.6], [75, 12, 1.8, 5, 0, 0.5], [80.7, 7.5, 1, 1.2, 0, 0.7], // จีนใต้ · อัสสัม · ฆาฏตะวันตก · ศรีลังกา
    [83, 26, 8, 3, -15, 0.45], [-52, -25, 6, 6, 0, 0.4], [30, -12, 8, 5, 0, 0.35],                           // ที่ราบคงคา · บราซิลใต้ · ป่ามีโอมโบ
    [137, 36, 5, 5, 35, 0.8], [128, 37, 2, 2.5, 0, 0.6], [-82, 36, 9, 6, 0, 0.7], [-124, 50, 3.5, 9, 15, 0.8], // ญี่ปุ่น · เกาหลี · สหรัฐตะวันออก · แปซิฟิกเหนือ
    [12, 50, 16, 6, 0, 0.45], [-73, -43, 2, 6, 0, 0.7], [151, -30, 2.5, 8, -10, 0.5], [145.5, -17, 1.5, 3, 0, 0.6], // ยุโรป · ชิลีใต้ · ออสเตรเลียตะวันออก
    [172, -42, 3, 5, 30, 0.6]                                                                                   // นิวซีแลนด์
  ],
  ice: [                                     // น้ำแข็งถาวร
    [-40, 77.5, 21, 7, 0, 1], [-43, 69, 13, 7, 0, 1], [-46, 63.5, 6, 3.5, 0, 1],                            // กรีนแลนด์ (เหนือ · กลาง · ปลายใต้)
    [18, 78.5, 6, 1.5, 0, 0.7], [55, 81, 8, 1.2, 0, 1], [98, 79, 7, 1.5, 0, 0.85],                            // สฟาลบาร์ · ฟรานซ์โยเซฟ · เซเวอร์นายา
    [60, 75.5, 5, 1.2, 30, 0.45], [-80, 80, 22, 3.5, 0, 0.75], [-17, 64.5, 2, 0.6, 0, 0.6], [-146, 61.5, 6, 1.5, 0, 0.5] // โนวายา · เอลส์เมียร์ · ไอซ์แลนด์ · อะแลสกา
  ],
  red: [                                     // ทรายสีแดงส้ม
    [128, -24, 16, 8, 0, 1], [15, -24, 4, 6, 0, 0.5], [5, 23, 12, 6, 0, 0.35], [47, 20, 7, 4, 0, 0.35], [-112, 36, 4, 3, 0, 0.3]
  ],
  shelf: [                                   // ทะเลตื้นกว้าง น้ำเป็นสีฟ้าอ่อน
    [108, 3, 8, 5, 0, 0.8], [101.5, 9.5, 2, 3, 0, 0.9], [-77, 24.5, 2, 1.2, 0, 1], [51, 27, 3, 2, -30, 0.8], // ซุนดา · อ่าวไทย · บาฮามาส · อ่าวเปอร์เซีย
    [3, 56, 4, 3, 0, 0.5], [122, 36, 3, 3, 0, 0.6], [147, -17, 2, 6, 30, 0.8], [-63, -48, 4, 6, 0, 0.5],     // ทะเลเหนือ · ทะเลเหลือง · เกรตแบร์ริเออร์รีฟ · ปาตาโกเนีย
    [-172, 62, 6, 3, 0, 0.5], [135, -10, 5, 2.5, 0, 0.7], [-50, 46, 3, 2, 0, 0.4]                             // แบริง · อาราฟูรา · แกรนด์แบงก์ส
  ]
};

/* เทือกเขา: ลากตามสันเขา [รัศมี°, ความเข้ม, lon, lat, lon, lat, …] — ยิ่งเข้มยิ่งสูง (หิมะขึ้นที่ยอด) */
const EARTH_RANGES = [
  [2.4, 1.0, 70, 36.5, 74, 36, 77, 35, 80, 32, 84, 29.3, 88, 28, 92, 28, 96, 28.8],       // ฮินดูกูช · คาราโครัม · หิมาลัย
  [2.4, 0.8, 71, 39, 75, 40.5, 80, 42, 85, 43, 90, 43],                                    // ปามีร์ · เทียนชาน
  [2.0, 0.65, 78, 36, 84, 35.8, 90, 35.8, 96, 35.2, 100, 34],                              // คุนหลุน
  [4.5, 0.45, 86, 33, 94, 32],                                                             // ที่ราบสูงทิเบต
  [2.0, 0.55, 98, 25, 99, 29, 102, 31],                                                    // เหิงต้วน
  [1.2, 0.3, 98, 22, 98.8, 17, 99, 12],                                                    // ตะนาวศรี
  [1.5, 0.35, 104, 20, 106, 17, 108, 14],                                                  // อันนัม
  [2.0, 0.5, 88, 50, 95, 51, 100, 50],                                                     // อัลไต · ซายัน
  [3.5, 0.35, 125, 64, 135, 66, 150, 65, 165, 64],                                         // ไซบีเรียตะวันออก
  [1.6, 0.75, 5.5, 45, 8, 46.2, 11, 46.8, 14, 47.2],                                       // แอลป์
  [1.1, 0.5, -1, 42.7, 2, 42.6],                                                           // พิเรนีส
  [1.3, 0.7, 40, 43.3, 44, 42.7, 48, 41.5],                                                // คอเคซัส
  [1.8, 0.6, 44, 36.5, 48, 33.5, 52, 30.5, 56, 28],                                        // ซากรอส
  [1.5, 0.55, 49, 36.5, 53, 36, 57, 37],                                                   // เอลบูร์ซ
  [2.8, 0.35, 32, 38.5, 38, 39, 42, 39.5],                                                 // อานาโตเลีย
  [1.6, 0.55, -8, 31, -3, 33, 2, 34.5, 8, 35.5],                                           // แอตลาส
  [3.2, 0.55, 38, 9],                                                                      // ที่ราบสูงเอธิโอเปีย
  [2.2, 0.4, 36, -1, 35, -6, 34, -10],                                                     // ที่สูงแอฟริกาตะวันออก
  [1.8, 0.4, 29, -29.5],                                                                   // ดราเคนส์เบิร์ก
  [1.8, 0.45, 7, 60, 11, 62.5, 15, 66, 19, 68.8],                                          // สแกนดิเนเวีย
  [1.1, 0.3, 58.5, 52, 59.5, 58, 61, 63, 65, 67],                                          // อูราล
  [1.8, 1.0, -76, 8, -77.5, 3, -78.5, -2, -77, -8, -73, -14, -69, -17, -67.5, -22, -69, -28,
   -70, -33, -71, -38, -72, -43, -73, -48, -73, -52],                                      // แอนดีส
  [2.6, 0.5, -73, -16, -67.5, -19],                                                        // อัลติพลาโน
  [2.4, 0.7, -150, 62.5, -142, 61, -136, 59.5, -130, 56.5, -124, 52, -118, 49, -113, 46,
   -110, 43, -107, 39.5, -106, 35.5, -108, 31.5],                                          // ร็อกกี
  [1.3, 0.55, -122, 47, -121.5, 44, -121, 40.5, -119, 37],                                 // แคสเคด · เซียร์ราเนวาดา
  [1.8, 0.55, -106, 26, -103, 22, -99, 19, -97, 17],                                       // เซียร์รามาเดร
  [1.3, 0.25, -85, 34.5, -81, 37, -78, 39.5, -75, 41.5],                                   // แอปพาเลเชียน
  [1.2, 0.3, 147, -37, 149, -35, 151, -31, 148, -23],                                      // เกรตดิไวดิง
  [1.2, 0.65, 167, -45.5, 170, -43.5, 172.5, -42],                                         // แอลป์ใต้
  [2.0, 0.45, 137, -4, 142, -5, 146, -6.5],                                                // เทือกเขานิวกินี
  [1.2, 0.4, 136, 35.5, 138.5, 36.5]                                                       // แอลป์ญี่ปุ่น
];

/* หน้ากากแผ่นดิน w×h: 1 = แผ่นดิน · 0 = น้ำ · ค่ากลางคือพิกเซลที่คร่อมชายฝั่ง */
function earthLandMask(w, h) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
  const px = lon => (lon + 180) / 360 * w, py = lat => (90 - lat) / 180 * h;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  for (const r of EARTH_LAND) {
    let lon = r[0], lat = r[1];
    ctx.moveTo(px(lon / 10), py(lat / 10));
    for (let k = 2; k < r.length; k += 2) { lon += r[k]; lat += r[k + 1]; ctx.lineTo(px(lon / 10), py(lat / 10)); }
    ctx.closePath();
  }
  ctx.fill('evenodd');                             // วงที่ซ้อนอยู่ข้างในคือรู — ทะเลแคสเปียน
  ctx.fillStyle = '#000';
  ctx.beginPath();
  for (const r of EARTH_LAKES) {
    ctx.moveTo(px(r[0]), py(r[1]));
    for (let k = 2; k < r.length; k += 2) ctx.lineTo(px(r[k]), py(r[k + 1]));
    ctx.closePath();
  }
  ctx.fill();
  const src = ctx.getImageData(0, 0, w, h).data, out = new Float32Array(w * h);
  for (let k = 0; k < out.length; k++) out[k] = src[k << 2] / 255;
  return out;
}

/* ดัชนีไบต์ใน ImageData ของพิกเซลที่ใกล้ (fx, fy) ที่สุด — ลองจิจูดวนรอบ ละติจูดหยุดที่ขั้ว */
function zoneIndex(fx, fy, w, h) {
  const ii = ((Math.round(fx) % w) + w) % w;
  const jj = Math.max(0, Math.min(h - 1, Math.round(fy)));
  return (jj * w + ii) << 2;
}

/* เบลอกล่องแบบแยกแกน: แนวนอนวนรอบ (ลองจิจูดต่อกันเป็นวง) แนวตั้งหยุดที่ขั้ว */
function blurWrap(src, w, h, r) {
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h), n = 2 * r + 1;
  const wrap = i => ((i % w) + w) % w;
  for (let j = 0; j < h; j++) {
    const row = j * w;
    let s = 0;
    for (let k = -r; k <= r; k++) s += src[row + wrap(k)];
    for (let i = 0; i < w; i++) { tmp[row + i] = s / n; s += src[row + wrap(i + r + 1)] - src[row + wrap(i - r)]; }
  }
  for (let i = 0; i < w; i++) {
    let s = 0;
    for (let k = -r; k <= r; k++) s += tmp[Math.max(0, Math.min(h - 1, k)) * w + i];
    for (let j = 0; j < h; j++) {
      out[j * w + i] = s / n;
      s += tmp[Math.min(h - 1, j + r + 1) * w + i] - tmp[Math.max(0, j - r) * w + i];
    }
  }
  return out;
}

/* ชั้นข้อมูลภูมิอากาศ วาดครั้งเดียวที่ 0.5°/พิกเซล แล้วย่อขยายตามขนาดพื้นผิวที่ขอ
   ชั้น 0: R = ความแห้ง · G = ป่า · B = ความสูง   ชั้น 1: R = น้ำแข็ง · G = ทรายแดง · B = ทะเลตื้น
   ใช้โหมด lighten (ค่ามากสุดต่อช่องสี) วงรีที่ทับกันจึงไม่บวกกันจนล้น                     */
let _zoneCanvases = null;
function earthZoneLayer(w, h, layer) {
  if (!_zoneCanvases) {
    const ZW = 720, ZH = 360, S = ZW / 360;
    const make = () => {
      const cv = document.createElement('canvas');
      cv.width = ZW; cv.height = ZH;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, ZW, ZH);
      ctx.globalCompositeOperation = 'lighten';
      return cv;
    };
    // โปรไฟล์ความเข้มจากกลางวงรีถึงขอบ: แบบที่ราบ (เขตชัด ๆ อย่างทะเลทราย) กับแบบลาด (ป่าที่ค่อย ๆ บางลง)
    const FLAT = [[0, 1], [0.55, 0.95], [0.85, 0.45], [1, 0]], SOFT = [[0, 1], [0.4, 0.85], [0.75, 0.4], [1, 0]];
    const blob = (ctx, ch, prof, lon, lat, rx, ry, rot, s) => {
      const col = a => { const v = [0, 0, 0]; v[ch] = Math.round(a * s * 255); return `rgb(${v[0]},${v[1]},${v[2]})`; };
      for (const off of [-360, 0, 360]) {             // วาดซ้ำสองข้างให้ต่อกันตรงเส้นแบ่งวันสากล
        const cx = (lon + off + 180) * S, cy = (90 - lat) * S, reach = Math.max(rx, ry) * S;
        if (cx + reach < 0 || cx - reach > ZW) continue;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-rot * Math.PI / 180);
        ctx.scale(rx * S, ry * S);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        for (const [at, a] of prof) g.addColorStop(at, col(a));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, 1, 0, 6.2832); ctx.fill();
        ctx.restore();
      }
    };
    const a = make(), b = make(), actx = a.getContext('2d'), bctx = b.getContext('2d');
    for (const z of EARTH_ZONES.arid) blob(actx, 0, FLAT, ...z);
    for (const z of EARTH_ZONES.forest) blob(actx, 1, SOFT, ...z);
    for (const r of EARTH_RANGES) {                    // โรยวงกลมถี่ ๆ ตามแนวสันเขา
      const rad = r[0], s = r[1];
      if (r.length === 4) { blob(actx, 2, SOFT, r[2], r[3], rad, rad, 0, s); continue; }
      for (let k = 2; k + 3 < r.length; k += 2) {
        const x0 = r[k], y0 = r[k + 1], x1 = r[k + 2], y1 = r[k + 3];
        const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (rad * 0.4)));
        for (let n = 0; n <= steps; n++) blob(actx, 2, SOFT, x0 + (x1 - x0) * n / steps, y0 + (y1 - y0) * n / steps, rad, rad, 0, s);
      }
    }
    for (const z of EARTH_ZONES.ice) blob(bctx, 0, FLAT, ...z);
    for (const z of EARTH_ZONES.red) blob(bctx, 1, SOFT, ...z);
    for (const z of EARTH_ZONES.shelf) blob(bctx, 2, SOFT, ...z);
    _zoneCanvases = [a, b];
  }
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(_zoneCanvases[layer], 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h).data;
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

  /* โลก: ทวีปจริงจากเส้นขอบแผ่นดิน (earth-land.js) ส่วนสีของแผ่นดินมาจากเขตภูมิอากาศ
     ที่วางไว้ด้วยมือใน EARTH_ZONES แล้วใช้ noise แตกขอบเขตให้ดูเป็นธรรมชาติ
     ลองจิจูด −180° อยู่ขอบซ้ายของภาพ 0° (กรีนิช) อยู่กลางภาพ — app.js หมุนโลกให้ตรงตามนี้ */
  earth(w, h) {
    const DEEP = rgb(5, 18, 48), MID = rgb(10, 36, 80), SHELF = rgb(24, 72, 112), SHALLOW = rgb(34, 110, 128);
    const RAIN = rgb(30, 64, 28), FOREST = rgb(44, 74, 38), GRASS = rgb(96, 104, 62), SAVANNA = rgb(148, 132, 86),
          SAND = rgb(214, 186, 138), REDSAND = rgb(184, 112, 64), ROCK = rgb(112, 98, 84),
          BOREAL = rgb(32, 50, 34), TUNDRA = rgb(108, 104, 86), ICE = rgb(236, 242, 248), PACK = rgb(206, 220, 232);
    const land = earthLandMask(w, h);
    const br = Math.max(1, Math.round(w / 360));                 // รัศมีเบลอราวหนึ่งองศา
    const near = blurWrap(blurWrap(land, w, h, br), w, h, br);   // 1 = กลางแผ่นดิน · 0 = กลางทะเล
    const za = earthZoneLayer(w, h, 0), zb = earthZoneLayer(w, h, 1);
    const deg = w / 360;                                         // พิกเซลต่อองศา

    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(w, h), d = img.data;
    const sea = [0, 0, 0], c = [0, 0, 0], t = [0, 0, 0];
    for (let j = 0; j < h; j++) {
      const lat = (0.5 - (j + 0.5) / h) * Math.PI;
      const cl = Math.cos(lat), sl = Math.sin(lat);
      const ld = lat * 180 / Math.PI, al = Math.abs(ld);
      const tropic = 1 - smooth(8, 22, al);
      const belt = (al - 26) / 9;
      const beltDry = 0.3 * Math.exp(-belt * belt);             // แถบความกดอากาศสูงกึ่งเขตร้อน แห้งเป็นพื้น
      const snowLine = 0.8 - 0.3 * smooth(28, 58, al);          // ยิ่งห่างศูนย์สูตร หิมะยิ่งลงมาต่ำ
      for (let i = 0; i < w; i++) {
        const lon = ((i + 0.5) / w) * 2 * Math.PI;
        const x = cl * Math.cos(lon), y = sl, z = cl * Math.sin(lon);
        const k = j * w + i, L = land[k], N = near[k];
        const n1 = fbm(x * 3.1, y * 3.1, z * 3.1, 4);

        if (L < 1) {                                             // ทะเล
          const shelf = zb[(k << 2) + 2] / 255;
          mix(DEEP, MID, 0.55 + n1 * 0.9, sea);
          mix(sea, SHELF, clamp01(smooth(0.04, 0.45, N) * 0.8 + shelf * 0.7), sea);
          if (shelf > 0 && al < 32) mix(sea, SHALLOW, smooth(0.35, 1, shelf) * 0.8, sea);
          const pack = ld > 0 ? smooth(76, 85, ld + n1 * 9) : smooth(-64, -74, ld + n1 * 6) * 0.8;
          if (pack > 0) mix(sea, PACK, pack, sea);
        }

        if (L > 0) {                                             // แผ่นดิน
          // ขอบเขตป่า/ทะเลทรายเลื่อนตาม noise ได้หลายองศา ให้ไม่เป็นวงรีเกลี้ยง ๆ
          // ส่วนภูเขาและน้ำแข็งเลื่อนแค่นิดเดียว เพราะต้องเกาะชายฝั่ง (แอนดีสอยู่ชิดทะเล)
          const wx = n1 * 1.6 * deg, wy = noise3(x * 5 + 11, y * 5, z * 5) * deg;
          const q = zoneIndex(i + wx * 6, j + wy * 6, w, h), qf = zoneIndex(i + wx, j + wy, w, h);
          const arid = za[q] / 255, forest = za[q + 1] / 255, red = zb[q + 1] / 255;
          const relief = za[qf + 2] / 255, iceZone = zb[qf] / 255;
          const n2 = fbm(x * 17 + 3, y * 17, z * 17, 3);

          mix(FOREST, RAIN, tropic, t);
          mix(GRASS, t, clamp01(forest + tropic * 0.35 + n1 * 0.25), c);
          if (ld > 44) {                                         // ไทกาและทุนดราซีกโลกเหนือ
            mix(c, BOREAL, smooth(47, 55, ld) * (1 - smooth(62, 69, ld + n1 * 6)) * 0.85, c);
            mix(c, TUNDRA, smooth(62, 71, ld + n1 * 6), c);
          }
          const dry = clamp01(arid + beltDry * (1 - forest) + n1 * 0.22 + n2 * 0.12);
          mix(c, SAVANNA, smooth(0.12, 0.5, dry), c);
          mix(SAND, REDSAND, red, t);
          mix(c, t, smooth(0.45, 0.85, dry), c);

          let v = 1 + n2 * 0.18 + n1 * 0.08, rg = 0.75;
          if (relief > 0.02) {                                   // เทือกเขา: สีหิน + สันเขา
            rg = ridge(x * 24, y * 24, z * 24, 3);
            mix(c, ROCK, smooth(0.15, 0.75, relief) * 0.6, c);
            v *= 1 + (rg - 0.6) * 0.55 * smooth(0.1, 0.6, relief);
          }
          c[0] *= v; c[1] *= v; c[2] *= v;

          // หิมะเกาะตามสันเขาเป็นหย่อม ๆ ไม่ใช่เส้นขาวทึบตลอดแนว
          let white = smooth(snowLine, snowLine + 0.3, relief * 0.95 + (rg - 0.75) * 0.9 + n2 * 0.25) * 0.8;
          white = Math.max(white, smooth(0.25, 0.7, iceZone - (1 - N) * 0.9 + n2 * 0.3));
          if (ld < -60) white = Math.max(white, smooth(-60, -64, ld) * (0.9 + n2 * 0.2));   // แอนตาร์กติกา
          if (white > 0) mix(c, ICE, white, c);
          if (L < 1) mix(sea, c, L, c);                          // ขอบชายฝั่งนุ่ม ๆ
        }

        const src = L > 0 ? c : sea, o = k << 2;
        d[o] = src[0]; d[o + 1] = src[1]; d[o + 2] = src[2]; d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cv;
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
        const a = smooth(0.06, 0.46, n * 0.75 + zone * 0.30 - 0.18);   // บางลงให้เห็นทวีปจริงข้างใต้
        const k = (j * w + i) << 2;
        d[k] = d[k + 1] = d[k + 2] = 255;
        d[k + 3] = a * 225;
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
function discPreview(srcCanvas, size, lon0) {
  size = size || 96;
  lon0 = lon0 == null ? 0.9 : lon0;                       // ตำแหน่งกลางแผ่นกลม (เรเดียนตามแนวกว้างของภาพ)
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
      const lon = Math.atan2(nx, nz) * 0.5 + lon0;
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
