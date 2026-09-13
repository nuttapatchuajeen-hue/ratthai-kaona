/* ============================================================================
   tax-simulator.js — เครื่องมือจำลองภาษีเงินได้บุคคลธรรมดาแบบ "เห็นภาพ"
   ถอดแบบ 1:1 จาก HOW TO TAX? (taepras.github.io/howtotax)
   แกน 2D: แกน Y = เงินได้, แกน X = อัตราภาษี
   พื้นที่สีแดง = จำนวนภาษีที่ต้องจ่าย (กว้างตามอัตราภาษี × สูงตามเงินได้สุทธิในขั้น)
   ============================================================================ */

window.TaxSimulator = (function () {
  'use strict';

  // ข้อมูลขั้นบันไดภาษีเงินได้บุคคลธรรมดาของไทย (มาตรา 48(1))
  var BRACKETS = [
    { min: 0, max: 150000, rate: 0.00, label: "ภาษี 0% (ยกเว้น)", text: "0 – 150,000 บาท" },
    { min: 150000, max: 300000, rate: 0.05, label: "ภาษี 5%", text: "เริ่มคิดที่ 150,000 บาท" },
    { min: 300000, max: 500000, rate: 0.10, label: "ภาษี 10%", text: "เริ่มคิดที่ 300,000 บาท" },
    { min: 500000, max: 750000, rate: 0.15, label: "ภาษี 15%", text: "เริ่มคิดที่ 500,000 บาท" },
    { min: 750000, max: 1000000, rate: 0.20, label: "ภาษี 20%", text: "เริ่มคิดที่ 750,000 บาท" },
    { min: 1000000, max: 2000000, rate: 0.25, label: "ภาษี 25%", text: "เริ่มคิดที่ 1,000,000 บาท" },
    { min: 2000000, max: 5000000, rate: 0.30, label: "ภาษี 30%", text: "เริ่มคิดที่ 2,000,000 บาท" },
    { min: 5000000, max: 10000000, rate: 0.35, label: "ภาษี 35%", text: "เริ่มคิดที่ 5,000,000 บาท" }
  ];

  // State ปัจจุบัน (ค่าเริ่มต้นเหมือนรูปที่ 1: รายได้ 400k, เงินเดือน 300k, ฟรีแลนซ์ 50k, ขายของ 50k, ลดหย่อน 60k)
  var state = {
    salary: 300000,
    freelance: 50000,
    merchant: 50000,
    allowance: 60000,
    // ตัวเลือกเสริม
    socialSecurity: 9000,
    providentFund: 0,
    insurance: 0,
    homeLoanInterest: 0
  };

  function fmt(n) {
    if (n === null || n === undefined || isNaN(n)) return "0";
    return Math.round(n).toLocaleString("th-TH");
  }

  function fmtK(n) {
    if (n === 0) return "0.00";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";
    return n.toString();
  }

  // คำนวณรายได้ ค่าใช้จ่าย ค่าลดหย่อน และภาษีตามกฎหมายไทย
  function computeTax() {
    var laborTotal = state.salary + state.freelance;
    // 40(1) + 40(2) หักค่าใช้จ่าย 50% สูงสุดไม่เกิน 100,000 บาท
    var laborExpense = Math.min(laborTotal * 0.5, 100000);
    // 40(8) ค้าขาย หักเหมา 60%
    var merchantExpense = state.merchant * 0.6;

    var totalGross = state.salary + state.freelance + state.merchant;
    var totalExpense = laborExpense + merchantExpense;

    var totalAllowance = state.allowance + state.socialSecurity + state.providentFund + state.insurance + Math.min(state.homeLoanInterest, 100000);
    // ค่าลดหย่อนหักได้ไม่เกินรายได้หลังหักค่าใช้จ่าย
    var netIncome = Math.max(0, totalGross - totalExpense - totalAllowance);

    // คำนวณภาษีตามขั้นบันได 8 ขั้น
    var totalTax = 0;
    var bracketDetails = [];

    for (var i = 0; i < BRACKETS.length; i++) {
      var b = BRACKETS[i];
      var span = b.max - b.min;
      var taxableInThisBracket = 0;

      if (netIncome > b.min) {
        if (netIncome >= b.max) {
          taxableInThisBracket = span;
        } else {
          taxableInThisBracket = netIncome - b.min;
        }
      }

      var taxInThisBracket = taxableInThisBracket * b.rate;
      totalTax += taxInThisBracket;

      bracketDetails.push({
        min: b.min,
        max: b.max,
        rate: b.rate,
        label: b.label,
        text: b.text,
        taxable: taxableInThisBracket,
        tax: taxInThisBracket
      });
    }

    var effectiveRate = totalGross > 0 ? (totalTax / totalGross) * 100 : 0;

    return {
      gross: totalGross,
      laborTotal: laborTotal,
      laborExpense: laborExpense,
      merchantExpense: merchantExpense,
      totalExpense: totalExpense,
      totalAllowance: totalAllowance,
      netIncome: netIncome,
      totalTax: totalTax,
      effectiveRate: effectiveRate,
      brackets: bracketDetails
    };
  }

  // วาดกราฟ 2D Canvas / SVG สไตล์ HowToTax (รูปที่ 1)
  function renderChart(container, res) {
    var svg = container.querySelector(".howtotax-svg");
    if (!svg) return;

    var rect = svg.getBoundingClientRect();
    var width = rect.width || 600;
    var height = rect.height || 460;

    // ขอบเขต Padding
    var pad = { top: 30, right: 30, bottom: 44, left: 62 };
    var plotW = width - pad.left - pad.right;
    var plotH = height - pad.top - pad.bottom;

    if (plotW <= 0 || plotH <= 0) return;

    // โดเมนแกน Y: เงินได้ (อย่างน้อย 350k หรือ 1.25 เท่าของรายได้ทั้งหมด เพื่อให้เห็นขั้นถัดไป)
    var maxY = Math.max(350000, res.gross * 1.25);
    // ปัดเศษให้อยู่ในสเกลสวยงาม
    var tickStep = 50000;
    if (maxY > 1500000) tickStep = 250000;
    else if (maxY > 750000) tickStep = 100000;
    maxY = Math.ceil(maxY / tickStep) * tickStep;

    function yCoord(val) {
      return pad.top + plotH - (val / maxY) * plotH;
    }

    function xCoord(taxRate) {
      return pad.left + (taxRate / 1.0) * plotW;
    }

    // สร้างเนื้อหา SVG
    var s = '';

    // 1. DEFS (ลวดลายธนบัตร 1,000 บาท = 1 ใบ)
    s += '<defs>';
    // Pattern สำหรับเงินได้สุทธิ (เส้นชัดเจน)
    s += '<pattern id="htBanknoteNet" width="20" height="10" patternUnits="userSpaceOnUse">';
    s += '<rect x="0.5" y="0.5" width="19" height="9" rx="1.5" fill="none" stroke="rgba(150,150,150,0.35)" stroke-width="0.8"/>';
    s += '<circle cx="10" cy="5" r="2.2" fill="none" stroke="rgba(150,150,150,0.3)" stroke-width="0.8"/>';
    s += '<line x1="2" y1="2" x2="2" y2="8" stroke="rgba(150,150,150,0.25)" stroke-width="0.6"/>';
    s += '<line x1="18" y1="2" x2="18" y2="8" stroke="rgba(150,150,150,0.25)" stroke-width="0.6"/>';
    s += '</pattern>';

    // Pattern สำหรับลดหย่อน (จางลง)
    s += '<pattern id="htBanknoteDed" width="20" height="10" patternUnits="userSpaceOnUse">';
    s += '<rect x="0.5" y="0.5" width="19" height="9" rx="1.5" fill="none" stroke="rgba(150,150,150,0.18)" stroke-width="0.7"/>';
    s += '<circle cx="10" cy="5" r="2.2" fill="none" stroke="rgba(150,150,150,0.15)" stroke-width="0.7"/>';
    s += '</pattern>';

    // Pattern สำหรับค่าใช้จ่าย (จางมาก)
    s += '<pattern id="htBanknoteExp" width="20" height="10" patternUnits="userSpaceOnUse">';
    s += '<rect x="0.5" y="0.5" width="19" height="9" rx="1.5" fill="none" stroke="rgba(150,150,150,0.12)" stroke-width="0.6"/>';
    s += '<circle cx="10" cy="5" r="2.2" fill="none" stroke="rgba(150,150,150,0.1)" stroke-width="0.6"/>';
    s += '</pattern>';
    s += '</defs>';

    // 2. Legend มุมขวาบน (💵 = 1,000 บาท)
    var legX = pad.left + plotW - 130;
    var legY = pad.top - 12;
    s += '<g class="ht-legend" transform="translate(' + legX + ',' + legY + ')">';
    s += '<rect x="0" y="0" width="20" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.6"/>';
    s += '<circle cx="10" cy="5" r="2.2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.6"/>';
    s += '<text x="26" y="8" font-size="11" fill="currentColor" opacity="0.65" font-family="system-ui,sans-serif">= 1,000 บาท</text>';
    s += '</g>';

    // 3. เส้นกริดแนวนอน & ตัวเลขแกน Y
    s += '<g class="ht-grid-y">';
    for (var yVal = 0; yVal <= maxY; yVal += tickStep) {
      var yP = yCoord(yVal);
      // เส้นประแนวนอนบางๆ
      s += '<line x1="' + pad.left + '" y1="' + yP + '" x2="' + (pad.left + plotW) + '" y2="' + yP + '" stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="2,2"/>';
      // ขีด Tick
      s += '<line x1="' + (pad.left - 5) + '" y1="' + yP + '" x2="' + pad.left + '" y2="' + yP + '" stroke="currentColor" stroke-opacity="0.4"/>';
      // ป้ายตัวเลขแกน Y
      s += '<text x="' + (pad.left - 8) + '" y="' + (yP + 3.5) + '" text-anchor="end" font-size="10.5" fill="currentColor" opacity="0.55" font-family="Archivo,sans-serif">' + fmtK(yVal) + '</text>';
    }
    s += '</g>';

    // 4. เส้นกริดแนวตั้ง & ตัวเลขแกน X (อัตราภาษี 0% - 100%)
    s += '<g class="ht-grid-x">';
    var xTicks = [0, 0.20, 0.40, 0.60, 0.80, 1.00];
    for (var ti = 0; ti < xTicks.length; ti++) {
      var rVal = xTicks[ti];
      var xP = xCoord(rVal);
      s += '<line x1="' + xP + '" y1="' + pad.top + '" x2="' + xP + '" y2="' + (pad.top + plotH) + '" stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="2,2"/>';
      s += '<line x1="' + xP + '" y1="' + (pad.top + plotH) + '" x2="' + xP + '" y2="' + (pad.top + plotH + 5) + '" stroke="currentColor" stroke-opacity="0.4"/>';
      s += '<text x="' + xP + '" y="' + (pad.top + plotH + 18) + '" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.65" font-family="Archivo,sans-serif">' + Math.round(rVal * 100) + '%</text>';
    }
    // ป้ายชื่อแกน
    s += '<text x="' + (pad.left + plotW / 2) + '" y="' + (pad.top + plotH + 34) + '" text-anchor="middle" font-size="12" font-weight="600" fill="currentColor" opacity="0.8">อัตราภาษี →</text>';
    s += '<text x="14" y="' + (pad.top + plotH / 2) + '" text-anchor="middle" font-size="12" font-weight="600" fill="currentColor" opacity="0.8" transform="rotate(-90, 14, ' + (pad.top + plotH / 2) + ')">เงินได้ →</text>';
    s += '</g>';

    // คำนวณพิกัดความสูงของ 3 ชั้นเงิน
    var y0 = yCoord(0);
    var yNet = yCoord(res.netIncome);
    var yDed = yCoord(res.netIncome + res.totalAllowance);
    var yGross = yCoord(res.gross);

    var hNet = Math.max(0, y0 - yNet);
    var hDed = Math.max(0, yNet - yDed);
    var hExp = Math.max(0, yDed - yGross);

    // 5. ชั้นที่ 1: เงินได้สุทธิ (ล่างสุด เต็มความกว้าง 100%)
    if (res.netIncome > 0) {
      s += '<rect x="' + pad.left + '" y="' + yNet + '" width="' + plotW + '" height="' + hNet + '" fill="rgba(180,175,165,0.2)" stroke="rgba(120,120,120,0.4)" stroke-width="0.8"/>';
      s += '<rect x="' + pad.left + '" y="' + yNet + '" width="' + plotW + '" height="' + hNet + '" fill="url(#htBanknoteNet)"/>';
      s += '<text x="' + (pad.left + plotW - 10) + '" y="' + (yNet + 20) + '" text-anchor="end" font-size="13" font-weight="700" fill="currentColor" opacity="0.9">เงินได้สุทธิ</text>';
    }

    // 6. ชั้นที่ 2: ค่าลดหย่อน (ชั้นกลาง)
    if (res.totalAllowance > 0 && hDed > 2) {
      s += '<rect x="' + pad.left + '" y="' + yDed + '" width="' + plotW + '" height="' + hDed + '" fill="rgba(200,195,185,0.1)" stroke="rgba(120,120,120,0.25)" stroke-dasharray="4,4" stroke-width="0.8"/>';
      s += '<rect x="' + pad.left + '" y="' + yDed + '" width="' + plotW + '" height="' + hDed + '" fill="url(#htBanknoteDed)"/>';
      s += '<text x="' + (pad.left + plotW - 10) + '" y="' + (yDed + 18) + '" text-anchor="end" font-size="12" font-weight="600" fill="currentColor" opacity="0.4">ค่าลดหย่อน</text>';
    }

    // 7. ชั้นที่ 3: ค่าใช้จ่าย (ชั้นบนสุด)
    if (res.totalExpense > 0 && hExp > 2) {
      s += '<rect x="' + pad.left + '" y="' + yGross + '" width="' + plotW + '" height="' + hExp + '" fill="rgba(215,210,200,0.06)" stroke="rgba(120,120,120,0.2)" stroke-dasharray="4,4" stroke-width="0.8"/>';
      s += '<rect x="' + pad.left + '" y="' + yGross + '" width="' + plotW + '" height="' + hExp + '" fill="url(#htBanknoteExp)"/>';
      s += '<text x="' + (pad.left + plotW - 10) + '" y="' + (yGross + 18) + '" text-anchor="end" font-size="12" font-weight="600" fill="currentColor" opacity="0.35">ค่าใช้จ่าย</text>';
    }

    // 8. ขั้นบันไดภาษีสีแดง (Stairs) & เส้นประแนวนอนสีแดง
    s += '<g class="ht-brackets-lines">';
    for (var bi = 1; bi < BRACKETS.length; bi++) {
      var bk = BRACKETS[bi];
      if (bk.min > maxY) break;

      var bY = yCoord(bk.min);
      var prevRate = BRACKETS[bi - 1].rate;
      var curRate = bk.rate;
      var xP1 = xCoord(prevRate);
      var xP2 = xCoord(curRate);

      // เส้นตั้งเชื่อมขั้นบันไดสีแดง
      var prevMinY = yCoord(BRACKETS[bi - 1].min);
      s += '<line x1="' + xP1 + '" y1="' + prevMinY + '" x2="' + xP1 + '" y2="' + bY + '" stroke="#ff4d4f" stroke-width="1.8"/>';
      // เส้นแนวนอนของขั้นบันได
      s += '<line x1="' + xP1 + '" y1="' + bY + '" x2="' + xP2 + '" y2="' + bY + '" stroke="#ff4d4f" stroke-width="1.8"/>';

      // เส้นประสีแดงพาดไปทางขวาตลอดแนว
      s += '<line x1="' + xP2 + '" y1="' + bY + '" x2="' + (pad.left + plotW) + '" y2="' + bY + '" stroke="#ff4d4f" stroke-width="1.2" stroke-dasharray="4,3" opacity="0.6"/>';

      // ป้ายข้อความบอกขั้นภาษี เช่น "ภาษี 5% เริ่มคิดที่ 150,000 บาท"
      s += '<text x="' + (xP2 + 6) + '" y="' + (bY - 14) + '" font-size="11" font-weight="700" fill="#ff4d4f">' + bk.label + '</text>';
      s += '<text x="' + (xP2 + 6) + '" y="' + (bY - 2) + '" font-size="10" font-weight="600" fill="#ff4d4f" opacity="0.85">' + bk.text + '</text>';
    }
    s += '</g>';

    // 9. พื้นที่ภาษีสีแดงทึบ (The Red Tax Polygon — หัวใจของ HowToTax!)
    // กว้าง = อัตราภาษีในแต่ละขั้น, สูง = เงินได้สุทธิที่ตกในขั้นนั้น
    // พื้นที่ของก้อนสีแดงนี้คือจำนวนเงินภาษีที่แท้จริง!
    if (res.netIncome > 150000) {
      var polyPoints = [];
      // จุดเริ่มต้นที่มุมล่างซ้าย (0, y0)
      polyPoints.push(xCoord(0) + ',' + y0);

      for (var pi = 0; pi < BRACKETS.length; pi++) {
        var bkt = BRACKETS[pi];
        if (res.netIncome <= bkt.min) break;

        var yBottom = yCoord(bkt.min);
        var topVal = Math.min(res.netIncome, bkt.max);
        var yTop = yCoord(topVal);
        var xR = xCoord(bkt.rate);

        polyPoints.push(xR + ',' + yBottom);
        polyPoints.push(xR + ',' + yTop);
      }

      // ปิดรูปกลับมายังแกนซ้าย X=0
      polyPoints.push(xCoord(0) + ',' + yCoord(res.netIncome));
      polyPoints.push(xCoord(0) + ',' + y0);

      s += '<polygon points="' + polyPoints.join(' ') + '" fill="#ff4d4f" opacity="0.9" stroke="#d9363e" stroke-width="1.5"/>';
    }

    // 10. เส้นขอบกรอบกราฟ
    s += '<line x1="' + pad.left + '" y1="' + pad.top + '" x2="' + pad.left + '" y2="' + (pad.top + plotH) + '" stroke="currentColor" stroke-width="1.5" opacity="0.7"/>';
    s += '<line x1="' + pad.left + '" y1="' + (pad.top + plotH) + '" x2="' + (pad.left + plotW) + '" y2="' + (pad.top + plotH) + '" stroke="currentColor" stroke-width="1.5" opacity="0.7"/>';

    svg.innerHTML = s;
  }

  // อัปเดตตัวเลขในแผงควบคุมและกราฟ
  function update(container) {
    if (!container) return;
    var res = computeTax();

    // ตัวเลขในข้อความสรุป
    var elGrossTitle = container.querySelector(".ht-val-gross-title");
    var elExpTitle = container.querySelector(".ht-val-exp-title");
    var elDedTitle = container.querySelector(".ht-val-ded-title");

    if (elGrossTitle) elGrossTitle.textContent = fmt(res.gross) + " บาท";
    if (elExpTitle) elExpTitle.textContent = fmt(res.totalExpense) + " บาท";
    if (elDedTitle) elDedTitle.textContent = fmt(res.totalAllowance) + " บาท";

    // ค่าใช้จ่ายย่อย
    var elExpLabor = container.querySelector(".ht-val-exp-labor");
    var elExpMerchant = container.querySelector(".ht-val-exp-merchant");
    if (elExpLabor) elExpLabor.textContent = "หักได้ " + fmt(res.laborExpense) + " บาท";
    if (elExpMerchant) elExpMerchant.textContent = "หักได้ " + fmt(res.merchantExpense) + " บาท";

    // สรุป 3 ขั้นตอนล่าง
    var elSumGross = container.querySelector(".ht-sum-gross");
    var elSumNet = container.querySelector(".ht-sum-net");
    var elSumTax = container.querySelector(".ht-sum-tax");
    var elSumRate = container.querySelector(".ht-sum-rate");

    if (elSumGross) elSumGross.textContent = fmt(res.gross);
    if (elSumNet) elSumNet.textContent = fmt(res.netIncome);
    if (elSumTax) elSumTax.textContent = fmt(res.totalTax);
    if (elSumRate) elSumRate.textContent = "ภาษีที่ต้องเสีย คิดเป็น " + res.effectiveRate.toFixed(1) + "% ของเงินได้ทั้งหมด";

    // วาดกราฟ 2D
    renderChart(container, res);
  }

  // ผูกตัวควบคุมและ Event Listener
  function init(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    // ฟังก์ชันซิงค์ระหว่าง Slider และ Input Box
    function bindInput(sliderId, inputId, stateKey) {
      var sl = container.querySelector("#" + sliderId);
      var inp = container.querySelector("#" + inputId);
      if (!sl || !inp) return;

      sl.value = state[stateKey];
      inp.value = state[stateKey];

      sl.addEventListener("input", function () {
        var v = parseFloat(this.value) || 0;
        state[stateKey] = v;
        inp.value = v;
        update(container);
      });

      inp.addEventListener("input", function () {
        var v = parseFloat(this.value) || 0;
        state[stateKey] = v;
        sl.value = v;
        update(container);
      });
    }

    bindInput("htSlSalary", "htInSalary", "salary");
    bindInput("htSlFreelance", "htInFreelance", "freelance");
    bindInput("htSlMerchant", "htInMerchant", "merchant");
    bindInput("htSlAllowance", "htInAllowance", "allowance");

    // รองรับ Resize หน้าต่างแล้ววาดกราฟใหม่
    window.addEventListener("resize", function () {
      update(container);
    });

    // วาดครั้งแรก
    update(container);
  }

  return {
    init: init,
    computeTax: computeTax,
    state: state,
    update: update
  };
})();
