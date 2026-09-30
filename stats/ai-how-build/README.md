# สคริปต์สร้างข้อมูลหมวด "หลักการทำงาน AI"

ผลลัพธ์สุดท้ายคือ `../ai-how-data.js` (`window.AIH_DATA`) ที่ `explore.html` โหลดตอนเปิดหมวดนี้
ทุกสคริปต์เป็น Node.js ล้วน (ทดสอบกับ Node 24) ไม่ต้องใช้ Python

## ไฟล์ต้นทางที่ต้องโหลดมาก่อน (ไม่เก็บในเรโป — ใหญ่)

```bash
mkdir -p mnist gpt2 glove out
for f in train-images-idx3-ubyte train-labels-idx1-ubyte t10k-images-idx3-ubyte t10k-labels-idx1-ubyte; do curl -sL -o mnist/$f.gz https://storage.googleapis.com/cvdf-datasets/mnist/$f.gz; done
for f in vocab.json merges.txt model.safetensors; do curl -sL -o gpt2/$f https://huggingface.co/openai-community/gpt2/resolve/main/$f; done
curl -sL -o glove/vocab.json https://huggingface.co/sentence-transformers/average_word_embeddings_glove.6B.300d/resolve/main/0_WordEmbeddings/whitespacetokenizer_config.json
```

`gpt2/model.safetensors` ≈ 548 MB · GloVe ไม่ต้องโหลดทั้งไฟล์ — `fetch-glove.mjs` อ่านเฉพาะแถวที่ใช้ด้วย HTTP Range

## ลำดับการรัน

| สคริปต์ | ทำอะไร | ได้ |
|---|---|---|
| `train-mnist.mjs` | ฝึกโครงข่าย 784→16→16→10 (ReLU, Adam, 20 รอบ) | `out/mnist.json` · ทายถูก 96.0% |
| `fetch-glove.mjs` | ดึงเวกเตอร์ GloVe 300 มิติ 225 คำ + ตรวจ king−man+woman | `out/glove.json` |
| `train-diffusion.mjs 16000` | ฝึก DDPM จิ๋วบนจุดรูป "AI" | `out/diffusion.json` · 98.3% ตกบนตัวอักษร |
| `extract.mjs` | forward pass GPT-2 (`gpt2.mjs`) → attention / logit lens / ทายคำ / คำตอบโมเดลดิบ / RAG | `out/gpt2.json` |
| `extract2.mjs` | แยกส่วน "กีฬาเป้าหมาย − กีฬาอื่น" รายชั้น + RAG ที่ตำแหน่งชื่อ | แก้ `out/gpt2.json` |
| `extract3.mjs` | activation patching Jordan ↔ Smith | แก้ `out/gpt2.json` |
| `extract4.mjs` | entropy จริงบนคลังเต็มทุก temperature | แก้ `out/gpt2.json` |
| `build-data.mjs` | รวมทั้งหมด → `../ai-how-data.js` | |

`probe.mjs "ประโยค" …` ใช้ลองดู 8 คำถัดไปที่ GPT-2 ทาย (ไว้เลือกตัวอย่างใหม่)
รัน GPT-2 ต้องเผื่อหน่วยความจำ: `node --max-old-space-size=6144 extract.mjs` (ใช้เวลาราว 7 นาที)
