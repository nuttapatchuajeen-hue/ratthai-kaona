/* ============================================================================
   climate.js — หน้าเต็ม /stats/climate.html
   แผนที่วาดด้วยเอนจินร่วม climate-map.js (window.Gistemp) ไฟล์นี้ดูแลเฉพาะ
   ส่วนของหน้านี้: ปุ่มควบคุม · แถบสีรายปี · กราฟค่าเฉลี่ยโลก · การ์ดตัวเลข
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var G = window.Gistemp;

  var D = null, map = null;
  var years = [], gMean = [], aMean = [], tMean = [];
  var pos = 0, playing = false, speedMul = 1, lastDisp = -1;
  var YEARS_PER_SEC = 3;

  G.showLoading($('#mapShell'));

  G.load().then(function (data) {
    D = data;
    years = D.years; gMean = D.gMean; aMean = D.aMean; tMean = D.tMean;
    map = G.create($('#mapShell'), D, {
      title: 'Change in Global Temperature',
      subtitle: 'relative to 1951–1980'
    });
    init();
  }).catch(function (err) { G.showError($('#mapShell'), err); });

  function init() {
    buildLegend();
    buildStripes();

    $('#chipYears').textContent = 'ค.ศ. ' + years[0] + '–' + years[years.length - 1] + ' (' + years.length + ' ปี)';
    $('#tvTh').nextElementSibling.textContent = 'จุดกริด ' + Math.round(D.thai.lat) + '°N, ' + Math.round(D.thai.lon) + '°E';
    var rng = $('#yearRange');
    rng.max = String(years.length - 1); rng.value = '0';

    wire();
    draw(true);
    if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) setPlaying(true);
  }

  /* ---------- แถบสีรายปี (warming stripes) ---------- */
  function buildStripes() {
    var host = $('#stripes'), head = $('#stripeHead');
    var frag = document.createDocumentFragment();
    for (var i = 0; i < years.length; i++) {
      var b = document.createElement('i');
      b.style.background = gMean[i] === null ? G.noDataColor() : G.stripeColor(gMean[i]);
      b.title = years[i] + ' · ' + (gMean[i] === null ? 'ไม่มีข้อมูล' : G.fmt(gMean[i]));
      frag.appendChild(b);
    }
    host.insertBefore(frag, head);

    // ป้ายปี — วางตามตำแหน่งจริงของปีนั้นบนแถบ ไม่ใช่แบ่งช่องเท่าๆ กัน
    var ax = $('#stripeAxis'); ax.innerHTML = '';
    var y0 = years[0], yN = years[years.length - 1];
    var ticks = [y0, 1900, 1920, 1940, 1960, 1980, 2000, 2020];
    if (yN - ticks[ticks.length - 1] < 8) ticks.pop();   // กันป้ายปีสุดท้ายทับป้ายทศวรรษ
    ticks.push(yN);
    ticks.forEach(function (y) {
      var s = document.createElement('span');
      s.textContent = y;
      s.style.left = ((y - y0 + 0.5) / years.length * 100) + '%';
      ax.appendChild(s);
    });
  }
  function paintStripes() {
    var bars = $('#stripes').querySelectorAll('i');
    for (var i = 0; i < bars.length; i++) bars[i].style.background = gMean[i] === null ? G.noDataColor() : G.stripeColor(gMean[i]);
  }
  function buildLegend() { $('#lgGrad').style.background = G.gradientCss(-4, 4); }

  /* ---------- กราฟเส้นค่าเฉลี่ยโลก ---------- */
  function drawChart(idx) {
    var cv = $('#cvChart'), r = cv.getBoundingClientRect();
    if (!r.width) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    var c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, r.width, r.height);

    var m = { l: 44, r: 12, t: 12, b: 26 };
    var W = r.width - m.l - m.r, H = r.height - m.t - m.b;
    var dark = G.isDark();
    var ink = dark ? 'rgba(169,191,205,.9)' : 'rgba(44,67,86,.9)';
    var faint = dark ? 'rgba(169,191,205,.16)' : 'rgba(44,67,86,.14)';

    var x = d3.scaleLinear().domain([years[0], years[years.length - 1]]).range([m.l, m.l + W]);
    var y = d3.scaleLinear().domain([-0.6, 1.5]).range([m.t + H, m.t]);

    c.font = '500 11px "Archivo",system-ui,sans-serif';
    c.strokeStyle = faint; c.fillStyle = ink; c.lineWidth = 1;
    [-0.5, 0, 0.5, 1, 1.5].forEach(function (v) {
      var yy = Math.round(y(v)) + 0.5;
      c.beginPath(); c.moveTo(m.l, yy); c.lineTo(m.l + W, yy); c.stroke();
      c.textAlign = 'right'; c.textBaseline = 'middle';
      c.fillText((v > 0 ? '+' : '') + v.toFixed(1), m.l - 8, yy);
    });
    c.textAlign = 'center'; c.textBaseline = 'top';
    [1900, 1940, 1980, 2020].forEach(function (yr) { c.fillText(yr, x(yr), m.t + H + 7); });

    // เส้นศูนย์ = ค่าเฉลี่ยปี 1951–1980
    c.strokeStyle = dark ? 'rgba(220,232,240,.45)' : 'rgba(10,24,34,.4)';
    c.setLineDash([4, 4]); c.beginPath();
    c.moveTo(m.l, Math.round(y(0)) + 0.5); c.lineTo(m.l + W, Math.round(y(0)) + 0.5); c.stroke();
    c.setLineDash([]);

    // แท่งรายปีจนถึงปีที่แสดงอยู่
    var bw = Math.max(1, W / years.length - 0.6);
    for (var i = 0; i <= idx; i++) {
      if (gMean[i] === null) continue;
      c.fillStyle = G.stripeColor(gMean[i]);
      var yy = y(gMean[i]), y0 = y(0);
      c.fillRect(x(years[i]) - bw / 2, Math.min(yy, y0), bw, Math.abs(yy - y0));
    }

    // เส้นค่าเฉลี่ยเคลื่อนที่ 10 ปี — วาดเส้นรองสีพื้นก่อน เพื่อให้อ่านออกทั้งบนแท่งสีอ่อนและแท่งแดงเข้ม
    var mvPath = new Path2D(), started = false;
    for (var j = 0; j <= idx; j++) {
      var a = Math.max(0, j - 9), sum = 0, k = 0;
      for (var t = a; t <= j; t++) { if (gMean[t] !== null) { sum += gMean[t]; k++; } }
      if (!k) continue;
      var px = x(years[j]), py = y(sum / k);
      if (!started) { mvPath.moveTo(px, py); started = true; } else mvPath.lineTo(px, py);
    }
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.strokeStyle = dark ? 'rgba(4,10,16,.85)' : 'rgba(255,255,255,.9)';
    c.lineWidth = 4.5; c.stroke(mvPath);
    c.strokeStyle = dark ? '#DCE8F0' : '#0A1822';
    c.lineWidth = 2; c.stroke(mvPath);

    if (gMean[idx] !== null) {
      c.beginPath(); c.arc(x(years[idx]), y(gMean[idx]), 4.4, 0, 6.284);
      c.fillStyle = dark ? 'rgba(4,10,16,.85)' : 'rgba(255,255,255,.9)'; c.fill();
      c.beginPath(); c.arc(x(years[idx]), y(gMean[idx]), 3.2, 0, 6.284);
      c.fillStyle = dark ? '#DCE8F0' : '#0A1822'; c.fill();
    }

    c.fillStyle = ink; c.textAlign = 'left'; c.textBaseline = 'top';
    c.font = '600 11.5px "IBM Plex Sans Thai",system-ui,sans-serif';
    c.fillText('แท่ง = ค่าเฉลี่ยโลกรายปี · เส้นทึบ = ค่าเฉลี่ยเคลื่อนที่ 10 ปี', m.l + 4, m.t + 2);
  }

  /* ---------- อัปเดตตัวเลข ---------- */
  function tile(vEl, sEl, v) {
    $(vEl).textContent = v === null || v === undefined ? '—' : G.fmt(v);
    $(vEl).style.color = v === null || v === undefined ? '' : G.colorOf(v);
    $(sEl).style.background = v === null || v === undefined ? G.noDataColor() : G.colorOf(v);
  }
  function updateReadouts(idx) {
    tile('#tvGlob', '#swGlob', gMean[idx]);
    tile('#tvArc', '#swArc', aMean[idx]);
    tile('#tvTh', '#swTh', tMean[idx]);

    var best = -99, bestY = years[0];
    for (var i = 0; i <= idx; i++) if (gMean[i] !== null && gMean[i] > best) { best = gMean[i]; bestY = years[i]; }
    $('#tvHot').textContent = bestY;
    $('#tnHot').textContent = G.fmt(best) + (bestY === years[idx] ? ' · คือปีนี้เอง' : '');

    var bars = $('#stripes').querySelectorAll('i');
    for (var b = 0; b < bars.length; b++) bars[b].classList.toggle('future', b > idx);
    $('#stripeHead').style.left = ((idx + 0.5) / years.length * 100) + '%';
    $('#yearRange').value = String(pos);
  }

  /* ---------- ลูปวาด ---------- */
  function draw(force) {
    var idx = Math.round(pos); if (idx > years.length - 1) idx = years.length - 1;
    map.setPos(pos);
    if (force || idx !== lastDisp) { updateReadouts(idx); drawChart(idx); lastDisp = idx; }
  }

  // เดินด้วย setInterval ~25 ครั้ง/วินาที (ชุดเดียวกับแผนที่ CO₂ ในหน้า explore)
  // ไม่ใช้ requestAnimationFrame เพราะบางเบราว์เซอร์/เว็บวิวหรี่ rAF จนแอนิเมชันค้างไปเฉยๆ
  var STEP_MS = 40, timer = null, lastT = 0;
  // ก้าวตามเวลาจริง ไม่ใช่ก้าวละเท่าๆ กัน — เครื่องช้าจะวาดหยาบลงแต่ยังไล่ปีด้วยความเร็วเท่าเดิม
  function step() {
    var now = Date.now();
    var dt = lastT ? Math.min((now - lastT) / 1000, 0.5) : STEP_MS / 1000;
    lastT = now;
    pos += dt * YEARS_PER_SEC * speedMul;
    if (pos >= years.length - 1) { pos = years.length - 1; draw(false); setPlaying(false); return; }
    draw(false);
  }

  function setPlaying(p) {
    if (p && pos >= years.length - 1) { pos = 0; lastDisp = -1; }
    playing = p; lastT = 0;
    if (timer) { clearInterval(timer); timer = null; }
    if (p) timer = setInterval(step, STEP_MS);
    $('#btnPlayTx').textContent = p ? 'หยุด' : (pos >= years.length - 1 ? 'เล่นอีกครั้ง' : 'เล่น');
    $('#icoPlay').innerHTML = p ? '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>' : '<path d="M8 5v14l11-7z"/>';
  }

  /* ---------- การโต้ตอบ ---------- */
  function wire() {
    $('#btnPlay').addEventListener('click', function () { setPlaying(!playing); });
    $('#btnRestart').addEventListener('click', function () { pos = 0; draw(true); setPlaying(true); });

    var segs = document.querySelectorAll('.seg button');
    Array.prototype.forEach.call(segs, function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(segs, function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        speedMul = parseFloat(b.dataset.speed);
      });
    });

    $('#yearRange').addEventListener('input', function () {
      pos = parseFloat(this.value); setPlaying(false); draw(true);
    });

    $('#stripes').addEventListener('click', function (e) {
      var r = this.getBoundingClientRect();
      pos = Math.max(0, Math.min(years.length - 1, Math.floor((e.clientX - r.left) / r.width * years.length)));
      setPlaying(false); draw(true);
    });

    document.addEventListener('keydown', function (e) {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); setPlaying(!playing); }
      else if (e.code === 'ArrowRight') { pos = Math.min(years.length - 1, Math.floor(pos) + 1); setPlaying(false); draw(true); }
      else if (e.code === 'ArrowLeft') { pos = Math.max(0, Math.ceil(pos) - 1); setPlaying(false); draw(true); }
    });

    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(function () { drawChart(Math.round(pos)); }, 150);
    });
  }

  // เรียกจากปุ่มสลับธีมในหน้า HTML
  window.climateRedraw = function () {
    if (!D) return;
    map.refreshTheme(); paintStripes(); draw(true);
  };
})();
