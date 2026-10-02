/**
 * bkk-shadow.js
 * ชั้น "เงาตึก & แสงแดด" ของ bkk-city.html — เงาของตึกบนพื้นตามตำแหน่งดวงอาทิตย์จริง ณ วันและเวลาที่เลือก (เวลาไทย)
 *
 * - ตำแหน่งดวงอาทิตย์: สูตรเดียวกับ SunCalc (Vladimir Agafonkin, BSD-2) คำนวณเองในไฟล์นี้ ไม่ต้องโหลดไลบรารี
 * - เงา = รอยเท้าตึกที่ลากไปทางตรงข้ามดวงอาทิตย์ ยาว (ความสูง ÷ tan มุมเงยของแดด) — คิดฐานลอย (min_height) ด้วย
 * - MapLibre ไม่มีเงาให้ในตัว → วาดเงาทุกตึกลง canvas ก้อนเดียว (สีทึบ จึงไม่ซ้อนเข้มขึ้นตรงที่เงาทับกัน)
 *   แล้วแปะเป็น canvas source วางใต้ป้ายชื่อ/ตึก 3 มิติ · วาดใหม่เมื่อเลื่อนแผนที่หรือเปลี่ยนเวลา
 * - ตึกที่ให้เงา: ตึก 3 มิติของแผนที่ฐาน (OSM) + มวลตึกโครงการ/แลนด์มาร์ก/สำนักงาน · โมเดล GLB และทางยกระดับ (three.js) ไม่มีเงาในชั้นนี้
 * - ระหว่างเปิด ไฟส่องตึกหมุนตามดวงอาทิตย์ด้วย (คืนไฟของธีมเมื่อปิด)
 */
