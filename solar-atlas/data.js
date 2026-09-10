/* ══════════════════════════════════════════════════════════════════════
   data.js — ตัวเลขล้วน: องค์ประกอบวงโคจร ข้อมูลกายภาพ และข้อความสองภาษา
   ที่มาของตัวเลข: ค่ามาตรฐานทางดาราศาสตร์ที่เผยแพร่สาธารณะ
   (องค์ประกอบวงโคจรโดยประมาณของ JPL ยุค J2000, ช่วงใช้งาน ค.ศ. 1800–2050)
   ตัวเลขข้อเท็จจริงไม่มีลิขสิทธิ์ — คำบรรยายทั้งหมดเขียนขึ้นใหม่เอง
   ══════════════════════════════════════════════════════════════════════ */
'use strict';

const AU = 149597870.7;      // กิโลเมตรต่อ 1 หน่วยดาราศาสตร์
const KMU = 1000;            // 1 หน่วยในฉาก 3 มิติ = 1000 กม.
const DEG = Math.PI / 180;
const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);   // 2000-01-01 12:00 UTC

/* ── ดาวเคราะห์: a, e, I, L, ϖ (ลองจิจูดจุดใกล้ที่สุด), Ω และอัตราต่อศตวรรษ
      หน่วย: AU และองศา  ‖  [ค่า, อัตรา/ศตวรรษ] ───────────────────────── */
const ELEMENTS = {
  mercury: { a:[0.38709927, 0.00000037], e:[0.20563593, 0.00001906], i:[7.00497902,-0.00594749],
             L:[252.25032350, 149472.67411175], w:[77.45779628, 0.16047689], n:[48.33076593,-0.12534081] },
  venus:   { a:[0.72333566, 0.00000390], e:[0.00677672,-0.00004107], i:[3.39467605,-0.00078890],
             L:[181.97909950, 58517.81538729], w:[131.60246718, 0.00268329], n:[76.67984255,-0.27769418] },
  earth:   { a:[1.00000261, 0.00000562], e:[0.01671123,-0.00004392], i:[-0.00001531,-0.01294668],
             L:[100.46457166, 35999.37244981], w:[102.93768193, 0.32327364], n:[0.0, 0.0] },
  mars:    { a:[1.52371034, 0.00001847], e:[0.09339410, 0.00007882], i:[1.84969142,-0.00813131],
             L:[-4.55343205, 19140.30268499], w:[-23.94362959, 0.44441088], n:[49.55953891,-0.29257343] },
  jupiter: { a:[5.20288700,-0.00011607], e:[0.04838624,-0.00013253], i:[1.30439695,-0.00183714],
             L:[34.39644051, 3034.74612775], w:[14.72847983, 0.21252668], n:[100.47390909, 0.20469106] },
  saturn:  { a:[9.53667594,-0.00125060], e:[0.05386179,-0.00050991], i:[2.48599187, 0.00193609],
             L:[49.95424423, 1222.49362201], w:[92.59887831,-0.41897216], n:[113.66242448,-0.28867794] },
  uranus:  { a:[19.18916464,-0.00196176], e:[0.04725744,-0.00004397], i:[0.77263783,-0.00242939],
             L:[313.23810451, 428.48202785], w:[170.95427630, 0.40805281], n:[74.01692503, 0.04240589] },
  neptune: { a:[30.06992276, 0.00026291], e:[0.00859048, 0.00005105], i:[1.77004347, 0.00035372],
             L:[-55.12002969, 218.45945325], w:[44.96476227,-0.32241464], n:[131.78422574,-0.00508664] },
  pluto:   { a:[39.48211675,-0.00031596], e:[0.24882730, 0.00005170], i:[17.14001206, 0.00004818],
             L:[238.92903833, 145.20780515], w:[224.06891629,-0.04062942], n:[110.30393684,-0.01183482] }
};

