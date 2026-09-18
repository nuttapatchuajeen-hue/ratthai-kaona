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
 *   - สถานี: ชั้นชานชาลา + หลังคาคลุม + ชั้นจำหน่ายตั๋วด้านล่าง + บันไดลงถึงพื้น
 *   - ขบวนรถ: วิ่งไปตามรางจริง (เปิด/ปิดได้) — เปิดเมื่อซูม ≥ 13 เท่านั้น
 *
 * ⚠ ระดับรางเป็นค่าประมาณรายสาย ไม่ใช่ค่าที่วัดจริง (ดูหมายเหตุในไฟล์ข้อมูล)
 */
(function () {
  "use strict";

  var DATA_URL = "bkk-rail-data.js";
  var MOD_ID = "rail";
  var LS_KEY = "bkk-rail3d-on";
  var LS_TRAIN = "bkk-rail3d-trains";
  var PIER_ZOOM = 12.6, STATION_ZOOM = 13.2, TRAIN_ZOOM = 13, WALK_ZOOM = 14.6;
  var CHUNK_M = 3900;
  var GAUGE = 1.435;            // ความกว้างราง (ม.)
  var TRAIN_SPEED = 19;         // ม./วินาที ≈ 68 กม./ชม.
  var TRAIN_ACC = 1.0;          // อัตราเร่ง/หน่วงเวลาเข้า-ออกสถานี (ม./วินาที²)
  var DWELL = 9;                // เวลาจอดรับ-ส่งผู้โดยสาร (วินาที)
  var CAR_LEN = 20, CAR_W = 3.1, CAR_H = 3.5, CAR_GAP = 1.2;

  var H = null, T = null, D = null, map = null;
  var visible = true, trainsOn = true, loading = null, failed = false;
  var group = null, model = null, uiBuilt = false;
  var matColor = {}, matSteel = null, matDark = null, matRoof = null, hoverMat = null, selMat = null;
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
      window.BKK_RAIL ? Promise.resolve() : loadScript(DATA_URL)
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
  function emitTrack(BC, BR, BL, R) {
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
      if (!R.mono) {
        // รางเหล็กสองเส้นบนคาน + ราวขอบสีตามสาย
        var px = -uy, py = ux, off = GAUGE / 2 * k, rh = 0.18 * k;
        BR.box(mx + px * off, my + py * off, z1, z1 + rh, L, 0.12 * k, ux, uy);
        BR.box(mx - px * off, my - py * off, z1, z1 + rh, L, 0.12 * k, ux, uy);
        var eo = (gw / 2 - 0.16) * k;
        BL.box(mx + px * eo, my + py * eo, z1, z1 + 0.55 * k, L, 0.3 * k, ux, uy);
        BL.box(mx - px * eo, my - py * eo, z1, z1 + 0.55 * k, L, 0.3 * k, ux, uy);
      }
    }
    return { c0: c0, c1: BC.i.length };
  }

  // ตอม่อ: ทุก ~30 ม. · ของคู่ขนานรวมเป็นต้นเดียวคานยาว
  function collectPiers(R, grid, list) {
    var SP = 30, P = R.pts;
    if (R.len < 25) return;
    var s = SP / 2, i = 0;
    while (s < R.len - 8) {
      while (i < P.length - 2 && P[i + 1].s < s) i++;
      var a = P[i], b = P[i + 1];
      var f = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0;
      var h = a.h + (b.h - a.h) * f - (R.mono ? 1.7 : 2.0);
      if (h > 2) {
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

  /* ------------------------------------------------------------- สถานี */
  function normName(s) { return String(s || "").replace(/^สถานี\s*/, "").replace(/[\s​]/g, "").replace(/[-–—]/g, ""); }

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

    D.stations.forEach(function (rec) {
      var list = byLine[rec.l];
      if (!list) return;
      var lon = rec.o[0] / 1e6, lat = rec.o[1] / 1e6;
      var m2 = codeBy[rec.l + "|" + normName(rec.n)];
      var line = m2 ? m2.line : lineOfId(rec.l);
      var st = m2 ? m2.st : { name: rec.n, nameEn: rec.e, code: "", coords: [lon, lat] };
      (function () {
        var q = H.toLocal(lon, lat), k = H.kAt(lat);
        var best = null, bd = Infinity, bestI = 0;
        list.forEach(function (R) {
          for (var i = 0; i < R.pts.length; i++) {
            var d = Math.hypot(R.pts[i].x - q.x, R.pts[i].y - q.y);
            if (d < bd) { bd = d; best = R; bestI = i; }
          }
        });
        if (!best || bd > 140 * k) return;          // สถานีใต้ดิน/ยังไม่มีราง = ข้าม
        var p = best.pts[bestI], dir = dirAt(best.pts, bestI);
        // รางคู่ขนานของสายเดียวกัน → วางชานชาลาไว้ตรงกลางระหว่างสองราง
        var mate = null, md = Infinity;
        list.forEach(function (R2) {
          if (R2 === best) return;
          for (var i = 0; i < R2.pts.length; i++) {
            var d = Math.hypot(R2.pts[i].x - p.x, R2.pts[i].y - p.y);
            if (d < md) { md = d; mate = R2.pts[i]; }
          }
        });
        var cx = p.x, cy = p.y, sep = 0;
        if (mate && md < 26 * k) { cx = (p.x + mate.x) / 2; cy = (p.y + mate.y) / 2; sep = md / k; }
        out.push({
          st: st, line: line, mono: best.mono, x: cx, y: cy, k: k, h: p.h,
          ux: dir[0], uy: dir[1], sep: sep,
          len: best.mono ? 70 : 160,
          wide: Math.max(best.mono ? 9 : 13, sep + 11)
        });
      })();
    });
    // สถานีร่วมของหลายสายที่ตัวอาคารเดียวกัน (สยาม/หมอชิต...) วางซ้อนกันได้ แต่ถ้าจุดเกือบตรงกัน+ทิศเดียวกันให้เหลือตัวเดียว
    var kept = [];
    out.forEach(function (s) {
      for (var i = 0; i < kept.length; i++) {
        var o = kept[i];
        if (Math.hypot(o.x - s.x, o.y - s.y) < 25 * s.k && Math.abs(o.ux * s.ux + o.uy * s.uy) > 0.92) {
          o.also = o.also || [];
          o.also.push(s.line);
          return;
        }
      }
      kept.push(s);
    });
    return kept;
  }

  /* หลังคาโค้ง (พาราโบลา) คลุมตลอดความยาวชานชาลา — ผิวบน ผิวล่าง ชายคาสองข้าง และหน้าจั่วหัว-ท้าย */
  function archRoof(B, cx, cy, z0, rise, W, L, thick, ux, uy) {
    var px = -uy, py = ux, N = 10, base = B.p.length / 3;
    var hl = L / 2;
    for (var i = 0; i <= N; i++) {
      var o = -W / 2 + W * i / N;
      var t = 2 * o / W;
      var z = z0 + rise * (1 - t * t);
      for (var e = -1; e <= 1; e += 2) {          // หัว (-hl) และท้าย (+hl)
        var bx = cx + ux * hl * e + px * o, by = cy + uy * hl * e + py * o;
        B.v(bx, by, z);                            // ผิวบน
        B.v(bx, by, z - thick);                    // ผิวล่าง
      }
    }
    // เรียงจุด: i*4 + (0,1) = หัว(บน,ล่าง), (2,3) = ท้าย(บน,ล่าง)
    function id(i, j) { return base + i * 4 + j; }
    for (i = 0; i < N; i++) {
      B.q(id(i, 0), id(i, 2), id(i + 1, 2), id(i + 1, 0));       // ผิวบน
      B.q(id(i, 1), id(i, 3), id(i + 1, 3), id(i + 1, 1));       // ผิวล่าง
      B.q(id(i, 0), id(i, 1), id(i + 1, 1), id(i + 1, 0));       // หน้าจั่วหัว
      B.q(id(i, 2), id(i, 3), id(i + 1, 3), id(i + 1, 2));       // หน้าจั่วท้าย
    }
    B.q(id(0, 0), id(0, 1), id(0, 3), id(0, 2));                 // ชายคาซ้าย
    B.q(id(N, 0), id(N, 1), id(N, 3), id(N, 2));                 // ชายคาขวา
  }

  function emitStation(BS, BR2, BC2, S) {
    var k = S.k, ux = S.ux, uy = S.uy;
    var railZ = S.h * k;
    var plat = railZ + 1.15 * k;                    // พื้นชานชาลาสูงกว่าระดับราง
    var c0 = BS.i.length;
    // ชั้นชานชาลา
    BS.box(S.x, S.y, plat - 0.9 * k, plat, S.len * k, S.wide * k, ux, uy);
    // หลังคาโค้งคลุมชานชาลา + เสา
    var roofZ = plat + 4.6 * k;
    archRoof(BR2, S.x, S.y, roofZ, 1.9 * k, (S.wide + 2.8) * k, (S.len + 4) * k, 0.4 * k, ux, uy);
    var px = -uy, py = ux, eo = (S.wide / 2 - 1.2) * k;
    var nCol = Math.max(4, Math.round(S.len / 16));
    for (var c = 0; c < nCol; c++) {
      var t = (c / (nCol - 1) - 0.5) * S.len * k;
      for (var side = -1; side <= 1; side += 2) {
        BS.box(S.x + ux * t + px * eo * side, S.y + uy * t + py * eo * side, plat, roofZ, 0.55 * k, 0.55 * k, ux, uy);
      }
    }
    // ชั้นจำหน่ายตั๋ว (คอนคอร์ส) ใต้ชานชาลา + เสารับ
    var conc = Math.max(4.5 * k, railZ - 6.2 * k);
    var cl = Math.min(S.len * 0.42, 62) * k, cw = (S.wide + 5) * k;
    BC2.box(S.x, S.y, conc, conc + 1.0 * k, cl, cw, ux, uy);
    for (side = -1; side <= 1; side += 2) {
      for (var j = -1; j <= 1; j += 2) {
        BS.box(S.x + ux * cl * 0.36 * j + px * (cw / 2 - 1.2 * k) * side,
               S.y + uy * cl * 0.36 * j + py * (cw / 2 - 1.2 * k) * side, 0, conc, 1.1 * k, 1.1 * k, ux, uy);
      }
    }
    // บันได/ทางขึ้นจากพื้นถึงคอนคอร์ส (สองฝั่ง) — กล่องเอียงทำจากสี่เหลี่ยมยาว
    for (side = -1; side <= 1; side += 2) {
      var sx = S.x + ux * (cl / 2 + 7 * k) * side, sy = S.y + uy * (cl / 2 + 7 * k) * side;
      var ex = S.x + ux * (cl / 2 - 1 * k) * side, ey = S.y + uy * (cl / 2 - 1 * k) * side;
      var b = BS.p.length / 3, w = 2.6 * k, qx = px * w / 2, qy = py * w / 2;
      BS.v(sx + qx, sy + qy, 0); BS.v(sx - qx, sy - qy, 0);
      BS.v(ex - qx, ey - qy, conc); BS.v(ex + qx, ey + qy, conc);
      BS.v(sx + qx, sy + qy, 1.2 * k); BS.v(sx - qx, sy - qy, 1.2 * k);
      BS.v(ex - qx, ey - qy, conc + 1.2 * k); BS.v(ex + qx, ey + qy, conc + 1.2 * k);
      BS.q(b, b + 1, b + 2, b + 3); BS.q(b + 4, b + 5, b + 6, b + 7);
      BS.q(b, b + 1, b + 5, b + 4); BS.q(b + 1, b + 2, b + 6, b + 5);
      BS.q(b + 2, b + 3, b + 7, b + 6); BS.q(b + 3, b, b + 4, b + 7);
    }
    return { c0: c0, c1: BS.i.length };
  }

  /* ------------------------------------------------- ทางเดินลอยฟ้า (skywalk) */
  function emitWalks(BW, BR3) {
    if (!D.walks) return 0;
    var n = 0;
    D.walks.forEach(function (w) {
      var X = 0, Y = 0, pts = [];
      for (var i = 0; i < w.p.length; i += 2) {
        X += w.p[i]; Y += w.p[i + 1];
        var lon = X / 1e6, lat = Y / 1e6, q = H.toLocal(lon, lat);
        q.k = H.kAt(lat);
        var last = pts[pts.length - 1];
        if (last && Math.hypot(q.x - last.x, q.y - last.y) < 0.05) continue;
        pts.push(q);
      }
      if (pts.length < 2) return;
      n++;
      var h = w.h / 10, run = 0;
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
        if (w.c) {                                                               // หลังคา (เฉพาะช่วงที่ OSM บอกว่ามีหลังคา)
          BR3.box(mx, my, z + 2.7 * k, z + 2.9 * k, L, 4.6 * k, ux, uy);
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
  function buildModel() {
    var pal = H.palette();
    group = new T.Group();
    group.visible = visible;
    H.scene().add(group);
    matSteel = new T.MeshPhongMaterial({ color: "#6d747d", flatShading: true, shininess: 30, specular: 0x333333 });
    matDark = new T.MeshPhongMaterial({ color: "#20252c", flatShading: true, shininess: 10 });
    matRoof = new T.MeshPhongMaterial({ color: H.theme() === "light" ? "#dfe4ea" : "#9aa5b1", flatShading: true, shininess: 4, side: T.DoubleSide });
    hoverMat = new T.MeshBasicMaterial({ color: pal.glow, transparent: true, opacity: 0.3, depthWrite: false, side: T.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
    selMat = new T.MeshBasicMaterial({ color: pal.glow, transparent: true, opacity: 0.55, depthWrite: false, side: T.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });

    var tracks = D.tracks.map(decodeTrack).filter(Boolean);
    // ——— คาน/ราง แบ่งเป็นก้อนตามพื้นที่
    var chunks = {}, grid = {}, piers = [];
    tracks.forEach(function (R) {
      var mid = R.pts[R.pts.length >> 1];
      var ck = Math.floor(mid.x / CHUNK_M) + ":" + Math.floor(mid.y / CHUNK_M);
      var ch = chunks[ck] || (chunks[ck] = { BC: new Builder(), BR: new Builder(), lines: {}, tracks: [] });
      R.span = emitTrack(ch.BC, ch.BR, (ch.lines[R.line] = ch.lines[R.line] || new Builder()), R);
      ch.tracks.push(R);
      collectPiers(R, grid, piers);
    });
    var pickChunks = [];
    Object.keys(chunks).forEach(function (ck) {
      var ch = chunks[ck];
      var mesh = finish(ch.BC, H.concrete());
      finish(ch.BR, matSteel);
      Object.keys(ch.lines).forEach(function (ln) { finish(ch.lines[ln], lineMat(ln)); });
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

    // ——— สถานี
    var stations = buildStations(tracks);
    var stGroup = new T.Group();
    group.add(stGroup);
    var BS = new Builder(), BR2 = new Builder(), BC2 = new Builder();
    stations.forEach(function (S) { S.span = emitStation(BS, BR2, BC2, S); });
    var stMesh = finish(BS, H.concrete(), stGroup);
    finish(BR2, matRoof, stGroup);
    finish(BC2, H.concrete(), stGroup);
    var stPosAttr = null, stIdxArr = null;
    if (stMesh) {
      var sp = stMesh.geometry.attributes.position.array, si = stMesh.geometry.index.array;
      stPosAttr = stMesh.geometry.attributes.position;
      stIdxArr = si;
      stations.forEach(function (S) {
        var x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
        for (var i = S.span.c0; i < S.span.c1; i++) {
          var v = si[i] * 3, x = sp[v], y = sp[v + 1], z = sp[v + 2];
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
          if (z < z0) z0 = z; if (z > z1) z1 = z;
        }
        S.box = new T.Box3(new T.Vector3(x0, y0, z0), new T.Vector3(x1, y1, z1));
      });
    }

    // ——— ทางเดินลอยฟ้าเชื่อมสถานี (แสดงตอนซูมเข้าเท่านั้น)
    var walkGroup = new T.Group();
    group.add(walkGroup);
    var BW = new Builder(), BR3 = new Builder();
    var walkCount = emitWalks(BW, BR3);
    finish(BW, H.concrete(), walkGroup);
    finish(BR3, matRoof, walkGroup);

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

    // ——— ขบวนรถ (instanced ต่อสาย: ตัวรถ + แถบหน้าต่าง)
    var trains = [];
    var trainMeshes = {};
    tracks.forEach(function (R) {
      if (R.yard || R.len < 600) return;
      var cars = 4;
      var count = Math.max(1, Math.floor(R.len / 3500));     // ~1 ขบวนต่อ 3.5 กม.
      for (var t = 0; t < count; t++) {
        var s0 = R.len * (t + 0.5) / count;
        trains.push({ R: R, s: s0, v: TRAIN_SPEED, cars: cars, dwell: 0, si: nextStopIdx(R, s0) });
        (trainMeshes[R.line] = trainMeshes[R.line] || { n: 0 }).n += cars;
      }
    });
    var carBox = new T.BoxGeometry(1, 1, 1);
    carBox.translate(0, 0, 0.5);
    Object.keys(trainMeshes).forEach(function (ln) {
      var n = trainMeshes[ln].n;
      var body = new T.InstancedMesh(carBox.clone(), lineMat(ln), n);
      var band = new T.InstancedMesh(carBox.clone(), matDark, n);
      body.frustumCulled = false; band.frustumCulled = false;
      body.matrixAutoUpdate = false; band.matrixAutoUpdate = false;
      group.add(body); group.add(band);
      trainMeshes[ln] = { body: body, band: band, n: n, used: 0 };
    });

    model = { tracks: tracks, chunks: pickChunks, piers: pierMeshes, pierCount: piers.length,
      stations: stations, stGroup: stGroup, stPosAttr: stPosAttr, stIdx: stIdxArr,
      walkGroup: walkGroup, walkCount: walkCount,
      trains: trains, trainMeshes: trainMeshes, t0: performance.now() };
    setTrainsVisible(trainsOn);
    H.ready();
    H.repaint();
  }

  /* ---------------------------------------------------- ขยับขบวนรถทุกเฟรม */
  function nextStopIdx(R, s) {
    for (var i = 0; i < R.stops.length; i++) if (R.stops[i] > s + 30) return i;
    return -1;
  }

  var _m4 = null, _q = null, _p = null, _s = null, _z = null;
  function updateTrains(dt) {
    if (!model || !trainsOn) return;
    if (!_m4) { _m4 = new T.Matrix4(); _q = new T.Quaternion(); _p = new T.Vector3(); _s = new T.Vector3(); _z = new T.Vector3(0, 0, 1); }
    var mm = model.trainMeshes;
    Object.keys(mm).forEach(function (ln) { mm[ln].used = 0; });
    model.trains.forEach(function (tr) {
      var R = tr.R;
      var trainLen = tr.cars * (CAR_LEN + CAR_GAP);
      // จอดรับ-ส่งที่สถานี: ชะลอเข้าชานชาลา หยุดนิ่ง แล้วออกตัว (หัวขบวนเลยจุดจอดครึ่งความยาวขบวน)
      if (tr.dwell > 0) {
        tr.dwell -= dt;
        tr.v = 0;
        if (tr.dwell <= 0) tr.si = tr.si >= 0 && tr.si + 1 < R.stops.length ? tr.si + 1 : -1;
      } else {
        var target = TRAIN_SPEED;
        if (tr.si >= 0) {
          var goal = R.stops[tr.si] + trainLen / 2 - CAR_LEN / 2;
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
      if (tr.s > R.len + trainLen) { tr.s = 0; tr.v = TRAIN_SPEED; tr.dwell = 0; tr.si = nextStopIdx(R, 0); }
      var M = mm[R.line];
      if (!M) return;
      for (var c = 0; c < tr.cars; c++) {
        var s = tr.s - c * (CAR_LEN + CAR_GAP);
        if (s < CAR_LEN / 2 || s > R.len - CAR_LEN / 2) continue;
        var P = R.pts, lo = 0, hi = P.length - 1;
        while (lo < hi - 1) { var mid = (lo + hi) >> 1; if (P[mid].s < s) lo = mid; else hi = mid; }
        var a = P[lo], b = P[lo + 1];
        var f = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0;
        var x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f, h = a.h + (b.h - a.h) * f, k = a.k;
        var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
        var ang = Math.atan2(dy / L, dx / L);
        var base = R.mono ? h + 0.9 : h + 0.25;      // โมโนเรลคร่อมคาน รถไฟหนักวางบนราง
        if (M.used >= M.n) break;
        _q.setFromAxisAngle(_z, ang);
        _p.set(x, y, base * k);
        _s.set(CAR_LEN * k, CAR_W * k, CAR_H * k);
        M.body.setMatrixAt(M.used, _m4.compose(_p, _q, _s));
        _p.set(x, y, (base + CAR_H * 0.52) * k);
        _s.set((CAR_LEN - 1.6) * k, (CAR_W + 0.12) * k, CAR_H * 0.34 * k);
        M.band.setMatrixAt(M.used, _m4.compose(_p, _q, _s));
        M.used++;
      }
    });
    Object.keys(mm).forEach(function (ln) {
      var M = mm[ln];
      M.body.count = M.used; M.band.count = M.used;
      M.body.instanceMatrix.needsUpdate = true;
      M.band.instanceMatrix.needsUpdate = true;
    });
  }
  function setTrainsVisible(on) {
    if (!model) return;
    Object.keys(model.trainMeshes).forEach(function (ln) {
      model.trainMeshes[ln].body.visible = on;
      model.trainMeshes[ln].band.visible = on;
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
    // สถานี: ใช้กล่องครอบพอ (รูปทรงเป็นกล่องอยู่แล้ว) — ให้ชนะรางเมื่ออยู่ใกล้กว่า
    for (var i2 = 0; i2 < model.stations.length; i2++) {
      var S = model.stations[i2];
      if (!S.box) continue;
      var pt = ray.intersectBox(S.box, _hit || (_hit = new T.Vector3()));
      if (!pt) continue;
      var d2 = pt.distanceTo(ray.origin);
      if (d2 < bestD) { bestD = d2; best = { type: "station", S: S }; }
    }
    return best ? { dist: bestD, hit: best } : null;
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
    } else if (model.stPosAttr) {
      // ใช้รูปทรงจริงของสถานี (ช่วง index ที่จดไว้ตอนสร้าง) ไม่ใช่กล่องครอบ จะได้ไม่บังตัวสถานี
      var S0 = hit.S;
      var gs = new T.BufferGeometry();
      gs.setAttribute("position", model.stPosAttr);
      gs.setIndex(Array.prototype.slice.call(model.stIdx.subarray(S0.span.c0, S0.span.c1)));
      var ms = new T.Mesh(gs, hoverMat);
      ms.matrixAutoUpdate = false;
      ms.renderOrder = 5;
      return ms;
    } else {
      var S = hit.S, r = S.box;
      B.box((r.min.x + r.max.x) / 2, (r.min.y + r.max.y) / 2, r.min.z, r.max.z,
        (r.max.x - r.min.x), (r.max.y - r.min.y), 1, 0);
    }
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(B.p, 3));
    g.setIndex(B.i);
    var m = new T.Mesh(g, hoverMat);
    m.matrixAutoUpdate = false;
    m.renderOrder = 5;
    return m;
  }
  function keyOf(hit) { return hit ? (hit.type === "track" ? "t" + hit.R.idx : "s" + hit.S.st.code + hit.S.line.id) : null; }
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
            '<div class="elv-cell"><div class="elv-k">ระดับชานชาลา (ประมาณ)</div><div class="elv-v">' + fmt(S.h + 1.2) + '<small>ม.</small></div></div>' +
            '<div class="elv-cell"><div class="elv-k">ความยาวชานชาลา</div><div class="elv-v">' + fmt(S.len) + '<small>ม.</small></div></div>' +
          '</div>' +
          (inter.length ? '<div class="elv-row"><b>เปลี่ยนสาย</b><span>' + inter.map(function (l) {
            return '<span class="rlv-dot" style="background:' + esc(l.color) + '"></span>' + esc(l.name);
          }).join(" · ") + '</span></div>' : '') +
          '<div class="elv-actions"><button type="button" class="elv-btn primary" data-act="fly">' + ico("map-pin") + ' บินไปดู</button></div>' +
          '<p class="elv-note">ตัวสถานีเป็นแบบจำลองมาตรฐาน (ชานชาลา+หลังคา+ชั้นจำหน่ายตั๋ว) วางบนพิกัดและแนวรางจริง ไม่ใช่แบบสถาปัตยกรรมของสถานีนั้น</p>' +
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
        walks: model ? model.walkCount : 0,
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
        var showW = z >= WALK_ZOOM;
        if (showW !== model.walkShown) { model.walkShown = showW; model.walkGroup.visible = showW; }
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
          updateTrains(dt);
        }
      },
      theme: function (name, pal) {
        if (!model) return;
        hoverMat.color.set(pal.glow);
        selMat.color.set(pal.glow);
        matRoof.color.set(name === "light" ? "#dfe4ea" : "#9aa5b1");
      }
    });
  })();
})();
