/**
 * bkk-sealevel.js
 * โหมด "น้ำทะเลหนุน (ปี 2050)" ของ "จำลองน้ำท่วม 3 มิติ" (bkk-floodsim.js) — แนวเดียวกับแผนที่ NYT / Climate Central 2019
 * "Land underwater at high tide" แต่คำนวณเองจากข้อมูลเปิดที่ใหม่กว่า (ข้อมูลจาก _geo/build-bkk-sealevel.mjs → bkk-sea-*.png/json)
 *
 * แบบจำลอง (อ่างน้ำที่ต้องต่อกับทะเล — bathtub + connectivity เหมือน Kulp & Strauss 2019)
 *   ระดับน้ำ  W(ปี) = ระดับน้ำขึ้นอ้างอิงวันนี้ (ม.รทก.) + น้ำทะเลสูงขึ้นจากภูมิอากาศ (IPCC AR6, หักส่วนที่เกิดแล้วถึงปี 2569)
 *   พื้นดิน   h(ปี) = ความสูง DeltaDTM + อัตราแผ่นดินทรุดจากดาวเทียม × (ปี − ปีของข้อมูล) × ตัวคูณที่ผู้ใช้เลือก
 *   ช่องไหน "จม" = มีทางน้ำจากอ่าวไทย (และแม่น้ำ ถ้าเปิด) ไหลมาถึงโดยไม่ต้องข้ามที่สูงกว่า W
 *     → คำนวณ "ระดับน้ำต่ำสุดที่ต้องมีจึงจะไหลมาถึงช่องนี้" (C) ด้วยคิวแบ่งถัง 1 ซม. (Priority-Flood แบบ O(N)) ใน Web Worker
 *     → จม ⇔ C ≤ W · ความลึก = W − h
 *   ไม่คิดคันกั้นน้ำ ประตูระบายน้ำ สถานีสูบ (เหมือน Climate Central) — บอกชัดบนแผง
 *
 * วาดสองแบบ
 *   ซูมออก (< 11): ภาพ 2 มิติ (image source ของ MapLibre — ยืดแถวตามเมอร์เคเตอร์ให้ตรงพิกัด) สองสี: ต่ำกว่าน้ำขึ้นแล้ววันนี้ / เพิ่มภายในปีที่เลือก
 *   ซูมเข้า (≥ 11): ผิวน้ำ 3 มิติในฉากกลางของ floodsim (ตึกจมใต้ผิวน้ำ) — เท็กซ์เจอร์ RGBA16F: R พื้นดิน, G = C ปีที่เลือก, B = C วันนี้, A = ทะเล
 *
 * ความสูงทั้งหมดภายในเก็บเป็น ม. EGM2008 แล้วแสดงเป็น ม.รทก. (EGM2008 − 0.87)
 * floodsim เรียก: attach3D(shared) · activate(fly) · deactivate() · frame(z, u) · renderPanel(el) · click(e) · applyStyle(st) · mount(map)
 */
