// ดึงเวกเตอร์ GloVe 6B 300 มิติ (Stanford, Pennington et al. 2014) เฉพาะคำที่ใช้ในหน้าเว็บ
// ใช้ HTTP Range อ่านทีละแถวจาก safetensors — ไม่ต้องโหลดทั้งไฟล์ 480 MB
import fs from "node:fs";

const BASE = "https://huggingface.co/sentence-transformers/average_word_embeddings_glove.6B.300d/resolve/main/0_WordEmbeddings/model.safetensors";
const HDR = 8 + 120;     // 8 ไบต์ความยาว header + header JSON 120 ไบต์ (อ่านมาแล้ว)
const DIM = 300;

// คำ → คำแปลไทย · จัดกลุ่มไว้ใช้ทำชุดตัวอย่าง
export const GROUPS = {
  royal:   [["king","กษัตริย์"],["queen","ราชินี"],["prince","เจ้าชาย"],["princess","เจ้าหญิง"],["man","ผู้ชาย"],["woman","ผู้หญิง"],["boy","เด็กชาย"],["girl","เด็กหญิง"],["father","พ่อ"],["mother","แม่"],["son","ลูกชาย"],["daughter","ลูกสาว"],["husband","สามี"],["wife","ภรรยา"],["brother","พี่ชาย/น้องชาย"],["sister","พี่สาว/น้องสาว"],["uncle","ลุง/น้า"],["aunt","ป้า/น้า"],["actor","นักแสดงชาย"],["actress","นักแสดงหญิง"],["emperor","จักรพรรดิ"],["empress","จักรพรรดินี"]],
  capital: [["thailand","ไทย"],["bangkok","กรุงเทพฯ"],["japan","ญี่ปุ่น"],["tokyo","โตเกียว"],["france","ฝรั่งเศส"],["paris","ปารีส"],["china","จีน"],["beijing","ปักกิ่ง"],["germany","เยอรมนี"],["berlin","เบอร์ลิน"],["italy","อิตาลี"],["rome","โรม"],["russia","รัสเซีย"],["moscow","มอสโก"],["vietnam","เวียดนาม"],["hanoi","ฮานอย"],["england","อังกฤษ"],["london","ลอนดอน"],["egypt","อียิปต์"],["cairo","ไคโร"],["spain","สเปน"],["madrid","มาดริด"],["korea","เกาหลี"],["seoul","โซล"],["india","อินเดีย"],["delhi","เดลี"],["canada","แคนาดา"],["ottawa","ออตตาวา"],["greece","กรีซ"],["athens","เอเธนส์"],["laos","ลาว"],["vientiane","เวียงจันทน์"],["cambodia","กัมพูชา"],["phnom","พนมเปญ"],["indonesia","อินโดนีเซีย"],["jakarta","จาการ์ตา"]],
  animal:  [["dog","สุนัข"],["cat","แมว"],["puppy","ลูกสุนัข"],["kitten","ลูกแมว"],["horse","ม้า"],["cow","วัว"],["calf","ลูกวัว"],["lion","สิงโต"],["tiger","เสือ"],["elephant","ช้าง"],["bird","นก"],["fish","ปลา"],["snake","งู"],["monkey","ลิง"],["duck","เป็ด"],["chicken","ไก่"]],
  food:    [["rice","ข้าว"],["noodle","ก๋วยเตี๋ยว"],["bread","ขนมปัง"],["pizza","พิซซ่า"],["coffee","กาแฟ"],["tea","ชา"],["milk","นม"],["sugar","น้ำตาล"],["salt","เกลือ"],["fruit","ผลไม้"],["apple","แอปเปิล"],["banana","กล้วย"],["mango","มะม่วง"],["durian","ทุเรียน"],["soup","ซุป"],["beer","เบียร์"],["wine","ไวน์"]],
  verb:    [["walk","เดิน"],["walked","เดิน (อดีต)"],["walking","กำลังเดิน"],["swim","ว่ายน้ำ"],["swam","ว่ายน้ำ (อดีต)"],["swimming","กำลังว่ายน้ำ"],["run","วิ่ง"],["ran","วิ่ง (อดีต)"],["running","กำลังวิ่ง"],["go","ไป"],["went","ไป (อดีต)"],["going","กำลังไป"],["eat","กิน"],["ate","กิน (อดีต)"],["eating","กำลังกิน"],["write","เขียน"],["wrote","เขียน (อดีต)"],["writing","กำลังเขียน"],["see","เห็น"],["saw","เห็น (อดีต)"],["seeing","กำลังเห็น"],["fly","บิน"],["flew","บิน (อดีต)"],["flying","กำลังบิน"]],
  adj:     [["big","ใหญ่"],["bigger","ใหญ่กว่า"],["biggest","ใหญ่ที่สุด"],["small","เล็ก"],["smaller","เล็กกว่า"],["smallest","เล็กที่สุด"],["good","ดี"],["better","ดีกว่า"],["best","ดีที่สุด"],["bad","แย่"],["worse","แย่กว่า"],["worst","แย่ที่สุด"],["fast","เร็ว"],["faster","เร็วกว่า"],["fastest","เร็วที่สุด"],["hot","ร้อน"],["hotter","ร้อนกว่า"],["hottest","ร้อนที่สุด"],["cold","หนาว"],["colder","หนาวกว่า"],["coldest","หนาวที่สุด"],["happy","มีความสุข"],["sad","เศร้า"],["angry","โกรธ"]],
  sport:   [["football","ฟุตบอล"],["soccer","ซอคเกอร์"],["basketball","บาสเกตบอล"],["tennis","เทนนิส"],["golf","กอล์ฟ"],["baseball","เบสบอล"],["boxing","มวย"],["swimmer","นักว่ายน้ำ"],["player","ผู้เล่น"],["coach","โค้ช"],["team","ทีม"],["goal","ประตู"]],
  tech:    [["computer","คอมพิวเตอร์"],["software","ซอฟต์แวร์"],["internet","อินเทอร์เน็ต"],["robot","หุ่นยนต์"],["phone","โทรศัพท์"],["data","ข้อมูล"],["network","เครือข่าย"],["algorithm","อัลกอริทึม"],["google","กูเกิล"],["microsoft","ไมโครซอฟท์"],["apple_co","(ชื่อบริษัท)"]],
  number:  [["one","หนึ่ง"],["two","สอง"],["three","สาม"],["four","สี่"],["five","ห้า"],["six","หก"],["seven","เจ็ด"],["eight","แปด"],["nine","เก้า"],["ten","สิบ"],["hundred","ร้อย"],["thousand","พัน"],["million","ล้าน"]],
  color:   [["red","แดง"],["green","เขียว"],["blue","น้ำเงิน"],["yellow","เหลือง"],["black","ดำ"],["white","ขาว"],["orange","ส้ม"],["purple","ม่วง"]],
  job:     [["doctor","หมอ"],["nurse","พยาบาล"],["teacher","ครู"],["student","นักเรียน"],["engineer","วิศวกร"],["farmer","ชาวนา"],["soldier","ทหาร"],["police","ตำรวจ"],["lawyer","ทนาย"],["scientist","นักวิทยาศาสตร์"],["hospital","โรงพยาบาล"],["school","โรงเรียน"],["university","มหาวิทยาลัย"],["farm","ไร่นา"],["court","ศาล"]],
  time:    [["monday","วันจันทร์"],["tuesday","วันอังคาร"],["sunday","วันอาทิตย์"],["january","มกราคม"],["february","กุมภาพันธ์"],["december","ธันวาคม"],["morning","เช้า"],["night","กลางคืน"],["day","วัน"],["week","สัปดาห์"],["year","ปี"]],
  misc:    [["water","น้ำ"],["fire","ไฟ"],["sun","ดวงอาทิตย์"],["moon","ดวงจันทร์"],["river","แม่น้ำ"],["sea","ทะเล"],["mountain","ภูเขา"],["car","รถยนต์"],["train","รถไฟ"],["plane","เครื่องบิน"],["money","เงิน"],["bank","ธนาคาร"],["book","หนังสือ"],["music","ดนตรี"],["love","ความรัก"],["war","สงคราม"],["peace","สันติภาพ"]]
};

