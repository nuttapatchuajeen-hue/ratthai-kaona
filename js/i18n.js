/* ===========================================================================
   ระบบสลับภาษา ไทย ↔ English — ใช้ร่วมกันทุกหน้า
   ---------------------------------------------------------------------------
   วิธีใส่: วางใน <head> ให้เร็วที่สุด (ต่อจาก meta viewport) แบบ "ไม่มี" defer/async
     <script src="../js/i18n.js" data-dicts="hub"
             data-mount=".site-header .nav-links" data-mount-mode="li"></script>

   หลักการ
   - ภาษาที่เลือกเก็บใน localStorage['md-lang'] = 'th' | 'en' ใช้ร่วมทุกหน้า (ค่าเริ่ม = ไทย)
   - ?lang=en / ?lang=th ใน URL บังคับภาษาได้ (จำไว้ให้ แล้วลบพารามิเตอร์ออกจาก URL)
   - คำแปลอยู่ใน i18n/en/<ชุด>.js — โหลด "เฉพาะตอนเป็น EN" (หน้าไทยไม่เสียเวลาโหลดเพิ่มเลย)
     ชุด common โหลดทุกหน้า + ชุดที่หน้าบอกไว้ใน data-dicts
   - แปลจาก "ข้อความไทยที่แสดงจริง": text node, title/placeholder/alt/aria-label,
     <title>, ข้อความที่วาดลง canvas, alert/confirm — ไม่ต้องแก้ HTML ทีละจุด
     ข้อความที่สคริปต์ของหน้าสร้างทีหลังก็แปลให้ (MutationObserver)
   - ไฟล์ข้อมูลที่หน้าโหลดทีหลัง (เช่น election/detail-2569.js) จะดึงพจนานุกรมของมันเอง
     ตาม i18n/en/_manifest.js
   - ส่วนที่ไม่ต้องการให้แปล: ใส่ class="notranslate" หรือ translate="no"

   ตัวเลือกบนแท็ก <script>
     data-dicts       ชุดคำแปลของหน้า (คั่นด้วยช่องว่าง) — common ใส่ให้เองเสมอ
     data-mount       ตัวเลือก CSS ของที่วางปุ่ม TH|EN (ไม่ใส่ = ปุ่มลอยมุมขวาบน)
     data-mount-mode  li | append | prepend | before | after | float | none   (ค่าเริ่ม append)
                      none = หน้าวางปุ่มเองด้วย MDI18N.mount(el, mode) (เช่น เมนูที่สคริปต์สร้าง)
     data-switch      live (ค่าเริ่ม: สลับทันทีไม่โหลดหน้าใหม่) | reload (หน้าที่มี 3D/canvas เยอะ)
     data-attrs       แอตทริบิวต์เพิ่มเติมที่ต้องแปล
     data-skip        ตัวเลือก CSS ของส่วนที่ห้ามแปล
     data-canvas      off = ไม่แปลข้อความบน canvas

   API: window.MDI18N — lang, t(str), set('en'|'th'), need([ชุด]), mount(el, mode),
        report() คืนรายการคำไทยที่ยังไม่มีคำแปล (ใช้ไล่เก็บตก)
        เหตุการณ์ window 'md-langchange' (detail.lang) — หน้าที่วาด canvas เองใช้วาดใหม่
   =========================================================================== */
