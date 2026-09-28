/**
 * bkk-warn.js
 * ชั้น "ธงเตือนภัย" ของ bkk-city.html — ธงแดง/เหลือง/เขียวรายหมู่บ้าน + พื้นที่ประกาศเตือนภัยรายจังหวัด + สัญญาณจากข้อมูลตรวจวัด
 *
 * ข้อมูล (/api/warn)
 *   - ธง: สถานีเตือนภัยล่วงหน้า น้ำท่วมฉับพลัน-น้ำป่าไหลหลาก กรมทรัพยากรน้ำ (ews.dwr.go.th) ~2,300 สถานีในหมู่บ้านเสี่ยง
 *       🔴 อพยพ (วิกฤติ) · 🟡 เตือนภัย (เตรียมพร้อม) · 🟢 เฝ้าระวัง — ตรงกับสีธงเตือนภัยของ ปภ. (มิสเตอร์เตือนภัย)
 *       ปัจจุบัน = สถานะสด · ย้อนหลัง = 20 ครั้งล่าสุดจาก RSS ของกรมฯ (ธงจาง)
 *   - พื้นที่ประกาศ: CAP ของกรมอุตุนิยมวิทยา (ฝนตกหนัก = Severe ส้ม · ฝนตกหนักมาก = Extreme แดง) เฉพาะฉบับที่ยังมีผล
 *   - สัญญาณจากข้อมูล (คำนวณเอง ไม่ใช่ประกาศ): สถานีน้ำล้นตลิ่ง (/api/thaiwater ระดับ 5) + อ่าง/เขื่อนเกิน 100% (/api/dam)
 *
 * วาดด้วยชั้น MapLibre ธรรมดา (fill / circle / symbol ไอคอนธงวาดด้วย canvas)
 */
