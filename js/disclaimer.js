/* ============================================================
   รัฐไทยก้าวหน้า — แถบคำชี้แจงสถานะโครงงาน (ใช้ร่วมทุกหน้า)
   self-contained: ฉีด CSS + DOM เอง ไม่พึ่ง CSS ของแต่ละหน้า
   สีตัวอักษรใช้ inherit + opacity จึงอ่านออกทั้งธีมสว่างและมืด
   วางไว้คู่กับ js/preloader.js ได้เลย
   ============================================================ */
(function () {
  if (window.__mdDisclaimer) return;              // กันโหลดซ้ำ
  window.__mdDisclaimer = true;

  var LINE1 = 'โครงงานเพื่อการศึกษา จัดทำโดยนักศึกษา · ไม่ได้รับการสนับสนุนจากหน่วยงานรัฐหรือพรรคการเมืองใด';
  var LINE2 = 'ข้อมูลรวบรวมจากแหล่งข้อมูลสาธารณะเพื่อการเรียนรู้เท่านั้น มิใช่เว็บไซต์ทางการของหน่วยงานใด';

  var css =
    '#md-disclaimer{position:relative;z-index:1;box-sizing:border-box;display:block;' +
    'width:auto;flex:1 1 100%;grid-column:1 / -1;' +
    'margin:0;padding:1.6rem 1.2rem 2.4rem;text-align:center;' +
    'border-top:1px solid rgba(128,128,128,.24);' +
    'font-family:inherit;color:inherit;background:transparent}' +
    '#md-disclaimer .mdd-line{max-width:820px;margin:0 auto;font-size:.78rem;line-height:1.75;' +
    'letter-spacing:.01em;opacity:.66}' +
    '#md-disclaimer .mdd-sub{max-width:820px;margin:.35rem auto 0;font-size:.72rem;line-height:1.7;' +
    'opacity:.45}' +
    '@media (max-width:640px){#md-disclaimer{padding:1.3rem 1rem 2rem}' +
    '#md-disclaimer .mdd-line{font-size:.72rem}#md-disclaimer .mdd-sub{font-size:.68rem}}';

  /* บางหน้า (เช่น hub) body กว้าง 0 เพราะเนื้อหาเป็น section ลอย
     จึงต้องไล่หาบล็อกเนื้อหาจริงที่กว้างพอมาเป็นที่วางแทน */
  function pickHost() {
    var f = document.querySelector("footer");
    if (f) return f;
    var b = document.body;
    // บางหน้า (เช่น hub) body กว้าง 0 เพราะเนื้อหาเป็น section ลอยทั้งหมด
    if (b.getBoundingClientRect().width > 0) return b;
    var kids = b.children;
    for (var i = kids.length - 1; i >= 0; i--) {
      var k = kids[i], t = k.tagName;
      if (t !== "SECTION" && t !== "MAIN" && t !== "ARTICLE") continue;
      var cs = window.getComputedStyle(k);
      if (cs.position === "fixed" || cs.position === "absolute" || cs.display === "none") continue;
      return k;
    }
    return b;
  }

  function mount() {
    if (!document.body || document.getElementById('md-disclaimer')) return;

    var style = document.createElement('style');
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);

    var el = document.createElement('div');
    el.id = 'md-disclaimer';
    el.setAttribute('role', 'note');
    el.innerHTML =
      '<p class="mdd-line">' + LINE1 + '</p>' +
      '<p class="mdd-sub">' + LINE2 + '</p>';

    pickHost().appendChild(el);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
