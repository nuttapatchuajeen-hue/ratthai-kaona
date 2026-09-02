/* ===== index-oldyear.js — หน้า "รายเขต" โหมดปีเก่า (ก่อน พ.ศ. 2539) =====
   ปีเหล่านี้ไม่มีผลการเลือกตั้งรายเขต/รายจังหวัดในรูปดิจิทัล จึงไม่มีไฟล์ year-<id>.js
   → year-switch.js จะฉีด parliament-<id>.js (window.PDATA) มาแทน แล้วตั้ง window.EYOLD = true
   ไฟล์นี้วาด "ผังที่นั่งครึ่งวงกลม" แบบเดียวกับหน้ารัฐสภา ลงสีตามพรรค แทนแผนที่ประเทศ
   พร้อมซ่อนช่องค้นหา + รายชื่อจังหวัด แล้วขึ้นแบนเนอร์แจ้งว่าปีนี้มีแค่ภาพรวมที่นั่ง

   ⚠ ต้องวางไว้ "ก่อน" สคริปต์หลักของ index.html — สคริปต์หลักจะ return ทันทีเมื่อเจอ window.EYOLD
     (สคริปต์หลักอ่าน window.DATA ซึ่งปีเก่าไม่มี จะพังตั้งแต่บรรทัดแรก)                        */
