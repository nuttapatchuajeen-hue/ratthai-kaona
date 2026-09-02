/* intro-youtube.js — เพลงประจำปีเลือกตั้ง (คลิปบน YouTube) สำหรับการ์ด Mini Player หน้ารายเขต
   เล่นผ่าน YouTube IFrame Player API = การฝังอย่างเป็นทางการ แทนการเสิร์ฟไฟล์ .mp3 เอง
   → ถูกต้องตามลิขสิทธิ์และข้อกำหนดของ YouTube · ยอดวิว/รายได้ยังกลับไปหาเจ้าของผลงาน

   คีย์ = รหัสปีเลือกตั้ง (window.EYID เดียวกับ intro-music.js / year-<id>.js)
   ปีที่ยังไม่มีคลิป = ไม่ต้องใส่คีย์ → การ์ดไม่ขึ้น และปุ่มลำโพงซ่อนไปเอง (ไม่พัง)

   id     รหัสคลิป YouTube (11 ตัวอักษร ท้าย youtu.be/…)
   party  พรรคเจ้าของเพลง (พรรคอันดับ 1 ของปีนั้น)
   title  ชื่อเพลง
   artist เจ้าของผลงาน/ผู้ขับร้อง — แสดงเป็นเครดิตใต้ชื่อเพลง
   url    ลิงก์เต็มไว้ให้ผู้ใช้กด "ดูบน YouTube"                                        */
window.INTRO_YOUTUBE = {
  '2569':  { id:'H8iqtpm1w_Q', party:'ภูมิใจไทย',    title:'เพลงอนุทินเป็นนายก · นายกรัฐมนตรีคนที่ 32', artist:'Gongkung Music',            url:'https://youtu.be/H8iqtpm1w_Q' },
  '2566':  { id:'99KfzrvfIns', party:'ก้าวไกล',      title:'ก้าวไกลก้าวหน้า',                      artist:'วงสามัญชน x ส.ส.คำพอง เทพาคำ',   url:'https://youtu.be/99KfzrvfIns' },
  '2562':  { id:'A3Fm138GC1Q', party:'เพื่อไทย',     title:'เพื่อไทยแลนด์สไลด์ (Official MV)',     artist:'พรรคเพื่อไทย',                   url:'https://youtu.be/A3Fm138GC1Q' },
  '2554':  { id:'A3Fm138GC1Q', party:'เพื่อไทย',     title:'เพื่อไทยแลนด์สไลด์ (Official MV)',     artist:'พรรคเพื่อไทย',                   url:'https://youtu.be/A3Fm138GC1Q' },
  '2550':  { id:'FNur5U-Y710', party:'พลังประชาชน',  title:'พลังประชาชน (MV)',                     artist:'กี้ อริสมันต์ พงศ์เรืองรอง',     url:'https://youtu.be/FNur5U-Y710' },
  '2548':  { id:'Uurw_CC3VbQ', party:'ไทยรักไทย',    title:'บทเพลงแห่งนโยบาย · Song of the Policy', artist:'พรรคไทยรักไทย',                 url:'https://youtu.be/Uurw_CC3VbQ' },
  '2544':  { id:'Uurw_CC3VbQ', party:'ไทยรักไทย',    title:'บทเพลงแห่งนโยบาย · Song of the Policy', artist:'พรรคไทยรักไทย',                 url:'https://youtu.be/Uurw_CC3VbQ' },
  '2539':  { id:'NlVsqCH8s_k', party:'ความหวังใหม่', title:'เพลงพรรคความหวังใหม่ (พ.ศ. 2535–2539)', artist:'พรรคความหวังใหม่',              url:'https://youtu.be/NlVsqCH8s_k' },
  '2535b': { id:'_XHP2_m3T1I', party:'ประชาธิปัตย์', title:'ประชาธิปัตย์มาแล้ว',                   artist:'พรรคประชาธิปัตย์',               url:'https://youtu.be/_XHP2_m3T1I' },
  '2529':  { id:'_XHP2_m3T1I', party:'ประชาธิปัตย์', title:'ประชาธิปัตย์มาแล้ว',                   artist:'พรรคประชาธิปัตย์',               url:'https://youtu.be/_XHP2_m3T1I' },
  '2526':  { id:'lcxJxVxkMxo', party:'กิจสังคม',     title:'หัวหน้าและเลขาธิการพรรคกิจสังคม',      artist:'พรรคกิจสังคม',                   url:'https://youtu.be/lcxJxVxkMxo' },
  '2522':  { id:'lcxJxVxkMxo', party:'กิจสังคม',     title:'หัวหน้าและเลขาธิการพรรคกิจสังคม',      artist:'พรรคกิจสังคม',                   url:'https://youtu.be/lcxJxVxkMxo' },
  '2512':  { id:'Qv_SY27Uh5U', party:'สหประชาไทย',   title:'มาร์ชสหประชาไทย',                      artist:'พรรคสหประชาไทย',                 url:'https://youtu.be/Qv_SY27Uh5U' },
  '2500':  { id:'UFdzBThGxbc', party:'เสรีมนังคศิลา', title:'เสรีมนังคศิลา (มาร์ช) · Thai Patriotic Song', artist:'พรรคเสรีมนังคศิลา',       url:'https://youtu.be/UFdzBThGxbc' }
};
