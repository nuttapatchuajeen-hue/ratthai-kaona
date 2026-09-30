// สกัดข้อมูลจริงจาก GPT-2 small สำหรับหมวด "หลักการทำงาน AI" → out/gpt2.json
import fs from "node:fs";
import { W, encode, decode, run, softmax, logSumExp, topK, tokStr, lnFinal, unembed, logitDir, dot } from "./gpt2.mjs";

const t0 = Date.now();
const out = {};
const r4 = x => Math.round(x*1e4)/1e4;
const toks = ids => ids.map(tokStr);

// ---------- ข้อมูลตัวโมเดล ----------
{
  const fh = fs.openSync(new URL("./gpt2/model.safetensors", import.meta.url), "r"), lb = Buffer.alloc(8);
  fs.readSync(fh, lb, 0, 8, 0); const hl = Number(lb.readBigUInt64LE(0)), hb = Buffer.alloc(hl); fs.readSync(fh, hb, 0, hl, 8); fs.closeSync(fh);
  const hdr = JSON.parse(hb.toString("utf8"));
  let params = 0; for (const [k, v] of Object.entries(hdr)) if (k !== "__metadata__" && !/attn\.(masked_)?bias$/.test(k)) params += v.shape.reduce((a, b) => a*b, 1);
  out.model = { name: "GPT-2 small", params, layers: W.NL, heads: W.NH, dim: W.D, ff: W.FF, vocab: W.V, ctx: 1024 };
  console.log("params", params);
}

function topList(logits, k){ const p = softmax(logits); return topK(logits, k).map(i => ({ t: tokStr(i), id: i, p: r4(p[i]) })); }
function greedy(prompt, n, stopNL = false){
  const ids = encode(prompt), gen = [];
  for (let s = 0; s < n; s++){
    const r = run(ids); const nx = topK(r.logits, 1)[0];
    if (stopNL && tokStr(nx) === "\n" && gen.length) break;
    ids.push(nx); gen.push(nx);
  }
  return decode(gen);
}

// ---------- A. Attention ----------
const ATT_SENT = [
  { id: "animal", text: "The animal didn't cross the street because it was too tired", note: "คำว่า it หมายถึงสัตว์ (animal) ไม่ใช่ถนน" },
  { id: "trophy", text: "The trophy didn't fit in the suitcase because it was too big", note: "คำว่า it หมายถึงถ้วยรางวัล (trophy)" },
  { id: "repeat", text: "The cat sat on the mat. The cat sat on the mat.", note: "ประโยคซ้ำ — ใช้ดูหัวที่ \"ลอกของเดิม\" (induction head)" }
];
out.attention = ATT_SENT.map(s => {
  const ids = encode(s.text), n = ids.length, r = run(ids);
  const bytes = new Uint8Array(W.NL*W.NH*n*n);
  let o = 0;
  for (let l = 0; l < W.NL; l++) for (let h = 0; h < W.NH; h++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) bytes[o++] = Math.round(r.attn[l][h][i][j]*255);
  const tk = toks(ids);
  const res = { id: s.id, text: s.text, note: s.note, tokens: tk, n, att: Buffer.from(bytes).toString("base64") };
  // คะแนนประจำหัว: prev-token · first-token sink · (สำหรับ it) → คำนามต้นประโยค
  const prev = [], sink = [], coref = [], induct = [];
  const itPos = tk.findIndex(t => t === " it");
  const nounPos = s.id === "animal" ? tk.indexOf(" animal") : s.id === "trophy" ? tk.indexOf(" trophy") : -1;
  const half = s.id === "repeat" ? n/2 : 0;
  for (let l = 0; l < W.NL; l++) for (let h = 0; h < W.NH; h++){
    const A = r.attn[l][h]; let pv = 0, sk = 0;
    for (let i = 1; i < n; i++){ pv += A[i][i-1]; sk += A[i][0]; }
    prev.push(r4(pv/(n-1))); sink.push(r4(sk/(n-1)));
    coref.push(itPos >= 0 && nounPos >= 0 ? r4(A[itPos][nounPos]) : 0);
    if (half){ let s2 = 0, c = 0; for (let i = half; i < n; i++){ const j = i - half + 1; if (j < half){ s2 += A[i][j]; c++; } } induct.push(r4(s2/c)); } else induct.push(0);
  }
  res.score = { prev, sink, coref, induct };
  res.itPos = itPos; res.nounPos = nounPos;
  res.next = topList(r.logits, 8);
  return res;
});
console.log("attention done", (Date.now()-t0)/1000);

