// GPT-2 small (124M, OpenAI 2019) — forward pass เขียนเองด้วย JavaScript ล้วน
// อ่านน้ำหนักจริงจาก model.safetensors ของ Hugging Face (openai-community/gpt2)
// เก็บค่าภายในไว้วิเคราะห์: attention ทุกหัว · ผลลัพธ์ attention/MLP ทุกชั้น · ค่ากระตุ้นนิวรอน MLP
import fs from "node:fs";

const DIR = new URL("./gpt2/", import.meta.url);
const NL = 12, NH = 12, D = 768, HD = 64, FF = 3072, V = 50257;

// ---------------- น้ำหนัก ----------------
const file = fs.readFileSync(new URL("model.safetensors", DIR));
const hlen = Number(file.readBigUInt64LE(0));
const header = JSON.parse(file.subarray(8, 8 + hlen).toString("utf8"));
const base = 8 + hlen;
function T(name){
  const k = header[name] ? name : "transformer." + name;
  const h = header[k]; if (!h) throw new Error("ไม่พบ tensor " + name);
  if (h.dtype !== "F32") throw new Error("dtype " + h.dtype);
  const [a, b] = h.data_offsets;
  const buf = file.buffer.slice(file.byteOffset + base + a, file.byteOffset + base + b);
  return new Float32Array(buf);
}
const wte = T("wte.weight"), wpe = T("wpe.weight");
const L = [];
for (let l = 0; l < NL; l++) L.push({
  ln1g: T(`h.${l}.ln_1.weight`), ln1b: T(`h.${l}.ln_1.bias`),
  qkvW: T(`h.${l}.attn.c_attn.weight`), qkvB: T(`h.${l}.attn.c_attn.bias`),
  prW: T(`h.${l}.attn.c_proj.weight`), prB: T(`h.${l}.attn.c_proj.bias`),
  ln2g: T(`h.${l}.ln_2.weight`), ln2b: T(`h.${l}.ln_2.bias`),
  fcW: T(`h.${l}.mlp.c_fc.weight`), fcB: T(`h.${l}.mlp.c_fc.bias`),
  mpW: T(`h.${l}.mlp.c_proj.weight`), mpB: T(`h.${l}.mlp.c_proj.bias`)
});
const lnfg = T("ln_f.weight"), lnfb = T("ln_f.bias");
export const W = { wte, wpe, L, lnfg, lnfb, D, V, NL, NH, FF };

// ---------------- Tokenizer (byte-level BPE ของ GPT-2) ----------------
const encoder = JSON.parse(fs.readFileSync(new URL("vocab.json", DIR), "utf8"));
const decoder = []; for (const [k, v] of Object.entries(encoder)) decoder[v] = k;
const ranks = new Map();
fs.readFileSync(new URL("merges.txt", DIR), "utf8").split("\n").slice(1).forEach((line, i) => { if (line.trim()) ranks.set(line, i); });
const b2u = {}, u2b = {};
{ const bs = []; for (let i = 33; i <= 126; i++) bs.push(i); for (let i = 161; i <= 172; i++) bs.push(i); for (let i = 174; i <= 255; i++) bs.push(i);
  const cs = bs.slice(); let n = 0; for (let b = 0; b < 256; b++) if (!bs.includes(b)){ bs.push(b); cs.push(256 + n); n++; }
  bs.forEach((b, i) => { b2u[b] = String.fromCharCode(cs[i]); u2b[String.fromCharCode(cs[i])] = b; }); }
