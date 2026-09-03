/**
 * bkk-datacenter-data.js
 * ศูนย์ข้อมูล (Data Center) ในกรุงเทพมหานคร — ที่ตั้งจริง + ผลกระทบจริง
 *
 * ที่มาของข้อมูล
 *  • พิกัด/ที่อยู่สถานที่ : PeeringDB (ผู้ให้บริการลงทะเบียนเอง) + OpenStreetMap/Nominatim
 *  • รอยอาคาร Telehouse   : OpenStreetMap way/1457990503 (ของจริง)
 *  • สเปกความจุ           : เอกสารผู้ให้บริการ / ข่าวการลงทุน (ระบุแหล่งรายอาคารที่ฟิลด์ sources)
 *  • สถิติภาพรวม-ผลกระทบ  : กฟน., กปน., เครือข่าย JustPow, สำนักนายกฯ, BOI (ดู DC_IMPACT ท้ายไฟล์)
 *
 * หมายเหตุความซื่อตรงของข้อมูล: "รอยอาคาร" ของทุกแห่ง (ยกเว้น Telehouse) เป็น
 * มวลอาคารจำลอง (schematic massing) วางบนพิกัดจริง ไม่ใช่แปลนอาคารจริง —
 * ฟิลด์ footprintSource บอกกำกับไว้ทุกหลัง
 */
