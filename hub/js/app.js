'use strict';

// ── CONFIG ────────────────────────────────────────────────
const FRAME_COUNT  = 240;
const FRAME_SPEED  = 2.0;   // product finishes by ~50% scroll
const IMAGE_SCALE  = 1.0;   // full-cover mode — ภาพเต็มจอ ไม่เหลือขอบว่างซ้าย-ขวา
const PRELOAD_FAST = 12;    // frames to load before hiding loader
const DARK_ENTER   = 0.45;  // stats section dark overlay start
const DARK_LEAVE   = 0.58;  // stats section dark overlay end
const MARQUEE_SHOW = [0.21, 0.28]; // scroll range marquee is visible (โผล่แป๊ปเดียวแล้วหายไป)
const HERO_SCROLL  = 0.10;  // hero fades out by this scroll %

// ── STATE ─────────────────────────────────────────────────
const frames = new Array(FRAME_COUNT).fill(null);
let loadedCount = 0;
let currentFrame = 0;
let bgColor = '#020508';
let canvasReady = false;
let appReady = false;

// ── ELEMENTS ──────────────────────────────────────────────
const loader      = document.getElementById('loader');
const loaderBar   = document.getElementById('loader-bar');
const loaderPct   = document.getElementById('loader-percent');
const canvasWrap  = document.getElementById('canvas-wrap');
const canvas      = document.getElementById('canvas');
const ctx         = canvas.getContext('2d');
const overlay     = document.getElementById('dark-overlay');
const heroSection = document.getElementById('hero');
const scrollCont  = document.getElementById('scroll-container');
const marqueeWrap = document.getElementById('marquee-1');
const marqueeText = marqueeWrap ? marqueeWrap.querySelector('.marquee-text') : null;

// ── CANVAS SETUP ──────────────────────────────────────────
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  if (canvasReady) drawFrame(currentFrame);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── DRAW ──────────────────────────────────────────────────
function sampleBgColor(img) {
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = 8; tmpCanvas.height = 8;
  const tmpCtx = tmpCanvas.getContext('2d');
  tmpCtx.drawImage(img, 0, 0, 8, 8);
  const d = tmpCtx.getImageData(0, 0, 1, 1).data;
  return `rgb(${d[0]},${d[1]},${d[2]})`;
}

function drawFrame(index) {
  const img = frames[index];
  if (!img) return;

  const cw = canvas.width  / (window.devicePixelRatio || 1);
  const ch = canvas.height / (window.devicePixelRatio || 1);
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);

  // subtle edge vignette
  const grad = ctx.createRadialGradient(cw/2, ch/2, ch*0.25, cw/2, ch/2, ch*0.85);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(2,5,8,0.55)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);
}

// ── FRAME LOADER ──────────────────────────────────────────
function loadFrame(i) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      frames[i] = img;
      loadedCount++;
      if (loadedCount % 20 === 0) bgColor = sampleBgColor(img);
      const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
      loaderBar.style.width = pct + '%';
      loaderPct.textContent = pct + '%';
      resolve();
    };
    img.onerror = resolve;
    const n = String(i + 1).padStart(4, '0');
    img.src = `frames/frame_${n}.webp`;
  });
}

async function preloadFrames() {
  // Phase 1: load first PRELOAD_FAST frames immediately
  const phase1 = [];
  for (let i = 0; i < Math.min(PRELOAD_FAST, FRAME_COUNT); i++) {
    phase1.push(loadFrame(i));
  }
  await Promise.all(phase1);

  // Show first frame while rest load
  canvasReady = true;
  drawFrame(0);

  // Phase 2: load remaining in background
  const phase2 = [];
  for (let i = PRELOAD_FAST; i < FRAME_COUNT; i++) {
    phase2.push(loadFrame(i));
  }
  await Promise.all(phase2);

  // All loaded — fade out loader
  gsap.to(loader, {
    opacity: 0,
    duration: 0.7,
    ease: 'power2.in',
    onComplete: () => {
      loader.style.display = 'none';
      appReady = true;
    }
  });
}

