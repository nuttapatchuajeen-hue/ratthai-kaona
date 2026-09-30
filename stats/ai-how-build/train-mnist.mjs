// ฝึกโครงข่าย 784 → 16 → 16 → 10 (ReLU + softmax) บน MNIST จริง
// ผลลัพธ์: out/mnist.json — น้ำหนักจริง + บันทึกการฝึก + ภาพทดสอบตัวอย่าง + คำทายระหว่างฝึก
import fs from "node:fs";
import zlib from "node:zlib";

const D = new URL("./mnist/", import.meta.url);
function idx(name){ return zlib.gunzipSync(fs.readFileSync(new URL(name, D))); }
function images(name){ const b = idx(name); const n = b.readUInt32BE(4); return { n, px: b.subarray(16) }; }
function labels(name){ const b = idx(name); return b.subarray(8); }
const tr = images("train-images-idx3-ubyte.gz"), trY = labels("train-labels-idx1-ubyte.gz");
const te = images("t10k-images-idx3-ubyte.gz"), teY = labels("t10k-labels-idx1-ubyte.gz");
console.log("train", tr.n, "test", te.n);

// ---------- สุ่มแบบกำหนด seed ให้รันซ้ำได้ผลเดิม ----------
let seed = 20260930;
function rnd(){ seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
function gauss(){ let u = 0, v = 0; while(!u) u = rnd(); while(!v) v = rnd(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }

const SIZES = [784, 16, 16, 10];
const W = [], B = [];
for (let l = 0; l < 3; l++){
  const nin = SIZES[l], nout = SIZES[l+1];
  const w = new Float32Array(nin*nout), s = Math.sqrt(2/nin);
  for (let i = 0; i < w.length; i++) w[i] = gauss()*s;
  W.push(w); B.push(new Float32Array(nout));
}
// Adam
const mW = W.map(w => new Float32Array(w.length)), vW = W.map(w => new Float32Array(w.length));
const mB = B.map(b => new Float32Array(b.length)), vB = B.map(b => new Float32Array(b.length));
const gW = W.map(w => new Float32Array(w.length)), gB = B.map(b => new Float32Array(b.length));
let t = 0; let LR = 0.002; const B1 = 0.9, B2 = 0.999, EPS = 1e-8;

// โหลดภาพเป็น float พร้อมเลื่อนสุ่ม ±2 px (augmentation — ช่วยให้ทายลายมือที่วาดเองได้ดีขึ้น)
const xin = new Float32Array(784);
function loadImg(px, k, dx, dy){
  xin.fill(0);
  const o = k*784;
  for (let y = 0; y < 28; y++){
    const sy = y - dy; if (sy < 0 || sy > 27) continue;
    for (let x = 0; x < 28; x++){
      const sx = x - dx; if (sx < 0 || sx > 27) continue;
      xin[y*28+x] = px[o + sy*28 + sx] / 255;
    }
  }
  return xin;
}
const A1 = new Float32Array(16), A2 = new Float32Array(16), OUT = new Float32Array(10);
function forward(x){
  for (let j = 0; j < 16; j++){ let s = B[0][j]; for (let i = 0; i < 784; i++) s += x[i]*W[0][i*16+j]; A1[j] = s > 0 ? s : 0; }
  for (let j = 0; j < 16; j++){ let s = B[1][j]; for (let i = 0; i < 16; i++) s += A1[i]*W[1][i*16+j]; A2[j] = s > 0 ? s : 0; }
  let mx = -1e9;
  for (let j = 0; j < 10; j++){ let s = B[2][j]; for (let i = 0; i < 16; i++) s += A2[i]*W[2][i*10+j]; OUT[j] = s; if (s > mx) mx = s; }
  let z = 0; for (let j = 0; j < 10; j++){ OUT[j] = Math.exp(OUT[j]-mx); z += OUT[j]; }
  for (let j = 0; j < 10; j++) OUT[j] /= z;
  return OUT;
}
const d3 = new Float32Array(10), d2 = new Float32Array(16), d1 = new Float32Array(16);
function backward(x, y){
  for (let j = 0; j < 10; j++) d3[j] = OUT[j] - (j === y ? 1 : 0);
  for (let i = 0; i < 16; i++){ let s = 0; for (let j = 0; j < 10; j++){ gW[2][i*10+j] += A2[i]*d3[j]; s += W[2][i*10+j]*d3[j]; } d2[i] = A2[i] > 0 ? s : 0; }
  for (let j = 0; j < 10; j++) gB[2][j] += d3[j];
  for (let i = 0; i < 16; i++){ let s = 0; for (let j = 0; j < 16; j++){ gW[1][i*16+j] += A1[i]*d2[j]; s += W[1][i*16+j]*d2[j]; } d1[i] = A1[i] > 0 ? s : 0; }
  for (let j = 0; j < 16; j++) gB[1][j] += d2[j];
  for (let i = 0; i < 784; i++){ const xi = x[i]; if (!xi) continue; const o = i*16; for (let j = 0; j < 16; j++) gW[0][o+j] += xi*d1[j]; }
  for (let j = 0; j < 16; j++) gB[0][j] += d1[j];
}
function step(bs){
  t++;
  const c1 = 1 - Math.pow(B1, t), c2 = 1 - Math.pow(B2, t);
  for (let l = 0; l < 3; l++){
    const upd = (p, g, m, v) => { for (let i = 0; i < p.length; i++){ const gi = g[i]/bs; m[i] = B1*m[i] + (1-B1)*gi; v[i] = B2*v[i] + (1-B2)*gi*gi; p[i] -= LR*(m[i]/c1)/(Math.sqrt(v[i]/c2)+EPS); g[i] = 0; } };
    upd(W[l], gW[l], mW[l], vW[l]); upd(B[l], gB[l], mB[l], vB[l]);
  }
}
function testAcc(n){
  let ok = 0;
  for (let k = 0; k < n; k++){ const p = forward(loadImg(te.px, k, 0, 0)); let a = 0; for (let j = 1; j < 10; j++) if (p[j] > p[a]) a = j; if (a === teY[k]) ok++; }
  return ok / n;
}

// ภาพตัวอย่างสำหรับหน้าเว็บ: เลขละ 3 ภาพจากชุดทดสอบ (ไม่เคยใช้ฝึก)
const SAMPLE = [];
{ const cnt = new Array(10).fill(0); for (let k = 0; k < te.n && SAMPLE.length < 30; k++){ const y = teY[k]; if (cnt[y] < 3){ cnt[y]++; SAMPLE.push(k); } } }
// ภาพที่ใช้ดู "คำทายระหว่างฝึก" — 12 ภาพ
const WATCH = SAMPLE.filter((_, i) => i % 3 === 0).concat([SAMPLE[1], SAMPLE[4]]);

const log = [], watch = [];
function snapshot(stepNo, lossAvg){
  const acc = testAcc(2000);
  const guesses = WATCH.map(k => Array.from(forward(loadImg(te.px, k, 0, 0))).map(p => Math.round(p*255)));
  log.push({ step: stepNo, seen: stepNo*64, loss: +lossAvg.toFixed(4), acc: +acc.toFixed(4) });
  watch.push(guesses);
}

const EPOCHS = 20, BS = 64, N = tr.n;
const order = Array.from({ length: N }, (_, i) => i);
let stepNo = 0, lossSum = 0, lossCnt = 0;
snapshot(0, Math.log(10));
const logAt = new Set([5, 10, 20, 35, 50, 75]);
for (let ep = 0; ep < EPOCHS; ep++){
  LR = 0.002 * Math.pow(0.1, ep / (EPOCHS-1));
  for (let i = N-1; i > 0; i--){ const j = Math.floor(rnd()*(i+1)); const tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
  for (let b = 0; b + BS <= N; b += BS){
    for (let q = 0; q < BS; q++){
      const k = order[b+q];
      const aug = rnd() < 0.5; const x = loadImg(tr.px, k, aug ? Math.floor(rnd()*3)-1 : 0, aug ? Math.floor(rnd()*3)-1 : 0);
      const p = forward(x); lossSum += -Math.log(Math.max(1e-9, p[trY[k]])); lossCnt++;
      backward(x, trY[k]);
    }
    step(BS); stepNo++;
    if (logAt.has(stepNo) || stepNo % 250 === 0){ snapshot(stepNo, lossSum/lossCnt); lossSum = 0; lossCnt = 0; }
  }
  console.log("epoch", ep+1, "test acc(2000)", log[log.length-1].acc);
}
const finalAcc = testAcc(te.n);
console.log("final test acc (10k):", finalAcc);

function b64(f32){ return Buffer.from(f32.buffer, f32.byteOffset, f32.byteLength).toString("base64"); }
const out = {
  sizes: SIZES,
  W: W.map(b64), B: B.map(b64),
  testAcc: finalAcc, epochs: EPOCHS, batch: BS, trainN: N,
  samples: SAMPLE.map(k => ({ y: teY[k], px: Buffer.from(te.px.subarray(k*784, k*784+784)).toString("base64") })),
  watchIdx: WATCH.map(k => SAMPLE.indexOf(k)),
  log, watch
};
fs.mkdirSync(new URL("./out/", import.meta.url), { recursive: true });
fs.writeFileSync(new URL("./out/mnist.json", import.meta.url), JSON.stringify(out));
console.log("saved; bytes", JSON.stringify(out).length, "log points", log.length);
