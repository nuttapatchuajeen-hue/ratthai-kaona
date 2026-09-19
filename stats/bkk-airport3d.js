/**
 * bkk-airport3d.js
 * ชั้น "สนามบิน 3 มิติ" ของ bkk-city.html — ท่าอากาศยานดอนเมือง + สุวรรณภูมิ
 * วาดในฉากกลาง bkk-3d-host.js (three.js) ร่วมกับทางด่วนและรถไฟฟ้า
 *
 * ข้อมูล
 *   - bkk-airport-data.js (window.BKK_AIRPORT) จาก OSM ด้วย _geo/build-bkk-airport.js — ทางวิ่ง ทางขับ ลานจอด อาคาร หลุมจอด
 *   - bkk-aircraft-models.js (window.BKK_AIRCRAFT) — รูปทรงเครื่องบินรายตระกูล + สีสายการบิน
 *   - เครื่องบินจริงแบบสด: /api/flights (ADS-B จาก adsb.lol ผ่านพร็อกซีของเว็บ เพราะต้นทางไม่เปิด CORS)
 *
 * ส่วนประกอบ
 *   - พื้น: ลานจอดคอนกรีต ทางขับ + เส้นกึ่งกลางเหลือง + เส้นรอหยุด · ทางวิ่ง + เครื่องหมาย ICAO (แถบหัวทางวิ่ง เลข จุดเล็งลง TDZ เส้นกึ่งกลาง)
 *   - ไฟสนามบิน (ธีมมืด/พลบค่ำ): ไฟขอบทางวิ่ง ไฟหัว-ท้าย ไฟนำร่อน (ALS) PAPI ไฟทางขับเขียว
 *   - อาคาร: ยกจากผัง OSM + สีหลังคาจากภาพดาวเทียม · โรงซ่อมหลังคาโค้ง
 *     · อาคารผู้โดยสารสุวรรณภูมิ (โถงหลังคาใหญ่ + แขนเทียบเครื่องบินหลังคาเมมเบรน) · SAT-1 · หอบังคับการบิน 132.2 ม.
 *   - สะพานเทียบเครื่องบิน + เครื่องบินจอดที่หลุมจอด (ภาพประกอบ — สุ่มแบบคงที่ ไม่ใช่ข้อมูลจริง)
 *   - เครื่องบินจริง: ตำแหน่ง/ความสูง/ทิศ จาก ADS-B ทุก 5 วินาที ประมาณตำแหน่งระหว่างรอบ · ป้ายเลขเที่ยวบิน · เส้นทางที่ผ่านมา
 *
 * ⚠ ความสูงอาคารส่วนใหญ่เป็นค่าประมาณ · ADS-B ชุมชนรับสัญญาณไม่ครบทุกลำ (โดยเฉพาะบนพื้น)
 */
