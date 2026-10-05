/**
 * bkk-nature.js
 * ชิป "ที่เที่ยวทั่วไทย" ในแถบไลฟ์สไตล์ 360° ของ bkk-city.html — น้ำตก ถ้ำ ชายหาด เกาะ ภูเขา/ดอย จุดชมวิว อุทยานแห่งชาติ ทั่วประเทศ
 *
 * ข้อมูล: bkk-nature-data.js (window.BKK_NATURE, โหลดเมื่อกดชิปครั้งแรก) จาก _geo/build-bkk-nature.js
 *   ตำแหน่ง/ขอบเขตอุทยาน = OpenStreetMap (ODbL) · รูป = Wikimedia Commons (สัญญาอนุญาตเปิด ระบุผู้ถ่ายใต้รูป)
 *   ที่ดัง (ติดดาว) ราว 140 แห่ง + คำบรรยายสั้น = คัดและเขียนเองใน _geo/osm-nature/stars.js
 * แสดงแบบ Google Maps: ซูมออกเห็นแค่ที่ดัง ยิ่งซูมเข้ายิ่งเห็นที่เล็กลง (tier 0–3) และไอคอนที่ทับกันจะหลบให้กันเอง
 * bkk-city.html เรียก setActive(true/false) จากตัวจัดการชิปหมวด · mount(map) ทุกครั้งที่ style โหลดใหม่ (สลับธีม)
 */
