/* ===== bkk-years.js — ปุ่มสลับ "ปีการเลือกตั้งผู้ว่าฯ กทม." (มุมขวาบน) =====
   ทำงานแบบเดียวกับ year-switch.js ของหน้า ส.ส. แต่ใช้กับหน้า กทม.
   1) เลือกปีจาก ?y=25xx หรือค่าที่จำไว้ แล้ว document.write ไฟล์ข้อมูลของปีนั้น
   2) วาดปุ่ม/เมนูเลือกปี แล้วปรับหัวเรื่องให้ตรงปี

   มีผลรายเขตจริง 4 ครั้ง: 2569/2565 (ผู้ว่าฯ+ส.ก.) · 2556 (เฉพาะผู้ว่าฯ 50 เขต) · 2553 (เฉพาะ ส.ก. 61 ที่นั่ง)
   ปีที่ไม่มีผลรายเขต → ตั้ง window.BKKOLD = true แล้ว bkk-oldyear.js จะขึ้น "โหมดสรุป" แทนแผนที่
   (ไม่ประมาณค่า ไม่เดาผู้ชนะรายเขต)

   ⚠ ต้องเป็น <script src="bkk-years.js"></script> ธรรมดา (ห้าม defer/async) เพราะใช้ document.write
     และต้องวาง "หลัง" bkk-history.js (ใช้ window.BKKHIST เป็นรายการปี)                        */
