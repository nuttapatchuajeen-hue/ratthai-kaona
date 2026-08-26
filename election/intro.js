/* ===== intro.js — ฉากเปิดหน้ารายเขต =====
   อันดับ 1 เลื่อนเข้าจากซ้าย · อันดับ 2 เลื่อนเข้าจากขวา · อันดับ 3–5 ขึ้นมาจากด้านล่าง
   ค้างไว้ ~6 วิ แล้วเลื่อนออกทางเดิม เผยแผนที่

   ตัวเลข: intro-seats.js (window.INTRO_SEATS) — เรียงตาม "ที่นั่งรวม" = แบ่งเขต + บัญชีรายชื่อ
           แบ่งเขตนับจาก year-<id>.js (ตรงกับแผนที่) · บัญชีรายชื่อจาก standings-<id>.js
   ชื่อ/รูป: intro-data.js (window.INTRO) + leaders/<ชื่อคน>.png|.jpg
   เพลง: ค่าเริ่มต้น "เปิดเสียง" และจำสิ่งที่ผู้ใช้เลือกไว้ใช้ทุกปี (localStorage 'el-intro-sound')
         เบราว์เซอร์บล็อก autoplay ถ้ายังไม่มีการคลิกในหน้านั้น → ลองเล่นก่อน ถ้าโดนบล็อก
         ปุ่มจะกลับเป็น "เปิดเสียง" แล้วรอผู้ใช้แตะหน้าครั้งแรก ค่อยเล่นเองอัตโนมัติ
         พรรคเดิมชนะติดต่อกัน (เพลงไฟล์เดียวกัน + เป็นการเลือกตั้งครั้งที่ติดกัน) = เล่นต่อจากจุดเดิม
         ไม่ดีดกลับไปท่อนแรก (sessionStorage 'el-intro-pos')

   ⚠ ต้องโหลดหลัง year-switch.js · intro-data.js · intro-seats.js */
