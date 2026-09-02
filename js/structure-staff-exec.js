/* ═══════════════════════════════════════════════════════════════════════════
   structure-staff-exec.js — กำลังคนรายหน่วยงาน + ผู้ดำรงตำแหน่งปัจจุบัน
   ---------------------------------------------------------------------------
   ของเดิมแท็บบุคลากรมีแต่ตัวเลขระดับกระทรวง และเมื่อเป็นโหนดกรมจะแสดง
   "อัตรากำลังเฉลี่ย ประมาณ 2,500 – 15,000 คน" ซึ่งเป็นค่าประมาณ ไม่ใช่ข้อมูลจริง
   ตอนนี้ structure-deep.js มีตัวเลขจริงรายกรมจากสำนักงาน ก.พ. จึงแทนที่ด้วยของจริง

     · โหนดกรม     → จำนวนข้าราชการพลเรือนสามัญจริง แยกประเภทตำแหน่ง/เพศ/วุฒิ
     · โหนดกระทรวง → รายชื่อหน่วยงานในสังกัดเรียงตามกำลังคน กดข้ามไปได้
     · ทุกโหนดที่มีข้อมูล → การ์ด "ผู้ดำรงตำแหน่งปัจจุบัน" ในแท็บข้อมูล
       (แบบ CURRENT HOLDER ของ machineryofgovernment.uk)
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (typeof STAFF_AGENCY === 'undefined' || typeof EXEC_AGENCY === 'undefined') {
    console.warn('[staff-exec] ไม่พบ structure-deep.js'); return;
  }

  var TYPE_COLOR = {
    'บริหาร':   'var(--gold)',
    'อำนวยการ': 'var(--purple)',
    'วิชาการ':  'var(--blue)',
    'ทั่วไป':   'var(--green)'
  };

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
  function num(n) { return (n || 0).toLocaleString('th-TH'); }
  function srcNote() {
    return '<div class="ip-src">ที่มา: ' + esc(STAFF_AGENCY_META.source) + ' ปี พ.ศ. ' +
      esc(STAFF_AGENCY_META.year) + ' (ข้อมูลเปิดผ่าน data.go.th)<br>' +
      'นับเฉพาะ<b>ข้าราชการพลเรือนสามัญ</b> ไม่รวมพนักงานราชการ ลูกจ้าง ทหาร ตำรวจ ครู และพนักงานมหาวิทยาลัย ' +
      '— ทั้งประเทศ ' + num(STAFF_AGENCY_META.total) + ' คน จาก ' + STAFF_AGENCY_META.depts + ' กรม</div>';
  }

  /* แถบสัดส่วนประเภทตำแหน่ง */
  function typeBar(t, total) {
    var keys = Object.keys(t);
    if (!keys.length || !total) return '';
    var seg = keys.map(function (k) {
      return '<i style="width:' + (t[k] / total * 100).toFixed(2) + '%;background:' +
        (TYPE_COLOR[k] || 'var(--text-dim)') + '" title="' + esc(k) + ' ' + num(t[k]) + ' คน"></i>';
    }).join('');
    var leg = keys.map(function (k) {
      return '<span class="se-lg"><i style="background:' + (TYPE_COLOR[k] || 'var(--text-dim)') + '"></i>' +
        esc(k) + ' <b>' + num(t[k]) + '</b></span>';
    }).join('');
    return '<div class="se-stack">' + seg + '</div><div class="se-legend">' + leg + '</div>';
  }

  function staffCard(rec) {
    var pf = rec.total ? (rec.f / rec.total * 100) : 0;
    var edu = rec.e || {};
    var eduOrder = ['ปริญญาเอก', 'ปริญญาโท', 'ปริญญาตรี', 'ต่ำกว่าปริญญาตรี'];
    var eduRows = eduOrder.filter(function (k) { return edu[k]; }).map(function (k) {
      return '<div class="se-row"><span>' + esc(k) + '</span><b>' + num(edu[k]) +
        ' <small>(' + (edu[k] / rec.total * 100).toFixed(1) + '%)</small></b></div>';
    }).join('');
    return '' +
      '<div class="ip-kpis">' +
        '<div class="ip-kpi"><div class="ip-kpi-lbl">ข้าราชการพลเรือนสามัญ</div>' +
          '<div class="ip-kpi-val">' + num(rec.total) + '<small> คน</small></div></div>' +
        '<div class="ip-kpi"><div class="ip-kpi-lbl">สัดส่วนหญิง</div>' +
          '<div class="ip-kpi-val">' + pf.toFixed(1) + '<small>%</small></div></div>' +
      '</div>' +
      '<div class="ip-sec-h">แยกตามประเภทตำแหน่ง</div>' + typeBar(rec.t || {}, rec.total) +
      '<div class="ip-sec-h" style="margin-top:14px">แยกตามเพศ</div>' +
      '<div class="se-row"><span>ชาย</span><b>' + num(rec.m) + '</b></div>' +
      '<div class="se-row"><span>หญิง</span><b>' + num(rec.f) + '</b></div>' +
      (eduRows ? '<div class="ip-sec-h" style="margin-top:14px">แยกตามระดับการศึกษา</div>' + eduRows : '');
  }

  /* รายการหน่วยงานในสังกัด เรียงตามกำลังคน */
  function ministryList(mid) {
    var m = MINISTRIES.find(function (x) { return x.id === mid; });
    if (!m) return '';
    var list = [];
    m.orgs.forEach(function (o) {
      var r = STAFF_AGENCY[mid + '|' + o.no];
      if (r && r.total) list.push({ no: o.no, name: o.name, v: r.total });
    });
    if (list.length < 2) return '';
    list.sort(function (a, b) { return b.v - a.v; });
    var max = list[0].v, sum = list.reduce(function (s, x) { return s + x.v; }, 0);
    return '<div class="ip-sec-h" style="margin-top:16px">กำลังคนรายหน่วยงานในสังกัด · ปี ' +
      esc(STAFF_AGENCY_META.year) + '</div>' +
      '<div class="ip-src" style="border:none;margin:0 0 8px;padding:0">' + list.length +
      ' หน่วยงาน รวม ' + num(sum) + ' คน</div>' +
      list.map(function (x) {
        return '<div class="ip-bar-row se-go" data-mid="' + mid + '" data-no="' + x.no +
          '" role="button" tabindex="0"><div class="ip-bar-head">' +
          '<span class="ip-bar-name">' + esc(x.name) + '</span>' +
          '<span class="ip-bar-val">' + num(x.v) + ' คน</span></div>' +
          '<div class="ip-bar-track"><div class="ip-bar-fill" style="width:' +
          (x.v / max * 100).toFixed(1) + '%"></div></div></div>';
      }).join('');
  }

  /* ── แท็บบุคลากร ── */
  var origStaff = window.renderStaffPane;
  window.renderStaffPane = function (node, mid) {
    var el = document.getElementById('pane-staff');
    if (!el || !node) { origStaff.apply(this, arguments); return; }

    var key = keyOf(node), rec = key && STAFF_AGENCY[key];
    if (rec && !node.isMinistry && node.type !== 'center' && node.type !== 'minister') {
      el.innerHTML = staffCard(rec) + srcNote();       // มีของจริง → ไม่ใช้ค่าประมาณของเดิม
      return;
    }
    origStaff.apply(this, arguments);
    if (node.isMinistry && mid) {
      var html = ministryList(mid);
      if (html) el.insertAdjacentHTML('beforeend', html + srcNote());
    }
  };

  /* ── การ์ดผู้ดำรงตำแหน่ง ในแท็บข้อมูล ── */
  var origTabs = window.renderDetailTabs;
  window.renderDetailTabs = function (node) {
    origTabs.apply(this, arguments);
    var info = document.getElementById('pane-info');
    if (!info || !node) return;
    var old = info.querySelector('.se-holder'); if (old) old.remove();
    var key = keyOf(node), e = key && EXEC_AGENCY[key];
    if (!e) return;
    info.insertAdjacentHTML('afterbegin',
      '<div class="se-holder">' +
        '<div class="se-h-lbl">ผู้ดำรงตำแหน่งปัจจุบัน</div>' +
        '<div class="se-h-name">' + esc(e.name) + '</div>' +
        '<div class="se-h-role">' + esc(e.role) +
          (e.year ? ' · ข้อมูลปี ' + esc(e.year) : '') + '</div>' +
      '</div>');
  };

  /* กดแถวหน่วยงาน → กระโดดไปโหนดนั้น */
  document.addEventListener('click', function (ev) {
    var row = ev.target.closest && ev.target.closest('.se-go');
    if (!row) return;
    var key = 'org|' + row.dataset.mid + '|' + row.dataset.no;
    if (window.FXCY && FXCY.isOn()) FXCY.focus(key);
    else if (typeof showPanel === 'function') showPanel(fxMakeNode(fxDescOfKey(key), 0, 0, 20));
  });

  var css = document.createElement('style');
  css.textContent =
    '.se-stack{display:flex;height:12px;border-radius:6px;overflow:hidden;background:var(--border)}' +
    '.se-stack>i{display:block;height:100%}' +
    '.se-legend{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:8px}' +
    '.se-lg{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:var(--text-mid)}' +
    '.se-lg>i{width:9px;height:9px;border-radius:2px;display:inline-block}' +
    '.se-lg b{color:var(--text);font-variant-numeric:tabular-nums}' +
    '.se-row{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;' +
      'padding:6px 0;border-bottom:1px solid var(--border)}' +
    '.se-row:last-child{border-bottom:none}' +
    '.se-row b{font-variant-numeric:tabular-nums}' +
    '.se-row small{color:var(--text-dim);font-weight:400}' +
    '.se-go{cursor:pointer;padding:3px 5px;margin:0 -5px 5px;border-radius:6px;transition:background .13s}' +
    '.se-go:hover{background:var(--gold-glow)}' +
    '.se-go:hover .ip-bar-name{color:var(--gold)}' +
    '.se-holder{padding:11px 13px;margin-bottom:12px;border-radius:10px;' +
      'background:var(--gold-glow);border:1px solid var(--gold-dim)}' +
    '.se-h-lbl{font-size:9.5px;letter-spacing:1px;text-transform:uppercase;color:var(--gold);margin-bottom:4px}' +
    '.se-h-name{font-size:15px;font-weight:700;line-height:1.35}' +
    '.se-h-role{font-size:11.5px;color:var(--text-mid);margin-top:2px}';
  document.head.appendChild(css);
})();
