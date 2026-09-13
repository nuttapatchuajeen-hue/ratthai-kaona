/* ===== เมนูกลางของเว็บเลือกตั้ง — navpill (เดสก์ท็อป) + mobnav (มือถือ) =====
   แก้เมนูที่ไฟล์นี้ไฟล์เดียว มีผลครบทุกหน้า — หน้าที่ใช้ให้ใส่ <script src="nav.js" defer></script>
   สคริปต์ฉีดเมนูเองตอนโหลด แล้วไฮไลต์ปุ่มของหน้าปัจจุบันอัตโนมัติ
   (committees.html เป็นหน้าลูกของรัฐสภา → ไฮไลต์ "รัฐสภา")

   ปุ่มแรกของทั้ง 2 แถบ = "เว็บหลัก" เปิดแผงเมนูหลักของ รัฐไทยก้าวหน้า ครบ 7 รายการ
   (เดสก์ท็อป = ดรอปดาวน์ใต้พิล · มือถือ = ชีตเหนือแถบล่าง) แผง+สไตล์ฉีดจากไฟล์นี้ทั้งหมด */
(function () {
  var NAVPILL = `<nav class="navpill">
  <a href="#" class="smbtn" role="button" aria-expanded="false" aria-controls="siteMenuPop" style="border-right:1px solid var(--line);border-radius:11px 4px 4px 11px;margin-right:2px;" title="เมนูหลัก รัฐไทยก้าวหน้า"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>เว็บหลัก</a>
  <a href="index.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>รายเขต</a>
  <a href="partylist.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>บัญชีรายชื่อ</a>
  <a href="standings.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/></svg>คะแนนพรรค</a>
  <a href="parliament.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19a8 8 0 0 1 16 0"/><circle cx="12" cy="7" r="1.2" fill="currentColor"/><circle cx="7.5" cy="9" r="1.2" fill="currentColor"/><circle cx="16.5" cy="9" r="1.2" fill="currentColor"/></svg>รัฐสภา</a>
  <a href="timeline.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>ประวัติ</a>
  <a href="referendum.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2.5h8.5L19 7v14.5H6Z"/><path d="M14.5 2.5V7H19"/><path d="m9 14 2.2 2.2L15 12.4"/></svg>ประชามติ</a>
  <a href="bangkok.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M6 21V8l6-4 6 4v13M10 21v-5h4v5"/><path d="M9 11h.01M15 11h.01"/></svg>กทม.</a>
</nav>`;

  var MOBNAV = `<nav class="mobnav" aria-label="เมนูหลัก">
  <a href="#" class="smbtn" role="button" aria-expanded="false" aria-controls="siteMenuPop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>เว็บหลัก</a>
  <a href="index.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>รายเขต</a>
  <a href="partylist.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>บัญชีฯ</a>
  <a href="standings.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/></svg>คะแนน</a>
  <a href="parliament.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19a8 8 0 0 1 16 0"/><circle cx="12" cy="7" r="1.2" fill="currentColor"/><circle cx="7.5" cy="9" r="1.2" fill="currentColor"/><circle cx="16.5" cy="9" r="1.2" fill="currentColor"/></svg>รัฐสภา</a>
  <a href="timeline.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>ประวัติ</a>
  <a href="referendum.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 2.5h8.5L19 7v14.5H6Z"/><path d="M14.5 2.5V7H19"/><path d="m9 14 2.2 2.2L15 12.4"/></svg>ประชามติ</a>
  <a href="bangkok.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 21h18M6 21V8l6-4 6 4v13M10 21v-5h4v5"/></svg>กทม.</a>
</nav>`;

  /* แถบเครดิตท้ายหน้า — แหล่งที่มาข้อมูลและสัญญาอนุญาตของทั้งเว็บ */
  var SITEFOOT = `<footer class="sitefoot">
  <a href="credits.html">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>
    แหล่งที่มาข้อมูลและสัญญาอนุญาตทั้งหมด
  </a>
  <span>จัดทำเพื่อการศึกษา · ไม่ใช่เอกสารราชการ · ไม่มีความเกี่ยวข้องกับพรรคการเมืองหรือหน่วยงานใด</span>
</footer>`;

  var SITEFOOT_CSS = `
.sitefoot{max-width:1180px;margin:38px auto 0;padding:16px 20px 26px;
  border-top:1px solid var(--line);display:flex;align-items:center;gap:8px 16px;flex-wrap:wrap;
  font-family:'Sarabun',system-ui,sans-serif;font-size:.76rem;color:var(--muted);line-height:1.6}
.sitefoot a{display:inline-flex;align-items:center;gap:6px;color:var(--muted);
  text-decoration:underline;text-underline-offset:3px;transition:color .15s}
.sitefoot a:hover{color:var(--ink)}
.sitefoot svg{flex:0 0 auto;opacity:.8}
@media(max-width:860px){.sitefoot{margin-top:26px;padding:14px 14px 92px}}`;

  /* แผงเมนูหลักของเว็บ — 7 รายการเดียวกับ hub/structure (ส.ส. = เว็บที่กำลังดูอยู่) */
  var SITEMENU = `<div class="smveil" id="siteMenuVeil" hidden></div>
<div class="smpop" id="siteMenuPop" role="menu" aria-label="เมนูหลัก รัฐไทยก้าวหน้า" hidden>
  <div class="smhead">รัฐไทยก้าวหน้า · เมนูหลัก</div>
  <a class="smlink" role="menuitem" href="../hub/index.html"><span class="smico"><svg class="mdico"><use href="#i-house"></use></svg></span>หน้าแรก</a>
  <a class="smlink" role="menuitem" href="../structure.html"><span class="smico"><svg class="mdico"><use href="#i-map"></use></svg></span>แผนผังโครงสร้าง</a>
  <a class="smlink cur" role="menuitem" href="index.html" aria-current="true"><span class="smico"><svg class="mdico"><use href="#i-vote"></use></svg></span>ส.ส. ผู้แทนราษฎร<span class="smnow">อยู่ที่นี่</span></a>
  <a class="smlink" role="menuitem" href="../cabinet/index.html"><span class="smico"><svg class="mdico"><use href="#i-crown"></use></svg></span>ชุดคณะรัฐมนตรี</a>
  <a class="smlink" role="menuitem" href="../stats/index.html"><span class="smico"><svg class="mdico"><use href="#i-chart-column"></use></svg></span>ข้อมูลสถิติ</a>
  <a class="smlink" role="menuitem" href="../hub/about.html"><span class="smico"><svg class="mdico"><use href="#i-user"></use></svg></span>เกี่ยวกับเรา</a>
  <a class="smlink" role="menuitem" href="../hub/survey.html"><span class="smico"><svg class="mdico"><use href="#i-clipboard-list"></use></svg></span>แบบประเมิน</a>
</div>`;

  var SITEMENU_CSS = `
/* ===== แผงเมนูหลักของเว็บ (ฉีดจาก nav.js) ===== */
.navpill{z-index:132}
.navpill .smbtn[aria-expanded="true"]{background:var(--orange-soft);color:var(--orange-deep)}
.smveil{position:fixed;inset:0;z-index:125;background:transparent;opacity:0;transition:opacity .18s}
.smveil.open{opacity:1}
.smpop{position:fixed;top:68px;right:14px;z-index:130;width:264px;
  background:var(--paper);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow-lg);
  padding:8px;opacity:0;transform:translateY(-8px) scale(.98);transform-origin:top right;
  transition:opacity .18s,transform .18s}
.smpop.open{opacity:1;transform:none}
.smhead{font-family:'Kanit',sans-serif;font-size:.72rem;font-weight:600;letter-spacing:.06em;
  color:var(--muted);padding:6px 12px 9px}
.smlink{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:11px;
  font-family:'Kanit',sans-serif;font-weight:500;font-size:.92rem;color:var(--ink-2);transition:.15s}
.smlink:hover{background:var(--orange-soft);color:var(--orange-deep)}
.smico{flex:none;width:20px;text-align:center;font-size:1.02rem;line-height:1}
.smlink.cur{background:var(--ink);color:#fff}
.smlink.cur:hover{background:var(--ink);color:#fff}
.smnow{margin-left:auto;font-family:'Sarabun',sans-serif;font-size:.68rem;font-weight:400;opacity:.72}
html[data-theme="dark"] .smlink.cur,html[data-theme="dark"] .smlink.cur:hover{background:var(--orange);color:#081019}
/* มือถือ: แผงกลายเป็นชีตเหนือแถบล่าง (mobnav สูง ~83px) */
@media(max-width:860px){
  .smveil{background:rgba(6,20,30,.42);backdrop-filter:blur(2px)}
  .smpop{top:auto;left:10px;right:10px;width:auto;padding:9px;border-radius:18px;
    bottom:calc(90px + env(safe-area-inset-bottom,0px));
    transform:translateY(10px) scale(.99);transform-origin:bottom center}
  .smlink{padding:12px 13px;font-size:.98rem}
}
@media(prefers-reduced-motion:reduce){.smpop,.smveil{transition:none}}
`;

  function inject() {
    var body = document.body;
    if (!body || document.querySelector('.navpill')) return; // กันฉีดซ้ำ

    var st = document.createElement('style');
    st.id = 'siteMenuCss';
    st.textContent = SITEMENU_CSS + SITEFOOT_CSS;
    document.head.appendChild(st);

    body.insertAdjacentHTML('afterbegin', NAVPILL);
    // แถบเครดิตต้องมาก่อน mobnav เพื่อให้อยู่ท้ายเนื้อหาจริง ไม่ใช่ท้ายสุดของ body
    if (!document.querySelector('.sitefoot') && !/\/credits\.html$/.test(location.pathname))
      body.insertAdjacentHTML('beforeend', SITEFOOT);
    body.insertAdjacentHTML('beforeend', MOBNAV);
    body.insertAdjacentHTML('beforeend', SITEMENU);

    var page = (location.pathname.split('/').pop() || 'index.html');
    if (!/\.html$/.test(page)) page = 'index.html';
    if (page === 'committees.html') page = 'parliament.html';

    var links = document.querySelectorAll('.navpill a, .mobnav a');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('href') === page) {
        links[i].classList.add('active');
        links[i].setAttribute('aria-current', 'page');
      }
    }

    /* ---- แผงเมนูหลัก: เปิด/ปิด ---- */
    var pop = document.getElementById('siteMenuPop');
    var veil = document.getElementById('siteMenuVeil');
    var btns = document.querySelectorAll('.smbtn');
    var open = false;

    function setOpen(v) {
      if (v === open) return;
      open = v;
      for (var j = 0; j < btns.length; j++) btns[j].setAttribute('aria-expanded', v ? 'true' : 'false');
      if (v) {
        pop.hidden = false; veil.hidden = false;
        // บังคับ reflow ก่อนติดคลาส ไม่งั้นทรานซิชันไม่วิ่ง (เพิ่งเลิก hidden)
        void pop.offsetWidth;
        pop.classList.add('open'); veil.classList.add('open');
      } else {
        pop.classList.remove('open'); veil.classList.remove('open');
        setTimeout(function () { if (!open) { pop.hidden = true; veil.hidden = true; } }, 200);
      }
    }

    for (var k = 0; k < btns.length; k++) {
      btns[k].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(!open);
      });
    }
    veil.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && open) setOpen(false);
    });
  }

  /* แถบ ⓘ "ข้อมูล ณ …" + กล่องที่มาข้อมูล — ตัวแถบอยู่ใน ../js/data-notice.js ข้อความแยกตามหน้า
     หน้าเลือกตั้งไม่มีหัวเว็บในลำดับเนื้อหา จึงเป็นการ์ดลอยใต้ navpill (มือถือ = เหนือ mobnav)
     credits.html ไม่ต้องมี (เป็นหน้ารวมแหล่งที่มาเอง) */
  var SRC = {
    ect69: { t: 'ผลเลือกตั้ง ส.ส. 2569 อย่างเป็นทางการ (นับครบ 100%)', o: 'สำนักงานคณะกรรมการการเลือกตั้ง (กกต.) · ปรับปรุง 15 พ.ค. 2569', u: 'https://ectreport69.ect.go.th' },
    wiki69: { t: 'การเลือกตั้งสมาชิกสภาผู้แทนราษฎรไทยเป็นการทั่วไป พ.ศ. 2569', o: 'วิกิพีเดีย', u: 'https://th.wikipedia.org/wiki/การเลือกตั้งสมาชิกสภาผู้แทนราษฎรไทยเป็นการทั่วไป_พ.ศ._2569' },
    wikiOld: { t: 'ผลเลือกตั้งปีก่อนหน้า (เมนูเลือกปี)', o: 'วิกิพีเดีย — เรียบเรียงจากผลนับคะแนนของ กกต. รายปี', u: 'https://th.wikipedia.org/' },
    ect: { t: 'สำนักงานคณะกรรมการการเลือกตั้ง', o: 'กกต.', u: 'https://www.ect.go.th' },
    parl: { t: 'สภาผู้แทนราษฎร', o: 'สำนักงานเลขาธิการสภาผู้แทนราษฎร', u: 'https://www.parliament.go.th' },
    maps: { t: 'แผนที่จังหวัด', o: 'simplemaps.com', u: 'https://simplemaps.com/gis/country/th' }
  };
  var EDU = 'จัดทำเพื่อการศึกษา · ไม่ใช่เอกสารราชการ · ไม่มีความเกี่ยวข้องกับพรรคการเมืองหรือหน่วยงานใด';
  function r69(sources) {
    return {
      asof: 'ผลเลือกตั้ง ส.ส. 2569 ตามประกาศ กกต. ณ 15 พ.ค. 2569',
      detail: ' — เลือกตั้ง 8 ก.พ. 2569 นับครบ 100% · ปีก่อนหน้าเรียบเรียงจากวิกิพีเดีย โปรดตรวจสอบกับ กกต. ก่อนนำไปอ้างอิง',
      sub: 'ผลการเลือกตั้งสมาชิกสภาผู้แทนราษฎร 8 กุมภาพันธ์ 2569 — แบบแบ่งเขต 400 ที่นั่ง และบัญชีรายชื่อ 100 ที่นั่ง',
      warn: '<b>ผลปี 2569 เป็นผลอย่างเป็นทางการของ กกต. (ปรับปรุง 15 พ.ค. 2569)</b><br>ปีก่อนหน้าในเมนูเลือกปีเรียบเรียงจากวิกิพีเดีย · ' + EDU,
      sources: sources
    };
  }
  var DATA_NOTICE = {
    'index.html': r69([SRC.ect69, SRC.wiki69, SRC.wikiOld]),
    'partylist.html': r69([SRC.ect69, SRC.wiki69, SRC.wikiOld, SRC.maps]),
    'standings.html': r69([SRC.ect69, SRC.wiki69, SRC.wikiOld, SRC.maps]),
    'parliament.html': r69([SRC.ect69, SRC.parl, SRC.wikiOld]),
    'committees.html': {
      asof: 'รายชื่อคณะกรรมาธิการ สภาผู้แทนราษฎร ชุดที่ 27',
      detail: ' — องค์ประกอบกรรมาธิการเปลี่ยนได้ระหว่างสมัยประชุม โปรดตรวจสอบกับเว็บไซต์รัฐสภาก่อนนำไปอ้างอิง',
      sub: 'คณะกรรมาธิการสามัญของสภาผู้แทนราษฎร ชุดที่ 27 พร้อมประธานและกรรมาธิการ',
      warn: EDU,
      sources: [SRC.parl, { t: 'ประวัติกรรมาธิการรายบุคคล', o: 'วิกิพีเดีย · They Work For Us (ลิงก์อยู่ในรายชื่อแต่ละคน)', u: 'https://theyworkforus.elect.in.th' }]
    },
    'timeline.html': {
      asof: 'ประวัติเลือกตั้ง 2476–2569 · สืบค้นเมื่อ 13 ส.ค. 2569',
      detail: ' — เรียบเรียงจากวิกิพีเดีย และผลนับคะแนน กกต. ตั้งแต่ปี 2544 · ตัวเลขบางครั้งก่อน พ.ศ. 2500 เป็นค่าโดยประมาณ',
      sub: 'การเลือกตั้ง ส.ส. เป็นการทั่วไปทุกครั้ง พ.ศ. 2476–2569 รวมครั้งที่ศาลวินิจฉัยเป็นโมฆะ (2549, 2557) และรัฐประหารที่เกี่ยวข้อง',
      warn: '<b>ตัวเลขในยุคก่อน พ.ศ. 2500 อาจต่างกันเล็กน้อยตามแหล่งอ้างอิง</b> (เครื่องหมาย ~ = โดยประมาณ)<br>' + EDU,
      sources: [
        { t: 'ผลการเลือกตั้งแต่ละครั้ง', o: 'วิกิพีเดีย — หน้า “การเลือกตั้งสมาชิกสภาผู้แทนราษฎรไทยเป็นการทั่วไป พ.ศ. …” ของแต่ละปี', u: SRC.wiki69.u, l: 'ตัวอย่าง: หน้า พ.ศ. 2569' },
        { t: 'ผลนับคะแนน ปี 2544 เป็นต้นมา', o: 'สำนักงานคณะกรรมการการเลือกตั้ง (กกต.)', u: SRC.ect.u }
      ]
    },
    'referendum.html': {
      asof: 'ประชามติ 14 ก.พ. 2569 · ผลอย่างไม่เป็นทางการ',
      detail: ' — รวบรวมโดย iLaw จากข้อมูล กกต. · รายจังหวัดนอกจาก 5 อันดับแรกและ 7 จังหวัดที่ไม่เห็นชอบเป็นค่าประมาณการ',
      sub: 'ผลการออกเสียงประชามติ “ท่านเห็นชอบว่าสมควรมีรัฐธรรมนูญฉบับใหม่หรือไม่?” 14 กุมภาพันธ์ 2569',
      warn: '<b>ไม่ใช่การรายงานผลอย่างเป็นทางการของ กกต.</b><br>ตัวเลขรายจังหวัดอื่นประมาณการถ่วงน้ำหนักตามจำนวนเขตเลือกตั้ง โดยคุมผลรวมรายภาคให้ตรงรายงานจริงทุกภาค · ' + EDU,
      sources: [{ t: 'ผลคะแนนรวม รายภาค และจังหวัดเด่น', o: 'iLaw จากข้อมูล กกต. อย่างไม่เป็นทางการ', u: 'https://www.ilaw.or.th' }, SRC.ect, SRC.maps],
      more: { href: 'credits.html#referendum', label: 'ดูแหล่งที่มาข้อมูลและสัญญาอนุญาตทั้งหมด' }
    },
    'bangkok.html': {
      asof: 'เลือกตั้ง กทม. 28 มิ.ย. 2569 · ผลอย่างไม่เป็นทางการ',
      detail: ' — ข้อมูลชุดนี้บันทึกไว้ขณะรอ กกต. ประกาศรับรอง · ปีย้อนหลังเรียบเรียงจากวิกิพีเดีย โปรดตรวจสอบกับ กกต. ก่อนนำไปอ้างอิง',
      sub: 'ผลเลือกตั้งผู้ว่าราชการกรุงเทพมหานคร และสมาชิกสภากรุงเทพมหานคร (ส.ก.) 50 เขต',
      warn: '<b>ผลปี 2569 เป็นผลอย่างไม่เป็นทางการจากการนับคะแนน</b><br>' + EDU,
      sources: [
        { t: 'การเลือกตั้งผู้ว่าฯ กทม. / ส.ก. พ.ศ. 2569', o: 'วิกิพีเดีย', u: 'https://th.wikipedia.org/wiki/การเลือกตั้งผู้ว่าราชการกรุงเทพมหานคร_พ.ศ._2569' },
        { t: 'ผลนับคะแนนคืนเลือกตั้ง', o: 'Thai PBS / ไทยรัฐ (bkkelection69)' },
        SRC.ect
      ]
    }
  };

  function loadNotice() {
    var file = (location.pathname.split('/').pop() || 'index.html');
    if (!/\.html$/.test(file)) file = 'index.html';
    var cfg = DATA_NOTICE[file];
    if (!cfg || window.MD_DATA_NOTICE) return;
    cfg.key = 'md-election-notice-' + file.replace(/\.html$/, '');
    cfg.accent = 'var(--orange)';     // --orange ของเว็บเลือกตั้ง = สีเงิน (เป็นกลางทางการเมือง)
    cfg.top = '128px';                // ใต้ navpill + ปุ่มเลือกปี (.yearbtn อยู่ top 78px)
    cfg.above = '#panel';             // มือถือ: หน้าแผนที่มีชีตล่าง → ลอยเหนือชีต (หน้าที่ไม่มี #panel ข้ามเอง)
    cfg.more = cfg.more || { href: 'credits.html#election', label: 'ดูแหล่งที่มาข้อมูลและสัญญาอนุญาตทั้งหมด' };
    window.MD_DATA_NOTICE = cfg;
    var s = document.createElement('script');
    s.src = '../js/data-notice.js';
    document.body.appendChild(s);
  }

  function boot() { inject(); loadNotice(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
