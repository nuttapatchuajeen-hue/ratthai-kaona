/* เสียงผู้ใช้ (#voices) — ข้อเสนอแนะจากแบบประเมินความพึงพอใจ
   ค่าตั้งต้น = ผลจริงจากบทที่ 4 ผลการวิจัย (n = 30)
   ถ้า API มีข้อเสนอแนะปลายเปิดของผู้ใช้จริงอยู่ จะดึงมาเสริมไว้ด้านบน */
(function () {
  var API = 'https://md-ai-proxy-nook.netlify.app/api/survey';

  /* ประเด็นข้อเสนอแนะ 3 ข้อ + จุดแข็ง 3 ด้าน — ตัวเลขทั้งหมดมาจากเล่มรายงาน */
  var FINDINGS = [
    {
      text: 'ควรปรับปรุงข้อมูลให้เป็นปัจจุบันอย่างต่อเนื่อง และจัดหมวดหมู่เนื้อหาในแต่ละหน้าให้ค้นหาได้ง่ายขึ้น',
      name: 'ประเด็นที่ 1 · ความเป็นปัจจุบันของข้อมูล',
      role: 'ด้านเนื้อหา · x̄ 4.47',
      badge: '01'
    },
    {
      text: 'ควรปรับปรุงความเร็วในการโหลดหน้าเว็บที่มีแผนภาพและแผนภูมิจำนวนมาก โดยเฉพาะเมื่อใช้งานผ่านโทรศัพท์มือถือ',
      name: 'ประเด็นที่ 2 · ความเร็วในการแสดงผล',
      role: 'ค่าเฉลี่ยต่ำสุดของฉบับ · x̄ 4.43',
      badge: '02'
    },
    {
      text: 'ควรพัฒนาผู้ช่วยปัญญาประดิษฐ์ (AI) ให้ตอบคำถามได้ครอบคลุมและหลากหลายยิ่งขึ้น',
      name: 'ประเด็นที่ 3 · ผู้ช่วย AI',
      role: 'ผู้ใช้เห็นประโยชน์ · x̄ 4.60',
      badge: '03'
    },
    {
      text: 'เว็บไซต์มีประโยชน์และนำข้อมูลไปใช้ต่อได้จริง เป็นด้านที่ผู้ตอบให้คะแนนสูงที่สุด',
      name: 'ด้านประโยชน์และการนำไปใช้',
      role: 'x̄ 4.58 · S.D. 0.58 · มากที่สุด',
      badge: '★'
    },
    {
      text: 'การออกแบบและการจัดรูปแบบเว็บไซต์อ่านง่าย สวยงาม และเป็นระเบียบ',
      name: 'ด้านการออกแบบเว็บไซต์',
      role: 'x̄ 4.57 · S.D. 0.58 · มากที่สุด',
      badge: '★'
    },
    {
      text: 'ใช้งานสะดวก เมนูเข้าใจง่าย และเข้าถึงข้อมูลที่ต้องการได้รวดเร็ว',
      name: 'ด้านการใช้งาน',
      role: 'x̄ 4.52 · S.D. 0.61 · มากที่สุด',
      badge: '★'
    }
  ];

  var QUOTE_SVG =
    '<svg class="voice-quote" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M7.5 6C5 6 3 8 3 10.5S5 15 7.5 15c.3 0 .6 0 .9-.1-.5 1.7-2 3-3.9 3.4v2.2c3.9-.5 6.9-3.9 6.9-8.1V10.5C11.4 8 9.4 6 7.5 6zm11 0C16 6 14 8 14 10.5s2 4.5 4.5 4.5c.3 0 .6 0 .9-.1-.5 1.7-2 3-3.9 3.4v2.2c3.9-.5 6.9-3.9 6.9-8.1V10.5C22.4 8 20.4 6 18.5 6z"/>' +
    '</svg>';

  function buildCard(item) {
    var card = document.createElement('article');
    card.className = 'voice-card';

    card.insertAdjacentHTML('beforeend', QUOTE_SVG);

    var p = document.createElement('p');
    p.className = 'voice-text';
    p.textContent = '“' + item.text + '”';   /* textContent กัน XSS จากข้อความผู้ใช้ */

    var foot = document.createElement('div');
    foot.className = 'voice-foot';

    var av = document.createElement('div');
    av.className = 'voice-avatar';
    av.textContent = item.badge;

    var meta = document.createElement('div');
    meta.className = 'voice-meta';

    var nm = document.createElement('p');
    nm.className = 'voice-name';
    nm.textContent = item.name;

    var rl = document.createElement('p');
    rl.className = 'voice-role';
    rl.textContent = item.role;

    meta.append(nm, rl);
    foot.append(av, meta);
    card.append(p, foot);
    return card;
  }

  /* สร้าง 2 รางเลื่อนขึ้น — แต่ละรางวางการ์ดชุดเดิม 2 รอบ
     คีย์เฟรมเลื่อนถึง -50% พอดีกับ 1 ชุด จึงวนกลับมาต่อกันสนิท */
  function render(list) {
    var host = document.getElementById('voices-grid');
    if (!host) return;
    host.innerHTML = '';
    host.className = 'voices-marquee';

    /* จอแคบใช้รางเดียวแต่ใส่ครบทุกใบ — ไม่ให้การ์ดครึ่งหลังหายไปจากมือถือ */
    var oneCol = window.matchMedia && window.matchMedia('(max-width: 820px)').matches;
    var half = Math.ceil(list.length / 2);
    var columns = oneCol ? [list] : [list.slice(0, half), list.slice(half)];
    var speeds = oneCol ? [72] : [46, 58];   /* วินาทีต่อรอบ — ต่างกันเพื่อไม่ให้เลื่อนพร้อมกันเป๊ะ */

    columns.forEach(function (cards, ci) {
      if (!cards.length) return;

      var col = document.createElement('div');
      col.className = 'voices-col';

      var track = document.createElement('div');
      track.className = 'voices-track';
      track.style.setProperty('--speed', speeds[ci] + 's');

      for (var k = 0; k < 2; k++) {
        cards.forEach(function (item) {
          var card = buildCard(item);
          if (k === 1) card.setAttribute('aria-hidden', 'true');  /* ชุดซ้ำ ไม่ต้องอ่านซ้ำ */
          track.appendChild(card);
        });
      }

      col.appendChild(track);
      host.appendChild(col);
    });
  }

  /* ดึงข้อเสนอแนะจริงจากระบบมาต่อหน้า (ถ้ามี) */
  function loadLive() {
    if (!window.fetch) return;
    fetch(API)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.comments || !d.comments.length) return;
        var live = d.comments.slice(0, 4).map(function (c, i) {
          var when = '';
          try {
            when = new Date(c.ts).toLocaleDateString('th-TH', { dateStyle: 'medium' });
          } catch (e) { when = ''; }
          return {
            text: c.text,
            name: 'ผู้ตอบแบบประเมิน',
            role: when ? 'ข้อเสนอแนะปลายเปิด · ' + when : 'ข้อเสนอแนะปลายเปิด',
            badge: String(i + 1)
          };
        });
        current = live.concat(FINDINGS);
        render(current);
      })
      .catch(function () { /* ออฟไลน์/โปรกซีล่ม — คงข้อมูลรายงานไว้ */ });
  }

  var current = FINDINGS;   /* ชุดข้อมูลที่แสดงอยู่ (อาจมี comment สดมาต่อหน้า) */

  function init() {
    render(current);   /* แสดงผลรายงานทันที ไม่ต้องรอเน็ต */
    loadLive();

    /* ข้ามจุดตัดจอ → จัดรางใหม่ (1 ราง ↔ 2 ราง) */
    if (window.matchMedia) {
      var mq = window.matchMedia('(max-width: 820px)');
      var onChange = function () { render(current); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
