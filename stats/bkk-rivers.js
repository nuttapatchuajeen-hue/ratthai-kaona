/**
 * bkk-rivers.js
 * ส่วนเสริมของชั้น "ฝน & น้ำท่วม" (bkk-flood.js) — แม่น้ำ/คลอง + น้ำเหนือ + พื้นที่เสี่ยง + น้ำทะเลหนุน
 *
 *   1) เส้นแม่น้ำ/คลองทั่วประเทศ: ใช้ชั้น waterway ในไทล์แผนที่ฐาน (OpenFreeMap/OpenMapTiles · © OpenStreetMap) — ไม่โหลดไฟล์เพิ่ม
 *      เส้นใน OSM วาดตามทิศน้ำไหล (ตรวจแล้ว: เจ้าพระยาเหนือ→ใต้ทุกท่อน) → ขีดวิ่งบนแม่น้ำ = ทิศน้ำไหล
 *      คลองแสดงเส้นนิ่ง เพราะทิศน้ำในคลองเปลี่ยนตามการเปิด-ปิดประตูน้ำ/สถานีสูบ และทิศเส้นคลองใน OSM ไม่การันตี
 *   2) น้ำเหนือ: ระบบคาดการณ์ FEWS ของ สสน. (fews2.hii.or.th · เปิด CORS)
 *      - ปริมาณน้ำไหล (ลบ.ม./วินาที) สถานีกรมชลประทาน: ค่าตรวจวัด + คาดการณ์ 7 วัน + เกณฑ์ เฝ้าระวัง/เตือนภัย/วิกฤต ต่อสถานี
 *      - ระดับน้ำคาดการณ์ (ม.รทก.) สถานี สสน. เช่น อยุธยา สะพานนวลฉวี
 *      "น้ำเหนือมาถึงเมื่อไหร่" แสดงเวลายอดน้ำตามแบบจำลองของ สสน. รายสถานี (ไม่เดาเวลาเดินทางเอง)
 *   3) พื้นที่เสี่ยง: ไทล์ GISTDA — น้ำท่วมจากดาวเทียม 1/3/7/30 วันล่าสุด + พื้นที่น้ำท่วมซ้ำซาก 2554–2567
 *      ใช้คีย์สาธารณะที่ GISTDA เผยแพร่ไว้ในลิงก์ของพอร์ทัลข้อมูลเปิด opendata.gistda.or.th (dataset flood-disaster-data)
 *   4) น้ำทะเลหนุน: ตารางน้ำขึ้น-ลงคาดการณ์ 28 สถานีชายฝั่งของ สสน. (สูงสุด/ต่ำสุดรายวัน + รายชั่วโมงเมื่อกดดู)
 */
