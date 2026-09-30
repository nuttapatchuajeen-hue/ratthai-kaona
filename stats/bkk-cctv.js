/**
 * bkk-cctv.js
 * ชั้น "กล้อง CCTV" ของ bkk-city.html — กล้องสาธารณะทั่วประเทศ เอาไว้ดูน้ำท่วม/ระดับน้ำ/สภาพถนน
 *
 * แหล่งกล้อง (ภาพ/วิดีโอดึงตรงจากเซิร์ฟเวอร์ของหน่วยงานตอนเปิดดู — ไม่เก็บภาพไว้เอง)
 *   dwr    ริมแม่น้ำ กรมทรัพยากรน้ำ 132 สถานี — วิดีโอสด MJPEG + ภาพนิ่งรายชั่วโมง (telemetry.dwr.go.th เปิด CORS)
 *   egat   เขื่อน กฟผ. 10 เขื่อน มุมละ 1–4 กล้อง — ภาพนิ่ง อัปเดต ~1 นาที
 *   hatyai หาดใหญ่ (คลองอู่ตะเภา) ~36 กล้อง — ภาพนิ่ง + ธงสถานะของ Hat Yai City Climate (รายชื่อดึงสด เปิด CORS)
 *   road   ถนน iTIC + กรมทางหลวง ~255 กล้อง ผ่าน Longdo Traffic — วิดีโอสด HLS (hls.js โหลดตอนกดดูครั้งแรก)
 *   bma    ทางแยก กทม. (BMA Traffic) — ภาพต้องเปิดผ่านเว็บ กทม. (ต้องมี session) จึงเป็นลิงก์
 *   coast  เรดาร์ชายฝั่ง GISTDA — เว็บกันบอท (Incapsula) จึงเป็นลิงก์ไปหน้า live ของ GISTDA
 * รายชื่อ+พิกัดของ dwr/egat/bma/coast อยู่ใน bkk-cctv-data.js (สร้างด้วย _geo/build-bkk-cctv.js · โหลดตอนเปิดชั้นครั้งแรก)
 *
 * วาดด้วยชั้น MapLibre ธรรมดา (geojson cluster + symbol ไอคอนกล้องวาดด้วย canvas) · ตัวดูกล้องอยู่ในแผงซ้าย
 */
