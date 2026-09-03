/* ===== bkk-history.js — ข้อมูล + ตัวเรนเดอร์แท็บ "ประวัติ" ของหน้า กทม. =====
   แยกออกมาจาก bangkok.html เพื่อให้ "โหมดปีเก่า" (bkk-oldyear.js) เรียกใช้ไทม์ไลน์ชุดเดียวกันได้
   ใช้ร่วมกับ bkk-years.js (ปุ่มเลือกปี) — window.BKKYEAR บอกปีที่กำลังดูอยู่
   ส่งออก: window.BKKHIST (ข้อมูล) · window.BKKHPC (สีพรรค) · window.BKKrenderHist() */
(function(){
'use strict';
const fmt=n=>n==null?'—':Number(n).toLocaleString('en-US');
const el=id=>document.getElementById(id);

/* ---------- ประวัติการเลือกตั้งผู้ว่าฯ กทม. (แท็บ "ประวัติ") ----------
   ที่มา: วิกิพีเดีย "การเลือกตั้งผู้ว่าราชการกรุงเทพมหานคร" + "รายชื่อผู้ว่าราชการกรุงเทพมหานคร"
   pct = สัดส่วนคะแนนของผู้ชนะ (เว้น null ไว้ในครั้งที่แหล่งอ้างอิงไม่ได้ระบุ) */
const HPC={'ประชาธิปัตย์':'#27AAE1','กลุ่มรวมพลัง':'#E4572E','พลังธรรม':'#F2A03D',
           'กลุ่มมดงาน':'#7B5EA7','ประชากรไทย':'#0E4C92','อิสระ':'#00A651'};
const HIST=[
 {ev:1,y:2515,ic:'<svg class="mdico"><use href="#i-landmark"></use></svg>',c:'#8a97a3',t:'กำเนิด "กรุงเทพมหานคร"',
  d:'รวมนครหลวงกรุงเทพธนบุรีเป็นกรุงเทพมหานคร (พ.ศ. 2515) ผู้ว่าฯ 4 คนแรกมาจากการแต่งตั้ง — ชำนาญ ยุวบูรณ์ · อรรถ วิสูตรโยธาภิบาล · ศิริ สันติบุตร · สาย หุตะเจริญ'},
 {y:2518,no:1,date:'10 สิงหาคม 2518',win:'ธรรมนูญ เทียนเงิน',ini:'ธ',party:'ประชาธิปัตย์',
  votes:99247,pct:39.21,turn:13.35,cand:5,run:'อาทิตย์ อุไรรัตน์',runP:'พลังใหม่',runV:91678,
  note:'เลือกตั้งผู้ว่าฯ กทม. ครั้งแรก ตาม พ.ร.บ. ระเบียบบริหารราชการกรุงเทพมหานคร พ.ศ. 2518 — ผู้มาใช้สิทธิต่ำที่สุดในประวัติศาสตร์เพียง 13.35%'},
 {ev:1,y:2520,ic:'<svg class="mdico"><use href="#i-scale"></use></svg>',c:'#b23b3b',t:'ปลดผู้ว่าฯ · กลับสู่ยุคแต่งตั้ง 8 ปี',
  d:'29 เม.ย. 2520 รัฐบาลปลดธรรมนูญ เทียนเงิน และยุบสภา กทม. หลังจากนั้นผู้ว่าฯ มาจากการแต่งตั้งอีก 4 คน — ชลอ ธรรมศิริ · เชาวน์วัศ สุดลาภา · เทียม มกรานนท์ · อาษา เมฆสวรรค์ จนถึง พ.ศ. 2528'},
 {y:2528,no:2,date:'14 พฤศจิกายน 2528',win:'จำลอง ศรีเมือง',ini:'จ',party:'กลุ่มรวมพลัง',
  votes:480233,pct:50.51,turn:34.65,cand:10,run:'ชนะ รุ่งแสง',runP:'ประชาธิปัตย์',runV:241001,
  note:'กลับมาเลือกตั้งอีกครั้งตาม พ.ร.บ. ระเบียบบริหารราชการกรุงเทพมหานคร พ.ศ. 2528 — จำลองชนะในนามกลุ่มรวมพลัง แม้ไม่มีพรรคใหญ่หนุนหลัง'},
 {y:2533,no:3,date:'7 มกราคม 2533',win:'จำลอง ศรีเมือง',ini:'จ',party:'พลังธรรม',
  votes:703671,pct:63.49,turn:35.85,cand:16,run:'เดโช สวนานนท์',runP:'ประชากรไทย',runV:283895,
  note:'จำลองชนะสมัยที่ 2 ในนามพรรคพลังธรรม ทิ้งห่างอันดับ 2 กว่า 4 แสนคะแนน'},
 {y:2535,no:4,date:'19 เมษายน 2535',win:'กฤษฎา อรุณวงษ์ ณ อยุธยา',ini:'ก',party:'พลังธรรม',
  votes:363668,pct:null,turn:23.02,cand:5,run:'พิจิตต รัตตกุล',runP:'ประชาธิปัตย์',runV:305740,
  note:'จำลองลาออกไปเล่นการเมืองระดับชาติ พรรคพลังธรรมส่งกฤษฎาลงแทนและรักษาเก้าอี้ไว้ได้ — ผู้ใช้สิทธิต่ำเป็นอันดับ 2'},
 {y:2539,no:5,date:'2 มิถุนายน 2539',win:'พิจิตต รัตตกุล',ini:'พ',party:'กลุ่มมดงาน',
  votes:764994,pct:49.08,turn:43.53,cand:29,run:'จำลอง ศรีเมือง',runP:'พลังธรรม',runV:514401,
  note:'ผู้สมัครมากถึง 29 คน — พิจิตตลงในนามกลุ่มมดงานแบบอิสระ โค่นจำลองเจ้าของพื้นที่เดิมได้สำเร็จ'},
 {y:2543,no:6,date:'23 กรกฎาคม 2543',win:'สมัคร สุนทรเวช',ini:'ส',party:'ประชากรไทย',
  votes:1016096,pct:45.85,turn:58.87,cand:23,run:'สุดารัตน์ เกยุราพันธุ์',runP:'ไทยรักไทย',runV:521184,
  note:'ครั้งแรกที่ผู้ชนะได้คะแนนทะลุ 1 ล้าน — สมัครชนะขาดเกือบ 2 เท่าของอันดับ 2'},
 {y:2547,no:7,date:'29 สิงหาคม 2547',win:'อภิรักษ์ โกษะโยธิน',ini:'อ',party:'ประชาธิปัตย์',
  votes:911441,pct:38.20,turn:62.50,cand:22,run:'ปวีณา หงสกุล',runP:'อิสระ',runV:619039,
  note:'ประชาธิปัตย์กลับมาครองศาลาว่าการ กทม. อีกครั้งในรอบเกือบ 30 ปี ท่ามกลางผู้ใช้สิทธิสูงถึง 62.5%'},
 {y:2551,no:8,date:'5 ตุลาคม 2551',win:'อภิรักษ์ โกษะโยธิน',ini:'อ',party:'ประชาธิปัตย์',
  votes:991018,pct:45.93,turn:54.18,cand:16,run:'ประภัสร์ จงสงวน',runP:'พลังประชาชน',runV:543488,
  note:'อภิรักษ์ชนะสมัยที่ 2 แต่อยู่ในตำแหน่งไม่ถึง 3 เดือน — ลาออก 19 พ.ย. 2551 หลัง ป.ป.ช. ชี้มูลคดีจัดซื้อรถและเรือดับเพลิง'},
 {y:2552,no:9,date:'11 มกราคม 2552',win:'ม.ร.ว.สุขุมพันธุ์ บริพัตร',ini:'ส',party:'ประชาธิปัตย์',
  votes:934602,pct:45.41,turn:51.10,cand:14,run:'ยุรนันท์ ภมรมนตรี',runP:'เพื่อไทย',runV:611669,
  note:'เลือกตั้งใหม่หลังอภิรักษ์ลาออก — สุขุมพันธุ์รักษาเก้าอี้ไว้ให้ประชาธิปัตย์ได้'},
 {y:2556,no:10,date:'3 มีนาคม 2556',win:'ม.ร.ว.สุขุมพันธุ์ บริพัตร',ini:'ส',party:'ประชาธิปัตย์',
  votes:1256349,pct:47.75,turn:63.98,cand:25,run:'พงศพัศ พงษ์เจริญ',runP:'เพื่อไทย',runV:1077899,
  note:'สูสีที่สุดครั้งหนึ่ง — ทั้งคู่ได้เกิน 1 ล้านคะแนน และเป็นครั้งที่คนกรุงเทพฯ ออกมาใช้สิทธิสูงที่สุด 63.98%'},
 {ev:1,y:2557,ic:'<svg class="mdico"><use href="#i-shield"></use></svg>',c:'#b23b3b',t:'รัฐประหาร 2557 · งดเลือกตั้งท้องถิ่น',
  d:'22 พ.ค. 2557 คสช. ยึดอำนาจและสั่งงดการเลือกตั้งท้องถิ่นทั่วประเทศ สมาชิกสภากรุงเทพมหานคร (ส.ก.) เปลี่ยนไปใช้วิธีแต่งตั้งแทนการเลือกตั้ง'},
 {ev:1,y:2559,ic:'<svg class="mdico"><use href="#i-scroll"></use></svg>',c:'#8a97a3',t:'ใช้ ม.44 เปลี่ยนตัวผู้ว่าฯ',
  d:'18 ต.ค. 2559 หัวหน้า คสช. ใช้อำนาจตามมาตรา 44 ให้ ม.ร.ว.สุขุมพันธุ์พ้นจากตำแหน่ง และแต่งตั้ง พล.ต.อ. อัศวิน ขวัญเมือง เป็นผู้ว่าฯ กทม. ยาวถึง 24 มี.ค. 2565'},
 {y:2565,no:11,date:'22 พฤษภาคม 2565',win:'ชัชชาติ สิทธิพันธุ์',ini:'ช',party:'อิสระ',
  votes:1386215,pct:51.85,turn:60.73,cand:31,run:'สุชัชวีร์ สุวรรณสวัสดิ์',runP:'ประชาธิปัตย์',runV:254647,
  note:'เลือกตั้งครั้งแรกในรอบ 9 ปี — ชัชชาติลงอิสระและทำสถิติคะแนนสูงสุดตลอดกาลในขณะนั้น 1,386,215 คะแนน'},
 {y:2569,no:12,date:'28 มิถุนายน 2569',win:'ชัชชาติ สิทธิพันธุ์',ini:'ช',party:'อิสระ',
  votes:1537784,pct:67.94,turn:52.79,cand:18,run:'มัลลิกา มหาสุข',runP:'กลุ่มเพื่อนมัลลิกา',runV:304494,
  note:'ชัชชาติชนะสมัยที่ 2 ทำลายสถิติคะแนนของตัวเอง กวาดชนะครบทั้ง 50 เขต ด้วยสัดส่วนสูงที่สุดเท่าที่เคยมีมา 67.94%',cur:1}
];

let histDone=false;
function renderHist(){
  if(histDone) return; histDone=true;
  const es=HIST.filter(o=>!o.ev);
  const maxV=Math.max(...es.map(o=>o.votes));
  const maxT=Math.max(...es.map(o=>o.turn));
  const hc=o=>HPC[o.party]||'#9AA3AE';

  const ov=es.map(o=>`<button class="hovc" type="button" data-y="${o.y}" aria-label="พ.ศ. ${o.y} · ${o.win} · ผู้ใช้สิทธิ ${o.turn}%">
      <span class="hv">${o.turn}%</span>
      <span class="hb" style="height:${Math.round(16+o.turn/maxT*104)}px;background:${hc(o)}"></span>
      <span class="hy">${o.y}</span></button>`).join('');

  /* ปุ่มท้ายการ์ด — ปีที่กำลังดูอยู่ = ปุ่มข้ามไปแท็บแผนที่/สรุป · ปีอื่นที่มีข้อมูลรายเขต = ลิงก์สลับปี */
  const CURY=window.BKKYEAR||2569, HASMAP=!window.BKKOLD, YMAP=window.BKKYMAP||{};
  const IC_MAP='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6 3-6-3Z"/><path d="M9 7v13M15 4v13"/></svg>';
  function btnRow(o){
    if(o.y===CURY&&HASMAP) return `<div class="hbtnrow">
      <button class="hbtn" type="button" onclick="setView('gov')">${IC_MAP}ดูแผนที่ผลปี ${o.y}</button>
      <button class="hbtn" type="button" onclick="setView('sum')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/></svg>สรุปคะแนน</button></div>`;
    if(YMAP[o.y]) return `<div class="hbtnrow"><a class="hbtn" style="text-decoration:none" href="bangkok.html?y=${o.y}">${IC_MAP}เปิดแผนที่รายเขตปี ${o.y}</a></div>`;
    return '';
  }
  const rows=HIST.map((o,i)=>{
    const lr=(i%2===0)?'left':'right';
    if(o.ev) return `<div class="hrow ev ${lr}" style="--nc:${o.c}">
        <div class="hyr"><b>${o.y}</b><small>เหตุการณ์</small></div><div class="hnode"></div>
        <div class="hev"><div class="eic">${o.ic}</div><div><div class="et">${o.t}</div><div class="ed">${o.d}</div></div></div>
      </div>`;
    const c=hc(o), wpc=(o.votes/maxV*100).toFixed(1), rpc=o.runV?(o.runV/maxV*100).toFixed(1):0;
    return `<div class="hrow ${lr}" style="--nc:${c}">
      <div class="hyr"><b>${o.y}</b><small>ครั้งที่ ${o.no}</small></div><div class="hnode"></div>
      <div class="hcard" id="hc-${o.y}" style="--wc:${c}">
        <div class="hch"><span class="hdt">${o.date}</span>
          <span class="hsys">${o.cand?'ผู้สมัคร '+o.cand+' คน':'ครั้งที่ '+o.no}</span>
          <span class="hturn">ผู้ใช้สิทธิ <b>${o.turn}%</b></span></div>
        <div class="hwin" data-gov-name="${o.win}" data-gov-year="${o.y}" data-gov-party="${o.party}" data-gov-votes="${o.votes}" data-gov-pct="${o.pct||''}" style="cursor:pointer" title="แตะเพื่อดูการ์ดประวัติ ${o.win}">
          <div class="hav" style="background:${c}">${o.ini}</div>
          <div><div class="hwn">${o.win}<span class="hpt" style="background:${c}">${o.party}</span></div>
            <div class="hws">${fmt(o.votes)} <em>คะแนน${o.pct?' · '+o.pct+'%':''}</em></div></div>
        </div>
        <div class="hbars">
          <div class="hbl"><span class="hbt"><i style="width:${wpc}%;background:${c}"></i></span><span class="hbn">${fmt(o.votes)}</span></div>
          <div class="hbl"><span class="hbt"><i style="width:${rpc}%;background:var(--line-2)"></i></span><span class="hbn">${o.runV?fmt(o.runV):'—'}</span></div>
        </div>
        <div class="hrun"><span class="rl">อันดับ 2</span><b data-gov-name="${o.run}" data-gov-year="${o.y}" data-gov-party="${o.runP}" data-gov-votes="${o.runV||''}" style="cursor:pointer;text-decoration:underline" title="แตะเพื่อดูการ์ดประวัติ ${o.run}">${o.run}</b><span class="rl">· ${o.runP}</span></div>
        <p class="hnote">${o.note}</p>
        ${btnRow(o)}
      </div></div>`;
  }).join('');

  el('histView').innerHTML=`
  <div class="statrow">
    <div class="tile"><div class="v">${es.length}</div><div class="l">การเลือกตั้งผู้ว่าฯ กทม.</div></div>
    <div class="tile"><div class="v">2518–2569</div><div class="l">ช่วงปี พ.ศ.</div></div>
    <div class="tile alt"><div class="v">8</div><div class="l">ผู้ชนะ (ไม่นับซ้ำคน)</div></div>
    <div class="tile"><div class="v">9</div><div class="l">ปีที่เว้นว่างนานสุด (2556→2565)</div></div>
  </div>
  <p class="hintro">ประมวล<b>การเลือกตั้งผู้ว่าราชการกรุงเทพมหานครทุกครั้ง</b> ตั้งแต่ครั้งแรก พ.ศ. 2518
    จนถึงครั้งล่าสุด พ.ศ. 2569 รวม ${es.length} ครั้ง พร้อมผู้ชนะ คะแนน คู่แข่งอันดับ 2 และเหตุการณ์การเมือง
    ที่ทำให้คนกรุงเทพฯ ต้องเว้นว่างจากการเลือกผู้ว่าฯ ของตัวเองไปหลายช่วง
    (ยุคแต่งตั้ง 2520–2528 และยุค คสช. 2557–2565)</p>

  <div class="sec-head">
    <div><span class="kick">Turnout at a Glance</span><h1>ผู้มาใช้สิทธิ<span class="o">ข้ามยุค</span></h1></div>
    <p>ความสูงของแท่ง = ร้อยละผู้มาใช้สิทธิ · สีตามพรรค/กลุ่มของผู้ชนะ · กดเพื่อไปการ์ดของปีนั้น</p>
  </div>
  <div class="panelbox hovbox">
    <div class="hov" id="hov">${ov}</div>
    <div class="hovlgd">ต่ำสุด <b>13.35%</b> (2518 · ครั้งแรก) → สูงสุด <b>63.98%</b> (2556 · สุขุมพันธุ์ vs พงศพัศ) · ล่าสุด 2569 อยู่ที่ 52.79%</div>
  </div>

  <div class="sec-head">
    <div><span class="kick">The Timeline</span><h1>ไทม์ไลน์<span class="o">ผู้ว่าฯ กทม.</span></h1></div>
    <p>เรียงตามเวลา · แถบสองเส้นในการ์ดคือคะแนนผู้ชนะเทียบกับอันดับ 2 (อ้างอิงกับคะแนนสูงสุดตลอดกาล)</p>
  </div>
  <div class="htl" id="htl">${rows}</div>

  <p class="hintro" style="margin-top:18px">ที่มาข้อมูล: วิกิพีเดีย — <b>การเลือกตั้งผู้ว่าราชการกรุงเทพมหานคร</b> และ <b>รายชื่อผู้ว่าราชการกรุงเทพมหานคร</b> ·
    ผลปี 2569 จากการนับคะแนนอย่างไม่เป็นทางการ · อยากดูไทม์ไลน์การเลือกตั้ง ส.ส. ทั้งประเทศ 2476–2569
    ไปที่หน้า <a href="timeline.html" style="color:var(--orange-deep);text-decoration:underline">ประวัติการเลือกตั้ง</a></p>`;

  // กดแท่งภาพรวม → เลื่อนไปการ์ดปีนั้น
  el('hov').addEventListener('click',function(e){
    const b=e.target.closest('.hovc'); if(!b) return;
    const card=el('hc-'+b.getAttribute('data-y')); if(!card) return;
    card.scrollIntoView({behavior:'smooth',block:'center'});
    card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash');
    setTimeout(()=>card.classList.remove('flash'),1600);
  });

  // เลื่อนเข้ามาแล้วค่อยโผล่ (ถ้าเบราว์เซอร์ไม่รองรับก็โชว์หมด)
  const rowEls=[].slice.call(el('htl').querySelectorAll('.hrow'));
  if(!('IntersectionObserver' in window)){ rowEls.forEach(r=>r.classList.add('is-visible')); return; }
  const io=new IntersectionObserver(function(en){
    en.forEach(x=>x.target.classList.toggle('is-visible',x.isIntersecting));
  },{threshold:.12});
  rowEls.forEach(r=>io.observe(r));
  // กันเหนียว: ถ้า observer ไม่ยิงเลย (บางเบราว์เซอร์/พรีวิว) อย่าปล่อยให้การ์ดหายไปทั้งหมด
  setTimeout(function(){
    if(!rowEls.some(r=>r.classList.contains('is-visible'))){
      io.disconnect(); rowEls.forEach(r=>r.classList.add('is-visible'));
    }
  },900);
}

window.BKKHIST=HIST;
window.BKKHPC=HPC;
window.BKKrenderHist=renderHist;
})();
