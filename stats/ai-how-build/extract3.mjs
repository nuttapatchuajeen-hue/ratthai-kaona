// Activation patching (แนวเดียวกับ causal tracing ของ Meng et al. 2022 "ROME")
// รัน "Michael Jordan plays the sport of" แต่สลับผลลัพธ์ของชั้นหนึ่งชั้น ณ ตำแหน่งหนึ่ง
// ด้วยค่าจากประโยค "Michael Smith ..." แล้วดูว่า P(basketball) ตกลงเท่าไร
import fs from "node:fs";
import { W, encode, run, softmax, tokStr } from "./gpt2.mjs";

const OUT = new URL("./out/gpt2.json", import.meta.url);
const out = JSON.parse(fs.readFileSync(OUT, "utf8"));
const r4 = x => Math.round(x*1e4)/1e4;

const CLEAN = "Michael Jordan plays the sport of", CORR = "Michael Smith plays the sport of";
const ci = encode(CLEAN), ki = encode(CORR), tgt = encode(" basketball")[0];
if (ci.length !== ki.length) throw new Error("ความยาวโทเคนไม่เท่ากัน");
const namePos = ci.findIndex((t, i) => t !== ki[i]);
const last = ci.length - 1;
console.log("tokens", ci.map(tokStr), "namePos", namePos, tokStr(ci[namePos]), "vs", tokStr(ki[namePos]));

const base = softmax(run(ci).logits)[tgt];
const corr = run(ki, { capture: true });
const pCorr = softmax(corr.logits)[tgt];
console.log("p clean", base.toFixed(4), "p corrupted", pCorr.toFixed(4));

const rows = [];
for (const kind of ["mlp", "attn"]) for (const pos of [namePos, last]){
  const vals = [];
  for (let l = 0; l < W.NL; l++){
    const vec = (kind === "mlp" ? corr.comps.mlpAll : corr.comps.attnAll)[l + ":" + pos];
    const p = softmax(run(ci, { patch: [{ kind, layer: l, pos, vec }] }).logits)[tgt];
    vals.push(r4(p));
  }
  rows.push({ kind, pos, tok: tokStr(ci[pos]), p: vals });
  console.log(kind, "@", JSON.stringify(tokStr(ci[pos])), vals.map(v => (v*100).toFixed(1)).join(" "));
}
// สลับ MLP เป็น "ช่วง" 5 ชั้นติดกัน ณ ตำแหน่งชื่อ (ความรู้กระจายหลายชั้น — ROME ก็ใช้หน้าต่างหลายชั้น)
const windows = [];
for (let a = 0; a + 5 <= W.NL; a++){
  const patch = []; for (let l = a; l < a + 5; l++) patch.push({ kind: "mlp", layer: l, pos: namePos, vec: corr.comps.mlpAll[l + ":" + namePos] });
  const p = softmax(run(ci, { patch }).logits)[tgt];
  windows.push({ from: a, to: a + 4, p: r4(p) });
}
console.log("windows", windows.map(w => w.from + "-" + w.to + ":" + (w.p*100).toFixed(1)).join(" "));

out.patching = { clean: CLEAN, corrupt: CORR, target: "basketball", tokens: ci.map(tokStr), namePos, last, pClean: r4(base), pCorrupt: r4(pCorr), rows, windows };
fs.writeFileSync(OUT, JSON.stringify(out));
console.log("saved", JSON.stringify(out).length);
