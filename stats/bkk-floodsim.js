/**
 * bkk-floodsim.js
 * ชั้น "จำลองน้ำท่วม 3 มิติ" ของ bkk-city.html — ผิวน้ำ 3 มิติ มีคลื่นและแสงสะท้อน ตึก 3 มิติโผล่พ้นน้ำ
 * วาดในฉากกลาง bkk-3d-host.js (three.js) ซึ่งแทรกก่อนชั้นตึก city-buildings-3d
 *   → ผิวน้ำเขียน depth ก่อน ส่วนของตึกที่อยู่ใต้ผิวน้ำจึงถูกบังเหมือนจมอยู่ในน้ำขุ่น
 *
 * สองโหมด
 *   "flat"  ความลึกน้ำเท่ากันทั้งพื้นที่ — ดูว่าน้ำลึก X ม. แล้วถนน/ตึกเป็นแบบไหน
 *   "dem"   ตามความสูงพื้นดิน — ตั้ง "ระดับน้ำ" (ม. เหนือระดับทะเลปานกลาง) ที่ต่ำกว่าระดับนี้ท่วม ลึกเท่าส่วนต่าง
 *           ความสูงพื้นดินจาก FABDEM (ลบความสูงตึก/ต้นไม้ออกแล้ว) → bkk-dem.png/json จาก _geo/build-bkk-dem.mjs
 *           ⚠ ข้อมูลฟรีทั่วไป (SRTM/Terrarium) ใช้ไม่ได้: ย่านสีลมได้ ~10 ม. เพราะนับความสูงตึก — FABDEM ได้ ~3.6 ม. (พื้นจริง ~1.5–2)
 *           ⚠ แบบ "อ่างน้ำ" (bathtub): ไม่คิดคันกั้นน้ำ ระบบสูบ/ระบายน้ำ ทิศทางการไหล — เห็นว่าที่ไหนต่ำ ไม่ใช่พยากรณ์
 *
 * ตำแหน่งแผ่นน้ำโหมด dem: จุดยอดวางตามพิกัดจริงทีละจุด (ละติจูดบนเมอร์เคเตอร์ไม่เป็นเส้นตรง ถ้ายืดแผ่นเดียวจะคลาดกลางภาพ ~40 ม.)
 *
 *   "sea"   น้ำทะเลหนุนตามปี/ฉากทัศน์ IPCC + แผ่นดินทรุด (แบบแผนที่ NYT/Climate Central) — โมดูลแยก bkk-sealevel.js
 *           ไฟล์นี้แค่ส่งต่อ: แผง · ทุกเฟรม · คลิก · เปิด-ปิด · ใช้เชเดอร์น้ำและกลุ่มในฉากร่วมกัน
 *
 * ระดับอ้างอิงความสูง: FABDEM อ้างอิงจีออยด์ EGM2008 ซึ่งสูงกว่า "ม.รทก." (หมุดเกาะหลัก) ราว 0.87 ม. ในที่ราบภาคกลาง
 *   → แปลงเป็น ม.รทก. ครั้งเดียวตอนโหลด (DATUM) ทุกตัวเลข/ระดับน้ำในโหมด dem จึงเป็น ม.รทก. จริง
 */