const vocab = JSON.parse(fs.readFileSync(new URL("./glove/vocab.json", import.meta.url), "utf8")).vocab;
const index = new Map(); vocab.forEach((w, i) => { if (!index.has(w)) index.set(w, i); });

const words = [];
for (const [g, list] of Object.entries(GROUPS)) for (const [w, th] of list){
  const key = w === "apple_co" ? null : w;
  if (!key) continue;
  const i = index.get(key);
  if (i == null){ console.log("ไม่พบคำ", w); continue; }
  if (words.find(x => x.w === w)) continue;
  words.push({ w, th, g, i });
}
console.log("words", words.length);

async function row(i, tries = 4){
  const a = HDR + i*DIM*4, b = a + DIM*4 - 1;
  for (let k = 0; k < tries; k++){
    try {
      const r = await fetch(BASE, { headers: { Range: `bytes=${a}-${b}` } });
      if (r.status !== 206) throw new Error("status " + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length !== DIM*4) throw new Error("len " + buf.length);
      return new Float32Array(buf.buffer, buf.byteOffset, DIM).slice();
    } catch (e){ if (k === tries-1) throw e; await new Promise(r => setTimeout(r, 800)); }
  }
}
const vecs = new Array(words.length);
let next = 0;
async function worker(){ while (next < words.length){ const k = next++; vecs[k] = await row(words[k].i); } }
await Promise.all(Array.from({ length: 8 }, worker));