(function () {
  "use strict";

  var DATA_URL = "bkk-airport-data.js";
  var MODELS_URL = "bkk-aircraft-models.js";
  var MOD_ID = "airport";
  var LS_KEY = "bkk-airport3d-on";
  var LS_LIVE = "bkk-airport3d-live";
  var REMOTE_API = "https://ratthai-kaona.vercel.app/api/flights";
  var POLL_MS = 5000;
  var MARK_ZOOM = 12.4;        // เครื่องหมายบนทางวิ่ง
  var FINE_ZOOM = 14;          // เส้นนำเข้าหลุมจอด เส้นรอหยุด ถุงลม
  var BLD_ZOOM = 12;           // อาคาร
  var PARK_ZOOM = 12.6;        // เครื่องบินจอด สะพานเทียบ
  var LABEL_ZOOM = 11.3;       // ป้ายเที่ยวบิน
  var TRAIL_N = 90;            // จำนวนจุดเส้นทางที่ผ่านมาต่อลำ (ทุก 2 วินาที ≈ 3 นาที)

  var H = null, T = null, D = null, AC = null, map = null;
  var visible = true, liveOn = true, loading = null, failed = false, uiBuilt = false;
  var group = null, model = null, lastError = null;
  var baseHidden = false, savedVis = {};
  var hoverKey = null, selKey = null, hoverMesh = null, selMesh = null, selHit = null;

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
  // สุ่มแบบกำหนดเมล็ด — เครื่องบินจอดชุดเดิมทุกครั้งที่เปิดหน้า
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  function ensureLoaded() {
    if (loading) return loading;
    setChipState("loading");
    loading = Promise.all([
      H.ensure(),
      window.BKK_AIRPORT ? Promise.resolve() : loadScript(DATA_URL),
      window.BKK_AIRCRAFT ? Promise.resolve() : loadScript(MODELS_URL)
    ]).then(function () {
      T = H.THREE(); D = window.BKK_AIRPORT; AC = window.BKK_AIRCRAFT;
      if (!T || !D || !AC) throw new Error("THREE/BKK_AIRPORT/BKK_AIRCRAFT missing");
      buildModel();
      setChipState("ready");
    }).catch(function (e) {
      failed = true;
      lastError = e && e.stack || String(e);
      if (group && group.parent) group.parent.remove(group);
      model = null;
      console.warn("airport 3D:", e);
      setChipState("error");
    });
    return loading;
  }

  /* ------------------------------------------------------------- พิกัด */
  function loc(lonI, latI) { var lat = latI / 1e6, p = H.toLocal(lonI / 1e6, lat); p.k = H.kAt(lat); return p; }
  function decode(arr) {
    var out = [], x = 0, y = 0;
    for (var i = 0; i < arr.length; i += 2) {
      if (i === 0) { x = arr[0]; y = arr[1]; } else { x += arr[i]; y += arr[i + 1]; }
      out.push(loc(x, y));
    }
    return out;
  }
  // กรอบพิกัดอาคารผู้โดยสารสุวรรณภูมิ (u ตามคานกลาง, v ไปทางเหนือ — หน่วยเมตรจริง)
  function frameFn(fr) {
    var o = loc(Math.round(fr.o[0] * 1e6), Math.round(fr.o[1] * 1e6)), a = fr.a * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), k = o.k;
    return { k: k, ca: ca, sa: sa, at: function (u, v) { return { x: o.x + k * (u * ca - v * sa), y: o.y + k * (u * sa + v * ca) }; } };
  }

  /* --------------------------------------------------------- ตัวสร้างเรขา */
  // B = ตำแหน่งอย่างเดียว (พื้นสีเดียว) · CB = ตำแหน่ง + สีต่อจุด · UB = ตำแหน่ง + uv (ผิวมีลาย)
  function B0() { this.p = []; this.i = []; }
  B0.prototype.v = function (x, y, z) { this.p.push(x, y, z); return this.p.length / 3 - 1; };
  B0.prototype.tri = function (a, b, c) { this.i.push(a, b, c); };
  B0.prototype.quad = function (a, b, c, d) { this.i.push(a, b, c, a, c, d); };
  B0.prototype.q4 = function (P, z) { var b = this.p.length / 3; P.forEach(function (p) { this.p.push(p.x, p.y, z); }, this); this.quad(b, b + 1, b + 2, b + 3); };
  function CB() { B0.call(this); this.c = []; this.col = [1, 1, 1]; }
  CB.prototype = Object.create(B0.prototype);
  CB.prototype.v = function (x, y, z, c) { c = c || this.col; this.p.push(x, y, z); this.c.push(c[0], c[1], c[2]); return this.p.length / 3 - 1; };
  function UB() { B0.call(this); this.uv = []; }
  UB.prototype = Object.create(B0.prototype);
  UB.prototype.v = function (x, y, z, u, w) { this.p.push(x, y, z); this.uv.push(u || 0, w || 0); return this.p.length / 3 - 1; };

  function toGeo(B) {
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(B.p, 3));
    if (B.c) g.setAttribute("color", new T.Float32BufferAttribute(B.c, 3));
    if (B.uv) g.setAttribute("uv", new T.Float32BufferAttribute(B.uv, 2));
    g.setIndex(new T.BufferAttribute(new Uint32Array(B.i), 1));
    g.computeBoundingSphere();
    return g;
  }
  function mesh(B, mat, parent, order) {
    if (!B.p.length) return null;
    var m = new T.Mesh(toGeo(B), mat);
    m.matrixAutoUpdate = false;
    if (order != null) m.renderOrder = order;
    (parent || group).add(m);
    return m;
  }
  function hexRGB(h) { return AC.hex(h); }
  function shade(c, f) { return [c[0] * f, c[1] * f, c[2] * f]; }
  function mixc(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

  /* แถบตามเส้น (ribbon) กว้าง w + วงกลมที่จุดหักเพื่อเติมรอยต่อ */
  function ribbon(B, P, w, z, joins) {
    for (var i = 0; i < P.length - 1; i++) {
      var a = P[i], b = P[i + 1], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      if (L < 0.01) continue;
      var nx = -dy / L * w / 2, ny = dx / L * w / 2;
      var i0 = B.v(a.x - nx, a.y - ny, z), i1 = B.v(a.x + nx, a.y + ny, z), i2 = B.v(b.x + nx, b.y + ny, z), i3 = B.v(b.x - nx, b.y - ny, z);
      B.quad(i0, i1, i2, i3);
    }
    if (joins) for (var j = 0; j < P.length; j++) disc(B, P[j].x, P[j].y, w / 2, z, 10);
  }
  function disc(B, x, y, r, z, n) {
    var c = B.v(x, y, z), f = B.v(x + r, y, z), p = f;
    for (var k = 1; k <= n; k++) {
      var t = k / n * Math.PI * 2, q = k === n ? f : B.v(x + r * Math.cos(t), y + r * Math.sin(t), z);
      B.tri(c, p, q); p = q;
    }
  }
  // รูปหลายเหลี่ยมแบน (earcut ของ three)
  function fillPoly(B, P, z) {
    var V = P.map(function (p) { return new T.Vector2(p.x, p.y); });
    if (T.ShapeUtils.isClockWise(V)) { V.reverse(); P = P.slice().reverse(); }
    var tris = T.ShapeUtils.triangulateShape(V, []);
    var base = B.p.length / 3;
    P.forEach(function (p) { B.v(p.x, p.y, z); });
    tris.forEach(function (t) { B.tri(base + t[0], base + t[1], base + t[2]); });
  }

  /* ------------------------------------------------------------ สี/วัสดุ */
  var GROUND = {
    dark:   { apron: "#2b3039", taxi: "#1d2229", rwy: "#15191e", stop: "#20252c", white: "#cdd4dc", yellow: "#c9a124", red: "#b3261e" },
    light:  { apron: "#dde0e4", taxi: "#b7bcc2", rwy: "#8a9097", stop: "#a3a9b0", white: "#ffffff", yellow: "#efbd1c", red: "#d0342c" },
    sunset: { apron: "#e5d8ce", taxi: "#c6b5a8", rwy: "#978679", stop: "#ad9c90", white: "#fffaf4", yellow: "#eeb01c", red: "#cf3a2e" }
  };
  var TONE = { dark: "#8e9aad", light: "#ffffff", sunset: "#f4ddcc" };         // สีอาคาร (คูณกับสีต่อจุด)
  var GLASS_GLOW = { dark: "#23466a", light: "#4a5d70", sunset: "#3d4250" };  // ไฟในอาคารส่องผ่านกระจกตอนกลางคืน
  var MEMBRANE_GLOW = { dark: "#3d4d63", light: "#000000", sunset: "#40352f" };
  var mats = null;

  function groundMat(order) {
    return new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide, depthTest: false, depthWrite: false });
  }
  function canvasTex(w, h, draw) {
    var cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    draw(cv.getContext("2d"), w, h);
    var tx = new T.CanvasTexture(cv);
    tx.wrapS = tx.wrapT = T.RepeatWrapping;
    return tx;
  }
  // ตัวอักษรทางวิ่ง (0–9 L R C) — ผอมสูงแบบตัวเลขทางวิ่งจริง
  var GLYPHS = "0123456789LRC";
  function glyphTex() {
    var tx = canvasTex(1024, 128, function (g) {
      g.fillStyle = "#fff";
      g.textAlign = "center"; g.textBaseline = "middle";
      for (var i = 0; i < GLYPHS.length; i++) {
        g.save();
        g.translate(i * 64 + 32, 66);
        g.scale(0.5, 1);
        g.font = "700 128px Arial, Helvetica, sans-serif";
        g.fillText(GLYPHS[i], 0, 0);
        g.restore();
      }
    });
    tx.wrapS = tx.wrapT = T.ClampToEdgeWrapping;
    return tx;
  }
  // ผนังกระจก: ลูกฟักตั้งทุก 1.5 ม. คานนอนทุกชั้น (4 ม.) — ลายหนึ่งแผ่น = กว้าง 6 ม. สูง 8 ม.
  function glassTex() {
    return canvasTex(128, 128, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, "#9fb7c9"); gr.addColorStop(0.5, "#6f8aa0"); gr.addColorStop(1, "#8aa4b8");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(40,52,64,0.85)";
      for (var x = 0; x < 4; x++) g.fillRect(x * 32, 0, 3, h);
      g.fillRect(0, 0, w, 5); g.fillRect(0, 64, w, 5);
      g.fillStyle = "rgba(255,255,255,0.18)";
      g.fillRect(4, 8, 10, 52); g.fillRect(36, 72, 10, 52);
    });
  }
  function dotTex() {
    return canvasTex(32, 32, function (g) {
      var gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,0.85)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
    });
  }

  function makeMaterials() {
    var th = H.theme();
    mats = {
      apron: groundMat(), taxi: groundMat(), rwy: groundMat(), stop: groundMat(),
      white: groundMat(), yellow: groundMat(), red: groundMat(),
      glyph: new T.MeshBasicMaterial({ color: 0xffffff, map: glyphTex(), transparent: true, alphaTest: 0.35, side: T.DoubleSide, depthTest: false, depthWrite: false }),
      solid: new T.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 4, specular: 0x111111, side: T.DoubleSide }),
      membrane: new T.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 18, specular: 0x222222, side: T.DoubleSide }),
      glass: new T.MeshPhongMaterial({ color: 0xffffff, map: glassTex(), shininess: 60, specular: 0x556677, side: T.DoubleSide }),
      lights: new T.PointsMaterial({ size: 3.4, sizeAttenuation: false, vertexColors: true, map: dotTex(), transparent: true, depthWrite: false,
        blending: T.AdditiveBlending }),
      taxiLights: new T.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, map: dotTex(), transparent: true, depthWrite: false,
        blending: T.AdditiveBlending }),
      hover: new T.MeshBasicMaterial({ color: new T.Color(H.palette().glow), transparent: true, opacity: 0.38, depthWrite: false, side: T.DoubleSide }),
      sel: new T.MeshBasicMaterial({ color: new T.Color(H.palette().glow), transparent: true, opacity: 0.55, depthWrite: false, side: T.DoubleSide }),
      trail: new T.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false })
    };
    themeMaterials(th);
  }
  function themeMaterials(name) {
    if (!mats) return;
    var G = GROUND[name] || GROUND.dark;
    ["apron", "taxi", "rwy", "stop", "white", "yellow", "red"].forEach(function (k) { mats[k].color.set(G[k]); });
    mats.glyph.color.set(G.white);
    mats.solid.color.set(TONE[name] || TONE.dark);
    mats.membrane.color.set(TONE[name] || TONE.dark);
    mats.membrane.emissive.set(MEMBRANE_GLOW[name] || "#000");
    mats.glass.color.set(name === "dark" ? "#7f8ea3" : "#ffffff");
    mats.glass.emissive.set(GLASS_GLOW[name] || "#000");
    var pal = H.palette();
    mats.hover.color.set(pal.glow); mats.sel.color.set(pal.glow);
    if (model && model.lights) model.lights.visible = name !== "light";
    if (model && model.planeMat) model.planeMat.userData.hlColor.value.set(pal.glow);
  }

  /* ------------------------------------------------------------ พื้นสนามบิน
     พื้นทุกชั้นไม่เขียน/ไม่ทดสอบความลึก แล้ววาดเรียงตาม renderOrder (ลานจอด → ทางขับ → เส้นเหลือง → ทางวิ่ง → เครื่องหมายขาว)
     → ไม่มีปัญหาผิวซ้อนกระพริบ (z-fighting) แม้มองจากไกล และเส้นเหลืองของทางขับถูกผิวทางวิ่งทับตามจริง */
  var ORD = { apron: -40, taxi: -39, stop: -39, yellow: -37, rwy: -36, white: -32, red: -32, glyph: -31 };
  var HOLD = 90;               // ระยะเส้นรอหยุดจากกึ่งกลางทางวิ่ง (ม.) — ทางวิ่งแบบนำร่อนด้วยเครื่องวัด
  var LC = { white: [1, 0.93, 0.8], green: [0.25, 1, 0.45], red: [1, 0.22, 0.16], blue: [0.3, 0.5, 1], als: [1, 0.86, 0.55], taxi: [0.1, 0.55, 0.24] };

  function rwyFrame(R) {
    var a = loc(R.p[0], R.p[1]), b = loc(R.p[2], R.p[3]);
    var k = (a.k + b.k) / 2, dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
    return { R: R, a: a, b: b, k: k, ux: dx / L, uy: dy / L, L: L, Lm: L / k, W: R.w };
  }
  // จุดในกรอบทางวิ่งนับจากปลาย end (0 = p0, 1 = p1): s = ระยะเข้าไปในทางวิ่ง (ม.) · o = ไปทางขวาของนักบินที่กำลังร่อนลง (ม.)
  function rwyPt(F, end, s, o) {
    var dir = end ? -1 : 1, O = end ? F.b : F.a;
    var hx = F.ux * dir, hy = F.uy * dir;
    return { x: O.x + (hx * s + hy * o) * F.k, y: O.y + (hy * s - hx * o) * F.k };
  }
  function rwyRect(B, F, end, s0, s1, o0, o1) {
    B.q4([rwyPt(F, end, s0, o0), rwyPt(F, end, s1, o0), rwyPt(F, end, s1, o1), rwyPt(F, end, s0, o1)], 0);
  }
  function glyphs(UBd, F, end, s0, text, cw, gap, gh) {
    gh = gh || 12.5;
    var total = text.length * cw + (text.length - 1) * gap, o = -total / 2;
    for (var i = 0; i < text.length; i++) {
      var gi = GLYPHS.indexOf(text[i]);
      if (gi < 0) { o += cw + gap; continue; }
      var u0 = gi * 64 / 1024 + 0.004, u1 = (gi + 1) * 64 / 1024 - 0.004;
      var P = [rwyPt(F, end, s0, o), rwyPt(F, end, s0, o + cw), rwyPt(F, end, s0 + gh, o + cw), rwyPt(F, end, s0 + gh, o)];
      var b0 = UBd.v(P[0].x, P[0].y, 0, u0, 0.02), b1 = UBd.v(P[1].x, P[1].y, 0, u1, 0.02),
        b2 = UBd.v(P[2].x, P[2].y, 0, u1, 0.98), b3 = UBd.v(P[3].x, P[3].y, 0, u0, 0.98);
      UBd.quad(b0, b1, b2, b3);
      o += cw + gap;
    }
  }
  function light(L, p, z, c) { L.p.push(p.x, p.y, z); L.c.push(c[0], c[1], c[2]); }

  function buildRunway(F, Bs, L) {
    var W = F.W, Lm = F.Lm;
    rwyRect(Bs.rwy, F, 0, 0, Lm, -W / 2, W / 2);
    // เส้นขอบ + เส้นกึ่งกลาง (นับจากปลาย 0)
    rwyRect(Bs.white, F, 0, 0, Lm, W / 2 - 1.35, W / 2 - 0.45);
    rwyRect(Bs.white, F, 0, 0, Lm, -W / 2 + 0.45, -W / 2 + 1.35);
    for (var s = 82; s + 30 <= Lm - 82; s += 50) rwyRect(Bs.white, F, 0, s, s + 30, -0.5, 0.5);
    [0, 1].forEach(function (end) {
      var name = F.R.d[end] || "", num = name.replace(/[^0-9]/g, ""), ltr = name.replace(/[0-9]/g, "");
      // แถบหัวทางวิ่ง (piano keys)
      var per = W >= 55 ? 8 : W >= 40 ? 6 : 4;
      for (var i = 0; i < per; i++) {
        var o0 = 1.8 + i * 3.6;
        rwyRect(Bs.white, F, end, 6, 36, o0, o0 + 1.8);
        rwyRect(Bs.white, F, end, 6, 36, -o0 - 1.8, -o0);
      }
      // เลขทางวิ่ง: ตัวอักษร (L/R) ใกล้หัวทางวิ่ง ตัวเลขถัดไป
      var sNum = 48;
      if (ltr) { glyphs(Bs.glyph, F, end, 46, ltr, 6.6, 0); sNum = 63; }
      glyphs(Bs.glyph, F, end, sNum, num, 6.6, -0.6);
      // จุดเล็งลง + TDZ
      if (Lm >= 2400) {
        var inner = W >= 55 ? 10 : 8, bw = W >= 55 ? 9 : 6;
        rwyRect(Bs.white, F, end, 400, 460, inner, inner + bw);
        rwyRect(Bs.white, F, end, 400, 460, -inner - bw, -inner);
        [[150, 3], [300, 3], [600, 2], [750, 2], [900, 1]].forEach(function (t) {
          for (var j = 0; j < t[1]; j++) {
            var oo = inner + j * 3.3;
            rwyRect(Bs.white, F, end, t[0], t[0] + 22.5, oo, oo + 1.8);
            rwyRect(Bs.white, F, end, t[0], t[0] + 22.5, -oo - 1.8, -oo);
          }
        });
      }
      // ไฟหัวทางวิ่ง (เขียว) · ไฟนำร่อน 900 ม. + คานขวางที่ 300 ม. · PAPI ซ้ายมือ
      for (var o = -W / 2; o <= W / 2 + 0.01; o += 3) light(L, rwyPt(F, end, -0.8, o), 0.4, LC.green);
      for (var sa = 30; sa <= 900; sa += 30) {
        light(L, rwyPt(F, end, -sa, 0), 0.8 + sa * 0.004, LC.als);
        if (sa % 150 === 0) { light(L, rwyPt(F, end, -sa, -1.5), 0.8, LC.als); light(L, rwyPt(F, end, -sa, 1.5), 0.8, LC.als); }
      }
      for (var ob = -15; ob <= 15.01; ob += 1.5) light(L, rwyPt(F, end, -300, ob), 2, LC.als);
      for (var pp = 0; pp < 4; pp++) light(L, rwyPt(F, end, 380, -(W / 2 + 15 + pp * 9)), 0.8, pp < 2 ? LC.red : LC.white);
    });
    // ไฟขอบทางวิ่งทุก 60 ม. + ไฟกึ่งกลางทุก 30 ม.
    for (var se = 0; se <= Lm; se += 60) {
      light(L, rwyPt(F, 0, se, W / 2 + 1.5), 0.5, LC.white);
      light(L, rwyPt(F, 0, se, -W / 2 - 1.5), 0.5, LC.white);
    }
    for (var sc = 15; sc < Lm; sc += 30) light(L, rwyPt(F, 0, sc, 0), 0.2, Lm - sc < 300 || sc < 0 ? LC.red : [0.8, 0.78, 0.72]);
  }

  function buildStopway(S, Bs) {
    var a = loc(S.p[0], S.p[1]), b = loc(S.p[2], S.p[3]);
    var F = { a: a, b: b, k: a.k, L: Math.hypot(b.x - a.x, b.y - a.y) };
    F.ux = (b.x - a.x) / F.L; F.uy = (b.y - a.y) / F.L; F.Lm = F.L / F.k;
    rwyRect(Bs.stop, F, 0, 0, F.Lm, -S.w / 2, S.w / 2);
    // ลูกศรตัววีสีเหลืองชี้ไปทางทางวิ่ง (ไม่รู้ว่าปลายไหนติดทางวิ่ง → วาดสมมาตร)
    for (var s = 15; s < F.Lm - 10; s += 30) {
      [-1, 1].forEach(function (sd) {
        var p0 = rwyPt(F, 0, s, 0), p1 = rwyPt(F, 0, s + 18, sd * S.w * 0.42);
        var dx = p1.x - p0.x, dy = p1.y - p0.y, len = Math.hypot(dx, dy), nx = -dy / len * 0.9 * F.k, ny = dx / len * 0.9 * F.k;
        Bs.yellow.q4([{ x: p0.x - nx, y: p0.y - ny }, { x: p1.x - nx, y: p1.y - ny }, { x: p1.x + nx, y: p1.y + ny }, { x: p0.x + nx, y: p0.y + ny }], 0);
      });
    }
  }

  // เส้นรอหยุดก่อนเข้าทางวิ่ง: ทางขับตัดเส้นขนานห่างกึ่งกลางทางวิ่ง 90 ม. → แถบเหลือง 2 เส้นทึบ (ฝั่งทางขับ) + 2 เส้นประ (ฝั่งทางวิ่ง)
  function holdMarks(Bf, P, w, rwys) {
    for (var i = 0; i < P.length - 1; i++) {
      var a = P[i], b = P[i + 1];
      rwys.forEach(function (F) {
        var sa = ((a.x - F.a.x) * F.ux + (a.y - F.a.y) * F.uy) / F.k, sb = ((b.x - F.a.x) * F.ux + (b.y - F.a.y) * F.uy) / F.k;
        if (Math.max(sa, sb) < -150 || Math.min(sa, sb) > F.Lm + 150) return;
        var da = ((a.x - F.a.x) * -F.uy + (a.y - F.a.y) * F.ux) / F.k, db = ((b.x - F.a.x) * -F.uy + (b.y - F.a.y) * F.ux) / F.k;
        [HOLD, -HOLD].forEach(function (hd) {
          if ((da - hd) * (db - hd) >= 0) return;
          var t = (hd - da) / (db - da), x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
          var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), tx = dx / L, ty = dy / L;
          // ทิศเข้าหาทางวิ่ง ตามแนวทางขับ
          var toward = Math.abs(db) < Math.abs(da) ? 1 : -1, k = a.k;
          var hw = w / 2 * k;
          for (var j = 0; j < 4; j++) {
            var off = (j - 1.5) * 0.9 * toward * k, cx = x + tx * off, cy = y + ty * off;
            var dashed = j >= 2, seg = dashed ? 6 : 1;
            for (var q = 0; q < seg; q++) {
              var e0 = -hw + (2 * hw) * q / seg, e1 = dashed ? e0 + (2 * hw) / seg * 0.55 : hw;
              var p = [{ x: cx - ty * e0 - tx * 0.25 * k, y: cy + tx * e0 - ty * 0.25 * k }, { x: cx - ty * e1 - tx * 0.25 * k, y: cy + tx * e1 - ty * 0.25 * k },
                { x: cx - ty * e1 + tx * 0.25 * k, y: cy + tx * e1 + ty * 0.25 * k }, { x: cx - ty * e0 + tx * 0.25 * k, y: cy + tx * e0 + ty * 0.25 * k }];
              Bf.q4(p, 0);
            }
          }
        });
      });
    }
  }
  function sampleLine(P, step, cb) {
    var acc = 0;
    for (var i = 0; i < P.length - 1; i++) {
      var a = P[i], b = P[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y) / a.k;
      while (acc <= L) { var t = acc / L; cb({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }); acc += step; }
      acc -= L;
    }
  }

  function buildGround(L) {
    var Bs = { apron: new B0(), taxi: new B0(), rwy: new B0(), stop: new B0(), white: new B0(), yellow: new B0(), glyph: new UB() };
    var Bf = new B0();
    var ground = new T.Group(), marks = new T.Group(), fine = new T.Group();
    D.aprons.forEach(function (A) { fillPoly(Bs.apron, decode(A.p), 0); });
    var rwys = D.runways.map(rwyFrame);
    model.runways = rwys;
    rwys.forEach(function (F) { buildRunway(F, Bs, L); });
    D.stopways.forEach(function (S) { buildStopway(S, Bs); });
    model.taxis = [];
    D.taxiways.forEach(function (tw) {
      var P = decode(tw.p), w = tw.w || (tw.l ? 15 : 23);
      model.taxis.push({ P: P, w: w, tw: tw });
      ribbon(Bs.taxi, P, w * P[0].k, 0, true);
      ribbon(Bs.yellow, P, 0.9 * P[0].k, 0, false);
      holdMarks(Bf, P, w, rwys.filter(function (F) { return F.R.a === tw.a; }));
      sampleLine(P, 45, function (p) { light(L.taxi, p, 0.2, LC.taxi); });
    });
    // เส้นนำเข้าหลุมจอด + เส้นหยุด
    D.stands.forEach(function (s) {
      var n = loc(s.p[0], s.p[1]), h = s.h * Math.PI / 180, fx = Math.sin(h), fy = Math.cos(h), k = n.k;
      var back = { x: n.x - fx * 55 * k, y: n.y - fy * 55 * k }, front = { x: n.x + fx * 1 * k, y: n.y + fy * 1 * k };
      ribbon(Bf, [back, front], 0.6 * k, 0, false);
      ribbon(Bf, [{ x: n.x - fy * 3 * k, y: n.y + fx * 3 * k }, { x: n.x + fy * 3 * k, y: n.y - fx * 3 * k }], 0.9 * k, 0, false);
    });
    mesh(Bs.apron, mats.apron, ground, ORD.apron);
    mesh(Bs.taxi, mats.taxi, ground, ORD.taxi);
    mesh(Bs.stop, mats.stop, ground, ORD.stop);
    mesh(Bs.rwy, mats.rwy, ground, ORD.rwy);
    mesh(Bs.yellow, mats.yellow, marks, ORD.yellow);
    mesh(Bs.white, mats.white, marks, ORD.white);
    mesh(Bs.glyph, mats.glyph, marks, ORD.glyph);
    mesh(Bf, mats.yellow, fine, ORD.yellow);
    group.add(ground, marks, fine);
    model.ground = ground; model.marks = marks; model.fine = fine;
  }
  // ไฟทางวิ่ง/ไฟนำร่อน (จุดใหญ่) กับไฟกึ่งกลางทางขับสีเขียว (จุดเล็ก หรี่กว่า — ไม่งั้นซูมออกแล้วเขียวทั้งสนาม)
  function buildLights(L) {
    var grp = new T.Group();
    [[L, mats.lights], [L.taxi, mats.taxiLights]].forEach(function (e) {
      var lg = new T.BufferGeometry();
      lg.setAttribute("position", new T.Float32BufferAttribute(e[0].p, 3));
      lg.setAttribute("color", new T.Float32BufferAttribute(e[0].c, 3));
      lg.computeBoundingSphere();
      var pts = new T.Points(lg, e[1]);
      pts.matrixAutoUpdate = false;
      pts.renderOrder = 20;
      grp.add(pts);
    });
    group.add(grp);
    model.lights = grp;
    model.lightCount = (L.p.length + L.taxi.p.length) / 3;
  }

  /* ------------------------------------------------------------ อาคาร */
  var ROOF_DEF = { terminal: "#d7dbe0", hangar: "#e1e5ea", roof: "#b9c0c8", tent: "#eceae4", parking: "#b8bcc1", building: "#cfd3d8" };
  var WALL_GRAY = [0.8, 0.82, 0.85];

  function ccw(P) {
    var s = 0;
    for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length]; s += a.x * b.y - b.x * a.y; }
    return s >= 0 ? P : P.slice().reverse();
  }
  function polyArea(P) {
    var s = 0;
    for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length]; s += a.x * b.y - b.x * a.y; }
    return Math.abs(s / 2);
  }
  // กล่องหมุนที่ครอบรูปได้เล็กสุด (ใช้แกนตามขอบ)
  function obb(P) {
    var best = null;
    for (var i = 0; i < P.length; i++) {
      var a = P[i], b = P[(i + 1) % P.length], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      if (L < 1e-6) continue;
      var ux = dx / L, uy = dy / L, u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
      P.forEach(function (p) { var u = p.x * ux + p.y * uy, v = -p.x * uy + p.y * ux; u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); });
      var A = (u1 - u0) * (v1 - v0);
      if (!best || A < best.A) best = { A: A, ux: ux, uy: uy, u0: u0, u1: u1, v0: v0, v1: v1 };
    }
    if (best && best.u1 - best.u0 < best.v1 - best.v0) {   // ให้แกน u เป็นด้านยาวเสมอ
      var o = best;
      best = { A: o.A, ux: -o.uy, uy: o.ux, u0: o.v0, u1: o.v1, v0: -o.u1, v1: -o.u0 };
    }
    return best;
  }
  function obbPt(O, u, v) { return { x: O.ux * u - O.uy * v, y: O.uy * u + O.ux * v }; }

  function roofTop(C, P, z, col) {
    var V = P.map(function (p) { return new T.Vector2(p.x, p.y); });
    var tris = T.ShapeUtils.triangulateShape(V, []);
    var base = C.p.length / 3;
    P.forEach(function (p) { C.v(p.x, p.y, z, col); });
    tris.forEach(function (t) { C.tri(base + t[0], base + t[1], base + t[2]); });
  }
  function walls(C, P, z0, z1, col) {
    for (var i = 0; i < P.length; i++) {
      var a = P[i], b = P[(i + 1) % P.length];
      var i0 = C.v(a.x, a.y, z0, col), i1 = C.v(b.x, b.y, z0, col), i2 = C.v(b.x, b.y, z1, col), i3 = C.v(a.x, a.y, z1, col);
      C.quad(i0, i1, i2, i3);
    }
  }
  // ผนังกระจก (มีลาย): u = ระยะตามผนัง/6 ม., v = ความสูง/8 ม.
  function glassWalls(G, P, z0, z1, k, closedRing) {
    var acc = 0, n = closedRing === false ? P.length - 1 : P.length;
    for (var i = 0; i < n; i++) {
      var a = P[i], b = P[(i + 1) % P.length], L = Math.hypot(b.x - a.x, b.y - a.y) / k;
      var i0 = G.v(a.x, a.y, z0, acc / 6, z0 / k / 8), i1 = G.v(b.x, b.y, z0, (acc + L) / 6, z0 / k / 8),
        i2 = G.v(b.x, b.y, z1, (acc + L) / 6, z1 / k / 8), i3 = G.v(a.x, a.y, z1, acc / 6, z1 / k / 8);
      G.quad(i0, i1, i2, i3);
      acc += L;
    }
  }

  // โรงซ่อมอากาศยาน: ผนังถึงชายคา + หลังคาโค้งตามด้านยาว (ถ้าผังเกือบเป็นสี่เหลี่ยม)
  function hangar(C, P, h, k, roofCol, wallCol) {
    var O = obb(P);
    if (!O || polyArea(P) / O.A < 0.86) return false;
    var span = O.v1 - O.v0, rise = Math.min(span * 0.16, 7 * k), eave = h - rise, NJ = 10;
    var corner = [obbPt(O, O.u0, O.v0), obbPt(O, O.u1, O.v0), obbPt(O, O.u1, O.v1), obbPt(O, O.u0, O.v1)];
    walls(C, corner, 0, eave, wallCol);
    var prof = [];
    for (var j = 0; j <= NJ; j++) {
      var t = j / NJ, v = O.v0 + span * t;
      prof.push({ v: v, z: eave + rise * (1 - Math.pow(2 * t - 1, 2)) });
    }
    for (j = 0; j < NJ; j++) {
      var A = obbPt(O, O.u0, prof[j].v), Bp = obbPt(O, O.u1, prof[j].v), Cc = obbPt(O, O.u1, prof[j + 1].v), Dd = obbPt(O, O.u0, prof[j + 1].v);
      C.quad(C.v(A.x, A.y, prof[j].z, roofCol), C.v(Bp.x, Bp.y, prof[j].z, roofCol), C.v(Cc.x, Cc.y, prof[j + 1].z, roofCol), C.v(Dd.x, Dd.y, prof[j + 1].z, roofCol));
    }
    [O.u0, O.u1].forEach(function (u) {                   // หน้าจั่วโค้งปลายทั้งสอง
      var m = obbPt(O, u, (O.v0 + O.v1) / 2), cI = C.v(m.x, m.y, eave, wallCol);
      for (var jj = 0; jj < NJ; jj++) {
        var p = obbPt(O, u, prof[jj].v), q = obbPt(O, u, prof[jj + 1].v);
        C.tri(cI, C.v(p.x, p.y, prof[jj].z, wallCol), C.v(q.x, q.y, prof[jj + 1].z, wallCol));
      }
    });
    // ประตูบานใหญ่ด้านยาวทั้งสองข้าง (แถบเข้ม)
    var door = shade(wallCol, 0.62), dz = eave * 0.82;
    [[O.v0 - 0.15 * k, 1], [O.v1 + 0.15 * k, -1]].forEach(function (d) {
      var u0 = O.u0 + (O.u1 - O.u0) * 0.08, u1 = O.u1 - (O.u1 - O.u0) * 0.08;
      var p0 = obbPt(O, u0, d[0]), p1 = obbPt(O, u1, d[0]);
      C.quad(C.v(p0.x, p0.y, 0.2, door), C.v(p1.x, p1.y, 0.2, door), C.v(p1.x, p1.y, dz, door), C.v(p0.x, p0.y, dz, door));
    });
    return true;
  }

  /* SAT-1: ผนังกระจกตามผัง + หลังคาโค้งขาวยาวเกือบ 1.1 กม. ยื่นชายคาออกทั้งสองข้าง และแถบช่องแสงตามสัน */
  function buildSat1(C, M, G, P, rec, k) {
    var n = P.length, cx = 0, cy = 0;
    P.forEach(function (p) { cx += p.x; cy += p.y; }); cx /= n; cy /= n;
    var sxx = 0, sxy = 0, syy = 0;
    P.forEach(function (p) { var dx = p.x - cx, dy = p.y - cy; sxx += dx * dx; sxy += dx * dy; syy += dy * dy; });
    var ang = 0.5 * Math.atan2(2 * sxy, sxx - syy), ux = Math.cos(ang), uy = Math.sin(ang);
    var UV = P.map(function (p) { var dx = p.x - cx, dy = p.y - cy; return { u: dx * ux + dy * uy, v: -dx * uy + dy * ux }; });
    var u0 = Infinity, u1 = -Infinity;
    UV.forEach(function (q) { u0 = Math.min(u0, q.u); u1 = Math.max(u1, q.u); });
    function at(u, v, z) { return { x: cx + ux * u - uy * v, y: cy + uy * u + ux * v, z: z }; }
    function span(u) {                                     // ความกว้างของผังที่ตำแหน่ง u
      var lo = Infinity, hi = -Infinity;
      for (var i = 0; i < UV.length; i++) {
        var a = UV[i], b = UV[(i + 1) % UV.length];
        if ((a.u - u) * (b.u - u) > 0 || a.u === b.u) continue;
        var t = (u - a.u) / (b.u - a.u), v = a.v + (b.v - a.v) * t;
        lo = Math.min(lo, v); hi = Math.max(hi, v);
      }
      return lo < hi ? [lo, hi] : null;
    }
    var HW = 15 * k, RISE = 6 * k, OVER = 3 * k, NJ = 10, step = 12 * k;
    glassWalls(G, ccw(P), 0, HW, k);
    var rows = [];
    for (var u = u0 + 0.5 * k; u <= u1 - 0.5 * k + 1e-6; u += step) { var sp = span(u); if (sp) rows.push({ u: u, lo: sp[0] - OVER, hi: sp[1] + OVER }); }
    var sp1 = span(u1 - 0.5 * k); if (sp1) rows.push({ u: u1 - 0.5 * k, lo: sp1[0] - OVER, hi: sp1[1] + OVER });
    var white = hexRGB(rec.c || "#f1f0df"), edge = shade(white, 0.86), sky = [0.55, 0.66, 0.74];
    function rz(t) { return HW + 1.5 * k + RISE * (1 - Math.pow(2 * t - 1, 2)); }
    for (var r = 0; r < rows.length - 1; r++) {
      var A = rows[r], B = rows[r + 1];
      for (var j = 0; j < NJ; j++) {
        var t0 = j / NJ, t1 = (j + 1) / NJ;
        var p = [at(A.u, A.lo + (A.hi - A.lo) * t0, rz(t0)), at(B.u, B.lo + (B.hi - B.lo) * t0, rz(t0)),
          at(B.u, B.lo + (B.hi - B.lo) * t1, rz(t1)), at(A.u, A.lo + (A.hi - A.lo) * t1, rz(t1))];
        var col = j === NJ / 2 - 1 || j === NJ / 2 ? sky : white;
        M.quad(M.v(p[0].x, p[0].y, p[0].z, col), M.v(p[1].x, p[1].y, p[1].z, col), M.v(p[2].x, p[2].y, p[2].z, col), M.v(p[3].x, p[3].y, p[3].z, col));
      }
      // ขอบชายคา (fascia) สองข้าง
      [["lo", 0], ["hi", 1]].forEach(function (s) {
        var a = at(A.u, A[s[0]], rz(s[1])), b = at(B.u, B[s[0]], rz(s[1]));
        C.quad(C.v(a.x, a.y, a.z - 1.2 * k, edge), C.v(b.x, b.y, b.z - 1.2 * k, edge), C.v(b.x, b.y, b.z, edge), C.v(a.x, a.y, a.z, edge));
      });
    }
    [rows[0], rows[rows.length - 1]].forEach(function (R) {  // ปิดปลายหลังคา
      var m = at(R.u, (R.lo + R.hi) / 2, HW), cI = C.v(m.x, m.y, m.z, edge);
      for (var j = 0; j < NJ; j++) {
        var a = at(R.u, R.lo + (R.hi - R.lo) * j / NJ, rz(j / NJ)), b = at(R.u, R.lo + (R.hi - R.lo) * (j + 1) / NJ, rz((j + 1) / NJ));
        C.tri(cI, C.v(a.x, a.y, a.z, edge), C.v(b.x, b.y, b.z, edge));
      }
    });
    return { top: HW + 1.5 * k + RISE };
  }

  function buildBuildings(C, M, G) {
    model.blds = [];
    model.walls = { 0: [], 1: [] };                        // ผังอาคารผู้โดยสาร → จุดยึดสะพานเทียบ
    D.buildings.forEach(function (rec) {
      var P = ccw(decode(rec.p));
      if (P.length < 3) return;
      var k = P[0].k, h = rec.h * k, roof = hexRGB(rec.c || ROOF_DEF[rec.k] || ROOF_DEF.building);
      var wall = mixc(shade(roof, 0.82), WALL_GRAY, 0.55);
      var r0 = { c: C.i.length, m: M.i.length, g: G.i.length };
      if (rec.k === "sat1") {
        buildSat1(C, M, G, P, rec, k);
        model.walls[rec.a].push(P);
      } else if (rec.k === "terminal") {
        glassWalls(G, P, 0, h, k);
        walls(C, P, h - 1.2 * k, h + 0.6 * k, shade(wall, 0.9));   // ขอบหลังคา
        roofTop(C, P, h + 0.6 * k, roof);
        model.walls[rec.a].push(P);
      } else if (rec.k === "hangar") {
        if (!hangar(C, P, h, k, roof, wall)) { walls(C, P, 0, h, wall); roofTop(C, P, h, roof); }
      } else if (rec.k === "roof" || rec.k === "tent") {
        var z0 = Math.max(0, h - 1 * k);
        walls(C, P, z0, h, wall);
        roofTop(C, P, h, roof);
        roofTop(C, P, z0, shade(wall, 0.7));
      } else {
        var mh = (rec.mh || 0) * k;
        walls(C, P, mh, h, wall);
        roofTop(C, P, h, roof);
      }
      var bx = new T.Box3();
      P.forEach(function (p) { bx.expandByPoint(new T.Vector3(p.x, p.y, 0)); });
      bx.max.z = h + 8 * k;
      model.blds.push({ rec: rec, P: P, box: bx, r: [r0, { c: C.i.length, m: M.i.length, g: G.i.length }] });
    });
  }

  /* ---------------------------------------------- อาคารผู้โดยสารสุวรรณภูมิ
     โถงผู้โดยสาร: กล่องกระจก + หลังคาใหญ่โค้งนูน ~567×210 ม. แถบโครงถัก 7 แนว (สว่าง) สลับช่องแสงกระจก (เข้ม) + เสาเหล็กรับหลังคา
     แขนเทียบเครื่องบิน A–G: ฐานกระจก + หลังคาเมมเบรนทรงอุโมงค์ แบ่งช่วงละ ~27 ม. ผืนผ้าขาวรูปครึ่งวงกลมสลับกระจกตรงมุม
     (มองจากฟ้าเห็นเป็นเกล็ดขาวต่อกัน ตามภาพดาวเทียมจริง) + ซี่โครงเหล็กตามแนวแบ่งช่วง */
  function buildBkkTerminal(C, M, G) {
    var TT = D.terminal, F = frameFn(D.frame), k = F.k;
    var HB = 10 * k, RV = 9.5 * k, BAY = 27;
    var memb = [0.97, 0.975, 0.98], glassDark = [0.26, 0.34, 0.43], steel = [0.66, 0.69, 0.73];
    var ranges = [];
    model.bkkArms = [];
    TT.arms.forEach(function (A0) {
      var A = { id: A0.id, u0: A0.u0, v0: A0.v0, u1: A0.u1, v1: A0.v1, w: A0.w };
      // ปลายที่ชนแขนกากบาท → ต่อเข้าไปถึงกึ่งกลางจุดตัด ให้หลังคาอุโมงค์ตัดกันเต็มรูป ไม่เปิดเป็นรู
      TT.hubs.forEach(function (hb) {
        if (Math.hypot(A.u0 - hb.u, A.v0 - hb.v) < 32) { A.u0 = hb.u; A.v0 = hb.v; }
        if (Math.hypot(A.u1 - hb.u, A.v1 - hb.v) < 32) { A.u1 = hb.u; A.v1 = hb.v; A.capless = true; }
      });
      var du = A.u1 - A.u0, dv = A.v1 - A.v0, len = Math.hypot(du, dv), tu = du / len, tv = dv / len, nu = -tv, nv = tu, hw = A.w / 2;
      var r0 = { c: C.i.length, m: M.i.length, g: G.i.length };
      function P(t, o) { return F.at(A.u0 + tu * t + nu * o, A.v0 + tv * t + nv * o); }
      function zv(o) { var q = Math.min(1, Math.abs(o) / hw); return HB + RV * Math.pow(Math.max(0, 1 - q * q), 0.55); }
      function V(B, t, o, col, dz) { var p = P(t, o); return B.v(p.x, p.y, zv(o) + (dz || 0), col); }
      var c0 = P(0, -hw), c1 = P(len, -hw), c2 = P(len, hw), c3 = P(0, hw);
      glassWalls(G, A.capless ? [c0, c1] : [c0, c1, c2, c3], 0, HB, k, false);
      if (A.capless) glassWalls(G, [c2, c3], 0, HB, k, false);
      var nb = Math.max(1, Math.round(len / BAY)), bl = len / nb, NR = 4, NA = 12;
      for (var b = 0; b < nb; b++) {
        var t0 = b * bl;
        // ผืนเมมเบรนครึ่งวงกลม (ฐานแบนอยู่ด้านจุดตัด โค้งออกด้านปลายแขน)
        var rings = [];
        for (var ri = 1; ri <= NR; ri++) {
          var row = [];
          for (var ai = 0; ai <= NA; ai++) {
            var ph = -Math.PI / 2 + Math.PI * ai / NA, rho = ri / NR;
            row.push(V(M, t0 + rho * Math.cos(ph) * bl, rho * Math.sin(ph) * hw * 0.999, memb));
          }
          rings.push(row);
        }
        var cen = V(M, t0, 0, memb);
        for (ai = 0; ai < NA; ai++) M.tri(cen, rings[0][ai], rings[0][ai + 1]);
        for (ri = 0; ri < NR - 1; ri++) for (ai = 0; ai < NA; ai++) M.quad(rings[ri][ai], rings[ri + 1][ai], rings[ri + 1][ai + 1], rings[ri][ai + 1]);
        // มุมกระจกสองข้าง (ระหว่างขอบโค้งกับมุมช่วง)
        [1, -1].forEach(function (s) {
          var corner = V(C, t0 + bl, s * hw, glassDark), prev = null;
          for (var aj = 0; aj <= NA / 2; aj++) {
            var ph2 = s * Math.PI / 2 * (1 - aj / (NA / 2));
            var cur = V(C, t0 + Math.cos(ph2) * bl, Math.sin(ph2) * hw * 0.999, glassDark);
            if (prev != null) C.tri(corner, prev, cur);
            prev = cur;
          }
        });
        // ซี่โครงเหล็กตามแนวแบ่งช่วง
        if (b > 0) for (var j = 0; j < 10; j++) {
          var oa = -hw + 2 * hw * j / 10, ob = -hw + 2 * hw * (j + 1) / 10;
          C.quad(V(C, t0 - 0.7, oa, steel, 0.35 * k), V(C, t0 + 0.7, oa, steel, 0.35 * k), V(C, t0 + 0.7, ob, steel, 0.35 * k), V(C, t0 - 0.7, ob, steel, 0.35 * k));
        }
      }
      if (!A.capless) {                                  // ปิดปลายแขนด้วยผนังกระจกครึ่งวงรี
        var e0 = P(len, 0), ci = C.v(e0.x, e0.y, HB, glassDark);
        for (var jj = 0; jj < 14; jj++) {
          var o1 = -hw + 2 * hw * jj / 14, o2 = -hw + 2 * hw * (jj + 1) / 14;
          C.tri(ci, V(C, len, o1, glassDark), V(C, len, o2, glassDark));
        }
      }
      ranges.push({ arm: A0, r: [r0, { c: C.i.length, m: M.i.length, g: G.i.length }] });
      // ผังแขน (สี่เหลี่ยม) → ใช้เป็นผนังยึดสะพานเทียบ + ใช้คลิก
      var ring = [P(0, -hw), P(len, -hw), P(len, hw), P(0, hw)];
      model.walls[1].push(ring);
      model.bkkArms.push({ arm: A0, P: ring, top: HB + RV });
    });

    // โถงผู้โดยสาร
    var hl = TT.hall, r1 = { c: C.i.length, m: M.i.length, g: G.i.length };
    var box = [F.at(hl.u0 + 22, hl.v0 + 4), F.at(hl.u1 - 22, hl.v0 + 4), F.at(hl.u1 - 22, hl.v1 - 24), F.at(hl.u0 + 22, hl.v1 - 24)];
    var HH = 30 * k;
    glassWalls(G, box, 0, HH, k);
    roofTop(C, box, HH, [0.55, 0.58, 0.62]);
    var vc = (hl.v0 + hl.v1) / 2, hv = (hl.v1 - hl.v0) / 2;
    function zr(v) { return (36 + 5.5 * (1 - Math.pow((v - vc) / hv, 2))) * k; }
    var bands = [], NBAND = 7, BW = 14;
    for (var i = 0; i < NBAND; i++) bands.push(hl.u0 + 8 + (hl.u1 - hl.u0 - 16) * i / (NBAND - 1));
    var us = [hl.u0];
    bands.forEach(function (c) { us.push(Math.max(hl.u0, c - BW / 2), Math.min(hl.u1, c + BW / 2)); });
    us.push(hl.u1);
    us = us.filter(function (u, ix) { return ix === 0 || u > us[ix - 1] + 0.01; });
    var vs = [hl.v0, hl.v0 + 18];
    for (var vv = hl.v0 + 18 + 19.6; vv < hl.v1 - 18; vv += 19.6) vs.push(vv);
    vs.push(hl.v1 - 18, hl.v1);
    var metal = [0.9, 0.915, 0.93], sky = [0.24, 0.31, 0.39], under = [0.72, 0.74, 0.77];
    for (var a = 0; a < us.length - 1; a++) {
      var um = (us[a] + us[a + 1]) / 2, inBand = bands.some(function (c) { return Math.abs(um - c) <= BW / 2 + 0.01; });
      for (var bq = 0; bq < vs.length - 1; bq++) {
        var vm = (vs[bq] + vs[bq + 1]) / 2, col = inBand || vm < hl.v0 + 18 || vm > hl.v1 - 18 ? metal : sky;
        var p = [F.at(us[a], vs[bq]), F.at(us[a + 1], vs[bq]), F.at(us[a + 1], vs[bq + 1]), F.at(us[a], vs[bq + 1])];
        var z0 = zr(vs[bq]), z1 = zr(vs[bq + 1]);
        C.quad(C.v(p[0].x, p[0].y, z0, col), C.v(p[1].x, p[1].y, z0, col), C.v(p[2].x, p[2].y, z1, col), C.v(p[3].x, p[3].y, z1, col));
        C.quad(C.v(p[0].x, p[0].y, z0 - 2.4 * k, under), C.v(p[1].x, p[1].y, z0 - 2.4 * k, under), C.v(p[2].x, p[2].y, z1 - 2.4 * k, under), C.v(p[3].x, p[3].y, z1 - 2.4 * k, under));
      }
    }
    // ขอบหลังคา
    var edgeCol = [0.8, 0.82, 0.85];
    [[hl.u0, hl.u1, hl.v0, hl.v0], [hl.u0, hl.u1, hl.v1, hl.v1]].forEach(function (e) {
      var pa = F.at(e[0], e[2]), pb = F.at(e[1], e[3]), z = zr(e[2]);
      C.quad(C.v(pa.x, pa.y, z - 2.4 * k, edgeCol), C.v(pb.x, pb.y, z - 2.4 * k, edgeCol), C.v(pb.x, pb.y, z, edgeCol), C.v(pa.x, pa.y, z, edgeCol));
    });
    [hl.u0, hl.u1].forEach(function (u) {
      for (var q = 0; q < vs.length - 1; q++) {
        var pa = F.at(u, vs[q]), pb = F.at(u, vs[q + 1]), za = zr(vs[q]), zb = zr(vs[q + 1]);
        C.quad(C.v(pa.x, pa.y, za - 2.4 * k, edgeCol), C.v(pb.x, pb.y, zb - 2.4 * k, edgeCol), C.v(pb.x, pb.y, zb, edgeCol), C.v(pa.x, pa.y, za, edgeCol));
      }
    });
    // เสารับหลังคา (ทรงเรียวบานขึ้น) — แถวริมถนนขาออก + ริมลานจอด
    var colC = [0.5, 0.53, 0.57];
    bands.forEach(function (u) {
      [hl.v0 + 6, hl.v1 - 16].forEach(function (v) {
        var zt = zr(v) - 2.4 * k, b0 = 0.9, b1 = 1.8;
        var bot = [F.at(u - b0, v - b0), F.at(u + b0, v - b0), F.at(u + b0, v + b0), F.at(u - b0, v + b0)];
        var top = [F.at(u - b1, v - b1), F.at(u + b1, v - b1), F.at(u + b1, v + b1), F.at(u - b1, v + b1)];
        for (var s = 0; s < 4; s++) {
          var n2 = (s + 1) % 4;
          C.quad(C.v(bot[s].x, bot[s].y, 0, colC), C.v(bot[n2].x, bot[n2].y, 0, colC), C.v(top[n2].x, top[n2].y, zt, colC), C.v(top[s].x, top[s].y, zt, colC));
        }
      });
    });
    ranges.push({ hall: true, r: [r1, { c: C.i.length, m: M.i.length, g: G.i.length }] });
    var hallRing = [F.at(hl.u0, hl.v0), F.at(hl.u1, hl.v0), F.at(hl.u1, hl.v1), F.at(hl.u0, hl.v1)];
    model.bkkHall = { P: hallRing, top: zr(vc), box: box };
    model.bkkRanges = ranges;
  }

  /* หอบังคับการบินสุวรรณภูมิ 132.2 ม. — แกนเรียวสูง บานออกรับห้องควบคุมกระจกรอบทิศ หลังคาและเสาอากาศ */
  function buildTower(C, G, L) {
    var tw = D.tower;
    if (!tw) return;
    var c = loc(tw.p[0], tw.p[1]), k = c.k, N = 24;
    var conc = [0.83, 0.84, 0.86], dark = [0.45, 0.48, 0.52];
    var prof = [[13, 0, dark], [13, 7, dark], [7.4, 7, conc], [6.3, 45, conc], [5.5, 98, conc], [5.4, 104, conc], [9.8, 112, conc],
      [11.2, 114, dark], [12.9, 122.5, null], [13.3, 122.5, conc], [13.3, 124, conc], [7.2, 126, conc], [6.2, 129.5, dark], [0.8, 129.5, dark]];
    function ringPt(r, t) { return { x: c.x + r * k * Math.cos(t), y: c.y + r * k * Math.sin(t) }; }
    for (var i = 0; i < prof.length - 1; i++) {
      var a = prof[i], b = prof[i + 1];
      for (var s = 0; s < N; s++) {
        var t0 = s / N * Math.PI * 2, t1 = (s + 1) / N * Math.PI * 2;
        var p0 = ringPt(a[0], t0), p1 = ringPt(a[0], t1), p2 = ringPt(b[0], t1), p3 = ringPt(b[0], t0);
        if (!b[2]) {                                        // ห้องควบคุม: กระจกเอียงออก
          var u0 = s / N * 2 * Math.PI * 12 / 6, u1 = (s + 1) / N * 2 * Math.PI * 12 / 6;
          G.quad(G.v(p0.x, p0.y, a[1] * k, u0, 0.1), G.v(p1.x, p1.y, a[1] * k, u1, 0.1), G.v(p2.x, p2.y, b[1] * k, u1, 0.9), G.v(p3.x, p3.y, b[1] * k, u0, 0.9));
          continue;
        }
        var col = a[2];
        C.quad(C.v(p0.x, p0.y, a[1] * k, col), C.v(p1.x, p1.y, a[1] * k, col), C.v(p2.x, p2.y, b[1] * k, col), C.v(p3.x, p3.y, b[1] * k, col));
      }
    }
    // เสาอากาศบนยอด
    var m0 = c;
    C.quad(C.v(m0.x - 0.3 * k, m0.y, 129.5 * k, dark), C.v(m0.x + 0.3 * k, m0.y, 129.5 * k, dark), C.v(m0.x + 0.1 * k, m0.y, tw.h * k, dark), C.v(m0.x - 0.1 * k, m0.y, tw.h * k, dark));
    C.quad(C.v(m0.x, m0.y - 0.3 * k, 129.5 * k, dark), C.v(m0.x, m0.y + 0.3 * k, 129.5 * k, dark), C.v(m0.x, m0.y + 0.1 * k, tw.h * k, dark), C.v(m0.x, m0.y - 0.1 * k, tw.h * k, dark));
    light(L, c, tw.h * k, LC.red);
    light(L, c, 126.5 * k, LC.red);
    model.tower = { c: c, k: k, h: tw.h, r: 13.3 * k };
  }

  function buildWindsocks(C) {
    D.windsocks.forEach(function (w) {
      var p = loc(w[0], w[1]), k = p.k, pole = [0.7, 0.72, 0.75];
      C.quad(C.v(p.x - 0.15 * k, p.y, 0, pole), C.v(p.x + 0.15 * k, p.y, 0, pole), C.v(p.x + 0.1 * k, p.y, 6.5 * k, pole), C.v(p.x - 0.1 * k, p.y, 6.5 * k, pole));
      for (var s = 0; s < 5; s++) {                         // ถุงลมส้ม-ขาว ชี้ไปทางเหนือ (ลมมรสุมตะวันตกเฉียงใต้)
        var col = s % 2 ? [0.96, 0.96, 0.96] : [0.95, 0.42, 0.1];
        var y0 = p.y + s * 0.9 * k, y1 = y0 + 0.9 * k, r0 = (0.45 - s * 0.05) * k, r1 = (0.4 - s * 0.05) * k, z = 6.3 * k;
        for (var q = 0; q < 6; q++) {
          var a0 = q / 6 * Math.PI * 2, a1 = (q + 1) / 6 * Math.PI * 2;
          C.quad(C.v(p.x + r0 * Math.cos(a0), y0, z + r0 * Math.sin(a0), col), C.v(p.x + r0 * Math.cos(a1), y0, z + r0 * Math.sin(a1), col),
            C.v(p.x + r1 * Math.cos(a1), y1, z - 0.05 * k + r1 * Math.sin(a1), col), C.v(p.x + r1 * Math.cos(a0), y1, z - 0.05 * k + r1 * Math.sin(a0), col));
        }
      }
    });
  }

  /* ------------------------------------------------------ ฝูงเครื่องบิน (instanced)
     หนึ่ง InstancedMesh ต่อตระกูลเครื่องบิน · สีสายการบินต่อลำเป็น attribute (ดู bkk-aircraft-models.js) */
  var geoCache = {};
  var _m4 = null, _q = null, _eu = null, _p3 = null, _s3 = null;
  function planeMatrix(x, y, z, hdg, pitch, roll, sc) {
    if (!_m4) { _m4 = new T.Matrix4(); _q = new T.Quaternion(); _eu = new T.Euler(0, 0, 0, "ZYX"); _p3 = new T.Vector3(); _s3 = new T.Vector3(); }
    _eu.set(roll, -pitch, (90 - hdg) * Math.PI / 180, "ZYX");
    _q.setFromEuler(_eu);
    _p3.set(x, y, z); _s3.set(sc, sc, sc);
    return _m4.compose(_p3, _q, _s3);
  }
  function Fleet(cap, parent) {
    this.cap = cap; this.parent = parent; this.by = {};
  }
  Fleet.prototype.get = function (cls) {
    var f = this.by[cls];
    if (f) return f;
    if (!geoCache[cls]) geoCache[cls] = AC.geometry(T, cls);
    var g = geoCache[cls].clone(), n = this.cap;
    ["cBody", "cTail", "cBelly", "cEng"].forEach(function (a) { g.setAttribute(a, new T.InstancedBufferAttribute(new Float32Array(n * 3), 3)); });
    g.setAttribute("gear", new T.InstancedBufferAttribute(new Float32Array(n), 1));
    g.setAttribute("hl", new T.InstancedBufferAttribute(new Float32Array(n), 1));
    var m = new T.InstancedMesh(g, model.planeMat, n);
    m.count = 0;
    m.frustumCulled = false;
    m.instanceMatrix.setUsage(T.DynamicDrawUsage);
    this.parent.add(m);
    f = this.by[cls] = { mesh: m, g: g, n: 0 };
    return f;
  };
  // ใส่ลำที่ i ของตระกูล cls
  Fleet.prototype.set = function (cls, i, mtx, air, gear, hl) {
    var f = this.get(cls), a = air.a, g = f.g;
    f.mesh.setMatrixAt(i, mtx);
    var cols = [a[1], a[2], a[3], a[4]];
    ["cBody", "cTail", "cBelly", "cEng"].forEach(function (nm, j) { var c = AC.hex(cols[j]); g.attributes[nm].setXYZ(i, c[0], c[1], c[2]); });
    g.attributes.gear.setX(i, gear ? 1 : 0);
    g.attributes.hl.setX(i, hl || 0);
  };
  Fleet.prototype.commit = function (counts) {
    var self = this;
    Object.keys(this.by).forEach(function (cls) {
      var f = self.by[cls], g = f.g;
      f.mesh.count = counts ? counts[cls] || 0 : f.mesh.count;
      f.mesh.visible = f.mesh.count > 0;
      f.mesh.instanceMatrix.needsUpdate = true;
      ["cBody", "cTail", "cBelly", "cEng", "gear", "hl"].forEach(function (nm) { g.attributes[nm].needsUpdate = true; });
    });
  };

  /* เงาเครื่องบินบนพื้น: สี่เหลี่ยมจาง 2 แผ่น (ลำตัว + ปีก) ต่อลำ */
  function ShadowSet(cap, parent) {
    var g = new T.PlaneGeometry(1, 1);
    this.mesh = new T.InstancedMesh(g, H.shadowMaterial("rect"), cap * 2);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;
    this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    parent.add(this.mesh);
  }
  ShadowSet.prototype.put = function (i, x, y, hdg, len, span, wid, k) {
    var r = (90 - hdg) * Math.PI / 180;
    if (!_m4) planeMatrix(0, 0, 0, 0, 0, 0, 1);
    _q.setFromAxisAngle(new T.Vector3(0, 0, 1), r);
    _p3.set(x, y, 0.08); _s3.set(len * k, wid * k, 1);
    this.mesh.setMatrixAt(i * 2, _m4.compose(_p3, _q, _s3));
    _s3.set(wid * 2.4 * k, span * k, 1);
    this.mesh.setMatrixAt(i * 2 + 1, _m4.compose(_p3, _q, _s3));
  };

  /* --------------------------------------------- เครื่องบินจอด (ภาพประกอบ) + สะพานเทียบ */
  var MIX = {
    DMK: { n: [["AIQ", "A320", 5], ["AIQ", "A20N", 2], ["TLM", "B738", 2.4], ["NOK", "B738", 1.4], ["NOK", "DH8D", 0.5], ["TLM", "B39M", 0.5]],
      w: [["TAX", "A333", 1], ["TLM", "A333", 0.5]] },
    BKK: { n: [["TVJ", "A320", 3], ["TVJ", "A321", 2], ["THA", "A20N", 1.5], ["BKP", "A320", 1.5], ["BKP", "A319", 1], ["TGW", "A20N", 1],
        ["VJC", "A321", 1], ["HVN", "A321", 1], ["MAS", "B738", 1], ["GIA", "B738", 0.7], ["IGO", "A21N", 1], ["AIC", "A20N", 0.6], ["CEB", "A20N", 0.5],
        ["JJA", "B738", 0.7], ["CES", "A320", 0.8], ["CSN", "A20N", 0.6], ["SIA", "B38M", 0.6], ["MMA", "A20N", 0.3], ["LAO", "A20N", 0.3], ["BKP", "AT76", 0.9]],
      w: [["THA", "B77W", 3], ["THA", "A359", 3], ["THA", "B788", 2], ["THA", "A333", 1.5], ["UAE", "B77W", 1.5], ["QTR", "B77W", 1], ["QTR", "A359", 1],
        ["EVA", "B77W", 1], ["CPA", "A359", 1], ["SIA", "A359", 1], ["ETD", "B789", 0.8], ["JAL", "B788", 0.6], ["CAL", "A359", 0.6], ["KAL", "B77W", 0.5],
        ["ANA", "B788", 0.6], ["THY", "A359", 0.6], ["CSN", "A333", 0.5], ["MAS", "A333", 0.6], ["HVN", "A359", 0.5], ["FDX", "B77L", 0.3], ["UAE", "A388", 0.4]] }
  };
  var DOORS = { narrow: [5.4], regional: [4.6], wide: [8.6, 21], b747: [8.2, 20], a380: [10.5, 23] };
  function pick3(list, r) {
    var tot = 0; list.forEach(function (e) { tot += e[2]; });
    var x = r * tot;
    for (var i = 0; i < list.length; i++) { x -= list[i][2]; if (x <= 0) return list[i]; }
    return list[list.length - 1];
  }
  function obbHit(A, B) {
    var axes = [[A.fx, A.fy], [-A.fy, A.fx], [B.fx, B.fy], [-B.fy, B.fx]];
    for (var i = 0; i < 4; i++) {
      var ax = axes[i][0], ay = axes[i][1];
      var pa = Math.abs(A.hl * (A.fx * ax + A.fy * ay)) + Math.abs(A.hw * (-A.fy * ax + A.fx * ay));
      var pb = Math.abs(B.hl * (B.fx * ax + B.fy * ay)) + Math.abs(B.hw * (-B.fy * ax + B.fx * ay));
      if (Math.abs((B.x - A.x) * ax + (B.y - A.y) * ay) > pa + pb) return false;
    }
    return true;
  }
  function nearestWall(p, rings) {
    var best = null;
    rings.forEach(function (P) {
      for (var i = 0; i < P.length; i++) {
        var a = P[i], b = P[(i + 1) % P.length], dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
        if (!L2) continue;
        var t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2));
        var x = a.x + dx * t, y = a.y + dy * t, d = Math.hypot(p.x - x, p.y - y);
        if (!best || d < best.d) best = { x: x, y: y, d: d };
      }
    });
    return best;
  }
  // กล่องยาวจาก a ไป b (พื้นลาดจาก za ถึง zb) กว้าง w สูง h
  function slab(C, a, b, w, za, zb, h, col, side) {
    var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2;
    var P = [[a.x - nx, a.y - ny, za], [b.x - nx, b.y - ny, zb], [b.x + nx, b.y + ny, zb], [a.x + nx, a.y + ny, za]];
    var v = [];
    P.forEach(function (q) { v.push(C.v(q[0], q[1], q[2], col)); });
    P.forEach(function (q) { v.push(C.v(q[0], q[1], q[2] + h, col)); });
    C.quad(v[0], v[1], v[2], v[3]); C.quad(v[4], v[5], v[6], v[7]);
    C.quad(v[3], v[0], v[4], v[7]); C.quad(v[1], v[2], v[6], v[5]);
    var sc = side || col;
    [[0, 1], [2, 3]].forEach(function (e) {                 // ผนังข้าง: แถบหน้าต่างเข้มตรงกลาง
      var p0 = P[e[0]], p1 = P[e[1]];
      C.quad(C.v(p0[0], p0[1], p0[2], col), C.v(p1[0], p1[1], p1[2], col), C.v(p1[0], p1[1], p1[2] + h * 0.3, col), C.v(p0[0], p0[1], p0[2] + h * 0.3, col));
      C.quad(C.v(p0[0], p0[1], p0[2] + h * 0.3, sc), C.v(p1[0], p1[1], p1[2] + h * 0.3, sc), C.v(p1[0], p1[1], p1[2] + h * 0.8, sc), C.v(p0[0], p0[1], p0[2] + h * 0.8, sc));
      C.quad(C.v(p0[0], p0[1], p0[2] + h * 0.8, col), C.v(p1[0], p1[1], p1[2] + h * 0.8, col), C.v(p1[0], p1[1], p1[2] + h, col), C.v(p0[0], p0[1], p0[2] + h, col));
    });
  }
  function post(C, x, y, z0, z1, r, col) {
    C.quad(C.v(x - r, y, z0, col), C.v(x + r, y, z0, col), C.v(x + r, y, z1, col), C.v(x - r, y, z1, col));
    C.quad(C.v(x, y - r, z0, col), C.v(x, y + r, z0, col), C.v(x, y + r, z1, col), C.v(x, y - r, z1, col));
  }
  function jetBridge(C, door, W, f, k, doorZ) {
    var ux = door.x - W.x, uy = door.y - W.y, d = Math.hypot(ux, uy);
    ux /= d; uy /= d;
    var R = { x: W.x + ux * 3.2 * k, y: W.y + uy * 3.2 * k };
    var cab = { x: door.x - ux * 1.9 * k, y: door.y - uy * 1.9 * k };
    var floor = Math.max(4.6 * k, doorZ + 0.4 * k), body = [0.86, 0.88, 0.9], glassB = [0.3, 0.38, 0.46], leg = [0.38, 0.4, 0.44];
    // โรทันดา
    for (var s = 0; s < 8; s++) {
      var a0 = s / 8 * Math.PI * 2, a1 = (s + 1) / 8 * Math.PI * 2, r = 2.6 * k;
      var p0 = { x: R.x + r * Math.cos(a0), y: R.y + r * Math.sin(a0) }, p1 = { x: R.x + r * Math.cos(a1), y: R.y + r * Math.sin(a1) };
      C.quad(C.v(p0.x, p0.y, floor - 0.4 * k, body), C.v(p1.x, p1.y, floor - 0.4 * k, body), C.v(p1.x, p1.y, floor + 3.4 * k, body), C.v(p0.x, p0.y, floor + 3.4 * k, body));
      C.tri(C.v(R.x, R.y, floor + 3.4 * k, body), C.v(p0.x, p0.y, floor + 3.4 * k, body), C.v(p1.x, p1.y, floor + 3.4 * k, body));
    }
    post(C, R.x, R.y, 0, floor - 0.4 * k, 0.9 * k, leg);
    // อุโมงค์สองท่อนสวมกัน + ห้องหัวสะพาน
    var mid = { x: R.x + (cab.x - R.x) * 0.56, y: R.y + (cab.y - R.y) * 0.56 }, zm = floor + (doorZ - floor) * 0.56;
    slab(C, R, mid, 3.1 * k, floor, zm, 3.2 * k, body, glassB);
    slab(C, { x: mid.x - ux * 0.8 * k, y: mid.y - uy * 0.8 * k }, cab, 2.7 * k, zm, doorZ, 2.9 * k, body, glassB);
    var cf = { x: cab.x - f.x * 1.9 * k, y: cab.y - f.y * 1.9 * k }, cb = { x: cab.x + f.x * 1.9 * k, y: cab.y + f.y * 1.9 * k };
    slab(C, cf, cb, 3.8 * k, doorZ - 0.2 * k, doorZ - 0.2 * k, 3.3 * k, body, glassB);
    // ขาล้อขับเคลื่อน
    var lg = { x: R.x + (cab.x - R.x) * 0.72, y: R.y + (cab.y - R.y) * 0.72 }, zl = floor + (doorZ - floor) * 0.72;
    [-1, 1].forEach(function (sd) {
      post(C, lg.x - uy * sd * 1.2 * k, lg.y + ux * sd * 1.2 * k, 0.6 * k, zl, 0.25 * k, leg);
    });
    slab(C, { x: lg.x - uy * 1.8 * k, y: lg.y + ux * 1.8 * k }, { x: lg.x + uy * 1.8 * k, y: lg.y - ux * 1.8 * k }, 1.0 * k, 0, 0, 0.9 * k, leg);
  }

  function buildParked(C) {
    var fleet = new Fleet(0, model.park), counts = {}, placed = [], list = [];
    // นับก่อนเพื่อจองขนาด
    D.stands.forEach(function (s, idx) {
      var ap = D.airports[s.a].id, R = rng(9173 + idx * 31);
      if (R() > (s.c ? 0.82 : 0.6)) return;
      var span = s.s, mixList;
      if (span >= 62 && MIX[ap].w) mixList = MIX[ap].w;
      else mixList = MIX[ap].n.filter(function (e) { return e[1] !== "AT76" || !s.c; });
      var ch = pick3(mixList, R());
      if (ch[1] === "A388" && span < 76) ch = MIX[ap].w[0];
      var info = AC.typeInfo(ch[1]), Ccls = AC.CLASSES[info.cls], sc = AC.scaleOf(info);
      var n = loc(s.p[0], s.p[1]), k = n.k, h = s.h * Math.PI / 180, fx = Math.sin(h), fy = Math.cos(h);
      var Lm = info.L, Sm = Ccls.S * sc;
      var cx = n.x - fx * Lm / 2 * k, cy = n.y - fy * Lm / 2 * k;
      var box = { x: cx, y: cy, fx: fx, fy: fy, hl: (Lm / 2 + 1.5) * k, hw: (Sm / 2 + 1.5) * k };
      if (placed.some(function (o) { return obbHit(o, box); })) return;
      placed.push(box);
      list.push({ s: s, idx: idx, info: info, air: { code: ch[0], a: AC.AIRLINES[ch[0]] || AC.GENERIC }, x: cx, y: cy, k: k, hdg: s.h, sc: sc, f: { x: fx, y: fy }, nose: n, Sm: Sm });
      counts[info.cls] = (counts[info.cls] || 0) + 1;
    });
    fleet.cap = 0;
    Object.keys(counts).forEach(function (c) { fleet.cap = Math.max(fleet.cap, counts[c]); });
    var used = {};
    var shadows = new ShadowSet(list.length, model.park);
    list.forEach(function (P, i) {
      var cls = P.info.cls, j = used[cls] || 0;
      used[cls] = j + 1;
      P.slot = j;
      fleet.set(cls, j, planeMatrix(P.x, P.y, 0, P.hdg, 0, 0, P.sc * P.k), P.air, true, 0);
      var Ccls = AC.CLASSES[cls];
      shadows.put(i, P.x + H.sunShift(Ccls.zc)[0] * P.k * 0.5, P.y + H.sunShift(Ccls.zc)[1] * P.k * 0.5, P.hdg, P.info.L, P.Sm, Ccls.R * 2 * P.sc, P.k);
      P.r = Math.max(P.info.L, P.Sm) / 2 * P.k;
      P.z = Ccls.zc * P.sc * P.k;
      // สะพานเทียบ
      var doors = DOORS[cls];
      if (!P.s.c || !doors) return;
      var walls2 = model.walls[P.s.a];
      doors.forEach(function (dAft, di) {
        var xl = (P.info.L / 2 - dAft * P.sc), yl = Ccls.R * P.sc + 0.2;
        var door = { x: P.nose.x + (-P.f.x * dAft * P.sc + -P.f.y * yl) * P.k, y: P.nose.y + (-P.f.y * dAft * P.sc + P.f.x * yl) * P.k };
        var W = nearestWall(door, walls2);
        if (!W || W.d < 7 * P.k || W.d > 46 * P.k) return;
        if (di > 0 && P.info.L < 60) return;
        jetBridge(C, door, W, P.f, P.k, (Ccls.zc - Ccls.R * 0.35) * P.sc * P.k);
      });
    });
    shadows.mesh.count = list.length * 2;
    shadows.mesh.instanceMatrix.needsUpdate = true;
    fleet.commit(used);
    model.parked = list;
    model.parkFleet = fleet;
  }

  /* ------------------------------------------------------------ เที่ยวบินสด
     ดึง /api/flights ทุก 5 วินาที (เฉพาะตอนชั้นเปิด แท็บแสดงอยู่ และซูมถึง) · ระหว่างรอบประมาณตำแหน่งจากความเร็ว/ทิศ
     แล้วค่อย ๆ ไหลเข้าหาค่าที่ประมาณ (ไม่กระโดด) · ลำที่หายไปเกิน 60 วินาทีถูกลบ */
  var LIVE_CAP = 96;
  var live = { F: {}, n: 0, src: "", ok: 0, err: null, busy: false, good: 0, timer: null, clockOff: 0, labels: null, follow: null, followRaf: 0, lastTrail: 0, lastCard: 0 };
  var KT = 0.514444, FPM = 0.00508, FT = 0.3048;

  function apiList() {
    var h = location.hostname, local = h === "localhost" || h === "127.0.0.1" || h === "ratthai-kaona.vercel.app";
    var direct = "https://corsproxy.io/?url=" + encodeURIComponent("https://api.adsb.lol/v2/point/13.8/100.68/80");
    return local ? ["/api/flights", REMOTE_API, direct] : [REMOTE_API, direct];
  }
  // รูปแบบเดียวกับ /api/flights ไม่ว่าจะมาจากพร็อกซีหรือ adsb.lol ตรง
  function normalize(j) {
    if (!j) return null;
    var list = j.ac || j.aircraft;
    if (!Array.isArray(list)) return null;
    if (list.length && Array.isArray(list[0])) return { now: j.now || Date.now(), src: j.src || "adsb.lol", ac: list };
    return {
      now: j.now || Date.now(), src: "adsb.lol",
      ac: list.filter(function (a) { return typeof a.lat === "number" && (a.seen_pos == null || a.seen_pos < 60); }).map(function (a) {
        return [a.hex || "", (a.flight || "").trim(), a.r || "", a.t || "", a.lat, a.lon, a.alt_baro === "ground" ? "g" : a.alt_baro,
          a.gs, a.track, a.true_heading != null ? a.true_heading : a.mag_heading, a.baro_rate != null ? a.baro_rate : a.geom_rate, a.category || "", a.seen_pos || 0, a.squawk || ""];
      })
    };
  }
  function fetchJSON(url) {
    var ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
    return fetch(url, { signal: ctl ? ctl.signal : undefined, cache: "no-store" }).then(function (r) {
      clearTimeout(to);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }, function (e) { clearTimeout(to); throw e; });
  }
  function shouldPoll() {
    return visible && liveOn && model && map && map.getZoom() >= H.minZoom - 1 && document.visibilityState !== "hidden";
  }
  function poll() {
    if (!shouldPoll() || live.busy) return;
    live.busy = true;
    var urls = apiList(), order = urls.slice(live.good).concat(urls.slice(0, live.good));
    var tryAt = function (i) {
      if (i >= order.length) { live.busy = false; live.err = "โหลดข้อมูลเที่ยวบินไม่สำเร็จ"; setChipState("ready"); return; }
      fetchJSON(order[i]).then(function (j) {
        var body = normalize(j);
        if (!body) throw new Error("bad data");
        live.good = urls.indexOf(order[i]);
        live.busy = false; live.err = null; live.ok = Date.now();
        ingest(body);
      }).catch(function () { tryAt(i + 1); });
    };
    tryAt(0);
  }
  function startPolling() {
    if (live.timer) return;
    poll();
    live.timer = setInterval(poll, POLL_MS);
  }
  function stopPolling() { if (live.timer) { clearInterval(live.timer); live.timer = null; } }

  function ingest(body) {
    var nowL = Date.now();
    live.clockOff = nowL - body.now;
    live.src = body.src;
    var seen = {};
    body.ac.forEach(function (a) {
      var hex = a[0];
      if (!hex || a[4] == null || a[5] == null) return;
      seen[hex] = 1;
      var ground = a[6] === "g", altFt = ground ? 0 : Number(a[6]) || 0;
      var p = H.toLocal(a[5], a[4]), k = H.kAt(a[4]);
      var fix = { t: body.now - (a[12] || 0) * 1000 + live.clockOff, x: p.x, y: p.y, k: k, lat: a[4], lon: a[5],
        z: ground ? 0 : Math.max(0, altFt * FT - 20) * k, gs: (a[7] || 0) * KT, trk: a[8], hdg: a[9], vr: (a[10] || 0) * FPM, ground: ground, altFt: altFt };
      var F = live.F[hex];
      if (!F) {
        if (Object.keys(live.F).length >= LIVE_CAP) return;
        F = live.F[hex] = { hex: hex, trail: [], disp: { x: fix.x, y: fix.y, z: fix.z, hdg: fix.trk != null ? fix.trk : (fix.hdg || 0), pitch: 0, roll: 0 }, rate: 0 };
      } else if (F.fix && fix.trk != null && F.fix.trk != null && fix.t > F.fix.t) {
        var dtr = ((fix.trk - F.fix.trk + 540) % 360) - 180, dts = (fix.t - F.fix.t) / 1000;
        if (dts > 0.5) F.rate = Math.max(-6, Math.min(6, dtr / dts));
      }
      F.cs = a[1]; F.reg = a[2]; F.type = a[3]; F.cat = a[11]; F.sq = a[13];
      F.info = AC.typeInfo(a[3], a[11]);
      F.air = AC.airlineOf(a[1], a[2]);
      F.fix = fix; F.seen = nowL;
    });
    Object.keys(live.F).forEach(function (h) {
      if (!seen[h] && nowL - live.F[h].seen > 60000) { removeLabel(live.F[h]); delete live.F[h]; }
    });
    live.n = Object.keys(live.F).length;
    hideCoveredParked();
    setChipState("ready");
    H.repaint();
    if (selHit && selHit.type === "live") refreshCard();
  }

  // เครื่องบินจริงที่อยู่บนพื้นทับหลุมจอดเดียวกับลำประกอบฉาก → ซ่อนลำประกอบ
  function hideCoveredParked() {
    if (!model || !model.parked) return;
    var fleet = model.parkFleet, dirty = false;
    model.parked.forEach(function (P) {
      var cover = false;
      Object.keys(live.F).forEach(function (h) {
        var F = live.F[h];
        if (F.fix.ground && Math.hypot(F.fix.x - P.x, F.fix.y - P.y) < P.r * 0.85) cover = true;
      });
      if (cover !== !!P.hidden) {
        P.hidden = cover;
        fleet.set(P.info.cls, P.slot, planeMatrix(P.x, P.y, 0, P.hdg, 0, 0, cover ? 0 : P.sc * P.k), P.air, true, 0);
        dirty = true;
      }
    });
    if (dirty) fleet.commit();
  }

  function angLerp(a, b, t) { var d = ((b - a + 540) % 360) - 180; return (a + d * t + 360) % 360; }
  function updateLive(dtF) {
    if (!model || !model.liveFleet) return;
    var now = Date.now(), counts = {}, fleet = model.liveFleet, sh = model.liveShadow, ns = 0;
    var aP = 1 - Math.exp(-dtF / 0.7), aA = 1 - Math.exp(-dtF / 0.5);
    var trailTick = now - live.lastTrail > 2000;
    if (trailTick) live.lastTrail = now;
    var cv = map.getCanvas(), cw = cv.clientWidth, chh = cv.clientHeight, onScreen = 0;
    Object.keys(live.F).forEach(function (h) {
      var F = live.F[h], x = F.fix, d = F.disp;
      var dt = Math.max(0, Math.min(20, (now - x.t) / 1000));
      var moving = !(x.ground && x.gs < 1);
      var trk = x.trk != null ? x.trk : x.hdg || d.hdg;
      var r = trk * Math.PI / 180;
      var px = x.x + (moving ? Math.sin(r) * x.gs * dt * x.k : 0), py = x.y + (moving ? Math.cos(r) * x.gs * dt * x.k : 0);
      var pz = x.ground ? 0 : Math.max(0, x.z + x.vr * dt * x.k);
      if (Math.hypot(px - d.x, py - d.y) > 3000) { d.x = px; d.y = py; d.z = pz; }
      d.x += (px - d.x) * aP; d.y += (py - d.y) * aP; d.z += (pz - d.z) * aP;
      var wantH = x.ground && x.hdg != null ? x.hdg : trk;
      d.hdg = angLerp(d.hdg, wantH, aA);
      var pitch = x.ground ? 0 : Math.max(-0.2, Math.min(0.26, Math.atan2(x.vr, Math.max(40, x.gs))));
      var roll = x.ground ? 0 : Math.max(-0.5, Math.min(0.5, Math.atan(x.gs * (F.rate * Math.PI / 180) / 9.81)));
      d.pitch += (pitch - d.pitch) * aA; d.roll += (roll - d.roll) * aA;
      var cls = F.info.cls, i = counts[cls] || 0;
      counts[cls] = i + 1;
      F.cls = cls; F.slot = i;
      var gear = x.ground || x.altFt < 300 || (x.altFt < 2500 && x.vr * 196.85 < 400);
      var sc = AC.scaleOf(F.info) * x.k;
      fleet.set(cls, i, planeMatrix(d.x, d.y, d.z, d.hdg, d.pitch, d.roll, sc), F.air, gear, selHit && selHit.F === F ? 1 : hoverKey === "l" + F.hex ? 0.6 : 0);
      var Ccls = AC.CLASSES[cls];
      if (d.z < 450 * x.k) {
        var ssh = H.sunShift(d.z / x.k + Ccls.zc);
        sh.put(ns++, d.x + ssh[0] * x.k, d.y + ssh[1] * x.k, d.hdg, F.info.L, Ccls.S * AC.scaleOf(F.info), Ccls.R * 2 * AC.scaleOf(F.info), x.k);
      }
      F.r = Math.max(F.info.L, Ccls.S * AC.scaleOf(F.info)) / 2 * x.k;
      var sp = H.project(d.x, d.y, d.z);
      if (sp && sp.x > -200 && sp.x < cw + 200 && sp.y > -200 && sp.y < chh + 200) onScreen++;
      if (trailTick && !x.ground) {
        F.trail.push(d.x, d.y, d.z);
        if (F.trail.length > TRAIL_N * 3) F.trail.splice(0, 3);
      }
    });
    live.onScreen = onScreen;
    fleet.commit(counts);
    sh.mesh.count = ns * 2;
    sh.mesh.instanceMatrix.needsUpdate = true;
    if (trailTick) rebuildTrails();
    placeLabels();
    if (selHit && selHit.type === "live" && now - live.lastCard > 1000) { live.lastCard = now; refreshCard(); }
  }

  function rebuildTrails() {
    var P = [], Cc = [], glow = new T.Color(H.palette().glow);
    Object.keys(live.F).forEach(function (h) {
      var t = live.F[h].trail, n = t.length / 3, d = live.F[h].disp;
      for (var i = 0; i < n; i++) {
        var j = i * 3, nx = i + 1 < n ? t.slice(j + 3, j + 6) : [d.x, d.y, d.z];
        var f0 = 0.15 + 0.85 * i / n, f1 = 0.15 + 0.85 * (i + 1) / n;
        P.push(t[j], t[j + 1], t[j + 2], nx[0], nx[1], nx[2]);
        Cc.push(glow.r * f0, glow.g * f0, glow.b * f0, glow.r * f1, glow.g * f1, glow.b * f1);
      }
    });
    var g = model.trails.geometry;
    g.setAttribute("position", new T.Float32BufferAttribute(P, 3));
    g.setAttribute("color", new T.Float32BufferAttribute(Cc, 3));
    g.computeBoundingSphere();
  }

  /* ป้ายเลขเที่ยวบิน (HTML) วางตามตำแหน่งจอของเครื่องบิน */
  function labelLayer() {
    if (live.labels && live.labels.isConnected) return live.labels;
    var el = document.createElement("div");
    el.className = "apt-labels";
    map.getContainer().appendChild(el);
    live.labels = el;
    el.addEventListener("click", function (e) {
      var t = e.target.closest(".apt-lbl");
      if (!t || !live.F[t.dataset.hex]) return;
      e.stopPropagation();
      var hit = { type: "live", F: live.F[t.dataset.hex] };
      setSelected(hit); showCard(hit);
    });
    return el;
  }
  function removeLabel(F) { if (F.el) { F.el.remove(); F.el = null; } }
  function labelText(F) {
    var alt = F.fix.ground ? "บนพื้น" : fmt(Math.round(F.fix.altFt / 100) * 100) + " ft";
    return '<b>' + esc(F.cs || F.reg || F.hex.toUpperCase()) + '</b><span>' + esc(F.info.code || "") + ' · ' + alt + '</span>';
  }
  function placeLabels() {
    var lay = labelLayer(), z = map.getZoom(), show = visible && liveOn && z >= LABEL_ZOOM;
    lay.style.display = show ? "" : "none";
    if (!show) return;
    var cv = map.getCanvas(), W = cv.clientWidth, Hh = cv.clientHeight;
    Object.keys(live.F).forEach(function (h) {
      var F = live.F[h], d = F.disp;
      var s = H.project(d.x, d.y, d.z + (F.r || 20) * 0.4);
      var on = s && s.x > -40 && s.x < W + 40 && s.y > -20 && s.y < Hh + 20 && (!F.fix.ground || z >= 13.2);
      if (!on) { if (F.el) F.el.style.display = "none"; return; }
      if (!F.el) {
        F.el = document.createElement("div");
        F.el.className = "apt-lbl";
        F.el.dataset.hex = F.hex;
        lay.appendChild(F.el);
      }
      var txt = labelText(F);
      if (F.el._t !== txt) { F.el.innerHTML = txt; F.el._t = txt; }
      F.el.classList.toggle("sel", !!(selHit && selHit.F === F));
      F.el.classList.toggle("gnd", !!F.fix.ground);
      F.el.style.display = "";
      F.el.style.transform = "translate(" + Math.round(s.x) + "px," + Math.round(s.y) + "px)";
    });
  }
  function hideLabels() { if (live.labels) live.labels.style.display = "none"; }

  function followStep() {
    live.followRaf = 0;
    var F = live.follow && live.F[live.follow];
    if (!F || !visible) { live.follow = null; syncFollowBtn(); return; }
    map.jumpTo({ center: H.toLngLat(F.disp.x, F.disp.y) });
    live.followRaf = requestAnimationFrame(followStep);
  }
  function setFollow(hex) {
    live.follow = hex;
    if (live.followRaf) { cancelAnimationFrame(live.followRaf); live.followRaf = 0; }
    if (hex) {
      var F = live.F[hex];
      if (F) map.easeTo({ center: H.toLngLat(F.disp.x, F.disp.y), zoom: Math.max(map.getZoom(), F.fix.ground ? 15.5 : 13.2), pitch: Math.max(map.getPitch(), 55), duration: 900 });
      setTimeout(function () { if (live.follow === hex) followStep(); }, 950);
    }
    syncFollowBtn();
  }
  function syncFollowBtn() {
    var b = $('#aptCard [data-act="follow"]');
    if (b) b.innerHTML = live.follow ? ico("eye") + " หยุดติดตาม" : ico("eye") + " ติดตาม";
  }

  /* ------------------------------------------------------------ ประกอบฉาก */
  function buildModel() {
    var t0 = performance.now();
    group = new T.Group();
    group.name = "airport";
    group.visible = visible;
    group.matrixAutoUpdate = false;
    model = {};
    makeMaterials();
    var L = { p: [], c: [], taxi: { p: [], c: [] } };
    buildGround(L);
    var blds = new T.Group(), park = new T.Group(), liveG = new T.Group();
    var C = new CB(), M = new CB(), G = new UB(), W = new CB();
    buildBuildings(C, M, G);
    buildBkkTerminal(C, M, G);
    buildTower(C, G, L);
    buildWindsocks(W);
    model.meshes = { c: mesh(C, mats.solid, blds), m: mesh(M, mats.membrane, blds), g: mesh(G, mats.glass, blds) };
    mesh(W, mats.solid, model.fine);
    buildLights(L);
    model.planeMat = AC.material(T);
    model.planeMat.userData.hlColor.value.set(H.palette().glow);
    model.park = park;
    var JB = new CB();
    buildParked(JB);
    model.bridges = mesh(JB, mats.solid, park);
    model.liveFleet = new Fleet(LIVE_CAP, liveG);
    model.liveShadow = new ShadowSet(LIVE_CAP, liveG);
    model.trails = new T.LineSegments(new T.BufferGeometry(), mats.trail);
    model.trails.frustumCulled = false;
    model.trails.renderOrder = 6;
    liveG.add(model.trails);
    group.add(blds, park, liveG);
    model.blds = model.blds || [];
    model.bldGroup = blds; model.parkGroup = park; model.liveGroup = liveG;
    group.updateMatrixWorld(true);
    H.scene().add(group);
    themeMaterials(H.theme());
    var rr = H.renderer();
    if (rr) { var an = Math.min(8, rr.capabilities.getMaxAnisotropy()); mats.glyph.map.anisotropy = an; mats.glass.map.anisotropy = an; }
    model.buildMs = Math.round(performance.now() - t0);
    H.ready();
  }

  /* ------------------------------------------------ ซ่อนทางวิ่ง/ทางขับ 2 มิติของแผนที่ฐาน */
  var BASE_LAYERS = ["aeroway-taxiway", "aeroway-runway-casing", "aeroway-area", "aeroway-runway"];
  function hideBaseLayers(hide) {
    if (!map || hide === baseHidden) return;
    BASE_LAYERS.forEach(function (id) {
      if (!map.getLayer(id)) return;
      if (hide) { savedVis[id] = map.getLayoutProperty(id, "visibility") || "visible"; map.setLayoutProperty(id, "visibility", "none"); }
      else map.setLayoutProperty(id, "visibility", savedVis[id] || "visible");
    });
    baseHidden = hide;
  }
  function updateBaseVis() { if (map) { hideBaseLayers(visible && !!model && map.getZoom() >= H.minZoom); excludeCityBuildings(visible && !!model); } }

  /* ตึก 3 มิติของแผนที่ฐาน (city-buildings-3d) ยกอาคารสนามบินหลังเดียวกันซ้ำเป็นกล่องทื่อ ๆ โผล่ทะลุหลังคาเมมเบรน
     → ตัดทิ้งด้วย id ของ feature (vector tile ของ OpenFreeMap ใช้ id = OSM id × 10 + ชนิด) เฉพาะอาคารที่ชั้นนี้วาดเอง */
  var exclOn = null, exclExpr = null;
  function excludeCityBuildings(on) {
    if (!map || !D || !map.getLayer("city-buildings-3d")) return;
    if (!exclExpr) {
      var ids = D.buildings.map(function (b) { return b.id; }).concat([D.terminal.osm]);
      exclExpr = ["!", ["in", ["floor", ["/", ["to-number", ["id"], 0], 10]], ["literal", ids]]];
    }
    var cur = map.getFilter("city-buildings-3d"), tag = JSON.stringify(exclExpr);
    var has = Array.isArray(cur) && cur[0] === "all" && JSON.stringify(cur[cur.length - 1]) === tag;
    if (on === has) return;
    try {
      if (on) map.setFilter("city-buildings-3d", cur ? ["all", cur, exclExpr] : ["all", exclExpr]);
      else map.setFilter("city-buildings-3d", cur.length === 3 ? cur[1] : null);
    } catch (e) { console.warn("airport: building filter", e); }
    exclOn = on;
  }

  /* ------------------------------------------------------------ คลิก/ชี้ */
  var _va, _vb, _vc, _vh, _sph;
  function triRange(meshKey, i0, i1, ray, best) {
    var m = model.meshes[meshKey];
    if (!m || i1 <= i0) return best;
    var pos = m.geometry.attributes.position.array, idx = m.geometry.index.array;
    for (var i = i0; i < i1; i += 3) {
      var a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
      _va.set(pos[a], pos[a + 1], pos[a + 2]); _vb.set(pos[b], pos[b + 1], pos[b + 2]); _vc.set(pos[c], pos[c + 1], pos[c + 2]);
      if (ray.intersectTriangle(_va, _vb, _vc, false, _vh)) { var d = _vh.distanceTo(ray.origin); if (d < best) best = d; }
    }
    return best;
  }
  function rangeHit(r, ray) {
    var d = Infinity;
    d = triRange("c", r[0].c, r[1].c, ray, d);
    d = triRange("m", r[0].m, r[1].m, ray, d);
    d = triRange("g", r[0].g, r[1].g, ray, d);
    return d;
  }
  function sphereHit(ray, x, y, z, r) {
    _sph.center.set(x, y, z); _sph.radius = r;
    if (!ray.intersectSphere(_sph, _vh)) return null;
    return _vh.distanceTo(ray.origin);
  }
  function inPoly(p, P) {
    var c = false;
    for (var i = 0, j = P.length - 1; i < P.length; j = i++) {
      var a = P[i], b = P[j];
      if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) c = !c;
    }
    return c;
  }
  function segD(p, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy, t = L2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2)) : 0;
    return Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t);
  }
  function pick(ray) {
    if (!model) return null;
    if (!_va) { _va = new T.Vector3(); _vb = new T.Vector3(); _vc = new T.Vector3(); _vh = new T.Vector3(); _sph = new T.Sphere(); }
    var best = null, bestD = Infinity;
    function take(d, hit) { if (d != null && d < bestD) { bestD = d; best = hit; } }
    // เครื่องบิน
    if (liveOn) Object.keys(live.F).forEach(function (h) {
      var F = live.F[h];
      if (F.r) take(sphereHit(ray, F.disp.x, F.disp.y, F.disp.z + F.r * 0.15, F.r * 0.62), { type: "live", F: F });
    });
    if (model.parkGroup.visible) model.parked.forEach(function (P) {
      if (!P.hidden) take(sphereHit(ray, P.x, P.y, P.z, P.r * 0.6), { type: "parked", P: P });
    });
    // อาคาร
    if (model.bldGroup.visible) {
      var tmp = new T.Vector3();
      model.blds.forEach(function (b) {
        if (!ray.intersectBox(b.box, tmp)) return;
        take(rangeHit(b.r, ray), { type: "bld", b: b });
      });
      model.bkkRanges.forEach(function (R) { take(rangeHit(R.r, ray), R.hall ? { type: "hall" } : { type: "arm", A: R.arm }); });
      if (model.tower) { var tw = model.tower; take(sphereHit(ray, tw.c.x, tw.c.y, 118 * tw.k, 16 * tw.k), { type: "tower" }); }
    }
    // พื้น: จุดที่เรย์ตัดระนาบ z = 0
    if (ray.direction.z < -1e-6) {
      var t = -ray.origin.z / ray.direction.z, p = { x: ray.origin.x + ray.direction.x * t, y: ray.origin.y + ray.direction.y * t };
      var dG = t * ray.direction.length() + 0.5, g = null;
      model.runways.forEach(function (F) {
        var s = ((p.x - F.a.x) * F.ux + (p.y - F.a.y) * F.uy) / F.k, o = ((p.x - F.a.x) * -F.uy + (p.y - F.a.y) * F.ux) / F.k;
        if (s >= 0 && s <= F.Lm && Math.abs(o) <= F.W / 2) g = { type: "rwy", F: F };
      });
      if (!g && map.getZoom() >= FINE_ZOOM) D.stands.forEach(function (s) {
        var n = loc(s.p[0], s.p[1]);
        if (Math.hypot(n.x - p.x, n.y - p.y) < 7 * n.k) g = { type: "stand", s: s };
      });
      if (!g) for (var i = 0; i < model.taxis.length && !g; i++) {
        var tx = model.taxis[i], P = tx.P;
        for (var j = 0; j < P.length - 1; j++) if (segD(p, P[j], P[j + 1]) <= tx.w / 2 * P[j].k) { g = { type: "taxi", t: tx }; break; }
      }
      if (!g) D.aprons.forEach(function (A, ai) {
        if (!A._P) A._P = decode(A.p);
        if (inPoly(p, A._P)) g = { type: "apron", A: A };
      });
      if (g) { g.px = p.x; g.py = p.y; take(dG, g); }
    }
    return best ? { dist: bestD, hit: best } : null;
  }

  function keyOf(h) {
    if (!h) return null;
    switch (h.type) {
      case "live": return "l" + h.F.hex;
      case "parked": return "p" + h.P.idx;
      case "bld": return "b" + h.b.rec.id;
      case "arm": return "a" + h.A.id;
      case "rwy": return "r" + h.F.R.id;
      case "taxi": return "t" + model.taxis.indexOf(h.t);
      case "stand": return "s" + D.stands.indexOf(h.s);
      case "apron": return "o" + D.aprons.indexOf(h.A);
      default: return h.type;
    }
  }
  function rangesMesh(list) {
    var P = [];
    list.forEach(function (r) {
      ["c", "m", "g"].forEach(function (key) {
        var m = model.meshes[key];
        if (!m) return;
        var pos = m.geometry.attributes.position.array, idx = m.geometry.index.array;
        for (var i = r[0][key]; i < r[1][key]; i++) { var a = idx[i] * 3; P.push(pos[a], pos[a + 1], pos[a + 2]); }
      });
    });
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(P, 3));
    return g;
  }
  function highlightFor(h) {
    var g = null, B;
    if (h.type === "bld") g = rangesMesh([h.b.r]);
    else if (h.type === "arm") g = rangesMesh(model.bkkRanges.filter(function (R) { return R.arm === h.A; }).map(function (R) { return R.r; }));
    else if (h.type === "hall") g = rangesMesh(model.bkkRanges.filter(function (R) { return R.hall; }).map(function (R) { return R.r; }));
    else if (h.type === "rwy") { B = new B0(); rwyRect(B, h.F, 0, -8, h.F.Lm + 8, -h.F.W / 2 - 4, h.F.W / 2 + 4); B.p = B.p.map(function (v, i) { return i % 3 === 2 ? 0.3 : v; }); g = toGeo(B); }
    else if (h.type === "taxi") { B = new B0(); ribbon(B, h.t.P, (h.t.w + 4) * h.t.P[0].k, 0.3, true); g = toGeo(B); }
    else if (h.type === "stand") { var n = loc(h.s.p[0], h.s.p[1]); B = new B0(); disc(B, n.x, n.y, 9 * n.k, 0.3, 20); g = toGeo(B); }
    else if (h.type === "apron") { B = new B0(); fillPoly(B, h.A._P || decode(h.A.p), 0.3); g = toGeo(B); }
    else if (h.type === "tower") { var tw = model.tower; B = new B0(); disc(B, tw.c.x, tw.c.y, 16 * tw.k, 0.4, 24); g = toGeo(B); }
    if (!g) return null;
    var m = new T.Mesh(g, mats.hover);
    m.matrixAutoUpdate = false;
    m.renderOrder = 8;
    return m;
  }
  function setPlaneHl(h, v) {
    if (!h || !model) return;
    if (h.type === "parked") {
      var P = h.P;
      model.parkFleet.set(P.info.cls, P.slot, planeMatrix(P.x, P.y, 0, P.hdg, 0, 0, P.hidden ? 0 : P.sc * P.k), P.air, true, v);
      model.parkFleet.commit();
    }
    // เครื่องบินสด: ตั้งค่าไฮไลต์ทุกเฟรมใน updateLive
  }
  function setHover(h) {
    var k = keyOf(h);
    if (k === hoverKey) return;
    var old = model && hoverKey && hoverKey[0] === "p" ? { type: "parked", P: model.parked.filter(function (P) { return "p" + P.idx === hoverKey; })[0] } : null;
    if (old && old.P && keyOf(old) !== selKey) setPlaneHl(old, 0);
    hoverKey = k;
    if (hoverMesh) { group.remove(hoverMesh); hoverMesh.geometry.dispose(); hoverMesh = null; }
    if (h && k !== selKey) {
      if (h.type === "parked") setPlaneHl(h, 0.6);
      else if (h.type !== "live") { hoverMesh = highlightFor(h); if (hoverMesh) group.add(hoverMesh); }
    }
    H.repaint();
  }
  function setSelected(h) {
    if (selHit && selHit.type === "parked") setPlaneHl(selHit, 0);
    selKey = keyOf(h); selHit = h || null;
    if (selMesh) { group.remove(selMesh); selMesh.geometry.dispose(); selMesh = null; }
    if (hoverMesh) { group.remove(hoverMesh); hoverMesh.geometry.dispose(); hoverMesh = null; hoverKey = null; }
    if (h) {
      if (h.type === "parked") setPlaneHl(h, 1);
      else if (h.type !== "live") { selMesh = highlightFor(h); if (selMesh) { selMesh.material = mats.sel; group.add(selMesh); } }
    }
    H.repaint();
  }

  /* --------------------------------------------------------------- UI */
  function setChipState(s) {
    var chip = $("#chipAirport3D");
    if (!chip) return;
    var cnt = chip.querySelector(".chip-count");
    if (s === "loading") cnt.textContent = "…";
    else if (s === "error") { cnt.textContent = "!"; chip.title = "โหลดชั้นสนามบิน 3 มิติไม่สำเร็จ"; }
    else if (s === "ready") cnt.textContent = liveOn && live.ok ? "✈ " + fmt(live.n) : "2 แห่ง";
  }
  function syncButtons() {
    var chip = $("#chipAirport3D"), btn = $("#btnAirport3DToggle"), lb = $("#btnAirportLive");
    if (chip) chip.classList.toggle("active", visible);
    if (btn) btn.classList.toggle("active", visible);
    if (lb) { lb.classList.toggle("active", liveOn && visible); lb.style.display = visible ? "" : "none"; }
  }
  function nearestAirport() {
    var c = map.getCenter(), best = null;
    D.airports.forEach(function (a) { var d = Math.hypot(a.c[0] - c.lng, a.c[1] - c.lat); if (!best || d < best.d) best = { a: a, d: d }; });
    return best;
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
      stopPolling();
      hideLabels();
      closeCard();
      setHover(null);
      return;
    }
    if (failed) { failed = false; loading = null; }
    ensureLoaded().then(function () {
      if (!model) return;
      H.show(MOD_ID, true);
      updateBaseVis();
      if (liveOn) startPolling();
      var n = nearestAirport();
      if (n && (n.d > 0.12 || map.getZoom() < H.minZoom)) flyToAirport(n.a);
    });
  }
  function setLive(on) {
    liveOn = on;
    lsSet(LS_LIVE, on ? "1" : "0");
    syncButtons();
    if (model) model.liveGroup.visible = on;
    if (on) startPolling(); else { stopPolling(); hideLabels(); setFollow(null); if (selHit && selHit.type === "live") closeCard(); }
    H.setAnim(MOD_ID, on && live.n > 0);
    setChipState("ready");
    H.repaint();
  }
  function flyToAirport(a) {
    map.flyTo({ center: a.c, zoom: 14.2, pitch: 58, bearing: a.id === "BKK" ? -20 : 30, duration: 1800 });
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    var bar = $(".filter-bar");
    if (bar && !$("#chipAirport3D")) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.id = "chipAirport3D";
      chip.title = "ท่าอากาศยานดอนเมือง + สุวรรณภูมิ แบบ 3 มิติ พร้อมเครื่องบินจริงแบบสด (กดเพื่อเปิด/ปิด)";
      chip.innerHTML = '<span>' + ico("plane") + ' สนามบิน 3 มิติ</span><span class="chip-count">–</span>';
      chip.addEventListener("click", function () { setVisible(!visible); });
      bar.insertBefore(chip, $("#btnThemeToggle") || null);
    }
    var menu = $("#leftMenu");
    if (menu && !$("#btnAirport3DToggle")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "menu-btn";
      btn.id = "btnAirport3DToggle";
      btn.title = "เปิด/ปิดสนามบิน 3 มิติ (ดอนเมือง + สุวรรณภูมิ)";
      btn.innerHTML = '<span>' + ico("plane") + '</span><span class="label-text"> สนามบิน 3 มิติ</span>';
      btn.addEventListener("click", function () { setVisible(!visible); });
      menu.appendChild(btn);
      var lb = document.createElement("button");
      lb.type = "button";
      lb.className = "menu-btn";
      lb.id = "btnAirportLive";
      lb.title = "เปิด/ปิดเครื่องบินจริงแบบสด (ADS-B อัปเดตทุก 5 วินาที)";
      lb.innerHTML = '<span>' + ico("plane-takeoff") + '</span><span class="label-text"> เที่ยวบินสด</span>';
      lb.addEventListener("click", function () { setLive(!liveOn); });
      menu.appendChild(lb);
    }
    if (!$("#aptCard")) {
      var card = document.createElement("div");
      card.id = "aptCard";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-label", "ข้อมูลสนามบิน");
      ($(".stage") || document.body).appendChild(card);
      var st = document.createElement("style");
      st.textContent = "#aptCard{position:absolute;right:14px;top:14px;width:330px;max-width:calc(100% - 28px);z-index:40;" +
        "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.28);" +
        "backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:var(--text-main);font-size:12.5px;line-height:1.5;display:none}" +
        "#aptCard.open{display:block;animation:elvIn .22s ease}" +
        ".apt-live{display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;margin-right:4px;box-shadow:0 0 0 3px rgba(34,197,94,.25);animation:aptPulse 1.6s infinite}" +
        "@keyframes aptPulse{50%{box-shadow:0 0 0 6px rgba(34,197,94,0)}}" +
        ".apt-sw{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px;border:1px solid rgba(0,0,0,.15)}" +
        ".apt-labels{position:absolute;inset:0;pointer-events:none;z-index:3;overflow:hidden}" +
        ".apt-lbl{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;margin:-34px 0 0 10px;padding:2px 7px 3px;border-radius:7px;" +
        "background:rgba(8,14,24,.74);border:1px solid rgba(0,229,255,.38);color:#e8f6ff;font:600 10.5px/1.25 system-ui,sans-serif;white-space:nowrap;" +
        "backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);will-change:transform}" +
        ".apt-lbl:before{content:'';position:absolute;left:-10px;top:100%;width:10px;height:1px;background:rgba(0,229,255,.55);transform:rotate(-40deg);transform-origin:100% 0}" +
        ".apt-lbl b{display:block;font-size:11px;letter-spacing:.02em}" +
        ".apt-lbl span{opacity:.75;font-size:9.5px;font-weight:600}" +
        ".apt-lbl.sel{border-color:#00E5FF;box-shadow:0 0 0 2px rgba(0,229,255,.35)}" +
        ".apt-lbl.gnd{opacity:.82}" +
        "html[data-theme=light] .apt-lbl,html[data-theme=sunset] .apt-lbl{background:rgba(255,255,255,.9);color:#10202c;border-color:rgba(4,120,143,.45)}" +
        "html[data-theme=light] .apt-lbl:before,html[data-theme=sunset] .apt-lbl:before{background:rgba(4,120,143,.6)}";
      document.head.appendChild(st);
    }
    syncButtons();
  }

  /* ----------------------------------------------------------- การ์ดข้อมูล */
  var SURF = { asphalt: "แอสฟัลต์", concrete: "คอนกรีต", paved: "ลาดยาง" };
  function apName(a) { var A = D.airports[a]; return A.name + " (" + A.id + " / " + A.icao + ")"; }
  function head(type, icon, name, sub) {
    return '<div class="elv-head"><div class="elv-type">' + ico(icon) + ' ' + type + '</div><h3 class="elv-name">' + name + '</h3>' +
      (sub ? '<p class="elv-sub">' + sub + '</p>' : '') + '<button type="button" class="elv-x" aria-label="ปิด">×</button></div>';
  }
  function cell(k, v, u) { return '<div class="elv-cell"><div class="elv-k">' + k + '</div><div class="elv-v">' + v + (u ? '<small>' + u + '</small>' : '') + '</div></div>'; }
  function row(k, v) { return '<div class="elv-row"><b>' + k + '</b><span>' + v + '</span></div>'; }
  function brg(F, end) {
    var hx = F.ux * (end ? -1 : 1), hy = F.uy * (end ? -1 : 1);
    return Math.round((Math.atan2(hx, hy) * 180 / Math.PI + 360) % 360);
  }
  function airportAt(x, y) {
    var best = 0, bd = Infinity;
    D.airports.forEach(function (a, i) { var p = H.toLocal(a.c[0], a.c[1]), d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = i; } });
    return { i: best, d: bd };
  }
  // ประตูขึ้นเครื่องใน OSM มักวางที่ขอบอาคารหรือบนสะพานเทียบ → นับทั้งที่อยู่ในผังและห่างขอบไม่เกิน 45 ม.
  function gatesIn(P) {
    return D.gates.filter(function (g) {
      var p = loc(g.p[0], g.p[1]);
      if (inPoly(p, P)) return true;
      for (var i = 0; i < P.length; i++) if (segD(p, P[i], P[(i + 1) % P.length]) < 45 * p.k) return true;
      return false;
    });
  }
  function statusOf(F) {
    var x = F.fix;
    if (x.ground) return x.gs > 30 * KT ? "กำลังวิ่งขึ้น/ลงจอด" : x.gs > 1 ? "กำลังขับเคลื่อนบนทางขับ" : "จอดอยู่บนพื้น";
    var fpm = x.vr * 196.85;
    return fpm > 400 ? "กำลังไต่ระดับ" : fpm < -400 ? "กำลังลดระดับ" : "บินระดับ";
  }
  function cardHTML(h) {
    var html = "", note = "", act = '<div class="elv-actions"><button type="button" class="elv-btn primary" data-act="fly">' + ico("map-pin") + ' บินไปดู</button></div>';
    if (h.type === "live") {
      var F = h.F, x = F.fix, air = F.air, ap = airportAt(F.disp.x, F.disp.y), age = Math.max(0, Math.round((Date.now() - x.t) / 1000));
      html = head('<span class="apt-live"></span>เที่ยวบินสด (ADS-B)', "plane", esc(F.cs || F.reg || F.hex.toUpperCase()),
          '<span class="apt-sw" style="background:' + esc(air.a[2]) + '"></span>' + esc(air.a[0]) + (air.code ? " (" + air.code + ")" : "")) +
        '<div class="elv-body"><div class="elv-grid">' +
          cell("ความสูง", x.ground ? "บนพื้น" : fmt(x.altFt), x.ground ? "" : "ฟุต · " + fmt(x.altFt * FT) + " ม.") +
          cell("ความเร็วพื้น", fmt(x.gs / KT), "นอต · " + fmt(x.gs * 3.6) + " กม./ชม.") +
        '</div>' +
        row("สถานะ", statusOf(F) + (ap.d < 25000 ? " · ห่าง" + D.airports[ap.i].name.replace("ท่าอากาศยาน", "") + " " + fmt(ap.d / 1000, 1) + " กม." : "")) +
        row("แบบเครื่องบิน", esc(F.info.name) + (F.info.code && F.info.known ? " (" + esc(F.info.code) + ")" : "")) +
        (F.reg ? row("ทะเบียน", esc(F.reg)) : "") +
        row("ทิศทาง", (x.trk != null ? fmt(x.trk) + "°" : x.hdg != null ? fmt(x.hdg) + "°" : "–") + (x.ground ? "" : " · " + (x.vr * 196.85 > 0 ? "+" : "") + fmt(x.vr * 196.85) + " ฟุต/นาที")) +
        (F.sq ? row("Squawk", esc(F.sq)) : "") +
        '<div class="elv-actions"><button type="button" class="elv-btn primary" data-act="follow">' + ico("eye") + (live.follow === F.hex ? " หยุดติดตาม" : " ติดตาม") + '</button>' +
          '<a class="elv-btn" href="https://globe.adsb.lol/?icao=' + esc(F.hex) + '" target="_blank" rel="noopener">' + ico("map") + ' adsb.lol</a></div>' +
        '<p class="elv-note">ตำแหน่งจริงจากเครือข่ายผู้รับสัญญาณ ADS-B อาสาสมัคร (' + esc(live.src || "adsb.lol") + ', ODbL) อัปเดตทุก 5 วินาที — ข้อมูลล่าสุดเมื่อ ' + age +
          ' วินาทีที่แล้ว ระหว่างรอบเป็นค่าประมาณ · ความสูงเป็นความสูงความกดอากาศ · สีเครื่องบินเป็นสีหลักของสายการบิน ไม่ใช่ลายจริง</p></div>';
      return html;
    }
    if (h.type === "parked") {
      var P = h.P;
      html = head("เครื่องบินจอด · ภาพประกอบ", "plane", esc(P.info.name), '<span class="apt-sw" style="background:' + esc(P.air.a[2]) + '"></span>' + esc(P.air.a[0])) +
        '<div class="elv-body"><div class="elv-grid">' + cell("ความยาว", fmt(P.info.L, 1), "ม.") + cell("ปีกกว้าง", fmt(P.Sm, 1), "ม.") + '</div>' +
        row("หลุมจอด", (P.s.r ? esc(P.s.r) + " · " : "") + (P.s.c ? "มีสะพานเทียบ" : "หลุมจอดระยะไกล")) + row("สนาม", apName(P.s.a)) +
        '<p class="elv-note">ลำนี้วางไว้ให้เห็นขนาดเครื่องบินจริงที่หลุมจอด — แบบและสายการบินสุ่มจากสายการบินที่ใช้สนามนี้ <b>ไม่ใช่ข้อมูลเที่ยวบินจริง</b> ' +
          '(เครื่องบินจริงคือลำที่มีป้ายเลขเที่ยวบิน) · ถ้ามีเครื่องบินจริงจอดตรงนั้น ลำประกอบจะหายไปเอง</p></div>';
      return html;
    }
    if (h.type === "rwy") {
      var Fr = h.F, R = Fr.R, open = R.u ? "กำลังก่อสร้าง" : "เปิดใช้งาน";
      html = head("ทางวิ่ง (Runway)", "plane-landing", "ทางวิ่ง " + esc(R.ref), esc(apName(R.a))) +
        '<div class="elv-body"><div class="elv-grid">' + cell("ความยาว", fmt(R.lenTag || R.len), "ม.") + cell("ความกว้าง", fmt(R.w), "ม.") + '</div>' +
        row("หัวทางวิ่ง", esc(R.d[0]) + " (ทิศ " + brg(Fr, 0) + "°) ↔ " + esc(R.d[1]) + " (ทิศ " + brg(Fr, 1) + "°)") +
        row("ผิว", SURF[R.s] || esc(R.s)) + row("สถานะ", open + (R.ref === "02L/20R" ? " · ทางวิ่งที่ 3 เปิดใช้ 15 ก.ย. 2567" : "")) +
        '<div class="elv-actions"><button type="button" class="elv-btn primary" data-act="fly">' + ico("map-pin") + ' บินไปดู</button>' +
          '<a class="elv-btn" href="https://www.openstreetmap.org/way/' + R.id + '" target="_blank" rel="noopener">' + ico("map") + ' ดูใน OSM</a></div>' +
        '<p class="elv-note">แนวและความยาวจาก OpenStreetMap · เครื่องหมายบนทางวิ่งวาดตามมาตรฐาน ICAO (แถบหัวทางวิ่ง เลขทางวิ่ง จุดเล็งลง โซนแตะพื้น) ไม่ใช่ภาพถ่ายจริง' +
          (R.ref === "02L/20R" ? " · OSM ยังแท็กทางวิ่งนี้ว่ากำลังก่อสร้าง แต่เปิดใช้จริงแล้วตามประกาศ AIP ของ กพท." : "") + '</p></div>';
      return html;
    }
    if (h.type === "taxi") {
      var tw = h.t.tw;
      html = head("ทางขับ (Taxiway)", "plane", tw.r ? "ทางขับ " + esc(tw.r) : "ทางขับ", esc(apName(tw.a))) +
        '<div class="elv-body">' + row("ความกว้าง", "≈ " + fmt(h.t.w) + " ม." + (tw.w ? "" : " (ค่ามาตรฐาน)")) +
        (tw.b ? row("โครงสร้าง", "สะพานทางขับ (ข้ามถนน)") : "") + (tw.u ? row("สถานะ", "กำลังก่อสร้าง") : "") +
        '<p class="elv-note">เส้นเหลืองกลางทางขับ ไฟทางขับสีเขียว และเส้นรอหยุดก่อนเข้าทางวิ่ง (ห่างกึ่งกลางทางวิ่ง 90 ม.) วาดตามแนวทางขับจาก OpenStreetMap</p></div>';
      return html;
    }
    if (h.type === "stand") {
      var s = h.s, n = loc(s.p[0], s.p[1]), gate = null, gd = 90 * n.k;
      D.gates.forEach(function (g) { var p = loc(g.p[0], g.p[1]), d = Math.hypot(p.x - n.x, p.y - n.y); if (d < gd && g.r) { gd = d; gate = g; } });
      html = head("หลุมจอดอากาศยาน", "plane", s.r ? "หลุมจอด " + esc(s.r) : "หลุมจอด", esc(apName(s.a))) +
        '<div class="elv-body">' + row("ประเภท", s.c ? "ติดอาคาร (มีสะพานเทียบ)" : "หลุมจอดระยะไกล (ขึ้นลงด้วยรถบัส)") +
        row("รับเครื่องได้", s.s >= 62 ? "ลำตัวกว้าง (ปีกกว้าง ≤ ~" + fmt(s.s) + " ม.)" : s.s >= 30 ? "ลำตัวแคบ" : "ใช้ร่วมกับหลุมข้างเคียง (หลุมจอดยืดหยุ่น)") +
        (gate ? row("ประตูใกล้สุด", esc(gate.r)) : "") +
        '<p class="elv-note">' + (s.g ? "ดอนเมืองยังไม่มีหลุมจอดใน OpenStreetMap — ตำแหน่งนี้สร้างตามแนวอาคารที่หันเข้าลานจอด" : "ตำแหน่งและทิศทางจากเส้นนำเข้าหลุมจอดใน OpenStreetMap") + '</p></div>';
      return html;
    }
    if (h.type === "apron") return head("ลานจอดอากาศยาน (Apron)", "plane", "ลานจอดอากาศยาน", esc(apName(h.A.a))) +
      '<div class="elv-body"><p class="elv-note">พื้นที่ลานจอดจาก OpenStreetMap</p></div>';
    if (h.type === "tower") {
      return head("หอบังคับการบิน", "building-2", "หอบังคับการบินสุวรรณภูมิ", "Suvarnabhumi Air Traffic Control Tower") +
        '<div class="elv-body"><div class="elv-grid">' + cell("ความสูง", fmt(D.tower.h, 1), "ม.") + cell("เปิดใช้", "2549") + '</div>' +
        row("ผู้ดูแล", "บริษัท วิทยุการบินแห่งประเทศไทย จำกัด") + row("จุดเด่น", "หนึ่งในหอบังคับการบินที่สูงที่สุดในโลก") + act +
        '<p class="elv-note">ความสูงจาก OpenStreetMap · รูปทรงเป็นแบบจำลองอย่างง่ายจากภาพถ่าย ไม่ใช่แบบสถาปัตยกรรมจริง</p></div>';
    }
    if (h.type === "hall") {
      return head("อาคารผู้โดยสาร", "building-2", "อาคารผู้โดยสารหลัก สุวรรณภูมิ", "Suvarnabhumi Main Passenger Terminal") +
        '<div class="elv-body"><div class="elv-grid">' + cell("หลังคา (ตามผัง OSM)", "551 × 152", "ม.") + cell("เปิดใช้", "2549") + '</div>' +
        row("ออกแบบ", "Murphy/Jahn (เฮลมุท ยาห์น)") + row("ลักษณะ", "หลังคาใหญ่รับด้วยโครงถักเหล็ก 8 แนว ผนังกระจกโดยรอบ") + act +
        '<p class="elv-note">ผังจาก OpenStreetMap · แนวโครงถักและช่องแสงบนหลังคาอ้างอิงภาพดาวเทียม · ความสูงเป็นค่าประมาณ</p></div>';
    }
    if (h.type === "arm") {
      var A = model.bkkArms.filter(function (x) { return x.arm === h.A; })[0], gs = A ? gatesIn(A.P) : [];
      var letters = {}; gs.forEach(function (g) { var l = (g.r || "").replace(/[^A-Z]/g, ""); if (l) letters[l] = (letters[l] || 0) + 1; });
      var lt = Object.keys(letters).sort(function (a, b) { return letters[b] - letters[a]; });
      var len = A ? Math.hypot(A.P[1].x - A.P[0].x, A.P[1].y - A.P[0].y) / A.P[0].k || 0 : 0;
      return head("อาคารเทียบเครื่องบิน (Concourse)", "building-2", "อาคารเทียบเครื่องบิน" + (lt.length ? " " + lt.join(" / ") : ""), "ท่าอากาศยานสุวรรณภูมิ") +
        '<div class="elv-body"><div class="elv-grid">' + cell("ความยาวแขน", fmt(len), "ม.") + cell("ประตูใน OSM", fmt(gs.length)) + '</div>' +
        (gs.length ? row("ประตู", gs.map(function (g) { return esc(g.r); }).filter(Boolean).slice(0, 14).join(", ") + (gs.length > 14 ? " …" : "")) : "") +
        row("หลังคา", "ผ้าเมมเบรน 3 ชั้นสลับกระจก บนโครงเหล็กโค้ง") + act +
        '<p class="elv-note">ผังแขนอาคารจาก OpenStreetMap · ลายหลังคา (ผืนผ้าขาวรูปครึ่งวงกลมสลับกระจก) อ้างอิงภาพดาวเทียม</p></div>';
    }
    if (h.type === "bld") {
      var r2 = h.b.rec, kind = { terminal: "อาคารผู้โดยสาร", hangar: "โรงซ่อมอากาศยาน", roof: "หลังคาคลุม", tent: "เต็นท์/โครงผ้าใบ", parking: "อาคารจอดรถ", sat1: "อาคารเทียบเครื่องบินรอง", building: "อาคาร" }[r2.k] || "อาคาร";
      var gs2 = r2.k === "sat1" || r2.k === "terminal" ? gatesIn(h.b.P) : [];
      return head(kind, r2.k === "hangar" ? "plane" : "building-2", esc(r2.n || kind), esc([r2.e, apName(r2.a)].filter(Boolean).join(" · "))) +
        '<div class="elv-body"><div class="elv-grid">' + cell("ความสูง (ประมาณ)", fmt(r2.k === "sat1" ? 24 : r2.h), "ม.") + cell("พื้นที่ผัง", fmt(polyArea(h.b.P) / (h.b.P[0].k * h.b.P[0].k) / 1000, 1), "พัน ตร.ม.") + '</div>' +
        (gs2.length ? row("ประตูใน OSM", fmt(gs2.length) + " ประตู") : "") +
        '<div class="elv-actions"><button type="button" class="elv-btn primary" data-act="fly">' + ico("map-pin") + ' บินไปดู</button>' +
          '<a class="elv-btn" href="https://www.openstreetmap.org/way/' + r2.id + '" target="_blank" rel="noopener">' + ico("map") + ' ดูใน OSM</a></div>' +
        '<p class="elv-note">ผังจาก OpenStreetMap · สีหลังคาจากภาพดาวเทียม Esri · ความสูงจากแท็ก OSM ถ้ามี ไม่งั้นประมาณจากขนาดและประเภทอาคาร</p></div>';
    }
    return "";
  }
  function showCard(h) {
    var card = $("#aptCard");
    if (!card) return;
    card.innerHTML = cardHTML(h);
    card.classList.add("open");
    card.querySelector(".elv-x").addEventListener("click", closeCard);
    var fly = card.querySelector('[data-act="fly"]');
    if (fly) fly.addEventListener("click", function () { flyTo(h); });
    var fo = card.querySelector('[data-act="follow"]');
    if (fo) fo.addEventListener("click", function () { setFollow(live.follow === h.F.hex ? null : h.F.hex); });
  }
  function refreshCard() {
    var card = $("#aptCard");
    if (!card || !card.classList.contains("open") || !selHit) return;
    if (selHit.type === "live" && !live.F[selHit.F.hex]) { closeCard(); return; }
    showCard(selHit);
  }
  function closeCard() {
    var card = $("#aptCard");
    if (card) card.classList.remove("open");
    if (live.follow) setFollow(null);
    if (selKey && group) setSelected(null);
  }
  function flyTo(h) {
    var c = null, zoom = 16, bearing = map.getBearing();
    if (h.type === "rwy") {
      var mid = { x: (h.F.a.x + h.F.b.x) / 2, y: (h.F.a.y + h.F.b.y) / 2 };
      c = H.toLngLat(mid.x, mid.y); zoom = 14.1; bearing = brg(h.F, 0) + 70;
    } else if (h.type === "tower") { c = H.toLngLat(model.tower.c.x, model.tower.c.y); zoom = 16.2; }
    else if (h.type === "hall" || h.type === "arm") {
      var P = h.type === "hall" ? model.bkkHall.P : model.bkkArms.filter(function (x) { return x.arm === h.A; })[0].P;
      c = H.toLngLat((P[0].x + P[2].x) / 2, (P[0].y + P[2].y) / 2); zoom = 15.6;
    } else if (h.type === "bld") {
      var bx = h.b.box; c = H.toLngLat((bx.min.x + bx.max.x) / 2, (bx.min.y + bx.max.y) / 2); zoom = 16.4;
    } else if (h.type === "parked") { c = H.toLngLat(h.P.x, h.P.y); zoom = 17.4; }
    else if (h.px != null) c = H.toLngLat(h.px, h.py);
    if (c) map.flyTo({ center: c, zoom: zoom, pitch: 62, bearing: bearing, duration: 1500 });
  }

  /* -------------------------------------------------------------- mount */
  function mount(m) {
    map = m;
    H = window.BKK_3D;
    if (!H) { console.warn("bkk-airport3d: ต้องโหลด bkk-3d-host.js ก่อน"); return; }
    H.attach(m);
    if (lsGet(LS_KEY) === "0") visible = false;
    if (lsGet(LS_LIVE) === "0") liveOn = false;
    baseHidden = false;
    buildUI();
    if (!mount._bound) {
      mount._bound = true;
      map.on("zoomend", updateBaseVis);
      map.on("moveend", updateBaseVis);
      map.on("render", function () { if (!visible || map.getZoom() < H.minZoom) hideLabels(); });
      map.on("dragstart", function () { if (live.follow) setFollow(null); });
      document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") poll(); });
    }
    updateBaseVis();
    if (!visible) return;
    var go = function () { ensureLoaded().then(function () { if (!model) return; H.show(MOD_ID, true); updateBaseVis(); if (liveOn) startPolling(); }); };
    if (loading) go();
    else if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 4000 });
    else setTimeout(go, 1500);
  }

  window.BKK_AIRPORT3D = {
    mount: mount,
    setVisible: setVisible,
    setLive: setLive,
    flyToAirport: function (id) { if (D) flyToAirport(D.airports.filter(function (a) { return a.id === id; })[0] || D.airports[1]); },
    debug: function () {
      return {
        loaded: !!model, error: lastError, visible: visible, live: liveOn, buildMs: model && model.buildMs,
        runways: D ? D.runways.length : 0, taxiways: model ? model.taxis.length : 0, buildings: model ? model.blds.length : 0,
        parked: model ? model.parked.length : 0, lights: model ? model.lightCount : 0,
        flights: live.n, src: live.src, lastOk: live.ok ? Math.round((Date.now() - live.ok) / 1000) + " s ago" : null, err: live.err,
        tris: model ? Object.keys(model.meshes).reduce(function (s, k) { var m = model.meshes[k]; return s + (m ? m.geometry.index.count / 3 : 0); }, 0) : 0
      };
    },
    internals: function () { return { model: model, group: group, live: live }; }
  };

  (function register() {
    var H0 = window.BKK_3D;
    if (!H0) return;
    var last = 0;
    H0.register({
      id: MOD_ID,
      get group() { return group; },
      pick: pick,
      click: function (h) { setSelected(h); showCard(h); },
      hover: function (h) { if (group) setHover(h); },
      clear: closeCard,
      frame: function (z) {
        if (!model) return;
        var sm = z >= MARK_ZOOM, sf = z >= FINE_ZOOM, sb = z >= BLD_ZOOM, sp = z >= PARK_ZOOM;
        if (model.marks.visible !== sm) model.marks.visible = sm;
        if (model.fine.visible !== sf) model.fine.visible = sf;
        if (model.bldGroup.visible !== sb) model.bldGroup.visible = sb;
        if (model.parkGroup.visible !== sp) model.parkGroup.visible = sp;
        var now = performance.now(), dt = Math.min(0.25, (now - (last || now)) / 1000);
        last = now;
        if (liveOn) {
          updateLive(dt);
          // วาดต่อเนื่องเฉพาะตอนมีเครื่องบินในจอ ไม่งั้นแค่ปลุกให้วาดใหม่ทุก 1 วินาที (เผื่อมีลำบินเข้ามาในจอ)
          var anim = live.onScreen > 0;
          if (anim !== !!model.animOn) { model.animOn = anim; H.setAnim(MOD_ID, anim); }
          if (!anim && !live.wake) live.wake = setTimeout(function () { live.wake = null; if (visible && liveOn) H.repaint(); }, 1000);
        }
      },
      theme: function (name) { themeMaterials(name); },
      rendererReady: function (r) {
        if (!mats) return;
        var a = Math.min(8, r.capabilities.getMaxAnisotropy());
        [mats.glyph.map, mats.glass.map].forEach(function (t) { t.anisotropy = a; t.needsUpdate = true; });
      }
    });
  })();
})();