/* ── ดวงอาทิตย์ ดาวเคราะห์ ดาวเคราะห์แคระ ──────────────────────────── */
const BODIES = [
{
  id:'sun', kind:'star', color:0xffb454, glow:'#ffb454',
  nm:{th:'ดวงอาทิตย์', en:'Sun'},
  radius:695700, mass:1.989e30, gravity:274, rotH:609.12, tilt:7.25, axisNode:75.6,
  moons:'—', temp:'5,500 °C (ผิว)', tempEn:'5,500 °C (surface)', orbitDays:null, aAU:0,
  origin:{th:'พระอาทิตย์ (สูรยะ) — ที่มาของ “วันอาทิตย์”', en:'Sol, the Roman sun — root of “Sunday”'},
  desc:{
    th:'ดาวฤกษ์ดวงเดียวของเรา มีมวลราว 99.86% ของทั้งระบบสุริยะ แรงโน้มถ่วงของมันคือสิ่งที่ยึดทุกวงโคจรในแผนที่นี้ไว้ ใจกลางเกิดปฏิกิริยาหลอมไฮโดรเจนเป็นฮีเลียม ปล่อยพลังงานที่ใช้เวลาหลายแสนปีกว่าจะไต่ออกมาถึงผิว แล้วใช้เวลาอีกเพียง 8 นาทีเดินทางถึงโลก',
    en:'Our only star holds about 99.86% of the mass in the solar system; its gravity is what pins every orbit on this map in place. Hydrogen fuses to helium in its core, and that energy takes hundreds of thousands of years to crawl to the surface — then just 8 minutes to reach Earth.'}
},
{
  id:'mercury', kind:'planet', color:0xa8a29a, glow:'#a8a29a',
  nm:{th:'ดาวพุธ', en:'Mercury'},
  radius:2439.7, mass:3.301e23, gravity:3.7, rotH:1407.6, tilt:0.034, axisNode:0,
  moons:0, temp:'−173 ถึง 427 °C', tempEn:'−173 to 427 °C', orbitDays:87.969, aAU:0.387,
  origin:{th:'พระพุธ (พุธะ) — ที่มาของ “วันพุธ”', en:'Mercury, the swift Roman messenger — “Wednesday” in Latin tongues'},
  desc:{
    th:'ดาวเคราะห์ที่เล็กที่สุดและอยู่ใกล้ดวงอาทิตย์ที่สุด ใหญ่กว่าดวงจันทร์ของเราไม่มาก ไม่มีชั้นบรรยากาศจริงจังคอยเก็บความร้อน ด้านกลางวันจึงร้อนพอจะหลอมตะกั่ว ส่วนด้านกลางคืนหนาวติดลบเกือบสองร้อยองศา หนึ่งวันบนดาวพุธยาวกว่าหนึ่งปีของมันเสียอีก',
    en:'The smallest planet and the closest to the Sun, only a little larger than our Moon. With almost no atmosphere to hold heat, its dayside is hot enough to melt lead while its nightside plunges nearly 200 degrees below zero. A single solar day there outlasts its own year.'}
},
{
  id:'venus', kind:'planet', color:0xe8c07a, glow:'#e8c07a',
  nm:{th:'ดาวศุกร์', en:'Venus'},
  radius:6051.8, mass:4.867e24, gravity:8.87, rotH:-5832.5, tilt:177.4, axisNode:0,
  moons:0, temp:'464 °C', tempEn:'464 °C', orbitDays:224.701, aAU:0.723,
  origin:{th:'พระศุกร์ (ศุกระ) — ที่มาของ “วันศุกร์”', en:'Venus, Roman goddess of love — “Friday” in Latin tongues'},
  desc:{
    th:'ฝาแฝดของโลกโดยขนาด แต่คนละโลกโดยสิ้นเชิง บรรยากาศคาร์บอนไดออกไซด์หนาทึบกดทับผิวด้วยความดันเทียบเท่าใต้ทะเลลึก 900 เมตร และกักความร้อนไว้จนร้อนกว่าดาวพุธทั้งที่อยู่ไกลกว่า มันยังหมุนรอบตัวเองถอยหลังอย่างเชื่องช้าที่สุดในบรรดาดาวเคราะห์',
    en:'Earth’s twin in size and nothing like it in temperament. A crushing carbon-dioxide atmosphere presses down with the force of 900 metres of seawater and traps enough heat to make Venus hotter than Mercury, despite sitting further out. It also turns backwards, and slower than any other planet.'}
},
{
  id:'earth', kind:'planet', color:0x4a9be0, glow:'#4a9be0',
  nm:{th:'โลก', en:'Earth'},
  radius:6371.0, mass:5.972e24, gravity:9.81, rotH:23.9345, tilt:23.44, axisNode:0,
  moons:1, temp:'15 °C', tempEn:'15 °C', orbitDays:365.256, aAU:1.000,
  origin:{th:'“โลก” จากภาษาบาลี-สันสกฤต โลก/loka แปลว่าโลกหรือภพ', en:'The only planet not named for a god — from Old English eorþe, “ground”'},
  desc:{
    th:'โลกใบเดียวที่เรารู้ว่ามีสิ่งมีชีวิต และเป็นดาวเคราะห์เดียวที่มีน้ำเหลวปกคลุมพื้นผิวอย่างถาวร ความเอียงของแกน 23.4 องศาคือสาเหตุของฤดูกาล ส่วนสนามแม่เหล็กจากแกนเหล็กหลอมเหลวคอยเบี่ยงลมสุริยะให้พ้นชั้นบรรยากาศ',
    en:'The only world we know that carries life, and the only planet with liquid water standing permanently on its surface. Its 23.4-degree tilt gives us seasons, while a magnetic field generated in its molten iron core deflects the solar wind away from the air we breathe.'}
},
{
  id:'mars', kind:'planet', color:0xd2694a, glow:'#d2694a',
  nm:{th:'ดาวอังคาร', en:'Mars'},
  radius:3389.5, mass:6.417e23, gravity:3.71, rotH:24.6229, tilt:25.19, axisNode:352.9,
  moons:2, temp:'−65 °C', tempEn:'−65 °C', orbitDays:686.980, aAU:1.524,
  origin:{th:'พระอังคาร (มังคละ) — ที่มาของ “วันอังคาร”', en:'Mars, Roman god of war — “Tuesday” in Latin tongues'},
  desc:{
    th:'สีแดงของมันมาจากสนิมเหล็กในฝุ่นที่ปกคลุมทั้งดวง ดาวอังคารมีหุบเหวยาวกว่าทวีป มีภูเขาไฟสูงที่สุดในระบบสุริยะ และมีน้ำแข็งสะสมอยู่ที่ขั้วทั้งสอง หนึ่งวันของมันยาวกว่าของโลกเพียง 40 นาที ทำให้เป็นเป้าหมายการสำรวจที่คุ้นเคยผิดปกติ',
    en:'Its red comes from rusted iron in the dust that coats the entire globe. Mars holds a canyon longer than a continent, the tallest volcano in the solar system, and water ice banked at both poles. Its day runs just 40 minutes longer than ours, which makes it strangely familiar ground.'}
},
{
  id:'jupiter', kind:'planet', color:0xd9a678, glow:'#d9a678',
  nm:{th:'ดาวพฤหัสบดี', en:'Jupiter'},
  radius:69911, mass:1.898e27, gravity:24.79, rotH:9.925, tilt:3.13, axisNode:-22.2,
  moons:95, temp:'−110 °C', tempEn:'−110 °C', orbitDays:4332.589, aAU:5.203,
  origin:{th:'พระพฤหัสบดี (พฤหัสปติ) — ที่มาของ “วันพฤหัสบดี”', en:'Jupiter, king of the Roman gods — “Thursday” in Latin tongues'},
  desc:{
    th:'ยักษ์ใหญ่ที่มีมวลมากกว่าดาวเคราะห์ที่เหลือรวมกันสองเท่าครึ่ง ไม่มีพื้นผิวแข็งให้ยืน มีแต่ชั้นแก๊สที่ลึกลงไปจนกลายเป็นไฮโดรเจนเหลวคล้ายโลหะ แถบสีที่เห็นคือกระแสลมที่วิ่งสวนทางกัน และจุดแดงใหญ่คือพายุที่หมุนต่อเนื่องมานานกว่าที่มนุษย์เฝ้าดูมันเสียอีก',
    en:'A giant with two and a half times the mass of every other planet combined. There is no surface to stand on — only gas that thickens downward until hydrogen behaves like liquid metal. The stripes are jet streams running in opposite directions, and the Great Red Spot is a storm older than our record of watching it.'}
},
{
  id:'saturn', kind:'planet', color:0xe3c88a, glow:'#e3c88a', ring:[1.20, 2.27],
  nm:{th:'ดาวเสาร์', en:'Saturn'},
  radius:58232, mass:5.683e26, gravity:10.44, rotH:10.656, tilt:26.73, axisNode:80.5,
  moons:274, temp:'−140 °C', tempEn:'−140 °C', orbitDays:10759.22, aAU:9.537,
  origin:{th:'พระเสาร์ (ศนิ) — ที่มาของ “วันเสาร์”', en:'Saturn, Roman god of the harvest — “Saturday”'},
  desc:{
    th:'วงแหวนของมันไม่ใช่แผ่นทึบ แต่คือก้อนน้ำแข็งนับไม่ถ้วนตั้งแต่เม็ดทรายจนถึงขนาดบ้าน โคจรเรียงตัวกันเป็นแผ่นบางเพียงไม่กี่สิบเมตรแต่กว้างเกือบสามแสนกิโลเมตร ตัวดาวมีความหนาแน่นน้อยกว่าน้ำ — ถ้าหาอ่างใหญ่พอได้ มันจะลอย',
    en:'The rings are not solid sheets but countless chunks of ice, from sand grains to houses, orbiting in a sheet only tens of metres thick and nearly 300,000 km wide. The planet itself is less dense than water — given a big enough bath, Saturn would float.'}
},
{
  id:'uranus', kind:'planet', color:0x7fd4d8, glow:'#7fd4d8', ring:[1.64, 2.00],
  nm:{th:'ดาวยูเรนัส', en:'Uranus'},
  radius:25362, mass:8.681e25, gravity:8.87, rotH:-17.24, tilt:97.77, axisNode:257.3,
  moons:28, temp:'−195 °C', tempEn:'−195 °C', orbitDays:30685.4, aAU:19.191,
  origin:{th:'ทับศัพท์จาก Uranus เทพแห่งฟ้าของกรีก ค้นพบปี 1781 หลังยุคตั้งชื่อวันในสัปดาห์', en:'Ouranos, the Greek sky god — discovered in 1781, long after the weekdays were named'},
  desc:{
    th:'ดาวเคราะห์ที่นอนตะแคงหมุน แกนเอียงเกือบ 98 องศาจนขั้วหันเข้าหาดวงอาทิตย์สลับกันข้างละ 42 ปี น่าจะเป็นผลจากการชนครั้งใหญ่ในอดีต สีเขียวอมฟ้ามาจากมีเทนในบรรยากาศที่ดูดกลืนแสงสีแดงไว้',
    en:'A planet that rolls on its side: tilted almost 98 degrees, it points one pole at the Sun for 42 years at a stretch, most likely after an enormous ancient collision. The blue-green comes from methane in its air, which swallows red light.'}
},
{
  id:'neptune', kind:'planet', color:0x5a72d8, glow:'#5a72d8',
  nm:{th:'ดาวเนปจูน', en:'Neptune'},
  radius:24622, mass:1.024e26, gravity:11.15, rotH:16.11, tilt:28.32, axisNode:299.4,
  moons:16, temp:'−200 °C', tempEn:'−200 °C', orbitDays:60189, aAU:30.070,
  origin:{th:'ทับศัพท์จาก Neptune เทพแห่งทะเลของโรมัน', en:'Neptune, Roman god of the sea'},
  desc:{
    th:'ดาวเคราะห์ดวงไกลที่สุด และเป็นดวงแรกที่ถูก “คำนวณเจอ” ก่อนจะส่องกล้องไปดู — จากความผิดปกติในวงโคจรของยูเรนัส ที่นี่มีลมแรงที่สุดในระบบสุริยะ พัดได้เกิน 2,000 กิโลเมตรต่อชั่วโมง ทั้งที่ได้รับแสงอาทิตย์เพียงหนึ่งในพันของโลก',
    en:'The outermost planet, and the first found with mathematics before a telescope — deduced from wobbles in the orbit of Uranus. It carries the fastest winds in the solar system, over 2,000 km/h, on a thousandth of the sunlight Earth receives.'}
},
{
  id:'pluto', kind:'dwarf', color:0xb09a8a, glow:'#b09a8a',
  nm:{th:'ดาวพลูโต', en:'Pluto'},
  radius:1188.3, mass:1.303e22, gravity:0.62, rotH:-153.3, tilt:122.53, axisNode:223.0,
  moons:5, temp:'−225 °C', tempEn:'−225 °C', orbitDays:90560, aAU:39.482,
  origin:{th:'ทับศัพท์จาก Pluto เทพแห่งโลกบาดาล เสนอชื่อโดยเด็กหญิงวัย 11 ปีในปี 1930', en:'Pluto, god of the underworld — named by an 11-year-old girl in 1930'},
  desc:{
    th:'ถูกจัดเป็นดาวเคราะห์แคระตั้งแต่ปี 2006 เพราะวงโคจรของมันยังมีวัตถุอื่นปะปนอยู่มาก วงโคจรเอียงและรีมากพอที่บางช่วงมันจะเข้ามาใกล้ดวงอาทิตย์กว่าเนปจูน พื้นผิวมีที่ราบน้ำแข็งไนโตรเจนรูปหัวใจกว้างพอ ๆ กับประเทศไทย',
    en:'Reclassified as a dwarf planet in 2006 because its orbital neighbourhood is still crowded with other bodies. That orbit is tilted and stretched enough that Pluto sometimes rides closer to the Sun than Neptune. Its surface carries a heart-shaped plain of frozen nitrogen the size of Thailand.'}
}
];