(function(root) {
  "use strict";

  /* สร้างรอยอาคารสี่เหลี่ยม (กว้าง w เมตร × ลึก d เมตร) หมุน rot องศา รอบจุด (lon,lat) */
  function rect(lon, lat, w, d, rot) {
    var mLon = 111320 * Math.cos(lat * Math.PI / 180), mLat = 110540;
    var r = (rot || 0) * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r);
    var hw = w / 2, hd = d / 2;
    var corners = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd], [-hw, -hd]];
    return corners.map(function(c) {
      var x = c[0] * cs - c[1] * sn, y = c[0] * sn + c[1] * cs;
      return [+(lon + x / mLon).toFixed(6), +(lat + y / mLat).toFixed(6)];
    });
  }

  /* จานสีตามสถานะโครงการ — ให้อ่านสถานะได้จากสีอาคารบนแผนที่ทันที */
  var TONE = {
    live:  { hall: "#22D3EE", util: "#0E7490", roof: "#A5F3FC", chip: "#0891B2", label: "เปิดให้บริการ" },
    build: { hall: "#F59E0B", util: "#B45309", roof: "#FDE68A", chip: "#D97706", label: "อยู่ระหว่างก่อสร้าง" },
    hold:  { hall: "#EF4444", util: "#991B1B", roof: "#FCA5A5", chip: "#DC2626", label: "ถูกระงับใบอนุญาต" },
    colo:  { hall: "#6366F1", util: "#3730A3", roof: "#C7D2FE", chip: "#4F46E5", label: "โคโลเคชันในอาคารสำนักงาน" }
  };

  var DATACENTERS = [
    {
      id: "stt-bkk1",
      name: "STT Bangkok 1",
      operator: "ST Telemedia Global Data Centres (Thailand)",
      operatorSite: "https://www.sttelemediagdc.com/th-en/locations/bangkok",
      kind: "standalone",
      status: "live",
      district: "บางกะปิ",
      location: "1 ถ.รามคำแหง ซ.28 แขวงหัวหมาก เขตบางกะปิ",
      lat: 13.75780, lon: 100.63180,
      itLoadMW: 20, itLoadMaxMW: 40,
      gfaM2: 30000, floors: 7, height: 38,
      campusM2: 75000,
      dieselLitres: null,
      opened: "2565",
      desc: "ศูนย์ข้อมูลไฮเปอร์สเกลแห่งแรกและใหญ่ที่สุดของไทยตอนเปิดตัว อาคาร 7 ชั้น พื้นที่ใช้สอย 30,000 ตร.ม. บนที่ดินรวม 75,000 ตร.ม. (ราว 15 ไร่) รองรับ IT load 20 เมกะวัตต์ และออกแบบให้ขยายได้ถึง 40 เมกะวัตต์",
      impactNote: "ที่ดินผืนเดียวกันกับ STT Bangkok 2 — เมื่อสร้างครบทั้งสองหลังจะเป็นกลุ่มศูนย์ข้อมูลที่ใช้ไฟมากที่สุดในเขตเมืองชั้นใน",
      footprintSource: "มวลอาคารจำลองบนพิกัดจริง (PeeringDB)",
      sources: [
        { label: "STT GDC — Bangkok", url: "https://www.sttelemediagdc.com/th-en/locations/bangkok" },
        { label: "PeeringDB fac", url: "https://www.peeringdb.com/" }
      ],
      shape: { w: 68, d: 64, rot: 12, utilW: 34, utilD: 20, utilDx: 52, utilDy: 0, utilH: 9 }
    },
    {
      id: "stt-bkk2",
      name: "STT Bangkok 2",
      operator: "ST Telemedia Global Data Centres (Thailand)",
      operatorSite: "https://www.sttelemediagdc.com/th-en/locations/bangkok",
      kind: "standalone",
      status: "build",
      district: "บางกะปิ",
      location: "ซ.รามคำแหง 28 แขวงหัวหมาก เขตบางกะปิ",
      lat: 13.75880, lon: 100.63270,
      itLoadMW: 24, itLoadMaxMW: 26,
      gfaM2: null, floors: 7, height: 40,
      campusM2: null,
      dieselLitres: 200000,
      opened: "คาดเปิดปลายปี 2569",
      desc: "อาคารแฝดของ STT Bangkok 1 เพิ่มความจุอีกราว 24–26 เมกะวัตต์ วางระบบรองรับการระบายความร้อนด้วยของเหลว (liquid cooling) สำหรับงาน AI ความหนาแน่นสูง มูลค่าลงทุนราว 200 ล้านดอลลาร์สหรัฐ",
      impactNote: "เป็นหนึ่งในจุดที่ กทม. ระบุว่าต้องตรวจสอบ — ได้รับอนุญาตเก็บน้ำมันดีเซลสำรอง 200,000 ลิตร (เพดานกฎหมาย 500,000 ลิตร สำหรับเดินเครื่องสำรอง 48 ชั่วโมง)",
      footprintSource: "มวลอาคารจำลองบนพิกัดจริง (Nominatim: ซ.รามคำแหง 28)",
      sources: [
        { label: "STT GDC — Bangkok", url: "https://www.sttelemediagdc.com/th-en/locations/bangkok" },
        { label: "THE STANDARD — เจาะ 10 ปมร้อน กทม. เบรก Data Center", url: "https://thestandard.co/bma-halt-data-center-eia-fuel/" }
      ],
      shape: { w: 62, d: 58, rot: 12, utilW: 30, utilD: 18, utilDx: -46, utilDy: 8, utilH: 9 }
    },
    {
      id: "telehouse-bkk",
      name: "Telehouse Bangkok",
      operator: "Telehouse (Thailand) — เครือ KDDI",
      operatorSite: "https://www.telehouse.net/bangkok/",
      kind: "standalone",
      status: "live",
      district: "ห้วยขวาง",
      location: "66 ถ.ริมคลองบางกะปิ แขวงบางกะปิ เขตห้วยขวาง",
      lat: 13.751533, lon: 100.573687,
      itLoadMW: 9.5, itLoadMaxMW: 21.5,
      gfaM2: 9000, floors: 6, height: 30,
      campusM2: null,
      dieselLitres: null,
      opened: "2555",
      desc: "ศูนย์ข้อมูลกลางของเครือ KDDI ญี่ปุ่น พื้นที่ 9,000 ตร.ม. กำลังไฟ 9.5 MVA · ปลายปี 2568 BOI อนุมัติโครงการส่วนขยาย IT load 12 เมกะวัตต์ มูลค่า 7,550 ล้านบาท สร้างติดกับอาคารเดิมในเขตห้วยขวาง",
      impactNote: "ห้วยขวางเป็นเขตที่มีศูนย์ข้อมูลหนาแน่นที่สุดในกรุงเทพฯ (9 โครงการ) ส่วนขยาย 12 MW นี้จะเพิ่มโหลดในเขตเดียวมากกว่าเท่าตัวของอาคารเดิม",
      footprintSource: "รอยอาคารจริงจาก OpenStreetMap (way/1457990503 · 3,301 ตร.ม.)",
      sources: [
        { label: "Telehouse Bangkok", url: "https://www.telehouse.net/bangkok/" },
        { label: "TNGlobal — Thailand approves $3.1B data center projects", url: "https://technode.global/2025/11/11/thailand-approves-3-1b-data-center-projects/" }
      ],
      /* รอยจริงจาก OSM — ไม่ใช้ rect() */
      ring: [
        [100.573383, 13.751751], [100.573378, 13.751718], [100.573441, 13.751709], [100.573411, 13.751505],
        [100.573340, 13.751515], [100.573327, 13.751427], [100.573386, 13.751419], [100.573381, 13.751385],
        [100.574141, 13.751281], [100.574161, 13.751418], [100.574091, 13.751428], [100.574106, 13.751527],
        [100.574179, 13.751517], [100.574196, 13.751640], [100.573383, 13.751751]
      ],
      shape: { utilW: 26, utilD: 16, utilDx: 0, utilDy: -34, utilH: 8 }
    },
    {
      id: "edgnex-bkk01",
      name: "EDGNEX BKK01",
      operator: "ดาเรีย ดาต้า เซ็นเตอร์ แอนด์ คลาวด์ เซอร์วิสเซส (เครือ DAMAC / EDGNEX)",
      operatorSite: "https://www.edgnex.com/",
      kind: "standalone",
      status: "hold",
      district: "ห้วยขวาง",
      location: "ซ.พระราม 9 ซอย 6 เขตห้วยขวาง (ห่าง รพ.พระราม 9 ราว 250 ม.)",
      lat: 13.75420, lon: 100.57320,
      itLoadMW: null, itLoadMaxMW: null,
      gfaM2: null, floors: 6, height: 32,
      campusM2: null,
      dieselLitres: null,
      opened: "ยังไม่เปิด",
      desc: "โครงการศูนย์ข้อมูลกลางย่านพระราม 9 ที่กลายเป็นปมร้อนเดือนสิงหาคม 2569 เพราะตั้งอยู่กลางชุมชนและใกล้โรงพยาบาลพระราม 9 — กทม. สั่งระงับการพิจารณาใบอนุญาตไว้ก่อน และกระทรวงพลังงานยังไม่ออกใบอนุญาตคลังน้ำมันสำรองให้",
      impactNote: "เป็น 1 ใน 3 โครงการ standalone ที่ กทม. สั่งเบรก จากทั้งหมด 6 โครงการที่ยื่นขอตั้งแต่ปี 2564–2565 (อีก 3 โครงการได้รับอนุญาตไปแล้ว)",
      footprintSource: "มวลอาคารจำลองบนพิกัดถนน (Nominatim: ซ.พระราม 9 ซอย 6)",
      sources: [
        { label: "THE STANDARD — เจาะ 10 ปมร้อน", url: "https://thestandard.co/bma-halt-data-center-eia-fuel/" },
        { label: "Thaiger — ชัชชาติสั่งเบรก Data Center รายใหม่", url: "https://thethaiger.com/th/news/1604750/" }
      ],
      shape: { w: 54, d: 46, rot: -8, utilW: 24, utilD: 16, utilDx: 40, utilDy: -6, utilH: 8 }
    },
    {
      id: "arise-ratchada",
      name: "Arise IDC — Midtown Ratchada",
      operator: "Arise IDC (True IDC)",
      operatorSite: "https://www.trueidc.com/",
      kind: "standalone",
      status: "live",
      district: "ห้วยขวาง",
      location: "ถ.รัชดาภิเษก เขตห้วยขวาง",
      lat: 13.765529, lon: 100.570072,
      itLoadMW: null, itLoadMaxMW: null,
      gfaM2: null, floors: 8, height: 34,
      campusM2: null,
      dieselLitres: null,
      opened: "เปิดให้บริการ",
      desc: "ศูนย์ข้อมูลกลางเมืองบนแนวรถไฟฟ้าใต้ดินสายสีน้ำเงิน ให้บริการโคโลเคชันและคลาวด์ในเครือ True IDC — จุดขายคือความหน่วงต่ำ (low latency) สำหรับลูกค้าองค์กรใจกลางกรุง",
      impactNote: "อยู่ในกลุ่มศูนย์ข้อมูล 9 แห่งของเขตห้วยขวาง ซึ่งเป็นเขตที่ กทม. ระบุว่าต้องทบทวนผังเมืองเป็นลำดับแรก",
      footprintSource: "มวลอาคารจำลองบนพิกัดจริง (PeeringDB)",
      sources: [{ label: "PeeringDB — Arise IDC Midtown Ratchada", url: "https://www.peeringdb.com/" }],
      shape: { w: 44, d: 40, rot: 20, utilW: 20, utilD: 14, utilDx: 34, utilDy: 0, utilH: 8 }
    },
    {
      id: "arise-pattanakarn",
      name: "Arise IDC — Midtown Pattanakarn",
      operator: "Arise IDC (True IDC)",
      operatorSite: "https://www.trueidc.com/",
      kind: "colo",
      status: "live",
      district: "สวนหลวง",
      location: "52 True Tower 2 ถ.พัฒนาการ เขตสวนหลวง",
      lat: 13.736351, lon: 100.622433,
      itLoadMW: null, itLoadMaxMW: null,
      gfaM2: null, floors: 26, height: 96,
      campusM2: null,
      dieselLitres: null,
      opened: "เปิดให้บริการ",
      desc: "โคโลเคชันในอาคารสำนักงาน True Tower 2 ถนนพัฒนาการ ให้บริการฝากเซิร์ฟเวอร์และเชื่อมต่อโครงข่ายในเครือ True",
      impactNote: "เป็นแบบ 'ศูนย์ข้อมูลในตึกสำนักงาน' ไม่ใช่อาคารเดี่ยว จึงไม่เข้าข่ายการขออนุญาตก่อสร้างแบบ standalone ที่ กทม. กำลังทบทวน",
      footprintSource: "มวลอาคารจำลองบนพิกัดจริง (PeeringDB)",
      sources: [{ label: "PeeringDB — Arise IDC Midtown Pattanakarn", url: "https://www.peeringdb.com/" }],
      shape: { w: 34, d: 30, rot: 5, utilW: 46, utilD: 40, utilDx: 0, utilDy: 0, utilH: 14 }
    },
    {
      id: "nt-bangrak",
      name: "NT Bangrak Tower (CAT Tower)",
      operator: "บมจ. โทรคมนาคมแห่งชาติ (NT) + PROEN IDC",
      operatorSite: "https://www.ntplc.co.th/",
      kind: "colo",
      status: "live",
      district: "บางรัก",
      location: "72 ถ.เจริญกรุง แขวงบางรัก เขตบางรัก",
      lat: 13.725487, lon: 100.515704,
      itLoadMW: null, itLoadMaxMW: null,
      gfaM2: null, floors: 34, height: 130,
      campusM2: null,
      dieselLitres: null,
      opened: "ให้บริการมานาน",
      desc: "อาคารโทรคมนาคมริมแม่น้ำเจ้าพระยา เป็น 'carrier hotel' — จุดเชื่อมต่อโครงข่ายและเคเบิลใต้น้ำระหว่างประเทศที่หนาแน่นที่สุดแห่งหนึ่งของไทย มีทั้งศูนย์ข้อมูลของ NT เองและผู้ให้บริการรายอื่นเช่า เช่น PROEN",
      impactNote: "เขตบางรักมีศูนย์ข้อมูล 5 โครงการ มากเป็นอันดับ 3 ของกรุงเทพฯ เพราะเป็นจุดรวมสายเคเบิลและโครงข่ายเดิม",
      footprintSource: "มวลอาคารจำลองบนพิกัดจริง (PeeringDB)",
      sources: [{ label: "PeeringDB — NT Bangrak Tower", url: "https://www.peeringdb.com/" }],
      shape: { w: 40, d: 40, rot: 30, utilW: 58, utilD: 52, utilDx: 0, utilDy: 0, utilH: 16 }
    },
    {
      id: "tcc-etdc",
      name: "TCC Technology ETDC",
      operator: "ทีซีซี เทคโนโลยี (TCC Technology)",
      operatorSite: "https://www.tcc-technology.com/",
      kind: "colo",
      status: "live",
      district: "สาทร",
      location: "อาคารเอ็มไพร์ทาวเวอร์ ชั้น 30 ถ.สาทรใต้",
      lat: 13.720794, lon: 100.53019,
      itLoadMW: null, itLoadMaxMW: null,
      gfaM2: null, floors: 58, height: 227,
      campusM2: null,
      dieselLitres: null,
      opened: "เปิดให้บริการ",
      desc: "ศูนย์ข้อมูลระดับองค์กรในอาคารเอ็มไพร์ทาวเวอร์ ย่านสาทร ให้บริการโคโลเคชันแก่สถาบันการเงินและองค์กรที่ต้องอยู่ใกล้ย่านธุรกิจ",
      impactNote: "เขตสาทรมี 2 โครงการ ทั้งคู่เป็นแบบอยู่ในอาคารสำนักงานเดิม ไม่ได้ก่อสร้างอาคารใหม่",
      footprintSource: "มวลอาคารจำลองบนพิกัดจริง (PeeringDB)",
      sources: [{ label: "PeeringDB — TCC Technology ETDC", url: "https://www.peeringdb.com/" }],
      shape: { w: 46, d: 46, rot: 15, utilW: 66, utilD: 58, utilDx: 0, utilDy: 0, utilH: 20 }
    },
    {
      id: "inet-idc1",
      name: "INET-IDC1",
      operator: "อินเทอร์เน็ตประเทศไทย (INET)",
      operatorSite: "https://www.inet.co.th/",
      kind: "colo",
      status: "live",
      district: "ราชเทวี",
      location: "108 อาคารบางกอกไทยทาวเวอร์ ถ.รางน้ำ เขตราชเทวี",
      lat: 13.758589, lon: 100.540589,
      itLoadMW: null, itLoadMaxMW: null,
      gfaM2: null, floors: 22, height: 82,
      campusM2: null,
      dieselLitres: null,
      opened: "เปิดให้บริการ",
      desc: "ศูนย์ข้อมูลแห่งแรกของ INET ในอาคารบางกอกไทยทาวเวอร์ ย่านรางน้ำ–อนุสาวรีย์ชัยสมรภูมิ ให้บริการโคโลเคชันและคลาวด์ภาครัฐ",
      impactNote: "เขตราชเทวีมีศูนย์ข้อมูล 1 โครงการ อยู่ในอาคารสำนักงานเดิมกลางย่านที่อยู่อาศัยหนาแน่น",
      footprintSource: "มวลอาคารจำลองบนพิกัดจริง (PeeringDB)",
      sources: [{ label: "PeeringDB — INET-IDC1", url: "https://www.peeringdb.com/" }],
      shape: { w: 32, d: 30, rot: -10, utilW: 44, utilD: 38, utilDx: 0, utilDy: 0, utilH: 12 }
    },
    {
      id: "ntt-bkk1",
      name: "NTT Bangkok 1 + TCC BNDC",
      operator: "NTT DATA Global Data Centers · TCC Technology",
      operatorSite: "https://services.global.ntt/",
      kind: "colo",
      status: "live",
      district: "บางนา",
      location: "1856 อาคารอินเตอร์ลิงค์ทาวเวอร์ 2 ถ.เทพรัตน (บางนา-ตราด กม.4.5)",
      lat: 13.66364, lon: 100.65174,
      itLoadMW: null, itLoadMaxMW: null,
      gfaM2: null, floors: 30, height: 112,
      campusM2: null,
      dieselLitres: null,
      opened: "เปิดให้บริการ",
      desc: "อาคารอินเตอร์ลิงค์ทาวเวอร์ 2 บางนา เป็นที่ตั้งของศูนย์ข้อมูลสองรายพร้อมกัน คือ NTT Bangkok 1 (BKK1) และ TCC BNDC ทำให้เป็นจุดเชื่อมต่อโครงข่ายสำคัญของกรุงเทพฯ ฝั่งตะวันออก",
      impactNote: "เขตบางนามีศูนย์ข้อมูล 6 โครงการ มากเป็นอันดับ 2 ของกรุงเทพฯ เพราะที่ดินถูกกว่าใจกลางเมืองและอยู่บนเส้นทางไป EEC",
      footprintSource: "มวลอาคารจำลองบนพิกัดจริง (Nominatim: Interlink Tower)",
      sources: [{ label: "PeeringDB — NTT Bangkok 1", url: "https://www.peeringdb.com/" }],
      shape: { w: 38, d: 34, rot: 25, utilW: 52, utilD: 46, utilDx: 0, utilDy: 0, utilH: 14 }
    },
    {
      id: "uih-bch4",
      name: "UIH BCH4 IDC",
      operator: "ยูไนเต็ด อินฟอร์เมชั่น ไฮเวย์ (UIH) — เครือเบญจจินดา",
      operatorSite: "https://www.uih.co.th/",
      kind: "colo",
      status: "live",
      district: "จตุจักร",
      location: "499 อาคารเบญจจินดา ถ.กำแพงเพชร 6 เขตจตุจักร",
      lat: 13.851158, lon: 100.562591,
      itLoadMW: null, itLoadMaxMW: null,
      gfaM2: null, floors: 14, height: 54,
      campusM2: null,
      dieselLitres: null,
      opened: "เปิดให้บริการ",
      desc: "ศูนย์ข้อมูลของ UIH ผู้ให้บริการโครงข่ายไฟเบอร์รายใหญ่ ตั้งอยู่ในอาคารสำนักงานเครือเบญจจินดา ถนนกำแพงเพชร 6 ใกล้สถานีกลางกรุงเทพอภิวัฒน์",
      impactNote: "เขตจตุจักรมีศูนย์ข้อมูล 1 โครงการ อยู่ในแนวโครงข่ายไฟเบอร์เลียบทางรถไฟสายเหนือ",
      footprintSource: "มวลอาคารจำลองบนพิกัดจริง (PeeringDB)",
      sources: [{ label: "PeeringDB — UIH BCH4", url: "https://www.peeringdb.com/" }],
      shape: { w: 40, d: 34, rot: -5, utilW: 54, utilD: 44, utilDx: 0, utilDy: 0, utilH: 12 }
    }
  ];

  /* ---------- ภาพรวมผลกระทบระดับกรุงเทพฯ (ใช้ในแผงข้อมูล) ---------- */
  var DC_IMPACT = {
    updated: "3 กันยายน 2569",
    projects: { total: 34, live: 24, building: 7, planned: 3, source: "เครือข่าย JustPow (รวบรวมจากข้อมูลสาธารณะ ข่าว และหน่วยงานที่เกี่ยวข้อง)" },
    districts: [
      { name: "ห้วยขวาง", n: 9 }, { name: "บางนา", n: 6 }, { name: "บางรัก", n: 5 },
      { name: "สาทร", n: 2 }, { name: "บึงกุ่ม", n: 2 }, { name: "บางกะปิ", n: 2 },
      { name: "จตุจักร", n: 1 }, { name: "ราชเทวี", n: 1 }, { name: "บางเขน", n: 1 },
      { name: "วัฒนา", n: 1 }, { name: "สวนหลวง", n: 1 }, { name: "ประเวศ", n: 1 }
    ],
    facts: [
      {
        key: "power",
        icon: "zap",
        title: "ไฟฟ้า",
        headline: "8–20 MW ต่อแห่ง",
        body: "การไฟฟ้านครหลวง (กฟน.) ระบุว่าศูนย์ข้อมูลในกรุงเทพฯ ใช้ไฟเฉลี่ยเพียง 8–20 เมกะวัตต์ต่อแห่ง ต่ำกว่าศูนย์ข้อมูลในพื้นที่ EEC ที่ 100 เมกะวัตต์ขึ้นไปมาก และเดินสายส่งเฉพาะ ไม่ได้แย่งไฟกับบ้านเรือน",
        sub: "ทั้งกรุงเทพฯ มีกำลังใช้จริงราว 145.8 MW แต่มีโครงการรออีก 902 MW",
        tone: "warn"
      },
      {
        key: "water",
        icon: "droplets",
        title: "น้ำ",
        headline: "~7,800 ลบ.ม./เดือน",
        body: "การประปานครหลวง (กปน.) ระบุว่าศูนย์ข้อมูลขนาดใหญ่ในกรุงเทพฯ ใช้น้ำราว 7,800 ลูกบาศก์เมตรต่อเดือน น้อยกว่าโรงพยาบาล (ราว 20,000) และศูนย์การค้า (30,000–40,000) น้ำหล่อเย็นไม่มีสารเคมีปนเปื้อน แต่ กทม. จะคุมอุณหภูมิก่อนปล่อยลงคลองสาธารณะเข้มขึ้น",
        sub: "เทียบ: โรงพยาบาล ~20,000 · ห้างสรรพสินค้า 30,000–40,000 ลบ.ม./เดือน",
        tone: "ok"
      },
      {
        key: "fuel",
        icon: "fuel",
        title: "คลังน้ำมันสำรอง",
        headline: "200,000 ลิตร/แห่ง",
        body: "ปมที่คนในชุมชนกังวลที่สุดคือถังดีเซลสำรองสำหรับเดินเครื่องกำเนิดไฟฟ้า 48 ชั่วโมง โครงการย่านพระราม 9 และรามคำแหง 28 ได้รับอนุญาตแห่งละ 200,000 ลิตร (ไม่ใช่ 400,000 ลิตรตามที่ลือกัน) ยังอยู่ใต้เพดานกฎหมาย 500,000 ลิตร",
        sub: "กระทรวงพลังงานสั่งหยุดออกใบอนุญาตคลังน้ำมันของศูนย์ข้อมูลรายใหม่ทั้งหมด",
        tone: "warn"
      },
      {
        key: "eia",
        icon: "shield-alert",
        title: "ช่องโหว่ EIA",
        headline: "ยื่นขอเป็น “คลังสินค้า”",
        body: "ไทยไม่เคยมีคำนิยาม “Data Center” ตามกฎหมายควบคุมอาคาร เอกชนจึงยื่นขออนุญาตในประเภท “คลังสินค้า” ซึ่งไม่ต้องจัดทำรายงานผลกระทบสิ่งแวดล้อม (EIA) สำนักนายกรัฐมนตรีเพิ่งออกคำนิยามอย่างเป็นทางการเมื่อ 13 สิงหาคม 2569 เพื่ออุดช่องโหว่นี้",
        sub: "กทม. อยู่ระหว่างปรับผังเมืองและกฎควบคุมอาคารให้สอดรับ",
        tone: "bad"
      },
      {
        key: "halt",
        icon: "triangle-alert",
        title: "มาตรการ กทม.",
        headline: "เบรก 3 จาก 6 โครงการ",
        body: "ตั้งแต่ปี 2564–2565 มีเอกชนยื่นขอสร้างศูนย์ข้อมูลแบบอาคารเดี่ยว (standalone) ในกรุงเทพฯ รวม 6 โครงการ อนุญาตไปแล้ว 3 โครงการ ส่วนอีก 3 โครงการถูกระงับการพิจารณาไว้ก่อน รอทบทวนมาตรฐาน",
        sub: "บอร์ดดาต้าเซ็นเตอร์แห่งชาติประชุมนัดแรก 4 กันยายน 2569",
        tone: "bad"
      },
      {
        key: "invest",
        icon: "banknote",
        title: "เม็ดเงินลงทุน",
        headline: "1.01 ล้านล้านบาท",
        body: "ปี 2568 BOI อนุมัติโครงการศูนย์ข้อมูล 26 โครงการ มูลค่าเกือบ 5 แสนล้านบาท พอถึงไตรมาสแรกปี 2569 คำขอรับส่งเสริมพุ่งเป็น 1.01 ล้านล้านบาท หรือราว 2.4 เท่าของปีก่อนหน้า",
        sub: "ค่าไฟอัตราใหม่สำหรับศูนย์ข้อมูลราว 5–6 บาท/หน่วย + วางหลักประกัน 4.5 ล้านบาทต่อเมกะวัตต์",
        tone: "ok"
      }
    ],
    timeline: [
      { date: "2564–2565", text: "เอกชนยื่นขอสร้างศูนย์ข้อมูลแบบอาคารเดี่ยวในกรุงเทพฯ รวม 6 โครงการ" },
      { date: "พ.ย. 2568", text: "BOI อนุมัติ 4 โครงการรวม ~376 MW (Telehouse 12 MW, Vistas 80 MW, DAMAC Digital 84 MW, Zenith)" },
      { date: "13 ส.ค. 2569", text: "สำนักนายกรัฐมนตรีออกคำนิยาม “Data Center” อย่างเป็นทางการ" },
      { date: "ส.ค. 2569", text: "กทม. สั่งระงับการพิจารณาใบอนุญาต 3 โครงการ · กระทรวงพลังงานหยุดออกใบอนุญาตคลังน้ำมันรายใหม่" },
      { date: "4 ก.ย. 2569", text: "บอร์ดดาต้าเซ็นเตอร์ประชุมนัดแรก เคาะหลักเกณฑ์ไฟฟ้า–น้ำ–ผังเมือง" }
    ],
    sources: [
      { label: "THE STANDARD — เจาะ 10 ปมร้อน กทม. สั่งเบรก Data Center", url: "https://thestandard.co/bma-halt-data-center-eia-fuel/" },
      { label: "เดลินิวส์ — ดาต้าเซนเตอร์ในกรุงเทพ 34 โครงการ (ข้อมูล JustPow)", url: "https://www.dailynews.co.th/news/6158132/" },
      { label: "Nation Thailand — Thailand's Data Centre Boom Tests the Grid", url: "https://www.nationthailand.com/business/tech/40070053" },
      { label: "Mongabay — Thai data center boom sparks water/air fears", url: "https://news.mongabay.com/2026/03/thai-data-center-boom-sparks-fears-of-water-shortage-air-pollution/" },
      { label: "PeeringDB — รายชื่อศูนย์ข้อมูลในไทย", url: "https://www.peeringdb.com/advanced_search?country=TH&reftag=fac" }
    ],
    caveat: "ตัวเลขที่ตัดออกโดยตั้งใจ: มีสื่อบางสำนักอ้างว่า “ศูนย์ข้อมูล 100 MW ใช้ไฟเท่าประชากร 13 ล้านคน” — ตรวจแล้วคลาดเคลื่อนคนละหลัก (100 MW ≈ 876 GWh/ปี ≈ ไฟฟ้าของคนไทยราว 3 แสนคน) จึงไม่นำมาแสดง"
  };

  /* ---------- ประกอบเป็น GeoJSON สำหรับ fill-extrusion ---------- */
  function build() {
    var polys = [], points = [];

    DATACENTERS.forEach(function(dc) {
      var tone = TONE[dc.status === "live" && dc.kind === "colo" ? "colo" : dc.status] || TONE.live;
      var s = dc.shape || {};
      var hallRing = dc.ring || rect(dc.lon, dc.lat, s.w || 44, s.d || 40, s.rot || 0);

      // 1) ลานเครื่องกำเนิดไฟฟ้า / เครื่องทำความเย็น (ฐานเตี้ยข้างอาคาร)
      if (s.utilW) {
        var mLon = 111320 * Math.cos(dc.lat * Math.PI / 180), mLat = 110540;
        var uLon = dc.lon + (s.utilDx || 0) / mLon, uLat = dc.lat + (s.utilDy || 0) / mLat;
        polys.push({
          type: "Feature",
          properties: {
            id: dc.id, name: dc.name, part: "utility", color: tone.util,
            height: s.utilH || 8, min_height: 0, status: dc.status
          },
          geometry: { type: "Polygon", coordinates: [rect(uLon, uLat, s.utilW, s.utilD, s.rot || 0)] }
        });
      }

      // 2) ตัวอาคารห้องเซิร์ฟเวอร์
      polys.push({
        type: "Feature",
        properties: {
          id: dc.id, name: dc.name, part: "hall", color: tone.hall,
          height: dc.height, min_height: 0, status: dc.status
        },
        geometry: { type: "Polygon", coordinates: [hallRing] }
      });

      // 3) ชุดระบายความร้อนบนดาดฟ้า (แผ่นบางย่อจากตัวอาคาร)
      var roofRing = dc.ring
        ? shrinkRing(dc.ring, dc.lon, dc.lat, 0.82)
        : rect(dc.lon, dc.lat, (s.w || 44) * 0.78, (s.d || 40) * 0.78, s.rot || 0);
      polys.push({
        type: "Feature",
        properties: {
          id: dc.id, name: dc.name, part: "roof", color: tone.roof,
          height: dc.height + (dc.kind === "standalone" ? 5 : 3), min_height: dc.height, status: dc.status
        },
        geometry: { type: "Polygon", coordinates: [roofRing] }
      });

      points.push({
        type: "Feature",
        properties: {
          id: dc.id, name: dc.name, status: dc.status, kind: dc.kind,
          chip: tone.chip, statusLabel: tone.label, height: dc.height,
          itLoadMW: dc.itLoadMW, district: dc.district
        },
        geometry: { type: "Point", coordinates: [dc.lon, dc.lat] }
      });
    });

    return {
      polygons: { type: "FeatureCollection", features: polys },
      points: { type: "FeatureCollection", features: points },
      rawList: DATACENTERS,
      impact: DC_IMPACT,
      tone: TONE
    };
  }

  /* ย่อรอยอาคารเข้าหาจุดศูนย์กลาง — ใช้ทำแผงระบายความร้อนบนดาดฟ้า */
  function shrinkRing(ring, cLon, cLat, k) {
    return ring.map(function(p) {
      return [+(cLon + (p[0] - cLon) * k).toFixed(6), +(cLat + (p[1] - cLat) * k).toFixed(6)];
    });
  }

  root.BKK_DATACENTERS = build();
})(typeof window !== "undefined" ? window : this);
