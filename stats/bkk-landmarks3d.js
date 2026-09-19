/**
 * bkk-landmarks3d.js
 * ชั้น "แลนด์มาร์ก 3 มิติ" ของ bkk-city.html — โมเดล GLB ของตึก/วัด/สถานที่สำคัญ สร้างด้วย Blender (_geo/landmarks3d/)
 * วาดในฉากกลาง bkk-3d-host.js (three.js) ร่วมกับทางด่วน รถไฟฟ้า และสนามบิน
 *
 *   - รายการ: landmarks3d/manifest.js (window.BKK_LM3D) — จุดยึด ความสูง ไฟล์ โมเดลแทนตึก OSM id ไหน ข้อมูลในการ์ด
 *   - โหลดทีละหลังเมื่อซูมเข้าใกล้ (GLTFLoader + DRACOLoader ของ three r128 ชุดเดียวกับ solar-atlas)
 *   - วัสดุตั้งชื่อตามหน้าที่ในไฟล์ (glass solid led mosaic gold roof) → ที่นี่ใส่วัสดุจริงตามธีม:
 *     ธีมมืด = ไฟในห้องเปิดเป็นบางห้อง ไฟ LED ประดับติด ไฟส่องพระปรางค์สีทอง
 *   - หลังโหลดเสร็จ ตัดกล่องเดิมออก: มวลอาคาร OSM ของแลนด์มาร์ก (window.BKK_LM3D_HIDE) + ตึก 3 มิติของแผนที่ฐาน (BKK_3D.excludeBuildings)
 */
