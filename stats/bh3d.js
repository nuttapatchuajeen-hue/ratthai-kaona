/* ============================================================================
   bh3d.js — หลุมดำหมุน 3 มิติ (คำนวณเส้นทางแสงจริงในเมตริกเคอร์)

   ใช้ที่ stats/explore.html — แผง "หลุมดำ & กาล-อวกาศบิดเบี้ยว" (แทนภาพวาด 2 มิติเดิม)
   เชเดอร์ชุดเดียวกับหลุมดำในแผนที่ระบบสุริยะ (solar-atlas/app.js · kerrBlackHoleMaterial)
   แต่เป็น WebGL ล้วน ไม่พึ่ง three.js — แก้ฟิสิกส์ฝั่งใดให้ตามแก้อีกฝั่งด้วย

   ── ทำงานอย่างไร ──────────────────────────────────────────────────────────
   ทุกพิกเซลยิงรังสีย้อนจากกล้อง แล้วเดินสมการจีโอเดสิกไร้มวลในพิกัด Boyer–Lindquist
   (แฮมิลโทเนียน H = ½ g^{μν} p_μ p_ν = 0 · รุงเง-คุตตาอันดับสี่ ก้าวยาวปรับเอง ≤ 600 ก้าว)
   รังสีที่ตกลงหลุม = ดำ · ชนจาน = สีจาน (ดอปเพลอร์ g⁴) · หลุดออกไป = ฟ้าในทิศที่ถูกดัดแล้ว
   รังสีที่เฉียดห่างมากไม่ต้องเดิน ใช้สูตรดัดแสงสนามอ่อน 4/b + 15π/4b² แทน
   ฟ้าเป็นดาวสุ่มกับแถบกาแล็กซีสมมุติ สร้างจากทิศทางล้วน ๆ จึงบิดได้ทั้งจอ

   ── หน่วยและกล้อง ─────────────────────────────────────────────────────────
   เชเดอร์คิดในหน่วย M = GM/c² (1 M☉ ≈ 1.4766 กม.) · กล้องยืนห่างคงที่ CAM_KM
   ปรับมวล = หลุมดำใหญ่/เล็กลงเมื่อเทียบกับกล้อง (รัศมีชวาร์ซชิลด์ rs = 2M)
   ลากซ้าย–ขวา = เดินรอบแกนหมุน · ลากขึ้น–ลง = เงย/ก้มจากระนาบจาน

   ── ใช้งาน ────────────────────────────────────────────────────────────────
     var bh = BH3D.mount(canvas, { mass: 1, angle: 12, speed: 1, onAngle: fn });
     bh.set('mass', 2.5);  bh.set('angle', 30);  bh.set('speed', 0.5);
   คืนค่า null ถ้าเครื่องไม่รองรับ WebGL (แคนวาสเดิมถูกสลับเป็นตัวใหม่ ใช้วาด 2 มิติต่อได้)
   ============================================================================ */
