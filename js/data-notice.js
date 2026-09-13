/* ============================================================
   รัฐไทยก้าวหน้า — แถบ ⓘ "ข้อมูล ณ …" + กล่อง "ที่มาข้อมูล" ใช้ร่วมหลายหน้า
   ต้นแบบคือ #data-notice / #src-modal ของ structure.html — ไฟล์นี้ฉีด CSS + DOM เอง
   ไม่พึ่ง CSS ของหน้า (ยืมแค่สีเน้นผ่าน accent)

   วิธีใช้: ตั้ง window.MD_DATA_NOTICE = {...} ก่อน แล้วโหลดสคริปต์นี้ท้าย <body>
     key      คีย์ localStorage จำว่าผู้ใช้กดปิดแล้ว
     after    selector ที่จะวางแถบต่อท้าย · ไม่ใส่ = การ์ดลอย (หน้าแผนที่เต็มจอ)
     top / bottom / above   (การ์ดลอยเท่านั้น) ระยะจากขอบบนบนเดสก์ท็อป · ระยะจากขอบล่างบนมือถือ
                            · selector ชีตล่างที่การ์ดต้องลอยอยู่เหนือบนมือถือ
     accent   สีเน้นเป็นค่า CSS ของหน้านั้น เช่น 'var(--gold)'
     asof     ข้อความตัวหนา (เห็นทุกขนาดจอ)
     detail   ข้อความต่อท้าย (ซ่อนบนมือถือ — ข้อความเต็มอยู่ในกล่องที่มาข้อมูล)
     title / sub / warn   หัว คำอธิบาย และกล่องเตือนในกล่องที่มาข้อมูล (HTML ได้)
     sources  [{t:'ชุดข้อมูล', o:'ผู้เผยแพร่', u:'https://…', l:'ข้อความลิงก์ (ไม่บังคับ)'}]
     more     {href, label} ลิงก์ไปหน้ารวมแหล่งที่มา (ไม่บังคับ)
   ============================================================ */