(function () {
  var S = (window.INTRO_SEATS || {})[window.EYID];
  if (!S || !window.DATA || !window.DATA.provStats) return;
  var D = window.DATA, I = (window.INTRO || {})[window.EYID] || {};
  var Y = window.EYEAR;
  var HOLD = 6000;
  // เพลงประจำปี = เพลงของพรรคอันดับ 1 ปีนั้น (intro-music.js) · ปีที่ยังไม่มีเพลงก็เงียบไป ไม่พัง
  var MUSIC = (window.INTRO_MUSIC || {})[window.EYID];
  MUSIC = MUSIC ? '../songs/' + MUSIC : '';

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

  /* ---------- เพลง YouTube Embed: การ์ดวิดีโอถูกลิขสิทธิ์ประจำปี ---------- */
  var YT_KEY = 'el-yt-open';
  var YT = (window.INTRO_YOUTUBE || {})[window.EYID];
  var hasYT = !!(YT && YT.id);

  var cardVisible = false;
  try { cardVisible = localStorage.getItem(YT_KEY) !== '0'; } catch(e){}

  /* เพิ่ม CSS สำหรับ YouTube Mini Player Card */
  CSS += ''
    + '.eytcard{position:fixed;right:76px;bottom:20px;width:320px;max-width:calc(100vw - 32px);'
    + 'background:var(--paper,#0e1a26);border:1px solid var(--line,rgba(255,255,255,.16));'
    + 'border-radius:14px;box-shadow:var(--shadow-lg,0 12px 36px rgba(0,0,0,.4));z-index:56;'
    + 'font-family:Kanit,sans-serif;color:var(--ink,#e8eef5);overflow:hidden;backdrop-filter:blur(10px);'
    + 'transition:transform .3s cubic-bezier(.4,0,.2,1),opacity .3s,max-height .35s;}'
    + '.eytcard.hidden{opacity:0;transform:translateY(16px) scale(.95);pointer-events:none;display:none}'
    + '.eyt-head{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;'
    + 'background:var(--wash,rgba(255,255,255,.05));border-bottom:1px solid var(--line,rgba(255,255,255,.1));cursor:pointer;}'
    + '.eyt-title-row{display:flex;align-items:center;gap:6px;font-size:.78rem;min-width:0;}'
    + '.eyt-badge{background:var(--orange-soft,rgba(242,101,34,.16));color:var(--orange, #f26522);'
    + 'font-weight:600;font-size:.68rem;padding:2px 7px;border-radius:6px;white-space:nowrap;}'
    + '.eyt-party{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
    + '.eyt-actions{display:flex;align-items:center;gap:4px;flex:0 0 auto;}'
    + '.eyt-btn{width:26px;height:26px;border-radius:6px;border:0;background:transparent;'
    + 'color:var(--muted,#8b9aab);cursor:pointer;display:grid;place-items:center;padding:0;transition:.12s;}'
    + '.eyt-btn:hover{background:rgba(255,255,255,.12);color:var(--ink,#fff);}'
    + '.eyt-body{transition:all .3s ease;}'
    + '.eyt-frame{position:relative;width:100%;aspect-ratio:16/9;background:#000;}'
    + '.eyt-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;}'
    + '.eyt-meta{padding:8px 12px 10px;font-family:Sarabun,sans-serif;font-size:.75rem;}'
    + '.eyt-song{font-family:Kanit,sans-serif;font-weight:500;font-size:.82rem;line-height:1.3;'
    + 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
    + '.eyt-artist{font-size:.68rem;color:var(--muted,#8b9aab);margin-top:2px;line-height:1.4;'
    + 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
    + '.eyt-artist a{color:var(--orange,#f26522);text-decoration:none;}'
    + '.eyt-artist a:hover{text-decoration:underline;}'
    + '.eytcard.min .eyt-body{display:none;}'
    + '.eytcard.min{width:260px;}'
    + '@media(max-width:860px){.eytcard{right:12px;left:auto;bottom:80px;width:300px;}}'
    + '@media(max-width:480px){.eytcard{right:10px;left:10px;bottom:76px;width:auto;}}';

  var st = document.createElement('style'); st.textContent = CSS;
  document.head.appendChild(st); document.body.appendChild(el);

  // แผงสองข้างต้องเริ่มต่อจากแถบบนพอดี — วัดความสูงจริงแทนการเดา
  var barEl = el.querySelector('.bar'), pmBarEl = el.querySelector('.pmbar');
  var syncBar = function () {
    el.style.setProperty('--barh', barEl.offsetHeight + 'px');
    el.style.setProperty('--pmh', (pmBarEl ? pmBarEl.offsetHeight : 0) + 'px');
  };
  syncBar(); addEventListener('resize', syncBar);
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
      var box = im.parentNode;
      if (box && box.classList && box.classList.contains('lg')) box.style.display = 'none';
    });
  });

  /* สร้าง YouTube Mini Player Card */
  var ytCard = null;
  if (hasYT) {
    ytCard = document.createElement('div');
    ytCard.id = 'eytcard';
    ytCard.className = 'eytcard' + (cardVisible ? '' : ' hidden');
    ytCard.innerHTML = ''
      + '<div class="eyt-head">'
      + '  <div class="eyt-title-row" title="คลิกเพื่อย่อ/ขยาย">'
      + '    <span class="eyt-badge">♪ YouTube</span>'
      + '    <span class="eyt-party">' + (YT.party ? 'พรรค' + YT.party : 'เพลงประจำปี') + '</span>'
      + '  </div>'
      + '  <div class="eyt-actions">'
      + '    <button type="button" class="eyt-btn" data-act="min" title="ย่อ/ขยายตัวเล่น">'
      + '      <svg class="ic-min" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>'
      + '      <svg class="ic-exp" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display:none"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>'
      + '    </button>'
      + '    <button type="button" class="eyt-btn" data-act="close" title="ปิดการ์ดเพลง">'
      + '      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
      + '    </button>'
      + '  </div>'
      + '</div>'
      + '<div class="eyt-body">'
      + '  <div class="eyt-frame">'
      + '    <iframe id="eytframe"'
      + '      src="https://www.youtube.com/embed/' + YT.id + '?rel=0"'
      + '      title="' + YT.title + '"'
      + '      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"'
      + '      referrerpolicy="strict-origin-when-cross-origin"'
      + '      allowfullscreen loading="lazy"></iframe>'
      + '  </div>'
      + '  <div class="eyt-meta">'
      + '    <div class="eyt-song" title="' + YT.title + '">' + YT.title + '</div>'
      + '    <div class="eyt-artist">' + YT.artist + ' — <a href="' + YT.url + '" target="_blank" rel="noopener">ดูบน YouTube ↗</a></div>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(ytCard);

    // ปุ่ม ย่อ / ขยาย / ปิด
    var headEl = ytCard.querySelector('.eyt-head');
    var minBtn = ytCard.querySelector('[data-act="min"]');
    var closeBtn = ytCard.querySelector('[data-act="close"]');
    var icMin = ytCard.querySelector('.ic-min'), icExp = ytCard.querySelector('.ic-exp');

    function toggleMin(e) {
      if (e && e.target && e.target.closest && e.target.closest('[data-act="close"]')) return;
      var isMin = ytCard.classList.toggle('min');
      icMin.style.display = isMin ? 'none' : '';
      icExp.style.display = isMin ? '' : 'none';
    }
    headEl.addEventListener('click', toggleMin);
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setCardOpen(false);
    });
  }

  /* ปุ่มค้างบนหน้า: ดูฉากเปิดซ้ำ + เปิด/ปิดการ์ดเพลง YouTube */
  var dock = document.createElement('div');
  dock.id = 'eintrodock';
  dock.innerHTML =
    '<button type="button" data-a="replay" title="ดูฉากเปิดอีกครั้ง" aria-label="ดูฉากเปิดอีกครั้ง">'
    + '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg></button>'
    + '<button type="button" data-a="sound" class="' + (cardVisible && hasYT ? '' : 'off') + '" title="' + (cardVisible && hasYT ? 'ซ่อนการ์ดเพลง YouTube' : 'เปิดการ์ดเพลง YouTube') + '" aria-label="เปิด/ปิดการ์ดเพลง YouTube">'
    + '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path class="mute" d="m17 9 4 6M21 9l-4 6" style="' + (cardVisible && hasYT ? 'display:none' : '') + '"/>'
    + '<path class="wave" d="M16 9a4 4 0 0 1 0 6" style="' + (cardVisible && hasYT ? '' : 'display:none') + '"/></svg></button>';
  document.body.appendChild(dock);
  var dockSnd = dock.querySelector('[data-a="sound"]');
  var sndBtn = el.querySelector('[data-a="sound"]');

  var GAP = 10;
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
    if (!vis) {
      dock.style.top = '';
      dock.style.bottom = mob ? '' : '96px';
      return;
    }
    var zr = z.getBoundingClientRect();
    var br = bb8In(zr);
    if (!mob) {
      dock.style.top = '';
      dock.style.bottom = (innerHeight - Math.min(zr.top, br ? br.top : Infinity) + 12) + 'px';
      return;
    }
    var h = dock.offsetHeight;
    var yb = document.querySelector('.yearbtn');
    var pn = document.getElementById('panel');
    var sc = document.querySelector('.searchcard');
    var ybr = yb ? yb.getBoundingClientRect() : null;
    var ceil = ybr ? ybr.bottom + GAP : 8;
    var floor = Math.min(pn ? pn.getBoundingClientRect().top : innerHeight - 8 + GAP,
                         br && br.top > zr.top ? br.top : Infinity) - GAP;
    dock.style.bottom = 'auto';
    if (zr.bottom + GAP + h <= floor) { dock.style.top = (zr.bottom + GAP) + 'px'; return; }
    if (zr.top - GAP - h >= ceil) { dock.style.top = (zr.top - GAP - h) + 'px'; return; }
    var top = Math.max(sc ? sc.getBoundingClientRect().bottom + GAP : 8, Math.min(zr.top, floor - h));
    var lim = zr.left;
    if (ybr && ybr.bottom > top && ybr.top < top + h) lim = Math.min(lim, ybr.left);
    dock.style.top = Math.round(top) + 'px';
    dock.style.right = Math.round(innerWidth - lim + GAP) + 'px';
  };
  var dockTimer;
  var refitDock = function () {
    placeDock();
    clearTimeout(dockTimer);
    dockTimer = setTimeout(placeDock, 280);
  };
  refitDock();
  addEventListener('resize', refitDock);
  addEventListener('load', refitDock);

  if (!hasYT) {
    if (sndBtn) sndBtn.style.display = 'none';
    if (dockSnd) dockSnd.style.display = 'none';
  }

  function setCardOpen(open) {
    if (!hasYT || !ytCard) return;
    cardVisible = open;
    try { localStorage.setItem(YT_KEY, open ? '1' : '0'); } catch(e){}
    ytCard.classList.toggle('hidden', !open);
    if (open && ytCard.classList.contains('min')) {
      ytCard.classList.remove('min');
      var icMin = ytCard.querySelector('.ic-min'), icExp = ytCard.querySelector('.ic-exp');
      if (icMin) icMin.style.display = '';
      if (icExp) icExp.style.display = 'none';
    }
    dockSnd.classList.toggle('off', !open);
    dockSnd.title = open ? 'ซ่อนการ์ดเพลง YouTube' : 'เปิดการ์ดเพลง YouTube';
    dockSnd.querySelector('.mute').style.display = open ? 'none' : '';
    dockSnd.querySelector('.wave').style.display = open ? '' : 'none';
    if (sndBtn) sndBtn.textContent = open ? 'ซ่อนเพลง' : 'เปิดเพลง';
  }

  var timer, closed = false;
  function close() {
    if (closed) return; closed = true;
    clearTimeout(timer);
    el.classList.remove('on');
    setTimeout(function () { el.classList.add('done'); }, 800);
  }
  function replay() {
    closed = false;
    el.classList.remove('done');
    void el.offsetWidth;
    el.classList.add('on');
    clearTimeout(timer);
    timer = setTimeout(close, HOLD);
  }
  dock.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'replay') return replay();
    setCardOpen(!cardVisible);
  });
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'skip') return close();
    setCardOpen(!cardVisible);
  });

  var started = false;
  function start() {
    if (started) return; started = true;
    el.classList.add('on');
    timer = setTimeout(close, HOLD);
  }
  requestAnimationFrame(function () { requestAnimationFrame(start); });
  setTimeout(start, 80);
})();
