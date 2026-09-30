// ลองยิงประโยคตัวเลือกหลาย ๆ แบบ เพื่อเลือกตัวอย่างที่ "ของจริง" แสดงแนวคิดได้ชัด
import { encode, decode, run, softmax, topK, tokStr } from "./gpt2.mjs";

const t0 = Date.now();
const ids = encode("Hello world, this is GPT-2 speaking.");
console.log(ids, JSON.stringify(decode(ids)));
function top(prompt, k = 8){
  const r = run(encode(prompt));
  const p = softmax(r.logits);
  return topK(r.logits, k).map(i => `${JSON.stringify(tokStr(i))} ${(p[i]*100).toFixed(1)}%`).join(" | ");
}
const prompts = process.argv.slice(2).length ? process.argv.slice(2) : [
  "Michael Jordan plays the sport of",
  "Serena Williams plays the sport of",
  "Tiger Woods plays the sport of",
  "Lionel Messi plays the sport of",
  "The Eiffel Tower is located in the city of",
  "The capital of France is",
  "The capital of Japan is",
  "I went to the store to buy some",
  "Once upon a time, there was a",
  "My favorite food is",
  "Thailand is famous for its",
  "The Prime Minister of Thailand is",
  "The first person to walk on Mars was",
  "Fact: In 2026, the Prime Minister of Thailand is Anutin Charnvirakul.\nThe Prime Minister of Thailand is",
];
for (const pr of prompts){ console.log("\n>>", JSON.stringify(pr)); console.log("   ", top(pr)); }
console.log("\ntime", (Date.now()-t0)/1000, "s");
