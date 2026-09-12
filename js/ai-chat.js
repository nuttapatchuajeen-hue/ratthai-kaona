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

  // ---- โมเดล AI ที่เลือกได้ในแผงแชต (id ต้องตรงกับ MODEL_CONFIGS ฝั่ง proxy) ----
  // ตัวแรกคือค่าเริ่มต้น — ระบุชื่อรุ่นจริงไปเลย ไม่ใช้ "อัตโนมัติ" ที่ไม่บอกว่าได้ตัวไหน
  var MODELS = [
    { id: "openthaigpt-thaillm-8b-instruct-v7.2", label: "ThaiLLM 8B (ไทย)" },
    // ติด soon: true ให้รุ่นที่ proxy ยังใช้ไม่ได้ — จะขึ้น "(ยังไม่พร้อม)" และกดไม่ได้
    // (Gemini 2.5 Flash ถูก Google ปลดระวาง 404 แล้ว 12 ก.ย. 69 → ใช้ 3.6 แทน)
    { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
    { id: "gemini-flash-latest", label: "Gemini Flash (ล่าสุด)" },
  ];
  var MODEL_KEY = "mdai-model-v1";
  var model = readModel();

  function readModel() {
    var v = "";
    try { v = localStorage.getItem(MODEL_KEY) || ""; } catch (err) { v = ""; }
    for (var i = 0; i < MODELS.length; i++) {
      if (MODELS[i].id === v && !MODELS[i].soon) return v;
    }
    return MODELS[0].id;
  }

  function saveModel(v) {
    model = v;
    try { localStorage.setItem(MODEL_KEY, v); } catch (err) {}
  }

  function modelLabel() {
    for (var i = 0; i < MODELS.length; i++) {
      if (MODELS[i].id === model) return MODELS[i].label;
    }
    return MODELS[0].label;
  }

  var ICO_CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  function modelMenuHtml() {
    var out = "";
    for (var i = 0; i < MODELS.length; i++) {
      out +=
        '<button type="button" role="option" data-id="' + MODELS[i].id + '" ' +
        (MODELS[i].soon ? 'disabled aria-disabled="true" ' : "") +
        'aria-selected="' + (MODELS[i].id === model ? "true" : "false") + '">' +
        "<i>" + MODELS[i].label + (MODELS[i].soon ? " (ยังไม่พร้อม)" : "") + "</i>" +
        ICO_CHECK + "</button>";
    }
    return out;
  }

  // ---- ข้อความ placeholder ที่หมุนสลับในช่องพิมพ์ ----
  var PLACEHOLDERS = [
    "พิมพ์คำถาม เช่น ครม., ส.ส., กระทรวง…",
    "ครม. ชุดปัจจุบันมีใครบ้าง?",
    "ส.ส. เขตนี้เป็นของพรรคอะไร?",
    "กระทรวงไหนดูแลเรื่องนี้?",
    "ขอสถิติงบประมาณล่าสุด",
  ];
  var phSync = null; // build() จะกำหนดให้ ใช้ซิงก์ placeholder หลังส่งข้อความ

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

    // แถบ "กำลังคิด… / คิดอยู่ X วินาที" (กางดูเหตุผลจากบล็อก <think> ของโมเดล)
    ".mdai-think{align-self:flex-start;display:flex;flex-direction:column;max-width:92%;margin-bottom:-4px}",
    ".mdai-think-btn{display:inline-flex;align-items:center;gap:6px;width:fit-content;margin-left:-6px;padding:4px 6px;border:0;border-radius:8px;",
    "background:transparent;color:var(--mdai-dim);font:inherit;font-size:12.5px;font-weight:600;cursor:default;transition:background-color .12s}",
    '.mdai-think[data-ready="1"] .mdai-think-btn{cursor:pointer}',
    '.mdai-think[data-ready="1"] .mdai-think-btn:hover{background:var(--mdai-surface2)}',
    ".mdai-think-btn svg{flex:0 0 auto}",
    ".mdai-think-spark{width:15px;height:15px;color:var(--mdai-accent2)}",
    ".mdai-think-chev{width:13px;height:13px;opacity:.7;transition:transform .3s cubic-bezier(.23,1,.32,1)}",
    '.mdai-think[data-open="1"] .mdai-think-chev{transform:rotate(180deg)}',

    // ตัวหนังสือเหลือบแสงระหว่างรอคำตอบ
    ".mdai-think-live{background:linear-gradient(90deg,var(--mdai-dim) 35%,var(--mdai-text) 50%,var(--mdai-dim) 65%);background-size:200% 100%;",
    "-webkit-background-clip:text;background-clip:text;color:transparent;animation:mdai-shimmer 1.4s linear infinite}",
    "@keyframes mdai-shimmer{0%{background-position:150%}100%{background-position:-50%}}",
    ".mdai-think-done{animation:mdai-fade-in .35s ease-out both}",
    "@keyframes mdai-fade-in{from{opacity:0}to{opacity:1}}",

    // เนื้อหาเหตุผลที่กางออก
    ".mdai-think-body{display:grid;grid-template-rows:0fr;opacity:0;",
    "transition:grid-template-rows .4s cubic-bezier(.23,1,.32,1),opacity .4s cubic-bezier(.23,1,.32,1)}",
    '.mdai-think[data-open="1"] .mdai-think-body{grid-template-rows:1fr;opacity:1}',
    ".mdai-think-body>div{overflow:hidden}",
    ".mdai-think-text{margin:2px 0 0 7px;padding:4px 0 4px 14px;border-left:1px solid var(--mdai-border);",
    "font-size:12.5px;line-height:1.7;color:var(--mdai-dim);white-space:pre-wrap;word-wrap:break-word}",
    '.mdai-think[data-open="1"] .mdai-think-text{animation:mdai-fade-up .32s cubic-bezier(.23,1,.32,1) both}',
    "@keyframes mdai-fade-up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",

    // ช่องพิมพ์ = การ์ดมน มีแถบเครื่องมืออยู่ในตัว
    "#mdai-form{padding:12px;background:var(--mdai-surface)}",
    "#mdai-composer{position:relative;box-sizing:border-box;padding:10px 12px 8px;border:2px solid var(--mdai-border);border-radius:24px;background:var(--mdai-surface2);",
    "transition:border-color .2s cubic-bezier(.2,0,0,1),box-shadow .28s cubic-bezier(.2,0,0,1)}",
    "#mdai-composer.mdai-focus{border-color:var(--mdai-accent2);box-shadow:0 2px 8px rgba(8,8,8,.06),0 16px 40px -14px rgba(0,181,214,.5)}",

    // ช่องพิมพ์ + ป้าย placeholder ที่หมุนสลับ
    "#mdai-field{position:relative;min-height:26px}",
    "#mdai-ph{position:absolute;left:2px;right:2px;top:0;height:26px;overflow:hidden;pointer-events:none}",
    "#mdai-ph span{display:block;font-size:14px;line-height:26px;color:var(--mdai-dim);opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    "#mdai-ph span.mdai-ph-in{animation:mdai-ph-in .34s cubic-bezier(.2,0,0,1)}",
    "#mdai-ph span.mdai-ph-out{animation:mdai-ph-out .34s cubic-bezier(.2,0,0,1) forwards}",
    "@keyframes mdai-ph-in{from{opacity:0;transform:translateY(6px);filter:blur(4px)}to{opacity:.75;transform:none;filter:blur(0)}}",
    "@keyframes mdai-ph-out{from{opacity:.75;transform:none;filter:blur(0)}to{opacity:0;transform:translateY(-6px);filter:blur(4px)}}",
    "#mdai-input{display:block;box-sizing:border-box;width:100%;resize:none;border:0;background:transparent;padding:0 2px;font:inherit;font-size:14px;line-height:26px;",
    "color:var(--mdai-text);max-height:110px;outline:none}",

    // แถบเครื่องมือด้านล่างในกล่องพิมพ์
    "#mdai-bar{display:flex;align-items:center;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid var(--mdai-border)}",
    "#mdai-mwrap{flex:1;min-width:0}",
    "#mdai-mtrigger{display:inline-flex;align-items:center;gap:6px;max-width:100%;min-height:32px;padding:4px 8px;border:0;border-radius:10px;background:transparent;",
    "color:var(--mdai-dim);font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:background-color .2s,color .2s}",
    '#mdai-mtrigger:hover,#mdai-mtrigger[aria-expanded="true"]{background:var(--mdai-surface);color:var(--mdai-text)}',
    "#mdai-mtrigger span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "#mdai-mtrigger svg{width:13px;height:13px;flex:0 0 auto;opacity:.6;transition:transform .2s cubic-bezier(.2,0,0,1)}",
    '#mdai-mtrigger[aria-expanded="true"] svg{transform:rotate(180deg)}',

    // เมนูเลือกโมเดล — ยึดกับ #mdai-composer (mwrap ตั้งใจไม่ใส่ position) จะได้ลอยเหนือการ์ดทั้งใบ ไม่บังช่องพิมพ์
    "#mdai-mmenu{position:absolute;left:0;bottom:calc(100% + 18px);z-index:20;display:none;min-width:210px;max-width:min(280px,calc(100vw - 64px));",
    "padding:6px;border:2px solid var(--mdai-border);border-radius:16px;background:var(--mdai-surface);transform-origin:bottom left;",
    "box-shadow:0 8px 30px -8px rgba(8,8,8,.3),0 2px 8px -2px rgba(8,8,8,.12)}",
    "#mdai-mmenu.mdai-open{display:block;animation:mdai-menu-in .2s cubic-bezier(.2,0,0,1)}",
    "@keyframes mdai-menu-in{from{opacity:0;transform:translateY(6px) scale(.96);filter:blur(4px)}to{opacity:1;transform:none;filter:blur(0)}}",
    "#mdai-mmenu button{display:flex;width:100%;box-sizing:border-box;align-items:center;gap:8px;padding:8px 10px;border:0;border-radius:11px;background:transparent;",
    "color:var(--mdai-dim);font:inherit;font-size:13px;font-weight:500;text-align:left;cursor:pointer;transition:background-color .15s,color .15s}",
    '#mdai-mmenu button:hover,#mdai-mmenu button[aria-selected="true"]{background:var(--mdai-surface2);color:var(--mdai-text)}',
    "#mdai-mmenu button[disabled]{opacity:.45;cursor:not-allowed;background:transparent;color:var(--mdai-dim)}",
    "#mdai-mmenu button i{flex:1;min-width:0;font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "#mdai-mmenu button svg{width:14px;height:14px;flex:0 0 auto;color:var(--mdai-accent2);opacity:0;transform:scale(.25);",
    "transition:opacity .2s,transform .2s cubic-bezier(.2,0,0,1)}",
    '#mdai-mmenu button[aria-selected="true"] svg{opacity:1;transform:none}',

    // ปุ่มส่งวงกลม
    "#mdai-send{flex:0 0 auto;width:40px;height:40px;border:none;border-radius:50%;cursor:pointer;color:var(--mdai-on-accent);display:grid;place-items:center;",
    "background:linear-gradient(180deg,var(--mdai-accent2),var(--mdai-accent));",
    "box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 0 14px -3px var(--mdai-accent2);",
    "transition:box-shadow .2s,transform .18s cubic-bezier(.2,0,0,1)}",
    "#mdai-send:hover{transform:scale(1.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 0 0 4px rgba(0,229,255,.12),0 0 22px -2px var(--mdai-accent2)}",
    "#mdai-send:active{transform:scale(.94)}",
    "#mdai-send:disabled{opacity:.5;cursor:not-allowed;transform:none}",
    "#mdai-send svg{width:18px;height:18px}",
    "@media(max-width:480px){#mdai-panel{right:10px;left:10px;width:auto;height:76vh}}",
    "@media(prefers-reduced-motion:reduce){#mdai-fab-slot,#mdai-fab,#mdai-panel,#mdai-fab-slot.mdai-anim{transition:none}.mdai-typing i,#mdai-panel.mdai-show,#mdai-panel::before,#mdai-head::before,.mdai-hint-cursor,#mdai-ph span,#mdai-mmenu.mdai-open,.mdai-think-live,.mdai-think-done,.mdai-think-text{animation:none}.mdai-think-live{color:var(--mdai-dim);-webkit-text-fill-color:currentColor}.mdai-think-body{transition:none}#mdai-composer,#mdai-send,#mdai-mtrigger svg{transition:none}}",
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
        '<form id="mdai-form"><div id="mdai-composer">' +
        '<div id="mdai-field"><div id="mdai-ph" aria-hidden="true"><span></span></div>' +
        '<textarea id="mdai-input" rows="1" aria-label="พิมพ์คำถาม" autocomplete="off"></textarea></div>' +
        '<div id="mdai-bar"><div id="mdai-mwrap">' +
        '<button type="button" id="mdai-mtrigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="mdai-mmenu">' +
        '<span id="mdai-mlabel"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>' +
        '<div id="mdai-mmenu" role="listbox" aria-label="เลือกโมเดล AI"></div></div>' +
        '<button id="mdai-send" type="submit" aria-label="ส่ง"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg></button>' +
        "</div></div></form>" +
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

    // ---- เมนูเลือกโมเดล (ทำเอง ไม่ใช้ <select> ของระบบ) ----
    var mTrigger = panel.querySelector("#mdai-mtrigger");
    var mMenu = panel.querySelector("#mdai-mmenu");
    var mLabel = panel.querySelector("#mdai-mlabel");
    mMenu.innerHTML = modelMenuHtml();
    mLabel.textContent = modelLabel();

    function menuOpen() {
      return mMenu.classList.contains("mdai-open");
    }
    function closeMenu() {
      mMenu.classList.remove("mdai-open");
      mTrigger.setAttribute("aria-expanded", "false");
    }
    function paintMenu() {
      mLabel.textContent = modelLabel();
      var btns = mMenu.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) {
        btns[i].setAttribute(
          "aria-selected",
          btns[i].getAttribute("data-id") === model ? "true" : "false"
        );
      }
    }

    mTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      if (menuOpen()) closeMenu();
      else {
        mMenu.classList.add("mdai-open");
        mTrigger.setAttribute("aria-expanded", "true");
      }
    });
    mMenu.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("button[data-id]") : null;
      if (!btn) return;
      saveModel(btn.getAttribute("data-id"));
      paintMenu();
      closeMenu();
      mTrigger.focus();
    });
    document.addEventListener("click", function (e) {
      if (!menuOpen()) return;
      if (!mMenu.contains(e.target) && !mTrigger.contains(e.target)) closeMenu();
    });

    // ---- placeholder หมุนสลับ (โชว์เฉพาะตอนช่องว่างและไม่ได้โฟกัส) ----
    var phBox = panel.querySelector("#mdai-ph");
    var phSpan = phBox.firstChild;
    var phIdx = 0;
    phSpan.textContent = PLACEHOLDERS[0];

    phSync = function () {
      var box = document.getElementById("mdai-input");
      var show = !!box && !box.value && document.activeElement !== box;
      phBox.style.display = show ? "" : "none";
    };
    phSync();

    setInterval(function () {
      if (!opened || phBox.style.display === "none" || PLACEHOLDERS.length < 2) return;
      phSpan.className = "mdai-ph-out";
      setTimeout(function () {
        phIdx = (phIdx + 1) % PLACEHOLDERS.length;
        phSpan.textContent = PLACEHOLDERS[phIdx];
        phSpan.className = "mdai-ph-in";
      }, 340);
    }, 3600);
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
      phSync();
    });

    var composer = panel.querySelector("#mdai-composer");
    input.addEventListener("focus", function () {
      composer.classList.add("mdai-focus");
      phSync();
    });
    input.addEventListener("blur", function () {
      composer.classList.remove("mdai-focus");
      phSync();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !opened) return;
      if (menuOpen()) {
        closeMenu();
        mTrigger.focus();
        return;
      }
      close();
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

  // แยกเหตุผลในบล็อก <think>…</think> ออกจากคำตอบ (ThaiLLM ส่งมาแบบนี้)
  function splitThink(raw) {
    var think = "";
    var text = String(raw || "").replace(
      /<think>([\s\S]*?)(<\/think>|$)/g,
      function (_m, inner) {
        think += inner;
        return "";
      }
    );
    return { think: think.trim(), text: text };
  }

  var ICO_SPARK =
    '<svg class="mdai-think-spark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>';
  var ICO_CHEV_SM =
    '<svg class="mdai-think-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M6 9l6 6 6-6"/></svg>';

  var thinkStart = 0;

  function showThinking() {
    thinkStart = Date.now();
    var msgs = document.getElementById("mdai-msgs");
    var box = document.createElement("div");
    box.className = "mdai-think";
    box.id = "mdai-think-row";
    box.setAttribute("data-open", "0");
    box.innerHTML =
      '<button type="button" class="mdai-think-btn" aria-expanded="false">' +
      ICO_SPARK +
      '<span class="mdai-think-label mdai-think-live">กำลังคิด…</span></button>' +
      '<div class="mdai-think-body"><div><div class="mdai-think-text"></div></div></div>';
    msgs.appendChild(box);
  }

  // จบการคิด: ถ้าไม่มีเหตุผลให้โชว์ ก็เอาแถบออกไปเลย
  function settleThinking(think) {
    var box = document.getElementById("mdai-think-row");
    if (!box) return;
    if (!think) {
      box.remove();
      return;
    }
    var secs = Math.max(1, Math.round((Date.now() - thinkStart) / 1000));
    var label = box.querySelector(".mdai-think-label");
    label.className = "mdai-think-label mdai-think-done";
    label.textContent = "คิดอยู่ " + secs + " วินาที";

    var btn = box.querySelector(".mdai-think-btn");
    btn.insertAdjacentHTML("beforeend", ICO_CHEV_SM);
    box.querySelector(".mdai-think-text").textContent = think;
    box.id = "";
    box.setAttribute("data-ready", "1");
    btn.addEventListener("click", function () {
      var open = box.getAttribute("data-open") === "1";
      box.setAttribute("data-open", open ? "0" : "1");
      btn.setAttribute("aria-expanded", open ? "false" : "true");
    });
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
    if (phSync) phSync();
    addBubble("me", text);
    messages.push({ role: "user", content: text });

    busy = true;
    document.getElementById("mdai-send").disabled = true;
    showThinking();
    showTyping();

    fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        model
          ? { messages: messages, model: model, max_tokens: MAX_TOKENS, temperature: TEMPERATURE }
          : { messages: messages, max_tokens: MAX_TOKENS, temperature: TEMPERATURE }
      ),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(data.error || "HTTP " + r.status);
          return data;
        });
      })
      .then(function (data) {
        hideTyping();
        var msg = (data.choices && data.choices[0] && data.choices[0].message) || {};
        var split = splitThink(msg.content);
        // บางค่ายส่งเหตุผลมาเป็นฟิลด์แยกแทนที่จะฝังใน <think>
        settleThinking(split.think || String(msg.reasoning_content || "").trim());
        var reply = split.text.trim() || "ขออภัย ไม่ได้รับคำตอบครับ";
        messages.push({ role: "assistant", content: reply });
        addBubble("ai", reply);
      })
      .catch(function (err) {
        hideTyping();
        settleThinking("");
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
