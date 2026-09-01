/**
 * Bangkok Urban & Lifestyle Intelligence Data
 * Embassies, Amenities (7 Categories), Pet-Friendly (4 Categories), Corporate Work/Hiring Hubs, Flood Points
 */

window.BKK_INTELLIGENCE = {
  // 🏛️ Embassies
  embassies: [
    { id: "emb-us", name: "สถานเอกอัครราชทูตสหรัฐอเมริกา (U.S. Embassy)", country: "United States", countryIco: "🇺🇸", coords: [100.5478, 13.7345], address: "120-122 ถนนวิทยุ ลุมพินี ปทุมวัน" },
    { id: "emb-uk", name: "สถานเอกอัครราชทูตสหราชอาณาจักร (British Embassy)", country: "United Kingdom", countryIco: "🇬🇧", coords: [100.5284, 13.7225], address: "AIA Sathorn Tower, ถนนสาทรใต้" },
    { id: "emb-jp", name: "สถานเอกอัครราชทูตญี่ปุ่น (Embassy of Japan)", country: "Japan", countryIco: "🇯🇵", coords: [100.5472, 13.7258], address: "177 ถนนวิทยุ ลุมพินี ปทุมวัน" },
    { id: "emb-au", name: "สถานเอกอัครราชทูตออสเตรเลีย (Australian Embassy)", country: "Australia", countryIco: "🇦🇺", coords: [100.5469, 13.7248], address: "181 ถนนวิทยุ ลุมพินี ปทุมวัน" },
    { id: "emb-de", name: "สถานเอกอัครราชทูตเยอรมนี (German Embassy)", country: "Germany", countryIco: "🇩🇪", coords: [100.5392, 13.7231], address: "9 ถนนสาทรใต้ ยานนาวา สาทร" },
    { id: "emb-fr", name: "สถานเอกอัครราชทูตฝรั่งเศส (French Embassy)", country: "France", countryIco: "🇫🇷", coords: [100.5146, 13.7259], address: "35 ซอยเจริญกรุง 36 บางรัก" },
    { id: "emb-sg", name: "สถานเอกอัครราชทูตสิงคโปร์ (Singapore Embassy)", country: "Singapore", countryIco: "🇸🇬", coords: [100.5358, 13.7220], address: "129 ถนนสาทรใต้ สาทร" },
    { id: "emb-cn", name: "สถานเอกอัครราชทูตจีน (Embassy of China)", country: "China", countryIco: "🇨🇳", coords: [100.5694, 13.7634], address: "57 ถนนรัชดาภิเษก ดินแดง" },
    { id: "emb-ch", name: "สถานเอกอัครราชทูตสวิตเซอร์แลนด์ (Embassy of Switzerland)", country: "Switzerland", countryIco: "🇨🇭", coords: [100.5468, 13.7380], address: "35 ถนนวิทยุ ปทุมวัน" },
    { id: "emb-nl", name: "สถานเอกอัครราชทูตเนเธอร์แลนด์ (Embassy of the Netherlands)", country: "Netherlands", countryIco: "🇳🇱", coords: [100.5410, 13.7335], address: "15 ซอยต้นสน เพลินจิต" }
  ],

  // 🌿 Amenities (7 Categories)
  amenities: {
    parks: [
      { id: "am-p1", name: "สวนลุมพินี (Lumpini Park)", cat: "parks", catLabel: "Parks", ico: "🌳", coords: [100.5417, 13.7314], area: "360 ไร่", highlight: "ปอดสีเขียวใจกลางกรุงเทพฯ" },
      { id: "am-p2", name: "สวนเบญจกิติ & สวนป่า (Benjakitti Forest Park)", cat: "parks", catLabel: "Parks", ico: "🌳", coords: [100.5582, 13.7285], area: "450 ไร่", highlight: "Skywalk พื้นที่ชุ่มน้ำใจกลางเมือง" },
      { id: "am-p3", name: "สวนเบญจสิริ (Benchasiri Park)", cat: "parks", catLabel: "Parks", ico: "🌳", coords: [100.5683, 13.7308], area: "29 ไร่", highlight: "ติดห้าง EmQuartier & EmSphere" },
      { id: "am-p4", name: "สวนจตุจักร & สวนรถไฟ (Chatuchak Park)", cat: "parks", catLabel: "Parks", ico: "🌳", coords: [100.5550, 13.8115], area: "700 ไร่", highlight: "ฮับสวนสาธารณะใหญ่ที่สุดของ กทม." },
      { id: "am-p5", name: "สวนสราญรมย์ (Saranrom Park)", cat: "parks", catLabel: "Parks", ico: "🌳", coords: [100.4958, 13.7485], area: "23 ไร่", highlight: "สวนประวัติศาสตร์เกาะรัตนโกสินทร์" },
      { id: "am-p6", name: "สวนหลวง ร.๙ (King Rama IX Park)", cat: "parks", catLabel: "Parks", ico: "🌳", coords: [100.6635, 13.6890], area: "500 ไร่", highlight: "สวนพฤกษศาสตร์และหอรัชมงคล" }
    ],

    education: [
      { id: "am-e1", name: "Shrewsbury International School (Riverside)", cat: "education", catLabel: "Education", ico: "🎓", coords: [100.5098, 13.7125], type: "International School", curriculum: "British" },
      { id: "am-e2", name: "NIST International School", cat: "education", catLabel: "Education", ico: "🎓", coords: [100.5574, 13.7458], type: "International School", curriculum: "IB World School" },
      { id: "am-e3", name: "Bangkok Prep (Sukhumvit 77)", cat: "education", catLabel: "Education", ico: "🎓", coords: [100.6015, 13.7135], type: "International School", curriculum: "British" },
      { id: "am-e4", name: "จุฬาลงกรณ์มหาวิทยาลัย (Chulalongkorn University)", cat: "education", catLabel: "Education", ico: "🎓", coords: [100.5320, 13.7380], type: "Top University", curriculum: "National & Inter" },
      { id: "am-e5", name: "International School Bangkok (ISB)", cat: "education", catLabel: "Education", ico: "🎓", coords: [100.5280, 13.8850], type: "International School", curriculum: "American / IB" },
      { id: "am-e6", name: "มหาวิทยาลัยธรรมศาสตร์ ท่าพระจันทร์ (Thammasat Univ.)", cat: "education", catLabel: "Education", ico: "🎓", coords: [100.4925, 13.7570], type: "Top University", curriculum: "National & Inter" },
      { id: "am-e7", name: "St. Andrews International School (Sathorn)", cat: "education", catLabel: "Education", ico: "🎓", coords: [100.5332, 13.7222], type: "International School", curriculum: "British" }
    ],

    health: [
      { id: "am-h1", name: "โรงพยาบาลบำรุงราษฎร์ (Bumrungrad International)", cat: "health", catLabel: "Health", ico: "🏥", coords: [100.5532, 13.7460], beds: "580 beds", type: "World-class JCI" },
      { id: "am-h2", name: "โรงพยาบาลเมดพาร์ค (MedPark Hospital)", cat: "health", catLabel: "Health", ico: "🏥", coords: [100.5605, 13.7225], beds: "300 beds", type: "Super Tertiary Care" },
      { id: "am-h3", name: "โรงพยาบาลบีเอ็นเอช (BNH Hospital Sathorn)", cat: "health", catLabel: "Health", ico: "🏥", coords: [100.5358, 13.7248], beds: "225 beds", type: "Premium Boutique JCI" },
      { id: "am-h4", name: "โรงพยาบาลสมิติเวช สุขุมวิท (Samitivej Sukhumvit)", cat: "health", catLabel: "Health", ico: "🏥", coords: [100.5770, 13.7340], beds: "400 beds", type: "Leading Private JCI" },
      { id: "am-h5", name: "โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย (King Chulalongkorn)", cat: "health", catLabel: "Health", ico: "🏥", coords: [100.5352, 13.7315], beds: "1,500 beds", type: "Top Medical Center" },
      { id: "am-h6", name: "โรงพยาบาลกรุงเทพ (Bangkok Hospital Headquarter)", cat: "health", catLabel: "Health", ico: "🏥", coords: [100.5840, 13.7485], beds: "488 beds", type: "BDMS Network Hub" }
    ],

    sport: [
      { id: "am-s1", name: "The Racquet Club (สุขุมวิท 49)", cat: "sport", catLabel: "Sport", ico: "🎾", coords: [100.5780, 13.7370], feature: "Tennis, Squash, Climbing & Fitness" },
      { id: "am-s2", name: "ราชกรีฑาสโมสร (Royal Bangkok Sports Club - RBSC)", cat: "sport", catLabel: "Sport", ico: "🏇", coords: [100.5375, 13.7375], feature: "Exclusive Golf, Horse Racing & Club" },
      { id: "am-s3", name: "Virgin Active Empire Tower", cat: "sport", catLabel: "Sport", ico: "🏋️", coords: [100.5305, 13.7205], feature: "Luxury Multi-level Fitness & Pool" },
      { id: "am-s4", name: "Fitness First Platinum Club ICONSIAM", cat: "sport", catLabel: "Sport", ico: "🧘", coords: [100.5105, 13.7268], feature: "Panoramic Riverview Fitness & Yoga" },
      { id: "am-s5", name: "สนามกอล์ฟราชพฤกษ์คลับ (Rajpruek Club)", cat: "sport", catLabel: "Sport", ico: "⛳", coords: [100.5600, 13.8650], feature: "18-Hole Championship Golf" }
    ],

    dining: [
      { id: "am-d1", name: "Gaggan Anand", cat: "dining", catLabel: "Dining", ico: "🍽️", coords: [100.5750, 13.7380], rating: "Michelin Star", style: "Progressive Indian" },
      { id: "am-d2", name: "Sühring", cat: "dining", catLabel: "Dining", ico: "🍽️", coords: [100.5410, 13.7120], rating: "2 Michelin Stars", style: "Modern German" },
      { id: "am-d3", name: "Le Normandie by Alain Roux (Mandarin Oriental)", cat: "dining", catLabel: "Dining", ico: "🍽️", coords: [100.5140, 13.7235], rating: "2 Michelin Stars", style: "Classic French Fine Dining" },
      { id: "am-d4", name: "ศรณ์ (Sorn Fine Southern Thai)", cat: "dining", catLabel: "Dining", ico: "🍽️", coords: [100.5710, 13.7225], rating: "2 Michelin Stars", style: "Fine Southern Thai Cuisine" },
      { id: "am-d5", name: "เจ๊ไฝ (Jay Fai)", cat: "dining", catLabel: "Dining", ico: "🍳", coords: [100.5048, 13.7525], rating: "Michelin 1 Star Street Food", style: "Crab Omelette Icon" },
      { id: "am-d6", name: "Mott 32 Bangkok (The Standard Bangkok Mahanakhon)", cat: "dining", catLabel: "Dining", ico: "🥢", coords: [100.5285, 13.7238], rating: "Luxury Dining", style: "Modern Cantonese & Peking Duck" }
    ],

    spa: [
      { id: "am-sp1", name: "Yunomori Onsen & Spa (Sathorn 10)", cat: "spa", catLabel: "Spa", ico: "💆", coords: [100.5280, 13.7215], highlight: "Japanese Mineral Onsen & Thai Massage" },
      { id: "am-sp2", name: "The Oriental Spa (Mandarin Oriental)", cat: "spa", catLabel: "Spa", ico: "💆", coords: [100.5135, 13.7238], highlight: "Forbes 5-Star Heritage Sanctuary" },
      { id: "am-sp3", name: "Pañpuri Wellness (Gaysorn Urban Resort)", cat: "spa", catLabel: "Spa", ico: "💆", coords: [100.5412, 13.7445], highlight: "Hydrotherapy & Organic Wellness" },
      { id: "am-sp4", name: "Divana Scentuara Spa (Chidlom)", cat: "spa", catLabel: "Spa", ico: "💆", coords: [100.5435, 13.7388], highlight: "Heritage Siamese Healing & Aromatherapy" }
    ],

    culture: [
      { id: "am-c1", name: "หอศิลปวัฒนธรรมแห่งกรุงเทพฯ (BACC)", cat: "culture", catLabel: "Culture", ico: "🎨", coords: [100.5302, 13.7468], highlight: "ศูนย์รวมนิทรรศการศิลปะร่วมสมัย" },
      { id: "am-c2", name: "มิวเซียมสยาม (Museum Siam)", cat: "culture", catLabel: "Culture", ico: "🏛️", coords: [100.4942, 13.7442], highlight: "พิพิธภัณฑ์การเรียนรู้แห่งชาติ ติด MRT สนามไชย" },
      { id: "am-c3", name: "พิพิธภัณฑ์ศิลปะไทยร่วมสมัย (MOCA Bangkok)", cat: "culture", catLabel: "Culture", ico: "🖼️", coords: [100.5625, 13.8540], highlight: "คอลเลกชันศิลปะโมเดิร์นที่ใหญ่ที่สุดในไทย" },
      { id: "am-c4", name: "บ้านจิม ทอมป์สัน (Jim Thompson House)", cat: "culture", catLabel: "Culture", ico: "🏡", coords: [100.5285, 13.7492], highlight: "เรือนไทยโบราณและประวัติศาสตร์ผ้าไหมไทย" },
      { id: "am-c5", name: "ริเวอร์ ซิตี้ แบงค็อก (River City Bangkok)", cat: "culture", catLabel: "Culture", ico: "🎨", coords: [100.5140, 13.7305], highlight: "อาร์ตแกลเลอรีริมแม่น้ำเจ้าพระยา" }
    ]
  },

  // 🐾 Pet-Friendly Ecosystem (4 Categories)
  petFriendly: {
    vet: [
      { id: "pet-v1", name: "โรงพยาบาลสัตว์ทองหล่อ (Thonglor Pet Hospital 24h)", cat: "vet", catLabel: "Vet & Emergency", ico: "🩺", coords: [100.5820, 13.7420], phone: "02-079-9999", hours: "24 Hours Emergency" },
      { id: "pet-v2", name: "โรงพยาบาลสัตว์เล็ก จุฬาลงกรณ์มหาวิทยาลัย (Chula Small Animal Hospital)", cat: "vet", catLabel: "Vet & Emergency", ico: "🩺", coords: [100.5315, 13.7425], phone: "02-218-9715", hours: "Specialist & 24h Trauma" },
      { id: "pet-v3", name: "โรงพยาบาลสัตว์พระราม 9 (Praram 9 Pet Hospital)", cat: "vet", catLabel: "Vet & Emergency", ico: "🩺", coords: [100.5750, 13.7540], phone: "02-719-7555", hours: "24 Hours Care" },
      { id: "pet-v4", name: "โรงพยาบาลสัตว์ มหาวิทยาลัยเกษตรศาสตร์ บางเขน", cat: "vet", catLabel: "Vet & Emergency", ico: "🩺", coords: [100.5720, 13.8480], phone: "02-797-1900", hours: "Tertiary Referral Care" }
    ],

    malls: [
      { id: "pet-m1", name: "The Commons Thonglor (Pet Friendly)", cat: "malls", catLabel: "Malls & Cafés", ico: "☕", coords: [100.5840, 13.7350], petRules: "Pets Allowed in All Open-air Zones" },
      { id: "pet-m2", name: "Marché Thonglor (Pet Community Hub)", cat: "malls", catLabel: "Malls & Cafés", ico: "🛍️", coords: [100.5805, 13.7300], petRules: "Pet Friendly Mall with Dedicated Garden" },
      { id: "pet-m3", name: "K-Village Sukhumvit 26", cat: "malls", catLabel: "Malls & Cafés", ico: "☕", coords: [100.5695, 13.7190], petRules: "Open-air Pet Community & Farmers Market" },
      { id: "pet-m4", name: "The EmSphere (EM Wonder Pet Zone)", cat: "malls", catLabel: "Malls & Cafés", ico: "🛍️", coords: [100.5665, 13.7320], petRules: "Designated Pet-Friendly Dining & Stroller Areas" },
      { id: "pet-m5", name: "CentralFestival EastVille", cat: "malls", catLabel: "Malls & Cafés", ico: "🛍️", coords: [100.6170, 13.8040], petRules: "Pet Park, Stroller Rental & Pet-friendly Lane" }
    ],

    parks: [
      { id: "pet-p1", name: "Benjakitti Dog Park (สวนป่าเบญจกิติ โซนสุนัข)", cat: "parks", catLabel: "Parks & Dog Runs", ico: "🐕", coords: [100.5560, 13.7305], petRules: "Fenced Dog Run with Agility Equipment" },
      { id: "pet-p2", name: "สวนวชิรเบญจทัศ โซนสุนัข (Vachirabenjatas Dog Park)", cat: "parks", catLabel: "Parks & Dog Runs", ico: "🐕", coords: [100.5530, 13.8160], petRules: "Spacious Green Turf & Socializing Area" },
      { id: "pet-p3", name: "สวนวัชราภิรมย์ (Watcharapirom Dog Park รามอินทรา)", cat: "parks", catLabel: "Parks & Dog Runs", ico: "🐕", coords: [100.6410, 13.8520], petRules: "Dedicated Large & Small Dog Segregated Zones" }
    ],

    boarding: [
      { id: "pet-b1", name: "Doggie Doo Pet Resort & Pool (เอกมัย)", cat: "boarding", catLabel: "Boarding & Daycare", ico: "🏨", coords: [100.5890, 13.7280], feature: "Luxury Suites, Swimming Pool & Daycare" },
      { id: "pet-b2", name: "Pet Hotel Bangkok (สุขุมวิท 103)", cat: "boarding", catLabel: "Boarding & Daycare", ico: "🏨", coords: [100.6250, 13.6820], feature: "Air-conditioned 24h Monitored Suites" },
      { id: "pet-b3", name: "The Dog House Bangkok (สาทร)", cat: "boarding", catLabel: "Boarding & Daycare", ico: "🏨", coords: [100.5340, 13.7180], feature: "Spa, Grooming & Private Playrooms" }
    ]
  },

  // 💼 Corporate Headquarters & Tech Hiring Hubs
  corporate: [
    { id: "corp-tt", name: "TikTok Thailand Head Office", company: "TikTok / ByteDance", brandIco: "🎵", building: "G Tower Grand Rama 9", coords: [100.5695, 13.7578], industry: "Tech & Entertainment", roles: "48 Open Roles" },
    { id: "corp-del", name: "Deloitte Thailand", company: "Deloitte Touche Tohmatsu", brandIco: "📊", building: "AIA Sathorn Tower", coords: [100.5284, 13.7225], industry: "Management Consulting & Audit", roles: "65 Open Roles" },
    { id: "corp-goo", name: "Google Thailand", company: "Google / Alphabet", brandIco: "🌐", building: "Park Ventures Ecoplex", coords: [100.5475, 13.7428], industry: "Big Tech & Cloud AI", roles: "32 Open Roles" },
    { id: "corp-ms", name: "Microsoft Thailand", company: "Microsoft", brandIco: "💻", building: "All Seasons Place (CRC Tower)", coords: [100.5468, 13.7365], industry: "Enterprise Software & Cloud", roles: "24 Open Roles" },
    { id: "corp-ago", name: "Agoda Global Operations Hub", company: "Agoda / Booking Holdings", brandIco: "✈️", building: "CentralWorld Offices", coords: [100.5395, 13.7465], industry: "Travel Tech & Platform", roles: "120 Open Roles" },
    { id: "corp-line", name: "LINE Thailand", company: "LINE Company", brandIco: "💬", building: "Gaysorn Tower", coords: [100.5412, 13.7445], industry: "Super App & Fintech", roles: "38 Open Roles" },
    { id: "corp-bb", name: "Bluebik Group", company: "Bluebik Group PLC", brandIco: "🔷", building: "AIA Sathorn Tower", coords: [100.5284, 13.7225], industry: "Digital Transformation & AI", roles: "29 Open Roles" },
    { id: "corp-sho", name: "Shopee & Sea Thailand", company: "Sea Group", brandIco: "🛍️", building: "Singha Complex", coords: [100.5635, 13.7485], industry: "E-Commerce & Digital Media", roles: "85 Open Roles" },
    { id: "corp-persol", name: "PERSOL Thailand", company: "PERSOLKELLY", brandIco: "👥", building: "Empire Tower Sathorn", coords: [100.5305, 13.7205], industry: "Executive Search & HR Solutions", roles: "15 Open Roles" },
    { id: "corp-bbl", name: "Bangkok Bank Head Office", company: "Bangkok Bank PLC", brandIco: "🏦", building: "Bangkok Bank Silom HQ", coords: [100.5300, 13.7265], industry: "Banking & Financial Services", roles: "90 Open Roles" }
  ],

  // 🌊 Major Flood Surveillance Points & Drainage Hubs
  floodZones: [
    { id: "fl-1", name: "จุดเฝ้าระวังน้ำท่วม วงเวียนบางเขน (หลักสี่-แจ้งวัฒนะ)", coords: [100.5975, 13.8760], severity: "ปานกลาง", lastAlert: "เฝ้าระวังฤดูมรสุม" },
    { id: "fl-2", name: "จุดเฝ้าระวัง แยกรัชดา-ลาดพร้าว", coords: [100.5735, 13.8050], severity: "สูง", lastAlert: "อุโมงค์ระบายน้ำบึงพระราม 9 ช่วยเร่งระบาย" },
    { id: "fl-3", name: "จุดเฝ้าระวัง ถนนศรีนครินทร์ (แยกลำสาลี)", coords: [100.6475, 13.7630], severity: "ปานกลาง", lastAlert: "มีเครื่องสูบน้ำประจำสถานี" },
    { id: "fl-4", name: "จุดเฝ้าระวัง ถนนสุขุมวิท 71 (คลองตัน)", coords: [100.5970, 13.7380], severity: "ปานกลาง", lastAlert: "เชื่อมต่อคลองแสนแสบ" },
    { id: "fl-5", name: "จุดเฝ้าระวัง ซอยสุขุมวิท 101/1 - บางนา", coords: [100.6120, 13.6820], severity: "สูง", lastAlert: "สถานีสูบน้ำพระโขนงรองรับ" },
    { id: "fl-6", name: "จุดเฝ้าระวัง ถนนเจริญกรุง (แยกแปลงนาม เยาวราช)", coords: [100.5090, 13.7410], severity: "ต่ำ (น้ำหนุนเจ้าพระยา)", lastAlert: "มีคันกั้นน้ำแม่น้ำเจ้าพระยา" }
  ]
};
