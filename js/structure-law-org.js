/* ═══════════════════════════════════════════════════════════════════════════
   structure-law-org.js — เติม "อำนาจหน้าที่ตามกฎหมาย" ลงแท็บอำนาจหน้าที่
   ---------------------------------------------------------------------------
   เดิมแท็บนี้เปิดเฉพาะโหนดกระทรวง/รัฐมนตรี และบอกแค่เลขมาตรา
   ตอนนี้ structure-deep.js มีตัวบทจริงจาก พ.ร.บ.ปรับปรุงกระทรวง ทบวง กรม
   พ.ศ. 2545 จึงแสดงได้ว่า:
     · กระทรวง   → ตัวบท "มีอำนาจหน้าที่เกี่ยวกับ …" เต็ม ๆ + รายชื่อส่วนราชการ
                   ตามกฎหมาย (อนุมาตรา (1)(2)(3)…) กดข้ามไปหน่วยงานนั้นได้
     · กรม/หน่วย → ฐานทางกฎหมายที่จัดตั้ง เช่น "มาตรา 31 (3)" พร้อมชื่อตามตัวบท
                   (เปิดแท็บนี้ให้โหนดกรมด้วย ซึ่งของเดิมซ่อนไว้)

   ห่อ ipTabPlan() กับ renderLawPane() ไว้ชั้นนอก ไม่แก้โค้ดเดิม
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (typeof ORG_LAW === 'undefined' || typeof MIN_POWER === 'undefined') {
    console.warn('[law-org] ไม่พบ structure-deep.js'); return;
  }

  function keyOf(node) {
    if (!node || !node.data || !node.data.no) return null;
    var mid = node.ministryID;
    if (!mid) {
      var m = MINISTRIES.find(function (x) { return x.orgs.some(function (o) { return o.no === node.data.no; }); });
      mid = m ? m.id : null;
    }
    return mid ? (mid + '|' + node.data.no) : null;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function actLink(txt) {
    return '<a href="' + LAW_META.url + '" target="_blank" rel="noopener">' + esc(txt || LAW_META.act) + '</a>';
  }

  /* บัตรอ้างอิงกฎหมาย (หน้าตาแบบแท็บ Powers ของ machineryofgovernment.uk) */
  function lawCard(kind, title, body, srcLabel, note) {
    return '' +
      '<div class="lw-card">' +
        '<div class="lw-top"><span class="lw-kind lw-' + kind + '">' +
          (kind === 'power' ? 'อำนาจหน้าที่' : 'ฐานการจัดตั้ง') + '</span>' +
          '<span class="lw-since">พ.ศ. ' + LAW_META.year + '</span></div>' +
        '<div class="lw-t">' + esc(title) + '</div>' +
        (body ? '<div class="lw-d">' + esc(body) + '</div>' : '') +
        (note ? '<div class="lw-note">⚠ ' + esc(note) + '</div>' : '') +
        '<div class="lw-src"><div class="lw-src-h">ที่มาของอำนาจ</div>' +
          '<span class="lw-badge">พระราชบัญญัติ</span> ' + actLink(srcLabel) + '</div>' +
      '</div>';
  }

  /* รายชื่อส่วนราชการตามตัวบท */
  function orgListHtml(mid, mp) {
    if (!mp.orgs || !mp.orgs.length) return '';
    var m = MINISTRIES.find(function (x) { return x.id === mid; });
    return '' +
      '<div class="ip-sec-h" style="margin-top:16px">ส่วนราชการตามกฎหมาย · ' + esc(mp.secOrgs) + '</div>' +
      '<div class="lw-list">' + mp.orgs.map(function (it) {
        var o = m && m.orgs.find(function (x) {
          var k = ORG_LAW[mid + '|' + x.no];
          return k && k.sec === mp.secOrgs && k.item === it.i;
        });
        var clickable = !!o;
        return '<div class="lw-li' + (clickable ? ' lw-go' : '') + '"' +
          (clickable ? ' data-mid="' + mid + '" data-no="' + o.no + '" role="button" tabindex="0"' : '') + '>' +
          '<span class="lw-i">(' + it.i + ')</span><span class="lw-n">' + esc(it.name) + '</span>' +
          (clickable ? '<span class="lw-arrow">→</span>' : '') + '</div>';
      }).join('') + '</div>';
  }

  /* ── เปิดแท็บ "อำนาจหน้าที่" ให้โหนดกรมที่มีฐานกฎหมายด้วย ── */
  var origPlan = window.ipTabPlan;
  window.ipTabPlan = function (node) {
    var plan = origPlan.apply(this, arguments);
    var key = keyOf(node);
    if (key && ORG_LAW[key]) {
      plan.show = plan.show || {};
      plan.show.law = 1;
      plan.badge = plan.badge || {};
      plan.badge.law = '1';
    }
    return plan;
  };

  /* ── เนื้อหาแท็บ ── */
  var origLaw = window.renderLawPane;
  window.renderLawPane = function (node, mid) {
    var el = document.getElementById('pane-law');
    if (!el || !node) { origLaw.apply(this, arguments); return; }

    var key = keyOf(node);
    var rec = key && ORG_LAW[key];
    var mp = mid && MIN_POWER[mid];

    // โหนดกรม/หน่วยงานที่มีฐานกฎหมาย → เขียนแผงใหม่ทั้งแท็บ
    if (rec && !node.isMinistry && node.type !== 'minister' && node.type !== 'center') {
      var minNm = (MINISTRIES.find(function (x) { return x.id === mid; }) || {}).name || '';
      el.innerHTML =
        lawCard('found',
          rec.sec + ' (' + rec.item + ')',
          'จัดตั้งเป็นส่วนราชการระดับกรมของ' + minNm + ' ตาม' + LAW_META.act +
          ' โดยปรากฏชื่อในตัวบทว่า “' + rec.nameInAct + '”',
          LAW_META.act + ' ' + rec.sec + ' (' + rec.item + ')') +
        (mp && mp.text
          ? '<div class="ip-sec-h" style="margin-top:14px">อำนาจหน้าที่ของกระทรวงต้นสังกัด</div>' +
            '<div class="lw-quote">' + esc(minNm) + ' ' + esc(mp.text) + '</div>' +
            '<div class="ip-src">' + esc(mp.sec) + ' แห่ง' + LAW_META.act +
            ' — การแบ่งงานภายในกรมเป็นไปตามกฎกระทรวงแบ่งส่วนราชการของแต่ละกรม</div>'
          : '');
      return;
    }

    // โหนดกระทรวง → ของเดิมก่อน แล้วต่อด้วยตัวบทเต็ม + รายชื่อส่วนราชการ
    origLaw.apply(this, arguments);
    if (!mp || !mp.text) return;
    var nm = (MINISTRIES.find(function (x) { return x.id === mid; }) || {}).name || '';
    el.insertAdjacentHTML('beforeend',
      '<div class="ip-sec-h" style="margin-top:16px">ตัวบทกฎหมาย · ' + esc(mp.sec) + '</div>' +
      '<div class="lw-quote">' + esc(nm) + ' ' + esc(mp.text) + '</div>' +
      (mp.note ? '<div class="lw-note">⚠ ' + esc(mp.note) + '</div>' : '') +
      orgListHtml(mid, mp) +
      '<div class="ip-src">ที่มา: ' + actLink() + ' (ตัวบทจาก th.wikisource.org)</div>');
  };

  /* กดรายชื่อส่วนราชการ → กระโดดไปโหนดนั้น */
  document.addEventListener('click', function (e) {
    var li = e.target.closest && e.target.closest('.lw-go');
    if (!li) return;
    var key = 'org|' + li.dataset.mid + '|' + li.dataset.no;
    if (window.FXCY && FXCY.isOn()) FXCY.focus(key);
    else if (typeof showPanel === 'function') showPanel(fxMakeNode(fxDescOfKey(key), 0, 0, 20));
  });

  var css = document.createElement('style');
  css.textContent =
    '.lw-card{padding:12px 13px;margin-bottom:10px;border-radius:10px;' +
      'background:var(--bg3);border:1px solid var(--border)}' +
    '.lw-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}' +
    '.lw-kind{padding:2px 8px;font-size:10px;font-weight:700;letter-spacing:.4px;border-radius:4px;' +
      'background:var(--gold-glow);color:var(--gold)}' +
    '.lw-since{margin-left:auto;font-size:10.5px;color:var(--text-dim)}' +
    '.lw-t{font-size:14px;font-weight:700;line-height:1.4;margin-bottom:5px}' +
    '.lw-d{font-size:12.5px;line-height:1.6;color:var(--text-mid)}' +
    '.lw-note{margin-top:8px;font-size:11.5px;line-height:1.55;color:var(--text-dim);' +
      'padding:7px 9px;border-radius:7px;background:var(--bg2);border:1px dashed var(--border2)}' +
    '.lw-src{margin-top:9px;padding-top:9px;border-top:1px dashed var(--border2)}' +
    '.lw-src-h{font-size:9.5px;letter-spacing:.8px;color:var(--text-dim);margin-bottom:4px}' +
    '.lw-badge{padding:1px 6px;font-size:9.5px;border-radius:3px;background:var(--border);color:var(--text-mid)}' +
    '.lw-src a{font-size:12px;color:var(--blue);text-decoration:none}' +
    '.lw-src a:hover{text-decoration:underline}' +
    '.lw-quote{font-size:12.5px;line-height:1.68;color:var(--text);padding:11px 13px;' +
      'border-radius:9px;background:var(--bg3);border-left:3px solid var(--gold-dim)}' +
    '.lw-list{margin-top:2px}' +
    '.lw-li{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;font-size:12.5px}' +
    '.lw-li+.lw-li{margin-top:2px}' +
    '.lw-go{cursor:pointer;transition:background .13s}' +
    '.lw-go:hover{background:var(--gold-glow)}' +
    '.lw-go:hover .lw-n{color:var(--gold)}' +
    '.lw-i{flex:0 0 auto;font-family:"IBM Plex Mono",monospace;font-size:11px;color:var(--text-dim)}' +
    '.lw-n{flex:1;min-width:0}' +
    '.lw-arrow{flex:0 0 auto;color:var(--text-dim);font-size:11px}';
  document.head.appendChild(css);
})();
