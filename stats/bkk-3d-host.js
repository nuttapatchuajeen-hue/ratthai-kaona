/**
 * bkk-3d-host.js
 * "ฉาก 3 มิติกลาง" ของ bkk-city.html — custom layer ของ MapLibre + three.js หนึ่งตัว ใช้ร่วมกันทุกโมดูล
 * (ตอนนี้มี bkk-elevated.js = ทางด่วน/ทางยกระดับ และ bkk-rail3d.js = รางรถไฟฟ้า)
 *
 * หน้าที่: โหลด three.js · สร้างฉาก/กล้อง/แสง · เพิ่ม-ย้ายชั้นให้อยู่ถูกที่ · แปลงพิกัด · ยิงเรย์หาสิ่งที่ถูกคลิก
 *
 * โมดูลลงทะเบียนด้วย BKK_3D.register({ id, group, pick(ray), click(hit), hover(hit), theme(name) })
 * แล้วเรียก BKK_3D.show(id, true/false) เพื่อเปิด-ปิดชั้นของตัวเอง
 *
 * ⚠ ลำดับชั้นสำคัญ: MapLibre ปิด depth test ให้ชั้น 2D ทุกชั้นที่อยู่หลังชั้น 3D ชั้นแรก
 *   จึงต้องแทรกก่อน city-buildings-3d (คือหลังเส้นถนน/รางของแผนที่ฐานทั้งหมด) และ "ย้าย" ทุกครั้งที่ style โหลดใหม่
 */