// ตรวจความถูกต้อง: king - man + woman → ใกล้ queen ไหม (ค้นในคลังคำชุดนี้)
function norm(v){ let s = 0; for (const x of v) s += x*x; return Math.sqrt(s); }
function cos(a, b){ let s = 0; for (let i = 0; i < DIM; i++) s += a[i]*b[i]; return s/(norm(a)*norm(b)); }
const V = Object.fromEntries(words.map((w, k) => [w.w, vecs[k]]));
function analogy(a, b, c){
  const q = new Float32Array(DIM); for (let i = 0; i < DIM; i++) q[i] = V[b][i] - V[a][i] + V[c][i];
  return words.filter(w => ![a,b,c].includes(w.w)).map(w => [w.w, cos(q, V[w.w])]).sort((x, y) => y[1]-x[1]).slice(0, 3);
}
console.log("man:king :: woman:?", analogy("man", "king", "woman"));
console.log("france:paris :: thailand:?", analogy("france", "paris", "thailand"));
console.log("walk:walked :: swim:?", analogy("walk", "walked", "swim"));
console.log("big:bigger :: small:?", analogy("big", "bigger", "small"));

// เก็บเป็น int8 ต่อแถว + สเกล (คลาดเคลื่อน cosine < 0.001)
const q8 = new Int8Array(words.length*DIM), scale = [];
words.forEach((w, k) => {
  const v = vecs[k]; let m = 0; for (const x of v) m = Math.max(m, Math.abs(x));
  const s = m/127; scale.push(+s.toPrecision(6));
  for (let i = 0; i < DIM; i++) q8[k*DIM+i] = Math.round(v[i]/s);
});
const out = { dim: DIM, words: words.map(({ w, th, g }) => ({ w, th, g })), scale, q8: Buffer.from(q8.buffer).toString("base64") };
fs.mkdirSync(new URL("./out/", import.meta.url), { recursive: true });
fs.writeFileSync(new URL("./out/glove.json", import.meta.url), JSON.stringify(out));
console.log("saved bytes", JSON.stringify(out).length);
