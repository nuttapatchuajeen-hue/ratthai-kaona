/* ──────────────────────────────────────────────────────────────
   Parallax หลายชั้น — ขับด้วย attribute `data-scroll-speed`
   รัฐไทยก้าวหน้า · ไม่พึ่งไลบรารีภายนอก

   วิธีใช้
     <div class="layer" data-scroll-speed="-22">…</div>

   ความหมายของค่า
     ค่าคือ "เปอร์เซ็นต์ของความสูงจอ" ที่ชั้นนั้นจะเลื่อนสวน/ตามการสกรอลล์
       ติดลบ = เลื่อนช้ากว่าหน้าเว็บ  → ถอยไปเป็นฉากหลัง
       ศูนย์  = เลื่อนเท่าหน้าเว็บ     → ระนาบอ้างอิง
       บวก    = เลื่อนเร็วกว่าหน้าเว็บ → ลอยมาเป็นฉากหน้า

     y = -progress × (speed / 100) × ความสูงจอ
     โดย progress = (จุดกึ่งกลางจอ − จุดกึ่งกลางชั้น) / ความสูงจอ
     จึงเท่ากับ 0 พอดีตอนชั้นนั้นอยู่กลางจอ — ทุกชั้น "ตรงกัน" ที่จุดเดียว
     แล้วค่อยแยกออกจากกันเมื่อเลื่อนห่างออกไป

   หมายเหตุ
     · เคารพ prefers-reduced-motion (ปิดเอฟเฟกต์ทั้งหมด)
     · วัดตำแหน่งฐานโดยล้าง transform ก่อนเสมอ กันค่าเพี้ยนสะสม
     · อัปเดตผ่าน requestAnimationFrame ครั้งเดียวต่อเฟรม
   ────────────────────────────────────────────────────────────── */
(function (global) {
  'use strict';

  var SELECTOR = '[data-scroll-speed]';
  var items    = [];
  var enabled  = true;
  var ticking  = false;
  var vh       = window.innerHeight;
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function scrollTop() {
    return window.scrollY || window.pageYOffset || 0;
  }

  /* เก็บรายชื่อชั้นทั้งหมดในหน้า */
  function collect() {
    items = [];
    var els = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < els.length; i++) {
      var speed = parseFloat(els[i].getAttribute('data-scroll-speed'));
      if (!speed) continue;             // 0 หรืออ่านค่าไม่ออก = ไม่ต้องขยับ
      /* position: fixed อยู่นิ่งกับจอ ไม่ได้ไหลไปกับหน้าเว็บ
         getBoundingClientRect().top ของมันจึงคงที่ทุกเฟรม ฐานที่วัดได้เลยเป็นค่า
         ณ วินาทีที่ measure() ทำงานเท่านั้น พอสกรอลล์ต่อไปสูตรจะคำนวณจากฐานผิด
         ผลคือดัน element หลุดขอบจอแล้วไปค้างแช่อยู่อย่างนั้น (ตัวกรอง "ไกลเกิน"
         ด้านล่างจะหยุดอัปเดตให้พอดี) — กันไว้ตรงนี้ดีกว่าปล่อยให้พังเงียบ ๆ */
      if (getComputedStyle(els[i]).position === 'fixed') {
        if (window.console && console.warn) {
          console.warn('[parallax] ข้าม', els[i], '— ใช้กับ position:fixed ไม่ได้ ต้องเป็นชั้นที่เลื่อนไปกับหน้า');
        }
        continue;
      }
      els[i].style.willChange = 'transform';
      items.push({ el: els[i], speed: speed / 100, base: 0, half: 0 });
    }
    measure();
  }

  /* วัดตำแหน่งฐาน — ต้องล้าง transform ของทุกชั้นก่อน
     ไม่อย่างนั้นจะวัดตำแหน่ง "หลังขยับ" แล้วค่าจะไหลไปเรื่อย ๆ */
  function measure() {
    vh = window.innerHeight;
    var top = scrollTop();
    var i;
    for (i = 0; i < items.length; i++) items[i].el.style.transform = '';
    for (i = 0; i < items.length; i++) {
      var r = items[i].el.getBoundingClientRect();
      items[i].base = r.top + top + r.height / 2;
      items[i].half = r.height / 2;
    }
    apply();
  }

  function apply() {
    var mid = scrollTop() + vh / 2;
    var off = !enabled || reduceQuery.matches;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (off) { it.el.style.transform = ''; continue; }
      // อยู่ไกลนอกจอเกินไป ไม่ต้องเสียแรงคำนวณ
      if (Math.abs(it.base - mid) > vh * 1.5 + it.half) continue;
      var y = -((mid - it.base) / vh) * it.speed * vh;
      it.el.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0)';
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { apply(); ticking = false; });
  }

  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 120);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('load', measure);
  if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', apply);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', collect);
  } else {
    collect();
  }

  global.Parallax = {
    refresh:  collect,
    measure:  measure,
    enable:   function () { enabled = true;  apply(); },
    disable:  function () { enabled = false; apply(); },
    toggle:   function () { enabled = !enabled; apply(); return enabled; },
    isEnabled: function () { return enabled && !reduceQuery.matches; },
    count:    function () { return items.length; }
  };
})(window);
