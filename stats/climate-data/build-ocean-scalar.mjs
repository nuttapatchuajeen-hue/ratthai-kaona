#!/usr/bin/env node
/*
 * ดึง "ค่าสเกลาร์ผิวน้ำ" มาไว้ระบายสีเส้นกระแสน้ำ — อุณหภูมิ / ความเค็ม / คลอโรฟิลล์
 *
 * ทำไมต้องมี
 *   คลิป NASA (The Ocean: A Driving Force for Weather and Climate) ไม่ได้ระบายสี
 *   พื้นลูกโลก แต่ระบายสี "ตัวเส้นกระแสน้ำ" ด้วยอุณหภูมิและความเค็ม ทำให้อ่านได้
 *   ทีเดียวสองชั้นความหมาย: เส้นบอกว่าน้ำไหลไปทางไหน สีบอกว่าน้ำก้อนนั้นเป็นน้ำแบบไหน
 *   ไฟล์ที่สคริปต์นี้สร้างคือค่าที่หน้าเว็บเอาไปเทียบทีละจุดบนเส้น
 *
 * ทุกชุดถูกเลือกให้ตรงวันกับไฟล์กระแสน้ำผิว (25 มี.ค. 2569) เท่าที่แหล่งจะมีให้
 * ต่างจากไฟล์ชั้นน้ำลึกที่เป็นข้อมูล 2558 เพราะไม่มีของใหม่กว่านั้นให้ใช้
 *
 * ใช้ยังไง
 *   node build-ocean-scalar.mjs --var sst --bands 4
 *   node build-ocean-scalar.mjs --var sss --bands 4
 *   node build-ocean-scalar.mjs --var chl --bands 4
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE   = path.dirname(fileURLToPath(import.meta.url));
const BASE   = "https://coastwatch.pfeg.noaa.gov/erddap";
const NODATA = -32768;
const DATE   = "2026-03-25";        // วันเดียวกับ ocean-uv.bin

/* แต่ละชุดมีรูปแบบแกนไม่เหมือนกัน — OISST มีแกน zlev, SMOS มีแกน altitude,
   คลอโรฟิลล์ไม่มีแกนเสริมแต่เป็นกริด 4 กม. ต้องหยิบทุก 6 ช่องให้เหลือ 0.25°
   หมายเหตุ: ชุด SMOS ตัวที่ไม่ใช่ _Lon0360 ถูกเซิร์ฟเวอร์ตอบ 403 (ไม่ใช่ error ของ ERDDAP)
   ส่วนตัว _Lon0360 เรียกได้ปกติ — อย่าเผลอสลับกลับ */
const PRESETS = {
  sst: {
    dataset:"ncdcOisst21Agg", variable:"sst", unit:"°C", label:"อุณหภูมิผิวน้ำทะเล",
    extraAxis:"[(0.0)]", stride:1, time:DATE,
    lat:[-89.875, 89.875], lon:[0.125, 359.875],
    source:"NOAA NCEI — Daily Optimum Interpolation SST (OISST) v2.1",
    out:"ocean-sst",
  },
  sss: {
    dataset:"coastwatchSMOSv662SSS3day_Lon0360", variable:"sss", unit:"PSU", label:"ความเค็มผิวน้ำ",
    extraAxis:"[(0.0)]", stride:1, time:DATE,
    lat:[-89.875, 89.875], lon:[0.125, 359.875],
    source:"ESA SMOS (Miras) Near Real-Time Sea Surface Salinity — ค่าเฉลี่ย 3 วัน",
    out:"ocean-sss",
  },
  chl: {
    dataset:"erdMH1chlamday_R2022NRT", variable:"chlorophyll", unit:"mg/m³", label:"คลอโรฟิลล์-เอ",
    extraAxis:"", stride:6, time:"2026-03-16",       // รายเดือน — ค่ากลางเดือน มี.ค. 2569
    lat:[-89.979, 89.979], lon:[-179.979, 179.979],
    source:"NASA Aqua MODIS L3SMI Chlorophyll-a (R2022 NRT) — ค่าเฉลี่ยรายเดือน",
    out:"ocean-chl",
  },
};

