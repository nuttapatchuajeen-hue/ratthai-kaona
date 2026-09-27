/**
 * bkk-floodsim.js
 * ชั้น "จำลองน้ำท่วม 3 มิติ" ของ bkk-city.html — ผิวน้ำสูงตามความลึกที่เลือก ตึก 3 มิติโผล่พ้นน้ำ มีคลื่นและแสงสะท้อน
 * วาดในฉากกลาง bkk-3d-host.js (three.js) ซึ่งแทรกก่อนชั้นตึก city-buildings-3d
 *   → ผิวน้ำเขียน depth ก่อน ส่วนของตึกที่อยู่ใต้ผิวน้ำจึงถูกบังเหมือนจมอยู่ในน้ำขุ่น
 *
 * ⚠ เป็นแบบ "ความลึกน้ำเท่ากันทั้งพื้นที่" ไม่ใช่แบบจำลองทางน้ำ:
 *   ข้อมูลความสูงพื้นดินแบบเปิด (SRTM/Terrarium) ในกรุงเทพฯ รวมความสูงตึกและต้นไม้เข้าไปด้วย
 *   (ตรวจแล้ว: ย่านสีลมได้ค่ากลาง ~10 ม. ทั้งที่พื้นจริง ~1–1.5 ม. รทก.) — ใช้คำนวณว่าตรงไหนท่วมก่อนไม่ได้
 *   จึงแสดงว่า "ถ้าน้ำลึก X ม. ทุกที่ ตึก/ถนนจะเป็นแบบไหน" ใช้เพื่อเห็นภาพและสื่อสารความเสี่ยงเท่านั้น
 */
