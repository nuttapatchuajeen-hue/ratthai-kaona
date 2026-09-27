/**
 * bkk-fuel.js
 * ชั้น "ปั๊มน้ำมัน" ของ bkk-city.html — ปั๊มทั่วประเทศ + ราคาน้ำมันวันนี้/พรุ่งนี้ + กราฟย้อนหลัง + เทียบแบรนด์ + ปั๊มถูกสุดใกล้ฉัน
 *
 * ข้อมูล
 *   - bkk-fuel-data.js (window.BKK_FUEL) จาก _geo/build-bkk-fuel.js ← OpenStreetMap (ODbL) ~8,700 ปั๊ม
 *     ⚠ ปั๊มจริงทั่วไทยมีราว 2.7 หมื่นแห่ง — OSM ยังขาดอีกมาก โดยเฉพาะปั๊มอิสระต่างจังหวัด
 *   - /api/fuel: ราคาวันนี้ทุกแบรนด์ (กทม.และปริมณฑล) · ราคาพรุ่งนี้จากบางจาก · ราคา ปตท. รายอำเภอ · ราคา ปตท. ย้อนหลัง
 *   - ⚠ ไม่มีแหล่งเปิดที่บอกราคา "รายปั๊ม" → ราคาในการ์ดคือราคาประกาศของแบรนด์
 *     ต่างจังหวัด: ปตท. ใช้ราคารายอำเภอจริง · แบรนด์อื่น = ราคา กทม. ของแบรนด์ + ส่วนต่างค่าขนส่งของ ปตท. ในอำเภอนั้น (ประมาณ ขึ้นต้นด้วย ≈)
 *   - สถานะ "น้ำมันหมด" ไม่มีข้อมูลเปิด → ปุ่มลิงก์ไป Thai Pump Radar (ประชาชนช่วยกันรายงาน) ตรงพิกัดปั๊ม
 */
