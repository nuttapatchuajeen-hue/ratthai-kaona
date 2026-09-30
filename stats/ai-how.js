/* =====================================================================
   หมวด "หลักการทำงาน AI" (stats/explore.html) — เอนจินกลาง + หัวข้อ 1–2
   ---------------------------------------------------------------------
   window.AIH           : ตัวกลางของทั้งหมวด (ai-how-2.js / ai-how-3.js มาลงทะเบียนเพิ่ม)
   window.AIH_DATA      : ข้อมูลจริงจาก ai-how-data.js (ต้องโหลดก่อนไฟล์นี้)
   หน้าเว็บเรียก AIH.renderAll() ทุกครั้งที่สลับหมวด / เปลี่ยนธีม / ย่อขยายจอ
   → สร้างแผงครั้งแรกเมื่อเปิด · วาดใหม่เมื่อธีมหรือความกว้างเปลี่ยน · หยุดอนิเมชันเมื่อแผงถูกปิด
   ภาพโครงข่ายใช้ "เวที" พื้นมืดเสมอ (เหมือนคลิป 3Blue1Brown) ส่วนกราฟอื่นเปลี่ยนสีตามธีม
   ===================================================================== */
(function(){
  "use strict";
  var AIH = window.AIH = window.AIH || {};
  AIH.panes = AIH.panes || {};
  var DATA = window.AIH_DATA;

  /* ---------------- ตัวช่วยทั่วไป ---------------- */
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function h(tag, cls, html){ var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function cssVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function isDark(){ return document.documentElement.getAttribute("data-theme") === "dark"; }
  function pal(){
    var d = isDark();
    return { dark:d, ink:cssVar("--ink"), ink2:cssVar("--ink-2"), soft:cssVar("--ink-soft"), rule:cssVar("--rule"),
      paper:cssVar("--paper"), paper2:cssVar("--paper-2"), paper3:cssVar("--paper-3"),
      green:cssVar("--green"), red:cssVar("--red"), gold:cssVar("--gold"),
      pos: d ? [77,168,255] : [31,111,209], neg: d ? [255,112,67] : [217,72,15],
      base: d ? [7,13,20] : [248,251,253],
      font:"'IBM Plex Sans Thai', system-ui, sans-serif" };
  }
  /* สีของ "เวที" พื้นมืดคงที่ */
  var ST = { bg:"#05090E", ink:"#E8F0F6", soft:"rgba(232,240,246,.55)", faint:"rgba(232,240,246,.18)", pos:[77,168,255], neg:[255,112,67], gold:"#FFC94A" };
  function rgba(c, a){ return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (+a).toFixed(3) + ")"; }
  function mix(a, b, t){ return [Math.round(a[0] + (b[0]-a[0])*t), Math.round(a[1] + (b[1]-a[1])*t), Math.round(a[2] + (b[2]-a[2])*t)]; }
  /* สีไล่ 2 ขั้ว: v ∈ [-1,1] → ลบ(ส้ม) ← พื้น → บวก(ฟ้า) */
  function divColor(v, P, base){ var b = base || P.base; v = Math.max(-1, Math.min(1, v)); return v >= 0 ? mix(b, P.pos, v) : mix(b, P.neg, -v); }
  function b64bytes(s){ var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function f32(s){ return new Float32Array(b64bytes(s).buffer); }
  function pct(p, dg){ if (dg == null) dg = p < 0.001 ? 2 : 1; return (p*100).toFixed(dg) + "%"; }
  function fmt(n){ return Number(n).toLocaleString("en-US"); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]; }); }
  /* แสดงโทเคนให้เห็นช่องว่าง/ขึ้นบรรทัด */
  function tokHtml(t){ return esc(t).replace(/^ /, '<i class="aih-sp">·</i>').replace(/\n/g, '<i class="aih-sp">↵</i>'); }
  function canvasFit(cv, w, hgt){
    var d = Math.min(2, window.devicePixelRatio || 1), W = Math.max(1, Math.round(w*d)), H = Math.max(1, Math.round(hgt*d));
    if (cv.width !== W || cv.height !== H){ cv.width = W; cv.height = H; }
    cv.style.width = w + "px"; cv.style.height = hgt + "px";
    var g = cv.getContext("2d"); g.setTransform(d, 0, 0, d, 0, 0); return g;
  }
  function tipOf(mount){
    var t = mount.querySelector(":scope > .aih-tip");
    if (!t){ t = h("div", "aih-tip"); mount.appendChild(t); }
    return {
      show: function(html, x, y){
        t.innerHTML = html; t.style.display = "block";
        var mw = mount.clientWidth, tw = t.offsetWidth;
        var lx = x + 14; if (lx + tw > mw - 4) lx = Math.max(4, x - tw - 14);
        t.style.left = lx + "px"; t.style.top = Math.max(4, y - 10) + "px";
      },
      hide: function(){ t.style.display = "none"; }
    };
  }
  function relXY(e, el, ref){ var r = el.getBoundingClientRect(), rr = (ref || el).getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, rx: e.clientX - rr.left, ry: e.clientY - rr.top }; }
  function paneOn(id){ var p = document.getElementById("pane-" + id); return !!(p && p.classList.contains("active")); }
  /* ตัวจับเวลาที่เดินต่อแม้ rAF ไม่ยิง (แท็บพื้นหลัง/พรีวิว) */
  function tickLoop(fn, ms){
    var alive = true, id = 0;
    function go(){ if (!alive) return; if (fn() === false){ alive = false; return; } id = setTimeout(go, ms || 16); }
    id = setTimeout(go, 0);
    return { stop: function(){ alive = false; clearTimeout(id); }, get alive(){ return alive; } };
  }
  function plotStyle(P){ return { fontFamily: P.font, fontSize: "12px", color: P.ink, background: "transparent", overflow: "visible" }; }

  AIH.util = { $:$, $$:$$, h:h, pal:pal, ST:ST, rgba:rgba, mix:mix, divColor:divColor, b64bytes:b64bytes, f32:f32, pct:pct, fmt:fmt, esc:esc,
               tokHtml:tokHtml, canvasFit:canvasFit, tipOf:tipOf, relXY:relXY, paneOn:paneOn, tickLoop:tickLoop, plotStyle:plotStyle };
  AIH.register = function(id, obj){ AIH.panes[id] = obj; };

  /* ---------------- วาดเมื่อจำเป็นเท่านั้น ----------------
     explore.html เรียก renderAll ซ้ำ 2 ครั้งต่อการสลับหมวด (rAF + setTimeout) และทุกครั้งที่ย่อจอ/สลับธีม
     จึงเทียบ "ลายเซ็น" (ธีม + ความกว้างแผง) ถ้าเหมือนเดิมไม่ต้องวาดใหม่ */
  AIH.renderAll = function(){
    injectCss();
    Object.keys(AIH.panes).forEach(function(id){
      var p = AIH.panes[id], pane = document.getElementById("pane-" + id);
      if (!pane) return;
      var on = pane.classList.contains("active");
      try {
        if (on){
          var sig = (isDark() ? "d" : "l") + ":" + pane.clientWidth;
          if (!p._built){ p._built = true; p.build(); p._sig = null; }
          if (p._sig !== sig){ p._sig = sig; if (p.draw) p.draw(); }
        } else if (p._built && p.pause){ p.pause(); }
      } catch (e){ if (window.console) console.error("[AIH] " + id, e); }
    });
  };

  /* ---------------- CSS ของทั้งหมวด (ฉีดครั้งเดียว) ---------------- */
  function injectCss(){
    if (document.getElementById("aih-css")) return;
    var css = [
      ":root{--aih-pos:#1F6FD1;--aih-neg:#D9480F}",
      "html[data-theme=\"dark\"]{--aih-pos:#4DA8FF;--aih-neg:#FF7043}",
      ".aih-lead{font-size:14.5px;line-height:1.8;color:var(--ink-2);max-width:118ch;margin:0 0 18px}",
      ".aih-lead a{color:var(--green);font-weight:700}",
      ".tabpane[id^=\"pane-ai-\"] code{font-family:ui-monospace,Consolas,monospace;font-size:.92em;background:var(--paper-3);border:1px solid var(--rule);border-radius:6px;padding:1px 6px}",
      ".aih-route{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 16px}",
      ".aih-route a{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:var(--ink-2);text-decoration:none;background:var(--paper-2);border:1px solid var(--rule);border-radius:999px;padding:4px 12px 4px 4px;transition:border-color .15s,color .15s}",
      ".aih-route a b{display:inline-grid;place-items:center;min-width:21px;height:21px;border-radius:50%;background:var(--green);color:var(--paper);font-size:11px;font-family:Archivo,sans-serif}",
      ".aih-route a:hover{border-color:var(--green);color:var(--green)}",
      ".aih-mount{position:relative;min-height:40px}",
      ".aih-ctl{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 12px}",
      ".aih-ctl .lab{font-size:12.5px;font-weight:700;color:var(--ink-soft)}",
      ".aih-chip{font:inherit;font-size:12.5px;font-weight:700;padding:5px 12px;border-radius:999px;border:1px solid var(--rule);background:var(--paper-3);color:var(--ink-2);cursor:pointer;transition:all .15s}",
      ".aih-chip:hover{border-color:var(--green);color:var(--green)}",
      ".aih-chip.on{background:var(--green);color:var(--paper);border-color:var(--green)}",
      ".aih-tip{position:absolute;z-index:6;pointer-events:none;background:var(--paper-2);border:1px solid var(--rule-strong);border-radius:9px;padding:7px 10px;font-size:12.5px;line-height:1.5;color:var(--ink);box-shadow:var(--shadow);max-width:320px;display:none}",
      ".aih-stage{background:#05090E;border:1px solid rgba(120,160,190,.18);border-radius:14px;position:relative;overflow:hidden}",
      ".aih-stage canvas{display:block}",
      ".aih-sp{font-style:normal;opacity:.45}",
      ".aih-range{display:flex;align-items:center;gap:10px;font-size:12.5px;font-weight:700;color:var(--ink-2)}",
      ".aih-range input{accent-color:var(--green);width:150px}",
      ".aih-range output{font-family:Archivo,sans-serif;min-width:44px;color:var(--ink)}",
      ".aih-note{font-size:12.5px;color:var(--ink-soft);line-height:1.6}",
      ".aih-sel{font-weight:700;color:var(--ink-2)}",
      /* หัวข้อ 1 */
      ".aih-nn{display:grid;grid-template-columns:250px 1fr;gap:18px;align-items:start}",
      ".aih-pad-wrap{position:relative;width:250px;height:250px;border-radius:14px;overflow:hidden;border:1px solid rgba(120,160,190,.25);background:#000;touch-action:none;cursor:crosshair}",
      ".aih-pad{width:250px;height:250px;display:block}",
      ".aih-pad-hint{position:absolute;inset:0;display:grid;place-items:center;color:rgba(255,255,255,.35);font-size:14px;pointer-events:none}",
      ".aih-seen{display:flex;align-items:center;gap:10px;margin-top:10px;font-size:12px;color:var(--ink-soft)}",
      ".aih-seen canvas{width:56px;height:56px;image-rendering:pixelated;border-radius:6px;border:1px solid var(--rule)}",
      ".aih-thumbs{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:10px}",
      ".aih-thumbs canvas{width:100%;aspect-ratio:1;image-rendering:pixelated;border-radius:5px;border:1px solid var(--rule);cursor:pointer;background:#000}",
      ".aih-thumbs canvas:hover{outline:2px solid var(--green)}",
      ".aih-guess{margin-top:10px;font-size:13px;color:var(--ink-2)}",
      ".aih-guess b{font-family:Archivo,sans-serif;font-size:28px;color:var(--red);margin:0 4px}",
      ".aih-wgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}",
      ".aih-wcell{border:1px solid var(--rule);border-radius:8px;padding:5px;cursor:pointer;background:var(--paper-3);text-align:center;font-size:11.5px;color:var(--ink-soft);transition:border-color .15s}",
      ".aih-wcell canvas{width:100%;aspect-ratio:1;image-rendering:pixelated;display:block;border-radius:4px}",
      ".aih-wcell.on{border-color:var(--gold);box-shadow:0 0 0 2px var(--gold) inset}",
      ".aih-wcell b{color:var(--ink)}",
      ".aih-one{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
      ".aih-one figure{margin:0;text-align:center;font-size:11.5px;color:var(--ink-soft)}",
      ".aih-one canvas{width:104px;height:104px;image-rendering:pixelated;border-radius:8px;border:1px solid var(--rule);display:block;margin-bottom:4px}",
      ".aih-one .op{font-size:22px;font-weight:800;color:var(--ink-soft)}",
      ".aih-eq{margin-top:12px;font-size:13.5px;line-height:1.9;color:var(--ink-2)}",
      ".aih-eq b{font-family:Archivo,sans-serif;color:var(--ink)}",
      ".aih-eq .big{font-size:20px;color:var(--red)}",
      /* หัวข้อ 2 */
      ".aih-pg{display:grid;grid-template-columns:minmax(220px,300px) 1fr minmax(200px,260px);gap:14px;align-items:start}",
      ".aih-pg .aih-stage{padding:0}",
      ".aih-stat{font-size:12.5px;color:var(--ink-2);line-height:1.8}",
      ".aih-stat b{font-family:Archivo,sans-serif;font-size:18px;color:var(--ink)}",
      ".aih-watch{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}",
      ".aih-wc{border:1px solid var(--rule);border-radius:9px;padding:6px;text-align:center;background:var(--paper-3)}",
      ".aih-wc canvas{width:100%;aspect-ratio:1;image-rendering:pixelated;border-radius:5px;display:block;background:#000}",
      ".aih-wc .g{font-family:Archivo,sans-serif;font-weight:800;font-size:20px;line-height:1.2}",
      ".aih-wc .c{font-size:11px;color:var(--ink-soft)}",
      ".aih-wc.ok .g{color:var(--green)} .aih-wc.bad .g{color:var(--red)}",
      ".aih-wc.bad{border-color:var(--red)}",
      "@media (max-width:1100px){.aih-pg{grid-template-columns:1fr 1fr}.aih-pg>.aih-pg-net{grid-column:1/-1;order:3}}",
      "@media (max-width:900px){.tabpane[id^=\"pane-ai-\"] .grid2,.tabpane[id^=\"pane-ai-\"] .grid2.equal{grid-template-columns:1fr}}",
      "@media (max-width:760px){.aih-nn{grid-template-columns:1fr}.aih-pad-wrap,.aih-pad{margin:0 auto}.aih-pg{grid-template-columns:1fr}.aih-watch{grid-template-columns:repeat(4,1fr)}.aih-wgrid{grid-template-columns:repeat(4,1fr)}}"
    ].join("\n") + (AIH.cssMore || []).join("\n");
    var st = document.createElement("style"); st.id = "aih-css"; st.textContent = css; document.head.appendChild(st);
  }

  /* =====================================================================
     หัวข้อ 1 — นิวรอนเทียม & โครงข่ายประสาท (MNIST 784→16→16→10 ที่ฝึกจริง)
     ===================================================================== */
  var MN = null;
  function mnist(){
    if (MN) return MN;
    var d = DATA.mnist;
    MN = { W: d.W.map(f32), B: d.B.map(f32), log: d.log, watch: d.watch, watchIdx: d.watchIdx, acc: d.testAcc,
           samples: d.samples.map(function(s){ var u = b64bytes(s.px), x = new Float32Array(784); for (var i = 0; i < 784; i++) x[i] = u[i]/255; return { y: s.y, x: x }; }) };
    return MN;
  }
  function mnistForward(x){
    var W = MN.W, B = MN.B, a1 = new Float32Array(16), a2 = new Float32Array(16), p = new Float32Array(10), j, i, s;
    for (j = 0; j < 16; j++){ s = B[0][j]; for (i = 0; i < 784; i++) if (x[i]) s += x[i]*W[0][i*16 + j]; a1[j] = s > 0 ? s : 0; }
    for (j = 0; j < 16; j++){ s = B[1][j]; for (i = 0; i < 16; i++) s += a1[i]*W[1][i*16 + j]; a2[j] = s > 0 ? s : 0; }
    var mx = -1e9; for (j = 0; j < 10; j++){ s = B[2][j]; for (i = 0; i < 16; i++) s += a2[i]*W[2][i*10 + j]; p[j] = s; if (s > mx) mx = s; }
    var z = 0; for (j = 0; j < 10; j++){ p[j] = Math.exp(p[j] - mx); z += p[j]; } for (j = 0; j < 10; j++) p[j] /= z;
    return { a1: a1, a2: a2, p: p };
  }
  AIH.mnist = mnist; AIH.mnistForward = mnistForward;
  /* วาดภาพ 28×28 (ค่า 0..1) ลง canvas ขนาด 28×28 */
  function paintDigit(cv, x){
    cv.width = 28; cv.height = 28;
    var g = cv.getContext("2d"), im = g.createImageData(28, 28);
    for (var i = 0; i < 784; i++){ var v = Math.round(x[i]*255); im.data[i*4] = im.data[i*4+1] = im.data[i*4+2] = v; im.data[i*4+3] = 255; }
    g.putImageData(im, 0, 0);
  }
  AIH.paintDigit = paintDigit;
  /* วาดแผนที่ค่าบวก/ลบ 28×28 ลง canvas */
  function paintDiverging(cv, vals, P, scale){
    cv.width = 28; cv.height = 28;
    var g = cv.getContext("2d"), im = g.createImageData(28, 28), m = scale || 0;
    if (!m) for (var k = 0; k < 784; k++) m = Math.max(m, Math.abs(vals[k]));
    m = m || 1;
    for (var i = 0; i < 784; i++){ var c = divColor(vals[i]/m, P); im.data[i*4] = c[0]; im.data[i*4+1] = c[1]; im.data[i*4+2] = c[2]; im.data[i*4+3] = 255; }
    g.putImageData(im, 0, 0);
  }

  var nn = { x: new Float32Array(784), out: null, sel: -1, hits: [], drawing: false, last: null, lastT: 0, label: "ภาพว่าง" };

  /* ภาพที่วาดด้วยเมาส์ → 784 ค่า แบบเดียวกับที่ MNIST เตรียมภาพ:
     ครอบกรอบตัวเลข ย่อให้ด้านยาวเหลือ 20 จุด วางกลางช่อง 28×28 แล้วเลื่อนให้จุดศูนย์ถ่วงอยู่กลาง */
  function padToX(pad){
    var W = pad.width, g = pad.getContext("2d"), d = g.getImageData(0, 0, W, W).data;
    var minx = W, miny = W, maxx = -1, maxy = -1;
    for (var y = 0; y < W; y++) for (var x = 0; x < W; x++){ if (d[(y*W + x)*4] > 40){ if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; } }
    var out = new Float32Array(784);
    if (maxx < 0) return out;
    var bw = maxx - minx + 1, bh = maxy - miny + 1, s = 20/Math.max(bw, bh);
    var t = document.createElement("canvas"); t.width = t.height = 28;
    var tg = t.getContext("2d"); tg.fillStyle = "#000"; tg.fillRect(0, 0, 28, 28);
    tg.imageSmoothingEnabled = true; if ("imageSmoothingQuality" in tg) tg.imageSmoothingQuality = "high";
    var dw = bw*s, dh = bh*s; tg.drawImage(pad, minx, miny, bw, bh, (28 - dw)/2, (28 - dh)/2, dw, dh);
    var px = tg.getImageData(0, 0, 28, 28).data, raw = new Float32Array(784), sm = 0, sx = 0, sy = 0;
    for (var i = 0; i < 784; i++){ var v = px[i*4]/255; raw[i] = v; sm += v; sx += v*(i % 28); sy += v*Math.floor(i/28); }
    var dx = Math.round(13.5 - sx/sm), dy = Math.round(13.5 - sy/sm);
    for (var yy = 0; yy < 28; yy++) for (var xx = 0; xx < 28; xx++){
      var ox = xx - dx, oy = yy - dy;
      if (ox >= 0 && ox < 28 && oy >= 0 && oy < 28) out[yy*28 + xx] = Math.min(1, raw[oy*28 + ox]*1.15);
    }
    return out;
  }

  function nnBuild(){
    mnist();
    var P = pal();
    var m = $("#aihNeural"); if (!m) return;
    m.innerHTML =
      '<div class="aih-nn">' +
        '<div>' +
          '<div class="aih-pad-wrap"><canvas class="aih-pad" width="280" height="280"></canvas><div class="aih-pad-hint">✎ วาดเลข 0–9 ตรงนี้</div></div>' +
          '<div class="aih-ctl" style="margin-top:10px"><button type="button" class="tl-btn" data-a="clear">ล้าง</button><button type="button" class="tl-btn" data-a="rand">สุ่มภาพจริง</button></div>' +
          '<div class="aih-seen"><canvas class="aih-in28"></canvas><span>สิ่งที่โครงข่าย "เห็น"<br>ย่อเหลือ 28×28 = 784 ค่า<br><span class="aih-src-lab"></span></span></div>' +
          '<div class="aih-guess">โครงข่ายทายว่า <b class="aih-guess-d">–</b> <span class="aih-guess-p"></span></div>' +
          '<div class="aih-note" style="margin-top:8px">ตัวอย่างจากชุดทดสอบ (โครงข่ายไม่เคยเห็นตอนฝึก):</div>' +
          '<div class="aih-thumbs"></div>' +
        '</div>' +
        '<div class="aih-stage"><canvas class="aih-nn-cv"></canvas></div>' +
      '</div>';
    var pad = $(".aih-pad", m), pg = pad.getContext("2d");
    pg.fillStyle = "#000"; pg.fillRect(0, 0, 280, 280);
    var hint = $(".aih-pad-hint", m);
    function stroke(e){
      var r = pad.getBoundingClientRect(), x = (e.clientX - r.left)*280/r.width, y = (e.clientY - r.top)*280/r.height;
      pg.strokeStyle = "#fff"; pg.lineWidth = 21; pg.lineCap = "round"; pg.lineJoin = "round";
      pg.beginPath(); if (nn.last) pg.moveTo(nn.last.x, nn.last.y); else pg.moveTo(x - 0.1, y); pg.lineTo(x, y); pg.stroke();
      nn.last = { x: x, y: y };
      var now = Date.now(); if (now - nn.lastT > 40){ nn.lastT = now; nnSetInput(padToX(pad), "ลายมือของคุณ"); }
    }
    pad.addEventListener("pointerdown", function(e){ nn.drawing = true; nn.last = null; hint.style.display = "none"; try { pad.setPointerCapture(e.pointerId); } catch (_){} stroke(e); e.preventDefault(); });
    pad.addEventListener("pointermove", function(e){ if (nn.drawing) stroke(e); });
    function up(){ if (!nn.drawing) return; nn.drawing = false; nn.last = null; nnSetInput(padToX(pad), "ลายมือของคุณ"); }
    pad.addEventListener("pointerup", up); pad.addEventListener("pointercancel", up); pad.addEventListener("pointerleave", up);
    m.querySelector('[data-a="clear"]').addEventListener("click", function(){ pg.fillStyle = "#000"; pg.fillRect(0, 0, 280, 280); hint.style.display = ""; nnSetInput(new Float32Array(784), "ภาพว่าง"); });
    m.querySelector('[data-a="rand"]').addEventListener("click", function(){ var k = Math.floor(Math.random()*MN.samples.length); nnLoadSample(k); });
    function nnLoadSample(k){
      var s = MN.samples[k];
      pg.fillStyle = "#000"; pg.fillRect(0, 0, 280, 280); hint.style.display = "none";
      var t = document.createElement("canvas"); paintDigit(t, s.x); pg.imageSmoothingEnabled = false; pg.drawImage(t, 0, 0, 280, 280); pg.imageSmoothingEnabled = true;
      nnSetInput(Float32Array.from(s.x), "ภาพทดสอบจริง (เฉลย: " + s.y + ")");
    }
    var th = $(".aih-thumbs", m);
    for (var d = 0; d < 10; d++){
      var k = MN.samples.findIndex(function(s){ return s.y === d; });
      var cv = document.createElement("canvas"); paintDigit(cv, MN.samples[k].x); cv.title = "ภาพทดสอบเลข " + d;
      (function(kk){ cv.addEventListener("click", function(){ nnLoadSample(kk); }); })(k);
      th.appendChild(cv);
    }
    var cvN = $(".aih-nn-cv", m), tip = tipOf($(".aih-stage", m));
    cvN.addEventListener("mousemove", function(e){
      var p = relXY(e, cvN), hit = null;
      nn.hits.forEach(function(c){ if ((p.x - c.x)*(p.x - c.x) + (p.y - c.y)*(p.y - c.y) <= (c.r + 4)*(c.r + 4)) hit = c; });
      if (hit){ tip.show(hit.tip, p.x, p.y); cvN.style.cursor = hit.layer === 1 ? "pointer" : "default"; }
      else { tip.hide(); cvN.style.cursor = "default"; }
    });
    cvN.addEventListener("mouseleave", function(){ tip.hide(); });
    cvN.addEventListener("click", function(e){
      var p = relXY(e, cvN);
      nn.hits.forEach(function(c){ if (c.layer === 1 && (p.x - c.x)*(p.x - c.x) + (p.y - c.y)*(p.y - c.y) <= (c.r + 4)*(c.r + 4)) nnSelect(c.idx); });
    });
    // การ์ดน้ำหนัก 16 ช่อง
    var wm = $("#aihNeuralW");
    if (wm){
      wm.innerHTML = '<div class="aih-wgrid"></div>';
      var grid = $(".aih-wgrid", wm);
      for (var j = 0; j < 16; j++){
        var cell = h("div", "aih-wcell", '<canvas></canvas>นิวรอน <b>#' + (j + 1) + '</b> · a=<span class="v">0</span>');
        (function(jj){ cell.addEventListener("click", function(){ nnSelect(jj); }); })(j);
        grid.appendChild(cell);
      }
    }
    var om = $("#aihNeuralOne");
    if (om) om.innerHTML =
      '<div class="aih-one">' +
        '<figure><canvas class="c-in"></canvas>ภาพที่ป้อน</figure><span class="op">×</span>' +
        '<figure><canvas class="c-w"></canvas>น้ำหนักนิวรอน <b class="c-name"></b></figure><span class="op">=</span>' +
        '<figure><canvas class="c-p"></canvas>คะแนนรายจุด</figure>' +
      '</div><div class="aih-eq"></div>';
    nnLoadSample(MN.samples.findIndex(function(s){ return s.y === 3; }));
  }
  function nnSetInput(x, label){
    nn.x = x; nn.label = label; nn.out = mnistForward(x);
    if (nn.sel < 0 || nn.autoSel){ var b = 0; for (var j = 1; j < 16; j++) if (nn.out.a1[j] > nn.out.a1[b]) b = j; nn.sel = b; nn.autoSel = true; }
    nnDrawAll();
  }
  function nnSelect(j){ nn.sel = j; nn.autoSel = false; nnDrawAll(); }
  function nnDrawAll(){ nnDrawSide(); nnDrawNet(); nnDrawW(); nnDrawOne(); }
  function nnDrawSide(){
    var m = $("#aihNeural"); if (!m || !nn.out) return;
    var c = $(".aih-in28", m); paintDigit(c, nn.x);
    $(".aih-src-lab", m).textContent = nn.label;
    var p = nn.out.p, b = 0; for (var j = 1; j < 10; j++) if (p[j] > p[b]) b = j;
    var empty = !nn.x.some(function(v){ return v > 0; });
    $(".aih-guess-d", m).textContent = empty ? "–" : b;
    $(".aih-guess-p", m).textContent = empty ? "(ยังไม่มีภาพ)" : "มั่นใจ " + pct(p[b]);
  }
  function nnDrawNet(){
    var m = $("#aihNeural"); if (!m || !nn.out) return;
    var stage = $(".aih-stage", m), cv = $(".aih-nn-cv", m);
    var W = Math.max(320, stage.clientWidth), H = Math.round(Math.max(360, Math.min(520, W*0.6)));
    var g = canvasFit(cv, W, H);
    g.fillStyle = ST.bg; g.fillRect(0, 0, W, H);
    var o = nn.out, x = nn.x, Wt = MN.W;
    var top = 46, bot = H - 22;
    var narrow = W < 620;
    var S = Math.min(150, H*0.4, W*0.2), ix = Math.max(10, W*0.03), iy = (top + bot)/2 - S/2;
    var R = narrow ? Math.max(78, W*0.24) : Math.min(210, W*0.26);        // พื้นที่ขวาสำหรับป้ายเลข + แท่ง
    var xO = W - R, xH1 = ix + S + (xO - ix - S)*0.36, xH2 = ix + S + (xO - ix - S)*0.72;
    var ny = function(n, k){ return top + (k + 0.5)*(bot - top)/n; };
    var r = Math.max(5, Math.min(11, (bot - top)/16*0.34));
    g.font = "600 " + (narrow ? 11 : 12) + "px " + pal().font; g.textAlign = "center"; g.fillStyle = ST.soft;
    g.fillText(narrow ? "784 จุด" : "ภาพ 28×28 = 784 ค่า", ix + S/2, top - 22);
    g.fillText(narrow ? "ชั้น 1" : "ชั้นซ่อน 1 · 16 นิวรอน", xH1, top - 22);
    g.fillText(narrow ? "ชั้น 2" : "ชั้นซ่อน 2 · 16 นิวรอน", xH2, top - 22);
    g.fillText(narrow ? "ผลลัพธ์" : "ผลลัพธ์ · 10 ตัวเลข", xO + (narrow ? 12 : 28), top - 22);
    // ภาพขาเข้า
    var t = document.createElement("canvas"); paintDigit(t, x);
    g.imageSmoothingEnabled = false; g.drawImage(t, ix, iy, S, S); g.imageSmoothingEnabled = true;
    g.strokeStyle = ST.faint; g.lineWidth = 1; g.strokeRect(ix + 0.5, iy + 0.5, S - 1, S - 1);
    g.globalCompositeOperation = "lighter";
    // เส้น: ภาพ → ชั้นซ่อน 1 (เฉพาะจุดที่มีหมึก · ความสว่าง = ค่าจุด × น้ำหนัก)
    var mc = 1e-9, i, j, c;
    for (i = 0; i < 784; i++) if (x[i] > 0.1) for (j = 0; j < 16; j++){ c = Math.abs(x[i]*Wt[0][i*16 + j]); if (c > mc) mc = c; }
    g.lineWidth = 0.6;
    for (i = 0; i < 784; i++){
      if (x[i] <= 0.1) continue;
      var px = ix + ((i % 28) + 0.5)*S/28, py = iy + (Math.floor(i/28) + 0.5)*S/28;
      for (j = 0; j < 16; j++){
        c = x[i]*Wt[0][i*16 + j]; var a = Math.abs(c)/mc; if (a < 0.08) continue;
        g.strokeStyle = rgba(c > 0 ? ST.pos : ST.neg, 0.05 + 0.4*a);
        g.beginPath(); g.moveTo(px, py); g.lineTo(xH1 - r, ny(16, j)); g.stroke();
      }
    }
    function layerEdges(n1, n2, xa, xb, act, Wl, nout){
      var mw = 1e-9, mm = 1e-9;
      for (var a = 0; a < n1; a++) for (var b = 0; b < n2; b++){ var w = Wl[a*nout + b]; mw = Math.max(mw, Math.abs(w)); mm = Math.max(mm, Math.abs(w*act[a])); }
      for (a = 0; a < n1; a++) for (b = 0; b < n2; b++){
        var w2 = Wl[a*nout + b], s = Math.abs(w2*act[a])/mm, base = 0.05*Math.abs(w2)/mw;
        g.strokeStyle = rgba(w2 > 0 ? ST.pos : ST.neg, base + 0.75*s);
        g.lineWidth = 0.5 + 2.2*s;
        g.beginPath(); g.moveTo(xa + r, ny(n1, a)); g.lineTo(xb - r, ny(n2, b)); g.stroke();
      }
    }
    layerEdges(16, 16, xH1, xH2, o.a1, Wt[1], 16);
    layerEdges(16, 10, xH2, xO, o.a2, Wt[2], 10);
    g.globalCompositeOperation = "source-over";
    // นิวรอน
    nn.hits = [];
    function nodes(n, xx, act, layer, names){
      var mx = 1e-9; for (var k = 0; k < n; k++) mx = Math.max(mx, act[k]);
      for (k = 0; k < n; k++){
        var yy = ny(n, k), v = act[k]/mx;
        g.beginPath(); g.arc(xx, yy, r, 0, Math.PI*2);
        g.fillStyle = "rgba(255,255,255," + (0.06 + 0.9*v).toFixed(3) + ")"; g.fill();
        g.lineWidth = 1.2; g.strokeStyle = "rgba(232,240,246,.6)"; g.stroke();
        if (layer === 1 && k === nn.sel){ g.lineWidth = 2.4; g.strokeStyle = ST.gold; g.beginPath(); g.arc(xx, yy, r + 3.5, 0, Math.PI*2); g.stroke(); }
        nn.hits.push({ x: xx, y: yy, r: r, layer: layer, idx: k,
          tip: (layer === 3 ? "ผลลัพธ์ · เลข <b>" + k + "</b> · ความน่าจะเป็น <b>" + pct(act[k]) + "</b>"
                            : "ชั้นซ่อน " + layer + " · นิวรอน <b>#" + (k + 1) + "</b><br>ค่ากระตุ้น a = <b>" + act[k].toFixed(2) + "</b>" + (layer === 1 ? "<br><span style='opacity:.7'>คลิกเพื่อดูการคำนวณ</span>" : "")) });
      }
    }
    nodes(16, xH1, o.a1, 1); nodes(16, xH2, o.a2, 2); nodes(10, xO, o.p, 3);
    // ป้ายตัวเลข + แท่งความน่าจะเป็น
    var b = 0; for (j = 1; j < 10; j++) if (o.p[j] > o.p[b]) b = j;
    var empty = !x.some(function(v){ return v > 0; });
    var barX = xO + r + 26, barW = Math.max(16, W - barX - (narrow ? 8 : 58));
    g.textAlign = "left"; g.textBaseline = "middle";
    for (j = 0; j < 10; j++){
      var yy = ny(10, j), win = j === b && !empty;
      g.font = "800 15px Archivo, sans-serif"; g.fillStyle = win ? ST.gold : ST.ink; g.fillText(String(j), xO + r + 8, yy);
      g.fillStyle = "rgba(232,240,246,.10)"; g.fillRect(barX, yy - 5, barW, 10);
      g.fillStyle = win ? ST.gold : "rgba(232,240,246,.72)"; g.fillRect(barX, yy - 5, Math.max(1, barW*o.p[j]), 10);
      if (!narrow){ g.font = "600 11.5px " + pal().font; g.fillStyle = win ? ST.gold : ST.soft; g.fillText(pct(o.p[j]), barX + barW + 6, yy); }
      if (win){ g.strokeStyle = ST.gold; g.lineWidth = 2; g.beginPath(); g.moveTo(xO - r - 9, yy - r - 3); g.lineTo(xO - r - 13, yy - r - 3); g.lineTo(xO - r - 13, yy + r + 3); g.lineTo(xO - r - 9, yy + r + 3); g.stroke(); }
    }
    g.textBaseline = "alphabetic";
  }
  function nnDrawW(){
    var wm = $("#aihNeuralW"); if (!wm || !nn.out) return;
    var P = pal();
    $$(".aih-wcell", wm).forEach(function(cell, j){
      var cv = cell.querySelector("canvas"), w = new Float32Array(784);
      for (var i = 0; i < 784; i++) w[i] = MN.W[0][i*16 + j];
      if (cell._theme !== P.dark){ paintDiverging(cv, w, P); cell._theme = P.dark; }
      cell.classList.toggle("on", j === nn.sel);
      cell.querySelector(".v").textContent = nn.out.a1[j].toFixed(1);
    });
  }
  function nnDrawOne(){
    var om = $("#aihNeuralOne"); if (!om || !nn.out) return;
    var P = pal(), j = nn.sel, w = new Float32Array(784), pr = new Float32Array(784), sum = 0, sp = 0, sn = 0;
    for (var i = 0; i < 784; i++){ w[i] = MN.W[0][i*16 + j]; pr[i] = nn.x[i]*w[i]; sum += pr[i]; if (pr[i] > 0) sp += pr[i]; else sn += pr[i]; }
    paintDigit($(".c-in", om), nn.x);
    paintDiverging($(".c-w", om), w, P);
    var mw = 0; for (i = 0; i < 784; i++) mw = Math.max(mw, Math.abs(w[i]));
    paintDiverging($(".c-p", om), pr, P, mw);
    $(".c-name", om).textContent = "#" + (j + 1);
    var b = MN.B[0][j], z = sum + b, a = Math.max(0, z);
    $(".aih-eq", om).innerHTML =
      "คะแนนจากจุดสีฟ้า <b style='color:var(--aih-pos)'>+" + sp.toFixed(2) + "</b> · จากจุดสีส้ม <b style='color:var(--aih-neg)'>" + sn.toFixed(2) + "</b><br>" +
      "รวม 784 จุด Σ w·x = <b>" + sum.toFixed(2) + "</b> &nbsp;+&nbsp; ไบแอส b = <b>" + b.toFixed(2) + "</b> &nbsp;=&nbsp; <b>" + z.toFixed(2) + "</b><br>" +
      "ReLU (ถ้าติดลบให้เป็น 0) → ค่ากระตุ้น a = <b class='big'>" + a.toFixed(2) + "</b> " +
      (a === 0 ? "<span class='aih-note'>— นิวรอนนี้ \"ดับ\" สำหรับภาพนี้</span>" : "<span class='aih-note'>— ส่งต่อให้ 16 นิวรอนชั้นถัดไป</span>");
  }
  AIH.register("ai-neural", {
    build: nnBuild,
    draw: function(){ var wm = $("#aihNeuralW"); if (wm) $$(".aih-wcell", wm).forEach(function(c){ c._theme = null; }); nnDrawAll(); }
  });

  /* =====================================================================
     หัวข้อ 2 — AI เรียนรู้ยังไง
     (ก) สนามทดลอง: โครงข่าย 2→8→8→1 ฝึกสดด้วย backprop + Adam
     (ข) บันทึกการฝึก MNIST จริง  (ค) คำทายระหว่างฝึก
     ===================================================================== */
  var PG = { ds: "circle", pts: [], net: null, playing: false, loop: null, step: 0, lr: 0.03, hist: [], acc: 0, loss: 0 };
  var PG_SIZES = [2, 8, 8, 1];
  function pgRand(){ return Math.random()*2 - 1; }
  function pgGauss(){ var u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
  function pgMakeData(ds){
    var pts = [], i, n = 240;
    if (ds === "circle"){
      for (i = 0; i < n; i++){ var inner = i % 2 === 0, rr = inner ? Math.random()*0.42 : 0.62 + Math.random()*0.33, t = Math.random()*Math.PI*2; pts.push({ x: rr*Math.cos(t), y: rr*Math.sin(t), c: inner ? 1 : 0 }); }
    } else if (ds === "xor"){
      for (i = 0; i < n; i++){ var x = pgRand(), y = pgRand(); x += x > 0 ? 0.05 : -0.05; y += y > 0 ? 0.05 : -0.05; pts.push({ x: x*0.92, y: y*0.92, c: x*y > 0 ? 1 : 0 }); }
    } else if (ds === "spiral"){
      for (i = 0; i < n/2; i++){ var f = i/(n/2), r2 = 0.08 + f*0.85, a = f*Math.PI*3.2;
        pts.push({ x: r2*Math.cos(a) + pgGauss()*0.025, y: r2*Math.sin(a) + pgGauss()*0.025, c: 1 });
        pts.push({ x: -r2*Math.cos(a) + pgGauss()*0.025, y: -r2*Math.sin(a) + pgGauss()*0.025, c: 0 }); }
    } else {
      for (i = 0; i < n; i++){ var cc = i % 2; pts.push({ x: (cc ? 0.42 : -0.42) + pgGauss()*0.2, y: (cc ? 0.35 : -0.35) + pgGauss()*0.2, c: cc }); }
    }
    return pts;
  }
  function pgNewNet(){
    var L = [];
    for (var l = 0; l < 3; l++){
      var nin = PG_SIZES[l], nout = PG_SIZES[l + 1], w = new Float64Array(nin*nout), s = Math.sqrt(1/nin);
      for (var i = 0; i < w.length; i++) w[i] = pgGauss()*s*1.2;
      L.push({ w: w, b: new Float64Array(nout), nin: nin, nout: nout,
               gw: new Float64Array(nin*nout), gb: new Float64Array(nout),
               mw: new Float64Array(nin*nout), vw: new Float64Array(nin*nout), mb: new Float64Array(nout), vb: new Float64Array(nout) });
    }
    return { L: L, t: 0 };
  }
  function pgForward(net, x, y, keep){
    var a = [x, y], acts = keep ? [a] : null;
    for (var l = 0; l < 3; l++){
      var Ly = net.L[l], out = new Array(Ly.nout);
      for (var j = 0; j < Ly.nout; j++){ var s = Ly.b[j]; for (var i = 0; i < Ly.nin; i++) s += a[i]*Ly.w[i*Ly.nout + j]; out[j] = l < 2 ? Math.tanh(s) : 1/(1 + Math.exp(-s)); }
      a = out; if (keep) acts.push(a);
    }
    return keep ? acts : a[0];
  }
  function pgTrainStep(){
    var net = PG.net, L = net.L, n = PG.pts.length, loss = 0, ok = 0;
    for (var q = 0; q < n; q++){
      var p = PG.pts[q], acts = pgForward(net, p.x, p.y, true), out = acts[3][0];
      loss += -(p.c*Math.log(out + 1e-9) + (1 - p.c)*Math.log(1 - out + 1e-9));
      if ((out > 0.5) === (p.c === 1)) ok++;
      var delta = [out - p.c];                          // BCE + sigmoid → อนุพันธ์ = ทาย − เฉลย
      for (var l = 2; l >= 0; l--){
        var Ly = L[l], ain = acts[l], dprev = new Array(Ly.nin);
        for (var j = 0; j < Ly.nout; j++) Ly.gb[j] += delta[j];
        for (var i = 0; i < Ly.nin; i++){
          var s = 0;
          for (j = 0; j < Ly.nout; j++){ Ly.gw[i*Ly.nout + j] += ain[i]*delta[j]; s += Ly.w[i*Ly.nout + j]*delta[j]; }
          dprev[i] = l > 0 ? s*(1 - ain[i]*ain[i]) : 0;  // ย้อนผ่าน tanh
        }
        delta = dprev;
      }
    }
    net.t++;
    var b1 = 0.9, b2 = 0.999, c1 = 1 - Math.pow(b1, net.t), c2 = 1 - Math.pow(b2, net.t), lr = PG.lr;
    L.forEach(function(Ly){
      function upd(p, g, m, v){ for (var i = 0; i < p.length; i++){ var gi = g[i]/n; m[i] = b1*m[i] + (1 - b1)*gi; v[i] = b2*v[i] + (1 - b2)*gi*gi; p[i] -= lr*(m[i]/c1)/(Math.sqrt(v[i]/c2) + 1e-8); g[i] = 0; } }
      upd(Ly.w, Ly.gw, Ly.mw, Ly.vw); upd(Ly.b, Ly.gb, Ly.mb, Ly.vb);
    });
    PG.step++; PG.loss = loss/n; PG.acc = ok/n;
    PG.hist.push(PG.loss); if (PG.hist.length > 600) PG.hist.shift();
  }
  function pgReset(newData){
    if (newData) PG.pts = pgMakeData(PG.ds);
    PG.net = pgNewNet(); PG.step = 0; PG.hist = [];
    var n = PG.pts.length, loss = 0, ok = 0;
    PG.pts.forEach(function(p){ var o = pgForward(PG.net, p.x, p.y); loss += -(p.c*Math.log(o + 1e-9) + (1 - p.c)*Math.log(1 - o + 1e-9)); if ((o > 0.5) === (p.c === 1)) ok++; });
    PG.loss = loss/n; PG.acc = ok/n; PG.hist.push(PG.loss);
    pgDraw();
  }
  function pgSetPlaying(on){
    PG.playing = on;
    var b = $("#aihPlay [data-a='play']"); if (b) b.innerHTML = on ? "⏸ หยุด" : "▶ ฝึก";
    if (PG.loop){ PG.loop.stop(); PG.loop = null; }
    if (on) PG.loop = tickLoop(function(){ if (!paneOn("ai-learn")){ pgSetPlaying(false); return false; } for (var k = 0; k < 4; k++) pgTrainStep(); pgDraw(); }, 30);
  }
  function pgBuild(){
    var m = $("#aihPlay"); if (!m) return;
    m.innerHTML =
      '<div class="aih-ctl">' +
        '<span class="lab">โจทย์:</span>' +
        '<button type="button" class="aih-chip on" data-ds="circle">วงกลม</button><button type="button" class="aih-chip" data-ds="xor">XOR</button>' +
        '<button type="button" class="aih-chip" data-ds="spiral">เกลียว (ยาก)</button><button type="button" class="aih-chip" data-ds="gauss">สองกลุ่ม (ง่าย)</button>' +
        '<span style="flex:1"></span>' +
        '<button type="button" class="tl-btn on" data-a="play">▶ ฝึก</button><button type="button" class="tl-btn" data-a="step">+1 รอบ</button><button type="button" class="tl-btn" data-a="reset">สุ่มน้ำหนักใหม่</button>' +
        '<label class="aih-range">อัตราการเรียนรู้ <select class="aih-lr" style="font:inherit;font-size:12.5px;padding:4px 8px;border-radius:8px;border:1px solid var(--rule);background:var(--paper-3);color:var(--ink)">' +
          '<option value="0.003">0.003 (ช้า)</option><option value="0.01">0.01</option><option value="0.03" selected>0.03</option><option value="0.1">0.1</option><option value="0.3">0.3</option><option value="1">1 (แรงเกิน)</option></select></label>' +
      '</div>' +
      '<div class="aih-pg">' +
        '<div class="aih-stage"><canvas class="pg-bd"></canvas></div>' +
        '<div class="aih-stage aih-pg-net"><canvas class="pg-net"></canvas></div>' +
        '<div><div class="aih-stage"><canvas class="pg-loss"></canvas></div><div class="aih-stat" style="margin-top:10px"></div></div>' +
      '</div>';
    $$("[data-ds]", m).forEach(function(b){ b.addEventListener("click", function(){ $$("[data-ds]", m).forEach(function(x){ x.classList.toggle("on", x === b); }); PG.ds = b.getAttribute("data-ds"); pgReset(true); }); });
    m.querySelector("[data-a='play']").addEventListener("click", function(){ pgSetPlaying(!PG.playing); });
    m.querySelector("[data-a='step']").addEventListener("click", function(){ pgSetPlaying(false); pgTrainStep(); pgDraw(); });
    m.querySelector("[data-a='reset']").addEventListener("click", function(){ pgReset(false); });
    $(".aih-lr", m).addEventListener("change", function(){ PG.lr = parseFloat(this.value); });
    pgReset(true);
  }
  function pgDraw(){
    var m = $("#aihPlay"); if (!m || !PG.net) return;
    var bd = $(".pg-bd", m), W = Math.max(200, bd.parentNode.clientWidth), g = canvasFit(bd, W, W);
    // เส้นแบ่งเขต: ทายทุกจุดบนกริด 60×60
    var N = 60, im = g.createImageData(N, N);
    for (var yy = 0; yy < N; yy++) for (var xx = 0; xx < N; xx++){
      var o = pgForward(PG.net, (xx + 0.5)/N*2 - 1, 1 - (yy + 0.5)/N*2), c = o > 0.5 ? ST.pos : ST.neg, a = Math.abs(o - 0.5)*2;
      var k = (yy*N + xx)*4, bg = [5, 9, 14], mm = mix(bg, c, 0.12 + 0.5*a);
      im.data[k] = mm[0]; im.data[k+1] = mm[1]; im.data[k+2] = mm[2]; im.data[k+3] = 255;
    }
    var t = document.createElement("canvas"); t.width = t.height = N; t.getContext("2d").putImageData(im, 0, 0);
    g.imageSmoothingEnabled = true; g.drawImage(t, 0, 0, W, W);
    PG.pts.forEach(function(p){
      g.beginPath(); g.arc((p.x + 1)/2*W, (1 - p.y)/2*W, 3.4, 0, Math.PI*2);
      g.fillStyle = rgba(p.c ? ST.pos : ST.neg, 1); g.fill(); g.lineWidth = 1; g.strokeStyle = "rgba(255,255,255,.85)"; g.stroke();
    });
    // โครงข่าย: แต่ละนิวรอนวาดเป็นภาพย่อ "มันตอบสนองต่อจุดไหน" + เส้นน้ำหนัก
    var nc = $(".pg-net", m), NW = Math.max(300, nc.parentNode.clientWidth), NH = Math.round(Math.min(420, Math.max(300, NW*0.62)));
    var q = canvasFit(nc, NW, NH);
    q.fillStyle = ST.bg; q.fillRect(0, 0, NW, NH);
    var cols = PG_SIZES.length, sz = Math.max(22, Math.min(40, (NH - 60)/8 - 8)), pos = [];
    for (var l = 0; l < cols; l++){
      var n = PG_SIZES[l], xc = 40 + l*(NW - 80)/(cols - 1), arr = [];
      for (var i = 0; i < n; i++) arr.push({ x: xc, y: 34 + (i + 0.5)*(NH - 50)/n });
      pos.push(arr);
    }
    var L = PG.net.L;
    for (l = 0; l < 3; l++){
      var Ly = L[l], mw = 1e-9; for (i = 0; i < Ly.w.length; i++) mw = Math.max(mw, Math.abs(Ly.w[i]));
      for (i = 0; i < Ly.nin; i++) for (var j = 0; j < Ly.nout; j++){
        var w = Ly.w[i*Ly.nout + j], s = Math.min(1, Math.abs(w)/Math.max(1.5, mw*0.7));
        q.strokeStyle = rgba(w > 0 ? ST.pos : ST.neg, 0.18 + 0.7*s); q.lineWidth = 0.4 + 3.4*s;
        q.beginPath(); q.moveTo(pos[l][i].x + sz/2, pos[l][i].y); q.lineTo(pos[l + 1][j].x - sz/2, pos[l + 1][j].y); q.stroke();
      }
    }
    var R = 16, cell = document.createElement("canvas"); cell.width = cell.height = R;
    var cg = cell.getContext("2d"), cim = cg.createImageData(R, R);
    var grid = [];
    for (yy = 0; yy < R; yy++) for (xx = 0; xx < R; xx++) grid.push(pgForward(PG.net, (xx + 0.5)/R*2 - 1, 1 - (yy + 0.5)/R*2, true));
    for (l = 0; l < cols; l++) for (i = 0; i < PG_SIZES[l]; i++){
      for (var k2 = 0; k2 < R*R; k2++){
        var v = grid[k2][l][i], cc = l === 3 ? (v > 0.5 ? ST.pos : ST.neg) : (v > 0 ? ST.pos : ST.neg);
        var amp = l === 3 ? Math.abs(v - 0.5)*2 : Math.min(1, Math.abs(v)), mc2 = mix([5, 9, 14], cc, 0.15 + 0.8*amp);
        cim.data[k2*4] = mc2[0]; cim.data[k2*4+1] = mc2[1]; cim.data[k2*4+2] = mc2[2]; cim.data[k2*4+3] = 255;
      }
      cg.putImageData(cim, 0, 0);
      var pp = pos[l][i];
      q.imageSmoothingEnabled = false; q.drawImage(cell, pp.x - sz/2, pp.y - sz/2, sz, sz); q.imageSmoothingEnabled = true;
      q.strokeStyle = "rgba(232,240,246,.55)"; q.lineWidth = 1; q.strokeRect(pp.x - sz/2 + 0.5, pp.y - sz/2 + 0.5, sz - 1, sz - 1);
    }
    q.font = "600 11.5px " + pal().font; q.fillStyle = ST.soft; q.textAlign = "center";
    ["ขาเข้า x, y", "ชั้นซ่อน 1", "ชั้นซ่อน 2", "ผลลัพธ์"].forEach(function(s, l2){ q.fillText(s, pos[l2][0].x, 18); });
    // กราฟ loss
    var lc = $(".pg-loss", m), LW = Math.max(180, lc.parentNode.clientWidth), LH = 170, lg = canvasFit(lc, LW, LH);
    lg.fillStyle = ST.bg; lg.fillRect(0, 0, LW, LH);
    var hs = PG.hist, mx = 0.8; hs.forEach(function(v){ mx = Math.max(mx, v); });
    lg.strokeStyle = ST.faint; lg.lineWidth = 1; lg.beginPath(); lg.moveTo(30, 12); lg.lineTo(30, LH - 22); lg.lineTo(LW - 8, LH - 22); lg.stroke();
    lg.fillStyle = ST.soft; lg.font = "600 11px " + pal().font; lg.textAlign = "left";
    lg.fillText("loss (ความผิดพลาด)", 36, 14); lg.fillText("รอบฝึก →", LW - 64, LH - 7);
    lg.strokeStyle = ST.gold; lg.lineWidth = 2; lg.beginPath();
    hs.forEach(function(v, k){ var X = 30 + k/Math.max(1, hs.length - 1)*(LW - 40), Y = LH - 22 - v/mx*(LH - 40); if (k) lg.lineTo(X, Y); else lg.moveTo(X, Y); });
    lg.stroke();
    var st = $(".aih-stat", m);
    st.innerHTML = "รอบฝึก <b>" + fmt(PG.step) + "</b><br>ความผิดพลาด (loss) <b>" + PG.loss.toFixed(3) + "</b><br>จัดกลุ่มถูก <b>" + pct(PG.acc, 0) + "</b><br><span class='aih-note'>1 รอบ = ดูข้อมูลครบ 240 จุด แล้วปรับน้ำหนัก " + (8*2 + 8 + 8*8 + 8 + 8 + 1) + " ตัว 1 ครั้ง</span>";
  }

  /* บันทึกการฝึกจริง (Plot) */
  function learnLogDraw(){
    var box = $("#aihLearnLog"); if (!box || !window.Plot) return;
    var P = pal(), W = Math.max(300, box.clientWidth || 600);
    var rows = MN.log.filter(function(r){ return r.seen > 0; }).map(function(r){ return { seen: r.seen, acc: r.acc*100, loss: r.loss, step: r.step }; });
    var marks = [
      Plot.ruleY([10], { stroke: P.soft, strokeDasharray: "3,3" }),
      Plot.text([{ seen: 400, acc: 10 }], { x: "seen", y: "acc", text: function(){ return "ทายมั่ว = 10%"; }, dy: -8, textAnchor: "start", fill: P.soft, fontSize: 11 }),
      Plot.lineY(rows, { x: "seen", y: "acc", stroke: P.green, strokeWidth: 2.4, curve: "monotone-x" }),
      Plot.dot(rows, { x: "seen", y: "acc", r: 2.4, fill: P.green }),
      Plot.tip(rows, Plot.pointerX({ x: "seen", y: "acc", title: function(d){ return "ก้าวที่ " + fmt(d.step) + " · เห็นแล้ว " + fmt(d.seen) + " ภาพ\nความแม่นยำ " + d.acc.toFixed(1) + "% · loss " + d.loss.toFixed(3); } }))
    ];
    var fig = Plot.plot({ width: W, height: 300, marginLeft: 46, marginBottom: 40, style: plotStyle(P),
      x: { type: "log", label: "จำนวนภาพที่โครงข่ายเห็นแล้ว (สเกล log) →", tickFormat: "~s", grid: true },
      y: { label: "↑ ความแม่นยำ (%)", domain: [0, 100], grid: true }, marks: marks });
    box.innerHTML = ""; box.appendChild(fig);
  }
  var LW_ = { k: 80, loop: null };
  function learnWatchBuild(){
    var m = $("#aihLearnWatch"); if (!m) return;
    m.innerHTML = '<div class="aih-ctl"><button type="button" class="tl-play" data-a="play" aria-label="เล่น" style="width:38px;height:38px">▶</button>' +
      '<input type="range" class="tl-slider" min="0" max="' + (MN.log.length - 1) + '" value="' + (MN.log.length - 1) + '" style="padding:10px 0">' +
      '</div><div class="aih-note aih-wlab" style="margin:-4px 0 10px"></div><div class="aih-watch"></div>';
    var sl = $("input", m);
    sl.addEventListener("input", function(){ LW_.k = +this.value; learnWatchDraw(); });
    m.querySelector("[data-a='play']").addEventListener("click", function(){
      if (LW_.loop){ LW_.loop.stop(); LW_.loop = null; this.textContent = "▶"; return; }
      var btn = this; btn.textContent = "⏸"; if (LW_.k >= MN.log.length - 1) LW_.k = 0;
      LW_.loop = tickLoop(function(){
        if (!paneOn("ai-learn")){ btn.textContent = "▶"; LW_.loop = null; return false; }
        LW_.k++; sl.value = LW_.k; learnWatchDraw();
        if (LW_.k >= MN.log.length - 1){ btn.textContent = "▶"; LW_.loop = null; return false; }
      }, 220);
    });
    var wrap = $(".aih-watch", m);
    MN.watchIdx.forEach(function(si){ var c = h("div", "aih-wc", '<canvas></canvas><div class="g"></div><div class="c"></div>'); paintDigit(c.querySelector("canvas"), MN.samples[si].x); wrap.appendChild(c); });
    LW_.k = MN.log.length - 1; learnWatchDraw();
  }
  function learnWatchDraw(){
    var m = $("#aihLearnWatch"); if (!m) return;
    var k = LW_.k, lg = MN.log[k], guesses = MN.watch[k], ok = 0;
    $$(".aih-wc", m).forEach(function(c, i){
      var pr = guesses[i], b = 0; for (var j = 1; j < 10; j++) if (pr[j] > pr[b]) b = j;
      var y = MN.samples[MN.watchIdx[i]].y, good = b === y; if (good) ok++;
      c.classList.toggle("ok", good); c.classList.toggle("bad", !good);
      c.querySelector(".g").textContent = b;
      c.querySelector(".c").textContent = "มั่นใจ " + Math.round(pr[b]/2.55) + "% · เฉลย " + y;
    });
    $(".aih-wlab", m).innerHTML = "ก้าวที่ <b>" + fmt(lg.step) + "</b> · เห็นภาพแล้ว <b>" + fmt(lg.seen) + "</b> ภาพ · ทาย 12 ภาพนี้ถูก <b>" + ok + "/12</b> · ความแม่นยำชุดทดสอบ " + (lg.acc*100).toFixed(1) + "%";
  }
  AIH.register("ai-learn", {
    build: function(){ mnist(); pgBuild(); learnWatchBuild(); },
    draw: function(){ pgDraw(); learnLogDraw(); },
    pause: function(){ if (PG.playing) pgSetPlaying(false); if (LW_.loop){ LW_.loop.stop(); LW_.loop = null; var b = $("#aihLearnWatch [data-a='play']"); if (b) b.textContent = "▶"; } }
  });
  AIH._pg = PG; AIH._pgStep = function(n){ for (var i = 0; i < (n || 1); i++) pgTrainStep(); pgDraw(); return { step: PG.step, loss: PG.loss, acc: PG.acc }; };
})();