(function () {
  "use strict";

  var MAN_URL = "landmarks3d/manifest.js";
  var THREE_EX = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/";
  var MOD_ID = "landmarks";
  var LS_KEY = "bkk-lm3d-on";
  var SHOW_ZOOM = 13, LOAD_ZOOM = 12.4, LOAD_MARGIN = 2500;   // ม. รอบกรอบจอที่เริ่มโหลดล่วงหน้า

  var H = null, T = null, M = null, map = null;
  var visible = true, loading = null, failed = false, lastError = null, uiBuilt = false;
  var group = null, items = [], loaderP = null, mats = null;
  var hoverId = null, selId = null, hoverObj = null, selObj = null;

  function $(s, r) { return (r || document).querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function loadScript(src) {
    return new Promise(function (ok, bad) {
      var s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = ok;
      s.onerror = function () { bad(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }

  function ensureLoaded() {
    if (loading) return loading;
    setChipState("loading");
    loading = Promise.all([H.ensure(), window.BKK_LM3D ? Promise.resolve() : loadScript(MAN_URL)]).then(function () {
      T = H.THREE(); M = window.BKK_LM3D;
      if (!T || !M) throw new Error("THREE/BKK_LM3D missing");
      group = new T.Group();
      group.name = "landmarks";
      group.visible = visible;
      makeMaterials();
      items = M.items.map(function (it) {
        var p = H.toLocal(it.anchor[0], it.anchor[1]);
        return { it: it, x: p.x, y: p.y, k: H.kAt(it.anchor[1]), state: "idle", root: null, box: null };
      });
      H.scene().add(group);
      H.ready();
      setChipState("ready");
    }).catch(function (e) {
      failed = true;
      lastError = e && e.stack || String(e);
      console.warn("landmarks 3D:", e);
      setChipState("error");
    });
    return loading;
  }
  function ensureGltf() {
    if (loaderP) return loaderP;
    loaderP = (T.GLTFLoader ? Promise.resolve() : loadScript(THREE_EX + "loaders/GLTFLoader.js"))
      .then(function () { return T.DRACOLoader ? null : loadScript(THREE_EX + "loaders/DRACOLoader.js"); })
      .then(function () {
        var l = new T.GLTFLoader();
        l.setDRACOLoader(new T.DRACOLoader().setDecoderPath(THREE_EX + "libs/draco/"));
        return l;
      });
    return loaderP;
  }

  /* ------------------------------------------------------------ วัสดุ */
  function canvasTex(w, h, draw) {
    var cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    draw(cv.getContext("2d"), w, h);
    var tx = new T.CanvasTexture(cv);
    tx.wrapS = tx.wrapT = T.RepeatWrapping;
    return tx;
  }
  // ผนังกระจก: แผ่นลาย 8×8 ช่อง (ช่องละ 6×8 ม. = กว้าง 4 บาน สูง 2 ชั้น) → ลายซ้ำทุก 48×64 ม. · แผ่นไฟในห้องใช้ตำแหน่งเดียวกัน
  var GW = 8, GH = 8, CELL = 64;
  function glassTextures() {
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var lit = [];
    for (var i = 0; i < GW * 4 * GH * 2; i++) lit.push(rnd() < 0.34 ? 0.55 + rnd() * 0.45 : 0);
    var map = canvasTex(GW * CELL, GH * CELL, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, "#a9bfd0"); gr.addColorStop(0.5, "#7d97ab"); gr.addColorStop(1, "#98b0c3");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(38,50,62,0.8)";
      for (var x = 0; x < GW * 4; x++) g.fillRect(x * CELL / 4, 0, 2, h);
      for (var y = 0; y < GH * 2; y++) g.fillRect(0, y * CELL / 2, w, 3);
      g.fillStyle = "rgba(255,255,255,0.12)";
      for (var k = 0; k < GW * GH; k++) g.fillRect((k % GW) * CELL + 5, Math.floor(k / GW) * CELL + 6, 6, 24);
    });
    var em = canvasTex(GW * CELL, GH * CELL, function (g, w, h) {
      g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
      var cw = CELL / 4, ch = CELL / 2;
      for (var y = 0; y < GH * 2; y++) for (var x = 0; x < GW * 4; x++) {
        var v = lit[y * GW * 4 + x];
        if (!v) continue;
        var warm = v > 0.8 ? "255,236,190" : "255,214,150";
        g.fillStyle = "rgba(" + warm + "," + v.toFixed(2) + ")";
        g.fillRect(x * cw + 2, y * ch + 4, cw - 3, ch - 7);
      }
    });
    [map, em].forEach(function (t) { t.repeat.set(1 / GW, 1 / GH); });
    return { map: map, em: em };
  }
  // กระเบื้องเคลือบ/เครื่องถ้วย: จุดสีเล็ก ๆ บนพื้นขาวนวล (คูณกับสีต่อจุด)
  function mosaicTex() {
    var t = canvasTex(128, 128, function (g, w, h) {
      g.fillStyle = "#f4efe6"; g.fillRect(0, 0, w, h);
      var cols = ["#c9d8e8", "#e8c9a8", "#d9e3c2", "#f0d58a", "#c4d2e9", "#e7b9b0", "#ffffff"];
      var seed = 3;
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      for (var i = 0; i < 420; i++) {
        g.fillStyle = cols[Math.floor(rnd() * cols.length)];
        var x = rnd() * w, y = rnd() * h, r = 1.5 + rnd() * 3.2;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
    });
    t.repeat.set(1, 1);
    return t;
  }
  var TONE = { dark: "#a3aec0", light: "#ffffff", sunset: "#f6e1d0" };
  function makeMaterials() {
    var g = glassTextures();
    mats = {
      glass: new T.MeshPhongMaterial({ color: 0xffffff, map: g.map, emissiveMap: g.em, emissive: 0x000000, shininess: 90, specular: 0x667788, flatShading: true }),
      solid: new T.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 6, specular: 0x111111 }),
      led: new T.MeshBasicMaterial({ vertexColors: true }),
      mosaic: new T.MeshPhongMaterial({ vertexColors: true, map: mosaicTex(), flatShading: true, shininess: 30, specular: 0x333333 }),
      gold: new T.MeshPhongMaterial({ color: 0xd9a441, shininess: 90, specular: 0xffe29a, flatShading: true }),
      roof: new T.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 24, specular: 0x222222 }),
      hover: new T.MeshBasicMaterial({ color: new T.Color(H.palette().glow), transparent: true, opacity: 0.32, depthWrite: false }),
      sel: new T.MeshBasicMaterial({ color: new T.Color(H.palette().glow), transparent: true, opacity: 0.5, depthWrite: false })
    };
    mats.glass.userData.tex = [g.map, g.em];
    // โมเดลอาคารเด่นของชั้นท่าเรือมีหน้าที่พันทิศไม่สม่ำเสมอ (หลังคาซ้อนชั้น ผ้าใบ ทางเดินโค้ง) → วาดสองด้าน
    // flatShading คิด normal จาก dFdx/dFdy จึงไม่มีปัญหาแสงกลับด้าน
    ["glass", "solid", "led", "mosaic", "gold", "roof"].forEach(function (k) { mats[k].side = T.DoubleSide; });
    theme(H.theme());
  }
  function theme(name) {
    if (!mats) return;
    var night = name === "dark", dusk = name === "sunset";
    ["solid", "roof"].forEach(function (k) { mats[k].color.set(TONE[name] || TONE.dark); });
    mats.mosaic.color.set(night ? "#958e82" : name === "light" ? "#f2eee6" : TONE[name] || TONE.dark);
    mats.glass.color.set(night ? "#8190a6" : "#ffffff");
    mats.glass.emissive.set(night ? "#ffffff" : dusk ? "#5a4a35" : "#000000");
    mats.led.color.set(night ? "#ffffff" : dusk ? "#d9dde4" : "#9aa3ad");
    mats.mosaic.emissive.set(night ? "#221809" : "#000000");        // ไฟส่องอาคารสีทองตอนกลางคืน (อ่อน ๆ ให้ยังเห็นเงาแต่ละชั้น)
    mats.gold.emissive.set(night ? "#4a3208" : dusk ? "#2a1c05" : "#000000");
    var glow = H.palette().glow;
    mats.hover.color.set(glow); mats.sel.color.set(glow);
  }

  /* ------------------------------------------------------------ โหลดโมเดล */
  function viewBoundsLocal() {
    var b = map.getBounds(), a = H.toLocal(b.getWest(), b.getSouth()), c = H.toLocal(b.getEast(), b.getNorth());
    return { x0: Math.min(a.x, c.x) - LOAD_MARGIN, x1: Math.max(a.x, c.x) + LOAD_MARGIN, y0: Math.min(a.y, c.y) - LOAD_MARGIN, y1: Math.max(a.y, c.y) + LOAD_MARGIN };
  }
  function checkLoads() {
    if (!visible || !group || !map || map.getZoom() < LOAD_ZOOM) return;
    var v = viewBoundsLocal();
    items.forEach(function (I) {
      if (I.state !== "idle") return;
      if (I.x < v.x0 || I.x > v.x1 || I.y < v.y0 || I.y > v.y1) return;
      loadItem(I);
    });
  }
  function loadItem(I) {
    I.state = "loading";
    ensureGltf().then(function (loader) {
      loader.load(I.it.file, function (gltf) {
        var root = new T.Group();
        root.position.set(I.x, I.y, 0);
        root.scale.set(I.k, I.k, I.k);
        var sc = gltf.scene;
        sc.rotation.x = Math.PI / 2;                 // glTF Y-up → ฉาก Z-up
        sc.traverse(function (o) {
          if (!o.isMesh) return;
          var nm = (o.material && o.material.name || "solid").replace(/\.\d+$/, "");
          if (o.material && o.material.dispose) o.material.dispose();
          o.material = mats[nm] || mats.solid;
          if (o.geometry.attributes.color && o.geometry.attributes.color.itemSize === 4) {
            // สีต่อจุดแบบ RGBA → ใช้แค่ RGB (ไม่ต้องเปิดโหมดโปร่งใส)
            var a = o.geometry.attributes.color, rgb = new Float32Array(a.count * 3);
            for (var i = 0; i < a.count; i++) { rgb[i * 3] = a.getX(i); rgb[i * 3 + 1] = a.getY(i); rgb[i * 3 + 2] = a.getZ(i); }
            o.geometry.setAttribute("color", new T.BufferAttribute(rgb, 3));
          }
          o.userData.lm = I.it.id;
        });
        root.add(sc);
        root.userData.lm = I.it.id;
        group.add(root);
        root.updateMatrixWorld(true);
        I.root = root;
        I.box = new T.Box3().setFromObject(root);
        I.state = "ready";
        updateHides();
        setChipState("ready");
        H.repaint();
      }, undefined, function (err) {
        I.state = "error";
        lastError = String(err && err.message || err);
        console.warn("landmark model", I.it.id, err);
      });
    }).catch(function (e) { I.state = "error"; lastError = String(e); });
  }

  /* กล่องเดิมที่ต้องหลบ: เฉพาะหลังที่โมเดลโหลดเสร็จแล้ว (ก่อนหน้านั้นยังเห็นกล่องเดิมอยู่) */
  function updateHides() {
    var on = visible && !!group;
    var ready = on ? items.filter(function (I) { return I.state === "ready"; }) : [];
    window.BKK_LM3D_HIDE = ready.map(function (I) { return I.it.lm; }).filter(Boolean);
    if (window.BKK_applyLandmarkFilters) { try { window.BKK_applyLandmarkFilters(); } catch (e) { console.warn(e); } }
    var ids = [];
    ready.forEach(function (I) { ids = ids.concat(I.it.osm || []); });
    H.excludeBuildings(MOD_ID, ids.length ? ids : null);
  }

  /* ---------------------------------------------------------- คลิก/ชี้ */
  var _rc = null;
  function pick(ray) {
    if (!group || !group.visible || map.getZoom() < SHOW_ZOOM) return null;
    if (!_rc) _rc = new T.Raycaster();
    _rc.ray.copy(ray);
    var best = null;
    items.forEach(function (I) {
      if (I.state !== "ready" || !I.box || !ray.intersectsBox(I.box)) return;
      var hits = _rc.intersectObject(I.root, true);
      for (var i = 0; i < hits.length; i++) {
        if (hits[i].object === hoverObj || hits[i].object === selObj) continue;
        if (!best || hits[i].distance < best.dist) best = { dist: hits[i].distance, hit: { I: I } };
        break;
      }
    });
    return best;
  }
  function overlay(I, mat) {
    var o = I.root.clone();
    o.traverse(function (m) { if (m.isMesh) { m.material = mat; m.renderOrder = 6; } });
    o.scale.multiplyScalar(1.004);
    o.position.z += 0.05;
    return o;
  }
  function setHover(hit) {
    var id = hit ? hit.I.it.id : null;
    if (id === hoverId) return;
    hoverId = id;
    if (hoverObj) { group.remove(hoverObj); hoverObj = null; }
    if (hit && id !== selId) { hoverObj = overlay(hit.I, mats.hover); group.add(hoverObj); }
    H.repaint();
  }
  function setSelected(hit) {
    selId = hit ? hit.I.it.id : null;
    if (selObj) { group.remove(selObj); selObj = null; }
    if (hoverObj) { group.remove(hoverObj); hoverObj = null; hoverId = null; }
    if (hit) { selObj = overlay(hit.I, mats.sel); group.add(selObj); }
    H.repaint();
  }

  /* --------------------------------------------------------------- UI */
  function setChipState(s) {
    var chip = $("#chipLandmark3D");
    if (!chip) return;
    var cnt = chip.querySelector(".chip-count");
    if (s === "loading") cnt.textContent = "…";
    else if (s === "error") { cnt.textContent = "!"; chip.title = "โหลดชั้นแลนด์มาร์ก 3 มิติไม่สำเร็จ"; }
    else if (s === "ready" && M) cnt.textContent = M.items.length + " แห่ง";
  }
  function syncButtons() {
    var chip = $("#chipLandmark3D"), btn = $("#btnLandmarksToggle") || $("#btnLandmark3DToggle");
    if (chip) chip.classList.toggle("active", visible);
    if (btn) btn.classList.toggle("active", visible);
  }
  function setVisible(v) {
    visible = v;
    lsSet(LS_KEY, v ? "1" : "0");
    syncButtons();
    if (group) group.visible = v;
    if (!v) {
      H.show(MOD_ID, false);
      closeCard();
      setHover(null);
      updateHides();
      return;
    }
    if (failed) { failed = false; loading = null; }
    ensureLoaded().then(function () {
      if (!group) return;
      H.show(MOD_ID, true);
      checkLoads();
      updateHides();
    });
  }
  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    var menu = $("#leftMenu");
    if (menu && !$("#btnLandmarksToggle") && !$("#btnLandmark3DToggle")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "menu-btn";
      btn.id = "btnLandmark3DToggle";
      btn.title = "เปิด/ปิดโมเดลแลนด์มาร์ก 3 มิติ";
      btn.innerHTML = '<span>' + ico("landmark") + '</span><span class="label-text"> แลนด์มาร์ก 3 มิติ</span>';
      btn.addEventListener("click", function () { setVisible(!visible); });
      menu.appendChild(btn);
    }
    if (!$("#lm3dCard")) {
      var card = document.createElement("div");
      card.id = "lm3dCard";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-label", "ข้อมูลแลนด์มาร์ก");
      ($(".stage") || document.body).appendChild(card);
      var st = document.createElement("style");
      st.textContent = "#lm3dCard{position:absolute;right:14px;top:14px;width:330px;max-width:calc(100% - 28px);z-index:40;" +
        "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.28);" +
        "backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:var(--text-main);font-size:12.5px;line-height:1.5;display:none}" +
        "#lm3dCard.open{display:block;animation:elvIn .22s ease}";
      document.head.appendChild(st);
    }
    syncButtons();
  }
  function showCard(hit) {
    var card = $("#lm3dCard");
    if (!card) return;
    var it = hit.I.it;
    card.innerHTML =
      '<div class="elv-head"><div class="elv-type">' + ico(it.icon || "building-2") + ' ' + esc(it.kind || "แลนด์มาร์ก") + '</div>' +
        '<h3 class="elv-name">' + esc(it.name || it.id) + '</h3>' + (it.en ? '<p class="elv-sub">' + esc(it.en) + '</p>' : '') +
        '<button type="button" class="elv-x" aria-label="ปิด">×</button></div>' +
      '<div class="elv-body">' +
        (it.facts || []).map(function (f) { return '<div class="elv-row"><b>' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></div>'; }).join("") +
        (it.note ? '<p class="elv-note" style="margin-top:8px">' + esc(it.note) + '</p>' : '') +
        '<div class="elv-actions"><button type="button" class="elv-btn primary" data-act="fly">' + ico("map-pin") + ' บินไปดู</button>' +
          (it.lm && window.BKK_openProjectDrawer ? '<button type="button" class="elv-btn" data-act="proj">' + ico("building-2") + ' ข้อมูลโครงการ</button>' : '') + '</div>' +
        '<p class="elv-note">' + esc(it.src || "") + ' · ผังอาคาร © OpenStreetMap contributors</p>' +
      '</div>';
    card.classList.add("open");
    card.querySelector(".elv-x").addEventListener("click", closeCard);
    card.querySelector('[data-act="fly"]').addEventListener("click", function () { flyTo(hit.I); });
    var pj = card.querySelector('[data-act="proj"]');
    if (pj) pj.addEventListener("click", function () { window.BKK_openProjectDrawer(it.lm); });
  }
  function closeCard() {
    var card = $("#lm3dCard");
    if (card) card.classList.remove("open");
    if (selId && group) setSelected(null);
  }
  function flyTo(I) {
    var h = I.it.h || 60;
    map.flyTo({ center: I.it.anchor, zoom: h > 200 ? 15.6 : h > 60 ? 16.6 : 17.2, pitch: 70, bearing: map.getBearing() + 40, duration: 1600 });
  }

  /* -------------------------------------------------------------- mount */
  function mount(m) {
    map = m;
    H = window.BKK_3D;
    if (!H) { console.warn("bkk-landmarks3d: ต้องโหลด bkk-3d-host.js ก่อน"); return; }
    H.attach(m);
    if (lsGet(LS_KEY) === "0") visible = false;
    buildUI();
    if (!mount._bound) {
      mount._bound = true;
      map.on("moveend", checkLoads);
    }
    if (!visible) return;
    var go = function () { ensureLoaded().then(function () { if (!group) return; H.show(MOD_ID, true); checkLoads(); updateHides(); }); };
    if (loading) go();
    else if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 4000 });
    else setTimeout(go, 1500);
  }

  window.BKK_LANDMARKS3D = {
    mount: mount,
    setVisible: setVisible,
    debug: function () {
      return { loaded: !!group, error: lastError, visible: visible,
        items: items.map(function (I) { return I.it.id + ":" + I.state; }), hide: window.BKK_LM3D_HIDE || [] };
    },
    load: function (id) { items.forEach(function (I) { if (I.it.id === id && I.state === "idle") loadItem(I); }); },
    internals: function () { return { items: items, group: group, mats: mats }; }
  };

  (function register() {
    var H0 = window.BKK_3D;
    if (!H0) return;
    H0.register({
      id: MOD_ID,
      get group() { return group; },
      pick: pick,
      click: function (hit) { setSelected(hit); showCard(hit); },
      hover: function (hit) { if (group) setHover(hit); },
      clear: closeCard,
      frame: function (z) {
        var show = z >= SHOW_ZOOM;
        for (var i = 0; i < items.length; i++) if (items[i].root && items[i].root.visible !== show) items[i].root.visible = show;
      },
      theme: function (name) { theme(name); },
      rendererReady: function (r) {
        if (!mats) return;
        var a = Math.min(8, r.capabilities.getMaxAnisotropy());
        mats.glass.userData.tex.concat([mats.mosaic.map]).forEach(function (t) { t.anisotropy = a; t.needsUpdate = true; });
      }
    });
  })();
})();