(function () {
  "use strict";

  var DATA_URL = "bkk-fuel-data.js";
  var REMOTE = "https://ratthai-kaona.vercel.app";
  var LS_KEY = "bkk-fuel-on", LS_FUEL = "bkk-fuel-type", LS_OFF = "bkk-fuel-brand-off", LS_MIN = "bkk-fuel-min";
  var PUMP_RADAR = "https://www.thaipumpradar.com/";
  var VICINITY = { "กรุงเทพมหานคร": 1, "นนทบุรี": 1, "ปทุมธานี": 1, "สมุทรปราการ": 1 };   // ใช้ราคาประกาศ กทม.และปริมณฑล
  var FUELS = [
    ["b7", "ดีเซล", "ดีเซล B7"], ["gh95", "95", "แก๊สโซฮอล์ 95"], ["gh91", "91", "แก๊สโซฮอล์ 91"], ["e20", "E20", "แก๊สโซฮอล์ E20"],
    ["b20", "B20", "ดีเซล B20"], ["e85", "E85", "แก๊สโซฮอล์ E85"], ["g95", "เบนซิน", "เบนซิน 95"], ["pd", "ดีเซลพรีเมียม", "ดีเซลพรีเมียม"],
    ["pg", "95 พรีเมียม", "แก๊สโซฮอล์พรีเมียม"]
  ];
  var FNAME = {};
  FUELS.forEach(function (f) { FNAME[f[0]] = f[2]; });
  FNAME.ngv = "NGV";
  var FUEL_BITS = [[1, "ดีเซล"], [2, "แก๊สโซฮอล์ 95"], [4, "แก๊สโซฮอล์ 91"], [8, "E20"], [16, "E85"], [32, "เบนซิน 95"], [64, "LPG"], [128, "NGV"]];
  var SHORT = { ptt: "PTT", bcp: "BCP", shell: "SHELL", caltex: "CALTEX", pt: "PT", susco: "SUSCO", pure: "PURE", cosmo: "COSMO", gas: "LPG", other: "" };
  var HOME = { center: [100.54, 13.75], zoom: 12.6, pitch: 0, bearing: 0 };

  var map = null, D = null, visible = false, uiBuilt = false, handlersBound = false, loading = null;
  var fuel = "b7", brandOff = {}, price = null, priceErr = null, hist = null, histErr = null;
  var provData = {}, provBusy = {}, popup = null, near = null, refreshTimer = null;

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function baht(n) { return n == null ? "–" : Number(n).toFixed(2); }
  function sign(n) { return (n > 0 ? "+" : n < 0 ? "−" : "±") + Math.abs(n).toFixed(2); }
  function thDate(iso) {
    var d = new Date(iso);
    return isNaN(d) ? String(iso || "") : d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
  }
  function km(a, b, c, d) {
    var R = 6371, x = (c - a) * Math.PI / 180 * Math.cos((b + d) / 2 * Math.PI / 180), y = (d - b) * Math.PI / 180;
    return R * Math.sqrt(x * x + y * y);
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
    add("fuel", '<line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>');
    add("navigation", '<polygon points="3 11 22 2 13 21 11 13 3 11"/>');
    add("crosshair", '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>');
    add("external-link", '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>');
  }

  /* ================================================================ ดึงข้อมูล */
  function apiList(q) {
    var h = location.hostname, local = h === "localhost" || h === "127.0.0.1" || h === "ratthai-kaona.vercel.app";
    return local ? ["/api/fuel" + q, REMOTE + "/api/fuel" + q] : [REMOTE + "/api/fuel" + q];
  }
  function getJSON(urls) {
    var i = 0;
    var next = function (err) {
      if (i >= urls.length) return Promise.reject(err || new Error("no source"));
      return fetch(urls[i++], { cache: "no-cache" }).then(function (r) {
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
  function ensureData() {
    if (!loading) loading = (window.BKK_FUEL ? Promise.resolve() : loadScript(DATA_URL)).then(function () { D = window.BKK_FUEL; });
    return loading;
  }
  function loadPrice() {
    return getJSON(apiList("")).then(function (j) { price = j; priceErr = null; })
      .catch(function (e) { priceErr = String(e.message || e); })
      .then(function () { rebuild(); renderPanel(); });
  }
  function loadHist() {
    if (hist || histErr) return;
    getJSON(apiList("?hist=90")).then(function (j) { hist = j; }).catch(function (e) { histErr = String(e.message || e); }).then(renderPanel);
  }
  function loadProv(prov) {
    if (!prov || VICINITY[prov] || provData[prov] || provBusy[prov]) return;
    provBusy[prov] = 1;
    getJSON(apiList("?prov=" + encodeURIComponent(prov))).then(function (j) {
      provData[prov] = j;
      rebuild();
      var c = $(".fu-popup");
      if (c && popup && popup._fuIdx != null) popup.setHTML(card(popup._fuIdx));
      if (near) findNear(near.lon, near.lat, near.mine);
    }).catch(function () { provData[prov] = { loc: {}, failed: true }; })
      .then(function () { delete provBusy[prov]; });
  }
  // โหลดราคารายอำเภอของจังหวัดที่อยู่ในจอ (ซูมใกล้พอ)
  function loadVisibleProvs() {
    if (!visible || !D || map.getZoom() < 9) return;
    var b = map.getBounds(), w = b.getWest(), e = b.getEast(), s = b.getSouth(), n = b.getNorth(), seen = {}, list = [];
    for (var i = 0; i < D.s.length; i++) {
      var r = D.s[i];
      if (r[0] < w || r[0] > e || r[1] < s || r[1] > n || r[4] < 0) continue;
      var p = D.prov[r[4]];
      if (!seen[p]) { seen[p] = 1; list.push(p); }
    }
    list.slice(0, 6).forEach(loadProv);
  }

  /* ================================================================ ราคา */
  function brandCode(r) { return D.brands[r[2]][0]; }
  function locPrice(prov, amp) {
    var pd = provData[prov];
    if (!pd || !pd.loc) return null;
    return pd.loc[amp] || pd.loc["เมือง" + prov] || pd.loc[Object.keys(pd.loc)[0]] || null;
  }
  // ราคาโดยประมาณของปั๊ม r สำหรับน้ำมัน f → { p, kind: "bkk"|"loc"|"est"|"bkk-only" }
  function est(r, f) {
    if (!price) return null;
    var b = brandCode(r), bp = price.brands[b] && price.brands[b][f];
    if (bp == null) return null;
    var prov = D.prov[r[4]];
    if (!prov || VICINITY[prov]) return { p: bp, kind: "bkk" };
    var lp = locPrice(prov, r[5]);
    if (!lp) return { p: bp, kind: "bkk-only" };
    if (b === "ptt" && REGULAR[f] && lp[f] != null) return { p: lp[f], kind: "loc" };
    var off = offset(lp);
    if (off == null) return { p: bp, kind: "bkk-only" };
    return { p: +(bp + off).toFixed(2), kind: "est" };
  }
  // ส่วนต่างค่าขนส่งของอำเภอ = มัธยฐานของ (ราคาอำเภอ − ราคา กทม.) ของ ปตท. เฉพาะน้ำมันพื้นฐาน
  // (น้ำมันพรีเมียมรายอำเภอกับ กทม. อาจเป็นคนละเกรด เช่น X99 กับ GSH95 — ห้ามเอามาเทียบตรง ๆ)
  var REGULAR = { b7: 1, b20: 1, gh95: 1, gh91: 1, e20: 1, e85: 1, g95: 1 };
  function offset(lp) {
    var d = [], P = price.brands.ptt || {};
    for (var k in REGULAR) if (lp[k] != null && P[k] != null) d.push(lp[k] - P[k]);
    if (!d.length) return null;
    d.sort(function (a, b) { return a - b; });
    return d[Math.floor(d.length / 2)];
  }
  function cheapestBrandPrice() {
    var m = Infinity;
    if (!price) return m;
    for (var b in price.brands) if (price.brands[b][fuel] != null && !brandOff[b]) m = Math.min(m, price.brands[b][fuel]);
    return m;
  }

  /* ================================================================ GeoJSON + ชั้นแผนที่ */
  function geo() {
    var f = [], cheap = cheapestBrandPrice();
    // ไฮไลต์เฉพาะเมื่อแบรนด์ที่ถูกสุดเป็นส่วนน้อย — ถ้าเกือบทุกแบรนด์ราคาเท่ากัน ไฮไลต์ทั้งแผนที่ก็ไม่มีความหมาย
    if (price) {
      var n = 0, at = 0;
      for (var k in price.brands) if (price.brands[k][fuel] != null && !brandOff[k]) { n++; if (price.brands[k][fuel] <= cheap + 0.001) at++; }
      if (at > n / 2) cheap = -1;
    }
    if (!D) return { type: "FeatureCollection", features: f };
    for (var i = 0; i < D.s.length; i++) {
      var r = D.s[i], b = D.brands[r[2]], code = b[0];
      if (brandOff[code]) continue;
      var e = est(r, fuel), lbl = SHORT[code] || "";
      var bp = price && price.brands[code] && price.brands[code][fuel];
      if (e) lbl += (lbl ? "\n" : "") + (e.kind === "est" || e.kind === "bkk-only" ? "≈" : "") + baht(e.p);
      f.push({
        type: "Feature", geometry: { type: "Point", coordinates: [r[0], r[1]] },
        properties: { i: i, c: b[2], l: lbl, ch: bp != null && bp <= cheap + 0.001 ? 1 : 0, hp: e ? 1 : 0 }
      });
    }
    return { type: "FeatureCollection", features: f };
  }
  function rebuild() { var s = map && map.getSource("fuel-st"); if (s && D) s.setData(geo()); }
  function addLayers() {
    if (!map || !map.getStyle() || !D) return;
    if (!map.getSource("fuel-st")) map.addSource("fuel-st", { type: "geojson", data: geo() });
    if (!map.getLayer("fuel-st")) map.addLayer({
      id: "fuel-st", type: "circle", source: "fuel-st",
      layout: { "circle-sort-key": ["get", "ch"] },
      paint: {
        "circle-color": ["get", "c"],
        "circle-opacity": ["case", ["==", ["get", "hp"], 1], 1, 0.7],
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 1.6, 9, 3, 12, 5.5, 15, 8],
        "circle-stroke-color": ["case", ["==", ["get", "ch"], 1], "#facc15", "rgba(255,255,255,.85)"],
        "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 5, 0.3, 11, ["case", ["==", ["get", "ch"], 1], 2.4, 1.2]]
      }
    });
    if (!map.getLayer("fuel-lbl")) map.addLayer({
      id: "fuel-lbl", type: "symbol", source: "fuel-st", minzoom: 13.2,
      layout: {
        "text-field": ["get", "l"], "text-font": ["Noto Sans Bold"], "text-size": 10.5, "text-offset": [0, 1.25], "text-anchor": "top",
        "text-line-height": 1.1, "symbol-sort-key": ["-", 1, ["get", "ch"]], "text-padding": 1
      },
      paint: { "text-color": ["case", ["==", ["get", "ch"], 1], "#facc15", "#e5edf7"], "text-halo-color": "rgba(8,12,22,.92)", "text-halo-width": 1.6 }
    });
    syncVis();
  }
  function syncVis() {
    ["fuel-st", "fuel-lbl"].forEach(function (id) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none"); });
  }

  /* ================================================================ การ์ดปั๊ม */
  function card(i) {
    var r = D.s[i], b = D.brands[r[2]], code = b[0], prov = D.prov[r[4]] || "";
    var fuels = FUEL_BITS.filter(function (x) { return r[6] & x[0]; }).map(function (x) { return x[1]; });
    var bp = price && price.brands[code];
    var rows = "";
    if (bp) {
      var anyEst = false;
      FUELS.concat([["ngv"]]).forEach(function (f) {
        var e = est(r, f[0]);
        if (!e) return;
        var approx = e.kind === "est" || e.kind === "bkk-only";
        if (approx) anyEst = true;
        rows += '<div class="fu-row' + (f[0] === fuel ? " on" : "") + '"><span>' + esc(FNAME[f[0]]) + '</span><b>' + (approx ? "≈ " : "") + baht(e.p) + '</b></div>';
      });
      var note = VICINITY[prov] || !prov ? "ราคาประกาศของแบรนด์ (กทม.และปริมณฑล)" :
        code === "ptt" && locPrice(prov, r[5]) ? "ราคาทางการของ ปตท. อ." + esc(r[5]) :
        locPrice(prov, r[5]) ? "≈ ราคา กทม. ของแบรนด์ + ส่วนต่างค่าขนส่งใน อ." + esc(r[5]) + " (อิงราคา ปตท.)" :
        provBusy[prov] ? "กำลังโหลดราคาในจังหวัด…" : "≈ ราคา กทม. — ต่างจังหวัดมักแพงกว่าเล็กน้อยตามค่าขนส่ง";
      rows = '<div class="fu-prices">' + rows + '</div><p class="fu-note">' + note + (anyEst ? " · ปั๊มแต่ละแห่งอาจตั้งราคาต่างจากนี้" : "") + '</p>';
    } else if (code === "gas") {
      rows = '<p class="fu-note">ปั๊มแก๊ส LPG/NGV — ไม่มีราคาน้ำมันประกาศ</p>';
    } else {
      rows = '<p class="fu-note">ไม่มีราคาประกาศของแบรนด์นี้ (ปั๊มอิสระตั้งราคาเอง)</p>';
    }
    var nav = "https://www.google.com/maps/dir/?api=1&destination=" + r[1] + "," + r[0];
    var pr = PUMP_RADAR + "?lat=" + r[1] + "&lon=" + r[0];
    var osm = "https://www.openstreetmap.org/" + ({ n: "node", w: "way", r: "relation" }[r[7][0]] || "node") + "/" + r[7].slice(1);
    return '<div class="fu-pop"><div class="fu-h"><i class="fu-dot" style="background:' + b[2] + '"></i><div><b>' + esc(r[3] || b[1]) + '</b>' +
      '<small>' + esc(r[3] ? b[1] + " · " : "") + esc([r[5] && (prov === "กรุงเทพมหานคร" ? "เขต" : "อ.") + r[5], prov].filter(Boolean).join(" ")) + '</small></div></div>' +
      rows +
      (fuels.length ? '<p class="fu-note">ชนิดที่มีตาม OSM: ' + esc(fuels.join(" · ")) + '</p>' : "") +
      (r[8] ? '<p class="fu-note">เวลาเปิด: ' + esc(r[8]) + '</p>' : "") +
      '<div class="fu-acts"><a href="' + nav + '" target="_blank" rel="noopener">' + ico("navigation") + ' นำทาง</a>' +
      '<a href="' + pr + '" target="_blank" rel="noopener" title="ดูรายงานจากผู้ใช้ว่าปั๊มนี้น้ำมันหมดหรือไม่ (Thai Pump Radar)">' + ico("fuel") + ' เช็กน้ำมันหมด</a></div>' +
      '<p class="fu-src">พิกัด: <a href="' + osm + '" target="_blank" rel="noopener">OpenStreetMap</a> · สถานะน้ำมันหมด: Thai Pump Radar (ผู้ใช้รายงาน)</p></div>';
  }
  function openCard(i, fly) {
    var r = D.s[i];
    loadProv(D.prov[r[4]]);
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ closeButton: true, maxWidth: "310px", className: "fu-popup", offset: 10 }).setLngLat([r[0], r[1]]).setHTML(card(i)).addTo(map);
    popup._fuIdx = i;
    if (fly) map.flyTo({ center: [r[0], r[1]], zoom: Math.max(map.getZoom(), 15), duration: 1200 });
  }
  function bindHandlers() {
    if (handlersBound) return;
    handlersBound = true;
    map.on("click", function (e) {
      if (!visible || !map.getLayer("fuel-st")) return;
      var p = e.point, fs = map.queryRenderedFeatures([[p.x - 5, p.y - 5], [p.x + 5, p.y + 5]], { layers: ["fuel-st"] });
      if (!fs.length) return;
      // ชั้นฝน/น้ำท่วมเปิดการ์ดของมันเองอยู่แล้ว — ถ้ามีจุดของชั้นนั้นตรงนี้ให้มันได้ก่อน
      var others = ["flood-hub", "flood-wl", "flood-rain"].filter(function (id) { return map.getLayer(id) && map.getLayoutProperty(id, "visibility") !== "none"; });
      if (others.length && map.queryRenderedFeatures([[p.x - 4, p.y - 4], [p.x + 4, p.y + 4]], { layers: others }).length) return;
      openCard(fs[0].properties.i);
    });
    var hov = false;
    map.on("mousemove", function (e) {
      if (!visible || !map.getLayer("fuel-st")) return;
      var h = map.queryRenderedFeatures([[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]], { layers: ["fuel-st"] }).length > 0;
      if (h !== hov) { hov = h; map.getCanvas().style.cursor = h ? "pointer" : ""; }
    });
    map.on("moveend", function () { clearTimeout(bindHandlers._t); bindHandlers._t = setTimeout(loadVisibleProvs, 400); });
  }

  /* ================================================================ ปั๊มถูกสุดใกล้ฉัน */
  function findNear(lon, lat, mine) {
    near = { lon: lon, lat: lat, mine: mine, list: [] };
    var R = 8, cand = [];
    for (var i = 0; i < D.s.length; i++) {
      var r = D.s[i];
      if (Math.abs(r[1] - lat) > 0.08 || Math.abs(r[0] - lon) > 0.09 || brandOff[brandCode(r)]) continue;
      var d = km(lon, lat, r[0], r[1]);
      if (d > R) continue;
      var e = est(r, fuel);
      if (e) cand.push([i, d, e]);
    }
    cand.sort(function (a, b) { return a[2].p - b[2].p || a[1] - b[1]; });
    near.list = cand.slice(0, 6);
    near.total = cand.length;
    // ต่างจังหวัด: โหลดราคารายอำเภอก่อน แล้วคำนวณใหม่อัตโนมัติ
    var provs = {};
    cand.forEach(function (c) { provs[D.prov[D.s[c[0]][4]]] = 1; });
    Object.keys(provs).forEach(loadProv);
    renderPanel();
  }

  /* ================================================================ แผงควบคุม */
  var CSS = [
    "#fuelPanel{position:absolute;z-index:43;right:14px;bottom:40px;width:330px;max-width:calc(100% - 28px);max-height:calc(100% - 120px);overflow:auto;display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.5}",
    "#fuelPanel.open{display:block;animation:elvIn .22s ease}",
    "#floodPanel.open~#fuelPanel.open{right:358px}",
    ".fu-ph{display:flex;align-items:center;gap:8px;padding:11px 12px 6px 14px;font-weight:800;font-size:13.5px;position:sticky;top:0;background:inherit;z-index:1}",
    ".fu-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".fu-ib .mdico{width:13px;height:13px}.fu-ph .fu-ib:first-of-type{margin-left:auto}",
    "#fuelPanel.min .fu-body{display:none}",
    ".fu-body{padding:0 14px 12px}",
    ".fu-alert{border-radius:10px;padding:8px 10px;margin:2px 0 8px;font-size:12px;background:rgba(127,127,127,.1);border:1px solid var(--card-border)}",
    ".fu-alert.up{background:rgba(239,68,68,.14);border-color:rgba(239,68,68,.5)}.fu-alert.down{background:rgba(34,197,94,.13);border-color:rgba(34,197,94,.5)}",
    ".fu-alert b{display:block;font-size:12.5px}.fu-alert ul{margin:3px 0 0;padding-left:16px}.fu-alert small{opacity:.7}",
    ".fu-up{color:#ef4444;font-weight:700}.fu-down{color:#22c55e;font-weight:700}",
    ".fu-chips{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 8px}",
    ".fu-chip{padding:4px 9px;border-radius:999px;border:1px solid var(--card-border);background:none;color:var(--text-muted);font:inherit;font-size:11.5px;cursor:pointer}",
    ".fu-chip.on{background:var(--accent-soft);color:var(--text-main);border-color:var(--accent);font-weight:700}",
    ".fu-sec{border-top:1px solid var(--card-border);padding:8px 0 6px}.fu-sec>b{display:flex;align-items:center;gap:6px;font-size:12.5px;margin-bottom:4px}.fu-sec>b small{margin-left:auto;font-weight:500;opacity:.6;font-size:10.5px}",
    ".fu-br{display:flex;align-items:center;gap:8px;width:100%;padding:4px 6px;border:0;border-radius:8px;background:none;color:var(--text-main);font:inherit;font-size:12px;cursor:pointer;text-align:left}",
    ".fu-br:hover{background:var(--accent-soft)}.fu-br.off{opacity:.38}.fu-br span{flex:1}.fu-br b{font-variant-numeric:tabular-nums}.fu-br em{font-style:normal;font-size:10.5px;opacity:.65;width:48px;text-align:right}",
    ".fu-br.cheap b{color:#facc15}",
    ".fu-dot{display:inline-block;width:11px;height:11px;border-radius:50%;box-shadow:0 0 0 1.5px rgba(255,255,255,.85);flex:none}",
    ".fu-chart{width:100%;height:92px;display:block}.fu-chart text{font-size:9px;fill:var(--text-muted)}",
    ".fu-cs{display:flex;justify-content:space-between;font-size:11px;opacity:.8}",
    ".fu-near{display:flex;gap:6px;margin:2px 0 6px}.fu-near button{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;border-radius:9px;border:1px solid var(--card-border);background:rgba(127,127,127,.07);color:var(--text-main);font:inherit;font-size:11.5px;font-weight:600;cursor:pointer}",
    ".fu-near button:hover{border-color:var(--accent);background:var(--accent-soft)}",
    ".fu-nr{display:flex;align-items:center;gap:8px;width:100%;padding:5px 6px;border:0;border-radius:8px;background:none;color:var(--text-main);font:inherit;font-size:11.5px;cursor:pointer;text-align:left}",
    ".fu-nr:hover{background:var(--accent-soft)}.fu-nr span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fu-nr b{font-variant-numeric:tabular-nums}.fu-nr em{font-style:normal;opacity:.6;font-size:10.5px;width:44px;text-align:right}",
    ".fu-link{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:10px;border:1px solid var(--card-border);background:rgba(127,127,127,.07);color:var(--text-main);font-size:12px;font-weight:600;text-decoration:none;margin-top:4px}",
    ".fu-link:hover{border-color:var(--accent);background:var(--accent-soft)}.fu-link small{display:block;font-weight:500;opacity:.65;font-size:10.5px}.fu-link .mdico:last-child{margin-left:auto;opacity:.6}",
    ".fu-src{margin:8px 0 0;font-size:10px;opacity:.6;line-height:1.5}.fu-src a{color:inherit}",
    ".fu-note{margin:4px 0 0;font-size:11px;opacity:.72;line-height:1.45}",
    ".fu-popup .maplibregl-popup-content{background:var(--card-bg);color:var(--text-main);border:1px solid var(--card-border);border-radius:12px;padding:11px 13px 9px;box-shadow:0 10px 30px rgba(0,0,0,.3);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}",
    ".fu-popup .maplibregl-popup-tip{display:none}.fu-popup .maplibregl-popup-close-button{color:var(--text-muted);font-size:17px;right:4px;top:3px}",
    ".fu-pop{font-size:12px;line-height:1.5;min-width:230px}.fu-h{display:flex;gap:9px;align-items:flex-start;margin:0 16px 6px 0}.fu-h .fu-dot{margin-top:4px}.fu-h b{display:block;font-size:13px}.fu-h small{opacity:.68}",
    ".fu-prices{display:grid;grid-template-columns:1fr auto;gap:0 12px}.fu-row{display:contents}.fu-row span{opacity:.75}.fu-row b{text-align:right;font-variant-numeric:tabular-nums}",
    ".fu-row.on span,.fu-row.on b{color:var(--accent);opacity:1;font-weight:800}",
    ".fu-acts{display:flex;gap:6px;margin-top:8px}.fu-acts a{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;border-radius:9px;background:var(--accent-soft);border:1px solid var(--accent);color:var(--text-main);font-weight:700;font-size:11.5px;text-decoration:none}",
    ".fu-acts .mdico{width:13px;height:13px}",
    ".fu-pop .fu-src{margin-top:6px}",
    "@media (max-width:1100px){#floodPanel.open~#fuelPanel.open{right:14px;bottom:auto;top:130px;max-height:calc(100% - 180px)}}",
    "@media (max-width:760px){#fuelPanel,#floodPanel.open~#fuelPanel.open{top:auto;bottom:86px;right:14px;left:14px;width:auto;max-height:42vh}}"
  ].join("");

  function alertHTML() {
    if (!price) return "";
    var t = price.tomorrow || [], ch = t.filter(function (x) { return Math.abs(x[3] - x[2]) >= 0.005; });
    var last = t.filter(function (x) { return x[4] != null && Math.abs(x[2] - x[4]) >= 0.005; });
    if (ch.length) {
      var up = ch.some(function (x) { return x[3] > x[2]; }), dn = ch.some(function (x) { return x[3] < x[2]; });
      return '<div class="fu-alert ' + (up && !dn ? "up" : !up && dn ? "down" : "") + '"><b>' + (up && !dn ? "⚠ พรุ่งนี้ราคาขึ้น" : !up && dn ? "พรุ่งนี้ราคาลง" : "พรุ่งนี้มีการปรับราคา") + ' (05:00 น.)</b><ul>' +
        ch.map(function (x) {
          var d = x[3] - x[2];
          return '<li>' + esc(FNAME[x[0]] || x[1]) + ' <span class="' + (d > 0 ? "fu-up" : "fu-down") + '">' + sign(d) + '</span> → ' + baht(x[3]) + ' บาท</li>';
        }).join("") + '</ul><small>ตามประกาศบางจาก — แบรนด์อื่นมักปรับตามในวันเดียวกัน</small></div>';
    }
    var s = '<div class="fu-alert"><b>พรุ่งนี้ยังไม่มีประกาศปรับราคา</b><small>' + esc(price.bcpNote || "") + '</small>';
    if (last.length) s += '<br><small>ปรับครั้งล่าสุด: ' + last.map(function (x) {
      var d = x[2] - x[4];
      return esc(FNAME[x[0]] || x[1]) + ' <span class="' + (d > 0 ? "fu-up" : "fu-down") + '">' + sign(d) + '</span>';
    }).join(" · ") + '</small>';
    return s + '</div>';
  }
  function brandsHTML() {
    if (!price) return '<p class="fu-note">' + (priceErr ? "โหลดราคาไม่สำเร็จ: " + esc(priceErr) : "กำลังโหลดราคา…") + '</p>';
    var list = [];
    D.brands.forEach(function (b) {
      var p = price.brands[b[0]] && price.brands[b[0]][fuel];
      list.push([b, p]);
    });
    list.sort(function (a, b) { return (a[1] == null) - (b[1] == null) || (a[1] || 0) - (b[1] || 0); });
    var min = cheapestBrandPrice();
    return list.map(function (x) {
      var b = x[0], p = x[1], off = brandOff[b[0]];
      return '<button type="button" class="fu-br' + (off ? " off" : "") + (p != null && p <= min + 0.001 ? " cheap" : "") + '" data-b="' + b[0] + '" title="กดเพื่อซ่อน/แสดงปั๊มแบรนด์นี้บนแผนที่">' +
        '<i class="fu-dot" style="background:' + b[2] + '"></i><span>' + esc(b[1]) + '</span><b>' + (p != null ? baht(p) : '<small style="opacity:.5;font-weight:500">ไม่มีราคา</small>') + '</b>' +
        '<em>' + (p != null && min < Infinity ? (p - min < 0.005 ? "ถูกสุด" : "+" + (p - min).toFixed(2)) : "") + '</em></button>';
    }).join("");
  }
  function chartHTML() {
    if (histErr) return '<p class="fu-note">โหลดราคาย้อนหลังไม่สำเร็จ</p>';
    if (!hist) return '<p class="fu-note">กำลังโหลดราคาย้อนหลัง…</p>';
    var pts = hist.series.filter(function (s) { return s[1][fuel] != null; }).map(function (s) { return [s[0], s[1][fuel]]; });
    if (pts.length < 2) return '<p class="fu-note">ไม่มีราคาย้อนหลังของชนิดนี้จาก ปตท.</p>';
    var W = 300, H = 92, L = 30, R = 6, T = 8, B = 16;
    var ys = pts.map(function (p) { return p[1]; }), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    if (y1 - y0 < 0.5) { var m = (y0 + y1) / 2; y0 = m - 0.25; y1 = m + 0.25; }
    var X = function (i) { return L + (W - L - R) * i / (pts.length - 1); }, Y = function (v) { return T + (H - T - B) * (1 - (v - y0) / (y1 - y0)); };
    // เส้นขั้นบันได — ราคาน้ำมันเปลี่ยนเป็นขั้น ๆ ตามวันประกาศ
    var d = "M" + X(0).toFixed(1) + "," + Y(pts[0][1]).toFixed(1);
    for (var i = 1; i < pts.length; i++) d += "H" + X(i).toFixed(1) + "V" + Y(pts[i][1]).toFixed(1);
    var first = pts[0][1], last = pts[pts.length - 1][1], diff = last - first;
    var svg = '<svg class="fu-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="กราฟราคา ' + esc(FNAME[fuel]) + ' ย้อนหลัง">' +
      '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(y1) + '" y2="' + Y(y1) + '" stroke="currentColor" stroke-opacity=".12"/>' +
      '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(y0) + '" y2="' + Y(y0) + '" stroke="currentColor" stroke-opacity=".12"/>' +
      '<text x="' + (L - 4) + '" y="' + (Y(y1) + 3) + '" text-anchor="end">' + y1.toFixed(2) + '</text>' +
      '<text x="' + (L - 4) + '" y="' + (Y(y0) + 3) + '" text-anchor="end">' + y0.toFixed(2) + '</text>' +
      '<path d="' + d + '" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="' + X(pts.length - 1) + '" cy="' + Y(last) + '" r="3" fill="var(--accent)"/>' +
      '<text x="' + L + '" y="' + (H - 3) + '">' + esc(thDate(pts[0][0])) + '</text>' +
      '<text x="' + (W - R) + '" y="' + (H - 3) + '" text-anchor="end">' + esc(thDate(pts[pts.length - 1][0])) + '</text></svg>';
    return svg + '<div class="fu-cs"><span>ปตท. · ' + hist.days + ' วัน</span><span>' + baht(first) + ' → <b>' + baht(last) + '</b> <span class="' + (diff > 0 ? "fu-up" : diff < 0 ? "fu-down" : "") + '">(' + sign(diff) + ')</span></span></div>';
  }
  function nearHTML() {
    var h = '<div class="fu-near"><button type="button" data-a="near-center">' + ico("crosshair") + ' ใกล้กลางแผนที่</button>' +
      '<button type="button" data-a="near-me">' + ico("navigation") + ' ใช้ตำแหน่งฉัน</button></div>';
    if (!near) return h + '<p class="fu-note">หาปั๊มที่ราคา ' + esc(FNAME[fuel]) + ' ถูกที่สุดในรัศมี 8 กม.</p>';
    if (near.err) return h + '<p class="fu-note">' + esc(near.err) + '</p>';
    if (!near.list.length) return h + '<p class="fu-note">ไม่พบปั๊มที่มีราคาในรัศมี 8 กม. (ข้อมูลปั๊มใน OSM ยังไม่ครบ)</p>';
    return h + near.list.map(function (c) {
      var r = D.s[c[0]], b = D.brands[r[2]], approx = c[2].kind === "est" || c[2].kind === "bkk-only";
      return '<button type="button" class="fu-nr" data-i="' + c[0] + '"><i class="fu-dot" style="background:' + b[2] + '"></i><span>' + esc(r[3] || b[1]) + '</span>' +
        '<b>' + (approx ? "≈" : "") + baht(c[2].p) + '</b><em>' + c[1].toFixed(1) + ' กม.</em></button>';
    }).join("") + '<p class="fu-note">' + (near.mine ? "จากตำแหน่งของคุณ" : "จากกลางแผนที่") + ' · ' + near.total + ' ปั๊มในรัศมี · เรียงราคาก่อนแล้วระยะทาง</p>';
  }
  function renderPanel() {
    var p = $("#fuelPanel");
    if (!p || !visible) return;
    var body = p.querySelector(".fu-body");
    var h = alertHTML();
    h += '<div class="fu-chips">' + FUELS.map(function (f) {
      return '<button type="button" class="fu-chip' + (f[0] === fuel ? " on" : "") + '" data-f="' + f[0] + '">' + esc(f[1]) + '</button>';
    }).join("") + '</div>';
    if (D) h += '<div class="fu-sec"><b>' + ico("fuel") + ' เทียบราคา ' + esc(FNAME[fuel]) + '<small>บาท/ลิตร · กทม.และปริมณฑล</small></b>' + brandsHTML() + '</div>';
    h += '<div class="fu-sec"><b>' + ico("trending-up") + ' ราคาย้อนหลัง<small>' + esc(FNAME[fuel]) + '</small></b>' + chartHTML() + '</div>';
    if (D) h += '<div class="fu-sec"><b>' + ico("navigation") + ' ปั๊มถูกสุดใกล้ฉัน</b>' + nearHTML() + '</div>';
    h += '<a class="fu-link" href="' + PUMP_RADAR + '" target="_blank" rel="noopener">' + ico("fuel") + '<span>ปั๊มไหนน้ำมันหมด? — Thai Pump Radar<small>ประชาชนช่วยกันรายงานสถานะปั๊มแบบเรียลไทม์</small></span>' + ico("external-link") + '</a>';
    h += '<p class="fu-src">' + (D ? "ปั๊ม " + D.s.length.toLocaleString("th-TH") + " แห่งจาก OpenStreetMap (ยังไม่ครบทุกปั๊ม) · " : "") +
      'ราคา: ปตท. และบางจาก (ทางการ) · แบรนด์อื่นจาก api.chnwt.dev (รวบรวมโดยบุคคลทั่วไป)' +
      (price && price.date ? " · ราคามีผล " + esc(thDate(price.date)) : "") +
      '<br>ราคาในแผนที่คือราคาประกาศของแบรนด์ ไม่ใช่ราคาที่ตู้จ่ายของแต่ละปั๊ม · ≈ = ประมาณจากส่วนต่างค่าขนส่งในอำเภอนั้น</p>';
    body.innerHTML = h;
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    addIcons();
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnFuelToggle")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "menu-btn"; b.id = "btnFuelToggle";
      b.title = "เปิด/ปิดชั้นปั๊มน้ำมัน — ปั๊มทั่วประเทศ ราคาวันนี้/พรุ่งนี้ เทียบแบรนด์ และปั๊มถูกสุดใกล้ฉัน";
      b.innerHTML = '<span>' + ico("fuel") + '</span><span class="label-text"> ปั๊มน้ำมัน</span>';
      b.addEventListener("click", function () { setVisible(!visible); });
      menu.appendChild(b);
    }
    if (!$("#fuelPanel")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var p = document.createElement("div");
      p.id = "fuelPanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "ปั๊มน้ำมันและราคา");
      p.innerHTML = '<div class="fu-ph">' + ico("fuel") + ' ปั๊มน้ำมัน & ราคา' +
        '<button type="button" class="fu-ib" data-a="min" title="ย่อ/ขยาย">' + ico("minus") + '</button>' +
        '<button type="button" class="fu-ib" data-a="close" title="ปิดชั้นนี้">×</button></div><div class="fu-body"></div>';
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
          if (act === "near-center") { var c = map.getCenter(); findNear(c.lng, c.lat, false); return; }
          if (act === "near-me") {
            if (!navigator.geolocation) { near = { err: "เบราว์เซอร์นี้หาตำแหน่งไม่ได้", list: [] }; renderPanel(); return; }
            navigator.geolocation.getCurrentPosition(function (pos) {
              var lo = pos.coords.longitude, la = pos.coords.latitude;
              map.flyTo({ center: [lo, la], zoom: Math.max(map.getZoom(), 13.5), duration: 1400 });
              findNear(lo, la, true);
            }, function () { near = { err: "ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง — ลองกด \"ใกล้กลางแผนที่\" แทน", list: [] }; renderPanel(); }, { timeout: 10000, maximumAge: 60000 });
            return;
          }
        }
        var f = e.target.closest("[data-f]");
        if (f) { fuel = f.dataset.f; lsSet(LS_FUEL, fuel); rebuild(); if (near && near.list) findNear(near.lon, near.lat, near.mine); else renderPanel(); return; }
        var br = e.target.closest("[data-b]");
        if (br) {
          var k = br.dataset.b;
          if (brandOff[k]) delete brandOff[k]; else brandOff[k] = 1;
          lsSet(LS_OFF, JSON.stringify(brandOff));
          rebuild();
          if (near && near.list) findNear(near.lon, near.lat, near.mine); else renderPanel();
          return;
        }
        var n = e.target.closest("[data-i]");
        if (n) openCard(+n.dataset.i, true);
      });
    }
    syncButtons();
  }
  function syncButtons() {
    var b = $("#btnFuelToggle"), p = $("#fuelPanel");
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
      syncVis();
      return;
    }
    renderPanel();
    ensureData().then(function () {
      if (!visible) return;
      addLayers();
      bindHandlers();
      renderPanel();
      loadVisibleProvs();
    }).catch(function (e) { priceErr = "โหลดข้อมูลปั๊มไม่สำเร็จ"; renderPanel(); console.warn("fuel data:", e); });
    if (!price || Date.now() - price.now > 30 * 60000) loadPrice();
    loadHist();
    refreshTimer = setInterval(function () { if (!document.hidden) loadPrice(); }, 30 * 60000);
    var c = map.getCenter();
    if (c.lng < 97 || c.lng > 106 || c.lat < 5 || c.lat > 21) map.flyTo(Object.assign({ duration: 1600 }, HOME));
  }

  /* ================================================================ mount — เรียกซ้ำทุกครั้งที่เปลี่ยนสไตล์แผนที่ */
  function mount(m) {
    map = m;
    var f = lsGet(LS_FUEL);
    if (f && FNAME[f]) fuel = f;
    try { brandOff = JSON.parse(lsGet(LS_OFF) || "{}") || {}; } catch (e) { brandOff = {}; }
    buildUI();
    if (lsGet(LS_KEY) === "1" && !visible) { setVisible(true); return; }
    if (visible && D) addLayers();
  }

  window.BKK_FUELMAP = {
    mount: mount,
    setVisible: setVisible,
    debug: function () {
      return {
        visible: visible, stations: D ? D.s.length : 0, fuel: fuel, brands: price ? Object.keys(price.brands) : null, priceErr: priceErr,
        tomorrow: price ? price.tomorrow : null, hist: hist ? hist.series.length : 0, provs: Object.keys(provData), near: near && near.list ? near.list.length : null
      };
    }
  };
})();