// ── LENIS ─────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── GSAP REGISTER ─────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ── HERO WORD REVEAL ──────────────────────────────────────
function initHeroAnimation() {
  const words = heroSection.querySelectorAll('.hero-heading .word');
  const tagline = heroSection.querySelector('.hero-tagline');
  const label = heroSection.querySelector('.section-label');
  const btns = heroSection.querySelectorAll('.hero-btn-primary, .hero-btn-ghost');

  gsap.set([label, words, tagline, btns], { opacity: 0, y: 40 });

  const tl = gsap.timeline({ delay: 0.2 });
  tl.to(label, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    .to(words, { opacity: 1, y: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out' }, '-=0.2')
    .to(tagline, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.3')
    .to(btns, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, '-=0.3');
}

// ── HERO TRANSITION (circle-wipe reveal) ─────────────────
function initHeroTransition() {
  ScrollTrigger.create({
    trigger: scrollCont,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;

      // Hero fades out as scroll begins
      const heroOpacity = Math.max(0, 1 - p / HERO_SCROLL);
      heroSection.style.opacity = heroOpacity;

      // Canvas reveals via circle wipe (0%→1% progress = 0→75% radius)
      const wipeP = Math.min(1, Math.max(0, (p - 0.005) / 0.07));
      const radius = wipeP * 80;
      canvasWrap.style.clipPath = `circle(${radius}% at 50% 50%)`;
    }
  });
}

// ── FRAME SCROLL BINDING ──────────────────────────────────
function initFrameScroll() {
  ScrollTrigger.create({
    trigger: scrollCont,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      if (!canvasReady) return;
      const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
      const index = Math.min(
        Math.floor(accelerated * FRAME_COUNT),
        FRAME_COUNT - 1
      );
      if (index !== currentFrame) {
        currentFrame = index;
        requestAnimationFrame(() => drawFrame(currentFrame));
      }
    }
  });
}

// ── DARK OVERLAY ──────────────────────────────────────────
function initDarkOverlay() {
  const fadeRange = 0.035;
  ScrollTrigger.create({
    trigger: scrollCont,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      let op = 0;
      if (p >= DARK_ENTER - fadeRange && p <= DARK_ENTER) {
        op = (p - (DARK_ENTER - fadeRange)) / fadeRange;
      } else if (p > DARK_ENTER && p < DARK_LEAVE) {
        op = 0.91;
      } else if (p >= DARK_LEAVE && p <= DARK_LEAVE + fadeRange) {
        op = 0.91 * (1 - (p - DARK_LEAVE) / fadeRange);
      }
      overlay.style.opacity = op;
    }
  });
}

// ── MARQUEE ───────────────────────────────────────────────
function initMarquee() {
  if (!marqueeWrap || !marqueeText) return;

  gsap.to(marqueeText, {
    xPercent: -25,
    ease: 'none',
    scrollTrigger: {
      trigger: scrollCont,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    }
  });

  const [showStart, showEnd] = MARQUEE_SHOW;
  const fade = 0.04;
  const MAX_OPACITY = 0.22; // จาง ๆ เป็นพื้นหลัง ไม่บังแผนผัง
  ScrollTrigger.create({
    trigger: scrollCont,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      let op = 0;
      if (p >= showStart && p <= showStart + fade) {
        op = (p - showStart) / fade;
      } else if (p > showStart + fade && p < showEnd - fade) {
        op = 1;
      } else if (p >= showEnd - fade && p <= showEnd) {
        op = 1 - (p - (showEnd - fade)) / fade;
      }
      marqueeWrap.style.opacity = op * MAX_OPACITY;
    }
  });
}

