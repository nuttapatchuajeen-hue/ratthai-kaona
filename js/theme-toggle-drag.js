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

    // ---------- ปุ่มย่อ: หุบไปซ่อนนอกขอบจอ เหลือแถบเล็ก ๆ ให้กดเรียกกลับ ----------
    // ปุ่มย่ออยู่ "นอก" <label> (ไม่ใช่ลูกใน) เพราะคลิกอะไรในลาเบลก็สลับธีมหมด
    var TKEY = "md-toggle-tuck-v1";        // คีย์จำสถานะย่อ (แยกจากคีย์ตำแหน่ง)
    var PEEK = 30;                         // ส่วนที่ยังโผล่พ้นขอบจอให้กดเรียกกลับ
    var tucked = false, curTx = 0, baseLeft = 0, skipClick = false;

    var style = document.createElement("style");
    style.textContent = [
      ".md-tgl-min{position:fixed;z-index:1001;width:22px;height:22px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;",
      "cursor:pointer;background:rgba(13,23,34,.92);color:#9FB4C7;-webkit-tap-highlight-color:transparent;",
      "box-shadow:0 4px 12px -4px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.14);transition:color .15s,background .15s}",
      ".md-tgl-min:hover{color:#CFE9F5;background:rgba(22,36,52,.98)}",
      ".md-tgl-min svg{width:13px;height:13px;display:block}",
      ".md-tgl-min.md-hide{display:none}",
      // ⚠️ ห้ามใส่ :hover ที่ขยับตำแหน่งตอนย่อ — เมาส์แตะแล้วแถบเลื่อนหนี = hover หลุด → เด้งวนไม่จบ (เคยพลาดกับ FAB ผู้ช่วย AI)
      ".bb8-toggle.md-tgl-tuck{opacity:.92}",
      ".bb8-toggle.md-tgl-anim{transition:transform .26s cubic-bezier(.2,.8,.3,1.15)}",
    ].join("");
    document.head.appendChild(style);

    var minBtn = document.createElement("button");
    minBtn.type = "button";
    minBtn.className = "md-tgl-min";
    minBtn.setAttribute("aria-label", "ย่อปุ่มสลับธีมไปขอบจอ");
    minBtn.title = "ย่อไปขอบจอ";
    minBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
    document.body.appendChild(minBtn);

    // วางปุ่มย่อคาบขอบด้าน "ในจอ" ของ BB-8 (ขวา→ซ้ายของปุ่ม / ซ้าย→ขวาของปุ่ม)
    // finalLeft: ตอนเด้งติดขอบ ตัวปุ่มยังวิ่ง transition อยู่ → rect ที่อ่านได้เป็นค่ากลางทาง
    // ต้องส่งตำแหน่งปลายทางมาเอง ไม่งั้นปุ่มย่อไปจอดผิดที่
    function placeMin(finalLeft) {
      if (tucked) return;
      var r = el.getBoundingClientRect(), vw = document.documentElement.clientWidth;
      var left = typeof finalLeft === "number" ? finalLeft : r.left;
      var isL = left + r.width / 2 < vw / 2;
      minBtn.style.top = Math.round(r.top + r.height / 2 - 11) + "px";
      minBtn.style.left = Math.round(isL ? left + r.width - 11 : left - 11) + "px";
      minBtn.firstChild.style.transform = isL ? "rotate(180deg)" : "";
    }
    function tuck() {
      if (tucked) return;
      var r = el.getBoundingClientRect(), vw = document.documentElement.clientWidth;
      var isL = r.left + r.width / 2 < vw / 2;
      curTx = isL ? PEEK - r.right : vw - PEEK - r.left;
      baseLeft = r.left;                   // จำตำแหน่งตอนยังไม่ย่อ ไว้วางปุ่มย่อตอนกางกลับ
      tucked = true;
      el.classList.add("md-tgl-tuck");
      el.style.transform = "translateX(" + curTx + "px)";
      minBtn.classList.add("md-hide");
      try { localStorage.setItem(TKEY, "1"); } catch (err) {}
    }
    function untuck() {
      if (!tucked) return;
      tucked = false;
      curTx = 0;
      el.style.transform = "";
      el.classList.remove("md-tgl-tuck");
      minBtn.classList.remove("md-hide");
      placeMin(baseLeft);                  // rect ตอนนี้ยังวิ่ง transition อยู่ → ใช้ตำแหน่งที่จำไว้
      try { localStorage.setItem(TKEY, "0"); } catch (err) {}
    }
    // ตอนย่อ ตัวปุ่มถูก transform ไว้ → วัด rect เพี้ยน จึงคลายชั่วคราวแบบไม่มีอนิเมชันก่อนคำนวณ
    function withUntucked(fn) {
      if (!tucked) return fn();
      el.classList.remove("md-tgl-anim");
      el.style.transform = "";
      void el.offsetWidth;
      fn();
      var r = el.getBoundingClientRect(), vw = document.documentElement.clientWidth;
      var isL = r.left + r.width / 2 < vw / 2;
      curTx = isL ? PEEK - r.right : vw - PEEK - r.left;
      baseLeft = r.left;
      el.style.transform = "translateX(" + curTx + "px)";
      void el.offsetWidth;
      el.classList.add("md-tgl-anim");
    }
    minBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      tuck();
    });

    function setPos(l, t) {
      var r = el.getBoundingClientRect();
      l = Math.min(Math.max(EDGE, l), window.innerWidth - r.width - EDGE);
      t = Math.min(Math.max(EDGE, t), window.innerHeight - r.height - EDGE);
      el.style.left = l + "px";
      el.style.top = t + "px";
      el.style.right = "auto";
      el.style.bottom = "auto";
      placeMin();                          // ปุ่มย่อเกาะติดขอบปุ่มตลอดการลาก
    }

    // ปล่อยแล้วเด้งไปติดขอบซ้าย/ขวาที่ใกล้สุด (วางกลางจอแล้วบังเนื้อหา)
    function snap(animate) {
      var r = el.getBoundingClientRect(), W = window.innerWidth;
      var l = r.left + r.width / 2 < W / 2 ? GAP : W - r.width - GAP;
      if (animate) {
        var prev = el.style.transition, glide = "left .28s cubic-bezier(.2,.8,.3,1.15), top .28s ease";
        el.style.transition = glide;
        minBtn.style.transition = glide;   // ปุ่มย่อเลื่อนตามไปพร้อมกัน ไม่กระโดดไปรอ
        setTimeout(function () {
          el.style.transition = prev || "";
          minBtn.style.transition = "";
        }, 320);
      }
      el.style.left = l + "px";
      el.style.right = "auto";
      placeMin(l);
    }

    el.addEventListener("pointerdown", function (e) {
      // ตอนย่ออยู่: แตะแถบที่โผล่ = กางกลับอย่างเดียว (ไม่สลับธีม ไม่เริ่มลาก)
      if (tucked) {
        skipClick = true;
        untuck();
        return;
      }
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
    // เพิ่งกางกลับจากสถานะย่อก็เช่นกัน — ครั้งแรกคือ "เรียกปุ่มกลับมา" ไม่ใช่สลับธีม
    el.addEventListener("click", function (e) {
      if (skipClick || drag.moved) {
        e.preventDefault();
        e.stopPropagation();
        skipClick = false;
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

    placeMin();
    // เคยย่อไว้ครั้งก่อน → ย่อกลับทันที (ยังไม่ใส่ .md-tgl-anim จะได้ไม่มีอนิเมชันวิ่งตอนโหลด)
    try {
      if (localStorage.getItem(TKEY) === "1") tuck();
    } catch (err) {}
    // เปิดอนิเมชันหลังโหลดเสร็จ (setTimeout ไม่ใช่ rAF — rAF ไม่ยิงถ้าแท็บถูกซ่อน/ไม่ได้เรนเดอร์)
    setTimeout(function () { el.classList.add("md-tgl-anim"); }, 60);

    window.addEventListener("resize", function () {
      withUntucked(function () {
        if (el.style.left) {
          setPos(parseFloat(el.style.left), parseFloat(el.style.top));
          snap(false);
        }
        placeMin();
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
