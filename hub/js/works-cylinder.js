/* กระบอกหมุนผลงาน (#works) — ชื่อหน้าหลักเรียงบนกระบอก 3 มิติ หมุนตามการเลื่อน
   ชื่อที่หมุนมาอยู่ด้านหน้าคือรายการที่เลือก การ์ดด้านขวาเปลี่ยนภาพ/คำอธิบายตาม
   แรงบันดาลใจ: scrollytelling.basement.studio (ส่วน "The Lab")
   ภาพพรีวิวทุกใบเป็นภาพหน้าจอจากหน้าในเว็บนี้เอง (images/showcase/) */
(function () {
  var WORKS = [
    { t: 'แผนผังโครงสร้างรัฐ',  k: '754 โหนด · 20 กระทรวง',       d: 'ผังวงกลมความเชื่อมโยงของกระทรวง กรม และหน่วยงานในกำกับ กดโหนดเพื่อดูรายละเอียด', href: '../structure.html',          img: 'structure.jpg' },
    { t: 'ผลเลือกตั้ง ส.ส. 2569', k: '400 เขต · 77 จังหวัด',        d: 'แผนที่ผลรายเขตและว่าที่ ส.ส. 500 คน จากข้อมูลทางการของ กกต.',                  href: '../election/index.html',     img: 'map-crop.jpg' },
    { t: 'ผังที่นั่งรัฐสภา',       k: 'ส.ส. 500 · สว. 200',          d: 'ผังที่นั่งแยกตามพรรคและกลุ่ม กดที่นั่งเพื่อดูรายชื่อสมาชิก',                     href: '../election/parliament.html', img: 'parliament.jpg' },
    { t: 'ชุดคณะรัฐมนตรี',        k: 'ครม. คณะที่ 66 · 35 คน',      d: 'รายชื่อรัฐมนตรีรายกระทรวง นโยบายเร่งด่วน และโครงสร้างฝ่ายบริหาร 20 กระทรวง',     href: '../cabinet/index.html',      img: 'cabinet.jpg' },
    { t: 'เลือกตั้ง กทม.',         k: 'ผู้ว่าฯ + ส.ก. 50 เขต',        d: 'แผนที่ผลคะแนนรายเขต ย้อนดูได้ 17 ครั้ง ตั้งแต่ พ.ศ. 2518',                       href: '../election/bangkok.html',   img: 'bangkok.jpg' },
    { t: 'ประชามติรัฐธรรมนูญ',    k: 'พ.ศ. 2569 · รายจังหวัด',      d: 'ผลประชามติรัฐธรรมนูญแยกรายจังหวัดบนแผนที่ประเทศไทย',                           href: '../election/referendum.html', img: 'referendum.jpg' },
    { t: 'ไทม์ไลน์การเลือกตั้ง',   k: '28 ครั้ง · 2476–2569',        d: 'การเลือกตั้ง ส.ส. ทุกครั้ง พรรคที่ได้ที่นั่งมากที่สุด และรัฐประหารที่คั่นระหว่างทาง',  href: '../election/timeline.html',  img: 'timeline.jpg' },
    { t: 'สถิติข้อมูลรัฐ',         k: 'data.go.th · World Bank',     d: 'เศรษฐกิจ งบประมาณ และชุดข้อมูลเปิดภาครัฐไทย ดึงสดจากแหล่งต้นทาง',               href: '../stats/index.html',        img: 'stats.jpg' },
    { t: 'ศูนย์ข้อมูลโลก',         k: 'ภัยพิบัติ · พลังงาน · อาเซียน', d: 'กราฟเปรียบเทียบรายประเทศ แผนที่โลก และลูกโลก 3 มิติ กว่า 100 ชิ้น',              href: '../stats/explore.html',      img: 'chart-wide.jpg' },
    { t: 'กรุงเทพฯ ทะลุมิติ',      k: 'แผนที่เมือง 3 มิติ',           d: 'อาคาร แลนด์มาร์ก และรถไฟฟ้า 10 สาย พร้อมชั้นข้อมูลน้ำท่วม ฝุ่น และการเดินทาง',   href: '../stats/bkk-city.html',     img: 'bkk-city.jpg' },
    { t: 'แผนที่ระบบสุริยะ',       k: 'Solar Atlas',                 d: 'ดาวเคราะห์ ดวงจันทร์ และวัตถุขนาดเล็กในระบบสุริยะ หมุนดูได้แบบ 3 มิติ',          href: '../solar-atlas/index.html',  img: 'solar.jpg' }
  ];

  var STEP = 20;               /* องศาระหว่างรายการบนกระบอก */
  var D2R = Math.PI / 180;

  var section, drum, items = [], imgs = [], card, kicker, title, desc, idxEl;
  var radius = 200, active = -1;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function build() {
    section = document.getElementById('works');
    drum = document.getElementById('works-drum');
    if (!section || !drum) return false;

    card = document.getElementById('works-card');
    kicker = document.getElementById('works-kicker');
    title = document.getElementById('works-title');
    desc = document.getElementById('works-desc');
    idxEl = document.getElementById('works-idx');
    document.getElementById('works-total').textContent = pad(WORKS.length);
    section.style.setProperty('--works-n', WORKS.length);

    var media = document.getElementById('works-media');
    WORKS.forEach(function (w, i) {
      var li = document.createElement('li');
      li.className = 'works-item';
      var a = document.createElement('a');
      a.href = w.href;
      a.innerHTML = '<span class="works-num">' + pad(i + 1) + '</span><span class="works-name"></span>';
      a.querySelector('.works-name').textContent = w.t;
      a.addEventListener('click', function (e) {
        /* กดชื่อที่ยังไม่ได้อยู่ด้านหน้า = หมุนมาหาก่อน · กดชื่อด้านหน้า = เปิดหน้านั้น */
        if (i !== active) { e.preventDefault(); scrollToIndex(i); }
      });
      a.addEventListener('focus', function () {
        /* เฉพาะโฟกัสจากคีย์บอร์ด (Tab) — คลิกเมาส์ก็ยิง focus แต่ต้องปล่อยให้ click หมุนเอง */
        if (i !== active && a.matches(':focus-visible')) scrollToIndex(i, true);
      });
      li.appendChild(a);
      drum.appendChild(li);
      items.push(li);

      var img = document.createElement('img');
      img.src = 'images/showcase/' + w.img;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      media.appendChild(img);
      imgs.push(img);
    });
    return true;
  }

  function measure() {
    var name = drum.querySelector('.works-name');
    var lh = name ? name.getBoundingClientRect().height : 60;
    /* รัศมีที่ทำให้รายการติดกันพอดีที่มุม STEP — คูณเผื่อช่องไฟเล็กน้อย */
    radius = (lh / (2 * Math.tan(STEP * D2R / 2))) * 1.08;
  }

  function progress() {
    var r = section.getBoundingClientRect();
    var range = section.offsetHeight - window.innerHeight;
    if (range <= 0) return 0;
    return Math.min(1, Math.max(0, -r.top / range));
  }

  function setActive(i) {
    if (i === active) return;
    if (active >= 0) { items[active].classList.remove('is-active'); imgs[active].classList.remove('on'); }
    active = i;
    var w = WORKS[i];
    items[i].classList.add('is-active');
    imgs[i].classList.add('on');
    card.href = w.href;
    card.setAttribute('aria-label', 'เปิดหน้า ' + w.t);
    kicker.textContent = w.k;
    title.textContent = w.t;
    desc.textContent = w.d;
    idxEl.textContent = pad(i + 1);
  }

  function update() {
    var rot = progress() * (WORKS.length - 1) * STEP;
    for (var i = 0; i < items.length; i++) {
      var a = i * STEP - rot;                 /* มุมของรายการเทียบกับด้านหน้า */
      var abs = Math.abs(a);
      var li = items[i];
      if (abs > 88) { li.style.visibility = 'hidden'; continue; }
      li.style.visibility = '';
      li.style.transform = 'translate3d(0,-50%,' + (-radius) + 'px) rotateX(' + (-a).toFixed(2) + 'deg) translateZ(' + radius + 'px)';
      li.style.opacity = Math.pow(Math.cos(a * D2R), 2.2).toFixed(3);
    }
    setActive(Math.min(WORKS.length - 1, Math.max(0, Math.round(rot / STEP))));
  }

  function scrollToIndex(i, instant) {
    var range = section.offsetHeight - window.innerHeight;
    var top = section.getBoundingClientRect().top + window.pageYOffset;
    var y = top + range * (i / (WORKS.length - 1));
    if (typeof lenis !== 'undefined' && lenis && lenis.scrollTo) {
      lenis.scrollTo(y, instant ? { immediate: true } : { duration: 1.1 });
    } else {
      window.scrollTo(0, y);
    }
  }

  function init() {
    if (!build()) return;
    measure();
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', function () { measure(); update(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); update(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