// ── SECTION ANIMATIONS ────────────────────────────────────
function buildTimeline(type, children) {
  const tl = gsap.timeline({ paused: true });
  switch (type) {
    case 'fade-up':
      tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out' });
      break;
    case 'slide-left':
      tl.from(children, { x: -80, opacity: 0, stagger: 0.14, duration: 0.9, ease: 'power3.out' });
      break;
    case 'slide-right':
      tl.from(children, { x: 80, opacity: 0, stagger: 0.14, duration: 0.9, ease: 'power3.out' });
      break;
    case 'scale-up':
      tl.from(children, { scale: 0.85, opacity: 0, stagger: 0.12, duration: 1.0, ease: 'power2.out' });
      break;
    case 'rotate-in':
      tl.from(children, { y: 40, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' });
      break;
    case 'stagger-up':
      tl.from(children, { y: 60, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' });
      break;
    case 'clip-reveal':
      tl.from(children, { clipPath: 'inset(100% 0 0 0)', opacity: 0, stagger: 0.15, duration: 1.2, ease: 'power4.inOut' });
      break;
    default:
      tl.from(children, { opacity: 0, stagger: 0.1, duration: 0.8 });
  }
  return tl;
}

function initSections() {
  const totalH = scrollCont.offsetHeight;
  // มือถือ: ใช้ "slide-reveal" ด้วย CSS (เลื่อนขึ้น+จาง ตาม class .is-visible)
  // แทน GSAP timeline ของเดสก์ท็อป — ให้เนื้อหา "เลื่อนเข้าเป็นสไลด์" ไม่ใช่โผล่ทันที
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  document.querySelectorAll('.scroll-section').forEach((section) => {
    const enterPct = parseFloat(section.dataset.enter) / 100;
    const leavePct = parseFloat(section.dataset.leave) / 100;
    const midPct   = (enterPct + leavePct) / 2;
    // มือถือ: ไม่ persist — เพราะ section ถูกตรึง fixed top:0 ถ้า persist ค้างไว้
    // จะตรึงทับเนื้อหาด้านบน (เช่น logo slider) ตอนเลื่อนกลับขึ้น (เดสก์ท็อปเป็น absolute จึงไม่มีปัญหา)
    const persist  = section.dataset.persist === 'true' && !isMobile;
    const animType = section.dataset.animation || 'fade-up';

    // Position section at the midpoint of its scroll range
    // วางตามความสูงของ scroll-container จริง (ไม่ใช่ 100vh) เพื่อให้ section
    // อยู่กลางจอ "พอดี" ตอนที่ progress ถึงช่วง reveal — ไม่งั้นจะเลื่อนพ้นจอก่อนโผล่
    const scrollable = totalH - window.innerHeight;
    section.style.top = (midPct * scrollable + window.innerHeight / 2) + 'px';
    section.style.transform = 'translateY(-50%)';

    // เดสก์ท็อปเท่านั้นที่สร้าง GSAP timeline (มือถือใช้ CSS slide แทน)
    let tl = null;
    if (!isMobile) {
      const children = section.querySelectorAll(
        '.section-label, .section-heading, .section-body, .section-note, .cta-heading, .cta-sub, .cta-button, .cta-button-ghost, .stat, .dash-link'
      );
      tl = buildTimeline(animType, children);
    }

    let played = false;

    ScrollTrigger.create({
      trigger: scrollCont,
      start: 'top top',
      end: 'bottom bottom',
      scrub: false,
      onUpdate: (self) => {
        const p = self.progress;
        const inRange = p >= enterPct && (persist ? true : p <= leavePct);

        if (inRange) {
          section.classList.add('is-visible');
          if (tl && !played) {
            played = true;
            tl.play(0);
          }
        } else {
          if (!persist) {
            section.classList.remove('is-visible');
            if (tl && played) {
              played = false;
              tl.pause(0);
            }
          }
        }
      }
    });
  });
}

// ── COUNTER ANIMATIONS ────────────────────────────────────
function initCounters() {
  document.querySelectorAll('.stat-number').forEach((el) => {
    const target   = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals || '0');
    const suffix   = el.nextElementSibling;

    ScrollTrigger.create({
      trigger: el.closest('.scroll-section'),
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo(el,
          { textContent: 0 },
          {
            textContent: target,
            duration: 2.2,
            ease: 'power1.out',
            snap: { textContent: decimals === 0 ? 1 : Math.pow(10, -decimals) },
            onUpdate() {
              const v = parseFloat(this.targets()[0].textContent);
              el.textContent = decimals > 0 ? v.toFixed(decimals) : Math.round(v);
            }
          }
        );
      },
      once: false,
    });
  });
}

// ── STRUCTURE BUTTON ──────────────────────────────────────
function initStructureButton() {
  const btnOverlay = document.getElementById('structure-btn-overlay');
  if (!btnOverlay) return;

  const ANIM_DONE_PROGRESS = 1 / FRAME_SPEED; // 0.5

  ScrollTrigger.create({
    trigger: scrollCont,
    start: 'top top',
    end: 'bottom bottom',
    scrub: false,
    onUpdate: (self) => {
      btnOverlay.classList.toggle('is-visible', self.progress >= ANIM_DONE_PROGRESS);
    },
    onLeaveBack: () => btnOverlay.classList.remove('is-visible'),
    // ซ่อนปุ่มเมื่อเลื่อนพ้น scroll-container เข้าสู่ส่วนข่าว
    onLeave: () => btnOverlay.classList.remove('is-visible'),
    onEnterBack: (self) => btnOverlay.classList.toggle('is-visible', self.progress >= ANIM_DONE_PROGRESS),
  });
}

// ── NAV SCROLL & ACTIVE STATE ─────────────────────────────
function initNavScroll() {
  const NAV_TARGETS = {
    home:            0,
    infrastructure:  0.13,
    representatives: 0.35,
    statistics:      0.46,
    cabinet:         0.58,
    about:           0.95,
  };

  const tabs = document.querySelectorAll('.nav-tab');

  function setActiveTab(target) {
    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.target === target));
  }

  function progressToKey(p) {
    const keys = Object.keys(NAV_TARGETS);
    let active = 'home';
    for (let i = 0; i < keys.length; i++) {
      if (p >= NAV_TARGETS[keys[i]]) active = keys[i];
    }
    return active;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      // แท็บที่ลิงก์ไปหน้าจริง (href ไม่ใช่ "#") ปล่อยให้เบราว์เซอร์นำทางไปหน้านั้นตามปกติ
      const href = tab.getAttribute('href');
      if (href && href !== '#') return;
      // แท็บที่เหลือ (หน้าแรก / คณะรัฐมนตรี / เกี่ยวกับเรา) เลื่อนภายในหน้าเหมือนเดิม
      e.preventDefault();
      const target = tab.dataset.target;
      if (target === 'home') {
        lenis.scrollTo(0, { duration: 1.5 });
        return;
      }
      const p = NAV_TARGETS[target];
      if (p === undefined) return;
      const scrollable = scrollCont.offsetHeight - window.innerHeight;
      lenis.scrollTo(scrollCont.offsetTop + p * scrollable, { duration: 1.5 });
    });
  });

  // ปุ่ม "สำรวจเลย" บน hero → เริ่มเลื่อนสำรวจเนื้อหา (ไปยัง section แรก: โครงสร้างพื้นฐาน)
  const exploreBtn = document.querySelector('.hero-btn-primary');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', e => {
      e.preventDefault();
      // เลื่อนไปยัง "กึ่งกลาง" ของ section แรก เพื่อให้เนื้อหาโผล่ชัด (ไม่ใช่จุดเริ่มเข้าเฟรม)
      const first = scrollCont.querySelector('.scroll-section');
      const p = first
        ? (parseFloat(first.dataset.enter) + parseFloat(first.dataset.leave)) / 200
        : NAV_TARGETS.infrastructure;
      const scrollable = scrollCont.offsetHeight - window.innerHeight;
      lenis.scrollTo(scrollCont.offsetTop + p * scrollable, { duration: 1.6 });
    });
  }

  // ปิดการไฮไลต์แท็บตามการเลื่อน — ไม่ให้สี/เส้นใต้ "วิ่งตาม" scroll
}