// ---------- B. MLP เก็บข้อเท็จจริง ----------
const SPORTS = [" basketball", " football", " golf", " tennis", " baseball", " soccer", " hockey"].map(s => ({ s, id: encode(s)[0] }));
const FACT = [
  { id: "jordan", prompt: "Michael Jordan plays the sport of", target: " basketball", name: "Michael Jordan" },
  { id: "woods",  prompt: "Tiger Woods plays the sport of", target: " golf", name: "Tiger Woods" },
  { id: "messi",  prompt: "Lionel Messi plays the sport of", target: " football", name: "Lionel Messi" },
  { id: "smith",  prompt: "Michael Smith plays the sport of", target: " basketball", name: "Michael Smith (คนทั่วไป)" }
];
out.facts = FACT.map(f => {
  const ids = encode(f.prompt), r = run(ids, { keepLn2: true }), tgt = encode(f.target)[0];
  const p = softmax(r.logits);
  // logit lens: ความน่าจะเป็นของคำเป้าหมายหลังแต่ละชั้น
  const lens = r.resid.map(x => { const lg = unembed(lnFinal(x)); const pp = softmax(lg); let rank = 1; for (let v = 0; v < lg.length; v++) if (lg[v] > lg[tgt]) rank++; return { p: r4(pp[tgt]), rank }; });
  // แยกส่วน logit ของคำเป้าหมายตามชั้น (exact — รวมกันได้ logit จริงลบค่าคงที่ของ bias)
  const dir = logitDir(tgt, r.finalStd);
  const dla = { emb: r4(dot(r.comps.emb, dir)), attn: r.comps.attn.map(c => r4(dot(c, dir))), mlp: r.comps.mlp.map(c => r4(dot(c, dir))) };
  const biasTerm = dot(W.lnfb, W.wte.subarray(tgt*W.D, tgt*W.D + W.D));
  const sum = dla.emb + dla.attn.reduce((a, b) => a+b, 0) + dla.mlp.reduce((a, b) => a+b, 0) + biasTerm;
  // นิวรอนที่ดันคำเป้าหมายมากสุดทุกชั้น
  const neurons = [];
  for (let l = 0; l < W.NL; l++){
    const mp = W.L[l].mpW, h = r.hidden[l];
    for (let n = 0; n < W.FF; n++){
      if (Math.abs(h[n]) < 1e-3) continue;
      let s = 0; const o = n*W.D; for (let i = 0; i < W.D; i++) s += mp[o+i]*dir[i];
      neurons.push({ l, n, a: h[n], c: h[n]*s });
    }
  }
  neurons.sort((a, b) => b.c - a.c);
  const topN = neurons.slice(0, 12).map(x => ({ l: x.l, n: x.n, a: r4(x.a), c: r4(x.c) }));
  // ภาพแบบในคลิป: เลือกชั้น MLP ที่ดันคำเป้าหมายแรงสุด แล้วดึง 16 นิวรอนเด่น + 8 มิติขาเข้า + 7 กีฬาขาออก
  let bestL = 0; dla.mlp.forEach((v, l) => { if (v > dla.mlp[bestL]) bestL = l; });
  const hL = r.hidden[bestL], ln2 = r.comps.ln2[bestL], fc = W.L[bestL].fcW, mp = W.L[bestL].mpW;
  const inLayer = neurons.filter(x => x.l === bestL).slice(0, 16).map(x => x.n);
  const inDims = Array.from({ length: W.D }, (_, i) => i).sort((a, b) => Math.abs(ln2[b]) - Math.abs(ln2[a])).slice(0, 8);
  const sportDirs = SPORTS.map(s => logitDir(s.id, r.finalStd));
  const net = {
    layer: bestL,
    inDims: inDims.map(d => ({ d, v: r4(ln2[d]) })),
    neurons: inLayer.map(n => ({ n, a: r4(hL[n]),
      win: inDims.map(d => r4(fc[d*W.FF + n])),                                             // น้ำหนักจริง ขาเข้า → นิวรอน
      out: sportDirs.map(dr => { let s = 0; const o = n*W.D; for (let i = 0; i < W.D; i++) s += mp[o+i]*dr[i]; return r4(hL[n]*s); }) })),   // นิวรอน → คำกีฬา (ผลคูณค่ากระตุ้น)
    sports: SPORTS.map(s => s.s.trim())
  };
  console.log(f.id, "p", p[tgt].toFixed(3), "sum check", sum.toFixed(3), "vs logit", r.logits[tgt].toFixed(3), "best layer", bestL);
  return { id: f.id, name: f.name, prompt: f.prompt, target: f.target.trim(), tokens: toks(ids), pTarget: r4(p[tgt]), logit: r4(r.logits[tgt]), biasTerm: r4(biasTerm),
           next: topList(r.logits, 10), sportP: SPORTS.map(s => ({ s: s.s.trim(), p: r4(p[s.id]) })), lens, dla, topNeurons: topN, net };
});
console.log("facts done", (Date.now()-t0)/1000);

