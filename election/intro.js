/* ===== intro.js — ฉากเปิดหน้ารายเขต =====
   อันดับ 1 เลื่อนเข้าจากซ้าย · อันดับ 2 เลื่อนเข้าจากขวา · อันดับ 3–5 ขึ้นมาจากด้านล่าง
   ค้างไว้ ~6 วิ แล้วเลื่อนออกทางเดิม เผยแผนที่

   ตัวเลข: intro-seats.js (window.INTRO_SEATS) — เรียงตาม "ที่นั่งรวม" = แบ่งเขต + บัญชีรายชื่อ
           แบ่งเขตนับจาก year-<id>.js (ตรงกับแผนที่) · บัญชีรายชื่อจาก standings-<id>.js
   ชื่อ/รูป: intro-data.js (window.INTRO) + leaders/<ชื่อคน>.png|.jpg
   เพลง: การ์ด YouTube Mini Player ลอยบริเวณอ่าวไทย (ขวาล่างของแผนที่) — intro-youtube.js
         ฝังผ่าน YouTube IFrame Player API (การฝังอย่างเป็นทางการ ถูกลิขสิทธิ์) แทนไฟล์ .mp3 เดิม
         ค่าเริ่มต้น "เปิดเสียง" และจำสิ่งที่ผู้ใช้เลือกไว้ใช้ทุกปี (localStorage 'el-intro-sound')
         เบราว์เซอร์บล็อก autoplay ถ้ายังไม่มีการคลิกในหน้านั้น → ลองเล่นก่อน ถ้าโดนบล็อก
         ปุ่มจะกลับเป็น "เปิดเสียง" แล้วรอผู้ใช้แตะหน้าครั้งแรก ค่อยเล่นเองอัตโนมัติ
         พรรคเดิมชนะติดต่อกัน (คลิปเดียวกัน + เป็นการเลือกตั้งครั้งที่ติดกัน) = เล่นต่อจากจุดเดิม
         ไม่ดีดกลับไปท่อนแรก (sessionStorage 'el-intro-pos')
         ย่อ/ขยาย/ปิดการ์ดได้ · สถานะย่อจำไว้ที่ localStorage 'el-yt-min'

   ⚠ ต้องโหลดหลัง year-switch.js · intro-data.js · intro-seats.js */
