/**
 * bkk-elevated.js
 * ชั้น "ทางด่วน & ทางยกระดับ 3 มิติ" ของ bkk-city.html — วาดในฉากกลาง bkk-3d-host.js (three.js)
 *
 * - ข้อมูล: bkk-elevated-data.js (window.BKK_ELEVATED) สร้างจาก OSM ด้วย _geo/build-bkk-elevated.js
 * - three.js + ไฟล์ข้อมูลโหลดทีหลัง (lazy) เฉพาะตอนเปิดชั้น
 * - รูปทรง: พื้นทาง (ยางมะตอย + เส้นจราจร) · กำแพงกันตก · คานใต้พื้น · ตอม่อรูปตัว T ทุก ~30 ม.
 *   ช่วงที่ต่ำกว่า 3.2 ม. วาดเป็นทางลาดทึบแบบกำแพงกันดิน
 * - ความสูงเป็นค่าประมาณจากแท็ก layer ของ OSM — ดูหมายเหตุในไฟล์ข้อมูล
 */
(function () {
  "use strict";

  var DATA_URL = "bkk-elevated-data.js";
  var MOD_ID = "elevated";
  var LS_KEY = "bkk-elevated-on";
  var PIER_ZOOM = 12.6;        // ตอม่อเริ่มเห็นตั้งแต่ระดับนี้
  var SOLID_H = 3.2;           // ต่ำกว่านี้ = ทางลาดทึบถึงพื้น
  var PARAPET = 1.0, PARA_T = 0.4;
  var DASH = 12;               // คาบเส้นประ (ม.)
  var CHUNK_M = 3900;          // แบ่งโมเดลเป็นก้อนละ ~3.9 กม. ให้ตัดส่วนที่อยู่นอกจอได้

  var CLASS_TH = {
    motorway: "ทางหลวงพิเศษ / ทางด่วน", motorway_link: "ทางขึ้น-ลงทางด่วน",
    trunk: "ทางหลวงสายหลัก", trunk_link: "ทางเชื่อมทางหลวง",
    primary: "ถนนสายหลัก", primary_link: "ทางเชื่อมถนนสายหลัก",
    secondary: "ถนนสายรอง", secondary_link: "ทางเชื่อมถนนสายรอง",
    tertiary: "ถนนสายย่อย", tertiary_link: "ทางเชื่อมถนนสายย่อย"
  };
  var ROAD_PAL = {
    dark:   { asphalt: "#2a3039", white: "rgba(226,232,240,.92)", yellow: "#e0b43a" },
    light:  { asphalt: "#555c67", white: "rgba(255,255,255,.95)", yellow: "#f2c230" },
    sunset: { asphalt: "#4b4142", white: "rgba(255,244,236,.94)", yellow: "#f5b642" }
  };
  // ช่วงที่ยังก่อสร้าง (OSM highway=construction) — คอนกรีตโทนส้มงานก่อสร้าง พื้นทางยังไม่ลาดยาง/ตีเส้น
  var UC_PAL = {
    dark:   { body: "#cf7a3e", top: "#7a4a2a" },
    light:  { body: "#e8914a", top: "#b07448" },
    sunset: { body: "#e0622c", top: "#8a4630" }
  };

  var H = null;                 // BKK_3D
  var T = null, D = null, map = null;
  var visible = true, loading = null, failed = false;
  var group = null, model = null, topMats = {}, hoverMat = null, selMat = null, cableMat = null;
  var ucMat = null, ucTopMat = null;
  var hoverIdx = -1, selIdx = -1, hoverMesh = null, selMesh = null;
  var uiBuilt = false;

  function $(s, r) { return (r || document).querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(v, d) { return Number(v).toLocaleString("th-TH", { maximumFractionDigits: d || 0 }); }
  // แท็ก opening_date ของ OSM (2026-12-05 / 2026-12 / 2026) → "5 ธ.ค. 2569"
  var TH_MON = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  function thDate(s) {
    var m = /^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/.exec(s || "");
    if (!m) return s;
    return (m[3] ? +m[3] + " " : "") + (m[2] ? TH_MON[+m[2] - 1] + " " : "") + (+m[1] + 543);
  }
  function lsGet() { try { return localStorage.getItem(LS_KEY); } catch (e) { return null; } }
  function lsSet(v) { try { localStorage.setItem(LS_KEY, v); } catch (e) {} }
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
      window.BKK_ELEVATED ? Promise.resolve() : loadScript(DATA_URL)
    ]).then(function () {
      T = H.THREE(); D = window.BKK_ELEVATED;
      if (!T || !D) throw new Error("THREE/BKK_ELEVATED missing");
      buildModel();
      setChipState("ready");
    }).catch(function (e) {
      failed = true;
      console.warn("elevated 3D:", e);
      setChipState("error");
    });
    return loading;
  }

  /* ----------------------------------------------------------------- วัสดุ */
  function laneTexture(lanes, oneway, pal) {
    var W = 256, HH = 64;
    var c = document.createElement("canvas");
    c.width = W; c.height = HH;
    var g = c.getContext("2d");
    g.fillStyle = pal.asphalt;
    g.fillRect(0, 0, W, HH);
    var seed = 7;               // เม็ดหินจาง ๆ ให้ผิวไม่แบน
    for (var i = 0; i < 900; i++) {
      seed = (seed * 16807) % 2147483647;
      var x = seed % W; seed = (seed * 16807) % 2147483647;
      var y = seed % HH;
      g.fillStyle = i % 2 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.08)";
      g.fillRect(x, y, 1, 1);
    }
    var lw = Math.max(3, Math.round(W / lanes * 0.045));
    // ขอบซ้าย (ขอบทาง) ขาวทึบ · ขอบขวา (ฝั่งเกาะกลาง) เหลืองทึบสำหรับทางเดินรถทางเดียว
    g.fillStyle = pal.white;
    g.fillRect(2, 0, lw, HH);
    g.fillStyle = oneway ? pal.yellow : pal.white;
    g.fillRect(W - 2 - lw, 0, lw, HH);
    for (var l = 1; l < lanes; l++) {
      var cx = Math.round(W * l / lanes - lw / 2);
      if (!oneway && l * 2 === lanes) {          // ถนนสองทาง: เส้นแบ่งกลางเหลืองคู่
        g.fillStyle = pal.yellow;
        g.fillRect(cx - lw, 0, lw, HH);
        g.fillRect(cx + lw, 0, lw, HH);
      } else {
        g.fillStyle = pal.white;
        g.fillRect(cx, 0, lw, Math.round(HH * 0.3));
      }
    }
    var tex = new T.CanvasTexture(c);
    tex.wrapS = T.ClampToEdgeWrapping;
    tex.wrapT = T.RepeatWrapping;
    tex.anisotropy = 8;
    return tex;
  }
  function topMat(key) {
    if (topMats[key]) return topMats[key];
    var p = key.split("|");
    topMats[key] = new T.MeshPhongMaterial({
      map: laneTexture(+p[0], p[1] === "1", ROAD_PAL[H.theme()]),
      flatShading: true, shininess: 0, specular: 0x000000, side: T.DoubleSide
    });
    return topMats[key];
  }

  /* ------------------------------------------------------------ สร้างรูปทรง */
  function decodeRoad(rec, idx) {
    var p = rec.p, pts = [], X = 0, Y = 0, HH = 0;
    for (var i = 0; i < p.length; i += 3) {
      X += p[i]; Y += p[i + 1]; HH += p[i + 2];
      var lon = X / 1e6, lat = Y / 1e6, q = H.toLocal(lon, lat);
      q.h = HH / 10; q.k = H.kAt(lat);
      var last = pts[pts.length - 1];
      if (last && Math.hypot(q.x - last.x, q.y - last.y) < 0.05) continue;
      pts.push(q);
    }
    if (pts.length < 2) return null;
    // ซอยทางลาดให้ถี่ + แทรกจุดตรงที่ความสูงข้ามเกณฑ์ทางลาดทึบ
    var out = [pts[0]];
    function lerp(a, b, f) { return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, h: a.h + (b.h - a.h) * f, k: a.k + (b.k - a.k) * f }; }
    for (i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      var dm = Math.hypot(b.x - a.x, b.y - a.y) / a.k;
      var m = Math.abs(b.h - a.h) > 0.3 && dm > 16 ? Math.ceil(dm / 15) : 1;
      for (var j = 1; j <= m; j++) {
        var q2 = j === m ? b : lerp(a, b, j / m);
        var prev = out[out.length - 1];
        if ((prev.h - SOLID_H) * (q2.h - SOLID_H) < 0) {
          var cut = lerp(prev, q2, (SOLID_H - prev.h) / (q2.h - prev.h));
          cut.h = SOLID_H;
          out.push(cut);
        }
        out.push(q2);
      }
    }
    var s = 0, hmax = 0, hmin = Infinity;
    for (i = 0; i < out.length; i++) {
      if (i) s += Math.hypot(out[i].x - out[i - 1].x, out[i].y - out[i - 1].y) / out[i].k;
      out[i].s = s;
      hmax = Math.max(hmax, out[i].h); hmin = Math.min(hmin, out[i].h);
    }
    var cls = D.classes[rec.c] || "";
    return {
      idx: idx, rec: rec, pts: out, len: s, hmax: hmax, hmin: hmin, cls: cls,
      width: rec.w, lanes: Math.max(1, Math.min(8, rec.l || 1)), oneway: !!rec.o,
      thick: /^motorway/.test(cls) ? 2.2 : /_link$/.test(cls) ? 1.6 : /^(trunk|primary)$/.test(cls) ? 1.8 : 1.5,
      bias: (idx % 4) * 0.06     // กันพื้นทางคู่ขนานที่ซ้อนกันกะพริบ (z-fighting)
    };
  }

  function Builder() { this.cp = []; this.ci = []; this.tp = []; this.tu = []; this.tg = {}; }
  Builder.prototype.v = function (x, y, z) { this.cp.push(x, y, z); return this.cp.length / 3 - 1; };
  Builder.prototype.q = function (a, b, c, d) { this.ci.push(a, b, c, a, c, d); };
  Builder.prototype.tv = function (x, y, z, u, v) { this.tp.push(x, y, z); this.tu.push(u, v); return this.tp.length / 3 - 1; };

  // วาดถนน 1 เส้นลง builder · คืนช่วง index ที่ใช้ (สำหรับคลิกเลือก)
  function emitRoad(B, R, inflate) {
    var P = R.pts, n = P.length, halfW = R.width / 2 + (inflate || 0), key = R.lanes + "|" + (R.oneway ? 1 : 0);
    var lift = inflate ? 0.12 : 0;
    var c0 = B.ci.length;
    if (!B.tg[key]) B.tg[key] = [];
    var tIdx = B.tg[key], t0 = tIdx.length;
    var solid = [];
    for (var i = 0; i < n - 1; i++) solid[i] = P[i].h <= SOLID_H + 1e-6 && P[i + 1].h <= SOLID_H + 1e-6;
    var st = [];
    for (i = 0; i < n; i++) {
      var p = P[i], tx, ty, L;
      var d1x = 0, d1y = 0, d0x = 0, d0y = 0;
      if (i < n - 1) { d1x = P[i + 1].x - p.x; d1y = P[i + 1].y - p.y; L = Math.hypot(d1x, d1y) || 1; d1x /= L; d1y /= L; }
      if (i > 0) { d0x = p.x - P[i - 1].x; d0y = p.y - P[i - 1].y; L = Math.hypot(d0x, d0y) || 1; d0x /= L; d0y /= L; }
      if (i === 0) { tx = d1x; ty = d1y; }
      else if (i === n - 1) { tx = d0x; ty = d0y; }
      else { tx = d0x + d1x; ty = d0y + d1y; L = Math.hypot(tx, ty); if (L < 1e-3) { tx = d1x; ty = d1y; } else { tx /= L; ty /= L; } }
      var nx = -ty, ny = tx;
      var ref = i < n - 1 ? (-d1y * nx + d1x * ny) : (-d0y * nx + d0x * ny);
      var mit = 1 / Math.max(0.4, Math.abs(ref));
      var k = p.k;
      var ho = halfW * k * mit, hi = (halfW - PARA_T) * k * mit;
      var zTop = (p.h + R.bias + lift) * k, zPar = zTop + PARAPET * k, zBot = Math.max(0, p.h - R.thick - lift) * k;
      var Lx = p.x + nx * ho, Ly = p.y + ny * ho, Rx = p.x - nx * ho, Ry = p.y - ny * ho;
      var lx = p.x + nx * hi, ly = p.y + ny * hi, rx = p.x - nx * hi, ry = p.y - ny * hi;
      var r = { o: B.v(Lx, Ly, zBot) };
      B.v(Lx, Ly, zPar); B.v(lx, ly, zPar); B.v(lx, ly, zTop);
      B.v(rx, ry, zTop); B.v(rx, ry, zPar); B.v(Rx, Ry, zPar); B.v(Rx, Ry, zBot);
      if ((i > 0 && solid[i - 1]) || (i < n - 1 && solid[i])) { r.g = B.v(Lx, Ly, 0); B.v(Rx, Ry, 0); }
      if (i === 0 || i === n - 1) { r.e = B.v(Lx, Ly, zTop); B.v(Rx, Ry, zTop); }
      r.t = B.tv(lx, ly, zTop, 0, p.s / DASH);
      B.tv(rx, ry, zTop, 1, p.s / DASH);
      st.push(r);
    }
    for (i = 0; i < n - 1; i++) {
      var a = st[i], b = st[i + 1], o = a.o, O = b.o, sd = solid[i];
      var aL = sd ? a.g : o, bL = sd ? b.g : O, aR = sd ? a.g + 1 : o + 7, bR = sd ? b.g + 1 : O + 7;
      B.q(aL, bL, O + 1, o + 1);          // ผนังนอกซ้าย
      B.q(o + 1, O + 1, O + 2, o + 2);    // สันกำแพงกันตกซ้าย
      B.q(o + 2, O + 2, O + 3, o + 3);    // ผนังในซ้าย
      B.q(o + 4, O + 4, O + 5, o + 5);    // ผนังในขวา
      B.q(o + 5, O + 5, O + 6, o + 6);    // สันขวา
      B.q(o + 6, O + 6, bR, aR);          // ผนังนอกขวา
      if (!sd) B.q(o + 7, O + 7, O, o);   // ท้องคาน
      tIdx.push(a.t, b.t, b.t + 1, a.t, b.t + 1, a.t + 1);
      if (i > 0 && solid[i] !== solid[i - 1]) B.q(a.g, a.g + 1, o + 7, o);   // หน้าตัดตรงที่ทางลาดทึบจบ
    }
    [0, n - 1].forEach(function (j) {
      var r = st[j], sd = j === 0 ? solid[0] : solid[n - 2];
      var bl = sd ? r.g : r.o, br = sd ? r.g + 1 : r.o + 7;
      B.q(bl, br, r.e + 1, r.e);                 // หน้าตัดปลายพื้นทาง
      B.q(r.e, r.o + 3, r.o + 2, r.o + 1);       // ปลายกำแพงซ้าย
      B.q(r.o + 4, r.e + 1, r.o + 6, r.o + 5);   // ปลายกำแพงขวา
    });
    return { c0: c0, c1: B.ci.length, key: key, t0: t0, t1: tIdx.length };
  }

  // เงานุ่มบนพื้นใต้ทางยกระดับ (เลื่อนตามทิศแดดตามความสูง) — วัสดุเงากลางของ host ใช้ร่วมกับชั้นรถไฟฟ้า
  function emitShadow(SH, R) {
    var P = R.pts;
    for (var i = 0; i < P.length - 1; i++) {
      var a = P[i], b = P[i + 1];
      if (a.h < 1.5 && b.h < 1.5) continue;
      var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      if (L < 0.01) continue;
      var k = a.k, hw = (R.width / 2 + 2.2) * k, qx = -dy / L * hw, qy = dx / L * hw;
      var sa = H.sunShift(a.h * 0.3), sb = H.sunShift(b.h * 0.3), z = 0.12 * k, s = SH.p.length / 3;
      SH.p.push(a.x + sa[0] * k + qx, a.y + sa[1] * k + qy, z, b.x + sb[0] * k + qx, b.y + sb[1] * k + qy, z,
                b.x + sb[0] * k - qx, b.y + sb[1] * k - qy, z, a.x + sa[0] * k - qx, a.y + sa[1] * k - qy, z);
      SH.uv.push(0, 0, 0, 1, 1, 1, 1, 0);
      SH.i.push(s, s + 1, s + 2, s, s + 2, s + 3);
    }
  }

  // ตอม่อ: ทุก ~30 ม. ตามแนวทาง (ข้ามแม่น้ำ 80 ม.) รวมตอม่อของทางคู่ขนานให้เป็นตัวเดียว
  function collectPiers(R, grid, list) {
    var SP = R.rec.x >= 0 && /^แม่น้ำ/.test(D.strings[R.rec.x] || "") ? 80 : 30, P = R.pts;
    if (R.len < 20) return;
    var s = SP / 2, i = 0;
    while (s < R.len - 6) {
      while (i < P.length - 2 && P[i + 1].s < s) i++;
      var a = P[i], b = P[i + 1];
      var f = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0;
      var h = a.h + (b.h - a.h) * f;
      var top = h - R.thick;
      if (top > 1.4 && !(a.h <= SOLID_H && b.h <= SOLID_H)) {
        var x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f, k = a.k;
        var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
        dx /= L; dy /= L;
        var cx = Math.floor(x / 20), cy = Math.floor(y / 20), merged = false;
        for (var gx = cx - 1; gx <= cx + 1 && !merged; gx++) {
          for (var gy = cy - 1; gy <= cy + 1 && !merged; gy++) {
            var cell = grid[gx + ":" + gy];
            if (!cell) continue;
            for (var c = 0; c < cell.length; c++) {
              var q = cell[c];
              if (q.m || Math.abs(q.top - top) > 3 || Math.abs(q.dx * dx + q.dy * dy) < 0.9) continue;
              var ddx = x - q.x, ddy = y - q.y, dist = Math.hypot(ddx, ddy);
              if (dist > 18 * k) continue;
              if (Math.abs(ddx * q.dx + ddy * q.dy) > 6 * k) continue;   // ต้องอยู่ข้างกัน ไม่ใช่หน้า-หลัง
              q.span = dist / k + (q.span + R.width) / 2;
              q.x = (q.x + x) / 2; q.y = (q.y + y) / 2;
              q.top = Math.min(q.top, top);
              q.uc = q.uc && !!R.rec.u;          // ตอม่อร่วมกับทางที่เปิดแล้ว = สีคอนกรีตปกติ
              q.m = true; merged = true;
              break;
            }
          }
        }
        if (!merged) {
          var pier = { x: x, y: y, top: top, k: k, dx: dx, dy: dy, span: R.width, m: false, uc: !!R.rec.u };
          var key = cx + ":" + cy;
          (grid[key] = grid[key] || []).push(pier);
          list.push(pier);
        }
      }
      s += SP;
    }
  }

  /* ---------------------------------------------------------- สะพานขึง */
  // กล่องสอบ: ฐานกลาง c0 ขนาด s0 (ตามแนว, ขวางแนว) → ยอด c1 ขนาด s1
  function taperBox(B, c0, s0, c1, s1, ux, uy) {
    var px = -uy, py = ux, b = B.cp.length / 3;
    function ring(c, s) {
      var hx = s[0] / 2, hy = s[1] / 2;
      var q = [[-hx, -hy], [hx, -hy], [hx, hy], [-hx, hy]];
      for (var i = 0; i < 4; i++) B.v(c[0] + ux * q[i][0] + px * q[i][1], c[1] + uy * q[i][0] + py * q[i][1], c[2]);
    }
    ring(c0, s0); ring(c1, s1);
    B.q(b, b + 1, b + 2, b + 3);
    B.q(b + 4, b + 5, b + 6, b + 7);
    for (var i = 0; i < 4; i++) B.q(b + i, b + (i + 1) % 4, b + 4 + (i + 1) % 4, b + 4 + i);
  }
  // จุดบนพื้นทางที่ระยะ s (ตามความยาวสะสม)
  function ptAt(R, s) {
    var P = R.pts;
    if (s <= 0) return P[0];
    if (s >= R.len) return P[P.length - 1];
    var lo = 0, hi = P.length - 1;
    while (lo < hi - 1) { var mid = (lo + hi) >> 1; if (P[mid].s < s) lo = mid; else hi = mid; }
    var a = P[lo], b = P[lo + 1], f = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, h: a.h + (b.h - a.h) * f, k: a.k };
  }
  function buildCableStayed(R, B, cable) {
    var rec = R.rec, py = rec.py || [];
    if (!py.length) return;
    var halfW = (rec.pw || R.width) / 2;
    var pts = py.map(function (o) {
      var q = H.toLocal(o[0] / 1e6, o[1] / 1e6);
      var bi = 0, bd = Infinity;
      for (var i = 0; i < R.pts.length; i++) {
        var d = Math.hypot(R.pts[i].x - q.x, R.pts[i].y - q.y);
        if (d < bd) { bd = d; bi = i; }
      }
      return { i: bi, p: R.pts[bi] };
    });
    var span = py.length > 1 ? Math.abs(pts[1].p.s - pts[0].p.s) : 300;
    var single = py.length === 1;
    var TH = single ? span * 0.35 : Math.max(40, Math.min(100, span * 0.16));
    pts.forEach(function (o) {
      var P = R.pts, i = o.i, p = o.p, k = p.k;
      var d = dirOf(P, i), ux = d[0], uy = d[1], nx = -uy, ny = ux;
      var deckZ = p.h * k, topZ = (p.h + TH) * k;
      var off = (halfW + 2.6) * k;
      if (single) {
        // เสาต้นเดียวทรงตัว Y คว่ำ (แบบสะพานพระราม 8) — ขาสองข้างมาบรรจบใต้ยอด แล้วเป็นเสาเดี่ยวขึ้นไป
        var joinZ = deckZ + TH * 0.22 * k;
        [-1, 1].forEach(function (sg) {
          taperBox(B, [p.x + nx * off * sg, p.y + ny * off * sg, 0], [5.5 * k, 4.5 * k],
            [p.x, p.y, joinZ], [4 * k, 4 * k], ux, uy);
        });
        taperBox(B, [p.x, p.y, joinZ], [4 * k, 4 * k], [p.x, p.y, topZ], [2.2 * k, 2.2 * k], ux, uy);
      } else {
        // เสาคู่ขนาบพื้นทาง + คานขวางบนยอด
        [-1, 1].forEach(function (sg) {
          var bx = p.x + nx * off * 1.25 * sg, by = p.y + ny * off * 1.25 * sg;
          taperBox(B, [bx, by, 0], [6 * k, 5 * k], [p.x + nx * off * sg, p.y + ny * off * sg, topZ], [3 * k, 3 * k], ux, uy);
        });
        taperBox(B, [p.x, p.y, topZ - 3.4 * k], [3 * k, (off * 2 + 3 * k)], [p.x, p.y, topZ], [3 * k, off * 2 + 3 * k], ux, uy);
        taperBox(B, [p.x, p.y, deckZ - 4 * k], [3.4 * k, off * 2 + 3 * k], [p.x, p.y, deckZ - 1.2 * k], [3.4 * k, off * 2 + 3 * k], ux, uy);
      }
      // สายเคเบิล: จากช่วงบนของเสา ไปยึดพื้นทางทั้งสองฝั่ง
      var n = 9;
      for (var c = 1; c <= n; c++) {
        var f = c / n;
        var az = deckZ + TH * (0.42 + 0.56 * f) * k;
        [1, -1].forEach(function (way) {
          var reach = (way > 0 ? 0.46 : single ? 0.3 : 0.4) * span;
          var q = ptAt(R, p.s + way * (12 + f * reach));
          var qd = dirOf(R.pts, 0);
          [-1, 1].forEach(function (sg) {
            if (single && sg < 0) return;                 // เสาต้นเดียว = ระนาบสายเดียวกลางสะพาน
            var ao = single ? 0 : off * sg, do_ = single ? 0 : (halfW - 0.8) * sg;
            cable.push(p.x + nx * ao, p.y + ny * ao, az,
              q.x + nx * do_, q.y + ny * do_, (q.h + 1.1) * q.k);
          });
        });
      }
    });
  }
  function dirOf(P, i) {
    var a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    return [dx / L, dy / L];
  }

  function buildModel() {
    var pal = H.palette();
    group = new T.Group();
    group.visible = visible;
    H.scene().add(group);
    hoverMat = new T.MeshBasicMaterial({ color: pal.glow, transparent: true, opacity: 0.28, depthWrite: false,
      side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
    selMat = new T.MeshBasicMaterial({ color: pal.glow, transparent: true, opacity: 0.55, depthWrite: false,
      side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
    var ucp = UC_PAL[H.theme()] || UC_PAL.dark;
    ucMat = new T.MeshPhongMaterial({ color: ucp.body, flatShading: true, shininess: 0, specular: 0x000000, side: T.DoubleSide });
    ucTopMat = new T.MeshPhongMaterial({ color: ucp.top, flatShading: true, shininess: 0, specular: 0x000000, side: T.DoubleSide });

    var chunks = {}, roads = [], grid = {}, piers = [];
    D.roads.forEach(function (rec, idx) {
      var R = decodeRoad(rec, idx);
      if (!R) { roads.push(null); return; }
      var mid = R.pts[R.pts.length >> 1];
      // ช่วงก่อสร้างแยกก้อนของตัวเอง → ใช้วัสดุสีส้มทั้งก้อน (คลิกเลือกยังไล่ตามก้อนเหมือนเดิม)
      var ck = Math.floor(mid.x / CHUNK_M) + ":" + Math.floor(mid.y / CHUNK_M) + (rec.u ? ":uc" : "");
      var ch = chunks[ck] || (chunks[ck] = { B: new Builder(), SH: { p: [], uv: [], i: [] }, roads: [], uc: !!rec.u });
      R.span = emitRoad(ch.B, R, 0);
      if (H.shadowMaterial) emitShadow(ch.SH, R);
      ch.roads.push(R);
      roads.push(R);
      collectPiers(R, grid, piers);
    });

    var list = [];
    Object.keys(chunks).forEach(function (ck) {
      var ch = chunks[ck], B = ch.B;
      var g = new T.BufferGeometry();
      g.setAttribute("position", new T.Float32BufferAttribute(B.cp, 3));
      g.setIndex(new T.BufferAttribute(new Uint32Array(B.ci), 1));
      g.computeBoundingSphere();
      var mesh = new T.Mesh(g, ch.uc ? ucMat : H.concrete());
      mesh.matrixAutoUpdate = false;
      group.add(mesh);

      var keys = Object.keys(B.tg).sort(), idx = [], mlist = [], offs = {};
      var tg = new T.BufferGeometry();
      tg.setAttribute("position", new T.Float32BufferAttribute(B.tp, 3));
      tg.setAttribute("uv", new T.Float32BufferAttribute(B.tu, 2));
      keys.forEach(function (k, mi) {
        var src = B.tg[k];
        offs[k] = idx.length;
        tg.addGroup(idx.length, src.length, mi);
        for (var i = 0; i < src.length; i++) idx.push(src[i]);
        mlist.push(ch.uc ? ucTopMat : topMat(k));
      });
      tg.setIndex(new T.BufferAttribute(new Uint32Array(idx), 1));
      tg.computeBoundingSphere();
      var tmesh = new T.Mesh(tg, mlist);
      tmesh.matrixAutoUpdate = false;
      group.add(tmesh);

      if (ch.SH.i.length) {
        var sg = new T.BufferGeometry();
        sg.setAttribute("position", new T.Float32BufferAttribute(ch.SH.p, 3));
        sg.setAttribute("uv", new T.Float32BufferAttribute(ch.SH.uv, 2));
        sg.setIndex(new T.BufferAttribute(new Uint32Array(ch.SH.i), 1));
        sg.computeBoundingSphere();
        var sm = new T.Mesh(sg, H.shadowMaterial("strip"));
        sm.matrixAutoUpdate = false;
        group.add(sm);
      }
      ch.SH = null;

      var cp = g.attributes.position.array, ci = g.index.array;
      ch.roads.forEach(function (R) {
        var x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
        for (var i = R.span.c0; i < R.span.c1; i++) {
          var v = ci[i] * 3, x = cp[v], y = cp[v + 1], z = cp[v + 2];
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
          if (z < z0) z0 = z; if (z > z1) z1 = z;
        }
        R.box = new T.Box3(new T.Vector3(x0, y0, z0), new T.Vector3(x1, y1, z1));
        R.tr = [offs[R.span.key] + R.span.t0, offs[R.span.key] + R.span.t1];
      });
      list.push({ sphere: g.boundingSphere, cPos: cp, cIdx: ci,
        tPos: tg.attributes.position.array, tIdx: tg.index.array, roads: ch.roads });
      ch.B = null;
    });

    // ตอม่อ = เสา + คานหัวเสา (instanced) แยกเป็นก้อนตามพื้นที่ ไม่งั้น three วาดตอม่อทั้งกรุงเทพฯ ทุกเฟรม
    // (r128 ยังไม่คำนวณขอบเขตของ InstancedMesh ให้เอง — ต้องตั้ง boundingSphere ของก้อนเอง)
    var box = new T.BoxGeometry(1, 1, 1);
    box.translate(0, 0, 0.5);
    var head = H.headGeometry();     // หัวเสาบานออกรับพื้นทาง (แทนคานกล่องทื่อ ๆ แบบเดิม)
    var CAPH = 2.6;
    var byCell = {};
    piers.forEach(function (p) {
      var key = Math.floor(p.x / CHUNK_M) + ":" + Math.floor(p.y / CHUNK_M) + (p.uc ? ":uc" : "");
      (byCell[key] = byCell[key] || []).push(p);
    });
    var m4 = new T.Matrix4(), q = new T.Quaternion(), pos = new T.Vector3(), scl = new T.Vector3(), zAxis = new T.Vector3(0, 0, 1);
    var pierMeshes = [];
    Object.keys(byCell).forEach(function (key) {
      var ps = byCell[key], pmat = ps[0].uc ? ucMat : H.concrete();
      var cols = new T.InstancedMesh(box.clone(), pmat, ps.length);
      var caps = new T.InstancedMesh(head.clone(), pmat, ps.length);
      var cx = 0, cy = 0, cz = 0, rad = 0;
      ps.forEach(function (p, i) {
        var capH = Math.min(CAPH, Math.max(1.2, p.top * 0.45));
        var k = p.k, colH = Math.max(0.3, p.top - capH);
        q.setFromAxisAngle(zAxis, Math.atan2(p.dy, p.dx));
        pos.set(p.x, p.y, 0);
        scl.set(1.9 * k, Math.min(6, 2.4 + p.span * 0.08) * k, colH * k);
        cols.setMatrixAt(i, m4.compose(pos, q, scl));
        pos.set(p.x, p.y, colH * k);
        scl.set(2.6 * k, Math.max(3, p.span - 0.4) * k, capH * k);
        caps.setMatrixAt(i, m4.compose(pos, q, scl));
        cx += p.x; cy += p.y; cz += p.top * k / 2;
      });
      cx /= ps.length; cy /= ps.length; cz /= ps.length;
      ps.forEach(function (p) { rad = Math.max(rad, Math.hypot(p.x - cx, p.y - cy, p.top * p.k - cz) + p.span * p.k); });
      var sphere = new T.Sphere(new T.Vector3(cx, cy, cz), rad + 8);
      [cols, caps].forEach(function (mesh) {
        mesh.instanceMatrix.needsUpdate = true;
        mesh.geometry.boundingSphere = sphere;
        mesh.frustumCulled = true;   // InstancedMesh ของ r128 ปิด culling มาให้ ต้องเปิดเองหลังตั้ง boundingSphere
        mesh.matrixAutoUpdate = false;
        group.add(mesh);
        pierMeshes.push(mesh);
      });
    });

    // สะพานขึง (พระราม 8 · พระราม 9 · กาญจนาภิเษก · ทศมราชัน) — เสาและสายเคเบิล
    var BP = new Builder(), cable = [], csCount = 0;
    D.roads.forEach(function (rec, idx) {
      if (!rec.cs || !roads[idx]) return;
      csCount++;
      buildCableStayed(roads[idx], BP, cable);
    });
    if (BP.cp.length) {
      var pg = new T.BufferGeometry();
      pg.setAttribute("position", new T.Float32BufferAttribute(BP.cp, 3));
      pg.setIndex(new T.BufferAttribute(new Uint32Array(BP.ci), 1));
      pg.computeBoundingSphere();
      var pm = new T.Mesh(pg, H.concrete());
      pm.matrixAutoUpdate = false;
      group.add(pm);
      var cg = new T.BufferGeometry();
      cg.setAttribute("position", new T.Float32BufferAttribute(cable, 3));
      cg.computeBoundingSphere();
      cableMat = new T.LineBasicMaterial({ color: H.theme() === "light" ? "#8a93a0" : "#c9d3e0", transparent: true, opacity: 0.85 });
      var cl = new T.LineSegments(cg, cableMat);
      cl.matrixAutoUpdate = false;
      group.add(cl);
    }

    model = { chunks: list, roads: roads, piers: pierMeshes, pierCount: piers.length, cableBridges: csCount };
    H.ready();
    H.repaint();
  }

  /* ---------------------------------------------------------- คลิก/ชี้ */
  var _a, _b, _c, _hit;
  function pick(ray) {
    if (!model) return null;
    if (!_a) { _a = new T.Vector3(); _b = new T.Vector3(); _c = new T.Vector3(); _hit = new T.Vector3(); }
    var best = null, bestD = Infinity;
    function test(pos, idx, i0, i1, R) {
      for (var i = i0; i < i1; i += 3) {
        var ia = idx[i] * 3, ib = idx[i + 1] * 3, ic = idx[i + 2] * 3;
        _a.set(pos[ia], pos[ia + 1], pos[ia + 2]);
        _b.set(pos[ib], pos[ib + 1], pos[ib + 2]);
        _c.set(pos[ic], pos[ic + 1], pos[ic + 2]);
        if (ray.intersectTriangle(_a, _b, _c, false, _hit)) {
          var d = _hit.distanceTo(ray.origin);
          if (d < bestD) { bestD = d; best = R; }
        }
      }
    }
    for (var c = 0; c < model.chunks.length; c++) {
      var ch = model.chunks[c];
      if (!ray.intersectsSphere(ch.sphere)) continue;
      for (var r = 0; r < ch.roads.length; r++) {
        var R = ch.roads[r];
        if (!ray.intersectsBox(R.box)) continue;
        test(ch.cPos, ch.cIdx, R.span.c0, R.span.c1, R);
        test(ch.tPos, ch.tIdx, R.tr[0], R.tr[1], R);
      }
    }
    return best ? { dist: bestD, hit: best } : null;
  }

  function highlightMesh(R, mat) {
    var B = new Builder();
    emitRoad(B, R, 0.35);
    var idx = B.ci.slice(), base = B.cp.length / 3;
    var pos = B.cp.concat(B.tp);
    Object.keys(B.tg).forEach(function (k) { B.tg[k].forEach(function (v) { idx.push(v + base); }); });
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    var m = new T.Mesh(g, mat);
    m.matrixAutoUpdate = false;
    m.renderOrder = 5;
    return m;
  }
  function setHover(R) {
    var i = R ? R.idx : -1;
    if (i === hoverIdx) return;
    hoverIdx = i;
    if (hoverMesh) { group.remove(hoverMesh); hoverMesh.geometry.dispose(); hoverMesh = null; }
    if (R && i !== selIdx) { hoverMesh = highlightMesh(R, hoverMat); group.add(hoverMesh); }
    H.repaint();
  }
  function setSelected(R) {
    selIdx = R ? R.idx : -1;
    if (selMesh) { group.remove(selMesh); selMesh.geometry.dispose(); selMesh = null; }
    if (hoverMesh && R && hoverIdx === R.idx) { group.remove(hoverMesh); hoverMesh.geometry.dispose(); hoverMesh = null; }
    if (R) { selMesh = highlightMesh(R, selMat); group.add(selMesh); }
    H.repaint();
  }

  /* --------------------------------------------------------------- UI */
  function injectCSS() {
    if ($("#elvStyle")) return;
    var css = document.createElement("style");
    css.id = "elvStyle";
    css.textContent = [
      "#elvCard{position:absolute;right:14px;top:14px;width:330px;max-width:calc(100% - 28px);z-index:40;",
      "  background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;",
      "  box-shadow:0 14px 40px rgba(0,0,0,.28);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
      "  color:var(--text-main);font-size:12.5px;line-height:1.5;display:none}",
      "#elvCard.open{display:block;animation:elvIn .22s ease}",
      "@keyframes elvIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}",
      ".elv-head{padding:14px 44px 10px 16px;border-bottom:1px solid var(--card-border)}",
      ".elv-type{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:800;letter-spacing:.02em;",
      "  color:var(--accent);background:var(--accent-soft);padding:2px 8px;border-radius:999px;margin-bottom:6px}",
      ".elv-name{margin:0;font-size:15.5px;font-weight:800;line-height:1.35}",
      ".elv-sub{margin:2px 0 0;font-size:11.5px;color:var(--text-sub)}",
      ".elv-x{position:absolute;top:10px;right:10px;width:28px;height:28px;border:0;border-radius:8px;cursor:pointer;",
      "  background:var(--accent-soft);color:var(--text-main);font-size:17px;line-height:1}",
      ".elv-body{padding:12px 16px 14px}",
      ".elv-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px}",
      ".elv-cell{border:1px solid var(--card-border);border-radius:9px;padding:7px 9px}",
      ".elv-k{font-size:10.5px;font-weight:700;color:var(--text-sub)}",
      ".elv-v{font-size:15px;font-weight:800}",
      ".elv-v small{font-size:10.5px;font-weight:600;color:var(--text-muted);margin-left:3px}",
      ".elv-tags{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}",
      ".elv-tag{font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:6px;border:1px solid var(--card-border);color:var(--text-muted)}",
      ".elv-row{display:flex;gap:6px;margin-bottom:4px;font-size:12px}",
      ".elv-row b{flex:none;color:var(--text-sub);font-weight:700;min-width:74px}",
      ".elv-note{margin:10px 0 0;font-size:10.5px;color:var(--text-muted);line-height:1.5}",
      ".elv-actions{display:flex;gap:6px;margin-top:10px}",
      ".elv-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:7px 10px;border-radius:9px;",
      "  border:1px solid var(--card-border);background:none;color:var(--text-main);font:inherit;font-size:12px;font-weight:700;cursor:pointer;text-decoration:none}",
      ".elv-btn.primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}",
      "#chipElevated .chip-count{min-width:3.2em;text-align:center}"
    ].join("\n");
    document.head.appendChild(css);
  }

  function setChipState(s) {
    var chip = $("#chipElevated");
    if (!chip) return;
    var cnt = chip.querySelector(".chip-count");
    if (s === "loading") cnt.textContent = "…";
    else if (s === "error") { cnt.textContent = "!"; chip.title = "โหลดชั้นทางยกระดับ 3 มิติไม่สำเร็จ (ต้องต่ออินเทอร์เน็ตเพื่อโหลด three.js)"; }
    else if (s === "ready" && D) cnt.textContent = fmt(D.km) + " กม.";
  }
  function syncButtons() {
    var chip = $("#chipElevated"), btn = $("#btnElevatedToggle");
    if (chip) chip.classList.toggle("active", visible);
    if (btn) btn.classList.toggle("active", visible);
  }
  function setVisible(v) {
    visible = v;
    lsSet(v ? "1" : "0");
    syncButtons();
    if (group) group.visible = v;
    if (!v) { H.show(MOD_ID, false); closeCard(); setHover(null); return; }
    if (failed) { failed = false; loading = null; }
    ensureLoaded().then(function () {
      H.show(MOD_ID, true);
      if (map.getZoom() < H.minZoom) map.easeTo({ zoom: 13.6, pitch: Math.max(map.getPitch(), 50), duration: 900 });
    });
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    injectCSS();
    var menu = $("#leftMenu");
    if (menu && !$("#btnElevatedToggle")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "menu-btn";
      btn.id = "btnElevatedToggle";
      btn.title = "เปิด/ปิดทางด่วนและทางยกระดับ 3 มิติ";
      btn.innerHTML = '<span>' + ico("car") + '</span><span class="label-text"> ทางยกระดับ</span>';
      btn.addEventListener("click", function () { setVisible(!visible); });
      menu.appendChild(btn);
    }
    if (!$("#elvCard")) {
      var card = document.createElement("div");
      card.id = "elvCard";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-label", "ข้อมูลทางยกระดับ");
      ($(".stage") || document.body).appendChild(card);
    }
    syncButtons();
  }

  function name0(R) { return (R.rec.x >= 0 ? D.strings[R.rec.x] : "") || ""; }   // ชื่อแม่น้ำ/คลองที่ข้าม
  function typeLabel(R) {
    var name = D.strings[R.rec.n] || "";
    if (R.rec.x >= 0 && /^แม่น้ำ/.test(name0(R))) return "สะพานข้ามแม่น้ำ";
    if (R.cls === "motorway") {
      if (/ทางพิเศษ/.test(name)) return "ทางพิเศษ (ทางด่วน)";
      if (/ทางหลวงพิเศษ/.test(name)) return "ทางหลวงพิเศษ (มอเตอร์เวย์)";
      return "ทางยกระดับ";
    }
    if (R.cls === "motorway_link") return "ทางขึ้น-ลงทางด่วน";
    if (/_link$/.test(R.cls)) return "ทางเชื่อมยกระดับ";
    if (R.rec.x >= 0 && R.len < 900) return /^คลอง/.test(name0(R)) ? "สะพานข้ามคลอง" : "สะพานข้ามลำน้ำ";
    if (R.len < 1500) return "สะพานข้ามแยก";
    return "ถนนยกระดับ";
  }
  function operatorOf(name) {
    if (/ทางพิเศษ/.test(name)) return "การทางพิเศษแห่งประเทศไทย (กทพ.)";
    if (/อุตราภิมุข|โทลล์เวย์/.test(name)) return "ดอนเมืองโทลล์เวย์ (สัมปทานกรมทางหลวง)";
    if (/ทางหลวงพิเศษ/.test(name)) return "กรมทางหลวง";
    return "";
  }

  function showCard(R) {
    var card = $("#elvCard");
    if (!card) return;
    var rec = R.rec, S = D.strings;
    var name = S[rec.n] || "", en = S[rec.e] || "", ref = S[rec.r] || "", bname = S[rec.b] || "";
    var kind = typeLabel(R);
    // ไม่มีชื่อในข้อมูล (ทางขึ้น-ลงส่วนใหญ่) → ใช้ประเภทเป็นหัวเรื่อง ป้ายบนสุดจึงบอกระดับชั้นถนนแทน ไม่ซ้ำกัน
    var title = bname || name || (ref ? "ทางหลวงหมายเลข " + ref : kind);
    var badge = title === kind ? (CLASS_TH[R.cls] || kind) : kind;
    var sub = [bname && name ? name : "", en, ref && title.indexOf(ref) < 0 ? "หมายเลข " + ref : ""].filter(Boolean).join(" · ");
    var op = operatorOf(name);
    var ramp = R.hmin < R.hmax - 2;
    var hTxt = ramp ? fmt(R.hmin) + "–" + fmt(R.hmax) : fmt(R.hmax);
    var lenTxt = R.len >= 1000 ? fmt(R.len / 1000, 1) + "<small>กม.</small>" : fmt(R.len) + "<small>ม.</small>";
    var tags = [badge === kind ? CLASS_TH[R.cls] || R.cls : kind, "ชั้น (layer) " + rec.L,
      rec.v ? "โครงสร้างสะพานยาว (viaduct)" : "สะพาน", R.oneway ? "เดินรถทางเดียว" : "เดินรถสองทาง"];
    if (rec.t) tags.push("เก็บค่าผ่านทาง");
    if (rec.u) tags.unshift("ยังไม่เปิดใช้");
    var od = rec.u && rec.od != null ? S[rec.od] : "";
    card.innerHTML =
      '<div class="elv-head">' +
        '<div class="elv-type">' + ico("car") + " " + esc(badge) + '</div>' +
        '<h3 class="elv-name">' + esc(title) + '</h3>' +
        (sub ? '<p class="elv-sub">' + esc(sub) + '</p>' : '') +
        '<button type="button" class="elv-x" aria-label="ปิด">×</button>' +
      '</div>' +
      '<div class="elv-body">' +
        '<div class="elv-grid">' +
          '<div class="elv-cell"><div class="elv-k">ความสูงพื้นทาง (ประมาณ)</div><div class="elv-v">' + hTxt + '<small>ม.</small></div></div>' +
          '<div class="elv-cell"><div class="elv-k">ความยาวช่วงนี้</div><div class="elv-v">' + lenTxt + '</div></div>' +
          '<div class="elv-cell"><div class="elv-k">ช่องจราจร</div><div class="elv-v">' + rec.l + '<small>ช่อง</small></div></div>' +
          '<div class="elv-cell"><div class="elv-k">ความกว้างราว</div><div class="elv-v">' + fmt(rec.w) + '<small>ม.</small></div></div>' +
        '</div>' +
        '<div class="elv-tags">' + tags.map(function (t) { return '<span class="elv-tag">' + esc(t) + '</span>'; }).join("") + '</div>' +
        (rec.u ? '<div class="elv-row"><b>สถานะ</b><span>กำลังก่อสร้าง ยังไม่เปิดให้รถวิ่ง' + (od ? ' · กำหนดเปิด ' + esc(thDate(od)) : '') + '</span></div>' : '') +
        (op ? '<div class="elv-row"><b>หน่วยงาน</b><span>' + esc(op) + '</span></div>' : '') +
        (rec.s ? '<div class="elv-row"><b>จำกัดความเร็ว</b><span>' + rec.s + ' กม./ชม.</span></div>' : '') +
        (rec.x >= 0 ? '<div class="elv-row"><b>ข้าม</b><span>' + esc(S[rec.x]) + '</span></div>' : '') +
        (ramp ? '<div class="elv-row"><b>ทางลาด</b><span>ช่วงนี้ไต่ระดับระหว่าง ' + fmt(R.hmin) + ' กับ ' + fmt(R.hmax) + ' ม.</span></div>' : '') +
        '<div class="elv-actions">' +
          '<button type="button" class="elv-btn primary" data-act="fly">' + ico("map-pin") + ' บินไปดู</button>' +
          '<a class="elv-btn" href="https://www.openstreetmap.org/way/' + rec.i + '" target="_blank" rel="noopener">' + ico("map") + ' ดูใน OSM</a>' +
        '</div>' +
        '<p class="elv-note">ความสูงเป็นค่าประมาณจากลำดับชั้น (layer) ใน OpenStreetMap และความชันทางลาด 5–6.5% ไม่ใช่ค่าที่วัดจริง · ข้อมูลเส้นทาง © OpenStreetMap contributors ' + esc(D.date) + '</p>' +
      '</div>';
    card.classList.add("open");
    card.querySelector(".elv-x").addEventListener("click", closeCard);
    card.querySelector('[data-act="fly"]').addEventListener("click", function () { flyToRoad(R); });
  }
  function closeCard() {
    var card = $("#elvCard");
    if (card) card.classList.remove("open");
    if (selIdx >= 0 && group) setSelected(null);
  }
  function flyToRoad(R) {
    var sw = H.toLngLat(R.box.min.x, R.box.min.y), ne = H.toLngLat(R.box.max.x, R.box.max.y);
    var cam = map.cameraForBounds([sw, ne], { padding: 80 });
    var zoom = Math.min(cam ? cam.zoom : 16, 16.6);
    var mid = R.pts[R.pts.length >> 1], nxt = R.pts[Math.min(R.pts.length - 1, (R.pts.length >> 1) + 1)];
    var brg = Math.atan2(nxt.x - mid.x, nxt.y - mid.y) * 180 / Math.PI + 60;
    map.flyTo({ center: cam ? cam.center : H.toLngLat(mid.x, mid.y), zoom: zoom, pitch: 62, bearing: brg, duration: 1600 });
  }

  /* -------------------------------------------------------------- mount */
  function mount(m) {
    map = m;
    H = window.BKK_3D;
    if (!H) { console.warn("bkk-elevated: ต้องโหลด bkk-3d-host.js ก่อน"); return; }
    H.attach(m);
    if (lsGet() === "0") visible = false;
    buildUI();
    if (!visible) return;
    var go = function () {
      ensureLoaded().then(function () { H.show(MOD_ID, true); });
    };
    // โหลดครั้งแรก (three.js + ข้อมูล) รอให้ไทล์แผนที่โหลดเสร็จก่อน จะได้ไม่แย่งแบนด์วิดท์ตอนเปิดหน้า
    if (loading) go();
    else if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 2500 });
    else setTimeout(go, 900);
  }

  window.BKK_ELEVATED3D = {
    mount: mount,
    setVisible: setVisible,
    debug: function () {
      return {
        loaded: !!model, visible: visible, layer: !!(map && map.getLayer("bkk-3d-world")), theme: H && H.theme(),
        roads: model ? model.roads.filter(Boolean).length : 0, chunks: model ? model.chunks.length : 0,
        piers: model ? model.pierCount : 0,
        verts: model ? model.chunks.reduce(function (s, c) { return s + c.cPos.length / 3 + c.tPos.length / 3; }, 0) : 0
      };
    },
    select: function (idx) { var R = model && model.roads[idx]; if (R) { setSelected(R); showCard(R); } return !!R; },
    internals: function () { return { model: model, group: group }; }
  };

  // ลงทะเบียนกับฉากกลาง (host เรียกตอนคลิก/ชี้/สลับธีม)
  (function register() {
    var H0 = window.BKK_3D;
    if (!H0) return;
    H0.register({
      id: MOD_ID,
      get group() { return group; },
      pick: pick,
      click: function (R) { setSelected(R); showCard(R); },
      hover: function (R) { if (group) setHover(R); },
      clear: closeCard,
      frame: function (z) {
        if (!model) return;
        var show = z >= PIER_ZOOM;
        if (show !== model.pierShown) {
          model.pierShown = show;
          for (var i = 0; i < model.piers.length; i++) model.piers[i].visible = show;
        }
      },
      theme: function (name, pal) {
        if (!model) return;
        hoverMat.color.set(pal.glow);
        selMat.color.set(pal.glow);
        if (cableMat) cableMat.color.set(name === "light" ? "#8a93a0" : "#c9d3e0");
        var ucp = UC_PAL[name] || UC_PAL.dark;
        ucMat.color.set(ucp.body);
        ucTopMat.color.set(ucp.top);
        Object.keys(topMats).forEach(function (k) {
          var m = topMats[k], p = k.split("|");
          if (m.map) m.map.dispose();
          m.map = laneTexture(+p[0], p[1] === "1", ROAD_PAL[name]);
          m.needsUpdate = true;
        });
      }
    });
  })();
})();