const PAT = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
function bpe(tok){
  let word = Array.from(tok);
  while (word.length > 1){
    let best = -1, bestRank = Infinity;
    for (let i = 0; i < word.length - 1; i++){ const r = ranks.get(word[i] + " " + word[i+1]); if (r !== undefined && r < bestRank){ bestRank = r; best = i; } }
    if (best < 0) break;
    const a = word[best], b = word[best+1], nw = [];
    for (let i = 0; i < word.length; ){ if (i < word.length - 1 && word[i] === a && word[i+1] === b){ nw.push(a + b); i += 2; } else { nw.push(word[i]); i++; } }
    word = nw;
  }
  return word;
}
export function encode(text){
  const out = [];
  for (const m of text.matchAll(PAT)){
    const u = Array.from(Buffer.from(m[0], "utf8")).map(b => b2u[b]).join("");
    for (const p of bpe(u)) out.push(encoder[p]);
  }
  return out;
}
export function decode(ids){ return Buffer.from(ids.flatMap(id => Array.from(decoder[id]).map(c => u2b[c]))).toString("utf8"); }
export function tokStr(id){ return decode([id]); }

// ---------------- คณิตพื้นฐาน ----------------
function layerNorm(x, g, b, out){
  let m = 0; for (let i = 0; i < D; i++) m += x[i]; m /= D;
  let v = 0; for (let i = 0; i < D; i++){ const d = x[i] - m; v += d*d; } v /= D;
  const s = 1/Math.sqrt(v + 1e-5);
  for (let i = 0; i < D; i++) out[i] = (x[i] - m)*s*g[i] + b[i];
  return { mean: m, std: Math.sqrt(v + 1e-5) };
}
function matvec(x, nin, Wm, bias, nout, out){          // out = x @ W + b  (W: [nin, nout])
  out.set(bias);
  for (let i = 0; i < nin; i++){ const xi = x[i]; if (xi === 0) continue; const r = i*nout; for (let j = 0; j < nout; j++) out[j] += xi*Wm[r+j]; }
  return out;
}
const gelu = x => 0.5*x*(1 + Math.tanh(0.7978845608028654*(x + 0.044715*x*x*x)));

