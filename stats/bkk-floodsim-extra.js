/**
 * bkk-floodsim-extra.js
 * ชั้นประกอบของ "จำลองน้ำท่วม 3 มิติ" (bkk-floodsim.js) โหมดตามความสูงพื้นดิน — ใช้ระดับน้ำ/วันน้ำลดชุดเดียวกัน
 *   1) สถานที่สำคัญที่น้ำถึง   โรงพยาบาล โรงเรียน สถานีรถไฟฟ้า สถานีไฟฟ้าย่อย ฯลฯ (OSM) — นับ + รายชื่อเรียงตามความลึก
 *   2) ถนนที่รถผ่านไม่ได้      ถนนสายหลัก (ไม่นับสะพาน/ทางยกระดับ) ระบายสีตามความลึก ≥15 / ≥30 ซม. (NWS)
 *   3) สถานีสูบน้ำ/ประตูระบายน้ำ (สำนักการระบายน้ำ กทม.) + คันกั้นน้ำ (OSM — มีบางส่วน)
 *   4) น้ำท่วมจริงจากดาวเทียม   พื้นที่น้ำท่วมซ้ำซาก GISTDA ปี 2554–2567 · เลือกดูรายปี · เทียบกับแบบจำลอง
 *
 * ข้อมูล: bkk-floodsim-data.js (สร้างโดย _geo/build-bkk-floodsim-data.mjs — ความสูงพื้นของทุกจุดคิดจาก bkk-dem.png ไว้แล้ว)
 *         bkk-floodhist.png/json (สร้างโดย _geo/gistda/build-floodhist.mjs)
 * ความลึก ณ จุดหนึ่ง = max(L, min(P, พื้น + แอ่ง) − ส่วนที่แอ่งลด) − พื้น   (สูตรเดียวกับเชเดอร์ผิวน้ำ)
 *   → ส่งเป็น expression ของ MapLibre แล้วเปลี่ยนแค่ตัวเลข L/P/ลด เวลาเลื่อนระดับน้ำหรือวัน
 */
