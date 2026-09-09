/* ============================================================================
   co2-map.js — เครื่องยนต์แผนที่ CO₂ ทั้งโลก "ไล่วัน" (NOAA CarbonTracker)

   ใช้ที่ stats/explore.html — แผง "CO₂ 1 ปีของโลก" ในศูนย์ข้อมูลโลก
   ทำเลียนแบบคลิป NASA "A Year in the Life of Earth's CO2" ซึ่งเป็นภาพแบน (2 มิติ)
   ฉายแบบ equirectangular เหมือนกัน แต่ระบายด้วยข้อมูลจริงแทนแบบจำลอง GEOS-5

   ต้องโหลด d3 (v7) และ topojson-client มาก่อน (หน้านี้โหลดไว้อยู่แล้ว)

   ข้อมูล: climate-data/co2-<ชั้น>-<ปี>.bin  = Uint8 [เฟรม][ละติจูด 90][ลองจิจูด 120]
           ppm จริง = min + ค่า × scale   (min/scale/วันที่ อยู่ในไฟล์ .json คู่กัน)
           แถวแรกของกริดคือขั้วโลกเหนือ · สร้างด้วย climate-data/build-co2-grid.mjs

   วิธีวาด: ตอนปรับขนาดจะคำนวณ "ตารางค้นหา" ไว้ครั้งเดียว — พิกเซลบนจอ 1 จุดผูกกับ
           ช่องกริด 4 ช่องพร้อมน้ำหนัก bilinear จากนั้นทุกเฟรมแค่ค้นตาราง จึงไล่วันได้ลื่น
           (แนวคิดเดียวกับ climate-map.js แต่ฉายคนละแบบและข้อมูลเป็น 8 บิตมีสเกลของตัวเอง)
   ========================================================================== */
