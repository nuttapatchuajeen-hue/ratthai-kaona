/**
 * bkk-menu-cats.js
 * แท็บหมวดของแถบปุ่มชั้นข้อมูล (#leftMenu) ใน bkk-city.html — ทั้งหมด · เมือง · คมนาคม · ภัยพิบัติ & สิ่งแวดล้อม
 *
 * - ปุ่มส่วนใหญ่ถูกโมดูลแต่ละชั้นเติมเข้า #leftMenu ทีหลัง (menu.appendChild) → ใช้ MutationObserver
 *   จัดหมวดให้ทุกปุ่มที่โผล่มาใหม่ ไม่ต้องแก้โมดูลใดเลย
 * - DOM ของ #leftMenu ยังแบนเหมือนเดิม จัดแถวด้วย CSS order: แถวแรก = แท็บ + เครื่องมือ (ทัวร์โดรน/บินไปโซน/ย่อแถบ)
 *   แถวสอง = ปุ่มชั้นของหมวดที่เลือก
 * - ซ่อนด้วยคลาส .lmc-hide (!important) จึงไม่ชนกับ style.display ที่โมดูลใช้ซ่อนปุ่มย่อยตอนชั้นหลักปิด
 * - ปุ่มที่ไม่อยู่ในรายการ (ชั้นใหม่ที่ยังไม่ได้จัดหมวด) แสดงทุกแท็บ จะได้ไม่หายไปเงียบ ๆ
 * - ตัวเลขบนแท็บ = จำนวนชั้นที่เปิดอยู่ในหมวดนั้น (นับเฉพาะปุ่มชั้นหลัก ไม่นับปุ่มย่อย/ปุ่มเปิดแผง)
 */