(function () {
  "use strict";

  var DATA_URL = "bkk-floodsim-data.js", HIST_PNG = "bkk-floodhist.png", HIST_JSON = "bkk-floodhist.json";
  var LS_ON = "bkk-floodsim-extra-on", LS_HIST = "bkk-floodsim-extra-hist";
  var IDS = ["fsx-dikes", "fsx-roads", "fsx-places", "fsx-places-lbl", "fsx-pumps"];
  var HIST_STRIPS = 8;                     // ภาพน้ำท่วมจริงแบ่งเป็นแถบตามละติจูด — กันเพี้ยนจากเมอร์เคเตอร์ (กริดเป็นองศา)
  var on = { places: true, roads: true, pumps: false, hist: false };
  var histSel = 0;                         // -1 = จำนวนปีที่ท่วม · 0..13 = ปี 2011..2024 (ค่าเริ่ม = 2554 มหาอุทกภัย)
  var ROAD_CLS = ["ทางหลวง/ถนนสายหลัก", "ถนนสายหลักรอง", "ถนนสายรอง", "ถนนเชื่อม"];
  var PLACE_COL = { dry: "#94a3b8", d1: "#f59e0b", d2: "#ef4444", d3: "#991b1b" };

  var map = null, D = null, loading = null, hist = null, histLoading = null, histErr = null;
  var st = null, applyTimer = null, lastKey = "", panelEl = null, bound = false, popup = null;
  var stats = null;

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function num(v, d) { return Number(v).toLocaleString("th-TH", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function m2(v) { return Math.abs(v) < 1 ? Math.round(v * 100) + " ซม." : (Math.round(v * 100) / 100) + " ม."; }
  function be(y) { return y + 543; }

  /* ================================================================ โหลดข้อมูล */
  function loadScript(src) {
    return new Promise(function (ok, bad) {
      var s = document.createElement("script");
      s.src = src; s.async = true; s.onload = ok; s.onerror = function () { bad(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }
  function ensureData() {
    if (D) return Promise.resolve(D);
    if (!loading) loading = (window.BKK_FLOODSIM_DATA ? Promise.resolve() : loadScript(DATA_URL)).then(function () {
      var R = window.BKK_FLOODSIM_DATA, q = R.q;
      // ความสูงพื้นในไฟล์ข้อมูลเป็น EGM2008 (จาก FABDEM) → แปลงเป็น ม.รทก. ให้ตรงกับตัวจำลอง
      var dz = (window.BKK_FLOODSIM && window.BKK_FLOODSIM.DATUM) || 0.87;
      var dec = function (flat) {
        var out = [], x = 0, y = 0;
        for (var i = 0; i < flat.length; i += 2) { x = i ? x + flat[i] : flat[i]; y = i ? y + flat[i + 1] : flat[i + 1]; out.push([x / q, y / q]); }
        return out;
      };
      var roads = [], km = 0;
      R.roads.forEach(function (r, i) {
        var c = dec(r[3]), len = 0;
        for (var k = 1; k < c.length; k++) len += Math.hypot((c[k][0] - c[k - 1][0]) * 108, (c[k][1] - c[k - 1][1]) * 110.6);
        km += len;
        roads.push({ type: "Feature", geometry: { type: "LineString", coordinates: c }, properties: { i: i, c: r[0], g: r[1] / 100 - dz, p: r[2] / 100, len: len } });
      });
      var places = R.places.map(function (p, i) {
        return { type: "Feature", geometry: { type: "Point", coordinates: [p[0] / q, p[1] / q] }, properties: { i: i, c: p[2], n: p[3], g: p[4] / 100 - dz, p: p[5] / 100 } };
      });
      var pumps = R.pumps.map(function (p, i) {
        return { type: "Feature", geometry: { type: "Point", coordinates: [p[0] / q, p[1] / q] }, properties: { i: i, t: p[2], cap: p[5] || 0 } };
      });
      var dikes = R.dikes.map(function (d, i) { return { type: "Feature", geometry: { type: "LineString", coordinates: dec(d[1]) }, properties: { i: i } }; });
      D = { raw: R, roads: roads, places: places, pumps: pumps, dikes: dikes, roadKm: km };
      return D;
    });
    return loading;
  }
  function ensureHist() {
    if (hist) return Promise.resolve(hist);
    if (histLoading) return histLoading;
    histLoading = fetch(HIST_JSON).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).then(function (meta) {
      return new Promise(function (ok, bad) {
        var img = new Image();
        img.onload = function () { ok({ meta: meta, img: img }); };
        img.onerror = function () { bad(new Error("โหลดภาพน้ำท่วมจริงไม่สำเร็จ")); };
        img.src = HIST_PNG;
      });
    }).then(function (x) {
      var W = x.meta.w, Hh = x.meta.h, cv = document.createElement("canvas");
      cv.width = W; cv.height = Hh;
      var g = cv.getContext("2d", { willReadFrequently: true });
      g.drawImage(x.img, 0, 0);
      var px = g.getImageData(0, 0, W, Hh).data, n = W * Hh, mask = new Uint16Array(n), freq = new Uint8Array(n);
      for (var i = 0; i < n; i++) { mask[i] = px[i * 4] * 256 + px[i * 4 + 1]; freq[i] = px[i * 4 + 2]; }
      hist = { meta: x.meta, W: W, H: Hh, mask: mask, freq: freq, canvas: document.createElement("canvas"), cache: {} };
      histErr = null;
      return hist;
    }).catch(function (e) { histErr = String(e.message || e); histLoading = null; throw e; });
    return histLoading;
  }

  /* ================================================================ ความลึก */
  function depthOf(g, p) {
    if (!st) return 0;
    return Math.max(st.L, Math.min(st.P, g + p) - st.drop) - g;
  }
  function depthExpr() {
    return ["-", ["max", st.L, ["-", ["min", st.P, ["+", ["get", "g"], ["get", "p"]]], st.drop]], ["get", "g"]];
  }

  /* ================================================================ ชั้นแผนที่ */
  function beforeHist() { return map.getLayer("bkk-3d-world") ? "bkk-3d-world" : map.getLayer("city-buildings-3d") ? "city-buildings-3d" : undefined; }
  function addLayers() {
    if (!map || !map.getStyle() || !D) return;
    var src = function (id, feats) { if (!map.getSource(id)) map.addSource(id, { type: "geojson", data: { type: "FeatureCollection", features: feats } }); };
    src("fsx-dikes", D.dikes); src("fsx-roads", D.roads); src("fsx-places", D.places); src("fsx-pumps", D.pumps);
    if (!map.getLayer("fsx-dikes")) map.addLayer({
      id: "fsx-dikes", type: "line", source: "fsx-dikes",
      paint: { "line-color": "#b45309", "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 15, 5], "line-dasharray": [2, 1] }
    });
    if (!map.getLayer("fsx-roads")) map.addLayer({
      id: "fsx-roads", type: "line", source: "fsx-roads", layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-width": ["interpolate", ["linear"], ["zoom"], 9, ["match", ["get", "c"], 0, 2, 1, 1.6, 1.1], 15, ["match", ["get", "c"], 0, 7, 1, 6, 4.5]] }
    });
    if (!map.getLayer("fsx-pumps")) map.addLayer({
      id: "fsx-pumps", type: "circle", source: "fsx-pumps",
      paint: {
        "circle-color": ["match", ["get", "t"], 1, "#fb923c", "#38bdf8"],
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, ["match", ["get", "t"], 1, 2.2, ["+", 2.6, ["min", 4, ["/", ["get", "cap"], 5]]]], 15, ["match", ["get", "t"], 1, 5, ["+", 6, ["min", 6, ["/", ["get", "cap"], 4]]]]],
        "circle-stroke-color": "#0b1220", "circle-stroke-width": 1.2
      }
    });
    if (!map.getLayer("fsx-places")) map.addLayer({ id: "fsx-places", type: "circle", source: "fsx-places", paint: { "circle-stroke-color": "#ffffff", "circle-stroke-width": 1.4 } });
    if (!map.getLayer("fsx-places-lbl")) map.addLayer({
      id: "fsx-places-lbl", type: "symbol", source: "fsx-places", minzoom: 13.5,
      layout: { "text-field": ["get", "n"], "text-font": ["Noto Sans Regular"], "text-size": 11, "text-offset": [0, 1.1], "text-anchor": "top", "text-optional": true, "text-max-width": 9 },
      paint: { "text-color": "#fde68a", "text-halo-color": "rgba(8,12,22,.92)", "text-halo-width": 1.5 }
    });
    lastKey = "";
    applyNow();
  }
  function setVis() {
    var show = st && st.visible && st.mode === "dem";
    var v = function (id, o) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", show && o ? "visible" : "none"); };
    v("fsx-roads", on.roads); v("fsx-places", on.places); v("fsx-places-lbl", on.places); v("fsx-pumps", on.pumps); v("fsx-dikes", on.pumps);
    for (var k = 0; k < HIST_STRIPS; k++) if (map.getLayer("fsx-hist-" + k)) map.setLayoutProperty("fsx-hist-" + k, "visibility", show && on.hist ? "visible" : "none");
  }
  function applyNow() {
    if (!map || !D || !st) return;
    setVis();
    if (!(st.visible && st.mode === "dem")) return;
    var key = [st.L.toFixed(3), st.P.toFixed(3), st.drop.toFixed(3)].join("|");
    if (key === lastKey) return;
    lastKey = key;
    var dx = depthExpr();
    if (map.getLayer("fsx-roads")) {
      map.setPaintProperty("fsx-roads", "line-color", ["step", dx, "rgba(0,0,0,0)", 0.05, "#4ade80", 0.15, "#f59e0b", 0.3, "#ef4444"]);
      map.setPaintProperty("fsx-roads", "line-opacity", ["step", dx, 0, 0.05, 0.95]);
    }
    if (map.getLayer("fsx-places")) {
      map.setPaintProperty("fsx-places", "circle-color", ["step", dx, PLACE_COL.dry, 0.05, PLACE_COL.d1, 0.3, PLACE_COL.d2, 1, PLACE_COL.d3]);
      map.setPaintProperty("fsx-places", "circle-radius", ["interpolate", ["linear"], ["zoom"], 9, ["step", dx, 1.8, 0.05, 3.2], 15, ["step", dx, 4, 0.05, 7]]);
      map.setPaintProperty("fsx-places", "circle-opacity", ["step", dx, 0.55, 0.05, 1]);
      map.setPaintProperty("fsx-places-lbl", "text-opacity", ["step", dx, 0, 0.05, 1]);
    }
    computeStats();
    renderStats();
  }
  function scheduleApply() {
    clearTimeout(applyTimer);
    applyTimer = setTimeout(applyNow, 90);
  }

  /* ---------------- น้ำท่วมจริง (GISTDA) เป็นภาพซ้อนบนพื้น ---------------- */
  var FREQ_COL = [null, [125, 211, 252], [56, 189, 248], [59, 130, 246], [99, 102, 241], [139, 92, 246], [168, 85, 247], [217, 70, 239]];
  function histImage(sel) {
    var h = hist, key = String(sel);
    if (h.cache[key]) return h.cache[key];
    var W = h.W, Hh = h.H, rows = Math.ceil(Hh / HIST_STRIPS), out = [];
    for (var s = 0; s < HIST_STRIPS; s++) {
      var y0 = s * rows, y1 = Math.min(Hh, y0 + rows), cv = document.createElement("canvas");
      cv.width = W; cv.height = y1 - y0;
      var g = cv.getContext("2d"), img = g.createImageData(W, y1 - y0), d = img.data;
      for (var j = y0; j < y1; j++) for (var i = 0; i < W; i++) {
        var k = j * W + i, o = ((j - y0) * W + i) * 4, c = null;
        if (sel < 0) { var f = h.freq[k]; if (f) c = FREQ_COL[Math.min(7, f)]; }
        else if (h.mask[k] & (1 << sel)) c = [239, 68, 68];
        if (c) { d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 170; }
      }
      g.putImageData(img, 0, 0);
      out.push(cv.toDataURL("image/png"));
    }
    h.cache[key] = out;
    return out;
  }
  function showHist() {
    if (!hist || !map) return;
    var b = hist.meta.bbox, urls = histImage(histSel), rows = Math.ceil(hist.H / HIST_STRIPS), bf = beforeHist();
    for (var s = 0; s < HIST_STRIPS; s++) {
      var y0 = s * rows, y1 = Math.min(hist.H, y0 + rows);
      var n = b[3] - (b[3] - b[1]) * y0 / hist.H, so = b[3] - (b[3] - b[1]) * y1 / hist.H;
      var coords = [[b[0], n], [b[2], n], [b[2], so], [b[0], so]], id = "fsx-hist-" + s;
      var srcObj = map.getSource(id);
      if (srcObj) srcObj.updateImage({ url: urls[s], coordinates: coords });
      else {
        map.addSource(id, { type: "image", url: urls[s], coordinates: coords });
        map.addLayer({ id: id, type: "raster", source: id, paint: { "raster-opacity": 0.6, "raster-resampling": "nearest", "raster-fade-duration": 0 } }, bf);
      }
    }
    setVis();
  }

  /* ================================================================ สถิติ */
  function computeStats() {
    if (!D || !st) return;
    var cats = D.raw.cats, byCat = cats.map(function () { return [0, 0]; }), list = [];
    D.places.forEach(function (f) {
      var p = f.properties, d = depthOf(p.g, p.p);
      byCat[p.c][1]++;
      if (d > 0.05) { byCat[p.c][0]++; list.push([d, p.i]); }
    });
    list.sort(function (a, b) { return b[0] - a[0]; });
    var road = [0, 0, 0];
    D.roads.forEach(function (f) {
      var p = f.properties, d = depthOf(p.g, p.p);
      if (d > 0.3) road[2] += p.len; else if (d > 0.15) road[1] += p.len; else if (d > 0.05) road[0] += p.len;
    });
    var pumpsWet = 0;
    D.pumps.forEach(function (f, i) {
      var r = D.raw.pumps[i]; if (r[2] === 0) { var g = window.BKK_FLOODSIM.groundAt(r[0] / D.raw.q, r[1] / D.raw.q); if (g != null && depthOf(g, 0) > 0.3) pumpsWet++; }
    });
    stats = { byCat: byCat, list: list, road: road, pumpsWet: pumpsWet };
  }
  // เทียบแบบจำลองกับน้ำท่วมจริง (เฉพาะช่องที่มีข้อมูล GISTDA และเป็นพื้นดิน) · แบบจำลอง "ท่วม" = พื้นต่ำกว่าระดับ L
  function histCompare(sel, L) {
    var dem = window.BKK_FLOODSIM.dem();
    if (!hist || !dem) return null;
    var tp = 0, fp = 0, fn = 0, bit = sel < 0 ? -1 : 1 << sel;
    for (var k = 0; k < dem.h.length; k++) {
      var m = hist.mask[k];
      if (!(m & 0x8000)) continue;
      var h = dem.h[k];
      if (h <= dem.meta.nodata_below) continue;
      var real = bit < 0 ? hist.freq[k] > 0 : (m & bit) !== 0, model = h < L;
      if (real && model) tp++; else if (model) fp++; else if (real) fn++;
    }
    // ค่าอ้างอิง "สุ่มเดา" = สัดส่วนพื้นที่ที่ท่วมจริง (ถ้าทายท่วมแบบสุ่ม จะถูกเท่านี้)
    var n = tp + fp + fn, all = 0;
    for (k = 0; k < dem.h.length; k++) if ((hist.mask[k] & 0x8000) && dem.h[k] > dem.meta.nodata_below) all++;
    return { recall: tp / Math.max(1, tp + fn), precision: tp / Math.max(1, tp + fp), f1: 2 * tp / Math.max(1, 2 * tp + fp + fn), km2: (tp + fn) * dem.cellKm2, base: (tp + fn) / Math.max(1, all), n: n };
  }
  // หาระดับน้ำที่ทำให้ "พื้นที่ท่วมในแบบจำลอง = พื้นที่ท่วมจริง" ของปีที่เลือก (ใช้ฮิสโตแกรมความสูงพื้น ละเอียด 1 ซม.)
  //   ไม่ใช้ F1 สูงสุด: ปี 2554 ท่วมเกินครึ่งของพื้นที่ในกรอบ F1 เลยชอบ "ท่วมหมด" (ได้ระดับเพดาน 5 ม. ซึ่งไม่มีความหมาย)
  function bestLevel(sel) {
    var dem = window.BKK_FLOODSIM.dem();
    if (!hist || !dem) return null;
    var NB = 800, off = 3, real = new Float64Array(NB), all = new Float64Array(NB), bit = sel < 0 ? -1 : 1 << sel, R = 0;
    for (var k = 0; k < dem.h.length; k++) {
      var m = hist.mask[k];
      if (!(m & 0x8000)) continue;
      var h = dem.h[k];
      if (h <= dem.meta.nodata_below) continue;
      var b = Math.max(0, Math.min(NB - 1, Math.floor((h + off) * 100)));
      all[b]++;
      if (bit < 0 ? hist.freq[k] > 0 : (m & bit)) { real[b]++; R++; }
    }
    var cnt = 0;
    for (var i = 0; i < NB; i++) {
      cnt += all[i];
      if (cnt >= R) return { L: Math.max(0, Math.min(5, Math.round(((i + 1) / 100 - off) * 20) / 20)) };
    }
    return { L: 5 };
  }

  /* ================================================================ แผง */
  function panelHTML() {
    var h = '<b class="fs-h">' + ico("layers") + ' ข้อมูลประกอบ</b>';
    var row = function (k, label, sub) {
      return '<label class="fs-opt"><input type="checkbox" data-x="' + k + '"' + (on[k] ? " checked" : "") + '> ' + label + (sub ? ' <small style="opacity:.6">' + sub + '</small>' : "") + '</label>';
    };
    h += row("places", "สถานที่สำคัญที่น้ำถึง", "OSM") + (on.places ? '<div id="fsxPlaces" class="fsx-box"></div>' : "");
    h += row("roads", "ถนนที่รถผ่านไม่ได้", "ถนนระดับพื้น") + (on.roads ? '<div id="fsxRoads" class="fsx-box"></div>' : "");
    h += row("pumps", "สถานีสูบน้ำ · ประตูระบายน้ำ · คันกั้นน้ำ", "") + (on.pumps ? '<div id="fsxPumps" class="fsx-box"></div>' : "");
    h += row("hist", "น้ำท่วมจริงจากดาวเทียม", "GISTDA 2554–2567") + (on.hist ? '<div id="fsxHist" class="fsx-box"></div>' : "");
    return h;
  }
  function renderStats() {
    if (!panelEl || !D || !stats) return;
    var cats = D.raw.cats, el;
    if ((el = $("#fsxPlaces"))) {
      var chips = cats.map(function (c, i) {
        var b = stats.byCat[i]; if (!b[1]) return "";
        return '<span class="fsx-chip' + (b[0] ? " wet" : "") + '">' + esc(c[1]) + ' <b>' + num(b[0]) + '</b>/' + num(b[1]) + '</span>';
      }).join("");
      var top = stats.list.slice(0, 8).map(function (x) {
        var p = D.raw.places[x[1]];
        return '<button type="button" class="fsx-it" data-pi="' + x[1] + '"><i style="background:' + (x[0] >= 1 ? PLACE_COL.d3 : x[0] >= 0.3 ? PLACE_COL.d2 : PLACE_COL.d1) + '"></i><span>' + esc(p[3] || cats[p[2]][1]) + '<small>' + esc(cats[p[2]][1]) + '</small></span><b>' + m2(x[0]) + '</b></button>';
      }).join("");
      el.innerHTML = '<div class="fsx-chips">' + chips + '</div>' + (top ? '<div class="fsx-list">' + top + '</div>' + (stats.list.length > 8 ? '<p class="fs-note">และอีก ' + num(stats.list.length - 8) + ' แห่ง</p>' : "") : '<p class="fs-note">ยังไม่มีสถานที่สำคัญในพื้นที่ท่วม</p>') +
        '<p class="fs-note">สถานีรถไฟฟ้ายกระดับ: ชานชาลาพ้นน้ำ แต่ทางขึ้น-ลง/ลิฟต์ระดับพื้นท่วมตาม · พิกัดจาก OSM มีเท่าที่อาสาสมัครบันทึกไว้</p>';
    }
    if ((el = $("#fsxRoads"))) {
      var r = stats.road;
      el.innerHTML = '<div class="fs-leg"><span><i style="background:#ef4444"></i>ห้ามผ่าน ≥30 ซม. <b>' + num(r[2], 0) + '</b> กม.</span><span><i style="background:#f59e0b"></i>รถเล็กเสี่ยง 15–30 ซม. <b>' + num(r[1], 0) + '</b> กม.</span><span><i style="background:#4ade80"></i>ลุยได้ &lt;15 ซม. <b>' + num(r[0], 0) + '</b> กม.</span></div>' +
        '<p class="fs-note">จากถนนสายหลักระดับพื้น ' + num(D.roadKm, 0) + ' กม. (นับแต่ละทิศแยกกัน) · ใช้จุดต่ำสุดของช่วงถนนละ ~120 ม. · เกณฑ์ 15/30 ซม. ตามคำเตือน NWS</p>';
    }
    if ((el = $("#fsxPumps"))) {
      var np = D.raw.pumps.filter(function (p) { return p[2] === 0; }).length, ng = D.raw.pumps.length - np;
      el.innerHTML = '<div class="fs-leg"><span><i style="background:#38bdf8;border-radius:50%"></i>บ่อสูบน้ำ <b>' + np + '</b></span><span><i style="background:#fb923c;border-radius:50%"></i>ประตูระบายน้ำ <b>' + ng + '</b></span><span><i style="background:#b45309"></i>คันกั้นน้ำ (OSM) ' + D.raw.dikes.length + ' แนว</span></div>' +
        (stats.pumpsWet ? '<p class="fs-note">บ่อสูบ ' + stats.pumpsWet + ' แห่งอยู่ในจุดที่แบบจำลองท่วมเกิน 30 ซม. — ของจริงบ่อสูบและคันกั้นน้ำคือเหตุผลที่หลายพื้นที่ไม่ท่วมอย่างแบบจำลอง</p>' : "") +
        '<p class="fs-note">แบบจำลองนี้ยังไม่ได้คิดผลของบ่อสูบและคันกั้นน้ำ · ข้อมูลสถานีจากสำนักการระบายน้ำ กทม. (data.bangkok.go.th) · คันกั้นน้ำใน OSM มีแค่บางส่วน</p>';
    }
    if ((el = $("#fsxHist"))) renderHist(el);
  }
  function renderHist(el) {
    if (!hist) { el.innerHTML = '<p class="fs-note">' + (histErr ? '<span class="fs-bad">โหลดไม่สำเร็จ</span>' : "กำลังโหลดข้อมูลน้ำท่วมจริง…") + '</p>'; return; }
    var yrs = hist.meta.years;
    var opts = '<option value="-1"' + (histSel < 0 ? " selected" : "") + '>จำนวนปีที่เคยท่วม (2554–2567)</option>' + yrs.map(function (y, k) {
      return '<option value="' + k + '"' + (histSel === k ? " selected" : "") + '>ปี ' + be(y) + (y === 2011 ? " (มหาอุทกภัย)" : "") + ' — ' + num(hist.meta.yearKm2[y] || 0) + ' ตร.กม.</option>';
    }).join("");
    var h = '<select class="fsx-sel" data-hs="1">' + opts + '</select>';
    h += histSel < 0 ?
      '<div class="fs-leg">' + [1, 2, 3, 4, 5, 6, 7].map(function (n) { var c = FREQ_COL[n]; return '<span><i style="background:rgb(' + c.join(",") + ')"></i>' + (n === 7 ? "7+" : n) + '</span>'; }).join("") + '<span>ปี</span></div>' :
      '<div class="fs-leg"><span><i style="background:#ef4444"></i>ท่วมจริงปี ' + be(yrs[histSel]) + '</span><span><i style="background:#2f86d6"></i>แบบจำลอง</span></div>';
    var cmp = st ? histCompare(histSel, st.L) : null;
    if (cmp) h += '<div class="fs-area">ที่ระดับน้ำ ' + m2(st.L) + ' รทก. แบบจำลองจับพื้นที่ท่วมจริงได้ <b>' + num(cmp.recall * 100, 0) + '%</b> · ที่แบบจำลองบอกว่าท่วม ท่วมจริง <b>' + num(cmp.precision * 100, 0) + '%</b>' +
      '<br><small>ถ้าสุ่มเดาจะถูกราว ' + num(cmp.base * 100, 0) + '% (สัดส่วนพื้นที่ที่ท่วมจริง)' +
      (cmp.precision < cmp.base ? ' — แบบจำลองแม่นน้อยกว่าสุ่ม: ของจริงไม่ได้ท่วมตามความต่ำของพื้นอย่างเดียว (คันกั้นน้ำ/ทิศทางน้ำ)' : cmp.precision > cmp.base + 0.1 ? ' — แบบจำลองอธิบายของจริงได้บางส่วน' : "") + '</small></div>' +
      '<div class="fs-row"><button type="button" class="fs-btn ghost" data-a="xbest">' + ico("crosshair") + ' ตั้งระดับให้พื้นที่ท่วมเท่ากับ' + (histSel < 0 ? "ที่เคยท่วม" : "ปี " + be(yrs[histSel])) + '</button></div>';
    h += '<p class="fs-note">ขอบเขตน้ำท่วมจากภาพดาวเทียมของ GISTDA ไม่มีความลึก · ไม่รวมพื้นที่ส่วนของอยุธยาในกรอบ · แบบจำลองอ่างน้ำใช้ระดับน้ำเดียวทั้งเมือง แต่น้ำจริง (เช่น ปี 2554) ไหลมาจากทางเหนือ ผิวน้ำทางเหนือสูงกว่าทางใต้ และมีคันกั้น/การสูบ — จึงทับกันได้แค่บางส่วน</p>';
    el.innerHTML = h;
  }
  function renderPanel(el) {
    panelEl = el;
    if (!el) return;
    el.innerHTML = panelHTML();
    if (!el._bound) {
      el._bound = true;
      el.addEventListener("change", function (e) {
        var k = e.target.dataset && e.target.dataset.x;
        if (k) {
          on[k] = e.target.checked;
          lsSet(LS_ON, JSON.stringify(on));
          renderPanel(el);
          if (k === "hist" && on.hist) ensureHist().then(function () { showHist(); renderStats(); }).catch(function () { renderStats(); });
          setVis(); renderStats();
          return;
        }
        if (e.target.dataset && e.target.dataset.hs) { histSel = +e.target.value; lsSet(LS_HIST, String(histSel)); showHist(); renderStats(); }
      });
      el.addEventListener("click", function (e) {
        var b = e.target.closest("[data-pi]");
        if (b) { openPlace(+b.dataset.pi, true); return; }
        if (e.target.closest("[data-a=xbest]")) {
          var r = bestLevel(histSel);
          if (r) window.BKK_FLOODSIM.setDepth(r.L, false);
        }
      });
    }
    ensureData().then(function () { addLayers(); computeStats(); renderStats(); });
    if (on.hist) ensureHist().then(function () { showHist(); renderStats(); }).catch(function () { renderStats(); });
  }

  /* ================================================================ การ์ด */
  function openPopup(ll, html) {
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ closeButton: true, maxWidth: "290px", className: "fl-popup", offset: 10 }).setLngLat(ll).setHTML(html).addTo(map);
  }
  function openPlace(i, fly) {
    var p = D.raw.places[i], q = D.raw.q, ll = [p[0] / q, p[1] / q], g = D.places[i].properties.g, d = depthOf(g, p[5] / 100);
    if (fly) map.flyTo({ center: ll, zoom: Math.max(map.getZoom(), 15.5), pitch: 55, duration: 1600 });
    openPopup(ll, '<div class="fl-pop"><b class="fl-pop-t">' + esc(p[3] || D.raw.cats[p[2]][1]) + ' <small>' + esc(D.raw.cats[p[2]][1]) + '</small></b>' +
      '<div class="fl-row"><span>พื้นดิน</span><b>' + g.toFixed(2) + ' ม. รทก.</b></div>' +
      '<div class="fl-row"><span>น้ำตอนนี้</span><b>' + (d > 0.05 ? '<span style="color:#ef4444">ลึก ' + m2(d) + '</span>' : "ไม่ท่วม") + '</b></div>' +
      (p[5] > 10 ? '<div class="fl-row"><span>แอ่งปิด</span><b>ลึก ~' + m2(p[5] / 100) + '</b></div>' : "") +
      '<div class="fl-pop-f">ตามแบบจำลองอย่างง่าย (ความสูงพื้น FABDEM ±1–2 ม.) · พิกัด OSM</div></div>');
  }
  function openPump(i) {
    var p = D.raw.pumps[i], q = D.raw.q;
    openPopup([p[0] / q, p[1] / q], '<div class="fl-pop"><b class="fl-pop-t">' + esc(p[3]) + '</b>' +
      '<div class="fl-row"><span>ประเภท</span><b>' + (p[2] ? "ประตูระบายน้ำ" : "บ่อสูบน้ำ") + '</b></div>' +
      (p[4] ? '<div class="fl-row"><span>เขต</span><b>' + esc(p[4].replace(/^เขต/, "")) + '</b></div>' : "") +
      (p[5] ? '<div class="fl-row"><span>กำลังสูบรวม</span><b>' + num(p[5], 1) + ' ลบ.ม./วินาที</b></div>' : "") +
      (p[6] ? '<div class="fl-row"><span>เครื่องสูบ</span><b><small>' + esc(p[6]) + '</small></b></div>' : "") +
      (p[7] ? '<div class="fl-row"><span>ระดับควบคุมน้ำ</span><b><small>' + esc(p[7]) + ' ม.รทก.</small></b></div>' : "") +
      '<div class="fl-pop-f">ข้อมูล: สำนักการระบายน้ำ กทม. (data.bangkok.go.th)</div></div>');
  }
  function bindMap() {
    if (bound || !map) return;
    bound = true;
    map.on("click", function (e) {
      if (!st || !st.visible || st.mode !== "dem" || !D) return;
      var ids = ["fsx-places", "fsx-pumps"].filter(function (id) { return map.getLayer(id) && map.getLayoutProperty(id, "visibility") !== "none"; });
      if (!ids.length) return;
      var p = e.point, fs = map.queryRenderedFeatures([[p.x - 5, p.y - 5], [p.x + 5, p.y + 5]], { layers: ids });
      if (!fs.length) return;
      var f = fs.filter(function (x) { return x.layer.id === "fsx-places"; })[0] || fs[0];
      if (f.layer.id === "fsx-places") openPlace(f.properties.i, false); else openPump(f.properties.i);
    });
    var hov = false;
    map.on("mousemove", function (e) {
      if (!st || !st.visible || st.mode !== "dem" || !D) return;
      var ids = ["fsx-places", "fsx-pumps"].filter(function (id) { return map.getLayer(id) && map.getLayoutProperty(id, "visibility") !== "none"; });
      var h = ids.length && map.queryRenderedFeatures([[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]], { layers: ids }).length > 0;
      if (h !== hov) { hov = h; map.getCanvas().style.cursor = h ? "pointer" : ""; }
    });
  }

  var CSS = [
    ".fsx-box{margin:2px 0 8px 22px}",
    ".fsx-chips{display:flex;flex-wrap:wrap;gap:4px;margin:2px 0 6px}",
    ".fsx-chip{font-size:10.5px;padding:2px 7px;border-radius:999px;border:1px solid var(--card-border);opacity:.7}.fsx-chip.wet{opacity:1;border-color:#ef4444;background:rgba(239,68,68,.12)}",
    ".fsx-list{display:flex;flex-direction:column;gap:1px}",
    ".fsx-it{display:flex;align-items:center;gap:7px;width:100%;padding:4px 6px;border:0;border-radius:8px;background:none;color:var(--text-main);font:inherit;font-size:11.5px;cursor:pointer;text-align:left}",
    ".fsx-it:hover{background:var(--accent-soft)}.fsx-it i{width:9px;height:9px;border-radius:50%;flex:none}",
    ".fsx-it span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fsx-it small{margin-left:6px;opacity:.55;font-size:10px}.fsx-it b{white-space:nowrap}",
    ".fsx-sel{width:100%;margin:2px 0 6px;padding:5px 8px;border-radius:8px;border:1px solid var(--card-border);background:var(--card-bg);color:var(--text-main);font:inherit;font-size:12px}"
  ].join("");

  /* ================================================================ API ที่ bkk-floodsim.js เรียก */
  window.BKK_FLOODSIM_EXTRA = {
    // เรียกทุกครั้งที่ style แผนที่โหลดใหม่ (ผ่าน mount ของ bkk-floodsim.js)
    mount: function (m) {
      map = m;
      if (!document.getElementById("fsx-css")) { var s = document.createElement("style"); s.id = "fsx-css"; s.textContent = CSS; document.head.appendChild(s); }
      try { var o = JSON.parse(lsGet(LS_ON) || "null"); if (o) Object.keys(on).forEach(function (k) { if (typeof o[k] === "boolean") on[k] = o[k]; }); } catch (e) { }
      var hs = parseInt(lsGet(LS_HIST), 10); if (hs >= -1 && hs < 14) histSel = hs;
      bindMap();
      if (D) addLayers();
      if (hist && on.hist) showHist();
    },
    // สถานะล่าสุดจากตัวจำลอง: { visible, mode, L, P, drop }
    update: function (s) { st = s; if (D) scheduleApply(); else if (s.visible && s.mode === "dem") ensureData().then(function () { addLayers(); }); if (map) setVis(); },
    renderPanel: renderPanel,
    debug: function () { return { loaded: !!D, hist: !!hist, histErr: histErr, on: on, histSel: histSel, st: st, stats: stats && { road: stats.road, wetPlaces: stats.list.length, pumpsWet: stats.pumpsWet } }; }
  };
})();
