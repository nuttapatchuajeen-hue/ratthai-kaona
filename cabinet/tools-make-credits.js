/* สร้าง photos/credits.json จากไฟล์รูปที่มีอยู่ (ใช้ MediaWiki API เท่านั้น ไม่โหลดรูปซ้ำ)
   รัน:  node "tools-make-credits.js"  */
const fs=require('fs'),path=require('path');
const OUT=path.join(__dirname,'photos');
const UA={headers:{"User-Agent":"ThaiCabinetSite/1.0 (educational)"}};
const stripTags=s=>(s||"").replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim();

// filename -> ชื่อ (ต้องตรงกับ PHOTOS ใน index.html)
const FILE2NAME={
 "01-1":"อนุทิน ชาญวีรกูล","01-2":"ศุภมาส อิศรภักดี","01-3":"นภินทร ศรีสรรพางค์","01-4":"ภราดร ปริศนานันทกุล","01-5":"สุขสมรวย วันทนียกุล",
 "02-1":"อดุลย์ บุญธรรมเจริญ","03-1":"เอกนิติ นิติทัณฑ์ประภาศ","04-1":"สีหศักดิ์ พวงเกตุแก้ว","05-1":"สุรศักดิ์ พันธ์เจริญวรกุล","06-1":"นิกร โสมกลาง",
 "07-1":"สุริยะ จึงรุ่งเรืองกิจ","07-2":"วัชระพล ขาวขำ","07-3":"ปิยะรัฐชย์ ติยะไพรัช","08-1":"พิพัฒน์ รัชกิจประการ","08-2":"สิริพงศ์ อังคสกุลเกียรติ","08-3":"ภัทรพงศ์ ภัทรประสิทธิ์","08-4":"สรรเพชญ บุญญามณี",
 "09-1":"สุชาติ ชมกลิ่น","11-1":"ไชยชนก ชิดชอบ","11-2":"บุณย์ธิดา สมชัย","12-1":"เอกนัฏ พร้อมพันธุ์","13-1":"ศุภจี สุธรรมพันธุ์",
 "14-1":"พลพีร์ สุวรรณฉวี","14-2":"เจเศรษฐ์ ไทยเศรษฐ์","14-3":"วรศิษฎ์ เลียงประสิทธิ์","15-1":"รุทธพล เนาวรัตน์","16-1":"จุลพันธ์ อมรวิวัฒน์",
 "17-1":"ซาบีดา ไทยเศรษฐ์","18-1":"ยศชนัน วงศ์สวัสดิ์","19-1":"ประเสริฐ จันทรรวงทอง","19-2":"อัครนันท์ กัณณ์กิตตินันท์","21-1":"พัฒนา พร้อมพัฒน์","22-1":"วราวุธ ศิลปอาชา"
};

// ภาพที่ผู้ใช้จัดเตรียมเอง (ภาพทางการ — มิใช่ Wikimedia) → ให้เครดิตแยก ไม่อ้างอิงผู้สร้างสรรค์ Wikimedia
const USER_PROVIDED = new Set(["01-5","05-1","06-1","07-2","07-3","08-4","09-1","14-1","19-2","21-1"]);
const USER_CREDIT = {artist:"ภาพทางการ (จัดเตรียมโดยผู้ใช้)", license:"อ้างอิงเงื่อนไขแหล่งที่มา เช่น soc.go.th", licenseUrl:"", source:"https://www.soc.go.th/"};

(async()=>{
  // ไฟล์รูปที่มีอยู่จริง
  const present={}; // name -> filename
  fs.readdirSync(OUT).forEach(fn=>{
    const stem=fn.replace(/\.(jpg|jpeg|png|webp)$/i,"");
    if(FILE2NAME[stem]) present[FILE2NAME[stem]]=fn;
  });
  const names=Object.keys(present);
  console.log("ไฟล์รูปที่มี: "+names.length);

  // 1) name -> File title (pageimage)
  const name2file={};
  for(let i=0;i<names.length;i+=20){
    const batch=names.slice(i,i+20);
    const u="https://th.wikipedia.org/w/api.php?action=query&redirects=1&prop=pageimages&piprop=name&format=json&titles="+encodeURIComponent(batch.join("|"));
    const j=await(await fetch(u,UA)).json();
    const norm={};(j.query.normalized||[]).forEach(n=>norm[n.to]=n.from);
    const red={};(j.query.redirects||[]).forEach(n=>red[n.to]=n.from);
    Object.values(j.query.pages).forEach(p=>{let o=p.title;if(red[o])o=red[o];if(norm[o])o=norm[o];if(p.pageimage)name2file[o]="File:"+p.pageimage;});
  }

  // 2) File title -> extmetadata (artist/license) on commons
  const fileTitles=Object.values(name2file);
  const meta={};
  for(let i=0;i<fileTitles.length;i+=20){
    const batch=fileTitles.slice(i,i+20);
    const u="https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata|url&titles="+encodeURIComponent(batch.join("|"));
    const j=await(await fetch(u,UA)).json();
    const norm={};(j.query.normalized||[]).forEach(n=>norm[n.to]=n.from);
    Object.values(j.query.pages).forEach(p=>{
      if(!p.imageinfo)return;
      let key=p.title;
      const m=p.imageinfo[0].extmetadata||{};
      meta[key.replace(/ /g,"_")]={
        artist:stripTags(m.Artist&&m.Artist.value)||"ไม่ระบุ",
        license:(m.LicenseShortName&&m.LicenseShortName.value)||"ดูที่ Wikimedia Commons",
        licenseUrl:(m.LicenseUrl&&m.LicenseUrl.value)||"",
        descUrl:p.imageinfo[0].descriptionurl||""
      };
    });
  }

  // 3) เขียน credits.json keyed by filename
  const out={};
  names.forEach(n=>{
    const fn=present[n];
    const stem=fn.replace(/\.(jpg|jpeg|png|webp)$/i,"");
    if(USER_PROVIDED.has(stem)){ out[fn]={name:n, ...USER_CREDIT}; return; }
    const ft=(name2file[n]||"").replace(/ /g,"_");
    const c=meta[ft]||{};
    out[fn]={name:n, artist:c.artist||"ไม่ระบุ", license:c.license||"ดูที่ Wikimedia Commons", licenseUrl:c.licenseUrl||"", source:c.descUrl||""};
  });
  fs.writeFileSync(path.join(OUT,"credits.json"),JSON.stringify(out,null,2));
  console.log("เขียน credits.json: "+Object.keys(out).length+" รายการ");
  Object.entries(out).slice(0,5).forEach(([f,c])=>console.log("  "+f+" © "+c.artist+" ["+c.license+"]"));
})().catch(e=>{console.error("ERR",e);process.exit(1);});
