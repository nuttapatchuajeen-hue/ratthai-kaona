/* ===========================================================================
   Cyber BGM Player — รัฐไทยก้าวหน้า
   UI/UX Refined: Hi-Fi Cyberpunk Audiophile Player Dashboard (Scalable Categories)
   =========================================================================== */
(function () {
  "use strict";

  if (window.__cyberBgmLoaded) return;
  window.__cyberBgmLoaded = true;

  // ── รายชื่อหมวดหมู่เพลง (Categories) ──
  var CATEGORIES = [
    { id: 'all', label: 'ทั้งหมด', icon: 'sparkles', desc: 'เพลงทั้งหมดทุกแนว' },
    { id: 'cyber', label: 'Cyber Synth', icon: 'zap', desc: 'ไซเบอร์พังก์ & ไฮเทค' },
    { id: 'ambient', label: 'Ambient Lo-Fi', icon: 'moon', desc: 'ผ่อนคลาย & สบายๆ' },
    { id: 'cinematic', label: 'Cinematic', icon: 'landmark', desc: 'ซิมโฟนี & อลังการ' },
    { id: 'upbeat', label: 'Cyber Funk', icon: 'flame', desc: 'คึกคัก & มีพลัง' }
  ];

  // ── รายการเพลง BGM ทั้งหมด 17 แทร็ก ──
  var TRACKS = [
    {
      id: '01',
      name: 'Cyber Pulse',
      composer: 'Thai GovTech AI · Cyber Synthwave',
      category: 'cyber',
      categoryLabel: 'Cyber Synth',
      year: '2026',
      file: 'bgm-1.mp3',
      color: '#00E5FF',
      vinylBg: '#C43826'
    },
    {
      id: '02',
      name: 'Digital Flow',
      composer: 'Future Civic Hub · Tech Ambient',
      category: 'ambient',
      categoryLabel: 'Ambient Lo-Fi',
      year: '2026',
      file: 'bgm-2.mp3',
      color: '#3B82F6',
      vinylBg: '#3B608C'
    },
    {
      id: '03',
      name: 'Future Horizon',
      composer: 'Nation Progress · Sci-Fi Vision',
      category: 'cinematic',
      categoryLabel: 'Cinematic',
      year: '2026',
      file: 'bgm-3.mp3',
      color: '#A855F7',
      vinylBg: '#7A3888'
    },
    {
      id: '04',
      name: 'Neon Metropolis',
      composer: 'GovTech Audio · Cyber Lo-Fi Chill',
      category: 'cyber',
      categoryLabel: 'Cyber Synth',
      year: '2026',
      file: 'bgm-4.mp3',
      color: '#00E5FF',
      vinylBg: '#0089A9'
    },
    {
      id: '05',
      name: 'State of Progress',
      composer: 'Civic Symphony · Modern Cinematic',
      category: 'cinematic',
      categoryLabel: 'Cinematic',
      year: '2026',
      file: 'bgm-5.mp3',
      color: '#FFB454',
      vinylBg: '#B07F22'
    },
    {
      id: '06',
      name: 'Quantum Orbit',
      composer: 'Data Exploration · Space Ambient',
      category: 'ambient',
      categoryLabel: 'Ambient Lo-Fi',
      year: '2026',
      file: 'bgm-6.mp3',
      color: '#60A5FA',
      vinylBg: '#2563EB'
    },
    {
      id: '07',
      name: 'Civic Groove',
      composer: 'Future Rhythm · Upbeat Cyber Funk',
      category: 'upbeat',
      categoryLabel: 'Cyber Funk',
      year: '2026',
      file: 'bgm-7.mp3',
      color: '#34D399',
      vinylBg: '#10B981'
    },
    {
      id: '08',
      name: 'Solaris Stream',
      composer: 'Orbit Synthesis · Deep Cyber Tech',
      category: 'cyber',
      categoryLabel: 'Cyber Synth',
      year: '2026',
      file: 'bgm-8.mp3',
      color: '#38BDF8',
      vinylBg: '#0284C7'
    },
    {
      id: '09',
      name: 'Aurora Matrix',
      composer: 'Synthetic Pulse · Electro Ambient',
      category: 'ambient',
      categoryLabel: 'Ambient Lo-Fi',
      year: '2026',
      file: 'bgm-9.mp3',
      color: '#818CF8',
      vinylBg: '#4F46E5'
    },
    {
      id: '10',
      name: 'Starlight Odyssey',
      composer: 'Cosmic Voyage · Cinematic Vision',
      category: 'cinematic',
      categoryLabel: 'Cinematic',
      year: '2026',
      file: 'bgm-10.mp3',
      color: '#C084FC',
      vinylBg: '#9333EA'
    },
    {
      id: '11',
      name: 'Hyperloop Drive',
      composer: 'Speed Velocity · Cyber Funk Beat',
      category: 'upbeat',
      categoryLabel: 'Cyber Funk',
      year: '2026',
      file: 'bgm-11.mp3',
      color: '#FB7185',
      vinylBg: '#E11D48'
    },
    {
      id: '12',
      name: 'Elysium Echoes',
      composer: 'Zenith Realm · Chill Lo-Fi Focus',
      category: 'ambient',
      categoryLabel: 'Ambient Lo-Fi',
      year: '2026',
      file: 'bgm-12.mp3',
      color: '#2DD4BF',
      vinylBg: '#0D9488'
    },
    {
      id: '13',
      name: 'Cybernetic Dawn',
      composer: 'AI Renaissance · Future Synthwave',
      category: 'cyber',
      categoryLabel: 'Cyber Synth',
      year: '2026',
      file: 'bgm-13.mp3',
      color: '#22D3EE',
      vinylBg: '#0891B2'
    },
    {
      id: '14',
      name: 'Titanium March',
      composer: 'Sovereign Force · Modern Symphony',
      category: 'cinematic',
      categoryLabel: 'Cinematic',
      year: '2026',
      file: 'bgm-14.mp3',
      color: '#FBBF24',
      vinylBg: '#D97706'
    },
    {
      id: '15',
      name: 'Neural Nexus',
      composer: 'Brainwave Tech · Deep Flow Ambient',
      category: 'ambient',
      categoryLabel: 'Ambient Lo-Fi',
      year: '2026',
      file: 'bgm-15.mp3',
      color: '#A78BFA',
      vinylBg: '#7C3AED'
    },
    {
      id: '16',
      name: 'Velocity Pulse',
      composer: 'Cyber Sprint · Dynamic Groove Funk',
      category: 'upbeat',
      categoryLabel: 'Cyber Funk',
      year: '2026',
      file: 'bgm-16.mp3',
      color: '#4ADE80',
      vinylBg: '#16A34A'
    },
    {
      id: '17',
      name: 'Chronicles of Siam',
      composer: 'Heritage Symphony · Grand Epic Vision',
      category: 'cinematic',
      categoryLabel: 'Cinematic',
      year: '2026',
      file: 'bgm-17.mp3',
      color: '#F472B6',
      vinylBg: '#DB2777'
    }
  ];

  // ── รายการคลิป YouTube คัดสรรสำหรับค้นหาและเล่นทันที ──
  var YT_VIDEOS = [
    {
      id: 'HuDH8-4Srpk',
      title: 'รวมเพลงไทยยอดฮิต 2026 ฟังยาวๆ 🎧 เพราะพี่รักจริง • แผลใหม่ | รวมเพลงไทยสตริง เพลงฮิต TikTok',
      channel: 'CorridosPesados · รวมเพลงฮิต',
      category: 'music',
      categoryLabel: 'เพลงไทยยอดฮิต',
      thumb: 'https://i.ytimg.com/vi/HuDH8-4Srpk/hqdefault.jpg'
    },
    {
      id: 'm8Yd1P6FEd8',
      title: 'รวมเพลงลูกทุ่ง Cover เพราะๆ ไม่มีโฆษณา รบกวนเวลาฟังเพลง 💖 โคตรคิดถึง เพลงไทยลูกทุ่งเพราะตลอดกาล',
      channel: 'เพลงเพราะตลอดกาล',
      category: 'music',
      categoryLabel: 'เพลงไทยลูกทุ่ง',
      thumb: 'https://i.ytimg.com/vi/m8Yd1P6FEd8/hqdefault.jpg'
    },
    {
      id: 'dGVm5Lw8cfA',
      title: 'พี่เอ็ด 7 วิ - เงินทอนแลนด์ (Official MV เพลงสะท้อนสังคมไทย)',
      channel: 'พี่เอ็ด 7 วิ',
      category: 'music',
      categoryLabel: 'เพลงสะท้อนสังคม',
      thumb: 'https://i.ytimg.com/vi/dGVm5Lw8cfA/hqdefault.jpg'
    },
    {
      id: '4xDzrJKXOOY',
      title: 'synthwave radio 🌌 - chill synth / retro beats to relax (มิกซ์เพลง)',
      channel: 'Lofi Girl - Synthwave',
      category: 'mix',
      categoryLabel: 'มิกซ์เพลง',
      thumb: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg'
    },
    {
      id: 'F_B_kKvhYQk',
      title: 'ถ่ายทอดสด การประชุมสภาผู้แทนราษฎร (รัฐสภาไทย)',
      channel: 'TPchannel วิทยุและโทรทัศน์รัฐสภา',
      category: 'live',
      categoryLabel: 'ไลฟ์สดสภา',
      thumb: 'https://i.ytimg.com/vi/F_B_kKvhYQk/hqdefault.jpg'
    },
    {
      id: 'hX0VjH-1a6E',
      title: 'ข่าวการเมืองไทย จับตานโยบายดิจิทัลและการปฏิรูปภาครัฐ — Thai PBS News',
      channel: 'Thai PBS News',
      category: 'gov',
      categoryLabel: 'ข่าวการเมือง',
      thumb: 'https://i.ytimg.com/vi/hX0VjH-1a6E/hqdefault.jpg'
    },
    {
      id: '-5Lu0jS9U4U',
      title: 'การดำเนินโครงการ OTOD Digital Durian 2568',
      channel: 'depa Thailand',
      category: 'tech',
      categoryLabel: 'เทคโนโลยีภาครัฐ',
      thumb: 'https://i.ytimg.com/vi/-5Lu0jS9U4U/hqdefault.jpg'
    },
    {
      id: 'zQ9ZgU4H7m0',
      title: 'เปิดตัวแพลตฟอร์มบริการดิจิทัลภาครัฐ DGA Thailand',
      channel: 'DGA Thailand',
      category: 'tech',
      categoryLabel: 'รัฐบาลดิจิทัล',
      thumb: 'https://i.ytimg.com/vi/zQ9ZgU4H7m0/hqdefault.jpg'
    },
    {
      id: 'gC44L044gEs',
      title: 'Thailand Smart City & Big Data Platform 2026',
      channel: 'depa Thailand',
      category: 'tech',
      categoryLabel: 'สมาร์ตซิตี้',
      thumb: 'https://i.ytimg.com/vi/gC44L044gEs/hqdefault.jpg'
    },
    {
      id: 'hX0VjH-1a6E',
      title: 'จับตานโยบายดิจิทัลและการปฏิรูปภาครัฐ — ข่าวค่ำ Thai PBS',
      channel: 'Thai PBS News',
      category: 'gov',
      categoryLabel: 'ข่าวการเมือง',
      thumb: 'https://i.ytimg.com/vi/hX0VjH-1a6E/hqdefault.jpg'
    },
    {
      id: 'NybHckSEQBI',
      title: 'เพื่อไทย รัฐบาล และก้าวต่อไปของการเมืองไทย — สรุปสถานการณ์พรรคเพื่อไทย',
      channel: 'workpointTODAY · การเมืองไทย',
      category: 'gov',
      categoryLabel: 'พรรคเพื่อไทย',
      thumb: 'https://i.ytimg.com/vi/NybHckSEQBI/hqdefault.jpg'
    },
    {
      id: 'a3ICN2DC_hA',
      title: 'รวมเพลงเพื่อชีวิต อมตะ คาราบาว ปู พงษ์สิทธิ์ (เพลงเพื่อชีวิตฟังสบาย)',
      channel: 'เพลงเพื่อชีวิต อมตะ',
      category: 'music',
      categoryLabel: 'เพลงเพื่อชีวิต',
      thumb: 'https://i.ytimg.com/vi/HuDH8-4Srpk/hqdefault.jpg'
    },
    {
      id: '4xDzrJKXOOY',
      title: 'พรรคประชาชน & ก้าวไกล อภิปรายงบประมาณและการขับเคลื่อนการเมืองใหม่',
      channel: 'TPchannel วิทยุและโทรทัศน์รัฐสภา',
      category: 'gov',
      categoryLabel: 'พรรคประชาชน',
      thumb: 'https://i.ytimg.com/vi/F_B_kKvhYQk/hqdefault.jpg'
    },
    {
      id: 'L_LUpnjgPso',
      title: 'Claude 3.5 Sonnet & Computer Use — Anthropic AI Overview',
      channel: 'Anthropic',
      category: 'tech',
      categoryLabel: 'ปัญญาประดิษฐ์ AI',
      thumb: 'https://i.ytimg.com/vi/L_LUpnjgPso/hqdefault.jpg'
    },
    {
      id: 'aircAruvnKk',
      title: 'But what is a neural network? | Deep learning Chapter 1',
      channel: '3Blue1Brown',
      category: 'tech',
      categoryLabel: 'AI & Data Science',
      thumb: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault.jpg'
    },
    {
      id: 'V1Pl8CzNzCw',
      title: 'OpenAI GPT-4o Realtime Voice & Vision Demonstration',
      channel: 'OpenAI Official',
      category: 'tech',
      categoryLabel: 'AI Innovation',
      thumb: 'https://i.ytimg.com/vi/V1Pl8CzNzCw/hqdefault.jpg'
    },
    {
      id: 'jfKfPfyJRdk',
      title: 'lofi hip hop radio 📚 - beats to relax/study to',
      channel: 'Lofi Girl',
      category: 'music',
      categoryLabel: 'Lo-Fi Chill',
      thumb: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg'
    },
    {
      id: '1nue_3tUe48',
      title: 'Cyberpunk 2077 Night City Ambient Mix — Futuristic Synth',
      channel: 'Cyber Sounds',
      category: 'mix',
      categoryLabel: 'Cyberpunk BGM',
      thumb: 'https://i.ytimg.com/vi/1nue_3tUe48/hqdefault.jpg'
    },
    {
      id: 'uD4izuDMUQA',
      title: 'เจาะลึกทิศทางเศรษฐกิจและเทคโนโลยีดิจิทัลไทย 2026',
      channel: 'THE STANDARD WEALTH',
      category: 'podcast',
      categoryLabel: 'พอดแคสต์/สาระ',
      thumb: 'https://i.ytimg.com/vi/uD4izuDMUQA/hqdefault.jpg'
    },
    {
      id: '1fueZCTYkpA',
      title: 'Mission To The Moon — การปรับตัวของภาครัฐในยุค AI First',
      channel: 'Mission To The Moon',
      category: 'podcast',
      categoryLabel: 'สารคดีนวัตกรรม',
      thumb: 'https://i.ytimg.com/vi/1fueZCTYkpA/hqdefault.jpg'
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

  // ── Helper คำนวณจำนวนเพลงในหมวด ──
  function getCategoryCount(catId) {
    if (!catId || catId === 'all') return TRACKS.length;
    var count = 0;
    for (var i = 0; i < TRACKS.length; i++) {
      if (TRACKS[i].category === catId) count++;
    }
    return count;
  }

  function getFilteredTrackIndices(catId) {
    if (!catId || catId === 'all') {
      return TRACKS.map(function (_, i) { return i; });
    }
    var list = [];
    for (var i = 0; i < TRACKS.length; i++) {
      if (TRACKS[i].category === catId) list.push(i);
    }
    return list.length > 0 ? list : TRACKS.map(function (_, i) { return i; });
  }

  // ── Storage State ──
  var savedTrackIdx = parseInt(localStorage.getItem('cyber-bgm-track') || '0', 10);
  if (isNaN(savedTrackIdx) || savedTrackIdx < 0 || savedTrackIdx >= TRACKS.length) savedTrackIdx = 0;

  var savedVol = parseFloat(localStorage.getItem('cyber-bgm-volume') || '0.35');
  if (isNaN(savedVol) || savedVol < 0) savedVol = 0.35;
  if (savedVol > 1) savedVol = 1;

  // BGM default = ON: auto-play unless the user explicitly paused it
  function shouldAutoPlay() {
    return localStorage.getItem('cyber-bgm-playing') !== 'false';
  }
  var savedPlaying = shouldAutoPlay();
  var savedPos = parseFloat(sessionStorage.getItem('cyber-bgm-pos') || '0');
  if (isNaN(savedPos) || savedPos < 0) savedPos = 0;
  var savedTucked = localStorage.getItem('cyber-bgm-tucked') === 'true';
  var savedCat = localStorage.getItem('cyber-bgm-cat') || 'all';

  var currentTrackIdx = savedTrackIdx;
  var currentVolume = savedVol;
  var selectedCategory = savedCat;
  var isPlaying = false;
  var isMuted = false;
  var prevVolume = currentVolume;
  var drawerOpen = false;
  var isTucked = savedTucked;
  var currentMode = 'bgm'; // 'bgm' or 'yt'
  var currentYtVideo = null;
  var ytSearchQuery = '';
  var ytSelectedCategory = 'all';

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
  var updateCardOrientation = null;

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
    if (currentMode === 'yt') {
      switchToBgm();
    }
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
    if (currentMode === 'yt') {
      if (!dom.ytPlayerWrap || dom.ytPlayerWrap.style.display === 'none' || !dom.ytIframe.src) {
        var filtered = getFilteredYtVideos();
        var targetVid = currentYtVideo || (filtered.length > 0 ? filtered[0] : YT_VIDEOS[0]);
        if (targetVid) playYtVideo(targetVid);
      } else {
        stopYtVideo();
      }
      return;
    }
    if (audio.paused) playAudio();
    else pauseAudio();
  }

  function nextTrack() {
    if (currentMode === 'yt') {
      var filtered = getFilteredYtVideos();
      if (filtered.length === 0) return;
      var curId = currentYtVideo ? currentYtVideo.id : '';
      var pos = -1;
      for (var i = 0; i < filtered.length; i++) {
        if (filtered[i].id === curId) { pos = i; break; }
      }
      var nextVid = (pos !== -1) ? filtered[(pos + 1) % filtered.length] : filtered[0];
      playYtVideo(nextVid);
      return;
    }
    var wasPlaying = !audio.paused || isPlaying;
    var filtered = getFilteredTrackIndices(selectedCategory);
    var pos = filtered.indexOf(currentTrackIdx);
    var nextIdx = (pos !== -1) ? filtered[(pos + 1) % filtered.length] : filtered[0];
    loadTrack(nextIdx, 0);
    if (wasPlaying) playAudio();
  }

  function prevTrack() {
    if (currentMode === 'yt') {
      var filtered = getFilteredYtVideos();
      if (filtered.length === 0) return;
      var curId = currentYtVideo ? currentYtVideo.id : '';
      var pos = -1;
      for (var i = 0; i < filtered.length; i++) {
        if (filtered[i].id === curId) { pos = i; break; }
      }
      var prevVid = (pos !== -1) ? filtered[(pos - 1 + filtered.length) % filtered.length] : filtered[filtered.length - 1];
      playYtVideo(prevVid);
      return;
    }
    var wasPlaying = !audio.paused || isPlaying;
    var filtered = getFilteredTrackIndices(selectedCategory);
    var pos = filtered.indexOf(currentTrackIdx);
    var prevIdx = (pos !== -1) ? filtered[(pos - 1 + filtered.length) % filtered.length] : filtered[filtered.length - 1];
    loadTrack(prevIdx, 0);
    if (wasPlaying) playAudio();
  }

  function setVolume(val) {
    val = Math.max(0, Math.min(1, val));
    currentVolume = val;
    audio.volume = val;
    isMuted = (val === 0);
    localStorage.setItem('cyber-bgm-volume', val);
    if (dom.ytIframe && dom.ytIframe.contentWindow) {
      try {
        dom.ytIframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [val * 100]
        }), '*');
      } catch (e) {}
    }
    updateUI();
  }

  function toggleMute() {
    if (isMuted || audio.volume === 0) {
      isMuted = false;
      setVolume(prevVolume > 0.05 ? prevVolume : 0.35);
      if (dom.ytIframe && dom.ytIframe.contentWindow) {
        try {
          dom.ytIframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'unMute',
            args: []
          }), '*');
        } catch (e) {}
      }
    } else {
      prevVolume = audio.volume;
      isMuted = true;
      setVolume(0);
      if (dom.ytIframe && dom.ytIframe.contentWindow) {
        try {
          dom.ytIframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'mute',
            args: []
          }), '*');
        } catch (e) {}
      }
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
      if (dom.pill) {
        if (isTucked) {
          dom.pill.setAttribute('title', 'คลิกเพื่อขยาย Cyber BGM Player');
          dom.pill.setAttribute('aria-label', 'คลิกเพื่อขยาย Cyber BGM Player');
        } else {
          dom.pill.removeAttribute('title');
          dom.pill.removeAttribute('aria-label');
        }
      }
      if (updateCardOrientation) updateCardOrientation();
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
    if (shouldAutoPlay() && audio.paused) {
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

  function filterCategory(catId) {
    selectedCategory = catId || 'all';
    localStorage.setItem('cyber-bgm-cat', selectedCategory);

    // Update tab buttons
    if (dom.catTabs) {
      var tabs = dom.catTabs.querySelectorAll('.bgm-cat-tab');
      tabs.forEach(function (tab) {
        tab.classList.toggle('active', tab.getAttribute('data-cat') === selectedCategory);
      });
    }

    // Update queue items
    if (dom.queueItems) {
      dom.queueItems.forEach(function (item) {
        var idx = parseInt(item.getAttribute('data-idx') || '0', 10);
        var t = TRACKS[idx];
        var match = (selectedCategory === 'all' || (t && t.category === selectedCategory));
        item.classList.toggle('is-filtered-out', !match);
      });
    }

    // Update play all button text
    if (dom.btnPlayFromStart) {
      var catObj = CATEGORIES.find(function (c) { return c.id === selectedCategory; }) || CATEGORIES[0];
      if (selectedCategory === 'all') {
        dom.btnPlayFromStart.innerHTML = ICO_PLUS + ' เล่นเพลงทั้งหมดจากจุดเริ่มต้น';
      } else {
        dom.btnPlayFromStart.innerHTML = ICO_PLUS + ' เล่นหมวด "' + catObj.label + '" ทั้งหมด';
      }
    }
  }

  // ── YOUTUBE LOGIC & STREAMING ──
  function extractYtVideoId(val) {
    if (!val || typeof val !== 'string') return null;
    val = val.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(val)) return val;
    var m = val.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  function getFilteredYtVideos() {
    var q = ytSearchQuery.toLowerCase().trim();
    return YT_VIDEOS.filter(function (v) {
      var matchCat = (ytSelectedCategory === 'all' || v.category === ytSelectedCategory);
      if (!matchCat) return false;
      if (!q) return true;
      var matchTitle = (v.title || '').toLowerCase().indexOf(q) !== -1;
      var matchChan = (v.channel || '').toLowerCase().indexOf(q) !== -1;
      var matchCatLabel = (v.categoryLabel || '').toLowerCase().indexOf(q) !== -1;
      return matchTitle || matchChan || matchCatLabel;
    });
  }

  var searchDebounceTimer = null;
  var isSearchingYt = false;

  function extractYoutubeId(input) {
    if (!input) return null;
    var trimmed = (input || '').trim();
    var m = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (m) return m[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    return null;
  }

  function getYtSearchUrl(query) {
    var base = '';
    if (location.protocol === 'file:' || (location.hostname === 'localhost' && location.port && location.port !== '3333')) {
      base = 'http://localhost:3333';
    } else if (location.hostname.indexOf('github.io') !== -1) {
      base = 'https://ratthai-kaona.vercel.app';
    }
    return base + '/api/yt-search?q=' + encodeURIComponent(query);
  }

  function renderYtNoResults(query, isError) {
    if (!dom.ytQueueList) return;
    var qEsc = (query || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    dom.ytQueueList.innerHTML = [
      '<div style="padding:24px 16px;text-align:center;color:#7E97A8;">',
      '  <div style="font-size:1.6rem;margin-bottom:6px;">🎵</div>',
      '  <div style="font-size:0.95rem;color:#DCE8F0;font-weight:700;margin-bottom:4px;">ไม่พบคลิปแนะนำสำหรับ &ldquo;' + qEsc + '&rdquo;</div>',
      '  <div style="font-size:0.75rem;margin-bottom:12px;color:#A0AEC0;line-height:1.5;">วางลิงก์ YouTube (เช่น https://youtu.be/...) เพื่อเล่นคลิปใดๆ ได้ทันที<br>หรือกดค้นหาโดยตรงบน YouTube</div>',
      '  <a href="https://www.youtube.com/results?search_query=' + encodeURIComponent(query) + '" target="_blank" rel="noopener" class="bgm-yt-chip active" style="display:inline-flex;align-items:center;gap:6px;text-decoration:none;padding:6px 14px;background:#FF0000;color:#FFFFFF;font-weight:700;border-radius:8px;font-size:0.8rem;">',
      '    🔴 เปิดค้นหาบน YouTube.com ↗',
      '  </a>',
      '</div>'
    ].join('');
  }

  function fallbackLocalYtSearch(query, autoPlayFirst) {
    var qLow = (query || '').toLowerCase().trim();
    var qTokens = qLow.split(/[\s,·\-_/]+/).filter(Boolean);
    var matches = YT_VIDEOS.filter(function (v) {
      var t = (v.title || '').toLowerCase();
      var c = (v.channel || '').toLowerCase();
      var l = (v.categoryLabel || '').toLowerCase();
      var combined = t + ' ' + c + ' ' + l;
      if (combined.indexOf(qLow) !== -1) return true;
      return qTokens.some(function (token) {
        return token.length >= 2 && combined.indexOf(token) !== -1;
      });
    });

    if (matches.length > 0) {
      renderYtQueue(matches);
      if (autoPlayFirst && matches[0]) {
        playYtVideo(matches[0]);
      }
      return;
    }
    renderYtNoResults(query, false);
  }

  function performYtLiveSearch(query, autoPlayFirst) {
    query = (query || '').trim();
    if (!query) return;

    // ตรวจจับกรณีผู้ใช้วางลิงก์คลิป YouTube หรือ Video ID โดยตรง
    var directId = extractYoutubeId(query);
    if (directId) {
      var directVid = {
        id: directId,
        title: 'YouTube Direct Video (' + directId + ')',
        channel: 'YouTube Direct',
        category: 'direct',
        categoryLabel: 'YouTube Direct',
        thumb: 'https://i.ytimg.com/vi/' + directId + '/hqdefault.jpg'
      };
      var existIdx = -1;
      for (var j = 0; j < YT_VIDEOS.length; j++) {
        if (YT_VIDEOS[j].id === directId) { existIdx = j; break; }
      }
      if (existIdx !== -1) YT_VIDEOS.splice(existIdx, 1);
      YT_VIDEOS.unshift(directVid);
      renderYtQueue([directVid]);
      playYtVideo(directVid);
      return;
    }

    if (dom.ytQueueList) {
      dom.ytQueueList.innerHTML = [
        '<div style="padding:32px 16px;text-align:center;color:#00E5FF;">',
        '  <div style="font-size:1.6rem;margin-bottom:8px;">🔍</div>',
        '  <div style="font-weight:700;font-size:0.9rem;">กำลังค้นหาคลิปบน YouTube...</div>',
        '  <div style="font-size:0.75rem;color:#7E97A8;margin-top:4px;">&ldquo;' + query.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '&rdquo;</div>',
        '</div>'
      ].join('');
    }

    isSearchingYt = true;
    fetch(getYtSearchUrl(query))
      .then(function (res) {
        if (!res.ok) throw new Error('Search HTTP ' + res.status);
        return res.json();
      })
      .then(function (results) {
        isSearchingYt = false;
        if (Array.isArray(results) && results.length > 0) {
          for (var i = results.length - 1; i >= 0; i--) {
            var rv = results[i];
            var existIdx = -1;
            for (var j = 0; j < YT_VIDEOS.length; j++) {
              if (YT_VIDEOS[j].id === rv.id) { existIdx = j; break; }
            }
            if (existIdx !== -1) {
              YT_VIDEOS.splice(existIdx, 1);
            }
            YT_VIDEOS.unshift(rv);
          }
          renderYtQueue(results);
          if (autoPlayFirst && results[0]) {
            playYtVideo(results[0]);
          }
        } else {
          fallbackLocalYtSearch(query, autoPlayFirst);
        }
      })
      .catch(function () {
        isSearchingYt = false;
        fallbackLocalYtSearch(query, autoPlayFirst);
      });
  }

  function renderYtQueue(customList) {
    if (!dom.ytQueueList) return;
    var filtered = customList || getFilteredYtVideos();
    var q = ytSearchQuery.trim();

    if (filtered.length === 0) {
      if (q) {
        dom.ytQueueList.innerHTML = [
          '<div class="bgm-yt-direct-play" id="bgmYtDirectSearch">',
          '  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>',
          '  <div>',
          '    <div style="font-weight:700;font-size:0.85rem;color:#00E5FF;">ค้นหาคลิปบน YouTube สด</div>',
          '    <div style="font-size:0.75rem;color:#7E97A8;margin-top:2px;">คลิกเพื่อค้นหา &ldquo;' + q.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '&rdquo; ทันที</div>',
          '  </div>',
          '</div>'
        ].join('');
        var directBtn = document.getElementById('bgmYtDirectSearch');
        if (directBtn) {
          directBtn.addEventListener('click', function () {
            performYtLiveSearch(q, true);
          });
        }
      } else {
        dom.ytQueueList.innerHTML = '<div style="padding:24px;text-align:center;color:#7E97A8;font-size:0.85rem;">ไม่พบคลิปในหมวดนี้</div>';
      }
      return;
    }

    var html = filtered.map(function (v) {
      var isCurrent = currentYtVideo && currentYtVideo.id === v.id && dom.ytPlayerWrap && dom.ytPlayerWrap.style.display !== 'none';
      var thumbUrl = v.thumb || ('https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg');
      return [
        '<div class="bgm-yt-item ' + (isCurrent ? 'active' : '') + '" data-ytid="' + v.id + '">',
        '  <div class="bgm-yt-thumb-wrap">',
        '    <img class="bgm-yt-thumb" src="' + thumbUrl + '" alt="' + (v.title || '').replace(/"/g, '&quot;') + '" loading="lazy" />',
        '    <div class="bgm-yt-thumb-play"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>',
        '  </div>',
        '  <div class="bgm-yt-info">',
        '    <div class="bgm-yt-title" title="' + (v.title || '').replace(/"/g, '&quot;') + '">' + (v.title || '') + '</div>',
        '    <div class="bgm-yt-sub">',
        '      <span class="bgm-yt-channel">' + (v.channel || 'YouTube') + '</span>',
        '      <span class="bgm-yt-tag">' + (v.categoryLabel || 'YT') + '</span>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
    }).join('');

    dom.ytQueueList.innerHTML = html;

    var items = dom.ytQueueList.querySelectorAll('.bgm-yt-item');
    items.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        var ytid = item.getAttribute('data-ytid');
        var vid = YT_VIDEOS.find(function (v) { return v.id === ytid; });
        if (vid) {
          playYtVideo(vid);
        }
      });
    });
  }

  function playYtVideo(v) {
    if (!v || !v.id) return;
    pauseAudio();

    currentMode = 'yt';
    currentYtVideo = v;

    if (dom.ytPlayerWrap) dom.ytPlayerWrap.style.display = 'block';
    if (dom.spectrumWrap) dom.spectrumWrap.style.display = 'none';
    if (dom.progressWrap) dom.progressWrap.style.display = 'none';

    var embedOrigin = (/^https?:$/.test(location.protocol) && location.origin && location.origin !== 'null')
      ? '&origin=' + encodeURIComponent(location.origin)
      : '';
    var embedUrl = 'https://www.youtube-nocookie.com/embed/' + v.id + '?autoplay=1&rel=0&modestbranding=1&enablejsapi=1' + embedOrigin;

    if (dom.ytIframe) {
      dom.ytIframe.src = embedUrl;
    }

    if (dom.panelTag) dom.panelTag.textContent = 'YOUTUBE · 1080P STREAM';
    if (dom.cardTrackName) dom.cardTrackName.textContent = v.title;
    if (dom.cardTrackGenre) dom.cardTrackGenre.textContent = v.channel;
    if (dom.cardTrackCat) {
      dom.cardTrackCat.textContent = v.categoryLabel || 'YouTube';
      dom.cardTrackCat.style.borderColor = '#FF003360';
      dom.cardTrackCat.style.color = '#FF4444';
    }
    if (dom.cardYear) dom.cardYear.textContent = 'YT';
    if (dom.badgeHq) dom.badgeHq.textContent = 'HD';

    if (dom.ytExtLink) {
      dom.ytExtLink.style.display = 'inline-flex';
      dom.ytExtLink.href = 'https://www.youtube.com/watch?v=' + v.id;
    }

    if (dom.pillName) dom.pillName.textContent = '🔴 ' + v.title;
    if (dom.pillStatus) dom.pillStatus.textContent = 'YT PLAYING';
    if (dom.pill) dom.pill.classList.add('is-playing');
    if (dom.slot) dom.slot.classList.add('is-playing');
    if (dom.btnPlayPill) dom.btnPlayPill.innerHTML = ICO_PAUSE;
    if (dom.btnPlayCard) dom.btnPlayCard.innerHTML = ICO_PAUSE;

    renderYtQueue();
  }

  function stopYtVideo() {
    if (dom.ytIframe) dom.ytIframe.src = '';
    if (dom.ytPlayerWrap) dom.ytPlayerWrap.style.display = 'none';
    if (dom.spectrumWrap) dom.spectrumWrap.style.display = 'block';
    if (dom.progressWrap) dom.progressWrap.style.display = 'block';
    if (dom.btnPlayPill) dom.btnPlayPill.innerHTML = ICO_PLAY;
    if (dom.btnPlayCard) dom.btnPlayCard.innerHTML = ICO_PLAY;
    if (dom.pillStatus) dom.pillStatus.textContent = 'YT PAUSED';
    if (dom.pill) dom.pill.classList.remove('is-playing');
    if (dom.slot) dom.slot.classList.remove('is-playing');
    renderYtQueue();
  }

  function handleYtInput(val, autoPlay) {
    val = (val || '').trim();
    if (!val) {
      ytSearchQuery = '';
      renderYtQueue();
      return;
    }

    var id = extractYtVideoId(val);
    if (id) {
      var existing = YT_VIDEOS.find(function (v) { return v.id === id; });
      if (existing) {
        playYtVideo(existing);
        return;
      }
      fetch('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + id + '&format=json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var newVid = {
            id: id,
            title: data.title || ('YouTube Video (' + id + ')'),
            channel: data.author_name || 'YouTube',
            category: 'custom',
            categoryLabel: 'Custom Video',
            thumb: data.thumbnail_url || ('https://i.ytimg.com/vi/' + id + '/hqdefault.jpg')
          };
          YT_VIDEOS.unshift(newVid);
          renderYtQueue();
          playYtVideo(newVid);
        })
        .catch(function () {
          var newVid = {
            id: id,
            title: 'YouTube Video (' + id + ')',
            channel: 'YouTube Video',
            category: 'custom',
            categoryLabel: 'YouTube',
            thumb: 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'
          };
          YT_VIDEOS.unshift(newVid);
          renderYtQueue();
          playYtVideo(newVid);
        });
      return;
    }

    ytSearchQuery = val;
    var filtered = getFilteredYtVideos();
    renderYtQueue();

    if (autoPlay) {
      if (filtered.length > 0) {
        playYtVideo(filtered[0]);
      } else {
        performYtLiveSearch(val, true);
      }
    } else {
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      if (filtered.length === 0 && val.length >= 2) {
        searchDebounceTimer = setTimeout(function () {
          performYtLiveSearch(val, false);
        }, 500);
      }
    }
  }

  function switchToBgm() {
    currentMode = 'bgm';
    if (dom.btnModeBgm) dom.btnModeBgm.classList.add('active');
    if (dom.btnModeYt) dom.btnModeYt.classList.remove('active');
    if (dom.sectionBgm) dom.sectionBgm.style.display = 'block';
    if (dom.sectionYt) dom.sectionYt.style.display = 'none';
    if (dom.ytPlayerWrap) dom.ytPlayerWrap.style.display = 'none';
    if (dom.ytIframe) dom.ytIframe.src = '';
    if (dom.ytExtLink) dom.ytExtLink.style.display = 'none';
    if (dom.spectrumWrap) dom.spectrumWrap.style.display = 'block';
    if (dom.progressWrap) dom.progressWrap.style.display = 'block';
    if (dom.panelTag) dom.panelTag.textContent = 'TH_AI_BGM · 48KHZ STEREO';
    if (dom.badgeHq) dom.badgeHq.textContent = 'HQ';
    updateUI();
  }

  function switchToYt() {
    currentMode = 'yt';
    if (dom.btnModeYt) dom.btnModeYt.classList.add('active');
    if (dom.btnModeBgm) dom.btnModeBgm.classList.remove('active');
    if (dom.sectionBgm) dom.sectionBgm.style.display = 'none';
    if (dom.sectionYt) dom.sectionYt.style.display = 'block';
    renderYtQueue();

    if (currentYtVideo && dom.ytIframe && dom.ytIframe.src) {
      if (dom.ytPlayerWrap) dom.ytPlayerWrap.style.display = 'block';
      if (dom.spectrumWrap) dom.spectrumWrap.style.display = 'none';
      if (dom.progressWrap) dom.progressWrap.style.display = 'none';
      if (dom.ytExtLink) dom.ytExtLink.style.display = 'inline-flex';
    }
  }

  function buildDOM() {
    var cssHref = getCssPath();
    if (!document.querySelector('link[href*="cyber-audio.css"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      document.head.appendChild(link);
    }

    // Category Tabs HTML
    var catTabsHtml = CATEGORIES.map(function (c) {
      var count = getCategoryCount(c.id);
      var isActive = (c.id === selectedCategory);
      return [
        '<button type="button" class="bgm-cat-tab ' + (isActive ? 'active' : '') + '" data-cat="' + c.id + '" title="' + c.desc + '">',
        '  <span class="bgm-cat-icon">' + (typeof MDICO === 'function' ? MDICO(c.icon) : '') + '</span>',
        '  <span>' + c.label + '</span>',
        '  <span class="bgm-cat-count">' + count + '</span>',
        '</button>'
      ].join('');
    }).join('');

    // Queue Items HTML
    var queueItemsHtml = TRACKS.map(function (t, i) {
      return [
        '<div class="bgm-queue-item" data-idx="' + i + '" data-cat="' + t.category + '">',
        '  <span class="bgm-q-num">' + t.id + '</span>',
        '  <div class="bgm-q-vinyl">',
        '    <div class="bgm-q-vinyl-center" style="background:' + t.vinylBg + '"></div>',
        '  </div>',
        '  <div class="bgm-q-info">',
        '    <div class="bgm-q-name">',
        '      <span>' + t.name + '</span>',
        '      <span class="bgm-q-cat-tag" style="border-color:' + t.color + '40;color:' + t.color + '">' + t.categoryLabel + '</span>',
        '    </div>',
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
      '        <span id="bgmPanelTag">TH_AI_BGM · 48KHZ STEREO</span>',
      '        <div class="bgm-led-group">',
      '          <div class="bgm-led-dot"></div>',
      '          <div class="bgm-led-dot"></div>',
      '        </div>',
      '      </div>',
      '      <!-- Spectrum Visualizer -->',
      '      <div class="bgm-spectrum-wrap">',
      '        <canvas id="bgmSpectrumCanvas" width="340" height="110"></canvas>',
      '      </div>',
      '      <!-- YouTube Player Screen -->',
      '      <div class="bgm-yt-player-wrap" id="bgmYtPlayerWrap" style="display:none;">',
      '        <iframe id="bgmYtIframe" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
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
      '          <span class="bgm-badge-hq" id="bgmBadgeHq">HQ</span>',
      '          <span class="bgm-badge-cat" id="bgmCardCat">Cyber Synth</span>',
      '          <span class="bgm-badge-year" id="bgmCardYear">2026</span>',
      '          <a class="bgm-yt-open-ext" id="bgmYtExtLink" href="#" target="_blank" rel="noopener noreferrer" style="display:none;" title="เปิดดูบน YouTube">',
      '            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg> YT ↗',
      '          </a>',
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
      '    <!-- RIGHT PANEL: PLAY QUEUE & YOUTUBE SEARCH -->',
      '    <div class="bgm-right-panel">',
      '      <div class="bgm-queue-header">',
      '        <div class="bgm-mode-switch">',
      '          <button type="button" class="bgm-mode-btn active" id="bgmModeBtnBgm" title="โหมดเพลง AI BGM">',
      '            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg> AI BGM',
      '          </button>',
      '          <button type="button" class="bgm-mode-btn is-yt" id="bgmModeBtnYt" title="โหมดค้นหาคลิป YouTube">',
      '            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg> ค้นหาคลิป YT',
      '          </button>',
      '        </div>',
      '        <div class="bgm-queue-tools">',
      '          <button type="button" class="bgm-tool-btn" id="bgmBtnClose" title="ย่อหน้าต่าง">' + ICO_CLOSE + '</button>',
      '        </div>',
      '      </div>',
      '      <!-- BGM SECTION (AI BGM TRACKS) -->',
      '      <div class="bgm-section-wrap" id="bgmSectionWrap">',
      '        <!-- CATEGORY TABS -->',
      '        <div class="bgm-category-tabs" id="bgmCatTabs">' + catTabsHtml + '</div>',
      '        <button type="button" class="bgm-queue-playall" id="bgmBtnPlayFromStart">' + ICO_PLUS + ' เล่นเพลงทั้งหมดจากจุดเริ่มต้น</button>',
      '        <div class="bgm-queue-list" id="bgmQueueList">' + queueItemsHtml + '</div>',
      '      </div>',
      '      <!-- YOUTUBE SECTION (SEARCH & STREAM) -->',
      '      <div class="bgm-yt-section" id="bgmYtSection" style="display:none;">',
      '        <div class="bgm-yt-search-wrap">',
      '          <div class="bgm-yt-search-pill">',
      '            <input type="text" class="bgm-yt-search-input" id="bgmYtSearchInput" placeholder="ค้นหา" autocomplete="off" />',
      '            <span class="bgm-yt-search-clear" id="bgmYtSearchClear" title="ล้าง">✕</span>',
      '          </div>',
      '          <button type="button" class="bgm-yt-search-btn" id="bgmYtSearchBtn" title="ค้นหาบน YouTube">',
      '            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
      '          </button>',
      '          <button type="button" class="bgm-yt-mic-btn" id="bgmYtMicBtn" title="ค้นหาด้วยเสียง">',
      '            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>',
      '          </button>',
      '        </div>',
      '        <!-- Quick Filter Chips (YouTube Official Chips) -->',
      '        <div class="bgm-yt-chips" id="bgmYtChips">',
      '          <button type="button" class="bgm-yt-chip active" data-ytcat="all" data-query="">ทั้งหมด</button>',
      '          <button type="button" class="bgm-yt-chip" data-ytcat="music" data-query="เพลง">เพลง</button>',
      '          <button type="button" class="bgm-yt-chip" data-ytcat="mix" data-query="มิกซ์">มิกซ์</button>',
      '          <button type="button" class="bgm-yt-chip" data-ytcat="live" data-query="ถ่ายทอดสด">ไลฟ์สด</button>',
      '          <button type="button" class="bgm-yt-chip" data-ytcat="podcast" data-query="พอดแคสต์">พอดแคสต์</button>',
      '          <button type="button" class="bgm-yt-chip" data-ytcat="game" data-query="เกม">เกม</button>',
      '          <button type="button" class="bgm-yt-chip" data-ytcat="latest" data-query="ข่าวล่าสุด">อัปโหลดล่าสุด</button>',
      '          <button type="button" class="bgm-yt-chip" data-ytcat="tech" data-query="เทคโนโลยี AI">เทคโนโลยี</button>',
      '          <button type="button" class="bgm-yt-chip" data-ytcat="gov" data-query="การเมืองไทย สภา">การเมืองไทย</button>',
      '        </div>',
      '        <!-- YouTube Queue List -->',
      '        <div class="bgm-queue-list" id="bgmYtQueueList"></div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <!-- FLOATING ROW WITH PILL & MINIMIZE BUTTON -->',
      '  <div class="cyber-bgm-row">',
      '    <div class="cyber-bgm-pill" id="bgmPill" title="' + (isTucked ? 'คลิกเพื่อขยาย Cyber BGM Player' : 'คลิกเพื่อเล่น/หยุด หรือขยายแผงควบคุมเพลง') + '"' + (isTucked ? ' aria-label="คลิกเพื่อขยาย Cyber BGM Player"' : '') + '>',
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
    dom.cardTrackCat = document.getElementById('bgmCardCat');
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
    dom.catTabs = document.getElementById('bgmCatTabs');
    dom.queueList = document.getElementById('bgmQueueList');
    dom.queueItems = document.querySelectorAll('.bgm-queue-item');
    dom.canvas = document.getElementById('bgmSpectrumCanvas');

    // YouTube DOM Elements
    dom.btnModeBgm = document.getElementById('bgmModeBtnBgm');
    dom.btnModeYt = document.getElementById('bgmModeBtnYt');
    dom.sectionBgm = document.getElementById('bgmSectionWrap');
    dom.sectionYt = document.getElementById('bgmYtSection');
    dom.ytSearchInput = document.getElementById('bgmYtSearchInput');
    dom.ytSearchClear = document.getElementById('bgmYtSearchClear');
    dom.ytSearchBtn = document.getElementById('bgmYtSearchBtn');
    dom.ytMicBtn = document.getElementById('bgmYtMicBtn');
    dom.ytChips = document.getElementById('bgmYtChips');
    dom.ytQueueList = document.getElementById('bgmYtQueueList');
    dom.ytPlayerWrap = document.getElementById('bgmYtPlayerWrap');
    dom.ytIframe = document.getElementById('bgmYtIframe');
    dom.ytExtLink = document.getElementById('bgmYtExtLink');
    dom.spectrumWrap = root.querySelector('.bgm-spectrum-wrap');
    dom.panelTag = document.getElementById('bgmPanelTag');
    dom.badgeHq = document.getElementById('bgmBadgeHq');

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

    // Category Tabs Click
    if (dom.catTabs) {
      dom.catTabs.addEventListener('click', function (e) {
        var tabBtn = e.target.closest('.bgm-cat-tab');
        if (!tabBtn) return;
        e.stopPropagation();
        var cat = tabBtn.getAttribute('data-cat') || 'all';
        filterCategory(cat);
      });
    }

    // YouTube Mode switch & search events
    if (dom.btnModeBgm) {
      dom.btnModeBgm.addEventListener('click', function (e) {
        e.stopPropagation();
        switchToBgm();
      });
    }

    if (dom.btnModeYt) {
      dom.btnModeYt.addEventListener('click', function (e) {
        e.stopPropagation();
        switchToYt();
      });
    }

    if (dom.ytSearchInput) {
      dom.ytSearchInput.addEventListener('input', function () {
        var v = dom.ytSearchInput.value;
        if (dom.ytSearchClear) dom.ytSearchClear.style.display = v ? 'block' : 'none';
        handleYtInput(v, false);
      });
      dom.ytSearchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleYtInput(dom.ytSearchInput.value, true);
        }
      });
    }

    if (dom.ytSearchClear) {
      dom.ytSearchClear.addEventListener('click', function (e) {
        e.stopPropagation();
        dom.ytSearchInput.value = '';
        dom.ytSearchClear.style.display = 'none';
        dom.ytSearchInput.focus();
        ytSearchQuery = '';
        ytSelectedCategory = 'all';
        if (dom.ytChips) {
          var chips = dom.ytChips.querySelectorAll('.bgm-yt-chip');
          chips.forEach(function (c) { c.classList.toggle('active', c.getAttribute('data-ytcat') === 'all'); });
        }
        renderYtQueue();
      });
    }

    if (dom.ytSearchBtn) {
      dom.ytSearchBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var val = dom.ytSearchInput ? dom.ytSearchInput.value.trim() : '';
        handleYtInput(val, true);
      });
    }

    if (dom.ytChips) {
      dom.ytChips.addEventListener('click', function (e) {
        var chip = e.target.closest('.bgm-yt-chip');
        if (!chip) return;
        e.stopPropagation();
        var cat = chip.getAttribute('data-ytcat') || 'all';
        var query = chip.getAttribute('data-query') || '';
        ytSelectedCategory = cat;
        var chips = dom.ytChips.querySelectorAll('.bgm-yt-chip');
        chips.forEach(function (c) { c.classList.toggle('active', c === chip); });

        if (cat === 'all' || !query) {
          ytSearchQuery = '';
          if (dom.ytSearchInput) dom.ytSearchInput.value = '';
          if (dom.ytSearchClear) dom.ytSearchClear.style.display = 'none';
          renderYtQueue();
        } else {
          ytSearchQuery = query;
          if (dom.ytSearchInput) dom.ytSearchInput.value = chip.textContent.trim();
          if (dom.ytSearchClear) dom.ytSearchClear.style.display = 'block';
          performYtLiveSearch(query, false);
        }
      });
    }

    if (dom.ytMicBtn) {
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        var recognition = new SpeechRecognition();
        recognition.lang = 'th-TH';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        var isListening = false;

        dom.ytMicBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (isListening) {
            recognition.stop();
            return;
          }
          try {
            recognition.start();
          } catch (err) {
            console.warn('Speech recognition error:', err);
          }
        });

        recognition.onstart = function () {
          isListening = true;
          dom.ytMicBtn.classList.add('is-listening');
          if (dom.ytSearchInput) dom.ytSearchInput.placeholder = 'กำลังฟังเสียง...';
        };

        recognition.onresult = function (event) {
          isListening = false;
          dom.ytMicBtn.classList.remove('is-listening');
          if (dom.ytSearchInput) dom.ytSearchInput.placeholder = 'ค้นหา';
          var transcript = (event.results && event.results[0] && event.results[0][0])
            ? event.results[0][0].transcript
            : '';
          if (transcript) {
            if (dom.ytSearchInput) dom.ytSearchInput.value = transcript;
            if (dom.ytSearchClear) dom.ytSearchClear.style.display = 'block';
            handleYtInput(transcript, true);
          }
        };

        recognition.onerror = function () {
          isListening = false;
          dom.ytMicBtn.classList.remove('is-listening');
          if (dom.ytSearchInput) dom.ytSearchInput.placeholder = 'ค้นหา';
        };

        recognition.onend = function () {
          isListening = false;
          dom.ytMicBtn.classList.remove('is-listening');
          if (dom.ytSearchInput) dom.ytSearchInput.placeholder = 'ค้นหา';
        };
      } else {
        dom.ytMicBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          alert('เบราว์เซอร์นี้ไม่รองรับ Speech Recognition');
        });
      }
    }

    renderYtQueue();

    // ── DRAGGABLE FLOATING CONTROLLER WITH EDGE SNAPPING & DYNAMIC ORIENTATION ──
    var isDragging = false;
    var hasMoved = false;
    var justDragged = false;
    var startX = 0, startY = 0;
    var initLeft = 0, initTop = 0;

    updateCardOrientation = function () {
      if (!dom.slot || !dom.card) return;
      var rect = dom.slot.getBoundingClientRect();
      var winW = window.innerWidth;
      var winH = window.innerHeight;

      var cardW = Math.min(740, winW - 32);
      var cardH = Math.min(dom.card.offsetHeight || 440, winH - 32);

      // คำนวณแกน X (ซ้าย-ขวา): พยายามให้ตรงกับปุ่ม pill และ clamp ให้อยู่ในขอบจอ
      var idealLeft = (rect.left > winW / 2) ? (rect.right - cardW) : rect.left;
      var clampLeft = Math.max(16, Math.min(winW - cardW - 16, idealLeft));

      // คำนวณแกน Y (บน-ล่าง): 
      // ถ้าปุ่มอยู่ครึ่งล่างของจอ -> วาง card เหนือปุ่ม (rect.top - cardH - 12)
      // ถ้าปุ่มอยู่ครึ่งบนของจอ -> วาง card ใต้ปุ่ม (rect.bottom + 12)
      var idealTop = (rect.top > winH / 2) ? (rect.top - cardH - 12) : (rect.bottom + 12);
      var clampTop = Math.max(16, Math.min(winH - cardH - 16, idealTop));

      dom.card.style.left = clampLeft + 'px';
      dom.card.style.top = clampTop + 'px';
      dom.card.style.bottom = 'auto';
      dom.card.style.right = 'auto';
    };

    function snapToEdge(left, top, animate) {
      if (!dom.slot) return;
      var slotW = dom.slot.offsetWidth || 180;
      var slotH = dom.slot.offsetHeight || 46;
      var margin = window.innerWidth <= 768 ? 12 : 20;

      // ดูดติดขอบจอซ้าย หรือ ขวา ที่ใกล้ที่สุด (ไม่ลอยทับตัวหนังสือกลางจอ)
      var isL = (left + slotW / 2) < window.innerWidth / 2;
      var maxT = Math.max(margin, window.innerHeight - slotH - margin);
      var clampedT = Math.max(margin, Math.min(maxT, top));

      if (animate) {
        dom.slot.style.transition = 'left 0.3s cubic-bezier(0.2, 0.8, 0.3, 1.15), right 0.3s cubic-bezier(0.2, 0.8, 0.3, 1.15), top 0.3s cubic-bezier(0.2, 0.8, 0.3, 1.15)';
      } else {
        dom.slot.style.transition = '';
      }

      if (isL) {
        dom.slot.style.left = margin + 'px';
        dom.slot.style.right = 'auto';
        dom.slot.classList.add('bgm-side-l');
        dom.slot.classList.remove('bgm-side-r');
      } else {
        dom.slot.style.right = margin + 'px';
        dom.slot.style.left = 'auto';
        dom.slot.classList.add('bgm-side-r');
        dom.slot.classList.remove('bgm-side-l');
      }

      dom.slot.style.top = clampedT + 'px';
      dom.slot.style.bottom = 'auto';

      updateCardOrientation();

      if (animate) {
        setTimeout(function () {
          if (dom.slot) dom.slot.style.transition = '';
        }, 320);
      }

      return { side: isL ? 'left' : 'right', top: clampedT };
    }

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

      var isL = (clampedL + slotW / 2) < window.innerWidth / 2;
      dom.slot.classList.toggle('bgm-side-l', isL);
      dom.slot.classList.toggle('bgm-side-r', !isL);

      updateCardOrientation();
    }

    // Restore saved position or snap to edge
    try {
      var savedPosXY = JSON.parse(localStorage.getItem('cyber-bgm-pos-xy') || 'null');
      if (savedPosXY) {
        var restoreT = typeof savedPosXY.top === 'number' ? savedPosXY.top : 300;
        if (savedPosXY.side === 'right') {
          snapToEdge(window.innerWidth, restoreT, false);
        } else if (savedPosXY.side === 'left') {
          snapToEdge(0, restoreT, false);
        } else if (typeof savedPosXY.left === 'number') {
          snapToEdge(savedPosXY.left, restoreT, false);
        }
      }
    } catch(e) {}

    window.addEventListener('resize', function () {
      if (!dom.slot) return;
      var rect = dom.slot.getBoundingClientRect();
      snapToEdge(rect.left, rect.top, false);
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
      if (!hasMoved && Math.hypot(dx, dy) > 5) {
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
        setTimeout(function () { justDragged = false; }, 220);
        var rect = dom.slot.getBoundingClientRect();
        var snapped = snapToEdge(rect.left, rect.top, true);
        localStorage.setItem('cyber-bgm-pos-xy', JSON.stringify(snapped));
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
      var filtered = getFilteredTrackIndices(selectedCategory);
      var targetIdx = (filtered.length > 0) ? filtered[0] : 0;
      loadTrack(targetIdx, 0);
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

    // Apply initial category filter
    filterCategory(selectedCategory);
  }

  function setDrawer(open) {
    drawerOpen = open;
    if (dom.slot) {
      dom.slot.classList.toggle('drawer-open', drawerOpen);
      if (typeof updateCardOrientation === 'function') updateCardOrientation();
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

    if (currentMode === 'yt' && currentYtVideo && dom.ytPlayerWrap && dom.ytPlayerWrap.style.display !== 'none') {
      if (dom.volSlider) dom.volSlider.value = audio.volume;
      if (dom.btnMute) dom.btnMute.innerHTML = (audio.volume === 0 || isMuted) ? ICO_VOL_MUTE : ICO_VOL_HIGH;
      return;
    }

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

    if (dom.cardTrackCat) {
      dom.cardTrackCat.textContent = track.categoryLabel;
      dom.cardTrackCat.style.borderColor = track.color + '60';
      dom.cardTrackCat.style.color = track.color;
    }

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