(function () {
  'use strict';

  var CAM_KM = 80;              // ระยะกล้องจากหลุมดำ (กม.)
  var KM_PER_M = 1.4766;        // GM☉/c² (กม.)
  var SPIN = 0.9;               // สปิน a/M
  var ROUT = 20;                // ขอบนอกจาน (M)
  var FOV = 50;                 // มุมรับภาพแนวตั้ง (องศา)
  var ORB_RATE = 4;             // ลายก๊าซหมุน (t_g ต่อวินาทีจริง) ที่ความเร็ว 1x

  var VS = [
    'attribute vec2 aPos;',
    'varying vec2 vUv;',
    'void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }'
  ].join('\n');

  // ── เชเดอร์หลุมดำ (ส่วนฟิสิกส์ตรงกับ solar-atlas/app.js) ─────────────────────
  var FS_BH = [
    'precision highp float;',
    'uniform float uA, uRin, uRout, uSteps, uOrb, uFlick, uExpo, uStarSc;',
    'uniform vec3 uCam, uRight, uUp, uFwd;',
    'uniform vec2 uTanH;',
    'varying vec2 vUv;',
    '#define MAXSTEP 600',
    '',
    '/* แรงดัดของแสงที่เหลือตั้งแต่จุด P (ทิศ D) ออกไปถึงอนันต์ — สนามอ่อนถึงพจน์อันดับสอง */',
    'vec3 bendRay(vec3 P, vec3 D){',
    '  float rP = length(P), s = dot(P, D);',
    '  vec3 perp = P - s * D;',
    '  float b = length(perp);',
    '  if (b < 1e-3) return D;',
    '  float al = min((4.0 / b + 11.780972 / (b * b)) * 0.5 * (1.0 - s / rP), 3.0);',
    '  return normalize(D * cos(al) - perp * (sin(al) / b));',
    '}',
    'float hash31(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y) * p.z); }',
    'float hash21(vec2 p){ vec3 q = fract(vec3(p.x, p.y, p.x) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }',
    'float vnoise(vec2 p){',
    '  vec2 i = floor(p), f = fract(p);',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),',
    '             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);',
    '}',
    'float vnoise3(vec3 p){',
    '  vec3 i = floor(p), f = fract(p);',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(mix(hash31(i), hash31(i + vec3(1.0, 0.0, 0.0)), f.x),',
    '                 mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),',
    '             mix(mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), f.x),',
    '                 mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);',
    '}',
    'vec3 blCart(float r, float th, float ph, float a){',
    '  float sr = sqrt(r * r + a * a), s = sin(th);',
    '  return vec3(sr * s * cos(ph), sr * s * sin(ph), r * cos(th));',
    '}',
    'vec3 bbCol(float t){',
    '  t = clamp(t, 0.0, 1.7);',
    '  vec3 c = mix(vec3(0.60, 0.09, 0.02), vec3(1.0, 0.33, 0.05), smoothstep(0.0, 0.24, t));',
    '  c = mix(c, vec3(1.0, 0.62, 0.18), smoothstep(0.20, 0.50, t));',
    '  c = mix(c, vec3(1.0, 0.90, 0.70), smoothstep(0.46, 0.86, t));',
    '  return mix(c, vec3(0.80, 0.89, 1.0), smoothstep(0.90, 1.45, t));',
    '}',
    'float starField(vec3 d, float sc){',
    '  float acc = 0.0;',
    '  vec3 p = d * sc, ip = floor(p), fp = p - ip;',
    '  float h = hash31(ip);',
    '  if (h > 0.88) {',
    '    vec3 c = vec3(hash31(ip + 11.3), hash31(ip + 27.7), hash31(ip + 41.1)) * 0.5 + 0.25;',
    '    acc += smoothstep(0.14, 0.0, length(fp - c)) * (0.25 + fract(h * 91.0));',
    '  }',
    '  p = d * sc * 2.3; ip = floor(p); fp = p - ip;',
    '  h = hash31(ip + 5.0);',
    '  if (h > 0.93) {',
    '    vec3 c = vec3(hash31(ip + 3.1), hash31(ip + 7.7), hash31(ip + 13.1)) * 0.5 + 0.25;',
    '    acc += smoothstep(0.10, 0.0, length(fp - c)) * (0.2 + fract(h * 57.0)) * 0.7;',
    '  }',
    '  return acc;',
    '}',
    '/* ฟ้าฉากหลังในทิศ d (กรอบหลุมดำ): ดาว + แถบกาแล็กซีสมมุติที่เอียงจากระนาบจาน */',
    'vec3 sky(vec3 d){',
    '  vec3 col = vec3(0.85, 0.90, 1.0) * min(starField(d, uStarSc), 1.4) * 0.85;',
    '  float b = dot(d, vec3(0.3371, -0.5297, 0.7784));',
    '  float band = exp(-b * b * 14.0);',
    '  float neb = vnoise3(d * 3.1) * 0.6 + vnoise3(d * 7.3 + 5.0) * 0.4;',
    '  col += vec3(0.12, 0.10, 0.20) * band * (0.35 + neb) + vec3(0.015, 0.02, 0.045) * neb;',
    '  col += vec3(1.0, 0.92, 0.80) * min(starField(d.zxy, uStarSc * 1.9), 1.2) * band * 0.55;',
    '  return col;',
    '}',
    'float diskTurb(float rd, float ph, float flick){',
    '  vec2 b = vec2(cos(ph), sin(ph)) * 1.35 + vec2(rd * 1.8, flick * 0.03);',
    '  float v = 0.0, amp = 0.5, sc = 1.0;',
    '  for (int i = 0; i < 4; i++) { v += amp * vnoise(b * sc); sc *= 2.5; amp *= 0.62; }',
    '  return v * 0.892;',
    '}',
    'vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }',
    'void deriv(float a, float a2, float L, float L2, float r, float th, float pr, float pth,',
    '           out float dr, out float dth, out float dph, out float dpr, out float dpth){',
    '  float s = sin(th), c = cos(th);',
    '  s = (s < 0.0 ? -1.0 : 1.0) * max(abs(s), 1e-5);',
    '  float r2 = r * r;',
    '  float Sig = r2 + a2 * c * c;',
    '  float Del = max(r2 - 2.0 * r + a2, 1e-3);',
    '  float iS = 1.0 / s, iSig = 1.0 / Sig, iDel = 1.0 / Del;',
    '  float s2 = s * s, iS2 = iS * iS;',
    '  float rr = r2 + a2;',
    '  float das = Del - a2 * s2;',
    '  float N = -(rr * rr - a2 * Del * s2) + 4.0 * a * r * L + das * L2 * iS2;',
    '  float F = Del * pr * pr + pth * pth + N * iDel;',
    '  dr  = Del * pr * iSig;',
    '  dth = pth * iSig;',
    '  dph = (4.0 * a * r + 2.0 * L * das * iS2) * (0.5 * iSig * iDel);',
    '  float Delr = 2.0 * r - 2.0;',
    '  float Nr = -(4.0 * r * rr - a2 * s2 * Delr) + 4.0 * a * L + Delr * L2 * iS2;',
    '  float Pr = (Nr * Del - N * Delr) * iDel * iDel;',
    '  float sc = s * c;',
    '  dpr = -(Delr * pr * pr + Pr) * (0.5 * iSig) + F * r * iSig * iSig;',
    '  float Pth = 2.0 * a2 * sc - 2.0 * L2 * c * iS2 * iS;',
    '  dpth = -Pth * (0.5 * iSig) - F * a2 * sc * iSig * iSig;',
    '}',
    '',
    'void main(){',
    '  float a = uA, a2 = uA * uA;',
    '  float rh = 1.0 + sqrt(max(1.0 - a2, 0.0));',
    '  vec2 p = vUv * 2.0 - 1.0;',
    '  vec3 d0 = normalize(uFwd + uRight * (p.x * uTanH.x) + uUp * (p.y * uTanH.y));',
    '',
    '  // เฉียดห่างและไม่ตัดระนาบจาน: ดัดด้วยสูตรสนามอ่อนแล้วจบ',
    '  float bImp = length(cross(uCam, d0));',
    '  float tPl = abs(d0.z) > 1e-6 ? -uCam.z / d0.z : -1.0;',
    '  float rPl = tPl > 0.0 ? length(uCam + d0 * tPl) : 1e9;',
    '  if (bImp > uRout + 6.0 && rPl > uRout + 2.0) { gl_FragColor = vec4(sky(bendRay(uCam, d0)), 0.0); return; }',
    '',
    '  float R2 = dot(uCam, uCam), dd = R2 - a2;',
    '  float r0 = sqrt(max(0.5 * (dd + sqrt(dd * dd + 4.0 * a2 * uCam.z * uCam.z)), 1e-4));',
    '  float th0 = acos(clamp(uCam.z / r0, -1.0, 1.0));',
    '  float ph0 = atan(uCam.y, uCam.x);',
    '  float s0 = sin(th0), c0 = cos(th0), sr0 = sqrt(r0 * r0 + a2);',
    '  vec3 er = normalize(vec3(r0 * s0 * cos(ph0) / sr0, r0 * s0 * sin(ph0) / sr0, c0));',
    '  vec3 eth = normalize(vec3(sr0 * c0 * cos(ph0), sr0 * c0 * sin(ph0), -r0 * s0));',
    '  vec3 eph = vec3(-sin(ph0), cos(ph0), 0.0);',
    '  float nr = dot(d0, er), nt = dot(d0, eth), np = dot(d0, eph);',
    '',
    '  // โมเมนตัมเริ่มต้นผ่านผู้สังเกต ZAMO แล้วปรับให้ E = 1',
    '  float Sig0 = r0 * r0 + a2 * c0 * c0;',
    '  float Del0 = max(r0 * r0 - 2.0 * r0 + a2, 1e-4);',
    '  float A0 = (r0 * r0 + a2) * (r0 * r0 + a2) - a2 * Del0 * s0 * s0;',
    '  float om0 = 2.0 * a * r0 / A0;',
    '  float al0 = sqrt(max(Sig0 * Del0 / A0, 1e-9));',
    '  float L = np * sqrt(A0 / Sig0) * s0;',
    '  float E = al0 + om0 * L;',
    '  L /= E;',
    '  // รังสีที่ผ่านแกนหมุนแทบพอดี: ให้ผ่านแกนตรง ๆ (ไม่งั้นกวาด φ ไม่ครบ เป็นเส้นดำตามแกน)',
    '  if (abs(L) < 3e-5 * max(r0, max(uRout * 1.6, 30.0))) L = 0.0;',
    '  float pr = nr * sqrt(Sig0 / Del0) / E;',
    '  float pth = nt * sqrt(Sig0) / E;',
    '  float Ecam = (1.0 - om0 * L) / al0;',
    '',
    '  float r = r0, th = th0, ph = ph0;',
    '  float rPrev = r, thPrev = th, phPrev = ph, cPrev = cos(th);',
    '  float rEsc = max(uRout * 1.6, 30.0);',
    '  float rpk = 1.3611 * uRin;',
    '  float fpk = max(1.0 - sqrt(uRin / rpk), 1e-6) / (rpk * rpk * rpk);',
    '  vec3 col = vec3(0.0);',
    '  float trans = 1.0, fate = 0.0;',
    '  float L2 = L * L;',
    '  for (int i = 0; i < MAXSTEP; i++) {',
    '    if (float(i) >= uSteps) break;',
    '    float k1r, k1t, k1p, k1a, k1b;',
    '    deriv(a, a2, L, L2, r, th, pr, pth, k1r, k1t, k1p, k1a, k1b);',
    '    float wd = smoothstep(rh + 0.02, rh + 0.9, r);',
    '    float h = min(0.060 / max(abs(k1t) + abs(k1p) * wd, 1e-9), 0.30 * r / max(abs(k1r), 1e-9));',
    '    h = min(h, 0.30 * (r - rh) + 0.006);',
    '    h = min(h, 50.0);',
    '    float sr = k1r, st = k1t, sp = k1p, sa = k1a, sb = k1b;',
    '    float hh = 0.5 * h;',
    '    float k2r, k2t, k2p, k2a, k2b;',
    '    deriv(a, a2, L, L2, r + hh * k1r, th + hh * k1t, pr + hh * k1a, pth + hh * k1b, k2r, k2t, k2p, k2a, k2b);',
    '    sr += 2.0 * k2r; st += 2.0 * k2t; sp += 2.0 * k2p; sa += 2.0 * k2a; sb += 2.0 * k2b;',
    '    deriv(a, a2, L, L2, r + hh * k2r, th + hh * k2t, pr + hh * k2a, pth + hh * k2b, k1r, k1t, k1p, k1a, k1b);',
    '    sr += 2.0 * k1r; st += 2.0 * k1t; sp += 2.0 * k1p; sa += 2.0 * k1a; sb += 2.0 * k1b;',
    '    deriv(a, a2, L, L2, r + h * k1r, th + h * k1t, pr + h * k1a, pth + h * k1b, k2r, k2t, k2p, k2a, k2b);',
    '    sr += k2r; st += k2t; sp += k2p; sa += k2a; sb += k2b;',
    '    rPrev = r; thPrev = th; phPrev = ph; cPrev = cos(th);',
    '    float h6 = h / 6.0;',
    '    r += h6 * sr; th += h6 * st; ph += h6 * sp; pr += h6 * sa; pth += h6 * sb;',
    '    if (!(r > 0.0)) { fate = 1.0; break; }',
    '',
    '    // ตัดผ่านระนาบศูนย์สูตร = ชนจานพอกพูนมวล (จานบาง)',
    '    float cNow = cos(th);',
    '    if (cPrev * cNow < 0.0) {',
    '      float f = cPrev / (cPrev - cNow);',
    '      float rd = mix(rPrev, r, f);',
    '      if (rd > uRin && rd < uRout) {',
    '        float phd = mix(phPrev, ph, f);',
    '        float em = (max(1.0 - sqrt(uRin / rd), 0.0) / (rd * rd * rd)) / fpk;',
    '        float om = 1.0 / (pow(rd, 1.5) + a);',
    '        float cyc = 60.0;',
    '        float tc = mod(uOrb, cyc), bl = tc / cyc;',
    '        float turb = mix(diskTurb(rd, phd - (tc + cyc) * om, uFlick),',
    '                         diskTurb(rd, phd - tc * om, uFlick), bl);',
    '        float gtt = -(1.0 - 2.0 / rd), gtp = -2.0 * a / rd, gpp = rd * rd + a2 + 2.0 * a2 / rd;',
    '        float ut = inversesqrt(max(-(gtt + 2.0 * om * gtp + om * om * gpp), 1e-6));',
    '        float g = Ecam / max(ut * (1.0 - om * L), 1e-4);',
    '        float g2 = g * g;',
    '        float op = smoothstep(uRin, uRin + 0.35, rd) * (1.0 - smoothstep(uRout * 0.76, uRout, rd));',
    '        float fil = pow(clamp(turb * 1.25, 0.0, 1.0), 2.2);',
    '        col += trans * op * em * g2 * g2 * (0.25 + 1.7 * fil) * bbCol(pow(em, 0.25) * g);',
    '        float seen = smoothstep(0.004, 0.08, em * g2 * g2);',
    '        trans *= 1.0 - op * (0.62 + 0.36 * fil) * seen;',
    '        if (trans < 0.02) { fate = 3.0; break; }',
    '      }',
    '    }',
    '    if (r < rh + 0.035) { fate = 1.0; break; }',
    '    if (r > rEsc && pr > 0.0) { fate = 2.0; break; }',
    '  }',
    '  if (fate == 0.0 && pr > 0.0 && r > uRout) fate = 2.0;',
    '  vec3 bg = vec3(0.0);',
    '  if (fate == 2.0 && trans > 0.01) {',
    '    vec3 pE = blCart(r, th, ph, a);',
    '    bg = trans * sky(bendRay(pE, normalize(pE - blCart(rPrev, thPrev, phPrev, a))));',
    '  }',
    '  vec3 e = aces(col * uExpo);',
    '  float le = dot(e, vec3(0.299, 0.587, 0.114)), lb = dot(bg, vec3(0.299, 0.587, 0.114));',
    '  // อัลฟา = สัดส่วนแสงของจาน — ใช้ตัดส่วนสว่างทำแสงฟุ้ง ดาวฉากหลังจึงไม่ฟุ้งตาม',
    '  gl_FragColor = vec4(e + bg, le / max(le + lb, 1e-4));',
    '}'
  ].join('\n');

  // ── แสงฟุ้ง: ตัดส่วนสว่าง → เบลอสองแกน 3 ชั้น → บวกทับ (แบบเดียวกับแผนที่ระบบสุริยะ) ──
  var FS_CUT = [
    'precision mediump float;',
    'uniform sampler2D uTex; varying vec2 vUv;',
    'void main(){ vec4 t = texture2D(uTex, vUv); vec3 c = t.rgb * t.a;',
    '  gl_FragColor = vec4(max(c - 0.45, 0.0) / 0.55, 1.0); }'
  ].join('\n');
  var FS_BLUR = [
    'precision mediump float;',
    'uniform sampler2D uTex; uniform vec2 uDir; varying vec2 vUv;',
    'void main(){',
    '  vec3 s = texture2D(uTex, vUv).rgb * 0.2270270;',
    '  s += (texture2D(uTex, vUv + uDir * 1.3846154).rgb + texture2D(uTex, vUv - uDir * 1.3846154).rgb) * 0.3162162;',
    '  s += (texture2D(uTex, vUv + uDir * 3.2307692).rgb + texture2D(uTex, vUv - uDir * 3.2307692).rgb) * 0.0702703;',
    '  gl_FragColor = vec4(s, 1.0);',
    '}'
  ].join('\n');
  var FS_OUT = [
    'precision mediump float;',
    'uniform sampler2D uTex, uG1, uG2, uG3; varying vec2 vUv;',
    'void main(){',
    '  vec3 c = texture2D(uTex, vUv).rgb + texture2D(uG1, vUv).rgb * 0.55',
    '         + texture2D(uG2, vUv).rgb * 0.42 + texture2D(uG3, vUv).rgb * 0.34;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'
  ].join('\n');

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error('bh3d shader: ' + log);
    }
    return sh;
  }

  function makeProgram(gl, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('bh3d link: ' + gl.getProgramInfoLog(p));
    var cache = {};
    return {
      p: p,
      u: function (name) {
        if (!(name in cache)) cache[name] = gl.getUniformLocation(p, name);
        return cache[name];
      }
    };
  }

  function makeTarget(gl) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, 4, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex: tex, fb: fb, w: 4, h: 4 };
  }

  function sizeTarget(gl, t, w, h) {
    w = Math.max(4, w | 0); h = Math.max(4, h | 0);
    if (t.w === w && t.h === h) return;
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    t.w = w; t.h = h;
  }

  // รัศมีวงโคจรเสถียรวงในสุด (ISCO) ของเคอร์ — Bardeen, Press & Teukolsky 1972
  function iscoRadius(a) {
    var z1 = 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
    var z2 = Math.sqrt(3 * a * a + z1 * z1);
    return 3 + z2 - Math.sqrt(Math.max((3 - z1) * (3 + z1 + 2 * z2), 0));
  }

  function mount(canvas, opt) {
    opt = opt || {};
    var gl = null;
    try {
      gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false,
        premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
    } catch (e) { gl = null; }
    if (!gl) return null;

    var P = {};
    try {
      P.bh = makeProgram(gl, FS_BH);
      P.cut = makeProgram(gl, FS_CUT);
      P.blur = makeProgram(gl, FS_BLUR);
      P.out = makeProgram(gl, FS_OUT);
    } catch (e) {
      console.warn(e);
      // แคนวาสที่ขอ WebGL ไปแล้วใช้วาด 2 มิติไม่ได้ — สลับเป็นแคนวาสใหม่ให้ตัววาดสำรอง
      var fresh = canvas.cloneNode(false);
      canvas.parentNode.replaceChild(fresh, canvas);
      return null;
    }

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    var T = { bh: makeTarget(gl), a: makeTarget(gl), b: makeTarget(gl), c: makeTarget(gl),
              d: makeTarget(gl), e: makeTarget(gl), f: makeTarget(gl) };

    var st = {
      mass: opt.mass || 1, angle: opt.angle != null ? opt.angle : 12, speed: opt.speed != null ? opt.speed : 1,
      az: 0.6, orb: 0, scale: 1, slow: 0, ema: 16, last: 0, raf: 0, dead: false
    };
    var isco = iscoRadius(SPIN);

    // ป้ายบอกค่าบนภาพ + คำแนะนำการลาก
    var wrap = canvas.parentElement;
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:14px;top:12px;pointer-events:none;font:600 11px/1.55 "Fira Code",ui-monospace,monospace;color:#7dd3fc;text-shadow:0 1px 3px #000;white-space:nowrap';
    var hint = document.createElement('div');
    hint.style.cssText = 'position:absolute;right:14px;bottom:10px;pointer-events:none;font:12px/1.4 system-ui,sans-serif;color:rgba(255,255,255,.55);text-shadow:0 1px 3px #000';
    hint.textContent = 'ลากเพื่อหมุนรอบหลุมดำ';
    if (wrap) { wrap.appendChild(hud); wrap.appendChild(hint); }
    function updateHud() {
      var rsKm = 2 * KM_PER_M * st.mass;
      hud.innerHTML = 'รัศมีชวาร์ซชิลด์ r<sub>s</sub> = ' + rsKm.toFixed(2) + ' กม.<br>' +
        'กล้องห่าง ' + CAM_KM + ' กม. = ' + (CAM_KM / rsKm).toFixed(1) + ' r<sub>s</sub> · สปิน a = ' + SPIN;
    }
    updateHud();

    // ลากหมุนรอบหลุมดำ (ซ้าย–ขวา = เดินรอบแกน · ขึ้น–ลง = เงย/ก้ม)
    var drag = null;
    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'pan-y';
    canvas.addEventListener('pointerdown', function (e) {
      drag = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY;
      st.az -= dx * 0.0065;
      st.angle = Math.max(-80, Math.min(80, st.angle + dy * 0.35));
      if (opt.onAngle) opt.onAngle(Math.round(st.angle));
      hint.style.opacity = '0';
    });
    function endDrag() { drag = null; canvas.style.cursor = 'grab'; }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); st.dead = true; });

    function pass(prog, target, w, h) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fb : null);
      gl.viewport(0, 0, w, h);
      gl.useProgram(prog.p);
    }
    function bindTex(prog, name, unit, tex) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(prog.u(name), unit);
    }
    function blur(src, mid, dst) {
      pass(P.blur, mid, mid.w, mid.h);
      bindTex(P.blur, 'uTex', 0, src.tex);
      gl.uniform2f(P.blur.u('uDir'), 1.4 / mid.w, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      pass(P.blur, dst, dst.w, dst.h);
      bindTex(P.blur, 'uTex', 0, mid.tex);
      gl.uniform2f(P.blur.u('uDir'), 0, 1.4 / dst.h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now) {
      st.raf = requestAnimationFrame(frame);
      if (st.dead) return;
      var dt = st.last ? Math.min(0.1, (now - st.last) / 1000) : 0.016;
      st.last = now;
      if (canvas.offsetParent === null || document.hidden) return;   // แผงไม่ได้เปิดอยู่ ไม่ต้องวาด

      // เครื่องช้าจริง (เฟรมเกิน ~55 ms ติดกัน) → ลดความละเอียดลง ทีละขั้น ไม่ดีดกลับไปมา
      st.ema += (dt * 1000 - st.ema) * 0.1;
      if (st.ema > 55 && st.scale > 0.5) { if (++st.slow > 30) { st.scale = Math.max(0.5, st.scale * 0.75); st.slow = 0; st.ema = 30; } }
      else st.slow = 0;

      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var cw = Math.max(16, Math.round(canvas.clientWidth * dpr)), ch = Math.max(16, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      var w = Math.round(cw * st.scale), h = Math.round(ch * st.scale);
      sizeTarget(gl, T.bh, w, h);
      sizeTarget(gl, T.a, w / 2, h / 2); sizeTarget(gl, T.b, w / 2, h / 2);
      sizeTarget(gl, T.c, w / 4, h / 4); sizeTarget(gl, T.d, w / 4, h / 4);
      sizeTarget(gl, T.e, w / 8, h / 8); sizeTarget(gl, T.f, w / 8, h / 8);

      st.orb = (st.orb + ORB_RATE * st.speed * dt) % 6000;

      // กล้องในกรอบหลุมดำ (หน่วย M) — แกนหมุน = z
      var camM = CAM_KM / (KM_PER_M * st.mass);
      var el = st.angle * Math.PI / 180, ce = Math.cos(el);
      var cx = camM * ce * Math.cos(st.az), cy = camM * ce * Math.sin(st.az), cz = camM * Math.sin(el);
      var fx = -cx / camM, fy = -cy / camM, fz = -cz / camM;
      var rx = fy, ry = -fx, rz = 0;                                  // fwd × z
      var rl = Math.hypot(rx, ry) || 1; rx /= rl; ry /= rl;
      var ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;   // right × fwd
      var tanY = Math.tan(FOV * Math.PI / 360);

      pass(P.bh, T.bh, w, h);
      var u = P.bh.u;
      gl.uniform1f(u('uA'), SPIN);
      gl.uniform1f(u('uRin'), isco);
      gl.uniform1f(u('uRout'), ROUT);
      gl.uniform1f(u('uSteps'), 600);
      gl.uniform1f(u('uOrb'), st.orb);
      gl.uniform1f(u('uFlick'), now / 1000);
      gl.uniform1f(u('uExpo'), 3.2);
      gl.uniform1f(u('uStarSc'), 70);                                // ช่องดาวกว้าง ~0.8° ต่อช่อง
      gl.uniform3f(u('uCam'), cx, cy, cz);
      gl.uniform3f(u('uRight'), rx, ry, rz);
      gl.uniform3f(u('uUp'), ux, uy, uz);
      gl.uniform3f(u('uFwd'), fx, fy, fz);
      gl.uniform2f(u('uTanH'), tanY * cw / ch, tanY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      pass(P.cut, T.a, T.a.w, T.a.h);
      bindTex(P.cut, 'uTex', 0, T.bh.tex);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      blur(T.a, T.b, T.a);
      blur(T.a, T.c, T.d);
      blur(T.d, T.e, T.f);

      pass(P.out, null, cw, ch);
      bindTex(P.out, 'uTex', 0, T.bh.tex);
      bindTex(P.out, 'uG1', 1, T.a.tex);
      bindTex(P.out, 'uG2', 2, T.d.tex);
      bindTex(P.out, 'uG3', 3, T.f.tex);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    st.raf = requestAnimationFrame(frame);

    var api = {
      set: function (key, value) {
        if (key === 'mass') { st.mass = Math.max(0.05, +value || 1); updateHud(); }
        else if (key === 'angle') st.angle = Math.max(-80, Math.min(80, +value || 0));
        else if (key === 'speed') st.speed = Math.max(0, +value || 0);
      },
      state: st,
      destroy: function () {
        cancelAnimationFrame(st.raf);
        st.dead = true;
        if (hud.parentNode) hud.parentNode.removeChild(hud);
        if (hint.parentNode) hint.parentNode.removeChild(hint);
      }
    };
    BH3D._last = api;
    return api;
  }

  window.BH3D = { mount: mount, _last: null };
})();
