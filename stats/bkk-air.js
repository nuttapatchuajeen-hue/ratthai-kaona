/**
 * bkk-air.js
 * ชั้น "ฝุ่น PM2.5" ของ bkk-city.html — ค่าฝุ่นรายสถานีทั่วประเทศ (Air4Thai กรมควบคุมมลพิษ รวมสถานีของ กทม.)
 *
 * ข้อมูล (/api/air — ต้นทางไม่มี CORS)
 *   - ค่าบนแผนที่ปกติ = PM2.5 เฉลี่ย 24 ชม. ที่ Air4Thai ใช้คำนวณ AQI + ระดับสี (color_id) จากกรมฯ เอง
 *   - แถบ "ย้อนดู 24 ชม." = ค่ารายชั่วโมง ระบายสีด้วยเกณฑ์เดียวกัน (เกณฑ์เป็นของค่าเฉลี่ย 24 ชม. → ใช้เทียบคร่าว ๆ)
 *   - เกณฑ์ AQI ไทยของ PM2.5 (มาตรฐานใหม่ปี 2566): 0–15 ดีมาก · 15.1–25 ดี · 25.1–37.5 ปานกลาง · 37.6–75 เริ่มมีผลกระทบ · >75 มีผลกระทบ
 *
 * วาดด้วยชั้น MapLibre ธรรมดา: จุด (circle) + ตัวเลข (symbol) + แท่ง 3 มิติ (fill-extrusion สูงตามค่าฝุ่น)
 */
