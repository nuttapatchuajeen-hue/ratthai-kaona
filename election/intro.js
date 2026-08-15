/* ===== intro.js — ฉากเปิดหน้ารายเขต =====
   อันดับ 1 เลื่อนเข้าจากซ้าย · อันดับ 2 เลื่อนเข้าจากขวา · อันดับ 3–5 ขึ้นมาจากด้านล่าง
   ค้างไว้ ~6 วิ แล้วเลื่อนออกทางเดิม เผยแผนที่

   ตัวเลข: intro-seats.js (window.INTRO_SEATS) — เรียงตาม "ที่นั่งรวม" = แบ่งเขต + บัญชีรายชื่อ
           แบ่งเขตนับจาก year-<id>.js (ตรงกับแผนที่) · บัญชีรายชื่อจาก standings-<id>.js
   ชื่อ/รูป: intro-data.js (window.INTRO) + leaders/<ชื่อคน>.png|.jpg
   เพลง: ค่าเริ่มต้น "เปิดเสียง" และจำสิ่งที่ผู้ใช้เลือกไว้ใช้ทุกปี (localStorage 'el-intro-sound')
         เบราว์เซอร์บล็อก autoplay ถ้ายังไม่มีการคลิกในหน้านั้น → ลองเล่นก่อน ถ้าโดนบล็อก
         ปุ่มจะกลับเป็น "เปิดเสียง" แล้วรอผู้ใช้แตะหน้าครั้งแรก ค่อยเล่นเองอัตโนมัติ

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
    /* แผงใหญ่ 2 ข้าง */
    /* top ใช้ความสูงจริงของแถบบน (--barh วัดตอนรันไทม์) ไม่งั้นเหลือช่องว่างคั่นระหว่างแถบกับแผง
       จอใหญ่: แผงยาวถึงขอบล่าง แล้ววางการ์ดอันดับ 3–5 ไว้ "ในช่องกลาง" ระหว่างสองแผง */
    + '#eintro .side{position:absolute;top:var(--barh,52px);bottom:0;width:31%;max-width:400px;padding:22px 22px;'
    + 'display:flex;flex-direction:column;justify-content:center;color:#fff;'
    + 'transition:transform .75s cubic-bezier(.4,0,.2,1)}'
    + '#eintro .side.l{left:0;transform:translateX(-102%)}'
    + '#eintro .side.r{right:0;text-align:right;align-items:flex-end;transform:translateX(102%)}'
    + '#eintro.on .side{transform:none}'
    + '#eintro .rank{font-size:.72rem;letter-spacing:.16em;opacity:.72;font-family:Sarabun,sans-serif}'
    + '#eintro .face{height:168px;width:auto;max-width:100%;object-fit:contain;object-position:top center;'
    + 'margin:8px 0 2px;border-radius:12px;background:rgba(255,255,255,.14);align-self:flex-start}'
    + '#eintro .side.r .face{align-self:flex-end}'
    + '#eintro .pname{font-size:1.45rem;font-weight:600;line-height:1.25;margin:4px 0 2px}'
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
    /* แถวอันดับ 3–5 ด้านล่าง */
    /* วางกลางจอเสมอและ "ห้ามตกบรรทัด" — ถ้าช่องกลางแคบก็ให้ล้ำทับแผงได้ (การ์ดมีพื้นหลังของตัวเอง) */
    + '#eintro .mrow{position:absolute;left:50%;bottom:58px;display:flex;gap:8px;justify-content:center;'
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
    /* ปีที่ยังไม่มีพรรคการเมือง — แผงเดียวตรงกลาง */
    + '#eintro .solo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.94);opacity:0;'
    + 'text-align:center;color:#fff;transition:opacity .6s,transform .6s}'
    + '#eintro.on .solo{opacity:1;transform:translate(-50%,-50%) scale(1)}'
    /* ปุ่มควบคุม */
    + '#eintro .ctl{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:8px;'
    + 'pointer-events:auto;opacity:0;transition:opacity .4s}'
    + '#eintro.on .ctl{opacity:1}'
    + '#eintro .ctl button{font-family:Kanit,sans-serif;font-size:.8rem;color:#fff;background:rgba(255,255,255,.14);'
    + 'border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:7px 15px;cursor:pointer;transition:.14s}'
    + '#eintro .ctl button:hover{background:rgba(255,255,255,.26)}'
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
    + '#eintro .side{width:50%;max-width:none;padding:14px 12px;bottom:200px}'
    + '#eintro .mrow{bottom:104px}'
    + '#eintro .face{height:96px;margin:6px 0 2px}'
    + '#eintro .pname{font-size:1rem}#eintro .num{font-size:2rem;margin-top:8px}'
    + '#eintro .lead{font-size:.76rem}#eintro .unit{font-size:.68rem}#eintro .bar b{font-size:1.15rem}'
    + '#eintro .votes{display:none}#eintro .chk{font-size:1.05rem;padding:2px 7px}'
    + '#eintro .mrow{gap:6px}'
    + '#eintro .mini{min-width:0;padding:5px 9px 5px 5px;gap:7px;border-radius:11px}'
    + '#eintro .mini .mface,#eintro .mini .mdot{width:30px;height:30px;border-radius:8px}'
    + '#eintro .mini .mp{font-size:.74rem}#eintro .mini .ml{display:none}'
    + '#eintro .mini .mn{font-size:1rem;padding-left:5px}'
    + '#eintro .ctl{bottom:66px}}';

  /* ---------- ชิ้นส่วน ---------- */
  function facePath(leader, cls) {
    if (!leader) return '';
    var f = encodeURIComponent(leader.replace(/[\\/:*?"<>|]/g, '_').trim());
    // ลอง .png ก่อน (รูปที่วางเองทับได้) แล้วค่อยตกไป .jpg (รูปจากวิกิ)
    return '<img class="' + cls + '" alt="" data-alt="leaders/' + f + '.jpg" src="leaders/' + f + '.png">';
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
      + '<div class="pname">' + p.short + '</div>'
      + (lead ? '<div class="lead">' + lead + '</div>' : '')
      + '<div class="num">' + p.total + (isPM ? '<span class="chk">✓</span>' : '') + '</div>'
      + '<div class="unit">' + seatText(p) + (w ? '<br>ชนะ ' + w + ' จังหวัด' : '') + '</div>'
      + votesHtml(p)
      + (isPM && pmName ? '<div class="pmtag">ได้เป็นนายกฯ · ' + pmName + '</div>' : '')
      + '</div>';
  }
  function miniHtml(p) {
    var lead = leaderOf(p);
    return '<div class="mini">'
      + (lead ? facePath(lead, 'mface') : '<span class="mdot" style="background:' + p.color + '"></span>')
      + '<div><div class="mp" style="border-left:3px solid ' + p.color + ';padding-left:7px">' + p.short + '</div>'
      + (lead ? '<div class="ml">' + lead + '</div>' : '') + '</div>'
      + '<div class="mn">' + p.total + '</div></div>';
  }

  var el = document.createElement('div');
  el.id = 'eintro';
  var head = '<div class="veil"></div>'
    + '<div class="bar"><b>' + Y + '</b><span>' + (cur.date || '')
    + ' · ส.ส. ' + S.total + ' คน' + (S.listSeats ? ' (เขต ' + S.zone + ' + บัญชีรายชื่อ ' + S.listSeats + ')' : '')
    + '</span></div>';
  var body = noParty
    ? '<div class="solo"><div class="rank">ยุคก่อนมีพรรคการเมือง</div>'
    + '<div class="pname" style="font-size:2rem">ส.ส. ' + S.total + ' คน</div>'
    + (pmName ? '<div class="lead">นายกรัฐมนตรีหลังเลือกตั้ง · ' + pmName + '</div>' : '') + '</div>'
    : sideHtml(rows[0], 'l', 'อันดับ 1')
    + (rows[1] ? sideHtml(rows[1], 'r', 'อันดับ 2') : '')
    + (rows.length > 2 ? '<div class="mrow">' + rows.slice(2, 5).map(miniHtml).join('') + '</div>' : '');
  el.innerHTML = head + body
    + '<div class="ctl"><button type="button" data-a="sound">เปิดเสียง</button>'
    + '<button type="button" data-a="skip">ข้าม</button></div>';

  var st = document.createElement('style'); st.textContent = CSS;
  document.head.appendChild(st); document.body.appendChild(el);

  // แผงสองข้างต้องเริ่มต่อจากแถบบนพอดี — วัดความสูงจริงแทนการเดา
  var barEl = el.querySelector('.bar');
  var syncBar = function () { el.style.setProperty('--barh', barEl.offsetHeight + 'px'); };
  syncBar(); addEventListener('resize', syncBar);

  // ไม่มีทั้ง .png และ .jpg → ซ่อนรูป ไม่ให้ขึ้นไอคอนรูปเสีย
  Array.prototype.forEach.call(el.querySelectorAll('.face,.mface'), function (im) {
    im.addEventListener('error', function () {
      if (im.dataset.alt) { im.src = im.dataset.alt; im.dataset.alt = ''; }
      else im.style.display = 'none';
    });
  });

  /* ---------- เพลงพื้นหลัง: ค่าเริ่มต้นเปิดเสียง · จำสถานะข้ามปี · เล่นต่อหลังฉากเปิดปิดไป ---------- */
  // คีย์เดียวใช้ร่วมทุกปี — ผู้ใช้ปิดเสียงที่ปีไหน ไปปีอื่นก็เงียบตาม (และกลับกัน)
  var SKEY = 'el-intro-sound';
  var want = true;                                    // ยังไม่เคยเลือก = เปิด
  try { want = localStorage.getItem(SKEY) !== '0'; } catch (err) { }

  var audio = new Audio();
  if (MUSIC) { audio.src = MUSIC; audio.loop = true; audio.volume = .45; audio.muted = !want; }
  var hasAudio = !!MUSIC;
  var sndBtn = el.querySelector('[data-a="sound"]');

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

  function noAudio() {
    hasAudio = false;
    if (sndBtn) sndBtn.style.display = 'none';
    dockSnd.style.display = 'none';
  }
  audio.addEventListener('error', noAudio);
  if (!MUSIC) noAudio();                              // ปีที่ยังไม่มีเพลง → ซ่อนปุ่มเสียงไปเลย

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
  }

  // เบราว์เซอร์บล็อก autoplay จนกว่าจะมีการแตะหน้า → ดักการแตะครั้งแรกไว้เล่นให้เอง
  var armed = false;
  function armUnlock() {
    if (armed) return; armed = true;
    var h = function (e) {
      // ปล่อยให้ปุ่มเสียงจัดการเอง (ไม่งั้นทั้งเปิดทั้งสลับ = หักล้างกัน)
      if (e.target && e.target.closest && e.target.closest('[data-a="sound"]')) return;
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
    audio.muted = false;
    var p = audio.play();
    if (p && p.then) p.then(function () { paint(true); }, function () { paint(false); armUnlock(); });
    else paint(true);
  }
  // on = สิ่งที่ "ผู้ใช้เลือก" → บันทึกไว้ให้ปีอื่นใช้ด้วย
  function setSound(on) {
    want = on;
    try { localStorage.setItem(SKEY, on ? '1' : '0'); } catch (err) { }
    if (on) return tryPlay();
    audio.pause();
    paint(false);
  }

  // วาดตามที่ผู้ใช้เลือกไว้ก่อน (กันปุ่มกะพริบ) แล้วค่อยลองเล่น — ถ้าโดนบล็อก tryPlay จะวาดใหม่เป็น "เปิดเสียง"
  if (hasAudio) { paint(want); if (want) tryPlay(); }

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
