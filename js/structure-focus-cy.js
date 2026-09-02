/* ═══════════════════════════════════════════════════════════════════════════
   structure-focus-cy.js — "ผังเจาะจง" เรนเดอร์ด้วย Cytoscape.js
   ---------------------------------------------------------------------------
   เสียบทับเฉพาะมุมมอง focus ของ structure.html · มุมมองอื่น (ผังรวม/ผังกลุ่ม/
   ครม./ทุจริต) ยังใช้แคนวาสเดิมทั้งหมด — โมดูลนี้ไม่แตะโค้ดเดิมเลย
   นอกจากห่อ switchCanvasView() กับปุ่มซูมไว้ชั้นนอก

   ทำไมถึงย้ายมา Cytoscape: ต้องการหน้าตาโหนดแบบ machineryofgovernment.uk คือ
     · รูปทรงบอกประเภทหน่วยงาน (นายกฯ 7 เหลี่ยม · รมต. 8 เหลี่ยม · กระทรวงสี่เหลี่ยม
       · กรมสี่เหลี่ยมมน · รัฐวิสาหกิจสี่เหลี่ยมเฉียง · องค์กรอิสระ/ศาลข้าวหลามตัด)
     · สีขอบบอกชนิดย่อย · พื้นโปร่งจาง
     · ป้ายชื่ออยู่ "ในโหนด" ตัดบรรทัดอัตโนมัติ (ของเดิมป้ายลอยอยู่ข้างนอก)
     · กล่อง "คณะรัฐมนตรี" เป็น compound node จริง ขยายเองตามสมาชิก

   อนิเมชัน: ขยับเฉพาะตอนคลิกเปลี่ยนจุดโฟกัส (420ms) — ไม่มี rAF วิ่งตลอดเวลา
   ตามกฎ "ผังนิ่ง" ของหน้านี้
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (typeof cytoscape === 'undefined') { console.warn('[fxcy] ไม่พบ cytoscape'); return; }

  var cy = null, host = null, on = false;
  var lastPos = {};                 // ตำแหน่งโหนดรอบก่อน (id → {x,y}) ใช้ทำอนิเมชันลื่น
  var ANIM = 420;                   // ระยะเวลาเลื่อนโหนดตอนเปลี่ยนโฟกัส (ms)

  /* ── ขนาดโหนดแต่ละชั้น (px) ──
     ตั้งเล็กแบบ machineryofgovernment.uk: โหนดเยอะแล้วผังต้องพอดีจอ ถ้าโหนดใหญ่
     จะถูกบีบให้ซูมออกจนตัวอักษรเละ · อ่านชื่อเต็มได้จากป้ายลอยตอนชี้ + แผงขวา */
  var SZ = { focus: 112, ministry: 74, person: 62, org: 62, uni: 54, small: 54 };

  /* ═══════ 1. หน้าตาโหนด — รูปทรง/สี ตามประเภทหน่วยงาน ═══════
     catID อ้างตามชุดข้อมูลเดิมใน structure-data.js
       01 ส่วนราชการ · 02 รัฐวิสาหกิจ · 03,04 องค์การมหาชน · 05 รัฐสภา · 06 ศาล
       07 องค์กรอิสระ · 08 หน่วยงานอิสระ · 09 สถาบันอุดมศึกษา · 10 สภาวิชาชีพ
       13 หน่วยงานอื่น                                                        */
  var CAT_SHAPE = {
    '01': 'round-rectangle',   // ส่วนราชการ (กรม)
    '02': 'rhomboid',          // รัฐวิสาหกิจ
    '03': 'round-rectangle',   // องค์การมหาชน
    '04': 'round-rectangle',   // องค์การมหาชน (พ.ร.บ.เฉพาะ)
    '05': 'hexagon',           // รัฐสภา
    '06': 'diamond',           // ศาล
    '07': 'diamond',           // องค์กรอิสระตามรัฐธรรมนูญ
    '08': 'diamond',           // หน่วยงานอิสระ
    '09': 'diamond',           // สถาบันอุดมศึกษา
    '10': 'rhomboid',          // สภาวิชาชีพ
    '13': 'rhomboid'           // หน่วยงานอื่นของรัฐ
  };
  var CAT_LABEL = {
    '01': 'ส่วนราชการ', '02': 'รัฐวิสาหกิจ', '03': 'องค์การมหาชน', '04': 'องค์การมหาชน',
    '05': 'รัฐสภา', '06': 'ศาล', '07': 'องค์กรอิสระ', '08': 'หน่วยงานอิสระ',
    '09': 'สถาบันอุดมศึกษา', '10': 'สภาวิชาชีพ', '13': 'หน่วยงานอื่นของรัฐ'
  };

  function themeDark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }
  function cssVar(n, fb) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    return v || fb;
  }
  /* สีขอบ = สีประเภท (ใช้ getColor ของหน้าเดิม เพื่อให้ตำนานสัญลักษณ์ตรงกัน) */
  function catColor(catID, a) {
    return (typeof getColor === 'function') ? getColor(catID, a == null ? 1 : a)
                                            : (themeDark() ? '#8a97aa' : '#64748b');
  }
  /* พื้นโหนดโปร่งจาง — เข้มพอให้ตัวอักษรอ่านออกทั้งสองธีม */
  function fillOf(stroke) {
    return themeDark() ? mix(stroke, '#0d1117', 0.74) : mix(stroke, '#ffffff', 0.84);
  }
  function mix(c, base, amt) {
    var a = rgb(c), b = rgb(base);
    if (!a || !b) return c;
    return 'rgb(' + [0, 1, 2].map(function (i) {
      return Math.round(a[i] * (1 - amt) + b[i] * amt);
    }).join(',') + ')';
  }
  function rgb(c) {
    c = String(c).trim();
    var m = c.match(/^#([0-9a-f]{6})$/i);
    if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
    m = c.match(/rgba?\(([^)]+)\)/);
    if (m) return m[1].split(',').slice(0, 3).map(function (x) { return parseFloat(x); });
    return null;
  }

  /* ═══════ 2. แปลง descriptor ของหน้าเดิม → element ของ Cytoscape ═══════
     ใช้ fxMakeNode() ของ structure.html เป็นแหล่งความจริงเดียว เพื่อให้
     showPanel()/renderDetailTabs() ทำงานได้เหมือนเดิมทุกประการ            */
  function elOf(desc, kind) {
    var n = fxMakeNode(desc, 0, 0, 20);          // โหนดแบบเดิม (มี label/sub/data ครบ)
    var id = fxKeyOfDesc(desc);
    var shape, stroke, size, sub;

    if (desc.k === 'center') {
      shape = 'heptagon'; stroke = themeDark() ? '#e8c24e' : '#9a7b1f';
      size = SZ.person; sub = 'นายกรัฐมนตรี';
    } else if (desc.k === 'minister') {
      shape = 'octagon';
      stroke = (typeof PARTY_COLORS !== 'undefined' && PARTY_COLORS[n.party]) || '#8a97aa';
      size = SZ.person; sub = n.role || 'รัฐมนตรี';
    } else if (desc.k === 'ministry') {
      shape = 'rectangle';
      stroke = (typeof MIN_COLORS !== 'undefined'
        && MIN_COLORS[MINISTRIES.findIndex(function (m) { return m.id === desc.mid; })]) || '#e67e22';
      size = SZ.ministry; sub = 'กระทรวง';
    } else if (desc.k === 'uni') {
      shape = 'diamond'; stroke = catColor('09'); size = SZ.uni; sub = 'สถาบันอุดมศึกษา';
    } else {
      var cid = n.catID || '01';
      shape = CAT_SHAPE[cid] || 'round-rectangle';
      stroke = catColor(cid); size = SZ.org; sub = CAT_LABEL[cid] || (n.data && n.data.cat) || '';
    }
    if (kind === 'focus') size = Math.round(size * 1.34);
    if (kind === 'far')   size = Math.round(size * 0.82);

    return {
      data: {
        id: id, label: n.label || '—', sub: sub,
        shape: shape, stroke: stroke, fill: fillOf(stroke),
        size: size, kind: kind || 'normal',
        pmDirect: (typeof isPmDirect === 'function' && isPmDirect(n)) ? 1 : 0
      },
      _node: n, _desc: desc
    };
  }

  /* ── กลุ่ม "องค์กรตรวจสอบฝ่ายบริหาร" ──────────────────────────────────
     11 หน่วยในหมวด 24 ที่ทำหน้าที่ถ่วงดุล/ตรวจสอบรัฐบาลตามรัฐธรรมนูญ 2560
     เรียงตามสายอำนาจ: นิติบัญญัติ → ตุลาการ → องค์กรอิสระ/อัยการ
     ⚠ ไม่รวม กกพ./กสทช./Thai PBS/สภากาชาด (หมวด 24 เหมือนกันแต่เป็นองค์กร
       กำกับรายสาขา ไม่ใช่องค์กรตรวจสอบรัฐบาล) และไม่รวม ปปง./ป.ป.ท.
       (ตรวจสอบทุจริตเหมือนกัน แต่อยู่ใต้ฝ่ายบริหาร จึงไม่ใช่องค์กรถ่วงดุล) */
  var OVERSIGHT = ['282', '281', '284', '285', '286', '287', '288', '289', '290', '291', '292'];
  var OVERSIGHT_MID = '24';

  /* ═══════ 3. ประกอบผังรอบจุดโฟกัส ═══════
     คงตรรกะเดิมของ buildFocusLayout(): ใครเป็นพ่อ ใครเป็นลูก แสดงแค่ไหน
     ต่างกันแค่ "การวางตำแหน่ง" ที่ยกมาทำแบบ machineryofgovernment.uk       */
  function build(key) {
    var d = fxDescOfKey(key);
    var inCab = (d.k === 'center' || d.k === 'minister');
    var els = [], pos = {}, anchorId = null, tooMany = 0;
    var cabCols = 5, cabRows = 1, cabCW = 96, cabCH = 88;

    /* ── ก. กล่อง "คณะรัฐมนตรี" = compound node จริง ──
       สมาชิก = นายกฯ + รัฐมนตรีทุกกระทรวง เรียงกริด 5 คอลัมน์               */
    if (inCab) {
      var members = [{ k: 'center' }].concat(
        MINISTRIES.filter(function (m) { return fxHasMinister(m.id); })
                  .map(function (m) { return { k: 'minister', mid: m.id }; }));
      els.push({ data: { id: 'grp-cab', label: 'คณะรัฐมนตรี ชุดที่ 66', isGroup: 1 } });

      /* นายกฯ อยู่แถวบนเดี่ยว ๆ กึ่งกลาง · รัฐมนตรีเรียงกริดด้านล่าง
         → เส้น "แต่งตั้ง" กางลงมาเป็นพัด ไม่พาดทับโหนดอื่นเหมือนตอนวางนายกฯ ไว้มุมซ้ายบน */
      var COLS = 5, CW = SZ.person + 34, CH = SZ.person + 26;
      cabCols = COLS; cabCW = CW; cabCH = CH;
      cabRows = 1 + Math.ceil((members.length - 1) / COLS);
      members.forEach(function (md, i) {
        var e = elOf(md, fxKeyOfDesc(md) === key ? 'focus' : 'normal');
        e.data.parent = 'grp-cab';
        var x, y;
        if (i === 0) { x = (COLS - 1) / 2 * CW; y = 0; }          // นายกฯ
        else { x = ((i - 1) % COLS) * CW; y = (1 + Math.floor((i - 1) / COLS)) * CH; }
        pos[e.data.id] = { x: x, y: y };
        els.push(e);
        if (fxKeyOfDesc(md) === key) anchorId = e.data.id;
      });
      if (!anchorId) anchorId = els[1].data.id;

      /* เส้นในกล่อง ครม.: นายกฯ แต่งตั้งรัฐมนตรีทุกคน
         (ไม่งั้นรัฐมนตรีที่ไม่ได้ถูกโฟกัสจะลอยอยู่ในกล่องโดยไม่มีเส้นโยงอะไรเลย) */
      members.forEach(function (md) {
        if (md.k !== 'minister') return;
        els.push({ data: {
          id: 'ap|' + md.mid, source: 'center', target: fxKeyOfDesc(md),
          verb: 'แต่งตั้ง', rel: 'appoint'
        } });
      });

      /* ── กล่อง "องค์กรตรวจสอบฝ่ายบริหาร" วางไว้ทางซ้ายของกล่อง ครม. ──
         ถ่วงดุลกันคนละฝั่ง: ซ้าย = ผู้ตรวจสอบ · ขวา = ฝ่ายบริหารและหน่วยงานในสังกัด */
      var ov = OVERSIGHT.filter(function (no) {
        var m = MINISTRIES.find(function (x) { return x.id === OVERSIGHT_MID; });
        return m && m.orgs.some(function (o) { return o.no === no; });
      });
      if (ov.length) {
        els.push({ data: { id: 'grp-ov', label: 'องค์กรตรวจสอบฝ่ายบริหาร', isGroup: 1, ovGroup: 1 } });
        var OC = 3, OW = SZ.org + 34, OH = SZ.org + 26;
        var orows = Math.ceil(ov.length / OC);
        /* ขอบขวาของกล่องนี้ห่างจากขอบซ้ายกล่อง ครม. ~230px */
        var ox0 = -((OC - 1) * OW) - 230;
        var oy0 = (cabRows - 1) / 2 * cabCH - (orows - 1) / 2 * OH;
        ov.forEach(function (no, i) {
          var e = elOf({ k: 'org', mid: OVERSIGHT_MID, no: no },
                       fxKeyOfDesc({ k: 'org', mid: OVERSIGHT_MID, no: no }) === key ? 'focus' : 'normal');
          e.data.parent = 'grp-ov';
          pos[e.data.id] = { x: ox0 + (i % OC) * OW, y: oy0 + Math.floor(i / OC) * OH };
          els.push(e);
          /* เส้นประ: หน่วยที่มีอำนาจตรวจสอบ "ทุกส่วนราชการ/นายกฯ" ยิงเส้นไปที่นายกฯ */
          var rel = (typeof RELATIONS !== 'undefined') && RELATIONS[OVERSIGHT_MID + '|' + no];
          if (rel && (rel.to === 'MIN' || rel.to === 'PM')) {
            els.push({ data: {
              id: 'ov|' + no, source: e.data.id, target: 'center',
              verb: rel.verb, rel: rel.type, secondary: 1
            } });
          }
        });
      }

    } else {
      /* ── ข. โหนดที่เลือกอยู่กลาง · สายบังคับบัญชาไล่ขึ้นไปทางซ้าย ── */
      var a = elOf(d, 'focus');
      anchorId = a.data.id; pos[a.data.id] = { x: 0, y: 0 }; els.push(a);

      var chain = [];
      if (d.k === 'ministry') {
        if (fxHasMinister(d.mid)) chain.push({ k: 'minister', mid: d.mid });
        chain.push({ k: 'center' });
      } else {
        chain.push({ k: 'ministry', mid: d.mid });
        chain.push(fxHasMinister(d.mid) ? { k: 'minister', mid: d.mid } : { k: 'center' });
      }
      chain.forEach(function (cd, i) {
        var e = elOf(cd, 'far'), id = e.data.id;
        if (pos[id]) return;                       // กันซ้ำ (กระทรวงเดียวกันโผล่สองที)
        pos[id] = { x: -(260 * (i + 1)), y: -70 * (i + 1) };
        els.push(e);
        els.push({ data: {
          id: 'e|' + id + '|' + (i === 0 ? anchorId : fxKeyOfDesc(chain[i - 1])),
          source: id, target: (i === 0 ? anchorId : fxKeyOfDesc(chain[i - 1])),
          verb: cd.k === 'center' ? 'แต่งตั้ง' : (cd.k === 'minister' ? 'กำกับดูแล' : 'ในสังกัด'),
          rel: 'chain'
        } });
      });
    }

    /* ── ค. ลูก (และหลาน) กางเป็นส่วนโค้งด้านขวา ── */
    var l1 = [], l2 = [], v1 = 'กำกับดูแล', v2 = 'ในสังกัด';
    if (d.k === 'center') {
      /* หมวด 24 ถูกกางเป็นกล่องตรวจสอบทางซ้ายแล้ว จึงไม่ต้องมีโหนดก้อนรวมในพัดขวาอีก */
      var hasOv = els.some(function (e) { return e.data.id === 'grp-ov'; });
      l1 = MINISTRIES.filter(function (m) { return !(hasOv && m.id === OVERSIGHT_MID); })
                     .map(function (m) { return { k: 'ministry', mid: m.id }; });
    }
    else if (d.k === 'minister') { l1 = [{ k: 'ministry', mid: d.mid }]; l2 = fxOrgsOf(d.mid); }
    else if (d.k === 'ministry') { l1 = fxOrgsOf(d.mid); v1 = 'ในสังกัด'; }

    /* จุดยึดของส่วนโค้ง — กรณีกล่อง ครม. ให้ยิงออกจาก "กลางขอบขวา" ของกล่อง
       ไม่ใช่มุมบนขวา (ไม่งั้นเส้นพุ่งเฉียงขึ้นหมด) */
    var ax = 0, ay = 0;
    if (inCab) {
      ax = (cabCols - 1) * cabCW + SZ.person;
      ay = (cabRows - 1) / 2 * cabCH;
    }

    var SPAN = Math.PI * 0.86;                              // ~155° หันไปทางขวา
    /* กระทรวงตัวใหญ่กว่า → เว้นระยะมากกว่าหน่วยงานลูก */
    var sp1 = (d.k === 'center') ? 92 : (l1.length > 40 ? 64 : 78);

    /* ผังนายกฯ: เส้นไปกระทรวงให้ออกจาก "รัฐมนตรีเจ้ากระทรวง" ถ้ามี — สะท้อนสายบังคับบัญชาจริง
       (นายกฯ แต่งตั้งรัฐมนตรี → รัฐมนตรีกำกับกระทรวง) กระทรวงที่ยังไม่มีรัฐมนตรีจึงออกจากนายกฯ */
    var from1 = anchorId, verb1 = v1;
    if (d.k === 'center') {
      var inBox = {};
      els.forEach(function (e) { if (!e.data.source) inBox[e.data.id] = 1; });
      from1 = function (it) {
        var mk = it && it.mid && fxKeyOfDesc({ k: 'minister', mid: it.mid });
        return (mk && inBox[mk]) ? mk : anchorId;
      };
      verb1 = function (it) {
        var mk = it && it.mid && fxKeyOfDesc({ k: 'minister', mid: it.mid });
        return (mk && inBox[mk]) ? 'กำกับดูแล' : 'บังคับบัญชา';
      };
    }
    var r1 = arcPlace(l1, ax, ay, 300, SPAN, sp1, pos, els, from1, verb1,
                      l1.length > 40 ? 'far' : 'normal', key);

    if (l2.length && l2.length <= 90) {
      var far = r1 + 150;
      var p1 = l1.length ? fxKeyOfDesc(l1[0]) : anchorId;
      arcPlace(l2, ax, ay, far, SPAN * 1.06, 66, pos, els, p1, v2, 'far', key);
    } else if (l2.length) {
      tooMany = l2.length;
    }

    /* ── ง. เส้นความสัมพันธ์เชิงอำนาจ (RELATIONS) ระหว่างโหนดที่อยู่ในผังนี้ ── */
    if (typeof RELATIONS !== 'undefined') {
      var present = {}; els.forEach(function (e) { if (!e.data.source) present[e.data.id] = 1; });
      Object.keys(RELATIONS).forEach(function (k) {
        var r = RELATIONS[k], src = 'org|' + k.split('|')[0] + '|' + k.split('|')[1];
        if (!present[src] || !Array.isArray(r.to)) return;
        r.to.forEach(function (t) {
          var tid = 'org|' + t.split('|')[0] + '|' + t.split('|')[1];
          if (!present[tid] || tid === src) return;
          els.push({ data: {
            id: 'r|' + src + '|' + tid, source: src, target: tid,
            verb: r.verb, rel: r.type, secondary: 1
          } });
        });
      });
    }

    return { els: els, pos: pos, anchorId: anchorId, tooMany: tooMany };
  }

  /* วางรายการเป็นส่วนโค้งรอบจุดยึด — ล้นวงแรกก็ขยับออกวงถัดไป
     คืนค่ารัศมีวงนอกสุดที่ใช้ไป (ให้ชั้นหลานเริ่มถัดจากนั้น)              */
  function arcPlace(items, ax, ay, minR, span, spacing, pos, els, fromId, verb, kind, key) {
    if (!items.length) return minR;
    var idx = 0, rr = Math.max(minR, (items.length * spacing) / span * 0.55), maxR = rr;
    while (idx < items.length) {
      var cap = Math.max(4, Math.floor((rr * span) / spacing));
      var cnt = Math.min(cap, items.length - idx);
      for (var j = 0; j < cnt; j++, idx++) {
        var ang = (cnt > 1 ? (j / (cnt - 1) - 0.5) : 0) * span;
        var e = elOf(items[idx], fxKeyOfDesc(items[idx]) === key ? 'focus' : kind);
        if (pos[e.data.id]) continue;
        pos[e.data.id] = { x: ax + rr * Math.cos(ang), y: ay + rr * Math.sin(ang) };
        els.push(e);
        /* fromId เป็นฟังก์ชันได้ เพื่อให้ต้นทางเส้นต่างกันรายรายการ
           (ผังนายกฯ: กระทรวงไหนมีรัฐมนตรี ให้เส้นออกจากรัฐมนตรีคนนั้น ไม่ใช่ออกจากนายกฯ ทั้งหมด) */
        var it = items[idx];
        var src = (typeof fromId === 'function') ? fromId(it) : fromId;
        els.push({ data: {
          id: 'e|' + src + '|' + e.data.id, source: src, target: e.data.id,
          verb: (typeof verb === 'function') ? verb(it) : verb, rel: 'tree'
        } });
      }
      maxR = rr;
      rr += spacing * 1.6;          // ระยะห่างระหว่างวง — แน่นพอให้ผังไม่บานจนต้องซูมออก
    }
    return maxR;
  }

  /* ═══════ 4. สไตล์ชีต ═══════ */
  function sheet() {
    var dark = themeDark();
    var edge = dark ? 'rgba(150,163,180,.34)' : 'rgba(90,102,118,.34)';
    var txt  = dark ? '#e8edf5' : '#1c2430';
    var dim  = dark ? '#8a97aa' : '#5a6676';
    var bg   = cssVar('--bg2', dark ? '#111620' : '#ffffff');

    return [
      { selector: 'node', style: {
        'shape': 'data(shape)', 'width': 'data(size)', 'height': 'data(size)',
        'background-color': 'data(fill)', 'border-color': 'data(stroke)', 'border-width': 2.4,
        'label': 'data(label)', 'color': txt,
        'font-family': 'Sarabun, sans-serif', 'font-size': 11, 'font-weight': 500,
        'text-valign': 'center', 'text-halign': 'center',
        'text-wrap': 'wrap', 'text-max-width': 'mapData(size, 50, 152, 46px, 126px)',
        'line-height': 1.22,
        /* ซูมออกมากจนตัวอักษรเล็กกว่า 7px → ซ่อนป้าย (กันตัวหนังสือเละ) เหมือน MoG
           ชื่อเต็มดูได้จากป้ายลอยตอนชี้ */
        'min-zoomed-font-size': 7,
        'transition-property': 'border-width opacity', 'transition-duration': '150ms'
      } },
      /* โหนดกลาง — ใหญ่ ขอบหนา ตัวอักษรใหญ่ขึ้น */
      { selector: 'node[kind = "focus"]', style: {
        'border-width': 4, 'font-size': 13, 'font-weight': 700, 'z-index': 30
      } },
      { selector: 'node[kind = "far"]', style: { 'font-size': 9.5 } },
      /* กล่องกลุ่ม (คณะรัฐมนตรี) — compound node */
      { selector: 'node[isGroup = 1]', style: {
        'shape': 'round-rectangle', 'background-color': dark ? '#c9a84c' : '#9a7b1f',
        'background-opacity': dark ? 0.07 : 0.06,
        'border-color': dark ? '#c9a84c' : '#9a7b1f', 'border-width': 1.4, 'border-style': 'dashed',
        'padding': 26, 'label': 'data(label)', 'font-size': 13, 'font-weight': 700,
        'color': dark ? '#c9a84c' : '#9a7b1f',
        'text-valign': 'top', 'text-halign': 'center', 'text-margin-y': -8, 'z-index': 1
      } },
      /* กล่ององค์กรตรวจสอบ — ใช้สีฟ้าคนละโทนกับกล่อง ครม. (ทอง) ให้เห็นการถ่วงดุล */
      { selector: 'node[ovGroup = 1]', style: {
        'background-color': dark ? '#22d3ee' : '#0e7490',
        'border-color': dark ? '#22d3ee' : '#0e7490',
        'color': dark ? '#22d3ee' : '#0e7490'
      } },
      /* หน่วยงานขึ้นตรงนายกฯ — วงแหวนทองรอบโหนด */
      { selector: 'node[pmDirect = 1]', style: {
        'border-style': 'double', 'border-width': 5, 'border-color': dark ? '#e8c24e' : '#9a7b1f'
      } },
      { selector: 'node.dim', style: { 'opacity': 0.14 } },
      { selector: 'node.lit', style: { 'border-width': 4, 'z-index': 20 } },

      { selector: 'edge', style: {
        'curve-style': 'bezier', 'control-point-step-size': 52,
        'width': 1.5, 'line-color': edge,
        'target-arrow-shape': 'triangle', 'target-arrow-color': edge, 'arrow-scale': 0.75,
        'label': '', 'font-family': 'Sarabun, sans-serif', 'font-size': 9, 'color': dim,
        'text-background-color': bg, 'text-background-opacity': 0.88,
        'text-background-padding': 2, 'text-background-shape': 'round-rectangle',
        'text-rotation': 'autorotate',
        'transition-property': 'opacity line-color', 'transition-duration': '150ms'
      } },
      /* ความสัมพันธ์เชิงอำนาจข้ามสายบังคับบัญชา = เส้นประ (แบบ secondary ของ MoG) */
      { selector: 'edge[secondary = 1]', style: {
        'line-style': 'dashed', 'line-dash-pattern': [7, 4], 'width': 1.8, 'opacity': 0.85,
        'line-color': dark ? '#22d3ee' : '#0e7490', 'target-arrow-color': dark ? '#22d3ee' : '#0e7490'
      } },
      /* เส้น "แต่งตั้ง" ในกล่อง ครม. — บางและจาง เพราะมี 20 เส้นในพื้นที่แคบ */
      { selector: 'edge[rel = "appoint"]', style: {
        'width': 1.3, 'opacity': 0.6, 'curve-style': 'straight',
        'target-arrow-shape': 'none', 'line-color': dark ? '#c9a84c' : '#9a7b1f'
      } },
      { selector: 'edge.dim', style: { 'opacity': 0.05 } },
      { selector: 'edge.lit', style: {
        'width': 2.4, 'label': 'data(verb)', 'z-index': 25,
        'line-color': dark ? '#e8c24e' : '#9a7b1f', 'target-arrow-color': dark ? '#e8c24e' : '#9a7b1f'
      } }
    ];
  }

  /* ═══════ 5. mount / render ═══════ */
  function ensureHost() {
    if (host) return host;
    var css = document.createElement('style');
    css.textContent =
      '#cyfx{position:absolute;inset:0;z-index:4;display:none;background:var(--canvas-bg)}' +
      '#cyfx.on{display:block}' +
      '#cyfx-note{position:absolute;left:14px;bottom:12px;z-index:6;max-width:min(560px,68vw);' +
      'font:12px Sarabun,sans-serif;line-height:1.5;color:var(--text-dim);' +
      'background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:7px 12px;' +
      'display:none;pointer-events:none}' +
      /* ป้ายลอยตามเมาส์ — แบบ machineryofgovernment.uk (ชี้โหนดแล้วเห็นชื่อเต็ม) */
      '#cyfx-tip{position:absolute;z-index:9;display:none;max-width:280px;padding:7px 11px;' +
      'font:12.5px/1.45 Sarabun,sans-serif;color:var(--text);background:var(--bg2);' +
      'border:1px solid var(--border2);border-radius:8px;pointer-events:none;' +
      'box-shadow:0 4px 18px rgba(0,0,0,.22)}' +
      '#cyfx-tip b{display:block;font-weight:600}' +
      '#cyfx-tip i{font-style:normal;font-size:11px;color:var(--text-dim)}';
    document.head.appendChild(css);

    host = document.createElement('div');
    host.id = 'cyfx';
    document.getElementById('main').appendChild(host);

    var note = document.createElement('div');
    note.id = 'cyfx-note';
    document.getElementById('main').appendChild(note);

    var tip = document.createElement('div');
    tip.id = 'cyfx-tip';
    document.getElementById('main').appendChild(tip);
    return host;
  }

  /* ป้ายลอยตามเมาส์ */
  function showTip(node, ev) {
    var tip = document.getElementById('cyfx-tip');
    if (!tip) return;
    tip.innerHTML = '';
    var b = document.createElement('b'); b.textContent = node.data('label') || '';
    var i = document.createElement('i'); i.textContent = node.data('sub') || '';
    tip.appendChild(b); tip.appendChild(i);
    tip.style.display = 'block';
    moveTip(ev);
  }
  function moveTip(ev) {
    var tip = document.getElementById('cyfx-tip');
    if (!tip || tip.style.display === 'none') return;
    var box = host.getBoundingClientRect();
    var x = (ev.originalEvent ? ev.originalEvent.clientX : 0) - box.left + 16;
    var y = (ev.originalEvent ? ev.originalEvent.clientY : 0) - box.top + 16;
    if (x + tip.offsetWidth > box.width - 8) x -= tip.offsetWidth + 30;
    if (y + tip.offsetHeight > box.height - 8) y -= tip.offsetHeight + 30;
    tip.style.left = Math.max(6, x) + 'px';
    tip.style.top = Math.max(6, y) + 'px';
  }
  function hideTip() {
    var tip = document.getElementById('cyfx-tip');
    if (tip) tip.style.display = 'none';
  }

  function render(key, animate) {
    var b = build(key);
    var prev = lastPos;

    if (!cy) {
      cy = cytoscape({
        container: host, style: sheet(), elements: b.els,
        layout: { name: 'preset', positions: function (n) { return b.pos[n.id()] || { x: 0, y: 0 }; } },
        wheelSensitivity: 0.22, minZoom: 0.12, maxZoom: 2.6,
        boxSelectionEnabled: false, autounselectify: true
      });
      wire();
    } else {
      cy.batch(function () {
        cy.elements().remove();
        cy.add(b.els);
        cy.nodes().forEach(function (n) {
          var id = n.id();
          n.position(animate && prev[id] ? prev[id] : (b.pos[id] || { x: 0, y: 0 }));
        });
      });
      if (animate) {
        cy.nodes().forEach(function (n) {
          var t = b.pos[n.id()];
          if (t) n.animate({ position: t }, { duration: ANIM, easing: 'ease-out-cubic' });
        });
      }
    }

    lastPos = {};
    Object.keys(b.pos).forEach(function (k) { lastPos[k] = b.pos[k]; });

    var note = document.getElementById('cyfx-note');
    if (b.tooMany) {
      note.textContent = 'หน่วยงานในสังกัด ' + b.tooMany + ' แห่ง — มากเกินกว่าจะกางในผังเดียว '
        + 'กดที่โหนดกระทรวงเพื่อดูรายชื่อทั้งหมด';
      note.style.display = 'block';
    } else note.style.display = 'none';

    setTimeout(function () { fitGraph(animate); }, animate ? 40 : 0);
  }

  /* จัดผังให้พอดีจอ — เผื่อพื้นที่แผงรายละเอียดที่ลอยทับอยู่ขวามือ
     (แผงเป็น overlay ไม่ได้บีบ #main จึงต้องเลื่อนกล้องเอง) */
  function panelW() {
    var p = document.getElementById('info-panel');
    if (!p || !p.classList.contains('show')) return 0;
    var r = p.getBoundingClientRect();
    return (r.width && r.right > (host.getBoundingClientRect().right - 40)) ? r.width + 24 : 0;
  }
  function fitGraph(animate) {
    if (!cy) return;
    var pw = panelW();
    cy.animate({ fit: { eles: cy.elements(), padding: 60 } },
               { duration: animate ? ANIM : 0, easing: 'ease-out-cubic',
                 complete: function () {
                   if (!pw) return;
                   var z = Math.min(cy.zoom(), (host.clientWidth - pw - 60) / Math.max(1, cy.elements().boundingBox().w));
                   cy.zoom({ level: Math.max(0.1, z), renderedPosition: { x: host.clientWidth / 2, y: host.clientHeight / 2 } });
                   cy.center(cy.elements());
                   cy.panBy({ x: -pw / 2, y: 0 });
                 } });
  }

  /* ── เหตุการณ์ ── */
  function wire() {
    cy.on('tap', 'node', function (ev) {
      var n = ev.target;
      if (n.data('isGroup')) return;
      var id = n.id();
      if (id === fxKey) { openPanel(id); return; }
      fxKey = id;                       // ตัวแปรร่วมกับหน้าเดิม
      render(id, true);
      openPanel(id);
    });

    cy.on('mouseover', 'node', function (ev) {
      var n = ev.target;
      if (n.data('isGroup')) return;
      var keep = n.closedNeighborhood();
      cy.elements().not(keep).addClass('dim');
      keep.nodes().addClass('lit');
      keep.edges().addClass('lit');
      host.style.cursor = 'pointer';
      showTip(n, ev);
    });
    cy.on('mousemove', 'node', moveTip);
    cy.on('mouseout', 'node', function () {
      cy.elements().removeClass('dim lit');
      host.style.cursor = '';
      hideTip();
    });
    cy.on('tap', function (ev) {
      if (ev.target === cy) { cy.elements().removeClass('dim lit'); hideTip(); }
    });
    cy.on('pan zoom', hideTip);
  }

  /* เปิดแผงรายละเอียดด้วยกลไกเดิมของหน้า (แท็บ ข้อมูล/อำนาจหน้าที่/งบประมาณ/บุคลากร) */
  function openPanel(id) {
    if (typeof showPanel !== 'function') return;
    try { showPanel(fxMakeNode(fxDescOfKey(id), 0, 0, 20)); } catch (e) { console.warn('[fxcy]', e); }
  }

  /* ═══════ 6. เสียบเข้ากับหน้าเดิม ═══════ */
  function mount() {
    ensureHost();
    host.classList.add('on');
    on = true;
    var key = (typeof fxKey === 'string' && fxKey) ? fxKey : 'center';
    if (!cy) render(key, false);
    else { cy.resize(); render(key, false); }
  }
  function unmount() {
    on = false;
    if (host) host.classList.remove('on');
    var note = document.getElementById('cyfx-note');
    if (note) note.style.display = 'none';
  }

  /* ห่อ switchCanvasView ของหน้าเดิม — ไม่แก้ตัวฟังก์ชันเดิม */
  var _switch = window.switchCanvasView;
  window.switchCanvasView = function (v) {
    _switch.apply(this, arguments);
    if (v === 'focus') mount(); else unmount();
  };

  /* ปุ่มซูม/รีเซ็ตของหน้าเดิม → ให้ทำงานกับ Cytoscape เมื่ออยู่ในผังเจาะจง */
  function wrapBtn(id, fn) {
    var el = document.getElementById(id); if (!el) return;
    var orig = el.onclick;
    el.onclick = function (e) {
      if (on && cy) { fn(); return; }
      if (orig) orig.call(this, e);
    };
  }
  wrapBtn('zin',  function () { cy.animate({ zoom: Math.min(2.6, cy.zoom() * 1.25), center: { eles: cy.elements() } }, { duration: 180 }); });
  wrapBtn('zout', function () { cy.animate({ zoom: Math.max(0.12, cy.zoom() / 1.25), center: { eles: cy.elements() } }, { duration: 180 }); });
  wrapBtn('zfit', function () { fitGraph(true); });
  wrapBtn('btn-reset', function () { fxKey = 'center'; render('center', true); });

  /* ⊞ ครม. และ ⚠ ทุจริต ไม่ได้เดินผ่าน switchCanvasView (มี handler ของตัวเอง)
     → ต้องสั่งถอดชั้น Cytoscape เองตอนออกจากผังเจาะจง ไม่งั้นมันค้างทับหน้าจอ */
  ['btn-view-grid', 'btn-view-force'].forEach(function (id) {
    var el = document.getElementById(id); if (!el) return;
    var orig = el.onclick;
    el.onclick = function (e) { unmount(); if (orig) orig.call(this, e); };
  });

  /* สลับธีม → สร้างสไตล์ชีตใหม่ (สีอ่านจากตัวแปร CSS) */
  new MutationObserver(function () {
    if (!cy) return;
    cy.style(sheet());
    cy.nodes().forEach(function (n) {
      var s = n.data('stroke');
      n.data('fill', fillOf(s));
    });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  window.addEventListener('resize', function () { if (on && cy) cy.resize(); });

  /* ถ้าเปิดหน้ามาแล้วอยู่ในผังเจาะจงอยู่แล้ว */
  if (typeof currentView !== 'undefined' && currentView === 'focus') mount();

  /* ย้ายจุดโฟกัสจากภายนอก (เช่น กดแถวหน่วยงานในแผงงบประมาณ) */
  function focus(key) {
    if (!key) return;
    fxKey = key;
    if (on && cy) { render(key, true); }
    openPanel(key);
  }

  window.FXCY = {
    mount: mount, unmount: unmount, focus: focus,
    cy: function () { return cy; }, isOn: function () { return on; }
  };
})();
