/* ===== year-switch.js — ปุ่มสลับปีการเลือกตั้ง (มุมขวาบน) =====
   หน้าที่ 2 อย่าง
   1) เลือกปีจาก ?y=25xx หรือค่าที่จำไว้ แล้ว "โหลดไฟล์ข้อมูลของปีนั้น" (year-25xx.js)
   2) วาดแถบปุ่มปีใต้เมนู แล้วปรับหัวเรื่อง/ที่มา ให้ตรงกับปีที่เลือก

   ⚠ ต้องวางเป็น <script src="year-switch.js"></script> ธรรมดา (ห้าม defer/async)
     เพราะข้อ 1 ใช้ document.write ฉีดแท็กไฟล์ข้อมูล ต้องทำงานตอนเบราว์เซอร์อ่านหน้าอยู่
     และต้องวาง "หลัง" index-geo.js (รูปแผนที่ที่ใช้ร่วมกันทุกปี)                        */
(function () {
  var WM = 'https://th.wikipedia.org/wiki/การเลือกตั้งสมาชิกสภาผู้แทนราษฎรไทยเป็นการทั่วไป_';
  var W = WM + 'พ.ศ._';
  /* ปีที่มีในระบบ — เรียงใหม่→เก่า · soon:true = ยังไม่ได้ทำข้อมูล (ปุ่มจาง กดไม่ได้)
     ข้ามปี 2549 กับ 2557 เพราะศาลรัฐธรรมนูญวินิจฉัยให้การเลือกตั้งเป็นโมฆะ ไม่มี ส.ส. */
  var YEARS = [
    { y: 2569, date: '8 กุมภาพันธ์ 2569',  seats: '400 เขต + 100 บัญชีรายชื่อ', total: 500, wiki: W + '2569', set: 27 },
    { y: 2566, date: '14 พฤษภาคม 2566',   seats: '400 เขต + 100 บัญชีรายชื่อ', total: 500, wiki: W + '2566', set: 26 },
    { y: 2562, date: '24 มีนาคม 2562',    seats: '350 เขต + 150 บัญชีรายชื่อ', total: 500, wiki: W + '2562', set: 25 },
    { y: 2554, date: '3 กรกฎาคม 2554',    seats: '375 เขต + 125 บัญชีรายชื่อ', total: 500, wiki: W + '2554', set: 24 },
    { y: 2550, date: '23 ธันวาคม 2550',   seats: '400 เขต (157 เขต เขตละ 1–3 คน) + 80 สัดส่วน', total: 480, wiki: W + '2550', set: 23 },
    { y: 2548, date: '6 กุมภาพันธ์ 2548', seats: '400 เขต + 100 บัญชีรายชื่อ', total: 500, wiki: W + '2548', set: 22 },
    { y: 2544, date: '6 มกราคม 2544',     seats: '400 เขต + 100 บัญชีรายชื่อ', total: 500, wiki: W + '2544', set: 21 },
    { y: 2539, date: '17 พฤศจิกายน 2539', seats: '393 เขต (ยังไม่มีบัญชีรายชื่อ)', total: 393, wiki: W + '2539', set: 20, noList: true },
    /* ===== ปีเก่า (ก่อน 2539) — มีเฉพาะภาพรวมที่นั่งรายพรรค (summaryOnly) =====
       เลือกได้เฉพาะหน้า "คะแนนพรรค" · หน้าอื่นกดแล้วเด้งมาที่คะแนนพรรคของปีนั้น
       ปีที่มีเลือกตั้ง 2 ครั้ง (2500, 2535) ใช้ id ต่างกัน — ครั้งหลังลงท้าย 'b' */
    /* hasMap = มีไฟล์ year-<id>.js (ผลรายจังหวัด/รายเขตจากวิกิ) แล้ว → หน้ารายเขตใช้แผนที่จริง ไม่ใช่ผังที่นั่ง */
    { y: 2538, date: '2 กรกฎาคม 2538',    seats: '391 เขต', total: 391, wiki: W + '2538', summaryOnly: true, noList: true, hasMap: true, set: 19 },
    { y: 2535, id: '2535b', date: '13 กันยายน 2535', seats: '360 เขต', total: 360, wiki: WM + 'กันยายน_พ.ศ._2535', summaryOnly: true, noList: true, hasMap: true, set: 18 },
    { y: 2535, date: '22 มีนาคม 2535',    seats: '360 เขต', total: 360, wiki: WM + 'มีนาคม_พ.ศ._2535', summaryOnly: true, noList: true, hasMap: true, set: 17 },
    { y: 2531, date: '24 กรกฎาคม 2531',   seats: '357 เขต', total: 357, wiki: W + '2531', summaryOnly: true, noList: true, hasMap: true, set: 16 },
    { y: 2529, date: '27 กรกฎาคม 2529',   seats: '347 เขต', total: 347, wiki: W + '2529', summaryOnly: true, noList: true, hasMap: true, set: 15 },
    { y: 2526, date: '18 เมษายน 2526',    seats: '324 เขต', total: 324, wiki: W + '2526', summaryOnly: true, noList: true, hasMap: true, set: 14 },
    { y: 2522, date: '22 เมษายน 2522',    seats: '301 เขต', total: 301, wiki: W + '2522', summaryOnly: true, noList: true, hasMap: true, set: 13 },
    { y: 2519, date: '4 เมษายน 2519',     seats: '279 เขต', total: 279, wiki: W + '2519', summaryOnly: true, noList: true, hasMap: true, set: 12 },
    { y: 2518, date: '26 มกราคม 2518',    seats: '269 เขต', total: 269, wiki: W + '2518', summaryOnly: true, noList: true, hasMap: true, set: 11 },
    { y: 2512, date: '10 กุมภาพันธ์ 2512', seats: '219 คน (ไม่มีข้อมูลแยกเขต)', total: 219, wiki: W + '2512', summaryOnly: true, noList: true, hasMap: true, set: 10 },
    { y: 2500, id: '2500b', date: '15 ธันวาคม 2500', seats: '160 คน (ไม่มีข้อมูลแยกเขต)', total: 160, wiki: WM + 'ธันวาคม_พ.ศ._2500', summaryOnly: true, noList: true, hasMap: true, set: 9 },
    { y: 2500, date: '26 กุมภาพันธ์ 2500', seats: '160 คน (ไม่มีข้อมูลแยกเขต)', total: 160, wiki: WM + 'กุมภาพันธ์_พ.ศ._2500', summaryOnly: true, noList: true, hasMap: true, set: 8 },
    { y: 2495, date: '26 กุมภาพันธ์ 2495', seats: 'เลือกตั้ง 123 คน (ยังไม่มีพรรค)', total: 123, wiki: W + '2495', summaryOnly: true, noList: true, hasMap: true, set: 7 },
    { y: 2491, date: '29 มกราคม 2491',    seats: '99 คน (ไม่มีข้อมูลแยกเขต)', total: 99, wiki: W + '2491', summaryOnly: true, noList: true, hasMap: true, set: 5 },
    { y: 2489, date: '6 มกราคม 2489',     seats: '96 คน (ยังไม่มีพรรค)', total: 96, wiki: WM + 'มกราคม_พ.ศ._2489', summaryOnly: true, noList: true, hasMap: true, set: 4 },
    { y: 2481, date: '12 พฤศจิกายน 2481', seats: 'เลือกตั้ง 91 คน (ยังไม่มีพรรค)', total: 91, wiki: W + '2481', summaryOnly: true, noList: true, hasMap: true, set: 3 },
    { y: 2480, date: '7 พฤศจิกายน 2480',  seats: 'เลือกตั้ง 91 คน (ยังไม่มีพรรค)', total: 91, wiki: W + '2480', summaryOnly: true, noList: true, hasMap: true, set: 2 },
    { y: 2476, date: '15 พฤศจิกายน 2476', seats: 'ทางอ้อม 78 คน (ยังไม่มีพรรค)', total: 78, wiki: W + '2476', summaryOnly: true, noList: true, hasMap: true, set: 1 }
  ];
  YEARS.forEach(function (o) { o.note = o.date + ' · ' + o.seats; });
  var KEY = 'md-election-year', DEFAULT = 2569;
  // ชุดข้อมูลของหน้านี้ — หน้าตั้ง window.EYEARSET ไว้ก่อนโหลดไฟล์นี้
  // 'year' = รายเขต · 'partylist' · 'standings' · 'parliament'  → โหลด <ชุด>-<ปี>.js
  var SET = window.EYEARSET || 'year';

  /* ---------- 1) เลือกปี + โหลดข้อมูล ---------- */
  YEARS.forEach(function (o) { o.id = o.id || String(o.y); });   // id ข้อความ (ปีซ้ำใช้ 'b')
  var ok = {}; YEARS.forEach(function (o) { if (!o.soon) ok[o.id] = 1; });
  var fromUrl = false, yid = '';
  try { yid = (new URLSearchParams(location.search).get('y') || '').trim(); if (ok[yid]) fromUrl = true; } catch (e) { }
  if (!ok[yid]) { try { var ls = (localStorage.getItem(KEY) || '').trim(); if (ok[ls]) yid = ls; } catch (e) { } }
  if (!ok[yid]) yid = String(DEFAULT);
  var cur = YEARS.filter(function (o) { return o.id === yid; })[0];

  // ปีเก่า (ก่อน 2539): คะแนนพรรค + รัฐสภา + รายเขต(โหมดผังที่นั่ง) รับได้แล้ว · เหลือบัญชีรายชื่อ → เด้งไปคะแนนพรรค
  if (cur.summaryOnly && SET !== 'standings' && SET !== 'parliament' && SET !== 'year') {
    if (fromUrl) {                                   // ผู้ใช้ระบุปีเก่ามาตรง ๆ → เด้งไปหน้าคะแนนพรรคของปีนั้น
      try { localStorage.setItem(KEY, yid); } catch (e) { }
      location.replace('standings.html?y=' + yid); return;
    }
    yid = String(DEFAULT); cur = YEARS.filter(function (o) { return o.id === yid; })[0];   // มาจากค่าที่จำไว้ → ใช้ปีเริ่มต้นแทน (ไม่เด้ง)
  }
  var y = cur.y;   // ปี พ.ศ. (ตัวเลข) — ตรรกะเดิมทั้งหมดใช้ตัวนี้

  window.EYEAR = y;
  window.EYID = yid;
  window.EYEARS = YEARS;
  // ปี 2569 ยังเป็น "ว่าที่ ส.ส." · ปีย้อนหลังเป็น ส.ส. เต็มตัวแล้ว (สคริปต์ของหน้าเรียกใช้ได้)
  window.EYMP = (y === 2569 ? 'ว่าที่ ส.ส.' : 'ส.ส.');
  // ปี 2550 ใช้ระบบ "สัดส่วน" (8 กลุ่มจังหวัด) ไม่ใช่บัญชีรายชื่อ
  window.EYLIST = (y === 2550 ? 'แบบสัดส่วน' : 'แบบบัญชีรายชื่อ');
  /* ปีเก่าบนหน้ารายเขต: ไม่มีไฟล์ year-<id>.js (ไม่มีผลรายเขต/รายจังหวัดในรูปดิจิทัล)
     → ยืมข้อมูลที่นั่งของหน้ารัฐสภา (parliament-<id>.js = window.PDATA) มาวาด "ผังที่นั่งครึ่งวงกลม"
       แทนแผนที่ ผ่าน index-oldyear.js (สคริปต์หลักของหน้าจะข้ามตัวเองเมื่อเห็น window.EYOLD) */
  var LOADSET = SET;
  if (cur.summaryOnly && SET === 'year' && !cur.hasMap) { LOADSET = 'parliament'; window.EYOLD = true; }
  document.write('<scr' + 'ipt src="' + LOADSET + '-' + yid + '.js"><\/scr' + 'ipt>');

  /* ---------- 2) ปุ่มย่อ + เมนูปี ---------- */
  var CSS = ''
    /* ปุ่มย่อมุมขวาบน (ใต้เมนูหลัก) */
    + '.yearbtn{position:fixed;top:78px;right:14px;z-index:59;display:flex;align-items:center;gap:7px;'
    + 'font-family:Kanit,sans-serif;font-size:.86rem;font-weight:500;color:var(--ink,#16323f);'
    + 'background:var(--paper,#fff);border:1px solid var(--line,#dbe4ea);border-radius:14px;'
    + 'box-shadow:var(--shadow-lg,0 12px 30px -12px rgba(10,40,60,.3));padding:9px 12px;cursor:pointer;transition:.14s}'
    + '.yearbtn:hover{border-color:var(--orange,#5E7488)}'
    + '.yearbtn .yl{font-size:.72rem;color:var(--muted,#7b8b98)}'
    + '.yearbtn .yv{font-weight:600;letter-spacing:.01em}'
    + '.yearbtn .yc{width:9px;height:9px;border-right:1.8px solid currentColor;border-bottom:1.8px solid currentColor;'
    + 'transform:rotate(45deg) translate(-2px,-2px);opacity:.6;transition:transform .18s}'
    + '.yearbtn[aria-expanded="true"] .yc{transform:rotate(-135deg) translate(-3px,-3px)}'
    /* เมนูปี */
    + '.yearmenu{position:fixed;top:124px;right:14px;z-index:61;width:250px;max-height:min(72vh,520px);overflow:auto;'
    + 'background:var(--paper,#fff);border:1px solid var(--line,#dbe4ea);border-radius:16px;'
    + 'box-shadow:var(--shadow-lg,0 18px 44px -16px rgba(10,40,60,.45));padding:7px;display:none}'
    + '.yearmenu.open{display:block}'
    + '.yearmenu .yhead{font-family:Kanit,sans-serif;font-size:.7rem;color:var(--muted,#7b8b98);padding:6px 9px 8px}'
    + '.yearmenu .yb{display:block;width:100%;text-align:left;font-family:Kanit,sans-serif;color:var(--ink,#16323f);'
    + 'background:transparent;border:0;border-radius:11px;padding:8px 10px;cursor:pointer;transition:.12s}'
    + '.yearmenu .yb:hover:not(:disabled){background:var(--orange-soft,#eef2f5)}'
    + '.yearmenu .yb.on{background:var(--orange-deep,#41525e)}'
    + '.yearmenu .yb.on .y1,.yearmenu .yb.on .y2{color:var(--paper,#fff)}'
    + '.yearmenu .yb:disabled{opacity:.42;cursor:not-allowed}'
    + '.yearmenu .y1{display:flex;align-items:baseline;gap:7px;font-size:.95rem;font-weight:600;line-height:1.3}'
    + '.yearmenu .y1 em{font-style:normal;font-size:.68rem;font-weight:400;color:var(--muted,#7b8b98)}'
    + '.yearmenu .yb.on .y1 em{color:rgba(255,255,255,.75)}'
    + '.yearmenu .y2{font-size:.71rem;color:var(--muted,#7b8b98);line-height:1.45;margin-top:1px}'
    + '.yearveil{position:fixed;inset:0;z-index:60;background:transparent;display:none}'
    + '.yearveil.open{display:block}'
    /* แบนเนอร์ปีเก่าบนหน้าคะแนนพรรค */
    + '.eybanner{background:var(--orange-soft);border:1px solid var(--orange-line);border-radius:12px;'
    + 'padding:12px 16px;margin:2px 0 20px;font-size:.86rem;color:var(--ink-2,#2C4356);line-height:1.6}'
    + '.eybanner a{color:var(--orange-deep);text-decoration:underline;font-weight:500}'
    /* มือถือ: การ์ดค้นหากินพื้นที่บนสุด (สูง ~116px) → วางปุ่มใต้การ์ด บนพื้นที่แผนที่ */
    + '@media(max-width:860px){.yearbtn{top:134px;right:10px;padding:8px 11px}'
    + '.yearbtn .yl{display:none}'
    + '.yearmenu{top:auto;bottom:14px;left:10px;right:10px;width:auto;max-height:62vh}}';

  function mount() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

    /* ปุ่มย่อ: แสดงปีที่เลือกอยู่ · กดแล้วกางเมนู 8 ปี */
    var btn = document.createElement('button');
    btn.className = 'yearbtn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-label', 'เลือกปีการเลือกตั้ง');
    btn.innerHTML = '<span class="yl">เลือกตั้ง</span><span class="yv">' + y + '</span><span class="yc"></span>';

    var veil = document.createElement('div'); veil.className = 'yearveil';
    var menu = document.createElement('div');
    menu.className = 'yearmenu';
    menu.setAttribute('role', 'listbox');
    menu.innerHTML = '<div class="yhead">เลือกปีการเลือกตั้ง</div>' + YEARS.map(function (o) {
      return '<button class="yb' + (o.id === yid ? ' on' : '') + '" role="option"'
        + (o.soon ? ' disabled' : '') + ' data-y="' + o.id + '"'
        + (o.id === yid ? ' aria-selected="true"' : '') + '>'
        + '<span class="y1">' + o.y + '<em>' + o.date + '</em></span>'
        + '<span class="y2">' + (o.soon ? 'กำลังเตรียมข้อมูล' : o.seats) + '</span>'
        + '</button>';
    }).join('');

    function toggle(on) {
      menu.classList.toggle('open', on);
      veil.classList.toggle('open', on);
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    btn.addEventListener('click', function () { toggle(!menu.classList.contains('open')); });
    veil.addEventListener('click', function () { toggle(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
    menu.addEventListener('click', function (e) {
      var b = e.target.closest('.yb'); if (!b || b.disabled) return;
      var ny = b.dataset.y;
      if (ny === yid) { toggle(false); return; }
      try { localStorage.setItem(KEY, ny); } catch (err) { }
      var t = YEARS.filter(function (o) { return o.id === ny; })[0];
      // ปีเก่าบนหน้าบัญชีรายชื่อ → ไปหน้าคะแนนพรรคของปีนั้น (คะแนนพรรค/รัฐสภา/รายเขตโหลดเองได้)
      if (t && t.summaryOnly && SET !== 'standings' && SET !== 'parliament' && SET !== 'year') { location.href = 'standings.html?y=' + ny; return; }
      var u = new URL(location.href); u.searchParams.set('y', ny); location.href = u.toString();
    });
    document.body.appendChild(veil);
    document.body.appendChild(btn);
    document.body.appendChild(menu);

    /* ปรับหัวเรื่อง/ที่มา ให้ตรงปี */
    var cur = YEARS.filter(function (o) { return o.y === y; })[0] || {};
    var info = window.EYEARINFO || { year: y, note: cur.note, wiki: cur.wiki };
    var bt = document.querySelector('.bt');
    if (bt) {
      // จำนวน ส.ส. ไม่เท่ากันทุกปี (2550 = 480 · 2539 = 393)
      var head = (y === 2569 ? 'ว่าที่ ส.ส. ' : 'ส.ส. ') + (cur.total || 500);
      if (bt.firstChild && bt.firstChild.nodeType === 3) bt.firstChild.nodeValue = head;
      var sm = bt.querySelector('small'); if (sm) sm.textContent = 'เลือกตั้ง ' + y;
    }
    if (y !== 2569) {
      /* ปีย้อนหลังไม่ใช่ "ว่าที่" แล้ว — ไล่แก้ข้อความคงที่ทั้งหน้า (ข้อความที่สคริปต์สร้างทีหลังใช้ window.EYMP) */
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: function (t) {
          var p = t.parentNode && t.parentNode.nodeName;
          return (p === 'SCRIPT' || p === 'STYLE') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      });
      var n;
      while ((n = w.nextNode())) {
        if (n.nodeValue.indexOf('ว่าที่') < 0) continue;
        n.nodeValue = n.nodeValue.replace(/ว่าที่ ส\.ส\./g, 'ส.ส.')
          .replace(/ว่าที่สมาชิกสภาผู้แทนราษฎร/g, 'สมาชิกสภาผู้แทนราษฎร');
      }
      Array.prototype.forEach.call(document.querySelectorAll('input[placeholder]'), function (el) {
        el.placeholder = el.placeholder.replace('ว่าที่ ส.ส.', 'ส.ส.');
      });
    }
    /* ข้อความที่ใช้ได้เฉพาะบางปี เช่น หมายเหตุ "ยังไม่จัดตั้งรัฐบาล" ของปี 2569 */
    Array.prototype.forEach.call(document.querySelectorAll('[data-year-only]'), function (el) {
      if (String(el.getAttribute('data-year-only')) !== String(y)) el.remove();
    });
    if (y !== 2569) {
      document.title = /25\d\d/.test(document.title)
        ? document.title.replace(/25\d\d/, y)
        : document.title + ' · เลือกตั้ง ' + y;
      document.title = document.title.replace('ว่าที่ ส.ส.', 'ส.ส.').replace(' + สว. 200', '');
      /* แทนจำนวน ส.ส. ต้องจับ "500" ที่เป็นตัวเลขเดี่ยว ๆ เท่านั้น
         ไม่งั้นปี 2500 จะโดนแทนที่เลขปีตัวเอง (2500 → 2160) ถ้าปีมาก่อนจำนวนคนในหัวเรื่อง */
      if (cur.total && cur.total !== 500) {
        document.title = document.title.replace(/(^|[^\d])500(?!\d)/, '$1' + cur.total);
      }
    }

    // หน้าลูก (บัญชีรายชื่อ/คะแนนพรรค/รัฐสภา) มีหัวข้อท้ายหน้า "ว่าที่ ส.ส. 500 · 2569"
    var fh = document.querySelector('.foot-in h4');
    if (fh && y !== 2569) fh.textContent = 'ส.ส. 500 · ' + y;

    /* หน้าบัญชีรายชื่อ: จำนวนคนไม่เท่ากันทุกปี (100/125/150/80) และปี 2550 เรียกว่า "สัดส่วน" */
    var nList = (window.DATA && window.DATA.list && window.DATA.list.length) || 0;
    var h1 = document.querySelector('.sec-head h1, .pagehead h1');

    /* ปีก่อน 2544 ยังไม่มีระบบบัญชีรายชื่อ — หน้านั้นจึงไม่มีอะไรให้แสดง
       (เช็กจาก YEARS ไม่ใช่ EYEARINFO เพราะไฟล์ข้อมูลของหน้าลูกไม่ได้ตั้ง EYEARINFO) */
    var grid = document.getElementById('l-grid');
    if (cur.noList && grid) {
      grid.innerHTML = '<div class="empty">การเลือกตั้ง พ.ศ. ' + y + ' ยังไม่มี ส.ส. แบบบัญชีรายชื่อ'
        + '<br><small style="opacity:.75">ระบบบัญชีรายชื่อเริ่มใช้ครั้งแรกในการเลือกตั้ง พ.ศ. 2544 · '
        + 'ปีนี้มีเฉพาะ ส.ส. แบบแบ่งเขต ' + (cur.total || '') + ' คน</small></div>';
      if (h1) h1.innerHTML = h1.innerHTML.replace(/·\s*\d+\s*คน/, '· ไม่มีในปีนี้');
      var toolbar = document.querySelector('.l-tools, .filters, .toolbar');
      if (toolbar) toolbar.style.display = 'none';
      else ['l-search', 'l-party'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.parentElement) el.parentElement.style.display = 'none';
      });
    } else if (h1 && nList) {
      h1.innerHTML = h1.innerHTML.replace(/·\s*\d+\s*คน/, '· ' + nList + ' คน');
    }
    if (window.EYLIST !== 'แบบบัญชีรายชื่อ') {
      if (h1 && /บัญชีรายชื่อ/.test(h1.textContent)) h1.innerHTML = h1.innerHTML.replace('บัญชีรายชื่อ', 'สัดส่วน');
      var sub = document.querySelector('.sec-head p');
      if (sub) sub.textContent = sub.textContent.replace(/บัญชีรายชื่อ/g, 'สัดส่วน');
    }

    /* แหล่งข้อมูลท้ายหน้าของหน้าลูก — ปีย้อนหลังมาจากวิกิพีเดีย ไม่ใช่ไฟล์ xlsx ของปี 2569 */
    if (y !== 2569) {
      var setLink = cur.set ? ' · <a href="https://th.wikipedia.org/wiki/สภาผู้แทนราษฎรไทย_ชุดที่_' + cur.set
        + '" target="_blank" rel="noopener">สภาผู้แทนราษฎรไทย ชุดที่ ' + cur.set + '</a>' : '';
      var li = document.querySelector('.foot-in ul li');
      if (li) li.innerHTML = '• ผลการเลือกตั้ง: วิกิพีเดีย — '
        + '<a href="' + cur.wiki + '" target="_blank" rel="noopener">การเลือกตั้ง ส.ส. พ.ศ. ' + y + '</a>' + setLink;
      var cite = document.querySelector('.foot-in .cite');
      if (cite) cite.textContent = 'วิกิพีเดีย. (' + y + '). การเลือกตั้งสมาชิกสภาผู้แทนราษฎรไทยเป็นการทั่วไป พ.ศ. ' + y
        + (cur.set ? ' และ สภาผู้แทนราษฎรไทย ชุดที่ ' + cur.set : '') + ' (อ้างผลนับคะแนน กกต./วิกิพีเดีย).';
    }

    var foot = document.querySelector('.panel-foot');
    // ปีเก่าที่มีแผนที่แล้ว (year-<id>.js จากวิกิ) ส่งข้อความที่มาของตัวเองมาใน EYEARINFO.foot
    if (foot && info.foot) foot.innerHTML = info.foot;
    else if (foot && y !== 2569 && !window.EYOLD) {   // ปีเก่าโหมดผังที่นั่ง: index-oldyear.js เขียนที่มาเอง
      foot.innerHTML = (info.note || 'ผลการเลือกตั้ง ' + y) + ' · พื้นที่เขตเลือกตั้งและรายชื่อ ส.ส. '
        + 'เรียบเรียงจาก <a href="' + (info.wiki || '#') + '" target="_blank" rel="noopener">วิกิพีเดีย</a> '
        + '(อ้างผลนับคะแนน กกต.)';
    }

    /* หน้าคะแนนพรรค + ปีเก่า (summaryOnly): ซ่อนเพลงประจำพรรค (เป็นของยุคใหม่) + ขึ้นแบนเนอร์แจ้ง */
    if (SET === 'standings' && cur.summaryOnly) {
      var songsEl = document.getElementById('songs');
      if (songsEl) {
        var pb = songsEl.closest('.panelbox');
        if (pb) { pb.style.display = 'none';
          var sh = pb.previousElementSibling;
          if (sh && sh.classList && sh.classList.contains('sec-head')) sh.style.display = 'none';
        }
      }
      var wrapEl = document.querySelector('.wrap');
      if (wrapEl) {
        var bn = document.createElement('div'); bn.className = 'eybanner';
        bn.innerHTML = '🗳️ การเลือกตั้ง <b>พ.ศ. ' + y + '</b> · ' + cur.date
          + ' — ยุคก่อน พ.ศ. 2539 ยังไม่มีข้อมูลผลรายเขต/แผนที่รายบุคคลในรูปดิจิทัล จึงแสดงเฉพาะ'
          + '<b>ภาพรวมที่นั่งรายพรรค</b> · <a href="timeline.html">ดูไทม์ไลน์ประวัติ →</a>';
        wrapEl.insertBefore(bn, wrapEl.querySelector('.sec-head') || wrapEl.firstChild);
      }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
