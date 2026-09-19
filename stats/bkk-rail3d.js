/**
 * bkk-rail3d.js
 * ชั้น "รถไฟฟ้า 3 มิติ" ของ bkk-city.html — รางยกระดับ ตอม่อ สถานี และขบวนรถวิ่ง
 * วาดในฉากกลาง bkk-3d-host.js (three.js) ร่วมกับชั้นทางด่วน (bkk-elevated.js)
 *
 * ข้อมูล
 *   - แนวราง/ความสูง: bkk-rail-data.js (window.BKK_RAIL) จาก OSM ด้วย _geo/build-bkk-rail.js
 *   - ชื่อ/รหัสสถานี: bkk-transit-data.js (window.BKK_TRANSIT) ที่หน้านี้ใช้อยู่แล้ว — สถานีถูก "สแนป" เข้าแนวรางจริง
 *
 * รูปทรง
 *   - รถไฟหนัก/BTS: คานกล่องคอนกรีต + รางเหล็กคู่ + ราวขอบสีตามสาย
 *   - โมโนเรล (เหลือง ชมพู ทอง): คานเดี่ยวแคบสูง สีตามสาย ขบวนคร่อมคาน
 *   - สถานี: แบบประจำสาย (หลังคา 7 ทรง) · ชานชาลาข้าง/เกาะกลาง/สองชั้นตามรางจริง · ชั้นขายตั๋วผนังกระจก
 *     · บันได บันไดเลื่อน ลิฟต์ ตามตำแหน่ง OSM · สถานีร่วมที่ข้ามกันคนละระดับ (ดูหัวข้อ "สถานี")
 *   - เงานุ่มบนพื้นใต้ทางวิ่งและสถานี
 *   - ระบบจ่ายไฟเหนือหัว 25 kV ของสายสีแดงและ ARL: เสา แขนยื่น โครงข้ามราง และสาย (ดูหัวข้อ "ระบบจ่ายไฟเหนือหัว")
 *   - ขบวนรถ: วิ่งไปตามรางจริง (เปิด/ปิดได้) — เปิดเมื่อซูม ≥ 13 เท่านั้น
 *     รูปทรง/ลายรถจริงรายสาย + จำนวนตู้ตามที่ให้บริการ จาก bkk-train-models.js (ซูมใกล้ = รายละเอียดเต็ม)
 *
 * ⚠ ระดับรางเป็นค่าประมาณรายสาย ไม่ใช่ค่าที่วัดจริง (ดูหมายเหตุในไฟล์ข้อมูล)
 */
