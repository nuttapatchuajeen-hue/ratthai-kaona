// โมเดล Diffusion (DDPM, Ho et al. 2020) ขนาดจิ๋วบนจุด 2 มิติรูปตัวอักษร "AI"
// ตัวทำนายสัญญาณรบกวน ε(x_t, t) = MLP 3 ชั้น · ตารางเสียงแบบ cosine (Nichol & Dhariwal 2021) T=50
import fs from "node:fs";

let seed = 777;
function rnd(){ seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
function gauss(){ let u = 0, v = 0; while(!u) u = rnd(); while(!v) v = rnd(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }

// ---------- ข้อมูล: จุดบนเส้นตัวอักษร A กับ I (พิกัดในกรอบ -1..1) ----------
const SEGS = [
  [-0.95,-0.8, -0.45, 0.8], [-0.45, 0.8, 0.05,-0.8], [-0.72,-0.12, -0.18,-0.12],   // A
  [0.55, 0.8, 0.55,-0.8], [0.3, 0.8, 0.8, 0.8], [0.3,-0.8, 0.8,-0.8]                 // I
];
const LEN = SEGS.map(s => Math.hypot(s[2]-s[0], s[3]-s[1])), TOT = LEN.reduce((a, b) => a+b, 0);
function sampleData(){
  let r = rnd()*TOT, k = 0; while (r > LEN[k]){ r -= LEN[k]; k++; }
  const s = SEGS[k], f = r/LEN[k];
  return [s[0] + (s[2]-s[0])*f + gauss()*0.025, s[1] + (s[3]-s[1])*f + gauss()*0.025];
}

// ---------- ตารางเสียง cosine ----------
const T = 50;
const abar = [];
{ const f = t => Math.cos(((t/T) + 0.008)/1.008 * Math.PI/2)**2; for (let t = 0; t <= T; t++) abar.push(f(t)/f(0)); }
const beta = [0]; for (let t = 1; t <= T; t++) beta.push(Math.min(0.999, 1 - abar[t]/abar[t-1]));

// ---------- คุณลักษณะขาเข้า: Fourier ของ x,y (8 ความถี่) + sinusoidal ของ t (16) ----------
const NF = 8, NT = 16, IN = 2 + 2*2*NF + NT, H = 96;
function feats(x, y, t, out){
  out[0] = x; out[1] = y; let o = 2;
  for (let k = 0; k < NF; k++){ const w = Math.pow(2, k*0.5)*1.5; out[o++] = Math.sin(w*x); out[o++] = Math.cos(w*x); out[o++] = Math.sin(w*y); out[o++] = Math.cos(w*y); }
  for (let k = 0; k < NT/2; k++){ const w = Math.exp(-Math.log(1000)*k/(NT/2)); out[o++] = Math.sin(t*w*20); out[o++] = Math.cos(t*w*20); }
  return out;
}
const SZ = [IN, H, H, H, 2];
const W = [], B = [];
for (let l = 0; l < 4; l++){ const w = new Float32Array(SZ[l]*SZ[l+1]), s = Math.sqrt(2/SZ[l]); for (let i = 0; i < w.length; i++) w[i] = gauss()*s*(l === 3 ? 0.1 : 1); W.push(w); B.push(new Float32Array(SZ[l+1])); }
const gW = W.map(w => new Float32Array(w.length)), gB = B.map(b => new Float32Array(b.length));
const mW = W.map(w => new Float32Array(w.length)), vW = W.map(w => new Float32Array(w.length));
const mB = B.map(b => new Float32Array(b.length)), vB = B.map(b => new Float32Array(b.length));
const A = SZ.map(n => new Float32Array(n)), Z = SZ.map(n => new Float32Array(n)), Dl = SZ.map(n => new Float32Array(n));
function forward(inp){
  A[0].set(inp);
  for (let l = 0; l < 4; l++){
    const nin = SZ[l], nout = SZ[l+1], w = W[l], a = A[l], z = Z[l+1], o = A[l+1];
    for (let j = 0; j < nout; j++) z[j] = B[l][j];
    for (let i = 0; i < nin; i++){ const ai = a[i]; if (!ai) continue; const r = i*nout; for (let j = 0; j < nout; j++) z[j] += ai*w[r+j]; }
    if (l < 3) for (let j = 0; j < nout; j++) o[j] = z[j] > 0 ? z[j] : 0; else o.set(z);
  }
  return A[4];
}
function backward(target){
  const d = Dl[4]; d[0] = 2*(A[4][0]-target[0]); d[1] = 2*(A[4][1]-target[1]);
  for (let l = 3; l >= 0; l--){
    const nin = SZ[l], nout = SZ[l+1], w = W[l], a = A[l], dout = Dl[l+1], din = Dl[l];
    for (let j = 0; j < nout; j++) gB[l][j] += dout[j];
    for (let i = 0; i < nin; i++){
      const r = i*nout, ai = a[i]; let s = 0;
      for (let j = 0; j < nout; j++){ gW[l][r+j] += ai*dout[j]; s += w[r+j]*dout[j]; }
      din[i] = l > 0 ? (Z[l][i] > 0 ? s : 0) : s;
    }
  }
}
let step = 0;
function adam(bs, lr){
  step++; const c1 = 1 - 0.9**step, c2 = 1 - 0.999**step;
  for (let l = 0; l < 4; l++){
    const upd = (p, g, m, v) => { for (let i = 0; i < p.length; i++){ const gi = g[i]/bs; m[i] = 0.9*m[i] + 0.1*gi; v[i] = 0.999*v[i] + 0.001*gi*gi; p[i] -= lr*(m[i]/c1)/(Math.sqrt(v[i]/c2)+1e-8); g[i] = 0; } };
    upd(W[l], gW[l], mW[l], vW[l]); upd(B[l], gB[l], mB[l], vB[l]);
  }
}

const inp = new Float32Array(IN), eps = [0, 0];
const STEPS = +(process.argv[2] || 24000), BS = 128;
let lossAcc = 0; const lossLog = [];
for (let s = 0; s < STEPS; s++){
  const lr = 2e-3 * (0.5 + 0.5*Math.cos(Math.PI*s/STEPS)) + 1e-5;
  for (let q = 0; q < BS; q++){
    const x0 = sampleData(), t = 1 + Math.floor(rnd()*T);
    eps[0] = gauss(); eps[1] = gauss();
    const sa = Math.sqrt(abar[t]), sb = Math.sqrt(1-abar[t]);
    const out = forward(feats(sa*x0[0] + sb*eps[0], sa*x0[1] + sb*eps[1], t/T, inp));
    lossAcc += (out[0]-eps[0])**2 + (out[1]-eps[1])**2;
    backward(eps);
  }
  adam(BS, lr);
  if ((s+1) % 1000 === 0){ lossLog.push(+(lossAcc/(1000*BS)).toFixed(4)); console.log("step", s+1, "loss", lossLog[lossLog.length-1]); lossAcc = 0; }
}

// ---------- ทดสอบสุ่มตัวอย่าง: ดูว่าจุดตกบนเส้นตัวอักษรกี่ % ----------
function distToShape(x, y){ let m = 9; for (const s of SEGS){ const dx = s[2]-s[0], dy = s[3]-s[1]; const f = Math.max(0, Math.min(1, ((x-s[0])*dx + (y-s[1])*dy)/(dx*dx+dy*dy))); m = Math.min(m, Math.hypot(x - s[0] - f*dx, y - s[1] - f*dy)); } return m; }
let near = 0; const NS = 1000;
for (let k = 0; k < NS; k++){
  let x = gauss(), y = gauss();
  for (let t = T; t >= 1; t--){
    const e = forward(feats(x, y, t/T, inp));
    const c = beta[t]/Math.sqrt(1-abar[t]);
    x = (x - c*e[0])/Math.sqrt(1-beta[t]); y = (y - c*e[1])/Math.sqrt(1-beta[t]);
    if (t > 1){ const sig = Math.sqrt(beta[t]*(1-abar[t-1])/(1-abar[t])); x += sig*gauss(); y += sig*gauss(); }
  }
  if (distToShape(x, y) < 0.08) near++;
}
console.log("samples within 0.08 of the letters:", near/NS);

function b64(f){ return Buffer.from(f.buffer, f.byteOffset, f.byteLength).toString("base64"); }
const out = { T, abar, beta, NF, NT, sizes: SZ, W: W.map(b64), B: B.map(b64), segs: SEGS, steps: STEPS, batch: BS, lossLog, onShape: near/NS };
fs.mkdirSync(new URL("./out/", import.meta.url), { recursive: true });
fs.writeFileSync(new URL("./out/diffusion.json", import.meta.url), JSON.stringify(out));
console.log("saved bytes", JSON.stringify(out).length);