(function () {
  if (window.__mdDataNotice) return;           // กันโหลดซ้ำ
  window.__mdDataNotice = true;

  var CSS =
    '.mddn{--dn-bg:rgba(255,255,255,.84);--dn-bd:rgba(10,40,60,.13);--dn-bd2:rgba(10,40,60,.24);' +
    '--dn-tx:#3A5163;--dn-hi:#0A1822;--dn-box:#FFFFFF;--dn-shadow:0 16px 40px -18px rgba(10,40,60,.5);' +
    'font-family:inherit;text-align:left;letter-spacing:normal}' +
    'html[data-theme="dark"] .mddn,html[data-theme="sunset"] .mddn{--dn-bg:rgba(9,13,19,.86);' +
    '--dn-bd:rgba(255,255,255,.09);--dn-bd2:rgba(255,255,255,.2);--dn-tx:#A7B6C2;--dn-hi:#EEF3F7;' +
    '--dn-box:#0E141C;--dn-shadow:0 16px 44px -16px rgba(0,0,0,.85)}' +

    /* แถบใต้หัวเว็บ */
    '#md-data-notice{position:relative;z-index:30;display:flex;align-items:center;gap:10px;margin:0;' +
    'padding:7px 18px;background:var(--dn-bg);border-bottom:1px solid var(--dn-bd);color:var(--dn-tx);' +
    'font-size:12.5px;line-height:1.5;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}' +
    '#md-data-notice[hidden]{display:none}' +
    '#md-data-notice .mddn-ico{flex:0 0 auto;color:var(--dn-ac);font-size:15px;line-height:1}' +
    '#md-data-notice .mddn-tx{flex:1 1 auto;min-width:0}' +
    '#md-data-notice .mddn-tx b{color:var(--dn-hi);font-weight:600}' +
    '#md-data-notice button{flex:0 0 auto;margin:0;padding:2px 10px;border-radius:20px;background:none;' +
    'border:1px solid var(--dn-bd2);color:var(--dn-tx);cursor:pointer;font:600 11.5px/1.6 inherit;' +
    'font-family:inherit;white-space:nowrap;transition:color .14s,border-color .14s}' +
    '#md-data-notice button:hover{color:var(--dn-hi);border-color:var(--dn-ac)}' +
    '#md-data-notice .mddn-more{color:var(--dn-hi);border-color:var(--dn-ac)}' +
    '#md-data-notice button:focus-visible,#md-src-modal a:focus-visible,#md-src-modal button:focus-visible' +
    '{outline:2px solid var(--dn-ac);outline-offset:2px}' +

    /* การ์ดลอย — หน้าแผนที่เต็มจอที่ไม่มีหัวเว็บในลำดับเนื้อหา */
    '#md-data-notice.mddn-float{position:fixed;top:var(--dn-top,78px);right:14px;z-index:58;' +
    'width:min(460px,calc(100vw - 28px));flex-wrap:wrap;padding:10px 12px;border:1px solid var(--dn-bd);' +
    'border-radius:14px;box-shadow:var(--dn-shadow)}' +
    '#md-data-notice.mddn-float .mddn-tx{flex:1 1 300px}' +
    '#md-data-notice.mddn-float .mddn-more{margin-left:25px}' +

    '@media (max-width:860px){#md-data-notice.mddn-float{top:auto;left:10px;right:10px;width:auto;' +
    'bottom:calc(var(--dn-bottom,92px) + env(safe-area-inset-bottom,0px))}}' +
    '@media (max-width:640px){#md-data-notice{padding:6px 10px;font-size:11.5px;gap:6px}' +
    '#md-data-notice .mddn-long{display:none}}' +

    /* กล่อง "ที่มาข้อมูล" */
    '#md-src-modal{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);display:flex;' +
    'align-items:center;justify-content:center;padding:20px}' +
    '#md-src-modal[hidden]{display:none}' +
    '#md-src-modal .mddn-box{width:min(560px,100%);max-height:82vh;overflow-y:auto;background:var(--dn-box);' +
    'color:var(--dn-tx);border:1px solid var(--dn-bd2);border-radius:16px;padding:20px 22px;' +
    'box-shadow:0 12px 50px rgba(0,0,0,.5);font-size:12.5px;line-height:1.6}' +
    '#md-src-modal h3{margin:0 0 4px;font-family:inherit;font-size:16px;font-weight:700;line-height:1.4;color:var(--dn-hi)}' +
    '#md-src-modal .mddn-sub{margin:0 0 14px;color:var(--dn-tx)}' +
    '#md-src-modal .mddn-warn{margin:0 0 14px;padding:9px 11px;border-radius:9px;color:var(--dn-hi);' +
    'background:rgba(127,127,127,.1);border:1px solid var(--dn-bd2);' +
    'background:color-mix(in srgb,var(--dn-ac) 12%,transparent);' +
    'border-color:color-mix(in srgb,var(--dn-ac) 42%,transparent)}' +
    '#md-src-modal .mddn-item{padding:9px 0;border-top:1px solid var(--dn-bd)}' +
    '#md-src-modal .mddn-item .t{color:var(--dn-hi);font-weight:600}' +
    '#md-src-modal .mddn-item a,#md-src-modal .mddn-all{color:var(--dn-hi);text-decoration:underline;' +
    'text-decoration-color:var(--dn-ac);text-underline-offset:3px;word-break:break-all}' +
    '#md-src-modal .mddn-all{display:inline-block;margin-top:12px;font-weight:600;word-break:normal}' +
    '#md-src-modal .mddn-close{display:block;margin-top:16px;width:100%;padding:8px;background:none;' +
    'border:1px solid var(--dn-bd2);border-radius:9px;color:var(--dn-hi);cursor:pointer;' +
    'font-family:inherit;font-size:13px;font-weight:600}' +
    '#md-src-modal .mddn-close:hover{border-color:var(--dn-ac)}';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function init(cfg) {
    if (!cfg || document.getElementById('md-data-notice') || document.getElementById('md-src-modal')) return;

    if (!document.getElementById('mddn-css')) {
      var st = document.createElement('style');
      st.id = 'mddn-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    var accent = cfg.accent || 'currentColor';

    /* ---- กล่องที่มาข้อมูล ---- */
    var modal = document.createElement('div');
    modal.id = 'md-src-modal';
    modal.className = 'mddn';
    modal.hidden = true;
    modal.style.setProperty('--dn-ac', accent);
    modal.innerHTML =
      '<div class="mddn-box" role="dialog" aria-modal="true" aria-labelledby="mddn-h">' +
        '<h3 id="mddn-h">' + (cfg.title || 'ที่มาข้อมูล') + '</h3>' +
        (cfg.sub ? '<p class="mddn-sub">' + cfg.sub + '</p>' : '') +
        (cfg.warn ? '<div class="mddn-warn">' + cfg.warn + '</div>' : '') +
        (cfg.sources || []).map(function (s) {
          return '<div class="mddn-item"><div class="t">' + esc(s.t) + '</div>' +
            (s.o ? '<div class="o">' + esc(s.o) + '</div>' : '') +
            (s.u ? '<a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.l || s.u) + ' ↗</a>' : '') +
            '</div>';
        }).join('') +
        (cfg.more ? '<a class="mddn-all" href="' + esc(cfg.more.href) + '">' + esc(cfg.more.label) + ' →</a>' : '') +
        '<button type="button" class="mddn-close">ปิด</button>' +
      '</div>';
    document.body.appendChild(modal);

    var lastFocus = null;
    function open() {
      lastFocus = document.activeElement;
      modal.hidden = false;
      modal.querySelector('.mddn-close').focus();
    }
    function close() {
      if (modal.hidden) return;
      modal.hidden = true;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    modal.querySelector('.mddn-close').addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') close();
    });
    window.MDDataNotice = { open: open, close: close };

    /* ---- แถบ ⓘ (ปิดได้ · จำไว้ใน localStorage) ---- */
    var dismissed = false;
    try { dismissed = localStorage.getItem(cfg.key) === '1'; } catch (e) {}
    if (dismissed) return;

    var bar = document.createElement('div');
    bar.id = 'md-data-notice';
    bar.className = 'mddn';
    bar.setAttribute('role', 'note');
    bar.style.setProperty('--dn-ac', accent);
    bar.innerHTML =
      '<span class="mddn-ico" aria-hidden="true">ⓘ</span>' +
      '<span class="mddn-tx"><b>' + (cfg.asof || '') + '</b>' +
        (cfg.detail ? '<span class="mddn-long">' + cfg.detail + '</span>' : '') + '</span>' +
      '<button type="button" class="mddn-more">ที่มาข้อมูล</button>' +
      '<button type="button" class="mddn-x" title="ปิดข้อความนี้" aria-label="ปิดข้อความนี้">✕</button>';

    var ref = cfg.after && document.querySelector(cfg.after);
    if (ref) {
      ref.insertAdjacentElement('afterend', bar);
    } else {
      bar.classList.add('mddn-float');
      if (cfg.top) bar.style.setProperty('--dn-top', cfg.top);          // เดสก์ท็อป: ระยะจากขอบบน
      if (cfg.bottom) bar.style.setProperty('--dn-bottom', cfg.bottom); // มือถือ: ระยะจากขอบล่าง
      document.body.appendChild(bar);
      // มือถือ: ถ้ามีชีตล่าง (เช่น #panel ของหน้าแผนที่) ให้การ์ดลอยเหนือขอบบนของชีต ไม่ทับแถบจับ
      var sheet = cfg.above && document.querySelector(cfg.above);
      if (sheet) {
        var place = function () {
          if (window.innerWidth > 860 || !sheet.offsetHeight) { bar.style.removeProperty('--dn-bottom'); return; }
          var gap = window.innerHeight - sheet.getBoundingClientRect().top + 8;
          bar.style.setProperty('--dn-bottom', Math.max(gap, 92) + 'px');
        };
        place();
        window.addEventListener('resize', place);
      }
    }

    bar.querySelector('.mddn-more').addEventListener('click', open);
    bar.querySelector('.mddn-x').addEventListener('click', function () {
      bar.hidden = true;
      try { localStorage.setItem(cfg.key, '1'); } catch (e) {}
    });
  }

  // วางสคริปต์ท้าย <body> → body และจุดวางแถบมีอยู่แล้ว ติดตั้งทันทีระหว่าง parse
  // ให้แถบกินที่ตั้งแต่ก่อน DOMContentLoaded (สคริปต์ของหน้าที่วัดขนาดตอนนั้นจะได้ค่าที่รวมแถบแล้ว)
  function boot() { init(window.MD_DATA_NOTICE); }
  var cfg0 = window.MD_DATA_NOTICE;
  if (document.body && (!cfg0 || !cfg0.after || document.querySelector(cfg0.after))) boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
