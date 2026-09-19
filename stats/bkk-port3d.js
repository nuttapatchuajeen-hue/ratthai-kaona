/**
 * bkk-port3d.js
 * ชั้น "ท่าเรือ 3 มิติ" ของ bkk-city.html — ท่าเรือกรุงเทพ (คลองเตย) · แหลมฉบัง · ท่าเรือเอกชนริมเจ้าพระยา · ท่าเรือโดยสาร
 * วาดในฉากกลาง bkk-3d-host.js (three.js) ร่วมกับทางด่วน รถไฟฟ้า และสนามบิน
 *
 * ข้อมูล
 *   - bkk-port-data.js (window.BKK_PORT) จาก _geo/build-bkk-port.js — ผังท่าเรือ แนวหน้าท่า ลานตู้ เครน อาคาร ท่าเทียบ เส้นทางเรือ
 *     · ลานตู้: ช่องไหนมีตู้ + สีตู้ชั้นบน มาจากภาพดาวเทียม · จำนวนชั้นเป็นค่าสุ่ม
 *   - เรือจริงแบบสด (AIS): /api/ships (aisstream.io ผ่านพร็อกซีของเว็บ — ต้องตั้งคีย์ AISSTREAM_KEY ที่เซิร์ฟเวอร์ก่อน)
 *
 * ส่วนประกอบ
 *   - ลานหน้าท่า + รางเครน · เครนหน้าท่า (STS) บูมลงเมื่อมีเรือจอดตรงหน้า ไม่งั้นยกบูมขึ้น · เครนลานตู้ (RTG)
 *   - ตู้คอนเทนเนอร์ (instanced — สีแต่ละชั้นคำนวณในเชเดอร์) · อาคาร/โกดัง (สีหลังคาจากภาพดาวเทียม) · ถังเก็บ
 *   - ท่าเทียบ/โป๊ะทุกท่าในกรุงเทพฯ-ชายฝั่งตะวันออก · ท่าเรือโดยสาร (โป๊ะ + หลังคา + ป้ายชื่อ)
 *   - เรือ: จอดเทียบท่า/ทอดสมอ (ภาพประกอบ) · เรือโดยสารแล่นตามเส้นทางจริงและจอดตามท่า · เรือสินค้า/เรือลากจูงในร่องน้ำ (จำลอง)
 *     · เรือจริงจาก AIS เมื่อเปิดโหมดสด
 *
 * ⚠ ความสูงอาคาร จำนวนชั้นตู้ ตำแหน่งเรือจอด และเรือจำลอง เป็นภาพประกอบ ไม่ใช่ข้อมูลจริงรายวัน
 */
