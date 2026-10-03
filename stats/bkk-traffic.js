/**
 * bkk-traffic.js
 * ชั้น "จราจรสด" ของ bkk-city.html — ความเร็วรถเทียบกับตอนถนนโล่ง + จุดเกิดเหตุ/ปิดถนน (ภาพจาก TomTom ผ่าน /api/traffic)
 *
 * - คีย์ TomTom อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น (TOMTOM_KEY บน Vercel / ~/.tomtom-key ในเครื่อง) — เบราว์เซอร์ไม่เห็นคีย์
 * - ภาพแผ่นละ 512 px วางเหนือเส้นถนนแต่ใต้ป้ายชื่อและตึก 3 มิติ · รีเฟรชทุก 5 นาทีด้วยการเปลี่ยนพารามิเตอร์ t ใน URL (CDN แคช 5 นาทีพอดี)
 *   (แผ่น 256 px เปิดดูหนึ่งจอกิน ~150 แผ่น — โควตาฟรีหมดเร็ว)
 * - โควตาฟรี 200,000 แผ่น/เดือน → โหลดเฉพาะตอนเปิดชั้น และไม่ขอภาพซูมต่ำกว่า 6
 */
(function () {
  "use strict";

  var REMOTE = "https://ratthai-kaona.vercel.app";
  var LS_KEY = "bkk-traffic-on", LS_INC = "bkk-traffic-inc", LS_MIN = "bkk-traffic-min";
  var REFRESH_MS = 300000;
  var HOME = { center: [100.54, 13.75], zoom: 12.2 };

  var map = null, visible = false, uiBuilt = false, inc = true, timer = null, stamp = 0, err = null, probe = null;

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function dark() { return document.documentElement.getAttribute("data-theme") !== "light"; }
  function base() {
    var h = location.hostname;
    return h === "localhost" || h === "127.0.0.1" || h === "ratthai-kaona.vercel.app" ? "/api/traffic" : REMOTE + "/api/traffic";
  }
  function tiles(k) {
    var s = k === "inc" ? (dark() ? "s0-dark" : "s0") : (dark() ? "relative0-dark" : "relative0");
    return [base() + "?k=" + k + "&s=" + s + "&t=" + stamp + "&z={z}&x={x}&y={y}"];
  }

  function addIcons() {
    var sp = document.getElementById("mdico-sprite");
    if (!sp) return;
    var add = function (id, body) {
      if (document.getElementById("i-" + id)) return;
      var s = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
      s.setAttribute("id", "i-" + id); s.setAttribute("viewBox", "0 0 24 24");
      s.innerHTML = body;
      sp.appendChild(s);
    };
    add("gauge", '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>');
  }

  /* ================================================================ ชั้นแผนที่ */
  // วางเหนือเส้นถนนเส้นสุดท้ายของแผนที่ฐาน (ไม่งั้นเส้นถนนทับสีจราจรหมด) แต่ใต้ป้ายชื่อที่ตามมา — แบบเดียวกับ bkk-3d-host.js
  function firstSymbol() {
    var ls = map.getStyle().layers || [], lastLine = -1, i;
    for (i = 0; i < ls.length; i++) if (ls[i].source === "openmaptiles" && ls[i].type === "line") lastLine = i;
    for (i = lastLine + 1; i < ls.length; i++) if (ls[i].type === "symbol") return ls[i].id;
    return undefined;
  }
  function addLayers() {
    if (!map || !map.getStyle()) return;
    stamp = Math.floor(Date.now() / REFRESH_MS);
    // ใต้ป้ายชื่อของแผนที่ฐาน และใต้ฉาก 3 มิติ/ตึก 3 มิติ (สีถนนต้องไม่ทับตึก)
    var before = map.getLayer("bkk-3d-world") ? "bkk-3d-world" : firstSymbol() || (map.getLayer("city-buildings-3d") ? "city-buildings-3d" : undefined);
    [["traffic-flow", "flow"], ["traffic-inc", "inc"]].forEach(function (L) {
      if (!map.getSource(L[0])) map.addSource(L[0], {
        type: "raster", tiles: tiles(L[1]), tileSize: 512, minzoom: 5, maxzoom: 17,
        attribution: '<a href="https://www.tomtom.com" target="_blank" rel="noopener">จราจร © TomTom</a>'
      });
      if (!map.getLayer(L[0])) map.addLayer({
        id: L[0], type: "raster", source: L[0], minzoom: 6,
        paint: { "raster-opacity": L[1] === "flow" ? 0.9 : 1, "raster-fade-duration": 0 }
      }, before);
    });
    syncVis();
  }
  function syncVis() {
    if (!map) return;
    if (map.getLayer("traffic-flow")) map.setLayoutProperty("traffic-flow", "visibility", visible ? "visible" : "none");
    if (map.getLayer("traffic-inc")) map.setLayoutProperty("traffic-inc", "visibility", visible && inc ? "visible" : "none");
  }
  function refresh() {
    if (!visible || !map) return;
    stamp = Math.floor(Date.now() / REFRESH_MS);
    ["flow", "inc"].forEach(function (k) {
      var src = map.getSource("traffic-" + k);
      if (src && src.setTiles) src.setTiles(tiles(k));
    });
    renderPanel();
  }
  // ตรวจครั้งเดียวว่าเซิร์ฟเวอร์มีคีย์ (ไม่มีคีย์ = 503) จะได้บอกผู้ใช้แทนการแสดงแผนที่เปล่า
  function check() {
    if (probe) return probe;
    probe = fetch(base() + "?k=flow&s=relative0&z=10&x=797&y=472&t=" + Math.floor(Date.now() / REFRESH_MS))
      .then(function (r) {
        if (r.ok) { err = null; return; }
        return r.json().catch(function () { return {}; }).then(function (j) {
          err = j && j.error === "no-key" ? "ยังไม่ได้ตั้งคีย์ TomTom บนเซิร์ฟเวอร์" : "ดึงข้อมูลจราจรไม่สำเร็จ (" + r.status + ")";
        });
      })
      .catch(function () { err = "เชื่อมต่อบริการจราจรไม่ได้"; })
      .then(function () { probe = null; renderPanel(); });
    return probe;
  }

  /* ================================================================ แผง */
  var CSS = [
    "#trafficPanel{position:absolute;z-index:43;right:14px;bottom:40px;width:300px;max-width:calc(100% - 28px);display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.5}",
    "#trafficPanel.open{display:block;animation:elvIn .22s ease}",
    "#floodPanel.open~#trafficPanel.open{right:358px}",
    ".tf-ph{display:flex;align-items:center;gap:8px;padding:11px 12px 6px 14px;font-weight:800;font-size:13.5px}",
    ".tf-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".tf-ib .mdico{width:13px;height:13px}.tf-ph .tf-ib:first-of-type{margin-left:auto}",
    "#trafficPanel.min .tf-body{display:none}.tf-body{padding:0 14px 12px}",
    ".tf-scale{height:10px;border-radius:999px;margin:4px 0 3px;background:linear-gradient(90deg,#16a34a 0%,#84cc16 30%,#facc15 50%,#f97316 70%,#dc2626 88%,#7f1d1d 100%)}",
    ".tf-sl{display:flex;justify-content:space-between;font-size:10.5px;color:var(--text-muted)}",
    ".tf-row{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:12px;cursor:pointer}",
    ".tf-row input{accent-color:var(--accent);width:16px;height:16px}",
    ".tf-stat{margin:6px 0 0;font-size:11px;color:var(--text-muted)}.tf-err{color:#f87171}",
    ".tf-src{margin:8px 0 0;font-size:10px;opacity:.62;line-height:1.5}.tf-src a{color:inherit}",
    "@media (max-width:1100px){#floodPanel.open~#trafficPanel.open{right:14px;bottom:auto;top:130px}}",
    "@media (max-width:760px){#trafficPanel,#floodPanel.open~#trafficPanel.open{top:auto;bottom:116px;right:14px;left:14px;width:auto}}"
  ].join("");

  function renderPanel() {
    var body = $("#trafficPanel .tf-body");
    if (!body) return;
    var t = new Date(stamp * REFRESH_MS).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" });
    body.innerHTML =
      '<div class="tf-scale"></div><div class="tf-sl"><span>ไหลคล่อง</span><span>ชะลอ</span><span>ติดขัด</span><span>ติดหนัก/ปิด</span></div>' +
      '<label class="tf-row"><input type="checkbox" id="tfInc"' + (inc ? " checked" : "") + '> แสดงจุดเกิดเหตุ ก่อสร้าง ปิดถนน</label>' +
      (err ? '<p class="tf-stat tf-err">' + err + '</p>' : '<p class="tf-stat">สีถนน = ความเร็วตอนนี้เทียบกับตอนถนนโล่ง · อัปเดตอัตโนมัติทุก 5 นาที (รอบล่าสุด ' + t + ' น.)</p>') +
      '<p class="tf-src">ข้อมูลจราจร © <a href="https://www.tomtom.com" target="_blank" rel="noopener">TomTom</a> (คำนวณจากข้อมูลการเดินทางของผู้ใช้อุปกรณ์/แอปที่ส่งข้อมูลให้ TomTom) · ซอยเล็กอาจไม่มีข้อมูล</p>';
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    addIcons();
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnTrafficToggle")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "menu-btn"; b.id = "btnTrafficToggle";
      b.title = "เปิด/ปิดจราจรสด — สีถนนตามความเร็วรถตอนนี้ + จุดเกิดเหตุ/ปิดถนน (TomTom)";
      b.innerHTML = '<span>' + ico("gauge") + '</span><span class="label-text"> จราจรสด</span>';
      b.addEventListener("click", function () { setVisible(!visible); });
      menu.appendChild(b);
    }
    if (!$("#trafficPanel")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var p = document.createElement("div");
      p.id = "trafficPanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "จราจรสด");
      p.innerHTML = '<div class="tf-ph">' + ico("gauge") + ' จราจรสด' +
        '<button type="button" class="tf-ib" data-a="min" title="ย่อ/ขยาย">' + ico("minus") + '</button>' +
        '<button type="button" class="tf-ib" data-a="close" title="ปิดชั้นนี้">×</button></div><div class="tf-body"></div>';
      if (lsGet(LS_MIN) === "1") p.classList.add("min");
      var fl = $("#floodPanel");
      if (fl && fl.parentNode === stage) stage.insertBefore(p, fl.nextSibling); else stage.appendChild(p);
      p.addEventListener("click", function (e) {
        var a = e.target.closest("[data-a]");
        if (!a) return;
        if (a.dataset.a === "close") return setVisible(false);
        if (a.dataset.a === "min") { var m = !p.classList.contains("min"); p.classList.toggle("min", m); lsSet(LS_MIN, m ? "1" : "0"); }
      });
      p.addEventListener("change", function (e) {
        if (e.target.id === "tfInc") { inc = e.target.checked; lsSet(LS_INC, inc ? "1" : "0"); syncVis(); }
      });
    }
    syncButtons();
  }
  function syncButtons() {
    var b = $("#btnTrafficToggle"), p = $("#trafficPanel");
    if (b) b.classList.toggle("active", visible);
    if (p) p.classList.toggle("open", visible);
  }

  function setVisible(v) {
    visible = !!v;
    lsSet(LS_KEY, visible ? "1" : "0");
    syncButtons();
    clearInterval(timer);
    if (!visible) { syncVis(); return; }
    addLayers();
    renderPanel();
    check();
    timer = setInterval(function () { if (!document.hidden) refresh(); }, REFRESH_MS);
    var c = map.getCenter();
    if (c.lng < 97 || c.lng > 106 || c.lat < 5 || c.lat > 21) map.flyTo(Object.assign({ duration: 1600 }, HOME));
  }

  /* ================================================================ mount — เรียกซ้ำทุกครั้งที่เปลี่ยนสไตล์แผนที่ (สลับธีม = สไตล์สีภาพเปลี่ยนตาม) */
  function mount(m) {
    map = m;
    inc = lsGet(LS_INC) !== "0";
    buildUI();
    if (lsGet(LS_KEY) === "1" && !visible) { setVisible(true); return; }
    if (visible) addLayers();
  }

  window.BKK_TRAFFIC = {
    mount: mount,
    setVisible: setVisible,
    debug: function () { return { visible: visible, inc: inc, err: err, stamp: stamp, tiles: tiles("flow")[0] }; }
  };
})();
