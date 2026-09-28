/**
 * bkk-landslide.js
 * ชั้น "ดินถล่ม" ของ bkk-city.html — เฝ้าระวังช่วงฝนตก + พื้นที่อ่อนไหว + หมู่บ้านเสี่ยง/จุดปลอดภัย + เหตุในอดีต + ภูเขา/ความชัน
 *
 * ข้อมูล
 *   - กรมทรัพยากรธรณี (ArcGIS gisportal.dmr.go.th เปิด CORS):
 *       พื้นที่อ่อนไหวต่อการเกิดแผ่นดินถล่ม 5 ระดับ (53,199 รูป) + ร่องรอยแผ่นดินถล่ม (75,881 จุด) → ขอภาพไทล์สดจากเซิร์ฟเวอร์กรมฯ
 *         (สัญลักษณ์เดิมของกรมฯ เป็นสีเขียวสีเดียว จึงส่ง dynamicLayers ให้ระบายสีตามระดับเอง) · กดจุดบนแผนที่ = ถามระดับตรงจุดนั้น
 *       เหตุดินถล่ม 773 เหตุ (2531–ปัจจุบัน) · หมู่บ้านเสี่ยงภัยแผ่นดินถล่ม/ดินไหล/หินร่วง 4,077 · สถานีเฝ้าระวัง 25 → bkk-slide-data.js
 *       ตำแหน่งปลอดภัยจากแผ่นดินถล่ม 8,951 → bkk-slide-safe.js (โหลดเมื่อซูมเข้าไป/เปิดการ์ดหมู่บ้าน)
 *   - NASA Global Landslide Catalog (2550–2559) — เฉพาะประเทศเพื่อนบ้าน
 *   - ฝนตกหนัก: /api/slide ← thaiwater (ฝน 24 ชม. + สะสม 7 วัน) · สถานีเตือนภัยที่แจ้งด้วยปริมาณฝน: /api/warn ← กรมทรัพยากรน้ำ
 *     เกณฑ์ 100 มม./วัน = ข้อความของกรมทรัพยากรธรณี "มีฝนตกหนักต่อเนื่องกันเป็นระยะเวลานาน (มากกว่า 100 มิลลิเมตรต่อวัน)"
 *   - ภูเขา/ความชัน: AWS Terrain Tiles (terrarium) → เงาภูเขาของ MapLibre + ความชันคำนวณเองต่อไทล์ (protocol sltslope://)
 */