window.Co2Year = (function () {
  'use strict';

  var DIR = 'climate-data/';
  var NODATA = 255;   // ไม่ได้ใช้จริง — CarbonTracker ให้ค่าครบทุกช่องทั้งโลก แต่กันไว้

  /* ---------- สเกลสีแบบเดียวกับแถบสีในคลิป NASA ----------
     น้ำเงินเข้ม (CO₂ น้อย) → ฟ้า → เขียว → เหลือง → ส้ม → แดง → ม่วงชมพู (CO₂ มาก)
     เป็นสเกลสายรุ้งซึ่งปกติเลี่ยงในกราฟสถิติ แต่ที่นี่จงใจใช้ให้ "อ่านคู่กับคลิปได้" */
  var HEX = ['#07103a', '#10307f', '#1163bd', '#0f9ec2', '#25b78d', '#5cc457',
             '#a9cd35', '#f0c419', '#f08b1e', '#e04b28', '#cf1f5c', '#e07ac8', '#f6d9ef'];
  var LUTN = 1024, LUT = new Uint32Array(LUTN), LUTC = new Array(LUTN);
  var lutLo = 0, lutHi = 1, lutBuilt = false;

  function buildColor(lo, hi) {
    if (lutBuilt && lo === lutLo && hi === lutHi) return;
    lutLo = lo; lutHi = hi; lutBuilt = true;
    var stops = HEX.map(function (_, i) { return lo + (hi - lo) * i / (HEX.length - 1); });
    var sc = d3.scaleLinear().domain(stops).range(HEX).clamp(true);
    for (var i = 0; i < LUTN; i++) {
      var c = d3.rgb(sc(lo + (hi - lo) * i / (LUTN - 1)));
      LUTC[i] = c.formatHex();
      LUT[i] = (255 << 24) | (c.b << 16) | (c.g << 8) | c.r;   // little-endian RGBA
    }
  }
  function ci(v) {
    var i = ((v - lutLo) / (lutHi - lutLo) * (LUTN - 1) + 0.5) | 0;
    return i < 0 ? 0 : (i > LUTN - 1 ? LUTN - 1 : i);
  }
  function colorOf(v) { return LUTC[ci(v)]; }
  function gradientCss(lo, hi) {
    var n = 24, parts = [];
    for (var i = 0; i < n; i++) {
      var v = lo + (hi - lo) * i / (n - 1);
      parts.push(colorOf(v) + ' ' + (i / (n - 1) * 100).toFixed(1) + '%');
    }
    return 'linear-gradient(90deg,' + parts.join(',') + ')';
  }

  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

  /* วันที่ ค.ศ. → ข้อความไทย (พ.ศ. เหมือนส่วนอื่นของหน้า) */
  var MON = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  function thaiDate(iso) {
    var p = String(iso).split('-');
    return (+p[2]) + ' ' + MON[(+p[1]) - 1] + ' ' + ((+p[0]) + 543);
  }
  function fmtPpm(v) { return v == null ? '—' : v.toFixed(1) + ' ppm'; }

  /* ---------- สไตล์ (ใส่ครั้งเดียวต่อหน้า) ---------- */
  var cssDone = false;
  function injectCss() {
    if (cssDone) return; cssDone = true;
    var css = [
      '.co2-shell{position:relative;width:100%;aspect-ratio:2/1;border-radius:14px;overflow:hidden;',
      '  background:#050a1c;border:1px solid var(--rule,#c8dae4);cursor:crosshair}',
      '.co2-shell canvas{position:absolute;inset:0;width:100%;height:100%;display:block}',
      '.co2-date{position:absolute;left:12px;bottom:10px;pointer-events:none;z-index:3;',
      '  font-family:"Archivo",system-ui,sans-serif;font-weight:800;line-height:1.05;letter-spacing:.02em;',
      '  color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.85);font-size:clamp(18px,3.2vw,34px)}',
      '.co2-date small{display:block;font-weight:600;font-size:.44em;letter-spacing:.06em;opacity:.85}',
      '.co2-badge{position:absolute;right:12px;top:10px;pointer-events:none;z-index:3;text-align:right;',
      '  font-size:clamp(10.5px,1.2vw,12.5px);line-height:1.4;color:#e9f4ff;',
      '  background:rgba(6,14,32,.55);border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:5px 10px;',
      '  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}',
      '.co2-badge b{font-family:"Archivo",system-ui;font-size:1.25em;display:block}',
      '.co2-tip{position:absolute;pointer-events:none;z-index:5;padding:6px 10px;border-radius:10px;',
      '  font-size:12.5px;line-height:1.45;color:#eaf5ff;white-space:nowrap;opacity:0;transition:opacity .12s;',
      '  background:rgba(6,14,32,.82);border:1px solid rgba(255,255,255,.2);',
      '  backdrop-filter:blur(10px);box-shadow:0 10px 30px -14px rgba(0,0,0,.9)}',
      '.co2-tip b{font-family:"Archivo",system-ui;font-size:14px}',
      '.co2-loading{position:absolute;inset:0;display:grid;place-items:center;z-index:9;text-align:center;',
      '  background:var(--paper-2,#f8fbfd);font-size:13.5px;color:var(--ink-2,#2c4356);padding:16px}',
      '.co2-loading .co2-spin{width:32px;height:32px;margin:0 auto 10px;border-radius:50%;',
      '  border:2px solid var(--rule,#c8dae4);border-top-color:var(--green,#0089a9);animation:co2spin 1s linear infinite}',
      '@keyframes co2spin{to{transform:rotate(360deg)}}',
      // คงสัดส่วน 2:1 ไว้ทุกขนาดจอ — แผนที่ equirectangular เต็มโลกมีสัดส่วนนี้พอดี
      // ถ้าบีบให้เตี้ยลงบนมือถือ ภาพจะยืดผิดรูปและเส้นชายฝั่งจะเลื่อนออกจากสี
      '@media (max-width:520px){.co2-shell{border-radius:10px}}'
    ].join('');
    var st = document.createElement('style');
    st.setAttribute('data-co2map', '1');
    st.textContent = css;
    document.head.appendChild(st);
  }

  function showLoading(host, msg) {
    injectCss();
    host.classList.add('co2-shell');
    var d = document.createElement('div');
    d.className = 'co2-loading';
    d.innerHTML = '<div><div class="co2-spin"></div>' + (msg || 'กำลังโหลดกริด CO₂ ทั้งโลก…') + '</div>';
    host.innerHTML = ''; host.appendChild(d);
  }
  function showError(host, e) {
    injectCss();
    host.classList.add('co2-shell');
    host.innerHTML = '<div class="co2-loading"><div>โหลดข้อมูล CO₂ ไม่สำเร็จ<br>' +
      '<span style="font-size:12px;opacity:.75">' + (e && e.message ? e.message : e) + '</span></div></div>';
  }

  /* ---------- โหลดข้อมูล (แคชแยกตามชั้น+ปี · โหลดเฉพาะชุดที่ผู้ใช้เปิดดูจริง) ---------- */
  var cache = {}, geoPromise = null;

  function loadGeo() {
    if (geoPromise) return geoPromise;
    geoPromise = fetch(DIR + 'countries-110m.json')
      .then(function (r) { if (!r.ok) throw new Error('geo ' + r.status); return r.json(); })
      .then(function (topo) {
        return {
          land: topojson.mesh(topo, topo.objects.countries, function (a, b) { return a === b; }),
          border: topojson.mesh(topo, topo.objects.countries, function (a, b) { return a !== b; })
        };
      });
    return geoPromise;
  }

  function load(layer, year) {
    var key = layer + '-' + year;
    if (cache[key]) return cache[key];
    var stem = DIR + 'co2-' + layer + '-' + year;
    cache[key] = Promise.all([
      fetch(stem + '.json').then(function (r) { if (!r.ok) throw new Error('meta ' + r.status); return r.json(); }),
      fetch(stem + '.bin').then(function (r) { if (!r.ok) throw new Error('grid ' + r.status); return r.arrayBuffer(); }),
      loadGeo()
    ]).then(function (res) { return prepare(res[0], new Uint8Array(res[1]), res[2], layer); });
    return cache[key];
  }

  /* ช่วงสีที่ใช้ระบาย — ตัดหางบน-ล่างข้างละ 0.5% ทิ้ง
     ถ้าใช้ min–max ดิบ ชั้นใกล้พื้นจะโดนจุดสุดโต่งไม่กี่ช่อง (เช่นแอ่งอากาศนิ่งกลางไซบีเรีย)
     ดึงสเกลจนทั้งแผนที่กลายเป็นสีเดียว */
  function robustDomain(data, min, scale) {
    var hist = new Float64Array(256), n = data.length;
    for (var i = 0; i < n; i++) hist[data[i]]++;
    var loCut = n * 0.005, hiCut = n * 0.005, acc = 0, lo = 0, hi = 255, j;
    for (j = 0; j < 256; j++) { acc += hist[j]; if (acc >= loCut) { lo = j; break; } }
    acc = 0;
    for (j = 255; j >= 0; j--) { acc += hist[j]; if (acc >= hiCut) { hi = j; break; } }
    if (hi <= lo) { lo = 0; hi = 255; }
    return [min + lo * scale, min + hi * scale];
  }

  function prepare(meta, data, geo, layer) {
    var dom = robustDomain(data, meta.min, meta.scale);
    return {
      layer: layer, meta: meta, data: data, geo: geo,
      nlat: meta.nlat, nlon: meta.nlon, cells: meta.nlat * meta.nlon,
      frames: meta.frames, dates: meta.dates, gMean: meta.globalMean,
      min: meta.min, scale: meta.scale, domain: dom,
      valueAt: function (frame, la, lo) {
        return this.min + this.data[frame * this.cells + la * this.nlon + lo] * this.scale;
      }
    };
  }

  /* ---------- สร้างแผนที่ 1 อันในกล่องที่ส่งมา ---------- */
  function create(host, D, opts) {
    injectCss();
    opts = opts || {};

    host.classList.add('co2-shell');
    host.innerHTML = '';

    var cvR = document.createElement('canvas'), cvV = document.createElement('canvas');
    host.appendChild(cvR); host.appendChild(cvV);
    var ctxR = cvR.getContext('2d'), ctxV = cvV.getContext('2d');

    var elDate = document.createElement('div'); elDate.className = 'co2-date';
    host.appendChild(elDate);
    var elBadge = document.createElement('div'); elBadge.className = 'co2-badge';
    host.appendChild(elBadge);
    var elTip = document.createElement('div'); elTip.className = 'co2-tip';
    host.appendChild(elTip);

    var rw = 0, rh = 0, img = null, buf32 = null, dpr = 1, projScale = 1, proj = null;
    var laA = null, loA = null, fxA = null, fyA = null;
    var pos = 0, mouse = null;

    function U(css) { return css * dpr / projScale; }

    function layout() {
      var r = host.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      // ชั้นสีจำกัดที่ 960 พิกเซล — กริดต้นทางหยาบ (3°×2°) ขยายเกินนี้ก็ไม่ได้รายละเอียดเพิ่ม
      rw = Math.max(160, Math.min(960, Math.round(r.width)));
      rh = Math.max(80, Math.round(rw * r.height / r.width));
      cvR.width = rw; cvR.height = rh;
      img = ctxR.createImageData(rw, rh);
      buf32 = new Uint32Array(img.data.buffer);

      cvV.width = Math.round(r.width * dpr);
      cvV.height = Math.round(r.height * dpr);
      projScale = r.width * dpr / rw;

      /* ฉายแบบ equirectangular เต็มกรอบ (แบบเดียวกับภาพในคลิป NASA)
         ตั้ง scale เองแทนการใช้ fitExtent เพื่อให้ 1 พิกเซลของเส้นชายฝั่งตรงกับ
         1 พิกเซลของชั้นสีพอดี — กรอบถูกบังคับเป็น 2:1 ด้วย CSS อยู่แล้ว
         (อย่าเปลี่ยนไปใช้ d3.geoTransform เอง: จะเสียการตัดเส้นที่เส้นแบ่งวันสากล
          แล้วฟิจิกับไซบีเรียจะลากเส้นขาวพาดขวางแผนที่ทั้งใบ) */
      proj = d3.geoEquirectangular().scale(rw / (2 * Math.PI)).translate([rw / 2, rh / 2]);
      buildLUT();
      drawVector();
      return true;
    }

    /* ผูกพิกเซลบนจอกับช่องกริด — equirectangular เป็นเชิงเส้น จึงคำนวณตรง ๆ ได้ */
    function buildLUT() {
      var n = rw * rh, m = D.meta;
      laA = new Uint16Array(n); loA = new Uint16Array(n);
      fxA = new Uint8Array(n); fyA = new Uint8Array(n);
      for (var y = 0; y < rh; y++) {
        var lat = 90 - (y + 0.5) / rh * 180;
        var fla = (lat - m.lat0) / m.dlat - 0.5;        // หน่วย "ช่องกริด" อิงจุดกึ่งกลางช่อง
        var la = Math.floor(fla), fy = fla - la;
        if (la < 0) { la = 0; fy = 0; }
        if (la > m.nlat - 1) { la = m.nlat - 1; fy = 0; }
        for (var x = 0; x < rw; x++) {
          var lon = -180 + (x + 0.5) / rw * 360;
          var flo = (lon - m.lon0) / m.dlon - 0.5;
          var lo = Math.floor(flo), fx = flo - lo;
          lo = ((lo % m.nlon) + m.nlon) % m.nlon;
          var p = y * rw + x;
          laA[p] = la; loA[p] = lo;
          fxA[p] = (fx * 255) | 0; fyA[p] = (fy * 255) | 0;
        }
      }
    }

    /* ค่า ppm ที่จุดใด ๆ ของเฟรม (ผสม 4 ช่องรอบข้าง) */
    function sample(frame, p) {
      var N = D.nlon, NL = D.nlat, base = frame * D.cells;
      var la = laA[p], lo = loA[p], fx = fxA[p] / 255, fy = fyA[p] / 255;
      var la1 = la + 1 < NL ? la + 1 : la, lo1 = lo + 1 < N ? lo + 1 : 0;
      var r0 = base + la * N, r1 = base + la1 * N, g = D.data;
      return g[r0 + lo] * (1 - fx) * (1 - fy) + g[r0 + lo1] * fx * (1 - fy) +
             g[r1 + lo] * (1 - fx) * fy + g[r1 + lo1] * fx * fy;
    }

    function drawRaster() {
      if (!buf32) return;
      buildColor(D.domain[0], D.domain[1]);
      var last = D.frames - 1;
      var i0 = Math.floor(pos); if (i0 < 0) i0 = 0; if (i0 > last) i0 = last;
      var i1 = Math.min(i0 + 1, last), f = pos - i0;
      if (f < 0) f = 0; if (f > 1) f = 1;
      var n = rw * rh, mn = D.min, sc = D.scale;

      for (var p = 0; p < n; p++) {
        var q = sample(i0, p);
        if (i1 !== i0 && f > 0) q = q * (1 - f) + sample(i1, p) * f;
        buf32[p] = LUT[ci(mn + q * sc)];
      }
      ctxR.putImageData(img, 0, 0);
    }

    function drawVector() {
      if (!proj) return;
      ctxV.setTransform(projScale, 0, 0, projScale, 0, 0);
      ctxV.clearRect(0, 0, rw, rh);
      var path = d3.geoPath(proj, ctxV);

      // เส้นชายฝั่ง/พรมแดนเป็นสีอ่อนโปร่งเสมอ เพราะพื้นหลังเป็นแผนที่สีเข้มทั้งสองธีม
      ctxV.lineWidth = U(0.6);
      ctxV.strokeStyle = 'rgba(255,255,255,.24)';
      ctxV.beginPath(); path(D.geo.border); ctxV.stroke();

      ctxV.lineWidth = U(0.95);
      ctxV.strokeStyle = 'rgba(255,255,255,.62)';
      ctxV.beginPath(); path(D.geo.land); ctxV.stroke();

      if (opts.showThai !== false) {
        var pt = proj([100.5, 13.75]);   // กรุงเทพฯ
        if (pt) {
          ctxV.beginPath(); ctxV.arc(pt[0], pt[1], U(6), 0, 6.284);
          ctxV.lineWidth = U(1.6); ctxV.strokeStyle = '#00E5FF'; ctxV.stroke();
          ctxV.beginPath(); ctxV.arc(pt[0], pt[1], U(1.8), 0, 6.284);
          ctxV.fillStyle = '#00E5FF'; ctxV.fill();
        }
      }
      ctxV.setTransform(1, 0, 0, 1, 0, 0);
    }

    function idx() {
      var i = Math.round(pos);
      return i < 0 ? 0 : (i > D.frames - 1 ? D.frames - 1 : i);
    }

    function drawLabels() {
      var i = idx();
      elDate.innerHTML = thaiDate(D.dates[i]) + '<small>' + D.dates[i].slice(0, 4) + ' · ' +
        (D.layer === 'xco2' ? 'ทั้งคอลัมน์อากาศ' : 'ใกล้พื้น 400 ม.') + '</small>';
      elBadge.innerHTML = 'CO₂ เฉลี่ยทั้งโลกวันนี้<b>' + D.gMean[i].toFixed(1) + ' ppm</b>';
    }

    function drawTip() {
      if (!mouse) { elTip.style.opacity = 0; return; }
      var r = host.getBoundingClientRect();
      var x = Math.floor(mouse.x / r.width * rw), y = Math.floor(mouse.y / r.height * rh);
      if (x < 0 || y < 0 || x >= rw || y >= rh) { elTip.style.opacity = 0; return; }
      var p = y * rw + x;
      var v = D.min + sample(idx(), p) * D.scale;
      var lat = 90 - (y + 0.5) / rh * 180, lon = -180 + (x + 0.5) / rw * 360;
      elTip.innerHTML = '<b>' + v.toFixed(1) + ' ppm</b><br>' +
        Math.abs(lat).toFixed(0) + '°' + (lat >= 0 ? 'N' : 'S') + ' ' +
        Math.abs(lon).toFixed(0) + '°' + (lon >= 0 ? 'E' : 'W');
      elTip.style.opacity = 1;
      var tw = elTip.offsetWidth, th = elTip.offsetHeight;
      var tx = mouse.x + 14, ty = mouse.y + 14;
      if (tx + tw > r.width - 6) tx = mouse.x - tw - 14;
      if (ty + th > r.height - 6) ty = mouse.y - th - 14;
      elTip.style.left = Math.max(6, tx) + 'px';
      elTip.style.top = Math.max(6, ty) + 'px';
    }

    host.addEventListener('mousemove', function (e) {
      var r = host.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
      drawTip();
    });
    host.addEventListener('mouseleave', function () { mouse = null; elTip.style.opacity = 0; });

    var api = {
      setPos: function (p) { pos = p; drawRaster(); drawLabels(); drawTip(); },
      setData: function (nd) {
        D = nd;
        if (!layout()) return;
        api.setPos(Math.min(pos, D.frames - 1));
      },
      resize: function () { if (layout()) api.setPos(pos); },
      refreshTheme: function () { drawVector(); },
      data: function () { return D; }
    };

    layout();
    return api;
  }

  return {
    load: load, create: create, colorOf: colorOf, gradientCss: gradientCss,
    isDark: isDark, thaiDate: thaiDate, fmtPpm: fmtPpm, buildColor: buildColor,
    showLoading: showLoading, showError: showError
  };
})();
