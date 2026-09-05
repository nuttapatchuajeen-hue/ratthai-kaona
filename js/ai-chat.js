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
  // คำสั่งระบบ (บุคลิก/ขอบเขตของผู้ช่วย + ฐานข้อมูลรัฐไทย มิ.ย. 2569)
  var SYSTEM_PROMPT =
    "คุณคือ 'ผู้ช่วย AI ข้อมูลรัฐ' ของเว็บ 'รัฐไทยก้าวหน้า' ตอบคำถามเรื่องโครงสร้างภาครัฐไทย คณะรัฐมนตรี สมาชิกรัฐสภา และสถิติข้อมูลเปิดภาครัฐ ตอบภาษาไทย กระชับ สุภาพ ตรงประเด็น\n" +
    "กฎสำคัญที่สุด: ต้องยึดตาม [ข้อมูลอ้างอิง] ด้านล่างเสมอ — เป็นข้อมูลปัจจุบัน (มิ.ย. 2569) ที่ใหม่กว่าความรู้เดิมของคุณ ห้ามตอบขัดแย้งกับข้อมูลนี้ ถ้าคำถามอยู่นอกเหนือข้อมูลอ้างอิงและไม่แน่ใจ ให้บอกตรง ๆ ว่าไม่มีข้อมูล อย่าเดา และแนะนำหน้าเว็บที่เกี่ยวข้องแทน\n\n" +
    "[ข้อมูลอ้างอิง — มิถุนายน 2569]\n" +
    "■ กระทรวง: ประเทศไทยมี 20 กระทรวง (นับรวมสำนักนายกรัฐมนตรีซึ่งมีฐานะเทียบเท่ากระทรวง) รวมหน่วยงานในกำกับ 278 หน่วยงาน ได้แก่ สำนักนายกรัฐมนตรี, กลาโหม, การคลัง, การต่างประเทศ, การท่องเที่ยวและกีฬา, การพัฒนาสังคมและความมั่นคงของมนุษย์ (พม.), เกษตรและสหกรณ์, คมนาคม, ทรัพยากรธรรมชาติและสิ่งแวดล้อม, ดิจิทัลเพื่อเศรษฐกิจและสังคม, พลังงาน, พาณิชย์, มหาดไทย, ยุติธรรม, แรงงาน, วัฒนธรรม, การอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม (อว.), ศึกษาธิการ, สาธารณสุข, อุตสาหกรรม\n" +
    "■ คณะรัฐมนตรี: คณะที่ 66 รัฐบาลอนุทิน ชาญวีรกูล (เริ่ม 30 มี.ค. 2569) มีรัฐมนตรี 35 คน\n" +
    "· นายกรัฐมนตรี: อนุทิน ชาญวีรกูล (ควบ รมว.มหาดไทย)\n" +
    "· รองนายกรัฐมนตรี 7 คน: พิพัฒน์ รัชกิจประการ (ควบ รมว.คมนาคม), เอกนิติ นิติทัณฑ์ประภาศ (ควบ รมว.การคลัง), สีหศักดิ์ พวงเกตุแก้ว (ควบ รมว.การต่างประเทศ), ศุภจี สุธรรมพันธุ์ (ควบ รมว.พาณิชย์), ยศชนัน วงศ์สวัสดิ์ (ควบ รมว.อว.), ทรงศักดิ์ ทองศรี, ปกรณ์ นิลประพันธ์\n" +
    "· รมว.กระทรวงอื่น: กลาโหม=อดุลย์ บุญธรรมเจริญ · ท่องเที่ยวฯ=สุรศักดิ์ พันธ์เจริญวรกุล · พม.=นิกร โสมกลาง · เกษตรฯ=สุริยะ จึงรุ่งเรืองกิจ · ทรัพยากรฯ=สุชาติ ชมกลิ่น · ดิจิทัลฯ=ไชยชนก ชิดชอบ · พลังงาน=เอกนัฏ พร้อมพันธุ์ · ยุติธรรม=รุทธพล เนาวรัตน์ · แรงงาน=จุลพันธ์ อมรวิวัฒน์ · วัฒนธรรม=ซาบีดา ไทยเศรษฐ์ · ศึกษาธิการ=ประเสริฐ จันทรรวงทอง · สาธารณสุข=พัฒนา พร้อมพัฒน์ · อุตสาหกรรม=วราวุธ ศิลปอาชา\n" +
    "· รมต.ประจำสำนักนายกฯ 4 คน: ศุภมาส อิศรภักดี, นภินทร ศรีสรรพางค์, ภราดร ปริศนานันทกุล, สุขสมรวย วันทนียกุล\n" +
    "· รมช.: เกษตรฯ (วัชระพล ขาวขำ, ปิยะรัฐชย์ ติยะไพรัช) · คมนาคม (สิริพงศ์ อังคสกุลเกียรติ, ภัทรพงศ์ ภัทรประสิทธิ์, สรรเพชญ บุญญามณี) · ดิจิทัลฯ (บุณย์ธิดา สมชัย) · มหาดไทย (พลพีร์ สุวรรณฉวี, เจเศรษฐ์ ไทยเศรษฐ์, วรศิษฎ์ เลียงประสิทธิ์) · ศึกษาธิการ (อัครนันท์ กัณณ์กิตตินันท์)\n" +
    "■ สภาผู้แทนราษฎร (เลือกตั้ง 2569): ส.ส. 500 คน = แบ่งเขต 400 + บัญชีรายชื่อ 100 จาก 22 พรรค — ภูมิใจไทย 193 (เขต 174+บัญชี 19), ประชาชน 118 (87+31), เพื่อไทย 74 (58+16), กล้าธรรม 58 (56+2), ประชาธิปัตย์ 22 (10+12), ไทรวมพลัง 6, ประชาชาติ 5, พลังประชารัฐ 5, เศรษฐกิจ 3, ไทยสร้างไทย 2, รวมไทยสร้างชาติ 2, เพื่อชาติไทย 2 และอีก 10 พรรคได้พรรคละ 1 ที่นั่ง\n" +
    "■ รัฐสภา: ส.ส. 500 + สมาชิกวุฒิสภา (สว.) 200 = ประชุมร่วมกัน 700 คน · ประธานสภาผู้แทนราษฎร (= ประธานรัฐสภา): โสภณ ซารัมย์ (ภูมิใจไทย) · รองประธานสภาฯ คนที่ 1: มัลลิกา จิระพันธุ์วาณิช · คนที่ 2: เลิศศักดิ์ พัฒนชัยกุล · ประธานวุฒิสภา (= รองประธานรัฐสภา): มงคล สุระสัจจะ\n" +
    "■ หน้าในเว็บนี้: หน้าหลัก + เกี่ยวกับเรา · โครงสร้างรัฐไทย (แผนผังกระทรวง-กรม) · เลือกตั้ง (รายเขต, บัญชีรายชื่อ, คะแนนพรรค + เพลงประจำพรรค, ผังที่นั่งรัฐสภา) · ทำเนียบคณะรัฐมนตรี · สถิติข้อมูลรัฐ (จาก data.go.th และ World Bank) · แบบประเมินความพึงพอใจเว็บไซต์ (หน้า 'แบบประเมิน' — เชิญผู้ใช้ร่วมตอบได้) · ผู้จัดทำเว็บ: ณัฐภัทร ช่วยจีน (Master Nook)";

  var MAX_TOKENS = 1024;
  var TEMPERATURE = 0.2;

  // ---- รายการโมเดล AI ที่รองรับ ----
  var AI_MODELS = [
    {
      id: "gemini-2.0-flash",
      name: "Gemini 2.0 Flash",
      badge: "Google",
      icon: "⚡",
      tag: "แนะนำ · ตอบเร็วมาก ฉลาดล่าสุด ฟรี",
    },
    {
      id: "gemini-1.5-flash",
      name: "Gemini 1.5 Flash",
      badge: "Google",
      icon: "✨",
      tag: "เสถียร · ประหยัดโทเคน",
    },
    {
      id: "openthaigpt-thaillm-8b-instruct-v7.2",
      name: "ThaiLLM 8B",
      badge: "OpenThaiGPT",
      icon: "🇹🇭",
      tag: "โมเดลภาษาไทยเฉพาะทางภาครัฐ",
    },
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      badge: "OpenAI",
      icon: "🧠",
      tag: "ฉลาด คมชัด · วิเคราะห์ลึกซึ้ง",
    },
    {
      id: "deepseek-chat",
      name: "DeepSeek Chat",
      badge: "DeepSeek",
      icon: "🎯",
      tag: "ตรรกะสูง · ตอบตรงประเด็น",
    },
    {
      id: "claude-3-5-haiku-20241022",
      name: "Claude 3.5 Haiku",
      badge: "Anthropic",
      icon: "✒️",
      tag: "ภาษาธรรมชาติ · เรียบเรียงสละสลวย",
    },
  ];

  var MODEL_STORAGE_KEY = "mdai-selected-model-v2";
  var selectedModelId = "gemini-2.0-flash";
  try {
    var stored = localStorage.getItem(MODEL_STORAGE_KEY);
    if (stored && AI_MODELS.some(function (m) { return m.id === stored; })) {
      selectedModelId = stored;
    }
  } catch (err) {}

  function getSelectedModel() {
    for (var i = 0; i < AI_MODELS.length; i++) {
      if (AI_MODELS[i].id === selectedModelId) return AI_MODELS[i];
    }
    return AI_MODELS[0];
  }

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

    // แถบเลือกโมเดล (Model Selector Bar)
    "#mdai-model-bar{position:relative;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 14px;background:var(--mdai-surface);border-bottom:1px solid var(--mdai-border);z-index:20;font-size:12px;user-select:none;-webkit-user-select:none}",
    ".mdai-model-tag-lbl{color:var(--mdai-dim);font-weight:600;font-size:11px;letter-spacing:.02em;display:inline-flex;align-items:center;gap:5px}",
    ".mdai-model-tag-lbl svg{width:13px;height:13px;color:var(--mdai-accent2)}",
    ".mdai-model-drop-wrap{position:relative}",
    "#mdai-model-btn{display:inline-flex;align-items:center;gap:6px;padding:3.5px 10px 3.5px 8px;border-radius:999px;border:1px solid var(--mdai-border);background:var(--mdai-surface2);color:var(--mdai-text);font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all .18s ease;-webkit-tap-highlight-color:transparent}",
    "#mdai-model-btn:hover{border-color:var(--mdai-accent2);background:var(--mdai-surface);box-shadow:0 0 10px rgba(0,229,255,.2);color:var(--mdai-accent2)}",
    "#mdai-model-btn svg.mdai-chevron{width:12px;height:12px;transition:transform .2s ease;opacity:.7}",
    "#mdai-model-btn[aria-expanded='true'] svg.mdai-chevron{transform:rotate(180deg)}",
    "#mdai-model-menu{position:absolute;top:calc(100% + 6px);right:0;width:280px;max-width:calc(100vw - 60px);background:var(--mdai-surface);border:1px solid var(--mdai-border);border-radius:14px;box-shadow:var(--mdai-shadow),0 8px 30px rgba(0,0,0,.25);padding:5px;display:none;flex-direction:column;gap:3px;z-index:99;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}",
    "#mdai-model-menu.mdai-show-menu{display:flex;animation:mdai-pop .18s cubic-bezier(.2,.8,.3,1.15)}",
    "@keyframes mdai-pop{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}",
    ".mdai-model-item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 9px;border-radius:10px;cursor:pointer;border:1px solid transparent;background:transparent;color:var(--mdai-text);font-family:inherit;text-align:left;width:100%;transition:all .15s ease;-webkit-tap-highlight-color:transparent;box-sizing:border-box}",
    ".mdai-model-item:hover{background:var(--mdai-surface2);border-color:var(--mdai-border)}",
    ".mdai-model-item.active{background:linear-gradient(135deg,rgba(0,181,214,.14),rgba(0,229,255,.07));border-color:rgba(0,229,255,.4)}",
    ".mdai-model-item-l{display:flex;align-items:center;gap:8px;overflow:hidden}",
    ".mdai-model-badge-ico{font-size:13px;display:grid;place-items:center;width:24px;height:24px;border-radius:7px;background:var(--mdai-surface2);border:1px solid var(--mdai-border);flex:0 0 24px}",
    ".mdai-model-info-txt{display:flex;flex-direction:column;line-height:1.2;overflow:hidden}",
    ".mdai-model-row1{display:flex;align-items:center;gap:5px;overflow:hidden}",
    ".mdai-model-name-txt{font-weight:600;font-size:12px;white-space:nowrap}",
    ".mdai-model-brand-pill{font-size:9.5px;font-weight:700;padding:1px 5px;border-radius:4px;background:rgba(0,229,255,.12);color:var(--mdai-accent2);letter-spacing:.02em}",
    ".mdai-model-desc-txt{font-size:10.5px;color:var(--mdai-dim);margin-top:2px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}",
    ".mdai-model-chk-icon{width:14px;height:14px;color:var(--mdai-accent2);flex:0 0 14px;opacity:0;transition:opacity .15s}",
    ".mdai-model-item.active .mdai-model-chk-icon{opacity:1}",
    ".mdai-sys-notice{align-self:center;font-size:11px;color:var(--mdai-dim);background:var(--mdai-surface);border:1px solid var(--mdai-border);padding:3px 12px;border-radius:999px;margin:2px 0;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.05)}",

    // ป็อปอัปตั้งค่า API Key ในเครื่อง
    "#mdai-key-modal{position:absolute;inset:0;background:rgba(0,0,0,.68);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:70;display:none;place-items:center;padding:16px}",
    "#mdai-key-modal.mdai-show-modal{display:grid;animation:mdai-pop .2s ease-out}",
    ".mdai-modal-box{background:var(--mdai-surface);border:1px solid var(--mdai-border);border-radius:16px;padding:16px;width:100%;max-width:320px;box-shadow:var(--mdai-shadow);display:flex;flex-direction:column;gap:11px;box-sizing:border-box}",
    ".mdai-modal-h{display:flex;align-items:center;justify-content:space-between;font-size:13.5px;color:var(--mdai-text);font-weight:700}",
    ".mdai-modal-x{background:none;border:none;color:var(--mdai-dim);font-size:20px;cursor:pointer;line-height:1;padding:2px 6px;border-radius:6px}",
    ".mdai-modal-x:hover{color:var(--mdai-text);background:var(--mdai-surface2)}",
    ".mdai-modal-p{margin:0;font-size:11.5px;color:var(--mdai-dim);line-height:1.45}",
    ".mdai-modal-inp-wrap{display:flex;align-items:center;background:var(--mdai-surface2);border:1px solid var(--mdai-border);border-radius:10px;padding:6px 10px;gap:6px}",
    ".mdai-modal-inp-wrap input{flex:1;border:none;background:transparent;color:var(--mdai-text);font-family:monospace;font-size:12px;outline:none}",
    ".mdai-modal-inp-wrap button{background:none;border:none;cursor:pointer;font-size:13px;padding:0;line-height:1}",
    ".mdai-modal-links{font-size:11.5px}",
    ".mdai-modal-links a{color:var(--mdai-accent2);text-decoration:none;font-weight:600}",
    ".mdai-modal-links a:hover{text-decoration:underline}",
    ".mdai-modal-acts{display:flex;justify-content:flex-end;gap:8px;margin-top:2px}",
    ".mdai-btn-ghost{background:transparent;border:1px solid var(--mdai-border);color:var(--mdai-dim);padding:5px 12px;border-radius:8px;font-size:12px;cursor:pointer}",
    ".mdai-btn-ghost:hover{color:#d7263d;border-color:#d7263d}",
    ".mdai-btn-primary{background:linear-gradient(135deg,var(--mdai-accent),var(--mdai-accent2));border:none;color:var(--mdai-on-accent);padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer}",
    ".mdai-key-trigger-btn{background:var(--mdai-surface2);border:1px solid var(--mdai-border);border-radius:8px;width:26px;height:26px;display:grid;place-items:center;cursor:pointer;font-size:12px;color:var(--mdai-text);transition:all .18s;padding:0;flex:0 0 26px}",
    ".mdai-key-trigger-btn:hover{border-color:var(--mdai-accent2);color:var(--mdai-accent2);box-shadow:0 0 8px rgba(0,229,255,.25)}",

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
        '<div id="mdai-model-bar">' +
          '<div class="mdai-model-tag-lbl">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>' +
            '<span>โมเดล AI</span>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px">' +
            '<div class="mdai-model-drop-wrap">' +
              '<button type="button" id="mdai-model-btn" aria-haspopup="listbox" aria-expanded="false" title="คลิกเพื่อสลับโมเดล AI">' +
                '<span class="mdai-model-btn-ico">⚡</span>' +
                '<span class="mdai-model-btn-name">Gemini 2.0 Flash</span>' +
                '<svg class="mdai-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>' +
              '</button>' +
              '<div id="mdai-model-menu" role="listbox" aria-label="เลือกโมเดล AI"></div>' +
            '</div>' +
            '<button type="button" id="mdai-key-btn" title="ตั้งค่า Gemini API Key ในเครื่อง" class="mdai-key-trigger-btn" aria-label="ตั้งค่า API Key">' +
              '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-1.5 1.5L14 9l-3-3 2.5-2.5a2.12 2.12 0 0 1 3 0l4.5 4.5zM3 21l6-6M9 15l2 2M11 13l2 2"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div id="mdai-msgs"></div>' +
        '<div id="mdai-key-modal" class="mdai-modal" role="dialog" aria-label="ตั้งค่า API Key">' +
          '<div class="mdai-modal-box">' +
            '<div class="mdai-modal-h"><b>🔑 ตั้งค่า Google Gemini API Key</b><button type="button" class="mdai-modal-x" aria-label="ปิด">×</button></div>' +
            '<p class="mdai-modal-p">ใส่ Google Gemini API Key (ฟรี) เพื่อใช้งาน AI ได้ทันทีโดยไม่ต้องผ่าน proxy คีย์จะถูกบันทึกไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น ปลอดภัย 100%</p>' +
            '<div class="mdai-modal-inp-wrap">' +
              '<input type="password" id="mdai-gem-key-inp" placeholder="AIzaSy..." autocomplete="off" />' +
              '<button type="button" id="mdai-key-eye" aria-label="ดูคีย์">👁️</button>' +
            '</div>' +
            '<div class="mdai-modal-links">' +
              '<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">👉 กดรับ API Key ฟรีที่ Google AI Studio</a>' +
            '</div>' +
            '<div class="mdai-modal-acts">' +
              '<button type="button" id="mdai-key-del" class="mdai-btn-ghost">ลบคีย์</button>' +
              '<button type="button" id="mdai-key-save" class="mdai-btn-primary">บันทึก</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
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

    // ---- จัดการตัวเลือกโมเดล AI ----
    var modelBtn = panel.querySelector("#mdai-model-btn");
    var modelMenu = panel.querySelector("#mdai-model-menu");
    var modelBtnIco = panel.querySelector(".mdai-model-btn-ico");
    var modelBtnName = panel.querySelector(".mdai-model-btn-name");

    function renderModelMenu() {
      if (!modelMenu) return;
      modelMenu.innerHTML = "";
      AI_MODELS.forEach(function (m) {
        var isAct = m.id === selectedModelId;
        var item = el(
          '<button type="button" class="mdai-model-item' + (isAct ? ' active' : '') + '" role="option" aria-selected="' + isAct + '" data-id="' + m.id + '">' +
            '<div class="mdai-model-item-l">' +
              '<span class="mdai-model-badge-ico">' + m.icon + '</span>' +
              '<div class="mdai-model-info-txt">' +
                '<div class="mdai-model-row1">' +
                  '<span class="mdai-model-name-txt">' + m.name + '</span>' +
                  '<span class="mdai-model-brand-pill">' + m.badge + '</span>' +
                '</div>' +
                '<span class="mdai-model-desc-txt">' + m.tag + '</span>' +
              '</div>' +
            '</div>' +
            '<svg class="mdai-model-chk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' +
          '</button>'
        );
        modelMenu.appendChild(item);
      });
    }

    function updateModelUI(announce) {
      var cur = getSelectedModel();
      if (modelBtnIco) modelBtnIco.textContent = cur.icon;
      if (modelBtnName) modelBtnName.textContent = cur.name;
      if (modelBtn) modelBtn.title = "โมเดลปัจจุบัน: " + cur.name + " (" + cur.badge + ") — คลิกเพื่อสลับโมเดล";
      renderModelMenu();
      if (announce) {
        addSystemNotice("สลับเป็นโมเดล " + cur.name + " (" + cur.badge + ")");
      }
    }

    function openModelMenu() {
      if (!modelMenu || !modelBtn) return;
      modelMenu.classList.add("mdai-show-menu");
      modelBtn.setAttribute("aria-expanded", "true");
    }

    function closeModelMenu() {
      if (!modelMenu || !modelBtn) return;
      modelMenu.classList.remove("mdai-show-menu");
      modelBtn.setAttribute("aria-expanded", "false");
    }

    if (modelBtn) {
      modelBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var isShow = modelMenu.classList.contains("mdai-show-menu");
        isShow ? closeModelMenu() : openModelMenu();
      });
    }

    if (modelMenu) {
      modelMenu.addEventListener("click", function (e) {
        var btn = e.target.closest(".mdai-model-item");
        if (!btn) return;
        var newId = btn.getAttribute("data-id");
        if (newId && newId !== selectedModelId) {
          selectedModelId = newId;
          try {
            localStorage.setItem(MODEL_STORAGE_KEY, newId);
          } catch (err) {}
          updateModelUI(true);
        }
        closeModelMenu();
      });
    }

    document.addEventListener("click", function (e) {
      if (!panel.contains(e.target)) return;
      if (modelMenu && !modelMenu.contains(e.target) && modelBtn && !modelBtn.contains(e.target)) {
        closeModelMenu();
      }
    });

    // ---- หน้าต่างตั้งค่า Gemini API Key ในเครื่อง ----
    var keyModal = panel.querySelector("#mdai-key-modal");
    var keyBtn = panel.querySelector("#mdai-key-btn");
    var keyInput = panel.querySelector("#mdai-gem-key-inp");
    var keyEye = panel.querySelector("#mdai-key-eye");
    var keySave = panel.querySelector("#mdai-key-save");
    var keyDel = panel.querySelector("#mdai-key-del");
    var keyClose = panel.querySelector(".mdai-modal-x");
    var pendingSendText = "";

    function openKeyModal(pendingText) {
      if (pendingText) pendingSendText = pendingText;
      try {
        var k = localStorage.getItem("mdai-gemini-key") || "";
        if (keyInput) keyInput.value = k;
      } catch (err) {}
      if (keyModal) keyModal.classList.add("mdai-show-modal");
      if (keyInput) keyInput.focus();
    }

    function closeKeyModal() {
      if (keyModal) keyModal.classList.remove("mdai-show-modal");
    }

    if (keyBtn) {
      keyBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openKeyModal();
      });
    }

    if (keyClose) keyClose.addEventListener("click", closeKeyModal);
    if (keyModal) {
      keyModal.addEventListener("click", function (e) {
        if (e.target === keyModal) closeKeyModal();
      });
    }

    if (keyEye && keyInput) {
      keyEye.addEventListener("click", function () {
        keyInput.type = keyInput.type === "password" ? "text" : "password";
      });
    }

    if (keyDel) {
      keyDel.addEventListener("click", function () {
        try { localStorage.removeItem("mdai-gemini-key"); } catch (err) {}
        if (keyInput) keyInput.value = "";
        addSystemNotice("ลบ Gemini API Key ในเครื่องแล้ว");
        closeKeyModal();
      });
    }

    if (keySave && keyInput) {
      keySave.addEventListener("click", function () {
        var val = (keyInput.value || "").trim();
        if (!val) {
          alert("กรุณากรอก API Key ก่อนกดบันทึกครับ");
          return;
        }
        try { localStorage.setItem("mdai-gemini-key", val); } catch (err) {}
        addSystemNotice("บันทึก Gemini API Key เรียบร้อยแล้ว (ใช้งานได้ทันที)");
        closeKeyModal();
        if (pendingSendText) {
          var t = pendingSendText;
          pendingSendText = "";
          send(t);
        }
      });
    }

    window._mdai_openKeyModal = openKeyModal;

    updateModelUI(false);

    // ข้อความต้อนรับ + ชิปคำถามตัวอย่างในกล่องแชต
    var initModel = getSelectedModel();
    addBubble("ai", "สวัสดีครับ ผมเป็นผู้ช่วย AI ข้อมูลรัฐ ถามได้เลยครับ (" + initModel.name + ")", false, "hand");

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

  function addSystemNotice(text) {
    var msgs = document.getElementById("mdai-msgs");
    if (!msgs) return;
    var row = document.createElement("div");
    row.className = "mdai-sys-notice";
    row.textContent = text;
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
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

  function sendToGeminiDirect(text, apiKey, modelId) {
    var endpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    var finalMessages = [{ role: "system", content: SYSTEM_PROMPT }].concat(
      messages.filter(function (m) { return m && m.role !== "system"; }).slice(-12)
    );

    var targetModel = modelId || "gemini-flash-latest";
    if (targetModel === "gemini-2.0-flash" || targetModel === "gemini-1.5-flash") {
      targetModel = "gemini-flash-latest";
    }

    return fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: targetModel,
        messages: finalMessages,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      }),
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) {
          var msg = data.error && (data.error.message || data.error);
          throw new Error(msg || ("HTTP " + r.status));
        }
        return data;
      });
    });
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

    // กรณีโมเดล Google Gemini: เรียกตรงด้วย API Key ในเครื่อง (ไม่ต้องพึ่งเซิร์ฟเวอร์ proxy)
    if (selectedModelId.indexOf("gemini") !== -1) {
      var gemKey = "";
      try { gemKey = localStorage.getItem("mdai-gemini-key") || ""; } catch (e) {}

      if (!gemKey) {
        hideTyping();
        busy = false;
        document.getElementById("mdai-send").disabled = false;
        if (window._mdai_openKeyModal) {
          window._mdai_openKeyModal(text);
        } else {
          addBubble("ai", "กรุณากดปุ่ม 🔑 เพื่อใส่ Gemini API Key ก่อนใช้งานครับ", true);
        }
        return;
      }

      sendToGeminiDirect(text, gemKey, selectedModelId)
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
          addBubble("ai", "เกิดข้อผิดพลาดจาก Gemini API: " + err.message + " (หากคีย์ไม่ถูกต้อง ให้กดปุ่ม 🔑 เพื่อใส่คีย์ใหม่ครับ)", true);
        })
        .finally(function () {
          busy = false;
          document.getElementById("mdai-send").disabled = false;
        });
      return;
    }

    fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages,
        model: selectedModelId,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      }),
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
