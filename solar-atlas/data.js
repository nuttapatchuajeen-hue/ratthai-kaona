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

/* ── วัตถุขนาดเล็ก: ดาวเคราะห์น้อย · ดาวหาง · วัตถุพ้นดาวเนปจูน · วัตถุจากนอกระบบ
      องค์ประกอบวงโคจรและข้อมูลกายภาพมาจากฐานข้อมูลวัตถุขนาดเล็กของ JPL (SBDB)
      ซึ่งเป็นค่าที่วัดได้และเผยแพร่สาธารณะ — อบไว้ในไฟล์นี้ ไม่ได้เรียกตอนรัน
      el: a (AU) · e · i, om (Ω), w (ω) องศา · tp = เวลาผ่านจุดใกล้ที่สุด (JD)
          n = อัตราการเคลื่อนที่เฉลี่ย องศา/วัน  ‖  ตำแหน่ง = n × (JD − tp)
      a < 0 และ e > 1 คือวงโคจรไฮเพอร์โบลา (วัตถุจากนอกระบบ ผ่านมาแล้วไปเลย)
      rEst:true = รัศมีเป็นค่าประมาณ  ‖  ไม่มี mass/gravity = ยังวัดไม่ได้ ────── */
const SMALL = [
{
  id:'ceres', kind:'dwarf', layer:'dwarfs', color:0x9c948a, glow:'#9c948a',
  nm:{th:'ซีรีส', en:'Ceres'}, sb:'1 Ceres (A801 AA)', cls:'Main-belt Asteroid',
  el:{a:2.7655526, e:0.079692295, i:10.588028, om:80.248627, w:73.294215, tp:2461599.841467, n:0.2143044506}, epoch:2461200.5,
  radius:469.7, mass:9.3835e+20, gravity:0.284, rotH:9.07417, aAU:2.76555, q:2.54516, ad:2.9859, orbitDays:1679.85,
  origin:{th:'เซเรส เทพีแห่งพืชพันธุ์ของโรมัน — รากศัพท์เดียวกับคำ cereal',
          en:'Ceres, Roman goddess of grain — the root of the word “cereal”'},
  desc:{th:'วัตถุที่ใหญ่ที่สุดในแถบดาวเคราะห์น้อย และเป็นดาวเคราะห์แคระดวงเดียวที่โคจรใกล้กว่าดาวเนปจูน ใต้เปลือกหินปนน้ำแข็งน่าจะมีน้ำเกลือหลงเหลืออยู่ ยานสำรวจพบจุดขาวจ้าในหลุมออกเคเตอร์ซึ่งเป็นเกลือโซเดียมคาร์บอเนตที่ซึมขึ้นมาจากข้างใต้แล้วแห้งไป',
        en:'The largest object in the asteroid belt and the only dwarf planet orbiting closer than Neptune. Brine probably still lingers under its icy rock crust — the glaring white patches in Occator crater are sodium carbonate salts that seeped up and dried.'}
},
{
  id:'pallas', kind:'asteroid', layer:'asteroids', color:0x8e8880, glow:'#8e8880',
  nm:{th:'พัลลัส', en:'Pallas'}, sb:'2 Pallas (A802 FA)', cls:'Main-belt Asteroid',
  el:{a:2.76955901, e:0.2307001, i:34.932793, om:172.886619, w:310.969916, tp:2461695.031164, n:0.2138396029}, epoch:2461200.5,
  radius:256.5, mass:2.0422e+20, gravity:0.207, rotH:7.8132214, aAU:2.76956, q:2.13062, ad:3.4085, orbitDays:1683.5,
  origin:{th:'พัลลัส อาเธนา เทพีแห่งปัญญาของกรีก',
          en:'Pallas Athena, Greek goddess of wisdom'},
  desc:{th:'วัตถุใหญ่อันดับสามของแถบดาวเคราะห์น้อย วงโคจรเอียงจากระนาบสุริยวิถีถึง 35 องศา มากกว่าเพื่อนร่วมแถบอย่างชัดเจน จึงพุ่งขึ้น-ลงตัดผ่านแถบปีละหลายครั้ง และเข้าถึงยากกว่าที่ควรเมื่อคิดจากระยะทาง',
        en:'The third-largest body in the belt, on an orbit tilted a full 35° out of the ecliptic — far more than its neighbours. It punches up and down through the belt rather than lying in it, which makes it much harder to reach than its distance suggests.'}
},
{
  id:'vesta', kind:'asteroid', layer:'asteroids', color:0xa9a096, glow:'#a9a096',
  nm:{th:'เวสตา', en:'Vesta'}, sb:'4 Vesta (A807 FA)', cls:'Main-belt Asteroid',
  el:{a:2.36136597, e:0.090203744, i:7.143926, om:103.701293, w:151.468648, tp:2460901.58738, n:0.2716183614}, epoch:2461200.5,
  radius:261.385, mass:2.5903e+20, gravity:0.253, rotH:5.3421276322, aAU:2.36137, q:2.14836, ad:2.5744, orbitDays:1325.39,
  origin:{th:'เวสตา เทพีแห่งเตาไฟและครัวเรือนของโรมัน',
          en:'Vesta, Roman goddess of the hearth'},
  desc:{th:'ดาวเคราะห์น้อยที่สว่างที่สุด บางช่วงมองเห็นได้ด้วยตาเปล่า ภายในแยกชั้นเป็นแกนเหล็กกับเปลือกหินบะซอลต์เหมือนดาวเคราะห์ยุคแรกที่โตไม่ทัน ขั้วใต้มีแอ่งชนขนาดยักษ์ที่กระเด็นเป็นอุกกาบาตมาตกถึงโลก',
        en:'The brightest asteroid, occasionally visible to the naked eye. It separated into an iron core and a basalt crust like a planet that never finished growing, and the giant impact basin at its south pole flung out debris that still falls on Earth as meteorites.'}
},
{
  id:'hygiea', kind:'asteroid', layer:'asteroids', color:0x6f6a66, glow:'#6f6a66',
  nm:{th:'ไฮเจีย', en:'Hygiea'}, sb:'10 Hygiea (A849 GA)', cls:'Main-belt Asteroid',
  el:{a:3.15097403, e:0.106709274, i:3.82953, om:283.119893, w:312.424239, tp:2461813.200829, n:0.1762125506}, epoch:2461200.5,
  radius:203.56, mass:1.0488e+20, gravity:0.169, rotH:13.828, aAU:3.15097, q:2.81474, ad:3.4872, orbitDays:2042.99,
  origin:{th:'ไฮเจีย เทพีแห่งสุขภาพของกรีก — รากศัพท์ของคำ hygiene',
          en:'Hygieia, Greek goddess of health — the root of “hygiene”'},
  desc:{th:'วัตถุใหญ่อันดับสี่ของแถบ ผิวคล้ำและสะท้อนแสงน้อยเพราะมีคาร์บอนสูง ภาพถ่ายความละเอียดสูงพบว่ามันกลมกว่าที่คิด จนมีข้อเสนอว่าอาจนับเป็นดาวเคราะห์แคระได้',
        en:'The fourth-largest belt object, dark and dull because it is rich in carbon. Sharp images showed it is rounder than expected, which is why some argue it should count as a dwarf planet.'}
},
{
  id:'psyche', kind:'asteroid', layer:'asteroids', color:0xa89880, glow:'#a89880',
  nm:{th:'ไซคี', en:'Psyche'}, sb:'16 Psyche (A852 FA)', cls:'Main-belt Asteroid',
  el:{a:2.92572047, e:0.134932474, i:3.098749, om:149.975386, w:230.032678, tp:2460795.475337, n:0.1969494758}, epoch:2461200.5,
  radius:111, mass:2.3988e+19, gravity:0.13, rotH:4.196, aAU:2.92572, q:2.53095, ad:3.3205, orbitDays:1827.88,
  origin:{th:'ไซคี หญิงสาวในตำนานกรีกที่กลายเป็นเทพีแห่งดวงวิญญาณ',
          en:'Psyche, the mortal of Greek myth who became goddess of the soul'},
  desc:{th:'ดาวเคราะห์น้อยที่มีโลหะมากผิดปกติ เคยถูกเสนอว่าเป็นแกนเหล็กเปลือย ๆ ของดาวเคราะห์ที่ถูกชนจนเปลือกหลุดหมด ค่าความหนาแน่นที่วัดได้ภายหลังบอกว่ามันโปร่งกว่านั้น เป็นเป้าหมายของยานสำรวจที่กำลังเดินทางไปถึงในทศวรรษนี้',
        en:'An unusually metal-rich asteroid, once proposed to be the stripped iron core of a shattered protoplanet. Later density estimates suggest something more porous than solid metal; a spacecraft is on its way to settle it.'}
},
{
  id:'ida', kind:'asteroid', layer:'asteroids', color:0x9a8c7c, glow:'#9a8c7c',
  nm:{th:'ไอดา', en:'Ida'}, sb:'243 Ida (A884 SB)', cls:'Main-belt Asteroid',
  el:{a:2.86334803, e:0.046109628, i:1.130363, om:323.536661, w:113.257183, tp:2460956.434616, n:0.2034196329}, epoch:2461200.5,
  radius:16, mass:4.1203e+16, gravity:0.0107, rotH:4.634, aAU:2.86335, q:2.73132, ad:2.9954, orbitDays:1769.74,
  origin:{th:'ไอดา นางไม้ผู้เลี้ยงดูซุสในตำนานกรีก',
          en:'Ida, the nymph who raised Zeus in Greek myth'},
  desc:{th:'ดาวเคราะห์น้อยดวงแรกที่พบว่ามีดวงจันทร์ของตัวเอง ยานที่บินผ่านเมื่อปี 2536 ถ่ายภาพก้อนเล็กชื่อแดกทิลโคจรอยู่ข้าง ๆ ซึ่งยืนยันว่าวัตถุขนาดเท่านี้ก็จับบริวารไว้ได้',
        en:'The first asteroid found to have a moon of its own: a 1993 flyby caught the little companion Dactyl orbiting alongside it, proving bodies this small can hold satellites.'}
},
{
  id:'mathilde', kind:'asteroid', layer:'asteroids', color:0x584f48, glow:'#584f48',
  nm:{th:'มาทิลด์', en:'Mathilde'}, sb:'253 Mathilde (A885 VA)', cls:'Main-belt Asteroid',
  el:{a:2.64690122, e:0.264347859, i:6.740468, om:179.494208, w:157.564023, tp:2461578.288316, n:0.2288745332}, epoch:2461200.5,
  radius:26.4, mass:1.0323e+17, gravity:0.00989, rotH:417.7, aAU:2.6469, q:1.9472, ad:3.3466, orbitDays:1572.91,
  origin:{th:'ตั้งตามชื่อภรรยาของนักดาราศาสตร์ชาวฝรั่งเศส โมริทซ์ เลิบ',
          en:'Named after the wife of astronomer Moritz Loewy'},
  desc:{th:'ก้อนคาร์บอนสีดำที่หมุนรอบตัวเองช้ามาก รอบหนึ่งกินเวลากว่า 17 วัน ความหนาแน่นต่ำกว่าน้ำเสียอีก แปลว่าข้างในเป็นเศษหินกองหลวม ๆ ที่มีช่องว่างเกือบครึ่งหนึ่งของปริมาตร',
        en:'A pitch-dark carbon-rich lump that takes over 17 days to turn once. Its density is lower than water, meaning nearly half its volume is empty space between loose rubble.'}
},
{
  id:'eros', kind:'asteroid', layer:'asteroids', color:0xb09070, glow:'#b09070',
  nm:{th:'อีรอส', en:'Eros'}, sb:'433 Eros (A898 PA)', cls:'Amor',
  el:{a:1.45824372, e:0.222877963, i:10.828544, om:304.267971, w:178.918132, tp:2461088.813494, n:0.5597046347}, epoch:2461200.5,
  radius:8.42, mass:6.6868e+15, gravity:0.0063, rotH:5.27, aAU:1.45824, q:1.13323, ad:1.7833, orbitDays:643.2,
  origin:{th:'อีรอส เทพแห่งความรักของกรีก',
          en:'Eros, Greek god of love'},
  desc:{th:'ดาวเคราะห์น้อยใกล้โลกรูปทรงเหมือนถั่วลิสง และเป็นดวงแรกที่มียานลงไปแตะผิว ยานที่ออกแบบมาเพื่อโคจรรอบเท่านั้นถูกสั่งให้ร่อนลงจอดเมื่อปี 2544 แล้วยังส่งสัญญาณต่อได้อีกสองสัปดาห์',
        en:'A peanut-shaped near-Earth asteroid and the first ever touched by a spacecraft: a probe built only to orbit was talked down onto the surface in 2001 and kept transmitting for another two weeks.'}
},
{
  id:'toutatis', kind:'asteroid', layer:'asteroids', color:0x8a7c6c, glow:'#8a7c6c',
  nm:{th:'ตูตาติส', en:'Toutatis'}, sb:'4179 Toutatis (1989 AC)', cls:'Apollo',
  el:{a:2.54304716, e:0.624630225, i:0.448084, om:125.36548, w:277.861538, tp:2460684.051308, n:0.2430370325}, epoch:2461200.5,
  radius:2.7, rotH:176, aAU:2.54305, q:0.95458, ad:4.1315, orbitDays:1481.26,
  origin:{th:'เตอูตาติส เทพนักรบของชาวเคลต์',
          en:'Teutatis, a Celtic war god'},
  desc:{th:'ก้อนหินสองก้อนติดกันที่ไม่ได้หมุนรอบแกนเดียวแบบวัตถุทั่วไป แต่ตีลังกาไปเรื่อย ๆ จนไม่มี “วัน” ที่แน่นอน วงโคจรของมันเกือบแนบระนาบสุริยวิถีและถูกดาวพฤหัสบดีกวนตลอด ทำให้เส้นทางในอนาคตคาดเดายากผิดปกติ',
        en:'Two rocks stuck together, tumbling rather than spinning about one axis, so it has no fixed “day”. Its orbit hugs the ecliptic and is constantly nudged by Jupiter, making its long-term path unusually hard to predict.'}
},
{
  id:'itokawa', kind:'asteroid', layer:'asteroids', color:0xa1937f, glow:'#a1937f',
  nm:{th:'อิโตกาวะ', en:'Itokawa'}, sb:'25143 Itokawa (1998 SF36)', cls:'Apollo',
  el:{a:1.32405228, e:0.280177641, i:1.620941, om:69.074497, w:162.840902, tp:2460936.702994, n:0.6469137343}, epoch:2461200.5,
  radius:0.165, mass:3.1464e+10, gravity:0.0000771, rotH:12.132, aAU:1.32405, q:0.95308, ad:1.695, orbitDays:556.49,
  origin:{th:'ฮิเดโอะ อิโตกาวะ ผู้บุกเบิกจรวดของญี่ปุ่น',
          en:'Hideo Itokawa, pioneer of Japanese rocketry'},
  desc:{th:'กองกรวดในอวกาศที่ไม่มีเนื้อหินเป็นก้อนเดียว ยานฮายาบูซะเก็บตัวอย่างกลับมาได้ราวหนึ่งพันเม็ดฝุ่นเมื่อปี 2553 ซึ่งเป็นครั้งแรกที่มนุษย์ได้ฝุ่นจากผิวดาวเคราะห์น้อยมาส่องในห้องปฏิบัติการ',
        en:'A pile of gravel in space with no solid bedrock at all. In 2010 the Hayabusa mission brought home about a thousand grains from it — the first asteroid surface dust ever examined in a laboratory.'}
},
{
  id:'ryugu', kind:'asteroid', layer:'asteroids', color:0x4e4b48, glow:'#4e4b48',
  nm:{th:'ริวงู', en:'Ryugu'}, sb:'162173 Ryugu (1999 JU3)', cls:'Apollo',
  el:{a:1.19091893, e:0.191073005, i:5.866442, om:251.289712, w:211.608994, tp:2461118.296422, n:0.7583693539}, epoch:2461200.5,
  radius:0.448, mass:4.4949e+11, gravity:0.000149, rotH:7.63262, aAU:1.19092, q:0.96337, ad:1.4185, orbitDays:474.7,
  origin:{th:'ริวงูโจ วังมังกรใต้ทะเลในนิทานญี่ปุ่น ที่ชาวประมงได้กล่องเป็นของกำนัลกลับมา',
          en:'Ryūgū-jō, the undersea dragon palace of Japanese folklore, from which a fisherman returned with a box'},
  desc:{th:'ก้อนหินคาร์บอนสีดำรูปลูกข่างที่ยานฮายาบูซะ 2 ยิงกระสุนใส่เพื่อเก็บเศษใต้ผิวกลับมา ในตัวอย่างพบน้ำและกรดอะมิโนหลายชนิด รวมถึงยูราซิลซึ่งเป็นหนึ่งในองค์ประกอบของอาร์เอ็นเอ',
        en:'A spinning-top-shaped black carbon rock that Hayabusa2 shot with a projectile to grab subsurface debris. The samples hold water and a range of amino acids, plus uracil — one of the building blocks of RNA.'}
},
{
  id:'bennu', kind:'asteroid', layer:'asteroids', color:0x46433f, glow:'#46433f',
  nm:{th:'เบนนู', en:'Bennu'}, sb:'101955 Bennu (1999 RQ36)', cls:'Apollo',
  el:{a:1.12639103, e:0.203745076, i:6.034944, om:2.060866, w:66.223061, tp:2455439.141941, n:0.8244613503}, epoch:2455562.5,
  radius:0.24222, mass:7.3272e+10, gravity:0.0000834, rotH:4.296061, aAU:1.12639, q:0.89689, ad:1.3559, orbitDays:436.65,
  origin:{th:'เบนนู นกศักดิ์สิทธิ์ในความเชื่ออียิปต์โบราณ สัญลักษณ์ของการเกิดใหม่',
          en:'Bennu, the sacred bird of ancient Egypt, a symbol of rebirth'},
  desc:{th:'ดาวเคราะห์น้อยที่ยานโอไซริส-เร็กซ์เก็บตัวอย่างกลับมาถึงโลกในปี 2566 ตอนแตะผิวยานจมลงไปเหมือนแตะบ่อลูกบอลพลาสติก เพราะผิวหลวมกว่าที่ทุกคนคาด และมันยังเป็นวัตถุที่ถูกจับตาเรื่องโอกาสพุ่งเข้าหาโลกในศตวรรษหน้า',
        en:'The asteroid OSIRIS-REx sampled and returned to Earth in 2023. The spacecraft sank into the surface like a ball pit — the ground was far looser than anyone expected — and Bennu is also watched closely for a small chance of hitting Earth next century.'}
},
{
  id:'apophis', kind:'asteroid', layer:'asteroids', color:0x9c7f66, glow:'#9c7f66',
  nm:{th:'อะโพฟิส', en:'Apophis'}, sb:'99942 Apophis (2004 MN4)', cls:'Aten',
  el:{a:0.92235922, e:0.191149228, i:3.340997, om:203.893651, w:126.679571, tp:2461042.919201, n:1.1126381153}, epoch:2461200.5,
  radius:0.17, rotH:30.56, aAU:0.92236, q:0.74605, ad:1.0987, orbitDays:323.56,
  origin:{th:'อาโปฟิส งูยักษ์แห่งความมืดที่ต่อสู้กับเทพสุริยะในความเชื่ออียิปต์',
          en:'Apophis, the Egyptian serpent of darkness that fought the sun god'},
  desc:{th:'ดาวเคราะห์น้อยที่ตอนค้นพบเมื่อปี 2547 ถูกคำนวณว่าอาจชนโลกในปี 2572 จนขึ้นข่าวทั่วโลก การวัดเพิ่มภายหลังตัดโอกาสนั้นออกไปแล้วอย่างน้อยหนึ่งศตวรรษ แต่วันที่ 13 เมษายน 2572 มันจะเฉียดโลกใกล้กว่าดาวเทียมค้างฟ้า และคนในยุโรปกับแอฟริกาจะมองเห็นได้ด้วยตาเปล่า',
        en:'When it was found in 2004, calculations gave it a chance of striking Earth in 2029 and it made headlines worldwide. Later measurements ruled that out for at least a century — but on 13 April 2029 it will pass closer than the geostationary satellites, bright enough to see with the naked eye from Europe and Africa.'}
},
{
  id:'didymos', kind:'asteroid', layer:'asteroids', color:0x8f8578, glow:'#8f8578',
  nm:{th:'ดิดีมอส', en:'Didymos'}, sb:'65803 Didymos (1996 GT)', cls:'Apollo',
  el:{a:1.64270961, e:0.383123324, i:3.413877, om:72.985824, w:319.5807, tp:2461412.27778, n:0.4681261239}, epoch:2461200.5,
  radius:0.39, rotH:2.2593, aAU:1.64271, q:1.01335, ad:2.2721, orbitDays:769.02,
  origin:{th:'ดิดิมอส แปลว่า “ฝาแฝด” ในภาษากรีก เพราะมันเป็นระบบสองก้อน',
          en:'Didymos means “twin” in Greek — it is a two-body system'},
  desc:{th:'ระบบดาวเคราะห์น้อยคู่ที่มนุษย์เคยลงมือเปลี่ยนวงโคจรจริง ยานดาร์ตพุ่งเข้าชนดวงเล็กชื่อไดมอร์ฟอสเมื่อปี 2565 ทำให้คาบโคจรรอบดวงใหญ่สั้นลง 32 นาที เป็นการทดสอบว่าถ้าวันหนึ่งต้องเบนวัตถุที่จะชนโลก วิธีนี้ใช้ได้จริงหรือไม่',
        en:'The double asteroid whose orbit humans have actually changed: in 2022 the DART spacecraft rammed the smaller body, Dimorphos, shortening its orbit around the primary by 32 minutes — a live test of whether we could deflect an incoming object.'}
},
{
  id:'eris', kind:'dwarf', layer:'dwarfs', color:0xd8d4cc, glow:'#d8d4cc',
  nm:{th:'อีริส', en:'Eris'}, sb:'136199 Eris (2003 UB313)', cls:'TransNeptunian Object',
  el:{a:67.93394688, e:0.438238535, i:43.925828, om:36.00477, w:150.794924, tp:2545407.716847, n:0.0017602478}, epoch:2461200.5,
  radius:1163, mass:1.6380e+22, gravity:0.808, rotH:25.9, aAU:67.93395, q:38.16267, ad:97.7052, orbitDays:204516.66,
  origin:{th:'เอริส เทพีแห่งความบาดหมางของกรีก — ตั้งชื่อประชดการถกเถียงที่มันจุดขึ้น',
          en:'Eris, Greek goddess of discord — a wry nod to the argument it started'},
  desc:{th:'วัตถุที่ทำให้พลูโตถูกปลดจากการเป็นดาวเคราะห์ เพราะมันมีมวลมากกว่าพลูโตแต่อยู่ไกลกว่า ถ้านับพลูโตเป็นดาวเคราะห์ก็ต้องนับอีริสด้วย สหพันธ์ดาราศาสตร์สากลจึงสร้างหมวด “ดาวเคราะห์แคระ” ขึ้นในปี 2549 ผิวของมันเป็นน้ำแข็งมีเทนที่สะท้อนแสงเกือบทั้งหมด',
        en:'The object that got Pluto demoted: it is more massive than Pluto but further out, so if Pluto counted as a planet then Eris had to as well. The IAU created the “dwarf planet” class in 2006 instead. Its surface is methane ice that reflects almost all the light falling on it.'}
},
{
  id:'makemake', kind:'dwarf', layer:'dwarfs', color:0xc8a894, glow:'#c8a894',
  nm:{th:'มาเกมาเก', en:'Makemake'}, sb:'136472 Makemake (2005 FY9)', cls:'TransNeptunian Object',
  el:{a:45.57093317, e:0.158888995, i:29.027856, om:79.294834, w:297.092273, tp:2408158.694099, n:0.0032038501}, epoch:2461200.5,
  radius:715, rotH:22.8266, aAU:45.57093, q:38.33021, ad:52.8117, orbitDays:112364.81,
  origin:{th:'มาเกมาเก เทพผู้สร้างมนุษย์ในความเชื่อของชาวราปานูอี เกาะอีสเตอร์',
          en:'Makemake, creator of humanity in the Rapa Nui religion of Easter Island'},
  desc:{th:'ดาวเคราะห์แคระในแถบไคเปอร์ที่สว่างเป็นอันดับสองรองจากพลูโต ผิวปกคลุมด้วยน้ำแข็งมีเทนเม็ดหยาบซึ่งใหญ่กว่าที่พบบนพลูโต และมีดวงจันทร์จาง ๆ หนึ่งดวงที่เพิ่งพบในปี 2559',
        en:'The second-brightest Kuiper belt dwarf after Pluto. Its surface is coated in coarse-grained methane ice — the grains are larger than Pluto’s — and it has one faint moon, spotted only in 2016.'}
},
{
  id:'haumea', kind:'dwarf', layer:'dwarfs', color:0xe0dcd4, glow:'#e0dcd4',
  nm:{th:'เฮาเมอา', en:'Haumea'}, sb:'136108 Haumea (2003 EL61)', cls:'TransNeptunian Object',
  el:{a:43.06029024, e:0.194443015, i:28.208474, om:121.786056, w:240.690547, tp:2500416.599615, n:0.0034880977}, epoch:2461200.5,
  radius:780, mass:4.0060e+21, gravity:0.439, rotH:3.9154, aAU:43.06029, q:34.68752, ad:51.4331, orbitDays:103208.12,
  origin:{th:'เฮาเมอา เทพีแห่งการให้กำเนิดของชาวฮาวาย',
          en:'Haumea, Hawaiian goddess of childbirth'},
  desc:{th:'ดาวเคราะห์แคระที่หมุนรอบตัวเองเร็วจนถูกเหวี่ยงเป็นทรงรูปไข่ยาว รอบหนึ่งใช้เวลาไม่ถึงสี่ชั่วโมง และเป็นวัตถุพ้นดาวเนปจูนดวงแรกที่พบว่ามีวงแหวน มีดวงจันทร์สองดวงชื่อฮีอิอากะและนามากา',
        en:'It spins so fast — under four hours per turn — that it has been flung into an elongated egg shape, and it was the first object beyond Neptune found to have a ring. Two moons, Hiʻiaka and Namaka, orbit it.'}
},
{
  id:'quaoar', kind:'tno', layer:'dwarfs', color:0xb89a8c, glow:'#b89a8c',
  nm:{th:'ควาโออาร์', en:'Quaoar'}, sb:'50000 Quaoar (2002 LM60)', cls:'TransNeptunian Object',
  el:{a:43.15617649, e:0.035200237, i:7.991576, om:188.919125, w:163.209051, tp:2480516.376493, n:0.0034764792}, epoch:2461200.5,
  radius:545, rotH:8.84, aAU:43.15618, q:41.63707, ad:44.6753, orbitDays:103553.04,
  origin:{th:'ควาโออาร์ เทพผู้สร้างในความเชื่อของชาวตองวา แถบลอสแอนเจลิส',
          en:'Quaoar, the creator deity of the Tongva people of the Los Angeles basin'},
  desc:{th:'วัตถุแถบไคเปอร์ที่มีวงแหวนอยู่ไกลจากตัวมันเกินกว่าที่ทฤษฎีเดิมบอกว่าวงแหวนจะอยู่ได้ ซึ่งบังคับให้นักดาราศาสตร์ทบทวนว่าวงแหวนก่อตัวและคงอยู่ได้อย่างไร มีดวงจันทร์หนึ่งดวงชื่อไวว็อต',
        en:'A Kuiper belt object with a ring sitting further out than theory says a ring should survive, forcing a rethink of how rings form and persist. It has one moon, Weywot.'}
},
{
  id:'orcus', kind:'tno', layer:'dwarfs', color:0xa8b0b8, glow:'#a8b0b8',
  nm:{th:'ออร์คัส', en:'Orcus'}, sb:'90482 Orcus (2004 DW)', cls:'TransNeptunian Object',
  el:{a:39.37686538, e:0.220524063, i:20.55681, om:268.405352, w:73.568486, tp:2504046.134962, n:0.0039888009}, epoch:2461200.5,
  radius:455, mass:6.3500e+20, gravity:0.205, rotH:13.188, aAU:39.37687, q:30.69332, ad:48.0604, orbitDays:90252.69,
  origin:{th:'ออร์คัส เทพผู้ลงโทษคนผิดคำสาบานในนรกของโรมัน',
          en:'Orcus, the Roman underworld god who punished broken oaths'},
  desc:{th:'วัตถุที่โคจรเป็นจังหวะเดียวกับพลูโตพอดี คือสองรอบต่อการโคจรของดาวเนปจูนสามรอบ แต่อยู่ตรงข้ามกันเสมอ จึงถูกเรียกเล่น ๆ ว่า “พลูโตตรงข้าม” มีดวงจันทร์ใหญ่เทียบตัวเองชื่อแวนธ์',
        en:'It keeps exactly the same rhythm as Pluto — two orbits for every three of Neptune’s — but always on the opposite side, earning it the nickname “anti-Pluto”. Its moon Vanth is large relative to it.'}
},
{
  id:'gonggong', kind:'tno', layer:'dwarfs', color:0xc08878, glow:'#c08878',
  nm:{th:'กงกง', en:'Gonggong'}, sb:'225088 Gonggong (2007 OR10)', cls:'TransNeptunian Object',
  el:{a:66.86666568, e:0.504251, i:30.899067, om:336.838316, w:206.623284, tp:2399252.724654, n:0.0018025593}, epoch:2461200.5,
  radius:615, mass:1.7500e+21, gravity:0.309, rotH:22.4, aAU:66.86667, q:33.14908, ad:100.5842, orbitDays:199716.03,
  origin:{th:'กงกง เทพน้ำผู้ก่อน้ำท่วมในตำนานจีน',
          en:'Gonggong, the Chinese water god who caused floods'},
  desc:{th:'หนึ่งในวัตถุที่ไกลที่สุดที่รู้ขนาดชัดเจน ผิวออกสีแดงเพราะมีน้ำแข็งมีเทนที่ถูกรังสีย่อยจนกลายเป็นสารประกอบคาร์บอนสีคล้ำ วงโคจรรีมากและตอนนี้อยู่ใกล้จุดไกลสุด',
        en:'One of the most distant objects whose size we know well. Its reddish tint comes from methane ice broken down by radiation into dark carbon compounds. Its orbit is highly elliptical and it is currently near its far point.'}
},
{
  id:'sedna', kind:'tno', layer:'dwarfs', color:0xc4705a, glow:'#c4705a',
  nm:{th:'เซดนา', en:'Sedna'}, sb:'90377 Sedna (2003 VB12)', cls:'TransNeptunian Object',
  el:{a:543.71952891, e:0.859882459, i:11.925276, om:144.506166, w:311.098773, tp:2479264.750687, n:0.0000777395}, epoch:2461200.5,
  radius:500, rEst:true, rotH:10.273, aAU:543.71953, q:76.18464, ad:1011.2544, orbitDays:4630851.18,
  origin:{th:'เซดนา เทพีแห่งทะเลของชาวอินูอิต ผู้อยู่ในมหาสมุทรอาร์กติกอันเยือกเย็น',
          en:'Sedna, the Inuit sea goddess who dwells in the frozen Arctic ocean'},
  desc:{th:'วัตถุที่วงโคจรรีจัดจนไกลออกไปเกือบพันหน่วยดาราศาสตร์ ใช้เวลาโคจรรอบดวงอาทิตย์กว่าหนึ่งหมื่นปี ระยะใกล้สุดของมันก็ยังไกลกว่าดาวเนปจูนเกือบสามเท่า ซึ่งอธิบายด้วยแรงโน้มถ่วงของดาวเคราะห์ที่รู้จักไม่ได้ และเป็นหนึ่งในหลักฐานที่ทำให้บางคนสงสัยว่ามีอะไรใหญ่ ๆ ซ่อนอยู่ไกลออกไป',
        en:'Its orbit is so stretched that it swings out towards a thousand astronomical units and takes over ten thousand years to go round once. Even its closest approach is nearly three times further than Neptune — something the known planets cannot explain, and one of the hints that keeps the search for a distant massive body alive.'}
},
{
  id:'arrokoth', kind:'tno', layer:'dwarfs', color:0xb07a68, glow:'#b07a68',
  nm:{th:'อาร์โรคอท', en:'Arrokoth'}, sb:'486958 Arrokoth (2014 MU69)', cls:'TransNeptunian Object',
  el:{a:44.05257836, e:0.035557176, i:2.450614, om:159.037727, w:188.850746, tp:2475741.403873, n:0.0033709094}, epoch:2461200.5,
  radius:9, rEst:true, rotH:15.918, aAU:44.05258, q:42.48619, ad:45.619, orbitDays:106796.11,
  origin:{th:'อาร์โรคอท แปลว่า “ท้องฟ้า” ในภาษาโพว์ฮาแทน ของชนพื้นเมืองอเมริกา',
          en:'Arrokoth means “sky” in the Powhatan language'},
  desc:{th:'วัตถุที่ไกลที่สุดที่ยานอวกาศเคยบินผ่าน เมื่อวันขึ้นปีใหม่ 2562 ภาพที่ได้เผยรูปร่างเหมือนตุ๊กตาหิมะสองก้อนเชื่อมกันแบบนุ่มนวล ไม่ใช่การชนแรง ๆ ซึ่งเป็นหลักฐานตรงที่สุดว่าก้อนแรกเริ่มของดาวเคราะห์ก่อตัวด้วยการค่อย ๆ มาบรรจบกัน',
        en:'The most distant object a spacecraft has ever visited, on New Year’s Day 2019. The images showed two lobes joined gently rather than smashed together — the most direct evidence yet that the first planetary building blocks formed by drifting quietly into contact.'}
},
{
  id:'halley', kind:'comet', layer:'comets', color:0x9fdcd4, glow:'#9fdcd4',
  nm:{th:'ฮัลเลย์ (1P)', en:'Halley (1P)'}, sb:'1P/Halley', cls:'Halley-type Comet*',
  el:{a:17.92863505, e:0.967935996, i:162.19053, om:59.098947, w:112.241431, tp:2446469.973616, n:0.0129832444}, epoch:2439875.5,
  radius:5.5, aAU:17.92864, q:0.57486, ad:35.2824, orbitDays:27728.05, active:true,
  origin:{th:'เอ็ดมันด์ ฮัลเลย์ ผู้คำนวณว่าดาวหางปี 1682 คือดวงเดียวกับที่เคยเห็นในปี 1607 และ 1531',
          en:'Edmond Halley, who worked out that the comets of 1682, 1607 and 1531 were one object'},
  desc:{th:'ดาวหางที่ทำให้มนุษย์เข้าใจว่าดาวหางไม่ใช่ลางร้ายที่มาแล้วหายไป แต่โคจรกลับมาตามกำหนด ฮัลเลย์ทำนายการกลับมาปี 1758 ได้ถูก แต่เสียชีวิตก่อนเห็น มันโคจรสวนทางกับดาวเคราะห์ทั้งระบบ กลับมาทุก 75–76 ปี ครั้งล่าสุดปี 2529 และจะกลับมาอีกปี 2604',
        en:'The comet that taught us comets are not omens but repeat visitors. Halley predicted its 1758 return correctly but died before seeing it. It runs backwards against the planets, returns every 75–76 years, last came by in 1986 and is due again in 2061.'}
},
{
  id:'encke', kind:'comet', layer:'comets', color:0x9fd8cc, glow:'#9fd8cc',
  nm:{th:'เองเคอ (2P)', en:'Encke (2P)'}, sb:'2P/Encke', cls:'Encke-type Comet',
  el:{a:2.2196209, e:0.847311424, i:11.368183, om:334.112805, w:187.205991, tp:2460239.895222, n:0.2980477621}, epoch:2459936.5,
  radius:2.4, rotH:11.083, aAU:2.21962, q:0.33891, ad:4.1003, orbitDays:1207.86, active:true,
  origin:{th:'โยฮันน์ ฟรันซ์ เองเคอ ผู้คำนวณว่าดาวหางที่เห็นหลายครั้งคือดวงเดียวกัน',
          en:'Johann Franz Encke, who showed several sightings were the same comet'},
  desc:{th:'ดาวหางที่มีคาบสั้นที่สุดในบรรดาดาวหางที่รู้จักดี เพียง 3.3 ปี วนเข้าออกถี่จนสารระเหยแทบหมด หัวจึงจางลงเรื่อย ๆ ฝุ่นที่มันทิ้งไว้ตามทางคือต้นเหตุของฝนดาวตกทอริดส์ในเดือนพฤศจิกายน',
        en:'The shortest period of any well-known comet — just 3.3 years. Cycling in and out so often has left it nearly stripped of volatiles and steadily fainter. The dust it has strewn along its path gives us the Taurid meteor shower each November.'}
},
{
  id:'tempeltuttle', kind:'comet', layer:'comets', color:0x8fd0d8, glow:'#8fd0d8',
  nm:{th:'เทมเพล–ทัตเทิล (55P)', en:'Tempel–Tuttle (55P)'}, sb:'55P/Tempel-Tuttle', cls:'Halley-type Comet*',
  el:{a:10.33833823, e:0.905552721, i:162.486575, om:235.270989, w:172.500274, tp:2450872.597734, n:0.0296502234}, epoch:2451040.5,
  radius:1.8, aAU:10.33834, q:0.97643, ad:19.7002, orbitDays:12141.56, active:true,
  origin:{th:'วิลเฮลม์ เทมเพล และ ฮอเรซ ทัตเทิล ผู้ค้นพบแยกกันในปี 1865–1866',
          en:'Wilhelm Tempel and Horace Tuttle, independent discoverers in 1865–66'},
  desc:{th:'ต้นตอของฝนดาวตกลีโอนิดส์ ทุก 33 ปีที่มันโคจรผ่านเข้ามาใหม่ ธารฝุ่นสด ๆ จะทำให้ฝนดาวตกกลางเดือนพฤศจิกายนกลายเป็น “พายุดาวตก” ที่นับได้หลายพันดวงต่อชั่วโมง อย่างที่เกิดในปี 2509 และ 2544',
        en:'The parent of the Leonid meteors. Every 33 years, when it swings back through, the fresh dust turns the mid-November shower into a storm of thousands of meteors an hour — as it did in 1966 and 2001.'}
},
{
  id:'churyumov', kind:'comet', layer:'comets', color:0xa8ccd8, glow:'#a8ccd8',
  nm:{th:'ชูรีอูมอฟ–เกราซีเมนโค (67P)', en:'Churyumov–Gerasimenko (67P)'}, sb:'67P/Churyumov-Gerasimenko', cls:'Jupiter-family Comet',
  el:{a:3.46224949, e:0.640908131, i:7.040295, om:50.135574, w:12.79825, tp:2457247.588658, n:0.1529912292}, epoch:2457305.5,
  radius:1.7, mass:9.9216e+12, gravity:0.000229, rotH:12.76129, aAU:3.46225, q:1.24327, ad:5.6812, orbitDays:2353.08, active:true,
  origin:{th:'คลิม ชูรีอูมอฟ และ สเวตลานา เกราซีเมนโค ผู้ค้นพบในปี 1969',
          en:'Klim Churyumov and Svetlana Gerasimenko, who found it in 1969'},
  desc:{th:'ดาวหางดวงแรกที่มียานโคจรตามไปด้วยเป็นปี ๆ และหย่อนยานลูกลงไปแตะผิว ภาพที่ได้เผยรูปร่างเหมือนเป็ดยางสองก้อนติดกัน มีหน้าผาสูง เนินทราย และไอพุ่งออกมาเป็นลำ ๆ เมื่อเข้าใกล้ดวงอาทิตย์',
        en:'The first comet escorted for years by an orbiter, which dropped a lander onto its surface. The images revealed a rubber-duck shape of two joined lobes, with cliffs, dune fields and jets that switched on as it neared the Sun.'}
},
{
  id:'hartley2', kind:'comet', layer:'comets', color:0x9cd4c8, glow:'#9cd4c8',
  nm:{th:'ฮาร์ตลีย์ 2 (103P)', en:'Hartley 2 (103P)'}, sb:'103P/Hartley 2', cls:'Jupiter-family Comet',
  el:{a:3.47565249, e:0.693597857, i:13.599468, om:219.742174, w:181.321844, tp:2457863.957983, n:0.1521071235}, epoch:2457152.5,
  radius:0.8, rotH:18.1, aAU:3.47565, q:1.06495, ad:5.8864, orbitDays:2366.75, active:true,
  origin:{th:'มัลคอล์ม ฮาร์ตลีย์ ผู้ค้นพบจากภาพถ่ายในปี 1986',
          en:'Malcolm Hartley, who found it on photographic plates in 1986'},
  desc:{th:'ดาวหางเล็กแต่คึกคักผิดขนาด ยานที่บินผ่านในปี 2553 เห็นไอน้ำพุ่งออกมาพร้อมก้อนน้ำแข็งลอยล่องอยู่รอบตัว และพบว่าน้ำในดาวหางดวงนี้มีอัตราส่วนไอโซโทปใกล้เคียงน้ำในมหาสมุทรโลก',
        en:'A small comet that is far more active than its size suggests. A 2010 flyby saw jets of water vapour with chunks of ice drifting around the nucleus, and found its water has an isotope ratio close to Earth’s oceans.'}
},
{
  id:'swifttuttle', kind:'comet', layer:'comets', color:0x8fc8d8, glow:'#8fc8d8',
  nm:{th:'สวิฟต์–ทัตเทิล (109P)', en:'Swift–Tuttle (109P)'}, sb:'109P/Swift-Tuttle', cls:'Halley-type Comet*',
  el:{a:26.0920695, e:0.963225755, i:113.453817, om:139.381192, w:152.982168, tp:2448968.499785, n:0.0073950529}, epoch:2450000.5,
  radius:13, aAU:26.09207, q:0.95952, ad:51.2246, orbitDays:48681.19, active:true,
  origin:{th:'ลูอิส สวิฟต์ และ ฮอเรซ ทัตเทิล ผู้ค้นพบในปี 1862',
          en:'Lewis Swift and Horace Tuttle, discoverers in 1862'},
  desc:{th:'ต้นตอของฝนดาวตกเพอร์เซอิดส์กลางเดือนสิงหาคม และเป็นวัตถุขนาดใหญ่ที่โคจรตัดวงโคจรโลก นิวเคลียสกว้างราว 26 กิโลเมตร ใหญ่กว่าวัตถุที่ทำให้ไดโนเสาร์สูญพันธุ์ แต่วงโคจรถูกคำนวณไว้แล้วว่าไม่ชนโลกในอีกหลายพันปีข้างหน้า',
        en:'The source of the mid-August Perseids and the largest object known to cross Earth’s orbit. Its nucleus is about 26 km across — bigger than the impactor that ended the dinosaurs — though its path is charted well enough to rule out a hit for millennia.'}
},
{
  id:'halebopp', kind:'comet', layer:'comets', color:0xb8e0e8, glow:'#b8e0e8',
  nm:{th:'เฮล–บอปป์', en:'Hale–Bopp'}, sb:'C/1995 O1 (Hale-Bopp)', cls:'Comet',
  el:{a:177.43338391, e:0.994981003, i:89.287594, om:282.733421, w:130.414667, tp:2450537.134907, n:0.0004170144}, epoch:2459837.5,
  radius:30, aAU:177.43338, q:0.89054, ad:353.9762, orbitDays:863279.5, active:true,
  origin:{th:'อลัน เฮล และ ทอมัส บอปป์ ค้นพบแยกกันในคืนเดียวกันของปี 1995',
          en:'Alan Hale and Thomas Bopp, who spotted it independently on the same night in 1995'},
  desc:{th:'ดาวหางใหญ่แห่งปี 2540 ที่คนทั่วโลกมองเห็นด้วยตาเปล่านานถึง 18 เดือน นานกว่าดาวหางดวงใดในประวัติศาสตร์ที่บันทึกไว้ นิวเคลียสใหญ่ผิดปกติจึงพ่นฝุ่นได้มหาศาล และเห็นหางสองชนิดแยกกันชัดเจน คือหางฝุ่นสีขาวโค้งและหางไอออนสีฟ้าตรง',
        en:'The great comet of 1997, visible to the naked eye for 18 months — longer than any comet on record. Its unusually large nucleus poured out enormous amounts of dust, and it showed both tail types clearly: a curved white dust tail and a straight blue ion tail.'}
},
{
  id:'neowise', kind:'comet', layer:'comets', color:0xc8e4d8, glow:'#c8e4d8',
  nm:{th:'นีโอไวส์', en:'NEOWISE'}, sb:'C/2020 F3 (NEOWISE)', cls:'Comet',
  el:{a:358.46795655, e:0.999178026, i:128.937503, om:61.010428, w:37.278658, tp:2459034.178898, n:0.0001452207}, epoch:2459036.5,
  radius:2.5, rEst:true, aAU:358.46796, q:0.29465, ad:716.6413, orbitDays:2478985.22, active:true,
  origin:{th:'ตั้งตามกล้องโทรทรรศน์อวกาศนีโอไวส์ที่ตรวจพบมันในปี 2563',
          en:'Named for the NEOWISE space telescope that detected it in 2020'},
  desc:{th:'ดาวหางสว่างดวงแรกในรอบหลายปีที่คนซีกโลกเหนือถ่ายรูปกันทั่วบ้านทั่วเมืองในกลางปี 2563 หางฝุ่นกว้างเห็นชัดแม้ในเมืองที่มีแสงรบกวน มันไม่ใช่ดาวหางประจำ คาบโคจรยาวราวเจ็ดพันปี',
        en:'The first bright comet in years, photographed everywhere across the northern hemisphere in mid-2020 — its broad dust tail showed up even through city light. It is no regular visitor: one orbit takes roughly seven thousand years.'}
},
{
  id:'oumuamua', kind:'ism', layer:'comets', color:0xb49ae8, glow:'#b49ae8',
  nm:{th:'โอวูมูอามูอา (1I)', en:'ʻOumuamua (1I)'}, sb:'\'Oumuamua (A/2017 U1)', cls:'Hyperbolic Asteroid',
  el:{a:-1.27234501, e:1.201133796, i:122.741706, om:24.59691, w:241.810536, tp:2458006.007321, n:0.6867469493}, epoch:2458080.5,
  radius:0.1, rEst:true, rotH:7.937, q:0.25591, active:false,
  origin:{th:'โอวูมูอามูอา ภาษาฮาวาย แปลว่า “ผู้สอดส่องที่มาถึงก่อน”',
          en:'ʻOumuamua is Hawaiian for “a messenger reaching out from the distant past”'},
  desc:{th:'วัตถุดวงแรกที่ยืนยันได้ว่ามาจากนอกระบบสุริยะ ค้นพบปี 2560 ตอนกำลังพุ่งออกไปแล้ว รูปร่างยาวผิดปกติเหมือนซิการ์หรือแผ่นจานบิน และเร่งความเร็วขึ้นเล็กน้อยโดยไม่มีหางให้เห็น ซึ่งยังหาคำอธิบายที่ทุกคนเห็นพ้องไม่ได้',
        en:'The first object confirmed to come from outside the solar system, found in 2017 already on its way out. It is oddly elongated — cigar or pancake — and accelerated slightly without showing any tail, which still has no agreed explanation.'}
},
{
  id:'borisov', kind:'ism', layer:'comets', color:0xa898e8, glow:'#a898e8',
  nm:{th:'โบริซอฟ (2I)', en:'Borisov (2I)'}, sb:'C/2019 Q4 (Borisov)', cls:'Hyperbolic Comet',
  el:{a:-0.85149226, e:3.356475783, i:44.052642, om:308.147729, w:209.123686, tp:2458826.052846, n:1.2543912636}, epoch:2458853.5,
  radius:0.5, rEst:true, q:2.00652, active:true,
  origin:{th:'เกนนาดี โบริซอฟ นักดาราศาสตร์สมัครเล่นชาวไครเมียที่พบมันด้วยกล้องที่ประกอบเอง',
          en:'Gennadiy Borisov, the amateur astronomer who found it with a telescope he built himself'},
  desc:{th:'วัตถุจากนอกระบบดวงที่สอง พบในปี 2562 และเป็นดาวหางเต็มตัวที่มีหางชัดเจน ต่างจากดวงแรก การวิเคราะห์แสงพบคาร์บอนมอนอกไซด์มากเป็นพิเศษ บอกว่ามันก่อตัวในย่านที่หนาวจัดรอบดาวฤกษ์ดวงอื่น',
        en:'The second interstellar visitor, found in 2019, and unlike the first it was a proper comet with an obvious tail. Its light showed an unusual abundance of carbon monoxide, pointing to birth in a very cold zone around another star.'}
},
{
  id:'atlas3i', kind:'ism', layer:'comets', color:0xc0a0f0, glow:'#c0a0f0',
  nm:{th:'แอตลาส (3I)', en:'ATLAS (3I)'}, sb:'C/2025 N1 (ATLAS)', cls:'Hyperbolic Comet',
  el:{a:-0.26383745, e:6.141351449, i:175.116457, om:322.169609, w:128.02287, tp:2460977.995263, n:7.2727626099}, epoch:2461090.5,
  radius:2.8, rEst:true, q:1.35648, active:true,
  origin:{th:'ตั้งตามเครือข่ายกล้องสำรวจแอตลาสที่ตรวจพบมันในเดือนกรกฎาคม 2568',
          en:'Named for the ATLAS survey telescopes that detected it in July 2025'},
  desc:{th:'วัตถุจากนอกระบบสุริยะดวงที่สาม พบเมื่อกลางปี 2568 พุ่งเข้ามาด้วยความเร็วสูงและวงโคจรเกือบสวนทางกับระนาบดาวเคราะห์ ผ่านจุดใกล้ดวงอาทิตย์ที่สุดปลายปีเดียวกัน จากนั้นก็ออกจากระบบสุริยะไปโดยไม่กลับมาอีก',
        en:'The third known interstellar object, caught in mid-2025 racing in on a path almost exactly counter to the plane of the planets. It rounded the Sun late that year and is now leaving the solar system for good.'}
}
];

