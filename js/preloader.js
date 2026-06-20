/* ============================================================
   รัฐไทยก้าวหน้า — หน้าโหลด (preloader) ใช้ร่วมทุกหน้า
   self-contained: ฉีด CSS + DOM เอง, ไม่พึ่ง CSS ของแต่ละหน้า
   วางไว้ใน <head> เพื่อให้ขึ้นคลุมหน้าก่อน body จะ render
   ============================================================ */
(function () {
  if (window.__mdPreloader) return;            // กันโหลดซ้ำ
  window.__mdPreloader = true;
  if (document.getElementById('loader')) return; // หน้าที่มี loader ของตัวเองอยู่แล้ว (เช่น hub) ข้าม

  var BRAND = 'รัฐไทยก้าวหน้า';

  var css =
    '#md-preloader{position:fixed;inset:0;z-index:2147483600;display:flex;flex-direction:column;' +
    'align-items:center;justify-content:center;gap:1.8rem;background:#02050a;' +
    'font-family:"Prompt","Kanit","Sarabun",system-ui,sans-serif;opacity:1;' +
    'transition:opacity .5s ease}' +
    '#md-preloader.md-hide{opacity:0;pointer-events:none}' +
    '#md-preloader .mdp-brand{font-weight:900;font-size:clamp(2.4rem,8vw,7rem);letter-spacing:.16em;' +
    'color:#eaf6ff;line-height:1.05;text-align:center;padding:0 4vw;' +
    'text-shadow:0 0 32px rgba(0,229,255,.18)}' +
    '#md-preloader .mdp-barwrap{width:min(420px,60vw);height:1px;background:rgba(255,255,255,.08);overflow:hidden}' +
    '#md-preloader .mdp-bar{height:100%;width:0%;background:linear-gradient(90deg,#00e5ff,#ff8a3d);' +
    'transition:width .12s linear}' +
    '#md-preloader .mdp-pct{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.7rem;' +
    'letter-spacing:.12em;color:#6b7c8c}' +
    '@media (prefers-reduced-motion:reduce){#md-preloader .mdp-bar{transition:none}}';

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  (document.head || document.documentElement).appendChild(styleEl);

  var el = document.createElement('div');
  el.id = 'md-preloader';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<div class="mdp-brand">' + BRAND + '</div>' +
    '<div class="mdp-barwrap"><div class="mdp-bar" id="mdp-bar"></div></div>' +
    '<div class="mdp-pct" id="mdp-pct">0%</div>';
  document.documentElement.appendChild(el);

  var bar = el.querySelector('#mdp-bar');
  var pct = el.querySelector('#mdp-pct');
  var p = 0, done = false, start = Date.now();
  var MIN_MS = 900;   // โชว์อย่างน้อยเท่านี้ เพื่อไม่ให้กระพริบหายเร็วเกินไป

  function set(v) {
    v = v < 0 ? 0 : (v > 100 ? 100 : v);
    bar.style.width = v + '%';
    pct.textContent = Math.round(v) + '%';
  }

  // ไต่เข้าหา 90% ระหว่างกำลังโหลด
  var tick = setInterval(function () {
    if (done) return;
    p += (90 - p) * 0.06 + 0.4;
    if (p > 90) p = 90;
    set(p);
  }, 60);

  function finish() {
    if (done) return; done = true;
    clearInterval(tick);
    var wait = Math.max(0, MIN_MS - (Date.now() - start));
    setTimeout(function () {
      set(100);
      setTimeout(function () {
        el.classList.add('md-hide');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 550);
      }, 180);
    }, wait);
  }

  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish);
  setTimeout(finish, 6000);   // safety: ไม่ค้างแน่นอน
})();
