/**
 * bkk-emergency.js
 * ชั้น "สถานที่ฉุกเฉิน" ของ bkk-city.html — โรงพยาบาล รพ.สต. สถานีดับเพลิง สถานีตำรวจ รถพยาบาล/กู้ภัย จุดรวมพล/ศูนย์พักพิง ทั่วประเทศ
 *
 * ข้อมูล: bkk-emergency-data.js (window.BKK_EMERGENCY) จาก _geo/build-bkk-emergency.js ← OpenStreetMap (ODbL)
 *   + สถานีดับเพลิง กทม. 48 แห่งจาก data.bangkok.go.th (สปภ. กทม., 2566) แทนจุดของ OSM ใน กทม.
 *   ⚠ OSM ยังไม่ครบ โดยเฉพาะสถานีดับเพลิงต่างจังหวัด (หลายแห่งเป็นของท้องถิ่น) และศูนย์พักพิงชั่วคราวที่เปิดตามสถานการณ์
 * โลโก้: img/emer-logos/<key>.webp (D.logos) — ตรา สตช./สธ./กทม./สปภ./เหล่าทัพ/มหาวิทยาลัย + เครือ รพ.เอกชน
 *   จับคู่จากชื่อตอน build (_geo/emergency-logos.js) จึงอาจผิดได้ · หมุดที่มีโลโก้ = วงแหวนสีหมวด + โลโก้ + ป้ายสัญลักษณ์หมวดมุมขวาล่าง
 * ฟีเจอร์: กรองหมวด · "ที่ใกล้ที่สุด" จากตำแหน่งของฉัน/กลางแผนที่/จุดที่คลิก (ระยะเส้นตรง) พร้อมเส้นโยง + ปุ่มนำทาง
 *          · เบอร์ฉุกเฉินกดโทรได้ · ใช้คู่กับชั้นฝน/น้ำท่วม/จำลองน้ำท่วม/ดินถล่ม
 */
