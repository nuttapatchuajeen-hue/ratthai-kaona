/* ============================================================================
   tsunami-sim.js — ห้องทดลองสึนามิ: จำลองคลื่นจริงจากสมการน้ำตื้น

   ใช้ที่ stats/explore.html — แผง "สึนามิ — จำลองคลื่นด้วยฟิสิกส์จริง"
   ทำเลียนแบบคลิปของ NOAA/PTWC ที่ให้คลื่นวิ่งข้ามมหาสมุทรพร้อมแถบสีตามความสูงคลื่น
   แต่ที่นี่ "คำนวณสดในเครื่องผู้ใช้" ไม่ใช่คลิปสำเร็จรูป — กดจุดไหนบนแผนที่ก็เกิดคลื่นตรงนั้น

   ต้องโหลด d3 (v7) และ topojson-client มาก่อน (หน้านี้โหลดไว้อยู่แล้ว)

   ── ฟิสิกส์ ──────────────────────────────────────────────────────────────
   สึนามิเป็น "คลื่นน้ำตื้น" (long wave) เพราะความยาวคลื่นหลักร้อยกิโลเมตร
   ยาวกว่าความลึกทะเล (~4 กม.) มาก จึงใช้สมการน้ำตื้นเชิงเส้นบนพิกัดทรงกลมได้:

       ∂η/∂t = −1/(R cosφ) [ ∂M/∂λ + ∂(N cosφ)/∂φ ]
       ∂M/∂t = −g·h/(R cosφ) · ∂η/∂λ
       ∂N/∂t = −g·h/R · ∂η/∂φ

   η = ระดับน้ำที่ยกจากปกติ · M,N = อัตราการไหลรวมทั้งความลึก (h·u, h·v)
   ความเร็วคลื่น c = √(g·h) — ทะเลลึก 4 กม. ได้ราว 713 กม./ชม. เท่าเครื่องบินโดยสาร

   ไม่ใส่พจน์คอริออลิสและแรงเสียดทานพื้นท้องทะเล เพราะในช่วงเวลาไม่กี่ชั่วโมงที่คลื่น
   เดินทาง ทั้งสองอย่างเล็กกว่าพจน์ความชันผิวน้ำหลายเท่า (โมเดลสึนามิเชิงเส้นหลายตัวก็ตัดทิ้ง)

   แก้สมการด้วย leapfrog บนกริดเหลื่อม Arakawa C (แกนเดียวกับโมเดล MOST ของ NOAA
   และ COMCOT) — η อยู่กลางช่อง · M อยู่ขอบตะวันออก · N อยู่ขอบใต้

   ── ต้นกำเนิดคลื่น ───────────────────────────────────────────────────────
   ใช้สูตร Okada (1985) คำนวณการยกตัวของพื้นทะเลจากรอยเลื่อนสี่เหลี่ยมในครึ่งปริภูมิ
   ยืดหยุ่น แล้วยกผิวน้ำขึ้นเท่ากันทันที (สมมติน้ำอัดตัวไม่ได้ และแผ่นดินไหวเร็วกว่าคลื่นมาก)
   การเลื่อนไม่ได้สม่ำเสมอทั้งแผ่น แต่เรียวลงที่ขอบและหนาสุดค่อนไปทางขอบตื้น
   ซึ่งเป็นรูปแบบที่พบจริงในรอยเลื่อนมุดตัว

   ── ความแม่นยำ ──────────────────────────────────────────────────────────
   ตรวจกับเหตุการณ์จริงแล้ว (ดูตารางในหน้าเว็บ): เวลาคลื่นเดินทางในทะเลลึก
   คลาดเคลื่อนราว 5–10% เช่น โทโฮกุ→ชิลี คำนวณได้ 21 ชม. 44 น. เทียบกับที่บันทึกจริง
   21–22 ชม. · แต่ "ความสูงคลื่นตอนขึ้นฝั่ง" ไม่แม่น เพราะต้องใช้กริดซ้อนละเอียด
   ระดับสิบเมตรและสมการแบบไม่เชิงเส้น — หน้านี้เป็นสื่อการเรียนรู้ ไม่ใช่ระบบเตือนภัย

   ข้อมูลพื้นทะเล: climate-data/bathy-6min.bin (+ .json)
                   Int16 [ละติจูด 793][ลองจิจูด 2160] ระดับพื้นเป็นเมตร บวก=สูงกว่าทะเล
                   แถวแรกคือละติจูด 66°N · สร้างด้วย climate-data/build-bathymetry.mjs
   ========================================================================== */