(function () {
  "use strict";

  var REMOTE = "https://ratthai-kaona.vercel.app";
  var LS_KEY = "bkk-air-on", LS_MIN = "bkk-air-min", LS_SCOPE = "bkk-air-scope";
  var A4T = "https://air4thai.pcd.go.th/webV3/";
  // แท่ง: รัศมี ม. · สูง ม. ต่อ 1 µg/m³ · เพดาน ม. — สถานีใน กทม. บางคู่ห่างกันไม่ถึง 1.5 กม. แท่งจึงกว้างได้ราว 0.8 กม.
  // และต้องสูงพอให้เห็นตอนซูมออกดูทั้งเมือง (z11 ≈ 56 ม./px)
  var COL_R = 380, COL_K = 40, COL_MAX = 3500;
  var HOME = { center: [100.56, 13.76], zoom: 11.2, pitch: 50, bearing: 0 };   // ≥ 11 = ฉาก 3 มิติวาดแท่งให้
  var NEAR_BKK = /กรุงเทพ|นนทบุรี|ปทุมธานี|สมุทรปราการ|สมุทรสาคร|นครปฐม/;

  var LV = [
    null,
    { c: "#3BCCFF", t: "ดีมาก", r: "0–15", tip: "อากาศดีมาก เหมาะกับกิจกรรมกลางแจ้งและการท่องเที่ยว" },
    { c: "#92D050", t: "ดี", r: "15.1–25", tip: "ทำกิจกรรมกลางแจ้งได้ตามปกติ" },
    { c: "#FFE14D", t: "ปานกลาง", r: "25.1–37.5", tip: "คนทั่วไปทำกิจกรรมกลางแจ้งได้ตามปกติ · กลุ่มเสี่ยง (เด็ก ผู้สูงอายุ หญิงตั้งครรภ์ ผู้มีโรคหัวใจหรือทางเดินหายใจ) ถ้าไอ หายใจลำบาก หรือระคายเคืองตา ควรลดเวลาอยู่กลางแจ้ง" },
    { c: "#FFA200", t: "เริ่มมีผลกระทบต่อสุขภาพ", r: "37.6–75", tip: "คนทั่วไปควรสังเกตอาการ ลดกิจกรรมกลางแจ้ง หรือใส่หน้ากากเมื่อจำเป็น · กลุ่มเสี่ยงควรลดกิจกรรมกลางแจ้ง ถ้าแน่นหน้าอก ปวดศีรษะ หรือหัวใจเต้นผิดปกติ ควรพบแพทย์" },
    { c: "#F04646", t: "มีผลกระทบต่อสุขภาพ", r: "มากกว่า 75", tip: "ทุกคนควรหลีกเลี่ยงกิจกรรมกลางแจ้งและพื้นที่ที่มีฝุ่นสูง ใส่หน้ากากเมื่อจำเป็น ถ้ามีอาการผิดปกติควรพบแพทย์" }
  ];
  var TYPE = { G: "สถานีกรมควบคุมมลพิษ", B: "สถานีของ กทม.", M: "สถานีเคลื่อนที่" };

  var map = null, visible = false, uiBuilt = false, handlersBound = false;
  var D = null, err = null, busy = false, at = 0, timer = null, popup = null;
  var hour = 24;            // 24 = เฉลี่ย 24 ชม. (ทางการ) · 0–23 = รายชั่วโมง เก่า→ใหม่
  var scope = "all", playTimer = null;

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function levelOf(v) { return v == null ? 0 : v <= 15 ? 1 : v <= 25 ? 2 : v <= 37.5 ? 3 : v <= 75 ? 4 : 5; }
  function hhmm(s) { return String(s || "").slice(11, 16); }
  function thDay(s) {
    var d = new Date(String(s).slice(0, 10) + "T00:00:00+07:00");
    return isNaN(d) ? "" : d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  }
  function km(a, b, c, d) {
    var x = (c - a) * Math.PI / 180 * Math.cos((b + d) / 2 * Math.PI / 180), y = (d - b) * Math.PI / 180;
    return 6371 * Math.sqrt(x * x + y * y);
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
    add("navigation", '<polygon points="3 11 22 2 13 21 11 13 3 11"/>');
    add("crosshair", '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>');
    add("external-link", '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>');
  }

  /* ================================================================ ดึงข้อมูล */
  function apiList() {
    var h = location.hostname, local = h === "localhost" || h === "127.0.0.1" || h === "ratthai-kaona.vercel.app";
    return local ? ["/api/air", REMOTE + "/api/air"] : [REMOTE + "/api/air"];
  }
  function getJSON(urls) {
    var i = 0;
    var next = function (e) {
      if (i >= urls.length) return Promise.reject(e || new Error("no source"));
      return fetch(urls[i++], { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }).then(function (j) { if (j && j.error) throw new Error(j.error); return j; }).catch(next);
    };
    return next();
  }
  function load() {
    if (busy) return;
    busy = true;
    renderPanel();
    getJSON(apiList()).then(function (j) {
      D = j; err = null; at = Date.now();
      D.avgT = "";   // เวลาของค่าเฉลี่ย 24 ชม. ล่าสุด (บางสถานียังไม่รายงานชั่วโมงล่าสุดของแกนรายชั่วโมง)
      D.st.forEach(function (s) { s.near = NEAR_BKK.test(s[4]); if (s[6] > D.avgT) D.avgT = s[6]; });
    }).catch(function (e) {
      err = "โหลดข้อมูลฝุ่นไม่สำเร็จ (" + (e && e.message || e) + ")";
      console.warn("air:", e);
    }).then(function () {
      busy = false;
      if (visible) { addLayers(); renderPanel(); if (popup && popup._airId) refreshPopup(); }
    });
  }

  /* ================================================================ ค่าที่แสดงตามโหมดเวลา */
  function valueOf(s) {
    if (hour >= 24) return s[7];
    return s[16] ? s[16][hour] : null;
  }
  function levelOfSt(s) {
    if (hour >= 24) return s[8] || levelOf(s[7]);
    return levelOf(valueOf(s));
  }
  function inScope(s) { return scope === "all" || s.near; }

  function shown() {
    var out = [];
    if (D) D.st.forEach(function (s, i) {
      if (!inScope(s)) return;
      var v = valueOf(s), l = levelOfSt(s);
      if (v != null && l) out.push([i, v, l]);
    });
    return out;
  }
  function geo() {
    return {
      type: "FeatureCollection", features: shown().map(function (r) {
        var s = D.st[r[0]], v = r[1];
        return {
          type: "Feature", geometry: { type: "Point", coordinates: [s[2], s[1]] },
          properties: { i: r[0], v: v, l: r[2], c: LV[r[2]].c, lab: v >= 100 ? String(Math.round(v)) : String(v) }
        };
      })
    };
  }

  /* ================================================================ แท่ง 3 มิติ (ฉาก three.js กลาง bkk-3d-host.js)
     ไม่ใช้ fill-extrusion ของ MapLibre: ไฟของธีมมืดเป็นสีฟ้า คูณกับสีแท่งแล้วเหลือง/ส้ม/แดงกลายเป็นเขียวหมด
     ฉากกลางวาดตั้งแต่ซูม 11 (BKK_3D.minZoom) — ต่ำกว่านั้นเหลือแค่จุดกับตัวเลข */
  var MOD_ID = "air", H3 = null, T3 = null, group = null, mesh = null, rc = null, inst = [];
  function ensure3D() {
    H3 = window.BKK_3D;
    if (!H3) return Promise.resolve(false);
    return H3.ensure().then(function () {
      if (group) return true;
      T3 = H3.THREE();
      group = new T3.Group();
      group.visible = false;
      H3.scene().add(group);
      H3.register({
        id: MOD_ID, group: group,
        pick: function (ray) {
          if (!mesh) return null;
          if (!rc) rc = new T3.Raycaster();
          rc.ray.copy(ray);
          var hits = rc.intersectObject(mesh, false);
          return hits.length ? { dist: hits[0].distance, hit: inst[hits[0].instanceId] } : null;
        },
        click: function (i) { openPopup(i, false); },
        hover: function () { }
      });
      H3.ready();
      return true;
    }).catch(function (e) { console.warn("air 3D:", e); return false; });
  }
  function build3D() {
    if (!group) return;
    if (mesh) { group.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); mesh = null; }
    var list = visible ? shown() : [];
    inst = [];
    if (list.length) {
      var geo3 = new T3.CylinderGeometry(1, 1, 1, 16, 1);
      geo3.rotateX(Math.PI / 2);          // แกนทรงกระบอกของ three = Y → ตั้งขึ้นฟ้า (Z)
      geo3.translate(0, 0, 0.5);          // โคนอยู่ที่พื้น
      mesh = new T3.InstancedMesh(geo3, new T3.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }), list.length);
      var m4 = new T3.Matrix4(), col = new T3.Color();
      list.forEach(function (r, k) {
        var s = D.st[r[0]], p = H3.toLocal(s[2], s[1]), kk = H3.kAt(s[1]);
        var h = Math.min(COL_MAX, Math.max(30, r[1] * COL_K)) * kk, rad = COL_R * kk;
        m4.makeScale(rad, rad, h);
        m4.setPosition(p.x, p.y, 0);
        mesh.setMatrixAt(k, m4);
        mesh.setColorAt(k, col.set(LV[r[2]].c));
        inst.push(r[0]);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      group.add(mesh);
    }
    H3.show(MOD_ID, visible && !!mesh);
  }

  /* ================================================================ ชั้นแผนที่ */
  var LAYERS = ["air-dot", "air-lab"];
  function addLayers() {
    if (!map || !map.getStyle() || !D) return;
    if (map.getSource("air-st")) map.getSource("air-st").setData(geo());
    else map.addSource("air-st", { type: "geojson", data: geo() });
    ensure3D().then(function (ok) { if (ok) build3D(); });
    if (!map.getLayer("air-dot")) map.addLayer({
      id: "air-dot", type: "circle", source: "air-st",
      layout: { "circle-sort-key": ["get", "v"] },
      paint: {
        "circle-color": ["get", "c"],
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 4.5, 9, 8, 13, 11],
        "circle-stroke-color": "rgba(10,14,24,.85)",
        "circle-stroke-width": 1.4,
        "circle-opacity": 0.95
      }
    });
    if (!map.getLayer("air-lab")) map.addLayer({
      id: "air-lab", type: "symbol", source: "air-st", minzoom: 7.5,
      layout: {
        "text-field": ["get", "lab"], "text-font": ["Noto Sans Bold"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 7.5, 9.5, 12, 11.5],
        "text-allow-overlap": false, "text-padding": 1,
        "symbol-sort-key": ["-", 1000, ["get", "v"]]   // ค่าสูงได้วางป้ายก่อน
      },
      paint: { "text-color": "#0b1220", "text-halo-color": ["get", "c"], "text-halo-width": 1.2 }
    });
    syncVis();
    bindHandlers();
  }
  function syncVis() {
    if (!map) return;
    LAYERS.forEach(function (id) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none"); });
    if (group) H3.show(MOD_ID, visible && !!mesh);
  }
  function redraw() {
    if (!map || !map.getSource("air-st")) return;
    map.getSource("air-st").setData(geo());
    build3D();
  }

  /* ================================================================ การ์ดสถานี */
  function spark(s) {
    var h = s[16];
    if (!h || !h.some(function (v) { return v != null; })) return '<p class="aq-note">สถานีนี้ไม่มีค่ารายชั่วโมงย้อนหลัง</p>';
    var W = 276, H = 70, top = 8, base = H - 14, mx = 37.5;
    h.forEach(function (v) { if (v != null && v > mx) mx = v; });
    mx = Math.ceil(mx / 10) * 10;
    var bw = W / 24, y = function (v) { return base - (base - top) * v / mx; };
    var bars = h.map(function (v, k) {
      if (v == null) return "";
      return '<rect x="' + (k * bw + 1).toFixed(1) + '" y="' + y(v).toFixed(1) + '" width="' + (bw - 2).toFixed(1) + '" height="' + (base - y(v)).toFixed(1) +
        '" rx="1.5" fill="' + LV[levelOf(v)].c + '"' + (hour === k ? ' stroke="currentColor" stroke-width="1.4"' : '') + '><title>' + hhmm(D.hours[k]) + ' น. · ' + v + ' µg/m³</title></rect>';
    }).join("");
    var std = y(37.5);
    return '<svg class="aq-spark" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="PM2.5 รายชั่วโมง 24 ชม. ล่าสุด">' + bars +
      '<line x1="0" x2="' + W + '" y1="' + std.toFixed(1) + '" y2="' + std.toFixed(1) + '" stroke="currentColor" stroke-dasharray="3 3" opacity=".5"/>' +
      '<text x="' + (W - 2) + '" y="' + (std - 3).toFixed(1) + '" text-anchor="end">มาตรฐาน 37.5</text>' +
      '<text x="0" y="' + (H - 2) + '">' + hhmm(D.hours[0]) + '</text>' +
      '<text x="' + (W / 2) + '" y="' + (H - 2) + '" text-anchor="middle">' + hhmm(D.hours[12]) + '</text>' +
      '<text x="' + W + '" y="' + (H - 2) + '" text-anchor="end">' + hhmm(D.hours[23]) + ' น.</text></svg>';
  }
  function popupHTML(s) {
    var l = s[8] || levelOf(s[7]), L = LV[l] || { c: "#94a3b8", t: "ไม่มีข้อมูล", tip: "" };
    var lastH = null, lastT = "";
    if (s[16]) for (var k = 23; k >= 0; k--) if (s[16][k] != null) { lastH = s[16][k]; lastT = hhmm(D.hours[k]); break; }
    var other = [["PM10", s[11], "µg/m³"], ["O₃", s[12], "ppb"], ["CO", s[13], "ppm"], ["NO₂", s[14], "ppb"], ["SO₂", s[15], "ppb"]]
      .filter(function (x) { return x[1] != null; });
    return '<div class="aq-pop"><div class="aq-h"><b>' + esc(s[3]) + '</b><small>' + esc(s[4]) + '</small>' +
      '<span class="aq-type">' + esc(TYPE[s[5]] || "") + ' · รหัส ' + esc(s[0]) + '</span></div>' +
      (s[7] != null ? '<div class="aq-big"><span class="aq-v" style="background:' + L.c + '">' + s[7] + '<small>µg/m³</small></span>' +
        '<span><b>' + esc(L.t) + '</b><small>PM2.5 เฉลี่ย 24 ชม. · ' + esc(thDay(s[6])) + ' ' + esc(hhmm(s[6])) + ' น.' +
        (s[9] != null ? ' · AQI ' + s[9] + (s[10] && s[10] !== "PM25" ? " (จาก " + esc(s[10]) + ")" : "") : "") + '</small></span></div>'
        : '<p class="aq-note">สถานีนี้ยังไม่รายงาน PM2.5 เฉลี่ย 24 ชม.</p>') +
      (lastH != null ? '<p class="aq-note">ชั่วโมงล่าสุด (' + esc(lastT) + ' น.): <b>' + lastH + '</b> µg/m³ — ' + esc(LV[levelOf(lastH)].t) + '</p>' : "") +
      spark(s) +
      (L.tip ? '<p class="aq-tip">' + esc(L.tip) + '</p>' : "") +
      (other.length ? '<div class="aq-oth">' + other.map(function (x) { return '<span>' + x[0] + ' <b>' + x[1] + '</b> ' + x[2] + '</span>'; }).join("") + '</div>' : "") +
      '<p class="aq-src">ข้อมูล: <a href="' + A4T + '" target="_blank" rel="noopener">Air4Thai</a> กรมควบคุมมลพิษ · คำแนะนำสรุปจากเกณฑ์ AQI ของกรมฯ</p></div>';
  }
  function openPopup(i, fly) {
    var s = D && D.st[i];
    if (!s) return;
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ closeButton: true, maxWidth: "320px", className: "aq-popup", offset: 12 })
      .setLngLat([s[2], s[1]]).setHTML(popupHTML(s)).addTo(map);
    popup._airId = s[0];
    popup.on("close", function () { if (popup && popup._airId === s[0]) popup = null; });
    // จอแคบ: แผงกินครึ่งล่างของจอ → ย่อแผงให้การ์ดสถานีไม่โดนบัง (ไม่จำค่าลง localStorage)
    var pn = $("#airPanel");
    if (pn && window.innerWidth <= 760) pn.classList.add("min");
    if (fly) map.flyTo({ center: [s[2], s[1]], zoom: Math.max(map.getZoom(), 12), duration: 1200 });
  }
  function refreshPopup() {
    var id = popup._airId, i = -1;
    D.st.some(function (s, k) { if (s[0] === id) { i = k; return true; } return false; });
    if (i >= 0) popup.setHTML(popupHTML(D.st[i]));
  }

  function bindHandlers() {
    if (handlersBound) return;
    handlersBound = true;
    var pick = function (p) {
      var ids = ["air-dot"].filter(function (id) { return map.getLayer(id); });
      if (!ids.length) return null;
      var fs = map.queryRenderedFeatures([[p.x - 6, p.y - 6], [p.x + 6, p.y + 6]], { layers: ids });
      return fs.length ? fs[0] : null;
    };
    map.on("click", function (e) {
      if (!visible) return;
      var f = pick(e.point);
      if (f) openPopup(f.properties.i);
    });
    var hov = false;
    map.on("mousemove", function (e) {
      if (!visible) return;
      var h = !!pick(e.point);
      if (h !== hov) { hov = h; map.getCanvas().style.cursor = h ? "pointer" : ""; }
    });
  }

  /* ================================================================ แผง */
  var CSS = [
    "#airPanel{position:absolute;z-index:43;right:14px;bottom:40px;width:330px;max-width:calc(100% - 28px);max-height:calc(100% - 120px);overflow:auto;display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.5}",
    "#airPanel.open{display:block;animation:elvIn .22s ease}",
    "#floodPanel.open~#airPanel.open{right:358px}",
    ".aq-ph{display:flex;align-items:center;gap:8px;padding:11px 12px 6px 14px;font-weight:800;font-size:13.5px;position:sticky;top:0;background:inherit;z-index:1}",
    ".aq-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".aq-ib .mdico{width:13px;height:13px}.aq-ph .aq-ib:first-of-type{margin-left:auto}",
    "#airPanel.min .aq-body{display:none}",
    ".aq-body{padding:0 14px 12px}",
    ".aq-stat{font-size:11.5px;color:var(--text-muted);margin:0 0 8px}.aq-stat.err{color:#f87171}",
    ".aq-chips{display:flex;gap:5px;margin:0 0 8px}",
    ".aq-chip{padding:4px 10px;border-radius:999px;border:1px solid var(--card-border);background:none;color:var(--text-muted);font:inherit;font-size:11.5px;cursor:pointer}",
    ".aq-chip.on{background:var(--accent-soft);color:var(--text-main);border-color:var(--accent);font-weight:700}",
    ".aq-lv{display:grid;grid-template-columns:14px 1fr auto auto;gap:3px 8px;align-items:center;font-size:11.5px;margin-bottom:8px}",
    ".aq-lv i{width:14px;height:14px;border-radius:4px;display:block}.aq-lv em{font-style:normal;color:var(--text-muted);font-size:10.5px}",
    ".aq-lv b{font-variant-numeric:tabular-nums;text-align:right;min-width:22px}",
    ".aq-sec{border-top:1px solid var(--card-border);padding:8px 0 6px}.aq-sec>b{display:flex;align-items:center;gap:6px;font-size:12.5px;margin-bottom:4px}",
    ".aq-sec>b small{margin-left:auto;font-weight:500;opacity:.65;font-size:10.5px}",
    ".aq-time{display:flex;align-items:center;gap:8px}.aq-time input{flex:1;accent-color:var(--accent)}",
    ".aq-play{border:1px solid var(--card-border);background:rgba(127,127,127,.08);color:var(--text-main);width:30px;height:28px;border-radius:8px;cursor:pointer;display:grid;place-items:center;flex:none}",
    ".aq-play:hover{border-color:var(--accent)}.aq-play .mdico{width:14px;height:14px}",
    ".aq-tl{font-size:11.5px;font-weight:700;margin-top:3px}.aq-tl small{font-weight:500;color:var(--text-muted)}",
    ".aq-row{display:flex;align-items:center;gap:8px;width:100%;padding:4px 6px;border:0;border-radius:8px;background:none;color:var(--text-main);font:inherit;font-size:11.5px;cursor:pointer;text-align:left}",
    ".aq-row:hover{background:var(--accent-soft)}.aq-row span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.aq-row span small{opacity:.6}",
    ".aq-row b{font-variant-numeric:tabular-nums;padding:1px 7px;border-radius:999px;color:#0b1220;font-size:11px}",
    ".aq-near{display:flex;gap:6px;margin:2px 0 4px}.aq-near button{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;border-radius:9px;border:1px solid var(--card-border);background:rgba(127,127,127,.07);color:var(--text-main);font:inherit;font-size:11.5px;font-weight:600;cursor:pointer}",
    ".aq-near button:hover{border-color:var(--accent);background:var(--accent-soft)}.aq-near .mdico{width:13px;height:13px}",
    ".aq-src{margin:8px 0 0;font-size:10px;opacity:.65;line-height:1.5}.aq-src a{color:inherit}",
    ".aq-note{margin:4px 0;font-size:11.5px;opacity:.8;line-height:1.45}",
    ".aq-popup .maplibregl-popup-content{background:var(--card-bg);color:var(--text-main);border:1px solid var(--card-border);border-radius:12px;padding:11px 13px 9px;box-shadow:0 10px 30px rgba(0,0,0,.3);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}",
    ".aq-popup .maplibregl-popup-tip{display:none}.aq-popup .maplibregl-popup-close-button{color:var(--text-muted);font-size:17px;right:4px;top:3px}",
    ".aq-pop{font-size:12px;line-height:1.5;min-width:250px}.aq-h{margin:0 16px 6px 0}.aq-h b{display:block;font-size:13px}.aq-h small{display:block;opacity:.7}",
    ".aq-type{display:inline-block;margin-top:3px;font-size:10.5px;padding:1px 7px;border-radius:999px;background:rgba(127,127,127,.14);color:var(--text-muted)}",
    ".aq-big{display:flex;align-items:center;gap:10px;margin:6px 0}.aq-big b{display:block;font-size:13px}.aq-big small{display:block;font-size:10.5px;opacity:.7}",
    ".aq-v{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:64px;padding:5px 8px;border-radius:10px;color:#0b1220;font-size:20px;font-weight:800;line-height:1.05;font-variant-numeric:tabular-nums}",
    ".aq-v small{font-size:9.5px;font-weight:700;opacity:.75}",
    ".aq-spark{width:100%;height:auto;display:block;margin:4px 0 2px;color:var(--text-main)}.aq-spark text{font-size:8.5px;fill:var(--text-muted)}",
    ".aq-tip{margin:6px 0 0;padding:6px 9px;border-radius:9px;background:rgba(127,127,127,.1);font-size:11.5px;line-height:1.5}",
    ".aq-oth{display:flex;flex-wrap:wrap;gap:3px 12px;margin-top:6px;font-size:11px;color:var(--text-muted)}.aq-oth b{color:var(--text-main)}",
    ".aq-pop .aq-src{margin-top:6px}",
    "@media (max-width:1100px){#floodPanel.open~#airPanel.open{right:14px;bottom:auto;top:130px;max-height:calc(100% - 180px)}}",
    "@media (max-width:760px){#airPanel,#floodPanel.open~#airPanel.open{top:auto;bottom:86px;right:14px;left:14px;width:auto;max-height:42vh}}"
  ].join("");

  function timeLabel() {
    if (!D) return "";
    if (hour >= 24) return 'เฉลี่ย 24 ชม. (ค่าทางการ) <small>· ถึง ' + esc(thDay(D.avgT)) + ' ' + esc(hhmm(D.avgT)) + ' น.</small>';
    return 'รายชั่วโมง ' + esc(thDay(D.hours[hour])) + ' ' + esc(hhmm(D.hours[hour])) + ' น. <small>· สีเทียบเกณฑ์ 24 ชม. แบบคร่าว ๆ</small>';
  }
  function renderPanel() {
    var body = $("#airPanel .aq-body");
    if (!body) return;
    var h = "";
    if (busy && !D) h += '<p class="aq-stat">กำลังโหลดค่าฝุ่นจาก Air4Thai…</p>';
    if (err) h += '<p class="aq-stat err">' + esc(err) + '</p>';
    if (D) {
      var list = D.st.filter(inScope), cnt = [0, 0, 0, 0, 0, 0], nv = 0;
      list.forEach(function (s) { var l = valueOf(s) == null ? 0 : levelOfSt(s); cnt[l]++; if (l) nv++; });
      h += '<p class="aq-stat">' + nv + ' สถานีมีค่า' + (busy ? " · กำลังอัปเดต…" : "") + '</p>';
      h += '<div class="aq-chips"><button type="button" class="aq-chip' + (scope === "all" ? " on" : "") + '" data-scope="all">ทั้งประเทศ</button>' +
        '<button type="button" class="aq-chip' + (scope === "bkk" ? " on" : "") + '" data-scope="bkk">กทม. & ปริมณฑล</button></div>';
      h += '<div class="aq-lv">' + [1, 2, 3, 4, 5].map(function (l) {
        return '<i style="background:' + LV[l].c + '"></i><span>' + esc(LV[l].t) + '</span><em>' + esc(LV[l].r) + '</em><b>' + cnt[l] + '</b>';
      }).join("") + '</div>';
      h += '<div class="aq-sec"><b>' + ico("clock") + ' ย้อนดู 24 ชม.<small>เลื่อนหรือกด ▶</small></b>' +
        '<div class="aq-time"><button type="button" class="aq-play" data-a="play" title="' + (playTimer ? "หยุด" : "เล่นย้อนหลัง 24 ชม.") + '">' + ico(playTimer ? "pause" : "play") + '</button>' +
        '<input type="range" min="0" max="24" step="1" value="' + hour + '" id="aqHour" aria-label="เลือกชั่วโมง"></div>' +
        '<div class="aq-tl" id="aqTl">' + timeLabel() + '</div></div>';
      var top = list.filter(function (s) { return valueOf(s) != null; })
        .sort(function (a, b) { return valueOf(b) - valueOf(a); }).slice(0, 8);
      h += '<div class="aq-sec"><b>' + ico("trending-up") + ' ฝุ่นสูงสุด<small>µg/m³</small></b>' + top.map(function (s) {
        var v = valueOf(s);
        return '<button type="button" class="aq-row" data-i="' + D.st.indexOf(s) + '"><span>' + esc(s[3]) + ' <small>' + esc(s[4].split(",").pop().trim()) + '</small></span>' +
          '<b style="background:' + LV[levelOfSt(s)].c + '">' + v + '</b></button>';
      }).join("") + '</div>';
      h += '<div class="aq-sec"><b>' + ico("navigation") + ' สถานีใกล้ฉัน</b><div class="aq-near">' +
        '<button type="button" data-a="near-me">' + ico("crosshair") + ' ตำแหน่งของฉัน</button>' +
        '<button type="button" data-a="near-center">' + ico("map-pin") + ' กลางแผนที่</button></div><div id="aqNear"></div></div>';
    }
    h += '<p class="aq-src">ข้อมูล: <a href="' + A4T + '" target="_blank" rel="noopener">Air4Thai</a> กรมควบคุมมลพิษ (รวมสถานีของ กทม.) อัปเดตทุกชั่วโมง' +
      '<br>สีตามเกณฑ์ AQI ของไทยสำหรับ PM2.5 เฉลี่ย 24 ชม. (มาตรฐานปี 2566) · ความสูงแท่ง = ค่าฝุ่น</p>';
    body.innerHTML = h;
  }
  function nearest(lon, lat, mine) {
    var out = $("#aqNear");
    if (!out || !D) return;
    var best = null;
    D.st.forEach(function (s, i) {
      if (valueOf(s) == null) return;
      var d = km(lon, lat, s[2], s[1]);
      if (!best || d < best.d) best = { i: i, d: d };
    });
    if (!best) { out.innerHTML = '<p class="aq-note">ไม่พบสถานีที่มีค่า</p>'; return; }
    var s = D.st[best.i];
    out.innerHTML = '<button type="button" class="aq-row" data-i="' + best.i + '"><span>' + esc(s[3]) + ' <small>ห่าง' + (mine ? "จากคุณ" : "จากกลางแผนที่") + ' ' + best.d.toFixed(1) + ' กม.</small></span>' +
      '<b style="background:' + LV[levelOfSt(s)].c + '">' + valueOf(s) + '</b></button>';
    openPopup(best.i, true);
  }

  function setHour(h) {
    hour = Math.max(0, Math.min(24, h | 0));
    redraw();
    var r = $("#aqHour"), t = $("#aqTl");
    if (r && +r.value !== hour) r.value = hour;
    if (t) t.innerHTML = timeLabel();
    if (popup && popup._airId) refreshPopup();
  }
  function stopPlay() {
    if (!playTimer) return;
    clearInterval(playTimer); playTimer = null;
    renderPanel();
  }
  function togglePlay() {
    if (playTimer) { stopPlay(); return; }
    if (hour >= 23) setHour(0);
    playTimer = setInterval(function () {
      if (hour >= 23) { setHour(24); stopPlay(); return; }
      setHour(hour + 1);
    }, 700);
    renderPanel();
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    addIcons();
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnAirToggle")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "menu-btn"; b.id = "btnAirToggle";
      b.title = "เปิด/ปิดชั้นฝุ่น PM2.5 — ค่าฝุ่นรายสถานีทั่วประเทศจาก Air4Thai (กรมควบคุมมลพิษ + กทม.) อัปเดตทุกชั่วโมง";
      b.innerHTML = '<span>' + ico("cloud-fog") + '</span><span class="label-text"> ฝุ่น PM2.5</span>';
      b.addEventListener("click", function () { setVisible(!visible); });
      menu.appendChild(b);
    }
    if (!$("#airPanel")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var p = document.createElement("div");
      p.id = "airPanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "ฝุ่น PM2.5");
      p.innerHTML = '<div class="aq-ph">' + ico("cloud-fog") + ' ฝุ่น PM2.5' +
        '<button type="button" class="aq-ib" data-a="min" title="ย่อ/ขยาย">' + ico("minus") + '</button>' +
        '<button type="button" class="aq-ib" data-a="close" title="ปิดชั้นนี้">×</button></div><div class="aq-body"></div>';
      if (lsGet(LS_MIN) === "1") p.classList.add("min");
      // วางถัดจากแผงฝน & น้ำท่วม (CSS ใช้ ~ เลื่อนหลบกัน)
      var fl = $("#floodPanel");
      if (fl && fl.parentNode === stage) stage.insertBefore(p, fl.nextSibling); else stage.appendChild(p);
      p.addEventListener("click", function (e) {
        var a = e.target.closest("[data-a]");
        if (a) {
          var act = a.dataset.a;
          if (act === "close") return setVisible(false);
          if (act === "min") { var m = !p.classList.contains("min"); p.classList.toggle("min", m); lsSet(LS_MIN, m ? "1" : "0"); return; }
          if (act === "play") return togglePlay();
          if (act === "near-center") { var c = map.getCenter(); nearest(c.lng, c.lat, false); return; }
          if (act === "near-me") {
            var out = $("#aqNear");
            if (!navigator.geolocation) { if (out) out.innerHTML = '<p class="aq-note">เบราว์เซอร์นี้หาตำแหน่งไม่ได้</p>'; return; }
            navigator.geolocation.getCurrentPosition(function (pos) { nearest(pos.coords.longitude, pos.coords.latitude, true); },
              function () { var o = $("#aqNear"); if (o) o.innerHTML = '<p class="aq-note">ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง — ลองกด "กลางแผนที่" แทน</p>'; },
              { timeout: 10000, maximumAge: 60000 });
            return;
          }
        }
        var sc = e.target.closest("[data-scope]");
        if (sc) { scope = sc.dataset.scope; lsSet(LS_SCOPE, scope); redraw(); renderPanel(); return; }
        var n = e.target.closest("[data-i]");
        if (n) openPopup(+n.dataset.i, true);
      });
      p.addEventListener("input", function (e) {
        if (e.target.id === "aqHour") { stopPlay(); setHour(+e.target.value); }
      });
    }
    syncButtons();
  }
  function syncButtons() {
    var b = $("#btnAirToggle"), p = $("#airPanel");
    if (b) b.classList.toggle("active", visible);
    if (p) p.classList.toggle("open", visible);
  }

  function setVisible(v) {
    visible = !!v;
    lsSet(LS_KEY, visible ? "1" : "0");
    syncButtons();
    clearInterval(timer);
    if (!visible) {
      stopPlay();
      if (popup) { popup.remove(); popup = null; }
      syncVis();
      return;
    }
    renderPanel();
    if (D) addLayers();
    if (!D || Date.now() - at > 10 * 60000) load();
    timer = setInterval(function () { if (!document.hidden) load(); }, 15 * 60000);
    var c = map.getCenter();
    if (c.lng < 97 || c.lng > 106 || c.lat < 5 || c.lat > 21) map.flyTo(Object.assign({ duration: 1600 }, HOME));
    else if (map.getPitch() < 10) map.easeTo({ pitch: HOME.pitch, duration: 700 });
  }

  /* ================================================================ mount — เรียกซ้ำทุกครั้งที่เปลี่ยนสไตล์แผนที่ */
  function mount(m) {
    map = m;
    var sc = lsGet(LS_SCOPE);
    if (sc === "all" || sc === "bkk") scope = sc;
    buildUI();
    if (lsGet(LS_KEY) === "1" && !visible) { setVisible(true); return; }
    if (visible && D) addLayers();
  }

  window.BKK_AIR = {
    mount: mount,
    setVisible: setVisible,
    /* หน้า bkk-city กดแผนที่กลับเป็นแบนเมื่อซูมต่ำกว่า 13 — ระหว่างเปิดชั้นนี้ให้คงมุมเอียงไว้ (เห็นแท่งค่าฝุ่น) */
    holdTilt: function () { return visible; },
    debug: function () {
      return { visible: visible, stations: D ? D.st.length : 0, t: D && D.t, err: err, hour: hour, scope: scope };
    }
  };
})();
