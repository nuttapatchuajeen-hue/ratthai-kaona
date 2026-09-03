/* ===== bkk-oldyear.js — หน้า กทม. "โหมดสรุป" สำหรับปีที่ไม่มีผลรายเขต =====
   ปีที่แหล่งอ้างอิงมีแต่ผลรวมทั้งกรุงเทพมหานคร (ยกเว้น 2569/2565/2556 ที่มีผลรายเขต)
   → bkk-years.js ตั้ง window.BKKOLD = true และไม่โหลดไฟล์ข้อมูลรายเขต
   ไฟล์นี้จึงซ่อนแผนที่/แท็บที่ต้องใช้ข้อมูลรายเขต แล้วขึ้นการ์ดสรุปผลจาก window.BKKHIST แทน
   (ไม่ประมาณค่า ไม่เดาผู้ชนะรายเขต — ตัวเลขที่โชว์เป็นของจริงทั้งหมด)

   ⚠ ต้องวางไว้ "ก่อน" สคริปต์หลักของ bangkok.html — สคริปต์หลักจะ return ทันทีเมื่อเห็น window.BKKOLD
     (สคริปต์หลักอ่าน window.BKKDATA ซึ่งปีเก่าไม่มี จะพังตั้งแต่บรรทัดแรก)                        */
