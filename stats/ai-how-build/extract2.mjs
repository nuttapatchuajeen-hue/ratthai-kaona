// รอบ 2: แยกส่วนแบบ "กีฬาเป้าหมาย เทียบกับกีฬาอื่น" (ตัดส่วนที่ดันทุกคำเท่ากันทิ้ง) + เทียบ RAG ที่ตำแหน่งชื่อเดียวกัน
import fs from "node:fs";
import { W, encode, run, softmax, topK, tokStr } from "./gpt2.mjs";

const OUT = new URL("./out/gpt2.json", import.meta.url);
const out = JSON.parse(fs.readFileSync(OUT, "utf8"));
const r4 = x => Math.round(x*1e4)/1e4;
const D = W.D;

// ทิศทางหลัง LayerNorm สุดท้ายสำหรับ "เวกเตอร์ unembed ใด ๆ" u (ยาว D)
function dirOf(u, std){ const d = new Float32Array(D); let m = 0; for (let i = 0; i < D; i++){ d[i] = W.lnfg[i]*u[i]/std; m += d[i]; } m /= D; for (let i = 0; i < D; i++) d[i] -= m; return d; }
const U = id => W.wte.subarray(id*D, id*D + D);
const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]*b[i]; return s; };

const SPORTS = [" basketball", " football", " golf", " tennis", " baseball", " soccer", " hockey"].map(s => ({ s: s.trim(), id: encode(s)[0] }));
const FACT = { jordan: " basketball", woods: " golf", messi: " football", smith: " basketball" };

for (const f of out.facts){
  const tgt = encode(FACT[f.id])[0];
  const r = run(encode(f.prompt), { keepLn2: true });
  // u = U_target − ค่าเฉลี่ยของกีฬาอื่น 6 ชนิด
  const others = SPORTS.filter(s => s.id !== tgt);
  const u = new Float32Array(D); for (let i = 0; i < D; i++){ let m = 0; for (const o of others) m += U(o.id)[i]; u[i] = U(tgt)[i] - m/others.length; }
  const dir = dirOf(u, r.finalStd);
  const dla = { emb: r4(dot(r.comps.emb, dir)), attn: r.comps.attn.map(c => r4(dot(c, dir))), mlp: r.comps.mlp.map(c => r4(dot(c, dir))) };
  const total = dot(r.resid[W.NL], dir);                                  // ≈ logit(target) − mean logit(กีฬาอื่น) (ไม่นับ bias)
  const lg = r.logits; const actual = lg[tgt] - others.reduce((a, o) => a + lg[o.id], 0)/others.length;
  const neurons = [];
  for (let l = 0; l < W.NL; l++){ const mp = W.L[l].mpW, h = r.hidden[l]; for (let n = 0; n < W.FF; n++){ if (Math.abs(h[n]) < 1e-3) continue; let s = 0; const o = n*D; for (let i = 0; i < D; i++) s += mp[o+i]*dir[i]; neurons.push({ l, n, a: h[n], c: h[n]*s }); } }
  neurons.sort((a, b) => b.c - a.c);
  let bestL = 0; dla.mlp.forEach((v, l) => { if (v > dla.mlp[bestL]) bestL = l; });
  const hL = r.hidden[bestL], ln2 = r.comps.ln2[bestL], fc = W.L[bestL].fcW, mp = W.L[bestL].mpW;
  const inLayer = neurons.filter(x => x.l === bestL).slice(0, 16).map(x => x.n);
  // น้ำหนักขาเข้า: เลือก 8 มิติที่ "ส่งแรงเข้าหานิวรอนเด่นเหล่านี้" มากสุด (|ค่า × น้ำหนัก| รวม)
  const dimScore = Array.from({ length: D }, (_, d) => { let s = 0; for (const n of inLayer) s += Math.abs(ln2[d]*fc[d*W.FF + n]); return s; });
  const inDims = Array.from({ length: D }, (_, i) => i).sort((a, b) => dimScore[b] - dimScore[a]).slice(0, 8);
  // ขาออก: ต่อกีฬาแต่ละชนิด เทียบกับค่าเฉลี่ยของ 7 ชนิด → สีบวก/ลบบอกว่านิวรอนเข้าข้างกีฬาไหน
  const sportDirs = SPORTS.map(s => { const v = new Float32Array(D); for (let i = 0; i < D; i++){ let m = 0; for (const o of SPORTS) m += U(o.id)[i]; v[i] = U(s.id)[i] - m/SPORTS.length; } return dirOf(v, r.finalStd); });
  f.dla = dla; f.dlaTotal = r4(total); f.dlaActual = r4(actual);
  f.topNeurons = neurons.slice(0, 12).map(x => ({ l: x.l, n: x.n, a: r4(x.a), c: r4(x.c) }));
  f.net = {
    layer: bestL, sports: SPORTS.map(s => s.s),
    inDims: inDims.map(d => ({ d, v: r4(ln2[d]) })),
    neurons: inLayer.map(n => ({ n, a: r4(hL[n]), win: inDims.map(d => r4(fc[d*W.FF + n])),
      out: sportDirs.map(dr => { let s = 0; const o = n*D; for (let i = 0; i < D; i++) s += mp[o+i]*dr[i]; return r4(hL[n]*s); }) }))
  };
  console.log(f.id, "total", total.toFixed(2), "actual", actual.toFixed(2), "best", bestL, "mlp", dla.mlp.map(v => v.toFixed(2)).join(","));
  console.log("   attn", dla.attn.map(v => v.toFixed(2)).join(","), "top", f.topNeurons.slice(0, 4).map(x => x.l+"."+x.n+"="+x.c.toFixed(2)).join(" "));
}

// RAG — เทียบ "ตำแหน่งชื่อ" เดียวกัน: หลัง "Thailand's Prime Minister,"
const CTX = out.limits.rag.context + "\n";
function probs(pr, watch){ const r = run(encode(pr)); const p = softmax(r.logits); return { next: topK(r.logits, 10).map(i => ({ t: tokStr(i), p: r4(p[i]) })), watch: watch.map(w => ({ t: w.trim(), p: r4(p[encode(w)[0]]) })) }; }
const WATCH = [" Ying", " An", " Pr", " Th"];
out.limits.namePos = {
  prompt: "Thailand's Prime Minister,",
  noctx: probs("Thailand's Prime Minister,", WATCH),
  rag: probs(CTX + "Thailand's Prime Minister,", WATCH)
};
console.log(JSON.stringify(out.limits.namePos));
fs.writeFileSync(OUT, JSON.stringify(out));
console.log("saved", JSON.stringify(out).length);
