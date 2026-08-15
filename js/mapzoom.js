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
  const reduceMotion=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    let scale=1,tx=0,ty=0,raf=0;

    function apply(live){
      if(scale<1)scale=1;
      // clamp ให้เนื้อแผนที่คลุมกรอบเสมอ ไม่แพนหลุดไปเจอที่ว่าง
      tx=clamp(tx, W*(1-scale), 0);
      ty=clamp(ty, H*(1-scale), 0);
      g.setAttribute('transform','translate('+tx+' '+ty+') scale('+scale+')');
      onScale(scale,!!live);
    }
    function cancel(){ if(raf){cancelAnimationFrame(raf);raf=0;} }
    function flyTo(ns,ntx,nty,dur){
      cancel();
      if(dur==null)dur=DUR;
      // แท็บที่ถูกซ่อนอยู่ rAF จะหยุดเดิน → ถ้าเริ่มบินตอนนั้นแผนที่จะค้าง ข้ามไปผลลัพธ์สุดท้ายเลย
      if(dur<=0||document.hidden||reduceMotion()){scale=ns;tx=ntx;ty=nty;apply();onSettle(scale);return;}
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

    return {
      fitTo:fitTo, fitEl:fitEl, reset:reset, flyTo:flyTo, cancel:cancel,
      get scale(){return scale}
    };
  }
  return {create:create};
})();
