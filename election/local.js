/* local.js — แท็บ "ท้องถิ่น" ในหน้ารายเขต (index.html)
   นายก อบจ. · นายกเทศมนตรี · นายก อบต. + ทีมบริหาร/สภา ของทุก อปท. ในจังหวัด

   ใช้แผนที่ ซูม แผง และแผ่นล่าง (มือถือ) ชุดเดียวกับโหมด ส.ส. ผ่าน window.ELMAP ที่ index.html เปิดไว้
   ตอนเปิดแท็บนี้ ELLOCAL.active = true → index.html ส่งการวาดรายการ/รายละเอียด/ค้นหา/ทูลทิป/การแตะแผนที่มาที่นี่
   ข้อมูล (สร้างด้วย fetch-local.js):
   - local/pao.js       นายก อบจ. 76 จังหวัด (ผลเลือกตั้ง ไทยพีบีเอส + นายกปัจจุบัน NLC) — ใช้ลงสีแผนที่ประเทศ
   - local/pao-team.js  ทีมบริหาร/สภา อบจ. — โหลดตอนกดกางครั้งแรก
   - local/index.js + local/<Slug>.js  เทศบาล/อบต. ทุกแห่ง เฉพาะจังหวัดที่ทำแล้ว (โหลดตอนกดเข้าไป) */
