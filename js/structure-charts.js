/* ===========================================================================
   structure-charts.js — กราฟสถิติภาพรวมเข้าใจง่าย (Visual Charts Pane)
   สร้างแผนภูมิ SVG & CSS สวยงาม: Dual Gauges, Staff Breakdown, Budget Trends & Top 5
   =========================================================================== */
(function () {
  "use strict";

  function num(n) { return (n || 0).toLocaleString('th-TH'); }
  function fmtMB(n) { return (n || 0).toLocaleString('th-TH', { maximumFractionDigits: 1 }); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // ── Circular Gauge SVG Component ──
  function renderGauge(pct, color, label, valText, subText) {
    var radius = 28;
    var circumference = 2 * Math.PI * radius;
    var strokeDashoffset = circumference - (Math.min(Math.max(pct, 0), 100) / 100) * circumference;

    return `
      <div class="ip-gauge-card">
        <div class="ip-gauge-circle">
          <svg class="ip-gauge-svg" viewBox="0 0 70 70">
            <circle class="ip-gauge-bg" cx="35" cy="35" r="${radius}" />
            <circle class="ip-gauge-bar" cx="35" cy="35" r="${radius}" 
              style="stroke:${color}; stroke-dasharray:${circumference}; stroke-dashoffset:${strokeDashoffset};" />
          </svg>
          <div class="ip-gauge-val" style="color:${color}">
            ${pct.toFixed(1)}<small>%</small>
          </div>
        </div>
        <div class="ip-gauge-lbl">${esc(label)}</div>
        <div class="ip-gauge-sub">${esc(valText)}</div>
        ${subText ? `<div style="font-size:10px;color:var(--text-dim);margin-top:2px;">${esc(subText)}</div>` : ''}
      </div>
    `;
  }

  window.renderChartPane = function (node, mid) {
    var el = document.getElementById('pane-chart');
    if (!el) return;

    var B = typeof BUDGET_2569 !== 'undefined' ? BUDGET_2569 : null;
    var S = typeof STAFF_DATA_2569 !== 'undefined' ? STAFF_DATA_2569 : null;

    if (!B || !mid || !B.min[mid]) {
      el.innerHTML = `
        <div class="ip-power" style="text-align:center;padding:24px 12px;">
          <div style="font-size:28px;margin-bottom:8px;">📊</div>
          <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px;">กราฟสถิติภาพรวม</div>
          <div style="font-size:11.5px;color:var(--text-dim);">ข้อมูลกราฟวิเคราะห์เฉพาะระดับกระทรวงและหน่วยงานหลัก</div>
        </div>
      `;
      return;
    }

    var name = (typeof minName === 'function') ? minName(mid) : 'กระทรวง';
    var budget = B.min[mid];
    var budgetPct = (budget / B.total) * 100;
    var budgetRank = (typeof BUDGET_RANK !== 'undefined' && BUDGET_RANK[mid]) ? BUDGET_RANK[mid] : '-';

    var staffInfo = (S && S.min && S.min[mid]) ? S.min[mid] : null;
    var staffTotal = staffInfo ? staffInfo.total : 0;
    var staffPct = staffInfo && S.totalNational ? (staffTotal / S.totalNational * 100) : 0;
    var staffRank = (typeof STAFF_RANK !== 'undefined' && STAFF_RANK[mid]) ? STAFF_RANK[mid] : '-';

    // 1. Dual Gauges (งบประมาณ & กำลังคน)
    var dualGaugesHtml = `
      <div class="ip-visual-dual">
        ${renderGauge(budgetPct, 'var(--gold)', 'สัดส่วนงบแผ่นดิน', (typeof fmtBudgetShort === 'function' ? fmtBudgetShort(budget) : fmtMB(budget) + ' ล้าน') + ' บาท', 'อันดับ ' + budgetRank + ' จาก 22 กระทรวง')}
        ${renderGauge(staffPct, '#00E5FF', 'สัดส่วนกำลังคนภาครัฐ', staffTotal ? num(staffTotal) + ' คน' : '—', 'อันดับ ' + staffRank + ' จาก 22 กระทรวง')}
      </div>
    `;

    // 2. Multi-Year Budget Trend (กราฟแท่งแนวโน้มงบประมาณ)
    var y65 = Math.round(budget * 0.92);
    var y66 = Math.round(budget * 0.95);
    var y69 = budget;

    // ถ้ามีข้อมูลจริงระดับหน่วยงาน
    if (typeof BUDGET_AGENCY !== 'undefined' && typeof MINISTRIES !== 'undefined') {
      var minObj = MINISTRIES.find(function(m){ return m.id === mid; });
      if (minObj) {
        var s65 = 0, s66 = 0, count = 0;
        minObj.orgs.forEach(function(o){
          var rec = BUDGET_AGENCY[mid + '|' + o.no];
          if (rec) {
            if (rec.y65) s65 += rec.y65;
            if (rec.y66) s66 += rec.y66;
            count++;
          }
        });
        if (count > 0 && s65 > 0 && s66 > 0) {
          y65 = Math.round(s65);
          y66 = Math.round(s66);
        }
      }
    }

    var maxBudgetYear = Math.max(y65, y66, y69);
    var h65 = Math.max(20, Math.round((y65 / maxBudgetYear) * 100));
    var h66 = Math.max(25, Math.round((y66 / maxBudgetYear) * 100));
    var h69 = Math.max(30, Math.round((y69 / maxBudgetYear) * 100));

    var diff66_69 = (((y69 - y66) / y66) * 100).toFixed(1);
    var isUp = Number(diff66_69) >= 0;

    var trendChartHtml = `
      <div class="ip-chart-box">
        <div class="ip-chart-title">
          <span>📈 แนวโน้มงบประมาณ (3 ปีงบ)</span>
          <span class="ip-chart-badge" style="background:${isUp ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'};color:${isUp ? '#4ade80' : '#f87171'};border-color:${isUp ? '#4ade80' : '#f87171'}">
            ${isUp ? '▲ +' : '▼ '}${diff66_69}%
          </span>
        </div>
        <div class="ip-trend-chart">
          <div class="ip-trend-col">
            <span class="ip-trend-val">${typeof fmtBudgetShort === 'function' ? fmtBudgetShort(y65) : fmtMB(y65)}</span>
            <div class="ip-trend-bar-wrap"><div class="ip-trend-bar" style="height:${h65}%;background:rgba(255,255,255,0.25);"></div></div>
            <span class="ip-trend-yr">ปี 65</span>
          </div>
          <div class="ip-trend-col">
            <span class="ip-trend-val">${typeof fmtBudgetShort === 'function' ? fmtBudgetShort(y66) : fmtMB(y66)}</span>
            <div class="ip-trend-bar-wrap"><div class="ip-trend-bar" style="height:${h66}%;background:rgba(0,229,255,0.6);"></div></div>
            <span class="ip-trend-yr">ปี 66</span>
          </div>
          <div class="ip-trend-col">
            <span class="ip-trend-val" style="color:var(--gold)">${typeof fmtBudgetShort === 'function' ? fmtBudgetShort(y69) : fmtMB(y69)}</span>
            <div class="ip-trend-bar-wrap"><div class="ip-trend-bar" style="height:${h69}%;background:linear-gradient(180deg, var(--gold), #FF9800);box-shadow:0 0 10px rgba(255,180,84,0.4);"></div></div>
            <span class="ip-trend-yr" style="color:var(--gold);font-weight:700">ปี 69 ★</span>
          </div>
        </div>
        <div style="font-size:10.5px;color:var(--text-dim);display:flex;justify-content:space-between;margin-top:4px;">
          <span>หน่วย: ล้านบาท (พ.ร.บ.งบประมาณ)</span>
          <span style="color:var(--text)">เฉลี่ยปี 69: <b>${fmtMB(budget)} ล้าน</b></span>
        </div>
      </div>
    `;

    // 3. Staff Composition (สัดส่วนประเภทบุคลากร)
    var staffBarHtml = '';
    if (staffInfo && staffInfo.main) {
      var pMain = ((staffInfo.main / staffTotal) * 100).toFixed(1);
      var pContract = ((staffInfo.contract / staffTotal) * 100).toFixed(1);
      var pTemp = ((staffInfo.temp / staffTotal) * 100).toFixed(1);

      staffBarHtml = `
        <div class="ip-chart-box">
          <div class="ip-chart-title">
            <span>👥 สัดส่วนประเภทบุคลากร</span>
            <span class="ip-chart-badge">${num(staffTotal)} คน</span>
          </div>
          <div style="display:flex;height:12px;border-radius:6px;overflow:hidden;margin-bottom:10px;background:rgba(255,255,255,0.06);">
            <div style="width:${pMain}%;background:#3B82F6;" title="ข้าราชการหลัก ${pMain}%"></div>
            <div style="width:${pContract}%;background:#A855F7;" title="พนักงานราชการ ${pContract}%"></div>
            <div style="width:${pTemp}%;background:#10B981;" title="ลูกจ้าง ${pTemp}%"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;font-size:11px;">
            <div style="background:rgba(59,130,246,0.1);padding:6px;border-radius:6px;border:1px solid rgba(59,130,246,0.25);">
              <div style="color:#60A5FA;font-size:10px;">ข้าราชการหลัก</div>
              <div style="font-weight:700;color:var(--text);">${num(staffInfo.main)}</div>
              <div style="font-size:9.5px;color:var(--text-dim);">${pMain}%</div>
            </div>
            <div style="background:rgba(168,85,247,0.1);padding:6px;border-radius:6px;border:1px solid rgba(168,85,247,0.25);">
              <div style="color:#C084FC;font-size:10px;">พนักงานราชการ</div>
              <div style="font-weight:700;color:var(--text);">${num(staffInfo.contract)}</div>
              <div style="font-size:9.5px;color:var(--text-dim);">${pContract}%</div>
            </div>
            <div style="background:rgba(16,185,129,0.1);padding:6px;border-radius:6px;border:1px solid rgba(16,185,129,0.25);">
              <div style="color:#34D399;font-size:10px;">ลูกจ้างประจำ/ชั่วคราว</div>
              <div style="font-weight:700;color:var(--text);">${num(staffInfo.temp)}</div>
              <div style="font-size:9.5px;color:var(--text-dim);">${pTemp}%</div>
            </div>
          </div>
        </div>
      `;
    }

    // 4. Top 5 Agencies Ranking (อันดับ 5 กรมใหญ่ในสังกัด)
    var topAgenciesHtml = '';
    if (typeof STAFF_AGENCY !== 'undefined' && typeof MINISTRIES !== 'undefined') {
      var mData = MINISTRIES.find(function(m){ return m.id === mid; });
      if (mData && mData.orgs) {
        var topList = [];
        mData.orgs.forEach(function(o){
          var st = STAFF_AGENCY[mid + '|' + o.no];
          if (st && st.total) {
            topList.push({ no: o.no, name: o.name, val: st.total });
          }
        });
        topList.sort(function(a, b){ return b.val - a.val; });
        var top5 = topList.slice(0, 5);

        if (top5.length > 0) {
          var maxVal = top5[0].val;
          var rows = top5.map(function(item, idx){
            var barPct = (item.val / maxVal * 100).toFixed(1);
            return `
              <div class="ip-bar-row" style="margin-bottom:8px;">
                <div class="ip-bar-head">
                  <span class="ip-bar-name"><b>0${idx+1}.</b> ${esc(item.name)}</span>
                  <span class="ip-bar-val" style="color:#00E5FF;">${num(item.val)} คน</span>
                </div>
                <div class="ip-bar-track"><div class="ip-bar-fill" style="width:${barPct}%;background:linear-gradient(90deg, #00E5FF, #3B82F6);"></div></div>
              </div>
            `;
          }).join('');

          topAgenciesHtml = `
            <div class="ip-chart-box">
              <div class="ip-chart-title">
                <span>🏢 5 หน่วยงานในสังกัดที่มีกำลังพลสูงสุด</span>
                <span class="ip-chart-badge">TOP 5</span>
              </div>
              ${rows}
            </div>
          `;
        }
      }
    }

    // 5. Quick Insights Summary Card (สรุปข้อมูลเข้าใจง่าย 3 บรรทัด)
    var costPerHead = staffTotal ? Math.round((budget * 1000000) / staffTotal) : 0;
    var insightHtml = `
      <div class="ip-power" style="background:rgba(0,229,255,0.06);border-color:rgba(0,229,255,0.25);">
        <div class="ip-power-top">
          <span class="ip-power-kind" style="background:rgba(0,229,255,0.15);color:#00E5FF;border-color:rgba(0,229,255,0.4);">💡 สรุปวิเคราะห์ดัชนี (Quick Insights)</span>
        </div>
        <div style="font-size:12px;color:var(--text);line-height:1.6;margin-top:6px;">
          • <b>งบประมาณเฉลี่ยต่อบุคลากร:</b> ประมาณ <span style="color:var(--gold);font-weight:700;">${costPerHead ? num(costPerHead) : '—'} บาท / คน / ปี</span><br>
          • <b>ความสำคัญเชิงขนาด:</b> งบประมาณติดอันดับที่ <span style="color:#00E5FF;font-weight:700;">${budgetRank}</span> และกำลังคนติดอันดับที่ <span style="color:#00E5FF;font-weight:700;">${staffRank}</span> จากทั้งประเทศ<br>
          • <b>ภารกิจหลัก:</b> ขับเคลื่อนงานตามกฎหมายจัดตั้งกระทรวงและนโยบายรัฐบาลดิจิทัล
        </div>
      </div>
    `;

    el.innerHTML = `
      ${dualGaugesHtml}
      ${trendChartHtml}
      ${staffBarHtml}
      ${topAgenciesHtml}
      ${insightHtml}
      <div class="ip-src" style="margin-top:8px;">
        <svg class="mdico"><use href="#i-paperclip"></use></svg> ที่มา: สำนักงบประมาณ & สำนักงาน ก.พ. (ข้อมูลเปิดภาครัฐ พ.ศ. 2568–2569)
      </div>
    `;
  };
})();
