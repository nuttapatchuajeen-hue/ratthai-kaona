/* ═══════════════════════════════════════════════════════════════════════════
   structure-toolkit.js — ฟังก์ชันเสริมโครงสร้างรัฐไทย (Thailand Government Map)
   อ้างอิงแนวคิดจาก machineryofgovernment.uk ประยุกต์ใช้กับประเทศไทย
   
   1. 🎲 Lucky Agency — สุ่มสำรวจหน่วยงานรัฐ พร้อมซูมและเสียงบรรยาย
   2. 🏷️ Cross-Ministry Sector Tags — ระบบแท็กหมวดหมู่ภารกิจ
   3. 🔗 Cross-Ministry Oversight Streams — เลนส์เครือข่ายเส้นกำกับดูแลข้ามกระทรวง
   4. 📋 Oversight Connections Card — การ์ดแสดงสายกำกับในแผงข้อมูลข้างจอ
   5. 📊 Gov Landscape Overview Modal — สรุปสถิติภาพรวมระบบราชการไทย
   6. ⚖️ Ministry Compare Tool — เครื่องมือเปรียบเทียบ 2 กระทรวงแบบ Side-by-Side
   7. 📥 Open Data Export — ดาวน์โหลดชุดข้อมูลโครงสร้างรัฐไทย (JSON / CSV)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     1. SECTOR TAGS DEFINITIONS (แท็กหมวดหมู่ภารกิจข้ามกระทรวง)
     ═══════════════════════════════════════════════════════════ */
  var SECTOR_TAGS = [
    {
      id: 'digital',
      name: 'ดิจิทัล & AI',
      icon: '#i-bot',
      color: '#00e5ff',
      desc: 'เทคโนโลยีสารสนเทศ รัฐบาลดิจิทัล ไซเบอร์ และนวัตกรรม AI',
      keywords: ['ดิจิทัล', 'เทคโนโลยี', 'ไซเบอร์', 'สารสนเทศ', 'อิเล็กทรอนิกส์', 'สถิติ', 'อวกาศ', 'นวัตกรรม', 'ข้อมูล', 'etda', 'dga', 'depa', 'nectec', 'pdpc', 'โทรคมนาคม', 'nt', 'กสทช.', 'ซิป้า', 'อินเทอร์เน็ต']
    },
    {
      id: 'regulator',
      name: 'องค์กรกำกับดูแล (Regulator)',
      icon: '#i-scale',
      color: '#ff9f43',
      desc: 'หน่วยงานกำกับมาตรฐาน ออกใบอนุญาต และคุ้มครองสิทธิ',
      keywords: ['กำกับ', 'ก.ล.ต.', 'คปภ.', 'ธนาคารแห่งประเทศไทย', 'กสทช.', 'อาหารและยา', 'มาตรฐานผลิตภัณฑ์', 'การบินพลเรือน', 'การแข่งขันทางการค้า', 'ผู้ตรวจการ', 'กกพ.', 'กสศ.', 'คุ้มครองผู้บริโภค', 'สถาบันรับรองคุณภาพ']
    },
    {
      id: 'environment',
      name: 'สิ่งแวดล้อม & โลกร้อน',
      icon: '#i-leaf',
      color: '#2ecc71',
      desc: 'สภาพภูมิอากาศ สิ่งแวดล้อม ป่าไม้ และทรัพยากรธรรมชาติ',
      keywords: ['สิ่งแวดล้อม', 'มลพิษ', 'ป่าไม้', 'อุทยาน', 'การเปลี่ยนแปลงสภาพภูมิอากาศ', 'น้ำเสีย', 'ก๊าซเรือนกระจก', 'ทรัพยากรธรรมชาติ', 'ความหลากหลายทางชีวภาพ', 'พฤกษศาสตร์', 'ธรณี']
    },
    {
      id: 'water_agri',
      name: 'น้ำ & การเกษตร',
      icon: '#i-droplets',
      color: '#3498db',
      desc: 'บริหารจัดการน้ำ ชลประทาน และส่งเสริมการเกษตร',
      keywords: ['ชลประทาน', 'น้ำแห่งชาติ', 'ประปา', 'เกษตร', 'ข้าว', 'ประมง', 'ปศุสัตว์', 'พัฒนาที่ดิน', 'ฝนหลวง', 'หม่อนไหม', 'ยางแห่งประเทศไทย', 'สหกรณ์', 'น้ำบาดาล', 'ทรัพยากรน้ำ']
    },
    {
      id: 'health',
      name: 'สาธารณสุข & การแพทย์',
      icon: '#i-stethoscope',
      color: '#e74c3c',
      desc: 'การแพทย์ ควบคุมโรค ระบบหลักประกันสุขภาพ และยา',
      keywords: ['แพทย์', 'ควบคุมโรค', 'สาธารณสุข', 'สุขภาพ', 'อาหารและยา', 'เภสัชกรรม', 'หลักประกันสุขภาพ', 'การแพทย์ฉุกเฉิน', 'วัคซีน', 'โรงพยาบาล', 'สถานพยาบาล', 'อนามัย', 'สุขภาพจิต', 'นิติวิทยาศาสตร์']
    },
    {
      id: 'transport',
      name: 'คมนาคม & ขนส่ง',
      icon: '#i-car',
      color: '#f39c12',
      desc: 'โครงสร้างพื้นฐาน ถนน ระบบราง ท่าเรือ และสนามบิน',
      keywords: ['ขนส่ง', 'ทางหลวง', 'รถไฟ', 'รถไฟฟ้า', 'ท่าอากาศยาน', 'เจ้าท่า', 'ทางพิเศษ', 'การทาง', 'ขสมก.', 'บขส.', 'การบิน', 'ราง']
    },
    {
      id: 'energy',
      name: 'พลังงาน & สาธารณูปโภค',
      icon: '#i-plug',
      color: '#ffd32a',
      desc: 'ไฟฟ้า เชื้อเพลิง ปิโตรเลียม และพลังงานสะอาด',
      keywords: ['ไฟฟ้า', 'พลังงาน', 'เชื้อเพลิง', 'ปิโตรเลียม', 'กฟผ.', 'กฟน.', 'กฟภ.', 'ปตท.', 'อนุรักษ์พลังงาน', 'ปรมาณู']
    },
    {
      id: 'softpower',
      name: 'ซอฟต์พาวเวอร์ & วัฒนธรรม',
      icon: '#i-sparkles',
      color: '#ff7675',
      desc: 'การท่องเที่ยว ศิลปวัฒนธรรม เศรษฐกิจสร้างสรรค์ และกีฬา',
      keywords: ['ท่องเที่ยว', 'ศิลปากร', 'วัฒนธรรม', 'ภาพยนตร์', 'เศรษฐกิจสร้างสรรค์', 'กีฬา', 'การจัดประชุม', 'มรดก', 'ศาสนา', 'การท่องเที่ยวแห่งประเทศไทย', 'การกีฬาแห่งประเทศไทย', 'คุณธรรม']
    },
    {
      id: 'security',
      name: 'ความมั่นคง & ยุติธรรม',
      icon: '#i-shield',
      color: '#a29bfe',
      desc: 'การบังคับใช้กฎหมาย รักษาความสงบ และกระบวนการยุติธรรม',
      keywords: ['ตำรวจ', 'สอบสวนคดีพิเศษ', 'ป้องกันและปราบปราม', 'ฟอกเงิน', 'ความมั่นคง', 'ราชทัณฑ์', 'คุมประพฤติ', 'กฤษฎีกา', 'อัยการ', 'ศาล', 'ข่าวกรอง', 'ทหาร', 'กลาโหม', 'ทัพบก', 'ทัพเรือ', 'ทัพอากาศ', 'ยาเสพติด']
    },
    {
      id: 'research',
      name: 'วิจัย & อุดมศึกษา',
      icon: '#i-microscope',
      color: '#9b59b6',
      desc: 'วิทยาศาสตร์ วิจัย ดาราศาสตร์ และสถาบันอุดมศึกษา',
      keywords: ['วิจัย', 'วิทยาศาสตร์', 'ดาราศาสตร์', 'นิวเคลียร์', 'มาตรวิทยา', 'จุฬาภรณ์', 'วช.', 'สกสว.', 'วว.', 'สวทช.', 'gistda', 'สารสนเทศทรัพยากรน้ำ', 'มหาวิทยาลัย', 'สถาบัน', 'จุฬา', 'เกษตรศาสตร์', 'ธรรมศาสตร์', 'มหิดล', 'เชียงใหม่']
    }
  ];

  /* ═══════════════════════════════════════════════════════════
     2. OVERSIGHT STREAMS DEFINITIONS (สายกำกับดูแลข้ามกระทรวง)
     ═══════════════════════════════════════════════════════════ */
  var OVERSIGHT_STREAMS = [
    {
      id: 'all',
      name: 'เครือข่ายกำกับทั้งหมด (All Oversight)',
      icon: '#i-network',
      color: '#00e5ff',
      desc: 'แสดงสายกำกับดูแลข้ามกระทรวงทั้งหมดกว่า 40 สายงานพร้อมกัน',
      types: ['central', 'oversight', 'regulator', 'soe', 'judicial', 'transport', 'health', 'committee', 'fund']
    },
    {
      id: 'fiscal',
      name: 'สายงบประมาณ & จัดซื้อจัดจ้าง',
      icon: '#i-wallet',
      color: '#fbbf24',
      desc: 'สำนักงบประมาณ, กรมบัญชีกลาง, สตง., สคร. (กำกับ รสก.), สบน. (หนี้สาธารณะ)',
      types: ['central', 'soe'],
      hubs: ['01|007', '03|022', '24|290', '03|026', '03|027']
    },
    {
      id: 'integrity',
      name: 'สายตรวจสอบ & ปราบปรามทุจริต',
      icon: '#i-shield-alert',
      color: '#f87171',
      desc: 'ป.ป.ช. (ไต่สวนทุจริต/ทรัพย์สิน), ป.ป.ท. (ฝ่ายบริหาร), สตง., ผู้ตรวจการแผ่นดิน, ปปง.',
      types: ['oversight'],
      hubs: ['24|289', '23|157', '24|290', '24|288', '23|156']
    },
    {
      id: 'legal',
      name: 'สายกฎหมาย & อัตรากำลังข้าราชการ',
      icon: '#i-scale',
      color: '#a78bfa',
      desc: 'กฤษฎีกา (ตรวจร่าง กม.), ก.พ. (อัตรากำลัง/วินัย), ก.พ.ร. (พัฒนาระบบราชการ), สภาพัฒน์',
      types: ['central', 'judicial'],
      hubs: ['01|009', '01|010', '01|012', '01|011', '01|005', '24|286']
    },
    {
      id: 'regulator',
      name: 'สายองค์กรกำกับดูแลเฉพาะด้าน (Regulators)',
      icon: '#i-sliders-horizontal',
      color: '#34d399',
      desc: 'ธปท. (ธนาคารรัฐ), กสทช. (โทรคมนาคม), กพท. (การบิน), อย. (ยา/เวชภัณฑ์), กกพ. (พลังงาน), สกมช. (ไซเบอร์), PDPC',
      types: ['regulator', 'transport', 'health'],
      hubs: ['03|396', '24|401', '08|404', '21|144', '24|400', '01|241', '11|242', '08|073', '08|072', '09|083']
    }
  ];

  var activeSectorTag = null;
  var activeOversightStream = null;
  var activeMenuTab = 'sector'; // 'sector' | 'oversight'

  /* ═══════════════════════════════════════════════════════════
     3. LUCKY AGENCY (สุ่มสำรวจหน่วยงาน)
     ═══════════════════════════════════════════════════════════ */
  function luckyAgency() {
    if (typeof nodes === 'undefined' || !nodes || !nodes.length) return;
    
    var candidates = nodes.filter(function (n) {
      return n && n.type === 'org' && n.data && n.data.name;
    });
    if (!candidates.length) candidates = nodes.filter(function (n) { return n && n.type !== 'center'; });
    if (!candidates.length) return;

    var picked = candidates[Math.floor(Math.random() * candidates.length)];
    
    if (typeof curCanvasView !== 'undefined' && curCanvasView !== 'radial' && curCanvasView !== 'focus') {
      if (typeof switchCanvasView === 'function') switchCanvasView('radial');
    }

    if (typeof showPanel === 'function') showPanel(picked);
    if (typeof spineToNode === 'function') spineToNode(picked);

    showToast('<svg class="mdico"><use href="#i-shuffle"></use></svg> สุ่มพบ: <b>' + (picked.label || picked.data?.name || '') + '</b>', (picked.data?.cat || 'หน่วยงานภาครัฐ') + (picked.ministryID ? ' · สังกัด ' + (typeof minName === 'function' ? minName(picked.ministryID) : '') : ''));
  }

  /* ═══════════════════════════════════════════════════════════
     4. SECTOR TAG FILTERING & MENU TOGGLE
     ═══════════════════════════════════════════════════════════ */
  function toggleSectorMenu(e) {
    if (e) {
      if (e.target && e.target.classList.contains('sec-clear-btn')) {
        clearAllFilters();
        return;
      }
      e.stopPropagation();
    }
    var menu = document.getElementById('sector-tags-menu');
    if (!menu) return;
    var isHidden = menu.hasAttribute('hidden');
    if (isHidden) {
      menu.removeAttribute('hidden');
      renderMenuTabs();
      document.addEventListener('click', onDocClickCloseSectorMenu);
    } else {
      closeSectorMenu();
    }
  }

  function closeSectorMenu() {
    var menu = document.getElementById('sector-tags-menu');
    if (menu && !menu.hasAttribute('hidden')) {
      menu.setAttribute('hidden', '');
      document.removeEventListener('click', onDocClickCloseSectorMenu);
    }
  }

  function onDocClickCloseSectorMenu(e) {
    var menu = document.getElementById('sector-tags-menu');
    var btn = document.getElementById('btn-sector-tags');
    if (menu && !menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
      closeSectorMenu();
    }
  }

  function filterBySectorTag(tagId) {
    if (activeSectorTag === tagId) {
      clearSectorFilter();
      closeSectorMenu();
      return;
    }

    // ล้าง oversight stream ก่อน
    activeOversightStream = null;
    window.activeOversightEdges = null;

    var tag = SECTOR_TAGS.find(function (t) { return t.id === tagId; });
    if (!tag) return;

    activeSectorTag = tagId;

    if (typeof nodes === 'undefined' || !nodes) return;

    var matchedSet = new Set();
    var kwLower = tag.keywords.map(function (k) { return k.toLowerCase(); });

    nodes.forEach(function (n) {
      if (!n || n.type === 'center') return;
      var txt = ((n.label || '') + ' ' + (n.data?.name || '') + ' ' + (n.data?.abbr || '') + ' ' + (n.data?.mission || '') + ' ' + (n.data?.cat || '')).toLowerCase();
      var match = kwLower.some(function (kw) { return txt.indexOf(kw) !== -1; });
      if (match) {
        matchedSet.add(n);
        if (n.ministryID) {
          var pNode = nodes.find(function (p) { return p.isMinistry && p.data?.id === n.ministryID; });
          if (pNode) matchedSet.add(pNode);
        }
      }
    });

    if (typeof connectedSet !== 'undefined') {
      connectedSet = matchedSet;
    }

    if (typeof draw === 'function') draw();

    var countAgencies = Array.from(matchedSet).filter(function (n) { return n.type === 'org'; }).length;
    updateToolButtonUI('sector', tag.name + ' (' + countAgencies + ')', tag.color);
    closeSectorMenu();
    showToast('<svg class="mdico"><use href="#i-pin"></use></svg> แท็ก: ' + tag.name, 'พบ ' + countAgencies + ' หน่วยงานที่เกี่ยวข้อง · กดปุ่มเพื่อเปลี่ยนหรือล้าง');
  }

  function clearSectorFilter() {
    activeSectorTag = null;
    if (typeof connectedSet !== 'undefined') {
      connectedSet = null;
    }
    if (typeof draw === 'function') draw();
    updateToolButtonUI(null);
    closeSectorMenu();
    showToast('ล้างตัวกรองแท็กแล้ว', 'แสดงผลหน่วยงานทั้งหมดตามปกติ');
  }

  /* ═══════════════════════════════════════════════════════════
     5. OVERSIGHT STREAMS LOGIC (เครือข่ายกำกับดูแลข้ามกระทรวง)
     ═══════════════════════════════════════════════════════════ */
  function setOversightStream(streamId) {
    if (activeOversightStream === streamId) {
      clearOversightStream();
      closeSectorMenu();
      return;
    }

    // ล้าง sector tag ก่อน
    activeSectorTag = null;
    if (typeof connectedSet !== 'undefined') connectedSet = null;

    var stream = OVERSIGHT_STREAMS.find(function (s) { return s.id === streamId; });
    if (!stream || typeof RELATIONS === 'undefined' || typeof nodes === 'undefined') return;

    activeOversightStream = streamId;

    // คำนวณเส้นที่ตรงกับสายกำกับดูแลนี้
    var edges = [];
    var matchedNodes = new Set();

    Object.keys(RELATIONS).forEach(function (key) {
      var def = RELATIONS[key];
      if (!def) return;

      // กรองตามประเภทหรือ hubs
      var isTypeMatch = stream.types.indexOf(def.type) !== -1;
      var isHubMatch = stream.hubs ? stream.hubs.indexOf(key) !== -1 : true;
      if (!isTypeMatch || !isHubMatch) return;

      var parts = key.split('|');
      var fromNode = nodes.find(function (n) { return n.type === 'org' && n.ministryID === parts[0] && n.data?.no === parts[1]; });
      if (!fromNode) return;

      matchedNodes.add(fromNode);

      // หาโหนดปลายทาง
      var targets = [];
      if (def.to === 'MIN') {
        targets = nodes.filter(function (n) { return n.isMinistry; });
      } else if (def.to === 'SOE') {
        targets = nodes.filter(function (n) { return n.type === 'org' && String(n.data?.catID) === '02'; });
      } else if (def.to === 'PM') {
        var pm = nodes.find(function (n) { return n.type === 'center'; });
        if (pm) targets = [pm];
      } else if (Array.isArray(def.to)) {
        def.to.forEach(function (tk) {
          if (tk.startsWith('M')) {
            var mid = tk.substring(1);
            var mn = nodes.find(function (n) { return n.isMinistry && n.data?.id === mid; });
            if (mn) targets.push(mn);
          } else {
            var tp = tk.split('|');
            var tn = nodes.find(function (n) { return n.type === 'org' && n.ministryID === tp[0] && n.data?.no === tp[1]; });
            if (tn) targets.push(tn);
          }
        });
      }

      targets.forEach(function (toNode) {
        if (toNode) {
          matchedNodes.add(toNode);
          edges.push({ from: fromNode, to: toNode, type: def.type, verb: def.verb, isHl: true });
        }
      });
    });

    window.activeOversightEdges = edges;
    if (typeof connectedSet !== 'undefined') connectedSet = matchedNodes;

    if (typeof draw === 'function') draw();

    updateToolButtonUI('oversight', stream.name, stream.color);
    closeSectorMenu();
    showToast('<svg class="mdico"><use href="#i-link"></use></svg> ' + stream.name, 'แสดงเส้นกำกับดูแลข้ามกระทรวง ' + edges.length + ' เส้น · กดเพื่อเปลี่ยนสายหรือล้าง');
  }

  function clearOversightStream() {
    activeOversightStream = null;
    window.activeOversightEdges = null;
    if (typeof connectedSet !== 'undefined') connectedSet = null;
    if (typeof draw === 'function') draw();
    updateToolButtonUI(null);
    closeSectorMenu();
    showToast('ล้างเครือข่ายกำกับดูแลแล้ว', 'แสดงผลหน่วยงานทั้งหมดตามปกติ');
  }

  function clearAllFilters() {
    activeSectorTag = null;
    activeOversightStream = null;
    window.activeOversightEdges = null;
    if (typeof connectedSet !== 'undefined') connectedSet = null;
    if (typeof draw === 'function') draw();
    updateToolButtonUI(null);
    closeSectorMenu();
  }

  function updateToolButtonUI(mode, label, color) {
    var btn = document.getElementById('btn-sector-tags');
    if (!btn) return;
    if (mode && label) {
      btn.classList.add('active');
      btn.style.setProperty('--btn-hl', color || '#00e5ff');
      btn.innerHTML = '<span class="vb-ico">' + (mode === 'oversight' ? '<svg class="mdico"><use href="#i-link"></use></svg>' : '<svg class="mdico"><use href="#i-pin"></use></svg>') + '</span>' +
        '<span class="vb-tx">' + label + '</span>' +
        '<span class="sec-clear-btn" title="ล้างตัวกรอง" onclick="event.stopPropagation(); window.clearAllFilters();">✕</span>';
    } else {
      btn.classList.remove('active');
      btn.style.removeProperty('--btn-hl');
      btn.innerHTML = '<span class="vb-ico"><svg class="mdico"><use href="#i-pin"></use></svg></span><span class="vb-tx">แท็ก & สายกำกับ</span>';
    }
  }

  /* ═══════════════════════════════════════════════════════════
     6. POPOVER MENU TABS RENDERING
     ═══════════════════════════════════════════════════════════ */
  function renderMenuTabs() {
    var menu = document.getElementById('sector-tags-menu');
    if (!menu) return;

    menu.innerHTML = '' +
      '<div class="stm-tabs">' +
        '<button class="stm-tab-btn ' + (activeMenuTab === 'sector' ? 'active' : '') + '" onclick="window.switchMenuTab(\'sector\')">' +
          '<svg class="mdico"><use href="#i-pin"></use></svg> แท็กภาคส่วน' +
        '</button>' +
        '<button class="stm-tab-btn ' + (activeMenuTab === 'oversight' ? 'active' : '') + '" onclick="window.switchMenuTab(\'oversight\')">' +
          '<svg class="mdico"><use href="#i-network"></use></svg> สายกำกับดูแลข้ามกระทรวง' +
        '</button>' +
        '<button class="stm-clear-all" onclick="window.clearAllFilters()">ล้างทั้งหมด</button>' +
      '</div>' +

      '<div class="stm-tab-content">' +
        (activeMenuTab === 'sector' ? renderSectorTagList() : renderOversightStreamList()) +
      '</div>';
  }

  function renderSectorTagList() {
    return '<div class="stm-grid">' +
      SECTOR_TAGS.map(function (t) {
        var isAct = activeSectorTag === t.id;
        return '<button class="stm-item ' + (isAct ? 'active' : '') + '" data-tag="' + t.id + '" style="--tag-clr:' + t.color + '" onclick="window.filterBySectorTag(\'' + t.id + '\')">' +
          '<div class="stm-dot" style="background:' + t.color + '"></div>' +
          '<div class="stm-info">' +
            '<div class="stm-name"><svg class="mdico"><use href="' + t.icon + '"></use></svg> ' + t.name + '</div>' +
            '<div class="stm-desc">' + t.desc + '</div>' +
          '</div>' +
        '</button>';
      }).join('') +
    '</div>';
  }

  function renderOversightStreamList() {
    return '<div class="stm-grid">' +
      OVERSIGHT_STREAMS.map(function (s) {
        var isAct = activeOversightStream === s.id;
        return '<button class="stm-item ' + (isAct ? 'active' : '') + '" style="--tag-clr:' + s.color + '" onclick="window.setOversightStream(\'' + s.id + '\')">' +
          '<div class="stm-dot" style="background:' + s.color + '"></div>' +
          '<div class="stm-info">' +
            '<div class="stm-name"><svg class="mdico"><use href="' + s.icon + '"></use></svg> ' + s.name + '</div>' +
            '<div class="stm-desc">' + s.desc + '</div>' +
          '</div>' +
        '</button>';
      }).join('') +
    '</div>';
  }

  window.switchMenuTab = function (tab) {
    activeMenuTab = tab;
    renderMenuTabs();
  };

  /* ═══════════════════════════════════════════════════════════
     7. OVERSIGHT CONNECTIONS CARD IN SIDE PANEL (showPanel Hook)
     ═══════════════════════════════════════════════════════════ */
  function injectOversightCardToPanel(node) {
    var panel = document.getElementById('info-panel');
    if (!panel || !node) return;

    var existingCard = document.getElementById('ip-oversight-card');
    if (existingCard) existingCard.remove();

    if (node.type !== 'org' || !node.data || typeof RELATIONS === 'undefined') return;

    var nodeKey = (node.ministryID || '') + '|' + (node.data.no || '');
    var outDef = RELATIONS[nodeKey];

    // หา incoming relations
    var inList = [];
    Object.keys(RELATIONS).forEach(function (k) {
      var d = RELATIONS[k];
      if (!d) return;
      var match = false;
      if (d.to === 'MIN') match = true;
      else if (d.to === 'SOE' && String(node.data.catID) === '02') match = true;
      else if (Array.isArray(d.to)) {
        match = d.to.some(function (tk) {
          return tk === nodeKey || tk === ('M' + node.ministryID);
        });
      }
      if (match && k !== nodeKey) {
        var parts = k.split('|');
        var hubOrg = null;
        if (typeof MINISTRIES !== 'undefined') {
          var m = MINISTRIES.find(function (x) { return x.id === parts[0]; });
          if (m) hubOrg = (m.orgs || []).find(function (o) { return o.no === parts[1]; });
        }
        inList.push({ key: k, hubName: hubOrg ? hubOrg.name : 'องค์กรกลาง', def: d });
      }
    });

    if (!outDef && !inList.length) return;

    var card = document.createElement('div');
    card.id = 'ip-oversight-card';
    card.className = 'ip-oversight-box';

    var html = '<div class="ip-ov-hd"><svg class="mdico"><use href="#i-network"></use></svg> เส้นทางอำนาจ & การกำกับดูแล (Oversight Links)</div>';

    if (outDef) {
      html += '<div class="ip-ov-sec">' +
        '<div class="ip-ov-lbl" style="color:var(--gold)">▸ มีอำนาจกำกับดูแล / ภารกิจข้ามหน่วยงาน:</div>' +
        '<div class="ip-ov-verb"><b>' + outDef.verb + '</b></div>' +
        (outDef.law ? '<div class="ip-ov-law"><svg class="mdico"><use href="#i-scale"></use></svg> ' + outDef.law + '</div>' : '') +
      '</div>';
    }

    if (inList.length) {
      html += '<div class="ip-ov-sec">' +
        '<div class="ip-ov-lbl" style="color:#22d3ee">▸ อยู่ภายใต้การกำกับ / ตรวจสอบโดยองค์กรกลาง:</div>' +
        '<div class="ip-ov-in-list">' +
          inList.slice(0, 5).map(function (it) {
            return '<div class="ip-ov-in-row">' +
              '<span class="ip-ov-hub" onclick="window.jumpToAgencyKey(\'' + it.key + '\')">' + it.hubName + '</span>' +
              '<span class="ip-ov-hub-verb">' + it.def.verb + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
    }

    card.innerHTML = html;
    
    // ใส่ต่อท้าย info-mission หรือแผงข้อมูล
    var missionRow = document.getElementById('info-mission-row') || document.getElementById('info-panel-content');
    if (missionRow && missionRow.parentNode) {
      missionRow.parentNode.insertBefore(card, missionRow.nextSibling);
    } else {
      panel.appendChild(card);
    }
  }

  window.jumpToAgencyKey = function (key) {
    if (!key || typeof nodes === 'undefined') return;
    var parts = key.split('|');
    var target = nodes.find(function (n) { return n.type === 'org' && n.ministryID === parts[0] && n.data?.no === parts[1]; });
    if (target) {
      if (typeof showPanel === 'function') showPanel(target);
      if (typeof spineToNode === 'function') spineToNode(target);
    }
  };

  // Hook into showPanel
  var _origShowPanel = window.showPanel;
  window.showPanel = function (node) {
    if (typeof _origShowPanel === 'function') _origShowPanel(node);
    setTimeout(function () {
      injectOversightCardToPanel(node);
    }, 40);
  };

  /* ═══════════════════════════════════════════════════════════
     8. TOAST NOTIFICATION SYSTEM
     ═══════════════════════════════════════════════════════════ */
  var toastTimer = null;
  function showToast(titleHtml, subText) {
    var toast = document.getElementById('tk-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'tk-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<div class="tk-toast-t">' + titleHtml + '</div>' +
      (subText ? '<div class="tk-toast-s">' + subText + '</div>' : '');
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 4000);
  }

  /* ═══════════════════════════════════════════════════════════
     9. GOV LANDSCAPE OVERVIEW MODAL (แดชบอร์ดสรุปสถิติภาพรวม)
     ═══════════════════════════════════════════════════════════ */
  function openGovOverviewModal() {
    var ov = document.getElementById('tk-overview-modal');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'tk-overview-modal';
      ov.className = 'tk-modal-overlay';
      ov.onclick = function(e){ if(e.target===ov) closeToolkitModals(); };
      document.body.appendChild(ov);
    }

    var totalMins = typeof MINISTRIES !== 'undefined' ? MINISTRIES.length : 20;
    var totalOrgs = typeof MINISTRIES !== 'undefined' ? MINISTRIES.reduce(function (a, m) { return a + (m.orgs ? m.orgs.length : 0); }, 0) : 413;
    var totalUnis = typeof UNIS !== 'undefined' ? UNIS.length : 390;

    var catCounts = {
      'ส่วนราชการ (กรม)': 0,
      'รัฐวิสาหกิจ': 0,
      'องค์การมหาชน': 0,
      'สถาบันอุดมศึกษาในกำกับ': 0,
      'องค์กรอิสระ / ศาล / รัฐสภา': 0,
      'สภาวิชาชีพ / อื่นๆ': 0
    };

    if (typeof MINISTRIES !== 'undefined') {
      MINISTRIES.forEach(function (m) {
        (m.orgs || []).forEach(function (o) {
          var c = o.cat || '';
          if (c.indexOf('ส่วนราชการ') !== -1 || c.indexOf('กรม') !== -1 || c.indexOf('สำนักงาน') !== -1) catCounts['ส่วนราชการ (กรม)']++;
          else if (c.indexOf('รัฐวิสาหกิจ') !== -1) catCounts['รัฐวิสาหกิจ']++;
          else if (c.indexOf('องค์การมหาชน') !== -1) catCounts['องค์การมหาชน']++;
          else if (c.indexOf('อุดมศึกษา') !== -1 || c.indexOf('มหาวิทยาลัย') !== -1) catCounts['สถาบันอุดมศึกษาในกำกับ']++;
          else if (c.indexOf('อิสระ') !== -1 || c.indexOf('ศาล') !== -1 || c.indexOf('รัฐสภา') !== -1) catCounts['องค์กรอิสระ / ศาล / รัฐสภา']++;
          else catCounts['สภาวิชาชีพ / อื่นๆ']++;
        });
      });
    }

    var topMins = typeof MINISTRIES !== 'undefined' ? [...MINISTRIES].sort(function (a, b) {
      return (b.orgs ? b.orgs.length : 0) - (a.orgs ? a.orgs.length : 0);
    }).slice(0, 6) : [];

    ov.innerHTML = '' +
      '<div class="tk-modal-box" role="dialog" aria-modal="true" aria-label="สรุปสถิติโครงสร้างรัฐไทย">' +
        '<button class="tk-modal-close" onclick="closeToolkitModals()" aria-label="ปิด">&times;</button>' +
        '<div class="tk-modal-header">' +
          '<div class="tk-badge-icon"><svg class="mdico"><use href="#i-landmark"></use></svg></div>' +
          '<div>' +
            '<h2>ภาพรวมโครงสร้างรัฐไทย 2569</h2>' +
            '<p class="tk-modal-sub">Thailand Machinery of Government · แดชบอร์ดสรุปภาพรวมหน่วยงานภาครัฐทั้งระบบ</p>' +
          '</div>' +
        '</div>' +

        '<div class="tk-kpi-grid">' +
          '<div class="tk-kpi-card">' +
            '<div class="tk-kpi-num" style="color:var(--gold)">' + totalMins + '</div>' +
            '<div class="tk-kpi-lbl">กระทรวงหลัก</div>' +
            '<div class="tk-kpi-sub">สำนักนายกฯ + 19 กระทรวง</div>' +
          '</div>' +
          '<div class="tk-kpi-card">' +
            '<div class="tk-kpi-num" style="color:var(--green)">' + totalOrgs + '</div>' +
            '<div class="tk-kpi-lbl">หน่วยงานภาครัฐในสังกัด</div>' +
            '<div class="tk-kpi-sub">กรม / รสก. / องค์การมหาชน</div>' +
          '</div>' +
          '<div class="tk-kpi-card">' +
            '<div class="tk-kpi-num" style="color:var(--cyan)">' + totalUnis + '</div>' +
            '<div class="tk-kpi-lbl">สถาบันอุดมศึกษา</div>' +
            '<div class="tk-kpi-sub">มหาวิทยาลัยรัฐ/เอกชนทั่วประเทศ</div>' +
          '</div>' +
          '<div class="tk-kpi-card">' +
            '<div class="tk-kpi-num" style="color:#a855f7">3.48<small style="font-size:13px"> ล้านล้าน</small></div>' +
            '<div class="tk-kpi-lbl">งบประมาณแผ่นดินรวม</div>' +
            '<div class="tk-kpi-sub">พ.ร.บ.งบประมาณรายจ่ายประจำปี</div>' +
          '</div>' +
        '</div>' +

        '<div class="tk-section-title">จำแนกตามประเภทหน่วยงาน (Organization Breakdown)</div>' +
        '<div class="tk-cat-breakdown">' +
          Object.keys(catCounts).map(function (k) {
            var cnt = catCounts[k];
            var pct = ((cnt / (totalOrgs || 1)) * 100).toFixed(1);
            return '<div class="tk-cat-row">' +
              '<div class="tk-cat-row-lbl">' + k + '</div>' +
              '<div class="tk-cat-bar-wrap"><div class="tk-cat-bar" style="width:' + pct + '%"></div></div>' +
              '<div class="tk-cat-row-val"><b>' + cnt + '</b> แห่ง (' + pct + '%)</div>' +
            '</div>';
          }).join('') +
        '</div>' +

        '<div class="tk-section-title">กระทรวงที่มีหน่วยงานในสังกัดมากที่สุด (Top Ministries by Agencies)</div>' +
        '<div class="tk-top-mins-grid">' +
          topMins.map(function (m, idx) {
            return '<div class="tk-min-pill-card" onclick="closeToolkitModals(); if(typeof goToMinistry===\'function\') goToMinistry(\'' + m.id + '\');">' +
              '<div class="tk-min-rank">#' + (idx + 1) + '</div>' +
              '<div class="tk-min-info">' +
                '<div class="tk-min-name">' + m.name + '</div>' +
                '<div class="tk-min-count">' + (m.orgs ? m.orgs.length : 0) + ' หน่วยงานในสังกัด</div>' +
              '</div>' +
              '<div class="tk-min-arrow">→</div>' +
            '</div>';
          }).join('') +
        '</div>' +

        '<div class="tk-modal-footer">' +
          '<div class="tk-export-group">' +
            '<span class="tk-export-label">ส่งออกข้อมูลเปิด (Open Data):</span>' +
            '<button class="tk-btn tk-btn-ghost" onclick="exportGovDataJSON()"><svg class="mdico"><use href="#i-download"></use></svg> JSON</button>' +
            '<button class="tk-btn tk-btn-ghost" onclick="exportGovDataCSV()"><svg class="mdico"><use href="#i-download"></use></svg> CSV</button>' +
          '</div>' +
          '<button class="tk-btn tk-btn-primary" onclick="closeToolkitModals()">ปิดหน้าต่าง</button>' +
        '</div>' +
      '</div>';

    ov.classList.add('show');
  }

  /* ═══════════════════════════════════════════════════════════
     10. MINISTRY COMPARE TOOL (เครื่องมือเปรียบเทียบ 2 กระทรวง)
     ═══════════════════════════════════════════════════════════ */
  var compareMinA = '03'; // กระทรวงการคลัง (Default)
  var compareMinB = '14'; // กระทรวงมหาดไทย (Default)

  function openMinistryCompareModal() {
    var ov = document.getElementById('tk-compare-modal');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'tk-compare-modal';
      ov.className = 'tk-modal-overlay';
      ov.onclick = function(e){ if(e.target===ov) closeToolkitModals(); };
      document.body.appendChild(ov);
    }
    renderCompareContent();
    ov.classList.add('show');
  }

  function renderCompareContent() {
    var ov = document.getElementById('tk-compare-modal');
    if (!ov || typeof MINISTRIES === 'undefined') return;

    var mA = MINISTRIES.find(function (m) { return m.id === compareMinA; }) || MINISTRIES[0];
    var mB = MINISTRIES.find(function (m) { return m.id === compareMinB; }) || MINISTRIES[1];

    var minListA = (typeof CABINET_MINISTERS !== 'undefined' ? CABINET_MINISTERS : []).filter(function (c) { return c.ministryID === mA.id; });
    var minListB = (typeof CABINET_MINISTERS !== 'undefined' ? CABINET_MINISTERS : []).filter(function (c) { return c.ministryID === mB.id; });

    var bA = (typeof BUDGET_2569 !== 'undefined' && BUDGET_2569.min) ? (BUDGET_2569.min[mA.id] || 0) : 0;
    var bB = (typeof BUDGET_2569 !== 'undefined' && BUDGET_2569.min) ? (BUDGET_2569.min[mB.id] || 0) : 0;

    var cA = (typeof CORRUPT_DATA !== 'undefined') ? CORRUPT_DATA.find(function (d) { return d.name.indexOf(mA.name) !== -1 || (typeof CORRUPT_MIN_MAP !== 'undefined' && CORRUPT_MIN_MAP[d.rank]?.minId === mA.id); }) : null;
    var cB = (typeof CORRUPT_DATA !== 'undefined') ? CORRUPT_DATA.find(function (d) { return d.name.indexOf(mB.name) !== -1 || (typeof CORRUPT_MIN_MAP !== 'undefined' && CORRUPT_MIN_MAP[d.rank]?.minId === mB.id); }) : null;

    ov.innerHTML = '' +
      '<div class="tk-modal-box tk-compare-box" role="dialog" aria-modal="true" aria-label="เปรียบเทียบกระทรวง">' +
        '<button class="tk-modal-close" onclick="closeToolkitModals()" aria-label="ปิด">&times;</button>' +
        '<div class="tk-modal-header">' +
          '<div class="tk-badge-icon" style="background:rgba(255,159,67,.2);color:#ff9f43"><svg class="mdico"><use href="#i-arrow-right-left"></use></svg></div>' +
          '<div>' +
            '<h2>เปรียบเทียบโครงสร้างกระทรวง</h2>' +
            '<p class="tk-modal-sub">Side-by-Side Ministry Comparison · เปรียบเทียบหน่วยงาน งบประมาณ คณะรัฐมนตรี และความโปร่งใส</p>' +
          '</div>' +
        '</div>' +

        '<div class="tk-compare-selectors">' +
          '<div class="tk-sel-side">' +
            '<label>กระทรวงฝั่งซ้าย (A):</label>' +
            '<select onchange="window.setCompareMin(\'A\', this.value)">' +
              MINISTRIES.map(function (m) {
                return '<option value="' + m.id + '"' + (m.id === mA.id ? ' selected' : '') + '>' + m.name + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="tk-sel-vs">VS</div>' +
          '<div class="tk-sel-side">' +
            '<label>กระทรวงฝั่งขวา (B):</label>' +
            '<select onchange="window.setCompareMin(\'B\', this.value)">' +
              MINISTRIES.map(function (m) {
                return '<option value="' + m.id + '"' + (m.id === mB.id ? ' selected' : '') + '>' + m.name + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
        '</div>' +

        '<div class="tk-compare-grid">' +
          renderMinistryCompareCard(mA, minListA, bA, cA) +
          renderMinistryCompareCard(mB, minListB, bB, cB) +
        '</div>' +

        '<div class="tk-modal-footer">' +
          '<button class="tk-btn tk-btn-primary" onclick="closeToolkitModals()">เสร็จสิ้น</button>' +
        '</div>' +
      '</div>';
  }

  function renderMinistryCompareCard(min, minList, budget, corrupt) {
    var totalOrgs = min.orgs ? min.orgs.length : 0;
    var depts = (min.orgs || []).filter(function (o) { return (o.cat || '').indexOf('ส่วนราชการ') !== -1 || (o.cat || '').indexOf('กรม') !== -1; }).length;
    var stateEnt = (min.orgs || []).filter(function (o) { return (o.cat || '').indexOf('รัฐวิสาหกิจ') !== -1; }).length;
    var pubOrg = (min.orgs || []).filter(function (o) { return (o.cat || '').indexOf('องค์การมหาชน') !== -1; }).length;
    var others = totalOrgs - depts - stateEnt - pubOrg;

    var leaderNames = minList.map(function (c) {
      return '<div><b>' + c.role + '</b>: ' + c.name + (c.party ? ' (' + c.party + ')' : '') + '</div>';
    }).join('') || '<div class="tk-dim">ไม่มีข้อมูลรัฐมนตรีโดยตรง</div>';

    var bTxt = budget ? (budget >= 1000 ? (budget / 1000).toFixed(1) + ' พันล้านบาท' : budget.toLocaleString('th-TH') + ' ล้านบาท') : '—';
    var itaBadge = corrupt && corrupt.ita ? '<span class="ita-badge ita-' + (corrupt.itaGrade || 'a').toLowerCase() + '">ITA ' + corrupt.ita + ' (เกรด ' + corrupt.itaGrade + ')</span>' : '<span class="tk-dim">ไม่มีรายงาน</span>';
    var countTxt = corrupt && corrupt.count ? corrupt.count.toLocaleString('th-TH') + ' เรื่อง' : '<span class="tk-dim">ไม่ติด 10 อันดับแรก</span>';

    return '' +
      '<div class="tk-compare-col">' +
        '<div class="tk-cmp-hd">' +
          '<div class="tk-cmp-name">' + min.name + '</div>' +
          '<div class="tk-cmp-abbr">' + (min.abbr || '') + '</div>' +
        '</div>' +

        '<div class="tk-cmp-item">' +
          '<div class="tk-cmp-lbl">คณะรัฐมนตรีผู้กำกับดูแล</div>' +
          '<div class="tk-cmp-val">' + leaderNames + '</div>' +
        '</div>' +

        '<div class="tk-cmp-item">' +
          '<div class="tk-cmp-lbl">จำนวนหน่วยงานในสังกัด</div>' +
          '<div class="tk-cmp-val"><b class="tk-highlight">' + totalOrgs + '</b> หน่วยงาน' +
            '<div class="tk-cmp-sublist">' +
              '• กรม/ส่วนราชการ: ' + depts + '<br>' +
              '• รัฐวิสาหกิจ: ' + stateEnt + '<br>' +
              '• องค์การมหาชน: ' + pubOrg + (others > 0 ? '<br>• อื่นๆ: ' + others : '') +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="tk-cmp-item">' +
          '<div class="tk-cmp-lbl">งบประมาณประจำปี (โดยประมาณ)</div>' +
          '<div class="tk-cmp-val"><b style="color:var(--gold)">' + bTxt + '</b></div>' +
        '</div>' +

        '<div class="tk-cmp-item">' +
          '<div class="tk-cmp-lbl">คะแนนประเมินความโปร่งใส (ITA)</div>' +
          '<div class="tk-cmp-val">' + itaBadge + '</div>' +
        '</div>' +

        '<div class="tk-cmp-item">' +
          '<div class="tk-cmp-lbl">เรื่องร้องเรียนต่อ ป.ป.ช.</div>' +
          '<div class="tk-cmp-val">' + countTxt + '</div>' +
        '</div>' +

        '<div class="tk-cmp-item" style="border-bottom:none">' +
          '<div class="tk-cmp-lbl">ภารกิจหลักตามกฎหมาย</div>' +
          '<div class="tk-cmp-val tk-mission-txt">' + (typeof MINISTRY_MISSIONS !== 'undefined' ? (MINISTRY_MISSIONS[min.id] || '—') : '—') + '</div>' +
        '</div>' +
      '</div>';
  }

  window.setCompareMin = function (side, minId) {
    if (side === 'A') compareMinA = minId;
    else compareMinB = minId;
    renderCompareContent();
  };

  function closeToolkitModals() {
    document.querySelectorAll('.tk-modal-overlay').forEach(function (el) {
      el.classList.remove('show');
    });
  }

  /* ═══════════════════════════════════════════════════════════
     11. OPEN DATA EXPORT (ส่งออกข้อมูลเปิด JSON & CSV)
     ═══════════════════════════════════════════════════════════ */
  function exportGovDataJSON() {
    if (typeof MINISTRIES === 'undefined') return;
    var data = {
      meta: {
        title: 'โครงสร้างรัฐไทย 2569 (Thailand Government Structure)',
        source: 'ชุดข้อมูลเปิดภาครัฐ และ พ.ร.บ.ปรับปรุงกระทรวง ทบวง กรม พ.ศ. 2545',
        exportedAt: new Date().toISOString(),
        totalMinistries: MINISTRIES.length,
        totalAgencies: MINISTRIES.reduce(function (a, m) { return a + (m.orgs ? m.orgs.length : 0); }, 0)
      },
      ministries: MINISTRIES.map(function (m) {
        return {
          id: m.id,
          name: m.name,
          abbr: m.abbr,
          category: m.cat,
          mission: typeof MINISTRY_MISSIONS !== 'undefined' ? (MINISTRY_MISSIONS[m.id] || '') : '',
          agencies: (m.orgs || []).map(function (o) {
            var bKey = m.id + '|' + o.no;
            var bRec = typeof BUDGET_AGENCY !== 'undefined' ? BUDGET_AGENCY[bKey] : null;
            return {
              no: o.no,
              name: o.name,
              abbr: o.abbr || '',
              category: o.cat || '',
              website: o.web || '',
              executive: o.exec || '',
              budget_2565_mb: bRec ? bRec.y65 : null,
              budget_2566_mb: bRec ? bRec.y66 : null
            };
          })
        };
      })
    };

    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, 'thai-government-structure-2569.json');
    showToast('ดาวน์โหลด JSON สำเร็จ', 'โครงสร้างรัฐไทย 20 กระทรวง 413 หน่วยงาน');
  }

  function exportGovDataCSV() {
    if (typeof MINISTRIES === 'undefined') return;
    var rows = [
      ['รหัสกระทรวง', 'ชื่อกระทรวง', 'รหัสหน่วยงาน', 'ชื่อหน่วยงาน', 'ตัวย่อ', 'ประเภทหน่วยงาน', 'เว็บไซต์', 'ผู้บริหาร', 'งบปี2565_ล้านบาท', 'งบปี2566_ล้านบาท']
    ];

    MINISTRIES.forEach(function (m) {
      (m.orgs || []).forEach(function (o) {
        var bKey = m.id + '|' + o.no;
        var bRec = typeof BUDGET_AGENCY !== 'undefined' ? BUDGET_AGENCY[bKey] : null;
        rows.push([
          m.id,
          m.name,
          o.no || '',
          o.name || '',
          o.abbr || '',
          o.cat || '',
          o.web || '',
          o.exec || '',
          bRec ? bRec.y65 : '',
          bRec ? bRec.y66 : ''
        ]);
      });
    });

    var csvContent = '\uFEFF' + rows.map(function (e) {
      return e.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\r\n');

    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, 'thai-government-agencies-2569.csv');
    showToast('ดาวน์โหลด CSV สำเร็จ', 'รายชื่อ 413 หน่วยงานภาครัฐ พร้อมงบประมาณ');
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  /* ═══════════════════════════════════════════════════════════
     12. UI INJECTION & EVENT LISTENERS
     ═══════════════════════════════════════════════════════════ */
  function injectToolkitUI() {
    // 1. ปุ่ม Lucky & Compare ใน Header (.hd-right)
    var hdRight = document.querySelector('.hd-right');
    if (hdRight && !document.getElementById('btn-lucky')) {
      var luckyBtn = document.createElement('button');
      luckyBtn.id = 'btn-lucky';
      luckyBtn.className = 'action-btn lucky-btn';
      luckyBtn.title = 'สุ่มสำรวจหน่วยงานรัฐ (Lucky Agency)';
      luckyBtn.innerHTML = '<span class="lucky-ico"><svg class="mdico"><use href="#i-shuffle"></use></svg></span>';
      luckyBtn.onclick = luckyAgency;
      hdRight.insertBefore(luckyBtn, hdRight.firstChild);

      var cmpBtn = document.createElement('button');
      cmpBtn.id = 'btn-compare-min';
      cmpBtn.className = 'action-btn';
      cmpBtn.title = 'เปรียบเทียบกระทรวง (Ministry Compare Tool)';
      cmpBtn.innerHTML = '<svg class="mdico"><use href="#i-arrow-right-left"></use></svg>';
      cmpBtn.onclick = openMinistryCompareModal;
      hdRight.insertBefore(cmpBtn, hdRight.children[1] || null);
    }

    // 2. ปุ่ม Sector & Oversight ใน #fx-toolbar และ Popover Menu
    var fxToolbar = document.getElementById('fx-toolbar');
    if (fxToolbar && !document.getElementById('btn-sector-tags')) {
      var sep = document.createElement('span');
      sep.className = 'fx-sep';
      sep.setAttribute('aria-hidden', 'true');
      fxToolbar.appendChild(sep);

      var secBtn = document.createElement('button');
      secBtn.id = 'btn-sector-tags';
      secBtn.className = 'view-btn';
      secBtn.type = 'button';
      secBtn.title = 'แท็กภาคส่วน & สายกำกับดูแลข้ามกระทรวง (Cross-Ministry Tags & Oversight Streams)';
      secBtn.innerHTML = '<span class="vb-ico"><svg class="mdico"><use href="#i-pin"></use></svg></span><span class="vb-tx">แท็ก & สายกำกับ</span>';
      secBtn.onclick = toggleSectorMenu;
      fxToolbar.appendChild(secBtn);

      var menu = document.createElement('div');
      menu.id = 'sector-tags-menu';
      menu.setAttribute('hidden', '');
      fxToolbar.appendChild(menu);
    }

    // 3. คลิกชิปบน Header เพื่อเปิด Overview Modal
    document.querySelectorAll('.stat-chip').forEach(function (chip) {
      chip.style.cursor = 'pointer';
      chip.title = 'คลิกเพื่อดูสถิติภาพรวมโครงสร้างรัฐไทย';
      chip.onclick = openGovOverviewModal;
    });
  }

  /* ═══════════════════════════════════════════════════════════
     13. CSS STYLES INJECTION
     ═══════════════════════════════════════════════════════════ */
  function injectToolkitStyles() {
    if (document.getElementById('tk-styles')) return;
    var st = document.createElement('style');
    st.id = 'tk-styles';
    st.textContent = `
      /* ── Lucky Button & Actions ── */
      .lucky-btn { font-size: 16px; background: rgba(255,215,0,0.12) !important; border-color: rgba(255,215,0,0.4) !important; color: var(--gold) !important; }
      .lucky-btn:hover { background: rgba(255,215,0,0.25) !important; transform: scale(1.08) rotate(15deg); box-shadow: 0 0 16px rgba(255,215,0,0.4); }
      .lucky-ico { display: inline-block; transition: transform .3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      .lucky-btn:active .lucky-ico { transform: rotate(180deg) scale(1.2); }

      /* ── Sector Tags Button in #fx-toolbar ── */
      #btn-sector-tags.active {
        background: rgba(0, 229, 255, 0.15) !important;
        border-color: var(--btn-hl, #00e5ff) !important;
        color: var(--btn-hl, #00e5ff) !important;
        box-shadow: 0 0 12px rgba(0, 229, 255, 0.25);
      }
      .sec-clear-btn {
        display: inline-flex; align-items: center; justify-content: center;
        width: 16px; height: 16px; border-radius: 50%; font-size: 10px;
        background: rgba(255,255,255,0.2); margin-left: 6px; line-height: 1;
        transition: background .15s;
      }
      .sec-clear-btn:hover { background: #e74c3c; color: #fff; }

      /* ── Popover Menu (แนบใต้ #fx-toolbar) ── */
      #sector-tags-menu {
        position: absolute; top: calc(100% + 8px); right: 0; z-index: 100;
        width: min(420px, calc(100vw - 32px));
        background: var(--bg2); border: 1px solid var(--border2); border-radius: 16px;
        padding: 12px; box-shadow: 0 16px 40px rgba(0,0,0,0.55);
        backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
      }
      [data-theme="light"] #sector-tags-menu {
        background: rgba(255, 255, 255, 0.98); border-color: rgba(0, 0, 0, 0.12);
        box-shadow: 0 14px 36px rgba(0,0,0,0.15);
      }
      #sector-tags-menu[hidden] { display: none !important; }
      
      .stm-tabs {
        display: flex; align-items: center; gap: 6px;
        padding-bottom: 8px; border-bottom: 1px solid var(--border2);
      }
      .stm-tab-btn {
        background: none; border: 1px solid transparent; font-family: inherit; font-size: 12px; font-weight: 600;
        color: var(--text-dim); cursor: pointer; padding: 4px 10px; border-radius: 8px;
        display: flex; align-items: center; gap: 5px; transition: all .15s ease;
      }
      .stm-tab-btn:hover { color: var(--text); background: rgba(255,255,255,0.06); }
      .stm-tab-btn.active {
        background: rgba(0, 229, 255, 0.15); border-color: rgba(0, 229, 255, 0.35);
        color: var(--cyan);
      }
      .stm-clear-all {
        margin-left: auto; background: none; border: none; font-family: inherit; font-size: 11px; font-weight: 600;
        color: var(--text-dim); cursor: pointer; padding: 2px 6px; border-radius: 6px;
      }
      .stm-clear-all:hover { background: rgba(231,76,60,0.15); color: #e74c3c; }

      .stm-grid {
        display: flex; flex-direction: column; gap: 4px; max-height: 360px;
        overflow-y: auto; padding: 8px 2px 2px;
      }
      .stm-item {
        display: flex; align-items: center; gap: 10px; padding: 8px 10px;
        background: rgba(255,255,255,0.02); border: 1px solid transparent;
        border-radius: 10px; text-align: left; cursor: pointer; transition: all .15s ease;
        color: var(--text); font-family: inherit;
      }
      [data-theme="light"] .stm-item { background: rgba(0,0,0,0.02); }
      .stm-item:hover {
        background: rgba(255,255,255,0.08); border-color: var(--tag-clr);
        transform: translateX(3px);
      }
      .stm-item.active {
        background: rgba(0,229,255,0.12); border-color: var(--tag-clr);
        box-shadow: 0 0 10px rgba(0,229,255,0.2);
      }
      .stm-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
      .stm-info { flex: 1; min-width: 0; }
      .stm-name { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px; color: var(--text); }
      .stm-desc { font-size: 11px; color: var(--text-dim); margin-top: 1px; line-height: 1.3; }

      /* ── Oversight Box in Info Panel ── */
      .ip-oversight-box {
        margin: 14px 0 10px; padding: 14px; border-radius: 12px;
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
      }
      [data-theme="light"] .ip-oversight-box { background: #f8fafc; border-color: #e2e8f0; }
      .ip-ov-hd {
        font-size: 12px; font-weight: 700; color: var(--gold);
        display: flex; align-items: center; gap: 6px; margin-bottom: 10px;
        padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .ip-ov-sec { margin-bottom: 10px; font-size: 12.5px; }
      .ip-ov-sec:last-child { margin-bottom: 0; }
      .ip-ov-lbl { font-size: 11.5px; font-weight: 600; margin-bottom: 4px; }
      .ip-ov-verb { color: var(--text); margin-bottom: 2px; }
      .ip-ov-law { font-size: 11px; color: var(--text-dim); display: flex; align-items: center; gap: 4px; }
      .ip-ov-in-list { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }
      .ip-ov-in-row {
        display: flex; align-items: baseline; gap: 6px; font-size: 12px;
      }
      .ip-ov-hub {
        font-weight: 600; color: var(--gold); cursor: pointer; text-decoration: underline;
        white-space: nowrap; flex-shrink: 0;
      }
      .ip-ov-hub:hover { color: #ffe066; }
      .ip-ov-hub-verb { color: var(--text-dim); font-size: 11px; }

      /* ── Toast Notification ── */
      #tk-toast {
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(40px);
        z-index: 999999; background: rgba(14, 23, 38, 0.95); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--gold); border-radius: 12px; padding: 12px 20px;
        box-shadow: 0 12px 36px rgba(0,0,0,0.6), 0 0 20px rgba(255,215,0,0.25);
        color: var(--text); font-size: 14px; pointer-events: none; opacity: 0;
        transition: transform .3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity .25s ease;
        text-align: center; max-width: min(480px, 90vw);
      }
      [data-theme="light"] #tk-toast { background: rgba(255,255,255,0.96); border-color: var(--gold-dim); box-shadow: 0 12px 36px rgba(0,0,0,0.2); }
      #tk-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; pointer-events: auto; }
      .tk-toast-t { font-weight: 600; color: var(--gold); font-size: 14px; margin-bottom: 2px; }
      .tk-toast-s { font-size: 12px; color: var(--text-dim); }

      /* ── Modals Overlay & Box ── */
      .tk-modal-overlay {
        position: fixed; inset: 0; z-index: 99999; background: rgba(0,0,0,0.75);
        backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center; padding: 20px;
        opacity: 0; pointer-events: none; transition: opacity .25s ease;
      }
      .tk-modal-overlay.show { opacity: 1; pointer-events: auto; }
      .tk-modal-box {
        background: var(--bg); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px;
        width: min(760px, 100%); max-height: 88vh; overflow-y: auto; padding: 28px;
        box-shadow: 0 24px 60px rgba(0,0,0,0.7), 0 0 30px rgba(0,229,255,0.15);
        position: relative; transform: scale(0.95); transition: transform .25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      [data-theme="light"] .tk-modal-box { background: #ffffff; border-color: rgba(0,0,0,0.1); box-shadow: 0 24px 60px rgba(0,0,0,0.25); }
      .tk-modal-overlay.show .tk-modal-box { transform: scale(1); }
      .tk-modal-close {
        position: absolute; top: 18px; right: 20px; background: none; border: none; font-size: 26px;
        color: var(--text-dim); cursor: pointer; line-height: 1; transition: color .15s ease;
      }
      .tk-modal-close:hover { color: var(--red); }
      .tk-modal-header { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
      .tk-badge-icon {
        width: 44px; height: 44px; border-radius: 12px; background: rgba(255,215,0,0.15);
        color: var(--gold); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;
      }
      .tk-modal-header h2 { font-size: 20px; font-weight: 700; color: var(--text); margin: 0; line-height: 1.3; }
      .tk-modal-sub { font-size: 13px; color: var(--text-dim); margin: 4px 0 0; }

      /* ── KPI Grid ── */
      .tk-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px; }
      .tk-kpi-card {
        background: var(--card-bg, rgba(255,255,255,0.04)); border: 1px solid rgba(255,255,255,0.08);
        border-radius: 14px; padding: 16px; text-align: center;
      }
      [data-theme="light"] .tk-kpi-card { background: #f8fafc; border-color: #e2e8f0; }
      .tk-kpi-num { font-size: 28px; font-weight: 800; font-family: 'IBM Plex Mono', monospace; line-height: 1.1; margin-bottom: 4px; }
      .tk-kpi-lbl { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
      .tk-kpi-sub { font-size: 11px; color: var(--text-dim); }

      /* ── Breakdown List ── */
      .tk-section-title { font-size: 14px; font-weight: 700; color: var(--gold); margin: 20px 0 10px; display: flex; align-items: center; gap: 6px; }
      .tk-cat-breakdown { display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px; }
      .tk-cat-row { display: flex; align-items: center; gap: 12px; font-size: 13px; }
      .tk-cat-row-lbl { width: 170px; flex-shrink: 0; color: var(--text); font-weight: 500; }
      .tk-cat-bar-wrap { flex: 1; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
      [data-theme="light"] .tk-cat-bar-wrap { background: rgba(0,0,0,0.08); }
      .tk-cat-bar { height: 100%; background: linear-gradient(90deg, var(--gold-dim), var(--gold)); border-radius: 4px; }
      .tk-cat-row-val { width: 120px; text-align: right; color: var(--text-dim); font-size: 12px; font-family: 'IBM Plex Mono', monospace; }

      /* ── Top Ministries ── */
      .tk-top-mins-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 24px; }
      .tk-min-pill-card {
        display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px;
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); cursor: pointer;
        transition: all .2s ease;
      }
      [data-theme="light"] .tk-min-pill-card { background: #f8fafc; border-color: #e2e8f0; }
      .tk-min-pill-card:hover { border-color: var(--gold); background: var(--gold-glow); transform: translateX(3px); }
      .tk-min-rank { font-size: 16px; font-weight: 800; color: var(--gold); font-family: 'IBM Plex Mono', monospace; }
      .tk-min-info { flex: 1; min-width: 0; }
      .tk-min-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .tk-min-count { font-size: 11px; color: var(--text-dim); }
      .tk-min-arrow { color: var(--text-dim); font-size: 14px; }

      /* ── Compare Tool ── */
      .tk-compare-box { width: min(880px, 100%); }
      .tk-compare-selectors { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .tk-sel-side { flex: 1; display: flex; flex-direction: column; gap: 6px; }
      .tk-sel-side label { font-size: 12px; font-weight: 600; color: var(--text-dim); }
      .tk-sel-side select {
        width: 100%; padding: 10px 12px; border-radius: 10px; font-family: inherit; font-size: 14px; font-weight: 600;
        background: var(--card-bg, rgba(255,255,255,0.06)); border: 1px solid rgba(255,255,255,0.15); color: var(--text);
        outline: none; cursor: pointer;
      }
      [data-theme="light"] .tk-sel-side select { background: #ffffff; border-color: #cbd5e1; }
      .tk-sel-vs { font-size: 16px; font-weight: 800; color: var(--gold); font-family: 'IBM Plex Mono', monospace; padding-top: 18px; }
      .tk-compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
      @media(max-width:680px){ .tk-compare-grid { grid-template-columns: 1fr; } }
      .tk-compare-col {
        background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px;
      }
      [data-theme="light"] .tk-compare-col { background: #f8fafc; border-color: #e2e8f0; }
      .tk-cmp-hd { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 14px; }
      .tk-cmp-name { font-size: 16px; font-weight: 700; color: var(--text); }
      .tk-cmp-abbr { font-size: 12px; color: var(--gold); font-family: 'IBM Plex Mono', monospace; margin-top: 2px; }
      .tk-cmp-item { padding: 8px 0; border-bottom: 1px dashed rgba(255,255,255,0.06); font-size: 13px; }
      .tk-cmp-lbl { font-size: 11px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; margin-bottom: 3px; }
      .tk-cmp-val { color: var(--text); line-height: 1.5; }
      .tk-cmp-sublist { font-size: 12px; color: var(--text-dim); margin-top: 4px; padding-left: 6px; }
      .tk-mission-txt { font-size: 12px; color: var(--text-dim); max-height: 90px; overflow-y: auto; line-height: 1.6; }

      /* ── Modal Footer ── */
      .tk-modal-footer {
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        margin-top: 24px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.1);
      }
      .tk-export-group { display: flex; align-items: center; gap: 8px; }
      .tk-export-label { font-size: 12px; color: var(--text-dim); font-weight: 500; }
      .tk-btn {
        display: inline-flex; align-items: center; gap: 6px; font-family: inherit; font-size: 13px; font-weight: 600;
        padding: 8px 16px; border-radius: 999px; cursor: pointer; border: 1px solid transparent; transition: all .15s ease;
      }
      .tk-btn-primary { background: var(--gold); color: #0b111a; border-color: var(--gold); }
      .tk-btn-primary:hover { background: #ffe066; box-shadow: 0 4px 14px rgba(255,215,0,0.35); }
      .tk-btn-ghost { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); color: var(--text); }
      .tk-btn-ghost:hover { background: rgba(255,255,255,0.14); color: var(--gold); border-color: var(--gold-dim); }
    `;
    document.head.appendChild(st);
  }

  // Expose global methods to window
  window.luckyAgency = luckyAgency;
  window.toggleSectorMenu = toggleSectorMenu;
  window.closeSectorMenu = closeSectorMenu;
  window.filterBySectorTag = filterBySectorTag;
  window.clearSectorFilter = clearSectorFilter;
  window.setOversightStream = setOversightStream;
  window.clearOversightStream = clearOversightStream;
  window.clearAllFilters = clearAllFilters;
  window.openGovOverviewModal = openGovOverviewModal;
  window.openMinistryCompareModal = openMinistryCompareModal;
  window.closeToolkitModals = closeToolkitModals;
  window.exportGovDataJSON = exportGovDataJSON;
  window.exportGovDataCSV = exportGovDataCSV;

  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectToolkitStyles();
      injectToolkitUI();
    });
  } else {
    injectToolkitStyles();
    injectToolkitUI();
  }

})();