(function () {
  var S = (window.INTRO_SEATS || {})[window.EYID];
  if (!S || !window.DATA || !window.DATA.provStats) return;
  var D = window.DATA, I = (window.INTRO || {})[window.EYID] || {};
  var Y = window.EYEAR;
  var HOLD = 6000;
  // เพลงประจำปี = คลิป YouTube ของพรรคอันดับ 1 ปีนั้น (intro-youtube.js)
  //               ปีที่ยังไม่มีคลิปก็เงียบไป ไม่พัง (การ์ดและปุ่มลำโพงซ่อนเอง)

  var cur = (window.EYEARS || []).filter(function (o) { return o.id === window.EYID; })[0] || {};
  var wins = {};
  Object.keys(D.provStats).forEach(function (p) {
    var w = D.provStats[p].winner; wins[w] = (wins[w] || 0) + 1;
  });

  var rows = (S.parties || []).filter(function (p) {
    return p.short !== 'อิสระ' && p.short !== 'ไม่มีพรรคการเมือง' && p.short !== 'อื่น ๆ';
  });
  var noParty = !!S.heat || !rows.length;
  var leaderOf = function (p) { var L = I.leaders || {}; return L[p.short] || L[p.code] || ''; };
  var pmName = I.pm || '';
  /* มีชื่อนายกฯ แต่ไม่มีการ์ดพรรคไหนได้ ✓ เลย → ต้องบอกด้วยแถบล่าง ไม่งั้นคนดูไม่รู้ว่าใครเป็นนายกฯ
     เกิดได้ 2 แบบ · ไม่สังกัดพรรค (2522 เกรียงศักดิ์ · 2526/2529 เปรม)
                  · สังกัดพรรคที่ไม่มีในผลคะแนนครั้งนั้น (2500 รอบ ธ.ค. ถนอม — ชาติสังคม) */
  var pmParty = I.pmp || '';
  var pmOutsider = !noParty && !!pmName && !rows.some(function (p) {
    return !!pmParty && (pmParty === p.code || pmParty === p.short);
  });
  var pmNote = I.pmnote || (pmParty
    ? 'พรรค' + pmParty + ' — ไม่มีในผลคะแนนครั้งนี้'
    : 'ไม่ได้สังกัดพรรคการเมือง — ไม่มีพรรคใดได้เป็นนายกฯ');
  /* เพิ่มจากคลิปต้นฉบับ (แสดงเฉพาะปีที่ข้อมูลครบ = มีคะแนน):
     · majority = เสียงข้างมากที่ต้องใช้ตั้งรัฐบาล (เกินกึ่งหนึ่งของสภา)
     · pmBefore = นายกฯ ก่อนการเลือกตั้ง (แบบ "PREM..." มุมขวาบนของคลิป) จาก intro-data.js (I.pmb) */
  var majority = S.total ? Math.floor(S.total / 2) + 1 : 0;
  var hasVotes = !noParty && rows.some(function (p) { return p.zVotes || p.lVotes; });
  var pmBefore = I.pmb || '';

  /* ---------- สไตล์ ---------- */
  var CSS = ''
    + '#eintro{position:fixed;inset:0;z-index:200;pointer-events:none;font-family:Kanit,sans-serif}'
    + '#eintro.done{display:none}'
    + '#eintro .veil{position:absolute;inset:0;background:rgba(4,12,20,.55);opacity:0;transition:opacity .5s}'
    + '#eintro.on .veil{opacity:1}'
    /* ⚠ ห้ามใช้ var(--ink) เป็นพื้นหลัง — ธีมมืดจะสลับเป็นสีอ่อน ตัวหนังสือขาวจะจมหาย */
    + '#eintro .bar{position:absolute;top:0;left:0;right:0;padding:12px 16px;display:flex;gap:12px;'
    + 'align-items:baseline;justify-content:center;background:#070f17;color:#fff;'
    + 'transform:translateY(-100%);transition:transform .55s cubic-bezier(.4,0,.2,1)}'
    + '#eintro.on .bar{transform:none}'
    + '#eintro .bar b{font-size:1.5rem;font-weight:600;letter-spacing:.02em}'
    + '#eintro .bar span{font-size:.82rem;opacity:.75;font-family:Sarabun,sans-serif}'
    /* แถบหัวแบบคลิปต้นฉบับ: เม็ดยา "เสียงข้างมาก" + ชื่อนายกฯ ก่อนเลือกตั้ง */
    + '#eintro .bar .maj{align-self:center;font-family:Kanit,sans-serif;font-size:.8rem;font-weight:500;opacity:1;'
    + 'background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.30);border-radius:999px;padding:3px 12px}'
    + '#eintro .bar .pmb{font-size:.8rem;opacity:.72;font-family:Sarabun,sans-serif}'
    /* แผงใหญ่ 2 ข้าง */
    /* top ใช้ความสูงจริงของแถบบน (--barh วัดตอนรันไทม์) ไม่งั้นเหลือช่องว่างคั่นระหว่างแถบกับแผง
       จอใหญ่: แผงยาวถึงขอบล่าง แล้ววางการ์ดอันดับ 3–5 ไว้ "ในช่องกลาง" ระหว่างสองแผง */
    + '#eintro .side{position:absolute;top:var(--barh,52px);bottom:var(--pmh,0px);width:31%;max-width:400px;padding:22px 22px;'
    + 'display:flex;flex-direction:column;justify-content:center;color:#fff;'
    + 'transition:transform .75s cubic-bezier(.4,0,.2,1)}'
    + '#eintro .side.l{left:0;transform:translateX(-102%)}'
    + '#eintro .side.r{right:0;text-align:right;align-items:flex-end;transform:translateX(102%)}'
    + '#eintro.on .side{transform:none}'
    + '#eintro .rank{font-size:.72rem;letter-spacing:.16em;opacity:.72;font-family:Sarabun,sans-serif}'
    + '#eintro .face{height:168px;width:auto;max-width:100%;object-fit:contain;object-position:top center;'
    + 'margin:8px 0 2px;border-radius:12px;background:rgba(255,255,255,.14);align-self:flex-start}'
    + '#eintro .side.r .face{align-self:flex-end}'
    + '#eintro .pname{font-size:1.45rem;font-weight:600;line-height:1.25;margin:4px 0 2px;display:flex;align-items:center;gap:10px}'
    + '#eintro .side.r .pname{flex-direction:row-reverse}'
    /* ชิปโลโก้พรรค: ถ้ามีรูปจริงในโฟลเดอร์ logos/ รูปจะทับชิปสีอัตโนมัติ */
    + '#eintro .plogo{position:relative;display:inline-flex;align-items:center;justify-content:center;'
    + 'overflow:hidden;flex:0 0 auto;font-family:Kanit,sans-serif;font-weight:700;line-height:1}'
    /* เส้นกรอบเฉพาะกล่องที่มีโลโก้จริง — ไม่มีรูป = ไม่มีกรอบ */
    + '#eintro .plogo.hasimg{box-shadow:inset 0 0 0 1px rgba(255,255,255,.22)}'
    + '#eintro .plogo.lg{width:38px;height:38px;border-radius:9px;font-size:.78rem}'
    + '#eintro .plogo.md{width:40px;height:40px;border-radius:9px;font-size:.8rem}'
    + '#eintro .plogo .pimg{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:inherit}'
    + '#eintro .plogo.hasimg .pab{display:none}'
    + '#eintro .lead{font-size:.92rem;opacity:.9;font-family:Sarabun,sans-serif;line-height:1.5}'
    + '#eintro .num{font-size:3.1rem;font-weight:700;line-height:1;margin-top:12px;display:flex;align-items:center;gap:10px}'
    + '#eintro .side.r .num{justify-content:flex-end}'
    /* เครื่องหมายถูก = พรรคที่หัวหน้าได้เป็นนายกรัฐมนตรีหลังการเลือกตั้ง */
    + '#eintro .chk{font-size:1.5rem;line-height:1;background:rgba(255,255,255,.92);color:#0A1822;'
    + 'border-radius:8px;padding:3px 9px;font-weight:700}'
    + '#eintro .unit{font-size:.78rem;opacity:.82;font-family:Sarabun,sans-serif;margin-top:3px;line-height:1.5}'
    + '#eintro .votes{font-size:.78rem;font-family:Sarabun,sans-serif;margin-top:7px;line-height:1.45;'
    + 'border-top:1px solid rgba(255,255,255,.28);padding-top:7px;opacity:.92}'
    + '#eintro .votes b{font-weight:600;font-family:Kanit,sans-serif;font-size:1.05rem}'
    + '#eintro .votes i{font-style:normal;font-size:.7rem;opacity:.75}'
    + '#eintro .pmtag{display:inline-block;margin-top:10px;padding:5px 12px;border-radius:999px;'
    + 'background:rgba(255,255,255,.18);font-size:.74rem;font-family:Sarabun,sans-serif}'
    /* แถบล่าง: ปีที่นายกฯ เป็น "คนนอก" ไม่ได้สังกัดพรรคไหนในสภา (2522/2526/2529)
       จึงไม่มีพรรคไหนได้ ✓ — ถ้าไม่บอกตรงนี้ คนดูจะไม่รู้เลยว่าใครได้เป็นนายกฯ
       แถบกินที่ด้านล่างจริง จึงต้องดัน .side/.mrow/.ctl ขึ้นด้วย --pmh (วัดตอนรันไทม์) */
    /* ⚠ ห้ามทำเป็น flex — ข้อความไทยไม่มีช่องว่าง flex item จะหดลงเหลือ min-content
       แล้วตกบรรทัดทีละคำจนแถบสูงเป็น 250px ดันการ์ดหายจากจอ · ใช้บล็อก 2 บรรทัดตายตัว */
    + '#eintro .pmbar{position:absolute;left:0;right:0;bottom:0;padding:10px 16px;text-align:center;'
    + 'background:#070f17;color:#fff;'
    + 'transform:translateY(100%);transition:transform .6s cubic-bezier(.4,0,.2,1) .25s}'
    + '#eintro.on .pmbar{transform:none}'
    + '#eintro .pmbar b{display:block;font-size:1.05rem;font-weight:600;line-height:1.3}'
    + '#eintro .pmbar span{display:block;margin-top:2px;font-size:.78rem;opacity:.72;'
    + 'font-family:Sarabun,sans-serif;line-height:1.35}'
    /* แถวอันดับ 3–5 ด้านล่าง */
    /* วางกลางจอเสมอและ "ห้ามตกบรรทัด" — ถ้าช่องกลางแคบก็ให้ล้ำทับแผงได้ (การ์ดมีพื้นหลังของตัวเอง) */
    + '#eintro .mrow{position:absolute;left:50%;bottom:calc(58px + var(--pmh,0px));display:flex;gap:8px;justify-content:center;'
    + 'flex-wrap:nowrap;max-width:calc(100% - 20px);'
    + 'transform:translate(-50%,180%);transition:transform .7s cubic-bezier(.4,0,.2,1) .15s}'
    + '#eintro.on .mrow{transform:translate(-50%,0)}'
    + '#eintro .mini{display:flex;align-items:center;gap:8px;color:#fff;border-radius:13px;padding:6px 11px 6px 6px;'
    + 'background:rgba(8,18,30,.86);border:1px solid rgba(255,255,255,.16)}'
    + '#eintro .mini .mface{width:40px;height:40px;border-radius:9px;object-fit:cover;object-position:top center;'
    + 'background:rgba(255,255,255,.14);flex:0 0 auto}'
    + '#eintro .mini .mdot{width:40px;height:40px;border-radius:9px;flex:0 0 auto}'
    + '#eintro .mini .mp{font-size:.84rem;font-weight:500;line-height:1.25;white-space:nowrap}'
    + '#eintro .mini .ml{font-size:.68rem;opacity:.75;font-family:Sarabun,sans-serif;white-space:nowrap}'
    + '#eintro .mini .mn{margin-left:auto;font-size:1.35rem;font-weight:700;padding-left:8px}'
    + '#eintro .mini .mtext{display:flex;flex-direction:column;justify-content:center}'
    + '#eintro .mini .mv{font-size:.66rem;opacity:.85;font-family:Sarabun,sans-serif;white-space:nowrap;margin-top:2px}'
    /* ปีที่ยังไม่มีพรรคการเมือง — แผงเดียวตรงกลาง */
    + '#eintro .solo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.94);opacity:0;'
    + 'text-align:center;color:#fff;transition:opacity .6s,transform .6s}'
    + '#eintro.on .solo{opacity:1;transform:translate(-50%,-50%) scale(1)}'
    /* ปุ่มควบคุม */
    + '#eintro .ctl{position:absolute;bottom:calc(14px + var(--pmh,0px));left:50%;transform:translateX(-50%);display:flex;gap:8px;'
    + 'pointer-events:auto;opacity:0;transition:opacity .4s}'
    + '#eintro.on .ctl{opacity:1}'
    + '#eintro .ctl button{font-family:Kanit,sans-serif;font-size:.8rem;color:#fff;background:rgba(255,255,255,.14);'
    + 'border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:7px 15px;cursor:pointer;transition:.14s}'
    + '#eintro .ctl button:hover{background:rgba(255,255,255,.26)}'
    /* เครดิตโลโก้ (ตามสัญญาอนุญาต CC BY/BY-SA) — โผล่เฉพาะปีที่มีโลโก้จริงแสดง (.haslogo) */
    + '#eintro .cred{position:absolute;left:0;right:0;bottom:3px;text-align:center;display:none;'
    + 'font-family:Sarabun,sans-serif;font-size:.62rem;opacity:.5;color:#fff;line-height:1.2;'
    + 'pointer-events:auto;white-space:nowrap}'
    + '#eintro.haslogo .cred{display:block}'
    + '#eintro .cred a{color:inherit;text-decoration:underline}'
    + '#eintro .cred a:hover{opacity:.85}'
    /* ปุ่มค้างบนหน้า (อยู่ต่อหลังฉากเปิดปิดไปแล้ว) — ดูซ้ำ + เปิด/ปิดเสียงเพลงพื้นหลัง */
    + '#eintrodock{position:fixed;right:16px;bottom:118px;z-index:58;display:flex;flex-direction:column;'
    + 'background:var(--paper,#fff);border:1px solid var(--line,#dbe4ea);border-radius:14px;overflow:hidden;'
    + 'box-shadow:var(--shadow-lg,0 12px 30px -12px rgba(10,40,60,.3))}'
    + '#eintrodock button{width:48px;height:44px;border:0;background:transparent;color:var(--ink,#16323f);'
    + 'cursor:pointer;display:grid;place-items:center;transition:.12s;padding:0}'
    + '#eintrodock button:not(:last-child){border-bottom:1px solid var(--line,#dbe4ea)}'
    + '#eintrodock button:hover{background:var(--orange-soft,#eef2f5);color:var(--orange-deep,#41525e)}'
    + '#eintrodock button.off{opacity:.55}'
    + '#eintrodock svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.9;'
    + 'stroke-linecap:round;stroke-linejoin:round}'
    + '@media(max-width:860px){#eintrodock{bottom:auto;top:196px;right:10px}}'
    + '@media(max-width:860px){'
    /* มือถือ: แผงสองข้างเต็มความกว้าง ไม่มีช่องกลาง → การ์ดอันดับ 3–5 ต้องลงไปอยู่ใต้แผง
       และตกบรรทัดเป็น 2 แถว (สูง ~90px) จึงต้องเว้นล่างมากกว่าจอใหญ่ */
    + '#eintro .side{width:50%;max-width:none;padding:14px 12px;bottom:calc(200px + var(--pmh,0px))}'
    + '#eintro .mrow{bottom:calc(104px + var(--pmh,0px))}'
    + '#eintro .pmbar{padding:7px 12px}'
    + '#eintro .pmbar b{font-size:.86rem}#eintro .pmbar span{font-size:.68rem}'
    + '#eintro .face{height:96px;margin:6px 0 2px}'
    + '#eintro .pname{font-size:1rem}#eintro .num{font-size:2rem;margin-top:8px}'
    + '#eintro .lead{font-size:.76rem}#eintro .unit{font-size:.68rem}#eintro .bar b{font-size:1.15rem}'
    + '#eintro .votes{display:none}#eintro .chk{font-size:1.05rem;padding:2px 7px}'
    + '#eintro .mrow{gap:6px}'
    + '#eintro .mini{min-width:0;padding:5px 9px 5px 5px;gap:7px;border-radius:11px}'
    + '#eintro .mini .mface,#eintro .mini .mdot,#eintro .mini .plogo.md{width:30px;height:30px;border-radius:8px;font-size:.64rem}'
    + '#eintro .plogo.lg{width:30px;height:30px;font-size:.62rem}'
    + '#eintro .mini .mp{font-size:.74rem}#eintro .mini .ml{display:none}#eintro .mini .mv{display:none}'
    + '#eintro .bar .pmb{display:none}#eintro .bar .maj{font-size:.66rem;padding:2px 8px}'
    + '#eintro .mini .mn{font-size:1rem;padding-left:5px}'
    + '#eintro .ctl{bottom:calc(66px + var(--pmh,0px))}'
    + '#eintro .cred .credtxt{display:none}#eintro .cred{font-size:.56rem}}';

  /* ---------- การ์ด YouTube Mini Player (ลอยบริเวณอ่าวไทย ขวาล่างของแผนที่) ----------
     พื้นหลังกระจก (glassmorphism) — ตัวแปรธีมมาจาก style.css จึงเปลี่ยนตามโหมดสว่าง/มืดเอง
     z-index 57 = ต่ำกว่า dock ปุ่มเสียง (58) เล็กน้อย แต่ยังสูงกว่าแผนที่/ปุ่มซูม (50) */
  CSS += '#eintroyt{position:fixed;right:76px;bottom:16px;z-index:57;width:320px;max-width:calc(100vw - 20px);'
    + 'border-radius:16px;overflow:hidden;font-family:Sarabun,sans-serif;color:var(--ink,#0A1822);'
    + 'background:rgba(255,255,255,.62);border:1px solid var(--line,#DEEAF1);'
    + '-webkit-backdrop-filter:blur(16px) saturate(1.6);backdrop-filter:blur(16px) saturate(1.6);'
    + 'box-shadow:var(--shadow-lg,0 18px 50px -22px rgba(10,40,60,.32));'
    + 'transition:opacity .28s,transform .28s;transform-origin:100% 100%}'
  + 'html[data-theme="dark"] #eintroyt{background:rgba(14,26,38,.58);border-color:var(--line-2,#1E3A50)}'
  /* ปิดการ์ด = ยุบหายไปทางมุมขวาล่าง (ไม่ display:none — iframe จะถูกสร้างใหม่ทุกครั้งที่เปิด) */
  + '#eintroyt.off{opacity:0;transform:scale(.9) translateY(8px);pointer-events:none}'
  /* หัวการ์ด */
  + '#eintroyt .ythead{display:flex;align-items:center;gap:8px;padding:8px 8px 8px 11px;'
    + 'border-bottom:1px solid var(--line,#DEEAF1);background:linear-gradient(180deg,rgba(255,255,255,.34),transparent)}'
  + 'html[data-theme="dark"] #eintroyt .ythead{background:linear-gradient(180deg,rgba(255,255,255,.05),transparent);'
    + 'border-bottom-color:var(--line-2,#1E3A50)}'
  + '#eintroyt.min .ythead{border-bottom:0}'
  + '#eintroyt .ytmark{flex:0 0 auto;display:grid;place-items:center;color:#FF0033;line-height:0}'
  + '#eintroyt .ytmark svg{width:22px;height:22px}'
  /* จังหวะเต้นเบา ๆ ตอนกำลังเล่น = บอกสถานะโดยไม่ต้องมีข้อความเพิ่ม */
  + '#eintroyt.playing .ytmark{animation:ytpulse 1.9s ease-in-out infinite}'
  + '@keyframes ytpulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.13);opacity:.72}}'
  + '@media(prefers-reduced-motion:reduce){#eintroyt.playing .ytmark{animation:none}}'
  + '#eintroyt .ytmeta{flex:1 1 auto;min-width:0;line-height:1.25}'
  + '#eintroyt .ytmeta b{display:block;font-family:Kanit,sans-serif;font-weight:500;font-size:.82rem;'
    + 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
  + '#eintroyt .ytmeta small{display:block;font-size:.68rem;color:var(--muted,#5C7686);'
    + 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
  + '#eintroyt .ythead button{flex:0 0 auto;width:26px;height:26px;border:0;border-radius:8px;padding:0;'
    + 'background:transparent;color:var(--ink-2,#2C4356);cursor:pointer;display:grid;place-items:center;transition:.12s}'
  + '#eintroyt .ythead button:hover{background:var(--orange-soft,#E9F0F5);color:var(--orange-deep,#435A6D)}'
  + '#eintroyt .ythead svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;'
    + 'stroke-linecap:round;stroke-linejoin:round}'
  /* ตัวคลิป — ย่อแล้วยุบ grid-template-rows เป็น 0 (อนิเมตได้ ต่างจาก height:auto) */
  + '#eintroyt .ytbody{display:grid;grid-template-rows:1fr;transition:grid-template-rows .28s ease}'
  + '#eintroyt.min .ytbody{grid-template-rows:0fr}'
  + '#eintroyt .ytinner{overflow:hidden;min-height:0}'
  + '#eintroyt .ytframe{position:relative;aspect-ratio:16/9;margin:9px 9px 0;border-radius:11px;'
    + 'overflow:hidden;background:#000}'
  + '#eintroyt .ytframe iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}'
  + '#eintroyt .ytfoot{display:flex;align-items:center;gap:8px;padding:7px 11px 9px;font-size:.68rem}'
  + '#eintroyt .ytby{flex:1 1 auto;min-width:0;color:var(--muted,#5C7686);'
    + 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
  + '#eintroyt .ytopen{flex:0 0 auto;color:var(--green-deep,#055A75);font-weight:600;'
    + 'border-bottom:1px solid transparent;transition:.12s}'
  + '#eintroyt .ytopen:hover{border-bottom-color:currentColor}'
  /* มือถือ: การ์ดแคบลง ตำแหน่งจริงคำนวณใน placeYT() (เหนือแผงข้อมูลที่โผล่จากด้านล่าง) */
  + '@media(max-width:860px){#eintroyt{width:270px;right:10px}'
    + '#eintroyt .ytmeta b{font-size:.78rem}#eintroyt .ytmeta small{font-size:.64rem}}';

  /* ---------- ชิ้นส่วน ---------- */
  function facePath(leader, cls) {
    if (!leader) return '';
    var f = encodeURIComponent(leader.replace(/[\\/:*?"<>|]/g, '_').trim());
    // ลอง .png ก่อน (รูปที่วางเองทับได้) แล้วค่อยตกไป .jpg (รูปจากวิกิ)
    return '<img class="' + cls + '" alt="" data-alt="leaders/' + f + '.jpg" src="leaders/' + f + '.png">';
  }
  /* ---------- โลโก้พรรค (ไฮบริด) ----------
     มีไฟล์จริง logos/<code>.png → ใช้รูป · ไม่มี → ชิปสีพรรค + ตัวย่อ (fallback อัตโนมัติผ่าน onerror)
     ตัวย่อคีย์ด้วย code เดียวกับ intro-seats.js (ที่ไม่มั่นใจปล่อยเป็นชิปสีล้วน) */
  var ABBR = {
    TRT: 'ทรท.', DEM: 'ปชป.', PT: 'พท.', BJT: 'ภท.', PPR: 'พปชร.', PPRP: 'พปชร.',
    FFP: 'อนค.', MFP: 'กก.', UTN: 'รทสช.', PPC: 'ปชน.', KLT2: 'กธ.', PPP: 'พปช.',
    X04: 'ชท.', CTP: 'ชทพ.', X05: 'ชพ.', CPN: 'ชพน.', X41: 'สธ.', X32: 'มช.',
    X20: 'พช.', TRP: 'ทรพ.'
  };
  function chipInk(hex) {
    var m = /^#?([0-9a-fA-F]{6})$/.exec(hex || '');
    if (!m) return '#fff';
    var n = parseInt(m[1], 16);
    return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) > 150 ? '#0A1822' : '#fff';
  }
  function logoHtml(p, cls) {
    var code = p.code || '', ab = ABBR[code] || '';
    var f = encodeURIComponent(code.replace(/[\\/:*?"<>|]/g, '_'));
    return '<span class="plogo ' + cls + '" style="background:' + p.color + ';color:' + chipInk(p.color) + '">'
      + (ab ? '<b class="pab">' + ab + '</b>' : '')
      + (code ? '<img class="pimg" alt="" src="logos/' + f + '.png">' : '')
      + '</span>';
  }
  function seatText(p) {
    return p.list ? ('เขต ' + p.zone + ' · บัญชีรายชื่อ ' + p.list) : 'ที่นั่ง';
  }
  var fmt = function (n) { return n.toLocaleString('en-US'); };
  var pct = function (n) { return n.toFixed(2).replace('.', ',') + '%'; };
  /* บล็อกคะแนนแบบคลิปต้นทาง: บรรทัดบน = % แบ่งเขต/บัญชีรายชื่อ · บรรทัดล่าง = จำนวนคะแนน
     ปีไหนมีไม่ครบก็แสดงเท่าที่มี (2554 ไม่มีคะแนนแบ่งเขต · ก่อน 2544 ไม่มีข้อมูลคะแนนเลย) */
  function votesHtml(p) {
    if (!p.zVotes && !p.lVotes) return '';
    var pctLine = [], voteLine = [];
    if (p.zVotes) { pctLine.push(pct(p.zPct)); voteLine.push(fmt(p.zVotes)); }
    if (p.lVotes) { pctLine.push(pct(p.lPct)); voteLine.push(fmt(p.lVotes)); }
    var label = (p.zVotes && p.lVotes) ? 'แบ่งเขต / บัญชีรายชื่อ'
      : (p.zVotes ? 'แบ่งเขต' : 'บัญชีรายชื่อ');
    return '<div class="votes"><b>' + pctLine.join(' / ') + '</b><br>'
      + voteLine.join(' / ') + ' คะแนน<br><i>' + label + '</i></div>';
  }
  function sideHtml(p, cls, rank) {
    var lead = leaderOf(p), w = wins[p.code] || 0;
    var isPM = !!(I.pmp && (I.pmp === p.code || I.pmp === p.short));
    return '<div class="side ' + cls + '" style="background:' + p.color + '">'
      + '<div class="rank">' + rank + '</div>'
      + facePath(lead, 'face')
      + '<div class="pname">' + logoHtml(p, 'lg') + '<span>' + p.short + '</span></div>'
      + (lead ? '<div class="lead">' + lead + '</div>' : '')
      + '<div class="num">' + p.total + (isPM ? '<span class="chk">✓</span>' : '') + '</div>'
      + '<div class="unit">' + seatText(p) + (w ? '<br>ชนะ ' + w + ' จังหวัด' : '') + '</div>'
      + votesHtml(p)
      + (isPM && pmName ? '<div class="pmtag">ได้เป็นนายกฯ · ' + pmName + '</div>' : '')
      + '</div>';
  }
  /* พรรครอง (อันดับ 3–5): เติม %/คะแนน แบบคลิปต้นฉบับ · ใช้บัญชีรายชื่อถ้ามี ไม่งั้นใช้แบ่งเขต */
  function miniVotes(p) {
    if (!p.zVotes && !p.lVotes) return '';
    var vp = p.lVotes ? p.lPct : p.zPct, vn = p.lVotes ? p.lVotes : p.zVotes;
    return '<div class="mv">' + pct(vp) + ' · ' + fmt(vn) + ' คะแนน</div>';
  }
  function miniHtml(p) {
    var lead = leaderOf(p);
    return '<div class="mini">'
      + (lead ? facePath(lead, 'mface') : logoHtml(p, 'md'))
      + '<div class="mtext"><div class="mp" style="border-left:3px solid ' + p.color + ';padding-left:7px">' + p.short + '</div>'
      + (lead ? '<div class="ml">' + lead + '</div>' : '')
      + miniVotes(p) + '</div>'
      + '<div class="mn">' + p.total + '</div></div>';
  }

  var el = document.createElement('div');
  el.id = 'eintro';
  var head = '<div class="veil"></div>'
    + '<div class="bar"><b>' + Y + '</b><span>' + (cur.date || '')
    + ' · ส.ส. ' + S.total + ' คน' + (S.listSeats ? ' (เขต ' + S.zone + ' + บัญชีรายชื่อ ' + S.listSeats + ')' : '')
    + '</span>'
    + (hasVotes ? '<span class="maj">เสียงข้างมาก ' + fmt(majority) + ' ที่นั่ง</span>' : '')
    + (pmBefore ? '<span class="pmb">นายกฯ ก่อนเลือกตั้ง · ' + pmBefore + '</span>' : '')
    + '</div>';
  var body = noParty
    ? '<div class="solo"><div class="rank">ยุคก่อนมีพรรคการเมือง</div>'
    + '<div class="pname" style="font-size:2rem">ส.ส. ' + S.total + ' คน</div>'
    + (pmName ? '<div class="lead">นายกรัฐมนตรีหลังเลือกตั้ง · ' + pmName + '</div>' : '') + '</div>'
    : sideHtml(rows[0], 'l', 'อันดับ 1')
    + (rows[1] ? sideHtml(rows[1], 'r', 'อันดับ 2') : '')
    + (rows.length > 2 ? '<div class="mrow">' + rows.slice(2, 5).map(miniHtml).join('') + '</div>' : '')
    + (pmOutsider ? '<div class="pmbar"><b>นายกรัฐมนตรีหลังเลือกตั้ง · ' + pmName + '</b>'
      + '<span>' + pmNote + '</span></div>' : '');
  el.innerHTML = head + body
    + '<div class="ctl">'
    + '<button type="button" data-a="sound">เปิดเสียง</button>'
    + '<button type="button" data-a="skip">ข้าม</button></div>'
    + '<div class="cred"><span class="credtxt">โลโก้พรรค: Wikimedia Commons · </span>'
    + '<a href="logos/CREDITS.txt" target="_blank" rel="noopener">เครดิตโลโก้</a></div>';

  var st = document.createElement('style'); st.textContent = CSS;
  document.head.appendChild(st); document.body.appendChild(el);

  // แผงสองข้างต้องเริ่มต่อจากแถบบนพอดี — วัดความสูงจริงแทนการเดา
  var barEl = el.querySelector('.bar'), pmBarEl = el.querySelector('.pmbar');
  var syncBar = function () {
    el.style.setProperty('--barh', barEl.offsetHeight + 'px');
    // แถบนายกฯ คนนอกกินที่ล่างจริง (มือถือตกบรรทัดได้) → วัดแล้วดันการ์ด/ปุ่มขึ้นตาม
    el.style.setProperty('--pmh', (pmBarEl ? pmBarEl.offsetHeight : 0) + 'px');
  };
  syncBar(); addEventListener('resize', syncBar);
  // วัดซ้ำหลังฟอนต์ Kanit/Sarabun มาถึง — วัดตอนฟอนต์สำรองยังอยู่ ข้อความจะตกบรรทัดคนละแบบ ค่าที่ได้เพี้ยน
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncBar);

  // ไม่มีทั้ง .png และ .jpg → ซ่อนรูป ไม่ให้ขึ้นไอคอนรูปเสีย
  Array.prototype.forEach.call(el.querySelectorAll('.face,.mface'), function (im) {
    im.addEventListener('error', function () {
      if (im.dataset.alt) { im.src = im.dataset.alt; im.dataset.alt = ''; }
      else im.style.display = 'none';
    });
  });
  // โลโก้พรรค: โหลดได้ → ทับชิป (ซ่อนตัวย่อ) · โหลดไม่ได้ → ซ่อนรูป เหลือชิปสี+ตัวย่อ
  Array.prototype.forEach.call(el.querySelectorAll('.pimg'), function (im) {
    im.addEventListener('load', function () { if (im.parentNode) im.parentNode.classList.add('hasimg'); el.classList.add('haslogo'); });
    im.addEventListener('error', function () {
      im.style.display = 'none';
      // แผงใหญ่ (lg): ไม่มีโลโก้จริง → ซ่อนกล่องทั้งใบ (สีชิป = สีแผง จึงเหลือแค่กรอบเปล่า) ให้ชื่อพรรคชิดปกติ
      var box = im.parentNode;
      if (box && box.classList && box.classList.contains('lg')) box.style.display = 'none';
    });
  });

  /* ---------- เพลงพื้นหลัง: ไฮบริด YouTube + MP3 ----------
     ปีไหนมีคลิปใน intro-youtube.js → ใช้ "การ์ด YouTube Mini Player" ลอยบริเวณอ่าวไทย
       ฝังผ่าน YouTube IFrame Player API = การฝังอย่างเป็นทางการ ถูกลิขสิทธิ์
       ยอดวิวกลับไปหาเจ้าของผลงาน และไม่ต้องเก็บไฟล์เสียงไว้ในรีโปเอง
     ปีไหนยังไม่มีคลิป → ตกไปเล่นไฟล์ .mp3 เดิมใน songs/ (intro-music.js) แบบเสียงพื้นหลัง
       ไม่มีการ์ด มีแค่ปุ่มลำโพงใน dock เหมือนเดิม เช่น 2535 = all-elections.mp3
     ไม่มีทั้งสองอย่าง → เงียบ และซ่อนปุ่มลำโพงไปเลย

     ค่าเริ่มต้น "เปิดเสียง" และจำสิ่งที่ผู้ใช้เลือกไว้ใช้ทุกปี (localStorage 'el-intro-sound')
     เบราว์เซอร์บล็อก autoplay ถ้ายังไม่มีการคลิกในหน้านั้น → ลองเล่นก่อน ถ้าโดนบล็อก
     ปุ่มจะกลับเป็น "เปิดเสียง" แล้วรอผู้ใช้แตะหน้าครั้งแรก ค่อยเล่นเองอัตโนมัติ
     พรรคเดิมชนะติดต่อกัน (เพลงเดียวกัน + เป็นการเลือกตั้งครั้งที่ติดกัน) = เล่นต่อจากจุดเดิม  */
  var SKEY = 'el-intro-sound';
  var want = true;                                    // ยังไม่เคยเลือก = เปิด
  try { want = localStorage.getItem(SKEY) !== '0'; } catch (err) { }

  var TUNE = (window.INTRO_YOUTUBE || {})[window.EYID] || null;
  if (TUNE && !TUNE.id) TUNE = null;
  // มีคลิปแล้วไม่ต้องสน mp3 · ยังไม่มีคลิปค่อยมองหาไฟล์เสียงเดิม
  var MUSIC = TUNE ? '' : ((window.INTRO_MUSIC || {})[window.EYID] || '');
  MUSIC = MUSIC ? '../songs/' + MUSIC : '';
  var MODE = TUNE ? 'yt' : (MUSIC ? 'mp3' : '');      // '' = ปีนั้นไม่มีเพลงเลย
  var hasAudio = !!MODE;
  /* กุญแจ "เพลงเดียวกันไหม" ตอนสลับปี — ต้องแยกที่มาด้วย ไม่ใช่แค่ชื่อไฟล์
     (ปี mp3 กับปี YouTube ที่เป็นเพลงเดียวกัน ก็ถือว่าคนละแหล่ง เริ่มใหม่ตามปกติ) */
  var SRCKEY = TUNE ? ('yt:' + TUNE.id) : MUSIC;
  var sndBtn = el.querySelector('[data-a="sound"]');
  var player = null, ytReady = false, pendingPlay = false, playChk = 0;
  var audio = null;

  /* ---------- การ์ดลอย ----------
     วางบริเวณอ่าวไทย (ขวาล่างของแผนที่) — เลี่ยงปุ่มซูม/ปุ่มสลับธีมที่ลอยคอลัมน์ขวาอยู่แล้ว
     ย่อ (เหลือแถบหัว) / ขยาย / ปิด ได้ · ปิดแล้วเรียกกลับด้วยปุ่มลำโพงใน dock          */
  var card = null, mount = null, minBtn = null;
  var MINK = 'el-yt-min';                             // จำสถานะย่อ/ขยายไว้ข้ามปี
  var minimized = false;
  try { minimized = localStorage.getItem(MINK) === '1'; } catch (err) { }
  if (matchMedia('(max-width:860px)').matches) minimized = true;   // มือถือ: เริ่มแบบย่อ ไม่บังแผนที่

  if (MODE === 'yt') {
    card = document.createElement('div');
    card.id = 'eintroyt';
    card.className = 'off' + (minimized ? ' min' : '');
    card.setAttribute('aria-label', 'เพลงประจำปีเลือกตั้ง ' + Y);
    card.innerHTML =
      '<div class="ythead">'
      + '<span class="ytmark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor">'
      + '<path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2'
      + ' 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4'
      + 'a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8L15.6 12 10 15.2Z"/>'
      + '</svg></span>'
      + '<span class="ytmeta"><b></b><small></small></span>'
      + '<button type="button" data-y="min" aria-label="ย่อ/ขยายการ์ดเพลง">'
      + '<svg viewBox="0 0 24 24"><path class="i-min" d="M5 12h14"/>'
      + '<path class="i-max" d="m7 14 5-5 5 5" style="display:none"/></svg></button>'
      + '<button type="button" data-y="close" title="ปิดการ์ดเพลง" aria-label="ปิดการ์ดเพลง">'
      + '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>'
      + '</div>'
      // ⚠ .ytinner ต้องมีชั้นเดียวครอบทุกอย่าง — เทคนิคยุบด้วย grid-template-rows:0fr
      //   ยุบได้เฉพาะ "แถวที่ประกาศไว้" ลูกตัวที่ 2 จะตกไปอยู่แถว implicit (auto) แล้วไม่ยุบตาม
      + '<div class="ytbody"><div class="ytinner">'
      + '<div class="ytframe"><div class="ytmount"></div></div>'
      + '<div class="ytfoot"><span class="ytby"></span>'
      + '<a class="ytopen" target="_blank" rel="noopener" title="เปิดคลิปเต็มบน YouTube">ดูบน YouTube ↗</a>'
      + '</div></div></div>';
    // ข้อความจากข้อมูล = ใส่ผ่าน textContent ไม่ต่อเข้า innerHTML (ชื่อเพลงมีอัญประกาศ/& ได้)
    card.querySelector('.ytmeta b').textContent = TUNE.party || '';
    card.querySelector('.ytmeta small').textContent = TUNE.title || '';
    card.querySelector('.ytby').textContent = TUNE.artist || TUNE.party || '';
    card.querySelector('.ytopen').href = TUNE.url || ('https://youtu.be/' + TUNE.id);
    card.querySelector('.ythead').title = (TUNE.party || '') + ' — ' + (TUNE.title || '');
    document.body.appendChild(card);
    mount = card.querySelector('.ytmount');
    minBtn = card.querySelector('[data-y="min"]');
    paintMin();

    card.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-y]'); if (!b) return;
      if (b.dataset.y === 'min') {
        minimized = !minimized;
        try { localStorage.setItem(MINK, minimized ? '1' : '0'); } catch (err) { }
        paintMin(); placeYT();
        return;
      }
      setSound(false);            // กากบาท = ปิดเสียง + ซ่อนการ์ด (ปุ่มลำโพงใน dock เรียกกลับได้)
    });
  }

  function paintMin() {
    if (!card) return;
    card.classList.toggle('min', minimized);
    minBtn.querySelector('.i-min').style.display = minimized ? 'none' : '';
    minBtn.querySelector('.i-max').style.display = minimized ? '' : 'none';
    minBtn.title = minimized ? 'ขยายการ์ดเพลง' : 'ย่อการ์ดเพลง';
  }
  function showCard(on) { if (card) card.classList.toggle('off', !on); }

  /* วางการ์ดบริเวณอ่าวไทย (ขวาล่าง) โดยไม่ทับของที่ลอยอยู่คอลัมน์ขวาอยู่ก่อนแล้ว
     — ปุ่มซูม (.zoomctl) · dock เสียง/ดูซ้ำ (#eintrodock) · ปุ่มสลับธีม BB-8 (ลากย้ายได้)
     วิธี: ตรึงขอบล่างก่อน แล้วดูว่าใครบ้าง "อยู่ในแถบความสูงเดียวกับการ์ด" → ถอยไปทางซ้ายให้พ้นตัวซ้ายสุด
     ⚠ มือถือ: ปุ่มซูมย้ายไปลอยกลางขอบขวา (top:50%) ไม่ได้อยู่มุมล่างเหมือนจอใหญ่
       และแผงข้อมูลโผล่จากด้านล่าง → ต้องยกการ์ดขึ้นเหนือแผง
       ความสูงแผงวัดจาก --peek (ตอนย่อ) ไม่ใช่ rect จริง เพราะแผงใช้ transform ตอนกาง
       ถ้าวัด rect การ์ดจะกระโดดตามทุกครั้งที่ผู้ใช้ปัดแผงขึ้นลง                          */
  var YGAP = 12;
  function placeYT() {
    if (!card) return;
    var mob = matchMedia('(max-width:860px)').matches;
    var edge = mob ? 10 : 16;

    // 1) ขอบล่างก่อน — จอใหญ่ชิดมุมล่าง · มือถือยกขึ้นเหนือแผงข้อมูล + แถบเมนูล่าง (.mobnav 58px)
    var bottom = edge;
    if (mob) {
      var pn = document.getElementById('panel');
      var peek = pn ? parseFloat(getComputedStyle(pn).getPropertyValue('--peek')) : 0;
      if (!peek || isNaN(peek)) peek = 104;
      bottom = 58 + peek + 10;
    }
    card.style.bottom = bottom + 'px';

    // 2) แถบความสูงที่การ์ดกินจริงในตอนนี้ (ย่อ/ขยายทำให้ไม่เท่ากัน)
    var h = card.offsetHeight || 0;
    var top = innerHeight - bottom - h;
    var bot = innerHeight - bottom;

    // 3) ใครอยู่แถบเดียวกันบ้าง → ถอยให้พ้นตัวที่ซ้ายสุด
    var lim = Infinity;
    ['.zoomctl', '#eintrodock', '.bb8-toggle'].forEach(function (sel) {
      var e = document.querySelector(sel);
      if (!e) return;
      var cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      var r = e.getBoundingClientRect();
      if (!r.width || r.bottom <= top || r.top >= bot) return;   // คนละแถบ ไม่เกี่ยวกัน
      lim = Math.min(lim, r.left);
    });
    card.style.right = (isFinite(lim) ? Math.round(innerWidth - lim) + YGAP : edge) + 'px';
  }
  // ย่อ/ขยายแล้วความสูงเปลี่ยน → คำนวณตำแหน่งใหม่หลังอนิเมชันจบ (ระหว่างวิ่งค่าจะยังไม่นิ่ง)
  if (card) card.addEventListener('transitionend', function (e) {
    if (e.propertyName === 'grid-template-rows') placeYT();
  });

  /* ---------- พรรคเดิมชนะติดต่อกัน = เพลงเล่นต่อ ไม่เริ่มท่อนแรกใหม่ ----------
     สลับปีคือ "โหลดหน้าใหม่" (year-switch.js ใช้ location.href) → ตัวเล่นเดิมตายไปพร้อมหน้า
     ปีที่พรรคเดิมชนะติดกันจึงได้คลิปเดียวกันแต่ดีดกลับไปเริ่มต้นทุกครั้ง เช่น
     ไทยรักไทย 2544→2548 · เพื่อไทย 2554→2562 · กิจสังคม 2522→2526 · ปชป. 2529→2535/2
     แก้โดยจดตำแหน่งเพลงตอนออกจากหน้า แล้วปีถัดไปถ้า "คลิปเดียวกัน + เป็นครั้งที่ติดกัน"
     ค่อยเริ่มที่จุดนั้น บวกเวลาที่เสียไปตอนโหลดหน้า ให้เพลงเดินต่อเหมือนไม่เคยหยุด
     ⚠ ต้องเช็กว่าติดกันจริง ไม่ใช่แค่คลิปตรงกัน — ห่างกันหลายครั้ง (คนละยุค) ให้เริ่มใหม่ตามปกติ */
  var PKEY = 'el-intro-pos';                          // sessionStorage: อยู่แค่ในแท็บนี้ ปิดแท็บก็หาย
  var SEQ = (window.EYEARS || []).map(function (o) { return o.id; });   // เรียงครั้งใหม่→เก่า
  var GAPMAX = 20;                                    // ห่างเกินนี้ = ไม่ใช่การสลับปีต่อเนื่องแล้ว
  var lastSave = 0;

  function savePos() {
    if (!hasAudio) return;
    try {
      var t, playing;
      if (MODE === 'yt') {
        if (!ytReady) return;
        t = player.getCurrentTime(); playing = player.getPlayerState() === 1;
      } else {
        t = audio.currentTime; playing = !audio.paused;
      }
      // ไม่ได้เล่นอยู่ = ไม่ต้องจำ (ลบทิ้งด้วย กันของเก่าค้างแล้วปีหน้าเล่นต่อทั้งที่ผู้ใช้สั่งปิด)
      if (!playing || !t) { sessionStorage.removeItem(PKEY); return; }
      sessionStorage.setItem(PKEY, JSON.stringify(
        { f: SRCKEY, t: t, y: window.EYID, at: Date.now() }));
    } catch (err) { }
  }

  function resumeAt() {                               // วินาทีที่ควรเริ่ม · 0 = เริ่มใหม่ตามปกติ
    var s = null;
    try { s = JSON.parse(sessionStorage.getItem(PKEY) || 'null'); } catch (err) { }
    if (!s || s.f !== SRCKEY) return 0;               // คนละพรรค/คนละเพลง/คนละแหล่ง → เริ่มใหม่
    var i = SEQ.indexOf(s.y), j = SEQ.indexOf(window.EYID);
    if (i < 0 || j < 0 || Math.abs(i - j) > 1) return 0;   // 0 = หน้าเดิมโหลดซ้ำ · 1 = ครั้งที่ติดกัน
    var gap = (Date.now() - (s.at || 0)) / 1000;
    if (gap < 0 || gap > GAPMAX) return 0;
    return s.t + gap;
  }

  /* ---------- โหลด IFrame Player API แล้วสร้างตัวเล่น ----------
     onYouTubeIframeAPIReady เป็น global ตัวเดียวทั้งหน้า → ต่อคิวของเดิมไว้ ไม่ทับใครที่ตั้งไว้ก่อน */
  function loadYT(cb) {
    if (window.YT && window.YT.Player) return cb();
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === 'function') { try { prev(); } catch (err) { } }
      cb();
    };
    if (document.getElementById('ytapi')) return;     // มีสคริปต์รออยู่แล้ว แค่ต่อคิวพอ
    var s = document.createElement('script');
    s.id = 'ytapi'; s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = noMusic;                              // เน็ตบล็อก YouTube → ซ่อนปุ่มเสียงไปเลย ไม่ค้าง
    document.head.appendChild(s);
  }

  var resume = hasAudio ? resumeAt() : 0;

  if (MODE === 'yt') {
    loadYT(function () {
      try {
        player = new YT.Player(mount, {
          host: 'https://www.youtube-nocookie.com',   // โหมดความเป็นส่วนตัวสูง ไม่หยอดคุกกี้ติดตาม
          videoId: TUNE.id,
          playerVars: {
            autoplay: 0, playsinline: 1, rel: 0, modestbranding: 1,
            loop: 1, playlist: TUNE.id,               // คลิปเดี่ยวจะวนซ้ำได้ ต้องระบุ playlist ซ้ำตัวเอง
            start: Math.max(0, Math.floor(resume)) || 0,
            // เปิดจากไฟล์ตรง ๆ (file://) origin เป็นสตริง "null" — ส่งไปตัวเล่นจะไม่ยอมเล่น
            // ใส่เฉพาะตอนเสิร์ฟผ่าน http(s) จริงเท่านั้น (ซึ่งเป็นตอนที่มันช่วยกันโดเมนปลอมได้จริง)
            origin: /^https?:$/.test(location.protocol) ? location.origin : undefined
          },
          events: {
            onReady: function () {
              ytReady = true;
              try { player.setVolume(45); } catch (err) { }
              if (pendingPlay || want) { pendingPlay = false; tryPlay(); }
            },
            // 1 = PLAYING · 2 = PAUSED · 0 = ENDED — ปุ่มต้องสะท้อน "ดังจริงไหม" ไม่ใช่ค่าที่ผู้ใช้เลือก
            onStateChange: function (e) {
              if (e.data === 1) paint(true);
              else if (e.data === 2 || e.data === 0) paint(false);
            },
            onError: noMusic                          // คลิปถูกลบ/ปิดการฝัง → ซ่อนไป ไม่ให้การ์ดค้างเปล่า
          }
        });
      } catch (err) { noMusic(); }
    });

  } else if (MODE === 'mp3') {
    /* ---------- ปีที่ยังไม่มีคลิป YouTube: เล่นไฟล์เสียงเดิมใน songs/ ----------
       เสียงพื้นหลังล้วน ไม่มีการ์ด — คุมด้วยปุ่มลำโพงใน dock เหมือนก่อนมี YouTube */
    audio = new Audio();
    audio.src = MUSIC; audio.loop = true; audio.volume = .45; audio.muted = !want;
    audio.addEventListener('error', noMusic);

    if (resume) {
      /* เริ่มแบบเงียบไว้ก่อน แล้วค่อยเฟดเข้าหลังกระโดดไปจุดที่ค้างไว้สำเร็จ — กัน 2 อย่าง
         · เสียง "ป๊อก" เพราะตัดเข้ากลางคลื่นเสียง (ไม่ได้เริ่มที่ศูนย์เหมือนตอนเปิดไฟล์)
         · ท่อนแรกโผล่มาแวบหนึ่งก่อนกระโดด ในกรณีที่ seek ยังทำไม่ได้ทันที           */
      audio.volume = 0;
      var settled = false;
      var ramp = function () {
        var k = 0;
        // ⚠ ใช้ setInterval ไม่ใช่ rAF — สลับปีมาแล้วแท็บยังไม่ active rAF จะค้าง เสียงจะเบาแหง็กค้างอยู่อย่างนั้น
        var iv = setInterval(function () {
          k++; audio.volume = .45 * Math.min(1, k / 9);
          if (k >= 9) clearInterval(iv);
        }, 30);
      };
      /* ⚠ สั่ง currentTime เฉย ๆ ไม่พอ — ต้องรอให้ช่วงเวลานั้น seekable ก่อน ไม่งั้นสเปกสั่งให้ยกเลิก seek เงียบ ๆ
         เซิร์ฟเวอร์ที่ไม่รองรับ HTTP Range (static_server.js / election/server.js ที่ใช้พรีวิวในเครื่อง
         ตอบ 200 เต็มไฟล์เสมอ) จะกระโดดไม่ได้เลยจนกว่าจะโหลดครบทั้งก้อน · Netlify รองรับ Range
         จึงติดตั้งแต่ loadedmetadata → สั่งซ้ำทุกครั้งที่บัฟเฟอร์เพิ่ม แล้วอ่านค่ากลับมาเช็กว่าติดจริงไหม */
      var EVS = ['loadedmetadata', 'progress', 'canplay', 'canplaythrough'];
      var until = Date.now() + 2500;                  // เลยนี้ไปแล้วค่อยกระโดด สะดุดกว่าปล่อยให้เล่นไปเลย
      var stopSeek = function () {
        if (settled) return; settled = true;
        EVS.forEach(function (e) { audio.removeEventListener(e, trySeek); });
        ramp();
      };
      var trySeek = function () {
        var d = audio.duration;
        if (d && isFinite(d)) {
          var to = resume % d;
          try { audio.currentTime = to; } catch (err) { }
          if (Math.abs(audio.currentTime - to) < 1) return stopSeek();   // ติดแล้ว
        }
        if (Date.now() > until) stopSeek();                              // ยอมแพ้ เล่นจากต้นไป
      };
      EVS.forEach(function (e) { audio.addEventListener(e, trySeek); });
      setTimeout(trySeek, 2600);                      // เผื่อไฟล์นิ่งจนไม่มี event ไหนยิงอีกเลย
    }
  }

  if (hasAudio) {
    addEventListener('pagehide', savePos);
    // pagehide ไม่ยิงในบางกรณี (มือถือสลับแอป/เบราว์เซอร์เก่า) → จดสำรองตอนแท็บหาย และทุก 1 วิ
    addEventListener('visibilitychange', function () { if (document.hidden) savePos(); });
    setInterval(function () {
      var n = Date.now();
      if (n - lastSave < 1000) return;
      lastSave = n; savePos();
    }, 1000);
  }

  /* ปุ่มค้างบนหน้า: ดูฉากเปิดซ้ำ + เปิด/ปิดเสียง */
  var dock = document.createElement('div');
  dock.id = 'eintrodock';
  dock.innerHTML =
    '<button type="button" data-a="replay" title="ดูฉากเปิดอีกครั้ง" aria-label="ดูฉากเปิดอีกครั้ง">'
    + '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg></button>'
    + '<button type="button" data-a="sound" class="off" title="เปิดเสียงเพลง" aria-label="เปิด/ปิดเสียงเพลง">'
    + '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path class="mute" d="m17 9 4 6M21 9l-4 6"/>'
    + '<path class="wave" d="M16 9a4 4 0 0 1 0 6" style="display:none"/></svg></button>';
  document.body.appendChild(dock);
  var dockSnd = dock.querySelector('[data-a="sound"]');

  // วางไว้ติดปุ่มซูมของแผนที่ (ความสูงปุ่มซูมไม่เท่ากันทุกปี — ปีที่ไม่มีเขตจะซ่อนปุ่มหมายเลขเขต)
  // ⚠️ มือถือ/แท็บเล็ตแนวตั้ง: ปุ่มซูมลอยกลางขอบขวา (top:50%) ส่วน dock เคยตรึงไว้ที่ top:196px ตายตัว
  //    → จอเตี้ยกว่า ~738px ปุ่มซูมจะเลื่อนขึ้นมาโดน dock ทับ (z-index 58 > 50) กดปุ่ม "เลขเขต/+" ไม่ได้
  //    เลยต้องวัดช่องว่างจริงในคอลัมน์ขวา: ใต้ปุ่มซูมก่อน → ไม่พอค่อยไปด้านบน → ไม่พออีกก็หลบไปทางซ้าย
  var GAP = 10;
  // ปุ่ม BB-8 สลับธีมก็ลอยอยู่คอลัมน์ขวาเหมือนกัน (และลากย้ายได้) → นับเป็นสิ่งกีดขวางเมื่ออยู่แนวเดียวกัน
  function bb8In(ref) {
    var b = document.querySelector('.bb8-toggle');
    if (!b || getComputedStyle(b).position !== 'fixed') return null;
    var r = b.getBoundingClientRect();
    return (r.right > ref.left - 4 && r.left < ref.right + 4) ? r : null;
  }
  var placeDock = function () {
    var z = document.querySelector('.zoomctl');
    var vis = z && getComputedStyle(z).display !== 'none';
    var mob = matchMedia('(max-width:860px)').matches;
    dock.style.right = '';
    if (!vis) {                                       // ปีเก่าที่ซ่อนปุ่มซูม → ใช้ค่าจาก CSS
      dock.style.top = '';
      dock.style.bottom = mob ? '' : '96px';
      return;
    }
    var zr = z.getBoundingClientRect();
    var br = bb8In(zr);
    if (!mob) {                                       // เดสก์ท็อป/แท็บเล็ตแนวนอน: วางเหนือปุ่มซูม (และเหนือ BB-8 ถ้าคั่นอยู่)
      dock.style.top = '';
      dock.style.bottom = (innerHeight - Math.min(zr.top, br ? br.top : Infinity) + 12) + 'px';
      return;
    }
    var h = dock.offsetHeight;
    var yb = document.querySelector('.yearbtn');      // ปุ่มเลือกปี = เพดานของคอลัมน์ขวา
    var pn = document.getElementById('panel');        // แผงข้อมูลด้านล่าง = พื้น
    var sc = document.querySelector('.searchcard');   // ช่องค้นหาพาดเต็มความกว้างด้านบน
    var ybr = yb ? yb.getBoundingClientRect() : null;
    var ceil = ybr ? ybr.bottom + GAP : 8;
    var floor = Math.min(pn ? pn.getBoundingClientRect().top : innerHeight - 8 + GAP,
                         br && br.top > zr.top ? br.top : Infinity) - GAP;
    dock.style.bottom = 'auto';
    if (zr.bottom + GAP + h <= floor) { dock.style.top = (zr.bottom + GAP) + 'px'; return; }
    if (zr.top - GAP - h >= ceil) { dock.style.top = (zr.top - GAP - h) + 'px'; return; }
    // ไม่พอทั้งบน-ล่าง (จอแนวนอนเตี้ย) → หลบไปเคียงซ้าย และเลยปุ่มเลือกปีด้วยถ้าอยู่ระดับเดียวกัน
    var top = Math.max(sc ? sc.getBoundingClientRect().bottom + GAP : 8, Math.min(zr.top, floor - h));
    var lim = zr.left;
    if (ybr && ybr.bottom > top && ybr.top < top + h) lim = Math.min(lim, ybr.left);
    dock.style.top = Math.round(top) + 'px';
    dock.style.right = Math.round(innerWidth - lim + GAP) + 'px';
  };
  // ⚠️ แผนที่จัดเลย์เอาต์ใหม่ช้ากว่า event resize → วัดทันทีได้ค่าเก่า ต้องวัดซ้ำอีกรอบหลังนิ่งแล้ว
  var dockTimer;
  var refitDock = function () {
    placeDock();
    clearTimeout(dockTimer);
    dockTimer = setTimeout(placeDock, 280);
  };
  refitDock();
  addEventListener('resize', refitDock);
  addEventListener('load', refitDock);

  // จัดตำแหน่งการ์ดเพลงชุดเดียวกับ dock (แผนที่จัดเลย์เอาต์ช้ากว่า event resize → วัดซ้ำหลังนิ่ง)
  placeYT();
  addEventListener('resize', function () { placeYT(); setTimeout(placeYT, 280); });
  addEventListener('load', placeYT);

  function noMusic() {
    hasAudio = false;
    pendingPlay = false;
    if (sndBtn) sndBtn.style.display = 'none';
    dockSnd.style.display = 'none';
    if (card) card.remove();
    card = null;
  }
  if (!hasAudio) noMusic();                           // ปีที่ไม่มีทั้งคลิปและไฟล์เสียง → ซ่อนปุ่มเสียงไปเลย

  // shown = "ตอนนี้มีเสียงจริงไหม" (ไม่ใช่ want) — ตอนโดนบล็อก want ยังเปิดอยู่แต่ยังไม่มีเสียง
  // ปุ่มต้องสลับตามสิ่งที่ผู้ใช้เห็น ไม่งั้นกดปุ่ม "เปิดเสียง" แล้วกลายเป็นสั่งปิด
  var shown = false;
  function paint(on) {
    shown = on;
    dockSnd.classList.toggle('off', !on);
    dockSnd.title = on ? 'ปิดเสียงเพลง' : 'เปิดเสียงเพลง';
    dockSnd.querySelector('.mute').style.display = on ? 'none' : '';
    dockSnd.querySelector('.wave').style.display = on ? '' : 'none';
    if (sndBtn) sndBtn.textContent = on ? 'ปิดเสียง' : 'เปิดเสียง';
    if (card) card.classList.toggle('playing', on);
  }

  // เบราว์เซอร์บล็อก autoplay จนกว่าจะมีการแตะหน้า → ดักการแตะครั้งแรกไว้เล่นให้เอง
  var armed = false;
  function armUnlock() {
    if (armed) return; armed = true;
    var h = function (e) {
      // ปล่อยให้ปุ่มเสียง/ปุ่มบนการ์ดจัดการเอง (ไม่งั้นทั้งเปิดทั้งสลับ = หักล้างกัน)
      if (e.target && e.target.closest &&
        (e.target.closest('[data-a="sound"]') || e.target.closest('#eintroyt'))) return;
      document.removeEventListener('pointerdown', h, true);
      document.removeEventListener('keydown', h, true);
      armed = false;
      if (want) tryPlay();
    };
    document.addEventListener('pointerdown', h, true);
    document.addEventListener('keydown', h, true);
  }

  function tryPlay() {
    if (!hasAudio) return;
    if (MODE === 'mp3') {                             // เสียงพื้นหลังแบบเดิม — play() คืน promise บอกได้เลยว่าโดนบล็อกไหม
      audio.muted = false;
      var p = audio.play();
      if (p && p.then) p.then(function () { paint(true); }, function () { paint(false); armUnlock(); });
      else paint(true);
      return;
    }
    showCard(true);
    if (!ytReady) { pendingPlay = true; return; }     // API ยังโหลดไม่เสร็จ — เล่นทันทีที่ onReady
    try { player.unMute(); player.setVolume(45); player.playVideo(); } catch (err) { }
    /* YT API ไม่คืน promise เหมือน <audio>.play() → ไม่มีทางรู้ทันทีว่าโดนบล็อกไหม
       ต้องถามสถานะย้อนหลังสักครู่ (เผื่อ buffer ช้า) แล้วค่อยตัดสิน */
    clearTimeout(playChk);
    playChk = setTimeout(function () {
      var st = -1;
      try { st = player.getPlayerState(); } catch (err) { }
      if (st === 1 || st === 3) paint(true);          // PLAYING / BUFFERING = ผ่าน
      else { paint(false); armUnlock(); }
    }, 1200);
  }

  // on = สิ่งที่ "ผู้ใช้เลือก" → บันทึกไว้ให้ปีอื่นใช้ด้วย
  function setSound(on) {
    want = on;
    try { localStorage.setItem(SKEY, on ? '1' : '0'); } catch (err) { }
    if (on) return tryPlay();
    if (MODE === 'mp3') { audio.pause(); paint(false); return; }
    pendingPlay = false;
    clearTimeout(playChk);
    try { if (player) player.pauseVideo(); } catch (err) { }
    showCard(false);                                  // ปิดเสียง = เก็บการ์ดไปด้วย
    paint(false);
  }

  // วาดตามที่ผู้ใช้เลือกไว้ก่อน (กันปุ่มกะพริบ) แล้วค่อยลองเล่น — ถ้าโดนบล็อก tryPlay จะวาดใหม่เป็น "เปิดเสียง"
  if (hasAudio) { paint(want); if (want) { if (card) showCard(true); tryPlay(); } }

  var timer, closed = false;
  function close() {
    if (closed) return; closed = true;
    clearTimeout(timer);
    el.classList.remove('on');
    setTimeout(function () { el.classList.add('done'); }, 800);   // เพลงเล่นต่อ ไม่หยุดพร้อมฉาก
  }
  function replay() {
    closed = false;
    el.classList.remove('done');
    // บังคับให้เบราว์เซอร์คำนวณเลย์เอาต์ใหม่ก่อน แล้วค่อยใส่ .on อนิเมชันจะได้เล่นจริง
    void el.offsetWidth;
    el.classList.add('on');
    clearTimeout(timer);
    timer = setTimeout(close, HOLD);
  }
  dock.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'replay') return replay();
    setSound(!shown);
  });
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'skip') return close();
    setSound(!shown);
  });

  /* ⚠ requestAnimationFrame ไม่ยิงเลยถ้าแท็บไม่ได้แสดงผล → ต้องมี setTimeout สำรอง */
  var started = false;
  function start() {
    if (started) return; started = true;
    el.classList.add('on');
    timer = setTimeout(close, HOLD);
  }
  requestAnimationFrame(function () { requestAnimationFrame(start); });
  setTimeout(start, 80);
})();
