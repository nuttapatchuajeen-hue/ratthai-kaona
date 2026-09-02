/* ============================================================
   ai-chat.js — วิดเจ็ตผู้ช่วย AI ข้อมูลรัฐ (รวมงานเว็บ md)
   ใช้ได้ทุกหน้า: ใส่ <script src=".../js/ai-chat.js"></script> ก่อน </body>
   - ปุ่มลอย ✨ ผู้ช่วย AI (ลากย้ายได้แบบ BB-8 และเด้งติดขอบ)
   - ปุ่มย่อทรงกลมคาบขอบปุ่ม (เหมือนปุ่มย่อของ BB-8)
   - ป้ายข้อความพิมพ์ค้นหาจำลองอยู่ข้างใต้กรอบปุ่ม AI (เหมือน zento.framer.website)
   - ตามธีมเว็บ (html[data-theme]) เอง
   - คุยผ่าน proxy ของเรา → ThaiLLM (API key ไม่อยู่ในไฟล์นี้)
   ============================================================ */
(function () {
  "use strict";

  // proxy จริง (Netlify Functions — site md-ai-proxy-nook, key อยู่ใน env var ฝั่งโน้น)
  var PROXY_URL = "https://md-ai-proxy-nook.netlify.app/api/chat";

  // คำสั่งระบบ (บุคลิก/ขอบเขตของผู้ช่วย)
  var SYSTEM_PROMPT =
    "คุณคือ 'ผู้ช่วยข้อมูลรัฐ' ของเว็บรวมงาน md ตอบคำถามเกี่ยวกับโครงสร้างภาครัฐไทย " +
    "คณะรัฐมนตรี สมาชิกสภาผู้แทนราษฎร และสถิติข้อมูลเปิดภาครัฐ " +
    "ตอบเป็นภาษาไทย กระชับ สุภาพ ตรงประเด็น ถ้าไม่แน่ใจหรือไม่มีข้อมูลให้บอกตรง ๆ อย่าเดา";

  var MAX_TOKENS = 1024;
  var TEMPERATURE = 0.2;

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

    // สล็อตครอบปุ่ม AI + ป้ายข้อความข้างใต้ (ยึดขอบขวา/ซ้ายเป็นหลัก ตัวปุ่มจะไม่ขยับตามความยาวข้อความ)
    "#mdai-fab-slot{position:fixed;right:18px;bottom:20px;z-index:99998;display:flex;flex-direction:column;align-items:flex-end;gap:6px;pointer-events:none;touch-action:none;width:max-content;max-width:calc(100vw - 24px);",
    "transform:translateX(var(--mdai-tx,0px))}",
    "#mdai-fab-slot.mdai-side-l{align-items:flex-start}",
    "#mdai-fab-slot.mdai-anim{transition:transform .26s cubic-bezier(.2,.8,.3,1.15),opacity .2s ease}",

    // แถวปุ่ม AI + ปุ่มย่อทรงกลม
    ".mdai-fab-row{position:relative;display:inline-flex;align-items:center;pointer-events:none}",

    // ปุ่มลอย ✨ ผู้ช่วย AI
    "#mdai-fab{position:relative;display:inline-flex;align-items:center;gap:9px;height:48px;padding:0 20px 0 16px;border:0;border-radius:999px;cursor:pointer;pointer-events:auto;overflow:hidden;isolation:isolate;",
    "touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;box-sizing:border-box;",
    "background:linear-gradient(140deg,rgba(159,180,199,.42),rgba(159,180,199,.14));",
    "box-shadow:0 12px 30px -10px rgba(0,0,0,.55),0 0 16px rgba(0,229,255,.14);",
    "transform:scale(var(--mdai-sc,1));flex:0 0 auto;",
    "transition:box-shadow .18s ease, transform .2s ease, width .24s ease, padding .24s ease, opacity .2s ease}",
    "#mdai-fab:hover{box-shadow:0 16px 36px -12px rgba(0,0,0,.65),0 0 22px rgba(0,229,255,.3)}",
    "#mdai-fab:active{--mdai-sc:.97}",

    // แสงฟ้าวิ่งรอบขอบปุ่ม
    "#mdai-fab::before{content:'';position:absolute;z-index:0;left:50%;top:50%;width:320px;height:320px;pointer-events:none;",
    "transform:translate(-50%,-50%);",
    "background:conic-gradient(from 0deg,transparent 0 60%,rgba(0,229,255,.5) 72%,#9FF1FF 82%,rgba(0,229,255,.5) 92%,transparent 100%);",
    "animation:mdai-spin 3s linear infinite}",
    "#mdai-fab::after{content:'';position:absolute;z-index:1;inset:1.5px;border-radius:999px;pointer-events:none;",
    "background:linear-gradient(140deg,#0D1722 0%,#16222F 55%,#0B141F 100%)}",
    "@keyframes mdai-spin{to{transform:translate(-50%,-50%) rotate(360deg)}}",
    "#mdai-fab svg{position:relative;z-index:2;width:19px;height:19px;color:#7FE8FF;filter:drop-shadow(0 0 6px rgba(0,229,255,.55));flex:0 0 auto}",
    "#mdai-fab b{position:relative;z-index:2;font-family:'Kanit','IBM Plex Sans Thai',sans-serif;font-weight:600;font-size:15px;letter-spacing:.02em;white-space:nowrap;",
    "background:linear-gradient(180deg,#F4F8FC 25%,#9FB4C7 95%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;",
    "transition:max-width .22s ease, opacity .16s ease}",

    // ปุ่มย่อทรงกลม (แบบเดียวกับปุ่มย่อ BB-8)
    ".md-ai-min{position:absolute;z-index:10;width:22px;height:22px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;",
    "cursor:pointer;pointer-events:auto;background:rgba(13,23,34,.94);color:#9FB4C7;-webkit-tap-highlight-color:transparent;",
    "box-shadow:0 4px 12px -4px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.18);top:50%;left:-9px;transform:translateY(-50%);",
    "transition:color .15s,background .15s,box-shadow .15s}",
    ".md-ai-min:hover{color:#CFE9F5;background:rgba(22,36,52,1);box-shadow:0 4px 14px -2px rgba(0,229,255,.4),0 0 0 1px rgba(0,229,255,.5)}",
    ".md-ai-min svg{width:12px;height:12px;display:block}",
    "#mdai-fab-slot.mdai-side-l .md-ai-min{left:auto;right:-9px;transform:translateY(-50%) rotate(180deg)}",

    // สถานะย่อ (Tucked)
    "#mdai-fab.mdai-tuck{gap:0;padding:0 0 0 4px;opacity:.92;width:46px !important}",
    "#mdai-fab-slot.mdai-side-l #mdai-fab.mdai-tuck{justify-content:flex-end;padding:0 4px 0 0}",
    "#mdai-fab.mdai-tuck b{max-width:0;opacity:0;display:none}",
    "#mdai-fab-slot.mdai-tuck .md-ai-min{display:none !important}",

    // ===== ป้ายข้อความพิมพ์ค้นหาจำลอง อยู่ข้างใต้กรอบปุ่ม AI =====
    "#mdai-fab-hint{position:relative;z-index:2;display:inline-flex;align-items:center;gap:6px;padding:5px 12px 5px 9px;border-radius:999px;cursor:pointer;pointer-events:auto;user-select:none;-webkit-user-select:none;touch-action:manipulation;",
    "background:rgba(11,20,31,.92);border:1px solid rgba(0,229,255,.32);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);",
    "box-shadow:0 6px 18px -4px rgba(0,0,0,.6),0 0 14px rgba(0,229,255,.16);",
    "font-family:'Kanit','IBM Plex Sans Thai',sans-serif;font-size:12px;letter-spacing:.01em;line-height:1.2;",
    "max-width:280px;overflow:hidden;white-space:nowrap;margin-left:auto;",
    "transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,opacity .2s ease}",
    "#mdai-fab-slot.mdai-side-l #mdai-fab-hint{margin-left:0;margin-right:auto}",
    "#mdai-fab-hint:hover{border-color:rgba(0,229,255,.75);box-shadow:0 8px 24px -4px rgba(0,0,0,.7),0 0 22px rgba(0,229,255,.38);transform:translateY(-1.5px)}",
    "#mdai-fab-hint:active{transform:scale(.98)}",
    ".mdai-hint-badge{font-weight:600;color:#7FE8FF;flex:0 0 auto;display:inline-flex;align-items:center;gap:3px;text-shadow:0 0 6px rgba(0,229,255,.4)}",
    ".mdai-hint-text{color:#F4F8FC;font-weight:400;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".mdai-hint-cursor{display:inline-block;width:1.5px;height:12px;background:#00E5FF;margin-left:1px;vertical-align:middle;box-shadow:0 0 6px #00E5FF;border-radius:1px;animation:mdai-cursor-blink .8s infinite;flex:0 0 1.5px}",
    "@keyframes mdai-cursor-blink{0%,49%{opacity:1}50%,100%{opacity:0}}",

    // เมื่อย่อ หรือเมื่อเปิดแชต: ซ่อน hint ด้วย display:none
    "#mdai-fab-slot.mdai-tuck #mdai-fab-hint,#mdai-root.mdai-open #mdai-fab-hint{display:none !important}",

    // โหมดสว่างสำหรับ hint
    'html:not([data-theme="dark"]) #mdai-fab-hint{background:rgba(255,255,255,.94);border-color:rgba(5,90,117,.3);box-shadow:0 6px 18px -4px rgba(20,30,60,.18),0 0 12px rgba(9,137,172,.15)}',
    'html:not([data-theme="dark"]) .mdai-hint-badge{color:#055A75;text-shadow:none}',
    'html:not([data-theme="dark"]) .mdai-hint-text{color:#1a1d24}',
    'html:not([data-theme="dark"]) .mdai-hint-cursor{background:#0989AC;box-shadow:0 0 6px #0989AC}',

    // หน้าต่างแชต
    "#mdai-panel{position:fixed;right:18px;bottom:88px;z-index:99999;width:380px;max-width:calc(100vw - 36px);height:70vh;max-height:560px;",
    "display:none;flex-direction:column;overflow:hidden;border-radius:18px;background:var(--mdai-surface);color:var(--mdai-text);",
    "border:1px solid var(--mdai-border);box-shadow:var(--mdai-shadow);opacity:0;transform:translateY(12px) scale(.98);transition:opacity .2s, transform .2s}",
    "#mdai-panel.mdai-show{display:flex;opacity:1;transform:none;animation:mdai-halo 9s ease-in-out infinite}",
    "#mdai-panel::before{content:'';position:absolute;inset:0;border-radius:18px;padding:2px;box-sizing:border-box;pointer-events:none;z-index:5;",
    "background:linear-gradient(120deg,#00E5FF,#3B82F6,#A855F7,#00B5D6,#00E5FF);background-size:300% 300%;",
    "-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;",
    "animation:mdai-flow 6s linear infinite}",
    "@keyframes mdai-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}",
    "@keyframes mdai-halo{0%,100%{box-shadow:var(--mdai-shadow),0 0 24px -6px rgba(0,229,255,.55)}33%{box-shadow:var(--mdai-shadow),0 0 26px -4px rgba(59,130,246,.6)}66%{box-shadow:var(--mdai-shadow),0 0 26px -4px rgba(168,85,247,.55)}}",

    // หัวแชต
    "#mdai-head{position:relative;overflow:hidden;display:flex;align-items:center;gap:10px;padding:14px 16px;background:linear-gradient(135deg,var(--mdai-accent),var(--mdai-accent2));color:var(--mdai-on-accent)}",
    "#mdai-head::before{content:'';position:absolute;inset:-40%;z-index:0;pointer-events:none;mix-blend-mode:screen;",
    "background:radial-gradient(40% 60% at 20% 30%,rgba(0,229,255,.55),transparent 70%),radial-gradient(45% 65% at 75% 65%,rgba(168,85,247,.5),transparent 70%),radial-gradient(35% 50% at 55% 15%,rgba(255,255,255,.4),transparent 70%);",
    "background-size:200% 200%;animation:mdai-aurora 12s ease-in-out infinite}",
    "@keyframes mdai-aurora{0%{background-position:0% 0%}50%{background-position:100% 100%}100%{background-position:0% 0%}}",
    "#mdai-head>*{position:relative;z-index:1}",
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
    ".me .mdai-bubble{background:linear-gradient(135deg,var(--mdai-accent),var(--mdai-accent2));color:var(--mdai-on-accent);border-bottom-right-radius:4px;box-shadow:0 4px 16px -6px rgba(0,181,214,.6)}",
    ".ai .mdai-bubble{background:var(--mdai-surface);color:var(--mdai-text);border:1px solid var(--mdai-border);border-bottom-left-radius:4px}",
    ".ai .mdai-bubble.err{border-color:#d7263d;color:#d7263d}",

    // ชิปคำถามตัวอย่าง (Suggestion Chips)
    ".mdai-suggestions{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 4px;padding:0 2px}",
    ".mdai-chip{background:var(--mdai-surface);border:1px solid var(--mdai-border);color:var(--mdai-text);font-family:inherit;font-size:12px;font-weight:500;padding:6px 12px;border-radius:999px;cursor:pointer;transition:all .16s ease;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.06)}",
    ".mdai-chip:hover{border-color:var(--mdai-accent2);background:linear-gradient(135deg,rgba(0,181,214,.15),rgba(0,229,255,.08));color:var(--mdai-accent2);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,229,255,.22)}",
    ".mdai-chip:active{transform:scale(.97)}",

    // จุดพิมพ์
    ".mdai-typing{display:flex;gap:4px;padding:4px 2px}",
    ".mdai-typing i{width:7px;height:7px;border-radius:50%;background:var(--mdai-dim);animation:mdai-b 1s infinite}",
    ".mdai-typing i:nth-child(1){background:#00E5FF}.mdai-typing i:nth-child(2){background:#3B82F6;animation-delay:.15s}.mdai-typing i:nth-child(3){background:#A855F7;animation-delay:.3s}",
    "@keyframes mdai-b{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}",

    // ช่องพิมพ์
    "#mdai-form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--mdai-border);background:var(--mdai-surface)}",
    "#mdai-input{flex:1;resize:none;border:1px solid var(--mdai-border);border-radius:12px;padding:10px 12px;font:inherit;font-size:14px;",
    "background:var(--mdai-surface2);color:var(--mdai-text);max-height:110px;outline:none}",
    "#mdai-input:focus{border-color:var(--mdai-accent)}",
    "#mdai-send{border:none;border-radius:12px;width:44px;cursor:pointer;color:var(--mdai-on-accent);background:linear-gradient(135deg,var(--mdai-accent),var(--mdai-accent2));display:grid;place-items:center;box-shadow:0 0 14px -3px var(--mdai-accent2);transition:box-shadow .18s,transform .12s}",
    "#mdai-send:hover{box-shadow:0 0 20px -2px var(--mdai-accent2);transform:translateY(-1px)}",
    "#mdai-send:disabled{opacity:.5;cursor:not-allowed}",
    "#mdai-send svg{width:20px;height:20px}",
    "@media(max-width:480px){#mdai-panel{right:10px;left:10px;width:auto;height:76vh}}",
    "@media(prefers-reduced-motion:reduce){#mdai-fab-slot,#mdai-fab,#mdai-panel,#mdai-fab-slot.mdai-anim{transition:none}.mdai-typing i,#mdai-panel.mdai-show,#mdai-panel::before,#mdai-head::before,.mdai-hint-cursor{animation:none}}",
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

    var slot = el('<div id="mdai-fab-slot"></div>');

    var fabRow = el('<div class="mdai-fab-row"></div>');

    var fab = el(
      '<button id="mdai-fab" aria-label="เปิดผู้ช่วย AI">' +
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M11 1.5c.85 4.2 3.45 6.8 7.65 7.65-4.2.85-6.8 3.45-7.65 7.65-.85-4.2-3.45-6.8-7.65-7.65 4.2-.85 6.8-3.45 7.65-7.65Z"/>' +
        '<path d="M19 13.5c.4 2 1.6 3.2 3.6 3.6-2 .4-3.2 1.6-3.6 3.6-.4-2-1.6-3.2-3.6-3.6 2-.4 3.2-1.6 3.6-3.6Z"/></svg>' +
        "<b>ผู้ช่วย AI</b>" +
      '</button>'
    );

    // ปุ่มย่อทรงกลม (แบบเดียวกับ BB-8)
    var minBtn = el(
      '<button type="button" class="md-ai-min" aria-label="ย่อผู้ช่วย AI ไปขอบจอ" title="ย่อไปขอบจอ">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M9 6l6 6-6 6"/>' +
        '</svg>' +
      '</button>'
    );

    fabRow.appendChild(fab);
    fabRow.appendChild(minBtn);

    var hint = el(
      '<div id="mdai-fab-hint" role="button" tabindex="0" title="กดเพื่อคุยกับผู้ช่วย AI">' +
        '<span class="mdai-hint-badge"><svg class="mdico"><use href="#i-lightbulb"></use></svg> ลองถาม:</span>' +
        '<span class="mdai-hint-text"></span>' +
        '<span class="mdai-hint-cursor" aria-hidden="true"></span>' +
      '</div>'
    );

    slot.appendChild(fabRow);
    slot.appendChild(hint);

    var panel = el(
      '<div id="mdai-panel" role="dialog" aria-label="ผู้ช่วย AI ข้อมูลรัฐ">' +
        '<div id="mdai-head"><span class="mdai-dot"></span><div><b>ผู้ช่วย AI ข้อมูลรัฐ</b>' +
        "<span>ถามเรื่องโครงสร้างรัฐ ครม. ส.ส. และสถิติ</span></div>" +
        '<button id="mdai-close" aria-label="ปิด">×</button></div>' +
        '<div id="mdai-msgs"></div>' +
        '<form id="mdai-form"><textarea id="mdai-input" rows="1" placeholder="พิมพ์คำถาม เช่น ครม., ส.ส., กระทรวง…" autocomplete="off"></textarea>' +
        '<button id="mdai-send" type="submit" aria-label="ส่ง"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg></button></form>' +
        "</div>"
    );

    root.appendChild(slot);
    root.appendChild(panel);
    document.body.appendChild(root);

    // ---- Typewriter Effect ข้างใต้ปุ่ม ----
    var WORDS = [
      "ครม. และรัฐมนตรีปัจจุบันมีใครบ้าง?",
      "ค้นหา ส.ส. รายเขต และพรรคการเมือง",
      "โครงสร้างหน่วยงาน 20 กระทรวง 147 กรม",
      "กระทรวง อว. มีหน้าที่อะไรบ้าง?",
      "สถิติงบประมาณรายจ่ายประจำปี 2568",
      "ข้อมูลเปิดภาครัฐ และ ส.ว. กรรมาธิการ",
      "นายกรัฐมนตรีและรายชื่อ ครม. ล่าสุด"
    ];
    var wordIdx = 0;
    var charIdx = 0;
    var isDeleting = false;
    var isHovered = false;
    var typeTimer = null;
    var hintTextEl = hint.querySelector(".mdai-hint-text");

    function tickTypewriter() {
      if (tucked || opened) return;
      if (isHovered) {
        typeTimer = setTimeout(tickTypewriter, 300);
        return;
      }
      if (!hintTextEl) return;
      var cur = WORDS[wordIdx % WORDS.length];

      if (!isDeleting) {
        charIdx++;
        hintTextEl.textContent = cur.substring(0, charIdx);

        if (charIdx >= cur.length) {
          isDeleting = true;
          typeTimer = setTimeout(tickTypewriter, 2600);
          return;
        }
        var spd = 55 + Math.floor(Math.random() * 30);
        typeTimer = setTimeout(tickTypewriter, spd);
      } else {
        charIdx--;
        hintTextEl.textContent = cur.substring(0, charIdx);
        if (charIdx <= 0) {
          isDeleting = false;
          wordIdx++;
          typeTimer = setTimeout(tickTypewriter, 380);
          return;
        }
        typeTimer = setTimeout(tickTypewriter, 28);
      }
    }

    function startTypewriter(delay) {
      clearTimeout(typeTimer);
      if (tucked || opened) return;
      typeTimer = setTimeout(tickTypewriter, typeof delay === "number" ? delay : 1000);
    }

    function stopTypewriter() {
      clearTimeout(typeTimer);
    }

    slot.addEventListener("mouseenter", function () { isHovered = true; });
    slot.addEventListener("mouseleave", function () { isHovered = false; });

    hint.addEventListener("click", function (e) {
      e.stopPropagation();
      var cur = WORDS[wordIdx % WORDS.length];
      open();
      if (cur) {
        var inp = document.getElementById("mdai-input");
        if (inp) {
          inp.value = cur;
          inp.focus();
        }
      }
    });
    hint.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        hint.click();
      }
    });

    // ---- ย่อและกางปุ่ม (Tuck/Untuck) ----
    var TKEY = "mdai-tuck-v8";
    var KEY = "mdai-pos-v8";
    var GAP = 18;
    var tucked = false, skipClick = false, fullW = 0;

    function getTuckOffset() {
      var isL = slot.classList.contains("mdai-side-l");
      return isL ? "-38px" : "38px";
    }

    function tuck() {
      if (tucked) return;
      stopTypewriter();
      fullW = fab.offsetWidth;
      tucked = true;
      slot.classList.add("mdai-anim");
      slot.classList.add("mdai-tuck");
      fab.classList.add("mdai-tuck");
      slot.style.setProperty("--mdai-tx", getTuckOffset());
      fab.setAttribute("aria-label", "แสดงผู้ช่วย AI");
      fab.title = "แสดงผู้ช่วย AI";
      if (opened) close();
      try { localStorage.setItem(TKEY, "1"); } catch (err) {}
    }

    function untuck() {
      if (!tucked) return;
      tucked = false;
      slot.classList.remove("mdai-tuck");
      fab.classList.remove("mdai-tuck");
      slot.style.removeProperty("--mdai-tx");
      setTimeout(function () {
        if (!tucked) slot.classList.remove("mdai-anim");
      }, 280);
      fab.setAttribute("aria-label", "เปิดผู้ช่วย AI");
      fab.removeAttribute("title");
      try { localStorage.setItem(TKEY, "0"); } catch (err) {}
      startTypewriter(500);
    }

    minBtn.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    minBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      tuck();
    });

    // ---- ลากย้ายปุ่มได้ (Pointer Events) ยึดขอบมั่นคง ไม่ดันหลุดจอ ----
    var drag = { active: false, moved: false, touch: false, px: 0, py: 0, bx: 0, by: 0 };

    function setDragPos(clientX, clientY) {
      var W = window.innerWidth, H = window.innerHeight;
      var dx = clientX - drag.px, dy = clientY - drag.py;
      var curX = drag.bx + dx, curY = drag.by + dy;
      var isL = curX + 100 < W / 2;

      curY = Math.min(Math.max(10, curY), H - 90);

      if (isL) {
        slot.style.left = Math.max(10, curX) + "px";
        slot.style.right = "auto";
        slot.classList.add("mdai-side-l");
      } else {
        var rDist = Math.max(10, W - (curX + fab.offsetWidth));
        slot.style.right = rDist + "px";
        slot.style.left = "auto";
        slot.classList.remove("mdai-side-l");
      }
      slot.style.top = curY + "px";
      slot.style.bottom = "auto";
    }

    function snap(animate) {
      var r = fab.getBoundingClientRect(), W = window.innerWidth;
      var isL = r.left + r.width / 2 < W / 2;

      if (animate) {
        var prev = slot.style.transition;
        slot.style.transition = "left .28s cubic-bezier(.2,.8,.3,1.15), right .28s cubic-bezier(.2,.8,.3,1.15), top .28s ease";
        setTimeout(function () { slot.style.transition = prev || ""; }, 320);
      }

      if (isL) {
        slot.style.left = GAP + "px";
        slot.style.right = "auto";
        slot.classList.add("mdai-side-l");
      } else {
        slot.style.right = GAP + "px";
        slot.style.left = "auto";
        slot.classList.remove("mdai-side-l");
      }
    }

    fab.addEventListener("pointerdown", function (e) {
      if (tucked) {
        skipClick = true;
        untuck();
        return;
      }
      drag.active = true;
      drag.moved = false;
      drag.touch = e.pointerType === "touch";
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
      var thr = drag.touch ? 144 : 25;
      if (!drag.moved && dx * dx + dy * dy < thr) return;
      drag.moved = true;
      setDragPos(e.clientX, e.clientY);
    });

    function endDrag() {
      if (drag.active && drag.moved) {
        snap(true);
        var r = fab.getBoundingClientRect(), W = window.innerWidth;
        var isL = r.left + r.width / 2 < W / 2;
        try {
          localStorage.setItem(KEY, JSON.stringify({ side: isL ? "left" : "right", top: parseFloat(slot.style.top) || 0 }));
        } catch (err) {}
        if (opened) placePanel();
      }
      drag.active = false;
    }
    fab.addEventListener("pointerup", endDrag);
    fab.addEventListener("pointercancel", endDrag);

    fab.addEventListener("click", function () {
      if (skipClick) { skipClick = false; return; }
      if (drag.moved) { drag.moved = false; return; }
      toggle();
    });

    // คืนตำแหน่งที่เคยลากไว้
    try {
      var sp = JSON.parse(localStorage.getItem(KEY) || "null");
      if (sp && (sp.side === "left" || sp.side === "right")) {
        if (sp.side === "left") {
          slot.style.left = GAP + "px";
          slot.style.right = "auto";
          slot.classList.add("mdai-side-l");
        } else {
          slot.style.right = GAP + "px";
          slot.style.left = "auto";
          slot.classList.remove("mdai-side-l");
        }
        if (typeof sp.top === "number" && sp.top > 0) {
          slot.style.top = sp.top + "px";
          slot.style.bottom = "auto";
        }
      }
    } catch (err) {}

    // คืนสถานะย่อถ้าเคยย่อไว้
    try {
      if (localStorage.getItem(TKEY) === "1") {
        tuck();
      }
    } catch (err) {}

    window.addEventListener("resize", function () {
      snap(false);
      if (tucked) slot.style.setProperty("--mdai-tx", getTuckOffset());
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

    // ข้อความต้อนรับ + ชิปคำถามตัวอย่างในกล่องแชต
    addBubble("ai", "สวัสดีครับ ผมเป็นผู้ช่วย AI ข้อมูลรัฐ ถามได้เลยครับ", false, "hand");

    var msgsContainer = panel.querySelector("#mdai-msgs");
    var sug = el(
      '<div class="mdai-suggestions" id="mdai-sug">' +
        '<button type="button" class="mdai-chip" data-q="ครม. และรัฐมนตรีปัจจุบันมีใครบ้าง?"><svg class="mdico"><use href="#i-landmark"></use></svg> ครม. ปัจจุบัน</button>' +
        '<button type="button" class="mdai-chip" data-q="ค้นหา ส.ส. รายเขต และพรรคการเมือง"><svg class="mdico"><use href="#i-users"></use></svg> ค้นหา ส.ส.</button>' +
        '<button type="button" class="mdai-chip" data-q="โครงสร้างหน่วยงาน 20 กระทรวง 147 กรม"><svg class="mdico"><use href="#i-folder-open"></use></svg> 20 กระทรวง</button>' +
        '<button type="button" class="mdai-chip" data-q="สถิติงบประมาณรายจ่ายประจำปี 2568 เป็นอย่างไร?"><svg class="mdico"><use href="#i-chart-column"></use></svg> งบประมาณ 68</button>' +
        '<button type="button" class="mdai-chip" data-q="กระทรวง อว. มีหน้าที่อะไรบ้าง?"><svg class="mdico"><use href="#i-microscope"></use></svg> หน้าที่กระทรวง อว.</button>' +
      '</div>'
    );
    msgsContainer.appendChild(sug);
    sug.addEventListener("click", function (e) {
      var chip = e.target.closest(".mdai-chip");
      if (!chip) return;
      var q = chip.getAttribute("data-q");
      if (q) {
        sug.remove();
        send(q);
      }
    });

    if (!tucked) startTypewriter(1200);

    window._mdai_startTypewriter = startTypewriter;
    window._mdai_stopTypewriter = stopTypewriter;
  }

  // ---------- การทำงาน ----------
  function toggle() {
    opened ? close() : open();
  }

  function placePanel() {
    var p = document.getElementById("mdai-panel");
    if (!p) return;
    if (window.innerWidth <= 480) {
      p.style.left = p.style.right = p.style.top = p.style.bottom = "";
      return;
    }
    var fab = document.getElementById("mdai-fab");
    var r = fab ? fab.getBoundingClientRect() : { left: window.innerWidth - 180, right: window.innerWidth - 18, top: window.innerHeight - 80, bottom: window.innerHeight - 20, width: 160 };
    var W = window.innerWidth, H = window.innerHeight;
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
    var root = document.getElementById("mdai-root");
    if (root) root.classList.add("mdai-open");
    if (window._mdai_stopTypewriter) window._mdai_stopTypewriter();
    var p = document.getElementById("mdai-panel");
    placePanel();
    p.classList.add("mdai-show");
    document.getElementById("mdai-input").focus();
  }

  function close() {
    opened = false;
    var root = document.getElementById("mdai-root");
    if (root) root.classList.remove("mdai-open");
    document.getElementById("mdai-panel").classList.remove("mdai-show");
    if (window._mdai_startTypewriter) window._mdai_startTypewriter(500);
  }

  function addBubble(who, text, isErr, icon) {
    var msgs = document.getElementById("mdai-msgs");
    var row = document.createElement("div");
    row.className = "mdai-row " + (who === "me" ? "me" : "ai");
    var b = document.createElement("div");
    b.className = "mdai-bubble" + (isErr ? " err" : "");
    if (icon) {
      var ic = document.createElement("span");
      ic.innerHTML = typeof MDICO === "function" ? MDICO(icon) : "";
      b.appendChild(ic);
      b.appendChild(document.createTextNode(" "));
    }
    b.appendChild(document.createTextNode(text));
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

    var sug = document.getElementById("mdai-sug");
    if (sug) sug.remove();

    if (PROXY_URL.indexOf("YOUR-SITE") !== -1) {
      addBubble("ai", "ยังไม่ได้ตั้งค่า PROXY_URL — แก้ในไฟล์ js/ai-chat.js ให้เป็น URL Netlify ของคุณก่อนครับ", true, "settings");
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
