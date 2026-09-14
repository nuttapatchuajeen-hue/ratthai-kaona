/* ===========================================================================
   Cyber UI Sound Effects (SFX) Engine — รัฐไทยก้าวหน้า
   เสียงสังเคราะห์ความละเอียดสูงด้วย Web Audio API (Zero dependencies & 0 latency)
   =========================================================================== */
(function () {
  "use strict";

  if (window.__cyberSfxLoaded) return;
  window.__cyberSfxLoaded = true;

  var audioCtx = null;
  var sfxMuted = localStorage.getItem('cyber-sfx-muted') === 'true';

  var idleTimer = null;

  function ytIsPlaying() {
    try {
      return localStorage.getItem('cyber-audio-mode') === 'yt' && localStorage.getItem('cyber-yt-playing') === 'true';
    } catch (e) {
      return false;
    }
  }

  function getCtx() {
    // ระหว่างเล่นคลิป YouTube งดเสียงเอฟเฟกต์และพักช่องเสียงไว้ — ช่องเสียงที่สองทำให้เสียงคลิปสะดุด
    if (ytIsPlaying()) {
      if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
      return null;
    }
    if (!audioCtx) {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext({ latencyHint: 'playback' });
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    // พักช่องเสียงเมื่อว่าง ไม่ให้ค้างเปิดไว้ตอนเริ่มเล่นคลิปถัดไป
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
    }, 1500);
    return audioCtx;
  }

  // ── SOUND SYNTHESIS PRESETS ──
  var SFX = {
    // เสียงคลิกไฮเทค (High-Tech Crisp Click)
    click: function () {
      if (sfxMuted) return;
      var ctx = getCtx();
      if (!ctx) return;
      var t = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(350, t + 0.04);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    },

    // เสียง Hover นุ่มนวล (Subtle Cyber Pulse)
    hover: function () {
      if (sfxMuted) return;
      var ctx = getCtx();
      if (!ctx) return;
      var t = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, t);
      osc.frequency.exponentialRampToValueAtTime(950, t + 0.035);

      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.035);
    },

    // เสียงเปิดแผงควบคุม (Sci-Fi Drawer Open)
    open: function () {
      if (sfxMuted) return;
      var ctx = getCtx();
      if (!ctx) return;
      var t = ctx.currentTime;
      [420, 640, 980].forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        var delay = i * 0.03;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.25, t + delay + 0.06);

        gain.gain.setValueAtTime(0.04, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + delay);
        osc.stop(t + delay + 0.06);
      });
    },

    // เสียงสลับโหมด / Switch
    toggle: function () {
      if (sfxMuted) return;
      var ctx = getCtx();
      if (!ctx) return;
      var t = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.setValueAtTime(1200, t + 0.03);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    }
  };

  window.CyberSFX = SFX;

  // ── ATTACH TO INTERACTIVE ELEMENTS ──
  function attachListeners() {
    var clickSelector = 'a, button, .nav-tab, .hero-btn-primary, .hero-btn-ghost, .cyber-card, .mcard, .bgm-ctrl-hero, .bgm-ctrl-secondary, .bgm-queue-item, .bgm-pill, .cyber-bgm-min';
    var hoverSelector = '.nav-tab, .hero-btn-primary, .hero-btn-ghost, .bgm-queue-item, .bgm-ctrl-hero, .bgm-ctrl-secondary, .cyber-bgm-min, .video-grid-item, .doc-card';

    document.addEventListener('click', function (e) {
      var el = e.target.closest(clickSelector);
      if (el) SFX.click();
    }, true);

    // Mouseover hover SFX disabled to prevent OS/driver audio ducking & stuttering on BGM/YouTube
    // Click SFX remains active for crisp tactile response
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachListeners);
  } else {
    attachListeners();
  }
})();
