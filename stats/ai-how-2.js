/* =====================================================================
   หมวด "หลักการทำงาน AI" — หัวข้อ 3–6
   3 Token (ตัวตัดคำจริงของ OpenAI + BPE ทีละก้าว) · 4 Embedding (GloVe จริง)
   5 Attention (ค่าจริงของ GPT-2 small) · 6 MLP จำข้อเท็จจริง (ทดลองจริงกับ GPT-2)
   ต้องโหลดหลัง ai-how.js และ ai-how-data.js
   ===================================================================== */
(function(){
  "use strict";
  var AIH = window.AIH, U = AIH.util, DATA = window.AIH_DATA;
  var $ = U.$, $$ = U.$$, h = U.h, pal = U.pal, ST = U.ST, rgba = U.rgba, mix = U.mix, pct = U.pct, fmt = U.fmt, esc = U.esc;

  AIH.cssMore = (AIH.cssMore || []).concat([
    /* หัวข้อ 3 */
    ".aih-tok textarea{width:100%;min-height:92px;box-sizing:border-box;font:inherit;font-size:15px;line-height:1.6;padding:10px 12px;border-radius:12px;border:1px solid var(--rule);background:var(--paper-3);color:var(--ink);resize:vertical}",
    ".aih-tok-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:14px}",
    ".aih-tok-col h4{margin:0 0 8px;font-size:14px;color:var(--ink);display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}",
    ".aih-tok-col h4 small{font-weight:600;color:var(--ink-soft);font-size:12px}",
    ".aih-tok-col h4 .n{font-family:Archivo,sans-serif;font-size:22px;color:var(--red)}",
    ".aih-chips{display:flex;flex-wrap:wrap;gap:3px;line-height:1;padding:10px;border-radius:12px;border:1px solid var(--rule);background:var(--paper-2);min-height:60px}",
    ".aih-tk{position:relative;display:inline-block;padding:5px 5px 4px;border-radius:6px;font-size:15px;white-space:pre;color:#0A1822;cursor:default}",
    ".aih-tk.multi{outline:1.5px dashed rgba(0,0,0,.45);outline-offset:-2px}",
    ".aih-tk sup{font-size:9.5px;font-weight:800;margin-left:2px;color:rgba(0,0,0,.6)}",
    ".aih-tk.nl{flex-basis:100%;height:0;padding:0}",
    ".aih-bpe-vocab{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0 12px}",
    ".aih-bpe-vocab span{font-size:13px;padding:3px 8px;border-radius:6px;background:var(--green-soft);color:var(--ink);border:1px solid var(--rule)}",
    ".aih-bpe-vocab span.new{background:var(--gold);color:#1a1200;border-color:var(--gold)}",
    ".aih-bpe-words{display:flex;flex-wrap:wrap;gap:10px}",
    ".aih-bpe-w{display:flex;gap:2px;align-items:center;padding:6px 8px;border-radius:10px;border:1px solid var(--rule);background:var(--paper-2)}",
    ".aih-bpe-w small{font-size:11px;color:var(--ink-soft);margin-left:6px}",
    ".aih-bpe-w span{font-size:16px;padding:3px 6px;border-radius:5px;background:var(--paper-3);border:1px solid var(--rule);color:var(--ink)}",
    ".aih-bpe-w span.hit{background:var(--gold);color:#1a1200;border-color:var(--gold)}",
    ".aih-bpe-msg{font-size:13.5px;color:var(--ink-2);margin:4px 0 8px;min-height:22px}",
    /* หัวข้อ 4 */
    ".aih-emb-svg{width:100%;display:block}",
    ".aih-emb-svg text{font-family:'IBM Plex Sans Thai',system-ui,sans-serif}",
    ".aih-emb-svg .pt{cursor:pointer}",
    ".aih-calc{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:12px}",
    ".aih-calc select{font:inherit;font-size:13.5px;font-weight:700;padding:6px 10px;border-radius:10px;border:1px solid var(--rule);background:var(--paper-3);color:var(--ink)}",
    ".aih-calc .op{font-size:20px;font-weight:800;color:var(--ink-soft)}",
    ".aih-res{display:grid;gap:6px}",
    ".aih-res-row{display:grid;grid-template-columns:140px 1fr 52px;gap:8px;align-items:center;font-size:13px}",
    ".aih-res-row .bar{height:14px;border-radius:4px;background:var(--green)}",
    ".aih-res-row.top .bar{background:var(--red)}",
    ".aih-res-row .w{font-weight:700;color:var(--ink)} .aih-res-row .w small{font-weight:500;color:var(--ink-soft);margin-left:4px}",
    ".aih-res-row .v{font-family:Archivo,sans-serif;font-weight:700;color:var(--ink-2);text-align:right}",
    ".aih-strips{display:grid;gap:6px}",
    ".aih-strip{display:grid;grid-template-columns:118px 1fr 50px;gap:8px;align-items:center;font-size:12.5px}",
    ".aih-strip canvas{width:100%;height:26px;border-radius:4px;display:block;image-rendering:pixelated}",
    ".aih-strip .v{font-family:Archivo,sans-serif;font-weight:700;text-align:right;color:var(--ink-2)}",
    /* หัวข้อ 5 */
    ".aih-attn{display:grid;grid-template-columns:minmax(300px,1.1fr) minmax(260px,1fr);gap:18px;align-items:start}",
    ".aih-attn svg{width:100%;display:block}",
    ".aih-attn svg text{font-family:'IBM Plex Sans Thai',system-ui,sans-serif}",
    ".aih-hdesc{margin-top:10px;font-size:13px;line-height:1.7;color:var(--ink-2);padding:10px 12px;border-radius:10px;background:var(--paper-3);border:1px solid var(--rule)}",
    ".aih-lh{display:flex;gap:16px;flex-wrap:wrap;align-items:center}",
    /* หัวข้อ 6 */
    ".aih-mlp-foot{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:12px;font-size:13px;color:var(--ink-2)}",
    ".aih-mlp-foot .sp{display:inline-flex;gap:6px;align-items:center;padding:4px 10px;border-radius:999px;background:var(--paper-3);border:1px solid var(--rule)}",
    ".aih-mlp-foot .sp.tg{border-color:var(--gold);background:rgba(255,180,84,.16)}",
    ".aih-mlp-foot .sp b{font-family:Archivo,sans-serif}",
    "@media (max-width:900px){.aih-tok-cols,.aih-attn{grid-template-columns:1fr}}"
  ]);

  /* =====================================================================
     หัวข้อ 3 — Token
     ===================================================================== */
  var TOK_BASE = "https://cdn.jsdelivr.net/npm/gpt-tokenizer@4.0.0/esm/encoding/";
  var TK = { enc: null, loading: false, err: null };
  var TK_PRESET = [
    { n: "ไทย + อังกฤษ", t: "สวัสดีครับ วันนี้อากาศดีมาก\nHello, the weather is very nice today." },
    { n: "ภาษาไทยล้วน", t: "ปัญญาประดิษฐ์กำลังเปลี่ยนแปลงวิธีการทำงานของคนทั่วโลก" },
    { n: "English", t: "Artificial intelligence is changing the way people around the world work." },
    { n: "ตัวเลข & อีโมจิ", t: "ราคา 1,299 บาท 🎉🔥 โทร 02-123-4567 ปี 2569" },
    { n: "โค้ด", t: "function add(a, b) {\n  return a + b;\n}" }
  ];
  var TK_PAIR = { th: "ปัญญาประดิษฐ์กำลังเปลี่ยนแปลงวิธีการทำงานของคนทั่วโลก", en: "Artificial intelligence is changing the way people around the world work." };
  function tkLoad(){
    if (TK.enc || TK.loading) return;
    TK.loading = true;
    function imp(name){ return import(TOK_BASE + name + ".js"); }
    Promise.all([imp("r50k_base"), imp("o200k_base")]).then(function(ms){
      TK.enc = { r50: ms[0], o200: ms[1] }; TK.loading = false;
      var v = $("#aihTokVocab"); if (v && ms[1].vocabularySize) v.textContent = fmt(ms[1].vocabularySize);
      tkRatio(); tkRun();
    }).catch(function(e){
      TK.loading = false; TK.err = e;
      var m = $("#aihTok .aih-tok-cols"); if (m) m.innerHTML = '<div class="state-msg">โหลดตัวตัดคำจาก jsDelivr ไม่สำเร็จ (' + esc(e && e.message || e) + ') — ตรวจการเชื่อมต่ออินเทอร์เน็ตแล้วรีเฟรช</div>';
    });
  }
  /* รวมโทเคนที่ถอดรหัสเดี่ยว ๆ ไม่ได้ (ไบต์ย่อยของตัวอักษรไทย/อีโมจิ) เข้าเป็นกลุ่มจนอ่านออก */
  function tkPieces(enc, text){
    var ids = enc.encode(text), out = [], acc = [];
    for (var i = 0; i < ids.length; i++){
      acc.push(ids[i]);
      var s = enc.decode(acc);
      if (s.indexOf("�") >= 0 && acc.length < 6 && i < ids.length - 1) continue;
      out.push({ s: s, ids: acc.slice() }); acc = [];
    }
    return { n: ids.length, pieces: out };
  }
  var TK_COLORS = ["#A7E3F0", "#FFD6A5", "#CDB4FF", "#B9F3C3", "#FFB5C8", "#FFF1A8", "#A9C7FF", "#F6C6A0"];
  function tkRender(col, enc, text){
    var r = tkPieces(enc, text), html = "", ci = 0;
    r.pieces.forEach(function(p){
      var parts = p.s.split("\n");
      parts.forEach(function(seg, k){
        if (k > 0) html += '<span class="aih-tk nl"></span>';
        if (!seg) return;
        var multi = p.ids.length > 1;
        html += '<span class="aih-tk' + (multi ? " multi" : "") + '" style="background:' + TK_COLORS[ci % TK_COLORS.length] + '" title="' + (multi ? p.ids.length + " โทเคน: " : "โทเคน #") + p.ids.join(", ") + '">' +
                esc(seg).replace(/ /g, '<i class="aih-sp">·</i>') + (multi ? "<sup>×" + p.ids.length + "</sup>" : "") + "</span>";
      });
      ci++;
    });
    var chars = Array.from(text).length;
    col.querySelector(".n").textContent = fmt(r.n);
    col.querySelector(".cpt").textContent = r.n ? "เฉลี่ย " + (chars/r.n).toFixed(2) + " ตัวอักษร/โทเคน · " + fmt(chars) + " ตัวอักษร" : "";
    col.querySelector(".aih-chips").innerHTML = html || '<span class="aih-note">พิมพ์อะไรสักอย่าง</span>';
  }
  function tkRun(){
    var m = $("#aihTok"); if (!m || !TK.enc) return;
    var t = $("textarea", m).value;
    tkRender($(".c-r50", m), TK.enc.r50, t);
    tkRender($(".c-o200", m), TK.enc.o200, t);
  }
  function tkRatio(){
    if (!TK.enc) return;
    [["r50", "2"], ["o200", "4"]].forEach(function(p){
      var e = TK.enc[p[0]], th = e.encode(TK_PAIR.th).length, en = e.encode(TK_PAIR.en).length;
      var k = $("#aihTokRatio" + p[1]), s = $("#aihTokRatio" + p[1] + "s");
      if (k) k.innerHTML = "×" + (th/en).toFixed(1) + '<span class="u">เท่า</span>';
      if (s) s.textContent = "ไทย " + th + " โทเคน vs อังกฤษ " + en + " โทเคน (ประโยคความหมายเดียวกัน)";
    });
  }
  function tkBuild(){
    var m = $("#aihTok"); if (!m) return;
    m.innerHTML = '<div class="aih-tok">' +
      '<div class="aih-ctl"><span class="lab">ตัวอย่าง:</span>' + TK_PRESET.map(function(p, i){ return '<button type="button" class="aih-chip' + (i ? "" : " on") + '" data-i="' + i + '">' + esc(p.n) + "</button>"; }).join("") + "</div>" +
      '<textarea spellcheck="false" aria-label="ข้อความที่จะตัดเป็นโทเคน"></textarea>' +
      '<div class="aih-tok-cols">' +
        '<div class="aih-tok-col c-r50"><h4>GPT-2 · r50k_base <span class="n">–</span> <small>โทเคน</small> <small class="cpt"></small></h4><div class="aih-chips"><span class="aih-note">กำลังโหลดตัวตัดคำ…</span></div></div>' +
        '<div class="aih-tok-col c-o200"><h4>GPT-4o · o200k_base <span class="n">–</span> <small>โทเคน</small> <small class="cpt"></small></h4><div class="aih-chips"><span class="aih-note">กำลังโหลดตัวตัดคำ…</span></div></div>' +
      "</div></div>";
    var ta = $("textarea", m); ta.value = TK_PRESET[0].t;
    var tmr = 0; ta.addEventListener("input", function(){ clearTimeout(tmr); tmr = setTimeout(tkRun, 120); });
    $$("[data-i]", m).forEach(function(b){ b.addEventListener("click", function(){ $$("[data-i]", m).forEach(function(x){ x.classList.toggle("on", x === b); }); ta.value = TK_PRESET[+b.getAttribute("data-i")].t; tkRun(); }); });
    tkLoad();
    bpeBuild();
  }

  /* ---------- BPE ทีละก้าว บนคลังข้อความไทยเล็ก ๆ ---------- */
  var BPE_CORPUS = "กินข้าว กินข้าว กินข้าว กินน้ำ กินน้ำ กินขนม ข้าวผัด ข้าวผัด ข้าวมันไก่ ผัดไทย ผัดไทย ผัดไทย น้ำเปล่า น้ำแข็ง ขนมไทย ไก่ทอด ไก่ย่าง";
  var BP = { words: [], vocab: [], merges: [], last: null, loop: null };
  var COMB = /^[ัิ-ฺ็-๎]/;
  function bpeShow(s){ return COMB.test(s) ? "◌" + s : s; }
  function bpeReset(){
    var cnt = {};
    BPE_CORPUS.split(" ").forEach(function(w){ cnt[w] = (cnt[w] || 0) + 1; });
    BP.words = Object.keys(cnt).map(function(w){ return { w: w, n: cnt[w], t: Array.from(w) }; });
    var v = {}; BP.words.forEach(function(x){ x.t.forEach(function(c){ v[c] = 1; }); });
    BP.vocab = Object.keys(v); BP.merges = []; BP.last = null;
  }
  function bpeStep(){
    var pc = {}, order = [];
    BP.words.forEach(function(x){ for (var i = 0; i < x.t.length - 1; i++){ var k = x.t[i] + "\u0000" + x.t[i+1]; if (!(k in pc)){ pc[k] = 0; order.push(k); } pc[k] += x.n; } });
    var best = null; order.forEach(function(k){ if (!best || pc[k] > pc[best]) best = k; });
    if (!best || pc[best] < 2){ BP.last = { done: true }; return false; }
    var ab = best.split("\u0000"), a = ab[0], b = ab[1], nt = a + b;
    BP.words.forEach(function(x){ var o = []; for (var i = 0; i < x.t.length; ){ if (i < x.t.length - 1 && x.t[i] === a && x.t[i+1] === b){ o.push(nt); i += 2; } else { o.push(x.t[i]); i++; } } x.t = o; });
    BP.vocab.push(nt); BP.merges.push(nt); BP.last = { a: a, b: b, t: nt, n: pc[best] };
    return true;
  }
  function bpeDraw(){
    var m = $("#aihBpe"); if (!m) return;
    var L = BP.last;
    $(".aih-bpe-msg", m).innerHTML = !L ? "เริ่มต้น: ทุกคำถูกแยกเป็นตัวอักษรเดี่ยว — คลังโทเคนมี <b>" + BP.vocab.length + "</b> ตัว" :
      L.done ? "✔ ไม่มีคู่ไหนเจอเกิน 1 ครั้งแล้ว — จบที่คลังโทเคน <b>" + BP.vocab.length + "</b> ตัว (รวมไป " + BP.merges.length + " ครั้ง) สังเกตว่าได้คำอย่าง <b>ข้าว</b> <b>กิน</b> <b>ผัดไทย</b> มาเองโดยไม่มีใครสอนความหมาย" :
      "ก้าวที่ " + BP.merges.length + ": รวม <b>" + esc(bpeShow(L.a)) + "</b> + <b>" + esc(bpeShow(L.b)) + "</b> → <b>" + esc(bpeShow(L.t)) + "</b> (คู่นี้เจอ " + L.n + " ครั้ง มากที่สุดในคลัง)";
    $(".aih-bpe-vocab", m).innerHTML = BP.vocab.map(function(v){ return '<span' + (L && !L.done && v === L.t ? ' class="new"' : "") + ">" + esc(bpeShow(v)) + "</span>"; }).join("");
    $(".aih-bpe-words", m).innerHTML = BP.words.map(function(x){
      return '<div class="aih-bpe-w">' + x.t.map(function(t){ return "<span" + (L && !L.done && t === L.t ? ' class="hit"' : "") + ">" + esc(bpeShow(t)) + "</span>"; }).join("") + "<small>×" + x.n + "</small></div>";
    }).join("");
  }
  function bpeBuild(){
    var m = $("#aihBpe"); if (!m) return;
    m.innerHTML = '<div class="aih-ctl"><button type="button" class="tl-btn on" data-a="step">รวมคู่ถัดไป</button><button type="button" class="tl-btn" data-a="auto">▶ รวมอัตโนมัติจนจบ</button><button type="button" class="tl-btn" data-a="reset">เริ่มใหม่</button></div>' +
      '<div class="aih-bpe-msg"></div><div class="aih-note">คลังโทเคนตอนนี้:</div><div class="aih-bpe-vocab"></div><div class="aih-note" style="margin-bottom:6px">คำในคลังข้อความ (ตัวเลข = จำนวนครั้งที่พบ) หั่นด้วยโทเคนปัจจุบัน:</div><div class="aih-bpe-words"></div>';
    bpeReset(); bpeDraw();
    function stopAuto(){ if (BP.loop){ BP.loop.stop(); BP.loop = null; m.querySelector("[data-a='auto']").textContent = "▶ รวมอัตโนมัติจนจบ"; } }
    m.querySelector("[data-a='step']").addEventListener("click", function(){ stopAuto(); bpeStep(); bpeDraw(); });
    m.querySelector("[data-a='reset']").addEventListener("click", function(){ stopAuto(); bpeReset(); bpeDraw(); });
    m.querySelector("[data-a='auto']").addEventListener("click", function(){
      if (BP.loop){ stopAuto(); return; }
      if (BP.last && BP.last.done) bpeReset();
      this.textContent = "⏸ หยุด";
      BP.loop = U.tickLoop(function(){ if (!U.paneOn("ai-token")){ stopAuto(); return false; } var ok = bpeStep(); bpeDraw(); if (!ok){ stopAuto(); return false; } }, 650);
    });
    BP.stop = stopAuto;
  }
  AIH.register("ai-token", { build: tkBuild, draw: function(){}, pause: function(){ if (BP.stop) BP.stop(); } });

  /* =====================================================================
     หัวข้อ 4 — Embedding (GloVe 300 มิติจริง)
     ===================================================================== */
  var GV = null;
  function glove(){
    if (GV) return GV;
    var d = DATA.glove, q = new Int8Array(U.b64bytes(d.q8).buffer), D = d.dim, idx = {};
    var vecs = d.words.map(function(w, k){ var v = new Float32Array(D), s = d.scale[k], n = 0; for (var i = 0; i < D; i++){ v[i] = q[k*D + i]*s; n += v[i]*v[i]; } idx[w.w] = k; v.norm = Math.sqrt(n); return v; });
    GV = { D: D, words: d.words, vecs: vecs, idx: idx };
    return GV;
  }
  function cos(a, b){ var s = 0; for (var i = 0; i < a.length; i++) s += a[i]*b[i]; var na = a.norm || Math.sqrt(dot(a, a)), nb = b.norm || Math.sqrt(dot(b, b)); return s/(na*nb); }
  function dot(a, b){ var s = 0; for (var i = 0; i < a.length; i++) s += a[i]*b[i]; return s; }
  function nearest(v, k, excl){
    var ex = {}; (excl || []).forEach(function(w){ ex[w] = 1; });
    return GV.words.map(function(w, i){ return { w: w, c: cos(v, GV.vecs[i]) }; }).filter(function(x){ return !ex[x.w.w]; }).sort(function(a, b){ return b.c - a.c; }).slice(0, k);
  }
  function V(w){ return GV.vecs[GV.idx[w]]; }
  var GROUP_TH = { royal: "ครอบครัว/ราชวงศ์", capital: "ประเทศ/เมือง", animal: "สัตว์", food: "อาหาร", verb: "กริยา", adj: "คุณศัพท์", sport: "กีฬา", tech: "เทคโนโลยี", number: "ตัวเลข", color: "สี", job: "อาชีพ/สถานที่", time: "เวลา", misc: "ทั่วไป" };
  var GROUP_COL = { royal: "#E8590C", capital: "#1C7ED6", animal: "#2F9E44", food: "#F08C00", verb: "#9C36B5", adj: "#C2255C", sport: "#0CA678", tech: "#4263EB", number: "#868E96", color: "#E03131", job: "#5C940D", time: "#1098AD", misc: "#6741D9" };
  function pairsOf(list){ var a = []; for (var i = 0; i < list.length; i += 2) a.push([list[i], list[i+1]]); return a; }
  var EMB_SETS = [
    { id: "royal", n: "ชาย ↔ หญิง", pairs: pairsOf(["man","woman","king","queen","boy","girl","father","mother","prince","princess","son","daughter","husband","wife","uncle","aunt","actor","actress","brother","sister"]) },
    { id: "capital", n: "ประเทศ → เมืองหลวง", pairs: pairsOf(["thailand","bangkok","japan","tokyo","france","paris","china","beijing","germany","berlin","italy","rome","russia","moscow","vietnam","hanoi","england","london","egypt","cairo","spain","madrid","korea","seoul","greece","athens"]) },
    { id: "verb", n: "กริยา → รูปอดีต", pairs: pairsOf(["walk","walked","swim","swam","run","ran","go","went","eat","ate","write","wrote","see","saw","fly","flew"]) },
    { id: "adj", n: "คำคุณศัพท์ → ขั้นกว่า → ขั้นสุด", pairs: pairsOf(["big","bigger","bigger","biggest","small","smaller","smaller","smallest","good","better","better","best","fast","faster","faster","fastest","hot","hotter","hotter","hottest","cold","colder","colder","coldest"]) },
    { id: "cluster", n: "กลุ่มความหมาย", groups: ["animal", "food", "sport", "color", "number", "job"] },
    { id: "all", n: "ทั้งหมด 225 คำ", groups: null }
  ];
  var EM = { set: "royal", sel: null };
  function embWords(S){
    if (S.pairs){ var seen = {}, out = []; S.pairs.forEach(function(p){ p.forEach(function(w){ if (!seen[w] && GV.idx[w] != null){ seen[w] = 1; out.push(w); } }); }); return out; }
    return GV.words.filter(function(w){ return !S.groups || S.groups.indexOf(w.g) >= 0; }).map(function(w){ return w.w; });
  }
  /* PCA 2 แกนด้วย power iteration บนเวกเตอร์ที่ลบค่าเฉลี่ยแล้ว */
  function pca2(words){
    var D = GV.D, n = words.length, X = words.map(function(w){ return V(w); }), mu = new Float32Array(D), i, k;
    X.forEach(function(v){ for (i = 0; i < D; i++) mu[i] += v[i]/n; });
    var C = X.map(function(v){ var c = new Float32Array(D); for (i = 0; i < D; i++) c[i] = v[i] - mu[i]; return c; });
    function comp(prev){
      var v = new Float32Array(D); for (i = 0; i < D; i++) v[i] = Math.sin(i*1.7 + (prev ? 2 : 0.3));
      for (var it = 0; it < 120; it++){
        var nv = new Float32Array(D);
        C.forEach(function(c){ var s = dot(c, v); for (var j = 0; j < D; j++) nv[j] += s*c[j]; });
        if (prev){ var pr = dot(nv, prev); for (i = 0; i < D; i++) nv[i] -= pr*prev[i]; }
        var nn = Math.sqrt(dot(nv, nv)) || 1; for (i = 0; i < D; i++) nv[i] /= nn; v = nv;
      }
      return v;
    }
    var e1 = comp(null), e2 = comp(e1);
    return words.map(function(w, k2){ return { w: w, x: dot(C[k2], e1), y: dot(C[k2], e2) }; });
  }
  function embBuild(){
    glove();
    var m = $("#aihEmbedMap"); if (!m) return;
    m.innerHTML = '<div class="aih-ctl">' + EMB_SETS.map(function(s){ return '<button type="button" class="aih-chip' + (s.id === EM.set ? " on" : "") + '" data-s="' + s.id + '">' + esc(s.n) + "</button>"; }).join("") + '</div><div class="aih-emb-host"></div>';
    $$("[data-s]", m).forEach(function(b){ b.addEventListener("click", function(){ $$("[data-s]", m).forEach(function(x){ x.classList.toggle("on", x === b); }); EM.set = b.getAttribute("data-s"); embDraw(); }); });
    calcBuild(); stripBuild();
  }
  function embDraw(){
    var m = $("#aihEmbedMap"); if (!m || !GV) return;
    var P = pal(), S = EMB_SETS.filter(function(s){ return s.id === EM.set; })[0], words = embWords(S), pts = pca2(words);
    var host = $(".aih-emb-host", m), W = Math.max(320, host.clientWidth || 800), H = Math.round(Math.min(560, Math.max(380, W*0.55)));
    var xs = pts.map(function(p){ return p.x; }), ys = pts.map(function(p){ return p.y; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var pad = 50, sx = function(v){ return pad + (v - x0)/(x1 - x0 || 1)*(W - pad*2); }, sy = function(v){ return H - pad + 6 - (v - y0)/(y1 - y0 || 1)*(H - pad*2); };
    var at = {}; pts.forEach(function(p){ at[p.w] = p; });
    var small = words.length > 60, svg = '<svg class="aih-emb-svg" viewBox="0 0 ' + W + " " + H + '" height="' + H + '">';
    svg += '<defs><marker id="aihArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + P.red + '"/></marker></defs>';
    svg += '<rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="12" fill="' + P.paper3 + '" fill-opacity=".35" stroke="' + P.rule + '"/>';
    (S.pairs || []).forEach(function(p){
      var a = at[p[0]], b = at[p[1]]; if (!a || !b) return;
      var ax = sx(a.x), ay = sy(a.y), bx = sx(b.x), by = sy(b.y), L = Math.hypot(bx - ax, by - ay) || 1, sh = Math.min(10, L*0.2);
      svg += '<line x1="' + (ax + (bx - ax)/L*sh) + '" y1="' + (ay + (by - ay)/L*sh) + '" x2="' + (bx - (bx - ax)/L*sh) + '" y2="' + (by - (by - ay)/L*sh) + '" stroke="' + P.red + '" stroke-opacity=".55" stroke-width="1.8" marker-end="url(#aihArr)"/>';
    });
    pts.forEach(function(p){
      var w = GV.words[GV.idx[p.w]], col = S.pairs ? P.green : GROUP_COL[w.g] || P.green, x = sx(p.x), y = sy(p.y);
      svg += '<g class="pt" data-w="' + p.w + '"><circle cx="' + x + '" cy="' + y + '" r="' + (small ? 3.6 : 5) + '" fill="' + col + '" stroke="' + P.paper2 + '" stroke-width="1.5"/>' +
        '<text x="' + (x + 7) + '" y="' + (y - 5) + '" font-size="' + (small ? 10.5 : 13) + '" font-weight="700" fill="' + P.ink + '">' + esc(p.w) + "</text>" +
        (small ? "" : '<text x="' + (x + 7) + '" y="' + (y + 10) + '" font-size="11" fill="' + P.soft + '">' + esc(w.th) + "</text>") + "</g>";
    });
    if (!S.pairs){
      var gs = S.groups || Object.keys(GROUP_COL), lx = 14;
      gs.forEach(function(g){ svg += '<circle cx="' + (lx + 5) + '" cy="' + (H - 14) + '" r="5" fill="' + GROUP_COL[g] + '"/><text x="' + (lx + 14) + '" y="' + (H - 10) + '" font-size="11.5" fill="' + P.ink2 + '">' + GROUP_TH[g] + "</text>"; lx += 26 + GROUP_TH[g].length*8.2; });
    }
    svg += "</svg>";
    host.innerHTML = svg;
    var tip = U.tipOf(m);
    $$(".pt", host).forEach(function(g){
      g.addEventListener("mouseenter", function(e){
        var w = g.getAttribute("data-w"), nb = nearest(V(w), 6, [w]), me = GV.words[GV.idx[w]], r = U.relXY(e, m);
        tip.show("<b>" + esc(w) + "</b> · " + esc(me.th) + "<br><span style='opacity:.7'>ใกล้ที่สุดใน 300 มิติ:</span><br>" + nb.map(function(x){ return esc(x.w.w) + " <span style='opacity:.65'>(" + esc(x.w.th) + ")</span> " + x.c.toFixed(2); }).join("<br>"), r.x, r.y);
      });
      g.addEventListener("mouseleave", function(){ tip.hide(); });
    });
  }
  var CALC_PRESET = [["king","man","woman"], ["bangkok","thailand","japan"], ["walked","walk","swim"], ["bigger","big","small"], ["puppy","dog","cat"], ["paris","france","italy"], ["actress","actor","prince"]];
  function calcOptions(sel){
    var groups = {}; GV.words.forEach(function(w){ (groups[w.g] = groups[w.g] || []).push(w); });
    return Object.keys(groups).map(function(g){ return '<optgroup label="' + GROUP_TH[g] + '">' + groups[g].map(function(w){ return '<option value="' + w.w + '"' + (w.w === sel ? " selected" : "") + ">" + esc(w.w) + " · " + esc(w.th) + "</option>"; }).join("") + "</optgroup>"; }).join("");
  }
  function calcBuild(){
    var m = $("#aihEmbedCalc"); if (!m) return;
    m.innerHTML = '<div class="aih-ctl">' + CALC_PRESET.map(function(p, i){ return '<button type="button" class="aih-chip' + (i ? "" : " on") + '" data-p="' + i + '">' + p[0] + " − " + p[1] + " + " + p[2] + "</button>"; }).join("") + "</div>" +
      '<div class="aih-calc"><select class="a">' + calcOptions("king") + '</select><span class="op">−</span><select class="b">' + calcOptions("man") + '</select><span class="op">+</span><select class="c">' + calcOptions("woman") + '</select><span class="op">=</span></div><div class="aih-res"></div>';
    $$("select", m).forEach(function(s){ s.addEventListener("change", function(){ $$("[data-p]", m).forEach(function(x){ x.classList.remove("on"); }); calcRun(); }); });
    $$("[data-p]", m).forEach(function(b){ b.addEventListener("click", function(){ var p = CALC_PRESET[+b.getAttribute("data-p")]; $(".a", m).value = p[0]; $(".b", m).value = p[1]; $(".c", m).value = p[2]; $$("[data-p]", m).forEach(function(x){ x.classList.toggle("on", x === b); }); calcRun(); }); });
    calcRun();
  }
  function calcRun(){
    var m = $("#aihEmbedCalc"); if (!m) return;
    var a = $(".a", m).value, b = $(".b", m).value, c = $(".c", m).value, D = GV.D, q = new Float32Array(D);
    for (var i = 0; i < D; i++) q[i] = V(a)[i] - V(b)[i] + V(c)[i];
    var res = nearest(q, 5, [a, b, c]), mx = res[0].c;
    $(".aih-res", m).innerHTML = res.map(function(r, k){
      return '<div class="aih-res-row' + (k ? "" : " top") + '"><span class="w">' + esc(r.w.w) + "<small>" + esc(r.w.th) + '</small></span><div><div class="bar" style="width:' + Math.max(4, r.c/mx*100) + '%"></div></div><span class="v">' + r.c.toFixed(2) + "</span></div>";
    }).join("") + '<div class="aih-note" style="margin-top:4px">ตัวเลข = ความคล้ายแบบ cosine (1 = ทิศเดียวกันเป๊ะ)</div>';
  }
  var STRIP_SETS = [["king","queen","prince","man","woman","car"], ["dog","cat","puppy","tiger","rice","computer"], ["bangkok","tokyo","paris","thailand","monday","red"]];
  var STR = { k: 0 };
  function stripBuild(){
    var m = $("#aihEmbedStrip"); if (!m) return;
    m.innerHTML = '<div class="aih-ctl">' + STRIP_SETS.map(function(s, i){ return '<button type="button" class="aih-chip' + (i ? "" : " on") + '" data-k="' + i + '">' + s.slice(0, 3).join(", ") + "…</button>"; }).join("") + '</div><div class="aih-strips"></div>';
    $$("[data-k]", m).forEach(function(b){ b.addEventListener("click", function(){ $$("[data-k]", m).forEach(function(x){ x.classList.toggle("on", x === b); }); STR.k = +b.getAttribute("data-k"); stripDraw(); }); });
  }
  function stripDraw(){
    var m = $("#aihEmbedStrip"); if (!m || !GV) return;
    var P = pal(), ws = STRIP_SETS[STR.k], ref = V(ws[0]), mx = 0;
    ws.forEach(function(w){ var v = V(w); for (var i = 0; i < v.length; i++) mx = Math.max(mx, Math.abs(v[i])); });
    var host = $(".aih-strips", m); host.innerHTML = "";
    ws.forEach(function(w){
      var me = GV.words[GV.idx[w]], row = h("div", "aih-strip", '<span><b>' + esc(w) + '</b><br><small style="color:var(--ink-soft)">' + esc(me.th) + '</small></span><canvas></canvas><span class="v">' + cos(V(w), ref).toFixed(2) + "</span>");
      var cv = row.querySelector("canvas"), v = V(w); cv.width = v.length; cv.height = 1;
      var g = cv.getContext("2d"), im = g.createImageData(v.length, 1);
      for (var i = 0; i < v.length; i++){ var c = U.divColor(v[i]/(mx*0.6), P); im.data[i*4] = c[0]; im.data[i*4+1] = c[1]; im.data[i*4+2] = c[2]; im.data[i*4+3] = 255; }
      g.putImageData(im, 0, 0); host.appendChild(row);
    });
  }
  AIH.register("ai-embed", { build: embBuild, draw: function(){ embDraw(); stripDraw(); } });

  /* =====================================================================
     หัวข้อ 5 — Attention (GPT-2 small จริง 144 หัว)
     ===================================================================== */
  var AT = { s: 0, l: 4, h: 3, focus: -1, cache: {} };
  function attData(k){
    var s = DATA.gpt2.attention[k];
    if (!AT.cache[k]) AT.cache[k] = U.b64bytes(s.att);
    return s;
  }
  function att(k, l, hh, i, j){ var s = DATA.gpt2.attention[k], n = s.n; return AT.cache[k][((l*12 + hh)*n + i)*n + j]/255; }
  function argmax(a){ var b = 0; a.forEach(function(v, i){ if (v > a[b]) b = i; }); return b; }
  function notable(k){
    var s = attData(k), sc = s.score, out = [];
    var p = argmax(sc.prev); out.push({ l: Math.floor(p/12), h: p % 12, t: "มองคำก่อนหน้า" });
    if (s.itPos >= 0){ var c = argmax(sc.coref); out.push({ l: Math.floor(c/12), h: c % 12, t: "it → " + s.tokens[s.nounPos].trim() }); }
    if (s.id === "repeat"){ var d = argmax(sc.induct); out.push({ l: Math.floor(d/12), h: d % 12, t: "ลอกแบบ (induction)" }); }
    var q = argmax(sc.sink); out.push({ l: Math.floor(q/12), h: q % 12, t: "พักที่คำแรก" });
    return out;
  }
  function attBuild(){
    var m = $("#aihAttn"); if (!m) return;
    var sents = DATA.gpt2.attention;
    m.innerHTML = '<div class="aih-ctl"><span class="lab">ประโยค:</span>' + sents.map(function(s, i){ return '<button type="button" class="aih-chip' + (i ? "" : " on") + '" data-s="' + i + '">' + esc(s.text) + "</button>"; }).join("") + "</div>" +
      '<div class="aih-ctl aih-lh"><label class="aih-range">ชั้น <input type="range" class="al" min="0" max="11" value="' + AT.l + '"><output class="alo"></output></label>' +
      '<label class="aih-range">หัว <input type="range" class="ah" min="0" max="11" value="' + AT.h + '"><output class="aho"></output></label>' +
      '<span class="lab">หัวเด่น:</span><span class="aih-notable"></span></div>' +
      '<div class="aih-attn"><div class="aih-arc"></div><div><div class="aih-mat"></div><div class="aih-hdesc"></div></div></div>';
    $$("[data-s]", m).forEach(function(b){ b.addEventListener("click", function(){ $$("[data-s]", m).forEach(function(x){ x.classList.toggle("on", x === b); }); AT.s = +b.getAttribute("data-s"); AT.focus = -1; var n = notable(AT.s); AT.l = n[1].l; AT.h = n[1].h; attSync(); }); });   // n[1] = หัวเด่นประจำประโยค (it→คำนาม หรือ induction)
    $(".al", m).addEventListener("input", function(){ AT.l = +this.value; attSync(); });
    $(".ah", m).addEventListener("input", function(){ AT.h = +this.value; attSync(); });
    var gm = $("#aihAttnGrid"); if (gm){ gm.innerHTML = '<canvas class="aih-grid-cv" style="display:block;width:100%;cursor:pointer"></canvas>'; var cv = $("canvas", gm);
      cv.addEventListener("click", function(e){ var r = cv.getBoundingClientRect(), L = cv._lay; if (!L) return; var x = e.clientX - r.left - L.ox, y = e.clientY - r.top - L.oy; var hh = Math.floor(x/L.cs), ll = Math.floor(y/L.cs); if (hh >= 0 && hh < 12 && ll >= 0 && ll < 12){ AT.l = ll; AT.h = hh; attSync(); } });
      var tip = U.tipOf(gm);
      cv.addEventListener("mousemove", function(e){ var r = cv.getBoundingClientRect(), L = cv._lay; if (!L) return; var x = e.clientX - r.left - L.ox, y = e.clientY - r.top - L.oy, hh = Math.floor(x/L.cs), ll = Math.floor(y/L.cs); if (hh >= 0 && hh < 12 && ll >= 0 && ll < 12){ var s = DATA.gpt2.attention[AT.s].score, k = ll*12 + hh; tip.show("หัว <b>" + ll + "." + hh + "</b> (ชั้น " + ll + " หัว " + hh + ")<br>มองคำก่อนหน้า " + pct(s.prev[k], 0) + " · พักที่คำแรก " + pct(s.sink[k], 0), e.clientX - r.left, e.clientY - r.top); } else tip.hide(); });
      cv.addEventListener("mouseleave", function(){ tip.hide(); });
    }
    AT.l = 4; AT.h = 3;
  }
  function attSync(){
    var m = $("#aihAttn"); if (!m) return;
    $(".al", m).value = AT.l; $(".ah", m).value = AT.h;
    $(".alo", m).textContent = AT.l; $(".aho", m).textContent = AT.h;
    var nb = $(".aih-notable", m);
    nb.innerHTML = notable(AT.s).map(function(n){ return '<button type="button" class="aih-chip' + (n.l === AT.l && n.h === AT.h ? " on" : "") + '" data-l="' + n.l + '" data-h="' + n.h + '">' + n.l + "." + n.h + " · " + esc(n.t) + "</button>"; }).join(" ");
    $$("button", nb).forEach(function(b){ b.addEventListener("click", function(){ AT.l = +b.getAttribute("data-l"); AT.h = +b.getAttribute("data-h"); attSync(); }); });
    attDrawArc(); attDrawMat(); attDrawGrid(); attDesc();
  }
  function attDrawArc(){
    var m = $("#aihAttn"), host = $(".aih-arc", m), P = pal(), s = attData(AT.s), n = s.n;
    var W = Math.max(300, host.clientWidth || 500), rowH = 30, H = n*rowH + 40, xl = Math.min(150, W*0.32), xr = W - Math.min(150, W*0.32);
    var y = function(i){ return 30 + i*rowH; };
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" height="' + H + '">';
    svg += '<text x="' + (xl - 8) + '" y="14" text-anchor="end" font-size="11.5" fill="' + P.soft + '">มองจาก (Query)</text><text x="' + (xr + 8) + '" y="14" font-size="11.5" fill="' + P.soft + '">ถูกมอง (Key)</text>';
    for (var i = 0; i < n; i++){
      var dim = AT.focus >= 0 && AT.focus !== i;
      for (var j = 0; j <= i; j++){
        var a = att(AT.s, AT.l, AT.h, i, j); if (a < 0.02) continue;
        svg += '<path d="M' + (xl + 6) + "," + y(i) + " C" + (xl + (xr - xl)*0.45) + "," + y(i) + " " + (xl + (xr - xl)*0.55) + "," + y(j) + " " + (xr - 6) + "," + y(j) + '" fill="none" stroke="' + P.green + '" stroke-width="' + (0.6 + 8*a).toFixed(2) + '" stroke-opacity="' + (dim ? 0.05 : 0.12 + 0.8*a).toFixed(3) + '"/>';
      }
    }
    for (i = 0; i < n; i++){
      var t = s.tokens[i], lab = esc(t.replace(/^ /, "")), foc = AT.focus === i, isIt = i === s.itPos, isN = i === s.nounPos;
      svg += '<g class="aq" data-i="' + i + '" style="cursor:pointer"><rect x="' + (xl - 120) + '" y="' + (y(i) - 12) + '" width="126" height="24" rx="6" fill="' + (foc ? P.green : "transparent") + '" fill-opacity="' + (foc ? .18 : 0) + '"/>' +
        '<text x="' + xl + '" y="' + (y(i) + 4.5) + '" text-anchor="end" font-size="13.5" font-weight="' + (isIt || foc ? 800 : 600) + '" fill="' + (isIt ? P.red : P.ink) + '">' + lab + "</text></g>";
      svg += '<text x="' + xr + '" y="' + (y(i) + 4.5) + '" font-size="13.5" font-weight="' + (isN ? 800 : 600) + '" fill="' + (isN ? P.red : P.ink) + '">' + lab + "</text>";
    }
    svg += "</svg>";
    host.innerHTML = svg;
    $$(".aq", host).forEach(function(g){
      g.addEventListener("mouseenter", function(){ AT.focus = +g.getAttribute("data-i"); attDrawArc(); attDesc(); });
      g.addEventListener("click", function(){ AT.focus = +g.getAttribute("data-i"); attDrawArc(); attDesc(); });
    });
    host.onmouseleave = function(){ if (AT.focus >= 0){ AT.focus = -1; attDrawArc(); attDesc(); } };
  }
  function attDrawMat(){
    var m = $("#aihAttn"), host = $(".aih-mat", m), P = pal(), s = attData(AT.s), n = s.n;
    var W = Math.max(260, host.clientWidth || 400), lab = 92, cs = Math.max(12, Math.min(28, (W - lab - 10)/n)), H = lab + n*cs + 6;
    var base = P.dark ? [10, 18, 26] : [240, 246, 250], gc = P.dark ? [0, 229, 255] : [0, 137, 169];
    var svg = '<svg viewBox="0 0 ' + (lab + n*cs + 10) + " " + H + '" height="' + H + '">';
    for (var i = 0; i < n; i++){
      svg += '<text x="' + (lab - 6) + '" y="' + (lab + i*cs + cs/2 + 4) + '" text-anchor="end" font-size="11.5" fill="' + (i === AT.focus ? P.red : P.ink2) + '" font-weight="' + (i === AT.focus ? 800 : 500) + '">' + esc(s.tokens[i].replace(/^ /, "")) + "</text>";
      svg += '<text transform="translate(' + (lab + i*cs + cs/2 + 4) + "," + (lab - 6) + ') rotate(-60)" font-size="11.5" fill="' + P.ink2 + '">' + esc(s.tokens[i].replace(/^ /, "")) + "</text>";
      for (var j = 0; j < n; j++){
        var a = j <= i ? att(AT.s, AT.l, AT.h, i, j) : 0, c = mix(base, gc, Math.pow(a, 0.7));
        svg += '<rect x="' + (lab + j*cs) + '" y="' + (lab + i*cs) + '" width="' + (cs - 1) + '" height="' + (cs - 1) + '" fill="rgb(' + c.join(",") + ')"' + (j > i ? ' fill-opacity=".35"' : "") + "><title>" + esc(s.tokens[i]) + " → " + esc(s.tokens[j]) + " : " + pct(a, 1) + "</title></rect>";
      }
    }
    svg += "</svg>";
    host.innerHTML = svg;
  }
  function attDesc(){
    var m = $("#aihAttn"), s = attData(AT.s), k = AT.l*12 + AT.h, sc = s.score, d = $(".aih-hdesc", m);
    var txt = "<b>หัว " + AT.l + "." + AT.h + "</b> (ชั้น " + AT.l + ", หัว " + AT.h + ") — โดยเฉลี่ยในประโยคนี้: มองคำติดกันทางซ้าย <b>" + pct(sc.prev[k], 0) + "</b> · ทุ่มไว้ที่คำแรก <b>" + pct(sc.sink[k], 0) + "</b>";
    if (s.itPos >= 0) txt += " · คำว่า <b>it</b> มองไปที่ <b>" + esc(s.tokens[s.nounPos].trim()) + "</b> <b style='color:var(--red)'>" + pct(sc.coref[k], 0) + "</b>";
    if (s.id === "repeat") txt += " · คะแนน induction <b>" + pct(sc.induct[k], 0) + "</b> (รอบสองมองไปที่คำที่ตามมาในรอบแรก)";
    if (AT.focus >= 0){
      var row = []; for (var j = 0; j <= AT.focus; j++) row.push({ j: j, a: att(AT.s, AT.l, AT.h, AT.focus, j) });
      row.sort(function(a, b){ return b.a - a.a; });
      txt += "<br>คำว่า <b>" + esc(s.tokens[AT.focus].trim()) + "</b> มองไปที่: " + row.slice(0, 3).map(function(r){ return "<b>" + esc(s.tokens[r.j].trim() || "·") + "</b> " + pct(r.a, 0); }).join(" · ");
    }
    d.innerHTML = txt;
  }
  function attDrawGrid(){
    var gm = $("#aihAttnGrid"); if (!gm) return;
    var cv = $("canvas", gm), P = pal(), s = attData(AT.s), n = s.n;
    var W = Math.max(300, gm.clientWidth || 800), lab = 34, cs = Math.floor(Math.min(64, (W - lab - 4)/12)), H = lab + cs*12 + 4;
    var g = U.canvasFit(cv, W, H), ox = lab + Math.max(0, (W - lab - cs*12)/2), oy = lab;
    cv._lay = { ox: ox, oy: oy, cs: cs };
    g.clearRect(0, 0, W, H);
    g.font = "600 10.5px " + P.font; g.fillStyle = P.soft; g.textAlign = "center";
    var wide = cs >= 44;
    for (var hh = 0; hh < 12; hh++) g.fillText((wide ? "หัว " : "") + hh, ox + hh*cs + cs/2, oy - 8);
    g.textAlign = "right";
    for (var ll = 0; ll < 12; ll++) g.fillText((wide ? "ชั้น " : "") + ll, ox - 4, oy + ll*cs + cs/2 + 4);
    if (!wide){ g.textAlign = "left"; g.fillText("ชั้น↓ หัว→", 0, 12); }
    var base = P.dark ? [10, 18, 26] : [240, 246, 250], gc = P.dark ? [0, 229, 255] : [0, 137, 169], inner = cs - 4, px = inner/n;
    for (ll = 0; ll < 12; ll++) for (hh = 0; hh < 12; hh++){
      var x0 = ox + hh*cs + 2, y0 = oy + ll*cs + 2;
      g.fillStyle = "rgb(" + base.join(",") + ")"; g.fillRect(x0, y0, inner, inner);
      for (var i = 0; i < n; i++) for (var j = 0; j <= i; j++){
        var a = att(AT.s, ll, hh, i, j); if (a < 0.03) continue;
        var c = mix(base, gc, Math.pow(a, 0.7)); g.fillStyle = "rgb(" + c.join(",") + ")";
        g.fillRect(x0 + j*px, y0 + i*px, Math.ceil(px), Math.ceil(px));
      }
      if (ll === AT.l && hh === AT.h){ g.strokeStyle = P.red; g.lineWidth = 2.5; g.strokeRect(x0 - 1, y0 - 1, inner + 2, inner + 2); }
    }
  }
  AIH.register("ai-attn", { build: attBuild, draw: attSync });

  /* =====================================================================
     หัวข้อ 6 — MLP จำข้อเท็จจริง (ทดลองจริงกับ GPT-2 small)
     ===================================================================== */
  var ML = { f: 0, anim: null, phase: 2, hits: [], patch: "mlp-name" };
  function mlpBuild(){
    var m = $("#aihMlpNet"); if (!m) return;
    var F = DATA.gpt2.facts;
    m.innerHTML = '<div class="aih-ctl"><span class="lab">ชื่อในประโยค:</span>' + F.map(function(f, i){ return '<button type="button" class="aih-chip' + (i ? "" : " on") + '" data-f="' + i + '">' + esc(f.name) + "</button>"; }).join("") +
      '<span style="flex:1"></span><button type="button" class="tl-btn on" data-a="go">▶ ส่งสัญญาณ</button></div>' +
      '<div class="aih-stage"><canvas></canvas></div><div class="aih-mlp-foot"></div>';
    $$("[data-f]", m).forEach(function(b){ b.addEventListener("click", function(){ $$("[data-f]", m).forEach(function(x){ x.classList.toggle("on", x === b); }); ML.f = +b.getAttribute("data-f"); mlpPlay(); mlpDla(); }); });
    m.querySelector("[data-a='go']").addEventListener("click", mlpPlay);
    var cv = $("canvas", m), tip = U.tipOf($(".aih-stage", m));
    cv.addEventListener("mousemove", function(e){ var p = U.relXY(e, cv), hit = null; ML.hits.forEach(function(c){ if (Math.hypot(p.x - c.x, p.y - c.y) <= c.r + 4) hit = c; }); if (hit) tip.show(hit.tip, p.x, p.y); else tip.hide(); });
    cv.addEventListener("mouseleave", function(){ tip.hide(); });
    var pm = $("#aihMlpPatch");
    if (pm){
      pm.innerHTML = '<div class="aih-ctl"><span class="lab">สลับอะไร:</span>' +
        [["mlp-name", "MLP ที่คำว่า Jordan"], ["attn-last", "Attention ที่คำสุดท้าย (of)"], ["mlp-last", "MLP ที่คำสุดท้าย"], ["attn-name", "Attention ที่คำว่า Jordan"], ["win", "MLP 5 ชั้นติดกัน ที่คำว่า Jordan"]]
          .map(function(o){ return '<button type="button" class="aih-chip' + (o[0] === ML.patch ? " on" : "") + '" data-p="' + o[0] + '">' + o[1] + "</button>"; }).join("") + '</div><div class="plot aih-patch-plot"></div>';
      $$("[data-p]", pm).forEach(function(b){ b.addEventListener("click", function(){ $$("[data-p]", pm).forEach(function(x){ x.classList.toggle("on", x === b); }); ML.patch = b.getAttribute("data-p"); mlpPatchDraw(); }); });
    }
  }
  function mlpPlay(){
    if (ML.anim){ ML.anim.stop(); ML.anim = null; }
    ML.phase = 0;
    ML.anim = U.tickLoop(function(){
      if (!U.paneOn("ai-mlp")){ ML.phase = 2; mlpDraw(); ML.anim = null; return false; }
      ML.phase = Math.min(2, ML.phase + 0.045); mlpDraw();
      if (ML.phase >= 2){ ML.anim = null; return false; }
    }, 30);
  }
  function mlpDraw(){
    var m = $("#aihMlpNet"); if (!m) return;
    var f = DATA.gpt2.facts[ML.f], net = f.net, cv = $("canvas", m), stage = $(".aih-stage", m);
    var nm = $("#aihMlpName"); if (nm) nm.textContent = f.name.replace(/ \(.+\)$/, "");
    var W = Math.max(340, stage.clientWidth), H = Math.round(Math.max(420, Math.min(560, W*0.56))), g = U.canvasFit(cv, W, H);
    g.fillStyle = ST.bg; g.fillRect(0, 0, W, H);
    var P = pal(), top = 92, bot = H - 26, narrow = W < 640;
    var xL = narrow ? 80 : Math.max(150, W*0.2), xR = W - (narrow ? 104 : Math.max(150, W*0.18)), xM = (xL + xR)/2;
    var ny = function(n, k){ return top + (k + 0.5)*(bot - top)/n; }, r = Math.max(5, Math.min(10, (bot - top)/16*0.32));
    var ph1 = Math.min(1, ML.phase), ph2 = Math.max(0, Math.min(1, ML.phase - 1));
    // ชื่อบุคคลเหนือชั้นกลาง (แบบในคลิป)
    g.textAlign = "center"; g.fillStyle = ST.ink; g.font = "600 " + Math.round(Math.min(30, W/26)) + "px 'Noto Serif Thai', Georgia, serif";
    g.fillText(f.name.replace(/ \(.+\)$/, ""), xM, 40);
    g.font = "600 12px " + P.font; g.fillStyle = ST.soft;
    g.fillText(narrow ? "GPT-2 · MLP ชั้นที่ " + net.layer : "“" + f.prompt + " …”  →  GPT-2 ชั้น MLP ที่ " + net.layer + " (จาก 0–11)", xM, 62);
    if (narrow){ g.font = "600 11px " + P.font; g.fillText("ขาเข้า 8/768", xL, top - 12); g.fillText("นิวรอน 16/3,072", xM, top - 12); g.fillText("คำตอบ", xR + 34, top - 12); }
    else { g.fillText("เวกเตอร์ขาเข้า (8 จาก 768 มิติ)", xL, top - 12); g.fillText("16 จาก 3,072 นิวรอน", xM, top - 12); g.fillText("คำตอบ", xR + 30, top - 12); }
    var nIn = net.inDims.length, nN = net.neurons.length, nS = net.sports.length;
    g.globalCompositeOperation = "lighter";
    // ขาเข้า → นิวรอน : ค่าขาเข้า × น้ำหนักจริง
    var mx1 = 1e-9; net.neurons.forEach(function(nu){ nu.win.forEach(function(w, k){ mx1 = Math.max(mx1, Math.abs(w*net.inDims[k].v)); }); });
    net.neurons.forEach(function(nu, j){ nu.win.forEach(function(w, k){
      var c = w*net.inDims[k].v, s = Math.abs(c)/mx1; if (s < 0.04) return;
      g.strokeStyle = rgba(c > 0 ? ST.pos : ST.neg, (0.05 + 0.8*s)*ph1); g.lineWidth = 0.5 + 2.4*s;
      var x2 = xL + (xM - xL)*ph1, y2 = ny(nIn, k) + (ny(nN, j) - ny(nIn, k))*ph1;
      g.beginPath(); g.moveTo(xL + r, ny(nIn, k)); g.lineTo(x2 - (ph1 >= 1 ? r : 0), y2); g.stroke();
    }); });
    // นิวรอน → กีฬา : ค่ากระตุ้น × (w_out · ทิศของกีฬา เทียบค่าเฉลี่ย 7 กีฬา)
    var mx2 = 1e-9; net.neurons.forEach(function(nu){ nu.out.forEach(function(v){ mx2 = Math.max(mx2, Math.abs(v)); }); });
    if (ph2 > 0) net.neurons.forEach(function(nu, j){ nu.out.forEach(function(v, s){
      var a = Math.abs(v)/mx2; if (a < 0.04) return;
      g.strokeStyle = rgba(v > 0 ? ST.pos : ST.neg, (0.06 + 0.85*a)*ph2); g.lineWidth = 0.5 + 3*a;
      var x2 = xM + (xR - xM)*ph2, y2 = ny(nN, j) + (ny(nS, s) - ny(nN, j))*ph2;
      g.beginPath(); g.moveTo(xM + r, ny(nN, j)); g.lineTo(x2 - (ph2 >= 1 ? r : 0), y2); g.stroke();
    }); });
    g.globalCompositeOperation = "source-over";
    ML.hits = [];
    var mv = 1e-9; net.inDims.forEach(function(d){ mv = Math.max(mv, Math.abs(d.v)); });
    net.inDims.forEach(function(d, k){
      var y = ny(nIn, k), v = Math.abs(d.v)/mv;
      g.beginPath(); g.arc(xL, y, r, 0, Math.PI*2); g.fillStyle = rgba(d.v > 0 ? ST.pos : ST.neg, 0.25 + 0.7*v); g.fill(); g.strokeStyle = "rgba(232,240,246,.6)"; g.lineWidth = 1.2; g.stroke();
      g.textAlign = "right"; g.font = "600 " + (narrow ? 10.5 : 11.5) + "px " + P.font; g.fillStyle = ST.soft; g.fillText((narrow ? "#" : "มิติ #") + d.d + "  " + (d.v > 0 ? "+" : "") + d.v.toFixed(1), xL - r - 6, y + 4);
      ML.hits.push({ x: xL, y: y, r: r, tip: "มิติที่ <b>" + d.d + "</b> ของเวกเตอร์ (หลัง LayerNorm) · ค่า <b>" + d.v.toFixed(2) + "</b>" });
    });
    var ma = 1e-9; net.neurons.forEach(function(nu){ ma = Math.max(ma, nu.a); });
    net.neurons.forEach(function(nu, j){
      var y = ny(nN, j), v = Math.max(0, nu.a)/ma*ph1;
      g.beginPath(); g.arc(xM, y, r, 0, Math.PI*2); g.fillStyle = "rgba(255,255,255," + (0.06 + 0.9*v).toFixed(3) + ")"; g.fill(); g.strokeStyle = "rgba(232,240,246,.6)"; g.lineWidth = 1.2; g.stroke();
      var tgt = net.sports.indexOf(f.target), push = nu.out[tgt];
      ML.hits.push({ x: xM, y: y, r: r, tip: "นิวรอน <b>" + net.layer + "." + nu.n + "</b> · ค่ากระตุ้น (GELU) <b>" + nu.a.toFixed(2) + "</b><br>ดัน " + esc(f.target) + " <b>" + (push > 0 ? "+" : "") + push.toFixed(3) + "</b> (เทียบค่าเฉลี่ยกีฬา 7 ชนิด)" });
      if (j === 0 && ph1 >= 1){ g.strokeStyle = ST.gold; g.lineWidth = 2; g.beginPath(); g.moveTo(xM - r - 8, y - r - 4); g.lineTo(xM - r - 12, y - r - 4); g.lineTo(xM - r - 12, y + r + 4); g.lineTo(xM - r - 8, y + r + 4); g.stroke(); }
    });
    var mp = 1e-9; f.sportP.forEach(function(s){ mp = Math.max(mp, s.p); });
    net.sports.forEach(function(s, k){
      var y = ny(nS, k), sp = f.sportP[k].p, v = sp/mp*ph2, isT = s === f.target;
      g.beginPath(); g.arc(xR, y, r + 2, 0, Math.PI*2); g.fillStyle = "rgba(255,255,255," + (0.06 + 0.9*v).toFixed(3) + ")"; g.fill(); g.strokeStyle = isT ? ST.gold : "rgba(232,240,246,.6)"; g.lineWidth = isT ? 2.4 : 1.2; g.stroke();
      g.textAlign = "left"; g.font = (isT ? "800 " : "600 ") + "13px " + P.font; g.fillStyle = isT ? ST.gold : ST.ink; g.fillText(s, xR + r + 10, y + 1);
      g.font = "600 11px " + P.font; g.fillStyle = ST.soft; g.fillText(pct(sp), xR + r + 10, y + 15);
      ML.hits.push({ x: xR, y: y, r: r + 2, tip: "P(<b>" + esc(s) + "</b>) = <b>" + pct(sp) + "</b> (จากคลัง 50,257 คำ)" });
    });
    var foot = $(".aih-mlp-foot", m);
    foot.innerHTML = "GPT-2 ทายคำถัดไป: " + f.next.slice(0, 6).map(function(t){ var isT = t.t.trim() === f.target; return '<span class="sp' + (isT ? " tg" : "") + '">' + U.tokHtml(t.t) + " <b>" + pct(t.p) + "</b></span>"; }).join("") +
      '<span class="aih-note">· กรอบทองในภาพ = นิวรอนที่ดันคำตอบแรงสุดในชั้นนี้</span>';
  }
  function mlpPatchDraw(){
    var pm = $("#aihMlpPatch"); if (!pm || !window.Plot) return;
    var box = $(".aih-patch-plot", pm), P = pal(), pt = DATA.gpt2.patching, W = Math.max(320, box.clientWidth || 800), rows, xlab;
    if (ML.patch === "win"){
      rows = pt.windows.map(function(w){ return { k: "ชั้น " + w.from + "–" + w.to, p: w.p*100 }; }); xlab = "สลับ MLP 5 ชั้นติดกัน ณ ตำแหน่ง “Jordan”";
    } else {
      var kind = ML.patch.indexOf("mlp") === 0 ? "mlp" : "attn", pos = ML.patch.indexOf("name") > 0 ? pt.namePos : pt.last;
      var r = pt.rows.filter(function(x){ return x.kind === kind && x.pos === pos; })[0];
      rows = r.p.map(function(v, l){ return { k: "ชั้น " + l, p: v*100 }; });
      xlab = "สลับ " + (kind === "mlp" ? "MLP" : "Attention") + " ทีละชั้น ณ ตำแหน่ง “" + r.tok.trim() + "”";
    }
    var clean = pt.pClean*100, corr = pt.pCorrupt*100;
    var fig = Plot.plot({ width: W, height: 300, marginLeft: 48, marginBottom: 44, style: U.plotStyle(P),
      x: { label: xlab, domain: rows.map(function(r){ return r.k; }), tickRotate: rows.length > 8 ? -30 : 0 },
      y: { label: "↑ P(basketball) %", domain: [0, 16], grid: true },
      marks: [
        Plot.barY(rows, { x: "k", y: "p", fill: function(d){ return d.p < (clean + corr)/2 ? P.red : P.green; }, fillOpacity: 0.85, rx: 3 }),
        Plot.text(rows, { x: "k", y: "p", text: function(d){ return d.p.toFixed(1); }, dy: -8, fill: P.ink, fontSize: 11 }),
        Plot.ruleY([clean], { stroke: P.green, strokeDasharray: "5,4", strokeWidth: 1.6 }),
        Plot.ruleY([corr], { stroke: P.red, strokeDasharray: "5,4", strokeWidth: 1.6 }),
        Plot.text([{ y: clean }], { x: rows[rows.length - 1].k, y: "y", text: function(){ return "ปกติ (Jordan) " + clean.toFixed(1) + "%"; }, dy: -9, textAnchor: "end", fill: P.green, fontWeight: 700, fontSize: 11.5 }),
        Plot.text([{ y: corr }], { x: rows[rows.length - 1].k, y: "y", text: function(){ return "ประโยค Smith " + corr.toFixed(1) + "%"; }, dy: 12, textAnchor: "end", fill: P.red, fontWeight: 700, fontSize: 11.5 })
      ] });
    box.innerHTML = ""; box.appendChild(fig);
  }
  function mlpLens(){
    var box = $("#aihMlpLens"); if (!box || !window.Plot) return;
    var P = pal(), W = Math.max(300, box.clientWidth || 500), rows = [];
    var cols = { jordan: P.red, woods: P.green, messi: P.gold, smith: P.soft };
    DATA.gpt2.facts.forEach(function(f){ f.lens.forEach(function(x, l){ rows.push({ who: f.name, id: f.id, l: l, rank: x.rank, p: x.p, tgt: f.target }); }); });
    var fig = Plot.plot({ width: W, height: 300, marginLeft: 56, marginBottom: 40, style: U.plotStyle(P),
      x: { label: "หลังชั้นที่ → (0 = ก่อนเข้าชั้นแรก)", ticks: 13, tickFormat: "d" },
      y: { type: "log", reverse: true, label: "↑ อันดับของคำตอบ (1 = ทายเป็นคำแรก)", tickFormat: "~s", grid: true },
      color: { domain: DATA.gpt2.facts.map(function(f){ return f.name; }), range: DATA.gpt2.facts.map(function(f){ return cols[f.id]; }), legend: true },
      marks: [
        Plot.ruleY([1], { stroke: P.soft, strokeDasharray: "3,3" }),
        Plot.lineY(rows, { x: "l", y: "rank", stroke: "who", strokeWidth: 2.2 }),
        Plot.dot(rows, { x: "l", y: "rank", fill: "who", r: 3 }),
        Plot.tip(rows, Plot.pointer({ x: "l", y: "rank", title: function(d){ return d.who + " · หลังชั้น " + d.l + "\n" + d.tgt + " อยู่อันดับ " + fmt(d.rank) + " · P = " + pct(d.p); } }))
      ] });
    box.innerHTML = ""; box.appendChild(fig);
  }
  function mlpDla(){
    var box = $("#aihMlpDla"); if (!box || !window.Plot) return;
    var P = pal(), f = DATA.gpt2.facts[ML.f], W = Math.max(300, box.clientWidth || 500), rows = [];
    for (var l = 0; l < 12; l++){ rows.push({ l: String(l), k: "Attention", v: f.dla.attn[l] }); rows.push({ l: String(l), k: "MLP", v: f.dla.mlp[l] }); }
    var sel = $("#aihMlpDlaSel"); if (sel) sel.textContent = "กำลังดู: " + f.name + " → " + f.target + " (เลือกชื่อได้ที่ภาพด้านบน)";
    var fig = Plot.plot({ width: W, height: 300, marginLeft: 44, marginBottom: 40, style: U.plotStyle(P),
      x: { label: "ชั้นที่ →", domain: rows.filter(function(r){ return r.k === "MLP"; }).map(function(r){ return r.l; }), padding: 0.15 },
      y: { label: "↑ ดัน " + f.target + " (logit เทียบกีฬาอื่น)", grid: true },
      color: { domain: ["Attention", "MLP"], range: [P.green, P.red], legend: true },
      marks: [
        Plot.ruleY([0], { stroke: P.soft }),
        Plot.barY(rows, { x: "l", y: "v", fill: "k", fillOpacity: 0.85, insetLeft: 2, insetRight: 2 }),   // บวกซ้อนขึ้น ลบซ้อนลง = ผลรวมของชั้นนั้น
        Plot.tip(rows, Plot.pointerX({ x: "l", y: "v", title: function(d){ return "ชั้น " + d.l + " · " + d.k + "\n" + (d.v > 0 ? "+" : "") + d.v.toFixed(2); } }))
      ] });
    box.innerHTML = ""; box.appendChild(fig);
  }
  AIH.register("ai-mlp", {
    build: function(){ mlpBuild(); ML.phase = 2; },
    draw: function(){ mlpDraw(); mlpPatchDraw(); mlpLens(); mlpDla(); },
    pause: function(){ if (ML.anim){ ML.anim.stop(); ML.anim = null; ML.phase = 2; } }
  });
})();