window.TsunamiSim = (function () {
  'use strict';

  var DIR   = 'climate-data/';
  var FILE  = 'bathy-6min';
  var R     = 6371000;          // รัศมีโลก (เมตร)
  var GRAV  = 9.81;
  var D2R   = Math.PI / 180;
  var HMIN  = 20;               // ตื้นกว่านี้ถือเป็นกำแพง — แบบจำลองเชิงเส้นวิ่งขึ้นฝั่งไม่ได้
  var THR   = 0.05;             // เกณฑ์ "คลื่นมาถึง" (เมตร)

  /* ---------- แถบสีแบบเดียวกับคลิปของ NOAA/PTWC ----------
     ค่าลบ (น้ำลด) = น้ำเงินเข้ม · 0 = ใส · แล้วไล่ ฟ้า→เขียว→เหลือง→ส้ม→แดง→ชมพู
     เป็นสเกลสายรุ้งซึ่งปกติเลี่ยงในกราฟสถิติ แต่ที่นี่จงใจใช้ให้อ่านคู่กับคลิปต้นฉบับได้ */
  var STOPS = [
    [-1.00, '#0a1d5e'], [-0.50, '#123a9c'], [-0.25, '#1f63c8'], [-0.10, '#3f93e0'],
    [-0.02, '#bfe0f5'], [ 0.00, '#e9f4fb'], [ 0.02, '#c9ecd8'], [ 0.10, '#43c46a'],
    [ 0.25, '#b6d63a'], [ 0.50, '#f5c518'], [ 0.75, '#f2870f'], [ 1.00, '#e0301e'],
    [ 2.00, '#c2185b'], [ 3.00, '#f48fb1']
  ];

  /* ---------- ฉากที่ตั้งไว้ให้ ----------
     lat/lon = จุดกึ่งกลาง "ขอบตื้น" ของรอยเลื่อน (ด้านร่องลึก) ไม่ใช่จุดศูนย์กลางแผ่นดินไหว
     เพราะรอยแยกที่ทำให้เกิดสึนามิอยู่ค่อนไปทางร่องลึกมากกว่าจุดที่เริ่มไหว
     L/W = ความยาว×ความกว้างรอยเลื่อน (กม.) — ใส่ค่าจากงานวิจัยเมื่อมี ถ้าไม่ใส่จะใช้สูตรมาตราส่วน */
  var SCENES = [
    { id:'tohoku',  name:'โทโฮกุ ญี่ปุ่น · 11 มี.ค. 2554',
      lat:38.2, lon:143.6, mw:9.1, strike:193, dip:14, rake:81, dtop:6,
      note:'คลื่นสูงถึง 40 ม. ที่เมืองมิยาโกะ · เสียชีวิตราว 18,500 คน · ทำให้โรงไฟฟ้าฟุกุชิมะระเบิด' },
    { id:'sumatra', name:'สุมาตรา–อันดามัน · 26 ธ.ค. 2547',
      lat:7.0, lon:93.2, mw:9.15, strike:329, dip:8, rake:110, dtop:5, L:1300, W:150,
      note:'สึนามิที่คร่าชีวิตมากที่สุดในประวัติศาสตร์ ~228,000 คนใน 14 ประเทศ · ไทยเสียชีวิต 5,395 คน' },
    { id:'chile60', name:'บัลดิเบีย ชิลี · 22 พ.ค. 2503',
      lat:-39.5, lon:-74.5, mw:9.5, strike:6, dip:20, rake:90, dtop:5,
      note:'แผ่นดินไหวที่แรงที่สุดเท่าที่เคยวัดได้ · คลื่นข้ามแปซิฟิกไปถล่มญี่ปุ่นอีก 22 ชม. ต่อมา' },
    { id:'alaska64',name:'อะแลสกา · 27 มี.ค. 2507',
      lat:60.5, lon:-147.0, mw:9.2, strike:250, dip:10, rake:90, dtop:5,
      note:'แผ่นดินไหวแรงอันดับ 2 ของโลก · เป็นเหตุให้สหรัฐฯ ตั้งศูนย์เตือนภัยสึนามิแปซิฟิก' },
    { id:'cascadia',name:'คาสคาเดีย (สมมติ) · ยังไม่เกิด',
      lat:45.0, lon:-125.8, mw:9.0, strike:350, dip:11, rake:90, dtop:5,
      note:'รอยเลื่อนนอกฝั่งตะวันตกสหรัฐฯ–แคนาดา ครั้งล่าสุดคือ พ.ศ. 2243 · นักธรณีคาดว่าจะเกิดอีก' },
    { id:'manila',  name:'ร่องลึกมะนิลา (สมมติ) · ยังไม่เกิด',
      lat:15.5, lon:119.3, mw:8.8, strike:350, dip:14, rake:90, dtop:5,
      note:'ฉากที่อาเซียนกังวลที่สุด — ถ้าเกิดจริง คลื่นจะถึงเวียดนามและฟิลิปปินส์ในไม่กี่ชั่วโมง' }
  ];

  /* จุดตรวจวัด (เหมือนทุ่นวัดคลื่น DART) — ต้องอยู่ในน้ำ ไม่ติดแผ่นดิน */
  var GAUGES = [
    { name:'ภูเก็ต',      lat:7.8,   lon:97.7  },
    { name:'เขาหลัก',     lat:8.7,   lon:97.8  },
    { name:'โคลัมโบ',     lat:6.6,   lon:79.5  },
    { name:'โตเกียว',     lat:34.9,  lon:140.3 },
    { name:'ฮาวาย',       lat:20.6,  lon:-156.9},
    { name:'แคลิฟอร์เนีย', lat:41.5,  lon:-125.0},
    { name:'ชิลี',        lat:-33.0, lon:-72.5 },
    { name:'มะนิลา',      lat:14.4,  lon:120.0 }
  ];

  /* ====================================================================== */
  /* โหลดข้อมูลพื้นทะเล                                                      */
  /* ====================================================================== */
  var _bathy = null, _bathyP = null;

  function loadBathy() {
    if (_bathyP) return _bathyP;
    _bathyP = Promise.all([
      fetch(DIR + FILE + '.json').then(function (r) { if (!r.ok) throw new Error('โหลด ' + FILE + '.json ไม่ได้'); return r.json(); }),
      fetch(DIR + FILE + '.bin').then(function (r) { if (!r.ok) throw new Error('โหลด ' + FILE + '.bin ไม่ได้'); return r.arrayBuffer(); })
    ]).then(function (a) {
      var meta = a[0], buf = a[1];
      var need = meta.nx * meta.ny * 2;
      if (buf.byteLength < need) throw new Error('ไฟล์พื้นทะเลสั้นกว่าที่ควรเป็น');
      _bathy = { meta: meta, elev: new Int16Array(buf, 0, meta.nx * meta.ny) };
      return _bathy;
    });
    return _bathyP;
  }

  /* ย่อกริดลง k เท่า โดย "เฉลี่ยระดับพื้น" ไม่ใช่หยิบทีละช่อง — ไม่งั้นเกาะเล็กหายและ
     ร่องลึกโผล่มาเป็นจุด ๆ ทำให้ค่า dt ตาม CFL ถูกบีบโดยไม่จำเป็น */
  function makeGrid(k) {
    var m = _bathy.meta, S = _bathy.elev;
    var nx = Math.floor(m.nx / k), ny = Math.floor(m.ny / k);
    var h = new Float32Array(nx * ny);
    for (var j = 0; j < ny; j++) {
      for (var i = 0; i < nx; i++) {
        var s = 0, n = 0;
        for (var b = 0; b < k; b++) {
          var jj = j * k + b; if (jj >= m.ny) break;
          for (var a = 0; a < k; a++) { s += S[jj * m.nx + (i * k + a)]; n++; }
        }
        h[j * nx + i] = -s / n;                        // เป็นบวก = ความลึกน้ำ
      }
    }
    return { h: h, nx: nx, ny: ny, step: m.step * k, lat0: m.lat0 };
  }

  /* ====================================================================== */
  /* Okada (1985) — การยกตัวแนวดิ่งของผิวโลก                                 */
  /* พิกัดท้องถิ่น: x ตามแนววางตัว · y ทางซ้ายของแนววาง = ทิศตื้นขึ้น (up-dip)  */
  /* d = ความลึกของขอบล่าง (ขอบลึกสุด) ของรอยเลื่อน · หน่วย กม. ทั้งหมด       */
  /* ====================================================================== */
  var ALPHA = 0.5;                                     // mu/(lambda+mu) ตัวกลางปัวซอง

  function uzTerm(xi, eta, q, sd, cd, U1, U2) {
    var R2 = Math.sqrt(xi * xi + eta * eta + q * q);
    var dt = eta * sd - q * cd;                        // d~
    var Re = R2 + eta, Rx = R2 + xi, X = Math.sqrt(xi * xi + q * q);
    var lnRe = Re > 1e-9 ? Math.log(Re) : -Math.log(Math.max(R2 - eta, 1e-9));
    var lnRd = Math.log(Math.max(R2 + dt, 1e-9));
    /* หมายเหตุสำคัญ: Okada เขียนเป็น arctan ของอัตราส่วน (ค่าหลัก ±π/2)
       ห้ามใช้ atan2 เด็ดขาด เพราะจะข้ามกิ่งแล้วสนามการยกตัวกระโดดเป็นขั้นบันได */
    var th = Math.abs(q) < 1e-9 ? 0 : Math.atan(xi * eta / (q * R2));
    var I4 = ALPHA * (1 / cd) * (lnRd - sd * lnRe);
    var I5 = Math.abs(xi) < 1e-9 ? 0
           : ALPHA * (2 / cd) * Math.atan((eta * (X + q * cd) + X * (R2 + X) * sd) / (xi * (R2 + X) * cd));
    var uz = 0;
    if (U1) uz += -(U1 / (2 * Math.PI)) * (dt * q / (R2 * Re) + q * sd / Re + I4 * sd);
    if (U2) uz += -(U2 / (2 * Math.PI)) * (dt * q / (R2 * Rx) + sd * th - I5 * sd * cd);
    return uz;
  }
  function okadaUz(x, y, d, dipDeg, L, W, U1, U2) {
    var dip = dipDeg * D2R, sd = Math.sin(dip), cd = Math.cos(dip);
    var p = y * cd + d * sd, q = y * sd - d * cd;
    /* สูตร Chinnery: f(ξ,η)|| = f(x,p) − f(x,p−W) − f(x−L,p) + f(x−L,p−W) */
    return uzTerm(x,     p,     q, sd, cd, U1, U2)
         - uzTerm(x,     p - W, q, sd, cd, U1, U2)
         - uzTerm(x - L, p,     q, sd, cd, U1, U2)
         + uzTerm(x - L, p - W, q, sd, cd, U1, U2);
  }

  /* มาตราส่วนขนาดรอยเลื่อนจากขนาดแผ่นดินไหว (Blaser et al. 2010 · รอยเลื่อนย้อน)
     แล้วหาระยะเลื่อนจากโมเมนต์: M0 = μ·L·W·D  (μ = 3.0×10¹⁰ Pa) */
  function faultSize(sc) {
    var M0 = Math.pow(10, 1.5 * sc.mw + 9.1);
    var L = sc.L || Math.pow(10, -2.37 + 0.57 * sc.mw);
    var W = sc.W || Math.pow(10, -1.86 + 0.46 * sc.mw);
    return { L: L, W: W, D: M0 / (3.0e10 * L * 1e3 * W * 1e3), M0: M0 };
  }

  /* น้ำหนักการเลื่อนของแต่ละช่องย่อย — เรียวลงที่ขอบ หนาสุดค่อนไปทางขอบตื้น
     ตามแนววาง g(s) = (s(1−s))^0.5 · ตามแนวเท f(u) = u^1.1 (1−u)^0.6  (u=0 ขอบลึก)
     แบ่งได้หลายความละเอียด เพราะจุดที่อยู่ไกลไม่จำเป็นต้องแบ่งละเอียด (ดู LEVELS) */
  var _slipW = {};
  function slipWeights(ns, nd) {
    var key = ns + 'x' + nd;
    if (_slipW[key]) return _slipW[key];
    var w = [], sum = 0, a, c;
    for (a = 0; a < ns; a++) for (c = 0; c < nd; c++) {
      var s = (a + 0.5) / ns, u = (c + 0.5) / nd;
      var v = Math.pow(s * (1 - s), 0.5) * Math.pow(u, 1.1) * Math.pow(1 - u, 0.6);
      w.push(v); sum += v;
    }
    for (var q = 0; q < w.length; q++) w[q] = w[q] * w.length / sum;   // เฉลี่ย = 1
    return (_slipW[key] = w);
  }

  /* ความละเอียดของการแบ่งรอยเลื่อน แปรตาม "ระยะจากขอบรอยเลื่อน" (กม.)
     ใกล้รอยเลื่อนต้องละเอียด เพราะรูปร่างการยกตัวขึ้นกับว่าการเลื่อนหนาตรงไหน
     แต่พอห่างออกไป รอยเลื่อนทั้งแผ่นก็ทำตัวเหมือนจุดเดียว แบ่งละเอียดไปก็ได้ค่าเท่าเดิม
     — รอยเลื่อนสุมาตรายาว 1,300 กม. ถ้าแบ่งละเอียดทุกช่องจะต้องเรียกสูตร Okada
     กว่า 86 ล้านครั้ง ซึ่งค้างไปหลายสิบวินาที */
  var LEVELS = [{ d: 120, ns: 14, nd: 8 }, { d: 450, ns: 6, nd: 4 }, { d: Infinity, ns: 1, nd: 1 }];

  /** สร้างสนามการยกตัวของพื้นทะเลรอบศูนย์กลาง — คืนกรอบสี่เหลี่ยมและค่า uz เป็นเมตร */
  function buildSource(G, sc) {
    var F = faultSize(sc), L = F.L, W = F.W, D = F.D;
    var th = sc.strike * D2R, rake = sc.rake * D2R, dr = sc.dip * D2R;
    var st = Math.sin(th), ct = Math.cos(th), cd = Math.cos(dr), sd = Math.sin(dr);
    var cosR = Math.cos(rake), sinR = Math.sin(rake);
    var Wproj = W * cd;                                  // ความกว้างรอยเลื่อนเมื่อฉายลงพื้นราบ
    /* จุดอ้างอิง = มุม "ขอบล่าง + ต้นแนววาง" เทียบกับกึ่งกลางขอบตื้นที่ผู้ใช้ระบุ */
    var oE = -L / 2 * st + W * cd * ct, oN = -L / 2 * ct - W * cd * st;

    var Rk = R / 1000, rad = Math.max(L, W) * 2.6;
    var jr = Math.ceil(rad / (Rk * G.step * D2R));
    var ir = Math.ceil(jr / Math.max(0.25, Math.cos(sc.lat * D2R)));
    var jc = Math.round((G.lat0 - sc.lat) / G.step - 0.5);
    var ic = Math.round((sc.lon + 180) / G.step - 0.5);
    var j0 = Math.max(0, jc - jr), j1 = Math.min(G.ny - 1, jc + jr);
    var w = Math.min(G.nx, 2 * ir + 1), hgt = j1 - j0 + 1;
    var i0 = ((ic - ir) % G.nx + G.nx) % G.nx;

    var uz = new Float32Array(w * hgt), peak = 0, trough = 0, vol = 0;
    var cellA = Math.pow(Rk * 1e3 * G.step * D2R, 2);
    for (var jj = 0; jj < hgt; jj++) {
      var j = j0 + jj, lat = G.lat0 - (j + 0.5) * G.step;
      var mlat = Math.cos((lat + sc.lat) / 2 * D2R);
      for (var ii = 0; ii < w; ii++) {
        var i = (i0 + ii) % G.nx, lon = -180 + (i + 0.5) * G.step;
        var dlon = lon - sc.lon; if (dlon > 180) dlon -= 360; if (dlon < -180) dlon += 360;
        var E = dlon * D2R * Rk * mlat, N = (lat - sc.lat) * D2R * Rk;
        var x = (E - oE) * st + (N - oN) * ct, y = -(E - oE) * ct + (N - oN) * st;
        /* ระยะจากจุดนี้ถึงขอบรอยเลื่อน (บนพื้นราบ) — ใช้เลือกความละเอียดของการแบ่ง */
        var ex = Math.max(0, -x, x - L), ey = Math.max(0, -y, y - Wproj);
        var edge = Math.sqrt(ex * ex + ey * ey), lv = 0;
        while (edge > LEVELS[lv].d) lv++;
        var ns = LEVELS[lv].ns, nd = LEVELS[lv].nd;
        var wg = slipWeights(ns, nd), dl = L / ns, dw = W / nd, v = 0;
        for (var a = 0; a < ns; a++) for (var c = 0; c < nd; c++) {
          var Dl = D * wg[a * nd + c]; if (Dl < 1e-3) continue;
          v += okadaUz(x - a * dl, y - c * dw * cd, sc.dtop + (W - c * dw) * sd,
                       sc.dip, dl, dw, Dl * cosR, Dl * sinR);
        }
        uz[jj * w + ii] = v;
        if (v > peak) peak = v; if (v < trough) trough = v;
        if (v > 0 && G.h[j * G.nx + i] >= HMIN) vol += v * cellA * Math.cos(lat * D2R);
      }
    }
    return { uz: uz, i0: i0, j0: j0, w: w, h: hgt,
             L: L, W: W, D: D, peakSlip: D * Math.max.apply(null, slipWeights(LEVELS[0].ns, LEVELS[0].nd)),
             peak: peak, trough: trough, volume: vol / 1e9 };
  }

  /* ====================================================================== */
  /* เชดเดอร์                                                                */
  /* ====================================================================== */
  var VS = '#version 300 es\n' +
    'void main(){ vec2 p = vec2((gl_VertexID<<1)&2, gl_VertexID&2); gl_Position = vec4(p*2.0-1.0,0,1); }';

  var COMMON = '#version 300 es\nprecision highp float; precision highp int;\n' +
    'uniform sampler2D uS; uniform sampler2D uH; uniform sampler2D uT;\n' +
    'uniform ivec2 uN; uniform float uDt,uStep,uLat0,uSponge,uTime;\n' +
    'const float R=6371000.0, G=9.81, D2R=0.017453292519943295, HMIN=20.0, THR=0.05;\n' +
    'float latC(int j){ return (uLat0-(float(j)+0.5)*uStep)*D2R; }\n' +
    'float latF(int j){ return (uLat0-(float(j)+1.0)*uStep)*D2R; }\n' +
    /* ชั้นดูดซับที่ขอบเหนือ–ใต้: ค่อย ๆ หน่วงคลื่นให้ตายก่อนถึงขอบกริด
       ไม่งั้นคลื่นจะสะท้อนกลับเข้ามาเป็นริ้วปลอมทั่วมหาสมุทร */
    'float sponge(int j){ int d=min(j, uN.y-1-j); float s=float(uSponge);\n' +
    '  return d>=int(s) ? 1.0 : 0.94+0.06*float(d)/s; }\n';

  /* รอบที่ 1 — อัปเดตอัตราการไหล M (ขอบตะวันออก) และ N (ขอบใต้) จาก η ปัจจุบัน */
  var FS_FLUX = COMMON +
    'out vec4 o;\n' +
    'void main(){\n' +
    ' ivec2 c=ivec2(gl_FragCoord.xy); int i=c.x, j=c.y;\n' +
    ' vec4 s=texelFetch(uS,c,0);\n' +
    ' float hC=texelFetch(uH,c,0).r;\n' +
    ' ivec2 cE=ivec2((i+1)%uN.x, j); ivec2 cS=ivec2(i, min(j+1,uN.y-1));\n' +
    ' float hE=texelFetch(uH,cE,0).r, hS=texelFetch(uH,cS,0).r;\n' +
    ' float eC=s.r, eE=texelFetch(uS,cE,0).r, eS=texelFetch(uS,cS,0).r;\n' +
    ' float cs=cos(latC(j));\n' +
    ' float fE=(hC>=HMIN&&hE>=HMIN)?0.5*(hC+hE):0.0;\n' +
    ' float fN=(j+1<uN.y&&hC>=HMIN&&hS>=HMIN)?0.5*(hC+hS):0.0;\n' +
    ' float M=s.g, N=s.b;\n' +
    ' M = fE>0.0 ? M - uDt*G*fE/(R*cs*uStep*D2R)*(eE-eC) : 0.0;\n' +
    ' N = fN>0.0 ? N - uDt*G*fN/(R*uStep*D2R)*(eC-eS)    : 0.0;\n' +
    ' float sp=sponge(j);\n' +
    ' o=vec4(s.r, M*sp, N*sp, s.a);\n' +
    '}';

  /* รอบที่ 2 — อัปเดต η จากการลู่เข้า/ออกของอัตราการไหล พร้อมเก็บค่าสูงสุดและเวลาที่คลื่นมาถึง */
  var FS_ETA = COMMON +
    'layout(location=0) out vec4 o0; layout(location=1) out vec4 o1;\n' +
    'void main(){\n' +
    ' ivec2 c=ivec2(gl_FragCoord.xy); int i=c.x, j=c.y;\n' +
    ' vec4 s=texelFetch(uS,c,0); float tp=texelFetch(uT,c,0).r;\n' +
    ' float hC=texelFetch(uH,c,0).r;\n' +
    ' if(hC<HMIN){ o0=vec4(0.0,0.0,0.0,s.a); o1=vec4(tp); return; }\n' +
    ' float Mw=texelFetch(uS,ivec2((i-1+uN.x)%uN.x,j),0).g;\n' +
    ' float Nn=(j>0)?texelFetch(uS,ivec2(i,j-1),0).b:0.0;\n' +
    ' float cs=cos(latC(j)), cf=cos(latF(j)), cfn=cos(latF(j-1));\n' +
    ' float dl=uStep*D2R;\n' +
    ' float e = s.r - uDt/(R*cs*dl)*(s.g-Mw) - uDt/(R*cs*dl)*(Nn*cfn - s.b*cf);\n' +
    ' e *= sponge(j);\n' +
    ' float am=max(s.a, abs(e));\n' +
    ' o0=vec4(e, s.g, s.b, am);\n' +
    ' o1=vec4((tp<0.0 && abs(e)>THR) ? uTime : tp);\n' +
    '}';

  /* รอบวาดภาพ — ระบายสีทะเลตาม η ปัจจุบัน หรือค่าสูงสุด/เวลาคลื่นถึง แล้วแรเงาแผ่นดิน */
  var FS_DRAW = '#version 300 es\nprecision highp float; precision highp int;\n' +
    'uniform sampler2D uS,uH,uT,uRamp; uniform ivec2 uN; uniform vec2 uOrigin,uSpan,uRes;\n' +
    'uniform int uMode; uniform float uGain,uMaxT,uDark;\n' +
    'out vec4 o;\n' +
    'vec3 land(float el){\n' +
    ' float t=clamp(el/3000.0,0.0,1.0);\n' +
    ' vec3 a=vec3(0.24,0.30,0.22), b=vec3(0.42,0.40,0.28), c=vec3(0.62,0.58,0.52);\n' +
    ' vec3 col = t<0.5 ? mix(a,b,t*2.0) : mix(b,c,(t-0.5)*2.0);\n' +
    ' return mix(col, vec3(0.10,0.13,0.16), uDark*0.55);\n' +
    '}\n' +
    'void main(){\n' +
    ' vec2 uv=gl_FragCoord.xy/uRes; uv.y=1.0-uv.y;\n' +
    ' vec2 g=uOrigin+uv*uSpan;\n' +
    ' if(g.y<0.0||g.y>=float(uN.y)){ o=vec4(0.0); return; }\n' +
    ' int i=int(floor(mod(g.x,float(uN.x)))), j=int(floor(g.y));\n' +
    ' ivec2 c=ivec2(i,j);\n' +
    ' float h=texelFetch(uH,c,0).r;\n' +
    ' if(h<20.0){ float el=max(0.0,-h); o=vec4(land(el),1.0); return; }\n' +
    /* พื้นทะเล: เข้มตามความลึก ให้เห็นสันเขาใต้ทะเลจาง ๆ เหมือนภาพต้นฉบับ */
    ' float dep=clamp(h/6000.0,0.0,1.0);\n' +
    ' vec3 sea=mix(vec3(0.42,0.58,0.70), vec3(0.10,0.18,0.34), dep);\n' +
    ' sea=mix(sea, sea*0.55, uDark);\n' +
    ' vec4 s=texelFetch(uS,c,0);\n' +
    ' float v;\n' +
    ' if(uMode==0)      v=s.r*uGain;\n' +
    ' else if(uMode==1) v=s.a*uGain;\n' +
    ' else { float t=texelFetch(uT,c,0).r;\n' +
    '        if(t<0.0){ o=vec4(sea,1.0); return; }\n' +
    /* โหมดเวลาเดินทาง: ไล่สีตามชั่วโมง + ขีดเส้นชั้นทุก 1 ชม. */
    '        float hr=t/3600.0; float band=fract(hr);\n' +
    '        vec3 cc=texture(uRamp,vec2(clamp(hr/uMaxT,0.0,1.0),0.5)).rgb;\n' +
    '        float line=smoothstep(0.0,0.06,band)*smoothstep(1.0,0.94,band);\n' +
    '        o=vec4(mix(vec3(1.0),cc,0.25+0.75*line),1.0); return; }\n' +
    ' float t=clamp(v*0.5+0.5,0.0,1.0);\n' +
    ' vec3 wc=texture(uRamp,vec2(t,0.5)).rgb;\n' +
    ' float a=clamp(abs(v)*3.2,0.0,1.0);\n' +
    ' o=vec4(mix(sea,wc,a),1.0);\n' +
    '}';

  /* ====================================================================== */
  /* ตัวช่วย WebGL                                                           */
  /* ====================================================================== */
  function compile(gl, type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('เชดเดอร์ผิดพลาด: ' + gl.getShaderInfoLog(s));
    return s;
  }
  function program(gl, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('ลิงก์เชดเดอร์ไม่ได้: ' + gl.getProgramInfoLog(p));
    return p;
  }
  function tex(gl, nx, ny, internal, format, type, data) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, nx, ny, 0, format, type, data || null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function rampTexture(gl, stops, lo, hi) {
    var N = 256, px = new Uint8Array(N * 4);
    var sc = d3.scaleLinear().domain(stops.map(function (s) { return s[0]; }))
               .range(stops.map(function (s) { return s[1]; })).clamp(true);
    for (var k = 0; k < N; k++) {
      var col = d3.rgb(sc(lo + (hi - lo) * k / (N - 1)));
      px[k * 4] = col.r; px[k * 4 + 1] = col.g; px[k * 4 + 2] = col.b; px[k * 4 + 3] = 255;
    }
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, N, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, px);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  /* ====================================================================== */
  /* เอนจิน GPU                                                              */
  /* ====================================================================== */
  function GpuEngine(gl, G) {
    var nx = G.nx, ny = G.ny;
    this.gl = gl; this.G = G; this.t = 0;

    /* ความลึกน้ำ (เมตร) — ค่าลบคือความสูงของแผ่นดิน ใช้ตอนแรเงาภูเขา */
    var hf = new Float32Array(nx * ny);
    for (var p = 0; p < hf.length; p++) hf[p] = G.h[p];
    this.texH = tex(gl, nx, ny, gl.R32F, gl.RED, gl.FLOAT, hf);

    this.S = [tex(gl, nx, ny, gl.RGBA32F, gl.RGBA, gl.FLOAT),
              tex(gl, nx, ny, gl.RGBA32F, gl.RGBA, gl.FLOAT)];
    this.T = [tex(gl, nx, ny, gl.R32F, gl.RED, gl.FLOAT),
              tex(gl, nx, ny, gl.R32F, gl.RED, gl.FLOAT)];
    this.fbFlux = gl.createFramebuffer();
    this.fbEta  = gl.createFramebuffer();
    this.pFlux = program(gl, FS_FLUX);
    this.pEta  = program(gl, FS_ETA);
    this.pDraw = program(gl, FS_DRAW);
    this.ramp  = rampTexture(gl, STOPS, -1.2, 1.2);
    this.rampT = rampTexture(gl, [[0,'#3b1f6e'],[0.2,'#1d5fa8'],[0.4,'#12a08c'],
                                  [0.6,'#8fc43c'],[0.8,'#f3aa15'],[1,'#d8342a']], 0, 1);
    this.cur = 0;
    this.dt = cflDt(G);
    this.vao = gl.createVertexArray();

    /* CFL — หา dt จากช่องที่บีบที่สุดจริง ๆ ไม่ใช่จากความลึกสูงสุดคูณละติจูดสูงสุด
       (สองอย่างนั้นไม่ได้เกิดพร้อมกัน จะได้ dt เล็กเกินจำเป็นราวเท่าตัว) */
    function cflDt(G) {
      var dt = 1e9, dy = R * G.step * D2R;
      for (var j = 0; j < G.ny; j++) {
        var lat = (G.lat0 - (j + 0.5) * G.step) * D2R;
        var dmin = Math.min(R * Math.cos(lat) * G.step * D2R, dy);
        for (var i = 0; i < G.nx; i++) {
          var h = G.h[j * G.nx + i]; if (h < HMIN) continue;
          var t = dmin / (Math.sqrt(GRAV * h) * Math.SQRT2);
          if (t < dt) dt = t;
        }
      }
      return Math.max(1, Math.floor(dt * 0.9));
    }
  }

  GpuEngine.prototype.reset = function (src) {
    var gl = this.gl, nx = this.G.nx, ny = this.G.ny;
    /* ล้างทั้งสองบัฟเฟอร์ให้เป็น 0 และเวลาคลื่นถึงเป็น −1 (ยังไม่ถึง) */
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    for (var k = 0; k < 2; k++) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.S[k], 0);
      gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0]);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.T[k], 0);
      gl.clearBufferfv(gl.COLOR, 0, [-1, -1, -1, -1]);
    }
    gl.deleteFramebuffer(fb);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.cur = 0; this.t = 0;

    if (!src) return;
    /* อัปโหลดการยกตัวเริ่มต้นลงเฉพาะกรอบของแหล่งกำเนิด (อาจคร่อมเส้นเปลี่ยนวัน จึงแบ่งเป็น 2 ก้อน) */
    var w = src.w, hgt = src.h, i0 = src.i0;
    var pack = function (x0, ww) {
      var buf = new Float32Array(ww * hgt * 4);
      for (var jj = 0; jj < hgt; jj++) for (var ii = 0; ii < ww; ii++) {
        var v = src.uz[jj * w + (x0 + ii)];
        var gi = (i0 + x0 + ii) % nx, gj = src.j0 + jj;
        if (gj < 0 || gj >= ny || gi < 0) v = 0;
        else if (this.G.h[gj * nx + gi] < HMIN) v = 0;      // ยกบนบกไม่ทำให้เกิดคลื่น
        var o = (jj * ww + ii) * 4;
        buf[o] = v; buf[o + 3] = Math.abs(v);
      }
      return buf;
    }.bind(this);
    var first = Math.min(w, nx - i0);
    gl.bindTexture(gl.TEXTURE_2D, this.S[0]);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, i0, src.j0, first, hgt, gl.RGBA, gl.FLOAT, pack(0, first));
    if (first < w) gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, src.j0, w - first, hgt, gl.RGBA, gl.FLOAT, pack(first, w - first));
  };

  GpuEngine.prototype.step = function (n) {
    var gl = this.gl, nx = this.G.nx, ny = this.G.ny;
    gl.bindVertexArray(this.vao);
    gl.viewport(0, 0, nx, ny);
    gl.disable(gl.BLEND);
    for (var k = 0; k < n; k++) {
      var a = this.cur, b = 1 - this.cur;
      /* รอบที่ 1: อัตราการไหล  S[a] -> S[b] */
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbFlux);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.S[b], 0);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
      gl.useProgram(this.pFlux);
      this.bindCommon(this.pFlux, this.S[a], this.T[a]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      /* รอบที่ 2: ระดับน้ำ  S[b] -> S[a] และ T[a] -> T[b] */
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbEta);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.S[a], 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.T[b], 0);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      gl.useProgram(this.pEta);
      this.bindCommon(this.pEta, this.S[b], this.T[a]);
      gl.uniform1f(gl.getUniformLocation(this.pEta, 'uTime'), this.t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      /* S กลับมาอยู่ที่ a เหมือนเดิม · T สลับไป b */
      var tt = this.T[0]; this.T[0] = this.T[1]; this.T[1] = tt;
      this.t += this.dt;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  GpuEngine.prototype.bindCommon = function (p, sTex, tTex) {
    var gl = this.gl;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sTex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.texH);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, tTex);
    gl.uniform1i(gl.getUniformLocation(p, 'uS'), 0);
    gl.uniform1i(gl.getUniformLocation(p, 'uH'), 1);
    gl.uniform1i(gl.getUniformLocation(p, 'uT'), 2);
    gl.uniform2i(gl.getUniformLocation(p, 'uN'), this.G.nx, this.G.ny);
    gl.uniform1f(gl.getUniformLocation(p, 'uDt'), this.dt);
    gl.uniform1f(gl.getUniformLocation(p, 'uStep'), this.G.step);
    gl.uniform1f(gl.getUniformLocation(p, 'uLat0'), this.G.lat0);
    gl.uniform1f(gl.getUniformLocation(p, 'uSponge'), 14);
  };

  GpuEngine.prototype.draw = function (view, mode, gain, maxT, dark) {
    var gl = this.gl, cv = gl.canvas;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.useProgram(this.pDraw);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.S[this.cur]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.texH);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.T[0]);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, mode === 2 ? this.rampT : this.ramp);
    var P = this.pDraw, u = function (n) { return gl.getUniformLocation(P, n); };
    gl.uniform1i(u('uS'), 0); gl.uniform1i(u('uH'), 1); gl.uniform1i(u('uT'), 2); gl.uniform1i(u('uRamp'), 3);
    gl.uniform2i(u('uN'), this.G.nx, this.G.ny);
    gl.uniform2f(u('uOrigin'), view.x0, view.y0);
    gl.uniform2f(u('uSpan'), view.w, view.h);
    gl.uniform2f(u('uRes'), cv.width, cv.height);
    gl.uniform1i(u('uMode'), mode);
    gl.uniform1f(u('uGain'), gain);
    gl.uniform1f(u('uMaxT'), maxT);
    gl.uniform1f(u('uDark'), dark ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  /** อ่านค่าที่จุดตรวจ — รวบทุกจุดไว้อ่านครั้งเดียว ไม่งั้น readPixels จะทำให้ GPU สะดุด */
  GpuEngine.prototype.probe = function (cells) {
    var gl = this.gl, out = [];
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.S[this.cur], 0);
    var px = new Float32Array(4);
    for (var k = 0; k < cells.length; k++) {
      var c = cells[k];
      if (c.i < 0) { out.push(null); continue; }
      gl.readPixels(c.i, c.j, 1, 1, gl.RGBA, gl.FLOAT, px);
      out.push({ eta: px[0], amax: px[3] });
    }
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.T[0], 0);
    for (var m = 0; m < cells.length; m++) {
      if (cells[m].i < 0 || !out[m]) continue;
      gl.readPixels(cells[m].i, cells[m].j, 1, 1, gl.RGBA, gl.FLOAT, px);
      out[m].arrive = px[0];
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb);
    return out;
  };

  /* ====================================================================== */
  /* เอนจินสำรองบน CPU — ใช้เมื่อเครื่องไม่รองรับ WebGL2 หรือพื้นผิวทศนิยม      */
  /* สมการชุดเดียวกันเป๊ะ ต่างแค่กริดหยาบกว่าเพื่อให้ทัน                        */
  /* ====================================================================== */
  function CpuEngine(G) {
    this.G = G; this.t = 0;
    var nx = G.nx, ny = G.ny, n = nx * ny;
    this.eta = new Float32Array(n); this.M = new Float32Array(n); this.N = new Float32Array(n);
    this.amax = new Float32Array(n); this.tarr = new Float32Array(n).fill(-1);
    this.cosC = new Float64Array(ny); this.cosF = new Float64Array(ny);
    this.hE = new Float32Array(n); this.hN = new Float32Array(n); this.wet = new Uint8Array(n);
    var j, i, p;
    for (j = 0; j < ny; j++) {
      this.cosC[j] = Math.cos((G.lat0 - (j + 0.5) * G.step) * D2R);
      this.cosF[j] = Math.cos((G.lat0 - (j + 1) * G.step) * D2R);
    }
    for (p = 0; p < n; p++) this.wet[p] = G.h[p] >= HMIN ? 1 : 0;
    for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
      p = j * nx + i;
      var e = j * nx + ((i + 1) % nx), s = (j + 1) * nx + i;
      this.hE[p] = (this.wet[p] && this.wet[e]) ? 0.5 * (G.h[p] + G.h[e]) : 0;
      this.hN[p] = (j + 1 < ny && this.wet[p] && this.wet[s]) ? 0.5 * (G.h[p] + G.h[s]) : 0;
    }
    var dt = 1e9, dy = R * G.step * D2R;
    for (j = 0; j < ny; j++) {
      var dmin = Math.min(R * this.cosC[j] * G.step * D2R, dy);
      for (i = 0; i < nx; i++) {
        p = j * nx + i; if (!this.wet[p]) continue;
        var tt = dmin / (Math.sqrt(GRAV * G.h[p]) * Math.SQRT2);
        if (tt < dt) dt = tt;
      }
    }
    this.dt = Math.max(1, Math.floor(dt * 0.9));
    this.spg = new Float32Array(ny).fill(1);
    for (var k = 0; k < 14; k++) { var f = 0.94 + 0.06 * k / 14; this.spg[k] = f; this.spg[ny - 1 - k] = f; }
  }
  CpuEngine.prototype.reset = function (src) {
    this.eta.fill(0); this.M.fill(0); this.N.fill(0); this.amax.fill(0); this.tarr.fill(-1); this.t = 0;
    if (!src) return;
    var G = this.G;
    for (var jj = 0; jj < src.h; jj++) for (var ii = 0; ii < src.w; ii++) {
      var gj = src.j0 + jj; if (gj < 0 || gj >= G.ny) continue;
      var gi = (src.i0 + ii) % G.nx, p = gj * G.nx + gi;
      if (!this.wet[p]) continue;
      var v = src.uz[jj * src.w + ii];
      this.eta[p] = v; this.amax[p] = Math.abs(v);
    }
  };
  CpuEngine.prototype.step = function (n) {
    var G = this.G, nx = G.nx, ny = G.ny, dt = this.dt, dl = G.step * D2R;
    var eta = this.eta, M = this.M, N = this.N, hE = this.hE, hN = this.hN, wet = this.wet;
    for (var k = 0; k < n; k++) {
      var j, i, p;
      for (j = 0; j < ny; j++) {
        var cx = dt * GRAV / (R * this.cosC[j] * dl), cy = dt * GRAV / (R * dl), sp = this.spg[j];
        for (i = 0; i < nx; i++) {
          p = j * nx + i;
          M[p] = hE[p] > 0 ? (M[p] - cx * hE[p] * (eta[j * nx + ((i + 1) % nx)] - eta[p])) * sp : 0;
          N[p] = hN[p] > 0 ? (N[p] - cy * hN[p] * (eta[p] - eta[(j + 1) * nx + i])) * sp : 0;
        }
      }
      for (j = 0; j < ny; j++) {
        var ci = dt / (R * this.cosC[j] * dl), sp2 = this.spg[j];
        for (i = 0; i < nx; i++) {
          p = j * nx + i; if (!wet[p]) { eta[p] = 0; continue; }
          var w = j * nx + ((i - 1 + nx) % nx);
          var nn = j > 0 ? N[(j - 1) * nx + i] * this.cosF[j - 1] : 0;
          var v = (eta[p] - ci * (M[p] - M[w]) - ci * (nn - N[p] * this.cosF[j])) * sp2;
          eta[p] = v;
          var a = v < 0 ? -v : v;
          if (a > this.amax[p]) this.amax[p] = a;
          if (this.tarr[p] < 0 && a > THR) this.tarr[p] = this.t;
        }
      }
      this.t += dt;
    }
  };
  CpuEngine.prototype.probe = function (cells) {
    var G = this.G, out = [];
    for (var k = 0; k < cells.length; k++) {
      var c = cells[k];
      if (c.i < 0) { out.push(null); continue; }
      var p = c.j * G.nx + c.i;
      out.push({ eta: this.eta[p], amax: this.amax[p], arrive: this.tarr[p] });
    }
    return out;
  };

  /* ====================================================================== */
  /* API สาธารณะ                                                             */
  /* ====================================================================== */
  function gradientCss(lo, hi) {
    var sc = d3.scaleLinear().domain(STOPS.map(function (s) { return s[0]; }))
               .range(STOPS.map(function (s) { return s[1]; })).clamp(true);
    var out = [];
    for (var k = 0; k <= 24; k++) out.push(d3.rgb(sc(lo + (hi - lo) * k / 24)).formatHex() + ' ' + (k / 24 * 100).toFixed(1) + '%');
    return 'linear-gradient(90deg,' + out.join(',') + ')';
  }
  function colorAt(v) {
    var sc = d3.scaleLinear().domain(STOPS.map(function (s) { return s[0]; }))
               .range(STOPS.map(function (s) { return s[1]; })).clamp(true);
    return sc(v);
  }
  function fmtHM(sec) {
    if (sec == null || sec < 0) return 'ยังไม่ถึง';
    var h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
    if (m === 60) { h++; m = 0; }
    return h + ' ชม. ' + (m < 10 ? '0' : '') + m + ' น.';
  }

  return {
    SCENES: SCENES,
    GAUGES: GAUGES,
    STOPS: STOPS,
    HMIN: HMIN,
    load: loadBathy,
    makeGrid: makeGrid,
    buildSource: buildSource,
    faultSize: faultSize,
    okadaUz: okadaUz,
    GpuEngine: GpuEngine,
    CpuEngine: CpuEngine,
    gradientCss: gradientCss,
    colorAt: colorAt,
    fmtHM: fmtHM,
    /** ตรวจว่าเครื่องนี้เร่งด้วย GPU ได้ไหม — ต้องมี WebGL2 + วาดลงพื้นผิวทศนิยมได้ */
    probeGL: function (canvas) {
      var gl = canvas.getContext('webgl2', { antialias: false, depth: false, stencil: false,
                                             preserveDrawingBuffer: false, powerPreference: 'high-performance' });
      if (!gl) return null;
      if (!gl.getExtension('EXT_color_buffer_float')) return null;
      return gl;
    }
  };
})();