// ── INFINITE LOGO SLIDER ────────────────────────────────
function initInfiniteSlider() {
  const track = document.getElementById('infinite-track');
  if (!track) return;
  
  // Infinite slider is animated via CSS keyframe (infiniteSlide)
  // No JS needed beyond initialization
}

// ── NEWS FEED (ข่าวรัฐ/การเมือง — ดึงสดจาก RSS แบบไม่ใช้ key) ──
// ใช้ rss2json (keyless) เป็น CORS proxy + แปลง RSS เป็น JSON ให้เลย
// ใช้เฉพาะสำนักข่าวที่เปิด RSS สาธารณะให้นำไปแสดงได้
// (ปฏิบัติตามเงื่อนไข: แสดงเครดิตที่มา + ลิงก์กลับบทความต้นทาง + ไม่ดึงเนื้อหาเต็ม)
const NEWS_FEEDS = [
  { url: 'https://rssfeeds.sanook.com/rss/feeds/sanook/news.politic.xml', source: 'Sanook' },
  { url: 'https://workpointtoday.com/category/news/feed/',                source: 'workpointTODAY' },
];
const NEWS_COUNT = 6;

function thaiDate(str) {
  const d = new Date((str || '').replace(' ', 'T'));
  if (isNaN(d)) return str || '';
  const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return (tmp.textContent || '').replace(/\s+/g, ' ').trim();
}

