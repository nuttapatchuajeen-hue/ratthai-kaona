/* ============================================================
   ai-chat.js — วิดเจ็ตผู้ช่วย AI ข้อมูลรัฐ (รวมงานเว็บ md)
   ใช้ได้ทุกหน้า: ใส่ <script src=".../js/ai-chat.js"></script> ก่อน </body>
   - ปุ่มลอยมุมขวาล่าง (เลี่ยงปุ่มสลับธีม 🌙 อัตโนมัติ)
   - ตามธีมเว็บ (html[data-theme]) เอง
   - คุยผ่าน proxy ของเรา → ThaiLLM (API key ไม่อยู่ในไฟล์นี้)
   ============================================================ */
(function () {
  "use strict";

  // proxy จริง (Netlify Functions — site md-ai-proxy-nook, key อยู่ใน env var ฝั่งโน้น)
  var PROXY_URL = "https://md-ai-proxy-nook.netlify.app/api/chat";

  // คำสั่งระบบ (บุคลิก/ขอบเขตของผู้ช่วย)
  // 📌 เฟสต่อไป: เอาข้อมูลจริง (ครม./กระทรวง/ส.ส.) มาต่อท้ายตรงนี้ เพื่อให้ตอบแม่นขึ้น
  var SYSTEM_PROMPT =
    "คุณคือ 'ผู้ช่วยข้อมูลรัฐ' ของเว็บรวมงาน md ตอบคำถามเกี่ยวกับโครงสร้างภาครัฐไทย " +
    "คณะรัฐมนตรี สมาชิกสภาผู้แทนราษฎร และสถิติข้อมูลเปิดภาครัฐ " +
    "ตอบเป็นภาษาไทย กระชับ สุภาพ ตรงประเด็น ถ้าไม่แน่ใจหรือไม่มีข้อมูลให้บอกตรง ๆ อย่าเดา";

  var MAX_TOKENS = 1024;
  var TEMPERATURE = 0.2; // ต่ำหน่อยให้ตอบอิงข้อมูลอ้างอิง (ฝั่ง proxy) แม่น ๆ

  // ---- ประวัติการสนทนา (อยู่ในหน่วยความจำ รีโหลดแล้วเริ่มใหม่) ----
  var messages = [{ role: "system", content: SYSTEM_PROMPT }];
  var busy = false;
  var opened = false;

  // ---------- CSS (scope ด้วย mdai- กันชนกับเว็บ) ----------
  var CSS = [
    "#mdai-root{--mdai-accent:#055A75;--mdai-accent2:#0989AC;--mdai-on-accent:#fff;--mdai-surface:#fff;--mdai-surface2:#f1f4f9;",
    "--mdai-text:#1a1d24;--mdai-dim:#5b6472;--mdai-border:rgba(0,0,0,.10);--mdai-shadow:0 18px 50px -12px rgba(20,30,60,.35);",
    "font-family:'IBM Plex Sans Thai',system-ui,-apple-system,sans-serif}",
    'html[data-theme="dark"] #mdai-root{--mdai-accent:#00B5D6;--mdai-accent2:#00E5FF;--mdai-on-accent:#06121c;--mdai-surface:#12141a;--mdai-surface2:#1a1e27;--mdai-text:#e8eaf0;',
    "--mdai-dim:#9aa3b2;--mdai-border:rgba(255,255,255,.12);--mdai-shadow:0 18px 50px -12px rgba(0,0,0,.6)}",
    // ปุ่มลอยแบบ pill ✨ (ดำ-เงิน ตามแบบที่ผู้ใช้เลือก — คงโทนเดียวกันทั้งโหมดสว่าง/มืด)
    // ลากย้ายได้ (touch-action:none ให้ pointer events คุมการลากบนจอสัมผัส)
    "#mdai-fab{position:fixed;right:18px;bottom:20px;z-index:99998;display:inline-flex;align-items:center;gap:9px;height:48px;",
    "padding:0 20px 0 16px;border:0;border-radius:999px;cursor:pointer;touch-action:none;overflow:hidden;isolation:isolate;",
    "-webkit-tap-highlight-color:transparent;",
    "background:linear-gradient(140deg,rgba(159,180,199,.42),rgba(159,180,199,.14));",
    "box-shadow:0 12px 30px -10px rgba(0,0,0,.55),0 0 16px rgba(0,229,255,.14);",
    "transition:box-shadow .18s ease, transform .12s ease}",
    "#mdai-fab:hover{box-shadow:0 16px 36px -12px rgba(0,0,0,.65),0 0 22px rgba(0,229,255,.3)}",
    "#mdai-fab:active{transform:scale(.97)}",
    // แสงฟ้าวิ่งรอบขอบปุ่ม — ใบพัด conic หมุนด้วย transform (ลื่นทั้ง iOS/Android ไม่พึ่ง @property ที่ iOS ไม่รีเพนต์)
    "#mdai-fab::before{content:'';position:absolute;z-index:0;left:50%;top:50%;width:320px;height:320px;pointer-events:none;",
    "transform:translate(-50%,-50%);",
    "background:conic-gradient(from 0deg,transparent 0 60%,rgba(0,229,255,.5) 72%,#9FF1FF 82%,rgba(0,229,255,.5) 92%,transparent 100%);",
    "animation:mdai-spin 3s linear infinite}",
    // เนื้อปุ่มสีเข้มทับตรงกลาง เหลือเฉพาะกรอบบาง ๆ ให้แสงวิ่ง (overflow:hidden ที่ตัวปุ่มตัดใบพัดเป็นทรง pill)
    "#mdai-fab::after{content:'';position:absolute;z-index:1;inset:1.5px;border-radius:999px;pointer-events:none;",
    "background:linear-gradient(140deg,#0D1722 0%,#16222F 55%,#0B141F 100%)}",
    "@keyframes mdai-spin{to{transform:translate(-50%,-50%) rotate(360deg)}}",
    "#mdai-fab svg{position:relative;z-index:2;width:19px;height:19px;color:#7FE8FF;filter:drop-shadow(0 0 6px rgba(0,229,255,.55));flex:0 0 auto}",
    "#mdai-fab b{position:relative;z-index:2;font-family:'Kanit','IBM Plex Sans Thai',sans-serif;font-weight:600;font-size:15px;letter-spacing:.02em;white-space:nowrap;",
    "background:linear-gradient(180deg,#F4F8FC 25%,#9FB4C7 95%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}",
    // หน้าต่างแชต
    "#mdai-panel{position:fixed;right:18px;bottom:88px;z-index:99999;width:380px;max-width:calc(100vw - 36px);height:70vh;max-height:560px;",
    "display:none;flex-direction:column;overflow:hidden;border-radius:18px;background:var(--mdai-surface);color:var(--mdai-text);",
    "border:1px solid var(--mdai-border);box-shadow:var(--mdai-shadow);opacity:0;transform:translateY(12px) scale(.98);transition:opacity .2s, transform .2s}",
    "#mdai-panel.mdai-show{display:flex;opacity:1;transform:none}",
    // หัว
    "#mdai-head{display:flex;align-items:center;gap:10px;padding:14px 16px;background:linear-gradient(135deg,var(--mdai-accent),var(--mdai-accent2));color:var(--mdai-on-accent)}",
    "#mdai-head .mdai-dot{width:9px;height:9px;border-radius:50%;background:#5ef08a;box-shadow:0 0 0 3px rgba(94,240,138,.25)}",
    "#mdai-head b{font-size:15px;font-weight:700;line-height:1.1}",
    "#mdai-head span{display:block;font-size:11px;opacity:.85;font-weight:400}",
    "#mdai-close{margin-left:auto;background:rgba(255,255,255,.18);border:none;color:var(--mdai-on-accent);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:18px;line-height:1}",
    "#mdai-close:hover{background:rgba(255,255,255,.32)}",
    // กล่องข้อความ
    "#mdai-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:var(--mdai-surface2)}",
    ".mdai-row{display:flex;max-width:85%}",
    ".mdai-row.me{align-self:flex-end}.mdai-row.ai{align-self:flex-start}",
    ".mdai-bubble{padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}",
    ".me .mdai-bubble{background:linear-gradient(135deg,var(--mdai-accent),var(--mdai-accent2));color:var(--mdai-on-accent);border-bottom-right-radius:4px}",
    ".ai .mdai-bubble{background:var(--mdai-surface);color:var(--mdai-text);border:1px solid var(--mdai-border);border-bottom-left-radius:4px}",
    ".ai .mdai-bubble.err{border-color:#d7263d;color:#d7263d}",
    // จุดพิมพ์
    ".mdai-typing{display:flex;gap:4px;padding:4px 2px}",
    ".mdai-typing i{width:7px;height:7px;border-radius:50%;background:var(--mdai-dim);animation:mdai-b 1s infinite}",
    ".mdai-typing i:nth-child(2){animation-delay:.15s}.mdai-typing i:nth-child(3){animation-delay:.3s}",
    "@keyframes mdai-b{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}",
    // ช่องพิมพ์
    "#mdai-form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--mdai-border);background:var(--mdai-surface)}",
    "#mdai-input{flex:1;resize:none;border:1px solid var(--mdai-border);border-radius:12px;padding:10px 12px;font:inherit;font-size:14px;",
    "background:var(--mdai-surface2);color:var(--mdai-text);max-height:110px;outline:none}",
    "#mdai-input:focus{border-color:var(--mdai-accent)}",
    "#mdai-send{border:none;border-radius:12px;width:44px;cursor:pointer;color:var(--mdai-on-accent);background:linear-gradient(135deg,var(--mdai-accent),var(--mdai-accent2));display:grid;place-items:center}",
    "#mdai-send:disabled{opacity:.5;cursor:not-allowed}",
    "#mdai-send svg{width:20px;height:20px}",
    "@media(max-width:480px){#mdai-panel{right:10px;left:10px;width:auto;height:76vh}}",
    // หน้าที่มีปุ่มสลับธีม 🌙: เดสก์ท็อปปุ่มธีมลอยสูง (bottom:118) ไม่ชนกัน / จอแคบปุ่มธีมอยู่ bottom:72 → ย้าย pill ไปเคียงซ้าย
    "@media(max-width:860px){#mdai-root.mdai-avoid #mdai-fab{right:62px;bottom:72px}#mdai-root.mdai-avoid #mdai-panel{bottom:132px}}",
    // ตอน snap ติดขอบให้ลื่น ๆ (ใส่ class ชั่วคราว เพราะตอนลากต้องขยับทันทีไม่หน่วง)
    "#mdai-fab.mdai-snap{transition:left .28s cubic-bezier(.2,.8,.3,1.15), top .28s ease, box-shadow .18s ease, border-color .18s ease}",
    // Reduce Motion: ปิดเฉพาะ transition/typing ที่ไม่จำเป็น แต่คงแสงวิ่งรอบปุ่มไว้ (ตั้งใจให้วิ่งบนมือถือ)
    "@media(prefers-reduced-motion:reduce){#mdai-fab,#mdai-panel,#mdai-fab.mdai-snap{transition:none}.mdai-typing i{animation:none}}",
  ].join("");

  // ---------- สร้าง DOM ----------
  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function build() {
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    var root = document.createElement("div");
    root.id = "mdai-root";

    var fab = el(
      '<button id="mdai-fab" aria-label="เปิดผู้ช่วย AI">' +
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M11 1.5c.85 4.2 3.45 6.8 7.65 7.65-4.2.85-6.8 3.45-7.65 7.65-.85-4.2-3.45-6.8-7.65-7.65 4.2-.85 6.8-3.45 7.65-7.65Z"/>' +
        '<path d="M19 13.5c.4 2 1.6 3.2 3.6 3.6-2 .4-3.2 1.6-3.6 3.6-.4-2-1.6-3.2-3.6-3.6 2-.4 3.2-1.6 3.6-3.6Z"/></svg>' +
        "<b>ผู้ช่วย AI</b></button>"
    );

    var panel = el(
      '<div id="mdai-panel" role="dialog" aria-label="ผู้ช่วย AI ข้อมูลรัฐ">' +
        '<div id="mdai-head"><span class="mdai-dot"></span><div><b>ผู้ช่วย AI ข้อมูลรัฐ</b>' +
        "<span>ถามเรื่องโครงสร้างรัฐ ครม. ส.ส. และสถิติ</span></div>" +
        '<button id="mdai-close" aria-label="ปิด">×</button></div>' +
        '<div id="mdai-msgs"></div>' +
        '<form id="mdai-form"><textarea id="mdai-input" rows="1" placeholder="พิมพ์คำถาม…" autocomplete="off"></textarea>' +
        '<button id="mdai-send" type="submit" aria-label="ส่ง"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg></button></form>' +
        "</div>"
    );

    root.appendChild(fab);
    root.appendChild(panel);
    document.body.appendChild(root);

    // เลี่ยงปุ่มสลับธีมลอยมุมขวาล่าง — จัดตำแหน่งผ่าน CSS class (ดู @media ด้านบน)
    if (document.querySelector(".md-theme-toggle")) root.classList.add("mdai-avoid");

    // ---- ลากย้ายปุ่มได้ (pointer events ครอบทั้งเมาส์/นิ้ว) — ขยับเกิน 7px ถึงนับเป็นลาก ----
    var drag = { active: false, moved: false, touch: false, px: 0, py: 0, bx: 0, by: 0 };
    function setFabPos(l, t) {
      var r = fab.getBoundingClientRect();
      l = Math.min(Math.max(8, l), window.innerWidth - r.width - 8);
      t = Math.min(Math.max(8, t), window.innerHeight - r.height - 8);
      fab.style.left = l + "px";
      fab.style.top = t + "px";
      fab.style.right = "auto";
      fab.style.bottom = "auto";
    }
    fab.addEventListener("pointerdown", function (e) {
      drag.active = true;
      drag.moved = false;
      drag.touch = e.pointerType === "touch"; // นิ้วสั่นง่ายกว่าเมาส์ → ต้องใช้ระยะกันลากพลาดมากกว่า
      drag.px = e.clientX;
      drag.py = e.clientY;
      var r = fab.getBoundingClientRect();
      drag.bx = r.left;
      drag.by = r.top;
      try { fab.setPointerCapture(e.pointerId); } catch (err) {}
    });
    fab.addEventListener("pointermove", function (e) {
      if (!drag.active) return;
      var dx = e.clientX - drag.px, dy = e.clientY - drag.py;
      // ขยับน้อยกว่าระยะกันพลาดยังนับเป็น "แตะ" (touch 12px / เมาส์ 5px) — กันแตะเปิดแล้วโดนตีความเป็นลาก ปุ่มเลยกดไม่ติด
      var thr = drag.touch ? 144 : 25;
      if (!drag.moved && dx * dx + dy * dy < thr) return;
      drag.moved = true;
      setFabPos(drag.bx + dx, drag.by + dy);
    });
    // ปล่อยแล้วเด้งไปติดขอบซ้าย/ขวาที่ใกล้สุด (วางกลางจอแล้วบังเนื้อหา) — แนวตั้งคงตามที่วาง
    function snapFab(animate) {
      var r = fab.getBoundingClientRect(), W = window.innerWidth;
      var l = r.left + r.width / 2 < W / 2 ? 12 : W - r.width - 12;
      if (animate) {
        fab.classList.add("mdai-snap");
        setTimeout(function () { fab.classList.remove("mdai-snap"); }, 320);
      }
      fab.style.left = l + "px";
      fab.style.right = "auto";
    }
    fab.addEventListener("pointerup", function () {
      if (drag.active && drag.moved) {
        snapFab(true);
        try {
          localStorage.setItem("mdai-pos-v2", JSON.stringify({ l: parseFloat(fab.style.left), t: parseFloat(fab.style.top) }));
        } catch (err) {}
        if (opened) placePanel();
      }
      drag.active = false;
    });
    fab.addEventListener("click", function () {
      if (drag.moved) { drag.moved = false; return; } // จบการลาก — ไม่นับเป็นกดเปิด/ปิด
      toggle();
    });
    // คืนตำแหน่งที่เคยลากไว้ (จำข้ามหน้า/ข้ามครั้งด้วย localStorage)
    try {
      var sp = JSON.parse(localStorage.getItem("mdai-pos-v2") || "null");
      if (sp && typeof sp.l === "number" && typeof sp.t === "number") {
        setFabPos(sp.l, sp.t);
        snapFab(false); // จอเปลี่ยนขนาดไปจากครั้งก่อนก็ยังติดขอบพอดี
      }
    } catch (err) {}
    window.addEventListener("resize", function () {
      if (fab.style.left) {
        setFabPos(parseFloat(fab.style.left), parseFloat(fab.style.top));
        snapFab(false);
      }
      if (opened) placePanel();
    });

    panel.querySelector("#mdai-close").addEventListener("click", close);
    var form = panel.querySelector("#mdai-form");
    var input = panel.querySelector("#mdai-input");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      send(input.value);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send(input.value);
      }
    });
    input.addEventListener("input", function () {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 110) + "px";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && opened) close();
    });

    addBubble("ai", "สวัสดีครับ 👋 ผมเป็นผู้ช่วย AI ข้อมูลรัฐ ถามได้เลยครับ");
  }

  // ---------- การทำงาน ----------
  function toggle() {
    opened ? close() : open();
  }
  // วางหน้าต่างแชตไว้ข้างปุ่ม (ปุ่มลากย้ายได้ ตำแหน่งเลยไม่ตายตัว) — จอ ≤480 ใช้แบบเต็มกว้างจาก CSS
  function placePanel() {
    var p = document.getElementById("mdai-panel");
    var fab = document.getElementById("mdai-fab");
    if (!p || !fab) return;
    if (window.innerWidth <= 480) {
      p.style.left = p.style.right = p.style.top = p.style.bottom = "";
      return;
    }
    var r = fab.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    var pw = Math.min(380, W - 36), ph = Math.min(560, H * 0.7);
    if (r.left + r.width / 2 < W / 2) {
      p.style.left = Math.max(10, Math.min(r.left, W - pw - 10)) + "px";
      p.style.right = "auto";
    } else {
      p.style.right = Math.max(10, W - r.right) + "px";
      p.style.left = "auto";
    }
    if (r.top - ph - 12 >= 10) {
      p.style.bottom = (H - r.top + 12) + "px";
      p.style.top = "auto";
    } else {
      p.style.top = Math.min(r.bottom + 12, H - ph - 10) + "px";
      p.style.bottom = "auto";
    }
  }
  function open() {
    opened = true;
    var p = document.getElementById("mdai-panel");
    placePanel();
    p.classList.add("mdai-show");
    document.getElementById("mdai-input").focus();
  }
  function close() {
    opened = false;
    document.getElementById("mdai-panel").classList.remove("mdai-show");
  }

  function addBubble(who, text, isErr) {
    var msgs = document.getElementById("mdai-msgs");
    var row = document.createElement("div");
    row.className = "mdai-row " + (who === "me" ? "me" : "ai");
    var b = document.createElement("div");
    b.className = "mdai-bubble" + (isErr ? " err" : "");
    b.textContent = text;
    row.appendChild(b);
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
    return b;
  }

  function showTyping() {
    var msgs = document.getElementById("mdai-msgs");
    var row = document.createElement("div");
    row.className = "mdai-row ai";
    row.id = "mdai-typing-row";
    row.innerHTML = '<div class="mdai-bubble"><div class="mdai-typing"><i></i><i></i><i></i></div></div>';
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function hideTyping() {
    var r = document.getElementById("mdai-typing-row");
    if (r) r.remove();
  }

  function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;

    if (PROXY_URL.indexOf("YOUR-SITE") !== -1) {
      addBubble("ai", "⚙️ ยังไม่ได้ตั้งค่า PROXY_URL — แก้ในไฟล์ js/ai-chat.js ให้เป็น URL Netlify ของคุณก่อนครับ", true);
      return;
    }

    var input = document.getElementById("mdai-input");
    input.value = "";
    input.style.height = "auto";
    addBubble("me", text);
    messages.push({ role: "user", content: text });

    busy = true;
    document.getElementById("mdai-send").disabled = true;
    showTyping();

    fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages, max_tokens: MAX_TOKENS, temperature: TEMPERATURE }),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(data.error || "HTTP " + r.status);
          return data;
        });
      })
      .then(function (data) {
        hideTyping();
        var reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        // โมเดล ThaiLLM ใส่ก้อนเหตุผลภายใน <think>...</think> มาด้วย — ตัดทิ้งก่อนแสดง
        reply = (reply || "").replace(/<think>[\s\S]*?(<\/think>|$)/g, "");
        reply = reply.trim() || "ขออภัย ไม่ได้รับคำตอบครับ";
        messages.push({ role: "assistant", content: reply });
        addBubble("ai", reply);
      })
      .catch(function (err) {
        hideTyping();
        addBubble("ai", "เกิดข้อผิดพลาด: " + err.message, true);
      })
      .finally(function () {
        busy = false;
        document.getElementById("mdai-send").disabled = false;
      });
  }

  // ---------- เริ่มทำงาน ----------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
