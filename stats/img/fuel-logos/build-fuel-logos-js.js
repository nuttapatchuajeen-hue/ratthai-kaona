/* สร้าง stats/bkk-fuel-logos.js จากไฟล์ .webp ในโฟลเดอร์นี้ — โลโก้แบรนด์ปั๊มน้ำมันสำหรับชั้น "ปั๊มน้ำมัน" (bkk-fuel.js)
   รัน:  node stats/img/fuel-logos/build-fuel-logos-js.js

   ฝังเป็น data URL ด้วยเหตุผลเดียวกับ ../brand-logos/build-logos-js.js (เปิดผ่าน file:// ได้ + canvas ไม่ "เปื้อน" ตอน map.addImage)

   ไฟล์ .webp ย่อด้วย ffmpeg (ด้านยาวสุด 128 px) จากไฟล์ต้นฉบับบนเว็บทางการ
     caltex: ตัดเฉพาะดาวจากโลโก้แนวนอน (crop=46:45:0:0)
     bcp: เว็บบางจากกันบอท → ใช้ไอคอนแอปทางการ "Bangchak" (ผู้เผยแพร่ Bangchak Corporation) บน App Store (via: "appstore")
     pure (IRPC): ไม่พบโลโก้ทางการที่คมพอ → ไม่มีไฟล์ bkk-fuel.js วาดตัวอักษรแทน
   เก็บข้อมูล: 28 ก.ย. 2569 */
const fs = require("fs");
const path = require("path");

// key ตรงกับรหัสแบรนด์ใน bkk-fuel-data.js (D.brands[..][0])
const SOURCES = {
  ptt:    { site: "pttor.com",         src: "https://www.pttor.com/wp-content/uploads/2024/08/favicon-300x300.png" },
  bcp:    { site: "bangchak.co.th",    src: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/ff/87/be/ff87be11-c9d7-df6a-8fd6-025f60bd8238/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg", via: "appstore" },
  shell:  { site: "shell.co.th",       src: "https://www.shell.co.th/etc.clientlibs/amidala/clientlibs/theme-base/resources/favicon/apple-touch-icon.png" },
  caltex: { site: "caltex.com",        src: "https://www.caltex.com/content/dam/caltex/common/icon/corporate/caltex_logo.png" },
  pt:     { site: "ptgenergy.co.th",   src: "https://www.ptgenergy.co.th/images/logo.png" },
  susco:  { site: "susco.co.th",       src: "https://www.susco.co.th/images/icon.png" },
  cosmo:  { site: "cosmo-energy.co.jp", src: "https://www.cosmo-energy.co.jp/etc.clientlibs/cosmo/clientlibs/clientlib-resources/resources/apple-touch-icon-180x180.png" }
};

// อ่านขนาดจากหัวไฟล์ WebP (VP8X = มีช่องโปร่งใส, VP8L = lossless, VP8 = lossy)
function webpSize(b) {
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (kind === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { w: 1 + (bits & 0x3fff), h: 1 + ((bits >> 14) & 0x3fff) };
  }
  if (kind === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  throw new Error("ไม่รู้จักรูปแบบ WebP: " + kind);
}

const dir = __dirname;
const logos = {};
for (const key of Object.keys(SOURCES)) {
  const file = path.join(dir, key + ".webp");
  if (!fs.existsSync(file)) { console.warn("ไม่มีไฟล์", key); continue; }
  const b = fs.readFileSync(file);
  const s = webpSize(b);
  logos[key] = {
    w: s.w, h: s.h,
    site: SOURCES[key].site,
    via: SOURCES[key].via || "official",
    src: "data:image/webp;base64," + b.toString("base64")
  };
}

const out = path.join(dir, "..", "..", "bkk-fuel-logos.js");
const body =
  "/* โลโก้แบรนด์ปั๊มน้ำมันสำหรับชั้น \"ปั๊มน้ำมัน\" ในหน้า กรุงเทพฯ ทะลุมิติ\n" +
  "   สร้างอัตโนมัติด้วย stats/img/fuel-logos/build-fuel-logos-js.js — อย่าแก้ด้วยมือ\n" +
  "   ที่มา: ไฟล์โลโก้จากเว็บทางการของแต่ละแบรนด์ · bcp = ไอคอนแอปทางการบน App Store\n" +
  "   โลโก้เป็นเครื่องหมายการค้าของเจ้าของแต่ละราย ใช้เพื่อบอกตำแหน่งปั๊มบนแผนที่เท่านั้น\n" +
  "   เก็บข้อมูล: 28 ก.ย. 2569 · " + Object.keys(logos).length + " แบรนด์ */\n" +
  "window.BKK_FUEL_LOGOS = " + JSON.stringify(logos) + ";\n";
fs.writeFileSync(out, body);
console.log("เขียน", out, Object.keys(logos).length, "แบรนด์", (body.length / 1024).toFixed(1) + " KB");