function args(argv){
  const a={ varName:null, bands:4, outDir:HERE, fromCsv:null, saveCsv:null };
  for(let i=2;i<argv.length;i++){
    const k=argv[i], next=()=>argv[++i];
    if(k==="--var") a.varName=next();
    else if(k==="--bands") a.bands=parseInt(next(),10);
    else if(k==="--out-dir") a.outDir=next();
    else if(k==="--from-csv") a.fromCsv=next();
    else if(k==="--save-csv") a.saveCsv=next();
    else if(k==="--print-url") a.printUrl=true;
    else die("ไม่รู้จักตัวเลือก "+k);
  }
  if(!a.varName || !PRESETS[a.varName]) die("--var ต้องเป็น sst, sss หรือ chl");
  return a;
}
const fmt=(n)=>n.toLocaleString("en-US");
function die(m){ console.error("\n✗ "+m); process.exit(2); }

function url(P, latFrom, latTo){
  const s=P.stride;
  const span="[("+P.time+")]"+P.extraAxis+
             "[("+latFrom+"):"+s+":("+latTo+")][("+P.lon[0]+"):"+s+":("+P.lon[1]+")]";
  return BASE+"/griddap/"+P.dataset+".csv?"+P.variable+span;
}
async function get(u){
  const r=await fetch(u,{ signal:AbortSignal.timeout(600000) });
  const t=await r.text();
  if(!r.ok) die("ERDDAP ตอบ HTTP "+r.status+"\n  "+t.slice(0,300).replace(/\s+/g," "));
  return t;
}
async function fetchAll(P, bands){
  if(bands<=1){ console.log("ดึงข้อมูล…\n  "+url(P,P.lat[0],P.lat[1])); return get(url(P,P.lat[0],P.lat[1])); }
  const step=(P.lat[1]-P.lat[0])/bands, parts=[];
  for(let k=0;k<bands;k++){
    const f=P.lat[0]+step*k;
    const t=(k===bands-1)?P.lat[1]:P.lat[0]+step*(k+1)-1e-6;
    console.log("  แถบ "+(k+1)+"/"+bands+"  lat "+f.toFixed(2)+"…"+t.toFixed(2));
    parts.push(await get(url(P,f,t)));
  }
  return parts[0]+parts.slice(1).map(q=>"\n"+q.split("\n").slice(2).join("\n")).join("");
}

