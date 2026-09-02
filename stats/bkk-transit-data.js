/**
 * bkk-transit-data.js
 * โครงข่ายระบบขนส่งมวลชนทางราง 10 สาย กรุงเทพฯ และปริมณฑล
 * รวมเส้นทาง LineString และพิกัดสถานีพร้อมรหัสสถานี (Station Code)
 */
(function(root) {
  "use strict";

  var LINES = [
    {
      id: "bts-sukhumvit",
      name: "BTS สายสุขุมวิท",
      nameEn: "BTS Sukhumvit Line",
      operator: "BTS",
      color: "#62BB46",
      stations: [
        { code: "N24", name: "คูคต", nameEn: "Khu Khot", coords: [100.6455, 13.9322] },
        { code: "N23", name: "แยก คปอ.", nameEn: "Yaek Kor Por Aor", coords: [100.6278, 13.9238] },
        { code: "N22", name: "พิพิธภัณฑ์กองทัพอากาศ", nameEn: "Royal Thai Air Force Museum", coords: [100.6198, 13.9135] },
        { code: "N21", name: "โรงพยาบาลภูมิพลอดุลยเดช", nameEn: "Bhumibol Adulyadej Hospital", coords: [100.6127, 13.9038] },
        { code: "N20", name: "สะพานใหม่", nameEn: "Saphan Mai", coords: [100.6058, 13.8962] },
        { code: "N19", name: "สายหยุด", nameEn: "Sai Yud", coords: [100.6009, 13.8878] },
        { code: "N18", name: "พหลโยธิน 59", nameEn: "Phahon Yothin 59", coords: [100.5971, 13.8805] },
        { code: "N17", name: "วัดพระศรีมหาธาตุ", nameEn: "Wat Phra Sri Mahathat", coords: [100.5952, 13.8742], interchange: ["mrt-pink"] },
        { code: "N16", name: "กรมทหารราบที่ 11", nameEn: "11th Infantry Regiment", coords: [100.5902, 13.8635] },
        { code: "N15", name: "บางบัว", nameEn: "Bang Bua", coords: [100.5847, 13.8558] },
        { code: "N14", name: "กรมป่าไม้", nameEn: "Royal Forest Department", coords: [100.5799, 13.8488] },
        { code: "N13", name: "มหาวิทยาลัยเกษตรศาสตร์", nameEn: "Kasetsart University", coords: [100.5748, 13.8402] },
        { code: "N12", name: "เสนานิคม", nameEn: "Sena Nikhom", coords: [100.5714, 13.8344] },
        { code: "N11", name: "รัชโยธิน", nameEn: "Ratchayothin", coords: [100.5682, 13.8291] },
        { code: "N10", name: "พหลโยธิน 24", nameEn: "Phahon Yothin 24", coords: [100.5645, 13.8218] },
        { code: "N9", name: "ห้าแยกลาดพร้าว", nameEn: "Ha Yaek Lat Phrao", coords: [100.5602, 13.8157], interchange: ["mrt-blue"] },
        { code: "N8", name: "หมอชิต", nameEn: "Mo Chit", coords: [100.5538, 13.8024], interchange: ["mrt-blue"] },
        { code: "N7", name: "สะพานควาย", nameEn: "Saphan Khwai", coords: [100.5497, 13.7937] },
        { code: "N5", name: "อารีย์", nameEn: "Ari", coords: [100.5447, 13.7797] },
        { code: "N4", name: "สนามเป้า", nameEn: "Sanam Pao", coords: [100.5414, 13.7725] },
        { code: "N3", name: "อนุสาวรีย์ชัยสมรภูมิ", nameEn: "Victory Monument", coords: [100.5370, 13.7645] },
        { code: "N2", name: "พญาไท", nameEn: "Phaya Thai", coords: [100.5342, 13.7568], interchange: ["arl"] },
        { code: "N1", name: "ราชเทวี", nameEn: "Ratchathewi", coords: [100.5317, 13.7523] },
        { code: "CEN", name: "สยาม", nameEn: "Siam", coords: [100.5348, 13.7456], interchange: ["bts-silom"] },
        { code: "E1", name: "ชิดลม", nameEn: "Chit Lom", coords: [100.5432, 13.7441] },
        { code: "E2", name: "เพลินจิต", nameEn: "Phloen Chit", coords: [100.5488, 13.7431] },
        { code: "E3", name: "นานา", nameEn: "Nana", coords: [100.5552, 13.7402] },
        { code: "E4", name: "อโศก", nameEn: "Asok", coords: [100.5604, 13.7371], interchange: ["mrt-blue"] },
        { code: "E5", name: "พร้อมพงษ์", nameEn: "Phrom Phong", coords: [100.5698, 13.7303] },
        { code: "E6", name: "ทองหล่อ", nameEn: "Thong Lo", coords: [100.5786, 13.7244] },
        { code: "E7", name: "เอกมัย", nameEn: "Ekkamai", coords: [100.5852, 13.7196] },
        { code: "E8", name: "พระโขนง", nameEn: "Phra Khanong", coords: [100.5912, 13.7153] },
        { code: "E9", name: "อ่อนนุช", nameEn: "On Nut", coords: [100.6010, 13.7058] },
        { code: "E10", name: "บางจาก", nameEn: "Bang Chak", coords: [100.6058, 13.6968] },
        { code: "E11", name: "ปุณณวิถี", nameEn: "Punnawithi", coords: [100.6094, 13.6896] },
        { code: "E12", name: "อุดมสุข", nameEn: "Udom Suk", coords: [100.6098, 13.6806] },
        { code: "E13", name: "บางนา", nameEn: "Bang Na", coords: [100.6052, 13.6685] },
        { code: "E14", name: "แบริ่ง", nameEn: "Bearing", coords: [100.6015, 13.6598] },
        { code: "E15", name: "สำโรง", nameEn: "Samrong", coords: [100.5982, 13.6472], interchange: ["mrt-yellow"] },
        { code: "E16", name: "ปู่เจ้า", nameEn: "Pu Chao", coords: [100.5951, 13.6375] },
        { code: "E17", name: "ช้างเอราวัณ", nameEn: "Chang Erawan", coords: [100.5908, 13.6214] },
        { code: "E18", name: "โรงเรียนนายเรือ", nameEn: "Royal Thai Naval Academy", coords: [100.5958, 13.6085] },
        { code: "E19", name: "ปากน้ำ", nameEn: "Pak Nam", coords: [100.5978, 13.5974] },
        { code: "E20", name: "ศรีนครินทร์", nameEn: "Srinagarindra", coords: [100.6052, 13.5938] },
        { code: "E21", name: "แพรกษา", nameEn: "Phraek Sa", coords: [100.6128, 13.5885] },
        { code: "E22", name: "สายลวด", nameEn: "Sai Luat", coords: [100.6148, 13.5786] },
        { code: "E23", name: "เคหะฯ", nameEn: "Kheha", coords: [100.6088, 13.5684] }
      ]
    },
    {
      id: "bts-silom",
      name: "BTS สายสีลม",
      nameEn: "BTS Silom Line",
      operator: "BTS",
      color: "#006400",
      stations: [
        { code: "W1", name: "สนามกีฬาแห่งชาติ", nameEn: "National Stadium", coords: [100.5289, 13.7466] },
        { code: "CEN", name: "สยาม", nameEn: "Siam", coords: [100.5348, 13.7456], interchange: ["bts-sukhumvit"] },
        { code: "S1", name: "ราชดำริ", nameEn: "Ratchadamri", coords: [100.5392, 13.7388] },
        { code: "S2", name: "ศาลาแดง", nameEn: "Sala Daeng", coords: [100.5350, 13.7285], interchange: ["mrt-blue"] },
        { code: "S3", name: "ช่องนนทรี", nameEn: "Chong Nonsi", coords: [100.5292, 13.7236] },
        { code: "S4", name: "เซนต์หลุยส์", nameEn: "Saint Louis", coords: [100.5244, 13.7208] },
        { code: "S5", name: "สุรศักดิ์", nameEn: "Surasak", coords: [100.5186, 13.7192] },
        { code: "S6", name: "สะพานตากสิน", nameEn: "Saphan Taksin", coords: [100.5144, 13.7188] },
        { code: "S7", name: "กรุงธนบุรี", nameEn: "Krung Thon Buri", coords: [100.5037, 13.7212], interchange: ["bts-gold"] },
        { code: "S8", name: "วงเวียนใหญ่", nameEn: "Wongwian Yai", coords: [100.4938, 13.7215] },
        { code: "S9", name: "โพธิ์นิมิตร", nameEn: "Pho Nimit", coords: [100.4852, 13.7178] },
        { code: "S10", name: "ตลาดพลู", nameEn: "Talat Phlu", coords: [100.4776, 13.7144] },
        { code: "S11", name: "วุฒากาศ", nameEn: "Wutthakat", coords: [100.4682, 13.7126] },
        { code: "S12", name: "บางหว้า", nameEn: "Bang Wa", coords: [100.4578, 13.7206], interchange: ["mrt-blue"] }
      ]
    },
    {
      id: "bts-gold",
      name: "BTS สายสีทอง",
      nameEn: "Gold Line",
      operator: "BTS",
      color: "#BA9006",
      stations: [
        { code: "G1", name: "กรุงธนบุรี", nameEn: "Krung Thon Buri", coords: [100.5037, 13.7212], interchange: ["bts-silom"] },
        { code: "G2", name: "เจริญนคร (ไอคอนสยาม)", nameEn: "Charoen Nakhon (ICONSIAM)", coords: [100.5098, 13.7268] },
        { code: "G3", name: "คลองสาน", nameEn: "Khlong San", coords: [100.5082, 13.7302] }
      ]
    },
    {
      id: "mrt-blue",
      name: "MRT สายสีน้ำเงิน",
      nameEn: "MRT Blue Line",
      operator: "MRT",
      color: "#194F9E",
      stations: [
        { code: "BL01", name: "ท่าพระ", nameEn: "Tha Phra", coords: [100.4735, 13.7298] },
        { code: "BL02", name: "จรัญฯ 13", nameEn: "Charan 13", coords: [100.4715, 13.7412] },
        { code: "BL03", name: "ไฟฉาย", nameEn: "Fai Chai", coords: [100.4705, 13.7548] },
        { code: "BL04", name: "บางขุนนนท์", nameEn: "Bang Khun Non", coords: [100.4728, 13.7638], interchange: ["srt-light-red"] },
        { code: "BL05", name: "บางยี่ขัน", nameEn: "Bang Yi Khan", coords: [100.4855, 13.7788] },
        { code: "BL06", name: "สิรินธร", nameEn: "Sirindhorn", coords: [100.4952, 13.7852] },
        { code: "BL07", name: "บางพลัด", nameEn: "Bang Phlat", coords: [100.5058, 13.7925] },
        { code: "BL08", name: "บางอ้อ", nameEn: "Bang O", coords: [100.5122, 13.8015] },
        { code: "BL09", name: "บางโพ", nameEn: "Bang Pho", coords: [100.5218, 13.8062] },
        { code: "BL10", name: "เตาปูน", nameEn: "Tao Poon", coords: [100.5305, 13.8064], interchange: ["mrt-purple"] },
        { code: "BL11", name: "บางซื่อ", nameEn: "Bang Sue", coords: [100.5375, 13.8035], interchange: ["srt-dark-red","srt-light-red"] },
        { code: "BL12", name: "กำแพงเพชร", nameEn: "Kamphaeng Phet", coords: [100.5482, 13.7978] },
        { code: "BL13", name: "สวนจตุจักร", nameEn: "Chatuchak Park", coords: [100.5538, 13.8024], interchange: ["bts-sukhumvit"] },
        { code: "BL14", name: "พหลโยธิน", nameEn: "Phahon Yothin", coords: [100.5615, 13.8128], interchange: ["bts-sukhumvit"] },
        { code: "BL15", name: "ลาดพร้าว", nameEn: "Lat Phrao", coords: [100.5724, 13.8062], interchange: ["mrt-yellow"] },
        { code: "BL16", name: "รัชดาภิเษก", nameEn: "Ratchadaphisek", coords: [100.5752, 13.7988] },
        { code: "BL17", name: "สุทธิสาร", nameEn: "Sutthisan", coords: [100.5745, 13.7895] },
        { code: "BL18", name: "ห้วยขวาง", nameEn: "Huai Khwang", coords: [100.5738, 13.7788] },
        { code: "BL19", name: "ศูนย์วัฒนธรรมแห่งประเทศไทย", nameEn: "Thailand Cultural Centre", coords: [100.5718, 13.7668] },
        { code: "BL20", name: "พระราม 9", nameEn: "Phra Ram 9", coords: [100.5658, 13.7578] },
        { code: "BL21", name: "เพชรบุรี", nameEn: "Phetchaburi", coords: [100.5632, 13.7495], interchange: ["arl"] },
        { code: "BL22", name: "สุขุมวิท", nameEn: "Sukhumvit", coords: [100.5604, 13.7371], interchange: ["bts-sukhumvit"] },
        { code: "BL23", name: "ศูนย์การประชุมแห่งชาติสิริกิติ์", nameEn: "Queen Sirikit National Convention Centre", coords: [100.5592, 13.7235] },
        { code: "BL24", name: "คลองเตย", nameEn: "Khlong Toei", coords: [100.5532, 13.7225] },
        { code: "BL25", name: "ลุมพินี", nameEn: "Lumphini", coords: [100.5458, 13.7258] },
        { code: "BL26", name: "สีลม", nameEn: "Si Lom", coords: [100.5372, 13.7292], interchange: ["bts-silom"] },
        { code: "BL27", name: "สามย่าน", nameEn: "Sam Yan", coords: [100.5298, 13.7328] },
        { code: "BL28", name: "หัวลำโพง", nameEn: "Hua Lamphong", coords: [100.5182, 13.7375] },
        { code: "BL29", name: "วัดมังกร", nameEn: "Wat Mangkon", coords: [100.5098, 13.7438] },
        { code: "BL30", name: "สามยอด", nameEn: "Sam Yot", coords: [100.5028, 13.7472] },
        { code: "BL31", name: "สนามไชย", nameEn: "Sanam Chai", coords: [100.4948, 13.7438] },
        { code: "BL32", name: "อิสรภาพ", nameEn: "Itsaraphap", coords: [100.4885, 13.7368] },
        { code: "BL01B", name: "ท่าพระ (ชานชาลาล่าง)", nameEn: "Tha Phra (Lower)", coords: [100.4735, 13.7298] },
        { code: "BL33", name: "บางไผ่", nameEn: "Bang Phai", coords: [100.4652, 13.7252] },
        { code: "BL34", name: "บางหว้า", nameEn: "Bang Wa", coords: [100.4578, 13.7206], interchange: ["bts-silom"] },
        { code: "BL35", name: "เพชรเกษม 48", nameEn: "Phetkasem 48", coords: [100.4485, 13.7168] },
        { code: "BL36", name: "ภาษีเจริญ", nameEn: "Phasi Charoen", coords: [100.4352, 13.7132] },
        { code: "BL37", name: "บางแค", nameEn: "Bang Khae", coords: [100.4228, 13.7125] },
        { code: "BL38", name: "หลักสอง", nameEn: "Lak Song", coords: [100.4082, 13.7108] }
      ]
    },
    {
      id: "mrt-purple",
      name: "MRT สายสีม่วง",
      nameEn: "MRT Purple Line",
      operator: "MRT",
      color: "#7A2582",
      stations: [
        { code: "PP01", name: "คลองบางไผ่", nameEn: "Khlong Bang Phai", coords: [100.4102, 13.8918] },
        { code: "PP02", name: "ตลาดบางใหญ่", nameEn: "Talat Bang Yai", coords: [100.4138, 13.8795] },
        { code: "PP03", name: "สามแยกบางใหญ่", nameEn: "Sam Yaek Bang Yai", coords: [100.4225, 13.8682] },
        { code: "PP04", name: "บางพลู", nameEn: "Bang Phlu", coords: [100.4348, 13.8582] },
        { code: "PP05", name: "บางรักใหญ่", nameEn: "Bang Rak Yai", coords: [100.4468, 13.8612] },
        { code: "PP06", name: "บางรักน้อยท่าอิฐ", nameEn: "Bang Rak Noi Tha It", coords: [100.4608, 13.8652] },
        { code: "PP07", name: "ไทรม้า", nameEn: "Sai Ma", coords: [100.4725, 13.8678] },
        { code: "PP08", name: "สะพานพระนั่งเกล้า", nameEn: "Phra Nang Klao Bridge", coords: [100.4852, 13.8705] },
        { code: "PP09", name: "แยกนนทบุรี 1", nameEn: "Yaek Nonthaburi 1", coords: [100.4975, 13.8658] },
        { code: "PP10", name: "บางกระสอ", nameEn: "Bang Krasor", coords: [100.5058, 13.8615] },
        { code: "PP11", name: "ศูนย์ราชการนนทบุรี", nameEn: "Nonthaburi Civic Center", coords: [100.5135, 13.8588], interchange: ["mrt-pink"] },
        { code: "PP12", name: "กระทรวงสาธารณสุข", nameEn: "Ministry of Public Health", coords: [100.5185, 13.8475] },
        { code: "PP13", name: "แยกติวานนท์", nameEn: "Yaek Tiwanon", coords: [100.5208, 13.8378] },
        { code: "PP14", name: "วงศ์สว่าง", nameEn: "Wong Sawang", coords: [100.5262, 13.8268] },
        { code: "PP15", name: "บางซ่อน", nameEn: "Bang Son", coords: [100.5315, 13.8188], interchange: ["srt-light-red"] },
        { code: "PP16", name: "เตาปูน", nameEn: "Tao Poon", coords: [100.5305, 13.8064], interchange: ["mrt-blue"] }
      ]
    },
    {
      id: "mrt-yellow",
      name: "MRT สายสีเหลือง",
      nameEn: "MRT Yellow Line",
      operator: "MRT",
      color: "#F7B928",
      stations: [
        { code: "YL01", name: "ลาดพร้าว", nameEn: "Lat Phrao", coords: [100.5724, 13.8062], interchange: ["mrt-blue"] },
        { code: "YL02", name: "ภาวนา", nameEn: "Phawana", coords: [100.5842, 13.7995] },
        { code: "YL03", name: "โชคชัย 4", nameEn: "Chok Chai 4", coords: [100.5948, 13.7948] },
        { code: "YL04", name: "ลาดพร้าว 71", nameEn: "Lat Phrao 71", coords: [100.6062, 13.7892] },
        { code: "YL05", name: "ลาดพร้าว 83", nameEn: "Lat Phrao 83", coords: [100.6178, 13.7835] },
        { code: "YL06", name: "มหาดไทย", nameEn: "Mahat Thai", coords: [100.6275, 13.7778] },
        { code: "YL07", name: "ลาดพร้าว 101", nameEn: "Lat Phrao 101", coords: [100.6358, 13.7735] },
        { code: "YL08", name: "บางกะปิ", nameEn: "Bang Kapi", coords: [100.6438, 13.7682] },
        { code: "YL09", name: "แยกลำสาลี", nameEn: "Yaek Lam Sali", coords: [100.6475, 13.7628] },
        { code: "YL10", name: "ศรีกรีฑา", nameEn: "Si Kritha", coords: [100.6472, 13.7508] },
        { code: "YL11", name: "หัวหมาก", nameEn: "Hua Mak", coords: [100.6455, 13.7382], interchange: ["arl"] },
        { code: "YL12", name: "กลันตัน", nameEn: "Kalantan", coords: [100.6442, 13.7275] },
        { code: "YL13", name: "ศรีนุช", nameEn: "Si Nut", coords: [100.6445, 13.7145] },
        { code: "YL14", name: "ศรีนครินทร์ 38", nameEn: "Srinagarindra 38", coords: [100.6455, 13.7028] },
        { code: "YL15", name: "สวนหลวง ร.9", nameEn: "Suan Luang Rama IX", coords: [100.6472, 13.6908] },
        { code: "YL16", name: "ศรีอุดม", nameEn: "Si Udom", coords: [100.6492, 13.6782] },
        { code: "YL17", name: "ศรีเอี่ยม", nameEn: "Si Iam", coords: [100.6548, 13.6658] },
        { code: "YL18", name: "ศรีลาซาล", nameEn: "Si La Salle", coords: [100.6448, 13.6558] },
        { code: "YL19", name: "ศรีแบริ่ง", nameEn: "Si Bearing", coords: [100.6358, 13.6475] },
        { code: "YL20", name: "ศรีด่าน", nameEn: "Si Dan", coords: [100.6272, 13.6395] },
        { code: "YL21", name: "ศรีเทพา", nameEn: "Si Thepha", coords: [100.6178, 13.6342] },
        { code: "YL22", name: "ทิพวัล", nameEn: "Thipphawan", coords: [100.6078, 13.6368] },
        { code: "YL23", name: "สำโรง", nameEn: "Samrong", coords: [100.5982, 13.6472], interchange: ["bts-sukhumvit"] }
      ]
    },
    {
      id: "mrt-pink",
      name: "MRT สายสีชมพู",
      nameEn: "MRT Pink Line",
      operator: "MRT",
      color: "#EA68A2",
      stations: [
        { code: "PK01", name: "ศูนย์ราชการนนทบุรี", nameEn: "Nonthaburi Civic Center", coords: [100.5135, 13.8588], interchange: ["mrt-purple"] },
        { code: "PK02", name: "แคราย", nameEn: "Khae Rai", coords: [100.5218, 13.8632] },
        { code: "PK03", name: "สนามบินน้ำ", nameEn: "Sanambin Nam", coords: [100.5275, 13.8715] },
        { code: "PK04", name: "สามัคคี", nameEn: "Samakkhi", coords: [100.5312, 13.8825] },
        { code: "PK05", name: "กรมชลประทาน", nameEn: "Royal Irrigation Department", coords: [100.5298, 13.8962] },
        { code: "PK06", name: "แยกปากเกร็ด", nameEn: "Yaek Pak Kret", coords: [100.5152, 13.9078] },
        { code: "PK07", name: "เลี่ยงเมืองปากเกร็ด", nameEn: "Pak Kret Bypass", coords: [100.5235, 13.9052] },
        { code: "PK08", name: "แจ้งวัฒนะ-ปากเกร็ด 28", nameEn: "Chaeng Watthana-Pak Kret 28", coords: [100.5345, 13.9032] },
        { code: "PK09", name: "ศรีรัช", nameEn: "Si Rat", coords: [100.5448, 13.8995] },
        { code: "PK10", name: "เมืองทองธานี", nameEn: "Muang Thong Thani", coords: [100.5528, 13.8972] },
        { code: "PK11", name: "แจ้งวัฒนะ 14", nameEn: "Chaeng Watthana 14", coords: [100.5638, 13.8938] },
        { code: "PK12", name: "ศูนย์ราชการเฉลิมพระเกียรติ", nameEn: "Government Complex", coords: [100.5728, 13.8912] },
        { code: "PK13", name: "โทรคมนาคมแห่งชาติ", nameEn: "National Telecom", coords: [100.5798, 13.8892] },
        { code: "PK14", name: "หลักสี่", nameEn: "Lak Si", coords: [100.5892, 13.8865], interchange: ["srt-dark-red"] },
        { code: "PK15", name: "ราชภัฏพระนคร", nameEn: "Phranakhon Rajabhat University", coords: [100.5925, 13.8805] },
        { code: "PK16", name: "วัดพระศรีมหาธาตุ", nameEn: "Wat Phra Sri Mahathat", coords: [100.5952, 13.8742], interchange: ["bts-sukhumvit"] },
        { code: "PK17", name: "รามอินทรา 3", nameEn: "Ram Inthra 3", coords: [100.6068, 13.8682] },
        { code: "PK18", name: "ลาดปลาเค้า", nameEn: "Lat Pla Khao", coords: [100.6185, 13.8618] },
        { code: "PK19", name: "รามอินทรา กม.4", nameEn: "Ram Inthra Kor Mor 4", coords: [100.6292, 13.8548] },
        { code: "PK20", name: "มัยลาภ", nameEn: "Maiyalap", coords: [100.6385, 13.8488] },
        { code: "PK21", name: "วัชรพล", nameEn: "Vacharaphol", coords: [100.6482, 13.8432] },
        { code: "PK22", name: "รามอินทรา กม.6", nameEn: "Ram Inthra Kor Mor 6", coords: [100.6582, 13.8378] },
        { code: "PK23", name: "คู้บอน", nameEn: "Khu Bon", coords: [100.6685, 13.8322] },
        { code: "PK24", name: "รามอินทรา กม.9", nameEn: "Ram Inthra Kor Mor 9", coords: [100.6788, 13.8272] },
        { code: "PK25", name: "วงแหวนรามอินทรา", nameEn: "Outer Ring Road - Ram Inthra", coords: [100.6892, 13.8225] },
        { code: "PK26", name: "นพรัตน์", nameEn: "Noppharat", coords: [100.6998, 13.8182] },
        { code: "PK27", name: "บางชัน", nameEn: "Bang Chan", coords: [100.7095, 13.8152] },
        { code: "PK28", name: "เศรษฐบุตรบำเพ็ญ", nameEn: "Setthabutbamphen", coords: [100.7208, 13.8142] },
        { code: "PK29", name: "ตลาดมีนบุรี", nameEn: "Min Buri Market", coords: [100.7352, 13.8148] },
        { code: "PK30", name: "มีนบุรี", nameEn: "Min Buri", coords: [100.7448, 13.8158] }
      ]
    },
    {
      id: "arl",
      name: "ARL แอร์พอร์ต เรล ลิงก์",
      nameEn: "Airport Rail Link",
      operator: "SRT",
      color: "#9F1D21",
      stations: [
        { code: "A1", name: "สุวรรณภูมิ", nameEn: "Suvarnabhumi", coords: [100.7505, 13.6985] },
        { code: "A2", name: "ลาดกระบัง", nameEn: "Lat Krabang", coords: [100.7482, 13.7275] },
        { code: "A3", name: "บ้านทับช้าง", nameEn: "Ban Thap Chang", coords: [100.6912, 13.7335] },
        { code: "A4", name: "หัวหมาก", nameEn: "Hua Mak", coords: [100.6455, 13.7382], interchange: ["mrt-yellow"] },
        { code: "A5", name: "รามคำแหง", nameEn: "Ramkhamhaeng", coords: [100.6008, 13.7432] },
        { code: "A6", name: "มักกะสัน", nameEn: "Makkasan", coords: [100.5632, 13.7495], interchange: ["mrt-blue"] },
        { code: "A7", name: "ราชปรารภ", nameEn: "Ratchaprarop", coords: [100.5422, 13.7548] },
        { code: "A8", name: "พญาไท", nameEn: "Phaya Thai", coords: [100.5342, 13.7568], interchange: ["bts-sukhumvit"] }
      ]
    },
    {
      id: "srt-dark-red",
      name: "SRT สายสีแดงเข้ม",
      nameEn: "SRT Dark Red Line",
      operator: "SRT",
      color: "#BD202F",
      stations: [
        { code: "RN01", name: "กรุงเทพอภิวัฒน์", nameEn: "Krung Thep Aphiwat Central Terminal", coords: [100.5375, 13.8035], interchange: ["mrt-blue","srt-light-red"] },
        { code: "RN02", name: "จตุจักร", nameEn: "Chatuchak", coords: [100.5528, 13.8245] },
        { code: "RN03", name: "วัดเสมียนนารี", nameEn: "Wat Samian Nari", coords: [100.5572, 13.8402] },
        { code: "RN04", name: "บางเขน", nameEn: "Bang Khen", coords: [100.5615, 13.8535] },
        { code: "RN05", name: "ทุ่งสองห้อง", nameEn: "Thung Song Hong", coords: [100.5702, 13.8715] },
        { code: "RN06", name: "หลักสี่", nameEn: "Lak Si", coords: [100.5892, 13.8865], interchange: ["mrt-pink"] },
        { code: "RN07", name: "การเคหะ", nameEn: "Kan Kheha", coords: [100.5952, 13.9075] },
        { code: "RN08", name: "ดอนเมือง", nameEn: "Don Mueang", coords: [100.6015, 13.9212] },
        { code: "RN09", name: "หลักหก", nameEn: "Lak Hok", coords: [100.6035, 13.9575] },
        { code: "RN10", name: "รังสิต", nameEn: "Rangsit", coords: [100.6048, 13.9925] }
      ]
    },
    {
      id: "srt-light-red",
      name: "SRT สายสีแดงอ่อน",
      nameEn: "SRT Light Red Line",
      operator: "SRT",
      color: "#F04E23",
      stations: [
        { code: "RW01", name: "กรุงเทพอภิวัฒน์", nameEn: "Krung Thep Aphiwat Central Terminal", coords: [100.5375, 13.8035], interchange: ["mrt-blue","srt-dark-red"] },
        { code: "RW02", name: "บางซ่อน", nameEn: "Bang Son", coords: [100.5315, 13.8188], interchange: ["mrt-purple"] },
        { code: "RW05", name: "บางบำหรุ", nameEn: "Bang Bamru", coords: [100.4852, 13.7965] },
        { code: "RW06", name: "ตลิ่งชัน", nameEn: "Taling Chan", coords: [100.4558, 13.7872] }
      ]
    }
  ];

  /* สร้าง GeoJSON LineString สำหรับเส้นทางของแต่ละสาย */
  function buildTransitGeoJSON() {
    var lineFeatures = [];
    var stationFeatures = [];
    var seenStations = {};

    LINES.forEach(function(line) {
      var coords = line.stations.map(function(s) { return s.coords; });
      lineFeatures.push({
        type: "Feature",
        id: line.id,
        properties: {
          id: line.id,
          name: line.name,
          nameEn: line.nameEn,
          color: line.color,
          operator: line.operator,
          stationCount: line.stations.length
        },
        geometry: {
          type: "LineString",
          coordinates: coords
        }
      });

      line.stations.forEach(function(s) {
        var key = s.name;
        if (!seenStations[key]) {
          seenStations[key] = {
            name: s.name,
            nameEn: s.nameEn,
            code: s.code,
            coords: s.coords,
            lines: [line.id],
            lineColors: [line.color],
            lineNames: [line.name],
            isInterchange: !!(s.interchange && s.interchange.length)
          };
        } else {
          seenStations[key].lines.push(line.id);
          seenStations[key].lineColors.push(line.color);
          seenStations[key].lineNames.push(line.name);
          seenStations[key].isInterchange = true;
        }
      });
    });

    for (var k in seenStations) {
      var item = seenStations[k];
      stationFeatures.push({
        type: "Feature",
        properties: {
          name: item.name,
          nameEn: item.nameEn,
          code: item.code,
          lines: item.lines.join(","),
          lineNames: item.lineNames.join(" / "),
          primaryColor: item.lineColors[0],
          isInterchange: item.isInterchange ? 1 : 0
        },
        geometry: {
          type: "Point",
          coordinates: item.coords
        }
      });
    }

    return {
      lines: { type: "FeatureCollection", features: lineFeatures },
      stations: { type: "FeatureCollection", features: stationFeatures },
      rawLines: LINES
    };
  }

  root.BKK_TRANSIT = buildTransitGeoJSON();
})(typeof window !== "undefined" ? window : this);
