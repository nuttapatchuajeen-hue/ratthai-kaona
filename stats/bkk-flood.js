/**
 * bkk-flood.js
 * ชั้น "ฝน & น้ำท่วม" ของ bkk-city.html — เรดาร์ฝนย้อนหลัง 2 ชม. + ระดับน้ำ/ฝนรายสถานีทั่วประเทศ + จุดเตือนน้ำท่วม Google Flood Hub
 *
 * ข้อมูล
 *   - เรดาร์ฝน: RainViewer (api.rainviewer.com/public/weather-maps.json) — ภาพโปร่งใสทุก 10 นาที ย้อนหลัง ~2 ชม. ใช้ฟรี ต้องให้เครดิต
 *     ⚠ ไทล์ฟรีสูงสุดซูม 7 (MapLibre ขยายต่อเอง) → ดูภาพรวมกลุ่มฝน ไม่ใช่รายถนน
 *     เรดาร์ สนน. กทม. (ละเอียดกว่า) เป็นแค่ปุ่มลิงก์ — เซิร์ฟเวอร์เขากันการดึงภาพข้ามเว็บ จึงไม่ดึงมาวางทับ
 *   - ระดับน้ำ + ฝน 24 ชม.: คลังข้อมูลน้ำแห่งชาติ thaiwater.net (สสน.) ผ่าน /api/thaiwater (ต้นทางไม่เปิด CORS)
 *   - Google Flood Hub: /api/floodhub (ต้องมีคีย์ Flood Forecasting API บนเซิร์ฟเวอร์) · ไม่มีคีย์ = แสดงแค่ปุ่มเปิด Flood Hub ตรงพิกัดเดียวกัน
 *
 * วาดด้วยชั้น MapLibre ธรรมดา (raster + circle) ไม่ใช้ฉาก three.js กลาง
 */