(function () {
  "use strict";

  var LS_KEY = "bkk-shadow-on", LS_MIN = "bkk-shadow-min";
  var SRC = "bkk-shadow-src", LYR = "bkk-shadow";
  var MIN_Z = 13.5;            // ตึกของแผนที่ฐานเริ่มขึ้นที่ซูมนี้
  var MAX_PX = 2048;           // ด้านยาวสุดของ canvas
  var MAX_SPAN = 0.05;         // องศา — ขอบเขตวาดเงารอบกลางจอ (~5.5 กม.) กันจอเอียงมากแล้วขอบฟ้าไกลเกิน
  var BKK = [100.5, 13.75];
  var GEO_LAYERS = [           // [source, ฟิลด์ความสูง, ฟิลด์ฐาน]
    ["landmarks-3d", "height", "min_height"], ["landmarks-osm", "height", "min_height"],
    ["ashton-towers-src", "height", null], ["bkk-dc-3d", "height", "min_height"]
  ];
  var OPACITY = { dark: 0.34, sunset: 0.3, light: 0.3 };   // ธีมมืด/พระอาทิตย์ตก = ความเข้มของแดดบนพื้น · สว่าง = ความเข้มเงา

  var map = null, visible = false, uiBuilt = false, bound = false;
  var dateStr = "", minutes = 0, playTimer = null, savedLight = null, cache = null, drawTimer = null;
  var canvas = null, ctx = null;

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function theme() { var t = document.documentElement.getAttribute("data-theme"); return OPACITY[t] != null ? t : "dark"; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hm(min) { min = Math.round(min); return pad(Math.floor(min / 60) % 24) + ":" + pad(min % 60); }
  function bkkNow() { return new Date(Date.now() + 7 * 3600000); }   // อ่านด้วย getUTC* = เวลาไทย
  function todayStr() { var d = bkkNow(); return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
  function whenMs(ds, min) { return Date.parse(ds + "T00:00:00+07:00") + min * 60000; }
  function thDate(ds) {
    var d = new Date(ds + "T12:00:00+07:00");
    return isNaN(d) ? ds : d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" });
  }

  /* ================================================================ ดวงอาทิตย์ (ตาม SunCalc) */
  var RAD = Math.PI / 180;
  function sunPos(ms, lon, lat) {
    var d = ms / 86400000 - 0.5 + 2440588 - 2451545;
    var M = RAD * (357.5291 + 0.98560028 * d);
    var C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    var L = M + C + RAD * 102.9372 + Math.PI, e = RAD * 23.4397;
    var dec = Math.asin(Math.sin(e) * Math.sin(L)), ra = Math.atan2(Math.sin(L) * Math.cos(e), Math.cos(L));
    var phi = RAD * lat, H = RAD * (280.16 + 360.9856235 * d) - RAD * -lon - ra;
    var alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
    var az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)) + Math.PI;   // จากทิศเหนือ ตามเข็ม
    return { alt: alt, az: az };
  }
  function riseSet(ds) {
    var rise = null, set = null, prev = null, noon = { alt: -1 }, noonMin = 720;
    for (var m = 0; m <= 1440; m += 2) {
      var a = sunPos(whenMs(ds, m), BKK[0], BKK[1]).alt / RAD + 0.833;
      if (prev != null && prev < 0 && a >= 0) rise = m - 2 * a / (a - prev);
      if (prev != null && prev >= 0 && a < 0) set = m - 2 * a / (a - prev);
      if (a > noon.alt) { noon.alt = a; noonMin = m; }
      prev = a;
    }
    return { rise: rise, set: set, noon: noonMin, noonAlt: noon.alt - 0.833 };
  }
  var COMPASS = ["เหนือ", "ตะวันออกเฉียงเหนือ", "ตะวันออก", "ตะวันออกเฉียงใต้", "ใต้", "ตะวันตกเฉียงใต้", "ตะวันตก", "ตะวันตกเฉียงเหนือ"];
  function dirName(az) { return COMPASS[Math.round(((az / RAD) % 360) / 45) % 8]; }

  /* ================================================================ เก็บรอยเท้าตึกในจอ (พิกัด mercator 0–1) */
  function mx(lon) { return (lon + 180) / 360; }
  function my(lat) { var s = Math.sin(lat * RAD); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); }
  function vecSource() {
    var srcs = map.getStyle().sources;
    for (var id in srcs) if (srcs[id].type === "vector") return id;
    return null;
  }
  function addRings(out, geom, h, base) {
    if (!(h > 0)) return;
    var polys = geom.type === "Polygon" ? [geom.coordinates] : geom.type === "MultiPolygon" ? geom.coordinates : [];
    for (var i = 0; i < polys.length; i++) {
      var r = polys[i][0];
      if (!r || r.length < 4) continue;
      var pts = new Float64Array(r.length * 2);
      for (var k = 0; k < r.length; k++) { pts[k * 2] = mx(r[k][0]); pts[k * 2 + 1] = my(r[k][1]); }
      out.push({ p: pts, h: h, b: base > 0 ? Math.min(base, h) : 0 });
    }
  }
  function collect() {
    var b = map.getBounds(), c = map.getCenter();
    var w = Math.max(b.getWest(), c.lng - MAX_SPAN), e = Math.min(b.getEast(), c.lng + MAX_SPAN);
    var s = Math.max(b.getSouth(), c.lat - MAX_SPAN), n = Math.min(b.getNorth(), c.lat + MAX_SPAN);
    var box = { w: w, e: e, s: s, n: n, x0: mx(w), x1: mx(e), y0: my(n), y1: my(s) };
    var list = [], vs = vecSource();
    if (vs) {
      var fs = [];
      try { fs = map.querySourceFeatures(vs, { sourceLayer: "building" }); } catch (er) { }
      for (var i = 0; i < fs.length; i++) {
        var p = fs[i].properties || {};
        if (p.hide_3d === true || p.hide_3d === "true") continue;
        addRings(list, fs[i].geometry, +(p.render_height || 5), +(p.render_min_height || 0));
      }
    }
    GEO_LAYERS.forEach(function (g) {
      if (!map.getSource(g[0])) return;
      var fs2 = [];
      try { fs2 = map.querySourceFeatures(g[0]); } catch (er) { }
      for (var j = 0; j < fs2.length; j++) {
        var q = fs2[j].properties || {};
        addRings(list, fs2[j].geometry, +q[g[1]], g[2] ? +q[g[2]] || 0 : 0);
      }
    });
    // ตัดตึกที่อยู่นอกกรอบ (บวกขอบเผื่อเงายาว ~0.6 กม.)
    var pad2 = 600 / (40075016.7 * Math.cos(c.lat * RAD));
    var kept = list.filter(function (o) {
      var p = o.p;
      for (var k = 0; k < p.length; k += 2) if (p[k] > box.x0 - pad2 && p[k] < box.x1 + pad2 && p[k + 1] > box.y0 - pad2 && p[k + 1] < box.y1 + pad2) return true;
      return false;
    });
    return { box: box, list: kept, mPerUnit: 40075016.7 * Math.cos(c.lat * RAD) };
  }

  /* ================================================================ วาดเงาลง canvas */
  function draw() {
    if (!visible || !map || !map.getSource(SRC)) return;
    var sun = sunPos(whenMs(dateStr, minutes), map.getCenter().lng, map.getCenter().lat);
    applyLight(sun);
    updateReadout(sun);
    var lowSun = sun.alt < 2 * RAD;          // แดดต่ำกว่า 2° เงายาวไม่สิ้นสุด → ถือว่ามืด/ไม่มีเงาชัด
    if (map.getZoom() < MIN_Z || lowSun) { clearCanvas(); return; }
    if (!cache) cache = collect();
    var B = cache.box, W = B.x1 - B.x0, Hh = B.y1 - B.y0;
    if (!(W > 0 && Hh > 0)) { clearCanvas(); return; }
    // ระหว่างเล่นไล่เวลา ใช้ภาพครึ่งความละเอียด — อัปโหลดภาพ 2048² ทุกเฟรมช้าจนเล่นกระตุก
    var sc = (playTimer ? MAX_PX / 2 : MAX_PX) / Math.max(W, Hh);
    var cw = Math.max(2, Math.round(W * sc)), ch = Math.max(2, Math.round(Hh * sc));
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    // ธีมสว่าง: วาดเงาสีเข้มบนพื้นขาว · ธีมมืด/พระอาทิตย์ตก: พื้นมืดอยู่แล้ว เงาดำมองไม่เห็น
    // → ระบายแดดอุ่นทั้งพื้น แล้วเจาะรูตรงเงา (destination-out) ให้เงาคือส่วนที่มืดกว่ารอบ ๆ
    var lit = theme() !== "light";
    if (lit) {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = theme() === "sunset" ? "#ffb877" : "#ffd89a";
      ctx.fillRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = "destination-out";
    }
    ctx.fillStyle = lit ? "#000" : "#1e293b";
    // เงาทอดไปทางตรงข้ามดวงอาทิตย์ — ยาว h / tan(alt) เมตร · แกน y ของ mercator ชี้ลงใต้
    var len = 1 / Math.tan(sun.alt) / cache.mPerUnit;
    var ux = -Math.sin(sun.az) * len, uy = Math.cos(sun.az) * len;
    // เงาของปริซึม = เปลือกนูนของ (รอยเท้าที่ระดับฐาน ∪ รอยเท้าที่ระดับยอด) ที่เลื่อนตามทิศแดด
    // ตรงทุกจุดสำหรับตึกรูปนูน ตึกรูปตัว L/U จะเงาเต็มช่องเว้าเล็กน้อย — แลกกับวาดเร็วกว่าลากทุกด้านเป็นสิบเท่า
    var L = cache.list, xs = [], ys = [];
    for (var i = 0; i < L.length; i++) {
      var o = L[i], p = o.p, n = p.length / 2 - 1;   // จุดสุดท้ายซ้ำจุดแรก
      var hx = ux * o.h, hy = uy * o.h, bx = ux * o.b, by = uy * o.b;
      if ((hx * hx + hy * hy) * sc * sc < 0.25) continue;          // เงาสั้นกว่าครึ่งพิกเซล
      xs.length = ys.length = 0;
      for (var k = 0; k < n; k++) {
        var x = p[k * 2] - B.x0, y = p[k * 2 + 1] - B.y0;
        xs.push((x + bx) * sc, (x + hx) * sc);
        ys.push((y + by) * sc, (y + hy) * sc);
      }
      var hull = convexHull(xs, ys);
      if (hull.length < 3) continue;
      ctx.beginPath();
      ctx.moveTo(xs[hull[0]], ys[hull[0]]);
      for (var q = 1; q < hull.length; q++) ctx.lineTo(xs[hull[q]], ys[hull[q]]);
      ctx.closePath();
      ctx.fill();
    }
    if (lit) {
      // ขอบกรอบแดดจางลงรอบนอก ไม่ให้เห็นเป็นสี่เหลี่ยมตอนเอียงกล้องมองไกล
      var g = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.3, cw / 2, ch / 2, Math.max(cw, ch) * 0.55);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = "source-over";
    }
    var src = map.getSource(SRC);
    src.setCoordinates([[B.w, B.n], [B.e, B.n], [B.e, B.s], [B.w, B.s]]);
    pump(src);
  }
  /* เปลือกนูนแบบ monotone chain — คืนลำดับดัชนีจุดตามเข็ม/ทวนเข็ม */
  var _idx = [];
  function convexHull(xs, ys) {
    var n = xs.length, i;
    _idx.length = n;
    for (i = 0; i < n; i++) _idx[i] = i;
    _idx.sort(function (a, b) { return xs[a] - xs[b] || ys[a] - ys[b]; });
    var cross = function (o, a, b) { return (xs[a] - xs[o]) * (ys[b] - ys[o]) - (ys[a] - ys[o]) * (xs[b] - xs[o]); };
    var lo = [], up = [];
    for (i = 0; i < n; i++) {
      while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], _idx[i]) <= 0) lo.pop();
      lo.push(_idx[i]);
    }
    for (i = n - 1; i >= 0; i--) {
      while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], _idx[i]) <= 0) up.pop();
      up.push(_idx[i]);
    }
    lo.pop(); up.pop();
    return lo.concat(up);
  }
  function clearCanvas() {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var src = map && map.getSource(SRC);
    if (src) pump(src);
  }
  /* canvas source ที่ไม่ได้ animate จะไม่อัปโหลดภาพใหม่เอง → เล่น 1 เฟรมแล้วหยุด */
  function pump(src) {
    if (src.play) src.play();
    map.triggerRepaint();
    map.once("render", function () { if (src.pause && !playTimer) src.pause(); });
  }
  function scheduleDraw(refetch) {
    if (refetch) cache = null;
    clearTimeout(drawTimer);
    drawTimer = setTimeout(draw, 120);
  }

  /* ================================================================ ไฟส่องตึกตามดวงอาทิตย์ */
  function applyLight(sun) {
    if (!map) return;
    if (!savedLight) { try { savedLight = map.getLight ? JSON.parse(JSON.stringify(map.getLight() || {})) : {}; } catch (e) { savedLight = {}; } }
    try {
      if (sun.alt <= 0) { map.setLight(savedLight); return; }
      var t = theme();
      map.setLight({
        anchor: "map",
        color: t === "dark" ? "#fff1d6" : t === "sunset" ? "#ffb070" : "#ffffff",
        intensity: t === "dark" ? 0.32 : 0.45,
        position: [1.5, (sun.az / RAD + 360) % 360, Math.max(0, 90 - sun.alt / RAD)]
      });
    } catch (e) { }
  }
  function restoreLight() {
    if (savedLight && map) { try { map.setLight(savedLight); } catch (e) { } }
    savedLight = null;
  }

  /* ================================================================ ชั้นแผนที่ */
  function firstSymbol() {
    var ls = map.getStyle().layers || [];
    for (var i = 0; i < ls.length; i++) if (ls[i].type === "symbol" && ls[i].source && !/^air-|^fuel-|^bkk-/.test(ls[i].id)) return ls[i].id;
    return undefined;
  }
  function addLayers() {
    if (!map || !map.getStyle()) return;
    if (!canvas) { canvas = document.createElement("canvas"); canvas.width = canvas.height = 2; ctx = canvas.getContext("2d"); }
    if (!map.getSource(SRC)) {
      var c = map.getCenter();
      map.addSource(SRC, { type: "canvas", canvas: canvas, animate: false,
        coordinates: [[c.lng - 0.01, c.lat + 0.01], [c.lng + 0.01, c.lat + 0.01], [c.lng + 0.01, c.lat - 0.01], [c.lng - 0.01, c.lat - 0.01]] });
    }
    if (!map.getLayer(LYR)) {
      // ใต้ป้ายชื่อของแผนที่ฐาน และใต้ฉาก 3 มิติ/ตึก 3 มิติ (ตึกบังเงาของตัวเองได้ตามจริง)
      var before = map.getLayer("bkk-3d-world") ? "bkk-3d-world" : firstSymbol() || (map.getLayer("city-buildings-3d") ? "city-buildings-3d" : undefined);
      map.addLayer({ id: LYR, type: "raster", source: SRC, minzoom: MIN_Z - 0.5,
        paint: { "raster-opacity": OPACITY[theme()], "raster-fade-duration": 0, "raster-resampling": "linear" } }, before);
    }
    map.setLayoutProperty(LYR, "visibility", visible ? "visible" : "none");
    bindMap();
    scheduleDraw(true);
  }
  function bindMap() {
    if (bound) return;
    bound = true;
    map.on("moveend", function () { if (visible) scheduleDraw(true); });
    map.on("sourcedata", function (e) {
      if (!visible || !e.isSourceLoaded || !e.tile) return;
      if (e.sourceId === vecSource()) scheduleDraw(true);
    });
  }

  /* ================================================================ แผง */
  var CSS = [
    "#shadowPanel{position:absolute;z-index:42;left:50%;transform:translateX(-50%);bottom:22px;width:600px;max-width:calc(100% - 28px);display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.45;padding:9px 12px 10px}",
    "#shadowPanel.open{display:block}",
    ".sh-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
    ".sh-top b{font-size:13px;display:flex;align-items:center;gap:6px}",
    ".sh-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".sh-ib .mdico{width:13px;height:13px}.sh-top .sh-ib:first-of-type{margin-left:auto}",
    ".sh-date{font:inherit;font-size:12px;padding:3px 6px;border-radius:8px;border:1px solid var(--card-border);background:rgba(127,127,127,.08);color:var(--text-main);color-scheme:dark}",
    "[data-theme=\"light\"] .sh-date{color-scheme:light}",
    ".sh-chip{padding:3px 9px;border-radius:999px;border:1px solid var(--card-border);background:none;color:var(--text-muted);font:inherit;font-size:11.5px;cursor:pointer}",
    ".sh-chip:hover{border-color:var(--accent);color:var(--text-main)}",
    "#shadowPanel.min .sh-body{display:none}",
    ".sh-row{display:flex;align-items:center;gap:8px;margin-top:8px}",
    ".sh-row input[type=range]{flex:1;accent-color:#f59e0b}",
    ".sh-play{border:1px solid var(--card-border);background:rgba(127,127,127,.08);color:var(--text-main);width:30px;height:28px;border-radius:8px;cursor:pointer;display:grid;place-items:center;flex:none}",
    ".sh-play:hover{border-color:var(--accent)}.sh-play .mdico{width:14px;height:14px}",
    ".sh-time{font-size:18px;font-weight:800;font-variant-numeric:tabular-nums;min-width:52px;text-align:right}",
    ".sh-info{display:flex;flex-wrap:wrap;gap:2px 14px;margin-top:6px;font-size:11.5px;color:var(--text-muted)}.sh-info b{color:var(--text-main);font-weight:700}",
    ".sh-note{margin:5px 0 0;font-size:10.5px;opacity:.65}",
    ".sh-zoom{margin-top:6px;font-size:11.5px;color:#f59e0b}",
    "@media (max-width:760px){#shadowPanel{bottom:74px;padding:8px 10px}.sh-time{font-size:16px}}"
  ].join("");

  function updateReadout(sun) {
    var t = $("#shTime"), inf = $("#shInfo"), z = $("#shZoom"), r = $("#shRange");
    if (t) t.textContent = hm(minutes);
    if (r && +r.value !== minutes) r.value = minutes;
    if (!inf) return;
    var rs = riseSet(dateStr), altD = sun.alt / RAD;
    var parts = [];
    parts.push('ขึ้น <b>' + (rs.rise != null ? hm(rs.rise) : "–") + '</b> · ตก <b>' + (rs.set != null ? hm(rs.set) : "–") + '</b> น.');
    if (altD > 0) {
      parts.push('แดดเงย <b>' + altD.toFixed(0) + '°</b> จากทิศ' + dirName(sun.az));
      parts.push(altD >= 2 ? 'เงายาว <b>' + (1 / Math.tan(sun.alt)).toFixed(1) + '×</b> ความสูงตึก ทอดไปทาง' + dirName(sun.az + Math.PI) : 'แดดต่ำมาก เงายาวจนไม่ชัด');
    } else parts.push('<b>กลางคืน</b> — ไม่มีแดด');
    parts.push('เที่ยงสุริยะ ' + hm(rs.noon) + ' น. (แดดเงยสูงสุด ' + rs.noonAlt.toFixed(0) + '°)');
    inf.innerHTML = parts.map(function (x) { return '<span>' + x + '</span>'; }).join("");
    if (z) z.textContent = map && map.getZoom() < MIN_Z ? "ซูมเข้าใกล้กว่านี้ (ระดับตึก) เพื่อดูเงา" : "";
  }
  function renderPanel() {
    var p = $("#shadowPanel");
    if (!p) return;
    p.querySelector(".sh-body").innerHTML =
      '<div class="sh-row"><button type="button" class="sh-play" data-a="play" title="' + (playTimer ? "หยุด" : "เล่นทั้งวัน") + '">' + ico(playTimer ? "pause" : "play") + '</button>' +
      '<input type="range" id="shRange" min="300" max="1170" step="5" value="' + minutes + '" aria-label="เวลา">' +
      '<span class="sh-time" id="shTime">' + hm(minutes) + '</span></div>' +
      '<div class="sh-info" id="shInfo"></div><div class="sh-zoom" id="shZoom"></div>' +
      '<p class="sh-note">ตำแหน่งดวงอาทิตย์คำนวณจริงตามวันเวลา (เวลาไทย) · เงาจากตึก 3 มิติบนแผนที่ (ความสูงตาม OpenStreetMap) · ไม่รวมเงาของโมเดลแลนด์มาร์กและทางยกระดับ · ไม่คิดเมฆ</p>';
    if (map) updateReadout(sunPos(whenMs(dateStr, minutes), map.getCenter().lng, map.getCenter().lat));
  }
  function setTime(min) { minutes = Math.max(0, Math.min(1439, Math.round(min))); scheduleDrawNow(); }
  function scheduleDrawNow() { clearTimeout(drawTimer); draw(); }
  function setDate(ds) {
    if (!/^\d{4}-\d\d-\d\d$/.test(ds)) return;
    dateStr = ds;
    var d = $("#shDate");
    if (d && d.value !== ds) d.value = ds;
    scheduleDrawNow();
  }
  function stopPlay() {
    if (!playTimer) return;
    clearInterval(playTimer); playTimer = null;
    var src = map && map.getSource(SRC);
    if (src && src.pause) src.pause();
    renderPanel();
    draw();                          // กลับมาวาดเต็มความละเอียด
  }
  function togglePlay() {
    if (playTimer) { stopPlay(); return; }
    var rs = riseSet(dateStr);
    var start = rs.rise != null ? Math.ceil(rs.rise / 5) * 5 : 360, end = rs.set != null ? Math.floor(rs.set / 5) * 5 : 1110;
    if (minutes < start || minutes >= end) minutes = start;
    playTimer = setInterval(function () {
      if (minutes + 5 > end) { stopPlay(); return; }
      setTime(minutes + 5);
    }, 90);
    renderPanel();
  }
  function setNow() {
    var d = bkkNow();
    setDate(todayStr());
    setTime(d.getUTCHours() * 60 + d.getUTCMinutes());
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnShadowToggle")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "menu-btn"; b.id = "btnShadowToggle";
      b.title = "เปิด/ปิดเงาตึกตามเวลา — เงาจริงตามตำแหน่งดวงอาทิตย์ เลือกวันและเวลาได้";
      b.innerHTML = '<span>' + ico("sun") + '</span><span class="label-text"> เงาตึก</span>';
      b.addEventListener("click", function () { setVisible(!visible); });
      menu.appendChild(b);
    }
    if (!$("#shadowPanel")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var p = document.createElement("div");
      p.id = "shadowPanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "เงาตึกและแสงแดด");
      p.innerHTML = '<div class="sh-top"><b>' + ico("sun") + ' เงาตึก & แสงแดด</b>' +
        '<input type="date" class="sh-date" id="shDate" aria-label="วันที่">' +
        '<button type="button" class="sh-chip" data-a="now">ตอนนี้</button>' +
        '<button type="button" class="sh-chip" data-d="06-21" title="ครีษมายัน — กลางวันยาวสุด แดดเที่ยงอยู่ค่อนไปทางเหนือ">21 มิ.ย.</button>' +
        '<button type="button" class="sh-chip" data-d="12-21" title="เหมายัน — แดดอ้อมใต้ เงายาวสุดในรอบปี">21 ธ.ค.</button>' +
        '<button type="button" class="sh-ib" data-a="min" title="ย่อ/ขยาย">' + ico("minus") + '</button>' +
        '<button type="button" class="sh-ib" data-a="close" title="ปิดชั้นนี้">×</button></div><div class="sh-body"></div>';
      if (lsGet(LS_MIN) === "1") p.classList.add("min");
      stage.appendChild(p);
      p.addEventListener("click", function (e) {
        var a = e.target.closest("[data-a]");
        if (a) {
          var act = a.dataset.a;
          if (act === "close") return setVisible(false);
          if (act === "min") { var m = !p.classList.contains("min"); p.classList.toggle("min", m); lsSet(LS_MIN, m ? "1" : "0"); return; }
          if (act === "play") return togglePlay();
          if (act === "now") { stopPlay(); setNow(); return; }
        }
        var dd = e.target.closest("[data-d]");
        if (dd) { stopPlay(); setDate(dateStr.slice(0, 4) + "-" + dd.dataset.d); }
      });
      p.addEventListener("input", function (e) {
        if (e.target.id === "shRange") { stopPlay(); setTime(+e.target.value); }
        else if (e.target.id === "shDate") { stopPlay(); setDate(e.target.value); }
      });
    }
    syncButtons();
  }
  function syncButtons() {
    var b = $("#btnShadowToggle"), p = $("#shadowPanel");
    if (b) b.classList.toggle("active", visible);
    if (p) p.classList.toggle("open", visible);
  }

  function setVisible(v) {
    visible = !!v;
    lsSet(LS_KEY, visible ? "1" : "0");
    syncButtons();
    if (!visible) {
      stopPlay();
      if (map && map.getLayer(LYR)) map.setLayoutProperty(LYR, "visibility", "none");
      restoreLight();
      return;
    }
    if (!dateStr) { var d = bkkNow(); dateStr = todayStr(); minutes = d.getUTCHours() * 60 + d.getUTCMinutes(); if (minutes < 300 || minutes > 1170) minutes = 600; }
    var di = $("#shDate");
    if (di) di.value = dateStr;
    renderPanel();
    addLayers();
    if (map.getZoom() < MIN_Z) map.flyTo({ zoom: 15.2, pitch: Math.max(map.getPitch(), 55), duration: 1400 });
  }

  /* ================================================================ mount — เรียกซ้ำทุกครั้งที่เปลี่ยนสไตล์แผนที่ */
  function mount(m) {
    map = m;
    savedLight = null;               // style ใหม่ตั้งไฟของธีมใหม่แล้ว — จำใหม่ตอนวาดครั้งถัดไป
    buildUI();
    if (lsGet(LS_KEY) === "1" && !visible) { setVisible(true); return; }
    if (visible) addLayers();
  }

  window.BKK_SHADOW = {
    mount: mount,
    setVisible: setVisible,
    sun: function (ds, min) { var s = sunPos(whenMs(ds || dateStr, min == null ? minutes : min), BKK[0], BKK[1]); return { alt: s.alt / RAD, az: s.az / RAD }; },
    debug: function () { return { visible: visible, date: dateStr, time: hm(minutes), rings: cache ? cache.list.length : 0, canvas: canvas ? [canvas.width, canvas.height] : null }; }
  };
})();
