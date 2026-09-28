/**
 * bkk-quake.js
 * ชั้น "แผ่นดินไหว" ของ bkk-city.html — จุดแผ่นดินไหวล่าสุด + รอยเลื่อนมีพลัง + เหตุ 28 มี.ค. 2568 + จุดกำเนิดใต้ดิน 3 มิติ
 *
 * ข้อมูล
 *   - กรมอุตุนิยมวิทยา (/api/quake): ทุกเหตุตั้งแต่ต้นปีในไทยและประเทศใกล้เคียง ชื่อสถานที่ภาษาไทย + 10 เหตุล่าสุดพร้อมตำแหน่งเทียบอำเภอ
 *   - USGS (ดึงตรงจากเบราว์เซอร์ — เปิด CORS): กรอบอาเซียน-อ่าวเบงกอล ละติจูด −11..32 ลองจิจูด 84..128
 *     เหตุเดียวกันจากสองแหล่ง (เวลาห่าง ≤90 วิ + ระยะ ≤150 กม.) รวมเป็นจุดเดียว แสดงค่าของทั้งสองแหล่งในการ์ด
 *   - bkk-quake-data.js (โหลดเมื่อเปิดรอยเลื่อน/เหตุ 2568): รอยเลื่อนกรมทรัพยากรธรณี + GEM นอกประเทศ + ShakeMap/แนวแตก/อาฟเตอร์ช็อกของ USGS
 *
 * วาดด้วยชั้น MapLibre ธรรมดา + custom layer WebGL หนึ่งชั้น (qk-3d) สำหรับจุดกำเนิดใต้ดินตอนเอียงแผนที่
 *   (ไม่ใช้ฉากกลาง bkk-3d-host เพราะฉากนั้นวาดเฉพาะซูม ≥ 11 — จุดกำเนิดแผ่นดินไหวต้องดูระดับภูมิภาค)
 */