(function () {
  "use strict";

  var LS_KEY = "bkk-flood-on";
  var LS_SUB = "bkk-flood-sub";
  var LS_MIN = "bkk-flood-min";
  var REMOTE = "https://ratthai-kaona.vercel.app";
  var RV_META = "https://api.rainviewer.com/public/weather-maps.json";
  var RV_ZMAX = 7;                       // ไทล์ฟรีของ RainViewer ถึงซูม 7
  var LS_RMODE = "bkk-flood-rmode";      // "live" เรดาร์สด 2 ชม. · "days" ฝนรายวันย้อนหลัง 90 วัน
  var IMERG = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/IMERG_Precipitation_Rate/default/";
  var DAYS = 90, DAY_OP = 0.78;
  // แถบสีของภาพ IMERG (colormap GPM_Precipitation_Rate ของ GIBS, มม./ชม.) แปลงเป็นประมาณ มม./วัน (×24)
  var DAY_LEG = [["#00764e", "2"], ["#1eb200", "9"], ["#aedf00", "21"], ["#f5e000", "34"], ["#ffa00c", "54"], ["#ff6522", "85"], ["#f30000", "215"], ["#900000", "540"]];
  var FLOODHUB = "https://sites.research.google/floods/l/";
  var BMA_RADAR = "https://weather.bangkok.go.th/radar/RadarHighResolution.aspx";
  var THAIWATER = "https://www.thaiwater.net/water/wl";
  var HOME = { center: [100.55, 13.85], zoom: 8.6, pitch: 0, bearing: 0 };

  // สีตามเกณฑ์ของ thaiwater (1 น้ำน้อยวิกฤติ … 5 ล้นตลิ่ง)
  var WL = {
    1: ["#990000", "น้ำน้อยวิกฤติ", "≤10%"], 2: ["#FFC000", "น้ำน้อย", "10–30%"], 3: ["#00B050", "ปกติ", "30–70%"],
    4: ["#003CFA", "น้ำมาก", "70–100%"], 5: ["#FF0000", "ล้นตลิ่ง", ">100%"]
  };
  // ฝน 24 ชม. ตามเกณฑ์กรมอุตุนิยมวิทยา
  var RAIN = [[0.1, "#9bd3ff", "เล็กน้อย", "0.1–10"], [10.1, "#3b9cf5", "ปานกลาง", "10.1–35"], [35.1, "#1b5fd1", "หนัก", "35.1–90"], [90.1, "#7b2ff2", "หนักมาก", ">90"]];
  // ระดับความรุนแรงของ Flood Hub (สีใกล้เคียงหน้า Flood Hub)
  var SEV = {
    EXTREME: ["#8b0015", "รุนแรงมาก", 4], SEVERE: ["#e8412c", "รุนแรง", 3], ABOVE_NORMAL: ["#f59f0b", "สูงกว่าปกติ", 2],
    NO_FLOODING: ["#2f9e44", "ไม่มีน้ำท่วม", 1], UNKNOWN: ["#8a94a6", "ไม่ทราบ", 0]
  };
  var TREND = { RISE: "แนวโน้มสูงขึ้น", FALL: "แนวโน้มลดลง", NO_CHANGE: "ทรงตัว" };

  var map = null, visible = false, uiBuilt = false, handlersBound = false;
  var sub = { radar: true, wl: true, rain: false, hub: true };
  var rv = { frames: [], host: "", idx: 0, playing: false, timer: null, at: 0, err: null };
  var rmode = "live";
  var dy = { dates: [], idx: 0, at: 0, err: null, avail: {}, ok: {}, buf: 0, shown: -1, token: 0, loading: null };
  var tw = { data: null, at: 0, err: null, busy: false };
  var hub = { data: null, at: 0, err: null, busy: false, enabled: null };
  var refreshTimer = null, popup = null;

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function fmt(n, d) { return n == null ? "–" : Number(n).toLocaleString("th-TH", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function hhmm(t) { var d = new Date(t); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
  function ago(t) {
    var m = Math.round((Date.now() - t) / 60000);
    return m < 1 ? "เมื่อสักครู่" : m < 60 ? m + " นาทีที่แล้ว" : Math.round(m / 60) + " ชม.ที่แล้ว";
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
    add("external-link", '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>');
    add("cloud-rain", '<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>');
  }

  /* ================================================================ ดึงข้อมูล */
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
      }).catch(next);
    };
    return next();
  }

  function loadRadar() {
    return fetch(RV_META, { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (j) {
      var past = (j.radar && j.radar.past) || [], cast = (j.radar && j.radar.nowcast) || [];
      rv.host = j.host || "https://tilecache.rainviewer.com";
      rv.frames = past.map(function (f) { return { t: f.time * 1000, p: f.path, cast: false }; })
        .concat(cast.map(function (f) { return { t: f.time * 1000, p: f.path, cast: true }; }));
      rv.idx = past.length ? past.length - 1 : 0;       // เริ่มที่ภาพล่าสุดที่เป็นของจริง (ไม่ใช่คาดการณ์)
      rv.at = Date.now(); rv.err = null;
      if (rmode === "live") addRadarLayers();
      renderPanel();
    }).catch(function (e) { rv.err = String(e.message || e); renderPanel(); });
  }

  function loadThaiwater() {
    if (tw.busy) return;
    tw.busy = true;
    getJSON(apiList("thaiwater")).then(function (j) {
      tw.data = j; tw.at = j.now || Date.now(); tw.err = null;
      setGeo("flood-wl", wlGeo()); setGeo("flood-rain", rainGeo());
    }).catch(function (e) { tw.err = String(e.message || e); })
      .then(function () { tw.busy = false; renderPanel(); });
  }

  function loadHub() {
    if (hub.busy) return;
    hub.busy = true;
    getJSON(apiList("floodhub")).then(function (j) {
      hub.enabled = !!j.enabled;
      if (j.enabled && j.g) { hub.data = j; hub.at = j.now || Date.now(); hub.err = null; setGeo("flood-hub", hubGeo()); }
      else if (j.error) hub.err = j.error;
    }).catch(function (e) { hub.err = String(e.message || e); if (hub.enabled == null) hub.enabled = false; })
      .then(function () { hub.busy = false; renderPanel(); });
  }

  function refreshAll() {
    if (rmode === "days") loadDays().then(function () { if (rmode === "days" && dy.shown < 0 && !map.getSource(dayId(0))) addRadarLayers(); });
    loadRadar();
    loadThaiwater();
    loadHub();
  }

  /* ================================================================ GeoJSON */
  function pt(lon, lat, props) { return { type: "Feature", geometry: { type: "Point", coordinates: [lon, lat] }, properties: props }; }
  function wlGeo() {
    var f = [];
    ((tw.data && tw.data.wl) || []).forEach(function (r, i) {
      var lv = r[11] || 0;
      if (!WL[lv]) return;
      f.push(pt(r[1], r[0], { i: i, lv: lv, c: WL[lv][0] }));
    });
    return { type: "FeatureCollection", features: f };
  }
  function rainGeo() {
    var f = [];
    ((tw.data && tw.data.rain) || []).forEach(function (r, i) {
      var mm = r[6], c = RAIN[0][1];
      RAIN.forEach(function (b) { if (mm >= b[0]) c = b[1]; });
      f.push(pt(r[1], r[0], { i: i, mm: mm, c: c }));
    });
    return { type: "FeatureCollection", features: f };
  }
  function hubGeo() {
    var f = [];
    ((hub.data && hub.data.g) || []).forEach(function (r, i) {
      var s = SEV[r[3]] || SEV.UNKNOWN;
      f.push(pt(r[2], r[1], { i: i, c: s[0], k: s[2] }));
    });
    return { type: "FeatureCollection", features: f };
  }
  function empty() { return { type: "FeatureCollection", features: [] }; }
  function setGeo(id, g) { var s = map && map.getSource(id); if (s) s.setData(g); }

  /* ================================================================ ชั้นบนแผนที่ */
  function beforeId() {
    if (map.getLayer("bkk-3d-world")) return "bkk-3d-world";
    if (map.getLayer("city-buildings-3d")) return "city-buildings-3d";
    return undefined;
  }
  function radarId(i) { return "flood-rv-" + i; }
  function dayId(i) { return "flood-day-" + i; }
  function removeRadarLayers() {
    if (!map) return;
    for (var i = 0; i < 40; i++) {
      if (map.getLayer(radarId(i))) map.removeLayer(radarId(i));
      if (map.getSource(radarId(i))) map.removeSource(radarId(i));
    }
    for (var k = 0; k < 2; k++) {
      if (map.getLayer(dayId(k))) map.removeLayer(dayId(k));
      if (map.getSource(dayId(k))) map.removeSource(dayId(k));
    }
  }
  function addRadarLayers() {
    if (!map || !map.getStyle()) return;
    removeRadarLayers();
    if (!visible || !sub.radar) return;
    if (rmode === "days") { addDayLayers(); return; }
    var bf = beforeId();
    rv.frames.forEach(function (f, i) {
      map.addSource(radarId(i), {
        type: "raster", tileSize: 256, maxzoom: RV_ZMAX,
        tiles: [rv.host + f.p + "/256/{z}/{x}/{y}/2/1_1.png"],
        attribution: '<a href="https://www.rainviewer.com/" target="_blank" rel="noopener">RainViewer</a>'
      });
      map.addLayer({
        id: radarId(i), type: "raster", source: radarId(i),
        paint: { "raster-opacity": i === rv.idx ? 0.72 : 0, "raster-fade-duration": 0, "raster-resampling": "linear" }
      }, bf);
    });
  }
  function showFrame(i) {
    if (!rv.frames.length) return;
    rv.idx = (i + rv.frames.length) % rv.frames.length;
    rv.frames.forEach(function (f, k) {
      if (map.getLayer(radarId(k))) map.setPaintProperty(radarId(k), "raster-opacity", k === rv.idx ? 0.72 : 0);
    });
    renderRadarTime();
  }
  function setPlaying(on) {
    rv.playing = !!on;
    clearTimeout(rv.timer);
    var step;
    if (rmode === "days") {
      // รอให้ภาพวันถัดไปโหลดเสร็จก่อนค่อยเดินต่อ — ไม่งั้นภาพกระพริบว่าง
      step = function () {
        if (!rv.playing || !visible || rmode !== "days" || !dy.dates.length) return;
        var next = (dy.idx + 1) % dy.dates.length;
        showDay(next).then(function () {
          if (rv.playing) rv.timer = setTimeout(step, next === dy.dates.length - 1 ? 1600 : 280);
        });
      };
    } else {
      step = function () {
        if (!rv.playing || !visible) return;
        var last = rv.idx === rv.frames.length - 1;
        showFrame(rv.idx + 1);
        rv.timer = setTimeout(step, last ? 700 : rv.idx === rv.frames.length - 1 ? 1600 : 650);
      };
    }
    if (rv.playing) rv.timer = setTimeout(step, 200);
    var b = $("#floodPlay");
    if (b) b.innerHTML = ico(rv.playing ? "pause" : "play");
  }

  /* ---------------- ฝนรายวันย้อนหลัง 90 วัน: NASA GPM IMERG ผ่าน GIBS (ไทล์โปร่งใส เปิด CORS ไม่ต้องใช้คีย์) ----------------
     ภาพรายวัน = อัตราฝนเฉลี่ยทั้งวัน (มม./ชม.) · ×24 ≈ มม./วัน · กริด 0.1° (~10 กม.) · ข้อมูลช้ากว่าความจริง ~1 วัน
     บางวันไม่มีภาพ (GIBS ตอบ 404) → ตรวจก่อนด้วยไทล์เดียวที่ครอบภาคกลาง แล้วค่อยสลับภาพ
     วาดด้วยสองชั้นสลับกัน (โหลดวันใหม่ในชั้นที่ซ่อนอยู่ เสร็จแล้วค่อยสลับ) ภาพจึงไม่ว่างระหว่างเปลี่ยนวัน */
  function dayUrl(d) { return IMERG + d + "/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png"; }
  function ymd(t) { return new Date(t).toISOString().slice(0, 10); }
  function probeDay(d) {
    if (!dy.avail[d]) dy.avail[d] = fetch(IMERG + d + "/GoogleMapsCompatible_Level6/5/14/24.png")
      .then(function (r) { return (dy.ok[d] = r.ok); }).catch(function () { return null; });   // null = เน็ตมีปัญหา ไม่ใช่ไม่มีข้อมูล
    return dy.avail[d];
  }
  function loadDays() {
    if (dy.dates.length && Date.now() - dy.at < 6 * 3600000) return Promise.resolve();
    if (dy.loading) return dy.loading;
    // หาวันล่าสุดที่มีภาพ (ปกติคือเมื่อวานตามเวลา UTC — ภาพวันนี้ยังไม่ครบวัน) ย้อนไปไม่เกิน 6 วัน
    var k = 1, t0 = Date.now();
    var tryNext = function () {
      if (k > 6) throw new Error("ไม่พบภาพฝนล่าสุดจาก NASA");
      var d = ymd(t0 - (k++) * 86400000);
      return probeDay(d).then(function (ok) { return ok ? d : tryNext(); });
    };
    dy.loading = tryNext().then(function (latest) {
      var end = Date.parse(latest + "T00:00:00Z");
      dy.dates = [];
      for (var i = DAYS - 1; i >= 0; i--) dy.dates.push(ymd(end - i * 86400000));
      dy.idx = dy.dates.length - 1; dy.at = Date.now(); dy.err = null; dy.shown = -1;
    }).catch(function (e) { dy.err = String(e.message || e); })
      .then(function () { dy.loading = null; renderPanel(); });
    return dy.loading;
  }
  function addDayLayers() {
    if (!dy.dates.length) return;
    var bf = beforeId(), d = dy.dates[dy.idx];
    for (var k = 0; k < 2; k++) {
      map.addSource(dayId(k), {
        type: "raster", tileSize: 256, maxzoom: 6, tiles: [dayUrl(d)],
        attribution: '<a href="https://gpm.nasa.gov/data/imerg" target="_blank" rel="noopener">NASA GPM IMERG</a> via <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noopener">GIBS</a>'
      });
      map.addLayer({ id: dayId(k), type: "raster", source: dayId(k), paint: { "raster-opacity": k === 0 ? DAY_OP : 0, "raster-fade-duration": 0, "raster-resampling": "nearest" } }, bf);
    }
    dy.buf = 0; dy.shown = dy.idx;
    probeDay(d).then(function (ok) { if (ok === false && dy.dates[dy.idx] === d) { setDayOpacity(-1); renderRadarTime(); } });
  }
  function setDayOpacity(which) {
    for (var k = 0; k < 2; k++) if (map.getLayer(dayId(k))) map.setPaintProperty(dayId(k), "raster-opacity", k === which ? DAY_OP : 0);
  }
  function showDay(i) {
    if (!dy.dates.length) return Promise.resolve();
    dy.idx = Math.max(0, Math.min(dy.dates.length - 1, i));
    renderRadarTime();
    var d = dy.dates[dy.idx], tok = ++dy.token;
    return probeDay(d).then(function (ok) {
      if (tok !== dy.token || !map.getSource(dayId(0))) return;
      renderRadarTime();
      if (ok === false) { setDayOpacity(-1); dy.shown = -1; return; }
      if (dy.shown === dy.idx) { setDayOpacity(dy.buf); return; }
      var nb = 1 - dy.buf, src = map.getSource(dayId(nb));
      src.setTiles([dayUrl(d)]);
      return new Promise(function (done) {
        var t = Date.now();
        var poll = function () {
          if (tok !== dy.token) return done();
          if ((Date.now() - t > 80 && map.isSourceLoaded(dayId(nb))) || Date.now() - t > 3000) {
            setDayOpacity(nb); dy.buf = nb; dy.shown = dy.idx;
            return done();
          }
          map.triggerRepaint();
          setTimeout(poll, 60);
        };
        setTimeout(poll, 60);
      });
    });
  }
  function setRainMode(m) {
    if (m === rmode) return;
    setPlaying(false);
    rmode = m;
    lsSet(LS_RMODE, m);
    removeRadarLayers();
    if (m === "days") {
      // ภาพหยาบ ~10 กม. — ดูระดับภาค/ประเทศจึงเห็นกลุ่มฝนชัด
      if (map.getZoom() > 8) map.easeTo({ zoom: 6.4, duration: 1200 });
      loadDays().then(function () { if (rmode === "days") addRadarLayers(); });
    } else {
      addRadarLayers();
      if (!rv.frames.length) loadRadar();
    }
    renderPanel();
  }

  function addPointLayers() {
    if (!map || !map.getStyle()) return;
    var src = function (id, data) { if (!map.getSource(id)) map.addSource(id, { type: "geojson", data: data }); };
    src("flood-rain", tw.data ? rainGeo() : empty());
    src("flood-wl", tw.data ? wlGeo() : empty());
    src("flood-hub", hub.data ? hubGeo() : empty());
    var stroke = "rgba(255,255,255,.9)";
    if (!map.getLayer("flood-rain")) map.addLayer({
      id: "flood-rain", type: "circle", source: "flood-rain",
      paint: {
        "circle-color": ["get", "c"], "circle-opacity": 0.85, "circle-stroke-color": stroke, "circle-stroke-width": 0.8,
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, ["interpolate", ["linear"], ["get", "mm"], 0, 1.8, 90, 5], 12, ["interpolate", ["linear"], ["get", "mm"], 0, 4, 90, 11]]
      }
    });
    if (!map.getLayer("flood-wl")) map.addLayer({
      id: "flood-wl", type: "circle", source: "flood-wl",
      layout: { "circle-sort-key": ["get", "lv"] },
      paint: {
        "circle-color": ["get", "c"], "circle-stroke-color": stroke, "circle-stroke-width": 1.2,
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 3, 10, 5.5, 14, 8]
      }
    });
    if (!map.getLayer("flood-hub")) map.addLayer({
      id: "flood-hub", type: "circle", source: "flood-hub",
      layout: { "circle-sort-key": ["get", "k"] },
      paint: {
        "circle-color": ["get", "c"], "circle-stroke-color": "#ffffff", "circle-stroke-width": 2,
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 4.5, 10, 7.5, 14, 10]
      }
    });
    syncLayerVis();
  }
  function removePointLayers() {
    ["flood-hub", "flood-wl", "flood-rain"].forEach(function (id) {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });
  }
  function syncLayerVis() {
    var set = function (id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); };
    set("flood-wl", visible && sub.wl);
    set("flood-rain", visible && sub.rain);
    set("flood-hub", visible && sub.hub && hub.enabled);
  }

  /* ================================================================ การ์ดสถานี */
  function popHTML(title, rows, foot) {
    return '<div class="fl-pop"><b class="fl-pop-t">' + title + '</b>' +
      rows.filter(Boolean).map(function (r) { return '<div class="fl-row"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join("") +
      (foot ? '<div class="fl-pop-f">' + foot + '</div>' : "") + '</div>';
  }
  function chip(c, t) { return '<i class="fl-chip" style="background:' + c + '"></i>' + t; }
  function wlCard(r) {
    var lv = WL[r[11]] || ["#888", "–"], d = r[7] != null && r[8] != null ? r[7] - r[8] : null;
    var toBank = r[7] != null && r[9] != null ? r[7] - r[9] : null;
    return popHTML(esc(r[2]) + (r[3] ? ' <small>' + esc(r[3]) + '</small>' : ""), [
      ["สถานการณ์", chip(lv[0], lv[1] + (r[10] != null ? " · " + fmt(r[10], 0) + "% ของตลิ่ง" : ""))],
      ["ระดับน้ำ", fmt(r[7], 2) + " ม.รทก." + (d != null ? ' <small>(' + (d > 0 ? "▲ +" : d < 0 ? "▼ " : "") + fmt(d, 2) + ")</small>" : "")],
      r[9] != null && ["ระดับตลิ่ง", fmt(r[9], 2) + " ม.รทก."],
      toBank != null && [toBank >= 0 ? "สูงกว่าตลิ่ง" : "ต่ำกว่าตลิ่ง", fmt(Math.abs(toBank), 2) + " ม."],
      ["ที่ตั้ง", esc([r[4], r[5]].filter(Boolean).join(" · "))],
      ["เวลาวัด", esc(r[6]) + " น."]
    ], "ข้อมูล: " + esc(r[12] || "") + " ผ่านคลังข้อมูลน้ำแห่งชาติ (thaiwater.net)");
  }
  function rainCard(r) {
    var c = RAIN[0];
    RAIN.forEach(function (b) { if (r[6] >= b[0]) c = b; });
    return popHTML(ico("cloud-rain") + " " + esc(r[2]), [
      ["ฝนสะสม 24 ชม.", chip(c[1], fmt(r[6], 1) + " มม. · ฝน" + c[2])],
      ["ที่ตั้ง", esc([r[3], r[4]].filter(Boolean).join(" · "))],
      ["ถึงเวลา", esc(r[5]) + " น."]
    ], "ข้อมูล: " + esc(r[7] || "") + " ผ่านคลังข้อมูลน้ำแห่งชาติ (thaiwater.net)");
  }
  function hubCard(r) {
    var s = SEV[r[3]] || SEV.UNKNOWN;
    return popHTML(esc(r[6] || "จุดวัดน้ำ Flood Hub") + (r[7] ? ' <small>' + esc(r[7]) + '</small>' : ""), [
      ["คาดการณ์", chip(s[0], s[1])],
      r[4] && TREND[r[4]] && ["แนวโน้ม", TREND[r[4]]],
      r[5] && ["ออกประกาศ", new Date(r[5]).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })],
      ["รหัสจุด", '<small>' + esc(r[0]) + (r[8] ? "" : " · ยังไม่ผ่านการตรวจคุณภาพ") + '</small>']
    ], '<a href="' + FLOODHUB + r[1] + "/" + r[2] + '/11" target="_blank" rel="noopener">ดูกราฟคาดการณ์บน Google Flood Hub ' + ico("external-link") + '</a>');
  }
  function openPopup(lngLat, html) {
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ closeButton: true, maxWidth: "300px", className: "fl-popup", offset: 10 })
      .setLngLat(lngLat).setHTML(html).addTo(map);
  }
  function bindHandlers() {
    if (handlersBound) return;
    handlersBound = true;
    // ลำดับสำคัญ: Flood Hub > ระดับน้ำ > ฝน — กดจุดที่ซ้อนกันเปิดการ์ดเดียว
    var CARD = {
      "flood-hub": function (i) { return hub.data && hub.data.g[i] ? hubCard(hub.data.g[i]) : null; },
      "flood-wl": function (i) { return tw.data && tw.data.wl[i] ? wlCard(tw.data.wl[i]) : null; },
      "flood-rain": function (i) { return tw.data && tw.data.rain[i] ? rainCard(tw.data.rain[i]) : null; }
    };
    var hit = function (pt) {
      if (!visible) return null;
      var ids = Object.keys(CARD).filter(function (id) { return map.getLayer(id) && map.getLayoutProperty(id, "visibility") !== "none"; });
      if (!ids.length) return null;
      var box = [[pt.x - 4, pt.y - 4], [pt.x + 4, pt.y + 4]], fs = map.queryRenderedFeatures(box, { layers: ids });
      for (var k = 0; k < ids.length; k++) {
        for (var j = 0; j < fs.length; j++) if (fs[j].layer.id === ids[k]) return fs[j];
      }
      return null;
    };
    map.on("click", function (e) {
      var f = hit(e.point);
      if (!f) return;
      var html = CARD[f.layer.id](f.properties.i);
      if (html) openPopup(f.geometry.coordinates.slice(), html);
    });
    var hov = false;
    map.on("mousemove", function (e) {
      var h = !!hit(e.point);
      if (h !== hov) { hov = h; map.getCanvas().style.cursor = h ? "pointer" : ""; }
    });
  }

  /* ================================================================ แผงควบคุม */
  var CSS = [
    "#floodPanel{position:absolute;z-index:43;right:14px;bottom:40px;width:318px;max-width:calc(100% - 28px);max-height:calc(100% - 120px);overflow:auto;display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.5}",
    "#floodPanel.open{display:block;animation:elvIn .22s ease}",
    ".fl-ph{display:flex;align-items:center;gap:8px;padding:11px 12px 6px 14px;font-weight:800;font-size:13.5px;position:sticky;top:0;background:inherit}",
    ".fl-ph .fl-ib{margin-left:auto}.fl-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".fl-ib .mdico{width:13px;height:13px}",
    "#floodPanel.min .fl-body{display:none}",
    ".fl-body{padding:0 14px 12px}",
    ".fl-sec{border-top:1px solid var(--card-border);padding:9px 0 7px}",
    ".fl-sec>label{display:flex;align-items:center;gap:8px;font-weight:700;cursor:pointer}.fl-sec>label input{accent-color:var(--accent);margin:0}",
    ".fl-sec>label small{margin-left:auto;font-weight:500;opacity:.65;font-size:11px}",
    ".fl-note{font-size:11px;opacity:.72;margin:3px 0 0 22px}",
    ".fl-leg{display:flex;flex-wrap:wrap;gap:4px 10px;margin:5px 0 0 22px;font-size:11px}",
    ".fl-leg span{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}",
    ".fl-chip{display:inline-block;width:10px;height:10px;border-radius:50%;box-shadow:0 0 0 1.5px rgba(255,255,255,.85);flex:none;margin-right:4px;vertical-align:-1px}",
    ".fl-rv{display:flex;align-items:center;gap:8px;margin:6px 0 0 22px}.fl-rv input{flex:1;accent-color:var(--accent)}",
    "#floodTime{font-variant-numeric:tabular-nums;font-weight:700;font-size:11.5px;white-space:nowrap}",
    ".fl-rvbar{display:flex;height:4px;border-radius:2px;margin:3px 0 0 54px;overflow:hidden;gap:1px}.fl-rvbar i{flex:1;background:rgba(127,127,127,.25)}.fl-rvbar i.cast{background:rgba(245,159,11,.5)}.fl-rvbar i.on{background:var(--accent)}",
    ".fl-seg{display:flex;gap:0;margin:7px 0 0 22px;border:1px solid var(--card-border);border-radius:9px;overflow:hidden;width:max-content}",
    ".fl-seg button{border:0;background:none;color:var(--text-muted);font:inherit;font-size:11.5px;padding:4px 11px;cursor:pointer}.fl-seg button.on{background:var(--accent-soft);color:var(--text-main);font-weight:700}",
    ".fl-rvbar.days{gap:0}.fl-rvbar.days i{border-right:1px solid transparent}.fl-rvbar i.miss{background:rgba(239,68,68,.45)}",
    ".fl-rvends{display:flex;justify-content:space-between;margin:2px 0 0 54px;font-size:10px;opacity:.6}",
    ".fl-grad{height:8px;border-radius:4px;margin:8px 0 0 22px}",
    ".fl-gradl{display:flex;justify-content:space-between;margin:2px 0 0 22px;font-size:10px;opacity:.75;font-variant-numeric:tabular-nums}",
    ".fl-links{display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--card-border);padding-top:10px}",
    ".fl-link{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:10px;border:1px solid var(--card-border);background:rgba(127,127,127,.07);color:var(--text-main);font:inherit;font-size:12px;font-weight:600;text-decoration:none;cursor:pointer;text-align:left}",
    ".fl-link:hover{border-color:var(--accent);background:var(--accent-soft)}.fl-link small{display:block;font-weight:500;opacity:.65;font-size:10.5px}.fl-link .mdico:last-child{margin-left:auto;opacity:.6}",
    ".fl-src{margin:10px 0 0;font-size:10px;opacity:.6;line-height:1.5}",
    ".fl-warn{color:#f59f0b}",
    ".fl-popup .maplibregl-popup-content{background:var(--card-bg);color:var(--text-main);border:1px solid var(--card-border);border-radius:12px;padding:11px 13px 9px;box-shadow:0 10px 30px rgba(0,0,0,.3);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}",
    ".fl-popup .maplibregl-popup-tip{display:none}.fl-popup .maplibregl-popup-close-button{color:var(--text-muted);font-size:17px;right:4px;top:3px}",
    ".fl-pop{font-size:12px;line-height:1.5;min-width:210px}.fl-pop-t{display:block;font-size:13px;margin:0 16px 6px 0}.fl-pop-t small{font-weight:500;opacity:.65}",
    ".fl-row{display:flex;gap:10px;justify-content:space-between;padding:2px 0}.fl-row span{opacity:.7;white-space:nowrap}.fl-row b{text-align:right;font-weight:600}.fl-row small{opacity:.7;font-weight:500}",
    ".fl-pop-f{margin-top:6px;padding-top:6px;border-top:1px solid var(--card-border);font-size:10.5px;opacity:.75}.fl-pop-f a{color:var(--accent);font-weight:700;text-decoration:none}.fl-pop-f .mdico{width:11px;height:11px;vertical-align:-1px}",
    "@media (max-width:760px){#floodPanel{bottom:86px;right:14px;left:14px;width:auto;max-height:38vh}.fl-note{display:none}.fl-ph{padding-top:8px}}"
  ].join("");

  function thDay(d, yr) {
    return new Date(d + "T00:00:00Z").toLocaleDateString("th-TH", { day: "numeric", month: "short", year: yr ? "2-digit" : undefined, timeZone: "UTC" });
  }
  function renderRadarTime() {
    var t = $("#floodTime"), s = $("#floodSlider"), bar = $("#floodBar");
    if (rmode === "days") {
      var d = dy.dates[dy.idx];
      if (t) t.innerHTML = d ? thDay(d, true) + (dy.ok[d] === false ? ' <span class="fl-warn">ไม่มีภาพ</span>' : "") : "–";
      if (s) { s.max = Math.max(0, dy.dates.length - 1); s.value = dy.idx; }
      if (bar) Array.prototype.forEach.call(bar.children, function (el, k) {
        el.classList.toggle("on", k === dy.idx);
        el.classList.toggle("miss", dy.ok[dy.dates[k]] === false);
      });
      return;
    }
    var f = rv.frames[rv.idx];
    if (t) t.innerHTML = f ? hhmm(f.t) + " น." + (f.cast ? ' <span class="fl-warn">คาดการณ์</span>' : "") : "–";
    if (s) { s.max = Math.max(0, rv.frames.length - 1); s.value = rv.idx; }
    if (bar) Array.prototype.forEach.call(bar.children, function (el, k) { el.classList.toggle("on", k === rv.idx); });
  }
  function radarHTML() {
    var days = rmode === "days";
    var h = '<div class="fl-sec"><label><input type="checkbox" data-s="radar"' + (sub.radar ? " checked" : "") + '>' + ico("cloud-rain") + (days ? " ฝนรายวันจากดาวเทียม" : " เรดาร์ฝน") + '<small>' +
      (days ? (dy.err ? '<span class="fl-warn">โหลดไม่สำเร็จ</span>' : dy.dates.length ? "ย้อนหลัง " + dy.dates.length + " วัน" : "กำลังโหลด…")
        : (rv.err ? '<span class="fl-warn">โหลดไม่สำเร็จ</span>' : rv.frames.length ? "ทุก 10 นาที" : "กำลังโหลด…")) + '</small></label>';
    if (!sub.radar) return h + '</div>';
    h += '<div class="fl-seg" role="tablist"><button type="button" data-rm="live" class="' + (days ? "" : "on") + '">สด 2 ชม.</button>' +
      '<button type="button" data-rm="days" class="' + (days ? "on" : "") + '">ย้อนหลัง ' + DAYS + ' วัน</button></div>';
    var n = days ? dy.dates.length : rv.frames.length;
    if (n) {
      h += '<div class="fl-rv"><button type="button" class="fl-ib" id="floodPlay" title="เล่น/หยุด ภาพย้อนหลัง">' + ico(rv.playing ? "pause" : "play") + '</button>' +
        '<input type="range" id="floodSlider" min="0" step="1" aria-label="' + (days ? "วันที่ของภาพฝน" : "เวลาภาพเรดาร์") + '"><span id="floodTime"></span></div>' +
        '<div class="fl-rvbar' + (days ? " days" : "") + '" id="floodBar">' + (days ? dy.dates.map(function () { return "<i></i>"; }) :
          rv.frames.map(function (f) { return '<i' + (f.cast ? ' class="cast"' : "") + '></i>'; })).join("") + '</div>';
    }
    if (days) {
      if (n) h += '<div class="fl-rvends"><span>' + thDay(dy.dates[0]) + '</span><span>' + thDay(dy.dates[n - 1], true) + '</span></div>';
      h += '<div class="fl-grad" style="background:linear-gradient(90deg,' + DAY_LEG.map(function (x) { return x[0]; }).join(",") + ')"></div>' +
        '<div class="fl-gradl">' + DAY_LEG.map(function (x) { return "<span>" + x[1] + "</span>"; }).join("") + '</div>' +
        '<p class="fl-note">ปริมาณฝนประมาณ มม./วัน จากดาวเทียม NASA GPM (IMERG) · ช่องละ ~10 กม. · ช้ากว่าความจริง ~1 วัน · กด ▶ ดูฝนเคลื่อนทั้งฤดู</p>';
    } else {
      h += '<p class="fl-note">ภาพรวมกลุ่มฝนย้อนหลัง ~2 ชม. (ความละเอียดประมาณระดับอำเภอ) · ดูรายเขตละเอียดกว่าที่เรดาร์ สนน. ด้านล่าง</p>';
    }
    return h + '</div>';
  }
  function renderPanel() {
    var p = $("#floodPanel");
    if (!p || !visible) return;
    var wl = (tw.data && tw.data.wl) || [], rain = (tw.data && tw.data.rain) || [], g = (hub.data && hub.data.g) || [];
    var cnt = function (lv) { return wl.filter(function (r) { return r[11] === lv; }).length; };
    var body = p.querySelector(".fl-body");
    var sevCount = function (k) { return g.filter(function (r) { return r[3] === k; }).length; };

    var h = radarHTML();
    // ระดับน้ำ
    h += '<div class="fl-sec"><label><input type="checkbox" data-s="wl"' + (sub.wl ? " checked" : "") + '>' + ico("waves") + ' ระดับน้ำ แม่น้ำ/คลอง<small>' +
      (tw.err && !tw.data ? '<span class="fl-warn">โหลดไม่สำเร็จ</span>' : tw.data ? fmt(wl.length) + " สถานี" : "กำลังโหลด…") + '</small></label>';
    if (sub.wl) {
      h += '<div class="fl-leg">' + [5, 4, 3, 2, 1].map(function (lv) {
        return '<span>' + chip(WL[lv][0], "") + WL[lv][1] + (tw.data ? " <b>" + cnt(lv) + "</b>" : "") + '</span>';
      }).join("") + '</div>';
      if (tw.data && cnt(5)) h += '<p class="fl-note"><b class="fl-warn">' + cnt(5) + ' สถานีน้ำล้นตลิ่ง</b> — กดจุดสีแดงดูรายละเอียด</p>';
    }
    h += '</div>';
    // ฝน 24 ชม.
    h += '<div class="fl-sec"><label><input type="checkbox" data-s="rain"' + (sub.rain ? " checked" : "") + '>' + ico("droplets") + ' ฝนสะสม 24 ชม.<small>' +
      (tw.data ? fmt(rain.length) + " สถานีมีฝน" : "") + '</small></label>';
    if (sub.rain) h += '<div class="fl-leg">' + RAIN.map(function (b) { return '<span>' + chip(b[1], "") + b[2] + ' <small>' + b[3] + '</small></span>'; }).join("") + '<span><small>มม.</small></span></div>';
    h += '</div>';
    // Flood Hub
    h += '<div class="fl-sec">';
    if (hub.enabled) {
      h += '<label><input type="checkbox" data-s="hub"' + (sub.hub ? " checked" : "") + '>' + ico("triangle-alert") + ' คาดการณ์น้ำท่วม Google Flood Hub<small>' + fmt(g.length) + " จุด</small></label>";
      if (sub.hub) h += '<div class="fl-leg">' + ["EXTREME", "SEVERE", "ABOVE_NORMAL", "NO_FLOODING"].map(function (k) {
        return '<span>' + chip(SEV[k][0], "") + SEV[k][1] + ' <b>' + sevCount(k) + '</b></span>';
      }).join("") + '</div>';
    } else {
      h += '<label style="cursor:default">' + ico("triangle-alert") + ' คาดการณ์น้ำท่วม Google Flood Hub<small>' + (hub.enabled == null ? "กำลังตรวจ…" : "ใช้ปุ่มด้านล่าง") + '</small></label>' +
        '<p class="fl-note">จุดเตือนบนแผนที่นี้จะแสดงเมื่อเว็บได้รับสิทธิ์ใช้ Flood Forecasting API จาก Google · ระหว่างนี้เปิดดูบน Flood Hub ได้ตรงพิกัดเดียวกัน</p>';
    }
    h += '</div>';
    // ลิงก์
    h += '<div class="fl-links">' +
      '<button type="button" class="fl-link" id="floodOpenHub">' + ico("map") + '<span>เปิด Google Flood Hub ตรงนี้<small>พื้นที่เสี่ยงน้ำท่วม + กราฟคาดการณ์ 7 วัน</small></span>' + ico("external-link") + '</button>' +
      '<a class="fl-link" href="' + BMA_RADAR + '" target="_blank" rel="noopener">' + ico("cloud-rain") + '<span>เรดาร์ฝน สนน. กทม. (ละเอียดสูง)<small>สำนักการระบายน้ำ อัปเดตทุก 5 นาที</small></span>' + ico("external-link") + '</a>' +
      '<a class="fl-link" href="' + THAIWATER + '" target="_blank" rel="noopener">' + ico("waves") + '<span>คลังข้อมูลน้ำแห่งชาติ<small>กราฟระดับน้ำย้อนหลังรายสถานี</small></span>' + ico("external-link") + '</a>' +
      '</div>';
    h += '<p class="fl-src">เรดาร์: RainViewer · ฝนรายวัน: NASA GPM IMERG (GIBS) · ระดับน้ำ/ฝน: คลังข้อมูลน้ำแห่งชาติ (สสน.) รวมจากหลายหน่วยงาน' +
      (tw.at ? " · อัปเดต " + ago(tw.at) : "") + (hub.enabled ? " · Flood Hub: Google" : "") +
      '<br>ใช้ประกอบการติดตามสถานการณ์เท่านั้น — ประกาศเตือนภัยทางการให้ดูจากกรมอุตุนิยมวิทยา กรมชลประทาน ปภ. และ กทม.</p>';
    body.innerHTML = h;
    renderRadarTime();
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    addIcons();
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnFloodToggle")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "menu-btn"; b.id = "btnFloodToggle";
      b.title = "เปิด/ปิดชั้นฝน & น้ำท่วม — เรดาร์ฝน ระดับน้ำรายสถานี และคาดการณ์น้ำท่วม";
      b.innerHTML = '<span>' + ico("cloud-rain") + '</span><span class="label-text"> ฝน & น้ำท่วม</span>';
      b.addEventListener("click", function () { setVisible(!visible); });
      menu.appendChild(b);
    }
    if (!$("#floodPanel")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var p = document.createElement("div");
      p.id = "floodPanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "ฝนและน้ำท่วม");
      p.innerHTML = '<div class="fl-ph">' + ico("cloud-rain") + ' ฝน & น้ำท่วม' +
        '<button type="button" class="fl-ib" data-a="min" title="ย่อ/ขยาย">' + ico("minus") + '</button>' +
        '<button type="button" class="fl-ib" style="margin-left:0" data-a="close" title="ปิดชั้นนี้">×</button></div><div class="fl-body"></div>';
      if (lsGet(LS_MIN) === "1") p.classList.add("min");
      stage.appendChild(p);
      p.addEventListener("click", function (e) {
        var a = e.target.closest("[data-a]");
        if (a && a.dataset.a === "close") { setVisible(false); return; }
        if (a && a.dataset.a === "min") { var m = !p.classList.contains("min"); p.classList.toggle("min", m); lsSet(LS_MIN, m ? "1" : "0"); return; }
        if (e.target.closest("#floodPlay")) { setPlaying(!rv.playing); return; }
        var rm = e.target.closest("[data-rm]");
        if (rm) { setRainMode(rm.dataset.rm); return; }
        if (e.target.closest("#floodOpenHub")) {
          var c = map.getCenter();
          // Google Maps ใช้ไทล์ 256 px — ซูมมากกว่า MapLibre (512 px) อยู่ 1 ขั้น
          window.open(FLOODHUB + c.lat.toFixed(5) + "/" + c.lng.toFixed(5) + "/" + Math.max(5, Math.min(16, map.getZoom() + 1)).toFixed(2), "_blank", "noopener");
        }
      });
      p.addEventListener("input", function (e) {
        if (e.target.id === "floodSlider") { setPlaying(false); if (rmode === "days") showDay(+e.target.value); else showFrame(+e.target.value); }
      });
      p.addEventListener("change", function (e) {
        var k = e.target.dataset && e.target.dataset.s;
        if (!k) return;
        sub[k] = e.target.checked;
        lsSet(LS_SUB, JSON.stringify(sub));
        if (k === "radar") {
          if (!sub.radar) setPlaying(false);
          addRadarLayers();
          if (sub.radar && rmode === "days") loadDays().then(function () { if (rmode === "days" && !map.getSource(dayId(0))) addRadarLayers(); });
          else if (sub.radar && !rv.frames.length) loadRadar();
        }
        syncLayerVis();
        renderPanel();
      });
    }
    syncButtons();
  }
  function syncButtons() {
    var b = $("#btnFloodToggle"), p = $("#floodPanel");
    if (b) b.classList.toggle("active", visible);
    if (p) p.classList.toggle("open", visible);
  }

  function setVisible(v) {
    visible = !!v;
    lsSet(LS_KEY, visible ? "1" : "0");
    syncButtons();
    clearInterval(refreshTimer);
    if (!visible) {
      setPlaying(false);
      if (popup) { popup.remove(); popup = null; }
      removeRadarLayers();
      syncLayerVis();
      return;
    }
    addPointLayers();
    bindHandlers();
    renderPanel();
    // ข้อมูลเก่าเกิน 10 นาทีค่อยดึงใหม่ · เปิดค้างไว้ก็ดึงใหม่ทุก 10 นาที
    if (rmode === "days") loadDays().then(function () { if (visible && rmode === "days") addRadarLayers(); });
    else if (Date.now() - rv.at > 600000) loadRadar(); else addRadarLayers();
    if (Date.now() - tw.at > 600000) loadThaiwater();
    if (hub.enabled == null || (hub.enabled && Date.now() - hub.at > 900000)) loadHub();
    refreshTimer = setInterval(function () { if (!document.hidden) refreshAll(); }, 600000);
    var c = map.getCenter(), z = map.getZoom();
    if (z > 11.5 || c.lng < 99.5 || c.lng > 101.8 || c.lat < 12.8 || c.lat > 14.9) map.flyTo(Object.assign({ duration: 1600 }, HOME));
  }

  /* ================================================================ mount — เรียกซ้ำทุกครั้งที่เปลี่ยนสไตล์แผนที่ */
  function mount(m) {
    map = m;
    try { var s = JSON.parse(lsGet(LS_SUB) || "null"); if (s) Object.keys(sub).forEach(function (k) { if (typeof s[k] === "boolean") sub[k] = s[k]; }); } catch (e) { }
    if (lsGet(LS_RMODE) === "days") rmode = "days";
    buildUI();
    if (lsGet(LS_KEY) === "1" && !visible) { setVisible(true); return; }
    if (!visible) return;
    // สไตล์ใหม่ล้างชั้นเดิมทิ้งหมด → วางกลับ
    addPointLayers();
    addRadarLayers();
  }

  window.BKK_FLOOD = {
    mount: mount,
    setVisible: setVisible,
    debug: function () {
      return {
        visible: visible, sub: sub, radarFrames: rv.frames.length, radarIdx: rv.idx, radarErr: rv.err,
        rainMode: rmode, days: dy.dates.length, dayIdx: dy.idx, day: dy.dates[dy.idx], dayShown: dy.shown, dayErr: dy.err,
        dayMissing: Object.keys(dy.ok).filter(function (k) { return dy.ok[k] === false; }),
        wl: tw.data ? tw.data.wl.length : 0, rain: tw.data ? tw.data.rain.length : 0, twErr: tw.err,
        hubEnabled: hub.enabled, hub: hub.data ? hub.data.g.length : 0, hubErr: hub.err
      };
    }
  };
})();