/* ---------- CSV → กริด (ค่าเดียวต่อช่อง) ---------- */
function toGrid(text, P){
  const head=text.trimStart().slice(0,300).toLowerCase();
  if(head.startsWith("<")) die("ได้ HTML กลับมาแทน CSV");
  const lines=text.split("\n");
  const cols=lines[0].trim().split(",").map(s=>s.trim());
  const iLat=cols.findIndex(c=>c.toLowerCase().startsWith("lat"));
  const iLon=cols.findIndex(c=>c.toLowerCase().startsWith("lon"));
  const iVal=cols.indexOf(P.variable);
  if(iLat<0||iLon<0||iVal<0) die("หัวตารางไม่มีคอลัมน์ที่ต้องการ — ได้: "+lines[0]);

  const rows=[], latSet=new Set(), lonSet=new Set();
  let tstamp=null;
  for(let n=2;n<lines.length;n++){
    const l=lines[n]; if(!l) continue;
    const r=l.split(","); if(r.length<cols.length) continue;
    const la=Number(r[iLat]), lo=Number(r[iLon]);
    if(!Number.isFinite(la)||!Number.isFinite(lo)) continue;
    if(tstamp===null) tstamp=r[0].trim();
    latSet.add(la); lonSet.add(lo);
    const s=r[iVal].trim();
    rows.push([la, lo, (s===""||s.toUpperCase()==="NAN")?NaN:Number(s)]);
  }
  if(!rows.length) die("อ่านข้อมูลไม่ได้สักแถว");

  const lats=Array.from(latSet).sort((a,b)=>a-b);
  const lons=Array.from(lonSet).sort((a,b)=>a-b);
  const nlat=lats.length, nlon=lons.length;
  const jOf=new Map(lats.map((x,i)=>[x,i])), iOf=new Map(lons.map((x,i)=>[x,i]));
  const dlat=Math.round((lats[1]-lats[0])*1e6)/1e6;
  const dlon=Math.round((lons[1]-lons[0])*1e6)/1e6;
  const shift=lons.some(l=>l>180);

  let mn=Infinity, mx=-Infinity;
  for(const [,,v] of rows) if(Number.isFinite(v)){ if(v<mn) mn=v; if(v>mx) mx=v; }
  if(!(mx>mn)) die("ค่าที่ได้ไม่มีช่วง (ทั้งหมดเท่ากันหรือว่าง)");
  /* เก็บเป็น int16 โดยแมปช่วงจริงลง -32000..32000 — ไม่ใช้สเกลคูณตรง ๆ เพราะ
     อุณหภูมิติดลบได้ ส่วนคลอโรฟิลล์เป็นค่าบวกที่กระจายแบบลอการิทึม
     หน้าเว็บถอดกลับด้วย value = min + raw01 * (max-min) โดยอ่าน min/max จาก meta */
  const enc=(v)=>Math.round(((v-mn)/(mx-mn))*32000);
  const out=new Int16Array(nlat*nlon).fill(NODATA);
  let valid=0;
  for(const [la,lo,v] of rows){
    const j=jOf.get(la), i0=iOf.get(lo);
    if(j===undefined||i0===undefined||!Number.isFinite(v)) continue;
    const i=shift?(i0+(nlon>>1))%nlon:i0;
    out[j*nlon+i]=enc(v); valid++;
  }
  const meta={
    source:P.source, sourceUrl:BASE+"/griddap/"+P.dataset+".html", dataset:P.dataset,
    variables:[P.variable], unit:P.unit, label:P.label, kind:"scalar",
    time:tstamp||P.time, dtype:"int16", endian:"little",
    encoding:"raw 0..32000 เชิงเส้นระหว่าง vmin..vmax · value = vmin + raw/32000*(vmax-vmin)",
    vmin:mn, vmax:mx, noData:NODATA, components:1,
    nlat, nlon, lat0:lats[0], lon0:shift?lons[0]-180:lons[0], dlat, dlon,
    layout:"one value per cell; row-major lat then lon; Int16 little-endian",
    validCells:valid, totalCells:nlat*nlon, builtBy:"build-ocean-scalar.mjs",
  };
  return { vals:out, meta };
}

