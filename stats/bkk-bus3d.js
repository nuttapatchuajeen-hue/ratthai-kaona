/**
 * bkk-bus3d.js
 * ชั้น "รถเมล์" ของ bkk-city.html — รถโดยสารกรุงเทพฯ-ปริมณฑลวิ่งตามตารางเดินรถทางการ
 * วาดในฉากกลาง bkk-3d-host.js (three.js) ร่วมกับทางด่วน รถไฟฟ้า สนามบิน และท่าเรือ
 *
 * ข้อมูล
 *   - bkk-bus-data.js (window.BKK_BUS) จาก _geo/build-bkk-bus.js ← GTFS ของ สนข. (ระบบ "นำทาง", CC-BY 4.0)
 *     เส้นทาง ป้าย ตารางความถี่ (headway) ตามช่วงเวลา วันเดินรถ ค่าโดยสาร
 *   - ⚠ ยังไม่มีข้อมูลตำแหน่ง GPS จริงแบบเปิด (แอป ขสมก./กรมการขนส่งทางบกเป็นระบบปิด) → ตำแหน่งรถทุกคันเป็นการ "จำลอง"
 *     จากตารางเดินรถ: รถออกจากต้นทางตามความถี่ของช่วงเวลานั้น แล้ววิ่ง-จอดตามเวลาระหว่างป้ายใน GTFS
 *     (คำนวณจากนาฬิกาอย่างเดียว ไม่มีสถานะ → เปิดกี่เครื่องก็เห็นรถตรงกัน)
 *
 * การแสดงผลตามระดับซูม
 *   - ซูมออก: จุดสีตามสาย · ซูมกลาง: ป้ายเลขสาย (billboard) · ซูมใกล้: รถ 3 มิติ (รถเมล์ 12 ม. / รถตู้ / สองแถว) + ป้ายเลขสายลอยเหนือหลังคา
 *   - ป้ายรถเมล์ (MapLibre circle) · เส้นทางของสายที่เลือก (MapLibre line)
 *   - กดรถ → การ์ดรถ (ความเร็ว ป้ายถัดไป ความถี่ ค่าโดยสาร) · กดป้าย → สายที่ผ่าน + เวลารถคันถัดไป · ค้นหาเลขสาย
 *
 * ⚠ สีรถ = รหัสสีของสายใน GTFS (ขสมก./ไทยสมายล์บัสใกล้เคียงสีรถจริง · รถร่วม/รถตู้ใช้ตัวรถสีขาวคาดแถบสีสาย) ไม่ใช่ลายรถจริงทุกคัน
 * ⚠ รถบนเส้นทางทางด่วนวิ่งที่ระดับพื้น (ยังไม่ยกขึ้นตามความสูงทางยกระดับ)
 */