/* ── ยานอวกาศ ────────────────────────────────────────────────────────────
      องค์ประกอบวงโคจรมาจาก JPL Horizons (ระบบพิกัดสุริยวิถี ศูนย์กลางดวงอาทิตย์)
      ยานทั้งหมดในรายการนี้ดับเครื่องยนต์แล้ว บินตามแรงโน้มถ่วงล้วน ๆ
      จึงใช้องค์ประกอบชุดเดียวคำนวณต่อไปได้ — ห้าลำแรกมี e > 1 คือกำลังหลุดพ้น
      ระบบสุริยะไปตลอด ส่วนพาร์เกอร์เป็นวงรีคาบ 88 วัน
      กล้องเจมส์ เว็บบ์ ใช้ special:'l2' คือคำนวณจากตำแหน่งโลกโดยตรง
      ไม่ใช้วงโคจรรอบดวงอาทิตย์ เพราะของจริงเกาะกลุ่มกับโลกไปตลอด
      span = ขนาดตัวยานโดยประมาณ (เมตร) ใช้กำหนดมาตราส่วนตอนซูมเข้าไปดู ────── */
const CRAFT = [
{
  id:'voyager1', kind:'craft', layer:'craft', craft:true, model:'probe', point:'earth',
  color:0xd8dde6, glow:'#d8dde6',
  nm:{th:'วอยเอเจอร์ 1', en:'Voyager 1'}, span:12, mass:825, launch:'1977-09-05',
  el:{a:-3.21551569, e:3.70332582, i:35.767553, om:178.885605, w:338.243848, tp:2444233.586118, n:0.1709338699}, epoch:2461284.5,
  q:8.69259,
  status:{th:'ยังส่งสัญญาณ', en:'still transmitting'},
  origin:{th:'voyager แปลว่า “ผู้เดินทางไกล”',
          en:'“Voyager” — one who makes a long journey'},
  desc:{th:'วัตถุที่มนุษย์สร้างซึ่งอยู่ไกลที่สุด ข้ามเฮลิโอพอสออกไปสู่อวกาศระหว่างดาวเมื่อปี 2555 คำสั่งจากโลกไปถึงตัวยานใช้เวลาข้างละกว่า 22 ชั่วโมง เครื่องกำเนิดไฟฟ้าพลูโตเนียมอ่อนแรงลงทุกปี ทีมงานจึงต้องปิดอุปกรณ์ทีละชิ้นเพื่อยืดอายุออกไปให้นานที่สุด',
        en:'The most distant human-made object, out past the heliopause in interstellar space since 2012. A command from Earth takes over 22 hours each way, and as its plutonium generator weakens the team shuts down one instrument at a time to stretch its life.'}
},
{
  id:'voyager2', kind:'craft', layer:'craft', craft:true, model:'probe', point:'earth',
  color:0xc8cfda, glow:'#c8cfda',
  nm:{th:'วอยเอเจอร์ 2', en:'Voyager 2'}, span:12, mass:825, launch:'1977-08-20',
  el:{a:-4.02038235, e:6.279038943, i:78.987519, om:101.812039, w:130.02315, tp:2445454.303959, n:0.1222652492}, epoch:2461284.5,
  q:21.22375,
  status:{th:'ยังส่งสัญญาณ', en:'still transmitting'},
  origin:{th:'ปล่อยก่อนวอยเอเจอร์ 1 สองสัปดาห์ แต่เดินทางเส้นทางที่ช้ากว่า',
          en:'Launched two weeks before Voyager 1, but on a slower route'},
  desc:{th:'ยานลำเดียวที่ได้ไปเยือนทั้งดาวยูเรนัสและดาวเนปจูน เพราะจังหวะที่ดาวเคราะห์นอกเรียงตัวให้เหวี่ยงต่อกันได้แบบนั้นเกิดขึ้นทุก 176 ปี หลังผ่านดาวเนปจูนมันถูกเหวี่ยงลงใต้ระนาบสุริยวิถีเกือบ 80 องศา แล้วข้ามเฮลิโอพอสตามลำพี่ไปในปี 2561',
        en:'The only spacecraft to visit Uranus and Neptune — the planetary alignment that allowed that chain of gravity assists comes round once every 176 years. Neptune flung it nearly 80° below the ecliptic, and it crossed the heliopause in 2018.'}
},
{
  id:'pioneer10', kind:'craft', layer:'craft', craft:true, model:'probe', point:'earth',
  color:0xb8bcc4, glow:'#b8bcc4',
  nm:{th:'ไพโอเนียร์ 10', en:'Pioneer 10'}, span:9, mass:258, launch:'1972-03-02',
  el:{a:-6.93474404, e:1.744963384, i:3.127083, om:332.906536, w:346.239079, tp:2441999.554846, n:0.0539707458}, epoch:2461284.5,
  q:5.16613,
  status:{th:'ขาดการติดต่อ ปี 2546', en:'contact lost in 2003'},
  origin:{th:'pioneer แปลว่า “ผู้เบิกทาง”',
          en:'“Pioneer” — the one who goes first'},
  desc:{th:'ยานลำแรกที่ผ่านแถบดาวเคราะห์น้อยไปได้ และลำแรกที่บินผ่านดาวพฤหัสบดี ติดแผ่นโลหะสลักรูปมนุษย์กับแผนที่บอกตำแหน่งโลกไว้เผื่อมีใครเก็บได้ในอนาคตอันไกล สัญญาณสุดท้ายมาถึงโลกเมื่อปี 2546 หลังจากนั้นมันบินตามแรงเฉื่อยเงียบ ๆ ต่อไปตามที่แรงโน้มถ่วงกำหนด',
        en:'The first spacecraft through the asteroid belt and the first to fly past Jupiter. It carries an engraved plaque showing two humans and a map to Earth, in case anyone ever finds it. The last signal arrived in 2003; since then it coasts on silently along the path gravity set.'}
},
{
  id:'pioneer11', kind:'craft', layer:'craft', craft:true, model:'probe', point:'earth',
  color:0xb0b4bc, glow:'#b0b4bc',
  nm:{th:'ไพโอเนียร์ 11', en:'Pioneer 11'}, span:9, mass:259, launch:'1973-04-06',
  el:{a:-8.13213938, e:2.135778471, i:16.676333, om:160.08293, w:12.802323, tp:2444212.474912, n:0.0425007754}, epoch:2461284.5,
  q:9.23631,
  status:{th:'ขาดการติดต่อ ปี 2538', en:'contact lost in 1995'},
  origin:{th:'ยานคู่แฝดของไพโอเนียร์ 10',
          en:'The twin of Pioneer 10'},
  desc:{th:'ยานลำแรกที่บินผ่านดาวเสาร์ โดยใช้แรงเหวี่ยงจากดาวพฤหัสบดีสลัดตัวเองข้ามระบบสุริยะไปโผล่อีกฟากหนึ่ง ขาดการติดต่อตั้งแต่ปี 2538 ปัจจุบันมุ่งหน้าไปทางกลุ่มดาวโล่ ซึ่งอยู่คนละทิศกับที่วอยเอเจอร์ทั้งสองลำกำลังไป',
        en:'The first spacecraft to fly past Saturn, using Jupiter’s gravity to sling itself clear across the solar system to the far side. Contact ended in 1995; it now heads towards the constellation Scutum, a different direction from either Voyager.'}
},
{
  id:'newhorizons', kind:'craft', layer:'craft', craft:true, model:'nh', point:'earth',
  color:0xd0c8b0, glow:'#d0c8b0',
  nm:{th:'นิวฮอไรซันส์', en:'New Horizons'}, span:7, mass:478, launch:'2006-01-19',
  el:{a:-5.63658408, e:1.409363167, i:2.258969, om:226.358301, w:291.663516, tp:2453772.97262, n:0.0736512444}, epoch:2461284.5,
  q:2.30741,
  status:{th:'ยังทำงานอยู่', en:'still operating'},
  origin:{th:'new horizons แปลว่า “ขอบฟ้าใหม่”',
          en:'“New Horizons” — new frontiers'},
  desc:{th:'ยานที่บินผ่านพลูโตในปี 2558 เปลี่ยนจุดสีเบลอในภาพถ่ายให้กลายเป็นโลกที่มีภูเขาน้ำแข็งและที่ราบไนโตรเจน แล้วเดินทางต่อไปเจออาร์โรคอทในวันขึ้นปีใหม่ 2562 ปัจจุบันยังทำงาน วัดฝุ่นและอนุภาคในแถบไคเปอร์ที่วัดจากที่อื่นไม่ได้',
        en:'It flew past Pluto in 2015, turning a blurred dot into a world with ice mountains and nitrogen plains, then went on to Arrokoth on New Year’s Day 2019. It is still working, measuring dust and particles in the Kuiper belt that nothing else can reach.'}
},
{
  id:'parker', kind:'craft', layer:'craft', craft:true, model:'parker', point:'sun',
  color:0xe8e0d0, glow:'#e8e0d0',
  nm:{th:'พาร์เกอร์ โซลาร์ โพรบ', en:'Parker Solar Probe'}, span:5, mass:685, launch:'2018-08-12',
  el:{a:0.38842357, e:0.882024826, i:3.391138, om:76.4834, w:68.639215, tp:2461288.107006, n:4.0714181006}, epoch:2461284.5,
  q:0.04582, aAU:0.38842, ad:0.73102, orbitDays:88.42,
  status:{th:'ยังทำงานอยู่', en:'still operating'},
  origin:{th:'ยูจีน พาร์เกอร์ นักฟิสิกส์ผู้ทำนายลมสุริยะไว้ตั้งแต่ปี 1958',
          en:'Eugene Parker, the physicist who predicted the solar wind in 1958'},
  desc:{th:'ยานที่เข้าใกล้ดวงอาทิตย์ที่สุดเท่าที่มนุษย์เคยส่งไป ผ่านเข้าไปในโคโรนาที่ระยะราว 6.9 ล้านกิโลเมตรจากผิว และเป็นวัตถุที่เร็วที่สุดที่มนุษย์สร้าง ราว 190 กิโลเมตรต่อวินาทีตอนเข้าใกล้ที่สุด โล่คาร์บอนด้านหน้าร้อนถึงราว 1,400 องศาเซลเซียส ขณะที่อุปกรณ์ที่หลบอยู่ข้างหลังยังเย็นเท่าอุณหภูมิห้อง',
        en:'The closest any spacecraft has come to the Sun, diving through the corona to about 6.9 million km above the surface — and the fastest object humans have built, near 190 km/s at closest approach. Its carbon shield reaches roughly 1,400 °C while the instruments hiding behind it stay at room temperature.'}
},
{
  id:'jwst', kind:'craft', layer:'craft', craft:true, model:'jwst', point:'sun',
  color:0xe0c070, glow:'#e0c070',
  nm:{th:'กล้องเจมส์ เว็บบ์', en:'James Webb Telescope'}, span:22, mass:6161, launch:'2021-12-25',
  el:{a:1.05412413, e:0.037733052, i:0.172955, om:308.390018, w:52.943479, tp:2461308.213996, n:0.9106813478}, epoch:2461284.5,
  q:1.01435, aAU:1.05412, ad:1.0939, orbitDays:395.31, special:'l2',
  status:{th:'ยังทำงานอยู่', en:'still operating'},
  origin:{th:'เจมส์ อี. เว็บบ์ ผู้บริหารองค์การอวกาศสหรัฐยุคโครงการอะพอลโล',
          en:'James E. Webb, who ran NASA through the Apollo era'},
  desc:{th:'กล้องอินฟราเรดที่ใหญ่ที่สุดในอวกาศ ไม่ได้โคจรรอบโลกแต่ไปอยู่แถวจุดสมดุลแรงโน้มถ่วง L2 ห่างจากโลกออกไปทางตรงข้ามดวงอาทิตย์ราวหนึ่งล้านห้าแสนกิโลเมตร ม่านกันแดดห้าชั้นขนาดเท่าสนามเทนนิสกั้นแสงและความร้อนไว้ ทำให้กระจกทองด้านหลังเย็นถึงราวลบ 233 องศาเซลเซียส ซึ่งจำเป็นสำหรับการมองแสงอินฟราเรดจากกาแล็กซีแรก ๆ ของเอกภพ',
        en:'The largest infrared telescope in space. It does not orbit Earth but keeps station near the L2 balance point, about 1.5 million km further from the Sun than we are. A five-layer sunshield the size of a tennis court holds back the light and heat so the gold mirrors behind it can sit at about −233 °C — cold enough to see the infrared glow of the universe’s first galaxies.'}
}
];

