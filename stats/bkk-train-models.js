/**
 * bkk-train-models.js
 * แบบจำลองขบวนรถไฟฟ้ารายสายของ bkk-rail3d.js — สร้างรูปทรงเองในโค้ด (ไม่โหลดไฟล์โมเดล)
 *
 *   - รูปทรงตัวรถ: หน้าตัดขวาง (ท้องรถ ข้างรถ หลังคาโค้ง) ยืดตามความยาวตู้ · ตู้หัว-ท้ายมีหัวรถลาดเอียงโค้งมนตามแบบรถจริง
 *   - ลายรถ (livery) ประตู หน้าต่าง กระจกหน้า ไฟหน้า-ไฟท้าย ป้ายปลายทาง: วาดบน canvas เป็นแผ่นเดียวต่อแบบรถ (atlas)
 *     + แผ่นเรืองแสงกลางคืน (ไฟในตู้ ไฟหน้าสีขาว ไฟท้ายสีแดง)
 *   - LOD: lod 0 = ละเอียด (โบกี้ ล้อ อุปกรณ์ใต้ท้อง ข้อต่อระหว่างตู้ แอร์บนหลังคา แพนโทกราฟ ขอพ่วง)
 *          lod 1 = ตัวรถ + ลายอย่างเดียว (ใช้กับขบวนที่อยู่ไกล)
 *   - แบบตู้: head = ตู้หัว (ไฟหน้า) · tail = ตู้ท้าย (รูปทรงเดียวกัน หมุนกลับ ไฟท้ายแดง) · mid = ตู้กลาง · midP = ตู้กลางมีแพนโทกราฟ
 *
 * หน่วย: เมตร · แกนของตู้: x = ตามทิศวิ่ง (หัวรถอยู่ +x) · y = ซ้าย · z = ขึ้น
 *   z = 0 คือหัวราง (รถไฟหนัก) หรือหลังคานทางวิ่ง (โมโนเรล/APM)
 *
 * ⚠ ขนาดและลายรถเป็นค่าประมาณจากภาพถ่ายและข้อมูลผู้ผลิตที่เปิดเผย ไม่ใช่แบบวิศวกรรม · ไม่วาดโลโก้จริงของผู้ให้บริการ (เขียนเป็นตัวอักษรแทน)
 */