(function () {
  "use strict";

  var MOD_ID = "floodsim";
  var LS_ON = "bkk-floodsim-on", LS_DEPTH = "bkk-floodsim-depth", LS_STYLE = "bkk-floodsim-style", LS_WAVE = "bkk-floodsim-wave";
  var MAX_DEPTH = 6;
  var FLOOR_H = 3.2;                       // ความสูงชั้นโดยประมาณ (ม.)
  var HOME = { center: [100.5305, 13.7265], zoom: 16.3, pitch: 62, bearing: -28 };   // สีลม-สาทร: ตึกหลายระดับให้เห็นระดับน้ำชัด
  var PRESETS = [
    [0.1, "10 ซม.", "ท่วมขังผิวถนนหลังฝนหนัก"],
    [0.3, "30 ซม.", "รถเก๋งหลายรุ่นเริ่มลอย/ดับ"],
    [0.5, "50 ซม.", "ระดับเข่า"],
    [1, "1 ม.", "ท่วมชั้นล่างบ้าน"],
    [2, "2 ม.", "มิดหัวผู้ใหญ่"],
    [3.5, "3.5 ม.", "ชั้น 1 จมทั้งชั้น เริ่มท่วมชั้น 2"]
  ];
  var STYLES = {
    blue:  { n: "น้ำใส (ภาพประกอบ)", deep: "#1b5d96", sky: "#a8d8ff", op: 0.82 },
    muddy: { n: "น้ำขุ่นแบบน้ำท่วมจริง", deep: "#5e4a2c", sky: "#cdbb92", op: 0.9 }
  };

  var H = null, T = null, map = null;
  var visible = false, uiBuilt = false, loading = null, group = null, mesh = null, mat = null;
  var depth = 1, shown = 0, style = "blue", waves = true, surgeFrom = null, lastT = 0, t0 = performance.now();
  var picked = null;

  function $(s) { return document.querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function m2(v) { return v < 1 ? Math.round(v * 100) + " ซม." : (Math.round(v * 100) / 100) + " ม."; }

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
  }

  /* ================================================================ ผิวน้ำ */
  var VERT = [
    "varying vec3 vW;",
    "void main(){",
    "  vec4 w = modelMatrix * vec4(position, 1.0);",
    "  vW = w.xyz;",
    "  gl_Position = projectionMatrix * viewMatrix * w;",
    "}"
  ].join("\n");
  // คลื่นจากผลรวมคลื่นไซน์หลายทิศ → เอียงเวกเตอร์ปกติ · แสง: กระจาย + สะท้อนแดด + Fresnel (มุมต่ำเห็นฟ้าสะท้อนมากขึ้น)
  var FRAG = [
    "uniform float uTime, uOpacity, uWave;",
    "uniform vec3 uDeep, uSky, uSun, uEye;",
    "varying vec3 vW;",
    "float wv(vec2 p){",
    "  return sin(dot(p, vec2(0.071, 0.043)) + uTime * 1.6) * 0.35",
    "       + sin(dot(p, vec2(-0.052, 0.089)) - uTime * 1.25) * 0.30",
    "       + sin(dot(p, vec2(0.19, -0.13)) + uTime * 2.3) * 0.12",
    "       + sin(dot(p, vec2(-0.27, -0.31)) - uTime * 2.9) * 0.08",
    "       + sin(dot(p, vec2(0.61, 0.47)) + uTime * 4.1) * 0.03;",
    "}",
    "void main(){",
    "  vec2 p = vW.xy; float e = 0.5;",
    "  float hx = wv(p + vec2(e, 0.0)) - wv(p - vec2(e, 0.0));",
    "  float hy = wv(p + vec2(0.0, e)) - wv(p - vec2(0.0, e));",
    "  vec3 n = normalize(vec3(-hx * uWave, -hy * uWave, 1.0));",
    "  vec3 L = normalize(uSun);",
    "  vec3 V = normalize(uEye - vW);",
    "  float fres = pow(1.0 - clamp(dot(n, V), 0.0, 1.0), 3.0);",
    "  float diff = 0.55 + 0.45 * clamp(dot(n, L), 0.0, 1.0);",
    "  float spec = pow(clamp(dot(reflect(-L, n), V), 0.0, 1.0), 90.0);",
    "  vec3 col = mix(uDeep * diff, uSky, clamp(fres * 0.75, 0.0, 0.85)) + vec3(1.0) * spec * 0.9;",
    "  gl_FragColor = vec4(col, clamp(uOpacity + fres * 0.12 + spec * 0.3, 0.0, 0.97));",
    "}"
  ].join("\n");

  function makeMesh() {
    var g = new T.PlaneGeometry(1, 1, 1, 1);
    var st = STYLES[style];
    mat = new T.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: true, side: T.DoubleSide,
      uniforms: {
        uTime: { value: 0 }, uOpacity: { value: st.op }, uWave: { value: 0.55 },
        uDeep: { value: new T.Color(st.deep) }, uSky: { value: new T.Color(st.sky) },
        uSun: { value: new T.Vector3(0.45, -0.55, 0.7) }, uEye: { value: new T.Vector3(0, 0, 3000) }
      }
    });
    mesh = new T.Mesh(g, mat);
    mesh.renderOrder = -1;                  // วาดก่อนวัตถุโปร่งอื่นในฉาก (เงา ป้าย)
    mesh.frustumCulled = false;
  }
  function applyStyle() {
    if (!mat) return;
    var st = STYLES[style];
    mat.uniforms.uDeep.value.set(st.deep);
    mat.uniforms.uSky.value.set(st.sky);
    mat.uniforms.uOpacity.value = st.op;
  }

  // เรียกทุกเฟรมที่ฉากวาด (จาก bkk-3d-host.js)
  function frame(z) {
    if (!mesh) return;
    var now = performance.now(), dt = Math.min(0.1, (now - (lastT || now)) / 1000);
    lastT = now;
    // น้ำหลาก: ค่อย ๆ ขึ้นจากระดับเดิมถึงเป้าหมายภายใน ~7 วินาที · ปรับแถบเลื่อน = ขยับตามเร็ว
    var rate = surgeFrom != null ? Math.max(0.12, depth / 7) : Math.max(1.5, Math.abs(depth - shown) * 5);
    if (shown < depth) shown = Math.min(depth, shown + rate * dt);
    else if (shown > depth) shown = Math.max(depth, shown - rate * dt);
    if (surgeFrom != null && Math.abs(shown - depth) < 1e-4) { surgeFrom = null; renderLive(); }
    var c = map.getCenter(), p = H.toLocal(c.lng, c.lat), k = H.kAt(c.lat);
    // แผ่นน้ำใหญ่พอให้ถึงขอบฟ้าเวลากล้องเอียงมาก ๆ — ขยายตามระดับซูม
    var S = Math.max(24000, 420000 / Math.pow(2, z - 11));
    mesh.position.set(p.x, p.y, Math.max(0.02, shown) * k);
    mesh.scale.set(S, S, 1);
    mesh.visible = shown > 0.005;
    mat.uniforms.uTime.value = waves ? (now - t0) / 1000 : 0;
    // คลื่นแรงขึ้นระหว่างน้ำหลาก
    mat.uniforms.uWave.value = waves ? (surgeFrom != null ? 1.1 : 0.55) : 0.12;
    var e = H.eye();
    if (e) mat.uniforms.uEye.value.copy(e);
    if (surgeFrom != null) { var el = $("#fsDepthNow"); if (el) el.textContent = m2(shown); }
    H.setAnim(MOD_ID, visible && (waves || shown !== depth));
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
    });
    return loading;
  }

  /* ================================================================ ตึกที่เลือก */
  function pickBuilding(e) {
    if (!visible || !map.getLayer("city-buildings-3d")) return;
    var p = e.point, fs = map.queryRenderedFeatures([[p.x - 2, p.y - 2], [p.x + 2, p.y + 2]], { layers: ["city-buildings-3d"] });
    if (!fs.length) return;
    var pr = fs[0].properties || {};
    picked = { h: +pr.render_height || 5, min: +pr.render_min_height || 0 };
    renderPanel();
  }
  function buildingHTML() {
    if (!picked) return '<p class="fs-note">' + ico("building-2") + ' กดตึกบนแผนที่เพื่อดูว่าจมน้ำกี่ชั้น</p>';
    var h = picked.h, floors = Math.max(1, Math.round(h / FLOOR_H)), wet = Math.min(depth, h), wetF = wet / FLOOR_H;
    var msg = wet >= h ? "<b class=\"fs-bad\">จมมิดทั้งหลัง</b>" :
      wetF < 0.15 ? "น้ำแค่ขอบฐาน" :
      wetF < 1 ? "ชั้น 1 จมราว " + Math.round(wetF * 100) + "%" :
      "จมถึงชั้น " + Math.ceil(wetF) + " (มิด " + Math.floor(wetF) + " ชั้น)";
    return '<div class="fs-bld"><div class="fs-bar"><i style="height:' + Math.min(100, wet / h * 100).toFixed(1) + '%"></i></div>' +
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
    var Hh = 96, sc = Hh / 2.4, w = Math.min(d, 2.4) * sc;
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
    "#fsPanel{position:absolute;z-index:44;left:14px;top:120px;width:318px;max-width:calc(100% - 28px);max-height:calc(100% - 140px);overflow:auto;display:none;",
    "background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);",
    "color:var(--text-main);font-size:12.5px;line-height:1.5}",
    "#fsPanel.open{display:block;animation:elvIn .22s ease}#fsPanel.min .fs-body{display:none}",
    ".fs-ph{display:flex;align-items:center;gap:8px;padding:11px 12px 6px 14px;font-weight:800;font-size:13.5px;position:sticky;top:0;background:inherit;z-index:1}",
    ".fs-ib{border:0;background:rgba(127,127,127,.16);color:inherit;width:24px;height:24px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;line-height:1;flex:none}",
    ".fs-ib .mdico{width:13px;height:13px}.fs-ph .fs-ib:first-of-type{margin-left:auto}",
    ".fs-body{padding:0 14px 12px}",
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
    ".fs-bld{display:flex;gap:10px;align-items:stretch;font-size:12px;line-height:1.45}.fs-bld small{opacity:.6;font-size:10.5px}",
    ".fs-bar{width:16px;border-radius:4px;border:1px solid var(--card-border);position:relative;overflow:hidden;min-height:70px;flex:none;background:rgba(127,127,127,.12)}",
    ".fs-bar i{position:absolute;left:0;right:0;bottom:0;background:#2f86d6;opacity:.8}",
    ".fs-bad{color:#ef4444}",
    ".fs-note{margin:6px 0 0;font-size:11px;opacity:.72;line-height:1.45}.fs-note .mdico{width:12px;height:12px;vertical-align:-2px}",
    ".fs-warn{margin:8px 0 0;padding:7px 9px;border-radius:9px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.4);font-size:10.5px;line-height:1.5}",
    "@media (max-width:760px){#fsPanel{top:auto;bottom:86px;left:14px;right:14px;width:auto;max-height:46vh}.fs-person{height:72px;width:40px}}"
  ].join("");

  function renderLive() {
    var el = $("#fsDepthNow");
    if (el) el.textContent = m2(surgeFrom != null ? shown : depth);
    var im = $("#fsImpact"); if (im) im.textContent = impact(depth);
    var pv = $("#fsPerson"); if (pv) pv.innerHTML = personSVG(depth);
    var s = $("#fsSlider"); if (s && +s.value !== depth) s.value = depth;
    Array.prototype.forEach.call(document.querySelectorAll("#fsPanel [data-d]"), function (b) { b.classList.toggle("on", Math.abs(+b.dataset.d - depth) < 1e-6); });
    var bl = $("#fsBld"); if (bl) bl.innerHTML = buildingHTML();
    var zn = $("#fsZoom"); if (zn) zn.style.display = map && map.getZoom() < 13.5 ? "" : "none";
  }
  function renderPanel() {
    var p = $("#fsPanel");
    if (!p || !visible) return;
    p.querySelector(".fs-body").innerHTML =
      '<div class="fs-top"><span id="fsPerson">' + personSVG(depth) + '</span><div><div class="fs-big"><span id="fsDepthNow">' + m2(depth) + '</span> <small>ลึกจากพื้น</small></div>' +
      '<div class="fs-imp" id="fsImpact">' + esc(impact(depth)) + '</div></div></div>' +
      '<input type="range" id="fsSlider" min="0" max="' + MAX_DEPTH + '" step="0.05" value="' + depth + '" aria-label="ความลึกน้ำ (เมตร)">' +
      '<div class="fs-scale"><span>0</span><span>1 ม.</span><span>2 ม.</span><span>3 ม.</span><span>4 ม.</span><span>5 ม.</span><span>6 ม.</span></div>' +
      '<div class="fs-chips">' + PRESETS.map(function (x) { return '<button type="button" class="fs-chip" data-d="' + x[0] + '" title="' + esc(x[2]) + '">' + esc(x[1]) + '</button>'; }).join("") + '</div>' +
      '<div class="fs-row"><button type="button" class="fs-btn" data-a="surge">' + ico("waves") + ' จำลองน้ำหลากเข้า</button>' +
      '<button type="button" class="fs-btn ghost" data-a="home">' + ico("building-2") + ' ไปย่านตึกสูง</button></div>' +
      '<label class="fs-opt"><input type="checkbox" data-o="wave"' + (waves ? " checked" : "") + '> คลื่นและแสงสะท้อน <small style="opacity:.6">(ปิดเพื่อประหยัดแบตเตอรี่)</small></label>' +
      '<label class="fs-opt"><input type="checkbox" data-o="muddy"' + (style === "muddy" ? " checked" : "") + '> น้ำขุ่นแบบน้ำท่วมจริง</label>' +
      '<div class="fs-sec" id="fsBld">' + buildingHTML() + '</div>' +
      '<p class="fs-note" id="fsZoom" style="display:none">' + ico("zoom-in") + ' ซูมเข้าใกล้ขึ้นเพื่อให้เห็นตึก 3 มิติ</p>' +
      '<div class="fs-warn"><b>ภาพจำลองเพื่อเห็นภาพเท่านั้น</b> — น้ำลึกเท่ากันทุกที่ ไม่ได้คำนวณจากความสูงพื้นดินหรือทางน้ำจริง ' +
      '(ข้อมูลความสูงพื้นดินแบบเปิดในเมืองรวมความสูงตึกไว้ด้วยจึงใช้ไม่ได้) · ผลกระทบต่อคน/รถอ้างอิงคำเตือนของ NWS สหรัฐฯ · ติดตามประกาศจริงจาก ปภ. กรมอุตุฯ และ กทม.</div>';
    renderLive();
  }
  function setDepth(d, surge) {
    depth = Math.max(0, Math.min(MAX_DEPTH, Math.round(d * 100) / 100));
    lsSet(LS_DEPTH, String(depth));
    if (surge) { surgeFrom = 0; shown = 0; } else surgeFrom = null;
    renderLive();
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
      b.title = "จำลองน้ำท่วม 3 มิติ — เลือกความลึกน้ำแล้วดูว่าถนนและตึกจะเป็นอย่างไร";
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
          if (a.dataset.a === "surge") { setDepth(depth || 1, true); return; }
          if (a.dataset.a === "home") { map.flyTo(Object.assign({ duration: 2200 }, HOME)); return; }
        }
        var c = e.target.closest("[data-d]");
        if (c) setDepth(+c.dataset.d, false);
      });
      p.addEventListener("input", function (e) { if (e.target.id === "fsSlider") setDepth(+e.target.value, false); });
      p.addEventListener("change", function (e) {
        var o = e.target.dataset && e.target.dataset.o;
        if (o === "wave") { waves = e.target.checked; lsSet(LS_WAVE, waves ? "1" : "0"); }
        if (o === "muddy") { style = e.target.checked ? "muddy" : "blue"; lsSet(LS_STYLE, style); applyStyle(); renderLive(); }
        if (H) { H.setAnim(MOD_ID, true); H.repaint(); }
      });
    }
    syncButtons();
  }
  function placePanel() {
    var p = $("#fsPanel"), ts = $("#toolbarStack") || $("#leftMenu"), stg = $(".stage");
    if (!p) return;
    if (ts && stg && window.innerWidth > 760) {
      var r1 = ts.getBoundingClientRect(), r0 = stg.getBoundingClientRect();
      p.style.left = Math.round(r1.right - r0.left + 10) + "px";
      p.style.top = Math.round(Math.max(14, r1.top - r0.top)) + "px";
    } else { p.style.left = ""; p.style.top = ""; }
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
      return;
    }
    placePanel();
    renderPanel();
    ensureLoaded().then(function () {
      if (!visible) return;
      H.show(MOD_ID, true);
      H.setAnim(MOD_ID, true);
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
    if (STYLES[lsGet(LS_STYLE)]) style = lsGet(LS_STYLE);
    waves = lsGet(LS_WAVE) !== "0";
    buildUI();
    if (!mount._bound) {
      mount._bound = true;
      map.on("click", pickBuilding);
      map.on("zoomend", function () { if (visible) renderLive(); });
      window.addEventListener("resize", function () { if (visible) placePanel(); });
    }
    if (lsGet(LS_ON) === "1" && !visible) setVisible(true, true);
  }

  window.BKK_FLOODSIM = {
    mount: mount,
    setVisible: setVisible,
    setDepth: setDepth,
    debug: function () {
      return { visible: visible, depth: depth, shown: shown, style: style, waves: waves, loaded: !!mesh, meshVisible: mesh && mesh.visible, meshZ: mesh && mesh.position.z, picked: picked };
    }
  };
})();