(function () {
  if (!window.EYOLD || !window.PDATA) return;

  var NS = 'http://www.w3.org/2000/svg';
  var D = window.PDATA, PM = D.partyMeta || {};
  var recs = D.zone || [];
  var N = recs.length;
  if (!N) return;

  var colorOf = function (c) { return (PM[c] && PM[c].color) || '#B9AFA4'; };
  var shortOf = function (c) { return (PM[c] && PM[c].short) || c; };
  var thOf = function (c) { return (PM[c] && PM[c].th) || c; };

  var y = window.EYEAR, yid = window.EYID;
  var cur = (window.EYEARS || []).filter(function (o) { return o.id === yid; })[0] || {};

  /* ---------- นับที่นั่งรายพรรค แล้วเรียงบล็อกซ้าย→ขวา ---------- */
  var cnt = {};
  recs.forEach(function (r) { cnt[r.code] = (cnt[r.code] || 0) + 1; });
  var codes = Object.keys(cnt).sort(function (a, b) {
    if (a === 'อื่น ๆ') return 1;                       // ถังรวม "อื่น ๆ" ไว้ขวาสุดเสมอ
    if (b === 'อื่น ๆ') return -1;
    return cnt[b] - cnt[a] || shortOf(a).localeCompare(shortOf(b), 'th');
  });
  var seatCodes = [];
  codes.forEach(function (c) { for (var i = 0; i < cnt[c]; i++) seatCodes.push(c); });
  var winner = codes[0];

  /* ---------- เรขาคณิตผังที่นั่ง (พัดกว้าง ~230° เหมือนหน้ารัฐสภา) ---------- */
  var CX = 500, CY = 336, A0 = 205 * Math.PI / 180, A1 = -25 * Math.PI / 180;
  var rows = Math.max(4, Math.min(11, Math.round(Math.sqrt(N / 5))));   // 78 ที่นั่ง≈4 แถว · 393≈9 แถว
  var r0 = 152, r1 = 314;

  function buildSeats() {
    var radii = [], i;
    for (i = 0; i < rows; i++) radii.push(r0 + i * (r1 - r0) / (rows - 1));
    var sum = radii.reduce(function (a, b) { return a + b; }, 0);
    // largest remainder → จำนวนที่นั่งต่อแถวรวมได้ N พอดี (แถวนอกกว้างกว่าจึงได้ที่นั่งมากกว่า)
    var targets = radii.map(function (r) { return N * r / sum; });
    var counts = targets.map(Math.floor);
    var rem = N - counts.reduce(function (a, b) { return a + b; }, 0);
    targets.map(function (t, k) { return { i: k, f: t - Math.floor(t) }; })
      .sort(function (a, b) { return b.f - a.f; })
      .slice(0, rem).forEach(function (o) { counts[o.i]++; });
    var seats = [];
    counts.forEach(function (n, row) {
      var r = radii[row];
      for (var j = 0; j < n; j++) {
        var th = A0 - (j + 0.5) * (A0 - A1) / n;
        seats.push({ x: CX + r * Math.cos(th), y: CY - r * Math.sin(th), th: th, r: r });
      }
    });
    seats.sort(function (a, b) { return b.th - a.th || a.r - b.r; });   // ซ้าย→ขวา = ลิ่มพรรคตามแนวรัศมี
    return { seats: seats, counts: counts, radii: radii };
  }
  var built = buildSeats();
  var gap = (r1 - r0) / (rows - 1);
  var arcSpace = (A0 - A1) * r0 / Math.max(1, built.counts[0]);         // ระยะห่างตามส่วนโค้งของแถวในสุด
  var seatR = Math.max(3.2, Math.min(gap * 0.42, arcSpace * 0.42, 13));

  /* ---------- สไตล์เฉพาะโหมดปีเก่า ---------- */
  var CSS = ''
    + '.oldmode .searchbox{display:none}'
    + '.oldmode .zoomctl{display:none}'
    /* style.css เลื่อน .maparea ไปพ้นแผงซ้ายให้แล้ว (left:398px บนจอใหญ่) — ที่นี่แค่จัดผังให้อยู่กลาง */
    + '.oldmode .maparea{display:grid;place-items:center;padding:0 16px}'
    + '.oldseat{width:100%;height:100%;max-height:none;overflow:visible;user-select:none}'
    + '.oldseat .st{transition:opacity .16s}'
    + '.oldseat .st circle{stroke:var(--paper);stroke-width:.9;cursor:pointer}'
    + '.oldseat .st.dim{opacity:.13}'
    + '.oldseat .ctot{font-family:Kanit,sans-serif;font-weight:700;fill:var(--ink);text-anchor:middle}'
    + '.oldseat .csub{font-family:Sarabun,sans-serif;fill:var(--muted);text-anchor:middle;font-size:15px}'
    + '.oldseat .cwin{font-family:Kanit,sans-serif;font-weight:600;text-anchor:middle;font-size:16px}'
    /* แถบสัญลักษณ์: กดกรองพรรคได้ */
    + '.oldmode .legendbar .li{cursor:pointer;padding:2px 5px;border-radius:7px;transition:.13s}'
    + '.oldmode .legendbar .li:hover{background:var(--orange-soft)}'
    + '.oldmode .legendbar .li.off{opacity:.4}'
    + '.oldmode .legendbar .li.pick{background:var(--orange-soft);box-shadow:inset 0 0 0 1px var(--orange-line,#dbe4ea)}'
    /* แบนเนอร์แจ้ง "ปีนี้ไม่มีข้อมูลรายเขต" */
    + '.oldnote{margin:8px 6px 4px;padding:13px 15px;border-radius:14px;background:var(--orange-soft);'
    + 'border:1px solid var(--orange-line,#dbe4ea);font-size:.85rem;line-height:1.7;color:var(--ink-2,#2C4356)}'
    + '.oldnote b{font-family:Kanit,sans-serif;font-weight:600}'
    + '.oldnote .ttl{display:block;font-family:Kanit,sans-serif;font-weight:600;font-size:.95rem;margin-bottom:5px;color:var(--ink)}'
    + '.oldnote .lk{display:flex;flex-wrap:wrap;gap:8px;margin-top:11px}'
    + '.oldnote .lk a{font-family:Kanit,sans-serif;font-size:.8rem;font-weight:500;text-decoration:none;'
    + 'color:var(--orange-deep);background:var(--paper);border:1px solid var(--line-2);'
    + 'border-radius:10px;padding:7px 11px;transition:.13s}'
    + '.oldnote .lk a:hover{border-color:var(--orange);transform:translateY(-1px)}'
    /* แผงซ้ายไม่ต้องสูงเต็มจอ — มีแค่แบนเนอร์ */
    + '.oldmode .panel{bottom:auto;max-height:calc(100% - 190px)}'
    + '@media(max-width:860px){'
    /* มือถือ: วางผังไว้ "ด้านบน" ใต้การ์ดค้นหา แล้วกันที่ด้านล่างไว้ให้แผ่นแบนเนอร์ + เมนูล่าง */
    + '.oldmode .maparea{padding:92px 8px calc(42vh + 78px);place-items:start center}'
    + '.oldmode .grabber{display:none}'                     /* ไม่มีอะไรให้ปัดกาง — ตรึงแผ่นไว้ */
    + '.oldmode .panel{transform:none;bottom:74px;top:auto;max-height:42vh}'
    + '.oldmode .panel .panel-scroll{overflow:auto;touch-action:pan-y}}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  document.documentElement.classList.add('oldmode');   // <html> มีอยู่แล้วตอนสคริปต์รัน (body ยังโหลดไม่จบ)

  /* ---------- วาดผัง ---------- */
  var seatEls = [], filter = null;

  function arcPath(r, stroke, w, dash, op) {
    var p = document.createElementNS(NS, 'path');
    var x0 = CX + r * Math.cos(A0), y0 = CY - r * Math.sin(A0);
    var x1 = CX + r * Math.cos(A1), y1 = CY - r * Math.sin(A1);
    p.setAttribute('d', 'M ' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A ' + r + ' ' + r + ' 0 1 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1));
    p.setAttribute('fill', 'none'); p.setAttribute('stroke', stroke);
    p.setAttribute('stroke-width', w); if (dash) p.setAttribute('stroke-dasharray', dash);
    p.setAttribute('opacity', op);
    return p;
  }

  function draw() {
    var host = document.getElementById('maparea');
    if (!host) return;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'oldseat');
    svg.setAttribute('viewBox', '0 0 1000 470');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // แนวแถวที่นั่ง (เส้นประจาง ๆ เหมือนแปลนห้องประชุม) + ผนังโค้ง
    var bg = document.createElementNS(NS, 'g');
    built.radii.forEach(function (r) { bg.appendChild(arcPath(r, 'var(--line-2)', 1, '2 6', .45)); });
    bg.appendChild(arcPath(r1 + 16, 'var(--line-2)', 1.5, null, .9));
    bg.appendChild(arcPath(r1 + 22, '#C9A84C', 1.1, null, .5));
    svg.appendChild(bg);

    // ที่นั่ง
    var g = document.createElementNS(NS, 'g');
    built.seats.forEach(function (s, i) {
      var code = seatCodes[i];
      var grp = document.createElementNS(NS, 'g');
      grp.setAttribute('class', 'st'); grp.dataset.code = code;
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', s.x.toFixed(2)); c.setAttribute('cy', s.y.toFixed(2));
      c.setAttribute('r', seatR.toFixed(2)); c.setAttribute('fill', colorOf(code));
      grp.appendChild(c); g.appendChild(grp); seatEls.push(grp);
    });
    svg.appendChild(g);

    // ป้ายกลางผัง: จำนวนที่นั่ง + พรรคที่ได้มากที่สุด
    var t1 = document.createElementNS(NS, 'text');
    t1.setAttribute('class', 'ctot'); t1.setAttribute('x', CX); t1.setAttribute('y', CY - 46);
    t1.setAttribute('font-size', '44'); t1.textContent = N;
    var t2 = document.createElementNS(NS, 'text');
    t2.setAttribute('class', 'csub'); t2.setAttribute('x', CX); t2.setAttribute('y', CY - 20);
    t2.textContent = 'ที่นั่ง · เลือกตั้ง ' + y;
    var t3 = document.createElementNS(NS, 'text');
    t3.setAttribute('class', 'cwin'); t3.setAttribute('x', CX); t3.setAttribute('y', CY + 8);
    t3.setAttribute('fill', colorOf(winner));
    t3.textContent = (winner === 'ไม่มีพรรคการเมือง' || winner === 'อิสระ')
      ? shortOf(winner) + ' ' + cnt[winner] : 'มากที่สุด: ' + shortOf(winner) + ' ' + cnt[winner];
    svg.appendChild(t1); svg.appendChild(t2); svg.appendChild(t3);

    host.appendChild(svg);
    bindSeats(svg);
  }

  /* ---------- ทูลทิป + กรองพรรค (ใช้กล่อง #maptip เดิมของหน้าแผนที่) ---------- */
  var tip;
  function moveTip(evt) {
    var pad = 14, r = tip.getBoundingClientRect();
    var x = evt.clientX + pad, y = evt.clientY + pad;
    if (x + r.width > innerWidth - 8) x = evt.clientX - r.width - pad;
    if (y + r.height > innerHeight - 8) y = evt.clientY - r.height - pad;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function pct(n) { return (n * 100 / N).toFixed(1); }
  function bindSeats(svg) {
    tip = document.getElementById('maptip');
    var canHover = matchMedia('(hover:hover) and (pointer:fine)').matches;
    svg.addEventListener('click', function (e) {
      var g = e.target.closest && e.target.closest('.st');
      setFilter(g ? (filter === g.dataset.code ? null : g.dataset.code) : null);
    });
    if (!canHover || !tip) return;
    svg.addEventListener('mousemove', function (e) {
      var g = e.target.closest && e.target.closest('.st');
      if (!g) { tip.classList.remove('on'); return; }
      var code = g.dataset.code;
      tip.innerHTML = '<div class="tt-prov">' + thOf(code) + '</div>'
        + '<div class="tt-win"><span class="sw" style="background:' + colorOf(code) + '"></span>'
        + cnt[code] + ' ที่นั่ง · ' + pct(cnt[code]) + '%</div>'
        + '<div class="tt-mix">ปีนี้ไม่มีข้อมูลว่าที่นั่งนี้เป็นเขตใด — ผังแสดงสัดส่วนรายพรรค</div>';
      tip.classList.add('on'); moveTip(e);
    });
    svg.addEventListener('mouseleave', function () { tip.classList.remove('on'); });
  }
  function setFilter(code) {
    filter = code;
    seatEls.forEach(function (g) { g.classList.toggle('dim', !!filter && g.dataset.code !== filter); });
    var bar = document.getElementById('legendbar');
    if (!bar) return;
    Array.prototype.forEach.call(bar.querySelectorAll('.li'), function (li) {
      li.classList.toggle('off', !!filter && li.dataset.code !== filter);
      li.classList.toggle('pick', !!filter && li.dataset.code === filter);
    });
  }

  /* ---------- แถบสัญลักษณ์ + แบนเนอร์ในแผงซ้าย ---------- */
  function fillPanel() {
    var bar = document.getElementById('legendbar');
    if (bar) {
      bar.innerHTML = codes.map(function (c) {
        return '<span class="li" data-code="' + c + '" title="' + thOf(c) + ' · ' + pct(cnt[c]) + '%">'
          + '<span class="sw" style="background:' + colorOf(c) + '"></span>' + shortOf(c) + '<b>' + cnt[c] + '</b></span>';
      }).join('');
      bar.addEventListener('click', function (e) {
        var li = e.target.closest && e.target.closest('.li');
        if (li) setFilter(filter === li.dataset.code ? null : li.dataset.code);
      });
    }
    var box = document.getElementById('panelScroll');
    if (box) {
      box.innerHTML = '<div class="oldnote"><span class="ttl">ปีนี้ยังไม่มีข้อมูลรายเขต</span>'
        + 'การเลือกตั้ง <b>พ.ศ. ' + y + '</b>' + (cur.date ? ' · ' + cur.date : '')
        + ' — ผลการเลือกตั้งยุคก่อน พ.ศ. 2539 ยังไม่มีการรวบรวมเป็นข้อมูลดิจิทัลระดับเขต/รายจังหวัด '
        + 'จึงแสดงเป็น <b>ผังที่นั่งรวมทั้งสภา ' + N + ' ที่นั่ง</b> ลงสีตามพรรคแทนแผนที่ประเทศ'
        + '<br><span style="opacity:.85">แตะที่นั่งหรือชื่อพรรคในแถบด้านบน เพื่อดูเฉพาะพรรคนั้น</span>'
        + '<span class="lk">'
        + '<a href="standings.html?y=' + yid + '">คะแนนรายพรรค →</a>'
        + '<a href="parliament.html?y=' + yid + '">ผังรัฐสภา →</a>'
        + '<a href="timeline.html">ไทม์ไลน์ประวัติ →</a>'
        + '</span></div>';
    }
    // ที่มาท้ายแผง — ปีเก่าไม่ได้มาจากไฟล์ภาพถ่าย/ประกาศเขตของ กกต.
    var foot = document.querySelector('.panel-foot');
    if (foot) {
      foot.innerHTML = 'ที่นั่งรายพรรค: เรียบเรียงจาก <a href="' + (cur.wiki || '#') + '" target="_blank" rel="noopener">วิกิพีเดีย'
        + ' — การเลือกตั้ง ส.ส. พ.ศ. ' + y + '</a> · ผังที่นั่งเป็นภาพจำลองสัดส่วน ไม่ใช่ตำแหน่งนั่งจริงในห้องประชุม';
    }
    // วางแผงให้ชิดใต้การ์ดค้นหา (การ์ดเตี้ยลงเพราะซ่อนช่องค้นหา)
    var card = document.querySelector('.searchcard'), panel = document.getElementById('panel');
    function place() {
      if (!card || !panel) return;
      if (matchMedia('(max-width:860px)').matches) { panel.style.top = ''; return; }
      panel.style.top = (card.offsetTop + card.offsetHeight + 12) + 'px';
    }
    place(); addEventListener('resize', place);
  }

  function start() { document.body.classList.add('oldmode'); draw(); fillPanel(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
