/**
 * bkk-dam.js
 * ชั้น "เขื่อน & อ่างเก็บน้ำ" ของ bkk-city.html — ปริมาณน้ำรายวันของเขื่อนใหญ่ 35+ แห่ง อ่างขนาดกลาง ~460 แห่ง และอ่างเล็กมีโทรมาตร ~60 แห่ง ทั่วประเทศ
 *
 * ข้อมูล
 *   - ตัวเลขรายวัน: /api/dam ← กรมชลประทาน (app.rid.go.th/reservoir) + คลังข้อมูลน้ำแห่งชาติ thaiwater.net (สสน.)
 *     % = ปริมาณน้ำเทียบระดับเก็บกักปกติ (รนก.) · เกิน 100% = น้ำสูงกว่าระดับเก็บกัก ต้องระบายออก/ไหลข้ามทางระบายน้ำล้น
 *   - กราฟทั้งปี + เส้นควบคุมบน/ล่าง (rule curve): /api/dam?g=large|medium&id=… ← thaiwater
 *   - ผิวอ่าง สันเขื่อน และทางน้ำท้ายเขื่อน: bkk-dam-data.js (window.BKK_DAMGEO) จาก _geo/build-bkk-dam.js ← OpenStreetMap
 *     ทางน้ำท้ายเขื่อน = ลำน้ำสายหลักตามแผนที่ OSM (เดินตามทิศการไหล) — ไม่ใช่แบบจำลองน้ำท่วมหรือเขื่อนแตก
 *
 * วาดด้วยชั้น MapLibre ธรรมดา (circle / fill / line / fill-extrusion สำหรับสันเขื่อน 3 มิติ)
 */
