/**
 * bkk-zoning-data.js
 * ฐานข้อมูล "ผังสี กทม. (Bangkok Comprehensive Land Use Zoning)"
 * อ้างอิงตาม ผังเมืองรวมกรุงเทพมหานคร (Bangkok Comprehensive Plan)
 *
 * มีโครงสร้าง:
 * - categories: กลุ่มผังสี 7 กลุ่มหลัก (แดง, น้ำตาล, ส้ม, เหลือง, ม่วง, เขียว, น้ำเงิน)
 * - zones: รายละเอียดเจาะลึก 22 โซนสำคัญทั่ว กทม.
 * - farBonusRules: กฎเกณฑ์สิทธิโบนัส FAR สำหรับการพัฒนาอสังหาฯ และตึกสูง
 * - GeoJSON Polygons + Label Points
 */
(function(root) {
  "use strict";

  var CATEGORIES = {
    commercial: {
      id: "commercial",
      name: "ที่ดินประเภทพาณิชยกรรม",
      code: "พ.",
      color: "#EF4444",
      glowColor: "rgba(239, 68, 68, 0.4)",
      badgeBg: "#DC2626",
      desc: "ศูนย์กลางธุรกิจ การค้า บริการ สำนักงานใหญ่ และอาคารระฟ้า Supertall",
      farRange: "5.0 – 10.0",
      osrRange: "3.0% – 6.0%"
    },
    residential_high: {
      id: "residential_high",
      name: "ที่อยู่อาศัยหนาแน่นมาก",
      code: "ย.๘-ย.๑๐",
      color: "#92400E",
      glowColor: "rgba(146, 64, 14, 0.4)",
      badgeBg: "#78350F",
      desc: "ย่านคอนโดมิเนียม High-Rise และที่อยู่อาศัยใจกลางเมืองริมโครงข่ายรถไฟฟ้าหลัก",
      farRange: "6.0 – 8.0",
      osrRange: "4.0% – 5.0%"
    },
    residential_med: {
      id: "residential_med",
      name: "ที่อยู่อาศัยหนาแน่นปานกลาง",
      code: "ย.๕-ย.๗",
      color: "#F97316",
      glowColor: "rgba(249, 115, 22, 0.35)",
      badgeBg: "#EA580C",
      desc: "ย่านที่อยู่อาศัยชั้นกลางเมือง คอนโด Mid-to-High Rise และคอมมูนิตี้มอลล์",
      farRange: "4.0 – 5.0",
      osrRange: "6.0% – 7.0%"
    },
    residential_low: {
      id: "residential_low",
      name: "ที่อยู่อาศัยหนาแน่นน้อย",
      code: "ย.๑-ย.๔",
      color: "#EAB308",
      glowColor: "rgba(234, 179, 8, 0.35)",
      badgeBg: "#CA8A04",
      desc: "ย่านชานเมือง บ้านเดี่ยว ทาวน์โฮม และชุมชนพักอาศัยสภาพแวดล้อมสงบ",
      farRange: "1.5 – 3.0",
      osrRange: "10.0% – 20.0%"
    },
    industrial: {
      id: "industrial",
      name: "ที่ดินประเภทอุตสาหกรรม",
      code: "อ.๑-อ.๓",
      color: "#A855F7",
      glowColor: "rgba(168, 85, 247, 0.35)",
      badgeBg: "#9333EA",
      desc: "ย่านนิคมอุตสาหกรรม คลังสินค้า และศูนย์กระจายสินค้าโลจิสติกส์",
      farRange: "1.5 – 2.5",
      osrRange: "20.0% – 30.0%"
    },
    rural_conservation: {
      id: "rural_conservation",
      name: "ชนบท เกษตรกรรม & ฟลัดเวย์",
      code: "ก.๑-ก.๕",
      color: "#22C55E",
      glowColor: "rgba(34, 197, 94, 0.35)",
      badgeBg: "#16A34A",
      desc: "พื้นที่อนุรักษ์วิถีเกษตรกรรม ป่าชายเลน และทางระบายน้ำหลาก (Floodway) ป้องกันน้ำท่วม",
      farRange: "1.0 – 2.0",
      osrRange: "20.0% – 40.0%"
    },
    government: {
      id: "government",
      name: "สถาบันราชการและสาธารณูปโภค",
      code: "ส.",
      color: "#3B82F6",
      glowColor: "rgba(59, 130, 246, 0.35)",
      badgeBg: "#2563EB",
      desc: "สถานที่ราชการ หน่วยงานรัฐ วัง วัดสำคัญ รัฐสภา และระบบโครงสร้างพื้นฐาน",
      farRange: "ตามระเบียบ",
      osrRange: "ตามระเบียบ"
    }
  };

  var FAR_BONUS_RULES = [
    {
      id: "tod",
      name: "การพัฒนาใกล้สถานีรถไฟฟ้า (TOD)",
      desc: "แปลงที่ดินตั้งอยู่ในรัศมี 500 เมตร จากทางขึ้น-ลงสถานีรถไฟฟ้าขนส่งมวลชน",
      maxBonusPercent: 20,
      icon: "train-front"
    },
    {
      id: "public_open_space",
      name: "การจัดพื้นที่โล่งสาธารณะระดับดิน (Public Realm)",
      desc: "จัดให้มีลานพักผ่อน สวนสาธารณะ หรือทางเดินสาธารณะเปิดโล่งตลอด 24 ชม.",
      maxBonusPercent: 20,
      icon: "trees"
    },
    {
      id: "retention_basin",
      name: "พื้นที่กักเก็บน้ำฝนหน่วงน้ำ (แก้มลิงในอาคาร)",
      desc: "มีบ่อกักเก็บน้ำฝนชั่วคราวไม่น้อยกว่า 1 ลูกบาศก์เมตรต่อพื้นที่ดิน 50 ตร.ม.",
      maxBonusPercent: 10,
      icon: "waves"
    },
    {
      id: "green_building",
      name: "อาคารเขียวมาตรฐานสากล (LEED / TREES)",
      desc: "ได้รับการรับรองอาคารประหยัดพลังงานระดับ Gold หรือ Platinum",
      maxBonusPercent: 10,
      icon: "leaf"
    }
  ];

  var ZONES = [
    {
      id: "zone-red-cbd",
      code: "พ.๕-๑",
      title: "สีลม – สาทร – พระราม 4 – วิทยุ (Core CBD)",
      category: "commercial",
      color: "#DC2626",
      far: 10.0,
      osr: 3.0,
      maxHeightNote: "ไม่จำกัดความสูง (สร้าง Supertall ได้) ตาม EIA",
      landmarks: ["Signature Tower (One Bangkok)", "King Power Mahanakhon", "Dusit Central Park", "Empire Tower"],
      desc: "ศูนย์กลางเศรษฐกิจ การเงิน และสำนักงานใหญ่ระดับนานาชาติที่หนาแน่นที่สุดในไทย มีค่า FAR สูงสุด อนุญาตให้สร้างอาคารสูงพิเศษและมิกซ์ยูสระดับโลก",
      center: [100.5385, 13.7265],
      coordinates: [
        [100.5240, 13.7200],
        [100.5520, 13.7230],
        [100.5515, 13.7340],
        [100.5360, 13.7360],
        [100.5250, 13.7310],
        [100.5240, 13.7200]
      ]
    },
    {
      id: "zone-red-siam",
      code: "พ.๕-๒",
      title: "สยาม – ปทุมวัน – ราชประสงค์ – ชิดลม",
      category: "commercial",
      color: "#DC2626",
      far: 10.0,
      osr: 3.0,
      maxHeightNote: "สอดคล้องแนวเสด็จฯ และข้อจำกัดเขตพระราชฐานบางจุด",
      landmarks: ["Siam Paragon", "CentralWorld", "Gaysorn Village"],
      desc: "ศูนย์กลางการค้าระดับพรีเมียมและแหล่งช้อปปิ้งชั้นนำของเอเชียตะวันออกเฉียงใต้ เชื่อมต่อระบบ Skywalk ลอยฟ้าที่ยาวที่สุด",
      center: [100.5390, 13.7455],
      coordinates: [
        [100.5280, 13.7420],
        [100.5480, 13.7420],
        [100.5480, 13.7500],
        [100.5280, 13.7500],
        [100.5280, 13.7420]
      ]
    },
    {
      id: "zone-red-sukhumvit-asoke",
      code: "พ.๕-๓",
      title: "สุขุมวิทตอนต้น – อโศกมนตรี – พร้อมพงษ์",
      category: "commercial",
      color: "#DC2626",
      far: 10.0,
      osr: 3.0,
      maxHeightNote: "สร้างอาคารระฟ้าและมิกซ์ยูสขนาดใหญ่พิเศษได้",
      landmarks: ["The EM District (Emporium / EmQuartier / Emsphere)", "Exchange Tower", "Terminal 21"],
      desc: "ย่านธุรกิจหนาแน่นสูงจุดตัด BTS-MRT อโศก รายล้อมด้วยโรงแรม 5 ดาว ศูนย์การค้าลักชัวรี และอาคารสำนักงานข้ามชาติ",
      center: [100.5630, 13.7350],
      coordinates: [
        [100.5530, 13.7280],
        [100.5730, 13.7280],
        [100.5730, 13.7430],
        [100.5530, 13.7430],
        [100.5530, 13.7280]
      ]
    },
    {
      id: "zone-red-rama9",
      code: "พ.๕-๔",
      title: "พระราม 9 – รัชดาภิเษก (New CBD)",
      category: "commercial",
      color: "#DC2626",
      far: 10.0,
      osr: 3.0,
      maxHeightNote: "รองรับอาคารสูงพิเศษ มีระยะเว้นรอบสถานทูตจีน",
      landmarks: ["G Tower", "Central Rama 9", "ตลาดหลักทรัพย์แห่งประเทศไทย (SET)"],
      desc: "ย่านศูนย์กลางเศรษฐกิจใหม่ เชื่อมโยงกลุ่มทุนข้ามชาติ การเงิน และเทคโนโลยี มีโครงข่าย MRT สายสีน้ำเงินและสีส้มในอนาคต",
      center: [100.5690, 13.7580],
      coordinates: [
        [100.5620, 13.7500],
        [100.5780, 13.7500],
        [100.5780, 13.7690],
        [100.5620, 13.7690],
        [100.5620, 13.7500]
      ]
    },
    {
      id: "zone-red-bangkapi",
      code: "พ.๓-๑",
      title: "บางกะปิ – รามคำแหง – ลำสาลี",
      category: "commercial",
      color: "#EF4444",
      far: 7.0,
      osr: 4.5,
      maxHeightNote: "อาคารพาณิชย์ขนาดใหญ่และอาคารชุดพักอาศัย",
      landmarks: ["The Mall Lifestore Bangkapi", "สถานีร่วมลำสาลี (สายสีส้ม/เหลือง/น้ำตาล)"],
      desc: "ศูนย์ชุมชนพาณิชยกรรมฝั่งกรุงเทพฯ ตะวันออก จุดเชื่อมต่อรถไฟฟ้า 3 สาย",
      center: [100.6450, 13.7650],
      coordinates: [
        [100.6300, 13.7550],
        [100.6600, 13.7550],
        [100.6600, 13.7750],
        [100.6300, 13.7750],
        [100.6300, 13.7550]
      ]
    },
    {
      id: "zone-brown-thonglor-ekkamai",
      code: "ย.๙-๑",
      title: "ทองหล่อ – เอกมัย – พระโขนง",
      category: "residential_high",
      color: "#92400E",
      far: 7.0,
      osr: 4.5,
      maxHeightNote: "คอนโด High-Rise ในซอยต้องมีเขตทางกว้างไม่น้อยกว่า 10 หรือ 18 ม.",
      landmarks: ["The Monument Thong Lo", "Park Origin Thonglor"],
      desc: "ทำเลคอนโดมิเนียมซูเปอร์ลักชัวรียอดนิยมของคนเมืองและชาวต่างชาติ แหล่งรวมไลฟ์สไตล์ ไดนิ่ง และคอมมูนิตี้มอลล์มีระดับ",
      center: [100.5840, 13.7320],
      coordinates: [
        [100.5740, 13.7180],
        [100.5960, 13.7180],
        [100.5960, 13.7450],
        [100.5740, 13.7450],
        [100.5740, 13.7180]
      ]
    },
    {
      id: "zone-brown-phahon-ari",
      code: "ย.๙-๒",
      title: "พญาไท – อารีย์ – สะพานควาย",
      category: "residential_high",
      color: "#92400E",
      far: 7.0,
      osr: 4.5,
      maxHeightNote: "รองรับอาคารชุดและสำนักงานขนาดใหญ่พิเศษ",
      landmarks: ["Pearl Bangkok", "โรงพยาบาลพญาไท 2", "กระทรวงการคลัง"],
      desc: "ทำเลที่อยู่อาศัยคุณภาพสูงริมถนนพหลโยธิน บรรยากาศเงียบสงบพร้อมสิ่งอำนวยความสะดวกครบครัน",
      center: [100.5420, 13.7780],
      coordinates: [
        [100.5330, 13.7560],
        [100.5520, 13.7560],
        [100.5520, 13.7980],
        [100.5330, 13.7980],
        [100.5330, 13.7560]
      ]
    },
    {
      id: "zone-brown-bangsue",
      code: "ย.๑๐-๑",
      title: "บางซื่อ – สถานีกลางกรุงเทพอภิวัฒน์ – จตุจักร",
      category: "residential_high",
      color: "#78350F",
      far: 8.0,
      osr: 4.0,
      maxHeightNote: "ศูนย์กลาง TOD ใหญ่ที่สุดในอาเซียน",
      landmarks: ["Krung Thep Aphiwat Central Terminal", "SCG Head Office"],
      desc: "มหานครระบบราง ศูนย์กลางโครงข่ายรถไฟทางไกล รถไฟฟ้าความเร็วสูง และรถไฟชานเมืองสายสีแดง",
      center: [100.5380, 13.8050],
      coordinates: [
        [100.5220, 13.7950],
        [100.5580, 13.7950],
        [100.5580, 13.8250],
        [100.5220, 13.8250],
        [100.5220, 13.7950]
      ]
    },
    {
      id: "zone-brown-thonburi",
      code: "ย.๘-๑",
      title: "ธนบุรี – วงเวียนใหญ่ – คลองสาน – เจริญนคร",
      category: "residential_high",
      color: "#92400E",
      far: 6.0,
      osr: 5.0,
      maxHeightNote: "ริมฝั่งแม่น้ำเจ้าพระยา ติดข้อบังคับระยะร่นริมตลิ่ง 45 ม.",
      landmarks: ["ICONSIAM & Magnolias Waterfront", "The River", "Four Seasons Private Residences"],
      desc: "ศูนย์กลางฝั่งธนบุรีริมแม่น้ำเจ้าพระยา เชื่อมต่อสะพานตากสิน BTS สายสีลม และสายสีทอง",
      center: [100.5050, 13.7220],
      coordinates: [
        [100.4900, 13.7080],
        [100.5180, 13.7080],
        [100.5180, 13.7380],
        [100.4900, 13.7380],
        [100.4900, 13.7080]
      ]
    },
    {
      id: "zone-orange-ratchada-ladprao",
      code: "ย.๗-๑",
      title: "รัชดาภิเษก – สุทธิสาร – ห้วยขวาง – ลาดพร้าว",
      category: "residential_med",
      color: "#EA580C",
      far: 5.0,
      osr: 6.0,
      maxHeightNote: "คอนโดมิเนียม Mid-to-High Rise สูง 20–35 ชั้น",
      landmarks: ["ศูนย์วัฒนธรรมแห่งประเทศไทย", "ตลาดห้วยขวาง", "Central Ladprao"],
      desc: "ย่านที่อยู่อาศัยยอดนิยมของคนทำงานรุ่นใหม่ คึกคักตลอด 24 ชั่วโมง ขนานไปตามแนว MRT สายสีน้ำเงิน",
      center: [100.5750, 13.7850],
      coordinates: [
        [100.5600, 13.7700],
        [100.5950, 13.7700],
        [100.5950, 13.8200],
        [100.5600, 13.8200],
        [100.5600, 13.7700]
      ]
    },
    {
      id: "zone-orange-charan",
      code: "ย.๖-๑",
      title: "จรัญสนิทวงศ์ – บางพลัด – บางอ้อ",
      category: "residential_med",
      color: "#F97316",
      far: 4.5,
      osr: 6.5,
      maxHeightNote: "คอนโดแนวรถไฟฟ้าสายสีน้ำเงินฝั่งธนบุรี",
      landmarks: ["โรงพยาบาลยันฮี", "สะพานพระราม 7"],
      desc: "ย่านที่อยู่อาศัยฝั่งธนบุรีตอนบน พัฒนาอย่างรวดเร็วหลังการเปิดให้บริการรถไฟฟ้าสายสีน้ำเงินวงแหวน",
      center: [100.5050, 13.7920],
      coordinates: [
        [100.4850, 13.7650],
        [100.5200, 13.7650],
        [100.5200, 13.8200],
        [100.4850, 13.8200],
        [100.4850, 13.7650]
      ]
    },
    {
      id: "zone-orange-bangna",
      code: "ย.๗-๒",
      title: "บางนา – อุดมสุข – แบริ่ง",
      category: "residential_med",
      color: "#EA580C",
      far: 5.0,
      osr: 6.0,
      maxHeightNote: "คอนโดใกล้ทางด่วนและรถไฟฟ้าสายสีเขียว",
      landmarks: ["BITEC Bangna", "True Digital Park", "Mega Bangna Gateway"],
      desc: "ประตูสู่อีอีซี (EEC) รองรับการขยายตัวของกรุงเทพฯ ฝั่งตะวันออก มีเมกะโปรเจกต์มิกซ์ยูสเกิดขึ้นหนาแน่น",
      center: [100.6150, 13.6750],
      coordinates: [
        [100.5950, 13.6550],
        [100.6450, 13.6550],
        [100.6450, 13.7000],
        [100.5950, 13.7000],
        [100.5950, 13.6550]
      ]
    },
    {
      id: "zone-yellow-talingchan",
      code: "ย.๒-๑",
      title: "ตลิ่งชัน – ราชพฤกษ์ – บางแค",
      category: "residential_low",
      color: "#CA8A04",
      far: 2.0,
      osr: 15.0,
      maxHeightNote: "บ้านเดี่ยวระดับ Luxury/Super Luxury สภาพแวดล้อมสีเขียว",
      landmarks: ["ตลาดน้ำตลิ่งชัน", "The Circle Ratchapruk"],
      desc: "ย่านที่อยู่อาศัยแนวราบระดับบน อากาศดี การเดินทางสะดวกด้วยถนนราชพฤกษ์และบรมราชชนนี",
      center: [100.4400, 13.7650],
      coordinates: [
        [100.4100, 13.7400],
        [100.4700, 13.7400],
        [100.4700, 13.7950],
        [100.4100, 13.7950],
        [100.4100, 13.7400]
      ]
    },
    {
      id: "zone-yellow-saimai",
      code: "ย.๓-๑",
      title: "สายไหม – วัชรพล – สุขาภิบาล 5",
      category: "residential_low",
      color: "#EAB308",
      far: 2.5,
      osr: 12.5,
      maxHeightNote: "บ้านเดี่ยวและทาวน์โฮมชานเมือง",
      landmarks: ["ตลาดยิ่งเจริญ", "ทางด่วนฉลองรัช (รามอินทรา-อาจณรงค์)"],
      desc: "ชุมชนอยู่อาศัยแนวราบขนาดใหญ่ของกรุงเทพฯ ตอนเหนือ มีการเข้าถึงผ่านทางด่วนและรถไฟฟ้าสายสีเขียว",
      center: [100.6500, 13.9050],
      coordinates: [
        [100.6150, 13.8800],
        [100.6900, 13.8800],
        [100.6900, 13.9350],
        [100.6150, 13.9350],
        [100.6150, 13.8800]
      ]
    },
    {
      id: "zone-yellow-prawet",
      code: "ย.๔-๑",
      title: "ประเวศ – สวนหลวง ร.๙ – พัฒนาการ",
      category: "residential_low",
      color: "#CA8A04",
      far: 3.0,
      osr: 10.0,
      maxHeightNote: "บ้านเดี่ยวโครงการใหญ่ ทาวน์โฮม และคอนโด Low-Rise",
      landmarks: ["สวนหลวง ร.๙", "บึงหนองบอน", "Seacon Square"],
      desc: "พื้นที่อยู่อาศัยคุณภาพสูงใกล้สวนสาธารณะขนาดใหญ่และศูนย์กีฬาทางน้ำบึงหนองบอน",
      center: [100.6650, 13.6950],
      coordinates: [
        [100.6400, 13.6700],
        [100.7000, 13.6700],
        [100.7000, 13.7250],
        [100.6400, 13.7250],
        [100.6400, 13.6700]
      ]
    },
    {
      id: "zone-purple-latkrabang",
      code: "อ.๑-๑",
      title: "นิคมอุตสาหกรรมลาดกระบัง – สุวรรณภูมิเหนือ",
      category: "industrial",
      color: "#9333EA",
      far: 2.0,
      osr: 20.0,
      maxHeightNote: "โรงงานอุตสาหกรรม คลังสินค้า ICD ลาดกระบัง",
      landmarks: ["นิคมอุตสาหกรรมลาดกระบัง", "ICD ลาดกระบัง", "สจล. (KMITL)"],
      desc: "ศูนย์กลางโลจิสติกส์และการผลิตส่งออก ใกล้ท่าอากาศยานสุวรรณภูมิและโครงข่ายมอเตอร์เวย์",
      center: [100.7850, 13.7450],
      coordinates: [
        [100.7500, 13.7150],
        [100.8250, 13.7150],
        [100.8250, 13.7750],
        [100.7500, 13.7750],
        [100.7500, 13.7150]
      ]
    },
    {
      id: "zone-purple-bangkhunthian",
      code: "อ.๒-๑",
      title: "บางขุนเทียน – ท่าข้าม – แสมดำ",
      category: "industrial",
      color: "#9333EA",
      far: 2.5,
      osr: 20.0,
      maxHeightNote: "โรงงานอุตสาหกรรมขนาดกลางและขนาดย่อม (SME)",
      landmarks: ["เซ็นทรัล พระราม 2", "โรงงานอุตสาหกรรมแสมดำ"],
      desc: "แหล่งอุตสาหกรรมและแปรรูปอาหารฝั่งธนบุรีตอนล่าง เชื่อมต่อถนนพระราม 2 สู่ภาคใต้",
      center: [100.4150, 13.6250],
      coordinates: [
        [100.3700, 13.5900],
        [100.4500, 13.5900],
        [100.4500, 13.6550],
        [100.3700, 13.6550],
        [100.3700, 13.5900]
      ]
    },
    {
      id: "zone-green-nongchok",
      code: "ก.๑-๑",
      title: "หนองจอก – คลองสามวา (ฟลัดเวย์ระบายน้ำฝั่งตะวันออก)",
      category: "rural_conservation",
      color: "#16A34A",
      far: 1.0,
      osr: 40.0,
      maxHeightNote: "ห้ามจัดสรรที่ดินแปลงย่อยต่ำกว่า 100–400 ตร.ว. ป้องกันการขวางทางน้ำ",
      landmarks: ["คลองแสนแสบตอนปลาย", "ศูนย์กีฬาบางกอกอารีนา"],
      desc: "พื้นที่อนุรักษ์ชนบทและเกษตรกรรม ทำหน้าที่เป็นแนวทางระบายน้ำหลาก (Floodway) หลักจากภาคกลางตอนบนลงสู่อ่าวไทย",
      center: [100.8550, 13.8450],
      coordinates: [
        [100.8000, 13.7800],
        [100.9100, 13.7800],
        [100.9100, 13.9100],
        [100.8000, 13.9100],
        [100.8000, 13.7800]
      ]
    },
    {
      id: "zone-green-thawiwatthana",
      code: "ก.๒-๑",
      title: "ทวีวัฒนา – คลองมหาสวัสดิ์",
      category: "rural_conservation",
      color: "#16A34A",
      far: 1.0,
      osr: 40.0,
      maxHeightNote: "อนุรักษ์สวนเกษตรและทางระบายน้ำฝั่งตะวันตก",
      landmarks: ["สวนพุทธมณฑล (เขตติดต่อ)", "คลองทวีวัฒนา"],
      desc: "พื้นที่กันชนระบายน้ำฝั่งตะวันตก อุดมด้วยสวนผลไม้และพื้นที่สีเขียวเปิดโล่งตามธรรมชาติ",
      center: [100.3550, 13.7750],
      coordinates: [
        [100.3200, 13.7300],
        [100.3800, 13.7300],
        [100.3800, 13.8150],
        [100.3200, 13.8150],
        [100.3200, 13.7300]
      ]
    },
    {
      id: "zone-green-bangkhunthian-coast",
      code: "ก.๔-๑",
      title: "ชายทะเลบางขุนเทียน (แนวป่าชายเลน)",
      category: "rural_conservation",
      color: "#16A34A",
      far: 2.0,
      osr: 20.0,
      maxHeightNote: "จำกัดการก่อสร้างติดชายฝั่ง อนุรักษ์ระบบนิเวศป่าชายเลน",
      landmarks: ["สะพานรักษ์ทะเลบางขุนเทียน", "หลักเขตกรุงเทพฯ ในทะเล"],
      desc: "พื้นที่ชายฝั่งทะเลผืนเดียวของ กทม. แหล่งนิเวศวิทยาป่าชายเลน สัตว์น้ำ และแนวป้องกันการกัดเซาะชายฝั่ง",
      center: [100.4350, 13.5450],
      coordinates: [
        [100.3850, 13.5000],
        [100.4900, 13.5000],
        [100.4900, 13.5850],
        [100.3850, 13.5850],
        [100.3850, 13.5000]
      ]
    },
    {
      id: "zone-blue-rattanakosin",
      code: "ส.-๑",
      title: "เกาะรัตนโกสินทร์ – ดุสิต (เขตประวัติศาสตร์และราชการ)",
      category: "government",
      color: "#2563EB",
      far: "ตามระเบียบ",
      osr: "ตามระเบียบ",
      maxHeightNote: "จำกัดความสูงไม่เกิน 16–24 เมตร เพื่ออนุรักษ์ทัศนียภาพรอบเกาะรัตนโกสินทร์",
      landmarks: ["พระบรมมหาราชวัง", "วัดพระแก้ว", "สนามหลวง", "พระที่นั่งอนันตสมาคม"],
      desc: "ศูนย์กลางประวัติศาสตร์ ศิลปวัฒนธรรม และศูนย์บริหารราชการแผ่นดินแห่งกรุงรัตนโกสินทร์ มีการควบคุมความสูงและสถาปัตยกรรมเข้มงวดที่สุด",
      center: [100.4980, 13.7550],
      coordinates: [
        [100.4850, 13.7400],
        [100.5180, 13.7400],
        [100.5180, 13.7750],
        [100.4850, 13.7750],
        [100.4850, 13.7400]
      ]
    },
    {
      id: "zone-blue-chaengwatthana",
      code: "ส.-๒",
      title: "ศูนย์ราชการเฉลิมพระเกียรติฯ แจ้งวัฒนะ",
      category: "government",
      color: "#2563EB",
      far: "ตามระเบียบ",
      osr: "ตามระเบียบ",
      maxHeightNote: "อาคารราชการรวมขนาดใหญ่พิเศษ",
      landmarks: ["ศูนย์ราชการฯ อาคาร A-B-C", "ศาลรัฐธรรมนูญ", "DSI"],
      desc: "ศูนย์รวมหน่วยงานราชการระดับกระทรวง กรม และองค์กรอิสระ มีรถไฟฟ้าสายสีชมพูเชื่อมต่อตรง",
      center: [100.5650, 13.8820],
      coordinates: [
        [100.5480, 13.8700],
        [100.5850, 13.8700],
        [100.5850, 13.8960],
        [100.5480, 13.8960],
        [100.5480, 13.8700]
      ]
    }
  ];

  function buildGeoJSON() {
    var polygonFeatures = [];
    var pointFeatures = [];

    ZONES.forEach(function(z) {
      var cat = CATEGORIES[z.category] || CATEGORIES.commercial;
      polygonFeatures.push({
        type: "Feature",
        id: z.id,
        properties: {
          id: z.id,
          code: z.code,
          title: z.title,
          category: z.category,
          categoryName: cat.name,
          color: z.color || cat.color,
          far: z.far,
          osr: z.osr,
          maxHeightNote: z.maxHeightNote,
          desc: z.desc,
          landmarks: (z.landmarks || []).join(", ")
        },
        geometry: {
          type: "Polygon",
          coordinates: [z.coordinates]
        }
      });

      pointFeatures.push({
        type: "Feature",
        id: z.id + "-label",
        properties: {
          id: z.id,
          code: z.code,
          title: z.title,
          color: z.color || cat.color,
          badgeBg: cat.badgeBg
        },
        geometry: {
          type: "Point",
          coordinates: z.center
        }
      });
    });

    return {
      polygons: { type: "FeatureCollection", features: polygonFeatures },
      points: { type: "FeatureCollection", features: pointFeatures },
      categories: CATEGORIES,
      zones: ZONES,
      bonusRules: FAR_BONUS_RULES
    };
  }

  root.BKK_ZONING_DATA = buildGeoJSON();
})(typeof window !== "undefined" ? window : this);