(function () {
  "use strict";

  /* ----------------------------------------------------------- ผัง atlas (px) */
  var AW = 1024, AH = 512;
  var SIDE_H = 112;                          // แถวผิวข้างรถ (ตู้หัว / ตู้กลาง)
  var SIDE_Y = { cab: 0, mid: 112 };
  var ROOF_H = 64;                           // แถวหลังคา
  var ROOF_Y = { cab: 224, mid: 288 };
  var FRONT_Y = 352, FRONT_S = 160;          // หน้ารถ: ตู้หัว / ตู้ท้าย
  var FRONT_X = { head: 0, tail: 160 };
  var SW_X = 320, SW_S = 64, SW_COLS = 11;   // ช่องสีทึบ (ท้องรถ โบกี้ ล้อ ฯลฯ)
  var SW = { under: 0, bogie: 1, wheel: 2, gangway: 3, body: 4, lower: 5, roof: 6, ac: 7, panto: 8, coupler: 9, mask: 10, skirtIn: 11 };

  var TONE = { dark: "#b9c2ce", light: "#ffffff", sunset: "#f1dccd" };   // หรี่ผิวรถในธีมมืด (เหมือนผิวสถานี)
  var GLOW = { dark: 0.95, light: 0, sunset: 0.4 };                       // ไฟในตู้/ไฟหน้า ตอนกลางคืน

  /* ----------------------------------------------------------- แบบรถ
     W = กว้าง · zb = ท้องตัวถัง · zw = เอว · zc = ขอบหลังคา · top = หลังคาสูงสุด · ti = ข้างรถสอบเข้าที่ขอบหลังคา
     Lc/Lm = ยาวตู้หัว/ตู้กลาง · gap = ช่องระหว่างตัวถัง · floor = พื้นห้องโดยสาร · doors = ประตูต่อด้าน · dw = กว้างประตู
     win = ช่วงความสูงหน้าต่าง · cab = ความยาวห้องคนขับ · bogie = ระยะจากปลายตู้ถึงศูนย์โบกี้
     nose: chin = ท้องหัวรถเว้า · zbump = ขอบกันชน · zws = ขอบล่างกระจกหน้า · rakeLow = ลาดช่วงล่าง · rake = กระจกหน้าเอน
           zt0 = เริ่มโค้งลงหลังคา · crown = หลังคาโค้งลงหน้า · round = มุมหน้าโค้งมน (มองจากบน) · y0 = ช่วงหน้าแบนก่อนเริ่มโค้ง
     liv: ลายรถ — body/lower (สีตัวถัง/แถบล่างถึง lowerTop) · stripes [สี, z0, z1] · mask = ขอบกระจกหน้าสีดำ
          front: lowerTop/mask0 = ความสูงแถบล่าง/ขอบล่างกรอบดำที่หน้ารถ · lamp = ความสูงไฟหน้า · wrap = กรอบดำอ้อมมาข้างรถ (ม.) */
  function mix(base, o) {
    var r = {}, k;
    for (k in base) r[k] = base[k];
    for (k in o) r[k] = (o[k] && typeof o[k] === "object" && !Array.isArray(o[k]) && base[k] && typeof base[k] === "object") ? mix(base[k], o[k]) : o[k];
    return r;
  }
  var HEAVY = {
    mono: false, W: 3.12, zb: 0.95, zw: 2.3, zc: 3.3, top: 3.82, ti: 0.06, bev: 0.12, sq: 3,
    Lc: 22.0, Lm: 21.3, gap: 0.9, floor: 1.1, doors: 4, doorsC: 4, dw: 1.4, doorTop: 3.0, win: [1.95, 2.85], cab: 2.2, bogie: 3.4,
    nose: { chin: 0.14, zbump: 1.3, zws: 1.95, rakeLow: 0.12, rake: 0.75, zt0: 3.3, crown: 0.5, round: 0.5, y0: 0.45 },
    liv: {
      body: "#f3f5f7", lower: "#1d3c96", lowerTop: 1.72, stripes: [], glass: "#1a232d", door: null, doorBand: true,
      mask: "#0e1115", roof: "#c9ced4", label: "", led: "#ffab2e", grain: false,
      front: { lowerTop: 1.62, mask0: 1.9, ws0: 2.05, ws1: 3.4, lamp: 1.45, wrap: 1.2, label: 1.78 }
    }
  };
  var MONO = mix(HEAVY, {
    mono: "straddle", W: 3.14, zb: 0.15, skirt: -0.85, skIn: 0.56, zw: 1.7, zc: 2.9, top: 3.38, ti: 0.14, bev: 0.1, sq: 2.6,
    Lc: 13.2, Lm: 11.4, gap: 0.7, floor: 0.5, doors: 2, doorsC: 2, dw: 1.6, doorTop: 2.55, win: [1.2, 2.62], cab: 2.2, bogie: 2.6,
    nose: { chin: 0.45, zbump: 0.6, zws: 1.15, rakeLow: 0.3, rake: 1.05, zt0: 2.85, crown: 0.75, round: 1.0, y0: 0 },
    liv: { lowerTop: 1.18, roof: "#dfe2e6", front: { lowerTop: 0.95, mask0: 1.05, ws0: 1.15, ws1: 2.95, lamp: 0.72, wrap: 1.6, label: 0.4 } }
  });

  // Innovia 300 (เหลือง/ชมพู): ตัวถังขาว ชายกระโปรงเทา ประตูเทา แถบสีสายหลายเส้นใต้หน้าต่าง + เส้นบางใต้หลังคา
  function monoLivery(c) {
    return {
      body: "#f6f6f3", lower: "#9ea5ad", lowerTop: 0.2, door: "#a4abb3", doorBand: false, label: "MRT", roof: "#dfe2e6",
      stripes: [[c, 1.22, 1.3], [c, 1.34, 1.42], [c, 1.46, 1.54], [c, 1.58, 1.66], [c, 2.76, 2.84]],
      front: { style: "mono", lineColor: c, bands: [[1.42, 1.5], [1.54, 1.62], [1.66, 1.74]], mouthTop: 0.95,
        mask0: 1.8, ws0: 1.88, ws1: 3.05, lamp: 1.1, lampY: 0.5, wrap: 1.8, label: null }
    };
  }

  var SPECS = {
    bts: mix(HEAVY, {
      name: "BTS สายสุขุมวิท/สีลม", maker: "Siemens (EMU-A1/A2) · CRRC (EMU-B)",
      liv: { body: "#f3f5f7", lower: "#1f3f9a", lowerTop: 1.72, stripes: [["#d7262e", 3.02, 3.26]], label: "BTS",
        front: { lowerTop: 1.62, mask0: 1.9 } }
    }),
    blue: mix(HEAVY, {
      name: "MRT สายสีน้ำเงิน", maker: "Siemens Modular Metro / Inspiro",
      Lc: 21.8, Lm: 21.1, zc: 3.25, top: 3.75, doors: 3, doorsC: 3, dw: 1.5,
      nose: { rake: 0.7, round: 0.45, y0: 0.4, zt0: 3.25 },
      liv: { body: "#eef1f4", lower: "#17336e", lowerTop: 1.62, stripes: [["#3a8fd8", 1.62, 1.74], ["#17336e", 3.02, 3.12]], label: "MRT",
        front: { lowerTop: 1.55, mask0: 1.85, ws1: 3.35 } }
    }),
    purple: mix(HEAVY, {
      name: "MRT สายสีม่วง", maker: "J-TREC sustina (สเตนเลส)",
      W: 3.1, Lc: 20.6, Lm: 20.0, zc: 3.2, top: 3.7, sq: 4, doors: 4, doorsC: 4, dw: 1.3, win: [1.95, 2.8], bogie: 3.1,
      nose: { rakeLow: 0.05, rake: 0.32, zt0: 3.2, crown: 0.3, round: 0.3, y0: 0.62 },
      liv: { body: "#c9ced4", lower: "#c0c5cb", lowerTop: 1.0, grain: true, door: "#bfc4ca", doorBand: false,
        stripes: [["#7a2582", 1.6, 1.86], ["#c79bd0", 1.86, 1.92], ["#7a2582", 2.98, 3.1]], roof: "#b9bec4", label: "MRT",
        front: { lowerTop: 1.6, mask0: 1.8, ws1: 3.3, frontLower: "#7a2582" } }
    }),
    // ตามภาพถ่ายจริง: ตัวถังขาว แถบน้ำเงินใต้หน้าต่าง อ้อมขึ้นข้างกระจกหน้าเป็นรูปตัว U · ไฟหน้ากลม · ชายล่างเทา
    arl: mix(HEAVY, {
      name: "แอร์พอร์ต เรล ลิงก์", maker: "Siemens Desiro",
      W: 2.84, zb: 1.0, zc: 3.25, top: 3.78, Lc: 20.3, Lm: 20.0, doors: 2, doorsC: 2, dw: 1.35, win: [1.95, 2.9], bogie: 3.0,
      nose: { chin: 0.3, zbump: 1.35, zws: 1.8, rakeLow: 0.32, rake: 1.05, zt0: 3.25, crown: 0.55, round: 0.6, y0: 0.35 },
      liv: { body: "#f4f5f7", lower: "#8d96a0", lowerTop: 1.2, stripes: [["#1f4fb4", 1.5, 1.86]], label: "ARL", roof: "#d3d7dc",
        front: { style: "arl", swoosh: "#1f4fb4", skirt: "#8d96a0", skirtTop: 1.25, b0: 1.5, b1: 1.9, armTop: 2.7,
          ws0: 1.98, ws1: 3.3, led: [3.36, 3.56], lamp: 1.7, lampY: 0.5, lampShape: "round", wrap: 0, label: null } }
    }),
    // ตามภาพถ่ายจริง: หน้ารถแดงล้อมกรอบดำใหญ่ · หลังคาขาว · ชายล่างขาวเงิน · ข้างรถสเตนเลส แถบแดงช่วงหน้าต่าง
    srt: mix(HEAVY, {
      name: "รถไฟชานเมืองสายสีแดง", maker: "Hitachi AT100",
      W: 3.08, zb: 1.0, zc: 3.3, top: 3.86, Lc: 20.4, Lm: 20.0, doors: 3, doorsC: 3, dw: 1.4, bogie: 3.1,
      nose: { rakeLow: 0.04, rake: 0.3, zt0: 3.3, crown: 0.35, round: 0.32, y0: 0.6 },
      liv: { body: "#c9cdd2", grain: true, lower: "#b9bec4", lowerTop: 1.08, door: "#bfc4ca", doorBand: false,
        stripes: [["#d2152b", 1.78, 3.08]], roof: "#c3c8ce", label: "SRT",
        front: { style: "srt", frame: "#d2152b", skirt: "#e9ecef", skirtTop: 1.45, cap: "#eef0f2", capZ: 3.66, inset: 0.24,
          mask0: 2.0, mask1: 3.62, ws0: 2.4, ws1: 3.45, lamp: 2.18, lampY: 0.62, wrap: 1.0, wrapColor: "#d2152b", wrap0: 1.45, label: null } }
    }),
    // ตามภาพถ่ายจริง (สายสีเหลือง): หัวแหลม กระจกดำอ้อมรอบ · แถบเหลืองหลายเส้นใต้หน้าต่าง · ประตู/ชายกระโปรงเทา
    yellow: mix(MONO, {
      name: "MRT สายสีเหลือง (โมโนเรล)", maker: "Alstom Innovia Monorail 300",
      win: [1.75, 2.66], doorTop: 2.62,
      nose: { chin: 0.5, zbump: 0.7, zws: 1.35, rakeLow: 0.45, rake: 1.3, zt0: 2.9, crown: 0.7, round: 1.05, y0: 0 },
      liv: monoLivery("#f2b01e")
    }),
    pink: mix(MONO, {
      name: "MRT สายสีชมพู (โมโนเรล)", maker: "Alstom Innovia Monorail 300",
      win: [1.75, 2.66], doorTop: 2.62,
      nose: { chin: 0.5, zbump: 0.7, zws: 1.35, rakeLow: 0.45, rake: 1.3, zt0: 2.9, crown: 0.7, round: 1.05, y0: 0 },
      liv: monoLivery("#e0559a")
    }),
    gold: mix(MONO, {
      name: "BTS สายสีทอง", maker: "Alstom Innovia APM 300 (ล้อยาง)",
      mono: "apm", W: 2.85, zb: 0.3, skirt: -0.25, skIn: 0.52, zw: 1.6, zc: 2.7, top: 3.12, Lc: 12.75, Lm: 12.75, bogie: 2.5,
      doors: 2, doorsC: 2, dw: 1.6, doorTop: 2.45, win: [1.2, 2.5], floor: 0.45,
      nose: { chin: 0.2, zbump: 0.65, zws: 1.15, rakeLow: 0.15, rake: 0.55, zt0: 2.7, crown: 0.5, round: 0.55, y0: 0.2 },
      liv: { body: "#f6f5f1", lower: "#b88c0a", lowerTop: 1.1, stripes: [["#b88c0a", 2.52, 2.68]], label: "BTS",
        front: { lowerTop: 0.95, mask0: 1.05, ws0: 1.15, ws1: 2.72, lamp: 0.75, label: 0.45 } }
    })
  };

  /* สาย → แบบรถ + จำนวนตู้ตามที่ให้บริการจริง · panto = ลำดับตู้ที่มีแพนโทกราฟ (ไฟฟ้าเหนือหัว 25 kV) */
  var LINES = {
    "bts-sukhumvit": { spec: "bts", cars: 4 },
    "bts-silom": { spec: "bts", cars: 4 },
    "bts-gold": { spec: "gold", cars: 2 },
    "mrt-blue": { spec: "blue", cars: 3 },
    "mrt-purple": { spec: "purple", cars: 3 },
    "mrt-yellow": { spec: "yellow", cars: 4 },
    "mrt-pink": { spec: "pink", cars: 4 },
    "arl": { spec: "arl", cars: 4, panto: [1] },
    "srt-dark-red": { spec: "srt", cars: 6, panto: [1, 4] },
    "srt-light-red": { spec: "srt", cars: 4, panto: [1] }
  };

  /* ตำแหน่งตู้ในขบวน: ศูนย์กลางตู้ i อยู่หลังศูนย์กลางตู้หัว off[i] ม. */
  function layout(lineId) {
    var cfg = LINES[lineId];
    if (!cfg) return null;
    var S = SPECS[cfg.spec], n = cfg.cars, types = [], lens = [], off = [], i;
    for (i = 0; i < n; i++) {
      var t = i === 0 ? "head" : i === n - 1 ? "tail" : (cfg.panto && cfg.panto.indexOf(i) >= 0 ? "midP" : "mid");
      types.push(t);
      lens.push(t === "head" || t === "tail" ? S.Lc : S.Lm);
      off.push(i ? off[i - 1] + lens[i - 1] / 2 + S.gap + lens[i] / 2 : 0);
    }
    return { spec: cfg.spec, S: S, cars: n, types: types, lens: lens, off: off,
      len: off[n - 1] + lens[0] / 2 + lens[n - 1] / 2, rail: S.mono ? 0 : 0.18 };
  }

  /* ----------------------------------------------------------- รูปทรงหัวรถ
     x ของผิวหน้ารถ ณ จุด (y, z) บนหน้าตัด — ลาดเอียงตามความสูง + มุมโค้งมนตามแนวขวาง */
  function noseX(S, L, y, z) {
    var N = S.nose, x = L / 2;
    if (z < N.zbump) { var t = Math.min(1, (N.zbump - z) / Math.max(0.05, N.zbump - S.zb)); x -= N.chin * t * t; }
    else if (z < N.zws) x -= N.rakeLow * (z - N.zbump) / (N.zws - N.zbump);
    else x -= N.rakeLow + N.rake * Math.pow(Math.min(1, (z - N.zws) / Math.max(0.05, N.zt0 - N.zws)), 1.3);
    if (z > N.zt0) { var q = Math.min(1, (z - N.zt0) / Math.max(0.05, S.top - N.zt0)); x -= N.crown * (1 - Math.sqrt(1 - q * q)); }
    var yn = Math.min(1, Math.abs(y) / (S.W / 2)), qy = Math.max(0, (yn - N.y0) / (1 - N.y0));
    return x - N.round * (1 - Math.sqrt(Math.max(0, 1 - qy * qy)));
  }

  /* หน้าตัดขวางตัวถัง (วงปิด ทวนเข็มเมื่อมองจากหน้ารถ เริ่มกลางท้องรถ) */
  function profileOf(S, lod) {
    var hw = S.W / 2, nR = lod ? 3 : 8, a = hw - S.ti, b = S.top - S.zc, e = 2 / S.sq;
    var P = [[0, S.zb], [hw - S.bev, S.zb], [hw, S.zb + S.bev], [hw, S.zw], [a, S.zc]], j;
    for (j = 1; j < nR; j++) {
      var th = j / nR * Math.PI / 2;
      P.push([a * Math.pow(Math.cos(th), e), S.zc + b * Math.pow(Math.sin(th), e)]);
    }
    P.push([0, S.top]);
    for (j = P.length - 2; j >= 1; j--) P.push([-P[j][0], P[j][1]]);
    return P;
  }

  /* ห้องแอร์บนหลังคา / แพนโทกราฟ (ตำแหน่ง x ในตู้) */
  function acSpots(S, L, cab) {
    if (S.mono) return cab ? [-L * 0.18] : [0];
    return cab ? [-L * 0.28, L * 0.14] : [-L * 0.28, L * 0.28];
  }

  // ความยาวส่วนโค้งหลังคา (ขอบซ้าย→ขวา) ใช้แปลงความกว้างจริงเป็นพิกัดลายหลังคา
  function roofArc(S) {
    var P = profileOf(S, 0), n = P.length, s = 0;
    for (var i = 4; i < n - 4; i++) s += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]);
    return s;
  }

  /* ประตูต่อด้าน (ศูนย์กลาง x) — ตู้หัวเว้นช่วงห้องคนขับ */
  function doorCenters(S, L, cab) {
    var n = cab ? S.doorsC : S.doors, x0 = -L / 2, x1 = cab ? L / 2 - S.cab - 0.6 : L / 2, out = [];
    for (var i = 0; i < n; i++) out.push(x0 + (x1 - x0) * (i + 0.5) / n);
    return out;
  }

  /* ================================================================ วาดลายรถ (canvas) */
  function rr(g, x, y, w, h, r) {
    if (w < 0) { x += w; w = -w; }
    if (h < 0) { y += h; h = -h; }
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath();
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
    g.closePath();
  }
  var LIT = "rgba(255,233,196,0.95)";      // ไฟในห้องโดยสาร (แผ่นเรืองแสง)

  /* ผิวข้างรถ: แถวละตู้ · แกนนอน = x ตลอดความยาวตู้ · แกนตั้ง = z จากชายล่างถึงขอบหลังคา */
  function paintSide(g, S, cab, glow) {
    var V = S.liv, L = cab ? S.Lc : S.Lm, y0 = SIDE_Y[cab ? "cab" : "mid"];
    var z0 = S.mono ? S.skirt : S.zb, z1 = S.zc;
    var X = function (x) { return (x + L / 2) / L * AW; };
    var Z = function (z) { return y0 + 3 + (z1 - z) / (z1 - z0) * (SIDE_H - 6); };
    var box = function (xa, xb, za, zb, c) { g.fillStyle = c; g.fillRect(X(xa), Z(zb), X(xb) - X(xa), Z(za) - Z(zb)); };
    var rbox = function (xa, xb, za, zb, r, c) { g.fillStyle = c; rr(g, X(xa), Z(zb), X(xb) - X(xa), Z(za) - Z(zb), r); g.fill(); };
    g.save();
    g.beginPath(); g.rect(0, y0, AW, SIDE_H); g.clip();
    g.fillStyle = glow ? "#000" : V.body; g.fillRect(0, y0, AW, SIDE_H);
    if (!glow) {
      if (V.grain) for (var gx = 0; gx < AW; gx += 3) { g.fillStyle = gx % 6 ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)"; g.fillRect(gx, y0, 1, SIDE_H); }
      box(-L, L, z0 - 1, V.lowerTop, V.lower);
      V.stripes.forEach(function (s) { box(-L, L, s[1], s[2], s[0]); });
      box(-L, L, z1 - 0.05, z1 + 1, "rgba(0,0,0,0.22)");                 // รางน้ำฝนขอบหลังคา
      if (S.mono) box(-L, L, z0 - 1, z0 + 0.12, "rgba(0,0,0,0.25)");      // ชายกระโปรงคร่อมคาน
      else box(-L, L, z0 - 1, z0 + 0.06, "rgba(0,0,0,0.3)");
    }
    var doors = doorCenters(S, L, cab), hd = S.dw / 2, w0 = S.win[0], w1 = S.win[1], i, k;
    // หน้าต่างระหว่างประตู (แบ่งบานละ ~2 ม.)
    var edges = [-L / 2 + 0.55];
    doors.forEach(function (c) { edges.push(c - hd - 0.4, c + hd + 0.4); });
    edges.push(cab ? L / 2 - S.cab - 0.2 : L / 2 - 0.55);
    for (i = 0; i + 1 < edges.length; i += 2) {
      var a = edges[i], b = edges[i + 1];
      if (b - a < 0.5) continue;
      var nWin = Math.max(1, Math.round((b - a) / 2.1)), ww = (b - a) / nWin;
      for (k = 0; k < nWin; k++) {
        var xa = a + ww * k + 0.07, xb = a + ww * (k + 1) - 0.07;
        if (glow) { rbox(xa, xb, w0, w1, 3, LIT); continue; }
        rbox(xa - 0.04, xb + 0.04, w0 - 0.04, w1 + 0.04, 4, "rgba(0,0,0,0.35)");
        var gr = g.createLinearGradient(0, Z(w1), 0, Z(w0));
        gr.addColorStop(0, "#46576b"); gr.addColorStop(0.35, V.glass); gr.addColorStop(1, V.glass);
        g.fillStyle = gr; rr(g, X(xa), Z(w1), X(xb) - X(xa), Z(w0) - Z(w1), 3); g.fill();
        g.fillStyle = "rgba(255,255,255,0.07)";                              // แสงสะท้อนเฉียงบนกระจก
        g.beginPath(); g.moveTo(X(xa + 0.3), Z(w0)); g.lineTo(X(xa + 0.9), Z(w1)); g.lineTo(X(xa + 1.3), Z(w1)); g.lineTo(X(xa + 0.7), Z(w0)); g.fill();
      }
    }
    // ประตูบานเลื่อนคู่
    doors.forEach(function (c) {
      var da = c - hd, db = c + hd, fz = S.floor - 0.02, tz = S.doorTop;
      if (!glow) {
        box(da - 0.05, db + 0.05, fz - 0.03, tz + 0.05, "rgba(0,0,0,0.45)");
        box(da, db, fz, tz, V.door || V.body);
        if (V.doorBand) box(da, db, fz, Math.min(V.lowerTop, tz), V.lower);
        V.stripes.forEach(function (s) { if (s[2] < tz) box(da, db, s[1], s[2], s[0]); });
        box(c - 0.02, c + 0.02, fz, tz, "rgba(0,0,0,0.5)");
        box(da + 0.05, db - 0.05, fz, fz + 0.04, "#8b939c");
      }
      [[da + 0.14, c - 0.12], [c + 0.12, db - 0.14]].forEach(function (p) {
        rbox(p[0], p[1], w0 + 0.05, Math.min(w1, tz - 0.15), 3, glow ? LIT : V.glass);
      });
    });
    // ห้องคนขับ: กรอบดำอ้อมจากหน้ารถ + กระจกข้าง
    if (cab) {
      var xc = L / 2 - S.cab, xw = L / 2 - V.front.wrap - S.nose.round - S.nose.rakeLow;
      if (!glow) {
        // หน้ารถอ้อมมาข้าง: กรอบดำ (ค่าเริ่มต้น) หรือสีหน้ารถ (สายสีแดง) · wrap = 0 ไม่อ้อม
        if (V.front.wrap) box(xw, L, V.front.wrapColor ? V.front.wrap0 : V.front.mask0 + 0.05, z1 - 0.06, V.front.wrapColor || V.mask);
        rbox(xc + 0.3, xc + S.cab * 0.7, w0 + 0.05, w1, 4, "#1d2631");
      } else rbox(xc + 0.3, xc + S.cab * 0.7, w0 + 0.05, w1, 4, "rgba(70,56,36,1)");
    }
    if (!glow) { box(-L / 2, -L / 2 + 0.06, z0, z1, "rgba(0,0,0,0.3)"); if (!cab) box(L / 2 - 0.06, L / 2, z0, z1, "rgba(0,0,0,0.3)"); }
    g.restore();
  }

  /* หลังคา (มองจากด้านบน — มุมที่เห็นบ่อยที่สุดบนแผนที่): แผ่นหลังคา + ห้องแอร์ */
  function paintRoof(g, S, cab, glow) {
    var V = S.liv, L = cab ? S.Lc : S.Lm, y0 = ROOF_Y[cab ? "cab" : "mid"], arc = roofArc(S);
    g.fillStyle = glow ? "#000" : V.roof; g.fillRect(0, y0, AW, ROOF_H);
    if (glow) return;
    var X = function (x) { return (x + L / 2) / L * AW; };
    var Yv = function (v) { return y0 + 2 + v * (ROOF_H - 4); };
    g.fillStyle = "rgba(0,0,0,0.08)";
    for (var x = -L / 2 + 1.2; x < L / 2; x += 1.2) g.fillRect(X(x), y0, 1.5, ROOF_H);
    g.fillStyle = "rgba(0,0,0,0.2)"; g.fillRect(0, y0, AW, 3); g.fillRect(0, y0 + ROOF_H - 3, AW, 3);
    var hv = 0.95 / arc;
    acSpots(S, L, cab).forEach(function (c) {
      g.fillStyle = "#9aa1a9"; g.fillRect(X(c - 1.5), Yv(0.5 - hv), X(c + 1.5) - X(c - 1.5), Yv(0.5 + hv) - Yv(0.5 - hv));
      g.fillStyle = "#6f7780";
      for (var gx = c - 1.3; gx < c + 0.3; gx += 0.2) g.fillRect(X(gx), Yv(0.5 - hv * 0.7), 2, Yv(0.5 + hv * 0.7) - Yv(0.5 - hv * 0.7));
      g.fillStyle = "#3d444c"; g.beginPath(); g.arc(X(c + 0.8), Yv(0.5), 6, 0, 7); g.fill();
    });
  }

  /* หน้ารถ (ภาพฉายตรงบนระนาบ y–z): ลวดลายตาม F.style แล้วตามด้วยป้ายปลายทาง ไฟหน้า (ตู้หัว) / ไฟท้ายแดง (ตู้ท้าย)
       mask = กรอบดำเต็มหน้า (ค่าเริ่มต้น: BTS MRT ทอง) · srt = หน้าแดงล้อมกรอบดำ · arl = กระจกใหญ่ แถบน้ำเงินรูปตัว U
       mono = กระจกดำอ้อมรอบ แถบสีสายหลายเส้น ท้องหัวรถสีเข้ม (Innovia 300) */
  function glassPane(a, ya, yb, z0, z1, r) {
    var g = a.g, gr = g.createLinearGradient(0, a.PY(z1), 0, a.PY(z0));
    gr.addColorStop(0, "#3d4c5e"); gr.addColorStop(0.45, "#141b23"); gr.addColorStop(1, "#0b0f14");
    g.fillStyle = gr; rr(g, a.PX(ya), a.PY(z1), a.PX(yb) - a.PX(ya), a.PY(z0) - a.PY(z1), r); g.fill();
    g.fillStyle = "rgba(255,255,255,0.09)";
    var m = (ya + yb) / 2;
    g.beginPath(); g.moveTo(a.PX(m - 0.9), a.PY(z0)); g.lineTo(a.PX(m - 0.2), a.PY(z1)); g.lineTo(a.PX(m + 0.25), a.PY(z1)); g.lineTo(a.PX(m - 0.45), a.PY(z0)); g.fill();
    g.strokeStyle = "#05070a"; g.lineWidth = 2;                                 // ใบปัดน้ำฝน
    [m - 0.55, m + 0.5].forEach(function (y) { g.beginPath(); g.moveTo(a.PX(y), a.PY(z0 + 0.05)); g.lineTo(a.PX(y - 0.35), a.PY(Math.min(z1, z0 + 0.8))); g.stroke(); });
  }
  var FRONT_PAINT = {
    mask: function (a) {
      var F = a.F, V = a.V, hw = a.hw;
      a.box(-hw - 1, hw + 1, a.za - 1, F.lowerTop, F.frontLower || V.lower);
      a.box(-hw - 1, hw + 1, a.za - 1, a.za + 0.14, "#2b3036");                   // กันชน/กันไต่
      a.rbox(-hw - 0.2, hw + 0.2, F.mask0, a.zt + 0.6, 16, V.mask);               // กรอบดำหน้ารถ
      glassPane(a, -hw + 0.2, hw - 0.2, F.ws0, F.ws1, 10);
    },
    srt: function (a) {
      var F = a.F, V = a.V, hw = a.hw;
      a.box(-hw - 1, hw + 1, a.za - 1, a.zt + 1, F.frame);                       // หน้ารถแดง
      a.box(-hw - 1, hw + 1, a.za - 1, F.skirtTop, F.skirt);                     // ชายล่างขาวเงิน
      a.rbox(-0.55, 0.55, a.za - 0.2, a.za + 0.42, 8, "#1b1e22");                // ช่องขอพ่วง
      a.box(-hw - 1, hw + 1, F.capZ, a.zt + 1, F.cap);                           // หลังคาขาว
      a.rbox(-hw + F.inset, hw - F.inset, F.mask0, F.mask1, 18, V.mask);         // กรอบดำใหญ่
      glassPane(a, -hw + F.inset + 0.16, hw - F.inset - 0.16, F.ws0, F.ws1, 12);
    },
    arl: function (a) {
      var F = a.F, hw = a.hw;
      a.box(-hw - 1, hw + 1, a.za - 1, F.skirtTop, F.skirt);                     // ชายล่างเทา
      a.rbox(-0.5, 0.5, a.za - 0.2, a.za + 0.36, 8, "#1b1e22");                  // ช่องขอพ่วง
      a.box(-hw - 1, hw + 1, F.b0, F.b1, F.swoosh);                              // แถบน้ำเงินใต้กระจก…
      [-1, 1].forEach(function (s) {                                             // …อ้อมขึ้นข้างกระจกเป็นตัว U
        var y0 = s > 0 ? hw - 0.3 : -hw - 0.2, y1 = s > 0 ? hw + 0.2 : -hw + 0.3;
        a.rbox(y0, y1, F.b0, F.armTop, 10, F.swoosh);
      });
      a.rbox(-0.72, 0.72, F.led[0] - 0.05, F.led[1] + 0.05, 5, "#15181c");      // กรอบป้ายเหนือกระจก
      glassPane(a, -hw + 0.42, hw - 0.42, F.ws0, F.ws1, 16);
    },
    mono: function (a) {
      var F = a.F, V = a.V, hw = a.hw;
      a.box(-hw - 1, hw + 1, a.za - 1, F.mouthTop, "#1c1f23");                   // ท้องหัวรถสีเข้ม (ชุดล้อประคอง)
      F.bands.forEach(function (b) { a.box(-hw - 1, hw + 1, b[0], b[1], F.lineColor); });
      a.rbox(-hw - 0.2, hw + 0.2, F.mask0, a.zt + 0.6, 22, V.mask);              // กระจกดำอ้อมรอบ
      glassPane(a, -hw + 0.3, hw - 0.3, F.ws0, F.ws1, 18);
    }
  };
  function paintFront(g, S, kind, glow) {
    var V = S.liv, F = V.front, hw = S.W / 2, za = S.zb, zt = S.top, x0 = FRONT_X[kind], tail = kind === "tail";
    var PX = function (y) { return x0 + 2 + (y + hw) / S.W * (FRONT_S - 4); };
    var PY = function (z) { return FRONT_Y + 2 + (zt - z) / (zt - za) * (FRONT_S - 4); };
    var box = function (ya, yb, z0, z1, c) { g.fillStyle = c; g.fillRect(PX(ya), PY(z1), PX(yb) - PX(ya), PY(z0) - PY(z1)); };
    var rbox = function (ya, yb, z0, z1, r, c) { g.fillStyle = c; rr(g, PX(ya), PY(z1), PX(yb) - PX(ya), PY(z0) - PY(z1), r); g.fill(); };
    var a = { g: g, S: S, V: V, F: F, hw: hw, za: za, zt: zt, PX: PX, PY: PY, box: box, rbox: rbox };
    g.save();
    g.beginPath(); g.rect(x0, FRONT_Y, FRONT_S, FRONT_S); g.clip();
    g.fillStyle = glow ? "#000" : V.body; g.fillRect(x0, FRONT_Y, FRONT_S, FRONT_S);
    if (!glow) (FRONT_PAINT[F.style] || FRONT_PAINT.mask)(a);
    var d0 = F.led ? F.led[0] : F.ws1 - 0.34, d1 = F.led ? F.led[1] : F.ws1 - 0.08;   // ป้ายปลายทาง LED
    if (!glow) box(-0.62, 0.62, d0, d1, "#050608");
    if (!tail && V.label) {
      g.fillStyle = glow ? V.led : "#d88a1c";
      g.font = "bold " + Math.max(7, Math.round((PY(d0) - PY(d1)) * 0.8)) + "px sans-serif";
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(V.label, PX(0), (PY(d0) + PY(d1)) / 2 + 0.5);
    }
    // ไฟหน้า/ไฟท้าย · ตู้หัว: ไฟหน้าขาวติด ไฟท้ายดับ · ตู้ท้าย: ไฟท้ายแดงติด ไฟหน้าดับ
    var lz = F.lamp, ly = hw - (F.lampY || 0.42), kx = (FRONT_S - 4) / S.W, kz = (FRONT_S - 4) / (zt - za);
    [-1, 1].forEach(function (s) {
      if (F.lampShape === "round") {
        var oval = function (r, c) { g.fillStyle = c; g.beginPath(); g.ellipse(PX(s * ly), PY(lz), r * kx, r * kz, 0, 0, Math.PI * 2); g.fill(); };
        if (!glow) oval(0.2, "#15181c");
        oval(0.13, glow ? (tail ? "#ff2418" : "#ffffff") : (tail ? "#e2362c" : "#fff3d2"));
        return;
      }
      var ya = s * ly - 0.26, yb = s * ly + 0.26, yi = s * (ly - 0.44);
      if (!glow) rbox(Math.min(ya, yi - 0.12) - 0.04, Math.max(yb, yi + 0.12) + 0.04, lz - 0.13, lz + 0.13, 5, "#15181c");
      rbox(ya, yb, lz - 0.09, lz + 0.09, 4, glow ? (tail ? "#000" : "#ffffff") : (tail ? "#dfe5ec" : "#f6f9ff"));
      rbox(yi - 0.11, yi + 0.11, lz - 0.08, lz + 0.08, 3, glow ? (tail ? "#ff2418" : "#000") : (tail ? "#e2362c" : "#6e1612"));
    });
    if (!glow && V.label && typeof F.label === "number") {                       // ชื่อผู้ให้บริการ (ตัวอักษร ไม่ใช่โลโก้)
      g.fillStyle = "#ffffff";
      g.font = "bold " + Math.round(0.2 / (zt - za) * (FRONT_S - 4)) + "px sans-serif";
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(V.label, PX(0), PY(F.label));
    }
    g.restore();
  }

  function paintSwatches(g, S, glow) {
    var V = S.liv, col = {};
    col[SW.under] = "#262a2f"; col[SW.bogie] = "#353a40"; col[SW.wheel] = "#737a82"; col[SW.gangway] = "#1b1e22";
    col[SW.body] = V.body; col[SW.lower] = V.lower; col[SW.roof] = V.roof; col[SW.ac] = "#a9b0b8"; col[SW.panto] = "#4b5159";
    col[SW.coupler] = "#2e3338"; col[SW.mask] = V.mask; col[SW.skirtIn] = "#2a2d31";
    for (var i = 0; i < SW_COLS * 2; i++) {
      g.fillStyle = glow ? "#000" : (col[i] || "#808080");
      g.fillRect(SW_X + (i % SW_COLS) * SW_S, FRONT_Y + Math.floor(i / SW_COLS) * SW_S, SW_S, SW_S);
    }
  }
  function swUV(i) {
    return [(SW_X + (i % SW_COLS) * SW_S + SW_S / 2) / AW, 1 - (FRONT_Y + Math.floor(i / SW_COLS) * SW_S + SW_S / 2) / AH];
  }

  /* แผ่นลายหนึ่งแผ่นต่อแบบรถ · glow = แผ่นเรืองแสง (ย่อครึ่งหนึ่ง พิกัดเดิมใช้ได้เพราะ uv เป็นสัดส่วน) */
  function atlas(S, glow) {
    var cv = document.createElement("canvas");
    cv.width = AW; cv.height = AH;
    var g = cv.getContext("2d");
    g.fillStyle = "#000"; g.fillRect(0, 0, AW, AH);
    paintSide(g, S, true, glow); paintSide(g, S, false, glow);
    paintRoof(g, S, true, glow); paintRoof(g, S, false, glow);
    paintFront(g, S, "head", glow); paintFront(g, S, "tail", glow);
    paintSwatches(g, S, glow);
    if (!glow) return cv;
    var sm = document.createElement("canvas");
    sm.width = AW / 2; sm.height = AH / 2;
    sm.getContext("2d").drawImage(cv, 0, 0, AW / 2, AH / 2);
    return sm;
  }

  /* ================================================================ รูปทรง */
  var FLIP = false;         // สลับลำดับจุดของทุกหน้า (ถ้าฉากกลับด้านหน้า-หลัง)
  function nrm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function neg(a) { return [-a[0], -a[1], -a[2]]; }

  function GB() { this.p = []; this.n = []; this.uv = []; this.i = []; }
  GB.prototype.v = function (x, y, z, n, uv) {
    this.p.push(x, y, z); this.n.push(n[0], n[1], n[2]); this.uv.push(uv[0], uv[1]);
    return this.p.length / 3 - 1;
  };
  // ทวนเข็มเมื่อมองจากด้านนอก
  GB.prototype.q = function (a, b, c, d) { if (FLIP) this.i.push(a, c, b, a, d, c); else this.i.push(a, b, c, a, c, d); };
  GB.prototype.t = function (a, b, c) { if (FLIP) this.i.push(a, c, b); else this.i.push(a, b, c); };
  // กล่องหมุนได้: c = ศูนย์กลาง · A B C = ครึ่งแกน (ระบบมือขวา) · skip[k] = ไม่สร้างหน้าที่ k (+A −A +B −B +C −C)
  GB.prototype.obox = function (c, A, B, C, uv, skip) {
    var F = [[A, B, C], [neg(A), C, B], [B, C, A], [neg(B), A, C], [C, A, B], [neg(C), B, A]];
    for (var k = 0; k < 6; k++) {
      if (skip && skip[k]) continue;
      var N = F[k][0], R = F[k][1], U = F[k][2], n = nrm(N), s = this.p.length / 3;
      for (var j = 0; j < 4; j++) {
        var sr = j === 0 || j === 3 ? -1 : 1, su = j < 2 ? -1 : 1;
        this.v(c[0] + N[0] + R[0] * sr + U[0] * su, c[1] + N[1] + R[1] * sr + U[1] * su, c[2] + N[2] + R[2] * sr + U[2] * su, n, uv);
      }
      this.q(s, s + 1, s + 2, s + 3);
    }
  };
  GB.prototype.abox = function (x0, x1, y0, y1, z0, z1, uv, skip) {
    this.obox([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], [(x1 - x0) / 2, 0, 0], [0, (y1 - y0) / 2, 0], [0, 0, (z1 - z0) / 2], uv, skip);
  };
  // แท่งจาก p ถึง q (ในระนาบ x–z) กว้างตามแกน y = 2·wy หนา 2·th
  GB.prototype.seg = function (p, q, wy, th, uv) {
    var A = [(q[0] - p[0]) / 2, (q[1] - p[1]) / 2, (q[2] - p[2]) / 2], B = [0, wy, 0], C = nrm(cross(A, B));
    this.obox([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2], A, B, [C[0] * th, C[1] * th, C[2] * th], uv);
  };
  // ล้อ (ทรงกระบอกตามแกน y)
  GB.prototype.wheel = function (cx, cy, cz, r, w, seg, uv) {
    var P = function (a, y) { return [cx + r * Math.cos(a), cy + y, cz + r * Math.sin(a)]; }, G = this, j;
    for (j = 0; j < seg; j++) {
      var a0 = j / seg * Math.PI * 2, a1 = (j + 1) / seg * Math.PI * 2;
      var n0 = [Math.cos(a0), 0, Math.sin(a0)], n1 = [Math.cos(a1), 0, Math.sin(a1)];
      var p = P(a0, -w), q = P(a0, w), s = P(a1, w), t = P(a1, -w);
      G.q(G.v(p[0], p[1], p[2], n0, uv), G.v(q[0], q[1], q[2], n0, uv), G.v(s[0], s[1], s[2], n1, uv), G.v(t[0], t[1], t[2], n1, uv));
    }
    [-1, 1].forEach(function (sg) {
      var c = G.v(cx, cy + sg * w, cz, [0, sg, 0], uv);
      for (j = 0; j < seg; j++) {
        var a0 = j / seg * Math.PI * 2, a1 = (j + 1) / seg * Math.PI * 2, p0 = P(a0, sg * w), p1 = P(a1, sg * w);
        var i0 = G.v(p0[0], p0[1], p0[2], [0, sg, 0], uv), i1 = G.v(p1[0], p1[1], p1[2], [0, sg, 0], uv);
        if (sg > 0) G.t(c, i1, i0); else G.t(c, i0, i1);
      }
    });
  };

  /* ตัวถัง: ผิวข้าง/หลังคา/ท้องรถ ยืดตามแนว x · ปลายหลังเรียบ (ข้อต่อ) · ปลายหน้า = หัวรถ (ตู้หัว/ท้าย) หรือเรียบ (ตู้กลาง) */
  function body(G, S, lod, kind, L) {
    var cab = kind === "head" || kind === "tail", P = profileOf(S, lod), n = P.length, i, j, r;
    var x0 = -L / 2, z0 = S.mono ? S.skirt : S.zb;
    var sideY = SIDE_Y[cab ? "cab" : "mid"], roofY = ROOF_Y[cab ? "cab" : "mid"];
    var xe = function (p) { return cab ? noseX(S, L, p[0], p[1]) : L / 2; };
    var sideUV = function (x, z) { return [(x - x0) / L, 1 - (sideY + 3 + (S.zc - z) / (S.zc - z0) * (SIDE_H - 6)) / AH]; };
    var roofUV = function (x, v) { return [(x - x0) / L, 1 - (roofY + 2 + v * (ROOF_H - 4)) / AH]; };
    // พิกัดตามส่วนโค้งหลังคา 0..1 (จุด 4 = ขอบหลังคาขวา ถึงจุด n−4 = ขอบซ้าย)
    var rv = [], acc = 0, tot = 0;
    for (i = 4; i < n - 4; i++) tot += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]);
    for (i = 4; i <= n - 4; i++) { rv[i] = acc / tot; if (i < n - 4) acc += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); }
    // normal ของขอบ (ออกนอก) · จุดมุมคม (>40°) แยก normal ตามขอบ ไม่เฉลี่ย
    var En = [];
    for (i = 0; i < n; i++) {
      var a = P[i], b = P[(i + 1) % n], ty = b[0] - a[0], tz = b[1] - a[1], l = Math.hypot(ty, tz) || 1;
      En.push([tz / l, -ty / l]);
    }
    var vn = function (v, e) {
      var p = En[(v - 1 + n) % n], q = En[v];
      if (p[0] * q[0] + p[1] * q[1] < 0.77) return [0, En[e][0], En[e][1]];
      var s = Math.hypot(p[0] + q[0], p[1] + q[1]);
      return [0, (p[0] + q[0]) / s, (p[1] + q[1]) / s];
    };
    var under = swUV(SW.under);
    for (i = 0; i < n; i++) {
      j = (i + 1) % n;
      var A = P[i], B = P[j], na = vn(i, i), nb = vn(j, i), xa = xe(A), xb = xe(B), u;
      if (i === 0 || i === n - 1) u = [under, under, under, under];
      else if (i >= 4 && i < n - 4) u = [roofUV(x0, rv[i]), roofUV(x0, rv[j]), roofUV(xb, rv[j]), roofUV(xa, rv[i])];
      else u = [sideUV(x0, A[1]), sideUV(x0, B[1]), sideUV(xb, B[1]), sideUV(xa, A[1])];
      G.q(G.v(x0, A[0], A[1], na, u[0]), G.v(x0, B[0], B[1], nb, u[1]), G.v(xb, B[0], B[1], nb, u[2]), G.v(xa, A[0], A[1], na, u[3]));
    }
    // ปลายเรียบ (ด้านข้อต่อ)
    var cz = (S.zb + S.top) / 2, bodyUV = swUV(SW.body);
    var flat = function (x, sg) {
      var c = G.v(x, 0, cz, [sg, 0, 0], bodyUV), ids = [];
      for (var k = 0; k < n; k++) ids.push(G.v(x, P[k][0], P[k][1], [sg, 0, 0], bodyUV));
      for (k = 0; k < n; k++) { if (sg > 0) G.t(ids[k], ids[(k + 1) % n], c); else G.t(ids[(k + 1) % n], ids[k], c); }
    };
    flat(x0, -1);
    if (!cab) flat(L / 2, 1);
    else {
      // หัวรถ: วงซ้อนหดเข้าหาศูนย์กลาง x = noseX(y, z) · normal จากความชันผิว · ลายจากภาพหน้ารถ
      var fx = FRONT_X[kind === "tail" ? "tail" : "head"], hw = S.W / 2;
      var fUV = function (y, z) {
        return [(fx + 2 + (y + hw) / S.W * (FRONT_S - 4)) / AW, 1 - (FRONT_Y + 2 + (S.top - z) / (S.top - S.zb) * (FRONT_S - 4)) / AH];
      };
      var nAt = function (y, z) {
        var h = 0.01, gy = (noseX(S, L, y + h, z) - noseX(S, L, y - h, z)) / (2 * h), gz = (noseX(S, L, y, z + h) - noseX(S, L, y, z - h)) / (2 * h);
        return nrm([1, -gy, -gz]);
      };
      var rings = lod ? [1, 0.8, 0.45] : [1, 0.97, 0.9, 0.78, 0.62, 0.42, 0.2], idx = [];
      for (r = 0; r < rings.length; r++) {
        var s = rings[r], sn = Math.min(s, 0.985), row = [];
        for (i = 0; i < n; i++) {
          var y = P[i][0] * s, z = cz + (P[i][1] - cz) * s;
          row.push(G.v(noseX(S, L, y, z), y, z, nAt(P[i][0] * sn, cz + (P[i][1] - cz) * sn), fUV(y, z)));
        }
        idx.push(row);
      }
      for (r = 0; r + 1 < rings.length; r++) for (i = 0; i < n; i++) { j = (i + 1) % n; G.q(idx[r][i], idx[r][j], idx[r + 1][j], idx[r + 1][i]); }
      var cc = G.v(noseX(S, L, 0, cz), 0, cz, [1, 0, 0], fUV(0, cz)), last = idx[idx.length - 1];
      for (i = 0; i < n; i++) G.t(last[i], last[(i + 1) % n], cc);
    }
    // ชายกระโปรงคร่อมคาน (โมโนเรล/APM): ด้านนอกใช้ลายข้างรถ ที่เหลือสีเข้ม
    if (S.mono) [-1, 1].forEach(function (sg) {
      var yo = sg * S.W / 2, yi = sg * S.skIn, xs = x0 + 0.25, xf = cab ? noseX(S, L, yo * 0.98, S.zb) - 0.12 : L / 2 - 0.25;
      var skip = {}; skip[sg > 0 ? 2 : 3] = true;
      G.abox(xs, xf, Math.min(yo, yi), Math.max(yo, yi), S.skirt, S.zb + 0.02, swUV(SW.skirtIn), skip);
      var nO = [0, sg, 0], p = [G.v(xs, yo, S.skirt, nO, sideUV(xs, S.skirt)), G.v(xf, yo, S.skirt, nO, sideUV(xf, S.skirt)),
        G.v(xf, yo, S.zb + 0.02, nO, sideUV(xf, S.zb)), G.v(xs, yo, S.zb + 0.02, nO, sideUV(xs, S.zb))];
      if (sg > 0) G.q(p[1], p[0], p[3], p[2]); else G.q(p[0], p[1], p[2], p[3]);
    });
  }

  /* รายละเอียดเฉพาะ LOD 0 */
  function extras(G, S, kind, L) {
    var cab = kind === "head" || kind === "tail", bc = L / 2 - S.bogie, i;
    if (!S.mono) {
      [-bc, bc].forEach(function (bx) {
        G.abox(bx - 1.35, bx + 1.35, -0.9, 0.9, 0.5, 0.8, swUV(SW.bogie));                     // โครงโบกี้
        [-1, 1].forEach(function (sg) {
          G.abox(bx - 1.3, bx + 1.3, sg * 0.98 - 0.09, sg * 0.98 + 0.09, 0.3, 0.72, swUV(SW.bogie));   // โครงข้าง
          [bx - 1.1, bx + 1.1].forEach(function (wx) { G.wheel(wx, sg * 0.75, 0.42, 0.42, 0.07, 12, swUV(SW.wheel)); });
          G.abox(bx - 0.3, bx + 0.3, sg * 1.18 - 0.14, sg * 1.18 + 0.14, 0.72, S.zb, swUV(SW.under));  // สปริงลม
        });
      });
      var ea = -bc + 1.9, eb = bc - 1.9, w = (eb - ea) / 3;                                     // อุปกรณ์ใต้ท้อง
      for (i = 0; i < 3; i++) G.abox(ea + w * i + 0.3, ea + w * (i + 1) - 0.3, -1.15 + (i % 2) * 0.25, 1.15 - (i % 2) * 0.1, 0.55 + (i % 2) * 0.08, S.zb, swUV(SW.under));
    } else {
      [-bc, bc].forEach(function (bx) { G.abox(bx - 1.1, bx + 1.1, -S.skIn + 0.03, S.skIn - 0.03, 0.02, S.zb, swUV(SW.under)); });   // ชุดล้อบนคาน
    }
    var gz0 = S.zb + (S.mono ? 0.3 : 0.15), gz1 = S.zc - 0.1, gh = S.gap / 2 + 0.03;          // ยางข้อต่อระหว่างตู้
    G.abox(-L / 2 - gh, -L / 2 + 0.02, -0.75, 0.75, gz0, gz1, swUV(SW.gangway));
    if (!cab) G.abox(L / 2 - 0.02, L / 2 + gh, -0.75, 0.75, gz0, gz1, swUV(SW.gangway));
    if (cab && !S.mono) {                                                                       // ขอพ่วงใต้หัวรถ
      var xn = noseX(S, L, 0, S.zb + 0.05);
      G.abox(xn - 0.7, xn + 0.1, -0.2, 0.2, S.zb - 0.2, S.zb + 0.04, swUV(SW.coupler));
    }
    acSpots(S, L, cab).forEach(function (c) {                                                  // ห้องแอร์ + ตะแกรงพัดลม
      G.abox(c - 1.5, c + 1.5, -0.95, 0.95, S.top - 0.12, S.top + 0.26, swUV(SW.ac));
      G.abox(c + 0.45, c + 1.15, -0.35, 0.35, S.top + 0.26, S.top + 0.31, swUV(SW.coupler));
    });
    if (kind === "midP") {                                                                     // แพนโทกราฟแขนเดี่ยว
      var t = S.top;
      [[-0.85, -0.6], [-0.85, 0.6], [0.85, -0.6], [0.85, 0.6]].forEach(function (p) {
        G.abox(p[0] - 0.07, p[0] + 0.07, p[1] - 0.07, p[1] + 0.07, t - 0.05, t + 0.28, swUV(SW.ac));   // ลูกถ้วยฉนวน
      });
      G.abox(-1.0, 1.0, -0.75, 0.75, t + 0.28, t + 0.36, swUV(SW.panto));
      G.seg([-0.7, 0, t + 0.38], [0.7, 0, t + 1.0], 0.26, 0.05, swUV(SW.panto));
      G.seg([0.7, 0, t + 1.0], [-0.3, 0, t + 1.62], 0.18, 0.04, swUV(SW.panto));
      G.abox(-0.42, -0.18, -0.95, 0.95, t + 1.6, t + 1.68, swUV(SW.coupler));
    }
  }

  function buildGeometry(T, specId, kind, lod) {
    var S = SPECS[specId], L = kind === "head" || kind === "tail" ? S.Lc : S.Lm, G = new GB();
    body(G, S, lod, kind, L);
    if (!lod) extras(G, S, kind, L);
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(G.p, 3));
    g.setAttribute("normal", new T.Float32BufferAttribute(G.n, 3));
    g.setAttribute("uv", new T.Float32BufferAttribute(G.uv, 2));
    g.setIndex(new T.BufferAttribute(G.p.length / 3 > 65535 ? new Uint32Array(G.i) : new Uint16Array(G.i), 1));
    g.computeBoundingSphere();
    return g;
  }

  /* ================================================================ ใช้งาน */
  window.BKK_TRAIN_MODELS = {
    SPECS: SPECS,
    LINES: LINES,
    layout: layout,
    /* สร้างคลังรูปทรง/วัสดุ (แคชในตัว) ผูกกับ three.js ของฉากกลาง */
    create: function (T, theme) {
      var geoms = {}, mats = {}, texs = [];
      var tex = function (cv) { var t = new T.CanvasTexture(cv); texs.push(t); return t; };
      return {
        textures: texs,
        geometry: function (specId, kind, lod) {
          var key = specId + "|" + kind + "|" + lod;
          return geoms[key] || (geoms[key] = buildGeometry(T, specId, kind, lod));
        },
        material: function (specId) {
          if (mats[specId]) return mats[specId];
          var S = SPECS[specId];
          mats[specId] = new T.MeshPhongMaterial({
            color: TONE[theme] || "#ffffff", map: tex(atlas(S, false)),
            emissive: 0xffffff, emissiveMap: tex(atlas(S, true)), emissiveIntensity: GLOW[theme] || 0,
            shininess: 42, specular: 0x2c3036
          });
          return mats[specId];
        },
        setTheme: function (name) {
          theme = name;
          for (var k in mats) { mats[k].color.set(TONE[name] || "#ffffff"); mats[k].emissiveIntensity = GLOW[name] || 0; }
        },
        triangles: function (specId, kind, lod) { var g = this.geometry(specId, kind, lod); return g.index.count / 3; }
      };
    }
  };
})();