/* ประเภทวงโคจรตามที่ JPL จัดหมวด — แปลไทยไว้ใช้ในแผงข้อมูล */
const SBCLASS = {
  'Main-belt Asteroid':      { th:'แถบดาวเคราะห์น้อยหลัก',            en:'Main-belt asteroid' },
  'Amor':                    { th:'กลุ่มอามอร์ (เข้าใกล้โลกจากนอก)',   en:'Amor · near-Earth' },
  'Apollo':                  { th:'กลุ่มอะพอลโล (ตัดวงโคจรโลก)',       en:'Apollo · crosses Earth’s orbit' },
  'Aten':                    { th:'กลุ่มอาเทน (วงโคจรเล็กกว่าโลก)',     en:'Aten · orbit inside Earth’s' },
  'TransNeptunian Object':   { th:'วัตถุพ้นดาวเนปจูน',                 en:'Trans-Neptunian object' },
  'Halley-type Comet*':      { th:'ดาวหางแบบฮัลเลย์ (คาบ 20–200 ปี)',  en:'Halley-type comet' },
  'Encke-type Comet':        { th:'ดาวหางแบบเองเคอ (คาบสั้นมาก)',      en:'Encke-type comet' },
  'Jupiter-family Comet':    { th:'ดาวหางตระกูลดาวพฤหัสบดี',           en:'Jupiter-family comet' },
  'Comet':                   { th:'ดาวหางคาบยาว',                     en:'Long-period comet' },
  'Hyperbolic Asteroid':     { th:'วงโคจรไฮเพอร์โบลา — มาจากนอกระบบ',  en:'Hyperbolic — interstellar' },
  'Hyperbolic Comet':        { th:'ดาวหางวงโคจรไฮเพอร์โบลา — จากนอกระบบ', en:'Hyperbolic comet — interstellar' }
};

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
    tabs:['ข้อมูล','เครื่องมือ','มุมมอง','ท้องฟ้า'],
    find:'ค้นหา', findPh:'ค้นหาดาวเคราะห์ ดวงจันทร์…', close:'ปิด', about:'เกี่ยวกับแผนที่นี้',
    home:'หน้าหลัก', homeTip:'กลับหน้าหลัก รัฐไทยก้าวหน้า',
    share:'แชร์', shareTip:'คัดลอกลิงก์ของมุมมองนี้ (L)', shareOk:'คัดลอกลิงก์ของมุมมองนี้แล้ว',
    shareFail:'คัดลอกอัตโนมัติไม่ได้ — คัดลอกจากแถบที่อยู่ของเบราว์เซอร์ได้เลย',
    shot:'บันทึกภาพ', shotTip:'บันทึกภาพหน้าจอเป็นไฟล์ PNG (P)', shotOk:'บันทึกภาพเป็นไฟล์ PNG แล้ว',
    kind:{ star:'ดาวฤกษ์', planet:'ดาวเคราะห์', dwarf:'ดาวเคราะห์แคระ', moon:'ดวงจันทร์',
           asteroid:'ดาวเคราะห์น้อย', comet:'ดาวหาง', tno:'วัตถุพ้นดาวเนปจูน', ism:'วัตถุจากนอกระบบสุริยะ',
           craft:'ยานอวกาศ' },
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
    ladder:['ผิวดาว','ดาวเคราะห์','ระบบสุริยะ','แถบไคเปอร์','เมฆออร์ต','ดาวใกล้เคียง','กาแล็กซี',
            'กลุ่มท้องถิ่น','กระจุกกาแล็กซี','เอกภพที่สังเกตได้'],
    mly:'ล้านปีแสง', gly:'พันล้านปีแสง', obsEdge:'ขอบเอกภพที่สังเกตได้ · รัศมี 46,500 ล้านปีแสง', vDeep:'กาแล็กซีเพื่อนบ้าน', milkyWay:'ทางช้างเผือก (เราอยู่ที่นี่)',
    ladderNote:'ระบบสุริยะทั้งระบบกว้างไม่ถึงหนึ่งในพันของระยะที่กาแล็กซีกินพื้นที่ และกาแล็กซีทั้งใบก็เล็กกว่าเอกภพที่มองเห็นได้อีกหลายแสนเท่า — ไล่ปุ่มลงมาทีละขั้นเพื่อดูว่าเราเล็กแค่ไหน',
    vShow:'สิ่งที่แสดงในฉาก', vOrbits:'เส้นวงโคจร', vLabels:'ชื่อวัตถุ', vMoons:'ดวงจันทร์',
    vBelt:'แถบดาวเคราะห์น้อย', vKuiper:'แถบไคเปอร์', vOort:'เมฆออร์ต',
    vStars:'ดาวฤกษ์', vGalaxy:'ทางช้างเผือก', vGrid:'ระนาบสุริยวิถี',
    vTrails:'ร่องรอยการเคลื่อนที่ (T)', vFigures:'เส้นกลุ่มดาว',
    gCentre:'ใจกลางกาแล็กซี · หลุมดำ Sgr A*', gSun:'ดวงอาทิตย์อยู่ตรงนี้ · เดือยนายพราน',
    gNorma:'แขนนอร์มา', gScutum:'แขนสคูตัม–เซนทอรัส',
    gSagittarius:'แขนซาจิตทาเรียส–คารินา', gPerseus:'แขนเพอร์ซิอัส',
    galNote:'รูปร่างของทางช้างเผือกในแผนที่นี้เป็นแบบจำลองเชิงศิลป์ (จานเอ็กซ์โพเนนเชียล + ดุมกลาง + แขนกังหันลอการิทึม 4 แขน) ไม่ใช่แผนที่จากการสำรวจ แต่ระยะจากดวงอาทิตย์ถึงใจกลาง 26,000 ปีแสง และลำดับของแขนที่เรียงเข้า-ออกจากตำแหน่งเรานั้นตรงกับที่วัดได้จริง',
    gCons:'กลุ่มดาว',
    consNote:'รูปลากเส้นกลุ่มดาวไม่ใช่มาตรฐานสากล สหพันธ์ดาราศาสตร์สากลกำหนดแค่ “ขอบเขต” บนท้องฟ้า ไม่ได้กำหนดว่าต้องลากเส้นเชื่อมดาวดวงไหน เส้นในแผนที่นี้จึงลากขึ้นเองอิงรูปที่ใช้กันทั่วไป และเส้นจะบิดเบี้ยวจริงเมื่อบินออกจากดวงอาทิตย์',
    vAsteroids:'ดาวเคราะห์น้อย', vComets:'ดาวหาง', vDwarfs:'ดาวเคราะห์แคระและวัตถุไกล',
    smallNote:'วัตถุจิ๋วจะโผล่ให้เห็นเมื่อระยะมองใกล้เคียงขนาดวงโคจรของมัน — ซูมเข้าออกแล้วชื่อจะสลับกันขึ้น',
    peri:'ระยะใกล้ดวงอาทิตย์สุด', apo:'ระยะไกลดวงอาทิตย์สุด', sbClass:'ประเภทวงโคจร',
    elEpoch:'ยุคขององค์ประกอบวงโคจร', rApprox:'ประมาณ', nextPeri:'ผ่านจุดใกล้ดวงอาทิตย์สุดครั้งถัดไป',
    lastPeri:'ผ่านจุดใกล้ดวงอาทิตย์สุดเมื่อ', speedNow:'ความเร็วขณะนี้',
    vInf:'ความเร็วสุดท้ายเมื่อพ้นระบบสุริยะ',
    gAsteroids:'ดาวเคราะห์น้อย', gDwarfs:'ดาวเคราะห์แคระและวัตถุพ้นดาวเนปจูน',
    gComets:'ดาวหางและวัตถุจากนอกระบบ', gCraft:'ยานอวกาศ',
    secStar:'ข้อมูลดาวฤกษ์', gStars:'ดาวฤกษ์', gExo:'ระบบดาวเคราะห์นอกระบบ',
    vExo:'ระบบดาวเคราะห์นอกระบบ', exoSystem:'ระบบดาวเคราะห์นอกระบบ', exoPlanets:'ดวง',
    exoChart:'ผังระบบเทียบกับของเรา', exoHost:'ดาวแม่', exoList:'ดาวเคราะห์ในระบบนี้',
    exoTeff:'อุณหภูมิผิวดาวแม่', exoSmass:'มวลดาวแม่', exoHZ:'เขตที่น้ำเป็นของเหลวได้',
    exoOurs:'ของเรา',
    exoChartNote:'แกนนอนเป็นสเกลลอการิทึมของระยะจากดาวแม่ ขนาดวงกลมไล่ตามรัศมีของดาวเคราะห์ แถวล่างคือระบบสุริยะของเราวางบนแกนเดียวกันเพื่อเทียบ · แถบเขียวคำนวณจากกำลังส่องสว่างของดาวแม่ เป็นระยะที่น้ำบนพื้นผิวอาจเป็นของเหลวได้ ไม่ได้แปลว่ามีสิ่งมีชีวิต',
    stDist:'ระยะจากดวงอาทิตย์', stFromHere:'ระยะจากกล้องตอนนี้',
    stMagApp:'ความสว่างที่เห็นจากตรงนี้', stMagAbs:'ความสว่างสัมบูรณ์',
    stLum:'กำลังส่องสว่างจริง', timesSun:'เท่าของดวงอาทิตย์', stSpec:'ชนิดสเปกตรัม',
    stNaked:'มองเห็นด้วยตาเปล่า', yes:'เห็นได้', no:'ไม่เห็น',
    stLight:'แสงที่เห็นตอนนี้',
    stLightNote:'แสงที่ตกถึงตาเราตอนนี้ออกจากดาวดวงนี้เมื่อ {ly} ปีก่อน คือราวปี {year} — สิ่งที่เห็นคืออดีตของมัน',
    stTravel:'ถ้าจะเดินทางไปหา',
    stTravelNote:'ด้วยความเร็วของยานวอยเอเจอร์ 1 (16.9 กม./วิ) ต้องใช้เวลาราว {yr} ปี',
    stAim:'หันกล้องไปทางนี้', stBack:'กลับไปดูวัตถุที่เจาะจงอยู่',
    starHint:'ซูมออกไปให้พ้นระบบสุริยะแล้วคลิกที่ดาวดวงไหนก็ได้ที่มีชื่อ',
    skyWhere:'จุดที่ยืนดู', skyHere:'ตำแหน่งของฉัน', skyMine:'ตำแหน่งของฉัน',
    skyNoGeo:'ขอตำแหน่งไม่สำเร็จ — เลือกเมืองจากรายการแทนได้',
    skyNow:'ท้องฟ้า ณ เวลาที่แสดง',
    skyDomeNote:'วงกลมคือท้องฟ้าทั้งใบ จุดกึ่งกลางคือเหนือหัวพอดี ขอบวงคือขอบฟ้า จุดเขียวหลังชื่อแปลว่าตอนนั้นฟ้ามืดพอและวัตถุอยู่เหนือขอบฟ้าแล้ว',
    skySunMoon:'ดวงอาทิตย์และดวงจันทร์', skyEvents:'ปฏิทินเหตุการณ์ 400 วันข้างหน้า',
    skyCalc:'กำลังคำนวณ…',
    skyEventNote:'ทุกบรรทัดคำนวณสดจากตำแหน่งจริงในแผนที่นี้ ไม่ได้เปิดตารางสำเร็จรูปจากที่ไหน กดที่รายการเพื่อกระโดดเวลาไปดูได้ · เวลาที่ได้อาจคลาดจากประกาศทางการราวหนึ่งถึงสองชั่วโมง และชนิดของอุปราคา (เต็มดวง/บางส่วน/วงแหวน) กับพื้นที่ที่มองเห็น ต้องดูประกาศของหน่วยงานดาราศาสตร์อีกที',
    latN:'เหนือ', latS:'ใต้', lonE:'ตะวันออก', lonW:'ตะวันตก', belowHorizon:'อยู่ใต้ขอบฟ้า',
    sunRise:'ดวงอาทิตย์ขึ้น', sunSet:'ดวงอาทิตย์ตก', dayLen:'ความยาวกลางวัน',
    moonRise:'ดวงจันทร์ขึ้น', moonSet:'ดวงจันทร์ตก', moonPhase:'ส่วนสว่างของดวงจันทร์',
    waxing:'ข้างขึ้น', waning:'ข้างแรม',
    skyTwilight:'ตอนนี้', isDay:'กลางวัน', isTwilight:'สนธยา', isNight:'กลางคืน',
    compass:['เหนือ','อีสาน','ตะวันออก','อาคเนย์','ใต้','หรดี','ตะวันตก','พายัพ'],
    cardinal:['เหนือ','ออก','ใต้','ตก'],
    evNewMoon:'จันทร์ดับ', evFullMoon:'จันทร์เต็มดวง',
    evEclipseSun:'สุริยุปราคา', evEclipseMoon:'จันทรุปราคา', evBeta:'ดวงจันทร์เยื้องระนาบ',
    evOpposition:'อยู่ตรงข้ามดวงอาทิตย์', evOppNote:'ขึ้นหัวค่ำ ตกเช้ามืด — ช่วงที่ดูได้ดีที่สุด',
    evElongation:'ห่างดวงอาทิตย์มากที่สุด', evEvening:'เห็นหัวค่ำทางตะวันตก', evMorning:'เห็นเช้ามืดทางตะวันออก',
    evSeparation:'ห่างกัน', evMeteor:'ฝนดาวตก', evPerHour:' ดวง/ชม.', evFrom:'เศษจาก',
    evPerihelion:'ถึงจุดใกล้ดวงอาทิตย์สุด',
    evAboveHere:'ช่วงนั้นอยู่เหนือขอบฟ้าที่จุดสังเกต', evBelowHere:'ช่วงนั้นอยู่ใต้ขอบฟ้าที่จุดสังเกต',
    vCraft:'ยานอวกาศ', launch:'วันปล่อยยาน', status:'สถานะ', craftSpan:'ขนาดตัวยาน',
    lightRT:'สัญญาณวิทยุไป-กลับ', metre:'ม.',
    l2note:'ตำแหน่งของกล้องนี้คำนวณจากจุดสมดุล L2 ของระบบดวงอาทิตย์–โลกโดยตรง (ห่างจากโลก 1.5 ล้านกิโลเมตรไปด้านตรงข้ามดวงอาทิตย์ บวกวงโคจรรอบจุดนั้น) ไม่ได้ใช้วงโคจรรอบดวงอาทิตย์ เพราะของจริงเกาะกลุ่มไปกับโลกตลอด',
    vSize:'ขนาดของดาว', sizeReal:'ตามจริง', sizeBig:'ขยายให้เห็น',
    sizeNote:'ตามจริง: ดาวเคราะห์จะเล็กจนเกือบมองไม่เห็นเมื่อดูทั้งระบบ — เพราะระยะห่างจริงมันมากขนาดนั้น',
    now:'ตอนนี้', frame:'จัดกล้อง', live:'สด', paused:'หยุด',
    au:'AU', km:'กม.', kms:'กม./วิ', hr:'ชม.', day:'วัน', yr:'ปี', deg:'°', min:'นาที', sec:'วินาที',
    hint:'ลากเพื่อหมุน · เลื่อนล้อเพื่อซูม · คลิกชื่อวัตถุเพื่อเจาะจง',
    gPlanets:'ดาวเคราะห์', gOther:'ดาวฤกษ์และดาวเคราะห์แคระ', gMoons:'ดวงจันทร์', noHit:'ไม่พบวัตถุที่ค้นหา'
  },
  en:{
    tabs:['Info','Toolbox','View','Sky'],
    find:'Search', findPh:'Search planets, moons…', close:'Close', about:'About this atlas',
    home:'Home', homeTip:'Back to the main site',
    share:'Share', shareTip:'Copy a link to this exact view (L)', shareOk:'Link to this view copied',
    shareFail:'Could not copy automatically — copy it from the address bar instead',
    shot:'Snapshot', shotTip:'Save the view as a PNG file (P)', shotOk:'Saved as a PNG file',
    kind:{ star:'Star', planet:'Planet', dwarf:'Dwarf planet', moon:'Moon',
           asteroid:'Asteroid', comet:'Comet', tno:'Trans-Neptunian object', ism:'Interstellar object',
           craft:'Spacecraft' },
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
    ladder:['Surface','Planet','Solar system','Kuiper belt','Oort cloud','Neighbourhood','Galaxy',
            'Local Group','Galaxy clusters','Observable universe'],
    mly:'Mly', gly:'Gly', obsEdge:'Edge of the observable universe · radius 46,500 Mly', vDeep:'Neighbour galaxies', milkyWay:'Milky Way (you are here)',
    ladderNote:'The whole solar system spans less than a thousandth of the galaxy, and the galaxy is smaller still against the observable universe by a factor of hundreds of thousands — step down the list to feel the scale.',
    vShow:'Scene layers', vOrbits:'Orbit paths', vLabels:'Labels', vMoons:'Moons',
    vBelt:'Asteroid belt', vKuiper:'Kuiper belt', vOort:'Oort cloud',
    vStars:'Stars', vGalaxy:'Milky Way', vGrid:'Ecliptic plane',
    vTrails:'Motion trails (T)', vFigures:'Constellation lines',
    gCentre:'Galactic centre · Sgr A*', gSun:'You are here · Orion Spur',
    gNorma:'Norma Arm', gScutum:'Scutum–Centaurus Arm',
    gSagittarius:'Sagittarius–Carina Arm', gPerseus:'Perseus Arm',
    galNote:'The Milky Way here is a stylised model — an exponential disc, a central bulge and four logarithmic spiral arms — not a survey map. But the Sun’s 26,000 light-year distance from the centre, and the order in which the arms fall inward and outward from us, match the measurements.',
    gCons:'Constellations',
    consNote:'Constellation stick figures are not standardised — the IAU defines only the boundaries on the sky, not which stars to join. The lines here were drawn for this atlas following common usage, and they distort for real as you fly away from the Sun.',
    vAsteroids:'Asteroids', vComets:'Comets', vDwarfs:'Dwarf planets & distant objects',
    smallNote:'Small bodies appear when the view distance is comparable to their own orbit — zoom in and out and different names take over.',
    peri:'Perihelion distance', apo:'Aphelion distance', sbClass:'Orbit class',
    elEpoch:'Element epoch', rApprox:'approx.', nextPeri:'Next perihelion passage',
    lastPeri:'Last perihelion passage', speedNow:'Current speed',
    vInf:'Final speed leaving the solar system',
    gAsteroids:'Asteroids', gDwarfs:'Dwarf planets & Trans-Neptunian objects',
    gComets:'Comets & interstellar objects', gCraft:'Spacecraft',
    secStar:'Star data', gStars:'Stars', gExo:'Exoplanet systems',
    vExo:'Exoplanet systems', exoSystem:'Exoplanet system', exoPlanets:'planets',
    exoChart:'The system, next to ours', exoHost:'Host star', exoList:'Planets in this system',
    exoTeff:'Host temperature', exoSmass:'Host mass', exoHZ:'liquid-water zone',
    exoOurs:'ours',
    exoChartNote:'The horizontal axis is a log scale of distance from the star, and circle size follows planet radius. The lower row is our own solar system on the same axis for comparison. The green band is computed from the host’s luminosity — it marks where surface water could stay liquid, not that anything lives there.',
    stDist:'Distance from the Sun', stFromHere:'Distance from the camera',
    stMagApp:'Apparent magnitude from here', stMagAbs:'Absolute magnitude',
    stLum:'True luminosity', timesSun:'× the Sun', stSpec:'Spectral type',
    stNaked:'Naked-eye visible', yes:'yes', no:'no',
    stLight:'The light you see now',
    stLightNote:'The light reaching you now left this star {ly} years ago, around the year {year} — you are looking at its past.',
    stTravel:'Travelling there',
    stTravelNote:'At Voyager 1’s speed (16.9 km/s) the trip would take about {yr} years.',
    stAim:'Point the camera at it', stBack:'Back to the focused object',
    starHint:'Zoom out past the solar system and click any named star',
    skyWhere:'Where you are standing', skyHere:'Use my location', skyMine:'My location',
    skyNoGeo:'Could not get your location — pick a city from the list instead',
    skyNow:'Sky at the displayed time',
    skyDomeNote:'The circle is the whole sky: the centre is straight overhead, the rim is the horizon. A green dot after a name means the sky is dark enough and the object is up.',
    skySunMoon:'Sun and Moon', skyEvents:'Sky events, next 400 days',
    skyCalc:'Calculating…',
    skyEventNote:'Every line is computed live from the positions in this atlas — no published table is being read. Click a row to jump the clock to it. Times can differ from official announcements by an hour or two, and the type of an eclipse (total, partial, annular) and where it is visible should be checked against an astronomical authority.',
    latN:'N', latS:'S', lonE:'E', lonW:'W', belowHorizon:'below the horizon',
    sunRise:'Sunrise', sunSet:'Sunset', dayLen:'Length of day',
    moonRise:'Moonrise', moonSet:'Moonset', moonPhase:'Moon illuminated',
    waxing:'waxing', waning:'waning',
    skyTwilight:'Right now', isDay:'daylight', isTwilight:'twilight', isNight:'night',
    compass:['N','NE','E','SE','S','SW','W','NW'],
    cardinal:['N','E','S','W'],
    evNewMoon:'New moon', evFullMoon:'Full moon',
    evEclipseSun:'Solar eclipse', evEclipseMoon:'Lunar eclipse', evBeta:'Moon off the plane by',
    evOpposition:'at opposition', evOppNote:'Rises at dusk, sets at dawn — the best viewing of its cycle',
    evElongation:'at greatest elongation', evEvening:'evening sky, in the west', evMorning:'morning sky, in the east',
    evSeparation:'separation', evMeteor:'Meteor shower:', evPerHour:'/hr', evFrom:'debris from',
    evPerihelion:'at perihelion',
    evAboveHere:'above the horizon where you are', evBelowHere:'below the horizon where you are',
    vCraft:'Spacecraft', launch:'Launched', status:'Status', craftSpan:'Spacecraft size',
    lightRT:'Round-trip signal', metre:'m',
    l2note:'This telescope is placed from the Sun–Earth L2 balance point directly — 1.5 million km beyond Earth on the anti-Sun side, plus its loop around that point — rather than from a heliocentric orbit, because in reality it travels with Earth indefinitely.',
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
        ซึ่งไม่เข้าข่ายงานอันมีลิขสิทธิ์ คำบรรยายทั้งหมดเรียบเรียงขึ้นใหม่
        ตัวเลขของดาวเคราะห์น้อยและดาวหางนำมาจากฐานข้อมูลวัตถุขนาดเล็กของ JPL
        วิถียานอวกาศจาก JPL Horizons ดาวฤกษ์และกาแล็กซีจากฐานข้อมูล SIMBAD ของ CDS
        และดาวเคราะห์นอกระบบจากคลังข้อมูลของนาซา — ทั้งหมดเปิดให้ทุกคนใช้ และ
        คัดลอกมาเก็บไว้ในไฟล์ครั้งเดียว ไม่ได้เรียกข้อมูลตอนเปิดหน้าเว็บ</li>
    <li><b>ไม่ใช้เครื่องหมายขององค์กรใด</b> ไม่มีโลโก้ ชื่อ หรือรูปแบบตราสัญลักษณ์ของหน่วยงานอวกาศใด ๆ
        ซึ่งมักได้รับความคุ้มครองแยกจากลิขสิทธิ์ในฐานะเครื่องหมายการค้า</li>
  </ul>

  <h4>ความแม่นยำ</h4>
  <p>ใช้องค์ประกอบวงโคจรโดยประมาณยุค J2000 ให้ความคลาดเคลื่อนระดับลิปดาในช่วงปี ค.ศ. 1800–2050
  เหมาะกับการเรียนรู้และการนำเสนอ แต่ไม่เหมาะกับงานนำทางยานอวกาศ ตำแหน่งดวงจันทร์เป็นวงโคจรวงรีอย่างง่าย
  รอบระนาบศูนย์สูตรของดาวแม่ ส่วนขนาดของดาวแสดงตามจริงเสมอ ยกเว้นเมื่อเปิดโหมด “ขยายให้เห็น”</p>
  <p>วัตถุขนาดเล็กคำนวณจากองค์ประกอบวงโคจร “ยุคเดียว” แบบสองวัตถุ คือคิดแค่แรงดึงของดวงอาทิตย์
  ไม่ได้คิดแรงกวนจากดาวพฤหัสบดี ตำแหน่งช่วงใกล้ยุคขององค์ประกอบจึงแม่น แต่ถ้าไล่เวลาออกไปหลายสิบปี
  วันที่ดาวหางจะกลับมาใกล้ดวงอาทิตย์อาจคลาดจากที่ประกาศไว้ได้หลายเดือน ตัวอย่างเช่นฮัลเลย์
  ซึ่งของจริงจะกลับมาเดือนกรกฎาคม 2604 แต่แบบจำลองนี้ให้เดือนมกราคม 2605
  รูปร่างและระนาบของวงโคจรยังถูกต้อง — ที่คลาดคือ “ถึงเมื่อไร” ไม่ใช่ “ไปทางไหน”</p>

  <h4>ออกไปไกลกว่าระบบสุริยะ</h4>
  <p>บันไดมาตราส่วนมีสิบขั้น ไล่จากผิวดาวไปจนถึงขอบเอกภพที่สังเกตได้ ระหว่างทางมีดาวฤกษ์จริง
  1,356 ดวง เส้นกลุ่มดาว 86 กลุ่ม ป้ายบอกแขนกังหันของทางช้างเผือกกับตำแหน่งของเราในนั้น
  กาแล็กซีเพื่อนบ้าน 17 แห่ง และดาวเคราะห์นอกระบบ 646 ดวงใน 299 ระบบ
  ที่กดดูผังเทียบกับระบบสุริยะของเราได้</p>

  <h4>ดาวฤกษ์รอบตัวเป็นของจริง</h4>
  <p>ดาวทุกดวงที่อยู่ใกล้กว่า 32.6 ปีแสง และดาวสว่างทั้งท้องฟ้ารวม 551 ดวง วางตามตำแหน่งสามมิติจริง
  จากฐานข้อมูล SIMBAD ของ CDS ความสว่างคำนวณจากระยะถึงกล้อง ดาวจึงหรี่หรือสว่างขึ้นเมื่อเข้าใกล้
  และเมื่อบินออกจากระบบสุริยะไปไม่กี่ปีแสง รูปกลุ่มดาวจะบิดเบี้ยวจริง เพราะดาวใกล้เลื่อนเร็วกว่าดาวไกล
  คลิกที่ดาวดวงไหนก็ได้เพื่อดูข้อมูล</p>

  <h4>แท็บ “ท้องฟ้า”</h4>
  <p>เลือกจุดที่ยืนบนโลกแล้วดูว่าเวลาที่กำลังแสดงอยู่นั้น ดาวดวงไหนอยู่เหนือขอบฟ้าบ้าง
  สูงเท่าไร ทิศไหน พร้อมเวลาดวงอาทิตย์-ดวงจันทร์ขึ้นและตก และปฏิทินเหตุการณ์ 400 วันข้างหน้า
  ทั้งหมดไล่คำนวณจากตำแหน่งจริงในแผนที่นี้ ไม่ได้เปิดตารางสำเร็จรูป จึงอาจคลาดจาก
  ประกาศทางการได้ราวหนึ่งถึงสองชั่วโมง และไม่ได้บอกว่าอุปราคาแต่ละครั้งเป็นชนิดไหน</p>

  <h4>ยานอวกาศในแผนที่นี้</h4>
  <p>เจ็ดลำที่ดับเครื่องยนต์แล้วและบินตามแรงโน้มถ่วงล้วน ๆ วิถีจึงคำนวณล่วงหน้าได้แม่น
  ห้าลำแรกกำลังหลุดพ้นระบบสุริยะไปตลอด ส่วนกล้องเจมส์ เว็บบ์ คำนวณจากจุดสมดุล L2 ของ
  ระบบดวงอาทิตย์–โลกโดยตรง ตัวยานปั้นขึ้นด้วยรูปทรงพื้นฐานในโค้ด ไม่มีไฟล์โมเดลจากที่ใด
  และจะขยายให้พอมองเห็นเมื่อดูจากไกล แต่กลับไปเท่าขนาดจริงเมื่อซูมเข้าไปประชิด</p>

  <h4>การควบคุม</h4>
  <ul>
    <li>ลากเมาส์ = หมุนกล้อง · ล้อเลื่อน = ซูม · คลิกชื่อวัตถุ = เปลี่ยนเป้าหมาย</li>
    <li><code>เว้นวรรค</code> เล่น/หยุด · <code>←</code> <code>→</code> ปรับอัตราเร็วเวลา ·
        <code>F</code> ค้นหา · <code>N</code> กลับมาเวลาปัจจุบัน</li>
    <li><code>L</code> คัดลอกลิงก์ของมุมมองนี้ · <code>P</code> บันทึกภาพ PNG ·
        <code>T</code> ร่องรอยการเคลื่อนที่</li>
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
        All descriptive text here was written fresh. Asteroid and comet numbers come from JPL’s public
        Small-Body Database, copied into a file once rather than fetched when the page opens.</li>
    <li><b>No agency marks.</b> No space-agency logo, name or insignia appears — those are protected as
        trademarks quite separately from copyright.</li>
  </ul>

  <h4>Accuracy</h4>
  <p>Built on the standard J2000 approximate elements, good to arc-minutes between 1800 and 2050 — fine for
  teaching and presentation, not for flying a spacecraft. Moons use simplified ellipses in their parent’s
  equatorial plane. Body sizes are always true to scale unless “Enlarged” is switched on.</p>

  <h4>Beyond the solar system</h4>
  <p>The scale ladder now has ten rungs, from a planet’s surface out to the edge of the observable
  universe. Along the way: 1,356 real stars, 86 constellation figures, labels for the Milky Way’s spiral
  arms and our place in them, 17 neighbouring galaxies and clusters, and 646 exoplanets in 299 systems,
  each with a chart placing it beside our own solar system.</p>

  <h4>The stars around you are real</h4>
  <p>Every star within 32.6 light-years plus every bright star in the sky — 551 in all — placed at true
  three-dimensional positions from the CDS SIMBAD database. Brightness is computed from the distance to
  the camera, so stars dim and brighten as you move, and flying a few light-years out visibly distorts the
  constellations because nearby stars shift faster than distant ones. Click any star for its data.</p>

  <h4>The “Sky” tab</h4>
  <p>Pick a place on Earth and see which bodies are above the horizon at the displayed time, how high
  and in which direction, along with sunrise, sunset, moonrise, moonset and a calendar of the next
  400 days of sky events. All of it is scanned from the positions in this atlas rather than read from a
  published table, so times can be an hour or two off and the type of each eclipse is not identified.</p>

  <h4>Spacecraft in this atlas</h4>
  <p>Seven craft whose engines are done and which now coast on gravity alone, so their paths can be
  computed far ahead. Five are leaving the solar system for good; the James Webb telescope is placed
  from the Sun–Earth L2 point directly. The models are built from basic shapes in code — no model files
  from anywhere — and are enlarged enough to spot from far away, returning to true size as you close in.</p>

  <h4>Controls</h4>
  <ul>
    <li>Drag to orbit · scroll to zoom · click a label to retarget</li>
    <li><code>Space</code> play/pause · <code>←</code> <code>→</code> time rate ·
        <code>F</code> search · <code>N</code> back to now</li>
    <li><code>L</code> copy a link to this view · <code>P</code> save a PNG ·
        <code>T</code> motion trails</li>
  </ul>`
};