(function () {
  "use strict";

  var LS_KEY = "bkk-menu-cat";
  var DEFAULT_CAT = "city";

  var CATS = [
    { id: "all", icon: "layers", label: "ทั้งหมด", short: "ทั้งหมด" },
    { id: "city", icon: "building-2", label: "เมือง", short: "เมือง" },
    { id: "move", icon: "train-front", label: "คมนาคม", short: "คมนาคม" },
    { id: "hazard", icon: "triangle-alert", label: "ภัยพิบัติ & สิ่งแวดล้อม", short: "ภัยพิบัติ" }
  ];

  /* ลำดับในแต่ละหมวด · sub = ปุ่มย่อย/ปุ่มเปิดแผง (ไม่นับในตัวเลขบนแท็บ) */
  var LAYERS = [
    ["city", "btn3DBuildings"],
    ["city", "btnLandmarksToggle"],
    ["city", "btnLandmark3DToggle"],
    ["city", "btnShadowToggle"],
    ["city", "btnDistrictsToggle"],
    ["city", "btnZoningToggle"],
    ["city", "btnDataCentersToggle"],
    ["city", "btnIntelSidebarToggle", "sub"],

    ["move", "btnTransitToggle"],
    ["move", "btnRail3DToggle"],
    ["move", "btnRailTrains", "sub"],
    ["move", "btnBusToggle"],
    ["move", "btnBusSearch", "sub"],
    ["move", "btnElevatedToggle"],
    ["move", "btnTrafficToggle"],
    ["move", "btnAirport3DToggle"],
    ["move", "btnAirportLive", "sub"],
    ["move", "btnPort3DToggle"],
    ["move", "btnPortBoats", "sub"],
    ["move", "btnPortAIS", "sub"],
    ["move", "btnPortGo", "sub"],
    ["move", "btnFuelToggle"],
    ["move", "btnEvToggle"],
    ["move", "btnRoutePlannerToggle", "sub"],

    ["hazard", "btnAirToggle"],
    ["hazard", "btnFloodToggle"],
    ["hazard", "btnFloodSim"],
    ["hazard", "btnDamToggle"],
    ["hazard", "btnCctvToggle"],
    ["hazard", "btnWarnToggle"],
    ["hazard", "btnQuakeToggle"],
    ["hazard", "btnSlideToggle"],
    ["hazard", "btnEmergencyToggle"]
  ];
  /* เครื่องมือที่อยู่แถวแรกเสมอ (ไม่ขึ้นกับหมวด) */
  var TOOLS = ["btnDroneTour", "zone-menu-wrap", "btnCollapseBars"];

  var INFO = {};
  LAYERS.forEach(function (r, i) { INFO[r[1]] = { cat: r[0], order: 10 + i, sub: r[2] === "sub" }; });

  var CSS =
    "#leftMenu.lmc-on>.lmc-tabs{order:0}" +
    "#leftMenu.lmc-on>.lmc-tool{order:2}" +
    "#leftMenu.lmc-on>.lmc-tool-first{margin-left:auto}" +
    "#leftMenu.lmc-on>#btnCollapseBars{margin-left:0}" +
    "#leftMenu.lmc-on>.lmc-break{order:4;flex-basis:100%;height:0;margin:0;padding:0}" +
    "#leftMenu.lmc-on>.lmc-free{order:90}" +
    "#leftMenu .lmc-hide{display:none!important}" +
    ".lmc-tabs{display:inline-flex;gap:2px;padding:2px;border-radius:10px;background:rgba(0,0,0,.18);border:1px solid var(--card-border)}" +
    "[data-theme=\"light\"] .lmc-tabs{background:rgba(15,23,42,.05)}" +
    ".lmc-tab{cursor:pointer;display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:8px;border:0;" +
    "  background:transparent;color:var(--text-muted);font:inherit;font-size:11.5px;font-weight:700;white-space:nowrap;transition:background .15s,color .15s}" +
    ".lmc-tab:hover{color:var(--text-main)}" +
    ".lmc-tab .mdico{width:1.2em;height:1.2em}" +
    ".lmc-tab.on{background:var(--accent);color:var(--on-accent)}" +
    ".lmc-tab .lmc-short{display:none}" +
    ".lmc-n{min-width:16px;height:16px;padding:0 4px;border-radius:999px;display:inline-grid;place-items:center;" +
    "  font-size:10px;font-weight:800;line-height:1;background:var(--accent-soft);color:var(--accent)}" +
    ".lmc-tab.on .lmc-n{background:rgba(255,255,255,.28);color:inherit}" +
    ".lmc-n[hidden]{display:none}" +
    "@media (max-width:1180px){.lmc-tab{padding:5px 8px;font-size:11px}}" +
    "@media (max-width:768px){.lmc-tab .mdico{display:none}.lmc-tab .lmc-long{display:none}.lmc-tab .lmc-short{display:inline}.lmc-tab{min-height:32px}" +
    "  .lmc-tab{padding:5px 8px}" +
    /* จอแคบ: แท็บเต็มแถวแรก เครื่องมือ (ไอคอน) ต่อท้ายปุ่มชั้นในแถวสอง — ไม่งั้นแตกเป็น 3 แถว */
    "  #leftMenu.lmc-on>.lmc-tool{order:95}#leftMenu.lmc-on>.lmc-tool-first{margin-left:0}}";

  var menu = null, tabsEl = null, cur = DEFAULT_CAT, busy = false;

  function $(s, r) { return (r || document).querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  function keyOf(el) {
    if (el.id) return el.id;
    if (el.classList && el.classList.contains("zone-menu-wrap")) return "zone-menu-wrap";
    return "";
  }
  function setOrder(el, v) { if (el.style.order !== String(v)) el.style.order = String(v); }

  /* ใส่คลาส/ลำดับให้ลูกตรงของ #leftMenu ทุกตัว แล้วซ่อนตามหมวดที่เลือก
     ⚠ ทุกการเขียนต้องเขียนเฉพาะตอนค่าเปลี่ยน (toggle แบบมี force / เทียบก่อนตั้ง) — classList.add ของคลาสที่มีอยู่แล้ว
       ก็ยังนับเป็น mutation แล้ว observer จะเรียก refresh วนไม่รู้จบ */
  function classify() {
    var kids = menu.children, firstTool = null;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      if (el === tabsEl || el.classList.contains("lmc-break")) continue;
      var k = keyOf(el), ti = TOOLS.indexOf(k);
      if (ti >= 0) {
        /* ลำดับของเครื่องมือมาจากคลาส (จอแคบย้ายไปท้ายแถวสอง) จึงไม่ตั้ง order แบบ inline — ลำดับในกลุ่มใช้ลำดับใน DOM */
        el.classList.toggle("lmc-tool", true);
        if (!firstTool || ti < TOOLS.indexOf(keyOf(firstTool))) firstTool = el;
        continue;
      }
      var inf = INFO[k];
      if (inf) {
        if (el.dataset.lmcCat !== inf.cat) el.dataset.lmcCat = inf.cat;
        setOrder(el, inf.order);
        el.classList.toggle("lmc-hide", cur !== "all" && cur !== inf.cat);
      } else {
        el.classList.toggle("lmc-free", true);
      }
    }
    for (var j = 0; j < kids.length; j++) {
      if (kids[j].classList.contains("lmc-tool")) kids[j].classList.toggle("lmc-tool-first", kids[j] === firstTool);
    }
  }

  function updateCounts() {
    var n = { all: 0 };
    CATS.forEach(function (c) { if (c.id !== "all") n[c.id] = 0; });
    Object.keys(INFO).forEach(function (id) {
      var inf = INFO[id];
      if (inf.sub) return;
      var b = document.getElementById(id);
      if (b && b.parentNode === menu && b.classList.contains("active")) { n[inf.cat]++; n.all++; }
    });
    CATS.forEach(function (c) {
      var t = tabsEl.querySelector('[data-cat="' + c.id + '"]');
      if (!t) return;
      var on = c.id === cur, badge = t.querySelector(".lmc-n"), v = n[c.id] || 0;
      t.classList.toggle("on", on);
      if (t.getAttribute("aria-pressed") !== String(on)) t.setAttribute("aria-pressed", String(on));
      var txt = String(v), hide = v === 0;
      if (badge.textContent !== txt) badge.textContent = txt;
      if (badge.hidden !== hide) badge.hidden = hide;
      var tip = c.label + (v ? " — เปิดอยู่ " + v + " ชั้น" : "");
      if (t.title !== tip) t.title = tip;
    });
  }

  function refresh() {
    if (busy) return;
    busy = true;
    try { classify(); updateCounts(); } finally { busy = false; }
  }

  function select(id) {
    cur = id;
    lsSet(LS_KEY, id);
    refresh();
  }

  function init() {
    menu = document.getElementById("leftMenu");
    if (!menu || menu.classList.contains("lmc-on")) return;
    var st = document.createElement("style");
    st.id = "lmcStyle";
    st.textContent = CSS;
    document.head.appendChild(st);

    var saved = lsGet(LS_KEY);
    if (saved && CATS.some(function (c) { return c.id === saved; })) cur = saved;

    tabsEl = document.createElement("div");
    tabsEl.className = "lmc-tabs";
    tabsEl.setAttribute("role", "group");
    tabsEl.setAttribute("aria-label", "หมวดชั้นข้อมูล");
    tabsEl.innerHTML = CATS.map(function (c) {
      return '<button type="button" class="lmc-tab" data-cat="' + c.id + '" aria-pressed="false">' + ico(c.icon) +
        '<span class="lmc-long">' + c.label + '</span><span class="lmc-short">' + c.short + '</span>' +
        '<span class="lmc-n" hidden>0</span></button>';
    }).join("");
    tabsEl.addEventListener("click", function (e) {
      var t = e.target.closest(".lmc-tab");
      if (t) select(t.dataset.cat);
    });
    menu.insertBefore(tabsEl, menu.firstChild);
    var br = document.createElement("span");
    br.className = "lmc-break";
    br.setAttribute("aria-hidden", "true");
    menu.appendChild(br);
    menu.classList.add("lmc-on");
    refresh();

    new MutationObserver(refresh).observe(menu, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  window.BKK_MENU_CATS = { select: select, current: function () { return cur; } };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