(function () {
  "use strict";
  if (window.MDI18N) return;

  var KEY = "md-lang";
  var TH = /[\u0E01-\u0E3A\u0E40-\u0E5B]/;   // ไม่นับ ฿ (U+0E3F) — ราคา "฿38" ไม่ใช่ข้อความไทย
  var html = document.documentElement;
  var me = document.currentScript;
  var ROOT = ((me && me.src) || "").replace(/js\/i18n\.js(?:[?#].*)?$/, "");

  function opt(name, def) {
    var v = me && me.getAttribute(name);
    return v == null || v === "" ? def : v;
  }
  function words(s) { return (s || "").split(/\s+/).filter(Boolean); }

  var PAGE = ["common"].concat(words(opt("data-dicts", "")).filter(function (n) { return n !== "common"; }));
  var SWITCH = opt("data-switch", "live");
  var ATTRS = ["title", "placeholder", "alt", "aria-label", "data-tip", "data-tooltip"].concat(words(opt("data-attrs", "")));
  var SKIP_SEL = ".notranslate,[translate=\"no\"],[data-i18n-skip],.md-lang" + (opt("data-skip", "") ? "," + opt("data-skip", "") : "");
  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, TEMPLATE: 1 };

  function store(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) { return null; }
  }

  // ---- ภาษาปัจจุบัน -------------------------------------------------------
  var lang = "th";
  try {
    var q = /[?&]lang=(th|en)(?:&|$)/.exec(location.search);
    if (q) {
      store(KEY, q[1]);
      var clean = location.search.replace(/([?&])lang=(?:th|en)(&|$)/, function (_, a, b) { return b ? a : ""; }).replace(/[?&]$/, "");
      history.replaceState(history.state, "", location.pathname + clean + location.hash);
    }
  } catch (e) {}
  if (store(KEY) === "en") lang = "en";

  // ---- พจนานุกรม ----------------------------------------------------------
  var D = Object.create(null);  // ไทย (ช่องว่างยุบแล้ว) → อังกฤษ
  var P = [];                   // [RegExp, คำแทน]  — {1} = แปลกลุ่มที่ 1 ต่อ, $1 = ใช้กลุ่มที่ 1 ตามเดิม
  var loaded = Object.create(null), pending = Object.create(null);
  var WEAK = Object.create(null); // ชุดที่ดึงมาเพราะหน้าโหลดไฟล์ของมัน (ตาม _manifest) — ไม่ทับคำแปลของหน้า
  var MAN = Object.create(null); // ไฟล์ข้อมูล → [ชุดคำแปล]
  var cache = new Map();
  var misses = new Set();

  function norm(s) { return s.replace(/\s+/g, " ").trim(); }

  function add(name, pl) {
    var d = (pl && pl.d) || {}, weak = !!(pl && pl.w) || (!!WEAK[name] && PAGE.indexOf(name) < 0);
    for (var k in d) {
      var nk = norm(k);
      if (!weak || !(nk in D)) D[nk] = d[k];  // ชุดของหน้าทับ common ได้ / ชุดข้อมูล (w) ไม่ทับของเดิม
    }
    ((pl && pl.p) || []).forEach(function (x) {
      try { P.push([new RegExp(x[0]), x[1]]); } catch (e) {}
    });
    loaded[name] = true;
    cache.clear();
    misses.clear();
    if (active) schedulePass();
  }

  function manifest(map) {
    for (var f in map) MAN[f] = [].concat(map[f]);
    if (active) scanScripts();
  }

  // ---- แปลข้อความหนึ่งก้อน --------------------------------------------------
  // ลำดับ: ตรงทั้งก้อน → รูปแบบ (P) → แยกตามตัวคั่น (| · : , ( ) ...) → แปลทีละช่วงอักษรไทย
  var SEP = /(\s*(?:[|·•:;,\/()\[\]{}"“”«»→←↔]|\s[-–—]\s)\s*)/;
  var RUN = /[\u0E01-\u0E3A\u0E40-\u0E5B](?:[\u0E01-\u0E3A\u0E40-\u0E5B.]|\s(?=[\u0E01-\u0E3A\u0E40-\u0E5B]))*/g;

  function full(s) { return s != null && !TH.test(s); }

  function pat(n, depth) {
    for (var i = 0; i < P.length; i++) {
      var m = P[i][0].exec(n);
      if (!m) continue;
      var ok = true;
      var out = P[i][1].replace(/\{(\d)\}|\$(\d)/g, function (_, a, b) {
        if (b) return m[+b] || "";
        var sub = m[+a] || "";
        var x = TH.test(sub) ? tr(norm(sub), depth + 1) : sub;
        if (TH.test(x)) ok = false;   // ส่วนย่อยแปลไม่ครบ → ถือว่ารูปแบบนี้ไม่เข้า (กัน "นายกฯ" กลายเป็น "Mr. กฯ")
        return x;
      });
      if (ok) return out;
    }
    return null;
  }

  function look(n, depth) {
    var v = D[n];
    if (v != null) return v;
    if (depth > 5) return null;
    return pat(n, depth);
  }

  function tr(n, depth) {
    if (!TH.test(n)) return n;
    var v = look(n, depth);
    if (v != null) return v;
    if (depth < 5) {
      var parts = n.split(SEP);
      if (parts.length > 1) {
        return parts.map(function (p, i) {
          if (i % 2 || !TH.test(p)) return p;
          var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(p);
          return m[1] + tr(m[2], depth + 1) + m[3];
        }).join("");
      }
    }
    return runs(n, depth);
  }

  function runs(n, depth) {
    return n.replace(RUN, function (r, off, whole) {
      var x = look(r, depth + 1);
      if (x == null && /\.$/.test(r)) {               // "ข้อมูล." → ลองแบบไม่มีจุดท้าย
        var y0 = look(r.replace(/\.+$/, ""), depth + 1);
        if (y0 != null) x = y0 + ".";
      }
      if (x == null && r.indexOf(" ") > 0) {
        // แยกตามช่องว่าง แล้วจับกลุ่มคำที่ยาวที่สุดที่มีในพจนานุกรม ("ดูโปรไฟล์ อนุทิน ชาญวีรกูล" → "ดูโปรไฟล์" + "อนุทิน ชาญวีรกูล")
        var ws = r.split(" "), out = [], any = false;
        for (var i = 0; i < ws.length;) {
          var hit = null, j;
          for (j = ws.length; j > i; j--) {
            hit = look(ws.slice(i, j).join(" "), depth + 1);
            if (hit != null) break;
          }
          if (hit != null) { out.push(hit); any = true; i = j; }
          else { misses.add(ws[i]); out.push(ws[i]); i++; }
        }
        x = any ? out.join(" ") : null;
      }
      if (x == null) { misses.add(r); return r; }
      // ไทยไม่เว้นวรรคระหว่างคำ — พอแปลเป็นอังกฤษต้องเติมช่องว่างกับตัวอักษร/ตัวเลขที่ติดกัน
      var before = whole.charAt(off - 1), after = whole.charAt(off + r.length);
      if (before && /[A-Za-z0-9)]/.test(before) && /^[A-Za-z0-9(]/.test(x)) x = " " + x;
      if (after && /[A-Za-z0-9(]/.test(after) && /[A-Za-z0-9.)]$/.test(x)) x += " ";
      return x;
    });
  }

  function t(s) {
    if (typeof s !== "string" || !TH.test(s)) return s;
    var c = cache.get(s);
    if (c !== undefined) return c;
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
    var n = norm(m[2]);
    var x = tr(n, 0);
    var out = x === n ? s : m[1] + x + m[3];
    if (cache.size > 60000) cache.clear();
    cache.set(s, out);
    return out;
  }

  // ---- นำคำแปลไปใส่หน้าเว็บ -------------------------------------------------
  var REC = new WeakMap();   // text node → [ต้นฉบับ, ที่ใส่ไป]
  var RECA = new WeakMap();  // element → { attr: [ต้นฉบับ, ที่ใส่ไป] }
  var TOUCHED = new Set(), TOUCHEDA = new Set();
  var active = false, mo = null;

  function skipped(el) {
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
      if (SKIP_TAG[e.tagName]) return true;
    }
    return !!(el && el.closest && el.closest(SKIP_SEL));
  }

  function doText(n) {
    var r = REC.get(n), cur = n.data;
    var orig = r && cur === r[1] ? r[0] : cur;
    if (!TH.test(orig)) return;
    var out = t(orig);
    if (out === orig) return;
    REC.set(n, [orig, out]);
    TOUCHED.add(n);
    if (cur !== out) n.data = out;
  }

  function doAttr(el, name) {
    var v = el.getAttribute(name);
    if (v == null) return;
    if (name === "value" && !(el.tagName === "INPUT" && /^(button|submit|reset)$/i.test(el.type))) return;
    var rs = RECA.get(el), r = rs && rs[name];
    var orig = r && v === r[1] ? r[0] : v;
    if (!TH.test(orig)) return;
    var out = t(orig);
    if (out === orig) return;
    if (!rs) RECA.set(el, (rs = {}));
    rs[name] = [orig, out];
    TOUCHEDA.add(el);
    if (v !== out) el.setAttribute(name, out);
  }

  function doEl(el) {
    for (var i = 0; i < ATTRS.length; i++) if (el.hasAttribute(ATTRS[i])) doAttr(el, ATTRS[i]);
    if (el.tagName === "INPUT" && el.hasAttribute("value")) doAttr(el, "value");
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) {
      if (!skipped(root.parentElement)) doText(root);
      return;
    }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) {
      if (skipped(root)) return;
      if (root.tagName === "SCRIPT") return;
      doEl(root);
    }
    var tw = document.createTreeWalker(root, 5 /* ELEMENT | TEXT */, {
      acceptNode: function (n) {
        if (n.nodeType === 3) return TH.test(n.data) || REC.has(n) ? 1 : 3;
        if (SKIP_TAG[n.tagName] || (n.matches && n.matches(SKIP_SEL))) return 2; // REJECT ทั้งกิ่ง
        doEl(n);
        return 3; // SKIP ตัวเอง แต่เดินลูกต่อ
      }
    });
    var n;
    while ((n = tw.nextNode())) doText(n);
  }

  var passTimer = 0;
  function schedulePass() {
    clearTimeout(passTimer);
    passTimer = setTimeout(function () { if (active) walk(html); }, 40);
  }

  function onMut(list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.type === "characterData") {
        if (!skipped(m.target.parentElement)) doText(m.target);
      } else if (m.type === "attributes") {
        if (!skipped(m.target)) doAttr(m.target, m.attributeName);
      } else {
        for (var j = 0; j < m.addedNodes.length; j++) {
          var a = m.addedNodes[j];
          if (a.nodeType === 1 && a.tagName === "SCRIPT") checkScript(a);
          else walk(a);
        }
      }
    }
  }

  // ---- ไฟล์ข้อมูลที่ต้องดึงพจนานุกรมตาม -----------------------------------------
  function relPath(src) {
    try {
      var u = new URL(src, location.href).href.split(/[?#]/)[0];
      return u.indexOf(ROOT) === 0 ? u.slice(ROOT.length) : null;
    } catch (e) { return null; }
  }
  function checkScript(s) {
    if (!s.src || s.hasAttribute("data-i18n")) return;
    var rel = relPath(s.src), list = rel && MAN[rel];
    if (list) { list.forEach(function (n) { WEAK[n] = 1; }); need(list); }
  }
  function scanScripts() {
    var ss = document.getElementsByTagName("script");
    for (var i = 0; i < ss.length; i++) checkScript(ss[i]);
  }

  // ---- โหลดไฟล์คำแปล -------------------------------------------------------
  function url(name) { return ROOT + "i18n/en/" + name + ".js"; }
  function loadAsync(name) {
    if (loaded[name]) return Promise.resolve();
    if (pending[name]) return pending[name];
    return (pending[name] = new Promise(function (res) {
      var s = document.createElement("script");
      s.src = url(name);
      s.setAttribute("data-i18n", "1");
      s.onload = s.onerror = function () { loaded[name] = true; res(); };
      (document.head || html).appendChild(s);
    }));
  }
  function need(list) {
    return Promise.all([].concat(list).map(loadAsync));
  }

  // ---- canvas / alert: แปลตอนวาด --------------------------------------------
  var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
  var saved = {}, patched = false;
  function wrap(obj, k, idx) {
    var f = obj[k];
    saved[k] = [obj, f];
    obj[k] = function () {
      var s = arguments[idx];
      if (typeof s === "string" && TH.test(s)) {
        var a = Array.prototype.slice.call(arguments);
        a[idx] = t(s);
        return f.apply(this, a);
      }
      return f.apply(this, arguments);
    };
  }
  function patch(on) {
    if (on === patched) return;
    patched = on;
    if (on) {
      if (CP && opt("data-canvas", "") !== "off") ["fillText", "strokeText", "measureText"].forEach(function (k) { wrap(CP, k, 0); });
      ["alert", "confirm", "prompt"].forEach(function (k) { if (window[k]) wrap(window, k, 0); });
    } else {
      for (var k in saved) saved[k][0][k] = saved[k][1];
      saved = {};
    }
  }

  // ---- เริ่ม/หยุดโหมดอังกฤษ ----------------------------------------------------
  function startEN() {
    active = true;
    html.lang = "en";
    html.classList.add("md-en");
    patch(true);
    if (!mo) mo = new MutationObserver(onMut);
    mo.observe(html, {
      subtree: true, childList: true, characterData: true,
      attributes: true, attributeFilter: ATTRS.concat(["value"])
    });
    walk(html);
    scanScripts();
  }

  function stopEN() {
    active = false;
    if (mo) mo.disconnect();
    TOUCHED.forEach(function (n) {
      var r = REC.get(n);
      if (r && n.data === r[1]) n.data = r[0];
      REC.delete(n);
    });
    TOUCHEDA.forEach(function (el) {
      var rs = RECA.get(el);
      for (var k in rs) if (el.getAttribute(k) === rs[k][1]) el.setAttribute(k, rs[k][0]);
      RECA.delete(el);
    });
    TOUCHED.clear();
    TOUCHEDA.clear();
    patch(false);
    html.lang = "th";
    html.classList.remove("md-en");
  }

  function announce() {
    syncToggles();
    try { window.dispatchEvent(new CustomEvent("md-langchange", { detail: { lang: lang } })); } catch (e) {}
    try { window.dispatchEvent(new Event("resize")); } catch (e) {} // กราฟส่วนใหญ่วาดใหม่ตอน resize
  }

  function set(l) {
    l = l === "en" ? "en" : "th";
    if (l === lang) return;
    store(KEY, l);
    if (SWITCH === "reload") {
      try { sessionStorage.setItem("md-lang-scroll", location.pathname + "|" + Math.round(window.scrollY || 0)); } catch (e) {}
      location.reload();
      return;
    }
    lang = l;
    syncToggles();
    if (l === "en") {
      need(["_manifest"].concat(PAGE)).then(function () {
        if (lang !== "en") return;
        startEN();
        announce();
      });
    } else {
      stopEN();
      announce();
    }
  }

  // ---- ปุ่ม TH | EN ---------------------------------------------------------
  var CSS =
    ".md-lang{display:inline-flex;align-items:center;flex:none;padding:2px;border:1px solid var(--md-lang-line,rgba(0,229,255,.45));" +
    "border-radius:7px;background:var(--md-lang-bg,rgba(2,5,8,.35));font:600 11.5px/1 'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;" +
    "letter-spacing:.08em;vertical-align:middle;white-space:nowrap;-webkit-user-select:none;user-select:none}" +
    ".md-lang button{-webkit-appearance:none;appearance:none;border:0;margin:0;background:transparent;color:var(--md-lang-fg,inherit);" +
    "font:inherit;letter-spacing:inherit;padding:6px 8px;min-width:32px;border-radius:5px;cursor:pointer;opacity:.6;" +
    "transition:background .15s,color .15s,opacity .15s}" +
    ".md-lang button:hover{opacity:1}" +
    ".md-lang button[aria-pressed=true]{background:var(--md-lang-accent,#00E5FF);color:var(--md-lang-on,#00131a);opacity:1}" +
    ".md-lang button:focus-visible{outline:2px solid var(--md-lang-accent,#00E5FF);outline-offset:2px}" +
    ":where(html[data-theme=light]) .md-lang{--md-lang-bg:rgba(255,255,255,.6);--md-lang-line:rgba(0,110,130,.4)}" +
    ".md-lang-li{display:flex;align-items:center;list-style:none;margin-left:.75rem}" +
    ".md-lang--float{position:fixed;top:12px;right:12px;z-index:2147483000}" +
    "@media (pointer:coarse){.md-lang button{padding:9px 11px;min-width:40px}}" +
    "html.md-i18n-pending body{visibility:hidden!important}";

  function injectCSS() {
    if (document.getElementById("md-lang-css")) return;
    var st = document.createElement("style");
    st.id = "md-lang-css";
    st.textContent = CSS;
    (document.head || html).appendChild(st);
  }

  function widget() {
    var w = document.createElement("div");
    w.className = "md-lang";
    w.setAttribute("translate", "no");
    w.setAttribute("role", "group");
    w.setAttribute("aria-label", "ภาษา / Language");
    w.innerHTML =
      '<button type="button" data-l="th" lang="th" aria-label="ภาษาไทย">TH</button>' +
      '<button type="button" data-l="en" lang="en" aria-label="English">EN</button>';
    w.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-l]");
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      set(b.getAttribute("data-l"));
    });
    return w;
  }

  function syncToggles() {
    var bs = document.querySelectorAll(".md-lang button[data-l]");
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute("aria-pressed", bs[i].getAttribute("data-l") === lang ? "true" : "false");
  }

  function mount(target, mode) {
    injectCSS();
    var w = widget();
    mode = mode || "append";
    if (!target || mode === "float") {
      w.classList.add("md-lang--float");
      document.body.appendChild(w);
    } else if (mode === "li") {
      var li = document.createElement("li");
      li.className = "md-lang-li";
      li.appendChild(w);
      target.appendChild(li);
    } else if (mode === "prepend") target.insertBefore(w, target.firstChild);
    else if (mode === "before") target.parentNode.insertBefore(w, target);
    else if (mode === "after") target.parentNode.insertBefore(w, target.nextSibling);
    else target.appendChild(w);
    syncToggles();
    return w;
  }

  function autoMount() {
    var sel = opt("data-mount", ""), mode = opt("data-mount-mode", sel ? "append" : "float");
    if (mode === "none") return;                       // หน้าวางปุ่มเองด้วย MDI18N.mount()
    if (!sel || mode === "float") return mount(null, "float");
    var tries = 0;
    (function tryMount() {
      var el = document.querySelector(sel);
      if (el) return mount(el, mode);
      if (++tries > 40) return mount(null, "float");   // เมนูที่สคริปต์ฉีดทีหลัง — รอได้ ~10 วินาที
      setTimeout(tryMount, 250);
    })();
  }

  // ---- ไล่เก็บตก: คำไทยที่ยังค้างบนหน้า ----------------------------------------
  function report() {
    var seen = new Map();
    function note(s) {
      (s.match(RUN) || []).forEach(function (r) { seen.set(r, (seen.get(r) || 0) + 1); });
    }
    var tw = document.createTreeWalker(html, 5, {
      acceptNode: function (n) {
        if (n.nodeType === 3) return 1;
        if (SKIP_TAG[n.tagName] || (n.matches && n.matches(SKIP_SEL))) return 2;
        for (var i = 0; i < ATTRS.length; i++) { var v = n.getAttribute(ATTRS[i]); if (v && TH.test(v)) note(v); }
        return 3;
      }
    });
    var n;
    while ((n = tw.nextNode())) if (TH.test(n.data)) note(n.data);
    misses.forEach(function (r) { if (!seen.has(r)) seen.set(r, 0); });
    return Array.from(seen.entries()).sort(function (a, b) { return b[1] - a[1]; });
  }

  window.MDI18N = {
    get lang() { return lang; },
    t: function (s) { return lang === "en" ? t(s) : s; },
    set: set,
    add: add,
    manifest: manifest,
    need: need,
    mount: mount,
    report: report,
    misses: misses,
    _dict: D
  };

  // ---- เริ่มทำงาน -----------------------------------------------------------
  injectCSS();
  if (lang === "en") {
    html.lang = "en";
    html.classList.add("md-en", "md-i18n-pending");
    var names = ["_manifest"].concat(PAGE);
    var parsing = document.readyState === "loading" && me && !me.async && !me.defer;
    if (parsing) {
      // โหลดแบบบล็อกตอน parse → พจนานุกรมพร้อมก่อน <body> ถูกสร้าง ไม่มีจังหวะเห็นภาษาไทยแวบ
      for (var i = 0; i < names.length; i++) {
        pending[names[i]] = Promise.resolve();
        document.write('<script src="' + url(names[i]) + '" data-i18n="1"><\/script>');
      }
      startEN();
    } else {
      need(names).then(startEN);
    }
    var reveal = function () { html.classList.remove("md-i18n-pending"); };
    setTimeout(reveal, 3500);   // กันหน้าค้างมองไม่เห็น ถ้าไฟล์คำแปลโหลดไม่ขึ้น
    document.addEventListener("DOMContentLoaded", function () {
      if (lang === "en") walk(html);
      reveal();
    });
  }

  function ready() {
    autoMount();
    try {
      var sc = sessionStorage.getItem("md-lang-scroll");
      if (sc) {
        sessionStorage.removeItem("md-lang-scroll");
        var p = sc.split("|");
        if (p[0] === location.pathname) {
          var y = +p[1] || 0;
          window.addEventListener("load", function () { setTimeout(function () { window.scrollTo(0, y); }, 60); });
        }
      }
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