(function () {
  "use strict";

  var LS_KEY = "bkk-cctv-on";
  var LS_SRC = "bkk-cctv-src";
  var LS_MIN = "bkk-cctv-min";
  var DATA_JS = "bkk-cctv-data.js";
  var LONGDO_URL = "https://traffic.longdo.com/camera.json";
  var HATYAI_URL = "https://hatyaicityclimate.org/api/flood/cams";
  var HLS_JS = "https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.6.15/hls.min.js";
  var DWR = "https://telemetry.dwr.go.th";
  var EGAT_IMG = "https://egatwater.egat.co.th/assets/CCTV/images/";
  var BMA = "http://www.bmatraffic.com/";

  // kind: live = มีวิดีโอสด · still = ภาพนิ่ง · link = ต้องเปิดที่เว็บต้นทาง (หมุดกลวง)
  var SRC = {
    dwr: { t: "ริมแม่น้ำ", o: "กรมทรัพยากรน้ำ", c: "#22d3ee", kind: "live", home: DWR + "/reportCctv" },
    egat: { t: "เขื่อน กฟผ.", o: "การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย (กฟผ.)", c: "#60a5fa", kind: "still", home: "https://egatwater.egat.co.th/RealTimeCCTV" },
    hatyai: { t: "หาดใหญ่", o: "Hat Yai City Climate · คลองอู่ตะเภา", c: "#a78bfa", kind: "still", home: "https://hatyaicityclimate.org/" },
    road: { t: "ถนน", o: "iTIC · กรมทางหลวง ผ่าน Longdo Traffic", c: "#f59e0b", kind: "live", home: "https://traffic.longdo.com/" },
    bma: { t: "กทม.", o: "BMA Traffic กรุงเทพมหานคร", c: "#34d399", kind: "link", home: BMA },
    coast: { t: "ชายฝั่ง", o: "GISTDA เรดาร์ชายฝั่ง", c: "#f472b6", kind: "link", home: "https://coastalradar.gistda.or.th/" }
  };
  var ORDER = ["dwr", "egat", "hatyai", "road", "bma", "coast"];
  var HY_FLAG = { green: "#22c55e", yellow: "#eab308", orange: "#f97316", red: "#ef4444" };

  var map = null, visible = false, uiBuilt = false, handlersBound = false;
  var on = { dwr: true, egat: true, hatyai: true, road: true, bma: true, coast: true };
  var ST = { dwr: "wait", egat: "wait", hatyai: "wait", road: "wait", bma: "wait", coast: "wait" };
  var RAW = { base: null, road: null, hatyai: null };
  var cams = [], selKey = null, query = "";
  var M = { mode: null, angle: 0, hls: null, timer: null, watch: null, url: null, gen: 0 };
  var listTimer = null, refreshTimer = null, hoverPop = null, hlsPromise = null, dataPromise = null;
  var pausedByHide = false;

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function fmt(n) { return Number(n).toLocaleString("th-TH"); }
  function ago(t) {
    var m = Math.round((Date.now() - t) / 60000);
    return m < 1 ? "เมื่อสักครู่" : m < 60 ? m + " นาทีที่แล้ว" : m < 48 * 60 ? Math.round(m / 60) + " ชม.ที่แล้ว" : Math.round(m / 1440) + " วันที่แล้ว";
  }
  function thTime(t) {
    return new Date(t).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" }) + " น.";
  }
  // "2026-09-30 22:17:07" (เวลาไทย) หรือ ISO → ms
  function tms(s) {
    if (!s) return null;
    var t = /[zZ]|[+-]\d\d:?\d\d$/.test(s) ? Date.parse(s) : Date.parse(String(s).replace(" ", "T") + "+07:00");
    return isFinite(t) ? t : null;
  }

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
    add("cctv", '<path d="M16.75 12h3.632a1 1 0 0 1 .894 1.447l-2.034 4.069a1 1 0 0 1-1.708.134l-2.124-2.97"/><path d="M17.106 9.053a1 1 0 0 1 .447 1.341l-3.106 6.211a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.92 2.92 0 0 1 3.92-1.3z"/><path d="M2 19h3.76a2 2 0 0 0 1.8-1.1L9 15"/><path d="M2 21v-4"/><path d="M7 9h.01"/>');
    add("image", '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>');
    add("maximize", '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>');
    add("external-link", '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>');
  }

  // ไอคอนหมุด: วงสีตามแหล่ง + กล้องสีขาว · แหล่งที่ต้องเปิดที่เว็บต้นทาง = วงกลวงขอบสี
  function camImage(color, hollow) {
    var S2 = 44, c = document.createElement("canvas");
    c.width = S2; c.height = S2;
    var g = c.getContext("2d");
    g.beginPath(); g.arc(22, 22, 18, 0, Math.PI * 2);
    g.fillStyle = hollow ? "rgba(15,20,30,.92)" : color; g.fill();
    g.lineWidth = hollow ? 4 : 3; g.strokeStyle = hollow ? color : "#fff"; g.stroke();
    var fg = hollow ? color : "#fff";
    g.fillStyle = fg;
    g.beginPath();
    if (g.roundRect) g.roundRect(11, 16, 15, 12, 3); else g.rect(11, 16, 15, 12);
    g.fill();
    g.beginPath(); g.moveTo(26, 20.5); g.lineTo(33, 16.5); g.lineTo(33, 27.5); g.lineTo(26, 23.5); g.closePath(); g.fill();
    return { width: S2, height: S2, data: g.getImageData(0, 0, S2, S2).data };
  }
  function ensureImages() {
    ORDER.forEach(function (s) {
      var id = "cctv-" + s;
      if (!map.hasImage(id)) map.addImage(id, camImage(SRC[s].c, SRC[s].kind === "link"), { pixelRatio: 2 });
    });
  }

  /* ================================================================ โหลดข้อมูล */
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = function () { res(); };
      s.onerror = function () { rej(new Error("โหลด " + src + " ไม่สำเร็จ")); };
      document.head.appendChild(s);
    });
  }
  function loadBase() {
    if (window.BKK_CCTV_DATA) { RAW.base = window.BKK_CCTV_DATA; return Promise.resolve(); }
    if (!dataPromise) dataPromise = loadScript(DATA_JS).then(function () { RAW.base = window.BKK_CCTV_DATA || null; if (!RAW.base) throw new Error("no data"); });
    return dataPromise.then(function () { ["dwr", "egat", "bma", "coast"].forEach(function (s) { ST[s] = "ok"; }); },
      function () { dataPromise = null; ["dwr", "egat", "bma", "coast"].forEach(function (s) { ST[s] = "err"; }); });
  }
  function getJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
  }
  function loadRoad() {
    return getJSON(LONGDO_URL).then(function (j) { RAW.road = { at: Date.now(), items: (j && j.item) || [] }; ST.road = "ok"; },
      function () { if (!RAW.road) ST.road = "err"; });
  }
  function loadHatyai() {
    return getJSON(HATYAI_URL).then(function (j) { RAW.hatyai = { at: Date.now(), items: (j && j.items) || [] }; ST.hatyai = "ok"; },
      function () { if (!RAW.hatyai) ST.hatyai = "err"; });
  }
  function loadAll() {
    var done = function () { rebuild(); };
    loadBase().then(done);
    loadRoad().then(done);
    loadHatyai().then(done);
  }

  /* ================================================================ รวมกล้องทุกแหล่งเป็นรูปแบบเดียว */
  var PLACEHOLDER = /X\.X\.X\.X/;
  function rebuild() {
    var out = [], b = RAW.base;
    if (b) {
      b.dwr.forEach(function (r) { out.push({ k: "dwr:" + r[1], s: "dwr", n: r[2], d: [r[3], r[4]].filter(Boolean).join(" · "), lat: r[5], lon: r[6], id: r[0], code: r[1] }); });
      b.egat.forEach(function (r) { out.push({ k: "egat:" + r[0], s: "egat", n: r[1], d: "จ." + r[2] + " · " + r[5].length + " มุมกล้อง", lat: r[3], lon: r[4], code: r[0], angles: r[5] }); });
      b.bma.forEach(function (r) { out.push({ k: "bma:" + r[0], s: "bma", n: r[1], d: (r[2] ? r[2] + " · " : "") + "กรุงเทพฯ" + (r[5] ? " · กล้องจุดน้ำท่วม" : ""), lat: r[3], lon: r[4], id: r[0], flood: !!r[5] }); });
      b.gistda.forEach(function (r) { out.push({ k: "coast:" + r[0], s: "coast", n: r[1].split(/\s+(?=ต\.|อ\.|อำเภอ|จ\.)/)[0], d: r[1], lat: r[2], lon: r[3], page: r[4] }); });
    }
    if (RAW.road) RAW.road.items.forEach(function (x) {
      var lat = +x.latitude, lon = +x.longitude;
      if (!isFinite(lat) || !isFinite(lon) || !lat || !x.hls_url && !x.imgurl) return;
      var t = String(x.title || "").trim(), m = /^\(([^)]+)\)\s*(.*)$/.exec(t);
      var doh = x.organization === "กรมทางหลวง";
      var img = x.imgurl && !PLACEHOLDER.test(x.imgurl) && !doh ? x.imgurl : null;   // ภาพนิ่งของกรมทางหลวงผ่าน iTIC ว่างเปล่า
      out.push({
        k: "road:" + x.camid, s: "road", n: m ? m[2] || m[1] : t, d: [m ? m[1] : "", doh ? "กรมทางหลวง" : "iTIC"].filter(Boolean).join(" · "),
        lat: lat, lon: lon, hls: x.hls_url || null, img: img, org: x.sponsertext || x.organization || ""
      });
    });
    if (RAW.hatyai) RAW.hatyai.items.forEach(function (x) {
      var L = x.location || {}, lat = +L.latitude, lon = +L.longitude;
      if (!isFinite(lat) || !isFinite(lon) || !lat || !x.photo) return;
      out.push({
        k: "hatyai:" + x.cameraId, s: "hatyai", n: String(x.title || x.name || "").trim(), d: "หาดใหญ่ จ.สงขลา" + (x.code ? " · " + x.code : ""),
        lat: lat, lon: lon, photo: x.photo, flag: String(x.flag || "").toLowerCase(), at: tms(x.atDate), msg: x.statusMsg || "", sponsor: x.sponsorText || x.sponsorName || "", off: x.enable === 0 || x.enable === "0"
      });
    });
    cams = out;
    setGeo();
    renderPanel();
  }
  // หาดใหญ่: ไฟล์ภาพ "ล่าสุด" ถูกเขียนทับเรื่อย ๆ แม้กล้องเสีย (ภาพข้างในยังเป็นของเก่า) — ดูเวลาจาก atDate แทน
  function isStale(c) { return c.s === "hatyai" && (c.off || !!c.at && Date.now() - c.at > 3 * 3600000); }
  function selIdx() { if (!selKey) return -1; for (var i = 0; i < cams.length; i++) if (cams[i].k === selKey) return i; return -1; }

  /* ================================================================ ชั้นบนแผนที่ */
  function geo() {
    var f = [];
    cams.forEach(function (c, i) { if (on[c.s]) f.push({ type: "Feature", geometry: { type: "Point", coordinates: [c.lon, c.lat] }, properties: { i: i, s: c.s, n: c.n } }); });
    return { type: "FeatureCollection", features: f };
  }
  function selGeo() {
    var i = selIdx(), c = cams[i];
    return { type: "FeatureCollection", features: c ? [{ type: "Feature", geometry: { type: "Point", coordinates: [c.lon, c.lat] }, properties: { c: SRC[c.s].c } }] : [] };
  }
  function setGeo() {
    if (!map) return;
    var s = map.getSource("cctv"); if (s) s.setData(geo());
    var t = map.getSource("cctv-sel"); if (t) t.setData(selGeo());
  }
  var PT_LAYERS = ["cctv-pt", "cctv-cl"];
  function addLayers() {
    if (!map || !map.getStyle()) return;
    ensureImages();
    if (!map.getSource("cctv")) map.addSource("cctv", { type: "geojson", data: geo(), cluster: true, clusterMaxZoom: 10, clusterRadius: 44 });
    if (!map.getSource("cctv-sel")) map.addSource("cctv-sel", { type: "geojson", data: selGeo() });
    if (!map.getLayer("cctv-cl")) map.addLayer({
      id: "cctv-cl", type: "circle", source: "cctv", filter: ["has", "point_count"],
      paint: {
        "circle-color": "rgba(12,18,30,.86)", "circle-stroke-color": "#38bdf8", "circle-stroke-width": 2,
        "circle-radius": ["step", ["get", "point_count"], 13, 20, 16, 80, 20, 250, 25]
      }
    });
    if (!map.getLayer("cctv-cl-n")) map.addLayer({
      id: "cctv-cl-n", type: "symbol", source: "cctv", filter: ["has", "point_count"],
      layout: { "text-field": ["get", "point_count_abbreviated"], "text-font": ["Noto Sans Bold"], "text-size": 11.5, "text-allow-overlap": true },
      paint: { "text-color": "#e0f2fe" }
    });
    if (!map.getLayer("cctv-sel")) map.addLayer({
      id: "cctv-sel", type: "circle", source: "cctv-sel",
      paint: { "circle-radius": 17, "circle-color": "rgba(255,255,255,.08)", "circle-stroke-color": ["get", "c"], "circle-stroke-width": 3 }
    });
    if (!map.getLayer("cctv-pt")) map.addLayer({
      id: "cctv-pt", type: "symbol", source: "cctv", filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": ["concat", "cctv-", ["get", "s"]], "icon-allow-overlap": true, "icon-ignore-placement": true,
        "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.75, 10, 0.9, 15, 1.1],
        "text-field": ["step", ["zoom"], "", 14, ["get", "n"]], "text-font": ["Noto Sans Regular"], "text-size": 10.5,
        "text-anchor": "top", "text-offset": [0, 1.1], "text-optional": true, "text-max-width": 11
      },
      paint: { "text-color": "#fff", "text-halo-color": "rgba(10,14,22,.9)", "text-halo-width": 1.3 }
    });
    syncLayerVis();
  }
  function syncLayerVis() {
    if (!map) return;
    ["cctv-cl", "cctv-cl-n", "cctv-sel", "cctv-pt"].forEach(function (id) {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
    });
  }
  // ให้หน้าหลักเช็กได้ว่ากดโดนหมุดกล้อง (กันการบินเข้าเขตซ้อน)
  function hit(pt) {
    if (!visible || !map) return false;
    var ids = PT_LAYERS.filter(function (id) { return map.getLayer(id); });
    if (!ids.length) return false;
    try { return map.queryRenderedFeatures([[pt.x - 9, pt.y - 9], [pt.x + 9, pt.y + 9]], { layers: ids }).length > 0; } catch (e) { return false; }
  }
  function bindHandlers() {
    if (handlersBound) return;
    handlersBound = true;
    map.on("click", function (e) {
      if (!visible) return;
      var ids = PT_LAYERS.filter(function (id) { return map.getLayer(id); });
      if (!ids.length) return;
      var fs = map.queryRenderedFeatures([[e.point.x - 9, e.point.y - 9], [e.point.x + 9, e.point.y + 9]], { layers: ids });
      if (!fs.length) return;
      var pt = fs.filter(function (f) { return f.layer.id === "cctv-pt"; })[0];
      if (pt) { select(pt.properties.i); return; }
      var cl = fs[0], src = map.getSource("cctv");
      Promise.resolve(src.getClusterExpansionZoom(cl.properties.cluster_id)).then(function (z) {
        map.easeTo({ center: cl.geometry.coordinates, zoom: Math.min(z + 0.3, 16), duration: 700 });
      }).catch(function () { });
    });
    var hov = false;
    map.on("mousemove", function (e) {
      if (!visible) { if (hoverPop) { hoverPop.remove(); hoverPop = null; } return; }
      var ids = PT_LAYERS.filter(function (id) { return map.getLayer(id); });
      var fs = ids.length ? map.queryRenderedFeatures([[e.point.x - 8, e.point.y - 8], [e.point.x + 8, e.point.y + 8]], { layers: ids }) : [];
      var h = fs.length > 0;
      if (h !== hov) { hov = h; map.getCanvas().style.cursor = h ? "pointer" : ""; }
      var pt = fs.filter(function (f) { return f.layer.id === "cctv-pt"; })[0];
      if (!pt) { if (hoverPop) { hoverPop.remove(); hoverPop = null; } return; }
      var c = cams[pt.properties.i];
      if (!c) return;
      var html = '<b>' + esc(c.n) + '</b><br><small>' + esc(SRC[c.s].t) + ' · ' + (SRC[c.s].kind === "link" ? "เปิดที่เว็บต้นทาง" : SRC[c.s].kind === "live" ? "วิดีโอสด" : "ภาพนิ่ง") + '</small>';
      if (!hoverPop) hoverPop = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: "cv-tip", offset: 14, maxWidth: "240px" });
      hoverPop.setLngLat(pt.geometry.coordinates).setHTML(html).addTo(map);
    });
    map.on("moveend", function () { if (visible) scheduleList(); });
  }

  /* ================================================================ ตัวดูกล้อง */
  function stopMedia() {
    M.gen++;
    clearInterval(M.timer); M.timer = null;
    clearTimeout(M.watch); M.watch = null;
    if (M.hls) { try { M.hls.destroy(); } catch (e) { } M.hls = null; }
    var box = document.getElementById("cvMedia");
    if (box) {
      box.querySelectorAll("video").forEach(function (v) { try { v.pause(); v.removeAttribute("src"); v.load(); } catch (e) { } });
      box.querySelectorAll("img").forEach(function (im) { im.onload = im.onerror = null; im.removeAttribute("src"); });   // ตัดสตรีม MJPEG ทันที
      box.innerHTML = "";
    }
    if (M.url) { URL.revokeObjectURL(M.url); M.url = null; }
  }
  function modesOf(c) {
    if (c.s === "dwr") return ["live", "still"];
    if (c.s === "road") return c.hls ? (c.img ? ["live", "still"] : ["live"]) : ["still"];
    if (c.s === "egat" || c.s === "hatyai") return ["still"];
    return ["link"];
  }
  function msg(html, cls) { return '<div class="cv-msg' + (cls ? " " + cls : "") + '">' + html + '</div>'; }
  function setMeta(html) { var el = document.getElementById("cvMeta"); if (el) el.innerHTML = html; }
  function select(i, opt) {
    var c = cams[i];
    if (!c) return;
    selKey = c.k;
    M.mode = modesOf(c)[0]; M.angle = 0;
    var p = $("#cctvPanel");
    if (p && p.classList.contains("min")) { p.classList.remove("min"); lsSet(LS_MIN, "0"); }
    var t = map && map.getSource("cctv-sel"); if (t) t.setData(selGeo());
    renderViewer();
    renderList();
    if (opt && opt.fly) map.flyTo({ center: [c.lon, c.lat], zoom: Math.max(map.getZoom(), 13), duration: 1400, essential: true });
    if (p) p.scrollTop = 0;   // ตัวดูอยู่บนสุดของแผง (หัวแผงเป็น sticky — scrollIntoView จะบังชื่อกล้อง)
  }
  function closeViewer() {
    stopMedia();
    selKey = null;
    var t = map && map.getSource("cctv-sel"); if (t) t.setData(selGeo());
    renderViewer(); renderList();
  }
  function renderViewer() {
    stopMedia();
    var v = $("#cvView");
    if (!v) return;
    var c = cams[selIdx()];
    if (!c) {
      v.innerHTML = '<div class="cv-empty">' + ico("cctv") + '<span>กดหมุดกล้องบนแผนที่ หรือเลือกจากรายการด้านล่าง<br><small>หมุดทึบ = ดูภาพในหน้านี้ได้ · หมุดกลวง = เปิดดูที่เว็บของหน่วยงาน</small></span></div>';
      return;
    }
    var S = SRC[c.s], modes = modesOf(c), h = "";
    h += '<div class="cv-vh"><i class="cv-dot" style="background:' + S.c + '"></i><div class="cv-vt"><b>' + esc(c.n) + '</b><small>' + esc(S.t) + ' · ' + esc(c.d) + '</small></div>' +
      '<button type="button" class="cv-ib" data-a="unsel" title="ปิดกล้องนี้">×</button></div>';
    if (modes.length > 1 || c.s === "egat") {
      h += '<div class="cv-tabs">';
      if (modes.length > 1) h += modes.map(function (m) {
        return '<button type="button" data-m="' + m + '"' + (m === M.mode ? ' class="on"' : "") + '>' + (m === "live" ? '<i class="cv-live"></i>สด' : ico("image") + ' ภาพนิ่ง') + '</button>';
      }).join("");
      if (c.s === "egat") h += c.angles.map(function (n, k) { return '<button type="button" data-g="' + k + '"' + (k === M.angle ? ' class="on"' : "") + '>มุม ' + n + '</button>'; }).join("");
      h += '</div>';
    }
    if (isStale(c)) h += '<div class="cv-stale">' + ico("triangle-alert") + ' กล้องนี้ไม่ได้ส่งภาพใหม่' + (c.at ? 'ตั้งแต่ ' + thTime(c.at) + ' (' + ago(c.at) + ')' : "") + ' — <b>ภาพที่เห็นเป็นภาพเก่า ไม่ใช่สถานการณ์ตอนนี้</b></div>';
    h += '<div class="cv-media" id="cvMedia"></div>';
    h += '<div class="cv-meta" id="cvMeta"></div>';
    h += '<div class="cv-acts">' +
      (M.mode !== "link" ? '<button type="button" class="cv-btn" data-a="full" title="ขยายเต็มจอ">' + ico("maximize") + ' เต็มจอ</button>' : "") +
      (M.mode === "still" ? '<button type="button" class="cv-btn" data-a="reload" title="โหลดภาพใหม่">' + ico("refresh-cw") + ' โหลดใหม่</button>' : "") +
      '<a class="cv-btn" href="' + esc(sourcePage(c)) + '" target="_blank" rel="noopener" title="เปิดเว็บต้นทาง">' + ico("external-link") + ' เว็บต้นทาง</a>' +
      '<button type="button" class="cv-btn" data-a="fly" title="บินไปที่กล้อง">' + ico("map-pin") + ' ไปที่กล้อง</button></div>';
    v.innerHTML = h;
    mountMedia(c);
  }
  function sourcePage(c) {
    if (c.s === "dwr") return DWR + "/station/" + encodeURIComponent(c.code);
    if (c.s === "coast") return c.page;
    if (c.s === "bma") return BMA + "index.aspx";
    return SRC[c.s].home;
  }
  function mountMedia(c) {
    var box = document.getElementById("cvMedia"), gen = M.gen, pn = $("#cctvPanel");
    if (!box || pn && pn.classList.contains("min")) return;   // แผงย่ออยู่ — ไม่เปิดสตรีมทิ้งไว้
    var alive = function () { return gen === M.gen && document.getElementById("cvMedia") === box; };
    var S = SRC[c.s];
    if (M.mode === "link") {
      box.classList.add("cv-linkbox");
      if (c.s === "bma") {
        box.innerHTML = msg(ico("external-link") + '<b>ภาพกล้อง กทม. ต้องเปิดผ่านเว็บ BMA Traffic</b><span>ระบบของ กทม. ให้ดูภาพได้เฉพาะหลังเข้าหน้าเว็บของ กทม. ก่อน — กดปุ่มแล้วจะเปิดเว็บ กทม. ในแท็บใหม่ และพาไปหน้ากล้องนี้ให้อัตโนมัติ</span>' +
          '<button type="button" class="cv-go" data-a="bma" style="--c:' + S.c + '">เปิดกล้องนี้ที่เว็บ กทม. ' + ico("external-link") + '</button>' +
          (c.flood ? '<small>กล้องนี้ กทม. ปักหมุดเป็น "กล้องจุดน้ำท่วม"</small>' : ""));
      } else {
        box.innerHTML = msg(ico("external-link") + '<b>ดูวิดีโอสดที่เว็บ GISTDA</b><span>กล้องประจำสถานีเรดาร์ชายฝั่ง หันดูทะเล ใช้ดูคลื่นและน้ำทะเลหนุน — เว็บ GISTDA มีระบบกันบอท จึงฝังในหน้านี้ไม่ได้ อาจต้องยืนยันตัวตนก่อนดู</span>' +
          '<a class="cv-go" href="' + esc(c.page) + '" target="_blank" rel="noopener" style="--c:' + S.c + '">เปิดหน้าสด GISTDA ' + ico("external-link") + '</a>');
      }
      setMeta('ข้อมูล: ' + esc(S.o));
      return;
    }
    box.innerHTML = '<div class="cv-spin"></div>';
    if (c.s === "dwr" && M.mode === "live") {
      var im = new Image();
      im.alt = c.n; im.className = "cv-img";
      box.insertAdjacentHTML("beforeend", '<div class="cv-wait">กำลังต่อวิดีโอสด… ภาพแรกใช้เวลาราว 10 วินาที</div>');
      var shown = function () { box.querySelectorAll(".cv-spin,.cv-wait").forEach(function (x) { x.remove(); }); };
      im.onload = function () { if (alive()) shown(); };
      im.onerror = function () { if (alive()) fallbackDwr("สตรีมสดของกล้องนี้ไม่ตอบ"); };
      box.appendChild(im);
      im.src = DWR + "/api/public/cctv/mjpegStream?stnCode=" + encodeURIComponent(c.code);
      // MJPEG บางเบราว์เซอร์ไม่ยิง onload — ดูว่าถอดรหัสเฟรมแรกได้หรือยัง
      var t0 = Date.now();
      M.timer = setInterval(function () {
        if (!alive()) return;
        if (im.naturalWidth > 0) { shown(); clearInterval(M.timer); M.timer = null; clearTimeout(M.watch); M.watch = null; }
        else if (Date.now() - t0 > 25000) fallbackDwr("สตรีมสดไม่มีภาพภายใน 25 วินาที (กล้องอาจออฟไลน์)");
      }, 500);
      setMeta('<i class="cv-live"></i> วิดีโอสด (MJPEG) จากสถานีโทรมาตร ' + esc(c.code) + ' · ข้อมูล: กรมทรัพยากรน้ำ');
      return;
    }
    if (c.s === "dwr") { dwrStill(c, box, alive, ""); return; }
    if (c.s === "road" && M.mode === "live") { roadLive(c, box, alive); return; }
    if (c.s === "road") { stillImg(box, alive, c.img, null, "ภาพนิ่งจาก iTIC", 0); return; }
    if (c.s === "egat") {
      var n = c.angles[M.angle] || c.angles[0];
      var url = function () { return EGAT_IMG + c.code + "/" + n + ".jpg?t=" + Date.now(); };
      stillImg(box, alive, url, null, "", 60000);
      setMeta('ภาพนิ่ง อัปเดตทุก ~1 นาที (เวลาประทับอยู่มุมภาพ) · ข้อมูล: ' + esc(S.o));
      return;
    }
    if (c.s === "hatyai") {
      var u2 = function () { return c.photo + (c.photo.indexOf("?") < 0 ? "?" : "&") + "t=" + Date.now(); };
      stillImg(box, alive, u2, null, "", 120000);
      var fc = HY_FLAG[c.flag];
      setMeta((fc ? '<span class="cv-flag" style="--f:' + fc + '"></span>สถานะที่ Hat Yai City Climate ตั้งไว้: <b>ธง' + ({ green: "เขียว", yellow: "เหลือง", orange: "ส้ม", red: "แดง" }[c.flag] || c.flag) + '</b> · ' : "") +
        (c.at ? "ภาพล่าสุด " + ago(c.at) + " · " : "") + (c.msg ? esc(c.msg) + " · " : "") + 'อัปเดตทุก ~2 นาที' +
        (c.sponsor ? '<br><small>' + esc(c.sponsor) + '</small>' : "") + '<br><small>ข้อมูล: ' + esc(S.o) + '</small>');
    }
  }
  function stillImg(box, alive, url, onok, note, every) {
    var get = typeof url === "function" ? url : function () { return url; };
    var im = new Image(), first = true;
    im.className = "cv-img"; im.alt = "";
    im.onload = function () {
      if (!alive()) return;
      if (first) { first = false; var sp = box.querySelector(".cv-spin"); if (sp) sp.remove(); box.appendChild(im); }
      var e = box.querySelector(".cv-msg"); if (e) e.remove();
      if (onok) onok();
    };
    im.onerror = function () {
      if (!alive() || !first) return;
      box.innerHTML = msg(ico("triangle-alert") + '<b>โหลดภาพไม่ได้</b><span>กล้องอาจปิดอยู่หรือเซิร์ฟเวอร์ต้นทางไม่ตอบ ลองกด "โหลดใหม่" หรือ "เว็บต้นทาง"</span>', "err");
    };
    im.src = get();
    if (every) M.timer = setInterval(function () { if (alive() && !document.hidden) im.src = get(); }, every);
  }
  function fallbackDwr(why) {
    var c = cams[selIdx()];
    if (!c || c.s !== "dwr") return;
    stopMedia();
    M.mode = "still";
    renderViewer();
    var box = document.getElementById("cvMedia");
    if (box) box.insertAdjacentHTML("afterbegin", msg(ico("triangle-alert") + '<span>' + esc(why) + ' — แสดงภาพนิ่งล่าสุดแทน</span>', "note"));
  }
  function dwrStill(c, box, alive) {
    fetch(DWR + "/api/public/reportCctv/snapshot/" + encodeURIComponent(c.id), { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (j) {
      var p = String((j && j.value) || "").trim();
      if (!p) throw new Error("ไม่มีภาพ");
      return fetch(DWR + "/api/file/image/cctv", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: p }) }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.blob();
      }).then(function (b) { return { b: b, p: p }; });
    }).then(function (x) {
      if (!alive()) return;
      M.url = URL.createObjectURL(x.b);
      var sp = box.querySelector(".cv-spin"); if (sp) sp.remove();
      var im = new Image(); im.className = "cv-img"; im.alt = c.n; im.src = M.url;
      box.appendChild(im);
      // path: /<รหัส>/<ปี>/<เดือน>/<วัน>/<ชั่วโมง>_<n>.jpg (เวลาไทย)
      var m = /\/(\d{4})\/(\d{1,2})\/(\d{1,2})\/(\d{1,2})_/.exec(x.p), when = "";
      if (m) {
        var t = Date.parse(m[1] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[3]).slice(-2) + "T" + ("0" + m[4]).slice(-2) + ":00:00+07:00");
        if (isFinite(t)) when = "ภาพช่วง " + thTime(t) + " (" + ago(t) + ")";
      }
      setMeta(ico("image") + ' ภาพนิ่งรายชั่วโมง' + (when ? " · " + when : "") + ' · สถานี ' + esc(c.code) + ' · ข้อมูล: กรมทรัพยากรน้ำ');
    }).catch(function (e) {
      if (!alive()) return;
      box.innerHTML = msg(ico("triangle-alert") + '<b>ยังไม่มีภาพจากกล้องนี้</b><span>' + esc(e.message || e) + ' — กล้องอาจออฟไลน์ ลองดูที่เว็บกรมทรัพยากรน้ำ</span>', "err");
      setMeta('สถานี ' + esc(c.code) + ' · ข้อมูล: กรมทรัพยากรน้ำ');
    });
  }
  function loadHls() {
    if (window.Hls) return Promise.resolve(window.Hls);
    if (!hlsPromise) hlsPromise = loadScript(HLS_JS).then(function () { if (!window.Hls) throw new Error("no Hls"); return window.Hls; }, function (e) { hlsPromise = null; throw e; });
    return hlsPromise;
  }
  function roadLive(c, box, alive) {
    var S = SRC.road;
    setMeta('<i class="cv-live"></i> วิดีโอสด · ' + esc(c.org || "iTIC") + ' · ข้อมูล: ' + esc(S.o));
    var v = document.createElement("video");
    v.muted = true; v.autoplay = true; v.playsInline = true; v.controls = true; v.className = "cv-img";
    v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
    var ok = false;
    var fail = function (why) {
      if (!alive() || ok) return;
      if (M.hls) { try { M.hls.destroy(); } catch (e) { } M.hls = null; }
      if (c.img) {
        M.mode = "still"; renderViewer();
        var b2 = document.getElementById("cvMedia");
        if (b2) b2.insertAdjacentHTML("afterbegin", msg(ico("triangle-alert") + '<span>' + esc(why) + ' — แสดงภาพนิ่งแทน</span>', "note"));
        return;
      }
      box.innerHTML = msg(ico("triangle-alert") + '<b>เล่นวิดีโอไม่ได้</b><span>' + esc(why) + ' — กล้องอาจออฟไลน์ ลองดูที่ Longdo Traffic</span>', "err");
    };
    v.addEventListener("playing", function () { if (!alive()) return; ok = true; var sp = box.querySelector(".cv-spin"); if (sp) sp.remove(); });
    box.appendChild(v);
    M.watch = setTimeout(function () { fail("ไม่มีภาพภายใน 20 วินาที"); }, 20000);
    if (v.canPlayType("application/vnd.apple.mpegurl")) {   // Safari/iOS เล่น HLS เองได้
      v.src = c.hls;
      v.addEventListener("error", function () { fail("สตรีมเสีย"); });
      return;
    }
    loadHls().then(function (Hls) {
      if (!alive()) return;
      if (!Hls.isSupported()) { fail("เบราว์เซอร์นี้เล่นวิดีโอสดไม่ได้"); return; }
      var h = new Hls({ enableWorker: true, lowLatencyMode: false, backBufferLength: 10, maxBufferLength: 12, manifestLoadingMaxRetry: 1, levelLoadingMaxRetry: 2 });
      M.hls = h;
      h.on(Hls.Events.ERROR, function (ev, d) {
        if (!d || !d.fatal) return;
        if (d.type === Hls.ErrorTypes.MEDIA_ERROR) { try { h.recoverMediaError(); return; } catch (e) { } }
        fail(d.type === Hls.ErrorTypes.NETWORK_ERROR ? "เชื่อมต่อกล้องไม่ได้" : "สตรีมเสีย");
      });
      h.loadSource(c.hls);
      h.attachMedia(v);
      h.on(Hls.Events.MANIFEST_PARSED, function () { var p = v.play(); if (p && p.catch) p.catch(function () { }); });
    }).catch(function () { fail("โหลดตัวเล่นวิดีโอไม่สำเร็จ"); });
  }
  // กทม.: ภาพจะขึ้นเมื่อมี session จากหน้าแรกของ BMA Traffic ก่อน → เปิดหน้าแรกในแท็บใหม่ แล้วค่อยพาไปหน้ากล้อง (ขั้นตอนเดียวกับที่คนกดเอง)
  function openBma(id) {
    var w = null;
    try { w = window.open("about:blank", "_blank"); } catch (e) { }
    if (!w) { window.open(BMA + "index.aspx", "_blank", "noopener"); return; }
    try { w.opener = null; } catch (e) { }
    w.location.href = BMA + "index.aspx";
    setTimeout(function () { try { w.location.href = BMA + "PlayVideo.aspx?ID=" + encodeURIComponent(id); } catch (e) { } }, 3000);
  }

  /* ================================================================ แผงควบคุม */
  var CSS = [
    "#cctvPanel{position:absolute;z-index:44;left:14px;top:120px;width:350px;max-width:calc(100% - 28px);max-height:calc(100% - 140px);overflow:auto;display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.5}",
    "#cctvPanel.open{display:block;animation:elvIn .22s ease}",
    "#busPanel.open~#cctvPanel,#fsPanel.open~#cctvPanel{left:376px}",
    ".cv-ph{display:flex;align-items:center;gap:8px;padding:11px 12px 6px 14px;font-weight:800;font-size:13.5px;position:sticky;top:0;background:var(--card-bg);z-index:2}",
    ".cv-ph>.mdico{color:#22d3ee;width:16px;height:16px}.cv-ph .cv-ib:first-of-type{margin-left:auto}",
    ".cv-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".cv-ib .mdico{width:13px;height:13px}",
    "#cctvPanel.min .cv-body{display:none}",
    ".cv-body{padding:0 14px 12px}",
    ".cv-view{margin:2px 0 8px}",
    ".cv-empty{display:flex;gap:10px;align-items:center;padding:10px 11px;border-radius:10px;border:1px dashed var(--card-border);font-size:12px;opacity:.85}",
    ".cv-empty .mdico{width:22px;height:22px;flex:none;color:#22d3ee}.cv-empty small{opacity:.75}",
    ".cv-vh{display:flex;align-items:flex-start;gap:8px;margin-bottom:6px}.cv-vt{flex:1;min-width:0}.cv-vt b{display:block;font-size:13px;line-height:1.35}.cv-vt small{opacity:.7;font-size:11px;display:block}",
    ".cv-dot{width:10px;height:10px;border-radius:50%;flex:none;margin-top:4px;box-shadow:0 0 0 2px rgba(255,255,255,.25)}",
    ".cv-tabs{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 6px}",
    ".cv-tabs button{border:1px solid var(--card-border);background:rgba(127,127,127,.08);color:inherit;font:inherit;font-size:11.5px;border-radius:999px;padding:2px 10px;cursor:pointer;display:inline-flex;align-items:center;gap:5px}",
    ".cv-tabs button.on{background:var(--accent-soft);border-color:var(--accent);font-weight:700}.cv-tabs .mdico{width:12px;height:12px}",
    ".cv-live{display:inline-block;width:7px;height:7px;border-radius:50%;background:#ef4444;box-shadow:0 0 0 0 rgba(239,68,68,.6);animation:cvPulse 1.6s infinite;vertical-align:1px;margin-right:2px}",
    "@keyframes cvPulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,.55)}70%{box-shadow:0 0 0 6px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}",
    ".cv-media{position:relative;aspect-ratio:16/9;background:#05080d;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center}",
    ".cv-media.cv-linkbox{aspect-ratio:auto;min-height:0;background:rgba(127,127,127,.07);border:1px solid var(--card-border)}",
    ".cv-media:fullscreen{border-radius:0;aspect-ratio:auto}",
    ".cv-img{width:100%;height:100%;object-fit:contain;display:block;background:#05080d}",
    ".cv-wait{position:absolute;left:0;right:0;top:50%;margin-top:22px;text-align:center;font-size:11px;color:#cbd5e1;opacity:.85}",
    ".cv-stale{margin:0 0 6px;padding:5px 8px;border-radius:8px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.45);font-size:11px;line-height:1.5}.cv-stale .mdico{width:12px;height:12px;vertical-align:-2px;color:#f59e0b}",
    ".cv-spin{position:absolute;left:50%;top:50%;margin:-14px 0 0 -14px;width:28px;height:28px;border-radius:50%;border:3px solid rgba(255,255,255,.18);border-top-color:#22d3ee;animation:cvSpin .9s linear infinite}",
    "@keyframes cvSpin{to{transform:rotate(360deg)}}",
    ".cv-msg{display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;padding:14px 16px;color:#e5e7eb;font-size:11.5px;line-height:1.55}",
    ".cv-linkbox .cv-msg{color:var(--text-main)}",
    ".cv-msg .mdico{width:20px;height:20px;opacity:.85}.cv-msg span{opacity:.85}.cv-msg small{opacity:.75}",
    ".cv-msg.err .mdico{color:#f59e0b}",
    ".cv-msg.note{position:absolute;left:6px;right:6px;top:6px;z-index:1;flex-direction:row;padding:4px 8px;border-radius:8px;background:rgba(10,14,22,.78);font-size:10.5px;text-align:left}.cv-msg.note .mdico{width:13px;height:13px;flex:none;color:#f59e0b}",
    ".cv-go{margin-top:4px;display:inline-flex;align-items:center;gap:6px;border:0;border-radius:9px;padding:6px 12px;background:var(--c);color:#06121a;font:inherit;font-weight:800;font-size:12px;cursor:pointer;text-decoration:none}.cv-go .mdico{width:13px;height:13px;opacity:1}",
    ".cv-meta{font-size:10.5px;opacity:.78;margin:5px 0 0;line-height:1.5}.cv-meta .mdico{width:11px;height:11px;vertical-align:-1px}",
    ".cv-flag{display:inline-block;width:8px;height:11px;margin-right:4px;vertical-align:-1px;background:var(--f);clip-path:polygon(0 0,100% 20%,100% 60%,0 80%)}",
    ".cv-acts{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}",
    ".cv-btn{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--card-border);background:rgba(127,127,127,.08);color:inherit;font:inherit;font-size:11px;border-radius:8px;padding:3px 8px;cursor:pointer;text-decoration:none}",
    ".cv-btn:hover{background:var(--accent-soft)}.cv-btn .mdico{width:12px;height:12px}",
    ".cv-chips{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 7px;padding-top:8px;border-top:1px solid var(--card-border)}",
    ".cv-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--card-border);background:rgba(127,127,127,.06);color:inherit;font:inherit;font-size:11.5px;border-radius:999px;padding:2px 9px 2px 7px;cursor:pointer;opacity:.55}",
    ".cv-chip.on{opacity:1;background:rgba(127,127,127,.13)}.cv-chip i{width:9px;height:9px;border-radius:50%;flex:none}.cv-chip i.h{background:transparent!important;border:2px solid}",
    ".cv-chip small{opacity:.7;font-variant-numeric:tabular-nums}",
    ".cv-search{display:flex;align-items:center;gap:6px;border:1px solid var(--card-border);border-radius:9px;padding:4px 8px;background:rgba(127,127,127,.06);margin-bottom:6px}",
    ".cv-search .mdico{width:13px;height:13px;opacity:.6;flex:none}.cv-search input{flex:1;min-width:0;border:0;background:transparent;color:inherit;font:inherit;font-size:12px;outline:none}",
    ".cv-lh{display:flex;align-items:baseline;gap:6px;font-weight:800;margin:2px 0 4px}.cv-lh small{margin-left:auto;font-weight:500;opacity:.65;font-size:10.5px}",
    ".cv-list{display:flex;flex-direction:column;gap:3px;max-height:260px;overflow:auto}",
    ".cv-it{display:flex;align-items:center;gap:8px;border:0;background:rgba(127,127,127,.07);border-radius:8px;padding:5px 8px;color:inherit;font:inherit;font-size:12px;text-align:left;cursor:pointer}",
    ".cv-it:hover{background:var(--accent-soft)}.cv-it.sel{outline:1.5px solid var(--accent)}.cv-it span{flex:1;min-width:0}.cv-it span small{opacity:.65;display:block;font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".cv-it em{font-style:normal;font-size:10px;opacity:.8;white-space:nowrap;border-radius:5px;padding:0 5px;background:rgba(127,127,127,.14)}",
    ".cv-it i{width:9px;height:9px;border-radius:50%;flex:none}.cv-it i.h{background:transparent!important;border:2px solid}",
    ".cv-note{font-size:10.5px;opacity:.7;margin:5px 0 0}",
    ".cv-off{display:flex;flex-wrap:wrap;align-items:center;gap:3px 6px;margin:0 0 5px;padding:5px 8px;border-radius:8px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.4);font-size:11px;line-height:1.5}",
    ".cv-off i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:3px;vertical-align:0}.cv-off i.h{background:transparent!important;border:2px solid}.cv-off .cv-btn{margin-left:auto;padding:1px 9px}",
    ".cv-src{margin:10px 0 0;font-size:10px;opacity:.62;line-height:1.55}.cv-src a{color:inherit}",
    ".cv-tip .maplibregl-popup-content{background:var(--card-bg);color:var(--text-main);border:1px solid var(--card-border);border-radius:9px;padding:5px 9px;font-size:11.5px;line-height:1.4;box-shadow:0 6px 18px rgba(0,0,0,.3)}",
    ".cv-tip .maplibregl-popup-tip{display:none}.cv-tip small{opacity:.7}",
    "@media (max-width:760px){#cctvPanel,#busPanel.open~#cctvPanel,#fsPanel.open~#cctvPanel{top:auto;bottom:80px;left:14px;right:14px;width:auto;max-height:62vh}.cv-list{max-height:180px}}"
  ].join("");

  function counts() {
    var n = {}; ORDER.forEach(function (s) { n[s] = 0; });
    cams.forEach(function (c) { n[c.s]++; });
    return n;
  }
  function dotHtml(s) { var S = SRC[s]; return S.kind === "link" ? '<i class="h" style="border-color:' + S.c + '"></i>' : '<i style="background:' + S.c + '"></i>'; }
  function renderPanel() {
    var p = $("#cctvPanel");
    if (!p || !visible) return;
    var n = counts();
    var chips = $("#cvChips");
    if (chips) chips.innerHTML = ORDER.map(function (s) {
      var lab = ST[s] === "err" ? "โหลดไม่ได้" : ST[s] === "wait" && !n[s] ? "…" : fmt(n[s]);
      return '<button type="button" class="cv-chip' + (on[s] ? " on" : "") + '" data-s="' + s + '" title="' + esc(SRC[s].o) + ' — กดเพื่อเปิด/ปิด">' + dotHtml(s) + esc(SRC[s].t) + ' <small>' + lab + '</small></button>';
    }).join("");
    renderList();
    var src = $("#cvSrc");
    if (src) {
      var b = RAW.base;
      src.innerHTML = 'กล้อง: ' + ORDER.map(function (s) { return '<a href="' + esc(SRC[s].home) + '" target="_blank" rel="noopener">' + esc(SRC[s].o) + '</a>'; }).join(" · ") +
        '<br>ภาพและวิดีโอเป็นของหน่วยงานเจ้าของกล้อง ดึงตรงจากเซิร์ฟเวอร์ของหน่วยงานตอนเปิดดู เว็บนี้ไม่เก็บภาพไว้ · กล้องอาจออฟไลน์หรือภาพล่าช้า ใช้ประกอบการติดตามสถานการณ์เท่านั้น ไม่ใช่ประกาศเตือนภัย · ปภ. 1784' +
        (b ? '<br>รายชื่อกล้องริมแม่น้ำ/เขื่อน/กทม./ชายฝั่ง ณ ' + esc(b.built) + ' · ถนนและหาดใหญ่ดึงสด' : "") +
        (RAW.road ? ' (ถนน ' + ago(RAW.road.at) + ')' : "");
    }
  }
  function scheduleList() { clearTimeout(listTimer); listTimer = setTimeout(renderList, 250); }
  // ระยะจากกลางจอ (กม.) — ประมาณบนระนาบท้องถิ่น พอสำหรับเรียงลำดับ/บอกระยะคร่าว ๆ
  function kmTo(c, ctr) {
    var dx = (c.lon - ctr.lng) * Math.cos(ctr.lat * Math.PI / 180), dy = c.lat - ctr.lat;
    return Math.sqrt(dx * dx + dy * dy) * 111.32;
  }
  function kmText(k) { return k < 1 ? "<1 กม." : k < 10 ? k.toFixed(1) + " กม." : fmt(Math.round(k)) + " กม."; }
  function itemHtml(r, sel, showKm) {
    var c = r.c, S = SRC[c.s];
    var tag = S.kind === "link" ? "ลิงก์" : c.s === "dwr" || c.s === "road" && c.hls ? "สด" : isStale(c) ? "ภาพเก่า" : "ภาพนิ่ง";
    return '<button type="button" class="cv-it' + (c.k === sel ? " sel" : "") + '" data-i="' + r.i + '">' + dotHtml(c.s) +
      '<span><b>' + esc(c.n) + '</b><small>' + esc(S.t) + ' · ' + esc(c.d) + '</small></span><em>' + tag + (showKm ? " · " + kmText(r.km) : "") + '</em></button>';
  }
  function renderList() {
    var box = $("#cvList"), head = $("#cvLh");
    if (!box || !visible) return;
    var q = query.trim().toLowerCase(), rows = [], sel = selKey, offIn = {};
    if (!cams.length) { box.innerHTML = '<p class="cv-note">กำลังโหลดรายชื่อกล้อง…</p>'; if (head) head.innerHTML = "กล้อง"; return; }
    var ctr = map.getCenter(), bnd = map.getBounds();
    cams.forEach(function (c, i) {
      if (q) { if (!on[c.s] || (c.n + " " + c.d + " " + SRC[c.s].t).toLowerCase().indexOf(q) < 0) return; }
      else if (!bnd.contains([c.lon, c.lat])) return;
      else if (!on[c.s]) { offIn[c.s] = (offIn[c.s] || 0) + 1; return; }   // อยู่ในกรอบแต่แหล่งนั้นปิดอยู่ — นับไว้บอกผู้ใช้
      rows.push({ c: c, i: i, km: kmTo(c, ctr), link: SRC[c.s].kind === "link" ? 1 : 0 });
    });
    rows.sort(function (a, b) { return a.link - b.link || a.km - b.km; });
    // ไม่มีกล้องที่เปิดอยู่ในกรอบ → เสนอกล้องใกล้กลางจอที่สุดแทนรายการว่าง
    var near = !q && !rows.length;
    if (near) {
      cams.forEach(function (c, i) { if (on[c.s]) rows.push({ c: c, i: i, km: kmTo(c, ctr) }); });
      rows.sort(function (a, b) { return a.km - b.km; });
      rows = rows.slice(0, 10);
    }
    var offKeys = ORDER.filter(function (s) { return offIn[s]; });
    var offHtml = offKeys.length ? '<div class="cv-off">ในกรอบนี้มีกล้อง ' + offKeys.map(function (s) { return dotHtml(s) + '<b>' + esc(SRC[s].t) + '</b> ' + fmt(offIn[s]) + ' ตัว'; }).join(" · ") +
      ' ที่ปิดอยู่ <button type="button" class="cv-btn" data-a="enoff" data-v="' + offKeys.join(",") + '">เปิด</button></div>' : "";
    var LIM = 60;
    if (head) head.innerHTML = near ? 'กล้องใกล้กลางจอที่สุด<small>ไม่มีกล้องที่เปิดอยู่ในกรอบนี้</small>'
      : (q ? 'ผลค้นหา' : 'กล้องในกรอบแผนที่') + '<small>' + fmt(rows.length) + ' ตัว' + (rows.length > LIM ? ' · แสดง ' + LIM + ' ตัวใกล้กลางจอ' : "") + '</small>';
    if (!rows.length) {
      box.innerHTML = offHtml + '<p class="cv-note">' + (q ? "ไม่พบกล้องที่ตรงกับคำค้น (ค้นเฉพาะแหล่งที่เปิดอยู่)" : "ปิดทุกแหล่งอยู่ — กดชิปด้านบนเพื่อเปิด") + '</p>';
      return;
    }
    box.innerHTML = offHtml + rows.slice(0, LIM).map(function (r) { return itemHtml(r, sel, near); }).join("");
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    addIcons();
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnCctvToggle")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "menu-btn"; b.id = "btnCctvToggle";
      b.title = "เปิด/ปิดชั้นกล้อง CCTV — กล้องริมแม่น้ำ เขื่อน ถนน และจุดน้ำท่วมทั่วประเทศ ดูภาพ/วิดีโอสดจากหน่วยงาน";
      b.innerHTML = '<span>' + ico("cctv") + '</span><span class="label-text"> กล้อง CCTV</span>';
      b.addEventListener("click", function () { setVisible(!visible); });
      var after = $("#btnFloodToggle");
      if (after && after.parentNode === menu) menu.insertBefore(b, after.nextSibling); else menu.appendChild(b);
    }
    if (!$("#cctvPanel")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var p = document.createElement("div");
      p.id = "cctvPanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "กล้อง CCTV");
      p.innerHTML = '<div class="cv-ph">' + ico("cctv") + ' กล้อง CCTV' +
        '<button type="button" class="cv-ib" data-a="min" title="ย่อ/ขยาย">' + ico("minus") + '</button>' +
        '<button type="button" class="cv-ib" data-a="close" title="ปิดชั้นนี้">×</button></div>' +
        '<div class="cv-body"><div class="cv-view" id="cvView"></div>' +
        '<div class="cv-chips" id="cvChips"></div>' +
        '<label class="cv-search">' + ico("search") + '<input type="search" id="cvQ" placeholder="ค้นหาชื่อกล้อง จังหวัด แม่น้ำ เขื่อน…" autocomplete="off"></label>' +
        '<div class="cv-lh" id="cvLh">กล้อง</div><div class="cv-list" id="cvList"></div>' +
        '<p class="cv-src" id="cvSrc"></p></div>';
      if (lsGet(LS_MIN) === "1") p.classList.add("min");
      stage.appendChild(p);
      p.addEventListener("click", function (e) {
        var a = e.target.closest("[data-a]");
        if (a) {
          var act = a.dataset.a, c = cams[selIdx()];
          if (act === "close") { setVisible(false); return; }
          if (act === "min") { var m = !p.classList.contains("min"); p.classList.toggle("min", m); lsSet(LS_MIN, m ? "1" : "0"); if (m) stopMedia(); else renderViewer(); return; }
          if (act === "unsel") { closeViewer(); return; }
          if (act === "full") { var box = document.getElementById("cvMedia"); if (box && box.requestFullscreen) box.requestFullscreen().catch(function () { }); return; }
          if (act === "reload") { renderViewer(); return; }
          if (act === "fly" && c) { map.flyTo({ center: [c.lon, c.lat], zoom: Math.max(map.getZoom(), 14), duration: 1400, essential: true }); return; }
          if (act === "bma" && c) { openBma(c.id); return; }
          if (act === "enoff") {
            String(a.dataset.v || "").split(",").forEach(function (s) { if (SRC[s]) on[s] = true; });
            lsSet(LS_SRC, JSON.stringify(on));
            setGeo(); renderPanel(); return;
          }
          return;
        }
        var tb = e.target.closest(".cv-tabs button");
        if (tb) {
          if (tb.dataset.m) M.mode = tb.dataset.m;
          if (tb.dataset.g != null) M.angle = +tb.dataset.g;
          renderViewer(); return;
        }
        var ch = e.target.closest(".cv-chip");
        if (ch) {
          var s = ch.dataset.s; on[s] = !on[s];
          lsSet(LS_SRC, JSON.stringify(on));
          setGeo(); renderPanel(); return;
        }
        var it = e.target.closest(".cv-it");
        if (it) select(+it.dataset.i, { fly: true });
      });
      var qi = p.querySelector("#cvQ"), qt = null;
      qi.addEventListener("input", function () { clearTimeout(qt); qt = setTimeout(function () { query = qi.value; renderList(); }, 200); });
      document.addEventListener("visibilitychange", function () {
        if (!visible || !selKey) return;
        if (M.mode !== "live" && !pausedByHide) return;
        if (document.hidden) { pausedByHide = true; stopMedia(); }   // ไม่ดึงวิดีโอค้างไว้ตอนสลับแท็บ
        else if (pausedByHide) { pausedByHide = false; renderViewer(); }
      });
    }
    syncButtons();
  }
  function syncButtons() {
    var b = $("#btnCctvToggle"), p = $("#cctvPanel");
    if (b) b.classList.toggle("active", visible);
    if (p) p.classList.toggle("open", visible);
  }

  function setVisible(v) {
    visible = !!v;
    lsSet(LS_KEY, visible ? "1" : "0");
    syncButtons();
    clearInterval(refreshTimer);
    if (!visible) {
      stopMedia();
      if (hoverPop) { hoverPop.remove(); hoverPop = null; }
      syncLayerVis();
      return;
    }
    addLayers();
    bindHandlers();
    renderPanel();
    renderViewer();
    loadAll();
    refreshTimer = setInterval(function () {
      if (document.hidden) return;
      loadHatyai().then(rebuild);   // ธงสถานะหาดใหญ่เปลี่ยนบ่อย
      if (RAW.road && Date.now() - RAW.road.at > 30 * 60000) loadRoad().then(rebuild);
    }, 5 * 60000);
  }

  /* ================================================================ mount — เรียกซ้ำทุกครั้งที่เปลี่ยนสไตล์แผนที่ */
  function mount(m) {
    map = m;
    try { var s = JSON.parse(lsGet(LS_SRC) || "null"); if (s) ORDER.forEach(function (k) { if (typeof s[k] === "boolean") on[k] = s[k]; }); } catch (e) { }
    buildUI();
    if (lsGet(LS_KEY) === "1" && !visible) { setVisible(true); return; }
    if (!visible) return;
    addLayers();   // สไตล์ใหม่ล้างชั้น (และรูปไอคอน) ทิ้งหมด → วางกลับ
  }

  window.BKK_CCTV = {
    mount: mount,
    setVisible: setVisible,
    hit: hit,
    select: function (key) { for (var i = 0; i < cams.length; i++) if (cams[i].k === key) { select(i, { fly: true }); return true; } return false; },
    debug: function () {
      return {
        visible: visible, on: on, st: ST, n: counts(), sel: selKey, mode: M.mode, hls: !!M.hls,
        layers: ["cctv-cl", "cctv-cl-n", "cctv-sel", "cctv-pt"].filter(function (id) { return map && map.getLayer(id); })
      };
    }
  };
})();