(function () {
  "use strict";

  var DATA_URL = "bkk-emergency-data.js", LOGO_DIR = "img/emer-logos/";
  var LS_KEY = "bkk-emer-on", LS_MIN = "bkk-emer-min", LS_OFF = "bkk-emer-off";
  var LABEL_Z = 14;
  var HOME = { center: [100.54, 13.75], zoom: 12.4 };
  var PHONES = [
    ["1669", "เจ็บป่วยฉุกเฉิน (สพฉ.)"], ["191", "เหตุด่วนเหตุร้าย (ตำรวจ)"], ["199", "ดับเพลิง"],
    ["1784", "สาธารณภัย (ปภ.)"], ["1555", "ศูนย์รับแจ้ง กทม."]
  ];
  // ไอคอน Lucide (ISC) วาดลง canvas เป็นรูปของชั้น symbol — h hospital-ish cross · c stethoscope · f flame · p shield · a ambulance · s users
  var GLYPH = {
    h: ["M12 6v12", "M6 12h12"],
    c: ["M11 2v2", "M5 2v2", "M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1", "M8 15a6 6 0 0 0 12 0v-3", "M20 10a2 2 0 1 0 0 4 2 2 0 1 0 0-4"],
    f: ["M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"],
    p: ["M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"],
    a: ["M10 10H6", "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2", "M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14", "M8 8v4", "M9 18h6", "M17 16a2 2 0 1 0 0 4 2 2 0 1 0 0-4", "M7 16a2 2 0 1 0 0 4 2 2 0 1 0 0-4"],
    s: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 3a4 4 0 1 0 0 8 4 4 0 1 0 0-8", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]
  };

  var map = null, D = null, visible = false, uiBuilt = false, bound = false, loading = null;
  var off = {}, popup = null, origin = null, picking = false, logoImg = {};

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function km(a, b, c, d) {
    var x = (c - a) * Math.PI / 180 * Math.cos((b + d) / 2 * Math.PI / 180), y = (d - b) * Math.PI / 180;
    return 6371 * Math.sqrt(x * x + y * y);
  }
  function fmtKm(d) { return d < 1 ? Math.round(d * 1000) + " ม." : d.toFixed(d < 10 ? 1 : 0) + " กม."; }

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
    add("siren", '<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="m4.929 4.929.707.707"/><path d="M12 12v6"/>');
    add("phone", '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>');
    add("navigation", '<polygon points="3 11 22 2 13 21 11 13 3 11"/>');
    add("crosshair", '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>');
    add("mouse-pointer-click", '<path d="M14 4.1 12 6"/><path d="m5.1 8-2.9-.8"/><path d="m6 12-1.9 2"/><path d="M7.2 2.2 8 5.1"/><path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"/>');
  }

  /* ================================================================ ข้อมูล */
  function loadScript(src) {
    return new Promise(function (ok, bad) {
      var s = document.createElement("script");
      s.src = src; s.async = true; s.onload = ok; s.onerror = function () { bad(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }
  // โหลดโลโก้เป็น Image (same-origin) ไว้วาดลง canvas ของไอคอน — โหลดไม่ขึ้นก็ใช้ไอคอนสัญลักษณ์เดิม
  function loadLogos(d) {
    return Promise.all((d.logos || []).map(function (l) {
      return new Promise(function (ok) {
        var im = new Image();
        im.onload = function () { logoImg[l[0]] = im; ok(); };
        im.onerror = function () { ok(); };
        im.src = LOGO_DIR + l[0] + ".webp";
      });
    }));
  }
  function ensureData() {
    // ตั้ง D หลังโลโก้โหลดเสร็จ — ไม่งั้น mount() ตอนเปลี่ยนสไตล์ระหว่างรอจะใส่ไอคอนสำรองค้างไว้ใต้ id เดียวกัน
    if (!loading) loading = (window.BKK_EMERGENCY ? Promise.resolve() : loadScript(DATA_URL))
      .then(function () { var d = window.BKK_EMERGENCY; if (!d) throw new Error("no data"); return loadLogos(d).then(function () { D = d; }); });
    return loading;
  }
  function logoKey(r) { return r[11] >= 0 && D.logos ? D.logos[r[11]][0] : ""; }
  function geo() {
    var f = [];
    D.s.forEach(function (r, i) {
      var k = D.cats[r[2]][0], lg = logoKey(r);
      if (off[k]) return;
      f.push({ type: "Feature", geometry: { type: "Point", coordinates: [r[0], r[1]] }, properties: { i: i, k: k, c: D.cats[r[2]][2], n: r[3], er: r[6] & 1, ic: "emer-" + k + (lg ? "-" + lg : "") } });
    });
    return { type: "FeatureCollection", features: f };
  }

  /* ================================================================ รูปไอคอน */
  function makeIcon(color, paths) {
    var S = 2, R = 13, N = (R * 2 + 4) * S, cv = document.createElement("canvas");
    cv.width = cv.height = N;
    var g = cv.getContext("2d");
    g.scale(S, S);
    g.beginPath(); g.arc(R + 2, R + 2, R, 0, Math.PI * 2);
    g.fillStyle = color; g.fill();
    g.lineWidth = 1.6; g.strokeStyle = "rgba(255,255,255,.95)"; g.stroke();
    g.save();
    g.translate(R + 2 - 8.4, R + 2 - 8.4); g.scale(0.7, 0.7);
    g.lineWidth = 2.3; g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "#fff";
    paths.forEach(function (d) { try { g.stroke(new Path2D(d)); } catch (e) { } });
    g.restore();
    return { width: N, height: N, data: g.getImageData(0, 0, N, N).data };
  }
  // หมุดโลโก้: วงแหวนสีหมวด + ขอบขาว + โลโก้ตัดวงกลม + ป้ายสัญลักษณ์หมวด (สีหมวด) มุมขวาล่าง — แบบเดียวกับจุดชาร์จ EV
  var LOGO_S = 3;
  function makeLogoIcon(color, img, paths) {
    var S = LOGO_S, R = 15, P = 3, C = R + P, N = C * 2 * S, cv = document.createElement("canvas");
    cv.width = cv.height = N;
    var g = cv.getContext("2d");
    g.scale(S, S);
    g.beginPath(); g.arc(C, C, R, 0, Math.PI * 2);
    g.fillStyle = color; g.fill();
    g.lineWidth = 1.6; g.strokeStyle = "rgba(255,255,255,.95)"; g.stroke();
    g.beginPath(); g.arc(C, C, R - 2.6, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    var r = R - 3.7;
    g.save(); g.beginPath(); g.arc(C, C, r, 0, Math.PI * 2); g.clip();
    g.imageSmoothingQuality = "high";
    g.drawImage(img, C - r, C - r, r * 2, r * 2);
    g.restore();
    // เปิดจาก file:// รูปจะทำให้ canvas "tainted" อ่านพิกเซลไม่ได้ → คืน null ให้ใช้ไอคอนธรรมดา
    try { g.getImageData(0, 0, 1, 1); } catch (e) { return null; }
    var bx = C + R * 0.68, by = C + R * 0.68, br = 6.2;
    g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2);
    g.fillStyle = color; g.fill();
    g.lineWidth = 1.4; g.strokeStyle = "#fff"; g.stroke();
    g.save(); g.translate(bx - 12 * 0.36, by - 12 * 0.36); g.scale(0.36, 0.36);
    g.lineWidth = 2.6; g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "#fff";
    paths.forEach(function (d) { try { g.stroke(new Path2D(d)); } catch (e) { } });
    g.restore();
    return { width: N, height: N, data: g.getImageData(0, 0, N, N).data };
  }
  function ensureImages() {
    D.cats.forEach(function (c) {
      var id = "emer-" + c[0];
      if (!map.hasImage(id)) map.addImage(id, makeIcon(c[2], GLYPH[c[0]] || GLYPH.h), { pixelRatio: 2 });
    });
    // คู่ หมวด×โลโก้ ที่มีจริงในข้อมูล (~40 รูป)
    var seen = {};
    D.s.forEach(function (r) {
      var lg = logoKey(r);
      if (!lg) return;
      var c = D.cats[r[2]], id = "emer-" + c[0] + "-" + lg;
      if (seen[id] || map.hasImage(id)) return;
      seen[id] = 1;
      var paths = GLYPH[c[0]] || GLYPH.h, ic = logoImg[lg] && makeLogoIcon(c[2], logoImg[lg], paths);
      if (ic) map.addImage(id, ic, { pixelRatio: LOGO_S });
      else map.addImage(id, makeIcon(c[2], paths), { pixelRatio: 2 });
    });
  }

  /* ================================================================ ชั้นแผนที่ */
  var LAYERS = ["emer-dot", "emer-ico", "emer-link", "emer-origin"];
  function addLayers() {
    if (!map || !map.getStyle() || !D) return;
    ensureImages();
    if (map.getSource("emer-st")) map.getSource("emer-st").setData(geo());
    else map.addSource("emer-st", { type: "geojson", data: geo() });
    if (!map.getSource("emer-near")) map.addSource("emer-near", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    if (!map.getLayer("emer-link")) map.addLayer({
      id: "emer-link", type: "line", source: "emer-near", filter: ["==", ["geometry-type"], "LineString"],
      paint: { "line-color": ["get", "c"], "line-width": 2.2, "line-dasharray": [2, 1.5], "line-opacity": 0.9 }
    });
    if (!map.getLayer("emer-dot")) map.addLayer({
      id: "emer-dot", type: "circle", source: "emer-st", maxzoom: 11.5,
      paint: {
        "circle-color": ["get", "c"],
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 9, 3.5, 11.5, 5],
        "circle-stroke-color": "rgba(255,255,255,.85)", "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 5, 0.3, 10, 1]
      }
    });
    if (!map.getLayer("emer-ico")) map.addLayer({
      id: "emer-ico", type: "symbol", source: "emer-st", minzoom: 11.5,
      layout: {
        "icon-image": ["get", "ic"],
        "icon-size": ["interpolate", ["linear"], ["zoom"], 11.5, 0.75, 15, 1],
        "icon-allow-overlap": true,
        "symbol-sort-key": ["match", ["get", "k"], "h", 0, "f", 1, "p", 2, "s", 3, "a", 4, 5],
        "text-field": ["step", ["zoom"], "", LABEL_Z, ["get", "n"]],
        "text-font": ["Noto Sans Regular"], "text-size": 10.5, "text-anchor": "top", "text-offset": [0, 1.25],
        "text-optional": true, "text-max-width": 9
      },
      paint: { "text-color": "#f1f5f9", "text-halo-color": "rgba(8,12,22,.92)", "text-halo-width": 1.5 }
    });
    if (!map.getLayer("emer-origin")) map.addLayer({
      id: "emer-origin", type: "circle", source: "emer-near", filter: ["==", ["geometry-type"], "Point"],
      paint: { "circle-color": "#ffffff", "circle-radius": 7, "circle-stroke-color": "#0ea5e9", "circle-stroke-width": 3 }
    });
    syncVis();
    bindHandlers();
  }
  function syncVis() {
    if (!map) return;
    LAYERS.forEach(function (id) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none"); });
  }

  /* ================================================================ การ์ด */
  function catName(r) { return D.cats[r[2]][1]; }
  // ป้ายหน้าชื่อในแผง/ป๊อปอัป — มีโลโก้ = รูปในวงสีหมวด · ไม่มี = จุดสี
  function mark(r) {
    var c = D.cats[r[2]], lg = logoKey(r);
    return lg && logoImg[lg] ? '<img class="em-lg" src="' + LOGO_DIR + lg + '.webp" alt="" style="--c:' + c[2] + '">' : '<i style="background:' + c[2] + '"></i>';
  }
  function popupHTML(i) {
    var r = D.s[i], c = D.cats[r[2]], prov = D.prov[r[4]] || "";
    var where = [r[5] && (prov === "กรุงเทพมหานคร" ? "เขต" : "อ.") + r[5], prov && (prov === "กรุงเทพมหานคร" ? prov : "จ." + prov)].filter(Boolean).join(" ");
    var tags = [];
    if (r[6] & 1) tags.push("มีห้องฉุกเฉิน");
    if (r[6] & 2) tags.push("รัฐ");
    if (r[6] & 4) tags.push("เอกชน");
    if (r[7]) tags.push(r[7] + " เตียง");
    var lgo = r[11] >= 0 && D.logos ? D.logos[r[11]] : null, lgName = lgo ? lgo[1] : "";
    var nav = "https://www.google.com/maps/dir/?api=1&destination=" + r[1] + "," + r[0];
    var bma = /^bma:/.test(r[9]);
    var src = bma ? '<a href="https://data.bangkok.go.th/dataset/firestations" target="_blank" rel="noopener">สปภ. กทม. (data.bangkok.go.th)</a>'
      : '<a href="https://www.openstreetmap.org/' + ({ n: "node", w: "way", r: "relation" }[r[9][0]] || "node") + "/" + r[9].slice(1) + '" target="_blank" rel="noopener">OpenStreetMap</a>';
    var tel = r[8] ? r[8].replace(/[^\d+]/g, "") : "";
    var dist = origin ? '<p class="em-note">ห่างจากจุดที่เลือก ' + fmtKm(km(origin[0], origin[1], r[0], r[1])) + ' (เส้นตรง)</p>' : "";
    return '<div class="em-pop"><div class="em-h">' + mark(r) + '<div><b>' + esc(r[3] || c[1] + " (ไม่มีชื่อใน OSM)") + '</b>' +
      '<small>' + esc(c[1]) + (where ? " · " + esc(where) : "") + '</small></div></div>' +
      (lgName ? '<p class="em-org" title="จับคู่โลโก้จากชื่อสถานที่โดยอัตโนมัติ อาจคลาดเคลื่อน">' + (r[2] === 1 ? "ตรา: " : lgo[2] === "p" ? "เครือ: " : "สังกัด: ") + esc(lgName) +
        (r[2] === 1 ? ' <small>(บางแห่งถ่ายโอนให้ อบจ. แล้ว)</small>' : "") + '</p>' : "") +
      (tags.length ? '<div class="em-tags">' + tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join("") + '</div>' : "") +
      (r[10] ? '<p class="em-note">เวลาทำการ: ' + esc(r[10]) + '</p>' : "") +
      (r[12] ? '<p class="em-note">' + esc(r[12]) + '</p>' : "") + dist +
      '<div class="em-acts"><a href="' + nav + '" target="_blank" rel="noopener">' + ico("navigation") + ' นำทาง</a>' +
      (tel ? '<a href="tel:' + esc(tel) + '">' + ico("phone") + ' ' + esc(r[8]) + '</a>' : "") + '</div>' +
      '<p class="em-src">ข้อมูล: ' + src + ' — ก่อนเดินทางโปรดโทรยืนยัน · ฉุกเฉินโทร ' + (r[2] === 2 ? "199" : r[2] === 3 ? "191" : "1669") + '</p></div>';
  }
  function openPopup(i, fly) {
    var r = D.s[i];
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ closeButton: true, maxWidth: "min(300px, calc(100vw - 24px))", className: "em-popup", offset: 14 }).setLngLat([r[0], r[1]]).setHTML(popupHTML(i)).addTo(map);
    if (fly) map.flyTo({ center: [r[0], r[1]], zoom: Math.max(map.getZoom(), 15), duration: 1200 });
    var pn = $("#emerPanel");
    if (pn && window.innerWidth <= 760) pn.classList.add("min");
  }

  /* ================================================================ ที่ใกล้ที่สุด */
  function nearest(lon, lat, how, noFly) {
    origin = [lon, lat, how];
    var best = {}, i, r, k, d;
    for (i = 0; i < D.s.length; i++) {
      r = D.s[i]; k = D.cats[r[2]][0];
      if (Math.abs(r[1] - lat) > 0.6 || Math.abs(r[0] - lon) > 0.6) continue;     // ~60 กม.
      d = km(lon, lat, r[0], r[1]);
      if (!best[k] || d < best[k].d) best[k] = { i: i, d: d };
      if (k === "h" && (r[6] & 1) && (!best.er || d < best.er.d)) best.er = { i: i, d: d };
    }
    if (best.er && best.h && best.er.i === best.h.i) delete best.er;
    var feats = [{ type: "Feature", geometry: { type: "Point", coordinates: [lon, lat] }, properties: {} }];
    Object.keys(best).forEach(function (k2) {
      var rr = D.s[best[k2].i];
      feats.push({ type: "Feature", geometry: { type: "LineString", coordinates: [[lon, lat], [rr[0], rr[1]]] }, properties: { c: D.cats[rr[2]][2] } });
    });
    if (map.getSource("emer-near")) map.getSource("emer-near").setData({ type: "FeatureCollection", features: feats });
    renderNear(best);
    if (noFly) return;
    // ให้เห็นทั้งจุดเริ่มกับที่ใกล้ที่สุดของทุกหมวด (ไม่เกิน ~15 กม. จะได้ไม่ซูมออกไกลเพราะจุดรวมพลที่อยู่ไกล)
    var bb = new maplibregl.LngLatBounds([lon, lat], [lon, lat]);
    Object.keys(best).forEach(function (k3) { if (best[k3].d < 15) { var q = D.s[best[k3].i]; bb.extend([q[0], q[1]]); } });
    map.fitBounds(bb, { padding: { top: 90, bottom: window.innerWidth <= 760 ? 260 : 90, left: 60, right: window.innerWidth <= 760 ? 60 : 380 }, maxZoom: 15.5, duration: 1200 });
  }
  var NEAR_ORDER = [["h", "โรงพยาบาลใกล้สุด"], ["er", "โรงพยาบาลที่ระบุว่ามีห้องฉุกเฉิน"], ["c", "รพ.สต./สถานีอนามัย"], ["f", "สถานีดับเพลิง"], ["p", "สถานีตำรวจ"], ["a", "รถพยาบาล/กู้ภัย"], ["s", "จุดรวมพล/ศูนย์พักพิง"]];
  function renderNear(best) {
    var out = $("#emNear");
    if (!out) return;
    var how = origin[2] === "me" ? "จากตำแหน่งของคุณ" : origin[2] === "click" ? "จากจุดที่คลิก" : "จากกลางแผนที่";
    var rows = NEAR_ORDER.filter(function (x) { return best[x[0]]; }).map(function (x) {
      var b = best[x[0]], r = D.s[b.i], c = D.cats[r[2]];
      return '<button type="button" class="em-row" data-i="' + b.i + '">' + mark(r) + '<span><small>' + esc(x[1]) + '</small>' +
        esc(r[3] || c[1]) + '</span><em>' + fmtKm(b.d) + '</em></button>';
    });
    out.innerHTML = '<p class="em-note">' + how + ' · ระยะเส้นตรง ถนนจริงไกลกว่านี้</p>' +
      (rows.length ? rows.join("") : '<p class="em-note">ไม่พบสถานที่ในรัศมี ~60 กม.</p>') +
      '<button type="button" class="em-clear" data-a="clear">ล้างเส้น</button>';
  }
  function clearNear() {
    origin = null;
    if (map && map.getSource("emer-near")) map.getSource("emer-near").setData({ type: "FeatureCollection", features: [] });
    var out = $("#emNear");
    if (out) out.innerHTML = "";
  }

  function bindHandlers() {
    if (bound) return;
    bound = true;
    var ids = function () { return ["emer-ico", "emer-dot"].filter(function (id) { return map.getLayer(id); }); };
    map.on("click", function (e) {
      if (!visible) return;
      if (picking) {
        picking = false;
        setPickUI();
        map.getCanvas().style.cursor = "";
        nearest(e.lngLat.lng, e.lngLat.lat, "click");
        return;
      }
      var p = e.point, fs = map.queryRenderedFeatures([[p.x - 8, p.y - 8], [p.x + 8, p.y + 8]], { layers: ids() });
      if (fs.length) openPopup(fs[0].properties.i);
    });
    var hov = false;
    map.on("mousemove", function (e) {
      if (!visible || picking) return;
      var h = map.queryRenderedFeatures([[e.point.x - 6, e.point.y - 6], [e.point.x + 6, e.point.y + 6]], { layers: ids() }).length > 0;
      if (h !== hov) { hov = h; map.getCanvas().style.cursor = h ? "pointer" : ""; }
    });
  }
  function setPickUI() {
    var b = $("#emerPanel [data-a='pick']");
    if (b) { b.classList.toggle("on", picking); b.innerHTML = ico("mouse-pointer-click") + (picking ? " คลิกบนแผนที่…" : " คลิกจุดบนแผนที่"); }
  }

  /* ================================================================ แผง */
  var CSS = [
    "#emerPanel{position:absolute;z-index:43;right:14px;bottom:40px;width:330px;max-width:calc(100% - 28px);max-height:calc(100% - 120px);overflow:auto;display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.5}",
    "#emerPanel.open{display:block;animation:elvIn .22s ease}",
    "#floodPanel.open~#emerPanel.open{right:358px}",
    ".em-ph{display:flex;align-items:center;gap:8px;padding:11px 12px 6px 14px;font-weight:800;font-size:13.5px;position:sticky;top:0;background:inherit;z-index:1}",
    ".em-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".em-ib .mdico{width:13px;height:13px}.em-ph .em-ib:first-of-type{margin-left:auto}",
    "#emerPanel.min .em-body{display:none}",
    ".em-body{padding:0 14px 12px}",
    ".em-tel{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin:2px 0 8px}",
    ".em-tel a{display:flex;flex-direction:column;align-items:center;padding:5px 2px;border-radius:9px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);color:var(--text-main);text-decoration:none;font-weight:800;font-size:13px;line-height:1.15}",
    ".em-tel a small{font-weight:500;font-size:9px;opacity:.75;text-align:center}",
    ".em-tel a:hover{background:rgba(239,68,68,.22)}",
    ".em-cats{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px}",
    ".em-cat{display:flex;align-items:center;gap:6px;padding:5px 7px;border-radius:9px;border:1px solid var(--card-border);background:none;color:var(--text-main);font:inherit;font-size:11.5px;cursor:pointer;text-align:left}",
    ".em-cat i{width:11px;height:11px;border-radius:50%;flex:none;box-shadow:0 0 0 1.5px rgba(255,255,255,.8)}.em-cat span{flex:1;min-width:0}.em-cat b{font-variant-numeric:tabular-nums;font-size:11px;opacity:.8}",
    ".em-cat.off{opacity:.38}",
    ".em-sec{border-top:1px solid var(--card-border);padding:8px 0 4px}.em-sec>b{display:flex;align-items:center;gap:6px;font-size:12.5px;margin-bottom:4px}",
    ".em-btns{display:flex;gap:5px;flex-wrap:wrap}.em-btns button{flex:1 1 30%;display:flex;align-items:center;justify-content:center;gap:4px;padding:6px 6px;border-radius:9px;border:1px solid var(--card-border);background:rgba(127,127,127,.07);color:var(--text-main);font:inherit;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap}",
    ".em-btns button:hover,.em-btns button.on{border-color:var(--accent);background:var(--accent-soft)}.em-btns .mdico{width:13px;height:13px}",
    ".em-row{display:flex;align-items:center;gap:8px;width:100%;padding:5px 6px;border:0;border-radius:8px;background:none;color:var(--text-main);font:inherit;font-size:11.5px;cursor:pointer;text-align:left}",
    ".em-row:hover{background:var(--accent-soft)}.em-row i{width:10px;height:10px;border-radius:50%;flex:none}.em-row span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".em-row span small{display:block;font-size:10px;opacity:.6}.em-row em{font-style:normal;font-variant-numeric:tabular-nums;font-weight:700}",
    ".em-clear{margin-top:4px;border:0;background:none;color:var(--text-muted);font:inherit;font-size:11px;cursor:pointer;text-decoration:underline}",
    ".em-note{margin:4px 0;font-size:11px;opacity:.72;line-height:1.45}",
    ".em-src{margin:8px 0 0;font-size:10px;opacity:.62;line-height:1.5}.em-src a{color:inherit}",
    ".em-popup .maplibregl-popup-content{background:var(--card-bg);color:var(--text-main);border:1px solid var(--card-border);border-radius:12px;padding:11px 13px 9px;box-shadow:0 10px 30px rgba(0,0,0,.3);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}",
    ".em-popup .maplibregl-popup-tip{display:none}.em-popup .maplibregl-popup-close-button{color:var(--text-muted);font-size:17px;right:4px;top:3px}",
    ".em-pop{font-size:12px;line-height:1.5;min-width:230px}.em-h{display:flex;gap:9px;align-items:flex-start;margin:0 16px 6px 0}.em-h i{width:12px;height:12px;border-radius:50%;flex:none;margin-top:4px}",
    ".em-h b{display:block;font-size:13px}.em-h small{opacity:.7}",
    ".em-lg{width:18px;height:18px;border-radius:50%;flex:none;object-fit:cover;background:#fff;border:1.5px solid #fff;box-shadow:0 0 0 1.5px var(--c)}",
    ".em-h .em-lg{width:28px;height:28px;margin-top:0}",
    ".em-org{margin:0 0 4px;font-size:11.5px;font-weight:600}.em-org small{font-weight:400;opacity:.7}",
    ".em-tags{display:flex;flex-wrap:wrap;gap:4px;margin:2px 0 4px}.em-tags span{font-size:10.5px;padding:1px 7px;border-radius:999px;background:rgba(127,127,127,.14)}",
    ".em-acts{display:flex;gap:6px;margin-top:8px}.em-acts a{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;border-radius:9px;background:var(--accent-soft);border:1px solid var(--accent);color:var(--text-main);font-weight:700;font-size:11.5px;text-decoration:none}",
    ".em-acts .mdico{width:13px;height:13px}",
    "@media (max-width:1100px){#floodPanel.open~#emerPanel.open{right:14px;bottom:auto;top:130px;max-height:calc(100% - 180px)}}",
    "@media (max-width:760px){#emerPanel,#floodPanel.open~#emerPanel.open{top:auto;bottom:86px;right:14px;left:14px;width:auto;max-height:42vh}}"
  ].join("");

  function renderPanel() {
    var body = $("#emerPanel .em-body");
    if (!body) return;
    var h = '<div class="em-tel">' + PHONES.map(function (p) { return '<a href="tel:' + p[0] + '" title="โทร ' + p[0] + ' — ' + p[1] + '">' + p[0] + '<small>' + p[1] + '</small></a>'; }).join("") + '</div>';
    if (!D) h += '<p class="em-note">กำลังโหลดสถานที่…</p>';
    else {
      var cnt = {};
      D.s.forEach(function (r) { var k = D.cats[r[2]][0]; cnt[k] = (cnt[k] || 0) + 1; });
      h += '<div class="em-cats">' + D.cats.map(function (c) {
        return '<button type="button" class="em-cat' + (off[c[0]] ? " off" : "") + '" data-k="' + c[0] + '" title="แสดง/ซ่อน' + esc(c[1]) + '"><i style="background:' + c[2] + '"></i><span>' + esc(c[1]) + '</span><b>' + (cnt[c[0]] || 0).toLocaleString("th-TH") + '</b></button>';
      }).join("") + '</div>';
      h += '<div class="em-sec"><b>' + ico("navigation") + ' ที่ใกล้ที่สุดจาก…</b><div class="em-btns">' +
        '<button type="button" data-a="near-me">' + ico("crosshair") + ' ตำแหน่งของฉัน</button>' +
        '<button type="button" data-a="near-center">' + ico("map-pin") + ' กลางแผนที่</button>' +
        '<button type="button" data-a="pick" class="' + (picking ? "on" : "") + '">' + ico("mouse-pointer-click") + (picking ? " คลิกบนแผนที่…" : " คลิกจุดบนแผนที่") + '</button></div>' +
        '<div id="emNear"></div></div>';
    }
    var nBma = D ? D.s.filter(function (r) { return /^bma:/.test(r[9]); }).length : 0;
    h += '<p class="em-src">' + (D ? (D.s.length - nBma).toLocaleString("th-TH") + " แห่งจาก OpenStreetMap (ODbL)" + (D.osm ? " ณ " + esc(String(D.osm).slice(0, 10)) : "") +
      ' + สถานีดับเพลิง กทม. ' + nBma + ' แห่งจาก <a href="https://data.bangkok.go.th/dataset/firestations" target="_blank" rel="noopener">สปภ. กทม.</a> — ' : "") +
      'ยังไม่ครบทุกแห่ง โดยเฉพาะสถานีดับเพลิงของท้องถิ่นต่างจังหวัดและศูนย์พักพิงชั่วคราว · โลโก้จับคู่จากชื่อสถานที่อัตโนมัติ อาจคลาดเคลื่อน · ' +
      'ระยะเป็นเส้นตรง · ข้อมูลเพื่อประกอบการตัดสินใจ เหตุฉุกเฉินโทร 1669 / 191 / 199</p>';
    body.innerHTML = h;
    if (origin && D) nearest(origin[0], origin[1], origin[2], true);   // วาดรายการ/เส้นใหม่ ไม่ขยับกล้อง
  }
  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    addIcons();
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnEmergencyToggle")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "menu-btn"; b.id = "btnEmergencyToggle";
      b.title = "เปิด/ปิดชั้นสถานที่ฉุกเฉิน — โรงพยาบาล ดับเพลิง ตำรวจ จุดรวมพล และหาที่ใกล้ที่สุด";
      b.innerHTML = '<span>' + ico("siren") + '</span><span class="label-text"> สถานที่ฉุกเฉิน</span>';
      b.addEventListener("click", function () { setVisible(!visible); });
      menu.appendChild(b);
    }
    if (!$("#emerPanel")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var p = document.createElement("div");
      p.id = "emerPanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "สถานที่ฉุกเฉิน");
      p.innerHTML = '<div class="em-ph">' + ico("siren") + ' สถานที่ฉุกเฉิน' +
        '<button type="button" class="em-ib" data-a="min" title="ย่อ/ขยาย">' + ico("minus") + '</button>' +
        '<button type="button" class="em-ib" data-a="close" title="ปิดชั้นนี้">×</button></div><div class="em-body"></div>';
      if (lsGet(LS_MIN) === "1") p.classList.add("min");
      var fl = $("#floodPanel");
      if (fl && fl.parentNode === stage) stage.insertBefore(p, fl.nextSibling); else stage.appendChild(p);
      p.addEventListener("click", function (e) {
        var a = e.target.closest("[data-a]");
        if (a) {
          var act = a.dataset.a;
          if (act === "close") return setVisible(false);
          if (act === "min") { var m = !p.classList.contains("min"); p.classList.toggle("min", m); lsSet(LS_MIN, m ? "1" : "0"); return; }
          if (act === "clear") return clearNear();
          if (!D) return;
          if (act === "near-center") { var c = map.getCenter(); nearest(c.lng, c.lat, "center"); return; }
          if (act === "pick") { picking = !picking; setPickUI(); map.getCanvas().style.cursor = picking ? "crosshair" : ""; return; }
          if (act === "near-me") {
            if (!navigator.geolocation) { var o1 = $("#emNear"); if (o1) o1.innerHTML = '<p class="em-note">เบราว์เซอร์นี้หาตำแหน่งไม่ได้</p>'; return; }
            navigator.geolocation.getCurrentPosition(function (pos) { nearest(pos.coords.longitude, pos.coords.latitude, "me"); },
              function () { var o2 = $("#emNear"); if (o2) o2.innerHTML = '<p class="em-note">ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง — ลอง "กลางแผนที่" หรือ "คลิกจุดบนแผนที่" แทน</p>'; },
              { timeout: 10000, maximumAge: 60000 });
            return;
          }
        }
        var k = e.target.closest("[data-k]");
        if (k) {
          if (off[k.dataset.k]) delete off[k.dataset.k]; else off[k.dataset.k] = 1;
          lsSet(LS_OFF, JSON.stringify(off));
          if (map.getSource("emer-st")) map.getSource("emer-st").setData(geo());
          renderPanel();
          return;
        }
        var n = e.target.closest("[data-i]");
        if (n) openPopup(+n.dataset.i, true);
      });
    }
    syncButtons();
  }
  function syncButtons() {
    var b = $("#btnEmergencyToggle"), p = $("#emerPanel");
    if (b) b.classList.toggle("active", visible);
    if (p) p.classList.toggle("open", visible);
  }

  function setVisible(v) {
    visible = !!v;
    lsSet(LS_KEY, visible ? "1" : "0");
    syncButtons();
    if (!visible) {
      picking = false;
      if (popup) { popup.remove(); popup = null; }
      syncVis();
      return;
    }
    renderPanel();
    ensureData().then(function () {
      if (!visible) return;
      addLayers();
      renderPanel();
    }).catch(function (e) { console.warn("emergency data:", e); });
    var c = map.getCenter();
    if (c.lng < 97 || c.lng > 106 || c.lat < 5 || c.lat > 21) map.flyTo(Object.assign({ duration: 1600 }, HOME));
  }

  /* ================================================================ mount — เรียกซ้ำทุกครั้งที่เปลี่ยนสไตล์แผนที่ */
  function mount(m) {
    map = m;
    try { off = JSON.parse(lsGet(LS_OFF) || "{}") || {}; } catch (e) { off = {}; }
    buildUI();
    if (lsGet(LS_KEY) === "1" && !visible) { setVisible(true); return; }
    if (visible && D) {
      addLayers();
      if (origin) nearest(origin[0], origin[1], origin[2], true);
    }
  }

  window.BKK_EMERGENCY_LAYER = {
    mount: mount,
    setVisible: setVisible,
    nearest: function (lon, lat) { if (D) nearest(lon, lat, "center"); },
    debug: function () { return { visible: visible, n: D ? D.s.length : 0, off: off, origin: origin }; }
  };
})();