(function () {
  "use strict";

  var DATA_URL = "bkk-nature-data.js";
  var LS_TYPE = "bkk-nat-type", LS_STAR = "bkk-nat-star";
  // เส้นไอคอน Lucide (ISC) ในกรอบ 24×24 — ถ้ำวาดเอง (Lucide ไม่มี)
  var GLYPH = {
    fall: "M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97",
    cave: "M2 20 8.5 5.5l3.5 5 3-3.5L22 20Z M8.5 20v-3.5a3.5 3.5 0 0 1 7 0V20",
    beach: "M22 12a10.06 10.06 1 0 0-20 0Z M12 12v8a2 2 0 0 0 4 0 M12 2v1",
    island: "M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4 M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3 M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35 M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14",
    peak: "m8 3 4 8 5-5 5 15H2L8 3z M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19",
    view: "M10 10h4 M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3 M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z M22 16H2 M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z M9 7V4a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v3",
    park: "M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z M7 16v6 M13 19v3 M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"
  };
  var STAR_D = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z";
  // tier → ซูมที่เริ่มเห็นไอคอน / ป้ายชื่อ
  var TIERS = [[0, 0, 5.6], [1, 6.8, 8.6], [2, 8.4, 10.6], [3, 10.8, 12.6]];
  var PT_LAYERS = ["nat-t3", "nat-t2", "nat-t1", "nat-t0"], PK_LAYERS = ["nat-pk-fill", "nat-pk-line", "nat-pk-lbl"];

  var map = null, D = null, active = false, loading = null, bound = false;
  var type = "all", starOnly = false, prevCam = null;

  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function isLight() { var t = document.documentElement.getAttribute("data-theme"); return t !== "dark" && t !== "sunset"; }
  function svg(d, cls) { return '<svg class="' + (cls || "nat-g") + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; }
  function typeRow(k) { for (var i = 0; i < D.types.length; i++) if (D.types[i][0] === k) return D.types[i]; return null; }
  var TYPE_FALLBACK = [["fall", "น้ำตก", "#0284c7"], ["cave", "ถ้ำ", "#78716c"], ["beach", "ชายหาด", "#d97706"], ["island", "เกาะ", "#0d9488"],
    ["peak", "ภูเขา/ดอย", "#4d7c0f"], ["view", "จุดชมวิว", "#7c3aed"], ["park", "อุทยานแห่งชาติ", "#15803d"]];
  function types() { return D ? D.types : TYPE_FALLBACK; }
  function ic(k, c) { return '<span class="nat-ic" style="background:' + c + '">' + svg(GLYPH[k]) + '</span>'; }
  function fmt(n) { return Number(n).toLocaleString("th-TH"); }

  function loadScript(src) {
    return new Promise(function (ok, bad) {
      var s = document.createElement("script");
      s.src = src; s.async = true; s.onload = ok; s.onerror = function () { bad(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }
  function ensureData() {
    if (!loading) loading = (window.BKK_NATURE ? Promise.resolve() : loadScript(DATA_URL)).then(function () {
      D = window.BKK_NATURE;
      if (!D) throw new Error("no data");
    });
    return loading;
  }

  /* ---------- ไอคอนบนแผนที่ (canvas → map.addImage) ---------- */
  var ICON_S = 2;
  function makeIcon(color, d, star) {
    var S = ICON_S, R = star ? 12.5 : 9.5, pad = star ? 6 : 3, C = R + pad, N = Math.ceil(C * 2 * S);
    var cv = document.createElement("canvas");
    cv.width = cv.height = N;
    var g = cv.getContext("2d");
    g.scale(S, S);
    g.shadowColor = "rgba(0,0,0,.35)"; g.shadowBlur = 3; g.shadowOffsetY = 1;
    g.beginPath(); g.arc(C, C, R, 0, Math.PI * 2); g.fillStyle = color; g.fill();
    g.shadowColor = "transparent";
    g.lineWidth = star ? 2.4 : 1.6; g.strokeStyle = star ? "#fbbf24" : "rgba(255,255,255,.95)"; g.stroke();
    if (star) { g.beginPath(); g.arc(C, C, R - 1.9, 0, Math.PI * 2); g.lineWidth = 1; g.strokeStyle = "rgba(255,255,255,.9)"; g.stroke(); }
    var k = (R * 1.12) / 24;
    g.save(); g.translate(C - 12 * k, C - 12 * k); g.scale(k, k);
    g.strokeStyle = "#fff"; g.lineWidth = 2.1; g.lineCap = "round"; g.lineJoin = "round";
    try { g.stroke(new Path2D(d)); } catch (e) { }
    g.restore();
    if (star) {
      var bx = C + R * 0.72, by = C - R * 0.72, br = 5.2;
      g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fillStyle = "#fbbf24"; g.fill();
      g.lineWidth = 1.2; g.strokeStyle = "#fff"; g.stroke();
      var s = 0.34; g.save(); g.translate(bx - 12 * s, by - 12 * s); g.scale(s, s);
      g.fillStyle = "#fff"; try { g.fill(new Path2D(STAR_D)); } catch (e) { } g.restore();
    }
    return { width: N, height: N, data: g.getImageData(0, 0, N, N).data };
  }
  function addIcons() {
    types().forEach(function (t) {
      if (!map.hasImage("nat-" + t[0])) map.addImage("nat-" + t[0], makeIcon(t[2], GLYPH[t[0]], false), { pixelRatio: ICON_S });
      if (!map.hasImage("nat-" + t[0] + "-s")) map.addImage("nat-" + t[0] + "-s", makeIcon(t[2], GLYPH[t[0]], true), { pixelRatio: ICON_S });
    });
  }

  /* ---------- GeoJSON ---------- */
  function ptGeo() {
    var f = [];
    D.p.forEach(function (r, i) {
      f.push({ type: "Feature", geometry: { type: "Point", coordinates: [r[0], r[1]] },
        properties: { i: i, t: D.types[r[2]][0], tier: r[7], nm: r[3], k: r[7] * 10 + (r[12] >= 0 ? 0 : 1) } });
    });
    return { type: "FeatureCollection", features: f };
  }
  function pkGeo() {
    var f = [];
    D.parks.forEach(function (k, i) {
      f.push({ type: "Feature", geometry: { type: "MultiPolygon", coordinates: D.shapes[i] }, properties: { i: i, s: k[3] === 0 ? 1 : 0 } });
    });
    return { type: "FeatureCollection", features: f };
  }
  function pkLblGeo() {
    var f = [];
    D.parks.forEach(function (k, i) {
      var lp = k[11] || [(k[10][0] + k[10][2]) / 2, (k[10][1] + k[10][3]) / 2];
      f.push({ type: "Feature", geometry: { type: "Point", coordinates: lp },
        properties: { i: i, s: k[3] === 0 ? 1 : 0, nm: String(k[0]).replace(/^อุทยานแห่งชาติ/, "อช.").replace(/^วนอุทยาน/, "วนอช."), k: k[3] } });
    });
    return { type: "FeatureCollection", features: f };
  }

  /* ---------- ชั้นแผนที่ ---------- */
  function firstSymbolId() {
    var ls = (map.getStyle() && map.getStyle().layers) || [];
    for (var i = 0; i < ls.length; i++) if (ls[i].type === "symbol" && !/^(nat-|shops-|lmk-)/.test(ls[i].id)) return ls[i].id;
    return undefined;
  }
  function addLayers() {
    if (!map || !map.getStyle() || !D) return;
    addIcons();
    var light = isLight();
    var txt = light ? "#1e293b" : "#f1f5f9", halo = light ? "rgba(255,255,255,.95)" : "rgba(8,12,22,.9)";
    var pkTxt = light ? "#166534" : "#86efac";

    if (map.getSource("nat-pts")) map.getSource("nat-pts").setData(ptGeo());
    else map.addSource("nat-pts", { type: "geojson", data: ptGeo() });
    if (!map.getSource("nat-pk")) map.addSource("nat-pk", { type: "geojson", data: pkGeo() });
    if (!map.getSource("nat-pk-lp")) map.addSource("nat-pk-lp", { type: "geojson", data: pkLblGeo() });

    var below = firstSymbolId();
    if (!map.getLayer("nat-pk-fill")) map.addLayer({
      id: "nat-pk-fill", type: "fill", source: "nat-pk",
      paint: { "fill-color": "#16a34a", "fill-opacity": ["interpolate", ["linear"], ["zoom"], 5, ["case", ["==", ["get", "s"], 1], 0.2, 0.13], 11, 0.07, 14, 0.03] }
    }, below);
    if (!map.getLayer("nat-pk-line")) map.addLayer({
      id: "nat-pk-line", type: "line", source: "nat-pk",
      paint: { "line-color": light ? "#15803d" : "#4ade80", "line-opacity": 0.55, "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 10, 1.4], "line-dasharray": [3, 2] }
    }, below);
    if (!map.getLayer("nat-pk-lbl")) map.addLayer({
      id: "nat-pk-lbl", type: "symbol", source: "nat-pk-lp", minzoom: 5,
      layout: {
        "symbol-sort-key": ["get", "k"],
        "icon-image": ["case", ["==", ["get", "s"], 1], "nat-park-s", "nat-park"],
        "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.75, 9, 1],
        "text-field": ["step", ["zoom"], ["case", ["==", ["get", "s"], 1], ["get", "nm"], ""], 7.6, ["get", "nm"]],
        "text-font": ["Noto Sans Bold"], "text-size": 11, "text-offset": [0, 1.25], "text-anchor": "top", "text-max-width": 9,
        "text-optional": true
      },
      paint: { "text-color": pkTxt, "text-halo-color": halo, "text-halo-width": 1.5 }
    });
    // วาดชั้นย่อยก่อน ชั้นที่ดังอยู่บนสุด (ได้ที่วางป้ายก่อน)
    TIERS.slice().reverse().forEach(function (T) {
      var id = "nat-t" + T[0];
      if (map.getLayer(id)) return;
      map.addLayer({
        id: id, type: "symbol", source: "nat-pts", minzoom: T[1],
        filter: ["==", ["get", "tier"], T[0]],
        layout: {
          "symbol-sort-key": ["get", "k"],
          "icon-image": T[0] === 0 ? ["concat", "nat-", ["get", "t"], "-s"] : ["concat", "nat-", ["get", "t"]],
          "icon-size": T[0] === 0 ? ["interpolate", ["linear"], ["zoom"], 4.5, 0.78, 8, 1] : ["interpolate", ["linear"], ["zoom"], 7, 0.78, 12, 1],
          "icon-padding": 1,
          "text-field": ["step", ["zoom"], "", T[2], ["get", "nm"]],
          "text-font": [T[0] === 0 ? "Noto Sans Bold" : "Noto Sans Regular"], "text-size": T[0] === 0 ? 12 : 11,
          "text-offset": [0, T[0] === 0 ? 1.35 : 1.1], "text-anchor": "top", "text-max-width": 8, "text-optional": true
        },
        paint: { "text-color": T[0] === 0 ? (light ? "#92400e" : "#fde68a") : txt, "text-halo-color": halo, "text-halo-width": 1.5 }
      });
    });
    applyFilters();
    bindHandlers();
  }
  function setVis(id, v) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", v ? "visible" : "none"); }
  function applyFilters() {
    if (!map) return;
    var showPts = active && type !== "park", showPk = active && (type === "all" || type === "park");
    PT_LAYERS.forEach(function (id) {
      var tier = +id.slice(5);
      setVis(id, showPts && (!starOnly || tier === 0));
      if (!map.getLayer(id)) return;
      var f = ["all", ["==", ["get", "tier"], tier]];
      if (type !== "all" && type !== "park") f.push(["==", ["get", "t"], type]);
      map.setFilter(id, f);
    });
    PK_LAYERS.forEach(function (id) {
      setVis(id, showPk);
      if (map.getLayer(id)) map.setFilter(id, starOnly ? ["==", ["get", "s"], 1] : null);
    });
  }

  /* ---------- การ์ด ---------- */
  function wikiUrl(w) {
    var m = String(w || "").match(/^(th|en):(.+)$/);
    return m ? "https://" + m[1] + ".wikipedia.org/wiki/" + encodeURIComponent(m[2].replace(/ /g, "_")) : "";
  }
  function osmUrl(id) {
    return id ? "https://www.openstreetmap.org/" + ({ n: "node", w: "way", r: "relation" }[id[0]] || "node") + "/" + id.slice(1) : "";
  }
  function photoHTML(ix) {
    var im = ix >= 0 && D.img[ix];
    if (!im) return "";
    return '<figure class="nat-ph"><a href="' + esc(im[3]) + '" target="_blank" rel="noopener"><img src="' + esc(im[0]) + '" alt="" loading="lazy" referrerpolicy="no-referrer"></a>' +
      '<figcaption>ภาพ: ' + esc(im[1]) + ' · ' + esc(im[2]) + ' · <a href="' + esc(im[3]) + '" target="_blank" rel="noopener">Wikimedia Commons</a></figcaption></figure>';
  }
  function where(prov, amp) {
    var p = D.prov[prov] || "";
    if (!amp) return p ? "จ." + p : "";
    return p === "กรุงเทพมหานคร" ? "เขต" + amp + " กรุงเทพฯ" : "อ." + amp + " จ." + p;
  }
  function pointHTML(i) {
    var r = D.p[i], t = D.types[r[2]], wk = wikiUrl(r[11]);
    var meta = [where(r[5], r[6])];
    if (r[8]) meta.push("สูง " + fmt(r[8]) + " ม. จากระดับทะเล");
    var nav = "https://www.google.com/maps/dir/?api=1&destination=" + r[1] + "," + r[0];
    return '<div class="nat-pop">' + photoHTML(r[12]) +
      '<div class="nat-h">' + ic(t[0], t[2]) + '<div><b>' + esc(r[3]) + '</b>' + (r[4] ? '<small>' + esc(r[4]) + '</small>' : "") + '</div></div>' +
      '<div class="nat-tags"><span style="--c:' + t[2] + '">' + esc(t[1]) + '</span>' + (r[7] === 0 ? '<span class="nat-starb">★ ที่เที่ยวยอดนิยม</span>' : "") + '</div>' +
      '<p class="nat-meta">' + esc(meta.filter(Boolean).join(" · ")) + '</p>' +
      (r[13] ? '<p class="nat-desc">' + esc(r[13]) + '</p>' : "") +
      '<div class="nat-acts"><a href="' + nav + '" target="_blank" rel="noopener">' + MD("navigation") + ' นำทาง</a>' +
      '<button type="button" data-nat-zoom="p' + i + '">' + MD("search") + ' ซูมไปดู</button>' +
      (wk ? '<a href="' + wk + '" target="_blank" rel="noopener">' + MD("book-open") + ' วิกิพีเดีย</a>' : "") + '</div>' +
      '<p class="nat-src">ตำแหน่ง: ' + (r[9] ? '<a href="' + osmUrl(r[9]) + '" target="_blank" rel="noopener">OpenStreetMap</a>' : "Wikidata") +
      (r[13] ? " · คำบรรยายโดยทีมเว็บ" : "") + ' · ก่อนไปเช็กเวลาเปิด–ปิดและประกาศปิดฤดูกาลกับกรมอุทยานฯ/หน่วยงานในพื้นที่</p></div>';
  }
  function parkHTML(i) {
    var k = D.parks[i], wk = wikiUrl(k[6]), t = typeRow("park");
    var provs = [].concat(k[2]).map(function (x) { return D.prov[x]; }).filter(Boolean);
    var meta = [provs.length ? "จ." + provs.join(" · จ.") : "", k[9] ? "พื้นที่ราว " + fmt(k[9]) + " ตร.กม." : ""];
    return '<div class="nat-pop">' + photoHTML(k[7]) +
      '<div class="nat-h">' + ic("park", t[2]) + '<div><b>' + esc(k[0]) + '</b>' + (k[1] ? '<small>' + esc(k[1]) + '</small>' : "") + '</div></div>' +
      '<div class="nat-tags"><span style="--c:' + t[2] + '">' + (/^วนอุทยาน/.test(k[0]) ? "วนอุทยาน" : "อุทยานแห่งชาติ") + '</span>' + (k[3] === 0 ? '<span class="nat-starb">★ ที่เที่ยวยอดนิยม</span>' : "") + '</div>' +
      '<p class="nat-meta">' + esc(meta.filter(Boolean).join(" · ")) + ' <span class="nat-note">(ขอบเขตจาก OSM โดยประมาณ)</span></p>' +
      (k[8] ? '<p class="nat-desc">' + esc(k[8]) + '</p>' : "") +
      '<div class="nat-acts"><button type="button" data-nat-zoom="k' + i + '">' + MD("search") + ' ดูทั้งอุทยาน</button>' +
      (wk ? '<a href="' + wk + '" target="_blank" rel="noopener">' + MD("book-open") + ' วิกิพีเดีย</a>' : "") + '</div>' +
      '<p class="nat-src">ขอบเขต: <a href="' + osmUrl(k[4]) + '" target="_blank" rel="noopener">OpenStreetMap</a>' + (k[8] ? " · คำบรรยายโดยทีมเว็บ" : "") +
      ' · ค่าเข้า/การจองที่พัก ดูที่กรมอุทยานแห่งชาติ สัตว์ป่า และพันธุ์พืช</p></div>';
  }
  function MD(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  /* การ์ดสถานที่ = แผ่นลอยนอกแผนที่ ไม่ใช่ป๊อปอัปบนแผนที่ — แถบเครื่องมือด้านบนสูงมาก (จอเตี้ย ๆ เหลือที่ว่างไม่ถึง 300px) ป๊อปอัปมีรูปล้นจอเสมอ
     จอใหญ่ = การ์ดชิดขวาใต้ส่วนหัว เลื่อนดูในตัว · มือถือ = แผ่นล่าง (bottom 116px ตามข้อตกลงแผงชั้นบนมือถือ) + ซ่อนแถบเครื่องมือชั่วคราวแบบ Google Maps
     ทั้งสองแบบมีวงไฮไลต์บอกตำแหน่ง แล้วเลื่อนแผนที่ให้วงไปอยู่กลางที่ว่าง */
  var sheet = null, mark = null;
  function small() { return window.innerWidth <= 760; }
  function closeCard() {
    if (sheet) sheet.classList.remove("open");
    document.body.classList.remove("nat-sheet-open");
    if (mark) { mark.remove(); mark = null; }
  }
  function openCard(kind, i, lngLat) {
    var ll = lngLat || (kind === "p" ? [D.p[i][0], D.p[i][1]] : null);
    if (!sheet) {
      sheet = document.createElement("div");
      sheet.id = "natSheet";
      sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-label", "รายละเอียดสถานที่");
      sheet.innerHTML = '<button type="button" class="nat-x" aria-label="ปิด">×</button><div class="nat-sb"></div>';
      document.body.appendChild(sheet);
      sheet.querySelector(".nat-x").addEventListener("click", closeCard);
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sheet.classList.contains("open")) closeCard(); });
    }
    var box = map.getContainer().getBoundingClientRect();
    sheet.style.setProperty("--nat-top", Math.round(box.top + 10) + "px");
    sheet.querySelector(".nat-sb").innerHTML = kind === "p" ? pointHTML(i) : parkHTML(i);
    sheet.scrollTop = 0;
    sheet.classList.add("open");
    if (small()) document.body.classList.add("nat-sheet-open");
    var img = sheet.querySelector(".nat-ph img");
    if (img) img.addEventListener("error", function () { var f = img.closest(".nat-ph"); if (f) f.remove(); });
    if (mark) mark.remove();
    var dot = document.createElement("div");
    dot.className = "nat-mark";
    mark = new maplibregl.Marker({ element: dot }).setLngLat(ll).addTo(map);
    var s = sheet.getBoundingClientRect(), x, y;
    if (small()) {
      var top = box.top + 24;
      x = box.left + box.width / 2;
      y = top < s.top - 50 ? (top + s.top) / 2 : s.top - 34;
    } else {
      // จอใหญ่: กลางพื้นที่ใต้แถบเครื่องมือ ทางซ้ายของการ์ด
      var tb = box.top, bar = $("#toolbarStack");
      if (bar) Array.prototype.forEach.call(bar.children, function (c) {
        var b = c.getBoundingClientRect();
        if (b.height && b.width > box.width * 0.4 && b.bottom < box.top + box.height * 0.7) tb = Math.max(tb, b.bottom);
      });
      x = (box.left + s.left) / 2;
      y = (tb + box.bottom) / 2;
    }
    map.easeTo({ center: ll, offset: [x - box.left - box.width / 2, y - box.top - box.height / 2], duration: 600 });
  }
  function zoomTo(code) {
    var kind = code[0], i = +code.slice(1);
    if (kind === "p") {
      var r = D.p[i];
      map.flyTo({ center: [r[0], r[1]], zoom: Math.max(map.getZoom(), r[2] === 3 /* island */ ? 12.5 : 14), pitch: 50, duration: 1800 });
    } else {
      var b = D.parks[i][10];
      map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 60, maxZoom: 12, pitch: 30, duration: 1800 });
    }
  }
  function bindHandlers() {
    if (bound) return;
    bound = true;
    var ptIds = function () { return PT_LAYERS.filter(function (id) { return map.getLayer(id); }); };
    map.on("click", function (e) {
      if (!active || !D) return;
      var p = e.point, box = [[p.x - 9, p.y - 9], [p.x + 9, p.y + 9]];
      var fs = map.queryRenderedFeatures(box, { layers: ptIds() });
      if (fs.length) { openCard("p", fs[0].properties.i); return; }
      var lb = map.getLayer("nat-pk-lbl") ? map.queryRenderedFeatures(box, { layers: ["nat-pk-lbl"] }) : [];
      if (lb.length) { openCard("k", lb[0].properties.i, lb[0].geometry.coordinates); return; }
      var pk = map.getLayer("nat-pk-fill") ? map.queryRenderedFeatures(e.point, { layers: ["nat-pk-fill"] }) : [];
      if (pk.length) openCard("k", pk[0].properties.i, e.lngLat);
      else if (sheet && sheet.classList.contains("open")) closeCard();
    });
    var hov = false;
    map.on("mousemove", function (e) {
      if (!active) return;
      var p = e.point, ids = ptIds().concat(map.getLayer("nat-pk-lbl") ? ["nat-pk-lbl"] : []);
      var h = map.queryRenderedFeatures([[p.x - 7, p.y - 7], [p.x + 7, p.y + 7]], { layers: ids }).length > 0;
      if (h !== hov) { hov = h; map.getCanvas().style.cursor = h ? "pointer" : ""; }
    });
    document.addEventListener("click", function (e) {
      var z = e.target.closest && e.target.closest("[data-nat-zoom]");
      if (z && D) zoomTo(z.getAttribute("data-nat-zoom"));
    });
  }

  /* ---------- ชิปย่อยในแถบไลฟ์สไตล์ ---------- */
  var CSS = [
    // ชิปประเภทขึ้นแถวที่ 2 ของแถบ (แถวแรกชิปหมวดเต็มแล้ว ถ้าต่อท้ายจะหลุดขอบจอ)
    "#natureChipsContainer{display:none}",
    "#brandFilterBar.nat-mode{flex-wrap:wrap;row-gap:6px}",
    "#brandFilterBar.nat-mode #natureChipsContainer{display:flex;order:5;flex:1 0 100%;min-width:0;padding-top:6px;border-top:1px solid var(--card-border)}",
    "#brandFilterBar.nat-mode .pin-mode-toggle{display:none}",
    "#brandFilterBar.nat-mode .category-chips-scroll{flex:1 1 0;min-width:0}",
    ".nat-chip b{font-weight:800;opacity:.62;font-variant-numeric:tabular-nums;font-size:10px}",
    ".nat-chip.active b{opacity:.85}",
    ".nat-ic{width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex:none;box-shadow:0 0 0 1.2px rgba(255,255,255,.85)}",
    ".nat-g{width:11px;height:11px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}",
    ".nat-sep{width:1px;height:18px;background:var(--card-border);flex:none;margin:0 2px}",
    ".nat-star-t{color:#b45309}.nat-star-t.active{background:#f59e0b!important;border-color:#f59e0b!important;color:#1f2937!important}",
    "[data-theme='dark'] .nat-star-t,[data-theme='sunset'] .nat-star-t{color:#fcd34d}",
    ".nat-pop{font-size:12px;line-height:1.5;min-width:230px}",
    ".nat-ph{margin:0;position:relative;background:rgba(127,127,127,.15)}",
    ".nat-ph img{display:block;width:100%;height:150px;object-fit:cover}",
    ".nat-ph figcaption{font-size:9.5px;line-height:1.35;padding:3px 10px 4px;opacity:.7;background:rgba(127,127,127,.08);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".nat-ph figcaption a{color:inherit}",
    ".nat-h{display:flex;gap:9px;align-items:flex-start;padding:11px 34px 0 13px}",
    ".nat-h .nat-ic{width:26px;height:26px;margin-top:1px}.nat-h .nat-g{width:15px;height:15px}",
    ".nat-h b{display:block;font-size:14px;line-height:1.3}.nat-h small{display:block;opacity:.66;font-size:11px}",
    ".nat-tags{display:flex;flex-wrap:wrap;gap:5px;padding:6px 13px 0}",
    ".nat-tags span{font-size:10.5px;font-weight:700;padding:1px 8px;border-radius:20px;border:1px solid var(--c,var(--card-border));color:var(--text-main);background:rgba(127,127,127,.08)}",
    ".nat-tags .nat-starb{border-color:#f59e0b;background:rgba(245,158,11,.16)}",
    ".nat-meta{margin:6px 13px 0;opacity:.8;font-size:11.5px}.nat-note{opacity:.7;font-size:10px}",
    ".nat-desc{margin:6px 13px 0;font-size:12px}",
    ".nat-acts{display:flex;gap:6px;padding:9px 13px 0;flex-wrap:wrap}",
    ".nat-acts a,.nat-acts button{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:6px 9px;border-radius:9px;background:rgba(127,127,127,.08);border:1px solid var(--card-border);color:var(--text-main);font:inherit;font-weight:700;font-size:11.5px;text-decoration:none;cursor:pointer;min-height:32px}",
    ".nat-acts a:first-child{background:var(--accent-soft);border-color:var(--accent)}",
    ".nat-acts a:hover,.nat-acts button:hover{border-color:var(--accent)}.nat-acts .mdico{width:13px;height:13px}",
    ".nat-src{margin:8px 13px 11px;font-size:9.5px;opacity:.6;line-height:1.45}.nat-src a{color:inherit}",
    "#natSheet{position:fixed;right:14px;top:var(--nat-top,140px);width:330px;max-height:calc(100vh - var(--nat-top,140px) - 24px);z-index:44;overflow:auto;overscroll-behavior:contain;display:none;background:var(--card-bg);color:var(--text-main);border:1px solid var(--card-border);border-radius:16px;box-shadow:0 14px 40px rgba(0,0,0,.4);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}",
    "#natSheet.open{display:block;animation:natUp .22s ease}@keyframes natUp{from{transform:translateY(14px);opacity:.4}to{transform:none;opacity:1}}",
    "#natSheet .nat-x{position:sticky;top:6px;float:right;margin:6px 6px -32px 0;z-index:2;width:30px;height:30px;border-radius:50%;border:0;background:rgba(15,23,42,.6);color:#fff;font-size:19px;line-height:28px;cursor:pointer}",
    "#natSheet .nat-pop{min-width:0}",
    "@media (max-width:760px){#natSheet{left:12px;right:12px;top:auto;bottom:116px;width:auto;max-height:min(58vh,470px)}#natSheet .nat-ph img{height:112px}}",
    "@media (max-width:760px){body.nat-sheet-open #toolbarStack{visibility:hidden}}",
    ".nat-mark{width:34px;height:34px;border-radius:50%;border:3px solid #fbbf24;box-shadow:0 0 0 4px rgba(251,191,36,.3),0 0 18px rgba(251,191,36,.6);pointer-events:none}"
  ].join("");

  function chipHTML() {
    var cnt = {}, stars = {}, total = 0, totalStar = 0;
    if (D) {
      D.p.forEach(function (r) { var k = D.types[r[2]][0]; cnt[k] = (cnt[k] || 0) + 1; if (r[7] === 0) { stars[k] = (stars[k] || 0) + 1; totalStar++; } total++; });
      cnt.park = D.parks.length; stars.park = D.parks.filter(function (k) { return k[3] === 0; }).length;
      total += cnt.park; totalStar += stars.park;
    }
    var n = function (k) { if (!D) return ""; var v = k === "all" ? (starOnly ? totalStar : total) : (starOnly ? stars[k] || 0 : cnt[k] || 0); return ' <b>' + fmt(v) + '</b>'; };
    var h = '<button type="button" class="brand-chip nat-chip' + (type === "all" ? " active" : "") + '" data-t="all">ทุกประเภท' + n("all") + '</button>';
    types().forEach(function (t) {
      h += '<button type="button" class="brand-chip nat-chip' + (type === t[0] ? " active" : "") + '" data-t="' + t[0] + '">' + ic(t[0], t[2]) + esc(t[1]) + n(t[0]) + '</button>';
    });
    h += '<span class="nat-sep"></span><button type="button" class="brand-chip nat-star-t' + (starOnly ? " active" : "") + '" data-a="star" title="แสดงเฉพาะที่เที่ยวยอดนิยมที่คัดไว้ พร้อมคำบรรยาย">★ เฉพาะที่ดัง</button>';
    return h;
  }
  function renderChips() { var w = $("#natureChipsContainer"); if (w) w.innerHTML = chipHTML(); }
  // ปุ่มในการ์ดใช้ไอคอนจาก sprite กลาง — "navigation" ไม่มีใน icons.js (bkk-ev.js เติมให้) จึงเติมเองเผื่อไว้
  function addSprite() {
    var sp = document.getElementById("mdico-sprite");
    if (!sp || document.getElementById("i-navigation")) return;
    var s = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
    s.setAttribute("id", "i-navigation"); s.setAttribute("viewBox", "0 0 24 24");
    s.innerHTML = '<polygon points="3 11 22 2 13 21 11 13 3 11"/>';
    sp.appendChild(s);
  }
  function buildUI() {
    if ($("#natureChipsContainer")) return;
    addSprite();
    var st = document.createElement("style");
    st.id = "natStyle"; st.textContent = CSS;
    document.head.appendChild(st);
    var bar = $("#brandFilterBar"), after = $("#brandChipsContainer");
    if (!bar) return;
    var w = document.createElement("div");
    w.className = "brand-chips-scroll nat-chips"; w.id = "natureChipsContainer";
    w.setAttribute("role", "toolbar"); w.setAttribute("aria-label", "ประเภทที่เที่ยวธรรมชาติ");
    if (after && after.parentNode === bar) bar.insertBefore(w, after.nextSibling); else bar.appendChild(w);
    w.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.getAttribute("data-a") === "star") { starOnly = !starOnly; lsSet(LS_STAR, starOnly ? "1" : "0"); }
      else { type = b.getAttribute("data-t") || "all"; lsSet(LS_TYPE, type); }
      renderChips();
      applyFilters();
      closeCard();
    });
    renderChips();
  }

  /* ---------- เปิด/ปิด ---------- */
  function setActive(on) {
    on = !!on;
    if (on === active) return;
    active = on;
    buildUI();
    var bar = $("#brandFilterBar");
    if (bar) bar.classList.toggle("nat-mode", on);
    if (!on) {
      closeCard();
      if (map) { applyFilters(); map.getCanvas().style.cursor = ""; }
      return;
    }
    if (!map) return;
    // ข้อมูลกระจายทั้งประเทศ — ถ้ายังซูมอยู่ในเมือง บินออกไปเห็นทั้งประเทศก่อน
    if (map.getZoom() > 7) {
      prevCam = { center: map.getCenter(), zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing() };
      var small = window.innerWidth <= 760;
      try { map.stop(); } catch (e) { }
      map.flyTo({ center: small ? [100.9, 12.6] : [100.75, 13.1], zoom: small ? 4.55 : 5.15, pitch: 0, bearing: 0, duration: 2200, essential: true });
    }
    ensureData().then(function () {
      renderChips();
      if (active) addLayers();
    }).catch(function (e) { console.warn("nature data:", e); });
  }
  function mount(m) {
    map = m;
    if (lsGet(LS_TYPE)) type = lsGet(LS_TYPE);
    if (type !== "all" && !GLYPH[type]) type = "all";
    starOnly = lsGet(LS_STAR) === "1";
    buildUI();
    if (active && D) addLayers();      // style โหลดใหม่ (สลับธีม) ล้างเลเยอร์ทิ้ง → ใส่คืน
  }

  window.BKK_NATURE_MAP = {
    mount: mount,
    setActive: setActive,
    isActive: function () { return active; },
    debug: function () { return { active: active, type: type, starOnly: starOnly, n: D ? D.p.length : 0, parks: D ? D.parks.length : 0, prevCam: prevCam }; }
  };
})();