(function () {
  "use strict";

  var THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  var LAYER_ID = "bkk-3d-world";
  var ORIGIN = [100.55, 13.75];
  var EARTH_CIRC = 2 * Math.PI * 6371008.8;
  var MIN_ZOOM = 11;

  // แสงและสีคอนกรีตกลาง (โมดูลใช้ต่อได้ผ่าน BKK_3D.concrete())
  // shadow = ความเข้มเงาบนพื้น (เงานุ่มใต้โครงสร้าง ให้ดูตั้งอยู่บนพื้นจริง ไม่ลอย)
  var PALETTE = {
    dark:   { concrete: "#8a97aa", sky: "#d8e6ff", ground: "#1a2230", hemi: 0.72, sun: "#ffffff", sunI: 0.62, glow: "#00E5FF", shadow: 0.5 },
    light:  { concrete: "#c4cad3", sky: "#ffffff", ground: "#6b7280", hemi: 0.78, sun: "#ffffff", sunI: 0.55, glow: "#04788F", shadow: 0.24 },
    sunset: { concrete: "#cdb1a0", sky: "#ffe6cf", ground: "#5a4438", hemi: 0.78, sun: "#ffc08a", sunI: 0.62, glow: "#FF5C1A", shadow: 0.32 }
  };
  var SUN = [0.45, -0.55, 0.7];          // ทิศแดด (มาจากตะวันออกเฉียงใต้ ค่อนข้างสูง) — ใช้ทั้งแสงและทิศเงา

  var LAT0 = ORIGIN[1] * Math.PI / 180, COS0 = Math.cos(LAT0);
  function mercX(lon) { return (180 + lon) / 360; }
  function mercY(lat) { return (180 - (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))) / 360; }
  var OX = mercX(ORIGIN[0]), OY = mercY(ORIGIN[1]), UNIT = EARTH_CIRC * COS0;

  var T = null, map = null, theme = "dark";
  var renderer = null, scene = null, camera = null, lights = null, concreteMat = null;
  var modelMatrix = null, mvpInv = null, mvpReady = false;
  var loading = null, mods = [], animOn = {}, eventsBound = false;
  var hoverMod = null, downAt = null, moveTimer = null, lastMove = 0;

  function readTheme() { var t = document.documentElement.getAttribute("data-theme"); return PALETTE[t] ? t : "dark"; }

  function loadScript(src) {
    return new Promise(function (ok, bad) {
      var s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = ok;
      s.onerror = function () { bad(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }

  function ensure() {
    if (loading) return loading;
    loading = (window.THREE ? Promise.resolve() : loadScript(THREE_URL)).then(function () {
      T = window.THREE;
      if (!T) throw new Error("THREE missing");
      theme = readTheme();
      var pal = PALETTE[theme];
      scene = new T.Scene();
      camera = new T.Camera();
      lights = {
        hemi: new T.HemisphereLight(pal.sky, pal.ground, pal.hemi),
        sun: new T.DirectionalLight(pal.sun, pal.sunI)
      };
      lights.hemi.position.set(0, 0, 1);
      lights.sun.position.set(SUN[0], SUN[1], SUN[2]);
      scene.add(lights.hemi, lights.sun);
      concreteMat = new T.MeshPhongMaterial({ color: pal.concrete, flatShading: true, shininess: 0, specular: 0x000000, side: T.DoubleSide });
      var s = 1 / UNIT;
      modelMatrix = new T.Matrix4().makeTranslation(OX, OY, 0).scale(new T.Vector3(s, -s, s));
      mvpInv = new T.Matrix4();
    });
    return loading;
  }

  /* ------------------------------------------------------------ ชั้นแผนที่ */
  function anyVisible() {
    for (var i = 0; i < mods.length; i++) if (mods[i].group && mods[i].group.visible) return true;
    return false;
  }
  function makeLayer() {
    return {
      id: LAYER_ID,
      type: "custom",
      renderingMode: "3d",
      onAdd: function (m, gl) {
        if (!renderer || renderer.getContext() !== gl) {
          renderer = new T.WebGLRenderer({ canvas: m.getCanvas(), context: gl, antialias: true });
          renderer.autoClear = false;
          mods.forEach(function (x) { if (x.rendererReady) x.rendererReady(renderer); });
        }
      },
      render: function (gl, args) {
        if (!scene) return;
        var z = map.getZoom();
        if (z < MIN_ZOOM) { mvpReady = false; return; }
        var mm = args && args.defaultProjectionData ? args.defaultProjectionData.mainMatrix : args;
        camera.projectionMatrix.fromArray(mm).multiply(modelMatrix);
        mvpInv.copy(camera.projectionMatrix).invert();
        mvpReady = true;
        var anim = false, i;
        for (i = 0; i < mods.length; i++) {
          if (mods[i].frame && mods[i].group && mods[i].group.visible) mods[i].frame(z);
          if (animOn[mods[i].id] && mods[i].group && mods[i].group.visible) anim = true;
        }
        renderer.resetState();
        renderer.setViewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        renderer.render(scene, camera);
        if (anim) map.triggerRepaint();
      }
    };
  }
  function syncLayer() {
    if (!map || !scene) return;
    if (!anyVisible()) {
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      return;
    }
    var before = map.getLayer("city-buildings-3d") ? "city-buildings-3d" : undefined;
    if (!before) {
      var layers = map.getStyle().layers || [], lastLine = -1, i;
      for (i = 0; i < layers.length; i++) if (layers[i].source === "openmaptiles" && layers[i].type === "line") lastLine = i;
      for (i = lastLine + 1; i < layers.length; i++) if (layers[i].type === "symbol") { before = layers[i].id; break; }
    }
    try {
      if (map.getLayer(LAYER_ID)) map.moveLayer(LAYER_ID, before);
      else map.addLayer(makeLayer(), before);
    } catch (e) { console.warn("BKK_3D layer:", e); }
  }

  /* ------------------------------------------------------------ คลิก/ชี้ */
  var _ray = null, _n = null, _f = null;
  function rayAt(px, py) {
    if (!mvpReady) return null;
    if (!_ray) { _ray = new T.Ray(); _n = new T.Vector3(); _f = new T.Vector3(); }
    var cv = map.getCanvas();
    var nx = px / cv.clientWidth * 2 - 1, ny = 1 - py / cv.clientHeight * 2;
    _n.set(nx, ny, -1).applyMatrix4(mvpInv);
    _f.set(nx, ny, 1).applyMatrix4(mvpInv);
    _ray.origin.copy(_n);
    _ray.direction.copy(_f).sub(_n).normalize();
    return _ray;
  }
  function pickAll(px, py) {
    var ray = rayAt(px, py);
    if (!ray) return null;
    var best = null;
    for (var i = 0; i < mods.length; i++) {
      var mod = mods[i];
      if (!mod.pick || !mod.group || !mod.group.visible) continue;
      var r = mod.pick(ray);
      if (r && (!best || r.dist < best.dist)) best = { dist: r.dist, hit: r.hit, mod: mod };
    }
    return best;
  }
  function bindEvents() {
    if (eventsBound || !map) return;
    eventsBound = true;
    var root = map.getContainer();
    root.addEventListener("pointerdown", function (e) { downAt = { x: e.clientX, y: e.clientY }; }, true);
    // ดักตั้งแต่ capture — ถ้าโดนของเรา หยุดไม่ให้ชั้นอื่น (ผังสี/เขต) เปิดแผงซ้อน
    root.addEventListener("click", function (e) {
      if (e.target !== map.getCanvas()) return;
      if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 5) return;
      var rect = map.getCanvas().getBoundingClientRect();
      var got = pickAll(e.clientX - rect.left, e.clientY - rect.top);
      if (got) {
        e.stopPropagation();
        mods.forEach(function (m) { if (m !== got.mod && m.clear) m.clear(); });
        if (got.mod.click) got.mod.click(got.hit);
      } else {
        mods.forEach(function (m) { if (m.clear) m.clear(); });
      }
    }, true);
    root.addEventListener("pointermove", function (e) {
      if (e.buttons || e.pointerType === "touch" || !scene) return;
      if (e.target !== map.getCanvas()) { setHover(null, null); return; }
      var run = function () {
        lastMove = Date.now();
        if (map.isMoving()) return;
        var rect = map.getCanvas().getBoundingClientRect();
        var got = pickAll(e.clientX - rect.left, e.clientY - rect.top);
        setHover(got && got.mod, got && got.hit);
      };
      clearTimeout(moveTimer);
      if (Date.now() - lastMove > 120) run(); else moveTimer = setTimeout(run, 120);
    }, { passive: true });
    map.on("movestart", function () { setHover(null, null); });
  }
  function setHover(mod, hit) {
    if (hoverMod && hoverMod !== mod && hoverMod.hover) hoverMod.hover(null);
    hoverMod = mod || null;
    if (mod && mod.hover) mod.hover(hit);
    if (map) map.getCanvas().style.cursor = mod ? "pointer" : "";
  }

  /* หัวเสาแบบบานออก (ทรงกรวยสี่เหลี่ยม) — เสาตอม่อจริงของไทยคอดที่โคนแล้วบานรับพื้นทาง
     หน่วยกล่อง 1×1×1: x = ตามแนวทาง, y = ขวางแนว (สเกลด้วยความกว้างที่ต้องรับ), z = 0 ที่โคนหัวเสา ถึง 1 ที่ใต้พื้นทาง */
  var headGeo = null;
  function headGeometry() {
    if (headGeo) return headGeo;
    var bx = 0.34, by = 0.1;        // สัดส่วนโคน (คอดเท่าเสา)
    var p = [], idx = [];
    function v(x, y, z) { p.push(x, y, z); return p.length / 3 - 1; }
    var b = [v(-bx, -by, 0), v(bx, -by, 0), v(bx, by, 0), v(-bx, by, 0)];
    var t = [v(-0.5, -0.5, 1), v(0.5, -0.5, 1), v(0.5, 0.5, 1), v(-0.5, 0.5, 1)];
    function q(a, c, d, e) { idx.push(a, c, d, a, d, e); }
    q(b[0], b[1], b[2], b[3]);
    q(t[0], t[1], t[2], t[3]);
    for (var i = 0; i < 4; i++) q(b[i], b[(i + 1) % 4], t[(i + 1) % 4], t[i]);
    headGeo = new T.BufferGeometry();
    headGeo.setAttribute("position", new T.Float32BufferAttribute(p, 3));
    headGeo.setIndex(idx);
    return headGeo;
  }

  /* เงานุ่มบนพื้น: สี่เหลี่ยมดำโปร่งที่ขอบค่อย ๆ จาง · "rect" จางทั้งสี่ด้าน (ใต้สถานี) · "strip" จางเฉพาะด้านข้าง (ใต้ทางวิ่ง)
     ไม่เขียน depth → ของที่วาดหลัง (ตึก 3 มิติ) ยังบังเงาได้ตามจริง */
  var shadowMats = null;
  function shadowMaterial(kind) {
    if (!shadowMats) {
      var mk = function (both) {
        var cv = document.createElement("canvas"), N = 64;
        cv.width = cv.height = N;
        var g = cv.getContext("2d"), img = g.createImageData(N, N);
        var f = function (x) { var a = Math.min(x, 1 - x) / 0.42; a = Math.max(0, Math.min(1, a)); return a * a * (3 - 2 * a); };
        for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
          var a = f((x + 0.5) / N) * (both ? f((y + 0.5) / N) : 1);
          img.data[(y * N + x) * 4 + 3] = Math.round(a * 255);
        }
        g.putImageData(img, 0, 0);
        var tx = new T.CanvasTexture(cv);
        return new T.MeshBasicMaterial({ color: 0x000000, map: tx, transparent: true, opacity: PALETTE[theme].shadow,
          depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
      };
      shadowMats = { rect: mk(true), strip: mk(false) };
    }
    return shadowMats[kind] || shadowMats.rect;
  }

  window.BKK_3D = {
    ensure: ensure,
    headGeometry: headGeometry,
    shadowMaterial: shadowMaterial,
    /* เงาของจุดที่สูง h ม. เลื่อนไปทางไหน (ม. ตะวันออก, ม. เหนือ) — ตามทิศแดด */
    sunShift: function (h) { return [-SUN[0] / SUN[2] * h, -SUN[1] / SUN[2] * h]; },
    renderer: function () { return renderer; },
    THREE: function () { return T; },
    scene: function () { return scene; },
    map: function () { return map; },
    concrete: function () { return concreteMat; },
    minZoom: MIN_ZOOM,
    /* พิกัด: x ตะวันออก, y เหนือ, z ขึ้นฟ้า — หน่วยเมตร ณ ละติจูดจุดอ้างอิง
       (คูณ kAt(lat) เมื่อแปลงความกว้าง/ความสูงจริงเป็นหน่วยนี้) */
    toLocal: function (lon, lat) { return { x: (mercX(lon) - OX) * UNIT, y: -(mercY(lat) - OY) * UNIT }; },
    kAt: function (lat) { return COS0 / Math.cos(lat * Math.PI / 180); },
    toLngLat: function (x, y) {
      var mx = x / UNIT + OX, my = -y / UNIT + OY;
      return [mx * 360 - 180, (360 / Math.PI) * Math.atan(Math.exp((180 - my * 360) * Math.PI / 180)) - 90];
    },
    register: function (mod) { mods.push(mod); if (renderer && mod.rendererReady) mod.rendererReady(renderer); },
    show: function (id, on) {
      for (var i = 0; i < mods.length; i++) if (mods[i].id === id && mods[i].group) mods[i].group.visible = !!on;
      syncLayer();
      if (map) map.triggerRepaint();
    },
    setAnim: function (id, on) { animOn[id] = !!on; if (map) map.triggerRepaint(); },
    repaint: function () { if (map) map.triggerRepaint(); },
    theme: function () { return theme; },
    palette: function () { return PALETTE[theme]; },
    /* หน้าเรียกทุกครั้งที่ style โหลด (สลับธีม) — ย้ายชั้นให้ถูกที่และแจ้งธีมใหม่ให้ทุกโมดูล */
    attach: function (m) {
      map = m;
      var t = readTheme();
      var changed = t !== theme;
      theme = t;
      if (scene) {
        var pal = PALETTE[theme];
        if (changed) {
          lights.hemi.color.set(pal.sky);
          lights.hemi.groundColor.set(pal.ground);
          lights.hemi.intensity = pal.hemi;
          lights.sun.color.set(pal.sun);
          lights.sun.intensity = pal.sunI;
          concreteMat.color.set(pal.concrete);
          if (shadowMats) { shadowMats.rect.opacity = pal.shadow; shadowMats.strip.opacity = pal.shadow; }
          mods.forEach(function (x) { if (x.theme) x.theme(theme, pal); });
        }
        bindEvents();
        syncLayer();
      }
    },
    /* ให้โมดูลเรียกหลังสร้างกลุ่มเสร็จ */
    ready: function () { bindEvents(); syncLayer(); }
  };
})();
