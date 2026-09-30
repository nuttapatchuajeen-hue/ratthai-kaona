/* =====================================================================
   หมวด "หลักการทำงาน AI" — หัวข้อ 7–10
   7 ทำนายคำถัดไป & temperature (logits จริงของ GPT-2) · 8 ฝึก 3 ขั้น (คำตอบจริงของ GPT-2 ดิบ)
   9 Diffusion (โมเดล DDPM จิ๋วที่ฝึกเอง คำนวณสดในเบราว์เซอร์) · 10 ข้อจำกัด / RAG / Agent
   ต้องโหลดหลัง ai-how.js และ ai-how-data.js
   ===================================================================== */
(function(){
  "use strict";
  var AIH = window.AIH, U = AIH.util, DATA = window.AIH_DATA;
  var $ = U.$, $$ = U.$$, h = U.h, pal = U.pal, ST = U.ST, rgba = U.rgba, mix = U.mix, pct = U.pct, fmt = U.fmt, esc = U.esc, tokHtml = U.tokHtml;

  AIH.cssMore = (AIH.cssMore || []).concat([
    /* หัวข้อ 7 */
    ".aih-next-prompt{overflow-wrap:anywhere;white-space:pre-wrap;font-size:17px;line-height:1.7;padding:12px 14px;border-radius:12px;background:var(--paper-3);border:1px solid var(--rule);color:var(--ink);margin:0 0 12px}",
    ".aih-next-prompt .add{background:var(--gold);color:#1a1200;border-radius:5px;padding:1px 3px;font-weight:700;animation:aihPop .5s ease}",
    "@keyframes aihPop{from{background:var(--red);color:#fff}to{}}",
    ".aih-bars{display:grid;gap:4px}",
    ".aih-bar{display:grid;grid-template-columns:150px 1fr 64px 70px;gap:8px;align-items:center;font-size:13px}",
    ".aih-bar .t{font-weight:700;color:var(--ink);white-space:pre;overflow:hidden;text-overflow:ellipsis}",
    ".aih-bar .tr{position:relative;height:16px;border-radius:4px;background:var(--paper-3);overflow:hidden}",
    ".aih-bar .f{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:var(--green);transition:width .25s}",
    ".aih-bar .g{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:repeating-linear-gradient(45deg,var(--rule) 0 4px,transparent 4px 8px)}",
    ".aih-bar.drop .t{color:var(--ink-soft);text-decoration:line-through}",
    ".aih-bar.first .f{background:var(--red)}",
    ".aih-bar .v{font-family:Archivo,sans-serif;font-weight:700;color:var(--ink-2);text-align:right}",
    ".aih-bar .c{font-size:11.5px;color:var(--ink-soft)}",
    ".aih-bar.other .t{font-weight:500;color:var(--ink-soft)}",
    ".aih-bar.other .f{background:var(--ink-soft)}",
    ".aih-chain-text{overflow-wrap:anywhere;white-space:pre-wrap;font-size:17px;line-height:1.8;padding:12px 14px;border-radius:12px;background:var(--paper-3);border:1px solid var(--rule);color:var(--ink);margin:0 0 12px;min-height:60px}",
    ".aih-chain-text .p{color:var(--ink-soft)}",
    ".aih-chain-text .k{background:var(--green-soft);border-radius:4px;padding:1px 2px}",
    ".aih-chain-text .now{background:var(--gold);color:#1a1200;border-radius:4px;padding:1px 3px;font-weight:700}",
    /* หัวข้อ 8 */
    ".aih-flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:10px;align-items:stretch}",
    ".aih-stagecard{border:1px solid var(--rule);border-radius:14px;padding:14px;background:var(--paper-3);cursor:pointer;transition:border-color .15s,transform .15s}",
    ".aih-stagecard:hover{border-color:var(--green)}",
    ".aih-stagecard.on{border-color:var(--red);box-shadow:0 0 0 2px var(--red) inset}",
    ".aih-stagecard .no{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--green);color:var(--paper);font-weight:800;font-family:Archivo,sans-serif;margin-right:6px}",
    ".aih-stagecard h4{margin:0 0 6px;font-size:15px;color:var(--ink);display:flex;align-items:center}",
    ".aih-stagecard p{margin:0;font-size:12.5px;line-height:1.6;color:var(--ink-2)}",
    ".aih-stagecard .out{margin-top:8px;font-size:12px;font-weight:700;color:var(--red)}",
    ".aih-flow .arr{display:grid;place-items:center;font-size:26px;color:var(--ink-soft)}",
    ".aih-stagedet{margin-top:14px;padding:14px 16px;border-radius:12px;border:1px dashed var(--rule-strong);font-size:13.5px;line-height:1.8;color:var(--ink-2)}",
    ".aih-stagedet b{color:var(--ink)}",
    ".aih-ex{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;margin-top:8px;font-size:13px}",
    ".aih-ex .r{font-weight:800;color:var(--ink-soft)}",
    ".aih-ex .bub{padding:7px 10px;border-radius:10px;background:var(--paper-2);border:1px solid var(--rule);white-space:pre-wrap}",
    ".aih-ex .bub.good{border-color:var(--green)} .aih-ex .bub.bad{border-color:var(--red);opacity:.85}",
    ".aih-base{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}",
    ".aih-basecard{border:1px solid var(--rule);border-radius:12px;padding:12px;background:var(--paper-2);display:flex;flex-direction:column;gap:8px}",
    ".aih-basecard .q{font-family:ui-monospace,Consolas,monospace;font-size:12.5px;white-space:pre-wrap;color:var(--ink);background:var(--paper-3);border-radius:8px;padding:8px}",
    ".aih-basecard .a{font-family:ui-monospace,Consolas,monospace;font-size:12.5px;white-space:pre-wrap;color:var(--ink);border-left:3px solid var(--red);padding:4px 0 4px 10px}",
    ".aih-basecard .cm{font-size:12.5px;color:var(--red);font-weight:700}",
    ".aih-basecard .nx{display:flex;flex-wrap:wrap;gap:4px}",
    ".aih-basecard .nx span{font-size:11.5px;padding:2px 7px;border-radius:999px;background:var(--paper-3);border:1px solid var(--rule);color:var(--ink-2);white-space:pre}",
    /* หัวข้อ 9 */
    ".aih-diff{display:grid;grid-template-columns:minmax(260px,560px) 1fr;gap:18px;align-items:start}",
    ".aih-diff .aih-stage canvas{width:100%;height:auto}",
    ".aih-fwd canvas{width:100%;max-width:300px;aspect-ratio:1;display:block;border-radius:10px;image-rendering:pixelated;border:1px solid var(--rule)}",
    ".aih-fwd-strip{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;margin-top:10px}",
    ".aih-fwd-strip figure{margin:0;text-align:center;font-size:11px;color:var(--ink-soft)}",
    ".aih-fwd-strip canvas{width:100%;aspect-ratio:1;border-radius:6px;image-rendering:pixelated;border:1px solid var(--rule)}",
    ".aih-cmp{width:100%;border-collapse:collapse;font-size:13px}",
    ".aih-cmp th,.aih-cmp td{border-bottom:1px solid var(--rule);padding:8px 6px;text-align:left;vertical-align:top;color:var(--ink-2)}",
    ".aih-cmp th{color:var(--ink);font-size:12.5px}",
    ".aih-cmp td:first-child{font-weight:700;color:var(--ink);white-space:nowrap}",
    /* หัวข้อ 10 */
    ".aih-lim-q{font-family:ui-monospace,Consolas,monospace;font-size:13px;white-space:pre-wrap;padding:9px 11px;border-radius:10px;background:var(--paper-3);border:1px solid var(--rule);color:var(--ink);margin-bottom:8px}",
    ".aih-lim-q .ctx{display:block;color:var(--green);margin-bottom:4px}",
    ".aih-lim-a{font-size:13.5px;line-height:1.7;color:var(--ink-2);margin:8px 0}",
    ".aih-lim-a b{color:var(--red)}",
    ".aih-rag{display:grid;grid-template-columns:1fr 1fr;gap:12px}",
    ".aih-rag h5{margin:0 0 6px;font-size:13px;color:var(--ink)}",
    ".aih-agent{display:grid;grid-template-columns:minmax(260px,420px) 1fr;gap:18px;align-items:start}",
    ".aih-agent svg{width:100%;display:block}",
    ".aih-agent svg text{font-family:'IBM Plex Sans Thai',system-ui,sans-serif}",
    ".aih-log{display:grid;gap:8px}",
    ".aih-log .st{display:grid;grid-template-columns:86px 1fr;gap:10px;padding:8px 10px;border-radius:10px;border:1px solid var(--rule);background:var(--paper-2);font-size:13px;line-height:1.6;color:var(--ink-2);opacity:.28;transition:opacity .3s,border-color .3s}",
    ".aih-log .st.on{opacity:1} .aih-log .st.cur{border-color:var(--red)}",
    ".aih-log .st b{color:var(--ink)}",
    ".aih-log .st code{white-space:pre-wrap}",
    ".aih-tips{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}",
    ".aih-tips>div{border:1px solid var(--rule);border-radius:12px;padding:12px 14px;background:var(--paper-3);display:flex;flex-direction:column;gap:5px}",
    ".aih-tips b{color:var(--ink);font-size:14px} .aih-tips span{font-size:13px;line-height:1.6;color:var(--ink-2)}",
    "@media (max-width:980px){.aih-flow{grid-template-columns:1fr}.aih-flow .arr{transform:rotate(90deg)}.aih-base,.aih-diff,.aih-rag,.aih-agent{grid-template-columns:1fr}.aih-bar{grid-template-columns:110px 1fr 56px}.aih-bar .c{display:none}}"
  ]);

  /* =====================================================================
     หัวข้อ 7 — ทำนายคำถัดไป & temperature
     ===================================================================== */
  /* ข้อความไหลต่อเนื่อง: คงช่องว่างจริงไว้ให้ตัดบรรทัดได้ (tokHtml แทนช่องว่างด้วยจุด ใช้กับป้ายโทเคนเดี่ยว) */
  function flowTok(t){ return esc(t).replace(/\n/g, '<i class="aih-sp">↵</i> '); }
  var NX = { k: 0, ti: 18, topP: 1, added: [], counts: null, chainK: 0, step: 0, loop: null };
  function nxDist(){
    var d = DATA.gpt2.next, pr = d.prompts[NX.k], T = d.temps[NX.ti], lz = pr.logZ[NX.ti];
    var ps = pr.top.map(function(t){ return Math.exp(t.l/T - lz); }), sum = ps.reduce(function(a, b){ return a + b; }, 0);
    var keep = [], cum = 0;
    ps.forEach(function(p, i){ var inN = NX.topP >= 1 || cum < NX.topP; keep.push(inN); if (inN) cum += p; });
    var kept = ps.reduce(function(a, p, i){ return a + (keep[i] ? p : 0); }, 0);
    var fin = ps.map(function(p, i){ return keep[i] ? p/kept : 0; });   // การแจกแจงที่ใช้สุ่มจริง (ใน 40 อันดับแรก)
    return { pr: pr, T: T, ps: ps, other: Math.max(0, 1 - sum), keep: keep, fin: fin, cover: sum };
  }
  function nxBuild(){
    var m = $("#aihNext"); if (!m) return;
    var d = DATA.gpt2.next;
    m.innerHTML = '<div class="aih-ctl"><span class="lab">ประโยคตั้งต้น:</span>' + d.prompts.map(function(p, i){ return '<button type="button" class="aih-chip' + (i ? "" : " on") + '" data-k="' + i + '">' + esc(p.prompt) + " …</button>"; }).join("") + "</div>" +
      '<div class="aih-ctl"><label class="aih-range">Temperature <input type="range" class="nt" min="0" max="' + (d.temps.length - 1) + '" value="' + NX.ti + '"><output class="nto"></output></label>' +
      '<label class="aih-range">Top-p <input type="range" class="np" min="0.1" max="1" step="0.05" value="1"><output class="npo"></output></label>' +
      '<span style="flex:1"></span><button type="button" class="tl-btn on" data-a="one">สุ่มคำถัดไป</button><button type="button" class="tl-btn" data-a="many">สุ่ม 200 ครั้ง</button><button type="button" class="tl-btn" data-a="clr">ล้าง</button></div>' +
      '<div class="aih-next-prompt"></div><div class="aih-bars"></div><div class="aih-note aih-next-note" style="margin-top:8px"></div>';
    $$("[data-k]", m).forEach(function(b){ b.addEventListener("click", function(){ $$("[data-k]", m).forEach(function(x){ x.classList.toggle("on", x === b); }); NX.k = +b.getAttribute("data-k"); NX.added = []; NX.counts = null; nxDraw(); }); });
    $(".nt", m).addEventListener("input", function(){ NX.ti = +this.value; NX.counts = null; nxDraw(); });
    $(".np", m).addEventListener("input", function(){ NX.topP = +this.value; NX.counts = null; nxDraw(); });
    m.querySelector("[data-a='one']").addEventListener("click", function(){ var t = nxSample(nxDist()); NX.added = [t]; nxDraw(true); });
    m.querySelector("[data-a='many']").addEventListener("click", function(){ var D = nxDist(); NX.counts = D.pr.top.map(function(){ return 0; }); for (var i = 0; i < 200; i++){ var t = nxSample(D); NX.counts[t]++; } nxDraw(); });
    m.querySelector("[data-a='clr']").addEventListener("click", function(){ NX.added = []; NX.counts = null; nxDraw(); });
    chainBuild();
  }
  function nxSample(D){ var u = Math.random(), acc = 0; for (var i = 0; i < D.fin.length; i++){ acc += D.fin[i]; if (acc >= u) return i; } return 0; }
  function nxDraw(pop){
    var m = $("#aihNext"); if (!m) return;
    var D = nxDist(), pr = D.pr;
    $(".nto", m).textContent = D.T.toFixed(2); $(".npo", m).textContent = NX.topP >= 1 ? "ปิด" : NX.topP.toFixed(2);
    $(".aih-next-prompt", m).innerHTML = esc(pr.prompt) + (NX.added.length ? '<span class="add">' + flowTok(pr.top[NX.added[0]].t) + "</span>" : ' <span style="color:var(--ink-soft)">▁</span>');
    var show = 14, rows = "";
    for (var i = 0; i < show; i++){
      var t = pr.top[i], drop = !D.keep[i], c = NX.counts ? NX.counts[i] : null;
      rows += '<div class="aih-bar' + (drop ? " drop" : "") + (i === 0 ? " first" : "") + '"><span class="t">' + tokHtml(t.t) + '</span><div class="tr">' + (drop ? '<div class="g" style="width:' + (D.ps[i]*100) + '%"></div>' : "") +
        '<div class="f" style="width:' + (D.fin[i]*100) + '%"></div></div><span class="v">' + pct(D.fin[i]) + '</span><span class="c">' + (c != null ? "ได้ " + c + " ครั้ง" : (drop ? "ถูกตัด (top-p)" : "")) + "</span></div>";
    }
    var restFin = D.fin.slice(show).reduce(function(a, b){ return a + b; }, 0);
    rows += '<div class="aih-bar other"><span class="t">อันดับ 15–40</span><div class="tr"><div class="f" style="width:' + (restFin*100) + '%"></div></div><span class="v">' + pct(restFin) + '</span><span class="c">' + (NX.counts ? "ได้ " + NX.counts.slice(show).reduce(function(a, b){ return a + b; }, 0) + " ครั้ง" : "") + "</span></div>";
    $(".aih-bars", m).innerHTML = rows;
    $(".aih-next-note", m).innerHTML = "ที่ T = " + D.T.toFixed(2) + " โทเคน 40 อันดับแรกครอบคลุม <b>" + pct(D.cover) + "</b> ของความน่าจะเป็นทั้งหมด ส่วนที่เหลือ <b>" + pct(D.other) + "</b> กระจายอยู่ในอีก " + fmt(50257 - 40) + " โทเคน (การสุ่มในหน้านี้เลือกจาก 40 อันดับแรก) · T ต่ำ = คำแรกกินเกือบหมด (ตอบซ้ำเดิม) · T สูง = แท่งแบนลง (หลากหลายแต่เสี่ยงหลุด)";
    // KPI
    var H = pr.ent[NX.ti];              // entropy จริงบนคลังเต็ม 50,257 โทเคน (คำนวณไว้ล่วงหน้าด้วย GPT-2)
    var kt = $("#aihNextTop"); if (kt) kt.innerHTML = pct(D.ps[0]) + '<span class="u">' + esc(pr.top[0].t.trim() || "·") + "</span>";
    var ks = $("#aihNextTopS"); if (ks) ks.textContent = "“" + pr.prompt + " …” ที่ T = " + D.T.toFixed(2);
    var ke = $("#aihNextEnt"); if (ke) ke.innerHTML = "≈ " + fmt(Math.round(Math.exp(H))) + '<span class="u">คำ</span>';
  }
  function chainBuild(){
    var m = $("#aihChain"); if (!m) return;
    var C = DATA.gpt2.chains;
    m.innerHTML = '<div class="aih-ctl"><button type="button" class="aih-chip on" data-c="0">เลือกตัวที่ชัวร์สุด (greedy)</button><button type="button" class="aih-chip" data-c="1">สุ่มที่ T = 0.9</button>' +
      '<span style="flex:1"></span><button type="button" class="tl-play" data-a="play" style="width:38px;height:38px">▶</button>' +
      '<input type="range" class="tl-slider cs" min="0" max="' + C[0].steps.length + '" value="' + C[0].steps.length + '" style="max-width:320px;padding:10px 0"><output class="cso" style="font-weight:700;min-width:70px"></output></div>' +
      '<div class="aih-chain-text"></div><div class="aih-bars aih-chain-bars"></div>';
    NX.step = C[0].steps.length;
    $$("[data-c]", m).forEach(function(b){ b.addEventListener("click", function(){ $$("[data-c]", m).forEach(function(x){ x.classList.toggle("on", x === b); }); NX.chainK = +b.getAttribute("data-c"); chainDraw(); }); });
    $(".cs", m).addEventListener("input", function(){ NX.step = +this.value; chainDraw(); });
    m.querySelector("[data-a='play']").addEventListener("click", function(){
      var btn = this;
      if (NX.loop){ NX.loop.stop(); NX.loop = null; btn.textContent = "▶"; return; }
      btn.textContent = "⏸"; NX.step = 0; chainDraw();
      NX.loop = U.tickLoop(function(){
        if (!U.paneOn("ai-next")){ NX.loop = null; btn.textContent = "▶"; return false; }
        NX.step++; chainDraw();
        if (NX.step >= DATA.gpt2.chains[NX.chainK].steps.length){ NX.loop = null; btn.textContent = "▶"; return false; }
      }, 900);
    });
  }
  function chainDraw(){
    var m = $("#aihChain"); if (!m) return;
    var c = DATA.gpt2.chains[NX.chainK], n = c.steps.length, s = Math.min(NX.step, n);
    $(".cs", m).value = s; $(".cso", m).textContent = "ก้าว " + s + "/" + n;
    var txt = '<span class="p">' + esc(c.prompt) + "</span>";
    for (var i = 0; i < s; i++) txt += '<span class="' + (i === s - 1 ? "now" : "k") + '">' + flowTok(c.steps[i].pick) + "</span>";
    if (s < n) txt += ' <span style="color:var(--ink-soft)">▁</span>';
    $(".aih-chain-text", m).innerHTML = txt;
    var st = c.steps[Math.min(s, n - 1)], idx = s === 0 ? 0 : s - 1, cur = c.steps[idx];
    var label = s === 0 ? "ก้าวแรก — ตัวเลือก 8 อันดับแรก:" : "ก้าวที่ " + s + " — ตัวเลือก 8 อันดับแรก (ตัวที่ถูกเลือก = <b>" + tokHtml(cur.pick) + "</b>, P = " + pct(cur.pPick) + "):";
    var dist = s === 0 ? c.steps[0] : cur;
    $(".aih-chain-bars", m).innerHTML = '<div class="aih-note" style="margin-bottom:4px">' + label + "</div>" + dist.top.map(function(t){
      var picked = s > 0 && t.t === cur.pick;
      return '<div class="aih-bar' + (picked ? " first" : "") + '"><span class="t">' + tokHtml(t.t) + '</span><div class="tr"><div class="f" style="width:' + (t.p*100/dist.top[0].p*0.9) + '%"></div></div><span class="v">' + pct(t.p) + '</span><span class="c">' + (picked ? "← เลือก" : "") + "</span></div>";
    }).join("");
  }
  AIH.register("ai-next", {
    build: nxBuild,
    draw: function(){ nxDraw(); chainDraw(); },
    pause: function(){ if (NX.loop){ NX.loop.stop(); NX.loop = null; var b = $("#aihChain [data-a='play']"); if (b) b.textContent = "▶"; } }
  });

  /* =====================================================================
     หัวข้อ 8 — ฝึก ChatGPT 3 ขั้น
     ===================================================================== */
  var TR_STAGES = [
    { t: "Pretraining — อ่านทั้งอินเทอร์เน็ต", d: "ทายโทเคนถัดไปจากข้อความมหาศาล (เว็บ หนังสือ โค้ด) ทีละโทเคน เป็นล้านล้านครั้ง", o: "ได้ \"โมเดลพื้นฐาน\" — รู้ภาษาและความรู้โลก แต่แค่ต่อข้อความ",
      det: "<b>ข้อมูล:</b> ข้อความที่ไม่ต้องมีคนติดป้าย เพราะ \"คำเฉลย\" คือคำถัดไปในข้อความนั้นเอง · GPT-3 ใช้ 300,000 ล้านโทเคน · Llama 3 ใช้มากกว่า 15 ล้านล้านโทเคน<br><b>เป้าหมาย:</b> ทายโทเคนถัดไปให้แม่นที่สุด (loss เดียวกับหัวข้อ 2 แต่ใช้กับข้อความ) · <b>ค่าใช้จ่าย:</b> ขั้นนี้กินเวลาและพลังคำนวณเกือบทั้งหมดของการสร้างโมเดล",
      ex: [["ข้อมูล", "กรุงเทพมหานครเป็นเมืองหลวงของ___", ""], ["เฉลย", "ประเทศไทย", "good"]] },
    { t: "SFT — เรียนจากตัวอย่างที่คนเขียน", d: "คนเขียนคำถาม + คำตอบที่ดีเป็นตัวอย่าง แล้วฝึกต่อให้โมเดลตอบแบบนั้น", o: "โมเดลเริ่ม \"ทำตามคำสั่ง\" และตอบเป็นเรื่องเป็นราว",
      det: "<b>ข้อมูล:</b> InstructGPT ใช้คำถามราว 13,000 ข้อพร้อมคำตอบที่ผู้ติดป้ายเขียนเอง (supervised fine-tuning)<br><b>เป้าหมาย:</b> ยังคงเป็นการทายโทเคนถัดไป แต่ทายบน \"บทสนทนาที่ดี\" จึงเปลี่ยนนิสัยจากการต่อข้อความเว็บ เป็นการตอบคำถาม",
      ex: [["คำถาม", "2+2 เท่ากับเท่าไร", ""], ["ตัวอย่างที่คนเขียน", "2+2 = 4 ครับ", "good"]] },
    { t: "RLHF — ให้คนให้คะแนน", d: "โมเดลตอบหลายแบบ คนจัดอันดับว่าแบบไหนดีกว่า แล้วฝึกโมเดลให้ได้คะแนนสูงขึ้น", o: "ตอบตรงใจ ปลอดภัย และเป็นประโยชน์ขึ้น",
      det: "<b>ข้อมูล:</b> InstructGPT ให้คนจัดอันดับคำตอบของคำถามราว 33,000 ข้อ เพื่อฝึก <b>reward model</b> (โมเดลให้คะแนน) แล้วใช้ reinforcement learning (PPO) กับคำถามอีกราว 31,000 ข้อ ปรับโมเดลหลักให้ได้คะแนนสูง<br><b>ผล:</b> คนชอบคำตอบของ InstructGPT ขนาด 1,300 ล้านพารามิเตอร์ มากกว่า GPT-3 ขนาด 175,000 ล้าน · ปัจจุบันมีวิธีตระกูลเดียวกันอีกหลายแบบ เช่น DPO และการให้ AI ช่วยให้คะแนนตามหลักการที่เขียนไว้ (Constitutional AI)",
      ex: [["คำตอบ A", "4", "good"], ["คำตอบ B", "2+2 is a number that is used to represent…", "bad"], ["คนเลือก", "A ดีกว่า B → ให้รางวัลแบบ A", ""]] }
  ];
  var TRS = { k: 0 };
  function trBuild(){
    var m = $("#aihTrainFlow");
    if (m){
      m.innerHTML = '<div class="aih-flow">' + TR_STAGES.map(function(s, i){
        return (i ? '<div class="arr">➜</div>' : "") + '<div class="aih-stagecard' + (i ? "" : " on") + '" data-k="' + i + '"><h4><span class="no">' + (i + 1) + "</span>" + esc(s.t) + "</h4><p>" + esc(s.d) + '</p><div class="out">→ ' + esc(s.o) + "</div></div>";
      }).join("") + '</div><div class="aih-stagedet"></div>';
      $$(".aih-stagecard", m).forEach(function(c){ c.addEventListener("click", function(){ TRS.k = +c.getAttribute("data-k"); $$(".aih-stagecard", m).forEach(function(x){ x.classList.toggle("on", x === c); }); trDet(); }); });
      trDet();
    }
    var b = $("#aihTrainBase");
    if (b){
      var CM = ["ไม่ได้ตอบว่า 4 — แต่แต่งนิยามมั่ว ๆ ของ \"2+2\" แล้วเริ่มคำถามข้อใหม่เอง", "ตอบว่าเมืองหลวงของไทยคือ \"Thaksin\" (ชื่อคน!) แล้ววนถามคำถามเดิมซ้ำ — ต่อข้อความให้ \"ดูเหมือน\" หน้าถาม-ตอบบนเว็บ", "ไม่ได้แต่งกลอน แต่พิมพ์ประโยคเดิมซ้ำไม่รู้จบ — อาการวนซ้ำของการเลือกคำที่ชัวร์สุดทุกก้าว"];
      b.innerHTML = '<div class="aih-base">' + DATA.gpt2.base.map(function(x, i){
        return '<div class="aih-basecard"><div class="aih-note">ป้อนให้ GPT-2:</div><div class="q">' + esc(x.prompt) + '</div><div class="aih-note">GPT-2 เขียนต่อ (28 โทเคน):</div><div class="a">' + esc(x.cont) + '</div><div class="cm">' + esc(CM[i] || "") + '</div><div class="aih-note">5 ตัวเลือกแรกของโทเคนแรก:</div><div class="nx">' + x.next.slice(0, 5).map(function(t){ return "<span>" + tokHtml(t.t) + " " + pct(t.p) + "</span>"; }).join("") + "</div></div>";
      }).join("") + "</div>";
    }
  }
  function trDet(){
    var m = $("#aihTrainFlow"); if (!m) return;
    var s = TR_STAGES[TRS.k];
    $(".aih-stagedet", m).innerHTML = "<b>ขั้นที่ " + (TRS.k + 1) + ": " + esc(s.t) + "</b><br>" + s.det +
      '<div class="aih-ex">' + s.ex.map(function(r){ return '<span class="r">' + esc(r[0]) + '</span><span class="bub ' + r[2] + '">' + esc(r[1]) + "</span>"; }).join("") + "</div>";
  }
  function trChart(){
    var box = $("#aihTrainData"); if (!box || !window.Plot) return;
    var P = pal(), W = Math.max(300, box.clientWidth || 700);
    var rows = [
      { m: "GPT-3 (2563)", t: 300e9 }, { m: "Chinchilla (2565)", t: 1.4e12 }, { m: "LLaMA (2566)", t: 1.4e12 },
      { m: "Llama 2 (2566)", t: 2e12 }, { m: "Llama 3 (2567)", t: 15e12 }
    ];
    var fmtT = function(v){ return v >= 1e12 ? (v/1e12).toLocaleString("en-US", { maximumFractionDigits: 1 }) + " ล้านล้าน" : (v/1e9).toLocaleString("en-US") + " พันล้าน"; };
    var fig = Plot.plot({ width: W, height: 250, marginLeft: 130, marginRight: 110, style: U.plotStyle(P),
      x: { type: "log", label: "จำนวนโทเคนที่ใช้ฝึก (สเกล log) →", tickFormat: "~s", grid: true, domain: [1e11, 3e13] },
      y: { label: null, domain: rows.map(function(r){ return r.m; }) },
      marks: [
        Plot.barX(rows, { y: "m", x1: 1e11, x2: "t", fill: function(d){ return d.t >= 1e13 ? P.red : P.green; }, fillOpacity: 0.85, rx: 3 }),
        Plot.text(rows, { y: "m", x: "t", text: function(d){ return fmtT(d.t) + " โทเคน"; }, dx: 6, textAnchor: "start", fill: P.ink, fontSize: 12 })
      ] });
    box.innerHTML = ""; box.appendChild(fig);
  }
  AIH.register("ai-train", { build: trBuild, draw: trChart });

  /* =====================================================================
     หัวข้อ 9 — Diffusion (โมเดลจิ๋วที่ฝึกเอง รันจริงในเบราว์เซอร์)
     ===================================================================== */
  var DF = null;
  function dfModel(){
    if (DF) return DF;
    var d = DATA.diff;
    DF = { T: d.T, abar: d.abar, beta: d.beta, NF: d.NF, NT: d.NT, S: d.sizes, W: d.W.map(U.f32), B: d.B.map(U.f32), segs: d.segs,
           frames: null, t: d.T, loop: null, arrows: false, guide: false, N: 700, fwdT: 20 };
    DF.inp = new Float32Array(DF.S[0]); DF.buf = DF.S.map(function(n){ return new Float32Array(n); });
    return DF;
  }
  /* ตัวทำนายสัญญาณรบกวน ε(x, y, t) — ต้องคำนวณแบบเดียวกับตอนฝึกเป๊ะ (train-diffusion.mjs) */
  function dfEps(x, y, tt){
    var f = DF.inp, o = 0, k;
    f[o++] = x; f[o++] = y;
    for (k = 0; k < DF.NF; k++){ var w = Math.pow(2, k*0.5)*1.5; f[o++] = Math.sin(w*x); f[o++] = Math.cos(w*x); f[o++] = Math.sin(w*y); f[o++] = Math.cos(w*y); }
    for (k = 0; k < DF.NT/2; k++){ var w2 = Math.exp(-Math.log(1000)*k/(DF.NT/2)); f[o++] = Math.sin(tt*w2*20); f[o++] = Math.cos(tt*w2*20); }
    var a = f;
    for (var l = 0; l < 4; l++){
      var nin = DF.S[l], nout = DF.S[l + 1], W = DF.W[l], z = DF.buf[l + 1];
      for (var j = 0; j < nout; j++) z[j] = DF.B[l][j];
      for (var i = 0; i < nin; i++){ var ai = a[i]; if (!ai) continue; var r = i*nout; for (j = 0; j < nout; j++) z[j] += ai*W[r + j]; }
      if (l < 3) for (j = 0; j < nout; j++) if (z[j] < 0) z[j] = 0;
      a = z;
    }
    return a;
  }
  function gauss(){ var u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
  function dfRun(){
    dfModel();
    if (DF.loop){ DF.loop.stop(); DF.loop = null; }
    var N = DF.N, T = DF.T, x = new Float32Array(N*2);
    for (var i = 0; i < N*2; i++) x[i] = gauss();
    DF.frames = new Array(T + 1); DF.frames[T] = Float32Array.from(x); DF.t = T; dfDraw();
    var t = T;
    DF.loop = U.tickLoop(function(){
      if (!U.paneOn("ai-diffusion")){ DF.loop = null; return false; }
      var c = DF.beta[t]/Math.sqrt(1 - DF.abar[t]), sb = 1/Math.sqrt(1 - DF.beta[t]);
      var sig = t > 1 ? Math.sqrt(DF.beta[t]*(1 - DF.abar[t - 1])/(1 - DF.abar[t])) : 0;
      for (var k = 0; k < N; k++){
        var e = dfEps(x[k*2], x[k*2 + 1], t/T);
        x[k*2] = (x[k*2] - c*e[0])*sb + (sig ? sig*gauss() : 0);
        x[k*2 + 1] = (x[k*2 + 1] - c*e[1])*sb + (sig ? sig*gauss() : 0);
      }
      t--; DF.frames[t] = Float32Array.from(x); DF.t = t; dfDraw();
      if (t <= 0){ DF.loop = null; return false; }
    }, 55);
  }
  function dfBuild(){
    dfModel();
    var m = $("#aihDiff"); if (!m) return;
    m.innerHTML = '<div class="aih-ctl"><button type="button" class="tl-btn on" data-a="go">▶ สร้างใหม่</button>' +
      '<label class="aih-range">ก้าว <input type="range" class="ds" min="0" max="' + DF.T + '" value="' + DF.T + '" style="width:220px"><output class="dso"></output></label>' +
      '<button type="button" class="aih-chip" data-a="arr">ลูกศรทิศทาง</button><button type="button" class="aih-chip" data-a="guide">แสดงรูปต้นแบบ</button></div>' +
      '<div class="aih-diff"><div class="aih-stage"><canvas></canvas></div><div class="aih-diff-side aih-note"></div></div>';
    m.querySelector("[data-a='go']").addEventListener("click", dfRun);
    $(".ds", m).addEventListener("input", function(){ if (!DF.frames) return; if (DF.loop){ DF.loop.stop(); DF.loop = null; } var v = +this.value; while (v < DF.T && !DF.frames[v]) v++; DF.t = v; dfDraw(); });
    m.querySelector("[data-a='arr']").addEventListener("click", function(){ DF.arrows = !DF.arrows; this.classList.toggle("on", DF.arrows); dfDraw(); });
    m.querySelector("[data-a='guide']").addEventListener("click", function(){ DF.guide = !DF.guide; this.classList.toggle("on", DF.guide); dfDraw(); });
    fwdBuild(); realBuild();
  }
  function dfDraw(){
    var m = $("#aihDiff"); if (!m || !DF) return;
    var cv = $("canvas", m), W = Math.max(260, Math.min(560, cv.parentNode.clientWidth)), g = U.canvasFit(cv, W, W);
    g.fillStyle = ST.bg; g.fillRect(0, 0, W, W);
    var R = 2.3, sx = function(v){ return (v + R)/(2*R)*W; }, sy = function(v){ return (R - v)/(2*R)*W; };
    g.strokeStyle = "rgba(232,240,246,.07)"; g.lineWidth = 1;
    for (var q = -2; q <= 2; q++){ g.beginPath(); g.moveTo(sx(q), 0); g.lineTo(sx(q), W); g.stroke(); g.beginPath(); g.moveTo(0, sy(q)); g.lineTo(W, sy(q)); g.stroke(); }
    if (DF.guide){ g.strokeStyle = "rgba(255,201,74,.45)"; g.lineWidth = 6; g.lineCap = "round"; DF.segs.forEach(function(s){ g.beginPath(); g.moveTo(sx(s[0]), sy(s[1])); g.lineTo(sx(s[2]), sy(s[3])); g.stroke(); }); }
    var t = DF.t;
    if (DF.arrows && t > 0){
      g.strokeStyle = "rgba(255,201,74,.8)"; g.lineWidth = 1.3;
      var sc = Math.sqrt(1 - DF.abar[t]);
      for (var gx = -2; gx <= 2.001; gx += 0.25) for (var gy = -2; gy <= 2.001; gy += 0.25){
        var e = dfEps(gx, gy, t/DF.T), dx = -e[0]*sc*0.35, dy = -e[1]*sc*0.35, L = Math.hypot(dx, dy);
        if (L > 0.22){ dx *= 0.22/L; dy *= 0.22/L; }
        var x0 = sx(gx), y0 = sy(gy), x1 = sx(gx + dx), y1 = sy(gy + dy), an = Math.atan2(y1 - y0, x1 - x0);
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineTo(x1 - 4*Math.cos(an - 0.5), y1 - 4*Math.sin(an - 0.5)); g.moveTo(x1, y1); g.lineTo(x1 - 4*Math.cos(an + 0.5), y1 - 4*Math.sin(an + 0.5)); g.stroke();
      }
    }
    var fr = DF.frames && DF.frames[t];
    if (fr){
      g.fillStyle = "rgba(125,211,252,.85)";
      for (var k = 0; k < DF.N; k++){ var X = sx(fr[k*2]), Y = sy(fr[k*2 + 1]); if (X < -4 || Y < -4 || X > W + 4 || Y > W + 4) continue; g.beginPath(); g.arc(X, Y, 2.1, 0, Math.PI*2); g.fill(); }
    }
    g.fillStyle = ST.soft; g.font = "600 12px " + pal().font; g.textAlign = "left";
    g.fillText(fr ? "ก้าว t = " + t + (t === DF.T ? " (สุ่มล้วน)" : t === 0 ? " (เสร็จ)" : "") : "กด ▶ สร้างใหม่", 12, 20);
    $(".ds", m).value = t; $(".dso", m).textContent = t;
    var noise = Math.sqrt(1 - DF.abar[t]);
    $(".aih-diff-side", m).innerHTML = "<b style='color:var(--ink)'>ตอนนี้:</b> ก้าว " + t + " จาก " + DF.T + "<br>สัดส่วนสัญญาณรบกวน √(1−ᾱₜ) = <b style='color:var(--ink)'>" + noise.toFixed(2) + "</b><br>สัดส่วนภาพจริง √ᾱₜ = <b style='color:var(--ink)'>" + Math.sqrt(DF.abar[t]).toFixed(2) + "</b><br><br>" +
      "ทุกก้าว โมเดลรับ (ตำแหน่งจุด, เลขก้าว) แล้วทาย <b>ε</b> = สัญญาณรบกวนที่ \"น่าจะ\" ปนอยู่ จากนั้นใช้สูตร DDPM:<br><code>x ← (x − βₜ/√(1−ᾱₜ)·ε) / √(1−βₜ) + σₜ·z</code><br>ตัว <code>σₜ·z</code> คือความสุ่มที่เติมกลับนิดหน่อย ทำให้ได้ผลใหม่ทุกครั้ง<br><br>" +
      "ช่วงแรก (t สูง) โมเดลแค่ดึงทุกจุดเข้าหา \"ทรงโดยรวม\" · ช่วงท้าย (t ต่ำ) ค่อยเกลารายละเอียดให้ชิดเส้น — เปิดลูกศรแล้วเลื่อนก้าวเทียบกันดู";
  }
  /* ขาไป: ภาพวาดด้วยโค้ด + สัญญาณรบกวน ตามสูตรเดียวกับที่ใช้ฝึก */
  var FW = { img: null, eps: null, n: 96 };
  function fwdScene(){
    var n = FW.n, c = document.createElement("canvas"); c.width = c.height = n;
    var g = c.getContext("2d"), sky = g.createLinearGradient(0, 0, 0, n);
    sky.addColorStop(0, "#1b4f9c"); sky.addColorStop(0.6, "#f29f58"); sky.addColorStop(1, "#f7d488");
    g.fillStyle = sky; g.fillRect(0, 0, n, n);
    g.fillStyle = "#fff3c4"; g.beginPath(); g.arc(n*0.68, n*0.5, n*0.13, 0, Math.PI*2); g.fill();
    g.fillStyle = "#2d3a5a"; g.beginPath(); g.moveTo(0, n*0.78); g.lineTo(n*0.25, n*0.48); g.lineTo(n*0.45, n*0.72); g.lineTo(n*0.62, n*0.55); g.lineTo(n, n*0.82); g.lineTo(n, n); g.lineTo(0, n); g.fill();
    g.fillStyle = "#16203a"; g.fillRect(0, n*0.86, n, n*0.14);
    g.fillStyle = "#ffffff"; g.font = "800 " + Math.round(n*0.2) + "px Archivo, sans-serif"; g.textAlign = "center"; g.fillText("AI", n*0.3, n*0.3);
    var d = g.getImageData(0, 0, n, n).data, x = new Float32Array(n*n*3), e = new Float32Array(n*n*3);
    for (var i = 0; i < n*n; i++) for (var ch = 0; ch < 3; ch++){ x[i*3 + ch] = d[i*4 + ch]/127.5 - 1; e[i*3 + ch] = gauss(); }
    FW.img = x; FW.eps = e;
  }
  function fwdPaint(cv, t){
    var n = FW.n, a = Math.sqrt(DF.abar[t]), b = Math.sqrt(1 - DF.abar[t]);
    cv.width = cv.height = n;
    var g = cv.getContext("2d"), im = g.createImageData(n, n);
    for (var i = 0; i < n*n; i++){ for (var ch = 0; ch < 3; ch++){ var v = a*FW.img[i*3 + ch] + b*FW.eps[i*3 + ch]; im.data[i*4 + ch] = Math.max(0, Math.min(255, Math.round((v + 1)*127.5))); } im.data[i*4 + 3] = 255; }
    g.putImageData(im, 0, 0);
  }
  function fwdBuild(){
    var m = $("#aihDiffFwd"); if (!m) return;
    fwdScene();
    m.innerHTML = '<div class="aih-ctl"><label class="aih-range">ก้าว t <input type="range" class="ft" min="0" max="' + DF.T + '" value="' + DF.fwdT + '" style="width:200px"><output class="fto"></output></label></div>' +
      '<div class="aih-fwd"><canvas class="fc"></canvas></div><div class="aih-fwd-strip">' + [0, 10, 20, 30, 40, 50].map(function(t){ return "<figure><canvas data-t='" + t + "'></canvas>t = " + t + "</figure>"; }).join("") + "</div>";
    $(".ft", m).addEventListener("input", function(){ DF.fwdT = +this.value; fwdDraw(); });
    $$(".aih-fwd-strip canvas", m).forEach(function(c){ fwdPaint(c, +c.getAttribute("data-t")); c.style.cursor = "pointer"; c.addEventListener("click", function(){ DF.fwdT = +c.getAttribute("data-t"); $(".ft", m).value = DF.fwdT; fwdDraw(); }); });
    fwdDraw();
  }
  function fwdDraw(){
    var m = $("#aihDiffFwd"); if (!m) return;
    fwdPaint($(".fc", m), DF.fwdT);
    $(".fto", m).innerHTML = DF.fwdT + " · ภาพจริง " + Math.round(Math.sqrt(DF.abar[DF.fwdT])*100) + "%";
  }
  function realBuild(){
    var m = $("#aihDiffReal"); if (!m) return;
    m.innerHTML = '<table class="aih-cmp"><thead><tr><th></th><th>โมเดลจิ๋วในหน้านี้</th><th>Stable Diffusion v1 (ตัวอย่างของจริง)</th></tr></thead><tbody>' +
      "<tr><td>สิ่งที่สร้าง</td><td>จุด 2 มิติ (x, y) 700 จุด</td><td>ภาพ 512×512 สี = 786,432 ค่า แต่คำนวณในพื้นที่ย่อ (latent) 64×64×4 = 16,384 ค่า</td></tr>" +
      "<tr><td>ตัวทายสัญญาณรบกวน</td><td>MLP 23,714 น้ำหนัก</td><td>U-Net ราว 860 ล้านน้ำหนัก</td></tr>" +
      "<tr><td>สั่งด้วยข้อความ</td><td>ไม่ได้ — สร้างได้แค่ \"AI\"</td><td>ได้ — ข้อความผ่านตัวเข้ารหัส CLIP (123 ล้านน้ำหนัก) แล้วป้อนเข้า U-Net ทาง cross-attention (กลไกเดียวกับหัวข้อ 5)</td></tr>" +
      "<tr><td>ข้อมูลฝึก</td><td>จุดบนเส้นตัวอักษร (สร้างเอง)</td><td>ภาพพร้อมคำบรรยายจากเว็บจำนวนมาก (ชุด LAION)</td></tr>" +
      "<tr><td>ก้าวตอนสร้าง</td><td>50</td><td>ราว 20–50 ด้วยตัวสุ่มแบบเร็ว (เช่น DDIM) แทน 1,000</td></tr>" +
      "</tbody></table>" +
      '<p class="aih-note" style="margin-top:10px">หลักการเหมือนกันทุกอย่าง: เริ่มจากสัญญาณรบกวน → ทาย ε → ลบออกทีละก้าว · ต่างกันแค่ขนาด ข้อมูล และการสั่งด้วยข้อความ — ตัวเลข Stable Diffusion จาก model card ของ CompVis/stable-diffusion</p>';
  }
  AIH.register("ai-diffusion", {
    build: function(){ dfBuild(); dfRun(); },
    draw: function(){ dfDraw(); },
    pause: function(){ if (DF && DF.loop){ DF.loop.stop(); DF.loop = null; } }
  });

  /* =====================================================================
     หัวข้อ 10 — ข้อจำกัด & AI ยุคใหม่
     ===================================================================== */
  function barsHtml(list, hi){
    var mx = 0; list.forEach(function(t){ mx = Math.max(mx, t.p); });
    return '<div class="aih-bars">' + list.map(function(t){
      var isH = hi && hi.indexOf((t.t || "").trim()) >= 0;
      return '<div class="aih-bar' + (isH ? " first" : "") + '" style="grid-template-columns:110px 1fr 58px"><span class="t">' + tokHtml(t.t) + '</span><div class="tr"><div class="f" style="width:' + (t.p/mx*100) + '%"></div></div><span class="v">' + pct(t.p) + "</span></div>";
    }).join("") + "</div>";
  }
  function limBuild(){
    var L = DATA.gpt2.limits;
    var mm = $("#aihLimMars");
    if (mm) mm.innerHTML = '<div class="aih-lim-q">' + esc(L.mars.prompt) + ' <span style="color:var(--ink-soft)">▁</span></div>' +
      '<div class="aih-note">5 ตัวเลือกแรกของ GPT-2:</div>' + barsHtml(L.mars.next.slice(0, 5), ["Neil"]) +
      '<div class="aih-lim-a">GPT-2 เขียนต่อ: <i>“…astronaut<b>' + esc(L.mars.cont) + '</b>”</i><br>ความจริง: <b style="color:var(--green)">ยังไม่มีมนุษย์คนไหนเคยไปดาวอังคาร</b> — โมเดลเอาความรู้เรื่องดวงจันทร์ (Neil Armstrong, Apollo 11) มาตอบ เพราะในข้อมูลฝึก วลี "first person to walk on…" มักตามด้วยเรื่องดวงจันทร์ มันจึงเลือกคำที่ \"ฟังเข้ากัน\" ไม่ใช่คำที่ \"จริง\"</div>';
    var rm = $("#aihLimRag");
    if (rm){
      var np = L.namePos, show = ["Ying", "An", "Pr", "Th"];
      rm.innerHTML = '<div class="aih-rag">' +
        '<div><h5>ไม่มีเอกสาร — ใช้ความจำล้วน</h5><div class="aih-lim-q">' + esc(np.prompt) + ' ▁</div>' + barsHtml(np.noctx.watch, ["Ying"]) +
          '<div class="aih-lim-a">เขียนต่อ: <i>“Thailand\'s Prime Minister<b>' + esc(L.noctx.cont) + '</b>…”</i> — ยิ่งลักษณ์ ชินวัตร พ้นตำแหน่งตั้งแต่ปี 2557 แต่โมเดลรู้แค่ถึงข้อมูลฝึกราวปี 2560</div></div>' +
        '<div><h5>แปะข่าว 1 บรรทัดไว้หน้าคำถาม (RAG)</h5><div class="aih-lim-q"><span class="ctx">' + esc(L.rag.context) + "</span>" + esc(np.prompt) + ' ▁</div>' + barsHtml(np.rag.watch, ["An"]) +
          '<div class="aih-lim-a">เขียนต่อ: <i>“Thailand\'s Prime Minister<b>' + esc(L.rag.cont) + '</b>”</i> — โมเดลตัวเดิม น้ำหนักเดิม ไม่ได้ฝึกใหม่ แค่ attention ดึงชื่อจากข่าวที่แปะไว้มาใช้</div></div>' +
        '</div><p class="aih-note" style="margin-top:8px">แท่ง = ความน่าจะเป็นของโทเคนแรกของชื่อ ณ ตำแหน่งหลัง "Thailand\'s Prime Minister," (Ying = Yingluck · An = Anutin · Pr = Prayut · Th = Thaksin) — ระบบ RAG จริงจะ \"ค้นหา\" เอกสารที่เกี่ยวข้องจากคลังอัตโนมัติก่อนแปะ</p>';
    }
    agentBuild();
  }
  var AG_STEPS = [
    { n: 0, who: "ผู้ใช้", t: "<b>ราคาทองคำแท่งวันนี้เท่าไร ถ้าซื้อ 2 บาทต้องจ่ายเท่าไร</b>" },
    { n: 1, who: "คิด", t: "ราคาทองเปลี่ยนทุกวัน ความจำในโมเดลเก่าแล้ว → ต้องค้นข้อมูลล่าสุดก่อน" },
    { n: 2, who: "เครื่องมือ", t: "<code>ค้นเว็บ(\"ราคาทองคำแท่ง วันนี้ สมาคมค้าทองคำ\")</code>" },
    { n: 3, who: "ผลลัพธ์", t: "หน้าเว็บสมาคมค้าทองคำ: ราคาขายออกทองคำแท่ง = <b>P</b> บาท ต่อน้ำหนัก 1 บาท (+ เวลาที่ประกาศ)" },
    { n: 1, who: "คิด", t: "ได้ราคาแล้ว ต้องคูณ 2 — ใช้เครื่องคิดเลขดีกว่าคิดเอง (โมเดลภาษาคิดเลขพลาดได้)" },
    { n: 2, who: "เครื่องมือ", t: "<code>เครื่องคิดเลข(\"P × 2\")</code>" },
    { n: 3, who: "ผลลัพธ์", t: "<b>2P</b>" },
    { n: 4, who: "ตอบ", t: "ราคาขายออกวันนี้ <b>P</b> บาท/บาททองคำ ซื้อ 2 บาทรวม <b>2P</b> บาท (ยังไม่รวมค่ากำเหน็จถ้าเป็นทองรูปพรรณ) · ที่มา: สมาคมค้าทองคำ ประกาศเวลา …" }
  ];
  var AGS = { k: 0, loop: null };
  function agentBuild(){
    var m = $("#aihLimAgent"); if (!m) return;
    m.innerHTML = '<div class="aih-ctl"><button type="button" class="tl-btn on" data-a="play">▶ เล่นทีละขั้น</button><button type="button" class="tl-btn" data-a="next">ถัดไป</button><button type="button" class="tl-btn" data-a="reset">เริ่มใหม่</button></div>' +
      '<div class="aih-agent"><div class="aih-agent-svg"></div><div class="aih-log">' + AG_STEPS.map(function(s, i){ return '<div class="st" data-i="' + i + '"><b>' + (i + 1) + ". " + esc(s.who) + "</b><span>" + s.t + "</span></div>"; }).join("") + "</div></div>" +
      '<p class="aih-note" style="margin-top:8px">P = ราคาจริง ณ วันที่ค้น (ตัวอย่างนี้ไม่ได้ต่ออินเทอร์เน็ตจริง จึงไม่ใส่ตัวเลข เพื่อไม่ให้เข้าใจผิดว่าเป็นราคาจริง)</p>';
    function stop(){ if (AGS.loop){ AGS.loop.stop(); AGS.loop = null; m.querySelector("[data-a='play']").textContent = "▶ เล่นทีละขั้น"; } }
    AGS.stop = stop;
    m.querySelector("[data-a='next']").addEventListener("click", function(){ stop(); AGS.k = Math.min(AG_STEPS.length - 1, AGS.k + 1); agentDraw(); });
    m.querySelector("[data-a='reset']").addEventListener("click", function(){ stop(); AGS.k = 0; agentDraw(); });
    m.querySelector("[data-a='play']").addEventListener("click", function(){
      if (AGS.loop){ stop(); return; }
      this.textContent = "⏸ หยุด"; AGS.k = 0; agentDraw();
      AGS.loop = U.tickLoop(function(){ if (!U.paneOn("ai-limits")){ stop(); return false; } AGS.k++; agentDraw(); if (AGS.k >= AG_STEPS.length - 1){ stop(); return false; } }, 1500);
    });
    agentDraw();
  }
  function agentDraw(){
    var m = $("#aihLimAgent"); if (!m) return;
    var P = pal(), cur = AG_STEPS[AGS.k].n, W = 420, H = 300;
    var nodes = [{ x: 70, y: 60, t: "ผู้ใช้" }, { x: 210, y: 150, t: "คิด (LLM)" }, { x: 350, y: 60, t: "เรียกเครื่องมือ" }, { x: 350, y: 240, t: "อ่านผลลัพธ์" }, { x: 70, y: 240, t: "ตอบ" }];
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '"><defs><marker id="aihAg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + P.soft + '"/></marker></defs>';
    [[0, 1], [1, 2], [2, 3], [3, 1], [1, 4]].forEach(function(e){
      var a = nodes[e[0]], b = nodes[e[1]], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), s = 44;
      svg += '<line x1="' + (a.x + dx/L*s) + '" y1="' + (a.y + dy/L*s*0.6) + '" x2="' + (b.x - dx/L*s) + '" y2="' + (b.y - dy/L*s*0.6) + '" stroke="' + P.soft + '" stroke-width="1.6" marker-end="url(#aihAg)"/>';
    });
    nodes.forEach(function(n, i){
      var on = i === cur;
      svg += '<rect x="' + (n.x - 58) + '" y="' + (n.y - 22) + '" width="116" height="44" rx="12" fill="' + (on ? P.red : P.paper3) + '" stroke="' + (on ? P.red : P.rule) + '" stroke-width="1.5"/>' +
        '<text x="' + n.x + '" y="' + (n.y + 5) + '" text-anchor="middle" font-size="13.5" font-weight="700" fill="' + (on ? "#fff" : P.ink) + '">' + n.t + "</text>";
    });
    svg += '<text x="210" y="205" text-anchor="middle" font-size="11.5" fill="' + P.soft + '">วนได้หลายรอบจนกว่าจะพอ</text></svg>';
    $(".aih-agent-svg", m).innerHTML = svg;
    $$(".aih-log .st", m).forEach(function(s, i){ s.classList.toggle("on", i <= AGS.k); s.classList.toggle("cur", i === AGS.k); });
  }
  AIH.register("ai-limits", {
    build: limBuild,
    draw: function(){ agentDraw(); },
    pause: function(){ if (AGS.stop) AGS.stop(); }
  });
})();