(function () {
  "use strict";

  var DATA_URL = "bkk-port-data.js";
  var MOD_ID = "port";
  var LS_KEY = "bkk-port3d-on";
  var LS_BOATS = "bkk-port3d-boats";
  var LS_AIS = "bkk-port3d-ais";
  var REMOTE_API = "https://ratthai-kaona.vercel.app/api/ships";
  var AIS_POLL_MS = 20000;
  var CRANE_ZOOM = 12.2;       // เครน อาคาร
  var YARD_ZOOM = 13.4;        // ตู้คอนเทนเนอร์ เครนลานตู้
  var PIER_ZOOM = 13;          // ท่าเทียบ โป๊ะ
  var BOAT_ZOOM = 12.4;        // เรือโดยสาร/เรือเล็กแล่น
  var LABEL_ZOOM = 15.3;       // ป้ายชื่อท่าเรือโดยสาร
  var AIS_LABEL_ZOOM = 12.8;   // ป้ายชื่อเรือจริง

  var H = null, T = null, D = null, map = null;
  var visible = true, boatsOn = true, aisOn = true, loading = null, failed = false, uiBuilt = false;
  var group = null, model = null, mats = null, lastError = null;
  var hoverKey = null, selKey = null, hoverMesh = null, selMesh = null, selHit = null, lmSkip = { osm: {}, at: [] };

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
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function hexRGB(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
  function shade(c, f) { return [c[0] * f, c[1] * f, c[2] * f]; }

  function ensureLoaded() {
    if (loading) return loading;
    setChipState("loading");
    var lm = window.BKK_LM3D ? Promise.resolve() : loadScript("landmarks3d/manifest.js").catch(function () {});
    loading = Promise.all([H.ensure(), window.BKK_PORT ? Promise.resolve() : loadScript(DATA_URL), lm]).then(function () {
      T = H.THREE(); D = window.BKK_PORT;
      if (!T || !D) throw new Error("THREE/BKK_PORT missing");
      buildModel();
      setChipState("ready");
    }).catch(function (e) {
      failed = true;
      lastError = e && e.stack || String(e);
      if (group && group.parent) group.parent.remove(group);
      model = null;
      console.warn("port 3D:", e);
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
  // กรอบพิกัดเฉพาะที่: a = ตามแกน ex, b = ตามแกนซ้ายของ ex (หน่วยเมตรจริง) → ฉาก
  function Frame(o, ex, ey, k) { this.o = o; this.ex = ex; this.ey = ey; this.k = k; }
  Frame.prototype.x = function (a, b) { return this.o.x + (this.ex.x * a + this.ey.x * b) * this.k; };
  Frame.prototype.y = function (a, b) { return this.o.y + (this.ex.y * a + this.ey.y * b) * this.k; };
  function frameAt(o, ang, k) { var c = Math.cos(ang), s = Math.sin(ang); return new Frame(o, { x: c, y: s }, { x: -s, y: c }, k); }

  /* --------------------------------------------------------- ตัวสร้างเรขา */
  // CB = ตำแหน่ง + สีต่อจุด (+ ค่า tint สำหรับเรือ: 1 = ส่วนที่ย้อมสีรายลำ)
  function CB(withTint) { this.p = []; this.c = []; this.i = []; this.t = withTint ? [] : null; this.col = [1, 1, 1]; this.tint = 0; }
  CB.prototype.v = function (x, y, z, c) { c = c || this.col; this.p.push(x, y, z); this.c.push(c[0], c[1], c[2]); if (this.t) this.t.push(this.tint); return this.p.length / 3 - 1; };
  CB.prototype.tri = function (a, b, c) { this.i.push(a, b, c); };
  CB.prototype.quad = function (a, b, c, d) { this.i.push(a, b, c, a, c, d); };
  CB.prototype.n = function () { return this.i.length; };
  function toGeo(B) {
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(B.p, 3));
    if (B.c) g.setAttribute("color", new T.Float32BufferAttribute(B.c, 3));
    if (B.t) g.setAttribute("tint", new T.Float32BufferAttribute(B.t, 1));
    g.setIndex(new T.BufferAttribute(B.p.length / 3 > 65535 ? new Uint32Array(B.i) : new Uint16Array(B.i), 1));
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
  // กล่องในกรอบ F (a ตามแกน, b ขวาง, z ขึ้น — เมตร) · noBottom = ไม่วาดพื้นล่าง
  function boxF(C, F, a0, a1, b0, b1, z0, z1, col, top) {
    var k = F.k, pts = [[a0, b0], [a1, b0], [a1, b1], [a0, b1]], lo = [], hi = [];
    var ct = top || col;
    for (var i = 0; i < 4; i++) {
      var x = F.x(pts[i][0], pts[i][1]), y = F.y(pts[i][0], pts[i][1]);
      lo.push([x, y, z0 * k]); hi.push([x, y, z1 * k]);
    }
    for (i = 0; i < 4; i++) {
      var j = (i + 1) % 4;
      var s = i % 2 ? 0.9 : 1;
      var cs = shade(col, s);
      C.quad(C.v(lo[i][0], lo[i][1], lo[i][2], cs), C.v(lo[j][0], lo[j][1], lo[j][2], cs), C.v(hi[j][0], hi[j][1], hi[j][2], cs), C.v(hi[i][0], hi[i][1], hi[i][2], cs));
    }
    C.quad(C.v(hi[0][0], hi[0][1], hi[0][2], ct), C.v(hi[1][0], hi[1][1], hi[1][2], ct), C.v(hi[2][0], hi[2][1], hi[2][2], ct), C.v(hi[3][0], hi[3][1], hi[3][2], ct));
  }
  // คาน/เสาเอียงระหว่างจุดสองจุด (a, b, z ในกรอบ F) หน้าตัด w × h
  function beamF(C, F, p0, p1, w, h, col) {
    var k = F.k;
    var A = [F.x(p0[0], p0[1]), F.y(p0[0], p0[1]), p0[2] * k], Bp = [F.x(p1[0], p1[1]), F.y(p1[0], p1[1]), p1[2] * k];
    var d = [Bp[0] - A[0], Bp[1] - A[1], Bp[2] - A[2]], L = Math.hypot(d[0], d[1], d[2]);
    if (L < 1e-6) return;
    d = [d[0] / L, d[1] / L, d[2] / L];
    // e1 = แนวนอนตั้งฉาก, e2 = d × e1
    var e1 = Math.abs(d[2]) > 0.95 ? [1, 0, 0] : [-d[1], d[0], 0];
    var l1 = Math.hypot(e1[0], e1[1], e1[2]); e1 = [e1[0] / l1, e1[1] / l1, e1[2] / l1];
    var e2 = [d[1] * e1[2] - d[2] * e1[1], d[2] * e1[0] - d[0] * e1[2], d[0] * e1[1] - d[1] * e1[0]];
    var hw = w * k / 2, hh = h * k / 2, c = [[-1, -1], [1, -1], [1, 1], [-1, 1]], P0 = [], P1 = [];
    for (var i = 0; i < 4; i++) {
      var ox = e1[0] * c[i][0] * hw + e2[0] * c[i][1] * hh, oy = e1[1] * c[i][0] * hw + e2[1] * c[i][1] * hh, oz = e1[2] * c[i][0] * hw + e2[2] * c[i][1] * hh;
      P0.push([A[0] + ox, A[1] + oy, A[2] + oz]); P1.push([Bp[0] + ox, Bp[1] + oy, Bp[2] + oz]);
    }
    for (i = 0; i < 4; i++) {
      var j = (i + 1) % 4, cs = shade(col, i % 2 ? 0.86 : 1);
      C.quad(C.v(P0[i][0], P0[i][1], P0[i][2], cs), C.v(P0[j][0], P0[j][1], P0[j][2], cs), C.v(P1[j][0], P1[j][1], P1[j][2], cs), C.v(P1[i][0], P1[i][1], P1[i][2], cs));
    }
  }
  function cylF(C, F, a, b, r, z0, z1, n, col, top) {
    var k = F.k, cx = F.x(a, b), cy = F.y(a, b), lo = [], hi = [];
    for (var i = 0; i < n; i++) {
      var t = i / n * Math.PI * 2, x = cx + Math.cos(t) * r * k, y = cy + Math.sin(t) * r * k;
      lo.push(C.v(x, y, z0 * k, shade(col, 0.82 + 0.18 * Math.cos(t - 0.8)))); hi.push(C.v(x, y, z1 * k, shade(col, 0.82 + 0.18 * Math.cos(t - 0.8))));
    }
    for (i = 0; i < n; i++) { var j = (i + 1) % n; C.quad(lo[i], lo[j], hi[j], hi[i]); }
    if (top) {
      var c = C.v(cx, cy, (z1 + r * 0.12) * k, top), ring = [];
      for (i = 0; i < n; i++) { var t2 = i / n * Math.PI * 2; ring.push(C.v(cx + Math.cos(t2) * r * k, cy + Math.sin(t2) * r * k, z1 * k, top)); }
      for (i = 0; i < n; i++) C.tri(c, ring[i], ring[(i + 1) % n]);
    }
  }
  // แถบราบบนพื้น (ตามเส้น P) กว้าง w (หน่วยฉาก)
  function ribbon(C, P, w, z, col) {
    for (var i = 0; i < P.length - 1; i++) {
      var a = P[i], b = P[i + 1], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      if (L < 1e-3) continue;
      var nx = -dy / L * w / 2, ny = dx / L * w / 2;
      C.quad(C.v(a.x - nx, a.y - ny, z, col), C.v(b.x - nx, b.y - ny, z, col), C.v(b.x + nx, b.y + ny, z, col), C.v(a.x + nx, a.y + ny, z, col));
    }
  }
  function fillPoly(C, P, z, col) {
    var V = P.map(function (p) { return new T.Vector2(p.x, p.y); });
    if (T.ShapeUtils.isClockWise(V)) { V.reverse(); P = P.slice().reverse(); }
    var tris = T.ShapeUtils.triangulateShape(V, []);
    var base = C.p.length / 3;
    P.forEach(function (p) { C.v(p.x, p.y, z, col); });
    tris.forEach(function (t) { C.tri(base + t[0], base + t[1], base + t[2]); });
  }
  function walls(C, P, z0, z1, col) {
    for (var i = 0; i < P.length; i++) {
      var a = P[i], b = P[(i + 1) % P.length];
      var s = 0.84 + 0.16 * Math.abs(Math.cos(Math.atan2(b.y - a.y, b.x - a.x) - 0.6));
      var cs = shade(col, s);
      C.quad(C.v(a.x, a.y, z0, cs), C.v(b.x, b.y, z0, cs), C.v(b.x, b.y, z1, cs), C.v(a.x, a.y, z1, cs));
    }
  }

  /* ------------------------------------------------------------ สี/วัสดุ */
  var TONE = { dark: "#8e9aad", light: "#ffffff", sunset: "#f4ddcc" };        // คูณกับสีต่อจุด
  var WATER_TONE = { dark: "#9aa9bd", light: "#ffffff", sunset: "#f1dccd" };
  var GROUND = {
    dark:   { apron: "#39414c", rail: "#161a20", edge: "#c9a124", deck: "#6e7784" },
    light:  { apron: "#d5d9de", rail: "#6b7077", edge: "#efbd1c", deck: "#c8ccd1" },
    sunset: { apron: "#ddcfc4", rail: "#6d5d52", edge: "#eeb01c", deck: "#cdb9aa" }
  };
  var PALETTE_DEFAULT = ["#8e3b2e", "#b8412f", "#6d2a2a", "#d9772b", "#d8b43a", "#2f6e45", "#1f4d3a", "#2a7f86",
    "#4a9bc9", "#2d4f8f", "#1f2f55", "#a0306e", "#d8d8d2", "#8d9196", "#c9b48a", "#6b4b32"];
  // สีตัวเรือ (ย้อมรายลำ)
  var HULL_PAL = ["#1f3b63", "#8b1e1e", "#1b1f24", "#2e5e3f", "#5b6470", "#25507f", "#a33a1f", "#15363f",
    "#3a3f46", "#1f5f7a", "#6a1f2b", "#20476b", "#40454d", "#2b3a55", "#8a5a1f", "#244d3c"];

  function groundMat() { return new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide, depthTest: false, depthWrite: false }); }
  function dotTex() {
    var cv = document.createElement("canvas"); cv.width = cv.height = 32;
    var g = cv.getContext("2d"), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,0.85)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
    return new T.CanvasTexture(cv);
  }
  function wakeTex() {
    var cv = document.createElement("canvas"); cv.width = 64; cv.height = 128;
    var g = cv.getContext("2d"), img = g.createImageData(64, 128);
    for (var y = 0; y < 128; y++) for (var x = 0; x < 64; x++) {
      var v = y / 127, u = (x + 0.5) / 64 - 0.5;                 // v: 0 = ท้ายเรือ → 1 = ปลายคลื่น
      var edge = Math.abs(Math.abs(u) - v * 0.45) < 0.035 + v * 0.03 ? 1 : 0;   // เส้นคลื่นรูปตัว V
      var core = Math.abs(u) < 0.12 * (1 - v) ? 0.8 : 0;                        // ฟองท้ายเรือ
      var a = Math.max(edge * 0.8, core) * Math.pow(1 - v, 1.4);
      var o = (y * 64 + x) * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = 255; img.data[o + 3] = Math.round(a * 255);
    }
    g.putImageData(img, 0, 0);
    return new T.CanvasTexture(cv);
  }
  function paletteTex() {
    var pal = (D && D.palette) || PALETTE_DEFAULT, data = new Uint8Array(16 * 4);
    pal.forEach(function (h, i) { var c = hexRGB(h); data[i * 4] = c[0] * 255; data[i * 4 + 1] = c[1] * 255; data[i * 4 + 2] = c[2] * 255; data[i * 4 + 3] = 255; });
    var tx = new T.DataTexture(data, 16, 1, T.RGBAFormat);
    tx.magFilter = tx.minFilter = T.NearestFilter;
    tx.needsUpdate = true;
    return tx;
  }
  /* ตู้คอนเทนเนอร์: กล่องหน่วยเดียวต่อ "กอง" (ยาว × กว้าง × สูงตามจำนวนชั้น)
     เชเดอร์แบ่งเป็นชั้น ๆ ละ 2.59 ม. สีชั้นบนมาจากข้อมูล (ภาพดาวเทียม) ชั้นล่างสุ่มจากเมล็ดรายกอง + ลอนผนังและรอยต่อชั้น */
  function containerMaterial() {
    var m = new T.MeshPhongMaterial({ color: 0xffffff, flatShading: true, shininess: 6, specular: 0x111111, side: T.DoubleSide });
    var palTex = paletteTex();
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uPal = { value: palTex };
      // สุ่มสี/ความสว่างรายชั้นใน vertex shader (highp) แล้วส่งเป็นค่าคงที่ต่อกอง 8 ชั้น (สี + 16 × ความสว่าง)
      // — ถ้าสุ่มใน fragment ด้วย sin() ค่าที่ interpolate คลาดนิดเดียวก็กลายเป็นจุดสีกระพริบทั่วผนังตู้
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nattribute vec3 aTop;\nattribute vec3 aInfo;\nvarying vec3 vTop;\nvarying vec3 vInfo;\nvarying vec3 vLoc;\nvarying vec4 vCodeA;\nvarying vec4 vCodeB;\n" +
          "float hsh(float n){ return fract(sin(n) * 43758.5453123); }\n" +
          "float code(float s, float t){ return floor(hsh(s * 12.9898 + t * 78.233) * 16.0) + 16.0 * floor(hsh(s * 3.719 + t * 11.13) * 8.0); }")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvTop = aTop; vInfo = aInfo; vLoc = position;\n" +
          "vCodeA = vec4(code(aInfo.x, 0.0), code(aInfo.x, 1.0), code(aInfo.x, 2.0), code(aInfo.x, 3.0));\n" +
          "vCodeB = vec4(code(aInfo.x, 4.0), code(aInfo.x, 5.0), code(aInfo.x, 6.0), code(aInfo.x, 7.0));");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform sampler2D uPal;\nvarying vec3 vTop;\nvarying vec3 vInfo;\nvarying vec3 vLoc;\nvarying vec4 vCodeA;\nvarying vec4 vCodeB;")
        .replace("vec4 diffuseColor = vec4( diffuse, opacity );",
          "float tiers = floor(vInfo.y + 0.5);\n" +
          "float tf = vLoc.z * tiers;\n" +
          "float tier = floor(clamp(tf, 0.0, tiers - 0.001));\n" +
          "vec4 oh = vec4(equal(vec4(mod(tier, 4.0)), vec4(0.0, 1.0, 2.0, 3.0)));\n" +
          "float cd = floor((tier < 4.0 ? dot(vCodeA, oh) : dot(vCodeB, oh)) + 0.5);\n" +
          "float ci = mod(cd, 16.0), br = floor(cd / 16.0) / 7.0;\n" +
          "vec3 cc = tier >= tiers - 1.0 ? vTop : texture2D(uPal, vec2((ci + 0.5) / 16.0, 0.5)).rgb;\n" +
          "cc *= 0.84 + 0.26 * br;\n" +
          "float seam = vLoc.z > 0.999 ? 1.0 : smoothstep(0.0, 0.07, fract(tf));\n" +
          "float cor = 0.95 + 0.05 * sin(vLoc.x * vInfo.z * 5.0);\n" +
          "float endd = 1.0 - 0.2 * step(0.5 - 0.35 / vInfo.z, abs(vLoc.x));\n" +
          "vec4 diffuseColor = vec4( cc * diffuse * mix(0.45, 1.0, seam) * cor * endd, opacity );");
    };
    m.customProgramCacheKey = function () { return "bkk-container"; };
    return m;
  }
  /* เรือ: สีต่อจุด + "tint" ต่อจุด — ส่วนที่ tint = 1 ย้อมด้วยสีรายลำ (instanceColor) ส่วนอื่นคงสีเดิม (ขาว/ดาดฟ้า/ปล่อง) */
  function shipMaterial() {
    var m = new T.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 10, specular: 0x1a1a1a, side: T.DoubleSide });
    m.onBeforeCompile = function (sh) {
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float tint;")
        .replace("#include <color_vertex>",
          "vColor = vec3(1.0);\n#ifdef USE_COLOR\nvColor *= color;\n#endif\n#ifdef USE_INSTANCING_COLOR\nvColor.xyz = mix(vColor.xyz, vColor.xyz * instanceColor.xyz, tint);\n#endif");
    };
    m.customProgramCacheKey = function () { return "bkk-ship"; };
    return m;
  }

  function makeMaterials() {
    mats = {
      apron: groundMat(), rail: groundMat(), edge: groundMat(),
      solid: new T.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 6, specular: 0x111111, side: T.DoubleSide }),
      steel: new T.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 24, specular: 0x333333, side: T.DoubleSide }),
      container: containerMaterial(),
      ship: shipMaterial(),
      wake: new T.MeshBasicMaterial({ color: 0xffffff, map: wakeTex(), transparent: true, depthWrite: false, opacity: 0.55, side: T.DoubleSide }),
      lights: new T.PointsMaterial({ size: 3.2, sizeAttenuation: false, vertexColors: true, map: dotTex(), transparent: true, depthWrite: false, blending: T.AdditiveBlending }),
      hover: new T.MeshBasicMaterial({ color: new T.Color(H.palette().glow), transparent: true, opacity: 0.35, depthWrite: false, side: T.DoubleSide }),
      sel: new T.MeshBasicMaterial({ color: new T.Color(H.palette().glow), transparent: true, opacity: 0.5, depthWrite: false, side: T.DoubleSide }),
      trail: new T.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false })
    };
    themeMaterials(H.theme());
  }
  function themeMaterials(name) {
    if (!mats) return;
    var G = GROUND[name] || GROUND.dark;
    mats.apron.color.set(G.apron); mats.rail.color.set(G.rail); mats.edge.color.set(G.edge);
    mats.solid.color.set(TONE[name] || TONE.dark);
    mats.steel.color.set(TONE[name] || TONE.dark);
    mats.container.color.set(name === "dark" ? "#a9b3c2" : name === "sunset" ? "#f6e3d6" : "#ffffff");
    mats.ship.color.set(WATER_TONE[name] || WATER_TONE.dark);
    mats.wake.opacity = name === "light" ? 0.75 : 0.5;
    var pal = H.palette();
    mats.hover.color.set(pal.glow); mats.sel.color.set(pal.glow);
    if (model && model.lights) model.lights.visible = name !== "light";
  }

  /* ------------------------------------------------------ แนวหน้าท่า */
  // Q: a, b (ฉาก), u (หน่วยตามแนว), w (หน่วยไปทางน้ำ), len (ม.), k
  function quayOf(p, qd) {
    var a = loc(qd.a[0], qd.a[1]), b = loc(qd.b[0], qd.b[1]), k = (a.k + b.k) / 2;
    var dx = b.x - a.x, dy = b.y - a.y, Ls = Math.hypot(dx, dy), u = { x: dx / Ls, y: dy / Ls };
    var land = { x: -u.y * qd.s, y: u.x * qd.s };
    return { p: p, d: qd, a: a, b: b, k: k, u: u, n: land, w: { x: -land.x, y: -land.y }, len: Ls / k, kind: qd.k };
  }
  // จุดบนแนวหน้าท่า: s = ระยะตามแนว (ม.), t = ระยะไปทางน้ำ (ม., ติดลบ = บนบก)
  function qpt(Q, s, t) { return { x: Q.a.x + (Q.u.x * s + Q.w.x * t) * Q.k, y: Q.a.y + (Q.u.y * s + Q.w.y * t) * Q.k }; }
  function qframe(Q, s) { var o = qpt(Q, s, 0); return new Frame(o, Q.w, Q.u, Q.k); }   // a = ไปทางน้ำ, b = ตามแนวท่า

  function buildGround(P) {
    var G = { apron: new CB(), rail: new CB(), edge: new CB() };
    P.quays.forEach(function (Q) {
      var ap = P.d.apron || 30, s0 = 0, s1 = Q.len;
      var c0 = qpt(Q, s0, 0), c1 = qpt(Q, s1, 0), c2 = qpt(Q, s1, -ap), c3 = qpt(Q, s0, -ap);
      G.apron.quad(G.apron.v(c0.x, c0.y, 0), G.apron.v(c1.x, c1.y, 0), G.apron.v(c2.x, c2.y, 0), G.apron.v(c3.x, c3.y, 0));
      ribbon(G.edge, [qpt(Q, s0, -0.8), qpt(Q, s1, -0.8)], 0.5 * Q.k, 0);
      if (Q.kind === "container" && P.d.sts) {
        [-3, -3 - P.d.sts.gauge].forEach(function (t) { ribbon(G.rail, [qpt(Q, s0, t), qpt(Q, s1, t)], 0.9 * Q.k, 0); });
      }
    });
    mesh(G.apron, mats.apron, model.ground, -30);
    mesh(G.edge, mats.edge, model.ground, -28);
    mesh(G.rail, mats.rail, model.ground, -29);
  }

  /* ------------------------------------------------------ เครนหน้าท่า (Ship-to-Shore) */
  var CRANE_COLS = { KT: ["#e2b12a", "#e2b12a", "#d9a520"], LCB: ["#e2b12a", "#dfe3e8", "#3f7fbf", "#e2b12a", "#d24a2a"], def: ["#e2b12a", "#dfe3e8"] };
  function stsCrane(C, F, dim, col, boomUp, work, lights) {
    var g = dim.gauge, h = dim.h, out = dim.out, wl = -3, ll = -3 - g, sb = g > 25 ? 8.5 : 7, back = g > 25 ? 16 : 11;
    var lw = g > 25 ? 1.9 : 1.4, white = [0.9, 0.91, 0.92], gray = [0.55, 0.57, 0.6], dark = [0.2, 0.22, 0.25];
    // ขา 4 ต้น + ล้อ
    [wl, ll].forEach(function (a) {
      [-sb, sb].forEach(function (b) {
        boxF(C, F, a - lw / 2, a + lw / 2, b - lw / 2, b + lw / 2, 1.4, h, col);
        boxF(C, F, a - 1.1, a + 1.1, b - 2.6, b + 2.6, 0, 1.4, dark);
      });
      beamF(C, F, [a, -sb, h - 0.8], [a, sb, h - 0.8], 1.6, 1.8, col);            // คานบนตามแนวท่า
    });
    [-sb, sb].forEach(function (b) {
      beamF(C, F, [ll, b, h], [wl, b, h], 1.8, 2.4, col);                          // คานพอร์ทัลขวางท่า
      beamF(C, F, [ll, b, h * 0.36], [wl, b, h * 0.36], 1.1, 1.1, col);            // คานยึดล่าง
    });
    // บูม: ท่อนหลัง (บนบก) + ท่อนหน้า (ยื่นออกทะเล — ยกขึ้นเมื่อไม่มีงาน)
    var zb = h + 3, hinge = wl + 1, tipA, tipZ, lenF = out - hinge;
    if (boomUp) { var ang = 80 * Math.PI / 180; tipA = hinge + Math.cos(ang) * lenF; tipZ = zb + Math.sin(ang) * lenF; }
    else { tipA = out; tipZ = zb; }
    [-2.1, 2.1].forEach(function (b) {
      beamF(C, F, [ll - back, b, zb], [hinge, b, zb], 1.2, 2.4, col);
      beamF(C, F, [hinge, b, zb], [tipA, b, tipZ], 1.1, 2.2, col);
    });
    // โครง A (apex) + สายยึด
    var apexA = ll + g * 0.3, apexZ = h + Math.max(16, out * 0.45);
    [-sb, sb].forEach(function (b) {
      var bb = b * 0.45;
      beamF(C, F, [wl, b, h], [apexA, bb, apexZ], 1.2, 1.2, col);
      beamF(C, F, [ll, b, h], [apexA, bb, apexZ], 1.2, 1.2, col);
      beamF(C, F, [apexA, bb, apexZ], boomUp ? [tipA, bb * 0.5, tipZ] : [hinge + lenF * 0.62, bb * 0.5, zb + 1.2], 0.45, 0.45, gray);
      beamF(C, F, [apexA, bb, apexZ], [ll - back, bb * 0.6, zb + 1], 0.45, 0.45, gray);
    });
    // ห้องเครื่องท้ายบูม + ห้องคนขับ + รถเครน (trolley)
    boxF(C, F, ll - back + 1, ll - 3, -4.6, 4.6, zb + 1.2, zb + 7.2, white, [0.8, 0.82, 0.85]);
    var tr = hinge + lenF * (work ? 0.55 : 0.3);
    if (!boomUp) {
      boxF(C, F, tr - 2.2, tr + 2.2, -3.4, 3.4, zb + 1.2, zb + 3, gray);
      boxF(C, F, tr - 1.6, tr + 1.6, -2.4, -0.6, zb - 3.4, zb - 0.9, [0.85, 0.87, 0.9], dark);   // ห้องคนขับห้อยใต้บูม
      if (work) {
        var zs = work.z;
        [-1.5, 1.5].forEach(function (b) { beamF(C, F, [tr, b, zb - 0.2], [tr, b * 0.8, zs + 0.9], 0.18, 0.18, dark); });
        boxF(C, F, tr - 1.4, tr + 1.4, -6.2, 6.2, zs, zs + 0.8, [0.95, 0.72, 0.18]);            // สเปรดเดอร์
        work.a = tr;
      }
    }
    if (lights) {
      var pt = function (a, b, z, c) { lights.p.push(F.x(a, b), F.y(a, b), z * F.k); lights.c.push(c[0], c[1], c[2]); };
      pt(apexA, 0, apexZ + 0.8, [1, 0.2, 0.15]);
      pt(tipA, 0, tipZ + 1, [1, 0.2, 0.15]);
      pt(hinge, sb, zb - 1, [1, 0.86, 0.55]); pt(hinge, -sb, zb - 1, [1, 0.86, 0.55]);
    }
    return { apexZ: apexZ, tipA: tipA, back: ll - back };
  }

  /* ------------------------------------------------------ อาคาร ถังเก็บ */
  var WALL = [0.8, 0.82, 0.85];
  function obb(P) {
    var best = null;
    for (var i = 0; i < P.length; i++) {
      var a = P[i], b = P[(i + 1) % P.length], L = Math.hypot(b.x - a.x, b.y - a.y);
      if (L < 1e-6) continue;
      var ux = (b.x - a.x) / L, uy = (b.y - a.y) / L, u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
      P.forEach(function (q) { var u = q.x * ux + q.y * uy, v = -q.x * uy + q.y * ux; u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); });
      var A = (u1 - u0) * (v1 - v0);
      if (!best || A < best.A) best = { A: A, ux: ux, uy: uy, u0: u0, u1: u1, v0: v0, v1: v1 };
    }
    if (best && best.u1 - best.u0 < best.v1 - best.v0) {        // แกน u = ด้านยาว
      best = { A: best.A, ux: -best.uy, uy: best.ux, u0: best.v0, u1: best.v1, v0: -best.u1, v1: -best.u0 };
    }
    return best;
  }
  function obbPt(O, u, v) { return { x: O.ux * u - O.uy * v, y: O.uy * u + O.ux * v }; }
  function building(C, rec, blds) {
    var P = decode(rec.g), k = P[0].k, h = rec.h * k, roof = hexRGB(rec.c || "#b9bec4"), i0 = C.n();
    if (rec.r) {                                     // หลังคาคลุม: แผ่นหลังคา + เสา
      fillPoly(C, P, h, roof);
      walls(C, P, h - 0.5 * k, h, shade(roof, 0.8));
      P.forEach(function (p, i) { if (i % 2 === 0) boxF(C, new Frame(p, { x: 1, y: 0 }, { x: 0, y: 1 }, k), -0.25, 0.25, -0.25, 0.25, 0, rec.h - 0.5, [0.6, 0.62, 0.65]); });
    } else if (rec.k) {                              // โกดังหลังคาจั่ว
      var O = obb(P), rise = Math.min(4, (O.v1 - O.v0) / 2 * 0.12);
      var c = [obbPt(O, O.u0, O.v0), obbPt(O, O.u1, O.v0), obbPt(O, O.u1, O.v1), obbPt(O, O.u0, O.v1)];
      walls(C, c, 0, h, WALL);
      var vm = (O.v0 + O.v1) / 2, r0 = obbPt(O, O.u0, vm), r1 = obbPt(O, O.u1, vm), zr2 = h + rise;
      C.tri(C.v(c[0].x, c[0].y, h, WALL), C.v(c[3].x, c[3].y, h, WALL), C.v(r0.x, r0.y, zr2, WALL));   // หน้าจั่ว
      C.tri(C.v(c[1].x, c[1].y, h, WALL), C.v(r1.x, r1.y, zr2, WALL), C.v(c[2].x, c[2].y, h, WALL));
      var ov = 0.6 * k, ex = O.ux * ov, ey = O.uy * ov;
      C.quad(C.v(c[0].x - ex, c[0].y - ey, h, roof), C.v(c[1].x + ex, c[1].y + ey, h, roof), C.v(r1.x + ex, r1.y + ey, zr2, shade(roof, 1.06)), C.v(r0.x - ex, r0.y - ey, zr2, shade(roof, 1.06)));
      C.quad(C.v(r0.x - ex, r0.y - ey, zr2, shade(roof, 0.9)), C.v(r1.x + ex, r1.y + ey, zr2, shade(roof, 0.9)), C.v(c[2].x + ex, c[2].y + ey, h, shade(roof, 0.84)), C.v(c[3].x - ex, c[3].y - ey, h, shade(roof, 0.84)));
    } else {
      walls(C, P, 0, h, WALL);
      fillPoly(C, P, h, roof);
    }
    var bb = new T.Box3();
    P.forEach(function (p) { bb.expandByPoint(new T.Vector3(p.x, p.y, 0)); });
    bb.max.z = h + 5 * k;
    blds.push({ rec: rec, P: P, box: bb, i0: i0, i1: C.n() });
  }
  function tank(C, t, list) {
    var p = loc(t[0], t[1]), r = t[2] / 10, h = t[3] / 10, F = new Frame(p, { x: 1, y: 0 }, { x: 0, y: 1 }, p.k), i0 = C.n();
    cylF(C, F, 0, 0, r, 0, h, 22, [0.88, 0.89, 0.9], hexRGB(t[4]));
    list.push({ t: t, p: p, r: r * p.k, h: h * p.k, i0: i0, i1: C.n() });
  }
  /* ------------------------------------------------------ ตู้คอนเทนเนอร์ (instanced) */
  var CT = { w: 2.44, h: 2.59, l20: 6.06, l40: 12.19 };
  var boxGeo = null;
  function unitBox() {
    if (boxGeo) return boxGeo;
    var p = [], idx = [];
    var c = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
    for (var i = 0; i < 4; i++) {
      var j = (i + 1) % 4, b = p.length / 3;
      p.push(c[i][0], c[i][1], 0, c[j][0], c[j][1], 0, c[j][0], c[j][1], 1, c[i][0], c[i][1], 1);
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
    var t = p.length / 3;
    p.push(-0.5, -0.5, 1, 0.5, -0.5, 1, 0.5, 0.5, 1, -0.5, 0.5, 1);
    idx.push(t, t + 1, t + 2, t, t + 2, t + 3);
    boxGeo = new T.BufferGeometry();
    boxGeo.setAttribute("position", new T.Float32BufferAttribute(p, 3));
    boxGeo.setIndex(idx);
    return boxGeo;
  }
  // กองตู้หนึ่งกอง: x, y (ฉาก), ang (เรเดียน, แกนยาว), L (ม.), tiers, สีชั้นบน, seed, k, z0 (ฐาน ม.)
  function ContainerSet() { this.list = []; }
  ContainerSet.prototype.add = function (x, y, ang, L, tiers, top, seed, k, z0) { this.list.push([x, y, ang, L, tiers, top, seed, k, z0 || 0]); };
  var _m4 = null, _q = null, _s = null, _v = null, _ax = null;
  function tmp() { if (!_m4) { _m4 = new T.Matrix4(); _q = new T.Quaternion(); _s = new T.Vector3(); _v = new T.Vector3(); _ax = new T.Vector3(0, 0, 1); } }
  function containerMesh(list, cap, dynamic) {
    tmp();
    var n = cap || list.length, base = unitBox();
    var g = new T.BufferGeometry();
    g.setAttribute("position", base.attributes.position);
    g.setIndex(base.index);
    var top = new T.InstancedBufferAttribute(new Float32Array(n * 3), 3), info = new T.InstancedBufferAttribute(new Float32Array(n * 3), 3);
    if (dynamic) { top.setUsage(T.DynamicDrawUsage); info.setUsage(T.DynamicDrawUsage); }
    g.setAttribute("aTop", top); g.setAttribute("aInfo", info);
    var m = new T.InstancedMesh(g, mats.container, n);
    if (dynamic) m.instanceMatrix.setUsage(T.DynamicDrawUsage);
    m.matrixAutoUpdate = false;
    writeContainers(m, list, 0);
    m.count = list.length;
    if (!dynamic) {
      var bs = new T.Box3();
      list.forEach(function (c) { bs.expandByPoint(_v.set(c[0], c[1], (c[8] + c[4] * CT.h) * c[7])); bs.expandByPoint(_v.set(c[0], c[1], 0)); });
      g.boundingSphere = new T.Sphere();
      bs.getBoundingSphere(g.boundingSphere);
      g.boundingSphere.radius += 15 * (list[0] ? list[0][7] : 1);
      m.frustumCulled = true;
    } else m.frustumCulled = false;
    return m;
  }
  var PAL_RGB = null;
  function writeContainers(m, list, from) {
    tmp();
    var top = m.geometry.attributes.aTop, info = m.geometry.attributes.aInfo;
    for (var i = 0; i < list.length; i++) {
      var c = list[i], j = from + i;
      _q.setFromAxisAngle(_ax, c[2]);
      _s.set(c[3] * c[7], CT.w * c[7], c[4] * CT.h * c[7]);
      _v.set(c[0], c[1], c[8] * c[7]);
      _m4.compose(_v, _q, _s);
      m.setMatrixAt(j, _m4);
      var col = PAL_RGB[c[5]] || PAL_RGB[0];
      top.setXYZ(j, col[0], col[1], col[2]);
      info.setXYZ(j, c[6], c[4], c[3]);
    }
    m.instanceMatrix.needsUpdate = true;
    top.needsUpdate = true; info.needsUpdate = true;
  }

  /* ลานตู้: แถว (rows) ในข้อมูล = อักษรต่อช่อง ('.' ว่าง) → รหัส = (ชั้น − 1) + 5 × สี
     ช่องคู่ติดกันในบล็อกเดียวกันรวมเป็นตู้ 40 ฟุต (ตู้ส่วนใหญ่ในโลกเป็น 40 ฟุต) */
  function buildYards(P, set, rtgC, R) {
    var G = D.grid, alph = D.alph, pitch = G.rows * G.rowW + G.lane, per = G.blockBays + G.aisleBays;
    P.yards = [];
    P.d.yards.forEach(function (Y, yi) {
      var o = loc(Y.o[0], Y.o[1]), k = o.k, aa = Y.a * Math.PI / 180, bb = Y.b * Math.PI / 180;
      var A = { x: Math.cos(aa), y: Math.sin(aa) }, B = { x: Math.cos(bb), y: Math.sin(bb) };
      var F = new Frame(o, A, B, k), n = 0, teu = 0, blocks = {};
      Y.rows.forEach(function (row, ri) {
        var blk = Math.floor(ri / G.rows), bo = blk * pitch + (ri % G.rows + 0.5) * G.rowW;
        for (var q = 0; q < row.length; q++) {
          var ch = row[q];
          if (ch === ".") continue;
          var code = alph.indexOf(ch), tiers = code % 5 + 1, col = Math.floor(code / 5), kb = q % per;
          var nx = row[q + 1], pair = kb % 2 === 0 && kb + 1 < G.blockBays && nx && nx !== "." && R() < 0.8;
          var ao = pair ? (q + 1) * G.bay : (q + 0.5) * G.bay, L = pair ? CT.l40 : CT.l20;
          set.add(F.x(ao, bo), F.y(ao, bo), aa, L, tiers, col, (yi * 7919 + ri * 131 + q) % 997 + R(), k);
          n++; teu += (pair ? 2 : 1) * tiers;
          var key = blk + ":" + Math.floor(q / per);
          blocks[key] = (blocks[key] || 0) + (pair ? 2 : 1);
          if (pair) q++;
        }
      });
      // เครนลานตู้ (RTG): บล็อกละ 1 คัน ที่มีตู้พอสมควร
      Object.keys(blocks).forEach(function (key) {
        if (blocks[key] < 24 || R() > 0.85) return;
        var bi = +key.split(":")[0], qi = +key.split(":")[1];
        var ao = (qi * per + 2 + R() * (G.blockBays - 4)) * G.bay, b0 = bi * pitch;
        rtg(rtgC, F, ao, b0 - 1.4, b0 + G.rows * G.rowW + 5.4, R() < 0.7 ? [0.88, 0.7, 0.16] : [0.86, 0.87, 0.88]);
      });
      P.yards.push({ Y: Y, o: o, A: A, B: B, F: F, k: k, n: n, teu: teu, pitch: pitch, per: per, nb: Y.rows.length,
        len: Math.max.apply(null, Y.rows.map(function (r) { return r.length; })) * G.bay });
    });
  }
  // เครนล้อยาง: ขา 4 + คานบน + ห้องคนขับ — คร่อม 6 แถวตู้ + ช่องรถบรรทุก
  function rtg(C, F, a, b0, b1, col) {
    var h = 19, dark = [0.2, 0.22, 0.25];
    [a - 3.4, a + 3.4].forEach(function (aa) {
      [b0, b1].forEach(function (bb) { boxF(C, F, aa - 0.45, aa + 0.45, bb - 0.45, bb + 0.45, 0.9, h, col); boxF(C, F, aa - 0.8, aa + 0.8, bb - 0.7, bb + 0.7, 0, 0.9, dark); });
      beamF(C, F, [aa, b0, h], [aa, b1, h], 1.1, 1.6, col);
    });
    [b0, b1].forEach(function (bb) { beamF(C, F, [a - 3.4, bb, h - 0.6], [a + 3.4, bb, h - 0.6], 0.8, 1.1, col); beamF(C, F, [a - 3.4, bb, 1.6], [a + 3.4, bb, 1.6], 0.6, 0.8, col); });
    boxF(C, F, a - 1.3, a + 1.3, b1 - 3.2, b1 - 0.9, h - 3.2, h - 0.8, [0.85, 0.87, 0.9], dark);
    boxF(C, F, a - 1.2, a + 1.2, b0 + 4, b0 + 7, h - 0.2, h + 0.8, [0.7, 0.72, 0.75]);
  }

  /* ------------------------------------------------------ ท่าเทียบ + ท่าเรือโดยสาร */
  var DECK = [0.62, 0.63, 0.62], WOOD = [0.5, 0.4, 0.3];
  function buildPiers(C) {
    var list = [];
    D.piers.forEach(function (pr, idx) {
      if (lmSkip.osm[pr.i]) return;                   // อยู่ในโมเดลอาคารเด่น (Blender) แล้ว
      var P = decode(pr.g), k = P[0].k, z = (pr.f ? 0.6 : 1.4) * k, i0 = C.n(), col = pr.f ? WOOD : DECK;
      if (pr.c) {
        if (P.length < 3) return;
        walls(C, P, 0, z, shade(col, 0.8));
        fillPoly(C, P, z, col);
      } else {
        var w = pr.w / 10 * k;
        ribbon(C, P, w, z, col);
        for (var i = 0; i < P.length - 1; i++) {          // ขอบข้าง
          var a = P[i], b = P[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y);
          if (L < 1e-3) continue;
          var nx = -(b.y - a.y) / L * w / 2, ny = (b.x - a.x) / L * w / 2, cs = shade(col, 0.75);
          C.quad(C.v(a.x + nx, a.y + ny, 0, cs), C.v(b.x + nx, b.y + ny, 0, cs), C.v(b.x + nx, b.y + ny, z, cs), C.v(a.x + nx, a.y + ny, z, cs));
          C.quad(C.v(a.x - nx, a.y - ny, 0, cs), C.v(b.x - nx, b.y - ny, 0, cs), C.v(b.x - nx, b.y - ny, z, cs), C.v(a.x - nx, a.y - ny, z, cs));
        }
      }
      var bb = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
      P.forEach(function (p) { bb.x0 = Math.min(bb.x0, p.x); bb.y0 = Math.min(bb.y0, p.y); bb.x1 = Math.max(bb.x1, p.x); bb.y1 = Math.max(bb.y1, p.y); });
      list.push({ pr: pr, P: P, bb: bb, k: k, i0: i0, i1: C.n() });
    });
    return list;
  }
  // สีหลังคาโป๊ะตามสายเรือหลักที่จอด (ช่วยให้ดูออกว่าท่าไหนเป็นของสายไหน)
  var LINE_NAME = { O: "ธงส้ม", Y: "ธงเหลือง", G: "ธงเขียวเหลือง", L: "ไม่มีธง", T: "เรือท่องเที่ยว (ธงน้ำเงิน)", N: "แสนแสบ สายนิด้า", M: "แสนแสบ สายภูเขาทอง",
    P: "คลองผดุงกรุงเกษม", B: "คลองบางกอกใหญ่", S: "ไทย สมายล์ โบ้ท", X: "เรือข้ามฟาก", C: "เรือโดยสารคลอง", H: "เรือรับส่งห้าง/โรงแรม" };
  var LINE_COL = { O: "#ef5d28", Y: "#e8c21a", G: "#38b54d", L: "#9aa3ad", T: "#1f75c7", N: "#1d4f91", M: "#1d4f91", P: "#84a307", B: "#84a307", S: "#7d3c98", X: "#e0a030", C: "#3d7fa6", H: "#c9a227" };
  function termRoofCol(l) {
    var c = (l || "")[0];
    return hexRGB(c === "O" || c === "Y" || c === "G" || c === "L" || c === "T" ? "#2f6fae" : c === "N" || c === "M" ? "#c4452e" : c === "X" ? "#6f8f5a" : "#8c6b4a");
  }
  function buildTerminals(C, piers, routes) {
    var out = [];
    D.terms.forEach(function (t) {
      var p = loc(t.x, t.y), k = p.k, dir = null, best = 220 * k;
      // แนวโป๊ะ: ขนานเส้นทางเรือที่ผ่าน (เรือข้ามฟาก → ตั้งฉาก) · ไม่มีเส้นทาง → ตั้งฉากกับทางเดินท่าเทียบ
      routes.forEach(function (R) {
        var RP = R.path.P;
        for (var i = 0; i < RP.length - 1; i++) {
          var a = RP[i], b = RP[i + 1], d = segDist(p, a, b);
          if (d < best) { best = d; var L = Math.hypot(b.x - a.x, b.y - a.y); dir = R.d.k === "X" ? { x: -(b.y - a.y) / L, y: (b.x - a.x) / L } : { x: (b.x - a.x) / L, y: (b.y - a.y) / L }; }
        }
      });
      if (!dir) {
        var bp = 60 * k;
        piers.forEach(function (pi) {
          if (p.x < pi.bb.x0 - bp || p.x > pi.bb.x1 + bp || p.y < pi.bb.y0 - bp || p.y > pi.bb.y1 + bp) return;
          for (var i = 0; i < pi.P.length - 1; i++) {
            var a = pi.P[i], b = pi.P[i + 1], d = segDist(p, a, b);
            if (d < bp) { bp = d; var L = Math.hypot(b.x - a.x, b.y - a.y); dir = { x: -(b.y - a.y) / L, y: (b.x - a.x) / L }; }
          }
        });
      }
      dir = dir || { x: 1, y: 0 };
      var F = new Frame(p, dir, { x: -dir.y, y: dir.x }, k), i0 = C.n(), big = /[OYGLT]/.test(t.l || "");
      var hl = big ? 11 : 7, hw = big ? 3.4 : 2.4, roof = termRoofCol(t.l);
      var inLm = lmSkip.at.some(function (a) { return Math.hypot(a.x - p.x, a.y - p.y) < 75 * k; });
      if (inLm) { out.push({ t: t, p: p, F: F, k: k, hl: hl, hw: hw, i0: i0, i1: i0, lm: true }); return; }
      boxF(C, F, -hl, hl, -hw, hw, 0, 0.9, [0.3, 0.33, 0.36], [0.55, 0.56, 0.55]);                  // โป๊ะลอยน้ำ
      [-hl + 1, 0, hl - 1].forEach(function (a) { [-hw + 0.5, hw - 0.5].forEach(function (b) { boxF(C, F, a - 0.12, a + 0.12, b - 0.12, b + 0.12, 0.9, 3.3, [0.75, 0.76, 0.78]); }); });
      boxF(C, F, -hl - 0.6, hl + 0.6, -hw - 0.6, 0, 3.3, 3.9, roof, shade(roof, 1.08));          // หลังคาจั่ว (สองแผ่นเอียง)
      boxF(C, F, -hl - 0.6, hl + 0.6, 0, hw + 0.6, 3.3, 3.9, roof, shade(roof, 0.92));
      boxF(C, F, -hl * 0.4, hl * 0.4, -0.1, 0.1, 3.9, 4.6, [0.95, 0.96, 0.97]);                  // ป้ายชื่อบนสัน
      out.push({ t: t, p: p, F: F, k: k, hl: hl, hw: hw, i0: i0, i1: C.n() });
    });
    return out;
  }
  function segDist(p, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy, t = L2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2)) : 0;
    return Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t);
  }
  /* ------------------------------------------------------ แบบเรือ (สร้างในโค้ด)
     พิกัดเรือ: x = กราบขวา, y = หัวเรือ, z = ขึ้น (เมตร ที่ความยาวอ้างอิง Lr) — ขยายเท่ากันทุกแกนตามความยาวจริง
     ส่วนที่ tint = 1 (ตัวเรือ) ย้อมด้วยสีรายลำ ส่วนอื่นคงสี */
  var F0 = new Frame({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, 1);
  function quadV(C, a, b, c, d, col) { C.quad(C.v(a[0], a[1], a[2], col), C.v(b[0], b[1], b[2], col), C.v(c[0], c[1], c[2], col), C.v(d[0], d[1], d[2], col)); }
  function sbox(C, x0, x1, y0, y1, z0, z1, col, top, tint) { C.tint = tint ? 1 : 0; boxF(C, F0, x0, x1, y0, y1, z0, z1, col, top); C.tint = 0; }
  function sbeam(C, p0, p1, w, h, col) { C.tint = 0; beamF(C, F0, p0, p1, w, h, col); }
  function hull(C, L, B, D, o) {
    o = o || {};
    var bow = o.bow || 0.2, st = o.stern || 0.06, sw = o.sternW == null ? 0.86 : o.sternW, sheer = o.sheer == null ? 0.12 : o.sheer, bexp = o.bexp || 1.9;
    var ys = [-0.5, -0.5 + st * 0.35, -0.5 + st, 0.5 - bow, 0.5 - bow * 0.72, 0.5 - bow * 0.48, 0.5 - bow * 0.28, 0.5 - bow * 0.12, 0.5];
    function hw(f) {
      if (f < -0.5 + st) { var t = (f + 0.5) / st; return 0.5 * (sw + (1 - sw) * Math.sqrt(t)); }
      if (f > 0.5 - bow) { var u = (f - 0.5 + bow) / bow; return 0.5 * Math.max(o.tip || 0, 1 - Math.pow(u, bexp)); }
      return 0.5;
    }
    function zt(f) { return D * (1 + sheer * Math.pow(Math.max(0, (f - 0.25) / 0.25), 1.6)); }
    var bands = o.bands || [[0, D * 0.14, [0.55, 0.13, 0.12], 0], [D * 0.14, 1e9, o.side || [1, 1, 1], 1]];
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < ys.length - 1; i++) {
        var f0 = ys[i], f1 = ys[i + 1], x0 = s * hw(f0) * B, x1 = s * hw(f1) * B, y0 = f0 * L, y1 = f1 * L;
        bands.forEach(function (bd) {
          var za0 = Math.min(bd[0], zt(f0)), za1 = Math.min(bd[1], zt(f0)), zb0 = Math.min(bd[0], zt(f1)), zb1 = Math.min(bd[1], zt(f1));
          if (za1 - za0 < 1e-4 && zb1 - zb0 < 1e-4) return;
          C.tint = bd[3];
          quadV(C, [x0, y0, za0], [x1, y1, zb0], [x1, y1, zb1], [x0, y0, za1], shade(bd[2], s > 0 ? 1 : 0.9));
        });
      }
    }
    var sx = hw(-0.5) * B, tz = zt(-0.5);
    bands.forEach(function (bd) {
      var z0 = Math.min(bd[0], tz), z1 = Math.min(bd[1], tz);
      if (z1 - z0 < 1e-4) return;
      C.tint = bd[3];
      quadV(C, [-sx, -0.5 * L, z0], [sx, -0.5 * L, z0], [sx, -0.5 * L, z1], [-sx, -0.5 * L, z1], shade(bd[2], 0.84));
    });
    C.tint = 0;
    var deck = o.deck || [0.3, 0.32, 0.34];
    for (i = 0; i < ys.length - 1; i++) {
      var g0 = ys[i], g1 = ys[i + 1];
      quadV(C, [-hw(g0) * B, g0 * L, zt(g0)], [hw(g0) * B, g0 * L, zt(g0)], [hw(g1) * B, g1 * L, zt(g1)], [-hw(g1) * B, g1 * L, zt(g1)], deck);
    }
    return { zt: zt, hw: hw };
  }
  // อาคารบนเรือ: ชั้นละ lh ม. ผนังขาว + แถบหน้าต่าง
  function house(C, x0, x1, y0, y1, z0, levels, lh, wall, win, roof) {
    for (var l = 0; l < levels; l++) {
      var z = z0 + l * lh;
      sbox(C, x0, x1, y0, y1, z, z + lh * 0.58, wall);
      sbox(C, x0 + 0.05, x1 - 0.05, y0 + 0.05, y1 - 0.05, z + lh * 0.58, z + lh, win);
    }
    sbox(C, x0 - 0.1, x1 + 0.1, y0 - 0.1, y1 + 0.1, z0 + levels * lh, z0 + levels * lh + 0.4, roof || wall);
    return z0 + levels * lh + 0.4;
  }
  var WHITE = [0.93, 0.94, 0.95], WIN = [0.16, 0.2, 0.25], DARK = [0.14, 0.15, 0.17], GRAYD = [0.36, 0.38, 0.4];
  function funnel(C, y0, y1, w, z0, z1, col) {
    sbox(C, -w, w, y0, y1, z0, z1 - 1.6, col);
    sbox(C, -w, w, y0, y1, z1 - 1.6, z1, DARK);
  }
  function deckCrane(C, x, y, z, reach, col) {
    sbox(C, x - 0.8, x + 0.8, y - 0.8, y + 0.8, z, z + 11, col);
    sbox(C, x - 1.2, x + 1.2, y - 1.2, y + 1.2, z + 9, z + 11.5, WHITE);
    sbeam(C, [x, y, z + 10], [x + reach * 0.35, y + reach, z + 4], 0.7, 0.9, col);
  }
  var SHIP_DEFS = [
    { id: "container", name: "เรือบรรทุกตู้สินค้า", Lr: 300, Br: 42, build: function (C) {
      var D0 = 14; hull(C, 300, 42, D0, { bow: 0.2, stern: 0.06, sternW: 0.88, deck: [0.27, 0.29, 0.31] });
      var top = house(C, -16, 16, -111, -95, D0, 7, 3, WHITE, WIN);
      sbox(C, -21, 21, -107, -97, top - 3, top, WHITE, WHITE);                                 // ปีกสะพานเดินเรือ
      funnel(C, -129, -120, 4, D0, top + 3, [0.72, 0.18, 0.16]);
      sbeam(C, [0, 138, D0 + 3], [0, 138, D0 + 13], 0.5, 0.5, WHITE);
      return { H: top + 4, deck: D0 + 0.6, cargo: [-0.3, 0.41] };
    } },
    { id: "general", name: "เรือสินค้าทั่วไป", Lr: 140, Br: 22, build: function (C) {
      var D0 = 9; hull(C, 140, 22, D0, { bow: 0.18, stern: 0.07, sheer: 0.18, deck: [0.34, 0.36, 0.37] });
      var top = house(C, -9, 9, -60, -47, D0, 4, 2.8, WHITE, WIN);
      funnel(C, -66, -61, 2.4, D0, top + 3, [0.2, 0.36, 0.6]);
      [-34, -8, 17, 42].forEach(function (y) { sbox(C, -7.2, 7.2, y - 9, y + 9, D0, D0 + 1.8, [0.24, 0.38, 0.3]); });
      [-21, 4, 29].forEach(function (y, i) { deckCrane(C, i % 2 ? 3 : -3, y, D0, 14, [0.86, 0.66, 0.16]); });
      return { H: top + 3, deck: D0 };
    } },
    { id: "bulk", name: "เรือบรรทุกสินค้าเทกอง", Lr: 190, Br: 32, build: function (C) {
      var D0 = 12; hull(C, 190, 32, D0, { bow: 0.16, stern: 0.06, sternW: 0.9, deck: [0.42, 0.22, 0.18] });
      var top = house(C, -12, 12, -86, -71, D0, 6, 2.8, WHITE, WIN);
      funnel(C, -93, -87, 3, D0, top + 3, [0.12, 0.12, 0.13]);
      for (var i = 0; i < 7; i++) { var y = -60 + i * 21; sbox(C, -9.5, 9.5, y - 7.5, y + 7.5, D0, D0 + 2.2, [0.32, 0.36, 0.42]); }
      [-50, -8, 34, 76].forEach(function (y, i) { deckCrane(C, i % 2 ? 4 : -4, y + 10, D0, 18, [0.85, 0.65, 0.15]); });
      return { H: top + 3, deck: D0 };
    } },
    { id: "tanker", name: "เรือบรรทุกน้ำมัน/ก๊าซ", Lr: 180, Br: 32, build: function (C) {
      var D0 = 10; hull(C, 180, 32, D0, { bow: 0.17, stern: 0.05, sternW: 0.92, deck: [0.46, 0.2, 0.16] });
      var top = house(C, -12, 12, -82, -67, D0, 6, 2.8, WHITE, WIN);
      funnel(C, -88, -83, 3, D0, top + 3, [0.9, 0.9, 0.9]);
      sbox(C, -1.2, 1.2, -64, 76, D0, D0 + 1.6, [0.62, 0.64, 0.66]);                          // ท่อกลางลำ
      sbox(C, -11, 11, -3, 3, D0, D0 + 2.4, [0.62, 0.64, 0.66]);                               // manifold
      sbox(C, -0.6, 0.6, 2, 3.2, D0, D0 + 9, [0.85, 0.65, 0.15]);
      [-40, -10, 20, 50].forEach(function (y) { sbox(C, -6, 6, y - 1, y + 1, D0, D0 + 0.8, [0.6, 0.6, 0.6]); });
      return { H: top + 3, deck: D0 };
    } },
    { id: "roro", name: "เรือขนส่งรถยนต์ (Ro-Ro)", Lr: 200, Br: 32, build: function (C) {
      var D0 = 30; hull(C, 200, 32, D0, { bow: 0.12, stern: 0.03, sternW: 0.98, sheer: 0, bexp: 1.4, tip: 0.12, deck: [0.86, 0.87, 0.88],
        bands: [[0, 3, [0.55, 0.13, 0.12], 0], [3, 22, [1, 1, 1], 1], [22, 1e9, [0.95, 0.96, 0.97], 0]] });
      sbox(C, -15.2, 15.2, 64, 68, 25.5, 28.5, WIN);                                            // หน้าต่างสะพานเดินเรือด้านหน้า
      funnel(C, -84, -76, 2.5, D0, D0 + 5, [0.9, 0.9, 0.9]);
      sbox(C, -6, 6, -103, -100, 2, 9, [0.5, 0.52, 0.54]);                                      // ทางลาดท้าย
      return { H: D0 + 5, deck: D0 };
    } },
    { id: "cruise", name: "เรือสำราญ", Lr: 290, Br: 36, build: function (C) {
      var D0 = 11; hull(C, 290, 36, D0, { bow: 0.18, stern: 0.05, sternW: 0.9, deck: [0.62, 0.52, 0.4], bands: [[0, 1.6, [0.55, 0.13, 0.12], 0], [1.6, 1e9, [1, 1, 1], 1]] });
      var z = D0, n = 12;
      for (var l = 0; l < n; l++) {
        var yf = 90 - l * 3.5, yb = -128 + (l > 8 ? (l - 8) * 6 : 0), w = 17.2 - (l > 9 ? (l - 9) * 2 : 0);
        sbox(C, -w, w, yb, yf, z, z + 1.6, WHITE);
        sbox(C, -w + 0.1, w - 0.1, yb + 0.1, yf - 0.1, z + 1.6, z + 2.9, l < 3 ? WIN : [0.28, 0.34, 0.42]);
        z += 2.9;
      }
      sbox(C, -16, 16, -120, 60, z, z + 0.4, [0.3, 0.55, 0.7]);                                 // ดาดฟ้าบน/สระ
      funnel(C, -100, -80, 4, z, z + 9, [0.85, 0.2, 0.18]);
      for (var y = -90; y < 60; y += 10) { [-1, 1].forEach(function (s) { sbox(C, s * 18.2 - 1.6, s * 18.2 + 1.6, y, y + 8, D0 + 6.5, D0 + 9.3, [0.95, 0.55, 0.12]); }); }   // เรือชูชีพ
      return { H: z + 9, deck: D0 };
    } },
    { id: "tug", name: "เรือลากจูง", Lr: 30, Br: 11, build: function (C) {
      var D0 = 3.2; hull(C, 30, 11, D0, { bow: 0.35, stern: 0.22, sternW: 0.62, sheer: 0.3, bexp: 2.4, deck: [0.3, 0.3, 0.3] });
      sbox(C, -3.4, 3.4, -4, 6.5, D0, D0 + 2.6, WHITE);
      sbox(C, -3, 3, 0.5, 6, D0 + 2.6, D0 + 3.5, WHITE);
      sbox(C, -3.05, 3.05, 0.45, 6.05, D0 + 3.5, D0 + 4.6, WIN);
      sbox(C, -3.2, 3.2, 0.3, 6.2, D0 + 4.6, D0 + 4.9, WHITE);
      sbox(C, -0.9, 0.9, -3, -1, D0 + 2.6, D0 + 6, DARK);
      sbeam(C, [0, 3, D0 + 4.9], [0, 3, D0 + 9], 0.25, 0.25, WHITE);
      return { H: D0 + 9, deck: D0 };
    } },
    { id: "barge", name: "เรือลำเลียงสินค้า (เรือบรรทุกข้าว/ทราย)", Lr: 40, Br: 9, build: function (C) {
      var D0 = 2; hull(C, 40, 9, D0, { bow: 0.12, stern: 0.1, sternW: 0.5, sheer: 0.25, deck: [0.3, 0.24, 0.18], bands: [[0, 0.4, [0.12, 0.12, 0.12], 0], [0.4, 1e9, [1, 1, 1], 1]] });
      sbox(C, -3.8, 3.8, -11, 16, D0, D0 + 1.1, [0.16, 0.2, 0.18], [0.2, 0.25, 0.22]);        // ผ้าใบคลุมระวาง
      sbox(C, -3.6, 3.6, -18, -12.5, D0, D0 + 2.1, [0.42, 0.28, 0.17]);                          // ที่พักท้ายเรือ
      C.tint = 0;
      quadV(C, [-3.9, -18.3, D0 + 2.1], [-3.9, -12.2, D0 + 2.1], [0, -12.2, D0 + 3], [0, -18.3, D0 + 3], [0.32, 0.22, 0.14]);
      quadV(C, [3.9, -18.3, D0 + 2.1], [3.9, -12.2, D0 + 2.1], [0, -12.2, D0 + 3], [0, -18.3, D0 + 3], [0.36, 0.25, 0.16]);
      return { H: D0 + 3, deck: D0 };
    } },
    { id: "express", name: "เรือด่วนเจ้าพระยา", Lr: 30, Br: 4.6, build: function (C) {
      var D0 = 1.1; hull(C, 30, 4.6, D0, { bow: 0.3, stern: 0.05, sternW: 0.8, sheer: 0.35, deck: [0.5, 0.45, 0.4],
        bands: [[0, 0.5, [0.94, 0.95, 0.96], 0], [0.5, 0.95, [1, 1, 1], 1], [0.95, 1e9, [0.94, 0.95, 0.96], 0]] });
      sbox(C, -2.2, 2.2, -11.5, 8.5, D0, D0 + 0.7, WHITE);
      sbox(C, -2.15, 2.15, -11.4, 8.4, D0 + 0.7, D0 + 1.75, WIN);
      sbox(C, -2.35, 2.35, -12, 9, D0 + 1.75, D0 + 1.95, WHITE, [0.86, 0.87, 0.88]);
      sbox(C, -0.05, 0.05, -14.6, -13.8, D0 + 0.9, D0 + 2.6, [1, 1, 1], null, true);           // ธงประจำสาย (ย้อมสีสาย)
      return { H: D0 + 2.6, deck: D0 };
    } },
    { id: "canal", name: "เรือโดยสารคลอง", Lr: 20, Br: 2.6, build: function (C) {
      var D0 = 0.9; hull(C, 20, 2.6, D0, { bow: 0.26, stern: 0.14, sternW: 0.55, sheer: 0.4, deck: [0.4, 0.35, 0.3] });
      sbox(C, -1.25, 1.25, -6.5, 6.2, D0, D0 + 0.9, [0.35, 0.55, 0.85], null, true);            // ผ้าใบกันน้ำกระเซ็น
      sbox(C, -1.35, 1.35, -6.8, 6.5, D0 + 0.9, D0 + 1.08, [0.9, 0.91, 0.92]);
      return { H: D0 + 1.1, deck: D0 };
    } },
    { id: "ferry", name: "เรือข้ามฟาก", Lr: 14, Br: 4.4, build: function (C) {
      var D0 = 1.0; hull(C, 14, 4.4, D0, { bow: 0.2, stern: 0.1, sternW: 0.85, sheer: 0.2, deck: [0.45, 0.4, 0.34] });
      [-5, 0, 5].forEach(function (y) { [-2, 2].forEach(function (x) { sbox(C, x - 0.07, x + 0.07, y - 0.07, y + 0.07, D0, D0 + 1.9, WHITE); }); });
      sbox(C, -2.25, 2.25, -5.6, 5.6, D0 + 1.9, D0 + 2.08, [0.9, 0.88, 0.8]);
      return { H: D0 + 2.1, deck: D0 };
    } },
    { id: "shuttle", name: "เรือรับส่ง/เรือท่องเที่ยว", Lr: 20, Br: 5, build: function (C) {
      var D0 = 1.2; hull(C, 20, 5, D0, { bow: 0.26, stern: 0.06, sternW: 0.85, sheer: 0.3, deck: [0.5, 0.42, 0.34] });
      house(C, -2.3, 2.3, -8, 5.5, D0, 1, 2, WHITE, WIN, [0.86, 0.87, 0.88]);
      return { H: D0 + 2.4, deck: D0 };
    } }
  ];
  var CLS = {};
  SHIP_DEFS.forEach(function (d, i) { d.i = i; CLS[d.id] = i; });

  /* กองเรือ 1 แบบ = InstancedMesh 1 ก้อน · ช่องแรกเป็นเรือนิ่ง (จอด/ทอดสมอ) ตามด้วยเรือที่ขยับทุกเฟรม */
  function shipMeta(def) {
    if (!def.meta) { def._C = new CB(true); def.meta = def.build(def._C); }
    return def.meta;
  }
  function Fleet(def, cap, parent) {
    shipMeta(def);
    var g = toGeo(def._C);
    this.def = def; this.cap = cap; this.nStatic = 0; this.n = 0;
    this.mesh = new T.InstancedMesh(g, mats.ship, cap);
    this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
    var c = new T.Color(1, 1, 1);
    tmp();
    _m4.makeScale(0, 0, 0);
    for (var i = 0; i < cap; i++) { this.mesh.setColorAt(i, c); this.mesh.setMatrixAt(i, _m4); }
    this.mesh.count = 0;
    this.tris = g.index.count / 3;
    parent.add(this.mesh);
  }
  var _col = null;
  // ship: x, y (ฉาก), h (ทิศหัวเรือ เรเดียน จากเหนือตามเข็ม), s (สเกลรวม k × L/Lr), col (hex)
  Fleet.prototype.put = function (i, x, y, h, s, col) {
    if (i >= this.cap) return;
    tmp();
    if (!_col) _col = new T.Color();
    _q.setFromAxisAngle(_ax, -h);
    _v.set(x, y, 0); _s.set(s, s, s);
    _m4.compose(_v, _q, _s);
    this.mesh.setMatrixAt(i, _m4);
    this.mesh.setColorAt(i, _col.set(col));
  };
  Fleet.prototype.commit = function (n) {
    this.n = n; this.mesh.count = n;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  };

  // คลื่นท้ายเรือ (เฉพาะเรือที่แล่น)
  function WakeSet(cap, parent) {
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0.5, -1, 0, -0.5, -1, 0], 3));
    g.setAttribute("uv", new T.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    this.mesh = new T.InstancedMesh(g, mats.wake, cap);
    this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 3;
    this.mesh.count = 0;
    this.cap = cap; this.n = 0;
    parent.add(this.mesh);
  }
  WakeSet.prototype.put = function (x, y, h, w, len) {
    if (this.n >= this.cap) return;
    tmp();
    _q.setFromAxisAngle(_ax, -h);
    _v.set(x, y, 0.15); _s.set(w, len, 1);
    _m4.compose(_v, _q, _s);
    this.mesh.setMatrixAt(this.n++, _m4);
  };
  WakeSet.prototype.commit = function () { this.mesh.count = this.n; this.mesh.instanceMatrix.needsUpdate = true; this.n = 0; };

  // ขนาดจริงของเรือหนึ่งลำ
  function shipDims(cls, L) {
    var d = SHIP_DEFS[cls], sc = L / d.Lr;
    return { L: L, B: d.Br * sc, H: d.meta ? d.meta.H * sc : 10 * sc, deck: d.meta ? d.meta.deck * sc : 5 * sc, sc: sc };
  }
  // ตู้บนเรือตู้สินค้า: เรียงเป็นช่อง (bay) ตามลำ × แถวขวางลำ · สูง 2–7 ชั้นเหนือดาดฟ้า
  function shipCargo(sh, R, out) {
    var def = SHIP_DEFS[sh.cls], cg = def.meta.cargo;
    if (!cg) return;
    var d = shipDims(sh.cls, sh.L), y0 = cg[0] * sh.L, y1 = cg[1] * sh.L, nr = Math.max(4, Math.floor(d.B * 0.92 / 2.52));
    var sn = Math.sin(sh.h), cs = Math.cos(sh.h), ang = Math.PI / 2 - sh.h, k = sh.k;
    for (var y = y0 + 6.6; y < y1 - 6; y += 13.3) {
      if (R() < 0.07) continue;
      var base = 2 + Math.floor(R() * 4.5);
      for (var r = 0; r < nr; r++) {
        var xo = (r - (nr - 1) / 2) * 2.52, t = Math.max(1, Math.min(7, base + (R() < 0.35 ? (R() < 0.5 ? -1 : 1) : 0) - (Math.abs(xo) > d.B * 0.38 ? 1 : 0)));
        out.push([sh.x + (cs * xo + sn * y) * k, sh.y + (-sn * xo + cs * y) * k, ang, CT.l40, t, Math.floor(R() * 16), R() * 997, k, d.deck]);
      }
    }
  }
  /* ------------------------------------------------------ เส้นทาง (เรือโดยสาร / ร่องน้ำ) */
  function Path(P) {
    this.P = P; this.cum = [0];
    for (var i = 1; i < P.length; i++) this.cum.push(this.cum[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y) / ((P[i].k + P[i - 1].k) / 2));
    this.len = this.cum[this.cum.length - 1];
  }
  // ตำแหน่งที่ระยะ s (ม.) + ทิศ (เรเดียนจากเหนือตามเข็ม) ของช่วงนั้น
  Path.prototype.at = function (s, out) {
    var c = this.cum, lo = 0, hi = c.length - 1;
    s = Math.max(0, Math.min(this.len, s));
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (c[m] <= s) lo = m; else hi = m; }
    var a = this.P[lo], b = this.P[hi], t = c[hi] > c[lo] ? (s - c[lo]) / (c[hi] - c[lo]) : 0;
    out.x = a.x + (b.x - a.x) * t; out.y = a.y + (b.y - a.y) * t; out.k = a.k;
    out.h = Math.atan2(b.x - a.x, b.y - a.y);
    return out;
  };
  var ROUTE_CLS = { O: "express", Y: "express", G: "express", L: "express", T: "express", N: "canal", M: "canal", P: "canal", B: "canal", C: "canal", S: "shuttle", H: "shuttle", X: "ferry" };
  var ROUTE_SPEC = { express: { v: 6.5, dwell: 20, off: 14 }, canal: { v: 4.6, dwell: 12, off: 2.2 }, shuttle: { v: 4.5, dwell: 25, off: 12 }, ferry: { v: 2.4, dwell: 45, off: 0 } };

  function setupMovers() {
    var R = rng(20260919), mv = [];
    model.routes = D.routes.map(function (rd) { return { d: rd, path: new Path(decode(rd.g)) }; });
    model.routes.forEach(function (Rt) {
      var cls = ROUTE_CLS[Rt.d.k] || "shuttle", sp = ROUTE_SPEC[cls], n = Rt.d.nb, len = Rt.path.len;
      var stops = Rt.d.st.slice().sort(function (a, b) { return a - b; });
      if (!stops.length || stops[0] > 30) stops.unshift(0);
      if (stops[stops.length - 1] < len - 30) stops.push(len);
      for (var i = 0; i < n; i++) {
        var s = len * (i + R() * 0.6) / n;
        mv.push({ type: "route", Rt: Rt, cls: CLS[cls], sp: sp, stops: stops, s: s, dir: i % 2 ? -1 : 1, v: sp.v * 0.8, dwell: 0, L: SHIP_DEFS[CLS[cls]].Lr,
          col: Rt.d.k === "X" ? HULL_PAL[Math.floor(R() * 4) + 4] : Rt.d.col, hd: null, line: Rt.d });
      }
    });
    // เรือสินค้าในร่องน้ำเจ้าพระยา
    var river = new Path(decode(D.river.g)), kt = D.river.kt;
    model.river = river;
    for (var f = 0; f < 3; f++) {
      mv.push({ type: "river", reg: "bkk", path: river, cls: CLS.container, L: 145 + R() * 27, s: 3000 + (kt - 3500) * (f + 0.3) / 3, dir: f % 2 ? -1 : 1,
        a: 2500, b: kt - 350, v: 3, vmax: 4, dwell: 0, dwellA: 60, dwellB: 120, off: 55, col: HULL_PAL[Math.floor(R() * 16)], wrap: false, tugs: 1, cargoRng: R() * 1e6 });
    }
    for (var b = 0; b < 6; b++) {
      var dir = b % 2 ? -1 : 1;
      mv.push({ type: "river", reg: "bkk", path: river, cls: CLS.tug, L: 26, s: 1500 + (river.len - 3000) * (b + R() * 0.5) / 6, dir: dir, a: 1000, b: river.len - 800,
        v: 2.2, vmax: 2.2, dwell: 0, off: 42, col: ["#8b1e1e", "#1b1f24", "#1f3b63"][b % 3], wrap: true, barges: 2 + (b % 3), bargeCol: ["#5a3b22", "#3a3f46", "#4a3322"][b % 3] });
    }
    for (var t = 0; t < 2; t++) {
      mv.push({ type: "river", reg: "bkk", path: river, cls: CLS.tanker, L: 85 + R() * 20, s: 2000 + t * 9000, dir: t ? -1 : 1, a: 0, b: 26000, v: 3.3, vmax: 3.3, dwell: 0, off: 60,
        col: HULL_PAL[Math.floor(R() * 16)], wrap: true });
    }
    // เรือเข้า-ออกแหลมฉบัง
    D.lcb.forEach(function (pd, pi) {
      var path = new Path(decode(pd.g));
      for (var j = 0; j < 2; j++) {
        mv.push({ type: "lcb", reg: "lcb", path: path, cls: CLS.container, L: 250 + R() * 80, s: path.len * (j ? 0.25 : 0.8), dir: j ? 1 : -1, a: 0, b: path.len,
          v: 3, vmax: 5.5, dwell: 0, dwellA: 80, dwellB: 150, off: 0, col: HULL_PAL[Math.floor(R() * 16)], wrap: false, tugs: 2, cargoRng: R() * 1e6 });
      }
    });
    // ตู้บนเรือที่แล่น: จัดผังครั้งเดียว (พิกัดในลำเรือ) แล้วย้ายตามเรือทุกเฟรม
    var capCargo = 0;
    mv.forEach(function (m) {
      if (m.cargoRng == null) return;
      var RR = rng(m.cargoRng), tmpList = [];
      shipCargo({ cls: m.cls, L: m.L, x: 0, y: 0, h: 0, k: 1 }, RR, tmpList);
      m.cargo = tmpList;                                  // [xo(=x), yo(=y), ...] ที่หัวเรือชี้เหนือ k = 1
      capCargo += tmpList.length;
    });
    model.movers = mv;
    model.cargoCap = capCargo + 4000;                    // + เผื่อตู้บนเรือตู้จริง (AIS)
    model.cargoDyn = containerMesh([], model.cargoCap, true);
    model.cargoDyn.count = 0;
    model.moveGroup.add(model.cargoDyn);
  }

  function angLerp(a, b, t) { var d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + d * t; }
  var _pt = { x: 0, y: 0, k: 1, h: 0 };
  function stepMover(m, dt) {
    if (m.type === "route") {
      if (m.dwell > 0) { m.dwell -= dt; return; }
      var tgt = null, st = m.stops;
      if (m.dir > 0) { for (var i = 0; i < st.length; i++) if (st[i] > m.s + 0.5) { tgt = st[i]; break; } }
      else { for (i = st.length - 1; i >= 0; i--) if (st[i] < m.s - 0.5) { tgt = st[i]; break; } }
      if (tgt == null) { m.dir = -m.dir; m.dwell = m.sp.dwell; return; }
      var d = Math.abs(tgt - m.s), vmax = Math.min(m.sp.v, Math.sqrt(2 * 0.5 * d) + 0.2);
      m.v += Math.max(-1, Math.min(0.5, (vmax - m.v) / Math.max(dt, 0.016))) * dt;
      var step = Math.min(d, Math.max(0, m.v) * dt);
      m.s += m.dir * step;
      if (d - step < 0.4) { m.s = tgt; m.v = 0; m.dwell = m.sp.dwell * (0.7 + Math.random() * 0.6); }
      return;
    }
    // เรือสินค้า: ไป-กลับระหว่าง a↔b (หรือวนรอบเมื่อ wrap) · ชะลอเมื่อใกล้ปลายทาง
    if (m.dwell > 0) { m.dwell -= dt; return; }
    var end = m.dir > 0 ? m.b : m.a, dd = Math.abs(end - m.s);
    var vt = m.wrap ? m.vmax : Math.max(0.6, Math.min(m.vmax, 0.8 + dd / 450));
    m.v += (vt - m.v) * Math.min(1, dt * 0.25);
    m.s += m.dir * m.v * dt;
    if (m.dir > 0 ? m.s >= m.b : m.s <= m.a) {
      if (m.wrap) m.s = m.dir > 0 ? m.a : m.b;
      else { m.s = end; m.dir = -m.dir; m.dwell = m.dir > 0 ? (m.dwellA || 60) : (m.dwellB || 60); m.v = 0.4; }
    }
  }
  // เขียนเรือหนึ่งลำลงกองเรือ: คืน true ถ้าอยู่ในจอ
  function placeMover(m, dt, slots, cargoOut) {
    var p = m.path || m.Rt.path;
    p.at(m.s, _pt);
    var h = m.dir > 0 ? _pt.h : _pt.h + Math.PI, k = _pt.k;
    var off = m.type === "route" ? m.sp.off : m.off;
    var x = _pt.x + Math.cos(h) * off * k, y = _pt.y - Math.sin(h) * off * k;
    if (m.hd == null) m.hd = h;
    m.hd = angLerp(m.hd, h, 1 - Math.exp(-dt / (m.type === "route" ? 1.4 : 5)));
    m.x = x; m.y = y; m.k = k;
    if (hiddenByLive(x, y)) return false;
    var def = SHIP_DEFS[m.cls], sc = m.L / def.Lr;
    var F = model.fleets[m.cls];
    F.put(slots[m.cls]++, x, y, m.hd, sc * k, m.col);
    var moving = m.dwell <= 0 && m.v > 0.3, B = def.Br * sc;
    if (moving) model.wakes.put(x - Math.sin(m.hd) * m.L / 2 * k, y - Math.cos(m.hd) * m.L / 2 * k, m.hd, B * (2.2 + m.v * 0.4) * k, (m.L * 0.9 + m.v * 14) * k);
    // เรือพ่วง (เรือลำเลียงต่อท้ายเรือลากจูง)
    if (m.barges) {
      for (var i = 1; i <= m.barges; i++) {
        var sb = m.s - m.dir * (m.L / 2 + 6 + i * 44);
        if (sb < 0 || sb > p.len) continue;
        p.at(sb, _pt);
        var hb = m.dir > 0 ? _pt.h : _pt.h + Math.PI, xb = _pt.x + Math.cos(hb) * off * _pt.k, yb = _pt.y - Math.sin(hb) * off * _pt.k;
        model.fleets[CLS.barge].put(slots[CLS.barge]++, xb, yb, hb, _pt.k, m.bargeCol);
      }
    }
    // เรือลากจูงนำหน้า/ตามหลังเรือใหญ่
    if (m.tugs && (m.type === "river" || Math.abs((m.dir > 0 ? m.b : m.a) - m.s) < 2600 || m.dwell > 0)) {
      for (var t = 0; t < m.tugs; t++) {
        var sgn = t === 0 ? 1 : -1, st = m.s + m.dir * sgn * (m.L / 2 + 28);
        if (st < 0 || st > p.len) continue;
        p.at(st, _pt);
        var ht = m.dir > 0 ? _pt.h : _pt.h + Math.PI, lat = (t === 0 ? 0 : B * 0.2) + off;
        model.fleets[CLS.tug].put(slots[CLS.tug]++, _pt.x + Math.cos(ht) * lat * _pt.k, _pt.y - Math.sin(ht) * lat * _pt.k, ht, _pt.k, "#8b1e1e");
      }
    }
    if (m.cargo) {
      var sn = Math.sin(m.hd), cs = Math.cos(m.hd), ang = Math.PI / 2 - m.hd;
      m.cargo.forEach(function (c) {
        cargoOut.push([x + (cs * c[0] + sn * c[1]) * k, y + (-sn * c[0] + cs * c[1]) * k, ang, c[3], c[4], c[5], c[6], k, c[8]]);
      });
    }
    var sp2 = H.project(x, y, 0);
    return !!(sp2 && sp2.x > -300 && sp2.y > -300 && sp2.x < model.cw + 300 && sp2.y < model.ch + 300);
  }

  /* ------------------------------------------------------ ประกอบฉาก */
  function buildModel() {
    var t0 = performance.now();
    group = new T.Group();
    group.name = "port";
    group.visible = visible;
    group.matrixAutoUpdate = false;
    model = {};
    PAL_RGB = (D.palette || PALETTE_DEFAULT).map(hexRGB);
    // อาคารเด่นที่ปั้นใน Blender (ชั้นแลนด์มาร์ก 3 มิติ) — ไม่วาดกล่อง/โป๊ะซ้ำ
    lmSkip = { osm: {}, at: [] };
    ((window.BKK_LM3D && window.BKK_LM3D.items) || []).forEach(function (it) {
      if (!it.port) return;
      it.osm.forEach(function (id) { lmSkip.osm[id] = 1; });
      lmSkip.at.push(H.toLocal(it.anchor[0], it.anchor[1]));
    });
    makeMaterials();
    SHIP_DEFS.forEach(shipMeta);
    ["ground", "bldGroup", "yardGroup", "pierGroup", "shipGroup", "moveGroup"].forEach(function (k) {
      model[k] = new T.Group(); model[k].matrixAutoUpdate = false; group.add(model[k]);
    });
    var R = rng(7331);
    var bldC = new CB(), rtgC = new CB(), pierC = new CB(), termC = new CB();
    var cset = new ContainerSet();
    model.blds = []; model.tanks = []; model.cranes = []; model.ports = [];
    model.ships = [];
    // เรือนิ่ง (จอด/ทอดสมอ)
    function addStatic(s, port) {
      var p = loc(s[0], s[1]), sh = { reg: regionOfLat(s[1] / 1e6), x: p.x, y: p.y, k: p.k, h: s[2] / 10 * Math.PI / 180, cls: s[3], L: s[4] / 10, col: HULL_PAL[s[5] % 16], qi: s[6], port: port, static: true };
      model.ships.push(sh);
      if (sh.cls === CLS.container) shipCargo(sh, rng(Math.round(p.x * 13 + p.y * 7)), sh.cargo = []);
      return sh;
    }
    D.ports.forEach(function (pd, pi) {
      var P = { d: pd, i: pi };
      P.quays = pd.quays.map(function (qd) { return quayOf(P, qd); });
      P.rings = pd.R.map(decode);
      P.c = H.toLocal(pd.c[0], pd.c[1]);
      model.ports.push(P);
      P.ships = pd.ships.map(function (s) { return addStatic(s, P); });
    });
    D.anchored.forEach(function (s) { addStatic(s, null); });
    model.ships.forEach(function (sh) { if (sh.cargo) sh.cargo.forEach(function (c) { cset.list.push(c); }); });
    // ลานหน้าท่า เครน อาคาร ลานตู้
    model.ports.forEach(function (P) {
      buildGround(P);
      var dim = P.d.sts, cols = CRANE_COLS[P.d.id] || CRANE_COLS.def;
      if (dim) P.d.cranes.forEach(function (c, ci) {
        var Q = P.quays[c[0]], s = c[1] / 10;
        model.cranes.push({ P: P, Q: Q, s: s, F: qframe(Q, s), dim: dim, est: !!c[2], osm: c[3], seed: ci * 7919 + P.i * 131 + 7,
          col: hexRGB(cols[(c[0] * 3 + (ci % 7 === 3 ? 1 : 0)) % cols.length]) });
      });
      buildYards(P, cset, rtgC, R);
      P.d.blds.forEach(function (b) { if (lmSkip.osm[b.i]) return; building(bldC, b, model.blds); model.blds[model.blds.length - 1].port = P; });
      P.d.tanks.forEach(function (t) { tank(bldC, t, model.tanks); model.tanks[model.tanks.length - 1].port = P; });
    });
    model.meshes = {
      bld: mesh(bldC, mats.solid, model.bldGroup),
      rtg: mesh(rtgC, mats.steel, model.yardGroup)
    };
    // ตู้: แบ่งก้อนตามตาราง ~800 ม. (ตัดทิ้งนอกจอได้)
    var buckets = {};
    cset.list.forEach(function (c) { var key = Math.floor(c[0] / (800 * c[7])) + ":" + Math.floor(c[1] / (800 * c[7])); (buckets[key] = buckets[key] || []).push(c); });
    model.containerN = cset.list.length;
    Object.keys(buckets).forEach(function (key) { model.yardGroup.add(containerMesh(buckets[key])); });
    // ท่าเทียบ ท่าเรือโดยสาร
    model.piers = buildPiers(pierC);
    model.meshes.pier = mesh(pierC, mats.solid, model.pierGroup);
    setupMovers();
    model.terms = buildTerminals(termC, model.piers, model.routes);
    model.meshes.term = mesh(termC, mats.solid, model.pierGroup);
    // กองเรือ: ความจุ = เรือนิ่ง + เรือจำลอง + เผื่อเรือจริง AIS
    var need = SHIP_DEFS.map(function () { return 0; });
    model.ships.forEach(function (s) { need[s.cls]++; });
    model.movers.forEach(function (m) { need[m.cls]++; if (m.barges) need[CLS.barge] += m.barges; if (m.tugs) need[CLS.tug] += m.tugs; });
    model.fleets = SHIP_DEFS.map(function (d, i) {
      var small = i >= CLS.tug;
      return new Fleet(d, need[i] + 60, small ? model.moveGroup : model.shipGroup);
    });
    model.small = [CLS.tug, CLS.barge, CLS.express, CLS.canal, CLS.ferry, CLS.shuttle];
    model.wakes = new WakeSet(model.movers.length + 80, model.moveGroup);
    writeStaticShips();
    buildCranes();
    group.updateMatrixWorld(true);
    H.scene().add(group);
    themeMaterials(H.theme());
    model.buildMs = Math.round(performance.now() - t0);
    H.ready();
  }
  // เรือประกอบฉาก (จอด/ทอดสมอ) — ซ่อนในพื้นที่ที่มีเรือจริงจาก AIS
  function writeStaticShips() {
    var cnt = model.fleets.map(function () { return 0; });
    model.ships.forEach(function (sh) {
      var F = model.fleets[sh.cls], def = SHIP_DEFS[sh.cls], off = regionLive(sh.reg);
      sh.slot = cnt[sh.cls]++;
      sh.hidden = off;
      F.put(sh.slot, sh.x, sh.y, sh.h, off ? 0 : sh.L / def.Lr * sh.k, sh.col);
    });
    model.fleets.forEach(function (F, i) { F.nStatic = cnt[i]; F.commit(cnt[i]); });
  }

  /* เครนหน้าท่า: บูมลดเมื่อมีเรือจอดตรงหน้า ไม่งั้นยกบูม — สร้างเรขาใหม่ทุกครั้งที่ชุดเรือจอดเปลี่ยน
     (โหมดเรือจริง = เรือ AIS ที่หยุดนิ่งชิดหน้าท่า · ไม่มีเรือจริง = เรือประกอบฉาก) */
  function berthed() {
    var out = model.ships.filter(function (sh) { return sh.qi >= 0 && !sh.hidden; });
    if (aisOn) Object.keys(live.S).forEach(function (id) {
      var S = live.S[id];
      if (S.fix && S.fix.sog < 1 && S.cls <= CLS.cruise) out.push({ x: S.fix.x, y: S.fix.y, L: S.L, cls: S.cls, live: S });
    });
    return out;
  }
  function buildCranes() {
    var ships = berthed(), sig = "";
    model.cranes.forEach(function (c) {
      var Q = c.Q, found = null;
      ships.forEach(function (sh) {
        var dx = sh.x - Q.a.x, dy = sh.y - Q.a.y;
        var along = (dx * Q.u.x + dy * Q.u.y) / Q.k, off = (dx * Q.w.x + dy * Q.w.y) / Q.k;   // off = ห่างขอบท่าไปทางน้ำ
        if (off > -5 && off < 70 && Math.abs(along - c.s) < sh.L / 2 - 4) found = sh;
      });
      c.ship = found;
      sig += found ? "1" : "0";
    });
    if (sig === model.craneSig) return;
    model.craneSig = sig;
    var C = new CB(), lights = { p: [], c: [] }, hang = [];
    model.cranes.forEach(function (c) {
      var R = rng(c.seed), Q = c.Q, ship = c.ship;
      var work = ship && R() < 0.6 ? { z: shipDims(ship.cls, ship.L).deck + 6 * CT.h + 4 } : null;
      c.i0 = C.n(); c.info = stsCrane(C, c.F, c.dim, c.col, !ship, work, lights); c.i1 = C.n();
      c.busy = !!ship; c.work = !!work;
      if (work && work.a != null) hang.push([c.F.x(work.a, 0), c.F.y(work.a, 0), Math.atan2(Q.u.y, Q.u.x), CT.l40, 1, Math.floor(R() * 16), R() * 997, Q.k, work.z - CT.h - 0.3]);
    });
    [model.meshes.crane, model.lights, model.hang].forEach(function (o) { if (o) { o.parent.remove(o); o.geometry.dispose(); } });
    model.meshes.crane = mesh(C, mats.steel, model.bldGroup);
    model.hang = hang.length ? containerMesh(hang) : null;
    if (model.hang) model.bldGroup.add(model.hang);
    model.lights = null;
    if (lights.p.length) {                                   // ไฟ (ธีมมืด/พลบค่ำ)
      var lg = new T.BufferGeometry();
      lg.setAttribute("position", new T.Float32BufferAttribute(lights.p, 3));
      lg.setAttribute("color", new T.Float32BufferAttribute(lights.c, 3));
      model.lights = new T.Points(lg, mats.lights);
      model.lights.renderOrder = 7;
      model.lights.frustumCulled = false;
      model.lights.visible = H.theme() !== "light";
      model.bldGroup.add(model.lights);
    }
    if (selHit && selHit.type === "crane") refreshCard();
    H.repaint();
  }
  /* โหมดเรือจริงแยกรายพื้นที่: กรุงเทพฯ-เจ้าพระยา (bkk) กับแหลมฉบัง-ศรีราชา (lcb)
     พื้นที่ไหนรับสัญญาณเรือจริงได้ → ซ่อนเรือประกอบฉาก/เรือสินค้าจำลองของพื้นที่นั้น · พื้นที่ที่ยังไม่มีสัญญาณยังใช้เรือจำลอง */
  function regionOfLat(lat) { return lat < 13.35 ? "lcb" : "bkk"; }
  function liveOK() { return aisOn && live.ok > 0 && !live.err; }
  function regionLive(r) { return liveOK() && live.reg && live.reg[r] > 0; }
  function liveActive() { return liveOK() && live.n > 0; }
  function refreshLiveMode() {
    if (!model) return;
    var key = regionLive("bkk") + ":" + regionLive("lcb");
    if (key !== model.liveMode) { model.liveMode = key; writeStaticShips(); }
    buildCranes();
    if (!liveOK() && selHit && selHit.type === "live") closeCard();
    if (selHit && selHit.type === "ship" && selHit.sh.hidden) closeCard();
    if (selHit && selHit.type === "mover" && selHit.m.type !== "route" && regionLive(selHit.m.reg)) closeCard();
  }

  /* ต่อเฟรม: เรือจำลอง + เรือจริง → กองเรือ */
  function updateBoats(dt, z) {
    var slots = model.fleets.map(function (F) { return F.nStatic; }), cargo = [], onScreen = 0;
    var cv = map.getCanvas(); model.cw = cv.clientWidth; model.ch = cv.clientHeight;
    var smallOn = z >= BOAT_ZOOM;
    var real = { bkk: regionLive("bkk"), lcb: regionLive("lcb") };
    if (boatsOn) model.movers.forEach(function (m) {
      var small = m.type === "route";
      if (small && !smallOn) return;
      if (!small && real[m.reg]) return;              // พื้นที่นี้มีเรือจริงแล้ว → ไม่ต้องมีเรือสินค้าจำลอง
      stepMover(m, dt);
      if (placeMover(m, dt, slots, cargo)) onScreen++;
    });
    if (aisOn) onScreen += placeLive(dt, slots, cargo);
    model.fleets.forEach(function (F, i) { F.commit(slots[i]); });
    model.wakes.commit();
    if (cargo.length > model.cargoCap) cargo.length = model.cargoCap;
    if (cargo.length) writeContainers(model.cargoDyn, cargo, 0);
    model.cargoDyn.count = cargo.length;
    return onScreen;
  }
  /* ------------------------------------------------------ เรือจริง (AIS) */
  var live = { S: {}, n: 0, ok: 0, err: null, busy: false, timer: null, src: "", good: 0, lastCard: 0 };
  var KN = 0.514444;
  function apiList() {
    var h = location.hostname, local = h === "localhost" || h === "127.0.0.1" || h === "ratthai-kaona.vercel.app";
    return local ? ["/api/ships", REMOTE_API] : [REMOTE_API];
  }
  function fetchJSON(url) {
    var ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
    return fetch(url, { signal: ctl ? ctl.signal : undefined, cache: "no-store" }).then(function (r) {
      clearTimeout(to);
      return r.json().then(function (j) { if (!r.ok && !(j && j.error)) throw new Error("HTTP " + r.status); return j; });
    }, function (e) { clearTimeout(to); throw e; });
  }
  function pollAIS() {
    if (!aisOn || !visible || !model || live.busy || document.visibilityState === "hidden") return;
    live.busy = true;
    var urls = apiList(), order = urls.slice(live.good).concat(urls.slice(0, live.good));
    var tryAt = function (i, lastErr) {
      if (i >= order.length) { live.busy = false; live.err = lastErr || "โหลดข้อมูลเรือไม่สำเร็จ"; setChipState("ready"); refreshLiveMode(); refreshCard(); return; }
      fetchJSON(order[i]).then(function (j) {
        if (!j || j.ok === false) throw new Error(j && j.error === "no-key" ? "no-key" : (j && j.error) || "bad data");
        live.good = urls.indexOf(order[i]);
        live.busy = false; live.err = null; live.ok = Date.now();
        ingestAIS(j);
      }).catch(function (e) { tryAt(i + 1, e && e.message === "no-key" ? "no-key" : lastErr || (e && e.message)); });
    };
    tryAt(0, null);
  }
  function startAIS() { if (live.timer) return; pollAIS(); live.timer = setInterval(pollAIS, AIS_POLL_MS); }
  function stopAIS() { if (live.timer) { clearInterval(live.timer); live.timer = null; } }
  // ชนิดเรือตามรหัส AIS (ITU-R M.1371) → แบบเรือในฉาก
  var BOX_LINES = /MAERSK|MSC |EVER |CMA CGM|COSCO|ONE |HMM |YM |WAN HAI|OOCL|APL |ZIM |HAPAG|SITC|KMTC|INTERASIA|TS |SINOKOR|HEUNG-A|KOTA |X-PRESS|SAMUDERA|GSL |CONTAINER|BOX|CNC /i;
  function aisClass(type, L, B, name) {
    type = type || 0;
    // ยังไม่ได้ข้อมูลชนิดเรือ (ส่งมาทุก ~6 นาที) → เดาจากชื่อ: TB/TUG/TARUA = เรือลากจูง · ชื่อสายเรือตู้ = เรือตู้ · นอกนั้นเรือสินค้าทั่วไป
    if (!type) {
      if (/^(TB|TUG|TARUA)\b|\bTUG\b/i.test(name || "")) return CLS.tug;
      if (BOX_LINES.test(name || "")) return CLS.container;
      return L && L < 30 ? CLS.ferry : CLS.general;
    }
    if (type >= 80 && type < 90) return CLS.tanker;
    if (type >= 60 && type < 70) return L > 150 ? CLS.cruise : CLS.shuttle;
    if (type === 52 || type === 31 || type === 32 || type === 50 || type === 53) return CLS.tug;
    if (type >= 40 && type < 50) return CLS.shuttle;
    if (type === 30 || type === 36 || type === 37) return CLS.ferry;
    if (type >= 70 && type < 80) return L >= 240 || BOX_LINES.test(name || "") ? CLS.container : L > 170 && B > 27 ? CLS.bulk : CLS.general;
    if (L >= 100) return CLS.general;
    if (L >= 30) return CLS.tug;
    return CLS.ferry;
  }
  var AIS_TYPE = function (t) {
    if (!t) return "ไม่ระบุ";
    if (t >= 70 && t < 80) return "เรือสินค้า";
    if (t >= 80 && t < 90) return "เรือบรรทุกของเหลว (น้ำมัน/ก๊าซ/เคมี)";
    if (t >= 60 && t < 70) return "เรือโดยสาร";
    if (t >= 40 && t < 50) return "เรือความเร็วสูง";
    return { 30: "เรือประมง", 31: "เรือลากจูง", 32: "เรือลากจูง (ขนาดใหญ่)", 33: "เรือขุดลอก", 35: "เรือราชการ/ทหาร", 36: "เรือใบ", 37: "เรือสำราญส่วนตัว", 50: "เรือนำร่อง", 51: "เรือค้นหาและกู้ภัย", 52: "เรือลากจูง", 53: "เรือบริการท่าเรือ", 55: "เรือเจ้าหน้าที่" }[t] || "อื่น ๆ (รหัส " + t + ")";
  };
  var NAV = ["กำลังเดินเรือด้วยเครื่องยนต์", "ทอดสมอ", "ไม่อยู่ในการบังคับ", "บังคับเรือได้จำกัด", "ถูกจำกัดด้วยกินน้ำลึก", "จอดเทียบท่า", "เกยตื้น", "กำลังทำประมง", "แล่นใบ"];
  // j.ships = [[mmsi, ชื่อ, lat, lon, sog, cog, hdg, type, ยาว, กว้าง, สถานะ, อายุข้อมูล(วินาที), ปลายทาง]]
  function ingestAIS(j) {
    var now = Date.now(), seen = {};
    live.src = j.src || "aisstream.io";
    (j.ships || []).forEach(function (a) {
      var id = String(a[0]);
      if (a[2] == null || a[3] == null) return;
      seen[id] = 1;
      var p = H.toLocal(a[3], a[2]), k = H.kAt(a[2]);
      var S = live.S[id] || (live.S[id] = { id: id, disp: null });
      var L = a[8] || 0, B = a[9] || 0;
      S.name = (a[1] || "").trim(); S.type = a[7]; S.dest = a[12] || "";
      S.cls = aisClass(a[7], L, B, S.name);
      var def = SHIP_DEFS[S.cls];
      // ไม่รู้ความยาว → ค่ากลางตามพื้นที่ (แม่น้ำเจ้าพระยารับเรือได้ไม่เกิน ~172 ม.)
      var river = regionOfLat(a[2]) === "bkk";
      S.L = S.cls >= CLS.tug && S.cls !== CLS.tug ? def.Lr : Math.max(S.cls === CLS.tug ? 18 : 40, Math.min(400, L ||
        (S.cls === CLS.container ? (river ? 160 : 280) : S.cls === CLS.tug ? 28 : river ? 95 : 170)));
      S.realL = L; S.realB = B; S.nav = a[10];
      S.fix = { t: now - (a[11] || 0) * 1000, x: p.x, y: p.y, k: k, lat: a[2], lon: a[3], sog: a[4] || 0, cog: a[5], hdg: a[6] };
      snapToBerth(S);
      S.seen = now;
      if (!S.disp) S.disp = { x: S.fix.x, y: S.fix.y, h: S.fix.snapH != null ? S.fix.snapH : ((a[6] != null && a[6] < 360 ? a[6] : a[5] || 0) * Math.PI / 180) };
    });
    Object.keys(live.S).forEach(function (id) { if (!seen[id] && now - live.S[id].seen > 10 * 60000) { removeLabel(live.S[id]); delete live.S[id]; } });
    live.n = Object.keys(live.S).length;
    live.reg = { bkk: 0, lcb: 0 };
    Object.keys(live.S).forEach(function (id) { var f = live.S[id].fix; if (f) live.reg[regionOfLat(f.lat)]++; });
    refreshLiveMode();
    setChipState("ready");
    H.repaint();
    if (selHit && selHit.type === "live") refreshCard();
  }
  /* เรือจริงที่จอดนิ่งใกล้หน้าท่า: ตำแหน่ง GPS บนเรือ (มักอยู่ที่สะพานเดินเรือ) + แนวขอบน้ำใน OSM คลาดกันได้หลายสิบเมตร
     → ถ้าอยู่ในช่วงหน้าท่าและห่างขอบไม่เกิน −60…+45 ม. ให้ชิดขอบท่าฝั่งน้ำ หันขนานแนวท่า (ไม่งั้นเรือไปจอดบนลานตู้) */
  function snapToBerth(S) {
    var f = S.fix;
    S.snap = null;
    if (!model || f.sog >= 1 || S.cls > CLS.cruise) return;
    var best = null, B = shipDims(S.cls, S.L).B;
    model.ports.forEach(function (P) {
      P.quays.forEach(function (Q) {
        var dx = f.x - Q.a.x, dy = f.y - Q.a.y, along = (dx * Q.u.x + dy * Q.u.y) / Q.k, off = (dx * Q.w.x + dy * Q.w.y) / Q.k;
        if (along < 0 || along > Q.len || off < -60 || off > 45) return;
        if (!best || Math.abs(off) < Math.abs(best.off)) best = { P: P, Q: Q, along: along, off: off };
      });
    });
    if (!best) return;
    var Q = best.Q, s = Math.max(S.L / 2, Math.min(Q.len - S.L / 2, best.along)), pt = qpt(Q, s, B / 2 + 3);
    var hq = Math.atan2(Q.u.x, Q.u.y), rep = f.hdg != null && f.hdg < 360 ? f.hdg : f.cog != null && f.cog < 360 ? f.cog : null;
    if (rep != null && Math.cos(rep * Math.PI / 180 - hq) < 0) hq += Math.PI;      // หันหัวตามทิศที่เรือแจ้ง
    f.x = pt.x; f.y = pt.y; f.snapH = hq;
    S.snap = { P: best.P, Q: Q, shift: Math.round(best.off - (B / 2 + 3)) };
    if (S.disp) { S.disp.x = f.x; S.disp.y = f.y; }
  }
  function hiddenByLive(x, y) {
    if (!aisOn || !live.n) return false;
    for (var id in live.S) { var d = live.S[id].disp; if (d && Math.hypot(d.x - x, d.y - y) < 90 * (live.S[id].fix.k || 1)) return true; }
    return false;
  }
  function placeLive(dt, slots, cargoOut) {
    var now = Date.now(), onScreen = 0, a = 1 - Math.exp(-dt / 0.8);
    Object.keys(live.S).forEach(function (id) {
      var S = live.S[id], f = S.fix, d = S.disp;
      var age = Math.max(0, Math.min(90, (now - f.t) / 1000));
      var crs = (f.cog != null && f.cog < 360 ? f.cog : f.hdg || 0) * Math.PI / 180;
      var mv = f.sog > 0.3 ? f.sog * KN * age : 0;
      var px = f.x + Math.sin(crs) * mv * f.k, py = f.y + Math.cos(crs) * mv * f.k;
      if (Math.hypot(px - d.x, py - d.y) > 3000 * f.k) { d.x = px; d.y = py; }
      d.x += (px - d.x) * a; d.y += (py - d.y) * a;
      var hd = f.snapH != null ? f.snapH : (f.hdg != null && f.hdg < 360 ? f.hdg : f.cog != null && f.cog < 360 ? f.cog : d.h * 180 / Math.PI) * Math.PI / 180;
      d.h = angLerp(d.h, hd, a);
      var def = SHIP_DEFS[S.cls], sc = S.L / def.Lr;
      model.fleets[S.cls].put(slots[S.cls]++, d.x, d.y, d.h, sc * f.k, S.cls >= CLS.express ? "#e8eef4" : "#b8c2cc");
      if (f.sog > 1) model.wakes.put(d.x - Math.sin(d.h) * S.L / 2 * f.k, d.y - Math.cos(d.h) * S.L / 2 * f.k, d.h, def.Br * sc * (2 + f.sog * 0.2) * f.k, (S.L * 0.8 + f.sog * 8) * f.k);
      S.x = d.x; S.y = d.y; S.k = f.k;
      // เรือตู้จริง: วางตู้บนดาดฟ้า (ภาพประกอบ — AIS ไม่บอกว่าบรรทุกกี่ตู้) สุ่มคงที่ตาม MMSI
      if (S.cls === CLS.container) {
        if (!S.cargo || S.cargoL !== S.L) { S.cargo = []; S.cargoL = S.L; shipCargo({ cls: S.cls, L: S.L, x: 0, y: 0, h: 0, k: 1 }, rng(+S.id || 1), S.cargo); }
        var sn = Math.sin(d.h), cs = Math.cos(d.h), ang = Math.PI / 2 - d.h;
        S.cargo.forEach(function (c) { cargoOut.push([d.x + (cs * c[0] + sn * c[1]) * f.k, d.y + (-sn * c[0] + cs * c[1]) * f.k, ang, c[3], c[4], c[5], c[6], f.k, c[8]]); });
      }
      var sp = H.project(d.x, d.y, 0);
      if (sp && sp.x > -300 && sp.y > -300 && sp.x < model.cw + 300 && sp.y < model.ch + 300) onScreen++;
    });
    if (now - live.lastCard > 1500 && selHit && selHit.type === "live") { live.lastCard = now; refreshCard(); }
    return onScreen;
  }

  /* ------------------------------------------------------ ป้ายชื่อ (HTML) */
  var labels = { el: null, terms: {}, t: 0 };
  function labelLayer() {
    if (labels.el && labels.el.isConnected) return labels.el;
    var el = document.createElement("div");
    el.className = "prt-labels";
    map.getContainer().appendChild(el);
    labels.el = el;
    el.addEventListener("click", function (e) {
      var t = e.target.closest(".prt-lbl");
      if (!t) return;
      e.stopPropagation();
      var hit = null;
      if (t.dataset.term != null) hit = { type: "term", T: model.terms[+t.dataset.term] };
      else if (t.dataset.mmsi && live.S[t.dataset.mmsi]) hit = { type: "live", S: live.S[t.dataset.mmsi] };
      if (hit) { setSelected(hit); showCard(hit); }
    });
    return el;
  }
  function removeLabel(o) { if (o && o.el) { o.el.remove(); o.el = null; } }
  function placeLabels(z) {
    var lay = labelLayer(), W = model.cw, Hh = model.ch;
    lay.style.display = visible ? "" : "none";
    if (!visible) return;
    // ท่าเรือโดยสาร — เฉพาะที่อยู่ในจอ (ไม่เกิน 45 ป้าย ใกล้กลางจอก่อน)
    var showT = z >= LABEL_ZOOM, cand = [];
    model.terms.forEach(function (T2, i) {
      var s = showT ? H.project(T2.p.x, T2.p.y, 5 * T2.k) : null;
      if (s && s.x > -20 && s.x < W + 20 && s.y > -10 && s.y < Hh + 10) cand.push({ i: i, s: s, d: Math.hypot(s.x - W / 2, s.y - Hh / 2) });
      else if (T2.el) T2.el.style.display = "none";
    });
    cand.sort(function (a, b) { return a.d - b.d; });
    cand.forEach(function (c, n) {
      var T2 = model.terms[c.i];
      if (n >= 45) { if (T2.el) T2.el.style.display = "none"; return; }
      if (!T2.el) {
        T2.el = document.createElement("div");
        T2.el.className = "prt-lbl prt-term";
        T2.el.dataset.term = c.i;
        var dots = (T2.t.l || "").split("").map(function (l) { return '<i style="background:' + (LINE_COL[l] || "#999") + '"></i>'; }).join("");
        T2.el.innerHTML = '<b>' + esc(T2.t.n || T2.t.e || "ท่าเรือ") + (T2.t.r ? ' <small>' + esc(T2.t.r) + '</small>' : '') + '</b>' + (dots ? '<span class="prt-dots">' + dots + '</span>' : '');
        lay.appendChild(T2.el);
      }
      T2.el.style.display = "";
      T2.el.classList.toggle("sel", !!(selHit && selHit.type === "term" && selHit.T === T2));
      T2.el.style.transform = "translate(" + Math.round(c.s.x) + "px," + Math.round(c.s.y) + "px)";
    });
    // เรือจริง
    var showL = aisOn && z >= AIS_LABEL_ZOOM;
    Object.keys(live.S).forEach(function (id) {
      var S = live.S[id];
      var s = showL && S.x != null ? H.project(S.x, S.y, shipDims(S.cls, S.L).H * S.k) : null;
      var on = s && s.x > -40 && s.x < W + 40 && s.y > -20 && s.y < Hh + 20;
      if (!on) { if (S.el) S.el.style.display = "none"; return; }
      if (!S.el) { S.el = document.createElement("div"); S.el.className = "prt-lbl prt-ais"; S.el.dataset.mmsi = id; lay.appendChild(S.el); }
      var txt = '<b>' + esc(S.name || "MMSI " + id) + '</b><span>' + fmt(S.fix.sog, 1) + ' นอต</span>';
      if (S.el._t !== txt) { S.el.innerHTML = txt; S.el._t = txt; }
      S.el.style.display = "";
      S.el.classList.toggle("sel", !!(selHit && selHit.type === "live" && selHit.S === S));
      S.el.style.transform = "translate(" + Math.round(s.x) + "px," + Math.round(s.y) + "px)";
    });
  }
  function hideLabels() { if (labels.el) labels.el.style.display = "none"; }
  /* ------------------------------------------------------ คลิก/ชี้ */
  // เรย์ชนกล่องในกรอบ F (ขอบเขตหน่วยเมตร) → ระยะในฉาก หรือ null
  function hitBox(ray, F, a0, a1, b0, b1, z0, z1) {
    var k = F.k, ox = ray.origin.x - F.o.x, oy = ray.origin.y - F.o.y, dx = ray.direction.x, dy = ray.direction.y;
    var o = [ox * F.ex.x + oy * F.ex.y, ox * F.ey.x + oy * F.ey.y, ray.origin.z];
    var d = [dx * F.ex.x + dy * F.ex.y, dx * F.ey.x + dy * F.ey.y, ray.direction.z];
    var lo = [a0 * k, b0 * k, z0 * k], hi = [a1 * k, b1 * k, z1 * k], tmin = 0, tmax = Infinity;
    for (var i = 0; i < 3; i++) {
      if (Math.abs(d[i]) < 1e-12) { if (o[i] < lo[i] || o[i] > hi[i]) return null; continue; }
      var t1 = (lo[i] - o[i]) / d[i], t2 = (hi[i] - o[i]) / d[i];
      if (t1 > t2) { var tt = t1; t1 = t2; t2 = tt; }
      tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
    return tmin;
  }
  function shipFrame(x, y, h, k) { return new Frame({ x: x, y: y }, { x: Math.cos(h), y: -Math.sin(h) }, { x: Math.sin(h), y: Math.cos(h) }, k); }
  var _va, _vb, _vc, _vh;
  function triRange(m, i0, i1, ray, best) {
    if (!m || i1 <= i0) return best;
    var pos = m.geometry.attributes.position.array, idx = m.geometry.index.array;
    for (var i = i0; i < i1; i += 3) {
      var a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
      _va.set(pos[a], pos[a + 1], pos[a + 2]); _vb.set(pos[b], pos[b + 1], pos[b + 2]); _vc.set(pos[c], pos[c + 1], pos[c + 2]);
      if (ray.intersectTriangle(_va, _vb, _vc, false, _vh)) { var d = _vh.distanceTo(ray.origin); if (d < best) best = d; }
    }
    return best;
  }
  function inPoly(p, P) {
    var c = false;
    for (var i = 0, j = P.length - 1; i < P.length; j = i++) {
      var a = P[i], b = P[j];
      if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) c = !c;
    }
    return c;
  }
  function yardCell(Yd, p) {
    var F = Yd.F, k = Yd.k, ox = (p.x - F.o.x) / k, oy = (p.y - F.o.y) / k;
    var a = ox * F.ex.x + oy * F.ex.y, b = ox * F.ey.x + oy * F.ey.y, G = D.grid;
    if (a < 0 || b < 0 || a > Yd.len) return false;
    var blk = Math.floor(b / Yd.pitch), w = b - blk * Yd.pitch;
    if (w > G.rows * G.rowW + 3) return false;
    var ri = blk * G.rows + Math.min(G.rows - 1, Math.floor(w / G.rowW)), row = Yd.Y.rows[ri];
    if (!row) return false;
    var q = Math.floor(a / G.bay);
    return (row[q] && row[q] !== ".") || (row[q - 1] && row[q - 1] !== ".") || (row[q + 1] && row[q + 1] !== ".");
  }
  function pick(ray) {
    if (!model) return null;
    if (!_va) { _va = new T.Vector3(); _vb = new T.Vector3(); _vc = new T.Vector3(); _vh = new T.Vector3(); }
    var best = null, bestD = Infinity, z = map.getZoom();
    function take(d, hit) { if (d != null && d < bestD) { bestD = d; best = hit; } }
    function shipHit(x, y, h, k, cls, L, hit) {
      var dm = shipDims(cls, L);
      take(hitBox(ray, shipFrame(x, y, h, k), -dm.B / 2 - 1, dm.B / 2 + 1, -L / 2 - 1, L / 2 + 1, 0, dm.H + 1), hit);
    }
    // เรือ
    model.ships.forEach(function (sh) { if (!sh.hidden) shipHit(sh.x, sh.y, sh.h, sh.k, sh.cls, sh.L, { type: "ship", sh: sh }); });
    if (boatsOn) model.movers.forEach(function (m) {
      if (m.x == null || (m.type === "route" && z < BOAT_ZOOM)) return;
      shipHit(m.x, m.y, m.hd, m.k, m.cls, m.L, { type: "mover", m: m });
    });
    if (aisOn) Object.keys(live.S).forEach(function (id) { var S = live.S[id]; if (S.x != null) shipHit(S.x, S.y, S.disp.h, S.k, S.cls, S.L, { type: "live", S: S }); });
    // เครน อาคาร ถัง
    if (z >= CRANE_ZOOM) {
      model.cranes.forEach(function (c) {
        var sb = c.dim.gauge > 25 ? 8.5 : 7;
        take(hitBox(ray, c.F, c.info.back - 1, Math.max(c.info.tipA, -2) + 2, -sb - 3, sb + 3, 0, c.info.apexZ + 2), { type: "crane", c: c });
      });
      var tmp3 = new T.Vector3();
      model.blds.forEach(function (b) { if (ray.intersectBox(b.box, tmp3)) take(triRange(model.meshes.bld, b.i0, b.i1, ray, Infinity), { type: "bld", b: b }); });
      model.tanks.forEach(function (t) {
        take(hitBox(ray, new Frame(t.p, { x: 1, y: 0 }, { x: 0, y: 1 }, 1), -t.r, t.r, -t.r, t.r, 0, t.h * 1.1), { type: "tank", t: t });
      });
    }
    if (z >= PIER_ZOOM) model.terms.forEach(function (T2) { take(hitBox(ray, T2.F, -T2.hl - 1, T2.hl + 1, -T2.hw - 1, T2.hw + 1, 0, 4.6), { type: "term", T: T2 }); });
    // พื้น: จุดที่เรย์ตัดระนาบ z = 0
    if (ray.direction.z < -1e-6) {
      var t = -ray.origin.z / ray.direction.z, p = { x: ray.origin.x + ray.direction.x * t, y: ray.origin.y + ray.direction.y * t };
      var dG = t + 0.5, g = null;
      if (z >= YARD_ZOOM) model.ports.forEach(function (P) { if (!g) P.yards.forEach(function (Yd) { if (!g && yardCell(Yd, p)) g = { type: "yard", Yd: Yd, P: P }; }); });
      if (!g) model.ports.forEach(function (P) {
        if (g) return;
        P.quays.forEach(function (Q) {
          if (g) return;
          var s = ((p.x - Q.a.x) * Q.u.x + (p.y - Q.a.y) * Q.u.y) / Q.k, w = ((p.x - Q.a.x) * Q.w.x + (p.y - Q.a.y) * Q.w.y) / Q.k;
          if (s >= 0 && s <= Q.len && w <= 0 && w >= -(P.d.apron || 30)) g = { type: "quay", Q: Q, P: P };
        });
      });
      if (!g && z >= PIER_ZOOM) model.piers.forEach(function (pi) {
        if (g) return;
        var m = 4 * pi.k;
        if (p.x < pi.bb.x0 - m || p.x > pi.bb.x1 + m || p.y < pi.bb.y0 - m || p.y > pi.bb.y1 + m) return;
        if (pi.pr.c) { if (inPoly(p, pi.P)) g = { type: "pier", pi: pi }; return; }
        for (var i = 0; i < pi.P.length - 1; i++) if (segDist(p, pi.P[i], pi.P[i + 1]) < (pi.pr.w / 20 + 1.5) * pi.k) { g = { type: "pier", pi: pi }; break; }
      });
      if (!g) model.ports.forEach(function (P) { if (!g && P.rings.some(function (r) { return inPoly(p, r); })) g = { type: "port", P: P }; });
      if (g) { g.px = p.x; g.py = p.y; take(dG, g); }
    }
    return best ? { dist: bestD, hit: best } : null;
  }
  function keyOf(h) {
    if (!h) return null;
    switch (h.type) {
      case "ship": return "s" + model.ships.indexOf(h.sh);
      case "mover": return "m" + model.movers.indexOf(h.m);
      case "live": return "l" + h.S.id;
      case "crane": return "c" + model.cranes.indexOf(h.c);
      case "bld": return "b" + h.b.rec.i;
      case "tank": return "t" + model.tanks.indexOf(h.t);
      case "term": return "T" + model.terms.indexOf(h.T);
      case "yard": return "y" + h.P.i + ":" + h.P.yards.indexOf(h.Yd);
      case "quay": return "q" + h.P.i + ":" + h.P.quays.indexOf(h.Q);
      case "pier": return "p" + h.pi.pr.i;
      case "port": return "P" + h.P.i;
      default: return h.type;
    }
  }
  // กล่องไฮไลต์ในกรอบ F
  function hlBox(F, a0, a1, b0, b1, z0, z1) { var C = new CB(); boxF(C, F, a0, a1, b0, b1, z0, z1, [1, 1, 1]); return toGeo(C); }
  function highlightGeo(h) {
    var C, dm;
    if (h.type === "ship") { dm = shipDims(h.sh.cls, h.sh.L); return hlBox(shipFrame(h.sh.x, h.sh.y, h.sh.h, h.sh.k), -dm.B / 2 - 1.5, dm.B / 2 + 1.5, -h.sh.L / 2 - 2, h.sh.L / 2 + 2, 0, dm.H + 1.5); }
    if (h.type === "crane") { var sb = h.c.dim.gauge > 25 ? 8.5 : 7; return hlBox(h.c.F, h.c.info.back - 1, Math.max(h.c.info.tipA, -2) + 2, -sb - 3, sb + 3, 0, h.c.info.apexZ + 2); }
    if (h.type === "tank") return hlBox(new Frame(h.t.p, { x: 1, y: 0 }, { x: 0, y: 1 }, 1), -h.t.r * 1.05, h.t.r * 1.05, -h.t.r * 1.05, h.t.r * 1.05, 0, h.t.h * 1.12);
    if (h.type === "term") return hlBox(h.T.F, -h.T.hl - 1, h.T.hl + 1, -h.T.hw - 1, h.T.hw + 1, 0, 4.8);
    if (h.type === "yard") { var Yd = h.Yd; return hlBox(Yd.F, -2, Yd.len + 2, -2, Math.ceil(Yd.nb / D.grid.rows) * Yd.pitch, 0, 1.2); }
    if (h.type === "quay") { var Q = h.Q; return hlBox(qframe(Q, 0), -(h.P.d.apron || 30), 0, 0, Q.len, 0, 0.8); }
    if (h.type === "pier") {
      C = new CB();
      if (h.pi.pr.c) fillPoly(C, h.pi.P, 1.8 * h.pi.k, [1, 1, 1]); else ribbon(C, h.pi.P, (h.pi.pr.w / 10 + 3) * h.pi.k, 1.8 * h.pi.k, [1, 1, 1]);
      return toGeo(C);
    }
    if (h.type === "port") { C = new CB(); h.P.rings.forEach(function (r) { if (r.length > 2) fillPoly(C, r, 0.6, [1, 1, 1]); }); return toGeo(C); }
    if (h.type === "bld") {
      var m = model.meshes.bld, pos = m.geometry.attributes.position.array, idx = m.geometry.index.array, P = [];
      for (var i = h.b.i0; i < h.b.i1; i++) { var a = idx[i] * 3; P.push(pos[a], pos[a + 1], pos[a + 2] + 0.2); }
      var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(P, 3)); return g;
    }
    return null;
  }
  function makeHl(h, mat) {
    if (h.type === "mover" || h.type === "live") {
      var x = h.type === "mover" ? h.m.x : h.S.x, y = h.type === "mover" ? h.m.y : h.S.y;
      var dm = shipDims(h.type === "mover" ? h.m.cls : h.S.cls, h.type === "mover" ? h.m.L : h.S.L), k = h.type === "mover" ? h.m.k : h.S.k;
      var r = Math.max(dm.L, 20) * 0.62, C = new CB(), F = new Frame({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, k), n = 40;
      for (var i = 0; i < n; i++) {                                // วงแหวนบนน้ำรอบเรือที่แล่น (ตามเรือทุกเฟรม)
        var a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
        C.quad(C.v(Math.cos(a0) * r * k, Math.sin(a0) * r * k, 0.4), C.v(Math.cos(a1) * r * k, Math.sin(a1) * r * k, 0.4),
          C.v(Math.cos(a1) * r * 1.12 * k, Math.sin(a1) * r * 1.12 * k, 0.4), C.v(Math.cos(a0) * r * 1.12 * k, Math.sin(a0) * r * 1.12 * k, 0.4));
      }
      var mm = new T.Mesh(toGeo(C), mat);
      mm.renderOrder = 8; mm.position.set(x, y, 0); mm.userData.follow = h; mm.frustumCulled = false;
      return mm;
    }
    var g = highlightGeo(h);
    if (!g) return null;
    var m2 = new T.Mesh(g, mat);
    m2.matrixAutoUpdate = false; m2.renderOrder = 8;
    return m2;
  }
  function followHl(m) {
    if (!m || !m.userData.follow) return;
    var h = m.userData.follow, x = h.type === "mover" ? h.m.x : h.S.x, y = h.type === "mover" ? h.m.y : h.S.y;
    if (x != null) { m.position.set(x, y, 0); m.updateMatrix(); m.updateMatrixWorld(true); }
  }
  function setHover(h) {
    var k = keyOf(h);
    if (k === hoverKey) return;
    hoverKey = k;
    if (hoverMesh) { group.remove(hoverMesh); hoverMesh.geometry.dispose(); hoverMesh = null; }
    if (h && k !== selKey) { hoverMesh = makeHl(h, mats.hover); if (hoverMesh) group.add(hoverMesh); }
    H.repaint();
  }
  function setSelected(h) {
    selKey = keyOf(h); selHit = h || null;
    if (selMesh) { group.remove(selMesh); selMesh.geometry.dispose(); selMesh = null; }
    if (hoverMesh) { group.remove(hoverMesh); hoverMesh.geometry.dispose(); hoverMesh = null; hoverKey = null; }
    if (h) { selMesh = makeHl(h, mats.sel); if (selMesh) group.add(selMesh); }
    H.repaint();
  }

  /* --------------------------------------------------------------- UI */
  function setChipState(s) {
    var chip = $("#chipPort3D");
    if (!chip) return;
    var cnt = chip.querySelector(".chip-count");
    if (s === "loading") cnt.textContent = "…";
    else if (s === "error") { cnt.textContent = "!"; chip.title = "โหลดชั้นท่าเรือ 3 มิติไม่สำเร็จ"; }
    else if (s === "ready") cnt.textContent = aisOn && live.ok ? "⚓ " + fmt(live.n) : (D ? fmt(D.ports.length) : "8") + " ท่า";
  }
  function syncButtons() {
    var chip = $("#chipPort3D"), btn = $("#btnPort3DToggle"), bb = $("#btnPortBoats"), ab = $("#btnPortAIS"), gb = $("#btnPortGo");
    if (chip) chip.classList.toggle("active", visible);
    if (btn) btn.classList.toggle("active", visible);
    if (bb) { bb.classList.toggle("active", boatsOn && visible); bb.style.display = visible ? "" : "none"; }
    if (ab) { ab.classList.toggle("active", aisOn && visible); ab.style.display = visible ? "" : "none"; }
    if (gb) gb.style.display = visible ? "" : "none";
  }
  var GO = [
    { id: "KT", n: "ท่าเรือกรุงเทพ (คลองเตย)", c: [100.5795, 13.6985], z: 15.3, b: -35 },
    { id: "LCB", n: "ท่าเรือแหลมฉบัง", c: [100.8905, 13.0625], z: 14.3, b: 25 },
    { id: "SHT", n: "ท่าเรือเอกชน พระประแดง", c: [100.5475, 13.6545], z: 15.4, b: 10 },
    { id: "CEN", n: "ท่าเรือสาทร (เรือด่วนเจ้าพระยา)", c: [100.5143, 13.7189], z: 16.6, b: -20 },
    { id: "TT", n: "ท่าเตียน – วัดอรุณ (เรือข้ามฟาก)", c: [100.4895, 13.7453], z: 16.5, b: 40 },
    { id: "PTN", n: "ท่าเรือประตูน้ำ (คลองแสนแสบ)", c: [100.5417, 13.7493], z: 16.8, b: 0 }
  ];
  function flyGo(g) { map.flyTo({ center: g.c, zoom: g.z, pitch: 60, bearing: g.b, duration: 1800 }); }
  function nearestPort() {
    var c = map.getCenter(), best = null;
    GO.slice(0, 2).forEach(function (g) { var d = Math.hypot(g.c[0] - c.lng, g.c[1] - c.lat); if (!best || d < best.d) best = { g: g, d: d }; });
    return best;
  }
  function setVisible(v) {
    visible = v;
    lsSet(LS_KEY, v ? "1" : "0");
    syncButtons();
    if (group) group.visible = v;
    if (!v) {
      H.show(MOD_ID, false); H.setAnim(MOD_ID, false);
      stopAIS(); hideLabels(); closeCard(); setHover(null); excludeCity(false);
      return;
    }
    if (failed) { failed = false; loading = null; }
    ensureLoaded().then(function () {
      if (!model) return;
      H.show(MOD_ID, true);
      excludeCity(true);
      if (aisOn) startAIS();
      var n = nearestPort();
      // ไม่อยู่ใกล้ท่าเรือใดเลย (หรือซูมออกไกล) → บินไปท่าที่ใกล้สุด
      var nearAny = GO.some(function (g) { var c = map.getCenter(); return Math.hypot(g.c[0] - c.lng, g.c[1] - c.lat) < 0.06; });
      if (n && (!nearAny || map.getZoom() < H.minZoom)) flyGo(n.g);
    });
  }
  function setBoats(on) {
    boatsOn = on; lsSet(LS_BOATS, on ? "1" : "0"); syncButtons();
    if (!on && selHit && selHit.type === "mover") closeCard();
    H.repaint();
  }
  function setAIS(on) {
    aisOn = on; lsSet(LS_AIS, on ? "1" : "0"); syncButtons();
    if (on) startAIS(); else { stopAIS(); if (selHit && selHit.type === "live") closeCard(); Object.keys(live.S).forEach(function (id) { removeLabel(live.S[id]); }); }
    refreshLiveMode();
    setChipState("ready");
    H.repaint();
    if (on) showAISNote();
  }
  var exclOn = null;
  function excludeCity(on) {
    if (!D || on === exclOn) return;
    exclOn = on;
    var ids = [];
    if (on) D.ports.forEach(function (p) { p.blds.forEach(function (b) { ids.push(b.i); }); });
    H.excludeBuildings(MOD_ID, on ? ids : null);
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    var bar = $(".filter-bar");
    if (bar && !$("#chipPort3D")) {
      var chip = document.createElement("button");
      chip.type = "button"; chip.className = "chip"; chip.id = "chipPort3D";
      chip.title = "ท่าเรือคลองเตย แหลมฉบัง ท่าเรือเอกชนริมเจ้าพระยา และท่าเรือโดยสาร แบบ 3 มิติ (กดเพื่อเปิด/ปิด)";
      chip.innerHTML = '<span>' + ico("ship") + ' ท่าเรือ 3 มิติ</span><span class="chip-count">–</span>';
      chip.addEventListener("click", function () { setVisible(!visible); });
      bar.insertBefore(chip, $("#btnThemeToggle") || null);
    }
    var menu = $("#leftMenu");
    if (menu && !$("#btnPort3DToggle")) {
      var mk = function (id, icon, label, title, fn) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "menu-btn"; b.id = id; b.title = title;
        b.innerHTML = '<span>' + ico(icon) + '</span><span class="label-text"> ' + label + '</span>';
        b.addEventListener("click", fn);
        menu.appendChild(b);
        return b;
      };
      mk("btnPort3DToggle", "ship", "ท่าเรือ 3 มิติ", "เปิด/ปิดท่าเรือ 3 มิติ", function () { setVisible(!visible); });
      mk("btnPortBoats", "waves", "เรือจำลอง", "เปิด/ปิดเรือจำลอง: เรือโดยสารตามเส้นทางจริง (เรือด่วน เรือคลอง เรือข้ามฟาก — ไม่มีสัญญาณ AIS) + เรือสินค้าจำลองเมื่อยังไม่มีเรือจริง", function () { setBoats(!boatsOn); });
      mk("btnPortAIS", "anchor", "เรือจริง (AIS)", "เปิด/ปิดตำแหน่งเรือจริงจากสัญญาณ AIS (อัปเดตทุก 20 วินาที)", function () { setAIS(!aisOn); });
      var go = mk("btnPortGo", "map-pin", "ไปท่าเรือ", "บินไปดูท่าเรือ", function (e) {
        e.stopPropagation();
        var dd = $("#prtGoMenu");
        if (dd) { dd.remove(); return; }
        dd = document.createElement("div");
        dd.id = "prtGoMenu";
        dd.innerHTML = GO.map(function (g, i) { return '<button type="button" data-i="' + i + '">' + ico(i < 3 ? "ship" : "waves") + ' ' + esc(g.n) + '</button>'; }).join("");
        var r = go.getBoundingClientRect(), sr = ($(".stage") || document.body).getBoundingClientRect();
        dd.style.left = (r.left - sr.left) + "px"; dd.style.top = (r.bottom - sr.top + 6) + "px";
        ($(".stage") || document.body).appendChild(dd);
        dd.addEventListener("click", function (ev) { var b = ev.target.closest("button"); if (b) { flyGo(GO[+b.dataset.i]); dd.remove(); } });
        setTimeout(function () { document.addEventListener("click", function off() { var x = $("#prtGoMenu"); if (x) x.remove(); document.removeEventListener("click", off); }); }, 0);
      });
    }
    if (!$("#prtCard")) {
      var card = document.createElement("div");
      card.id = "prtCard";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-label", "ข้อมูลท่าเรือ");
      ($(".stage") || document.body).appendChild(card);
      var st = document.createElement("style");
      st.textContent = "#prtCard{position:absolute;right:14px;top:14px;width:340px;max-width:calc(100% - 28px);max-height:calc(100% - 28px);overflow:auto;z-index:40;" +
        "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.28);" +
        "backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:var(--text-main);font-size:12.5px;line-height:1.5;display:none}" +
        "#prtCard.open{display:block;animation:elvIn .22s ease}" +
        ".prt-sw{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px;border:1px solid rgba(0,0,0,.15)}" +
        ".prt-live{display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;margin-right:4px;box-shadow:0 0 0 3px rgba(34,197,94,.25);animation:prtPulse 1.6s infinite}" +
        "@keyframes prtPulse{50%{box-shadow:0 0 0 6px rgba(34,197,94,0)}}" +
        ".prt-warn{margin:10px 0 0;padding:8px 10px;border-radius:9px;background:rgba(234,179,8,.12);border:1px solid rgba(234,179,8,.35);font-size:11px;line-height:1.55}" +
        ".prt-warn code{font-size:10.5px;background:rgba(0,0,0,.15);padding:1px 4px;border-radius:4px}" +
        ".prt-labels{position:absolute;inset:0;pointer-events:none;z-index:3;overflow:hidden}" +
        ".prt-lbl{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;padding:2px 7px 3px;border-radius:7px;white-space:nowrap;" +
        "background:rgba(8,14,24,.74);border:1px solid rgba(0,229,255,.34);color:#e8f6ff;font:600 10.5px/1.25 system-ui,sans-serif;" +
        "backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);will-change:transform;transform-origin:0 0}" +
        ".prt-term{margin:-30px 0 0 -40px}.prt-term small{opacity:.7;font-weight:700}" +
        ".prt-dots{display:flex;gap:3px;margin-top:2px}.prt-dots i{display:block;width:12px;height:4px;border-radius:2px}" +
        ".prt-ais{margin:-34px 0 0 10px;border-color:rgba(34,197,94,.5)}.prt-ais b{display:block;font-size:11px}.prt-ais span{opacity:.75;font-size:9.5px}" +
        ".prt-lbl.sel{border-color:#00E5FF;box-shadow:0 0 0 2px rgba(0,229,255,.35)}" +
        "html[data-theme=light] .prt-lbl,html[data-theme=sunset] .prt-lbl{background:rgba(255,255,255,.92);color:#10202c;border-color:rgba(4,120,143,.45)}" +
        "#prtGoMenu{position:absolute;z-index:45;min-width:230px;padding:6px;border-radius:12px;background:var(--card-bg);border:1px solid var(--card-border);" +
        "box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}" +
        "#prtGoMenu button{display:flex;align-items:center;gap:7px;width:100%;padding:7px 9px;border:0;border-radius:8px;background:none;color:var(--text-main);font:inherit;font-size:12.5px;text-align:left;cursor:pointer}" +
        "#prtGoMenu button:hover{background:var(--accent-soft)}";
      document.head.appendChild(st);
    }
    syncButtons();
  }

  /* ----------------------------------------------------------- การ์ดข้อมูล */
  function head(type, icon, name, sub) {
    return '<div class="elv-head"><div class="elv-type">' + ico(icon) + ' ' + type + '</div><h3 class="elv-name">' + name + '</h3>' +
      (sub ? '<p class="elv-sub">' + sub + '</p>' : '') + '<button type="button" class="elv-x" aria-label="ปิด">×</button></div>';
  }
  function cell(k, v, u) { return '<div class="elv-cell"><div class="elv-k">' + k + '</div><div class="elv-v">' + v + (u ? '<small>' + u + '</small>' : '') + '</div></div>'; }
  function row(k, v) { return '<div class="elv-row"><b>' + k + '</b><span>' + v + '</span></div>'; }
  function flyBtn(extra) { return '<div class="elv-actions"><button type="button" class="elv-btn primary" data-act="fly">' + ico("map-pin") + ' บินไปดู</button>' + (extra || "") + '</div>'; }
  function osmBtn(type, id) { return id ? '<a class="elv-btn" href="https://www.openstreetmap.org/' + type + '/' + id + '" target="_blank" rel="noopener">' + ico("map") + ' ดูใน OSM</a>' : ""; }
  function portName(P) { return P ? P.d.name : "นอกเขตท่าเรือ"; }
  var QKIND = { container: "ท่าเทียบเรือตู้สินค้า", general: "ท่าเทียบเรือสินค้าทั่วไป", liquid: "ท่าเทียบเรือสินค้าเหลว (ก๊าซ/น้ำมัน)" };
  function nearestTerm(x, y) {
    var best = null;
    model.terms.forEach(function (T2) { var d = Math.hypot(T2.p.x - x, T2.p.y - y) / T2.k; if (!best || d < best.d) best = { T: T2, d: d }; });
    return best;
  }
  function showAISNote() {
    if (!selHit) { showCard({ type: "aisinfo" }); }
  }
  function aisStatusHTML() {
    if (live.err === "no-key") return '<div class="prt-warn"><b>ยังไม่ได้ตั้งค่าคีย์ AIS</b><br>ข้อมูลเรือจริงมาจาก aisstream.io (ฟรี) ซึ่งต้องใช้คีย์ส่วนตัว — ' +
      'สมัครที่ aisstream.io แล้วตั้งค่าตัวแปร <code>AISSTREAM_KEY</code> ใน Vercel (หรือไฟล์ <code>~/.aisstream-key</code> สำหรับเซิร์ฟเวอร์ในเครื่อง) · ระหว่างนี้แสดงเรือจำลองแทน</div>';
    if (live.err) return '<div class="prt-warn">โหลดข้อมูลเรือจริงไม่สำเร็จ (' + esc(live.err) + ') — จะลองใหม่ทุก 20 วินาที</div>';
    if (!live.ok) return '<p class="elv-note">กำลังโหลดตำแหน่งเรือจริง…</p>';
    var rg = live.reg || {};
    return row("เรือที่เห็นตอนนี้", fmt(live.n) + " ลำ") +
      row("กรุงเทพฯ – เจ้าพระยา", rg.bkk ? fmt(rg.bkk) + " ลำ · แสดงเฉพาะเรือจริง" : "ยังไม่มีสัญญาณ · ใช้เรือจำลอง") +
      row("แหลมฉบัง – ศรีราชา", rg.lcb ? fmt(rg.lcb) + " ลำ · แสดงเฉพาะเรือจริง" : "ยังไม่มีสัญญาณ · ใช้เรือจำลอง") +
      row("อัปเดตล่าสุด", Math.round((Date.now() - live.ok) / 1000) + " วินาทีที่แล้ว");
  }
  function cardHTML(h) {
    var dm;
    if (h.type === "aisinfo") {
      return head('<span class="prt-live"></span>เรือจริง (AIS)', "anchor", "ตำแหน่งเรือจริงแบบสด", "Automatic Identification System — วิทยุระบุตัวเรือที่เรือสินค้าต้องเปิดตลอด") +
        '<div class="elv-body">' + aisStatusHTML() +
        '<p class="elv-note">เรือขนาดใหญ่ (≥300 ตันกรอส) ส่งตำแหน่ง ความเร็ว และทิศทางทุกไม่กี่วินาที — สถานีรับสัญญาณของ aisstream.io เป็นของอาสาสมัคร จึงอาจเห็นไม่ครบทุกลำ ' +
        '· พื้นที่ไหนรับสัญญาณเรือจริงได้ เรือสินค้าจำลองและเรือจอดประกอบฉากของพื้นที่นั้นจะถูกซ่อน เหลือแต่เรือจริง และเครนหน้าท่าลด/ยกบูมตามเรือจริงที่จอดอยู่ — พื้นที่ที่ยังไม่มีสัญญาณยังเป็นเรือจำลอง ' +
        '· เรือโดยสารในแม่น้ำ/คลองส่วนใหญ่ไม่ได้ส่ง AIS จึงยังเป็นเรือจำลอง (ปิดได้ที่ปุ่ม "เรือจำลอง")</p></div>';
    }
    if (h.type === "live") {
      var S = h.S, f = S.fix, age = Math.max(0, Math.round((Date.now() - f.t) / 1000));
      dm = S.realL ? fmt(S.realL) + " × " + fmt(S.realB || 0) + " ม." : "ไม่ระบุ";
      return head('<span class="prt-live"></span>เรือจริง (AIS)', "ship", esc(S.name || "MMSI " + S.id), esc(AIS_TYPE(S.type))) +
        '<div class="elv-body"><div class="elv-grid">' + cell("ความเร็ว", fmt(f.sog, 1), "นอต · " + fmt(f.sog * 1.852, 1) + " กม./ชม.") + cell("ขนาด (ยาว × กว้าง)", dm) + '</div>' +
        row("สถานะ", S.nav != null && NAV[S.nav] ? NAV[S.nav] : f.sog > 0.5 ? "กำลังแล่น" : "หยุดนิ่ง") +
        row("ทิศทาง", (f.cog != null && f.cog < 360 ? "เส้นทาง " + fmt(f.cog) + "°" : "") + (f.hdg != null && f.hdg < 360 ? " · หัวเรือ " + fmt(f.hdg) + "°" : "")) +
        (S.snap ? row("จอดเทียบท่า", esc(portName(S.snap.P)) + (Math.abs(S.snap.shift) >= 3 ? " · วาดชิดขอบท่า (ตำแหน่ง GPS คลาด " + fmt(Math.abs(S.snap.shift)) + " ม.)" : "")) : "") +
        (S.dest ? row("ปลายทาง", esc(S.dest)) : "") + row("MMSI", esc(S.id)) +
        '<div class="elv-actions"><a class="elv-btn" href="https://www.myshiptracking.com/?mmsi=' + esc(S.id) + '" target="_blank" rel="noopener">' + ico("map") + ' ดูเส้นทาง</a></div>' +
        '<p class="elv-note">ตำแหน่งจริงจากสัญญาณ AIS (' + esc(live.src) + ') ข้อมูลล่าสุดเมื่อ ' + age + ' วินาทีที่แล้ว ระหว่างรอบคำนวณต่อจากความเร็วและทิศ · รูปทรงเรือเลือกตามชนิดที่เรือแจ้ง ไม่ใช่รูปเรือลำนี้จริง</p></div>';
    }
    if (h.type === "ship") {
      var sh = h.sh, def = SHIP_DEFS[sh.cls]; dm = shipDims(sh.cls, sh.L);
      var where = sh.qi >= 0 && sh.port ? "จอดเทียบท่า · " + portName(sh.port) : "ทอดสมอรอเข้าท่าแหลมฉบัง";
      return head("เรือ · ภาพประกอบ", "ship", esc(def.name), esc(where)) +
        '<div class="elv-body"><div class="elv-grid">' + cell("ความยาว", fmt(sh.L), "ม.") + cell("ความกว้าง", fmt(dm.B, 1), "ม.") + '</div>' +
        (sh.cargo ? row("ตู้บนเรือ (ภาพประกอบ)", fmt(sh.cargo.reduce(function (s, c) { return s + c[4] * 2; }, 0)) + " TEU") : "") +
        '<p class="elv-note">เรือลำนี้วางไว้ให้เห็นขนาดเรือจริงที่ท่านี้รับได้' + (sh.port && sh.port.d.id === "KT" ? " (คลองเตยรับเรือยาวไม่เกิน 172 ม.)" : "") +
        ' — ชนิด ขนาด และสีสุ่มแบบคงที่ <b>ไม่ใช่เรือที่จอดอยู่จริงวันนี้</b> · เปิด "เรือจริง (AIS)" เพื่อดูเรือจริง</p></div>';
    }
    if (h.type === "mover") {
      var m = h.m, d2 = SHIP_DEFS[m.cls], sub, extra = "";
      if (m.type === "route") {
        sub = '<span class="prt-sw" style="background:' + esc(m.line.col) + '"></span>' + esc(m.line.n);
        var nt = nearestTerm(m.x, m.y);
        extra = row("สถานะ", m.dwell > 0 ? "จอดรับ-ส่งผู้โดยสาร" + (nt && nt.d < 80 ? " · " + esc(nt.T.t.n) : "") : "กำลังแล่น " + fmt(m.v * 3.6) + " กม./ชม.") +
          row("ความยาวเส้นทาง", fmt(m.Rt.path.len / 1000, 1) + " กม. · " + fmt(m.stops.length) + " จุดจอด");
      } else {
        sub = m.type === "lcb" ? "เข้า-ออกท่าเรือแหลมฉบัง" : m.barges ? "ลากเรือลำเลียง " + m.barges + " ลำ ในแม่น้ำเจ้าพระยา" : "ร่องน้ำแม่น้ำเจ้าพระยา";
        extra = row("สถานะ", m.dwell > 0 ? "รอเทียบท่า/กลับลำ" : "กำลังแล่น " + fmt(m.v / KN, 1) + " นอต") + row("ความยาว", fmt(m.L) + " ม.");
      }
      return head("เรือจำลอง", "ship", esc(d2.name), sub) + '<div class="elv-body">' + extra +
        '<p class="elv-note">' + (m.type === "route" ? "แล่นตามเส้นทางเดินเรือจริงจาก OpenStreetMap และจอดตามท่าจริงของสาย — แต่ตำแหน่ง ณ ขณะนี้เป็นการจำลอง ไม่ใช่เรือลำจริง" :
          "เรือจำลองแสดงการจราจรทางน้ำ — ไม่ใช่เรือจริง (เปิด \"เรือจริง (AIS)\" เพื่อดูเรือจริง)") + '</p></div>';
    }
    if (h.type === "crane") {
      var c = h.c;
      return head("เครนหน้าท่า (Ship-to-Shore)", "container", "เครนยกตู้หน้าท่า", esc(portName(c.P))) +
        '<div class="elv-body"><div class="elv-grid">' + cell("ความสูงถึงคานบูม", "≈" + fmt(c.dim.h + 3), "ม.") + cell("ระยะยื่นบูม", "≈" + fmt(c.dim.out), "ม.") + '</div>' +
        row("ระยะรางเครน", "≈" + fmt(c.dim.gauge, 1) + " ม.") +
        (c.ship && c.ship.live ? row("เรือจริงที่จอดตรงหน้า", esc(c.ship.live.name || "MMSI " + c.ship.live.id) + " · บูมลด") :
          row(liveActive() ? "สถานะ" : "สถานะ (ภาพประกอบ)", c.work ? "กำลังยกตู้ขึ้น-ลงเรือ" : c.busy ? "มีเรือจอด บูมลด" : "ว่าง — ยกบูมขึ้นให้เรือผ่าน")) +
        row("ที่มาของตำแหน่ง", c.est ? "ประมาณตามระยะห่างมาตรฐาน (OSM ไม่มีเครนช่วงนี้)" : "OpenStreetMap") +
        flyBtn(c.osm ? osmBtn("node", c.osm) : "") +
        '<p class="elv-note">รูปทรงและขนาดเป็นแบบมาตรฐานของเครนขนาดนี้ ไม่ใช่แบบของเครนตัวนี้จริง · เครนยกบูมขึ้นเมื่อไม่มีเรือจอดตรงหน้า (เหมือนของจริง)</p></div>';
    }
    if (h.type === "yard") {
      var Yd = h.Yd;
      return head("ลานวางตู้สินค้า", "container", "ลานตู้ · " + esc(portName(h.P)), "Container yard") +
        '<div class="elv-body"><div class="elv-grid">' + cell("กองตู้ในลานนี้", fmt(Yd.n)) + cell("ความจุที่เห็น (ประมาณ)", fmt(Yd.teu), "TEU") + '</div>' +
        row("การวาง", "บล็อกละ 6 แถว + ช่องรถบรรทุก · เครนล้อยาง (RTG) คร่อมบล็อก") +
        '<p class="elv-note">ช่องที่มีตู้และสีตู้ชั้นบนอ่านจาก<b>ภาพดาวเทียม</b> (ลายสีจัดของกองตู้ต่างจากลานคอนกรีตเรียบ) — จำนวนชั้นสุ่ม เพราะภาพถ่ายมุมบนบอกความสูงไม่ได้ · TEU = หน่วยเทียบตู้ 20 ฟุต</p></div>';
    }
    if (h.type === "quay") {
      var Q = h.Q, crN = model.cranes.filter(function (c) { return c.Q === Q; }).length, shN = h.P.ships.filter(function (s) { return h.P.quays[s.qi] === Q; }).length;
      return head("แนวหน้าท่า", "anchor", QKIND[Q.kind] || "ท่าเทียบเรือ", esc(portName(h.P))) +
        '<div class="elv-body"><div class="elv-grid">' + cell("ความยาวหน้าท่า", fmt(Q.len), "ม.") + cell("เครนหน้าท่า", fmt(crN), "ตัว") + '</div>' +
        row("เรือจอด (ภาพประกอบ)", fmt(shN) + " ลำ") + flyBtn() +
        '<p class="elv-note">แนวหน้าท่า = ช่วงขอบน้ำ (ชายฝั่ง/ผืนแม่น้ำใน OpenStreetMap) ที่ติดเขตท่าเรือ · แถบเหลือง = ขอบท่า · เส้นเข้ม = รางเครน</p></div>';
    }
    if (h.type === "port") {
      var P = h.P, d = P.d, I = d.info || {}, nCr = model.cranes.filter(function (c) { return c.P === P; }).length;
      var stacks = P.yards.reduce(function (s, y) { return s + y.n; }, 0), qlen = P.quays.reduce(function (s, q) { return s + q.len; }, 0);
      return head(d.kind === "main" ? "ท่าเรือหลัก" : "ท่าเรือเอกชนริมแม่น้ำเจ้าพระยา", "ship", esc(d.name), esc(d.en)) +
        '<div class="elv-body"><div class="elv-grid">' + cell("แนวหน้าท่า", fmt(qlen / 1000, 1), "กม.") + cell("เครนหน้าท่า", fmt(nCr), "ตัว") + '</div>' +
        row("ผู้ดูแล", esc(d.op)) + (I.opened ? row("เปิดดำเนินการ", esc(I.opened)) : "") + (I.teu ? row("ปริมาณตู้สินค้า", esc(I.teu)) : "") +
        (I.max ? row("ขนาดเรือ", esc(I.max)) : "") + (I.berths ? row("ท่าเทียบเรือ", esc(I.berths)) : "") + (I.area ? row("พื้นที่", esc(I.area)) : "") +
        (stacks ? row("กองตู้ที่เห็นในภาพดาวเทียม", fmt(stacks) + " กอง") : "") + flyBtn(osmBtn(d.osm[0], d.osm[1])) +
        '<p class="elv-note">' + (I.note ? esc(I.note) + " · " : "") + "ผังท่าเรือจาก OpenStreetMap" + (I.src ? " · ตัวเลขจาก " + esc(I.src) : "") + '</p></div>';
    }
    if (h.type === "bld") {
      var r2 = h.b.rec;
      return head("อาคารในท่าเรือ", "building-2", esc(r2.n || (r2.k ? "โกดังสินค้า" : r2.r ? "หลังคาคลุม" : "อาคาร")), esc(portName(h.b.port))) +
        '<div class="elv-body"><div class="elv-grid">' + cell("ความสูง (ประมาณ)", fmt(r2.h), "ม.") + cell("หลังคา", r2.k ? "จั่ว" : r2.r ? "คลุมเปิดโล่ง" : "แบน") + '</div>' +
        flyBtn(osmBtn("way", r2.i)) +
        '<p class="elv-note">ผังจาก OpenStreetMap · สีหลังคาจากภาพดาวเทียม Esri · ความสูงจากแท็ก OSM ถ้ามี ไม่งั้นประมาณจากชนิดและขนาดอาคาร</p></div>';
    }
    if (h.type === "tank") {
      var t = h.t;
      return head("ถังเก็บของเหลว", "fuel", "ถังเก็บ", esc(portName(t.port))) +
        '<div class="elv-body"><div class="elv-grid">' + cell("เส้นผ่านศูนย์กลาง", fmt(t.t[2] / 5), "ม.") + cell("ความสูง (ประมาณ)", fmt(t.t[3] / 10), "ม.") + '</div>' +
        '<p class="elv-note">ตำแหน่งและขนาดจาก OpenStreetMap (man_made=storage_tank) · สีหลังคาจากภาพดาวเทียม</p></div>';
    }
    if (h.type === "term") {
      var tm = h.T.t, lines = (tm.l || "").split("").filter(Boolean);
      return head("ท่าเรือโดยสาร", "ship", esc(tm.n || tm.e || "ท่าเรือ") + (tm.r ? " (" + esc(tm.r) + ")" : ""), esc(tm.e || "")) +
        '<div class="elv-body">' + (lines.length ? row("เรือที่จอด", lines.map(function (l) { return '<span class="prt-sw" style="background:' + (LINE_COL[l] || "#999") + '"></span>' + esc(LINE_NAME[l] || l); }).join("<br>")) : row("เรือที่จอด", "ไม่ระบุใน OSM")) +
        flyBtn() + '<p class="elv-note">ตำแหน่งและชื่อท่าจาก OpenStreetMap · สายเรือจากเส้นทางเดินเรือ (route=ferry) ที่จอดท่านี้ · โป๊ะและหลังคาเป็นแบบจำลองมาตรฐาน สีหลังคาบอกกลุ่มสายเรือ</p></div>';
    }
    if (h.type === "pier") {
      var pr = h.pi.pr, len = 0;
      for (var i = 0; i < h.pi.P.length - 1; i++) len += Math.hypot(h.pi.P[i + 1].x - h.pi.P[i].x, h.pi.P[i + 1].y - h.pi.P[i].y) / h.pi.k;
      return head("ท่าเทียบเรือ/สะพานท่าเรือ", "anchor", esc(pr.n || "ท่าเทียบ"), pr.f ? "โป๊ะลอยน้ำ" : "") +
        '<div class="elv-body"><div class="elv-grid">' + cell(pr.c ? "เส้นรอบรูป" : "ความยาว", fmt(len), "ม.") + cell("ความกว้าง", pr.c ? "ตามผัง" : fmt(pr.w / 10, 1), pr.c ? "" : "ม.") + '</div>' +
        flyBtn(osmBtn("way", pr.i)) + '<p class="elv-note">ผังจาก OpenStreetMap (man_made=pier)</p></div>';
    }
    return "";
  }
  function showCard(h) {
    var card = $("#prtCard");
    if (!card) return;
    card.innerHTML = cardHTML(h);
    card.classList.add("open");
    card._hit = h;
    card.querySelector(".elv-x").addEventListener("click", closeCard);
    var fly = card.querySelector('[data-act="fly"]');
    if (fly) fly.addEventListener("click", function () { flyTo(h); });
  }
  function refreshCard() {
    var card = $("#prtCard");
    if (!card || !card.classList.contains("open")) return;
    var h = card._hit;
    if (h && h.type === "live" && !live.S[h.S.id]) { closeCard(); return; }
    if (h) showCard(h);
  }
  function closeCard() {
    var card = $("#prtCard");
    if (card) card.classList.remove("open");
    if (selKey && group) setSelected(null);
  }
  function flyTo(h) {
    var c = null, zoom = 16.2;
    if (h.type === "crane") { c = H.toLngLat(h.c.F.o.x, h.c.F.o.y); zoom = 17; }
    else if (h.type === "quay") { var m = qpt(h.Q, h.Q.len / 2, -10); c = H.toLngLat(m.x, m.y); zoom = 15.8; }
    else if (h.type === "port") { c = H.toLngLat(h.P.c.x, h.P.c.y); zoom = h.P.d.id === "LCB" ? 14 : 15; }
    else if (h.type === "bld") { var bx = h.b.box; c = H.toLngLat((bx.min.x + bx.max.x) / 2, (bx.min.y + bx.max.y) / 2); zoom = 16.8; }
    else if (h.type === "term") { c = H.toLngLat(h.T.p.x, h.T.p.y); zoom = 17.4; }
    else if (h.type === "pier") { c = H.toLngLat((h.pi.bb.x0 + h.pi.bb.x1) / 2, (h.pi.bb.y0 + h.pi.bb.y1) / 2); zoom = 17; }
    else if (h.px != null) c = H.toLngLat(h.px, h.py);
    if (c) map.flyTo({ center: c, zoom: zoom, pitch: 62, bearing: map.getBearing(), duration: 1500 });
  }

  /* -------------------------------------------------------------- mount */
  function mount(m) {
    map = m;
    H = window.BKK_3D;
    if (!H) { console.warn("bkk-port3d: ต้องโหลด bkk-3d-host.js ก่อน"); return; }
    H.attach(m);
    if (lsGet(LS_KEY) === "0") visible = false;
    if (lsGet(LS_KEY) == null) visible = false;           // ชั้นใหม่: ปิดไว้ก่อนจนผู้ใช้เปิดเอง
    if (lsGet(LS_BOATS) === "0") boatsOn = false;
    aisOn = lsGet(LS_AIS) !== "0";                         // เรือจริงเป็นค่าเริ่มต้น (ไม่มีคีย์/ไม่มีสัญญาณ → เรือจำลองแทน)
    buildUI();
    if (!mount._bound) {
      mount._bound = true;
      map.on("render", function () { if (!visible || map.getZoom() < H.minZoom) hideLabels(); });
      document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") pollAIS(); });
    }
    exclOn = null;
    if (!visible) return;
    var go = function () { ensureLoaded().then(function () { if (!model) return; H.show(MOD_ID, true); excludeCity(true); if (aisOn) startAIS(); }); };
    if (loading) go();
    else if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 4000 });
    else setTimeout(go, 1500);
  }

  window.BKK_PORT3D = {
    mount: mount,
    setVisible: setVisible,
    setBoats: setBoats,
    setAIS: setAIS,
    go: function (id) { var g = GO.filter(function (x) { return x.id === id; })[0]; if (g) flyGo(g); },
    debug: function () {
      var tris = 0;
      if (group) group.traverse(function (o) { if (o.isMesh && o.geometry.index) tris += o.geometry.index.count / 3 * (o.isInstancedMesh ? o.count : 1); });
      return {
        loaded: !!model, error: lastError, visible: visible, boats: boatsOn, ais: aisOn, buildMs: model && model.buildMs,
        ports: D ? D.ports.length : 0, containers: model ? model.containerN : 0, cranes: model ? model.cranes.length : 0, buildings: model ? model.blds.length : 0,
        piers: model ? model.piers.length : 0, terminals: model ? model.terms.length : 0, ships: model ? model.ships.length : 0, movers: model ? model.movers.length : 0,
        live: live.n, liveErr: live.err, tris: Math.round(tris)
      };
    },
    internals: function () { return { model: model, group: group, live: live, mats: mats, pick: pick, hitBox: hitBox, shipFrame: shipFrame }; }
  };

  (function register() {
    var H0 = window.BKK_3D;
    if (!H0) return;
    var last = 0, wake = null;
    H0.register({
      id: MOD_ID,
      get group() { return group; },
      pick: pick,
      click: function (h) { setSelected(h); showCard(h); },
      hover: function (h) { if (group) setHover(h); },
      clear: closeCard,
      frame: function (z) {
        if (!model) return;
        var sc = z >= CRANE_ZOOM, sy = z >= YARD_ZOOM, sp = z >= PIER_ZOOM, sb = z >= BOAT_ZOOM;
        if (model.bldGroup.visible !== sc) model.bldGroup.visible = sc;
        if (model.yardGroup.visible !== sy) model.yardGroup.visible = sy;
        if (model.pierGroup.visible !== sp) model.pierGroup.visible = sp;
        model.small.forEach(function (i) { var mm = model.fleets[i].mesh; if (mm.visible !== sb) mm.visible = sb; });
        var now = performance.now(), dt = Math.min(0.25, (now - (last || now)) / 1000);
        last = now;
        var onScreen = updateBoats(dt, z);
        followHl(selMesh); followHl(hoverMesh);
        placeLabels(z);
        var anim = (boatsOn || aisOn) && onScreen > 0;
        if (anim !== !!model.animOn) { model.animOn = anim; H.setAnim(MOD_ID, anim); }
        if (!anim && !wake && (boatsOn || aisOn)) wake = setTimeout(function () { wake = null; if (visible) H.repaint(); }, 1000);
      },
      theme: function (name) { themeMaterials(name); },
      rendererReady: function () {}
    });
  })();
})();
