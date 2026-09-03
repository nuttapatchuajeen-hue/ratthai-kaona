/* ============================================================================
   climate-map.js — เครื่องยนต์แผนที่ส่วนต่างอุณหภูมิพื้นผิวโลก (NASA GISTEMP v4)

   ใช้ที่ stats/explore.html — แผง “แผนที่โลกร้อนไล่ปี” ในศูนย์ข้อมูลโลก
   (แผนที่ + การ์ดตัวเลข + แถบสีรายปี + กราฟ อยู่ในแผงเดียวกันทั้งหมด)

   ต้องโหลด d3 (v7) และ topojson-client มาก่อน

   ข้อมูล: climate-data/gistemp-grid.bin = Int8 [ปี][ละติจูด][ลองจิจูด]
           ค่า = ส่วนต่างอุณหภูมิ (°C) × 10 · -128 = ไม่มีข้อมูล
           แปลงจากไฟล์ NetCDF ต้นทาง gistemp1200_GHCNv4_ERSSTv5.nc ของ NASA GISS

   วิธีวาด: ตอนปรับขนาดจะคำนวณ “ตารางค้นหา” ไว้ครั้งเดียว — พิกเซลบนจอ 1 จุดผูกกับ
           ช่องกริด 4 ช่องพร้อมน้ำหนัก bilinear จากนั้นทุกเฟรมแค่ค้นตาราง จึงไล่ปีได้ลื่น
   ========================================================================== */