(function () {
  "use strict";

  var DATA_URL = "bkk-rail-data.js";
  var MODELS_URL = "bkk-train-models.js";   // แบบรถไฟฟ้ารายสาย (รูปทรง + ลายรถ)
  var MOD_ID = "rail";
  var LS_KEY = "bkk-rail3d-on";
  var LS_TRAIN = "bkk-rail3d-trains";
  var PIER_ZOOM = 12.6, STATION_ZOOM = 13.2, TRAIN_ZOOM = 13, WALK_ZOOM = 14.6;
  var DETAIL_ZOOM = 15;         // บันได ลิฟต์ ประตูกั้นชานชาลา — แสดงเมื่อซูมใกล้เท่านั้น
  var CHUNK_M = 3900;
  var GAUGE = 1.435;            // ความกว้างราง (ม.)
  var TRAIN_SPEED = 19;         // ม./วินาที ≈ 68 กม./ชม.
  var TRAIN_ACC = 1.0;          // อัตราเร่ง/หน่วงเวลาเข้า-ออกสถานี (ม./วินาที²)
  var DWELL = 9;                // เวลาจอดรับ-ส่งผู้โดยสาร (วินาที)
  var TRAIN_LOD_ZOOM = 15.8;    // ขบวนรายละเอียดเต็ม (โบกี้ ล้อ แอร์ แพนโทกราฟ) เมื่อซูมถึงระดับนี้
  var TRAIN_LOD_REACH = 1.6;    // …และอยู่ไม่ไกลกว่า 1.6 เท่าของระยะกล้อง→กลางจอ (ไกลกว่านั้นใช้รูปทรงอย่างง่าย)

  var H = null, T = null, D = null, map = null;
  var visible = true, trainsOn = true, loading = null, failed = false;
  var group = null, model = null, uiBuilt = false;
  var matColor = {}, matSteel = null, hoverMat = null, selMat = null;
  var matPaint = null, matRoofTop = null, matGlass = null, matLouvre = null, matStair = null, matPSD = null;
  var TEX = {}, texList = [];
  var hoverKey = null, selKey = null, hoverMesh = null, selMesh = null;
  var baseLayersHidden = false, savedVis = {};

  function $(s, r) { return (r || document).querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(v, d) { return Number(v).toLocaleString("th-TH", { maximumFractionDigits: d || 0 }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function loadScript(src) {
    return new Promise(function (ok, bad) {
      var s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = ok;
      s.onerror = function () { bad(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }

  function ensureLoaded() {
    if (loading) return loading;
    setChipState("loading");
    loading = Promise.all([
      H.ensure(),
      window.BKK_RAIL ? Promise.resolve() : loadScript(DATA_URL),
      window.BKK_TRAIN_MODELS ? Promise.resolve() : loadScript(MODELS_URL)
    ]).then(function () {
      T = H.THREE(); D = window.BKK_RAIL;
      if (!T || !D) throw new Error("THREE/BKK_RAIL missing");
      buildModel();
      setChipState("ready");
    }).catch(function (e) {
      failed = true;
      console.warn("rail 3D:", e);
      setChipState("error");
    });
    return loading;
  }

  /* ------------------------------------------------------------- ตัวช่วยเรขา */
  function Builder() { this.p = []; this.i = []; }
  Builder.prototype.v = function (x, y, z) { this.p.push(x, y, z); return this.p.length / 3 - 1; };
  Builder.prototype.q = function (a, b, c, d) { this.i.push(a, b, c, a, c, d); };
  // กล่องหมุนรอบแกนตั้ง: จุดกึ่งกลาง (cx,cy) ฐาน z0 ถึง z1 · sx = ตามแนว, sy = ขวางแนว
  Builder.prototype.box = function (cx, cy, z0, z1, sx, sy, ux, uy) {
    var px = -uy, py = ux;                         // แกนขวาง
    var hx = sx / 2, hy = sy / 2, b = this.p.length / 3;
    var c = [[-hx, -hy], [hx, -hy], [hx, hy], [-hx, hy]];
    for (var i = 0; i < 4; i++) this.v(cx + ux * c[i][0] + px * c[i][1], cy + uy * c[i][0] + py * c[i][1], z0);
    for (i = 0; i < 4; i++) this.v(cx + ux * c[i][0] + px * c[i][1], cy + uy * c[i][0] + py * c[i][1], z1);
    this.q(b, b + 1, b + 2, b + 3);                 // ล่าง
    this.q(b + 4, b + 5, b + 6, b + 7);             // บน
    this.q(b, b + 1, b + 5, b + 4);
    this.q(b + 1, b + 2, b + 6, b + 5);
    this.q(b + 2, b + 3, b + 7, b + 6);
    this.q(b + 3, b, b + 4, b + 7);
  };
  function finish(B, mat, grp) {
    if (!B.p.length) return null;
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(B.p, 3));
    g.setIndex(new T.BufferAttribute(new Uint32Array(B.i), 1));
    g.computeBoundingSphere();
    var m = new T.Mesh(g, mat);
    m.matrixAutoUpdate = false;
    (grp || group).add(m);
    return m;
  }

  function lineMat(lineId) {
    if (matColor[lineId]) return matColor[lineId];
    var L = D.lines[lineId] || { color: "#888888" };
    matColor[lineId] = new T.MeshPhongMaterial({ color: L.color, flatShading: true, shininess: 6, specular: 0x111111, side: T.DoubleSide });
    return matColor[lineId];
  }

  /* --------------------------------------------------------- ถอดข้อมูลราง */
  function decodeTrack(rec, idx) {
    var p = rec.p, pts = [], X = 0, Y = 0, HH = 0;
    for (var i = 0; i < p.length; i += 3) {
      X += p[i]; Y += p[i + 1]; HH += p[i + 2];
      var lon = X / 1e6, lat = Y / 1e6, q = H.toLocal(lon, lat);
      q.h = HH / 10; q.k = H.kAt(lat); q.lon = lon; q.lat = lat;
      var last = pts[pts.length - 1];
      if (last && Math.hypot(q.x - last.x, q.y - last.y) < 0.05) continue;
      pts.push(q);
    }
    if (pts.length < 2) return null;
    var s = 0;
    for (i = 0; i < pts.length; i++) {
      if (i) s += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) / pts[i].k;
      pts[i].s = s;
    }
    return {
      idx: idx, rec: rec, line: rec.l, mono: !!rec.k, yard: !!rec.y,
      pts: pts, len: s, hmax: rec.hx, hmin: rec.hn
    };
  }

  // ทิศ ณ จุดที่ i (หน่วยเวกเตอร์)
  function dirAt(P, i) {
    var a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    return [dx / L, dy / L];
  }

  /* คานทางวิ่ง: รถไฟหนัก = คานกล่อง + รางเหล็กคู่ + ราวสีตามสาย · โมโนเรล = คานเดี่ยวแคบ */
  function emitTrack(BC, BR, BL, R, SH) {
    var P = R.pts, n = P.length;
    var gw = R.mono ? 0.9 : 4.6;        // ความกว้างคาน
    var gd = R.mono ? 1.7 : 2.0;        // ความลึกคาน
    var c0 = BC.i.length;
    for (var i = 0; i < n - 1; i++) {
      var a = P[i], b = P[i + 1];
      var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      if (L < 0.01) continue;
      var ux = dx / L, uy = dy / L, k = a.k;
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      var z1 = (a.h + b.h) / 2 * k, z0 = z1 - gd * k;
      (R.mono ? BL : BC).box(mx, my, z0, z1, L, gw * k, ux, uy);
      // เงานุ่มบนพื้นใต้ทางวิ่ง (เลื่อนตามทิศแดดตามความสูง) — ให้โครงสร้างดูตั้งอยู่บนพื้นจริง
      if (SH && (a.h > 1.5 || b.h > 1.5)) {
        var sa = H.sunShift(a.h * 0.3), sb = H.sunShift(b.h * 0.3), hw = (gw / 2 + (R.mono ? 1.6 : 2.2)) * k;
        var qx = -uy * hw, qy = ux * hw, zs = 0.15 * k, s0 = SH.p.length / 3;
        SH.v([a.x + sa[0] * k + qx, a.y + sa[1] * k + qy, zs], 0, 0);
        SH.v([b.x + sb[0] * k + qx, b.y + sb[1] * k + qy, zs], 0, 1);
        SH.v([b.x + sb[0] * k - qx, b.y + sb[1] * k - qy, zs], 1, 1);
        SH.v([a.x + sa[0] * k - qx, a.y + sa[1] * k - qy, zs], 1, 0);
        SH.q(s0, s0 + 1, s0 + 2, s0 + 3);
      }
      if (!R.mono) {
        // รางเหล็กสองเส้นบนคาน + ราวขอบสีตามสาย
        var px = -uy, py = ux, off = GAUGE / 2 * k, rh = 0.18 * k;
        BR.box(mx + px * off, my + py * off, z1, z1 + rh, L, 0.12 * k, ux, uy);
        BR.box(mx - px * off, my - py * off, z1, z1 + rh, L, 0.12 * k, ux, uy);
        var eo = (gw / 2 - 0.16) * k;
        [1, -1].forEach(function (sg) {
          if (!twinOverlap(R, sg, a.s, b.s)) { BL.box(mx + px * eo * sg, my + py * eo * sg, z1, z1 + 0.55 * k, L, 0.3 * k, ux, uy); return; }
          // คานกว้างสายสีแดง: ช่วงที่มีคู่อยู่ด้านนี้ไม่มีราวด้านใน — ตัดราวเป็นท่อนละ ≤ 20 ม. แล้วเช็กทีละท่อน
          var np = Math.max(1, Math.ceil((b.s - a.s) / 20));
          for (var q = 0; q < np; q++) {
            if (inTwin(R, sg, a.s + (b.s - a.s) * (q + 0.5) / np)) continue;
            var fm = (q + 0.5) / np;
            BL.box(a.x + (b.x - a.x) * fm + px * eo * sg, a.y + (b.y - a.y) * fm + py * eo * sg, z1, z1 + 0.55 * k, L / np, 0.3 * k, ux, uy);
          }
        });
      }
    }
    return { c0: c0, c1: BC.i.length };
  }

  // ตอม่อ: ทุก ~30 ม. · ของคู่ขนานรวมเป็นต้นเดียวคานยาว
  // skip(x, y) = จุดนี้อยู่ในรอยสถานี (สถานีมีเสารับของตัวเอง) → ไม่ปักตอม่อทางวิ่งซ้ำ
  function collectPiers(R, grid, list, skip) {
    var SP = 30, P = R.pts;
    if (R.len < 25) return;
    var s = SP / 2, i = 0;
    while (s < R.len - 8) {
      while (i < P.length - 2 && P[i + 1].s < s) i++;
      var a = P[i], b = P[i + 1];
      var f = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0;
      var h = a.h + (b.h - a.h) * f - (R.mono ? 1.7 : 2.0);
      var x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f;
      if (h > 2 && !(skip && skip(x, y))) {
        var k = a.k;
        var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
        dx /= L; dy /= L;
        var cx = Math.floor(x / 20), cy = Math.floor(y / 20), merged = false;
        for (var gx = cx - 1; gx <= cx + 1 && !merged; gx++) {
          for (var gy = cy - 1; gy <= cy + 1 && !merged; gy++) {
            var cell = grid[gx + ":" + gy];
            if (!cell) continue;
            for (var c = 0; c < cell.length; c++) {
              var q = cell[c];
              if (q.m || q.line !== R.line || Math.abs(q.top - h) > 2.5 || Math.abs(q.dx * dx + q.dy * dy) < 0.9) continue;
              var ddx = x - q.x, ddy = y - q.y, dist = Math.hypot(ddx, ddy);
              if (dist > 16 * k || Math.abs(ddx * q.dx + ddy * q.dy) > 6 * k) continue;
              q.span = dist / k + 5;
              q.x = (q.x + x) / 2; q.y = (q.y + y) / 2;
              q.top = Math.min(q.top, h);
              q.m = true; merged = true;
              break;
            }
          }
        }
        if (!merged) {
          var pier = { x: x, y: y, top: h, k: k, dx: dx, dy: dy, span: R.mono ? 2.2 : 5.4, m: false, line: R.line, mono: R.mono };
          (grid[cx + ":" + cy] = grid[cx + ":" + cy] || []).push(pier);
          list.push(pier);
        }
      }
      s += SP;
    }
  }

  /* ================================================================= สถานี
     แบบจำลองตามแบบสถานีของแต่ละสาย วางบนแนวรางจริง
       ชั้น: ถนน → ชั้นขายตั๋ว (คอนคอร์ส) → ชั้นชานชาลา (สยามมีสองชั้น) → หลังคาทรงประจำสาย
       ขนาด/การจัดชานชาลา: OSM (railway=platform · building=train_station) ไม่มีก็ใช้ค่ามาตรฐานของสาย
       ทางขึ้น-ลง: บันได/บันไดเลื่อน (highway=steps) + ทางออก (railway=subway_entrance) + ลิฟต์ จาก OSM
       สถานีร่วม: สายที่ข้ามกันคนละระดับ → ตัดหลังคาตัวล่างใต้ตัวบน ตัวบนใช้ชั้นขายตั๋วของตัวล่าง
     ขนาดทั้งหมดในส่วนนี้เป็น "เมตรในกรอบสถานี": t = ตามแนวราง · o = ขวางแนว (ซ้ายของทิศราง) · z = สูงจากพื้น */
  var EDGE = 1.65;            // ศูนย์กลางราง → ขอบชานชาลา (ตัวรถกว้าง 3.1 ม.)
  var COL_STEP = 12.5;        // ระยะเสาตามแนวสถานี
  var FRAME_STEP = 25;        // ระยะโครงเสาคู่ใต้สถานี
  var VERANDA = 2.4;          // พื้นชั้นขายตั๋วยื่นเลยตัวสถานีออกไปทั้งสองข้าง (ทางเดินรอบห้องขายตั๋ว)
  var RISE_RUN = 1.65;        // บันได: ระยะราบต่อความสูง (≈ 31°)
  var LANDING = 1.8, TOP_LANDING = 2.2;   // ชานพักกลาง/หัวบันได (ม.)
  // roof = ทรงหลังคา · L/W = ยาว/กว้างเมื่อ OSM ไม่มี · conc = สัดส่วนความยาวชั้นขายตั๋ว · side = ความกว้างชานชาลาข้าง
  // eave = ชายคาสูงเหนือพื้นชานชาลา · rise = ความโค้ง/ยกของหลังคา · sup = "center" เสากลางรับคานยื่น / "portal" เสาคู่
  // wall = ผนังชั้นชานชาลา · tint = สัดส่วนสีประจำสายบนหลังคา · cov = บันไดมีหลังคาคลุม
  var STYLE = {
    bts:    { name: "BTS", roof: "barrel", L: 150, W: 24, conc: 0.56, side: 4.2, eave: 5.2, rise: 2.4, sup: "portal", wall: "louvre", tint: 0.16, cov: true },
    gold:   { name: "BTS สายสีทอง", roof: "canopy", L: 80, W: 22, conc: 0.8, side: 4.0, eave: 4.4, rise: 0.9, sup: "center", wall: "glass", tint: 0.35, cov: true },
    blue:   { name: "MRT สายสีน้ำเงิน (ยกระดับ)", roof: "mrtx", base: "#c6cbd2", L: 110, W: 24, conc: 0.8, side: 4.4, eave: 5.4, rise: 2.4, sup: "portal", wall: "glass", tint: 0.06, cov: true },
    purple: { name: "MRT สายสีม่วง", roof: "skybarrel", L: 150, W: 23, conc: 0.7, side: 4.2, eave: 5.4, rise: 2.6, sup: "portal", wall: "glass", tint: 0.22, cov: true },
    mono:   { name: "โมโนเรล (ชมพู/เหลือง)", roof: "wing", L: 100, W: 28, conc: 0.8, side: 4.4, eave: 5.2, rise: 2.2, sup: "center", wall: "glass", tint: 0.3, cov: true },
    arl:    { name: "แอร์พอร์ต เรล ลิงก์", roof: "shell", L: 210, W: 24, conc: 0.5, side: 4.4, eave: 5.6, rise: 4.0, sup: "portal", wall: "glass", tint: 0.18, cov: true },
    red:    { name: "รถไฟชานเมืองสายสีแดง", roof: "vaults", L: 216, W: 33, conc: 0.65, side: 5.0, eave: 6.0, rise: 2.6, sup: "portal", wall: "glass", tint: 0.2, cov: true }
  };
  var LINE_STYLE = { "bts-sukhumvit": "bts", "bts-silom": "bts", "bts-gold": "gold", "mrt-blue": "blue", "mrt-purple": "purple",
    "mrt-pink": "mono", "mrt-yellow": "mono", "arl": "arl", "srt-dark-red": "red", "srt-light-red": "red" };
  /* BTS ส่วนต่อขยาย: หลังคาจั่วขาว ไม่ใช่หลังคาโค้งลอนแบบสายเดิม (ตรวจจากภาพถ่ายดาวเทียมรายสถานี 2026-09)
       ridge = แถบช่องแสงเขียวอมฟ้าตามสันหลังคา (N10–N24) · mid = แถบช่องแสงกลางหลังคาเฉพาะช่วงกลาง (S9–S12)
       slot = ร่องช่องแสงสีเข้มกลางหลังคา (E15–E23) · ไม่มี = จั่วขาวเรียบ (S7 S8 N9 E10–E14)
     MRT สายสีน้ำเงินยกระดับ: หลังคา 3 ช่วง — ช่วงกลางผนังกระจกยก (สีน้ำเงินเฉพาะ BLUE_CENTER) หัว-ท้ายจั่วเทาลาดเอียงสอบ */
  function variant(base, o) { var r = {}, k; for (k in base) r[k] = base[k]; for (k in o) r[k] = o[k]; return r; }
  STYLE.btsx = variant(STYLE.bts, { name: "BTS ส่วนต่อขยาย (หลังคาจั่วขาว)", roof: "gable", rise: 1.6, tint: 0.03 });
  STYLE.btsxRidge = variant(STYLE.btsx, { name: "BTS ส่วนต่อขยายสายเหนือ (หลังคาขาว แถบช่องแสงตามสัน)", sky: "ridge" });
  STYLE.btsxMid = variant(STYLE.btsx, { name: "BTS สายสีลมส่วนต่อขยาย (หลังคาขาว แถบช่องแสงกลางหลังคา)", sky: "mid" });
  STYLE.btsxSlot = variant(STYLE.btsx, { name: "BTS ส่วนต่อขยายสมุทรปราการ (หลังคาขาว ร่องช่องแสงกลาง)", sky: "slot" });
  var STATION_STYLE = (function () {
    var m = {}, i;
    for (i = 10; i <= 24; i++) m["N" + i] = "btsxRidge";
    for (i = 9; i <= 12; i++) m["S" + i] = "btsxMid";
    for (i = 15; i <= 23; i++) m["E" + i] = "btsxSlot";
    ["S7", "S8", "N9", "E10", "E11", "E12", "E13", "E14"].forEach(function (c) { m[c] = "btsx"; });
    return m;
  })();
  var BLUE_CENTER = { BL04: 1, BL34: 1 };   // บางขุนนนท์ บางหว้า — หลังคาช่วงกลางสีน้ำเงิน
  var MRT_HOOD = 5;                         // หลังคา MRT ยื่นเลยปลายชานชาลา (หัวลาดเอียง)
  var ROOF_BASE = { dark: "#a9b3bf", light: "#eef1f4", sunset: "#e6d0c2" };   // สีหลังคา (คูณกับสีประจำสายต่อจุด)
  var TEX_TONE = { dark: "#c3cbd6", light: "#ffffff", sunset: "#f1dccd" };    // หรี่ผิวลายในธีมมืด
  var GLOW = { dark: 0.55, light: 0, sunset: 0.22 };                          // ไฟในอาคารส่องผ่านกระจกตอนกลางคืน
  var COL = null;
  function colors() {
    if (!COL) COL = {
      white: new T.Color("#ffffff"), steel: new T.Color("#7d8791"), dark: new T.Color("#3b424b"), frame: new T.Color("#5b636d"),
      under: new T.Color("#e4e8ed"), edge: new T.Color("#f0c02f"),
      skyTeal: new T.Color("#72b3a6"), skyPale: new T.Color("#a3c6be"), mrtBlue: new T.Color("#4652a8")
    };
    return COL;
  }

  function normName(s) { return String(s || "").replace(/^สถานี\s*/, "").replace(/[\s​]/g, "").replace(/[-–—]/g, ""); }

  /* ตัวสร้างรูปทรงของสถานี: ตำแหน่ง + uv / สีต่อจุด / normal (เลือกได้ตามวัสดุ) */
  function MB(o) { o = o || {}; this.p = []; this.i = []; this.uv = o.uv ? [] : null; this.c = o.c ? [] : null; this.n = o.n ? [] : null; }
  MB.prototype.v = function (P, u, v, col, N) {
    this.p.push(P[0], P[1], P[2]);
    if (this.uv) this.uv.push(u || 0, v || 0);
    if (this.c) { var c = col || COL.white; this.c.push(c.r, c.g, c.b); }
    if (this.n) { if (N) this.n.push(N[0], N[1], N[2]); else this.n.push(0, 0, 1); }
    return this.p.length / 3 - 1;
  };
  MB.prototype.q = function (a, b, c, d) { this.i.push(a, b, c, a, c, d); };
  function flushMB(B, mat, grp) {
    if (!B || !B.i.length) return null;
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(B.p, 3));
    if (B.uv) g.setAttribute("uv", new T.Float32BufferAttribute(B.uv, 2));
    if (B.c) g.setAttribute("color", new T.Float32BufferAttribute(B.c, 3));
    if (B.n) g.setAttribute("normal", new T.Float32BufferAttribute(B.n, 3));
    g.setIndex(new T.BufferAttribute(new Uint32Array(B.i), 1));
    g.computeBoundingSphere();
    var m = new T.Mesh(g, mat);
    m.matrixAutoUpdate = false;
    grp.add(m);
    return m;
  }

  /* กรอบสถานี → พิกัดโลก (หน่วยของฉาก) · F.n แปลงทิศ normal */
  function frameOf(S) {
    var k = S.k, ux = S.ux, uy = S.uy, X = S.x, Y = S.y;
    var f = function (t, o, z) { return [X + (ux * t - uy * o) * k, Y + (uy * t + ux * o) * k, z * k]; };
    f.n = function (nt, no, nz) { return [ux * nt - uy * no, uy * nt + ux * no, nz]; };
    return f;
  }
  function toFrame(S, x, y) { var dx = x - S.x, dy = y - S.y; return [(dx * S.ux + dy * S.uy) / S.k, (-dx * S.uy + dy * S.ux) / S.k]; }

  // แท่งสี่เหลี่ยมจากมุมฐาน cb (ที่สูง zb) ถึงมุมบน ct (ที่สูง zt) — ใช้ทำกล่อง/กล่องเอียง/หัวเสาบาน
  function prism2(B, F, cb, ct, zb, zt, col) {
    var b = B.p.length / 3, i;
    for (i = 0; i < 4; i++) B.v(F(cb[i][0], cb[i][1], zb[i]), 0, 0, col);
    for (i = 0; i < 4; i++) B.v(F(ct[i][0], ct[i][1], zt[i]), 0, 0, col);
    B.q(b, b + 1, b + 2, b + 3); B.q(b + 4, b + 5, b + 6, b + 7);
    B.q(b, b + 1, b + 5, b + 4); B.q(b + 1, b + 2, b + 6, b + 5);
    B.q(b + 2, b + 3, b + 7, b + 6); B.q(b + 3, b, b + 4, b + 7);
  }
  function prism(B, F, c, zb, zt, col) { prism2(B, F, c, c, zb, zt, col); }
  function fbox(B, F, t0, t1, o0, o1, z0, z1, col) {
    prism(B, F, [[t0, o0], [t1, o0], [t1, o1], [t0, o1]], [z0, z0, z0, z0], [z1, z1, z1, z1], col);
  }
  function rect4(a, b, w) {
    var dt = b[0] - a[0], dd = b[1] - a[1], L = Math.hypot(dt, dd) || 1, nt = -dd / L * w / 2, no = dt / L * w / 2;
    return [[a[0] + nt, a[1] + no], [b[0] + nt, b[1] + no], [b[0] - nt, b[1] - no], [a[0] - nt, a[1] - no]];
  }
  function sbox(B, F, a, b, w, z0, z1, col) { prism(B, F, rect4(a, b, w), [z0, z0, z0, z0], [z1, z1, z1, z1], col); }
  // แผ่นเอียงจาก a (สูง za) ถึง b (สูง zb) หนา th ใต้ผิวบน
  function slope(B, F, a, za, b, zb, w, th, col) {
    prism(B, F, rect4(a, b, w), [za - th, zb - th, zb - th, za - th], [za, zb, zb, za], col);
  }
  // หัวเสาบาน: ครึ่งขนาดโคน (bt, bo) → ปลาย (tt, to) รอบจุด (tc, oc)
  function taper(B, F, tc, oc, z0, z1, bt, bo, tt, to, col) {
    prism2(B, F, [[tc - bt, oc - bo], [tc + bt, oc - bo], [tc + bt, oc + bo], [tc - bt, oc + bo]],
      [[tc - tt, oc - to], [tc + tt, oc - to], [tc + tt, oc + to], [tc - tt, oc + to]], [z0, z0, z0, z0], [z1, z1, z1, z1], col);
  }
  // แผ่นผนังตั้งมีลาย: จาก a ถึง b สูง z0..z1 · uPer = กว้าง (ม.) ต่อหนึ่งลาย · vr = จำนวนลายตามความสูง
  function tquad(B, F, a, b, z0, z1, uPer, vr) {
    var u1 = Math.hypot(b[0] - a[0], b[1] - a[1]) / uPer, s = B.v(F(a[0], a[1], z0), 0, 0);
    B.v(F(b[0], b[1], z0), u1, 0); B.v(F(b[0], b[1], z1), u1, vr); B.v(F(a[0], a[1], z1), 0, vr);
    B.q(s, s + 1, s + 2, s + 3);
  }
  // ผิวจากโปรไฟล์ขวาง prof = [[o, z], ...] (o เพิ่มขึ้น) ยืดตามแนว t0..t1 · normal ตั้งฉากโปรไฟล์ → หลังคาโค้งเนียน
  function sweep(B, F, prof, t0, t1, col, uPer, vPer) {
    var base = B.p.length / 3, n = prof.length, acc = 0, up = uPer || 0.8, vp = vPer || 6, i;
    for (i = 0; i < n; i++) {
      if (i) acc += Math.hypot(prof[i][0] - prof[i - 1][0], prof[i][1] - prof[i - 1][1]);
      var a = prof[Math.max(0, i - 1)], b = prof[Math.min(n - 1, i + 1)];
      var dO = b[0] - a[0], dZ = b[1] - a[1], L = Math.hypot(dO, dZ) || 1;
      var N = B.n ? F.n(0, -dZ / L, dO / L) : null;
      B.v(F(t0, prof[i][0], prof[i][1]), t0 / up, acc / vp, col, N);
      B.v(F(t1, prof[i][0], prof[i][1]), t1 / up, acc / vp, col, N);
    }
    for (i = 0; i < n - 1; i++) { var p0 = base + i * 2; B.q(p0, p0 + 1, p0 + 3, p0 + 2); }
  }
  // ผิวตาราง z = zf(t, o) (หลังคาลอนตามแนวของสายสีแดง) · normal จากความชันจริง
  function gridSurf(B, F, ts, os, zf, col) {
    var base = B.p.length / 3, no = os.length, i, j;
    for (i = 0; i < ts.length; i++) for (j = 0; j < no; j++) {
      var t = ts[i], o = os[j];
      var dzt = (zf(t + 0.3, o) - zf(t - 0.3, o)) / 0.6, dzo = (zf(t, o + 0.3) - zf(t, o - 0.3)) / 0.6, L = Math.hypot(dzt, dzo, 1);
      B.v(F(t, o, zf(t, o)), t / 0.8, o / 6, col, B.n ? F.n(-dzt / L, -dzo / L, 1 / L) : null);
    }
    for (i = 0; i < ts.length - 1; i++) for (j = 0; j < no - 1; j++) { var a = base + i * no + j; B.q(a, a + no, a + no + 1, a + 1); }
  }
  // ปิดหน้าตัดหัว-ท้ายระหว่างผิวบนกับผิวล่างของหลังคา
  function caps(B, F, top, under, t, col) {
    for (var i = 0; i < top.length - 1; i++) {
      var s = B.v(F(t, top[i][0], top[i][1]), 0, 0, col);
      B.v(F(t, top[i + 1][0], top[i + 1][1]), 0, 0, col);
      B.v(F(t, under[i + 1][0], under[i + 1][1]), 0, 0, col);
      B.v(F(t, under[i][0], under[i][1]), 0, 0, col);
      B.q(s, s + 1, s + 2, s + 3);
    }
  }

  /* ------------------------------------------------ ลายผิว (วาดเองบน canvas ไม่ต้องโหลดไฟล์) */
  function canvasTex(w, h, draw) {
    var cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    draw(cv.getContext("2d"), w, h);
    var tx = new T.CanvasTexture(cv);
    tx.wrapS = tx.wrapT = T.RepeatWrapping;
    var r = H.renderer();
    if (r) tx.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
    texList.push(tx);
    return tx;
  }
  function makeStationMaterials() {
    var th = H.theme();
    TEX.glass = canvasTex(256, 256, function (g, w, h) {          // ผนังกระจก 3 ม. ต่อลาย: เสาเอ็นทุก 1.5 ม. + แผงทึบช่วงล่าง
      var gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, "#d3e3f1"); gr.addColorStop(0.5, "#86a2bb"); gr.addColorStop(1, "#4d6278");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(255,255,255,0.13)";
      g.beginPath(); g.moveTo(20, h); g.lineTo(90, 0); g.lineTo(130, 0); g.lineTo(60, h); g.fill();
      g.fillStyle = "#3f4750";
      g.fillRect(0, 0, 6, h); g.fillRect(w / 2 - 3, 0, 6, h);
      g.fillRect(0, 0, w, 8); g.fillRect(0, Math.round(h * 0.36), w, 5);
      g.fillStyle = "#5c6570"; g.fillRect(0, h - 26, w, 26);
    });
    TEX.glow = canvasTex(256, 256, function (g, w, h) {           // ไฟในอาคาร (เฉพาะช่องกระจก)
      g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
      var gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, "#5a4a30"); gr.addColorStop(1, "#ffdca0");
      g.fillStyle = gr;
      g.fillRect(9, 10, w / 2 - 14, h - 38); g.fillRect(w / 2 + 5, 10, w / 2 - 14, h - 38);
      g.fillStyle = "#000"; g.fillRect(0, Math.round(h * 0.36) - 1, w, 7);
    });
    TEX.louvre = canvasTex(256, 256, function (g, w, h) {         // ผนังบานเกล็ดแบบ BTS + แผงทึบช่วงล่าง
      g.fillStyle = "#b8c0c8"; g.fillRect(0, 0, w, h);
      for (var y = 10; y < h * 0.7; y += 12) { g.fillStyle = "#e6eaee"; g.fillRect(0, y, w, 5); g.fillStyle = "#6f7984"; g.fillRect(0, y + 5, w, 3); }
      g.fillStyle = "#98a2ad"; g.fillRect(0, Math.round(h * 0.72), w, h);
      g.fillStyle = "#59636d";
      g.fillRect(0, 0, 5, h); g.fillRect(w / 2 - 2, 0, 5, h); g.fillRect(0, Math.round(h * 0.71), w, 5); g.fillRect(0, 0, w, 6);
    });
    TEX.steps = canvasTex(64, 64, function (g, w, h) {            // ขั้นบันได 2 ขั้นต่อลาย (0.6 ม.) + จมูกบันไดสีเหลือง
      g.fillStyle = "#c9cfd6"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#7c8691"; g.fillRect(0, 0, w, 7); g.fillRect(0, h / 2, w, 7);
      g.fillStyle = "#e7c24a"; g.fillRect(0, 7, w, 2); g.fillRect(0, h / 2 + 7, w, 2);
      g.fillStyle = "#8e98a3"; g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h);
    });
    TEX.psd = canvasTex(256, 128, function (g, w, h) {            // ประตูกั้นชานชาลาครึ่งความสูง 2.2 ม. ต่อชุด
      g.fillStyle = "#a6c9d4"; g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(255,255,255,0.3)";
      g.beginPath(); g.moveTo(30, h); g.lineTo(80, 0); g.lineTo(104, 0); g.lineTo(54, h); g.fill();
      g.fillStyle = "#4b545d";
      g.fillRect(0, 0, w, 12); g.fillRect(0, h - 8, w, 8); g.fillRect(0, 0, 8, h); g.fillRect(w - 8, 0, 8, h); g.fillRect(w / 2 - 3, 12, 6, h - 20);
      g.fillStyle = "#e3b53a"; g.fillRect(w / 2 - 34, Math.round(h * 0.5), 68, 7);
    });
    TEX.seam = canvasTex(64, 16, function (g, w, h) {             // ตะเข็บหลังคาเหล็กทุก 0.8 ม.
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#cdd3d9"; g.fillRect(w - 11, 0, 8, h);
      g.fillStyle = "#f5f7f9"; g.fillRect(w - 3, 0, 3, h);
    });
    var tone = TEX_TONE[th] || "#ffffff";
    matPaint = new T.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 14, specular: 0x222222, side: T.DoubleSide });
    matRoofTop = new T.MeshPhongMaterial({ color: ROOF_BASE[th] || ROOF_BASE.dark, vertexColors: true, map: TEX.seam,
      shininess: 36, specular: 0x3a3f46, side: T.DoubleSide });
    matGlass = new T.MeshPhongMaterial({ color: tone, map: TEX.glass, emissive: "#ffe2ae", emissiveMap: TEX.glow,
      emissiveIntensity: GLOW[th] || 0, flatShading: true, shininess: 90, specular: 0x8a9bb0, side: T.DoubleSide });
    matLouvre = new T.MeshPhongMaterial({ color: tone, map: TEX.louvre, flatShading: true, shininess: 10, specular: 0x111111, side: T.DoubleSide });
    matStair = new T.MeshPhongMaterial({ color: tone, map: TEX.steps, flatShading: true, shininess: 4, specular: 0x000000, side: T.DoubleSide });
    matPSD = new T.MeshPhongMaterial({ color: tone, map: TEX.psd, flatShading: true, shininess: 70, specular: 0x6a8494, side: T.DoubleSide });
  }
  function themeStationMaterials(name) {
    if (!matRoofTop) return;
    matRoofTop.color.set(ROOF_BASE[name] || ROOF_BASE.dark);
    [matGlass, matLouvre, matStair, matPSD].forEach(function (m) { m.color.set(TEX_TONE[name] || "#ffffff"); });
    matGlass.emissiveIntensity = GLOW[name] || 0;
  }

  /* ---------------------------------- ทางเดินลอยฟ้า (ถอดครั้งเดียว ใช้ทั้งวาดและหาว่าหัวบันไดแตะทางเดินไหน) */
  var walkCache = null;
  function walkList() {
    if (walkCache) return walkCache;
    walkCache = { list: [], grid: {} };
    (D.walks || []).forEach(function (w) {
      var X = 0, Y = 0, pts = [], i;
      for (i = 0; i < w.p.length; i += 2) {
        X += w.p[i]; Y += w.p[i + 1];
        var lon = X / 1e6, lat = Y / 1e6, q = H.toLocal(lon, lat);
        q.k = H.kAt(lat);
        var last = pts[pts.length - 1];
        if (last && Math.hypot(q.x - last.x, q.y - last.y) < 0.05) continue;
        pts.push(q);
      }
      if (pts.length < 2) return;
      var rec = { w: w, pts: pts, h: w.h / 10 };
      walkCache.list.push(rec);
      for (i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 4));
        for (var j = 0; j <= n; j++) {
          var x = a.x + (b.x - a.x) * j / n, y = a.y + (b.y - a.y) * j / n, key = Math.floor(x / 25) + ":" + Math.floor(y / 25);
          (walkCache.grid[key] = walkCache.grid[key] || []).push([x, y, rec.h]);
        }
      }
    });
    return walkCache;
  }
  function walkHeightAt(x, y, r) {
    var g = walkList().grid, cx = Math.floor(x / 25), cy = Math.floor(y / 25), best = null, bd = r;
    for (var i = cx - 1; i <= cx + 1; i++) for (var j = cy - 1; j <= cy + 1; j++) {
      var c = g[i + ":" + j];
      if (!c) continue;
      for (var m = 0; m < c.length; m++) { var d = Math.hypot(c[m][0] - x, c[m][1] - y); if (d < bd) { bd = d; best = c[m][2]; } }
    }
    return best;
  }

  /* ------------------------------------------------------ จัดวางสถานี */
  // พิกัดสถานีใช้ของ OSM (ชุดข้อมูลเดิมของหน้าคลาดจากแนวรางจริงหลายร้อยเมตร)
  // แล้วจับคู่ "ชื่อ" กับชุดข้อมูลของหน้าเพื่อเอารหัสสถานี/สายที่เปลี่ยนได้
  function buildStations(tracks) {
    var out = [];
    if (!D.stations) return out;
    var byLine = {};
    tracks.forEach(function (R) { if (R && !R.yard) (byLine[R.line] = byLine[R.line] || []).push(R); });
    var codeBy = {};
    (window.BKK_TRANSIT && window.BKK_TRANSIT.rawLines || []).forEach(function (l) {
      l.stations.forEach(function (s) { codeBy[l.id + "|" + normName(s.name)] = { st: s, line: l }; });
    });
    function nearestOn(list, x, y) {
      var best = null, bd = Infinity, bi = 0;
      list.forEach(function (R) {
        for (var i = 0; i < R.pts.length; i++) {
          var d = Math.hypot(R.pts[i].x - x, R.pts[i].y - y);
          if (d < bd) { bd = d; best = R; bi = i; }
        }
      });
      return best ? { R: best, i: bi, d: bd } : null;
    }
    // รางคู่ขนานของสายเดียวกัน (ทิศเดียวกัน ระดับใกล้กัน) → ศูนย์กลางสถานีอยู่กึ่งกลางระหว่างสองราง
    function mateCenter(list, R, i, k) {
      var P = R.pts[i], dir = dirAt(R.pts, i), best = null, bd = 26 * k;
      list.forEach(function (R2) {
        if (R2 === R) return;
        for (var j = 0; j < R2.pts.length; j++) {
          var Q = R2.pts[j], d = Math.hypot(Q.x - P.x, Q.y - P.y);
          if (d >= bd || Math.abs(Q.h - P.h) > 3) continue;
          var d2 = dirAt(R2.pts, j);
          if (Math.abs(d2[0] * dir[0] + d2[1] * dir[1]) < 0.9) continue;
          bd = d; best = Q;
        }
      });
      return best ? [(P.x + best.x) / 2, (P.y + best.y) / 2] : [P.x, P.y];
    }
    D.stations.forEach(function (rec) {
      var list = byLine[rec.l];
      if (!list) return;
      if (/^srt/.test(rec.l) && normName(rec.n) === "บางซื่อ") return;   // ชื่อเดิมของกรุงเทพอภิวัฒน์ (อาคารเดียวกัน)
      var lon = rec.o[0] / 1e6, lat = rec.o[1] / 1e6;
      var m2 = codeBy[rec.l + "|" + normName(rec.n)];
      var line = m2 ? m2.line : lineOfId(rec.l);
      var st = m2 ? m2.st : { name: rec.n, nameEn: rec.e, code: "", coords: [lon, lat] };
      var q = H.toLocal(lon, lat), k = H.kAt(lat);
      var hit = nearestOn(list, q.x, q.y);
      if (!hit || hit.d > 140 * k) return;          // สถานีใต้ดิน/ยังไม่มีราง = ข้าม
      var P = hit.R.pts[hit.i], dir = dirAt(hit.R.pts, hit.i), c = mateCenter(list, hit.R, hit.i, k);
      out.push({ st: st, line: line, lines: [rec.l], recs: [rec], mono: hit.R.mono, x: c[0], y: c[1], k: k, h: P.h, ux: dir[0], uy: dir[1] });
      // รางสายเดียวกันที่ข้ามตรงนี้คนละระดับ (ท่าพระ: สายสีน้ำเงินข้ามตัวเอง) → ชานชาลาอีกชุดบนรางนั้น
      list.forEach(function (R2) {
        if (R2 === hit.R) return;
        var bi = -1, bd = 45 * k;
        for (var i = 0; i < R2.pts.length; i++) { var d = Math.hypot(R2.pts[i].x - P.x, R2.pts[i].y - P.y); if (d < bd) { bd = d; bi = i; } }
        if (bi < 0) return;
        var d2 = dirAt(R2.pts, bi), Q = R2.pts[bi];
        if (Math.abs(d2[0] * dir[0] + d2[1] * dir[1]) > 0.5 || Math.abs(Q.h - P.h) < 4) return;
        var c2 = mateCenter(list, R2, bi, k);
        out.push({ st: st, line: line, lines: [rec.l], recs: [rec], mono: R2.mono, x: c2[0], y: c2[1], k: k, h: Q.h, ux: d2[0], uy: d2[1], twin: true });
      });
    });
    // สถานีร่วมของหลายสายที่ตัวอาคารเดียวกัน (สยาม) → ตัวเดียว หลายสาย (ชานชาลาซ้อนชั้นจัดการตอนคำนวณชั้น)
    var kept = [];
    out.forEach(function (s) {
      for (var i = 0; i < kept.length; i++) {
        var o = kept[i], dist = Math.hypot(o.x - s.x, o.y - s.y), par = Math.abs(o.ux * s.ux + o.uy * s.uy) > 0.92;
        // สายสีแดงเข้ม/อ่อนที่กรุงเทพอภิวัฒน์ = อาคารเดียวกันแต่รางห่างกันหลายสิบเมตร
        var sameHub = /^srt/.test(o.line.id) && /^srt/.test(s.line.id) && normName(o.st.name) === normName(s.st.name) && dist < 200 * s.k;
        if (par && ((dist < 25 * s.k && Math.abs(o.h - s.h) < 8) || sameHub)) {
          if (o.lines.indexOf(s.line.id) < 0) { o.also = o.also || []; o.also.push(s.line); o.lines.push(s.line.id); }
          s.recs.forEach(function (r) { if (o.recs.indexOf(r) < 0) o.recs.push(r); });
          return;
        }
      }
      kept.push(s);
    });
    kept.forEach(function (S) { resolveStation(S, byLine); });
    resolveInterchanges(kept);
    kept.forEach(function (S) { trackCuts(S, tracks); });
    kept.forEach(function (S) { finalizeStation(S); planAccess(S); });
    return kept;
  }

  // ชานชาลาของหนึ่งชั้น จากตำแหน่งราง (เรียงซ้าย→ขวา): ช่องห่าง ≥ 7 ม. = ชานชาลาเกาะกลาง ที่เหลือ = ชานชาลาข้างด้านนอก
  function arrange(offs, hint, sideW) {
    var n = offs.length, plats = [], served = [];
    if (n === 1) {
      return [{ o0: offs[0] - EDGE - sideW, o1: offs[0] - EDGE, e: [offs[0] - EDGE] },
              { o0: offs[0] + EDGE, o1: offs[0] + EDGE + sideW, e: [offs[0] + EDGE] }];
    }
    for (var i = 0; i < n - 1; i++) {
      if (offs[i + 1] - offs[i] >= 7 && hint !== "s") {
        plats.push({ o0: offs[i] + EDGE, o1: offs[i + 1] - EDGE, e: [offs[i] + EDGE, offs[i + 1] - EDGE], island: true });
        served[i] = served[i + 1] = true;
      }
    }
    if (!served[0]) plats.push({ o0: offs[0] - EDGE - sideW, o1: offs[0] - EDGE, e: [offs[0] - EDGE] });
    if (!served[n - 1]) plats.push({ o0: offs[n - 1] + EDGE, o1: offs[n - 1] + EDGE + sideW, e: [offs[n - 1] + EDGE] });
    return plats;
  }

  function resolveStation(S, byLine) {
    var k = S.k, found = [];
    S.style = STYLE[(/^bts-/.test(S.line.id) && STATION_STYLE[S.st.code]) || LINE_STYLE[S.line.id]] || STYLE.bts;
    S.hub = /^srt/.test(S.line.id) && /กรุงเทพอภิวัฒน์/.test(S.st.name || "");
    // รางของสายในสถานีที่ตัดแนวขวางตรงกลางสถานี (t = 0) — ตำแหน่งขวางและระดับ
    S.lines.forEach(function (lid) {
      (byLine[lid] || []).forEach(function (R) {
        var P = R.pts, best = null;
        for (var i = 0; i < P.length - 1; i++) {
          var a = P[i], b = P[i + 1];
          var ta = ((a.x - S.x) * S.ux + (a.y - S.y) * S.uy) / k, tb = ((b.x - S.x) * S.ux + (b.y - S.y) * S.uy) / k;
          if ((ta > 0 && tb > 0) || (ta < 0 && tb < 0) || ta === tb) continue;
          var f = ta / (ta - tb), x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f;
          var o = (-(x - S.x) * S.uy + (y - S.y) * S.ux) / k;
          if (Math.abs(o) > 32) continue;
          var L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          if (Math.abs(((b.x - a.x) * S.ux + (b.y - a.y) * S.uy) / L) < 0.8) continue;
          if (!best || Math.abs(o) < Math.abs(best.o)) best = { o: o, h: a.h + (b.h - a.h) * f };
        }
        if (best && best.h > 3) found.push(best);
      });
    });
    found.sort(function (a, b) { return a.o - b.o; });
    var tr = [];
    found.forEach(function (f) {
      if (!tr.some(function (g) { return Math.abs(g.o - f.o) < 0.8 && Math.abs(g.h - f.h) < 1.5; })) tr.push(f);
    });
    if (!tr.length) tr.push({ o: 0, h: S.h });
    // จัดชั้นตามระดับราง (สยาม = ชานชาลาสองชั้นซ้อนกัน)
    tr.sort(function (a, b) { return a.h - b.h; });
    var levels = [];
    tr.forEach(function (f) {
      var lv = levels[levels.length - 1];
      if (!lv || f.h - lv.hs[lv.hs.length - 1] > 4) levels.push(lv = { hs: [], offs: [] });
      lv.hs.push(f.h); lv.offs.push(f.o);
    });
    // ชานชาลาอีกชุดที่ข้ามคนละระดับ (ท่าพระ) ใช้ข้อมูลชานชาลาของตัวหลักไม่ได้ → จัดตามระยะรางอย่างเดียว
    var hint = S.twin ? "" : S.recs.map(function (r) { return r.pa; }).filter(Boolean)[0] || "";
    var e0 = Infinity, e1 = -Infinity;
    levels.forEach(function (lv) {
      lv.offs.sort(function (a, b) { return a - b; });
      lv.rz = lv.hs.reduce(function (s, v) { return s + v; }, 0) / lv.hs.length;
      lv.floor = lv.rz + 1.1;
      lv.plats = arrange(lv.offs, hint, S.style.side);
      lv.offs.forEach(function (o) { e0 = Math.min(e0, o - 2.4); e1 = Math.max(e1, o + 2.4); });
      lv.plats.forEach(function (p) { e0 = Math.min(e0, p.o0); e1 = Math.max(e1, p.o1); });
    });
    S.levels = levels;
    // กว้าง/ยาว: OSM ก่อน (รูปอาคาร/ชานชาลาจริง) ไม่มีก็ใช้ค่ามาตรฐานของสาย
    var f = S.recs.map(function (r) { return r.f; }).filter(Boolean)[0];
    var pn = S.recs.map(function (r) { return r.pn; }).filter(Boolean)[0];
    var cw = e1 - e0, W;
    if (f && f[1] >= cw - 1 && f[1] <= 60) W = f[1];
    else W = Math.max(S.style.W, cw + 2);
    if (S.hub) W = Math.max(W, 110);
    W = Math.max(W, cw + 1.2);
    var mid = (e0 + e1) / 2;
    S.e0 = e0; S.e1 = e1;
    S.o0 = mid - W / 2; S.o1 = mid + W / 2;
    S.L = S.hub ? 540 : pn && pn >= 40 && pn <= 300 ? pn + 4 : f && f[0] >= 40 && f[0] <= 620 ? f[0] : S.style.L;
    S.src = { f: !!f, pn: !!pn, pa: hint };
    S.cuts = [];
    S.skip = [];
  }

  /* รางสายอื่นที่พาดข้ามสถานีในระดับระหว่างชานชาลากับหลังคา (บางหว้า: MRT ข้ามเหนือชานชาลา BTS)
     → ตัดหลังคา/ผนังช่วงนั้นออก (cuts เดียวกับสถานีร่วม) ไม่งั้นทางวิ่งทะลุหลังคา
     ข้ามสูงพ้นหลังคา / ต่ำกว่าชานชาลา / ขนานกัน = ไม่ตัด */
  function trackCuts(S, tracks) {
    var st = S.style, top = S.levels[S.levels.length - 1];
    var roofTop = top.floor + st.eave + st.rise + (st.roof === "clere" || st.roof === "mrtx" ? 2.1 : 0.5);
    var tL = -S.L / 2 - 3, tR = S.L / 2 + 3, oL = S.o0 - 1.5, oR = S.o1 + 1.5;
    tracks.forEach(function (R) {
      if (!R || R.yard || S.lines.indexOf(R.line) >= 0) return;
      for (var i = 0; i < R.pts.length - 1; i++) {
        var a = R.pts[i], b = R.pts[i + 1];
        if (Math.hypot(a.x - S.x, a.y - S.y) > 600 * S.k && Math.hypot(b.x - S.x, b.y - S.y) > 600 * S.k) continue;
        var A = toFrame(S, a.x, a.y), B = toFrame(S, b.x, b.y), dT = B[0] - A[0], dO = B[1] - A[1];
        // ตัดส่วนของเส้นกับกรอบสถานี (Liang–Barsky)
        var u0 = 0, u1 = 1, ok = true;
        [[-dT, A[0] - tL], [dT, tR - A[0]], [-dO, A[1] - oL], [dO, oR - A[1]]].forEach(function (c) {
          if (!ok) return;
          if (Math.abs(c[0]) < 1e-9) { if (c[1] < 0) ok = false; return; }
          var r = c[1] / c[0];
          if (c[0] < 0) { if (r > u1) ok = false; else if (r > u0) u0 = r; }
          else { if (r < u0) ok = false; else if (r < u1) u1 = r; }
        });
        if (!ok || u1 - u0 < 1e-6) continue;
        var len = Math.hypot(dT, dO) || 1, sin = Math.abs(dO) / len;
        if (sin < 0.5) continue;                                    // วิ่งขนาน/เฉียงมาก = ไม่ใช่การข้าม
        var h = a.h + (b.h - a.h) * (u0 + u1) / 2;
        if (h - 2.3 > roofTop + 0.3 || h < top.floor + 2.5) continue;
        var ta = A[0] + dT * u0, tb = A[0] + dT * u1, pad = 3 / sin;
        S.cuts.push([Math.min(ta, tb) - pad, Math.max(ta, tb) + pad]);
      }
    });
  }

  /* มุมรอยสถานีบนพื้น (พิกัดโลก) และการทับกันของสี่เหลี่ยมนูนสองรูป (separating axis) */
  function planRect(S, pad) {
    var F = frameOf(S), L2 = S.L / 2 + 3;
    return [F(-L2, S.o0 - pad, 0), F(L2, S.o0 - pad, 0), F(L2, S.o1 + pad, 0), F(-L2, S.o1 + pad, 0)];
  }
  function quadsOverlap(A, B) {
    var polys = [A, B];
    for (var p = 0; p < 2; p++) {
      for (var i = 0; i < 4; i++) {
        var a = polys[p][i], b = polys[p][(i + 1) % 4], nx = -(b[1] - a[1]), ny = b[0] - a[0];
        var mn = [Infinity, Infinity], mx = [-Infinity, -Infinity];
        for (var q = 0; q < 2; q++) for (var j = 0; j < 4; j++) {
          var d = polys[q][j][0] * nx + polys[q][j][1] * ny;
          if (d < mn[q]) mn[q] = d;
          if (d > mx[q]) mx[q] = d;
        }
        if (mx[0] < mn[1] || mx[1] < mn[0]) return false;
      }
    }
    return true;
  }
  function pointInQuad(p, q) {
    var sgn = 0;
    for (var i = 0; i < 4; i++) {
      var a = q[i], b = q[(i + 1) % 4], c = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
      if (c !== 0) { var s = c > 0 ? 1 : -1; if (!sgn) sgn = s; else if (s !== sgn) return false; }
    }
    return true;
  }

  /* สถานีร่วม
     - ข้ามกันคนละระดับ (ท่าพระ เตาปูน บางหว้า วัดพระศรีฯ …): ตัวล่างไม่มีหลังคา/ผนังช่วงที่ตัวบนพาดผ่าน
       ตัวบนไม่มีชั้นขายตั๋วของตัวเอง (ใช้ของตัวล่าง) และไม่ปักเสาลงในตัวล่าง
     - ขนานติดกัน (กรุงธนบุรี: สีลม–สีทอง): แบ่งพื้นที่ที่ทับกันคนละครึ่ง */
  function resolveInterchanges(list) {
    for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) {
      var A = list[i], B = list[j];
      if (Math.hypot(A.x - B.x, A.y - B.y) > 450 * A.k) continue;
      var dot = A.ux * B.ux + A.uy * B.uy;
      if (Math.abs(dot) < 0.85) {
        if (!quadsOverlap(planRect(A, 1.2), planRect(B, 1.2))) continue;
        var lo = A.levels[A.levels.length - 1].rz <= B.levels[0].rz ? A : B, hi = lo === A ? B : A;
        if (hi.levels[0].rz - lo.levels[lo.levels.length - 1].rz < 3.5) continue;
        var loTop = lo.levels[lo.levels.length - 1].floor + lo.style.eave + lo.style.rise + 2;
        if (hi.levels[0].rz - 1.5 < loTop + 1) {
          var t0 = Infinity, t1 = -Infinity;
          planRect(hi, 1.2).forEach(function (p) { var f = toFrame(lo, p[0], p[1]); t0 = Math.min(t0, f[0]); t1 = Math.max(t1, f[0]); });
          lo.cuts.push([t0 - 1, t1 + 1]);
        }
        hi.noConc = true; hi.shareWith = lo; lo.crossWith = hi;
        hi.skip.push(planRect(lo, VERANDA + 0.8));
      } else {
        var d = (-(B.x - A.x) * A.uy + (B.y - A.y) * A.ux) / A.k;
        var along = ((B.x - A.x) * A.ux + (B.y - A.y) * A.uy) / A.k;
        if (Math.abs(d) < 4 || Math.abs(along) > (A.L + B.L) / 2) continue;
        var same = dot > 0, b0 = d + (same ? B.o0 : -B.o1), b1 = d + (same ? B.o1 : -B.o0);
        // ด้านที่ติดกันไม่มีพื้นชั้นขายตั๋วยื่นออกไป (ไม่งั้นพื้นสองสถานีซ้อนกัน)
        if (d > 0 && A.o1 > b0) {
          var m = (A.o1 + b0) / 2;
          A.o1 = Math.max(m - 0.4, A.e1 + 0.3); A.flushR = true;
          var nb0 = Math.min(m + 0.4, d + (same ? B.e0 : -B.e1) - 0.3);
          if (same) { B.o0 = nb0 - d; B.flushL = true; } else { B.o1 = d - nb0; B.flushR = true; }
        } else if (d < 0 && b1 > A.o0) {
          var m2 = (A.o0 + b1) / 2;
          A.o0 = Math.min(m2 + 0.4, A.e0 - 0.3); A.flushL = true;
          var nb1 = Math.max(m2 - 0.4, d + (same ? B.e1 : -B.e0) + 0.3);
          if (same) { B.o1 = nb1 - d; B.flushR = true; } else { B.o0 = d - nb1; B.flushL = true; }
        }
      }
    }
  }

  function finalizeStation(S) {
    var lv0 = S.levels[0], top = S.levels[S.levels.length - 1], st = S.style;
    S.eave = top.floor + st.eave;
    S.roofTop = S.eave + st.rise + (st.roof === "clere" || st.roof === "mrtx" ? 2.1 : st.roof === "skybarrel" ? 0.8 : 0.3);
    S.tEnd = S.L / 2 + (st.roof === "mrtx" ? MRT_HOOD : 3);          // ปลายหลังคาตามแนวราง
    S.midT = 0.14 * (S.L + 2 * MRT_HOOD);                             // ครึ่งความยาวหลังคาช่วงกลางของ MRT
    S.conc = S.hub ? 0.6 : Math.max(5.2, Math.min(11, lv0.rz - 7.4));
    S.concTop = lv0.rz - 1.5;
    if (S.concTop - S.conc < 3) S.noConc = true;
    S.Lc = S.hub ? S.L : Math.min(S.L, Math.max(36, st.conc * S.L));
    S.co0 = S.o0 - 0.6; S.co1 = S.o1 + 0.6;
    // พื้นชั้นขายตั๋ว: ยาวเกือบเต็มสถานี กว้างเลยตัวสถานีออกไปเป็นทางเดินมีราวกันตก (ห้องขายตั๋วกระจกอยู่ตรงกลาง)
    S.Ld = S.hub || S.noConc ? S.Lc : Math.max(S.Lc, S.L - 8);
    S.do0 = S.noConc || S.hub ? S.co0 : S.o0 - (S.flushL ? 0.6 : VERANDA);
    S.do1 = S.noConc || S.hub ? S.co1 : S.o1 + (S.flushR ? 0.6 : VERANDA);
    S.vaultT0 = -S.L / 2 - 3;
    S.vaultM = (S.L + 6) / Math.max(3, Math.round((S.L + 6) / 14));
    var lc = new T.Color(S.line.color || "#888888");
    S.lineCol = lc;
    S.roofCol = (st.base ? new T.Color(st.base) : COL.white.clone()).lerp(lc, st.tint);
    S.midCol = st.roof === "mrtx" && BLUE_CENTER[S.st.code] ? COL.mrtBlue : S.roofCol;
    S.canopyCol = COL.under.clone().lerp(lc, 0.18);
    // ช่วงหลังคา/ผนัง (ตัดช่วงที่สถานีสายอื่นพาดผ่านด้านบน)
    var segs = [[-S.L / 2 - 3, S.L / 2 + 3]];
    S.cuts.forEach(function (c) {
      var nx = [];
      segs.forEach(function (sg) {
        if (c[1] <= sg[0] || c[0] >= sg[1]) { nx.push(sg); return; }
        if (c[0] > sg[0] + 2) nx.push([sg[0], c[0]]);
        if (c[1] < sg[1] - 2) nx.push([c[1], sg[1]]);
      });
      segs = nx;
    });
    S.segs = segs;
    S.frame = frameOf(S);
    var box = new T.Box3(), v = new T.Vector3();
    var bo0 = Math.min(S.o0, S.do0) - 1.5, bo1 = Math.max(S.o1, S.do1) + 1.5;
    [[-S.tEnd, bo0], [S.tEnd, bo0], [S.tEnd, bo1], [-S.tEnd, bo1]].forEach(function (c) {
      [0, S.roofTop].forEach(function (z) { var p = S.frame(c[0], c[1], z); box.expandByPoint(v.set(p[0], p[1], p[2])); });
    });
    S.box = box;
  }

  // ระยะจากจุด (กรอบสถานี) ถึงขอบพื้นชั้นขายตั๋ว
  function deckDist(S, p) {
    var h = S.Ld / 2;
    return Math.hypot(Math.max(-h - p[0], 0, p[0] - h), Math.max(S.do0 - p[1], 0, p[1] - S.do1));
  }

  /* ทางขึ้น-ลง: บันไดจาก OSM ก่อน → ทางออกที่ยังไม่มีบันไดรองรับ สร้างบันไดให้ → ไม่มีข้อมูลเลยใช้ 4 มุมแบบ BTS
     หัวบันไดที่แตะทางเดินลอยฟ้าใช้ระดับทางเดินนั้น ที่เหลือขึ้นถึงชั้นขายตั๋ว (มีสะพานเชื่อมถ้าหัวบันไดอยู่นอกพื้นชั้นขายตั๋ว)
     รูปแบบ (kind): "switch" = พับครึ่งมีชานพัก (ตั้งจากหัวบันได anchor "top" หรือจากตีนบันได "foot")
                    "straight" = ตรงมีชานพักกลาง (OSM วาดยาวพอ) · "flight" = ช่วงเดียว (บันไดเลื่อน) */
  function planAccess(S) {
    S.stairs = []; S.lifts = [];
    if (S.noConc || S.hub) return;
    var cz = S.conc, t0 = -S.Ld / 2, t1 = S.Ld / 2, o0 = S.do0, o1 = S.do1, st = S.style;
    function dRect(p) { return deckDist(S, p); }
    function inside(p, m) { return p[0] > t0 - m && p[0] < t1 + m && p[1] > o0 - m && p[1] < o1 + m; }
    // บันไดภายใน (ชั้นขายตั๋ว↔ชานชาลา) อยู่ในห้องขายตั๋ว
    function inHall(p, m) { return p[0] > -S.Lc / 2 - m && p[0] < S.Lc / 2 + m && p[1] > S.co0 - m && p[1] < S.co1 + m; }
    // สถานีร่วมที่มีอีกสายข้าม: ทางออกเรียงไปตามถนนอีกเส้นด้วย → รับไกลขึ้นทางขวาง
    var side = S.crossWith ? 95 : 45;
    function nearStation(p) { return Math.abs(p[0]) < S.L / 2 + 70 && p[1] > S.o0 - side && p[1] < S.o1 + side; }
    var steps = [], exits = [];
    S.recs.forEach(function (rec) {
      var q = H.toLocal(rec.o[0] / 1e6, rec.o[1] / 1e6), k = H.kAt(rec.o[1] / 1e6);
      function fr(e, n) { return toFrame(S, q.x + e / 10 * k, q.y + n / 10 * k); }
      (rec.sw || []).forEach(function (w) { steps.push({ a: fr(w[0], w[1]), b: fr(w[2], w[3]), fl: w[4] }); });
      (rec.x || []).forEach(function (e) { exits.push({ p: fr(e[0], e[1]), lift: e[2] === 1 }); });
    });
    steps.forEach(function (w) {
      if (!nearStation(w.a) && !nearStation(w.b)) return;
      if (inHall(w.a, -0.5) && inHall(w.b, -0.5)) return;             // บันไดภายในสถานี (ชั้นขายตั๋ว↔ชานชาลา)
      var up = w.fl & 4 ? w.b : w.fl & 8 ? w.a : (dRect(w.a) <= dRect(w.b) ? w.a : w.b);
      var lo = up === w.a ? w.b : w.a;
      var dUp = dRect(up), wp = S.frame(up[0], up[1], 0), wh = walkHeightAt(wp[0], wp[1], 8 * S.k), zt;
      if (dUp < 6) zt = cz;
      else if (wh) zt = wh;
      else if (dUp < 20) zt = cz;
      else return;
      var len = Math.hypot(up[0] - lo[0], up[1] - lo[1]);
      if (len < 1) return;
      var esc = !!(w.fl & 1);
      // OSM มักวาดบันไดแค่ช่วงเดียวสั้น ๆ → พับครึ่ง (ตั้งจากหัวบันได) · วาดยาวพอ = บันไดตรงมีชานพักกลาง
      var kind = esc ? "flight" : len >= zt * 1.2 ? "straight" : "switch";
      var need = kind === "flight" ? zt * 1.5 : kind === "straight" ? zt * RISE_RUN + LANDING : 0;
      if (len < need) { var ex = need / len; lo = [up[0] + (lo[0] - up[0]) * ex, up[1] + (lo[1] - up[1]) * ex]; }
      S.stairs.push({ b: lo, a: up, zt: zt, w: esc ? 1.5 : 2.4, esc: esc, cov: !!(w.fl & 2) || st.cov, link: zt === cz && dUp > 0.8, osm: true,
        kind: kind, anchor: "top" });
    });
    exits.forEach(function (e) {
      if (!nearStation(e.p)) return;
      if (e.lift) {
        if (!inside(e.p, 0.5) && !S.lifts.some(function (p) { return Math.hypot(p[0] - e.p[0], p[1] - e.p[1]) < 4; })) S.lifts.push(e.p);
        return;
      }
      if (inside(e.p, 0)) return;
      // ทางออกที่อยู่บนแนวบันไดที่มีแล้ว (OSM มักปักหมุดทางออกกลางบันได) = บันไดเดียวกัน
      var near = S.stairs.some(function (s) {
        var vx = s.a[0] - s.b[0], vy = s.a[1] - s.b[1], L2 = vx * vx + vy * vy || 1;
        var f = Math.max(0, Math.min(1, ((e.p[0] - s.b[0]) * vx + (e.p[1] - s.b[1]) * vy) / L2));
        return Math.hypot(s.b[0] + vx * f - e.p[0], s.b[1] + vy * f - e.p[1]) < 6;
      });
      if (near) return;
      // บันไดวิ่งตามถนนที่ทางออกนั้นอยู่: ห่างออกไปทางขวางมาก (ถนนอีกเส้นของสถานีร่วม) → วิ่งตามแนวขวาง
      var run = cz * 1.6, farO = Math.max(o0 - e.p[1], e.p[1] - o1, 0), farT = Math.max(t0 - e.p[0], e.p[0] - t1, 0);
      var c1, c2;
      if (farO > 12 && farO > farT) { c1 = [e.p[0], e.p[1] - run]; c2 = [e.p[0], e.p[1] + run]; }
      else { c1 = [e.p[0] - run, e.p[1]]; c2 = [e.p[0] + run, e.p[1]]; }
      // ตีนบันไดอยู่ที่ทางออก · ช่วงแรกวิ่งออกห่างพื้นชั้นขายตั๋ว แล้วพับกลับ หัวบันไดจึงหันเข้าหาสถานี
      var far = dRect(c1) <= dRect(c2) ? c2 : c1;
      S.stairs.push({ b: e.p, a: far, zt: cz, w: 2.4, esc: false, cov: st.cov, link: true, osm: true, kind: "switch", anchor: "foot" });
    });
    // OSM มีบันไดไม่ถึง 2 จุด → เติมบันไดพับที่มุมพื้นชั้นขายตั๋วแบบ BTS (ข้ามมุมที่มีบันไดจริงอยู่ใกล้แล้ว)
    if (S.stairs.length < 2) {
      var hl = S.Ld / 2, had = S.stairs.slice();
      [-1, 1].forEach(function (sx) {
        [-1, 1].forEach(function (so) {
          var o = so > 0 ? o1 + 1.6 : o0 - 1.6, b = [sx * (hl + 6), o], a = [sx * (hl - 6), o];
          if (had.some(function (s) { return Math.hypot(s.b[0] - b[0], s.b[1] - b[1]) < 25 || Math.hypot(s.a[0] - a[0], s.a[1] - a[1]) < 25; })) return;
          S.stairs.push({ b: b, a: a, zt: cz, w: 2.4, esc: false, cov: st.cov, link: true, kind: "switch", anchor: "top" });
        });
        if (S.lifts.length < 2) S.lifts.push([sx * hl * 0.35, sx > 0 ? o1 + 2.2 : o0 - 2.2]);
      });
    }
  }

  /* ------------------------------------------------------ วาดสถานี */
  function roofGeom(S) { var oL = S.o0 - 1.2, oR = S.o1 + 1.2; return { oL: oL, oR: oR, om: (oL + oR) / 2, hw: (oR - oL) / 2 }; }
  // หลังคา MRT: ครึ่งความกว้างที่ระยะ at จากกลางสถานี — สอบเข้าเหลือครึ่งหนึ่งช่วงหัวหลังคา (1 ม. ก่อนปลายชานชาลา → ปลายหลังคา)
  function mrtHW(S, g, at) {
    var ta = S.L / 2 - 1;
    return at <= ta ? g.hw : g.hw * (1 - 0.5 * Math.min(1, (at - ta) / (S.tEnd - ta)));
  }
  // หน้าตัดขวางของหลังคาที่ตำแหน่ง t (n ช่วง) — ใช้ทำซี่โครงใต้หลังคาที่รูปทรงเปลี่ยนตามแนวยาว
  function profAt(S, g, t, n) {
    var hw = S.style.roof === "mrtx" ? mrtHW(S, g, Math.abs(t)) : g.hw, out = [];
    for (var i = 0; i <= n; i++) { var o = g.om - hw + 2 * hw * i / n; out.push([o, roofZ(S, o, t)]); }
    return out;
  }
  // แผ่นระนาบ 3–4 จุด (กรอบสถานี [t, o, z]) · normal เดียวทั้งแผ่นชี้ขึ้น → สันหลังคาคม · ลายตะเข็บตามแนว t
  function face(B, F, P, col) {
    var ax = P[1][0] - P[0][0], ay = P[1][1] - P[0][1], az = P[1][2] - P[0][2];
    var bx = P[2][0] - P[0][0], by = P[2][1] - P[0][1], bz = P[2][2] - P[0][2];
    var nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx, l = Math.hypot(nx, ny, nz) || 1;
    if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
    var N = B.n ? F.n(nx / l, ny / l, nz / l) : null, s = B.p.length / 3;
    P.forEach(function (q) { B.v(F(q[0], q[1], q[2]), q[0] / 0.8, q[1] / 6, col, N); });
    B.i.push(s, s + 1, s + 2);
    if (P.length === 4) B.i.push(s, s + 2, s + 3);
  }
  // ระดับผิวหลังคาที่ตำแหน่งขวาง o (และตามแนว t สำหรับหลังคาลอนสายสีแดง)
  function roofZ(S, o, t) {
    var g = roofGeom(S), s = Math.max(-1, Math.min(1, (o - g.om) / g.hw)), a = Math.abs(s), e = S.eave, r = S.style.rise;
    switch (S.style.roof) {
      case "clere": return a >= 0.22 ? e + 0.75 * r * (1 - (a - 0.22) / 0.78) : e + 0.75 * r + 1.7;
      case "gable": return e + r * (1 - a);
      case "mrtx":
        var at = Math.abs(t || 0);
        if (at <= S.midT) return a >= 0.22 ? e + 0.75 * r * (1 - (a - 0.22) / 0.78) : e + 0.75 * r + 1.7;
        var u = Math.min(1, Math.abs(o - g.om) / mrtHW(S, g, at)), v = Math.max(0, Math.min(1, (S.tEnd - at) / (MRT_HOOD + 1)));
        return e + 0.75 * r * Math.min(1 - u, v);
      case "wing": return e + r * Math.pow(a, 1.4);
      case "shell": return e + r * Math.sqrt(Math.max(0, 1 - s * s));
      case "canopy": return e + r * (0.5 + 0.5 * s);
      case "vaults":
        var u = (((t - S.vaultT0) / S.vaultM) % 1 + 1) % 1;
        return e + r * (1 - Math.pow(2 * u - 1, 2)) * (0.85 + 0.15 * (1 - s * s));
      default: return e + r * (1 - s * s);
    }
  }

  // พื้นโครงสร้าง ชานชาลา ขอบชานชาลา/ประตูกั้น ผนัง และเสารับหลังคา
  function emitDecks(C, F, S) {
    var L2 = S.L / 2;
    S.levels.forEach(function (lv) {
      fbox(C.conc, F, -L2, L2, S.o0, S.o1, lv.rz - 1.5, lv.rz - 0.6);
      lv.plats.forEach(function (p) {
        fbox(C.conc, F, -L2 + 1, L2 - 1, p.o0, p.o1, lv.rz - 0.6, lv.floor);
        if (!C.psd) return;
        p.e.forEach(function (eo) {
          var s = eo > (p.o0 + p.o1) / 2 ? -1 : 1;           // ทิศเข้าหาด้านในชานชาลา
          fbox(C.dPaint, F, -L2 + 3, L2 - 3, Math.min(eo, eo + s * 0.45), Math.max(eo, eo + s * 0.45), lv.floor, lv.floor + 0.04, COL.edge);
          tquad(C.psd, F, [-L2 + 5, eo + s * 0.1], [L2 - 5, eo + s * 0.1], lv.floor, lv.floor + 1.4, 2.2, 1);
        });
      });
    });
    var zb = S.levels[0].rz - 0.6, zt = S.eave, nl = S.levels.length, top = S.levels[nl - 1];
    var WB = S.style.wall === "louvre" ? C.louvre : C.glass;
    S.segs.forEach(function (sg) {
      var t0 = Math.max(sg[0], -L2), t1 = Math.min(sg[1], L2);
      if (t1 - t0 < 2) return;
      tquad(WB, F, [t0, S.o0], [t1, S.o0], zb, zt, 3, nl);
      tquad(WB, F, [t0, S.o1], [t1, S.o1], zb, zt, 3, nl);
      var n = Math.max(1, Math.round((t1 - t0) / COL_STEP));
      for (var i = 0; i <= n; i++) {
        var t = t0 + (t1 - t0) * i / n;
        fbox(C.paint, F, t - 0.25, t + 0.25, S.o0 + 0.35, S.o0 + 0.85, top.floor, roofZ(S, S.o0 + 0.6, t) - 0.3, COL.steel);
        fbox(C.paint, F, t - 0.25, t + 0.25, S.o1 - 0.85, S.o1 - 0.35, top.floor, roofZ(S, S.o1 - 0.6, t) - 0.3, COL.steel);
        top.plats.forEach(function (p) {
          if (!p.island || p.o1 - p.o0 < 5) return;
          var oc = (p.o0 + p.o1) / 2;
          fbox(C.paint, F, t - 0.3, t + 0.3, oc - 0.3, oc + 0.3, top.floor, roofZ(S, oc, t) - 0.4, COL.steel);
        });
      }
    });
  }

  // หลังคาทรงประจำสาย: ผิวบน (สีหลังคาอมสีสาย + ตะเข็บ) · ท้องหลังคา · ขอบสีประจำสาย · ปิดหัวท้าย · กระจกช่องแสง
  function emitRoof(C, F, S) {
    var g = roofGeom(S), st = S.style, TH = 0.35;
    function prof(s0, s1, n, fn) { var out = []; for (var i = 0; i <= n; i++) { var s = s0 + (s1 - s0) * i / n; out.push([g.om + s * g.hw, fn(s)]); } return out; }
    function sz(s) { return roofZ(S, g.om + s * g.hw, 0); }
    function up(d) { return function (s) { return sz(s) + d; }; }
    // ผิวบน (สีหลังคา + ตะเข็บ) · ท้องหลังคา · ปิดความหนาหัว-ท้าย · ขอบสีประจำสาย
    function emitPieces(pieces, t0, t1, col) {
      pieces.forEach(function (pc) {
        sweep(C.roof, F, pc.p, t0, t1, col);
        var under = pc.p.map(function (q) { return [q[0], q[1] - TH]; });
        sweep(C.paint, F, under, t0, t1, COL.under);
        caps(C.paint, F, pc.p, under, t0, COL.under);
        caps(C.paint, F, pc.p, under, t1, COL.under);
        var a = pc.p[0], b = pc.p[pc.p.length - 1];
        if (pc.fl) fbox(C.paint, F, t0, t1, a[0] - 0.12, a[0] + 0.02, a[1] - TH - 0.75, a[1] + 0.04, S.lineCol);
        if (pc.fr) fbox(C.paint, F, t0, t1, b[0] - 0.02, b[0] + 0.12, b[1] - TH - 0.75, b[1] + 0.04, S.lineCol);
      });
    }
    // หลังคาผนังกระจกยกกลาง (แบบสถานีท่าพระ) — ใช้ทั้งทรง clere และช่วงกลางของหลังคา MRT
    function clerePieces() {
      var zc = S.eave + 0.75 * st.rise;
      return [{ p: prof(-1, -0.22, 6, sz), fl: 1 }, { p: prof(0.22, 1, 6, sz), fr: 1 },
        { p: prof(-0.3, 0.3, 8, function (s) { return zc + 1.7 + 0.3 * (1 - Math.pow(s / 0.3, 2)); }), fl: 1, fr: 1 }];
    }
    function clereGlass(t0, t1) {
      var zc2 = S.eave + 0.75 * st.rise, oa2 = g.om - 0.22 * g.hw, ob2 = g.om + 0.22 * g.hw;
      tquad(C.glass, F, [t0, oa2], [t1, oa2], zc2 - 0.2, zc2 + 1.75, 3, 0.55);
      tquad(C.glass, F, [t0, ob2], [t1, ob2], zc2 - 0.2, zc2 + 1.75, 3, 0.55);
    }
    S.segs.forEach(function (sg) {
      var t0 = sg[0], t1 = sg[1];
      if (st.roof === "vaults") { emitVaults(C, F, S, g, t0, t1, TH); return; }
      var pieces = [];
      if (st.roof === "mrtx") {
        // MRT สายสีน้ำเงิน: ช่วงกลางผนังกระจกยก (บางขุนนนท์/บางหว้าสีน้ำเงิน) + หัว-ท้ายจั่วเทาลาดเอียงสอบ
        var m0 = Math.max(t0, -S.midT), m1 = Math.min(t1, S.midT);
        if (m1 - m0 > 0.5) {
          pieces = clerePieces();
          emitPieces(pieces, m0, m1, S.midCol);
          clereGlass(m0, m1);
          if (m0 === -S.midT) mrtJunction(C, F, S, g, m0);
          if (m1 === S.midT) mrtJunction(C, F, S, g, m1);
        }
        emitMrtEnds(C, F, S, g, t0, t1, TH);
      } else {
        if (st.roof === "skybarrel") pieces.push({ p: prof(-1, -0.16, 12, sz), fl: 1 }, { p: prof(0.16, 1, 12, sz), fr: 1 });
        else if (st.roof === "clere") pieces = clerePieces();
        else if (st.roof === "canopy") pieces.push({ p: prof(-1, 1, 2, sz), fl: 1, fr: 1 });
        else if (st.roof === "gable") pieces.push({ p: prof(-1, 0, 1, sz), fl: 1 }, { p: prof(0, 1, 1, sz), fr: 1 });
        else pieces.push({ p: prof(-1, 1, st.roof === "shell" ? 20 : 16, sz), fl: 1, fr: 1 });
        emitPieces(pieces, t0, t1, S.roofCol);
      }
      if (st.roof === "skybarrel") {                               // ช่องแสงกลางหลังคา (สายสีม่วง)
        var zs = sz(0.16), oa = g.om - 0.16 * g.hw, ob = g.om + 0.16 * g.hw;
        tquad(C.glass, F, [t0, oa], [t1, oa], zs - 0.2, zs + 0.5, 3, 0.25);
        tquad(C.glass, F, [t0, ob], [t1, ob], zs - 0.2, zs + 0.5, 3, 0.25);
        sweep(C.glass, F, [[oa - 0.3, zs + 0.45], [g.om, zs + 0.8], [ob + 0.3, zs + 0.45]], t0, t1, null, 3, 3);
      } else if (st.roof === "clere") {                            // ผนังกระจกยกสูงกลางหลังคา (แบบสถานีท่าพระ)
        clereGlass(t0, t1);
      } else if (st.roof === "gable" && st.sky) {                  // แถบช่องแสงของหลังคาจั่ว BTS ส่วนต่อขยาย
        if (st.sky === "ridge") [[-0.2, -0.05], [0.05, 0.2]].forEach(function (r) { sweep(C.paint, F, prof(r[0], r[1], 1, up(0.04)), t0 + 3, t1 - 3, COL.skyTeal); });
        else if (st.sky === "mid") {
          var ma = Math.max(t0 + 2, -0.3 * S.L), mb = Math.min(t1 - 2, 0.3 * S.L);
          if (mb - ma > 2) sweep(C.paint, F, prof(-0.14, 0.14, 2, up(0.05)), ma, mb, COL.skyPale);
        } else sweep(C.paint, F, prof(-0.05, 0.05, 2, up(0.03)), t0 + 1, t1 - 1, COL.dark);
      } else if (st.roof === "shell") {                            // ซี่โครงหลังคาทุก 9 ม. (แอร์พอร์ต เรล ลิงก์)
        for (var t = t0 + 4.5; t < t1 - 2; t += 9) sweep(C.paint, F, prof(-1, 1, 20, function (s) { return sz(s) + 0.14; }), t - 0.22, t + 0.22, COL.frame);
      } else if (st.roof === "wing") {                             // รางน้ำกลางหลังคาปีกผีเสื้อ (โมโนเรล)
        fbox(C.paint, F, t0, t1, g.om - 0.35, g.om + 0.35, S.eave - 0.45, S.eave + 0.08, COL.frame);
      }
      // โครงหลังคา: ซี่โครงโค้งใต้หลังคาตรงแนวเสาทุกต้น (ชุดรายละเอียด — เห็นตอนซูมใกล้/มองเฉียง)
      var tp0 = Math.max(t0, -S.L / 2), tp1 = Math.min(t1, S.L / 2), nr = Math.max(1, Math.round((tp1 - tp0) / COL_STEP)), ri;
      if (tp1 - tp0 < 2) return;
      if (C.dPaint) for (ri = 0; ri <= nr; ri++) {
        var tr = tp0 + (tp1 - tp0) * ri / nr;
        if (st.roof !== "mrtx") pieces.forEach(function (pc) { rib(C.dPaint, F, pc.p, tr, TH); });
        else if (Math.abs(tr) < S.midT) clerePieces().slice(0, 2).forEach(function (pc) { rib(C.dPaint, F, pc.p, tr, TH); });
        else rib(C.dPaint, F, profAt(S, g, tr, 8), tr, TH);
      }
      if (st.roof === "barrel") {                                  // BTS: ซี่โครงนูนบนหลังคา + แถบช่องแสงตามสันหลังคา
        for (ri = 0; ri <= nr; ri++) {
          var tq = tp0 + (tp1 - tp0) * ri / nr;
          sweep(C.paint, F, prof(-1, 1, 12, function (s) { return sz(s) + 0.1; }), tq - 0.16, tq + 0.16, COL.steel);
        }
        sweep(C.glass, F, prof(-0.15, 0.15, 4, function (s) { return sz(s) + 0.05; }), t0 + 2.5, t1 - 2.5, null, 3, 3);
      }
    });
  }
  /* หลังคา MRT ช่วงหัว-ท้าย (จากขอบหลังคาช่วงกลาง ±midT ไปถึงปลาย ±tEnd):
       จั่วสองผืนสันกลาง → ช่วงหัว (1 ม. ก่อนปลายชานชาลาไปถึงปลายหลังคา) ผังสอบเหลือครึ่งกว้าง
       ผืนหน้าลาดจากปลายสันลงถึงขอบปลาย + ผืนข้างสามเหลี่ยมสองผืน · ขอบชายคามีแถบสีประจำสายรอบ
     ช่วงที่ถูกตัด (สถานีสายอื่นพาดผ่าน) วาดเฉพาะส่วนในช่วง [t0, t1] · หัวหลังคาวาดเมื่อช่วงนั้นถึงปลายเท่านั้น */
  function emitMrtEnds(C, F, S, g, t0, t1, TH) {
    var e = S.eave, R = 0.75 * S.style.rise, HW = g.hw, om = g.om, tj = S.midT, ta = S.L / 2 - 1, T = S.tEnd, hw1 = 0.5 * HW;
    var lo = t0 <= -S.L / 2 - 2.9 ? -T : t0, hi = t1 >= S.L / 2 + 2.9 ? T : t1;
    function sheet(P) {                                  // ผิวบน + ท้องหลังคา
      face(C.roof, F, P, S.roofCol);
      face(C.paint, F, P.map(function (q) { return [q[0], q[1], q[2] - TH]; }), COL.under);
    }
    function fascia(a, b) { panel(C.paint, F, [a[0], a[1]], e - TH - 0.7, [b[0], b[1]], e - TH - 0.7, TH + 0.74, S.lineCol); }
    [[-ta, -tj], [tj, ta]].forEach(function (r) {
      var p = Math.max(r[0], lo), q = Math.min(r[1], hi);
      if (q - p < 0.3) return;
      sheet([[p, om - HW, e], [q, om - HW, e], [q, om, e + R], [p, om, e + R]]);
      sheet([[p, om, e + R], [q, om, e + R], [q, om + HW, e], [p, om + HW, e]]);
      fascia([p, om - HW - 0.02], [q, om - HW - 0.02]);
      fascia([p, om + HW + 0.02], [q, om + HW + 0.02]);
    });
    [-1, 1].forEach(function (sg) {
      if (sg < 0 ? lo > -T + 0.01 : hi < T - 0.01) return;
      var A = [sg * ta, om - HW, e], B = [sg * T, om - hw1, e], Cc = [sg * T, om + hw1, e], D = [sg * ta, om + HW, e], P = [sg * ta, om, e + R];
      sheet([A, B, P]); sheet([B, Cc, P]); sheet([Cc, D, P]);
      fascia(A, B); fascia(B, Cc); fascia(Cc, D);
    });
  }
  // ผนังหน้าจั่วของหลังคาช่วงกลาง (สูงกว่าช่วงหัว-ท้าย) ที่รอยต่อ t = ±midT
  function mrtJunction(C, F, S, g, t) {
    var e = S.eave, r = S.style.rise, zc = e + 0.75 * r, R = 0.75 * r;
    function side(a) { return e + 0.75 * r * (1 - (a - 0.22) / 0.78); }
    function cap(s) { return zc + 1.7 + 0.3 * (1 - Math.pow(s / 0.3, 2)); }
    var pts = [[-1, e], [-0.6, side(0.6)], [-0.22, zc], [-0.22, cap(0.22)], [0, cap(0)], [0.22, cap(0.22)], [0.22, zc], [0.6, side(0.6)], [1, e]];
    var top = pts.map(function (q) { return [g.om + q[0] * g.hw, q[1]]; });
    var under = pts.map(function (q) { return [g.om + q[0] * g.hw, e + R * (1 - Math.abs(q[0]))]; });
    caps(C.paint, F, top, under, t, S.midCol);
  }
  // ซี่โครงโค้งใต้หลังคาที่ตำแหน่ง t: แผ่นตั้งลึก 0.55 ม. ตามผิวใต้หลังคา + ปีกล่างกว้าง 0.3 ม.
  function rib(B, F, top, t, TH) {
    var stp = Math.max(1, Math.ceil((top.length - 1) / 8)), pts = [], D = 0.55, base, n, i, p;
    for (i = 0; i < top.length; i += stp) pts.push(top[i]);
    if (pts[pts.length - 1] !== top[top.length - 1]) pts.push(top[top.length - 1]);
    n = pts.length;
    base = B.p.length / 3;
    for (i = 0; i < n; i++) { B.v(F(t, pts[i][0], pts[i][1] - TH), 0, 0, COL.frame); B.v(F(t, pts[i][0], pts[i][1] - TH - D), 0, 0, COL.frame); }
    for (i = 0; i < n - 1; i++) { p = base + i * 2; B.q(p, p + 2, p + 3, p + 1); }
    base = B.p.length / 3;
    for (i = 0; i < n; i++) { var zb = pts[i][1] - TH - D; B.v(F(t - 0.15, pts[i][0], zb), 0, 0, COL.frame); B.v(F(t + 0.15, pts[i][0], zb), 0, 0, COL.frame); }
    for (i = 0; i < n - 1; i++) { p = base + i * 2; B.q(p, p + 2, p + 3, p + 1); }
  }
  // หลังคาลอนต่อเนื่องตามแนว (สายสีแดง)
  function emitVaults(C, F, S, g, t0, t1, TH) {
    var ts = [], os = [], i;
    var nT = Math.max(2, Math.ceil((t1 - t0) / S.vaultM * 8));
    for (i = 0; i <= nT; i++) ts.push(t0 + (t1 - t0) * i / nT);
    for (i = 0; i <= 8; i++) os.push(g.oL + (g.oR - g.oL) * i / 8);
    var zf = function (t, o) { return roofZ(S, o, t); };
    gridSurf(C.roof, F, ts, os, zf, S.roofCol);
    gridSurf(C.paint, F, ts, os, function (t, o) { return zf(t, o) - TH; }, COL.under);
    [g.oL, g.oR].forEach(function (o) {
      for (var j = 0; j < nT; j++) {
        var a = ts[j], b = ts[j + 1], s = C.paint.v(F(a, o, zf(a, o) + 0.04), 0, 0, S.lineCol);
        C.paint.v(F(b, o, zf(b, o) + 0.04), 0, 0, S.lineCol);
        C.paint.v(F(b, o, zf(b, o) - TH - 0.7), 0, 0, S.lineCol);
        C.paint.v(F(a, o, zf(a, o) - TH - 0.7), 0, 0, S.lineCol);
        C.paint.q(s, s + 1, s + 2, s + 3);
      }
    });
    [t0, t1].forEach(function (t) {
      var top = os.map(function (o) { return [o, zf(t, o)]; });
      caps(C.paint, F, top, top.map(function (q) { return [q[0], q[1] - TH]; }), t, COL.under);
    });
  }

  // ชั้นขายตั๋ว: พื้นคร่อมถนนยาวเกือบเต็มสถานี (ขอบคานมีแถบสีประจำสาย + ราวกันตกรอบ)
  //   + ห้องขายตั๋วผนังกระจกตรงกลาง (เพดาน + แถบสีประจำสาย)
  function emitConcourse(C, F, S) {
    if (S.noConc) return;
    var t0 = -S.Lc / 2, t1 = S.Lc / 2, o0 = S.co0, o1 = S.co1, z0 = S.conc, z1 = S.concTop, zg = z1 - 1.0;
    var h = S.Ld / 2, d0 = S.do0, d1 = S.do1;
    fbox(C.conc, F, -h, h, d0, d1, z0 - 0.8, z0);
    if (h > t1 + 1 || d0 < o0 - 0.5 || d1 > o1 + 0.5) {
      // ด้านที่ติดกับสถานีข้าง ๆ (flushL/R) ไม่มีราว/แถบสี — ขอบพื้นตรงกับผนังกระจก
      var rails = h > t1 + 1 ? [[-h, d0, -h + 0.18, d1], [h - 0.18, d0, h, d1]] : [];
      if (!S.flushL) { rails.push([-h, d0, h, d0 + 0.18]); fbox(C.paint, F, -h, h, d0 - 0.06, d0, z0 - 0.62, z0 - 0.34, S.lineCol); }
      if (!S.flushR) { rails.push([-h, d1 - 0.18, h, d1]); fbox(C.paint, F, -h, h, d1, d1 + 0.06, z0 - 0.62, z0 - 0.34, S.lineCol); }
      // ราวกันตก: ผนังทึบเตี้ย + ราวเหล็กด้านบน
      rails.forEach(function (r) {
        fbox(C.conc, F, r[0], r[2], r[1], r[3], z0, z0 + 0.9);
        fbox(C.paint, F, r[0] - 0.02, r[2] + 0.02, r[1] - 0.02, r[3] + 0.02, z0 + 0.9, z0 + 1.08, COL.steel);
      });
    }
    fbox(C.conc, F, t0, t1, o0, o1, z1 - 0.3, z1);
    [[t0, o0, t1, o0], [t1, o0, t1, o1], [t1, o1, t0, o1], [t0, o1, t0, o0]].forEach(function (e) {
      tquad(C.glass, F, [e[0], e[1]], [e[2], e[3]], z0, zg, 3, S.hub ? Math.max(1, Math.round((zg - z0) / 3.6)) : 1);
    });
    fbox(C.paint, F, t0 - 0.06, t1 + 0.06, o0 - 0.06, o1 + 0.06, zg, z1 - 0.3, S.lineCol);
  }

  // เสากลม (แปดเหลี่ยม) รัศมี r จาก z0 ถึง z1 · ปิดหัวเสา (โคนอยู่บนพื้นไม่ต้องปิด)
  function ocol(B, F, tc, oc, r, z0, z1) {
    var b = B.p.length / 3, i;
    for (i = 0; i < 8; i++) { var a = (i + 0.5) * Math.PI / 4; B.v(F(tc + r * Math.cos(a), oc + r * Math.sin(a), z0)); }
    for (i = 0; i < 8; i++) { var a2 = (i + 0.5) * Math.PI / 4; B.v(F(tc + r * Math.cos(a2), oc + r * Math.sin(a2), z1)); }
    for (i = 0; i < 8; i++) { var j = (i + 1) % 8; B.q(b + i, b + j, b + 8 + j, b + 8 + i); }
    for (i = 1; i < 7; i++) B.i.push(b + 8, b + 8 + i, b + 9 + i);
  }

  // เสารับ: "center" = เสากลางถนน + หัวเสาบานรับชั้นขายตั๋ว/พื้นชานชาลา (โมโนเรล สายสีทอง)
  //   "portal" = โครงเสาคู่ทุก ~25 ม.: เสากลม 2 ต้น + คานขวางลึกรับพื้นชั้นขายตั๋ว (ยื่นเรียวออกถึงขอบระเบียง)
  //              + เสาช่วงบนทะลุชั้นขายตั๋ว + คานรับพื้นชานชาลา — ช่วงหัว-ท้ายที่ไม่มีชั้นขายตั๋ว คานรับพื้นชานชาลาตรง ๆ
  function emitSupports(C, F, S) {
    if (S.hub) return;
    var L2 = S.L / 2, deckB = S.levels[0].rz - 1.5, mid = (S.o0 + S.o1) / 2, i, t;
    function skipAt(t, o) {
      if (!S.skip.length) return false;
      var p = F(t, o, 0);
      return S.skip.some(function (q) { return pointInQuad(p, q); });
    }
    if (S.style.sup === "center") {
      var n = Math.max(2, Math.round(S.L / COL_STEP)), hc = S.noConc ? -1 : S.Ld / 2 + 0.5;
      for (i = 0; i <= n; i++) {
        t = -L2 + 1.2 + (S.L - 2.4) * i / n;
        var inC = Math.abs(t) <= hc;
        if (skipAt(t, mid)) continue;
        var capTop = inC ? S.conc - 0.8 : deckB, capH = inC ? 1.6 : 2.2;
        var hw = inC ? (S.do1 - S.do0) / 2 - 0.3 : (S.o1 - S.o0) / 2 - 0.3;
        fbox(C.conc, F, t - 1.0, t + 1.0, mid - 1.25, mid + 1.25, 0, capTop - capH + 0.02);
        taper(C.conc, F, t, mid, capTop - capH, capTop, 1.0, 1.25, 1.05, hw);
      }
      return;
    }
    var nf = Math.max(2, Math.round((S.L - 2.4) / FRAME_STEP)), hd = S.noConc ? -1 : S.Ld / 2 - 0.8;
    var cA = S.o0 + 2.4, cB = S.o1 - 2.4, TB = 0.7;
    if (cB - cA < 6) { cA = mid - 3; cB = mid + 3; }
    for (i = 0; i <= nf; i++) {
      t = -L2 + 1.2 + (S.L - 2.4) * i / nf;
      var inD = Math.abs(t) <= hd, zTop = inD ? S.conc - 0.8 : deckB, BD = inD ? 1.7 : 1.4;
      var e0 = inD ? S.do0 : S.o0, e1 = inD ? S.do1 : S.o1;
      var cols = [cA, cB].filter(function (oc) { return !skipAt(t, oc); });
      if (!cols.length) continue;
      cols.forEach(function (oc) {
        ocol(C.conc, F, t, oc, 0.8, 0, zTop - BD + 0.02);
        if (inD) fbox(C.conc, F, t - 0.42, t + 0.42, oc - 0.42, oc + 0.42, S.conc, deckB - 0.95);
      });
      // คานขวาง: ช่วงระหว่างเสาลึกเต็ม · ช่วงยื่นออกไปเรียวบางลงที่ปลาย
      var lo = cols.length === 2 ? cA : cols[0] - 0.9, hi = cols.length === 2 ? cB : cols[0] + 0.9;
      fbox(C.conc, F, t - TB, t + TB, lo, hi, zTop - BD, zTop);
      if (cols.length === 2) {
        prism(C.conc, F, [[t - TB, e0], [t + TB, e0], [t + TB, cA], [t - TB, cA]], [zTop - 0.55, zTop - 0.55, zTop - BD, zTop - BD], [zTop, zTop, zTop, zTop]);
        prism(C.conc, F, [[t - TB, cB], [t + TB, cB], [t + TB, e1], [t - TB, e1]], [zTop - BD, zTop - BD, zTop - 0.55, zTop - 0.55], [zTop, zTop, zTop, zTop]);
      }
      if (inD) fbox(C.conc, F, t - 0.5, t + 0.5, S.o0 + 0.8, S.o1 - 0.8, deckB - 0.95, deckB);   // คานรับพื้นชานชาลา
    }
  }

  // หลังคาโค้งคลุมทางเดิน/บันได: จาก a (สูง za) ถึง b (สูง zb) กว้าง w โก่งกลาง rise
  // ผิวเดียว (วัสดุสองหน้า) ลายตะเข็บตามแนวยาว + normal ตามความโค้งจริง แสงจึงไล่เนียนแบบหลังคาเหล็ก
  function archCanopy(B, F, a, za, b, zb, w, rise, col) {
    var dt = b[0] - a[0], dd = b[1] - a[1], L = Math.hypot(dt, dd);
    if (L < 0.05) return;
    var ut = dt / L, uo = dd / L, g = (zb - za) / L, base = B.p.length / 3, NS = 6, i;
    for (i = 0; i <= NS; i++) {
      var s = 2 * i / NS - 1, off = s * w / 2, dz = rise * (1 - s * s), sl = -4 * s * rise / w;
      // normal = (แนวยาว ut,uo,g) × (แนวโค้ง -uo,ut,sl) — ชี้ขึ้นเสมอ
      var nx = uo * sl - g * ut, ny = -g * uo - ut * sl, nl = Math.hypot(nx, ny, 1), N = B.n ? F.n(nx / nl, ny / nl, 1 / nl) : null;
      B.v(F(a[0] - uo * off, a[1] + ut * off, za + dz), 0, i / NS, col, N);
      B.v(F(b[0] - uo * off, b[1] + ut * off, zb + dz), L / 0.8, i / NS, col, N);
    }
    for (i = 0; i < NS; i++) { var p = base + i * 2; B.q(p, p + 1, p + 3, p + 2); }
  }
  // เสาเหล็กเล็ก (สี่ด้าน ไม่มีหัว-ท้าย — ประหยัดรูปทรง) และแผ่นตั้งบาง (ราวกันตก) จาก a (สูง za) ถึง b (สูง zb) สูง h
  function post(B, F, t, o, z0, z1, r, col) {
    var c = [[t - r, o - r], [t + r, o - r], [t + r, o + r], [t - r, o + r]], b = B.p.length / 3, i;
    for (i = 0; i < 4; i++) { B.v(F(c[i][0], c[i][1], z0), 0, 0, col); B.v(F(c[i][0], c[i][1], z1), 0, 0, col); }
    for (i = 0; i < 4; i++) { var j = (i + 1) % 4; B.q(b + i * 2, b + j * 2, b + j * 2 + 1, b + i * 2 + 1); }
  }
  function panel(B, F, a, za, b, zb, h, col) {
    var s = B.v(F(a[0], a[1], za), 0, 0, col);
    B.v(F(b[0], b[1], zb), 0, 0, col); B.v(F(b[0], b[1], zb + h), 0, 0, col); B.v(F(a[0], a[1], za + h), 0, 0, col);
    B.q(s, s + 1, s + 2, s + 3);
  }
  // หลังคาคลุม (สูง 2.7 ม. เหนือผิวเดิน) + เสาเหล็กสองข้างทุก ~4.5 ม. (ชานพักไม่ต้องมีเสาเอง — ใช้เสาของช่วงบันไดที่มาชน)
  function canopy(C, F, S, a, za, b, zb, w, noPosts) {
    var CH = 2.7, dt = b[0] - a[0], dd = b[1] - a[1], L = Math.hypot(dt, dd) || 1, ut = dt / L, uo = dd / L;
    archCanopy(C.dRoof, F, a, za + CH, b, zb + CH, w + 0.9, 0.5, S.roofCol);
    if (noPosts) return;
    var np = Math.max(1, Math.round(L / 4.5));
    for (var i = 0; i <= np; i++) {
      var f = i / np, pt = a[0] + dt * f, po = a[1] + dd * f, pz = za + (zb - za) * f;
      for (var sg = -1; sg <= 1; sg += 2) post(C.dPaint, F, pt - uo * (w / 2 + 0.3) * sg, po + ut * (w / 2 + 0.3) * sg, pz, pz + CH + 0.1, 0.07, COL.steel);
    }
  }
  // ช่วงบันไดหนึ่งช่วงจาก a (สูง za) ขึ้นไป b (สูง zb): ผิวขั้นบันได (ลาย) + ท้องบันได + ราวกันตกสองข้าง + หลังคาคลุม
  function flight(C, F, S, a, za, b, zb, w, esc, cov) {
    var dt = b[0] - a[0], dd = b[1] - a[1], L = Math.hypot(dt, dd) || 1, ut = dt / L, uo = dd / L;
    var nt = -uo * w / 2, no = ut * w / 2, vr = Math.hypot(L, zb - za) / 0.6;
    var B = C.stair, i0 = B.v(F(a[0] + nt, a[1] + no, za + 0.05), 0, 0);
    B.v(F(a[0] - nt, a[1] - no, za + 0.05), 1, 0); B.v(F(b[0] - nt, b[1] - no, zb + 0.03), 1, vr); B.v(F(b[0] + nt, b[1] + no, zb + 0.03), 0, vr);
    B.q(i0, i0 + 1, i0 + 2, i0 + 3);
    slope(C.dConc, F, a, za + 0.02, b, zb, w, 0.5);
    [-1, 1].forEach(function (sg) {
      var ot = -uo * (w / 2 + 0.06) * sg, oo = ut * (w / 2 + 0.06) * sg;
      panel(C.dPaint, F, [a[0] + ot, a[1] + oo], za, [b[0] + ot, b[1] + oo], zb, 1.05, esc ? COL.dark : COL.steel);
    });
    if (cov) canopy(C, F, S, a, za, b, zb, w);
  }
  // ชานพักจาก a ถึง b กว้าง w ที่ระดับ z + เสารับสองต้นที่ปลาย pe (ถ้ามี) + หลังคาคลุม
  function landing(C, F, S, a, b, w, z, pe, cov) {
    sbox(C.dConc, F, a, b, w, z - 0.5, z);
    if (pe && z > 1.5) {
      var dt = b[0] - a[0], dd = b[1] - a[1], L = Math.hypot(dt, dd) || 1, nt = -dd / L, no = dt / L, r = w / 2 - 0.35;
      [-1, 1].forEach(function (sg) { post(C.dConc, F, pe[0] + nt * r * sg, pe[1] + no * r * sg, 0, z - 0.5, 0.22); });
    }
    if (cov) canopy(C, F, S, a, z, b, z, w - 0.5, true);
  }
  // ทางเชื่อมจากหัวบันได/ลิฟต์เข้าพื้นชั้นขายตั๋ว (พื้น + ราวกันตก + หลังคาโค้ง + เสารับทุก ~12 ม.)
  function linkTo(C, F, S, from, zt, w, cov) {
    var h = S.Ld / 2, q = [Math.max(-h, Math.min(h, from[0])), Math.max(S.do0, Math.min(S.do1, from[1]))];
    var d = Math.hypot(q[0] - from[0], q[1] - from[1]);
    if (d < 0.4) return;
    var dt = (q[0] - from[0]) / d, dd = (q[1] - from[1]) / d, ext = [q[0] + dt * 0.6, q[1] + dd * 0.6];
    sbox(C.dConc, F, from, ext, w, zt - 0.5, zt);
    [-1, 1].forEach(function (sg) {
      var ot = -dd * (w / 2 - 0.08) * sg, oo = dt * (w / 2 - 0.08) * sg;
      panel(C.dPaint, F, [from[0] + ot, from[1] + oo], zt, [q[0] + ot, q[1] + oo], zt, 1.1, COL.steel);
    });
    for (var x = 12; x < d - 2; x += 12) post(C.dConc, F, from[0] + dt * x, from[1] + dd * x, 0, zt - 0.5, 0.3);
    if (cov) canopy(C, F, S, from, zt, ext, zt, w - 0.3);
  }
  // บันได/บันไดเลื่อน ตามรูปแบบที่ planAccess เลือกไว้ (ดู kind/anchor)
  function emitStair(C, F, S, s) {
    var zt = s.zt, w = s.w, top, u;
    function at(p, v, f) { return [p[0] + v[0] * f, p[1] + v[1] * f]; }
    function unit(a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; }
    if (s.kind === "switch") {
      // พับครึ่ง: ช่วงล่างวิ่งตาม u ขึ้นถึงชานพักกลาง แล้วช่วงบนย้อนกลับในช่องข้าง ๆ มาถึงหัวบันได
      var zm = zt / 2, r = zm * RISE_RUN, off = w + 0.35, n, Fp, Q0, sg;
      if (s.anchor === "foot") {
        Fp = s.b; u = unit(s.b, s.a); n = [-u[1], u[0]];
        sg = deckDist(S, at(Fp, n, off)) <= deckDist(S, at(Fp, n, -off)) ? 1 : -1;   // ช่องบนอยู่ฝั่งใกล้สถานี
        Q0 = at(Fp, n, sg * off);
      } else {
        u = unit(s.a, s.b); n = [-u[1], u[0]];
        Q0 = at(s.a, u, TOP_LANDING);
        sg = deckDist(S, at(Q0, n, -off)) >= deckDist(S, at(Q0, n, off)) ? 1 : -1;   // ช่องล่าง (ตีนบันได) อยู่ฝั่งไกลสถานี
        Fp = at(Q0, n, -sg * off);
      }
      // ช่องบนห้ามล้ำเข้าใต้พื้นชั้นขายตั๋ว → เลื่อนทั้งชุดออกไปทางฝั่งตีนบันได
      var away = [-n[0] * sg, -n[1] * sg], need = w / 2 + 0.25, sh = 0;
      while (sh < off + w && Math.min(deckDist(S, at(Q0, away, sh)), deckDist(S, at(at(Q0, u, r), away, sh))) < need) sh += 0.25;
      if (sh) { Fp = at(Fp, away, sh); Q0 = at(Q0, away, sh); }
      var P1 = at(Fp, u, r), Q1 = at(Q0, u, r), M0 = [(P1[0] + Q1[0]) / 2, (P1[1] + Q1[1]) / 2], M1 = at(M0, u, LANDING);
      top = at(Q0, u, -TOP_LANDING);
      flight(C, F, S, Fp, 0, P1, zm, w, false, s.cov);
      flight(C, F, S, Q1, zm, Q0, zt, w, false, s.cov);
      landing(C, F, S, M0, M1, off + w, zm, M1, s.cov);
      landing(C, F, S, Q0, top, w + 0.4, zt, s.link ? top : null, s.cov);
    } else {
      // ตรง: บันไดเลื่อนช่วงเดียว · บันไดมีชานพักกลาง · หัวบันไดมีชานพักยื่นต่อ 2.4 ม.
      var a = s.b, b = s.a, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      u = unit(a, b);
      if (s.kind === "flight") flight(C, F, S, a, 0, b, zt, w, s.esc, s.cov);
      else {
        var fl = (L - LANDING) / 2, m0 = at(a, u, fl), m1 = at(a, u, fl + LANDING);
        flight(C, F, S, a, 0, m0, zt / 2, w, false, s.cov);
        landing(C, F, S, m0, m1, w + 0.4, zt / 2, m1, s.cov);
        flight(C, F, S, m1, zt / 2, b, zt, w, false, s.cov);
      }
      top = at(b, u, 2.4);
      landing(C, F, S, b, top, w + 0.4, zt, s.link ? top : null, s.cov);
    }
    if (s.link) linkTo(C, F, S, top, zt, w + 0.8, s.cov);
  }
  // ลิฟต์: ปล่องกระจก + หัวปล่อง + สะพานเชื่อมชั้นขายตั๋ว
  function emitLift(C, F, S, p) {
    var z1 = S.conc + 2.6, h = 1.15;
    [[-h, -h, h, -h], [h, -h, h, h], [h, h, -h, h], [-h, h, -h, -h]].forEach(function (e) {
      tquad(C.dGlass, F, [p[0] + e[0], p[1] + e[1]], [p[0] + e[2], p[1] + e[3]], 0, z1, 2.3, z1 / 3.2);
    });
    fbox(C.dPaint, F, p[0] - h - 0.1, p[0] + h + 0.1, p[1] - h - 0.1, p[1] + h + 0.1, z1, z1 + 0.35, COL.dark);
    linkTo(C, F, S, p, S.conc, 2.6, true);
  }
  // เงานุ่มใต้สถานี: ตาราง 3×3 ขอบจางกว้างคงที่ 7 ม. (สถานียาวก็ไม่จางทั้งแผ่น) เลื่อนตามทิศแดด
  function emitShadow(SB, S) {
    var F = S.frame, sh = H.sunShift(S.roofTop * 0.3), k = S.k, BW = 7;
    var T0 = -S.L / 2 - 6, T1 = S.L / 2 + 6, O0 = S.o0 - 4, O1 = S.o1 + 4;
    var ts = [T0, T0 + BW, T1 - BW, T1], os = [O0, O0 + BW, O1 - BW, O1], uv = [0, 0.5, 0.5, 1];
    if (O1 - O0 < 2 * BW) os[1] = os[2] = (O0 + O1) / 2;
    var base = SB.p.length / 3, ox = sh[0] * k, oy = sh[1] * k, z = 0.2 * k, i, j;
    for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) { var p = F(ts[i], os[j], 0); SB.v([p[0] + ox, p[1] + oy, z], uv[i], uv[j]); }
    for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) { var a = base + i * 4 + j; SB.q(a, a + 4, a + 5, a + 1); }
  }

  function stationBuilders() {
    return {
      conc: new MB(), paint: new MB({ c: 1 }), roof: new MB({ uv: 1, c: 1, n: 1 }), glass: new MB({ uv: 1 }), louvre: new MB({ uv: 1 }),
      shadow: new MB({ uv: 1 }),
      dConc: new MB(), dPaint: new MB({ c: 1 }), dGlass: new MB({ uv: 1 }), stair: new MB({ uv: 1 }), psd: new MB({ uv: 1 }),
      dRoof: new MB({ uv: 1, c: 1, n: 1 })
    };
  }
  function flushStation(C, mass, det) {
    flushMB(C.conc, H.concrete(), mass); flushMB(C.paint, matPaint, mass); flushMB(C.roof, matRoofTop, mass);
    flushMB(C.glass, matGlass, mass); flushMB(C.louvre, matLouvre, mass); flushMB(C.shadow, H.shadowMaterial("rect"), mass);
    flushMB(C.dConc, H.concrete(), det); flushMB(C.dPaint, matPaint, det); flushMB(C.dGlass, matGlass, det);
    flushMB(C.stair, matStair, det); flushMB(C.psd, matPSD, det); flushMB(C.dRoof, matRoofTop, det);
  }
  // C.stair/C.psd/C.shadow ไม่มี = วาดเฉพาะตัวอาคาร (ใช้ทำไฮไลต์ตอนชี้/คลิก)
  function emitStation(C, S) {
    var F = S.frame;
    emitDecks(C, F, S);
    emitRoof(C, F, S);
    emitConcourse(C, F, S);
    if (C.stair) {
      emitSupports(C, F, S);
      S.stairs.forEach(function (s) { emitStair(C, F, S, s); });
      S.lifts.forEach(function (p) { emitLift(C, F, S, p); });
    }
    if (C.shadow) emitShadow(C.shadow, S);
  }

  // ตอม่อทางวิ่งที่ตกอยู่ในรอยสถานี = ไม่ต้องวาด (สถานีมีเสารับของตัวเอง)
  function stationLookup(stations) {
    var cell = 500, g = {};
    stations.forEach(function (S) {
      var r = (S.L / 2 + 40) * S.k;
      for (var i = Math.floor((S.x - r) / cell); i <= Math.floor((S.x + r) / cell); i++)
        for (var j = Math.floor((S.y - r) / cell); j <= Math.floor((S.y + r) / cell); j++) (g[i + ":" + j] = g[i + ":" + j] || []).push(S);
    });
    return function (x, y) {
      var c = g[Math.floor(x / cell) + ":" + Math.floor(y / cell)];
      if (!c) return false;
      for (var i = 0; i < c.length; i++) {
        var S = c[i], f = toFrame(S, x, y);
        if (Math.abs(f[0]) <= S.L / 2 + 1 && f[1] >= S.o0 - 1 && f[1] <= S.o1 + 1) return true;
      }
      return false;
    };
  }

  /* ------------------------------------------------- ทางเดินลอยฟ้า (skywalk) */
  function emitWalks(BW, WR) {
    if (!D.walks) return 0;
    var n = 0;
    walkList().list.forEach(function (rec) {
      var w = rec.w, pts = rec.pts, i;
      n++;
      var h = rec.h, run = 0;
      for (i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
        if (L < 0.01) continue;
        var ux = dx / L, uy = dy / L, k = a.k;
        var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, z = h * k;
        BW.box(mx, my, z - 0.4 * k, z, L, 4 * k, ux, uy);                       // พื้นทางเดิน
        var px = -uy, py = ux, eo = 1.9 * k;
        [-1, 1].forEach(function (sg) {                                          // ราวกันตก
          BW.box(mx + px * eo * sg, my + py * eo * sg, z, z + 1.1 * k, L, 0.16 * k, ux, uy);
        });
        if (w.c) {                                                               // หลังคาโค้ง (เฉพาะช่วงที่ OSM บอกว่ามีหลังคา)
          archCanopy(WR, frameOf({ x: a.x, y: a.y, ux: ux, uy: uy, k: k }), [0, 0], h + 2.7, [L / k, 0], h + 2.7, 4.6, 0.6, COL.white);
          [-1, 1].forEach(function (sg) {
            BW.box(mx + px * eo * sg, my + py * eo * sg, z + 1.1 * k, z + 2.7 * k, 0.22 * k, 0.22 * k, ux, uy);
          });
        }
        // เสารับทุก ~14 ม.
        run += L / k;
        if (run > 14) {
          run = 0;
          BW.box(b.x, b.y, 0, z - 0.4 * k, 0.9 * k, 0.9 * k, ux, uy);
        }
      }
    });
    return n;
  }

  /* --------------------------------------------------------------- โมเดล */
  /* ——— ค้นรางตามแนวขวาง: ตารางช่วงราง 30 ม. → crossAt(P, u, nx, ny, k, W) คืนรางที่ตัดเส้นขวาง P + n·t
         (t เป็นเมตร, |t| ≤ W) และวิ่งขนานกัน → [{R, t, h, s}] เรียงตาม t (ใช้ทั้งคานกว้างสายสีแดงและเสาไฟฟ้า) */
  function trackGrid(list) {
    var CELL = 30, sg = {};
    list.forEach(function (R) {
      for (var i = 0; i < R.pts.length - 1; i++) {
        var a = R.pts[i], b = R.pts[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(L / (CELL / 2))), seen = {};
        for (var j = 0; j <= n; j++) {
          var key = Math.floor((a.x + (b.x - a.x) * j / n) / CELL) + ":" + Math.floor((a.y + (b.y - a.y) * j / n) / CELL);
          if (seen[key]) continue;
          seen[key] = 1;
          (sg[key] = sg[key] || []).push([R, i]);
        }
      }
    });
    return function crossAt(P, u, nx, ny, k, W) {
      var best = {}, done = {}, out = [];
      // ก้าวละ 2 ม. — ถ้าก้าวยาว เส้นขวางที่เฉียดมุมช่องตารางจะข้ามช่องที่มีรางคู่ไป (เคยทำให้พื้นคานกว้างขาดเป็นช่อง)
      for (var t = -W; t <= W + 1e-6; t += 2) {
        var cell = sg[Math.floor((P.x + nx * t * k) / CELL) + ":" + Math.floor((P.y + ny * t * k) / CELL)];
        if (!cell) continue;
        cell.forEach(function (it) {
          var R = it[0], i = it[1], id = R.idx + ":" + i;
          if (done[id]) return;
          done[id] = 1;
          var A = R.pts[i], B = R.pts[i + 1], ex = B.x - A.x, ey = B.y - A.y, el2 = Math.hypot(ex, ey);
          if (el2 < 1e-6 || Math.abs((ex * u[0] + ey * u[1]) / el2) < 0.93) return;
          var Nx = nx * k, Ny = ny * k, den = Nx * ey - Ny * ex;
          if (Math.abs(den) < 1e-9) return;
          var ax = A.x - P.x, ay = A.y - P.y, tt = (ax * ey - ay * ex) / den, v = (ax * Ny - ay * Nx) / den;
          if (v < 0 || v > 1 || Math.abs(tt) > W) return;
          var b = best[R.idx];
          if (!b || Math.abs(tt) < Math.abs(b.t)) best[R.idx] = { R: R, t: tt, h: A.h + (B.h - A.h) * v, s: A.s + (B.s - A.s) * v };
        });
      }
      for (var id in best) out.push(best[id]);
      return out.sort(function (a, b) { return a.t - b.t; });
    };
  }

  /* ================================================= คานกว้างสายสีแดง (ทางคู่ + รางรถไฟทางไกลตรงกลาง)
     OSM แยกรางสายสีแดงสองรางห่างกัน 8.5–16.5 ม. เพราะตรงกลางคือรางรถไฟทางไกลของ รฟท. (ไม่อยู่ใน 10 สายของหน้านี้)
     ของจริงเป็นคานผืนเดียว → เติมพื้นคานระหว่างสองราง · ไม่วาดราวสีตามสายด้านใน · วางรางทางไกล (ทางเมตร) ตรงกลาง 1–2 ราง
     ในรอยสถานีไม่เติม (สถานีจัดชานชาลาของตัวเอง) · เสาไฟฟ้าช่วงนี้เป็นโครงข้ามทั้งผืน (ดู buildOCS) */
  var TWIN_LINES = { "srt-dark-red": 1, "srt-light-red": 1 };
  var TWIN_MIN = 8.5, TWIN_MAX = 16.5, TWIN_STEP = 10, TWIN_DH = 1.5;
  var DECK_HW = 2.3, DECK_D = 2.0, METRE = 1.0;

  // สองรางจาก crossAt เป็นคู่บนคานกว้างเดียวกันหรือไม่
  function isTwin(a, b) {
    var d = Math.abs(a.t - b.t);
    return !!(TWIN_LINES[a.R.line] && TWIN_LINES[b.R.line] && d >= TWIN_MIN && d <= TWIN_MAX && Math.abs(a.h - b.h) < TWIN_DH);
  }
  function twinOverlap(R, side, s0, s1) {
    var iv = R.twinIv && R.twinIv[String(side)];
    if (!iv) return false;
    for (var i = 0; i < iv.length; i++) if (iv[i][0] <= s1 && iv[i][1] >= s0) return true;
    return false;
  }
  function inTwin(R, side, s) {
    var iv = R.twinIv && R.twinIv[String(side)];
    if (!iv) return false;
    for (var i = 0; i < iv.length; i++) if (s >= iv[i][0] && s <= iv[i][1]) return true;
    return false;
  }

  /* เดินตามรางสายสีแดงทุก 10 ม. หาคู่แฝดซ้าย/ขวา → R.twinIv[side] = ช่วง s ที่ไม่มีราวด้านนั้น
     คืนรายการ "ช่วงต่อเนื่อง" (นับจากรางที่ idx น้อยกว่าของคู่ จะได้ไม่เติมซ้ำ) */
  function findTwins(tracks, inStation) {
    var red = tracks.filter(function (R) { return TWIN_LINES[R.line] && !R.yard && R.len > 50; });
    if (red.length < 2) return [];
    var crossAt = trackGrid(red), o = {}, o2 = {}, runs = [];
    red.forEach(function (R) {
      R.twinIv = { "1": [], "-1": [] };
      var cur = { "1": null, "-1": null };
      for (var s = 0; s <= R.len + TWIN_STEP - 1e-6; s += TWIN_STEP) {
        var ss = Math.min(s, R.len);
        sampleTrack(R, Math.min(R.len, ss + 3), o);
        sampleTrack(R, Math.max(0, ss - 3), o2);
        var ux = o.x - o2.x, uy = o.y - o2.y, ul = Math.hypot(ux, uy);
        if (ul < 1e-6) continue;
        ux /= ul; uy /= ul;
        sampleTrack(R, ss, o);
        var P = { x: o.x, y: o.y, h: o.h, k: o.k }, nx = -uy, ny = ux;
        var cs = crossAt(P, [ux, uy], nx, ny, o.k, TWIN_MAX + 1);
        [1, -1].forEach(function (side) {
          var key = String(side), near = null;
          // รางที่ใกล้ที่สุดด้านนี้ต้องเป็นคู่แฝด (ไม่มีรางสายสีแดงอื่นคั่น)
          cs.forEach(function (c) { if (c.R !== R && c.t * side > 0.5 && (!near || Math.abs(c.t) < Math.abs(near.t))) near = c; });
          if (!near || !isTwin({ R: R, t: 0, h: P.h }, near)) { cur[key] = null; return; }
          var smp = { s: ss, x: P.x, y: P.y, h: P.h, k: P.k, nx: nx, ny: ny, t: near.t, h2: near.h,
            st: inStation(P.x + nx * near.t / 2 * P.k, P.y + ny * near.t / 2 * P.k) };
          var iv = R.twinIv[key], last = iv[iv.length - 1];
          if (cur[key] && cur[key].partner === near.R && ss - last[1] <= TWIN_STEP * 1.6) { last[1] = ss; cur[key].pts.push(smp); }
          else {
            iv.push([ss, ss]);
            cur[key] = { R: R, partner: near.R, side: side, pts: [smp] };
            if (R.idx < near.R.idx) runs.push(cur[key]);
          }
        });
      }
      // ขยายช่วงไปครึ่งก้าวทั้งสองปลาย ให้ราวด้านในหายต่อเนื่องถึงรอยต่อ
      ["1", "-1"].forEach(function (key) { R.twinIv[key].forEach(function (iv) { iv[0] -= TWIN_STEP / 2; iv[1] += TWIN_STEP / 2; }); });
    });
    return runs;
  }

  // ลดจุดบนช่วงที่เกือบตรง (คลาดจากเส้นตรง < 0.1 ม. และระยะคู่เปลี่ยน < 0.15 ม.) → ท่อนคาน/รางยาวขึ้น สามเหลี่ยมน้อยลง
  function simplifyTwin(P) {
    var out = [P[0]], i0 = 0;
    for (var j = 2; j < P.length; j++) {
      var a = P[i0], b = P[j], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, bad = false;
      for (var m = i0 + 1; m < j && !bad; m++) {
        var q = P[m], f = (m - i0) / (j - i0);
        if (Math.abs((q.x - a.x) * dy - (q.y - a.y) * dx) / L / q.k > 0.1 || Math.abs(q.t - (a.t + (b.t - a.t) * f)) > 0.15) bad = true;
      }
      if (bad) { out.push(P[j - 1]); i0 = j - 1; }
    }
    out.push(P[P.length - 1]);
    return out;
  }
  function quad4(B, a, b, c, d) {
    var s = B.p.length / 3;
    B.v(a[0], a[1], a[2]); B.v(b[0], b[1], b[2]); B.v(c[0], c[1], c[2]); B.v(d[0], d[1], d[2]);
    B.q(s, s + 1, s + 2, s + 3);
  }
  // พื้นคานระหว่างขอบในของสองราง + รางทางไกลตรงกลาง (ทางเมตร) ลงก้อนของพื้นที่นั้น
  function emitTwinRun(run, P, chunkFor) {
    var side = run.side, ch = chunkFor(P[0].x, P[0].y);
    var pt = function (p, off, z) { return [p.x + p.nx * off * p.k, p.y + p.ny * off * p.k, z * p.k]; };
    var rows = P.map(function (p) {
      var e = side * DECK_HW, f = p.t - side * DECK_HW;
      return { et: pt(p, e, p.h), ft: pt(p, f, p.h2), eb: pt(p, e, p.h - DECK_D), fb: pt(p, f, p.h2 - DECK_D) };
    });
    for (var i = 0; i + 1 < rows.length; i++) {
      var A = rows[i], B = rows[i + 1];
      quad4(ch.BC, A.et, B.et, B.ft, A.ft);
      quad4(ch.BC, A.eb, A.fb, B.fb, B.eb);
    }
    [rows[0], rows[rows.length - 1]].forEach(function (r) { quad4(ch.BC, r.et, r.ft, r.fb, r.eb); });
    var nm = Math.abs(P[0].t) >= 11 ? 2 : 1;
    for (var q = 1; q <= nm; q++) {
      var f = q / (nm + 1);
      [-METRE / 2, METRE / 2].forEach(function (g) {
        for (var i = 0; i + 1 < P.length; i++) {
          var a = P[i], b = P[i + 1], pa = pt(a, a.t * f + g, 0), pb = pt(b, b.t * f + g, 0);
          var dx = pb[0] - pa[0], dy = pb[1] - pa[1], L = Math.hypot(dx, dy);
          if (L < 1e-3) continue;
          var z = ((a.h + (a.h2 - a.h) * f) + (b.h + (b.h2 - b.h) * f)) / 2 * a.k;
          ch.BR.box((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, z, z + 0.18 * a.k, L, 0.12 * a.k, dx / L, dy / L);
        }
      });
    }
    return P.length;
  }
  function emitTwinDecks(runs, chunkFor) {
    var n = 0;
    runs.forEach(function (run) {
      var seg = [];
      var flush = function () { if (seg.length >= 2) n += emitTwinRun(run, simplifyTwin(seg), chunkFor); seg = []; };
      // เว้นรอยสถานี แต่ยื่นเข้าไปหนึ่งจุด (ซ่อนใต้ชานชาลา) ไม่ให้เหลือช่องโหว่ที่หัว-ท้ายสถานี
      run.pts.forEach(function (p, i) {
        if (p.st) { if (seg.length) { seg.push(p); flush(); } return; }
        if (!seg.length && i && run.pts[i - 1].st) seg.push(run.pts[i - 1]);
        seg.push(p);
      });
      flush();
    });
    return n;
  }

  /* ================================================= ระบบจ่ายไฟเหนือหัว 25 kV (สายสีแดง, ARL)
     เสาเหล็กตั้งบนขอบคานทุก ~50 ม. · ทางคู่ = เสาริมนอกสองข้าง แต่ละต้นยื่นแขน (cantilever) ไปเหนือรางของตัวเอง
     · ทางตั้งแต่ 3 รางขึ้นไป = โครงข้ามราง (portal) ห้อยตัวยึดสายลงเหนือแต่ละราง · ในสถานีไม่ปักเสา (สายแขวนจากหลังคา)
     สาย: สายส่งไฟ (contact wire) สูงคงที่ + สายแขวน (messenger) ตกท้องช้างระหว่างจุดรับ + สายห้อย (dropper) — วาดเป็นเส้น 1 px */
  var OCS_LINES = { "srt-dark-red": 1, "srt-light-red": 1, "arl": 1 };
  var OCS_SPAN = 50;            // ระยะห่างเสา (ม.)
  var OCS_CW = 5.5;             // สายส่งไฟ สูงจากหัวราง (แพนโทกราฟของรถแตะพอดี)
  var OCS_MW = 6.9, OCS_SAG = 0.75;   // สายแขวน ณ จุดรับ / ตกท้องช้างกลางช่วง
  var OCS_TOP = 7.7;            // ยอดเสา สูงจากหัวราง
  var OCS_MAST = 2.2;           // ระยะเสาจากศูนย์กลางรางริมนอก (บนแนวราวขอบคาน)
  var OCS_ZOOM = 13.6, WIRE_ZOOM = 15;
  var WIRE_COLOR = { dark: "#8e9aa8", light: "#3c434b", sunset: "#5a4a40" };
  var matOcs = null, matIns = null, matWire = null;

  // แท่งเหลี่ยมจากจุด a ถึง b (พิกัดฉาก) หน้าตัด w×w · cap = ปิดหัว-ท้าย (เสา — มองจากบนจะเห็นยอด)
  function beam(B, a, b, w, cap) {
    var dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz) || 1;
    dx /= L; dy /= L; dz /= L;
    var e1x = -dy, e1y = dx, l1 = Math.hypot(e1x, e1y);
    if (l1 < 1e-6) { e1x = 1; e1y = 0; l1 = 1; }
    e1x /= l1; e1y /= l1;
    var e2x = -dz * e1y, e2y = dz * e1x, e2z = dx * e1y - dy * e1x;      // d × e1
    var h = w / 2, c = [[-h, -h], [h, -h], [h, h], [-h, h]], s = B.p.length / 3, i;
    for (i = 0; i < 4; i++) B.v(a[0] + e1x * c[i][0] + e2x * c[i][1], a[1] + e1y * c[i][0] + e2y * c[i][1], a[2] + e2z * c[i][1]);
    for (i = 0; i < 4; i++) B.v(b[0] + e1x * c[i][0] + e2x * c[i][1], b[1] + e1y * c[i][0] + e2y * c[i][1], b[2] + e2z * c[i][1]);
    for (i = 0; i < 4; i++) B.q(s + i, s + (i + 1) % 4, s + 4 + (i + 1) % 4, s + 4 + i);
    if (cap) { B.q(s + 3, s + 2, s + 1, s); B.q(s + 4, s + 5, s + 6, s + 7); }
  }

  function buildOCS(tracks, inStation) {
    var el = tracks.filter(function (R) { return OCS_LINES[R.line] && R.len > 30; });
    if (!el.length) return null;
    var th = H.theme();
    matOcs = new T.MeshPhongMaterial({ color: "#a3acb6", flatShading: true, shininess: 40, specular: 0x444444, side: T.DoubleSide });
    matIns = new T.MeshPhongMaterial({ color: "#6b5646", flatShading: true, shininess: 20, specular: 0x222222, side: T.DoubleSide });
    matWire = new T.LineBasicMaterial({ color: WIRE_COLOR[th] || WIRE_COLOR.dark, transparent: true, opacity: 0.9 });

    var crossAt = trackGrid(el);

    var chunks = {}, contacts = {}, count = 0, o = {}, o2 = {};
    function chunkOf(x, y) {
      var ck = Math.floor(x / CHUNK_M) + ":" + Math.floor(y / CHUNK_M);
      return chunks[ck] || (chunks[ck] = { B: new Builder(), BI: new Builder(), W: [] });
    }
    function near(R, s, d) {
      var L = contacts[R.idx];
      if (L) for (var i = 0; i < L.length; i++) if (Math.abs(L[i] - s) < d) return true;
      return false;
    }
    // แขนยื่นจากเสา (ตำแหน่งขวาง m) ไปเหนือราง c: ลูกถ้วยฉนวนที่โคน + ท่อบน + ค้ำเฉียง + แขนยึดสายส่งไฟ
    function cantilever(ch, F, m, c) {
      var sg2 = c.t > m ? 1 : -1, r = c.rail, zUp = r + OCS_MW + 0.35, zLo = r + OCS_CW + 0.6, ti = m + sg2 * 0.75;
      beam(ch.BI, F(m, zUp), F(ti, zUp), 0.15);
      beam(ch.BI, F(m, zLo), F(ti, zLo), 0.15);
      beam(ch.B, F(ti, zUp), F(c.t + sg2 * 0.35, zUp), 0.08);
      beam(ch.B, F(ti, zLo), F(c.t, r + OCS_MW), 0.08);
      beam(ch.B, F(c.t, zUp), F(c.t, r + OCS_MW), 0.06);
      beam(ch.B, F(c.t - sg2 * 0.9, r + OCS_CW + 0.4), F(c.t, r + OCS_CW), 0.05);
    }
    el.slice().sort(function (a, b) { return b.len - a.len; }).forEach(function (R) {
      var s0 = R.len < OCS_SPAN ? R.len / 2 : OCS_SPAN / 2;
      for (var s = s0; s < R.len - 3; s += OCS_SPAN) {
        if (near(R, s, 30)) continue;
        sampleTrack(R, Math.min(R.len, s + 3), o);
        sampleTrack(R, Math.max(0, s - 3), o2);
        var ux = o.x - o2.x, uy = o.y - o2.y, ul = Math.hypot(ux, uy);
        if (ul < 1e-6) continue;
        ux /= ul; uy /= ul;
        sampleTrack(R, s, o);
        var P = { x: o.x, y: o.y }, k = o.k, h0 = o.h, nx = -uy, ny = ux;
        var cs = crossAt(P, [ux, uy], nx, ny, k, 20), at = -1, i;
        for (i = 0; i < cs.length; i++) if (cs[i].R === R) at = i;
        if (at < 0) { cs = [{ R: R, t: 0, h: h0, s: s }]; at = 0; }
        // กลุ่มรางบนคานเดียวกัน: ห่างกันไม่เกิน 7.5 ม. และระดับใกล้กัน…
        var lo = at, hi = at;
        // …หรือเป็นคู่สายสีแดงบนคานกว้าง (ห่าง 8.5–16.5 ม.)
        while (lo > 0 && (cs[lo].t - cs[lo - 1].t <= 7.5 && Math.abs(cs[lo - 1].h - h0) < 3 || isTwin(cs[lo], cs[lo - 1]))) lo--;
        while (hi < cs.length - 1 && (cs[hi + 1].t - cs[hi].t <= 7.5 && Math.abs(cs[hi + 1].h - h0) < 3 || isTwin(cs[hi], cs[hi + 1]))) hi++;
        var cl = cs.slice(lo, hi + 1).map(function (c) { return { R: c.R, t: c.t, s: c.s, rail: c.h + 0.18 }; });
        cl.forEach(function (c) { (contacts[c.R.idx] = contacts[c.R.idx] || []).push(c.s); });
        if (inStation(P.x, P.y)) continue;                    // ในสถานี: สายแขวนจากโครงหลังคา ไม่ปักเสา
        var F = function (t, z) { return [P.x + nx * t * k, P.y + ny * t * k, z * k]; };
        var ch = chunkOf(P.x, P.y), n = cl.length, rMax = 0;
        cl.forEach(function (c) { rMax = Math.max(rMax, c.rail); });
        var mL = cl[0].t - OCS_MAST, mR = cl[n - 1].t + OCS_MAST;
        var masts = n === 1 ? [[mL, cl[0]]] : [[mL, cl[0]], [mR, cl[n - 1]]];
        masts.forEach(function (mm) { beam(ch.B, F(mm[0], mm[1].rail - 0.18), F(mm[0], rMax + OCS_TOP), 0.32, true); });
        // ทางคู่ชิดกัน = แขนยื่นจากเสาริม · ตั้งแต่ 3 ราง หรือคู่บนคานกว้าง = โครงข้ามทั้งผืน
        var wide = n >= 3 || (n === 2 && cl[1].t - cl[0].t > 7.5);
        if (!wide) masts.forEach(function (mm) { cantilever(ch, F, mm[0], mm[1]); });
        else {
          // โครงข้ามราง: คานบน-ล่าง + ค้ำทแยง · ห้อยลูกถ้วยและตัวยึดสายลงเหนือแต่ละราง
          var zt = rMax + OCS_TOP - 0.12, zb = zt - 0.7, span = mR - mL, nd = Math.max(2, Math.round(span / 2.5));
          beam(ch.B, F(mL, zt), F(mR, zt), 0.2);
          beam(ch.B, F(mL, zb), F(mR, zb), 0.16);
          for (i = 0; i < nd; i++) beam(ch.B, F(mL + span * i / nd, i % 2 ? zt : zb), F(mL + span * (i + 1) / nd, i % 2 ? zb : zt), 0.07);
          cl.forEach(function (c) {
            beam(ch.BI, F(c.t, zb), F(c.t, zb - 0.55), 0.15);
            beam(ch.B, F(c.t, zb - 0.55), F(c.t, c.rail + OCS_CW), 0.06);
          });
        }
        count++;
      }
    });

    // สาย: ช่วงระหว่างจุดรับ (รวมปลายราง) · สายแขวนตกท้องช้างตามความยาวช่วง · สายห้อยทุก ~8 ม.
    el.forEach(function (R) {
      var sup = contacts[R.idx];
      if (!sup || !sup.length) return;
      sup = [0].concat(sup.slice().sort(function (a, b) { return a - b; }), [R.len]);
      var mid = R.pts[R.pts.length >> 1], W = chunkOf(mid.x, mid.y).W;
      for (var j = 0; j + 1 < sup.length; j++) {
        var a = sup[j], b = sup[j + 1], L = b - a;
        if (L < 0.5) continue;
        var nS = Math.max(2, Math.ceil(L / 8)), sag = OCS_SAG * Math.min(1, Math.pow(L / OCS_SPAN, 2)), prev = null;
        for (var i = 0; i <= nS; i++) {
          var f = i / nS;
          sampleTrack(R, a + L * f, o);
          var k = o.k, r = o.h + 0.18, zc = (r + OCS_CW) * k, zm = (r + OCS_MW - sag * 4 * f * (1 - f)) * k;
          if (prev) W.push(prev[0], prev[1], prev[2], o.x, o.y, zc, prev[0], prev[1], prev[3], o.x, o.y, zm);
          if (i > 0 && i < nS) W.push(o.x, o.y, zc, o.x, o.y, zm);
          prev = [o.x, o.y, zc, zm];
        }
      }
    });

    var mastGroup = new T.Group(), wireGroup = new T.Group();
    Object.keys(chunks).forEach(function (ck) {
      var ch = chunks[ck];
      finish(ch.B, matOcs, mastGroup);
      finish(ch.BI, matIns, mastGroup);
      if (ch.W.length) {
        var g = new T.BufferGeometry();
        g.setAttribute("position", new T.Float32BufferAttribute(ch.W, 3));
        g.computeBoundingSphere();
        var ls = new T.LineSegments(g, matWire);
        ls.matrixAutoUpdate = false;
        wireGroup.add(ls);
      }
    });
    group.add(mastGroup); group.add(wireGroup);
    return { masts: mastGroup, wires: wireGroup, count: count };
  }

  function buildModel() {
    var pal = H.palette();
    group = new T.Group();
    group.visible = visible;
    H.scene().add(group);
    matSteel = new T.MeshPhongMaterial({ color: "#6d747d", flatShading: true, shininess: 30, specular: 0x333333 });
    hoverMat = new T.MeshBasicMaterial({ color: pal.glow, transparent: true, opacity: 0.3, depthWrite: false, side: T.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
    selMat = new T.MeshBasicMaterial({ color: pal.glow, transparent: true, opacity: 0.55, depthWrite: false, side: T.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });

    colors();
    makeStationMaterials();
    var tracks = D.tracks.map(decodeTrack).filter(Boolean);
    // สถานีคำนวณก่อน — ตอม่อทางวิ่งที่ตกในรอยสถานีจะได้ข้าม (สถานีมีเสารับของตัวเอง)
    var stations = buildStations(tracks);
    var inStation = stationLookup(stations);
    // คู่รางสายสีแดงบนคานกว้าง (ต้องรู้ก่อนวาดราวขอบคาน)
    var twinRuns = findTwins(tracks, inStation);
    // ——— คาน/ราง แบ่งเป็นก้อนตามพื้นที่ (+ เงาบนพื้นใต้ทางวิ่ง)
    var chunks = {}, grid = {}, piers = [];
    tracks.forEach(function (R) {
      var mid = R.pts[R.pts.length >> 1];
      var ck = Math.floor(mid.x / CHUNK_M) + ":" + Math.floor(mid.y / CHUNK_M);
      var ch = chunks[ck] || (chunks[ck] = { BC: new Builder(), BR: new Builder(), SH: new MB({ uv: 1 }), lines: {}, tracks: [] });
      R.span = emitTrack(ch.BC, ch.BR, (ch.lines[R.line] = ch.lines[R.line] || new Builder()), R, ch.SH);
      ch.tracks.push(R);
      collectPiers(R, grid, piers, inStation);
    });
    // คานกว้างสายสีแดง: เติมพื้นระหว่างรางคู่ + รางรถไฟทางไกลตรงกลาง
    var twinCount = emitTwinDecks(twinRuns, function (x, y) {
      var ck = Math.floor(x / CHUNK_M) + ":" + Math.floor(y / CHUNK_M);
      return chunks[ck] || (chunks[ck] = { BC: new Builder(), BR: new Builder(), SH: new MB({ uv: 1 }), lines: {}, tracks: [] });
    });
    var pickChunks = [];
    Object.keys(chunks).forEach(function (ck) {
      var ch = chunks[ck];
      var mesh = finish(ch.BC, H.concrete());
      finish(ch.BR, matSteel);
      Object.keys(ch.lines).forEach(function (ln) { finish(ch.lines[ln], lineMat(ln)); });
      flushMB(ch.SH, H.shadowMaterial("strip"), group);
      if (!mesh) return;
      var cp = mesh.geometry.attributes.position.array, ci = mesh.geometry.index.array;
      ch.tracks.forEach(function (R) {
        var x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
        for (var i = R.span.c0; i < R.span.c1; i++) {
          var v = ci[i] * 3, x = cp[v], y = cp[v + 1], z = cp[v + 2];
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
          if (z < z0) z0 = z; if (z > z1) z1 = z;
        }
        R.box = new T.Box3(new T.Vector3(x0, y0, z0 - 3), new T.Vector3(x1, y1, z1 + 3));
      });
      pickChunks.push({ sphere: mesh.geometry.boundingSphere, pos: cp, idx: ci, tracks: ch.tracks });
    });

    // ——— ตอม่อ (instanced ต่อพื้นที่)
    var box = new T.BoxGeometry(1, 1, 1);
    box.translate(0, 0, 0.5);
    var byCell = {};
    piers.forEach(function (p) { (byCell[Math.floor(p.x / CHUNK_M) + ":" + Math.floor(p.y / CHUNK_M)] = byCell[Math.floor(p.x / CHUNK_M) + ":" + Math.floor(p.y / CHUNK_M)] || []).push(p); });
    var m4 = new T.Matrix4(), qt = new T.Quaternion(), pos = new T.Vector3(), scl = new T.Vector3(), zAxis = new T.Vector3(0, 0, 1);
    var pierMeshes = [];
    Object.keys(byCell).forEach(function (key) {
      var ps = byCell[key];
      var cols = new T.InstancedMesh(box.clone(), H.concrete(), ps.length);
      var caps = new T.InstancedMesh(H.headGeometry().clone(), H.concrete(), ps.length);
      var cx = 0, cy = 0, cz = 0, rad = 0;
      ps.forEach(function (p, i) {
        // หัวเสาบานออกรับคานทางวิ่ง (โมโนเรลหัวเล็กกว่า)
        var capH = Math.min(p.mono ? 1.8 : 2.4, Math.max(1.1, p.top * 0.42));
        var k = p.k, colH = Math.max(0.3, p.top - capH);
        qt.setFromAxisAngle(zAxis, Math.atan2(p.dy, p.dx));
        pos.set(p.x, p.y, 0);
        scl.set((p.mono ? 1.3 : 1.8) * k, (p.mono ? 1.3 : 2.1) * k, colH * k);
        cols.setMatrixAt(i, m4.compose(pos, qt, scl));
        pos.set(p.x, p.y, colH * k);
        scl.set(2.2 * k, p.span * k, capH * k);
        caps.setMatrixAt(i, m4.compose(pos, qt, scl));
        cx += p.x; cy += p.y; cz += p.top * k / 2;
      });
      cx /= ps.length; cy /= ps.length; cz /= ps.length;
      ps.forEach(function (p) { rad = Math.max(rad, Math.hypot(p.x - cx, p.y - cy, p.top * p.k - cz) + p.span * p.k); });
      var sphere = new T.Sphere(new T.Vector3(cx, cy, cz), rad + 8);
      [cols, caps].forEach(function (mesh) {
        mesh.instanceMatrix.needsUpdate = true;
        mesh.geometry.boundingSphere = sphere;
        mesh.frustumCulled = true;
        mesh.matrixAutoUpdate = false;
        group.add(mesh);
        pierMeshes.push(mesh);
      });
    });

    // ——— สถานี: แบ่งก้อนตามพื้นที่ (ตัดส่วนนอกจอได้) · ส่วนรายละเอียด (บันได ลิฟต์ ประตูกั้นชานชาลา) แยกกลุ่ม แสดงเมื่อซูมใกล้
    var stGroup = new T.Group(), stDetail = new T.Group();
    group.add(stGroup); group.add(stDetail);
    var sch = {};
    stations.forEach(function (S) {
      var ck = Math.floor(S.x / CHUNK_M) + ":" + Math.floor(S.y / CHUNK_M);
      emitStation(sch[ck] || (sch[ck] = stationBuilders()), S);
    });
    Object.keys(sch).forEach(function (ck) { flushStation(sch[ck], stGroup, stDetail); });

    // ——— ทางเดินลอยฟ้าเชื่อมสถานี (แสดงตอนซูมเข้าเท่านั้น)
    var walkGroup = new T.Group();
    group.add(walkGroup);
    var BW = new Builder(), WR = new MB({ uv: 1, c: 1, n: 1 });
    var walkCount = emitWalks(BW, WR);
    finish(BW, H.concrete(), walkGroup);
    flushMB(WR, matRoofTop, walkGroup);

    // ——— ระบบจ่ายไฟเหนือหัว (สายสีแดง, ARL): เสา แขนยื่น โครงข้ามราง และสาย
    var ocs = buildOCS(tracks, inStation);

    // ——— จุดจอดของแต่ละราง (ระยะตามแนวรางที่ตรงกับชานชาลา)
    tracks.forEach(function (R) {
      R.stops = [];
      if (R.yard) return;
      stations.forEach(function (S) {
        if (S.line.id !== R.line && !(S.also || []).some(function (l) { return l.id === R.line; })) return;
        var bd = Infinity, bs = 0;
        for (var i = 0; i < R.pts.length; i++) {
          var d = Math.hypot(R.pts[i].x - S.x, R.pts[i].y - S.y);
          if (d < bd) { bd = d; bs = R.pts[i].s; }
        }
        if (bd < 60 * S.k) R.stops.push(bs);
      });
      R.stops.sort(function (a, b) { return a - b; });
    });

    // ——— ขบวนรถ: แบบรถจริงรายสาย (bkk-train-models.js) · instanced ต่อ แบบรถ × ชนิดตู้ × LOD
    //     ชนิดตู้: head (ไฟหน้า) · tail (หันกลับ ไฟท้ายแดง) · mid · midP (มีแพนโทกราฟ)
    var TMS = window.BKK_TRAIN_MODELS, fleet = TMS.create(T, H.theme());
    var trains = [], trainMeshes = {}, lays = {}, cap = {};
    tracks.forEach(function (R) {
      if (R.yard || R.len < 600) return;
      var lay = lays[R.line] || (lays[R.line] = TMS.layout(R.line));
      if (!lay) return;
      var count = Math.max(1, Math.floor(R.len / 3500));     // ~1 ขบวนต่อ 3.5 กม.
      for (var t = 0; t < count; t++) {
        var s0 = R.len * (t + 0.5) / count;
        trains.push({ R: R, lay: lay, s: s0, v: TRAIN_SPEED, dwell: 0, si: nextStopIdx(R, s0) });
        lay.types.forEach(function (ty) { var key = lay.spec + "|" + ty; cap[key] = (cap[key] || 0) + 1; });
      }
    });
    Object.keys(cap).forEach(function (key) {
      var sp = key.split("|"), n = cap[key], m = [];
      for (var lod = 0; lod < 2; lod++) {
        var im = new T.InstancedMesh(fleet.geometry(sp[0], sp[1], lod), fleet.material(sp[0]), n);
        im.instanceMatrix.setUsage(T.DynamicDrawUsage);
        im.frustumCulled = false;
        im.matrixAutoUpdate = false;
        im.count = 0;
        im.visible = false;
        group.add(im);
        m.push(im);
      }
      trainMeshes[key] = { m: m, cap: n, used: [0, 0] };
    });
    fleet.textures.forEach(function (tx) {
      var r = H.renderer();
      if (r) tx.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
      texList.push(tx);
    });

    model = { tracks: tracks, chunks: pickChunks, piers: pierMeshes, pierCount: piers.length,
      stations: stations, stGroup: stGroup, stDetail: stDetail,
      walkGroup: walkGroup, walkCount: walkCount,
      trains: trains, trainMeshes: trainMeshes, fleet: fleet, ocs: ocs, twinRuns: twinRuns.length, twinCount: twinCount, t0: performance.now() };
    setTrainsVisible(trainsOn);
    H.ready();
    H.repaint();
  }

  /* ---------------------------------------------------- ขยับขบวนรถทุกเฟรม */
  function nextStopIdx(R, s) {
    for (var i = 0; i < R.stops.length; i++) if (R.stops[i] > s + 30) return i;
    return -1;
  }

  // จุดบนราง ณ ระยะ s (ม.) → o.x o.y (หน่วยฉาก) o.h (ม.) o.k
  function sampleTrack(R, s, o) {
    var P = R.pts, lo = 0, hi = P.length - 1;
    while (lo < hi - 1) { var mid = (lo + hi) >> 1; if (P[mid].s < s) lo = mid; else hi = mid; }
    var a = P[lo], b = P[lo + 1], f = b.s > a.s ? Math.max(0, Math.min(1, (s - a.s) / (b.s - a.s))) : 0;
    o.x = a.x + (b.x - a.x) * f; o.y = a.y + (b.y - a.y) * f; o.h = a.h + (b.h - a.h) * f; o.k = a.k;
  }

  var _m4 = null, _fa = { x: 0, y: 0, h: 0, k: 1 }, _fb = { x: 0, y: 0, h: 0, k: 1 };
  function updateTrains(dt, z) {
    if (!model || !trainsOn) return;
    if (!_m4) _m4 = new T.Matrix4();
    var mm = model.trainMeshes, key;
    for (key in mm) { mm[key].used[0] = 0; mm[key].used[1] = 0; }
    // LOD: รายละเอียดเต็มเฉพาะซูมใกล้ และตู้ที่อยู่ใกล้กล้องไม่เกิน TRAIN_LOD_REACH × ระยะกล้อง→กลางจอ
    var E = z >= TRAIN_LOD_ZOOM ? H.eye() : null, reach2 = 0;
    if (E) {
      var cen = map.getCenter(), cl = H.toLocal(cen.lng, cen.lat);
      reach2 = Math.pow(Math.hypot(E.x - cl.x, E.y - cl.y, E.z) * TRAIN_LOD_REACH, 2);
    }
    model.trains.forEach(function (tr) {
      var R = tr.R, lay = tr.lay;
      // จอดรับ-ส่งที่สถานี: ชะลอเข้าชานชาลา หยุดนิ่ง แล้วออกตัว (กึ่งกลางขบวนตรงกลางชานชาลา)
      if (tr.dwell > 0) {
        tr.dwell -= dt;
        tr.v = 0;
        if (tr.dwell <= 0) tr.si = tr.si >= 0 && tr.si + 1 < R.stops.length ? tr.si + 1 : -1;
      } else {
        var target = TRAIN_SPEED;
        if (tr.si >= 0) {
          var goal = R.stops[tr.si] + lay.off[lay.cars - 1] / 2;
          var d = goal - tr.s;
          if (d <= 0.6) { tr.s = goal; tr.v = 0; tr.dwell = DWELL; }
          else target = Math.min(TRAIN_SPEED, Math.sqrt(2 * TRAIN_ACC * d));
        }
        if (tr.dwell <= 0) {
          tr.v += (target > tr.v ? 1 : -1) * TRAIN_ACC * dt;
          tr.v = Math.max(0, Math.min(TRAIN_SPEED, tr.v));
          tr.s += tr.v * dt;
        }
      }
      if (tr.s > R.len + lay.len) { tr.s = 0; tr.v = TRAIN_SPEED; tr.dwell = 0; tr.si = nextStopIdx(R, 0); }
      for (var c = 0; c < lay.cars; c++) {
        var sc = tr.s - lay.off[c], half = lay.lens[c] / 2;
        if (sc - half < 0 || sc + half > R.len) continue;
        // ตัวรถวางบนจุดโบกี้หน้า-หลัง → เลี้ยวโค้ง/ขึ้นลงเนินตามรางจริง (ปลายตู้ยื่นออกนอกโค้งแบบรถจริง)
        var bb = half * 0.68;
        sampleTrack(R, sc + bb, _fa);
        sampleTrack(R, sc - bb, _fb);
        var k = _fa.k, fx = _fa.x - _fb.x, fy = _fa.y - _fb.y, fz = (_fa.h - _fb.h) * k;
        var fl = Math.hypot(fx, fy, fz) || 1;
        fx /= fl; fy /= fl; fz /= fl;
        if (lay.types[c] === "tail") { fx = -fx; fy = -fy; fz = -fz; }   // ตู้ท้ายหันหัวกลับ
        var lx = -fy, ly = fx, ll = Math.hypot(lx, ly) || 1;               // ซ้าย = ขึ้นฟ้า × หน้า
        lx /= ll; ly /= ll;
        var ux = -fz * ly, uy = fz * lx, uz = fx * ly - fy * lx;           // บน = หน้า × ซ้าย
        var px = (_fa.x + _fb.x) / 2, py = (_fa.y + _fb.y) / 2, pz = ((_fa.h + _fb.h) / 2 + lay.rail) * k;
        var lod = E && (Math.pow(px - E.x, 2) + Math.pow(py - E.y, 2) + Math.pow(pz - E.z, 2) < reach2) ? 0 : 1;
        var M = mm[lay.spec + "|" + lay.types[c]];
        if (!M || M.used[lod] >= M.cap) continue;
        _m4.set(fx * k, lx * k, ux * k, px,
                fy * k, ly * k, uy * k, py,
                fz * k, 0, uz * k, pz,
                0, 0, 0, 1);
        M.m[lod].setMatrixAt(M.used[lod]++, _m4);
      }
    });
    for (key in mm) {
      var M = mm[key];
      for (var l = 0; l < 2; l++) {
        M.m[l].count = M.used[l];
        M.m[l].visible = M.used[l] > 0;
        M.m[l].instanceMatrix.needsUpdate = true;
      }
    }
  }
  function setTrainsVisible(on) {
    if (!model) return;
    Object.keys(model.trainMeshes).forEach(function (key) {
      var M = model.trainMeshes[key];
      for (var l = 0; l < 2; l++) M.m[l].visible = on && M.used[l] > 0;
    });
  }

  /* ------------------------------------------------- ซ่อนชั้น 2D ที่ซ้ำกัน */
  var BASE_LAYERS = ["transit-casing", "transit-line", "station-wall-osm", "station-roof-osm",
    "station-wall-generated", "station-roof-generated"];
  function hideBaseLayers(hide) {
    if (!map || hide === baseLayersHidden) return;
    BASE_LAYERS.forEach(function (id) {
      if (!map.getLayer(id)) return;
      if (hide) {
        savedVis[id] = map.getLayoutProperty(id, "visibility") || "visible";
        map.setLayoutProperty(id, "visibility", "none");
      } else {
        map.setLayoutProperty(id, "visibility", savedVis[id] || "visible");
      }
    });
    baseLayersHidden = hide;
  }

  function updateBaseVis() {
    if (!map) return;
    hideBaseLayers(visible && !!model && map.getZoom() >= H.minZoom);
  }

  /* ---------------------------------------------------------- คลิก/ชี้ */
  var _a, _b, _c, _hit;
  function pick(ray) {
    if (!model) return null;
    if (!_a) { _a = new T.Vector3(); _b = new T.Vector3(); _c = new T.Vector3(); _hit = new T.Vector3(); }
    var best = null, bestD = Infinity;
    function test(pos, idx, i0, i1, payload) {
      for (var i = i0; i < i1; i += 3) {
        var ia = idx[i] * 3, ib = idx[i + 1] * 3, ic = idx[i + 2] * 3;
        _a.set(pos[ia], pos[ia + 1], pos[ia + 2]);
        _b.set(pos[ib], pos[ib + 1], pos[ib + 2]);
        _c.set(pos[ic], pos[ic + 1], pos[ic + 2]);
        if (ray.intersectTriangle(_a, _b, _c, false, _hit)) {
          var d = _hit.distanceTo(ray.origin);
          if (d < bestD) { bestD = d; best = payload; best.px = _hit.x; best.py = _hit.y; }
        }
      }
    }
    for (var c = 0; c < model.chunks.length; c++) {
      var ch = model.chunks[c];
      if (!ray.intersectsSphere(ch.sphere)) continue;
      for (var t = 0; t < ch.tracks.length; t++) {
        var R = ch.tracks[t];
        if (!R.box || !ray.intersectsBox(R.box)) continue;
        test(ch.pos, ch.idx, R.span.c0, R.span.c1, { type: "track", R: R });
      }
    }
    // สถานี: กล่องตามแนวสถานี (หมุนตามราง) — ให้ชนะรางเมื่ออยู่ใกล้กว่า
    for (var i2 = 0; i2 < model.stations.length; i2++) {
      var S = model.stations[i2];
      if (!S.box || !ray.intersectsBox(S.box)) continue;
      var d2 = rayStation(ray, S);
      if (d2 != null && d2 < bestD) { bestD = d2; best = { type: "station", S: S }; }
    }
    return best ? { dist: bestD, hit: best } : null;
  }
  // เรย์ชนกล่องของสถานีในกรอบสถานี (slab test) → ระยะตามเรย์ในหน่วยของฉาก
  function rayStation(ray, S) {
    var k = S.k, ox = ray.origin.x - S.x, oy = ray.origin.y - S.y, dx = ray.direction.x, dy = ray.direction.y;
    var o = [(ox * S.ux + oy * S.uy) / k, (-ox * S.uy + oy * S.ux) / k, ray.origin.z / k];
    var d = [(dx * S.ux + dy * S.uy) / k, (-dx * S.uy + dy * S.ux) / k, ray.direction.z / k];
    var lo = [-S.tEnd, Math.min(S.o0, S.do0) - 1.5, 0], hi = [S.tEnd, Math.max(S.o1, S.do1) + 1.5, S.roofTop];
    var tmin = 0, tmax = Infinity;
    for (var a = 0; a < 3; a++) {
      if (Math.abs(d[a]) < 1e-12) { if (o[a] < lo[a] || o[a] > hi[a]) return null; continue; }
      var t1 = (lo[a] - o[a]) / d[a], t2 = (hi[a] - o[a]) / d[a];
      if (t1 > t2) { var tt = t1; t1 = t2; t2 = tt; }
      if (t1 > tmin) tmin = t1;
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return null;
    }
    return tmin;
  }

  function highlightFor(hit) {
    var B = new Builder(), mat;
    if (hit.type === "track") {
      var R = hit.R, P = R.pts;
      // สายหนึ่งอาจยาวหลายสิบกิโล — ไฮไลต์เฉพาะ ±500 ม. รอบจุดที่คลิก ไม่งั้นทั้งสายเรืองหมด
      var near = hit.px != null && R.len > 2500 ? 500 : Infinity;
      for (var i = 0; i < P.length - 1; i++) {
        var a = P[i], b = P[i + 1], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
        if (L < 0.01) continue;
        if (near < Infinity && Math.hypot(a.x - hit.px, a.y - hit.py) > near) continue;
        var k = a.k, z = (a.h + b.h) / 2 * k;
        B.box((a.x + b.x) / 2, (a.y + b.y) / 2, z - 2.3 * k, z + 1.2 * k, L, (R.mono ? 1.6 : 5.4) * k, dx / L, dy / L);
      }
    } else {
      // วาดตัวอาคารสถานีซ้ำเป็นรูปทรงเดียว (ชั้นชานชาลา หลังคา ชั้นขายตั๋ว) ไม่ใช่กล่องครอบ จะได้ไม่บังตัวสถานี
      var S0 = hit.S, SB = new MB();
      emitStation({ conc: SB, paint: SB, roof: SB, glass: SB, louvre: SB }, S0);
      var gs = new T.BufferGeometry();
      gs.setAttribute("position", new T.Float32BufferAttribute(SB.p, 3));
      gs.setIndex(new T.BufferAttribute(new Uint32Array(SB.i), 1));
      var ms = new T.Mesh(gs, hoverMat);
      ms.matrixAutoUpdate = false;
      ms.renderOrder = 5;
      return ms;
    }
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(B.p, 3));
    g.setIndex(B.i);
    var m = new T.Mesh(g, hoverMat);
    m.matrixAutoUpdate = false;
    m.renderOrder = 5;
    return m;
  }
  function keyOf(hit) { return hit ? (hit.type === "track" ? "t" + hit.R.idx : "s" + hit.S.st.code + hit.S.line.id + (hit.S.twin ? "b" : "")) : null; }
  function setHover(hit) {
    var k = keyOf(hit);
    if (k === hoverKey) return;
    hoverKey = k;
    if (hoverMesh) { group.remove(hoverMesh); hoverMesh.geometry.dispose(); hoverMesh = null; }
    if (hit && k !== selKey) { hoverMesh = highlightFor(hit); group.add(hoverMesh); }
    H.repaint();
  }
  function setSelected(hit) {
    selKey = keyOf(hit);
    if (selMesh) { group.remove(selMesh); selMesh.geometry.dispose(); selMesh = null; }
    if (hoverMesh) { group.remove(hoverMesh); hoverMesh.geometry.dispose(); hoverMesh = null; hoverKey = null; }
    if (hit) { selMesh = highlightFor(hit); selMesh.material = selMat; group.add(selMesh); }
    H.repaint();
  }

  /* --------------------------------------------------------------- UI */
  function setChipState(s) {
    var chip = $("#chipRail3D");
    if (!chip) return;
    var cnt = chip.querySelector(".chip-count");
    if (s === "loading") cnt.textContent = "…";
    else if (s === "error") { cnt.textContent = "!"; chip.title = "โหลดชั้นรถไฟฟ้า 3 มิติไม่สำเร็จ"; }
    else if (s === "ready" && D) cnt.textContent = fmt(D.km) + " กม.";
  }
  function syncButtons() {
    var chip = $("#chipRail3D"), btn = $("#btnRail3DToggle"), tb = $("#btnRailTrains");
    if (chip) chip.classList.toggle("active", visible);
    if (btn) btn.classList.toggle("active", visible);
    if (tb) { tb.classList.toggle("active", trainsOn && visible); tb.style.display = visible ? "" : "none"; }
  }
  function setVisible(v) {
    visible = v;
    lsSet(LS_KEY, v ? "1" : "0");
    syncButtons();
    if (group) group.visible = v;
    if (!v) {
      H.show(MOD_ID, false);
      H.setAnim(MOD_ID, false);
      hideBaseLayers(false);
      closeCard();
      setHover(null);
      return;
    }
    if (failed) { failed = false; loading = null; }
    ensureLoaded().then(function () {
      H.show(MOD_ID, true);
      updateBaseVis();
      if (map.getZoom() < H.minZoom) map.easeTo({ zoom: 13.8, pitch: Math.max(map.getPitch(), 50), duration: 900 });
    });
  }
  function setTrains(on) {
    trainsOn = on;
    lsSet(LS_TRAIN, on ? "1" : "0");
    syncButtons();
    setTrainsVisible(on);
    H.setAnim(MOD_ID, on && map.getZoom() >= TRAIN_ZOOM);
    H.repaint();
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    var bar = $(".filter-bar");
    if (bar && !$("#chipRail3D")) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.id = "chipRail3D";
      chip.title = "รางรถไฟฟ้ายกระดับ สถานี และขบวนรถ แบบ 3 มิติ (กดเพื่อเปิด/ปิด)";
      chip.innerHTML = '<span>' + ico("train-front") + ' รถไฟฟ้า 3 มิติ</span><span class="chip-count">–</span>';
      chip.addEventListener("click", function () { setVisible(!visible); });
      bar.insertBefore(chip, $("#btnThemeToggle") || null);
    }
    var menu = $("#leftMenu");
    if (menu && !$("#btnRail3DToggle")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "menu-btn";
      btn.id = "btnRail3DToggle";
      btn.title = "เปิด/ปิดรางรถไฟฟ้าและสถานี 3 มิติ";
      btn.innerHTML = '<span>' + ico("train-front") + '</span><span class="label-text"> รถไฟฟ้า 3 มิติ</span>';
      btn.addEventListener("click", function () { setVisible(!visible); });
      menu.appendChild(btn);
      var tb = document.createElement("button");
      tb.type = "button";
      tb.className = "menu-btn";
      tb.id = "btnRailTrains";
      tb.title = "เปิด/ปิดขบวนรถวิ่ง (ซูมเข้าระดับ 13 ขึ้นไปจึงเห็น)";
      tb.innerHTML = '<span>' + ico("play") + '</span><span class="label-text"> ขบวนรถวิ่ง</span>';
      tb.addEventListener("click", function () { setTrains(!trainsOn); });
      menu.appendChild(tb);
    }
    if (!$("#rlvCard")) {
      var card = document.createElement("div");
      card.id = "rlvCard";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-label", "ข้อมูลรถไฟฟ้า");
      // ใช้สไตล์การ์ดชุดเดียวกับชั้นทางยกระดับ (.elv-* จาก bkk-elevated.js)
      card.className = "";
      ($(".stage") || document.body).appendChild(card);
      var st = document.createElement("style");
      st.textContent = "#rlvCard{position:absolute;right:14px;top:14px;width:330px;max-width:calc(100% - 28px);z-index:40;" +
        "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.28);" +
        "backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:var(--text-main);font-size:12.5px;line-height:1.5;display:none}" +
        "#rlvCard.open{display:block;animation:elvIn .22s ease}" +
        ".rlv-dot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:5px;vertical-align:-1px}" +
        ".rlv-codes{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0 2px}" +
        ".rlv-code{font-size:10.5px;font-weight:800;color:#fff;padding:2px 7px;border-radius:6px}";
      document.head.appendChild(st);
    }
    syncButtons();
  }

  function lineOfId(id) {
    var raw = (window.BKK_TRANSIT && window.BKK_TRANSIT.rawLines || []).filter(function (l) { return l.id === id; })[0];
    return raw || { name: (D.lines[id] || {}).name || id, color: (D.lines[id] || {}).color || "#888", stations: [] };
  }
  // สองสถานีที่ใกล้จุดที่คลิกที่สุดของสายนั้น (ใช้สถานีที่สแนปเข้าแนวรางแล้ว)
  function nearestStations(R, px, py) {
    if (!model || px == null) return [];
    var list = model.stations.filter(function (S) { return S.line.id === R.line || (S.also || []).some(function (l) { return l.id === R.line; }); });
    list.sort(function (a, b) { return Math.hypot(a.x - px, a.y - py) - Math.hypot(b.x - px, b.y - py); });
    return list.slice(0, 2).map(function (S) { return S.st; });
  }

  function showCard(hit) {
    var card = $("#rlvCard");
    if (!card) return;
    var html;
    if (hit.type === "station") {
      var S = hit.S, line = S.line;
      var lines = [line].concat((S.also || []));
      var inter = (S.st.interchange || []).map(function (id) { return lineOfId(id); });
      var acc = S.shareWith || S, nEsc = acc.stairs.filter(function (s) { return s.esc; }).length;
      var plat = S.levels.map(function (lv) { return lv.plats.some(function (p) { return p.island; }) ? "เกาะกลาง" : "ด้านข้าง"; });
      var floors = S.levels.map(function (lv) { return fmt(lv.floor); }).join(" / ");
      var accTxt = acc.hub ? "อาคารสถานีระดับพื้น" :
        (acc.stairs.length - nEsc) + " บันได" + (nEsc ? " · " + nEsc + " บันไดเลื่อน" : "") + (acc.lifts.length ? " · " + acc.lifts.length + " ลิฟต์" : "");
      var srcTxt = [S.src.pn ? "ความยาวชานชาลา" : "", S.src.f ? "ขนาดอาคาร" : "", S.src.pa ? "การจัดชานชาลา" : "",
        acc.stairs.some(function (s) { return s.osm; }) ? "ตำแหน่งบันได/ทางออก" : ""].filter(Boolean);
      html =
        '<div class="elv-head">' +
          '<div class="elv-type">' + ico("train-front") + ' สถานี' + (S.mono ? 'โมโนเรล' : 'รถไฟฟ้า') + '</div>' +
          '<h3 class="elv-name">' + esc(S.st.name) + '</h3>' +
          '<p class="elv-sub">' + esc(S.st.nameEn || "") + '</p>' +
          '<button type="button" class="elv-x" aria-label="ปิด">×</button>' +
        '</div>' +
        '<div class="elv-body">' +
          '<div class="rlv-codes">' + lines.map(function (l) {
            return '<span class="rlv-code" style="background:' + esc(l.color) + '">' + esc(S.st.code) + '</span>' +
              '<span class="elv-tag"><span class="rlv-dot" style="background:' + esc(l.color) + '"></span>' + esc(l.name) + '</span>';
          }).join("") + '</div>' +
          '<div class="elv-grid">' +
            '<div class="elv-cell"><div class="elv-k">ระดับชานชาลา (ประมาณ)</div><div class="elv-v">' + floors + '<small>ม.</small></div></div>' +
            '<div class="elv-cell"><div class="elv-k">ความยาวสถานี</div><div class="elv-v">' + fmt(S.L) + '<small>ม.</small></div></div>' +
          '</div>' +
          '<div class="elv-row"><b>ชานชาลา</b><span>' + (S.levels.length > 1 ? S.levels.length + " ชั้นซ้อนกัน · " : "") + plat.join(" / ") + '</span></div>' +
          (S.noConc ? '' : '<div class="elv-row"><b>ชั้นขายตั๋ว</b><span>' + (S.hub ? 'ชั้นล่างของอาคาร' : 'ระดับ ~' + fmt(S.conc) + ' ม.') + ' · ยาว ' + fmt(S.Lc) + ' ม.</span></div>') +
          '<div class="elv-row"><b>ทางขึ้น-ลง</b><span>' + accTxt + '</span></div>' +
          (S.shareWith ? '<div class="elv-row"><b>สถานีร่วม</b><span>ชานชาลาชุดนี้อยู่ชั้นบน ใช้ชั้นขายตั๋วร่วมกับชานชาลาด้านล่าง</span></div>' :
            S.crossWith ? '<div class="elv-row"><b>สถานีร่วม</b><span>มีชานชาลาอีกชุดข้ามอยู่ด้านบน</span></div>' : '') +
          (inter.length ? '<div class="elv-row"><b>เปลี่ยนสาย</b><span>' + inter.map(function (l) {
            return '<span class="rlv-dot" style="background:' + esc(l.color) + '"></span>' + esc(l.name);
          }).join(" · ") + '</span></div>' : '') +
          '<div class="elv-actions"><button type="button" class="elv-btn primary" data-act="fly">' + ico("map-pin") + ' บินไปดู</button></div>' +
          '<p class="elv-note">แบบจำลองตามแบบสถานีของ ' + esc(S.style.name) + ' วางบนพิกัดและแนวรางจริง' +
            (srcTxt.length ? ' · ' + srcTxt.join(" · ") + ' จาก OpenStreetMap' :' · ขนาดเป็นค่ามาตรฐานของสาย (OSM ยังไม่มีข้อมูลสถานีนี้)') +
            ' — ไม่ใช่แบบสถาปัตยกรรมจริงของสถานีนั้น</p>' +
        '</div>';
    } else {
      var R = hit.R, L = lineOfId(R.line), near = nearestStations(R, hit.px, hit.py);
      html =
        '<div class="elv-head">' +
          '<div class="elv-type">' + ico("train-front") + ' ' + (R.mono ? 'รางโมโนเรลยกระดับ' : 'ทางวิ่งรถไฟฟ้ายกระดับ') + '</div>' +
          '<h3 class="elv-name"><span class="rlv-dot" style="background:' + esc(L.color) + '"></span>' + esc(L.name) + '</h3>' +
          (L.nameEn ? '<p class="elv-sub">' + esc(L.nameEn) + '</p>' : '') +
          '<button type="button" class="elv-x" aria-label="ปิด">×</button>' +
        '</div>' +
        '<div class="elv-body">' +
          '<div class="elv-grid">' +
            '<div class="elv-cell"><div class="elv-k">ระดับราง (ประมาณ)</div><div class="elv-v">' + (R.hmin < R.hmax - 2 ? fmt(R.hmin) + "–" + fmt(R.hmax) : fmt(R.hmax)) + '<small>ม.</small></div></div>' +
            '<div class="elv-cell"><div class="elv-k">ความยาวช่วงนี้</div><div class="elv-v">' + (R.len >= 1000 ? fmt(R.len / 1000, 1) + '<small>กม.</small>' : fmt(R.len) + '<small>ม.</small>') + '</div></div>' +
          '</div>' +
          '<div class="elv-tags">' +
            '<span class="elv-tag">' + (R.mono ? 'โมโนเรล (คานเดี่ยว)' : 'รางคู่มาตรฐาน 1.435 ม.') + '</span>' +
            (R.yard ? '<span class="elv-tag">ทางเข้าศูนย์ซ่อมบำรุง</span>' : '') +
            '<span class="elv-tag">ชั้น (layer) ' + R.rec.L + '</span>' +
          '</div>' +
          (near.length ? '<div class="elv-row"><b>ช่วงสถานี</b><span>' + near.map(function (s) { return esc(s.name) + (s.code ? " (" + esc(s.code) + ")" : ""); }).join(" – ") + '</span></div>' : '') +
          '<div class="elv-actions">' +
            '<button type="button" class="elv-btn primary" data-act="fly">' + ico("map-pin") + ' บินไปดู</button>' +
            '<a class="elv-btn" href="https://www.openstreetmap.org/way/' + R.rec.i + '" target="_blank" rel="noopener">' + ico("map") + ' ดูใน OSM</a>' +
          '</div>' +
          '<p class="elv-note">ระดับรางเป็นค่าประมาณรายสาย ปรับตามจุดตัดกับทางด่วน/รางสายอื่น ไม่ใช่ค่าที่วัดจริง · แนวเส้นทาง © OpenStreetMap contributors ' + esc(D.date) + '</p>' +
        '</div>';
    }
    card.innerHTML = html;
    card.classList.add("open");
    card.querySelector(".elv-x").addEventListener("click", closeCard);
    var fly = card.querySelector('[data-act="fly"]');
    if (fly) fly.addEventListener("click", function () { flyTo(hit); });
  }
  function closeCard() {
    var card = $("#rlvCard");
    if (card) card.classList.remove("open");
    if (selKey && group) setSelected(null);
  }
  function flyTo(hit) {
    if (hit.type === "station") {
      var S = hit.S, ll = H.toLngLat(S.x, S.y);
      map.flyTo({ center: ll, zoom: 16.8, pitch: 66, bearing: Math.atan2(S.ux, S.uy) * 180 / Math.PI + 55, duration: 1500 });
    } else {
      var R = hit.R;
      var sw = H.toLngLat(R.box.min.x, R.box.min.y), ne = H.toLngLat(R.box.max.x, R.box.max.y);
      var cam = map.cameraForBounds([sw, ne], { padding: 80 });
      var mid = R.pts[R.pts.length >> 1], nx = R.pts[Math.min(R.pts.length - 1, (R.pts.length >> 1) + 1)];
      map.flyTo({ center: cam ? cam.center : H.toLngLat(mid.x, mid.y), zoom: Math.min(cam ? cam.zoom : 16, 16.4),
        pitch: 64, bearing: Math.atan2(nx.x - mid.x, nx.y - mid.y) * 180 / Math.PI + 55, duration: 1600 });
    }
  }

  /* -------------------------------------------------------------- mount */
  function mount(m) {
    map = m;
    H = window.BKK_3D;
    if (!H) { console.warn("bkk-rail3d: ต้องโหลด bkk-3d-host.js ก่อน"); return; }
    H.attach(m);
    if (lsGet(LS_KEY) === "0") visible = false;
    if (lsGet(LS_TRAIN) === "0") trainsOn = false;
    baseLayersHidden = false;          // style ใหม่ = ชั้นเดิมกลับมาแสดงเอง
    buildUI();
    // ซ่อนเส้นรถไฟฟ้า 2 มิติกับกล่องสถานีเดิมเฉพาะตอนที่ชั้น 3 มิติแสดงอยู่จริง (ซูมออกไกล ๆ ยังต้องเห็นเส้น)
    // ⚠ อย่าเรียกใน render loop — setLayoutProperty ระหว่างวาดทำให้วนซ้ำ
    if (!mount._zoomBound) {
      mount._zoomBound = true;
      map.on("zoomend", updateBaseVis);
      map.on("moveend", updateBaseVis);
    }
    updateBaseVis();
    if (!visible) return;
    var go = function () { ensureLoaded().then(function () { H.show(MOD_ID, true); }); };
    if (loading) go();
    else if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 3500 });
    else setTimeout(go, 1200);
  }

  window.BKK_RAIL3D = {
    mount: mount,
    setVisible: setVisible,
    setTrains: setTrains,
    debug: function () {
      return {
        loaded: !!model, visible: visible, trains: trainsOn,
        tracks: model ? model.tracks.length : 0, stations: model ? model.stations.length : 0,
        piers: model ? model.pierCount : 0, trainCount: model ? model.trains.length : 0,
        ocsMasts: model && model.ocs ? model.ocs.count : 0,
        walks: model ? model.walkCount : 0,
        stairs: model ? model.stations.reduce(function (s, S) { return s + S.stairs.length; }, 0) : 0,
        lifts: model ? model.stations.reduce(function (s, S) { return s + S.lifts.length; }, 0) : 0,
        stacked: model ? model.stations.filter(function (S) { return S.levels.length > 1; }).map(function (S) { return S.st.name; }) : [],
        crossings: model ? model.stations.filter(function (S) { return S.shareWith; }).map(function (S) { return S.st.name + "/" + S.shareWith.st.name; }) : [],
        dwelling: model ? model.trains.filter(function (t) { return t.dwell > 0; }).length : 0
      };
    },
    selectStation: function (name) {
      if (!model) return false;
      var S = model.stations.filter(function (s) { return s.st.name === name || s.st.code === name; })[0];
      if (!S) return false;
      setSelected({ type: "station", S: S });
      showCard({ type: "station", S: S });
      return true;
    },
    internals: function () { return { model: model, group: group }; }
  };

  (function register() {
    var H0 = window.BKK_3D;
    if (!H0) return;
    var last = 0;
    H0.register({
      id: MOD_ID,
      get group() { return group; },
      pick: pick,
      click: function (hit) { setSelected(hit); showCard(hit); },
      hover: function (hit) { if (group) setHover(hit); },
      clear: closeCard,
      frame: function (z) {
        if (!model) return;
        var showP = z >= PIER_ZOOM;
        if (showP !== model.pierShown) {
          model.pierShown = showP;
          for (var i = 0; i < model.piers.length; i++) model.piers[i].visible = showP;
        }
        var showS = z >= STATION_ZOOM;
        if (showS !== model.stShown) { model.stShown = showS; model.stGroup.visible = showS; }
        var showD = z >= DETAIL_ZOOM;
        if (showD !== model.detShown) { model.detShown = showD; model.stDetail.visible = showD; }
        var showW = z >= WALK_ZOOM;
        if (showW !== model.walkShown) { model.walkShown = showW; model.walkGroup.visible = showW; }
        if (model.ocs) {
          var showO = z >= OCS_ZOOM, showL = z >= WIRE_ZOOM;
          if (showO !== model.ocsShown) { model.ocsShown = showO; model.ocs.masts.visible = showO; }
          if (showL !== model.wireShown) { model.wireShown = showL; model.ocs.wires.visible = showL; }
        }
        var runTrains = trainsOn && z >= TRAIN_ZOOM;
        if (runTrains !== model.trainShown) {
          model.trainShown = runTrains;
          setTrainsVisible(runTrains);
          H.setAnim(MOD_ID, runTrains);
        }
        if (runTrains) {
          var now = performance.now();
          var dt = Math.min(0.12, (now - (last || now)) / 1000);
          last = now;
          updateTrains(dt, z);
        }
      },
      theme: function (name, pal) {
        if (!model) return;
        hoverMat.color.set(pal.glow);
        selMat.color.set(pal.glow);
        themeStationMaterials(name);
        if (model.fleet) model.fleet.setTheme(name);
        if (matWire) matWire.color.set(WIRE_COLOR[name] || WIRE_COLOR.dark);
      },
      // ลายผิวคมขึ้นเมื่อมองเฉียง (anisotropic) — ตั้งได้เมื่อมี renderer แล้ว
      rendererReady: function (r) {
        var a = Math.min(8, r.capabilities.getMaxAnisotropy());
        texList.forEach(function (t) { t.anisotropy = a; t.needsUpdate = true; });
      }
    });
  })();
})();