(function () {
  var KEY = 'md-bkk-year', DEFAULT = 2569;

  /* ปีที่มีไฟล์ผลรายเขต — [ไฟล์ข้อมูล, ไฟล์รูป] */
  var FILES = {
    2569: ['bangkok-data.js', 'bkk-photos.js'],
    2565: ['bkk-2565.js', 'bkk-photos-2565.js'],
    2556: ['bkk-2556.js'],           // มีเฉพาะผลผู้ว่าฯ (รายเขตครบ 50) · ปีนี้ไม่มีเลือกตั้ง ส.ก.
    2553: ['bkk-2553.js'],           // มีเฉพาะผลเลือกตั้ง ส.ก. 61 ที่นั่ง · ปีนี้ไม่มีเลือกตั้งผู้ว่าฯ
    /* ส.ก. ชุดเก่า — รายชื่อรายเขตจากบทความ "สภากรุงเทพมหานคร ชุดที่ 5–10" (ไม่มีคะแนน)
       2528/2533 มีเลือกตั้งผู้ว่าฯ วันเดียวกันด้วย → ในไฟล์มีสรุปผลผู้ว่าฯ แบบไม่มีแผนที่ */
    2549: ['bkk-2549.js'],
    2545: ['bkk-2545.js'],
    2541: ['bkk-2541.js'],
    2537: ['bkk-2537.js'],
    2533: ['bkk-2533.js'],
    2528: ['bkk-2528.js'],
    /* ปีที่มีเฉพาะผลรวมทั้ง กทม. แต่มีรายชื่อผู้สมัครครบทุกคน (gov.noMap) */
    2552: ['bkk-2552.js'],
    2551: ['bkk-2551.js'],
    2547: ['bkk-2547.js'],
    2543: ['bkk-2543.js'],
    2539: ['bkk-2539.js'],
    2535: ['bkk-2535.js'],
    2518: ['bkk-2518.js']
  };
  var OLDSK = { 2528: 1, 2533: 1 };   // ปีที่ไฟล์เป็นชุด ส.ก. (มีสรุปผู้ว่าฯ แถมมาด้วย)
  var SKFILE = { 2565: 1, 2569: 1 };   // ปีที่มีผล ส.ก. รายเขต "พร้อมคะแนน" คู่กับผู้ว่าฯ
  /* ปีที่เลือกตั้งเฉพาะ ส.ก. (ไม่มีผู้ว่าฯ) — ไม่ได้อยู่ในไทม์ไลน์ผู้ว่าฯ จึงต้องเติมเข้าเมนูเอง */
  var SKONLY = [
    { y: 2553, date: '29 สิงหาคม 2553', skOnly: true,
      win: 'ส.ก. 61 ที่นั่ง', label: 'เลือกตั้ง ส.ก. · ประชาธิปัตย์ 45 · เพื่อไทย 15 · อิสระ 1' },
    { y: 2549, date: '23 กรกฎาคม 2549', skOnly: true,
      win: 'ส.ก. ชุดที่ 10', label: 'สภา กทม. ชุดที่ 10 · ประชาธิปัตย์ 36 · เพื่อไทย 17' },
    { y: 2545, date: '16 มิถุนายน 2545', skOnly: true,
      win: 'ส.ก. ชุดที่ 9', label: 'สภา กทม. ชุดที่ 9 · ประชาธิปัตย์ 30 · ไทยรักไทย 23' },
    { y: 2541, date: '26 เมษายน 2541', skOnly: true,
      win: 'ส.ก. ชุดที่ 8', label: 'สภา กทม. ชุดที่ 8 · ประชาธิปัตย์ 22 · กลุ่มมดงาน 21' },
    { y: 2537, date: '6 มีนาคม 2537', skOnly: true,
      win: 'ส.ก. ชุดที่ 7', label: 'สภา กทม. ชุดที่ 7 · พลังธรรม 23 · ประชากรไทย 19 (38 เขต)' }
  ];
  var HIST = window.BKKHIST || [];
  var YEARS = HIST.filter(function (o) { return !o.ev; })
                  .concat(SKONLY)
                  .sort(function (a, b) { return b.y - a.y; });      // ใหม่ → เก่า

  var ok = {}; YEARS.forEach(function (o) { ok[o.y] = 1; });
  var y = 0;
  try { var q = Number((new URLSearchParams(location.search).get('y') || '').trim()); if (ok[q]) y = q; } catch (e) { }
  if (!y) { try { var ls = Number((localStorage.getItem(KEY) || '').trim()); if (ok[ls]) y = ls; } catch (e) { } }
  if (!y) y = DEFAULT;
  var cur = YEARS.filter(function (o) { return o.y === y; })[0] || {};

  window.BKKYEAR = y;
  window.BKKYINFO = cur;
  window.BKKYEARS = YEARS;
  window.BKKYMAP = {}; Object.keys(FILES).forEach(function (k) { window.BKKYMAP[k] = 1; });
  /* ป้ายบอกว่าปีนั้นแผนที่เป็นของอะไร (ใช้ในลิงก์ข้ามปีของโหมดสรุป) */
  window.BKKYMAPLABEL = { 2569: "ผู้ว่าฯ + ส.ก.", 2565: "ผู้ว่าฯ + ส.ก.", 2556: "ผู้ว่าฯ",
    2553: "ส.ก.", 2549: "ส.ก.", 2545: "ส.ก.", 2541: "ส.ก.", 2537: "ส.ก.", 2533: "ส.ก.", 2528: "ส.ก." };
  // ปีนี้มีผล ส.ก. ด้วยไหม — เช็กตอน mount() (ตอนนี้ไฟล์ข้อมูลยังโหลดไม่เสร็จ)

  if (FILES[y]) {
    FILES[y].forEach(function (f) { document.write('<script src="' + f + '"><' + '/script>'); });
  } else {
    window.BKKOLD = true;
  }

  /* ---------- ปุ่ม + เมนู (สไตล์เดียวกับปุ่มปีของหน้า ส.ส.) ---------- */
  var CSS = ''
    + '.yearbtn{position:fixed;top:78px;right:14px;z-index:59;display:flex;align-items:center;gap:7px;'
    + 'font-family:Kanit,sans-serif;font-size:.86rem;font-weight:500;color:var(--ink,#16323f);'
    + 'background:var(--paper,#fff);border:1px solid var(--line,#dbe4ea);border-radius:14px;'
    + 'box-shadow:var(--shadow-lg,0 12px 30px -12px rgba(10,40,60,.3));padding:9px 12px;cursor:pointer;transition:.14s}'
    + '.yearbtn:hover{border-color:var(--orange,#5E7488)}'
    + '.yearbtn .yl{font-size:.72rem;color:var(--muted,#7b8b98)}'
    + '.yearbtn .yv{font-weight:600;letter-spacing:.01em}'
    + '.yearbtn .yc{width:9px;height:9px;border-right:1.8px solid currentColor;border-bottom:1.8px solid currentColor;'
    + 'transform:rotate(45deg) translate(-2px,-2px);opacity:.6;transition:transform .18s}'
    + '.yearbtn[aria-expanded="true"] .yc{transform:rotate(-135deg) translate(-3px,-3px)}'
    + '.yearmenu{position:fixed;top:124px;right:14px;z-index:61;width:268px;max-height:min(72vh,520px);overflow:auto;'
    + 'background:var(--paper,#fff);border:1px solid var(--line,#dbe4ea);border-radius:16px;'
    + 'box-shadow:var(--shadow-lg,0 18px 44px -16px rgba(10,40,60,.45));padding:7px;display:none}'
    + '.yearmenu.open{display:block}'
    + '.yearmenu .yhead{font-family:Kanit,sans-serif;font-size:.7rem;color:var(--muted,#7b8b98);padding:6px 9px 8px}'
    + '.yearmenu .yb{display:block;width:100%;text-align:left;font-family:Kanit,sans-serif;color:var(--ink,#16323f);'
    + 'background:transparent;border:0;border-radius:11px;padding:8px 10px;cursor:pointer;transition:.12s}'
    + '.yearmenu .yb:hover{background:var(--orange-soft,#eef2f5)}'
    + '.yearmenu .yb.on{background:var(--orange-deep,#41525e)}'
    + '.yearmenu .yb.on .y1,.yearmenu .yb.on .y2{color:var(--paper,#fff)}'
    + '.yearmenu .y1{display:flex;align-items:baseline;gap:7px;font-size:.95rem;font-weight:600;line-height:1.3}'
    + '.yearmenu .y1 em{font-style:normal;font-size:.68rem;font-weight:400;color:var(--muted,#7b8b98)}'
    + '.yearmenu .yb.on .y1 em{color:rgba(255,255,255,.75)}'
    + '.yearmenu .y2{font-size:.71rem;color:var(--muted,#7b8b98);line-height:1.45;margin-top:1px}'
    + '.yearmenu .ymap{display:inline-block;font-size:.63rem;font-weight:500;border-radius:6px;padding:1px 5px;'
    + 'background:var(--orange-soft,#eef2f5);color:var(--orange-deep,#41525e)}'
    + '.yearmenu .yb.on .ymap{background:rgba(255,255,255,.22);color:#fff}'
    + '.yearveil{position:fixed;inset:0;z-index:60;background:transparent;display:none}'
    + '.yearveil.open{display:block}'
    /* มือถือ: มุมขวาบนโดนแท็บ/เมนูกิน → ย้ายปุ่มลงมุมซ้ายล่างแบบลอย */
    + '@media(max-width:860px){.yearbtn{top:auto;bottom:82px;left:10px;right:auto;padding:8px 11px}'
    + '.yearmenu{top:auto;bottom:130px;left:10px;right:10px;width:auto;max-height:56vh}}';

  function mount() {
    window.BKKSKYEAR = !!(window.BKKDATA && window.BKKDATA.sk && window.BKKDATA.sk.districts);
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

    var btn = document.createElement('button');
    btn.className = 'yearbtn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-label', 'เลือกปีการเลือกตั้งผู้ว่าฯ กทม.');
    btn.innerHTML = '<span class="yl">เลือกตั้ง</span><span class="yv">' + y + '</span><span class="yc"></span>';

    var veil = document.createElement('div'); veil.className = 'yearveil';
    var menu = document.createElement('div');
    menu.className = 'yearmenu';
    menu.setAttribute('role', 'listbox');
    menu.innerHTML = '<div class="yhead">เลือกปีการเลือกตั้ง กทม. · ' + YEARS.length + ' ครั้ง</div>'
      + YEARS.map(function (o) {
        var hasMap = !!FILES[o.y];
        var badge = !hasMap ? '' : (o.skOnly ? 'ส.ก. รายเขต'
          : (SKFILE[o.y] ? 'ผู้ว่าฯ + ส.ก.' : (OLDSK[o.y] ? 'ส.ก. + ผู้ว่าฯ' : 'ผู้ว่าฯ รายเขต')));
        return '<button class="yb' + (o.y === y ? ' on' : '') + '" role="option" data-y="' + o.y + '"'
          + (o.y === y ? ' aria-selected="true"' : '') + '>'
          + '<span class="y1">' + o.y + '<em>' + o.date + '</em>'
          + (badge ? '<span class="ymap">' + badge + '</span>' : '') + '</span>'
          + '<span class="y2">'
          + (o.skOnly ? o.label
                      : 'ครั้งที่ ' + o.no + ' · ' + o.win + (o.party ? ' (' + o.party + ')' : ''))
          + (hasMap ? '' : ' · เฉพาะผลรวม') + '</span>'
          + '</button>';
      }).join('');

    function toggle(on) {
      menu.classList.toggle('open', on);
      veil.classList.toggle('open', on);
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    btn.addEventListener('click', function () { toggle(!menu.classList.contains('open')); });
    veil.addEventListener('click', function () { toggle(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
    menu.addEventListener('click', function (e) {
      var b = e.target.closest('.yb'); if (!b) return;
      var ny = b.getAttribute('data-y');
      if (Number(ny) === y) { toggle(false); return; }
      try { localStorage.setItem(KEY, ny); } catch (err) { }
      var u = new URL(location.href); u.searchParams.set('y', ny); location.href = u.toString();
    });
    document.body.appendChild(veil);
    document.body.appendChild(btn);
    document.body.appendChild(menu);

    /* ---------- หัวเรื่อง/ชื่อหน้า ให้ตรงปี ---------- */
    if (y !== DEFAULT) {
      var meta = (window.BKKDATA && window.BKKDATA.meta) || {};
      var bt = document.querySelector('.phead .bt');
      if (bt) {
        if (bt.firstChild && bt.firstChild.nodeType === 3)
          bt.firstChild.nodeValue = meta.title || ('เลือกตั้งกรุงเทพมหานคร ' + y);
        var sm = bt.querySelector('small');
        if (sm) {
          sm.textContent = meta.sub || ((window.BKKSKYEAR
            ? 'ผู้ว่าราชการ กทม. + สมาชิกสภากรุงเทพมหานคร (ส.ก.) 50 เขต · '
            : 'ผู้ว่าราชการกรุงเทพมหานคร · ') + cur.date);
        }
      }
      document.title = window.BKKOLD
        ? 'เลือกตั้ง กทม. ' + y + ' · ผู้ว่าฯ กทม. · สรุปผลคะแนน'
        : ((window.BKKDATA && window.BKKDATA.meta && window.BKKDATA.meta.title)
            ? window.BKKDATA.meta.title + ((window.BKKDATA.gov && window.BKKDATA.gov.noMap && !window.BKKDATA.sk) ? ' · ผลคะแนนรวมทั้ง กทม.'
              : ((window.BKKDATA.sk && window.BKKDATA.sk.noVotes) ? ' · แผนที่ ส.ก. รายเขต' : ' · แผนที่ผลคะแนนรายเขต'))
            : document.title.replace(/25dd/, y));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
