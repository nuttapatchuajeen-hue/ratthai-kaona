/* ============================================================
   theme-toggle-drag.js — ลากย้ายปุ่มสลับธีม (BB-8 สว่าง/มืด) ได้ทุกหน้า
   ใช้รูปแบบเดียวกับปุ่มลอย "ผู้ช่วย AI" (js/ai-chat.js):
     • ลากด้วย pointer events (เมาส์/นิ้ว) — ขยับเกินระยะกันพลาดถึงนับเป็น "ลาก"
     • ปล่อยแล้วเด้งไปติดขอบซ้าย/ขวาที่ใกล้สุด (แนวตั้งคงตามที่วาง)
     • จำตำแหน่งข้ามหน้า/ข้ามครั้งด้วย localStorage ('md-toggle-pos-v1')
     • "ลาก" ไม่สลับธีม — กัน label toggle checkbox ตอนปล่อยมือ
   วางก่อน </body> (หลังปุ่ม BB-8 ถูก render แล้ว) — มี DOMContentLoaded กันไว้อยู่แล้ว
   หมายเหตุ: เฉพาะปุ่มที่ "ลอย" (position:fixed) เท่านั้น — หน้าที่ฝังปุ่มไว้ในแถบหัว
   (เช่น structure.html ที่ตั้ง position:static) จะถูกข้าม ไม่ไปยุ่งกับเลย์เอาต์
   ============================================================ */
(function () {
  "use strict";
  if (window.__mdToggleDrag) return;       // กันโหลดซ้ำ
  window.__mdToggleDrag = true;

  var KEY = "md-toggle-pos-v1";            // คีย์จำตำแหน่ง (แยกจาก FAB ผู้ช่วย AI)
  var GAP = 12;                            // ระยะห่างขอบจอตอนเด้งติดขอบ
  var EDGE = 8;                            // กันหลุดขอบจอตอนลาก

  function init() {
    var el = document.querySelector(".bb8-toggle");
    if (!el) return;
    // เฉพาะปุ่มที่ลอย (fixed) — ปุ่มที่ฝังในแถบหัว (static/relative) ปล่อยไว้ตามเดิม
    if (getComputedStyle(el).position !== "fixed") return;

    el.style.touchAction = "none";         // ให้ pointer คุมการลากบนจอสัมผัส (หน้าไม่เลื่อนตาม)

    var drag = { active: false, moved: false, touch: false, px: 0, py: 0, bx: 0, by: 0 };

    function setPos(l, t) {
      var r = el.getBoundingClientRect();
      l = Math.min(Math.max(EDGE, l), window.innerWidth - r.width - EDGE);
      t = Math.min(Math.max(EDGE, t), window.innerHeight - r.height - EDGE);
      el.style.left = l + "px";
      el.style.top = t + "px";
      el.style.right = "auto";
      el.style.bottom = "auto";
    }

    // ปล่อยแล้วเด้งไปติดขอบซ้าย/ขวาที่ใกล้สุด (วางกลางจอแล้วบังเนื้อหา)
    function snap(animate) {
      var r = el.getBoundingClientRect(), W = window.innerWidth;
      var l = r.left + r.width / 2 < W / 2 ? GAP : W - r.width - GAP;
      if (animate) {
        var prev = el.style.transition;
        el.style.transition = "left .28s cubic-bezier(.2,.8,.3,1.15), top .28s ease";
        setTimeout(function () { el.style.transition = prev || ""; }, 320);
      }
      el.style.left = l + "px";
      el.style.right = "auto";
    }

    el.addEventListener("pointerdown", function (e) {
      drag.active = true;
      drag.moved = false;
      drag.touch = e.pointerType === "touch"; // นิ้วสั่นง่ายกว่าเมาส์ → ระยะกันพลาดมากกว่า
      drag.px = e.clientX;
      drag.py = e.clientY;
      var r = el.getBoundingClientRect();
      drag.bx = r.left;
      drag.by = r.top;
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });

    el.addEventListener("pointermove", function (e) {
      if (!drag.active) return;
      var dx = e.clientX - drag.px, dy = e.clientY - drag.py;
      // ขยับน้อยกว่าระยะกันพลาดยังนับเป็น "แตะ" (touch 12px / เมาส์ 5px ยกกำลังสอง)
      var thr = drag.touch ? 144 : 25;
      if (!drag.moved && dx * dx + dy * dy < thr) return;
      drag.moved = true;
      setPos(drag.bx + dx, drag.by + dy);
    });

    function end() {
      if (drag.active && drag.moved) {
        snap(true);
        try {
          localStorage.setItem(KEY, JSON.stringify({ l: parseFloat(el.style.left), t: parseFloat(el.style.top) }));
        } catch (err) {}
      }
      drag.active = false;
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    // ลากแล้วอย่าสลับธีม — กัน <label> สั่ง toggle checkbox ตอนปล่อยมือ (capture ดักก่อน onchange)
    el.addEventListener("click", function (e) {
      if (drag.moved) {
        e.preventDefault();
        e.stopPropagation();
        drag.moved = false;
      }
    }, true);

    // คืนตำแหน่งที่เคยลากไว้ (จำข้ามหน้า/ข้ามครั้ง)
    try {
      var sp = JSON.parse(localStorage.getItem(KEY) || "null");
      if (sp && typeof sp.l === "number" && typeof sp.t === "number") {
        setPos(sp.l, sp.t);
        snap(false);                         // จอเปลี่ยนขนาดไปจากครั้งก่อนก็ยังติดขอบพอดี
      }
    } catch (err) {}

    window.addEventListener("resize", function () {
      if (el.style.left) {
        setPos(parseFloat(el.style.left), parseFloat(el.style.top));
        snap(false);
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
