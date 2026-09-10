/* ══════════════════════════════════════════════════════════════════════
   deep.js — เพื่อนบ้านของทางช้างเผือก และโครงสร้างที่ใหญ่กว่านั้น
     ทิศทางบนท้องฟ้า (RA/Dec) มาจาก SIMBAD ของ CDS
     ระยะทางเป็นค่าที่ประกาศกันทั่วไป — ระยะของวัตถุนอกกาแล็กซี
     มีความไม่แน่นอนสูงโดยธรรมชาติ ตัวเลขทั้งหมดจึงเป็นค่าโดยประมาณ
     x, y, z = ล้านปีแสง ในพิกัดสุริยวิถี · r = ขนาดที่ใช้วาด (ไม่ใช่ขนาดจริง)
   ══════════════════════════════════════════════════════════════════════ */
'use strict';

const DEEP = [
{th:'เมฆแมกเจลแลนใหญ่',en:'Large Magellanic Cloud',x:0.0089,y:-0.0097,z:-0.1625,mly:0.163,r:9,de:{th:'กาแล็กซีบริวารของทางช้างเผือกที่สว่างที่สุด มองเห็นด้วยตาเปล่าจากซีกโลกใต้เป็นปื้นฝ้าขาว เป็นที่เกิดของซูเปอร์โนวา 1987A ซึ่งเป็นซูเปอร์โนวาที่ใกล้ที่สุดในรอบสี่ศตวรรษ',en:'The brightest satellite galaxy of the Milky Way, visible to the naked eye from the southern hemisphere as a detached patch of light. It hosted SN 1987A, the closest supernova in four centuries.'}},
{th:'เมฆแมกเจลแลนเล็ก',en:'Small Magellanic Cloud',x:0.0576,y:-0.0636,z:-0.1806,mly:0.2,r:6},
{th:'แคระเครื่องแกะสลัก',en:'Sculptor Dwarf',x:0.233,y:-0.0066,z:-0.1726,mly:0.29,r:3},
{th:'แคระเตาหลอม',en:'Fornax Dwarf',x:0.2906,y:0.1202,z:-0.3357,mly:0.46,r:3},
{th:'ลีโอ วัน',en:'Leo I',x:-0.7081,y:0.4133,z:0.0113,mly:0.82,r:3},
{th:'กาแล็กซีบาร์นาร์ด',en:'Barnard’s Galaxy',x:0.6838,y:-1.4356,z:0.177,mly:1.6,r:4},
{th:'ไอซี 10',en:'IC 10',x:1.1187,y:0.8436,z:1.6961,mly:2.2,r:4},
{th:'เอ็ม 32',en:'M32',x:1.9694,y:1.0303,z:1.4431,mly:2.65,r:4},
{th:'เอ็ม 110',en:'M110',x:1.9778,y:1.0346,z:1.5013,mly:2.69,r:5},
{th:'กาแล็กซีแอนดรอมิดา',en:'Andromeda Galaxy',x:1.876,y:0.9912,z:1.3963,mly:2.54,r:16,de:{th:'กาแล็กซีกังหันใหญ่ที่ใกล้ที่สุด และเป็นวัตถุไกลที่สุดที่ตาเปล่ามองเห็นได้ กำลังพุ่งเข้าหาทางช้างเผือกด้วยความเร็วราว 110 กิโลเมตรต่อวินาที และจะชนรวมกันในอีกราวสี่พันห้าร้อยล้านปี',en:'The nearest large spiral galaxy and the most distant thing the naked eye can see. It is falling towards the Milky Way at about 110 km/s and the two will merge in roughly 4.5 billion years.'}},
{th:'กาแล็กซีสามเหลี่ยม',en:'Triangulum Galaxy',x:2.1542,y:1.4116,z:0.9054,mly:2.73,r:11},
{th:'เซนทอรัส เอ',en:'Centaurus A',x:-8.1706,y:-6.1891,z:-6.2399,mly:12,r:8,de:{th:'กาแล็กซีวิทยุที่ใกล้ที่สุด มีแถบฝุ่นดำพาดกลางจากการชนรวมกันของสองกาแล็กซี และมีหลุมดำมวลยิ่งยวดที่พ่นลำอนุภาคยาวหลายพันปีแสง',en:'The nearest radio galaxy, crossed by a dark dust lane left by a merger, with a supermassive black hole firing jets thousands of light-years long.'}},
{th:'กาแล็กซีโบด',en:'Bode’s Galaxy',x:-3.6709,y:6.4909,z:9.4017,mly:12,r:9},
{th:'กาแล็กซีน้ำวน',en:'Whirlpool Galaxy',x:-14.4421,y:1.2321,z:17.858,mly:23,r:8},
{th:'เอ็ม 87 · ใจกลางกระจุกหญิงสาว',en:'M87 · Virgo Cluster core',x:-51.2979,y:-1.8445,z:13.1955,mly:53,r:14,de:{th:'กาแล็กซีทรงรียักษ์ใจกลางกระจุกกาแล็กซีหญิงสาว หลุมดำมวลยิ่งยวดของมันคือหลุมดำแรกที่มนุษย์ถ่ายภาพเงาได้สำเร็จเมื่อปี 2562',en:'The giant elliptical at the heart of the Virgo Cluster. Its supermassive black hole was the first ever imaged, in 2019.'}},
{th:'กระจุกผมเบเรนิซ',en:'Coma Cluster',x:-274.0738,y:-7.2995,z:166.9468,mly:321,r:20,de:{th:'กระจุกกาแล็กซีหนาแน่นที่มีสมาชิกกว่าพันกาแล็กซี เป็นที่แรกที่ฟริตซ์ ซวิกกีสังเกตเมื่อปี 1933 ว่ามวลที่มองเห็นไม่พอจะยึดกระจุกไว้ได้ ซึ่งเป็นจุดเริ่มของแนวคิดสสารมืด',en:'A dense cluster of over a thousand galaxies — where Fritz Zwicky noticed in 1933 that the visible mass was far too small to hold it together, the first hint of dark matter.'}},
{th:'กระจุกนอร์มา · จุดดึงดูดใหญ่',en:'Norma Cluster · Great Attractor',x:-47.6305,y:-164.4505,z:-138.157,mly:220,r:18,de:{th:'ใจกลางแรงโน้มถ่วงที่ดึงทางช้างเผือกและกาแล็กซีเพื่อนบ้านทั้งกลุ่มให้เคลื่อนที่ไปทางนั้นด้วยความเร็วราว 600 กิโลเมตรต่อวินาที มองเห็นยากเพราะอยู่หลังระนาบทางช้างเผือกพอดี',en:'The gravitational focus pulling the Milky Way and its neighbours towards it at about 600 km/s. It is hard to observe because it lies directly behind the plane of our own galaxy.'}}
];
