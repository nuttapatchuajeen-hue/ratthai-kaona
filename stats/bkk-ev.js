/**
 * bkk-ev.js
 * ชั้น "จุดชาร์จ EV" ของ bkk-city.html — สถานีชาร์จรถยนต์ไฟฟ้าแยกสีตามผู้ให้บริการ + หัวชาร์จ/กำลัง + จุดชาร์จใกล้ฉัน
 *
 * ข้อมูล: bkk-ev-data.js (window.BKK_EV) จาก _geo/build-bkk-ev.js ← OpenStreetMap (ODbL)
 *   ⚠ ต.ค. 2569 OSM มีจุดชาร์จในไทยแค่ราว 300 จุด จากของจริงหลายพันจุด → แผงบอกผู้ใช้ชัด ๆ และมีลิงก์ไปแผนที่ที่ครบกว่า
 *   แหล่งเปิดที่ครบกว่า (Open Charge Map) ต้องใช้คีย์ API — ยังไม่ได้ต่อ
 */
(function () {
  "use strict";

  var DATA_URL = "bkk-ev-data.js";
  var LS_KEY = "bkk-ev-on", LS_MIN = "bkk-ev-min", LS_OFF = "bkk-ev-off";
  var HOME = { center: [100.56, 13.76], zoom: 11.2 };
  var SOCK = [[1, "Type 2 (AC)"], [2, "CCS2 (DC)"], [4, "CHAdeMO (DC)"], [8, "GB/T"], [16, "อื่น ๆ"]];
  var LINKS = [
    ["https://www.plugshare.com", "PlugShare", "แผนที่จุดชาร์จที่ผู้ใช้ช่วยกันรายงาน — ครบกว่ามาก"],
    ["https://www.eaanywhere.com", "EA Anywhere", "เว็บผู้ให้บริการ"],
    ["https://www.egat.co.th", "กฟผ. (EleXA)", "เว็บผู้ให้บริการ"]
  ];
  var ZAP = "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z";

  var map = null, D = null, visible = false, uiBuilt = false, bound = false, loading = null, off = {}, popup = null;

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
    add("plug-zap", '<path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="m2 22 3-3"/><path d="M7.5 13.5 10 11"/><path d="M10.5 16.5 13 14"/><path d="m18 3-4 4h6l-4 4"/>');
    add("navigation", '<polygon points="3 11 22 2 13 21 11 13 3 11"/>');
    add("crosshair", '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>');
    add("external-link", '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>');
  }

  function loadScript(src) {
    return new Promise(function (ok, bad) {
      var s = document.createElement("script");
      s.src = src; s.async = true; s.onload = ok; s.onerror = function () { bad(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }
  function ensureData() {
    if (!loading) loading = (window.BKK_EV ? Promise.resolve() : loadScript(DATA_URL)).then(function () { D = window.BKK_EV; if (!D) throw new Error("no data"); });
    return loading;
  }
  function geo() {
    var f = [];
    D.s.forEach(function (r, i) {
      var o = D.ops[r[2]];
      if (off[o[0]]) return;
      f.push({ type: "Feature", geometry: { type: "Point", coordinates: [r[0], r[1]] }, properties: { i: i, o: o[0], c: o[2], dc: (r[6] & 6) ? 1 : 0 } });
    });
    return { type: "FeatureCollection", features: f };
  }
  function makeIcon(color) {
    var S = 2, R = 12, N = (R * 2 + 4) * S, cv = document.createElement("canvas");
    cv.width = cv.height = N;
    var g = cv.getContext("2d");
    g.scale(S, S);
    g.beginPath(); g.arc(R + 2, R + 2, R, 0, Math.PI * 2);
    g.fillStyle = color; g.fill();
    g.lineWidth = 1.6; g.strokeStyle = "rgba(255,255,255,.95)"; g.stroke();
    g.save(); g.translate(R + 2 - 8.4, R + 2 - 8.4); g.scale(0.7, 0.7);
    g.fillStyle = "#fff";
    try { g.fill(new Path2D(ZAP)); } catch (e) { }
    g.restore();
    return { width: N, height: N, data: g.getImageData(0, 0, N, N).data };
  }

  var LAYERS = ["ev-dot", "ev-ico"];
  function addLayers() {
    if (!map || !map.getStyle() || !D) return;
    D.ops.forEach(function (o) { if (!map.hasImage("ev-" + o[0])) map.addImage("ev-" + o[0], makeIcon(o[2]), { pixelRatio: 2 }); });
    if (map.getSource("ev-st")) map.getSource("ev-st").setData(geo());
    else map.addSource("ev-st", { type: "geojson", data: geo() });
    if (!map.getLayer("ev-dot")) map.addLayer({
      id: "ev-dot", type: "circle", source: "ev-st", maxzoom: 11,
      paint: { "circle-color": ["get", "c"], "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 3, 10.9, 5.5], "circle-stroke-color": "#fff", "circle-stroke-width": 1 }
    });
    if (!map.getLayer("ev-ico")) map.addLayer({
      id: "ev-ico", type: "symbol", source: "ev-st", minzoom: 11,
      layout: { "icon-image": ["concat", "ev-", ["get", "o"]], "icon-size": ["interpolate", ["linear"], ["zoom"], 11, 0.75, 15, 1], "icon-allow-overlap": true }
    });
    syncVis();
    bindHandlers();
  }
  function syncVis() {
    if (!map) return;
    LAYERS.forEach(function (id) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none"); });
  }

  function popupHTML(i) {
    var r = D.s[i], o = D.ops[r[2]], prov = D.prov[r[4]] || "";
    var where = [r[5] && (prov === "กรุงเทพมหานคร" ? "เขต" : "อ.") + r[5], prov].filter(Boolean).join(" ");
    var socks = SOCK.filter(function (s) { return r[6] & s[0]; }).map(function (s) { return s[1]; });
    var facts = [];
    if (socks.length) facts.push("หัวชาร์จ: " + socks.join(" · "));
    if (r[8]) facts.push("กำลังสูงสุด " + r[8] + " kW");
    if (r[7]) facts.push(r[7] + " ช่องจอด");
    if (r[11]) facts.push(r[11] === 1 ? "มีค่าบริการ" : "ฟรี");
    if (r[10]) facts.push("เวลาเปิด " + r[10]);
    var nav = "https://www.google.com/maps/dir/?api=1&destination=" + r[1] + "," + r[0];
    var osm = "https://www.openstreetmap.org/" + ({ n: "node", w: "way", r: "relation" }[r[9][0]] || "node") + "/" + r[9].slice(1);
    var sub = [r[3] ? o[1] : "", where].filter(Boolean).join(" · ");
    return '<div class="ev-pop"><div class="ev-h"><i style="background:' + o[2] + '"></i><div><b>' + esc(r[3] || o[1]) + '</b><small>' + esc(sub) + '</small></div></div>' +
      (facts.length ? '<ul class="ev-facts">' + facts.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join("") + '</ul>' : '<p class="ev-note">OSM ไม่ได้ระบุหัวชาร์จ/กำลังไฟ</p>') +
      '<div class="ev-acts"><a href="' + nav + '" target="_blank" rel="noopener">' + ico("navigation") + ' นำทาง</a></div>' +
      '<p class="ev-src">ข้อมูล: <a href="' + osm + '" target="_blank" rel="noopener">OpenStreetMap</a> — สถานะว่าง/เสีย ดูในแอปของผู้ให้บริการ</p></div>';
  }
  function openPopup(i, fly) {
    var r = D.s[i];
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ closeButton: true, maxWidth: "min(290px, calc(100vw - 24px))", className: "ev-popup", offset: 12 }).setLngLat([r[0], r[1]]).setHTML(popupHTML(i)).addTo(map);
    if (fly) map.flyTo({ center: [r[0], r[1]], zoom: Math.max(map.getZoom(), 14.5), duration: 1200 });
    var pn = $("#evPanel");
    if (pn && window.innerWidth <= 760) pn.classList.add("min");
  }
  function bindHandlers() {
    if (bound) return;
    bound = true;
    var ids = function () { return LAYERS.filter(function (id) { return map.getLayer(id); }); };
    map.on("click", function (e) {
      if (!visible) return;
      var p = e.point, fs = map.queryRenderedFeatures([[p.x - 7, p.y - 7], [p.x + 7, p.y + 7]], { layers: ids() });
      if (fs.length) openPopup(fs[0].properties.i);
    });
    var hov = false;
    map.on("mousemove", function (e) {
      if (!visible) return;
      var h = map.queryRenderedFeatures([[e.point.x - 6, e.point.y - 6], [e.point.x + 6, e.point.y + 6]], { layers: ids() }).length > 0;
      if (h !== hov) { hov = h; map.getCanvas().style.cursor = h ? "pointer" : ""; }
    });
  }
  function nearest(lon, lat, mine) {
    var out = $("#evNear");
    if (!out || !D) return;
    var list = D.s.map(function (r, i) { return { i: i, d: km(lon, lat, r[0], r[1]) }; })
      .filter(function (x) { return !off[D.ops[D.s[x.i][2]][0]]; })
      .sort(function (a, b) { return a.d - b.d; }).slice(0, 5);
    out.innerHTML = '<p class="ev-note">' + (mine ? "จากตำแหน่งของคุณ" : "จากกลางแผนที่") + ' · ระยะเส้นตรง · เฉพาะจุดที่มีใน OSM</p>' + list.map(function (x) {
      var r = D.s[x.i], o = D.ops[r[2]];
      var sub = [r[3] ? o[1] : "", r[8] ? r[8] + " kW" : ""].filter(Boolean).join(" · ");
      return '<button type="button" class="ev-row" data-i="' + x.i + '"><i style="background:' + o[2] + '"></i><span>' + esc(r[3] || o[1]) + (sub ? ' <small>' + esc(sub) + '</small>' : "") + '</span><em>' + fmtKm(x.d) + '</em></button>';
    }).join("");
    if (list.length) openPopup(list[0].i, true);
  }

  var CSS = [
    "#evPanel{position:absolute;z-index:43;right:14px;bottom:40px;width:320px;max-width:calc(100% - 28px);max-height:calc(100% - 120px);overflow:auto;display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.5}",
    "#evPanel.open{display:block;animation:elvIn .22s ease}",
    "#floodPanel.open~#evPanel.open{right:358px}",
    ".ev-ph{display:flex;align-items:center;gap:8px;padding:11px 12px 6px 14px;font-weight:800;font-size:13.5px;position:sticky;top:0;background:inherit;z-index:1}",
    ".ev-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".ev-ib .mdico{width:13px;height:13px}.ev-ph .ev-ib:first-of-type{margin-left:auto}",
    "#evPanel.min .ev-body{display:none}.ev-body{padding:0 14px 12px}",
    ".ev-warn{border-radius:10px;padding:7px 10px;margin:0 0 8px;font-size:11.5px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.45);line-height:1.45}",
    ".ev-ops{display:flex;flex-direction:column;gap:2px;margin-bottom:6px}",
    ".ev-op{display:flex;align-items:center;gap:8px;width:100%;padding:4px 6px;border:0;border-radius:8px;background:none;color:var(--text-main);font:inherit;font-size:12px;cursor:pointer;text-align:left}",
    ".ev-op:hover{background:var(--accent-soft)}.ev-op.off{opacity:.38}.ev-op span{flex:1}.ev-op b{font-variant-numeric:tabular-nums}",
    ".ev-op i,.ev-row i,.ev-h i{width:11px;height:11px;border-radius:50%;flex:none;box-shadow:0 0 0 1.5px rgba(255,255,255,.85)}",
    ".ev-sec{border-top:1px solid var(--card-border);padding:8px 0 4px}.ev-sec>b{display:flex;align-items:center;gap:6px;font-size:12.5px;margin-bottom:4px}",
    ".ev-btns{display:flex;gap:6px}.ev-btns button{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;border-radius:9px;border:1px solid var(--card-border);background:rgba(127,127,127,.07);color:var(--text-main);font:inherit;font-size:11.5px;font-weight:600;cursor:pointer}",
    ".ev-btns button:hover{border-color:var(--accent);background:var(--accent-soft)}.ev-btns .mdico{width:13px;height:13px}",
    ".ev-row{display:flex;align-items:center;gap:8px;width:100%;padding:5px 6px;border:0;border-radius:8px;background:none;color:var(--text-main);font:inherit;font-size:11.5px;cursor:pointer;text-align:left}",
    ".ev-row:hover{background:var(--accent-soft)}.ev-row span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ev-row small{opacity:.6}.ev-row em{font-style:normal;font-weight:700;font-variant-numeric:tabular-nums}",
    ".ev-link{display:flex;align-items:center;gap:8px;padding:6px 9px;border-radius:10px;border:1px solid var(--card-border);background:rgba(127,127,127,.07);color:var(--text-main);font-size:12px;font-weight:600;text-decoration:none;margin-top:4px}",
    ".ev-link:hover{border-color:var(--accent);background:var(--accent-soft)}.ev-link small{display:block;font-weight:500;opacity:.65;font-size:10.5px}.ev-link .mdico:last-child{margin-left:auto;opacity:.6}",
    ".ev-note{margin:4px 0;font-size:11px;opacity:.72;line-height:1.45}",
    ".ev-src{margin:8px 0 0;font-size:10px;opacity:.62;line-height:1.5}.ev-src a{color:inherit}",
    ".ev-popup .maplibregl-popup-content{background:var(--card-bg);color:var(--text-main);border:1px solid var(--card-border);border-radius:12px;padding:11px 13px 9px;box-shadow:0 10px 30px rgba(0,0,0,.3);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}",
    ".ev-popup .maplibregl-popup-tip{display:none}.ev-popup .maplibregl-popup-close-button{color:var(--text-muted);font-size:17px;right:4px;top:3px}",
    ".ev-pop{font-size:12px;line-height:1.5;min-width:220px}.ev-h{display:flex;gap:9px;align-items:flex-start;margin:0 16px 6px 0}.ev-h i{margin-top:4px}.ev-h b{display:block;font-size:13px}.ev-h small{opacity:.7}",
    ".ev-facts{margin:2px 0 0;padding-left:16px;font-size:11.5px}",
    ".ev-acts{display:flex;gap:6px;margin-top:8px}.ev-acts a{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;border-radius:9px;background:var(--accent-soft);border:1px solid var(--accent);color:var(--text-main);font-weight:700;font-size:11.5px;text-decoration:none}",
    ".ev-acts .mdico{width:13px;height:13px}",
    "@media (max-width:1100px){#floodPanel.open~#evPanel.open{right:14px;bottom:auto;top:130px;max-height:calc(100% - 180px)}}",
    "@media (max-width:760px){#evPanel,#floodPanel.open~#evPanel.open{top:auto;bottom:86px;right:14px;left:14px;width:auto;max-height:42vh}}"
  ].join("");

  function renderPanel() {
    var body = $("#evPanel .ev-body");
    if (!body) return;
    var h = '<div class="ev-warn"><b>ข้อมูลยังไม่ครบ</b> — OpenStreetMap มีจุดชาร์จในไทยแค่' + (D ? " " + D.s.length + " จุด" : "ราว 300 จุด") +
      ' จากของจริงหลายพันจุด ถ้าไม่เจอจุดใกล้คุณ ไม่ได้แปลว่าไม่มี — ดูแผนที่ที่ครบกว่าด้านล่าง</div>';
    if (!D) h += '<p class="ev-note">กำลังโหลด…</p>';
    else {
      var cnt = {};
      D.s.forEach(function (r) { var k = D.ops[r[2]][0]; cnt[k] = (cnt[k] || 0) + 1; });
      h += '<div class="ev-ops">' + D.ops.map(function (o) {
        return '<button type="button" class="ev-op' + (off[o[0]] ? " off" : "") + '" data-o="' + o[0] + '"><i style="background:' + o[2] + '"></i><span>' + esc(o[1]) + '</span><b>' + (cnt[o[0]] || 0) + '</b></button>';
      }).join("") + '</div>';
      h += '<div class="ev-sec"><b>' + ico("navigation") + ' จุดชาร์จใกล้ฉัน</b><div class="ev-btns">' +
        '<button type="button" data-a="near-me">' + ico("crosshair") + ' ตำแหน่งของฉัน</button>' +
        '<button type="button" data-a="near-center">' + ico("map-pin") + ' กลางแผนที่</button></div><div id="evNear"></div></div>';
    }
    h += '<div class="ev-sec"><b>' + ico("external-link") + ' แผนที่จุดชาร์จที่ครบกว่า</b>' + LINKS.map(function (l) {
      return '<a class="ev-link" href="' + l[0] + '" target="_blank" rel="noopener">' + ico("plug-zap") + '<span>' + esc(l[1]) + '<small>' + esc(l[2]) + '</small></span>' + ico("external-link") + '</a>';
    }).join("") + '</div>';
    h += '<p class="ev-src">จุดชาร์จ: OpenStreetMap (ODbL)' + (D && D.osm ? " ณ " + esc(String(D.osm).slice(0, 10)) : "") + ' · สีตามผู้ให้บริการ (ไม่ใช้โลโก้) · สถานะว่าง/เสียและราคาดูในแอปของผู้ให้บริการ</p>';
    body.innerHTML = h;
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    addIcons();
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnEvToggle")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "menu-btn"; b.id = "btnEvToggle";
      b.title = "เปิด/ปิดจุดชาร์จรถยนต์ไฟฟ้า (ข้อมูล OpenStreetMap — ยังไม่ครบ)";
      b.innerHTML = '<span>' + ico("plug-zap") + '</span><span class="label-text"> จุดชาร์จ EV</span>';
      b.addEventListener("click", function () { setVisible(!visible); });
      menu.appendChild(b);
    }
    if (!$("#evPanel")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var p = document.createElement("div");
      p.id = "evPanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "จุดชาร์จรถยนต์ไฟฟ้า");
      p.innerHTML = '<div class="ev-ph">' + ico("plug-zap") + ' จุดชาร์จ EV' +
        '<button type="button" class="ev-ib" data-a="min" title="ย่อ/ขยาย">' + ico("minus") + '</button>' +
        '<button type="button" class="ev-ib" data-a="close" title="ปิดชั้นนี้">×</button></div><div class="ev-body"></div>';
      if (lsGet(LS_MIN) === "1") p.classList.add("min");
      var fl = $("#floodPanel");
      if (fl && fl.parentNode === stage) stage.insertBefore(p, fl.nextSibling); else stage.appendChild(p);
      p.addEventListener("click", function (e) {
        var a = e.target.closest("[data-a]");
        if (a) {
          var act = a.dataset.a;
          if (act === "close") return setVisible(false);
          if (act === "min") { var m = !p.classList.contains("min"); p.classList.toggle("min", m); lsSet(LS_MIN, m ? "1" : "0"); return; }
          if (act === "near-center") { var c = map.getCenter(); nearest(c.lng, c.lat, false); return; }
          if (act === "near-me") {
            if (!navigator.geolocation) { var o1 = $("#evNear"); if (o1) o1.innerHTML = '<p class="ev-note">เบราว์เซอร์นี้หาตำแหน่งไม่ได้</p>'; return; }
            navigator.geolocation.getCurrentPosition(function (pos) { nearest(pos.coords.longitude, pos.coords.latitude, true); },
              function () { var o2 = $("#evNear"); if (o2) o2.innerHTML = '<p class="ev-note">ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง — ลอง "กลางแผนที่" แทน</p>'; },
              { timeout: 10000, maximumAge: 60000 });
            return;
          }
        }
        var o = e.target.closest("[data-o]");
        if (o) {
          if (off[o.dataset.o]) delete off[o.dataset.o]; else off[o.dataset.o] = 1;
          lsSet(LS_OFF, JSON.stringify(off));
          if (map.getSource("ev-st")) map.getSource("ev-st").setData(geo());
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
    var b = $("#btnEvToggle"), p = $("#evPanel");
    if (b) b.classList.toggle("active", visible);
    if (p) p.classList.toggle("open", visible);
  }
  function setVisible(v) {
    visible = !!v;
    lsSet(LS_KEY, visible ? "1" : "0");
    syncButtons();
    if (!visible) {
      if (popup) { popup.remove(); popup = null; }
      syncVis();
      return;
    }
    renderPanel();
    ensureData().then(function () { if (!visible) return; addLayers(); renderPanel(); }).catch(function (e) { console.warn("ev data:", e); });
    var c = map.getCenter();
    if (c.lng < 97 || c.lng > 106 || c.lat < 5 || c.lat > 21) map.flyTo(Object.assign({ duration: 1600 }, HOME));
  }
  function mount(m) {
    map = m;
    try { off = JSON.parse(lsGet(LS_OFF) || "{}") || {}; } catch (e) { off = {}; }
    buildUI();
    if (lsGet(LS_KEY) === "1" && !visible) { setVisible(true); return; }
    if (visible && D) addLayers();
  }

  window.BKK_EVMAP = {
    mount: mount,
    setVisible: setVisible,
    debug: function () { return { visible: visible, n: D ? D.s.length : 0, off: off }; }
  };
})();