/* ── ดวงจันทร์: วงโคจรเคปเลอร์รอบดาวแม่ (a กม., คาบวัน, เอียงจากศูนย์สูตรแม่) ── */
const MOONS = [
{ id:'moon', parent:'earth', nm:{th:'ดวงจันทร์', en:'Moon'}, color:0xd8d3c8,
  radius:1737.4, mass:7.346e22, gravity:1.62, a:384400, period:27.321661, e:0.0549, inc:5.145, node:125.0, ecl:true,
  desc:{th:'บริวารดวงเดียวของโลก ใหญ่ผิดส่วนเมื่อเทียบกับดาวแม่ แรงไทดัลของมันคือสาเหตุของน้ำขึ้นน้ำลง และช่วยพยุงแกนโลกให้เอียงคงที่ ด้านที่หันเข้าหาเราคือด้านเดิมเสมอ เพราะคาบหมุนรอบตัวเองเท่ากับคาบโคจรพอดี',
        en:'Earth’s only natural satellite, oddly large for its parent. Its tidal pull drives the tides and steadies our axial tilt, and it always shows the same face because it spins exactly once per orbit.'} },
{ id:'phobos', parent:'mars', nm:{th:'โฟบอส', en:'Phobos'}, color:0x9a8c80,
  radius:11.3, mass:1.066e16, gravity:0.0057, a:9376, period:0.31891, e:0.0151, inc:1.08, node:0,
  desc:{th:'ดวงจันทร์รูปทรงมันฝรั่งที่โคจรใกล้ดาวอังคารมากจนขึ้นทางทิศตะวันตกวันละสามรอบ และกำลังค่อย ๆ ตกลงสู่ดาวแม่',
        en:'A potato-shaped moon orbiting so close it rises in the west three times a Martian day — and it is slowly spiralling in.'} },
{ id:'deimos', parent:'mars', nm:{th:'ไดมอส', en:'Deimos'}, color:0xa89a8c,
  radius:6.2, mass:1.476e15, gravity:0.003, a:23463, period:1.26244, e:0.00033, inc:1.79, node:0,
  desc:{th:'ดวงจันทร์ดวงเล็กกว่าของดาวอังคาร เล็กจนแรงโน้มถ่วงแทบไม่รู้สึก คนที่ยืนบนนั้นกระโดดแรง ๆ อาจหลุดออกไปได้',
        en:'The smaller Martian moon, with gravity so faint that a hard jump could carry you off it.'} },
{ id:'io', parent:'jupiter', nm:{th:'ไอโอ', en:'Io'}, color:0xe8d98a,
  radius:1821.6, mass:8.93e22, gravity:1.80, a:421800, period:1.769138, e:0.0041, inc:0.036, node:0,
  desc:{th:'วัตถุที่มีภูเขาไฟคุกรุ่นที่สุดในระบบสุริยะ ถูกแรงไทดัลของดาวพฤหัสบดีนวดจนภายในหลอมเหลว พ่นกำมะถันขึ้นสูงหลายร้อยกิโลเมตร',
        en:'The most volcanically active world we know, kneaded molten by Jupiter’s tides and throwing sulphur hundreds of kilometres high.'} },
{ id:'europa', parent:'jupiter', nm:{th:'ยูโรปา', en:'Europa'}, color:0xe6dccb,
  radius:1560.8, mass:4.8e22, gravity:1.31, a:671100, period:3.551181, e:0.0094, inc:0.466, node:0,
  desc:{th:'เปลือกน้ำแข็งเรียบลื่นมีรอยแตกสีสนิมพาดทั่วดวง ใต้ลงไปน่าจะเป็นมหาสมุทรน้ำเค็มที่มีน้ำมากกว่ามหาสมุทรโลกรวมกัน',
        en:'A smooth ice shell laced with rust-coloured cracks, almost certainly hiding a salt ocean with more water than all of Earth’s seas combined.'} },
{ id:'ganymede', parent:'jupiter', nm:{th:'แกนีมีด', en:'Ganymede'}, color:0xa9a49c,
  radius:2634.1, mass:1.48e23, gravity:1.43, a:1070400, period:7.154553, e:0.0013, inc:0.177, node:0,
  desc:{th:'ดวงจันทร์ที่ใหญ่ที่สุดในระบบสุริยะ ใหญ่กว่าดาวพุธ และเป็นดวงจันทร์ดวงเดียวที่มีสนามแม่เหล็กของตัวเอง',
        en:'The largest moon in the solar system — bigger than Mercury — and the only one with a magnetic field of its own.'} },
{ id:'callisto', parent:'jupiter', nm:{th:'คัลลิสโต', en:'Callisto'}, color:0x7d7268,
  radius:2410.3, mass:1.08e23, gravity:1.24, a:1882700, period:16.689017, e:0.0074, inc:0.192, node:0,
  desc:{th:'พื้นผิวเก่าแก่ที่สุดเท่าที่รู้จัก เต็มไปด้วยหลุมอุกกาบาตทับซ้อนกันจนแทบไม่เหลือที่ว่าง เพราะไม่มีการเปลี่ยนแปลงทางธรณีมานานหลายพันล้านปี',
        en:'The most heavily cratered surface known — so old and geologically still that impacts have had billions of years to fill every space.'} },
{ id:'enceladus', parent:'saturn', nm:{th:'เอนเซลาดัส', en:'Enceladus'}, color:0xf0f2f4,
  radius:252.1, mass:1.08e20, gravity:0.113, a:238040, period:1.370218, e:0.0047, inc:0.019, node:0,
  desc:{th:'ดวงจันทร์น้ำแข็งเล็ก ๆ ที่พ่นไอน้ำจากรอยแยกขั้วใต้ขึ้นสู่อวกาศตลอดเวลา ไอน้ำเหล่านั้นเติมวงแหวน E ของดาวเสาร์',
        en:'A small icy moon venting water vapour from cracks at its south pole — the spray that keeps Saturn’s E ring supplied.'} },
{ id:'rhea', parent:'saturn', nm:{th:'รีอา', en:'Rhea'}, color:0xcfcac2,
  radius:763.8, mass:2.31e21, gravity:0.264, a:527070, period:4.518212, e:0.001, inc:0.345, node:0,
  desc:{th:'ดวงจันทร์น้ำแข็งขนาดกลางของดาวเสาร์ พื้นผิวสว่างเต็มไปด้วยหลุมอุกกาบาตและรอยแยกสีจาง',
        en:'A mid-sized icy Saturnian moon, bright and cratered with pale fracture streaks.'} },
{ id:'titan', parent:'saturn', nm:{th:'ไททัน', en:'Titan'}, color:0xd9a24a,
  radius:2574.7, mass:1.345e23, gravity:1.35, a:1221870, period:15.945, e:0.0288, inc:0.348, node:0,
  desc:{th:'ดวงจันทร์ดวงเดียวที่มีบรรยากาศหนาแน่นจริงจัง หมอกส้มบดบังพื้นผิวที่มีทะเลสาบมีเทนเหลว แม่น้ำ และฝน — วัฏจักรของเหลวแบบเดียวกับโลกแต่คนละสาร',
        en:'The only moon with a substantial atmosphere. Orange haze hides lakes of liquid methane, rivers and rain — a liquid cycle like Earth’s, run on a different chemical.'} },
{ id:'titania', parent:'uranus', nm:{th:'ไททาเนีย', en:'Titania'}, color:0xa89e96,
  radius:788.4, mass:3.4e21, gravity:0.367, a:435910, period:8.706234, e:0.0011, inc:0.34, node:0,
  desc:{th:'ดวงจันทร์ที่ใหญ่ที่สุดของยูเรนัส มีหุบเหวยาวหลายร้อยกิโลเมตรจากการที่เปลือกน้ำแข็งขยายตัวแล้วแตก',
        en:'Uranus’s largest moon, scarred by canyons hundreds of kilometres long where its icy crust expanded and split.'} },
{ id:'oberon', parent:'uranus', nm:{th:'โอเบอรอน', en:'Oberon'}, color:0x968c86,
  radius:761.4, mass:3.08e21, gravity:0.346, a:583520, period:13.463234, e:0.0014, inc:0.058, node:0,
  desc:{th:'ดวงจันทร์วงนอกสุดในกลุ่มใหญ่ของยูเรนัส พื้นผิวมืดและเต็มไปด้วยหลุมอุกกาบาตที่มีก้นสีคล้ำ',
        en:'The outermost of Uranus’s major moons, dark and cratered with curiously black crater floors.'} },
{ id:'triton', parent:'neptune', nm:{th:'ไทรทัน', en:'Triton'}, color:0xd7cfc6,
  radius:1353.4, mass:2.14e22, gravity:0.779, a:354759, period:-5.876854, e:0.000016, inc:156.885, node:0,
  desc:{th:'โคจรสวนทางกับการหมุนของเนปจูน สัญญาณว่ามันคือวัตถุแถบไคเปอร์ที่ถูกจับไว้ พื้นผิวไนโตรเจนแข็งเย็นจัดและยังมีน้ำพุเย็นพ่นอยู่',
        en:'It orbits backwards against Neptune’s spin — the signature of a captured Kuiper Belt object. Its frozen nitrogen surface still vents cold geysers.'} },
{ id:'charon', parent:'pluto', nm:{th:'แครอน', en:'Charon'}, color:0x9a9088,
  radius:606, mass:1.586e21, gravity:0.288, a:19591, period:6.3872, e:0.0002, inc:0.08, node:0,
  desc:{th:'ใหญ่กว่าครึ่งหนึ่งของพลูโต ทั้งคู่จึงหมุนรอบจุดศูนย์กลางมวลร่วมที่อยู่นอกตัวพลูโต นับเป็นระบบดาวคู่มากกว่าดาวกับบริวาร',
        en:'Over half Pluto’s width, so the two swing around a shared centre of mass that sits outside Pluto itself — a binary more than a moon.'} }
];

