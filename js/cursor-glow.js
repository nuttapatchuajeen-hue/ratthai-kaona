/* ═══════════════════════════════════════════════════════════════
   CURSOR GLOW — ตัวติดตามเคอร์เซอร์ (ใช้ร่วมกันทุกหน้าใน hub/)
   ตั้งค่า --xp/--yp (0–1 เทียบวิวพอร์ต) บน :root ให้ css/cursor-glow.css
   เอาไปวาดแสง — ไฟล์นี้ไม่แตะ DOM อื่นเลย
   (ตั้ง --x/--y เป็น px ไว้ด้วย เพื่อให้สัญญาตรงกับสปอตไลต์หน้า ครม.
    ที่ cabinet/index.html ซึ่งเป็นต้นทางของเทคนิคนี้)

   ถ้าไฟล์นี้ไม่ทำงาน แสงจะไปค้างกลางจอ (ค่าเริ่มต้น .5 ใน CSS)
   ไม่ใช่ดับหรือกระโดดไปมุมซ้ายบน
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var root = document.documentElement;

  /* ผู้ใช้ตั้งค่าลดการเคลื่อนไหว → ไม่ต้องเสียแรงคำนวณ (CSS ซ่อนชั้นแสงไว้อยู่แล้ว) */
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var s = root.style, px = null, py = null, moved = false, queued = false;

  function write() {
    queued = false;
    var w = innerWidth || root.clientWidth || 1;
    var h = innerHeight || root.clientHeight || 1;
    var x = (moved && px !== null) ? px : w / 2;   /* ก่อนขยับเมาส์ = กึ่งกลางจอ */
    var y = (moved && py !== null) ? py : h / 2;
    s.setProperty('--x',  x.toFixed(1));
    s.setProperty('--y',  y.toFixed(1));
    s.setProperty('--xp', (x / w).toFixed(3));
    s.setProperty('--yp', (y / h).toFixed(3));
  }

  write();

  addEventListener('pointermove', function (e) {
    px = e.clientX; py = e.clientY; moved = true;
    if (!queued) { queued = true; requestAnimationFrame(write); }   /* คุมให้เขียนไม่เกิน 1 ครั้ง/เฟรม */
  }, { passive: true });

  addEventListener('resize', write, { passive: true });
})();