(function () {
  "use strict";

  var LS_SUB = "bkk-rivers-sub";
  var LS_RISK = "bkk-rivers-risk";
  var HII = "https://fews2.hii.or.th/model-output/data_portal/";
  var GISTDA = "https://api-gateway.gistda.or.th/api/2.0/resources/maps/";
  var GKEY = "ud4Faf2e1tMOoIZtTRiNiarepfQp1AFfIIO3vd9fboA7nFrYomnOwkfydzjDRxQO";   // คีย์สาธารณะจากพอร์ทัลข้อมูลเปิดของ GISTDA
  var HOUR = 3600000;

  var sub = { rivers: true, north: true, risk: false, tide: true };
  var riskMode = "7days";   // 1day · 3days · 7days · 30days · freq
  var RISK = {
    "1day": { t: "1 วัน", path: "flood/1day" }, "3days": { t: "3 วัน", path: "flood/3days" },
    "7days": { t: "7 วัน", path: "flood/7days" }, "30days": { t: "30 วัน", path: "flood/30days" },
    freq: { t: "ท่วมซ้ำซาก 2554–67", path: "flood-freq" }
  };
  // ระดับเทียบเกณฑ์ของ สสน.
  var LV = [
    { c: "#22c55e", t: "ปกติ" }, { c: "#eab308", t: "เฝ้าระวัง" }, { c: "#f97316", t: "เตือนภัย" }, { c: "#ef4444", t: "วิกฤต" }
  ];
  var GREY = "#94a3b8";
  // เส้นทางน้ำเหนือลงสู่ กทม. (เหนือ → ใต้) — q = ปริมาณน้ำไหล, w = ระดับน้ำ, t = น้ำขึ้นน้ำลง
  var CHAIN = [
    { k: "q:C2", s: "นครสวรรค์ (C.2)", note: "จุดรวมแม่น้ำปิง วัง ยม น่าน เป็นเจ้าพระยา" },
    { k: "q:C13", s: "ท้ายเขื่อนเจ้าพระยา (C.13)", note: "น้ำที่เขื่อนเจ้าพระยา ชัยนาท ปล่อยลงลุ่มเจ้าพระยาตอนล่าง" },
    { k: "q:C3", s: "บางพุทรา สิงห์บุรี (C.3)" },
    { k: "q:C7A", s: "บางแก้ว อ่างทอง (C.7A)" },
    { k: "q:S28", s: "ท้ายเขื่อนป่าสักฯ (S.28)", note: "แม่น้ำป่าสัก — ไหลมาบรรจบเจ้าพระยาที่อยุธยา" },
    { k: "q:C35", s: "บ้านป้อม อยุธยา (C.35)" },
    { k: "w:CPY011", s: "พระนครศรีอยุธยา" },
    { k: "w:CPY014", s: "สะพานนวลฉวี นนทบุรี", note: "ก่อนเข้า กทม." },
    { k: "t:N01", s: "น้ำทะเลหนุน · กองบัญชาการกองทัพเรือ", note: "ริมเจ้าพระยา กทม." }
  ];
  var TIDE_KEY = ["N03", "N01", "N02", "N04", "N05", "N11", "N15"];

  var map = null, active = false, panelBound = false, handlersBound = false;
  var ST = {};             // key → สถานี {k, kind, code, n, prov, lat, lon, th:[alarm,warning,critical]}
  var META = { at: 0, err: null, busy: false };
  var SER = {};            // key → {obs:[[t,v]], fc:[[t,v]], at, err}
  var TIDE = { rows: null, at: 0, err: null, busy: false };
  var TSER = {};           // code → [[t,v]] (ช่วง ±1.5 วัน)
  var flowTimer = null, flowStep = 0, popup = null, refreshTimer = null;

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function fmt(n, d) { return n == null || !isFinite(n) ? "–" : Number(n).toLocaleString("th-TH", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function thTime(t) { return new Date(t).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" }) + " น."; }
  function ago(t) {
    var m = Math.round((Date.now() - t) / 60000);
    return m < 1 ? "เมื่อสักครู่" : m < 60 ? m + " นาทีที่แล้ว" : m < 48 * 60 ? Math.round(m / 60) + " ชม.ที่แล้ว" : Math.round(m / 1440) + " วันที่แล้ว";
  }
  // เวลาในไฟล์ของ สสน. เป็นเวลาไทย
  function hiiTime(d, t) { var x = Date.parse(d + "T" + (t.length === 5 ? t + ":00" : t) + "+07:00"); return isFinite(x) ? x : null; }
  function unitOf(st) { return st.kind === "q" ? "ลบ.ม./วิ." : "ม.รทก."; }
  function dig(st) { return st.kind === "q" ? 0 : 2; }

  /* ================================================================ โหลดข้อมูล */
  function getText(url) { return fetch(url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); }); }
  function csvRows(txt) {
    return txt.split(/\r?\n/).filter(function (l) { return l.trim(); }).map(function (l) { return l.split(",").map(function (c) { return c.trim(); }); });
  }
  // metadata/rid_discharge.csv · metadata/hii_waterlevel.csv:
  // code, ชื่อ EN, ชื่อ TH, lat, long, ลุ่มน้ำ, ชนิด, ต่ำสุด, เฝ้าระวัง, เตือนภัย, วิกฤต, ตำบล, อำเภอ, จังหวัด, publish, publish_onwr
  function loadMeta() {
    if (META.busy || META.at && Date.now() - META.at < 6 * HOUR) return Promise.resolve();
    META.busy = true;
    var one = function (file, kind) {
      return getText(HII + "metadata/" + file).then(function (txt) {
        csvRows(txt).slice(1).forEach(function (r) {
          if (r.length < 15 || r[14] !== "t") return;   // เฉพาะสถานีที่ สสน. เปิดเผย
          var lat = +r[3], lon = +r[4];
          if (!isFinite(lat) || !isFinite(lon) || !lat) return;
          var k = kind + ":" + r[0];
          ST[k] = { k: k, kind: kind, code: r[0], n: r[2], lat: lat, lon: lon, basin: r[5], prov: r[13], amp: r[12], th: [+r[8], +r[9], +r[10]].map(function (v) { return isFinite(v) ? v : null; }) };
        });
      });
    };
    return Promise.all([one("rid_discharge.csv", "q"), one("hii_waterlevel.csv", "w")]).then(function () { META.at = Date.now(); META.err = null; },
      function (e) { META.err = String(e.message || e); }).then(function () { META.busy = false; setGeo(); render(); });
  }
  function parseSeries(txt) {
    return csvRows(txt).slice(1).map(function (r) { var t = hiiTime(r[1], r[2]), v = parseFloat(r[3]); return t && isFinite(v) ? [t, v] : null; }).filter(Boolean);
  }
  function loadSeries(k) {
    var st = ST[k], s = SER[k];
    if (!st) return Promise.resolve();
    if (s && (s.busy || Date.now() - s.at < 20 * 60000)) return Promise.resolve();
    s = SER[k] = s || {};
    s.busy = true;
    var dir = st.kind === "q" ? "rid_discharge/" : "hii_waterlevel/";
    return Promise.all([getText(HII + dir + "observe/" + st.code + ".txt").then(parseSeries).catch(function () { return []; }),
      getText(HII + dir + "forecast/" + st.code + ".txt").then(parseSeries).catch(function () { return []; })]).then(function (x) {
      s.obs = x[0]; s.fc = x[1]; s.at = Date.now(); s.err = !x[0].length && !x[1].length ? "ไม่มีข้อมูล" : null;
      // แบบจำลองบางสถานีให้ค่าคาดการณ์คนละสเกลกับค่าวัด (เช่น S.28: คาด ~4 ขณะวัดได้ ~350 ลบ.ม./วิ.)
      // → ถ้าค่าคาดการณ์ ณ เวลาวัดล่าสุดต่อกับค่าวัดไม่ได้ ไม่ใช้ค่าคาดการณ์ของสถานีนั้น
      s.fcBad = false;
      var last = s.obs[s.obs.length - 1];
      if (last && s.fc.length) {
        var near = null;
        s.fc.forEach(function (p) { if (!near || Math.abs(p[0] - last[0]) < Math.abs(near[0] - last[0])) near = p; });
        var tol = st.kind === "q" ? Math.max(Math.abs(last[1]) * 0.5, 100) : 1;
        if (near && Math.abs(near[0] - last[0]) <= 6 * HOUR && Math.abs(near[1] - last[1]) > tol) { s.fcBad = true; s.fc = []; }
      }
    }).then(function () { s.busy = false; setGeo(); render(); });
  }
  // tide_table/summary.txt: code, ชื่อ TH, ชื่อ EN, lat, long, วันที่, สูงสุด, เวลาสูงสุด, ต่ำสุด, เวลาต่ำสุด, ค่าทุก 4 ชม.
  function loadTide() {
    if (TIDE.busy || TIDE.rows && Date.now() - TIDE.at < 3 * HOUR) return Promise.resolve();
    TIDE.busy = true;
    return getText(HII + "tide_table/summary.txt").then(function (txt) {
      TIDE.rows = csvRows(txt).slice(1).map(function (r) {
        var lat = +r[3], lon = +r[4];
        return isFinite(lat) && isFinite(lon) ? { code: r[0], n: r[1], lat: lat, lon: lon, date: r[5], hi: +r[6], hiT: r[7], lo: +r[8], loT: r[9] } : null;
      }).filter(Boolean);
      TIDE.at = Date.now(); TIDE.err = null;
    }, function (e) { TIDE.err = String(e.message || e); }).then(function () { TIDE.busy = false; setGeo(); render(); });
  }
  // ไฟล์รายสถานีเป็นค่ารายชั่วโมงทั้งปี (~280 KB) — โหลดเฉพาะตอนกดดู แล้วเก็บแค่ช่วงรอบตอนนี้
  function loadTideSeries(code) {
    if (TSER[code]) return Promise.resolve(TSER[code]);
    return getText(HII + "tide_table/" + code + ".txt").then(function (txt) {
      var now = Date.now(), a = now - 18 * HOUR, b = now + 36 * HOUR;
      TSER[code] = parseSeries(txt).filter(function (p) { return p[0] >= a && p[0] <= b; });
      return TSER[code];
    });
  }
  function loadChain() { return loadMeta().then(function () { CHAIN.forEach(function (c) { if (c.k[0] !== "t") loadSeries(c.k); }); }); }

  /* ================================================================ วิเคราะห์ค่า */
  function lvOf(v, th) {
    if (v == null || !th) return -1;
    var n = 0;
    if (th[0] != null && v >= th[0]) n = 1;
    if (th[1] != null && v >= th[1]) n = 2;
    if (th[2] != null && v >= th[2]) n = 3;
    return n;
  }
  // ค่าปัจจุบัน · แนวโน้ม 24 ชม. · ยอดคาดการณ์ (หลังค่าวัดล่าสุด ภายใน 7 วัน)
  function stat(k) {
    var st = ST[k], s = SER[k];
    if (!st || !s || !s.at) return null;
    var obs = s.obs || [], fc = s.fc || [], last = obs[obs.length - 1] || null, t0 = last ? last[0] : Date.now();
    var prev = null;
    for (var i = obs.length - 1; i >= 0; i--) if (last && last[0] - obs[i][0] >= 23.5 * HOUR) { prev = obs[i]; break; }
    var fut = fc.filter(function (p) { return p[0] > t0; }), pk = null;
    fut.forEach(function (p) { if (!pk || p[1] > pk[1]) pk = p; });
    var cur = last ? last[1] : fut.length ? fut[0][1] : null;
    var flat = pk && cur != null && Math.abs(pk[1] - cur) <= Math.max(Math.abs(cur) * 0.02, st.kind === "q" ? 20 : 0.05);
    var end = fut[fut.length - 1] || null;
    // ยอดไม่สูงกว่าตอนนี้ แต่ปลายช่วงต่ำกว่าชัดเจน = คาดลดลง (ไม่ใช่ "ทรงตัว")
    var down = !!(end && cur != null && pk && pk[1] <= cur + Math.max(Math.abs(cur) * 0.02, st.kind === "q" ? 20 : 0.05) && end[1] < cur - Math.max(Math.abs(cur) * 0.03, st.kind === "q" ? 30 : 0.08));
    if (down) flat = false;
    return { cur: cur, curT: last ? last[0] : null, d24: last && prev ? last[1] - prev[1] : null, pk: down ? null : pk, flat: flat, down: down, end: end, fcBad: !!s.fcBad, lv: lvOf(cur, st.th), pkLv: pk && !down ? lvOf(pk[1], st.th) : -1 };
  }

  /* ================================================================ กราฟ SVG */
  function chartSVG(st, s, W, H, small) {
    var pts = (s.obs || []).concat(s.fc || []);
    if (!pts.length) return "";
    var t0 = pts[0][0], t1 = pts[pts.length - 1][0];
    (s.obs || []).forEach(function (p) { t0 = Math.min(t0, p[0]); });
    var vs = pts.map(function (p) { return p[1]; });
    (st.th || []).forEach(function (v) { if (v != null && !small) vs.push(v); });
    if (small && st.th && st.th[1] != null) vs.push(st.th[1]);
    var lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs);
    if (hi - lo < 1e-6) { hi += 1; lo -= 1; }
    var pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
    var X = function (t) { return ((t - t0) / Math.max(1, t1 - t0) * (W - 2) + 1).toFixed(1); };
    var Y = function (v) { return ((1 - (v - lo) / (hi - lo)) * (H - 2) + 1).toFixed(1); };
    var path = function (arr) { return arr.map(function (p, i) { return (i ? "L" : "M") + X(p[0]) + "," + Y(p[1]); }).join(""); };
    var h = '<svg class="rv-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true">';
    (st.th || []).forEach(function (v, i) {
      if (v == null || v < lo || v > hi || small && i !== 1) return;
      h += '<line x1="0" x2="' + W + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="' + LV[i + 1].c + '" stroke-width="1" stroke-dasharray="3 3" opacity=".75"/>';
    });
    var now = Date.now();
    if (now > t0 && now < t1) h += '<line x1="' + X(now) + '" x2="' + X(now) + '" y1="0" y2="' + H + '" stroke="currentColor" stroke-width="1" opacity=".35"/>';
    var lastObs = s.obs && s.obs.length ? s.obs[s.obs.length - 1][0] : 0;
    var fut = (s.fc || []).filter(function (p) { return p[0] >= lastObs; });
    if (fut.length) h += '<path d="' + path(fut) + '" fill="none" stroke="#f59e0b" stroke-width="' + (small ? 1.4 : 1.8) + '" stroke-dasharray="4 3"/>';
    if (s.obs && s.obs.length) h += '<path d="' + path(s.obs) + '" fill="none" stroke="#38bdf8" stroke-width="' + (small ? 1.6 : 2) + '"/>';
    return h + '</svg>';
  }
  function tideSVG(arr, W, H) {
    if (!arr || arr.length < 2) return "";
    var t0 = arr[0][0], t1 = arr[arr.length - 1][0], vs = arr.map(function (p) { return p[1]; });
    var lo = Math.min.apply(null, vs) - 0.1, hi = Math.max.apply(null, vs) + 0.1;
    var X = function (t) { return ((t - t0) / (t1 - t0) * (W - 2) + 1).toFixed(1); };
    var Y = function (v) { return ((1 - (v - lo) / (hi - lo)) * (H - 2) + 1).toFixed(1); };
    var h = '<svg class="rv-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true">';
    h += '<line x1="0" x2="' + W + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="currentColor" stroke-width="1" opacity=".2"/>';
    var now = Date.now();
    if (now > t0 && now < t1) h += '<line x1="' + X(now) + '" x2="' + X(now) + '" y1="0" y2="' + H + '" stroke="currentColor" stroke-width="1" opacity=".35"/>';
    h += '<path d="' + arr.map(function (p, i) { return (i ? "L" : "M") + X(p[0]) + "," + Y(p[1]); }).join("") + '" fill="none" stroke="#2dd4bf" stroke-width="2"/>';
    return h + '</svg>';
  }

  /* ================================================================ ชั้นบนแผนที่ */
  var FLOW_DASH = [[0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5]];
  var LINE_LAYERS = ["rv-canal", "rv-river", "rv-flow", "rv-label"];
  var PT_LAYERS = ["rv-st", "rv-tide"];
  function hasBase() { return !!(map && map.getSource("openmaptiles")); }
  // วางเส้นน้ำใต้ป้ายชื่อของแผนที่ฐาน (ชั้น symbol ตัวแรกของ openmaptiles)
  function baseLabelId() {
    var ls = (map.getStyle() && map.getStyle().layers) || [];
    for (var i = 0; i < ls.length; i++) if (ls[i].type === "symbol" && ls[i].source === "openmaptiles") return ls[i].id;
    return undefined;
  }
  function riskTiles() { return [GISTDA + RISK[riskMode].path + "/tms/{z}/{x}/{y}?api_key=" + GKEY]; }
  function addRisk() {
    if (map.getLayer("rv-risk")) map.removeLayer("rv-risk");
    if (map.getSource("rv-risk")) map.removeSource("rv-risk");
    if (!(active && sub.risk)) return;
    map.addSource("rv-risk", { type: "raster", tiles: riskTiles(), tileSize: 256, minzoom: 5, maxzoom: 16, attribution: "น้ำท่วม/ท่วมซ้ำซาก © GISTDA" });
    map.addLayer({ id: "rv-risk", type: "raster", source: "rv-risk", paint: { "raster-opacity": riskMode === "freq" ? 0.6 : 0.8, "raster-fade-duration": 150 } }, map.getLayer("rv-canal") ? "rv-canal" : baseLabelId());
  }
  function addLayers() {
    if (!map || !map.getStyle()) return;
    if (hasBase()) {
      var bf = baseLabelId();
      var W = ["==", ["get", "class"], "river"], C = ["match", ["get", "class"], ["canal", "drain"], true, false];
      if (!map.getLayer("rv-canal")) map.addLayer({
        id: "rv-canal", type: "line", source: "openmaptiles", "source-layer": "waterway", minzoom: 9, filter: C,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#22d3ee", "line-opacity": 0.75, "line-width": ["interpolate", ["linear"], ["zoom"], 9, 0.5, 12, 1.4, 15, 2.6] }
      }, bf);
      if (!map.getLayer("rv-river")) map.addLayer({
        id: "rv-river", type: "line", source: "openmaptiles", "source-layer": "waterway", filter: W,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#0ea5e9", "line-opacity": 0.9, "line-width": ["interpolate", ["linear"], ["zoom"], 4, 0.7, 8, 1.8, 12, 3.4, 15, 6] }
      }, bf);
      if (!map.getLayer("rv-flow")) map.addLayer({
        id: "rv-flow", type: "line", source: "openmaptiles", "source-layer": "waterway", filter: W,
        paint: { "line-color": "#e0f2fe", "line-opacity": 0.95, "line-width": ["interpolate", ["linear"], ["zoom"], 4, 0.6, 8, 1.2, 12, 2, 15, 3.2], "line-dasharray": FLOW_DASH[0] }
      }, bf);
      if (!map.getLayer("rv-label")) map.addLayer({
        id: "rv-label", type: "symbol", source: "openmaptiles", "source-layer": "waterway", minzoom: 9,
        filter: ["all", ["match", ["get", "class"], ["river", "canal"], true, false], ["has", "name"]],
        layout: {
          "symbol-placement": "line", "symbol-spacing": 320, "text-field": ["coalesce", ["get", "name:th"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"], "text-size": ["interpolate", ["linear"], ["zoom"], 9, 10, 14, 12.5], "text-max-angle": 30, "text-letter-spacing": 0.02
        },
        paint: { "text-color": "#bae6fd", "text-halo-color": "rgba(6,12,22,.9)", "text-halo-width": 1.4 }
      });
    }
    addRisk();
    if (!map.getSource("rv-st")) map.addSource("rv-st", { type: "geojson", data: stGeo() });
    if (!map.getSource("rv-tide")) map.addSource("rv-tide", { type: "geojson", data: tideGeo() });
    if (!map.getLayer("rv-tide")) map.addLayer({
      id: "rv-tide", type: "circle", source: "rv-tide",
      paint: { "circle-color": "#14b8a6", "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 4, 10, 7], "circle-stroke-color": "#ecfeff", "circle-stroke-width": 1.5 }
    });
    if (!map.getLayer("rv-tide-l")) map.addLayer({
      id: "rv-tide-l", type: "symbol", source: "rv-tide", minzoom: 6,
      layout: { "text-field": ["get", "l"], "text-font": ["Noto Sans Regular"], "text-size": 10.5, "text-anchor": "left", "text-offset": [0.8, 0], "text-optional": true },
      paint: { "text-color": "#99f6e4", "text-halo-color": "rgba(6,12,22,.9)", "text-halo-width": 1.3 }
    });
    if (!map.getLayer("rv-st")) map.addLayer({
      id: "rv-st", type: "circle", source: "rv-st",
      paint: {
        "circle-color": ["get", "c"], "circle-opacity": ["case", ["==", ["get", "lv"], -1], 0.55, 1],
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, ["case", ["==", ["get", "ch"], 1], 5.5, 3.2], 10, ["case", ["==", ["get", "ch"], 1], 9, 6]],
        "circle-stroke-color": ["case", ["==", ["get", "kind"], "w"], "#f8fafc", "#0b1220"], "circle-stroke-width": ["case", ["==", ["get", "ch"], 1], 2.2, 1.2]
      }
    });
    if (!map.getLayer("rv-st-l")) map.addLayer({
      id: "rv-st-l", type: "symbol", source: "rv-st", filter: ["==", ["get", "ch"], 1],
      layout: { "text-field": ["get", "l"], "text-font": ["Noto Sans Bold"], "text-size": 11, "text-anchor": "left", "text-offset": [0.9, 0], "text-optional": true },
      paint: { "text-color": "#fff", "text-halo-color": "rgba(6,12,22,.92)", "text-halo-width": 1.5 }
    });
    syncVis();
  }
  function syncVis() {
    if (!map) return;
    var set = function (id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); };
    LINE_LAYERS.forEach(function (id) { set(id, active && sub.rivers); });
    set("rv-st", active && sub.north); set("rv-st-l", active && sub.north);
    set("rv-tide", active && sub.tide); set("rv-tide-l", active && sub.tide);
    set("rv-risk", active && sub.risk);
    syncFlow();
  }
  // ขีดวิ่งตามทิศน้ำ (สลับ dasharray ทีละขั้น — เทคนิคเดียวกับตัวอย่าง "ant path" ของ Mapbox/MapLibre)
  function syncFlow() {
    var on = active && sub.rivers && map && map.getLayer("rv-flow");
    if (on && !flowTimer) flowTimer = setInterval(function () {
      if (document.hidden || !map.getLayer("rv-flow")) return;
      flowStep = (flowStep + 1) % FLOW_DASH.length;
      try { map.setPaintProperty("rv-flow", "line-dasharray", FLOW_DASH[flowStep]); } catch (e) { }
    }, 90);
    if (!on && flowTimer) { clearInterval(flowTimer); flowTimer = null; }
  }
  function chainIndex(k) { for (var i = 0; i < CHAIN.length; i++) if (CHAIN[i].k === k) return i; return -1; }
  function stGeo() {
    var f = [];
    Object.keys(ST).forEach(function (k) {
      var st = ST[k], s = stat(k), ch = chainIndex(k) >= 0 ? 1 : 0;
      var lv = s ? s.lv : -1;
      f.push({
        type: "Feature", geometry: { type: "Point", coordinates: [st.lon, st.lat] },
        properties: { k: k, kind: st.kind, ch: ch, lv: lv, c: lv >= 0 ? LV[lv].c : GREY, l: ch && s && s.cur != null ? st.code + " " + fmt(s.cur, dig(st)) : ch ? st.code : "" }
      });
    });
    return { type: "FeatureCollection", features: f };
  }
  function tideGeo() {
    return {
      type: "FeatureCollection", features: (TIDE.rows || []).map(function (r) {
        return { type: "Feature", geometry: { type: "Point", coordinates: [r.lon, r.lat] }, properties: { code: r.code, l: r.n + " ↑" + fmt(r.hi, 2) + " ม. " + r.hiT } };
      })
    };
  }
  function setGeo() {
    if (!map) return;
    var a = map.getSource("rv-st"); if (a) a.setData(stGeo());
    var b = map.getSource("rv-tide"); if (b) b.setData(tideGeo());
  }
  function hitAt(pt) {
    if (!active || !map) return [];
    var ids = ["rv-st", "rv-tide"].filter(function (id) { return map.getLayer(id) && map.getLayoutProperty(id, "visibility") !== "none"; });
    if (!ids.length) return [];
    try { return map.queryRenderedFeatures([[pt.x - 7, pt.y - 7], [pt.x + 7, pt.y + 7]], { layers: ids }); } catch (e) { return []; }
  }

  /* ================================================================ การ์ดสถานี */
  function row(a, b) { return '<div class="fl-row"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function lvChip(lv) { return lv < 0 ? "" : '<span class="rv-lv" style="--c:' + LV[lv].c + '">' + LV[lv].t + '</span>'; }
  function stCard(k) {
    var st = ST[k], s = SER[k], x = stat(k), u = unitOf(st), d = dig(st);
    var h = '<div class="fl-pop rv-pop"><b class="fl-pop-t">' + esc(st.n) + ' <small>' + esc(st.code) + ' · ' + esc(st.amp) + ' ' + esc(st.prov) + '</small></b>';
    if (!s || !s.at) return h + '<p class="rv-load">กำลังโหลดกราฟจาก สสน.…</p></div>';
    if (!x || x.cur == null) return h + '<p class="rv-load">' + esc(s.err || "ไม่มีข้อมูลตอนนี้") + '</p></div>';
    h += '<div class="rv-big">' + (st.kind === "q" ? "ปริมาณน้ำไหล " : "ระดับน้ำ ") + '<b>' + fmt(x.cur, d) + '</b> ' + u + ' ' + lvChip(x.lv) + '</div>';
    if (x.curT) h += '<div class="rv-sub">วัดเมื่อ ' + thTime(x.curT) + (x.d24 != null ? ' · 24 ชม. ' + (x.d24 >= 0 ? "▲ +" : "▼ ") + fmt(x.d24, d) : "") + '</div>';
    h += chartSVG(st, s, 270, 96, false);
    h += '<div class="rv-legend"><span><i style="background:#38bdf8"></i>ค่าตรวจวัด</span><span><i style="background:#f59e0b"></i>คาดการณ์ สสน.</span>' +
      LV.slice(1).map(function (L, i) { return st.th[i] != null ? '<span><i class="dash" style="border-color:' + L.c + '"></i>' + L.t + ' ' + fmt(st.th[i], d) + '</span>' : ""; }).join("") + '</div>';
    if (x.fcBad) h += '<p class="rv-note">ค่าคาดการณ์ของสถานีนี้ไม่ต่อเนื่องกับค่าตรวจวัด (คนละสเกล) — จึงไม่แสดงค่าคาดการณ์</p>';
    else if (x.down) h += row("คาดการณ์ 7 วัน", "ลดลงเหลือราว " + fmt(x.end[1], d) + " " + u + "<br><small>" + thTime(x.end[0]) + "</small>");
    else if (x.pk) h += row(x.flat ? "คาดการณ์ 7 วัน" : "คาดว่ายอดน้ำสูงสุด", x.flat ? "ทรงตัวราว " + fmt(x.pk[1], d) + " " + u : fmt(x.pk[1], d) + " " + u + "<br><small>" + thTime(x.pk[0]) + "</small> " + lvChip(x.pkLv));
    if (x.end && x.pk && !x.flat) h += row("ปลายช่วงคาดการณ์", fmt(x.end[1], d) + " " + u + " <small>" + thTime(x.end[0]) + "</small>");
    return h + '<div class="fl-pop-f">ข้อมูลและแบบจำลอง: สถาบันสารสนเทศทรัพยากรน้ำ (สสน.)' + (st.kind === "q" ? " · ค่าตรวจวัดจากกรมชลประทาน" : "") +
      ' · <a href="https://www.thaiwater.net/" target="_blank" rel="noopener">thaiwater.net ' + ico("external-link") + '</a></div></div>';
  }
  function tideRow(r) { return r ? "สูงสุด <b>" + fmt(r.hi, 2) + "</b> ม. " + esc(r.hiT) + " · ต่ำสุด " + fmt(r.lo, 2) + " ม. " + esc(r.loT) : ""; }
  function tideCard(code) {
    var r = (TIDE.rows || []).filter(function (x) { return x.code === code; })[0];
    if (!r) return "";
    var h = '<div class="fl-pop rv-pop"><b class="fl-pop-t">' + ico("waves") + ' น้ำขึ้น-น้ำลง · ' + esc(r.n) + ' <small>คาดการณ์ ' + esc(r.date) + '</small></b>';
    h += '<div class="rv-sub">' + tideRow(r) + '</div>';
    h += TSER[code] ? tideSVG(TSER[code], 270, 90) + '<div class="rv-sub">ช่วง 18 ชม. ก่อน – 36 ชม. หลังตอนนี้ (เส้นตั้ง = ตอนนี้) · ม.รทก.</div>' : '<p class="rv-load">กำลังโหลดกราฟรายชั่วโมง…</p>';
    return h + '<p class="rv-note">ช่วงน้ำขึ้นสูง น้ำทะเลหนุนเข้าปากแม่น้ำ ทำให้น้ำเหนือระบายออกทะเลได้ช้า — ถ้าน้ำเหนือมากพร้อมน้ำขึ้นสูง พื้นที่ริมแม่น้ำช่วงล่างเสี่ยงท่วมมากขึ้น</p>' +
      '<div class="fl-pop-f">ตารางน้ำขึ้น-ลงคาดการณ์: สถาบันสารสนเทศทรัพยากรน้ำ (สสน.)</div></div>';
  }
  function openPopup(ll, html) {
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ closeButton: true, maxWidth: "310px", className: "fl-popup", offset: 10 }).setLngLat(ll).setHTML(html).addTo(map);
  }
  function showStation(k, fly) {
    var st = ST[k];
    if (!st) return;
    var ll = [st.lon, st.lat];
    if (fly) map.flyTo({ center: ll, zoom: Math.max(map.getZoom(), 9), duration: 1200, essential: true });
    openPopup(ll, stCard(k));
    loadSeries(k).then(function () { if (popup && popup.isOpen()) popup.setHTML(stCard(k)); });
  }
  function showTide(code, fly) {
    var r = (TIDE.rows || []).filter(function (x) { return x.code === code; })[0];
    if (!r) return;
    var ll = [r.lon, r.lat];
    if (fly) map.flyTo({ center: ll, zoom: Math.max(map.getZoom(), 9), duration: 1200, essential: true });
    openPopup(ll, tideCard(code));
    loadTideSeries(code).then(function () { if (popup && popup.isOpen()) popup.setHTML(tideCard(code)); }, function () { });
  }
  function bindHandlers() {
    if (handlersBound) return;
    handlersBound = true;
    map.on("click", function (e) {
      var fs = hitAt(e.point);
      if (!fs.length) return;
      var f = fs.filter(function (x) { return x.layer.id === "rv-st"; })[0];
      if (f) { showStation(f.properties.k); return; }
      showTide(fs[0].properties.code);
    });
    var hov = false;
    map.on("mousemove", function (e) {
      var h = hitAt(e.point).length > 0;
      if (h) { map.getCanvas().style.cursor = "pointer"; hov = true; } else if (hov) { map.getCanvas().style.cursor = ""; hov = false; }
    });
  }

  /* ================================================================ แผง (อยู่ในแผง "ฝน & น้ำท่วม") */
  var CSS = [
    ".rv-head{margin:2px 0 0;padding:9px 0 2px;border-top:1px solid var(--card-border);font-weight:800;font-size:12.5px;display:flex;align-items:center;gap:6px}.rv-head .mdico{width:14px;height:14px;color:#38bdf8}",
    ".rv-chain{display:flex;flex-direction:column;gap:2px;margin:6px 0 0 22px}",
    ".rv-it{display:grid;grid-template-columns:10px 1fr auto;gap:2px 7px;align-items:center;border:0;background:rgba(127,127,127,.07);border-radius:8px;padding:5px 7px;color:inherit;font:inherit;font-size:11.5px;text-align:left;cursor:pointer;position:relative}",
    ".rv-it:hover{background:var(--accent-soft)}.rv-it>i{width:9px;height:9px;border-radius:50%}.rv-it b{font-weight:700}.rv-it em{font-style:normal;font-variant-numeric:tabular-nums;font-weight:700;text-align:right;white-space:nowrap}",
    ".rv-it small{grid-column:2/4;opacity:.72;font-size:10.5px;line-height:1.4}.rv-it .rv-svg{grid-column:2/4;width:100%;height:22px;color:inherit}",
    ".rv-it:not(:last-child)::after{content:'';position:absolute;left:11px;bottom:-4px;width:1px;height:6px;background:var(--card-border)}",
    ".rv-lv{display:inline-block;font-size:10px;font-weight:800;color:#06121a;background:var(--c);border-radius:5px;padding:0 5px;margin-left:3px;vertical-align:1px;white-space:nowrap}",
    ".rv-seg{display:flex;flex-wrap:wrap;gap:3px;margin:6px 0 0 22px}.rv-seg button{border:1px solid var(--card-border);background:rgba(127,127,127,.07);color:inherit;font:inherit;font-size:11px;border-radius:999px;padding:1px 9px;cursor:pointer}.rv-seg button.on{background:var(--accent-soft);border-color:var(--accent);font-weight:700}",
    ".rv-tl{display:flex;flex-direction:column;gap:2px;margin:6px 0 0 22px}.rv-tl button{display:flex;justify-content:space-between;gap:8px;border:0;background:rgba(127,127,127,.07);border-radius:7px;padding:3px 7px;color:inherit;font:inherit;font-size:11px;cursor:pointer;text-align:left}.rv-tl button:hover{background:var(--accent-soft)}.rv-tl em{font-style:normal;opacity:.85;white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".rv-grad{height:8px;border-radius:4px;margin:7px 0 0 22px}.rv-gradl{display:flex;justify-content:space-between;margin:2px 0 0 22px;font-size:10px;opacity:.75}",
    ".rv-pop .rv-big{font-size:12.5px;margin:2px 0}.rv-pop .rv-big b{font-size:17px;font-variant-numeric:tabular-nums}.rv-sub{font-size:11px;opacity:.75;margin:1px 0 4px}",
    ".rv-pop .rv-svg{display:block;margin:4px 0 2px;color:var(--text-main)}.rv-legend{display:flex;flex-wrap:wrap;gap:2px 9px;font-size:10px;opacity:.8;margin-bottom:4px}.rv-legend i{display:inline-block;width:12px;height:3px;border-radius:2px;margin-right:4px;vertical-align:2px}.rv-legend i.dash{height:0;border-top:2px dashed}",
    ".rv-load{font-size:11.5px;opacity:.75;margin:4px 0}.rv-note{font-size:10.5px;opacity:.72;margin:5px 0 0}"
  ].join("");
  function chk(k, label, extra) {
    return '<label><input type="checkbox" data-rv="' + k + '"' + (sub[k] ? " checked" : "") + '>' + label + '<small>' + (extra || "") + '</small></label>';
  }
  function inner() {
    var h = '<div class="rv-head">' + ico("waves") + ' แม่น้ำ น้ำเหนือ และน้ำทะเลหนุน</div>';
    // 1) เส้นน้ำ
    h += '<div class="fl-sec">' + chk("rivers", ico("waves") + " เส้นแม่น้ำ/คลอง + ทิศน้ำไหล", hasBase() ? "ทั่วประเทศ" : '<span class="fl-warn">แผนที่ฐานนี้ไม่มีเส้นน้ำ</span>');
    if (sub.rivers) h += '<p class="fl-note">ขีดขาววิ่งตามทิศน้ำไหลของแม่น้ำ · คลอง (เส้นฟ้าอ่อน) แสดงเส้นนิ่ง เพราะทิศน้ำในคลองขึ้นกับการเปิด-ปิดประตูน้ำ · ซูมเข้าเห็นชื่อแม่น้ำ/คลอง</p>';
    h += '</div>';
    // 2) น้ำเหนือ
    var c13 = stat("q:C13");
    h += '<div class="fl-sec">' + chk("north", ico("triangle-alert") + " น้ำเหนือ → กทม.", META.err ? '<span class="fl-warn">โหลดไม่สำเร็จ</span>' : c13 && c13.cur != null ? "เขื่อนเจ้าพระยา " + fmt(c13.cur) + " ลบ.ม./วิ." : "กำลังโหลด…");
    if (sub.north) {
      h += '<div class="rv-chain">' + CHAIN.map(function (c) {
        if (c.k[0] === "t") {
          var r = (TIDE.rows || []).filter(function (x) { return x.code === c.k.slice(2); })[0];
          return '<button type="button" class="rv-it" data-rt="' + c.k.slice(2) + '"><i style="background:#14b8a6"></i><b>' + esc(c.s) + '</b><em>' + (r ? "↑" + fmt(r.hi, 2) + " ม. " + esc(r.hiT) : "…") + '</em><small>' + (c.note ? esc(c.note) + " · " : "") + (r ? "น้ำขึ้นสูงสุดวันนี้ (คาดการณ์)" : "") + '</small></button>';
        }
        var st = ST[c.k], x = stat(c.k), s = SER[c.k];
        if (!st) return "";
        var lv = x ? x.lv : -1, d = dig(st);
        var val = x && x.cur != null ? fmt(x.cur, d) + ' <small style="display:inline;opacity:.7">' + (st.kind === "q" ? "ลบ.ม./วิ." : "ม.") + '</small>' : s && s.busy ? "…" : "–";
        var pk = !x ? "" : x.fcBad ? "ไม่มีค่าคาดการณ์ที่ใช้ได้" : x.down ? "คาดลดลงเหลือ " + fmt(x.end[1], d) + " · " + thTime(x.end[0]) :
          x.pk ? (x.flat ? "คาดทรงตัว 7 วัน" : "คาดยอด " + fmt(x.pk[1], d) + " · " + thTime(x.pk[0])) : "";
        return '<button type="button" class="rv-it" data-rk="' + c.k + '"><i style="background:' + (lv >= 0 ? LV[lv].c : GREY) + '"></i><b>' + esc(c.s) + '</b><em>' + val + '</em>' +
          '<small>' + (lv >= 0 ? LV[lv].t : "") + (x && x.d24 != null ? " · 24 ชม. " + (x.d24 >= 0 ? "▲" : "▼") + fmt(Math.abs(x.d24), d) : "") + (pk ? " · " + pk + (x.pkLv > lv ? " (" + LV[x.pkLv].t + ")" : "") : "") + (c.note ? "<br>" + esc(c.note) : "") + '</small>' +
          (s && s.at && !s.err ? chartSVG(st, s, 240, 22, true) : "") + '</button>';
      }).join("") + '</div>';
      h += '<div class="fl-leg">' + LV.map(function (L) { return '<span><i class="fl-chip" style="background:' + L.c + '"></i>' + L.t + '</span>'; }).join("") + '<span><i class="fl-chip" style="background:' + GREY + '"></i>กดดูกราฟ</span></div>';
      h += '<p class="fl-note">เทียบเกณฑ์ของ สสน. รายสถานี · เส้นฟ้า = ค่าตรวจวัด เส้นส้มประ = คาดการณ์ 7 วัน · เวลายอดน้ำแต่ละสถานีมาจากแบบจำลองของ สสน. — ดูยอดน้ำเลื่อนลงมาตามลำดับจากเหนือลงใต้ · จุดอื่นบนแผนที่ = สถานีคาดการณ์ทั่วประเทศ กดดูได้</p>';
    }
    h += '</div>';
    // 3) พื้นที่เสี่ยง
    h += '<div class="fl-sec">' + chk("risk", ico("map") + " พื้นที่น้ำท่วม/เสี่ยงท่วม (GISTDA)", sub.risk ? esc(RISK[riskMode].t) : "");
    if (sub.risk) {
      h += '<div class="rv-seg">' + ["1day", "3days", "7days", "30days"].map(function (m) { return '<button type="button" data-rm2="' + m + '" aria-pressed="' + (m === riskMode) + '"' + (m === riskMode ? ' class="on"' : "") + '>ท่วมจริง ' + RISK[m].t + '</button>'; }).join("") +
        '<button type="button" data-rm2="freq" aria-pressed="' + (riskMode === "freq") + '"' + (riskMode === "freq" ? ' class="on"' : "") + '>ท่วมซ้ำซาก</button></div>';
      h += riskMode === "freq"
        ? '<div class="rv-grad" style="background:linear-gradient(90deg,#7dd3fc,#0ea5e9,#4f46e5,#f59e0b,#dc2626)"></div><div class="rv-gradl"><span>ท่วมไม่กี่ปี</span><span>ท่วมซ้ำหลายปี</span></div>' +
          '<p class="fl-note">พื้นที่ที่ดาวเทียมเห็นน้ำท่วมในปี 2554–2567 ยิ่งสีเข้มไปทางแดงยิ่งท่วมซ้ำบ่อย (GISTDA ไม่ได้เผยแพร่ช่วงสีเป็นตัวเลข) · ไทล์ชุดนี้ไฟล์ใหญ่ โหลดช้ากว่า</p>'
        : '<div class="fl-leg"><span><i class="fl-chip" style="background:#0ea5e9;border-radius:2px"></i>พื้นที่น้ำท่วมที่ดาวเทียมตรวจพบในช่วง ' + esc(RISK[riskMode].t) + 'ล่าสุด</span></div>' +
          '<p class="fl-note">จากภาพดาวเทียม (เรดาร์/ออปติก) ของ GISTDA — ตรวจพบช้ากว่าจริงได้ และอาจไม่เห็นน้ำท่วมใต้เมฆ/ในเมืองหนาแน่น</p>';
    }
    h += '</div>';
    // 4) น้ำทะเลหนุน
    h += '<div class="fl-sec">' + chk("tide", ico("waves") + " น้ำทะเลหนุน (คาดการณ์)", TIDE.err ? '<span class="fl-warn">โหลดไม่สำเร็จ</span>' : TIDE.rows ? TIDE.rows.length + " สถานีชายฝั่ง" : "กำลังโหลด…");
    if (sub.tide && TIDE.rows) {
      var rows = TIDE_KEY.map(function (c) { return TIDE.rows.filter(function (r) { return r.code === c; })[0]; }).filter(Boolean);
      h += '<div class="rv-tl">' + rows.map(function (r) { return '<button type="button" data-rt="' + r.code + '"><span>' + esc(r.n) + '</span><em>↑' + fmt(r.hi, 2) + ' ม. ' + esc(r.hiT) + ' · ↓' + fmt(r.lo, 2) + ' ' + esc(r.loT) + '</em></button>'; }).join("") + '</div>';
      h += '<p class="fl-note">ระดับน้ำขึ้น-ลงคาดการณ์ของวันที่ ' + esc(rows[0] ? rows[0].date : "") + ' (ม.รทก.) · ช่วงน้ำขึ้นสูง น้ำทะเลหนุนทำให้น้ำเหนือระบายออกทะเลช้า · กดจุดสีเขียวน้ำทะเลบนแผนที่ดูกราฟรายชั่วโมง</p>';
    }
    h += '</div>';
    h += '<p class="fl-src">แม่น้ำ/คลอง: © OpenStreetMap (OpenFreeMap) · น้ำเหนือ/น้ำทะเลหนุน: ข้อมูลตรวจวัดและแบบจำลองคาดการณ์ของ สสน. (HII FEWS) รวมข้อมูลกรมชลประทาน · พื้นที่น้ำท่วม: GISTDA</p>';
    return h;
  }
  function panelHTML() { if (!document.getElementById("rv-css")) { var s = document.createElement("style"); s.id = "rv-css"; s.textContent = CSS; document.head.appendChild(s); } return '<div id="rvBox">' + inner() + '</div>'; }
  function render() { var b = document.getElementById("rvBox"); if (b && active) b.innerHTML = inner(); }
  function afterRender(body) {
    var p = $("#floodPanel");
    if (!p || panelBound) return;
    panelBound = true;
    p.addEventListener("change", function (e) {
      var k = e.target.dataset && e.target.dataset.rv;
      if (!k) return;
      sub[k] = e.target.checked;
      lsSet(LS_SUB, JSON.stringify(sub));
      if (k === "risk") addRisk();
      if (k === "north" && sub.north) loadChain();
      if (k === "tide" && sub.tide) loadTide();
      syncVis(); render();
    });
    p.addEventListener("click", function (e) {
      var m = e.target.closest("[data-rm2]");
      if (m) { riskMode = m.dataset.rm2; lsSet(LS_RISK, riskMode); addRisk(); syncVis(); render(); return; }
      var it = e.target.closest("[data-rk]");
      if (it) { showStation(it.dataset.rk, true); return; }
      var tt = e.target.closest("[data-rt]");
      if (tt) showTide(tt.dataset.rt, true);
    });
  }

  function setActive(v) {
    active = !!v;
    clearInterval(refreshTimer);
    if (!active) {
      if (popup) { popup.remove(); popup = null; }
      syncVis();
      return;
    }
    addLayers();
    bindHandlers();
    loadMeta().then(function () { if (sub.north) loadChain(); });
    loadTide();
    refreshTimer = setInterval(function () {
      if (document.hidden) return;
      CHAIN.forEach(function (c) { if (c.k[0] !== "t" && sub.north) loadSeries(c.k); });
      loadTide();
    }, 20 * 60000);
    render();
  }
  // เรียกจาก bkk-flood.js ทุกครั้งที่ mount (รวมตอนเปลี่ยนสไตล์แผนที่ — ชั้นเดิมถูกล้าง)
  function mount(m) {
    map = m;
    try { var s = JSON.parse(lsGet(LS_SUB) || "null"); if (s) Object.keys(sub).forEach(function (k) { if (typeof s[k] === "boolean") sub[k] = s[k]; }); } catch (e) { }
    if (RISK[lsGet(LS_RISK)]) riskMode = lsGet(LS_RISK);
    if (active) addLayers();
  }

  window.BKK_RIVERS = {
    mount: mount,
    setActive: setActive,
    panelHTML: panelHTML,
    afterRender: afterRender,
    hit: function (pt) { return hitAt(pt).length > 0; },
    debug: function () {
      return {
        active: active, sub: sub, risk: riskMode, stations: Object.keys(ST).length, metaErr: META.err,
        chain: CHAIN.map(function (c) { var x = c.k[0] === "t" ? null : stat(c.k); return c.k + (x && x.cur != null ? "=" + Math.round(x.cur * 100) / 100 + (x.pk ? " pk " + Math.round(x.pk[1] * 100) / 100 + "@" + new Date(x.pk[0]).toISOString().slice(5, 16) : "") : ""); }),
        tide: TIDE.rows ? TIDE.rows.length : 0, tideErr: TIDE.err, flow: !!flowTimer,
        layers: LINE_LAYERS.concat(["rv-risk", "rv-st", "rv-st-l", "rv-tide", "rv-tide-l"]).filter(function (id) { return map && map.getLayer(id); })
      };
    }
  };
})();