(function () {
  "use strict";

  var MOD_ID = "floodsim";
  var LS_ON = "bkk-floodsim-on", LS_DEPTH = "bkk-floodsim-depth", LS_STYLE = "bkk-floodsim-style", LS_WAVE = "bkk-floodsim-wave";
  var LS_MODE = "bkk-floodsim-mode", LS_LEVEL = "bkk-floodsim-level", LS_TERR = "bkk-floodsim-terrain";
  var DEM_PNG = "bkk-dem.png", DEM_JSON = "bkk-dem.json";
  // EGM2008 − ม.รทก. (Kolak-1915): +0.869 ± 0.064 ม. จากหมุด GNSS/ระดับ 20 จุดในพื้นที่ราบ (Engineering Journal, tuengr V12 2021)
  var DATUM = 0.87;
  var NODATA = -9, NODATA_TEST = -5;       // ทะเล/ไม่มีข้อมูล หลังแปลงเป็น รทก. (พื้นจริงต่ำสุดในกรอบ ~ −3.9)
  var MAX_DEPTH = 6, MIN_LEVEL = 0, MAX_LEVEL = 4;
  var FLOOR_H = 3.2;                       // ความสูงชั้นโดยประมาณ (ม.)
  var SEG = 480;                           // ตารางจุดยอดของแผ่นน้ำโหมด dem (~185 ม./ช่อง) — ขอบน้ำละเอียดตามภาพความสูง (~60 ม.) ในเฟรกเมนต์
  var HOME = { center: [100.5305, 13.7265], zoom: 16.3, pitch: 62, bearing: -28 };   // สีลม-สาทร: ตึกหลายระดับให้เห็นระดับน้ำชัด
  var HOME_DEM = { center: [100.56, 13.80], zoom: 11.2, pitch: 48, bearing: -10 };    // เห็นทั้งเมืองว่าที่ไหนต่ำ
  var PRESETS = [
    [0.1, "10 ซม.", "ท่วมขังผิวถนนหลังฝนหนัก"],
    [0.3, "30 ซม.", "รถเก๋งหลายรุ่นเริ่มลอย/ดับ"],
    [0.5, "50 ซม.", "ระดับเข่า"],
    [1, "1 ม.", "ท่วมชั้นล่างบ้าน"],
    [2, "2 ม.", "มิดหัวผู้ใหญ่"],
    [3.5, "3.5 ม.", "ชั้น 1 จมทั้งชั้น เริ่มท่วมชั้น 2"]
  ];
  var LEVELS = [0.5, 1, 1.5, 2, 2.5, 3];
  // น้ำลดวันต่อ ๆ ไป — อัตราเป็น "สมมติฐาน" ให้ผู้ใช้เลือก (ไม่มีแบบจำลองระบายน้ำจริง)
  var RATES = [[0.05, "ช้า 5 ซม./วัน"], [0.1, "ปานกลาง 10 ซม./วัน"], [0.2, "เร็ว 20 ซม./วัน"]];
  var POND_F = 0.35;                       // น้ำในแอ่งปิดลดช้ากว่า (ต้องรอสูบ/ซึม/ระเหย) — สมมติ ~1/3 ของอัตราน้ำลด
  var MAX_DAYS = 120, DAY_SEC = 0.45;      // เล่นไทม์ไลน์: วันละ 0.45 วินาที
  var LS_RATE = "bkk-floodsim-rate";
  var STYLES = {
    blue:  { n: "น้ำใส (ภาพประกอบ)", deep: "#1b5d96", sky: "#a8d8ff", op: 0.82 },
    muddy: { n: "น้ำขุ่นแบบน้ำท่วมจริง", deep: "#5e4a2c", sky: "#cdbb92", op: 0.9 }
  };
  // สีความสูงพื้นดิน (ม. รทก.) — ต่ำ = ม่วง/น้ำเงิน สูง = เหลือง/ส้ม
  var TERR = [[-1, "#5b21b6"], [0.5, "#1d4ed8"], [1, "#0284c7"], [1.5, "#0d9488"], [2, "#16a34a"], [3, "#84cc16"], [5, "#eab308"], [10, "#f97316"]];

  var H = null, T = null, map = null;
  var visible = false, uiBuilt = false, loading = null, group = null, mesh = null, mat = null;
  var demMesh = null, demMat = null, terrMesh = null, terrMat = null;
  var mode = "flat", depth = 1, shown = 0, level = 1.5, shownLevel = 1.5;
  var style = "blue", waves = true, terrain = false, surgeFrom = null, lastT = 0, t0 = performance.now();
  var picked = null, pickedGround = null;
  var dem = null, demLoading = null, demErr = null;
  var rate = 0.1, rec = null;              // rec = { peak, dayF, playing, maxDay, stats[] } ระหว่างดูน้ำลด

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function m2(v) { return Math.abs(v) < 1 ? Math.round(v * 100) + " ซม." : (Math.round(v * 100) / 100) + " ม."; }
  function num(v, d) { return Number(v).toLocaleString("th-TH", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }

  function addIcons() {
    var sp = document.getElementById("mdico-sprite");
    if (!sp) return;
    var add = function (id, body) {
      if (document.getElementById("i-" + id)) return;
      var s = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
      s.setAttribute("id", "i-" + id); s.setAttribute("viewBox", "0 0 24 24");
      s.innerHTML = body;
      sp.appendChild(s);
    };
    add("zoom-in", '<circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/>');
    add("waves", '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>');
    add("mountain", '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>');
    add("crosshair", '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>');
  }

  /* ================================================================ เชเดอร์ */
  // คลื่นจากผลรวมคลื่นไซน์หลายทิศ → เอียงเวกเตอร์ปกติ · แสง: กระจาย + สะท้อนแดด + Fresnel (มุมต่ำเห็นฟ้าสะท้อนมากขึ้น)
  var WATER_LIGHT = [
    "uniform float uTime, uOpacity, uWave;",
    "uniform vec3 uDeep, uSky, uSun, uEye;",
    "float wv(vec2 p){",
    "  return sin(dot(p, vec2(0.071, 0.043)) + uTime * 1.6) * 0.35",
    "       + sin(dot(p, vec2(-0.052, 0.089)) - uTime * 1.25) * 0.30",
    "       + sin(dot(p, vec2(0.19, -0.13)) + uTime * 2.3) * 0.12",
    "       + sin(dot(p, vec2(-0.27, -0.31)) - uTime * 2.9) * 0.08",
    "       + sin(dot(p, vec2(0.61, 0.47)) + uTime * 4.1) * 0.03;",
    "}",
    "vec4 water(vec3 w, float deepMix){",
    "  vec2 p = w.xy; float e = 0.5;",
    "  float hx = wv(p + vec2(e, 0.0)) - wv(p - vec2(e, 0.0));",
    "  float hy = wv(p + vec2(0.0, e)) - wv(p - vec2(0.0, e));",
    "  vec3 n = normalize(vec3(-hx * uWave, -hy * uWave, 1.0));",
    "  vec3 L = normalize(uSun);",
    "  vec3 V = normalize(uEye - w);",
    "  float fres = pow(1.0 - clamp(dot(n, V), 0.0, 1.0), 3.0);",
    "  float diff = 0.55 + 0.45 * clamp(dot(n, L), 0.0, 1.0);",
    "  float spec = pow(clamp(dot(reflect(-L, n), V), 0.0, 1.0), 90.0);",
    "  vec3 deep = uDeep * (1.0 - 0.35 * deepMix);",
    "  vec3 col = mix(deep * diff, uSky, clamp(fres * 0.75, 0.0, 0.85)) + vec3(1.0) * spec * 0.9;",
    "  return vec4(col, clamp(uOpacity + fres * 0.12 + spec * 0.3, 0.0, 0.97));",
    "}"
  ].join("\n");
  var VERT = [
    "varying vec3 vW;",
    "void main(){",
    "  vec4 w = modelMatrix * vec4(position, 1.0);",
    "  vW = w.xyz;",
    "  gl_Position = projectionMatrix * viewMatrix * w;",
    "}"
  ].join("\n");
  var FRAG = [WATER_LIGHT, "varying vec3 vW;", "void main(){ gl_FragColor = water(vW, 0.0); }"].join("\n");

  // โหมด dem: เท็กซ์เจอร์ R = ความสูงพื้น h, G = ระดับล้นออกของแอ่ง f (= h ถ้าไม่ใช่แอ่ง)
  //   ผิวน้ำ s = max(ระดับน้ำที่ไหลออกได้ L, min(ระดับสูงสุด P, f) − ส่วนที่แอ่งลดไปแล้ว)
  //   ตอนตั้งระดับน้ำปกติ P = L และแอ่งไม่ลด → s = L · ตอนน้ำลด L ลดเร็ว แอ่งลดช้า → เห็นน้ำขังค้าง
  //   ความลึก d = s − h ยกผิวน้ำขึ้นเท่านั้น · ตัดทิ้งตรงที่แห้งหรือเป็นทะเล/ไม่มีข้อมูล
  var DEM_SURF = [
    "uniform float uLevel, uPeak, uPondDrop;",
    "float pondTop(float f){ return min(uPeak, f) - uPondDrop; }",
    "float surf(vec2 hf){ return max(uLevel, pondTop(hf.g)); }"
  ].join("\n");
  var DEM_VERT = [
    "uniform sampler2D uDem; uniform float uK;",
    DEM_SURF,
    "varying vec3 vW; varying vec2 vUv;",
    "void main(){",
    "  vUv = uv;",
    "  vec2 hf = texture2D(uDem, uv).rg;",
    "  float d = hf.r < -5.0 ? 0.0 : max(surf(hf) - hf.r, 0.0);",
    "  vec4 w = modelMatrix * vec4(position.xy, d * uK + 0.03, 1.0);",
    "  vW = w.xyz;",
    "  gl_Position = projectionMatrix * viewMatrix * w;",
    "}"
  ].join("\n");
  var DEM_FRAG = [
    WATER_LIGHT,
    "uniform sampler2D uDem; uniform float uRec;",
    "uniform vec3 uPondCol, uMudCol;",
    DEM_SURF,
    "varying vec3 vW; varying vec2 vUv;",
    "void main(){",
    "  vec2 hf = texture2D(uDem, vUv).rg;",
    "  float h = hf.r;",
    "  if (h < -5.0) discard;",
    "  float d = surf(hf) - h;",
    "  if (d < 0.01) {",
    // หลังน้ำลด: ที่เคยท่วมแต่แห้งแล้ว = คราบโคลนจาง ๆ
    "    if (uRec > 0.5 && h < uPeak - 0.02) { gl_FragColor = vec4(uMudCol, 0.3); return; }",
    "    discard;",
    "  }",
    "  vec4 c = water(vW, clamp(d / 3.0, 0.0, 1.0));",
    // น้ำขังในแอ่งปิด (ผิวน้ำสูงกว่าระดับที่ไหลออกได้) — ย้อมสีเขียวขุ่น
    "  float pond = uRec > 0.5 ? step(uLevel + 0.005, pondTop(hf.g)) : 0.0;",
    "  c.rgb = mix(c.rgb, uPondCol, pond * 0.55);",
    "  c.a *= smoothstep(0.0, 0.2, d);",          // ขอบน้ำตื้นค่อย ๆ จาง
    "  gl_FragColor = c;",
    "}"
  ].join("\n");
  // ชั้นสีความสูงพื้นดิน (วางบนพื้น ไม่เขียน depth ให้ตึกวาดทับได้ตามปกติ)
  var TERR_FRAG = [
    "uniform sampler2D uDem; uniform float uAlpha;",
    "uniform vec3 uC[8]; uniform float uT[8];",
    "varying vec2 vUv;",
    "void main(){",
    "  float h = texture2D(uDem, vUv).r;",
    "  if (h < -5.0) discard;",
    "  vec3 c = uC[0];",
    "  for (int i = 1; i < 8; i++) c = mix(c, uC[i], clamp((h - uT[i - 1]) / (uT[i] - uT[i - 1]), 0.0, 1.0));",
    "  gl_FragColor = vec4(c, uAlpha);",
    "}"
  ].join("\n");
  var TERR_VERT = [
    "varying vec2 vUv;",
    "void main(){ vUv = uv; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position.xy, 0.02, 1.0); }"
  ].join("\n");

  function waterUniforms() {
    var st = STYLES[style];
    return {
      uTime: { value: 0 }, uOpacity: { value: st.op }, uWave: { value: 0.55 },
      uDeep: { value: new T.Color(st.deep) }, uSky: { value: new T.Color(st.sky) },
      uSun: { value: new T.Vector3(0.45, -0.55, 0.7) }, uEye: { value: new T.Vector3(0, 0, 3000) }
    };
  }
  function makeMesh() {
    mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: true, side: T.DoubleSide, uniforms: waterUniforms() });
    mesh = new T.Mesh(new T.PlaneGeometry(1, 1, 1, 1), mat);
    mesh.renderOrder = -1;                  // วาดก่อนวัตถุโปร่งอื่นในฉาก (เงา ป้าย)
    mesh.frustumCulled = false;
  }
  function applyStyle() {
    var st = STYLES[style];
    [mat, demMat].forEach(function (m) {
      if (!m) return;
      m.uniforms.uDeep.value.set(st.deep);
      m.uniforms.uSky.value.set(st.sky);
      m.uniforms.uOpacity.value = st.op;
    });
    if (window.BKK_SEALEVEL) window.BKK_SEALEVEL.applyStyle(st);
  }

  /* ================================================================ ข้อมูลความสูงพื้นดิน (FABDEM) */
  // float32 → half float (สำหรับเท็กซ์เจอร์ R16F ที่กรองเชิงเส้นได้ใน WebGL2 โดยไม่ต้องใช้ส่วนขยาย)
  var _f32 = new Float32Array(1), _u32 = new Uint32Array(_f32.buffer);
  function toHalf(v) {
    _f32[0] = v;
    var x = _u32[0], s = (x >>> 16) & 0x8000, e = ((x >>> 23) & 0xff) - 127 + 15, m = x & 0x7fffff;
    if (e <= 0) return s;
    if (e >= 31) return s | 0x7c00;
    return s | (e << 10) | (m >>> 13);
  }
  function loadDem() {
    if (dem) return Promise.resolve(dem);
    if (demLoading) return demLoading;
    demLoading = fetch(DEM_JSON).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).then(function (meta) {
      return new Promise(function (ok, bad) {
        var img = new Image();
        img.onload = function () { ok({ meta: meta, img: img }); };
        img.onerror = function () { bad(new Error("โหลดภาพความสูงไม่สำเร็จ")); };
        img.src = DEM_PNG;
      });
    }).then(function (x) {
      var W = x.meta.w, Hh = x.meta.h, cv = document.createElement("canvas");
      cv.width = W; cv.height = Hh;
      var g = cv.getContext("2d", { willReadFrequently: true });
      g.drawImage(x.img, 0, 0);
      var px = g.getImageData(0, 0, W, Hh).data, n = W * Hh;
      var h = new Float32Array(n), fl = new Float32Array(n), half = new Uint16Array(n * 2), land = [];
      for (var i = 0; i < n; i++) {
        var v = (px[i * 4] * 256 + px[i * 4 + 1]) / 100 - 5;
        v = v > x.meta.nodata_below ? v - DATUM : NODATA;    // EGM2008 → ม.รทก.
        var f = v + px[i * 4 + 2] / 50;          // B = ความลึกแอ่งปิด (หน่วย 2 ซม.)
        h[i] = v; fl[i] = f;
        half[i * 2] = toHalf(v); half[i * 2 + 1] = toHalf(f);
        if (v > NODATA_TEST) land.push(v);
      }
      var sorted = Float32Array.from(land).sort();
      var b = x.meta.bbox, midLat = (b[1] + b[3]) / 2;
      var cellKm2 = (x.meta.res_arcsec / 3600 * 111.32 * Math.cos(midLat * Math.PI / 180)) * (x.meta.res_arcsec / 3600 * 110.57);
      // ชั้นประกอบ (floodsim-extra) อ่าน meta.nodata_below → ให้ตรงกับค่าหลังแปลงระดับอ้างอิง
      var meta = Object.assign({}, x.meta, { nodata_below: NODATA_TEST, vertical: "ม.รทก. (แปลงจาก EGM2008 − " + DATUM + " ม.)" });
      dem = { meta: meta, W: W, H: Hh, h: h, fill: fl, half: half, sorted: sorted, cellKm2: cellKm2 };
      demErr = null;
      return dem;
    }).catch(function (e) { demErr = String(e.message || e); demLoading = null; throw e; });
    return demLoading;
  }
  // ความสูงพื้นดินที่พิกัด (ประมาณค่าแบบสองเชิงเส้น) · null = นอกกรอบ/ทะเล
  function groundAt(lon, lat) {
    if (!dem) return null;
    var b = dem.meta.bbox;
    if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) return null;
    var fx = (lon - b[0]) / (b[2] - b[0]) * dem.W - 0.5, fy = (b[3] - lat) / (b[3] - b[1]) * dem.H - 0.5;
    var x0 = Math.max(0, Math.min(dem.W - 2, Math.floor(fx))), y0 = Math.max(0, Math.min(dem.H - 2, Math.floor(fy)));
    var tx = Math.max(0, Math.min(1, fx - x0)), ty = Math.max(0, Math.min(1, fy - y0));
    var a = dem.h[y0 * dem.W + x0], c = dem.h[y0 * dem.W + x0 + 1], d = dem.h[(y0 + 1) * dem.W + x0], e = dem.h[(y0 + 1) * dem.W + x0 + 1];
    if (Math.min(a, c, d, e) < dem.meta.nodata_below) return null;
    return (a * (1 - tx) + c * tx) * (1 - ty) + (d * (1 - tx) + e * tx) * ty;
  }
  function areaBelow(L) {
    if (!dem) return null;
    var s = dem.sorted, lo = 0, hi = s.length;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (s[mid] < L) lo = mid + 1; else hi = mid; }
    return { km2: lo * dem.cellKm2, pct: lo / s.length * 100, totalKm2: s.length * dem.cellKm2 };
  }
  function fillAt(lon, lat) {
    if (!dem) return null;
    var b = dem.meta.bbox, x = Math.floor((lon - b[0]) / (b[2] - b[0]) * dem.W), y = Math.floor((b[3] - lat) / (b[3] - b[1]) * dem.H);
    if (x < 0 || y < 0 || x >= dem.W || y >= dem.H) return null;
    return dem.fill[y * dem.W + x] - dem.h[y * dem.W + x];      // ความลึกแอ่ง ณ ช่องนั้น
  }

  /* ================================================================ น้ำลดวันต่อ ๆ ไป
     น้ำที่ไหลออกได้: ระดับ L(d) = P − r·d · น้ำในแอ่งปิด: ผิว min(P, f) − r·POND_F·d (ลดช้ากว่า)
     จุดหนึ่ง "แห้ง" เมื่อทั้งสองต่ำกว่าพื้น → วันแห้ง = max((P−h)/r, (min(P,f)−h)/(r·POND_F))
     กลายเป็น "น้ำขัง" (ผิวแอ่งสูงกว่าน้ำที่ไหลออก) ตั้งแต่วัน (P − min(P,f)) / (r·(1−POND_F))
     คำนวณสองค่านี้ต่อช่องครั้งเดียว แล้วสรุปรายวันด้วยอาร์เรย์ผลต่าง — เลื่อนวันไม่ต้องวนสองล้านช่องใหม่ */
  function curRecLevel() { return rec.peak - rate * rec.dayF; }
  function dryDayOf(h, f, P) {
    if (h >= P - 0.02) return -1;                                   // ไม่ท่วมตั้งแต่แรก
    var top = Math.min(P, f);
    return Math.max((P - h - 0.01) / rate, (top - h - 0.01) / (rate * POND_F), 0);
  }
  function buildRecStats() {
    var P = rec.peak;
    if (mode !== "dem" || !dem) { rec.maxDay = Math.min(MAX_DAYS, Math.max(1, Math.ceil(P / rate))); rec.stats = null; return; }
    var D = MAX_DAYS + 2, wet = new Float64Array(D), pond = new Float64Array(D), ever = 0, maxDry = 0;
    var Hh = dem.h, F = dem.fill, nb = dem.meta.nodata_below;
    for (var i = 0; i < Hh.length; i++) {
      var h = Hh[i];
      if (h <= nb || h >= P - 0.02) continue;
      ever++;
      var dd = dryDayOf(h, F[i], P), end = Math.min(D - 1, Math.ceil(dd));
      if (dd > maxDry) maxDry = dd;
      wet[0]++; wet[end]--;                                        // เปียกวัน 0 … end−1
      var top = Math.min(P, F[i]);
      if (top > h + 0.01) {
        var ps = (P - top) / (rate * (1 - POND_F)), st = Math.min(D - 1, Math.floor(ps) + 1);
        if (st < end) { pond[st]++; pond[end]--; }
      }
    }
    for (var d = 1; d < D; d++) { wet[d] += wet[d - 1]; pond[d] += pond[d - 1]; }
    rec.stats = { wet: wet, pond: pond, ever: ever };
    // หลุมลึกไม่กี่จุด (บ่อ/ข้อมูลผิดพลาด) ค้างนานมาก → ใช้วันที่แห้ง 99% ของพื้นที่ที่เคยท่วมเป็นจุดจบไทม์ไลน์
    var d99 = D - 1;
    for (d = 0; d < D; d++) if (wet[d] <= ever * 0.01) { d99 = d; break; }
    rec.maxDay = Math.min(MAX_DAYS, Math.max(1, d99, Math.min(Math.ceil(maxDry), 1)));
    rec.tail = maxDry > rec.maxDay;
  }
  function startRec() {
    var P = mode === "dem" ? level : depth;
    if (P <= 0.02) return;
    surgeFrom = null;
    rec = { peak: P, dayF: 0, shownDay: 0, playing: true, maxDay: 1, stats: null };
    if (mode === "dem") shownLevel = level; else shown = depth;
    buildRecStats();
    renderPanel();
    if (H) { H.setAnim(MOD_ID, true); H.repaint(); }
  }
  function stopRec() {
    rec = null;
    if (mode === "dem") shownLevel = level; else shown = depth;
    renderPanel();
    if (H) { H.setAnim(MOD_ID, true); H.repaint(); }
  }
  function setRecPlaying(on) {
    if (!rec) return;
    if (on && rec.dayF >= rec.maxDay) rec.dayF = 0;
    rec.playing = !!on;
    var b = $("#fsRecPlay"); if (b) b.innerHTML = ico(rec.playing ? "pause" : "play");
    if (H) { H.setAnim(MOD_ID, true); H.repaint(); }
  }

  function buildDemMeshes() {
    if (demMesh || !dem) return;
    var b = dem.meta.bbox, N = SEG + 1, pos = new Float32Array(N * N * 3), uv = new Float32Array(N * N * 2), idx = [];
    for (var j = 0; j < N; j++) {
      var lat = b[3] - (b[3] - b[1]) * j / SEG;
      for (var i = 0; i < N; i++) {
        var lon = b[0] + (b[2] - b[0]) * i / SEG, p = H.toLocal(lon, lat), k = j * N + i;
        pos[k * 3] = p.x; pos[k * 3 + 1] = p.y; pos[k * 3 + 2] = 0;
        uv[k * 2] = i / SEG; uv[k * 2 + 1] = j / SEG;      // แถว 0 ของภาพ = ขอบเหนือ (ไม่พลิกภาพ)
      }
    }
    for (j = 0; j < SEG; j++) for (i = 0; i < SEG; i++) {
      var a = j * N + i;
      idx.push(a, a + N, a + 1, a + 1, a + N, a + N + 1);
    }
    var geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("uv", new T.BufferAttribute(uv, 2));
    geo.setIndex(new T.BufferAttribute(N * N > 65535 ? new Uint32Array(idx) : new Uint16Array(idx), 1));
    var tex = new T.DataTexture(dem.half, dem.W, dem.H, T.RGFormat, T.HalfFloatType);   // R = พื้น, G = ระดับล้นแอ่ง
    tex.minFilter = T.LinearFilter; tex.magFilter = T.LinearFilter;
    tex.wrapS = tex.wrapT = T.ClampToEdgeWrapping;
    tex.flipY = false; tex.generateMipmaps = false; tex.unpackAlignment = 4;
    // three r128 เดารูปแบบภายในของ RG + HalfFloat ไม่เป็น (ส่ง RG แบบไม่ระบุขนาด → WebGL2 ปฏิเสธเงียบ ๆ ค่าที่อ่านได้เป็น 0 ทั้งภาพ)
    tex.internalFormat = "RG16F";
    tex.needsUpdate = true;
    var k0 = H.kAt((b[1] + b[3]) / 2);
    var u = waterUniforms();
    u.uDem = { value: tex }; u.uLevel = { value: shownLevel }; u.uK = { value: k0 };
    u.uPeak = { value: shownLevel }; u.uPondDrop = { value: 0 }; u.uRec = { value: 0 };
    u.uPondCol = { value: new T.Color("#7a8a2e") }; u.uMudCol = { value: new T.Color("#8a6d3f") };
    demMat = new T.ShaderMaterial({ vertexShader: DEM_VERT, fragmentShader: DEM_FRAG, transparent: true, depthWrite: true, side: T.DoubleSide, uniforms: u });
    demMesh = new T.Mesh(geo, demMat);
    demMesh.renderOrder = -1; demMesh.frustumCulled = false;
    terrMat = new T.ShaderMaterial({
      vertexShader: TERR_VERT, fragmentShader: TERR_FRAG, transparent: true, depthWrite: false,
      uniforms: {
        uDem: { value: tex }, uAlpha: { value: 0.55 },
        uC: { value: TERR.map(function (t) { return new T.Color(t[1]); }) }, uT: { value: TERR.map(function (t) { return t[0]; }) }
      }
    });
    terrMesh = new T.Mesh(geo, terrMat);
    terrMesh.renderOrder = -2; terrMesh.frustumCulled = false;
    group.add(terrMesh, demMesh);
  }

  /* ================================================================ ทุกเฟรม (เรียกจาก bkk-3d-host.js) */
  function approach(cur, tgt, rate, dt) {
    if (cur < tgt) return Math.min(tgt, cur + rate * dt);
    if (cur > tgt) return Math.max(tgt, cur - rate * dt);
    return cur;
  }
  function frame(z) {
    if (!mesh) return;
    var now = performance.now(), dt = Math.min(0.1, (now - (lastT || now)) / 1000);
    lastT = now;
    if (mode === "sea") {
      // โหมดน้ำทะเลหนุน: ซ่อนแผ่นน้ำของสองโหมดเดิม ให้ bkk-sealevel.js วาดผิวน้ำของตัวเอง (เชเดอร์น้ำชุดเดียวกัน)
      mesh.visible = false;
      if (demMesh) { demMesh.visible = false; terrMesh.visible = false; }
      var SL = window.BKK_SEALEVEL;
      var mv = SL ? SL.frame(z, { time: waves ? (now - t0) / 1000 : 0, wave: waves ? 0.55 : 0.12, eye: H.eye() }) : false;
      H.setAnim(MOD_ID, visible && (waves || mv || (SL && SL.moving())));
      return;
    }
    var dem3 = mode === "dem" && demMesh;
    if (rec) {
      // น้ำลดวันต่อ ๆ ไป: เดินวันแบบต่อเนื่อง (เศษวันทำให้ผิวน้ำลดลื่น ๆ) · ตัวเลขบนแผงเปลี่ยนเมื่อขึ้นวันใหม่
      if (rec.playing) {
        rec.dayF = Math.min(rec.maxDay, rec.dayF + dt / DAY_SEC);
        if (rec.dayF >= rec.maxDay) { rec.playing = false; var pb = $("#fsRecPlay"); if (pb) pb.innerHTML = ico("play"); }
      }
      var di = Math.floor(rec.dayF + 1e-6);
      if (di !== rec.shownDay) { rec.shownDay = di; renderRecLive(); }
      if (!dem3) shown = Math.max(0, rec.peak - rate * rec.dayF);
    } else
    // น้ำหลาก: ค่อย ๆ ขึ้นจากระดับเดิมถึงเป้าหมายภายใน ~7 วินาที · ปรับแถบเลื่อน = ขยับตามเร็ว
    if (dem3) {
      var rl = surgeFrom != null ? Math.max(0.12, (level - surgeFrom) / 7) : Math.max(1.5, Math.abs(level - shownLevel) * 5);
      shownLevel = approach(shownLevel, level, rl, dt);
      if (surgeFrom != null && Math.abs(shownLevel - level) < 1e-4) { surgeFrom = null; renderLive(); }
    } else {
      var rs = surgeFrom != null ? Math.max(0.12, depth / 7) : Math.max(1.5, Math.abs(depth - shown) * 5);   // อย่าตั้งชื่อ rate — บังตัวแปรอัตราน้ำลด
      shown = approach(shown, depth, rs, dt);
      if (surgeFrom != null && Math.abs(shown - depth) < 1e-4) { surgeFrom = null; renderLive(); }
    }
    var e = H.eye(), tm = waves ? (now - t0) / 1000 : 0, wv = waves ? (surgeFrom != null ? 1.1 : 0.55) : 0.12;
    mesh.visible = !dem3 && shown > 0.005;
    if (mesh.visible) {
      var c = map.getCenter(), p = H.toLocal(c.lng, c.lat), k = H.kAt(c.lat);
      // แผ่นน้ำใหญ่พอให้ถึงขอบฟ้าเวลากล้องเอียงมาก ๆ — ขยายตามระดับซูม
      var S = Math.max(24000, 420000 / Math.pow(2, z - 11));
      mesh.position.set(p.x, p.y, Math.max(0.02, shown) * k);
      mesh.scale.set(S, S, 1);
      mat.uniforms.uTime.value = tm; mat.uniforms.uWave.value = wv;
      if (e) mat.uniforms.uEye.value.copy(e);
    }
    if (demMesh) {
      demMesh.visible = !!dem3;
      terrMesh.visible = mode === "dem" && terrain;
      if (rec && dem3) {
        demMat.uniforms.uLevel.value = curRecLevel();
        demMat.uniforms.uPeak.value = rec.peak;
        demMat.uniforms.uPondDrop.value = rate * POND_F * rec.dayF;
        demMat.uniforms.uRec.value = 1;
      } else {
        demMat.uniforms.uLevel.value = shownLevel;
        demMat.uniforms.uPeak.value = shownLevel;
        demMat.uniforms.uPondDrop.value = 0;
        demMat.uniforms.uRec.value = 0;
      }
      demMat.uniforms.uTime.value = tm; demMat.uniforms.uWave.value = wv;
      if (e) demMat.uniforms.uEye.value.copy(e);
    }
    if (surgeFrom != null) { var el = $("#fsDepthNow"); if (el) el.textContent = mode === "dem" ? m2(shownLevel) : m2(shown); }
    var moving = rec ? rec.playing : dem3 ? shownLevel !== level : shown !== depth;
    H.setAnim(MOD_ID, visible && (waves || moving));
  }

  function ensureLoaded() {
    if (loading) return loading;
    loading = H.ensure().then(function () {
      T = H.THREE();
      group = new T.Group();
      group.visible = false;
      makeMesh();
      group.add(mesh);
      H.scene().add(group);
      H.register({ id: MOD_ID, group: group, frame: frame, theme: function () { } });
      H.ready();
      if (window.BKK_SEALEVEL) window.BKK_SEALEVEL.attach3D({ T: T, H: H, group: group, waterUniforms: waterUniforms, WATER_LIGHT: WATER_LIGHT });
    });
    return loading;
  }
  function ensureDem() {
    return Promise.all([ensureLoaded(), loadDem()]).then(function () { buildDemMeshes(); if (H) H.repaint(); });
  }

  /* ================================================================ คลิกบนแผนที่: ตึกที่เลือก + ความสูงพื้นดิน */
  function onMapClick(e) {
    if (!visible) return;
    if (mode === "sea") { if (window.BKK_SEALEVEL) window.BKK_SEALEVEL.click(e); return; }
    pickedGround = dem ? { lon: e.lngLat.lng, lat: e.lngLat.lat, h: groundAt(e.lngLat.lng, e.lngLat.lat), pond: fillAt(e.lngLat.lng, e.lngLat.lat) || 0 } : null;
    picked = null;
    if (map.getLayer("city-buildings-3d")) {
      var p = e.point, fs = map.queryRenderedFeatures([[p.x - 2, p.y - 2], [p.x + 2, p.y + 2]], { layers: ["city-buildings-3d"] });
      if (fs.length) { var pr = fs[0].properties || {}; picked = { h: +pr.render_height || 5, min: +pr.render_min_height || 0 }; }
    }
    renderLive();
  }
  // ความลึกน้ำที่ตึก/จุดที่เลือก
  function localDepth() {
    if (mode !== "dem") return rec ? Math.max(0, rec.peak - rate * rec.dayF) : depth;
    if (!pickedGround || pickedGround.h == null) return null;
    var h = pickedGround.h;
    if (rec) {
      if (h >= rec.peak - 0.02) return 0;
      var top = Math.min(rec.peak, h + pickedGround.pond) - rate * POND_F * rec.dayF;
      return Math.max(0, Math.max(curRecLevel(), top) - h);
    }
    return Math.max(0, level - h);
  }
  function curValue() {                    // ตัวเลขใหญ่บนแผง: ระดับน้ำ (dem) หรือความลึก (flat) ณ ตอนนี้
    if (rec) return mode === "dem" ? curRecLevel() : Math.max(0, rec.peak - rate * rec.dayF);
    return mode === "dem" ? (surgeFrom != null ? shownLevel : level) : (surgeFrom != null ? shown : depth);
  }
  function pickHTML() {
    var s = "";
    if (mode === "dem") {
      if (!pickedGround) return '<p class="fs-note">' + ico("mountain") + ' กดจุดไหนก็ได้บนแผนที่เพื่อดูความสูงพื้นดินและความลึกน้ำตรงนั้น</p>';
      if (pickedGround.h == null) return '<p class="fs-note">จุดที่เลือกอยู่นอกพื้นที่ข้อมูล (กทม.-ปริมณฑล) หรือเป็นทะเล</p>';
      var d = localDepth(), ref = rec ? rec.peak : level;
      s += '<div class="fs-gr"><b>จุดที่เลือก</b> พื้นดินสูง <b>' + pickedGround.h.toFixed(2) + ' ม.</b> รทก. → ' +
        (d > 0.005 ? 'น้ำลึก <b class="fs-bad">' + m2(d) + '</b>' :
          pickedGround.h >= ref - 0.02 ? '<b class="fs-ok">ไม่ท่วม</b> (สูงกว่าน้ำ ' + m2(pickedGround.h - ref) + ')' : '<b class="fs-ok">แห้งแล้ว</b>');
      if (rec) {
        var dd = dryDayOf(pickedGround.h, pickedGround.h + pickedGround.pond, rec.peak);
        if (dd >= 0) s += '<br>น้ำตรงนี้แห้งประมาณ <b>วันที่ ' + Math.ceil(dd) + '</b>' + (pickedGround.pond > 0.1 ? ' <small>(เป็นแอ่ง ลึก ~' + m2(pickedGround.pond) + ' — น้ำขังนานกว่ารอบข้าง)</small>' : "");
      } else if (pickedGround.pond > 0.1) s += '<br><small>จุดนี้เป็นแอ่งลึก ~' + m2(pickedGround.pond) + ' — หลังน้ำลดมักมีน้ำขังค้าง</small>';
      s += '</div>';
    }
    if (!picked) return s + (mode === "flat" ? '<p class="fs-note">' + ico("building-2") + ' กดตึกบนแผนที่เพื่อดูว่าจมน้ำกี่ชั้น</p>' : "");
    var dd = localDepth() || 0, h = picked.h, floors = Math.max(1, Math.round(h / FLOOR_H)), wet = Math.min(dd, h), wetF = wet / FLOOR_H;
    var msg = wet <= 0.005 ? "ไม่จมน้ำ" : wet >= h ? "<b class=\"fs-bad\">จมมิดทั้งหลัง</b>" :
      wetF < 0.15 ? "น้ำแค่ขอบฐาน" :
      wetF < 1 ? "ชั้น 1 จมราว " + Math.round(wetF * 100) + "%" :
      "จมถึงชั้น " + Math.ceil(wetF) + " (มิด " + Math.floor(wetF) + " ชั้น)";
    return s + '<div class="fs-bld"><div class="fs-bar"><i style="height:' + (h > 0 ? Math.min(100, wet / h * 100) : 0).toFixed(1) + '%"></i></div>' +
      '<div><b>ตึกที่เลือก</b><br>สูง ~' + Math.round(h) + ' ม. (≈' + floors + ' ชั้น)<br>' + msg +
      '<br><small>ความสูงจาก OSM · สมมติชั้นละ ~' + FLOOR_H + ' ม.</small></div></div>';
  }

  /* ================================================================ แผง */
  // ผลกระทบตามความลึก — ตัวเลขเรื่องรถ/คนอ้างอิงคำเตือน "Turn Around Don't Drown" ของ NWS สหรัฐฯ (15 ซม. / 30 ซม. / 60 ซม.)
  function impact(d) {
    if (d < 0.05) return "ยังไม่ท่วม";
    if (d < 0.15) return "ท่วมขังผิวถนน เดินลุยได้ — แต่น้ำไหลแรง 15 ซม. ก็ทำให้คนล้มได้";
    if (d < 0.3) return "ถึงหน้าแข้ง · น้ำ ~15 ซม. ถึงใต้ท้องรถเก๋งส่วนใหญ่ เสี่ยงเครื่องดับ/เสียการควบคุม";
    if (d < 0.6) return "ถึงเข่า · น้ำ ~30 ซม. ทำให้รถหลายรุ่นลอยได้ — ไม่ควรขับผ่าน";
    if (d < 1.2) return "ถึงเอว · น้ำ ~60 ซม. พัดรถกระบะ/SUV ได้ · ชั้นล่างบ้านเสียหาย ไฟฟ้าชั้นล่างต้องตัด";
    if (d < 1.8) return "ถึงอก · เดินลุยอันตรายมาก ต้องใช้เรือ · ชั้นล่างจมเกือบมิด";
    if (d < 3.2) return "มิดหัวผู้ใหญ่ · ชั้น 1 จมเกินครึ่ง ต้องอพยพขึ้นชั้นบน";
    return "ลึกกว่า 3 ม. · ชั้น 1 จมทั้งชั้นและเริ่มท่วมชั้น 2 — น้ำท่วมรุนแรงมาก";
  }
  function personSVG(d) {
    // คนสูง 1.7 ม. ในกรอบสูง 2.4 ม.
    var Hh = 96, sc = Hh / 2.4, w = Math.max(0, Math.min(d, 2.4)) * sc;
    return '<svg class="fs-person" viewBox="0 0 60 ' + Hh + '" aria-hidden="true">' +
      '<g fill="currentColor" opacity=".75"><circle cx="30" cy="' + (Hh - 1.58 * sc) + '" r="' + 0.12 * sc + '"/>' +
      '<rect x="' + (30 - 0.2 * sc) + '" y="' + (Hh - 1.44 * sc) + '" width="' + 0.4 * sc + '" height="' + 0.62 * sc + '" rx="4"/>' +
      '<rect x="' + (30 - 0.17 * sc) + '" y="' + (Hh - 0.84 * sc) + '" width="' + 0.14 * sc + '" height="' + 0.84 * sc + '" rx="2"/>' +
      '<rect x="' + (30 + 0.03 * sc) + '" y="' + (Hh - 0.84 * sc) + '" width="' + 0.14 * sc + '" height="' + 0.84 * sc + '" rx="2"/></g>' +
      '<rect x="0" y="' + (Hh - w) + '" width="60" height="' + w + '" fill="' + (style === "muddy" ? "#8a6d3f" : "#2f86d6") + '" opacity=".55"/>' +
      '<line x1="0" x2="60" y1="' + (Hh - w) + '" y2="' + (Hh - w) + '" stroke="' + (style === "muddy" ? "#cdbb92" : "#a8d8ff") + '" stroke-width="1.5"/>' +
      '<text x="58" y="' + (Hh - 1.7 * sc + 3) + '" text-anchor="end" font-size="7" fill="currentColor" opacity=".6">1.7 ม.</text></svg>';
  }
  var CSS = [
    "#fsPanel{position:absolute;z-index:44;left:14px;top:120px;width:330px;max-width:calc(100% - 28px);max-height:calc(100% - 140px);overflow:auto;display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.5}",
    "#fsPanel.open{display:block;animation:elvIn .22s ease}#fsPanel.min .fs-body{display:none}",
    ".fs-ph{display:flex;align-items:center;gap:8px;padding:11px 12px 6px 14px;font-weight:800;font-size:13.5px;position:sticky;top:0;background:inherit;z-index:1}",
    ".fs-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".fs-ib .mdico{width:13px;height:13px}.fs-ph .fs-ib:first-of-type{margin-left:auto}",
    ".fs-body{padding:0 14px 12px}",
    ".fs-seg{display:flex;border:1px solid var(--card-border);border-radius:10px;overflow:hidden;margin:2px 0 10px}",
    ".fs-seg button{flex:1;border:0;background:none;color:var(--text-muted);font:inherit;font-size:11.5px;padding:6px 6px;cursor:pointer;line-height:1.3}",
    ".fs-seg button.on{background:var(--accent-soft);color:var(--text-main);font-weight:700}.fs-seg small{display:block;font-size:10px;opacity:.7;font-weight:500}",
    ".fs-top{display:flex;gap:12px;align-items:flex-end}.fs-person{width:52px;height:96px;flex:none;color:var(--text-main)}",
    ".fs-big{font-size:26px;font-weight:800;line-height:1.1;font-variant-numeric:tabular-nums}.fs-big small{font-size:12px;font-weight:600;opacity:.65}",
    ".fs-imp{font-size:11.5px;line-height:1.45;margin-top:3px;opacity:.9}",
    "#fsSlider{width:100%;margin:10px 0 2px;accent-color:var(--accent)}",
    ".fs-scale{display:flex;justify-content:space-between;font-size:10px;opacity:.55;margin-bottom:6px}",
    ".fs-chips{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 8px}",
    ".fs-chip{padding:4px 9px;border-radius:999px;border:1px solid var(--card-border);background:none;color:var(--text-muted);font:inherit;font-size:11.5px;cursor:pointer}",
    ".fs-chip.on{background:var(--accent-soft);color:var(--text-main);border-color:var(--accent);font-weight:700}",
    ".fs-row{display:flex;gap:6px;margin:6px 0}",
    ".fs-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:7px 8px;border-radius:10px;border:1px solid var(--accent);background:var(--accent-soft);color:var(--text-main);font:inherit;font-size:12px;font-weight:700;cursor:pointer}",
    ".fs-btn.ghost{border-color:var(--card-border);background:rgba(127,127,127,.07);font-weight:600}",
    ".fs-btn .mdico{width:14px;height:14px}",
    ".fs-opt{display:flex;align-items:center;gap:8px;font-size:12px;margin:5px 0;cursor:pointer}.fs-opt input{accent-color:var(--accent);margin:0}",
    ".fs-sec{border-top:1px solid var(--card-border);padding:8px 0 4px;margin-top:6px}",
    ".fs-area{font-size:12px;line-height:1.5;padding:7px 9px;border-radius:9px;background:rgba(127,127,127,.08);margin:2px 0 6px}.fs-area b{font-size:14px}",
    ".fs-areabar{height:6px;border-radius:3px;background:rgba(127,127,127,.2);overflow:hidden;margin-top:5px}.fs-areabar i{display:block;height:100%;background:#2f86d6}",
    ".fs-grad{height:8px;border-radius:4px;margin:6px 0 2px}.fs-gradl{display:flex;justify-content:space-between;font-size:10px;opacity:.7}",
    ".fs-gr{font-size:12px;line-height:1.5;margin-bottom:6px}",
    ".fs-bld{display:flex;gap:10px;align-items:stretch;font-size:12px;line-height:1.45}.fs-bld small{opacity:.6;font-size:10.5px}",
    ".fs-bar{width:16px;border-radius:4px;border:1px solid var(--card-border);position:relative;overflow:hidden;min-height:70px;flex:none;background:rgba(127,127,127,.12)}",
    ".fs-bar i{position:absolute;left:0;right:0;bottom:0;background:#2f86d6;opacity:.8}",
    ".fs-bad{color:#ef4444}.fs-ok{color:#22c55e}",
    ".fs-note{margin:6px 0 0;font-size:11px;opacity:.72;line-height:1.45}.fs-note .mdico{width:12px;height:12px;vertical-align:-2px}",
    ".fs-warn{margin:8px 0 0;padding:7px 9px;border-radius:9px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.4);font-size:10.5px;line-height:1.5}",
    ".fs-warn a{color:inherit}",
    ".fs-h{display:flex;align-items:center;gap:6px;font-size:12.5px;margin-bottom:4px}.fs-h .mdico{width:14px;height:14px}",
    ".fs-rv{display:flex;align-items:center;gap:8px;margin:4px 0 6px}.fs-rv input{flex:1;accent-color:var(--accent)}#fsRecLbl{font-weight:800;font-size:12px;white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".fs-leg{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:11px;margin:4px 0}.fs-leg span{display:inline-flex;align-items:center;gap:5px}.fs-leg i{width:11px;height:11px;border-radius:3px;display:inline-block}",
    "@media (max-width:760px){#fsPanel{top:auto;bottom:86px;left:14px;right:14px;width:auto;max-height:46vh}.fs-person{height:72px;width:40px}}"
  ].join("");

  function areaHTML() {
    if (!dem) return '<div class="fs-area">' + (demErr ? '<span class="fs-bad">โหลดข้อมูลความสูงไม่สำเร็จ</span>' : "กำลังโหลดข้อมูลความสูงพื้นดิน…") + '</div>';
    var a = areaBelow(level);
    return '<div class="fs-area">พื้นดินที่ต่ำกว่าระดับน้ำนี้ <b>' + num(a.km2, 0) + ' ตร.กม.</b> (' + num(a.pct, 1) + '% ของพื้นดินในกรอบ กทม.-ปริมณฑล ' + num(a.totalKm2, 0) + ' ตร.กม.)' +
      '<div class="fs-areabar"><i style="width:' + a.pct.toFixed(1) + '%"></i></div></div>';
  }
  /* ---------------- ส่วนน้ำลดบนแผง ---------------- */
  function recHTML() {
    var dm = mode === "dem";
    var chips = '<div class="fs-chips">' + RATES.map(function (r) {
      return '<button type="button" class="fs-chip' + (Math.abs(r[0] - rate) < 1e-6 ? " on" : "") + '" data-r="' + r[0] + '">' + esc(r[1]) + '</button>';
    }).join("") + '</div>';
    if (!rec) {
      return '<b class="fs-h">' + ico("waves") + ' หลังน้ำลด — วันต่อ ๆ ไป</b>' +
        '<p class="fs-note" style="margin:2px 0 4px">อัตราน้ำลด (สมมติ):</p>' + chips +
        '<div class="fs-row"><button type="button" class="fs-btn" data-a="rec">' + ico("play") + ' ดูน้ำลดวันต่อ ๆ ไป</button></div>' +
        '<p class="fs-note">เริ่มจากระดับที่ตั้งไว้ตอนนี้เป็น "วันน้ำสูงสุด" แล้วลดลงทีละวัน' + (dm ? " · แอ่งปิดที่ไม่มีทางไหลออกจะมีน้ำขังค้างนานกว่า" : "") + '</p>';
    }
    return '<b class="fs-h">' + ico("waves") + ' น้ำลดหลังวันน้ำสูงสุด (' + m2(rec.peak) + (dm ? " รทก." : "") + ')</b>' +
      '<div class="fs-rv"><button type="button" class="fs-ib" id="fsRecPlay" title="เล่น/หยุด">' + ico(rec.playing ? "pause" : "play") + '</button>' +
      '<input type="range" id="fsRecDay" min="0" max="' + rec.maxDay + '" step="1" value="' + Math.floor(rec.dayF) + '" aria-label="วันหลังน้ำสูงสุด">' +
      '<span id="fsRecLbl"></span></div>' +
      '<div id="fsRecStat"></div>' +
      (dm ? '<div class="fs-leg"><span><i style="background:#2f86d6"></i>น้ำไหลระบายได้</span><span><i style="background:#7a8a2e"></i>น้ำขังในแอ่ง รอสูบ</span><span><i style="background:#8a6d3f;opacity:.6"></i>เคยท่วม แห้งแล้ว</span></div>' : "") +
      '<p class="fs-note" style="margin:6px 0 2px">อัตราน้ำลด (สมมติ):</p>' + chips +
      '<div class="fs-row"><button type="button" class="fs-btn ghost" data-a="recstop">■ กลับไปตั้งระดับน้ำ</button></div>' +
      '<p class="fs-note">อัตราน้ำลดเป็นสมมติฐาน ไม่ใช่การพยากรณ์ — ของจริงขึ้นกับฝน น้ำเหนือ น้ำทะเลหนุน และการสูบ/ระบายของ กทม.' +
      (dm ? " · น้ำในแอ่งปิดสมมติให้ลดช้ากว่าราว 1/3" : "") + '</p>';
  }
  function renderRecLive() {
    if (!rec) return;
    var day = Math.floor(rec.dayF + 1e-6);
    var l = $("#fsRecLbl"); if (l) l.textContent = "วันที่ " + day + (day >= rec.maxDay ? (rec.tail ? " · แห้ง 99%" : " · แห้งหมด") : "");
    var s = $("#fsRecDay"); if (s && +s.value !== day && document.activeElement !== s) s.value = day;
    var st = $("#fsRecStat");
    if (st) {
      if (rec.stats) {
        var k = dem.cellKm2, w = rec.stats.wet[Math.min(day, rec.stats.wet.length - 1)] * k, p = rec.stats.pond[Math.min(day, rec.stats.pond.length - 1)] * k, ev = rec.stats.ever * k;
        st.innerHTML = '<div class="fs-area">ยังท่วม <b>' + num(w, 0) + ' ตร.กม.</b> · ในนั้นน้ำขังในแอ่ง ' + num(p, 0) + ' ตร.กม.<br>แห้งแล้ว ' + num(ev - w, 0) + ' จาก ' + num(ev, 0) + ' ตร.กม. ที่เคยท่วม · ' + (rec.tail ? 'แห้ง 99% ราว' : 'แห้งหมดราว') + ' <b>วันที่ ' + rec.maxDay + '</b>' +
          (rec.tail ? '<br><small>แอ่ง/บ่อลึกบางจุดยังค้างนานกว่านั้น ต้องสูบออก</small>' : "") +
          '<div class="fs-areabar"><i style="width:' + (ev ? ((ev - w) / ev * 100) : 100).toFixed(1) + '%;background:#8a6d3f"></i></div></div>';
      } else {
        st.innerHTML = '<div class="fs-area">น้ำลึก <b>' + m2(Math.max(0, rec.peak - rate * day)) + '</b> · แห้งหมดราว <b>วันที่ ' + rec.maxDay + '</b></div>';
      }
    }
    renderLive();
  }

  function renderLive() {
    if (mode === "sea") { zoomNote(); notifyExtra(); return; }
    var dm = mode === "dem";
    var el = $("#fsDepthNow");
    if (el) el.textContent = m2(curValue());
    var ld = localDepth();
    var im = $("#fsImpact");
    if (im) im.textContent = dm ? (ld == null ? "กดจุดบนแผนที่เพื่อดูความลึกน้ำตรงนั้น" : "จุดที่เลือก: " + impact(ld)) : impact(ld);
    var pv = $("#fsPerson"); if (pv) pv.innerHTML = personSVG(ld || 0);
    var s = $("#fsSlider"); if (s && +s.value !== (dm ? level : depth)) s.value = dm ? level : depth;
    Array.prototype.forEach.call(document.querySelectorAll("#fsPanel [data-d]"), function (b) { b.classList.toggle("on", Math.abs(+b.dataset.d - (dm ? level : depth)) < 1e-6); });
    var bl = $("#fsBld"); if (bl) bl.innerHTML = pickHTML();
    var ar = $("#fsArea"); if (ar) ar.innerHTML = dm ? areaHTML() : "";
    zoomNote();
    notifyExtra();
  }
  function zoomNote() {
    var zn = $("#fsZoom");
    if (!zn) return;
    var z = map ? map.getZoom() : 20;
    if (mode === "sea") {                  // ซูมออกเห็นภาพ 2 มิติทั้งอ่าวอยู่แล้ว — บอกเฉพาะว่าซูมเข้าจะเห็นผิวน้ำ 3 มิติ/ตึกจม
      zn.style.display = z >= 13.5 ? "none" : "";
      zn.innerHTML = ico("zoom-in") + (z < 11 ? " ซูมเข้าถึงระดับเมืองเพื่อดูผิวน้ำ 3 มิติ" : " ซูมเข้าใกล้ขึ้นเพื่อดูตึกจมน้ำ");
      return;
    }
    var dm = mode === "dem";
    zn.style.display = z < 11 ? "" : dm || z >= 13.5 ? "none" : "";
    zn.innerHTML = ico("zoom-in") + (z < 11 ? " ซูมเข้าอย่างน้อยระดับเมืองเพื่อให้เห็นผิวน้ำ" : " ซูมเข้าใกล้ขึ้นเพื่อให้เห็นตึก 3 มิติ");
  }
  // สถานะน้ำ ณ ตอนนี้สำหรับชั้นประกอบ: L = ระดับน้ำที่ไหลออกได้ · P = ระดับสูงสุด · drop = ส่วนที่แอ่งลดไปแล้ว
  function simState() {
    var L = rec ? curRecLevel() : (mode === "dem" ? level : depth);
    return { visible: visible, mode: mode, L: L, P: rec ? rec.peak : L, drop: rec ? rate * POND_F * rec.dayF : 0, rec: !!rec };
  }
  function notifyExtra() { if (window.BKK_FLOODSIM_EXTRA) window.BKK_FLOODSIM_EXTRA.update(simState()); }
  function renderPanel() {
    var p = $("#fsPanel");
    if (!p || !visible) return;
    var dm = mode === "dem";
    var h = '<div class="fs-seg" role="tablist">' +
      '<button type="button" data-m="flat" class="' + (mode === "flat" ? "on" : "") + '">ความลึกเท่ากัน<small>น้ำลึก X ม. เป็นแบบไหน</small></button>' +
      '<button type="button" data-m="dem" class="' + (dm ? "on" : "") + '">ตามพื้นดิน<small>ที่ต่ำท่วมก่อน</small></button>' +
      (window.BKK_SEALEVEL ? '<button type="button" data-m="sea" class="' + (mode === "sea" ? "on" : "") + '">น้ำทะเลหนุน<small>ปี 2050–2100</small></button>' : "") + '</div>';
    if (mode === "sea") {
      h += '<div id="slBody"></div>' +
        '<label class="fs-opt"><input type="checkbox" data-o="wave"' + (waves ? " checked" : "") + '> คลื่นและแสงสะท้อน (ตอนซูมเข้า) <small style="opacity:.6">(ปิดเพื่อประหยัดแบตเตอรี่)</small></label>' +
        '<label class="fs-opt"><input type="checkbox" data-o="muddy"' + (style === "muddy" ? " checked" : "") + '> น้ำขุ่นแบบน้ำท่วมจริง</label>' +
        '<p class="fs-note" id="fsZoom" style="display:none"></p>';
      p.querySelector(".fs-body").innerHTML = h;
      window.BKK_SEALEVEL.renderPanel($("#slBody"));
      zoomNote();
      return;
    }
    h += '<div class="fs-top"><span id="fsPerson">' + personSVG(dm ? 0 : depth) + '</span><div><div class="fs-big"><span id="fsDepthNow">' + m2(dm ? level : depth) + '</span> <small>' +
      (dm ? "ระดับน้ำ ม.รทก. (เหนือระดับทะเลปานกลาง)" : "ลึกจากพื้น") + '</small></div>' +
      '<div class="fs-imp" id="fsImpact"></div></div></div>';
    if (dm) {
      h += '<input type="range" id="fsSlider" min="' + MIN_LEVEL + '" max="' + MAX_LEVEL + '" step="0.05" value="' + level + '" aria-label="ระดับน้ำ (เมตร รทก.)">' +
        '<div class="fs-scale"><span>0</span><span>1 ม.</span><span>2 ม.</span><span>3 ม.</span><span>4 ม.</span></div>' +
        '<div class="fs-chips">' + LEVELS.map(function (x) { return '<button type="button" class="fs-chip" data-d="' + x + '">' + x + ' ม.</button>'; }).join("") + '</div>' +
        '<div id="fsArea"></div>';
    } else {
      h += '<input type="range" id="fsSlider" min="0" max="' + MAX_DEPTH + '" step="0.05" value="' + depth + '" aria-label="ความลึกน้ำ (เมตร)">' +
        '<div class="fs-scale"><span>0</span><span>1 ม.</span><span>2 ม.</span><span>3 ม.</span><span>4 ม.</span><span>5 ม.</span><span>6 ม.</span></div>' +
        '<div class="fs-chips">' + PRESETS.map(function (x) { return '<button type="button" class="fs-chip" data-d="' + x[0] + '" title="' + esc(x[2]) + '">' + esc(x[1]) + '</button>'; }).join("") + '</div>' +
        '<div id="fsArea"></div>';
    }
    h += '<div class="fs-row"><button type="button" class="fs-btn" data-a="surge">' + ico("waves") + ' จำลองน้ำหลากเข้า</button>' +
      '<button type="button" class="fs-btn ghost" data-a="home">' + ico(dm ? "map" : "building-2") + (dm ? " ดูทั้งเมือง" : " ไปย่านตึกสูง") + '</button></div>';
    if (dm) {
      h += '<label class="fs-opt"><input type="checkbox" data-o="terrain"' + (terrain ? " checked" : "") + '> แสดงสีความสูงพื้นดิน</label>';
      if (terrain) h += '<div class="fs-grad" style="background:linear-gradient(90deg,' + TERR.map(function (t) { return t[1]; }).join(",") + ')"></div>' +
        '<div class="fs-gradl">' + TERR.map(function (t) { return "<span>" + t[0] + "</span>"; }).join("") + '</div><p class="fs-note" style="margin-top:2px">ม.รทก. (เหนือระดับทะเลปานกลาง)</p>';
    }
    h += '<label class="fs-opt"><input type="checkbox" data-o="wave"' + (waves ? " checked" : "") + '> คลื่นและแสงสะท้อน <small style="opacity:.6">(ปิดเพื่อประหยัดแบตเตอรี่)</small></label>' +
      '<label class="fs-opt"><input type="checkbox" data-o="muddy"' + (style === "muddy" ? " checked" : "") + '> น้ำขุ่นแบบน้ำท่วมจริง</label>' +
      '<div class="fs-sec" id="fsRec">' + recHTML() + '</div>' +
      (dm ? '<div class="fs-sec" id="fsExtra"></div>' : "") +
      '<div class="fs-sec" id="fsBld"></div>' +
      '<p class="fs-note" id="fsZoom" style="display:none"></p>';
    h += dm ?
      '<div class="fs-warn"><b>แบบจำลองอย่างง่าย ("อ่างน้ำ") — เห็นว่าที่ไหนต่ำ ไม่ใช่พยากรณ์</b> — ทุกที่ที่ต่ำกว่าระดับน้ำถือว่าท่วม ไม่คิดคันกั้นน้ำ/แนวป้องกันริมเจ้าพระยา ระบบสูบและระบายน้ำ หรือทิศทางการไหล · ' +
      'ความสูงพื้นดินจาก FABDEM (Copernicus 30 ม. ที่ลบตึก/ต้นไม้ออก) คลาดเคลื่อนได้ราว 1–2 ม. และยังมีเศษความสูงตึกบางย่าน เช่น สีลม · ข้อมูลดาวเทียมเก็บราวปี 2554–2558 ไม่รวมการทรุดตัวของดินหลังจากนั้น · ' +
      'แปลงจากระดับอ้างอิง EGM2008 เป็น ม.รทก. ด้วย −' + DATUM + ' ม. (ผลทดสอบหมุด GNSS/ระดับในพื้นที่ราบ) · ' +
      'ข้อมูล: <a href="https://doi.org/10.5523/bris.s5hqmjcdj8yo2ibzi9b4ew3sn" target="_blank" rel="noopener">FABDEM V1-2</a> © University of Bristol, CC BY-NC-SA 4.0 (ใช้เพื่อการศึกษา ไม่แสวงกำไร)</div>' :
      '<div class="fs-warn"><b>ภาพจำลองเพื่อเห็นภาพเท่านั้น</b> — น้ำลึกเท่ากันทุกที่ ไม่ได้คำนวณจากความสูงพื้นดินหรือทางน้ำจริง (ดูโหมด "ตามความสูงพื้นดิน" สำหรับว่าที่ไหนต่ำ) · ' +
      'ผลกระทบต่อคน/รถอ้างอิงคำเตือนของ NWS สหรัฐฯ · ติดตามประกาศจริงจาก ปภ. กรมอุตุฯ และ กทม.</div>';
    p.querySelector(".fs-body").innerHTML = h;
    if (rec) renderRecLive(); else renderLive();
    if (dm && window.BKK_FLOODSIM_EXTRA) window.BKK_FLOODSIM_EXTRA.renderPanel($("#fsExtra"));
  }
  function setDepth(d, surge) {
    if (rec) { rec = null; setTimeout(renderPanel, 0); }
    if (mode === "dem") {
      level = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Math.round(d * 100) / 100));
      lsSet(LS_LEVEL, String(level));
      if (surge) { surgeFrom = Math.max(MIN_LEVEL, Math.min(0.3, level - 0.5)); shownLevel = surgeFrom; } else surgeFrom = null;
    } else {
      depth = Math.max(0, Math.min(MAX_DEPTH, Math.round(d * 100) / 100));
      lsSet(LS_DEPTH, String(depth));
      if (surge) { surgeFrom = 0; shown = 0; } else surgeFrom = null;
    }
    renderLive();
    if (H) { H.setAnim(MOD_ID, true); H.repaint(); }
  }
  function setMode(m, fly) {
    rec = null;
    if (m !== "dem" && !(m === "sea" && window.BKK_SEALEVEL)) m = "flat";
    var SL = window.BKK_SEALEVEL;
    if (SL && m !== "sea") SL.deactivate();
    mode = m;
    lsSet(LS_MODE, m);
    surgeFrom = null;
    renderPanel();
    if (m === "sea") {
      ensureLoaded().then(function () {
        if (mode !== "sea" || !visible) return;
        return SL.activate(fly).then(function () { if (mode === "sea") renderPanel(); });
      }).catch(function (e) { console.warn("floodsim sea:", e); renderPanel(); });
    } else if (m === "dem") {
      ensureDem().then(function () {
        if (mode !== "dem") return;
        shownLevel = level;
        renderPanel();
        if (fly) map.flyTo(Object.assign({ duration: 2200 }, HOME_DEM));
      }).catch(function (e) { console.warn("floodsim dem:", e); renderPanel(); });
    } else if (fly && (map.getZoom() < 14)) map.flyTo(Object.assign({ duration: 2200 }, HOME));
    if (H) { H.setAnim(MOD_ID, true); H.repaint(); }
  }

  function buildUI() {
    if (uiBuilt) return;
    uiBuilt = true;
    addIcons();
    var menu = $("#leftMenu"), stage = $(".stage") || document.body;
    if (menu && !$("#btnFloodSim")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "menu-btn"; b.id = "btnFloodSim";
      b.title = "จำลองน้ำท่วม 3 มิติ — เลือกความลึก/ระดับน้ำแล้วดูว่าถนนและตึกจะเป็นอย่างไร และที่ไหนต่ำท่วมก่อน";
      b.innerHTML = '<span>' + ico("waves") + '</span><span class="label-text"> จำลองน้ำท่วม 3 มิติ</span>';
      b.addEventListener("click", function () { setVisible(!visible); });
      menu.appendChild(b);
    }
    if (!$("#fsPanel")) {
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
      var p = document.createElement("div");
      p.id = "fsPanel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "จำลองน้ำท่วม 3 มิติ");
      p.innerHTML = '<div class="fs-ph">' + ico("waves") + ' จำลองน้ำท่วม 3 มิติ' +
        '<button type="button" class="fs-ib" data-a="min" title="ย่อ/ขยาย">' + ico("minus") + '</button>' +
        '<button type="button" class="fs-ib" data-a="close" title="ปิด">×</button></div><div class="fs-body"></div>';
      stage.appendChild(p);
      p.addEventListener("click", function (e) {
        var a = e.target.closest("[data-a]");
        if (a) {
          if (a.dataset.a === "close") return setVisible(false);
          if (a.dataset.a === "min") { p.classList.toggle("min"); return; }
          if (a.dataset.a === "surge") { setDepth(mode === "dem" ? level : (depth || 1), true); return; }
          if (a.dataset.a === "rec") { startRec(); return; }
          if (a.dataset.a === "recstop") { stopRec(); return; }
          if (a.dataset.a === "home") { map.flyTo(Object.assign({ duration: 2200 }, mode === "dem" ? HOME_DEM : HOME)); return; }
        }
        var mb = e.target.closest("[data-m]");
        if (mb) { if (mb.dataset.m !== mode) setMode(mb.dataset.m, true); return; }
        if (e.target.closest("#fsRecPlay")) { setRecPlaying(!(rec && rec.playing)); return; }
        var rb = e.target.closest("[data-r]");
        if (rb) {
          rate = +rb.dataset.r; lsSet(LS_RATE, String(rate));
          if (rec) { buildRecStats(); rec.dayF = Math.min(rec.dayF, rec.maxDay); rec.shownDay = -1; }
          var box = $("#fsRec"); if (box) box.innerHTML = recHTML();
          if (rec) renderRecLive();
          if (H) H.repaint();
          return;
        }
        var c = e.target.closest("[data-d]");
        if (c) setDepth(+c.dataset.d, false);
      });
      p.addEventListener("input", function (e) {
        if (e.target.id === "fsSlider") setDepth(+e.target.value, false);
        if (e.target.id === "fsRecDay" && rec) {
          rec.playing = false; rec.dayF = +e.target.value; rec.shownDay = -1;
          var pb = $("#fsRecPlay"); if (pb) pb.innerHTML = ico("play");
          renderRecLive();
          if (H) { H.setAnim(MOD_ID, true); H.repaint(); }
        }
      });
      p.addEventListener("change", function (e) {
        var o = e.target.dataset && e.target.dataset.o;
        if (o === "wave") { waves = e.target.checked; lsSet(LS_WAVE, waves ? "1" : "0"); }
        if (o === "muddy") { style = e.target.checked ? "muddy" : "blue"; lsSet(LS_STYLE, style); applyStyle(); renderLive(); }
        if (o === "terrain") { terrain = e.target.checked; lsSet(LS_TERR, terrain ? "1" : "0"); renderPanel(); }
        if (H) { H.setAnim(MOD_ID, true); H.repaint(); }
      });
    }
    syncButtons();
  }
  function placePanel() {
    var p = $("#fsPanel"), ts = $("#toolbarStack") || $("#leftMenu"), stg = $(".stage");
    if (!p) return;
    if (ts && stg && window.innerWidth > 760) {
      // #toolbarStack กว้างเต็มจอ (แถวปุ่มแนวนอน) — วางด้านขวาของมันจะหลุดขอบจอ
      // จึงวางถัดจากคอลัมน์ปุ่มซูมที่อยู่ใต้แถวปุ่ม (ไม่มีคอลัมน์ซูม → วางใต้แถบทั้งหมด)
      var r0 = stg.getBoundingClientRect(), r1 = ts.getBoundingClientRect();
      var zc = ts.querySelector(".map-zoom-controls");
      var rz = zc && zc.offsetWidth ? zc.getBoundingClientRect() : null;
      var left = rz ? rz.right - r0.left + 10 : r1.left - r0.left;
      var top = rz ? rz.top - r0.top : r1.bottom - r0.top + 10;
      left = Math.max(14, Math.min(left, r0.width - p.offsetWidth - 14));
      top = Math.max(14, top);
      p.style.left = Math.round(left) + "px";
      p.style.top = Math.round(top) + "px";
      p.style.maxHeight = Math.max(160, Math.round(r0.height - top - 14)) + "px";
    } else { p.style.left = ""; p.style.top = ""; p.style.maxHeight = ""; }
  }
  function syncButtons() {
    var b = $("#btnFloodSim"), p = $("#fsPanel");
    if (b) b.classList.toggle("active", visible);
    if (p) p.classList.toggle("open", visible);
  }

  function setVisible(v, noFly) {
    visible = !!v;
    lsSet(LS_ON, visible ? "1" : "0");
    syncButtons();
    if (!visible) {
      if (group) group.visible = false;
      if (H) { H.show(MOD_ID, false); H.setAnim(MOD_ID, false); }
      if (window.BKK_SEALEVEL) window.BKK_SEALEVEL.deactivate();
      notifyExtra();
      return;
    }
    placePanel();
    renderPanel();
    ensureLoaded().then(function () {
      if (!visible) return;
      H.show(MOD_ID, true);
      H.setAnim(MOD_ID, true);
      if (mode === "dem" || mode === "sea") { setMode(mode, !noFly); return; }
      var c = map.getCenter(), far = c.lng < 100.2 || c.lng > 100.95 || c.lat < 13.45 || c.lat > 14.15;
      if (!noFly && (far || map.getZoom() < 14)) {
        map.flyTo(Object.assign({ duration: 2200 }, HOME));
        map.once("moveend", function () { if (visible) setDepth(depth || 1, true); });
      } else if (!noFly) setDepth(depth || 1, true);
      else { shown = depth; H.repaint(); }
    }).catch(function (e) { console.warn("floodsim:", e); });
  }

  /* ================================================================ mount — เรียกซ้ำทุกครั้งที่เปลี่ยนสไตล์แผนที่ */
  function mount(m) {
    map = m;
    H = window.BKK_3D;
    if (!H) { console.warn("bkk-floodsim: ต้องโหลด bkk-3d-host.js ก่อน"); return; }
    H.attach(m);
    var d = parseFloat(lsGet(LS_DEPTH));
    if (d >= 0 && d <= MAX_DEPTH) depth = d;
    var l = parseFloat(lsGet(LS_LEVEL));
    if (l >= MIN_LEVEL && l <= MAX_LEVEL) level = shownLevel = l;
    if (STYLES[lsGet(LS_STYLE)]) style = lsGet(LS_STYLE);
    waves = lsGet(LS_WAVE) !== "0";
    terrain = lsGet(LS_TERR) === "1";
    var rr = parseFloat(lsGet(LS_RATE));
    if (RATES.some(function (x) { return Math.abs(x[0] - rr) < 1e-6; })) rate = rr;
    if (lsGet(LS_MODE) === "dem") mode = "dem";
    if (lsGet(LS_MODE) === "sea" && window.BKK_SEALEVEL) mode = "sea";
    buildUI();
    if (window.BKK_FLOODSIM_EXTRA) window.BKK_FLOODSIM_EXTRA.mount(m);
    if (window.BKK_SEALEVEL) window.BKK_SEALEVEL.mount(m);
    if (!mount._bound) {
      mount._bound = true;
      map.on("click", onMapClick);
      map.on("zoomend", function () { if (visible) renderLive(); });
      window.addEventListener("resize", function () { if (visible) placePanel(); });
      // ย่อ/ขยายแถบเครื่องมือ (.collapsed) ทำให้คอลัมน์ซูมเลื่อนขึ้น-ลง → วางแผงใหม่ตาม
      var tsEl = $("#toolbarStack");
      if (tsEl && window.ResizeObserver) new ResizeObserver(function () { if (visible) placePanel(); }).observe(tsEl);
    }
    if (lsGet(LS_ON) === "1" && !visible) setVisible(true, true);
  }

  window.BKK_FLOODSIM = {
    DATUM: DATUM,
    mount: mount,
    setVisible: setVisible,
    setDepth: setDepth,
    setMode: setMode,
    startRec: startRec,
    stopRec: stopRec,
    groundAt: groundAt,
    dem: function () { return dem; },
    state: simState,
    debug: function () {
      return {
        visible: visible, mode: mode, depth: depth, shown: shown, level: level, shownLevel: shownLevel, style: style, waves: waves, terrain: terrain,
        loaded: !!mesh, dem: dem ? [dem.W, dem.H, dem.sorted.length] : null, demErr: demErr, demMesh: !!demMesh, demVisible: demMesh && demMesh.visible,
        picked: picked, pickedGround: pickedGround, rate: rate,
        rec: rec && { peak: rec.peak, dayF: rec.dayF, maxDay: rec.maxDay, playing: rec.playing, wet0: rec.stats && rec.stats.wet[0], ever: rec.stats && rec.stats.ever }
      };
    }
  };
})();