(function () {
  "use strict";

  var DATA_URL = "bkk-bus-data.js";
  var MOD_ID = "bus";
  var LS_KEY = "bkk-bus3d-on";
  var LS_GRP = "bkk-bus3d-groups";
  var DOT_ZOOM = 13.3;         // ต่ำกว่านี้ = จุดสี
  var MODEL_ZOOM = 15.8;       // ตั้งแต่นี้ = รถ 3 มิติ
  var STOP_ZOOM = 14.6;        // ป้ายรถเมล์
  var LANE = 2.6;              // ขับชิดซ้าย: เลื่อนจากแนวเส้นทางไปทางซ้าย (ม.)
  var CAP3D = 3000;            // รถ 3 มิติสูงสุดต่อแบบ
  var HOME = { center: [100.5386, 13.7649], zoom: 15.4, pitch: 55, bearing: -20 };   // อนุสาวรีย์ชัยสมรภูมิ (ชุมทางรถเมล์)

  // หมวดรถ — st = รูปแบบสี (0 ทั้งคันสีสาย · 1 สองสี: ล่างสีสาย บนครีม · 2 ตัวรถขาว คาดแถบสีสาย)
  var CATS = {
    bmta:    { n: "ขสมก.", kind: 0 },
    tsb:     { n: "ไทยสมายล์บัส", kind: 0, st: 0 },
    private: { n: "รถร่วมเอกชน", kind: 0, st: 2 },
    metro:   { n: "รถร่วม/ปริมณฑล", kind: 0, st: 2 },
    van:     { n: "รถตู้โดยสาร", kind: 1, st: 2 },
    soi:     { n: "รถในซอย (สองแถว)", kind: 2, st: 0 },
    brt:     { n: "BRT", kind: 0, st: 0 },
    feeder:  { n: "รถเสริม/ฟีดเดอร์", kind: 0, st: 0 }
  };
  var CLS_NAME = { ord: "รถธรรมดา", ac: "รถปรับอากาศ", van: "รถตู้", soi: "สองแถว/รถเล็ก", brt: "รถโดยสารด่วนพิเศษ" };
  var GROUPS = [
    { id: "bmta", n: "ขสมก.", cats: ["bmta"] },
    { id: "joint", n: "รถร่วม + ไทยสมายล์บัส", cats: ["tsb", "private", "metro"] },
    { id: "brt", n: "BRT + ฟีดเดอร์", cats: ["brt", "feeder"] },
    { id: "van", n: "รถตู้", cats: ["van"] },
    { id: "soi", n: "สองแถว", cats: ["soi"] }
  ];
  var TONE = { dark: "#9aa6b8", light: "#ffffff", sunset: "#f4ddcc" };
  var STOP_COL = { dark: ["#0b1220", "#00E5FF"], light: ["#ffffff", "#04788F"], sunset: ["#fff7ef", "#c2410c"] };

  var H = null, T = null, D = null, map = null;
  var visible = false, loading = null, failed = false, uiBuilt = false, lastError = null;
  var group = null, model = null;
  var grpOn = {};
  var selRoute = null, routeOnly = false, selBus = null, hoverKey = null, follow = false;

  function $(s, r) { return (r || document).querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(v, d) { return Number(v).toLocaleString("th-TH", { maximumFractionDigits: d || 0 }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function loadScript(src) {
    return new Promise(function (ok, bad) {
      var s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = ok;
      s.onerror = function () { bad(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }
  function hexRGB(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
  function lum(c) { return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]; }
  function hms(sec) { sec = ((Math.round(sec) % 86400) + 86400) % 86400; var h = sec / 3600 | 0, m = (sec % 3600) / 60 | 0; return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m; }
  function mins(sec) { return sec < 60 ? "ไม่ถึง 1 นาที" : "~" + fmt(Math.round(sec / 60)) + " นาที"; }

  /* ไอคอนที่ sprite กลาง (js/icons.js) ยังไม่มี — Lucide (ISC) */
  function addIcons() {
    var sp = document.getElementById("mdico-sprite");
    if (!sp || document.getElementById("i-bus")) return;
    var NS = "http://www.w3.org/2000/svg";
    var add = function (id, body) {
      var s = document.createElementNS(NS, "symbol");
      s.setAttribute("id", "i-" + id); s.setAttribute("viewBox", "0 0 24 24");
      s.innerHTML = body;
      sp.appendChild(s);
    };
    add("bus", '<path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>');
    add("route", '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>');
    add("signpost", '<path d="M12 13v8"/><path d="M12 3v3"/><path d="M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a2 2 0 0 1-1.387-.56l-2.306-2.22a1 1 0 0 1 0-1.44l2.306-2.22A2 2 0 0 1 6 6z"/>');
    add("locate-fixed", '<line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/>');
  }

  /* ================================================================ ข้อมูล */
  var KX = 111320 * Math.cos(13.75 * Math.PI / 180), KY = 110574;     // ตัววัดระยะเดียวกับตอน build (ระยะป้ายตามเส้นทาง)
  var routes = [], groups = [], trips = [], shapes = [], stops = null, stopTrips = [], maxWinEnd = 0;

  function badgeText(s) {
    s = s.trim();
    var tok = s.split(/\s+/);
    if (tok.length > 1 && /\d/.test(tok[0])) s = tok[0];
    return s.length > 9 ? s.slice(0, 8) + "…" : s;
  }
  /* คำอธิบายสายใน GTFS = "<หมวด> <ชั้นรถ>" · หมวดซ้ำสองครั้ง (รถตู้ รถตู้) → ไม่มีข้อมูลเพิ่ม · ตัดคำนำหน้าหมวดออก */
  function cleanDesc(d) {
    d = String(d || "").trim();
    var a = d.slice(0, Math.floor(d.length / 2)).trim(), b = d.slice(Math.ceil(d.length / 2)).trim();
    if (a && a === b) return "";
    var k = d.lastIndexOf(" รถโดยสาร");                     // สองท่อนเกือบซ้ำ (สะกดต่างกันนิดเดียว) → เก็บท่อนหลัง
    if (k > 0 && Math.abs(d.length - 1 - 2 * k) <= 4) return d.slice(k + 1).trim();
    return d.replace(/^รถโดยสาร(?:ประจำทาง)?\s+(?:ขสมก|เอกชน|TSB|BMA Feeder|MRTA)\s+/, "").trim();
  }
  function cumsum(a) { var o = new Array(a.length), s = 0; for (var i = 0; i < a.length; i++) { s += a[i]; o[i] = s; } return o; }

  function decode() {
    var i;
    routes = D.routes.map(function (r, ri) {
      var m = r[0].match(/^(.*?)\s*\((.+)\)\s*$/), main = (m ? m[1] : r[0]).trim(), col = "#" + r[4];
      var rgb = hexRGB(col), ag = D.ag[r[5]] || ["", ""];
      return { i: ri, code: r[0], main: main, old: m ? m[2] : "", badge: badgeText(main), name: r[1], cat: r[2], cls: r[3], col: col, rgb: rgb,
        dark: lum(rgb) > 0.62, agId: ag[0], ag: ag[1], desc: cleanDesc(r[6]), fare: r[7] || null, trips: [], bb: null, search: (r[0] + " " + r[1]).toLowerCase() };
    });
    /* "สาย" ที่ผู้ใช้เห็น = เลขสาย + ชื่อ + หมวดเดียวกัน — GTFS แยกรถธรรมดา/รถแอร์/เที่ยวเสริมของสายเดียวกันเป็นหลาย route
       เลือก/ค้นหา/การ์ดสายทำงานกับกลุ่มนี้ · สีและป้ายของรถแต่ละคันยังตาม route ของตัวเอง */
    var gmap = {};
    groups = [];
    routes.forEach(function (R) {
      var key = R.main + "|" + R.name + "|" + R.cat, G = gmap[key];
      if (!G) {
        G = gmap[key] = { i: groups.length, main: R.main, old: R.old, badge: R.badge, name: R.name, cat: R.cat, cls: R.cls, clsList: [], col: R.col, rgb: R.rgb, dark: R.dark,
          agId: R.agId, ag: R.ag, descs: [], fare: null, trips: [], bb: null, members: [], search: "" };
        groups.push(G);
      }
      G.members.push(R);
      R.g = G;
      if (R.old && !G.old) G.old = R.old;
      if (G.clsList.indexOf(R.cls) < 0) G.clsList.push(R.cls);
      if (R.desc && G.descs.indexOf(R.desc) < 0) G.descs.push(R.desc);
      if (R.fare) G.fare = G.fare ? [Math.min(G.fare[0], R.fare[0]), Math.max(G.fare[1], R.fare[1])] : R.fare.slice();
      if (G.search.indexOf(R.search) < 0) G.search += " " + R.search;
    });
    groups.forEach(function (G) { G.desc = G.descs.join(" / "); });
    // ป้าย
    var sp = D.stops.pos, n = sp.length / 2, x = 0, y = 0;
    stops = { n: n, lon: new Float64Array(n), lat: new Float64Array(n), x: new Float32Array(n), y: new Float32Array(n), names: D.stops.names };
    for (i = 0; i < n; i++) {
      x += sp[i * 2]; y += sp[i * 2 + 1];
      stops.lon[i] = x / 1e5; stops.lat[i] = y / 1e5;
      var p = H.toLocal(stops.lon[i], stops.lat[i]);
      stops.x[i] = p.x; stops.y[i] = p.y;
    }
    // เส้นทาง: พิกัดฉาก + ระยะสะสม (หน่วยเดียวกับตอน build)
    shapes = D.shapes.map(function (a) {
      var m = a.length / 2, sx = new Float32Array(m), sy = new Float32Array(m), cum = new Float32Array(m), lon = new Float64Array(m), lat = new Float64Array(m);
      var X = 0, Y = 0, bb = [1e9, 1e9, -1e9, -1e9];
      for (var k = 0; k < m; k++) {
        X += a[k * 2]; Y += a[k * 2 + 1];
        lon[k] = X / 1e5; lat[k] = Y / 1e5;
        var q = H.toLocal(lon[k], lat[k]);
        sx[k] = q.x; sy[k] = q.y;
        if (k) cum[k] = cum[k - 1] + Math.hypot((lon[k] - lon[k - 1]) * KX, (lat[k] - lat[k - 1]) * KY);
        if (q.x < bb[0]) bb[0] = q.x; if (q.y < bb[1]) bb[1] = q.y; if (q.x > bb[2]) bb[2] = q.x; if (q.y > bb[3]) bb[3] = q.y;
      }
      return { n: m, x: sx, y: sy, cum: cum, lon: lon, lat: lat, bb: bb, len: cum[m - 1], k: H.kAt((lat[0] + lat[m - 1]) / 2) };
    });
    stopTrips = new Array(n);
    trips = D.trips.map(function (t, ti) {
      var R = routes[t[0]], sh = shapes[t[3]], arr = cumsum(t[7]), w = t[8], dist = cumsum(t[6]);
      var dep = arr.map(function (a, k) { return a + (k === arr.length - 1 ? 0 : typeof w === "number" ? w : w[k]); });
      for (var k = 0; k < dist.length; k++) if (dist[k] > sh.len) dist[k] = sh.len;
      var f = t[9], win = [];
      for (k = 0; k < f.length; k += 3) { win.push([f[k] * 60, f[k + 1] * 60, Math.max(60, f[k + 2])]); if (f[k + 1] * 60 > maxWinEnd) maxWinEnd = f[k + 1] * 60; }
      var tr = { i: ti, r: R, dir: t[1], head: t[2], sh: sh, svc: t[4], stops: cumsum(t[5]), dist: dist, arr: arr, dep: dep, win: win, T: arr[arr.length - 1] };
      [R, R.g].forEach(function (X) {
        X.trips.push(tr);
        if (!X.bb) X.bb = sh.bb.slice();
        else { X.bb[0] = Math.min(X.bb[0], sh.bb[0]); X.bb[1] = Math.min(X.bb[1], sh.bb[1]); X.bb[2] = Math.max(X.bb[2], sh.bb[2]); X.bb[3] = Math.max(X.bb[3], sh.bb[3]); }
      });
      tr.stops.forEach(function (s, p) { (stopTrips[s] = stopTrips[s] || []).push(tr, p); });
      return tr;
    });
    // ตารางค้นป้ายตามพื้นที่ (ช่อง 250 ม.)
    stops.grid = {};
    for (i = 0; i < n; i++) {
      var key = Math.floor(stops.x[i] / 250) + "," + Math.floor(stops.y[i] / 250);
      (stops.grid[key] = stops.grid[key] || []).push(i);
    }
    // หมวดที่มีจริง (นับสายตามที่ผู้ใช้เห็น = กลุ่ม)
    groups.forEach(function (G) { var c = CATS[G.cat]; if (c) c.count = (c.count || 0) + 1; });
  }

  /* ================================================================ เวลา / วันเดินรถ */
  function bkkNow() {
    var d = new Date(Date.now() + 7 * 3600e3);
    return { sec: d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds() + d.getUTCMilliseconds() / 1000,
      ymd: d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate(), wd: (d.getUTCDay() + 6) % 7 };
  }
  var svcCache = {};
  function svcFor(ymd, wd) {
    if (svcCache[ymd]) return svcCache[ymd];
    var out = {}, calEnd = 0;
    Object.keys(D.cal).forEach(function (s) { calEnd = Math.max(calEnd, D.cal[s].b); });
    var past = ymd > calEnd;                       // ตารางหมดอายุ → ใช้รูปแบบวันในสัปดาห์ต่อไป
    Object.keys(D.cal).forEach(function (s) { var c = D.cal[s]; out[s] = !!c.d[wd] && (past || (ymd >= c.a && ymd <= c.b)); });
    var ex = D.ex[ymd];
    if (ex) Object.keys(ex).forEach(function (s) { out[s] = ex[s] === 1; });
    svcCache[ymd] = out;
    return out;
  }
  function days(now) {
    var list = [{ svc: svcFor(now.ymd, now.wd), shift: 0 }];
    if (maxWinEnd > 86400) {                        // เที่ยวหลังเที่ยงคืนของเมื่อวาน
      var y = new Date(Date.now() + 7 * 3600e3 - 86400e3);
      list.push({ svc: svcFor(y.getUTCFullYear() * 10000 + (y.getUTCMonth() + 1) * 100 + y.getUTCDate(), (y.getUTCDay() + 6) % 7), shift: 86400 });
    }
    return list;
  }
  function dayLabel(now) {
    var s = svcFor(now.ymd, now.wd);
    return s["1"] ? "วันทำการ" : "วันหยุด";
  }
  /* เลื่อนเวลาออกรถแต่ละคันเล็กน้อยแบบคงที่ (0–18% ของความถี่) — รถไม่ออกตรงเป๊ะเหมือนนาฬิกา */
  function jit(ti, a, k, h) { var x = Math.sin(ti * 12.9898 + a * 0.0137 + k * 78.233) * 43758.5453; return (x - Math.floor(x)) * 0.18 * h; }
  function headwayAt(tr, sec) {
    for (var i = 0; i < tr.win.length; i++) if (sec >= tr.win[i][0] && sec < tr.win[i][1]) return tr.win[i][2];
    return 0;
  }
  /* รถธรรมดา + รถแอร์ของสายเดียวกันวิ่งทิศเดียวกัน → ความถี่รวม = 1 / Σ(1/headway) · dir = null → ทิศที่ถี่สุด
     (นับเฉพาะเที่ยวที่เดินรถวันนี้) */
  function groupHeadway(G, dir, now) {
    var svc = svcFor(now.ymd, now.wd), per = {}, hw = 0;
    G.trips.forEach(function (tr) {
      if (dir != null && tr.dir !== dir) return;
      var x = svc[tr.svc] ? headwayAt(tr, now.sec) : 0;
      if (x) per[tr.dir] = (per[tr.dir] || 0) + 1 / x;
    });
    Object.keys(per).forEach(function (d) { var x = 1 / per[d]; if (!hw || x < hw) hw = x; });
    return hw;
  }
  function serviceSpan(R) {
    var a = 1e9, b = 0;
    R.trips.forEach(function (tr) { tr.win.forEach(function (w) { a = Math.min(a, w[0]); b = Math.max(b, w[1]); }); });
    return b ? hms(a) + "–" + hms(b) : "";
  }
  function catOn(cat) {
    for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].cats.indexOf(cat) >= 0) return grpOn[GROUPS[i].id] !== false;
    return true;
  }

  /* รถที่วิ่งอยู่: ไล่ทุกเที่ยว × ช่วงความถี่ → รถแต่ละคัน = { t: เที่ยว, d: เวลาออกจากต้นทาง (วินาทีของวันนี้) } */
  function enumerate(now, bb, onlyRoute, out) {
    var ds = days(now), sec = now.sec;
    for (var ti = 0; ti < trips.length; ti++) {
      var tr = trips[ti];
      if (onlyRoute ? tr.r.g !== onlyRoute : !catOn(tr.r.cat)) continue;
      if (bb &&(tr.sh.bb[2] < bb[0] || tr.sh.bb[0] > bb[2] || tr.sh.bb[3] < bb[1] || tr.sh.bb[1] > bb[3])) continue;
      for (var di = 0; di < ds.length; di++) {
        if (!ds[di].svc[tr.svc]) continue;
        var t = sec + ds[di].shift;
        for (var wi = 0; wi < tr.win.length; wi++) {
          var w = tr.win[wi], a = w[0], b = w[1], h = w[2];
          if (t < a || t > b + tr.T + h) continue;
          var kLast = Math.floor((b - 1 - a) / h);
          var k1 = Math.min(kLast, Math.floor((t + 2 - a) / h));
          var k0 = Math.max(0, Math.ceil((t - tr.T - 0.18 * h - a) / h));
          for (var k = k0; k <= k1; k++) {
            var d = a + k * h + jit(ti, a, k, h);
            if (d > t + 2 || t - d > tr.T) continue;
            out.push({ t: tr, d: d - ds[di].shift, key: ti + ":" + a + ":" + k + ":" + ds[di].shift });
          }
        }
      }
    }
    return out;
  }
  function countRunning(now, onlyRoute) {
    var n = 0, ds = days(now), sec = now.sec;
    for (var ti = 0; ti < trips.length; ti++) {
      var tr = trips[ti];
      if (onlyRoute ? tr.r.g !== onlyRoute : !catOn(tr.r.cat)) continue;
      for (var di = 0; di < ds.length; di++) {
        if (!ds[di].svc[tr.svc]) continue;
        var t = sec + ds[di].shift;
        for (var wi = 0; wi < tr.win.length; wi++) {
          var w = tr.win[wi], a = w[0], h = w[2];
          if (t < a || t > w[1] + tr.T + h) continue;
          var kLast = Math.floor((w[1] - 1 - a) / h), k1 = Math.min(kLast, Math.floor((t - a) / h)), k0 = Math.max(0, Math.ceil((t - tr.T - a) / h));
          if (k1 >= k0) n += k1 - k0 + 1;
        }
      }
    }
    return n;
  }

  /* ตำแหน่งบนเส้นทางที่ระยะ s — หัวรถค่อย ๆ เลี้ยวตรงหัวมุม (ผสมทิศของสองช่วงในระยะ 6 ม.) */
  function shapeAt(sh, s, o) {
    var c = sh.cum, n = sh.n, lo = 0, hi = n - 2;
    if (s <= 0) s = 0; else if (s >= sh.len) s = sh.len;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (c[mid] <= s) lo = mid; else hi = mid - 1; }
    var j = lo, L = c[j + 1] - c[j], f = L > 0 ? (s - c[j]) / L : 0;
    o.x = sh.x[j] + (sh.x[j + 1] - sh.x[j]) * f;
    o.y = sh.y[j] + (sh.y[j + 1] - sh.y[j]) * f;
    var dx = sh.x[j + 1] - sh.x[j], dy = sh.y[j + 1] - sh.y[j], dl = Math.hypot(dx, dy) || 1;
    dx /= dl; dy /= dl;
    var R = Math.min(6, L / 2), d0 = s - c[j], d1 = c[j + 1] - s, px, py, pl, t;
    if (d0 < R && j > 0) {
      px = sh.x[j] - sh.x[j - 1]; py = sh.y[j] - sh.y[j - 1]; pl = Math.hypot(px, py) || 1;
      t = 0.5 + 0.5 * d0 / R; dx = px / pl * (1 - t) + dx * t; dy = py / pl * (1 - t) + dy * t;
    } else if (d1 < R && j + 2 < n) {
      px = sh.x[j + 2] - sh.x[j + 1]; py = sh.y[j + 2] - sh.y[j + 1]; pl = Math.hypot(px, py) || 1;
      t = 0.5 - 0.5 * d1 / R; dx = dx * (1 - t) + px / pl * t; dy = dy * (1 - t) + py / pl * t;
    }
    dl = Math.hypot(dx, dy) || 1;
    o.hx = dx / dl; o.hy = dy / dl;
    return o;
  }
  /* สถานะรถ ณ วินาที sec: ระยะตามเส้นทาง ความเร็ว (ม./วิ) ป้ายล่าสุด — ช่วงระหว่างป้ายเร่ง-ชะลอแบบ (1 − cos) */
  function busState(b, sec, o) {
    var tr = b.t, e = sec - b.d;
    if (e < 0 || e > tr.T) return null;
    var arr = tr.arr, dep = tr.dep, n = arr.length, lo = 0, hi = n - 1;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (arr[mid] <= e) lo = mid; else hi = mid - 1; }
    var i = lo, s, v = 0, dwell = false;
    if (e < dep[i] || i === n - 1) { s = tr.dist[i]; dwell = true; }
    else {
      var t0 = dep[i], t1 = arr[i + 1], dt = Math.max(1, t1 - t0), f = Math.min(1, (e - t0) / dt), ds = tr.dist[i + 1] - tr.dist[i];
      s = tr.dist[i] + ds * (f - Math.sin(2 * Math.PI * f) / (2 * Math.PI));
      v = ds / dt * (1 - Math.cos(2 * Math.PI * f));
    }
    shapeAt(tr.sh, s, o);
    var k = tr.sh.k;
    o.x -= o.hy * LANE * k; o.y += o.hx * LANE * k;
    o.i = i; o.dwell = dwell; o.v = v; o.s = s; o.e = e; o.k = k;
    return o;
  }

  /* ================================================================ รูปทรงรถ 3 มิติ */
  /* part: 0 สีคงที่ · 1 ตัวถังบน · 2 ตัวถังล่าง · 3 แถบคาด — เชเดอร์เลือกว่าส่วนไหนรับสีสายตาม iStyle ของแต่ละคัน */
  function GB() { this.p = []; this.c = []; this.pt = []; }
  GB.prototype.tri = function (a, b, c, col, part) {
    this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    for (var i = 0; i < 3; i++) { this.c.push(col[0], col[1], col[2]); this.pt.push(part); }
  };
  GB.prototype.quad = function (a, b, c, d, col, part) { this.tri(a, b, c, col, part); this.tri(a, c, d, col, part); };
  GB.prototype.box = function (x0, x1, y0, y1, z0, z1, col, part, noBottom) {
    var A = [x0, y0, z0], B = [x1, y0, z0], C = [x1, y1, z0], E = [x0, y1, z0], A2 = [x0, y0, z1], B2 = [x1, y0, z1], C2 = [x1, y1, z1], E2 = [x0, y1, z1];
    this.quad(A2, B2, C2, E2, col, part);
    if (!noBottom) this.quad(A, E, C, B, col, part);
    this.quad(A, B, B2, A2, col, part); this.quad(B, C, C2, B2, col, part);
    this.quad(C, E, E2, C2, col, part); this.quad(E, A, A2, E2, col, part);
  };
  /* ล้อ: ปริซึม 8 เหลี่ยมตามแกน y */
  GB.prototype.wheel = function (x, y0, y1, r, col) {
    var N = 8, P = [];
    for (var i = 0; i < N; i++) { var a = (i + 0.5) / N * Math.PI * 2; P.push([x + Math.cos(a) * r, r + Math.sin(a) * r]); }
    for (i = 0; i < N; i++) {
      var p = P[i], q = P[(i + 1) % N];
      this.quad([p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]], [p[0], y1, p[1]], col, 0);
      this.tri([x, y0, r], [q[0], y0, q[1]], [p[0], y0, p[1]], col, 0);
      this.tri([x, y1, r], [p[0], y1, p[1]], [q[0], y1, q[1]], col, 0);
    }
  };
  GB.prototype.geo = function () {
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(this.p, 3));
    g.setAttribute("color", new T.Float32BufferAttribute(this.c, 3));
    g.setAttribute("part", new T.Float32BufferAttribute(this.pt, 1));
    return g;
  };
  var C_BODY = [0.97, 0.95, 0.9], C_GLASS = [0.12, 0.15, 0.2], C_GLASS2 = [0.2, 0.26, 0.33], C_DARK = [0.13, 0.13, 0.14], C_TYRE = [0.08, 0.08, 0.09],
    C_ROOF = [0.86, 0.87, 0.88], C_AC = [0.74, 0.76, 0.78], C_SIGN = [1, 0.66, 0.1], C_LIGHT = [1, 0.97, 0.85], C_RED = [0.85, 0.08, 0.06], C_DOOR = [0.18, 0.22, 0.27];

  /* รถเมล์ 12 ม. — x = หน้ารถ (+x) · y = ซ้าย (ประตูอยู่ซ้าย เพราะไทยขับชิดซ้าย) · z = ขึ้น */
  var BUS_DIM = { L: 12, W: 2.5, H: 3.4 }, VAN_DIM = { L: 5.4, W: 1.9, H: 2.3 }, SOI_DIM = { L: 5.0, W: 1.8, H: 2.45 };
  function busGeo() {
    var g = new GB(), L = BUS_DIM.L, W = BUS_DIM.W, hl = L / 2, hw = W / 2, x;
    g.box(-hl + 0.3, hl - 0.3, -hw + 0.15, hw - 0.15, 0.22, 0.4, C_DARK, 0, true);
    g.box(-hl, hl, -hw, hw, 0.4, 1.22, C_BODY, 2, true);
    g.box(-hl - 0.01, hl + 0.01, -hw - 0.012, hw + 0.012, 0.98, 1.12, C_BODY, 3, true);
    g.box(-hl + 0.03, hl - 0.03, -hw + 0.03, hw - 0.03, 1.22, 2.72, C_GLASS, 0, true);
    for (x = -hl + 0.35; x < hl - 1.6; x += 1.42) g.box(x, x + 0.14, -hw, hw, 1.22, 2.72, C_BODY, 1, true);
    g.box(hl - 0.2, hl, -hw, hw, 1.22, 2.72, C_BODY, 1, true);
    g.box(-hl, -hl + 0.2, -hw, hw, 1.22, 2.72, C_BODY, 1, true);
    g.box(-hl, hl, -hw, hw, 2.72, 3.04, C_BODY, 1, true);
    g.box(-hl + 0.08, hl - 0.08, -hw + 0.06, hw - 0.06, 3.04, 3.1, C_ROOF, 0, true);
    g.box(-2.4, 1.5, -0.85, 0.85, 3.1, 3.4, C_AC, 0, true);
    // หน้ารถ: กระจกบานใหญ่ ป้ายบอกสาย ไฟหน้า กันชน
    g.box(hl, hl + 0.025, -hw + 0.1, hw - 0.1, 0.95, 2.64, C_GLASS2, 0, true);
    g.box(hl, hl + 0.03, -hw + 0.2, hw - 0.2, 2.7, 2.98, C_SIGN, 0, true);
    g.box(hl, hl + 0.03, -hw + 0.12, -hw + 0.5, 0.55, 0.75, C_LIGHT, 0, true);
    g.box(hl, hl + 0.03, hw - 0.5, hw - 0.12, 0.55, 0.75, C_LIGHT, 0, true);
    g.box(hl - 0.05, hl + 0.06, -hw, hw, 0.28, 0.46, C_DARK, 0);
    // ท้ายรถ
    g.box(-hl - 0.025, -hl, -hw + 0.25, hw - 0.25, 1.6, 2.6, C_GLASS, 0, true);
    g.box(-hl - 0.03, -hl, -hw + 0.08, -hw + 0.3, 0.6, 1.35, C_RED, 0, true);
    g.box(-hl - 0.03, -hl, hw - 0.3, hw - 0.08, 0.6, 1.35, C_RED, 0, true);
    g.box(-hl - 0.06, -hl + 0.05, -hw, hw, 0.28, 0.46, C_DARK, 0);
    // ประตูฝั่งซ้าย (หน้า + กลาง)
    g.box(hl - 1.5, hl - 0.45, hw - 0.005, hw + 0.02, 0.35, 2.62, C_DOOR, 0, true);
    g.box(-0.7, 0.45, hw - 0.005, hw + 0.02, 0.35, 2.62, C_DOOR, 0, true);
    // ล้อ
    [hl - 2.6, -hl + 3.3].forEach(function (wx) { g.wheel(wx, -hw - 0.02, -hw + 0.3, 0.5, C_TYRE); g.wheel(wx, hw - 0.3, hw + 0.02, 0.5, C_TYRE); });
    return g.geo();
  }
  /* รถตู้ — ตัวรถขาว คาดแถบสีสาย · กระจกหน้าลาด */
  function vanGeo() {
    var g = new GB(), L = VAN_DIM.L, W = VAN_DIM.W, hl = L / 2, hw = W / 2, xf = hl - 0.95;
    g.box(-hl + 0.2, hl - 0.2, -hw + 0.1, hw - 0.1, 0.2, 0.32, C_DARK, 0, true);
    g.box(-hl, xf, -hw, hw, 0.32, 1.12, C_BODY, 1, true);
    g.box(-hl + 0.02, xf, -hw + 0.02, hw - 0.02, 1.12, 1.95, C_GLASS, 0, true);
    for (var x = -hl + 0.9; x < xf - 0.5; x += 1.25) g.box(x, x + 0.1, -hw, hw, 1.12, 1.95, C_BODY, 1, true);
    g.box(-hl, -hl + 0.15, -hw, hw, 1.12, 1.95, C_BODY, 1, true);
    g.box(-hl, xf, -hw, hw, 1.95, 2.28, C_BODY, 1, true);
    g.box(-hl - 0.005, hl - 0.05, -hw - 0.01, hw + 0.01, 0.82, 0.96, C_BODY, 3, true);
    // หน้ารถ: ฝากระโปรงสั้น + กระจกลาด
    g.box(xf, hl, -hw, hw, 0.32, 1.02, C_BODY, 1, true);
    var a = [xf, -hw + 0.04, 2.28], b = [xf, hw - 0.04, 2.28], c = [hl - 0.15, hw - 0.04, 1.02], d = [hl - 0.15, -hw + 0.04, 1.02];
    g.quad(d, c, b, a, C_GLASS2, 0);
    g.tri([xf, -hw + 0.04, 1.02], d, a, C_GLASS, 0);
    g.tri([xf, hw - 0.04, 1.02], b, c, C_GLASS, 0);
    g.box(hl - 0.02, hl + 0.02, -hw + 0.1, -hw + 0.42, 0.62, 0.8, C_LIGHT, 0, true);
    g.box(hl - 0.02, hl + 0.02, hw - 0.42, hw - 0.1, 0.62, 0.8, C_LIGHT, 0, true);
    g.box(hl - 0.04, hl + 0.05, -hw, hw, 0.25, 0.42, C_DARK, 0);
    g.box(-hl - 0.03, -hl, -hw + 0.1, -hw + 0.28, 0.7, 1.3, C_RED, 0, true);
    g.box(-hl - 0.03, -hl, hw - 0.28, hw - 0.1, 0.7, 1.3, C_RED, 0, true);
    g.box(-hl - 0.02, -hl, -hw + 0.3, hw - 0.3, 1.2, 1.9, C_GLASS, 0, true);
    [hl - 1.05, -hl + 1.15].forEach(function (wx) { g.wheel(wx, -hw - 0.02, -hw + 0.22, 0.33, C_TYRE); g.wheel(wx, hw - 0.22, hw + 0.02, 0.33, C_TYRE); });
    return g.geo();
  }
  /* สองแถว — กระบะ + หลังคาบนเสา + ม้านั่งสองแถว */
  function soiGeo() {
    var g = new GB(), L = SOI_DIM.L, W = SOI_DIM.W, hl = L / 2, hw = W / 2, xc = hl - 1.9, xh = hl - 0.8;
    g.box(-hl + 0.2, hl - 0.2, -hw + 0.12, hw - 0.12, 0.25, 0.45, C_DARK, 0, true);
    // ห้องคนขับ + ฝากระโปรง
    g.box(xc, xh, -hw + 0.02, hw - 0.02, 0.45, 1.15, C_BODY, 1, true);
    g.box(xc, xh, -hw + 0.04, hw - 0.04, 1.15, 1.7, C_GLASS, 0, true);
    g.box(xc, xc + 0.12, -hw + 0.02, hw - 0.02, 1.15, 1.7, C_BODY, 1, true);
    g.box(xc, xh, -hw + 0.02, hw - 0.02, 1.7, 1.85, C_BODY, 1, true);
    g.box(xh, hl, -hw + 0.02, hw - 0.02, 0.45, 1.05, C_BODY, 1, true);
    g.box(hl - 0.02, hl + 0.02, -hw + 0.1, -hw + 0.4, 0.7, 0.86, C_LIGHT, 0, true);
    g.box(hl - 0.02, hl + 0.02, hw - 0.4, hw - 0.1, 0.7, 0.86, C_LIGHT, 0, true);
    // กระบะ: พื้น ผนังล่าง ม้านั่ง เสา หลังคา
    g.box(-hl, xc, -hw, hw, 0.45, 0.62, C_DARK, 0, true);
    g.box(-hl, xc, -hw, -hw + 0.06, 0.62, 1.15, C_BODY, 1, true);
    g.box(-hl, xc, hw - 0.06, hw, 0.62, 1.15, C_BODY, 1, true);
    g.box(-hl + 0.1, xc - 0.1, -hw + 0.1, -hw + 0.5, 0.62, 0.95, C_DOOR, 0, true);
    g.box(-hl + 0.1, xc - 0.1, hw - 0.5, hw - 0.1, 0.62, 0.95, C_DOOR, 0, true);
    [-hl, (xc - hl) / 2 - 0.05, xc - 0.1].forEach(function (px) {
      g.box(px, px + 0.08, -hw, -hw + 0.08, 1.15, 2.3, C_AC, 0, true);
      g.box(px, px + 0.08, hw - 0.08, hw, 1.15, 2.3, C_AC, 0, true);
    });
    g.box(-hl - 0.05, xc + 0.05, -hw - 0.04, hw + 0.04, 2.3, 2.42, C_BODY, 1);
    g.box(-hl - 0.03, -hl, -hw + 0.05, -hw + 0.22, 0.6, 1.0, C_RED, 0, true);
    g.box(-hl - 0.03, -hl, hw - 0.22, hw - 0.05, 0.6, 1.0, C_RED, 0, true);
    [hl - 1.1, -hl + 1.2].forEach(function (wx) { g.wheel(wx, -hw - 0.02, -hw + 0.22, 0.36, C_TYRE); g.wheel(wx, hw - 0.22, hw + 0.02, 0.36, C_TYRE); });
    return g.geo();
  }
  function bodyMaterial() {
    var m = new T.MeshPhongMaterial({ color: TONE[H.theme()] || TONE.dark, vertexColors: true, flatShading: true, shininess: 30, specular: 0x333333, side: T.DoubleSide });
    m.onBeforeCompile = function (sh) {
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float part;\nattribute float iStyle;\nattribute vec3 iCol;")
        .replace("#include <color_vertex>", "#include <color_vertex>\n" +
          "  float tn = part < 0.5 ? 0.0 : part < 1.5 ? step(iStyle, 0.5) : part < 2.5 ? step(iStyle, 1.5) : 1.0;\n" +
          "  vColor.xyz *= mix(vec3(1.0), iCol, tn);");
    };
    return m;
  }
  function fleet(geo, mat, dim) {
    var g = geo.clone();
    g.setAttribute("iCol", new T.InstancedBufferAttribute(new Float32Array(CAP3D * 3), 3));
    g.setAttribute("iStyle", new T.InstancedBufferAttribute(new Float32Array(CAP3D), 1));
    var m = new T.InstancedMesh(g, mat, CAP3D);
    m.count = 0; m.frustumCulled = false; m.renderOrder = 4;
    m.instanceMatrix.setUsage(T.DynamicDrawUsage);
    return { mesh: m, n: 0, dim: dim, col: g.getAttribute("iCol"), sty: g.getAttribute("iStyle"), mat: m.instanceMatrix.array };
  }

  /* ================================================================ ป้ายเลขสาย / จุด (billboard) */
  var ATLAS = 2048, CELL_H = 36;
  function buildAtlas() {
    var cv = document.createElement("canvas");
    cv.width = cv.height = ATLAS;
    var g = cv.getContext("2d"), fam = "";
    try { fam = getComputedStyle(document.body).fontFamily; } catch (e) {}
    fam = (fam ? fam + "," : "") + "system-ui,sans-serif";
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    var rect = {}, x = 0, y = 0, full = false;
    routes.forEach(function (R) {
      var t = R.badge;
      if (rect[t] || full) { R.uv = rect[t] || null; return; }
      var fs = 23;
      g.font = "700 " + fs + "px " + fam;
      var w = g.measureText(t).width;
      if (w > 170) { fs = Math.max(14, fs * 170 / w); g.font = "700 " + fs + "px " + fam; w = g.measureText(t).width; }
      var cw = Math.ceil(w) + 18;
      if (x + cw > ATLAS) { x = 0; y += CELL_H; }
      if (y + CELL_H > ATLAS) { full = true; R.uv = null; return; }
      g.fillText(t, x + cw / 2, y + CELL_H / 2 + 1);
      rect[t] = [x / ATLAS, 1 - (y + CELL_H) / ATLAS, cw / ATLAS, CELL_H / ATLAS, cw / CELL_H];
      R.uv = rect[t];
      x += cw + 2;
    });
    var tex = new T.CanvasTexture(cv);
    tex.minFilter = T.LinearFilter; tex.magFilter = T.LinearFilter; tex.generateMipmaps = false;
    return tex;
  }
  var BB_VS = [
    "uniform vec2 uView;", "uniform float uDpr;",
    "attribute vec2 corner;", "attribute vec3 iPos;", "attribute vec3 iCol;", "attribute vec4 iUv;", "attribute vec4 iSize;",
    "varying vec2 vUv;", "varying vec2 vLocal;", "varying vec3 vCol;", "varying vec3 vInfo;",
    "void main(){",
    "  vec4 c = projectionMatrix * modelViewMatrix * vec4(iPos, 1.0);",
    "  vec2 px = corner * iSize.xy; px.y += iSize.w;",
    "  c.xy += px * uDpr / uView * 2.0 * c.w;",
    "  gl_Position = c;",
    "  vLocal = corner + 0.5;",
    "  vUv = iUv.xy + vLocal * iUv.zw;",
    "  vCol = iCol; vInfo = vec3(iSize.xy, iSize.z);",
    "}"].join("\n");
  var BB_FS = [
    "uniform sampler2D uAtlas;", "uniform float uTime;",
    "varying vec2 vUv;", "varying vec2 vLocal;", "varying vec3 vCol;", "varying vec3 vInfo;",
    "void main(){",
    "  float mode = vInfo.z; vec4 o;",
    "  if (mode < 0.5) {",                                                  // จุด: วงกลมสีสาย ขอบขาว
    "    float d = length(vLocal - 0.5) * vInfo.x, R = vInfo.x * 0.5 - 0.5;",
    "    float a = clamp(R - d + 0.5, 0.0, 1.0);",
    "    vec3 c = mix(vec3(1.0), vCol, clamp(R - 1.3 - d + 0.5, 0.0, 1.0));",
    "    o = vec4(c, a);",
    "  } else if (mode < 1.5 || mode > 2.5) {",                            // ป้ายเลขสาย (3 = ถูกเลือก/ชี้)
    "    vec2 p = (vLocal - 0.5) * vInfo.xy; vec2 h = vInfo.xy * 0.5 - 0.5; float r = min(h.y, 5.0);",
    "    vec2 q = abs(p) - (h - r); float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;",
    "    float a = clamp(0.5 - sd, 0.0, 1.0);",
    "    float bw = mode > 2.5 ? 2.2 : 1.2;",
    "    vec3 edge = mode > 2.5 ? vec3(1.0, 0.92, 0.3) : vec3(1.0);",
    "    vec3 c = mix(edge, vCol, clamp(-sd - bw + 0.5, 0.0, 1.0));",
    "    float tx = texture2D(uAtlas, vUv).a;",
    "    vec3 tc = dot(vCol, vec3(0.299, 0.587, 0.114)) > 0.62 ? vec3(0.07, 0.08, 0.1) : vec3(1.0);",
    "    o = vec4(mix(c, tc, tx * step(0.0, -sd - bw)), a);",
    "  } else {",                                                          // วงแหวนรอบคันที่เลือก (กะพริบ)
    "    float d = length(vLocal - 0.5) * 2.0;",
    "    float ph = fract(uTime * 0.7);",
    "    float ring = smoothstep(0.1, 0.0, abs(d - (0.45 + ph * 0.5))) * (1.0 - ph);",
    "    float core = smoothstep(0.08, 0.0, abs(d - 0.42));",
    "    o = vec4(vec3(1.0, 0.92, 0.3), max(ring, core * 0.9));",
    "  }",
    "  if (o.a < 0.06) discard;",
    "  gl_FragColor = o;",
    "}"].join("\n");
  function billboards(tex) {
    var g = new T.InstancedBufferGeometry();
    g.setAttribute("corner", new T.Float32BufferAttribute([-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5], 2));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    var mat = new T.ShaderMaterial({
      uniforms: { uView: { value: new T.Vector2(1, 1) }, uDpr: { value: 1 }, uAtlas: { value: tex }, uTime: { value: 0 } },
      vertexShader: BB_VS, fragmentShader: BB_FS, transparent: true, depthTest: true, depthWrite: true
    });
    var mesh = new T.Mesh(g, mat);
    mesh.frustumCulled = false; mesh.renderOrder = 30;
    var B = { mesh: mesh, geo: g, mat: mat, cap: 0, n: 0 };
    growBB(B, 4096);
    return B;
  }
  function growBB(B, cap) {
    B.cap = cap;
    [["iPos", 3], ["iCol", 3], ["iUv", 4], ["iSize", 4]].forEach(function (a) {
      var old = B[a[0]], arr = new Float32Array(cap * a[1]);
      if (old) arr.set(old.subarray(0, Math.min(old.length, arr.length)));
      B[a[0]] = arr;
      var at = new T.InstancedBufferAttribute(arr, a[1]);
      at.setUsage(T.DynamicDrawUsage);
      B.geo.setAttribute(a[0], at);
    });
  }
  function bbPush(B, x, y, z, col, uv, w, h, mode, lift) {
    if (B.n >= B.cap) growBB(B, B.cap * 2);
    var i = B.n++;
    B.iPos[i * 3] = x; B.iPos[i * 3 + 1] = y; B.iPos[i * 3 + 2] = z;
    B.iCol[i * 3] = col[0]; B.iCol[i * 3 + 1] = col[1]; B.iCol[i * 3 + 2] = col[2];
    if (uv) { B.iUv[i * 4] = uv[0]; B.iUv[i * 4 + 1] = uv[1]; B.iUv[i * 4 + 2] = uv[2]; B.iUv[i * 4 + 3] = uv[3]; }
    else { B.iUv[i * 4] = B.iUv[i * 4 + 1] = B.iUv[i * 4 + 2] = B.iUv[i * 4 + 3] = 0; }
    B.iSize[i * 4] = w; B.iSize[i * 4 + 1] = h; B.iSize[i * 4 + 2] = mode; B.iSize[i * 4 + 3] = lift;
    return i;
  }

  /* ================================================================ สร้างโมเดล */
  function ensureLoaded() {
    if (loading) return loading;
    loading = Promise.all([H.ensure(), window.BKK_BUS ? Promise.resolve() : loadScript(DATA_URL)]).then(function () {
      T = H.THREE(); D = window.BKK_BUS;
      if (!T || !D) throw new Error("THREE/BKK_BUS missing");
      var t0 = performance.now();
      decode();
      return (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
        group = new T.Group();
        group.name = "bus3d";
        var mat = bodyMaterial();
        model = { fleets: [fleet(busGeo(), mat, BUS_DIM), fleet(vanGeo(), mat, VAN_DIM), fleet(soiGeo(), mat, SOI_DIM)], mat: mat };
        model.fleets.forEach(function (f) { group.add(f.mesh); });
        model.bb = billboards(buildAtlas());
        group.add(model.bb.mesh);
        model.list = []; model.listAt = 0; model.listBB = null; model.rendered = []; model.buildMs = Math.round(performance.now() - t0);
        group.visible = visible;
        H.scene().add(group);
        H.ready();
      });
    }).catch(function (e) {
      failed = true;
      lastError = e && e.stack || String(e);
      if (group && group.parent) group.parent.remove(group);
      model = null;
      console.warn("bus 3D:", e);
    });
    return loading;
  }

  /* ================================================================ ทุกเฟรม */
  var _st = {}, _now = null, wake = null, animOn = false, lastCount = { n: 0, at: 0 };
  function viewBox(z) {
    if (z < 12.3) return null;
    var b = map.getBounds(), p0 = H.toLocal(b.getWest(), b.getSouth()), p1 = H.toLocal(b.getEast(), b.getNorth()), m = 400;
    return [Math.min(p0.x, p1.x) - m, Math.min(p0.y, p1.y) - m, Math.max(p0.x, p1.x) + m, Math.max(p0.y, p1.y) + m];
  }
  function inside(bb, x, y) { return !bb || (x >= bb[0] && x <= bb[2] && y >= bb[1] && y <= bb[3]); }
  function containsBox(a, b) { return !a || (b && b[0] >= a[0] && b[1] >= a[1] && b[2] <= a[2] && b[3] <= a[3]); }
  function refreshList(now, z, force) {
    var vb = viewBox(z), ms = performance.now();
    // ขยายกรอบค้นเผื่อไว้ 1.5 กม. — เลื่อนแผนที่นิดหน่อยไม่ต้องไล่เที่ยวใหม่
    var need = force || !model.listAt || ms - model.listAt > 1000 || !containsBox(model.listBB, vb) || (!vb) !== (!model.listBB);
    if (!need) return;
    var ext = vb ? [vb[0] - 1500, vb[1] - 1500, vb[2] + 1500, vb[3] + 1500] : null;
    model.list = enumerate(now, ext, routeOnly && selRoute ? selRoute : null, []);
    model.listBB = ext; model.listAt = ms;
  }
  function badgeSize(z) { return 13 + Math.max(0, Math.min(1, (z - DOT_ZOOM) / 2.2)) * 4; }

  function frame(z) {
    if (!model) return;
    var now = bkkNow(); _now = now;
    refreshList(now, z, false);
    var sec = now.sec, cull = viewBox(z), show3D = z >= MODEL_ZOOM, dots = z < DOT_ZOOM, hB = badgeSize(z);
    var F = model.fleets, B = model.bb, R, i, st, sel = null, hov = null;
    F.forEach(function (f) { f.n = 0; });
    B.n = 0;
    var rendered = model.rendered; rendered.length = 0;
    var dotR = z < 12 ? 2.6 : z < 12.8 ? 3.2 : 3.8;
    // มุมเอียง: รถที่ไกลจากกลางจอ (ใกล้ขอบฟ้า) → จุดแทนป้าย/โมเดล ไม่ให้ป้ายเลขสายซ้อนกันเต็มขอบฟ้า
    var cc = map.getCenter(), cL = H.toLocal(cc.lng, cc.lat), farR = 900 * Math.pow(2, 16 - z), farR2 = farR * farR;
    for (i = 0; i < model.list.length; i++) {
      var b = model.list[i];
      st = busState(b, sec, _st);
      if (!st || !inside(cull, st.x, st.y)) continue;
      R = b.t.r;
      var cat = CATS[R.cat] || CATS.metro, kind = cat.kind, style = cat.st != null ? cat.st : (R.cls === "ord" ? 1 : 0);
      var isSel = selBus && selBus.key === b.key, isHov = hoverKey === b.key;
      if (isSel) sel = { x: st.x, y: st.y, b: b };
      var dx0 = st.x - cL.x, dy0 = st.y - cL.y, far = dx0 * dx0 + dy0 * dy0 > farR2;
      var topZ = 0.4;
      if (show3D && !far) {
        var f = F[kind];
        if (f.n < CAP3D) {
          var j = f.n++, e = f.mat, o = j * 16, k = st.k, c = st.hx * k, s = st.hy * k;
          e[o] = c; e[o + 1] = s; e[o + 2] = 0; e[o + 3] = 0;
          e[o + 4] = -s; e[o + 5] = c; e[o + 6] = 0; e[o + 7] = 0;
          e[o + 8] = 0; e[o + 9] = 0; e[o + 10] = k; e[o + 11] = 0;
          e[o + 12] = st.x; e[o + 13] = st.y; e[o + 14] = 0; e[o + 15] = 1;
          f.col.array[j * 3] = R.rgb[0]; f.col.array[j * 3 + 1] = R.rgb[1]; f.col.array[j * 3 + 2] = R.rgb[2];
          f.sty.array[j] = style;
          topZ = (f.dim.H + 0.4) * k;
        }
      }
      var idx;
      if ((dots || far) && !isSel && !isHov) idx = bbPush(B, st.x, st.y, topZ, R.rgb, null, dotR * 2 + 2, dotR * 2 + 2, 0, 0);
      else {
        var hh = isSel || isHov ? hB + 3 : hB, ww = R.uv ? hh * R.uv[4] : hh;
        idx = bbPush(B, st.x, st.y, topZ, R.rgb, R.uv, ww, hh, isSel || isHov ? 3 : 1, topZ > 1 ? hh / 2 + 3 : 0);
      }
      rendered.push(b, st.x, st.y, topZ, idx);
    }
    if (sel) bbPush(B, sel.x, sel.y, 0.3, [1, 1, 1], null, show3D ? 70 : 54, show3D ? 70 : 54, 2, 0);
    F.forEach(function (f) {
      f.mesh.count = f.n;
      f.mesh.visible = f.n > 0;
      if (f.n) { f.mesh.instanceMatrix.needsUpdate = true; f.col.needsUpdate = true; f.sty.needsUpdate = true; }
    });
    B.geo.instanceCount = B.n;
    ["iPos", "iCol", "iUv", "iSize"].forEach(function (a) { B.geo.getAttribute(a).needsUpdate = true; });
    var gl = H.renderer().getContext(), cv = map.getCanvas();
    B.mat.uniforms.uView.value.set(gl.drawingBufferWidth, gl.drawingBufferHeight);
    B.mat.uniforms.uDpr.value = gl.drawingBufferWidth / Math.max(1, cv.clientWidth);
    B.mat.uniforms.uTime.value = performance.now() / 1000;
    model.frameZ = z; model.show3D = show3D; model.dots = dots; model.farR2 = farR2; model.cL = cL;

    // ติดตามคันที่เลือก
    if (follow && sel) { var ll = H.toLngLat(sel.x, sel.y); model.followTo = ll; requestAnimationFrame(doFollow); }
    else if (follow && selBus && !sel) stopFollow();

    // อัตราวาด: ซูมใกล้ = ต่อเนื่อง · ซูมกลาง/ไกล = ปลุกเป็นช่วง (รถขยับไม่ถึงพิกเซลต่อเฟรม — ไม่ต้องวาด 60 ครั้ง/วิ)
    var cont = (z >= MODEL_ZOOM - 0.5 || follow || !!sel) && rendered.length > 0;
    if (cont !== animOn) { animOn = cont; H.setAnim(MOD_ID, cont); }
    if (!cont && !wake && visible) wake = setTimeout(function () { wake = null; if (visible) H.repaint(); }, !rendered.length ? 2000 : dots ? 700 : 160);
  }
  function doFollow() {
    if (!follow || !model || !model.followTo || map.isEasing()) return;   // ระหว่างบิน/ซูม ไม่ขัดจังหวะกล้อง
    map.setCenter(model.followTo);
  }
  function stopFollow() { follow = false; refreshCard(); }

  /* ================================================================ ชั้น MapLibre: ป้ายรถเมล์ + เส้นทางที่เลือก */
  var SRC_STOPS = "bus3d-stops", SRC_SEL = "bus3d-sel", SRC_SELSTOP = "bus3d-selstops";
  var LYRS = ["bus3d-sel-case", "bus3d-sel-line", "bus3d-stops", "bus3d-selstops"];
  var stopsGeo = null;
  function beforeId() {
    if (map.getLayer("bkk-3d-world")) return "bkk-3d-world";
    if (map.getLayer("city-buildings-3d")) return "city-buildings-3d";
    return undefined;
  }
  function addMapLayers() {
    if (!map || !model) return;
    try {
      if (!stopsGeo) {
        var fs = [];
        for (var i = 0; i < stops.n; i++) fs.push({ type: "Feature", id: i, properties: { i: i }, geometry: { type: "Point", coordinates: [stops.lon[i], stops.lat[i]] } });
        stopsGeo = { type: "FeatureCollection", features: fs };
      }
      var th = H.theme(), sc = STOP_COL[th] || STOP_COL.dark, bf = beforeId();
      if (!map.getSource(SRC_STOPS)) map.addSource(SRC_STOPS, { type: "geojson", data: stopsGeo });
      if (!map.getSource(SRC_SEL)) map.addSource(SRC_SEL, { type: "geojson", data: selRouteGeo() });
      if (!map.getSource(SRC_SELSTOP)) map.addSource(SRC_SELSTOP, { type: "geojson", data: selStopsGeo() });
      if (!map.getLayer("bus3d-sel-case")) map.addLayer({ id: "bus3d-sel-case", type: "line", source: SRC_SEL, layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": th === "dark" ? "#0b1220" : "#ffffff", "line-width": ["interpolate", ["linear"], ["zoom"], 11, 4, 15, 9, 18, 14], "line-opacity": 0.9 } }, bf);
      if (!map.getLayer("bus3d-sel-line")) map.addLayer({ id: "bus3d-sel-line", type: "line", source: SRC_SEL, layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": ["get", "col"], "line-width": ["interpolate", ["linear"], ["zoom"], 11, 2, 15, 5, 18, 8] } }, bf);
      if (!map.getLayer("bus3d-stops")) map.addLayer({ id: "bus3d-stops", type: "circle", source: SRC_STOPS, minzoom: STOP_ZOOM,
        paint: { "circle-color": sc[0], "circle-stroke-color": sc[1], "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 14.6, 1.2, 18, 2.2],
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 14.6, 2.6, 18, 5.5], "circle-pitch-alignment": "map",
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 14.6, 0, 15, 1], "circle-stroke-opacity": ["interpolate", ["linear"], ["zoom"], 14.6, 0, 15, 1] } }, bf);
      if (!map.getLayer("bus3d-selstops")) map.addLayer({ id: "bus3d-selstops", type: "circle", source: SRC_SELSTOP, minzoom: 12,
        paint: { "circle-color": "#ffffff", "circle-stroke-color": ["get", "col"], "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 12, 1.5, 17, 3],
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 2, 17, 5.5], "circle-pitch-alignment": "map" } }, bf);
      setLayerVis(visible);
    } catch (e) { console.warn("bus layers:", e); }
  }
  function setLayerVis(on) {
    if (!map) return;
    LYRS.forEach(function (id) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); });
  }
  function selRouteGeo() {
    var fs = [];
    if (selRoute) {
      var seen = {};
      selRoute.trips.forEach(function (tr) {
        if (seen[tr.sh.n + ":" + tr.sh.len]) return;
        seen[tr.sh.n + ":" + tr.sh.len] = 1;
        var c = [];
        for (var i = 0; i < tr.sh.n; i++) c.push([tr.sh.lon[i], tr.sh.lat[i]]);
        fs.push({ type: "Feature", properties: { col: selRoute.col }, geometry: { type: "LineString", coordinates: c } });
      });
    }
    return { type: "FeatureCollection", features: fs };
  }
  function selStopsGeo() {
    var fs = [], seen = {};
    if (selRoute) selRoute.trips.forEach(function (tr) {
      tr.stops.forEach(function (s) {
        if (seen[s]) return; seen[s] = 1;
        fs.push({ type: "Feature", properties: { col: selRoute.col }, geometry: { type: "Point", coordinates: [stops.lon[s], stops.lat[s]] } });
      });
    });
    return { type: "FeatureCollection", features: fs };
  }
  function updateSelLayers() {
    if (!map) return;
    var s = map.getSource(SRC_SEL), s2 = map.getSource(SRC_SELSTOP);
    if (s) s.setData(selRouteGeo());
    if (s2) s2.setData(selStopsGeo());
  }

  /* ================================================================ คลิก / ชี้ */
  function groundHit(ray, z) {
    if (Math.abs(ray.direction.z) < 1e-9) return null;
    var t = (z - ray.origin.z) / ray.direction.z;
    if (t < 0) return null;
    return { x: ray.origin.x + ray.direction.x * t, y: ray.origin.y + ray.direction.y * t, t: t };
  }
  function rayDist(ray, x, y, z) { return (x - ray.origin.x) * ray.direction.x + (y - ray.origin.y) * ray.direction.y + (z - ray.origin.z) * ray.direction.z; }
  /* เรย์ตัดกล่องรถ (ในกรอบของรถ: หมุนกลับตามทิศ แล้วหารสเกล) */
  function rayBox(ray, st, dim) {
    var k = st.k, c = st.hx, s = st.hy;
    var ox = ray.origin.x - st.x, oy = ray.origin.y - st.y, oz = ray.origin.z;
    var lx = (ox * c + oy * s) / k, ly = (-ox * s + oy * c) / k, lz = oz / k;
    var dx = ray.direction.x * c + ray.direction.y * s, dy = -ray.direction.x * s + ray.direction.y * c, dz = ray.direction.z;
    var lo = [-dim.L / 2, -dim.W / 2, 0], hi = [dim.L / 2, dim.W / 2, dim.H], O = [lx, ly, lz], Dd = [dx, dy, dz], t0 = -1e30, t1 = 1e30;
    for (var a = 0; a < 3; a++) {
      if (Math.abs(Dd[a]) < 1e-12) { if (O[a] < lo[a] || O[a] > hi[a]) return -1; continue; }
      var ta = (lo[a] - O[a]) / Dd[a], tb = (hi[a] - O[a]) / Dd[a];
      if (ta > tb) { var q = ta; ta = tb; tb = q; }
      if (ta > t0) t0 = ta; if (tb < t1) t1 = tb;
      if (t0 > t1) return -1;
    }
    return t1 < 0 ? -1 : Math.max(0, t0) * k;
  }
  function pick(ray) {
    if (!model || !visible) return null;
    var g = groundHit(ray, 0);
    if (!g) return null;
    var P = H.project(g.x, g.y, 0);
    if (!P) return null;
    var best = null, rd = model.rendered, B = model.bb, i, z = model.frameZ || 14;
    // 1) รถ 3 มิติ
    if (model.show3D) {
      var st = {};
      for (i = 0; i < rd.length; i += 5) {
        if (rd[i + 3] < 1) continue;                              // วาดเป็นจุด/ป้าย ไม่ใช่โมเดล
        var b = rd[i], cat = CATS[b.t.r.cat] || CATS.metro, dim = model.fleets[cat.kind].dim;
        var s0 = busState(b, _now ? _now.sec : bkkNow().sec, st);
        if (!s0) continue;
        var d = rayBox(ray, s0, dim);
        if (d >= 0 && (!best || d < best.dist)) best = { dist: d, hit: { type: "bus", b: b } };
      }
    }
    // 2) ป้ายเลขสาย/จุด (วาดทับทุกอย่าง → ชนะถ้าโดน)
    for (i = rd.length - 5; i >= 0; i -= 5) {
      var q = H.project(rd[i + 1], rd[i + 2], rd[i + 3]);
      if (!q) continue;
      var bi = rd[i + 4], w = B.iSize[bi * 4], h = B.iSize[bi * 4 + 1], lift = B.iSize[bi * 4 + 3], pad = model.dots ? 5 : 3;
      if (Math.abs(P.x - q.x) <= w / 2 + pad && Math.abs(P.y - (q.y - lift)) <= h / 2 + pad) {
        var dd = rayDist(ray, rd[i + 1], rd[i + 2], rd[i + 3]) * 0.98;
        if (!best || dd < best.dist) best = { dist: dd, hit: { type: "bus", b: rd[i] } };
        break;
      }
    }
    if (best) return best;
    // 3) ป้ายรถเมล์ (ซูมใกล้)
    if (z >= STOP_ZOOM + 0.2) {
      var P2 = H.project(g.x + 10, g.y, 0), mpp = P2 ? 10 / Math.max(0.01, Math.hypot(P2.x - P.x, P2.y - P.y)) : 2;
      var rM = Math.min(250, 10 * mpp), cx = Math.floor(g.x / 250), cy = Math.floor(g.y / 250), bestS = null;
      for (var gx = cx - 1; gx <= cx + 1; gx++) for (var gy = cy - 1; gy <= cy + 1; gy++) {
        var cell = stops.grid[gx + "," + gy];
        if (!cell) continue;
        cell.forEach(function (si) {
          var dm = Math.hypot(stops.x[si] - g.x, stops.y[si] - g.y);
          if (dm < rM && (!bestS || dm < bestS.d)) bestS = { d: dm, i: si };
        });
      }
      if (bestS) return { dist: g.t, hit: { type: "stop", i: bestS.i } };
    }
    return null;
  }
  function hover(h) {
    var k = h && h.type === "bus" ? h.b.key : null;
    if (k !== hoverKey) { hoverKey = k; H.repaint(); }
  }
  function click(h) {
    if (h.type === "bus") { selBus = { key: h.b.key, b: h.b }; showCard({ type: "bus", b: h.b }); }
    else if (h.type === "stop") { selBus = null; stopFollow(); showCard({ type: "stop", i: h.i }); }
    H.repaint();
  }

  /* ================================================================ การ์ด */
  function head(type, icon, name, sub) {
    return '<div class="elv-head"><div class="elv-type">' + ico(icon) + ' ' + type + '</div><h3 class="elv-name">' + name + '</h3>' +
      (sub ? '<p class="elv-sub">' + sub + '</p>' : '') + '<button type="button" class="elv-x" aria-label="ปิด">×</button></div>';
  }
  function cell(k, v, u) { return '<div class="elv-cell"><div class="elv-k">' + k + '</div><div class="elv-v">' + v + (u ? '<small>' + u + '</small>' : '') + '</div></div>'; }
  function row(k, v) { return '<div class="elv-row"><b>' + k + '</b><span>' + v + '</span></div>'; }
  function badge(R, big) {
    return '<span class="bus-bdg' + (big ? " big" : "") + '" style="background:' + esc(R.col) + ';color:' + (R.dark ? "#10141a" : "#fff") + '">' + esc(R.badge) + '</span>';
  }
  function catLine(R) {
    var cl = (R.clsList || [R.cls]).map(function (c) { return CLS_NAME[c]; }).filter(Boolean);
    return (CATS[R.cat] ? CATS[R.cat].n : "") + (cl.length && R.cat !== "van" && R.cat !== "soi" ? " · " + cl.join(" + ") : "");
  }
  function agName(R) { return R.agId === "DLT" ? "รถร่วมบริการ (กำกับโดยกรมการขนส่งทางบก)" : R.ag; }
  function fareText(R) { return R.fare ? (R.fare[0] === R.fare[1] ? fmt(R.fare[0]) : fmt(R.fare[0]) + "–" + fmt(R.fare[1])) + " บาท" : ""; }
  var TH_MON = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  function thDate(v) { var s = String(v); return /^\d{8}$/.test(s) ? +s.slice(6) + " " + TH_MON[+s.slice(4, 6) - 1] + " " + (+s.slice(0, 4) + 543) : s; }
  var SRC_NOTE = function () { return 'ข้อมูลเส้นทาง/ตารางเดินรถ: GTFS ของ สนข. (ระบบนำทาง) · ' + esc(D.lic) + ' · ปรับปรุง ' + thDate(D.v); };
  function titleOf(R) { return "สาย " + esc(R.main) + (R.old ? ' <small class="bus-old">(เดิม ' + esc(R.old) + ')</small>' : ""); }

  function busCard(h) {
    var b = h.b, tr = b.t, R = tr.r, now = _now || bkkNow(), st = busState(b, now.sec, {});
    if (!st) return head("รถเมล์", "bus", titleOf(R), esc(R.name)) + '<div class="elv-body"><p class="elv-note">รถคันนี้ถึงปลายทางแล้ว</p></div>';
    var n = tr.stops.length, nx = st.dwell ? st.i : st.i + 1, hw = groupHeadway(R.g, tr.dir, now) || headwayAt(tr, (b.d % 86400 + 86400) % 86400);
    var nextTxt;
    if (st.dwell && st.i === n - 1) nextTxt = "ถึงปลายทางแล้ว";
    else if (st.dwell) nextTxt = "จอดอยู่ที่ <b>" + esc(stops.names[tr.stops[st.i]]) + "</b>";
    else nextTxt = esc(stops.names[tr.stops[nx]]) + " · อีก " + mins(tr.arr[nx] - st.e);
    var remain = tr.dist[n - 1] - st.s;
    return head(esc(catLine(R)), "bus", titleOf(R), esc(R.name)) +
      '<div class="elv-body"><div class="elv-grid">' +
      cell("ความเร็วตอนนี้", st.dwell ? "จอด" : fmt(st.v * 3.6), st.dwell ? "รับ-ส่งผู้โดยสาร" : "กม./ชม.") +
      cell("รถมาทุก", hw ? "~" + fmt(Math.round(hw / 60)) : "–", "นาที") + '</div>' +
      row("มุ่งหน้า", esc(tr.head || stops.names[tr.stops[n - 1]])) +
      row(st.dwell ? "ตอนนี้" : "ป้ายถัดไป", nextTxt) +
      row("ถึงปลายทาง", st.i === n - 1 ? "ถึงแล้ว" : "อีก " + fmt(remain / 1000, 1) + " กม. · " + mins(tr.T - st.e) + " (ตามตาราง)") +
      row("ผ่านมาแล้ว", fmt(st.i + 1) + " / " + fmt(n) + " ป้าย · ออกจากต้นทาง " + hms(b.d)) +
      row("ผู้ให้บริการ", esc(agName(R))) + (R.desc ? row("ประเภทรถ", esc(R.desc)) : "") +
      (R.fare ? row("ค่าโดยสาร", fareText(R)) : "") +
      '<div class="elv-actions"><button type="button" class="elv-btn primary" data-act="route">' + ico("route") + ' ดูเส้นทางสายนี้</button>' +
      '<button type="button" class="elv-btn' + (follow ? " primary" : "") + '" data-act="follow">' + ico("locate-fixed") + (follow ? " กำลังติดตาม" : " ติดตามคันนี้") + '</button></div>' +
      '<p class="elv-note"><b>ตำแหน่งจำลองจากตารางเดินรถทางการ ไม่ใช่ GPS จริง</b> — รถออกจากต้นทางตามความถี่ของช่วงเวลานี้ แล้ววิ่ง-จอดตามเวลาระหว่างป้ายในตาราง (ยังไม่มีข้อมูลตำแหน่งรถเมล์แบบเปิดให้ใช้) · สีรถตามรหัสสีของสาย · ' + SRC_NOTE() + '</p></div>';
  }
  /* รถคันถัดไปของแต่ละสายที่จะถึงป้ายนี้ (ตามตาราง) */
  function arrivals(si, now) {
    var L = stopTrips[si] || [], out = {}, ds = days(now);
    for (var q = 0; q < L.length; q += 2) {
      var tr = L[q], p = L[q + 1];
      if (p === tr.stops.length - 1) continue;                    // ป้ายปลายทาง — ไม่มีรถออกต่อ
      if (!catOn(tr.r.cat)) continue;
      var best = null;
      for (var di = 0; di < ds.length; di++) {
        if (!ds[di].svc[tr.svc]) continue;
        var t = now.sec + ds[di].shift;
        tr.win.forEach(function (w) {
          var a = w[0], h = w[2], kLast = Math.floor((w[1] - 1 - a) / h);
          var k0 = Math.max(0, Math.floor((t - tr.arr[p] - a) / h) - 1);
          for (var k = k0; k <= Math.min(kLast, k0 + 3); k++) {
            var eta = a + k * h + jit(tr.i, a, k, h) + tr.arr[p] - t;
            if (eta >= -10 && (best == null || eta < best)) best = eta;
          }
        });
      }
      var key = tr.r.g.i + "|" + tr.head;
      if (!out[key] || (best != null && (out[key].eta == null || best < out[key].eta))) out[key] = { R: tr.r.g, head: tr.head, eta: best };
    }
    return Object.keys(out).map(function (k) { return out[k]; }).sort(function (a, b) {
      return (a.eta == null ? 1e9 : a.eta) - (b.eta == null ? 1e9 : b.eta);
    });
  }
  function stopCard(h) {
    var now = _now || bkkNow(), list = arrivals(h.i, now), shown = h.all ? list : list.slice(0, 12);
    var nR = {}; list.forEach(function (x) { nR[x.R.i] = 1; });
    var rows = shown.map(function (x) {
      var eta = x.eta == null || x.eta > 5400 ? '<em>ไม่มีรถช่วงนี้</em>' : x.eta < 60 ? "กำลังเข้าป้าย" : mins(x.eta);
      return '<button type="button" class="bus-arr" data-r="' + x.R.i + '">' + badge(x.R) + '<span class="bus-arr-h">' + ico("chevron-right") + ' ' + esc(x.head) + '</span><b>' + eta + '</b></button>';
    }).join("");
    return head("ป้ายรถเมล์", "signpost", esc(stops.names[h.i]), "ผ่าน " + fmt(Object.keys(nR).length) + " สาย" + (list.length ? "" : " (ในหมวดที่เปิดอยู่)")) +
      '<div class="elv-body"><div class="bus-arrs">' + (rows || '<p class="elv-note">ไม่มีสายในหมวดที่เปิดอยู่ผ่านป้ายนี้</p>') + '</div>' +
      (list.length > shown.length ? '<button type="button" class="elv-btn bus-more" data-act="all">ดูทั้งหมด ' + fmt(list.length) + ' รายการ</button>' : "") +
      '<p class="elv-note">เวลาที่รถคันถัดไปจะถึงป้าย <b>คำนวณจากตารางเดินรถ ไม่ใช่ GPS จริง</b> · กดที่สายเพื่อดูเส้นทาง · ' + SRC_NOTE() + '</p></div>';
  }
  function routeCard(h) {
    var R = h.R, now = _now || bkkNow(), run = countRunning(now, R), hw = groupHeadway(R, null, now);
    // เที่ยววันทำการ/วันหยุดของทิศเดียวกันมักซ้ำกัน → แสดงครั้งเดียว
    var seen = {}, uniq = [];
    R.trips.forEach(function (tr) {
      var key = tr.head + "|" + tr.stops.length + "|" + Math.round(tr.dist[tr.dist.length - 1] / 100);
      if (seen[key]) return;
      seen[key] = 1;
      uniq.push('<button type="button" class="bus-dir' + (h.dirT === tr.i ? " on" : "") + '" data-t="' + tr.i + '">' + ico("chevron-right") + ' ' + esc(tr.head || "ทิศทาง " + (tr.dir + 1)) +
        '<small>' + fmt(tr.stops.length) + ' ป้าย · ' + fmt(tr.dist[tr.dist.length - 1] / 1000, 1) + ' กม. · ~' + fmt(Math.round(tr.T / 60)) + ' นาที · กดดูรายชื่อป้าย</small></button>');
    });
    var list = "";
    if (h.dirT != null) {
      var tr = trips[h.dirT];
      list = '<div class="bus-stops">' + tr.stops.map(function (s, k) {
        return '<button type="button" class="bus-st" data-s="' + s + '"><i style="border-color:' + esc(R.col) + '"></i>' + esc(stops.names[s]) + '<small>' + (k ? "+" + fmt(Math.round(tr.arr[k] / 60)) + " นาที" : "ต้นทาง") + '</small></button>';
      }).join("") + '</div>';
    }
    return head(esc(catLine(R)), "route", titleOf(R), esc(R.name)) +
      '<div class="elv-body"><div class="elv-grid">' + cell("รถวิ่งอยู่ตอนนี้", fmt(run), "คัน") + cell("รถมาทุก", hw ? "~" + fmt(Math.round(hw / 60)) : "–", hw ? "นาที" : "นอกเวลาให้บริการ") + '</div>' +
      row("ผู้ให้บริการ", esc(agName(R))) + (R.desc ? row("ประเภทรถ", esc(R.desc)) : "") +
      (R.fare ? row("ค่าโดยสาร", fareText(R)) : "") + row("เวลาให้บริการ", serviceSpan(R) + " น. (" + dayLabel(now) + ")") +
      '<div class="bus-dirs">' + uniq.join("") + '</div>' + list +
      '<div class="elv-actions"><button type="button" class="elv-btn primary" data-act="fit" title="ซูมให้เห็นทั้งเส้นทาง">' + ico("map-pin") + ' ทั้งสาย</button>' +
      '<button type="button" class="elv-btn' + (routeOnly ? " primary" : "") + '" data-act="only" aria-pressed="' + routeOnly + '" title="ซ่อนรถสายอื่น">' + ico("eye") + ' เฉพาะสายนี้</button>' +
      '<button type="button" class="elv-btn" data-act="clear" title="ล้างการเลือกสาย">× ล้าง</button></div>' +
      '<p class="elv-note">เส้นทางและป้ายจากตารางเดินรถทางการ · รถที่เห็นเป็นการจำลองตามความถี่ ไม่ใช่ GPS จริง · ' + SRC_NOTE() + '</p></div>';
  }
  function cardHTML(h) {
    if (h.type === "bus") return busCard(h);
    if (h.type === "stop") return stopCard(h);
    if (h.type === "route") return routeCard(h);
    return "";
  }
  var cardTimer = null;
  function showCard(h) {
    var card = $("#busCard");
    if (!card) return;
    var keepScroll = card._hit && card._hit.type === h.type && card.classList.contains("open") ? card.scrollTop : 0;
    card.innerHTML = cardHTML(h);
    card.classList.add("open");
    card.scrollTop = keepScroll;
    card._hit = h;
    card.querySelector(".elv-x").addEventListener("click", closeCard);
    card.onclick = function (e) {
      var t = e.target.closest("[data-act],[data-r],[data-t],[data-s]");
      if (!t) return;
      var act = t.dataset.act;
      if (t.dataset.r != null) { selectRoute(groups[+t.dataset.r], true); return; }
      if (t.dataset.t != null) { h.dirT = h.dirT === +t.dataset.t ? null : +t.dataset.t; showCard(h); return; }
      if (t.dataset.s != null) { var si = +t.dataset.s; map.flyTo({ center: [stops.lon[si], stops.lat[si]], zoom: 17, pitch: 55, duration: 1400 }); showCard({ type: "stop", i: si }); return; }
      if (act === "route") selectRoute(h.b.t.r.g, true);
      else if (act === "follow") {
        follow = !follow;
        var s1 = follow ? busState(h.b, bkkNow().sec, {}) : null;
        if (s1) map.easeTo({ center: H.toLngLat(s1.x, s1.y), zoom: Math.max(map.getZoom(), 16.5), pitch: 60, duration: 900 });
        showCard(h); H.repaint();
      }
      else if (act === "all") { h.all = true; showCard(h); }
      else if (act === "fit") fitRoute(h.R);
      else if (act === "only") { setRouteOnly(!routeOnly); showCard(h); }
      else if (act === "clear") { selectRoute(null); closeCard(); }
    };
    clearInterval(cardTimer);
    if (h.type === "bus" || h.type === "stop") cardTimer = setInterval(refreshCard, h.type === "bus" ? 1000 : 15000);
  }
  function refreshCard() {
    var card = $("#busCard");
    if (!card || !card.classList.contains("open") || !card._hit) { clearInterval(cardTimer); return; }
    if (card.contains(document.activeElement) && document.activeElement.tagName === "BUTTON" && card._hit.type !== "bus") return;
    showCard(card._hit);
  }
  function closeCard() {
    var card = $("#busCard");
    if (card) { card.classList.remove("open"); card._hit = null; }
    clearInterval(cardTimer);
    selBus = null; follow = false;
    if (H) H.repaint();
  }

  /* ================================================================ เลือกสาย / ค้นหา */
  function selectRoute(R, openCard) {
    selRoute = R || null;
    if (!R) routeOnly = false;
    updateSelLayers();
    if (model) model.listAt = 0;
    renderPill();
    if (R && openCard) { selBus = null; follow = false; showCard({ type: "route", R: R }); fitRoute(R); }
    H.repaint();
  }
  function setRouteOnly(on) { routeOnly = !!on && !!selRoute; if (model) model.listAt = 0; renderPill(); H.repaint(); }
  function fitRoute(R) {
    var ll0 = H.toLngLat(R.bb[0], R.bb[1]), ll1 = H.toLngLat(R.bb[2], R.bb[3]);
    map.fitBounds([[Math.min(ll0[0], ll1[0]), Math.min(ll0[1], ll1[1])], [Math.max(ll0[0], ll1[0]), Math.max(ll0[1], ll1[1])]],
      { padding: { top: 70, bottom: 70, left: 70, right: Math.min(380, map.getCanvas().clientWidth * 0.45) }, pitch: 35, duration: 1500, maxZoom: 16 });
  }
  function renderPill() {
    var p = $("#busPill");
    if (!p) return;
    if (!selRoute || !visible) { p.classList.remove("open"); p.innerHTML = ""; return; }
    p.innerHTML = badge(selRoute, true) + '<span class="bus-pill-n">' + esc(selRoute.name) + '</span>' +
      '<label class="bus-pill-o"><input type="checkbox"' + (routeOnly ? " checked" : "") + '> เฉพาะสายนี้</label>' +
      '<button type="button" class="bus-pill-x" aria-label="ล้างการเลือกสาย">×</button>';
    p.classList.add("open");
    p.querySelector("input").onchange = function (e) { setRouteOnly(e.target.checked); var c = $("#busCard"); if (c && c._hit && c._hit.type === "route") showCard(c._hit); };
    p.querySelector(".bus-pill-x").onclick = function () { selectRoute(null); var c = $("#busCard"); if (c && c._hit && c._hit.type === "route") closeCard(); };
    p.querySelector(".bus-bdg").onclick = function () { showCard({ type: "route", R: selRoute }); };
  }
  function norm(s) { return String(s || "").toLowerCase().replace(/\s+/g, " ").trim(); }
  function search(q) {
    q = norm(q);
    if (!q) return [];
    var out = [];
    groups.forEach(function (R) {
      var main = R.main.toLowerCase(), old = R.old.toLowerCase(), bd = R.badge.toLowerCase(), sc;
      if (main === q || old === q || bd === q) sc = 0;
      else if (main.indexOf(q) === 0 || old.indexOf(q) === 0) sc = 1;
      else if (main.indexOf(q) >= 0 || old.indexOf(q) >= 0) sc = 2;
      else if (R.search.indexOf(q) >= 0) sc = 3;
      else return;
      out.push({ R: R, sc: sc });
    });
    out.sort(function (a, b) { return a.sc - b.sc || a.R.main.length - b.R.main.length || a.R.main.localeCompare(b.R.main, "th", { numeric: true }); });
    return out.slice(0, 50);
  }
  function panelStatus() {
    var el = $("#busStatus");
    if (!el || !model) return;
    var now = bkkNow();
    if (Date.now() - lastCount.at > 5000) lastCount = { n: countRunning(now, null), at: Date.now() };
    el.innerHTML = '<span class="bus-dot"></span>จำลองตามตาราง · ' + dayLabel(now) + ' ' + hms(now.sec) + ' น. · รถวิ่งอยู่ <b>' + fmt(lastCount.n) + '</b> คัน';
  }
  function renderResults() {
    var inp = $("#busQ"), box = $("#busRes");
    if (!inp || !box || !model) return;
    var res = search(inp.value);
    if (!inp.value.trim()) {
      box.innerHTML = '<p class="bus-hint">พิมพ์เลขสาย เช่น <b>8</b>, <b>3-12E</b>, <b>ต.101</b> หรือชื่อปลายทาง เช่น <b>หมอชิต</b></p>';
      return;
    }
    box.innerHTML = res.length ? res.map(function (x) {
      return '<button type="button" class="bus-res" data-r="' + x.R.i + '">' + badge(x.R) + '<span><b>' + esc(x.R.name) + '</b><small>' + esc(catLine(x.R)) + (x.R.old ? " · เดิม " + esc(x.R.old) : "") + '</small></span></button>';
    }).join("") : '<p class="bus-hint">ไม่พบสายที่ตรงกับ “' + esc(inp.value) + '”</p>';
  }
  function renderGroups() {
    var box = $("#busGrp");
    if (!box) return;
    box.innerHTML = GROUPS.map(function (g) {
      var n = g.cats.reduce(function (s, c) { return s + (CATS[c].count || 0); }, 0);
      return '<button type="button" class="bus-g' + (grpOn[g.id] !== false ? " on" : "") + '" data-g="' + g.id + '">' + esc(g.n) + ' <small>' + fmt(n) + '</small></button>';
    }).join("");
  }
  var statusTimer = null;
  // วางแผงข้างคอลัมน์ปุ่มซูมใต้แถวปุ่ม (จอเล็กใช้ตำแหน่งจาก CSS) — #toolbarStack กว้างเต็มจอ
  // วางด้านขวาของมันจะหลุดขอบจอ · ไม่มีคอลัมน์ซูม → วางใต้แถบทั้งหมด (สูตรเดียวกับ bkk-floodsim.js)
  function placePanel() {
    var p = $("#busPanel"), ts = $("#toolbarStack") || $("#leftMenu"), stg = $(".stage");
    if (!p) return;
    if (ts && stg && window.innerWidth > 760) {
      var r0 = stg.getBoundingClientRect(), r1 = ts.getBoundingClientRect();
      var zc = ts.querySelector(".map-zoom-controls");
      var rz = zc && zc.offsetWidth ? zc.getBoundingClientRect() : null;
      var left = rz ? rz.right - r0.left + 10 : r1.left - r0.left;
      var top = rz ? rz.top - r0.top : r1.bottom - r0.top + 10;
      left = Math.max(14, Math.min(left, r0.width - p.offsetWidth - 14));
      top = Math.max(14, top);
      p.style.left = Math.round(left) + "px";
      p.style.top = Math.round(top) + "px";
      p.style.maxHeight = Math.max(160, Math.round(r0.height - top - 14)) + "px";
    } else { p.style.left = ""; p.style.top = ""; p.style.maxHeight = ""; }
  }
  function togglePanel(force) {
    var p = $("#busPanel");
    if (!p) return;
    var open = force != null ? force : !p.classList.contains("open");
    p.classList.toggle("open", open);
    var b = $("#btnBusSearch");
    if (b) b.classList.toggle("active", open);
    clearInterval(statusTimer);
    if (open) {
      placePanel();
      ensureLoaded().then(function () { renderGroups(); renderResults(); panelStatus(); });
      statusTimer = setInterval(panelStatus, 5000);
      setTimeout(function () { var i = $("#busQ"); if (i) i.focus(); }, 50);
    }
  }

  /* ================================================================ UI */
  function syncButtons() {
    var btn = $("#btnBusToggle"), sb = $("#btnBusSearch");
    if (btn) btn.classList.toggle("active", visible);
    if (sb) sb.style.display = visible ? "" : "none";
    if (!visible) togglePanel(false);
    renderPill();
  }
  function setVisible(v) {
    visible = !!v;
    lsSet(LS_KEY, visible ? "1" : "0");
    syncButtons();
    if (group) group.visible = visible;
    if (!visible) {
      if (H) { H.show(MOD_ID, false); H.setAnim(MOD_ID, false); }
      animOn = false;
      setLayerVis(false); closeCard(); hoverKey = null;
      return;
    }
    if (failed) { failed = false; loading = null; }
    ensureLoaded().then(function () {
      if (!model || !visible) return;
      H.show(MOD_ID, true);
      addMapLayers();
      setLayerVis(true);
      var c = map.getCenter(), far = c.lng < 100.2 || c.lng > 100.95 || c.lat < 13.45 || c.lat > 14.15;
      if (far || map.getZoom() < 12) map.flyTo(Object.assign({ duration: 1800 }, HOME));
      H.repaint();
    });
  }
  function setGroup(id, on) {
    grpOn[id] = !!on;
    lsSet(LS_GRP, JSON.stringify(grpOn));
    if (model) model.listAt = 0;
    lastCount.at = 0;
    renderGroups(); panelStatus();
    var c = $("#busCard");
    if (c && c._hit && c._hit.type === "stop") showCard(c._hit);
    H.repaint();
  }
  var CSS = [
    "#busCard{position:absolute;right:14px;top:14px;width:340px;max-width:calc(100% - 28px);max-height:calc(100% - 28px);overflow:auto;z-index:41;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.28);",
    "backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:var(--text-main);font-size:12.5px;line-height:1.5;display:none}",
    "#busCard.open{display:block;animation:elvIn .22s ease}",
    ".bus-bdg{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:21px;padding:0 7px;border-radius:6px;font:800 11.5px/1 system-ui,sans-serif;",
    "white-space:nowrap;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.85);flex:none}",
    ".bus-bdg.big{height:26px;min-width:42px;font-size:13px;cursor:pointer}",
    ".bus-old{font-size:.62em;font-weight:600;opacity:.7}",
    ".bus-arrs{display:flex;flex-direction:column;gap:3px}",
    ".bus-arr,.bus-res,.bus-dir,.bus-st{display:flex;align-items:center;gap:8px;width:100%;padding:6px 8px;border:0;border-radius:9px;background:none;color:var(--text-main);font:inherit;text-align:left;cursor:pointer}",
    ".bus-arr:hover,.bus-res:hover,.bus-dir:hover,.bus-st:hover{background:var(--accent-soft)}",
    ".bus-arr-h{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}",
    ".bus-arr b{font-size:11.5px;white-space:nowrap}.bus-arr em{font-style:normal;opacity:.55;font-size:11px;font-weight:500}",
    ".bus-more{margin-top:6px}",
    ".bus-dirs{margin:8px 0 2px;display:flex;flex-direction:column;gap:2px}",
    ".bus-dir{flex-wrap:wrap;font-weight:700;font-size:12px}.bus-dir small{flex-basis:100%;padding-left:20px;font-weight:500;opacity:.7;font-size:11px}",
    ".bus-dir.on{background:var(--accent-soft)}.bus-dir.on .mdico{transform:rotate(90deg)}",
    ".bus-stops{max-height:260px;overflow:auto;margin:2px 0 6px;padding:2px 0;border-left:2px dashed var(--card-border);margin-left:14px}",
    ".bus-st{padding:3px 8px;font-size:11.5px}.bus-st i{width:9px;height:9px;border-radius:50%;border:2.5px solid;background:#fff;flex:none;margin-left:-14px}",
    ".bus-st small{margin-left:auto;opacity:.6;white-space:nowrap}",
    "#busPanel{position:absolute;z-index:44;left:14px;top:120px;width:330px;max-width:calc(100% - 28px);max-height:calc(100% - 140px);display:none;flex-direction:column;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:var(--text-main);font-size:12.5px}",
    "#busPanel.open{display:flex;animation:elvIn .22s ease}",
    ".bus-ph{display:flex;align-items:center;gap:8px;padding:12px 14px 6px;font-weight:800;font-size:13.5px}.bus-ph button{margin-left:auto;border:0;background:none;color:inherit;font-size:18px;cursor:pointer;line-height:1}",
    "#busStatus{padding:0 14px 8px;font-size:11px;opacity:.85}.bus-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#f59e0b;margin-right:6px;vertical-align:1px}",
    "#busQ{margin:0 14px;padding:8px 11px;border-radius:10px;border:1px solid var(--card-border);background:rgba(127,127,127,.08);color:var(--text-main);font:inherit;font-size:13px;outline:none}",
    "#busQ:focus{border-color:var(--accent)}",
    "#busGrp{display:flex;flex-wrap:wrap;gap:5px;padding:9px 14px 6px}",
    ".bus-g{padding:4px 9px;border-radius:999px;border:1px solid var(--card-border);background:none;color:var(--text-muted);font:inherit;font-size:11px;cursor:pointer;opacity:.75}",
    ".bus-g.on{background:var(--accent-soft);color:var(--text-main);border-color:var(--accent);opacity:1}.bus-g small{opacity:.65}",
    "#busRes{overflow:auto;padding:2px 8px 6px;min-height:40px}",
    ".bus-res span{display:flex;flex-direction:column;min-width:0}.bus-res b{font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bus-res small{font-size:10.5px;opacity:.65}",
    ".bus-hint{padding:6px 8px;margin:0;font-size:11.5px;opacity:.75;line-height:1.6}",
    ".bus-src{margin:0;padding:8px 14px 11px;font-size:10px;opacity:.6;border-top:1px solid var(--card-border);line-height:1.5}",
    "#busPill{position:absolute;z-index:42;left:50%;top:14px;transform:translateX(-50%);display:none;align-items:center;gap:8px;padding:6px 8px 6px 7px;max-width:min(520px,calc(100% - 760px));",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.25);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);color:var(--text-main);font-size:12px}",
    "#busPill.open{display:flex}",
    ".bus-pill-n{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}",
    ".bus-pill-o{display:flex;align-items:center;gap:4px;white-space:nowrap;font-size:11px;opacity:.9;cursor:pointer}",
    ".bus-pill-x{border:0;background:rgba(127,127,127,.18);color:inherit;width:22px;height:22px;border-radius:50%;cursor:pointer;flex:none;font-size:14px;line-height:1}",
    // จอแคบ: ย้ายแถบสายที่เลือกไปมุมล่างขวา (เหนือเครดิตแผนที่) และซ่อนระหว่างการ์ดเปิด — การ์ดบอกสายอยู่แล้ว
    "@media (max-width:1180px){#busPill{top:auto;bottom:42px;left:auto;right:14px;transform:none;max-width:calc(100% - 320px)}#busCard.open~#busPill{display:none}}",
    "@media (max-width:760px){#busPill{max-width:calc(100% - 28px);bottom:86px}#busPanel{top:auto;bottom:80px;max-height:60vh}}"
  ].join("");
  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    addIcons();
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnBusToggle")) {
      var mk = function (id, icon, label, title, fn) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "menu-btn"; b.id = id; b.title = title;
        b.innerHTML = '<span>' + ico(icon) + '</span><span class="label-text"> ' + label + '</span>';
        b.addEventListener("click", fn);
        menu.appendChild(b);
        return b;
      };
      mk("btnBusToggle", "bus", "รถเมล์", "เปิด/ปิดรถเมล์ — รถโดยสารกรุงเทพฯ-ปริมณฑลวิ่งตามตารางเดินรถทางการ (จำลอง ไม่ใช่ GPS จริง)", function () { setVisible(!visible); });
      mk("btnBusSearch", "search", "ค้นหาสายรถเมล์", "ค้นหาเลขสาย/ชื่อสาย และเลือกประเภทรถที่แสดง", function (e) { e.stopPropagation(); togglePanel(); });
    }
    if (!$("#busCard")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var card = document.createElement("div");
      card.id = "busCard"; card.setAttribute("role", "dialog"); card.setAttribute("aria-label", "ข้อมูลรถเมล์");
      stage.appendChild(card);
      var pill = document.createElement("div");
      pill.id = "busPill";
      stage.appendChild(pill);
      var p = document.createElement("div");
      p.id = "busPanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "ค้นหาสายรถเมล์");
      p.innerHTML = '<div class="bus-ph">' + ico("bus") + ' รถเมล์กรุงเทพฯ-ปริมณฑล<button type="button" aria-label="ปิด">×</button></div>' +
        '<div id="busStatus"></div><input id="busQ" type="search" placeholder="ค้นหาเลขสายหรือชื่อสาย…" autocomplete="off">' +
        '<div id="busGrp"></div><div id="busRes"></div>' +
        '<p class="bus-src">ตำแหน่งรถเป็นการจำลองจากตารางเดินรถทางการ (ยังไม่มีข้อมูล GPS รถเมล์แบบเปิด) · เส้นทาง ป้าย ความถี่ และค่าโดยสาร: GTFS ของ สนข. (ระบบนำทาง) CC-BY 4.0</p>';
      stage.appendChild(p);
      p.querySelector(".bus-ph button").onclick = function () { togglePanel(false); };
      p.querySelector("#busQ").addEventListener("input", renderResults);
      p.addEventListener("click", function (e) {
        var g = e.target.closest("[data-g]");
        if (g) { setGroup(g.dataset.g, grpOn[g.dataset.g] === false); return; }
        var r = e.target.closest("[data-r]");
        if (r) selectRoute(groups[+r.dataset.r], true);
      });
    }
    syncButtons();
  }

  /* ================================================================ mount */
  function mount(m) {
    map = m;
    H = window.BKK_3D;
    if (!H) { console.warn("bkk-bus3d: ต้องโหลด bkk-3d-host.js ก่อน"); return; }
    H.attach(m);
    visible = lsGet(LS_KEY) === "1";                   // ชั้นใหม่: ปิดไว้ก่อนจนผู้ใช้เปิดเอง
    try { grpOn = JSON.parse(lsGet(LS_GRP) || "{}") || {}; } catch (e) { grpOn = {}; }
    buildUI();
    if (!mount._bound) {
      mount._bound = true;
      map.on("dragstart", function () { if (follow) stopFollow(); });
      // จอเปลี่ยนขนาด / ย่อ-ขยายแถบเครื่องมือ → วางแผงค้นหาใหม่ถ้ากำลังเปิดอยู่
      var rePlace = function () { var p = $("#busPanel"); if (p && p.classList.contains("open")) placePanel(); };
      window.addEventListener("resize", rePlace);
      var tsEl = $("#toolbarStack");
      if (tsEl && window.ResizeObserver) new ResizeObserver(rePlace).observe(tsEl);
    }
    if (!visible) return;
    var go = function () {
      ensureLoaded().then(function () { if (!model || !visible) return; H.show(MOD_ID, true); addMapLayers(); H.repaint(); });
    };
    if (loading) go();
    else if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 4000 });
    else setTimeout(go, 1500);
  }

  window.BKK_BUS3D = {
    mount: mount,
    setVisible: setVisible,
    selectRoute: function (code) {
      var R = typeof code === "number" ? groups[code] : groups.filter(function (r) { return r.main === code || r.old === code || r.badge === code; })[0];
      if (R) selectRoute(R, true);
      return !!R;
    },
    debug: function () {
      var now = bkkNow();
      return {
        loaded: !!model, error: lastError, visible: visible, buildMs: model && model.buildMs,
        routes: routes.length, trips: trips.length, stops: stops ? stops.n : 0, shapes: shapes.length,
        listed: model ? model.list.length : 0, rendered: model ? model.rendered.length / 5 : 0, running: model ? countRunning(now, null) : 0,
        models: model ? model.fleets.map(function (f) { return f.n; }) : null, billboards: model ? model.bb.n : 0,
        zoom: map && map.getZoom(), time: hms(now.sec), day: D ? dayLabel(now) : null, selRoute: selRoute && selRoute.main, routeOnly: routeOnly, follow: follow
      };
    },
    internals: function () { return { model: model, routes: routes, groups: groups, trips: trips, stops: stops, busState: busState, pick: pick, enumerate: enumerate, arrivals: arrivals }; }
  };

  (function register() {
    var H0 = window.BKK_3D;
    if (!H0) return;
    H0.register({
      id: MOD_ID,
      get group() { return group; },
      pick: pick,
      click: click,
      hover: hover,
      clear: function () { var c = $("#busCard"); if (c && c.classList.contains("open")) closeCard(); },
      frame: frame,
      theme: function (name) {
        if (model) model.mat.color.set(TONE[name] || TONE.dark);
        if (map && map.getLayer("bus3d-stops")) {
          var sc = STOP_COL[name] || STOP_COL.dark;
          map.setPaintProperty("bus3d-stops", "circle-color", sc[0]);
          map.setPaintProperty("bus3d-stops", "circle-stroke-color", sc[1]);
        }
      },
      rendererReady: function () {}
    });
  })();
})();