(function () {
  "use strict";

  var LS_KEY = "bkk-dam-on";
  var LS_SUB = "bkk-dam-sub";
  var LS_MIN = "bkk-dam-min";
  var REMOTE = "https://ratthai-kaona.vercel.app";
  var DATA_URL = "bkk-dam-data.js";
  var RID_URL = "https://app.rid.go.th/reservoir/";
  var TW_URL = "https://www.thaiwater.net/water/dam";

  // แถบสีตาม % ของระดับเก็บกักปกติ
  var BINS = [
    [-1, "#c2410c", "น้ำน้อย", "≤30%"],
    [30, "#eab308", "น้ำพอใช้", "30–50%"],
    [50, "#22c55e", "น้ำปกติ", "50–80%"],
    [80, "#3b82f6", "น้ำมาก", "80–100%"],
    [100, "#e11d48", "เกินระดับเก็บกัก", ">100%"]
  ];
  var NODATA = "#8a94a6";
  var CLS = { L: "เขื่อนใหญ่", M: "อ่างขนาดกลาง", S: "อ่างเล็ก (โทรมาตร)" };

  var map = null, visible = false, uiBuilt = false, handlersBound = false;
  var sub = { L: true, M: true, S: false, geo: true, down: true, other: true };
  var live = { data: null, at: 0, err: null, busy: false };
  var geo = null, geoLoading = null, geoErr = null;
  var items = [], byKey = {};
  var selected = null, popup = null, refreshTimer = null;
  var graphs = {};

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function fmt(n, d) { return n == null ? "–" : Number(n).toLocaleString("th-TH", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function ago(t) {
    var m = Math.round((Date.now() - t) / 60000);
    return m < 1 ? "เมื่อสักครู่" : m < 60 ? m + " นาทีที่แล้ว" : Math.round(m / 60) + " ชม.ที่แล้ว";
  }
  function thDate(d) {
    if (!d) return "–";
    return new Date(String(d).slice(0, 10) + "T00:00:00Z").toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit", timeZone: "UTC" });
  }
  function dig(v) { return v == null ? 0 : v < 10 ? 2 : v < 100 ? 1 : 0; }
  function bin(p) { if (p == null) return null; var b = BINS[0]; BINS.forEach(function (x) { if (p > x[0]) b = x; }); return b; }
  function colorOf(p) { var b = bin(p); return b ? b[1] : NODATA; }

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
    add("external-link", '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>');
    // เขื่อน: ตัวเขื่อนทรงคางหมู + น้ำด้านหน้า (Lucide ไม่มีไอคอนเขื่อน)
    add("dam", '<path d="M3 20h18"/><path d="M6 20 9 5h6l3 15"/><path d="M3 9c1.2 0 1.8-1 3-1"/><path d="M3 13c1.4 0 2.2-1 3.6-1"/><path d="M11 9v7"/><path d="M13 9v7"/>');
    add("chart-line", '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>');
    add("trending-up", '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>');
    add("trending-down", '<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>');
  }

  /* ================================================================ โหลดข้อมูล */
  function apiList(q) {
    var h = location.hostname, local = h === "localhost" || h === "127.0.0.1" || h === "ratthai-kaona.vercel.app";
    var p = "/api/dam" + (q || "");
    return local ? [p, REMOTE + p] : [REMOTE + p];
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
  function ensureGeo() {
    if (!geoLoading) geoLoading = (window.BKK_DAMGEO ? Promise.resolve() : loadScript(DATA_URL)).then(function () {
      geo = window.BKK_DAMGEO || null;
    }).catch(function (e) { geoErr = String(e.message || e); });
    return geoLoading;
  }
  function loadLive() {
    if (live.busy) return;
    live.busy = true;
    getJSON(apiList("")).then(function (j) {
      live.data = j; live.at = j.now || Date.now(); live.err = null;
      rebuild();
    }).catch(function (e) { live.err = String(e.message || e); })
      .then(function () { live.busy = false; renderPanel(); });
  }

  // รวมสามชุดเป็นรายการเดียว
  function rebuild() {
    var j = live.data;
    items = []; byKey = {};
    if (!j) return;
    (j.large || []).forEach(function (r) {
      items.push({ k: "L" + r[0], cls: "L", tw: r[0], name: r[1], lat: r[2], lon: r[3], prov: r[4], amp: r[5], basin: r[6], owner: r[7],
        max: r[8], cap: r[9], vol: r[10], pct: r[11], qin: r[12], qout: r[13], spill: r[14], date: r[15], hist: r[16] || [], usable: r[17], days: j.daysL });
    });
    (j.medium || []).forEach(function (r) {
      items.push({ k: "M" + r[15], cls: "M", tw: r[0], name: r[1], lat: r[2], lon: r[3], prov: r[4], owner: r[5],
        cap: r[6], vol: r[7], pct: r[8], qin: r[9], qout: r[10], date: r[11], hist: r[12] || [], prev: r[13], usable: r[14], days: j.days });
    });
    (j.small || []).forEach(function (r) {
      items.push({ k: "S" + r[0], cls: "S", name: r[0], lat: r[1], lon: r[2], prov: r[3], amp: r[4], cap: r[5], vol: r[6], pct: r[7], date: r[8], wl: r[9], spillway: r[10], hist: [] });
    });
    items.forEach(function (it, i) { it.i = i; byKey[it.k] = it; });
    setGeo("dam-pts", ptsGeo());
    setGeo("dam-res", resGeo());
    setGeo("dam-wall", wallGeo());
    setGeo("dam-down", downGeo());
  }

  /* ================================================================ GeoJSON */
  function feat(type, coords, props) { return { type: "Feature", geometry: { type: type, coordinates: coords }, properties: props }; }
  function fc(f) { return { type: "FeatureCollection", features: f }; }
  function empty() { return fc([]); }
  function setGeo(id, g) { var s = map && map.getSource(id); if (s) s.setData(g); }
  function rank(it) { return it.pct == null ? 0 : it.pct; }

  function ptsGeo() {
    return fc(items.filter(function (it) { return sub[it.cls]; }).map(function (it) {
      return feat("Point", [it.lon, it.lat], {
        i: it.i, c: colorOf(it.pct), k: rank(it), cls: it.cls, over: it.pct != null && it.pct > 100 ? 1 : 0,
        l: it.name.replace(/^อ่างเก็บน้ำ\s*/, "อ่างฯ ") + (it.pct != null ? " " + fmt(it.pct, 0) + "%" : "")
      });
    }));
  }
  function resGeo() {
    var f = [];
    if (!geo) return fc(f);
    items.forEach(function (it) {
      var g = geo.d[it.k];
      if (!g || !g.r || !sub[it.cls]) return;
      f.push(feat("Polygon", g.r, { i: it.i, c: colorOf(it.pct) }));
    });
    return fc(f);
  }
  function otherGeo() {
    if (!geo) return empty();
    return fc(geo.other.map(function (o, n) { return feat("Polygon", o[2], { n: o[0] || "อ่างเก็บน้ำ", a: o[1], j: n }); }));
  }
  // สันเขื่อน: ขยายเส้นเป็นแถบกว้างแล้วยกเป็นกำแพง (fill-extrusion)
  function buffer(line, wM) {
    if (line.length < 2) return null;
    var lat0 = line[0][1] * Math.PI / 180, mx = 111320 * Math.cos(lat0), my = 110540, h = wM / 2;
    var L = [], Rr = [];
    for (var i = 0; i < line.length; i++) {
      var a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
      var dx = (b[0] - a[0]) * mx, dy = (b[1] - a[1]) * my, n = Math.sqrt(dx * dx + dy * dy) || 1;
      var ox = -dy / n * h / mx, oy = dx / n * h / my;
      L.push([line[i][0] + ox, line[i][1] + oy]); Rr.push([line[i][0] - ox, line[i][1] - oy]);
    }
    var ring = L.concat(Rr.reverse()); ring.push(ring[0]);
    return ring;
  }
  function wallGeo() {
    var f = [];
    if (!geo) return fc(f);
    items.forEach(function (it) {
      var g = geo.d[it.k];
      if (!g || !g.w || !sub[it.cls]) return;
      g.w.forEach(function (w) {
        var weir = w[3], hM = weir ? Math.min(w[1], 6) : w[1], wide = weir ? 6 : it.cls === "L" ? 26 : it.cls === "M" ? 14 : 8;
        w[0].forEach(function (line) {
          var closed = line.length > 3 && line[0][0] === line[line.length - 1][0] && line[0][1] === line[line.length - 1][1];
          var ring = closed ? line : buffer(line, wide);
          if (ring) f.push(feat("Polygon", [ring], { i: it.i, h: hM, weir: weir }));
        });
      });
    });
    return fc(f);
  }
  // ทางน้ำท้ายเขื่อน: เปิดเสมอสำหรับเขื่อนที่เลือก + (ถ้าเปิดตัวเลือก) ทุกอ่างที่น้ำเกิน 100%
  function downGeo() {
    var f = [];
    if (!geo) return fc(f);
    items.forEach(function (it) {
      var g = geo.d[it.k];
      if (!g || !g.d || g.d.length < 2) return;
      var sel = selected === it.k;
      if (!sel && !(sub.down && sub[it.cls] && it.pct != null && it.pct > 100)) return;
      f.push(feat("LineString", g.d, { i: it.i, sel: sel ? 1 : 0 }));
    });
    return fc(f);
  }

  /* ================================================================ ชั้นบนแผนที่ */
  function beforeId() {
    if (map.getLayer("bkk-3d-world")) return "bkk-3d-world";
    if (map.getLayer("city-buildings-3d")) return "city-buildings-3d";
    return undefined;
  }
  function addLayers() {
    if (!map || !map.getStyle()) return;
    var src = function (id, data, extra) { if (!map.getSource(id)) map.addSource(id, Object.assign({ type: "geojson", data: data }, extra || {})); };
    src("dam-other", otherGeo());
    src("dam-res", resGeo());
    src("dam-down", downGeo(), { lineMetrics: true });
    src("dam-wall", wallGeo());
    src("dam-pts", ptsGeo());
    var bf = beforeId();
    if (!map.getLayer("dam-other")) map.addLayer({
      id: "dam-other", type: "fill", source: "dam-other", minzoom: 6,
      paint: { "fill-color": "#7b8aa3", "fill-opacity": 0.28, "fill-outline-color": "rgba(160,175,200,.6)" }
    }, bf);
    if (!map.getLayer("dam-res")) map.addLayer({
      id: "dam-res", type: "fill", source: "dam-res", minzoom: 5,
      paint: { "fill-color": ["get", "c"], "fill-opacity": ["interpolate", ["linear"], ["zoom"], 5, 0.55, 11, 0.38], "fill-outline-color": "rgba(255,255,255,.55)" }
    }, bf);
    if (!map.getLayer("dam-res-line")) map.addLayer({
      id: "dam-res-line", type: "line", source: "dam-res", minzoom: 8,
      paint: { "line-color": ["get", "c"], "line-width": 1.4, "line-opacity": 0.9 }
    }, bf);
    // ทางน้ำท้ายเขื่อน: ไล่สีจากสีแดงที่ตัวเขื่อนไปฟ้าอ่อนปลายทาง = บอกทิศการไหล
    if (!map.getLayer("dam-down-casing")) map.addLayer({
      id: "dam-down-casing", type: "line", source: "dam-down", layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "rgba(0,0,0,.45)", "line-width": ["interpolate", ["linear"], ["zoom"], 6, 3, 12, 7], "line-blur": 1 }
    }, bf);
    if (!map.getLayer("dam-down")) map.addLayer({
      id: "dam-down", type: "line", source: "dam-down", layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-width": ["interpolate", ["linear"], ["zoom"], 6, ["case", ["==", ["get", "sel"], 1], 3, 1.8], 12, ["case", ["==", ["get", "sel"], 1], 5.5, 3.5]],
        "line-gradient": ["interpolate", ["linear"], ["line-progress"], 0, "#ff3b5c", 0.15, "#ff8a3d", 0.45, "#ffd166", 1, "#7dd3fc"]
      }
    }, bf);
    if (!map.getLayer("dam-wall")) map.addLayer({
      id: "dam-wall", type: "fill-extrusion", source: "dam-wall", minzoom: 10.5,
      paint: {
        "fill-extrusion-color": ["case", ["==", ["get", "weir"], 1], "#d9c2a3", "#ffd6a8"],   // สีอุ่นชดเชยแสงฟ้าของแผนที่ → ออกมาเป็นสีคอนกรีต
        "fill-extrusion-vertical-gradient": true,
        "fill-extrusion-height": ["get", "h"], "fill-extrusion-base": 0,
        "fill-extrusion-opacity": ["interpolate", ["linear"], ["zoom"], 10.5, 0, 11.5, 0.95]
      }
    }, bf);
    if (!map.getLayer("dam-pts")) map.addLayer({
      id: "dam-pts", type: "circle", source: "dam-pts",
      layout: { "circle-sort-key": ["get", "k"] },
      paint: {
        "circle-color": ["get", "c"],
        "circle-radius": ["interpolate", ["linear"], ["zoom"],
          5, ["match", ["get", "cls"], "L", 6, "M", 3.2, 2.4],
          10, ["match", ["get", "cls"], "L", 10, "M", 6.5, 5],
          14, ["match", ["get", "cls"], "L", 13, "M", 9, 7]],
        "circle-stroke-color": ["case", ["==", ["get", "over"], 1], "#fff1f2", "rgba(255,255,255,.9)"],
        "circle-stroke-width": ["case", ["==", ["get", "over"], 1], 2.4, ["==", ["get", "cls"], "L"], 1.8, 1]
      }
    });
    if (!map.getLayer("dam-lbl")) map.addLayer({
      id: "dam-lbl", type: "symbol", source: "dam-pts",
      filter: ["any", ["==", ["get", "cls"], "L"], [">=", ["zoom"], 9]],
      minzoom: 6.5,
      layout: {
        "text-field": ["get", "l"], "text-font": ["Noto Sans Bold"], "text-size": ["match", ["get", "cls"], "L", 11, 10],
        "text-offset": [0, 1.2], "text-anchor": "top", "text-optional": true, "text-max-width": 10,
        "symbol-sort-key": ["-", 200, ["get", "k"]]
      },
      paint: { "text-color": "#f5f7fb", "text-halo-color": "rgba(10,14,22,.85)", "text-halo-width": 1.4 }
    });
    syncLayerVis();
  }
  var LAYERS = ["dam-lbl", "dam-pts", "dam-wall", "dam-down", "dam-down-casing", "dam-res-line", "dam-res", "dam-other"];
  function syncLayerVis() {
    var set = function (id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); };
    set("dam-pts", visible); set("dam-lbl", visible);
    set("dam-res", visible && sub.geo); set("dam-res-line", visible && sub.geo); set("dam-wall", visible && sub.geo);
    set("dam-other", visible && sub.geo && sub.other);
    set("dam-down", visible); set("dam-down-casing", visible);
  }

  /* ================================================================ การ์ดเขื่อน */
  function chip(c, t) { return '<i class="dm-chip" style="background:' + c + '"></i>' + t; }
  function row(a, b) { return b == null || b === "" ? "" : '<div class="dm-row"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function gauge(p) {
    var w = p == null ? 0 : Math.min(p, 130) / 130 * 100;
    return '<div class="dm-gauge"><i style="width:' + w + '%;background:' + colorOf(p) + '"></i>' +
      '<u style="left:' + (100 / 130 * 100) + '%" title="ระดับเก็บกักปกติ 100%"></u></div>';
  }
  // กราฟเส้น % ย้อนหลังรายวัน
  function spark(hist, days) {
    var v = hist.map(function (x, i) { return { x: i, y: x }; }).filter(function (p) { return p.y != null; });
    if (v.length < 2) return "";
    var W = 244, H = 58, lo = Math.min.apply(null, v.map(function (p) { return p.y; }).concat([100])) - 3, hi = Math.max.apply(null, v.map(function (p) { return p.y; }).concat([100])) + 3;
    var X = function (i) { return 4 + i / (hist.length - 1) * (W - 8); }, Y = function (y) { return H - 12 - (y - lo) / (hi - lo) * (H - 20); };
    var d = v.map(function (p, k) { return (k ? "L" : "M") + X(p.x).toFixed(1) + " " + Y(p.y).toFixed(1); }).join("");
    var last = v[v.length - 1], first = v[0];
    return '<svg class="dm-spark" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="ปริมาณน้ำย้อนหลัง ' + hist.length + ' วัน">' +
      '<line x1="4" x2="' + (W - 4) + '" y1="' + Y(100).toFixed(1) + '" y2="' + Y(100).toFixed(1) + '" class="dm-ref"/>' +
      '<text x="' + (W - 4) + '" y="' + (Y(100) - 3).toFixed(1) + '" text-anchor="end" class="dm-reft">100%</text>' +
      '<path d="' + d + '" fill="none" stroke="' + colorOf(last.y) + '" stroke-width="2" stroke-linejoin="round"/>' +
      v.map(function (p) { return '<circle cx="' + X(p.x).toFixed(1) + '" cy="' + Y(p.y).toFixed(1) + '" r="2.2" fill="' + colorOf(p.y) + '"/>'; }).join("") +
      '<text x="4" y="' + (H - 1) + '" class="dm-axt">' + (days && days[first.x] ? thDate(days[first.x]) : "") + '</text>' +
      '<text x="' + (W - 4) + '" y="' + (H - 1) + '" text-anchor="end" class="dm-axt">' + (days && days[last.x] ? thDate(days[last.x]) : "") + '</text></svg>';
  }
  function trend(it) {
    var v = it.hist.filter(function (x) { return x != null; });
    if (v.length < 2) return "";
    var d = v[v.length - 1] - v[0];
    if (Math.abs(d) < 0.3) return "ทรงตัวใน " + v.length + " วัน";
    return (d > 0 ? ico("trending-up") + " เพิ่มขึ้น " : ico("trending-down") + " ลดลง ") + fmt(Math.abs(d), 1) + " จุด% ใน " + v.length + " วัน";
  }
  function card(it) {
    var b = bin(it.pct), g = geo && geo.d[it.k];
    var h = '<div class="dm-pop"><b class="dm-pop-t">' + esc(it.name) + ' <small>' + CLS[it.cls] + '</small></b>';
    if (it.pct != null && it.pct > 100) h += '<div class="dm-alert">' + ico("triangle-alert") + ' น้ำเกินระดับเก็บกักปกติ ' + fmt(it.pct - 100, 1) + '% — ต้องเร่งระบายน้ำ/น้ำไหลข้ามทางระบายน้ำล้น</div>';
    h += '<div class="dm-big"><b style="color:' + colorOf(it.pct) + '">' + (it.pct == null ? "–" : fmt(it.pct, 1) + "%") + '</b><span>' + (b ? b[2] : "ไม่มีข้อมูลวันนี้") + '<br><small>ของระดับเก็บกักปกติ</small></span></div>';
    h += gauge(it.pct);
    h += row("ปริมาณน้ำ", it.vol == null ? null : fmt(it.vol, dig(it.vol)) + " / " + fmt(it.cap, dig(it.cap)) + " ล้าน ลบ.ม.");
    if (it.max && it.cap && it.max > it.cap) h += row("ความจุสูงสุด", fmt(it.max, 0) + " ล้าน ลบ.ม.");
    if (it.usable != null) h += row("น้ำใช้การได้", fmt(it.usable, dig(it.usable)) + " ล้าน ลบ.ม.");
    if (it.qin != null || it.qout != null) {
      var net = it.qin != null && it.qout != null ? it.qin - it.qout : null;
      h += row("ไหลเข้า / ระบาย", fmt(it.qin, 2) + " / " + fmt(it.qout, 2) + ' <small>ล้าน ลบ.ม./วัน</small>');
      if (net != null && Math.abs(net) >= 0.01) h += row("สุทธิ", (net > 0 ? '<span class="dm-up">▲ น้ำเพิ่ม ' : '<span class="dm-down">▼ น้ำลด ') + fmt(Math.abs(net), 2) + "</span>");
    }
    if (it.spill) h += row("ไหลข้ามทางระบายน้ำล้น", fmt(it.spill, 2) + " ล้าน ลบ.ม./วัน");
    if (it.wl != null) h += row("ระดับน้ำ / สันฝาย", fmt(it.wl, 2) + " / " + fmt(it.spillway, 2) + " ม.รทก.");
    if (it.prev != null) h += row("วันเดียวกันปีก่อน", fmt(it.prev, 1) + "%");
    var sp = spark(it.hist, it.days);
    if (sp) h += '<div class="dm-sub">ย้อนหลังรายวัน · ' + trend(it) + '</div>' + sp;
    if ((it.cls === "L" || it.cls === "M") && it.tw) h += '<button type="button" class="dm-btn" data-graph="' + it.k + '">' + ico("chart-line") + ' กราฟทั้งปี' + (it.cls === "L" ? " + เกณฑ์ควบคุม (rule curve)" : "") + '</button><div class="dm-graph" id="dmGraph"></div>';
    // ทางน้ำท้ายเขื่อน
    if (g && g.d) {
      h += '<div class="dm-sub">' + ico("waves") + ' ทางน้ำท้ายเขื่อน (ตามแผนที่ OSM ~' + fmt(g.l) + ' กม.)</div>';
      if (g.n && g.n.length) h += '<div class="dm-flow">' + g.n.map(esc).join(" → ") + '</div>';
      if (g.t && g.t.length) h += '<div class="dm-tb">' + g.t.slice(0, 14).map(function (t) { return '<span><small>กม.' + t[0] + '</small> ต.' + esc(t[1]) + ' <small>อ.' + esc(t[2]) + (t[3] !== it.prov ? " จ." + esc(t[3]) : "") + '</small></span>'; }).join("") + '</div>';
      h += '<p class="dm-note">ตำบลที่ลำน้ำสายหลักไหลผ่าน — ไม่ใช่ขอบเขตพื้นที่น้ำท่วม' +
        (g.l < 10 ? " · เส้นสั้นเพราะลำน้ำในแผนที่ OSM ขาดตอนหลังจากนี้ ไม่ได้แปลว่าน้ำไปแค่นี้" : "") + '</p>';
    } else if (geo) {
      h += '<p class="dm-note">แผนที่ OSM ยังไม่มีเส้นลำน้ำท้ายเขื่อนนี้ที่ต่อกันครบ จึงไม่วาดทางน้ำ (ไม่เดาเส้น)</p>';
    }
    h += row("ที่ตั้ง", esc([it.amp && "อ." + it.amp, it.prov && "จ." + it.prov].filter(Boolean).join(" ")));
    if (it.basin) h += row("ลุ่มน้ำ", esc(it.basin));
    if (it.owner) h += row("หน่วยงาน", '<small>' + esc(it.owner) + '</small>');
    h += row("ข้อมูลวันที่", it.date ? thDate(it.date) + (String(it.date).length > 10 ? " " + String(it.date).slice(11, 16) + " น." : "") : "–");
    h += '<div class="dm-pop-f">ข้อมูล: ' + (it.cls === "S" ? "สสน. ผ่านคลังข้อมูลน้ำแห่งชาติ" : "กรมชลประทาน") +
      ' · <a href="' + (it.cls === "S" ? TW_URL : RID_URL + (it.cls === "L" ? "" : "rsvmiddle")) + '" target="_blank" rel="noopener">ดูที่ต้นทาง ' + ico("external-link") + '</a></div></div>';
    return h;
  }

  // กราฟทั้งปี: เส้นปีนี้ + เส้นควบคุมบน/ล่าง + ระดับเก็บกักปกติ (หน่วยล้าน ลบ.ม.)
  function yearChart(g, it) {
    var W = 264, H = 150, pl = 34, pr = 6, pt = 8, pb = 20;
    var vals = g.cur.map(function (p) { return p[1]; }).concat(g.upper.map(function (p) { return p[1]; }), [g.normal || 0, g.max || 0, it.cap || 0]);
    var hi = Math.max.apply(null, vals.filter(function (x) { return x != null; })) * 1.05, lo = 0;
    var X = function (d) { return pl + d / 365 * (W - pl - pr); }, Y = function (v) { return pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb); };
    var path = function (a) { return a.map(function (p, k) { return (k ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join(""); };
    var s = '<svg class="dm-year" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="ปริมาณน้ำรายวันปี ' + (g.y + 543) + '">';
    [0, 0.25, 0.5, 0.75, 1].forEach(function (f) {
      var v = hi * f;
      s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" class="dm-grid"/><text x="' + (pl - 3) + '" y="' + (Y(v) + 3).toFixed(1) + '" text-anchor="end" class="dm-axt">' + fmt(v, v < 10 ? 1 : 0) + '</text>';
    });
    ["ม.ค.", "เม.ย.", "ก.ค.", "ต.ค."].forEach(function (m, k) { s += '<text x="' + X(k * 91).toFixed(1) + '" y="' + (H - 6) + '" class="dm-axt">' + m + '</text>'; });
    if (g.upper.length && g.lower.length) {
      var band = path(g.upper) + g.lower.slice().reverse().map(function (p) { return "L" + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join("") + "Z";
      s += '<path d="' + band + '" class="dm-band"/><path d="' + path(g.upper) + '" class="dm-upper"/><path d="' + path(g.lower) + '" class="dm-lower"/>';
    }
    var cap = g.normal || it.cap;
    if (cap) s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(cap).toFixed(1) + '" y2="' + Y(cap).toFixed(1) + '" class="dm-ref"/><text x="' + (W - pr) + '" y="' + (Y(cap) - 3).toFixed(1) + '" text-anchor="end" class="dm-reft">รนก. ' + fmt(cap, cap < 10 ? 1 : 0) + '</text>';
    if (g.cur.length) s += '<path d="' + path(g.cur) + '" fill="none" stroke="' + colorOf(it.pct) + '" stroke-width="2.2"/>';
    s += '</svg>';
    var leg = '<div class="dm-leg"><span><i style="background:' + colorOf(it.pct) + '"></i>ปี ' + (g.y + 543) + '</span>' +
      (g.upper.length ? '<span><i class="u"></i>เกณฑ์บน</span><span><i class="l"></i>เกณฑ์ล่าง</span>' : "") + '<span><i class="r"></i>ระดับเก็บกักปกติ</span></div>';
    return s + leg + '<p class="dm-note">หน่วย: ล้าน ลบ.ม. · ที่มา: คลังข้อมูลน้ำแห่งชาติ (สสน.)' + (g.upper.length ? " · เหนือเกณฑ์บน = เสี่ยงน้ำล้น ต้องพร่องน้ำ" : "") + '</p>';
  }
  function loadGraph(it) {
    var el = document.getElementById("dmGraph");
    if (!el) return;
    var y = new Date().getFullYear(), k = it.cls + it.tw + ":" + y;
    if (graphs[k]) { el.innerHTML = yearChart(graphs[k], it); return; }
    el.innerHTML = '<p class="dm-note">กำลังโหลดกราฟ…</p>';
    getJSON(apiList("?g=" + (it.cls === "L" ? "large" : "medium") + "&id=" + it.tw + "&y=" + y)).then(function (g) {
      graphs[k] = g;
      var e2 = document.getElementById("dmGraph");
      if (e2) e2.innerHTML = g.cur && g.cur.length ? yearChart(g, it) : '<p class="dm-note">ต้นทางยังไม่มีข้อมูลรายวันของอ่างนี้ในปีนี้</p>';
    }).catch(function () {
      var e2 = document.getElementById("dmGraph");
      if (e2) e2.innerHTML = '<p class="dm-note">โหลดกราฟไม่สำเร็จ</p>';
    });
  }

  function select(k, fly) {
    var it = byKey[k];
    if (!it) return;
    selected = k;
    setGeo("dam-down", downGeo());
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ closeButton: true, maxWidth: "320px", className: "dm-popup", offset: 12 })
      .setLngLat([it.lon, it.lat]).setHTML(card(it)).addTo(map);
    popup.on("close", function () { if (selected === k) { selected = null; setGeo("dam-down", downGeo()); } });
    popup.getElement().addEventListener("click", function (e) {
      var b = e.target.closest("[data-graph]");
      if (b) { b.remove(); loadGraph(it); }
    });
    if (fly) {
      var g = geo && geo.d[k];
      map.flyTo({ center: [it.lon, it.lat], zoom: Math.max(map.getZoom(), g && g.a > 30 ? 10 : 11.5), pitch: 50, duration: 1800, essential: true });
    }
  }

  function bindHandlers() {
    if (handlersBound) return;
    handlersBound = true;
    var hit = function (pt) {
      if (!visible) return null;
      var ids = ["dam-pts", "dam-wall", "dam-res"].filter(function (id) { return map.getLayer(id) && map.getLayoutProperty(id, "visibility") !== "none"; });
      if (!ids.length) return null;
      var fs = map.queryRenderedFeatures([[pt.x - 5, pt.y - 5], [pt.x + 5, pt.y + 5]], { layers: ids });
      for (var k = 0; k < ids.length; k++) for (var j = 0; j < fs.length; j++) if (fs[j].layer.id === ids[k]) return fs[j];
      return null;
    };
    map.on("click", function (e) {
      var f = hit(e.point);
      if (!f) return;
      var it = items[f.properties.i];
      if (it) select(it.k, false);
    });
    var hov = false;
    map.on("mousemove", function (e) {
      var h = !!hit(e.point);
      if (h !== hov) { hov = h; map.getCanvas().style.cursor = h ? "pointer" : ""; }
    });
  }

  /* ================================================================ แผงควบคุม */
  var CSS = [
    "#damPanel{position:absolute;z-index:43;right:14px;bottom:40px;width:330px;max-width:calc(100% - 28px);max-height:calc(100% - 120px);overflow:auto;display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.5}",
    "#damPanel.open{display:block;animation:elvIn .22s ease}",
    "#floodPanel.open~#damPanel{right:358px}",
    ".dm-ph{display:flex;align-items:center;gap:8px;padding:11px 12px 6px 14px;font-weight:800;font-size:13.5px;position:sticky;top:0;background:inherit;z-index:1}",
    ".dm-ph .dm-ib{margin-left:auto}.dm-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".dm-ib .mdico{width:13px;height:13px}",
    "#damPanel.min .dm-body{display:none}",
    ".dm-body{padding:0 14px 12px}",
    ".dm-sum{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:2px 0 8px}",
    ".dm-sum div{background:rgba(127,127,127,.08);border:1px solid var(--card-border);border-radius:10px;padding:6px 8px}",
    ".dm-sum b{display:block;font-size:16px;font-variant-numeric:tabular-nums}.dm-sum small{opacity:.7;font-size:10.5px}",
    ".dm-sec{border-top:1px solid var(--card-border);padding:9px 0 7px}",
    ".dm-sec>label,.dm-chk{display:flex;align-items:center;gap:8px;font-weight:700;cursor:pointer}.dm-sec input{accent-color:var(--accent);margin:0}",
    ".dm-sec>label small,.dm-chk small{margin-left:auto;font-weight:500;opacity:.65;font-size:11px}",
    ".dm-chk{font-weight:600;margin-top:4px}",
    ".dm-h{font-weight:800;display:flex;align-items:center;gap:6px;margin-bottom:5px}.dm-h small{margin-left:auto;font-weight:500;opacity:.65}",
    ".dm-list{display:flex;flex-direction:column;gap:3px;max-height:230px;overflow:auto}",
    ".dm-it{display:flex;align-items:center;gap:8px;border:0;background:rgba(127,127,127,.07);border-radius:8px;padding:5px 8px;color:inherit;font:inherit;font-size:12px;text-align:left;cursor:pointer}",
    ".dm-it:hover{background:var(--accent-soft)}.dm-it span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dm-it span small{opacity:.6}",
    ".dm-it b{font-variant-numeric:tabular-nums}.dm-it em{font-style:normal;font-size:10.5px;opacity:.8;min-width:38px;text-align:right}",
    ".dm-leg{display:flex;flex-wrap:wrap;gap:4px 10px;margin:5px 0 0;font-size:11px}.dm-leg span{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}",
    ".dm-leg i{display:inline-block;width:14px;height:3px;border-radius:2px}.dm-leg i.u{background:#f87171}.dm-leg i.l{background:#fbbf24}.dm-leg i.r{border-top:1.5px dashed currentColor;height:0;opacity:.6}",
    ".dm-chip{display:inline-block;width:10px;height:10px;border-radius:50%;box-shadow:0 0 0 1.5px rgba(255,255,255,.85);flex:none;margin-right:4px;vertical-align:-1px}",
    ".dm-grad{height:6px;border-radius:3px;margin:6px 0 2px;background:linear-gradient(90deg,#ff3b5c,#ff8a3d 15%,#ffd166 45%,#7dd3fc)}",
    ".dm-gradl{display:flex;justify-content:space-between;font-size:10px;opacity:.7}",
    ".dm-search{width:100%;box-sizing:border-box;margin:0 0 6px;padding:6px 9px;border-radius:9px;border:1px solid var(--card-border);background:rgba(127,127,127,.08);color:inherit;font:inherit;font-size:12px}",
    ".dm-src{margin:10px 0 0;font-size:10px;opacity:.6;line-height:1.5}",
    ".dm-warn{color:#f59f0b}",
    ".dm-popup .maplibregl-popup-content{background:var(--card-bg);color:var(--text-main);border:1px solid var(--card-border);border-radius:12px;padding:11px 13px 9px;box-shadow:0 10px 30px rgba(0,0,0,.3);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);max-height:70vh;overflow:auto}",
    ".dm-popup .maplibregl-popup-tip{display:none}.dm-popup .maplibregl-popup-close-button{color:var(--text-muted);font-size:17px;right:4px;top:3px}",
    ".dm-pop{font-size:12px;line-height:1.5;min-width:240px}.dm-pop-t{display:block;font-size:13.5px;margin:0 16px 6px 0}.dm-pop-t small{font-weight:500;opacity:.65;font-size:11px}",
    ".dm-alert{background:rgba(225,29,72,.14);border:1px solid rgba(225,29,72,.45);color:inherit;border-radius:8px;padding:5px 8px;margin:0 0 7px;font-size:11.5px;font-weight:600}.dm-alert .mdico{width:13px;height:13px;vertical-align:-2px;color:#e11d48}",
    ".dm-big{display:flex;align-items:center;gap:10px;margin:2px 0 4px}.dm-big b{font-size:26px;font-variant-numeric:tabular-nums;line-height:1}.dm-big span{font-size:11.5px;font-weight:700;line-height:1.3}.dm-big small{font-weight:500;opacity:.65}",
    ".dm-gauge{position:relative;height:7px;border-radius:4px;background:rgba(127,127,127,.2);margin:0 0 7px;overflow:visible}.dm-gauge i{position:absolute;left:0;top:0;bottom:0;border-radius:4px}.dm-gauge u{position:absolute;top:-3px;bottom:-3px;width:2px;background:currentColor;opacity:.6}",
    ".dm-row{display:flex;gap:10px;justify-content:space-between;padding:1.5px 0}.dm-row span{opacity:.7;white-space:nowrap}.dm-row b{text-align:right;font-weight:600}.dm-row small{opacity:.7;font-weight:500}",
    ".dm-up{color:#3b82f6}.dm-down{color:#22c55e}",
    ".dm-sub{margin:8px 0 2px;font-weight:700;font-size:11.5px;display:flex;align-items:center;gap:5px}.dm-sub .mdico{width:13px;height:13px}",
    ".dm-spark,.dm-year{display:block;width:100%;height:auto}.dm-ref{stroke:currentColor;stroke-opacity:.45;stroke-dasharray:3 3}.dm-reft,.dm-axt{fill:currentColor;fill-opacity:.6;font-size:9px}",
    ".dm-grid{stroke:currentColor;stroke-opacity:.1}.dm-band{fill:#22c55e;fill-opacity:.1}.dm-upper{fill:none;stroke:#f87171;stroke-width:1.3}.dm-lower{fill:none;stroke:#fbbf24;stroke-width:1.3}",
    ".dm-btn{display:flex;align-items:center;gap:6px;width:100%;margin:8px 0 2px;padding:6px 9px;border-radius:9px;border:1px solid var(--card-border);background:rgba(127,127,127,.08);color:inherit;font:inherit;font-size:11.5px;font-weight:700;cursor:pointer}.dm-btn:hover{border-color:var(--accent);background:var(--accent-soft)}.dm-btn .mdico{width:13px;height:13px}",
    ".dm-flow{font-size:11.5px;font-weight:600;margin:0 0 3px}",
    ".dm-tb{display:flex;flex-wrap:wrap;gap:3px 5px;font-size:11px}.dm-tb span{background:rgba(127,127,127,.1);border-radius:6px;padding:1px 6px}.dm-tb small{opacity:.65}",
    ".dm-note{font-size:10.5px;opacity:.65;margin:3px 0 4px}",
    ".dm-pop-f{margin-top:6px;padding-top:6px;border-top:1px solid var(--card-border);font-size:10.5px;opacity:.75}.dm-pop-f a{color:var(--accent);font-weight:700;text-decoration:none}.dm-pop-f .mdico{width:11px;height:11px;vertical-align:-1px}",
    "@media (max-width:760px){#damPanel,#floodPanel.open~#damPanel{bottom:86px;right:14px;left:14px;width:auto;max-height:40vh}.dm-sum b{font-size:14px}}"
  ].join("");

  var query = "";
  function listHTML() {
    var hot = items.filter(function (it) { return sub[it.cls] && it.pct != null && it.pct >= 80; })
      .sort(function (a, b) { return b.pct - a.pct; });
    var q = query.trim(), res = hot;
    if (q) res = items.filter(function (it) { return (it.name + " " + (it.prov || "") + " " + (it.amp || "")).indexOf(q) >= 0; })
      .sort(function (a, b) { return (b.pct || 0) - (a.pct || 0); }).slice(0, 60);
    var h = '<div class="dm-sec"><div class="dm-h">' + ico("triangle-alert") + (q ? " ผลค้นหา" : " น้ำมาก–เกินระดับเก็บกัก") + '<small>' + fmt(res.length) + ' แห่ง</small></div>' +
      '<input class="dm-search" id="damSearch" type="search" placeholder="ค้นชื่อเขื่อน/อ่าง หรือจังหวัด เช่น ระยอง" value="' + esc(q) + '">';
    h += '<div class="dm-list">' + res.slice(0, 80).map(function (it) {
      var v = it.hist.filter(function (x) { return x != null; }), d = v.length > 1 ? v[v.length - 1] - v[0] : null;
      return '<button type="button" class="dm-it" data-k="' + esc(it.k) + '">' + chip(colorOf(it.pct), "") +
        '<span>' + esc(it.name) + ' <small>' + esc(it.prov || "") + '</small></span>' +
        '<em>' + (d == null || Math.abs(d) < 0.3 ? "" : (d > 0 ? "▲" : "▼") + fmt(Math.abs(d), 1)) + '</em><b>' + (it.pct == null ? "–" : fmt(it.pct, 0) + "%") + '</b></button>';
    }).join("") + (res.length ? "" : '<p class="dm-note">ไม่พบ</p>') + '</div></div>';
    return h;
  }
  function renderPanel() {
    var p = $("#damPanel");
    if (!p || !visible) return;
    var body = p.querySelector(".dm-body");
    var ae = document.activeElement, typing = ae && ae.id === "damSearch", caret = typing ? ae.selectionStart : 0;
    var h = "";
    if (!live.data) {
      h += '<p class="dm-note">' + (live.err ? '<span class="dm-warn">โหลดข้อมูลไม่สำเร็จ (' + esc(live.err) + ')</span>' : "กำลังโหลดข้อมูลเขื่อนจากกรมชลประทาน…") + '</p>';
    } else {
      var withData = items.filter(function (it) { return it.pct != null && sub[it.cls]; });
      var over = withData.filter(function (it) { return it.pct > 100; }).length, high = withData.filter(function (it) { return it.pct >= 80 && it.pct <= 100; }).length;
      var L = items.filter(function (it) { return it.cls === "L" && it.vol != null; });
      var vol = L.reduce(function (s, it) { return s + it.vol; }, 0), cap = L.reduce(function (s, it) { return s + (it.cap || 0); }, 0);
      h += '<div class="dm-sum"><div><b style="color:' + BINS[4][1] + '">' + over + '</b><small>เกิน 100%</small></div><div><b style="color:' + BINS[3][1] + '">' + high + '</b><small>80–100%</small></div>' +
        '<div><b>' + (cap ? fmt(vol / cap * 100, 0) + "%" : "–") + '</b><small>รวมเขื่อนใหญ่</small></div></div>';
      h += listHTML();
    }
    h += '<div class="dm-sec">' + ["L", "M", "S"].map(function (c) {
      var n = items.filter(function (it) { return it.cls === c; }).length;
      return '<label class="dm-chk"><input type="checkbox" data-s="' + c + '"' + (sub[c] ? " checked" : "") + '>' + CLS[c] + '<small>' + (n ? fmt(n) + " แห่ง" : "") + '</small></label>';
    }).join("") +
      '<div class="dm-leg">' + BINS.slice().reverse().map(function (b) { return '<span>' + chip(b[1], "") + b[2] + ' <small>' + b[3] + '</small></span>'; }).join("") + '<span>' + chip(NODATA, "") + 'ไม่มีข้อมูลวันนี้</span></div></div>';
    h += '<div class="dm-sec"><label class="dm-chk"><input type="checkbox" data-s="geo"' + (sub.geo ? " checked" : "") + '>ผิวอ่าง + สันเขื่อน 3 มิติ<small>' + (geo ? "OSM" : geoErr ? '<span class="dm-warn">โหลดไม่ได้</span>' : "กำลังโหลด…") + '</small></label>' +
      '<label class="dm-chk"><input type="checkbox" data-s="other"' + (sub.other ? " checked" : "") + '>อ่างอื่นที่ไม่มีข้อมูลรายวัน<small>สีเทา</small></label>' +
      '<label class="dm-chk"><input type="checkbox" data-s="down"' + (sub.down ? " checked" : "") + '>ทางน้ำท้ายเขื่อนที่น้ำเกิน 100%</label>' +
      '<div class="dm-grad"></div><div class="dm-gradl"><span>ตัวเขื่อน</span><span>ทิศน้ำไหล →</span><span>ปลายทาง</span></div>' +
      '<p class="dm-note">กดเขื่อนใดก็ได้เพื่อดูทางน้ำท้ายเขื่อนนั้น · เส้น = ลำน้ำสายหลักตามแผนที่ ไม่ใช่แบบจำลองน้ำท่วม · ซูมใกล้ ๆ แล้วเอียงแผนที่ดูสันเขื่อน 3 มิติ</p></div>';
    h += '<p class="dm-src">ข้อมูล: กรมชลประทาน (ระบบฐานข้อมูลน้ำในอ่างเก็บน้ำ) · คลังข้อมูลน้ำแห่งชาติ (สสน.) · ผิวอ่าง/สันเขื่อน/ลำน้ำ © ผู้ร่วมพัฒนา OpenStreetMap' +
      (live.data && live.data.date ? " · ข้อมูลล่าสุด " + thDate(live.data.date) : "") + (live.at ? " · ดึงเมื่อ " + ago(live.at) : "") +
      '<br>ใช้ติดตามสถานการณ์เท่านั้น — ข่าวลือเรื่องเขื่อน/อ่าง "แตก" ให้ตรวจกับประกาศของกรมชลประทาน (สายด่วน 1460) และ ปภ. (1784) ก่อนแชร์</p>';
    body.innerHTML = h;
    if (typing) { var s = $("#damSearch"); if (s) { s.focus(); try { s.setSelectionRange(caret, caret); } catch (e) { } } }
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    addIcons();
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnDamToggle")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "menu-btn"; b.id = "btnDamToggle";
      b.title = "เปิด/ปิดชั้นเขื่อน & อ่างเก็บน้ำ — ปริมาณน้ำรายวัน ผิวอ่าง สันเขื่อน 3 มิติ และทางน้ำท้ายเขื่อน";
      b.innerHTML = '<span>' + ico("dam") + '</span><span class="label-text"> เขื่อน & อ่างเก็บน้ำ</span>';
      b.addEventListener("click", function () { setVisible(!visible); });
      var fl = $("#btnFloodToggle");
      if (fl && fl.parentNode === menu) menu.insertBefore(b, fl.nextSibling); else menu.appendChild(b);
    }
    if (!$("#damPanel")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var p = document.createElement("div");
      p.id = "damPanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "เขื่อนและอ่างเก็บน้ำ");
      p.innerHTML = '<div class="dm-ph">' + ico("dam") + ' เขื่อน & อ่างเก็บน้ำ' +
        '<button type="button" class="dm-ib" data-a="min" title="ย่อ/ขยาย">' + ico("minus") + '</button>' +
        '<button type="button" class="dm-ib" style="margin-left:0" data-a="close" title="ปิดชั้นนี้">×</button></div><div class="dm-body"></div>';
      if (lsGet(LS_MIN) === "1") p.classList.add("min");
      stage.appendChild(p);
      p.addEventListener("click", function (e) {
        var a = e.target.closest("[data-a]");
        if (a && a.dataset.a === "close") { setVisible(false); return; }
        if (a && a.dataset.a === "min") { var m = !p.classList.contains("min"); p.classList.toggle("min", m); lsSet(LS_MIN, m ? "1" : "0"); return; }
        var it = e.target.closest("[data-k]");
        if (it) select(it.dataset.k, true);
      });
      p.addEventListener("input", function (e) {
        if (e.target.id === "damSearch") { query = e.target.value; renderPanel(); }
      });
      p.addEventListener("change", function (e) {
        var k = e.target.dataset && e.target.dataset.s;
        if (!k) return;
        sub[k] = e.target.checked;
        lsSet(LS_SUB, JSON.stringify(sub));
        setGeo("dam-pts", ptsGeo()); setGeo("dam-res", resGeo()); setGeo("dam-wall", wallGeo()); setGeo("dam-down", downGeo());
        syncLayerVis();
        renderPanel();
      });
    }
    syncButtons();
  }
  function syncButtons() {
    var b = $("#btnDamToggle"), p = $("#damPanel");
    if (b) b.classList.toggle("active", visible);
    if (p) p.classList.toggle("open", visible);
  }

  function setVisible(v) {
    visible = !!v;
    lsSet(LS_KEY, visible ? "1" : "0");
    syncButtons();
    clearInterval(refreshTimer);
    if (!visible) {
      if (popup) { popup.remove(); popup = null; }
      selected = null;
      syncLayerVis();
      return;
    }
    addLayers();
    bindHandlers();
    renderPanel();
    ensureGeo().then(function () {
      if (!visible) return;
      setGeo("dam-other", otherGeo()); setGeo("dam-res", resGeo()); setGeo("dam-wall", wallGeo()); setGeo("dam-down", downGeo());
      renderPanel();
    });
    if (Date.now() - live.at > 20 * 60000) loadLive();
    refreshTimer = setInterval(function () { if (!document.hidden) loadLive(); }, 30 * 60000);
    // ภาพรวมทั้งประเทศ ถ้ากำลังซูมดูเมืองอยู่
    if (map.getZoom() > 8.5) map.flyTo({ center: [101.2, 14.6], zoom: 5.6, pitch: 0, bearing: 0, duration: 1600 });
  }

  /* ================================================================ mount — เรียกซ้ำทุกครั้งที่เปลี่ยนสไตล์แผนที่ */
  function mount(m) {
    map = m;
    try { var s = JSON.parse(lsGet(LS_SUB) || "null"); if (s) Object.keys(sub).forEach(function (k) { if (typeof s[k] === "boolean") sub[k] = s[k]; }); } catch (e) { }
    buildUI();
    if (lsGet(LS_KEY) === "1" && !visible) { setVisible(true); return; }
    if (!visible) return;
    addLayers();   // สไตล์ใหม่ล้างชั้นเดิมทิ้งหมด → วางกลับ
  }

  window.BKK_DAM = {
    mount: mount,
    setVisible: setVisible,
    select: function (k) { select(k, true); },
    mapRef: function () { return map; },
    debug: function () {
      return {
        visible: visible, sub: sub, items: items.length, err: live.err, geo: !!geo, geoErr: geoErr, selected: selected,
        over100: items.filter(function (it) { return it.pct > 100; }).map(function (it) { return it.name + " " + it.pct; }),
        layers: LAYERS.filter(function (id) { return map && map.getLayer(id); })
      };
    }
  };
})();
