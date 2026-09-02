/* mapzoom.js — เอนจินซูมแผนที่ที่ใช้ร่วมกันในเว็บรัฐไทยก้าวหน้า
   ถอดไอเดียมาจาก past-election-map.elect.in.th (2026-08-15) 3 ข้อ:

   1) บินเข้ากรอบแบบมีแอนิเมชัน — เว็บอ้างอิงใช้ d3 .transition().duration(750)
      ที่นี่ไม่มี d3 จึงทำ tween เองด้วย requestAnimationFrame + ease-out (cubic)
      พอบินจบค่อยเรียก onSettle() ให้หน้าเจ้าของไปจัดป้าย/รายละเอียดทีเดียว
      (เว็บอ้างอิงก็วาดป้ายเขตใน .on('end') เหมือนกัน — ระหว่างบินจะได้ไม่กระตุก)

   2) สูตรกรอบ scale = FILL / max(กว้างรูป/กว้างกรอบ, สูงรูป/สูงกรอบ)
      ของเว็บอ้างอิงคือ 0.875/Math.max(...) → พื้นที่ที่เลือกกินจอเท่ากันเสมอ
      ไม่ว่าจะเล็กอย่างสมุทรสงครามหรือใหญ่อย่างนครราชสีมา
      "กรอบ" ต้องเป็นพื้นที่ที่คนเห็นจริง ไม่ใช่ขนาด viewBox — เพราะ preserveAspectRatio=meet
      ทำให้มีขอบว่าง กรอบจริงจึงกว้าง/สูงกว่า viewBox (เว็บอ้างอิงส่งขนาด viewport เข้าสูตรตรง ๆ)

   3) เส้นขอบไม่หนาตามซูม — ทำที่ CSS ด้วย vector-effect:non-scaling-stroke
      (เว็บอ้างอิงใส่ที่ทุกเส้น: จังหวัด 1.2 / อำเภอ 0.6 / เขต 0.1 พิกเซลจอ)

   วิธีใช้:
     const mz = MapZoom.create(svgEl, gEl, {width:760, height:1377, onSettle(){...}});
     mz.fitEl(pathEl);   // บินเข้าหารูปนั้น
     mz.reset();         // บินกลับมุมมองเต็มแผนที่
*/
window.MapZoom=(function(){
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const easeOut=t=>1-Math.pow(1-t,3);

  function create(svg,g,opt){
    opt=opt||{};
    const W=opt.width, H=opt.height;
    const MAXZ=opt.maxZoom||40;
    const FILL=opt.fill||0.72, FILL_M=opt.fillMobile||0.52;
    const DUR=opt.duration==null?750:opt.duration;
    const MOBILE=opt.mobileWidth||860;
    const onScale=opt.onScale||function(){};
    const onSettle=opt.onSettle||function(){};
    const wheelZoom=!!opt.wheel;            // ปิดไว้เป็นค่าตั้งต้น: หน้าที่แผนที่อยู่ในสายเลื่อนหน้า
                                            // ถ้าดักล้อเมาส์จะไปแย่งการเลื่อนหน้าจนคนใช้หงุดหงิด
    let scale=1,tx=0,ty=0,raf=0,ctl=null;

    function apply(live){
      if(scale<1)scale=1;
      // clamp ให้เนื้อแผนที่คลุมกรอบเสมอ ไม่แพนหลุดไปเจอที่ว่าง
      tx=clamp(tx, W*(1-scale), 0);
      ty=clamp(ty, H*(1-scale), 0);
      g.setAttribute('transform','translate('+tx+' '+ty+') scale('+scale+')');
      if(ctl) ctl.classList.toggle('at1', scale<=1.001);   // ที่มุมมองเต็มแล้ว → ปุ่มย่อ/กลับ จางลง
      onScale(scale,!!live);
    }
    function cancel(){ if(raf){cancelAnimationFrame(raf);raf=0;} }
    function flyTo(ns,ntx,nty,dur){
      cancel();
      if(dur==null)dur=DUR;
      // แท็บที่ถูกซ่อนอยู่ rAF จะหยุดเดิน → ถ้าเริ่มบินตอนนั้นแผนที่จะค้าง ข้ามไปผลลัพธ์สุดท้ายเลย
      // (เดิมมี reduceMotion() ร่วมเงื่อนไขด้วย — เครื่องที่ปิดแอนิเมชันของ Windows
      //  จะเห็นแผนที่ "ตัด" ไปตำแหน่งใหม่ทันที ไม่ค่อย ๆ ซูม · เอาออกให้บินเสมอ)
      if(dur<=0||document.hidden){scale=ns;tx=ntx;ty=nty;apply();onSettle(scale);return;}
      const s0=scale,x0=tx,y0=ty,t0=performance.now();
      const step=now=>{
        const u=Math.min(1,(now-t0)/dur), e=easeOut(u);
        scale=s0+(ns-s0)*e; tx=x0+(ntx-x0)*e; ty=y0+(nty-y0)*e;
        apply(u<1);
        if(u<1) raf=requestAnimationFrame(step);
        else { raf=0; onSettle(scale); }
      };
      raf=requestAnimationFrame(step);
    }
    /* กรอบที่คนเห็นจริง วัดเป็นหน่วย viewBox */
    function viewport(){
      const r=svg.getBoundingClientRect();
      // กล่องยังไม่มีขนาด (ถูกซ่อนอยู่ / ยังไม่จัด layout) → ใช้ขนาด viewBox ไปก่อน
      // ไม่งั้นหารด้วยศูนย์แล้วได้ Infinity ทำให้คำนวณสเกลออกมาเป็น 1 (ซูมไม่ทำงาน)
      if(!r.width||!r.height) return {w:W, h:H, rs:1};
      const rs=Math.min(r.width/W, r.height/H)||1;   // หน่วย viewBox ต่อ 1 พิกเซลจอ
      return {w:r.width/rs, h:r.height/rs, rs:rs};
    }
    function fitTo(bb,dur){
      if(!bb||!bb.width||!bb.height)return;
      const v=viewport(), F=(innerWidth<=MOBILE?FILL_M:FILL);
      const s=clamp(F/Math.max(bb.width/v.w, bb.height/v.h), 1, MAXZ);
      const cx=bb.x+bb.width/2, cy=bb.y+bb.height/2;
      flyTo(s, W/2-cx*s, H/2-cy*s, dur);
    }
    function fitEl(el,dur){ if(el&&el.getBBox) fitTo(el.getBBox(),dur); }
    function reset(dur){ flyTo(1,0,0,dur); }
    /* ย่อ/ขยายทีละขั้นรอบจุดกึ่งกลางกรอบ (viewBox ถูกจัดกลางอยู่แล้ว จุดกึ่งกลางจึงเป็น W/2,H/2) */
    function zoomBy(f,dur){
      const ns=clamp(scale*f,1,MAXZ), k=ns/scale, cx=W/2, cy=H/2;
      flyTo(ns, cx-(cx-tx)*k, cy-(cy-ty)*k, dur==null?260:dur);
    }

    /* ---- ลากแพนตอนซูมเข้า (ตอน scale=1 ปล่อยให้หน้าเลื่อนตามปกติ) ---- */
    const pts=new Map(); let pan=null, pinch=null, dragged=false;
    function toVB(cx,cy){ const p=svg.createSVGPoint(); p.x=cx; p.y=cy;
      return p.matrixTransform(svg.getScreenCTM().inverse()); }
    svg.addEventListener('pointerdown',e=>{
      cancel();
      pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pts.size===1){ pan={x:e.clientX,y:e.clientY,tx:tx,ty:ty,id:e.pointerId}; dragged=false; }
      else { pan=null; pinch=null; }
    });
    svg.addEventListener('pointermove',e=>{
      const p=pts.get(e.pointerId); if(!p)return; p.x=e.clientX; p.y=e.clientY;
      const v=viewport(), k=1/v.rs;
      if(pts.size>=2){
        const a=[...pts.values()], d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),
              mx=(a[0].x+a[1].x)/2, my=(a[0].y+a[1].y)/2;
        if(pinch&&pinch.d>0){
          const f=d/pinch.d, vb=toVB(mx,my), ns=clamp(scale*f,1,MAXZ), kk=ns/scale;
          tx=vb.x-(vb.x-tx)*kk; ty=vb.y-(vb.y-ty)*kk; scale=ns;
          tx+=(mx-pinch.mx)*k; ty+=(my-pinch.my)*k; apply(true);
        }
        pinch={d:d,mx:mx,my:my}; dragged=true;
      } else if(pan && scale>1.001){
        const dx=e.clientX-pan.x, dy=e.clientY-pan.y;
        if(!dragged && Math.abs(dx)+Math.abs(dy)>4){
          dragged=true; svg.classList.add('mz-drag');
          try{svg.setPointerCapture(pan.id)}catch(_){}
        }
        if(dragged){ tx=pan.tx+dx*k; ty=pan.ty+dy*k; apply(true); }
      }
    });
    function up(e){
      pts.delete(e.pointerId);
      try{svg.releasePointerCapture(e.pointerId)}catch(_){}
      if(pts.size<2)pinch=null;
      if(pts.size===0){ svg.classList.remove('mz-drag'); pan=null; }
      else if(pts.size===1){ const id=[...pts.keys()][0],q=pts.get(id); pan={x:q.x,y:q.y,tx:tx,ty:ty,id:id}; }
    }
    svg.addEventListener('pointerup',up); svg.addEventListener('pointercancel',up);
    // ลากแล้วปล่อย ไม่ให้กลายเป็นการคลิกเลือกพื้นที่ (ดักชั้น capture ก่อนถึง handler ของหน้า)
    svg.addEventListener('click',e=>{ if(dragged){ e.stopPropagation(); e.preventDefault(); dragged=false; } },true);

    if(wheelZoom) svg.addEventListener('wheel',e=>{
      e.preventDefault(); cancel();
      const vb=toVB(e.clientX,e.clientY), f=e.deltaY<0?1.12:1/1.12,
            ns=clamp(scale*f,1,MAXZ), k=ns/scale;
      tx=vb.x-(vb.x-tx)*k; ty=vb.y-(vb.y-ty)*k; scale=ns; apply(true);
    },{passive:false});

    const api={
      fitTo:fitTo, fitEl:fitEl, reset:reset, flyTo:flyTo, zoomBy:zoomBy, cancel:cancel,
      get scale(){return scale}
    };
    if(opt.controls!==false) ctl=mountControls(svg, api, opt.controlLabels);
    return api;
  }

  /* ---- ปุ่ม ＋ / − / กลับทั้งแผนที่ ลอยมุมขวาล่างของกล่องแผนที่ ----
     จำเป็นเพราะพอคลิกซูมเข้าไปลึก ๆ แล้วไม่มีทางออกให้เห็น (ล้อเมาส์ก็ปิดไว้)
     ปุ่ม "ย่อ" กับ "กลับทั้งแผนที่" จะจาง+กดไม่ได้ตอนอยู่ที่มุมมองเต็มแล้ว */
  let styleDone=false;
  function injectStyle(){
    if(styleDone) return; styleDone=true;
    const s=document.createElement('style');
    s.textContent=
      '.mz-ctl{position:absolute;right:10px;bottom:10px;z-index:6;display:flex;flex-direction:column;gap:6px}'+
      '.mz-ctl button{width:34px;height:34px;padding:0;border-radius:10px;border:1px solid rgba(120,140,160,.38);'+
        'background:rgba(255,255,255,.9);color:#16222f;font-family:inherit;font-size:17px;font-weight:600;line-height:1;'+
        'cursor:pointer;display:grid;place-items:center;box-shadow:0 2px 10px rgba(10,30,50,.16);transition:background .14s,opacity .18s}'+
      '.mz-ctl button:hover{background:#fff}'+
      '.mz-ctl button[data-a="reset"]{font-size:13px}'+
      '.mz-ctl.at1 button[data-a="out"],.mz-ctl.at1 button[data-a="reset"]{opacity:.32;pointer-events:none}'+
      'html[data-theme="dark"] .mz-ctl button{background:rgba(16,26,36,.9);color:#E3EDF5;border-color:rgba(255,255,255,.18)}'+
      'html[data-theme="dark"] .mz-ctl button:hover{background:rgba(26,40,54,.98)}';
    document.head.appendChild(s);
  }
  function mountControls(svg, api, labels){
    const host=svg.parentElement; if(!host) return null;
    injectStyle();
    // กันปุ่มซ้อนกันตอนแผนที่ถูกวาดใหม่แล้วกล่องเดิมยังอยู่ (เช่น สลับธีมแล้ว Plot วาดทับ)
    const old=host.querySelector(':scope > .mz-ctl'); if(old) old.remove();
    if(getComputedStyle(host).position==='static') host.style.position='relative';
    const L=labels||{};
    const box=document.createElement('div');
    box.className='mz-ctl at1';
    box.innerHTML=
      '<button type="button" data-a="in" title="'+(L.in||'ขยาย')+'" aria-label="'+(L.in||'ขยาย')+'">+</button>'+
      '<button type="button" data-a="out" title="'+(L.out||'ย่อ')+'" aria-label="'+(L.out||'ย่อ')+'">−</button>'+
      '<button type="button" data-a="reset" title="'+(L.reset||'กลับทั้งแผนที่')+'" aria-label="'+(L.reset||'กลับทั้งแผนที่')+'">⤢</button>';
    host.appendChild(box);
    // กันคลิกทะลุไปโดนแผนที่/handler ของหน้า (ปุ่มลอยทับ svg อยู่)
    box.addEventListener('pointerdown',e=>e.stopPropagation());
    box.addEventListener('click',e=>{
      const b=e.target.closest('button'); if(!b) return;
      e.stopPropagation(); e.preventDefault();
      if(b.dataset.a==='in') api.zoomBy(1.6);
      else if(b.dataset.a==='out') api.zoomBy(1/1.6);
      else api.reset();
    });
    return box;
  }
  return {create:create};
})();
