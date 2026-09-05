#!/usr/bin/env node
/*
 * ดึงอนุกรมกำลังของสายพานมหาสมุทร (AMOC) รายเดือน มาเก็บไว้ในเครื่อง
 *
 * ทำไมต้องเก็บไฟล์ไว้เอง
 *   ต้นทาง (climate.metoffice.cloud) ไม่ส่งหัว CORS มาด้วย เบราว์เซอร์จึงยิงตรงไม่ได้
 *   และพร็อกซีสาธารณะที่หน้าเว็บใช้อยู่ก็ล่ม/ขอคีย์กันเป็นระยะ (corsproxy.io ขอ API key แล้ว)
 *   หัวข้อนี้เลยใช้ไฟล์ในเครื่องเป็นหลัก แล้วค่อยลองยิงสดทับทีหลัง — ถ้ายิงติดก็ได้ข้อมูลใหม่กว่า
 *   ถ้าไม่ติดก็ยังมีกราฟให้ดู ไม่ใช่ช่องว่าง
 *
 * ใช้ยังไง
 *   node build-amoc.mjs            → เขียนทับ amoc-transports.json ในโฟลเดอร์นี้
 *
 * ⚠️ รันใหม่เมื่อไร ให้แก้วันที่ "สืบค้นเมื่อ" ใต้กราฟในหน้า explore.html ตามด้วย
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = "https://climate.metoffice.cloud/formatted_data/";

const SETS = [
  { key: "rapid", file: "amoc_rapid_RAPID.csv",
    label: "RAPID 26.5°N",
    doi: "https://doi.org/10.5285/223b34a3-2dc5-c945-e063-7086abc0f274",
    note: "แนวทุ่นตรวจวัดพาดขวางแอตแลนติกที่ละติจูด 26.5°N (RAPID-MOCHA-WBTS)" },
  { key: "osnap", file: "amoc_osnap_OSNAP.csv",
    label: "OSNAP",
    doi: "https://doi.org/10.35090/gatech/70342",
    note: "แนวตรวจวัดเขตซับโพลาร์ แคนาดา–กรีนแลนด์–สกอตแลนด์ (OSNAP)" }
];

/* CSV ของ Met Office: บรรทัด # คือคำอ้างอิง แล้วตามด้วย Year,Month,<ค่า>,<ความไม่แน่นอน> */
function parse(text) {
  const out = [];
  for (const line of text.trim().split(/\r?\n/)) {
    if (line.startsWith("#")) continue;
    const c = line.split(",");
    if (c.length < 3 || !/^\d{4}$/.test(c[0].trim())) continue;
    const v = parseFloat(c[2]);
    if (Number.isNaN(v)) continue;                 // เดือนที่ยังไม่มีค่า — ข้ามไป ไม่เติมศูนย์
    out.push([+c[0], +c[1], Math.round(v * 100) / 100]);
  }
  return out;
}

const series = {};
for (const s of SETS) {
  const url = BASE + s.file;
  process.stdout.write("ดึง " + s.label + " … ");
  const r = await fetch(url);
  if (!r.ok) throw new Error(s.file + " → HTTP " + r.status);
  const rows = parse(await r.text());
  if (!rows.length) throw new Error(s.file + " → ไม่มีแถวข้อมูล");
  const a = rows[0], b = rows[rows.length - 1];
  series[s.key] = {
    label: s.label, note: s.note, doi: s.doi, unit: "Sv",
    from: a[0] + "-" + String(a[1]).padStart(2, "0"),
    to: b[0] + "-" + String(b[1]).padStart(2, "0"),
    monthly: rows
  };
  console.log(rows.length + " เดือน (" + series[s.key].from + " ถึง " + series[s.key].to + ")");
}

const out = {
  title: "กำลังของสายพานมหาสมุทรแอตแลนติก (AMOC) รายเดือน · หน่วยสเวอร์ดรุป (Sv)",
  source: "RAPID-MOCHA-WBTS 26.5°N และ OSNAP · รวบรวมโดย Met Office Climate Dashboard",
  sourceUrl: "https://climate.metoffice.cloud/amoc.html",
  retrieved: new Date().toISOString().slice(0, 10),
  series
};
const dst = path.join(HERE, "amoc-transports.json");
fs.writeFileSync(dst, JSON.stringify(out), "utf8");
console.log("เขียน " + dst + " (" + fs.statSync(dst).size + " ไบต์)");
