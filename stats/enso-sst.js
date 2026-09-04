/* ============================================================================
   enso-sst.js — ป้อนค่าส่วนต่างอุณหภูมิผิวน้ำทะเลจริงให้ลูกโลก ENSO 3 มิติ

   ใช้ที่ stats/explore.html — แผง “เอลนีโญ & ลานีญา (ENSO 3D Dynamics)”

   ข้อมูล: ใช้กริดชุดเดียวกับแผง “แผนที่โลกร้อนไล่ปี” (climate-map.js) คือ
           climate-data/gistemp-grid.bin — NASA GISTEMP v4 ซึ่งส่วนที่เป็น
           “พื้นน้ำ” คือชุด ERSSTv5 ของ NOAA (อุณหภูมิผิวน้ำทะเลจริง)
           จึงไม่ต้องดาวน์โหลดไฟล์ใหม่เลย — Gistemp.load() แคชไว้ให้แล้ว

   สิ่งที่ส่งออก: พื้นผิว (DataTexture) 1 ใบต่อปี ให้เชดเดอร์เอาไประบายลูกโลก
                 โดยเก็บค่า °C ลงช่อง R แบบเชิงเส้น และช่อง G = 1 เมื่อช่องนั้น
                 เป็น “ค่าประมาณจากเพื่อนบ้าน” ไม่ใช่ค่าที่วัดได้จริง
   ========================================================================== */
