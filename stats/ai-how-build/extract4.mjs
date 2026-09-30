// entropy ที่แท้จริง (คำนวณบนคลังเต็ม 50,257 โทเคน) ของแต่ละประโยค ณ ทุก temperature ในกริด
import fs from "node:fs";
import { encode, run } from "./gpt2.mjs";
const OUT = new URL("./out/gpt2.json", import.meta.url);
const out = JSON.parse(fs.readFileSync(OUT, "utf8"));
for (const pr of out.next.prompts){
  const lg = run(encode(pr.prompt)).logits;
  pr.ent = out.next.temps.map(T => {
    let mx = -Infinity; for (const l of lg) if (l > mx) mx = l;
    let z = 0; for (const l of lg) z += Math.exp((l - mx)/T);
    let H = 0; for (const l of lg){ const p = Math.exp((l - mx)/T)/z; if (p > 0) H -= p*Math.log(p); }
    return Math.round(H*1e4)/1e4;
  });
  console.log(pr.prompt, "H(T=1) =", pr.ent[18], "perplexity", Math.exp(pr.ent[18]).toFixed(0));
}
fs.writeFileSync(OUT, JSON.stringify(out));