(function () {
  "use strict";

  var LS_KEY = "bkk-slide-on", LS_SUB = "bkk-slide-sub", LS_OPT = "bkk-slide-opt", LS_MIN = "bkk-slide-min";
  var REMOTE = "https://ratthai-kaona.vercel.app";
  var DATA_URL = "bkk-slide-data.js", SAFE_URL = "bkk-slide-safe.js";
  var DMR = "https://gisportal.dmr.go.th/arcgis/rest/services/HAZARD/";
  var DMR_INFO = "https://www.dmr.go.th/";
  var DMR_DATA = "https://data.go.th/dataset?q=%E0%B9%81%E0%B8%9C%E0%B9%88%E0%B8%99%E0%B8%94%E0%B8%B4%E0%B8%99%E0%B8%96%E0%B8%A5%E0%B9%88%E0%B8%A1";
  var TERRARIUM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/";
  var HEAVY = 100;            // มม./24 ชม. — เกณฑ์ของกรมทรัพยากรธรณี
  var D2R = Math.PI / 180;

  // ระดับความอ่อนไหว (gridcode 1–5) — สีเขียว→แดง
  var LV = [null,
    { t: "ต่ำมาก", c: "#4caf50", a: 70 }, { t: "ต่ำ", c: "#c0ca33", a: 110 }, { t: "กลาง", c: "#fdd835", a: 150 },
    { t: "สูง", c: "#fb8c00", a: 185 }, { t: "สูงมาก", c: "#e53935", a: 215 }];
  var SLOPE = [[15, "#ffd60a"], [25, "#ff8a00"], [35, "#ff2d55"]];

  var map = null, visible = false, uiBuilt = false, handlersBound = false;
  var sub = { watch: true, risk: true, scar: false, vil: true, hist: true, nasa: false, slope: false };
  var opt = { minLv: 3, per: "all", list: "dead", q: "" };
  var G = null, gLoading = null, SAFE = null, safeLoading = null;
  var R = { data: null, at: 0, err: null, busy: false };      // /api/slide
  var W = { st: [], at: 0 };                                   // /api/warn (เฉพาะสถานีเตือนด้วยฝน)
  var popup = null, refreshTimer = null, panelObs = null, protoOK = false;

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function fmt(n, d) { return n == null || !isFinite(n) ? "–" : Number(n).toLocaleString("th-TH", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function ago(t) {
    var m = Math.round((Date.now() - t) / 60000);
    return m < 1 ? "เมื่อสักครู่" : m < 60 ? m + " นาทีที่แล้ว" : m < 48 * 60 ? Math.round(m / 60) + " ชม.ที่แล้ว" : Math.round(m / 1440) + " วันที่แล้ว";
  }
  function thDate(t) { return t == null ? "ไม่ทราบวันที่" : new Date(t).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }); }
  function tms(s) { if (!s) return null; var t = Date.parse(String(s).replace(" ", "T") + "+07:00"); return isFinite(t) ? t : null; }
  function km(a, b) {   // [lon,lat] ระยะใกล้ ๆ
    var x = (b[0] - a[0]) * D2R * Math.cos((a[1] + b[1]) / 2 * D2R), y = (b[1] - a[1]) * D2R;
    return Math.sqrt(x * x + y * y) * 6371.0088;
  }
  function S(i) { return G && G.str[i] || ""; }
  function place(t, a, p) { return [t ? "ต." + t : "", a ? "อ." + a : "", p ? "จ." + p : ""].filter(Boolean).join(" "); }
  function gmaps(lat, lon) { return "https://www.google.com/maps/dir/?api=1&destination=" + lat.toFixed(5) + "," + lon.toFixed(5); }

  function addIcons() {
    var sp = document.getElementById("mdico-sprite");
    if (!sp) return;
    var NS = "http://www.w3.org/2000/svg";
    var add = function (id, body) {
      if (document.getElementById("i-" + id)) return;
      var s = document.createElementNS(NS, "symbol");
      s.setAttribute("id", "i-" + id); s.setAttribute("viewBox", "0 0 24 24");
      s.innerHTML = body;
      sp.appendChild(s);
    };
    add("mountain", '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>');
    add("cloud-rain", '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>');
    add("shield-check", '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>');
    add("history", '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>');
    add("search", '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>');
    add("external-link", '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>');
    add("phone", '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>');
    add("house", '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>');
  }

  /* ================================================================ ไอคอนบนแผนที่ */
  function safeImage() {
    var N = 40, c = document.createElement("canvas"); c.width = c.height = N;
    var g = c.getContext("2d");
    g.beginPath(); g.moveTo(20, 3); g.lineTo(34, 9); g.lineTo(33, 22); g.quadraticCurveTo(30, 32, 20, 37); g.quadraticCurveTo(10, 32, 7, 22); g.lineTo(6, 9); g.closePath();
    g.fillStyle = "#16a34a"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#fff"; g.stroke();
    g.beginPath(); g.moveTo(13, 20); g.lineTo(18, 25); g.lineTo(27, 15); g.lineWidth = 3.4; g.lineCap = "round"; g.lineJoin = "round"; g.stroke();
    return { width: N, height: N, data: g.getImageData(0, 0, N, N).data };
  }
  function monImage() {
    var N = 40, c = document.createElement("canvas"); c.width = c.height = N;
    var g = c.getContext("2d");
    g.beginPath(); g.arc(20, 20, 16, 0, Math.PI * 2); g.fillStyle = "#0e7490"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#fff"; g.stroke();
    g.strokeStyle = "#fff"; g.lineWidth = 2.4; g.lineCap = "round";
    g.beginPath(); g.moveTo(20, 28); g.lineTo(20, 17); g.stroke();
    [6, 10].forEach(function (r) { g.beginPath(); g.arc(20, 17, r, -Math.PI * 0.85, -Math.PI * 0.15); g.stroke(); });
    return { width: N, height: N, data: g.getImageData(0, 0, N, N).data };
  }
  function ensureImages() {
    if (!map.hasImage("sl-safe")) map.addImage("sl-safe", safeImage(), { pixelRatio: 2 });
    if (!map.hasImage("sl-mon")) map.addImage("sl-mon", monImage(), { pixelRatio: 2 });
  }

  /* ================================================================ โหลดข้อมูล */
  function apiList(name) {
    var h = location.hostname, local = h === "localhost" || h === "127.0.0.1" || h === "ratthai-kaona.vercel.app";
    return local ? ["/api/" + name, REMOTE + "/api/" + name] : [REMOTE + "/api/" + name];
  }
  function getJSON(urls) {
    var i = 0;
    var next = function (err) {
      if (i >= urls.length) return Promise.reject(err || new Error("no source"));
      var u = urls[i++];
      return fetch(u, { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }).then(function (j) { if (j && j.error) throw new Error(j.error); return j; }).catch(next);
    };
    return next();
  }
  function loadScript(src) {
    return new Promise(function (ok, bad) {
      var s = document.createElement("script");
      s.src = src; s.async = true; s.onload = ok; s.onerror = function () { bad(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }
  function loadGeo() {
    if (!gLoading) {
      gLoading = (window.BKK_SLIDE_DATA ? Promise.resolve() : loadScript(DATA_URL)).then(function () {
        G = window.BKK_SLIDE_DATA;
        if (!G) throw new Error("no data");
        if (map && visible) addLayers();
        refresh();
        return G;
      }).catch(function (e) { gLoading = null; console.warn("slide data:", e); throw e; });
    }
    return gLoading;
  }
  function loadSafe() {
    if (!safeLoading) {
      safeLoading = loadGeo().then(function () { return window.BKK_SLIDE_SAFE ? null : loadScript(SAFE_URL); }).then(function () {
        SAFE = window.BKK_SLIDE_SAFE || [];
        setGeo("sl-safe", safeGeo());
        return SAFE;
      }).catch(function (e) { safeLoading = null; console.warn("slide safe:", e); throw e; });
    }
    return safeLoading;
  }
  function loadRain() {
    if (R.busy) return;
    R.busy = true;
    getJSON(apiList("slide")).then(function (j) { R.data = j; R.at = Date.now(); R.err = null; })
      .catch(function (e) { R.err = String(e.message || e); })
      .then(function () { R.busy = false; refresh(); });
    getJSON(apiList("warn")).then(function (j) {
      W.st = (j.st || []).filter(function (r) { return r[8] === "rain"; }); W.at = Date.now();
      W.down = !!j.ewsErr && !(j.st || []).length;   // กรมทรัพยากรน้ำไม่ตอบเซิร์ฟเวอร์นอกประเทศ
      refresh();
    }).catch(function () { W.down = true; refresh(); });
  }
  function ensureData() {
    loadGeo();
    if (sub.watch && Date.now() - R.at > 8 * 60000) loadRain();
    if (sub.vil && map && map.getZoom() >= 9.5 && !SAFE) loadSafe();
  }

  /* ================================================================ วิเคราะห์ */
  // หมู่บ้านเสี่ยงในรัศมี r กม. จากจุด
  function villagesNear(lon, lat, r) {
    if (!G) return [];
    var out = [], dLat = r / 111, dLon = r / (111 * Math.cos(lat * D2R));
    G.vil.forEach(function (v, i) {
      if (Math.abs(v[1] - lat) > dLat || Math.abs(v[0] - lon) > dLon) return;
      var d = km([lon, lat], [v[0], v[1]]);
      if (d <= r) out.push({ i: i, d: d });
    });
    return out.sort(function (a, b) { return a.d - b.d; });
  }
  function nearestSafe(lon, lat) {
    if (!SAFE) return null;
    var best = null, bd = Infinity;
    for (var i = 0; i < SAFE.length; i++) {
      var s = SAFE[i];
      if (Math.abs(s[1] - lat) > 0.3 || Math.abs(s[0] - lon) > 0.3) continue;
      var d = km([lon, lat], [s[0], s[1]]);
      if (d < bd) { bd = d; best = { i: i, d: d }; }
    }
    return best;
  }
  var HOT = [];   // สถานีฝน ≥ 100 มม. + หมู่บ้านเสี่ยงรอบ ๆ
  function analyse() {
    HOT = [];
    if (!R.data) return;
    R.data.st.forEach(function (r, i) {
      if (!((r[7] || 0) >= HEAVY)) return;
      HOT.push({ i: i, r: r, vil: villagesNear(r[1], r[0], 10) });
    });
    HOT.sort(function (a, b) { return b.vil.length - a.vil.length || b.r[7] - a.r[7]; });
  }
  function hotVillages() {
    var set = {};
    HOT.forEach(function (h) { h.vil.forEach(function (v) { set[v.i] = 1; }); });
    return Object.keys(set).length;
  }

  /* ================================================================ GeoJSON */
  function feat(type, coords, props) { return { type: "Feature", geometry: { type: type, coordinates: coords }, properties: props }; }
  function fc(f) { return { type: "FeatureCollection", features: f }; }
  function setGeo(id, g) { var s = map && map.getSource(id); if (s) s.setData(g); }
  function perFrom() { var y = new Date().getUTCFullYear(); return opt.per === "10y" ? Date.UTC(y - 10, 0, 1) : opt.per === "5y" ? Date.UTC(y - 5, 0, 1) : -Infinity; }
  function evGeo() {
    if (!G) return fc([]);
    var from = perFrom();
    return fc(G.ev.map(function (e, i) {
      if (e[0] != null && e[0] < from) return null;
      if (e[0] == null && from > -Infinity) return null;
      var dd = e[11] || 0;
      return feat("Point", [e[1], e[2]], { i: i, d: dd, r: dd >= 100 ? 13 : dd >= 10 ? 9.5 : dd > 0 ? 7 : 4.5, l: dd ? "เสียชีวิต " + dd : "" });
    }).filter(Boolean));
  }
  function nasaGeo() {
    if (!G) return fc([]);
    var from = perFrom();
    return fc(G.nasa.map(function (n, i) {
      if (n[0] != null && n[0] < from) return null;
      var dd = n[8] || 0;
      return feat("Point", [n[1], n[2]], { i: i, d: dd, r: dd >= 100 ? 11 : dd >= 10 ? 8 : dd > 0 ? 6 : 3.5 });
    }).filter(Boolean));
  }
  function vilGeo() {
    if (!G) return fc([]);
    var hot = {};
    HOT.forEach(function (h) { h.vil.forEach(function (v) { hot[v.i] = 1; }); });
    return fc(G.vil.map(function (v, i) {
      var d = G.risk[v[7]] || "";
      return feat("Point", [v[0], v[1]], { i: i, k: /แผ่นดินถล่ม/.test(d) ? 1 : 0, h: hot[i] ? 1 : 0, l: "บ้าน" + v[3].replace(/^บ้าน/, "") });
    }));
  }
  function safeGeo() {
    if (!SAFE) return fc([]);
    return fc(SAFE.map(function (s, i) { return feat("Point", [s[0], s[1]], { i: i, l: s[2] }); }));
  }
  function monGeo() { return G ? fc(G.mon.map(function (m, i) { return feat("Point", [m[0], m[1]], { i: i, l: m[2] }); })) : fc([]); }
  function rainGeo() {
    if (!R.data) return fc([]);
    return fc(R.data.st.map(function (r, i) {
      var v = r[7] || 0;
      return feat("Point", [r[1], r[0]], { i: i, v: v, v7: r[8] || 0, h: v >= HEAVY ? 1 : 0, l: v >= HEAVY ? fmt(v, 0) + " มม." : "" });
    }));
  }
  function ewsGeo() {
    return fc(W.st.map(function (r, i) { return feat("Point", [r[3], r[2]], { i: i, lv: r[4] }); }));
  }

  /* ================================================================ ไทล์จากกรมทรัพยากรธรณี */
  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a]; }
  function riskTiles() {
    var uv = [];
    for (var k = opt.minLv; k <= 5; k++) uv.push({ value: String(k), symbol: { type: "esriSFS", style: "esriSFSSolid", color: rgba(LV[k].c, LV[k].a), outline: { type: "esriSLS", style: "esriSLSNull", color: [0, 0, 0, 0], width: 0 } } });
    var dl = [{ id: 0, source: { type: "mapLayer", mapLayerId: 0 }, drawingInfo: { renderer: { type: "uniqueValue", field1: "gridcode", uniqueValueInfos: uv } } }];
    return DMR + "LANDSLIDE_SUSCEPTIBILITY/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&dynamicLayers=" + encodeURIComponent(JSON.stringify(dl)) + "&f=image";
  }
  function scarTiles() {
    var dl = [{ id: 0, source: { type: "mapLayer", mapLayerId: 0 }, drawingInfo: { renderer: { type: "simple", symbol: { type: "esriSMS", style: "esriSMSCircle", color: [150, 75, 20, 220], size: 4, outline: { color: [255, 230, 200, 200], width: 0.6 } } } } }];
    return DMR + "LANDSLIDE_INVENTORY_MAP/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&dynamicLayers=" + encodeURIComponent(JSON.stringify(dl)) + "&f=image";
  }
  // ระดับความอ่อนไหวตรงจุด (ถามเซิร์ฟเวอร์กรมฯ)
  var lvCache = {};
  function riskAt(lon, lat) {
    var k = lon.toFixed(3) + "," + lat.toFixed(3);
    if (lvCache[k]) return lvCache[k];
    var u = DMR + "LANDSLIDE_SUSCEPTIBILITY/MapServer/0/query?geometry=" + encodeURIComponent(JSON.stringify({ x: lon, y: lat })) +
      "&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=gridcode,Level_T,Desc_T&returnGeometry=false&f=json";
    lvCache[k] = fetch(u).then(function (r) { return r.json(); }).then(function (j) {
      var f = j && j.features && j.features[0];
      return f ? { lv: f.attributes.gridcode, t: f.attributes.Level_T, d: f.attributes.Desc_T } : { lv: 0 };
    }).catch(function () { delete lvCache[k]; return null; });
    return lvCache[k];
  }

  /* ================================================================ ความสูงพื้นดิน/ความชัน (AWS Terrarium) */
  var demCache = {};
  function demTile(z, x, y) {
    var k = z + "/" + x + "/" + y;
    if (!demCache[k]) {
      demCache[k] = fetch(TERRARIUM + k + ".png").then(function (r) { if (!r.ok) throw new Error("dem " + r.status); return r.blob(); })
        .then(function (b) { return createImageBitmap(b); })
        .then(function (bm) {
          var c = document.createElement("canvas"); c.width = bm.width; c.height = bm.height;
          var g = c.getContext("2d"); g.drawImage(bm, 0, 0);
          var d = g.getImageData(0, 0, c.width, c.height).data, n = c.width * c.height, h = new Float32Array(n);
          for (var i = 0; i < n; i++) h[i] = d[i * 4] * 256 + d[i * 4 + 1] + d[i * 4 + 2] / 256 - 32768;
          return { w: c.width, h: h };
        });
      demCache[k].catch(function () { delete demCache[k]; });
      var keys = Object.keys(demCache); if (keys.length > 80) delete demCache[keys[0]];
    }
    return demCache[k];
  }
  // ความชัน (องศา) ทุกพิกเซลของไทล์ — สูตร Horn (หน้าต่าง 3×3 ถ่วงน้ำหนัก) แบบเดียวกับโปรแกรม GIS
  // ความสูงต้นทางเป็นเมตรเต็ม ถ้าใช้แค่ 2 จุดข้างเคียงจะเห็นเป็นลายขั้นบันได
  function slopeOf(t, z, ty) {
    var N = t.w, out = new Float32Array(N * N), H = t.h;
    var at = function (x, y) { return H[Math.max(0, Math.min(N - 1, y)) * N + Math.max(0, Math.min(N - 1, x))]; };
    for (var y = 0; y < N; y++) {
      var lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * (ty + (y + 0.5) / N) / Math.pow(2, z)))) / D2R;
      var px = 40075016.686 * Math.cos(lat * D2R) / (N * Math.pow(2, z));
      for (var x = 0; x < N; x++) {
        var a = at(x - 1, y - 1), b = at(x, y - 1), c = at(x + 1, y - 1), d = at(x - 1, y), f = at(x + 1, y), g = at(x - 1, y + 1), hh = at(x, y + 1), i = at(x + 1, y + 1);
        var dx = ((c + 2 * f + i) - (a + 2 * d + g)) / (8 * px), dy = ((g + 2 * hh + i) - (a + 2 * b + c)) / (8 * px);
        out[y * N + x] = Math.atan(Math.sqrt(dx * dx + dy * dy)) / D2R;
      }
    }
    return out;
  }
  function demAt(lon, lat) {
    var z = 12, n = Math.pow(2, z);
    var fx = (lon + 180) / 360 * n, fy = (1 - Math.log(Math.tan(lat * D2R) + 1 / Math.cos(lat * D2R)) / Math.PI) / 2 * n;
    var tx = Math.floor(fx), ty = Math.floor(fy);
    return demTile(z, tx, ty).then(function (t) {
      var px = Math.min(t.w - 1, Math.floor((fx - tx) * t.w)), py = Math.min(t.w - 1, Math.floor((fy - ty) * t.w));
      var sl = slopeOf(t, z, ty);
      return { h: t.h[py * t.w + px], s: sl[py * t.w + px] };
    }).catch(function () { return null; });
  }
  function slopeColor(s) {
    if (s < SLOPE[0][0]) return null;
    var c = s < SLOPE[1][0] ? SLOPE[0][1] : s < SLOPE[2][0] ? SLOPE[1][1] : SLOPE[2][1];
    var n = parseInt(c.slice(1), 16), a = s < SLOPE[1][0] ? 0.2 + (s - 15) / 10 * 0.15 : s < SLOPE[2][0] ? 0.55 : 0.75;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, Math.round(a * 255)];
  }
  function registerProtocol() {
    if (protoOK || !window.maplibregl || !maplibregl.addProtocol) return;
    protoOK = true;
    maplibregl.addProtocol("sltslope", function (params) {
      var m = /sltslope:\/\/(\d+)\/(\d+)\/(\d+)/.exec(params.url);
      if (!m) return Promise.reject(new Error("bad url"));
      var z = +m[1], x = +m[2], y = +m[3];
      return demTile(z, x, y).then(function (t) {
        var sl = slopeOf(t, z, y), N = t.w;
        var c = document.createElement("canvas"); c.width = c.height = N;
        var g = c.getContext("2d"), img = g.createImageData(N, N);
        for (var i = 0; i < N * N; i++) {
          var col = slopeColor(sl[i]);
          if (!col) continue;
          img.data[i * 4] = col[0]; img.data[i * 4 + 1] = col[1]; img.data[i * 4 + 2] = col[2]; img.data[i * 4 + 3] = col[3];
        }
        g.putImageData(img, 0, 0);
        return new Promise(function (ok) { c.toBlob(ok, "image/png"); });
      }).then(function (blob) { return blob.arrayBuffer(); }).then(function (buf) { return { data: buf }; });
    });
  }

  /* ================================================================ ชั้นบนแผนที่ */
  var RASTER = ["sl-hill", "sl-slope", "sl-risk", "sl-scar"];
  var POINTS = ["sl-nasa", "sl-ev", "sl-vil", "sl-vil-hot", "sl-safe", "sl-mon", "sl-ews", "sl-rain", "sl-rain-ring", "sl-ev-lbl", "sl-vil-lbl", "sl-rain-lbl"];
  function beforeId() {
    if (map.getLayer("bkk-3d-world")) return "bkk-3d-world";
    if (map.getLayer("city-buildings-3d")) return "city-buildings-3d";
    return undefined;
  }
  // ภาพพื้นผิว (เงาภูเขา ความชัน ความเสี่ยง) วางใต้ถนนและชื่อสถานที่ ให้ยังอ่านแผนที่ออก
  function roadAnchor() {
    var ls = (map.getStyle() || {}).layers || [];
    for (var i = 0; i < ls.length; i++) if (ls[i]["source-layer"] === "transportation" || ls[i]["source-layer"] === "transportation_name") return ls[i].id;
    return beforeId();
  }
  function layerBefore(id) {
    var list = RASTER.indexOf(id) >= 0 ? RASTER : POINTS;
    for (var j = list.indexOf(id) + 1; j < list.length; j++) if (map.getLayer(list[j])) return list[j];
    return list === RASTER ? roadAnchor() : beforeId();
  }
  function addLayers() {
    if (!map || !map.getStyle()) return;
    ensureImages();
    registerProtocol();
    var src = function (id, data) { if (!map.getSource(id)) map.addSource(id, { type: "geojson", data: data }); };
    var lay = function (spec) { if (!map.getLayer(spec.id)) map.addLayer(spec, layerBefore(spec.id)); };
    var TXT = { "text-font": ["Noto Sans Regular"], "text-size": 11, "text-optional": true };
    var HALO = { "text-color": "#fff", "text-halo-color": "rgba(10,14,22,.92)", "text-halo-width": 1.4 };

    if (!map.getSource("sl-dem")) map.addSource("sl-dem", { type: "raster-dem", tiles: [TERRARIUM + "{z}/{x}/{y}.png"], encoding: "terrarium", tileSize: 256, maxzoom: 12, attribution: "Terrain: AWS Terrain Tiles (SRTM ฯลฯ)" });
    lay({
      id: "sl-hill", type: "hillshade", source: "sl-dem",
      paint: { "hillshade-exaggeration": 0.55, "hillshade-shadow-color": "rgba(0,0,0,.6)", "hillshade-highlight-color": "rgba(255,255,255,.22)", "hillshade-accent-color": "rgba(0,0,0,.25)" }
    });
    if (!map.getSource("sl-slope")) map.addSource("sl-slope", { type: "raster", tiles: ["sltslope://{z}/{x}/{y}"], tileSize: 256, minzoom: 8, maxzoom: 12 });
    lay({ id: "sl-slope", type: "raster", source: "sl-slope", minzoom: 8.5, paint: { "raster-opacity": 0.8, "raster-fade-duration": 0 } });
    if (!map.getSource("sl-risk")) map.addSource("sl-risk", { type: "raster", tiles: [riskTiles()], tileSize: 256, attribution: "ความอ่อนไหวต่อดินถล่ม: กรมทรัพยากรธรณี" });
    lay({ id: "sl-risk", type: "raster", source: "sl-risk", paint: { "raster-opacity": 0.7, "raster-fade-duration": 150 } });
    if (!map.getSource("sl-scar")) map.addSource("sl-scar", { type: "raster", tiles: [scarTiles()], tileSize: 256 });
    lay({ id: "sl-scar", type: "raster", source: "sl-scar", minzoom: 9, paint: { "raster-opacity": 0.95, "raster-fade-duration": 150 } });

    src("sl-nasa", nasaGeo()); src("sl-ev", evGeo()); src("sl-vil", vilGeo()); src("sl-safe", safeGeo()); src("sl-mon", monGeo());
    src("sl-ews", ewsGeo()); src("sl-rain", rainGeo());
    lay({
      id: "sl-nasa", type: "circle", source: "sl-nasa",
      paint: { "circle-color": "rgba(167,139,250,.25)", "circle-stroke-color": "#a78bfa", "circle-stroke-width": 1.2, "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, ["*", ["get", "r"], 0.8], 10, ["*", ["get", "r"], 1.5]] }
    });
    lay({
      id: "sl-ev", type: "circle", source: "sl-ev", layout: { "circle-sort-key": ["get", "d"] },
      paint: {
        "circle-color": ["case", [">", ["get", "d"], 0], "#e11d48", "#f59e0b"], "circle-opacity": 0.85,
        "circle-stroke-color": "rgba(10,14,22,.9)", "circle-stroke-width": 1,
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, ["*", ["get", "r"], 0.75], 10, ["*", ["get", "r"], 1.4]]
      }
    });
    lay({
      id: "sl-vil", type: "circle", source: "sl-vil", minzoom: 6,
      paint: {
        "circle-color": ["case", ["==", ["get", "k"], 1], "#fb923c", "#facc15"], "circle-opacity": 0.8,
        "circle-stroke-color": "rgba(10,14,22,.85)", "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 6, 0.4, 11, 1],
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 1.6, 9, 3.2, 13, 6]
      }
    });
    lay({
      id: "sl-vil-hot", type: "circle", source: "sl-vil", filter: ["==", ["get", "h"], 1],
      paint: { "circle-color": "rgba(0,0,0,0)", "circle-stroke-color": "#ff2d55", "circle-stroke-width": 2, "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 4, 9, 7, 13, 10] }
    });
    lay({
      id: "sl-safe", type: "symbol", source: "sl-safe", minzoom: 10,
      layout: Object.assign({ "icon-image": "sl-safe", "icon-size": ["interpolate", ["linear"], ["zoom"], 10, 0.7, 14, 1], "icon-allow-overlap": true, "text-field": ["step", ["zoom"], "", 12.5, ["get", "l"]], "text-anchor": "top", "text-offset": [0, 0.9], "text-max-width": 10 }, TXT, { "text-size": 10.5 }),
      paint: Object.assign({}, HALO, { "text-color": "#bbf7d0" })
    });
    lay({ id: "sl-mon", type: "symbol", source: "sl-mon", layout: { "icon-image": "sl-mon", "icon-allow-overlap": true, "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.7, 10, 1] } });
    lay({
      id: "sl-ews", type: "circle", source: "sl-ews",
      paint: {
        "circle-color": "rgba(0,0,0,0)", "circle-stroke-width": 2.5, "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 6, 10, 10],
        "circle-stroke-color": ["match", ["get", "lv"], 3, "#e11d48", 2, "#f59e0b", "#22c55e"]
      }
    });
    lay({
      id: "sl-rain", type: "circle", source: "sl-rain",
      paint: {
        "circle-color": ["interpolate", ["linear"], ["get", "v"], 35, "#7dd3fc", 60, "#38bdf8", 100, "#2563eb", 150, "#7c3aed", 250, "#c026d3"],
        "circle-opacity": ["case", [">=", ["get", "v"], 35], 0.85, 0.35],
        "circle-stroke-color": "rgba(10,14,22,.8)", "circle-stroke-width": 0.8,
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, ["interpolate", ["linear"], ["get", "v"], 0, 2, 100, 4.5, 250, 7], 10, ["interpolate", ["linear"], ["get", "v"], 0, 4, 100, 8, 250, 12]]
      }
    });
    lay({
      id: "sl-rain-ring", type: "circle", source: "sl-rain", filter: ["==", ["get", "h"], 1],
      paint: { "circle-color": "rgba(0,0,0,0)", "circle-stroke-color": "#ff2d55", "circle-stroke-width": 2, "circle-stroke-opacity": 0.9, "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 10, 10, 18] }
    });
    lay({
      id: "sl-ev-lbl", type: "symbol", source: "sl-ev", filter: [">=", ["get", "d"], 10],
      layout: Object.assign({ "text-field": ["get", "l"], "text-anchor": "left", "text-offset": [1.1, 0], "symbol-sort-key": ["-", 0, ["get", "d"]] }, TXT), paint: Object.assign({}, HALO, { "text-color": "#fecdd3" })
    });
    lay({ id: "sl-vil-lbl", type: "symbol", source: "sl-vil", minzoom: 11, layout: Object.assign({ "text-field": ["get", "l"], "text-anchor": "top", "text-offset": [0, 0.6], "text-max-width": 9 }, TXT, { "text-size": 10.5 }), paint: HALO });
    lay({
      id: "sl-rain-lbl", type: "symbol", source: "sl-rain", filter: ["==", ["get", "h"], 1],
      layout: Object.assign({ "text-field": ["get", "l"], "text-anchor": "bottom", "text-offset": [0, -1.2] }, TXT, { "text-font": ["Noto Sans Bold"] }), paint: Object.assign({}, HALO, { "text-color": "#bfdbfe" })
    });
    syncLayerVis();
  }
  function syncLayerVis() {
    if (!map) return;
    var set = function (id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); };
    set("sl-hill", visible && sub.slope); set("sl-slope", visible && sub.slope);
    set("sl-risk", visible && sub.risk); set("sl-scar", visible && sub.risk && sub.scar);
    set("sl-ev", visible && sub.hist); set("sl-ev-lbl", visible && sub.hist); set("sl-nasa", visible && sub.hist && sub.nasa);
    ["sl-vil", "sl-safe", "sl-mon", "sl-vil-lbl"].forEach(function (id) { set(id, visible && sub.vil); });
    set("sl-vil-hot", visible && sub.vil && sub.watch);
    ["sl-rain", "sl-rain-ring", "sl-rain-lbl", "sl-ews"].forEach(function (id) { set(id, visible && sub.watch); });
  }
  function refresh() {
    analyse();
    if (map && map.getSource("sl-ev")) {
      setGeo("sl-ev", evGeo()); setGeo("sl-nasa", nasaGeo()); setGeo("sl-vil", vilGeo()); setGeo("sl-mon", monGeo());
      setGeo("sl-rain", rainGeo()); setGeo("sl-ews", ewsGeo());
    }
    renderPanel();
  }

  /* ================================================================ การ์ด */
  function row(a, b) { return b == null || b === "" ? "" : '<div class="sl-row"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function badge(t, c) { return '<span class="sl-badge" style="background:' + c + '">' + t + '</span>'; }
  function link(h, t) { return '<a href="' + h + '" target="_blank" rel="noopener">' + t + ' ' + ico("external-link") + '</a>'; }
  var HOTLINE = ico("phone") + ' ปภ. <b>1784</b> · ศูนย์ปฏิบัติการธรณีพิบัติภัย กรมทรัพยากรธรณี <b>0 2621 9701</b>';
  var SIGNS = '<div class="sl-signs"><b>สัญญาณเตือนดินถล่ม</b> (กรมทรัพยากรธรณี): ฝนตกหนักต่อเนื่อง &gt;100 มม./วัน · น้ำในห้วยขึ้นเร็ว · น้ำเปลี่ยนเป็นสีดินภูเขา · มีเสียงดังผิดปกติจากภูเขาหรือลำห้วย — เห็นสัญญาณให้เตรียมอพยพไปจุดปลอดภัย</div>';
  function lvBadge(lv) { return lv && LV[lv] ? badge("เสี่ยง" + LV[lv].t, LV[lv].c) : ""; }
  function evCard(i) {
    var e = G.ev[i];
    var h = '<div class="sl-pop"><div class="sl-pop-t">' + badge("ดินถล่ม", e[11] ? "#e11d48" : "#f59e0b") + ' <b>' + esc(e[3] || ("อ." + S(e[6]))) + '</b></div>';
    h += '<p class="sl-lead">' + thDate(e[0]) + ' · ' + esc([e[4] ? "บ้าน" + e[4].replace(/^บ้าน/, "") : "", place(S(e[5]), S(e[6]), S(e[7]))].filter(Boolean).join(" ")) + '</p>';
    if (e[10]) h += '<p class="sl-eff">' + esc(e[10]) + '</p>';
    h += row("ผู้เสียชีวิต", e[11] ? fmt(e[11]) + " คน" : "");
    h += row("สูญหาย", e[12] ? fmt(e[12]) + " คน" : "");
    h += row("บาดเจ็บ", e[13] ? fmt(e[13]) + " คน" : "");
    h += row("ลักษณะการเคลื่อนตัว", esc(e[8]));
    h += row("ชนิดหินบริเวณนั้น", esc(e[9]));
    if (e[15]) h += '<p class="sl-note">วันที่แก้ตามรายงานของจังหวัดเพชรบูรณ์และสื่อ (ข้อมูลกรมฯ ระบุ ' + thDate(e[15]) + ')</p>';
    return h + '<div class="sl-pop-f">ข้อมูล: เหตุการณ์ธรณีพิบัติภัย กรมทรัพยากรธรณี' + (e[14] ? " · อ้างอิง " + esc(e[14]) : "") + '</div></div>';
  }
  var CAT = { landslide: "ดินถล่ม", mudslide: "ดินโคลนไหล", rock_fall: "หินร่วง", debris_flow: "ธารเศษหินดิน", complex: "หลายแบบรวมกัน", riverbank_collapse: "ตลิ่งพัง", snow_avalanche: "หิมะถล่ม", lahar: "โคลนภูเขาไฟ", creep: "ดินคืบ", translational_slide: "ดินเลื่อนไถลตามระนาบ", other: "อื่น ๆ", unknown: "ไม่ทราบ" };
  var TRIG = { downpour: "ฝนตกหนัก", rain: "ฝน", monsoon: "มรสุม", tropical_cyclone: "พายุหมุนเขตร้อน", continuous_rain: "ฝนตกต่อเนื่อง", earthquake: "แผ่นดินไหว", construction: "การก่อสร้าง", mining: "เหมือง", flooding: "น้ำท่วม", snowfall_snowmelt: "หิมะละลาย", other: "อื่น ๆ", unknown: "ไม่ทราบ", no_apparent_trigger: "ไม่พบสาเหตุชัดเจน", dam_embankment_collapse: "คันดิน/เขื่อนพัง", leaking_pipe: "ท่อรั่ว", freeze_thaw: "น้ำแข็งละลาย", vibration: "การสั่นสะเทือน" };
  var SIZE = { small: "เล็ก", medium: "กลาง", large: "ใหญ่", very_large: "ใหญ่มาก", catastrophic: "หายนะ", unknown: "ไม่ทราบ" };
  function nasaCard(i) {
    var n = G.nasa[i];
    var h = '<div class="sl-pop"><div class="sl-pop-t">' + badge("ดินถล่ม · " + esc(n[4]), "#8b5cf6") + ' <b>' + esc(n[3]) + '</b></div>';
    h += '<p class="sl-lead">' + thDate(n[0]) + '</p>';
    h += row("ผู้เสียชีวิต", n[8] != null ? fmt(n[8]) + " คน" : "ไม่มีรายงาน");
    h += row("บาดเจ็บ", n[9] ? fmt(n[9]) + " คน" : "");
    h += row("ชนิด", esc(CAT[n[5]] || n[5]));
    h += row("สาเหตุ", esc(TRIG[n[6]] || n[6]));
    h += row("ขนาด", esc(SIZE[n[7]] || n[7]));
    h += row("ความแม่นตำแหน่ง", n[10] ? "±" + esc(n[10]) : "");
    return h + '<div class="sl-pop-f">ข้อมูล: NASA Global Landslide Catalog' + (n[11] ? " · ที่มาข่าว " + esc(n[11]) : "") + (n[12] ? " · " + link(n[12], "ต้นฉบับ") : "") + '</div></div>';
  }
  function vilCard(i, ll) {
    var v = G.vil[i], id = "slv" + Date.now();
    var h = '<div class="sl-pop"><div class="sl-pop-t">' + badge("หมู่บ้านเสี่ยง", "#fb923c") + ' <b>บ้าน' + esc(v[3].replace(/^บ้าน/, "")) + (v[2] ? " ม." + esc(v[2]) : "") + '</b></div>';
    h += '<p class="sl-lead">' + esc(place(S(v[4]), S(v[5]), S(v[6]))) + '</p>';
    h += row("เสี่ยงภัย", esc(G.risk[v[7]]));
    h += row("ปีที่สำรวจ", v[8] ? "พ.ศ. " + v[8] : "");
    h += '<div id="' + id + '" class="sl-live">กำลังหาจุดปลอดภัยและระดับความอ่อนไหว…</div>';
    h += SIGNS;
    setTimeout(function () { fillSpot(id, v[0], v[1], true); }, 0);
    return h + '<div class="sl-pop-f">ข้อมูล: หมู่บ้านเสี่ยงภัยแผ่นดินถล่ม กรมทรัพยากรธรณี<br>' + HOTLINE + '</div></div>';
  }
  function safeCard(i) {
    var s = SAFE[i];
    var h = '<div class="sl-pop"><div class="sl-pop-t">' + badge("จุดปลอดภัย", "#16a34a") + ' <b>' + esc(s[2]) + '</b></div>';
    h += '<p class="sl-lead">บ้าน' + esc(String(s[4]).replace(/^บ้าน/, "")) + (s[3] ? " ม." + esc(s[3]) : "") + ' ' + esc(place(S(s[5]), S(s[6]), S(s[7]))) + '</p>';
    h += '<p class="sl-note">ตำแหน่งปลอดภัยจากแผ่นดินถล่มที่กรมทรัพยากรธรณีกำหนดร่วมกับชุมชน ใช้เป็นที่อพยพเมื่อฝนตกหนักหรือเห็นสัญญาณเตือน</p>';
    return h + '<div class="sl-pop-f">' + link(gmaps(s[1], s[0]), "นำทางด้วย Google Maps") + '<br>' + HOTLINE + '</div></div>';
  }
  function monCard(i) {
    var m = G.mon[i];
    var h = '<div class="sl-pop"><div class="sl-pop-t">' + badge("สถานีเฝ้าระวัง", "#0e7490") + ' <b>' + esc(m[2]) + '</b></div>';
    h += '<p class="sl-lead">บ้าน' + esc(String(m[3]).replace(/^บ้าน/, "")) + ' ' + esc(place(S(m[4]), S(m[5]), S(m[6]))) + '</p>';
    h += row("ติดตั้ง", m[7] ? "พ.ศ. " + esc(m[7]) : "");
    return h + '<p class="sl-note">สถานีตรวจวัดการเคลื่อนตัวของลาดเขาของกรมทรัพยากรธรณี — ข้อมูลตรวจวัดไม่ได้เปิดสาธารณะ</p><div class="sl-pop-f">ข้อมูล: สถานีเฝ้าระวังแผ่นดินถล่ม กรมทรัพยากรธรณี</div></div>';
  }
  function rainCard(i) {
    var r = R.data.st[i], id = "slr" + Date.now(), over = (r[7] || 0) >= HEAVY;
    var h = '<div class="sl-pop"><div class="sl-pop-t">' + badge(ico("cloud-rain") + " ฝน", over ? "#2563eb" : "#0284c7") + ' <b>' + esc(r[2]) + '</b></div>';
    h += '<p class="sl-lead">' + esc(place(r[3], r[4], r[5])) + '</p>';
    h += row("ฝน 24 ชม.", r[7] != null ? fmt(r[7], 1) + " มม." + (over ? ' <span class="sl-over">เกิน 100 มม.</span>' : "") : "ไม่รายงาน");
    h += row("เวลาวัด", r[6] ? esc(r[6]) + " น." : "");
    h += row("ฝนสะสม 7 วัน", r[8] != null ? fmt(r[8], 1) + " มม." + (r[9] ? " (" + esc(r[9]) + ")" : "") : "");
    h += row("หน่วยงาน", esc(r[10]));
    var nv = villagesNear(r[1], r[0], 10);
    h += row("หมู่บ้านเสี่ยงดินถล่มในรัศมี 10 กม.", fmt(nv.length) + " แห่ง");
    if (nv.length) h += '<div class="sl-vl">' + nv.slice(0, 8).map(function (x) { var v = G.vil[x.i]; return '<span>บ้าน' + esc(v[3].replace(/^บ้าน/, "")) + ' <small>' + fmt(x.d, 1) + ' กม.</small></span>'; }).join("") + '</div>';
    h += '<div id="' + id + '" class="sl-live">กำลังดูระดับความอ่อนไหวตรงสถานี…</div>';
    setTimeout(function () { fillSpot(id, r[1], r[0], false); }, 0);
    if (over) h += '<p class="sl-note"><b>คำนวณจากปริมาณฝน ไม่ใช่ประกาศเตือนภัยทางการ</b> — เกณฑ์ 100 มม./วัน ตามที่กรมทรัพยากรธรณีระบุว่าเสี่ยงเกิดดินถล่ม</p>';
    return h + '<div class="sl-pop-f">ข้อมูลฝน: คลังข้อมูลน้ำแห่งชาติ (thaiwater.net)<br>' + HOTLINE + '</div></div>';
  }
  function ewsCard(i) {
    var r = W.st[i], c = r[4] === 3 ? "#e11d48" : r[4] === 2 ? "#f59e0b" : "#16a34a", t = r[4] === 3 ? "อพยพ" : r[4] === 2 ? "เตือนภัย" : "เฝ้าระวัง";
    var h = '<div class="sl-pop"><div class="sl-pop-t">' + badge(t, c) + ' <b>' + esc(r[1]) + '</b></div>';
    h += '<p class="sl-lead">สถานีเตือนภัยล่วงหน้า กรมทรัพยากรน้ำ แจ้ง <b style="color:' + c + '">' + t + '</b> จากปริมาณฝน' + (tms(r[11]) ? " · " + ago(tms(r[11])) : "") + '</p>';
    h += row("ที่ตั้ง", esc(place(r[5], r[6], r[7])));
    h += row("ฝนสะสม 12 ชม.", r[9] != null ? fmt(r[9], 1) + " มม." : "");
    if (r[12] && r[12].length) h += '<div class="sl-vl">' + r[12].slice(0, 10).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join("") + '</div>';
    return h + '<p class="sl-note">ระบบนี้เตือนน้ำป่าไหลหลาก-ดินโคลนถล่มรายหมู่บ้าน ดูธงทั้งหมดได้ที่ชั้น "ธงเตือนภัย"</p><div class="sl-pop-f">' + HOTLINE + '</div></div>';
  }
  // เช็กจุด: ระดับความอ่อนไหว (กรมฯ) + ความสูง/ความชัน (DEM) + หมู่บ้านเสี่ยงและจุดปลอดภัยใกล้สุด
  function fillSpot(id, lon, lat, withSafe) {
    var jobs = [riskAt(lon, lat), demAt(lon, lat), withSafe ? loadSafe().catch(function () { return null; }) : Promise.resolve()];
    Promise.all(jobs).then(function (r) {
      var el = document.getElementById(id);
      if (!el) return;
      var h = "";
      var rk = r[0];
      h += row("ความอ่อนไหวต่อดินถล่ม", rk == null ? "ถามเซิร์ฟเวอร์กรมฯ ไม่สำเร็จ" : rk.lv ? lvBadge(rk.lv) : "ไม่อยู่ในพื้นที่ที่กรมฯ ประเมิน");
      if (r[1]) { h += row("ความสูงพื้นดิน (ประมาณ)", fmt(r[1].h, 0) + " ม."); h += row("ความชัน (ประมาณ)", fmt(r[1].s, 0) + "°" + (r[1].s >= 35 ? " · ชันมาก" : r[1].s >= 25 ? " · ชัน" : r[1].s >= 15 ? " · ปานกลาง" : " · ค่อนข้างราบ")); }
      if (withSafe) {
        var ns = nearestSafe(lon, lat);
        if (ns) { var s = SAFE[ns.i]; h += row("จุดปลอดภัยใกล้สุด", esc(s[2]) + " · " + fmt(ns.d, 1) + " กม."); h += '<div class="sl-go">' + link(gmaps(s[1], s[0]), "นำทางไปจุดปลอดภัย") + '</div>'; }
        else if (SAFE) h += row("จุดปลอดภัยใกล้สุด", "ไม่มีในรัศมี ~30 กม.");
      }
      el.innerHTML = h;
    });
  }
  function spotCard(ll) {
    var id = "sls" + Date.now();
    var nv = villagesNear(ll.lng, ll.lat, 5);
    var h = '<div class="sl-pop"><div class="sl-pop-t">' + badge(ico("mountain") + " เช็กจุดนี้", "#475569") + ' <b>' + ll.lat.toFixed(4) + ', ' + ll.lng.toFixed(4) + '</b></div>';
    h += '<div id="' + id + '" class="sl-live">กำลังถามระดับความอ่อนไหวจากกรมทรัพยากรธรณี…</div>';
    h += row("หมู่บ้านเสี่ยงในรัศมี 5 กม.", fmt(nv.length) + " แห่ง");
    setTimeout(function () { fillSpot(id, ll.lng, ll.lat, true); }, 0);
    return h + '<p class="sl-note">ระดับความอ่อนไหวเป็นแผนที่ประเมินระดับภูมิภาค (กริด ~1 กม.) ความสูง/ความชันจากแบบจำลองความสูงเชิงเลข ~30–60 ม. — ใช้ดูภาพรวม ไม่ใช่ผลสำรวจรายแปลง</p></div>';
  }
  function openPopup(lngLat, html) {
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ closeButton: true, maxWidth: "330px", className: "sl-popup", offset: 12 }).setLngLat(lngLat).setHTML(html).addTo(map);
  }
  function bindHandlers() {
    if (handlersBound) return;
    handlersBound = true;
    var ORDER = ["sl-safe", "sl-mon", "sl-ews", "sl-rain", "sl-ev", "sl-vil", "sl-nasa"];
    var hits = function (pt) {
      if (!visible) return [];
      var ids = ORDER.filter(function (id) { return map.getLayer(id) && map.getLayoutProperty(id, "visibility") !== "none"; });
      if (!ids.length) return [];
      return map.queryRenderedFeatures([[pt.x - 5, pt.y - 5], [pt.x + 5, pt.y + 5]], { layers: ids });
    };
    map.on("click", function (e) {
      if (!visible) return;
      var fs = hits(e.point);
      for (var k = 0; k < ORDER.length; k++) {
        var f = null;
        for (var j = 0; j < fs.length; j++) if (fs[j].layer.id === ORDER[k]) { f = fs[j]; break; }
        if (!f) continue;
        var i = f.properties.i, ll = f.geometry.coordinates.slice();
        if (ORDER[k] === "sl-safe") return openPopup(ll, safeCard(i));
        if (ORDER[k] === "sl-mon") return openPopup(ll, monCard(i));
        if (ORDER[k] === "sl-ews") return openPopup(ll, ewsCard(i));
        if (ORDER[k] === "sl-rain") return openPopup(ll, rainCard(i));
        if (ORDER[k] === "sl-ev") return openPopup(ll, evCard(i));
        if (ORDER[k] === "sl-vil") return openPopup(ll, vilCard(i, ll));
        if (ORDER[k] === "sl-nasa") return openPopup(ll, nasaCard(i));
      }
      // ไม่โดนหมุดของชั้นนี้ → เช็กจุด (เฉพาะตอนเปิดพื้นที่อ่อนไหว/ความชัน และไม่ได้กดโดนของชั้นอื่น)
      if (!(sub.risk || sub.slope) || map.getZoom() < 7) return;
      var other = map.queryRenderedFeatures([[e.point.x - 3, e.point.y - 3], [e.point.x + 3, e.point.y + 3]]).some(function (f) { return f.source !== "openmaptiles" && f.layer.id.indexOf("sl-") !== 0; });
      if (other) return;
      // รอให้ตัวจัดการคลิกของชั้นอื่นทำงานครบก่อน (ป๊อปอัปเก่าปิดตัวเองไปแล้ว) — ถ้ามีชั้นไหนเปิดการ์ดในคลิกนี้ ไม่ต้องซ้อน
      var ll = e.lngLat;
      setTimeout(function () {
        if (document.querySelector(".maplibregl-popup:not(.sl-popup)")) return;
        openPopup(ll, spotCard(ll));
      }, 0);
    });
    var hov = false;
    map.on("mousemove", function (e) {
      if (!visible) return;
      var h = hits(e.point).length > 0;
      if (h !== hov) { hov = h; map.getCanvas().style.cursor = h ? "pointer" : ""; }
    });
    map.on("moveend", function () { if (visible && sub.vil && map.getZoom() >= 9.5 && !SAFE) loadSafe(); });
  }
  function flyTo(ll, z, html) {
    map.flyTo({ center: ll, zoom: Math.max(map.getZoom(), z), duration: 1500, essential: true });
    map.once("moveend", function () { openPopup(ll, html()); });
  }

  /* ================================================================ แผงควบคุม */
  var CSS = [
    "#slidePanel{position:absolute;z-index:44;right:14px;bottom:40px;width:330px;max-width:calc(100% - 28px);max-height:calc(100% - 120px);overflow:auto;display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.5}",
    "#slidePanel.open{display:block;animation:slIn .22s ease}@keyframes slIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",
    ".sl-ph{display:flex;align-items:center;gap:8px;padding:11px 12px 6px 14px;font-weight:800;font-size:13.5px;position:sticky;top:0;background:var(--card-bg);z-index:1}",
    ".sl-ph .sl-ib{margin-left:auto}.sl-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".sl-ib .mdico{width:13px;height:13px}.sl-ph>.mdico{color:#fb923c}",
    "#slidePanel.min .sl-body{display:none}",
    ".sl-body{padding:0 14px 12px}",
    ".sl-sum{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:2px 0 4px}",
    ".sl-sum div{border-radius:10px;padding:5px 7px;border:1px solid var(--card-border);background:rgba(127,127,127,.08);min-width:0}",
    ".sl-sum b{display:block;font-size:15.5px;font-variant-numeric:tabular-nums;line-height:1.2;white-space:nowrap}.sl-sum small{opacity:.72;font-size:10px;display:block;line-height:1.3}",
    ".sl-meta{font-size:10.5px;opacity:.68;margin:0 0 6px}",
    ".sl-sec{border-top:1px solid var(--card-border);padding:8px 0 6px}",
    ".sl-h{font-weight:800;display:flex;align-items:center;gap:6px;margin-bottom:5px}.sl-h small{margin-left:auto;font-weight:500;opacity:.65}.sl-h .mdico{width:13px;height:13px}",
    ".sl-h label{display:flex;align-items:center;gap:6px;cursor:pointer}.sl-h input{accent-color:var(--accent);margin:0}",
    ".sl-chips{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 5px;align-items:center}.sl-chips>span{font-size:10.5px;opacity:.7;margin-right:2px}",
    ".sl-chip{border:1px solid var(--card-border);background:rgba(127,127,127,.08);color:inherit;font:inherit;font-size:11px;border-radius:999px;padding:2px 9px;cursor:pointer}",
    ".sl-chip.on{background:var(--accent);border-color:var(--accent);color:#061018;font-weight:700}",
    ".sl-list{display:flex;flex-direction:column;gap:3px;max-height:200px;overflow:auto}",
    ".sl-it{display:flex;align-items:center;gap:8px;border:0;background:rgba(127,127,127,.07);border-radius:8px;padding:5px 8px;color:inherit;font:inherit;font-size:12px;text-align:left;cursor:pointer}",
    ".sl-it:hover{background:var(--accent-soft)}.sl-it span{flex:1;min-width:0}.sl-it span b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sl-it span small{opacity:.65;display:block;font-size:10.5px}",
    ".sl-it em{font-style:normal;font-size:10.5px;opacity:.8;white-space:nowrap;text-align:right}",
    ".sl-n{flex:none;min-width:38px;text-align:center;border-radius:7px;padding:1px 4px;font-size:11px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums}",
    ".sl-leg{display:flex;flex-wrap:wrap;gap:3px 9px;font-size:10.5px;margin:3px 0}.sl-leg span{display:inline-flex;align-items:center;gap:4px}",
    ".sl-leg i{width:10px;height:10px;border-radius:3px;display:inline-block;flex:none}.sl-leg i.c{border-radius:50%}",
    ".sl-note{font-size:10.5px;opacity:.72;margin:4px 0}",
    ".sl-search{display:flex;align-items:center;gap:6px;border:1px solid var(--card-border);border-radius:9px;padding:3px 8px;margin:4px 0}.sl-search input{flex:1;border:0;background:transparent;color:inherit;font:inherit;font-size:12px;outline:none;min-width:0}.sl-search .mdico{width:13px;height:13px;opacity:.6}",
    ".sl-signs{margin:8px 0 2px;padding:6px 8px;border-radius:8px;background:rgba(251,146,60,.12);border:1px solid rgba(251,146,60,.4);font-size:11px;line-height:1.55}",
    ".sl-src{margin:8px 0 0;font-size:10px;opacity:.62;line-height:1.5}",
    ".sl-warn{color:#f59f0b}",
    ".sl-popup .maplibregl-popup-content{background:var(--card-bg);color:var(--text-main);border:1px solid var(--card-border);border-radius:12px;padding:11px 13px 9px;box-shadow:0 10px 30px rgba(0,0,0,.3);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);max-height:70vh;overflow:auto}",
    ".sl-popup .maplibregl-popup-tip{display:none}.sl-popup .maplibregl-popup-close-button{color:var(--text-muted);font-size:17px;right:4px;top:3px}",
    ".sl-pop{font-size:12px;line-height:1.5;min-width:250px}.sl-pop-t{margin:0 16px 5px 0;font-size:13px;line-height:1.45}",
    ".sl-lead{margin:0 0 6px;font-size:12px;opacity:.9}.sl-eff{margin:0 0 6px;font-size:12px;padding:5px 8px;border-radius:8px;background:rgba(127,127,127,.1)}",
    ".sl-row{display:flex;gap:10px;justify-content:space-between;padding:1.5px 0}.sl-row span{opacity:.7}.sl-row b{text-align:right;font-weight:600}",
    ".sl-badge{display:inline-flex;align-items:center;gap:3px;color:#fff;font-size:10.5px;font-weight:800;border-radius:6px;padding:1px 6px;vertical-align:1px;white-space:nowrap}.sl-badge .mdico{width:11px;height:11px}",
    ".sl-over{color:#fff;background:#e11d48;border-radius:5px;padding:0 5px;font-size:10.5px;margin-left:4px}",
    ".sl-live{margin:5px 0;padding:5px 8px;border-radius:8px;border:1px dashed var(--card-border);font-size:11.5px}",
    ".sl-go{margin:3px 0 0;font-size:11.5px}.sl-go a,.sl-pop-f a{color:var(--accent);font-weight:700;text-decoration:none}.sl-go .mdico,.sl-pop-f .mdico{width:11px;height:11px;vertical-align:-1px}",
    ".sl-vl{display:flex;flex-wrap:wrap;gap:3px 4px;font-size:11px;margin:3px 0}.sl-vl span{background:rgba(127,127,127,.12);border-radius:6px;padding:1px 6px}.sl-vl small{opacity:.65}",
    ".sl-pop-f{margin-top:7px;padding-top:6px;border-top:1px solid var(--card-border);font-size:10.5px;opacity:.82}",
    "@media (max-width:760px){#slidePanel{bottom:86px;right:14px!important;left:14px;width:auto;max-height:42vh}}"
  ].join("");

  function chip(g, v, label, on) { return '<button type="button" class="sl-chip' + (on ? " on" : "") + '" data-g="' + g + '" data-v="' + v + '">' + label + '</button>'; }
  function chk(k, label, extra) { return '<label><input type="checkbox" data-s="' + k + '"' + (sub[k] ? " checked" : "") + '>' + label + '</label>' + (extra ? '<small>' + extra + '</small>' : ""); }
  function renderPanel() {
    var p = $("#slidePanel");
    if (!p || !visible) return;
    var body = p.querySelector(".sl-body"), h = "";
    var nHeavy = R.data ? R.data.st.filter(function (r) { return (r[7] || 0) >= HEAVY; }).length : null;
    var dead = G ? G.ev.reduce(function (s, e) { return s + (e[11] || 0); }, 0) : null;
    h += '<div class="sl-sum">' +
      '<div><b>' + (nHeavy == null ? "–" : fmt(nHeavy)) + '</b><small>สถานีฝน &gt;100 มม. ตอนนี้</small></div>' +
      '<div><b>' + (G && R.data ? fmt(hotVillages()) : "–") + '</b><small>หมู่บ้านเสี่ยงใกล้ฝนหนัก</small></div>' +
      '<div><b>' + (G ? fmt(G.ev.length) : "–") + '</b><small>เหตุในไทย (กรมฯ)</small></div>' +
      '<div><b>' + (dead == null ? "–" : fmt(dead)) + '</b><small>เสียชีวิตรวม</small></div></div>';
    h += '<p class="sl-meta">' + (R.err ? '<span class="sl-warn">โหลดข้อมูลฝนไม่สำเร็จ</span>' : R.data ? "ฝนอัปเดต " + ago(R.at) + " · สถานีรายงานฝน " + fmt(R.data.n24) : "กำลังโหลดข้อมูลฝน…") + (G ? "" : " · กำลังโหลดข้อมูลกรมทรัพยากรธรณี…") + '</p>';

    // เฝ้าระวังตอนนี้
    h += '<div class="sl-sec"><div class="sl-h">' + chk("watch", ico("cloud-rain") + " เฝ้าระวังช่วงฝนตก", W.st.length ? "สถานีเตือนจากฝน " + W.st.length : "") + '</div>';
    if (HOT.length) {
      h += '<div class="sl-list">' + HOT.slice(0, 30).map(function (x) {
        var r = x.r;
        return '<button type="button" class="sl-it" data-k="rain" data-i="' + x.i + '"><b class="sl-n" style="background:#2563eb">' + fmt(r[7], 0) + '</b><span><b>' + esc(r[2]) + '</b><small>' + esc(place("", r[4], r[5])) +
          (r[8] != null ? " · สะสม 7 วัน " + fmt(r[8], 0) + " มม." : "") + '</small></span><em>' + (x.vil.length ? x.vil.length + " หมู่บ้าน<br>เสี่ยงใน 10 กม." : "") + '</em></button>';
      }).join("") + '</div>';
    } else if (R.data) h += '<p class="sl-note">ตอนนี้ไม่มีสถานีใดฝนเกิน 100 มม. ใน 24 ชม.</p>';
    h += '<div class="sl-leg"><span><i class="c" style="background:#38bdf8"></i>ฝน 24 ชม.</span><span><i class="c" style="border:2px solid #ff2d55"></i>เกิน 100 มม.</span><span><i class="c" style="border:2px solid #f59e0b"></i>สถานีเตือนภัย (กรมทรัพยากรน้ำ)</span></div>';
    h += '<p class="sl-note">วงแดง = ฝนเกิน 100 มม./วัน ตามเกณฑ์กรมทรัพยากรธรณี และหมู่บ้านเสี่ยงในรัศมี 10 กม. — <b>คำนวณเอง ไม่ใช่ประกาศทางการ</b> ติดตามประกาศจากกรมทรัพยากรธรณีและ ปภ.</p>';
    if (W.down) h += '<p class="sl-note sl-warn">สถานีเตือนภัยของกรมทรัพยากรน้ำดึงไม่ได้ (กรมฯ ไม่เปิดให้ดึงจากเซิร์ฟเวอร์นอกประเทศ) — <b>ไม่ได้แปลว่าไม่มีการเตือนภัย</b> ดูธงล่าสุดที่ <a href="https://ews.dwr.go.th/ews/" target="_blank" rel="noopener" style="color:var(--accent);font-weight:700">ews.dwr.go.th</a></p>';
    h += '</div>';

    // พื้นที่อ่อนไหว
    h += '<div class="sl-sec"><div class="sl-h">' + chk("risk", '<i style="width:12px;height:12px;border-radius:3px;background:linear-gradient(90deg,#fdd835,#fb8c00,#e53935);display:inline-block"></i> พื้นที่อ่อนไหวต่อดินถล่ม') + '</div>';
    h += '<div class="sl-chips"><span>แสดงตั้งแต่ระดับ</span>' + [1, 3, 4, 5].map(function (k) { return chip("minLv", k, LV[k].t, opt.minLv === k); }).join("") + '</div>';
    h += '<div class="sl-leg">' + [1, 2, 3, 4, 5].map(function (k) { return '<span style="opacity:' + (k >= opt.minLv ? 1 : 0.35) + '"><i style="background:' + LV[k].c + '"></i>' + LV[k].t + '</span>'; }).join("") + '</div>';
    h += '<div class="sl-h" style="font-weight:600">' + chk("scar", '<i class="c" style="width:8px;height:8px;border-radius:50%;background:#96501a;display:inline-block"></i> ร่องรอยดินถล่มเก่า (ซูม 9 ขึ้นไป)', "75,881 จุด") + '</div>';
    h += '<p class="sl-note">กดตรงไหนก็ได้บนแผนที่ (ซูม 7 ขึ้นไป) เพื่อเช็กระดับความอ่อนไหว ความชัน และจุดปลอดภัยใกล้สุด</p></div>';

    // หมู่บ้านเสี่ยง
    h += '<div class="sl-sec"><div class="sl-h">' + chk("vil", ico("house") + " หมู่บ้านเสี่ยง & จุดปลอดภัย", G ? fmt(G.vil.length) + " หมู่บ้าน" : "") + '</div>';
    h += '<div class="sl-search">' + ico("search") + '<input type="search" data-a="q" placeholder="ค้นหาหมู่บ้าน ตำบล อำเภอ จังหวัด" value="' + esc(opt.q) + '"></div><div id="slQ"></div>';
    h += '<div class="sl-leg"><span><i class="c" style="background:#fb923c"></i>เสี่ยงแผ่นดินถล่ม</span><span><i class="c" style="background:#facc15"></i>ดินไหล/หินร่วง</span><span>' + ico("shield-check") + ' จุดปลอดภัย (ซูม 10+)</span><span><i class="c" style="background:#0e7490"></i>สถานีเฝ้าระวัง</span></div></div>';

    // เหตุในอดีต
    h += '<div class="sl-sec"><div class="sl-h">' + chk("hist", ico("history") + " เหตุดินถล่มในอดีต") + '</div>';
    h += '<div class="sl-chips"><span>ช่วง</span>' + chip("per", "all", "ทั้งหมด (2531–)", opt.per === "all") + chip("per", "10y", "10 ปี", opt.per === "10y") + chip("per", "5y", "5 ปี", opt.per === "5y") +
      '<span style="margin-left:auto"></span>' + chip("list", "dead", "ร้ายแรงสุด", opt.list === "dead") + chip("list", "new", "ล่าสุด", opt.list === "new") + '</div>';
    if (G) {
      var from = perFrom();
      var L = G.ev.map(function (e, i) { return { e: e, i: i }; }).filter(function (x) { return from === -Infinity || (x.e[0] != null && x.e[0] >= from); });
      if (opt.list === "dead") L = L.filter(function (x) { return x.e[11]; }).sort(function (a, b) { return b.e[11] - a.e[11]; });
      h += '<div class="sl-list">' + L.slice(0, 40).map(function (x) {
        var e = x.e;
        return '<button type="button" class="sl-it" data-k="ev" data-i="' + x.i + '"><b class="sl-n" style="background:' + (e[11] ? "#e11d48" : "#b45309") + '">' + (e[11] ? fmt(e[11]) : "–") + '</b><span><b>' + esc(e[3] || ("อ." + S(e[6]))) + '</b><small>' + esc(place("", S(e[6]), S(e[7]))) + '</small></span><em>' + thDate(e[0]) + '</em></button>';
      }).join("") + '</div>';
      h += '<p class="sl-note">ตัวเลขในป้าย = ผู้เสียชีวิตตามบันทึกของกรมฯ · วงแดง = มีผู้เสียชีวิต · วงส้ม = เสียหายแต่ไม่มีผู้เสียชีวิต</p>';
    }
    h += '<div class="sl-h" style="font-weight:600">' + chk("nasa", '<i style="width:9px;height:9px;border-radius:50%;border:1.5px solid #a78bfa;display:inline-block"></i> ประเทศเพื่อนบ้าน (NASA 2550–2559)', G ? fmt(G.nasa.length) + " เหตุ" : "") + '</div></div>';

    // ภูเขา/ความชัน
    h += '<div class="sl-sec"><div class="sl-h">' + chk("slope", ico("mountain") + " ภูเขา & ความชัน") + '</div>' +
      '<div class="sl-leg"><span><i style="background:' + SLOPE[0][1] + '"></i>15–25°</span><span><i style="background:' + SLOPE[1][1] + '"></i>25–35°</span><span><i style="background:' + SLOPE[2][1] + '"></i>&gt;35°</span></div>' +
      '<p class="sl-note">เงาภูเขาเห็นทุกระดับซูม · สีความชันเห็นเมื่อซูม 9 ขึ้นไป — ลาดชันมากร่วมกับฝนตกหนักคือจุดที่ดินถล่มง่าย</p></div>';

    h += SIGNS;
    h += '<p class="sl-src">กรมทรัพยากรธรณี: พื้นที่อ่อนไหว ร่องรอยดินถล่ม เหตุการณ์ธรณีพิบัติภัย หมู่บ้านเสี่ยง จุดปลอดภัย สถานีเฝ้าระวัง (' + '<a href="' + DMR_DATA + '" target="_blank" rel="noopener">CC BY</a>) · ฝน: thaiwater.net (สสน.) · สถานีเตือนภัย: กรมทรัพยากรน้ำ · ต่างประเทศ: NASA Global Landslide Catalog · ความสูงพื้นดิน: AWS Terrain Tiles<br>' + HOTLINE + '</p>';
    var sc = body.querySelectorAll(".sl-list"), tops = [].map.call(sc, function (x) { return x.scrollTop; });
    var q = body.querySelector('[data-a="q"]'), focused = q && document.activeElement === q, caret = focused ? q.selectionStart : 0;
    body.innerHTML = h;
    [].forEach.call(body.querySelectorAll(".sl-list"), function (x, k) { x.scrollTop = tops[k] || 0; });
    renderSearch();
    if (focused) { var nq = body.querySelector('[data-a="q"]'); nq.focus(); try { nq.setSelectionRange(caret, caret); } catch (e) { } }
  }
  function renderSearch() {
    var box = $("#slQ");
    if (!box) return;
    var q = opt.q.trim().replace(/^บ้าน/, "");
    if (!G || q.length < 2) { box.innerHTML = ""; return; }
    var out = [];
    for (var i = 0; i < G.vil.length && out.length < 25; i++) {
      var v = G.vil[i];
      if ((v[3] + " " + S(v[4]) + " " + S(v[5]) + " " + S(v[6])).indexOf(q) >= 0) out.push(i);
    }
    box.innerHTML = out.length ? '<div class="sl-list">' + out.map(function (i) {
      var v = G.vil[i];
      return '<button type="button" class="sl-it" data-k="vil" data-i="' + i + '"><span><b>บ้าน' + esc(v[3].replace(/^บ้าน/, "")) + (v[2] ? " ม." + esc(v[2]) : "") + '</b><small>' + esc(place(S(v[4]), S(v[5]), S(v[6]))) + ' · ' + esc(G.risk[v[7]]) + '</small></span></button>';
    }).join("") + '</div>' : '<p class="sl-note">ไม่พบหมู่บ้านเสี่ยงดินถล่มที่ตรงกับ "' + esc(q) + '" (ในรายชื่อของกรมทรัพยากรธรณี)</p>';
  }

  function placePanel() {
    var p = $("#slidePanel");
    if (!p || !visible || window.innerWidth <= 760) { if (p) p.style.right = ""; return; }
    var n = 0;
    ["#floodPanel", "#damPanel", "#warnPanel", "#quakePanel"].forEach(function (s) { var e = $(s); if (e && e.classList.contains("open") && e.offsetParent) n++; });
    var st = $(".stage"), Wd = st ? st.clientWidth : window.innerWidth, right = 14 + n * 344;
    if (right + 330 > Wd - 20) right = 14;
    p.style.right = right + "px";
  }
  function saveSub() { lsSet(LS_SUB, JSON.stringify(sub)); }
  function saveOpt() { lsSet(LS_OPT, JSON.stringify({ minLv: opt.minLv, per: opt.per, list: opt.list })); }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    addIcons();
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnSlideToggle")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "menu-btn"; b.id = "btnSlideToggle";
      b.title = "เปิด/ปิดชั้นดินถล่ม — ฝนตกหนักใกล้หมู่บ้านเสี่ยง พื้นที่อ่อนไหว จุดปลอดภัย เหตุในอดีต และความชันของภูเขา";
      b.innerHTML = '<span>' + ico("mountain") + '</span><span class="label-text"> ดินถล่ม</span>';
      b.addEventListener("click", function () { setVisible(!visible); });
      var after = $("#btnQuakeToggle") || $("#btnWarnToggle");
      if (after && after.parentNode === menu) menu.insertBefore(b, after.nextSibling); else menu.appendChild(b);
    }
    if (!$("#slidePanel")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var p = document.createElement("div");
      p.id = "slidePanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "ดินถล่ม");
      p.innerHTML = '<div class="sl-ph">' + ico("mountain") + ' ดินถล่ม' +
        '<button type="button" class="sl-ib" data-a="min" title="ย่อ/ขยาย">' + ico("minus") + '</button>' +
        '<button type="button" class="sl-ib" style="margin-left:0" data-a="close" title="ปิดชั้นนี้">×</button></div><div class="sl-body"></div>';
      if (lsGet(LS_MIN) === "1") p.classList.add("min");
      stage.appendChild(p);
      p.addEventListener("click", function (e) {
        var a = e.target.closest("[data-a]"), c = e.target.closest(".sl-chip"), it = e.target.closest(".sl-it");
        if (a && a.dataset.a === "close") return setVisible(false);
        if (a && a.dataset.a === "min") { var m = !p.classList.contains("min"); p.classList.toggle("min", m); lsSet(LS_MIN, m ? "1" : "0"); return; }
        if (c) {
          var g = c.dataset.g, v = c.dataset.v;
          if (g === "minLv") {
            opt.minLv = +v;
            var s = map && map.getSource("sl-risk");
            if (s && s.setTiles) s.setTiles([riskTiles()]);
          } else opt[g] = v;
          saveOpt(); refresh(); return;
        }
        if (!it) return;
        var i = +it.dataset.i;
        if (it.dataset.k === "rain") { var r = R.data.st[i]; return flyTo([r[1], r[0]], 10, function () { return rainCard(i); }); }
        if (it.dataset.k === "ev") { var ev = G.ev[i]; return flyTo([ev[1], ev[2]], 11, function () { return evCard(i); }); }
        if (it.dataset.k === "vil") { var vv = G.vil[i]; return flyTo([vv[0], vv[1]], 13, function () { return vilCard(i); }); }
      });
      p.addEventListener("change", function (e) {
        var k = e.target.dataset && e.target.dataset.s;
        if (!k) return;
        sub[k] = e.target.checked;
        saveSub(); syncLayerVis(); ensureData(); renderPanel();
      });
      p.addEventListener("input", function (e) {
        if (!e.target.dataset || e.target.dataset.a !== "q") return;
        opt.q = e.target.value; renderSearch();
      });
    }
    if (!panelObs && window.MutationObserver) {
      panelObs = new MutationObserver(placePanel);
      ["#floodPanel", "#damPanel", "#warnPanel", "#quakePanel"].forEach(function (s) { var e = $(s); if (e) panelObs.observe(e, { attributes: true, attributeFilter: ["class"] }); });
      window.addEventListener("resize", placePanel);
    }
    syncButtons();
  }
  function syncButtons() {
    var b = $("#btnSlideToggle"), p = $("#slidePanel");
    if (b) b.classList.toggle("active", visible);
    if (p) p.classList.toggle("open", visible);
    placePanel();
  }

  function setVisible(v) {
    visible = !!v;
    lsSet(LS_KEY, visible ? "1" : "0");
    syncButtons();
    clearInterval(refreshTimer);
    if (!visible) {
      if (popup) { popup.remove(); popup = null; }
      syncLayerVis();
      return;
    }
    addLayers();
    bindHandlers();
    renderPanel();
    ensureData();
    refreshTimer = setInterval(function () { if (!document.hidden) ensureData(); }, 10 * 60000);
    if (map.getZoom() > 8.5) map.flyTo({ center: [100.4, 14.8], zoom: 5.5, pitch: 0, bearing: 0, duration: 1600 });
  }

  /* ================================================================ mount — เรียกซ้ำทุกครั้งที่เปลี่ยนสไตล์แผนที่ */
  function mount(m) {
    map = m;
    try { var s = JSON.parse(lsGet(LS_SUB) || "null"); if (s) Object.keys(sub).forEach(function (k) { if (typeof s[k] === "boolean") sub[k] = s[k]; }); } catch (e) { }
    try {
      var o = JSON.parse(lsGet(LS_OPT) || "null");
      if (o) { if ([1, 3, 4, 5].indexOf(o.minLv) >= 0) opt.minLv = o.minLv; if (/^(all|10y|5y)$/.test(o.per)) opt.per = o.per; if (/^(dead|new)$/.test(o.list)) opt.list = o.list; }
    } catch (e) { }
    buildUI();
    if (lsGet(LS_KEY) === "1" && !visible) { setVisible(true); return; }
    if (!visible) return;
    addLayers();   // สไตล์ใหม่ล้างชั้น (และรูปไอคอน) ทิ้งหมด → วางกลับ
  }

  window.BKK_SLIDE = {
    mount: mount,
    setVisible: setVisible,
    mapRef: function () { return map; },
    demAt: demAt,
    riskAt: riskAt,
    debug: function () {
      return {
        visible: visible, sub: sub, opt: { minLv: opt.minLv, per: opt.per, list: opt.list }, geo: !!G, safe: SAFE ? SAFE.length : null,
        rain: R.data ? R.data.st.length : null, rainErr: R.err, heavy: HOT.length, hotVil: G ? hotVillages() : null, ews: W.st.length,
        layers: RASTER.concat(POINTS).filter(function (id) { return map && map.getLayer(id); })
      };
    }
  };
})();