(function () {
  "use strict";

  var LS_KEY = "bkk-quake-on", LS_SUB = "bkk-quake-sub", LS_OPT = "bkk-quake-opt", LS_MIN = "bkk-quake-min";
  var REMOTE = "https://ratthai-kaona.vercel.app";
  var DATA_URL = "bkk-quake-data.js";
  var USGS_Q = "https://earthquake.usgs.gov/fdsnws/event/1/query";
  var USGS_BOX = "&minlatitude=-11&maxlatitude=32&minlongitude=84&maxlongitude=128";
  var USGS_EV = "https://earthquake.usgs.gov/earthquakes/eventpage/";
  var TMD_URL = "https://earthquake.tmd.go.th/";
  var WIKI_EQ = "https://th.wikipedia.org/wiki/" + encodeURIComponent("แผ่นดินไหวในประเทศพม่า_พ.ศ._2568");
  var WIKI_SAO = "https://th.wikipedia.org/wiki/" + encodeURIComponent("เหตุอาคารถล่มในกรุงเทพมหานคร_พ.ศ._2568");
  var BKK = [100.5018, 13.7563];
  var EARTH = 2 * Math.PI * 6371008.8, D2R = Math.PI / 180;

  var WIN = { d1: { t: "24 ชม.", ms: 864e5 }, d7: { t: "7 วัน", ms: 7 * 864e5 }, d30: { t: "30 วัน", ms: 30 * 864e5 }, yr: { t: "ปีนี้", ms: 0 } };
  var MAGS = [0, 3, 4, 5];
  var AGE = [[3600e3, "#ff2d55", "ชั่วโมงที่แล้ว"], [864e5, "#ff7a1a", "24 ชม."], [7 * 864e5, "#ffd60a", "7 วัน"], [30 * 864e5, "#8fb3d9", "30 วัน"], [Infinity, "#6b7f99", "เก่ากว่า"]];
  var DEP = [[10, "#ff3b30", "≤10"], [35, "#ff9500", "10–35"], [70, "#ffd60a", "35–70"], [150, "#30d158", "70–150"], [300, "#0a84ff", "150–300"], [Infinity, "#bf5af2", ">300"]];
  // สีมาตราเมอร์คัลลีปรับปรุง (MMI) ตาม USGS ShakeMap
  var MMI_C = [[1, "#ffffff"], [2, "#bfccff"], [3, "#a0e6ff"], [4, "#80ffff"], [5, "#7aff93"], [6, "#ffff00"], [7, "#ffc800"], [8, "#ff9100"], [9, "#ff0000"], [10, "#c80000"]];
  var MMI_TXT = {
    1: "ไม่รู้สึก", 2: "รู้สึกเฉพาะคนที่อยู่นิ่ง ๆ บนชั้นสูง", 3: "รู้สึกได้ในอาคาร โดยเฉพาะชั้นสูง ของแขวนแกว่ง",
    4: "คนในอาคารส่วนใหญ่รู้สึก จาน ประตู หน้าต่างสั่น", 5: "เกือบทุกคนรู้สึก ของเล็ก ๆ ล้ม บางคนตกใจ",
    6: "ทุกคนรู้สึก ของหนักขยับ ปูนฉาบร่วง", 7: "อาคารออกแบบไม่ดีเสียหายมาก อาคารทั่วไปเสียหายเล็กน้อย–ปานกลาง",
    8: "อาคารทั่วไปเสียหายมาก บางหลังพังบางส่วน", 9: "อาคารออกแบบดีก็เสียหายมาก หลายหลังพัง", 10: "อาคารส่วนใหญ่พัง"
  };
  var ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

  var map = null, visible = false, uiBuilt = false, handlersBound = false;
  var sub = { pts: true, faults: true, eq25: false, d3: true };
  var opt = { win: "d7", minM: 0, color: "age", exag: 3, tmd: true, usgs: true, list: "new" };
  var T = { data: null, at: 0, err: null, busy: false };
  var U = { m30: null, at30: 0, yr: null, atYr: 0, err: null, busy: 0 };
  var G = null, gLoading = null;
  var EV = [], ST = {};
  var popup = null, refreshTimer = null, panelObs = null;

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function fmt(n, d) { return n == null || !isFinite(n) ? "–" : Number(n).toLocaleString("th-TH", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function ago(t) {
    var m = Math.round((Date.now() - t) / 60000);
    return m < 1 ? "เมื่อสักครู่" : m < 60 ? m + " นาทีที่แล้ว" : m < 48 * 60 ? Math.round(m / 60) + " ชม.ที่แล้ว" : Math.round(m / 1440) + " วันที่แล้ว";
  }
  function thTime(t, withYear) {
    if (t == null) return "–";
    var o = { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" };
    if (withYear) o.year = "numeric";
    return new Date(t).toLocaleString("th-TH", o) + " น.";
  }
  function whenShort(t) { return Date.now() - t < 48 * 3600e3 ? ago(t) : new Date(t).toLocaleDateString("th-TH", { day: "numeric", month: "short", timeZone: "Asia/Bangkok" }); }
  function distKm(a, b) {   // [lon,lat]
    var p1 = a[1] * D2R, p2 = b[1] * D2R, dp = p2 - p1, dl = (b[0] - a[0]) * D2R;
    var h = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return 2 * 6371.0088 * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  function hexRgb(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; }
  function lerpHex(a, b, t) {
    var x = hexRgb(a), y = hexRgb(b);
    return "rgb(" + [0, 1, 2].map(function (i) { return Math.round((x[i] + (y[i] - x[i]) * t) * 255); }).join(",") + ")";
  }
  function mmiColor(v) {
    if (v <= MMI_C[0][0]) return MMI_C[0][1];
    for (var i = 1; i < MMI_C.length; i++) if (v <= MMI_C[i][0]) return lerpHex(MMI_C[i - 1][1], MMI_C[i][1], v - MMI_C[i - 1][0]);
    return MMI_C[MMI_C.length - 1][1];
  }
  function mmiRGB(v) {
    var c = mmiColor(v);
    return c.charAt(0) === "#" ? hexRgb(c).map(function (q) { return Math.round(q * 255); }) : c.match(/\d+/g).map(Number);
  }
  // สีตัวอักษรบนป้ายสี (ขาวบนสีเข้ม ดำบนสีสว่าง)
  function ink(c) {
    if (!c || c.charAt(0) !== "#") return "#0b0f17";
    var r = hexRgb(c);
    return 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2] > 0.5 ? "#0b0f17" : "#fff";
  }
  function roman(v) {
    if (v == null) return "–";
    var lo = Math.floor(v), f = v - lo;
    if (f < 0.3) return ROMAN[lo] || lo;
    if (f > 0.7) return ROMAN[lo + 1] || lo + 1;
    return ROMAN[lo] + "–" + ROMAN[lo + 1];
  }
  function magClass(m) {
    return m < 2 ? "เล็กมาก มักไม่มีใครรู้สึก" : m < 4 ? "เล็ก (minor) รู้สึกได้ใกล้ศูนย์กลาง" : m < 5 ? "เบา (light) ของในบ้านสั่น รู้สึกได้ชัด" :
      m < 6 ? "ปานกลาง (moderate) อาคารไม่แข็งแรงอาจเสียหาย" : m < 7 ? "แรง (strong) เสียหายได้ในรัศมีหลายสิบ กม." : m < 8 ? "รุนแรง (major) เสียหายหนักเป็นวงกว้าง" : "รุนแรงมาก (great)";
  }
  function depClass(d) { return d == null ? "" : d <= 70 ? "ตื้น" : d <= 300 ? "ระดับกลาง" : "ลึก"; }
  function radius(m) { m = Math.max(1, m || 1); return 2.5 + (m - 1) * (m - 1) * 0.55; }
  function evColor(e) {
    var i;
    if (opt.color === "depth") { for (i = 0; i < DEP.length; i++) if ((e.dep || 0) <= DEP[i][0]) return DEP[i][1]; }
    var a = Date.now() - e.t;
    for (i = 0; i < AGE.length; i++) if (a < AGE[i][0]) return AGE[i][1];
    return AGE[AGE.length - 1][1];
  }
  function mercX(lon) { return (180 + lon) / 360; }
  function mercY(lat) { return (180 - (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))) / 360; }
  function latOfMercY(y) { return (360 / Math.PI) * Math.atan(Math.exp((180 - y * 360) * Math.PI / 180)) - 90; }

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
    add("activity", '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>');
    add("rotate-3d", '<path d="M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2"/><path d="m15.194 13.707 3.814 1.86-1.86 3.814"/><path d="M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4"/>');
    add("external-link", '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>');
    add("phone", '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>');
  }

  /* ================================================================ ไอคอนบนแผนที่ (canvas → addImage) */
  function starImage() {
    var S = 48, c = document.createElement("canvas"); c.width = c.height = S;
    var g = c.getContext("2d"), cx = S / 2, cy = S / 2;
    g.beginPath();
    for (var i = 0; i < 10; i++) {
      var r = i % 2 ? 9 : 21, a = -Math.PI / 2 + i * Math.PI / 5;
      g[i ? "lineTo" : "moveTo"](cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    g.closePath();
    g.fillStyle = "#ff2d55"; g.fill();
    g.lineWidth = 3; g.strokeStyle = "rgba(255,255,255,.95)"; g.stroke();
    return { width: S, height: S, data: g.getImageData(0, 0, S, S).data };
  }
  function saoImage() {
    var S = 44, c = document.createElement("canvas"); c.width = c.height = S;
    var g = c.getContext("2d");
    g.beginPath(); g.arc(22, 22, 19, 0, Math.PI * 2);
    g.fillStyle = "#1c1f27"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#ff2d55"; g.stroke();
    // ตึกเอียงร้าว
    g.save(); g.translate(22, 23); g.rotate(-0.18);
    g.fillStyle = "#f2f4f8"; g.fillRect(-6, -12, 12, 22);
    g.fillStyle = "#1c1f27";
    for (var y = -9; y < 8; y += 5) { g.fillRect(-3.5, y, 2.5, 2.5); g.fillRect(1, y, 2.5, 2.5); }
    g.restore();
    g.strokeStyle = "#ff2d55"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(19, 9); g.lineTo(24, 18); g.lineTo(20, 24); g.lineTo(26, 33); g.stroke();
    return { width: S, height: S, data: g.getImageData(0, 0, S, S).data };
  }
  function ensureImages() {
    if (!map.hasImage("qk-star")) map.addImage("qk-star", starImage(), { pixelRatio: 2 });
    if (!map.hasImage("qk-sao")) map.addImage("qk-sao", saoImage(), { pixelRatio: 2 });
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
  function loadScript(src) {
    return new Promise(function (ok, bad) {
      var s = document.createElement("script");
      s.src = src; s.async = true; s.onload = ok; s.onerror = function () { bad(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }
  function yrStart() { var th = new Date(Date.now() + 7 * 3600e3); return Date.UTC(th.getUTCFullYear(), 0, 1) - 7 * 3600e3; }
  function winStart() { return opt.win === "yr" ? yrStart() : Date.now() - WIN[opt.win].ms; }

  function loadTmd() {
    if (T.busy) return;
    T.busy = true;
    getJSON(apiList("quake")).then(function (j) { T.data = j; T.at = Date.now(); T.err = null; })
      .catch(function (e) { T.err = String(e.message || e); })
      .then(function () { T.busy = false; refresh(); });
  }
  // USGS รูปแบบ text (เล็กกว่า GeoJSON ~5 เท่า): EventID|Time|Latitude|Longitude|Depth/km|Author|Catalog|Contributor|ContributorID|MagType|Magnitude|MagAuthor|EventLocationName
  function parseUsgs(txt) {
    var out = [];
    txt.split("\n").forEach(function (l) {
      if (!l || l.charAt(0) === "#") return;
      var c = l.split("|");
      var t = Date.parse(c[1] + "Z"), lat = +c[2], lon = +c[3], m = parseFloat(c[10]);
      if (!isFinite(t) || !isFinite(lat) || !isFinite(lon) || !isFinite(m)) return;
      out.push({ id: c[0], t: t, lat: lat, lon: lon, dep: isFinite(+c[4]) ? +c[4] : null, mag: m, mt: c[9], pl: c[12] || "" });
    });
    return out;
  }
  function loadUsgs(which) {
    var start = which === "yr" ? yrStart() : Date.now() - 30 * 864e5;
    U.busy++;
    var url = USGS_Q + "?format=text&eventtype=earthquake&orderby=time&limit=20000&starttime=" + new Date(start).toISOString().slice(0, 19) + USGS_BOX;
    fetch(url).then(function (r) { if (!r.ok) throw new Error("USGS HTTP " + r.status); return r.text(); })
      .then(function (txt) {
        var rows = parseUsgs(txt);
        if (which === "yr") { U.yr = rows; U.atYr = Date.now(); } else { U.m30 = rows; U.at30 = Date.now(); }
        U.err = null;
      })
      .catch(function (e) { U.err = String(e.message || e); })
      .then(function () { U.busy--; refresh(); });
  }
  function ensureData() {
    if (opt.tmd && Date.now() - T.at > 5 * 60000) loadTmd();
    if (opt.usgs) {
      if (Date.now() - U.at30 > 5 * 60000) loadUsgs("m30");
      if (opt.win === "yr" && Date.now() - U.atYr > 30 * 60000) loadUsgs("yr");
    }
    if ((sub.faults || sub.eq25) && !G) loadGeo();
  }
  function loadGeo() {
    if (G) return Promise.resolve(G);
    if (!gLoading) {
      gLoading = (window.BKK_QUAKE_DATA ? Promise.resolve() : loadScript(DATA_URL)).then(function () {
        G = window.BKK_QUAKE_DATA;
        if (!G) throw new Error("no data");
        buildGeoSources();
        if (map && visible) { addLayers(); rebuild3D(); }
        renderPanel();
        return G;
      }).catch(function (e) { gLoading = null; console.warn("quake data:", e); throw e; });
    }
    return gLoading;
  }

  /* ================================================================ รวมสองแหล่ง */
  var DIR = { N: "เหนือ", NNE: "เหนือ", NE: "ตะวันออกเฉียงเหนือ", ENE: "ตะวันออกเฉียงเหนือ", E: "ตะวันออก", ESE: "ตะวันออกเฉียงใต้", SE: "ตะวันออกเฉียงใต้", SSE: "ใต้",
    S: "ใต้", SSW: "ใต้", SW: "ตะวันตกเฉียงใต้", WSW: "ตะวันตกเฉียงใต้", W: "ตะวันตก", WNW: "ตะวันตกเฉียงเหนือ", NW: "ตะวันตกเฉียงเหนือ", NNW: "เหนือ" };
  var CTRY = { "Burma (Myanmar)": "เมียนมา", "Myanmar": "เมียนมา", "Philippines": "ฟิลิปปินส์", "Indonesia": "อินโดนีเซีย", "Thailand": "ไทย", "Laos": "ลาว",
    "Vietnam": "เวียดนาม", "China": "จีน", "India": "อินเดีย", "Bangladesh": "บังกลาเทศ", "Malaysia": "มาเลเซีย", "Cambodia": "กัมพูชา", "Taiwan": "ไต้หวัน",
    "Nepal": "เนปาล", "Bhutan": "ภูฏาน", "Timor Leste": "ติมอร์-เลสเต", "Papua New Guinea": "ปาปัวนิวกินี", "Brunei": "บรูไน", "Singapore": "สิงคโปร์" };
  var REG = { "Andaman Islands, India region": "หมู่เกาะอันดามัน อินเดีย", "Nicobar Islands, India region": "หมู่เกาะนิโคบาร์ อินเดีย",
    "northern Sumatra, Indonesia": "ตอนเหนือของเกาะสุมาตรา อินโดนีเซีย", "southern Sumatra, Indonesia": "ตอนใต้ของเกาะสุมาตรา อินโดนีเซีย",
    "Kepulauan Mentawai region, Indonesia": "หมู่เกาะเมนตาไว อินโดนีเซีย", "Mindanao, Philippines": "เกาะมินดาเนา ฟิลิปปินส์",
    "Myanmar-India border region": "พรมแดนเมียนมา–อินเดีย", "Myanmar-China border region": "พรมแดนเมียนมา–จีน",
    "South China Sea": "ทะเลจีนใต้", "Banda Sea": "ทะเลบันดา", "Molucca Sea": "ทะเลโมลุกกะ", "Celebes Sea": "ทะเลเซเลบีส", "Andaman Sea": "ทะเลอันดามัน", "Bay of Bengal": "อ่าวเบงกอล" };
  function placeTH(s) {
    s = String(s || "").replace(/^\d{4}\s+/, "").replace(/\s+Earthquake$/, "");   // ชื่อเหตุใหญ่ของ USGS เช่น "2025 Mandalay, Burma (Myanmar) Earthquake"
    var tr = function (x) {
      if (REG[x]) return REG[x];
      if (CTRY[x]) return CTRY[x];
      var i = x.lastIndexOf(", ");
      if (i > 0 && CTRY[x.slice(i + 2)]) return x.slice(0, i) + " (" + CTRY[x.slice(i + 2)] + ")";
      return x;
    };
    // ชื่อสถานที่ขึ้นก่อน (รายการในแผงตัดท้ายเมื่อยาว)
    var m = /^(\d+)\s*km\s+([NSEW]{1,3})\s+of\s+(.+)$/.exec(s);
    if (m && DIR[m[2]]) return tr(m[3]) + " · ห่าง " + m[1] + " กม. ทางทิศ" + DIR[m[2]];
    return tr(s);
  }
  function usgsRows() { return opt.win === "yr" && U.yr ? U.yr : (U.m30 || []); }
  function merge() {
    var from = winStart();
    var tm = opt.tmd && T.data ? T.data.ev.filter(function (r) { return r[0] >= from; }) : [];
    var us = opt.usgs ? usgsRows().filter(function (u) { return u.t >= from; }) : [];
    var used = new Uint8Array(us.length), out = [], dup = 0;
    tm.forEach(function (r) {
      var e = { t: r[0], lat: r[1], lon: r[2], dep: r[3], mag: r[4], th: r[5], en: r[6], id: r[7], near: r[8], k: r, u: null };
      for (var j = 0; j < us.length; j++) {
        var u = us[j];
        var dt = Math.abs(u.t - r[0]);
        if (used[j] || dt > 90000) continue;
        // เวลาตรงกันแทบเป๊ะ = เหตุเดียวกันแม้ตำแหน่งต่างกันมาก (เหตุไกลนอกเครือข่ายสถานีของกรมอุตุฯ มักคลาดหลายร้อย กม.)
        var lim = dt <= 15000 ? 400 : 150;
        if (distKm([u.lon, u.lat], [r[2], r[1]]) < lim && Math.abs(u.mag - r[4]) < 1.3) { e.u = u; used[j] = 1; dup++; break; }
      }
      if (e.u && e.u.dep != null) e.dep3 = e.u.dep;   // ความลึกใช้ของ USGS ถ้ามี (กรมอุตุฯ มักใส่ 1 หรือ 10 กม. เป็นค่าตั้งต้น)
      out.push(e);
    });
    us.forEach(function (u, j) {
      if (used[j]) return;
      out.push({ t: u.t, lat: u.lat, lon: u.lon, dep: u.dep, mag: u.mag, th: placeTH(u.pl), en: u.pl, id: null, near: null, k: null, u: u });
    });
    out = out.filter(function (e) { return e.mag == null || e.mag >= opt.minM; });
    out.forEach(function (e) {
      if (e.dep3 == null) e.dep3 = e.dep;
      e.d = distKm([e.lon, e.lat], BKK);
      e.thai = /^ต\.|\sจ\./.test(e.th || "") || /Thailand/.test(e.en || "");
    });
    out.sort(function (a, b) { return b.t - a.t; });
    out.forEach(function (e, i) { e.i = i; });
    EV = out;
    var top = null, near = null;
    out.forEach(function (e) { if (!top || e.mag > top.mag) top = e; if (!near || e.d < near.d) near = e; });
    ST = { n: out.length, tmd: tm.length, usgs: us.length, dup: dup, top: top, near: near, thai: out.filter(function (e) { return e.thai; }).length };
  }

  /* ================================================================ GeoJSON */
  function feat(type, coords, props) { return { type: "Feature", geometry: { type: type, coordinates: coords }, properties: props }; }
  function fc(f) { return { type: "FeatureCollection", features: f }; }
  function setGeo(id, g) { var s = map && map.getSource(id); if (s) s.setData(g); }
  function evGeo() {
    // เล็กอยู่บน ใหญ่อยู่ล่าง (ไม่ให้วงใหญ่บังวงเล็ก)
    return fc(EV.map(function (e) {
      return feat("Point", [e.lon, e.lat], { i: e.i, m: e.mag || 0, r: radius(e.mag), c: evColor(e), n: Date.now() - e.t < 864e5 ? 1 : 0, ml: e.mag == null ? "" : "M" + e.mag.toFixed(1) });
    }));
  }
  var GEO = null;
  function buildGeoSources() {
    if (!G || GEO) return;
    var Z = G.zones, E = G.eq2025;
    GEO = {
      dmr: fc(G.dmr.map(function (s, i) {
        return feat(s.g.length > 1 ? "MultiLineString" : "LineString", s.g.length > 1 ? s.g : s.g[0], { i: i, mce: s.mce, zl: "รอยเลื่อน" + Z[s.z].t, sl: s.nt + " · " + Z[s.z].t });
      })),
      gem: fc(G.gem.map(function (s, i) {
        return feat(s.g.length > 1 ? "MultiLineString" : "LineString", s.g.length > 1 ? s.g : s.g[0], { i: i, sag: s.n === "สะกาย" ? 1 : 0, l: s.n === "สะกาย" ? "รอยเลื่อนสะกาย" : "" });
      })),
      rup: fc([feat("LineString", E.rupture, { l: "รอยเลื่อนสะกาย · ช่วงที่แตก 28 มี.ค. 2568 (~" + E.rupKm + " กม.)" })]),
      mmi: fc(E.mmi.filter(function (x) { return x.v % 1 === 0; }).map(function (x) { return feat("MultiLineString", x.g, { v: x.v, c: x.c, l: "MMI " + ROMAN[x.v] }); })),
      after: fc(E.after.map(function (a, i) { return feat("Point", [a[2], a[1]], { i: i, m: a[4], r: 1.6 + Math.max(0, a[4] - 3) * 1.9 }); })),
      main: fc([feat("Point", [E.main.lon, E.main.lat], { l: "M7.7 · 28 มี.ค. 2568" })]),
      sao: fc([feat("Point", [E.sao.lon, E.sao.lat], { l: "อาคาร สตง. ถล่ม" })]),
      city: fc(E.cities.filter(function (c) { return c[3] != null; }).map(function (c) { return feat("Point", [c[1], c[2]], { l: c[0] + " · MMI " + roman(c[3]), c: mmiColor(c[3]) }); }))
    };
  }
  // ShakeMap เป็นกริดละติจูด-ลองจิจูด แต่ภาพบนแผนที่ยืดแบบเมอร์เคเตอร์ → สุ่มค่าใหม่ทีละแถวตามละติจูดจริง
  var mmiURL = null, mmiBox = null;
  function mmiImage() {
    if (mmiURL || !G) return mmiURL;
    var g = G.eq2025.grid, raw = atob(g.b64), n = raw.length, v = new Float32Array(n);
    for (var i = 0; i < n; i++) v[i] = raw.charCodeAt(i) / 20;
    var hx = (g.x1 - g.x0) / (g.nx - 1) / 2, hy = (g.y1 - g.y0) / (g.ny - 1) / 2;
    var X0 = g.x0 - hx, X1 = g.x1 + hx, Y0 = g.y0 - hy, Y1 = g.y1 + hy;
    var W = 520, H = 600, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d"), img = ctx.createImageData(W, H), my0 = mercY(Y1), my1 = mercY(Y0);
    var at = function (x, y) { return v[y * g.nx + x]; };
    for (var r = 0; r < H; r++) {
      var lat = latOfMercY(my0 + (my1 - my0) * (r + 0.5) / H);
      var fy = Math.max(0, Math.min(g.ny - 1, (lat - g.y0) / (g.y1 - g.y0) * (g.ny - 1)));
      var y0 = Math.floor(fy), y1 = Math.min(g.ny - 1, y0 + 1), ty = fy - y0;
      for (var c = 0; c < W; c++) {
        var lon = X0 + (X1 - X0) * (c + 0.5) / W;
        var fx = Math.max(0, Math.min(g.nx - 1, (lon - g.x0) / (g.x1 - g.x0) * (g.nx - 1)));
        var x0 = Math.floor(fx), x1 = Math.min(g.nx - 1, x0 + 1), tx = fx - x0;
        var a = at(x0, y0), b = at(x1, y0), cc = at(x0, y1), d = at(x1, y1);
        if (!a || !b || !cc || !d) continue;
        var m = (a * (1 - tx) + b * tx) * (1 - ty) + (cc * (1 - tx) + d * tx) * ty;
        if (m < 3.4) continue;
        // จางที่ขอบกริด (ไม่ให้เห็นเป็นกรอบสี่เหลี่ยม) + จางช่วง MMI ต่ำ
        var edge = Math.min(fx, g.nx - 1 - fx, fy, g.ny - 1 - fy) / 6;
        edge = Math.max(0, Math.min(1, edge)); edge = edge * edge * (3 - 2 * edge);
        var rgb = mmiRGB(m);
        var k = (r * W + c) * 4;
        img.data[k] = +rgb[0]; img.data[k + 1] = +rgb[1]; img.data[k + 2] = +rgb[2];
        img.data[k + 3] = Math.round(255 * Math.min(1, (m - 3.4) / 1.1) * edge * 0.92);
      }
    }
    ctx.putImageData(img, 0, 0);
    mmiURL = cv.toDataURL("image/png");
    mmiBox = [[X0, Y1], [X1, Y1], [X1, Y0], [X0, Y0]];
    return mmiURL;
  }

  /* ================================================================ ชั้นบนแผนที่ */
  var LAYERS = ["qk-mmi-img", "qk-mmi-line", "qk-mmi-lbl", "qk-gem", "qk-dmr-glow", "qk-dmr", "qk-rup-glow", "qk-rup", "qk-dmr-lbl", "qk-gem-lbl", "qk-rup-lbl",
    "qk-after", "qk-3d", "qk-halo", "qk-pts", "qk-lbl", "qk-city", "qk-city-lbl", "qk-main", "qk-sao"];
  function beforeId() {
    if (map.getLayer("bkk-3d-world")) return "bkk-3d-world";
    if (map.getLayer("city-buildings-3d")) return "city-buildings-3d";
    return undefined;
  }
  // วางชั้นตามลำดับใน LAYERS เสมอ (ข้อมูลรอยเลื่อนโหลดทีหลัง ต้องแทรกไปอยู่ใต้จุดแผ่นดินไหว ไม่ใช่ทับบนสุด)
  function layerBefore(id) {
    for (var j = LAYERS.indexOf(id) + 1; j < LAYERS.length; j++) if (map.getLayer(LAYERS[j])) return LAYERS[j];
    return beforeId();
  }
  function add3D() {
    if (map.getLayer("qk-3d")) return;
    try { map.addLayer(make3DLayer(), layerBefore("qk-3d")); } catch (e) { console.warn("quake 3D:", e); }
  }
  function addLayers() {
    if (!map || !map.getStyle()) return;
    ensureImages();
    var src = function (id, data) { if (!map.getSource(id)) map.addSource(id, { type: "geojson", data: data }); };
    var lay = function (spec) { if (!map.getLayer(spec.id)) map.addLayer(spec, layerBefore(spec.id)); };
    var TXT = { "text-font": ["Noto Sans Regular"], "text-size": 11, "text-optional": true };
    var HALO = { "text-color": "#fff", "text-halo-color": "rgba(10,14,22,.92)", "text-halo-width": 1.4 };

    if (G && GEO) {
      if (mmiImage() && !map.getSource("qk-mmi-img")) map.addSource("qk-mmi-img", { type: "image", url: mmiURL, coordinates: mmiBox });
      lay({ id: "qk-mmi-img", type: "raster", source: "qk-mmi-img", paint: { "raster-opacity": 0.42, "raster-fade-duration": 0, "raster-resampling": "linear" } });
      src("qk-mmi", GEO.mmi);
      lay({ id: "qk-mmi-line", type: "line", source: "qk-mmi", paint: { "line-color": ["get", "c"], "line-width": 1.1, "line-opacity": 0.85 } });
      lay({ id: "qk-mmi-lbl", type: "symbol", source: "qk-mmi", layout: Object.assign({ "symbol-placement": "line", "text-field": ["get", "l"], "symbol-spacing": 320 }, TXT, { "text-size": 10 }), paint: { "text-color": ["get", "c"], "text-halo-color": "rgba(10,14,22,.92)", "text-halo-width": 1.3 } });

      src("qk-gem", GEO.gem);
      lay({
        id: "qk-gem", type: "line", source: "qk-gem",
        paint: {
          "line-color": ["case", ["==", ["get", "sag"], 1], "#ff5a36", "#c4a1ff"],
          "line-width": ["interpolate", ["linear"], ["zoom"], 4, ["case", ["==", ["get", "sag"], 1], 1.8, 0.7], 9, ["case", ["==", ["get", "sag"], 1], 3, 1.6]],
          "line-opacity": 0.75, "line-dasharray": [3, 1.5]
        }
      });
      src("qk-dmr", GEO.dmr);
      var w = function (lo, hi) { return ["interpolate", ["linear"], ["get", "mce"], 5, lo, 7.5, hi]; };
      lay({ id: "qk-dmr-glow", type: "line", source: "qk-dmr", paint: { "line-color": "#ff5a36", "line-blur": 4, "line-opacity": 0.28, "line-width": ["interpolate", ["linear"], ["zoom"], 4, w(3, 5), 10, w(7, 12)] } });
      lay({
        id: "qk-dmr", type: "line", source: "qk-dmr", layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["interpolate", ["linear"], ["get", "mce"], 5.5, "#ffc38a", 6.8, "#ff7a3d", 7.5, "#ff2d55"],
          "line-width": ["interpolate", ["linear"], ["zoom"], 4, w(0.9, 1.8), 10, w(1.8, 3.6)]
        }
      });
      src("qk-rup", GEO.rup);
      lay({ id: "qk-rup-glow", type: "line", source: "qk-rup", paint: { "line-color": "#ff2d55", "line-width": ["interpolate", ["linear"], ["zoom"], 4, 9, 9, 18], "line-blur": 6, "line-opacity": 0.5 } });
      lay({ id: "qk-rup", type: "line", source: "qk-rup", layout: { "line-cap": "round" }, paint: { "line-color": "#ff4d6d", "line-width": ["interpolate", ["linear"], ["zoom"], 4, 2.6, 9, 4.5] } });
      lay({
        id: "qk-dmr-lbl", type: "symbol", source: "qk-dmr", minzoom: 6.2,
        layout: Object.assign({ "symbol-placement": "line", "symbol-spacing": 420, "text-field": ["step", ["zoom"], ["get", "zl"], 9.5, ["get", "sl"]] }, TXT),
        paint: Object.assign({}, HALO, { "text-color": "#ffc9a8" })
      });
      lay({
        id: "qk-gem-lbl", type: "symbol", source: "qk-gem", filter: ["==", ["get", "sag"], 1],
        layout: Object.assign({ "symbol-placement": "line", "symbol-spacing": 500, "text-field": ["get", "l"] }, TXT), paint: Object.assign({}, HALO, { "text-color": "#ffb3a0" })
      });
      lay({
        id: "qk-rup-lbl", type: "symbol", source: "qk-rup",
        layout: Object.assign({ "symbol-placement": "line", "symbol-spacing": 600, "text-field": ["get", "l"] }, TXT, { "text-font": ["Noto Sans Bold"] }), paint: Object.assign({}, HALO, { "text-color": "#ffd0d8" })
      });
      src("qk-after", GEO.after);
      lay({
        id: "qk-after", type: "circle", source: "qk-after",
        paint: {
          "circle-color": "rgba(255,120,150,.45)", "circle-stroke-color": "#ff4d6d", "circle-stroke-width": 0.8,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, ["get", "r"], 9, ["*", ["get", "r"], 1.8]]
        }
      });
    }
    src("qk-ev", evGeo());
    lay({
      id: "qk-halo", type: "circle", source: "qk-ev", filter: ["==", ["get", "n"], 1],
      paint: { "circle-color": ["get", "c"], "circle-opacity": 0.28, "circle-blur": 0.7, "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, ["*", ["get", "r"], 2.2], 10, ["*", ["get", "r"], 3.6]] }
    });
    lay({
      id: "qk-pts", type: "circle", source: "qk-ev", layout: { "circle-sort-key": ["-", 0, ["get", "m"]] },
      paint: {
        "circle-color": ["get", "c"], "circle-opacity": 0.82,
        "circle-stroke-color": "rgba(10,14,22,.85)", "circle-stroke-width": 1,
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, ["*", ["get", "r"], 0.85], 8, ["*", ["get", "r"], 1.2], 12, ["*", ["get", "r"], 1.7]]
      }
    });
    lay({
      id: "qk-lbl", type: "symbol", source: "qk-ev",
      layout: Object.assign({
        "text-field": ["step", ["zoom"], ["case", [">=", ["get", "m"], 5], ["get", "ml"], ""], 6.5, ["case", [">=", ["get", "m"], 4], ["get", "ml"], ""], 9, ["get", "ml"]],
        "text-anchor": "left", "text-offset": [0.9, 0], "symbol-sort-key": ["-", 0, ["get", "m"]]
      }, TXT, { "text-size": 10.5 }),
      paint: HALO
    });
    if (G && GEO) {
      src("qk-city", GEO.city);
      lay({ id: "qk-city", type: "circle", source: "qk-city", paint: { "circle-color": ["get", "c"], "circle-radius": 4, "circle-stroke-color": "#0b0f17", "circle-stroke-width": 1.5 } });
      lay({ id: "qk-city-lbl", type: "symbol", source: "qk-city", layout: Object.assign({ "text-field": ["get", "l"], "text-anchor": "top", "text-offset": [0, 0.7] }, TXT), paint: HALO });
      src("qk-main", GEO.main);
      lay({
        id: "qk-main", type: "symbol", source: "qk-main",
        layout: Object.assign({ "icon-image": "qk-star", "icon-allow-overlap": true, "icon-ignore-placement": true, "text-field": ["get", "l"], "text-anchor": "left", "text-offset": [1.4, 0] }, TXT, { "text-font": ["Noto Sans Bold"] }),
        paint: HALO
      });
      src("qk-sao", GEO.sao);
      lay({
        id: "qk-sao", type: "symbol", source: "qk-sao",
        layout: Object.assign({ "icon-image": "qk-sao", "icon-allow-overlap": true, "icon-ignore-placement": true, "text-field": ["step", ["zoom"], "", 7, ["get", "l"]], "text-anchor": "left", "text-offset": [1.3, 0] }, TXT, { "text-font": ["Noto Sans Bold"] }),
        paint: HALO
      });
    }
    syncLayerVis();
  }
  function syncLayerVis() {
    if (!map) return;
    var set = function (id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); };
    ["qk-halo", "qk-pts", "qk-lbl"].forEach(function (id) { set(id, visible && sub.pts); });
    ["qk-gem", "qk-dmr-glow", "qk-dmr", "qk-dmr-lbl", "qk-gem-lbl"].forEach(function (id) { set(id, visible && sub.faults); });
    ["qk-mmi-img", "qk-mmi-line", "qk-mmi-lbl", "qk-rup-glow", "qk-rup", "qk-rup-lbl", "qk-after", "qk-city", "qk-city-lbl", "qk-main", "qk-sao"].forEach(function (id) { set(id, visible && sub.eq25); });
    if (map.getLayer("qk-3d") && !(visible && sub.d3)) map.removeLayer("qk-3d");
    else if (visible && sub.d3) add3D();
    map.triggerRepaint();
  }

  /* ================================================================ จุดกำเนิดใต้ดิน 3 มิติ (custom layer WebGL) */
  var PVS = "attribute vec3 a_pos;attribute vec4 a_col;attribute float a_size;uniform mat4 u_m;uniform float u_dpr;uniform float u_fade;varying vec4 v_col;" +
    "void main(){vec4 p=u_m*vec4(a_pos,1.0);if(p.w>0.0)p.z=clamp(p.z,-p.w,p.w*0.9999);gl_Position=p;gl_PointSize=a_size*u_dpr;v_col=vec4(a_col.rgb,a_col.a*u_fade);}";
  var PFS = "precision mediump float;varying vec4 v_col;" +
    "void main(){vec2 c=gl_PointCoord*2.0-1.0;float r=dot(c,c);if(r>1.0)discard;" +
    "vec3 n=vec3(c.x,-c.y,sqrt(max(0.0,1.0-r)));float l=0.5+0.6*max(0.0,dot(n,normalize(vec3(-0.45,0.55,0.75))));" +
    "vec3 col=min(v_col.rgb*l+pow(max(0.0,dot(n,normalize(vec3(-0.3,0.5,0.9)))),24.0)*0.5,1.0);" +
    "float a=v_col.a*(1.0-smoothstep(0.82,1.0,r));gl_FragColor=vec4(col*a,a);}";
  var LVS = "attribute vec3 a_pos;attribute vec4 a_col;uniform mat4 u_m;uniform float u_fade;varying vec4 v_col;" +
    "void main(){vec4 p=u_m*vec4(a_pos,1.0);if(p.w>0.0)p.z=clamp(p.z,-p.w,p.w*0.9999);gl_Position=p;v_col=vec4(a_col.rgb,a_col.a*u_fade);}";
  var LFS = "precision mediump float;varying vec4 v_col;void main(){gl_FragColor=vec4(v_col.rgb*v_col.a,v_col.a);}";
  var R3 = { gl: null, pp: null, lp: null, pb: null, lb: null, tb: null, np: 0, nl: 0, nt: 0, pts: [], M: null, dirty: true, on: false };

  function prog(gl, vs, fs) {
    var mk = function (type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    var p = gl.createProgram();
    gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var o = { p: p, a: {}, u: {} };
    ["a_pos", "a_col", "a_size"].forEach(function (k) { o.a[k] = gl.getAttribLocation(p, k); });
    ["u_m", "u_dpr", "u_fade"].forEach(function (k) { o.u[k] = gl.getUniformLocation(p, k); });
    return o;
  }
  function make3DLayer() {
    return {
      id: "qk-3d", type: "custom", renderingMode: "3d",
      onAdd: function (m, gl) {
        if (R3.gl !== gl || !R3.pp) {
          R3.gl = gl;
          R3.pp = prog(gl, PVS, PFS); R3.lp = prog(gl, LVS, LFS);
          R3.pb = gl.createBuffer(); R3.lb = gl.createBuffer(); R3.tb = gl.createBuffer();
          R3.dirty = true;
        }
        R3.on = true;
      },
      onRemove: function () { R3.on = false; R3.M = null; },
      render: draw3D
    };
  }
  function zOf(depKm, lat) { return -Math.max(depKm || 0, 0.5) * 1000 * opt.exag / (EARTH * Math.cos(lat * D2R)); }
  function rebuild3D() { R3.dirty = true; if (map) map.triggerRepaint(); }
  function upload3D(gl) {
    var P = [], L = [], Tr = [], pts = [];
    var push = function (arr, x, y, z, c, a) { arr.push(x, y, z, c[0], c[1], c[2], a); };
    var addEv = function (lon, lat, dep, hex, size, ref, stemA) {
      var x = mercX(lon), y = mercY(lat), z = zOf(dep, lat), c = hexRgb(hex);
      push(L, x, y, 0, c, 0.1); push(L, x, y, z, c, stemA);
      pts.push({ x: x, y: y, z: z, c: c, s: size, ref: ref, dep: dep || 0 });
    };
    if (sub.pts) EV.forEach(function (e) { addEv(e.lon, e.lat, e.dep3, evColor(e), Math.max(5, radius(e.mag) * 1.7), { k: "ev", i: e.i }, 0.75); });
    if (sub.eq25 && G) {
      var E = G.eq2025;
      E.after.forEach(function (a, i) { addEv(a[2], a[1], a[3], "#ff7a93", 3 + Math.max(0, a[4] - 3) * 2.4, { k: "af", i: i }, 0.45); });
      addEv(E.main.lon, E.main.lat, E.main.dep, "#ff2d55", 22, { k: "main" }, 0.9);
      // ระนาบรอยแตก (USGS: ลึก 0–rupBottom กม. ตั้งฉากกับผิว) — แผ่นโปร่งใต้แนวรอยเลื่อน
      var tr = E.rupture, c = hexRgb("#ff2d55");
      for (var k = 1; k < tr.length; k++) {
        var a0 = tr[k - 1], b0 = tr[k];
        var ax = mercX(a0[0]), ay = mercY(a0[1]), bx = mercX(b0[0]), by = mercY(b0[1]);
        var az = zOf(E.rupBottom, a0[1]), bz = zOf(E.rupBottom, b0[1]);
        push(Tr, ax, ay, 0, c, 0.26); push(Tr, bx, by, 0, c, 0.26); push(Tr, bx, by, bz, c, 0.12);
        push(Tr, ax, ay, 0, c, 0.26); push(Tr, bx, by, bz, c, 0.12); push(Tr, ax, ay, az, c, 0.12);
        push(L, ax, ay, az, c, 0.7); push(L, bx, by, bz, c, 0.7);
      }
      var f = tr[0], l = tr[tr.length - 1];
      push(L, mercX(f[0]), mercY(f[1]), 0, c, 0.7); push(L, mercX(f[0]), mercY(f[1]), zOf(E.rupBottom, f[1]), c, 0.7);
      push(L, mercX(l[0]), mercY(l[1]), 0, c, 0.7); push(L, mercX(l[0]), mercY(l[1]), zOf(E.rupBottom, l[1]), c, 0.7);
    }
    pts.sort(function (a, b) { return b.dep - a.dep; });   // ลึกก่อน ตื้นทับ
    pts.forEach(function (p) { P.push(p.x, p.y, p.z, p.c[0], p.c[1], p.c[2], 0.95, p.s); });
    gl.bindBuffer(gl.ARRAY_BUFFER, R3.pb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(P), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, R3.lb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(L), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, R3.tb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Tr), gl.DYNAMIC_DRAW);
    R3.np = P.length / 8; R3.nl = L.length / 7; R3.nt = Tr.length / 7; R3.pts = pts;
    R3.dirty = false;
  }
  function fade3D() { return map ? Math.max(0, Math.min(1, (map.getPitch() - 4) / 12)) : 0; }
  function draw3D(gl, args) {
    var fade = fade3D();
    if (!fade || !visible || !sub.d3) { R3.M = null; return; }
    var mm = args && args.defaultProjectionData ? args.defaultProjectionData.mainMatrix : args;
    if (!mm) return;
    if (R3.dirty) upload3D(gl);
    R3.M = Array.prototype.slice.call(mm);
    var M = new Float32Array(mm), dpr = gl.drawingBufferWidth / (map.getCanvas().clientWidth || 1);
    if (gl.bindVertexArray) gl.bindVertexArray(null);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.disable(gl.STENCIL_TEST);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    var bindAttr = function (pr, stride, size) {
      gl.enableVertexAttribArray(pr.a.a_pos); gl.vertexAttribPointer(pr.a.a_pos, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(pr.a.a_col); gl.vertexAttribPointer(pr.a.a_col, 4, gl.FLOAT, false, stride, 12);
      if (size && pr.a.a_size >= 0) { gl.enableVertexAttribArray(pr.a.a_size); gl.vertexAttribPointer(pr.a.a_size, 1, gl.FLOAT, false, stride, 28); }
    };
    var unbind = function (pr) { ["a_pos", "a_col", "a_size"].forEach(function (k) { if (pr.a[k] >= 0) gl.disableVertexAttribArray(pr.a[k]); }); };
    var lp = R3.lp;
    gl.useProgram(lp.p);
    gl.uniformMatrix4fv(lp.u.u_m, false, M); gl.uniform1f(lp.u.u_fade, fade);
    if (R3.nt) { gl.bindBuffer(gl.ARRAY_BUFFER, R3.tb); bindAttr(lp, 28); gl.drawArrays(gl.TRIANGLES, 0, R3.nt); }
    if (R3.nl) { gl.bindBuffer(gl.ARRAY_BUFFER, R3.lb); bindAttr(lp, 28); gl.drawArrays(gl.LINES, 0, R3.nl); }
    unbind(lp);
    var pp = R3.pp;
    if (R3.np) {
      gl.useProgram(pp.p);
      gl.uniformMatrix4fv(pp.u.u_m, false, M); gl.uniform1f(pp.u.u_fade, fade); gl.uniform1f(pp.u.u_dpr, dpr);
      gl.bindBuffer(gl.ARRAY_BUFFER, R3.pb); bindAttr(pp, 32, true);
      gl.drawArrays(gl.POINTS, 0, R3.np);
      unbind(pp);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
  // จุดใต้ดินที่ถูกคลิก (ฉายด้วยเมทริกซ์ของเฟรมล่าสุด)
  function pick3D(px, py) {
    if (!R3.M || !R3.pts.length) return null;
    var M = R3.M, cv = map.getCanvas(), W = cv.clientWidth, H = cv.clientHeight, best = null, bd = Infinity;
    for (var i = 0; i < R3.pts.length; i++) {
      var p = R3.pts[i];
      var cw = M[3] * p.x + M[7] * p.y + M[11] * p.z + M[15];
      if (cw <= 0) continue;
      var sx = ((M[0] * p.x + M[4] * p.y + M[8] * p.z + M[12]) / cw + 1) / 2 * W;
      var sy = (1 - (M[1] * p.x + M[5] * p.y + M[9] * p.z + M[13]) / cw) / 2 * H;
      var d = Math.hypot(sx - px, sy - py), lim = Math.max(7, p.s / 2 + 3);
      if (d < lim && d < bd) { bd = d; best = p; }
    }
    return best;
  }

  /* ================================================================ การ์ด */
  function row(a, b) { return b == null || b === "" ? "" : '<div class="qk-row"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function mBadge(m, c) { c = c || "#ff2d55"; return '<span class="qk-badge" style="background:' + c + ';color:' + ink(c) + '">' + (m == null ? "?" : "M " + m.toFixed(1)) + '</span>'; }
  function link(href, t) { return '<a href="' + href + '" target="_blank" rel="noopener">' + t + ' ' + ico("external-link") + '</a>'; }
  var HOT = ico("phone") + ' กรมอุตุฯ <b>1182</b> · ปภ. <b>1784</b>';
  function evCard(e) {
    var h = '<div class="qk-pop"><div class="qk-pop-t">' + mBadge(e.mag, evColor(e)) + ' <b>' + esc(e.th || e.en) + '</b></div>';
    h += '<p class="qk-lead">' + thTime(e.t, true) + ' <small>(' + ago(e.t) + ')</small><br><small>' + esc(magClass(e.mag || 0)) + '</small></p>';
    if (e.k) h += row("ขนาด (กรมอุตุฯ)", fmt(e.k[4], 1));
    if (e.u) h += row("ขนาด (USGS)", fmt(e.u.mag, 1) + " " + esc(e.u.mt || ""));
    var d1 = e.k ? e.k[3] : null, d2 = e.u ? e.u.dep : null, dp = [];
    if (d1 != null) dp.push(fmt(d1, 0) + " กม." + (d2 != null ? " (กรมอุตุฯ)" : ""));
    if (d2 != null) dp.push(fmt(d2, 0) + " กม." + (d1 != null ? " (USGS)" : ""));
    if (dp.length) h += row("ความลึก", dp.join(" · ") + " · " + depClass(e.dep3));
    if (e.near) h += row("เทียบอำเภอใกล้สุด", esc(e.near));
    h += row("ห่างจาก กทม.", fmt(e.d, 0) + " กม.");
    h += row("พิกัด", e.lat.toFixed(3) + ", " + e.lon.toFixed(3));
    if (e.k && e.u) {
      var dd = distKm([e.u.lon, e.u.lat], [e.lon, e.lat]);
      if (dd > 10) h += '<p class="qk-note">USGS ระบุศูนย์กลางห่างจากตำแหน่งของกรมอุตุฯ ราว ' + fmt(dd, 0) + ' กม. — แต่ละหน่วยงานคำนวณจากสถานีวัดคนละชุด</p>';
    }
    if (e.en && e.k) h += '<p class="qk-note">' + esc(e.en) + '</p>';
    var ls = [];
    if (e.k) ls.push(link(e.id ? TMD_URL + "inside-info.html?earthquake=" + e.id : TMD_URL, "กรมอุตุฯ"));
    if (e.u) ls.push(link(USGS_EV + encodeURIComponent(e.u.id), "USGS"));
    return h + '<div class="qk-pop-f">' + ls.join(" · ") + '<br>' + HOT + '</div></div>';
  }
  var TY = { s: "เลื่อนตามแนวระดับ (strike-slip)", n: "รอยเลื่อนปกติ (normal) — เปลือกโลกยืดตัว ด้านหนึ่งทรุดลง" };
  var SE = { l: "เหลื่อมซ้าย", r: "เหลื่อมขวา", n: "" };
  var DIR2 = { N: "เหนือ", S: "ใต้", E: "ตะวันออก", W: "ตะวันตก", NE: "ตะวันออกเฉียงเหนือ", NW: "ตะวันตกเฉียงเหนือ", SE: "ตะวันออกเฉียงใต้", SW: "ตะวันตกเฉียงใต้",
    NNE: "เหนือค่อนตะวันออก", NNW: "เหนือค่อนตะวันตก", SSE: "ใต้ค่อนตะวันออก", SSW: "ใต้ค่อนตะวันตก", ENE: "ตะวันออกค่อนเหนือ", ESE: "ตะวันออกค่อนใต้", WNW: "ตะวันตกค่อนเหนือ", WSW: "ตะวันตกค่อนใต้" };
  var REM = { "fault scarp": "ผารอยเลื่อน", "triangular facets": "ผาหน้าจั่วสามเหลี่ยม", "offset stream": "ลำธารหักเหลื่อม", "shutter ridge": "สันเขาเหลื่อมปิดหุบ", "linear valley": "หุบเขาแนวตรง", "linear valleay": "หุบเขาแนวตรง" };
  function strikeTH(s) { var p = String(s || "").split("-"); return p.length === 2 && DIR2[p[0]] && DIR2[p[1]] ? DIR2[p[0]] + " – " + DIR2[p[1]] : ""; }
  function dmrCard(i) {
    var s = G.dmr[i], z = G.zones[s.z];
    var h = '<div class="qk-pop"><div class="qk-pop-t"><span class="qk-badge" style="background:#ff7a3d">รอยเลื่อนมีพลัง</span> <b>กลุ่มรอยเลื่อน' + esc(z.t) + '</b> <small>' + esc(z.e) + '</small></div>';
    h += '<p class="qk-lead">รอยเลื่อนย่อย <b>' + esc(s.nt) + '</b> <small>(' + esc(s.ne) + ')</small></p>';
    h += row("ชนิด", (TY[s.ty] || "") + (SE[s.se] ? " · " + SE[s.se] : ""));
    h += row("แนววางตัว", strikeTH(s.st));
    h += row("ความยาวเส้นนี้", fmt(s.km, 1) + " กม.");
    h += row("ขนาดสูงสุดที่อาจเกิด (MCE)", fmt(s.mce, 1));
    h += row("อัตราการเลื่อนตัว", s.sr ? fmt(s.sr, 2) + " มม./ปี" : "");
    h += row("คาบอุบัติซ้ำ", s.rec ? "ราว " + fmt(s.rec) + " ปี" : "");
    h += row("เลื่อนครั้งล่าสุด", s.age ? "ราว " + fmt(s.age) + " ปีก่อน" + (s.dat ? " (หาอายุด้วย " + esc(s.dat) + ")" : "") : "");
    var rem = s.rem ? s.rem.split(/\s*,\s*/).map(function (x) { return REM[x.toLowerCase()] || x; }).join(" · ") : "";
    h += row("หลักฐานทางธรณีสัณฐาน", esc(rem));
    h += '<div class="qk-zone">ทั้งกลุ่ม: รอยเลื่อนย่อย ' + fmt(z.n) + ' เส้น · แนวยาวราว ' + fmt(z.ext) + ' กม. · MCE สูงสุด ' + fmt(z.mce, 1) + '</div>';
    h += '<p class="qk-note">MCE = ขนาดแผ่นดินไหวสูงสุดที่ประเมินว่ารอยเลื่อนนี้ก่อได้ <b>ไม่ใช่การพยากรณ์</b>ว่าจะเกิดเมื่อใด · คาบอุบัติซ้ำเป็นค่าเฉลี่ยทางธรณีวิทยา</p>';
    return h + '<div class="qk-pop-f">ข้อมูล: กรมทรัพยากรธรณี (CC BY) · ' + link("https://data.go.th/dataset/2f32b01e-6ae7-4b66-aa2c-730a87051793", "ชุดข้อมูล") + '</div></div>';
  }
  var GSLIP = { r: "เลื่อนตามแนวระดับ เหลื่อมขวา", l: "เลื่อนตามแนวระดับ เหลื่อมซ้าย", ss: "เลื่อนตามแนวระดับ", n: "รอยเลื่อนปกติ (normal)", t: "รอยเลื่อนย้อน (reverse/thrust)",
    rn: "เหลื่อมขวา + ปกติ", ln: "เหลื่อมซ้าย + ปกติ", rt: "เหลื่อมขวา + ย้อน", lt: "เหลื่อมซ้าย + ย้อน", nr: "ปกติ + เหลื่อมขวา", nl: "ปกติ + เหลื่อมซ้าย",
    tr: "ย้อน + เหลื่อมขวา", tl: "ย้อน + เหลื่อมซ้าย", ts: "ย้อน + เลื่อนตามแนวระดับ", sz: "แนวมุดตัวของแผ่นเปลือกโลก", sp: "สันเปลือกโลกแยกตัว" };
  function gemCard(i) {
    var s = G.gem[i], sag = s.n === "สะกาย";
    var h = '<div class="qk-pop"><div class="qk-pop-t"><span class="qk-badge" style="background:' + (sag ? "#ff5a36" : "#8b5cf6") + '">รอยเลื่อนมีพลัง</span> <b>' + (sag ? "รอยเลื่อนสะกาย (เมียนมา)" : s.n ? esc(s.n) : "รอยเลื่อนนอกประเทศไทย") + '</b></div>';
    h += row("ชนิด", GSLIP[s.s] || "–");
    h += row("อัตราการเลื่อนตัว", s.sr ? fmt(s.sr, 1) + " มม./ปี" : "");
    if (sag) h += '<p class="qk-note">ช่วงนี้ทับแนวที่แตกเมื่อ 28 มี.ค. 2568 ตามแผนที่ของ USGS — รอยเลื่อนสะกายยาวกว่า 1,000 กม. พาดเหนือ–ใต้กลางเมียนมา เป็นรอยต่อระหว่างแผ่นอินเดียกับแผ่นซุนดา</p>';
    else if (!s.n) h += '<p class="qk-note">ชุดข้อมูล GEM ส่วนเอเชียตะวันออกเฉียงใต้ไม่ได้ระบุชื่อรอยเลื่อน</p>';
    return h + '<div class="qk-pop-f">ข้อมูล: GEM Global Active Faults Database (CC BY-SA 4.0)' + (s.c ? " · ชุดย่อย " + esc(s.c) : "") + '</div></div>';
  }
  function eq25Card() {
    var E = G.eq2025, m = E.main;
    var bkk = E.cities[0];
    var h = '<div class="qk-pop"><div class="qk-pop-t">' + mBadge(m.mag) + ' <b>แผ่นดินไหวเมียนมา 28 มี.ค. 2568</b></div>';
    h += '<p class="qk-lead">' + thTime(m.t, true) + ' · ศูนย์กลางใกล้เมืองมัณฑะเลย์ ภาคสะกาย ลึก ' + fmt(m.dep, 0) + ' กม.</p>';
    h += row("ขนาด", "Mw " + fmt(m.mag, 1) + " (USGS)");
    h += row("รอยเลื่อน", "สะกาย · เลื่อนตามแนวระดับ เหลื่อมขวา");
    h += row("แนวที่แตก", "ราว " + fmt(E.rupKm) + " กม. · ลึก 0–" + E.rupBottom + " กม.");
    h += row("ความรุนแรงสูงสุด", "MMI " + roman(m.mmiMax));
    h += row("ความรุนแรงที่ กทม. (ประมาณ)", "MMI " + roman(bkk[3]) + " (" + fmt(bkk[3], 1) + ")");
    h += row("อาฟเตอร์ช็อกใน 3 เดือน (USGS)", fmt(E.after.length) + " ครั้ง");
    h += row("ผู้เสียชีวิต", "เมียนมา สูงสุด 5,352 · ไทย 103 คน");
    h += '<p class="qk-note">กรุงเทพฯ อยู่ห่างศูนย์กลางกว่า 1,000 กม. แต่รู้สึกแรง เพราะแนวแตกวิ่งเร็วกว่าคลื่นเฉือน (supershear) และแอ่งดินเหนียวอ่อนใต้กรุงเทพฯ ขยายคลื่นคาบยาว ตึกสูงจึงโยกมาก</p>';
    h += '<div class="qk-sub">ความรุนแรงตามเมือง (ShakeMap)</div><div class="qk-cities">' + E.cities.map(function (c) {
      return '<span><i style="background:' + mmiColor(c[3] || 1) + '"></i>' + esc(c[0]) + ' <b>' + roman(c[3]) + '</b></span>';
    }).join("") + '</div>';
    if (bkk[3] != null) h += '<p class="qk-note">MMI ' + roman(Math.round(bkk[3])) + ': ' + esc(MMI_TXT[Math.round(bkk[3])]) + '</p>';
    return h + '<div class="qk-pop-f">' + link(m.url, "USGS ShakeMap") + ' · ' + link(WIKI_EQ, "วิกิพีเดีย") + '<br>ความรุนแรง = แบบจำลอง ShakeMap v23 · แนวแตก: Reitman และคณะ (USGS 2025) · ตัวเลขผู้เสียชีวิต: วิกิพีเดีย</div></div>';
  }
  function saoCard() {
    var E = G.eq2025, d = distKm([E.sao.lon, E.sao.lat], [E.main.lon, E.main.lat]);
    var h = '<div class="qk-pop"><div class="qk-pop-t"><span class="qk-badge" style="background:#ff2d55">อาคารถล่ม</span> <b>อาคารที่ทำการ สตง. (ระหว่างก่อสร้าง)</b></div>';
    h += '<p class="qk-lead">ถ.กำแพงเพชร 2 เขตจตุจักร ข้างสถานีกลางกรุงเทพอภิวัฒน์ — ถล่มลงทั้งหลังหลังแผ่นดินไหว 28 มี.ค. 2568</p>';
    h += row("ความสูง", "33 ชั้น · 137 ม. (สร้างไปราว 30%)");
    h += row("ผู้เสียชีวิต / บาดเจ็บ", "96 / 9 คน");
    h += row("ห่างจากศูนย์กลาง", fmt(d, 0) + " กม.");
    h += row("ความรุนแรงที่ตั้ง (ShakeMap)", "MMI " + roman(E.cities[0][3]));
    h += '<p class="qk-note">เป็นอาคารหลังเดียวในไทยที่ถล่มจากเหตุนี้ · ผลตรวจสอบของรัฐบาล (มิ.ย. 2568) ระบุสาเหตุที่การออกแบบและการก่อสร้างผนังปล่องลิฟต์และบันได ซึ่งต้องรับแรงเฉือน</p>';
    return h + '<div class="qk-pop-f">ที่มา: ' + link(WIKI_SAO, "วิกิพีเดีย") + ' (ตัวเลขสุดท้าย มี.ค. 2569)</div></div>';
  }
  function afterCard(i) {
    var a = G.eq2025.after[i];
    var h = '<div class="qk-pop"><div class="qk-pop-t">' + mBadge(a[4], "#ff7a93") + ' <b>อาฟเตอร์ช็อก</b> <small>เหตุ 28 มี.ค. 2568</small></div>';
    h += '<p class="qk-lead">' + thTime(a[0], true) + '</p>';
    h += row("ขนาด", fmt(a[4], 1) + " " + esc(a[5]));
    h += row("ความลึก", fmt(a[3], 0) + " กม.");
    h += row("หลังเหตุหลัก", fmt((a[0] - G.eq2025.main.t) / 864e5, 1) + " วัน");
    return h + '<div class="qk-pop-f">' + link(USGS_EV + encodeURIComponent(a[6]), "USGS") + '</div></div>';
  }
  function openPopup(lngLat, html) {
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ closeButton: true, maxWidth: "330px", className: "qk-popup", offset: 12 }).setLngLat(lngLat).setHTML(html).addTo(map);
  }
  function bindHandlers() {
    if (handlersBound) return;
    handlersBound = true;
    var ORDER = ["qk-sao", "qk-main", "qk-pts", "qk-after", "qk-rup", "qk-dmr", "qk-gem"];
    var hits = function (pt) {
      if (!visible) return [];
      var ids = ORDER.filter(function (id) { return map.getLayer(id) && map.getLayoutProperty(id, "visibility") !== "none"; });
      if (!ids.length) return [];
      return map.queryRenderedFeatures([[pt.x - 5, pt.y - 5], [pt.x + 5, pt.y + 5]], { layers: ids });
    };
    map.on("click", function (e) {
      if (!visible) return;
      var fs = hits(e.point);
      var first = function (id) { for (var k = 0; k < fs.length; k++) if (fs[k].layer.id === id) return fs[k]; return null; };
      var f;
      if ((f = first("qk-sao"))) return openPopup(f.geometry.coordinates.slice(), saoCard());
      if ((f = first("qk-main"))) return openPopup(f.geometry.coordinates.slice(), eq25Card());
      if ((f = first("qk-pts"))) { var ev = EV[f.properties.i]; if (ev) return openPopup([ev.lon, ev.lat], evCard(ev)); }
      var p3 = pick3D(e.point.x, e.point.y);
      if (p3) {
        var ll = [p3.x * 360 - 180, latOfMercY(p3.y)];
        if (p3.ref.k === "ev" && EV[p3.ref.i]) return openPopup(ll, evCard(EV[p3.ref.i]));
        if (p3.ref.k === "af") return openPopup(ll, afterCard(p3.ref.i));
        if (p3.ref.k === "main") return openPopup(ll, eq25Card());
      }
      if ((f = first("qk-after"))) return openPopup(f.geometry.coordinates.slice(), afterCard(f.properties.i));
      if (first("qk-rup")) return openPopup(e.lngLat, eq25Card());
      if ((f = first("qk-dmr"))) return openPopup(e.lngLat, dmrCard(f.properties.i));
      if ((f = first("qk-gem"))) return openPopup(e.lngLat, gemCard(f.properties.i));
    });
    var hov = false;
    map.on("mousemove", function (e) {
      if (!visible) return;
      var h = hits(e.point).length > 0 || !!pick3D(e.point.x, e.point.y);
      if (h !== hov) { hov = h; map.getCanvas().style.cursor = h ? "pointer" : ""; }
    });
  }
  function flyEv(i) {
    var e = EV[i]; if (!e) return;
    var ll = [e.lon, e.lat];
    map.flyTo({ center: ll, zoom: Math.max(map.getZoom(), 7), duration: 1500, essential: true });
    map.once("moveend", function () { openPopup(ll, evCard(e)); });
  }
  function flyZone(z) {
    var b = null;
    G.dmr.forEach(function (s) {
      if (s.z !== z) return;
      s.g.forEach(function (l) { l.forEach(function (p) { if (!b) b = [p[0], p[1], p[0], p[1]]; b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); }); });
    });
    if (b) map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 90, maxZoom: 9.5, duration: 1500 });
  }
  function showEq25() {
    sub.eq25 = true; saveSub();
    loadGeo().then(function () {
      addLayers(); syncLayerVis(); rebuild3D(); renderPanel();
      var E = G.eq2025;
      map.fitBounds([[93.8, 12.6], [102.6, 24.2]], { padding: 70, duration: 1700 });
      map.once("moveend", function () { openPopup([E.main.lon, E.main.lat], eq25Card()); });
    });
  }
  function tilt3D() {
    sub.d3 = true; saveSub(); syncLayerVis(); rebuild3D(); renderPanel();
    map.easeTo({ pitch: 62, bearing: Math.abs(map.getBearing()) > 3 ? map.getBearing() : -20, duration: 1500 });
  }

  /* ================================================================ แผงควบคุม */
  var CSS = [
    "#quakePanel{position:absolute;z-index:44;right:14px;bottom:40px;width:330px;max-width:calc(100% - 28px);max-height:calc(100% - 120px);overflow:auto;display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.5}",
    "#quakePanel.open{display:block;animation:qkIn .22s ease}@keyframes qkIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",
    ".qk-ph{display:flex;align-items:center;gap:8px;padding:11px 12px 6px 14px;font-weight:800;font-size:13.5px;position:sticky;top:0;background:inherit;z-index:1}",
    ".qk-ph .qk-ib{margin-left:auto}.qk-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".qk-ib .mdico{width:13px;height:13px}.qk-ph>.mdico{color:#ff4d6d}",
    "#quakePanel.min .qk-body{display:none}",
    ".qk-body{padding:0 14px 12px}",
    ".qk-sum{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:2px 0 4px}",
    ".qk-sum div{border-radius:10px;padding:5px 7px;border:1px solid var(--card-border);background:rgba(127,127,127,.08);min-width:0}",
    ".qk-sum b{display:block;font-size:15.5px;font-variant-numeric:tabular-nums;line-height:1.2;white-space:nowrap}.qk-sum small{opacity:.72;font-size:10px;display:block;line-height:1.3}",
    ".qk-meta{font-size:10.5px;opacity:.68;margin:0 0 6px}",
    ".qk-chips{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 5px;align-items:center}.qk-chips>span{font-size:10.5px;opacity:.7;margin-right:2px;min-width:44px}",
    ".qk-chip{border:1px solid var(--card-border);background:rgba(127,127,127,.08);color:inherit;font:inherit;font-size:11px;border-radius:999px;padding:2px 9px;cursor:pointer}",
    ".qk-chip.on{background:var(--accent);border-color:var(--accent);color:#061018;font-weight:700}",
    ".qk-sec{border-top:1px solid var(--card-border);padding:8px 0 6px}",
    ".qk-h{font-weight:800;display:flex;align-items:center;gap:6px;margin-bottom:5px}.qk-h small{margin-left:auto;font-weight:500;opacity:.65}.qk-h .mdico{width:13px;height:13px}",
    ".qk-h label{display:flex;align-items:center;gap:6px;cursor:pointer}.qk-h input{accent-color:var(--accent);margin:0}",
    ".qk-tabs{display:flex;gap:4px;margin-left:auto}",
    ".qk-list{display:flex;flex-direction:column;gap:3px;max-height:230px;overflow:auto}",
    ".qk-it{display:flex;align-items:center;gap:8px;border:0;background:rgba(127,127,127,.07);border-radius:8px;padding:5px 8px;color:inherit;font:inherit;font-size:12px;text-align:left;cursor:pointer}",
    ".qk-it:hover{background:var(--accent-soft)}.qk-it span{flex:1;min-width:0}.qk-it span b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.qk-it span small{opacity:.65;display:block;font-size:10.5px}",
    ".qk-it em{font-style:normal;font-size:10.5px;opacity:.75;white-space:nowrap}",
    ".qk-m{flex:none;min-width:34px;text-align:center;border-radius:7px;padding:1px 4px;font-size:11.5px;font-weight:800;color:#0b0f17;font-variant-numeric:tabular-nums}",
    ".qk-zl{display:grid;grid-template-columns:1fr 1fr;gap:3px}.qk-zl .qk-it{padding:4px 7px;font-size:11.5px}",
    ".qk-btn{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--accent);background:var(--accent-soft);color:inherit;font:inherit;font-size:11.5px;font-weight:700;border-radius:8px;padding:4px 9px;cursor:pointer}.qk-btn .mdico{width:13px;height:13px}",
    ".qk-rng{display:flex;align-items:center;gap:8px;font-size:11px;margin:5px 0}.qk-rng input{flex:1;accent-color:var(--accent)}",
    ".qk-leg{display:flex;flex-wrap:wrap;gap:3px 9px;font-size:10.5px;margin-top:4px}.qk-leg span{display:inline-flex;align-items:center;gap:4px}",
    ".qk-leg i,.qk-cities i{width:9px;height:9px;border-radius:50%;display:inline-block;flex:none}",
    ".qk-note{font-size:10.5px;opacity:.72;margin:4px 0}",
    ".qk-tip{margin:8px 0 0;padding:7px 9px;border-radius:9px;background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.35);font-size:11px;line-height:1.55}",
    ".qk-src{margin:8px 0 0;font-size:10px;opacity:.62;line-height:1.5}",
    ".qk-warn{color:#f59f0b}",
    ".qk-popup .maplibregl-popup-content{background:var(--card-bg);color:var(--text-main);border:1px solid var(--card-border);border-radius:12px;padding:11px 13px 9px;box-shadow:0 10px 30px rgba(0,0,0,.3);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);max-height:70vh;overflow:auto}",
    ".qk-popup .maplibregl-popup-tip{display:none}.qk-popup .maplibregl-popup-close-button{color:var(--text-muted);font-size:17px;right:4px;top:3px}",
    ".qk-pop{font-size:12px;line-height:1.5;min-width:250px}.qk-pop-t{margin:0 16px 5px 0;font-size:13px;line-height:1.45}.qk-pop-t small{opacity:.6;font-weight:500}",
    ".qk-lead{margin:0 0 6px;font-size:12px}.qk-lead small{opacity:.75}",
    ".qk-row{display:flex;gap:10px;justify-content:space-between;padding:1.5px 0}.qk-row span{opacity:.7;white-space:nowrap}.qk-row b{text-align:right;font-weight:600}",
    ".qk-badge{display:inline-flex;align-items:center;gap:3px;color:#0b0f17;font-size:10.5px;font-weight:800;border-radius:6px;padding:1px 6px;vertical-align:1px;white-space:nowrap}",
    ".qk-zone{margin:6px 0 2px;padding:5px 8px;border-radius:8px;background:rgba(255,122,61,.12);border:1px solid rgba(255,122,61,.35);font-size:11px;font-weight:600}",
    ".qk-sub{margin:7px 0 3px;font-weight:700;font-size:11.5px}",
    ".qk-cities{display:flex;flex-wrap:wrap;gap:3px 5px;font-size:11px}.qk-cities span{display:inline-flex;align-items:center;gap:4px;background:rgba(127,127,127,.12);border-radius:6px;padding:1px 6px}",
    ".qk-pop-f{margin-top:7px;padding-top:6px;border-top:1px solid var(--card-border);font-size:10.5px;opacity:.82}.qk-pop-f a{color:var(--accent);font-weight:700;text-decoration:none}.qk-pop-f .mdico{width:11px;height:11px;vertical-align:-1px}",
    "@media (max-width:760px){#quakePanel{bottom:86px;right:14px!important;left:14px;width:auto;max-height:42vh}}"
  ].join("");

  function chip(group, val, label, on) { return '<button type="button" class="qk-chip' + (on ? " on" : "") + '" data-g="' + group + '" data-v="' + val + '">' + label + '</button>'; }
  function chk(k, label, extra) {
    return '<label><input type="checkbox" data-s="' + k + '"' + (sub[k] ? " checked" : "") + '>' + label + '</label>' + (extra ? '<small>' + extra + '</small>' : "");
  }
  function legend() {
    var rows = opt.color === "depth" ? DEP.map(function (d) { return '<span><i style="background:' + d[1] + '"></i>' + d[2] + ' กม.</span>'; }) :
      AGE.map(function (a) { return '<span><i style="background:' + a[1] + '"></i>' + a[2] + '</span>'; });
    return '<div class="qk-leg">' + rows.join("") + '</div>';
  }
  function renderPanel() {
    var p = $("#quakePanel");
    if (!p || !visible) return;
    var body = p.querySelector(".qk-body"), h = "";
    var loading = (opt.tmd && !T.data && !T.err) || (opt.usgs && !U.m30 && !U.err);
    h += '<div class="qk-sum">' +
      '<div><b>' + fmt(ST.n || 0) + '</b><small>เหตุใน ' + WIN[opt.win].t + '</small></div>' +
      '<div><b>' + (ST.top ? "M" + fmt(ST.top.mag, 1) : "–") + '</b><small>แรงสุด</small></div>' +
      '<div><b>' + fmt(ST.thai || 0) + '</b><small>ในประเทศไทย</small></div>' +
      '<div><b>' + (ST.near ? fmt(ST.near.d, 0) : "–") + '</b><small>กม. ใกล้ กทม. สุด</small></div></div>';
    var meta = [];
    if (opt.tmd) meta.push(T.err ? '<span class="qk-warn">กรมอุตุฯ โหลดไม่สำเร็จ</span>' : T.data ? "กรมอุตุฯ " + fmt(ST.tmd) + " เหตุ" : "กำลังโหลดกรมอุตุฯ…");
    if (opt.usgs) meta.push(U.err ? '<span class="qk-warn">USGS โหลดไม่สำเร็จ</span>' : U.m30 ? "USGS " + fmt(ST.usgs) + " เหตุ" : "กำลังโหลด USGS…");
    if (ST.dup) meta.push("ซ้ำกัน " + fmt(ST.dup) + " เหตุ (รวมเป็นจุดเดียว)");
    h += '<p class="qk-meta">' + meta.join(" · ") + (T.at ? " · อัปเดต " + ago(Math.max(T.at, U.at30)) : "") + '</p>';
    h += '<div class="qk-chips"><span>ช่วงเวลา</span>' + Object.keys(WIN).map(function (k) { return chip("win", k, WIN[k].t, opt.win === k); }).join("") + '</div>';
    h += '<div class="qk-chips"><span>ขนาด</span>' + MAGS.map(function (m) { return chip("minM", m, m ? "≥" + m : "ทั้งหมด", opt.minM === m); }).join("") + '</div>';
    h += '<div class="qk-chips"><span>สีตาม</span>' + chip("color", "age", "เวลา", opt.color === "age") + chip("color", "depth", "ความลึก", opt.color === "depth") +
      '<span style="min-width:0;margin-left:6px">แหล่ง</span>' + chip("tmd", 1, "กรมอุตุฯ", opt.tmd) + chip("usgs", 1, "USGS", opt.usgs) + '</div>';
    h += legend();

    // รายการ
    h += '<div class="qk-sec"><div class="qk-h">' + chk("pts", ico("activity") + " จุดแผ่นดินไหว") +
      '<span class="qk-tabs">' + chip("list", "new", "ล่าสุด", opt.list === "new") + chip("list", "big", "แรงสุด", opt.list === "big") + chip("list", "th", "ในไทย", opt.list === "th") + '</span></div>';
    var L = EV.slice();
    if (opt.list === "big") L.sort(function (a, b) { return (b.mag || 0) - (a.mag || 0) || b.t - a.t; });
    if (opt.list === "th") L = L.filter(function (e) { return e.thai; });
    if (loading && !L.length) h += '<p class="qk-note">กำลังโหลดข้อมูลแผ่นดินไหว…</p>';
    else if (!L.length) h += '<p class="qk-note">ไม่มีเหตุในช่วงนี้ตามเงื่อนไขที่เลือก</p>';
    else h += '<div class="qk-list">' + L.slice(0, 60).map(function (e) {
      var c = evColor(e);
      return '<button type="button" class="qk-it" data-k="ev" data-i="' + e.i + '"><b class="qk-m" style="background:' + c + ';color:' + ink(c) + '">' + (e.mag == null ? "?" : e.mag.toFixed(1)) + '</b>' +
        '<span><b>' + esc(e.th || e.en) + '</b><small>ลึก ' + fmt(e.dep3, 0) + ' กม. · ' + fmt(e.d, 0) + ' กม. จาก กทม.' + (e.k && e.u ? " · 2 แหล่ง" : e.u ? " · USGS" : "") + '</small></span><em>' + whenShort(e.t) + '</em></button>';
    }).join("") + '</div>';
    h += '</div>';

    // รอยเลื่อน
    h += '<div class="qk-sec"><div class="qk-h">' + chk("faults", '<i style="width:14px;height:3px;background:#ff7a3d;display:inline-block;border-radius:2px"></i> รอยเลื่อนมีพลัง', G ? G.zones.length + " กลุ่มในไทย" : sub.faults ? "กำลังโหลด…" : "") + '</div>';
    if (G && sub.faults) {
      h += '<div class="qk-zl">' + G.zones.map(function (z, i) { return { z: z, i: i }; }).sort(function (a, b) { return b.z.mce - a.z.mce; }).map(function (x) {
        return '<button type="button" class="qk-it" data-k="zone" data-i="' + x.i + '"><span><b>' + esc(x.z.t) + '</b><small>MCE ' + fmt(x.z.mce, 1) + ' · ~' + fmt(x.z.ext) + ' กม.</small></span></button>';
      }).join("") + '</div>';
      h += '<p class="qk-note">สีส้มเข้ม = ขนาดสูงสุดที่อาจเกิดสูง (กรมทรัพยากรธรณี) · เส้นประม่วง = รอยเลื่อนในประเทศเพื่อนบ้าน (GEM)</p>';
    }
    h += '</div>';

    // เหตุ 28 มี.ค. 2568
    h += '<div class="qk-sec"><div class="qk-h">' + chk("eq25", '<i style="width:10px;height:10px;background:#ff2d55;display:inline-block;clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)"></i> เหตุ 28 มี.ค. 2568 (M7.7 เมียนมา)') + '</div>' +
      '<p class="qk-note">ความรุนแรงของการสั่นไหว (ShakeMap) · แนวรอยเลื่อนสะกายที่แตก · อาฟเตอร์ช็อก · จุดอาคาร สตง. ถล่ม</p>' +
      '<button type="button" class="qk-btn" data-a="eq25">' + ico("activity") + ' ดูเหตุการณ์นี้</button></div>';

    // 3 มิติ
    h += '<div class="qk-sec"><div class="qk-h">' + chk("d3", ico("rotate-3d") + " จุดกำเนิดใต้ดิน 3 มิติ") + '</div>' +
      '<p class="qk-note">เอียงแผนที่ (คลิกขวาค้างแล้วลาก หรือสองนิ้วลากขึ้น) จะเห็นลูกกลมอยู่ใต้ดินตามความลึกจริง มีเส้นโยงขึ้นมาถึงศูนย์กลางบนผิวดิน</p>' +
      '<div class="qk-rng"><span>ขยายความลึก</span><input type="range" min="1" max="12" step="1" value="' + opt.exag + '" data-a="exag"><b id="qkExag">×' + opt.exag + '</b></div>' +
      '<button type="button" class="qk-btn" data-a="tilt">' + ico("rotate-3d") + ' เอียงดู 3 มิติ</button>' +
      (opt.color !== "depth" ? ' <button type="button" class="qk-btn" data-a="depthc">ใช้สีตามความลึก</button>' : "") + '</div>';

    h += '<div class="qk-tip"><b>ระหว่างแผ่นดินไหว:</b> หมอบลง ป้องศีรษะ เกาะโต๊ะที่แข็งแรง · อย่าใช้ลิฟต์ · อยู่ห่างกระจกและของที่ตกได้ · ออกจากอาคารเมื่อหยุดสั่นแล้ว<br>' +
      '<b>ยังไม่มีใครพยากรณ์วันเวลาเกิดแผ่นดินไหวได้</b> — ข่าวทำนายล่วงหน้าเป็นข่าวลือ · ' + HOT + '</div>';
    h += '<p class="qk-src">แผ่นดินไหว: กองเฝ้าระวังแผ่นดินไหว กรมอุตุนิยมวิทยา · USGS · รอยเลื่อน: กรมทรัพยากรธรณี (CC BY), GEM Global Active Faults (CC BY-SA 4.0) · เหตุ 2568: USGS ShakeMap/แนวแตก · ขนาดของสองหน่วยงานอาจต่างกันเพราะใช้มาตราและสถานีต่างกัน</p>';
    var sc = body.querySelector(".qk-list"), top = sc ? sc.scrollTop : 0;
    body.innerHTML = h;
    sc = body.querySelector(".qk-list"); if (sc) sc.scrollTop = top;
  }

  function placePanel() {
    var p = $("#quakePanel");
    if (!p || !visible || window.innerWidth <= 760) { if (p) p.style.right = ""; return; }
    var n = 0;
    ["#floodPanel", "#damPanel", "#warnPanel"].forEach(function (s) { var e = $(s); if (e && e.classList.contains("open") && e.offsetParent) n++; });
    var st = $(".stage"), W = st ? st.clientWidth : window.innerWidth, right = 14 + n * 344;
    if (right + 330 > W - 20) right = 14;
    p.style.right = right + "px";
  }
  function saveSub() { lsSet(LS_SUB, JSON.stringify(sub)); }
  function saveOpt() { lsSet(LS_OPT, JSON.stringify(opt)); }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    addIcons();
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnQuakeToggle")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "menu-btn"; b.id = "btnQuakeToggle";
      b.title = "เปิด/ปิดชั้นแผ่นดินไหว — จุดแผ่นดินไหวล่าสุด (กรมอุตุฯ + USGS) รอยเลื่อนมีพลัง เหตุ 28 มี.ค. 2568 และจุดกำเนิดใต้ดิน 3 มิติ";
      b.innerHTML = '<span>' + ico("activity") + '</span><span class="label-text"> แผ่นดินไหว</span>';
      b.addEventListener("click", function () { setVisible(!visible); });
      var after = $("#btnWarnToggle") || $("#btnDamToggle") || $("#btnFloodToggle");
      if (after && after.parentNode === menu) menu.insertBefore(b, after.nextSibling); else menu.appendChild(b);
    }
    if (!$("#quakePanel")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var p = document.createElement("div");
      p.id = "quakePanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "แผ่นดินไหว");
      p.innerHTML = '<div class="qk-ph">' + ico("activity") + ' แผ่นดินไหว' +
        '<button type="button" class="qk-ib" data-a="min" title="ย่อ/ขยาย">' + ico("minus") + '</button>' +
        '<button type="button" class="qk-ib" style="margin-left:0" data-a="close" title="ปิดชั้นนี้">×</button></div><div class="qk-body"></div>';
      if (lsGet(LS_MIN) === "1") p.classList.add("min");
      stage.appendChild(p);
      p.addEventListener("click", function (e) {
        var a = e.target.closest("[data-a]"), c = e.target.closest(".qk-chip"), it = e.target.closest(".qk-it");
        if (a && a.tagName !== "INPUT") {
          var act = a.dataset.a;
          if (act === "close") return setVisible(false);
          if (act === "min") { var m = !p.classList.contains("min"); p.classList.toggle("min", m); lsSet(LS_MIN, m ? "1" : "0"); return; }
          if (act === "eq25") return showEq25();
          if (act === "tilt") return tilt3D();
          if (act === "depthc") { opt.color = "depth"; saveOpt(); refresh(); return; }
        }
        if (c) {
          var g = c.dataset.g, v = c.dataset.v;
          if (g === "win") opt.win = v;
          else if (g === "minM") opt.minM = +v;
          else if (g === "color") opt.color = v;
          else if (g === "list") opt.list = v;
          else if (g === "tmd" || g === "usgs") { opt[g] = !opt[g]; if (!opt.tmd && !opt.usgs) opt[g === "tmd" ? "usgs" : "tmd"] = true; }
          saveOpt(); ensureData(); refresh(); return;
        }
        if (it && it.dataset.k === "ev") return flyEv(+it.dataset.i);
        if (it && it.dataset.k === "zone") return flyZone(+it.dataset.i);
      });
      p.addEventListener("change", function (e) {
        var k = e.target.dataset && e.target.dataset.s;
        if (!k) return;
        sub[k] = e.target.checked;
        saveSub();
        if ((k === "faults" || k === "eq25") && sub[k] && !G) loadGeo();
        syncLayerVis(); rebuild3D(); renderPanel();
      });
      p.addEventListener("input", function (e) {
        if (!e.target.dataset || e.target.dataset.a !== "exag") return;
        opt.exag = +e.target.value; saveOpt();
        var l = $("#qkExag"); if (l) l.textContent = "×" + opt.exag;
        rebuild3D();
      });
    }
    // ขยับแผงไม่ให้ทับแผงชั้นอื่นที่เปิดอยู่มุมขวาล่าง
    if (!panelObs && window.MutationObserver) {
      panelObs = new MutationObserver(placePanel);
      ["#floodPanel", "#damPanel", "#warnPanel"].forEach(function (s) { var e = $(s); if (e) panelObs.observe(e, { attributes: true, attributeFilter: ["class"] }); });
      window.addEventListener("resize", placePanel);
    }
    syncButtons();
  }
  function syncButtons() {
    var b = $("#btnQuakeToggle"), p = $("#quakePanel");
    if (b) b.classList.toggle("active", visible);
    if (p) p.classList.toggle("open", visible);
    placePanel();
  }

  function refresh() {
    merge();
    if (map && map.getSource("qk-ev")) setGeo("qk-ev", evGeo());
    rebuild3D();
    renderPanel();
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
    merge();
    addLayers();
    bindHandlers();
    renderPanel();
    ensureData();
    refreshTimer = setInterval(function () { if (!document.hidden) ensureData(); }, 5 * 60000);
    if (map.getZoom() > 8.5) map.flyTo({ center: [99.5, 16.5], zoom: 4.9, pitch: 0, bearing: 0, duration: 1600 });
  }

  /* ================================================================ mount — เรียกซ้ำทุกครั้งที่เปลี่ยนสไตล์แผนที่ */
  function mount(m) {
    map = m;
    try { var s = JSON.parse(lsGet(LS_SUB) || "null"); if (s) Object.keys(sub).forEach(function (k) { if (typeof s[k] === "boolean") sub[k] = s[k]; }); } catch (e) { }
    try {
      var o = JSON.parse(lsGet(LS_OPT) || "null");
      if (o) Object.keys(opt).forEach(function (k) { if (typeof o[k] === typeof opt[k]) opt[k] = o[k]; });
      if (!WIN[opt.win]) opt.win = "d7";
      opt.exag = Math.max(1, Math.min(12, opt.exag | 0 || 3));
    } catch (e) { }
    buildUI();
    if (lsGet(LS_KEY) === "1" && !visible) { setVisible(true); return; }
    if (!visible) return;
    addLayers();   // สไตล์ใหม่ล้างชั้น (และรูปไอคอน) ทิ้งหมด → วางกลับ
  }

  window.BKK_QUAKE = {
    mount: mount,
    setVisible: setVisible,
    mapRef: function () { return map; },
    showEq25: showEq25,
    tilt3D: tilt3D,
    // หน้าเรียกก่อน auto-tilt (ซูม < 13 = กดแผนที่แบน) — เปิดชั้น 3 มิติและเอียงอยู่ = ให้คงมุมไว้
    holdTilt: function () { return !!(visible && sub.d3 && map && map.getPitch() > 8); },
    debug: function () {
      return {
        visible: visible, sub: sub, opt: opt, tmd: T.data ? T.data.n : null, tmdErr: T.err, usgs30: U.m30 ? U.m30.length : null, usgsYr: U.yr ? U.yr.length : null, usgsErr: U.err,
        st: { n: ST.n, tmd: ST.tmd, usgs: ST.usgs, dup: ST.dup, thai: ST.thai, top: ST.top && ST.top.mag, near: ST.near && Math.round(ST.near.d) },
        geo: !!G, r3: { on: R3.on, np: R3.np, nl: R3.nl, nt: R3.nt, drew: !!R3.M },
        layers: LAYERS.filter(function (id) { return map && map.getLayer(id); })
      };
    },
    // ตำแหน่งบนจอของจุดใต้ดิน n จุดแรก (ใช้ทดสอบการคลิกในโหมด 3 มิติ)
    debug3D: function (n) {
      if (!R3.M) return [];
      var M = R3.M, cv = map.getCanvas();
      return R3.pts.slice(-(n || 3)).map(function (p) {
        var w = M[3] * p.x + M[7] * p.y + M[11] * p.z + M[15];
        return { ref: p.ref, dep: p.dep, x: ((M[0] * p.x + M[4] * p.y + M[8] * p.z + M[12]) / w + 1) / 2 * cv.clientWidth, y: (1 - (M[1] * p.x + M[5] * p.y + M[9] * p.z + M[13]) / w) / 2 * cv.clientHeight };
      });
    }
  };
})();
