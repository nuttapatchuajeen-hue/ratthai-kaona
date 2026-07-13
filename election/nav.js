/* ===== เมนูกลางของเว็บเลือกตั้ง — navpill (เดสก์ท็อป) + mobnav (มือถือ) =====
   แก้เมนูที่ไฟล์นี้ไฟล์เดียว มีผลครบทุกหน้า — หน้าที่ใช้ให้ใส่ <script src="nav.js" defer></script>
   สคริปต์ฉีดเมนูเองตอนโหลด แล้วไฮไลต์ปุ่มของหน้าปัจจุบันอัตโนมัติ
   (committees.html เป็นหน้าลูกของรัฐสภา → ไฮไลต์ "รัฐสภา") */
(function () {
  var NAVPILL = `<nav class="navpill">
  <a href="../hub/index.html" style="border-right:1px solid var(--line);border-radius:11px 4px 4px 11px;margin-right:2px;" title="กลับหน้าหลัก รัฐไทยก้าวหน้า"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>หน้าหลัก</a>
  <a href="index.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>รายเขต</a>
  <a href="partylist.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>บัญชีรายชื่อ</a>
  <a href="standings.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/></svg>คะแนนพรรค</a>
  <a href="parliament.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19a8 8 0 0 1 16 0"/><circle cx="12" cy="7" r="1.2" fill="currentColor"/><circle cx="7.5" cy="9" r="1.2" fill="currentColor"/><circle cx="16.5" cy="9" r="1.2" fill="currentColor"/></svg>รัฐสภา</a>
  <a href="referendum.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2.5h8.5L19 7v14.5H6Z"/><path d="M14.5 2.5V7H19"/><path d="m9 14 2.2 2.2L15 12.4"/></svg>ประชามติ</a>
  <a href="bangkok.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M6 21V8l6-4 6 4v13M10 21v-5h4v5"/><path d="M9 11h.01M15 11h.01"/></svg>กทม.</a>
</nav>`;

  var MOBNAV = `<nav class="mobnav" aria-label="เมนูหลัก">
  <a href="../hub/index.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>หน้าหลัก</a>
  <a href="index.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>รายเขต</a>
  <a href="partylist.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>บัญชีฯ</a>
  <a href="standings.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/></svg>คะแนน</a>
  <a href="parliament.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19a8 8 0 0 1 16 0"/><circle cx="12" cy="7" r="1.2" fill="currentColor"/><circle cx="7.5" cy="9" r="1.2" fill="currentColor"/><circle cx="16.5" cy="9" r="1.2" fill="currentColor"/></svg>รัฐสภา</a>
  <a href="referendum.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 2.5h8.5L19 7v14.5H6Z"/><path d="M14.5 2.5V7H19"/><path d="m9 14 2.2 2.2L15 12.4"/></svg>ประชามติ</a>
  <a href="bangkok.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 21h18M6 21V8l6-4 6 4v13M10 21v-5h4v5"/></svg>กทม.</a>
</nav>`;

  function inject() {
    var body = document.body;
    if (!body || document.querySelector('.navpill')) return; // กันฉีดซ้ำ
    body.insertAdjacentHTML('afterbegin', NAVPILL);
    body.insertAdjacentHTML('beforeend', MOBNAV);

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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