(function () {
  if (!window.BKKOLD) return;

  var el = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return n == null ? '—' : Number(n).toLocaleString('en-US'); };
  var O = window.BKKYINFO || {};
  var HPC = window.BKKHPC || {};
  var YMAP = window.BKKYMAP || {};
  var col = HPC[O.party] || '#8A94A6';

  function shade(hex) {                       // เข้มลง ~18% (ก๊อปสูตรจากสคริปต์หลัก)
    var h = hex.replace('#', '');
    if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    var f = function (v) { return ('0' + Math.round(v * 0.82).toString(16)).slice(-2); };
    return '#' + f(r) + f(g) + f(b);
  }

  var CSS = ''
    + '.oybanner{display:flex;gap:12px;align-items:flex-start;background:var(--orange-soft);border:1px solid var(--orange-line);'
    + 'border-radius:14px;padding:13px 16px;margin:0 0 18px;font-size:.85rem;color:var(--ink-2);line-height:1.65}'
    + '.oybanner b{color:var(--ink)}'
    + '.oybanner .oyi{flex:none;font-size:1.05rem;line-height:1.3}'
    + '.oyjump{display:flex;flex-wrap:wrap;gap:8px;margin-top:11px}'
    + '.oyjump a{display:inline-flex;align-items:center;gap:6px;font-family:Kanit,sans-serif;font-size:.79rem;font-weight:500;'
    + 'text-decoration:none;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:6px 11px;transition:.14s}'
    + '.oyjump a:hover{background:var(--orange);border-color:var(--orange);color:#fff}'
    + '.oybars{margin-top:14px}'
    + '.oybar{display:grid;grid-template-columns:96px 1fr auto;align-items:center;gap:10px;margin-bottom:8px;font-size:.8rem}'
    + '.oybar .oyk{color:var(--muted)}'
    + '.oybar .oyt{height:11px;border-radius:6px;background:var(--wash);overflow:hidden}'
    + '.oybar .oyt i{display:block;height:100%;border-radius:6px}'
    + '.oybar .oyn{font-weight:600;font-variant-numeric:tabular-nums}';

  function render() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

    /* ซ่อนแผนที่ + แท็บที่ต้องใช้ข้อมูลรายเขต */
    var grid = el('mapGrid'); if (grid) grid.style.display = 'none';
    ['tab-sk', 'tab-council', 'tab-sum'].forEach(function (id) { var b = el(id); if (b) b.style.display = 'none'; });
    var tg = el('tab-gov'); if (tg) { tg.classList.add('active'); tg.lastChild.nodeValue = 'สรุปผลปี ' + O.y; }

    var maxV = Math.max(O.votes || 0, O.runV || 0) || 1;
    var others = (O.cand && O.cand > 2) ? (O.cand - 2) : 0;

    el('sumView').innerHTML = ''
      + '<div class="oybanner"><span class="oyi"><svg class="mdico"><use href="#i-folder-open"></use></svg></span><div>'
      + 'การเลือกตั้งผู้ว่าฯ กทม. <b>พ.ศ. ' + O.y + '</b> (ครั้งที่ ' + O.no + ' · ' + O.date + ') '
      + 'ยังไม่มีผลแยกเป็น <b>รายเขตทั้ง 50 เขต</b> ในรูปดิจิทัล — แหล่งอ้างอิงเผยแพร่เฉพาะ'
      + '<b>ผลรวมทั้งกรุงเทพมหานคร</b> หน้านี้จึงแสดงผลสรุปแทนแผนที่ (ไม่ประมาณค่าและไม่เดาผู้ชนะรายเขต)'
      + '<div class="oyjump">'
      + Object.keys(YMAP).sort(function (a, b) { return b - a; }).map(function (yy) {
          var lb = (window.BKKYMAPLABEL || {})[yy];
          return '<a href="bangkok.html?y=' + yy + '"><svg class="mdico"><use href="#i-map"></use></svg> แผนที่รายเขต ' + yy + (lb ? ' (' + lb + ')' : '') + '</a>';
        }).join('')
      + '<a href="#" onclick="setView(\'hist\');return false"><svg class="mdico"><use href="#i-clock"></use></svg> ไทม์ไลน์ผู้ว่าฯ ทุกสมัย</a>'
      + '</div></div></div>'

      + '<div class="sumgrid">'
      + '  <div class="sumcard">'
      + '    <h3><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>ผู้ว่าราชการ กทม. ' + O.y + '</h3>'
      + '    <div class="sub">ครั้งที่ ' + O.no + ' · ' + O.date + (O.cand ? ' · ผู้สมัคร ' + O.cand + ' คน' : '') + '</div>'
      + '    <div class="sumwin" data-gov-name="' + O.win + '" data-gov-year="' + O.y + '" data-gov-party="' + O.party + '" data-gov-votes="' + O.votes + '" data-gov-pct="' + (O.pct ? O.pct : '') + '" style="background:linear-gradient(135deg,' + col + ',' + shade(col) + ');cursor:pointer" title="แตะเพื่อดูการ์ดประวัติ ' + O.win + '">'
      + '      <div class="swa ava">' + (O.ini || '★') + '</div>'
      + '      <div><div class="swn">' + O.win + '</div><div class="swm">' + O.party + '</div>'
      + '      <div class="swb">' + fmt(O.votes) + ' <span>คะแนน' + (O.pct ? ' · ' + O.pct + '%' : '') + '</span></div></div>'
      + '    </div>'
      + '    <div class="oybars">'
      + '      <div class="oybar" data-gov-name="' + O.win + '" data-gov-year="' + O.y + '" data-gov-party="' + O.party + '" data-gov-votes="' + O.votes + '" data-gov-pct="' + (O.pct ? O.pct : '') + '" style="cursor:pointer" title="แตะเพื่อดูการ์ดประวัติ ' + O.win + '"><span class="oyk">ผู้ชนะ</span><span class="oyt"><i style="width:' + (O.votes / maxV * 100).toFixed(1) + '%;background:' + col + '"></i></span><span class="oyn">' + fmt(O.votes) + '</span></div>'
      + '      <div class="oybar" data-gov-name="' + O.run + '" data-gov-year="' + O.y + '" data-gov-party="' + (O.runP || '') + '" data-gov-votes="' + (O.runV || '') + '" style="cursor:pointer" title="แตะเพื่อดูการ์ดประวัติ ' + O.run + '"><span class="oyk">อันดับ 2</span><span class="oyt"><i style="width:' + (O.runV ? (O.runV / maxV * 100).toFixed(1) : 0) + '%;background:var(--line-2)"></i></span><span class="oyn">' + fmt(O.runV) + '</span></div>'
      + '    </div>'
      + '    <ul class="sumfacts">'
      + '      <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg><span>อันดับ 2 <b data-gov-name="' + O.run + '" data-gov-year="' + O.y + '" data-gov-party="' + (O.runP || '') + '" data-gov-votes="' + (O.runV || '') + '" style="cursor:pointer;text-decoration:underline" title="แตะเพื่อดูการ์ดประวัติ ' + O.run + '">' + O.run + '</b>' + (O.runP ? ' · ' + O.runP : '') + (O.runV ? ' · ' + fmt(O.runV) + ' คะแนน' : '') + '</span></li>'
      + (others ? '      <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><span>มีผู้สมัครอีก <b>' + others + ' คน</b> ในการเลือกตั้งครั้งนี้</span></li>' : '')
      + '    </ul>'
      + '    <div class="tcompare">'
      + '      <div class="tc"><div class="tk">ผู้มาใช้สิทธิ</div><div class="tv">' + (O.turn != null ? O.turn + '%' : '—') + '</div><div class="ts">ของผู้มีสิทธิเลือกตั้งทั้ง กทม.</div></div>'
      + '      <div class="tc"><div class="tk">คะแนนผู้ชนะ</div><div class="tv">' + (O.pct ? O.pct + '%' : '—') + '</div><div class="ts">' + fmt(O.votes) + ' คะแนน</div></div>'
      + '    </div>'
      + '  </div>'

      + '  <div class="sumcard">'
      + '    <h3><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>เกิดอะไรขึ้นในครั้งนี้</h3>'
      + '    <div class="sub">สรุปเหตุการณ์สำคัญของการเลือกตั้งครั้งที่ ' + O.no + '</div>'
      + '    <p class="hintro" style="margin:2px 0 0">' + O.note + '</p>'
      + '    <ul class="sumfacts" style="margin-top:14px">'
      + '      <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/></svg><span>ผลของ <b>สมาชิกสภากรุงเทพมหานคร (ส.ก.)</b> รายเขตของยุคนี้ยังไม่มีข้อมูลดิจิทัลเช่นกัน — เว็บนี้มีแผนที่ ส.ก. เฉพาะปี 2553, 2565 และ 2569</span></li>'
      + '      <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg><span>ดูภาพรวมทุกครั้งพร้อมกันได้ที่แท็บ <b>ประวัติ</b> — เทียบผู้ใช้สิทธิและคะแนนข้ามยุค</span></li>'
      + '    </ul>'
      + '  </div>'
      + '</div>';

    var foot = el('foot');
    if (foot) {
      foot.innerHTML = 'ผลการเลือกตั้งผู้ว่าราชการกรุงเทพมหานคร พ.ศ. ' + O.y + ' · ที่มา: '
        + '<a href="https://th.wikipedia.org/wiki/การเลือกตั้งผู้ว่าราชการกรุงเทพมหานคร" target="_blank" rel="noopener">วิกิพีเดีย — การเลือกตั้งผู้ว่าราชการกรุงเทพมหานคร</a>, '
        + '<a href="https://th.wikipedia.org/wiki/รายชื่อผู้ว่าราชการกรุงเทพมหานคร" target="_blank" rel="noopener">รายชื่อผู้ว่าราชการกรุงเทพมหานคร</a> · '
        + 'ปีนี้ไม่มีผลแยกรายเขต จึงไม่มีแผนที่ · จัดทำเพื่อการเรียนรู้';
    }
  }

  /* แท็บของโหมดนี้เหลือ 2 อัน: สรุปผล (gov) กับ ประวัติ (hist) */
  window.setView = function (v) {
    ['gov', 'hist'].forEach(function (k) { var b = el('tab-' + k); if (b) b.classList.toggle('active', k === v); });
    el('sumView').style.display = v === 'hist' ? 'none' : 'block';
    el('histView').style.display = v === 'hist' ? 'block' : 'none';
    if (v === 'hist' && window.BKKrenderHist) window.BKKrenderHist();
    if (v === 'hist') { var h = el('histView'); if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };

  function boot() { render(); window.setView('gov'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
