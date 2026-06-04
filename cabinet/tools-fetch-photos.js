/* ============================================================
   tools-fetch-photos.js
   ดึงรูปคณะรัฐมนตรี (คณะที่ 66) จาก Wikimedia Commons (สัญญาอนุญาตเสรี)
   ลงโฟลเดอร์ photos/ + สร้าง photos/credits.json (ผู้สร้างสรรค์ + สัญญาอนุญาต)
   วิธีรัน:  node "tools-fetch-photos.js"
   ============================================================ */
const fs = require('fs');
const path = require('path');

// roster: [ministryId, indexWithinMinistry, ชื่อ]
const ROSTER = [
  ["01",1,"อนุทิน ชาญวีรกูล"],["01",2,"ศุภมาส อิศรภักดี"],["01",3,"นภินทร ศรีสรรพางค์"],["01",4,"ภราดร ปริศนานันทกุล"],["01",5,"สุขสมรวย วันทนียกุล"],
  ["02",1,"อดุลย์ บุญธรรมเจริญ"],
  ["03",1,"เอกนิติ นิติทัณฑ์ประภาศ"],
  ["04",1,"สีหศักดิ์ พวงเกตุแก้ว"],
  ["05",1,"สุรศักดิ์ พันธ์เจริญวรกุล"],
  ["06",1,"นิกร โสมกลาง"],
  ["07",1,"สุริยะ จึงรุ่งเรืองกิจ"],["07",2,"วัชระพล ขาวขำ"],["07",3,"ปิยะรัฐชย์ ติยะไพรัช"],
  ["08",1,"พิพัฒน์ รัชกิจประการ"],["08",2,"สิริพงศ์ อังคสกุลเกียรติ"],["08",3,"ภัทรพงศ์ ภัทรประสิทธิ์"],["08",4,"สรรเพชญ บุญญามณี"],
  ["09",1,"สุชาติ ชมกลิ่น"],
  ["11",1,"ไชยชนก ชิดชอบ"],["11",2,"บุณย์ธิดา สมชัย"],
  ["12",1,"เอกนัฏ พร้อมพันธุ์"],
  ["13",1,"ศุภจี สุธรรมพันธุ์"],
  ["14",1,"พลพีร์ สุวรรณฉวี"],["14",2,"เจเศรษฐ์ ไทยเศรษฐ์"],["14",3,"วรศิษฎ์ เลียงประสิทธิ์"],
  ["15",1,"รุทธพล เนาวรัตน์"],
  ["16",1,"จุลพันธ์ อมรวิวัฒน์"],
  ["17",1,"ซาบีดา ไทยเศรษฐ์"],
  ["18",1,"ยศชนัน วงศ์สวัสดิ์"],
  ["19",1,"ประเสริฐ จันทรรวงทอง"],["19",2,"อัครนันท์ กัณณ์กิตตินันท์"],
  ["21",1,"พัฒนา พร้อมพัฒน์"],
  ["22",1,"วราวุธ ศิลปอาชา"]
];

const UA = {headers:{"User-Agent":"ThaiCabinetSite/1.0 (educational; contact via site)"}};
const OUT = path.join(__dirname, 'photos');
const THUMB = 500;   // ขนาดมาตรฐานที่มักถูกแคชไว้แล้ว (ลดโอกาสโดน rate-limit ตอนสร้าง thumb)
const API = "https://th.wikipedia.org/w/api.php";

const stripTags = s => (s||"").replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim();
const sleep = ms => new Promise(r=>setTimeout(r,ms));

async function api(params){
  const u = API + "?" + Object.entries(params).map(([k,v])=>k+"="+encodeURIComponent(v)).join("&");
  const r = await fetch(u, UA);
  return r.json();
}

// fetch with retry + exponential backoff (handles 429 rate limiting)
async function fetchRetry(url, tries=5){
  let wait=1500;
  for(let i=0;i<tries;i++){
    const r = await fetch(url, UA);
    if(r.ok) return r;
    if(r.status===429 || r.status>=500){ await sleep(wait); wait*=2; continue; }
    throw new Error("HTTP "+r.status);
  }
  throw new Error("HTTP 429 (gave up after "+tries+" tries)");
}

