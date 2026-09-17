/* สร้าง stats/bkk-brand-logos.js จากไฟล์ .webp ในโฟลเดอร์นี้
   รัน:  node stats/img/brand-logos/build-logos-js.js

   ทำไมต้องฝังเป็น data URL: ผู้ใช้เปิดหน้าเว็บด้วย file:// บ่อย ซึ่ง fetch()/map.loadImage()
   ไฟล์ข้าง ๆ ไม่ได้ และรูปจาก file:// ทำให้ canvas "เปื้อน" จน map.addImage() อ่านพิกเซลไม่ได้
   data URL ผ่านทั้งสองกรณี

   ไฟล์ .webp ย่อมาแล้ว (ด้านยาวสุด 128 px ตัดขอบว่างออก) จากไฟล์ต้นฉบับบนเว็บทางการของแต่ละแบรนด์
   ยกเว้น lotus/major/sf ใช้ไอคอนแอปทางการบน App Store (via: "appstore" — เว็บทางการบล็อก หรือโลโก้บนเว็บเล็กจนดูไม่ออก)
   และ robinson ที่เว็บทางการล่ม จึงใช้ไอคอนเว็บที่ Google เก็บไว้ (via: "google")
   เก็บข้อมูล: 17 ก.ย. 2569 */
const fs = require("fs");
const path = require("path");

// key ตรงกับ p.b ใน bkk-brands-data.js
// src = ไฟล์ต้นฉบับที่ดึงมา · site = โดเมนทางการ (ใช้เป็นตัวสำรองผ่านบริการไอคอนของ Google ตอนรูปในเครื่องโหลดไม่ขึ้น)
const SOURCES = {
  amazon:        { site: "cafe-amazon.com",     src: "https://www.cafe-amazon.com/_next/static/media/amz-nav-logo.5520ca5d.png" },
  bigc:          { site: "bigc.co.th",          src: "https://www.bigc.co.th/images-v2/logo-bigc.svg" },
  central:       { site: "central.co.th",       src: "https://www.central.co.th/logo.svg" },
  dohome:        { site: "dohome.co.th",        src: "https://www.dohome.co.th/apple-icon.png" },
  em:            { site: "emdistrict.com",      src: "https://emdistrict.com/wp-content/uploads/2023/11/android-chrome-192x192-1.png" },
  fashionisland: { site: "fashionisland.co.th", src: "https://www.fashionisland.co.th/wp-content/themes/fashion-island/img/logo.png" },
  futurepark:    { site: "futurepark.co.th",    src: "https://www.futurepark.co.th/wp-content/uploads/2026/04/favicon-300x300.png" },
  globalhouse:   { site: "globalhouse.co.th",   src: "https://globalhouse.co.th/images/logo.png" },
  homepro:       { site: "homepro.co.th",       src: "https://staticg.homepro.co.th/assets/images/icon/apple-touch-icon.png" },
  iconsiam:      { site: "iconsiam.com",        src: "https://www.iconsiam.com/media/loading/logo.svg" },
  kfc:           { site: "kfc.co.th",           src: "https://www.kfc.co.th/logo192.png" },
  lotus:         { site: "lotuss.com",          src: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/92/1c/a8/921ca8bc-c916-47ca-361e-4422ca5002dd/AppIcon-0-0-1x_U007emarketing-0-6-0-85-220.png/512x512bb.jpg", via: "appstore" },
  major:         { site: "majorcineplex.com",   src: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/9c/6f/6f/9c6f6f45-084c-a471-673a-611945aacbd2/AppIcon-PROD-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg", via: "appstore" },
  makro:         { site: "makro.pro",           src: "https://www.makro.pro/favicon/apple-icon-180x180.png" },
  mbk:           { site: "mbk-center.co.th",    src: "https://www.mbk-center.co.th/img/favicon.png" },
  mcdonalds:     { site: "mcdonalds.co.th",     src: "https://www.mcdonalds.co.th/assets/img/main-logo_b&w@2x.png" },
  mega:          { site: "megabangna.com",      src: "https://www.megabangna.com/icon.svg" },
  megahome:      { site: "megahome.co.th",      src: "https://static-hp.gumlet.io/assets/images/icon/MEGAICON.png" },
  mk:            { site: "mkrestaurant.com",    src: "https://www.mkrestaurant.com/public/assets/img/icon/logo__mk.png" },
  robinson:      { site: "robinson.co.th",      src: "https://www.google.com/s2/favicons?domain=www.robinson.co.th&sz=128", via: "google" },
  seacon:        { site: "seaconsquare.com",    src: "https://www.seaconsquare.com/media/images/logo/logo-seacon.svg" },
  sf:            { site: "sfcinema.com",        src: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/d1/90/55/d19055cd-0030-7968-3f0c-e0586183eeee/AppIcon-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg", via: "appstore" },
  siam:          { site: "siampiwat.com",       src: "https://www.siampiwat.com/images/favicon.svg" },
  starbucks:     { site: "starbucks.co.th",     src: "https://www.starbucks.co.th/media/starbucks_corporation_logo.png" },
  terminal21:    { site: "terminal21.co.th",    src: "https://www.terminal21.co.th/wp-content/uploads/2019/12/terminl_text_logo-main.png" },
  thaiwatsadu:   { site: "thaiwatsadu.com",     src: "https://www.thaiwatsadu.com/icon.png" },
  themall:       { site: "themalllifestore.com", src: "https://themalllifestore.com/img/design/site-logo.svg" }
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

const out = path.join(dir, "..", "..", "bkk-brand-logos.js");
const body =
  "/* โลโก้แบรนด์สำหรับชั้น \"ห้างร้าน & แบรนด์ทั่วประเทศ\" ในหน้า กรุงเทพฯ ทะลุมิติ\n" +
  "   สร้างอัตโนมัติด้วย stats/img/brand-logos/build-logos-js.js — อย่าแก้ด้วยมือ\n" +
  "   ที่มา: ไฟล์โลโก้จากเว็บทางการของแต่ละแบรนด์ · lotus/major/sf = ไอคอนแอปทางการบน App Store · robinson = ไอคอนเว็บที่ Google เก็บไว้\n" +
  "   โลโก้เป็นเครื่องหมายการค้าของเจ้าของแต่ละราย ใช้เพื่อบอกตำแหน่งสาขาบนแผนที่เท่านั้น\n" +
  "   เก็บข้อมูล: 17 ก.ย. 2569 · " + Object.keys(logos).length + " แบรนด์ */\n" +
  "window.BKK_BRAND_LOGOS = " + JSON.stringify(logos) + ";\n";
fs.writeFileSync(out, body);
console.log("เขียน", out, Object.keys(logos).length, "แบรนด์", (body.length / 1024).toFixed(1) + " KB");