/* ---------- ตรวจความสมเหตุสมผล ---------- */
function at(vals,m,lat,lon){
  const j=Math.round((lat-m.lat0)/m.dlat);
  if(!(j>=0&&j<m.nlat)) return null;
  const i=Math.round(((((lon-m.lon0)%360)+360)%360)/m.dlon)%m.nlon;
  const raw=vals[j*m.nlon+i];
  return raw===m.noData ? null : m.vmin + (raw/32000)*(m.vmax-m.vmin);
}
function boxMean(vals,m,a,b,c,d){
  let s=0,n=0;
  for(let la=a;la<=b;la+=m.dlat) for(let lo=c;lo<=d;lo+=m.dlon){
    const v=at(vals,m,la,lo); if(v!==null){ s+=v; n++; }
  }
  return n?{mean:s/n,n}:{mean:NaN,n:0};
}
function sanity(vals,m,key){
  console.log("\n=== ตรวจความสมเหตุสมผล ===");
  let bad=0;
  const say=(ok,t)=>{ if(!ok) bad++; console.log("  "+(ok?"✓":"✗")+" "+t); };
  say(at(vals,m,45,90.5)===null, "กลางทวีปเอเชีย ไม่มีข้อมูล (ต้องเป็นบก)");
  say(at(vals,m,23,10.5)===null, "กลางทะเลทรายซาฮารา ไม่มีข้อมูล (ต้องเป็นบก)");
  const frac=m.validCells/m.totalCells;

  if(key==="sst"){
    const eq=boxMean(vals,m,-5,5,0,360), so=boxMean(vals,m,-65,-60,0,360);
    say(frac>0.5&&frac<0.85, "มีข้อมูล "+(frac*100).toFixed(1)+"% (SST ครอบคลุมเกือบทุกผืนน้ำ)");
    say(eq.mean>24, "แถบศูนย์สูตรอุ่น "+eq.mean.toFixed(1)+"°C (ต้องเกิน 24)");
    say(so.mean<5,  "แถบใต้ขั้วโลกใต้เย็น "+so.mean.toFixed(1)+"°C (ต้องต่ำกว่า 5)");
    say(m.vmin>-3&&m.vmax<40, "ช่วงค่า "+m.vmin.toFixed(1)+"…"+m.vmax.toFixed(1)+"°C อยู่ในวิสัยที่เป็นไปได้");
  } else if(key==="sss"){
    // ข้อเท็จจริงมาตรฐาน: แอตแลนติกเหนือเค็มกว่าแปซิฟิกเหนือที่ละติจูดเดียวกัน
    // (แอตแลนติกระเหยมากกว่าและได้น้ำจืดคืนน้อยกว่า) ถ้ากลับด้านแปลว่าอ่านแกนผิด
    const atl=boxMean(vals,m,20,30,-60,-40), pac=boxMean(vals,m,20,30,-160,-140);
    say(frac>0.3&&frac<0.85, "มีข้อมูล "+(frac*100).toFixed(1)+"% (SMOS มีช่องว่างจากสัญญาณรบกวน)");
    say(atl.mean>pac.mean, "แอตแลนติกเหนือ "+atl.mean.toFixed(2)+" เค็มกว่าแปซิฟิกเหนือ "+pac.mean.toFixed(2)+" PSU");
    say(m.vmin>=0&&m.vmax<45, "ช่วงค่า "+m.vmin.toFixed(1)+"…"+m.vmax.toFixed(1)+" PSU อยู่ในวิสัยที่เป็นไปได้");
  } else {
    // คลอโรฟิลล์: ชายฝั่งกับเขต upwelling ต้องเข้มกว่าใจกลางวงวนกึ่งเขตร้อนหลายเท่า
    // ใจกลางวงวนแปซิฟิกใต้คือ "ทะเลทรายมหาสมุทร" จุดที่จืดสารอาหารที่สุดในโลก
    const up=boxMean(vals,m,-14,-6,-82,-76), gyre=boxMean(vals,m,-30,-20,-140,-120);
    say(frac>0.3, "มีข้อมูล "+(frac*100).toFixed(1)+"% (เมฆกับกลางคืนบังบางส่วน)");
    say(up.mean>gyre.mean*2, "ชายฝั่งเปรู "+up.mean.toFixed(2)+" เข้มกว่าใจกลางวงวนแปซิฟิกใต้ "+gyre.mean.toFixed(3)+" mg/m³");
    say(m.vmin>=0, "ไม่มีค่าติดลบ (คลอโรฟิลล์ติดลบไม่ได้)");
  }
  return bad;
}

/* ---------- main ---------- */
const a=args(process.argv);
const P=PRESETS[a.varName];
if(a.printUrl){ console.log(url(P,P.lat[0],P.lat[1])); process.exit(0); }

console.log(P.label+" — "+P.dataset+" @ "+P.time);
const text=a.fromCsv ? fs.readFileSync(a.fromCsv,"utf8") : await fetchAll(P, a.bands);
if(a.saveCsv){ fs.writeFileSync(a.saveCsv,text,"utf8"); console.log("  เก็บ CSV ไว้ที่ "+a.saveCsv); }

const built=toGrid(text,P);
console.log("อ่านได้ "+fmt(built.meta.validCells)+" ช่อง จาก "+fmt(built.meta.totalCells)+
            " · กริด "+built.meta.nlon+"×"+built.meta.nlat+
            " · ช่วง "+built.meta.vmin.toFixed(3)+"…"+built.meta.vmax.toFixed(2)+" "+P.unit+
            " · เวลา "+built.meta.time);
const bad=sanity(built.vals,built.meta,a.varName);

const binp=path.join(a.outDir,P.out+".bin"), metap=path.join(a.outDir,P.out+"-meta.json");
if(bad){ console.error("\n✗ ไม่ผ่านการตรวจ "+bad+" ข้อ — ไม่เขียนไฟล์"); process.exit(1); }
const buf=Buffer.allocUnsafe(built.vals.length*2);
for(let k=0;k<built.vals.length;k++) buf.writeInt16LE(built.vals[k],k*2);
fs.writeFileSync(binp,buf);
fs.writeFileSync(metap,JSON.stringify(built.meta,null,2)+"\n","utf8");
console.log("\n✓ เขียนแล้ว\n  "+binp+"  ("+fmt(fs.statSync(binp).size)+" ไบต์)\n  "+metap);
