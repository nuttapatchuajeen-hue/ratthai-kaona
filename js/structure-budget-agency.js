/* ═══════════════════════════════════════════════════════════════════════════
   structure-budget-agency.js — เติม "งบประมาณรายหน่วยงาน" ลงแท็บงบประมาณ
   ---------------------------------------------------------------------------
   เดิมแผงงบมีแต่ตัวเลขระดับกระทรวง (BUDGET_2569) โหนดกรมจึงขึ้นข้อความว่า
   "ไม่มีตัวเลขแยกรายหน่วยงานย่อย" ซึ่งตอนนี้ไม่จริงแล้ว เพราะ structure-deep.js
   มีงบรายหน่วยงานจริงจากชุดข้อมูลเปิดของสำนักงบประมาณ (ปีงบ 2565–2566)

   โมดูลนี้ห่อ renderBudgetPane() ไว้ชั้นนอก ไม่แก้โค้ดเดิม:
     · โหนดกรม/หน่วยงาน  → แทรกการ์ดงบของหน่วยงานนั้นไว้บนสุด + ลบข้อความที่ผิด
     · โหนดกระทรวง      → ต่อท้ายด้วยรายการงบของหน่วยงานในสังกัด กดแล้วกระโดดไปได้
     · หน่วยที่ไม่รับงบแผ่นดิน (รัฐวิสาหกิจ/สภาวิชาชีพ/ธปท./ก.ล.ต./คปภ.)
       → บอกตรง ๆ ว่าเลี้ยงตัวเองจากรายได้ ไม่ใช่ "ไม่มีข้อมูล"
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (typeof BUDGET_AGENCY === 'undefined') { console.warn('[budget-agency] ไม่พบ structure-deep.js'); return; }

  var SELF_FUNDED = { 'รัฐวิสาหกิจ': 1, 'สภาวิชาชีพ': 1, 'หน่วยงานอิสระ': 1 };

  function fmt(mb) {
    if (mb == null) return '—';
    if (mb >= 1000000) return (mb / 1000000).toFixed(2) + ' ล้านล้าน';
    if (mb >= 1000) return (mb / 1000).toFixed(1) + ' พันล้าน';
    return mb.toLocaleString('th-TH', { maximumFractionDigits: 1 }) + ' ล้าน';
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
  function srcNote() {
    return '<div class="ip-src">ที่มา: ' + BUDGET_AGENCY_META.source +
      ' · หน่วย' + BUDGET_AGENCY_META.unit +
      '<br><a href="' + BUDGET_AGENCY_META.url + '" target="_blank" rel="noopener">bb.gdcatalog.go.th</a>' +
      ' — สำนักงบประมาณเปิดข้อมูลระดับหน่วยงานถึงปีงบ 2566 (ปี 2569 เผยแพร่เป็นเอกสาร PDF รายกระทรวง)</div>';
  }

  /* การ์ดงบของหน่วยงานเดียว */
  function agencyCard(rec) {
    var d = (rec.y65 != null && rec.y66 != null && rec.y65 !== 0)
      ? ((rec.y66 - rec.y65) / rec.y65 * 100) : null;
    var sign = d == null ? '' : (d >= 0 ? '+' : '');
    var col = d == null ? 'var(--text-dim)' : (d >= 0 ? 'var(--green)' : 'var(--red)');
    return '' +
      '<div class="ip-kpis">' +
        '<div class="ip-kpi"><div class="ip-kpi-lbl">งบหน่วยงานนี้ ปี 2566</div>' +
          '<div class="ip-kpi-val">' + fmt(rec.y66) + '<small> บาท</small></div></div>' +
        '<div class="ip-kpi"><div class="ip-kpi-lbl">ปี 2565</div>' +
          '<div class="ip-kpi-val" style="font-size:15px">' + fmt(rec.y65) + '<small> บาท</small></div></div>' +
        '<div class="ip-kpi"><div class="ip-kpi-lbl">เปลี่ยนแปลง</div>' +
          '<div class="ip-kpi-val" style="color:' + col + '">' +
          (d == null ? '—' : sign + d.toFixed(1) + '<small>%</small>') + '</div></div>' +
      '</div>' +
      '<div class="ip-src" style="border:none;margin:2px 0 12px">ชื่อตาม พ.ร.บ.งบประมาณ: <b>' + rec.n + '</b></div>';
  }

  /* รายการหน่วยงานในสังกัดกระทรวง เรียงตามงบ */
  function ministryList(mid) {
    var m = MINISTRIES.find(function (x) { return x.id === mid; });
    if (!m) return '';
    var list = [];
    m.orgs.forEach(function (o) {
      var r = BUDGET_AGENCY[mid + '|' + o.no];
      if (r && r.y66 != null) list.push({ no: o.no, name: o.name, v: r.y66 });
    });
    if (list.length < 2) return '';
    list.sort(function (a, b) { return b.v - a.v; });
    var max = list[0].v, sum = list.reduce(function (s, x) { return s + x.v; }, 0);
    return '' +
      '<div class="ip-sec-h" style="margin-top:16px">งบรายหน่วยงานในสังกัด · ปีงบ 2566</div>' +
      '<div class="ip-src" style="border:none;margin:0 0 8px;padding:0">' +
        list.length + ' หน่วยงานที่มีรายการในเอกสารงบประมาณ รวม ' + fmt(sum) + ' บาท</div>' +
      list.map(function (x) {
        return '<div class="ip-bar-row bga-row" data-mid="' + mid + '" data-no="' + x.no + '" ' +
          'role="button" tabindex="0" title="กดเพื่อดูหน่วยงานนี้">' +
          '<div class="ip-bar-head"><span class="ip-bar-name">' + x.name + '</span>' +
          '<span class="ip-bar-val">' + fmt(x.v) + '</span></div>' +
          '<div class="ip-bar-track"><div class="ip-bar-fill" style="width:' +
          (x.v / max * 100).toFixed(1) + '%"></div></div></div>';
      }).join('');
  }

  /* ── ห่อ renderBudgetPane เดิม ── */
  var orig = window.renderBudgetPane;
  window.renderBudgetPane = function (node, mid) {
    orig.apply(this, arguments);
    var el = document.getElementById('pane-budget');
    if (!el || !node) return;

    if (node.isMinistry && mid) {                       // ── โหนดกระทรวง ──
      var html = ministryList(mid);
      if (html) el.insertAdjacentHTML('beforeend', html + srcNote());
      return;
    }
    if (node.type === 'center' || node.type === 'minister') return;

    var key = keyOf(node), rec = key && BUDGET_AGENCY[key];

    /* ลบประโยคเดิมที่บอกว่า "เอกสารงบประมาณจัดสรรในระดับกระทรวง จึงไม่มีตัวเลข
       แยกรายหน่วยงานย่อย" — ไม่จริงแล้วทุกกรณี เพราะ พ.ร.บ.งบประมาณ จัดสรรถึง
       ระดับหน่วยรับงบประมาณ (เหตุผลที่บางหน่วยไม่มีเลข คือไม่ได้รับงบ ไม่ใช่ไม่มีข้อมูล) */
    Array.prototype.slice.call(el.querySelectorAll('.ip-src')).forEach(function (n) {
      if (/ไม่มีตัวเลขแยกรายหน่วยงาน/.test(n.textContent)) n.remove();
    });

    if (rec) {
      el.insertAdjacentHTML('afterbegin', agencyCard(rec));
      el.insertAdjacentHTML('beforeend', srcNote());
      return;
    }

    // ไม่มีรายการ — แยกให้ชัดว่า "ไม่รับงบ" กับ "ยังไม่พบข้อมูล" ไม่เหมือนกัน
    var cat = (node.data && node.data.cat) || '';
    var msg = SELF_FUNDED[cat]
      ? '<b>' + (node.label || 'หน่วยงานนี้') + '</b> เป็น' + cat +
        ' — มีรายได้ของตนเองตามกฎหมายจัดตั้ง จึงไม่มีรายการรับจัดสรรงบประมาณแผ่นดินโดยตรง'
      : 'ไม่พบรายการของหน่วยงานนี้ในชุดข้อมูลงบประมาณรายหน่วยงาน (ปีงบ 2565–2566) ' +
        'อาจเพราะได้รับจัดสรรผ่านหน่วยงานต้นสังกัด หรือชื่อในเอกสารงบประมาณต่างจากที่แสดงในผัง';
    el.insertAdjacentHTML('beforeend',
      '<div class="ip-src" style="border:none;margin-top:10px"><svg class="mdico"><use href="#i-wallet"></use></svg> ' + msg + '</div>' + srcNote());
  };

  /* กดแถวหน่วยงาน → กระโดดไปโหนดนั้น */
  document.addEventListener('click', function (e) {
    var row = e.target.closest && e.target.closest('.bga-row');
    if (!row) return;
    var key = 'org|' + row.dataset.mid + '|' + row.dataset.no;
    if (window.FXCY && FXCY.isOn()) FXCY.focus(key);
    else if (typeof showPanel === 'function') showPanel(fxMakeNode(fxDescOfKey(key), 0, 0, 20));
  });

  /* สไตล์เฉพาะแถวที่กดได้ + หัวข้อย่อย */
  var css = document.createElement('style');
  css.textContent =
    '.bga-row{cursor:pointer;padding:3px 5px;margin:0 -5px 5px;border-radius:6px;' +
    'transition:background .13s}' +
    '.bga-row:hover{background:var(--gold-glow)}' +
    '.bga-row:hover .ip-bar-name{color:var(--gold)}' +
    '.ip-sec-h{font-size:10.5px;letter-spacing:.9px;color:var(--text-dim);' +
    'text-transform:uppercase;margin:14px 0 6px}';
  document.head.appendChild(css);
})();