(async()=>{
  if(!fs.existsSync(OUT)) fs.mkdirSync(OUT,{recursive:true});

  // 1) pageimages -> thumb url + file title, batched
  const byName = {};      // name -> {thumb, file}
  for(let i=0;i<ROSTER.length;i+=12){
    const batch = ROSTER.slice(i,i+12).map(r=>r[2]);
    const j = await api({action:"query",redirects:1,prop:"pageimages",piprop:"thumbnail|name",pithumbsize:THUMB,format:"json",titles:batch.join("|")});
    const norm={}; (j.query.normalized||[]).forEach(n=>norm[n.to]=n.from);
    const red={};  (j.query.redirects||[]).forEach(n=>red[n.to]=n.from);
    Object.values(j.query.pages).forEach(p=>{
      let orig=p.title; if(red[orig])orig=red[orig]; if(norm[orig])orig=norm[orig];
      byName[orig]={thumb:p.thumbnail?p.thumbnail.source:null, file:p.pageimage?("File:"+p.pageimage):null};
    });
  }

  // 2) download thumbs
  const map = {};         // name -> filename
  const files = [];       // {name, file, filename}
  for(const [id,idx,name] of ROSTER){
    const e = byName[name];
    if(!e || !e.thumb){ map[name]=null; console.log("--  no photo  "+name); continue; }
    const ext = (e.thumb.split("?")[0].match(/\.(jpg|jpeg|png|webp)$/i)||[".jpg"])[0].toLowerCase().replace("jpeg","jpg");
    const filename = id+"-"+idx+ext;
    const dest = path.join(OUT,filename);
    if(fs.existsSync(dest) && fs.statSync(dest).size>2000){   // resume: skip already-downloaded
      map[name]=filename; files.push({name, file:e.file, filename});
      console.log("··  skip      "+filename+"  (exists)  "+name); continue;
    }
    try{
      const r = await fetchRetry(e.thumb);
      const buf = Buffer.from(await r.arrayBuffer());
      fs.writeFileSync(dest, buf);
      map[name]=filename;
      files.push({name, file:e.file, filename});
      console.log("OK  "+filename.padEnd(10)+(buf.length/1024|0)+"KB  "+name);
      await sleep(1100);   // throttle to avoid 429
    }catch(err){ map[name]=null; console.log("ERR "+name+"  "+err.message); }
  }

  // 3) credits (artist + license) via imageinfo extmetadata on commons
  const credits = {};
  const fileTitles = files.filter(f=>f.file).map(f=>f.file);
  for(let i=0;i<fileTitles.length;i+=12){
    const batch = fileTitles.slice(i,i+12);
    const u = "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata|url&titles="+encodeURIComponent(batch.join("|"));
    const j = await (await fetchRetry(u)).json();
    await sleep(400);
    Object.values(j.query.pages).forEach(p=>{
      if(!p.imageinfo) return;
      const m = p.imageinfo[0].extmetadata||{};
      credits[p.title.replace(/ /g,"_")] = {   // normalise spaces→underscores to match pageimage
        artist: stripTags(m.Artist && m.Artist.value) || "ไม่ระบุ",
        license: (m.LicenseShortName && m.LicenseShortName.value) || "ดูที่ Wikimedia",
        licenseUrl: (m.LicenseUrl && m.LicenseUrl.value) || "",
        descUrl: p.imageinfo[0].descriptionurl || ""
      };
    });
  }
  // attach credits to files by file title (normalised)
  const creditsByFile = {};
  files.forEach(f=>{ const k=(f.file||"").replace(/ /g,"_"); if(k && credits[k]) creditsByFile[f.filename]={name:f.name, ...credits[k]}; });
  fs.writeFileSync(path.join(OUT,"credits.json"), JSON.stringify(creditsByFile,null,2));

  // 4) emit JS map to paste into index.html
  const have = Object.values(map).filter(Boolean).length;
  console.log("\n=== DONE: "+have+"/"+ROSTER.length+" photos ===");
  console.log("\n--- PHOTO MAP (name -> file) ---");
  console.log(JSON.stringify(map, (k,v)=>v, 1));
})().catch(e=>{console.error("FATAL",e); process.exit(1);});
