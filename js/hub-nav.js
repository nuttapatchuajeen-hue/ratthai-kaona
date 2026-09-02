/* ===========================================================================
   เมนูมือถือของกลุ่มหน้า hub — ฉีดปุ่มแฮมเบอร์เกอร์เองตอนโหลด
   ---------------------------------------------------------------------------
   ใช้คู่กับ css/hub-nav.css · ใส่สคริปต์นี้ในหน้าไหน หน้านั้นได้เมนูมือถือทันที
   โดยไม่ต้องแก้ HTML ของเมนูเลย (โครงสร้างที่ต้องมี: header.site-header > nav > ul.nav-links)
   =========================================================================== */
(function () {
  "use strict";

  var ICON_OPEN  = '<svg class="ico-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var ICON_CLOSE = '<svg class="ico-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function init() {
    var nav = document.querySelector(".site-header nav");
    if (!nav) return;
    var links = nav.querySelector(".nav-links");
    if (!links) return;
    // เมนูรายการเดียว (เช่น video.html) ไม่ต้องมีแฮมเบอร์เกอร์
    if (links.querySelectorAll("a").length < 2) return;

    if (!links.id) links.id = "hubNavLinks";

    // หน้าไหนเขียนปุ่มไว้ใน HTML เองแล้ว (hub/index.html) ให้ "ยืมปุ่มนั้นมาต่อสาย"
    // ไม่ใช่ถอยออกไปเฉย ๆ ไม่อย่างนั้นปุ่มจะโผล่มาแต่กดไม่ติด เพราะไม่มีใครผูก listener ให้
    var btn = nav.querySelector(".nav-burger");
    if (btn && btn.getAttribute("data-hub-nav-ready") === "1") return;  // ต่อสายไปแล้ว กันผูกซ้ำ
    if (!btn) {
      btn = document.createElement("button");
      btn.className = "nav-burger";
      btn.innerHTML = ICON_OPEN + ICON_CLOSE;      // ปุ่มที่หน้าเขียนเองมีไอคอนของตัวเองอยู่แล้ว ไม่ต้องทับ
      nav.insertBefore(btn, links);
    }
    btn.type = "button";
    btn.setAttribute("aria-label", "เปิดเมนู");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", links.id);
    btn.setAttribute("data-hub-nav-ready", "1");

    function setOpen(open) {
      links.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "ปิดเมนู" : "เปิดเมนู");
    }
    function isOpen() { return btn.getAttribute("aria-expanded") === "true"; }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!isOpen());
    });

    // กดลิงก์ในเมนู → ปิดลิ้นชัก (ลิงก์ที่เลื่อนภายในหน้าเดิมจะได้ไม่ค้างเปิด)
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    // กดนอกเมนู → ปิด
    document.addEventListener("click", function (e) {
      if (isOpen() && !nav.contains(e.target)) setOpen(false);
    });

    // Esc → ปิด แล้วคืนโฟกัสให้ปุ่ม (ทางออกด้วยคีย์บอร์ด)
    document.addEventListener("keydown", function (e) {
      if ((e.key === "Escape" || e.key === "Esc") && isOpen()) {
        setOpen(false);
        btn.focus();
      }
    });

    // ขยายจอกลับเป็นเดสก์ท็อป → รีเซ็ตสถานะ ไม่ให้ค้างเปิด
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768 && isOpen()) setOpen(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
