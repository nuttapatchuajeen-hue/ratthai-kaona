/* glow.js — ขับ "แสงวิ่ง" (conic glow) รอบช่องค้นหาให้หมุนได้จริงบนทุกเบราว์เซอร์
   เดิมใช้ @keyframes animate ค่า @property --sb-a ซึ่ง iOS/Android Safari หลายเวอร์ชัน
   (และเมื่อเปิด Reduce Motion) จะไม่ interpolate ทำให้แสงค้างนิ่ง/ไม่วิ่งบนมือถือ
   วิธีนี้อัปเดตมุมเองทุกเฟรม จึงวิ่งเหมือนกันทุกอุปกรณ์ */
(function () {
  var els = document.querySelectorAll('.searchbox, .lcontrols .search');
  if (!els.length || !window.requestAnimationFrame) return;

  var SLOW = 40;   // องศา/วินาที ≈ หมุนครบรอบใน 9 วิ (สถานะปกติ)
  var FAST = 120;  // องศา/วินาที ≈ 3 วิ/รอบ เมื่อแตะ/โฟกัส
  var root = document.documentElement;
  var angle = 0;
  var last = 0;

  function active() {
    for (var i = 0; i < els.length; i++) {
      if (els[i].matches(':focus-within') || els[i].matches(':hover')) return true;
    }
    return false;
  }

  function tick(now) {
    // หยุดวาดเมื่อแท็บถูกซ่อน (ประหยัดแบตมือถือ)
    if (document.hidden) { last = 0; return; }
    if (!last) last = now;
    var dt = (now - last) / 1000;
    last = now;
    if (dt > 0.1) dt = 0.1; // กันกระโดดเมื่อสลับแท็บกลับมา
    angle = (angle + (active() ? FAST : SLOW) * dt) % 360;
    root.style.setProperty('--sb-a', angle.toFixed(1) + 'deg');
    requestAnimationFrame(tick);
  }

  // เริ่มใหม่เมื่อกลับมาที่แท็บ
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) requestAnimationFrame(tick);
  });

  requestAnimationFrame(tick);
})();
