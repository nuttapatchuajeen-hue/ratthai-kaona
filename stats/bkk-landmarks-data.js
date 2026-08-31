/**
 * bkk-landmarks-data.js
 * ข้อมูลแลนด์มาร์ก เมกะโปรเจกต์ และรายละเอียดโครงการแบบเจาะลึก (Project Intelligence)
 */
(function(root) {
  "use strict";

  var LANDMARKS = [
  {
    "id": "romm-convent",
    "name": "ROMM CONVENT",
    "category": "Condominium",
    "categoryColor": "#3B82F6",
    "developer": "PROUD REAL ESTATE",
    "developerSite": "https://www.proudrealestate.co.th/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "badgeType": "card",
    "badgeImage": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=120&q=80",
    "color": "#243B55",
    "height": 135,
    "floors": 32,
    "units": 175,
    "unitsPerFloor": 8,
    "parking": 198,
    "parkingRatio": "113%",
    "landRai": 1.602,
    "facilitiesM2": "2,000 m²",
    "priceRange": "฿19M – ฿48M",
    "district": "บางรัก",
    "location": "Bangkok (Soi Convent, Silom-Sathorn)",
    "lat": 13.72438,
    "lon": 100.53435,
    "desc": "คอนโดมิเนียมระดับลักชัวรีใจกลางซอยคอนแวนต์ เชื่อมต่อถนนสีลมและสาทร โดดเด่นด้วยแนวคิด Live. Well. Life พัฒนาร่วมกับ รพ. BNH และ The Aspen Tree เพื่อการอยู่อาศัยที่ส่งเสริมสุขภาพอย่างสมบูรณ์แบบ",
    "footprint": [
      [
        100.53426223936964,
        13.72420027583819
      ],
      [
        100.53454718484058,
        13.724330225201504
      ],
      [
        100.53443776063037,
        13.72455972416181
      ],
      [
        100.53415281515943,
        13.724429774798496
      ],
      [
        100.53426223936964,
        13.72420027583819
      ]
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Deluxe",
        "size": "34.50 – 51.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "96.95 m²"
      },
      {
        "label": "2 Bedrooms Plus",
        "size": "118.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "147.00 – 468.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS Sala Daeng (S2)",
        "dist": "500 m",
        "type": "bts"
      },
      {
        "name": "MRT Silom (BL26)",
        "dist": "600 m",
        "type": "mrt"
      },
      {
        "name": "BTS Chong Nonsi (S3)",
        "dist": "650 m",
        "type": "bts"
      },
      {
        "name": "Sirat Expressway (Sathon Toll)",
        "dist": "2.1 km",
        "type": "toll"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "BNH Hospital",
        "kind": "Hospital",
        "color": "#DC2626",
        "lat": 13.7239,
        "lon": 100.5358,
        "dist": "50 m"
      },
      {
        "name": "St. Andrews Sathorn British International School",
        "kind": "School",
        "color": "#854D0E",
        "lat": 13.7235,
        "lon": 100.5365,
        "dist": "350 m"
      },
      {
        "name": "EAT ME RESTAURANT",
        "kind": "Dining",
        "color": "#D97706",
        "lat": 13.7252,
        "lon": 100.5332,
        "dist": "120 m"
      },
      {
        "name": "Throwback.bkk Rooftop Bar",
        "kind": "Bar",
        "color": "#7C3AED",
        "lat": 13.7265,
        "lon": 100.5348,
        "dist": "250 m"
      },
      {
        "name": "Silom Complex",
        "kind": "Shopping",
        "color": "#059669",
        "lat": 13.7275,
        "lon": 100.5352,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "dusit-central-park",
    "name": "Dusit Central Park",
    "category": "Super Luxury Mixed-Use",
    "categoryColor": "#C59B27",
    "developer": "Dusit Thani & Central Pattana (CPN)",
    "developerSite": "https://dusitcentralpark.com/",
    "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    "badgeType": "circle",
    "badgeLetter": "C",
    "badgeBg": "#C59B27",
    "color": "#B86B43",
    "height": 299,
    "floors": 69,
    "units": 406,
    "unitsPerFloor": 6,
    "parking": 1400,
    "parkingRatio": "140%",
    "landRai": 23,
    "facilitiesM2": "Rooftop Park 11,200 m²",
    "priceRange": "฿17M – ฿120M+",
    "district": "บางรัก",
    "location": "Corner of Silom & Rama IV (Opposite Lumphini Park)",
    "lat": 13.7283,
    "lon": 100.5375,
    "desc": "อัครโครงการมิกซ์ยูสระดับเวิลด์คลาสหัวมุมถนนสีลม-พระราม 4 ประกอบด้วย โรงแรม Dusit Thani Bangkok, ที่พักอาศัยระดับอัลตราลักชัวรี Dusit Residences & Dusit Parkside, อาคารสำนักงาน Central Park Offices และศูนย์การค้า Central Park พร้อมสวนลอยฟ้าขนาด 7 ไร่",
    "footprint": [
      [
        100.53719154596975,
        13.728142222372494
      ],
      [
        100.53771616830376,
        13.728033165287941
      ],
      [
        100.53780845403024,
        13.728457777627508
      ],
      [
        100.53728383169623,
        13.72856683471206
      ],
      [
        100.53719154596975,
        13.728142222372494
      ]
    ],
    "unitTypes": [
      {
        "label": "Dusit Parkside (1-2 Beds)",
        "size": "55.00 – 115.00 m²"
      },
      {
        "label": "Dusit Residences (2-4 Beds)",
        "size": "120.00 – 260.00 m²"
      },
      {
        "label": "Penthouse & Crown Residences",
        "size": "350.00 – 750.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS Sala Daeng (S2)",
        "dist": "Direct Link (0 m)",
        "type": "bts"
      },
      {
        "name": "MRT Silom (BL26)",
        "dist": "Direct Link (0 m)",
        "type": "mrt"
      },
      {
        "name": "Lumphini Park Connection",
        "dist": "50 m",
        "type": "park"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Lumphini Park",
        "kind": "Park",
        "color": "#16A34A",
        "lat": 13.731,
        "lon": 100.541,
        "dist": "50 m"
      },
      {
        "name": "Chulalongkorn Hospital",
        "kind": "Hospital",
        "color": "#DC2626",
        "lat": 13.732,
        "lon": 100.536,
        "dist": "150 m"
      },
      {
        "name": "Silom Edge",
        "kind": "Lifestyle",
        "color": "#D97706",
        "lat": 13.728,
        "lon": 100.5355,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "one-bangkok",
    "name": "Signature Tower (One Bangkok)",
    "category": "Supertall Mixed-Use",
    "categoryColor": "#B86B43",
    "developer": "Frasers Property & TCC Assets",
    "developerSite": "https://www.onebangkok.com/",
    "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    "badgeType": "circle",
    "badgeLetter": "1",
    "badgeBg": "#B86B43",
    "color": "#B86B43",
    "height": 436,
    "floors": 92,
    "units": 110,
    "unitsPerFloor": 4,
    "parking": 12000,
    "parkingRatio": "Full Smart Parking",
    "landRai": 108,
    "facilitiesM2": "Public Green Area 50 Rai",
    "priceRange": "Supertall Grade A+",
    "district": "ปทุมวัน",
    "location": "Rama IV Road & Wireless Road Intersection",
    "lat": 13.7275,
    "lon": 100.5472,
    "desc": "อภิมหาโครงการเมืองต้นแบบมิกซ์ยูสที่ใหญ่ที่สุดใจกลางกรุงเทพฯ พร้อมอาคาร Signature Tower สูง 436 เมตร (1 ใน 10 อาคารที่สูงที่สุดในอาเซียน), โรงแรม The Ritz-Carlton Bangkok, Andaz One Bangkok, และพื้นที่รีเทลกว่า 160,000 ตร.ม.",
    "footprint": [
      [
        100.54699275631732,
        13.727172643600527
      ],
      [
        100.547564409451,
        13.727354296653091
      ],
      [
        100.54740724368268,
        13.727827356399471
      ],
      [
        100.54683559054901,
        13.727645703346907
      ],
      [
        100.54699275631732,
        13.727172643600527
      ]
    ],
    "unitTypes": [
      {
        "label": "The Residences at One Bangkok",
        "size": "130.00 – 480.00 m²"
      },
      {
        "label": "Super Luxury Penthouses",
        "size": "600.00 – 1,200.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT Lumphini (BL25)",
        "dist": "Direct Underground (0 m)",
        "type": "mrt"
      },
      {
        "name": "Chalerm Maha Nakhon Expressway",
        "dist": "Direct Access",
        "type": "toll"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Lumphini Park East Gate",
        "kind": "Park",
        "color": "#16A34A",
        "lat": 13.7295,
        "lon": 100.544,
        "dist": "100 m"
      },
      {
        "name": "Benjakitti Park Forest",
        "kind": "Park",
        "color": "#059669",
        "lat": 13.728,
        "lon": 100.556,
        "dist": "600 m"
      },
      {
        "name": "The Ritz-Carlton One Bangkok",
        "kind": "Hotel",
        "color": "#D97706",
        "lat": 13.727,
        "lon": 100.548,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "supalai-icon",
    "name": "Supalai Icon Sathorn",
    "category": "Super Luxury Mixed-Use & Condo",
    "categoryColor": "#C2703C",
    "developer": "Supalai PLC",
    "developerSite": "https://www.supalai.com/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "badgeType": "circle",
    "badgeLetter": "S",
    "badgeBg": "#C2703C",
    "color": "#B86B43",
    "height": 198,
    "floors": 56,
    "units": 720,
    "unitsPerFloor": 14,
    "parking": 800,
    "parkingRatio": "110%",
    "landRai": 7.96,
    "facilitiesM2": "3,500 m²",
    "priceRange": "฿9M – ฿45M",
    "district": "สาทร",
    "location": "South Sathorn Road (Former Australian Embassy)",
    "lat": 13.72309,
    "lon": 100.53796,
    "desc": "โครงการระดับ Iconic Landmark บนถนนสาทรใต้ บนที่ดินสถานทูตออสเตรเลียเดิม โดดเด่นด้วยคอนโดมิเนียมหรู อาคารสำนักงานเกรด A และโซนรีเทลระดับพรีเมียม",
    "footprint": [
      [
        100.53769537235245,
        13.72296272970798
      ],
      [
        100.53812410816067,
        13.722850376766377
      ],
      [
        100.53822462764755,
        13.723217270292018
      ],
      [
        100.53779589183932,
        13.72332962323362
      ],
      [
        100.53769537235245,
        13.72296272970798
      ]
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "42.00 – 61.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "65.00 – 98.00 m²"
      },
      {
        "label": "3-4 Bedrooms Duplex",
        "size": "185.00 – 350.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS Chong Nonsi (S3)",
        "dist": "800 m",
        "type": "bts"
      },
      {
        "name": "BRT Sathorn",
        "dist": "750 m",
        "type": "bus"
      },
      {
        "name": "MRT Lumphini (BL25)",
        "dist": "1.1 km",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Banyan Tree Bangkok",
        "kind": "Hotel",
        "color": "#D97706",
        "lat": 13.7235,
        "lon": 100.5395,
        "dist": "150 m"
      },
      {
        "name": "Sathorn Square",
        "kind": "Office",
        "color": "#3B82F6",
        "lat": 13.7225,
        "lon": 100.531,
        "dist": "700 m"
      }
    ]
  },
  {
    "id": "mahanakhon",
    "name": "King Power Mahanakhon",
    "category": "Supertall Skyscraper & Residences",
    "categoryColor": "#7C3AED",
    "developer": "King Power & Pace Development",
    "developerSite": "https://kingpowermahanakhon.co.th/",
    "image": "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80",
    "badgeType": "card",
    "badgeImage": "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=120&q=80",
    "color": "#B86B43",
    "height": 314,
    "floors": 78,
    "units": 209,
    "unitsPerFloor": 4,
    "parking": 566,
    "parkingRatio": "Auto Parking",
    "landRai": 9,
    "facilitiesM2": "Mahanakhon SkyWalk & SkyBar",
    "priceRange": "฿45M – ฿350M+",
    "district": "บางรัก",
    "location": "Narathiwas Rajanagarindra Rd (Chong Nonsi)",
    "lat": 13.7236,
    "lon": 100.5283,
    "desc": "ตึกระฟ้าสัญลักษณ์รูปทรงพิกเซล 3D สถาปัตยกรรมระดับโลกโดย Ole Scheeren ประกอบด้วย The Ritz-Carlton Residences, The Standard Hotel Bangkok และจุดชมวิวพื้นกระจก Mahanakhon SkyWalk",
    "footprint": [
      [
        100.5282129053828,
        13.723331523382717
      ],
      [
        100.52858128377618,
        13.723539528881297
      ],
      [
        100.5283870946172,
        13.723868476617282
      ],
      [
        100.52801871622383,
        13.723660471118702
      ],
      [
        100.5282129053828,
        13.723331523382717
      ]
    ],
    "unitTypes": [
      {
        "label": "2 Bedrooms Residences",
        "size": "120.00 – 160.00 m²"
      },
      {
        "label": "3-4 Bedrooms Sky Residences",
        "size": "220.00 – 380.00 m²"
      },
      {
        "label": "The Custom Penthouse",
        "size": "850.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS Chong Nonsi (S3)",
        "dist": "Direct Skybridge (0 m)",
        "type": "bts"
      },
      {
        "name": "BRT Sathorn",
        "dist": "150 m",
        "type": "bus"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Mahanakhon CUBE",
        "kind": "Dining",
        "color": "#D97706",
        "lat": 13.7239,
        "lon": 100.5286,
        "dist": "30 m"
      },
      {
        "name": "The Standard Grill",
        "kind": "Dining",
        "color": "#DC2626",
        "lat": 13.7235,
        "lon": 100.5282,
        "dist": "0 m"
      },
      {
        "name": "Sathorn CBD Intersection",
        "kind": "Commercial",
        "color": "#3B82F6",
        "lat": 13.722,
        "lon": 100.53,
        "dist": "200 m"
      }
    ]
  },
  {
    "id": "iconsiam",
    "name": "ICONSIAM & Magnolias Waterfront",
    "category": "Mega Luxury Retail & Residences",
    "categoryColor": "#C59B27",
    "developer": "Siam Piwat, MQDC, CP Group",
    "developerSite": "https://www.iconsiam.com/",
    "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    "badgeType": "circle",
    "badgeLetter": "I",
    "badgeBg": "#C59B27",
    "color": "#B86B43",
    "height": 318,
    "floors": 70,
    "units": 525,
    "unitsPerFloor": 6,
    "parking": 5000,
    "parkingRatio": "120%",
    "landRai": 55,
    "facilitiesM2": "River Park 10,000 m²",
    "priceRange": "฿18M – ฿200M+",
    "district": "คลองสาน",
    "location": "Charoen Nakhon Road (Chao Phraya Riverfront)",
    "lat": 13.7267,
    "lon": 100.5105,
    "desc": "อภิมหาโครงการเมืองริมแม่น้ำเจ้าพระยา พร้อมอาคาร Magnolias Waterfront Residences (สูง 318 เมตร) และ The Residences at Mandarin Oriental Bangkok",
    "footprint": [
      [
        100.51044431005054,
        13.72637096134981
      ],
      [
        100.510841002029,
        13.726696499958727
      ],
      [
        100.51055568994944,
        13.727029038650189
      ],
      [
        100.51015899797099,
        13.726703500041271
      ],
      [
        100.51044431005054,
        13.72637096134981
      ]
    ],
    "unitTypes": [
      {
        "label": "1-2 Bedrooms Waterfront",
        "size": "60.00 – 125.00 m²"
      },
      {
        "label": "Mandarin Oriental Residences",
        "size": "130.00 – 380.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS Charoen Nakhon (G2)",
        "dist": "Direct Link (0 m)",
        "type": "bts"
      },
      {
        "name": "ICONSIAM Pier",
        "dist": "Direct Express Boat (0 m)",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Chao Phraya Riverfront Park",
        "kind": "Park",
        "color": "#0284C7",
        "lat": 13.7275,
        "lon": 100.5115,
        "dist": "50 m"
      },
      {
        "name": "ICS Lifestyle Complex",
        "kind": "Shopping",
        "color": "#D97706",
        "lat": 13.726,
        "lon": 100.509,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "doubletree-silom",
    "name": "DoubleTree by Hilton Bangkok Silom",
    "category": "Hotel",
    "categoryColor": "#D97706",
    "developer": "Hilton Hotels & Resorts",
    "developerSite": "https://www.hilton.com/",
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    "badgeType": "text",
    "color": "#B86B43",
    "height": 110,
    "floors": 28,
    "units": 250,
    "district": "บางรัก",
    "location": "Surawong / Silom Road",
    "lat": 13.7268,
    "lon": 100.5292,
    "desc": "โรงแรมระดับ 4 ดาวใจกลางย่านธุรกิจสีลม-สุรวงศ์ พร้อมสิ่งอำนวยความสะดวกครบครัน",
    "footprint": [
      [
        100.52907512191378,
        13.726626834244884
      ],
      [
        100.5293966788552,
        13.726711098951087
      ],
      [
        100.52932487808623,
        13.726973165755117
      ],
      [
        100.5290033211448,
        13.726888901048914
      ],
      [
        100.52907512191378,
        13.726626834244884
      ]
    ],
    "unitTypes": [],
    "transport": [
      {
        "name": "BTS Chong Nonsi (S3)",
        "dist": "450 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": []
  },
  {
    "id": "bdms-wellness",
    "name": "BDMS Wellness Langsuan",
    "category": "Healthcare & Wellness Hub",
    "categoryColor": "#1F4E79",
    "developer": "Bangkok Dusit Medical Services (BDMS)",
    "developerSite": "https://www.bdmswellness.com/",
    "image": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
    "badgeType": "circle",
    "badgeLetter": "B",
    "badgeBg": "#1F4E79",
    "color": "#1F4E79",
    "height": 120,
    "floors": 26,
    "district": "ปทุมวัน",
    "location": "Langsuan Road & Wireless Road",
    "lat": 13.73441,
    "lon": 100.54227,
    "desc": "ศูนย์ดูแลสุขภาพ เวชศาสตร์ชะลอวัย และป้องกันโรคระดับพรีเมียมใจกลางย่านหลังสวน",
    "footprint": [
      [
        100.54210605107718,
        13.734225613584277
      ],
      [
        100.54248854668613,
        13.734291571435689
      ],
      [
        100.54243394892282,
        13.734594386415724
      ],
      [
        100.54205145331387,
        13.734528428564312
      ],
      [
        100.54210605107718,
        13.734225613584277
      ]
    ],
    "unitTypes": [],
    "transport": [
      {
        "name": "BTS Chit Lom (E1)",
        "dist": "700 m",
        "type": "bts"
      },
      {
        "name": "BTS Ratchadamri (S1)",
        "dist": "650 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": []
  },
  {
    "id": "sc-residences",
    "name": "SC residences (SC ASSET)",
    "category": "Super Luxury Residences",
    "categoryColor": "#C2703C",
    "developer": "SC ASSET",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "badgeType": "circle",
    "badgeLetter": "SC",
    "badgeBg": "#C2703C",
    "color": "#B86B43",
    "height": 145,
    "floors": 35,
    "district": "บางรัก",
    "location": "Saladaeng Soi 1 & Rama IV",
    "lat": 13.72648,
    "lon": 100.54265,
    "desc": "โครงการคอนโดมิเนียมระดับ Ultimate Luxury โดย SC Asset (Saladaeng One) วิวสวนลุมพินีแบบพาโนรามา",
    "footprint": [
      [
        100.54253233973577,
        13.726293755746967
      ],
      [
        100.54286254229187,
        13.726411294819862
      ],
      [
        100.54276766026422,
        13.726666244253034
      ],
      [
        100.54243745770812,
        13.72654870518014
      ],
      [
        100.54253233973577,
        13.726293755746967
      ]
    ],
    "unitTypes": [],
    "transport": [
      {
        "name": "MRT Lumphini (BL25)",
        "dist": "350 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": []
  }
];

  function buildLandmarksGeoJSON() {
    var polygonFeatures = [];
    var pointFeatures = [];

    LANDMARKS.forEach(function(lm) {
      polygonFeatures.push({
        type: "Feature",
        id: lm.id,
        properties: {
          id: lm.id,
          name: lm.name,
          category: lm.category,
          categoryColor: lm.categoryColor,
          developer: lm.developer,
          developerSite: lm.developerSite,
          image: lm.image,
          badgeType: lm.badgeType,
          badgeLetter: lm.badgeLetter,
          badgeBg: lm.badgeBg,
          badgeImage: lm.badgeImage,
          color: lm.color,
          district: lm.district,
          location: lm.location,
          height: lm.height,
          floors: lm.floors,
          units: lm.units,
          unitsPerFloor: lm.unitsPerFloor,
          parking: lm.parking,
          parkingRatio: lm.parkingRatio,
          landRai: lm.landRai,
          facilitiesM2: lm.facilitiesM2,
          priceRange: lm.priceRange,
          desc: lm.desc,
          unitTypes: lm.unitTypes,
          transport: lm.transport,
          nearbyPOIs: lm.nearbyPOIs
        },
        geometry: {
          type: "Polygon",
          coordinates: [lm.footprint]
        }
      });

      pointFeatures.push({
        type: "Feature",
        id: lm.id + "-pt",
        properties: {
          id: lm.id,
          name: lm.name,
          badgeType: lm.badgeType,
          badgeLetter: lm.badgeLetter,
          badgeBg: lm.badgeBg,
          badgeImage: lm.badgeImage,
          color: lm.color,
          height: lm.height
        },
        geometry: {
          type: "Point",
          coordinates: [lm.lon, lm.lat]
        }
      });
    });

    return {
      polygons: { type: "FeatureCollection", features: polygonFeatures },
      points: { type: "FeatureCollection", features: pointFeatures },
      rawList: LANDMARKS
    };
  }

  root.BKK_LANDMARKS = buildLandmarksGeoJSON();
})(typeof window !== "undefined" ? window : this);