// ---------------- Forward ----------------
// คืน: logits ตำแหน่งสุดท้าย, attention ทุกชั้น/หัว, ส่วนประกอบ residual ที่ตำแหน่งสุดท้าย
export function run(ids, opt = {}){
  const n = ids.length;
  const X = []; for (let t = 0; t < n; t++){ const v = new Float32Array(D); for (let i = 0; i < D; i++) v[i] = wte[ids[t]*D + i] + wpe[t*D + i]; X.push(v); }
  const comps = { emb: Float32Array.from(X[n-1]), attn: [], mlp: [] };
  const resid = [Float32Array.from(X[n-1])];
  const attn = [], hidden = [];
  const a = new Float32Array(D), qkv = [], tmp = new Float32Array(D), ffh = new Float32Array(FF), mo = new Float32Array(D);
  for (let l = 0; l < NL; l++){
    const P = L[l];
    qkv.length = 0;
    for (let t = 0; t < n; t++){ layerNorm(X[t], P.ln1g, P.ln1b, a); qkv.push(matvec(a, D, P.qkvW, P.qkvB, 3*D, new Float32Array(3*D))); }
    const headsOut = Array.from({ length: n }, () => new Float32Array(D));
    const layerAtt = [];
    for (let h = 0; h < NH; h++){
      const A = [];
      for (let i = 0; i < n; i++){
        const row = new Float32Array(n); let mx = -Infinity;
        for (let j = 0; j <= i; j++){ let s = 0; const qo = h*HD, ko = D + h*HD; for (let d = 0; d < HD; d++) s += qkv[i][qo+d]*qkv[j][ko+d]; s /= 8; row[j] = s; if (s > mx) mx = s; }
        let z = 0; for (let j = 0; j <= i; j++){ row[j] = Math.exp(row[j] - mx); z += row[j]; }
        for (let j = 0; j <= i; j++) row[j] /= z;
        for (let j = i+1; j < n; j++) row[j] = 0;
        const vo = 2*D + h*HD, out = headsOut[i];
        for (let j = 0; j <= i; j++){ const w = row[j]; for (let d = 0; d < HD; d++) out[h*HD + d] += w*qkv[j][vo+d]; }
        A.push(row);
      }
      layerAtt.push(A);
    }
    attn.push(layerAtt);
    for (let t = 0; t < n; t++){
      matvec(headsOut[t], D, P.prW, P.prB, D, tmp);
      if (opt.capture) (comps.attnAll ||= {})[l + ":" + t] = Float32Array.from(tmp);
      if (opt.patch) for (const pt of opt.patch) if (pt.kind === "attn" && pt.layer === l && pt.pos === t) tmp.set(pt.vec);
      if (t === n-1) comps.attn.push(Float32Array.from(tmp));
      for (let i = 0; i < D; i++) X[t][i] += tmp[i];
    }
    for (let t = 0; t < n; t++){
      layerNorm(X[t], P.ln2g, P.ln2b, a);
      matvec(a, D, P.fcW, P.fcB, FF, ffh);
      for (let i = 0; i < FF; i++) ffh[i] = gelu(ffh[i]);
      if (t === n-1){ hidden.push(Float32Array.from(ffh)); if (opt.keepLn2) (comps.ln2 ||= []).push(Float32Array.from(a)); }
      matvec(ffh, FF, P.mpW, P.mpB, D, mo);
      if (opt.capture) (comps.mlpAll ||= {})[l + ":" + t] = Float32Array.from(mo);
      if (opt.patch) for (const pt of opt.patch) if (pt.kind === "mlp" && pt.layer === l && pt.pos === t) mo.set(pt.vec);
      if (t === n-1) comps.mlp.push(Float32Array.from(mo));
      for (let i = 0; i < D; i++) X[t][i] += mo[i];
    }
    resid.push(Float32Array.from(X[n-1]));
  }
  const fin = new Float32Array(D);
  const st = layerNorm(X[n-1], lnfg, lnfb, fin);
  const logits = unembed(fin);
  return { ids, logits, attn, hidden, comps, resid, finalStd: st.std };
}
export function unembed(fin){
  const logits = new Float32Array(V);
  for (let v = 0; v < V; v++){ let s = 0; const o = v*D; for (let i = 0; i < D; i++) s += fin[i]*wte[o+i]; logits[v] = s; }
  return logits;
}
export function lnFinal(x){ const out = new Float32Array(D); layerNorm(x, lnfg, lnfb, out); return out; }
export function softmax(logits, temp = 1){
  let mx = -Infinity; for (const l of logits) if (l > mx) mx = l;
  const p = new Float64Array(logits.length); let z = 0;
  for (let i = 0; i < logits.length; i++){ p[i] = Math.exp((logits[i] - mx)/temp); z += p[i]; }
  for (let i = 0; i < p.length; i++) p[i] /= z;
  return p;
}
export function logSumExp(logits, temp = 1){
  let mx = -Infinity; for (const l of logits) if (l > mx) mx = l;
  let z = 0; for (const l of logits) z += Math.exp((l - mx)/temp);
  return mx/temp + Math.log(z);
}
export function topK(arr, k){
  const idx = []; for (let i = 0; i < arr.length; i++) idx.push(i);
  idx.sort((a, b) => arr[b] - arr[a]);
  return idx.slice(0, k);
}
// ทิศทางในสตรีม residual ที่ "ดัน logit ของโทเคน t" หลังผ่าน LayerNorm สุดท้าย (หารด้วย std ของ residual จริง)
export function logitDir(t, std){
  const d = new Float32Array(D); let m = 0;
  for (let i = 0; i < D; i++){ d[i] = lnfg[i]*wte[t*D + i]/std; }
  for (let i = 0; i < D; i++) m += d[i]; m /= D;
  for (let i = 0; i < D; i++) d[i] -= m;            // LayerNorm ลบค่าเฉลี่ยออก — ทำกับทิศทางแทนได้ (เชิงเส้น)
  return d;
}
export function dot(a, b){ let s = 0; for (let i = 0; i < a.length; i++) s += a[i]*b[i]; return s; }