(function () {
  "use strict";

  var DATA_JSON = "bkk-sea.json", PNG_NEW = "bkk-sea-new.png", PNG_OLD = "bkk-sea-old.png";
  var SRC_ID = "bkk-sea-ov", LAYER_ID = "bkk-sea-ov";
  var YEARS = [2026, 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100];
  var SCEN = [
    { id: "ssp126", n: "ลดก๊าซได้มาก", s: "SSP1-2.6" },
    { id: "ssp245", n: "ปานกลาง", s: "SSP2-4.5" },
    { id: "ssp585", n: "ปล่อยก๊าซสูง", s: "SSP5-8.5" },
    { id: "ssp585_low", n: "เลวร้ายสุด", s: "SSP5-8.5 · แผ่นน้ำแข็งพังเร็ว (โอกาส 5%)" }
  ];
  var SUBS = [[0, "ไม่คิด"], [0.5, "ครึ่งของอัตราตอนนี้"], [1, "ตามอัตราตอนนี้"]];
  var HOME = { center: [100.56, 13.64], zoom: 9.3, pitch: 0, bearing: 0 };
  var LS = "bkk-sea-";
  var COL = { today: [37, 99, 235], add: [56, 189, 248], pond: [96, 165, 250] };
  var MINI = 6;                               // ภาพเทียบเก่า/ใหม่บนแผง: ย่อ 6 เท่า (220 × 260)
  var SEG_X = 520, SEG_Y = 620;               // ตารางจุดยอดผิวน้ำ 3 มิติ (~230 ม./ช่อง) — ขอบน้ำละเอียดตามข้อมูล (~90 ม.) ในเฟรกเมนต์

  var map = null, S = null;                   // S = { T, H, group, waterUniforms, WATER_LIGHT, style }
  var data = null, loading = null, loadErr = null;
  var worker = null, jobId = 0, busy = false, pending = false;
  var res = null;                             // ผลล่าสุด { key, Wt, W0, newT, newT0, oldT, oldT0 }
  var active = false, mesh = null, mat = null, tex = null, texView = null;
  var shownLevel = null, surgeFrom = null, playing = false, playTimer = null;
  var picked = null, panelEl = null, ovUrl = null, ovKey = null;
  var cfg = {
    yi: 3, scen: "ssp245", hi: false, subs: 1, ref: "mhhw", rivers: true, view: "new"
  };

  function $(s, r) { return (r || document).querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function lsGet(k) { try { return localStorage.getItem(LS + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(LS + k, v); } catch (e) { } }
  function num(v, d) { return Number(v).toLocaleString("th-TH", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function sgn(v, d) { return (v >= 0 ? "+" : "−") + num(Math.abs(v), d == null ? 2 : d); }
  function be(y) { return y + 543; }
  function DATUM() { return data ? data.meta.datum.egm08_minus_rtk : 0.87; }

  /* ================================================================ ข้อมูล */
  function loadImg(src) {
    return new Promise(function (ok, bad) {
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { bad(new Error("โหลด " + src + " ไม่สำเร็จ")); };
      img.src = src;
    });
  }
  function pixels(img, W, H) {
    var cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    var g = cv.getContext("2d", { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    return g.getImageData(0, 0, W, H).data;
  }
  function load() {
    if (data) return Promise.resolve(data);
    if (loading) return loading;
    loading = fetch(DATA_JSON).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).then(function (meta) {
      return Promise.all([loadImg(PNG_NEW), loadImg(PNG_OLD)]).then(function (im) {
        var W = meta.w, H = meta.h, N = W * H, a = pixels(im[0], W, H), b = pixels(im[1], W, H);
        var hNew = new Float32Array(N), hOld = new Float32Array(N), cls = new Uint8Array(N), prov = new Uint8Array(N), vlm = new Float32Array(N);
        var bb = meta.bbox, g = meta.dN_egm08_minus_egm96;
        // ความต่างจีออยด์ EGM2008 − EGM96 แบบสองเชิงเส้นบนกริด 0.1° (แปลง SRTM ให้อยู่ระดับอ้างอิงเดียวกับ DeltaDTM)
        var dNrow = function (lat) {
          var j = Math.max(0, Math.min(g.lats.length - 2, Math.floor((lat - g.lats[0]) / 0.1))), ty = Math.max(0, Math.min(1, (lat - g.lats[j]) / 0.1));
          return g.lons.map(function (_, i) { return g.v[j][i] * (1 - ty) + g.v[j + 1][i] * ty; });
        };
        for (var j = 0; j < H; j++) {
          var lat = bb[3] - (j + 0.5) / H * (bb[3] - bb[1]), row = dNrow(lat);
          for (var i = 0; i < W; i++) {
            var k = j * W + i, o = k * 4;
            hNew[k] = (a[o] * 256 + a[o + 1]) / 100 - 10;
            cls[k] = a[o + 2] & 3; prov[k] = a[o + 2] >> 2;
            var lon = bb[0] + (i + 0.5) / W * (bb[2] - bb[0]);
            var fi = Math.max(0, Math.min(g.lons.length - 2, Math.floor((lon - g.lons[0]) / 0.1))), tx = Math.max(0, Math.min(1, (lon - g.lons[fi]) / 0.1));
            hOld[k] = (b[o] * 256 + b[o + 1]) / 100 - 10 - (row[fi] * (1 - tx) + row[fi + 1] * tx);
            vlm[k] = (b[o + 2] - 128) / 20;
          }
        }
        // พื้นที่ต่อช่อง (ตร.กม.) ตามละติจูดของแถว
        var rowKm2 = new Float64Array(H), dx = (bb[2] - bb[0]) / W, dy = (bb[3] - bb[1]) / H;
        for (j = 0; j < H; j++) rowKm2[j] = dx * 111.32 * Math.cos((bb[3] - (j + 0.5) * dy) * Math.PI / 180) * dy * 110.57;
        data = { meta: meta, W: W, H: H, N: N, hNew: hNew, hOld: hOld, cls: cls, prov: prov, vlm: vlm, rowKm2: rowKm2 };
        loadErr = null;
        return data;
      });
    }).catch(function (e) { loadErr = String(e.message || e); loading = null; throw e; });
    return loading;
  }

  /* ================================================================ ตัวคำนวณ (Web Worker) */
  // C[k] = ระดับน้ำต่ำสุดที่น้ำจากทะเลจะไหลมาถึงช่อง k ได้ (ม. EGM2008) · ไปไม่ถึงภายใน LMAX = 100
  // ทะเล (และแม่น้ำ ถ้าเปิด) = จุดเริ่ม · บึง/บ่อ = ผิวน้ำ น้ำผ่านได้ที่ระดับเดียวกับตอนเข้า · แม่น้ำตอนปิด = กำแพง
  // ดึงคิวตามถัง 1 ซม. จากต่ำไปสูง (Dial) → แต่ละช่องถูกใส่คิวครั้งเดียวด้วยค่าต่ำสุดแล้ว (ค่าที่ป้อนเพิ่มไม่ลดลง)
  function WORKER() {
    var B = null, LMIN = -3, LMAX = 9, NB = 1201;
    self.onmessage = function (e) {
      var m = e.data;
      if (m.init) { B = m.init; return; }
      var out = {}, tr = [];
      for (var i = 0; i < m.jobs.length; i++) {
        var C = flood(m.jobs[i]);
        out[m.jobs[i].key] = C;
        tr.push(C.buffer);
      }
      self.postMessage({ id: m.id, out: out }, tr);
    };
    function flood(j) {
      var W = B.W, N = W * B.H, cls = B.cls, h0 = j.old ? B.hOld : B.hNew, vlm = B.vlm, k;
      var h = new Float32Array(N), C = new Float32Array(N), head = new Int32Array(NB), next = new Int32Array(N);
      var f = j.f;                                           // ม. ต่อ (ซม./ปี) — ดู sinkF()
      for (k = 0; k < N; k++) { h[k] = h0[k] + vlm[k] * f; C[k] = 100; }
      for (k = 0; k < NB; k++) head[k] = -1;
      function push(q, v) {
        var b = Math.floor((v - LMIN) * 100);
        if (b < 0) b = 0;
        if (b >= NB) return;
        C[q] = v; next[q] = head[b]; head[b] = q;
      }
      for (k = 0; k < N; k++) if (cls[k] === 1 || (cls[k] === 3 && j.rivers)) push(k, LMIN);
      for (var b = 0; b < NB; b++) {
        while (head[b] !== -1) {
          k = head[b]; head[b] = next[k];
          var cv = C[k], x = k % W, y = (k - x) / W;
          for (var dy = -1; dy <= 1; dy++) {
            var ny = y + dy;
            if (ny < 0 || ny >= B.H) continue;
            for (var dx = -1; dx <= 1; dx++) {
              var nx = x + dx;
              if ((!dx && !dy) || nx < 0 || nx >= W) continue;
              var q = ny * W + nx;
              if (C[q] < 99) continue;                             // ใส่คิวแล้ว
              var c = cls[q];
              if (c === 1 || (c === 3 && !j.rivers)) continue;
              var hq = c >= 2 ? LMIN : h[q];
              push(q, hq > cv ? hq : cv);
            }
          }
        }
      }
      return C;
    }
  }
  function ensureWorker() {
    if (worker) return worker;
    var url = URL.createObjectURL(new Blob(["(" + WORKER.toString() + ")()"], { type: "text/javascript" }));
    worker = new Worker(url);
    worker.postMessage({ init: { W: data.W, H: data.H, cls: data.cls, hNew: data.hNew, hOld: data.hOld, vlm: data.vlm } });
    worker.onmessage = onResult;
    worker.onerror = function (e) { console.warn("bkk-sealevel worker:", e.message); busy = false; renderLive(); };
    return worker;
  }

  /* ---------------- ระดับน้ำตามปี/ฉากทัศน์ ---------------- */
  function slrAt(year) {                       // ม. เทียบค่าเฉลี่ย 1995–2014
    var t = data.meta.ar6, sc = t.table[cfg.scen], p = cfg.scen === "ssp585_low" ? "p95" : cfg.hi ? "p83" : "p50";
    var arr = sc[p] || sc.p50, ys = t.years;
    if (year <= ys[0]) return arr[0];
    for (var i = 1; i < ys.length; i++) if (year <= ys[i]) return arr[i - 1] + (arr[i] - arr[i - 1]) * (year - ys[i - 1]) / (ys[i] - ys[i - 1]);
    return arr[arr.length - 1];
  }
  function refRtk() { var d = data.meta.datum; return cfg.ref === "annual" ? d.annual_rtk : d.mhhw_rtk; }
  function levelRtk(year) { return refRtk() + slrAt(year) - slrAt(data.meta.datum.today); }
  function year() { return YEARS[cfg.yi]; }
  function cfgKey() { return [cfg.yi, cfg.scen, cfg.hi, cfg.subs, cfg.ref, cfg.rivers].join("|"); }

  /* ---------------- แคชผลคำนวณ ----------------
     C (ทางน้ำจากทะเล) ขึ้นกับ "ผิวพื้นดิน" เท่านั้น = ข้อมูลเก่า/ใหม่ × ปี (เฉพาะตอนคิดแผ่นดินทรุด) × ตัวคูณทรุด × แม่น้ำเปิด/ปิด
     ไม่ขึ้นกับฉากทัศน์หรือระดับน้ำอ้างอิง → เปลี่ยนฉากทัศน์ = แค่เทียบกับระดับน้ำใหม่ ไม่ต้องคำนวณใหม่
     ไม่คิดทรุด → ทุกปีใช้ผลเดียวกัน (เลื่อนปีได้ทันที) · ผลละ ~16 MB เก็บไว้ไม่เกิน CACHE_MAX ชุด */
  var cache = {}, cacheOrder = [], CACHE_MAX = 8;            // ชุดละ ~8 MB (เก็บแค่ C · ความสูงคำนวณใหม่ได้ทันทีจาก hAt)
  function surfKey(old, yr) { return (old ? "o" : "n") + "|" + (cfg.subs ? yr : 0) + "|" + cfg.subs + "|" + (cfg.rivers ? 1 : 0); }
  // แผ่นดินทรุดสะสม (ม.) ต่ออัตรา 1 ซม./ปี ตั้งแต่ปีของข้อมูลถึงปีที่เลือก
  function sinkF(old, yr, subs) { var d = data.meta.datum; return (yr - (old ? d.epoch_old : d.epoch_new)) * subs / 100; }
  function keyInfo(k) {
    var p = k.split("|"), old = p[0] === "o";
    return { old: old, f: sinkF(old, +p[1] || data.meta.datum.today, +p[2]), rivers: p[3] === "1" };
  }
  // ความสูงพื้นดิน (ม. EGM2008) ของช่อง k ในผลชุด e ณ ปีของชุดนั้น
  function hAt(e, k) { return (e.old ? data.hOld : data.hNew)[k] + data.vlm[k] * e.f; }
  function needKeys() {
    var Y = year(), T = data.meta.datum.today;
    return { newT: surfKey(false, Y), oldT: surfKey(true, Y), newT0: surfKey(false, T), oldT0: surfKey(true, T) };
  }
  function cachePut(k, v) {
    cache[k] = v;
    cacheOrder = cacheOrder.filter(function (x) { return x !== k; }).concat(k);
    var need = needKeys(), keep = {};
    Object.keys(need).forEach(function (r) { keep[need[r]] = 1; });
    for (var i = 0; cacheOrder.length > CACHE_MAX && i < cacheOrder.length;) {   // ทิ้งชุดเก่าสุดที่ค่าปัจจุบันไม่ใช้
      if (keep[cacheOrder[i]]) { i++; continue; }
      delete cache[cacheOrder[i]];
      cacheOrder.splice(i, 1);
    }
  }
  function compute() {
    if (!data) return;
    if (busy) { pending = true; return; }
    pending = false;
    var ks = needKeys(), jobs = [], seen = {};
    Object.keys(ks).forEach(function (role) {
      var k = ks[role];
      if (cache[k] || seen[k]) return;
      seen[k] = 1;
      var e = keyInfo(k);
      jobs.push({ key: k, old: e.old, f: e.f, rivers: e.rivers });
    });
    if (!jobs.length) { finish(); return; }
    busy = true;
    ensureWorker().postMessage({ id: ++jobId, jobs: jobs });
    renderLive();
  }
  function onResult(e) {
    var m = e.data;
    busy = false;
    Object.keys(m.out).forEach(function (k) { var e = keyInfo(k); e.C = m.out[k]; cachePut(k, e); });
    compute();                                   // ครบแล้ว → finish() · ระหว่างคำนวณผู้ใช้เปลี่ยนค่าไป → คำนวณส่วนที่ขาดต่อ
  }
  // รวมผลจากแคชตามค่าปัจจุบัน (เรียกเมื่อทุกชุดที่ต้องใช้อยู่ในแคชแล้ว)
  function finish() {
    var ks = needKeys(), Y = year(), prevTex = res && res.texKey;
    res = {
      key: cfgKey(), ks: ks, year: Y, Wt: levelRtk(Y) + DATUM(), W0: refRtk() + DATUM(),
      newT: cache[ks.newT], oldT: cache[ks.oldT], newT0: cache[ks.newT0], oldT0: cache[ks.oldT0]
    };
    res.texKey = [cfg.view, cfg.view === "old" ? ks.oldT + ks.oldT0 : ks.newT + ks.newT0].join("|");
    res.stats = stats();
    // ซูมออก (ฉาก 3 มิติไม่วาด) → ข้ามแอนิเมชัน ไม่งั้นซูมเข้าทีหลังจะเห็นน้ำค่อย ๆ ขึ้นเองจากระดับเก่า
    if (shownLevel == null || !map || map.getZoom() < (S && S.H ? S.H.minZoom : 11)) shownLevel = res.Wt;
    if (res.texKey !== prevTex || !mesh) buildTexture();
    drawOverlay();
    renderLive();
    if (S && S.H) { S.H.setAnim("floodsim", true); S.H.repaint(); }
  }

  /* ---------------- สถิติ ---------------- */
  function stats() {
    var W = data.W, H = data.H, cls = data.cls, prov = data.prov, np = data.meta.provinces.length + 1;
    var out = { newT: 0, newT0: 0, oldT: 0, byProv: new Float64Array(np), byProv0: new Float64Array(np), provKm2: new Float64Array(np), lowDisc: 0 };
    var a = res.newT.C, a0 = res.newT0.C, o = res.oldT.C, h0 = data.hNew, vlm = data.vlm, f = res.newT.f, Wt = res.Wt, W0 = res.W0;
    for (var j = 0; j < H; j++) {
      var km = data.rowKm2[j];
      for (var i = 0; i < W; i++) {
        var k = j * W + i;
        if (cls[k] !== 0) continue;
        var p = prov[k];
        out.provKm2[p] += km;
        if (a[k] <= Wt) { out.newT += km; out.byProv[p] += km; } else if (h0[k] + vlm[k] * f <= Wt) out.lowDisc += km;
        if (a0[k] <= W0) { out.newT0 += km; out.byProv0[p] += km; }
        if (o[k] <= Wt) out.oldT += km;
      }
    }
    return out;
  }

  /* ================================================================ ภาพ 2 มิติ (ซูมออก) */
  function mercY(lat) { return Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)); }
  function drawOverlay() {
    if (!res || !map) return;
    var old = cfg.view === "old", T = old ? res.oldT : res.newT, T0 = old ? res.oldT0 : res.newT0;
    var key = res.key + "|" + cfg.view;
    if (key === ovKey && map.getSource(SRC_ID)) return;
    ovKey = key;
    var W = data.W, H = data.H, bb = data.meta.bbox, yN = mercY(bb[3]), yS = mercY(bb[1]), cls = data.cls;
    var cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    var g = cv.getContext("2d"), img = g.createImageData(W, H), px = img.data, Wt = res.Wt, W0 = res.W0;
    for (var r = 0; r < H; r++) {
      // แถวของภาพเว้นเท่ากันตามเมอร์เคเตอร์ (MapLibre ยืดภาพเชิงเส้นในระนาบเมอร์เคเตอร์) → หาแถวข้อมูลที่ละติจูดนั้น
      var my = yN + (yS - yN) * (r + 0.5) / H, lat = (2 * Math.atan(Math.exp(my)) - Math.PI / 2) * 180 / Math.PI;
      var j = Math.max(0, Math.min(H - 1, Math.floor((bb[3] - lat) / (bb[3] - bb[1]) * H)));
      for (var i = 0; i < W; i++) {
        var k = j * W + i, c = cls[k];
        if (c === 1 || T.C[k] > Wt) continue;
        var col = c >= 2 ? COL.pond : T0.C[k] <= W0 ? COL.today : COL.add, o = (r * W + i) * 4;
        px[o] = col[0]; px[o + 1] = col[1]; px[o + 2] = col[2]; px[o + 3] = c >= 2 ? 150 : 205;
      }
    }
    g.putImageData(img, 0, 0);
    cv.toBlob(function (blob) {
      if (!blob || !map || ovKey !== key) return;
      var url = URL.createObjectURL(blob), prev = ovUrl;
      ovUrl = url;
      var coords = [[bb[0], bb[3]], [bb[2], bb[3]], [bb[2], bb[1]], [bb[0], bb[1]]];
      var src = map.getSource(SRC_ID);
      if (src) src.updateImage({ url: url, coordinates: coords });
      else addOverlay(url, coords);
      setOverlayVis();
      if (prev) setTimeout(function () { URL.revokeObjectURL(prev); }, 4000);
    }, "image/png");
  }
  function beforeLayer() {
    // ใต้ป้ายชื่อและใต้ฉาก 3 มิติ — ชื่อสถานที่ยังอ่านได้บนผืนน้ำ
    if (map.getLayer("bkk-3d-world")) return "bkk-3d-world";
    if (map.getLayer("city-buildings-3d")) return "city-buildings-3d";
    var ls = map.getStyle().layers || [];
    for (var i = 0; i < ls.length; i++) if (ls[i].type === "symbol") return ls[i].id;
    return undefined;
  }
  function addOverlay(url, coords) {
    if (!map || !map.getStyle()) return;
    if (!map.getSource(SRC_ID)) map.addSource(SRC_ID, { type: "image", url: url, coordinates: coords });
    if (!map.getLayer(LAYER_ID)) map.addLayer({
      id: LAYER_ID, type: "raster", source: SRC_ID,
      // ซูมเข้าถึงระดับที่ผิวน้ำ 3 มิติเริ่มวาด (11) → ค่อย ๆ จางให้ 3 มิติรับช่วง
      paint: { "raster-opacity": ["interpolate", ["linear"], ["zoom"], 10.6, 0.85, 11.4, 0], "raster-resampling": "nearest", "raster-fade-duration": 0 }
    }, beforeLayer());
    // กรอบเส้นประบอกขอบเขตข้อมูล — นอกกรอบไม่ได้คำนวณ (ไม่ใช่ว่าไม่ท่วม)
    if (!map.getSource(SRC_ID + "-box")) map.addSource(SRC_ID + "-box", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords.concat([coords[0]]) } } });
    if (!map.getLayer(LAYER_ID + "-box")) map.addLayer({
      id: LAYER_ID + "-box", type: "line", source: SRC_ID + "-box",
      paint: { "line-color": "#94a3b8", "line-width": 1.2, "line-dasharray": [3, 3], "line-opacity": ["interpolate", ["linear"], ["zoom"], 10.6, 0.8, 11.4, 0] }
    }, beforeLayer());
  }
  function setOverlayVis() {
    if (!map) return;
    [LAYER_ID, LAYER_ID + "-box"].forEach(function (id) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", active ? "visible" : "none"); });
  }

  /* ================================================================ ผิวน้ำ 3 มิติ (ซูมเข้า) */
  var _f32 = new Float32Array(1), _u32 = new Uint32Array(_f32.buffer);
  function toHalf(v) {
    _f32[0] = v;
    var x = _u32[0], s = (x >>> 16) & 0x8000, e = ((x >>> 23) & 0xff) - 127 + 15, m = x & 0x7fffff;
    if (e <= 0) return s;
    if (e >= 31) return s | 0x7c00;
    return s | (e << 10) | (m >>> 13);
  }
  // พื้นของช่องแม่น้ำ/บ่อ/บึง (ไม่มีค่าความสูง) = เฉลี่ยตลิ่งรอบ ๆ ไล่จากขอบเข้าไป (BFS ครั้งเดียว)
  //   → ผิวน้ำ 3 มิติเหนือแม่น้ำเรียบต่อกับที่ราบข้าง ๆ (ถ้าใช้ค่าคงที่ ผิวน้ำเหนือแม่น้ำจะนูนเป็นสันสูงหลายเมตร)
  //   ทะเล = −1 ม. (ถูกตัดทิ้งในเชเดอร์อยู่แล้ว ค่านี้แค่กันขอบกระโดดตอนกรองเชิงเส้น)
  function groundTex(e) {
    var W = data.W, H = data.H, N = data.N, cls = data.cls, g = new Float32Array(N), done = new Uint8Array(N), q = new Int32Array(N), qh = 0, qt = 0, k;
    for (k = 0; k < N; k++) {
      if (cls[k] === 0) { g[k] = hAt(e, k); done[k] = 1; }
      else if (cls[k] === 1) { g[k] = -1; done[k] = 1; }
    }
    var avg = function (k) {
      var x = k % W, y = (k - x) / W, s = 0, n = 0;
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var nx = x + dx, ny = y + dy, j;
        if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        j = ny * W + nx;
        if (done[j] === 1 && cls[j] !== 1) { s += g[j]; n++; }
      }
      return n ? s / n : NaN;
    };
    for (k = 0; k < N; k++) if (!done[k]) { var v = avg(k); if (v === v) { g[k] = v; done[k] = 2; q[qt++] = k; } }
    for (k = 0; k < qt; k++) done[q[k]] = 1;
    while (qh < qt) {
      var from = qh, to = qt;
      for (var i = from; i < to; i++) {
        var c = q[i], x = c % W, y = (c - x) / W;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          var nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          var j = ny * W + nx;
          if (done[j]) continue;
          var a = avg(j);
          if (a === a) { g[j] = a; done[j] = 2; q[qt++] = j; }
        }
      }
      for (i = to; i < qt; i++) done[q[i]] = 1;                // ชั้นนี้เสร็จแล้วค่อยให้ชั้นถัดไปใช้ค่า
      qh = to;
    }
    for (k = 0; k < N; k++) if (!done[k]) g[k] = 1;          // บึงที่ไม่มีบกติดเลย (ไม่น่าเกิด)
    return g;
  }
  function buildTexture() {
    if (!S || !res) return;
    var T = S.T, old = cfg.view === "old", R = old ? res.oldT : res.newT, R0 = old ? res.oldT0 : res.newT0;
    var N = data.N, cls = data.cls, buf = new Uint16Array(N * 4), ONE = toHalf(1), ZERO = toHalf(0), gr = groundTex(R);
    for (var k = 0; k < N; k++) {
      var c = cls[k], o = k * 4;
      buf[o] = toHalf(gr[k]);
      buf[o + 1] = toHalf(R.C[k]);
      buf[o + 2] = toHalf(R0.C[k]);
      buf[o + 3] = c === 1 ? ONE : ZERO;
    }
    if (tex) tex.dispose();
    tex = new T.DataTexture(buf, data.W, data.H, T.RGBAFormat, T.HalfFloatType);
    tex.minFilter = T.LinearFilter; tex.magFilter = T.LinearFilter;
    tex.wrapS = tex.wrapT = T.ClampToEdgeWrapping;
    tex.flipY = false; tex.generateMipmaps = false; tex.unpackAlignment = 4;
    tex.internalFormat = "RGBA16F";                        // three r128 + HalfFloat: ระบุเองกันอัปโหลดเงียบ ๆ ไม่สำเร็จ
    tex.needsUpdate = true;
    texView = cfg.view;
    if (mat) mat.uniforms.uSea.value = tex;
    else buildMesh();
  }
  function buildMesh() {
    var T = S.T, H = S.H, bb = data.meta.bbox, NX = SEG_X + 1, NY = SEG_Y + 1;
    var pos = new Float32Array(NX * NY * 3), uv = new Float32Array(NX * NY * 2), idx = new Uint32Array(SEG_X * SEG_Y * 6), n = 0;
    for (var j = 0; j < NY; j++) {
      var lat = bb[3] - (bb[3] - bb[1]) * j / SEG_Y;
      for (var i = 0; i < NX; i++) {
        var p = H.toLocal(bb[0] + (bb[2] - bb[0]) * i / SEG_X, lat), k = j * NX + i;
        pos[k * 3] = p.x; pos[k * 3 + 1] = p.y;
        uv[k * 2] = i / SEG_X; uv[k * 2 + 1] = j / SEG_Y;
      }
    }
    for (j = 0; j < SEG_Y; j++) for (i = 0; i < SEG_X; i++) {
      var a = j * NX + i;
      idx[n++] = a; idx[n++] = a + NX; idx[n++] = a + 1; idx[n++] = a + 1; idx[n++] = a + NX; idx[n++] = a + NX + 1;
    }
    var geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("uv", new T.BufferAttribute(uv, 2));
    geo.setIndex(new T.BufferAttribute(idx, 1));
    var u = S.waterUniforms();
    u.uSea = { value: tex }; u.uLevel = { value: shownLevel }; u.uLevel0 = { value: res.W0 }; u.uK = { value: H.kAt((bb[1] + bb[3]) / 2) };
    u.uAddCol = { value: new T.Color("#38bdf8") };
    mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: [S.WATER_LIGHT, FRAG].join("\n"), transparent: true, depthWrite: true, side: T.DoubleSide, uniforms: u });
    mesh = new T.Mesh(geo, mat);
    mesh.renderOrder = -1; mesh.frustumCulled = false; mesh.visible = false;
    S.group.add(mesh);
  }
  var VERT = [
    "uniform sampler2D uSea; uniform float uK, uLevel;",
    "varying vec3 vW; varying vec2 vUv;",
    "void main(){",
    "  vUv = uv;",
    "  vec4 s = texture2D(uSea, uv);",
    "  float d = (s.a > 0.5 || s.g > uLevel) ? 0.0 : max(uLevel - s.r, 0.0);",
    "  vec4 w = modelMatrix * vec4(position.xy, d * uK + 0.03, 1.0);",
    "  vW = w.xyz;",
    "  gl_Position = projectionMatrix * viewMatrix * w;",
    "}"
  ].join("\n");
  var FRAG = [
    "uniform sampler2D uSea; uniform float uLevel, uLevel0; uniform vec3 uAddCol;",
    "varying vec3 vW; varying vec2 vUv;",
    "void main(){",
    "  vec4 s = texture2D(uSea, vUv);",
    "  if (s.a > 0.5 || s.g > uLevel) discard;",          // ทะเลจริง (แผนที่ฐานวาดแล้ว) / น้ำจากทะเลยังไปไม่ถึง
    "  float d = uLevel - s.r;",
    "  if (d < 0.01) discard;",
    "  vec4 c = water(vW, clamp(d / 3.0, 0.0, 1.0));",
    "  float add = step(uLevel0 + 0.005, s.b);",           // ปีนี้ยังไม่จม → จมเพิ่มภายในปีที่เลือก: ย้อมฟ้าอ่อน
    "  c.rgb = mix(c.rgb, uAddCol, add * 0.38);",
    "  c.a *= smoothstep(0.0, 0.2, d);",
    "  gl_FragColor = c;",
    "}"
  ].join("\n");

  /* ================================================================ ทุกเฟรม (เรียกจาก floodsim.frame) */
  function approach(cur, tgt, r, dt) { return cur < tgt ? Math.min(tgt, cur + r * dt) : cur > tgt ? Math.max(tgt, cur - r * dt) : cur; }
  var lastT = 0;
  function frame(z, u) {
    if (!mesh) return false;
    mesh.visible = active && !!res && texView === cfg.view;
    if (!mesh.visible) return false;
    var now = performance.now(), dt = Math.min(0.1, (now - (lastT || now)) / 1000);
    lastT = now;
    var tgt = res.Wt, moving = false;
    if (shownLevel == null) shownLevel = tgt;
    if (shownLevel !== tgt) {
      var r = surgeFrom != null ? Math.max(0.08, (tgt - surgeFrom) / 6) : Math.max(1, Math.abs(tgt - shownLevel) * 4);
      shownLevel = approach(shownLevel, tgt, r, dt);
      if (Math.abs(shownLevel - tgt) < 1e-4) { shownLevel = tgt; if (surgeFrom != null) { surgeFrom = null; renderLive(); } }
      moving = true;
    }
    var m = mat.uniforms;
    m.uLevel.value = shownLevel; m.uLevel0.value = res.W0;
    m.uTime.value = u.time; m.uWave.value = u.wave;
    if (u.eye) m.uEye.value.copy(u.eye);
    if (surgeFrom != null) { var el = $("#slLevelNow"); if (el) el.textContent = num(shownLevel - DATUM(), 2); }
    return moving;
  }
  function applyStyle(st) {
    if (!mat) return;
    mat.uniforms.uDeep.value.set(st.deep); mat.uniforms.uSky.value.set(st.sky); mat.uniforms.uOpacity.value = st.op;
  }

  /* ================================================================ คลิก */
  function cellAt(lon, lat) {
    var bb = data.meta.bbox, i = Math.floor((lon - bb[0]) / (bb[2] - bb[0]) * data.W), j = Math.floor((bb[3] - lat) / (bb[3] - bb[1]) * data.H);
    if (i < 0 || j < 0 || i >= data.W || j >= data.H) return -1;
    return j * data.W + i;
  }
  function click(e) {
    if (!active || !data) return;
    picked = { lon: e.lngLat.lng, lat: e.lngLat.lat };
    renderLive();
  }
  function pickHTML() {
    if (!picked) return '<p class="fs-note">' + ico("mountain") + ' กดจุดไหนก็ได้บนแผนที่ — ดูว่าพื้นดินสูงเท่าไร ทรุดลงแค่ไหน และปีที่เลือกจะจมหรือไม่</p>';
    var k = cellAt(picked.lon, picked.lat);
    if (k < 0) return '<p class="fs-note">จุดที่เลือกอยู่นอกพื้นที่ข้อมูล (100.0–101.1°E, 13.0–14.3°N)</p>';
    var c = data.cls[k];
    if (c === 1) return '<p class="fs-note">จุดที่เลือกเป็นทะเล (อ่าวไทย)</p>';
    if (c >= 2) return '<p class="fs-note">จุดที่เลือกเป็น' + (c === 2 ? "บึง/บ่อเลี้ยงสัตว์น้ำ/นาเกลือ" : "แม่น้ำ/คลอง") + ' — ไม่มีค่าความสูงพื้นดิน</p>';
    var D = DATUM(), Y = year(), h0 = data.hNew[k] - D, rate = data.vlm[k], hy = res ? hAt(res.newT, k) - D : h0;
    var wl = res ? res.Wt - D : null, s = '<div class="fs-gr"><b>จุดที่เลือก</b> พื้นดินสูง <b>' + num(h0, 2) + ' ม.รทก.</b> (DeltaDTM)';
    s += '<br>แผ่นดิน' + (rate < 0 ? "ทรุด" : "ยก") + ' <b>' + num(Math.abs(rate), 1) + ' ซม./ปี</b>' + (cfg.subs ? ' → ปี ' + Y + ' เหลือ <b>' + num(hy, 2) + ' ม.รทก.</b>' : ' <small>(ตอนนี้ตั้งไม่คิดการทรุด)</small>');
    if (res) {
      var C = res.newT.C[k], dep = wl - hy;
      s += '<br>น้ำขึ้นสูงปี ' + Y + ' ≈ ' + num(wl, 2) + ' ม.รทก. → ';
      s += C <= res.Wt ? '<b class="fs-bad">ต่ำกว่าน้ำ ' + num(dep, 2) + ' ม.</b> น้ำทะเลไหลถึง (ถ้าไม่มีคันกั้น)' :
        dep > 0 ? '<b>ต่ำกว่าน้ำ ' + num(dep, 2) + ' ม.</b> แต่มีที่สูงล้อมรอบ น้ำจากทะเลยังไปไม่ถึง' :
        '<b class="fs-ok">สูงกว่าน้ำ ' + num(-dep, 2) + ' ม.</b>';
      var ho = data.hOld[k] - D;
      s += '<br><small>ข้อมูลเก่า (SRTM 2543) บอกว่าสูง ' + num(ho, 1) + ' ม.รทก.' + (ho - h0 > 0.5 ? ' — สูงเกินจริง ~' + num(ho - h0, 1) + ' ม. เพราะนับหลังคาตึก/ยอดไม้' : '') + '</small>';
    }
    return s + '</div>';
  }

  /* ================================================================ แผง */
  var CSS = [
    ".sl-big{font-size:24px;font-weight:800;line-height:1.1;font-variant-numeric:tabular-nums}.sl-big small{font-size:12px;font-weight:600;opacity:.65}",
    ".sl-eq{font-size:11px;opacity:.8;margin:3px 0 6px;line-height:1.45}",
    ".sl-yr{display:flex;justify-content:space-between;font-size:9.5px;opacity:.6;margin:-2px 0 6px}",
    "#slYear{width:100%;margin:8px 0 2px;accent-color:var(--accent)}",
    ".sl-lab{font-size:11px;opacity:.75;margin:6px 0 2px}",
    ".sl-mini{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0 4px}",
    ".sl-mini figure{margin:0;cursor:pointer;border-radius:8px;border:2px solid transparent;overflow:hidden;background:#e7e4dc}",
    ".sl-mini figure.on{border-color:var(--accent)}",
    ".sl-mini canvas{width:100%;height:auto;display:block}",
    ".sl-mini figcaption{font-size:10.5px;line-height:1.35;padding:4px 6px;background:var(--card-bg);color:var(--text-main)}",
    ".sl-mini figcaption b{font-size:12px}",
    ".sl-prov{display:grid;grid-template-columns:1fr auto auto;gap:1px 8px;font-size:11.5px;margin:4px 0}.sl-prov span:nth-child(3n+2),.sl-prov span:nth-child(3n){text-align:right;font-variant-numeric:tabular-nums}",
    ".sl-prov .h{opacity:.6;font-size:10px}",
    ".sl-busy{font-size:11px;opacity:.75;margin:4px 0}",
    ".sl-src{font-size:10px;opacity:.7;line-height:1.5;margin-top:6px}.sl-src a{color:inherit}"
  ].join("");
  function cssOnce() {
    if (document.getElementById("slCss")) return;
    var st = document.createElement("style"); st.id = "slCss"; st.textContent = CSS; document.head.appendChild(st);
  }
  function chip(attr, val, on, label, title) {
    return '<button type="button" class="fs-chip' + (on ? " on" : "") + '" ' + attr + '="' + val + '"' + (title ? ' title="' + title + '"' : "") + '>' + label + '</button>';
  }
  function renderPanel(el) {
    panelEl = el;
    if (!el) return;
    cssOnce();
    if (!data) {
      el.innerHTML = '<div class="fs-area">' + (loadErr ? '<span class="fs-bad">โหลดข้อมูลไม่สำเร็จ: ' + loadErr + '</span>' : "กำลังโหลดข้อมูลความสูงพื้นดินชายฝั่ง (~3 MB)…") + '</div>';
      return;
    }
    var Y = year(), d = data.meta.datum, h = "";
    h += '<div class="sl-big"><span id="slLevelNow">' + num(levelRtk(Y), 2) + '</span> <small id="slLevelLbl"></small></div>';
    h += '<div class="sl-eq" id="slEq"></div>';
    h += '<input type="range" id="slYear" min="0" max="' + (YEARS.length - 1) + '" step="1" value="' + cfg.yi + '" aria-label="ปี">' +
      '<div class="sl-yr">' + YEARS.map(function (y) { return "<span>" + (y === d.today ? "วันนี้" : y) + "</span>"; }).join("") + '</div>';
    h += '<div class="sl-lab">ฉากทัศน์โลกร้อน (IPCC AR6)</div><div class="fs-chips">' +
      SCEN.map(function (s) { return chip("data-sl-scen", s.id, cfg.scen === s.id, s.n, s.s); }).join("") + '</div>';
    if (cfg.scen !== "ssp585_low") h += '<label class="fs-opt"><input type="checkbox" data-slo="hi"' + (cfg.hi ? " checked" : "") + '> ใช้ค่าช่วงบน (มีโอกาส ~17% ที่จะสูงกว่านี้)</label>';
    h += '<div class="sl-lab">ระดับน้ำที่ใช้</div><div class="fs-chips">' +
      chip("data-sl-ref", "mhhw", cfg.ref === "mhhw", "น้ำขึ้นสูงเฉลี่ยรายวัน", "Mean Higher High Water แบบแผนที่ NYT/Climate Central") +
      chip("data-sl-ref", "annual", cfg.ref === "annual", "น้ำหนุนสูงสุดรายปี", "ระดับที่น้ำทะเลหนุนขึ้นถึงราวปีละครั้ง (ต.ค.–ม.ค.)") + '</div>';
    h += '<div class="sl-lab">แผ่นดินทรุด (อัตราจากดาวเทียม 2559–2566 ต่อเนื่องเท่าเดิม)</div><div class="fs-chips">' +
      SUBS.map(function (s) { return chip("data-sl-subs", s[0], cfg.subs === s[0], s[1]); }).join("") + '</div>';
    h += '<label class="fs-opt"><input type="checkbox" data-slo="rivers"' + (cfg.rivers ? " checked" : "") + '> น้ำทะเลเข้าทางแม่น้ำ/คลองได้ (ไม่มีกำแพงกั้นริมน้ำ)</label>';
    h += '<div class="fs-row"><button type="button" class="fs-btn" data-sl-a="play">' + ico(playing ? "pause" : "play") + (playing ? " หยุด" : " ดูน้ำขึ้นทีละทศวรรษ") + '</button>' +
      '<button type="button" class="fs-btn ghost" data-sl-a="home">' + ico("map") + ' ดูทั้งอ่าว</button></div>';
    h += '<div id="slLive"></div>';
    h += '<div class="fs-sec"><b class="fs-h">' + ico("layers") + ' ข้อมูลเก่า vs ใหม่ — ปี <span id="slCmpY">' + Y + '</span></b>' +
      '<div class="sl-mini"><figure data-sl-view="old" class="' + (cfg.view === "old" ? "on" : "") + '"><canvas id="slMiniOld" width="' + Math.round(data.W / MINI) + '" height="' + Math.round(data.H / MINI) + '"></canvas><figcaption id="slCapOld"></figcaption></figure>' +
      '<figure data-sl-view="new" class="' + (cfg.view === "new" ? "on" : "") + '"><canvas id="slMiniNew" width="' + Math.round(data.W / MINI) + '" height="' + Math.round(data.H / MINI) + '"></canvas><figcaption id="slCapNew"></figcaption></figure></div>' +
      '<p class="fs-note">สีฟ้าในภาพเล็ก = ทะเลและพื้นที่ต่ำกว่าน้ำขึ้นที่ทะเลไหลถึง (แบบรูปของ NYT) · กดรูปเพื่อเลือกข้อมูลที่แสดงบนแผนที่หลัก · ข้อมูลเก่าเป็นความสูง "ผิวบน" ที่นับหลังคาตึกและยอดไม้ จึงคิดว่าพื้นสูงกว่าจริงหลายเมตร</p></div>';
    h += '<div class="fs-sec" id="slPick"></div>';
    h += '<div class="fs-leg"><span><i style="background:rgb(' + COL.today + ')"></i>ต่ำกว่าน้ำขึ้นตั้งแต่วันนี้ (อยู่ได้เพราะคันกั้น/สูบน้ำ)</span><span><i style="background:rgb(' + COL.add + ')"></i>จมเพิ่มภายในปี <span id="slLegY">' + Y + '</span></span><span><i style="background:rgb(' + COL.pond + ');opacity:.6"></i>บ่อ/นาเกลือ/บึงที่น้ำทะเลถึง</span><span><i style="border:1.5px dashed #94a3b8;background:none"></i>ขอบเขตข้อมูล (นอกกรอบไม่ได้คำนวณ)</span></div>';
    h += '<div class="fs-warn"><b>แบบจำลองอย่างง่าย — ดูว่าที่ไหนต่ำกว่าระดับน้ำทะเลในอนาคต ไม่ใช่พยากรณ์น้ำท่วม</b> — ทุกช่องที่ต่ำกว่าระดับน้ำและมีทางน้ำเชื่อมจากทะเลถือว่าจม ' +
      '<b>ไม่คิดคันกั้นน้ำพระราชดำริ กำแพงริมเจ้าพระยา ประตูระบายน้ำ และสถานีสูบ</b> (เหมือนแผนที่ Climate Central) · ' +
      'ความสูงพื้นดินคลาดเคลื่อนเฉลี่ย ~0.4–0.7 ม. · ระดับน้ำขึ้นวันนี้ไม่แน่นอนราว ±0.3 ม. (ค่าแปลง EGM2008→รทก. ' + d.egm08_minus_rtk + ' ม. และสมมติว่า "ระดับทะเลปานกลาง" ของตารางน้ำกรมอุทกศาสตร์ = รทก.) · ' +
      'อัตราทรุดจากดาวเทียมสูงกว่าที่สถานี GNSS วัดได้ราว 0.1–0.4 ซม./ปี และสมมติให้คงที่ไปถึงปีที่เลือก</div>';
    h += '<div class="sl-src">ข้อมูล: <a href="https://doi.org/10.4121/21997565.v4" target="_blank" rel="noopener">DeltaDTM v1.1</a> (Pronk et al. 2024, CC BY 4.0; Copernicus WorldDEM-30 © DLR e.V. 2010–2014, © Airbus 2014–2018) · ' +
      'SRTM 2543 (NASA/USGS) · <a href="https://doi.org/10.5281/zenodo.5914709" target="_blank" rel="noopener">IPCC AR6 Sea Level Projections</a> สถานีเกาะสีชัง (Fox-Kemper et al. 2021; Kopp et al. 2023; Garner et al. 2021 — ขอบคุณ NASA Sea Level Change Team ผู้ทำ AR6 Sea Level Projection Tool) · ' +
      '<a href="https://doi.org/10.5281/zenodo.15015923" target="_blank" rel="noopener">แผ่นดินทรุด Ohenhen et al. 2026</a> (CC BY 4.0) · ตารางน้ำกรมอุทกศาสตร์ 2569 · ' +
      '<a href="https://coastal.climatecentral.org/map/10/100.55/13.65/?theme=sea_level_rise&map_type=year&forecast_year=2050" target="_blank" rel="noopener">เทียบกับ Climate Central ↗</a></div>';
    el.innerHTML = h;
    bindPanel(el);
    renderLive();
  }
  function renderLive() {
    var el = $("#slLive");
    if (!el || !data) return;
    var Y = year(), h = "", d = data.meta.datum;
    var set = function (id, v) { var x = $("#" + id); if (x) x.innerHTML = v; };
    if (surgeFrom == null) set("slLevelNow", num(levelRtk(Y), 2));
    set("slLevelLbl", "ม.รทก. · ระดับ" + (cfg.ref === "annual" ? "น้ำทะเลหนุนสูงสุดรายปี" : "น้ำขึ้นสูงเฉลี่ยรายวัน") + " ปี " + Y + " (พ.ศ. " + be(Y) + ")");
    set("slEq", "= " + (cfg.ref === "annual" ? "น้ำหนุนสูงสุดรายปีวันนี้ " : "น้ำขึ้นสูงเฉลี่ยวันนี้ ") + num(refRtk(), 2) + " + น้ำทะเลสูงขึ้น " + sgn(slrAt(Y) - slrAt(d.today)) + " ม." +
      (cfg.subs && Y > d.today ? " · และแผ่นดินทรุดลงอีกที่ละไม่เท่ากัน (กดจุดบนแผนที่เพื่อดู)" : ""));
    set("slCmpY", Y); set("slLegY", Y);
    var ys = $("#slYear"); if (ys && +ys.value !== cfg.yi && document.activeElement !== ys) ys.value = cfg.yi;
    if (busy || !res || res.key !== cfgKey()) h += '<div class="sl-busy">กำลังคำนวณว่าน้ำทะเลไหลไปถึงไหน…</div>';
    if (res) {
      var s = res.stats, ry = res.year, bkkId = 0;
      data.meta.provinces.forEach(function (p) { if (p.pcode === "TH10") bkkId = p.id; });
      var add = Math.max(0, s.newT - s.newT0);
      h += '<div class="fs-area">พื้นดินต่ำกว่าน้ำขึ้นที่ทะเลไหลถึง ปี ' + ry + ' <b>' + num(s.newT, 0) + ' ตร.กม.</b>' +
        '<br>· ตั้งแต่วันนี้ ' + num(s.newT0, 0) + ' ตร.กม. · จมเพิ่ม <b>' + num(add, 0) + ' ตร.กม.</b>' +
        (bkkId ? '<br>· ในกรุงเทพฯ ' + num(s.byProv[bkkId], 0) + ' ตร.กม. (' + num(s.byProv[bkkId] / s.provKm2[bkkId] * 100, 0) + '% ของพื้นดิน กทม.)' : '') +
        (s.lowDisc > 1 ? '<br><small>อีก ' + num(s.lowDisc, 0) + ' ตร.กม. ต่ำกว่าน้ำแต่มีที่สูงล้อมรอบ น้ำทะเลยังไปไม่ถึง</small>' : '') + '</div>';
      var rows = data.meta.provinces.map(function (p) { return [p, s.byProv[p.id], s.byProv0[p.id]]; })
        .filter(function (r) { return r[1] >= 1; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 6);
      if (rows.length) h += '<div class="sl-prov"><span class="h">จังหวัด</span><span class="h">วันนี้</span><span class="h">ปี ' + ry + '</span>' +
        rows.map(function (r) { return '<span>' + r[0].th + '</span><span>' + num(r[2], 0) + '</span><span><b>' + num(r[1], 0) + '</b></span>'; }).join("") + '</div><p class="fs-note" style="margin-top:0">ตร.กม. · เฉพาะส่วนที่อยู่ในกรอบข้อมูล</p>';
      var co = $("#slCapOld"), cn = $("#slCapNew");
      if (co) co.innerHTML = '<b>ข้อมูลเก่า</b> SRTM 2543<br>' + num(s.oldT, 0) + ' ตร.กม.';
      if (cn) cn.innerHTML = '<b>ข้อมูลใหม่</b> DeltaDTM<br>' + num(s.newT, 0) + ' ตร.กม.' + (s.oldT > 1 ? ' (×' + num(s.newT / s.oldT, 1) + ')' : '');
      drawMini();
    }
    el.innerHTML = h;
    var pk = $("#slPick"); if (pk) pk.innerHTML = pickHTML();
  }
  // ภาพเทียบแบบรูป NYT: บก = ครีม · ทะเลและที่จม = ฟ้าเดียวกัน · เส้นจังหวัด = เทา
  var miniKey = null;
  function drawMini() {
    if (!res) return;
    var key = res.key;
    var cvs = [[$("#slMiniOld"), res.oldT], [$("#slMiniNew"), res.newT]];
    if (!cvs[0][0] || (miniKey === key && cvs[0][0].dataset.k === key)) return;
    miniKey = key;
    var W = data.W, H = data.H, mw = Math.round(W / MINI), mh = Math.round(H / MINI), cls = data.cls, prov = data.prov, Wt = res.Wt;
    var bkk = 0; data.meta.provinces.forEach(function (p) { if (p.pcode === "TH10") bkk = p.id; });
    cvs.forEach(function (x) {
      var cv = x[0], R = x[1], g = cv.getContext("2d"), img = g.createImageData(mw, mh), px = img.data;
      for (var y = 0; y < mh; y++) for (var i = 0; i < mw; i++) {
        var k = Math.min(H - 1, y * MINI + 3) * W + Math.min(W - 1, i * MINI + 3), c = cls[k], o = (y * mw + i) * 4, col;
        if (c === 1 || c === 3 || (R.C[k] <= Wt)) col = [79, 134, 198];
        else if (c === 2) col = [170, 196, 222];
        else col = [233, 230, 222];
        // เส้นแบ่งจังหวัด (และขอบ กทม. เข้มกว่า)
        var kr = Math.min(H - 1, y * MINI + 3) * W + Math.min(W - 1, (i + 1) * MINI + 3), kd = Math.min(H - 1, (y + 1) * MINI + 3) * W + Math.min(W - 1, i * MINI + 3);
        if (c === 0 && ((cls[kr] === 0 && prov[kr] !== prov[k]) || (cls[kd] === 0 && prov[kd] !== prov[k]))) {
          var b = prov[k] === bkk || prov[kr] === bkk || prov[kd] === bkk;
          col = b ? [70, 70, 70] : [160, 156, 148];
        }
        px[o] = col[0]; px[o + 1] = col[1]; px[o + 2] = col[2]; px[o + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      // ป้าย "กรุงเทพฯ" ที่อนุสาวรีย์ประชาธิปไตยโดยประมาณ
      var bb = data.meta.bbox, lx = (100.50 - bb[0]) / (bb[2] - bb[0]) * mw, ly = (bb[3] - 13.756) / (bb[3] - bb[1]) * mh;
      g.font = "600 11px sans-serif"; g.fillStyle = "#333"; g.textAlign = "center";
      g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 3; g.strokeText("กรุงเทพฯ", lx, ly); g.fillText("กรุงเทพฯ", lx, ly);
      ly = (bb[3] - 13.25) / (bb[3] - bb[1]) * mh; lx = (100.55 - bb[0]) / (bb[2] - bb[0]) * mw;
      g.font = "italic 10px sans-serif"; g.fillStyle = "#e8f0fa"; g.fillText("อ่าวไทย", lx, ly);
      cv.dataset.k = key;
    });
  }
  function bindPanel(el) {
    if (el._slBound) return;
    el._slBound = true;
    el.addEventListener("click", function (e) {
      var t = e.target.closest("[data-sl-scen],[data-sl-ref],[data-sl-subs],[data-sl-a],[data-sl-view]");
      if (!t) return;
      if (t.dataset.slScen) { cfg.scen = t.dataset.slScen; lsSet("scen", cfg.scen); }
      else if (t.dataset.slRef) { cfg.ref = t.dataset.slRef; lsSet("ref", cfg.ref); }
      else if (t.dataset.slSubs != null) { cfg.subs = +t.dataset.slSubs; lsSet("subs", String(cfg.subs)); }
      else if (t.dataset.slView) { cfg.view = t.dataset.slView; lsSet("view", cfg.view); }
      else if (t.dataset.slA === "home") { if (map) map.flyTo(Object.assign({ duration: 2200 }, HOME)); return; }
      else if (t.dataset.slA === "play") { setPlaying(!playing); return; }
      changed();
    });
    el.addEventListener("input", function (e) {
      if (e.target.id === "slYear") { setPlaying(false); cfg.yi = +e.target.value; lsSet("yi", String(cfg.yi)); changed(true); }
    });
    el.addEventListener("change", function (e) {
      var o = e.target.dataset && e.target.dataset.slo;
      if (o === "hi") { cfg.hi = e.target.checked; lsSet("hi", cfg.hi ? "1" : "0"); changed(); }
      if (o === "rivers") { cfg.rivers = e.target.checked; lsSet("rivers", cfg.rivers ? "1" : "0"); changed(); }
    });
  }
  function changed(soft) {
    compute();
    // ลากแถบปี / เล่นไทม์ไลน์: อัปเดตเฉพาะส่วนที่เปลี่ยน (วาดแผงใหม่ทั้งหมดจะทำให้แถบเลื่อนหลุดมือ)
    if (soft || !panelEl) renderLive(); else renderPanel(panelEl);
    if (S && S.H) { S.H.setAnim("floodsim", true); S.H.repaint(); }
  }
  function setPlaying(on) {
    playing = !!on;
    clearTimeout(playTimer);
    if (playing) {
      if (cfg.yi >= YEARS.length - 1) cfg.yi = 0;
      var step = function () {
        if (!playing) return;
        if (busy || !res || res.key !== cfgKey()) { playTimer = setTimeout(step, 150); return; }
        if (cfg.yi >= YEARS.length - 1) { setPlaying(false); return; }
        cfg.yi++; lsSet("yi", String(cfg.yi));
        changed(true);
        playTimer = setTimeout(step, 1100);
      };
      changed(true);
      playTimer = setTimeout(step, 700);
    }
    var pb = $("[data-sl-a=play]");
    if (pb) pb.innerHTML = ico(playing ? "pause" : "play") + (playing ? " หยุด" : " ดูน้ำขึ้นทีละทศวรรษ");
  }

  /* ================================================================ เปิด/ปิดโหมด */
  function attach3D(shared) {
    S = shared;
    if (res && !mesh) buildTexture();
  }
  function activate(fly) {
    active = true;
    cssOnce();
    setOverlayVis();
    return load().then(function () {
      if (!active) return;
      if (fly && map) map.flyTo(Object.assign({ duration: 2200 }, HOME));
      setOverlayVis();
      compute();
      if (panelEl) renderPanel(panelEl);
    });
  }
  function deactivate() {
    active = false;
    setPlaying(false);
    if (mesh) mesh.visible = false;
    setOverlayVis();
  }
  function mount(m) {
    map = m;
    var v;
    v = parseInt(lsGet("yi"), 10); if (v >= 0 && v < YEARS.length) cfg.yi = v;
    v = lsGet("scen"); if (SCEN.some(function (s) { return s.id === v; })) cfg.scen = v;
    v = lsGet("subs"); if (SUBS.some(function (s) { return String(s[0]) === v; })) cfg.subs = +v;
    v = lsGet("ref"); if (v === "mhhw" || v === "annual") cfg.ref = v;
    v = lsGet("view"); if (v === "new" || v === "old") cfg.view = v;
    cfg.hi = lsGet("hi") === "1";
    cfg.rivers = lsGet("rivers") !== "0";
    // สไตล์แผนที่โหลดใหม่ (สลับธีม) → ชั้นภาพหายไปกับสไตล์เก่า วาดกลับ
    ovKey = null;
    if (res && active) drawOverlay();
  }

  window.BKK_SEALEVEL = {
    mount: mount, attach3D: attach3D, activate: activate, deactivate: deactivate,
    frame: frame, renderPanel: renderPanel, click: click, applyStyle: applyStyle,
    moving: function () { return playing || surgeFrom != null || (res && shownLevel !== res.Wt); },
    surge: function () { if (!res) return; surgeFrom = res.W0; shownLevel = res.W0; if (S && S.H) { S.H.setAnim("floodsim", true); S.H.repaint(); } },
    home: HOME,
    debug: function () {
      return { active: active, loaded: !!data, err: loadErr, busy: busy, cfg: cfg, key: res && res.key, Wt: res && res.Wt, W0: res && res.W0, shownLevel: shownLevel,
        stats: res && { newT: res.stats.newT, newT0: res.stats.newT0, oldT: res.stats.oldT, lowDisc: res.stats.lowDisc }, mesh: !!mesh, meshVisible: mesh && mesh.visible, overlay: !!(map && map.getLayer(LAYER_ID)) };
    },
    _data: function () { return data; }, _res: function () { return res; }
  };
})();