window.Gistemp = (function () {
  'use strict';

  var DIR = 'climate-data/';

  /* ---------- สเกลสี (น้ำเงิน → ขาว → แดง แบบเดียวกับแผนภาพ NASA) ---------- */
  var STOPS = [-4, -3, -2, -1, -0.5, -0.2, 0, 0.2, 0.5, 1, 2, 3, 4];
  var HEX = ['#08306b', '#12539f', '#3182bd', '#74add1', '#abd9e9', '#dcecf4', '#f7f7f5',
             '#fde3c8', '#fdae61', '#f46d43', '#d73027', '#a50026', '#5c0011'];
  var LUTN = 1024, LUT = new Uint32Array(LUTN), LUTC = new Array(LUTN), builtColor = false;

  function buildColor() {
    if (builtColor) return;
    var sc = d3.scaleLinear().domain(STOPS).range(HEX).interpolate(d3.interpolateLab).clamp(true);
    for (var i = 0; i < LUTN; i++) {
      var c = d3.rgb(sc(-6 + 12 * i / (LUTN - 1)));
      LUTC[i] = c.formatHex();
      LUT[i] = (255 << 24) | (c.b << 16) | (c.g << 8) | c.r;   // little-endian RGBA
    }
    builtColor = true;
  }
  function ci(v) { var i = ((v + 6) / 12 * (LUTN - 1) + 0.5) | 0; return i < 0 ? 0 : (i > LUTN - 1 ? LUTN - 1 : i); }
  function colorOf(v) { buildColor(); return LUTC[ci(v)]; }

  // ค่าเฉลี่ย “ทั้งโลก” แกว่งแค่ราว −0.5 ถึง +1.3°C ถ้าใช้สเกลเดียวกับแผนที่ (±4°C) แถบจะซีดจนดูไม่ออก
  // จึงขยายสเกลเฉพาะแถบสีรายปีกับแท่งในกราฟ ให้ +1.3°C = แดงเข้มสุด
  var STRIPE_GAIN = 4 / 1.3;
  function stripeColor(v) { return colorOf(v * STRIPE_GAIN); }

  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  // สีช่อง “ไม่มีข้อมูล” — ต้องเป็นเทากลางที่อ่านออกว่าว่าง ไม่ใช่ดำจนดูเป็นรูโหว่
  function noDataColor() { return isDark() ? '#3b4854' : '#cfd8de'; }
  function noDataRGBA() { var c = d3.rgb(noDataColor()); return (255 << 24) | (c.b << 16) | (c.g << 8) | c.r; }
  function fmt(v) { return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + '°C'; }

  /* ---------- สไตล์ (ใส่ครั้งเดียวต่อหน้า ใช้ตัวแปรสีของธีมที่หน้านั้นมีอยู่แล้ว) ---------- */
  var cssDone = false;
  function injectCss() {
    if (cssDone) return; cssDone = true;
    var css = [
      '.gm-shell{position:relative;width:100%;aspect-ratio:2/1;border-radius:14px;overflow:hidden;',
      '  background:var(--paper-2,#f8fbfd);border:1px solid var(--rule,#c8dae4);cursor:crosshair}',
      '.gm-shell canvas{position:absolute;inset:0;width:100%;height:100%;display:block}',
      '.gm-title{position:absolute;left:50%;top:10px;transform:translateX(-50%);text-align:center;pointer-events:none;',
      '  font-size:clamp(11px,1.3vw,13.5px);font-weight:600;line-height:1.35;color:var(--ink,#0a1822);',
      '  background:var(--glass-bg,rgba(255,255,255,.6));border:1px solid var(--glass-border-soft,rgba(255,255,255,.5));',
      '  border-radius:10px;padding:4px 12px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:3}',
      '.gm-title small{display:block;font-weight:400;font-size:.82em;color:var(--ink-soft,#516a7a)}',
      '.gm-year{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);pointer-events:none;z-index:3;',
      '  font-family:"Archivo",system-ui,sans-serif;font-weight:800;line-height:1;letter-spacing:.02em;',
      '  color:var(--ink,#0a1822);padding:2px 18px 5px;border-radius:13px;',
      '  background:var(--glass-bg,rgba(255,255,255,.6));border:1px solid var(--glass-border-soft,rgba(255,255,255,.5));',
      '  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}',
      '.gm-year.big{font-size:clamp(30px,5.6vw,64px)}',
      '.gm-year.small{font-size:clamp(20px,3.4vw,30px);padding:2px 14px 4px}',
      '.gm-tip{position:absolute;pointer-events:none;z-index:5;padding:6px 10px;border-radius:10px;',
      '  font-size:12.5px;line-height:1.45;color:var(--ink,#0a1822);white-space:nowrap;opacity:0;transition:opacity .12s;',
      '  background:var(--glass-bg,rgba(255,255,255,.7));border:1px solid var(--glass-border-soft,rgba(255,255,255,.5));',
      '  backdrop-filter:blur(10px);box-shadow:0 10px 30px -14px rgba(0,0,0,.6)}',
      '.gm-tip b{font-family:"Archivo",system-ui;font-size:14px}',
      '.gm-loading{position:absolute;inset:0;display:grid;place-items:center;z-index:9;text-align:center;',
      '  background:var(--paper-2,#f8fbfd);font-size:13.5px;color:var(--ink-2,#2c4356)}',
      '.gm-loading .gm-spin{width:32px;height:32px;margin:0 auto 10px;border-radius:50%;',
      '  border:2px solid var(--rule,#c8dae4);border-top-color:var(--green,#0089a9);animation:gmspin 1s linear infinite}',
      '@keyframes gmspin{to{transform:rotate(360deg)}}',
      '@media (max-width:720px){.gm-shell{aspect-ratio:3/2}}'
    ].join('');
    var st = document.createElement('style');
    st.setAttribute('data-gistemp', '1');
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------- โหลดข้อมูล (ดาวน์โหลดครั้งเดียวต่อหน้า ต่อให้มีแผนที่หลายอัน) ---------- */
  var dataPromise = null;
  function load() {
    if (dataPromise) return dataPromise;
    dataPromise = Promise.all([
      fetch(DIR + 'gistemp-meta.json').then(function (r) { if (!r.ok) throw new Error('meta ' + r.status); return r.json(); }),
      fetch(DIR + 'gistemp-grid.bin').then(function (r) { if (!r.ok) throw new Error('grid ' + r.status); return r.arrayBuffer(); }),
      fetch(DIR + 'countries-110m.json').then(function (r) { if (!r.ok) throw new Error('geo ' + r.status); return r.json(); })
    ]).then(function (res) { return prepare(res[0], new Int8Array(res[1]), res[2]); });
    return dataPromise;
  }

  /* ---------- เติมช่องที่ไม่มีข้อมูลด้วยค่าประมาณ ----------
     ปีเก่า ๆ (โดยเฉพาะก่อน ค.ศ. 1950) NASA ไม่มีสถานีตรวจวัดครอบคลุมทั้งโลก แผนที่จึงเป็นรูโหว่
     ฟังก์ชันนี้ไล่เติมช่องว่างด้วยค่าเฉลี่ยของช่องข้างเคียงทีละวง จนกว่าจะเต็ม (ลองจิจูดวนรอบโลก)

     ย้ำ: ค่าที่เติมเป็น "ค่าประมาณเชิงพื้นที่" ไม่ใช่ข้อมูลวัดจริงของ NASA
     D.grid ต้นฉบับไม่ถูกแตะ ทูลทิปจึงยังแยกออกว่าช่องไหนของจริง ช่องไหนเป็นค่าประมาณ */
  function buildFilled(D) {
    if (D.gridFill) return D.gridFill;
    var N = D.nlon, NL = D.nlat, cells = D.cells, src = D.grid;
    var out = new Int8Array(src);
    var hole = new Int32Array(cells), pend = new Int32Array(cells), pval = new Int8Array(cells);

    for (var y = 0; y < D.rowOf.length; y++) {
      var base = D.rowOf[y] * cells, nHole = 0;
      for (var c = 0; c < cells; c++) if (out[base + c] === -128) hole[nHole++] = c;

      var guard = 0;
      while (nHole > 0 && guard++ < 200) {
        var nPend = 0, nKeep = 0;
        for (var k = 0; k < nHole; k++) {
          var cc = hole[k], la = (cc / N) | 0, lo = cc - la * N, s = 0, w = 0, q;
          q = out[base + la * N + (lo + 1) % N];            if (q !== -128) { s += q; w++; }
          q = out[base + la * N + (lo - 1 + N) % N];        if (q !== -128) { s += q; w++; }
          if (la + 1 < NL) { q = out[base + (la + 1) * N + lo]; if (q !== -128) { s += q; w++; } }
          if (la > 0)      { q = out[base + (la - 1) * N + lo]; if (q !== -128) { s += q; w++; } }
          if (w > 0) {
            // เก็บไว้เขียนพร้อมกันท้ายรอบ ไม่งั้นช่องที่เพิ่งเติมจะลามต่อในรอบเดียวกันจนเกิดริ้วตามทิศที่ไล่
            var v = Math.round(s / w); if (v < -127) v = -127; if (v > 127) v = 127;
            pend[nPend] = cc; pval[nPend] = v; nPend++;
          } else hole[nKeep++] = cc;
        }
        if (nPend === 0) break;                       // ปีนั้นไม่มีข้อมูลเลย — ปล่อยเป็นช่องว่างตามเดิม
        for (var j = 0; j < nPend; j++) out[base + pend[j]] = pval[j];
        nHole = nKeep;
      }
    }
    D.gridFill = out;
    return out;
  }

  function prepare(meta, grid, topo) {
    buildColor();
    var nlat = meta.nlat, nlon = meta.nlon, cells = nlat * nlon;
    var years = [], rowOf = [];
    for (var y = 0; y < meta.nyear; y++) {
      // เอาเฉพาะปีที่ครบ 12 เดือน — ปีล่าสุดที่ยังไม่จบปี เฉลี่ยแล้วเทียบกับปีอื่นไม่ได้
      if (meta.monthsPerYear[y] === 12) { years.push(meta.year0 + y); rowOf.push(y); }
    }

    var thai = {};
    thai.la = Math.floor((14 - meta.lat0) / meta.dlat);          // จุดกริดที่ครอบภาคกลางของไทย
    thai.lo = Math.floor((101 - meta.lon0) / meta.dlon);
    thai.lat = meta.lat0 + (thai.la + 0.5) * meta.dlat;
    thai.lon = meta.lon0 + (thai.lo + 0.5) * meta.dlon;

    var gMean = [], aMean = [], tMean = [];
    var laArctic = Math.ceil((64 - meta.lat0) / meta.dlat);
    for (var i = 0; i < years.length; i++) {
      var base = rowOf[i] * cells;
      gMean.push(meta.globalMean[rowOf[i]]);

      var sw = 0, sv = 0;
      for (var la = laArctic; la < nlat; la++) {
        var w = Math.cos((meta.lat0 + (la + 0.5) * meta.dlat) * Math.PI / 180);
        for (var lo = 0; lo < nlon; lo++) {
          var q = grid[base + la * nlon + lo];
          if (q === -128) continue;
          sv += q * 0.1 * w; sw += w;
        }
      }
      aMean.push(sw > 0 ? sv / sw : null);

      var tq = grid[base + thai.la * nlon + thai.lo];
      tMean.push(tq === -128 ? null : tq * 0.1);
    }

    return {
      meta: meta, grid: grid, gridFill: null, nlat: nlat, nlon: nlon, cells: cells,
      years: years, rowOf: rowOf, gMean: gMean, aMean: aMean, tMean: tMean, thai: thai,
      landMesh: topojson.mesh(topo, topo.objects.countries, function (a, b) { return a === b; }),
      borderMesh: topojson.mesh(topo, topo.objects.countries, function (a, b) { return a !== b; }),
      indexOfYear: function (yr) { var k = years.indexOf(yr); return k < 0 ? 0 : k; }
    };
  }

  /* ---------- สร้างแผนที่ 1 อันในกล่องที่ส่งมา ---------- */
  function create(host, D, opts) {
    injectCss();
    opts = opts || {};

    host.classList.add('gm-shell');
    host.innerHTML = '';

    var cvR = document.createElement('canvas'), cvV = document.createElement('canvas'), cvO = document.createElement('canvas');
    host.appendChild(cvR); host.appendChild(cvV); host.appendChild(cvO);
    var ctxR = cvR.getContext('2d'), ctxV = cvV.getContext('2d'), ctxO = cvO.getContext('2d');

    var elTitle = null, elYear = null, elTip = null;
    if (opts.title) {
      elTitle = document.createElement('div'); elTitle.className = 'gm-title';
      elTitle.innerHTML = opts.title + (opts.subtitle ? '<small>' + opts.subtitle + '</small>' : '');
      host.appendChild(elTitle);
    }
    if (opts.showYear !== false) {
      elYear = document.createElement('div');
      elYear.className = 'gm-year ' + (opts.compact ? 'small' : 'big');
      host.appendChild(elYear);
    }
    if (opts.tooltip !== false) {
      elTip = document.createElement('div'); elTip.className = 'gm-tip';
      host.appendChild(elTip);
    }

    var rw = 0, rh = 0, img = null, buf32 = null, dpr = 1, projScale = 1, proj = null;
    var laA = null, loA = null, fxA = null, fyA = null, maskA = null;
    var pos = 0, ndRGBA = noDataRGBA(), fill = !!opts.fill;
    if (fill) buildFilled(D);
    function U(css) { return css * dpr / projScale; }   // CSS px → หน่วยที่ใช้วาดบน cvV/cvO

    function layout() {
      var r = host.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      // ชั้นสีจำกัดที่ 1000px — ข้อมูลผ่านการเกลี่ย 1,200 กม. มาแล้ว ขยายภาพจึงไม่เสียรายละเอียด
      rw = Math.max(160, Math.min(1000, Math.round(r.width)));
      rh = Math.max(80, Math.round(rw * r.height / r.width));
      cvR.width = rw; cvR.height = rh;
      img = ctxR.createImageData(rw, rh);
      buf32 = new Uint32Array(img.data.buffer);

      cvV.width = cvO.width = Math.round(r.width * dpr);
      cvV.height = cvO.height = Math.round(r.height * dpr);
      projScale = r.width * dpr / rw;

      proj = d3.geoEqualEarth().precision(0.1).fitExtent([[2, 2], [rw - 2, rh - 2]], { type: 'Sphere' });
      buildProjLUT();
      drawVector();
      return true;
    }

    function buildProjLUT() {
      var n = rw * rh;
      laA = new Uint16Array(n); loA = new Uint16Array(n);
      fxA = new Uint8Array(n); fyA = new Uint8Array(n); maskA = new Uint8Array(n);
      var meta = D.meta;

      /* ขอบเขตจริงของแผนที่: proj.invert ของ Equal Earth ยังคืนพิกัดที่ดู "ปกติ" ให้จุดที่อยู่
         นอกทรงกลมด้วย เช็กแค่ช่วง ±90/±180 จึงไม่พอ — จุดนอกขอบเลยถูกระบายสีเป็นริ้วพัด
         ออกจากขั้ว วิธีที่แน่นอนคือวาดทรงกลมลงแคนวาสชั่วคราวแล้วอ่านกลับมาเป็นหน้ากาก */
      var mc = document.createElement('canvas'); mc.width = rw; mc.height = rh;
      var mx = mc.getContext('2d');
      mx.fillStyle = '#fff'; mx.beginPath(); d3.geoPath(proj, mx)({ type: 'Sphere' }); mx.fill();
      var sphere = mx.getImageData(0, 0, rw, rh).data;

      for (var y = 0; y < rh; y++) {
        for (var x = 0; x < rw; x++) {
          var p = y * rw + x;
          if (!sphere[p * 4 + 3]) { maskA[p] = 0; continue; }
          var inv = proj.invert([x + 0.5, y + 0.5]);
          if (!inv || !isFinite(inv[0]) || !isFinite(inv[1]) ||
              inv[1] > 90.001 || inv[1] < -90.001 || inv[0] > 180.001 || inv[0] < -180.001) { maskA[p] = 0; continue; }
          maskA[p] = 1;
          var fla = (inv[1] - meta.lat0) / meta.dlat - 0.5;   // พิกัดในหน่วย “ช่องกริด” (อิงจุดศูนย์กลางช่อง)
          var flo = (inv[0] - meta.lon0) / meta.dlon - 0.5;
          var la = Math.floor(fla), lo = Math.floor(flo);
          var fy = fla - la, fx = flo - lo;
          if (la < 0) { la = 0; fy = 0; }
          if (la > D.nlat - 1) { la = D.nlat - 1; fy = 0; }
          lo = ((lo % D.nlon) + D.nlon) % D.nlon;
          laA[p] = la; loA[p] = lo;
          fxA[p] = (fx * 255) | 0; fyA[p] = (fy * 255) | 0;
        }
      }
    }

    function drawRaster() {
      if (!buf32) return;
      var i0 = Math.floor(pos); if (i0 > D.years.length - 1) i0 = D.years.length - 1; if (i0 < 0) i0 = 0;
      var i1 = Math.min(i0 + 1, D.years.length - 1);
      var f = pos - i0; if (f < 0) f = 0; if (f > 1) f = 1;
      var bA = D.rowOf[i0] * D.cells, bB = D.rowOf[i1] * D.cells;
      var g = fill && D.gridFill ? D.gridFill : D.grid;
      var n = rw * rh, N = D.nlon, NL = D.nlat;

      for (var p = 0; p < n; p++) {
        if (!maskA[p]) { buf32[p] = 0; continue; }
        var la = laA[p], lo = loA[p];
        var fx = fxA[p] / 255, fy = fyA[p] / 255;
        var la1 = la + 1 < NL ? la + 1 : la;
        var lo1 = lo + 1 < N ? lo + 1 : 0;
        var r0 = la * N, r1 = la1 * N;
        var w00 = (1 - fx) * (1 - fy), w01 = fx * (1 - fy), w10 = (1 - fx) * fy, w11 = fx * fy;

        var s = 0, w = 0, q;
        q = g[bA + r0 + lo];  if (q !== -128) { s += q * w00; w += w00; }
        q = g[bA + r0 + lo1]; if (q !== -128) { s += q * w01; w += w01; }
        q = g[bA + r1 + lo];  if (q !== -128) { s += q * w10; w += w10; }
        q = g[bA + r1 + lo1]; if (q !== -128) { s += q * w11; w += w11; }
        var vA = w > 0.001 ? s * 0.1 / w : null;

        var vB = vA;
        if (bB !== bA) {
          s = 0; w = 0;
          q = g[bB + r0 + lo];  if (q !== -128) { s += q * w00; w += w00; }
          q = g[bB + r0 + lo1]; if (q !== -128) { s += q * w01; w += w01; }
          q = g[bB + r1 + lo];  if (q !== -128) { s += q * w10; w += w10; }
          q = g[bB + r1 + lo1]; if (q !== -128) { s += q * w11; w += w11; }
          vB = w > 0.001 ? s * 0.1 / w : null;
        }

        var v;
        if (vA === null && vB === null) { buf32[p] = ndRGBA; continue; }
        else if (vA === null) v = vB;
        else if (vB === null) v = vA;
        else v = vA * (1 - f) + vB * f;

        buf32[p] = LUT[ci(v)];
      }
      ctxR.putImageData(img, 0, 0);
    }

    function drawVector() {
      if (!proj) return;
      ctxV.setTransform(projScale, 0, 0, projScale, 0, 0);
      ctxV.clearRect(0, 0, rw, rh);
      var path = d3.geoPath(proj, ctxV), dark = isDark();

      ctxV.lineWidth = U(0.7);
      ctxV.strokeStyle = dark ? 'rgba(214,236,246,.32)' : 'rgba(10,24,34,.32)';
      ctxV.beginPath(); path(D.borderMesh); ctxV.stroke();

      ctxV.lineWidth = U(1);
      ctxV.strokeStyle = dark ? 'rgba(226,244,252,.7)' : 'rgba(6,18,26,.66)';
      ctxV.beginPath(); path(D.landMesh); ctxV.stroke();

      ctxV.lineWidth = U(1.1);
      ctxV.strokeStyle = dark ? 'rgba(226,244,252,.35)' : 'rgba(6,18,26,.3)';
      ctxV.beginPath(); path({ type: 'Sphere' }); ctxV.stroke();
      ctxV.setTransform(1, 0, 0, 1, 0, 0);
    }

    function drawOverlay(idx) {
      if (!proj) return;
      ctxO.setTransform(projScale, 0, 0, projScale, 0, 0);
      ctxO.clearRect(0, 0, rw, rh);
      if (opts.showThai === false) { ctxO.setTransform(1, 0, 0, 1, 0, 0); return; }

      var dark = isDark(), pt = proj([D.thai.lon, D.thai.lat]);
      if (pt) {
        var accent = dark ? '#00E5FF' : '#0089A9';
        ctxO.beginPath(); ctxO.arc(pt[0], pt[1], U(7), 0, 6.284);
        ctxO.lineWidth = U(1.8); ctxO.strokeStyle = accent; ctxO.stroke();
        ctxO.beginPath(); ctxO.arc(pt[0], pt[1], U(2), 0, 6.284);
        ctxO.fillStyle = accent; ctxO.fill();

        // หมุดไทยอิงข้อมูลจริงก่อนเสมอ ปีที่ไม่มีข้อมูลจริงจึงค่อยใช้ค่าที่เติม (ใส่ ≈ กำกับ)
        // ไม่งั้นแผนที่ระบายสีตรงไทยอยู่แต่ป้ายบอก “ไม่มีข้อมูล” ซึ่งขัดกันเอง
        var v = D.tMean[idx], approx = false;
        if ((v === null || v === undefined) && fill && D.gridFill) {
          var tq = D.gridFill[D.rowOf[idx] * D.cells + D.thai.la * D.nlon + D.thai.lo];
          if (tq !== -128) { v = tq * 0.1; approx = true; }
        }
        var label = 'ไทย ' + (v === null || v === undefined ? 'ไม่มีข้อมูล' : (approx ? '≈ ' : '') + fmt(v));
        ctxO.font = '600 ' + U(12.5) + 'px "IBM Plex Sans Thai",system-ui,sans-serif';
        ctxO.textBaseline = 'middle';
        var tw = ctxO.measureText(label).width;
        var padX = U(7), boxH = U(21), gap = U(11);
        var bx = pt[0] + gap, by = pt[1] - gap - boxH;
        if (bx + tw + padX * 2 > rw) bx = pt[0] - gap - tw - padX * 2;
        if (by < 0) by = pt[1] + gap;
        ctxO.fillStyle = dark ? 'rgba(4,10,16,.8)' : 'rgba(255,255,255,.86)';
        ctxO.strokeStyle = dark ? 'rgba(0,229,255,.45)' : 'rgba(0,137,169,.45)';
        ctxO.lineWidth = U(1);
        roundRect(ctxO, bx, by, tw + padX * 2, boxH, U(6)); ctxO.fill(); ctxO.stroke();
        ctxO.fillStyle = dark ? '#DCE8F0' : '#0A1822';
        ctxO.fillText(label, bx + padX, by + boxH / 2);
      }
      ctxO.setTransform(1, 0, 0, 1, 0, 0);
    }
    function roundRect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    }

    function render() {
      if (!proj && !layout()) return;
      var idx = Math.round(pos); if (idx > D.years.length - 1) idx = D.years.length - 1; if (idx < 0) idx = 0;
      drawRaster();
      drawOverlay(idx);
      if (elYear) elYear.textContent = D.years[idx];
    }

    /* ชี้เมาส์บนแผนที่ → บอกพิกัดและค่าของจุดนั้น */
    function onMove(e) {
      if (!elTip || !proj) return;
      var r = host.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width * rw, y = (e.clientY - r.top) / r.height * rh;
      var inv = proj.invert ? proj.invert([x, y]) : null;
      if (!inv || !isFinite(inv[0]) || Math.abs(inv[1]) > 90.001 || Math.abs(inv[0]) > 180.001) { elTip.style.opacity = 0; return; }
      var idx = Math.round(pos);
      var la = Math.min(D.nlat - 1, Math.max(0, Math.floor((inv[1] - D.meta.lat0) / D.meta.dlat)));
      var lo = ((Math.floor((inv[0] - D.meta.lon0) / D.meta.dlon) % D.nlon) + D.nlon) % D.nlon;
      var cell = D.rowOf[idx] * D.cells + la * D.nlon + lo;
      var q = D.grid[cell], head;
      if (q !== -128) head = '<b>' + fmt(q * 0.1) + '</b>';
      else if (fill && D.gridFill && D.gridFill[cell] !== -128)
        head = '<b>≈ ' + fmt(D.gridFill[cell] * 0.1) + '</b> <small>ค่าประมาณ</small>';
      else head = '<b>ไม่มีข้อมูล</b>';
      elTip.innerHTML = head + ' · ' + D.years[idx] + '<br>' +
        Math.abs(inv[1]).toFixed(0) + '°' + (inv[1] >= 0 ? 'N' : 'S') + ' ' +
        Math.abs(inv[0]).toFixed(0) + '°' + (inv[0] >= 0 ? 'E' : 'W');
      elTip.style.opacity = 1;
      var tx = e.clientX - r.left + 14, ty = e.clientY - r.top + 14;
      if (tx + 150 > r.width) tx = e.clientX - r.left - 160;
      if (ty + 62 > r.height) ty = e.clientY - r.top - 62;
      elTip.style.left = tx + 'px'; elTip.style.top = ty + 'px';
    }
    function onLeave() { if (elTip) elTip.style.opacity = 0; }
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);

    var ro = null, rt = null;
    function onResize() { clearTimeout(rt); rt = setTimeout(function () { if (layout()) render(); }, 120); }
    if (window.ResizeObserver) { ro = new ResizeObserver(onResize); ro.observe(host); }
    else window.addEventListener('resize', onResize);

    var api = {
      el: host,
      get pos() { return pos; },
      setPos: function (p) {
        var max = D.years.length - 1;
        pos = p < 0 ? 0 : (p > max ? max : p);
        render();
        return api;
      },
      setYear: function (yr) { return api.setPos(D.indexOfYear(yr)); },
      yearAt: function () { return D.years[Math.round(pos)]; },
      resize: function () { if (layout()) render(); return api; },
      get fill() { return fill; },
      setFill: function (on) { fill = !!on; if (fill) buildFilled(D); render(); return api; },
      refreshTheme: function () { ndRGBA = noDataRGBA(); drawVector(); render(); return api; },
      destroy: function () {
        host.removeEventListener('pointermove', onMove);
        host.removeEventListener('pointerleave', onLeave);
        if (ro) ro.disconnect(); else window.removeEventListener('resize', onResize);
        clearTimeout(rt); host.innerHTML = '';
      }
    };
    layout(); render();
    return api;
  }

  /* ---------- ป้ายบอกช่วงสี (ใช้ได้ทั้งสองหน้า) ---------- */
  function gradientCss(lo, hi) {
    buildColor();
    var stops = [];
    lo = lo === undefined ? -4 : lo; hi = hi === undefined ? 4 : hi;
    for (var i = 0; i <= 20; i++) stops.push(colorOf(lo + (hi - lo) * i / 20) + ' ' + (i * 5) + '%');
    return 'linear-gradient(90deg,' + stops.join(',') + ')';
  }

  /* ---------- กล่อง “กำลังโหลด” มาตรฐาน ---------- */
  function showLoading(host, msg) {
    injectCss();
    host.classList.add('gm-shell');
    host.innerHTML = '<div class="gm-loading"><div><div class="gm-spin"></div>' +
      (msg || 'กำลังโหลดข้อมูลกริด NASA (~2.4 MB)…') + '</div></div>';
  }
  function showError(host, err) {
    host.classList.add('gm-shell');
    host.innerHTML = '<div class="gm-loading"><div>โหลดข้อมูลไม่สำเร็จ<br>' +
      '<small style="color:var(--ink-soft)">' + (err && err.message ? err.message : err) + '</small></div></div>';
  }

  return {
    load: load, create: create,
    colorOf: colorOf, stripeColor: stripeColor, fmt: fmt,
    noDataColor: noDataColor, isDark: isDark, gradientCss: gradientCss,
    showLoading: showLoading, showError: showError
  };
})();