(function () {
  "use strict";

  var LS_KEY = "bkk-warn-on";
  var LS_SUB = "bkk-warn-sub";
  var LS_MIN = "bkk-warn-min";
  var REMOTE = "https://ratthai-kaona.vercel.app";
  var EWS_URL = "https://ews.dwr.go.th/ews/";
  var TMD_URL = "https://www.tmd.go.th/warning-and-events/warning-storm";

  var LV = {
    3: { c: "#e11d48", flag: "#ef233c", t: "อพยพ", s: "วิกฤติ", d: "ธงแดง" },
    2: { c: "#f59e0b", flag: "#fbbf24", t: "เตือนภัย", s: "เตรียมพร้อม", d: "ธงเหลือง" },
    1: { c: "#16a34a", flag: "#22c55e", t: "เฝ้าระวัง", s: "เฝ้าระวัง", d: "ธงเขียว" }
  };
  var SEV = {
    Extreme: { c: "#e11d48", t: "ฝนตกหนักมาก", o: 0.2 },
    Severe: { c: "#f97316", t: "ฝนตกหนัก", o: 0.13 },
    Moderate: { c: "#eab308", t: "ปานกลาง", o: 0.1 },
    Minor: { c: "#84cc16", t: "เล็กน้อย", o: 0.08 }
  };
  var SIG = "#f59e0b";

  var map = null, visible = false, uiBuilt = false, handlersBound = false;
  var sub = { flag: true, hist: true, cap: true, sig: true };
  var W = { data: null, at: 0, err: null, busy: false };
  var S = { wl: null, dam: null, at: 0 };
  var popup = null, refreshTimer = null;

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function fmt(n, d) { return n == null ? "–" : Number(n).toLocaleString("th-TH", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function ago(t) {
    var m = Math.round((Date.now() - t) / 60000);
    return m < 1 ? "เมื่อสักครู่" : m < 60 ? m + " นาทีที่แล้ว" : m < 48 * 60 ? Math.round(m / 60) + " ชม.ที่แล้ว" : Math.round(m / 1440) + " วันที่แล้ว";
  }
  // "2026-09-28 07:00:00" (เวลาไทย) หรือ ISO → ms
  function tms(s) {
    if (!s) return null;
    var t = /[zZ]|[+-]\d\d:?\d\d$/.test(s) ? Date.parse(s) : Date.parse(String(s).replace(" ", "T") + "+07:00");
    return isFinite(t) ? t : null;
  }
  function thTime(t) {
    if (t == null) return "–";
    return new Date(t).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" }) + " น.";
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
    add("external-link", '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>');
    add("flag", '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>');
    add("history", '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>');
    add("phone", '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>');
  }

  // ไอคอนธง (canvas → addImage) — โคนเสาอยู่ที่ตำแหน่งสถานีพอดี (icon-anchor bottom-left + offset)
  function flagImage(color) {
    var W2 = 44, H2 = 56, c = document.createElement("canvas");
    c.width = W2; c.height = H2;
    var g = c.getContext("2d");
    g.lineCap = "round";
    g.strokeStyle = "rgba(15,18,26,.9)"; g.lineWidth = 6;
    g.beginPath(); g.moveTo(6, 53); g.lineTo(6, 4); g.stroke();
    g.strokeStyle = "#e5e7eb"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(6, 53); g.lineTo(6, 4); g.stroke();
    // ผืนธงโบกเล็กน้อย
    g.beginPath();
    g.moveTo(7, 5);
    g.bezierCurveTo(18, 1, 26, 9, 40, 5);
    g.lineTo(40, 27);
    g.bezierCurveTo(26, 31, 18, 23, 7, 27);
    g.closePath();
    g.fillStyle = color; g.fill();
    g.lineWidth = 2; g.strokeStyle = "rgba(15,18,26,.85)"; g.stroke();
    return { width: W2, height: H2, data: g.getImageData(0, 0, W2, H2).data };
  }
  function ensureImages() {
    [1, 2, 3].forEach(function (lv) {
      var id = "warn-flag-" + lv;
      if (!map.hasImage(id)) map.addImage(id, flagImage(LV[lv].flag), { pixelRatio: 2 });
    });
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
  function loadWarn() {
    if (W.busy) return;
    W.busy = true;
    getJSON(apiList("warn")).then(function (j) {
      W.data = j; W.at = j.now || Date.now(); W.err = null;
      refreshSources();
    }).catch(function (e) { W.err = String(e.message || e); })
      .then(function () { W.busy = false; renderPanel(); });
  }
  function loadSignals() {
    S.at = Date.now();
    getJSON(apiList("thaiwater")).then(function (j) { S.wl = j.wl || []; refreshSources(); renderPanel(); }).catch(function () { });
    getJSON(apiList("dam")).then(function (j) { S.dam = j; refreshSources(); renderPanel(); }).catch(function () { });
  }

  /* ================================================================ GeoJSON */
  function feat(type, coords, props) { return { type: "Feature", geometry: { type: type, coordinates: coords }, properties: props }; }
  function fc(f) { return { type: "FeatureCollection", features: f }; }
  function empty() { return fc([]); }
  function setGeo(id, g) { var s = map && map.getSource(id); if (s) s.setData(g); }

  function flagGeo() {
    if (!W.data) return empty();
    return fc(W.data.st.map(function (r, i) { return feat("Point", [r[3], r[2]], { i: i, lv: r[4], l: r[1] + " · " + LV[r[4]].t }); }));
  }
  // ย้อนหลัง: ครั้งล่าสุดของแต่ละสถานี (ระดับสูงสุดใน 24 ชม.) ที่ตอนนี้ไม่ได้เตือนแล้ว
  function histRows() {
    if (!W.data) return [];
    var now = new Set(W.data.st.map(function (r) { return r[1] + "|" + r[7]; })), best = {};
    W.data.hist.forEach(function (h, i) {
      if (h[10] == null || h[11] == null) return;
      var k = h[2] + "|" + h[5];
      if (now.has(k)) return;
      var t = Date.parse(h[0]);
      if (!(t > Date.now() - 36 * 3600000)) return;
      var b = best[k];
      if (!b || h[1] > b.h[1] || (h[1] === b.h[1] && t > b.t)) best[k] = { h: h, i: i, t: t };
    });
    return Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) { return b.h[1] - a.h[1] || b.t - a.t; });
  }
  function histGeo() {
    return fc(histRows().map(function (x) { return feat("Point", [x.h[11], x.h[10]], { i: x.i, lv: x.h[1], l: x.h[2] + " · " + LV[x.h[1]].t + " " + ago(x.t) }); }));
  }
  function capActive() { return W.data ? W.data.cap.filter(function (c) { return c.active; }) : []; }
  function capGeo() {
    var f = [];
    // ส้มก่อน แดงทับ
    capActive().slice().sort(function (a, b) { return (a.sev === "Extreme") - (b.sev === "Extreme"); }).forEach(function (c) {
      var sv = SEV[c.sev] || SEV.Severe;
      c.poly.forEach(function (p) {
        var ring = p.slice();
        if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) ring.push(ring[0]);
        f.push(feat("Polygon", [ring], { id: c.id, c: sv.c, o: sv.o }));
      });
    });
    return fc(f);
  }
  function sigRows() {
    var out = [];
    (S.wl || []).forEach(function (r, i) {
      if (r[11] === 5) out.push({ k: "wl", i: i, lat: r[0], lon: r[1], name: r[2] + (r[3] ? " (" + r[3] + ")" : ""), prov: r[5], v: r[10], txt: "น้ำล้นตลิ่ง" + (r[10] != null ? " " + fmt(r[10], 0) + "% ของความจุลำน้ำ" : ""), r: r });
    });
    if (S.dam) {
      (S.dam.large || []).forEach(function (r) { if (r[11] > 100) out.push({ k: "dam", lat: r[2], lon: r[3], name: r[1], prov: r[4], v: r[11], txt: "น้ำ " + fmt(r[11], 1) + "% ของระดับเก็บกัก", r: r }); });
      (S.dam.medium || []).forEach(function (r) { if (r[8] > 100) out.push({ k: "dam", lat: r[2], lon: r[3], name: r[1], prov: r[4], v: r[8], txt: "น้ำ " + fmt(r[8], 1) + "% ของระดับเก็บกัก", r: r }); });
    }
    return out;
  }
  var sigCache = [];
  function sigGeo() {
    sigCache = sigRows();
    return fc(sigCache.map(function (s, i) { return feat("Point", [s.lon, s.lat], { i: i, k: s.k }); }));
  }
  function refreshSources() {
    setGeo("warn-cap", capGeo());
    setGeo("warn-sig", sigGeo());
    setGeo("warn-hist", histGeo());
    setGeo("warn-flag", flagGeo());
  }

  /* ================================================================ ชั้นบนแผนที่ */
  function beforeId() {
    if (map.getLayer("bkk-3d-world")) return "bkk-3d-world";
    if (map.getLayer("city-buildings-3d")) return "city-buildings-3d";
    return undefined;
  }
  function addLayers() {
    if (!map || !map.getStyle()) return;
    ensureImages();
    var src = function (id, data) { if (!map.getSource(id)) map.addSource(id, { type: "geojson", data: data }); };
    src("warn-cap", capGeo()); src("warn-sig", sigGeo()); src("warn-hist", histGeo()); src("warn-flag", flagGeo());
    var bf = beforeId();
    if (!map.getLayer("warn-cap")) map.addLayer({ id: "warn-cap", type: "fill", source: "warn-cap", paint: { "fill-color": ["get", "c"], "fill-opacity": ["get", "o"] } }, bf);
    if (!map.getLayer("warn-cap-line")) map.addLayer({
      id: "warn-cap-line", type: "line", source: "warn-cap",
      paint: { "line-color": ["get", "c"], "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.8, 10, 1.6], "line-opacity": 0.75, "line-dasharray": [3, 2] }
    }, bf);
    if (!map.getLayer("warn-sig")) map.addLayer({
      id: "warn-sig", type: "circle", source: "warn-sig", minzoom: 7,   // ซูมออกทั้งประเทศแล้วรกเกิน — ดูรายจังหวัดในแผงแทน
      paint: {
        "circle-color": "rgba(245,158,11,.12)", "circle-stroke-color": SIG, "circle-stroke-width": 2,
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 7, 4, 10, 7, 14, 10]
      }
    });
    if (!map.getLayer("warn-halo")) map.addLayer({
      id: "warn-halo", type: "circle", source: "warn-flag", filter: ["==", ["get", "lv"], 3],
      paint: { "circle-color": LV[3].c, "circle-opacity": 0.22, "circle-blur": 0.6, "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 12, 12, 30] }
    });
    var flagLayout = function (extra) {
      return Object.assign({
        "icon-image": ["concat", "warn-flag-", ["to-string", ["get", "lv"]]],
        "icon-anchor": "bottom-left", "icon-offset": [-6, 0], "icon-allow-overlap": true, "icon-ignore-placement": true,
        "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.85, 10, 1, 14, 1.2],
        "symbol-sort-key": ["get", "lv"]
      }, extra || {});
    };
    if (!map.getLayer("warn-hist")) map.addLayer({
      id: "warn-hist", type: "symbol", source: "warn-hist",
      layout: flagLayout({
        "text-field": ["step", ["zoom"], "", 9, ["get", "l"]], "text-font": ["Noto Sans Regular"], "text-size": 10.5,
        "text-anchor": "top", "text-offset": [0, 0.5], "text-optional": true, "text-max-width": 12
      }),
      paint: { "icon-opacity": 0.5, "text-color": "rgba(255,255,255,.75)", "text-halo-color": "rgba(10,14,22,.9)", "text-halo-width": 1.3 }
    });
    if (!map.getLayer("warn-flag")) map.addLayer({
      id: "warn-flag", type: "symbol", source: "warn-flag",
      layout: flagLayout({
        "text-field": ["step", ["zoom"], "", 8, ["get", "l"]], "text-font": ["Noto Sans Bold"], "text-size": 11,
        "text-anchor": "top", "text-offset": [0, 0.5], "text-optional": true, "text-max-width": 12
      }),
      paint: { "text-color": "#fff", "text-halo-color": "rgba(10,14,22,.9)", "text-halo-width": 1.5 }
    });
    syncLayerVis();
  }
  function syncLayerVis() {
    var set = function (id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); };
    set("warn-cap", visible && sub.cap); set("warn-cap-line", visible && sub.cap);
    set("warn-sig", visible && sub.sig);
    set("warn-hist", visible && sub.hist);
    set("warn-flag", visible && sub.flag); set("warn-halo", visible && sub.flag);
  }

  /* ================================================================ การ์ด */
  function row(a, b) { return b == null || b === "" ? "" : '<div class="wn-row"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function badge(lv) { var L = LV[lv]; return '<span class="wn-badge" style="background:' + L.c + '">' + ico("flag") + ' ' + L.t + '</span>'; }
  function villages(v) {
    if (!v || !v.length) return "";
    return '<div class="wn-sub">หมู่บ้านในเขตเตือนภัย</div><div class="wn-vill">' + v.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join("") + '</div>';
  }
  var SAFE = '<div class="wn-safe">' + ico("triangle-alert") + ' ถ้าได้รับแจ้ง "อพยพ" ให้ไปยังจุดปลอดภัยที่ชุมชนซ้อมไว้ เช่น วัด โรงเรียน หรือศาลากลางบ้าน และฟังผู้ใหญ่บ้าน/อปท.</div>';
  var HOT = '<div class="wn-pop-f">' + ico("phone") + ' ปภ. <b>1784</b> · กรมอุตุฯ <b>1182</b> · ข้อมูล: กรมทรัพยากรน้ำ · <a href="' + EWS_URL + '" target="_blank" rel="noopener">ระบบเตือนภัยล่วงหน้า ' + ico("external-link") + '</a></div>';
  function stCard(r) {
    var t = tms(r[11]);
    var h = '<div class="wn-pop"><div class="wn-pop-t">' + badge(r[4]) + ' <b>' + esc(r[1]) + '</b></div>';
    h += '<p class="wn-lead">สถานีเตือนภัยแจ้ง<b style="color:' + LV[r[4]].c + '"> ' + LV[r[4]].t + ' (' + LV[r[4]].s + ')</b> ' + (t ? ago(t) : "") + '</p>';
    h += row("ที่ตั้ง", "ต." + esc(r[5]) + " อ." + esc(r[6]) + " จ." + esc(r[7]));
    h += row("เตือนด้วย", r[8] === "wl" ? "ระดับน้ำในลำน้ำ" : "ปริมาณฝน");
    h += row("ฝนสะสม 12 ชม.", r[9] == null ? null : fmt(r[9], 1) + " มม.");
    if (r[8] === "wl") h += row("ระดับน้ำ", r[10] == null ? null : fmt(r[10], 2) + " ม.");
    h += row("ลุ่มน้ำย่อย", esc(r[13]));
    h += row("เวลาแจ้ง", thTime(t));
    h += villages(r[12]);
    if (r[4] === 3) h += SAFE;
    return h + HOT + '</div>';
  }
  function histCard(x) {
    var now = x[12], t = Date.parse(x[0]);
    var h = '<div class="wn-pop"><div class="wn-pop-t">' + badge(x[1]) + ' <b>' + esc(x[2]) + '</b> <small>ย้อนหลัง</small></div>';
    h += '<p class="wn-lead">เคยแจ้ง <b style="color:' + LV[x[1]].c + '">' + LV[x[1]].t + '</b> เมื่อ ' + thTime(t) + ' (' + ago(t) + ')' +
      '<br><small>ตอนนี้: ' + (now === 1 || now === 2 || now === 3 ? LV[now].t : now === 9 ? "มีฝน (ไม่อยู่ในเกณฑ์เตือน)" : "ปกติ") + '</small></p>';
    h += row("ที่ตั้ง", "ต." + esc(x[3]) + " อ." + esc(x[4]) + " จ." + esc(x[5]));
    h += row("เตือนด้วย", esc(x[6]));
    if (x[7]) h += row("ฝนสะสม 12/24/48 ชม.", x[7].map(function (v) { return fmt(v, 0); }).join(" / ") + " มม.");
    h += row("ระดับน้ำ", x[8] == null ? null : fmt(x[8], 2) + " ม.");
    h += villages(x[9]);
    return h + HOT + '</div>';
  }
  function capCard(ids) {
    var cs = W.data.cap.filter(function (c) { return ids.indexOf(c.id) >= 0; }).sort(function (a, b) { return (b.sev === "Extreme") - (a.sev === "Extreme"); });
    var h = '<div class="wn-pop">';
    cs.forEach(function (c, k) {
      var sv = SEV[c.sev] || SEV.Severe;
      h += (k ? '<hr>' : "") + '<div class="wn-pop-t"><span class="wn-badge" style="background:' + sv.c + '">' + esc(sv.t) + '</span> <b>' + esc(c.head || c.event) + '</b></div>';
      h += row("มีผล", thTime(Date.parse(c.eff)) + " – " + thTime(Date.parse(c.exp)));
      h += '<div class="wn-prov">' + c.prov.map(esc).join(" · ") + '</div>';
      if (!k) h += '<p class="wn-desc">' + esc(c.desc) + '</p><p class="wn-desc"><b>คำแนะนำ:</b> ' + esc(c.inst) + '</p>';
    });
    return h + '<div class="wn-pop-f">ประกาศ CAP ของกรมอุตุนิยมวิทยา · <a href="' + TMD_URL + '" target="_blank" rel="noopener">ประกาศฉบับเต็ม ' + ico("external-link") + '</a> · สายด่วน 1182</div></div>';
  }
  function sigCard(s) {
    var h = '<div class="wn-pop"><div class="wn-pop-t"><span class="wn-badge" style="background:' + SIG + '">' + ico("triangle-alert") + ' สัญญาณจากข้อมูล</span> <b>' + esc(s.name) + '</b></div>';
    h += '<p class="wn-lead">' + esc(s.txt) + '</p>';
    h += row("จังหวัด", esc(s.prov));
    if (s.k === "wl") { h += row("ระดับน้ำ / ตลิ่ง", fmt(s.r[7], 2) + " / " + fmt(s.r[9], 2) + " ม.รทก."); h += row("เวลาวัด", esc(s.r[6]) + " น."); }
    return h + '<p class="wn-note">คำนวณจากข้อมูลตรวจวัด (คลังข้อมูลน้ำแห่งชาติ/กรมชลประทาน) — <b>ไม่ใช่ประกาศเตือนภัยหรือคำสั่งอพยพ</b> ดูชั้น "ฝน & น้ำท่วม" และ "เขื่อน & อ่างเก็บน้ำ" สำหรับรายละเอียด</p></div>';
  }
  function openPopup(lngLat, html) {
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ closeButton: true, maxWidth: "320px", className: "wn-popup", offset: 12 }).setLngLat(lngLat).setHTML(html).addTo(map);
  }
  function bindHandlers() {
    if (handlersBound) return;
    handlersBound = true;
    var ORDER = ["warn-flag", "warn-hist", "warn-sig", "warn-cap"];
    var hits = function (pt) {
      if (!visible) return [];
      var ids = ORDER.filter(function (id) { return map.getLayer(id) && map.getLayoutProperty(id, "visibility") !== "none"; });
      if (!ids.length) return [];
      return map.queryRenderedFeatures([[pt.x - 6, pt.y - 10], [pt.x + 10, pt.y + 4]], { layers: ids });
    };
    map.on("click", function (e) {
      var fs = hits(e.point);
      if (!fs.length) return;
      for (var k = 0; k < ORDER.length; k++) {
        var f = fs.filter(function (x) { return x.layer.id === ORDER[k]; });
        if (!f.length) continue;
        var p = f[0].properties, id = ORDER[k];
        if (id === "warn-flag") return openPopup(f[0].geometry.coordinates.slice(), stCard(W.data.st[p.i]));
        if (id === "warn-hist") return openPopup(f[0].geometry.coordinates.slice(), histCard(W.data.hist[p.i]));
        if (id === "warn-sig") return openPopup(f[0].geometry.coordinates.slice(), sigCard(sigCache[p.i]));
        if (id === "warn-cap") {
          var ids = []; f.forEach(function (x) { if (ids.indexOf(x.properties.id) < 0) ids.push(x.properties.id); });
          return openPopup(e.lngLat, capCard(ids));
        }
      }
    });
    var hov = false;
    map.on("mousemove", function (e) {
      var h = hits(e.point).some(function (f) { return f.layer.id !== "warn-cap"; });
      if (h !== hov) { hov = h; map.getCanvas().style.cursor = h ? "pointer" : ""; }
    });
  }
  function flyOpen(kind, i) {
    var r, ll, html;
    if (kind === "st") { r = W.data.st[i]; ll = [r[3], r[2]]; html = stCard(r); }
    else if (kind === "h") { r = W.data.hist[i]; ll = [r[11], r[10]]; html = histCard(r); }
    else { r = sigCache[i]; ll = [r.lon, r.lat]; html = sigCard(r); }
    map.flyTo({ center: ll, zoom: Math.max(map.getZoom(), 10.5), duration: 1600, essential: true });
    map.once("moveend", function () { openPopup(ll, html); });
  }

  /* ================================================================ แผงควบคุม */
  var CSS = [
    "#warnPanel{position:absolute;z-index:43;right:14px;bottom:40px;width:330px;max-width:calc(100% - 28px);max-height:calc(100% - 120px);overflow:auto;display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.5}",
    "#warnPanel.open{display:block;animation:elvIn .22s ease}",
    "#floodPanel.open~#warnPanel,#damPanel.open~#warnPanel{right:358px}#floodPanel.open~#damPanel.open~#warnPanel{right:702px}",
    ".wn-ph{display:flex;align-items:center;gap:8px;padding:11px 12px 6px 14px;font-weight:800;font-size:13.5px;position:sticky;top:0;background:inherit;z-index:1}",
    ".wn-ph .wn-ib{margin-left:auto}.wn-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".wn-ib .mdico{width:13px;height:13px}.wn-ph>.mdico{color:#ef233c}",
    "#warnPanel.min .wn-body{display:none}",
    ".wn-body{padding:0 14px 12px}",
    ".wn-sum{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:2px 0 4px}",
    ".wn-sum div{border-radius:10px;padding:6px 8px;border:1px solid var(--card-border);background:rgba(127,127,127,.08)}",
    ".wn-sum b{display:block;font-size:17px;font-variant-numeric:tabular-nums;line-height:1.2}.wn-sum small{opacity:.75;font-size:10.5px}",
    ".wn-sum .mdico{width:12px;height:12px;vertical-align:-1px}",
    ".wn-meta{font-size:10.5px;opacity:.65;margin:0 0 6px}",
    ".wn-sec{border-top:1px solid var(--card-border);padding:9px 0 7px}",
    ".wn-h{font-weight:800;display:flex;align-items:center;gap:6px;margin-bottom:5px}.wn-h small{margin-left:auto;font-weight:500;opacity:.65}.wn-h .mdico{width:13px;height:13px}",
    ".wn-h label{display:flex;align-items:center;gap:6px;cursor:pointer}.wn-h input{accent-color:var(--accent);margin:0}",
    ".wn-list{display:flex;flex-direction:column;gap:3px;max-height:210px;overflow:auto}",
    ".wn-it{display:flex;align-items:center;gap:8px;border:0;background:rgba(127,127,127,.07);border-radius:8px;padding:5px 8px;color:inherit;font:inherit;font-size:12px;text-align:left;cursor:pointer}",
    ".wn-it:hover{background:var(--accent-soft)}.wn-it span{flex:1;min-width:0}.wn-it span small{opacity:.65;display:block;font-size:10.5px}",
    ".wn-it em{font-style:normal;font-size:10.5px;opacity:.75;white-space:nowrap}",
    ".wn-it.old{opacity:.72}",
    ".wn-dot{width:9px;height:12px;flex:none;clip-path:polygon(0 0,100% 20%,100% 60%,0 80%)}",
    ".wn-cap{border-radius:9px;padding:6px 9px;margin:0 0 5px;border:1px solid var(--card-border);background:rgba(127,127,127,.07)}",
    ".wn-cap b{font-size:12px}.wn-cap small{opacity:.7;display:block}.wn-cap .wn-prov{margin-top:3px}",
    ".wn-prov{font-size:11px;opacity:.85;line-height:1.5}",
    ".wn-badge{display:inline-flex;align-items:center;gap:3px;color:#fff;font-size:10.5px;font-weight:800;border-radius:6px;padding:1px 6px;vertical-align:1px;white-space:nowrap}.wn-badge .mdico{width:11px;height:11px}",
    ".wn-note{font-size:10.5px;opacity:.7;margin:3px 0 4px}",
    ".wn-leg{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:11px;margin-top:4px}.wn-leg span{display:inline-flex;align-items:center;gap:4px}",
    ".wn-src{margin:10px 0 0;font-size:10px;opacity:.62;line-height:1.5}",
    ".wn-warn{color:#f59f0b}",
    ".wn-popup .maplibregl-popup-content{background:var(--card-bg);color:var(--text-main);border:1px solid var(--card-border);border-radius:12px;padding:11px 13px 9px;box-shadow:0 10px 30px rgba(0,0,0,.3);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);max-height:70vh;overflow:auto}",
    ".wn-popup .maplibregl-popup-tip{display:none}.wn-popup .maplibregl-popup-close-button{color:var(--text-muted);font-size:17px;right:4px;top:3px}",
    ".wn-pop{font-size:12px;line-height:1.5;min-width:240px}.wn-pop-t{margin:0 16px 5px 0;font-size:13px;line-height:1.45}.wn-pop-t small{opacity:.6;font-weight:500}",
    ".wn-pop hr{border:0;border-top:1px solid var(--card-border);margin:8px 0}",
    ".wn-lead{margin:0 0 6px;font-size:12px}.wn-lead small{opacity:.75}",
    ".wn-row{display:flex;gap:10px;justify-content:space-between;padding:1.5px 0}.wn-row span{opacity:.7;white-space:nowrap}.wn-row b{text-align:right;font-weight:600}",
    ".wn-sub{margin:7px 0 3px;font-weight:700;font-size:11.5px}",
    ".wn-vill{display:flex;flex-wrap:wrap;gap:3px 4px;font-size:11px}.wn-vill span{background:rgba(127,127,127,.12);border-radius:6px;padding:1px 6px}",
    ".wn-safe{margin:8px 0 2px;padding:6px 8px;border-radius:8px;background:rgba(225,29,72,.13);border:1px solid rgba(225,29,72,.4);font-size:11.5px;font-weight:600}.wn-safe .mdico{width:12px;height:12px;vertical-align:-2px;color:#e11d48}",
    ".wn-desc{margin:5px 0 0;font-size:11.5px;opacity:.9}",
    ".wn-pop-f{margin-top:7px;padding-top:6px;border-top:1px solid var(--card-border);font-size:10.5px;opacity:.8}.wn-pop-f a{color:var(--accent);font-weight:700;text-decoration:none}.wn-pop-f .mdico{width:11px;height:11px;vertical-align:-1px}",
    "@media (max-width:760px){#warnPanel,#floodPanel.open~#warnPanel,#damPanel.open~#warnPanel,#floodPanel.open~#damPanel.open~#warnPanel{bottom:86px;right:14px;left:14px;width:auto;max-height:42vh}}"
  ].join("");

  function flagDot(lv) { return '<i class="wn-dot" style="background:' + LV[lv].flag + '"></i>'; }
  function chk(k, label, extra) {
    return '<label><input type="checkbox" data-s="' + k + '"' + (sub[k] ? " checked" : "") + '>' + label + '</label>' + (extra ? '<small>' + extra + '</small>' : "");
  }
  function renderPanel() {
    var p = $("#warnPanel");
    if (!p || !visible) return;
    var body = p.querySelector(".wn-body"), d = W.data, h = "";
    if (!d) {
      h += '<p class="wn-note">' + (W.err ? '<span class="wn-warn">โหลดข้อมูลไม่สำเร็จ (' + esc(W.err) + ')</span>' : "กำลังโหลดสถานะเตือนภัยจากกรมทรัพยากรน้ำและกรมอุตุนิยมวิทยา…") + '</p>';
    } else {
      var sm = d.sum || {};
      var cnt = function (lv) { return d.st.filter(function (r) { return r[4] === lv; }).length; };
      h += '<div class="wn-sum">' + [3, 2, 1].map(function (lv) {
        var v = lv === 3 ? sm.evac : lv === 2 ? sm.warn : sm.watch;
        return '<div style="border-color:' + LV[lv].c + '66"><b style="color:' + LV[lv].c + '">' + (v == null ? cnt(lv) : fmt(v)) + '</b><small>' + flagDot(lv) + ' ' + LV[lv].t + (v == null ? " สถานี" : " หมู่บ้าน") + '</small></div>';
      }).join("") + '</div>';
      h += '<p class="wn-meta">สถานีเตือนภัยล่วงหน้า ' + fmt(d.total) + ' สถานี · มีฝนตอนนี้ ' + fmt(d.rainSt) + ' สถานี' + (d.ewsErr ? ' · <span class="wn-warn">สถานะสดโหลดไม่ได้ ใช้ประวัติแทน</span>' : "") + '</p>';

      // ธงปัจจุบัน
      var st = d.st.map(function (r, i) { return { r: r, i: i }; }).sort(function (a, b) { return b.r[4] - a.r[4] || (tms(b.r[11]) || 0) - (tms(a.r[11]) || 0); });
      h += '<div class="wn-sec"><div class="wn-h">' + chk("flag", ico("flag") + " ธงที่กำลังเตือนตอนนี้", fmt(st.length) + " สถานี") + '</div>';
      h += st.length ? '<div class="wn-list">' + st.map(function (x) {
        var r = x.r, t = tms(r[11]);
        return '<button type="button" class="wn-it" data-k="st" data-i="' + x.i + '">' + flagDot(r[4]) + '<span><b>' + esc(r[1]) + '</b> · ' + LV[r[4]].t +
          '<small>ต.' + esc(r[5]) + ' อ.' + esc(r[6]) + ' จ.' + esc(r[7]) + '</small></span><em>' + (t ? ago(t) : "") + '</em></button>';
      }).join("") + '</div>' : '<p class="wn-note">ตอนนี้ไม่มีสถานีใดอยู่ในระดับเตือนภัย</p>';
      h += '</div>';

      // ย้อนหลัง
      var hr = histRows();
      h += '<div class="wn-sec"><div class="wn-h">' + chk("hist", ico("history") + " เคยเตือนใน 36 ชม. (ตอนนี้ลดระดับแล้ว)", fmt(hr.length) + " สถานี") + '</div>';
      if (hr.length) h += '<div class="wn-list">' + hr.map(function (x) {
        var r = x.h;
        return '<button type="button" class="wn-it old" data-k="h" data-i="' + x.i + '">' + flagDot(r[1]) + '<span><b>' + esc(r[2]) + '</b> · ' + LV[r[1]].t +
          '<small>ต.' + esc(r[3]) + ' อ.' + esc(r[4]) + ' จ.' + esc(r[5]) + '</small></span><em>' + ago(x.t) + '</em></button>';
      }).join("") + '</div>';
      h += '</div>';

      // ประกาศกรมอุตุฯ
      var act = capActive(), old = d.cap.filter(function (c) { return !c.active; }).slice(0, 2);
      h += '<div class="wn-sec"><div class="wn-h">' + chk("cap", ico("cloud-rain") + " ประกาศกรมอุตุฯ (พื้นที่เสี่ยง)", act.length ? act.length + " ฉบับมีผล" : "ไม่มีฉบับที่มีผล") + '</div>';
      act.concat(old).forEach(function (c) {
        var sv = SEV[c.sev] || SEV.Severe;
        h += '<div class="wn-cap"' + (c.active ? "" : ' style="opacity:.6"') + '><span class="wn-badge" style="background:' + sv.c + '">' + esc(sv.t) + '</span> <b>' + esc(c.head || c.event) + '</b>' +
          '<small>' + (c.active ? "มีผลถึง " : "หมดอายุแล้ว · ") + thTime(Date.parse(c.exp)) + '</small><div class="wn-prov">' + c.prov.map(esc).join(" · ") + '</div></div>';
      });
      h += '</div>';
    }
    // สัญญาณจากข้อมูล
    var sg = sigCache.length ? sigCache : sigRows();
    var byProv = {};
    sg.forEach(function (s) { var k = s.prov || "–"; (byProv[k] = byProv[k] || { wl: 0, dam: 0 })[s.k]++; });
    var provs = Object.keys(byProv).sort(function (a, b) { return (byProv[b].wl + byProv[b].dam) - (byProv[a].wl + byProv[a].dam); });
    h += '<div class="wn-sec"><div class="wn-h">' + chk("sig", ico("triangle-alert") + " สัญญาณจากข้อมูลตรวจวัด", S.wl || S.dam ? fmt(sg.length) + " จุด" : "กำลังโหลด…") + '</div>' +
      '<p class="wn-note">วงสีส้ม (ซูมเข้าระดับจังหวัดถึงเห็น) = แม่น้ำ/คลองล้นตลิ่ง หรืออ่าง/เขื่อนน้ำเกิน 100% — <b>คำนวณเอง ไม่ใช่ประกาศทางการ</b></p>';
    if (provs.length) h += '<div class="wn-list">' + provs.slice(0, 12).map(function (pv) {
      var b = byProv[pv], first = sg.findIndex(function (s) { return (s.prov || "–") === pv; });
      return '<button type="button" class="wn-it" data-k="sig" data-i="' + first + '"><i class="wn-dot" style="background:' + SIG + ';clip-path:circle(50%)"></i><span><b>' + esc(pv) + '</b><small>' +
        [b.wl ? "ล้นตลิ่ง " + b.wl + " สถานี" : "", b.dam ? "อ่างเกิน 100% " + b.dam + " แห่ง" : ""].filter(Boolean).join(" · ") + '</small></span></button>';
    }).join("") + '</div>';
    h += '</div>';
    h += '<div class="wn-leg">' + [3, 2, 1].map(function (lv) { return '<span>' + flagDot(lv) + LV[lv].d + ' = ' + LV[lv].t + '</span>'; }).join("") + '<span><i class="wn-dot" style="background:#9aa3b2;opacity:.5"></i>ธงจาง = ย้อนหลัง</span></div>';
    h += '<p class="wn-src">ธง: ระบบเตือนภัยล่วงหน้า น้ำท่วมฉับพลัน-น้ำป่าไหลหลาก กรมทรัพยากรน้ำ (สถานีอัตโนมัติในหมู่บ้านเสี่ยง) · พื้นที่เสี่ยง: ประกาศ CAP กรมอุตุนิยมวิทยา' +
      (W.at ? " · อัปเดต " + ago(W.at) : "") +
      '<br>ธงบนแผนที่นี้มาจากสถานีวัดฝน/ระดับน้ำอัตโนมัติ — ธงที่ผู้ใหญ่บ้าน/อปท. ชักจริงอาจต่างกัน คำสั่งอพยพให้ฟังเจ้าหน้าที่ในพื้นที่ · ปภ. 1784 · กรมอุตุฯ 1182</p>';
    body.innerHTML = h;
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    addIcons();
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnWarnToggle")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "menu-btn"; b.id = "btnWarnToggle";
      b.title = "เปิด/ปิดชั้นธงเตือนภัย — ธงแดง/เหลือง/เขียวรายหมู่บ้าน (กรมทรัพยากรน้ำ) และพื้นที่ประกาศเตือนภัยฝนตกหนัก (กรมอุตุฯ)";
      b.innerHTML = '<span>' + ico("flag") + '</span><span class="label-text"> ธงเตือนภัย</span>';
      b.addEventListener("click", function () { setVisible(!visible); });
      var after = $("#btnDamToggle") || $("#btnFloodToggle");
      if (after && after.parentNode === menu) menu.insertBefore(b, after.nextSibling); else menu.appendChild(b);
    }
    if (!$("#warnPanel")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var p = document.createElement("div");
      p.id = "warnPanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "ธงเตือนภัย");
      p.innerHTML = '<div class="wn-ph">' + ico("flag") + ' ธงเตือนภัย' +
        '<button type="button" class="wn-ib" data-a="min" title="ย่อ/ขยาย">' + ico("minus") + '</button>' +
        '<button type="button" class="wn-ib" style="margin-left:0" data-a="close" title="ปิดชั้นนี้">×</button></div><div class="wn-body"></div>';
      if (lsGet(LS_MIN) === "1") p.classList.add("min");
      stage.appendChild(p);
      p.addEventListener("click", function (e) {
        var a = e.target.closest("[data-a]");
        if (a && a.dataset.a === "close") { setVisible(false); return; }
        if (a && a.dataset.a === "min") { var m = !p.classList.contains("min"); p.classList.toggle("min", m); lsSet(LS_MIN, m ? "1" : "0"); return; }
        var it = e.target.closest(".wn-it");
        if (it && W.data) flyOpen(it.dataset.k, +it.dataset.i);
        else if (it && it.dataset.k === "sig") flyOpen("sig", +it.dataset.i);
      });
      p.addEventListener("change", function (e) {
        var k = e.target.dataset && e.target.dataset.s;
        if (!k) return;
        sub[k] = e.target.checked;
        lsSet(LS_SUB, JSON.stringify(sub));
        syncLayerVis();
      });
    }
    syncButtons();
  }
  function syncButtons() {
    var b = $("#btnWarnToggle"), p = $("#warnPanel");
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
      syncLayerVis();
      return;
    }
    addLayers();
    bindHandlers();
    renderPanel();
    if (Date.now() - W.at > 5 * 60000) loadWarn();
    if (Date.now() - S.at > 10 * 60000) loadSignals();
    refreshTimer = setInterval(function () { if (!document.hidden) { loadWarn(); if (Date.now() - S.at > 10 * 60000) loadSignals(); } }, 5 * 60000);
    if (map.getZoom() > 8.5) map.flyTo({ center: [101.2, 14.6], zoom: 5.6, pitch: 0, bearing: 0, duration: 1600 });
  }

  /* ================================================================ mount — เรียกซ้ำทุกครั้งที่เปลี่ยนสไตล์แผนที่ */
  function mount(m) {
    map = m;
    try { var s = JSON.parse(lsGet(LS_SUB) || "null"); if (s) Object.keys(sub).forEach(function (k) { if (typeof s[k] === "boolean") sub[k] = s[k]; }); } catch (e) { }
    buildUI();
    if (lsGet(LS_KEY) === "1" && !visible) { setVisible(true); return; }
    if (!visible) return;
    addLayers();   // สไตล์ใหม่ล้างชั้น (และรูปธง) ทิ้งหมด → วางกลับ
  }

  window.BKK_WARN = {
    mount: mount,
    setVisible: setVisible,
    mapRef: function () { return map; },
    debug: function () {
      var d = W.data;
      return {
        visible: visible, sub: sub, err: W.err, sum: d && d.sum, st: d ? d.st.length : 0, hist: histRows().length,
        capActive: capActive().map(function (c) { return c.sev + " " + c.prov.length + "จ."; }), sig: sigCache.length,
        layers: ["warn-cap", "warn-cap-line", "warn-sig", "warn-halo", "warn-hist", "warn-flag"].filter(function (id) { return map && map.getLayer(id); })
      };
    }
  };
})();