// ---------- C. ทำนายคำถัดไป + อุณหภูมิ ----------
const TEMPS = []; for (let t = 0.1; t <= 2.0001; t += 0.05) TEMPS.push(+t.toFixed(2));
const NEXT = [
  "Once upon a time, there was a",
  "Tiger Woods plays the sport of",
  "I went to the store to buy some",
  "The trophy didn't fit in the suitcase because it was too",
  "The Eiffel Tower is located in the city of",
  "Thailand is famous for its"
];
out.next = { temps: TEMPS, prompts: NEXT.map(pr => {
  const r = run(encode(pr));
  const k = topK(r.logits, 40);
  return { prompt: pr, top: k.map(i => ({ t: tokStr(i), l: r4(r.logits[i]) })), logZ: TEMPS.map(t => r4(logSumExp(r.logits, t))) };
}) };
// เดินทีละคำ: แบบเลือกคำที่น่าจะเป็นสุด (greedy) และแบบสุ่มที่ T=0.9 (seed คงที่)
let sd = 42; const rnd = () => { sd = (sd*1664525 + 1013904223) >>> 0; return sd/4294967296; };
function chain(prompt, steps, temp){
  const ids = encode(prompt), seq = [];
  for (let s = 0; s < steps; s++){
    const r = run(ids);
    const p = softmax(r.logits, temp || 1);
    let pick;
    if (!temp) pick = topK(r.logits, 1)[0];
    else { let u = rnd(), acc = 0; pick = 0; for (let v = 0; v < p.length; v++){ acc += p[v]; if (acc >= u){ pick = v; break; } } }
    const p1 = softmax(r.logits);
    seq.push({ pick: tokStr(pick), pPick: r4(p1[pick]), top: topK(r.logits, 8).map(i => ({ t: tokStr(i), p: r4(p1[i]) })) });
    ids.push(pick);
  }
  return { prompt, temp: temp || 0, steps: seq };
}
out.chains = [ chain("Once upon a time, there was a", 14, 0), chain("Once upon a time, there was a", 14, 0.9) ];
console.log("next done", (Date.now()-t0)/1000);

// ---------- D. พฤติกรรมโมเดลดิบ (ยังไม่ผ่าน fine-tune) ----------
out.base = [
  "Q: What is 2+2?\nA:",
  "Q: What is the capital of Thailand?\nA:",
  "Please write a short poem about the sea.\n"
].map(pr => { const r = run(encode(pr)); return { prompt: pr, next: topList(r.logits, 8), cont: greedy(pr, 28) }; });
console.log("base done", (Date.now()-t0)/1000);

// ---------- E. หลอน / ความรู้ล้าสมัย / RAG ----------
const RAG_CTX = "News, 30 September 2026: Anutin Charnvirakul is the Prime Minister of Thailand.\n";
out.limits = {
  mars: (() => { const pr = "The first person to walk on Mars was astronaut"; const r = run(encode(pr)); return { prompt: pr, next: topList(r.logits, 10), cont: greedy(pr, 16, true) }; })(),
  noctx: (() => { const pr = "Thailand's Prime Minister"; const r = run(encode(pr)); return { prompt: pr, next: topList(r.logits, 10), cont: greedy(pr, 10, true) }; })(),
  rag: (() => { const pr = RAG_CTX + "Thailand's Prime Minister"; const r = run(encode(pr)); return { context: RAG_CTX.trim(), prompt: "Thailand's Prime Minister", next: topList(r.logits, 10), cont: greedy(pr, 10, true) }; })()
};
console.log("limits done", (Date.now()-t0)/1000);

fs.mkdirSync(new URL("./out/", import.meta.url), { recursive: true });
fs.writeFileSync(new URL("./out/gpt2.json", import.meta.url), JSON.stringify(out));
console.log("saved bytes", JSON.stringify(out).length, "total s", (Date.now()-t0)/1000);
console.log(JSON.stringify({ base: out.base.map(b => [b.prompt, b.cont]), mars: out.limits.mars.cont, noctx: out.limits.noctx.cont, rag: out.limits.rag.cont, chains: out.chains.map(c => c.steps.map(s => s.pick).join("")) }, null, 1));