(function () {
  const E = window.ELMAP; if (!E) return;          // ปีเก่า (ผังที่นั่ง) ไม่มีแผนที่รายจังหวัด → ไม่มีแท็บนี้
  const IDX = window.LOCAL_INDEX || {};
  const MODE_KEY = 'md-election-mode', CB_KEY = 'md-local-colorby';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const NODATA = '#D9E5EC';                         // = สีจังหวัดไม่มีข้อมูลของโหมด ส.ส. (style.css มีสีโหมดมืดให้แล้ว)
  const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m6 9 6 6 6-6"/></svg>';
  const ARR = '<svg class="arr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 6 6 6-6 6"/></svg>';

  /* ── ประเภท อปท. ── */
  const TYPES = {
    อบจ: { s: 'อบจ.', l: 'องค์การบริหารส่วนจังหวัด', c: '#6B7F92', r: 0 },
    ทน: { s: 'ทน.', l: 'เทศบาลนคร', c: '#B2457A', r: 1 },
    ทม: { s: 'ทม.', l: 'เทศบาลเมือง', c: '#D08A1E', r: 2 },
    ทต: { s: 'ทต.', l: 'เทศบาลตำบล', c: '#4F86B8', r: 3 },
    อบต: { s: 'อบต.', l: 'องค์การบริหารส่วนตำบล', c: '#7DAF8C', r: 4 },
  };
  const isMuni = o => o.t === 'ทต' || o.t === 'ทม' || o.t === 'ทน';
  /* วันเลือกตั้งทั่วไปรอบล่าสุด — นายกที่เริ่มวาระวันอื่น = ได้ตำแหน่ง "นอกรอบ"
     (เลือกตั้งใหม่หลังนายกคนเดิมพ้นตำแหน่ง / อปท. ที่เพิ่งยกฐานะ / พื้นที่ที่เลื่อนวันเลือกตั้ง) */
  const GENERAL = { อบจ: ['2568-02-01'], ทน: ['2568-05-11'], ทม: ['2568-05-11'], ทต: ['2568-05-11'], อบต: ['2569-01-11', '2569-01-18'] };
  const GEN_LABEL = { อบจ: '1 ก.พ. 2568', ทน: '11 พ.ค. 2568', ทม: '11 พ.ค. 2568', ทต: '11 พ.ค. 2568', อบต: '11 ม.ค. 2569' };
  const termOf = o => !o.m ? 'none' : (GENERAL[o.t] || []).includes(o.m.s) ? 'gen' : 'off';
  /* เพศจากคำนำหน้า: ยศของผู้หญิงมีคำว่า "หญิง" ต่อท้ายเสมอ — ยศที่ไม่มีจึงนับเป็นชาย · ดร./ไม่มีคำนำหน้า = ระบุไม่ได้ */
  function sexOf(n) {
    if (!n) return 'na';
    const w = n.split(/\s/)[0];
    if (/^(นางสาว|นาง)/.test(w)) return 'f';
    if (/^นาย/.test(w)) return 'm';
    if (/หญิง/.test(w)) return 'f';
    if (/^(พล|พัน|ร้อย|นาวา|เรือ|จ่า|ดาบ|สิบ|ว่าที่|จ\.|ส\.|พ\.|ร\.|น\.)/.test(w)) return 'm';
    return 'na';
  }
  const SCHEMES = {
    type: { b: 'ประเภท', key: o => o.t,
      cats: [['อบต', 'อบต.', TYPES.อบต.c], ['ทต', 'เทศบาลตำบล', TYPES.ทต.c], ['ทม', 'เทศบาลเมือง', TYPES.ทม.c], ['ทน', 'เทศบาลนคร', TYPES.ทน.c]],
      note: 'สีพื้นตำบล = อปท. ที่ดูแลทั้งตำบล (ส่วนใหญ่คือ อบต.) · วงกลม ท = ที่ตั้งเทศบาล ซึ่งมักดูแลเฉพาะย่านชุมชน ขอบเขตจริงจึงเล็กกว่ารูปตำบล' },
    term: { b: 'ที่มาของวาระ', key: termOf,
      cats: [['gen', 'เลือกตั้งทั่วไป', '#8FA9BD'], ['off', 'ได้ตำแหน่งนอกรอบ', '#E3B341'], ['none', 'ไม่มีชื่อนายกในระบบ', '#C9CED3']],
      note: 'เลือกตั้งทั่วไปรอบล่าสุด: เทศบาล 11 พ.ค. 2568 · อบต. 11 ม.ค. 2569 — "นอกรอบ" คือเริ่มวาระวันอื่น เช่น เลือกตั้งใหม่หลังนายกคนเดิมพ้นตำแหน่ง หรือ อปท. ที่เพิ่งยกฐานะ' },
    sex: { b: 'เพศนายก', key: o => o.m ? sexOf(o.m.n) : 'na',
      cats: [['m', 'ชาย', '#6E8FB5'], ['f', 'หญิง', '#D0749A'], ['na', 'ระบุจากคำนำหน้าไม่ได้', '#C9CED3']],
      note: 'ดูจากคำนำหน้าชื่อ (นาย / นาง / นางสาว / ยศ) ตามที่บันทึกในระบบ NLC' },
  };
  let colorBy = SCHEMES[lsGet(CB_KEY)] ? lsGet(CB_KEY) : 'type';
  const schemeColor = o => { const S = SCHEMES[colorBy], k = S.key(o), c = S.cats.find(x => x[0] === k); return c ? c[2] : '#C9CED3'; };

  /* ── แผนที่ประเทศ: ลงสีตามนายก อบจ. 76 จังหวัด (local/pao.js) ──
     R = ผลเลือกตั้งนายก อบจ. ครั้งล่าสุดที่ไทยพีบีเอสมีคะแนน + R.nlc = นายกคนปัจจุบันในระบบ NLC
     ถ้านายกปัจจุบันไม่ใช่ผู้ชนะครั้งนั้น (เลือกตั้งใหม่ภายหลัง) → จัดเป็น "เปลี่ยนตัวหลังเลือกตั้ง" ไม่ลงสีตามผลเก่า */
  const PCB_KEY = 'md-local-pcolorby';
  const winOf = R => R && R.cands.find(c => c.win);
  const changed = R => !!(R && R.nlc && R.nlc.n && !R.nlc.same);
  const CHG = ['chg', 'เปลี่ยนตัวหลังเลือกตั้ง', '#B9A6CF'];
  const marginOf = R => R.cands.length < 2 ? null : (R.cands[0].pct || 0) - (R.cands[1].pct || 0);
  const PSCHEMES = {
    aff: { b: 'กลุ่ม/พรรคที่ส่ง', key: R => changed(R) ? 'chg' : (winOf(R).aff ? winOf(R).aff.n : 'local'),
      cats: () => {
        const seen = {}; Object.values(PAO || {}).forEach(R => { const w = winOf(R); if (!changed(R) && w && w.aff) (seen[w.aff.n] = seen[w.aff.n] || { a: w.aff, n: 0 }).n++; });
        return Object.values(seen).sort((a, b) => b.n - a.n).map(x => [x.a.n, x.a.n, x.a.c])
          .concat([['local', 'กลุ่มท้องถิ่น / อิสระ', '#8FA9BD'], CHG]);
      },
      note: 'ตามที่ไทยพีบีเอสระบุว่าผู้ชนะลงสมัครในนามพรรคหรือกลุ่มใด — นายก อบจ. ลงในนามกลุ่มได้ ไม่บังคับสังกัดพรรค' },
    inc: { b: 'แชมป์เก่า', key: R => changed(R) ? 'chg' : R.inc,
      cats: [['win', 'แชมป์เก่าชนะ', '#4D6B85'], ['conn', 'เครือข่าย/เครือญาติแชมป์เก่าชนะ', '#8FB0C8'], ['out', 'คนนอกเครือข่ายเดิมชนะ', '#E3B341'], CHG],
      note: 'แชมป์เก่า = นายก อบจ. คนก่อนหน้า · จัดกลุ่มตามไทยพีบีเอส' },
    margin: { b: 'ส่วนต่างคะแนน', key: R => { if (changed(R)) return 'chg'; const m = marginOf(R); return m == null ? 'single' : m < 5 ? 'm5' : m < 15 ? 'm15' : m < 30 ? 'm30' : 'm99'; },
      cats: [['m5', 'สูสี (ต่างไม่ถึง 5 จุด)', '#E9C46A'], ['m15', 'ต่าง 5–15 จุด', '#9CC3DF'], ['m30', 'ต่าง 15–30 จุด', '#5B95C2'], ['m99', 'นำขาด 30 จุดขึ้นไป', '#2E6A9E'], ['single', 'ผู้สมัครคนเดียว', '#C9CED3'], CHG],
      note: 'ส่วนต่าง = % คะแนนของอันดับ 1 ลบอันดับ 2 (คิดจากผู้มาใช้สิทธิ)' },
    round: { b: 'รอบเลือกตั้ง', key: R => changed(R) ? 'chg' : R.held ? 'held' : 'early',
      cats: [['held', 'เลือกพร้อมกัน 1 ก.พ. 2568', '#7FA7C4'], ['early', 'เลือกไปก่อน (พ.ศ. 2565–2567)', '#C9A86A'], CHG],
      note: 'จังหวัดที่นายกคนก่อนลาออกก่อนครบวาระ ได้เลือกนายกใหม่ไปก่อนแล้ว จึงไม่ได้เลือกพร้อมกันเมื่อ 1 ก.พ. 2568' },
    sex: { b: 'เพศ', key: R => sexOf(R.nlc && R.nlc.n),
      cats: [['m', 'ชาย', '#6E8FB5'], ['f', 'หญิง', '#D0749A'], ['na', 'ระบุจากคำนำหน้าไม่ได้', '#C9CED3']],
      note: 'นายก อบจ. คนปัจจุบัน ดูจากคำนำหน้าชื่อในระบบ NLC' },
  };
  let pcolorBy = PSCHEMES[lsGet(PCB_KEY)] ? lsGet(PCB_KEY) : 'aff';
  const catsOf = S => typeof S.cats === 'function' ? S.cats() : S.cats;
  const pColor = th => { const R = PAO && PAO[th]; if (!R) return NODATA; const S = PSCHEMES[pcolorBy], k = S.key(R), c = catsOf(S).find(x => x[0] === k); return c ? c[2] : '#C9CED3'; };
  function pLegendHTML() {
    if (!PAO) return '';
    const S = PSCHEMES[pcolorBy], cnt = {};
    Object.values(PAO).forEach(R => { const k = S.key(R); cnt[k] = (cnt[k] || 0) + 1; });
    return catsOf(S).filter(c => cnt[c[0]]).map(c => `<span class="li"><span class="sw" style="background:${c[2]}"></span>${esc(c[1])}<b>${cnt[c[0]]}</b></span>`).join('');
  }

  /* ── ไฟล์ข้อมูล อบจ.: pao.js (ผล + นายกปัจจุบัน ~70KB) ตอนเปิดแท็บ · pao-team.js (ทีมบริหาร/สภา อบจ. ~380KB) ตอนกดกางครั้งแรก ── */
  let PAO = window.LOCAL_PAO || null, TEAM = window.LOCAL_PAO_TEAM || null;
  const reqs = {};
  function loadScript(src, get) {
    if (!reqs[src]) reqs[src] = new Promise(res => {
      const s = document.createElement('script'); s.src = src;
      s.onload = () => res(get()); s.onerror = () => { delete reqs[src]; res(null); };
      document.head.appendChild(s);
    });
    return reqs[src];
  }
  const ensurePao = () => PAO ? Promise.resolve(PAO) : loadScript('local/pao.js', () => (PAO = window.LOCAL_PAO || null));
  const ensureTeam = () => TEAM ? Promise.resolve(TEAM) : loadScript('local/pao-team.js', () => (TEAM = window.LOCAL_PAO_TEAM || null));
  // ดัชนีค้นหา อปท. ทุกจังหวัด (โหลดตอนพิมพ์ค้นหาครั้งแรก) · ทีมบริหาร/สภาของเทศบาล-อบต. ทีละจังหวัด (โหลดตอนกดกาง)
  const ensureSearch = () => window.LOCAL_SEARCH ? Promise.resolve(window.LOCAL_SEARCH) : loadScript('local/search.js', () => window.LOCAL_SEARCH || null);
  const provTeam = th => (window.LOCAL_TEAM || {})[th];
  const ensureProvTeam = th => provTeam(th) ? Promise.resolve(provTeam(th))
    : IDX[th] ? loadScript('local/' + IDX[th].s + '-team.js', () => provTeam(th) || null) : Promise.resolve(null);

  /* ── วันที่ (ต้นทางเก็บ พ.ศ. แบบ 2569-01-11) ── */
  const MON = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  function fmtDate(s, short) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); if (!m) return '';
    const y = +m[1] < 2400 ? +m[1] + 543 : +m[1];          // รับ ค.ศ. (ข้อมูลไทยพีบีเอส) ได้ด้วย
    return `${+m[3]} ${MON[+m[2] - 1]} ${short ? String(y).slice(-2) : y}`;
  }

  /* ── โหลดข้อมูลทีละจังหวัด ── */
  const cache = {}, loading = {};
  function ensureLocal(th) {
    if (cache[th]) return Promise.resolve(cache[th]);
    if (!IDX[th]) return Promise.resolve(null);
    if (!loading[th]) loading[th] = new Promise(res => {
      const s = document.createElement('script'); s.src = 'local/' + IDX[th].s + '.js';
      s.onload = () => { cache[th] = (window.LOCAL_DATA || {})[th] || null; res(cache[th]); };
      s.onerror = () => { delete loading[th]; res(null); };
      document.head.appendChild(s);
    });
    return loading[th];
  }
  const byId = (D, id) => D.orgs.find(o => o.id === +id);
  const primaryOrg = (D, key) => { const ids = D.tam[key]; return ids ? byId(D, ids[0]) : null; };
  const tamsOf = (D, id) => Object.keys(D.tam).filter(k => D.tam[k].includes(+id));

  const L = { active: false };
  window.ELLOCAL = L;
  let curD = null, pendingFlash = null;

  /* ── ปุ่มสลับ ส.ส. | ท้องถิ่น (บนสุดของแผง — มือถือเห็นตั้งแต่แผ่นล่างยังย่ออยู่) ── */
  const panel = document.getElementById('panel'), foot = panel.querySelector('.panel-foot');
  const seg = document.createElement('div');
  seg.className = 'modeseg'; seg.setAttribute('role', 'tablist');
  seg.innerHTML = `<button type="button" role="tab" data-m="mp">ส.ส. ${esc(window.EYEAR || '')}</button>` +
    `<button type="button" role="tab" data-m="local">ท้องถิ่น<span class="new">ใหม่</span></button>`;
  (document.getElementById('grabber') || panel.firstChild).after(seg);
  seg.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setMode(b.dataset.m); });
  const mpPh = E.search.placeholder, mpFoot = foot ? foot.innerHTML : '';
  let mpLegend = null;
  const SRC_FOOT = 'ผู้ดำรงตำแหน่ง: <a href="https://nlc.dla.go.th/public/appointment.do" target="_blank" rel="noopener">NLC กรมส่งเสริมการปกครองท้องถิ่น</a> · ผลนายก อบจ.: <a href="https://www.thaipbs.or.th/LocalElection/result" target="_blank" rel="noopener">ไทยพีบีเอส</a> (ไม่เป็นทางการ)';

  function recolor() {
    Object.entries(E.pathEls).forEach(([en, p]) => {
      if (!('mpFill' in p.dataset)) p.dataset.mpFill = p.getAttribute('fill') || '';
      p.setAttribute('fill', L.active ? pColor(E.en2th[en]) : p.dataset.mpFill);
    });
  }
  function legend() {
    if (mpLegend == null) mpLegend = E.legendbar.innerHTML;
    if (!L.active) { E.legendbar.innerHTML = mpLegend; return; }
    E.legendbar.innerHTML = PAO ? `<span class="li lm-lb">นายก อบจ. · ${PSCHEMES[pcolorBy].b}</span>` + pLegendHTML() : '<span class="li">กำลังโหลดข้อมูลนายก อบจ.…</span>';
  }
  function setMode(m, init) {
    const on = m === 'local';
    if (on === L.active && !init) return;
    L.active = on; curD = null;
    if (!init) lsSet(MODE_KEY, on ? 'local' : 'mp');
    document.body.classList.toggle('local-mode', on);
    seg.querySelectorAll('button').forEach(b => { const s = (b.dataset.m === 'local') === on; b.classList.toggle('on', s); b.setAttribute('aria-selected', String(s)); });
    E.search.value = ''; E.search.placeholder = on ? 'ค้นหา ชื่อนายก อปท. ตำบล หรืออำเภอ' : mpPh;
    if (foot) foot.innerHTML = on ? SRC_FOOT : mpFoot;
    recolor(); legend();
    E.tip.classList.remove('on');
    E.backToAll();                       // วาดรายการใหม่ (renderList → ฮุก) + บินกลับมุมมองทั้งประเทศ
    // เปิดแท็บครั้งแรก: โหลดผลนายก อบจ. แล้วค่อยลงสีแผนที่ประเทศ + วาดรายการใหม่
    if (on && !PAO) ensurePao().then(() => { if (!L.active) return; recolor(); legend(); if (!E.curProvince && !E.search.value) L.renderList(); });
  }
  // สลับธีมสว่าง/มืด → ลงสีใหม่ (สีจังหวัดไม่มีข้อมูลต้องตามธีม)
  new MutationObserver(() => { if (L.active) { recolor(); legend(); } })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  function setPScheme(k) {
    pcolorBy = k; lsSet(PCB_KEY, k); recolor(); legend();
    E.panelScroll.querySelectorAll('.lm-pcb button').forEach(b => b.classList.toggle('on', b.dataset.pcb === k));
    const lg = E.panelScroll.querySelector('.lm-plegend'); if (lg) lg.innerHTML = pLegendHTML() + `<div class="lm-lnote">${PSCHEMES[k].note}</div>`;
    E.panelScroll.querySelectorAll('.prow .dot').forEach(d => { d.style.background = pColor(d.closest('.prow').dataset.prov); });
  }

  /* ── ฮุกที่ index.html เรียก ── */
  L.canSelect = th => !!((PAO && PAO[th]) || IDX[th]);
  L.provTip = th => {
    const R = PAO && PAO[th];
    if (!R) return `<div class="tt-prov">${esc(th)}</div><div style="font-size:.78rem;opacity:.85">${th === 'กรุงเทพมหานคร' ? 'ไม่มี อบจ./เทศบาล/อบต. — ดูหน้า กทม.' : PAO ? 'ไม่มีข้อมูลนายก อบจ.' : 'กำลังโหลด…'}</div>`;
    const w = winOf(R), cur = R.nlc && R.nlc.n;
    return `<div class="tt-prov">${esc(th)}</div><div class="tt-win"><span class="sw" style="background:${pColor(th)}"></span>นายก อบจ. ${esc(cur || (w && w.n))}</div>` +
      `<div class="tt-mix">${changed(R) ? 'เปลี่ยนตัวหลังเลือกตั้ง · เริ่มวาระ ' + fmtDate(R.nlc.s) : esc((w.aff ? w.aff.n : w.g) || '') + (w.badge ? ' · ' + esc(w.badge) : '')}${IDX[th] ? ` · มีครบ ${IDX[th].n} อปท.` : ''}</div>`;
  };

  L.renderList = function () {
    curD = null;
    const P = E.panelScroll;
    if (!PAO) { P.innerHTML = '<div class="empty">กำลังโหลดข้อมูลนายก อบจ.…</div>'; return; }
    const provs = Object.keys(PAO).sort((a, b) => a.localeCompare(b, 'th'));
    const full = Object.keys(IDX).sort((a, b) => a.localeCompare(b, 'th'));
    const allFull = provs.every(th => IDX[th]);                 // ครบทุกจังหวัดแล้ว → ไม่ต้องติดป้าย "ครบทุก อปท." ทีละแถว
    const nOrg = Object.values(IDX).reduce((a, x) => a + x.n, 0);
    P.innerHTML = `<div class="lm-intro"><b>การเมืองท้องถิ่น</b>` + (allFull
      ? `นายก อบจ. · นายกเทศมนตรี · นายก อบต. ครบ ${E.fmtN(nOrg)} แห่งใน 76 จังหวัด พร้อมทีมบริหารและสภาท้องถิ่น — แตะจังหวัดเพื่อดูทุกแห่ง`
      : `นายก อบจ. ครบ 76 จังหวัด พร้อมผลเลือกตั้งและสภา อบจ. · จังหวัดที่ขึ้น "ครบทุก อปท." ดูนายกเทศมนตรีและนายก อบต. ได้ทุกแห่ง`) + `</div>
      <div class="lm-colorby lm-pcb"><span>ลงสีแผนที่ตาม</span>${Object.entries(PSCHEMES).map(([k, S]) =>
        `<button type="button" data-pcb="${k}"${k === pcolorBy ? ' class="on"' : ''}>${S.b}</button>`).join('')}</div>
      <div class="lm-legend lm-plegend">${pLegendHTML()}<div class="lm-lnote">${PSCHEMES[pcolorBy].note}</div></div>
      <div class="list-head">นายก อบจ. <span class="cnt">${provs.length} จังหวัด</span></div>` +
      provs.map(th => { const R = PAO[th], w = winOf(R), cur = (R.nlc && R.nlc.n) || (w && w.n) || '';
        const sub = changed(R) ? 'เปลี่ยนตัวหลังเลือกตั้ง' : (w && (w.aff ? w.aff.s : w.g)) || '';
        return `<div class="prow lm-prow" data-prov="${esc(th)}"><span class="dot" style="background:${pColor(th)}"></span>` +
          `<span class="pn">${esc(th)}<small>${esc(cur)}${sub ? ' · ' + esc(sub) : ''}</small></span>` +
          `${IDX[th] ? (allFull ? `<span class="zc"><b>${IDX[th].n}</b> อปท.</span>` : `<span class="lm-full">ครบทุก อปท.</span>`) : ''}${ARR}</div>`; }).join('') +
      `<div class="dnote">${allFull ? '' : `เทศบาล &amp; อบต. ครบทุกแห่ง: ${full.map(esc).join(', ') || '—'} · `}` +
      `กรุงเทพมหานครไม่มี อบจ./เทศบาล/อบต. (ดูผู้ว่าฯ และ ส.ก. ที่<a href="bangkok.html">หน้า กทม.</a>)</div>` +
      `<div class="dnote">ผลเลือกตั้งนายก อบจ.: ไทยพีบีเอส (ไม่เป็นทางการ) · นายกคนปัจจุบันและสภา: ระบบ NLC ของกรมส่งเสริมการปกครองท้องถิ่น ` +
      `ข้อมูล ณ ${fmtDate((window.LOCAL_PAO_META || {}).updated)} — เทศบาลและ อบต. ยังไม่มีแหล่งคะแนนที่เป็นตาราง</div>`;
    P.querySelectorAll('.prow').forEach(r => {
      r.onclick = () => E.selectProvince(r.dataset.prov);
      r.onmouseenter = () => { const p = E.pathEls[E.th2en[r.dataset.prov]]; if (p && !E.curProvince) p.classList.add('sel'); };
      r.onmouseleave = () => { const p = E.pathEls[E.th2en[r.dataset.prov]]; if (p && !E.curProvince) p.classList.remove('sel'); };
    });
  };

  L.renderDetail = function (th) {
    const P = E.panelScroll;
    P.innerHTML = `<div class="dback lm-back">‹ กลับไปทุกจังหวัด</div><div class="empty">กำลังโหลดข้อมูลท้องถิ่น…</div>`;
    P.querySelector('.lm-back').onclick = () => E.backToAll();
    E.clearMarkers(); curD = null;
    Promise.all([ensurePao(), ensureLocal(th)]).then(([, D]) => {
      if (!L.active || E.curProvince !== th) return;           // เปลี่ยนจังหวัด/แท็บระหว่างโหลด → ทิ้ง
      if (D) { curD = D; drawPanel(th, D); drawMap(th, D); }
      else if (PAO && PAO[th]) drawPaoOnly(th);
      else { P.querySelector('.empty').textContent = 'โหลดข้อมูลท้องถิ่นของจังหวัดนี้ไม่สำเร็จ'; return; }
      if (pendingFlash) { const id = pendingFlash; pendingFlash = null; setTimeout(() => flashOrg(id), 420); }
    });
  };

  L.renderSearch = function (q) {
    q = q.trim().toLowerCase();
    if (!q) { E.curProvince ? L.renderDetail(E.curProvince) : L.renderList(); return; }
    E.clearMarkers(); curD = null;
    Promise.all([ensurePao(), ensureSearch()]).then(([, S]) => {
      if (!L.active || E.search.value.trim().toLowerCase() !== q) return;
      const hits = [];
      /* นายก อบจ. + ผู้สมัครนายก อบจ. ทุกจังหวัด (ค้นด้วยชื่อจังหวัดก็เจอ) */
      Object.entries(PAO || {}).forEach(([th, R]) => {
        const cur = (R.nlc && R.nlc.n) || '';
        if ((th + ' ' + cur).toLowerCase().includes(q)) { hits.push({ th, pao: true, why: '' }); return; }
        const c = R.cands.find(c => c.n.toLowerCase().includes(q) || (c.g || '').toLowerCase().includes(q));
        if (c) hits.push({ th, pao: true, why: `ผู้สมัครนายก อบจ. ${fmtDate(R.date)} · ${c.n}${c.v != null ? ' · ' + E.fmtN(c.v) + ' คะแนน' : ''}${c.win ? ' (ชนะ)' : ''}` });
      });
      /* เทศบาล/อบต. ทุกจังหวัดที่มีข้อมูล (ดัชนี search.js) — ชื่อ อปท. ทั้งแบบย่อ/เต็ม อำเภอ ตำบล ชื่อนายก */
      const seen = new Set();
      if (S) S.r.forEach(r => {
        const T = TYPES[r[2]] || TYPES.อบต, th = S.p[r[0]];
        const hay = [T.s + r[3], T.l + r[3], r[4], r[5], r[6], th].join(' ').toLowerCase();
        if (!hay.includes(q)) return;
        seen.add(r[1]);
        hits.push({ th, o: { id: r[1], t: r[2], n: r[3], amp: r[4], tam: r[5], m: r[6] ? { n: r[6], s: r[7] } : null }, why: '' });
      });
      /* ชื่อทีมบริหาร/สมาชิกสภา: ค้นได้เฉพาะจังหวัดที่เปิดดู (โหลดไฟล์ทีมแล้ว) */
      Object.entries(window.LOCAL_TEAM || {}).forEach(([th, TM]) => { const D = cache[th]; if (!D) return;
        D.orgs.forEach(o => { const t = TM[o.id]; if (!t || seen.has(o.id) || o.t === 'อบจ') return;
          const p = [...t.x, ...t.c].find(p => p.n.toLowerCase().includes(q)); if (p) hits.push({ th, o, why: p.p + ' · ' + p.n }); }); });
      const P = E.panelScroll;
      if (!hits.length) { P.innerHTML = '<div class="empty">ไม่พบชื่อหรือพื้นที่ที่ตรงกับคำค้น · เทศบาล/อบต. ค้นได้เฉพาะจังหวัดที่มีข้อมูลครบแล้ว</div>'; return; }
      P.innerHTML = `<div class="list-head">ผลการค้นหา <span class="cnt">${hits.length} แห่ง</span></div>` +
        hits.slice(0, 120).map(h => h.pao ? paoCard(h.th, h.why) : orgCard(h.o, h.th, h.why)).join('') +
        (hits.length > 120 ? `<div class="empty">แสดง 120 แห่งแรกจาก ${hits.length}</div>` : '');
      P.querySelectorAll('.lm-org').forEach(c => c.onclick = () => {
        E.search.value = ''; pendingFlash = +c.dataset.org; E.selectProvince(c.dataset.prov);
      });
    });
  };

  L.tapTambon = function (el) {
    if (!curD) return;
    const ids = curD.tam[el.dataset.key] || [];
    if (ids.length) { if (E.isMobile()) E.expandSheet(true); flashOrg(ids[0]); }
  };
  L.tapMarker = function (id) { if (curD) { if (E.isMobile()) E.expandSheet(true); flashOrg(+id); } };

  /* ── แผงรายละเอียดจังหวัด ── */
  const byType = (a, b) => (TYPES[a.t].r - TYPES[b.t].r) || a.n.localeCompare(b.n, 'th');
  function drawPanel(th, D) {
    const P = E.panelScroll, C = D.counts;
    const rest = D.orgs.filter(o => o.t !== 'อบจ');
    const amps = {}; rest.forEach(o => (amps[o.amp] = amps[o.amp] || []).push(o));
    const ampNames = Object.keys(amps).sort((a, b) => a.startsWith('เมือง') ? -1 : b.startsWith('เมือง') ? 1 : a.localeCompare(b, 'th'));
    P.innerHTML = `<div class="dback lm-back">‹ กลับไปทุกจังหวัด</div>
      <div class="dhead"><div class="dn">${esc(th)}</div>
        <div class="dmeta"><span>${D.orgs.length} องค์กรปกครองส่วนท้องถิ่น</span></div>
        <div class="lm-cnts">${['อบจ', 'ทน', 'ทม', 'ทต', 'อบต'].filter(k => C[k]).map(k =>
          `<span class="lm-cnt"><i style="background:${TYPES[k].c}"></i>${TYPES[k].s} <b>${C[k]}</b></span>`).join('')}</div></div>
      <div class="lm-colorby"><span>ลงสีแผนที่ตาม</span>${Object.entries(SCHEMES).map(([k, S]) =>
        `<button type="button" data-cb="${k}"${k === colorBy ? ' class="on"' : ''}>${S.b}</button>`).join('')}</div>
      <div class="lm-legend"></div>
      ${PAO && PAO[th] ? `<div class="lm-sec">องค์การบริหารส่วนจังหวัด</div>${paoCard(th)}` : ''}
      <div class="lm-sec">เทศบาล &amp; อบต. <span>${rest.length} แห่ง · ${ampNames.length} อำเภอ</span></div>
      ${ampNames.map(a => `<div class="lm-amp">อ.${esc(a)}<span>${amps[a].length} แห่ง</span></div>` +
        amps[a].sort(byType).map(o => orgCard(o)).join('')).join('')}
      <div class="dnote">ข้อมูล ณ ${fmtDate(D.updated)} จากระบบ NLC ของกรมส่งเสริมการปกครองท้องถิ่น — แต่ละ อปท. บันทึกเอง ` +
      `อาจคลาดจากประกาศ กกต. ได้ · ชื่อที่ไม่มีรูปแสดงเป็นอักษรย่อ</div>`;
    P.querySelector('.lm-back').onclick = () => E.backToAll();
    paintLegend();
    P.scrollTop = 0;
  }
  function paintLegend() {
    const el = E.panelScroll.querySelector('.lm-legend'); if (!el || !curD) return;
    const S = SCHEMES[colorBy], cnt = {};
    curD.orgs.filter(o => o.t !== 'อบจ').forEach(o => { const k = S.key(o); cnt[k] = (cnt[k] || 0) + 1; });
    el.innerHTML = S.cats.filter(c => cnt[c[0]]).map(c =>
      `<span class="li"><span class="sw" style="background:${c[2]}"></span>${c[1]}<b>${cnt[c[0]]}</b></span>`).join('') +
      `<span class="li"><span class="lm-mkdot">ท</span>ที่ตั้งเทศบาล</span><div class="lm-lnote">${S.note}</div>`;
    E.panelScroll.querySelectorAll('.lm-colorby button').forEach(b => b.classList.toggle('on', b.dataset.cb === colorBy));
  }
  function orgCard(o, prov, why) {
    const T = TYPES[o.t] || TYPES.อบต, m = o.m, st = termOf(o);
    // จำนวนทีมอยู่ในไฟล์หลัก (nx/nc) — รายชื่อเต็มอยู่ใน <Slug>-team.js · o.x/o.c = ไฟล์รูปแบบเก่าที่ยังรวมรายชื่อไว้
    const nx = o.x ? o.x.length : (o.nx || 0), seats = o.c ? o.c.filter(p => p.p !== 'เลขานุการสภา').length : (o.nc || 0);
    return `<div class="ccard lm-org" data-org="${o.id}"${prov ? ` data-prov="${esc(prov)}"` : ''}>
      <div class="cav" style="background:${schemeColor(o)}">${m ? esc(E.initialOf(m.n)) : '–'}</div>
      <div class="cinfo">
        <div class="ctop"><span class="cname">${m ? esc(m.n) : '<i>ไม่มีชื่อนายกในระบบ</i>'}</span><span class="cdist">${prov ? esc(prov) : 'นายก ' + T.s}</span></div>
        <div class="cbot"><span class="lm-tb" style="--c:${T.c}">${T.s}</span><span class="lm-on">${esc(o.n)}</span>${m && m.s ? `<span class="cvt">ตั้งแต่ ${fmtDate(m.s, true)}</span>` : ''}</div>
        ${why ? `<div class="lm-why">${esc(why)}</div>` : ''}
        ${!prov && st === 'off' ? `<div class="lm-flag">ได้ตำแหน่ง ${fmtDate(m.s)} · ไม่ได้มาจากรอบเลือกตั้งทั่วไป (${T.s === 'อบต.' ? 'อบต.' : 'เทศบาล'} ทั่วประเทศเลือกตั้งเมื่อ ${GEN_LABEL[o.t]})</div>` : ''}
        ${!prov && (nx || seats) ? `<div class="lm-more" data-org="${o.id}">ทีมบริหาร ${nx} · สภา ${seats} คน${CHEV}</div>` : ''}
      </div></div>`;
  }
  /* การ์ดนายก อบจ. — why != null = ใช้ในผลการค้นหา (แตะแล้วพาไปจังหวัดนั้น) */
  function paoCard(th, why) {
    const R = PAO[th], w = winOf(R), cur = R.nlc || {}, chg = changed(R), search = why != null;
    const name = cur.n || (w && w.n) || '';
    const grp = w && (w.aff ? `<span class="lm-grp"><span class="sw" style="background:${w.aff.c}"></span>${esc(w.aff.n)}</span>` : w.g ? `<span class="lm-grp">${esc(w.g)}</span>` : '');
    return `<div class="ccard lm-org lm-pao" data-org="${cur.id || ''}"${search ? ` data-prov="${esc(th)}"` : ''}>
      <div class="cav" style="background:${pColor(th)}">${name ? esc(E.initialOf(name)) : '–'}</div>
      <div class="cinfo">
        <div class="ctop"><span class="cname">${name ? esc(name) : '<i>ไม่มีชื่อนายกในระบบ</i>'}</span><span class="cdist">นายก อบจ.${esc(th)}</span></div>
        <div class="cbot">${!chg ? grp : ''}${!chg && w && w.badge ? `<span class="lm-badge">${esc(w.badge)}</span>` : ''}${cur.s ? `<span class="cvt">ตั้งแต่ ${fmtDate(cur.s, true)}</span>` : ''}</div>
        ${why ? `<div class="lm-why">${esc(why)}</div>` : ''}
        ${!search && !chg && w && w.v != null ? `<div class="lm-paov">${E.fmtN(w.v)} คะแนน · ${w.pct}% ของผู้มาใช้สิทธิ<span class="lm-unof">ไม่เป็นทางการ</span></div>` : ''}
        ${!search && chg ? `<div class="lm-flag">นายกคนปัจจุบันเริ่มวาระ ${fmtDate(cur.s)} — ไม่ใช่ผู้ชนะการเลือกตั้ง ${fmtDate(R.date)} (${esc(w.n)}) ที่มีคะแนนด้านล่าง · ยังไม่มีคะแนนของการเลือกตั้งครั้งใหม่</div>` : ''}
        ${!search && !chg && !R.held ? `<div class="lm-why">เลือกตั้ง ${fmtDate(R.date)} — ก่อนรอบใหญ่ 1 ก.พ. 2568 เพราะนายกคนก่อนลาออกก่อนครบวาระ</div>` : ''}
        ${!search ? `<div class="lm-more" data-pao="${esc(th)}">ผลเลือกตั้ง ${fmtDate(R.date)} · ทีมบริหาร · สภา อบจ.${CHEV}</div>` : ''}
      </div></div>`;
  }
  /* จังหวัดที่ยังไม่มีข้อมูลเทศบาล/อบต.: แสดงเฉพาะนายก อบจ. (แผนที่ลงสีทั้งจังหวัดตามโหมดสีประเทศ) */
  function drawPaoOnly(th) {
    const P = E.panelScroll;
    P.innerHTML = `<div class="dback lm-back">‹ กลับไปทุกจังหวัด</div>
      <div class="dhead"><div class="dn">${esc(th)}</div><div class="dmeta"><span>องค์การบริหารส่วนจังหวัด</span></div></div>
      ${paoCard(th)}
      <div class="dnote">นายกเทศมนตรีและนายก อบต. ของจังหวัดนี้ยังไม่มีในเว็บ</div>`;
    P.querySelector('.lm-back').onclick = () => E.backToAll();
    P.scrollTop = 0;
  }
  function teamHTML(o) {
    const rows = list => list.map(p => `<div class="lm-p"><span class="lm-pp">${esc(p.p)}</span><span class="lm-pn">${esc(p.n)}</span>${p.s ? `<span class="lm-ps">${fmtDate(p.s, true)}</span>` : ''}</div>`).join('');
    const heads = o.c.filter(p => p.p !== 'สมาชิกสภา'), mem = o.c.filter(p => p.p === 'สมาชิกสภา');
    const info = [o.area ? `พื้นที่ ${o.area} ตร.กม.` : '', o.vil ? `${o.vil} หมู่บ้าน` : '', o.year ? `จัดตั้ง พ.ศ. ${o.year}` : ''].filter(Boolean).join(' · ');
    return (o.x.length ? `<div class="lm-tg"><div class="lm-th">ฝ่ายบริหาร (นายกแต่งตั้ง)</div>${rows(o.x)}</div>` : '') +
      (o.c.length ? `<div class="lm-tg"><div class="lm-th">ฝ่ายสภา</div>${rows(heads)}` +
        (mem.length ? `<div class="lm-mh">สมาชิกสภาอีก ${mem.length} คน</div><div class="lm-mem">${mem.map(p => `<span>${esc(p.n)}</span>`).join('')}</div>` : '') + `</div>` : '') +
      (info ? `<div class="lm-info">${info}</div>` : '');
  }
  function paoResultHTML(R) {
    if (!R) return '';
    const s = R.stats || {}, cell = (k, v) => v == null ? '' : `<div class="cdst"><span>${k}</span><b>${E.fmtN(v)}</b></div>`;
    const rows = R.cands.map(c => `<tr${c.win ? ' class="win"' : ''}><td class="n">${c.b}</td>
        <td class="nm">${esc(c.n)}${c.badge ? `<span class="gp">${esc(c.badge)}</span>` : ''}</td>
        <td class="pt">${c.aff ? `<span class="sw" style="background:${c.aff.c}"></span>${esc(c.aff.s)}` : esc(c.g || '–')}</td>
        <td class="v">${c.v == null ? '–' : E.fmtN(c.v)}</td><td class="p">${c.pct == null ? '' : c.pct + '%'}</td></tr>`).join('');
    return `<div class="lm-th">ผลเลือกตั้งนายก อบจ. ${fmtDate(R.date)}${changed(R) ? ' (ครั้งก่อน)' : ''}</div>
      <div class="cdstats">${cell('ผู้มาใช้สิทธิ', s.turnout)}${cell('บัตรดี', s.valid)}${cell('บัตรเสีย', s.invalid)}${cell('ไม่ประสงค์ลงคะแนน', s.blank)}</div>
      <table class="cdtab"><thead><tr><th>เบอร์</th><th>ผู้สมัคร</th><th>พรรค/กลุ่มที่ส่ง</th><th>คะแนน</th><th>%</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="lm-note">คะแนนอย่างไม่เป็นทางการ รวบรวมโดยไทยพีบีเอส · % คิดจากผู้มาใช้สิทธิ · พรรค/กลุ่มที่ส่ง ตามที่ไทยพีบีเอสระบุ` +
      `${R.src === 'counting' ? ' · ⚠ ไทยพีบีเอสยังบันทึกจังหวัดนี้ไว้เป็น "ระหว่างนับคะแนน"' : ''}</div>`;
  }

  /* แตะการ์ด = ชี้ตำแหน่งบนแผนที่ · แตะแถบ "ทีมบริหาร & สภา" = กาง/พับ · ปุ่มลงสี = เปลี่ยนสีแผนที่ */
  E.panelScroll.addEventListener('click', e => {
    if (!L.active) return;
    const pcb = e.target.closest('.lm-pcb button');
    if (pcb) { setPScheme(pcb.dataset.pcb); return; }
    const cb = e.target.closest('.lm-colorby button');
    if (cb) { if (curD) { colorBy = cb.dataset.cb; lsSet(CB_KEY, colorBy); applyScheme(); } return; }
    const more = e.target.closest('.lm-more');
    if (more) {
      const box = more.nextElementSibling;
      if (box && box.classList.contains('cdet')) { box.remove(); more.classList.remove('open'); return; }
      const th = more.dataset.pao, o = !th && curD && byId(curD, more.dataset.org);
      if (!th && !o) return;
      more.classList.add('open');
      const el = document.createElement('div'); el.className = 'cdet';
      if (o && o.x) el.innerHTML = teamHTML(o);
      else if (o) {
        el.innerHTML = '<div class="cdmiss">กำลังโหลดทีมบริหารและสภา…</div>';
        ensureProvTeam(curD.prov).then(TM => { const t = TM && TM[o.id];
          el.innerHTML = t ? teamHTML({ ...o, x: t.x, c: t.c }) : '<div class="cdmiss">โหลดรายชื่อทีมบริหาร/สภาไม่สำเร็จ</div>'; });
      }
      else {                                            // อบจ.: ผลเลือกตั้งขึ้นทันที · ทีมบริหาร/สภา รอไฟล์ pao-team.js
        el.innerHTML = paoResultHTML(PAO[th]) + '<div class="cdmiss lm-teamwait">กำลังโหลดทีมบริหารและสภา อบจ.…</div>';
        ensureTeam().then(T => { const w = el.querySelector('.lm-teamwait'); if (!w) return;
          const t = T && T[th]; w.outerHTML = t ? teamHTML({ x: t.x, c: t.c }) : '<div class="cdmiss">โหลดรายชื่อทีมบริหาร/สภา อบจ. ไม่สำเร็จ</div>'; });
      }
      more.after(el);
      return;
    }
    if (e.target.closest('.cdet')) return;
    const card = e.target.closest('.lm-org');
    if (card && !card.dataset.prov && curD) pointOrg(+card.dataset.org);
  });
  function applyScheme() {
    if (!curD) return;
    E.dg.querySelectorAll('.lm-tam').forEach(p => { const o = primaryOrg(curD, p.dataset.key); p.setAttribute('fill', o ? schemeColor(o) : '#c2b8ac'); });
    E.mkG.querySelectorAll('.lm-mk').forEach(g => { const o = byId(curD, g.dataset.no); if (o) g.style.setProperty('--c', schemeColor(o)); });
    E.panelScroll.querySelectorAll('.lm-org:not(.lm-pao)').forEach(c => { const o = byId(curD, c.dataset.org), av = c.querySelector('.cav'); if (o && av) av.style.background = schemeColor(o); });
    paintLegend();
  }
  function pointOrg(id) {
    if (!curD) return;                                   // หน้าที่มีแค่ อบจ. ไม่มีโมเสกตำบลให้ชี้
    const keys = tamsOf(curD, id);
    E.dg.querySelectorAll('.lm-tam').forEach(p => p.classList.toggle('lm-hl', keys.includes(p.dataset.key)));
    const mk = E.mkG.querySelector(`.lm-mk[data-no="${id}"]`); if (mk) { mk.classList.add('flash'); setTimeout(() => mk.classList.remove('flash'), 1500); }
    clearTimeout(pointOrg.t); pointOrg.t = setTimeout(() => E.dg.querySelectorAll('.lm-hl').forEach(p => p.classList.remove('lm-hl')), 1800);
  }
  function flashOrg(id) {
    const c = E.panelScroll.querySelector(`.lm-org[data-org="${id}"]`);
    if (c) { c.classList.add('flash'); c.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => c.classList.remove('flash'), 1500); }
    pointOrg(id);
  }

  /* ── แผนที่: โมเสกตำบลลงสีตาม อปท. เจ้าของตำบล + วงกลม "ท" ที่ตั้งเทศบาล ── */
  function insidePoint(p) {
    const bb = p.getBBox(), cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
    const inF = (x, y) => { const pt = E.svg.createSVGPoint(); pt.x = x; pt.y = y; try { return p.isPointInFill(pt); } catch (_) { return true; } };
    if (inF(cx, cy)) return [cx, cy];
    let best = null, bd = Infinity; const g = 9;           // รูปตำบลเว้า/เป็นเกาะ → หาจุดในรูปที่ใกล้กึ่งกลางที่สุด
    for (let i = 0; i < g; i++) for (let j = 0; j < g; j++) {
      const x = bb.x + bb.width * (i + .5) / g, y = bb.y + bb.height * (j + .5) / g;
      if (inF(x, y)) { const d = (x - cx) ** 2 + (y - cy) ** 2; if (d < bd) { bd = d; best = [x, y]; } }
    }
    return best || [cx, cy];
  }
  function tamTip(t) {
    const key = t.amp + '|' + t.tam, ids = curD.tam[key] || [];
    return `<div class="tt-prov">ต.${esc(t.tam)} · อ.${esc(t.amp)}</div>` + ids.map(id => { const o = byId(curD, id);
      return `<div class="tt-win"><span class="sw" style="background:${schemeColor(o)}"></span>${TYPES[o.t].s}${esc(o.n)} — ${o.m ? esc(o.m.n) : 'ไม่มีชื่อนายก'}</div>`; }).join('') +
      (!ids.length ? '<div class="tt-mix">ยังระบุ อปท. ที่ดูแลตำบลนี้ไม่ได้</div>'
        : (curD.approx || []).includes(key) ? '<div class="tt-mix">ไม่มี อปท. ตั้งสำนักงานในตำบลนี้ — โดยประมาณคืออยู่ในเขตเทศบาลข้างต้น</div>' : '');
  }
  /* รูปตำบล: ใช้ไฟล์ของปีที่เลือกถ้ามี (เส้นตำบลเหมือนกันทุกปี ต่างกันแค่เลขเขต)
     ปีที่ไม่มีรูปเขต (เช่น 2495) โหลดไฟล์ฐานเอง แล้ว "ไม่" ทิ้งไว้ใน DISTRICT_SHAPES
     — ไม่งั้นโหมด ส.ส. ของปีที่แบ่งเขตต่างไปจะหยิบไปลงสีผิดเขต */
  const baseShapes = {};
  function ensureShapes(th, cb) {
    E.ensureDistrict(th, ok => {
      if (ok && E.getDist(th)) return cb(E.getDist(th));
      if (th in baseShapes) return cb(baseShapes[th]);
      const sl = (window.DISTRICT_INDEX || {})[th]; if (!sl) return cb(null);
      const s = document.createElement('script'); s.src = 'district-shapes/' + sl + '.js';
      s.onload = () => { const DS = window.DISTRICT_SHAPES || {}; baseShapes[th] = DS[th] || null; delete DS[th]; cb(baseShapes[th]); };
      s.onerror = () => cb(null);
      document.head.appendChild(s);
    });
  }
  function drawMap(th, D) {
    ensureShapes(th, S => {
      if (!S || !L.active || E.curProvince !== th || curD !== D) return;
      E.prepDistrict(th);
      const frag = document.createDocumentFragment(), tamEls = {};
      S.tambons.forEach(t => {
        const key = t.amp + '|' + t.tam, o = primaryOrg(D, key);
        const p = document.createElementNS(E.NS, 'path');
        p.setAttribute('d', t.d); p.setAttribute('class', 'tam lm-tam');
        p.setAttribute('fill', o ? schemeColor(o) : '#c2b8ac'); p.dataset.key = key;
        if (E.canHover) {
          p.addEventListener('mouseenter', e => { E.tip.innerHTML = tamTip(t); E.tip.classList.add('on'); E.moveTip(e); });
          p.addEventListener('mousemove', E.moveTip);
          p.addEventListener('mouseleave', () => E.tip.classList.remove('on'));
        }
        frag.appendChild(p); tamEls[key] = p;
      });
      E.dg.appendChild(frag);
      const muni = D.orgs.filter(isMuni), r = E.mkRadius(muni.length), used = {};
      muni.forEach(o => {
        const key = tamsOf(D, o.id)[0], p = key && tamEls[key]; if (!p) return;
        let [x, y] = insidePoint(p);
        const k = used[key] = (used[key] || 0) + 1; if (k > 1) x += r * 2.2 * (k - 1);   // หลายเทศบาลในตำบลเดียว → เรียงข้างกัน
        const g = document.createElementNS(E.NS, 'g'); g.setAttribute('class', 'mk lm-mk'); g.dataset.no = o.id;
        g.style.setProperty('--c', schemeColor(o));
        const c = document.createElementNS(E.NS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r);
        const tx = document.createElementNS(E.NS, 'text'); tx.setAttribute('x', x); tx.setAttribute('y', y); tx.setAttribute('font-size', r * 1.05); tx.textContent = 'ท';
        g.appendChild(c); g.appendChild(tx);
        if (E.canHover) {
          g.addEventListener('mouseenter', e => { E.tip.innerHTML = `<div class="tt-prov">${TYPES[o.t].l}${esc(o.n)}</div><div class="tt-win"><span class="sw" style="background:${schemeColor(o)}"></span>นายก ${o.m ? esc(o.m.n) : '—'}</div>`; E.tip.classList.add('on'); E.moveTip(e); });
          g.addEventListener('mousemove', E.moveTip);
          g.addEventListener('mouseleave', () => E.tip.classList.remove('on'));
        }
        E.mkG.appendChild(g);
      });
      E.mkG.dataset.n = muni.length; delete E.mkG.dataset.rcap;
      E.scaleMarkers(); E.updateLabels(true);
    });
  }

  /* ── เริ่มต้น: ?mode=local|mp มาก่อน แล้วค่อยดูแท็บที่เปิดค้างไว้ครั้งก่อน ── */
  const qm = new URLSearchParams(location.search).get('mode');
  const start = qm === 'local' || qm === 'mp' ? qm : (lsGet(MODE_KEY) === 'local' ? 'local' : 'mp');
  if (start === 'local') setMode('local', true);
  else seg.querySelector('[data-m="mp"]').classList.add('on');
})();