/* ── อัตราเร็วของเวลา: วินาทีจำลองต่อวินาทีจริง ────────────────────── */
const RATES = [
  { s:1,          th:['เวลาจริง','1 ×'],        en:['real time','1 ×'] },
  { s:10,         th:['10 วินาที','ต่อวินาที'],  en:['10 seconds','per second'] },
  { s:60,         th:['1 นาที','ต่อวินาที'],     en:['1 minute','per second'] },
  { s:600,        th:['10 นาที','ต่อวินาที'],    en:['10 minutes','per second'] },
  { s:3600,       th:['1 ชั่วโมง','ต่อวินาที'],  en:['1 hour','per second'] },
  { s:86400,      th:['1 วัน','ต่อวินาที'],      en:['1 day','per second'] },
  { s:604800,     th:['1 สัปดาห์','ต่อวินาที'],  en:['1 week','per second'] },
  { s:2629800,    th:['1 เดือน','ต่อวินาที'],    en:['1 month','per second'] },
  { s:31557600,   th:['1 ปี','ต่อวินาที'],       en:['1 year','per second'] },
  { s:315576000,  th:['10 ปี','ต่อวินาที'],      en:['10 years','per second'] }
];

const MONTHS = {
  th:['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],
  en:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
};

/* ── ข้อความส่วนติดต่อผู้ใช้ ───────────────────────────────────────── */
const UI = {
  th:{
    tabs:['ข้อมูล','เครื่องมือ','มุมมอง'],
    find:'ค้นหา', findPh:'ค้นหาดาวเคราะห์ ดวงจันทร์…', close:'ปิด', about:'เกี่ยวกับแผนที่นี้',
    kind:{ star:'ดาวฤกษ์', planet:'ดาวเคราะห์', dwarf:'ดาวเคราะห์แคระ', moon:'ดวงจันทร์' },
    secDesc:'คำอธิบาย', secLive:'ค่าตามเวลาที่แสดง', secPhys:'ข้อมูลกายภาพ', secMoons:'บริวารในแผนที่นี้',
    dSun:'ระยะจากดวงอาทิตย์', dEarth:'ระยะจากโลก', light:'แสงเดินทางถึงโลก', speed:'ความเร็วในวงโคจร',
    phase:'ส่วนสว่างที่เห็นจากโลก', dParent:'ระยะจากดาวแม่',
    radius:'รัศมี', mass:'มวล', grav:'แรงโน้มถ่วงที่ผิว', rot:'คาบหมุนรอบตัวเอง', tilt:'ความเอียงแกน',
    period:'คาบโคจร', nmoons:'จำนวนดวงจันทร์', temp:'อุณหภูมิเฉลี่ย', semi:'ระยะเฉลี่ยจากดวงอาทิตย์',
    origin:'ที่มาของชื่อ', retro:'ถอยหลัง',
    tCompare:'เปรียบเทียบขนาด', tMeasure:'วัดระยะระหว่างวัตถุ', tScale:'สเกลของดาว',
    cmpWith:'เทียบกับ', pickA:'วัตถุที่ 1', pickB:'วัตถุที่ 2', sep:'ระยะห่างจริงขณะนี้',
    lightTime:'แสงใช้เวลา', timesEarth:'เท่าของโลก',
    vCam:'มุมกล้อง', camNear:'เข้าใกล้', camSys:'ทั้งระบบ', camTop:'จากขั้วเหนือ', camEdge:'ระนาบสุริยวิถี',
    vScale:'มาตราส่วนมุมมอง', viewDist:'ระยะมอง', ly:'ปีแสง',
    ladder:['ผิวดาว','ดาวเคราะห์','ระบบสุริยะ','แถบไคเปอร์','เมฆออร์ต','ดาวใกล้เคียง','กาแล็กซี'],
    ladderNote:'ระบบสุริยะทั้งระบบกว้างไม่ถึงหนึ่งในพันของระยะที่กาแล็กซีกินพื้นที่ — ไล่ปุ่มลงมาทีละขั้นเพื่อดูว่าเล็กแค่ไหน',
    vShow:'สิ่งที่แสดงในฉาก', vOrbits:'เส้นวงโคจร', vLabels:'ชื่อวัตถุ', vMoons:'ดวงจันทร์',
    vBelt:'แถบดาวเคราะห์น้อย', vKuiper:'แถบไคเปอร์', vOort:'เมฆออร์ต',
    vStars:'ดาวฤกษ์พื้นหลัง', vGalaxy:'ทางช้างเผือก', vGrid:'ระนาบสุริยวิถี',
    vSize:'ขนาดของดาว', sizeReal:'ตามจริง', sizeBig:'ขยายให้เห็น',
    sizeNote:'ตามจริง: ดาวเคราะห์จะเล็กจนเกือบมองไม่เห็นเมื่อดูทั้งระบบ — เพราะระยะห่างจริงมันมากขนาดนั้น',
    now:'ตอนนี้', frame:'จัดกล้อง', live:'สด', paused:'หยุด',
    au:'AU', km:'กม.', kms:'กม./วิ', hr:'ชม.', day:'วัน', yr:'ปี', deg:'°', min:'นาที', sec:'วินาที',
    hint:'ลากเพื่อหมุน · เลื่อนล้อเพื่อซูม · คลิกชื่อวัตถุเพื่อเจาะจง',
    gPlanets:'ดาวเคราะห์', gOther:'ดาวฤกษ์และดาวเคราะห์แคระ', gMoons:'ดวงจันทร์', noHit:'ไม่พบวัตถุที่ค้นหา'
  },
  en:{
    tabs:['Info','Toolbox','View'],
    find:'Search', findPh:'Search planets, moons…', close:'Close', about:'About this atlas',
    kind:{ star:'Star', planet:'Planet', dwarf:'Dwarf planet', moon:'Moon' },
    secDesc:'Description', secLive:'Live values', secPhys:'Physical data', secMoons:'Moons in this atlas',
    dSun:'Distance from Sun', dEarth:'Distance from Earth', light:'Light travel to Earth', speed:'Orbital speed',
    phase:'Illuminated from Earth', dParent:'Distance from parent',
    radius:'Radius', mass:'Mass', grav:'Surface gravity', rot:'Rotation period', tilt:'Axial tilt',
    period:'Orbital period', nmoons:'Known moons', temp:'Mean temperature', semi:'Mean distance from Sun',
    origin:'Name origin', retro:'retrograde',
    tCompare:'Size comparison', tMeasure:'Measure between bodies', tScale:'Body scale',
    cmpWith:'compared with', pickA:'Body 1', pickB:'Body 2', sep:'Current true separation',
    lightTime:'Light takes', timesEarth:'× Earth',
    vCam:'Camera angle', camNear:'Close up', camSys:'Whole system', camTop:'North pole', camEdge:'Edge on',
    vScale:'View scale', viewDist:'View', ly:'ly',
    ladder:['Surface','Planet','Solar system','Kuiper belt','Oort cloud','Neighbourhood','Galaxy'],
    ladderNote:'The whole solar system spans less than a thousandth of the galaxy — step down the list to feel how small it is.',
    vShow:'Scene layers', vOrbits:'Orbit paths', vLabels:'Labels', vMoons:'Moons',
    vBelt:'Asteroid belt', vKuiper:'Kuiper belt', vOort:'Oort cloud',
    vStars:'Background stars', vGalaxy:'Milky Way', vGrid:'Ecliptic plane',
    vSize:'Body size', sizeReal:'True scale', sizeBig:'Enlarged',
    sizeNote:'At true scale the planets are nearly invisible from a system-wide view — that is how far apart they really are.',
    now:'Now', frame:'Reframe', live:'Live', paused:'Paused',
    au:'AU', km:'km', kms:'km/s', hr:'h', day:'d', yr:'yr', deg:'°', min:'min', sec:'s',
    hint:'Drag to orbit · scroll to zoom · click a label to target',
    gPlanets:'Planets', gOther:'Star & dwarf planet', gMoons:'Moons', noHit:'Nothing matched'
  }
};

const ABOUT = {
  th:`<h4>แผนที่นี้คืออะไร</h4>
  <p>แบบจำลองระบบสุริยะ 3 มิติที่คำนวณตำแหน่งของดวงอาทิตย์ ดาวเคราะห์ทั้งแปด ดาวพลูโต และดวงจันทร์ 14 ดวง
  จากองค์ประกอบวงโคจรเคปเลอร์ ตามวันเวลาที่คุณเลือก ทุกอย่างคำนวณสดในเบราว์เซอร์ ไม่มีการเรียกข้อมูลจากเซิร์ฟเวอร์ใด</p>
  <p>ซูมได้ต่อเนื่องตั้งแต่ระยะประชิดผิวดาว ออกไปจนถึงแถบไคเปอร์ เมฆออร์ต และทางช้างเผือกทั้งใบ
  เมื่อกล้องออกไปไกลกว่าราวห้าปีแสง ท้องฟ้าที่เห็นจากบ้านเราจะค่อย ๆ จางลง แล้วกาแล็กซีจะปรากฏขึ้นแทน
  โดยดวงอาทิตย์อยู่ห่างจากใจกลาง 26,000 ปีแสง ตามตำแหน่งจริง</p>

  <h4>เรื่องลิขสิทธิ์ — ทำไมชุดนี้ปลอดภัย</h4>
  <ul>
    <li><b>ไม่มีไฟล์ภาพจากภายนอกเลย</b> พื้นผิวดาวทุกดวง วงแหวน ดวงอาทิตย์ และดาวฤกษ์พื้นหลัง
        ถูกวาดขึ้นด้วยโค้ด (procedural noise) ตอนเปิดหน้าเว็บ จึงไม่มีภาพถ่ายของใครมาเกี่ยวข้อง</li>
    <li><b>ทางช้างเผือกก็ปั่นขึ้นเอง</b> แขนกังหันเกิดจากสูตรเกลียวลอการิทึม ไม่ใช่ภาพถ่ายหรือภาพวาด
        ของกาแล็กซี ซึ่งเป็นจุดที่แอปดาราศาสตร์ส่วนใหญ่ต้องไปหยิบไฟล์ภาพของคนอื่นมาใช้</li>
    <li><b>ไม่มีโค้ดที่คัดลอกมา</b> เขียนขึ้นใหม่ทั้งหมด ใช้เพียงไลบรารี <code>three.js</code>
        ซึ่งเป็นโอเพนซอร์สสัญญาอนุญาต MIT และฟอนต์ IBM Plex สัญญาอนุญาต SIL Open Font License</li>
    <li><b>ตัวเลขคือข้อเท็จจริง</b> องค์ประกอบวงโคจรและข้อมูลกายภาพเป็นค่าที่วัดได้ทางวิทยาศาสตร์
        ซึ่งไม่เข้าข่ายงานอันมีลิขสิทธิ์ คำบรรยายทั้งหมดเรียบเรียงขึ้นใหม่</li>
    <li><b>ไม่ใช้เครื่องหมายขององค์กรใด</b> ไม่มีโลโก้ ชื่อ หรือรูปแบบตราสัญลักษณ์ของหน่วยงานอวกาศใด ๆ
        ซึ่งมักได้รับความคุ้มครองแยกจากลิขสิทธิ์ในฐานะเครื่องหมายการค้า</li>
  </ul>

  <h4>ความแม่นยำ</h4>
  <p>ใช้องค์ประกอบวงโคจรโดยประมาณยุค J2000 ให้ความคลาดเคลื่อนระดับลิปดาในช่วงปี ค.ศ. 1800–2050
  เหมาะกับการเรียนรู้และการนำเสนอ แต่ไม่เหมาะกับงานนำทางยานอวกาศ ตำแหน่งดวงจันทร์เป็นวงโคจรวงรีอย่างง่าย
  รอบระนาบศูนย์สูตรของดาวแม่ ส่วนขนาดของดาวแสดงตามจริงเสมอ ยกเว้นเมื่อเปิดโหมด “ขยายให้เห็น”</p>

  <h4>การควบคุม</h4>
  <ul>
    <li>ลากเมาส์ = หมุนกล้อง · ล้อเลื่อน = ซูม · คลิกชื่อวัตถุ = เปลี่ยนเป้าหมาย</li>
    <li><code>เว้นวรรค</code> เล่น/หยุด · <code>←</code> <code>→</code> ปรับอัตราเร็วเวลา ·
        <code>F</code> ค้นหา · <code>N</code> กลับมาเวลาปัจจุบัน</li>
  </ul>`,
  en:`<h4>What this is</h4>
  <p>A 3-D model of the solar system that computes the positions of the Sun, all eight planets, Pluto and
  fourteen moons from Keplerian orbital elements for any date you pick. Everything is calculated live in the
  browser; no data is fetched from any server.</p>
  <p>Zoom runs continuously from a planet’s surface out past the Kuiper belt and Oort cloud to the whole
  Milky Way. Beyond about five light years the sky as seen from home fades out and the galaxy takes over,
  with the Sun sitting 26,000 light years from the centre, where it really is.</p>

  <h4>On copyright — why this set is safe to ship</h4>
  <ul>
    <li><b>No external image files at all.</b> Every planet surface, the rings, the Sun and the background
        stars are drawn in code with procedural noise when the page loads. No one’s photograph is involved.</li>
    <li><b>The Milky Way is generated too.</b> Its arms come from a logarithmic spiral formula, not from a
        photograph or painting of the galaxy — the exact asset most astronomy apps have to borrow.</li>
    <li><b>No copied code.</b> Written from scratch, using only <code>three.js</code> (MIT licence) and the
        IBM Plex typefaces (SIL Open Font License).</li>
    <li><b>Numbers are facts.</b> Orbital elements and physical data are measurements, not creative works.
        All descriptive text here was written fresh.</li>
    <li><b>No agency marks.</b> No space-agency logo, name or insignia appears — those are protected as
        trademarks quite separately from copyright.</li>
  </ul>

  <h4>Accuracy</h4>
  <p>Built on the standard J2000 approximate elements, good to arc-minutes between 1800 and 2050 — fine for
  teaching and presentation, not for flying a spacecraft. Moons use simplified ellipses in their parent’s
  equatorial plane. Body sizes are always true to scale unless “Enlarged” is switched on.</p>

  <h4>Controls</h4>
  <ul>
    <li>Drag to orbit · scroll to zoom · click a label to retarget</li>
    <li><code>Space</code> play/pause · <code>←</code> <code>→</code> time rate ·
        <code>F</code> search · <code>N</code> back to now</li>
  </ul>`
};
