/* ===========================================================================
   Cyber BGM Player — รัฐไทยก้าวหน้า
   UI/UX Refined: Hi-Fi Cyberpunk Audiophile Player Dashboard (7 Tracks)
   =========================================================================== */
(function () {
  "use strict";

  if (window.__cyberBgmLoaded) return;
  window.__cyberBgmLoaded = true;

  // ── รายการเพลง BGM ทั้งหมด 7 แทร็ก ──
  var TRACKS = [
    {
      id: '01',
      name: 'Cyber Pulse',
      composer: 'Thai GovTech AI · Cyber Synthwave',
      year: '2026',
      file: 'bgm-1.mp3',
      color: '#00E5FF',
      vinylBg: '#C43826'
    },
    {
      id: '02',
      name: 'Digital Flow',
      composer: 'Future Civic Hub · Tech Ambient',
      year: '2026',
      file: 'bgm-2.mp3',
      color: '#3B82F6',
      vinylBg: '#3B608C'
    },
    {
      id: '03',
      name: 'Future Horizon',
      composer: 'Nation Progress · Sci-Fi Vision',
      year: '2026',
      file: 'bgm-3.mp3',
      color: '#A855F7',
      vinylBg: '#7A3888'
    },
    {
      id: '04',
      name: 'Neon Metropolis',
      composer: 'GovTech Audio · Cyber Lo-Fi Chill',
      year: '2026',
      file: 'bgm-4.mp3',
      color: '#00E5FF',
      vinylBg: '#0089A9'
    },
    {
      id: '05',
      name: 'State of Progress',
      composer: 'Civic Symphony · Modern Cinematic',
      year: '2026',
      file: 'bgm-5.mp3',
      color: '#FFB454',
      vinylBg: '#B07F22'
    },
    {
      id: '06',
      name: 'Quantum Orbit',
      composer: 'Data Exploration · Space Ambient',
      year: '2026',
      file: 'bgm-6.mp3',
      color: '#60A5FA',
      vinylBg: '#2563EB'
    },
    {
      id: '07',
      name: 'Civic Groove',
      composer: 'Future Rhythm · Upbeat Cyber Funk',
      year: '2026',
      file: 'bgm-7.mp3',
      color: '#34D399',
      vinylBg: '#10B981'
    }
  ];

  // ── ฟังก์ชันคำนวณ Path ──
  function getAudioBase() {
    var scripts = document.querySelectorAll('script[src*="cyber-audio.js"]');
    if (scripts.length > 0) {
      var src = scripts[0].getAttribute('src') || '';
      var idx = src.lastIndexOf('js/');
      if (idx !== -1) return src.substring(0, idx) + 'audio/';
    }
    var p = window.location.pathname.replace(/\\/g, '/');
    var isSub = p.indexOf('/hub/') !== -1 ||
                p.indexOf('/cabinet/') !== -1 ||
                p.indexOf('/election/') !== -1 ||
                p.indexOf('/stats/') !== -1 ||
                p.indexOf('/solar-system-orrery/') !== -1;
    return isSub ? '../audio/' : 'audio/';
  }

  function getCssPath() {
    var scripts = document.querySelectorAll('script[src*="cyber-audio.js"]');
    if (scripts.length > 0) {
      var src = scripts[0].getAttribute('src') || '';
      var idx = src.lastIndexOf('js/');
      if (idx !== -1) return src.substring(0, idx) + 'css/cyber-audio.css';
    }
    var p = window.location.pathname.replace(/\\/g, '/');
    var isSub = p.indexOf('/hub/') !== -1 ||
                p.indexOf('/cabinet/') !== -1 ||
                p.indexOf('/election/') !== -1 ||
                p.indexOf('/stats/') !== -1 ||
                p.indexOf('/solar-system-orrery/') !== -1;
    return isSub ? '../css/cyber-audio.css' : 'css/cyber-audio.css';
  }

  // ── Storage State ──
  var savedTrackIdx = parseInt(localStorage.getItem('cyber-bgm-track') || '0', 10);
  if (isNaN(savedTrackIdx) || savedTrackIdx < 0 || savedTrackIdx >= TRACKS.length) savedTrackIdx = 0;

  var savedVol = parseFloat(localStorage.getItem('cyber-bgm-volume') || '0.35');
  if (isNaN(savedVol) || savedVol < 0) savedVol = 0.35;
  if (savedVol > 1) savedVol = 1;

  var savedPlaying = localStorage.getItem('cyber-bgm-playing') === 'true';
  var savedPos = parseFloat(sessionStorage.getItem('cyber-bgm-pos') || '0');
  if (isNaN(savedPos) || savedPos < 0) savedPos = 0;
  var savedTucked = localStorage.getItem('cyber-bgm-tucked') === 'true';

  var currentTrackIdx = savedTrackIdx;
  var currentVolume = savedVol;
  var isPlaying = false;
  var isMuted = false;
  var prevVolume = currentVolume;
  var drawerOpen = false;
  var isTucked = savedTucked;

  // ── Audio Element ──
  var audio = new Audio();
  audio.preload = 'auto';
  audio.volume = currentVolume;
  audio.loop = true;

  // ── Web Audio Analyser (Canvas Visualizer) ──
  var audioCtx = null;
  var analyser = null;
  var sourceNode = null;
  var freqData = null;
  var animFrameId = null;

  function setupAudioContext() {
    if (audioCtx) return;
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        sourceNode = audioCtx.createMediaElementSource(audio);
        sourceNode.connect(analyser);
        analyser.connect(audioCtx.destination);
        freqData = new Uint8Array(analyser.frequencyBinCount);
      }
    } catch (e) {
      console.log('Web Audio Context not available, using procedural waveform:', e);
    }
  }

  function loadTrack(idx, startPos) {
    if (idx < 0) idx = TRACKS.length - 1;
    if (idx >= TRACKS.length) idx = 0;
    currentTrackIdx = idx;
    localStorage.setItem('cyber-bgm-track', idx);

    var base = getAudioBase();
    var track = TRACKS[currentTrackIdx];
    audio.src = base + track.file;

    if (startPos && startPos > 0) {
      audio.currentTime = startPos;
    }
    updateUI();
  }

  function playAudio() {
    setupAudioContext();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    audio.play().then(function () {
      isPlaying = true;
      localStorage.setItem('cyber-bgm-playing', 'true');
      updateUI();
      startVisualizer();
    }).catch(function (err) {
      console.log('Autoplay blocked, waiting for user click:', err);
      isPlaying = false;
      updateUI();
    });
  }

  function pauseAudio() {
    audio.pause();
    isPlaying = false;
    localStorage.setItem('cyber-bgm-playing', 'false');
    updateUI();
  }

  function togglePlay() {
    if (audio.paused) playAudio();
    else pauseAudio();
  }

  function nextTrack() {
    var wasPlaying = !audio.paused || isPlaying;
    loadTrack((currentTrackIdx + 1) % TRACKS.length, 0);
    if (wasPlaying) playAudio();
  }

  function prevTrack() {
    var wasPlaying = !audio.paused || isPlaying;
    loadTrack((currentTrackIdx - 1 + TRACKS.length) % TRACKS.length, 0);
    if (wasPlaying) playAudio();
  }

  function setVolume(val) {
    val = Math.max(0, Math.min(1, val));
    currentVolume = val;
    audio.volume = val;
    isMuted = (val === 0);
    localStorage.setItem('cyber-bgm-volume', val);
    updateUI();
  }

  function toggleMute() {
    if (isMuted || audio.volume === 0) {
      isMuted = false;
      setVolume(prevVolume > 0.05 ? prevVolume : 0.35);
    } else {
      prevVolume = audio.volume;
      isMuted = true;
      setVolume(0);
    }
  }

  function setTucked(tucked) {
    isTucked = tucked;
    localStorage.setItem('cyber-bgm-tucked', isTucked ? 'true' : 'false');
    if (dom.slot) {
      dom.slot.classList.toggle('is-tucked', isTucked);
      if (dom.btnMin) {
        dom.btnMin.setAttribute('title', isTucked ? 'ขยายปุ่มเพลง' : 'ย่อปุ่มเพลง');
        dom.btnMin.setAttribute('aria-label', isTucked ? 'ขยายปุ่มเพลง' : 'ย่อปุ่มเพลง');
      }
    }
    if (isTucked && drawerOpen) setDrawer(false);
  }

  function toggleTucked() { setTucked(!isTucked); }

  setInterval(function () {
    if (!audio.paused && audio.currentTime > 0) {
      sessionStorage.setItem('cyber-bgm-pos', audio.currentTime);
    }
  }, 2000);

  function unlockAutoplayOnGesture() {
    if (localStorage.getItem('cyber-bgm-playing') === 'true' && audio.paused) {
      playAudio();
    }
    document.removeEventListener('click', unlockAutoplayOnGesture);
    document.removeEventListener('touchstart', unlockAutoplayOnGesture);
    document.removeEventListener('keydown', unlockAutoplayOnGesture);
  }
  document.addEventListener('click', unlockAutoplayOnGesture, { once: true });
  document.addEventListener('touchstart', unlockAutoplayOnGesture, { once: true });
  document.addEventListener('keydown', unlockAutoplayOnGesture, { once: true });

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  // ── ICONS SVG ──
  var ICO_PLAY = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  var ICO_PAUSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
  var ICO_PREV = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>';
  var ICO_NEXT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>';
  var ICO_CHEVRON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
  var ICO_CLOSE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  var ICO_VOL_HIGH = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
  var ICO_VOL_MUTE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  var ICO_MUSIC = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
  var ICO_ARROW_LEFT = '<svg class="ico-min" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
  var ICO_PLUS = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';

  // ── BUILD DOM ──
  var dom = {};

  function buildDOM() {
    var cssHref = getCssPath();
    if (!document.querySelector('link[href*="cyber-audio.css"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      document.head.appendChild(link);
    }

    var queueItemsHtml = TRACKS.map(function (t, i) {
      return [
        '<div class="bgm-queue-item" data-idx="' + i + '">',
        '  <span class="bgm-q-num">' + t.id + '</span>',
        '  <div class="bgm-q-vinyl">',
        '    <div class="bgm-q-vinyl-center" style="background:' + t.vinylBg + '"></div>',
        '  </div>',
        '  <div class="bgm-q-info">',
        '    <div class="bgm-q-name">' + t.name + '</div>',
        '    <div class="bgm-q-sub">' + ICO_MUSIC + ' ' + t.composer.split('·')[0].trim() + '</div>',
        '  </div>',
        '  <div class="bgm-q-status">',
        '    <div class="bgm-q-equalizer">',
        '      <div class="bgm-q-eq-bar"></div>',
        '      <div class="bgm-q-eq-bar"></div>',
        '      <div class="bgm-q-eq-bar"></div>',
        '    </div>',
        '    <span class="bgm-q-year">' + t.year + '</span>',
        '  </div>',
        '</div>'
      ].join('');
    }).join('');

    var root = document.createElement('div');
    root.id = 'cyber-bgm-root';
    root.innerHTML = [
      '<div id="cyber-bgm-slot" class="' + (isTucked ? 'is-tucked' : '') + '">',
      '  <!-- EXPANDED HI-FI DASHBOARD MODAL -->',
      '  <div class="cyber-bgm-card" id="bgmCard">',
      '    <!-- LEFT PANEL: ANALYZER & PLAYER -->',
      '    <div class="bgm-left-panel">',
      '      <div class="bgm-panel-topbar">',
      '        <span>TH_AI_BGM · 48KHZ STEREO</span>',
      '        <div class="bgm-led-group">',
      '          <div class="bgm-led-dot"></div>',
      '          <div class="bgm-led-dot"></div>',
      '        </div>',
      '      </div>',
      '      <!-- Spectrum Visualizer -->',
      '      <div class="bgm-spectrum-wrap">',
      '        <canvas id="bgmSpectrumCanvas" width="340" height="110"></canvas>',
      '      </div>',
      '      <!-- Progress Bar -->',
      '      <div class="bgm-progress-wrap" id="bgmProgressWrap" title="คลิกเพื่อเลื่อนช่วงเพลง">',
      '        <div class="bgm-progress-bar" id="bgmProgressBar"></div>',
      '      </div>',
      '      <div class="bgm-time-row">',
      '        <span id="bgmTimeCur">0:00</span>',
      '        <span id="bgmTimeDur">-:--</span>',
      '      </div>',
      '      <!-- Now Playing Meta -->',
      '      <div class="bgm-now-tag"><span class="bgm-now-dot"></span> NOW PLAYING</div>',
      '      <div class="bgm-title-row">',
      '        <div class="bgm-track-name" id="bgmCardTrackName">Cyber Pulse</div>',
      '        <div class="bgm-badges">',
      '          <span class="bgm-badge-hq">HQ</span>',
      '          <span class="bgm-badge-year" id="bgmCardYear">2026</span>',
      '        </div>',
      '      </div>',
      '      <div class="bgm-track-genre" id="bgmCardTrackGenre">Thai GovTech AI · Cyber Synthwave</div>',
      '      <!-- Controls Bar -->',
      '      <div class="bgm-controls-bar">',
      '        <div class="bgm-playback-group">',
      '          <button type="button" class="bgm-ctrl-secondary" id="bgmBtnPrev" title="เพลงก่อนหน้า">' + ICO_PREV + '</button>',
      '          <button type="button" class="bgm-ctrl-hero" id="bgmBtnPlayCard" title="เล่น/หยุด">' + ICO_PLAY + '</button>',
      '          <button type="button" class="bgm-ctrl-secondary" id="bgmBtnNext" title="เพลงถัดไป">' + ICO_NEXT + '</button>',
      '        </div>',
      '        <div class="bgm-volume-group">',
      '          <button type="button" class="bgm-vol-btn" id="bgmBtnMute" title="ปิด/เปิดเสียง">' + ICO_VOL_HIGH + '</button>',
      '          <input type="range" class="bgm-vol-slider" id="bgmVolSlider" min="0" max="1" step="0.01" value="' + currentVolume + '" title="ปรับระดับเสียง" />',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <!-- RIGHT PANEL: PLAY QUEUE -->',
      '    <div class="bgm-right-panel">',
      '      <div class="bgm-queue-header">',
      '        <div class="bgm-queue-title">Play queue</div>',
      '        <div class="bgm-queue-tools">',
      '          <button type="button" class="bgm-tool-btn" id="bgmBtnClose" title="ย่อหน้าต่าง">' + ICO_CLOSE + '</button>',
      '        </div>',
      '      </div>',
      '      <button type="button" class="bgm-queue-playall" id="bgmBtnPlayFromStart">' + ICO_PLUS + ' Play queue from start</button>',
      '      <div class="bgm-queue-list" id="bgmQueueList">' + queueItemsHtml + '</div>',
      '    </div>',
      '  </div>',
      '  <!-- FLOATING ROW WITH PILL & MINIMIZE BUTTON -->',
      '  <div class="cyber-bgm-row">',
      '    <div class="cyber-bgm-pill" id="bgmPill" title="คลิกเพื่อเล่น/หยุด หรือขยายแผงควบคุมเพลง">',
      '      <div class="bgm-eq-visual">',
      '        <div class="bgm-eq-bar"></div>',
      '        <div class="bgm-eq-bar"></div>',
      '        <div class="bgm-eq-bar"></div>',
      '        <div class="bgm-eq-bar"></div>',
      '      </div>',
      '      <div class="bgm-pill-info">',
      '        <span class="bgm-pill-status" id="bgmPillStatus">BGM OFF</span>',
      '        <span class="bgm-pill-name" id="bgmPillName">Cyber Pulse</span>',
      '      </div>',
      '      <button type="button" class="bgm-pill-btn" id="bgmBtnPlayPill" title="เล่น/หยุดเพลง">' + ICO_PLAY + '</button>',
      '      <button type="button" class="bgm-pill-toggle-drawer" id="bgmBtnDrawer" title="ขยายแผงเพลง">' + ICO_CHEVRON + '</button>',
      '    </div>',
      '    <button type="button" class="cyber-bgm-min" id="bgmBtnMin" title="' + (isTucked ? 'ขยายปุ่มเพลง' : 'ย่อปุ่มเพลง') + '" aria-label="' + (isTucked ? 'ขยายปุ่มเพลง' : 'ย่อปุ่มเพลง') + '">' + ICO_ARROW_LEFT + '</button>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(root);

    // Cache elements
    dom.slot = document.getElementById('cyber-bgm-slot');
    dom.pill = document.getElementById('bgmPill');
    dom.card = document.getElementById('bgmCard');
    dom.btnMin = document.getElementById('bgmBtnMin');
    dom.pillStatus = document.getElementById('bgmPillStatus');
    dom.pillName = document.getElementById('bgmPillName');
    dom.btnPlayPill = document.getElementById('bgmBtnPlayPill');
    dom.btnDrawer = document.getElementById('bgmBtnDrawer');
    dom.btnClose = document.getElementById('bgmBtnClose');
    dom.cardTrackName = document.getElementById('bgmCardTrackName');
    dom.cardTrackGenre = document.getElementById('bgmCardTrackGenre');
    dom.cardYear = document.getElementById('bgmCardYear');
    dom.btnPlayCard = document.getElementById('bgmBtnPlayCard');
    dom.btnPrev = document.getElementById('bgmBtnPrev');
    dom.btnNext = document.getElementById('bgmBtnNext');
    dom.btnPlayFromStart = document.getElementById('bgmBtnPlayFromStart');
    dom.progressWrap = document.getElementById('bgmProgressWrap');
    dom.progressBar = document.getElementById('bgmProgressBar');
    dom.timeCur = document.getElementById('bgmTimeCur');
    dom.timeDur = document.getElementById('bgmTimeDur');
    dom.btnMute = document.getElementById('bgmBtnMute');
    dom.volSlider = document.getElementById('bgmVolSlider');
    dom.queueItems = document.querySelectorAll('.bgm-queue-item');
    dom.canvas = document.getElementById('bgmSpectrumCanvas');

    // Attach Events
    dom.btnMin.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleTucked();
    });

    dom.btnPlayPill.addEventListener('click', function (e) {
      e.stopPropagation();
      togglePlay();
    });

    dom.btnDrawer.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDrawer();
    });

    // ── DRAGGABLE FLOATING CONTROLLER ──
    var isDragging = false;
    var hasMoved = false;
    var justDragged = false;
    var startX = 0, startY = 0;
    var initLeft = 0, initTop = 0;

    function applyPosition(left, top) {
      if (isNaN(left) || isNaN(top) || !dom.slot) return;
      var slotW = dom.slot.offsetWidth || 180;
      var slotH = dom.slot.offsetHeight || 46;
      var maxL = Math.max(8, window.innerWidth - slotW - 8);
      var maxT = Math.max(8, window.innerHeight - slotH - 8);

      var clampedL = Math.max(8, Math.min(maxL, left));
      var clampedT = Math.max(8, Math.min(maxT, top));

      dom.slot.style.left = clampedL + 'px';
      dom.slot.style.top = clampedT + 'px';
      dom.slot.style.bottom = 'auto';
      dom.slot.style.right = 'auto';

      dom.slot.classList.toggle('card-open-down', clampedT < 460);
      dom.slot.classList.toggle('card-align-right', clampedL > window.innerWidth / 2);
    }

    // Restore saved position
    try {
      var savedPosXY = JSON.parse(localStorage.getItem('cyber-bgm-pos-xy') || 'null');
      if (savedPosXY && typeof savedPosXY.left === 'number' && typeof savedPosXY.top === 'number') {
        applyPosition(savedPosXY.left, savedPosXY.top);
      }
    } catch(e) {}

    window.addEventListener('resize', function () {
      if (!dom.slot) return;
      var rect = dom.slot.getBoundingClientRect();
      applyPosition(rect.left, rect.top);
    });

    dom.pill.addEventListener('pointerdown', function (e) {
      if (e.target.closest('#bgmBtnPlayPill') || e.target.closest('#bgmBtnDrawer')) {
        return;
      }
      isDragging = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      var rect = dom.slot.getBoundingClientRect();
      initLeft = rect.left;
      initTop = rect.top;
      try { dom.pill.setPointerCapture(e.pointerId); } catch(err) {}
    });

    dom.pill.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!hasMoved && Math.hypot(dx, dy) > 4) {
        hasMoved = true;
        dom.slot.classList.add('is-dragging');
      }
      if (hasMoved) {
        applyPosition(initLeft + dx, initTop + dy);
      }
    });

    function finishDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      dom.slot.classList.remove('is-dragging');
      try { dom.pill.releasePointerCapture(e.pointerId); } catch(err) {}
      if (hasMoved) {
        justDragged = true;
        setTimeout(function () { justDragged = false; }, 200);
        var rect = dom.slot.getBoundingClientRect();
        localStorage.setItem('cyber-bgm-pos-xy', JSON.stringify({ left: rect.left, top: rect.top }));
      }
    }

    dom.pill.addEventListener('pointerup', finishDrag);
    dom.pill.addEventListener('pointercancel', finishDrag);

    dom.pill.addEventListener('click', function (e) {
      if (justDragged) return;
      if (isTucked) { setTucked(false); return; }
      if (e.target === dom.btnPlayPill || e.target.closest('#bgmBtnPlayPill') ||
          e.target === dom.btnDrawer || e.target.closest('#bgmBtnDrawer')) {
        return;
      }
      toggleDrawer();
    });

    dom.btnClose.addEventListener('click', function (e) {
      e.stopPropagation();
      setDrawer(false);
    });

    dom.btnPlayCard.addEventListener('click', function (e) {
      e.stopPropagation();
      togglePlay();
    });

    dom.btnPrev.addEventListener('click', function (e) {
      e.stopPropagation();
      prevTrack();
    });

    dom.btnNext.addEventListener('click', function (e) {
      e.stopPropagation();
      nextTrack();
    });

    dom.btnPlayFromStart.addEventListener('click', function (e) {
      e.stopPropagation();
      loadTrack(0, 0);
      playAudio();
    });

    dom.queueItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(item.getAttribute('data-idx') || '0', 10);
        loadTrack(idx, 0);
        playAudio();
      });
    });

    dom.btnMute.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMute();
    });

    dom.volSlider.addEventListener('input', function () {
      setVolume(parseFloat(dom.volSlider.value));
    });

    dom.progressWrap.addEventListener('click', function (e) {
      var rect = dom.progressWrap.getBoundingClientRect();
      var pos = (e.clientX - rect.left) / rect.width;
      if (audio.duration) {
        audio.currentTime = pos * audio.duration;
      }
    });

    document.addEventListener('click', function (e) {
      if (drawerOpen && !dom.slot.contains(e.target)) {
        setDrawer(false);
      }
    });

    audio.addEventListener('timeupdate', function () {
      if (audio.duration) {
        var pct = (audio.currentTime / audio.duration) * 100;
        dom.progressBar.style.width = pct + '%';
        dom.timeCur.textContent = formatTime(audio.currentTime);
        dom.timeDur.textContent = formatTime(audio.duration);
      }
    });

    audio.addEventListener('loadedmetadata', function () {
      dom.timeDur.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('ended', function () {
      nextTrack();
    });

    audio.addEventListener('play', function () {
      isPlaying = true;
      updateUI();
      startVisualizer();
    });

    audio.addEventListener('pause', function () {
      isPlaying = false;
      updateUI();
    });
  }

  function setDrawer(open) {
    drawerOpen = open;
    if (dom.slot) {
      dom.slot.classList.toggle('drawer-open', drawerOpen);
      var rect = dom.slot.getBoundingClientRect();
      dom.slot.classList.toggle('card-open-down', rect.top < 460);
      dom.slot.classList.toggle('card-align-right', rect.left > window.innerWidth / 2);
    }
    if (drawerOpen) {
      startVisualizer();
    }
  }

  function toggleDrawer() {
    if (isTucked) setTucked(false);
    setDrawer(!drawerOpen);
  }

  // ── SPECTRUM CANVAS VISUALIZER ──
  var phase = 0;
  function startVisualizer() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    function render() {
      if (!dom.canvas) return;
      var ctx = dom.canvas.getContext('2d');
      var w = dom.canvas.width;
      var h = dom.canvas.height;
      ctx.clearRect(0, 0, w, h);

      var numBars = 36;
      var gap = 3;
      var barWidth = (w - (numBars - 1) * gap) / numBars;
      var isAudioPlaying = !audio.paused;

      if (analyser && isAudioPlaying) {
        analyser.getByteFrequencyData(freqData);
      }

      phase += 0.05;

      for (var i = 0; i < numBars; i++) {
        var barH = 6;
        if (isAudioPlaying) {
          if (analyser && freqData) {
            var dataIdx = Math.floor((i / numBars) * freqData.length);
            barH = Math.max(6, (freqData[dataIdx] / 255) * (h * 0.78));
          } else {
            var wave1 = Math.sin(i * 0.3 + phase) * 20;
            var wave2 = Math.cos(i * 0.15 - phase * 1.2) * 15;
            barH = Math.max(8, 28 + wave1 + wave2);
          }
        } else {
          barH = Math.max(4, 8 + Math.sin(i * 0.3 + phase * 0.3) * 4);
        }

        var x = i * (barWidth + gap);
        var y = (h * 0.72) - barH;

        var grad = ctx.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, '#00E5FF');
        grad.addColorStop(1, '#3B82F6');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, barWidth, barH, [2, 2, 0, 0]) : ctx.rect(x, y, barWidth, barH);
        ctx.fill();

        var refH = barH * 0.35;
        var refY = (h * 0.72) + 2;
        var refGrad = ctx.createLinearGradient(0, refY, 0, refY + refH);
        refGrad.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
        refGrad.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
        ctx.fillStyle = refGrad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, refY, barWidth, refH, [0, 0, 2, 2]) : ctx.rect(x, refY, barWidth, refH);
        ctx.fill();
      }

      if (drawerOpen || isAudioPlaying) {
        animFrameId = requestAnimationFrame(render);
      }
    }
    render();
  }

  function updateUI() {
    if (!dom.slot) return;

    var track = TRACKS[currentTrackIdx];
    var playingNow = !audio.paused;

    dom.pill.classList.toggle('is-playing', playingNow);
    dom.slot.classList.toggle('is-playing', playingNow);
    dom.pillStatus.textContent = playingNow ? 'BGM ON' : 'BGM OFF';
    dom.pillName.textContent = track.name;

    dom.btnPlayPill.innerHTML = playingNow ? ICO_PAUSE : ICO_PLAY;
    dom.btnPlayCard.innerHTML = playingNow ? ICO_PAUSE : ICO_PLAY;

    dom.cardTrackName.textContent = track.name;
    dom.cardTrackGenre.textContent = track.composer;
    dom.cardYear.textContent = track.year;

    dom.queueItems.forEach(function (item, i) {
      item.classList.toggle('active', i === currentTrackIdx);
    });

    dom.volSlider.value = audio.volume;
    dom.btnMute.innerHTML = (audio.volume === 0 || isMuted) ? ICO_VOL_MUTE : ICO_VOL_HIGH;
  }

  // ── INIT ──
  function init() {
    buildDOM();
    loadTrack(currentTrackIdx, savedPos);

    if (savedPlaying) {
      playAudio();
    } else {
      updateUI();
      startVisualizer();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