window.EnsoSST = (function () {
  'use strict';

  /* ค่าที่ทำให้สีแรงสุด (±) — ส่วนต่างผิวน้ำทะเลรายปีแทบไม่เคยเกินระดับนี้
     ต้องตรงกับป้ายใต้แถบสีในหน้าเว็บ */
  var SCALE = 2.5;
  /* ช่วงที่เข้ารหัสลงไบต์ (±) — กว้างกว่า SCALE เผื่อขั้วโลกที่ผิดปกติจัด */
  var ENC = 6;

  /* พื้นที่ Niño 3.4 ตามนิยามของ NOAA CPC — 5°S–5°N, 170°W–120°W */
  var N34 = { lat0: -5, lat1: 5, lon0: -170, lon1: -120 };

  /* ขอบเสริมซ้าย-ขวาของพื้นผิว (หน่วย: ช่องกริด)
     three.js ที่หน้านี้ใช้ (r97 / WebGL 1) ห่อพื้นผิวแบบ Repeat ไม่ได้ถ้าขนาดไม่ใช่กำลังสอง
     ถ้าปล่อยไว้จะเห็นเป็นตะเข็บที่เส้นลองจิจูด 180° พอดี จึงก๊อบช่องจากอีกฟากมาแปะเป็นขอบเอง
     กว้าง 2 ช่องพอ เพราะการอ่านแบบ bicubic แตะไกลสุดแค่ 2 ช่องต่อข้าง */
  var HALO = 2;

  var fieldCache = {};   // ปี -> { val:Float32Array(°C), est:Uint8Array }
  var fieldOrder = [];   // ไล่ทิ้งของเก่าเมื่อแคชบานปลาย (กดไม่ให้กินแรมตอนเล่นไล่ปียาว ๆ)
  var FIELD_MAX = 40;
  var texCache = {};     // ปี -> THREE.DataTexture
  var texOrder = [];
  var TEX_MAX = 24;

  function load() {
    if (!window.Gistemp) return Promise.reject(new Error('ต้องโหลด climate-map.js ก่อน'));
    return window.Gistemp.load();
  }

  function rowOfYear(D, year) {
    var k = D.years.indexOf(year);
    return k < 0 ? -1 : D.rowOf[k];
  }

  /* ---------- ค่าของปีหนึ่ง เติมช่องว่างด้วยค่าเฉลี่ยเพื่อนบ้าน ----------
     ปีเก่า ๆ (โดยเฉพาะก่อน ค.ศ. 1950) กริดมีรูโหว่ ถ้าปล่อยไว้เชดเดอร์จะเห็นเป็นหลุมดำ
     จึงไล่เติมทีละวงแบบเดียวกับ climate-map.js (ลองจิจูดวนรอบโลก)
     ช่องที่ถูกเติมถูกทำเครื่องหมายไว้ใน est[] เพื่อให้หน้าเว็บบอกผู้ใช้ได้ว่าปีไหนข้อมูลบาง */
  function fieldOf(D, year) {
    var hit = fieldCache[year];
    if (hit) return hit;

    var row = rowOfYear(D, year);
    if (row < 0) return null;

    var N = D.nlon, NL = D.nlat, cells = D.cells, base = row * cells;
    var val = new Float32Array(cells), est = new Uint8Array(cells);
    var hole = new Int32Array(cells), nHole = 0;

    for (var c = 0; c < cells; c++) {
      var q = D.grid[base + c];
      if (q === -128) { est[c] = 1; hole[nHole++] = c; val[c] = NaN; }
      else val[c] = q * 0.1;
    }

    var guard = 0;
    var pend = new Int32Array(cells), pval = new Float32Array(cells);
    while (nHole > 0 && guard++ < 200) {
      var nPend = 0, nKeep = 0;
      for (var k = 0; k < nHole; k++) {
        var cc = hole[k], la = (cc / N) | 0, lo = cc - la * N, s = 0, w = 0, v;
        v = val[la * N + (lo + 1) % N];             if (v === v) { s += v; w++; }
        v = val[la * N + (lo - 1 + N) % N];         if (v === v) { s += v; w++; }
        if (la + 1 < NL) { v = val[(la + 1) * N + lo]; if (v === v) { s += v; w++; } }
        if (la > 0)      { v = val[(la - 1) * N + lo]; if (v === v) { s += v; w++; } }
        // เก็บไว้เขียนพร้อมกันท้ายรอบ ไม่งั้นช่องที่เพิ่งเติมจะลามต่อในรอบเดียวกันจนเกิดริ้วตามทิศที่ไล่
        if (w > 0) { pend[nPend] = cc; pval[nPend] = s / w; nPend++; }
        else hole[nKeep++] = cc;
      }
      if (nPend === 0) break;                 // ปีนั้นไม่มีข้อมูลเลย — ปล่อยว่างตามเดิม
      for (var j = 0; j < nPend; j++) val[pend[j]] = pval[j];
      nHole = nKeep;
    }
    for (var z = 0; z < cells; z++) if (val[z] !== val[z]) val[z] = 0;

    hit = { val: val, est: est };
    fieldCache[year] = hit;
    fieldOrder.push(year);
    while (fieldOrder.length > FIELD_MAX) {
      var drop = fieldOrder.shift();
      if (drop !== year) delete fieldCache[drop];
    }
    return hit;
  }

  /* ---------- พื้นผิวสำหรับเชดเดอร์ ----------
     แถวที่ 0 ของกริด = ขั้วโลกใต้ ซึ่งตรงกับ v=0 ของพื้นผิวพอดี (flipY = false)
     จึงยัดลงไปได้ตามลำดับเดิมโดยไม่ต้องพลิกแกน
     ส่วนแกนลองจิจูดเสริมขอบข้างละ HALO ช่องจากอีกฟากของโลก แล้วตั้ง wrap เป็น ClampToEdge
     เชดเดอร์จึงอ่านข้ามเส้น 180° ได้ต่อเนื่องโดยไม่ต้องพึ่ง RepeatWrapping */
  function textureOf(THREE, D, year) {
    var hit = texCache[year];
    if (hit) return hit;

    var f = fieldOf(D, year);
    if (!f) return null;

    var N = D.nlon, NL = D.nlat, W = N + 2 * HALO;
    var buf = new Uint8Array(W * NL * 4);
    for (var la = 0; la < NL; la++) {
      for (var x = 0; x < W; x++) {
        var lo = (x - HALO + N) % N;           // ก๊อบจากอีกฟากเมื่อเลยขอบ
        var c = la * N + lo;
        var v = f.val[c];
        if (v < -ENC) v = -ENC; else if (v > ENC) v = ENC;
        var o = (la * W + x) * 4;
        buf[o] = Math.round((v + ENC) / (2 * ENC) * 255);
        buf[o + 1] = f.est[c] ? 255 : 0;
        buf[o + 2] = 0;
        buf[o + 3] = 255;
      }
    }

    var tex = new THREE.DataTexture(buf, W, NL, THREE.RGBAFormat);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;

    texCache[year] = tex;
    texOrder.push(year);
    while (texOrder.length > TEX_MAX) {
      var old = texOrder.shift();
      if (texCache[old]) { texCache[old].dispose(); delete texCache[old]; }
    }
    return tex;
  }

  /* ---------- ดัชนีพื้นที่ Niño 3.4 ของปีนั้น (ถ่วงน้ำหนักด้วย cos ละติจูด) ----------
     ย้ำ: นี่คือ “ค่าเฉลี่ยรายปี” ที่คำนวณจากกริด ไม่ใช่ค่า ONI ทางการของ NOAA
     ซึ่งเป็นค่าเฉลี่ยเคลื่อนที่ 3 เดือน ค่าที่ได้จึงเบากว่าค่าพีคเสมอ */
  function nino34(D, year) {
    var f = fieldOf(D, year);
    if (!f) return null;
    var m = D.meta, N = D.nlon, sv = 0, sw = 0;
    for (var la = 0; la < D.nlat; la++) {
      var lat = m.lat0 + (la + 0.5) * m.dlat;
      if (lat < N34.lat0 || lat > N34.lat1) continue;
      var w = Math.cos(lat * Math.PI / 180);
      for (var lo = 0; lo < N; lo++) {
        var lon = m.lon0 + (lo + 0.5) * m.dlon;
        if (lon < N34.lon0 || lon > N34.lon1) continue;
        sv += f.val[la * N + lo] * w; sw += w;
      }
    }
    return sw > 0 ? sv / sw : null;
  }

  /* เกณฑ์ ±0.5°C เป็นเกณฑ์เดียวกับที่ NOAA ใช้แบ่งเฟส ENSO */
  function classify(v) {
    if (v === null || v === undefined) return { name: 'ไม่มีข้อมูล', cls: 'neutral', col: '#94a3b8' };
    if (v >= 0.5) return { name: 'เอลนีโญ', cls: 'el-nino', col: '#f87171' };
    if (v <= -0.5) return { name: 'ลานีญา', cls: 'la-nina', col: '#7dd3fc' };
    return { name: 'ใกล้เคียงปกติ', cls: 'neutral', col: '#cbd5e1' };
  }

  /* สัดส่วนช่องที่ “วัดได้จริง” ของทั้งโลกในปีนั้น (มากับไฟล์ meta อยู่แล้ว) */
  function coverageOf(D, year) {
    var row = rowOfYear(D, year);
    return row < 0 ? null : D.meta.coverage[row];
  }

  function fmt(v) {
    if (v === null || v === undefined) return '—';
    return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + '°C';
  }

  return {
    load: load, fieldOf: fieldOf, textureOf: textureOf,
    nino34: nino34, classify: classify, coverageOf: coverageOf, fmt: fmt,
    SCALE: SCALE, ENC: ENC, HALO: HALO
  };
})();
