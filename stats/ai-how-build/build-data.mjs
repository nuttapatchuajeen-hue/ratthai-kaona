// รวม out/*.json → stats/ai-how-data.js (window.AIH_DATA) ให้หน้าเว็บโหลดครั้งเดียวตอนเปิดหมวด
import fs from "node:fs";
const O = n => JSON.parse(fs.readFileSync(new URL("./out/" + n, import.meta.url), "utf8"));
const mnist = O("mnist.json"), glove = O("glove.json"), diff = O("diffusion.json"), gpt2 = O("gpt2.json");
const DEST = new URL("../ai-how-data.js", import.meta.url);
const head = `/* ข้อมูลจริงของหมวด "หลักการทำงาน AI" (stats/explore.html) — สร้างอัตโนมัติ อย่าแก้มือ
   mnist : โครงข่าย 784→16→16→10 ฝึกเองบน MNIST (LeCun et al.) 60,000 ภาพ · น้ำหนัก Float32 base64 · ทายถูก ${(mnist.testAcc*100).toFixed(2)}% บน 10,000 ภาพทดสอบ
   glove : เวกเตอร์คำ GloVe 6B 300 มิติ (Pennington, Socher & Manning 2014) เฉพาะ ${glove.words.length} คำ · int8 ต่อแถว + สเกล
   diff  : โมเดล DDPM จิ๋ว (Ho et al. 2020) ฝึกเองบนจุด 2 มิติรูปตัวอักษร "AI" · ตารางเสียง cosine T=${diff.T}
   gpt2  : ค่าภายในของ GPT-2 small (OpenAI 2019, ${gpt2.model.params.toLocaleString("en-US")} พารามิเตอร์) คำนวณด้วย forward pass ที่เขียนเอง
   สคริปต์ที่ใช้สร้าง (stats/ai-how-build/): train-mnist.mjs · fetch-glove.mjs · train-diffusion.mjs · gpt2.mjs + extract*.mjs (สร้างเมื่อ 30 ก.ย. 2569) */
`;
fs.writeFileSync(DEST, head + "window.AIH_DATA=" + JSON.stringify({ mnist, glove, diff, gpt2 }) + ";\n");
console.log("wrote", fs.statSync(DEST).size, "bytes");