async function fetchFeed(rssUrl) {
  const api = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);
  const res = await fetch(api);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  if (data.status !== 'ok' || !Array.isArray(data.items)) throw new Error('feed error');
  return data.items;
}

function renderNews(items) {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  const html = items.slice(0, NEWS_COUNT).map((it) => {
    const title = stripHtml(it.title);
    const desc  = stripHtml(it.description).slice(0, 120);
    const date  = thaiDate(it.pubDate);
    const link  = it.link || '#';
    const source = it._source || '';
    const thumb = it.thumbnail || (it.enclosure && it.enclosure.link) || '';
    const img = thumb
      ? `<div class="news-card-thumb" style="background-image:url('${thumb}')"></div>`
      : '';
    return `<a class="news-card" href="${link}" target="_blank" rel="noopener">
      ${img}
      <div class="news-meta">
        ${source ? `<span class="news-source">${source}</span>` : ''}
        <span class="news-date">${date}</span>
      </div>
      <h3 class="news-card-title">${title}</h3>
      <p class="news-card-text">${desc}${desc.length >= 120 ? '…' : ''}</p>
    </a>`;
  }).join('');
  if (html) grid.innerHTML = html;
}

async function initNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  // ดึงทุกแหล่งพร้อมกัน แล้วติดป้ายที่มา (_source) ให้แต่ละข่าว
  const results = await Promise.allSettled(
    NEWS_FEEDS.map(async (feed) => {
      const items = await fetchFeed(feed.url);
      return items.map((it) => ({ ...it, _source: feed.source }));
    })
  );

  const lists = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.length) lists.push(r.value);
    else console.warn('[news] feed failed:', NEWS_FEEDS[i].source, r.reason && r.reason.message);
  });

  if (!lists.length) {
    // ถ้าทุกฟีดล้มเหลว แสดงข้อความแทน placeholder "กำลังโหลด"
    grid.innerHTML = `<article class="news-card">
      <span class="news-date">ออฟไลน์</span>
      <h3 class="news-card-title">โหลดข่าวไม่สำเร็จ</h3>
      <p class="news-card-text">ไม่สามารถเชื่อมต่อแหล่งข่าวได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง</p>
    </article>`;
    return;
  }

  // สลับข่าวจากแต่ละแหล่งแบบ round-robin ให้ทุกแหล่งได้แสดงสลับกัน
  const merged = [];
  const maxLen = Math.max(...lists.map((l) => l.length));
  for (let i = 0; i < maxLen; i++) {
    for (const list of lists) if (list[i]) merged.push(list[i]);
  }
  renderNews(merged);
}

// ── BOOT ──────────────────────────────────────────────────
function init() {
  initHeroAnimation();
  initHeroTransition();
  initFrameScroll();
  initDarkOverlay();
  initMarquee();
  initSections();
  initCounters();
  initInfiniteSlider();
  initStructureButton();
  initNavScroll();
  initNews();
}

// Start preloading, then init GSAP after loader hides
preloadFrames().then(() => {
  // GSAP inits after first frames are painted; preloadFrames resolves after all done
});

// Init GSAP scroll system immediately (sections/marquee respond to scroll from start)
init();
