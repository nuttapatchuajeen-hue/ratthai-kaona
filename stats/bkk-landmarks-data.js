/**
 * bkk-landmarks-data.js
 * ข้อมูลแลนด์มาร์ก 3 มิติ และพิกัดหมุดอสังหาริมทรัพย์, อาหาร, ที่เที่ยว, อาคาร, ระบบขนส่ง BTS/MRT, สนามบิน, ท่าเรือ, ปริมณฑล และย่านบางแค กทม.
 * จำนวนโครงการและสถานที่ทั้งหมด: 217 แห่ง
 */
(function(root) {
  "use strict";

  var LANDMARKS = [
  {
    "id": "romm-convent",
    "name": "ROMM CONVENT",
    "brandId": "proud",
    "brandName": "PROUD REAL ESTATE",
    "category": "คอนโดมิเนียม",
    "categoryColor": "#3B82F6",
    "developer": "PROUD REAL ESTATE",
    "developerSite": "https://www.proudrealestate.co.th/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E3A8A",
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
    "location": "ซอยคอนแวนต์ สีลม–สาทร",
    "lat": 13.72438,
    "lon": 100.53435,
    "desc": "คอนโดมิเนียมระดับลักชัวรีใจกลางซอยคอนแวนต์ เชื่อมต่อถนนสีลมและสาทร โดดเด่นด้วยแนวคิด Live. Well. Life พัฒนาร่วมกับ รพ. BNH และ The Aspen Tree เพื่อการอยู่อาศัยที่ส่งเสริมสุขภาพอย่างสมบูรณ์แบบ",
    "footprint": [
      [
        100.53426,
        13.7242
      ],
      [
        100.53455,
        13.72433
      ],
      [
        100.53444,
        13.72456
      ],
      [
        100.53415,
        13.72443
      ],
      [
        100.53426,
        13.7242
      ]
    ],
    "parts": [
      {
        "name": "Lobby & Wellness Courtyard Podium",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.534,
            13.724
          ],
          [
            100.5347,
            13.724
          ],
          [
            100.5347,
            13.7247
          ],
          [
            100.534,
            13.7247
          ],
          [
            100.534,
            13.724
          ]
        ]
      },
      {
        "name": "Main Residential Tower (Fl 6-28)",
        "color": "#243B55",
        "height": 118,
        "min_height": 22,
        "footprint": [
          [
            100.53415,
            13.72415
          ],
          [
            100.53455,
            13.72415
          ],
          [
            100.53455,
            13.72455
          ],
          [
            100.53415,
            13.72455
          ],
          [
            100.53415,
            13.72415
          ]
        ]
      },
      {
        "name": "Rooftop Sky Wellness & Penthouse Crown (Fl 29-32)",
        "color": "#D48344",
        "height": 135,
        "min_height": 118,
        "footprint": [
          [
            100.53422,
            13.72422
          ],
          [
            100.53448,
            13.72422
          ],
          [
            100.53448,
            13.72448
          ],
          [
            100.53422,
            13.72448
          ],
          [
            100.53422,
            13.72422
          ]
        ]
      }
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
        "dist": "550 m",
        "type": "mrt"
      },
      {
        "name": "BTS Chong Nonsi (S3)",
        "dist": "650 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "BNH Hospital",
        "kind": "Hospital",
        "color": "#DC2626",
        "lat": 13.7238,
        "lon": 100.535,
        "dist": "50 m"
      },
      {
        "name": "Silom Complex",
        "kind": "Shopping",
        "color": "#059669",
        "lat": 13.7285,
        "lon": 100.5345,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "ashton-silom",
    "name": "Ashton Silom",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "คอนโดฯ ซูเปอร์ลักชัวรี",
    "categoryColor": "#0284C7",
    "developer": "Ananda Development",
    "developerSite": "https://www.ananda.co.th/",
    "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#0284C7",
    "height": 180,
    "floors": 48,
    "units": 428,
    "unitsPerFloor": 10,
    "parking": 309,
    "parkingRatio": "72%",
    "landRai": 2.14,
    "facilitiesM2": "Alfresco Living & Cloud Pool",
    "priceRange": "฿8.9M – ฿38M",
    "district": "บางรัก",
    "location": "ถ.สีลม (ใกล้สีลม ซ.12) เขตบางรัก",
    "lat": 13.7248,
    "lon": 100.5268,
    "desc": "คอนโดมิเนียม Super Luxury ดีไซน์โดดเด่นติดถนนสีลม สูง 48 ชั้น สถาปัตยกรรมแบบ Neo Industrial และ Alfresco Living พื้นที่ส่วนกลางสระว่ายน้ำลอยฟ้า Cloud Pool วิวโค้งแม่น้ำและมหานคร",
    "footprint": [
      [
        100.5264,
        13.7244
      ],
      [
        100.5272,
        13.7244
      ],
      [
        100.5272,
        13.7252
      ],
      [
        100.5264,
        13.7252
      ],
      [
        100.5264,
        13.7244
      ]
    ],
    "parts": [
      {
        "name": "Ashton Podium & Garden Lobby",
        "color": "#0F172A",
        "height": 28,
        "min_height": 0,
        "footprint": [
          [
            100.5263,
            13.7243
          ],
          [
            100.5273,
            13.7243
          ],
          [
            100.5273,
            13.7253
          ],
          [
            100.5263,
            13.7253
          ],
          [
            100.5263,
            13.7243
          ]
        ]
      },
      {
        "name": "Main Skyscraper Tower (Fl 8-44)",
        "color": "#0284C7",
        "height": 155,
        "min_height": 28,
        "footprint": [
          [
            100.5265,
            13.7245
          ],
          [
            100.5271,
            13.7245
          ],
          [
            100.5271,
            13.7251
          ],
          [
            100.5265,
            13.7251
          ],
          [
            100.5265,
            13.7245
          ]
        ]
      },
      {
        "name": "Cloud Pool & Sky Lounge Crown (Fl 45-48)",
        "color": "#38BDF8",
        "height": 180,
        "min_height": 155,
        "footprint": [
          [
            100.5266,
            13.7246
          ],
          [
            100.527,
            13.7246
          ],
          [
            100.527,
            13.725
          ],
          [
            100.5266,
            13.725
          ],
          [
            100.5266,
            13.7246
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "31.00 – 49.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "71.50 – 86.50 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ช่องนนทรี (S3)",
        "dist": "350 m",
        "type": "bts"
      },
      {
        "name": "MRT สีลม (BL26)",
        "dist": "1.1 km",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Mahanakhon CUBE",
        "kind": "Dining",
        "color": "#D97706",
        "lat": 13.7239,
        "lon": 100.5286,
        "dist": "300 m"
      }
    ]
  },
  {
    "id": "ashton-chula-silom",
    "name": "Ashton Chula-Silom",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "คอนโดฯ ไฮไรส์ระดับลักชัวรี",
    "categoryColor": "#0284C7",
    "developer": "Ananda Development",
    "developerSite": "https://www.ananda.co.th/",
    "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 204,
    "floors": 56,
    "units": 1180,
    "unitsPerFloor": 26,
    "parking": 560,
    "parkingRatio": "47%",
    "landRai": 4.09,
    "facilitiesM2": "Panoramic Sky Pool 50m",
    "priceRange": "฿7.5M – ฿28M",
    "district": "บางรัก",
    "location": "ถ.พระราม 4 (แยกสามย่าน)",
    "lat": 13.7312,
    "lon": 100.5305,
    "desc": "ไอคอนิกคอนโดมิเนียมสูง 56 ชั้น ทำเลศักยภาพหัวมุมถนนพระราม 4 และพญาไท ตรงข้ามจามจุรีสแควร์และสามย่านมิตรทาวน์ โดดเด่นด้วยสระว่ายน้ำโอลิมปิกลอยฟ้าวิวพาโนรามา",
    "footprint": [
      [
        100.5298,
        13.7306
      ],
      [
        100.5312,
        13.7306
      ],
      [
        100.5312,
        13.7318
      ],
      [
        100.5298,
        13.7318
      ],
      [
        100.5298,
        13.7306
      ]
    ],
    "parts": [
      {
        "name": "Sam Yan Commercial Podium",
        "color": "#0F172A",
        "height": 32,
        "min_height": 0,
        "footprint": [
          [
            100.5298,
            13.7306
          ],
          [
            100.5312,
            13.7306
          ],
          [
            100.5312,
            13.7318
          ],
          [
            100.5298,
            13.7318
          ],
          [
            100.5298,
            13.7306
          ]
        ]
      },
      {
        "name": "Ashton Chula Main Tower (Fl 8-48)",
        "color": "#1E3A8A",
        "height": 175,
        "min_height": 32,
        "footprint": [
          [
            100.5301,
            13.7308
          ],
          [
            100.5309,
            13.7308
          ],
          [
            100.5309,
            13.7316
          ],
          [
            100.5301,
            13.7316
          ],
          [
            100.5301,
            13.7308
          ]
        ]
      },
      {
        "name": "Panoramic Sky Pool & Social Club (Fl 49-56)",
        "color": "#38BDF8",
        "height": 204,
        "min_height": 175,
        "footprint": [
          [
            100.5303,
            13.731
          ],
          [
            100.5307,
            13.731
          ],
          [
            100.5307,
            13.7314
          ],
          [
            100.5303,
            13.7314
          ],
          [
            100.5303,
            13.731
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "24.50 – 26.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "30.50 – 34.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "55.00 – 66.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT สามย่าน (BL27)",
        "dist": "180 m",
        "type": "mrt"
      },
      {
        "name": "BTS ศาลาแดง (S2)",
        "dist": "550 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Samyan Mitrtown",
        "kind": "Mall",
        "color": "#059669",
        "lat": 13.7335,
        "lon": 100.5285,
        "dist": "250 m"
      },
      {
        "name": "Chulalongkorn University",
        "kind": "Education",
        "color": "#EC4899",
        "lat": 13.7365,
        "lon": 100.532,
        "dist": "400 m"
      }
    ]
  },
  {
    "id": "dusit-central-park",
    "name": "Dusit Central Park",
    "brandId": "cpn",
    "brandName": "Dusit Thani & CPN",
    "category": "มิกซ์ยูสระดับซูเปอร์ลักชัวรี",
    "categoryColor": "#C59B27",
    "developer": "Dusit Thani & Central Pattana (CPN)",
    "developerSite": "https://dusitcentralpark.com/",
    "image": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
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
    "location": "หัวมุมสีลม–พระราม 4 (ตรงข้ามสวนลุมพินี)",
    "lat": 13.7283,
    "lon": 100.5375,
    "desc": "อัครโครงการมิกซ์ยูสระดับเวิลด์คลาสหัวมุมถนนสีลม-พระราม 4 ประกอบด้วย โรงแรม Dusit Thani Bangkok, ที่พักอาศัยระดับอัลตราลักชัวรี Dusit Residences & Dusit Parkside, อาคารสำนักงาน Central Park Offices และศูนย์การค้า Central Park พร้อมสวนลอยฟ้าขนาด 7 ไร่",
    "footprint": [
      [
        100.53719,
        13.72814
      ],
      [
        100.53772,
        13.72803
      ],
      [
        100.53781,
        13.72846
      ],
      [
        100.53728,
        13.72857
      ],
      [
        100.53719,
        13.72814
      ]
    ],
    "parts": [
      {
        "name": "Central Park 7-Rai Rooftop Park & Retail Podium",
        "color": "#15803D",
        "height": 38,
        "min_height": 0,
        "footprint": [
          [
            100.5368,
            13.7278
          ],
          [
            100.5382,
            13.7278
          ],
          [
            100.5382,
            13.7288
          ],
          [
            100.5368,
            13.7288
          ],
          [
            100.5368,
            13.7278
          ]
        ]
      },
      {
        "name": "Dusit Thani Hotel with Historic Golden Spire (160m)",
        "color": "#EAB308",
        "height": 160,
        "min_height": 38,
        "footprint": [
          [
            100.5369,
            13.7283
          ],
          [
            100.5376,
            13.7283
          ],
          [
            100.5376,
            13.7288
          ],
          [
            100.5369,
            13.7288
          ],
          [
            100.5369,
            13.7283
          ]
        ]
      },
      {
        "name": "Central Park Offices (245m)",
        "color": "#334155",
        "height": 245,
        "min_height": 38,
        "footprint": [
          [
            100.5377,
            13.7283
          ],
          [
            100.5382,
            13.7283
          ],
          [
            100.5382,
            13.7288
          ],
          [
            100.5377,
            13.7288
          ],
          [
            100.5377,
            13.7283
          ]
        ]
      },
      {
        "name": "Dusit Residences (299m)",
        "color": "#B86B43",
        "height": 299,
        "min_height": 38,
        "footprint": [
          [
            100.5372,
            13.7278
          ],
          [
            100.538,
            13.7278
          ],
          [
            100.538,
            13.7282
          ],
          [
            100.5372,
            13.7282
          ],
          [
            100.5372,
            13.7278
          ]
        ]
      }
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
      }
    ]
  },
  {
    "id": "one-bangkok",
    "name": "Signature Tower (One Bangkok)",
    "brandId": "tcc",
    "brandName": "Frasers Property & TCC",
    "category": "มิกซ์ยูสตึกซูเปอร์ทอลล์",
    "categoryColor": "#B86B43",
    "developer": "Frasers Property & TCC Assets",
    "developerSite": "https://www.onebangkok.com/",
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E3A8A",
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
    "location": "แยก ถ.พระราม 4 – ถ.วิทยุ",
    "lat": 13.7273,
    "lon": 100.5496,
    "desc": "อภิมหาโครงการเมืองต้นแบบมิกซ์ยูสที่ใหญ่ที่สุดใจกลางกรุงเทพฯ บนที่ดิน 108 ไร่ พร้อมอาคาร Signature Tower สูง 436 เมตร 92 ชั้น (ตึกสูงที่สุดในประวัติศาสตร์ไทย), โรงแรม The Ritz-Carlton Bangkok, Andaz One Bangkok, และพื้นที่รีเทล Parade & The STOREYS",
    "footprint": [
      [
        100.547,
        13.7265
      ],
      [
        100.5505,
        13.7267
      ],
      [
        100.5508,
        13.7302
      ],
      [
        100.5478,
        13.73
      ],
      [
        100.547,
        13.7265
      ]
    ],
    "parts": [
      {
        "name": "One Bangkok Park (Central Green Realm & Art Loop)",
        "color": "#15803D",
        "height": 4,
        "min_height": 0,
        "footprint": [
          [
            100.548,
            13.7274
          ],
          [
            100.5492,
            13.7274
          ],
          [
            100.5492,
            13.7286
          ],
          [
            100.548,
            13.7286
          ],
          [
            100.548,
            13.7274
          ]
        ]
      },
      {
        "name": "Parade Retail Podium (Rama IV Frontage)",
        "color": "#2E3A4A",
        "height": 32,
        "min_height": 0,
        "footprint": [
          [
            100.5473,
            13.7265
          ],
          [
            100.5504,
            13.7267
          ],
          [
            100.5504,
            13.7272
          ],
          [
            100.5473,
            13.727
          ],
          [
            100.5473,
            13.7265
          ]
        ]
      },
      {
        "name": "The STOREYS Retail Podium (Wireless Rd Frontage)",
        "color": "#384656",
        "height": 28,
        "min_height": 0,
        "footprint": [
          [
            100.547,
            13.7272
          ],
          [
            100.5477,
            13.7272
          ],
          [
            100.5479,
            13.7297
          ],
          [
            100.5472,
            13.7297
          ],
          [
            100.547,
            13.7272
          ]
        ]
      },
      {
        "name": "Signature Tower Tier 1 (Base Trunk & Grand Atrium)",
        "color": "#274156",
        "height": 120,
        "min_height": 32,
        "footprint": [
          [
            100.54925,
            13.7271
          ],
          [
            100.54942,
            13.72695
          ],
          [
            100.54978,
            13.72695
          ],
          [
            100.54995,
            13.7271
          ],
          [
            100.54995,
            13.7275
          ],
          [
            100.54978,
            13.72765
          ],
          [
            100.54942,
            13.72765
          ],
          [
            100.54925,
            13.7275
          ],
          [
            100.54925,
            13.7271
          ]
        ]
      },
      {
        "name": "Signature Tower Tier 2 (Mid-Rise Grade A+ Offices)",
        "color": "#345C7D",
        "height": 220,
        "min_height": 120,
        "footprint": [
          [
            100.5493,
            13.72714
          ],
          [
            100.54945,
            13.72702
          ],
          [
            100.54975,
            13.72702
          ],
          [
            100.5499,
            13.72714
          ],
          [
            100.5499,
            13.72746
          ],
          [
            100.54975,
            13.72758
          ],
          [
            100.54945,
            13.72758
          ],
          [
            100.5493,
            13.72746
          ],
          [
            100.5493,
            13.72714
          ]
        ]
      },
      {
        "name": "Signature Tower Tier 3 (High-Rise Executive Suites)",
        "color": "#487BA6",
        "height": 320,
        "min_height": 220,
        "footprint": [
          [
            100.54935,
            13.72718
          ],
          [
            100.54948,
            13.72708
          ],
          [
            100.54972,
            13.72708
          ],
          [
            100.54985,
            13.72718
          ],
          [
            100.54985,
            13.72742
          ],
          [
            100.54972,
            13.72752
          ],
          [
            100.54948,
            13.72752
          ],
          [
            100.54935,
            13.72742
          ],
          [
            100.54935,
            13.72718
          ]
        ]
      },
      {
        "name": "Signature Tower Tier 4 (Ultra Luxury Hotel & Sky Lobby)",
        "color": "#5D99C6",
        "height": 395,
        "min_height": 320,
        "footprint": [
          [
            100.5494,
            13.72722
          ],
          [
            100.5495,
            13.72714
          ],
          [
            100.5497,
            13.72714
          ],
          [
            100.5498,
            13.72722
          ],
          [
            100.5498,
            13.72738
          ],
          [
            100.5497,
            13.72746
          ],
          [
            100.5495,
            13.72746
          ],
          [
            100.5494,
            13.72738
          ],
          [
            100.5494,
            13.72722
          ]
        ]
      },
      {
        "name": "Signature Tower Crown (Sloped Glass 360° Observatory)",
        "color": "#90CDF4",
        "height": 425,
        "min_height": 395,
        "footprint": [
          [
            100.54945,
            13.72726
          ],
          [
            100.54975,
            13.72726
          ],
          [
            100.5497,
            13.72734
          ],
          [
            100.5495,
            13.72734
          ],
          [
            100.54945,
            13.72726
          ]
        ]
      },
      {
        "name": "Signature Tower Crown Pinnacle Spire (436m)",
        "color": "#E0F2FE",
        "height": 436,
        "min_height": 425,
        "footprint": [
          [
            100.54956,
            13.72728
          ],
          [
            100.54964,
            13.72728
          ],
          [
            100.54964,
            13.72732
          ],
          [
            100.54956,
            13.72732
          ],
          [
            100.54956,
            13.72728
          ]
        ]
      },
      {
        "name": "The Ritz-Carlton Bangkok & Tower 4 (216m)",
        "color": "#A88350",
        "height": 216,
        "min_height": 28,
        "footprint": [
          [
            100.54715,
            13.72765
          ],
          [
            100.54775,
            13.72765
          ],
          [
            100.54775,
            13.72835
          ],
          [
            100.54715,
            13.72835
          ],
          [
            100.54715,
            13.72765
          ]
        ]
      },
      {
        "name": "The Ritz-Carlton Gold Crown (222m)",
        "color": "#F59E0B",
        "height": 222,
        "min_height": 216,
        "footprint": [
          [
            100.54725,
            13.72775
          ],
          [
            100.54765,
            13.72775
          ],
          [
            100.54765,
            13.72825
          ],
          [
            100.54725,
            13.72825
          ],
          [
            100.54725,
            13.72775
          ]
        ]
      },
      {
        "name": "One Bangkok Office Tower 3 (183m)",
        "color": "#2D4A66",
        "height": 183,
        "min_height": 32,
        "footprint": [
          [
            100.5479,
            13.7267
          ],
          [
            100.54855,
            13.7267
          ],
          [
            100.54855,
            13.72735
          ],
          [
            100.5479,
            13.72735
          ],
          [
            100.5479,
            13.7267
          ]
        ]
      },
      {
        "name": "One Bangkok Office Tower 5 (150m)",
        "color": "#415A77",
        "height": 150,
        "min_height": 28,
        "footprint": [
          [
            100.5473,
            13.7289
          ],
          [
            100.54785,
            13.7289
          ],
          [
            100.54785,
            13.72965
          ],
          [
            100.5473,
            13.72965
          ],
          [
            100.5473,
            13.7289
          ]
        ]
      },
      {
        "name": "Andaz One Bangkok & Luxury Tower (130m)",
        "color": "#5C6B73",
        "height": 130,
        "min_height": 0,
        "footprint": [
          [
            100.5484,
            13.7287
          ],
          [
            100.5491,
            13.7287
          ],
          [
            100.5491,
            13.72945
          ],
          [
            100.5484,
            13.72945
          ],
          [
            100.5484,
            13.7287
          ]
        ]
      }
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
      }
    ]
  },
  {
    "id": "supalai-icon",
    "name": "Supalai Icon Sathorn",
    "brandId": "supalai",
    "brandName": "Supalai",
    "category": "มิกซ์ยูสและคอนโดฯ ซูเปอร์ลักชัวรี",
    "categoryColor": "#C2703C",
    "developer": "Supalai PLC",
    "developerSite": "https://www.supalai.com/",
    "image": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#B86B43",
    "height": 212,
    "floors": 56,
    "units": 720,
    "unitsPerFloor": 14,
    "parking": 800,
    "parkingRatio": "110%",
    "landRai": 7.96,
    "facilitiesM2": "3,500 m²",
    "priceRange": "฿9M – ฿45M",
    "district": "สาทร",
    "location": "ถ.สาทรใต้ (ที่ตั้งเดิมสถานทูตออสเตรเลีย)",
    "lat": 13.72309,
    "lon": 100.53796,
    "desc": "โครงการระดับ Iconic Landmark บนถนนสาทรใต้ บนที่ดินสถานทูตออสเตรเลียเดิม โดดเด่นด้วยคอนโดมิเนียมหรู อาคารสำนักงานเกรด A และโซนรีเทลระดับพรีเมียม",
    "footprint": [
      [
        100.53769,
        13.72296
      ],
      [
        100.53812,
        13.72285
      ],
      [
        100.53822,
        13.72322
      ],
      [
        100.5378,
        13.72333
      ],
      [
        100.53769,
        13.72296
      ]
    ],
    "parts": [
      {
        "name": "Sathorn Lifestyle Retail & Commercial Podium",
        "color": "#0F172A",
        "height": 32,
        "min_height": 0,
        "footprint": [
          [
            100.5375,
            13.7227
          ],
          [
            100.5385,
            13.7227
          ],
          [
            100.5385,
            13.7235
          ],
          [
            100.5375,
            13.7235
          ],
          [
            100.5375,
            13.7227
          ]
        ]
      },
      {
        "name": "Main Luxury Residential Tower (Fl 7-45)",
        "color": "#9A3412",
        "height": 170,
        "min_height": 32,
        "footprint": [
          [
            100.5378,
            13.7229
          ],
          [
            100.5383,
            13.7229
          ],
          [
            100.5383,
            13.7233
          ],
          [
            100.5378,
            13.7233
          ],
          [
            100.5378,
            13.7229
          ]
        ]
      },
      {
        "name": "Sky Residences & Crown Spire (Fl 46-56)",
        "color": "#D97706",
        "height": 212,
        "min_height": 170,
        "footprint": [
          [
            100.5379,
            13.723
          ],
          [
            100.5382,
            13.723
          ],
          [
            100.5382,
            13.7232
          ],
          [
            100.5379,
            13.7232
          ],
          [
            100.5379,
            13.723
          ]
        ]
      }
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
        "name": "BTS ช่องนนทรี (S3)",
        "dist": "800 m",
        "type": "bts"
      },
      {
        "name": "BRT สาทร",
        "dist": "650 m",
        "type": "bus"
      },
      {
        "name": "MRT ลุมพินี (BL25)",
        "dist": "850 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Banyan Tree Bangkok",
        "kind": "Hotel",
        "color": "#7C3AED",
        "lat": 13.7235,
        "lon": 100.5395,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "mahanakhon",
    "name": "King Power Mahanakhon",
    "brandId": "kingpower",
    "brandName": "King Power",
    "category": "ตึกระฟ้าซูเปอร์ทอลล์และเรสซิเดนซ์",
    "categoryColor": "#7C3AED",
    "developer": "King Power & Pace Development",
    "developerSite": "https://kingpowermahanakhon.co.th/",
    "image": "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E293B",
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
    "location": "ถ.นราธิวาสราชนครินทร์ (ช่องนนทรี)",
    "lat": 13.7236,
    "lon": 100.5283,
    "desc": "ตึกระฟ้าสัญลักษณ์รูปทรงพิกเซล 3D สถาปัตยกรรมระดับโลกโดย Ole Scheeren ประกอบด้วย The Ritz-Carlton Residences, The Standard Hotel Bangkok และจุดชมวิวพื้นกระจก Mahanakhon SkyWalk",
    "footprint": [
      [
        100.52821,
        13.72333
      ],
      [
        100.52858,
        13.72354
      ],
      [
        100.52839,
        13.72387
      ],
      [
        100.52802,
        13.72366
      ],
      [
        100.52821,
        13.72333
      ]
    ],
    "parts": [
      {
        "name": "Mahanakhon CUBE Retail Podium",
        "color": "#0F172A",
        "height": 32,
        "min_height": 0,
        "footprint": [
          [
            100.5284,
            13.7228
          ],
          [
            100.5298,
            13.7228
          ],
          [
            100.5298,
            13.7234
          ],
          [
            100.5284,
            13.7234
          ],
          [
            100.5284,
            13.7228
          ]
        ]
      },
      {
        "name": "Mahanakhon Main Tower Trunk",
        "color": "#1E293B",
        "height": 314,
        "min_height": 30,
        "footprint": [
          [
            100.528,
            13.7233
          ],
          [
            100.5288,
            13.7233
          ],
          [
            100.5288,
            13.724
          ],
          [
            100.528,
            13.724
          ],
          [
            100.528,
            13.7233
          ]
        ]
      },
      {
        "name": "Pixel Cutout Spiral Tier 1",
        "color": "#0284C7",
        "height": 150,
        "min_height": 110,
        "footprint": [
          [
            100.5277,
            13.7231
          ],
          [
            100.5283,
            13.7231
          ],
          [
            100.5283,
            13.7236
          ],
          [
            100.5277,
            13.7236
          ],
          [
            100.5277,
            13.7231
          ]
        ]
      },
      {
        "name": "Pixel Cutout Spiral Tier 2",
        "color": "#38BDF8",
        "height": 240,
        "min_height": 195,
        "footprint": [
          [
            100.5285,
            13.7236
          ],
          [
            100.5291,
            13.7236
          ],
          [
            100.5291,
            13.7242
          ],
          [
            100.5285,
            13.7242
          ],
          [
            100.5285,
            13.7236
          ]
        ]
      },
      {
        "name": "Mahanakhon SkyWalk Glass Balcony Peak (314m)",
        "color": "#00E5FF",
        "height": 314,
        "min_height": 298,
        "footprint": [
          [
            100.5282,
            13.7234
          ],
          [
            100.5288,
            13.7234
          ],
          [
            100.5288,
            13.7238
          ],
          [
            100.5282,
            13.7238
          ],
          [
            100.5282,
            13.7234
          ]
        ]
      }
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
      }
    ]
  },
  {
    "id": "iconsiam",
    "name": "ICONSIAM (Mall & Riverfront)",
    "brandId": "siampiwat",
    "brandName": "Siam Piwat & MQDC",
    "category": "อภิมหาโครงการมิกซ์ยูสริมแม่น้ำ",
    "categoryColor": "#C59B27",
    "developer": "Siam Piwat, MQDC, CP Group",
    "developerSite": "https://www.iconsiam.com/",
    "image": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
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
    "priceRange": "Global Landmark Complex",
    "district": "คลองสาน",
    "location": "ถ.เจริญนคร (ริมแม่น้ำเจ้าพระยา)",
    "lat": 13.7267,
    "lon": 100.5106,
    "desc": "อภิมหาโครงการเมืองริมแม่น้ำเจ้าพระยา พร้อมอาคาร Magnolias Waterfront Residences (สูง 318 เมตร) และ The Residences at Mandarin Oriental Bangkok",
    "footprint": [
      [
        100.51015,
        13.726376
      ],
      [
        100.51105,
        13.726376
      ],
      [
        100.51105,
        13.727024
      ],
      [
        100.51015,
        13.727024
      ],
      [
        100.51015,
        13.726376
      ]
    ],
    "parts": [
      {
        "name": "ICONSIAM (Mall & Riverfront) Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.51012,
            13.726354
          ],
          [
            100.51108,
            13.726354
          ],
          [
            100.51108,
            13.727046
          ],
          [
            100.51012,
            13.727046
          ],
          [
            100.51012,
            13.726354
          ]
        ]
      },
      {
        "name": "ICONSIAM (Mall & Riverfront) Residential Tower",
        "color": "#B86B43",
        "height": 280,
        "min_height": 26,
        "footprint": [
          [
            100.51026,
            13.726455
          ],
          [
            100.51094,
            13.726455
          ],
          [
            100.51094,
            13.726945
          ],
          [
            100.51026,
            13.726945
          ],
          [
            100.51026,
            13.726455
          ]
        ]
      },
      {
        "name": "ICONSIAM (Mall & Riverfront) Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 318,
        "min_height": 280,
        "footprint": [
          [
            100.51038,
            13.726542
          ],
          [
            100.51082,
            13.726542
          ],
          [
            100.51082,
            13.726858
          ],
          [
            100.51038,
            13.726858
          ],
          [
            100.51038,
            13.726542
          ]
        ]
      }
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
      }
    ]
  },
  {
    "id": "98-wireless",
    "name": "98 Wireless",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดฯ เรือธงระดับอัลตราลักชัวรี",
    "categoryColor": "#15803D",
    "developer": "Sansiri PLC",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#14532D",
    "color": "#D4AF37",
    "height": 105,
    "floors": 25,
    "units": 77,
    "unitsPerFloor": 4,
    "parking": 240,
    "parkingRatio": "240%",
    "landRai": 2.05,
    "facilitiesM2": "Ralph Lauren Home Interior",
    "priceRange": "฿85M – ฿450M+",
    "district": "ปทุมวัน",
    "location": "ถ.วิทยุ (ใกล้สถานทูตสหรัฐฯ) เขตปทุมวัน",
    "lat": 13.738,
    "lon": 100.5478,
    "desc": "แฟลกชิปคอนโดมิเนียมระดับ The Best Comes as Standard หนึ่งในคอนโดที่แพงและหรูหราที่สุดในประเทศไทย สถาปัตยกรรมคลาสสิกสไตล์ Beaux-Arts ตกแต่งด้วยหินอ่อน Moleanos และเฟอร์นิเจอร์ Ralph Lauren Home",
    "footprint": [
      [
        100.5472,
        13.7375
      ],
      [
        100.5484,
        13.7375
      ],
      [
        100.5484,
        13.7385
      ],
      [
        100.5472,
        13.7385
      ],
      [
        100.5472,
        13.7375
      ]
    ],
    "parts": [
      {
        "name": "Classic Beaux-Arts Grand Podium",
        "color": "#E2E8F0",
        "height": 20,
        "min_height": 0,
        "footprint": [
          [
            100.5472,
            13.7375
          ],
          [
            100.5484,
            13.7375
          ],
          [
            100.5484,
            13.7385
          ],
          [
            100.5472,
            13.7385
          ],
          [
            100.5472,
            13.7375
          ]
        ]
      },
      {
        "name": "Limestone Residence Tower",
        "color": "#D4AF37",
        "height": 88,
        "min_height": 20,
        "footprint": [
          [
            100.5474,
            13.7377
          ],
          [
            100.5482,
            13.7377
          ],
          [
            100.5482,
            13.7383
          ],
          [
            100.5474,
            13.7383
          ],
          [
            100.5474,
            13.7377
          ]
        ]
      },
      {
        "name": "Penthouse Grand Chandelier Crown",
        "color": "#FBBF24",
        "height": 105,
        "min_height": 88,
        "footprint": [
          [
            100.5475,
            13.7378
          ],
          [
            100.5481,
            13.7378
          ],
          [
            100.5481,
            13.7382
          ],
          [
            100.5475,
            13.7382
          ],
          [
            100.5475,
            13.7378
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "2 Bedrooms",
        "size": "120.00 – 145.00 m²"
      },
      {
        "label": "3 Bedrooms",
        "size": "230.00 – 290.00 m²"
      },
      {
        "label": "Super Penthouse",
        "size": "948.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS เพลินจิต (E2)",
        "dist": "350 m",
        "type": "bts"
      },
      {
        "name": "BTS ชิดลม (E1)",
        "dist": "650 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "US Embassy",
        "kind": "Embassy",
        "color": "#0284C7",
        "lat": 13.736,
        "lon": 100.5485,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "the-monument-thonglo",
    "name": "The Monument Thong Lo",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "ไฮไรส์ระดับอัลตราลักชัวรี",
    "categoryColor": "#15803D",
    "developer": "Sansiri PLC",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#14532D",
    "color": "#166534",
    "height": 177,
    "floors": 45,
    "units": 127,
    "unitsPerFloor": 4,
    "parking": 192,
    "parkingRatio": "151%",
    "landRai": 2,
    "facilitiesM2": "1,000 m² Dog Park & Iconic Pool",
    "priceRange": "฿35M – ฿120M",
    "district": "วัฒนา",
    "location": "ถ.ทองหล่อ (สุขุมวิท 55)",
    "lat": 13.741,
    "lon": 100.584,
    "desc": "คอนโดมิเนียมระดับลักชัวรีใจกลางทองหล่อ ออกแบบภายใต้แนวคิด Luxury is Space ยูนิตขนาดใหญ่พิเศษ พร้อมสระว่ายน้ำประติมากรรมหิน Alabaster และสวนร่มรื่นกว่า 1,000 ตร.ม.",
    "footprint": [
      [
        100.5835,
        13.7405
      ],
      [
        100.5845,
        13.7405
      ],
      [
        100.5845,
        13.7415
      ],
      [
        100.5835,
        13.7415
      ],
      [
        100.5835,
        13.7405
      ]
    ],
    "parts": [
      {
        "name": "Thong Lo Garden & Lobby Podium",
        "color": "#064E3B",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [
            100.5835,
            13.7405
          ],
          [
            100.5845,
            13.7405
          ],
          [
            100.5845,
            13.7415
          ],
          [
            100.5835,
            13.7415
          ],
          [
            100.5835,
            13.7405
          ]
        ]
      },
      {
        "name": "Monolithic Glass Tower",
        "color": "#047857",
        "height": 150,
        "min_height": 25,
        "footprint": [
          [
            100.5837,
            13.7407
          ],
          [
            100.5843,
            13.7407
          ],
          [
            100.5843,
            13.7413
          ],
          [
            100.5837,
            13.7413
          ],
          [
            100.5837,
            13.7407
          ]
        ]
      },
      {
        "name": "Sky Penthouse Tier (Fl 41-45)",
        "color": "#10B981",
        "height": 177,
        "min_height": 150,
        "footprint": [
          [
            100.5838,
            13.7408
          ],
          [
            100.5842,
            13.7408
          ],
          [
            100.5842,
            13.7412
          ],
          [
            100.5838,
            13.7412
          ],
          [
            100.5838,
            13.7408
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "2 Bedrooms",
        "size": "124.25 – 125.25 m²"
      },
      {
        "label": "3 Bedrooms",
        "size": "230.75 – 231.75 m²"
      },
      {
        "label": "Penthouse",
        "size": "508.00 – 662.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ทองหล่อ (E6)",
        "dist": "1.2 km",
        "type": "bts"
      },
      {
        "name": "ทองหล่อ Shuttle Bus",
        "dist": "0 m",
        "type": "bus"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "The Commons Thong Lo",
        "kind": "Lifestyle",
        "color": "#EA580C",
        "lat": 13.735,
        "lon": 100.582,
        "dist": "650 m"
      }
    ]
  },
  {
    "id": "park-origin-thonglor",
    "name": "Park Origin Thonglor",
    "brandId": "origin",
    "brandName": "Origin Property",
    "category": "มัลติทาวเวอร์ระดับซูเปอร์ลักชัวรี",
    "categoryColor": "#EA580C",
    "developer": "Origin Property & Nomura Real Estate",
    "developerSite": "https://www.origin.co.th/",
    "image": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#C2410C",
    "color": "#EA580C",
    "height": 220,
    "floors": 59,
    "units": 1182,
    "unitsPerFloor": 12,
    "parking": 640,
    "parkingRatio": "54%",
    "landRai": 5.3,
    "facilitiesM2": "2-Rai Green Park & Sky Facilities",
    "priceRange": "฿12M – ฿48M",
    "district": "วัฒนา",
    "location": "ทองหล่อ ซ.10 (ที่ตั้งเดิม Arena 10)",
    "lat": 13.7335,
    "lon": 100.5835,
    "desc": "เมกะโปรเจกต์คอนโดมิเนียมระดับแฟลกชิปใจกลางทองหล่อ ซอย 10 ประกอบด้วย 3 ทาวเวอร์สูงเสียดฟ้า ออกแบบผสานสวนป่ากว่า 2 ไร่ พร้อมส่วนกลางเชื่อมต่อ 3 อาคารระดับเวิลด์คลาส",
    "footprint": [
      [
        100.5825,
        13.7325
      ],
      [
        100.5845,
        13.7325
      ],
      [
        100.5845,
        13.7345
      ],
      [
        100.5825,
        13.7345
      ],
      [
        100.5825,
        13.7325
      ]
    ],
    "parts": [
      {
        "name": "Arena 10 Lifestyle & Forest Base",
        "color": "#065F46",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [
            100.5825,
            13.7325
          ],
          [
            100.5845,
            13.7325
          ],
          [
            100.5845,
            13.7345
          ],
          [
            100.5825,
            13.7345
          ],
          [
            100.5825,
            13.7325
          ]
        ]
      },
      {
        "name": "Tower A (39 Fl, 150m)",
        "color": "#C2410C",
        "height": 150,
        "min_height": 25,
        "footprint": [
          [
            100.5827,
            13.7327
          ],
          [
            100.5833,
            13.7327
          ],
          [
            100.5833,
            13.7333
          ],
          [
            100.5827,
            13.7333
          ],
          [
            100.5827,
            13.7327
          ]
        ]
      },
      {
        "name": "Tower B (53 Fl, 195m)",
        "color": "#EA580C",
        "height": 195,
        "min_height": 25,
        "footprint": [
          [
            100.5836,
            13.733
          ],
          [
            100.5843,
            13.733
          ],
          [
            100.5843,
            13.7338
          ],
          [
            100.5836,
            13.7338
          ],
          [
            100.5836,
            13.733
          ]
        ]
      },
      {
        "name": "Tower C Supertall Peak (59 Fl, 220m)",
        "color": "#FB923C",
        "height": 220,
        "min_height": 25,
        "footprint": [
          [
            100.5828,
            13.7337
          ],
          [
            100.5835,
            13.7337
          ],
          [
            100.5835,
            13.7344
          ],
          [
            100.5828,
            13.7344
          ],
          [
            100.5828,
            13.7337
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "30.00 – 36.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "45.00 – 68.00 m²"
      },
      {
        "label": "Duo Space",
        "size": "32.50 – 55.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ทองหล่อ (E6)",
        "dist": "1.1 km",
        "type": "bts"
      },
      {
        "name": "BTS เอกมัย (E7)",
        "dist": "1.3 km",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Donki Mall Thonglor",
        "kind": "Shopping",
        "color": "#059669",
        "lat": 13.7328,
        "lon": 100.584,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "rhythm-ekkamai",
    "name": "Rhythm Ekkamai Estate",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมระดับลักชัวรี",
    "categoryColor": "#DC2626",
    "developer": "AP Thailand & Mitsubishi Estate",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#991B1B",
    "color": "#DC2626",
    "height": 130,
    "floors": 32,
    "units": 303,
    "unitsPerFloor": 12,
    "parking": 235,
    "parkingRatio": "77%",
    "landRai": 2.05,
    "facilitiesM2": "Floating Garden & Triplex Sky Pool",
    "priceRange": "฿7.9M – ฿25M",
    "district": "วัฒนา",
    "location": "เอกมัย ซ.1 (สุขุมวิท 63)",
    "lat": 13.7275,
    "lon": 100.5865,
    "desc": "คอนโดมิเนียมสไตล์บ้านในเมือง 'Feel Like Home' จาก AP Thailand ใจกลางเอกมัย พร้อมพื้นที่ส่วนกลางยกชั้นลอยฟ้า Triplex Sky Facilities และ Floating Garden ร่มรื่น",
    "footprint": [
      [
        100.5858,
        13.7268
      ],
      [
        100.5872,
        13.7268
      ],
      [
        100.5872,
        13.7282
      ],
      [
        100.5858,
        13.7282
      ],
      [
        100.5858,
        13.7268
      ]
    ],
    "parts": [
      {
        "name": "Ekkamai Grand Lobby Base",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.5858,
            13.7268
          ],
          [
            100.5872,
            13.7268
          ],
          [
            100.5872,
            13.7282
          ],
          [
            100.5858,
            13.7282
          ],
          [
            100.5858,
            13.7268
          ]
        ]
      },
      {
        "name": "Main Tower Body (Fl 7-28)",
        "color": "#DC2626",
        "height": 110,
        "min_height": 22,
        "footprint": [
          [
            100.5861,
            13.7271
          ],
          [
            100.5869,
            13.7271
          ],
          [
            100.5869,
            13.7279
          ],
          [
            100.5861,
            13.7279
          ],
          [
            100.5861,
            13.7271
          ]
        ]
      },
      {
        "name": "Triplex Sky Pool Crown (Fl 29-32)",
        "color": "#F87171",
        "height": 130,
        "min_height": 110,
        "footprint": [
          [
            100.5862,
            13.7272
          ],
          [
            100.5868,
            13.7272
          ],
          [
            100.5868,
            13.7278
          ],
          [
            100.5862,
            13.7278
          ],
          [
            100.5862,
            13.7272
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "35.00 m²"
      },
      {
        "label": "1 Bedroom Plus",
        "size": "39.50 – 40.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "74.50 – 87.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS เอกมัย (E7)",
        "dist": "750 m",
        "type": "bts"
      },
      {
        "name": "BTS ทองหล่อ (E6)",
        "dist": "1.2 km",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Gateway Ekamai",
        "kind": "Mall",
        "color": "#059669",
        "lat": 13.719,
        "lon": 100.585,
        "dist": "800 m"
      }
    ]
  },
  {
    "id": "life-asoke-hype",
    "name": "Life Asoke Hype",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดฯ ไลฟ์สไตล์คนเมือง",
    "categoryColor": "#DC2626",
    "developer": "AP Thailand & Mitsubishi Estate",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#991B1B",
    "color": "#991B1B",
    "height": 155,
    "floors": 40,
    "units": 1253,
    "unitsPerFloor": 34,
    "parking": 530,
    "parkingRatio": "42%",
    "landRai": 5,
    "facilitiesM2": "Hover Bay Pool & Sky Mirage Lounge",
    "priceRange": "฿4.2M – ฿14M",
    "district": "ราชเทวี",
    "location": "ถ.อโศก–ดินแดง (ย่านซีบีดีใหม่พระราม 9)",
    "lat": 13.7545,
    "lon": 100.563,
    "desc": "คอนโดมิเนียมดีไซน์สุดล้ำ 'The Hype of New CBD' ทำเลเชื่อมต่ออโศกและพระราม 9 ใกล้ MRT พระราม 9 และ ARL มักกะสัน พร้อมพื้นที่ส่วนกลางดีไซน์ Eclectic Art ผสานเทคโนโลยี",
    "footprint": [
      [
        100.562,
        13.7535
      ],
      [
        100.564,
        13.7535
      ],
      [
        100.564,
        13.7555
      ],
      [
        100.562,
        13.7555
      ],
      [
        100.562,
        13.7535
      ]
    ],
    "parts": [
      {
        "name": "Podium & Co-Working Garden",
        "color": "#1E293B",
        "height": 28,
        "min_height": 0,
        "footprint": [
          [
            100.562,
            13.7535
          ],
          [
            100.564,
            13.7535
          ],
          [
            100.564,
            13.7555
          ],
          [
            100.562,
            13.7555
          ],
          [
            100.562,
            13.7535
          ]
        ]
      },
      {
        "name": "Life Asoke Main Tower (Fl 8-36)",
        "color": "#B91C1C",
        "height": 135,
        "min_height": 28,
        "footprint": [
          [
            100.5623,
            13.7538
          ],
          [
            100.5637,
            13.7538
          ],
          [
            100.5637,
            13.7552
          ],
          [
            100.5623,
            13.7552
          ],
          [
            100.5623,
            13.7538
          ]
        ]
      },
      {
        "name": "Hover Bay Mirage Pool (Fl 37-40)",
        "color": "#EF4444",
        "height": 155,
        "min_height": 135,
        "footprint": [
          [
            100.5625,
            13.754
          ],
          [
            100.5635,
            13.754
          ],
          [
            100.5635,
            13.755
          ],
          [
            100.5625,
            13.755
          ],
          [
            100.5625,
            13.754
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "25.50 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "32.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "58.50 – 64.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT พระราม 9 (BL20)",
        "dist": "300 m",
        "type": "mrt"
      },
      {
        "name": "ARL มักกะสัน (A6)",
        "dist": "600 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Rama 9",
        "kind": "Mall",
        "color": "#059669",
        "lat": 13.758,
        "lon": 100.566,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "noble-ploenchit",
    "name": "Noble Ploenchit",
    "brandId": "noble",
    "brandName": "Noble Development",
    "category": "ไฮไรส์มินิมอลระดับอัลตราลักชัวรี",
    "categoryColor": "#000000",
    "developer": "Noble Development",
    "developerSite": "https://www.noblehome.com/",
    "image": "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#000000",
    "color": "#1E293B",
    "height": 190,
    "floors": 51,
    "units": 1444,
    "unitsPerFloor": 10,
    "parking": 1000,
    "parkingRatio": "70%",
    "landRai": 9,
    "facilitiesM2": "4-Rai Sky Garden & Private Lift",
    "priceRange": "฿14M – ฿65M",
    "district": "ปทุมวัน",
    "location": "ถ.เพลินจิต (สกายวอล์กเชื่อม BTS โดยตรง)",
    "lat": 13.743,
    "lon": 100.5485,
    "desc": "คอนโดมิเนียมระดับอัลตร้าลักชัวรีใจกลางเพลินจิต สถาปัตยกรรมแบบ Minimalist พร้อมลิฟต์ส่วนตัวทุกยูนิต เชื่อมต่อตรงสู่สถานีรถไฟฟ้า BTS เพลินจิตด้วย Skywalk ส่วนตัว และสวนสีเขียวกว่า 4 ไร่",
    "footprint": [
      [
        100.5475,
        13.742
      ],
      [
        100.5495,
        13.742
      ],
      [
        100.5495,
        13.744
      ],
      [
        100.5475,
        13.744
      ],
      [
        100.5475,
        13.742
      ]
    ],
    "parts": [
      {
        "name": "Noble Minimalist Podium & Skywalk Hub",
        "color": "#0F172A",
        "height": 24,
        "min_height": 0,
        "footprint": [
          [
            100.5475,
            13.742
          ],
          [
            100.5495,
            13.742
          ],
          [
            100.5495,
            13.744
          ],
          [
            100.5475,
            13.744
          ],
          [
            100.5475,
            13.742
          ]
        ]
      },
      {
        "name": "Tower A (14 Fl, 65m)",
        "color": "#334155",
        "height": 65,
        "min_height": 24,
        "footprint": [
          [
            100.5477,
            13.7422
          ],
          [
            100.5483,
            13.7422
          ],
          [
            100.5483,
            13.7428
          ],
          [
            100.5477,
            13.7428
          ],
          [
            100.5477,
            13.7422
          ]
        ]
      },
      {
        "name": "Tower B (51 Fl, 190m)",
        "color": "#1E293B",
        "height": 190,
        "min_height": 24,
        "footprint": [
          [
            100.5485,
            13.7428
          ],
          [
            100.5493,
            13.7428
          ],
          [
            100.5493,
            13.7438
          ],
          [
            100.5485,
            13.7438
          ],
          [
            100.5485,
            13.7428
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "44.00 – 62.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "70.00 – 115.00 m²"
      },
      {
        "label": "Penthouse",
        "size": "140.00 – 190.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS เพลินจิต (E2)",
        "dist": "Direct Skybridge (0 m)",
        "type": "bts"
      },
      {
        "name": "ทางด่วนเฉลิมมหานคร",
        "dist": "300 m",
        "type": "toll"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Embassy",
        "kind": "Mall",
        "color": "#7C3AED",
        "lat": 13.7442,
        "lon": 100.5465,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "28-chidlom",
    "name": "28 Chidlom",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "ไฮไรส์จิวเวลบ็อกซ์ระดับอัลตราลักชัวรี",
    "categoryColor": "#C2703C",
    "developer": "SC ASSET",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E3A8A",
    "color": "#C2703C",
    "height": 182,
    "floors": 47,
    "units": 425,
    "unitsPerFloor": 8,
    "parking": 358,
    "parkingRatio": "84%",
    "landRai": 3,
    "facilitiesM2": "Courtyard Greenery & Jewel Box Sky Pool",
    "priceRange": "฿16M – ฿60M",
    "district": "ปทุมวัน",
    "location": "ถ.ชิดลม (ห่าง BTS ชิดลม 250 ม.)",
    "lat": 13.746,
    "lon": 100.5435,
    "desc": "คอนโดมิเนียมระดับ Limited Collection โดย SC Asset บนถนนชิดลม ออกแบบภายใต้แนวคิด 'Jewel Box' กล่องอัญมณีกระจกใสผสานคอร์ทยาร์ดสีเขียวใจกลางเมือง",
    "footprint": [
      [
        100.5428,
        13.7452
      ],
      [
        100.5442,
        13.7452
      ],
      [
        100.5442,
        13.7468
      ],
      [
        100.5428,
        13.7468
      ],
      [
        100.5428,
        13.7452
      ]
    ],
    "parts": [
      {
        "name": "The Villa Podium & Courtyard",
        "color": "#064E3B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.5428,
            13.7452
          ],
          [
            100.5442,
            13.7452
          ],
          [
            100.5442,
            13.7468
          ],
          [
            100.5428,
            13.7468
          ],
          [
            100.5428,
            13.7452
          ]
        ]
      },
      {
        "name": "The Tower Main Skyscraper (Fl 8-40)",
        "color": "#C2703C",
        "height": 155,
        "min_height": 22,
        "footprint": [
          [
            100.5432,
            13.7455
          ],
          [
            100.5439,
            13.7455
          ],
          [
            100.5439,
            13.7465
          ],
          [
            100.5432,
            13.7465
          ],
          [
            100.5432,
            13.7455
          ]
        ]
      },
      {
        "name": "Jewel Box Sky Pool & Fitness (Fl 41-47)",
        "color": "#F59E0B",
        "height": 182,
        "min_height": 155,
        "footprint": [
          [
            100.5433,
            13.7457
          ],
          [
            100.5438,
            13.7457
          ],
          [
            100.5438,
            13.7463
          ],
          [
            100.5433,
            13.7463
          ],
          [
            100.5433,
            13.7457
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "40.00 – 50.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "70.00 – 90.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "120.00 – 190.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ชิดลม (E1)",
        "dist": "250 m",
        "type": "bts"
      },
      {
        "name": "BTS เพลินจิต (E2)",
        "dist": "600 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Chidlom",
        "kind": "Mall",
        "color": "#059669",
        "lat": 13.7441,
        "lon": 100.5432,
        "dist": "200 m"
      }
    ]
  },
  {
    "id": "doubletree-silom",
    "name": "DoubleTree by Hilton Bangkok Silom",
    "brandId": "hilton",
    "brandName": "Hilton",
    "category": "โรงแรม",
    "categoryColor": "#D97706",
    "developer": "Hilton Hotels & Resorts",
    "developerSite": "https://www.hilton.com/",
    "image": "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#78350F",
    "color": "#B86B43",
    "height": 98,
    "floors": 28,
    "units": 250,
    "district": "บางรัก",
    "location": "ถ.สุรวงศ์ / สีลม",
    "lat": 13.7268,
    "lon": 100.5292,
    "desc": "โรงแรมระดับ 4 ดาวใจกลางย่านธุรกิจสีลม-สุรวงศ์ พร้อมสิ่งอำนวยความสะดวกครบครัน",
    "footprint": [
      [
        100.52907,
        13.72662
      ],
      [
        100.52939,
        13.72671
      ],
      [
        100.52932,
        13.72697
      ],
      [
        100.529,
        13.72688
      ],
      [
        100.52907,
        13.72662
      ]
    ],
    "parts": [
      {
        "name": "Lobby & Dining Podium",
        "color": "#1E293B",
        "height": 24,
        "min_height": 0,
        "footprint": [
          [
            100.5289,
            13.7265
          ],
          [
            100.5295,
            13.7265
          ],
          [
            100.5295,
            13.7271
          ],
          [
            100.5289,
            13.7271
          ],
          [
            100.5289,
            13.7265
          ]
        ]
      },
      {
        "name": "DoubleTree Guest Tower (Fl 7-28)",
        "color": "#B86B43",
        "height": 98,
        "min_height": 24,
        "footprint": [
          [
            100.529,
            13.7266
          ],
          [
            100.5294,
            13.7266
          ],
          [
            100.5294,
            13.727
          ],
          [
            100.529,
            13.727
          ],
          [
            100.529,
            13.7266
          ]
        ]
      }
    ],
    "unitTypes": [],
    "transport": [
      {
        "name": "BTS Chong Nonsi (S3)",
        "dist": "450 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [],
    "priceRange": "฿3,500 – ฿8,500 / คืน"
  },
  {
    "id": "bdms-wellness",
    "name": "BDMS Wellness Langsuan",
    "brandId": "bdms",
    "brandName": "BDMS",
    "category": "ศูนย์สุขภาพและเวลเนส",
    "categoryColor": "#1F4E79",
    "developer": "Bangkok Dusit Medical Services (BDMS)",
    "developerSite": "https://www.bdmswellness.com/",
    "image": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1F4E79",
    "color": "#1F4E79",
    "height": 85,
    "floors": 26,
    "district": "ปทุมวัน",
    "location": "ถ.หลังสวน และ ถ.วิทยุ",
    "lat": 13.73441,
    "lon": 100.54227,
    "desc": "ศูนย์ดูแลสุขภาพ เวชศาสตร์ชะลอวัย และป้องกันโรคระดับพรีเมียมใจกลางย่านหลังสวน",
    "footprint": [
      [
        100.5421,
        13.73422
      ],
      [
        100.54248,
        13.73429
      ],
      [
        100.54243,
        13.73459
      ],
      [
        100.54205,
        13.73452
      ],
      [
        100.5421,
        13.73422
      ]
    ],
    "parts": [
      {
        "name": "Medical Clinic & Biophilic Green Terrace",
        "color": "#047857",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.5419,
            13.7341
          ],
          [
            100.5426,
            13.7341
          ],
          [
            100.5426,
            13.7347
          ],
          [
            100.5419,
            13.7347
          ],
          [
            100.5419,
            13.7341
          ]
        ]
      },
      {
        "name": "BDMS Executive Wellness Tower",
        "color": "#0284C7",
        "height": 85,
        "min_height": 22,
        "footprint": [
          [
            100.5421,
            13.7343
          ],
          [
            100.5425,
            13.7343
          ],
          [
            100.5425,
            13.7346
          ],
          [
            100.5421,
            13.7346
          ],
          [
            100.5421,
            13.7343
          ]
        ]
      }
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
    "nearbyPOIs": [],
    "priceRange": "Wellness & Clinic Hub"
  },
  {
    "id": "sc-residences",
    "name": "SC residences (Saladaeng One)",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "เรสซิเดนซ์ระดับซูเปอร์ลักชัวรี",
    "categoryColor": "#C2703C",
    "developer": "SC ASSET",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#C2703C",
    "color": "#B86B43",
    "height": 145,
    "floors": 35,
    "district": "บางรัก",
    "location": "ศาลาแดง ซ.1 และ ถ.พระราม 4",
    "lat": 13.72648,
    "lon": 100.54265,
    "desc": "โครงการคอนโดมิเนียมระดับ Ultimate Luxury โดย SC Asset (Saladaeng One) วิวสวนลุมพินีแบบพาโนรามา",
    "footprint": [
      [
        100.54253,
        13.72629
      ],
      [
        100.54286,
        13.72641
      ],
      [
        100.54276,
        13.72666
      ],
      [
        100.54243,
        13.72654
      ],
      [
        100.54253,
        13.72629
      ]
    ],
    "parts": [
      {
        "name": "Saladaeng One White Marble Podium",
        "color": "#F1F5F9",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.5423,
            13.7261
          ],
          [
            100.543,
            13.7261
          ],
          [
            100.543,
            13.7268
          ],
          [
            100.5423,
            13.7268
          ],
          [
            100.5423,
            13.7261
          ]
        ]
      },
      {
        "name": "Main Luxury Tower Facing Lumphini Park",
        "color": "#C2703C",
        "height": 145,
        "min_height": 26,
        "footprint": [
          [
            100.5424,
            13.7263
          ],
          [
            100.5428,
            13.7263
          ],
          [
            100.5428,
            13.7267
          ],
          [
            100.5424,
            13.7267
          ],
          [
            100.5424,
            13.7263
          ]
        ]
      }
    ],
    "unitTypes": [],
    "transport": [
      {
        "name": "MRT Lumphini (BL25)",
        "dist": "350 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [],
    "priceRange": "฿13M – ฿68M"
  },
  {
    "id": "sappaya-sapasathan",
    "name": "สัปปายะสภาสถาน (The National Assembly)",
    "brandId": "govt",
    "brandName": "รัฐสภาไทย",
    "category": "ศูนย์ราชการระดับชาติ",
    "categoryColor": "#EAB308",
    "developer": "รัฐสภาไทย / The Parliament of Thailand",
    "developerSite": "https://www.parliament.go.th/",
    "image": "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#B45309",
    "color": "#D97706",
    "height": 134,
    "floors": 11,
    "units": 800,
    "unitsPerFloor": 75,
    "parking": 3000,
    "parkingRatio": "250%",
    "landRai": 123,
    "facilitiesM2": "424,000 m²",
    "priceRange": "฿22,988M (Government Budget)",
    "district": "ดุสิต",
    "location": "เกียกกาย ถ.สามเสน เขตดุสิต กรุงเทพฯ",
    "lat": 13.7963,
    "lon": 100.5186,
    "desc": "อาคารรัฐสภาไทยแห่งใหม่ริมแม่น้ำเจ้าพระยา ออกแบบด้วยสถาปัตยกรรมไทยร่วมสมัยตามคติเขาพระสุเมรุ เป็นศูนย์กลางฝ่ายนิติบัญญัติของประเทศและอาคารรัฐสภาที่ใหญ่ที่สุดแห่งหนึ่งของโลก",
    "footprint": [
      [
        100.517,
        13.7946
      ],
      [
        100.5204,
        13.7946
      ],
      [
        100.5204,
        13.7982
      ],
      [
        100.517,
        13.7982
      ],
      [
        100.517,
        13.7946
      ]
    ],
    "parts": [
      {
        "name": "Riverside Plaza & Lower Promenade",
        "color": "#CBD5E1",
        "height": 6,
        "min_height": 0,
        "footprint": [
          [
            100.5162,
            13.7946
          ],
          [
            100.5174,
            13.7946
          ],
          [
            100.5174,
            13.7982
          ],
          [
            100.5162,
            13.7982
          ],
          [
            100.5162,
            13.7946
          ]
        ]
      },
      {
        "name": "Main Parliamentary Complex Base (11 Floors)",
        "color": "#D5CAB6",
        "height": 28,
        "min_height": 0,
        "footprint": [
          [
            100.5172,
            13.7944
          ],
          [
            100.5204,
            13.7944
          ],
          [
            100.5204,
            13.7982
          ],
          [
            100.5172,
            13.7982
          ],
          [
            100.5172,
            13.7944
          ]
        ]
      },
      {
        "name": "South Wing - Suryan Chamber (สภาผู้แทนราษฎร)",
        "color": "#C2410C",
        "height": 46,
        "min_height": 26,
        "footprint": [
          [
            100.5178,
            13.7946
          ],
          [
            100.5198,
            13.7946
          ],
          [
            100.5202,
            13.7952
          ],
          [
            100.5198,
            13.7958
          ],
          [
            100.5178,
            13.7958
          ],
          [
            100.5174,
            13.7952
          ],
          [
            100.5178,
            13.7946
          ]
        ]
      },
      {
        "name": "North Wing - Chandra Chamber (วุฒิสภา)",
        "color": "#B45309",
        "height": 46,
        "min_height": 26,
        "footprint": [
          [
            100.5178,
            13.7968
          ],
          [
            100.5198,
            13.7968
          ],
          [
            100.5202,
            13.7974
          ],
          [
            100.5198,
            13.798
          ],
          [
            100.5178,
            13.798
          ],
          [
            100.5174,
            13.7974
          ],
          [
            100.5178,
            13.7968
          ]
        ]
      },
      {
        "name": "Central Mount Meru Hall Base (ฐานมณฑปเขาพระสุเมรุ)",
        "color": "#D97706",
        "height": 58,
        "min_height": 28,
        "footprint": [
          [
            100.518,
            13.7957
          ],
          [
            100.5196,
            13.7957
          ],
          [
            100.5196,
            13.7969
          ],
          [
            100.518,
            13.7969
          ],
          [
            100.518,
            13.7957
          ]
        ]
      },
      {
        "name": "Golden Spire Tier 1 (ยอดมณฑปเจดีย์ทองคำ)",
        "color": "#F59E0B",
        "height": 92,
        "min_height": 58,
        "footprint": [
          [
            100.5183,
            13.796
          ],
          [
            100.5193,
            13.796
          ],
          [
            100.5193,
            13.7966
          ],
          [
            100.5183,
            13.7966
          ],
          [
            100.5183,
            13.796
          ]
        ]
      },
      {
        "name": "Golden Spire Peak (ยอดเจดีย์ทองคำ 134m)",
        "color": "#FDE047",
        "height": 134,
        "min_height": 92,
        "footprint": [
          [
            100.5185,
            13.7961
          ],
          [
            100.5191,
            13.7961
          ],
          [
            100.5191,
            13.7965
          ],
          [
            100.5185,
            13.7965
          ],
          [
            100.5185,
            13.7961
          ]
        ]
      },
      {
        "name": "Samsen Forecourt Gateway",
        "color": "#E2E8F0",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.5204,
            13.7957
          ],
          [
            100.5212,
            13.7957
          ],
          [
            100.5212,
            13.7969
          ],
          [
            100.5204,
            13.7969
          ],
          [
            100.5204,
            13.7957
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ห้องประชุมสุริยัน (สภาผู้แทนราษฎร)",
        "size": "800 ที่นั่ง"
      },
      {
        "label": "ห้องประชุมจันทรา (วุฒิสภา)",
        "size": "300 ที่นั่ง"
      },
      {
        "label": "พิพิธภัณฑ์ประชาธิปไตย",
        "size": "3,500 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT บางโพ (BL09)",
        "dist": "850 m",
        "type": "mrt"
      },
      {
        "name": "ท่าเรือเกียกกาย (Sappaya Pier)",
        "dist": "150 m",
        "type": "boat"
      },
      {
        "name": "MRT เตาปูน (BL10/PP16)",
        "dist": "1.8 km",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Chao Phraya Riverfront",
        "kind": "River",
        "color": "#0284C7",
        "lat": 13.796,
        "lon": 100.517,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "the-forestias",
    "name": "The Forestias (MQDC)",
    "brandId": "mqdc",
    "brandName": "MQDC",
    "category": "มิกซ์ยูสเมืองในป่า",
    "categoryColor": "#10B981",
    "developer": "MQDC (Magnolia Quality Development)",
    "developerSite": "https://mqdc.com/our-business/theme-project/theforestias",
    "image": "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#059669",
    "color": "#047857",
    "height": 180,
    "floors": 42,
    "units": 1400,
    "unitsPerFloor": 12,
    "parking": 2800,
    "parkingRatio": "200%",
    "landRai": 398,
    "facilitiesM2": "50,000 m² Forest",
    "priceRange": "฿15M – ฿350M",
    "district": "บางนา",
    "location": "บางนา–ตราด กม.7 กรุงเทพฯ",
    "lat": 13.6582,
    "lon": 100.672,
    "desc": "โครงการมิกซ์ยูสเมืองในป่าแห่งแรกของโลก พื้นที่กว่า 398 ไร่ พร้อมผืนป่าขนาด 30 ไร่ใจกลางโครงการ รวมที่อยู่อาศัยระดับ Ultra Luxury: Six Senses Residences, Mulberry Grove, The Aspen Tree และ Whizdom",
    "footprint": [
      [
        100.67,
        13.6565
      ],
      [
        100.6745,
        13.6565
      ],
      [
        100.6745,
        13.6605
      ],
      [
        100.67,
        13.6605
      ],
      [
        100.67,
        13.6565
      ]
    ],
    "parts": [
      {
        "name": "30-Rai Central Forest Biosphere Canopy",
        "color": "#047857",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.6695,
            13.656
          ],
          [
            100.675,
            13.656
          ],
          [
            100.675,
            13.661
          ],
          [
            100.6695,
            13.661
          ],
          [
            100.6695,
            13.656
          ]
        ]
      },
      {
        "name": "Six Senses & Mulberry Grove Luxury Villas",
        "color": "#78350F",
        "height": 40,
        "min_height": 0,
        "footprint": [
          [
            100.67,
            13.6565
          ],
          [
            100.6722,
            13.6565
          ],
          [
            100.6722,
            13.6585
          ],
          [
            100.67,
            13.6585
          ],
          [
            100.67,
            13.6565
          ]
        ]
      },
      {
        "name": "Whizdom Forest Condominium Towers (180m)",
        "color": "#10B981",
        "height": 180,
        "min_height": 18,
        "footprint": [
          [
            100.6725,
            13.6585
          ],
          [
            100.6745,
            13.6585
          ],
          [
            100.6745,
            13.6605
          ],
          [
            100.6725,
            13.6605
          ],
          [
            100.6725,
            13.6585
          ]
        ]
      },
      {
        "name": "The Aspen Tree Wellness Tower (120m)",
        "color": "#059669",
        "height": 120,
        "min_height": 18,
        "footprint": [
          [
            100.6725,
            13.6565
          ],
          [
            100.6745,
            13.6565
          ],
          [
            100.6745,
            13.6582
          ],
          [
            100.6725,
            13.6582
          ],
          [
            100.6725,
            13.6565
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Whizdom Condominium",
        "size": "34 – 150 m²"
      },
      {
        "label": "Mulberry Grove Villas",
        "size": "1,000 – 1,700 m²"
      },
      {
        "label": "Six Senses Residences",
        "size": "790 – 1,400 m²"
      },
      {
        "label": "The Aspen Tree (Wellness)",
        "size": "83 – 250 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT ศรีเอี่ยม (YL17)",
        "dist": "1.9 km",
        "type": "mrt"
      },
      {
        "name": "BTS บางนา (E13)",
        "dist": "6.5 km",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Mega Bangna",
        "kind": "Shopping",
        "color": "#059669",
        "lat": 13.6465,
        "lon": 100.6805,
        "dist": "1.5 km"
      }
    ]
  },
  {
    "id": "em-district",
    "name": "The EM District (EmSphere / EmQuartier)",
    "brandId": "themall",
    "brandName": "The Mall Group",
    "category": "ค้าปลีกและบันเทิงระดับโลก",
    "categoryColor": "#EC4899",
    "developer": "The Mall Group",
    "developerSite": "https://emsphere.co.th/",
    "image": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DB2777",
    "color": "#BE185D",
    "height": 165,
    "floors": 38,
    "units": 650,
    "unitsPerFloor": 10,
    "parking": 4500,
    "parkingRatio": "150%",
    "landRai": 50,
    "facilitiesM2": "650,000 m²",
    "priceRange": "World-class Retail Hub",
    "district": "คลองเตย",
    "location": "ถ.สุขุมวิท พร้อมพงษ์ กรุงเทพฯ",
    "lat": 13.7315,
    "lon": 100.5695,
    "desc": "ย่านการค้าและบันเทิงระดับโลกใจกลางสุขุมวิท ประกอบด้วย Emporium, EmQuartier และ EmSphere พร้อม UOB Live Arena ความจุ 6,000 ที่นั่ง และ IKEA City Store",
    "footprint": [
      [
        100.5678,
        13.7298
      ],
      [
        100.5712,
        13.7298
      ],
      [
        100.5712,
        13.7332
      ],
      [
        100.5678,
        13.7332
      ],
      [
        100.5678,
        13.7298
      ]
    ],
    "parts": [
      {
        "name": "EmSphere Retail Podium & Glass Dome",
        "color": "#DB2777",
        "height": 42,
        "min_height": 0,
        "footprint": [
          [
            100.5678,
            13.7298
          ],
          [
            100.5712,
            13.7298
          ],
          [
            100.5712,
            13.7332
          ],
          [
            100.5678,
            13.7332
          ],
          [
            100.5678,
            13.7298
          ]
        ]
      },
      {
        "name": "UOB Live Arena & Sphere Hall",
        "color": "#9D174D",
        "height": 75,
        "min_height": 40,
        "footprint": [
          [
            100.5682,
            13.7318
          ],
          [
            100.5702,
            13.7318
          ],
          [
            100.5702,
            13.733
          ],
          [
            100.5682,
            13.733
          ],
          [
            100.5682,
            13.7318
          ]
        ]
      },
      {
        "name": "Bhiraj Tower Skyscraper (165m)",
        "color": "#0284C7",
        "height": 165,
        "min_height": 40,
        "footprint": [
          [
            100.5695,
            13.7302
          ],
          [
            100.5708,
            13.7302
          ],
          [
            100.5708,
            13.7315
          ],
          [
            100.5695,
            13.7315
          ],
          [
            100.5695,
            13.7302
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "EmSphere Retail & Dining",
        "size": "200,000 m²"
      },
      {
        "label": "UOB Live Arena",
        "size": "6,000 Seats"
      },
      {
        "label": "IKEA Sukhumvit",
        "size": "12,000 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS พร้อมพงษ์ (E5) Skywalk Direct",
        "dist": "50 m",
        "type": "bts"
      },
      {
        "name": "MRT สุขุมวิท (BL22)",
        "dist": "1.1 km",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Benjasiri Park",
        "kind": "Park",
        "color": "#059669",
        "lat": 13.7305,
        "lon": 100.5678,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "central-embassy",
    "name": "Central Embassy & Ploenchit",
    "brandId": "cpn",
    "brandName": "Central Group",
    "category": "ค้าปลีกและโรงแรมระดับอัลตราลักชัวรี",
    "categoryColor": "#8B5CF6",
    "developer": "Central Group",
    "developerSite": "https://www.centralembassy.com/",
    "image": "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#7C3AED",
    "color": "#6D28D9",
    "height": 154,
    "floors": 37,
    "units": 222,
    "unitsPerFloor": 6,
    "parking": 1400,
    "parkingRatio": "180%",
    "landRai": 9,
    "facilitiesM2": "144,000 m²",
    "priceRange": "Luxury Flagship & Hotel",
    "district": "ปทุมวัน",
    "location": "ถ.เพลินจิต เขตปทุมวัน กรุงเทพฯ",
    "lat": 13.7442,
    "lon": 100.5465,
    "desc": "แลนด์มาร์กอัลตร้าลักชัวรีรูปทรงอินฟินิตี้บนที่ดินสถานทูตอังกฤษเดิม รวมแฟลกชิปสโตร์ระดับไฮเอนด์ ศูนย์รวมศิลปะ OPEN HOUSE และโรงแรม 6 ดาว Park Hyatt Bangkok",
    "footprint": [
      [
        100.5452,
        13.7432
      ],
      [
        100.548,
        13.7432
      ],
      [
        100.548,
        13.7455
      ],
      [
        100.5452,
        13.7455
      ],
      [
        100.5452,
        13.7432
      ]
    ],
    "parts": [
      {
        "name": "Central Embassy Infinity Loop Retail Base",
        "color": "#E2E8F0",
        "height": 35,
        "min_height": 0,
        "footprint": [
          [
            100.5452,
            13.7432
          ],
          [
            100.548,
            13.7432
          ],
          [
            100.548,
            13.7455
          ],
          [
            100.5452,
            13.7455
          ],
          [
            100.5452,
            13.7432
          ]
        ]
      },
      {
        "name": "Park Hyatt Bangkok Hotel Tower (154m)",
        "color": "#7C3AED",
        "height": 154,
        "min_height": 35,
        "footprint": [
          [
            100.5458,
            13.7436
          ],
          [
            100.5472,
            13.7436
          ],
          [
            100.5472,
            13.7448
          ],
          [
            100.5458,
            13.7448
          ],
          [
            100.5458,
            13.7436
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Park Hyatt Bangkok Hotel",
        "size": "222 Rooms"
      },
      {
        "label": "OPEN HOUSE Art & Books",
        "size": "4,600 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS เพลินจิต (E2) Skybridge",
        "dist": "100 m",
        "type": "bts"
      },
      {
        "name": "BTS ชิดลม (E1)",
        "dist": "350 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Chidlom",
        "kind": "Shopping",
        "color": "#059669",
        "lat": 13.7441,
        "lon": 100.5432,
        "dist": "300 m"
      }
    ]
  },
  {
    "id": "krungthep-aphiwat",
    "name": "สถานีกลางกรุงเทพอภิวัฒน์ (Grand Central)",
    "brandId": "govt",
    "brandName": "SRT การรถไฟฯ",
    "category": "ศูนย์กลางคมนาคมแห่งชาติ",
    "categoryColor": "#0284C7",
    "developer": "การรถไฟแห่งประเทศไทย (SRT)",
    "developerSite": "https://www.railway.co.th/",
    "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0369A1",
    "height": 95,
    "floors": 4,
    "units": 24,
    "unitsPerFloor": 6,
    "parking": 1700,
    "parkingRatio": "100%",
    "landRai": 2325,
    "facilitiesM2": "274,192 m²",
    "priceRange": "฿34,142M (SRT Megaproject)",
    "district": "จตุจักร",
    "location": "บางซื่อ เขตจตุจักร กรุงเทพฯ",
    "lat": 13.8035,
    "lon": 100.5398,
    "desc": "ศูนย์กลางการขนส่งระบบรางที่ใหญ่ที่สุดในเอเชียตะวันออกเฉียงใต้ 24 ชานชาลา รองรับรถไฟทางไกล รถไฟชานเมืองสายสีแดง รถไฟฟ้าความเร็วสูงเชื่อม 3 สนามบิน และรถไฟฟ้า MRT สายสีน้ำเงิน",
    "footprint": [
      [
        100.537,
        13.7995
      ],
      [
        100.5425,
        13.7995
      ],
      [
        100.5425,
        13.8075
      ],
      [
        100.537,
        13.8075
      ],
      [
        100.537,
        13.7995
      ]
    ],
    "parts": [
      {
        "name": "24-Platform Vaulted Roof Terminal Hall",
        "color": "#0284C7",
        "height": 42,
        "min_height": 0,
        "footprint": [
          [
            100.537,
            13.7995
          ],
          [
            100.5425,
            13.7995
          ],
          [
            100.5425,
            13.8075
          ],
          [
            100.537,
            13.8075
          ],
          [
            100.537,
            13.7995
          ]
        ]
      },
      {
        "name": "Central Transit Clock Tower & Office Atrium (95m)",
        "color": "#0369A1",
        "height": 95,
        "min_height": 42,
        "footprint": [
          [
            100.539,
            13.8025
          ],
          [
            100.5406,
            13.8025
          ],
          [
            100.5406,
            13.8045
          ],
          [
            100.539,
            13.8045
          ],
          [
            100.539,
            13.8025
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ชานชาลารถไฟทางไกล & ชานเมือง (24 ชานชาลา)",
        "size": "274,192 m²"
      }
    ],
    "transport": [
      {
        "name": "SRT สายสีแดงเข้ม / สีแดงอ่อน",
        "dist": "0 m",
        "type": "bts"
      },
      {
        "name": "MRT บางซื่อ (BL11)",
        "dist": "50 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Chatuchak Weekend Market",
        "kind": "Market",
        "color": "#D97706",
        "lat": 13.7995,
        "lon": 100.5505,
        "dist": "1.2 km"
      }
    ]
  },
  {
    "id": "true-digital-park",
    "name": "True Digital Park (TDPK)",
    "brandId": "mqdc",
    "brandName": "MQDC & True",
    "category": "ศูนย์รวมเทคโนโลยีและนวัตกรรม",
    "categoryColor": "#F97316",
    "developer": "MQDC & True Corporation",
    "developerSite": "https://www.truedigitalpark.com/",
    "image": "https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 125,
    "floors": 28,
    "units": 1100,
    "unitsPerFloor": 30,
    "parking": 2200,
    "parkingRatio": "120%",
    "landRai": 43,
    "facilitiesM2": "200,000 m²",
    "priceRange": "Southeast Asia Tech Hub",
    "district": "พระโขนง",
    "location": "สุขุมวิท 101 ปุณณวิถี กรุงเทพฯ",
    "lat": 13.6872,
    "lon": 100.611,
    "desc": "ศูนย์กลางเทคและสตาร์ทอัพที่ใหญ่ที่สุดในเอเชียตะวันออกเฉียงใต้ พื้นที่มิกซ์ยูสผสาน Co-working, สถาบันบ่มเพาะธุรกิจดิจิทัล 101 True Digital Park Retail และคอนโดมิเนียม Whizdom 101",
    "footprint": [
      [
        100.6092,
        13.6855
      ],
      [
        100.6128,
        13.6855
      ],
      [
        100.6128,
        13.6892
      ],
      [
        100.6092,
        13.6892
      ],
      [
        100.6092,
        13.6855
      ]
    ],
    "parts": [
      {
        "name": "101 The Third Place Lifestyle Open-Air Base",
        "color": "#EA580C",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [
            100.6092,
            13.6855
          ],
          [
            100.6128,
            13.6855
          ],
          [
            100.6128,
            13.6892
          ],
          [
            100.6092,
            13.6892
          ],
          [
            100.6092,
            13.6855
          ]
        ]
      },
      {
        "name": "Tech Startup Campus & Innovation Hall",
        "color": "#F97316",
        "height": 65,
        "min_height": 25,
        "footprint": [
          [
            100.61,
            13.686
          ],
          [
            100.612,
            13.686
          ],
          [
            100.612,
            13.6878
          ],
          [
            100.61,
            13.6878
          ],
          [
            100.61,
            13.686
          ]
        ]
      },
      {
        "name": "Whizdom 101 Connect & Inspire Tower (125m)",
        "color": "#0284C7",
        "height": 125,
        "min_height": 25,
        "footprint": [
          [
            100.6102,
            13.6878
          ],
          [
            100.6118,
            13.6878
          ],
          [
            100.6118,
            13.689
          ],
          [
            100.6102,
            13.689
          ],
          [
            100.6102,
            13.6878
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Tech Startup & VC Campus",
        "size": "77,000 m²"
      },
      {
        "label": "101 The Third Place Retail",
        "size": "40,000 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ปุณณวิถี (E11) Skywalk",
        "dist": "250 m",
        "type": "bts"
      },
      {
        "name": "BTS อุดมสุข (E12)",
        "dist": "650 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "101 The Third Place",
        "kind": "Mall",
        "color": "#059669",
        "lat": 13.687,
        "lon": 100.6105,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "rhythm-charoenkrung",
    "name": "Rhythm Charoenkrung Pavillion",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมระดับลักชัวรี",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/th/condominium/rhythm/rhythm-charoenkrung-pavillion",
    "image": "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#991B1B",
    "height": 168,
    "floors": 44,
    "units": 421,
    "unitsPerFloor": 12,
    "parking": 421,
    "parkingRatio": "100%",
    "landRai": 4.2,
    "facilitiesM2": "Sky Lounge & Riverfront Courtyard",
    "priceRange": "฿5.9M – ฿25M",
    "district": "บางคอแหลม",
    "location": "ถ.เจริญกรุง ตรงข้าม รร.นานาชาติโชรส์เบอรี",
    "lat": 13.7126,
    "lon": 100.5108,
    "desc": "คอนโดมิเนียมหรูริมแม่น้ำเจ้าพระยา ออกแบบภายใต้แนวคิด The Luxury Gated Community วิวแม่น้ำพาโนรามา ใกล้ รร.นานาชาติโชรส์เบอรี พร้อม Sky Facilities ลอยฟ้า 3 ชั้น",
    "footprint": [
      [
        100.51032,
        13.712254
      ],
      [
        100.51128,
        13.712254
      ],
      [
        100.51128,
        13.712946
      ],
      [
        100.51032,
        13.712946
      ],
      [
        100.51032,
        13.712254
      ]
    ],
    "parts": [
      {
        "name": "Rhythm Charoenkrung Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.51032,
            13.712254
          ],
          [
            100.51128,
            13.712254
          ],
          [
            100.51128,
            13.712946
          ],
          [
            100.51032,
            13.712946
          ],
          [
            100.51032,
            13.712254
          ]
        ]
      },
      {
        "name": "Rhythm Charoenkrung Residential Tower",
        "color": "#991B1B",
        "height": 148,
        "min_height": 26,
        "footprint": [
          [
            100.51046,
            13.712355
          ],
          [
            100.51114,
            13.712355
          ],
          [
            100.51114,
            13.712845
          ],
          [
            100.51046,
            13.712845
          ],
          [
            100.51046,
            13.712355
          ]
        ]
      },
      {
        "name": "Rhythm Charoenkrung Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 168,
        "min_height": 148,
        "footprint": [
          [
            100.51058,
            13.712442
          ],
          [
            100.51102,
            13.712442
          ],
          [
            100.51102,
            13.712758
          ],
          [
            100.51058,
            13.712758
          ],
          [
            100.51058,
            13.712442
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Plus",
        "size": "35.00 – 42.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "75.50 – 102.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "134.00 – 228.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS สะพานตากสิน (S6)",
        "dist": "1.1 km",
        "type": "bts"
      },
      {
        "name": "ท่าเรือด่วนสาทร",
        "dist": "1.1 km",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Shrewsbury International School",
        "kind": "Education",
        "color": "#EC4899",
        "lat": 13.713,
        "lon": 100.5102,
        "dist": "50 m"
      },
      {
        "name": "Asiatique The Riverfront",
        "kind": "Lifestyle",
        "color": "#F59E0B",
        "lat": 13.7045,
        "lon": 100.5032,
        "dist": "1.2 km"
      }
    ]
  },
  {
    "id": "rhythm-asoke",
    "name": "Rhythm Asoke",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมไฮไรส์",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#B91C1C",
    "height": 135,
    "floors": 37,
    "units": 385,
    "unitsPerFloor": 14,
    "parking": 180,
    "parkingRatio": "47%",
    "landRai": 1.6,
    "facilitiesM2": "Double Sky Facilities",
    "priceRange": "฿3.9M – ฿12M",
    "district": "ราชเทวี",
    "location": "ถ.อโศก-ดินแดง ใกล้ MRT พระราม 9",
    "lat": 13.7548,
    "lon": 100.5645,
    "desc": "คอนโดมิเนียมไฮไรส์ใจกลาง New CBD พระราม 9 ใกล้ MRT พระราม 9 เพียง 300 ม. โดดเด่นด้วย Sky Facilities 2 ชั้น วิวพาโนรามามหานคร",
    "footprint": [
      [
        100.56408,
        13.754498
      ],
      [
        100.56492,
        13.754498
      ],
      [
        100.56492,
        13.755102
      ],
      [
        100.56408,
        13.755102
      ],
      [
        100.56408,
        13.754498
      ]
    ],
    "parts": [
      {
        "name": "Rhythm Asoke Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.56402,
            13.754454
          ],
          [
            100.56498,
            13.754454
          ],
          [
            100.56498,
            13.755146
          ],
          [
            100.56402,
            13.755146
          ],
          [
            100.56402,
            13.754454
          ]
        ]
      },
      {
        "name": "Rhythm Asoke Residential Tower",
        "color": "#B91C1C",
        "height": 119,
        "min_height": 22,
        "footprint": [
          [
            100.56416,
            13.754555
          ],
          [
            100.56484,
            13.754555
          ],
          [
            100.56484,
            13.755045
          ],
          [
            100.56416,
            13.755045
          ],
          [
            100.56416,
            13.754555
          ]
        ]
      },
      {
        "name": "Rhythm Asoke Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 135,
        "min_height": 119,
        "footprint": [
          [
            100.56428,
            13.754642
          ],
          [
            100.56472,
            13.754642
          ],
          [
            100.56472,
            13.754958
          ],
          [
            100.56428,
            13.754958
          ],
          [
            100.56428,
            13.754642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "21.50 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "31.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "41.50 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT พระราม 9 (BL20)",
        "dist": "300 m",
        "type": "mrt"
      },
      {
        "name": "ARL มักกะสัน (A6)",
        "dist": "450 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Rama 9",
        "kind": "Shopping",
        "color": "#D97706",
        "lat": 13.758,
        "lon": 100.566,
        "dist": "350 m"
      },
      {
        "name": "Fortune Town",
        "kind": "IT & Mall",
        "color": "#2563EB",
        "lat": 13.757,
        "lon": 100.564,
        "dist": "300 m"
      }
    ]
  },
  {
    "id": "rhythm-sathorn",
    "name": "Rhythm Sathorn",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมไฮไรส์",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#991B1B",
    "height": 140,
    "floors": 41,
    "units": 562,
    "unitsPerFloor": 16,
    "parking": 320,
    "parkingRatio": "57%",
    "landRai": 4.1,
    "facilitiesM2": "Double Volume Sky Pool",
    "priceRange": "฿5.2M – ฿18M",
    "district": "สาทร",
    "location": "ถ.สาทรใต้ ใกล้ BTS สะพานตากสิน",
    "lat": 13.7198,
    "lon": 100.5165,
    "desc": "คอนโดมิเนียมหรูใจกลางสาทร เชื่อมต่อสะพานตากสินและท่าเรือสาทร วิวแม่น้ำเจ้าพระยาและโค้งน้ำบางกระเจ้า พร้อม Sky Lounge ลอยฟ้า",
    "footprint": [
      [
        100.51605,
        13.719476
      ],
      [
        100.51695,
        13.719476
      ],
      [
        100.51695,
        13.720124
      ],
      [
        100.51605,
        13.720124
      ],
      [
        100.51605,
        13.719476
      ]
    ],
    "parts": [
      {
        "name": "Rhythm Sathorn Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.51602,
            13.719454
          ],
          [
            100.51698,
            13.719454
          ],
          [
            100.51698,
            13.720146
          ],
          [
            100.51602,
            13.720146
          ],
          [
            100.51602,
            13.719454
          ]
        ]
      },
      {
        "name": "Rhythm Sathorn Residential Tower",
        "color": "#991B1B",
        "height": 123,
        "min_height": 22,
        "footprint": [
          [
            100.51616,
            13.719555
          ],
          [
            100.51684,
            13.719555
          ],
          [
            100.51684,
            13.720045
          ],
          [
            100.51616,
            13.720045
          ],
          [
            100.51616,
            13.719555
          ]
        ]
      },
      {
        "name": "Rhythm Sathorn Sky Facilities & Crown",
        "color": "#60A5FA",
        "height": 140,
        "min_height": 123,
        "footprint": [
          [
            100.51628,
            13.719642
          ],
          [
            100.51672,
            13.719642
          ],
          [
            100.51672,
            13.719958
          ],
          [
            100.51628,
            13.719958
          ],
          [
            100.51628,
            13.719642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "35.00 – 45.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "62.00 – 67.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS สะพานตากสิน (S6)",
        "dist": "250 m",
        "type": "bts"
      },
      {
        "name": "BTS สุรศักดิ์ (S5)",
        "dist": "500 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Robinson Bangrak",
        "kind": "Shopping",
        "color": "#059669",
        "lat": 13.719,
        "lon": 100.515,
        "dist": "280 m"
      },
      {
        "name": "Lerdsin Hospital",
        "kind": "Hospital",
        "color": "#DC2626",
        "lat": 13.7225,
        "lon": 100.5175,
        "dist": "400 m"
      }
    ]
  },
  {
    "id": "rhythm-sukhumvit-36",
    "name": "Rhythm Sukhumvit 36-38",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมระดับพรีเมียม",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#B91C1C",
    "height": 125,
    "floors": 35,
    "units": 496,
    "unitsPerFloor": 16,
    "parking": 248,
    "parkingRatio": "50%",
    "landRai": 2.2,
    "facilitiesM2": "Japanese Garden & Onsen",
    "priceRange": "฿6.2M – ฿22M",
    "district": "คลองเตย",
    "location": "สุขุมวิท 36 ใกล้ BTS ทองหล่อ",
    "lat": 13.7215,
    "lon": 100.5782,
    "desc": "คอนโดระดับพรีเมียมในซอยสุขุมวิท 36 ใกล้ BTS ทองหล่อเพียง 350 ม. ผสานธรรมชาติสไตล์โมเดิร์นเจแปนนิส พร้อม Onsen บนชั้นดาดฟ้า",
    "footprint": [
      [
        100.57778,
        13.721198
      ],
      [
        100.57862,
        13.721198
      ],
      [
        100.57862,
        13.721802
      ],
      [
        100.57778,
        13.721802
      ],
      [
        100.57778,
        13.721198
      ]
    ],
    "parts": [
      {
        "name": "Rhythm Sukhumvit 36 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 20,
        "min_height": 0,
        "footprint": [
          [
            100.57772,
            13.721154
          ],
          [
            100.57868,
            13.721154
          ],
          [
            100.57868,
            13.721846
          ],
          [
            100.57772,
            13.721846
          ],
          [
            100.57772,
            13.721154
          ]
        ]
      },
      {
        "name": "Rhythm Sukhumvit 36 Residential Tower",
        "color": "#B91C1C",
        "height": 110,
        "min_height": 20,
        "footprint": [
          [
            100.57786,
            13.721255
          ],
          [
            100.57854,
            13.721255
          ],
          [
            100.57854,
            13.721745
          ],
          [
            100.57786,
            13.721745
          ],
          [
            100.57786,
            13.721255
          ]
        ]
      },
      {
        "name": "Rhythm Sukhumvit 36 Sky Facilities & Crown",
        "color": "#10B981",
        "height": 125,
        "min_height": 110,
        "footprint": [
          [
            100.57798,
            13.721342
          ],
          [
            100.57842,
            13.721342
          ],
          [
            100.57842,
            13.721658
          ],
          [
            100.57798,
            13.721658
          ],
          [
            100.57798,
            13.721342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "24.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "33.00 – 49.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "54.50 – 86.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ทองหล่อ (E6)",
        "dist": "350 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "T-One Building",
        "kind": "Office",
        "color": "#3B82F6",
        "lat": 13.7235,
        "lon": 100.5795,
        "dist": "300 m"
      },
      {
        "name": "Major Cineplex Sukhumvit",
        "kind": "Cinema",
        "color": "#EF4444",
        "lat": 13.7202,
        "lon": 100.584,
        "dist": "700 m"
      }
    ]
  },
  {
    "id": "rhythm-phahon-ari",
    "name": "Rhythm Phahon-Ari",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมไฮไรส์",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#991B1B",
    "height": 178,
    "floors": 53,
    "units": 809,
    "unitsPerFloor": 18,
    "parking": 480,
    "parkingRatio": "60%",
    "landRai": 5.1,
    "facilitiesM2": "High-level Sky Pool 53rd Fl",
    "priceRange": "฿4.5M – ฿16M",
    "district": "พญาไท",
    "location": "ถ.พหลโยธิน ใกล้ BTS อารีย์",
    "lat": 13.7842,
    "lon": 100.5462,
    "desc": "แลนด์มาร์กคอนโดมิเนียมสูง 53 ชั้นบนถนนพหลโยธิน ใกล้ BTS อารีย์และสะพานควาย โดดเด่นด้วยสวนส่วนกลางลอยฟ้าและสระว่ายน้ำ 360 องศา",
    "footprint": [
      [
        100.54575,
        13.783876
      ],
      [
        100.54665,
        13.783876
      ],
      [
        100.54665,
        13.784524
      ],
      [
        100.54575,
        13.784524
      ],
      [
        100.54575,
        13.783876
      ]
    ],
    "parts": [
      {
        "name": "Rhythm Phahon-Ari Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.54572,
            13.783854
          ],
          [
            100.54668,
            13.783854
          ],
          [
            100.54668,
            13.784546
          ],
          [
            100.54572,
            13.784546
          ],
          [
            100.54572,
            13.783854
          ]
        ]
      },
      {
        "name": "Rhythm Phahon-Ari Residential Tower",
        "color": "#991B1B",
        "height": 157,
        "min_height": 26,
        "footprint": [
          [
            100.54586,
            13.783955
          ],
          [
            100.54654,
            13.783955
          ],
          [
            100.54654,
            13.784445
          ],
          [
            100.54586,
            13.784445
          ],
          [
            100.54586,
            13.783955
          ]
        ]
      },
      {
        "name": "Rhythm Phahon-Ari Sky Facilities & Crown",
        "color": "#06B6D4",
        "height": 178,
        "min_height": 157,
        "footprint": [
          [
            100.54598,
            13.784042
          ],
          [
            100.54642,
            13.784042
          ],
          [
            100.54642,
            13.784358
          ],
          [
            100.54598,
            13.784358
          ],
          [
            100.54598,
            13.784042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "35.00 – 45.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "65.00 – 67.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS อารีย์ (N5)",
        "dist": "550 m",
        "type": "bts"
      },
      {
        "name": "BTS สะพานควาย (N7)",
        "dist": "550 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "La Villa Ari",
        "kind": "Lifestyle Mall",
        "color": "#10B981",
        "lat": 13.7795,
        "lon": 100.5445,
        "dist": "600 m"
      },
      {
        "name": "Paolo Memorial Hospital",
        "kind": "Hospital",
        "color": "#EF4444",
        "lat": 13.789,
        "lon": 100.5485,
        "dist": "650 m"
      }
    ]
  },
  {
    "id": "life-ladprao",
    "name": "Life Ladprao",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "เมกะคอนโดมิเนียมพรีเมียม",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#B91C1C",
    "height": 165,
    "floors": 45,
    "units": 1615,
    "unitsPerFloor": 36,
    "parking": 720,
    "parkingRatio": "45%",
    "landRai": 7,
    "facilitiesM2": "Panoramic City View Infinity Pool",
    "priceRange": "฿4.2M – ฿14M",
    "district": "จตุจักร",
    "location": "ถ.พหลโยธิน ตรงข้ามเซ็นทรัลลาดพร้าว",
    "lat": 13.8168,
    "lon": 100.5615,
    "desc": "เมกะโปรเจกต์คอนโดมิเนียมระดับพรีเมียมตรงข้ามเซ็นทรัลลาดพร้าว เชื่อมต่อ BTS ห้าแยกลาดพร้าว และ MRT พหลโยธิน แบบ 0 เมตร",
    "footprint": [
      [
        100.56098,
        13.816426
      ],
      [
        100.56202,
        13.816426
      ],
      [
        100.56202,
        13.817174
      ],
      [
        100.56098,
        13.817174
      ],
      [
        100.56098,
        13.816426
      ]
    ],
    "parts": [
      {
        "name": "Life Ladprao Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.56102,
            13.816454
          ],
          [
            100.56198,
            13.816454
          ],
          [
            100.56198,
            13.817146
          ],
          [
            100.56102,
            13.817146
          ],
          [
            100.56102,
            13.816454
          ]
        ]
      },
      {
        "name": "Life Ladprao Residential Tower",
        "color": "#B91C1C",
        "height": 145,
        "min_height": 26,
        "footprint": [
          [
            100.56116,
            13.816555
          ],
          [
            100.56184,
            13.816555
          ],
          [
            100.56184,
            13.817045
          ],
          [
            100.56116,
            13.817045
          ],
          [
            100.56116,
            13.816555
          ]
        ]
      },
      {
        "name": "Life Ladprao Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 165,
        "min_height": 145,
        "footprint": [
          [
            100.56128,
            13.816642
          ],
          [
            100.56172,
            13.816642
          ],
          [
            100.56172,
            13.816958
          ],
          [
            100.56128,
            13.816958
          ],
          [
            100.56128,
            13.816642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "26.00 – 29.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "35.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "48.50 – 75.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ห้าแยกลาดพร้าว (N9)",
        "dist": "50 m",
        "type": "bts"
      },
      {
        "name": "MRT พหลโยธิน (BL14)",
        "dist": "200 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Ladprao",
        "kind": "Shopping",
        "color": "#D97706",
        "lat": 13.8175,
        "lon": 100.5605,
        "dist": "100 m"
      },
      {
        "name": "Union Mall",
        "kind": "Shopping",
        "color": "#EC4899",
        "lat": 13.8135,
        "lon": 100.5612,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "life-one-wireless",
    "name": "Life One Wireless",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมระดับพรีเมียมลักชัวรี",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#991B1B",
    "height": 152,
    "floors": 43,
    "units": 1344,
    "unitsPerFloor": 32,
    "parking": 566,
    "parkingRatio": "42%",
    "landRai": 4.7,
    "facilitiesM2": "Dazzling Sky Pool & Botanical Garden",
    "priceRange": "฿5.5M – ฿24M",
    "district": "ปทุมวัน",
    "location": "ถ.วิทยุ ใกล้ BTS เพลินจิต",
    "lat": 13.7485,
    "lon": 100.5482,
    "desc": "คอนโดระดับไอคอนิกบนถนนวิทยุ ท่ามกลางสถานทูตและห้างหรู Central Embassy พร้อมดาดฟ้า Dazzling Sky Pool ชมวิวมหานครแบบพาโนรามา",
    "footprint": [
      [
        100.54775,
        13.748176
      ],
      [
        100.54865,
        13.748176
      ],
      [
        100.54865,
        13.748824
      ],
      [
        100.54775,
        13.748824
      ],
      [
        100.54775,
        13.748176
      ]
    ],
    "parts": [
      {
        "name": "Life One Wireless Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 24,
        "min_height": 0,
        "footprint": [
          [
            100.54772,
            13.748154
          ],
          [
            100.54868,
            13.748154
          ],
          [
            100.54868,
            13.748846
          ],
          [
            100.54772,
            13.748846
          ],
          [
            100.54772,
            13.748154
          ]
        ]
      },
      {
        "name": "Life One Wireless Residential Tower",
        "color": "#991B1B",
        "height": 134,
        "min_height": 24,
        "footprint": [
          [
            100.54786,
            13.748255
          ],
          [
            100.54854,
            13.748255
          ],
          [
            100.54854,
            13.748745
          ],
          [
            100.54786,
            13.748745
          ],
          [
            100.54786,
            13.748255
          ]
        ]
      },
      {
        "name": "Life One Wireless Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 152,
        "min_height": 134,
        "footprint": [
          [
            100.54798,
            13.748342
          ],
          [
            100.54842,
            13.748342
          ],
          [
            100.54842,
            13.748658
          ],
          [
            100.54798,
            13.748658
          ],
          [
            100.54798,
            13.748342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "24.00 – 28.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "35.00 – 45.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "63.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS เพลินจิต (E2)",
        "dist": "600 m",
        "type": "bts"
      },
      {
        "name": "ท่าเรือสะพานวิทยุ",
        "dist": "50 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Embassy",
        "kind": "Luxury Mall",
        "color": "#D97706",
        "lat": 13.7445,
        "lon": 100.5465,
        "dist": "500 m"
      },
      {
        "name": "BDMS Wellness Clinic",
        "kind": "Health",
        "color": "#0284C7",
        "lat": 13.7475,
        "lon": 100.5475,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "the-address-siam",
    "name": "The Address Siam-Ratchathewi",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมเพรสทีจลักชัวรี",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#7F1D1D",
    "height": 215,
    "floors": 50,
    "units": 880,
    "unitsPerFloor": 20,
    "parking": 449,
    "parkingRatio": "51%",
    "landRai": 3.2,
    "facilitiesM2": "Sky Pool 50th Fl & The Scented Garden",
    "priceRange": "฿8.5M – ฿35M",
    "district": "ราชเทวี",
    "location": "ถ.เพชรบุรี ใกล้ BTS ราชเทวี",
    "lat": 13.7522,
    "lon": 100.5312,
    "desc": "คอนโดมิเนียมระดับเพรสทีจลักชัวรีสูง 50 ชั้น ใกล้ BTS ราชเทวีเพียง 150 ม. เชื่อมต่อสยามพารากอน โดดเด่นด้วยสถาปัตยกรรมคลาสสิกร่วมสมัยและบลูไลม์สโตนสั่งทำพิเศษ",
    "footprint": [
      [
        100.53075,
        13.751876
      ],
      [
        100.53165,
        13.751876
      ],
      [
        100.53165,
        13.752524
      ],
      [
        100.53075,
        13.752524
      ],
      [
        100.53075,
        13.751876
      ]
    ],
    "parts": [
      {
        "name": "The Address Siam Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.53072,
            13.751854
          ],
          [
            100.53168,
            13.751854
          ],
          [
            100.53168,
            13.752546
          ],
          [
            100.53072,
            13.752546
          ],
          [
            100.53072,
            13.751854
          ]
        ]
      },
      {
        "name": "The Address Siam Residential Tower",
        "color": "#7F1D1D",
        "height": 189,
        "min_height": 26,
        "footprint": [
          [
            100.53086,
            13.751955
          ],
          [
            100.53154,
            13.751955
          ],
          [
            100.53154,
            13.752445
          ],
          [
            100.53086,
            13.752445
          ],
          [
            100.53086,
            13.751955
          ]
        ]
      },
      {
        "name": "The Address Siam Sky Facilities & Crown",
        "color": "#FBBF24",
        "height": 215,
        "min_height": 189,
        "footprint": [
          [
            100.53098,
            13.752042
          ],
          [
            100.53142,
            13.752042
          ],
          [
            100.53142,
            13.752358
          ],
          [
            100.53098,
            13.752358
          ],
          [
            100.53098,
            13.752042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "31.00 – 35.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "51.50 – 69.50 m²"
      },
      {
        "label": "Duplex Penthouse",
        "size": "65.00 – 86.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ราชเทวี (N1)",
        "dist": "150 m",
        "type": "bts"
      },
      {
        "name": "BTS พญาไท (N2)",
        "dist": "650 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Siam Paragon",
        "kind": "Luxury Mall",
        "color": "#7C3AED",
        "lat": 13.746,
        "lon": 100.535,
        "dist": "750 m"
      },
      {
        "name": "MBK Center",
        "kind": "Shopping",
        "color": "#059669",
        "lat": 13.7445,
        "lon": 100.53,
        "dist": "850 m"
      }
    ]
  },
  {
    "id": "vittorio-phromphong",
    "name": "VITTORIO Sukhumvit 39",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมอัลตรามาสเตอร์พีซ",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#450A0A",
    "height": 110,
    "floors": 28,
    "units": 88,
    "unitsPerFloor": 4,
    "parking": 142,
    "parkingRatio": "161%",
    "landRai": 1.3,
    "facilitiesM2": "Palissandro Hydrotherapy Club",
    "priceRange": "฿32M – ฿120M",
    "district": "วัฒนา",
    "location": "สุขุมวิท 39 ใกล้ BTS พร้อมพงษ์",
    "lat": 13.7315,
    "lon": 100.5705,
    "desc": "คอนโดมิเนียมระดับอัลตรามาสเตอร์พีซของ AP ตกแต่งด้วยหินอ่อน Palissandro นำเข้าจากอิตาลี ลิฟต์ส่วนตัวทุกยูนิต เพียง 88 ครอบครัว ใกล้ The EmDistrict",
    "footprint": [
      [
        100.5701,
        13.731212
      ],
      [
        100.5709,
        13.731212
      ],
      [
        100.5709,
        13.731788
      ],
      [
        100.5701,
        13.731788
      ],
      [
        100.5701,
        13.731212
      ]
    ],
    "parts": [
      {
        "name": "VITTORIO Sukhumvit 39 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.57002,
            13.731154
          ],
          [
            100.57098,
            13.731154
          ],
          [
            100.57098,
            13.731846
          ],
          [
            100.57002,
            13.731846
          ],
          [
            100.57002,
            13.731154
          ]
        ]
      },
      {
        "name": "VITTORIO Sukhumvit 39 Residential Tower",
        "color": "#450A0A",
        "height": 97,
        "min_height": 18,
        "footprint": [
          [
            100.57016,
            13.731255
          ],
          [
            100.57084,
            13.731255
          ],
          [
            100.57084,
            13.731745
          ],
          [
            100.57016,
            13.731745
          ],
          [
            100.57016,
            13.731255
          ]
        ]
      },
      {
        "name": "VITTORIO Sukhumvit 39 Sky Facilities & Crown",
        "color": "#EAB308",
        "height": 110,
        "min_height": 97,
        "footprint": [
          [
            100.57028,
            13.731342
          ],
          [
            100.57072,
            13.731342
          ],
          [
            100.57072,
            13.731658
          ],
          [
            100.57028,
            13.731658
          ],
          [
            100.57028,
            13.731342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "2 Bedrooms (Vittorio Suite)",
        "size": "100.00 – 140.00 m²"
      },
      {
        "label": "Penthouse",
        "size": "270.00 – 306.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS พร้อมพงษ์ (E5)",
        "dist": "150 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "The EmQuartier",
        "kind": "Luxury Mall",
        "color": "#F59E0B",
        "lat": 13.731,
        "lon": 100.5698,
        "dist": "100 m"
      },
      {
        "name": "The Emporium",
        "kind": "Luxury Mall",
        "color": "#D97706",
        "lat": 13.7295,
        "lon": 100.5688,
        "dist": "200 m"
      }
    ]
  },
  {
    "id": "khun-by-yoo",
    "name": "KHUN by YOO",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมซูเปอร์ลักชัวรี",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/condominium/khunbyyoo/th/",
    "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#14532D",
    "height": 120,
    "floors": 27,
    "units": 148,
    "unitsPerFloor": 6,
    "parking": 149,
    "parkingRatio": "100%",
    "landRai": 1,
    "facilitiesM2": "The Sky Pool & Rooftop Bar",
    "priceRange": "฿21M – ฿85M",
    "district": "วัฒนา",
    "location": "ทองหล่อ 12 (สุขุมวิท 55)",
    "lat": 13.7335,
    "lon": 100.5822,
    "desc": "คอนโดมิเนียมระดับซูเปอร์ลักชัวรีใจกลางทองหล่อ ออกแบบร่วมกับดีไซเนอร์ระดับโลก Philippe Starck และ YOO Studio เอกลักษณ์ Facade ทองแดงผสมกระจกสะท้อนแสง",
    "footprint": [
      [
        100.58178,
        13.733198
      ],
      [
        100.58262,
        13.733198
      ],
      [
        100.58262,
        13.733802
      ],
      [
        100.58178,
        13.733802
      ],
      [
        100.58178,
        13.733198
      ]
    ],
    "parts": [
      {
        "name": "KHUN by YOO Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 19,
        "min_height": 0,
        "footprint": [
          [
            100.58172,
            13.733154
          ],
          [
            100.58268,
            13.733154
          ],
          [
            100.58268,
            13.733846
          ],
          [
            100.58172,
            13.733846
          ],
          [
            100.58172,
            13.733154
          ]
        ]
      },
      {
        "name": "KHUN by YOO Residential Tower",
        "color": "#14532D",
        "height": 106,
        "min_height": 19,
        "footprint": [
          [
            100.58186,
            13.733255
          ],
          [
            100.58254,
            13.733255
          ],
          [
            100.58254,
            13.733745
          ],
          [
            100.58186,
            13.733745
          ],
          [
            100.58186,
            13.733255
          ]
        ]
      },
      {
        "name": "KHUN by YOO Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 120,
        "min_height": 106,
        "footprint": [
          [
            100.58198,
            13.733342
          ],
          [
            100.58242,
            13.733342
          ],
          [
            100.58242,
            13.733658
          ],
          [
            100.58198,
            13.733658
          ],
          [
            100.58198,
            13.733342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "41.50 – 53.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "82.00 – 97.75 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "139.25 – 302.75 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ทองหล่อ (E6)",
        "dist": "1.1 km",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "J Avenue Thonglor",
        "kind": "Lifestyle Mall",
        "color": "#10B981",
        "lat": 13.7345,
        "lon": 100.5828,
        "dist": "150 m"
      },
      {
        "name": "The Commons Thonglor",
        "kind": "Community Mall",
        "color": "#F59E0B",
        "lat": 13.7355,
        "lon": 100.584,
        "dist": "250 m"
      }
    ]
  },
  {
    "id": "the-monument-sanampao",
    "name": "The Monument Sanampao",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมระดับลักชัวรี",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 95,
    "floors": 24,
    "units": 86,
    "unitsPerFloor": 4,
    "parking": 88,
    "parkingRatio": "102%",
    "landRai": 1.1,
    "facilitiesM2": "Sky Pavilion & Heated Pool",
    "priceRange": "฿12M – ฿45M",
    "district": "พญาไท",
    "location": "ถ.พหลโยธิน ติด BTS สนามเป้า",
    "lat": 13.7745,
    "lon": 100.5412,
    "desc": "คอนโดระดับพรีเมียมลักชัวรี ติดสถานี BTS สนามเป้า โดดเด่นด้วยความเป็นส่วนตัวเพียง 86 ยูนิต วัสดุระดับโลกและที่จอดรถเกิน 100%",
    "footprint": [
      [
        100.54082,
        13.774226
      ],
      [
        100.54158,
        13.774226
      ],
      [
        100.54158,
        13.774774
      ],
      [
        100.54082,
        13.774774
      ],
      [
        100.54082,
        13.774226
      ]
    ],
    "parts": [
      {
        "name": "The Monument Sanampao Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.54072,
            13.774154
          ],
          [
            100.54168,
            13.774154
          ],
          [
            100.54168,
            13.774846
          ],
          [
            100.54072,
            13.774846
          ],
          [
            100.54072,
            13.774154
          ]
        ]
      },
      {
        "name": "The Monument Sanampao Residential Tower",
        "color": "#166534",
        "height": 84,
        "min_height": 16,
        "footprint": [
          [
            100.54086,
            13.774255
          ],
          [
            100.54154,
            13.774255
          ],
          [
            100.54154,
            13.774745
          ],
          [
            100.54086,
            13.774745
          ],
          [
            100.54086,
            13.774255
          ]
        ]
      },
      {
        "name": "The Monument Sanampao Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 95,
        "min_height": 84,
        "footprint": [
          [
            100.54098,
            13.774342
          ],
          [
            100.54142,
            13.774342
          ],
          [
            100.54142,
            13.774658
          ],
          [
            100.54098,
            13.774658
          ],
          [
            100.54098,
            13.774342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "46.25 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "73.50 – 89.25 m²"
      },
      {
        "label": "Penthouse",
        "size": "138.25 – 140.25 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS สนามเป้า (N4)",
        "dist": "20 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Phayathai 2 Hospital",
        "kind": "Hospital",
        "color": "#DC2626",
        "lat": 13.773,
        "lon": 100.5405,
        "dist": "180 m"
      },
      {
        "name": "The Seasons Mall",
        "kind": "Mall",
        "color": "#059669",
        "lat": 13.772,
        "lon": 100.54,
        "dist": "250 m"
      }
    ]
  },
  {
    "id": "xt-ekkamai",
    "name": "XT Ekkamai",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมไฮไลฟ์",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#15803D",
    "height": 145,
    "floors": 38,
    "units": 537,
    "unitsPerFloor": 16,
    "parking": 266,
    "parkingRatio": "50%",
    "landRai": 2.2,
    "facilitiesM2": "Olympic 50m Sky Pool & Co-sharing",
    "priceRange": "฿4.8M – ฿16M",
    "district": "วัฒนา",
    "location": "สุขุมวิท 63 (เอกมัย)",
    "lat": 13.7345,
    "lon": 100.5878,
    "desc": "คอนโดมิเนียมสำหรับคนรุ่นใหม่ใจกลางเอกมัย จัดเต็มพื้นที่ Co-sharing Space ลอยฟ้า สระว่ายน้ำ 50 ม. วิวพาโนรามา และ Virtual Fitness",
    "footprint": [
      [
        100.58738,
        13.734198
      ],
      [
        100.58822,
        13.734198
      ],
      [
        100.58822,
        13.734802
      ],
      [
        100.58738,
        13.734802
      ],
      [
        100.58738,
        13.734198
      ]
    ],
    "parts": [
      {
        "name": "XT Ekkamai Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 23,
        "min_height": 0,
        "footprint": [
          [
            100.58732,
            13.734154
          ],
          [
            100.58828,
            13.734154
          ],
          [
            100.58828,
            13.734846
          ],
          [
            100.58732,
            13.734846
          ],
          [
            100.58732,
            13.734154
          ]
        ]
      },
      {
        "name": "XT Ekkamai Residential Tower",
        "color": "#15803D",
        "height": 128,
        "min_height": 23,
        "footprint": [
          [
            100.58746,
            13.734255
          ],
          [
            100.58814,
            13.734255
          ],
          [
            100.58814,
            13.734745
          ],
          [
            100.58746,
            13.734745
          ],
          [
            100.58746,
            13.734255
          ]
        ]
      },
      {
        "name": "XT Ekkamai Sky Facilities & Crown",
        "color": "#A855F7",
        "height": 145,
        "min_height": 128,
        "footprint": [
          [
            100.58758,
            13.734342
          ],
          [
            100.58802,
            13.734342
          ],
          [
            100.58802,
            13.734658
          ],
          [
            100.58758,
            13.734658
          ],
          [
            100.58758,
            13.734342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "29.75 – 31.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "45.00 – 57.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS เอกมัย (E7)",
        "dist": "1.3 km",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Donki Mall Thonglor",
        "kind": "Japanese Mall",
        "color": "#F59E0B",
        "lat": 13.7335,
        "lon": 100.5865,
        "dist": "200 m"
      },
      {
        "name": "Big C Supercenter Ekkamai",
        "kind": "Shopping",
        "color": "#EF4444",
        "lat": 13.7295,
        "lon": 100.586,
        "dist": "550 m"
      }
    ]
  },
  {
    "id": "xt-huaykwang",
    "name": "XT Huaikhwang",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมไฮไรส์",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 155,
    "floors": 43,
    "units": 1404,
    "unitsPerFloor": 36,
    "parking": 587,
    "parkingRatio": "42%",
    "landRai": 6.1,
    "facilitiesM2": "Twin Rooftop Pools & Co-working",
    "priceRange": "฿4.2M – ฿13M",
    "district": "ห้วยขวาง",
    "location": "ถ.รัชดาภิเษก ใกล้ MRT ห้วยขวาง",
    "lat": 13.7772,
    "lon": 100.5735,
    "desc": "คอนโดสไตล์ไลฟ์สไตล์ฮับบนถนนรัชดาภิเษก ห่างจาก MRT ห้วยขวางเพียง 75 ม. มาพร้อมสระว่ายน้ำลอยฟ้า 2 สระ และ Co-working Space 24 ชม.",
    "footprint": [
      [
        100.57302,
        13.776854
      ],
      [
        100.57398,
        13.776854
      ],
      [
        100.57398,
        13.777546
      ],
      [
        100.57302,
        13.777546
      ],
      [
        100.57302,
        13.776854
      ]
    ],
    "parts": [
      {
        "name": "XT Huaikhwang Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [
            100.57302,
            13.776854
          ],
          [
            100.57398,
            13.776854
          ],
          [
            100.57398,
            13.777546
          ],
          [
            100.57302,
            13.777546
          ],
          [
            100.57302,
            13.776854
          ]
        ]
      },
      {
        "name": "XT Huaikhwang Residential Tower",
        "color": "#166534",
        "height": 136,
        "min_height": 25,
        "footprint": [
          [
            100.57316,
            13.776955
          ],
          [
            100.57384,
            13.776955
          ],
          [
            100.57384,
            13.777445
          ],
          [
            100.57316,
            13.777445
          ],
          [
            100.57316,
            13.776955
          ]
        ]
      },
      {
        "name": "XT Huaikhwang Sky Facilities & Crown",
        "color": "#EC4899",
        "height": 155,
        "min_height": 136,
        "footprint": [
          [
            100.57328,
            13.777042
          ],
          [
            100.57372,
            13.777042
          ],
          [
            100.57372,
            13.777358
          ],
          [
            100.57328,
            13.777358
          ],
          [
            100.57328,
            13.777042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "27.25 – 35.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "50.00 – 69.75 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT ห้วยขวาง (BL18)",
        "dist": "75 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "The Street Ratchada",
        "kind": "Mall 24h",
        "color": "#3B82F6",
        "lat": 13.7705,
        "lon": 100.572,
        "dist": "750 m"
      },
      {
        "name": "Huai Khwang Market",
        "kind": "Night Market",
        "color": "#F59E0B",
        "lat": 13.778,
        "lon": 100.5745,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "the-line-jatujak",
    "name": "THE LINE Jatujak-Mochit",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมพรีเมียมไฮไรส์",
    "categoryColor": "#16A34A",
    "developer": "Sansiri & BTS",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#14532D",
    "height": 148,
    "floors": 43,
    "units": 841,
    "unitsPerFloor": 22,
    "parking": 420,
    "parkingRatio": "50%",
    "landRai": 4.3,
    "facilitiesM2": "Chatuchak Park Panorama View",
    "priceRange": "฿4.9M – ฿18M",
    "district": "จตุจักร",
    "location": "ถ.พหลโยธิน ติด BTS หมอชิต / MRT สวนจตุจักร",
    "lat": 13.8052,
    "lon": 100.5542,
    "desc": "คอนโดมิเนียมไฮไรส์เชื่อมต่อ Skywalk ตรงสู่ BTS หมอชิตและ MRT สวนจตุจักร วิวสวนสาธารณะขนาด 700 ไร่แบบเปิดโล่ง",
    "footprint": [
      [
        100.55375,
        13.804876
      ],
      [
        100.55465,
        13.804876
      ],
      [
        100.55465,
        13.805524
      ],
      [
        100.55375,
        13.805524
      ],
      [
        100.55375,
        13.804876
      ]
    ],
    "parts": [
      {
        "name": "THE LINE Jatujak Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 24,
        "min_height": 0,
        "footprint": [
          [
            100.55372,
            13.804854
          ],
          [
            100.55468,
            13.804854
          ],
          [
            100.55468,
            13.805546
          ],
          [
            100.55372,
            13.805546
          ],
          [
            100.55372,
            13.804854
          ]
        ]
      },
      {
        "name": "THE LINE Jatujak Residential Tower",
        "color": "#14532D",
        "height": 130,
        "min_height": 24,
        "footprint": [
          [
            100.55386,
            13.804955
          ],
          [
            100.55454,
            13.804955
          ],
          [
            100.55454,
            13.805445
          ],
          [
            100.55386,
            13.805445
          ],
          [
            100.55386,
            13.804955
          ]
        ]
      },
      {
        "name": "THE LINE Jatujak Sky Facilities & Crown",
        "color": "#10B981",
        "height": 148,
        "min_height": 130,
        "footprint": [
          [
            100.55398,
            13.805042
          ],
          [
            100.55442,
            13.805042
          ],
          [
            100.55442,
            13.805358
          ],
          [
            100.55398,
            13.805358
          ],
          [
            100.55398,
            13.805042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "26.00 – 44.75 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "53.50 – 66.00 m²"
      },
      {
        "label": "3 Bedrooms",
        "size": "77.75 – 85.25 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS หมอชิต (N8)",
        "dist": "200 m",
        "type": "bts"
      },
      {
        "name": "MRT สวนจตุจักร (BL13)",
        "dist": "250 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Chatuchak Weekend Market",
        "kind": "Market",
        "color": "#F59E0B",
        "lat": 13.7995,
        "lon": 100.5505,
        "dist": "450 m"
      },
      {
        "name": "Chatuchak Park",
        "kind": "Park",
        "color": "#10B981",
        "lat": 13.803,
        "lon": 100.5535,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "the-line-asoke-ratchada",
    "name": "THE LINE Asoke-Ratchada",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมระดับพรีเมียม",
    "categoryColor": "#16A34A",
    "developer": "Sansiri & BTS",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#15803D",
    "height": 135,
    "floors": 38,
    "units": 473,
    "unitsPerFloor": 15,
    "parking": 236,
    "parkingRatio": "50%",
    "landRai": 2.1,
    "facilitiesM2": "Smart Living Sky Facilities",
    "priceRange": "฿4.5M – ฿14M",
    "district": "ดินแดง",
    "location": "ถ.อโศก-ดินแดง ใกล้ MRT พระราม 9",
    "lat": 13.7562,
    "lon": 100.5658,
    "desc": "คอนโดระดับพรีเมียมใกล้ MRT พระราม 9 เพียง 300 ม. ใจกลางศูนย์กลางเศรษฐกิจใหม่ การออกแบบผสานธรรมชาติและนวัตกรรม Smart Living",
    "footprint": [
      [
        100.56538,
        13.755898
      ],
      [
        100.56622,
        13.755898
      ],
      [
        100.56622,
        13.756502
      ],
      [
        100.56538,
        13.756502
      ],
      [
        100.56538,
        13.755898
      ]
    ],
    "parts": [
      {
        "name": "THE LINE Asoke-Ratchada Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.56532,
            13.755854
          ],
          [
            100.56628,
            13.755854
          ],
          [
            100.56628,
            13.756546
          ],
          [
            100.56532,
            13.756546
          ],
          [
            100.56532,
            13.755854
          ]
        ]
      },
      {
        "name": "THE LINE Asoke-Ratchada Residential Tower",
        "color": "#15803D",
        "height": 119,
        "min_height": 22,
        "footprint": [
          [
            100.56546,
            13.755955
          ],
          [
            100.56614,
            13.755955
          ],
          [
            100.56614,
            13.756445
          ],
          [
            100.56546,
            13.756445
          ],
          [
            100.56546,
            13.755955
          ]
        ]
      },
      {
        "name": "THE LINE Asoke-Ratchada Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 135,
        "min_height": 119,
        "footprint": [
          [
            100.56558,
            13.756042
          ],
          [
            100.56602,
            13.756042
          ],
          [
            100.56602,
            13.756358
          ],
          [
            100.56558,
            13.756358
          ],
          [
            100.56558,
            13.756042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "27.50 – 35.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "46.25 – 50.25 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT พระราม 9 (BL20)",
        "dist": "300 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Rama 9",
        "kind": "Mall",
        "color": "#D97706",
        "lat": 13.758,
        "lon": 100.566,
        "dist": "250 m"
      }
    ]
  },
  {
    "id": "edge-sukhumvit-23",
    "name": "Edge Sukhumvit 23",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมใจกลางอโศก",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 125,
    "floors": 35,
    "units": 443,
    "unitsPerFloor": 14,
    "parking": 214,
    "parkingRatio": "48%",
    "landRai": 2.2,
    "facilitiesM2": "Sky Pool with Bangkok Skyline",
    "priceRange": "฿7.2M – ฿26M",
    "district": "วัฒนา",
    "location": "สุขุมวิท 23 ใกล้ BTS อโศก",
    "lat": 13.7352,
    "lon": 100.5632,
    "desc": "คอนโดมิเนียมใจกลางอโศก เพียง 300 ม. ถึง BTS อโศกและ MRT สุขุมวิท โดดเด่นด้วยรูปลักษณ์โมเดิร์นสีส้มอิฐสดใสและสระว่ายน้ำวิวเส้นขอบฟ้าเมือง",
    "footprint": [
      [
        100.5628,
        13.734912
      ],
      [
        100.5636,
        13.734912
      ],
      [
        100.5636,
        13.735488
      ],
      [
        100.5628,
        13.735488
      ],
      [
        100.5628,
        13.734912
      ]
    ],
    "parts": [
      {
        "name": "Edge Sukhumvit 23 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 20,
        "min_height": 0,
        "footprint": [
          [
            100.56272,
            13.734854
          ],
          [
            100.56368,
            13.734854
          ],
          [
            100.56368,
            13.735546
          ],
          [
            100.56272,
            13.735546
          ],
          [
            100.56272,
            13.734854
          ]
        ]
      },
      {
        "name": "Edge Sukhumvit 23 Residential Tower",
        "color": "#166534",
        "height": 110,
        "min_height": 20,
        "footprint": [
          [
            100.56286,
            13.734955
          ],
          [
            100.56354,
            13.734955
          ],
          [
            100.56354,
            13.735445
          ],
          [
            100.56286,
            13.735445
          ],
          [
            100.56286,
            13.734955
          ]
        ]
      },
      {
        "name": "Edge Sukhumvit 23 Sky Facilities & Crown",
        "color": "#F97316",
        "height": 125,
        "min_height": 110,
        "footprint": [
          [
            100.56298,
            13.735042
          ],
          [
            100.56342,
            13.735042
          ],
          [
            100.56342,
            13.735358
          ],
          [
            100.56298,
            13.735358
          ],
          [
            100.56298,
            13.735042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "29.50 – 43.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "60.00 – 69.50 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS อโศก (E4)",
        "dist": "300 m",
        "type": "bts"
      },
      {
        "name": "MRT สุขุมวิท (BL22)",
        "dist": "350 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Terminal 21",
        "kind": "Shopping Mall",
        "color": "#F59E0B",
        "lat": 13.7375,
        "lon": 100.5605,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "oka-haus",
    "name": "Oka Haus Sukhumvit 36",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "รีสอร์ตคอนโดมิเนียม",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#14532D",
    "height": 168,
    "floors": 47,
    "units": 1178,
    "unitsPerFloor": 28,
    "parking": 540,
    "parkingRatio": "46%",
    "landRai": 5,
    "facilitiesM2": "Sky Cinema & Sunset Lagoon Pool",
    "priceRange": "฿4.3M – ฿15M",
    "district": "คลองเตย",
    "location": "ถ.พระราม 4 ใกล้ BTS ทองหล่อ",
    "lat": 13.7162,
    "lon": 100.5732,
    "desc": "รีสอร์ตคอนโดมิเนียมสูง 47 ชั้น บรรยากาศธรรมชาติใกล้โค้งน้ำบางกระเจ้าและสุขุมวิท 36 พร้อมโรงภาพยนตร์กลางแจ้งลอยฟ้าและ Onsen สปา",
    "footprint": [
      [
        100.57274,
        13.715869
      ],
      [
        100.57366,
        13.715869
      ],
      [
        100.57366,
        13.716531
      ],
      [
        100.57274,
        13.716531
      ],
      [
        100.57274,
        13.715869
      ]
    ],
    "parts": [
      {
        "name": "Oka Haus Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.57272,
            13.715854
          ],
          [
            100.57368,
            13.715854
          ],
          [
            100.57368,
            13.716546
          ],
          [
            100.57272,
            13.716546
          ],
          [
            100.57272,
            13.715854
          ]
        ]
      },
      {
        "name": "Oka Haus Residential Tower",
        "color": "#14532D",
        "height": 148,
        "min_height": 26,
        "footprint": [
          [
            100.57286,
            13.715955
          ],
          [
            100.57354,
            13.715955
          ],
          [
            100.57354,
            13.716445
          ],
          [
            100.57286,
            13.716445
          ],
          [
            100.57286,
            13.715955
          ]
        ]
      },
      {
        "name": "Oka Haus Sky Facilities & Crown",
        "color": "#06B6D4",
        "height": 168,
        "min_height": 148,
        "footprint": [
          [
            100.57298,
            13.716042
          ],
          [
            100.57342,
            13.716042
          ],
          [
            100.57342,
            13.716358
          ],
          [
            100.57298,
            13.716358
          ],
          [
            100.57298,
            13.716042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "26.50 – 34.75 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "40.50 – 49.50 m²"
      },
      {
        "label": "3 Bedrooms",
        "size": "86.25 – 86.50 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ทองหล่อ (E6)",
        "dist": "1.2 km",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Big C Extra Rama 4",
        "kind": "Supermarket",
        "color": "#EF4444",
        "lat": 13.718,
        "lon": 100.5695,
        "dist": "450 m"
      },
      {
        "name": "K-Village",
        "kind": "Community Mall",
        "color": "#10B981",
        "lat": 13.719,
        "lon": 100.57,
        "dist": "500 m"
      }
    ]
  },
  {
    "id": "shush-ratchathewi",
    "name": "SHUSH Ratchathewi",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมลักชัวรีลอฟต์",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 140,
    "floors": 32,
    "units": 383,
    "unitsPerFloor": 14,
    "parking": 210,
    "parkingRatio": "55%",
    "landRai": 2.1,
    "facilitiesM2": "Loft Sky Lounge & Private Oasis",
    "priceRange": "฿9.5M – ฿32M",
    "district": "ราชเทวี",
    "location": "ถ.พญาไท ใกล้ BTS ราชเทวี",
    "lat": 13.7542,
    "lon": 100.5332,
    "desc": "คอนโดเพดานสูงแบบ Loft & Duplex ห่าง BTS ราชเทวีเพียง 140 ม. แนวคิด A Space for Pure Focus & Luxury Living ใจกลางกรุงเทพฯ",
    "footprint": [
      [
        100.53278,
        13.753898
      ],
      [
        100.53362,
        13.753898
      ],
      [
        100.53362,
        13.754502
      ],
      [
        100.53278,
        13.754502
      ],
      [
        100.53278,
        13.753898
      ]
    ],
    "parts": [
      {
        "name": "SHUSH Ratchathewi Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.53272,
            13.753854
          ],
          [
            100.53368,
            13.753854
          ],
          [
            100.53368,
            13.754546
          ],
          [
            100.53272,
            13.754546
          ],
          [
            100.53272,
            13.753854
          ]
        ]
      },
      {
        "name": "SHUSH Ratchathewi Residential Tower",
        "color": "#166534",
        "height": 123,
        "min_height": 22,
        "footprint": [
          [
            100.53286,
            13.753955
          ],
          [
            100.53354,
            13.753955
          ],
          [
            100.53354,
            13.754445
          ],
          [
            100.53286,
            13.754445
          ],
          [
            100.53286,
            13.753955
          ]
        ]
      },
      {
        "name": "SHUSH Ratchathewi Sky Facilities & Crown",
        "color": "#EAB308",
        "height": 140,
        "min_height": 123,
        "footprint": [
          [
            100.53298,
            13.754042
          ],
          [
            100.53342,
            13.754042
          ],
          [
            100.53342,
            13.754358
          ],
          [
            100.53298,
            13.754358
          ],
          [
            100.53298,
            13.754042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Loft",
        "size": "29.25 – 41.50 m²"
      },
      {
        "label": "2 Bedrooms Loft",
        "size": "54.75 – 70.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ราชเทวี (N1)",
        "dist": "140 m",
        "type": "bts"
      },
      {
        "name": "ARL พญาไท (A8)",
        "dist": "450 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Siam Discovery",
        "kind": "Shopping",
        "color": "#8B5CF6",
        "lat": 13.7465,
        "lon": 100.5315,
        "dist": "650 m"
      }
    ]
  },
  {
    "id": "flo-by-sansiri",
    "name": "FLO by Sansiri",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมโมเดิร์นวิวแม่น้ำ",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#15803D",
    "height": 85,
    "floors": 22,
    "units": 508,
    "unitsPerFloor": 26,
    "parking": 200,
    "parkingRatio": "39%",
    "landRai": 2.3,
    "facilitiesM2": "River & City Skyline Deck",
    "priceRange": "฿3.9M – ฿13M",
    "district": "คลองสาน",
    "location": "ถ.สมเด็จเจ้าพระยา ใกล้ ICONSIAM",
    "lat": 13.7315,
    "lon": 100.5028,
    "desc": "คอนโดสไตล์โมเดิร์นคลองสาน ใกล้รถไฟฟ้าสายสีทองสถานีคลองสาน และ ICONSIAM เพียง 350 ม. เพลิดเพลินวิวแม่น้ำและแสงสีเมืองเก่า",
    "footprint": [
      [
        100.50235,
        13.731176
      ],
      [
        100.50325,
        13.731176
      ],
      [
        100.50325,
        13.731824
      ],
      [
        100.50235,
        13.731824
      ],
      [
        100.50235,
        13.731176
      ]
    ],
    "parts": [
      {
        "name": "FLO by Sansiri Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.50232,
            13.731154
          ],
          [
            100.50328,
            13.731154
          ],
          [
            100.50328,
            13.731846
          ],
          [
            100.50232,
            13.731846
          ],
          [
            100.50232,
            13.731154
          ]
        ]
      },
      {
        "name": "FLO by Sansiri Residential Tower",
        "color": "#15803D",
        "height": 75,
        "min_height": 16,
        "footprint": [
          [
            100.50246,
            13.731255
          ],
          [
            100.50314,
            13.731255
          ],
          [
            100.50314,
            13.731745
          ],
          [
            100.50246,
            13.731745
          ],
          [
            100.50246,
            13.731255
          ]
        ]
      },
      {
        "name": "FLO by Sansiri Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 85,
        "min_height": 75,
        "footprint": [
          [
            100.50258,
            13.731342
          ],
          [
            100.50302,
            13.731342
          ],
          [
            100.50302,
            13.731658
          ],
          [
            100.50258,
            13.731658
          ],
          [
            100.50258,
            13.731342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "24.50 – 29.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "46.00 – 48.00 m²"
      }
    ],
    "transport": [
      {
        "name": "สายสีทอง สถานีคลองสาน (G3)",
        "dist": "350 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ICONSIAM",
        "kind": "Global Destination",
        "color": "#F59E0B",
        "lat": 13.7265,
        "lon": 100.5105,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "scope-langsuan",
    "name": "SCOPE Langsuan",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "คอนโดมิเนียมอัลตราลักชัวรี",
    "categoryColor": "#38BDF8",
    "developer": "SC Asset & SCOPE",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0369A1",
    "height": 135,
    "floors": 34,
    "units": 158,
    "unitsPerFloor": 6,
    "parking": 231,
    "parkingRatio": "146%",
    "landRai": 2.1,
    "facilitiesM2": "Private Cinema by K-array & Ozone Pool",
    "priceRange": "฿45M – ฿280M",
    "district": "ปทุมวัน",
    "location": "ถ.หลังสวน ใกล้ BTS ชิดลม",
    "lat": 13.7378,
    "lon": 100.5432,
    "desc": "ที่สุดของคอนโดมิเนียมระดับเวิลด์คลาสฟรีโฮลด์บนถนนหลังสวน ออกแบบโดย Thomas Juul-Hansen พร้อมบริการระดับ 5 ดาวและเครื่องเสียงสั่งทำพิเศษ",
    "footprint": [
      [
        100.54276,
        13.737483
      ],
      [
        100.54364,
        13.737483
      ],
      [
        100.54364,
        13.738117
      ],
      [
        100.54276,
        13.738117
      ],
      [
        100.54276,
        13.737483
      ]
    ],
    "parts": [
      {
        "name": "SCOPE Langsuan Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.54272,
            13.737454
          ],
          [
            100.54368,
            13.737454
          ],
          [
            100.54368,
            13.738146
          ],
          [
            100.54272,
            13.738146
          ],
          [
            100.54272,
            13.737454
          ]
        ]
      },
      {
        "name": "SCOPE Langsuan Residential Tower",
        "color": "#0369A1",
        "height": 119,
        "min_height": 22,
        "footprint": [
          [
            100.54286,
            13.737555
          ],
          [
            100.54354,
            13.737555
          ],
          [
            100.54354,
            13.738045
          ],
          [
            100.54286,
            13.738045
          ],
          [
            100.54286,
            13.737555
          ]
        ]
      },
      {
        "name": "SCOPE Langsuan Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 135,
        "min_height": 119,
        "footprint": [
          [
            100.54298,
            13.737642
          ],
          [
            100.54342,
            13.737642
          ],
          [
            100.54342,
            13.737958
          ],
          [
            100.54298,
            13.737958
          ],
          [
            100.54298,
            13.737642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "83.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "153.00 – 162.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "240.00 – 462.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ชิดลม (E1)",
        "dist": "140 m",
        "type": "bts"
      },
      {
        "name": "BTS ราชดำริ (S1)",
        "dist": "650 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Chidlom",
        "kind": "Department Store",
        "color": "#D97706",
        "lat": 13.744,
        "lon": 100.543,
        "dist": "180 m"
      },
      {
        "name": "Lumpini Park",
        "kind": "Public Park",
        "color": "#10B981",
        "lat": 13.731,
        "lon": 100.5415,
        "dist": "700 m"
      }
    ]
  },
  {
    "id": "beatniq-sukhumvit-32",
    "name": "BEATNIQ Sukhumvit 32",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "คอนโดมิเนียมลักชัวรี",
    "categoryColor": "#38BDF8",
    "developer": "SC Asset",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0284C7",
    "height": 125,
    "floors": 34,
    "units": 197,
    "unitsPerFloor": 8,
    "parking": 193,
    "parkingRatio": "98%",
    "landRai": 1.9,
    "facilitiesM2": "Mid-Century Sky Lounge & Heated Spa Pool",
    "priceRange": "฿14M – ฿58M",
    "district": "คลองเตย",
    "location": "สุขุมวิท 32 ใกล้ BTS ทองหล่อ",
    "lat": 13.7258,
    "lon": 100.5742,
    "desc": "คอนโดหรูสไตล์ Mid-Century Modern ผสานเส้นสายสถาปัตยกรรมยุค 50s ใจกลางสุขุมวิท ใกล้ BTS ทองหล่อเพียง 250 ม.",
    "footprint": [
      [
        100.57378,
        13.725498
      ],
      [
        100.57462,
        13.725498
      ],
      [
        100.57462,
        13.726102
      ],
      [
        100.57378,
        13.726102
      ],
      [
        100.57378,
        13.725498
      ]
    ],
    "parts": [
      {
        "name": "BEATNIQ Sukhumvit 32 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 20,
        "min_height": 0,
        "footprint": [
          [
            100.57372,
            13.725454
          ],
          [
            100.57468,
            13.725454
          ],
          [
            100.57468,
            13.726146
          ],
          [
            100.57372,
            13.726146
          ],
          [
            100.57372,
            13.725454
          ]
        ]
      },
      {
        "name": "BEATNIQ Sukhumvit 32 Residential Tower",
        "color": "#0284C7",
        "height": 110,
        "min_height": 20,
        "footprint": [
          [
            100.57386,
            13.725555
          ],
          [
            100.57454,
            13.725555
          ],
          [
            100.57454,
            13.726045
          ],
          [
            100.57386,
            13.726045
          ],
          [
            100.57386,
            13.725555
          ]
        ]
      },
      {
        "name": "BEATNIQ Sukhumvit 32 Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 125,
        "min_height": 110,
        "footprint": [
          [
            100.57398,
            13.725642
          ],
          [
            100.57442,
            13.725642
          ],
          [
            100.57442,
            13.725958
          ],
          [
            100.57398,
            13.725958
          ],
          [
            100.57398,
            13.725642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "43.00 – 59.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "79.00 – 82.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "160.00 – 204.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ทองหล่อ (E6)",
        "dist": "250 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Rain Hill Sukhumvit 47",
        "kind": "Lifestyle Mall",
        "color": "#10B981",
        "lat": 13.7285,
        "lon": 100.574,
        "dist": "300 m"
      }
    ]
  },
  {
    "id": "the-crest-park-residences",
    "name": "The Crest Park Residences",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "คอนโดมิเนียมระดับลักชัวรี",
    "categoryColor": "#38BDF8",
    "developer": "SC Asset & Nishitetsu",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0369A1",
    "height": 140,
    "floors": 36,
    "units": 420,
    "unitsPerFloor": 14,
    "parking": 235,
    "parkingRatio": "56%",
    "landRai": 2,
    "facilitiesM2": "Floating Oasis & Spa Pool",
    "priceRange": "฿6.5M – ฿28M",
    "district": "จตุจักร",
    "location": "ห้าแยกลาดพร้าว ใกล้ BTS ห้าแยกลาดพร้าว",
    "lat": 13.8152,
    "lon": 100.5602,
    "desc": "คอนโดมิเนียมระดับลักชัวรีทำเลทองห้าแยกลาดพร้าว ออกแบบร่วมกับ Nishitetsu Group ประเทศญี่ปุ่น พร้อมวิวสวนจตุจักรผืนใหญ่แบบไร้สิ่งบดบัง",
    "footprint": [
      [
        100.55978,
        13.814898
      ],
      [
        100.56062,
        13.814898
      ],
      [
        100.56062,
        13.815502
      ],
      [
        100.55978,
        13.815502
      ],
      [
        100.55978,
        13.814898
      ]
    ],
    "parts": [
      {
        "name": "The Crest Park Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.55972,
            13.814854
          ],
          [
            100.56068,
            13.814854
          ],
          [
            100.56068,
            13.815546
          ],
          [
            100.55972,
            13.815546
          ],
          [
            100.55972,
            13.814854
          ]
        ]
      },
      {
        "name": "The Crest Park Residential Tower",
        "color": "#0369A1",
        "height": 123,
        "min_height": 22,
        "footprint": [
          [
            100.55986,
            13.814955
          ],
          [
            100.56054,
            13.814955
          ],
          [
            100.56054,
            13.815445
          ],
          [
            100.55986,
            13.815445
          ],
          [
            100.55986,
            13.814955
          ]
        ]
      },
      {
        "name": "The Crest Park Sky Facilities & Crown",
        "color": "#10B981",
        "height": 140,
        "min_height": 123,
        "footprint": [
          [
            100.55998,
            13.815042
          ],
          [
            100.56042,
            13.815042
          ],
          [
            100.56042,
            13.815358
          ],
          [
            100.55998,
            13.815358
          ],
          [
            100.55998,
            13.815042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "31.00 – 40.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "73.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ห้าแยกลาดพร้าว (N9)",
        "dist": "80 m",
        "type": "bts"
      },
      {
        "name": "MRT พหลโยธิน (BL14)",
        "dist": "100 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Ladprao",
        "kind": "Shopping",
        "color": "#D97706",
        "lat": 13.8175,
        "lon": 100.5605,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "the-crest-ruamrudee",
    "name": "The Crest Ruamrudee",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "คอนโดมิเนียมเอ็กซ์คลูซีฟ",
    "categoryColor": "#38BDF8",
    "developer": "SC Asset",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#075985",
    "height": 75,
    "floors": 18,
    "units": 110,
    "unitsPerFloor": 8,
    "parking": 100,
    "parkingRatio": "91%",
    "landRai": 1.2,
    "facilitiesM2": "Rooftop Swimming Pool & Gym",
    "priceRange": "฿8.5M – ฿32M",
    "district": "ปทุมวัน",
    "location": "ซอยร่วมฤดี ใกล้ BTS เพลินจิต",
    "lat": 13.7372,
    "lon": 100.5485,
    "desc": "คอนโดมิเนียมส่วนตัวระดับหรูในซอยร่วมฤดี บรรยากาศเงียบสงบใจกลางย่านสถานทูตและเพลินจิต",
    "footprint": [
      [
        100.54812,
        13.736926
      ],
      [
        100.54888,
        13.736926
      ],
      [
        100.54888,
        13.737474
      ],
      [
        100.54812,
        13.737474
      ],
      [
        100.54812,
        13.736926
      ]
    ],
    "parts": [
      {
        "name": "The Crest Ruamrudee Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.54802,
            13.736854
          ],
          [
            100.54898,
            13.736854
          ],
          [
            100.54898,
            13.737546
          ],
          [
            100.54802,
            13.737546
          ],
          [
            100.54802,
            13.736854
          ]
        ]
      },
      {
        "name": "The Crest Ruamrudee Residential Tower",
        "color": "#075985",
        "height": 66,
        "min_height": 16,
        "footprint": [
          [
            100.54816,
            13.736955
          ],
          [
            100.54884,
            13.736955
          ],
          [
            100.54884,
            13.737445
          ],
          [
            100.54816,
            13.737445
          ],
          [
            100.54816,
            13.736955
          ]
        ]
      },
      {
        "name": "The Crest Ruamrudee Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 75,
        "min_height": 66,
        "footprint": [
          [
            100.54828,
            13.737042
          ],
          [
            100.54872,
            13.737042
          ],
          [
            100.54872,
            13.737358
          ],
          [
            100.54828,
            13.737358
          ],
          [
            100.54828,
            13.737042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "45.00 – 52.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "75.00 – 92.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS เพลินจิต (E2)",
        "dist": "750 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "All Seasons Place",
        "kind": "Office & Mall",
        "color": "#3B82F6",
        "lat": 13.738,
        "lon": 100.5475,
        "dist": "200 m"
      }
    ]
  },
  {
    "id": "centric-ratchayothin",
    "name": "Centric Ratchayothin",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "คอนโดมิเนียมไฮไลฟ์",
    "categoryColor": "#38BDF8",
    "developer": "SC Asset",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0284C7",
    "height": 85,
    "floors": 21,
    "units": 261,
    "unitsPerFloor": 14,
    "parking": 121,
    "parkingRatio": "46%",
    "landRai": 2.1,
    "facilitiesM2": "Triple Volume Sky Facilities",
    "priceRange": "฿4.1M – ฿13M",
    "district": "จตุจักร",
    "location": "ถ.พหลโยธิน ติด BTS รัชโยธิน",
    "lat": 13.8292,
    "lon": 100.5702,
    "desc": "คอนโดไฮไรส์ติด BTS รัชโยธินเพียง 150 ม. ใกล้เมเจอร์รัชโยธินและตึกช้าง พร้อม Triple Volume Facilities ดาดฟ้า",
    "footprint": [
      [
        100.5698,
        13.828912
      ],
      [
        100.5706,
        13.828912
      ],
      [
        100.5706,
        13.829488
      ],
      [
        100.5698,
        13.829488
      ],
      [
        100.5698,
        13.828912
      ]
    ],
    "parts": [
      {
        "name": "Centric Ratchayothin Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.56972,
            13.828854
          ],
          [
            100.57068,
            13.828854
          ],
          [
            100.57068,
            13.829546
          ],
          [
            100.56972,
            13.829546
          ],
          [
            100.56972,
            13.828854
          ]
        ]
      },
      {
        "name": "Centric Ratchayothin Residential Tower",
        "color": "#0284C7",
        "height": 75,
        "min_height": 16,
        "footprint": [
          [
            100.56986,
            13.828955
          ],
          [
            100.57054,
            13.828955
          ],
          [
            100.57054,
            13.829445
          ],
          [
            100.56986,
            13.829445
          ],
          [
            100.56986,
            13.828955
          ]
        ]
      },
      {
        "name": "Centric Ratchayothin Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 85,
        "min_height": 75,
        "footprint": [
          [
            100.56998,
            13.829042
          ],
          [
            100.57042,
            13.829042
          ],
          [
            100.57042,
            13.829358
          ],
          [
            100.56998,
            13.829358
          ],
          [
            100.56998,
            13.829042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "24.00 – 26.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "30.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "55.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS รัชโยธิน (N11)",
        "dist": "150 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Major Cineplex Ratchayothin",
        "kind": "Cinema & Mall",
        "color": "#EF4444",
        "lat": 13.83,
        "lon": 100.571,
        "dist": "180 m"
      }
    ]
  },
  {
    "id": "centric-ari-station",
    "name": "Centric Ari Station",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "คอนโดมิเนียมไลฟ์สไตล์",
    "categoryColor": "#38BDF8",
    "developer": "SC Asset",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0369A1",
    "height": 110,
    "floors": 30,
    "units": 516,
    "unitsPerFloor": 18,
    "parking": 240,
    "parkingRatio": "47%",
    "landRai": 2.3,
    "facilitiesM2": "Panoramic Sky Lap Pool",
    "priceRange": "฿5.2M – ฿18M",
    "district": "พญาไท",
    "location": "ซอยอารีย์ 1 ใกล้ BTS อารีย์",
    "lat": 13.7785,
    "lon": 100.5428,
    "desc": "คอนโดมิเนียมทำเลสุดฮิตซอยอารีย์ 1 ใกล้ BTS อารีย์และย่านไลฟ์สไตล์คาเฟ่ โดดเด่นด้วยสระว่ายน้ำอินฟินิตี้ลอยฟ้า",
    "footprint": [
      [
        100.54238,
        13.778198
      ],
      [
        100.54322,
        13.778198
      ],
      [
        100.54322,
        13.778802
      ],
      [
        100.54238,
        13.778802
      ],
      [
        100.54238,
        13.778198
      ]
    ],
    "parts": [
      {
        "name": "Centric Ari Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.54232,
            13.778154
          ],
          [
            100.54328,
            13.778154
          ],
          [
            100.54328,
            13.778846
          ],
          [
            100.54232,
            13.778846
          ],
          [
            100.54232,
            13.778154
          ]
        ]
      },
      {
        "name": "Centric Ari Residential Tower",
        "color": "#0369A1",
        "height": 97,
        "min_height": 18,
        "footprint": [
          [
            100.54246,
            13.778255
          ],
          [
            100.54314,
            13.778255
          ],
          [
            100.54314,
            13.778745
          ],
          [
            100.54246,
            13.778745
          ],
          [
            100.54246,
            13.778255
          ]
        ]
      },
      {
        "name": "Centric Ari Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 110,
        "min_height": 97,
        "footprint": [
          [
            100.54258,
            13.778342
          ],
          [
            100.54302,
            13.778342
          ],
          [
            100.54302,
            13.778658
          ],
          [
            100.54258,
            13.778658
          ],
          [
            100.54258,
            13.778342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "27.50 – 40.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "60.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS อารีย์ (N5)",
        "dist": "350 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "La Villa Ari",
        "kind": "Lifestyle",
        "color": "#10B981",
        "lat": 13.7795,
        "lon": 100.5445,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "cobe-ratchada-rama9",
    "name": "COBE Ratchada-Rama 9",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "คอมมูนิตี้คอนโดมิเนียมคนรุ่นใหม่",
    "categoryColor": "#38BDF8",
    "developer": "SC Asset",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0284C7",
    "height": 105,
    "floors": 29,
    "units": 1612,
    "unitsPerFloor": 32,
    "parking": 645,
    "parkingRatio": "40%",
    "landRai": 12,
    "facilitiesM2": "Co-creating Space 24h & Wave Pool",
    "priceRange": "฿2.9M – ฿9.5M",
    "district": "ห้วยขวาง",
    "location": "ถ.เทียมร่วมมิตร ใกล้ MRT ศูนย์วัฒนธรรมฯ",
    "lat": 13.7655,
    "lon": 100.5722,
    "desc": "คอนโดมิเนียมแนวคิด Community-driven แห่งใหม่บนถนนเทียมร่วมมิตร ใกล้ MRT ศูนย์วัฒนธรรมฯ พร้อมส่วนกลางขนาดใหญ่ 24 ชม.",
    "footprint": [
      [
        100.57172,
        13.765154
      ],
      [
        100.57268,
        13.765154
      ],
      [
        100.57268,
        13.765846
      ],
      [
        100.57172,
        13.765846
      ],
      [
        100.57172,
        13.765154
      ]
    ],
    "parts": [
      {
        "name": "COBE Ratchada-Rama 9 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 17,
        "min_height": 0,
        "footprint": [
          [
            100.57172,
            13.765154
          ],
          [
            100.57268,
            13.765154
          ],
          [
            100.57268,
            13.765846
          ],
          [
            100.57172,
            13.765846
          ],
          [
            100.57172,
            13.765154
          ]
        ]
      },
      {
        "name": "COBE Ratchada-Rama 9 Residential Tower",
        "color": "#0284C7",
        "height": 92,
        "min_height": 17,
        "footprint": [
          [
            100.57186,
            13.765255
          ],
          [
            100.57254,
            13.765255
          ],
          [
            100.57254,
            13.765745
          ],
          [
            100.57186,
            13.765745
          ],
          [
            100.57186,
            13.765255
          ]
        ]
      },
      {
        "name": "COBE Ratchada-Rama 9 Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 105,
        "min_height": 92,
        "footprint": [
          [
            100.57198,
            13.765342
          ],
          [
            100.57242,
            13.765342
          ],
          [
            100.57242,
            13.765658
          ],
          [
            100.57198,
            13.765658
          ],
          [
            100.57198,
            13.765342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "23.00 – 25.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "30.00 – 34.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "54.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT ศูนย์วัฒนธรรมฯ (BL19)",
        "dist": "850 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Thailand Cultural Centre",
        "kind": "Culture",
        "color": "#8B5CF6",
        "lat": 13.768,
        "lon": 100.5735,
        "dist": "300 m"
      }
    ]
  },
  {
    "id": "reference-sathorn",
    "name": "Reference Sathorn-Wongwianyai",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "คอนโดมิเนียมดีไซน์มินิมอล",
    "categoryColor": "#38BDF8",
    "developer": "SC Asset",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1502899576159-f224dc2349fa?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0369A1",
    "height": 165,
    "floors": 51,
    "units": 815,
    "unitsPerFloor": 18,
    "parking": 360,
    "parkingRatio": "44%",
    "landRai": 3.2,
    "facilitiesM2": "Moon Deck & Eclipse Pool 51st Fl",
    "priceRange": "฿3.5M – ฿11M",
    "district": "คลองสาน",
    "location": "ถ.กรุงธนบุรี ใกล้ BTS วงเวียนใหญ่",
    "lat": 13.7212,
    "lon": 100.4952,
    "desc": "คอนโดมิเนียมดีไซน์มินิมอลโมเดิร์นสูง 51 ชั้น ห่าง BTS วงเวียนใหญ่เพียง 130 ม. เชื่อมต่อสาทร-สีลมเพียง 2 สถานี",
    "footprint": [
      [
        100.49475,
        13.720876
      ],
      [
        100.49565,
        13.720876
      ],
      [
        100.49565,
        13.721524
      ],
      [
        100.49475,
        13.721524
      ],
      [
        100.49475,
        13.720876
      ]
    ],
    "parts": [
      {
        "name": "Reference Sathorn Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.49472,
            13.720854
          ],
          [
            100.49568,
            13.720854
          ],
          [
            100.49568,
            13.721546
          ],
          [
            100.49472,
            13.721546
          ],
          [
            100.49472,
            13.720854
          ]
        ]
      },
      {
        "name": "Reference Sathorn Residential Tower",
        "color": "#0369A1",
        "height": 145,
        "min_height": 26,
        "footprint": [
          [
            100.49486,
            13.720955
          ],
          [
            100.49554,
            13.720955
          ],
          [
            100.49554,
            13.721445
          ],
          [
            100.49486,
            13.721445
          ],
          [
            100.49486,
            13.720955
          ]
        ]
      },
      {
        "name": "Reference Sathorn Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 165,
        "min_height": 145,
        "footprint": [
          [
            100.49498,
            13.721042
          ],
          [
            100.49542,
            13.721042
          ],
          [
            100.49542,
            13.721358
          ],
          [
            100.49498,
            13.721358
          ],
          [
            100.49498,
            13.721042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "24.50 – 26.50 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "31.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "70.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS วงเวียนใหญ่ (S8)",
        "dist": "130 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "The Mall Thapra",
        "kind": "Shopping",
        "color": "#EC4899",
        "lat": 13.713,
        "lon": 100.4785,
        "dist": "1.8 km"
      }
    ]
  },
  {
    "id": "ashton-asoke",
    "name": "Ashton Asoke",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "คอนโดมิเนียมระดับซูเปอร์ลักชัวรี",
    "categoryColor": "#0284C7",
    "developer": "Ananda Development",
    "developerSite": "https://www.ananda.co.th/",
    "image": "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 195,
    "floors": 50,
    "units": 783,
    "unitsPerFloor": 18,
    "parking": 371,
    "parkingRatio": "47%",
    "landRai": 2.3,
    "facilitiesM2": "Panoramic Semi-Outdoor Sky Pool",
    "priceRange": "฿8.2M – ฿38M",
    "district": "วัฒนา",
    "location": "ถ.อโศกมนตรี (สุขุมวิท 21) ติด MRT สุขุมวิท",
    "lat": 13.7375,
    "lon": 100.5605,
    "desc": "ไอคอนิกคอนโดมิเนียมสูง 50 ชั้นใจกลางแยกอโศก ติด MRT สุขุมวิท และ BTS อโศก พร้อมสระว่ายน้ำโอโซนลอยฟ้าและสวนพฤกษศาสตร์ส่วนตัว",
    "footprint": [
      [
        100.56005,
        13.737176
      ],
      [
        100.56095,
        13.737176
      ],
      [
        100.56095,
        13.737824
      ],
      [
        100.56005,
        13.737824
      ],
      [
        100.56005,
        13.737176
      ]
    ],
    "parts": [
      {
        "name": "Ashton Asoke Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.56002,
            13.737154
          ],
          [
            100.56098,
            13.737154
          ],
          [
            100.56098,
            13.737846
          ],
          [
            100.56002,
            13.737846
          ],
          [
            100.56002,
            13.737154
          ]
        ]
      },
      {
        "name": "Ashton Asoke Residential Tower",
        "color": "#1E3A8A",
        "height": 172,
        "min_height": 26,
        "footprint": [
          [
            100.56016,
            13.737255
          ],
          [
            100.56084,
            13.737255
          ],
          [
            100.56084,
            13.737745
          ],
          [
            100.56016,
            13.737745
          ],
          [
            100.56016,
            13.737255
          ]
        ]
      },
      {
        "name": "Ashton Asoke Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 195,
        "min_height": 172,
        "footprint": [
          [
            100.56028,
            13.737342
          ],
          [
            100.56072,
            13.737342
          ],
          [
            100.56072,
            13.737658
          ],
          [
            100.56028,
            13.737658
          ],
          [
            100.56028,
            13.737342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "30.00 – 34.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "46.00 – 64.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT สุขุมวิท (BL22)",
        "dist": "20 m",
        "type": "mrt"
      },
      {
        "name": "BTS อโศก (E4)",
        "dist": "150 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Terminal 21",
        "kind": "Shopping Mall",
        "color": "#F59E0B",
        "lat": 13.7375,
        "lon": 100.56,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "ashton-morph-38",
    "name": "Ashton Morph 38",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "คอนโดมิเนียมระดับลักชัวรีดูเพล็กซ์",
    "categoryColor": "#0284C7",
    "developer": "Ananda Development",
    "developerSite": "https://www.ananda.co.th/",
    "image": "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 128,
    "floors": 32,
    "units": 199,
    "unitsPerFloor": 8,
    "parking": 201,
    "parkingRatio": "101%",
    "landRai": 3.1,
    "facilitiesM2": "Sky Green Courtyard & Heated Pool",
    "priceRange": "฿9.5M – ฿42M",
    "district": "คลองเตย",
    "location": "สุขุมวิท 38 ใกล้ BTS ทองหล่อ",
    "lat": 13.7208,
    "lon": 100.5795,
    "desc": "คอนโดมิเนียมระดับลักชัวรีซอยสุขุมวิท 38 ใกล้ BTS ทองหล่อ โดดเด่นด้วยห้องพักเพดานสูง 4.8 ม. แบบ Duplex สไตล์โมเดิร์นอีโค",
    "footprint": [
      [
        100.57908,
        13.720498
      ],
      [
        100.57992,
        13.720498
      ],
      [
        100.57992,
        13.721102
      ],
      [
        100.57908,
        13.721102
      ],
      [
        100.57908,
        13.720498
      ]
    ],
    "parts": [
      {
        "name": "Ashton Morph 38 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 20,
        "min_height": 0,
        "footprint": [
          [
            100.57902,
            13.720454
          ],
          [
            100.57998,
            13.720454
          ],
          [
            100.57998,
            13.721146
          ],
          [
            100.57902,
            13.721146
          ],
          [
            100.57902,
            13.720454
          ]
        ]
      },
      {
        "name": "Ashton Morph 38 Residential Tower",
        "color": "#1E3A8A",
        "height": 113,
        "min_height": 20,
        "footprint": [
          [
            100.57916,
            13.720555
          ],
          [
            100.57984,
            13.720555
          ],
          [
            100.57984,
            13.721045
          ],
          [
            100.57916,
            13.721045
          ],
          [
            100.57916,
            13.720555
          ]
        ]
      },
      {
        "name": "Ashton Morph 38 Sky Facilities & Crown",
        "color": "#10B981",
        "height": 128,
        "min_height": 113,
        "footprint": [
          [
            100.57928,
            13.720642
          ],
          [
            100.57972,
            13.720642
          ],
          [
            100.57972,
            13.720958
          ],
          [
            100.57928,
            13.720958
          ],
          [
            100.57928,
            13.720642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Duplex",
        "size": "52.00 – 57.00 m²"
      },
      {
        "label": "2 Bedrooms Duplex",
        "size": "72.00 – 90.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ทองหล่อ (E6)",
        "dist": "350 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Thonglor Street Food",
        "kind": "Food Hub",
        "color": "#F59E0B",
        "lat": 13.724,
        "lon": 100.579,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "ideo-q-chula-samyan",
    "name": "Ideo Q Chula-Samyan",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "คอนโดมิเนียมไฮไรส์ฮอตฮิต",
    "categoryColor": "#0284C7",
    "developer": "Ananda Development",
    "developerSite": "https://www.ananda.co.th/",
    "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 145,
    "floors": 40,
    "units": 1598,
    "unitsPerFloor": 42,
    "parking": 629,
    "parkingRatio": "39%",
    "landRai": 5.3,
    "facilitiesM2": "Panoramic Curve Pool & 24h Study",
    "priceRange": "฿4.2M – ฿18M",
    "district": "บางรัก",
    "location": "ถ.พระราม 4 ใกล้ MRT สามย่าน",
    "lat": 13.7322,
    "lon": 100.5288,
    "desc": "คอนโดมิเนียมฮิตของชาวจุฬาฯ บนถนนพระราม 4 ใกล้ MRT สามย่านและสามย่านมิตรทาวน์ พร้อมสระว่ายน้ำลอยฟ้ารูปเกือกม้าและห้องอ่านหนังสือ 24 ชม.",
    "footprint": [
      [
        100.52832,
        13.731854
      ],
      [
        100.52928,
        13.731854
      ],
      [
        100.52928,
        13.732546
      ],
      [
        100.52832,
        13.732546
      ],
      [
        100.52832,
        13.731854
      ]
    ],
    "parts": [
      {
        "name": "Ideo Q Chula Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 23,
        "min_height": 0,
        "footprint": [
          [
            100.52832,
            13.731854
          ],
          [
            100.52928,
            13.731854
          ],
          [
            100.52928,
            13.732546
          ],
          [
            100.52832,
            13.732546
          ],
          [
            100.52832,
            13.731854
          ]
        ]
      },
      {
        "name": "Ideo Q Chula Residential Tower",
        "color": "#1E3A8A",
        "height": 128,
        "min_height": 23,
        "footprint": [
          [
            100.52846,
            13.731955
          ],
          [
            100.52914,
            13.731955
          ],
          [
            100.52914,
            13.732445
          ],
          [
            100.52846,
            13.732445
          ],
          [
            100.52846,
            13.731955
          ]
        ]
      },
      {
        "name": "Ideo Q Chula Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 145,
        "min_height": 128,
        "footprint": [
          [
            100.52858,
            13.732042
          ],
          [
            100.52902,
            13.732042
          ],
          [
            100.52902,
            13.732358
          ],
          [
            100.52858,
            13.732358
          ],
          [
            100.52858,
            13.732042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "21.00 – 28.50 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "33.50 – 34.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "50.00 – 66.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT สามย่าน (BL27)",
        "dist": "270 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Samyan Mitrtown",
        "kind": "24h Mall",
        "color": "#059669",
        "lat": 13.7335,
        "lon": 100.5285,
        "dist": "200 m"
      },
      {
        "name": "Chulalongkorn University",
        "kind": "Education",
        "color": "#EC4899",
        "lat": 13.7365,
        "lon": 100.532,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "ideo-q-siam-ratchathewi",
    "name": "Ideo Q Siam-Ratchathewi",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "คอนโดมิเนียมไพรเวทลิฟต์",
    "categoryColor": "#0284C7",
    "developer": "Ananda Development",
    "developerSite": "https://www.ananda.co.th/",
    "image": "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 138,
    "floors": 36,
    "units": 552,
    "unitsPerFloor": 18,
    "parking": 258,
    "parkingRatio": "47%",
    "landRai": 2.1,
    "facilitiesM2": "360-degree Sky Pool & Social Club",
    "priceRange": "฿6.5M – ฿26M",
    "district": "ราชเทวี",
    "location": "ถ.เพชรบุรี ใกล้ BTS ราชเทวี",
    "lat": 13.7515,
    "lon": 100.5345,
    "desc": "คอนโดระดับพรีเมียมพร้อมลิฟต์ส่วนตัวทุกยูนิต ใกล้ BTS ราชเทวีและสยามพารากอน พร้อมสระว่ายน้ำ 360 องศาบนชั้น 30",
    "footprint": [
      [
        100.53408,
        13.751198
      ],
      [
        100.53492,
        13.751198
      ],
      [
        100.53492,
        13.751802
      ],
      [
        100.53408,
        13.751802
      ],
      [
        100.53408,
        13.751198
      ]
    ],
    "parts": [
      {
        "name": "Ideo Q Siam Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.53402,
            13.751154
          ],
          [
            100.53498,
            13.751154
          ],
          [
            100.53498,
            13.751846
          ],
          [
            100.53402,
            13.751846
          ],
          [
            100.53402,
            13.751154
          ]
        ]
      },
      {
        "name": "Ideo Q Siam Residential Tower",
        "color": "#1E3A8A",
        "height": 121,
        "min_height": 22,
        "footprint": [
          [
            100.53416,
            13.751255
          ],
          [
            100.53484,
            13.751255
          ],
          [
            100.53484,
            13.751745
          ],
          [
            100.53416,
            13.751745
          ],
          [
            100.53416,
            13.751255
          ]
        ]
      },
      {
        "name": "Ideo Q Siam Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 138,
        "min_height": 121,
        "footprint": [
          [
            100.53428,
            13.751342
          ],
          [
            100.53472,
            13.751342
          ],
          [
            100.53472,
            13.751658
          ],
          [
            100.53428,
            13.751658
          ],
          [
            100.53428,
            13.751342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "29.50 – 34.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "51.00 – 69.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ราชเทวี (N1)",
        "dist": "390 m",
        "type": "bts"
      },
      {
        "name": "BTS สยาม (CEN)",
        "dist": "750 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Siam Paragon",
        "kind": "Luxury Mall",
        "color": "#7C3AED",
        "lat": 13.746,
        "lon": 100.535,
        "dist": "650 m"
      }
    ]
  },
  {
    "id": "ideo-q-victory",
    "name": "Ideo Q Victory",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "คอนโดมิเนียมระดับลักชัวรี 0 เมตร",
    "categoryColor": "#0284C7",
    "developer": "Ananda Development",
    "developerSite": "https://www.ananda.co.th/",
    "image": "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 142,
    "floors": 39,
    "units": 348,
    "unitsPerFloor": 12,
    "parking": 209,
    "parkingRatio": "60%",
    "landRai": 1.2,
    "facilitiesM2": "Hydrotherapy Sky Pool & Sky Gym",
    "priceRange": "฿6.9M – ฿24M",
    "district": "ราชเทวี",
    "location": "ถ.พญาไท ติด BTS อนุสาวรีย์ชัยสมรภูมิ",
    "lat": 13.7628,
    "lon": 100.5372,
    "desc": "คอนโดลักชัวรี 0 เมตรจาก BTS อนุสาวรีย์ชัยฯ โดดเด่นด้วยระบบจอดรถอัตโนมัติ 100% และดาดฟ้า Hydrotherapy Pool",
    "footprint": [
      [
        100.5368,
        13.762512
      ],
      [
        100.5376,
        13.762512
      ],
      [
        100.5376,
        13.763088
      ],
      [
        100.5368,
        13.763088
      ],
      [
        100.5368,
        13.762512
      ]
    ],
    "parts": [
      {
        "name": "Ideo Q Victory Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 23,
        "min_height": 0,
        "footprint": [
          [
            100.53672,
            13.762454
          ],
          [
            100.53768,
            13.762454
          ],
          [
            100.53768,
            13.763146
          ],
          [
            100.53672,
            13.763146
          ],
          [
            100.53672,
            13.762454
          ]
        ]
      },
      {
        "name": "Ideo Q Victory Residential Tower",
        "color": "#1E3A8A",
        "height": 125,
        "min_height": 23,
        "footprint": [
          [
            100.53686,
            13.762555
          ],
          [
            100.53754,
            13.762555
          ],
          [
            100.53754,
            13.763045
          ],
          [
            100.53686,
            13.763045
          ],
          [
            100.53686,
            13.762555
          ]
        ]
      },
      {
        "name": "Ideo Q Victory Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 142,
        "min_height": 125,
        "footprint": [
          [
            100.53698,
            13.762642
          ],
          [
            100.53742,
            13.762642
          ],
          [
            100.53742,
            13.762958
          ],
          [
            100.53698,
            13.762958
          ],
          [
            100.53698,
            13.762642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "28.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "35.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "48.00 – 60.50 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS อนุสาวรีย์ชัยสมรภูมิ (N3)",
        "dist": "20 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "King Power Rangnam",
        "kind": "Duty Free",
        "color": "#2563EB",
        "lat": 13.7605,
        "lon": 100.537,
        "dist": "250 m"
      },
      {
        "name": "Century The Movie Plaza",
        "kind": "Mall",
        "color": "#EF4444",
        "lat": 13.7615,
        "lon": 100.5365,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "coco-parc-rama4",
    "name": "COCO Parc Rama 4",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "คอนโดมิเนียมบริการโรงแรม 5 ดาว",
    "categoryColor": "#0284C7",
    "developer": "Ananda Development & Dusit",
    "developerSite": "https://www.ananda.co.th/",
    "image": "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 130,
    "floors": 37,
    "units": 444,
    "unitsPerFloor": 16,
    "parking": 268,
    "parkingRatio": "60%",
    "landRai": 2.3,
    "facilitiesM2": "Dusit Hospitality Services & Pool",
    "priceRange": "฿7.2M – ฿32M",
    "district": "คลองเตย",
    "location": "ถ.พระราม 4 ติด MRT คลองเตย",
    "lat": 13.7218,
    "lon": 100.5542,
    "desc": "คอนโดระดับลักชัวรีพร้อมบริการมาตรฐานโรงแรม 5 ดาวจาก Dusit Hospitality Services ติดทางขึ้น MRT คลองเตย 0 ม. วิวสวนเบญจกิติ",
    "footprint": [
      [
        100.55378,
        13.721498
      ],
      [
        100.55462,
        13.721498
      ],
      [
        100.55462,
        13.722102
      ],
      [
        100.55378,
        13.722102
      ],
      [
        100.55378,
        13.721498
      ]
    ],
    "parts": [
      {
        "name": "COCO Parc Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 21,
        "min_height": 0,
        "footprint": [
          [
            100.55372,
            13.721454
          ],
          [
            100.55468,
            13.721454
          ],
          [
            100.55468,
            13.722146
          ],
          [
            100.55372,
            13.722146
          ],
          [
            100.55372,
            13.721454
          ]
        ]
      },
      {
        "name": "COCO Parc Residential Tower",
        "color": "#1E3A8A",
        "height": 114,
        "min_height": 21,
        "footprint": [
          [
            100.55386,
            13.721555
          ],
          [
            100.55454,
            13.721555
          ],
          [
            100.55454,
            13.722045
          ],
          [
            100.55386,
            13.722045
          ],
          [
            100.55386,
            13.721555
          ]
        ]
      },
      {
        "name": "COCO Parc Sky Facilities & Crown",
        "color": "#D97706",
        "height": 130,
        "min_height": 114,
        "footprint": [
          [
            100.55398,
            13.721642
          ],
          [
            100.55442,
            13.721642
          ],
          [
            100.55442,
            13.721958
          ],
          [
            100.55398,
            13.721958
          ],
          [
            100.55398,
            13.721642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "25.50 – 27.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "34.50 – 48.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "65.00 – 67.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT คลองเตย (BL24)",
        "dist": "10 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "MedPark Hospital",
        "kind": "Hospital",
        "color": "#DC2626",
        "lat": 13.7225,
        "lon": 100.5555,
        "dist": "150 m"
      },
      {
        "name": "Benjakitti Forest Park",
        "kind": "Mega Park",
        "color": "#10B981",
        "lat": 13.728,
        "lon": 100.556,
        "dist": "600 m"
      }
    ]
  },
  {
    "id": "ideo-mobi-asoke",
    "name": "Ideo Mobi Asoke",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "สมาร์ตคอนโดมิเนียมไฮไรส์",
    "categoryColor": "#0284C7",
    "developer": "Ananda Development",
    "developerSite": "https://www.ananda.co.th/",
    "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 132,
    "floors": 36,
    "units": 508,
    "unitsPerFloor": 16,
    "parking": 243,
    "parkingRatio": "48%",
    "landRai": 2.2,
    "facilitiesM2": "Ozone Sky Pool & Cloud Fitness",
    "priceRange": "฿4.8M – ฿16M",
    "district": "ห้วยขวาง",
    "location": "ถ.เพชรบุรี ใกล้ MRT เพชรบุรี / ARL มักกะสัน",
    "lat": 13.7482,
    "lon": 100.5638,
    "desc": "คอนโดมิเนียมแนวคิด Smart Living เชื่อมต่อทั้ง MRT เพชรบุรี และ ARL มักกะสัน พร้อม Sky Ozone Pool และฟิตเนสกระจกใสรอบทิศทาง",
    "footprint": [
      [
        100.56338,
        13.747898
      ],
      [
        100.56422,
        13.747898
      ],
      [
        100.56422,
        13.748502
      ],
      [
        100.56338,
        13.748502
      ],
      [
        100.56338,
        13.747898
      ]
    ],
    "parts": [
      {
        "name": "Ideo Mobi Asoke Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 21,
        "min_height": 0,
        "footprint": [
          [
            100.56332,
            13.747854
          ],
          [
            100.56428,
            13.747854
          ],
          [
            100.56428,
            13.748546
          ],
          [
            100.56332,
            13.748546
          ],
          [
            100.56332,
            13.747854
          ]
        ]
      },
      {
        "name": "Ideo Mobi Asoke Residential Tower",
        "color": "#1E3A8A",
        "height": 116,
        "min_height": 21,
        "footprint": [
          [
            100.56346,
            13.747955
          ],
          [
            100.56414,
            13.747955
          ],
          [
            100.56414,
            13.748445
          ],
          [
            100.56346,
            13.748445
          ],
          [
            100.56346,
            13.747955
          ]
        ]
      },
      {
        "name": "Ideo Mobi Asoke Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 132,
        "min_height": 116,
        "footprint": [
          [
            100.56358,
            13.748042
          ],
          [
            100.56402,
            13.748042
          ],
          [
            100.56402,
            13.748358
          ],
          [
            100.56358,
            13.748358
          ],
          [
            100.56358,
            13.748042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "24.00 – 34.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "54.00 – 61.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT เพชรบุรี (BL21)",
        "dist": "290 m",
        "type": "mrt"
      },
      {
        "name": "ARL มักกะสัน (A6)",
        "dist": "320 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Singha Complex",
        "kind": "Grade A Office & Mall",
        "color": "#F59E0B",
        "lat": 13.7475,
        "lon": 100.563,
        "dist": "180 m"
      },
      {
        "name": "Srinakharinwirot University (SWU)",
        "kind": "Education",
        "color": "#EC4899",
        "lat": 13.745,
        "lon": 100.5645,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "ideo-mobi-rama9",
    "name": "Ideo Mobi Rama 9",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "คอนโดมิเนียม New CBD",
    "categoryColor": "#0284C7",
    "developer": "Ananda Development",
    "developerSite": "https://www.ananda.co.th/",
    "image": "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 110,
    "floors": 28,
    "units": 705,
    "unitsPerFloor": 28,
    "parking": 290,
    "parkingRatio": "41%",
    "landRai": 3.2,
    "facilitiesM2": "Sky Pool & MaxValu Supermarket",
    "priceRange": "฿3.9M – ฿12M",
    "district": "ห้วยขวาง",
    "location": "ถ.พระราม 9 ใกล้ MRT พระราม 9",
    "lat": 13.7568,
    "lon": 100.5678,
    "desc": "คอนโดมิเนียมบนทำเลฮอต New CBD พระราม 9 ใกล้เซ็นทรัลพระราม 9 เพียง 150 ม. สะดวกสบายด้วยซูเปอร์มาร์เก็ตและร้านค้าในโครงการ",
    "footprint": [
      [
        100.56738,
        13.756498
      ],
      [
        100.56822,
        13.756498
      ],
      [
        100.56822,
        13.757102
      ],
      [
        100.56738,
        13.757102
      ],
      [
        100.56738,
        13.756498
      ]
    ],
    "parts": [
      {
        "name": "Ideo Mobi Rama 9 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.56732,
            13.756454
          ],
          [
            100.56828,
            13.756454
          ],
          [
            100.56828,
            13.757146
          ],
          [
            100.56732,
            13.757146
          ],
          [
            100.56732,
            13.756454
          ]
        ]
      },
      {
        "name": "Ideo Mobi Rama 9 Residential Tower",
        "color": "#1E3A8A",
        "height": 97,
        "min_height": 18,
        "footprint": [
          [
            100.56746,
            13.756555
          ],
          [
            100.56814,
            13.756555
          ],
          [
            100.56814,
            13.757045
          ],
          [
            100.56746,
            13.757045
          ],
          [
            100.56746,
            13.756555
          ]
        ]
      },
      {
        "name": "Ideo Mobi Rama 9 Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 110,
        "min_height": 97,
        "footprint": [
          [
            100.56758,
            13.756642
          ],
          [
            100.56802,
            13.756642
          ],
          [
            100.56802,
            13.756958
          ],
          [
            100.56758,
            13.756958
          ],
          [
            100.56758,
            13.756642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "21.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "30.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "45.00 – 61.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT พระราม 9 (BL20)",
        "dist": "150 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Rama 9",
        "kind": "Mall",
        "color": "#D97706",
        "lat": 13.758,
        "lon": 100.566,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "park-origin-phromphong",
    "name": "Park Origin Phrom Phong",
    "brandId": "origin",
    "brandName": "Origin Property",
    "category": "คอนโดมิเนียมโอเอซิสลักชัวรี",
    "categoryColor": "#F97316",
    "developer": "Origin Property",
    "developerSite": "https://www.origin.co.th/",
    "image": "https://images.unsplash.com/photo-1546768292-fb12f6c92568?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 175,
    "floors": 50,
    "units": 840,
    "unitsPerFloor": 20,
    "parking": 420,
    "parkingRatio": "50%",
    "landRai": 10,
    "facilitiesM2": "10-Rai Forest Oasis & 50th Fl Cloud Pool",
    "priceRange": "฿7.5M – ฿32M",
    "district": "คลองเตย",
    "location": "สุขุมวิท 24 ใกล้ The EmDistrict",
    "lat": 13.7265,
    "lon": 100.5672,
    "desc": "คอนโดหรูใจกลางสุขุมวิท 24 ล้อมรอบด้วยสวนสีเขียวขนาดกว่า 10 ไร่ ใกล้ Emporium และ EmQuartier พร้อมสระว่ายน้ำลอยฟ้าชั้น 50",
    "footprint": [
      [
        100.56672,
        13.726154
      ],
      [
        100.56768,
        13.726154
      ],
      [
        100.56768,
        13.726846
      ],
      [
        100.56672,
        13.726846
      ],
      [
        100.56672,
        13.726154
      ]
    ],
    "parts": [
      {
        "name": "Park Origin Phrom Phong Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.56672,
            13.726154
          ],
          [
            100.56768,
            13.726154
          ],
          [
            100.56768,
            13.726846
          ],
          [
            100.56672,
            13.726846
          ],
          [
            100.56672,
            13.726154
          ]
        ]
      },
      {
        "name": "Park Origin Phrom Phong Residential Tower",
        "color": "#C2410C",
        "height": 154,
        "min_height": 26,
        "footprint": [
          [
            100.56686,
            13.726255
          ],
          [
            100.56754,
            13.726255
          ],
          [
            100.56754,
            13.726745
          ],
          [
            100.56686,
            13.726745
          ],
          [
            100.56686,
            13.726255
          ]
        ]
      },
      {
        "name": "Park Origin Phrom Phong Sky Facilities & Crown",
        "color": "#10B981",
        "height": 175,
        "min_height": 154,
        "footprint": [
          [
            100.56698,
            13.726342
          ],
          [
            100.56742,
            13.726342
          ],
          [
            100.56742,
            13.726658
          ],
          [
            100.56698,
            13.726658
          ],
          [
            100.56698,
            13.726342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "29.00 – 40.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "55.00 – 67.00 m²"
      },
      {
        "label": "Duplex",
        "size": "58.00 – 80.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS พร้อมพงษ์ (E5)",
        "dist": "850 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "The Emporium",
        "kind": "Luxury Mall",
        "color": "#D97706",
        "lat": 13.7295,
        "lon": 100.5688,
        "dist": "800 m"
      },
      {
        "name": "Benjasiri Park",
        "kind": "Park",
        "color": "#10B981",
        "lat": 13.731,
        "lon": 100.5675,
        "dist": "750 m"
      }
    ]
  },
  {
    "id": "park-origin-phayathai",
    "name": "Park Origin Phayathai",
    "brandId": "origin",
    "brandName": "Origin Property",
    "category": "คอนโดมิเนียมไฮไรส์เวอร์ติคัลโอเอซิส",
    "categoryColor": "#F97316",
    "developer": "Origin Property",
    "developerSite": "https://www.origin.co.th/",
    "image": "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 145,
    "floors": 35,
    "units": 550,
    "unitsPerFloor": 18,
    "parking": 280,
    "parkingRatio": "51%",
    "landRai": 2.2,
    "facilitiesM2": "Sky Cascade Pool & Tree Top Lounge",
    "priceRange": "฿6.8M – ฿28M",
    "district": "ราชเทวี",
    "location": "ถ.พญาไท ติดสถานีพญาไท",
    "lat": 13.7578,
    "lon": 100.5358,
    "desc": "คอนโดระดับแฟล็กชิปเชื่อมต่อจุดตัด BTS พญาไท และ ARL สุวรรณภูมิ ออกแบบภายใต้แนวคิด A New Vertical Oasis",
    "footprint": [
      [
        100.53538,
        13.757498
      ],
      [
        100.53622,
        13.757498
      ],
      [
        100.53622,
        13.758102
      ],
      [
        100.53538,
        13.758102
      ],
      [
        100.53538,
        13.757498
      ]
    ],
    "parts": [
      {
        "name": "Park Origin Phayathai Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 23,
        "min_height": 0,
        "footprint": [
          [
            100.53532,
            13.757454
          ],
          [
            100.53628,
            13.757454
          ],
          [
            100.53628,
            13.758146
          ],
          [
            100.53532,
            13.758146
          ],
          [
            100.53532,
            13.757454
          ]
        ]
      },
      {
        "name": "Park Origin Phayathai Residential Tower",
        "color": "#C2410C",
        "height": 128,
        "min_height": 23,
        "footprint": [
          [
            100.53546,
            13.757555
          ],
          [
            100.53614,
            13.757555
          ],
          [
            100.53614,
            13.758045
          ],
          [
            100.53546,
            13.758045
          ],
          [
            100.53546,
            13.757555
          ]
        ]
      },
      {
        "name": "Park Origin Phayathai Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 145,
        "min_height": 128,
        "footprint": [
          [
            100.53558,
            13.757642
          ],
          [
            100.53602,
            13.757642
          ],
          [
            100.53602,
            13.757958
          ],
          [
            100.53558,
            13.757958
          ],
          [
            100.53558,
            13.757642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "24.00 – 34.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "55.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS พญาไท (N2)",
        "dist": "200 m",
        "type": "bts"
      },
      {
        "name": "ARL พญาไท (A8)",
        "dist": "200 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "King Power Complex",
        "kind": "Duty Free",
        "color": "#2563EB",
        "lat": 13.7605,
        "lon": 100.537,
        "dist": "400 m"
      }
    ]
  },
  {
    "id": "park-origin-chula-samyan",
    "name": "Park Origin Chula-Samyan",
    "brandId": "origin",
    "brandName": "Origin Property",
    "category": "คอนโดมิเนียมดูโอสเปซเพดานสูง",
    "categoryColor": "#F97316",
    "developer": "Origin Property",
    "developerSite": "https://www.origin.co.th/",
    "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 168,
    "floors": 46,
    "units": 499,
    "unitsPerFloor": 14,
    "parking": 300,
    "parkingRatio": "60%",
    "landRai": 2.1,
    "facilitiesM2": "Sunset Skyline Pool & Sky Forest",
    "priceRange": "฿6.2M – ฿24M",
    "district": "บางรัก",
    "location": "ถ.พระราม 4 ใกล้ MRT สามย่าน",
    "lat": 13.7335,
    "lon": 100.5235,
    "desc": "คอนโดมิเนียมเพดานสูง 4.25 ม. ทุกยูนิต (Duo Space) บนถนนพระราม 4 ใกล้จุฬาลงกรณ์มหาวิทยาลัย วิวแม่น้ำเจ้าพระยาและวิวโค้งน้ำบางกระเจ้า",
    "footprint": [
      [
        100.52306,
        13.733183
      ],
      [
        100.52394,
        13.733183
      ],
      [
        100.52394,
        13.733817
      ],
      [
        100.52306,
        13.733817
      ],
      [
        100.52306,
        13.733183
      ]
    ],
    "parts": [
      {
        "name": "Park Origin Chula Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.52302,
            13.733154
          ],
          [
            100.52398,
            13.733154
          ],
          [
            100.52398,
            13.733846
          ],
          [
            100.52302,
            13.733846
          ],
          [
            100.52302,
            13.733154
          ]
        ]
      },
      {
        "name": "Park Origin Chula Residential Tower",
        "color": "#C2410C",
        "height": 148,
        "min_height": 26,
        "footprint": [
          [
            100.52316,
            13.733255
          ],
          [
            100.52384,
            13.733255
          ],
          [
            100.52384,
            13.733745
          ],
          [
            100.52316,
            13.733745
          ],
          [
            100.52316,
            13.733255
          ]
        ]
      },
      {
        "name": "Park Origin Chula Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 168,
        "min_height": 148,
        "footprint": [
          [
            100.52328,
            13.733342
          ],
          [
            100.52372,
            13.733342
          ],
          [
            100.52372,
            13.733658
          ],
          [
            100.52328,
            13.733658
          ],
          [
            100.52328,
            13.733342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Duo Space",
        "size": "23.50 – 34.50 m²"
      },
      {
        "label": "2 Bedrooms Duo Space",
        "size": "47.00 – 60.50 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT หัวลำโพง (BL28)",
        "dist": "550 m",
        "type": "mrt"
      },
      {
        "name": "MRT สามย่าน (BL27)",
        "dist": "750 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Hua Lamphong Station",
        "kind": "Heritage",
        "color": "#F59E0B",
        "lat": 13.738,
        "lon": 100.5165,
        "dist": "600 m"
      }
    ]
  },
  {
    "id": "park-origin-ratchathewi",
    "name": "Park Origin Ratchathewi",
    "brandId": "origin",
    "brandName": "Origin Property",
    "category": "คอนโดมิเนียมซูเปอร์พรีเมียม",
    "categoryColor": "#F97316",
    "developer": "Origin Property",
    "developerSite": "https://www.origin.co.th/",
    "image": "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 140,
    "floors": 41,
    "units": 264,
    "unitsPerFloor": 8,
    "parking": 264,
    "parkingRatio": "100%",
    "landRai": 1.2,
    "facilitiesM2": "Sky Amphitheatre & 41st Fl Pool",
    "priceRange": "฿8.5M – ฿35M",
    "district": "ราชเทวี",
    "location": "ถ.เพชรบุรี ใกล้ BTS ราชเทวี",
    "lat": 13.7525,
    "lon": 100.5285,
    "desc": "คอนโดระดับซูเปอร์พรีเมียมเพดานสูง Duo Space ทุกห้อง ที่จอดรถอัตโนมัติ 100% ห่าง BTS ราชเทวีเพียง 400 ม.",
    "footprint": [
      [
        100.5281,
        13.752212
      ],
      [
        100.5289,
        13.752212
      ],
      [
        100.5289,
        13.752788
      ],
      [
        100.5281,
        13.752788
      ],
      [
        100.5281,
        13.752212
      ]
    ],
    "parts": [
      {
        "name": "Park Origin Ratchathewi Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.52802,
            13.752154
          ],
          [
            100.52898,
            13.752154
          ],
          [
            100.52898,
            13.752846
          ],
          [
            100.52802,
            13.752846
          ],
          [
            100.52802,
            13.752154
          ]
        ]
      },
      {
        "name": "Park Origin Ratchathewi Residential Tower",
        "color": "#C2410C",
        "height": 123,
        "min_height": 22,
        "footprint": [
          [
            100.52816,
            13.752255
          ],
          [
            100.52884,
            13.752255
          ],
          [
            100.52884,
            13.752745
          ],
          [
            100.52816,
            13.752745
          ],
          [
            100.52816,
            13.752255
          ]
        ]
      },
      {
        "name": "Park Origin Ratchathewi Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 140,
        "min_height": 123,
        "footprint": [
          [
            100.52828,
            13.752342
          ],
          [
            100.52872,
            13.752342
          ],
          [
            100.52872,
            13.752658
          ],
          [
            100.52828,
            13.752658
          ],
          [
            100.52828,
            13.752342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Duo Space",
        "size": "33.00 – 35.00 m²"
      },
      {
        "label": "2 Bedrooms Duo Space",
        "size": "55.00 – 58.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ราชเทวี (N1)",
        "dist": "400 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Siam Paragon",
        "kind": "Mall",
        "color": "#7C3AED",
        "lat": 13.746,
        "lon": 100.535,
        "dist": "950 m"
      }
    ]
  },
  {
    "id": "knightsbridge-prime-sathorn",
    "name": "KnightsBridge Prime Sathorn",
    "brandId": "origin",
    "brandName": "Origin Property",
    "category": "คอนโดมิเนียมดูโอสเปซสาทร",
    "categoryColor": "#F97316",
    "developer": "Origin Property",
    "developerSite": "https://www.origin.co.th/",
    "image": "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#9A3412",
    "height": 150,
    "floors": 43,
    "units": 726,
    "unitsPerFloor": 22,
    "parking": 500,
    "parkingRatio": "70%",
    "landRai": 2.3,
    "facilitiesM2": "Sky Lounge & Lap Pool with Sathorn View",
    "priceRange": "฿4.8M – ฿16M",
    "district": "สาทร",
    "location": "ถ.นราธิวาสราชนครินทร์ ใกล้ BRT อาคารสงเคราะห์",
    "lat": 13.7175,
    "lon": 100.5318,
    "desc": "คอนโดหรูใจกลางย่านการเงินสาทร ดีไซน์ห้องเพดานสูง Duo Space 4.4 ม. พร้อมสระว่ายน้ำลอยฟ้าขนาดใหญ่และ Sky Lounge วิวพาโนรามาสาทร",
    "footprint": [
      [
        100.53136,
        13.717183
      ],
      [
        100.53224,
        13.717183
      ],
      [
        100.53224,
        13.717817
      ],
      [
        100.53136,
        13.717817
      ],
      [
        100.53136,
        13.717183
      ]
    ],
    "parts": [
      {
        "name": "KnightsBridge Prime Sathorn Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 24,
        "min_height": 0,
        "footprint": [
          [
            100.53132,
            13.717154
          ],
          [
            100.53228,
            13.717154
          ],
          [
            100.53228,
            13.717846
          ],
          [
            100.53132,
            13.717846
          ],
          [
            100.53132,
            13.717154
          ]
        ]
      },
      {
        "name": "KnightsBridge Prime Sathorn Residential Tower",
        "color": "#9A3412",
        "height": 132,
        "min_height": 24,
        "footprint": [
          [
            100.53146,
            13.717255
          ],
          [
            100.53214,
            13.717255
          ],
          [
            100.53214,
            13.717745
          ],
          [
            100.53146,
            13.717745
          ],
          [
            100.53146,
            13.717255
          ]
        ]
      },
      {
        "name": "KnightsBridge Prime Sathorn Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 150,
        "min_height": 132,
        "footprint": [
          [
            100.53158,
            13.717342
          ],
          [
            100.53202,
            13.717342
          ],
          [
            100.53202,
            13.717658
          ],
          [
            100.53158,
            13.717658
          ],
          [
            100.53158,
            13.717342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Duo Space",
        "size": "24.00 – 30.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "44.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BRT อาคารสงเคราะห์ (B2)",
        "dist": "50 m",
        "type": "bts"
      },
      {
        "name": "BTS ช่องนนทรี (S3)",
        "dist": "650 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Empire Tower",
        "kind": "Office",
        "color": "#3B82F6",
        "lat": 13.7205,
        "lon": 100.5295,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "knightsbridge-space-rama9",
    "name": "KnightsBridge Space Rama 9",
    "brandId": "origin",
    "brandName": "Origin Property",
    "category": "คอนโดมิเนียมดูโอสเปซ New CBD",
    "categoryColor": "#F97316",
    "developer": "Origin Property",
    "developerSite": "https://www.origin.co.th/",
    "image": "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 120,
    "floors": 27,
    "units": 325,
    "unitsPerFloor": 14,
    "parking": 170,
    "parkingRatio": "52%",
    "landRai": 2.1,
    "facilitiesM2": "Duo Space Rooftop Club",
    "priceRange": "฿5.2M – ฿19M",
    "district": "ดินแดง",
    "location": "ถ.อโศก-ดินแดง ใกล้ MRT พระราม 9",
    "lat": 13.7572,
    "lon": 100.5642,
    "desc": "คอนโดมิเนียม Duo Space เพดานสูง 4.2 ม. ทุกยูนิตแห่งแรกในย่านพระราม 9 ใกล้ MRT พระราม 9 เพียง 350 ม.",
    "footprint": [
      [
        100.56378,
        13.756898
      ],
      [
        100.56462,
        13.756898
      ],
      [
        100.56462,
        13.757502
      ],
      [
        100.56378,
        13.757502
      ],
      [
        100.56378,
        13.756898
      ]
    ],
    "parts": [
      {
        "name": "KnightsBridge Space Rama 9 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 19,
        "min_height": 0,
        "footprint": [
          [
            100.56372,
            13.756854
          ],
          [
            100.56468,
            13.756854
          ],
          [
            100.56468,
            13.757546
          ],
          [
            100.56372,
            13.757546
          ],
          [
            100.56372,
            13.756854
          ]
        ]
      },
      {
        "name": "KnightsBridge Space Rama 9 Residential Tower",
        "color": "#C2410C",
        "height": 106,
        "min_height": 19,
        "footprint": [
          [
            100.56386,
            13.756955
          ],
          [
            100.56454,
            13.756955
          ],
          [
            100.56454,
            13.757445
          ],
          [
            100.56386,
            13.757445
          ],
          [
            100.56386,
            13.756955
          ]
        ]
      },
      {
        "name": "KnightsBridge Space Rama 9 Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 120,
        "min_height": 106,
        "footprint": [
          [
            100.56398,
            13.757042
          ],
          [
            100.56442,
            13.757042
          ],
          [
            100.56442,
            13.757358
          ],
          [
            100.56398,
            13.757358
          ],
          [
            100.56398,
            13.757042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Duo Space",
        "size": "23.30 – 33.00 m²"
      },
      {
        "label": "2 Bedrooms Duo Space",
        "size": "57.40 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT พระราม 9 (BL20)",
        "dist": "350 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Fortune Town",
        "kind": "Mall",
        "color": "#2563EB",
        "lat": 13.757,
        "lon": 100.564,
        "dist": "200 m"
      }
    ]
  },
  {
    "id": "knightsbridge-prime-onnut",
    "name": "KnightsBridge Prime Onnut",
    "brandId": "origin",
    "brandName": "Origin Property",
    "category": "คอนโดมิเนียมไฮไรส์สูงที่สุดในอ่อนนุช",
    "categoryColor": "#F97316",
    "developer": "Origin Property",
    "developerSite": "https://www.origin.co.th/",
    "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 155,
    "floors": 47,
    "units": 600,
    "unitsPerFloor": 16,
    "parking": 390,
    "parkingRatio": "65%",
    "landRai": 2.1,
    "facilitiesM2": "Horizon Sky Pool & Sky Panoramic Lounge",
    "priceRange": "฿3.8M – ฿12M",
    "district": "วัฒนา",
    "location": "สุขุมวิท 77 ใกล้ BTS อ่อนนุช",
    "lat": 13.7118,
    "lon": 100.6022,
    "desc": "ตึกสูงที่สุดในย่านอ่อนนุช (47 ชั้น) โดดเด่นด้วยห้องพักเพดานสูง 3 ม. และ Horizon Sky Pool ชั้นดาดฟ้าชมวิวโค้งน้ำบางกระเจ้า",
    "footprint": [
      [
        100.60175,
        13.711476
      ],
      [
        100.60265,
        13.711476
      ],
      [
        100.60265,
        13.712124
      ],
      [
        100.60175,
        13.712124
      ],
      [
        100.60175,
        13.711476
      ]
    ],
    "parts": [
      {
        "name": "KnightsBridge Prime Onnut Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [
            100.60172,
            13.711454
          ],
          [
            100.60268,
            13.711454
          ],
          [
            100.60268,
            13.712146
          ],
          [
            100.60172,
            13.712146
          ],
          [
            100.60172,
            13.711454
          ]
        ]
      },
      {
        "name": "KnightsBridge Prime Onnut Residential Tower",
        "color": "#C2410C",
        "height": 136,
        "min_height": 25,
        "footprint": [
          [
            100.60186,
            13.711555
          ],
          [
            100.60254,
            13.711555
          ],
          [
            100.60254,
            13.712045
          ],
          [
            100.60186,
            13.712045
          ],
          [
            100.60186,
            13.711555
          ]
        ]
      },
      {
        "name": "KnightsBridge Prime Onnut Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 155,
        "min_height": 136,
        "footprint": [
          [
            100.60198,
            13.711642
          ],
          [
            100.60242,
            13.711642
          ],
          [
            100.60242,
            13.711958
          ],
          [
            100.60198,
            13.711958
          ],
          [
            100.60198,
            13.711642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "22.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "26.00 – 31.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "55.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS อ่อนนุช (E9)",
        "dist": "600 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Big C Extra Onnut",
        "kind": "Supermarket",
        "color": "#EF4444",
        "lat": 13.7125,
        "lon": 100.603,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "knightsbridge-space-ratchayothin",
    "name": "KnightsBridge Space Ratchayothin",
    "brandId": "origin",
    "brandName": "Origin Property",
    "category": "คอนโดมิเนียมดูโอสเปซ",
    "categoryColor": "#F97316",
    "developer": "Origin Property",
    "developerSite": "https://www.origin.co.th/",
    "image": "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 125,
    "floors": 33,
    "units": 488,
    "unitsPerFloor": 18,
    "parking": 340,
    "parkingRatio": "70%",
    "landRai": 2.1,
    "facilitiesM2": "Sky Infinite Space Pool & Fitness",
    "priceRange": "฿4.5M – ฿15M",
    "district": "จตุจักร",
    "location": "ถ.พหลโยธิน ติด BTS พหลโยธิน 24",
    "lat": 13.8268,
    "lon": 100.5692,
    "desc": "คอนโดนวัตกรรม Duo Space ติดบันไดทางขึ้น BTS พหลโยธิน 24 เพียง 20 ม. จัดเต็มที่จอดรถอัตโนมัติกว่า 70%",
    "footprint": [
      [
        100.56878,
        13.826498
      ],
      [
        100.56962,
        13.826498
      ],
      [
        100.56962,
        13.827102
      ],
      [
        100.56878,
        13.827102
      ],
      [
        100.56878,
        13.826498
      ]
    ],
    "parts": [
      {
        "name": "KnightsBridge Space Ratchayothin Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 20,
        "min_height": 0,
        "footprint": [
          [
            100.56872,
            13.826454
          ],
          [
            100.56968,
            13.826454
          ],
          [
            100.56968,
            13.827146
          ],
          [
            100.56872,
            13.827146
          ],
          [
            100.56872,
            13.826454
          ]
        ]
      },
      {
        "name": "KnightsBridge Space Ratchayothin Residential Tower",
        "color": "#C2410C",
        "height": 110,
        "min_height": 20,
        "footprint": [
          [
            100.56886,
            13.826555
          ],
          [
            100.56954,
            13.826555
          ],
          [
            100.56954,
            13.827045
          ],
          [
            100.56886,
            13.827045
          ],
          [
            100.56886,
            13.826555
          ]
        ]
      },
      {
        "name": "KnightsBridge Space Ratchayothin Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 125,
        "min_height": 110,
        "footprint": [
          [
            100.56898,
            13.826642
          ],
          [
            100.56942,
            13.826642
          ],
          [
            100.56942,
            13.826958
          ],
          [
            100.56898,
            13.826958
          ],
          [
            100.56898,
            13.826642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Duo Space",
        "size": "26.00 – 35.00 m²"
      },
      {
        "label": "2 Bedrooms Duo Space",
        "size": "54.00 – 61.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS พหลโยธิน 24 (N10)",
        "dist": "20 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Major Cineplex Ratchayothin",
        "kind": "Cinema",
        "color": "#EF4444",
        "lat": 13.83,
        "lon": 100.571,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "noble-around-ari",
    "name": "Noble Around Ari",
    "brandId": "noble",
    "brandName": "Noble Development",
    "category": "คอนโดมิเนียมมินิมอลไฮบริด",
    "categoryColor": "#64748B",
    "developer": "Noble Development",
    "developerSite": "https://www.noblehome.com/",
    "image": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E293B",
    "color": "#0F172A",
    "height": 145,
    "floors": 39,
    "units": 611,
    "unitsPerFloor": 18,
    "parking": 300,
    "parkingRatio": "49%",
    "landRai": 3.1,
    "facilitiesM2": "Skin Facade & The Mezzanine Library",
    "priceRange": "฿6.2M – ฿22M",
    "district": "พญาไท",
    "location": "ถ.พหลโยธิน ติด BTS อารีย์",
    "lat": 13.7802,
    "lon": 100.5442,
    "desc": "คอนโดมิเนียมไฮบริดดีไซน์ห่าง BTS อารีย์เพียง 90 ม. เอกลักษณ์ Skin Facade กรองแสง และ The Mezzanine Library ลอยฟ้า",
    "footprint": [
      [
        100.54378,
        13.779898
      ],
      [
        100.54462,
        13.779898
      ],
      [
        100.54462,
        13.780502
      ],
      [
        100.54378,
        13.780502
      ],
      [
        100.54378,
        13.779898
      ]
    ],
    "parts": [
      {
        "name": "Noble Around Ari Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 23,
        "min_height": 0,
        "footprint": [
          [
            100.54372,
            13.779854
          ],
          [
            100.54468,
            13.779854
          ],
          [
            100.54468,
            13.780546
          ],
          [
            100.54372,
            13.780546
          ],
          [
            100.54372,
            13.779854
          ]
        ]
      },
      {
        "name": "Noble Around Ari Residential Tower",
        "color": "#0F172A",
        "height": 128,
        "min_height": 23,
        "footprint": [
          [
            100.54386,
            13.779955
          ],
          [
            100.54454,
            13.779955
          ],
          [
            100.54454,
            13.780445
          ],
          [
            100.54386,
            13.780445
          ],
          [
            100.54386,
            13.779955
          ]
        ]
      },
      {
        "name": "Noble Around Ari Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 145,
        "min_height": 128,
        "footprint": [
          [
            100.54398,
            13.780042
          ],
          [
            100.54442,
            13.780042
          ],
          [
            100.54442,
            13.780358
          ],
          [
            100.54398,
            13.780358
          ],
          [
            100.54398,
            13.780042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "26.40 – 34.90 m²"
      },
      {
        "label": "1 Bedroom Plus",
        "size": "41.60 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS อารีย์ (N5)",
        "dist": "90 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "La Villa Ari",
        "kind": "Lifestyle",
        "color": "#10B981",
        "lat": 13.7795,
        "lon": 100.5445,
        "dist": "120 m"
      }
    ]
  },
  {
    "id": "noble-reform-ari",
    "name": "Noble Reform",
    "brandId": "noble",
    "brandName": "Noble Development",
    "category": "คอนโดมิเนียมไอคอนิกอารีย์",
    "categoryColor": "#64748B",
    "developer": "Noble Development",
    "developerSite": "https://www.noblehome.com/",
    "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E293B",
    "color": "#1E293B",
    "height": 85,
    "floors": 22,
    "units": 212,
    "unitsPerFloor": 12,
    "parking": 130,
    "parkingRatio": "61%",
    "landRai": 1.3,
    "facilitiesM2": "Sky Infinity Pool & Fitness",
    "priceRange": "฿5.8M – ฿18M",
    "district": "พญาไท",
    "location": "ซอยอารีย์ (พหลโยธิน 7) ใกล้ BTS อารีย์",
    "lat": 13.7792,
    "lon": 100.5435,
    "desc": "คอนโดมิเนียมมินิมอลเอกลักษณ์โนเบิลใจกลางซอยอารีย์ ใกล้ La Villa Ari เพียง 120 ม.",
    "footprint": [
      [
        100.54312,
        13.778926
      ],
      [
        100.54388,
        13.778926
      ],
      [
        100.54388,
        13.779474
      ],
      [
        100.54312,
        13.779474
      ],
      [
        100.54312,
        13.778926
      ]
    ],
    "parts": [
      {
        "name": "Noble Reform Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.54302,
            13.778854
          ],
          [
            100.54398,
            13.778854
          ],
          [
            100.54398,
            13.779546
          ],
          [
            100.54302,
            13.779546
          ],
          [
            100.54302,
            13.778854
          ]
        ]
      },
      {
        "name": "Noble Reform Residential Tower",
        "color": "#1E293B",
        "height": 75,
        "min_height": 16,
        "footprint": [
          [
            100.54316,
            13.778955
          ],
          [
            100.54384,
            13.778955
          ],
          [
            100.54384,
            13.779445
          ],
          [
            100.54316,
            13.779445
          ],
          [
            100.54316,
            13.778955
          ]
        ]
      },
      {
        "name": "Noble Reform Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 85,
        "min_height": 75,
        "footprint": [
          [
            100.54328,
            13.779042
          ],
          [
            100.54372,
            13.779042
          ],
          [
            100.54372,
            13.779358
          ],
          [
            100.54328,
            13.779358
          ],
          [
            100.54328,
            13.779042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "46.00 – 54.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "62.00 – 72.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS อารีย์ (N5)",
        "dist": "120 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Ari Cafe District",
        "kind": "Lifestyle",
        "color": "#F59E0B",
        "lat": 13.779,
        "lon": 100.542,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "noble-revolve-ratchada",
    "name": "Noble Revolve Ratchada",
    "brandId": "noble",
    "brandName": "Noble Development",
    "category": "คอนโดมิเนียมมินิมอลโมเดิร์น",
    "categoryColor": "#64748B",
    "developer": "Noble Development",
    "developerSite": "https://www.noblehome.com/",
    "image": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E293B",
    "color": "#0F172A",
    "height": 142,
    "floors": 40,
    "units": 755,
    "unitsPerFloor": 22,
    "parking": 300,
    "parkingRatio": "40%",
    "landRai": 3.1,
    "facilitiesM2": "Sky Garden & Salt-water Pool",
    "priceRange": "฿3.9M – ฿12M",
    "district": "ห้วยขวาง",
    "location": "ถ.รัชดาภิเษก ติด MRT ศูนย์วัฒนธรรมฯ",
    "lat": 13.7662,
    "lon": 100.5705,
    "desc": "คอนโดสไตล์มินิมอลติดสถานี MRT ศูนย์วัฒนธรรมฯ เพียง 80 ม. จุดตัดรถไฟฟ้าสายสีส้มในอนาคต",
    "footprint": [
      [
        100.57008,
        13.765898
      ],
      [
        100.57092,
        13.765898
      ],
      [
        100.57092,
        13.766502
      ],
      [
        100.57008,
        13.766502
      ],
      [
        100.57008,
        13.765898
      ]
    ],
    "parts": [
      {
        "name": "Noble Revolve Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 23,
        "min_height": 0,
        "footprint": [
          [
            100.57002,
            13.765854
          ],
          [
            100.57098,
            13.765854
          ],
          [
            100.57098,
            13.766546
          ],
          [
            100.57002,
            13.766546
          ],
          [
            100.57002,
            13.765854
          ]
        ]
      },
      {
        "name": "Noble Revolve Residential Tower",
        "color": "#0F172A",
        "height": 125,
        "min_height": 23,
        "footprint": [
          [
            100.57016,
            13.765955
          ],
          [
            100.57084,
            13.765955
          ],
          [
            100.57084,
            13.766445
          ],
          [
            100.57016,
            13.766445
          ],
          [
            100.57016,
            13.765955
          ]
        ]
      },
      {
        "name": "Noble Revolve Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 142,
        "min_height": 125,
        "footprint": [
          [
            100.57028,
            13.766042
          ],
          [
            100.57072,
            13.766042
          ],
          [
            100.57072,
            13.766358
          ],
          [
            100.57028,
            13.766358
          ],
          [
            100.57028,
            13.766042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "25.00 – 26.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "52.00 – 54.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT ศูนย์วัฒนธรรมฯ (BL19)",
        "dist": "80 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Esplanade Ratchada",
        "kind": "Mall",
        "color": "#EC4899",
        "lat": 13.7655,
        "lon": 100.571,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "noble-be19",
    "name": "Noble BE19",
    "brandId": "noble",
    "brandName": "Noble Development",
    "category": "คอนโดมิเนียมระดับลักชัวรี",
    "categoryColor": "#64748B",
    "developer": "Noble Development",
    "developerSite": "https://www.noblehome.com/",
    "image": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E293B",
    "color": "#0F172A",
    "height": 165,
    "floors": 48,
    "units": 586,
    "unitsPerFloor": 16,
    "parking": 390,
    "parkingRatio": "67%",
    "landRai": 3.2,
    "facilitiesM2": "Sky Infinity Lap Pool & English Lounge",
    "priceRange": "฿7.5M – ฿32M",
    "district": "วัฒนา",
    "location": "สุขุมวิท 19 ใกล้ BTS อโศก",
    "lat": 13.7412,
    "lon": 100.5608,
    "desc": "คอนโดคู่หรูสุขุมวิท 19 ทะลุสุขุมวิท 15 ใกล้ Terminal 21 และ BTS อโศก โดดเด่นด้วย Sky Infinity Lap Pool",
    "footprint": [
      [
        100.56035,
        13.740876
      ],
      [
        100.56125,
        13.740876
      ],
      [
        100.56125,
        13.741524
      ],
      [
        100.56035,
        13.741524
      ],
      [
        100.56035,
        13.740876
      ]
    ],
    "parts": [
      {
        "name": "Noble BE19 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.56032,
            13.740854
          ],
          [
            100.56128,
            13.740854
          ],
          [
            100.56128,
            13.741546
          ],
          [
            100.56032,
            13.741546
          ],
          [
            100.56032,
            13.740854
          ]
        ]
      },
      {
        "name": "Noble BE19 Residential Tower",
        "color": "#0F172A",
        "height": 145,
        "min_height": 26,
        "footprint": [
          [
            100.56046,
            13.740955
          ],
          [
            100.56114,
            13.740955
          ],
          [
            100.56114,
            13.741445
          ],
          [
            100.56046,
            13.741445
          ],
          [
            100.56046,
            13.740955
          ]
        ]
      },
      {
        "name": "Noble BE19 Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 165,
        "min_height": 145,
        "footprint": [
          [
            100.56058,
            13.741042
          ],
          [
            100.56102,
            13.741042
          ],
          [
            100.56102,
            13.741358
          ],
          [
            100.56058,
            13.741358
          ],
          [
            100.56058,
            13.741042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "33.50 – 50.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "60.00 – 73.00 m²"
      },
      {
        "label": "Penthouse",
        "size": "86.00 – 146.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS อโศก (E4)",
        "dist": "500 m",
        "type": "bts"
      },
      {
        "name": "MRT สุขุมวิท (BL22)",
        "dist": "500 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Terminal 21",
        "kind": "Mall",
        "color": "#F59E0B",
        "lat": 13.7375,
        "lon": 100.56,
        "dist": "500 m"
      }
    ]
  },
  {
    "id": "noble-be33",
    "name": "Noble BE33",
    "brandId": "noble",
    "brandName": "Noble Development",
    "category": "คอนโดมิเนียมหรูพร้อมพงษ์",
    "categoryColor": "#64748B",
    "developer": "Noble Development",
    "developerSite": "https://www.noblehome.com/",
    "image": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E293B",
    "color": "#0F172A",
    "height": 120,
    "floors": 31,
    "units": 277,
    "unitsPerFloor": 11,
    "parking": 187,
    "parkingRatio": "67%",
    "landRai": 2,
    "facilitiesM2": "Semi-outdoor Sky Lounge & Reflective Pool",
    "priceRange": "฿7.8M – ฿30M",
    "district": "วัฒนา",
    "location": "สุขุมวิท 33 ใกล้ BTS พร้อมพงษ์",
    "lat": 13.7368,
    "lon": 100.5682,
    "desc": "คอนโดมิเนียมหรูพร้อมระเบียงกว้างส่วนตัว สะดวกสบายใกล้ The EmDistrict พร้อม Semi-outdoor Sky Lounge ลอยฟ้า",
    "footprint": [
      [
        100.5678,
        13.736512
      ],
      [
        100.5686,
        13.736512
      ],
      [
        100.5686,
        13.737088
      ],
      [
        100.5678,
        13.737088
      ],
      [
        100.5678,
        13.736512
      ]
    ],
    "parts": [
      {
        "name": "Noble BE33 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 19,
        "min_height": 0,
        "footprint": [
          [
            100.56772,
            13.736454
          ],
          [
            100.56868,
            13.736454
          ],
          [
            100.56868,
            13.737146
          ],
          [
            100.56772,
            13.737146
          ],
          [
            100.56772,
            13.736454
          ]
        ]
      },
      {
        "name": "Noble BE33 Residential Tower",
        "color": "#0F172A",
        "height": 106,
        "min_height": 19,
        "footprint": [
          [
            100.56786,
            13.736555
          ],
          [
            100.56854,
            13.736555
          ],
          [
            100.56854,
            13.737045
          ],
          [
            100.56786,
            13.737045
          ],
          [
            100.56786,
            13.736555
          ]
        ]
      },
      {
        "name": "Noble BE33 Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 120,
        "min_height": 106,
        "footprint": [
          [
            100.56798,
            13.736642
          ],
          [
            100.56842,
            13.736642
          ],
          [
            100.56842,
            13.736958
          ],
          [
            100.56798,
            13.736958
          ],
          [
            100.56798,
            13.736642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "34.00 – 43.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "51.50 – 69.50 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "76.00 – 139.50 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS พร้อมพงษ์ (E5)",
        "dist": "700 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "The EmQuartier",
        "kind": "Luxury Mall",
        "color": "#F59E0B",
        "lat": 13.731,
        "lon": 100.5698,
        "dist": "650 m"
      }
    ]
  },
  {
    "id": "noble-state-39",
    "name": "Noble State 39",
    "brandId": "noble",
    "brandName": "Noble Development",
    "category": "คอนโดมิเนียมบรูทัลลิสต์คลาสสิก",
    "categoryColor": "#64748B",
    "developer": "Noble Development",
    "developerSite": "https://www.noblehome.com/",
    "image": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E293B",
    "color": "#0F172A",
    "height": 135,
    "floors": 36,
    "units": 349,
    "unitsPerFloor": 14,
    "parking": 189,
    "parkingRatio": "54%",
    "landRai": 1.9,
    "facilitiesM2": "The Tea Room & Rooftop Forest",
    "priceRange": "฿6.5M – ฿26M",
    "district": "วัฒนา",
    "location": "สุขุมวิท 39 ใกล้ BTS พร้อมพงษ์",
    "lat": 13.7342,
    "lon": 100.5718,
    "desc": "คอนโดมิเนียมสถาปัตยกรรมบรูทัลลิสต์คลาสสิกซอยสุขุมวิท 39 มาพร้อมสวนแนวตั้งและ The Tea Room ชมวิวเมือง",
    "footprint": [
      [
        100.57138,
        13.733898
      ],
      [
        100.57222,
        13.733898
      ],
      [
        100.57222,
        13.734502
      ],
      [
        100.57138,
        13.734502
      ],
      [
        100.57138,
        13.733898
      ]
    ],
    "parts": [
      {
        "name": "Noble State 39 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.57132,
            13.733854
          ],
          [
            100.57228,
            13.733854
          ],
          [
            100.57228,
            13.734546
          ],
          [
            100.57132,
            13.734546
          ],
          [
            100.57132,
            13.733854
          ]
        ]
      },
      {
        "name": "Noble State 39 Residential Tower",
        "color": "#0F172A",
        "height": 119,
        "min_height": 22,
        "footprint": [
          [
            100.57146,
            13.733955
          ],
          [
            100.57214,
            13.733955
          ],
          [
            100.57214,
            13.734445
          ],
          [
            100.57146,
            13.734445
          ],
          [
            100.57146,
            13.733955
          ]
        ]
      },
      {
        "name": "Noble State 39 Sky Facilities & Crown",
        "color": "#10B981",
        "height": 135,
        "min_height": 119,
        "footprint": [
          [
            100.57158,
            13.734042
          ],
          [
            100.57202,
            13.734042
          ],
          [
            100.57202,
            13.734358
          ],
          [
            100.57158,
            13.734358
          ],
          [
            100.57158,
            13.734042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "29.80 – 42.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "58.40 – 59.60 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS พร้อมพงษ์ (E5)",
        "dist": "450 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "The EmQuartier",
        "kind": "Luxury Mall",
        "color": "#F59E0B",
        "lat": 13.731,
        "lon": 100.5698,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "noble-above-wireless",
    "name": "Noble Above Wireless-Ruamrudee",
    "brandId": "noble",
    "brandName": "Noble Development",
    "category": "โลว์ไรส์คอนโดมิเนียมพรีเมียม",
    "categoryColor": "#64748B",
    "developer": "Noble Development",
    "developerSite": "https://www.noblehome.com/",
    "image": "https://images.unsplash.com/photo-1584738766473-61c083514bf4?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E293B",
    "color": "#1E293B",
    "height": 45,
    "floors": 8,
    "units": 104,
    "unitsPerFloor": 14,
    "parking": 70,
    "parkingRatio": "67%",
    "landRai": 1.2,
    "facilitiesM2": "Private Courtyard Pool & Club",
    "priceRange": "฿5.5M – ฿18M",
    "district": "ปทุมวัน",
    "location": "ซอยร่วมฤดี ใกล้ BTS เพลินจิต",
    "lat": 13.7385,
    "lon": 100.5492,
    "desc": "โลว์ไรส์คอนโดมิเนียมระดับพรีเมียมในย่านเพลินจิต-ร่วมฤดี มอบความเป็นส่วนตัวสูงท่ามกลางร่มเงาไม้ใหญ่",
    "footprint": [
      [
        100.54882,
        13.738226
      ],
      [
        100.54958,
        13.738226
      ],
      [
        100.54958,
        13.738774
      ],
      [
        100.54882,
        13.738774
      ],
      [
        100.54882,
        13.738226
      ]
    ],
    "parts": [
      {
        "name": "Noble Above Wireless Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.54872,
            13.738154
          ],
          [
            100.54968,
            13.738154
          ],
          [
            100.54968,
            13.738846
          ],
          [
            100.54872,
            13.738846
          ],
          [
            100.54872,
            13.738154
          ]
        ]
      },
      {
        "name": "Noble Above Wireless Residential Tower",
        "color": "#1E293B",
        "height": 40,
        "min_height": 16,
        "footprint": [
          [
            100.54886,
            13.738255
          ],
          [
            100.54954,
            13.738255
          ],
          [
            100.54954,
            13.738745
          ],
          [
            100.54886,
            13.738745
          ],
          [
            100.54886,
            13.738255
          ]
        ]
      },
      {
        "name": "Noble Above Wireless Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 45,
        "min_height": 40,
        "footprint": [
          [
            100.54898,
            13.738342
          ],
          [
            100.54942,
            13.738342
          ],
          [
            100.54942,
            13.738658
          ],
          [
            100.54898,
            13.738658
          ],
          [
            100.54898,
            13.738342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "54.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "85.00 – 119.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS เพลินจิต (E2)",
        "dist": "900 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "All Seasons Place",
        "kind": "Office",
        "color": "#3B82F6",
        "lat": 13.738,
        "lon": 100.5475,
        "dist": "250 m"
      }
    ]
  },
  {
    "id": "nue-district-r9",
    "name": "Nue District R9",
    "brandId": "noble",
    "brandName": "Noble Development",
    "category": "คอนโดมิเนียมไลฟ์สไตล์ New CBD",
    "categoryColor": "#64748B",
    "developer": "Noble Development",
    "developerSite": "https://www.noblehome.com/",
    "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E293B",
    "color": "#0F172A",
    "height": 125,
    "floors": 33,
    "units": 1441,
    "unitsPerFloor": 36,
    "parking": 480,
    "parkingRatio": "33%",
    "landRai": 6.1,
    "facilitiesM2": "8 Lifestyle Zones & 50 Facilities",
    "priceRange": "฿3.5M – ฿11M",
    "district": "ห้วยขวาง",
    "location": "ถ.พระราม 9 ติดเซ็นทรัลพระราม 9",
    "lat": 13.7582,
    "lon": 100.5688,
    "desc": "คอนโดมิเนียมดีไซน์ทันสมัยติดเซ็นทรัลพระราม 9 เพียงก้าวเดิน จัดเต็มพื้นที่ส่วนกลาง 8 โซนกว่า 50 กิจกรรม",
    "footprint": [
      [
        100.56835,
        13.757876
      ],
      [
        100.56925,
        13.757876
      ],
      [
        100.56925,
        13.758524
      ],
      [
        100.56835,
        13.758524
      ],
      [
        100.56835,
        13.757876
      ]
    ],
    "parts": [
      {
        "name": "Nue District R9 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 20,
        "min_height": 0,
        "footprint": [
          [
            100.56832,
            13.757854
          ],
          [
            100.56928,
            13.757854
          ],
          [
            100.56928,
            13.758546
          ],
          [
            100.56832,
            13.758546
          ],
          [
            100.56832,
            13.757854
          ]
        ]
      },
      {
        "name": "Nue District R9 Residential Tower",
        "color": "#0F172A",
        "height": 110,
        "min_height": 20,
        "footprint": [
          [
            100.56846,
            13.757955
          ],
          [
            100.56914,
            13.757955
          ],
          [
            100.56914,
            13.758445
          ],
          [
            100.56846,
            13.758445
          ],
          [
            100.56846,
            13.757955
          ]
        ]
      },
      {
        "name": "Nue District R9 Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 125,
        "min_height": 110,
        "footprint": [
          [
            100.56858,
            13.758042
          ],
          [
            100.56902,
            13.758042
          ],
          [
            100.56902,
            13.758358
          ],
          [
            100.56858,
            13.758358
          ],
          [
            100.56858,
            13.758042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "26.00 – 30.20 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "40.50 – 46.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT พระราม 9 (BL20)",
        "dist": "200 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Rama 9",
        "kind": "Mall",
        "color": "#D97706",
        "lat": 13.758,
        "lon": 100.566,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "supalai-premier-charoennakhon",
    "name": "Supalai Premier Charoennakhon",
    "brandId": "supalai",
    "brandName": "Supalai",
    "category": "คอนโดมิเนียมวิวแม่น้ำเจ้าพระยา",
    "categoryColor": "#EA580C",
    "developer": "Supalai",
    "developerSite": "https://www.supalai.com/",
    "image": "https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 110,
    "floors": 29,
    "units": 578,
    "unitsPerFloor": 22,
    "parking": 350,
    "parkingRatio": "60%",
    "landRai": 5,
    "facilitiesM2": "Sky Lounge & Chao Phraya River Deck",
    "priceRange": "฿3.8M – ฿16M",
    "district": "คลองสาน",
    "location": "ถ.ลาดหญ้า ใกล้รถไฟฟ้าสายสีทองสถานีคลองสาน",
    "lat": 13.7295,
    "lon": 100.5048,
    "desc": "คอนโดมิเนียมใกล้ ICONSIAM เพียง 400 ม. และรถไฟฟ้าสายสีทองคลองสาน พร้อม Social Club และ Sky Lounge ชมวิวแม่น้ำเจ้าพระยา",
    "footprint": [
      [
        100.50435,
        13.729176
      ],
      [
        100.50525,
        13.729176
      ],
      [
        100.50525,
        13.729824
      ],
      [
        100.50435,
        13.729824
      ],
      [
        100.50435,
        13.729176
      ]
    ],
    "parts": [
      {
        "name": "Supalai Premier Charoennakhon Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.50432,
            13.729154
          ],
          [
            100.50528,
            13.729154
          ],
          [
            100.50528,
            13.729846
          ],
          [
            100.50432,
            13.729846
          ],
          [
            100.50432,
            13.729154
          ]
        ]
      },
      {
        "name": "Supalai Premier Charoennakhon Residential Tower",
        "color": "#C2410C",
        "height": 97,
        "min_height": 18,
        "footprint": [
          [
            100.50446,
            13.729255
          ],
          [
            100.50514,
            13.729255
          ],
          [
            100.50514,
            13.729745
          ],
          [
            100.50446,
            13.729745
          ],
          [
            100.50446,
            13.729255
          ]
        ]
      },
      {
        "name": "Supalai Premier Charoennakhon Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 110,
        "min_height": 97,
        "footprint": [
          [
            100.50458,
            13.729342
          ],
          [
            100.50502,
            13.729342
          ],
          [
            100.50502,
            13.729658
          ],
          [
            100.50458,
            13.729658
          ],
          [
            100.50458,
            13.729342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "34.50 – 48.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "73.00 – 85.50 m²"
      }
    ],
    "transport": [
      {
        "name": "สายสีทอง สถานีคลองสาน (G3)",
        "dist": "150 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ICONSIAM",
        "kind": "Luxury Mall",
        "color": "#F59E0B",
        "lat": 13.7265,
        "lon": 100.5105,
        "dist": "400 m"
      }
    ]
  },
  {
    "id": "supalai-premier-asoke",
    "name": "Supalai Premier Asoke",
    "brandId": "supalai",
    "brandName": "Supalai",
    "category": "คอนโดมิเนียมไฮไรส์เพชรบุรี-อโศก",
    "categoryColor": "#EA580C",
    "developer": "Supalai",
    "developerSite": "https://www.supalai.com/",
    "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 135,
    "floors": 38,
    "units": 653,
    "unitsPerFloor": 20,
    "parking": 400,
    "parkingRatio": "61%",
    "landRai": 4.2,
    "facilitiesM2": "Sky Pool & Roof Garden",
    "priceRange": "฿4.2M – ฿15M",
    "district": "ห้วยขวาง",
    "location": "ถ.เพชรบุรี ใกล้ MRT เพชรบุรี",
    "lat": 13.7488,
    "lon": 100.5652,
    "desc": "คอนโดมิเนียมไฮไรส์ริมถนนเพชรบุรีตัดใหม่ ใกล้ MRT เพชรบุรีและท่าเรืออโศก พื้นที่จอดรถมากกว่า 60%",
    "footprint": [
      [
        100.56478,
        13.748498
      ],
      [
        100.56562,
        13.748498
      ],
      [
        100.56562,
        13.749102
      ],
      [
        100.56478,
        13.749102
      ],
      [
        100.56478,
        13.748498
      ]
    ],
    "parts": [
      {
        "name": "Supalai Premier Asoke Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.56472,
            13.748454
          ],
          [
            100.56568,
            13.748454
          ],
          [
            100.56568,
            13.749146
          ],
          [
            100.56472,
            13.749146
          ],
          [
            100.56472,
            13.748454
          ]
        ]
      },
      {
        "name": "Supalai Premier Asoke Residential Tower",
        "color": "#C2410C",
        "height": 119,
        "min_height": 22,
        "footprint": [
          [
            100.56486,
            13.748555
          ],
          [
            100.56554,
            13.748555
          ],
          [
            100.56554,
            13.749045
          ],
          [
            100.56486,
            13.749045
          ],
          [
            100.56486,
            13.748555
          ]
        ]
      },
      {
        "name": "Supalai Premier Asoke Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 135,
        "min_height": 119,
        "footprint": [
          [
            100.56498,
            13.748642
          ],
          [
            100.56542,
            13.748642
          ],
          [
            100.56542,
            13.748958
          ],
          [
            100.56498,
            13.748958
          ],
          [
            100.56498,
            13.748642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "39.00 – 50.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "65.00 – 96.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT เพชรบุรี (BL21)",
        "dist": "150 m",
        "type": "mrt"
      },
      {
        "name": "ARL มักกะสัน (A6)",
        "dist": "250 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Singha Complex",
        "kind": "Mall",
        "color": "#F59E0B",
        "lat": 13.7475,
        "lon": 100.563,
        "dist": "200 m"
      }
    ]
  },
  {
    "id": "supalai-oriental-sukhumvit-39",
    "name": "Supalai Oriental Sukhumvit 39",
    "brandId": "supalai",
    "brandName": "Supalai",
    "category": "คอนโดมิเนียมโอเรียนทัลลักชัวรี",
    "categoryColor": "#EA580C",
    "developer": "Supalai",
    "developerSite": "https://www.supalai.com/",
    "image": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 130,
    "floors": 35,
    "units": 1046,
    "unitsPerFloor": 16,
    "parking": 1046,
    "parkingRatio": "100%",
    "landRai": 10.1,
    "facilitiesM2": "3-Rai Green Park & 100% Parking",
    "priceRange": "฿5.5M – ฿28M",
    "district": "วัฒนา",
    "location": "สุขุมวิท 39 ใกล้ BTS พร้อมพงษ์",
    "lat": 13.7415,
    "lon": 100.5732,
    "desc": "คอนโดหรูสไตล์โอเรียนทัลบนพื้นที่กว่า 10 ไร่กลางสุขุมวิท 39 พร้อมที่จอดรถ 100% สวนพักผ่อนขนาดใหญ่กว่า 3 ไร่",
    "footprint": [
      [
        100.57272,
        13.741154
      ],
      [
        100.57368,
        13.741154
      ],
      [
        100.57368,
        13.741846
      ],
      [
        100.57272,
        13.741846
      ],
      [
        100.57272,
        13.741154
      ]
    ],
    "parts": [
      {
        "name": "Supalai Oriental 39 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 21,
        "min_height": 0,
        "footprint": [
          [
            100.57272,
            13.741154
          ],
          [
            100.57368,
            13.741154
          ],
          [
            100.57368,
            13.741846
          ],
          [
            100.57272,
            13.741846
          ],
          [
            100.57272,
            13.741154
          ]
        ]
      },
      {
        "name": "Supalai Oriental 39 Residential Tower",
        "color": "#C2410C",
        "height": 114,
        "min_height": 21,
        "footprint": [
          [
            100.57286,
            13.741255
          ],
          [
            100.57354,
            13.741255
          ],
          [
            100.57354,
            13.741745
          ],
          [
            100.57286,
            13.741745
          ],
          [
            100.57286,
            13.741255
          ]
        ]
      },
      {
        "name": "Supalai Oriental 39 Sky Facilities & Crown",
        "color": "#10B981",
        "height": 130,
        "min_height": 114,
        "footprint": [
          [
            100.57298,
            13.741342
          ],
          [
            100.57342,
            13.741342
          ],
          [
            100.57342,
            13.741658
          ],
          [
            100.57298,
            13.741658
          ],
          [
            100.57298,
            13.741342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "39.00 – 57.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "65.50 – 100.50 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "141.00 – 355.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS พร้อมพงษ์ (E5)",
        "dist": "1.2 km",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Fuji Supermarket 2",
        "kind": "Supermarket",
        "color": "#3B82F6",
        "lat": 13.7405,
        "lon": 100.572,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "supalai-loft-silom",
    "name": "Supalai Loft Silom",
    "brandId": "supalai",
    "brandName": "Supalai",
    "category": "คอนโดมิเนียมลอฟต์สีลม",
    "categoryColor": "#EA580C",
    "developer": "Supalai",
    "developerSite": "https://www.supalai.com/",
    "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 118,
    "floors": 32,
    "units": 360,
    "unitsPerFloor": 14,
    "parking": 220,
    "parkingRatio": "61%",
    "landRai": 2,
    "facilitiesM2": "Rooftop Sky Lounge & Ozone Pool",
    "priceRange": "฿4.5M – ฿17M",
    "district": "บางรัก",
    "location": "ถ.สีลม-สุรวงศ์",
    "lat": 13.7272,
    "lon": 100.5218,
    "desc": "คอนโดมิเนียมดีไซน์ลอฟต์เพดานสูงทำเลสีลม-สุรวงศ์ ใกล้ทางด่วนและ BTS ช่องนนทรี",
    "footprint": [
      [
        100.5214,
        13.726912
      ],
      [
        100.5222,
        13.726912
      ],
      [
        100.5222,
        13.727488
      ],
      [
        100.5214,
        13.727488
      ],
      [
        100.5214,
        13.726912
      ]
    ],
    "parts": [
      {
        "name": "Supalai Loft Silom Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 19,
        "min_height": 0,
        "footprint": [
          [
            100.52132,
            13.726854
          ],
          [
            100.52228,
            13.726854
          ],
          [
            100.52228,
            13.727546
          ],
          [
            100.52132,
            13.727546
          ],
          [
            100.52132,
            13.726854
          ]
        ]
      },
      {
        "name": "Supalai Loft Silom Residential Tower",
        "color": "#C2410C",
        "height": 104,
        "min_height": 19,
        "footprint": [
          [
            100.52146,
            13.726955
          ],
          [
            100.52214,
            13.726955
          ],
          [
            100.52214,
            13.727445
          ],
          [
            100.52146,
            13.727445
          ],
          [
            100.52146,
            13.726955
          ]
        ]
      },
      {
        "name": "Supalai Loft Silom Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 118,
        "min_height": 104,
        "footprint": [
          [
            100.52158,
            13.727042
          ],
          [
            100.52202,
            13.727042
          ],
          [
            100.52202,
            13.727358
          ],
          [
            100.52158,
            13.727358
          ],
          [
            100.52158,
            13.727042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "33.50 – 48.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "63.00 – 72.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS สุรศักดิ์ (S5)",
        "dist": "650 m",
        "type": "bts"
      },
      {
        "name": "BTS ช่องนนทรี (S3)",
        "dist": "850 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "MahaNakhon CUBE",
        "kind": "Dining",
        "color": "#F59E0B",
        "lat": 13.723,
        "lon": 100.528,
        "dist": "750 m"
      }
    ]
  },
  {
    "id": "supalai-riva-grande",
    "name": "Supalai Riva Grande",
    "brandId": "supalai",
    "brandName": "Supalai",
    "category": "รีสอร์ตคอนโดมิเนียมริมน้ำพระราม 3",
    "categoryColor": "#EA580C",
    "developer": "Supalai",
    "developerSite": "https://www.supalai.com/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#9A3412",
    "height": 135,
    "floors": 37,
    "units": 706,
    "unitsPerFloor": 12,
    "parking": 920,
    "parkingRatio": "130%",
    "landRai": 11.1,
    "facilitiesM2": "Riverfront Promenade & Lagoon Pool",
    "priceRange": "฿5.2M – ฿35M",
    "district": "ยานนาวา",
    "location": "ถ.พระราม 3 ติดแม่น้ำเจ้าพระยา",
    "lat": 13.6785,
    "lon": 100.5342,
    "desc": "รีสอร์ตคอนโดมิเนียมริมโค้งน้ำเจ้าพระยาบนถนนพระราม 3 ที่จอดรถมากถึง 130% พร้อมสระว่ายน้ำเชื่อมต่อวิวแม่น้ำกว้างใหญ่",
    "footprint": [
      [
        100.53372,
        13.678154
      ],
      [
        100.53468,
        13.678154
      ],
      [
        100.53468,
        13.678846
      ],
      [
        100.53372,
        13.678846
      ],
      [
        100.53372,
        13.678154
      ]
    ],
    "parts": [
      {
        "name": "Supalai Riva Grande Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.53372,
            13.678154
          ],
          [
            100.53468,
            13.678154
          ],
          [
            100.53468,
            13.678846
          ],
          [
            100.53372,
            13.678846
          ],
          [
            100.53372,
            13.678154
          ]
        ]
      },
      {
        "name": "Supalai Riva Grande Residential Tower",
        "color": "#9A3412",
        "height": 119,
        "min_height": 22,
        "footprint": [
          [
            100.53386,
            13.678255
          ],
          [
            100.53454,
            13.678255
          ],
          [
            100.53454,
            13.678745
          ],
          [
            100.53386,
            13.678745
          ],
          [
            100.53386,
            13.678255
          ]
        ]
      },
      {
        "name": "Supalai Riva Grande Sky Facilities & Crown",
        "color": "#06B6D4",
        "height": 135,
        "min_height": 119,
        "footprint": [
          [
            100.53398,
            13.678342
          ],
          [
            100.53442,
            13.678342
          ],
          [
            100.53442,
            13.678658
          ],
          [
            100.53398,
            13.678658
          ],
          [
            100.53398,
            13.678342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "53.50 – 62.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "75.00 – 140.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "148.00 – 283.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BRT วัดด่าน (B7)",
        "dist": "450 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Rama 3",
        "kind": "Shopping",
        "color": "#D97706",
        "lat": 13.6965,
        "lon": 100.5385,
        "dist": "2.5 km"
      }
    ]
  },
  {
    "id": "supalai-veranda-rama9",
    "name": "Supalai Veranda Rama 9",
    "brandId": "supalai",
    "brandName": "Supalai",
    "category": "รีสอร์ตคอนโดมิเนียมพระราม 9",
    "categoryColor": "#EA580C",
    "developer": "Supalai",
    "developerSite": "https://www.supalai.com/",
    "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 115,
    "floors": 31,
    "units": 1410,
    "unitsPerFloor": 38,
    "parking": 990,
    "parkingRatio": "70%",
    "landRai": 12.3,
    "facilitiesM2": "4-Rai Park & Salt-water Pool",
    "priceRange": "฿2.8M – ฿9.8M",
    "district": "ห้วยขวาง",
    "location": "ถ.พระราม 9 ใกล้ MRT สายสีส้ม รฟม.",
    "lat": 13.7542,
    "lon": 100.5785,
    "desc": "คอนโดมิเนียมสไตล์รีสอร์ตบนถนนพระราม 9 ใกล้ MRT สายสีส้ม พื้นที่สีเขียวกว่า 4 ไร่ และสระว่ายน้ำระบบเกลือขนาดใหญ่",
    "footprint": [
      [
        100.57802,
        13.753854
      ],
      [
        100.57898,
        13.753854
      ],
      [
        100.57898,
        13.754546
      ],
      [
        100.57802,
        13.754546
      ],
      [
        100.57802,
        13.753854
      ]
    ],
    "parts": [
      {
        "name": "Supalai Veranda Rama 9 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.57802,
            13.753854
          ],
          [
            100.57898,
            13.753854
          ],
          [
            100.57898,
            13.754546
          ],
          [
            100.57802,
            13.754546
          ],
          [
            100.57802,
            13.753854
          ]
        ]
      },
      {
        "name": "Supalai Veranda Rama 9 Residential Tower",
        "color": "#C2410C",
        "height": 101,
        "min_height": 18,
        "footprint": [
          [
            100.57816,
            13.753955
          ],
          [
            100.57884,
            13.753955
          ],
          [
            100.57884,
            13.754445
          ],
          [
            100.57816,
            13.754445
          ],
          [
            100.57816,
            13.753955
          ]
        ]
      },
      {
        "name": "Supalai Veranda Rama 9 Sky Facilities & Crown",
        "color": "#10B981",
        "height": 115,
        "min_height": 101,
        "footprint": [
          [
            100.57828,
            13.754042
          ],
          [
            100.57872,
            13.754042
          ],
          [
            100.57872,
            13.754358
          ],
          [
            100.57828,
            13.754358
          ],
          [
            100.57828,
            13.754042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "30.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "37.50 – 41.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "57.50 – 65.50 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT สายสีส้ม สถานี รฟม.",
        "dist": "350 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "RCA (Royal City Avenue)",
        "kind": "Entertainment",
        "color": "#EC4899",
        "lat": 13.751,
        "lon": 100.5775,
        "dist": "400 m"
      }
    ]
  },
  {
    "id": "supalai-park-talat-phlu",
    "name": "Supalai Park Talat Phlu",
    "brandId": "supalai",
    "brandName": "Supalai",
    "category": "คอนโดมิเนียมไฮไรส์ฝั่งธนบุรี",
    "categoryColor": "#EA580C",
    "developer": "Supalai",
    "developerSite": "https://www.supalai.com/",
    "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 125,
    "floors": 34,
    "units": 785,
    "unitsPerFloor": 26,
    "parking": 360,
    "parkingRatio": "46%",
    "landRai": 4.1,
    "facilitiesM2": "Thonburi Skyline Infinity Pool",
    "priceRange": "฿2.5M – ฿7.8M",
    "district": "ธนบุรี",
    "location": "ถ.ราชพฤกษ์ ใกล้ BTS ตลาดพลู",
    "lat": 13.7145,
    "lon": 100.4772,
    "desc": "คอนโดมิเนียมไฮไรส์ใกล้ BTS ตลาดพลูและเดอะมอลล์ท่าพระ สระว่ายน้ำอินฟินิตี้วิวเมืองฝั่งธนบุรี",
    "footprint": [
      [
        100.47678,
        13.714198
      ],
      [
        100.47762,
        13.714198
      ],
      [
        100.47762,
        13.714802
      ],
      [
        100.47678,
        13.714802
      ],
      [
        100.47678,
        13.714198
      ]
    ],
    "parts": [
      {
        "name": "Supalai Park Talat Phlu Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 20,
        "min_height": 0,
        "footprint": [
          [
            100.47672,
            13.714154
          ],
          [
            100.47768,
            13.714154
          ],
          [
            100.47768,
            13.714846
          ],
          [
            100.47672,
            13.714846
          ],
          [
            100.47672,
            13.714154
          ]
        ]
      },
      {
        "name": "Supalai Park Talat Phlu Residential Tower",
        "color": "#C2410C",
        "height": 110,
        "min_height": 20,
        "footprint": [
          [
            100.47686,
            13.714255
          ],
          [
            100.47754,
            13.714255
          ],
          [
            100.47754,
            13.714745
          ],
          [
            100.47686,
            13.714745
          ],
          [
            100.47686,
            13.714255
          ]
        ]
      },
      {
        "name": "Supalai Park Talat Phlu Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 125,
        "min_height": 110,
        "footprint": [
          [
            100.47698,
            13.714342
          ],
          [
            100.47742,
            13.714342
          ],
          [
            100.47742,
            13.714658
          ],
          [
            100.47698,
            13.714658
          ],
          [
            100.47698,
            13.714342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "27.50 – 30.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "35.00 – 45.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "60.50 – 72.50 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ตลาดพลู (S10)",
        "dist": "250 m",
        "type": "bts"
      },
      {
        "name": "BRT ราชพฤกษ์ (B1)",
        "dist": "350 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "The Mall Lifestore Thapra",
        "kind": "Mall",
        "color": "#EC4899",
        "lat": 13.713,
        "lon": 100.4785,
        "dist": "200 m"
      }
    ]
  },
  {
    "id": "supalai-wellington",
    "name": "Supalai Wellington",
    "brandId": "supalai",
    "brandName": "Supalai",
    "category": "คอนโดมิเนียมสไตล์อังกฤษโมเดิร์น",
    "categoryColor": "#EA580C",
    "developer": "Supalai",
    "developerSite": "https://www.supalai.com/",
    "image": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#9A3412",
    "height": 75,
    "floors": 19,
    "units": 1002,
    "unitsPerFloor": 16,
    "parking": 840,
    "parkingRatio": "84%",
    "landRai": 17,
    "facilitiesM2": "50m Ozone Lap Pool & English Garden",
    "priceRange": "฿3.5M – ฿13M",
    "district": "ห้วยขวาง",
    "location": "ถ.เทียมร่วมมิตร ใกล้ MRT ศูนย์วัฒนธรรมฯ",
    "lat": 13.7712,
    "lon": 100.5752,
    "desc": "คอนโดมิเนียมสถาปัตยกรรมสไตล์อังกฤษโมเดิร์นบนถนนเทียมร่วมมิตร สระว่ายน้ำระบบโอโซน และที่จอดรถมากกว่า 84%",
    "footprint": [
      [
        100.57472,
        13.770854
      ],
      [
        100.57568,
        13.770854
      ],
      [
        100.57568,
        13.771546
      ],
      [
        100.57472,
        13.771546
      ],
      [
        100.57472,
        13.770854
      ]
    ],
    "parts": [
      {
        "name": "Supalai Wellington Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.57472,
            13.770854
          ],
          [
            100.57568,
            13.770854
          ],
          [
            100.57568,
            13.771546
          ],
          [
            100.57472,
            13.771546
          ],
          [
            100.57472,
            13.770854
          ]
        ]
      },
      {
        "name": "Supalai Wellington Residential Tower",
        "color": "#9A3412",
        "height": 66,
        "min_height": 16,
        "footprint": [
          [
            100.57486,
            13.770955
          ],
          [
            100.57554,
            13.770955
          ],
          [
            100.57554,
            13.771445
          ],
          [
            100.57486,
            13.771445
          ],
          [
            100.57486,
            13.770955
          ]
        ]
      },
      {
        "name": "Supalai Wellington Sky Facilities & Crown",
        "color": "#10B981",
        "height": 75,
        "min_height": 66,
        "footprint": [
          [
            100.57498,
            13.771042
          ],
          [
            100.57542,
            13.771042
          ],
          [
            100.57542,
            13.771358
          ],
          [
            100.57498,
            13.771358
          ],
          [
            100.57498,
            13.771042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "47.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "76.00 – 87.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "125.00 – 250.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT ศูนย์วัฒนธรรมฯ (BL19)",
        "dist": "1.0 km",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Big C Extra Ratchada",
        "kind": "Supermarket",
        "color": "#EF4444",
        "lat": 13.7685,
        "lon": 100.571,
        "dist": "750 m"
      }
    ]
  },
  {
    "id": "magnolias-waterfront",
    "name": "Magnolias Waterfront Residences",
    "brandId": "mqdc",
    "brandName": "MQDC",
    "category": "คอนโดมิเนียมสูงที่สุดในไทย (318 ม.)",
    "categoryColor": "#059669",
    "developer": "MQDC (Magnolia Quality)",
    "developerSite": "https://mqdc.com/",
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#059669",
    "color": "#065F46",
    "height": 318,
    "floors": 70,
    "units": 379,
    "unitsPerFloor": 6,
    "parking": 840,
    "parkingRatio": "220%",
    "landRai": 7.2,
    "facilitiesM2": "Chao Phraya Riverfront Club & Sky Infinity Edge Pool",
    "priceRange": "฿25M – ฿150M",
    "district": "คลองสาน",
    "location": "ICONSIAM ริมแม่น้ำเจ้าพระยา",
    "lat": 13.7282,
    "lon": 100.5098,
    "desc": "ตึกที่สูงที่สุดในประเทศไทย (318 ม.) 70 ชั้นริมแม่น้ำเจ้าพระยา ตั้งอยู่ในอภิมหาโครงการ ICONSIAM วิวพาโนรามาแม่น้ำสายหลักของกรุงเทพฯ",
    "footprint": [
      [
        100.50935,
        13.727876
      ],
      [
        100.51025,
        13.727876
      ],
      [
        100.51025,
        13.728524
      ],
      [
        100.50935,
        13.728524
      ],
      [
        100.50935,
        13.727876
      ]
    ],
    "parts": [
      {
        "name": "Magnolias Waterfront Residences Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.50932,
            13.727854
          ],
          [
            100.51028,
            13.727854
          ],
          [
            100.51028,
            13.728546
          ],
          [
            100.50932,
            13.728546
          ],
          [
            100.50932,
            13.727854
          ]
        ]
      },
      {
        "name": "Magnolias Waterfront Residences Residential Tower",
        "color": "#065F46",
        "height": 280,
        "min_height": 26,
        "footprint": [
          [
            100.50946,
            13.727955
          ],
          [
            100.51014,
            13.727955
          ],
          [
            100.51014,
            13.728445
          ],
          [
            100.50946,
            13.728445
          ],
          [
            100.50946,
            13.727955
          ]
        ]
      },
      {
        "name": "Magnolias Waterfront Residences Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 318,
        "min_height": 280,
        "footprint": [
          [
            100.50958,
            13.728042
          ],
          [
            100.51002,
            13.728042
          ],
          [
            100.51002,
            13.728358
          ],
          [
            100.50958,
            13.728358
          ],
          [
            100.50958,
            13.728042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "60.00 – 79.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "95.00 – 126.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "144.00 – 346.00 m²"
      }
    ],
    "transport": [
      {
        "name": "สายสีทอง สถานีเจริญนคร (G2)",
        "dist": "50 m",
        "type": "bts"
      },
      {
        "name": "ท่าเรือไอคอนสยาม",
        "dist": "100 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ICONSIAM",
        "kind": "Global Destination",
        "color": "#F59E0B",
        "lat": 13.7265,
        "lon": 100.5105,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "the-residences-mandarin-oriental",
    "name": "The Residences at Mandarin Oriental",
    "brandId": "mqdc",
    "brandName": "MQDC",
    "category": "เรสซิเดนซ์ระดับอัลตราลักชัวรี",
    "categoryColor": "#059669",
    "developer": "MQDC & Mandarin Oriental",
    "developerSite": "https://mqdc.com/",
    "image": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#059669",
    "color": "#047857",
    "height": 269,
    "floors": 52,
    "units": 146,
    "unitsPerFloor": 4,
    "parking": 360,
    "parkingRatio": "246%",
    "landRai": 4.9,
    "facilitiesM2": "Mandarin Oriental Legendary Hotel Services",
    "priceRange": "฿55M – ฿390M",
    "district": "คลองสาน",
    "location": "ICONSIAM ริมแม่น้ำเจ้าพระยา",
    "lat": 13.725,
    "lon": 100.5115,
    "desc": "เรสซิเดนซ์ระดับอัลตราลักชัวรีแบรนด์ Mandarin Oriental แห่งแรกในเอเชียตะวันออกเฉียงใต้ บริการมาตรฐานโรงแรมระดับโลก ริมแม่น้ำเจ้าพระยา",
    "footprint": [
      [
        100.51105,
        13.724676
      ],
      [
        100.51195,
        13.724676
      ],
      [
        100.51195,
        13.725324
      ],
      [
        100.51105,
        13.725324
      ],
      [
        100.51105,
        13.724676
      ]
    ],
    "parts": [
      {
        "name": "The Residences at Mandarin Oriental Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.51102,
            13.724654
          ],
          [
            100.51198,
            13.724654
          ],
          [
            100.51198,
            13.725346
          ],
          [
            100.51102,
            13.725346
          ],
          [
            100.51102,
            13.724654
          ]
        ]
      },
      {
        "name": "The Residences at Mandarin Oriental Residential Tower",
        "color": "#047857",
        "height": 237,
        "min_height": 26,
        "footprint": [
          [
            100.51116,
            13.724755
          ],
          [
            100.51184,
            13.724755
          ],
          [
            100.51184,
            13.725245
          ],
          [
            100.51116,
            13.725245
          ],
          [
            100.51116,
            13.724755
          ]
        ]
      },
      {
        "name": "The Residences at Mandarin Oriental Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 269,
        "min_height": 237,
        "footprint": [
          [
            100.51128,
            13.724842
          ],
          [
            100.51172,
            13.724842
          ],
          [
            100.51172,
            13.725158
          ],
          [
            100.51128,
            13.725158
          ],
          [
            100.51128,
            13.724842
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "2 Bedrooms",
        "size": "127.00 – 165.00 m²"
      },
      {
        "label": "3 Bedrooms",
        "size": "222.00 – 228.00 m²"
      },
      {
        "label": "Penthouse & Duplex",
        "size": "386.00 – 707.00 m²"
      }
    ],
    "transport": [
      {
        "name": "สายสีทอง สถานีเจริญนคร (G2)",
        "dist": "80 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ICONSIAM",
        "kind": "Global Destination",
        "color": "#F59E0B",
        "lat": 13.7265,
        "lon": 100.5105,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "whizdom-101-essence",
    "name": "Whizdom Essence Sukhumvit",
    "brandId": "mqdc",
    "brandName": "MQDC",
    "category": "คอนโดมิเนียมไฮบริดสมาร์ตซิตี้",
    "categoryColor": "#059669",
    "developer": "MQDC",
    "developerSite": "https://mqdc.com/",
    "image": "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#059669",
    "color": "#065F46",
    "height": 175,
    "floors": 50,
    "units": 664,
    "unitsPerFloor": 16,
    "parking": 380,
    "parkingRatio": "57%",
    "landRai": 4.1,
    "facilitiesM2": "Olympic Sky Pool & Forest Garden",
    "priceRange": "฿4.8M – ฿18M",
    "district": "พระโขนง",
    "location": "สุขุมวิท 101/1 ติด BTS ปุณณวิถี",
    "lat": 13.6865,
    "lon": 100.6112,
    "desc": "คอนโดระดับพรีเมียมในโครงการ True Digital Park เชื่อมต่อ Skywalk BTS ปุณณวิถี รายล้อมด้วยสวนสาธารณะลอยฟ้าและสิ่งอำนวยความสะดวกครบวงจร",
    "footprint": [
      [
        100.61075,
        13.686176
      ],
      [
        100.61165,
        13.686176
      ],
      [
        100.61165,
        13.686824
      ],
      [
        100.61075,
        13.686824
      ],
      [
        100.61075,
        13.686176
      ]
    ],
    "parts": [
      {
        "name": "Whizdom Essence Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.61072,
            13.686154
          ],
          [
            100.61168,
            13.686154
          ],
          [
            100.61168,
            13.686846
          ],
          [
            100.61072,
            13.686846
          ],
          [
            100.61072,
            13.686154
          ]
        ]
      },
      {
        "name": "Whizdom Essence Residential Tower",
        "color": "#065F46",
        "height": 154,
        "min_height": 26,
        "footprint": [
          [
            100.61086,
            13.686255
          ],
          [
            100.61154,
            13.686255
          ],
          [
            100.61154,
            13.686745
          ],
          [
            100.61086,
            13.686745
          ],
          [
            100.61086,
            13.686255
          ]
        ]
      },
      {
        "name": "Whizdom Essence Sky Facilities & Crown",
        "color": "#10B981",
        "height": 175,
        "min_height": 154,
        "footprint": [
          [
            100.61098,
            13.686342
          ],
          [
            100.61142,
            13.686342
          ],
          [
            100.61142,
            13.686658
          ],
          [
            100.61098,
            13.686658
          ],
          [
            100.61098,
            13.686342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "33.70 – 44.90 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "51.90 – 83.80 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ปุณณวิถี (E11)",
        "dist": "250 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "True Digital Park",
        "kind": "Tech & Lifestyle",
        "color": "#3B82F6",
        "lat": 13.686,
        "lon": 100.6105,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "whizdom-craftz-samyan",
    "name": "Whizdom Craftz Samyan",
    "brandId": "mqdc",
    "brandName": "MQDC",
    "category": "คอนโดมิเนียมไฮไรส์ดีไซน์ยั่งยืน",
    "categoryColor": "#059669",
    "developer": "MQDC",
    "developerSite": "https://mqdc.com/",
    "image": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#059669",
    "color": "#047857",
    "height": 185,
    "floors": 55,
    "units": 418,
    "unitsPerFloor": 10,
    "parking": 340,
    "parkingRatio": "81%",
    "landRai": 2.1,
    "facilitiesM2": "Vertical Green Forest & Sky Hydrotherapy",
    "priceRange": "฿5.8M – ฿22M",
    "district": "บางรัก",
    "location": "ถ.พระราม 4 ใกล้ MRT สามย่าน",
    "lat": 13.7332,
    "lon": 100.5255,
    "desc": "คอนโดมิเนียมไฮไรส์สูง 55 ชั้นบนถนนพระราม 4 ใกล้ MRT สามย่าน โดดเด่นด้วย Smart Home System และพื้นที่สีเขียวแนวตั้ง",
    "footprint": [
      [
        100.52505,
        13.732876
      ],
      [
        100.52595,
        13.732876
      ],
      [
        100.52595,
        13.733524
      ],
      [
        100.52505,
        13.733524
      ],
      [
        100.52505,
        13.732876
      ]
    ],
    "parts": [
      {
        "name": "Whizdom Craftz Samyan Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.52502,
            13.732854
          ],
          [
            100.52598,
            13.732854
          ],
          [
            100.52598,
            13.733546
          ],
          [
            100.52502,
            13.733546
          ],
          [
            100.52502,
            13.732854
          ]
        ]
      },
      {
        "name": "Whizdom Craftz Samyan Residential Tower",
        "color": "#047857",
        "height": 163,
        "min_height": 26,
        "footprint": [
          [
            100.52516,
            13.732955
          ],
          [
            100.52584,
            13.732955
          ],
          [
            100.52584,
            13.733445
          ],
          [
            100.52516,
            13.733445
          ],
          [
            100.52516,
            13.732955
          ]
        ]
      },
      {
        "name": "Whizdom Craftz Samyan Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 185,
        "min_height": 163,
        "footprint": [
          [
            100.52528,
            13.733042
          ],
          [
            100.52572,
            13.733042
          ],
          [
            100.52572,
            13.733358
          ],
          [
            100.52528,
            13.733358
          ],
          [
            100.52528,
            13.733042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "30.00 – 38.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "54.00 – 67.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT สามย่าน (BL27)",
        "dist": "450 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Samyan Mitrtown",
        "kind": "Mall",
        "color": "#059669",
        "lat": 13.7335,
        "lon": 100.5285,
        "dist": "300 m"
      }
    ]
  },
  {
    "id": "mulberry-grove-sukhumvit",
    "name": "Mulberry Grove Sukhumvit",
    "brandId": "mqdc",
    "brandName": "MQDC",
    "category": "คอนโดมิเนียมซูเปอร์ลักชัวรีเพื่อครอบครัว",
    "categoryColor": "#059669",
    "developer": "MQDC",
    "developerSite": "https://mqdc.com/",
    "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#059669",
    "color": "#065F46",
    "height": 140,
    "floors": 37,
    "units": 287,
    "unitsPerFloor": 10,
    "parking": 287,
    "parkingRatio": "100%",
    "landRai": 2.2,
    "facilitiesM2": "Intergenerational Sky Facilities & Concierge",
    "priceRange": "฿12M – ฿65M",
    "district": "คลองเตย",
    "location": "ถ.สุขุมวิท ใกล้ BTS เอกมัย",
    "lat": 13.7188,
    "lon": 100.5855,
    "desc": "คอนโดมิเนียมระดับซูเปอร์ลักชัวรีสำหรับครอบครัวทุกเจเนอเรชัน ห่าง BTS เอกมัยเพียง 250 ม. พร้อมผู้ช่วยดูแลส่วนตัวและพื้นที่ส่วนกลางขนาดใหญ่",
    "footprint": [
      [
        100.58508,
        13.718498
      ],
      [
        100.58592,
        13.718498
      ],
      [
        100.58592,
        13.719102
      ],
      [
        100.58508,
        13.719102
      ],
      [
        100.58508,
        13.718498
      ]
    ],
    "parts": [
      {
        "name": "Mulberry Grove Sukhumvit Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.58502,
            13.718454
          ],
          [
            100.58598,
            13.718454
          ],
          [
            100.58598,
            13.719146
          ],
          [
            100.58502,
            13.719146
          ],
          [
            100.58502,
            13.718454
          ]
        ]
      },
      {
        "name": "Mulberry Grove Sukhumvit Residential Tower",
        "color": "#065F46",
        "height": 123,
        "min_height": 22,
        "footprint": [
          [
            100.58516,
            13.718555
          ],
          [
            100.58584,
            13.718555
          ],
          [
            100.58584,
            13.719045
          ],
          [
            100.58516,
            13.719045
          ],
          [
            100.58516,
            13.718555
          ]
        ]
      },
      {
        "name": "Mulberry Grove Sukhumvit Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 140,
        "min_height": 123,
        "footprint": [
          [
            100.58528,
            13.718642
          ],
          [
            100.58572,
            13.718642
          ],
          [
            100.58572,
            13.718958
          ],
          [
            100.58528,
            13.718958
          ],
          [
            100.58528,
            13.718642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "47.00 – 56.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "87.00 – 114.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "162.00 – 241.50 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS เอกมัย (E7)",
        "dist": "250 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Gateway Ekamai",
        "kind": "Shopping Mall",
        "color": "#F59E0B",
        "lat": 13.7195,
        "lon": 100.585,
        "dist": "200 m"
      }
    ]
  },
  {
    "id": "the-embassy-wireless",
    "name": "The Embassy Wireless",
    "brandId": "cpn",
    "brandName": "CPN / Central",
    "category": "อัครโครงการที่อยู่อาศัยเวิลด์คลาส",
    "categoryColor": "#D97706",
    "developer": "Central Pattana & Hongkong Land",
    "developerSite": "https://www.centralpattana.co.th/",
    "image": "https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#D97706",
    "color": "#B45309",
    "height": 175,
    "floors": 42,
    "units": 198,
    "unitsPerFloor": 6,
    "parking": 300,
    "parkingRatio": "150%",
    "landRai": 3.1,
    "facilitiesM2": "Ultra-prime Diplomatic Sky Garden",
    "priceRange": "฿38M – ฿180M",
    "district": "ปทุมวัน",
    "location": "ถ.วิทยุ ใกล้ BTS เพลินจิต",
    "lat": 13.7435,
    "lon": 100.5475,
    "desc": "อัครโครงการที่อยู่อาศัยระดับเวิลด์คลาสบนถนนวิทยุ ร่วมทุนระหว่าง CPN และ Hongkong Land ทำเลไข่แดงเพลินจิต",
    "footprint": [
      [
        100.54705,
        13.743176
      ],
      [
        100.54795,
        13.743176
      ],
      [
        100.54795,
        13.743824
      ],
      [
        100.54705,
        13.743824
      ],
      [
        100.54705,
        13.743176
      ]
    ],
    "parts": [
      {
        "name": "The Embassy Wireless Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.54702,
            13.743154
          ],
          [
            100.54798,
            13.743154
          ],
          [
            100.54798,
            13.743846
          ],
          [
            100.54702,
            13.743846
          ],
          [
            100.54702,
            13.743154
          ]
        ]
      },
      {
        "name": "The Embassy Wireless Residential Tower",
        "color": "#B45309",
        "height": 154,
        "min_height": 26,
        "footprint": [
          [
            100.54716,
            13.743255
          ],
          [
            100.54784,
            13.743255
          ],
          [
            100.54784,
            13.743745
          ],
          [
            100.54716,
            13.743745
          ],
          [
            100.54716,
            13.743255
          ]
        ]
      },
      {
        "name": "The Embassy Wireless Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 175,
        "min_height": 154,
        "footprint": [
          [
            100.54728,
            13.743342
          ],
          [
            100.54772,
            13.743342
          ],
          [
            100.54772,
            13.743658
          ],
          [
            100.54728,
            13.743658
          ],
          [
            100.54728,
            13.743342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "2 Bedrooms",
        "size": "110.00 – 145.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "190.00 – 380.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS เพลินจิต (E2)",
        "dist": "250 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Embassy",
        "kind": "Luxury Mall",
        "color": "#D97706",
        "lat": 13.7445,
        "lon": 100.5465,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "g-tower-rama9",
    "name": "G Tower Grand Rama 9",
    "brandId": "cpn",
    "brandName": "CPN / Central",
    "category": "ไอคอนิกออฟฟิศมิกซ์ยูสระดับพรีเมียม",
    "categoryColor": "#D97706",
    "developer": "GLand (CPN)",
    "developerSite": "https://www.centralpattana.co.th/",
    "image": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#D97706",
    "color": "#B45309",
    "height": 155,
    "floors": 39,
    "units": 0,
    "parking": 1200,
    "parkingRatio": "Commercial",
    "landRai": 5,
    "facilitiesM2": "Grade A+ Office & Underground Mall Connect",
    "priceRange": "Grade A+ Office Asset",
    "district": "ห้วยขวาง",
    "location": "ถ.พระราม 9 ติด MRT พระราม 9",
    "lat": 13.7575,
    "lon": 100.5665,
    "desc": "ตึกออฟฟิศเกรด A+ ดีไซน์ตัวอักษร G อันเป็นแลนด์มาร์กของ New CBD พระราม 9 เชื่อมต่อ MRT พระราม 9 และเซ็นทรัลพระราม 9 ใต้ดิน",
    "footprint": [
      [
        100.56602,
        13.757154
      ],
      [
        100.56698,
        13.757154
      ],
      [
        100.56698,
        13.757846
      ],
      [
        100.56602,
        13.757846
      ],
      [
        100.56602,
        13.757154
      ]
    ],
    "parts": [
      {
        "name": "G Tower Rama 9 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [
            100.56602,
            13.757154
          ],
          [
            100.56698,
            13.757154
          ],
          [
            100.56698,
            13.757846
          ],
          [
            100.56602,
            13.757846
          ],
          [
            100.56602,
            13.757154
          ]
        ]
      },
      {
        "name": "G Tower Rama 9 Residential Tower",
        "color": "#B45309",
        "height": 136,
        "min_height": 25,
        "footprint": [
          [
            100.56616,
            13.757255
          ],
          [
            100.56684,
            13.757255
          ],
          [
            100.56684,
            13.757745
          ],
          [
            100.56616,
            13.757745
          ],
          [
            100.56616,
            13.757255
          ]
        ]
      },
      {
        "name": "G Tower Rama 9 Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 155,
        "min_height": 136,
        "footprint": [
          [
            100.56628,
            13.757342
          ],
          [
            100.56672,
            13.757342
          ],
          [
            100.56672,
            13.757658
          ],
          [
            100.56628,
            13.757658
          ],
          [
            100.56628,
            13.757342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Commercial Office Floor",
        "size": "1,200 – 2,000 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT พระราม 9 (BL20)",
        "dist": "50 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Rama 9",
        "kind": "Shopping Mall",
        "color": "#D97706",
        "lat": 13.758,
        "lon": 100.566,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "centralworld-offices",
    "name": "The Offices at CentralWorld & Centara",
    "brandId": "cpn",
    "brandName": "CPN / Central",
    "category": "มิกซ์ยูสระดับตำนานใจกลางราชประสงค์",
    "categoryColor": "#D97706",
    "developer": "Central Pattana (CPN)",
    "developerSite": "https://www.centralpattana.co.th/",
    "image": "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#D97706",
    "color": "#B45309",
    "height": 235,
    "floors": 57,
    "units": 0,
    "parking": 3000,
    "parkingRatio": "Commercial",
    "landRai": 15,
    "facilitiesM2": "Convention Centre, Hotel & Office Complex",
    "priceRange": "Flagship Mixed-Use",
    "district": "ปทุมวัน",
    "location": "แยกราชประสงค์ / พระราม 1",
    "lat": 13.7468,
    "lon": 100.5385,
    "desc": "มิกซ์ยูสระดับตำนานใจกลางราชประสงค์ ประกอบด้วยอาคารสำนักงาน The Offices at CentralWorld และโรงแรมเซ็นทารา แกรนด์ พร้อมจุดเชื่อมต่อ Skywalk ราชประสงค์",
    "footprint": [
      [
        100.53795,
        13.746404
      ],
      [
        100.53905,
        13.746404
      ],
      [
        100.53905,
        13.747196
      ],
      [
        100.53795,
        13.747196
      ],
      [
        100.53795,
        13.746404
      ]
    ],
    "parts": [
      {
        "name": "CentralWorld Offices Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.53802,
            13.746454
          ],
          [
            100.53898,
            13.746454
          ],
          [
            100.53898,
            13.747146
          ],
          [
            100.53802,
            13.747146
          ],
          [
            100.53802,
            13.746454
          ]
        ]
      },
      {
        "name": "CentralWorld Offices Residential Tower",
        "color": "#B45309",
        "height": 207,
        "min_height": 26,
        "footprint": [
          [
            100.53816,
            13.746555
          ],
          [
            100.53884,
            13.746555
          ],
          [
            100.53884,
            13.747045
          ],
          [
            100.53816,
            13.747045
          ],
          [
            100.53816,
            13.746555
          ]
        ]
      },
      {
        "name": "CentralWorld Offices Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 235,
        "min_height": 207,
        "footprint": [
          [
            100.53828,
            13.746642
          ],
          [
            100.53872,
            13.746642
          ],
          [
            100.53872,
            13.746958
          ],
          [
            100.53828,
            13.746958
          ],
          [
            100.53828,
            13.746642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Office Floor",
        "size": "1,500 – 2,500 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS สยาม (CEN)",
        "dist": "450 m",
        "type": "bts"
      },
      {
        "name": "BTS ชิดลม (E1)",
        "dist": "400 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "CentralWorld",
        "kind": "Mega Mall",
        "color": "#D97706",
        "lat": 13.7465,
        "lon": 100.5395,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "four-seasons-private-residences",
    "name": "Four Seasons Private Residences",
    "brandId": "country",
    "brandName": "Country Group",
    "category": "คอนโดมิเนียมซูเปอร์ลักชัวรีริมแม่น้ำ",
    "categoryColor": "#64748B",
    "developer": "Country Group Development",
    "developerSite": "https://www.chaophrayaestate.com/",
    "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E293B",
    "color": "#0F172A",
    "height": 305,
    "floors": 73,
    "units": 356,
    "unitsPerFloor": 6,
    "parking": 712,
    "parkingRatio": "200%",
    "landRai": 14.2,
    "facilitiesM2": "Four Seasons Club & 66th Fl Infinity Pool",
    "priceRange": "฿35M – ฿420M",
    "district": "สาทร",
    "location": "เจริญกรุง 64 ริมแม่น้ำเจ้าพระยา",
    "lat": 13.7138,
    "lon": 100.5118,
    "desc": "เรสซิเดนซ์ริมแม่น้ำระดับเวิลด์คลาสสูง 73 ชั้น (305 ม.) การันตีด้วยบริการระดับโรงแรม Four Seasons และวิวคุ้งน้ำเจ้าพระยาแบบพาโนรามาทุกยูนิต",
    "footprint": [
      [
        100.5113,
        13.71344
      ],
      [
        100.5123,
        13.71344
      ],
      [
        100.5123,
        13.71416
      ],
      [
        100.5113,
        13.71416
      ],
      [
        100.5113,
        13.71344
      ]
    ],
    "parts": [
      {
        "name": "Four Seasons Residences Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.51132,
            13.713454
          ],
          [
            100.51228,
            13.713454
          ],
          [
            100.51228,
            13.714146
          ],
          [
            100.51132,
            13.714146
          ],
          [
            100.51132,
            13.713454
          ]
        ]
      },
      {
        "name": "Four Seasons Residences Residential Tower",
        "color": "#0F172A",
        "height": 268,
        "min_height": 26,
        "footprint": [
          [
            100.51146,
            13.713555
          ],
          [
            100.51214,
            13.713555
          ],
          [
            100.51214,
            13.714045
          ],
          [
            100.51146,
            13.714045
          ],
          [
            100.51146,
            13.713555
          ]
        ]
      },
      {
        "name": "Four Seasons Residences Sky Facilities & Crown",
        "color": "#EAB308",
        "height": 305,
        "min_height": 268,
        "footprint": [
          [
            100.51158,
            13.713642
          ],
          [
            100.51202,
            13.713642
          ],
          [
            100.51202,
            13.713958
          ],
          [
            100.51158,
            13.713958
          ],
          [
            100.51158,
            13.713642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "115.00 – 140.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "128.00 – 140.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "205.00 – 1,050.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS สะพานตากสิน (S6)",
        "dist": "1.0 km",
        "type": "bts"
      },
      {
        "name": "Private Hotel Boat Pier",
        "dist": "50 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Capella Bangkok",
        "kind": "Luxury Hotel",
        "color": "#F59E0B",
        "lat": 13.7125,
        "lon": 100.512,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "banyan-tree-residences",
    "name": "Banyan Tree Residences Riverside",
    "brandId": "nirvana",
    "brandName": "Nirvana Daii",
    "category": "คอนโดมิเนียมอัลตราลักชัวรีริมแม่น้ำ",
    "categoryColor": "#059669",
    "developer": "Nirvana Daii",
    "developerSite": "https://www.nirvanadaii.com/",
    "image": "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#065F46",
    "color": "#064E3B",
    "height": 155,
    "floors": 45,
    "units": 133,
    "unitsPerFloor": 4,
    "parking": 260,
    "parkingRatio": "195%",
    "landRai": 5.1,
    "facilitiesM2": "Banyan Tree Spa Sanctuary & Riverfront Pier",
    "priceRange": "฿28M – ฿160M",
    "district": "คลองสาน",
    "location": "สมเด็จเจ้าพระยา 17 ริมแม่น้ำเจ้าพระยา",
    "lat": 13.735,
    "lon": 100.508,
    "desc": "คอนโดมิเนียมซูเปอร์ลักชัวรีริมแม่น้ำเจ้าพระยาเพียง 16 ม. จากขอบน้ำ มอบความเป็นส่วนตัวพร้อมบริการสไตล์ Banyan Tree Sanctuary",
    "footprint": [
      [
        100.50755,
        13.734676
      ],
      [
        100.50845,
        13.734676
      ],
      [
        100.50845,
        13.735324
      ],
      [
        100.50755,
        13.735324
      ],
      [
        100.50755,
        13.734676
      ]
    ],
    "parts": [
      {
        "name": "Banyan Tree Residences Riverside Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [
            100.50752,
            13.734654
          ],
          [
            100.50848,
            13.734654
          ],
          [
            100.50848,
            13.735346
          ],
          [
            100.50752,
            13.735346
          ],
          [
            100.50752,
            13.734654
          ]
        ]
      },
      {
        "name": "Banyan Tree Residences Riverside Residential Tower",
        "color": "#064E3B",
        "height": 136,
        "min_height": 25,
        "footprint": [
          [
            100.50766,
            13.734755
          ],
          [
            100.50834,
            13.734755
          ],
          [
            100.50834,
            13.735245
          ],
          [
            100.50766,
            13.735245
          ],
          [
            100.50766,
            13.734755
          ]
        ]
      },
      {
        "name": "Banyan Tree Residences Riverside Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 155,
        "min_height": 136,
        "footprint": [
          [
            100.50778,
            13.734842
          ],
          [
            100.50822,
            13.734842
          ],
          [
            100.50822,
            13.735158
          ],
          [
            100.50778,
            13.735158
          ],
          [
            100.50778,
            13.734842
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "70.00 – 85.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "158.00 – 179.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "245.00 – 421.00 m²"
      }
    ],
    "transport": [
      {
        "name": "สายสีทอง สถานีคลองสาน (G3)",
        "dist": "550 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ICONSIAM",
        "kind": "Destination",
        "color": "#F59E0B",
        "lat": 13.7265,
        "lon": 100.5105,
        "dist": "950 m"
      }
    ]
  },
  {
    "id": "185-rajadamri",
    "name": "185 Rajadamri",
    "brandId": "raimon",
    "brandName": "Raimon Land",
    "category": "คอนโดมิเนียมอัลตราลักชัวรีฟรีโฮลด์",
    "categoryColor": "#78350F",
    "developer": "Raimon Land",
    "developerSite": "https://www.raimonland.com/",
    "image": "https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#78350F",
    "color": "#451A03",
    "height": 135,
    "floors": 35,
    "units": 268,
    "unitsPerFloor": 8,
    "parking": 360,
    "parkingRatio": "135%",
    "landRai": 4,
    "facilitiesM2": "RBSC Sports Club Panorama Pool",
    "priceRange": "฿35M – ฿210M",
    "district": "ปทุมวัน",
    "location": "ถ.ราชดำริ ตรงข้ามราชกรีฑาสโมสร",
    "lat": 13.7355,
    "lon": 100.5392,
    "desc": "คอนโดมิเนียมฟรีโฮลด์ระดับอัลตราลักชัวรีแห่งเดียวบนถนนราชดำริ วิวเปิดโล่งพาโนรามาสู่สนามม้าราชกรีฑาสโมสรและสวนลุมพินี",
    "footprint": [
      [
        100.53875,
        13.735176
      ],
      [
        100.53965,
        13.735176
      ],
      [
        100.53965,
        13.735824
      ],
      [
        100.53875,
        13.735824
      ],
      [
        100.53875,
        13.735176
      ]
    ],
    "parts": [
      {
        "name": "185 Rajadamri Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.53872,
            13.735154
          ],
          [
            100.53968,
            13.735154
          ],
          [
            100.53968,
            13.735846
          ],
          [
            100.53872,
            13.735846
          ],
          [
            100.53872,
            13.735154
          ]
        ]
      },
      {
        "name": "185 Rajadamri Residential Tower",
        "color": "#451A03",
        "height": 119,
        "min_height": 22,
        "footprint": [
          [
            100.53886,
            13.735255
          ],
          [
            100.53954,
            13.735255
          ],
          [
            100.53954,
            13.735745
          ],
          [
            100.53886,
            13.735745
          ],
          [
            100.53886,
            13.735255
          ]
        ]
      },
      {
        "name": "185 Rajadamri Sky Facilities & Crown",
        "color": "#EAB308",
        "height": 135,
        "min_height": 119,
        "footprint": [
          [
            100.53898,
            13.735342
          ],
          [
            100.53942,
            13.735342
          ],
          [
            100.53942,
            13.735658
          ],
          [
            100.53898,
            13.735658
          ],
          [
            100.53898,
            13.735342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "70.00 – 78.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "100.00 – 128.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "167.00 – 356.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ราชดำริ (S1)",
        "dist": "350 m",
        "type": "bts"
      },
      {
        "name": "MRT สีลม (BL26)",
        "dist": "550 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Royal Bangkok Sports Club (RBSC)",
        "kind": "Sports Club",
        "color": "#10B981",
        "lat": 13.737,
        "lon": 100.535,
        "dist": "150 m"
      },
      {
        "name": "Lumpini Park",
        "kind": "Public Park",
        "color": "#10B981",
        "lat": 13.731,
        "lon": 100.5415,
        "dist": "400 m"
      }
    ]
  },
  {
    "id": "tait-sathorn-12",
    "name": "Tait Sathorn 12",
    "brandId": "raimon",
    "brandName": "Raimon Land",
    "category": "คอนโดมิเนียมไอคอนิกสโลปปิ้งลักชัวรี",
    "categoryColor": "#78350F",
    "developer": "Raimon Land & Tokyo Tatemono",
    "developerSite": "https://www.raimonland.com/",
    "image": "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#78350F",
    "color": "#451A03",
    "height": 145,
    "floors": 40,
    "units": 238,
    "unitsPerFloor": 8,
    "parking": 211,
    "parkingRatio": "88%",
    "landRai": 1.9,
    "facilitiesM2": "Crown Sky Deck & Heated Chlorine-free Pool",
    "priceRange": "฿11M – ฿48M",
    "district": "บางรัก",
    "location": "สาทร ซอย 12 ใกล้ BTS เซนต์หลุยส์",
    "lat": 13.7212,
    "lon": 100.5272,
    "desc": "คอนโดระดับลักชัวรีดีไซน์ Iconic Sloping Silhouette ซอยสาทร 12 ใกล้ BTS เซนต์หลุยส์ พร้อม Sky Deck และสระว่ายน้ำลอยฟ้าวิว 360 องศา",
    "footprint": [
      [
        100.52678,
        13.720898
      ],
      [
        100.52762,
        13.720898
      ],
      [
        100.52762,
        13.721502
      ],
      [
        100.52678,
        13.721502
      ],
      [
        100.52678,
        13.720898
      ]
    ],
    "parts": [
      {
        "name": "Tait Sathorn 12 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 23,
        "min_height": 0,
        "footprint": [
          [
            100.52672,
            13.720854
          ],
          [
            100.52768,
            13.720854
          ],
          [
            100.52768,
            13.721546
          ],
          [
            100.52672,
            13.721546
          ],
          [
            100.52672,
            13.720854
          ]
        ]
      },
      {
        "name": "Tait Sathorn 12 Residential Tower",
        "color": "#451A03",
        "height": 128,
        "min_height": 23,
        "footprint": [
          [
            100.52686,
            13.720955
          ],
          [
            100.52754,
            13.720955
          ],
          [
            100.52754,
            13.721445
          ],
          [
            100.52686,
            13.721445
          ],
          [
            100.52686,
            13.720955
          ]
        ]
      },
      {
        "name": "Tait Sathorn 12 Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 145,
        "min_height": 128,
        "footprint": [
          [
            100.52698,
            13.721042
          ],
          [
            100.52742,
            13.721042
          ],
          [
            100.52742,
            13.721358
          ],
          [
            100.52698,
            13.721358
          ],
          [
            100.52698,
            13.721042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "40.00 – 67.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "72.00 – 141.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS เซนต์หลุยส์ (S4)",
        "dist": "180 m",
        "type": "bts"
      },
      {
        "name": "BTS ช่องนนทรี (S3)",
        "dist": "550 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Saint Louis Hospital",
        "kind": "Hospital",
        "color": "#DC2626",
        "lat": 13.7195,
        "lon": 100.524,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "occ-one-city-centre",
    "name": "OCC (One City Centre)",
    "brandId": "raimon",
    "brandName": "Raimon Land",
    "category": "อาคารสำนักงานระดับอัลตราพรีเมียมสูงที่สุดในไทย",
    "categoryColor": "#78350F",
    "developer": "Raimon Land & Mitsubishi Estate",
    "developerSite": "https://www.onecitycentrebangkok.com/",
    "image": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#78350F",
    "color": "#451A03",
    "height": 275,
    "floors": 61,
    "units": 0,
    "parking": 850,
    "parkingRatio": "Commercial",
    "landRai": 6,
    "facilitiesM2": "SOM Designed Grade A+ Office & Sky Forest Garden",
    "priceRange": "Thailand's Tallest Grade A+ Office",
    "district": "ปทุมวัน",
    "location": "ถ.เพลินจิต ใกล้ BTS เพลินจิต",
    "lat": 13.7422,
    "lon": 100.5462,
    "desc": "อาคารสำนักงานเกรด A+ ที่สูงที่สุดในประเทศไทย (275 ม.) ผลงานออกแบบโดย Skidmore, Owings & Merrill (SOM) พร้อมสวนสาธารณะลอยฟ้าใจกลางเพลินจิต",
    "footprint": [
      [
        100.54572,
        13.741854
      ],
      [
        100.54668,
        13.741854
      ],
      [
        100.54668,
        13.742546
      ],
      [
        100.54572,
        13.742546
      ],
      [
        100.54572,
        13.741854
      ]
    ],
    "parts": [
      {
        "name": "OCC One City Centre Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.54572,
            13.741854
          ],
          [
            100.54668,
            13.741854
          ],
          [
            100.54668,
            13.742546
          ],
          [
            100.54572,
            13.742546
          ],
          [
            100.54572,
            13.741854
          ]
        ]
      },
      {
        "name": "OCC One City Centre Residential Tower",
        "color": "#451A03",
        "height": 242,
        "min_height": 26,
        "footprint": [
          [
            100.54586,
            13.741955
          ],
          [
            100.54654,
            13.741955
          ],
          [
            100.54654,
            13.742445
          ],
          [
            100.54586,
            13.742445
          ],
          [
            100.54586,
            13.741955
          ]
        ]
      },
      {
        "name": "OCC One City Centre Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 275,
        "min_height": 242,
        "footprint": [
          [
            100.54598,
            13.742042
          ],
          [
            100.54642,
            13.742042
          ],
          [
            100.54642,
            13.742358
          ],
          [
            100.54598,
            13.742358
          ],
          [
            100.54598,
            13.742042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Prime Office Floor",
        "size": "1,400 – 2,000 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS เพลินจิต (E2)",
        "dist": "150 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Embassy",
        "kind": "Mall",
        "color": "#D97706",
        "lat": 13.7445,
        "lon": 100.5465,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "the-estelle-phromphong",
    "name": "The Estelle Phrom Phong",
    "brandId": "raimon",
    "brandName": "Raimon Land",
    "category": "คอนโดมิเนียมซูเปอร์ลักชัวรีพร้อมพงษ์",
    "categoryColor": "#78350F",
    "developer": "Raimon Land & Tokyo Tatemono",
    "developerSite": "https://www.raimonland.com/",
    "image": "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#78350F",
    "color": "#451A03",
    "height": 130,
    "floors": 37,
    "units": 157,
    "unitsPerFloor": 6,
    "parking": 196,
    "parkingRatio": "125%",
    "landRai": 1.9,
    "facilitiesM2": "Chlorine-free Flotation Pool & Separate Onsen",
    "priceRange": "฿18M – ฿75M",
    "district": "คลองเตย",
    "location": "สุขุมวิท 26 ใกล้ BTS พร้อมพงษ์",
    "lat": 13.7292,
    "lon": 100.5695,
    "desc": "คอนโดมิเนียมซูเปอร์ลักชัวรีซอยสุขุมวิท 26 ใกล้ The EmDistrict พร้อมสระน้ำเกลือบำบัด Onsen แยกชาย-หญิง และบริการรถลีมูซีนส่วนกลาง",
    "footprint": [
      [
        100.56908,
        13.728898
      ],
      [
        100.56992,
        13.728898
      ],
      [
        100.56992,
        13.729502
      ],
      [
        100.56908,
        13.729502
      ],
      [
        100.56908,
        13.728898
      ]
    ],
    "parts": [
      {
        "name": "The Estelle Phrom Phong Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 21,
        "min_height": 0,
        "footprint": [
          [
            100.56902,
            13.728854
          ],
          [
            100.56998,
            13.728854
          ],
          [
            100.56998,
            13.729546
          ],
          [
            100.56902,
            13.729546
          ],
          [
            100.56902,
            13.728854
          ]
        ]
      },
      {
        "name": "The Estelle Phrom Phong Residential Tower",
        "color": "#451A03",
        "height": 114,
        "min_height": 21,
        "footprint": [
          [
            100.56916,
            13.728955
          ],
          [
            100.56984,
            13.728955
          ],
          [
            100.56984,
            13.729445
          ],
          [
            100.56916,
            13.729445
          ],
          [
            100.56916,
            13.728955
          ]
        ]
      },
      {
        "name": "The Estelle Phrom Phong Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 130,
        "min_height": 114,
        "footprint": [
          [
            100.56928,
            13.729042
          ],
          [
            100.56972,
            13.729042
          ],
          [
            100.56972,
            13.729358
          ],
          [
            100.56928,
            13.729358
          ],
          [
            100.56928,
            13.729042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "55.00 – 57.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "89.50 – 93.50 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "160.00 – 225.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS พร้อมพงษ์ (E5)",
        "dist": "200 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "The Emporium",
        "kind": "Mall",
        "color": "#D97706",
        "lat": 13.7295,
        "lon": 100.5688,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "life-phahon-ladprao",
    "name": "Life Phahon-Ladprao",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมไฮไรส์ระดับพรีเมียม",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#B91C1C",
    "height": 155,
    "floors": 40,
    "units": 598,
    "unitsPerFloor": 16,
    "parking": 284,
    "parkingRatio": "47%",
    "landRai": 2.2,
    "facilitiesM2": "Panoramic Sky Facilities & Cloud Pool",
    "priceRange": "฿4.5M – ฿16M",
    "district": "จตุจักร",
    "location": "ถ.พหลโยธิน ติด BTS ห้าแยกลาดพร้าว",
    "lat": 13.8188,
    "lon": 100.5628,
    "desc": "คอนโดมิเนียมไฮไรส์ติดสถานี BTS ห้าแยกลาดพร้าวเพียง 200 ม. ตรงข้ามเซ็นทรัลลาดพร้าว พร้อมวิวสวนจตุจักรกว้างไกล",
    "footprint": [
      [
        100.56238,
        13.818498
      ],
      [
        100.56322,
        13.818498
      ],
      [
        100.56322,
        13.819102
      ],
      [
        100.56238,
        13.819102
      ],
      [
        100.56238,
        13.818498
      ]
    ],
    "parts": [
      {
        "name": "Life Phahon-Ladprao Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [
            100.56232,
            13.818454
          ],
          [
            100.56328,
            13.818454
          ],
          [
            100.56328,
            13.819146
          ],
          [
            100.56232,
            13.819146
          ],
          [
            100.56232,
            13.818454
          ]
        ]
      },
      {
        "name": "Life Phahon-Ladprao Residential Tower",
        "color": "#B91C1C",
        "height": 136,
        "min_height": 25,
        "footprint": [
          [
            100.56246,
            13.818555
          ],
          [
            100.56314,
            13.818555
          ],
          [
            100.56314,
            13.819045
          ],
          [
            100.56246,
            13.819045
          ],
          [
            100.56246,
            13.818555
          ]
        ]
      },
      {
        "name": "Life Phahon-Ladprao Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 155,
        "min_height": 136,
        "footprint": [
          [
            100.56258,
            13.818642
          ],
          [
            100.56302,
            13.818642
          ],
          [
            100.56302,
            13.818958
          ],
          [
            100.56258,
            13.818958
          ],
          [
            100.56258,
            13.818642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "28.50 – 35.00 m²"
      },
      {
        "label": "1 Bedroom Plus",
        "size": "42.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "57.00 – 65.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ห้าแยกลาดพร้าว (N9)",
        "dist": "200 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Ladprao",
        "kind": "Shopping",
        "color": "#D97706",
        "lat": 13.8175,
        "lon": 100.5605,
        "dist": "250 m"
      }
    ]
  },
  {
    "id": "life-sathorn-sierra",
    "name": "Life Sathorn Sierra",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมสไตล์แกรนด์เนเจอร์",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#991B1B",
    "height": 145,
    "floors": 40,
    "units": 1971,
    "unitsPerFloor": 50,
    "parking": 765,
    "parkingRatio": "40%",
    "landRai": 8.3,
    "facilitiesM2": "5-Rai Green Forest & 100m Swimming Pool",
    "priceRange": "฿2.7M – ฿8.9M",
    "district": "ธนบุรี",
    "location": "ถ.ราชพฤกษ์ ใกล้ BTS ตลาดพลู",
    "lat": 13.716,
    "lon": 100.4815,
    "desc": "คอนโดส่วนกลางขนาดมหึมากว่า 5 ไร่ สระว่ายน้ำยาว 100 ม. เชื่อมต่อ BTS ตลาดพลู และ BRT ราชพฤกษ์เพียง 150 ม.",
    "footprint": [
      [
        100.48102,
        13.715654
      ],
      [
        100.48198,
        13.715654
      ],
      [
        100.48198,
        13.716346
      ],
      [
        100.48102,
        13.716346
      ],
      [
        100.48102,
        13.715654
      ]
    ],
    "parts": [
      {
        "name": "Life Sathorn Sierra Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 23,
        "min_height": 0,
        "footprint": [
          [
            100.48102,
            13.715654
          ],
          [
            100.48198,
            13.715654
          ],
          [
            100.48198,
            13.716346
          ],
          [
            100.48102,
            13.716346
          ],
          [
            100.48102,
            13.715654
          ]
        ]
      },
      {
        "name": "Life Sathorn Sierra Residential Tower",
        "color": "#991B1B",
        "height": 128,
        "min_height": 23,
        "footprint": [
          [
            100.48116,
            13.715755
          ],
          [
            100.48184,
            13.715755
          ],
          [
            100.48184,
            13.716245
          ],
          [
            100.48116,
            13.716245
          ],
          [
            100.48116,
            13.715755
          ]
        ]
      },
      {
        "name": "Life Sathorn Sierra Sky Facilities & Crown",
        "color": "#10B981",
        "height": 145,
        "min_height": 128,
        "footprint": [
          [
            100.48128,
            13.715842
          ],
          [
            100.48172,
            13.715842
          ],
          [
            100.48172,
            13.716158
          ],
          [
            100.48128,
            13.716158
          ],
          [
            100.48128,
            13.715842
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "28.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "32.00 – 34.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "57.50 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ตลาดพลู (S10)",
        "dist": "150 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "The Mall Lifestore Thapra",
        "kind": "Mall",
        "color": "#EC4899",
        "lat": 13.713,
        "lon": 100.4785,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "life-rama4-asoke",
    "name": "Life Rama 4 - Asoke",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมไฮไรส์วิวสวนเบญจกิติ",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#B91C1C",
    "height": 140,
    "floors": 39,
    "units": 1237,
    "unitsPerFloor": 32,
    "parking": 529,
    "parkingRatio": "43%",
    "landRai": 5.2,
    "facilitiesM2": "Panoramic Sky Lounge & Benjakitti Park View",
    "priceRange": "฿4.1M – ฿14M",
    "district": "คลองเตย",
    "location": "ถ.พระราม 4 ใกล้ MRT ศูนย์ฯ สิริกิติ์",
    "lat": 13.7185,
    "lon": 100.562,
    "desc": "คอนโดมิเนียมเชื่อมต่อพระราม 4 และอโศก ใกล้ MRT ศูนย์การประชุมแห่งชาติสิริกิติ์ และสวนเบญจกิติขนาดใหญ่",
    "footprint": [
      [
        100.56155,
        13.718176
      ],
      [
        100.56245,
        13.718176
      ],
      [
        100.56245,
        13.718824
      ],
      [
        100.56155,
        13.718824
      ],
      [
        100.56155,
        13.718176
      ]
    ],
    "parts": [
      {
        "name": "Life Rama 4 Asoke Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.56152,
            13.718154
          ],
          [
            100.56248,
            13.718154
          ],
          [
            100.56248,
            13.718846
          ],
          [
            100.56152,
            13.718846
          ],
          [
            100.56152,
            13.718154
          ]
        ]
      },
      {
        "name": "Life Rama 4 Asoke Residential Tower",
        "color": "#B91C1C",
        "height": 123,
        "min_height": 22,
        "footprint": [
          [
            100.56166,
            13.718255
          ],
          [
            100.56234,
            13.718255
          ],
          [
            100.56234,
            13.718745
          ],
          [
            100.56166,
            13.718745
          ],
          [
            100.56166,
            13.718255
          ]
        ]
      },
      {
        "name": "Life Rama 4 Asoke Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 140,
        "min_height": 123,
        "footprint": [
          [
            100.56178,
            13.718342
          ],
          [
            100.56222,
            13.718342
          ],
          [
            100.56222,
            13.718658
          ],
          [
            100.56178,
            13.718658
          ],
          [
            100.56178,
            13.718342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio Vertiplex",
        "size": "28.50 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "32.00 – 40.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "55.00 – 75.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT ศูนย์ฯ สิริกิติ์ (BL23)",
        "dist": "450 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "QSNCC",
        "kind": "Convention Center",
        "color": "#3B82F6",
        "lat": 13.724,
        "lon": 100.5585,
        "dist": "500 m"
      }
    ]
  },
  {
    "id": "aspire-sukhumvit-rama4",
    "name": "Aspire Sukhumvit-Rama 4",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมไลฟ์สไตล์คนรุ่นใหม่",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#DC2626",
    "height": 135,
    "floors": 38,
    "units": 1323,
    "unitsPerFloor": 36,
    "parking": 496,
    "parkingRatio": "38%",
    "landRai": 4.3,
    "facilitiesM2": "Oasis Rooftop & Co-working Space",
    "priceRange": "฿2.5M – ฿7.5M",
    "district": "คลองเตย",
    "location": "ถ.พระราม 4 ใกล้ BTS พระโขนง",
    "lat": 13.7145,
    "lon": 100.5905,
    "desc": "คอนโดสำหรับ First Jobber และคนรุ่นใหม่ ทำเลเชื่อมต่อสุขุมวิทและพระราม 4 ใกล้ BTS พระโขนง",
    "footprint": [
      [
        100.59008,
        13.714198
      ],
      [
        100.59092,
        13.714198
      ],
      [
        100.59092,
        13.714802
      ],
      [
        100.59008,
        13.714802
      ],
      [
        100.59008,
        13.714198
      ]
    ],
    "parts": [
      {
        "name": "Aspire Sukhumvit-Rama 4 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.59002,
            13.714154
          ],
          [
            100.59098,
            13.714154
          ],
          [
            100.59098,
            13.714846
          ],
          [
            100.59002,
            13.714846
          ],
          [
            100.59002,
            13.714154
          ]
        ]
      },
      {
        "name": "Aspire Sukhumvit-Rama 4 Residential Tower",
        "color": "#DC2626",
        "height": 119,
        "min_height": 22,
        "footprint": [
          [
            100.59016,
            13.714255
          ],
          [
            100.59084,
            13.714255
          ],
          [
            100.59084,
            13.714745
          ],
          [
            100.59016,
            13.714745
          ],
          [
            100.59016,
            13.714255
          ]
        ]
      },
      {
        "name": "Aspire Sukhumvit-Rama 4 Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 135,
        "min_height": 119,
        "footprint": [
          [
            100.59028,
            13.714342
          ],
          [
            100.59072,
            13.714342
          ],
          [
            100.59072,
            13.714658
          ],
          [
            100.59028,
            13.714658
          ],
          [
            100.59028,
            13.714342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "24.00 – 26.50 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "31.00 – 35.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS พระโขนง (E8)",
        "dist": "600 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "W District",
        "kind": "Food Hub",
        "color": "#10B981",
        "lat": 13.714,
        "lon": 100.593,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "the-address-chidlom",
    "name": "The Address Chidlom",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "คอนโดมิเนียมเพรสทีจชิดลม",
    "categoryColor": "#DC2626",
    "developer": "AP (Thailand)",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#7F1D1D",
    "height": 95,
    "floors": 24,
    "units": 597,
    "unitsPerFloor": 16,
    "parking": 450,
    "parkingRatio": "75%",
    "landRai": 4.2,
    "facilitiesM2": "Luxury Club Lounge & Private Courtyard",
    "priceRange": "฿11M – ฿45M",
    "district": "ปทุมวัน",
    "location": "ซอยสมคิด (ชิดลม) ใกล้ BTS ชิดลม",
    "lat": 13.746,
    "lon": 100.5448,
    "desc": "คอนโดมิเนียมระดับเพรสทีจในซอยสมคิด ท่ามกลางบรรยากาศร่มรื่น ติด Central Chidlom เพียง 200 ม.",
    "footprint": [
      [
        100.5444,
        13.745712
      ],
      [
        100.5452,
        13.745712
      ],
      [
        100.5452,
        13.746288
      ],
      [
        100.5444,
        13.746288
      ],
      [
        100.5444,
        13.745712
      ]
    ],
    "parts": [
      {
        "name": "The Address Chidlom Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.54432,
            13.745654
          ],
          [
            100.54528,
            13.745654
          ],
          [
            100.54528,
            13.746346
          ],
          [
            100.54432,
            13.746346
          ],
          [
            100.54432,
            13.745654
          ]
        ]
      },
      {
        "name": "The Address Chidlom Residential Tower",
        "color": "#7F1D1D",
        "height": 84,
        "min_height": 16,
        "footprint": [
          [
            100.54446,
            13.745755
          ],
          [
            100.54514,
            13.745755
          ],
          [
            100.54514,
            13.746245
          ],
          [
            100.54446,
            13.746245
          ],
          [
            100.54446,
            13.745755
          ]
        ]
      },
      {
        "name": "The Address Chidlom Sky Facilities & Crown",
        "color": "#EAB308",
        "height": 95,
        "min_height": 84,
        "footprint": [
          [
            100.54458,
            13.745842
          ],
          [
            100.54502,
            13.745842
          ],
          [
            100.54502,
            13.746158
          ],
          [
            100.54458,
            13.746158
          ],
          [
            100.54458,
            13.745842
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "56.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "80.00 – 95.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ชิดลม (E1)",
        "dist": "200 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Chidlom",
        "kind": "Department Store",
        "color": "#D97706",
        "lat": 13.744,
        "lon": 100.543,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "kawa-haus",
    "name": "Kawa Haus T77",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "รีสอร์ตคอนโดมิเนียมริมน้ำ",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 45,
    "floors": 7,
    "units": 546,
    "unitsPerFloor": 22,
    "parking": 260,
    "parkingRatio": "48%",
    "landRai": 6.1,
    "facilitiesM2": "Waterfront Lounge & Bamboo Forest",
    "priceRange": "฿4.2M – ฿16M",
    "district": "วัฒนา",
    "location": "สุขุมวิท 77 (T77 Community) อ่อนนุช",
    "lat": 13.7142,
    "lon": 100.6015,
    "desc": "คอนโดสไตล์รีสอร์ตริมคลองพระโขนงในคอมมูนิตี้ T77 บรรยากาศเงียบสงบ ล้อมรอบด้วยธรรมชาติใจกลางอ่อนนุช",
    "footprint": [
      [
        100.60105,
        13.713876
      ],
      [
        100.60195,
        13.713876
      ],
      [
        100.60195,
        13.714524
      ],
      [
        100.60105,
        13.714524
      ],
      [
        100.60105,
        13.713876
      ]
    ],
    "parts": [
      {
        "name": "Kawa Haus Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.60102,
            13.713854
          ],
          [
            100.60198,
            13.713854
          ],
          [
            100.60198,
            13.714546
          ],
          [
            100.60102,
            13.714546
          ],
          [
            100.60102,
            13.713854
          ]
        ]
      },
      {
        "name": "Kawa Haus Residential Tower",
        "color": "#166534",
        "height": 40,
        "min_height": 16,
        "footprint": [
          [
            100.60116,
            13.713955
          ],
          [
            100.60184,
            13.713955
          ],
          [
            100.60184,
            13.714445
          ],
          [
            100.60116,
            13.714445
          ],
          [
            100.60116,
            13.713955
          ]
        ]
      },
      {
        "name": "Kawa Haus Sky Facilities & Crown",
        "color": "#10B981",
        "height": 45,
        "min_height": 40,
        "footprint": [
          [
            100.60128,
            13.714042
          ],
          [
            100.60172,
            13.714042
          ],
          [
            100.60172,
            13.714358
          ],
          [
            100.60128,
            13.714358
          ],
          [
            100.60128,
            13.714042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "29.75 – 43.75 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "50.50 – 78.75 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS อ่อนนุช (E9)",
        "dist": "950 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Habito Mall",
        "kind": "Community Mall",
        "color": "#10B981",
        "lat": 13.7135,
        "lon": 100.6005,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "the-line-sukhumvit-101",
    "name": "THE LINE Sukhumvit 101",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมไฮไรส์เพดานสูง",
    "categoryColor": "#16A34A",
    "developer": "Sansiri & BTS",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#15803D",
    "height": 135,
    "floors": 37,
    "units": 778,
    "unitsPerFloor": 24,
    "parking": 321,
    "parkingRatio": "41%",
    "landRai": 4,
    "facilitiesM2": "LED Multi-court & Sky Pool 37th Fl",
    "priceRange": "฿4.5M – ฿15M",
    "district": "พระโขนง",
    "location": "สุขุมวิท 101 ใกล้ BTS ปุณณวิถี",
    "lat": 13.6895,
    "lon": 100.6085,
    "desc": "คอนโดมิเนียมเพดานสูง 3.4 ม. ทุกห้อง ใกล้ BTS ปุณณวิถีเพียง 250 ม. พร้อมสนาม LED Multi-court บนชั้นดาดฟ้า",
    "footprint": [
      [
        100.60808,
        13.689198
      ],
      [
        100.60892,
        13.689198
      ],
      [
        100.60892,
        13.689802
      ],
      [
        100.60808,
        13.689802
      ],
      [
        100.60808,
        13.689198
      ]
    ],
    "parts": [
      {
        "name": "THE LINE Sukhumvit 101 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.60802,
            13.689154
          ],
          [
            100.60898,
            13.689154
          ],
          [
            100.60898,
            13.689846
          ],
          [
            100.60802,
            13.689846
          ],
          [
            100.60802,
            13.689154
          ]
        ]
      },
      {
        "name": "THE LINE Sukhumvit 101 Residential Tower",
        "color": "#15803D",
        "height": 119,
        "min_height": 22,
        "footprint": [
          [
            100.60816,
            13.689255
          ],
          [
            100.60884,
            13.689255
          ],
          [
            100.60884,
            13.689745
          ],
          [
            100.60816,
            13.689745
          ],
          [
            100.60816,
            13.689255
          ]
        ]
      },
      {
        "name": "THE LINE Sukhumvit 101 Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 135,
        "min_height": 119,
        "footprint": [
          [
            100.60828,
            13.689342
          ],
          [
            100.60872,
            13.689342
          ],
          [
            100.60872,
            13.689658
          ],
          [
            100.60828,
            13.689658
          ],
          [
            100.60828,
            13.689342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "27.00 – 33.25 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "47.50 – 62.75 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ปุณณวิถี (E11)",
        "dist": "250 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "True Digital Park",
        "kind": "Tech Hub",
        "color": "#3B82F6",
        "lat": 13.686,
        "lon": 100.6105,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "the-line-phahon-pradipat",
    "name": "THE LINE Phahol-Pradipat",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมธรรมชาติลอยฟ้า",
    "categoryColor": "#16A34A",
    "developer": "Sansiri & BTS",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 160,
    "floors": 46,
    "units": 981,
    "unitsPerFloor": 26,
    "parking": 500,
    "parkingRatio": "51%",
    "landRai": 5.3,
    "facilitiesM2": "Sky Forest & Secret Garden",
    "priceRange": "฿4.2M – ฿14M",
    "district": "พญาไท",
    "location": "ถ.ประดิพัทธ์ ใกล้ BTS สะพานควาย",
    "lat": 13.7915,
    "lon": 100.5455,
    "desc": "คอนโดมิเนียมสูง 46 ชั้นในซอยประดิพัทธ์ ใกล้ BTS สะพานควาย จัดเต็มสวนป่าธรรมชาติและสระว่ายน้ำลอยฟ้า",
    "footprint": [
      [
        100.54505,
        13.791176
      ],
      [
        100.54595,
        13.791176
      ],
      [
        100.54595,
        13.791824
      ],
      [
        100.54505,
        13.791824
      ],
      [
        100.54505,
        13.791176
      ]
    ],
    "parts": [
      {
        "name": "THE LINE Phahol-Pradipat Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.54502,
            13.791154
          ],
          [
            100.54598,
            13.791154
          ],
          [
            100.54598,
            13.791846
          ],
          [
            100.54502,
            13.791846
          ],
          [
            100.54502,
            13.791154
          ]
        ]
      },
      {
        "name": "THE LINE Phahol-Pradipat Residential Tower",
        "color": "#166534",
        "height": 141,
        "min_height": 26,
        "footprint": [
          [
            100.54516,
            13.791255
          ],
          [
            100.54584,
            13.791255
          ],
          [
            100.54584,
            13.791745
          ],
          [
            100.54516,
            13.791745
          ],
          [
            100.54516,
            13.791255
          ]
        ]
      },
      {
        "name": "THE LINE Phahol-Pradipat Sky Facilities & Crown",
        "color": "#10B981",
        "height": 160,
        "min_height": 141,
        "footprint": [
          [
            100.54528,
            13.791342
          ],
          [
            100.54572,
            13.791342
          ],
          [
            100.54572,
            13.791658
          ],
          [
            100.54528,
            13.791658
          ],
          [
            100.54528,
            13.791342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "26.25 – 40.75 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "51.50 – 67.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS สะพานควาย (N7)",
        "dist": "550 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Big C Saphan Khwai",
        "kind": "Supermarket",
        "color": "#EF4444",
        "lat": 13.793,
        "lon": 100.5485,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "via-ari",
    "name": "Via Ari",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมเอ็กซ์คลูซีฟอารีย์",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#14532D",
    "height": 115,
    "floors": 32,
    "units": 114,
    "unitsPerFloor": 4,
    "parking": 194,
    "parkingRatio": "170%",
    "landRai": 1.1,
    "facilitiesM2": "Pet-friendly Luxury Club & Sky Pool",
    "priceRange": "฿18M – ฿68M",
    "district": "พญาไท",
    "location": "ซอยอารีย์ 1 ใกล้ BTS อารีย์",
    "lat": 13.7788,
    "lon": 100.5422,
    "desc": "คอนโดมิเนียม Pet-friendly ระดับลักชัวรีใจกลางอารีย์ ซอย 1 ความเป็นส่วนตัวสูงสุดเพียง 114 ยูนิต พร้อมที่จอดรถมากถึง 170%",
    "footprint": [
      [
        100.54182,
        13.778526
      ],
      [
        100.54258,
        13.778526
      ],
      [
        100.54258,
        13.779074
      ],
      [
        100.54182,
        13.779074
      ],
      [
        100.54182,
        13.778526
      ]
    ],
    "parts": [
      {
        "name": "Via Ari Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.54172,
            13.778454
          ],
          [
            100.54268,
            13.778454
          ],
          [
            100.54268,
            13.779146
          ],
          [
            100.54172,
            13.779146
          ],
          [
            100.54172,
            13.778454
          ]
        ]
      },
      {
        "name": "Via Ari Residential Tower",
        "color": "#14532D",
        "height": 101,
        "min_height": 18,
        "footprint": [
          [
            100.54186,
            13.778555
          ],
          [
            100.54254,
            13.778555
          ],
          [
            100.54254,
            13.779045
          ],
          [
            100.54186,
            13.779045
          ],
          [
            100.54186,
            13.778555
          ]
        ]
      },
      {
        "name": "Via Ari Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 115,
        "min_height": 101,
        "footprint": [
          [
            100.54198,
            13.778642
          ],
          [
            100.54242,
            13.778642
          ],
          [
            100.54242,
            13.778958
          ],
          [
            100.54198,
            13.778958
          ],
          [
            100.54198,
            13.778642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "2 Bedrooms",
        "size": "75.00 – 90.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "120.00 – 210.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS อารีย์ (N5)",
        "dist": "150 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "La Villa Ari",
        "kind": "Lifestyle",
        "color": "#10B981",
        "lat": 13.7795,
        "lon": 100.5445,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "scope-promsri",
    "name": "SCOPE Promsri",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "คอนโดมิเนียมโลว์ไรส์อัลตราลักชัวรี",
    "categoryColor": "#38BDF8",
    "developer": "SC Asset & SCOPE",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0369A1",
    "height": 32,
    "floors": 8,
    "units": 148,
    "unitsPerFloor": 19,
    "parking": 148,
    "parkingRatio": "100%",
    "landRai": 1.1,
    "facilitiesM2": "Ligne Roset Furnished & Moonlight Onsen",
    "priceRange": "฿7.5M – ฿22M",
    "district": "วัฒนา",
    "location": "ซอยพร้อมศรี (สุขุมวิท 39/49) พร้อมพงษ์",
    "lat": 13.7348,
    "lon": 100.5762,
    "desc": "คอนโดโลว์ไรส์ระดับเวิลด์คลาสในซอยพร้อมศรี ตกแต่งพร้อมอยู่ด้วยเฟอร์นิเจอร์แบรนด์หรู Ligne Roset จากฝรั่งเศสครบเซ็ต",
    "footprint": [
      [
        100.57582,
        13.734526
      ],
      [
        100.57658,
        13.734526
      ],
      [
        100.57658,
        13.735074
      ],
      [
        100.57582,
        13.735074
      ],
      [
        100.57582,
        13.734526
      ]
    ],
    "parts": [
      {
        "name": "SCOPE Promsri Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.57572,
            13.734454
          ],
          [
            100.57668,
            13.734454
          ],
          [
            100.57668,
            13.735146
          ],
          [
            100.57572,
            13.735146
          ],
          [
            100.57572,
            13.734454
          ]
        ]
      },
      {
        "name": "SCOPE Promsri Residential Tower",
        "color": "#0369A1",
        "height": 28,
        "min_height": 16,
        "footprint": [
          [
            100.57586,
            13.734555
          ],
          [
            100.57654,
            13.734555
          ],
          [
            100.57654,
            13.735045
          ],
          [
            100.57586,
            13.735045
          ],
          [
            100.57586,
            13.734555
          ]
        ]
      },
      {
        "name": "SCOPE Promsri Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 32,
        "min_height": 28,
        "footprint": [
          [
            100.57598,
            13.734642
          ],
          [
            100.57642,
            13.734642
          ],
          [
            100.57642,
            13.734958
          ],
          [
            100.57598,
            13.734958
          ],
          [
            100.57598,
            13.734642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom (Fully Ligne Roset)",
        "size": "28.00 – 35.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS พร้อมพงษ์ (E5)",
        "dist": "1.1 km",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Samitivej Sukhumvit Hospital",
        "kind": "Hospital",
        "color": "#DC2626",
        "lat": 13.736,
        "lon": 100.5775,
        "dist": "250 m"
      }
    ]
  },
  {
    "id": "the-crest-sukhumvit-34",
    "name": "The Crest Sukhumvit 34",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "คอนโดมิเนียมลักชัวรีทองหล่อ",
    "categoryColor": "#38BDF8",
    "developer": "SC Asset",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0284C7",
    "height": 110,
    "floors": 28,
    "units": 265,
    "unitsPerFloor": 12,
    "parking": 180,
    "parkingRatio": "68%",
    "landRai": 2,
    "facilitiesM2": "Infinity Edge Pool & Sky Lounge",
    "priceRange": "฿8.5M – ฿35M",
    "district": "คลองเตย",
    "location": "สุขุมวิท 34 ใกล้ BTS ทองหล่อ",
    "lat": 13.7235,
    "lon": 100.575,
    "desc": "คอนโดมิเนียมหรูสไตล์ Art Deco ปากซอยสุขุมวิท 34 ใกล้สถานี BTS ทองหล่อเพียง 120 ม.",
    "footprint": [
      [
        100.5746,
        13.723212
      ],
      [
        100.5754,
        13.723212
      ],
      [
        100.5754,
        13.723788
      ],
      [
        100.5746,
        13.723788
      ],
      [
        100.5746,
        13.723212
      ]
    ],
    "parts": [
      {
        "name": "The Crest Sukhumvit 34 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.57452,
            13.723154
          ],
          [
            100.57548,
            13.723154
          ],
          [
            100.57548,
            13.723846
          ],
          [
            100.57452,
            13.723846
          ],
          [
            100.57452,
            13.723154
          ]
        ]
      },
      {
        "name": "The Crest Sukhumvit 34 Residential Tower",
        "color": "#0284C7",
        "height": 97,
        "min_height": 18,
        "footprint": [
          [
            100.57466,
            13.723255
          ],
          [
            100.57534,
            13.723255
          ],
          [
            100.57534,
            13.723745
          ],
          [
            100.57466,
            13.723745
          ],
          [
            100.57466,
            13.723255
          ]
        ]
      },
      {
        "name": "The Crest Sukhumvit 34 Sky Facilities & Crown",
        "color": "#EAB308",
        "height": 110,
        "min_height": 97,
        "footprint": [
          [
            100.57478,
            13.723342
          ],
          [
            100.57522,
            13.723342
          ],
          [
            100.57522,
            13.723658
          ],
          [
            100.57478,
            13.723658
          ],
          [
            100.57478,
            13.723342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "35.00 – 53.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "65.00 – 78.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ทองหล่อ (E6)",
        "dist": "120 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "T-One Building",
        "kind": "Office",
        "color": "#3B82F6",
        "lat": 13.7235,
        "lon": 100.5795,
        "dist": "400 m"
      }
    ]
  },
  {
    "id": "ideo-sukhumvit-93",
    "name": "Ideo Sukhumvit 93",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "คอนโดมิเนียมไฮไรส์ติดรถไฟฟ้า",
    "categoryColor": "#0284C7",
    "developer": "Ananda Development",
    "developerSite": "https://www.ananda.co.th/",
    "image": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 138,
    "floors": 38,
    "units": 1332,
    "unitsPerFloor": 36,
    "parking": 610,
    "parkingRatio": "45%",
    "landRai": 8.3,
    "facilitiesM2": "2 Swimming Pools & Multi-sports Court",
    "priceRange": "฿3.5M – ฿12M",
    "district": "พระโขนง",
    "location": "สุขุมวิท 93 ติด BTS บางจาก",
    "lat": 13.6975,
    "lon": 100.6055,
    "desc": "คอนโดมิเนียมขนาดใหญ่ติดทางขึ้น BTS บางจากเพียง 15 ม. พร้อมสระว่ายน้ำ 2 สระขนาดใหญ่และสตาร์บัคส์ในโครงการ",
    "footprint": [
      [
        100.60502,
        13.697154
      ],
      [
        100.60598,
        13.697154
      ],
      [
        100.60598,
        13.697846
      ],
      [
        100.60502,
        13.697846
      ],
      [
        100.60502,
        13.697154
      ]
    ],
    "parts": [
      {
        "name": "Ideo Sukhumvit 93 Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.60502,
            13.697154
          ],
          [
            100.60598,
            13.697154
          ],
          [
            100.60598,
            13.697846
          ],
          [
            100.60502,
            13.697846
          ],
          [
            100.60502,
            13.697154
          ]
        ]
      },
      {
        "name": "Ideo Sukhumvit 93 Residential Tower",
        "color": "#1E3A8A",
        "height": 121,
        "min_height": 22,
        "footprint": [
          [
            100.60516,
            13.697255
          ],
          [
            100.60584,
            13.697255
          ],
          [
            100.60584,
            13.697745
          ],
          [
            100.60516,
            13.697745
          ],
          [
            100.60516,
            13.697255
          ]
        ]
      },
      {
        "name": "Ideo Sukhumvit 93 Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 138,
        "min_height": 121,
        "footprint": [
          [
            100.60528,
            13.697342
          ],
          [
            100.60572,
            13.697342
          ],
          [
            100.60572,
            13.697658
          ],
          [
            100.60528,
            13.697658
          ],
          [
            100.60528,
            13.697342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "25.00 – 28.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "31.00 – 34.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "51.00 – 68.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS บางจาก (E10)",
        "dist": "15 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Jim Thompson Factory",
        "kind": "Lifestyle",
        "color": "#F59E0B",
        "lat": 13.698,
        "lon": 100.604,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "ideo-thaphra-interchange",
    "name": "Ideo Thaphra Interchange",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "คอนโดมิเนียมไฮไรส์ฮับฝั่งธน",
    "categoryColor": "#0284C7",
    "developer": "Ananda Development",
    "developerSite": "https://www.ananda.co.th/",
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 85,
    "floors": 22,
    "units": 844,
    "unitsPerFloor": 38,
    "parking": 344,
    "parkingRatio": "40%",
    "landRai": 4.1,
    "facilitiesM2": "White Cloud Pool & Sky Yoga",
    "priceRange": "฿2.6M – ฿8.5M",
    "district": "บางกอกใหญ่",
    "location": "ถ.เพชรเกษม ใกล้ MRT ท่าพระ",
    "lat": 13.7295,
    "lon": 100.474,
    "desc": "คอนโดมิเนียมใกล้จุดตัดสถานีอินเตอร์เชนจ์ MRT ท่าพระเพียง 100 ม. เข้าสู่สีลมและเยาวราชสะดวกรวดเร็ว",
    "footprint": [
      [
        100.47355,
        13.729176
      ],
      [
        100.47445,
        13.729176
      ],
      [
        100.47445,
        13.729824
      ],
      [
        100.47355,
        13.729824
      ],
      [
        100.47355,
        13.729176
      ]
    ],
    "parts": [
      {
        "name": "Ideo Thaphra Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.47352,
            13.729154
          ],
          [
            100.47448,
            13.729154
          ],
          [
            100.47448,
            13.729846
          ],
          [
            100.47352,
            13.729846
          ],
          [
            100.47352,
            13.729154
          ]
        ]
      },
      {
        "name": "Ideo Thaphra Residential Tower",
        "color": "#1E3A8A",
        "height": 75,
        "min_height": 16,
        "footprint": [
          [
            100.47366,
            13.729255
          ],
          [
            100.47434,
            13.729255
          ],
          [
            100.47434,
            13.729745
          ],
          [
            100.47366,
            13.729745
          ],
          [
            100.47366,
            13.729255
          ]
        ]
      },
      {
        "name": "Ideo Thaphra Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 85,
        "min_height": 75,
        "footprint": [
          [
            100.47378,
            13.729342
          ],
          [
            100.47422,
            13.729342
          ],
          [
            100.47422,
            13.729658
          ],
          [
            100.47378,
            13.729658
          ],
          [
            100.47378,
            13.729342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "27.50 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "34.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "62.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT ท่าพระ (BL01)",
        "dist": "100 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Wat Tha Phra",
        "kind": "Culture",
        "color": "#EAB308",
        "lat": 13.731,
        "lon": 100.4735,
        "dist": "200 m"
      }
    ]
  },
  {
    "id": "nue-mega-bangna",
    "name": "Nue Mega Bangna",
    "brandId": "noble",
    "brandName": "Noble Development",
    "category": "คอนโดมิเนียมไฮไรส์ติดเมกาบางนา",
    "categoryColor": "#64748B",
    "developer": "Noble Development",
    "developerSite": "https://www.noblehome.com/",
    "image": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E293B",
    "color": "#0F172A",
    "height": 135,
    "floors": 38,
    "units": 1005,
    "unitsPerFloor": 28,
    "parking": 327,
    "parkingRatio": "32%",
    "landRai": 3.2,
    "facilitiesM2": "Sky Infinity Edge Pool & Mega View",
    "priceRange": "฿2.2M – ฿6.8M",
    "district": "บางนา",
    "location": "ถ.บางนา-ตราด ติด เมกาบางนา",
    "lat": 13.645,
    "lon": 100.6785,
    "desc": "คอนโดมิเนียมติดห้างสรรพสินค้า Mega Bangna และ IKEA เพียงก้าวเดิน จัดเต็มส่วนกลาง 5 ชั้นลอยฟ้า",
    "footprint": [
      [
        100.67805,
        13.644676
      ],
      [
        100.67895,
        13.644676
      ],
      [
        100.67895,
        13.645324
      ],
      [
        100.67805,
        13.645324
      ],
      [
        100.67805,
        13.644676
      ]
    ],
    "parts": [
      {
        "name": "Nue Mega Bangna Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.67802,
            13.644654
          ],
          [
            100.67898,
            13.644654
          ],
          [
            100.67898,
            13.645346
          ],
          [
            100.67802,
            13.645346
          ],
          [
            100.67802,
            13.644654
          ]
        ]
      },
      {
        "name": "Nue Mega Bangna Residential Tower",
        "color": "#0F172A",
        "height": 119,
        "min_height": 22,
        "footprint": [
          [
            100.67816,
            13.644755
          ],
          [
            100.67884,
            13.644755
          ],
          [
            100.67884,
            13.645245
          ],
          [
            100.67816,
            13.645245
          ],
          [
            100.67816,
            13.644755
          ]
        ]
      },
      {
        "name": "Nue Mega Bangna Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 135,
        "min_height": 119,
        "footprint": [
          [
            100.67828,
            13.644842
          ],
          [
            100.67872,
            13.644842
          ],
          [
            100.67872,
            13.645158
          ],
          [
            100.67828,
            13.645158
          ],
          [
            100.67828,
            13.644842
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "28.50 – 34.80 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "60.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Shuttle Bus to BTS Udom Suk",
        "dist": "Direct",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Mega Bangna & IKEA",
        "kind": "Super Mega Mall",
        "color": "#D97706",
        "lat": 13.644,
        "lon": 100.68,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "nue-noble-fai-chai",
    "name": "Nue Noble Fai Chai-Charan",
    "brandId": "noble",
    "brandName": "Noble Development",
    "category": "คอนโดมิเนียมไฮไรส์สายสีน้ำเงิน",
    "categoryColor": "#64748B",
    "developer": "Noble Development",
    "developerSite": "https://www.noblehome.com/",
    "image": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E293B",
    "color": "#0F172A",
    "height": 85,
    "floors": 22,
    "units": 555,
    "unitsPerFloor": 26,
    "parking": 200,
    "parkingRatio": "36%",
    "landRai": 2.1,
    "facilitiesM2": "Rooftop Forest & Lap Pool",
    "priceRange": "฿2.5M – ฿7.2M",
    "district": "บางกอกน้อย",
    "location": "ถ.พรานนก ใกล้ MRT ไฟฉาย",
    "lat": 13.755,
    "lon": 100.472,
    "desc": "คอนโดมิเนียมสไตล์มินิมอลใกล้ MRT ไฟฉายเพียง 80 ม. เชื่อมต่อไปศิริราชและเยาวราชอย่างสะดวก",
    "footprint": [
      [
        100.4716,
        13.754712
      ],
      [
        100.4724,
        13.754712
      ],
      [
        100.4724,
        13.755288
      ],
      [
        100.4716,
        13.755288
      ],
      [
        100.4716,
        13.754712
      ]
    ],
    "parts": [
      {
        "name": "Nue Noble Fai Chai Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.47152,
            13.754654
          ],
          [
            100.47248,
            13.754654
          ],
          [
            100.47248,
            13.755346
          ],
          [
            100.47152,
            13.755346
          ],
          [
            100.47152,
            13.754654
          ]
        ]
      },
      {
        "name": "Nue Noble Fai Chai Residential Tower",
        "color": "#0F172A",
        "height": 75,
        "min_height": 16,
        "footprint": [
          [
            100.47166,
            13.754755
          ],
          [
            100.47234,
            13.754755
          ],
          [
            100.47234,
            13.755245
          ],
          [
            100.47166,
            13.755245
          ],
          [
            100.47166,
            13.754755
          ]
        ]
      },
      {
        "name": "Nue Noble Fai Chai Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 85,
        "min_height": 75,
        "footprint": [
          [
            100.47178,
            13.754842
          ],
          [
            100.47222,
            13.754842
          ],
          [
            100.47222,
            13.755158
          ],
          [
            100.47178,
            13.755158
          ],
          [
            100.47178,
            13.754842
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "22.50 – 31.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "45.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT ไฟฉาย (BL03)",
        "dist": "80 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Siriraj Hospital",
        "kind": "Hospital",
        "color": "#DC2626",
        "lat": 13.758,
        "lon": 100.485,
        "dist": "1.2 km"
      }
    ]
  },
  {
    "id": "sindhorn-residence",
    "name": "Sindhorn Residence & Village",
    "brandId": "siam-sindhorn",
    "brandName": "Siam Sindhorn",
    "category": "คอนโดมิเนียมกรีนลักชัวรีระดับพรีเมียม",
    "categoryColor": "#059669",
    "developer": "Siam Sindhorn",
    "developerSite": "https://www.siamsindhorn.com/",
    "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#065F46",
    "color": "#064E3B",
    "height": 125,
    "floors": 35,
    "units": 200,
    "unitsPerFloor": 6,
    "parking": 400,
    "parkingRatio": "200%",
    "landRai": 4.1,
    "facilitiesM2": "Sindhorn Village Park & Ozone Pool",
    "priceRange": "฿24M – ฿95M",
    "district": "ปทุมวัน",
    "location": "ถ.หลังสวน ใกล้สวนลุมพินี",
    "lat": 13.7362,
    "lon": 100.5422,
    "desc": "โครงการที่พักอาศัยระดับซูเปอร์ลักชัวรีใจกลาง สินธร วิลเลจ อาณาจักรสีเขียวผืนใหญ่บนถนนหลังสวน ใกล้สวนลุมพินี",
    "footprint": [
      [
        100.54175,
        13.735876
      ],
      [
        100.54265,
        13.735876
      ],
      [
        100.54265,
        13.736524
      ],
      [
        100.54175,
        13.736524
      ],
      [
        100.54175,
        13.735876
      ]
    ],
    "parts": [
      {
        "name": "Sindhorn Residence Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 20,
        "min_height": 0,
        "footprint": [
          [
            100.54172,
            13.735854
          ],
          [
            100.54268,
            13.735854
          ],
          [
            100.54268,
            13.736546
          ],
          [
            100.54172,
            13.736546
          ],
          [
            100.54172,
            13.735854
          ]
        ]
      },
      {
        "name": "Sindhorn Residence Residential Tower",
        "color": "#064E3B",
        "height": 110,
        "min_height": 20,
        "footprint": [
          [
            100.54186,
            13.735955
          ],
          [
            100.54254,
            13.735955
          ],
          [
            100.54254,
            13.736445
          ],
          [
            100.54186,
            13.736445
          ],
          [
            100.54186,
            13.735955
          ]
        ]
      },
      {
        "name": "Sindhorn Residence Sky Facilities & Crown",
        "color": "#10B981",
        "height": 125,
        "min_height": 110,
        "footprint": [
          [
            100.54198,
            13.736042
          ],
          [
            100.54242,
            13.736042
          ],
          [
            100.54242,
            13.736358
          ],
          [
            100.54198,
            13.736358
          ],
          [
            100.54198,
            13.736042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "70.00 – 75.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "115.00 – 140.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "220.00 – 350.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS ชิดลม (E1)",
        "dist": "650 m",
        "type": "bts"
      },
      {
        "name": "MRT สีลม (BL26)",
        "dist": "850 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Velaa Sindhorn Village",
        "kind": "Lifestyle",
        "color": "#10B981",
        "lat": 13.7365,
        "lon": 100.5425,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "canapaya-residences",
    "name": "Canapaya Residences",
    "brandId": "canapaya",
    "brandName": "Canapaya Development",
    "category": "คอนโดมิเนียมซูเปอร์ลักชัวรีมารีน่า",
    "categoryColor": "#0284C7",
    "developer": "Canapaya",
    "developerSite": "https://www.canapaya.com/",
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 185,
    "floors": 57,
    "units": 224,
    "unitsPerFloor": 4,
    "parking": 314,
    "parkingRatio": "140%",
    "landRai": 4.2,
    "facilitiesM2": "Private Yacht Marina & River Infinity Pool",
    "priceRange": "฿16M – ฿120M",
    "district": "บางคอแหลม",
    "location": "ถ.พระราม 3 ติดแม่น้ำเจ้าพระยา",
    "lat": 13.6912,
    "lon": 100.5185,
    "desc": "คอนโดมิเนียมริมน้ำระดับซูเปอร์ลักชัวรีแห่งแรกที่มีคลับยอชต์และท่าจอดเรือ Marina ส่วนตัวริมแม่น้ำเจ้าพระยา",
    "footprint": [
      [
        100.51802,
        13.690854
      ],
      [
        100.51898,
        13.690854
      ],
      [
        100.51898,
        13.691546
      ],
      [
        100.51802,
        13.691546
      ],
      [
        100.51802,
        13.690854
      ]
    ],
    "parts": [
      {
        "name": "Canapaya Residences Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.51802,
            13.690854
          ],
          [
            100.51898,
            13.690854
          ],
          [
            100.51898,
            13.691546
          ],
          [
            100.51802,
            13.691546
          ],
          [
            100.51802,
            13.690854
          ]
        ]
      },
      {
        "name": "Canapaya Residences Residential Tower",
        "color": "#1E3A8A",
        "height": 163,
        "min_height": 26,
        "footprint": [
          [
            100.51816,
            13.690955
          ],
          [
            100.51884,
            13.690955
          ],
          [
            100.51884,
            13.691445
          ],
          [
            100.51816,
            13.691445
          ],
          [
            100.51816,
            13.690955
          ]
        ]
      },
      {
        "name": "Canapaya Residences Sky Facilities & Crown",
        "color": "#06B6D4",
        "height": 185,
        "min_height": 163,
        "footprint": [
          [
            100.51828,
            13.691042
          ],
          [
            100.51872,
            13.691042
          ],
          [
            100.51872,
            13.691358
          ],
          [
            100.51828,
            13.691358
          ],
          [
            100.51828,
            13.691042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "45.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "88.00 – 95.00 m²"
      },
      {
        "label": "Penthouse & Duplex",
        "size": "190.00 – 500.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BRT สะพานพระราม 9",
        "dist": "300 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Rama IX Bridge",
        "kind": "Landmark",
        "color": "#F59E0B",
        "lat": 13.689,
        "lon": 100.516,
        "dist": "400 m"
      }
    ]
  },
  {
    "id": "q-sukhumvit",
    "name": "Q Sukhumvit",
    "brandId": "qhouse",
    "brandName": "Q Houses",
    "category": "คอนโดมิเนียมซูเปอร์ลักชัวรีนานา",
    "categoryColor": "#78350F",
    "developer": "Quality Houses (QH)",
    "developerSite": "https://www.qh.co.th/",
    "image": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#78350F",
    "color": "#451A03",
    "height": 155,
    "floors": 42,
    "units": 273,
    "unitsPerFloor": 8,
    "parking": 382,
    "parkingRatio": "140%",
    "landRai": 3.2,
    "facilitiesM2": "360-degree Sky Pool & Private Lift",
    "priceRange": "฿28M – ฿140M",
    "district": "คลองเตย",
    "location": "สุขุมวิท 6 ติด BTS นานา (ทางออก 4)",
    "lat": 13.7405,
    "lon": 100.5532,
    "desc": "คอนโดมิเนียมระดับซูเปอร์ลักชัวรีติดทางขึ้น BTS นานา 0 ม. ลิฟต์ส่วนตัวทุกยูนิตและสระว่ายน้ำลอยฟ้าชมวิวมหานคร",
    "footprint": [
      [
        100.55278,
        13.740198
      ],
      [
        100.55362,
        13.740198
      ],
      [
        100.55362,
        13.740802
      ],
      [
        100.55278,
        13.740802
      ],
      [
        100.55278,
        13.740198
      ]
    ],
    "parts": [
      {
        "name": "Q Sukhumvit Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [
            100.55272,
            13.740154
          ],
          [
            100.55368,
            13.740154
          ],
          [
            100.55368,
            13.740846
          ],
          [
            100.55272,
            13.740846
          ],
          [
            100.55272,
            13.740154
          ]
        ]
      },
      {
        "name": "Q Sukhumvit Residential Tower",
        "color": "#451A03",
        "height": 136,
        "min_height": 25,
        "footprint": [
          [
            100.55286,
            13.740255
          ],
          [
            100.55354,
            13.740255
          ],
          [
            100.55354,
            13.740745
          ],
          [
            100.55286,
            13.740745
          ],
          [
            100.55286,
            13.740255
          ]
        ]
      },
      {
        "name": "Q Sukhumvit Sky Facilities & Crown",
        "color": "#EAB308",
        "height": 155,
        "min_height": 136,
        "footprint": [
          [
            100.55298,
            13.740342
          ],
          [
            100.55342,
            13.740342
          ],
          [
            100.55342,
            13.740658
          ],
          [
            100.55298,
            13.740658
          ],
          [
            100.55298,
            13.740342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "2 Bedrooms",
        "size": "92.00 – 115.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "147.00 – 350.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS นานา (E3)",
        "dist": "5 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Nana Plaza & Hyatt Regency",
        "kind": "Lifestyle",
        "color": "#F59E0B",
        "lat": 13.7395,
        "lon": 100.554,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "the-lofts-silom",
    "name": "The Lofts Silom",
    "brandId": "raimon",
    "brandName": "Raimon Land",
    "category": "คอนโดมิเนียมลอฟต์ซูเปอร์พรีเมียม",
    "categoryColor": "#78350F",
    "developer": "Raimon Land",
    "developerSite": "https://www.raimonland.com/",
    "image": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#78350F",
    "color": "#451A03",
    "height": 130,
    "floors": 37,
    "units": 268,
    "unitsPerFloor": 9,
    "parking": 204,
    "parkingRatio": "76%",
    "landRai": 2,
    "facilitiesM2": "High-ceiling Lofts & Green Sanctuary Pool",
    "priceRange": "฿8.5M – ฿38M",
    "district": "บางรัก",
    "location": "ซอยประมวญ (สีลม) ใกล้ BTS สุรศักดิ์",
    "lat": 13.7225,
    "lon": 100.5215,
    "desc": "คอนโดมิเนียมดีไซน์ลอฟต์เพดานสูงกลางซอยประมวญ ใกล้ รร.กรุงเทพคริสเตียน และ BTS สุรศักดิ์เพียง 400 ม.",
    "footprint": [
      [
        100.52108,
        13.722198
      ],
      [
        100.52192,
        13.722198
      ],
      [
        100.52192,
        13.722802
      ],
      [
        100.52108,
        13.722802
      ],
      [
        100.52108,
        13.722198
      ]
    ],
    "parts": [
      {
        "name": "The Lofts Silom Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 21,
        "min_height": 0,
        "footprint": [
          [
            100.52102,
            13.722154
          ],
          [
            100.52198,
            13.722154
          ],
          [
            100.52198,
            13.722846
          ],
          [
            100.52102,
            13.722846
          ],
          [
            100.52102,
            13.722154
          ]
        ]
      },
      {
        "name": "The Lofts Silom Residential Tower",
        "color": "#451A03",
        "height": 114,
        "min_height": 21,
        "footprint": [
          [
            100.52116,
            13.722255
          ],
          [
            100.52184,
            13.722255
          ],
          [
            100.52184,
            13.722745
          ],
          [
            100.52116,
            13.722745
          ],
          [
            100.52116,
            13.722255
          ]
        ]
      },
      {
        "name": "The Lofts Silom Sky Facilities & Crown",
        "color": "#38BDF8",
        "height": 130,
        "min_height": 114,
        "footprint": [
          [
            100.52128,
            13.722342
          ],
          [
            100.52172,
            13.722342
          ],
          [
            100.52172,
            13.722658
          ],
          [
            100.52128,
            13.722658
          ],
          [
            100.52128,
            13.722342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "High Ceiling Hybrid Studio",
        "size": "34.00 – 47.00 m²"
      },
      {
        "label": "1-2 Bedrooms Loft",
        "size": "56.00 – 113.00 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS สุรศักดิ์ (S5)",
        "dist": "400 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Bangkok Christian College",
        "kind": "School",
        "color": "#EC4899",
        "lat": 13.721,
        "lon": 100.5225,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "the-lofts-asoke",
    "name": "The Lofts Asoke",
    "brandId": "raimon",
    "brandName": "Raimon Land",
    "category": "คอนโดมิเนียมอินดัสเทรียลลักชัวรี",
    "categoryColor": "#78350F",
    "developer": "Raimon Land",
    "developerSite": "https://www.raimonland.com/",
    "image": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#78350F",
    "color": "#451A03",
    "height": 155,
    "floors": 45,
    "units": 211,
    "unitsPerFloor": 7,
    "parking": 211,
    "parkingRatio": "100%",
    "landRai": 1.9,
    "facilitiesM2": "Double Height Sky Gym & 45th Fl Pool",
    "priceRange": "฿9.5M – ฿42M",
    "district": "วัฒนา",
    "location": "ถ.อโศกมนตรี (สุขุมวิท 21) ใกล้ MRT เพชรบุรี",
    "lat": 13.7465,
    "lon": 100.563,
    "desc": "คอนโดมิเนียมสไตล์ Industrial Loft เพดานสูง โปร่ง โล่ง ใจกลางถนนอโศกมนตรี ห่าง MRT เพชรบุรีเพียง 200 ม.",
    "footprint": [
      [
        100.56258,
        13.746198
      ],
      [
        100.56342,
        13.746198
      ],
      [
        100.56342,
        13.746802
      ],
      [
        100.56258,
        13.746802
      ],
      [
        100.56258,
        13.746198
      ]
    ],
    "parts": [
      {
        "name": "The Lofts Asoke Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [
            100.56252,
            13.746154
          ],
          [
            100.56348,
            13.746154
          ],
          [
            100.56348,
            13.746846
          ],
          [
            100.56252,
            13.746846
          ],
          [
            100.56252,
            13.746154
          ]
        ]
      },
      {
        "name": "The Lofts Asoke Residential Tower",
        "color": "#451A03",
        "height": 136,
        "min_height": 25,
        "footprint": [
          [
            100.56266,
            13.746255
          ],
          [
            100.56334,
            13.746255
          ],
          [
            100.56334,
            13.746745
          ],
          [
            100.56266,
            13.746745
          ],
          [
            100.56266,
            13.746255
          ]
        ]
      },
      {
        "name": "The Lofts Asoke Sky Facilities & Crown",
        "color": "#F59E0B",
        "height": 155,
        "min_height": 136,
        "footprint": [
          [
            100.56278,
            13.746342
          ],
          [
            100.56322,
            13.746342
          ],
          [
            100.56322,
            13.746658
          ],
          [
            100.56278,
            13.746658
          ],
          [
            100.56278,
            13.746342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Loft",
        "size": "35.00 – 49.00 m²"
      },
      {
        "label": "2 Bedrooms Duplex",
        "size": "74.00 – 145.00 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT เพชรบุรี (BL21)",
        "dist": "200 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Singha Complex",
        "kind": "Lifestyle",
        "color": "#F59E0B",
        "lat": 13.7475,
        "lon": 100.563,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "siam-paragon",
    "name": "Siam Paragon",
    "brandId": "siampiwat",
    "brandName": "Siam Piwat",
    "category": "ศูนย์การค้าระดับโลก & แลนด์มาร์กสยาม",
    "categoryColor": "#7C3AED",
    "developer": "Siam Piwat & The Mall Group",
    "developerSite": "https://www.siamparagon.co.th/",
    "image": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#4C1D95",
    "color": "#3B0764",
    "height": 65,
    "floors": 10,
    "units": 0,
    "parking": 4000,
    "parkingRatio": "Commercial",
    "landRai": 50,
    "facilitiesM2": "World-Class Luxury Retail & SEA LIFE Aquarium",
    "priceRange": "Global Luxury Destination",
    "district": "ปทุมวัน",
    "location": "ถ.พระราม 1 ติด BTS สยาม",
    "lat": 13.7462,
    "lon": 100.5348,
    "desc": "อภิมหาศูนย์การค้าระดับโลกใจกลางกรุงเทพมหานคร ศูนย์รวมแบรนด์เนมลักชัวรีชั้นนำระดับโลกและ Sea Life Bangkok",
    "footprint": [
      [
        100.5342,
        13.745768
      ],
      [
        100.5354,
        13.745768
      ],
      [
        100.5354,
        13.746632
      ],
      [
        100.5342,
        13.746632
      ],
      [
        100.5342,
        13.745768
      ]
    ],
    "parts": [
      {
        "name": "Siam Paragon Podium & Parking (Fl 1-6)",
        "color": "#1E293B",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [
            100.53432,
            13.745854
          ],
          [
            100.53528,
            13.745854
          ],
          [
            100.53528,
            13.746546
          ],
          [
            100.53432,
            13.746546
          ],
          [
            100.53432,
            13.745854
          ]
        ]
      },
      {
        "name": "Siam Paragon Residential Tower",
        "color": "#3B0764",
        "height": 57,
        "min_height": 16,
        "footprint": [
          [
            100.53446,
            13.745955
          ],
          [
            100.53514,
            13.745955
          ],
          [
            100.53514,
            13.746445
          ],
          [
            100.53446,
            13.746445
          ],
          [
            100.53446,
            13.745955
          ]
        ]
      },
      {
        "name": "Siam Paragon Sky Facilities & Crown",
        "color": "#EAB308",
        "height": 65,
        "min_height": 57,
        "footprint": [
          [
            100.53458,
            13.746042
          ],
          [
            100.53502,
            13.746042
          ],
          [
            100.53502,
            13.746358
          ],
          [
            100.53458,
            13.746358
          ],
          [
            100.53458,
            13.746042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "World-Class Retail Mall",
        "size": "500,000 m²"
      }
    ],
    "transport": [
      {
        "name": "BTS สยาม (CEN)",
        "dist": "20 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Siam Center",
        "kind": "Shopping",
        "color": "#EC4899",
        "lat": 13.7465,
        "lon": 100.5325,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "the-residences-montazure",
    "name": "The Residences at MontAzure",
    "brandId": "other",
    "brandName": "MontAzure & Twinpalms",
    "category": "บีชฟรอนต์ลักชัวรีเรสซิเดนซ์ริมหาดกมลา",
    "categoryColor": "#0284C7",
    "developer": "MontAzure",
    "developerSite": "https://montazure.com/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 35,
    "floors": 5,
    "units": 75,
    "unitsPerFloor": 6,
    "parking": 100,
    "parkingRatio": "133%",
    "landRai": 45,
    "facilitiesM2": "Kamala Beach Club & Private Lagoon Pool",
    "priceRange": "฿18M – ฿130M",
    "district": "กะทู้ (ภูเก็ต)",
    "location": "หาดกมลา ต.กมลา อ.กะทู้ จ.ภูเก็ต",
    "lat": 7.9625,
    "lon": 98.2785,
    "desc": "เรสซิเดนซ์ระดับลักชัวรีติดชายหาดกมลา ผืนดินติดทะเลผืนสุดท้าย บริหารงานมาตรฐานโรงแรมหรู Twinpalms พร้อมบีชคลับระดับโลก",
    "footprint": [
      [
        98.27795,
        7.962104
      ],
      [
        98.27905,
        7.962104
      ],
      [
        98.27905,
        7.962896
      ],
      [
        98.27795,
        7.962896
      ],
      [
        98.27795,
        7.962104
      ]
    ],
    "parts": [
      {
        "name": "MontAzure Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            98.278,
            7.96214
          ],
          [
            98.279,
            7.96214
          ],
          [
            98.279,
            7.96286
          ],
          [
            98.278,
            7.96286
          ],
          [
            98.278,
            7.96214
          ]
        ]
      },
      {
        "name": "MontAzure Main Structure",
        "color": "#1E3A8A",
        "height": 31,
        "min_height": 14,
        "footprint": [
          [
            98.27815,
            7.962248
          ],
          [
            98.27885,
            7.962248
          ],
          [
            98.27885,
            7.962752
          ],
          [
            98.27815,
            7.962752
          ],
          [
            98.27815,
            7.962248
          ]
        ]
      },
      {
        "name": "MontAzure Crown & Sky Deck",
        "color": "#06B6D4",
        "height": 35,
        "min_height": 31,
        "footprint": [
          [
            98.27828,
            7.962342
          ],
          [
            98.27872,
            7.962342
          ],
          [
            98.27872,
            7.962658
          ],
          [
            98.27828,
            7.962658
          ],
          [
            98.27828,
            7.962342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Beachside",
        "size": "70.00 – 120.00 m²"
      },
      {
        "label": "2 Bedrooms Beachfront",
        "size": "150.00 – 250.00 m²"
      },
      {
        "label": "Private Penthouse with Pool",
        "size": "300.00 – 600.00 m²"
      }
    ],
    "transport": [
      {
        "name": "สนามบินนานาชาติภูเก็ต (HKT)",
        "dist": "25 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Cafe Del Mar Phuket",
        "kind": "Beach Club",
        "color": "#F59E0B",
        "lat": 7.963,
        "lon": 98.279,
        "dist": "100 m"
      },
      {
        "name": "Phuket FantaSea",
        "kind": "Theme Park",
        "color": "#EC4899",
        "lat": 7.9575,
        "lon": 98.2865,
        "dist": "950 m"
      }
    ]
  },
  {
    "id": "layan-residences-anantara",
    "name": "Layan Residences by Anantara",
    "brandId": "other",
    "brandName": "Minor International",
    "category": "วิลล่าระดับอัลตราลักชัวรีวิวอันดามัน",
    "categoryColor": "#059669",
    "developer": "Minor International",
    "developerSite": "https://www.anantara.com/",
    "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#065F46",
    "color": "#064E3B",
    "height": 25,
    "floors": 3,
    "units": 15,
    "unitsPerFloor": 1,
    "parking": 45,
    "parkingRatio": "300%",
    "landRai": 25,
    "facilitiesM2": "Private 21m Infinity Pool & Personal Butler",
    "priceRange": "฿120M – ฿450M",
    "district": "ถลาง (ภูเก็ต)",
    "location": "หาดลายัน ต.เชิงทะเล อ.ถลาง จ.ภูเก็ต",
    "lat": 8.0315,
    "lon": 98.2985,
    "desc": "ที่สุดของวิลล่าตากอากาศระดับซูเปอร์อัลตราลักชัวรีบนเนินเขาเหนือหาดลายัน วิวพาโนรามาทะเลอันดามันแบบ 180 องศา พร้อมบัตเลอร์และเชฟส่วนตัว 24 ชม.",
    "footprint": [
      [
        98.2979,
        8.031068
      ],
      [
        98.2991,
        8.031068
      ],
      [
        98.2991,
        8.031932
      ],
      [
        98.2979,
        8.031932
      ],
      [
        98.2979,
        8.031068
      ]
    ],
    "parts": [
      {
        "name": "Layan Residences Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            98.298,
            8.03114
          ],
          [
            98.299,
            8.03114
          ],
          [
            98.299,
            8.03186
          ],
          [
            98.298,
            8.03186
          ],
          [
            98.298,
            8.03114
          ]
        ]
      },
      {
        "name": "Layan Residences Main Structure",
        "color": "#064E3B",
        "height": 22,
        "min_height": 14,
        "footprint": [
          [
            98.29815,
            8.031248
          ],
          [
            98.29885,
            8.031248
          ],
          [
            98.29885,
            8.031752
          ],
          [
            98.29815,
            8.031752
          ],
          [
            98.29815,
            8.031248
          ]
        ]
      },
      {
        "name": "Layan Residences Crown & Sky Deck",
        "color": "#EAB308",
        "height": 25,
        "min_height": 22,
        "footprint": [
          [
            98.29828,
            8.031342
          ],
          [
            98.29872,
            8.031342
          ],
          [
            98.29872,
            8.031658
          ],
          [
            98.29828,
            8.031658
          ],
          [
            98.29828,
            8.031342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "3-8 Bedrooms Grand Pool Villa",
        "size": "1,100 – 2,600 m²"
      }
    ],
    "transport": [
      {
        "name": "สนามบินภูเก็ต (HKT)",
        "dist": "15 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Anantara Layan Phuket Resort",
        "kind": "5-Star Hotel",
        "color": "#F59E0B",
        "lat": 8.03,
        "lon": 98.299,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "the-deck-patong",
    "name": "The Deck Patong",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมรีสอร์ตใจกลางหาดป่าตอง",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 30,
    "floors": 7,
    "units": 270,
    "unitsPerFloor": 20,
    "parking": 135,
    "parkingRatio": "50%",
    "landRai": 5.2,
    "facilitiesM2": "Dual Pools & Rooftop Sea View Deck",
    "priceRange": "฿4.8M – ฿15M",
    "district": "กะทู้ (ภูเก็ต)",
    "location": "ถ.ราษฎร์อุทิศ 200 ปี หาดป่าตอง จ.ภูเก็ต",
    "lat": 7.9015,
    "lon": 98.2992,
    "desc": "คอนโดมิเนียมสไตล์รีสอร์ตห่างชายหาดป่าตองเพียง 500 ม. โดดเด่นด้วยสระว่ายน้ำบนชั้นดาดฟ้าชมวิวพระอาทิตย์ตกดินเหนืออ่าวป่าตอง",
    "footprint": [
      [
        98.29875,
        7.901176
      ],
      [
        98.29965,
        7.901176
      ],
      [
        98.29965,
        7.901824
      ],
      [
        98.29875,
        7.901824
      ],
      [
        98.29875,
        7.901176
      ]
    ],
    "parts": [
      {
        "name": "The Deck Patong Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            98.2987,
            7.90114
          ],
          [
            98.2997,
            7.90114
          ],
          [
            98.2997,
            7.90186
          ],
          [
            98.2987,
            7.90186
          ],
          [
            98.2987,
            7.90114
          ]
        ]
      },
      {
        "name": "The Deck Patong Main Structure",
        "color": "#166534",
        "height": 26,
        "min_height": 14,
        "footprint": [
          [
            98.29885,
            7.901248
          ],
          [
            98.29955,
            7.901248
          ],
          [
            98.29955,
            7.901752
          ],
          [
            98.29885,
            7.901752
          ],
          [
            98.29885,
            7.901248
          ]
        ]
      },
      {
        "name": "The Deck Patong Crown & Sky Deck",
        "color": "#38BDF8",
        "height": 30,
        "min_height": 26,
        "footprint": [
          [
            98.29898,
            7.901342
          ],
          [
            98.29942,
            7.901342
          ],
          [
            98.29942,
            7.901658
          ],
          [
            98.29898,
            7.901658
          ],
          [
            98.29898,
            7.901342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "29.00 – 38.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "40.50 – 50.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "63.00 – 75.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Patong Beach",
        "dist": "500 m",
        "type": "walk"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Jungceylon Shopping Center",
        "kind": "Mall",
        "color": "#F59E0B",
        "lat": 7.892,
        "lon": 98.3,
        "dist": "950 m"
      }
    ]
  },
  {
    "id": "the-base-height-phuket",
    "name": "The Base Height Phuket",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมไฮไรส์ใจกลางเมืองภูเก็ต",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#15803D",
    "height": 55,
    "floors": 14,
    "units": 358,
    "unitsPerFloor": 26,
    "parking": 180,
    "parkingRatio": "50%",
    "landRai": 2.3,
    "facilitiesM2": "Rooftop Sky Pool & Sino-Portuguese Style",
    "priceRange": "฿2.9M – ฿7.5M",
    "district": "เมืองภูเก็ต",
    "location": "ถ.เยาวราช ต.ตลาดใหญ่ อ.เมือง จ.ภูเก็ต",
    "lat": 7.9025,
    "lon": 98.3785,
    "desc": "คอนโดมิเนียมผสานสถาปัตยกรรมชิโนโปรตุกีสใจกลางเมืองภูเก็ต วิวเมืองเก่าภูเก็ตและสระว่ายน้ำลอยฟ้าชั้น 14",
    "footprint": [
      [
        98.37808,
        7.902198
      ],
      [
        98.37892,
        7.902198
      ],
      [
        98.37892,
        7.902802
      ],
      [
        98.37808,
        7.902802
      ],
      [
        98.37808,
        7.902198
      ]
    ],
    "parts": [
      {
        "name": "The Base Height Phuket Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            98.378,
            7.90214
          ],
          [
            98.379,
            7.90214
          ],
          [
            98.379,
            7.90286
          ],
          [
            98.378,
            7.90286
          ],
          [
            98.378,
            7.90214
          ]
        ]
      },
      {
        "name": "The Base Height Phuket Main Structure",
        "color": "#15803D",
        "height": 48,
        "min_height": 14,
        "footprint": [
          [
            98.37815,
            7.902248
          ],
          [
            98.37885,
            7.902248
          ],
          [
            98.37885,
            7.902752
          ],
          [
            98.37815,
            7.902752
          ],
          [
            98.37815,
            7.902248
          ]
        ]
      },
      {
        "name": "The Base Height Phuket Crown & Sky Deck",
        "color": "#F59E0B",
        "height": 55,
        "min_height": 48,
        "footprint": [
          [
            98.37828,
            7.902342
          ],
          [
            98.37872,
            7.902342
          ],
          [
            98.37872,
            7.902658
          ],
          [
            98.37828,
            7.902658
          ],
          [
            98.37828,
            7.902342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "29.00 – 34.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "56.00 – 57.50 m²"
      }
    ],
    "transport": [
      {
        "name": "Phuket Old Town",
        "dist": "1.2 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Bangkok Hospital Phuket",
        "kind": "Hospital",
        "color": "#DC2626",
        "lat": 7.9075,
        "lon": 98.376,
        "dist": "650 m"
      }
    ]
  },
  {
    "id": "laguna-seaside-phuket",
    "name": "Laguna Seaside Residences",
    "brandId": "other",
    "brandName": "Banyan Tree Group",
    "category": "คอนโดมิเนียมริมหาดบางเทา",
    "categoryColor": "#059669",
    "developer": "Laguna Resorts & Banyan Tree",
    "developerSite": "https://www.lagunaphuket.com/",
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#065F46",
    "color": "#064E3B",
    "height": 32,
    "floors": 7,
    "units": 140,
    "unitsPerFloor": 20,
    "parking": 100,
    "parkingRatio": "71%",
    "landRai": 6.2,
    "facilitiesM2": "Rooftop Pool & Sanctuary Club Card",
    "priceRange": "฿9.5M – ฿42M",
    "district": "ถลาง (ภูเก็ต)",
    "location": "หาดบางเทา ลากูน่า ภูเก็ต จ.ภูเก็ต",
    "lat": 8.0025,
    "lon": 98.2942,
    "desc": "คอนโดมิเนียมระดับพรีเมียมติดหาดบางเทาในอาณาจักรลากูน่า ภูเก็ต สิทธิพิเศษ The Sanctuary Club พักผ่อนทั่วโลกในเครือบันยันทรี",
    "footprint": [
      [
        98.29375,
        8.002176
      ],
      [
        98.29465,
        8.002176
      ],
      [
        98.29465,
        8.002824
      ],
      [
        98.29375,
        8.002824
      ],
      [
        98.29375,
        8.002176
      ]
    ],
    "parts": [
      {
        "name": "Laguna Seaside Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            98.2937,
            8.00214
          ],
          [
            98.2947,
            8.00214
          ],
          [
            98.2947,
            8.00286
          ],
          [
            98.2937,
            8.00286
          ],
          [
            98.2937,
            8.00214
          ]
        ]
      },
      {
        "name": "Laguna Seaside Main Structure",
        "color": "#064E3B",
        "height": 28,
        "min_height": 14,
        "footprint": [
          [
            98.29385,
            8.002248
          ],
          [
            98.29455,
            8.002248
          ],
          [
            98.29455,
            8.002752
          ],
          [
            98.29385,
            8.002752
          ],
          [
            98.29385,
            8.002248
          ]
        ]
      },
      {
        "name": "Laguna Seaside Crown & Sky Deck",
        "color": "#10B981",
        "height": 32,
        "min_height": 28,
        "footprint": [
          [
            98.29398,
            8.002342
          ],
          [
            98.29442,
            8.002342
          ],
          [
            98.29442,
            8.002658
          ],
          [
            98.29398,
            8.002658
          ],
          [
            98.29398,
            8.002342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "60.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "99.00 m²"
      },
      {
        "label": "3 Bedrooms & Penthouse",
        "size": "119.00 – 145.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Laguna Golf Phuket",
        "dist": "1.0 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Boat Avenue Cherngtalay",
        "kind": "Lifestyle",
        "color": "#F59E0B",
        "lat": 7.994,
        "lon": 98.3075,
        "dist": "1.8 km"
      }
    ]
  },
  {
    "id": "so-origin-kata-phuket",
    "name": "SO Origin Kata Phuket",
    "brandId": "origin",
    "brandName": "Origin Property",
    "category": "คอนโดมิเนียมสไตล์มัลดีฟส์วิวทะเลกะตะ",
    "categoryColor": "#F97316",
    "developer": "Origin Property",
    "developerSite": "https://www.origin.co.th/",
    "image": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 35,
    "floors": 8,
    "units": 686,
    "unitsPerFloor": 28,
    "parking": 240,
    "parkingRatio": "35%",
    "landRai": 6.2,
    "facilitiesM2": "Cliff Top Lagoon Pool & Ocean Sunset Deck",
    "priceRange": "฿3.9M – ฿12M",
    "district": "เมืองภูเก็ต",
    "location": "หาดกะตะ ต.กะรน อ.เมือง จ.ภูเก็ต",
    "lat": 7.8215,
    "lon": 98.3042,
    "desc": "คอนโดมิเนียมสไตล์รีสอร์ตบนเนินเขาหาดกะตะ วิวอ่าวกะตะแบบพาโนรามา สระว่ายน้ำเล่นระดับแบบ Cliff Pool",
    "footprint": [
      [
        98.30375,
        7.821176
      ],
      [
        98.30465,
        7.821176
      ],
      [
        98.30465,
        7.821824
      ],
      [
        98.30375,
        7.821824
      ],
      [
        98.30375,
        7.821176
      ]
    ],
    "parts": [
      {
        "name": "SO Origin Kata Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            98.3037,
            7.82114
          ],
          [
            98.3047,
            7.82114
          ],
          [
            98.3047,
            7.82186
          ],
          [
            98.3037,
            7.82186
          ],
          [
            98.3037,
            7.82114
          ]
        ]
      },
      {
        "name": "SO Origin Kata Main Structure",
        "color": "#C2410C",
        "height": 31,
        "min_height": 14,
        "footprint": [
          [
            98.30385,
            7.821248
          ],
          [
            98.30455,
            7.821248
          ],
          [
            98.30455,
            7.821752
          ],
          [
            98.30385,
            7.821752
          ],
          [
            98.30385,
            7.821248
          ]
        ]
      },
      {
        "name": "SO Origin Kata Crown & Sky Deck",
        "color": "#38BDF8",
        "height": 35,
        "min_height": 31,
        "footprint": [
          [
            98.30398,
            7.821342
          ],
          [
            98.30442,
            7.821342
          ],
          [
            98.30442,
            7.821658
          ],
          [
            98.30398,
            7.821658
          ],
          [
            98.30398,
            7.821342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "26.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "32.00 – 36.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Kata Beach",
        "dist": "650 m",
        "type": "walk"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Kata Night Market",
        "kind": "Market",
        "color": "#F59E0B",
        "lat": 7.823,
        "lon": 98.303,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "central-phuket-floresta",
    "name": "Central Phuket Floresta & Aquaria",
    "brandId": "cpn",
    "brandName": "CPN / Central",
    "category": "เมกะลักชัวรีมอลล์ & อควาเรียมระดับโลก",
    "categoryColor": "#D97706",
    "developer": "Central Pattana (CPN)",
    "developerSite": "https://www.centralpattana.co.th/",
    "image": "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#D97706",
    "color": "#B45309",
    "height": 45,
    "floors": 6,
    "units": 0,
    "parking": 3500,
    "parkingRatio": "Commercial",
    "landRai": 111,
    "facilitiesM2": "Aquaria Phuket & World-class Luxury Pavilion",
    "priceRange": "World Luxury Destination",
    "district": "เมืองภูเก็ต",
    "location": "สี่แยกดาราสมุทร ถ.วิชิตสงคราม เมืองภูเก็ต",
    "lat": 7.8915,
    "lon": 98.3685,
    "desc": "อัครศูนย์การค้าระดับโลกใจกลางเกาะภูเก็ต รวมแบรนด์ลักชัวรีชั้นนำระดับโลกและพิพิธภัณฑ์สัตว์น้ำ Aquaria Phuket ที่ใหญ่ที่สุดในไทย",
    "footprint": [
      [
        98.3679,
        7.891068
      ],
      [
        98.3691,
        7.891068
      ],
      [
        98.3691,
        7.891932
      ],
      [
        98.3679,
        7.891932
      ],
      [
        98.3679,
        7.891068
      ]
    ],
    "parts": [
      {
        "name": "Central Phuket Floresta Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            98.368,
            7.89114
          ],
          [
            98.369,
            7.89114
          ],
          [
            98.369,
            7.89186
          ],
          [
            98.368,
            7.89186
          ],
          [
            98.368,
            7.89114
          ]
        ]
      },
      {
        "name": "Central Phuket Floresta Main Structure",
        "color": "#B45309",
        "height": 40,
        "min_height": 14,
        "footprint": [
          [
            98.36815,
            7.891248
          ],
          [
            98.36885,
            7.891248
          ],
          [
            98.36885,
            7.891752
          ],
          [
            98.36815,
            7.891752
          ],
          [
            98.36815,
            7.891248
          ]
        ]
      },
      {
        "name": "Central Phuket Floresta Crown & Sky Deck",
        "color": "#06B6D4",
        "height": 45,
        "min_height": 40,
        "footprint": [
          [
            98.36828,
            7.891342
          ],
          [
            98.36872,
            7.891342
          ],
          [
            98.36872,
            7.891658
          ],
          [
            98.36828,
            7.891658
          ],
          [
            98.36828,
            7.891342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "World-Class Retail Mall",
        "size": "400,000 m²"
      }
    ],
    "transport": [
      {
        "name": "Phuket Town",
        "dist": "3.5 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Andamanda Phuket",
        "kind": "Waterpark",
        "color": "#3B82F6",
        "lat": 7.899,
        "lon": 98.362,
        "dist": "1.2 km"
      }
    ]
  },
  {
    "id": "arom-wongamat",
    "name": "Arom Wongamat Pattaya",
    "brandId": "other",
    "brandName": "Colours Development",
    "category": "คอนโดมิเนียมซูเปอร์ลักชัวรีติดหาดวงศ์อมาตย์",
    "categoryColor": "#0284C7",
    "developer": "Colours Development & Apus",
    "developerSite": "https://www.aromwongamat.com/",
    "image": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 204,
    "floors": 55,
    "units": 319,
    "unitsPerFloor": 7,
    "parking": 175,
    "parkingRatio": "55%",
    "landRai": 3.3,
    "facilitiesM2": "Direct Beachfront Access & 54th Fl Sky Infinity Pool",
    "priceRange": "฿6.2M – ฿45M",
    "district": "บางละมุง (พัทยา)",
    "location": "หาดวงศ์อมาตย์ ซอยนาเกลือ 16 พัทยา จ.ชลบุรี",
    "lat": 12.9645,
    "lon": 100.8845,
    "desc": "ที่สุดของคอนโดมิเนียมริมหาดผืนสุดท้ายบนหาดวงศ์อมาตย์ พัทยา วิวทะเลพาโนรามาทุกห้อง พร้อมสระว่ายน้ำลอยฟ้าชั้น 54 และบีชคลับส่วนตัว",
    "footprint": [
      [
        100.88405,
        12.964176
      ],
      [
        100.88495,
        12.964176
      ],
      [
        100.88495,
        12.964824
      ],
      [
        100.88405,
        12.964824
      ],
      [
        100.88405,
        12.964176
      ]
    ],
    "parts": [
      {
        "name": "Arom Wongamat Podium & Grounds",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.884,
            12.96414
          ],
          [
            100.885,
            12.96414
          ],
          [
            100.885,
            12.96486
          ],
          [
            100.884,
            12.96486
          ],
          [
            100.884,
            12.96414
          ]
        ]
      },
      {
        "name": "Arom Wongamat Main Structure",
        "color": "#1E3A8A",
        "height": 180,
        "min_height": 26,
        "footprint": [
          [
            100.88415,
            12.964248
          ],
          [
            100.88485,
            12.964248
          ],
          [
            100.88485,
            12.964752
          ],
          [
            100.88415,
            12.964752
          ],
          [
            100.88415,
            12.964248
          ]
        ]
      },
      {
        "name": "Arom Wongamat Crown & Sky Deck",
        "color": "#38BDF8",
        "height": 204,
        "min_height": 180,
        "footprint": [
          [
            100.88428,
            12.964342
          ],
          [
            100.88472,
            12.964342
          ],
          [
            100.88472,
            12.964658
          ],
          [
            100.88428,
            12.964658
          ],
          [
            100.88428,
            12.964342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Beachfront",
        "size": "37.50 – 63.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "81.00 – 87.00 m²"
      },
      {
        "label": "Penthouse with Private Pool",
        "size": "200.00 – 210.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Terminal 21 Pattaya",
        "dist": "2.5 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Sanctuary of Truth",
        "kind": "Heritage",
        "color": "#D97706",
        "lat": 12.9725,
        "lon": 100.889,
        "dist": "1.2 km"
      }
    ]
  },
  {
    "id": "copacabana-beach-jomtien",
    "name": "Copacabana Beach Jomtien",
    "brandId": "other",
    "brandName": "Copacabana Jomtien",
    "category": "คอนโดมิเนียมไฮไรส์สูง 59 ชั้นติดหาดจอมเทียน",
    "categoryColor": "#0284C7",
    "developer": "Copacabana Jomtien",
    "developerSite": "https://www.copacabanajomtien.com/",
    "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 220,
    "floors": 59,
    "units": 1644,
    "unitsPerFloor": 32,
    "parking": 500,
    "parkingRatio": "30%",
    "landRai": 9.1,
    "facilitiesM2": "4 High-level Swimming Pools & Beach Club",
    "priceRange": "฿4.2M – ฿32M",
    "district": "บางละมุง (พัทยา)",
    "location": "ถนนเลียบหาดจอมเทียน พัทยา จ.ชลบุรี",
    "lat": 12.8845,
    "lon": 100.8785,
    "desc": "ตึกสูงระฟ้า 59 ชั้น ติดหาดจอมเทียนเพียงข้ามถนน โดดเด่นด้วยสระว่ายน้ำลอยฟ้า 4 ชั้น และคลับเฮาส์ริมทะเลสไตล์โคปาคาบานา",
    "footprint": [
      [
        100.87802,
        12.884154
      ],
      [
        100.87898,
        12.884154
      ],
      [
        100.87898,
        12.884846
      ],
      [
        100.87802,
        12.884846
      ],
      [
        100.87802,
        12.884154
      ]
    ],
    "parts": [
      {
        "name": "Copacabana Beach Podium & Grounds",
        "color": "#1E293B",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [
            100.878,
            12.88414
          ],
          [
            100.879,
            12.88414
          ],
          [
            100.879,
            12.88486
          ],
          [
            100.878,
            12.88486
          ],
          [
            100.878,
            12.88414
          ]
        ]
      },
      {
        "name": "Copacabana Beach Main Structure",
        "color": "#1E3A8A",
        "height": 194,
        "min_height": 26,
        "footprint": [
          [
            100.87815,
            12.884248
          ],
          [
            100.87885,
            12.884248
          ],
          [
            100.87885,
            12.884752
          ],
          [
            100.87815,
            12.884752
          ],
          [
            100.87815,
            12.884248
          ]
        ]
      },
      {
        "name": "Copacabana Beach Crown & Sky Deck",
        "color": "#F59E0B",
        "height": 220,
        "min_height": 194,
        "footprint": [
          [
            100.87828,
            12.884342
          ],
          [
            100.87872,
            12.884342
          ],
          [
            100.87872,
            12.884658
          ],
          [
            100.87828,
            12.884658
          ],
          [
            100.87828,
            12.884342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Sea View",
        "size": "29.00 – 39.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "64.00 – 72.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Jomtien Beach Road",
        "dist": "20 m",
        "type": "walk"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Jomtien Night Market",
        "kind": "Night Market",
        "color": "#F59E0B",
        "lat": 12.887,
        "lon": 100.8805,
        "dist": "300 m"
      }
    ]
  },
  {
    "id": "edge-central-pattaya",
    "name": "Edge Central Pattaya",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมไฮไรส์ใจกลางพัทยา",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 110,
    "floors": 31,
    "units": 603,
    "unitsPerFloor": 22,
    "parking": 198,
    "parkingRatio": "33%",
    "landRai": 2,
    "facilitiesM2": "Champagne Gold Pool 31st Fl & Sunset Deck",
    "priceRange": "฿3.9M – ฿16M",
    "district": "บางละมุง (พัทยา)",
    "location": "พัทยาสาย 2 ใกล้เซ็นทรัลพัทยา จ.ชลบุรี",
    "lat": 12.9325,
    "lon": 100.8815,
    "desc": "คอนโดมิเนียมใจกลางพัทยา ห่างชายหาดพัทยาและ Central Festival Pattaya เพียง 300 ม. สระว่ายน้ำสีแชมเปญโกลด์ชั้น 31 วิวพาโนรามา",
    "footprint": [
      [
        100.88108,
        12.932198
      ],
      [
        100.88192,
        12.932198
      ],
      [
        100.88192,
        12.932802
      ],
      [
        100.88108,
        12.932802
      ],
      [
        100.88108,
        12.932198
      ]
    ],
    "parts": [
      {
        "name": "Edge Central Pattaya Podium & Grounds",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.881,
            12.93214
          ],
          [
            100.882,
            12.93214
          ],
          [
            100.882,
            12.93286
          ],
          [
            100.881,
            12.93286
          ],
          [
            100.881,
            12.93214
          ]
        ]
      },
      {
        "name": "Edge Central Pattaya Main Structure",
        "color": "#166534",
        "height": 97,
        "min_height": 18,
        "footprint": [
          [
            100.88115,
            12.932248
          ],
          [
            100.88185,
            12.932248
          ],
          [
            100.88185,
            12.932752
          ],
          [
            100.88115,
            12.932752
          ],
          [
            100.88115,
            12.932248
          ]
        ]
      },
      {
        "name": "Edge Central Pattaya Crown & Sky Deck",
        "color": "#EAB308",
        "height": 110,
        "min_height": 97,
        "footprint": [
          [
            100.88128,
            12.932342
          ],
          [
            100.88172,
            12.932342
          ],
          [
            100.88172,
            12.932658
          ],
          [
            100.88128,
            12.932658
          ],
          [
            100.88128,
            12.932342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "26.00 – 33.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "48.25 – 60.25 m²"
      }
    ],
    "transport": [
      {
        "name": "Pattaya Beach",
        "dist": "300 m",
        "type": "walk"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Pattaya",
        "kind": "Shopping Mall",
        "color": "#D97706",
        "lat": 12.9345,
        "lon": 100.883,
        "dist": "250 m"
      }
    ]
  },
  {
    "id": "riviera-wongamat",
    "name": "The Riviera Wongamat Beach",
    "brandId": "other",
    "brandName": "The Riviera Group",
    "category": "คอนโดมิเนียมหรูสไตล์รีสอร์ตวงศ์อมาตย์",
    "categoryColor": "#0284C7",
    "developer": "The Riviera Group",
    "developerSite": "https://therivieragroup.com/",
    "image": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 155,
    "floors": 43,
    "units": 979,
    "unitsPerFloor": 24,
    "parking": 350,
    "parkingRatio": "36%",
    "landRai": 8.2,
    "facilitiesM2": "Lagoon Swimming Pool & Tropical Garden",
    "priceRange": "฿4.5M – ฿28M",
    "district": "บางละมุง (พัทยา)",
    "location": "ซอยนาเกลือ 16 หาดวงศ์อมาตย์ พัทยา จ.ชลบุรี",
    "lat": 12.9615,
    "lon": 100.8868,
    "desc": "คอนโดมิเนียมตึกคู่หรูระดับรางวัล ออกแบบในคอนเซ็ปต์ Modern Glamour พร้อมสระว่ายน้ำทะเลเทียมขนาดใหญ่และสวนเขตร้อน",
    "footprint": [
      [
        100.88635,
        12.961176
      ],
      [
        100.88725,
        12.961176
      ],
      [
        100.88725,
        12.961824
      ],
      [
        100.88635,
        12.961824
      ],
      [
        100.88635,
        12.961176
      ]
    ],
    "parts": [
      {
        "name": "Riviera Wongamat Podium & Grounds",
        "color": "#1E293B",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [
            100.8863,
            12.96114
          ],
          [
            100.8873,
            12.96114
          ],
          [
            100.8873,
            12.96186
          ],
          [
            100.8863,
            12.96186
          ],
          [
            100.8863,
            12.96114
          ]
        ]
      },
      {
        "name": "Riviera Wongamat Main Structure",
        "color": "#1E3A8A",
        "height": 136,
        "min_height": 25,
        "footprint": [
          [
            100.88645,
            12.961248
          ],
          [
            100.88715,
            12.961248
          ],
          [
            100.88715,
            12.961752
          ],
          [
            100.88645,
            12.961752
          ],
          [
            100.88645,
            12.961248
          ]
        ]
      },
      {
        "name": "Riviera Wongamat Crown & Sky Deck",
        "color": "#38BDF8",
        "height": 155,
        "min_height": 136,
        "footprint": [
          [
            100.88658,
            12.961342
          ],
          [
            100.88702,
            12.961342
          ],
          [
            100.88702,
            12.961658
          ],
          [
            100.88658,
            12.961658
          ],
          [
            100.88658,
            12.961342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "27.00 – 31.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "35.00 – 50.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "70.00 – 84.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Wongamat Beach",
        "dist": "200 m",
        "type": "walk"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Terminal 21 Pattaya",
        "kind": "Shopping Mall",
        "color": "#F59E0B",
        "lat": 12.95,
        "lon": 100.889,
        "dist": "1.8 km"
      }
    ]
  },
  {
    "id": "knightsbridge-ocean-sriracha",
    "name": "KnightsBridge The Ocean Sriracha",
    "brandId": "origin",
    "brandName": "Origin Property",
    "category": "คอนโดมิเนียมวิวภูเขาและทะเลศรีราชา",
    "categoryColor": "#F97316",
    "developer": "Origin Property",
    "developerSite": "https://www.origin.co.th/",
    "image": "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 135,
    "floors": 35,
    "units": 722,
    "unitsPerFloor": 22,
    "parking": 300,
    "parkingRatio": "42%",
    "landRai": 4.1,
    "facilitiesM2": "Japanese Tatami & Rooftop Sea View Onsen",
    "priceRange": "฿3.2M – ฿12M",
    "district": "ศรีราชา (ชลบุรี)",
    "location": "ถ.สุขุมวิท อ.ศรีราชา จ.ชลบุรี",
    "lat": 13.1515,
    "lon": 100.9195,
    "desc": "คอนโดมิเนียมไฮไรส์ดีไซน์ญี่ปุ่นริมถนนสุขุมวิท-ศรีราชา ด้านหลังติดภูเขา ด้านหน้าเห็นวิวทะเลอ่าวไทย พร้อมออนเซ็นลอยฟ้า",
    "footprint": [
      [
        100.91908,
        13.151198
      ],
      [
        100.91992,
        13.151198
      ],
      [
        100.91992,
        13.151802
      ],
      [
        100.91908,
        13.151802
      ],
      [
        100.91908,
        13.151198
      ]
    ],
    "parts": [
      {
        "name": "KnightsBridge Sriracha Podium & Grounds",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [
            100.919,
            13.15114
          ],
          [
            100.92,
            13.15114
          ],
          [
            100.92,
            13.15186
          ],
          [
            100.919,
            13.15186
          ],
          [
            100.919,
            13.15114
          ]
        ]
      },
      {
        "name": "KnightsBridge Sriracha Main Structure",
        "color": "#C2410C",
        "height": 119,
        "min_height": 22,
        "footprint": [
          [
            100.91915,
            13.151248
          ],
          [
            100.91985,
            13.151248
          ],
          [
            100.91985,
            13.151752
          ],
          [
            100.91915,
            13.151752
          ],
          [
            100.91915,
            13.151248
          ]
        ]
      },
      {
        "name": "KnightsBridge Sriracha Crown & Sky Deck",
        "color": "#38BDF8",
        "height": 135,
        "min_height": 119,
        "footprint": [
          [
            100.91928,
            13.151342
          ],
          [
            100.91972,
            13.151342
          ],
          [
            100.91972,
            13.151658
          ],
          [
            100.91928,
            13.151658
          ],
          [
            100.91928,
            13.151342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "28.00 – 34.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "54.00 – 62.00 m²"
      },
      {
        "label": "Duplex",
        "size": "58.00 – 100.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Robinson Sriracha",
        "dist": "1.5 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Samitivej Sriracha Hospital",
        "kind": "Hospital",
        "color": "#DC2626",
        "lat": 13.17,
        "lon": 100.925,
        "dist": "2.2 km"
      }
    ]
  },
  {
    "id": "dcondo-panaa-bangsaen",
    "name": "dcondo Panaa Bangsaen",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมรีสอร์ตใกล้ ม.บูรพา บางแสน",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 30,
    "floors": 8,
    "units": 541,
    "unitsPerFloor": 36,
    "parking": 180,
    "parkingRatio": "33%",
    "landRai": 4.1,
    "facilitiesM2": "Tropical Lagoon Pool & 24h Study Club",
    "priceRange": "฿1.8M – ฿4.5M",
    "district": "เมืองชลบุรี (บางแสน)",
    "location": "ถ.ลงหาดบางแสน ใกล้ ม.บูรพา จ.ชลบุรี",
    "lat": 13.2845,
    "lon": 100.9285,
    "desc": "คอนโดมิเนียมทำเลยอดฮิตของนักศึกษา ม.บูรพา และคนทำงานบางแสน เดินไปมหาวิทยาลัยและห้างแหลมทองเพียง 200 ม.",
    "footprint": [
      [
        100.92808,
        13.284198
      ],
      [
        100.92892,
        13.284198
      ],
      [
        100.92892,
        13.284802
      ],
      [
        100.92808,
        13.284802
      ],
      [
        100.92808,
        13.284198
      ]
    ],
    "parts": [
      {
        "name": "dcondo Panaa Bangsaen Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            100.928,
            13.28414
          ],
          [
            100.929,
            13.28414
          ],
          [
            100.929,
            13.28486
          ],
          [
            100.928,
            13.28486
          ],
          [
            100.928,
            13.28414
          ]
        ]
      },
      {
        "name": "dcondo Panaa Bangsaen Main Structure",
        "color": "#166534",
        "height": 26,
        "min_height": 14,
        "footprint": [
          [
            100.92815,
            13.284248
          ],
          [
            100.92885,
            13.284248
          ],
          [
            100.92885,
            13.284752
          ],
          [
            100.92815,
            13.284752
          ],
          [
            100.92815,
            13.284248
          ]
        ]
      },
      {
        "name": "dcondo Panaa Bangsaen Crown & Sky Deck",
        "color": "#10B981",
        "height": 30,
        "min_height": 26,
        "footprint": [
          [
            100.92828,
            13.284342
          ],
          [
            100.92872,
            13.284342
          ],
          [
            100.92872,
            13.284658
          ],
          [
            100.92828,
            13.284658
          ],
          [
            100.92828,
            13.284342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "26.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "32.00 – 34.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Bangsaen Beach",
        "dist": "1.5 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Burapha University",
        "kind": "University",
        "color": "#EC4899",
        "lat": 13.2825,
        "lon": 100.924,
        "dist": "300 m"
      }
    ]
  },
  {
    "id": "the-astra-sky-river",
    "name": "The Astra Sky River Chiang Mai",
    "brandId": "other",
    "brandName": "North Home",
    "category": "คอนโดมิเนียมลักชัวรีช้างคลาน เชียงใหม่",
    "categoryColor": "#78350F",
    "developer": "North Home",
    "developerSite": "https://theastracondo.com/",
    "image": "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#78350F",
    "color": "#451A03",
    "height": 65,
    "floors": 17,
    "units": 520,
    "unitsPerFloor": 32,
    "parking": 240,
    "parkingRatio": "46%",
    "landRai": 4.1,
    "facilitiesM2": "146m Longest Rooftop Infinity Pool in North",
    "priceRange": "฿3.8M – ฿18M",
    "district": "เมืองเชียงใหม่",
    "location": "ถ.ช้างคลาน ต.ช้างคลาน อ.เมือง จ.เชียงใหม่",
    "lat": 18.7715,
    "lon": 99.0012,
    "desc": "ไอคอนิกคอนโดมิเนียมบนถนนช้างคลาน โดดเด่นด้วยสระว่ายน้ำลอยฟ้าบนชั้น 17 ยาวถึง 146 เมตร ยาวที่สุดในภาคเหนือ ชมวิวดอยสุเทพ",
    "footprint": [
      [
        99.00075,
        18.771176
      ],
      [
        99.00165,
        18.771176
      ],
      [
        99.00165,
        18.771824
      ],
      [
        99.00075,
        18.771824
      ],
      [
        99.00075,
        18.771176
      ]
    ],
    "parts": [
      {
        "name": "The Astra Sky River Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            99.0007,
            18.77114
          ],
          [
            99.0017,
            18.77114
          ],
          [
            99.0017,
            18.77186
          ],
          [
            99.0007,
            18.77186
          ],
          [
            99.0007,
            18.77114
          ]
        ]
      },
      {
        "name": "The Astra Sky River Main Structure",
        "color": "#451A03",
        "height": 57,
        "min_height": 14,
        "footprint": [
          [
            99.00085,
            18.771248
          ],
          [
            99.00155,
            18.771248
          ],
          [
            99.00155,
            18.771752
          ],
          [
            99.00085,
            18.771752
          ],
          [
            99.00085,
            18.771248
          ]
        ]
      },
      {
        "name": "The Astra Sky River Crown & Sky Deck",
        "color": "#38BDF8",
        "height": 65,
        "min_height": 57,
        "footprint": [
          [
            99.00098,
            18.771342
          ],
          [
            99.00142,
            18.771342
          ],
          [
            99.00142,
            18.771658
          ],
          [
            99.00098,
            18.771658
          ],
          [
            99.00098,
            18.771342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "29.00 – 34.50 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "38.00 – 47.00 m²"
      },
      {
        "label": "2 Bedrooms & Penthouse",
        "size": "72.00 – 98.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Chiang Mai International Airport (CNX)",
        "dist": "4.5 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Chiang Mai Night Bazaar",
        "kind": "Night Market",
        "color": "#F59E0B",
        "lat": 18.785,
        "lon": 99,
        "dist": "1.2 km"
      }
    ]
  },
  {
    "id": "dcondo-ping-chiangmai",
    "name": "dcondo Ping Chiang Mai",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมรีสอร์ตติดเซ็นทรัลเชียงใหม่",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 30,
    "floors": 8,
    "units": 687,
    "unitsPerFloor": 24,
    "parking": 230,
    "parkingRatio": "33%",
    "landRai": 12,
    "facilitiesM2": "130m Lagoon Pool & Central Bridge Connect",
    "priceRange": "฿2.2M – ฿5.5M",
    "district": "เมืองเชียงใหม่",
    "location": "ถ.ซุปเปอร์ไฮเวย์ ต.ฟ้าฮ่าม อ.เมือง จ.เชียงใหม่",
    "lat": 18.8055,
    "lon": 99.0195,
    "desc": "คอนโดมิเนียมสไตล์รีสอร์ตล้านนาร่วมสมัย มีสะพานเชื่อมตรงสู่เซ็นทรัล เชียงใหม่ (Central Festival) พร้อมสระว่ายน้ำยาว 130 ม.",
    "footprint": [
      [
        99.01905,
        18.805176
      ],
      [
        99.01995,
        18.805176
      ],
      [
        99.01995,
        18.805824
      ],
      [
        99.01905,
        18.805824
      ],
      [
        99.01905,
        18.805176
      ]
    ],
    "parts": [
      {
        "name": "dcondo Ping Chiang Mai Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            99.019,
            18.80514
          ],
          [
            99.02,
            18.80514
          ],
          [
            99.02,
            18.80586
          ],
          [
            99.019,
            18.80586
          ],
          [
            99.019,
            18.80514
          ]
        ]
      },
      {
        "name": "dcondo Ping Chiang Mai Main Structure",
        "color": "#166534",
        "height": 26,
        "min_height": 14,
        "footprint": [
          [
            99.01915,
            18.805248
          ],
          [
            99.01985,
            18.805248
          ],
          [
            99.01985,
            18.805752
          ],
          [
            99.01915,
            18.805752
          ],
          [
            99.01915,
            18.805248
          ]
        ]
      },
      {
        "name": "dcondo Ping Chiang Mai Crown & Sky Deck",
        "color": "#10B981",
        "height": 30,
        "min_height": 26,
        "footprint": [
          [
            99.01928,
            18.805342
          ],
          [
            99.01972,
            18.805342
          ],
          [
            99.01972,
            18.805658
          ],
          [
            99.01928,
            18.805658
          ],
          [
            99.01928,
            18.805342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "30.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "37.50 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "60.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Central Chiangmai Walkway",
        "dist": "50 m",
        "type": "walk"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Chiangmai",
        "kind": "Shopping Mall",
        "color": "#D97706",
        "lat": 18.8065,
        "lon": 99.0185,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "supalai-monte-chiangmai",
    "name": "Supalai Monte @ Viang Chiang Mai",
    "brandId": "supalai",
    "brandName": "Supalai",
    "category": "คอนโดมิเนียมไฮไรส์สูง 32 ชั้นซุปเปอร์ไฮเวย์",
    "categoryColor": "#EA580C",
    "developer": "Supalai",
    "developerSite": "https://www.supalai.com/",
    "image": "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 105,
    "floors": 32,
    "units": 734,
    "unitsPerFloor": 24,
    "parking": 310,
    "parkingRatio": "42%",
    "landRai": 5.1,
    "facilitiesM2": "Doi Suthep View Sky Pool & Infinity Gym",
    "priceRange": "฿2.2M – ฿6.5M",
    "district": "เมืองเชียงใหม่",
    "location": "ถ.ซุปเปอร์ไฮเวย์ ตรงข้ามเซ็นทรัลเชียงใหม่",
    "lat": 18.8015,
    "lon": 99.021,
    "desc": "คอนโดมิเนียมสูง 32 ชั้นแลนด์มาร์กบนถนนซุปเปอร์ไฮเวย์เชียงใหม่ ชมวิวพาโนรามาดอยสุเทพแบบไร้สิ่งบดบัง ตรงข้าม Central Festival",
    "footprint": [
      [
        99.02058,
        18.801198
      ],
      [
        99.02142,
        18.801198
      ],
      [
        99.02142,
        18.801802
      ],
      [
        99.02058,
        18.801802
      ],
      [
        99.02058,
        18.801198
      ]
    ],
    "parts": [
      {
        "name": "Supalai Monte Chiang Mai Podium & Grounds",
        "color": "#1E293B",
        "height": 17,
        "min_height": 0,
        "footprint": [
          [
            99.0205,
            18.80114
          ],
          [
            99.0215,
            18.80114
          ],
          [
            99.0215,
            18.80186
          ],
          [
            99.0205,
            18.80186
          ],
          [
            99.0205,
            18.80114
          ]
        ]
      },
      {
        "name": "Supalai Monte Chiang Mai Main Structure",
        "color": "#C2410C",
        "height": 92,
        "min_height": 17,
        "footprint": [
          [
            99.02065,
            18.801248
          ],
          [
            99.02135,
            18.801248
          ],
          [
            99.02135,
            18.801752
          ],
          [
            99.02065,
            18.801752
          ],
          [
            99.02065,
            18.801248
          ]
        ]
      },
      {
        "name": "Supalai Monte Chiang Mai Crown & Sky Deck",
        "color": "#38BDF8",
        "height": 105,
        "min_height": 92,
        "footprint": [
          [
            99.02078,
            18.801342
          ],
          [
            99.02122,
            18.801342
          ],
          [
            99.02122,
            18.801658
          ],
          [
            99.02078,
            18.801658
          ],
          [
            99.02078,
            18.801342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "33.00 – 37.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "46.00 – 52.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "64.50 – 70.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Chiang Mai Arcade Bus Terminal",
        "dist": "750 m",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Chiangmai",
        "kind": "Shopping Mall",
        "color": "#D97706",
        "lat": 18.8065,
        "lon": 99.0185,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "one-nimman",
    "name": "One Nimman & Think Park",
    "brandId": "other",
    "brandName": "One Nimman",
    "category": "ไลฟ์สไตล์แลนด์มาร์กสถาปัตยกรรมยุโรปนิมมาน",
    "categoryColor": "#78350F",
    "developer": "One Nimman",
    "developerSite": "https://www.onenimman.com/",
    "image": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#78350F",
    "color": "#451A03",
    "height": 45,
    "floors": 5,
    "units": 0,
    "parking": 500,
    "parkingRatio": "Commercial",
    "landRai": 13,
    "facilitiesM2": "European Brick Architecture & Nimman Art Market",
    "priceRange": "Nimman Lifestyle Landmark",
    "district": "เมืองเชียงใหม่ (นิมมาน)",
    "location": "แยกรินคำ ถ.นิมมานเหมินท์ อ.เมือง จ.เชียงใหม่",
    "lat": 18.7995,
    "lon": 98.9685,
    "desc": "แลนด์มาร์กสถาปัตยกรรมอิฐแดงสไตล์ยุโรปผสมผสานล้านนาใจกลางนิมมานเหมินท์ ศูนย์รวมร้านอาหาร คาเฟ่ และตลาดศิลปะ",
    "footprint": [
      [
        98.96795,
        18.799104
      ],
      [
        98.96905,
        18.799104
      ],
      [
        98.96905,
        18.799896
      ],
      [
        98.96795,
        18.799896
      ],
      [
        98.96795,
        18.799104
      ]
    ],
    "parts": [
      {
        "name": "One Nimman Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            98.968,
            18.79914
          ],
          [
            98.969,
            18.79914
          ],
          [
            98.969,
            18.79986
          ],
          [
            98.968,
            18.79986
          ],
          [
            98.968,
            18.79914
          ]
        ]
      },
      {
        "name": "One Nimman Main Structure",
        "color": "#451A03",
        "height": 40,
        "min_height": 14,
        "footprint": [
          [
            98.96815,
            18.799248
          ],
          [
            98.96885,
            18.799248
          ],
          [
            98.96885,
            18.799752
          ],
          [
            98.96815,
            18.799752
          ],
          [
            98.96815,
            18.799248
          ]
        ]
      },
      {
        "name": "One Nimman Crown & Sky Deck",
        "color": "#EAB308",
        "height": 45,
        "min_height": 40,
        "footprint": [
          [
            98.96828,
            18.799342
          ],
          [
            98.96872,
            18.799342
          ],
          [
            98.96872,
            18.799658
          ],
          [
            98.96828,
            18.799658
          ],
          [
            98.96828,
            18.799342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Lifestyle Commercial Complex",
        "size": "20,000 m²"
      }
    ],
    "transport": [
      {
        "name": "Nimmanhaemin Road",
        "dist": "10 m",
        "type": "walk"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "MAYA Lifestyle Shopping Center",
        "kind": "Mall",
        "color": "#D97706",
        "lat": 18.802,
        "lon": 98.967,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "intercontinental-residences-huahin",
    "name": "InterContinental Residences Hua Hin",
    "brandId": "proud",
    "brandName": "PROUD REAL ESTATE",
    "category": "คอนโดมิเนียมซูเปอร์ลักชัวรีริมหาดหัวหิน",
    "categoryColor": "#3B82F6",
    "developer": "PROUD REAL ESTATE",
    "developerSite": "https://www.proudrealestate.co.th/",
    "image": "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E3A8A",
    "color": "#243B55",
    "height": 35,
    "floors": 7,
    "units": 238,
    "unitsPerFloor": 12,
    "parking": 238,
    "parkingRatio": "100%",
    "landRai": 7.2,
    "facilitiesM2": "InterContinental 5-Star Hotel Services & 7 Pools",
    "priceRange": "฿9.5M – ฿120M",
    "district": "หัวหิน (ประจวบคีรีขันธ์)",
    "location": "ซอยหัวหิน 71 ติดชายหาดหัวหิน จ.ประจวบคีรีขันธ์",
    "lat": 12.5535,
    "lon": 99.9615,
    "desc": "เรสซิเดนซ์ระดับอัลตราลักชัวรีแห่งแรกในไทยภายใต้แบรนด์ InterContinental ชายหาดหัวหินผืนงามที่สุด บริการมาตรฐานโรงแรมระดับโลก 24 ชม.",
    "footprint": [
      [
        99.96102,
        12.553154
      ],
      [
        99.96198,
        12.553154
      ],
      [
        99.96198,
        12.553846
      ],
      [
        99.96102,
        12.553846
      ],
      [
        99.96102,
        12.553154
      ]
    ],
    "parts": [
      {
        "name": "InterContinental Residences Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            99.961,
            12.55314
          ],
          [
            99.962,
            12.55314
          ],
          [
            99.962,
            12.55386
          ],
          [
            99.961,
            12.55386
          ],
          [
            99.961,
            12.55314
          ]
        ]
      },
      {
        "name": "InterContinental Residences Main Structure",
        "color": "#243B55",
        "height": 31,
        "min_height": 14,
        "footprint": [
          [
            99.96115,
            12.553248
          ],
          [
            99.96185,
            12.553248
          ],
          [
            99.96185,
            12.553752
          ],
          [
            99.96115,
            12.553752
          ],
          [
            99.96115,
            12.553248
          ]
        ]
      },
      {
        "name": "InterContinental Residences Crown & Sky Deck",
        "color": "#EAB308",
        "height": 35,
        "min_height": 31,
        "footprint": [
          [
            99.96128,
            12.553342
          ],
          [
            99.96172,
            12.553342
          ],
          [
            99.96172,
            12.553658
          ],
          [
            99.96128,
            12.553658
          ],
          [
            99.96128,
            12.553342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "45.00 – 52.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "78.00 – 106.00 m²"
      },
      {
        "label": "3-4 Bedrooms Penthouse",
        "size": "150.00 – 340.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Hua Hin Airport (HHQ)",
        "dist": "9.0 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Market Village Hua Hin",
        "kind": "Mall",
        "color": "#D97706",
        "lat": 12.556,
        "lon": 99.9605,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "vehha-hua-hin",
    "name": "VEHHA Hua Hin",
    "brandId": "proud",
    "brandName": "PROUD REAL ESTATE",
    "category": "คอนโดมิเนียมไฮไรส์สูงที่สุดในหัวหิน (31 ชั้น)",
    "categoryColor": "#3B82F6",
    "developer": "PROUD REAL ESTATE",
    "developerSite": "https://www.proudrealestate.co.th/",
    "image": "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E3A8A",
    "color": "#243B55",
    "height": 115,
    "floors": 31,
    "units": 364,
    "unitsPerFloor": 14,
    "parking": 182,
    "parkingRatio": "50%",
    "landRai": 5.1,
    "facilitiesM2": "Vana Nava Water Jungle Free Access & Sky Pool",
    "priceRange": "฿3.9M – ฿28M",
    "district": "หัวหิน (ประจวบคีรีขันธ์)",
    "location": "ถ.เพชรเกษม หนองแก หัวหิน จ.ประจวบคีรีขันธ์",
    "lat": 12.5315,
    "lon": 99.9612,
    "desc": "ตึกสูง 31 ชั้นแห่งใหม่ที่สูงที่สุดในหัวหิน วิวทะเลหัวหินทุกยูนิต พร้อมสิทธิ์เข้าสวนน้ำ Vana Nava Water Jungle ฟรี 5 ปีเต็ม",
    "footprint": [
      [
        99.96075,
        12.531176
      ],
      [
        99.96165,
        12.531176
      ],
      [
        99.96165,
        12.531824
      ],
      [
        99.96075,
        12.531824
      ],
      [
        99.96075,
        12.531176
      ]
    ],
    "parts": [
      {
        "name": "VEHHA Hua Hin Podium & Grounds",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            99.9607,
            12.53114
          ],
          [
            99.9617,
            12.53114
          ],
          [
            99.9617,
            12.53186
          ],
          [
            99.9607,
            12.53186
          ],
          [
            99.9607,
            12.53114
          ]
        ]
      },
      {
        "name": "VEHHA Hua Hin Main Structure",
        "color": "#243B55",
        "height": 101,
        "min_height": 18,
        "footprint": [
          [
            99.96085,
            12.531248
          ],
          [
            99.96155,
            12.531248
          ],
          [
            99.96155,
            12.531752
          ],
          [
            99.96085,
            12.531752
          ],
          [
            99.96085,
            12.531248
          ]
        ]
      },
      {
        "name": "VEHHA Hua Hin Crown & Sky Deck",
        "color": "#38BDF8",
        "height": 115,
        "min_height": 101,
        "footprint": [
          [
            99.96098,
            12.531342
          ],
          [
            99.96142,
            12.531342
          ],
          [
            99.96142,
            12.531658
          ],
          [
            99.96098,
            12.531658
          ],
          [
            99.96098,
            12.531342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom Sea View",
        "size": "28.00 – 30.50 m²"
      },
      {
        "label": "1 Bedroom Plus",
        "size": "42.00 – 46.00 m²"
      },
      {
        "label": "2 Bedrooms & Duplex",
        "size": "56.00 – 153.00 m²"
      }
    ],
    "transport": [
      {
        "name": "สถานีรถไฟหัวหิน",
        "dist": "4.2 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Vana Nava Water Jungle",
        "kind": "Waterpark",
        "color": "#3B82F6",
        "lat": 12.531,
        "lon": 99.9605,
        "dist": "100 m"
      },
      {
        "name": "Cicada Market",
        "kind": "Art Market",
        "color": "#F59E0B",
        "lat": 12.534,
        "lon": 99.966,
        "dist": "650 m"
      }
    ]
  },
  {
    "id": "la-habana-huahin",
    "name": "La Habana Hua Hin",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมรีสอร์ตสไตล์คิวบาติดซิเคด้า",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 30,
    "floors": 8,
    "units": 652,
    "unitsPerFloor": 24,
    "parking": 220,
    "parkingRatio": "34%",
    "landRai": 6,
    "facilitiesM2": "1,000 m² Havana Lagoon Pool & Beach Access",
    "priceRange": "฿3.2M – ฿12M",
    "district": "หัวหิน (ประจวบคีรีขันธ์)",
    "location": "หนองแก ติดตลาด Cicada Market หัวหิน",
    "lat": 12.5345,
    "lon": 99.9665,
    "desc": "คอนโดมิเนียมสีสันสดใสสไตล์เมืองฮาวานา ประเทศคิวบา ติดตลาดซิเคด้า และห่างหาดหัวหินเพียง 250 ม. สระว่ายน้ำขนาดใหญ่กว่า 1,000 ตร.ม.",
    "footprint": [
      [
        99.96605,
        12.534176
      ],
      [
        99.96695,
        12.534176
      ],
      [
        99.96695,
        12.534824
      ],
      [
        99.96605,
        12.534824
      ],
      [
        99.96605,
        12.534176
      ]
    ],
    "parts": [
      {
        "name": "La Habana Hua Hin Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            99.966,
            12.53414
          ],
          [
            99.967,
            12.53414
          ],
          [
            99.967,
            12.53486
          ],
          [
            99.966,
            12.53486
          ],
          [
            99.966,
            12.53414
          ]
        ]
      },
      {
        "name": "La Habana Hua Hin Main Structure",
        "color": "#166534",
        "height": 26,
        "min_height": 14,
        "footprint": [
          [
            99.96615,
            12.534248
          ],
          [
            99.96685,
            12.534248
          ],
          [
            99.96685,
            12.534752
          ],
          [
            99.96615,
            12.534752
          ],
          [
            99.96615,
            12.534248
          ]
        ]
      },
      {
        "name": "La Habana Hua Hin Crown & Sky Deck",
        "color": "#F59E0B",
        "height": 30,
        "min_height": 26,
        "footprint": [
          [
            99.96628,
            12.534342
          ],
          [
            99.96672,
            12.534342
          ],
          [
            99.96672,
            12.534658
          ],
          [
            99.96628,
            12.534658
          ],
          [
            99.96628,
            12.534342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "25.00 – 39.25 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "61.00 – 98.75 m²"
      }
    ],
    "transport": [
      {
        "name": "Cicada Market Walkway",
        "dist": "20 m",
        "type": "walk"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Cicada Market",
        "kind": "Weekend Market",
        "color": "#F59E0B",
        "lat": 12.534,
        "lon": 99.966,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "the-estates-samui",
    "name": "The Estates Samui by Four Seasons",
    "brandId": "other",
    "brandName": "Four Seasons & Minor",
    "category": "วิลล่าระดับเวิลด์คลาสบนแหลมใหญ่ เกาะสมุย",
    "categoryColor": "#059669",
    "developer": "Minor International",
    "developerSite": "https://www.fourseasons.com/kohsamui/",
    "image": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#065F46",
    "color": "#064E3B",
    "height": 20,
    "floors": 2,
    "units": 14,
    "unitsPerFloor": 1,
    "parking": 28,
    "parkingRatio": "200%",
    "landRai": 35,
    "facilitiesM2": "Private Beach & Bill Bensley Design",
    "priceRange": "฿85M – ฿350M",
    "district": "เกาะสมุย (สุราษฎร์ธานี)",
    "location": "แหลมใหญ่ หาดบางปอ เกาะสมุย จ.สุราษฎร์ธานี",
    "lat": 9.5785,
    "lon": 99.9325,
    "desc": "วิลล่าตากอากาศระดับตำนาน ออกแบบโดยสถาปนิกชื่อดังระดับโลก Bill Bensley ซ่อนตัวบนเนินเขาส่วนตัวติดหาดแหลมใหญ่ บริการโดย Four Seasons",
    "footprint": [
      [
        99.9319,
        9.578068
      ],
      [
        99.9331,
        9.578068
      ],
      [
        99.9331,
        9.578932
      ],
      [
        99.9319,
        9.578932
      ],
      [
        99.9319,
        9.578068
      ]
    ],
    "parts": [
      {
        "name": "The Estates Samui Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            99.932,
            9.57814
          ],
          [
            99.933,
            9.57814
          ],
          [
            99.933,
            9.57886
          ],
          [
            99.932,
            9.57886
          ],
          [
            99.932,
            9.57814
          ]
        ]
      },
      {
        "name": "The Estates Samui Main Structure",
        "color": "#064E3B",
        "height": 18,
        "min_height": 14,
        "footprint": [
          [
            99.93215,
            9.578248
          ],
          [
            99.93285,
            9.578248
          ],
          [
            99.93285,
            9.578752
          ],
          [
            99.93215,
            9.578752
          ],
          [
            99.93215,
            9.578248
          ]
        ]
      },
      {
        "name": "The Estates Samui Crown & Sky Deck",
        "color": "#EAB308",
        "height": 20,
        "min_height": 18,
        "footprint": [
          [
            99.93228,
            9.578342
          ],
          [
            99.93272,
            9.578342
          ],
          [
            99.93272,
            9.578658
          ],
          [
            99.93228,
            9.578658
          ],
          [
            99.93228,
            9.578342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "2-4 Bedrooms Beachfront Villa",
        "size": "850 – 1,200 m²"
      }
    ],
    "transport": [
      {
        "name": "สนามบินนานาชาติสมุย (USM)",
        "dist": "18 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Four Seasons Resort Koh Samui",
        "kind": "Resort",
        "color": "#10B981",
        "lat": 9.577,
        "lon": 99.933,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "dcondo-coco-surat",
    "name": "dcondo Coco Surat Thani",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมรีสอร์ตติดเซ็นทรัลสุราษฎร์ธานี",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 30,
    "floors": 8,
    "units": 529,
    "unitsPerFloor": 22,
    "parking": 175,
    "parkingRatio": "33%",
    "landRai": 4.2,
    "facilitiesM2": "Tropical Coconut Lagoon Pool & Clubhouse",
    "priceRange": "฿1.8M – ฿4.2M",
    "district": "เมืองสุราษฎร์ธานี",
    "location": "ตรงข้ามเซ็นทรัลพลาซา สุราษฎร์ธานี",
    "lat": 9.1125,
    "lon": 99.3085,
    "desc": "คอนโดมิเนียมสไตล์รีสอร์ตมะพร้าวเมืองใต้ ตรงข้ามเซ็นทรัล สุราษฎร์ธานี เดินทางสะดวกสู่สนามบินและตัวเมือง",
    "footprint": [
      [
        99.30808,
        9.112198
      ],
      [
        99.30892,
        9.112198
      ],
      [
        99.30892,
        9.112802
      ],
      [
        99.30808,
        9.112802
      ],
      [
        99.30808,
        9.112198
      ]
    ],
    "parts": [
      {
        "name": "dcondo Coco Surat Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            99.308,
            9.11214
          ],
          [
            99.309,
            9.11214
          ],
          [
            99.309,
            9.11286
          ],
          [
            99.308,
            9.11286
          ],
          [
            99.308,
            9.11214
          ]
        ]
      },
      {
        "name": "dcondo Coco Surat Main Structure",
        "color": "#166534",
        "height": 26,
        "min_height": 14,
        "footprint": [
          [
            99.30815,
            9.112248
          ],
          [
            99.30885,
            9.112248
          ],
          [
            99.30885,
            9.112752
          ],
          [
            99.30815,
            9.112752
          ],
          [
            99.30815,
            9.112248
          ]
        ]
      },
      {
        "name": "dcondo Coco Surat Crown & Sky Deck",
        "color": "#10B981",
        "height": 30,
        "min_height": 26,
        "footprint": [
          [
            99.30828,
            9.112342
          ],
          [
            99.30872,
            9.112342
          ],
          [
            99.30872,
            9.112658
          ],
          [
            99.30828,
            9.112658
          ],
          [
            99.30828,
            9.112342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "26.00 – 28.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "34.00 m²"
      }
    ],
    "transport": [
      {
        "name": "สนามบินสุราษฎร์ธานี (URT)",
        "dist": "19 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Surat Thani",
        "kind": "Shopping Mall",
        "color": "#D97706",
        "lat": 9.114,
        "lon": 99.3095,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "the-base-height-khonkaen",
    "name": "The Base Height Mittraparp Khon Kaen",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมไฮไรส์สูงที่สุดในขอนแก่น",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 110,
    "floors": 36,
    "units": 983,
    "unitsPerFloor": 30,
    "parking": 360,
    "parkingRatio": "37%",
    "landRai": 4.3,
    "facilitiesM2": "35th Fl Skyline Pool & Football Pitch",
    "priceRange": "฿2.2M – ฿6.8M",
    "district": "เมืองขอนแก่น",
    "location": "ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น",
    "lat": 16.4385,
    "lon": 102.8245,
    "desc": "แลนด์มาร์กตึกสูง 36 ชั้น บนถนนมิตรภาพขอนแก่น สระว่ายน้ำลอยฟ้าชั้น 35 ชมวิวมหานครขอนแก่นและบึงแก่นนคร",
    "footprint": [
      [
        102.82408,
        16.438198
      ],
      [
        102.82492,
        16.438198
      ],
      [
        102.82492,
        16.438802
      ],
      [
        102.82408,
        16.438802
      ],
      [
        102.82408,
        16.438198
      ]
    ],
    "parts": [
      {
        "name": "The Base Height Khon Kaen Podium & Grounds",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            102.824,
            16.43814
          ],
          [
            102.825,
            16.43814
          ],
          [
            102.825,
            16.43886
          ],
          [
            102.824,
            16.43886
          ],
          [
            102.824,
            16.43814
          ]
        ]
      },
      {
        "name": "The Base Height Khon Kaen Main Structure",
        "color": "#166534",
        "height": 97,
        "min_height": 18,
        "footprint": [
          [
            102.82415,
            16.438248
          ],
          [
            102.82485,
            16.438248
          ],
          [
            102.82485,
            16.438752
          ],
          [
            102.82415,
            16.438752
          ],
          [
            102.82415,
            16.438248
          ]
        ]
      },
      {
        "name": "The Base Height Khon Kaen Crown & Sky Deck",
        "color": "#38BDF8",
        "height": 110,
        "min_height": 97,
        "footprint": [
          [
            102.82428,
            16.438342
          ],
          [
            102.82472,
            16.438342
          ],
          [
            102.82472,
            16.438658
          ],
          [
            102.82428,
            16.438658
          ],
          [
            102.82428,
            16.438342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "29.00 – 35.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "58.00 – 65.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Khon Kaen Railway Station",
        "dist": "1.5 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Khon Kaen",
        "kind": "Shopping Mall",
        "color": "#D97706",
        "lat": 16.4325,
        "lon": 102.8275,
        "dist": "750 m"
      }
    ]
  },
  {
    "id": "the-base-korat",
    "name": "The Base Korat",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมโมเดิร์นโคราช",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 70,
    "floors": 20,
    "units": 795,
    "unitsPerFloor": 38,
    "parking": 278,
    "parkingRatio": "35%",
    "landRai": 5.2,
    "facilitiesM2": "Panoramic Forest Pool & Co-working",
    "priceRange": "฿1.9M – ฿5.8M",
    "district": "เมืองนครราชสีมา",
    "location": "ถ.มิตรภาพ เมืองนครราชสีมา จ.นครราชสีมา",
    "lat": 14.9815,
    "lon": 102.1025,
    "desc": "คอนโดมิเนียมใจกลางเมืองโคราช ติดถนนมิตรภาพ ใกล้ห้าง Terminal 21 โคราช และเซ็นทรัล โคราช",
    "footprint": [
      [
        102.10208,
        14.981198
      ],
      [
        102.10292,
        14.981198
      ],
      [
        102.10292,
        14.981802
      ],
      [
        102.10208,
        14.981802
      ],
      [
        102.10208,
        14.981198
      ]
    ],
    "parts": [
      {
        "name": "The Base Korat Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            102.102,
            14.98114
          ],
          [
            102.103,
            14.98114
          ],
          [
            102.103,
            14.98186
          ],
          [
            102.102,
            14.98186
          ],
          [
            102.102,
            14.98114
          ]
        ]
      },
      {
        "name": "The Base Korat Main Structure",
        "color": "#166534",
        "height": 62,
        "min_height": 14,
        "footprint": [
          [
            102.10215,
            14.981248
          ],
          [
            102.10285,
            14.981248
          ],
          [
            102.10285,
            14.981752
          ],
          [
            102.10215,
            14.981752
          ],
          [
            102.10215,
            14.981248
          ]
        ]
      },
      {
        "name": "The Base Korat Crown & Sky Deck",
        "color": "#F59E0B",
        "height": 70,
        "min_height": 62,
        "footprint": [
          [
            102.10228,
            14.981342
          ],
          [
            102.10272,
            14.981342
          ],
          [
            102.10272,
            14.981658
          ],
          [
            102.10228,
            14.981658
          ],
          [
            102.10228,
            14.981342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "27.50 – 34.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "52.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Nakhon Ratchasima Railway Station",
        "dist": "2.5 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Terminal 21 Korat",
        "kind": "Mall",
        "color": "#F59E0B",
        "lat": 14.98,
        "lon": 102.097,
        "dist": "650 m"
      }
    ]
  },
  {
    "id": "escent-korat",
    "name": "Escent Korat",
    "brandId": "cpn",
    "brandName": "CPN / Central",
    "category": "คอนโดมิเนียมติดเซ็นทรัลโคราช",
    "categoryColor": "#D97706",
    "developer": "Central Pattana (CPN)",
    "developerSite": "https://www.centralpattana.co.th/",
    "image": "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#D97706",
    "color": "#B45309",
    "height": 60,
    "floors": 17,
    "units": 395,
    "unitsPerFloor": 24,
    "parking": 140,
    "parkingRatio": "35%",
    "landRai": 2.3,
    "facilitiesM2": "Sky Pool with Korat City View",
    "priceRange": "฿2.0M – ฿5.2M",
    "district": "เมืองนครราชสีมา",
    "location": "ติดเซ็นทรัล โคราช ถ.มิตรภาพ นครราชสีมา",
    "lat": 14.9865,
    "lon": 102.1145,
    "desc": "คอนโดมิเนียมภายในพื้นที่โครงการเซ็นทรัล โคราช เดินเข้าห้างได้ทันที สะดวกสบายที่สุดในเมืองย่าโม",
    "footprint": [
      [
        102.11408,
        14.986198
      ],
      [
        102.11492,
        14.986198
      ],
      [
        102.11492,
        14.986802
      ],
      [
        102.11408,
        14.986802
      ],
      [
        102.11408,
        14.986198
      ]
    ],
    "parts": [
      {
        "name": "Escent Korat Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            102.114,
            14.98614
          ],
          [
            102.115,
            14.98614
          ],
          [
            102.115,
            14.98686
          ],
          [
            102.114,
            14.98686
          ],
          [
            102.114,
            14.98614
          ]
        ]
      },
      {
        "name": "Escent Korat Main Structure",
        "color": "#B45309",
        "height": 53,
        "min_height": 14,
        "footprint": [
          [
            102.11415,
            14.986248
          ],
          [
            102.11485,
            14.986248
          ],
          [
            102.11485,
            14.986752
          ],
          [
            102.11415,
            14.986752
          ],
          [
            102.11415,
            14.986248
          ]
        ]
      },
      {
        "name": "Escent Korat Crown & Sky Deck",
        "color": "#38BDF8",
        "height": 60,
        "min_height": 53,
        "footprint": [
          [
            102.11428,
            14.986342
          ],
          [
            102.11472,
            14.986342
          ],
          [
            102.11472,
            14.986658
          ],
          [
            102.11428,
            14.986658
          ],
          [
            102.11428,
            14.986342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "28.00 – 32.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "55.00 – 60.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Central Korat Direct Walkway",
        "dist": "20 m",
        "type": "walk"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Korat",
        "kind": "Mega Mall",
        "color": "#D97706",
        "lat": 14.987,
        "lon": 102.1155,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "the-rise-residence-hatyai",
    "name": "The Rise Residence Hat Yai",
    "brandId": "other",
    "brandName": "The Rise Group",
    "category": "คอนโดมิเนียมสูงที่สุดในหาดใหญ่ (32 ชั้น)",
    "categoryColor": "#0284C7",
    "developer": "The Rise Group",
    "developerSite": "http://www.therisecondo.com/",
    "image": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#1E3A8A",
    "height": 110,
    "floors": 32,
    "units": 549,
    "unitsPerFloor": 18,
    "parking": 270,
    "parkingRatio": "50%",
    "landRai": 3.2,
    "facilitiesM2": "32nd Fl Sky Pool Overlooking Hat Yai City",
    "priceRange": "฿2.8M – ฿9.5M",
    "district": "หาดใหญ่ (สงขลา)",
    "location": "ถ.คลองเรียน 1 ใกล้ รพ.กรุงเทพหาดใหญ่ จ.สงขลา",
    "lat": 7.0085,
    "lon": 100.4855,
    "desc": "คอนโดมิเนียมสูง 32 ชั้นที่เป็นแลนด์มาร์กสูงที่สุดของเมืองหาดใหญ่ สระว่ายน้ำลอยฟ้าชมทัศนียภาพเมืองหาดใหญ่และทิวเขาคอหงส์",
    "footprint": [
      [
        100.48508,
        7.008198
      ],
      [
        100.48592,
        7.008198
      ],
      [
        100.48592,
        7.008802
      ],
      [
        100.48508,
        7.008802
      ],
      [
        100.48508,
        7.008198
      ]
    ],
    "parts": [
      {
        "name": "The Rise Hat Yai Podium & Grounds",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.485,
            7.00814
          ],
          [
            100.486,
            7.00814
          ],
          [
            100.486,
            7.00886
          ],
          [
            100.485,
            7.00886
          ],
          [
            100.485,
            7.00814
          ]
        ]
      },
      {
        "name": "The Rise Hat Yai Main Structure",
        "color": "#1E3A8A",
        "height": 97,
        "min_height": 18,
        "footprint": [
          [
            100.48515,
            7.008248
          ],
          [
            100.48585,
            7.008248
          ],
          [
            100.48585,
            7.008752
          ],
          [
            100.48515,
            7.008752
          ],
          [
            100.48515,
            7.008248
          ]
        ]
      },
      {
        "name": "The Rise Hat Yai Crown & Sky Deck",
        "color": "#38BDF8",
        "height": 110,
        "min_height": 97,
        "footprint": [
          [
            100.48528,
            7.008342
          ],
          [
            100.48572,
            7.008342
          ],
          [
            100.48572,
            7.008658
          ],
          [
            100.48528,
            7.008658
          ],
          [
            100.48528,
            7.008342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "35.00 – 42.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "65.00 – 80.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Hat Yai Railway Station",
        "dist": "2.1 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Bangkok Hospital Hatyai",
        "kind": "Hospital",
        "color": "#DC2626",
        "lat": 7.0065,
        "lon": 100.488,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "escent-hatyai",
    "name": "Escent Hat Yai",
    "brandId": "cpn",
    "brandName": "CPN / Central",
    "category": "คอนโดมิเนียมไฮไรส์ติดเซ็นทรัลหาดใหญ่",
    "categoryColor": "#D97706",
    "developer": "Central Pattana (CPN)",
    "developerSite": "https://www.centralpattana.co.th/",
    "image": "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#D97706",
    "color": "#B45309",
    "height": 105,
    "floors": 32,
    "units": 665,
    "unitsPerFloor": 22,
    "parking": 230,
    "parkingRatio": "35%",
    "landRai": 4.1,
    "facilitiesM2": "32nd Fl Sky Pool & Central Hatyai Connect",
    "priceRange": "฿2.2M – ฿6.2M",
    "district": "หาดใหญ่ (สงขลา)",
    "location": "ติดเซ็นทรัล หาดใหญ่ ถ.กาญจนวณิชย์ หาดใหญ่",
    "lat": 6.9925,
    "lon": 100.4845,
    "desc": "คอนโดมิเนียมสูง 32 ชั้นติดห้างสรรพสินค้าเซ็นทรัล หาดใหญ่ เชื่อมต่อไลฟ์สไตล์ช้อปปิ้ง กิน ดื่ม สะดวกที่สุดในภาคใต้",
    "footprint": [
      [
        100.48408,
        6.992198
      ],
      [
        100.48492,
        6.992198
      ],
      [
        100.48492,
        6.992802
      ],
      [
        100.48408,
        6.992802
      ],
      [
        100.48408,
        6.992198
      ]
    ],
    "parts": [
      {
        "name": "Escent Hat Yai Podium & Grounds",
        "color": "#1E293B",
        "height": 17,
        "min_height": 0,
        "footprint": [
          [
            100.484,
            6.99214
          ],
          [
            100.485,
            6.99214
          ],
          [
            100.485,
            6.99286
          ],
          [
            100.484,
            6.99286
          ],
          [
            100.484,
            6.99214
          ]
        ]
      },
      {
        "name": "Escent Hat Yai Main Structure",
        "color": "#B45309",
        "height": 92,
        "min_height": 17,
        "footprint": [
          [
            100.48415,
            6.992248
          ],
          [
            100.48485,
            6.992248
          ],
          [
            100.48485,
            6.992752
          ],
          [
            100.48415,
            6.992752
          ],
          [
            100.48415,
            6.992248
          ]
        ]
      },
      {
        "name": "Escent Hat Yai Crown & Sky Deck",
        "color": "#38BDF8",
        "height": 105,
        "min_height": 92,
        "footprint": [
          [
            100.48428,
            6.992342
          ],
          [
            100.48472,
            6.992342
          ],
          [
            100.48472,
            6.992658
          ],
          [
            100.48428,
            6.992658
          ],
          [
            100.48428,
            6.992342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "28.00 – 34.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "56.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Hat Yai Bus Terminal",
        "dist": "1.0 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Hatyai",
        "kind": "Mega Mall",
        "color": "#D97706",
        "lat": 6.9935,
        "lon": 100.4855,
        "dist": "80 m"
      }
    ]
  },
  {
    "id": "origin-smart-city-rayong",
    "name": "Origin Smart City Rayong",
    "brandId": "origin",
    "brandName": "Origin Property",
    "category": "สมาร์ตซิตี้คอนโดมิเนียม EEC ระยอง",
    "categoryColor": "#F97316",
    "developer": "Origin Property",
    "developerSite": "https://www.origin.co.th/",
    "image": "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#C2410C",
    "height": 75,
    "floors": 25,
    "units": 1100,
    "unitsPerFloor": 36,
    "parking": 400,
    "parkingRatio": "36%",
    "landRai": 24,
    "facilitiesM2": "Smart City Mega Hub & Sky Garden",
    "priceRange": "฿1.8M – ฿4.8M",
    "district": "เมืองระยอง",
    "location": "ถ.สุขุมวิท แยกเนินสำลี อ.เมือง จ.ระยอง",
    "lat": 12.6845,
    "lon": 101.2425,
    "desc": "อภิมหาโครงการมิกซ์ยูสสมาร์ตซิตี้บนพื้นที่กว่า 24 ไร่ ใจกลางเมืองระยอง ใกล้นิคมอุตสาหกรรมมาบตาพุดและศูนย์ราชการ",
    "footprint": [
      [
        101.24205,
        12.684176
      ],
      [
        101.24295,
        12.684176
      ],
      [
        101.24295,
        12.684824
      ],
      [
        101.24205,
        12.684824
      ],
      [
        101.24205,
        12.684176
      ]
    ],
    "parts": [
      {
        "name": "Origin Smart City Rayong Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            101.242,
            12.68414
          ],
          [
            101.243,
            12.68414
          ],
          [
            101.243,
            12.68486
          ],
          [
            101.242,
            12.68486
          ],
          [
            101.242,
            12.68414
          ]
        ]
      },
      {
        "name": "Origin Smart City Rayong Main Structure",
        "color": "#C2410C",
        "height": 66,
        "min_height": 14,
        "footprint": [
          [
            101.24215,
            12.684248
          ],
          [
            101.24285,
            12.684248
          ],
          [
            101.24285,
            12.684752
          ],
          [
            101.24215,
            12.684752
          ],
          [
            101.24215,
            12.684248
          ]
        ]
      },
      {
        "name": "Origin Smart City Rayong Crown & Sky Deck",
        "color": "#38BDF8",
        "height": 75,
        "min_height": 66,
        "footprint": [
          [
            101.24228,
            12.684342
          ],
          [
            101.24272,
            12.684342
          ],
          [
            101.24272,
            12.684658
          ],
          [
            101.24228,
            12.684658
          ],
          [
            101.24228,
            12.684342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "23.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "28.00 – 34.00 m²"
      }
    ],
    "transport": [
      {
        "name": "U-Tapao Rayong Pattaya Airport",
        "dist": "32 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Passione Shopping Destination",
        "kind": "Mall",
        "color": "#EC4899",
        "lat": 12.682,
        "lon": 101.25,
        "dist": "1.5 km"
      }
    ]
  },
  {
    "id": "dcondo-sense-chiangrai",
    "name": "dcondo Sense Chiang Rai",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "คอนโดมิเนียมรีสอร์ตล้านนาติดเซ็นทรัลเชียงราย",
    "categoryColor": "#16A34A",
    "developer": "Sansiri",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#166534",
    "height": 30,
    "floors": 8,
    "units": 436,
    "unitsPerFloor": 28,
    "parking": 145,
    "parkingRatio": "33%",
    "landRai": 4.1,
    "facilitiesM2": "Lanna Garden Pool & Fitness",
    "priceRange": "฿1.6M – ฿3.8M",
    "district": "เมืองเชียงราย",
    "location": "ถ.พหลโยธิน ใกล้เซ็นทรัล เชียงราย",
    "lat": 19.8945,
    "lon": 99.8325,
    "desc": "คอนโดมิเนียมสไตล์รีสอร์ตล้านนาติดถนนพหลโยธิน ใกล้เซ็นทรัล เชียงราย เพียง 300 ม. บรรยากาศเงียบสงบโอบล้อมด้วยขุนเขา",
    "footprint": [
      [
        99.83208,
        19.894198
      ],
      [
        99.83292,
        19.894198
      ],
      [
        99.83292,
        19.894802
      ],
      [
        99.83208,
        19.894802
      ],
      [
        99.83208,
        19.894198
      ]
    ],
    "parts": [
      {
        "name": "dcondo Sense Chiang Rai Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            99.832,
            19.89414
          ],
          [
            99.833,
            19.89414
          ],
          [
            99.833,
            19.89486
          ],
          [
            99.832,
            19.89486
          ],
          [
            99.832,
            19.89414
          ]
        ]
      },
      {
        "name": "dcondo Sense Chiang Rai Main Structure",
        "color": "#166534",
        "height": 26,
        "min_height": 14,
        "footprint": [
          [
            99.83215,
            19.894248
          ],
          [
            99.83285,
            19.894248
          ],
          [
            99.83285,
            19.894752
          ],
          [
            99.83215,
            19.894752
          ],
          [
            99.83215,
            19.894248
          ]
        ]
      },
      {
        "name": "dcondo Sense Chiang Rai Crown & Sky Deck",
        "color": "#10B981",
        "height": 30,
        "min_height": 26,
        "footprint": [
          [
            99.83228,
            19.894342
          ],
          [
            99.83272,
            19.894342
          ],
          [
            99.83272,
            19.894658
          ],
          [
            99.83228,
            19.894658
          ],
          [
            99.83228,
            19.894342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "28.00 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "34.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Mae Fah Luang Chiang Rai Airport (CEI)",
        "dist": "10 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Chiang Rai",
        "kind": "Shopping Mall",
        "color": "#D97706",
        "lat": 19.896,
        "lon": 99.8335,
        "dist": "300 m"
      }
    ]
  },
  {
    "id": "escent-ayutthaya",
    "name": "Escent Ayutthaya",
    "brandId": "cpn",
    "brandName": "CPN / Central",
    "category": "คอนโดมิเนียมติดเซ็นทรัลอยุธยา",
    "categoryColor": "#D97706",
    "developer": "Central Pattana (CPN)",
    "developerSite": "https://www.centralpattana.co.th/",
    "image": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#D97706",
    "color": "#B45309",
    "height": 50,
    "floors": 14,
    "units": 396,
    "unitsPerFloor": 28,
    "parking": 140,
    "parkingRatio": "35%",
    "landRai": 2.1,
    "facilitiesM2": "Rooftop Sky Pool with Ayutthaya Heritage View",
    "priceRange": "฿2.2M – ฿5.8M",
    "district": "พระนครศรีอยุธยา",
    "location": "ติดเซ็นทรัล อยุธยา ถ.สายเอเชีย จ.พระนครศรีอยุธยา",
    "lat": 14.3315,
    "lon": 100.6045,
    "desc": "คอนโดมิเนียมติดศูนย์การค้าเซ็นทรัล อยุธยา สถาปัตยกรรมร่วมสมัยกลิ่นอายมรดกโลก พร้อมสระว่ายน้ำลอยฟ้าชั้น 14",
    "footprint": [
      [
        100.60408,
        14.331198
      ],
      [
        100.60492,
        14.331198
      ],
      [
        100.60492,
        14.331802
      ],
      [
        100.60408,
        14.331802
      ],
      [
        100.60408,
        14.331198
      ]
    ],
    "parts": [
      {
        "name": "Escent Ayutthaya Podium & Grounds",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            100.604,
            14.33114
          ],
          [
            100.605,
            14.33114
          ],
          [
            100.605,
            14.33186
          ],
          [
            100.604,
            14.33186
          ],
          [
            100.604,
            14.33114
          ]
        ]
      },
      {
        "name": "Escent Ayutthaya Main Structure",
        "color": "#B45309",
        "height": 44,
        "min_height": 14,
        "footprint": [
          [
            100.60415,
            14.331248
          ],
          [
            100.60485,
            14.331248
          ],
          [
            100.60485,
            14.331752
          ],
          [
            100.60415,
            14.331752
          ],
          [
            100.60415,
            14.331248
          ]
        ]
      },
      {
        "name": "Escent Ayutthaya Crown & Sky Deck",
        "color": "#EAB308",
        "height": 50,
        "min_height": 44,
        "footprint": [
          [
            100.60428,
            14.331342
          ],
          [
            100.60472,
            14.331342
          ],
          [
            100.60472,
            14.331658
          ],
          [
            100.60428,
            14.331658
          ],
          [
            100.60428,
            14.331342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "28.00 – 34.00 m²"
      },
      {
        "label": "2 Bedrooms",
        "size": "55.00 m²"
      }
    ],
    "transport": [
      {
        "name": "Ayutthaya Railway Station",
        "dist": "4.5 km",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "Central Ayutthaya",
        "kind": "Mega Mall",
        "color": "#D97706",
        "lat": 14.3325,
        "lon": 100.6055,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "food-jay-fai",
    "name": "เจ๊ไฝ (Raan Jay Fai)",
    "category": "สตรีทฟู้ด 1 ดาวมิชลิน",
    "categoryColor": "#EA580C",
    "type": "food",
    "brandId": "food",
    "brandName": "มิชลินไกด์ 1 ดาว",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#EA580C",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · ไข่เจียวปูในตำนาน (฿1,000–฿1,500)",
    "district": "พระนคร",
    "location": "327 ถนนมหาไชย แขวงสำราญราษฎร์ เขตพระนคร กรุงเทพฯ",
    "lat": 13.7525,
    "lon": 100.5048,
    "height": 18,
    "floors": 2,
    "developer": "เจ๊ไฝ (สุภิญญา จันสุตะ) · Michelin 1 Star",
    "developerSite": "https://guide.michelin.com/th/th/bangkok-region/bangkok/restaurant/jay-fai",
    "desc": "ตำนานสตรีทฟู้ดไทยระดับโลกที่คว้า 1 ดาวมิชลินอย่างต่อเนื่อง เจ๊ไฝปรุงอาหารด้วยกระทะเตาถ่านไฟแรงสูงและแว่นตาดำน้ำอันเป็นเอกลักษณ์ เมนูขึ้นชื่อคือไข่เจียวปูไซส์ยักษ์ อัดแน่นด้วยเนื้อปูก้อนสดหวานกรอบนอกนุ่มฉ่ำไร้น้ำมัน ผัดขี้เมาทะเลรสจัดจ้าน และโจ๊กแห้งซีฟู้ด",
    "footprint": [
      [
        100.50445,
        13.752248
      ],
      [
        100.50515,
        13.752248
      ],
      [
        100.50515,
        13.752752
      ],
      [
        100.50445,
        13.752752
      ],
      [
        100.50445,
        13.752248
      ]
    ],
    "parts": [
      {
        "name": "เจ๊ไฝ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.50435,
            13.752176
          ],
          [
            100.50525,
            13.752176
          ],
          [
            100.50525,
            13.752824
          ],
          [
            100.50435,
            13.752824
          ],
          [
            100.50435,
            13.752176
          ]
        ]
      },
      {
        "name": "เจ๊ไฝ Main Structure",
        "color": "#EA580C",
        "height": 16,
        "min_height": 8,
        "footprint": [
          [
            100.5045,
            13.752284
          ],
          [
            100.5051,
            13.752284
          ],
          [
            100.5051,
            13.752716
          ],
          [
            100.5045,
            13.752716
          ],
          [
            100.5045,
            13.752284
          ]
        ]
      },
      {
        "name": "เจ๊ไฝ Crown / Roof",
        "color": "#F59E0B",
        "height": 18,
        "min_height": 16,
        "footprint": [
          [
            100.50462,
            13.75237
          ],
          [
            100.50498,
            13.75237
          ],
          [
            100.50498,
            13.75263
          ],
          [
            100.50462,
            13.75263
          ],
          [
            100.50462,
            13.75237
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ไข่เจียวปู (Crab Omelette)",
        "size": "฿1,500 (เนื้อปูก้อนแน่นเต็มคำ)"
      },
      {
        "label": "ผัดขี้เมาทะเล (Drunken Seafood Noodles)",
        "size": "฿800 – ฿1,000"
      },
      {
        "label": "โจ๊กแห้งทะเล (Dry Seafood Congee)",
        "size": "฿600 – ฿800"
      },
      {
        "label": "ต้มยำกุ้งน้ำใสกระทะเหล็ก",
        "size": "฿1,000"
      }
    ],
    "transport": [
      {
        "name": "MRT สามยอด (ทางออก 1)",
        "dist": "450 m",
        "type": "mrt"
      },
      {
        "name": "ท่าเรือผ่านฟ้าลีลาศ (คลองแสนแสบ)",
        "dist": "500 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ทิพย์สมัย ผัดไทยประตูผี",
        "kind": "Food",
        "color": "#F97316",
        "lat": 13.7528,
        "lon": 100.5049,
        "dist": "30 m"
      },
      {
        "name": "วัดสระเกศ (ภูเขาทอง)",
        "kind": "Travel",
        "color": "#FBBF24",
        "lat": 13.7538,
        "lon": 100.5066,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "food-thipsamai",
    "name": "ทิพย์สมัย ผัดไทยประตูผี",
    "category": "ผัดไทยต้นตำรับ มิชลิน บิบ กูร์มองด์",
    "categoryColor": "#F97316",
    "type": "food",
    "brandId": "food",
    "brandName": "บิบ กูร์มองด์",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#EA580C",
    "image": "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · ผัดไทยห่อไข่กุ้งสด (฿90–฿300)",
    "district": "พระนคร",
    "location": "313 ถนนมหาไชย แขวงสำราญราษฎร์ เขตพระนคร กรุงเทพฯ",
    "lat": 13.7528,
    "lon": 100.5049,
    "height": 20,
    "floors": 3,
    "developer": "ทิพย์สมัย (เปิดให้บริการมาตั้งแต่ พ.ศ. 2482)",
    "developerSite": "https://thipsamai.com/",
    "desc": "ผัดไทยที่โด่งดังที่สุดในประเทศไทยและระดับสากล ใช้เส้นจันท์เหนียวนุ่มผัดด้วยมันกุ้งสูตรลับเฉพาะบนเตาถ่าน ห่อไข่บางเฉียบสีทองอร่าม เสิร์ฟพร้อมกุ้งสดตัวโต และมีน้ำส้มคั้นสดในตำนานที่คัดสรรส้มแท้หวานชื่นใจ",
    "footprint": [
      [
        100.50455,
        13.752548
      ],
      [
        100.50525,
        13.752548
      ],
      [
        100.50525,
        13.753052
      ],
      [
        100.50455,
        13.753052
      ],
      [
        100.50455,
        13.752548
      ]
    ],
    "parts": [
      {
        "name": "ทิพย์สมัย Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.50445,
            13.752476
          ],
          [
            100.50535,
            13.752476
          ],
          [
            100.50535,
            13.753124
          ],
          [
            100.50445,
            13.753124
          ],
          [
            100.50445,
            13.752476
          ]
        ]
      },
      {
        "name": "ทิพย์สมัย Main Structure",
        "color": "#EA580C",
        "height": 18,
        "min_height": 8,
        "footprint": [
          [
            100.5046,
            13.752584
          ],
          [
            100.5052,
            13.752584
          ],
          [
            100.5052,
            13.753016
          ],
          [
            100.5046,
            13.753016
          ],
          [
            100.5046,
            13.752584
          ]
        ]
      },
      {
        "name": "ทิพย์สมัย Crown / Roof",
        "color": "#FB923C",
        "height": 20,
        "min_height": 18,
        "footprint": [
          [
            100.50472,
            13.75267
          ],
          [
            100.50508,
            13.75267
          ],
          [
            100.50508,
            13.75293
          ],
          [
            100.50472,
            13.75293
          ],
          [
            100.50472,
            13.75267
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ผัดไทยเส้นจันท์ใส่มันกุ้ง ห่อไข่",
        "size": "฿120"
      },
      {
        "label": "ผัดไทยทรงเครื่อง กุ้งทะเลสด",
        "size": "฿300 – ฿500"
      },
      {
        "label": "น้ำส้มคั้นแท้ 100% (ขวดใหญ่)",
        "size": "฿160 – ฿200 (ตามฤดูกาล)"
      }
    ],
    "transport": [
      {
        "name": "MRT สามยอด",
        "dist": "480 m",
        "type": "mrt"
      },
      {
        "name": "ท่าเรือผ่านฟ้าลีลาศ",
        "dist": "480 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เจ๊ไฝ ประตูผี",
        "kind": "Food",
        "color": "#EA580C",
        "lat": 13.7525,
        "lon": 100.5048,
        "dist": "30 m"
      },
      {
        "name": "โลหะปราสาท วัดราชนัดดา",
        "kind": "Culture",
        "color": "#F59E0B",
        "lat": 13.7551,
        "lon": 100.5042,
        "dist": "280 m"
      }
    ]
  },
  {
    "id": "food-jeh-o",
    "name": "เจ๊โอว ข้าวต้มเป็ด & มาม่าโอ้โห",
    "category": "สตรีทฟู้ดยอดนิยม มิชลิน บิบ กูร์มองด์",
    "categoryColor": "#DC2626",
    "type": "food",
    "brandId": "food",
    "brandName": "บรรทัดทอง ฮิต",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#DC2626",
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · มาม่าต้มยำหม้อไฟ (฿150–฿350)",
    "district": "ปทุมวัน",
    "location": "113 ซอยจรัสเมือง แขวงรองเมือง เขตปทุมวัน กรุงเทพฯ (ย่านบรรทัดทอง)",
    "lat": 13.7431,
    "lon": 100.5222,
    "height": 18,
    "floors": 2,
    "developer": "ร้านเจ๊โอว ข้าวต้มเป็ด (เปิดมานานกว่า 60 ปี)",
    "developerSite": "https://guide.michelin.com/th/th/bangkok-region/bangkok/restaurant/jeh-o-chula",
    "desc": "ร้านขวัญใจคนนอนดึกและนักท่องเที่ยวทั่วโลกแห่งย่านบรรทัดทอง-จุฬาฯ ไฮไลท์เด็ดคือ 'มาม่าโอ้โห' มาม่าต้มยำน้ำข้นรสจัดจ้าน หม้อไฟยักษ์ใส่หมูกรอบ ไข่ดิบ หมูสับปั้นก้อน และซีฟู้ดสดใหม่ พร้อมเมนูคอหมูกรอบทอดกรุบกรอบ ยำแซลมอนแซ่บซี้ด",
    "footprint": [
      [
        100.52185,
        13.742848
      ],
      [
        100.52255,
        13.742848
      ],
      [
        100.52255,
        13.743352
      ],
      [
        100.52185,
        13.743352
      ],
      [
        100.52185,
        13.742848
      ]
    ],
    "parts": [
      {
        "name": "เจ๊โอว Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.52175,
            13.742776
          ],
          [
            100.52265,
            13.742776
          ],
          [
            100.52265,
            13.743424
          ],
          [
            100.52175,
            13.743424
          ],
          [
            100.52175,
            13.742776
          ]
        ]
      },
      {
        "name": "เจ๊โอว Main Structure",
        "color": "#DC2626",
        "height": 16,
        "min_height": 8,
        "footprint": [
          [
            100.5219,
            13.742884
          ],
          [
            100.5225,
            13.742884
          ],
          [
            100.5225,
            13.743316
          ],
          [
            100.5219,
            13.743316
          ],
          [
            100.5219,
            13.742884
          ]
        ]
      },
      {
        "name": "เจ๊โอว Crown / Roof",
        "color": "#F87171",
        "height": 18,
        "min_height": 16,
        "footprint": [
          [
            100.52202,
            13.74297
          ],
          [
            100.52238,
            13.74297
          ],
          [
            100.52238,
            13.74323
          ],
          [
            100.52202,
            13.74323
          ],
          [
            100.52202,
            13.74297
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "มาม่าโอ้โหหน้ารวมมิตรทะเล (หม้อไฟ)",
        "size": "฿300"
      },
      {
        "label": "หมูกรอบเจ๊โอว (จานเล็ก/จานใหญ่)",
        "size": "฿120 / ฿200"
      },
      {
        "label": "ยำแซลมอนพริกสดจัดจ้าน",
        "size": "฿250 – ฿400"
      },
      {
        "label": "เต้าหู้ไข่ผัดพริกเกลือ",
        "size": "฿100"
      }
    ],
    "transport": [
      {
        "name": "BTS สนามกีฬาแห่งชาติ",
        "dist": "850 m",
        "type": "bts"
      },
      {
        "name": "MRT หัวลำโพง",
        "dist": "950 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ถนนบรรทัดทอง แหล่งสตรีทฟู้ด",
        "kind": "Food",
        "color": "#EF4444",
        "lat": 13.742,
        "lon": 100.5228,
        "dist": "150 m"
      },
      {
        "name": "สเตเดียม วัน (Stadium One)",
        "kind": "Sport",
        "color": "#3B82F6",
        "lat": 13.745,
        "lon": 100.524,
        "dist": "400 m"
      }
    ]
  },
  {
    "id": "food-mont-nomsod",
    "name": "มนต์ นมสด (เสาชิงช้า)",
    "category": "ขนมปังปิ้งเนยสด & นมสดในตำนาน",
    "categoryColor": "#F59E0B",
    "type": "food",
    "brandId": "food",
    "brandName": "ตำนานเสาชิงช้า",
    "badgeType": "brand",
    "badgeBg": "#D97706",
    "color": "#D97706",
    "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · ขนมปังปิ้งสังขยา (฿30–฿90)",
    "district": "พระนคร",
    "location": "160/1-3 ถนนดินสอ แขวงเสาชิงช้า เขตพระนคร กรุงเทพฯ",
    "lat": 13.754,
    "lon": 100.5015,
    "height": 18,
    "floors": 3,
    "developer": "มนต์ นมสด (ตั้งแต่ พ.ศ. 2507)",
    "developerSite": "http://www.mont-nomsod.com/",
    "desc": "ร้านขนมปังปิ้งและนมสดระดับตำนานของพระนครหน้าศาลาว่าการ กทม. ขนมปังเนื้อนุ่มย่างหอมกรุ่น ปาดเนยสดแท้ ราดสังขยาใบเตย สังขยาไข่ ช็อกโกแลต หรือนมข้นหวานเยิ้มๆ ทานคู่กับนมสดร้อนหรือนมสดเย็นหอมมันสูตรเข้มข้น",
    "footprint": [
      [
        100.50115,
        13.753748
      ],
      [
        100.50185,
        13.753748
      ],
      [
        100.50185,
        13.754252
      ],
      [
        100.50115,
        13.754252
      ],
      [
        100.50115,
        13.753748
      ]
    ],
    "parts": [
      {
        "name": "มนต์ นมสด Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.50105,
            13.753676
          ],
          [
            100.50195,
            13.753676
          ],
          [
            100.50195,
            13.754324
          ],
          [
            100.50105,
            13.754324
          ],
          [
            100.50105,
            13.753676
          ]
        ]
      },
      {
        "name": "มนต์ นมสด Main Structure",
        "color": "#D97706",
        "height": 16,
        "min_height": 8,
        "footprint": [
          [
            100.5012,
            13.753784
          ],
          [
            100.5018,
            13.753784
          ],
          [
            100.5018,
            13.754216
          ],
          [
            100.5012,
            13.754216
          ],
          [
            100.5012,
            13.753784
          ]
        ]
      },
      {
        "name": "มนต์ นมสด Crown / Roof",
        "color": "#FDE047",
        "height": 18,
        "min_height": 16,
        "footprint": [
          [
            100.50132,
            13.75387
          ],
          [
            100.50168,
            13.75387
          ],
          [
            100.50168,
            13.75413
          ],
          [
            100.50132,
            13.75413
          ],
          [
            100.50132,
            13.75387
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ขนมปังปิ้งหน้าสังขยาใบเตย",
        "size": "฿30 / แผ่น"
      },
      {
        "label": "ขนมปังปิ้งเนยนมข้นหวาน",
        "size": "฿30 / แผ่น"
      },
      {
        "label": "นมสดเย็นหวานมัน (แก้ว/ขวด)",
        "size": "฿45 / ฿65"
      }
    ],
    "transport": [
      {
        "name": "MRT สามยอด",
        "dist": "750 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เสาชิงช้า & ลานคนเมือง",
        "kind": "Landmark",
        "color": "#DC2626",
        "lat": 13.7518,
        "lon": 100.5014,
        "dist": "220 m"
      },
      {
        "name": "วัดสุทัศนเทพวราราม",
        "kind": "Culture",
        "color": "#EAB308",
        "lat": 13.7511,
        "lon": 100.5012,
        "dist": "300 m"
      }
    ]
  },
  {
    "id": "food-yaowarat-guayjub",
    "name": "ก๋วยจั๊บนายเอ็ก เยาวราช",
    "category": "ก๋วยจั๊บน้ำใสพริกไทยดำ มิชลิน บิบ กูร์มองด์",
    "categoryColor": "#DC2626",
    "type": "food",
    "brandId": "food",
    "brandName": "เยาวราช ไนท์ฟู้ด",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#DC2626",
    "image": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · หมูกรอบ & ก๋วยจั๊บ (฿80–฿150)",
    "district": "สัมพันธวงศ์",
    "location": "442 ซอยเยาวราช 9 ถนนเยาวราช แขวงสัมพันธ์วงศ์ กรุงเทพฯ",
    "lat": 13.7415,
    "lon": 100.5085,
    "height": 18,
    "floors": 3,
    "developer": "นายเอ็ก (สูตรดั้งเดิมกว่า 60 ปี)",
    "developerSite": "https://guide.michelin.com/th/th/bangkok-region/bangkok/restaurant/nai-ek-roll-noodles",
    "desc": "ก๋วยจั๊บน้ำใสระดับไอคอนิคบนถนนเยาวราช น้ำซุปเคี่ยวกระดูกหมูเข้มข้นหอมพริกไทยดำร้อนแรงซดคล่องคอ เครื่องในสดสะอาดไร้กลิ่นคาว และหมูกรอบหนังบางกรอบสะท้านฟัน เสิร์ฟพร้อมซุปซี่โครงหมูตุ๋นเยื่อไผ่",
    "footprint": [
      [
        100.50815,
        13.741248
      ],
      [
        100.50885,
        13.741248
      ],
      [
        100.50885,
        13.741752
      ],
      [
        100.50815,
        13.741752
      ],
      [
        100.50815,
        13.741248
      ]
    ],
    "parts": [
      {
        "name": "ก๋วยจั๊บนายเอ็ก Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.50805,
            13.741176
          ],
          [
            100.50895,
            13.741176
          ],
          [
            100.50895,
            13.741824
          ],
          [
            100.50805,
            13.741824
          ],
          [
            100.50805,
            13.741176
          ]
        ]
      },
      {
        "name": "ก๋วยจั๊บนายเอ็ก Main Structure",
        "color": "#DC2626",
        "height": 16,
        "min_height": 8,
        "footprint": [
          [
            100.5082,
            13.741284
          ],
          [
            100.5088,
            13.741284
          ],
          [
            100.5088,
            13.741716
          ],
          [
            100.5082,
            13.741716
          ],
          [
            100.5082,
            13.741284
          ]
        ]
      },
      {
        "name": "ก๋วยจั๊บนายเอ็ก Crown / Roof",
        "color": "#F87171",
        "height": 18,
        "min_height": 16,
        "footprint": [
          [
            100.50832,
            13.74137
          ],
          [
            100.50868,
            13.74137
          ],
          [
            100.50868,
            13.74163
          ],
          [
            100.50832,
            13.74163
          ],
          [
            100.50832,
            13.74137
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ก๋วยจั๊บน้ำใสรวมมิตรหมูกรอบ",
        "size": "฿80 – ฿100"
      },
      {
        "label": "หมูกรอบจานเดี่ยวพิเศษ",
        "size": "฿150 – ฿200"
      },
      {
        "label": "ซี่โครงหมูตุ๋นยาจีนเยื่อไผ่",
        "size": "฿120"
      }
    ],
    "transport": [
      {
        "name": "MRT วัดมังกร (ทางออก 1)",
        "dist": "250 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "วัดมังกรกมลาวาส (เล่งเน่ยยี่)",
        "kind": "Temple",
        "color": "#EF4444",
        "lat": 13.7435,
        "lon": 100.5095,
        "dist": "220 m"
      },
      {
        "name": "ซุ้มประตูเฉลิมพระเกียรติ เยาวราช",
        "kind": "Landmark",
        "color": "#F59E0B",
        "lat": 13.738,
        "lon": 100.5135,
        "dist": "600 m"
      }
    ]
  },
  {
    "id": "food-goang-pratunam",
    "name": "โกอ่างข้าวมันไก่ ประตูน้ำ",
    "category": "ข้าวมันไก่ในตำนาน มิชลิน บิบ กูร์มองด์",
    "categoryColor": "#16A34A",
    "type": "food",
    "brandId": "food",
    "brandName": "บิบ กูร์มองด์",
    "badgeType": "brand",
    "badgeBg": "#16A34A",
    "color": "#16A34A",
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · ข้าวมันไก่ตอนสูตรเด็ด (฿60–฿150)",
    "district": "ราชเทวี",
    "location": "962 ถนนเพชรบุรี แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ (แยกประตูน้ำ)",
    "lat": 13.7498,
    "lon": 100.5412,
    "height": 20,
    "floors": 3,
    "developer": "โกอ่าง (เสื้อสีชมพู ก่อตั้ง พ.ศ. 2503)",
    "developerSite": "https://guide.michelin.com/th/th/bangkok-region/bangkok/restaurant/go-ang-pratu-nam-chicken-rice-pratu-nam",
    "desc": "ข้าวมันไก่ตอนเสื้อชมพูแห่งย่านประตูน้ำ ข้าวหอมมะลิหุงด้วยน้ำมันไก่และสมุนไพรหอมกรุ่นเม็ดเรียงสวย เนื้อไก่ตอนนุ่มฉ่ำไร้กลิ่นคาว น้ำจิ้มเต้าเจี้ยวปรุงรสสูตรเฉพาะเข้มข้นกลมกล่อม พร้อมน้ำซุปกระดูกไก่ร้อนๆ",
    "footprint": [
      [
        100.54085,
        13.749548
      ],
      [
        100.54155,
        13.749548
      ],
      [
        100.54155,
        13.750052
      ],
      [
        100.54085,
        13.750052
      ],
      [
        100.54085,
        13.749548
      ]
    ],
    "parts": [
      {
        "name": "โกอ่าง ประตูน้ำ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.54075,
            13.749476
          ],
          [
            100.54165,
            13.749476
          ],
          [
            100.54165,
            13.750124
          ],
          [
            100.54075,
            13.750124
          ],
          [
            100.54075,
            13.749476
          ]
        ]
      },
      {
        "name": "โกอ่าง ประตูน้ำ Main Structure",
        "color": "#16A34A",
        "height": 18,
        "min_height": 8,
        "footprint": [
          [
            100.5409,
            13.749584
          ],
          [
            100.5415,
            13.749584
          ],
          [
            100.5415,
            13.750016
          ],
          [
            100.5409,
            13.750016
          ],
          [
            100.5409,
            13.749584
          ]
        ]
      },
      {
        "name": "โกอ่าง ประตูน้ำ Crown / Roof",
        "color": "#4ADE80",
        "height": 20,
        "min_height": 18,
        "footprint": [
          [
            100.54102,
            13.74967
          ],
          [
            100.54138,
            13.74967
          ],
          [
            100.54138,
            13.74993
          ],
          [
            100.54102,
            13.74993
          ],
          [
            100.54102,
            13.74967
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ข้าวมันไก่ตอนต้ม (ธรรมดา/พิเศษ)",
        "size": "฿60 / ฿80"
      },
      {
        "label": "เนื้อไก่ตอนสับจานใหญ่",
        "size": "฿150 – ฿200"
      },
      {
        "label": "เป็ดตุ๋นเห็ดหอม / มะระซี่โครงหมู",
        "size": "฿70"
      }
    ],
    "transport": [
      {
        "name": "BTS ชิดลม (เดินเชื่อม Skywalk)",
        "dist": "650 m",
        "type": "bts"
      },
      {
        "name": "ท่าเรือประตูน้ำ (คลองแสนแสบ)",
        "dist": "150 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เดอะ มาร์เก็ต แบงคอก & แพลทินัม",
        "kind": "Shopping",
        "color": "#3B82F6",
        "lat": 13.7505,
        "lon": 100.5398,
        "dist": "120 m"
      },
      {
        "name": "เซ็นทรัลเวิลด์ (CentralWorld)",
        "kind": "Mall",
        "color": "#DC2626",
        "lat": 13.7472,
        "lon": 100.5392,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "food-charoensaeng-silom",
    "name": "ขาหมูเจริญแสงสีลม",
    "category": "ขาหมูพะโล้ในตำนาน มิชลิน บิบ กูร์มองด์",
    "categoryColor": "#9333EA",
    "type": "food",
    "brandId": "food",
    "brandName": "บิบ กูร์มองด์",
    "badgeType": "brand",
    "badgeBg": "#9333EA",
    "color": "#9333EA",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · ขาหมูเนื้อหนังนุ่มละลาย (฿60–฿300)",
    "district": "บางรัก",
    "location": "492/6 ซอยเจริญกรุง 49 ถนนสีลม แขวงสุริยวงศ์ เขตบางรัก กรุงเทพฯ",
    "lat": 13.7225,
    "lon": 100.5175,
    "height": 18,
    "floors": 2,
    "developer": "เจริญแสงสีลม (เปิดมานานกว่า 60 ปี)",
    "developerSite": "https://guide.michelin.com/th/th/bangkok-region/bangkok/restaurant/charoen-saeng-silom",
    "desc": "ขาหมูพะโล้ที่ได้รับการยกย่องว่าอร่อยที่สุดร้านหนึ่งในไทย ต้มเคี่ยวเครื่องยาจีนจนเนื้อและเอ็นนุ่มละลายในปาก หนังเด้งดึ๋ง น้ำพะโล้รสชาติกลมกล่อมเค็มหวานกำลังดี ทานคู่น้ำส้มพริกดองรสเปรี้ยวตัดเลี่ยนอย่างลงตัว",
    "footprint": [
      [
        100.51715,
        13.722248
      ],
      [
        100.51785,
        13.722248
      ],
      [
        100.51785,
        13.722752
      ],
      [
        100.51715,
        13.722752
      ],
      [
        100.51715,
        13.722248
      ]
    ],
    "parts": [
      {
        "name": "ขาหมูเจริญแสงสีลม Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.51705,
            13.722176
          ],
          [
            100.51795,
            13.722176
          ],
          [
            100.51795,
            13.722824
          ],
          [
            100.51705,
            13.722824
          ],
          [
            100.51705,
            13.722176
          ]
        ]
      },
      {
        "name": "ขาหมูเจริญแสงสีลม Main Structure",
        "color": "#9333EA",
        "height": 16,
        "min_height": 8,
        "footprint": [
          [
            100.5172,
            13.722284
          ],
          [
            100.5178,
            13.722284
          ],
          [
            100.5178,
            13.722716
          ],
          [
            100.5172,
            13.722716
          ],
          [
            100.5172,
            13.722284
          ]
        ]
      },
      {
        "name": "ขาหมูเจริญแสงสีลม Crown / Roof",
        "color": "#C084FC",
        "height": 18,
        "min_height": 16,
        "footprint": [
          [
            100.51732,
            13.72237
          ],
          [
            100.51768,
            13.72237
          ],
          [
            100.51768,
            13.72263
          ],
          [
            100.51732,
            13.72263
          ],
          [
            100.51732,
            13.72237
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ขาหมูใหญ่ทั้งขาพร้อมเนื้อหนังเอ็น",
        "size": "฿300"
      },
      {
        "label": "คากิ / ข้อคากินุ่มละลาย",
        "size": "฿80 – ฿150"
      },
      {
        "label": "เนื้อหนังล้วนจานเล็ก",
        "size": "฿60 – ฿100"
      }
    ],
    "transport": [
      {
        "name": "BTS สะพานตากสิน",
        "dist": "450 m",
        "type": "bts"
      },
      {
        "name": "ท่าเรือสาทร",
        "dist": "500 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "โรงพยาบาลเลิดสิน",
        "kind": "Health",
        "color": "#10B981",
        "lat": 13.7218,
        "lon": 100.5182,
        "dist": "100 m"
      },
      {
        "name": "สเตท ทาวเวอร์ (State Tower / Sirocco)",
        "kind": "Building",
        "color": "#6366F1",
        "lat": 13.7212,
        "lon": 100.5172,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "food-wattana-panich",
    "name": "วัฒนาพานิช ก๋วยเตี๋ยวเนื้อเอกมัย",
    "category": "ก๋วยเตี๋ยวเนื้อตุ๋นหม้อไฟ 50 ปี",
    "categoryColor": "#78350F",
    "type": "food",
    "brandId": "food",
    "brandName": "มิชลิน บิบ กูร์มองด์",
    "badgeType": "brand",
    "badgeBg": "#78350F",
    "color": "#78350F",
    "image": "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · เนื้อตุ๋นน้ำซุป 50 ปี (฿100–฿300)",
    "district": "วัฒนา",
    "location": "336-338 ซอยสุขุมวิท 63 (เอกมัย ซอย 18) คลองตันเหนือ วัฒนา กรุงเทพฯ",
    "lat": 13.7375,
    "lon": 100.5878,
    "height": 22,
    "floors": 3,
    "developer": "วัฒนาพานิช เอกมัย",
    "developerSite": "https://guide.michelin.com/th/th/bangkok-region/bangkok/restaurant/wattana-panich",
    "desc": "ร้านก๋วยเตี๋ยวเนื้อในตำนานที่มีหม้อเคี่ยวยักษ์หน้าเตาที่ตุ๋นต่อเนื่องยาวนานกว่า 50 ปี น้ำซุปเนื้อสีน้ำตาลเข้มหอมกลิ่นยาจีนและสมุนไพร เนื้อตุ๋นนุ่มเปื่อย เอ็นแก้วเคี้ยวหนึบ และลูกชิ้นเนื้อทำเองคุณภาพเยี่ยม",
    "footprint": [
      [
        100.58745,
        13.737248
      ],
      [
        100.58815,
        13.737248
      ],
      [
        100.58815,
        13.737752
      ],
      [
        100.58745,
        13.737752
      ],
      [
        100.58745,
        13.737248
      ]
    ],
    "parts": [
      {
        "name": "วัฒนาพานิช Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.58735,
            13.737176
          ],
          [
            100.58825,
            13.737176
          ],
          [
            100.58825,
            13.737824
          ],
          [
            100.58735,
            13.737824
          ],
          [
            100.58735,
            13.737176
          ]
        ]
      },
      {
        "name": "วัฒนาพานิช Main Structure",
        "color": "#78350F",
        "height": 19,
        "min_height": 8,
        "footprint": [
          [
            100.5875,
            13.737284
          ],
          [
            100.5881,
            13.737284
          ],
          [
            100.5881,
            13.737716
          ],
          [
            100.5875,
            13.737716
          ],
          [
            100.5875,
            13.737284
          ]
        ]
      },
      {
        "name": "วัฒนาพานิช Crown / Roof",
        "color": "#B45309",
        "height": 22,
        "min_height": 19,
        "footprint": [
          [
            100.58762,
            13.73737
          ],
          [
            100.58798,
            13.73737
          ],
          [
            100.58798,
            13.73763
          ],
          [
            100.58762,
            13.73763
          ],
          [
            100.58762,
            13.73737
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "เกาเหลาเนื้อตุ๋นรวมมิตร",
        "size": "฿120 – ฿150"
      },
      {
        "label": "เกาเหลาเนื้อเปื่อย+เอ็นแก้ว",
        "size": "฿150 – ฿200"
      },
      {
        "label": "หม้อไฟเนื้อตุ๋นหม้อใหญ่",
        "size": "฿300 – ฿500"
      }
    ],
    "transport": [
      {
        "name": "BTS เอกมัย",
        "dist": "1.8 km (ต่อวินมอเตอร์ไซค์ 5 นาที)",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ดองกิ มอลล์ ทองหล่อ (DONKI)",
        "kind": "Mall",
        "color": "#F59E0B",
        "lat": 13.7345,
        "lon": 100.5845,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "food-sorn",
    "name": "ศรณ์ (Sorn Fine Southern Thai)",
    "category": "อาหารใต้ไฟน์ไดนิ่ง 2 ดาวมิชลิน",
    "categoryColor": "#B91C1C",
    "type": "food",
    "brandId": "food",
    "brandName": "2 ดาวมิชลิน",
    "badgeType": "brand",
    "badgeBg": "#991B1B",
    "color": "#991B1B",
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    "rating": 4.9,
    "priceRange": "⭐ 4.9 · ไฟน์ไดนิ่งแดนใต้ (฿3,500–฿6,500)",
    "district": "คลองเตย",
    "location": "56 ซอยสุขุมวิท 26 แขวงคลองตัน เขตคลองเตย กรุงเทพฯ",
    "lat": 13.7225,
    "lon": 100.571,
    "height": 25,
    "floors": 2,
    "developer": "เชฟไอซ์ (ศุภักษร จงศิริ)",
    "developerSite": "https://guide.michelin.com/th/th/bangkok-region/bangkok/restaurant/sorn",
    "desc": "หนึ่งในร้านอาหารที่จองยากที่สุดในเอเชีย ได้รับ 2 ดาวมิชลิน ถ่ายทอดจิตวิญญาณแห่งรสชาติอาหารปักษ์ใต้แท้ๆ วัตถุดิบส่งตรงสดใหม่จาก 14 จังหวัดภาคใต้ทุกวัน ผ่านเทคนิคการปรุงแบบดั้งเดิมทั้งการหุงข้าวด้วยหม้อดินเตาถ่านและการคั่วพริกแกงมือ",
    "footprint": [
      [
        100.5706,
        13.722212
      ],
      [
        100.5714,
        13.722212
      ],
      [
        100.5714,
        13.722788
      ],
      [
        100.5706,
        13.722788
      ],
      [
        100.5706,
        13.722212
      ]
    ],
    "parts": [
      {
        "name": "ศรณ์ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.57055,
            13.722176
          ],
          [
            100.57145,
            13.722176
          ],
          [
            100.57145,
            13.722824
          ],
          [
            100.57055,
            13.722824
          ],
          [
            100.57055,
            13.722176
          ]
        ]
      },
      {
        "name": "ศรณ์ Main Structure",
        "color": "#991B1B",
        "height": 22,
        "min_height": 8,
        "footprint": [
          [
            100.5707,
            13.722284
          ],
          [
            100.5713,
            13.722284
          ],
          [
            100.5713,
            13.722716
          ],
          [
            100.5707,
            13.722716
          ],
          [
            100.5707,
            13.722284
          ]
        ]
      },
      {
        "name": "ศรณ์ Crown / Roof",
        "color": "#DC2626",
        "height": 25,
        "min_height": 22,
        "footprint": [
          [
            100.57082,
            13.72237
          ],
          [
            100.57118,
            13.72237
          ],
          [
            100.57118,
            13.72263
          ],
          [
            100.57082,
            13.72263
          ],
          [
            100.57082,
            13.72237
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Southern Thai Tasting Course",
        "size": "22-Course Set Menu"
      },
      {
        "label": "กรรเชียงปูม้าจิ้มน้ำพริกไข่ปู",
        "size": "Signature Course"
      },
      {
        "label": "ข้าวยำสมุนไพร 20 ชนิด",
        "size": "Heritage Selection"
      }
    ],
    "transport": [
      {
        "name": "BTS พร้อมพงษ์",
        "dist": "950 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "K-Village สุขุมวิท 26",
        "kind": "Mall",
        "color": "#10B981",
        "lat": 13.719,
        "lon": 100.5695,
        "dist": "400 m"
      }
    ]
  },
  {
    "id": "tour-grand-palace",
    "name": "วัดพระแก้ว & พระบรมมหาราชวัง",
    "category": "มรดกประวัติศาสตร์ & มหาวัดหลวง",
    "categoryColor": "#EAB308",
    "type": "travel",
    "brandId": "travel",
    "brandName": "แลนด์มาร์กประวัติศาสตร์",
    "badgeType": "brand",
    "badgeBg": "#CA8A04",
    "color": "#CA8A04",
    "image": "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=600&q=80",
    "rating": 4.9,
    "priceRange": "⭐ 4.9 · พระพุทธมหามณีรัตนปฏิมากร (ไทยฟรี/ต่างชาติ ฿500)",
    "district": "พระนคร",
    "location": "ถนนหน้าพระลาน แขวงพระบรมมหาราชวัง เขตพระนคร กรุงเทพฯ",
    "lat": 13.7515,
    "lon": 100.4925,
    "height": 55,
    "floors": 4,
    "developer": "พระบรมราชจักรีวงศ์ (สร้างขึ้น พ.ศ. 2325)",
    "developerSite": "https://www.royalgrandpalace.th/",
    "desc": "ศูนย์รวมจิตใจของชาวไทยและสถานที่ท่องเที่ยวอันดับหนึ่งของประเทศ สร้างขึ้นพร้อมกับการสถาปนากรุงรัตนโกสินทร์ เป็นที่ประดิษฐานพระแก้วมรกต พระพุทธรูปคู่บ้านคู่เมือง ชมพระอุโบสถ เจดีย์ทองคำ พระมณฑป และจิตรกรรมฝาผนังเรื่องรามเกียรติ์ที่ยาวที่สุดในโลก",
    "footprint": [
      [
        100.4918,
        13.750996
      ],
      [
        100.4932,
        13.750996
      ],
      [
        100.4932,
        13.752004
      ],
      [
        100.4918,
        13.752004
      ],
      [
        100.4918,
        13.750996
      ]
    ],
    "parts": [
      {
        "name": "วัดพระแก้ว Base & Platform",
        "color": "#1E293B",
        "height": 10,
        "min_height": 0,
        "footprint": [
          [
            100.49205,
            13.751176
          ],
          [
            100.49295,
            13.751176
          ],
          [
            100.49295,
            13.751824
          ],
          [
            100.49205,
            13.751824
          ],
          [
            100.49205,
            13.751176
          ]
        ]
      },
      {
        "name": "วัดพระแก้ว Main Structure",
        "color": "#CA8A04",
        "height": 48,
        "min_height": 10,
        "footprint": [
          [
            100.4922,
            13.751284
          ],
          [
            100.4928,
            13.751284
          ],
          [
            100.4928,
            13.751716
          ],
          [
            100.4922,
            13.751716
          ],
          [
            100.4922,
            13.751284
          ]
        ]
      },
      {
        "name": "วัดพระแก้ว Crown / Roof",
        "color": "#FDE047",
        "height": 55,
        "min_height": 48,
        "footprint": [
          [
            100.49232,
            13.75137
          ],
          [
            100.49268,
            13.75137
          ],
          [
            100.49268,
            13.75163
          ],
          [
            100.49232,
            13.75163
          ],
          [
            100.49232,
            13.75137
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "เวลาเปิดทำการ",
        "size": "08:30 – 15:30 น. (ทุกวัน)"
      },
      {
        "label": "อัตราค่าเข้าชม",
        "size": "คนไทยฟรี / ชาวต่างชาติ 500 บาท"
      },
      {
        "label": "การแต่งกาย",
        "size": "สุภาพเรียบร้อย ห้ามสวมกางเกงขาสั้น/เสื้อแขนกุด"
      }
    ],
    "transport": [
      {
        "name": "MRT สนามไชย (ทางออก 1)",
        "dist": "950 m",
        "type": "mrt"
      },
      {
        "name": "ท่าเรือช้าง (เรือด่วนเจ้าพระยา)",
        "dist": "450 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "วัดโพธิ์ (วัดพระเชตุพนฯ)",
        "kind": "Temple",
        "color": "#EAB308",
        "lat": 13.7465,
        "lon": 100.4933,
        "dist": "500 m"
      },
      {
        "name": "พิพิธภัณฑสถานแห่งชาติ พระนคร",
        "kind": "Museum",
        "color": "#6366F1",
        "lat": 13.757,
        "lon": 100.4925,
        "dist": "600 m"
      }
    ]
  },
  {
    "id": "tour-wat-arun",
    "name": "วัดอรุณราชวราราม (Wat Arun)",
    "category": "พระปรางค์ประธานริมแม่น้ำเจ้าพระยา",
    "categoryColor": "#7C3AED",
    "type": "travel",
    "brandId": "travel",
    "brandName": "จุดเช็คอินอันดับ 1",
    "badgeType": "brand",
    "badgeBg": "#7C3AED",
    "color": "#7C3AED",
    "image": "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80",
    "rating": 4.9,
    "priceRange": "⭐ 4.9 · พระปรางค์ริมน้ำ (ไทยฟรี/ต่างชาติ ฿200)",
    "district": "บางกอกใหญ่",
    "location": "158 ถนนวังเดิม แขวงวัดอรุณ เขตบางกอกใหญ่ กรุงเทพฯ",
    "lat": 13.7437,
    "lon": 100.4888,
    "height": 82,
    "floors": 5,
    "developer": "พระอารามหลวงชั้นเอกพิเศษ (บูรณะในสมัย ร.๒ - ร.๓)",
    "developerSite": "https://watarunbkk.com/",
    "desc": "สถาปัตยกรรมไทยอันเลื่องชื่อระดับโลก โดดเด่นด้วยพระปรางค์ประธานสูงสง่า 82 เมตร ประดับด้วยกระเบื้องเคลือบสีและถ้วยชามเบญจรงค์โบราณลวดลายวิจิตร งดงามเป็นพิเศษในยามเย็นเมื่อพระอาทิตย์อัสดงลับขอบฟ้าหลังแม่น้ำเจ้าพระยา",
    "footprint": [
      [
        100.4882,
        13.743268
      ],
      [
        100.4894,
        13.743268
      ],
      [
        100.4894,
        13.744132
      ],
      [
        100.4882,
        13.744132
      ],
      [
        100.4882,
        13.743268
      ]
    ],
    "parts": [
      {
        "name": "วัดอรุณฯ Base & Platform",
        "color": "#1E293B",
        "height": 15,
        "min_height": 0,
        "footprint": [
          [
            100.48835,
            13.743376
          ],
          [
            100.48925,
            13.743376
          ],
          [
            100.48925,
            13.744024
          ],
          [
            100.48835,
            13.744024
          ],
          [
            100.48835,
            13.743376
          ]
        ]
      },
      {
        "name": "วัดอรุณฯ Main Structure",
        "color": "#7C3AED",
        "height": 72,
        "min_height": 15,
        "footprint": [
          [
            100.4885,
            13.743484
          ],
          [
            100.4891,
            13.743484
          ],
          [
            100.4891,
            13.743916
          ],
          [
            100.4885,
            13.743916
          ],
          [
            100.4885,
            13.743484
          ]
        ]
      },
      {
        "name": "วัดอรุณฯ Crown / Roof",
        "color": "#A78BFA",
        "height": 82,
        "min_height": 72,
        "footprint": [
          [
            100.48862,
            13.74357
          ],
          [
            100.48898,
            13.74357
          ],
          [
            100.48898,
            13.74383
          ],
          [
            100.48862,
            13.74383
          ],
          [
            100.48862,
            13.74357
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "เวลาเปิดทำการ",
        "size": "08:00 – 18:00 น. (ทุกวัน)"
      },
      {
        "label": "อัตราค่าเข้าชม",
        "size": "คนไทยฟรี / ต่างชาติ 200 บาท"
      },
      {
        "label": "เช่าชุดไทยถ่ายภาพ",
        "size": "฿150 – ฿300 รอบบริเวณวัด"
      }
    ],
    "transport": [
      {
        "name": "MRT อิสรภาพ",
        "dist": "850 m",
        "type": "mrt"
      },
      {
        "name": "เรือข้ามฟากท่าเตียน - ท่าวัดอรุณ",
        "dist": "50 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "วัดกัลยาณมิตรวรมหาวิหาร",
        "kind": "Temple",
        "color": "#F59E0B",
        "lat": 13.7395,
        "lon": 100.4912,
        "dist": "550 m"
      }
    ]
  },
  {
    "id": "tour-wat-pho",
    "name": "วัดพระเชตุพนฯ (วัดโพธิ์)",
    "category": "พระนอนองค์ใหญ่ & มรดกนวดแผนไทย",
    "categoryColor": "#059669",
    "type": "travel",
    "brandId": "travel",
    "brandName": "มรดกความทรงจำโลก UNESCO",
    "badgeType": "brand",
    "badgeBg": "#059669",
    "color": "#059669",
    "image": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · พระนอนองค์ใหญ่ 46 ม. (ไทยฟรี/ต่างชาติ ฿300)",
    "district": "พระนคร",
    "location": "2 ถนนสนามไชย แขวงพระบรมมหาราชวัง เขตพระนคร กรุงเทพฯ",
    "lat": 13.7465,
    "lon": 100.4933,
    "height": 38,
    "floors": 3,
    "developer": "วัดประจำรัชกาลที่ ๑ (มหาวิทยาลัยแห่งแรกของไทย)",
    "developerSite": "http://www.watpho.com/",
    "desc": "มหาวิทยาลัยแห่งแรกของสยามประเทศ ขึ้นทะเบียนมรดกความทรงจำโลกแห่งยูเนสโก ประดิษฐานพระพุทธไสยาส (พระนอน) องค์ใหญ่ยาว 46 เมตร พระบาทประดับมุกภาพมงคล 108 ประการ พร้อมเป็นต้นกำเนิดและโรงเรียนนวดแผนโบราณวัดโพธิ์ที่มีชื่อเสียงก้องโลก",
    "footprint": [
      [
        100.4927,
        13.746068
      ],
      [
        100.4939,
        13.746068
      ],
      [
        100.4939,
        13.746932
      ],
      [
        100.4927,
        13.746932
      ],
      [
        100.4927,
        13.746068
      ]
    ],
    "parts": [
      {
        "name": "วัดโพธิ์ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.49285,
            13.746176
          ],
          [
            100.49375,
            13.746176
          ],
          [
            100.49375,
            13.746824
          ],
          [
            100.49285,
            13.746824
          ],
          [
            100.49285,
            13.746176
          ]
        ]
      },
      {
        "name": "วัดโพธิ์ Main Structure",
        "color": "#059669",
        "height": 33,
        "min_height": 8,
        "footprint": [
          [
            100.493,
            13.746284
          ],
          [
            100.4936,
            13.746284
          ],
          [
            100.4936,
            13.746716
          ],
          [
            100.493,
            13.746716
          ],
          [
            100.493,
            13.746284
          ]
        ]
      },
      {
        "name": "วัดโพธิ์ Crown / Roof",
        "color": "#34D399",
        "height": 38,
        "min_height": 33,
        "footprint": [
          [
            100.49312,
            13.74637
          ],
          [
            100.49348,
            13.74637
          ],
          [
            100.49348,
            13.74663
          ],
          [
            100.49312,
            13.74663
          ],
          [
            100.49312,
            13.74637
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "เวลาเปิดทำการ",
        "size": "08:00 – 18:30 น."
      },
      {
        "label": "บริการนวดแผนไทยวัดโพธิ์",
        "size": "฿320 – ฿500 / ชั่วโมง"
      },
      {
        "label": "มหาเจดีย์ 4 รัชกาล",
        "size": "เจดีย์ประดับกระเบื้องเคลือบ 4 องค์"
      }
    ],
    "transport": [
      {
        "name": "MRT สนามไชย (ทางออก 1 มิวเซียมสยาม)",
        "dist": "280 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "มิวเซียมสยาม (Museum Siam)",
        "kind": "Culture",
        "color": "#6366F1",
        "lat": 13.7442,
        "lon": 100.4942,
        "dist": "250 m"
      },
      {
        "name": "ท่าเตียน ริเวอร์วิว คาเฟ่",
        "kind": "Food",
        "color": "#F97316",
        "lat": 13.7455,
        "lon": 100.4908,
        "dist": "280 m"
      }
    ]
  },
  {
    "id": "tour-chatuchak-market",
    "name": "ตลาดนัดจตุจักร (Chatuchak Market)",
    "category": "ตลาดนัดวันหยุดที่ใหญ่ที่สุดในโลก",
    "categoryColor": "#DC2626",
    "type": "travel",
    "brandId": "travel",
    "brandName": "ช็อปปิ้งระดับโลก",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#DC2626",
    "image": "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · ช็อปปิ้งกว่า 15,000 ร้านค้า (เข้าฟรี)",
    "district": "จตุจักร",
    "location": "ถนนกำแพงเพชร 2 แขวงจตุจักร เขตจตุจักร กรุงเทพฯ",
    "lat": 13.7998,
    "lon": 100.5502,
    "height": 22,
    "floors": 2,
    "developer": "การรถไฟแห่งประเทศไทย / กรุงเทพมหานคร",
    "developerSite": "https://www.chatuchakmarket.org/",
    "desc": "ตลาดนัดสุดสัปดาห์ที่ใหญ่ที่สุดในโลก ครอบคลุมพื้นที่กว่า 68 ไร่ แบ่งเป็น 27 โครงการ รวมร้านค้ามากกว่า 15,000 แผง จำหน่ายสินค้าแฟชั่น วินเทจ งานคราฟต์ทำมือ สัตว์เลี้ยง ต้นไม้ อาหารสตรีทฟู้ด และของตกแต่งบ้าน ดึงดูดนักท่องเที่ยวกว่า 200,000 คนต่อวัน",
    "footprint": [
      [
        100.5494,
        13.799224
      ],
      [
        100.551,
        13.799224
      ],
      [
        100.551,
        13.800376
      ],
      [
        100.5494,
        13.800376
      ],
      [
        100.5494,
        13.799224
      ]
    ],
    "parts": [
      {
        "name": "ตลาดนัดจตุจักร Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.54975,
            13.799476
          ],
          [
            100.55065,
            13.799476
          ],
          [
            100.55065,
            13.800124
          ],
          [
            100.54975,
            13.800124
          ],
          [
            100.54975,
            13.799476
          ]
        ]
      },
      {
        "name": "ตลาดนัดจตุจักร Main Structure",
        "color": "#DC2626",
        "height": 19,
        "min_height": 8,
        "footprint": [
          [
            100.5499,
            13.799584
          ],
          [
            100.5505,
            13.799584
          ],
          [
            100.5505,
            13.800016
          ],
          [
            100.5499,
            13.800016
          ],
          [
            100.5499,
            13.799584
          ]
        ]
      },
      {
        "name": "ตลาดนัดจตุจักร Crown / Roof",
        "color": "#F87171",
        "height": 22,
        "min_height": 19,
        "footprint": [
          [
            100.55002,
            13.79967
          ],
          [
            100.55038,
            13.79967
          ],
          [
            100.55038,
            13.79993
          ],
          [
            100.55002,
            13.79993
          ],
          [
            100.55002,
            13.79967
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "เวลาเปิดตลาดเสาร์ - อาทิตย์",
        "size": "09:00 – 18:00 น."
      },
      {
        "label": "ตลาดกลางคืนวันศุกร์ (Wholesale)",
        "size": "18:00 – 24:00 น."
      },
      {
        "label": "ตลาดต้นไม้วันพุธ - พฤหัสบดี",
        "size": "07:00 – 18:00 น."
      }
    ],
    "transport": [
      {
        "name": "BTS หมอชิต (ทางออก 1)",
        "dist": "150 m",
        "type": "bts"
      },
      {
        "name": "MRT สวนจตุจักร (ทางออก 1)",
        "dist": "100 m",
        "type": "mrt"
      },
      {
        "name": "MRT กำแพงเพชร (ทางออก 2 โผล่ในตลาด)",
        "dist": "20 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "สวนจตุจักร & สวนรถไฟ",
        "kind": "Park",
        "color": "#10B981",
        "lat": 13.805,
        "lon": 100.555,
        "dist": "300 m"
      },
      {
        "name": "มิกซ์ จตุจักร (Mixt Chatuchak)",
        "kind": "Mall",
        "color": "#3B82F6",
        "lat": 13.8015,
        "lon": 100.551,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "tour-khaosan-road",
    "name": "ถนนข้าวสาร (Khaosan Road)",
    "category": "ศูนย์กลางแบ็กแพ็กเกอร์ & ไนต์ไลฟ์ระดับโลก",
    "categoryColor": "#8B5CF6",
    "type": "travel",
    "brandId": "travel",
    "brandName": "ไนต์ไลฟ์ กทม.",
    "badgeType": "brand",
    "badgeBg": "#7C3AED",
    "color": "#7C3AED",
    "image": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · แบ็กแพ็กเกอร์ & สตรีทบาร์ (เข้าฟรี)",
    "district": "พระนคร",
    "location": "ถนนข้าวสาร แขวงตลาดยอด เขตพระนคร กรุงเทพฯ",
    "lat": 13.7588,
    "lon": 100.4975,
    "height": 20,
    "floors": 3,
    "developer": "ถนนคนเดินสากล กรุงเทพมหานคร",
    "developerSite": "https://www.tourismthailand.org/",
    "desc": "ถนนสายตำนานระดับโลกศูนย์รวมนักท่องเที่ยวแบ็กแพ็กเกอร์จากทุกมุมโลก เต็มไปด้วยชีวิตชีวา บาร์ดนตรีสด ร้านอาหารสตรีทฟู้ด ผัดไทย โรตี แมลงทอด รอยสัก คาเฟ่ และโฮสเทล เป็นสถานที่จัดงานเทศกาลสงกรานต์ที่คึกคักที่สุดแห่งหนึ่งในกรุงเทพฯ",
    "footprint": [
      [
        100.49705,
        13.758476
      ],
      [
        100.49795,
        13.758476
      ],
      [
        100.49795,
        13.759124
      ],
      [
        100.49705,
        13.759124
      ],
      [
        100.49705,
        13.758476
      ]
    ],
    "parts": [
      {
        "name": "ถนนข้าวสาร Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.49705,
            13.758476
          ],
          [
            100.49795,
            13.758476
          ],
          [
            100.49795,
            13.759124
          ],
          [
            100.49705,
            13.759124
          ],
          [
            100.49705,
            13.758476
          ]
        ]
      },
      {
        "name": "ถนนข้าวสาร Main Structure",
        "color": "#7C3AED",
        "height": 18,
        "min_height": 8,
        "footprint": [
          [
            100.4972,
            13.758584
          ],
          [
            100.4978,
            13.758584
          ],
          [
            100.4978,
            13.759016
          ],
          [
            100.4972,
            13.759016
          ],
          [
            100.4972,
            13.758584
          ]
        ]
      },
      {
        "name": "ถนนข้าวสาร Crown / Roof",
        "color": "#C084FC",
        "height": 20,
        "min_height": 18,
        "footprint": [
          [
            100.49732,
            13.75867
          ],
          [
            100.49768,
            13.75867
          ],
          [
            100.49768,
            13.75893
          ],
          [
            100.49732,
            13.75893
          ],
          [
            100.49732,
            13.75867
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ช่วงเวลาคึกคัก",
        "size": "17:00 – 02:00 น. (คึกคักที่สุดยามค่ำคืน)"
      },
      {
        "label": "กิจกรรมยอดนิยม",
        "size": "ดนตรีสด, สตรีทฟู้ด, นวดแผนไทย, ไนต์คลับ"
      }
    ],
    "transport": [
      {
        "name": "ท่าเรือพระอาทิตย์ (เรือด่วนเจ้าพระยา)",
        "dist": "550 m",
        "type": "boat"
      },
      {
        "name": "MRT สามยอด",
        "dist": "1.8 km",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ป้อมพระสุเมรุ & สวนสันติชัยปราการ",
        "kind": "Park",
        "color": "#10B981",
        "lat": 13.7635,
        "lon": 100.495,
        "dist": "450 m"
      },
      {
        "name": "ถนนรามบุตรี",
        "kind": "Travel",
        "color": "#F59E0B",
        "lat": 13.76,
        "lon": 100.4965,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "tour-asiatique",
    "name": "เอเชียทีค เดอะ ริเวอร์ฟร้อนท์",
    "category": "ไลฟ์สไตล์ริมแม่น้ำ & ชิงช้าสวรรค์ยักษ์",
    "categoryColor": "#0284C7",
    "type": "travel",
    "brandId": "travel",
    "brandName": "เฟสติวัลริมเจ้าพระยา",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0284C7",
    "image": "https://images.unsplash.com/photo-1513415564515-763d91423bdd?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · ชิงช้าสวรรค์ Asiatique Sky (฿500)",
    "district": "บางคอแหลม",
    "location": "2194 ถนนเจริญกรุง แขวงวัดพระยาไกร เขตบางคอแหลม กรุงเทพฯ",
    "lat": 13.7042,
    "lon": 100.5032,
    "height": 60,
    "floors": 3,
    "developer": "Asset World Corporation (AWC)",
    "developerSite": "https://www.asiatiquethailand.com/",
    "desc": "ศูนย์การค้าเปิดโล่งริมแม่น้ำเจ้าพระยา ดัดแปลงมาจากท่าเรือและโกดังสินค้าเก่าของบริษัทอีสต์เอเชียติกยุค ร.๕ โดดเด่นด้วย 'Asiatique Sky' ชิงช้าสวรรค์ที่สูงที่สุดในไทย (60 เมตร) เรือใบโบราณสิริมหรรณพ ร้านอาหารริมน้ำ คาลิปโซ่คาบาเรต์ และร้านขายของที่ระลึกกว่า 1,500 ร้าน",
    "footprint": [
      [
        100.50255,
        13.703732
      ],
      [
        100.50385,
        13.703732
      ],
      [
        100.50385,
        13.704668
      ],
      [
        100.50255,
        13.704668
      ],
      [
        100.50255,
        13.703732
      ]
    ],
    "parts": [
      {
        "name": "เอเชียทีค Base & Platform",
        "color": "#1E293B",
        "height": 11,
        "min_height": 0,
        "footprint": [
          [
            100.50275,
            13.703876
          ],
          [
            100.50365,
            13.703876
          ],
          [
            100.50365,
            13.704524
          ],
          [
            100.50275,
            13.704524
          ],
          [
            100.50275,
            13.703876
          ]
        ]
      },
      {
        "name": "เอเชียทีค Main Structure",
        "color": "#0284C7",
        "height": 53,
        "min_height": 11,
        "footprint": [
          [
            100.5029,
            13.703984
          ],
          [
            100.5035,
            13.703984
          ],
          [
            100.5035,
            13.704416
          ],
          [
            100.5029,
            13.704416
          ],
          [
            100.5029,
            13.703984
          ]
        ]
      },
      {
        "name": "เอเชียทีค Crown / Roof",
        "color": "#38BDF8",
        "height": 60,
        "min_height": 53,
        "footprint": [
          [
            100.50302,
            13.70407
          ],
          [
            100.50338,
            13.70407
          ],
          [
            100.50338,
            13.70433
          ],
          [
            100.50302,
            13.70433
          ],
          [
            100.50302,
            13.70407
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ชิงช้าสวรรค์ Asiatique Sky (ผู้ใหญ่)",
        "size": "฿500 (วิวแม่น้ำมุมสูง 360°)"
      },
      {
        "label": "ม้าหมุนสองชั้น Carousel",
        "size": "฿150"
      },
      {
        "label": "เรือสิริมหรรณพ ดินเนอร์หรูริมน้ำ",
        "size": "฿1,200 – ฿3,500 / ท่าน"
      }
    ],
    "transport": [
      {
        "name": "BTS สะพานตากสิน (มีเรือรับส่งฟรี)",
        "dist": "มี Shuttle Boat ฟรีจากท่าสาทร",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เทอร์มินอล 21 พระราม 3",
        "kind": "Mall",
        "color": "#F59E0B",
        "lat": 13.6893,
        "lon": 100.5054,
        "dist": "1.6 km"
      }
    ]
  },
  {
    "id": "tour-mahanakhon-skywalk",
    "name": "มหานคร สกายวอล์ก (SkyWalk)",
    "category": "จุดชมวิวพื้นกระจกสูงที่สุดในไทย 314 ม.",
    "categoryColor": "#3B82F6",
    "type": "travel",
    "brandId": "travel",
    "brandName": "King Power Mahanakhon",
    "badgeType": "brand",
    "badgeBg": "#1D4ED8",
    "color": "#1D4ED8",
    "image": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · พื้นกระจกลอยฟ้าชั้น 78 (฿880–฿1,080)",
    "district": "บางรัก",
    "location": "ชั้น 74–78 อาคารคิง เพาเวอร์ มหานคร ถนนนราธิวาสราชนครินทร์ สีลม กรุงเทพฯ",
    "lat": 13.7238,
    "lon": 100.5285,
    "height": 314,
    "floors": 78,
    "developer": "King Power Group",
    "developerSite": "https://kingpowermahanakhon.co.th/skywalk/",
    "desc": "จุดชมวิวในร่มและกลางแจ้งที่สูงที่สุดในประเทศไทย ณ ความสูง 314 เมตรเหนือพื้นดิน ขึ้นลิฟต์ความเร็วสูงชมอนิเมชันสู่ชั้น 74 และเดินขึ้นไปยังชั้น 78 พบกับ 'The Glass Tray' พื้นกระจกลอยฟ้าท้าความกล้า สามารถมองเห็นวิวกรุงเทพฯ 360 องศาแบบพาโนรามาจรดขอบฟ้า",
    "footprint": [
      [
        100.52805,
        13.723476
      ],
      [
        100.52895,
        13.723476
      ],
      [
        100.52895,
        13.724124
      ],
      [
        100.52805,
        13.724124
      ],
      [
        100.52805,
        13.723476
      ]
    ],
    "parts": [
      {
        "name": "มหานคร สกายวอล์ก Base & Platform",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.52805,
            13.723476
          ],
          [
            100.52895,
            13.723476
          ],
          [
            100.52895,
            13.724124
          ],
          [
            100.52805,
            13.724124
          ],
          [
            100.52805,
            13.723476
          ]
        ]
      },
      {
        "name": "มหานคร สกายวอล์ก Main Structure",
        "color": "#1E3A8A",
        "height": 276,
        "min_height": 18,
        "footprint": [
          [
            100.5282,
            13.723584
          ],
          [
            100.5288,
            13.723584
          ],
          [
            100.5288,
            13.724016
          ],
          [
            100.5282,
            13.724016
          ],
          [
            100.5282,
            13.723584
          ]
        ]
      },
      {
        "name": "มหานคร สกายวอล์ก Crown / Roof",
        "color": "#60A5FA",
        "height": 314,
        "min_height": 276,
        "footprint": [
          [
            100.52832,
            13.72367
          ],
          [
            100.52868,
            13.72367
          ],
          [
            100.52868,
            13.72393
          ],
          [
            100.52832,
            13.72393
          ],
          [
            100.52832,
            13.72367
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "บัตรชมวิวกลางวัน (Day Pass)",
        "size": "฿880 (เข้าชม 10:00 - 16:00)"
      },
      {
        "label": "บัตรชมพระอาทิตย์ตก (Sunset Pass)",
        "size": "฿1,080 (16:00 - 19:00)"
      },
      {
        "label": "Mahanakhon Rooftop Bar",
        "size": "เครื่องดื่มค็อกเทล & ดีเจ"
      }
    ],
    "transport": [
      {
        "name": "BTS ช่องนนทรี (ทางออก 3 มีทางเชื่อมตรง)",
        "dist": "50 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ตึกเอ็มไพร์ ทาวเวอร์ (Empire Tower)",
        "kind": "Building",
        "color": "#64748B",
        "lat": 13.7203,
        "lon": 100.5301,
        "dist": "400 m"
      }
    ]
  },
  {
    "id": "tour-benjakitti-park",
    "name": "สวนป่าเบญจกิติ Skywalk",
    "category": "สวนป่าชุ่มน้ำใจกลางเมือง & สะพานลอยฟ้า",
    "categoryColor": "#10B981",
    "type": "travel",
    "brandId": "travel",
    "brandName": "ปอดสีเขียว กทม.",
    "badgeType": "brand",
    "badgeBg": "#059669",
    "color": "#059669",
    "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
    "rating": 4.9,
    "priceRange": "⭐ 4.9 · ทางเดินลอยฟ้า & ลานวิ่งเลครูปไข่ (เข้าฟรี)",
    "district": "คลองเตย",
    "location": "ถนนรัชดาภิเษก แขวงคลองเตย เขตคลองเตย กรุงเทพฯ",
    "lat": 13.7285,
    "lon": 100.5582,
    "height": 15,
    "floors": 1,
    "developer": "กรุงเทพมหานคร / กรมธนารักษ์ (เนื้อที่กว่า 450 ไร่)",
    "developerSite": "https://pr-bangkok.com/",
    "desc": "สวนสาธารณะเชิงนิเวศระดับเวิลด์คลาสใจกลางสุขุมวิท-อโศก พื้นที่ชุ่มน้ำบำบัดน้ำเสียตามธรรมชาติ โดดเด่นด้วย Skywalk ความยาวเกือบ 2 กิโลเมตร ทอดผ่านยอดไม้และบึงบัว มองเห็นเงาสะท้อนของตึกระฟ้าใจกลางเมือง เป็นจุดชมพระอาทิตย์ตก วิ่งออกกำลังกาย และถ่ายรูปยอดนิยม",
    "footprint": [
      [
        100.55735,
        13.727888
      ],
      [
        100.55905,
        13.727888
      ],
      [
        100.55905,
        13.729112
      ],
      [
        100.55735,
        13.729112
      ],
      [
        100.55735,
        13.727888
      ]
    ],
    "parts": [
      {
        "name": "สวนเบญจกิติ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.55775,
            13.728176
          ],
          [
            100.55865,
            13.728176
          ],
          [
            100.55865,
            13.728824
          ],
          [
            100.55775,
            13.728824
          ],
          [
            100.55775,
            13.728176
          ]
        ]
      },
      {
        "name": "สวนเบญจกิติ Main Structure",
        "color": "#059669",
        "height": 13,
        "min_height": 8,
        "footprint": [
          [
            100.5579,
            13.728284
          ],
          [
            100.5585,
            13.728284
          ],
          [
            100.5585,
            13.728716
          ],
          [
            100.5579,
            13.728716
          ],
          [
            100.5579,
            13.728284
          ]
        ]
      },
      {
        "name": "สวนเบญจกิติ Crown / Roof",
        "color": "#6EE7B7",
        "height": 15,
        "min_height": 13,
        "footprint": [
          [
            100.55802,
            13.72837
          ],
          [
            100.55838,
            13.72837
          ],
          [
            100.55838,
            13.72863
          ],
          [
            100.55802,
            13.72863
          ],
          [
            100.55802,
            13.72837
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "เวลาเปิดทำการ",
        "size": "05:00 – 21:00 น. (ทุกวัน เข้าฟรี)"
      },
      {
        "label": "Skywalk เดินชมธรรมชาติ",
        "size": "ความยาว 1.6 กม."
      },
      {
        "label": "ลู่วิ่งและทางจักรยานแยกอิสระ",
        "size": "ระยะทางรอบละ 2.8 กม."
      }
    ],
    "transport": [
      {
        "name": "MRT ศูนย์การประชุมแห่งชาติสิริกิติ์",
        "dist": "200 m",
        "type": "mrt"
      },
      {
        "name": "BTS อโศก (เดินผ่าน Skywalk สะพานเขียว)",
        "dist": "800 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ศูนย์การประชุมแห่งชาติสิริกิติ์ (QSNCC)",
        "kind": "Exhibition",
        "color": "#3B82F6",
        "lat": 13.7242,
        "lon": 100.559,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "bldg-one-bangkok",
    "name": "วัน แบงค็อก (One Bangkok)",
    "category": "อภิมหาโครงการมิกซ์ยูสระดับโลก",
    "categoryColor": "#0284C7",
    "type": "building",
    "brandId": "building",
    "brandName": "TCC & Frasers Property",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#0369A1",
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "rating": 4.9,
    "priceRange": "⭐ 4.9 · Signature Tower สูง 436 ม. (มูลค่า ฿120,000M)",
    "district": "ปทุมวัน",
    "location": "ถนนวิทยุ - ถนนพระราม 4 แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ",
    "lat": 13.7275,
    "lon": 100.5465,
    "height": 436,
    "floors": 92,
    "developer": "TCC Assets & Frasers Property Holdings",
    "developerSite": "https://www.onebangkok.com/",
    "desc": "โครงการพัฒนาอสังหาริมทรัพย์ภาคเอกชนที่ใหญ่ที่สุดในประวัติศาสตร์ไทย บนพื้นที่กว่า 108 ไร่หัวมุมถนนวิทยุตัดพระราม 4 รวมอาคารสำนักงานเกรดพรีเมียม 5 อาคาร โรงแรมหรู 5 แห่ง เช่น The Ritz-Carlton, Andaz ที่พักอาศัยระดับอัลตราลักชัวรี และพื้นที่รีเทล 3 โซน (Parade, The STOREYS, POST 1928)",
    "footprint": [
      [
        100.54585,
        13.727032
      ],
      [
        100.54715,
        13.727032
      ],
      [
        100.54715,
        13.727968
      ],
      [
        100.54585,
        13.727968
      ],
      [
        100.54585,
        13.727032
      ]
    ],
    "parts": [
      {
        "name": "One Bangkok Base & Platform",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.54605,
            13.727176
          ],
          [
            100.54695,
            13.727176
          ],
          [
            100.54695,
            13.727824
          ],
          [
            100.54605,
            13.727824
          ],
          [
            100.54605,
            13.727176
          ]
        ]
      },
      {
        "name": "One Bangkok Main Structure",
        "color": "#0F172A",
        "height": 384,
        "min_height": 18,
        "footprint": [
          [
            100.5462,
            13.727284
          ],
          [
            100.5468,
            13.727284
          ],
          [
            100.5468,
            13.727716
          ],
          [
            100.5462,
            13.727716
          ],
          [
            100.5462,
            13.727284
          ]
        ]
      },
      {
        "name": "One Bangkok Crown / Roof",
        "color": "#38BDF8",
        "height": 436,
        "min_height": 384,
        "footprint": [
          [
            100.54632,
            13.72737
          ],
          [
            100.54668,
            13.72737
          ],
          [
            100.54668,
            13.72763
          ],
          [
            100.54632,
            13.72763
          ],
          [
            100.54632,
            13.72737
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Signature Tower",
        "size": "สูง 436 ม. 92 ชั้น (ตึกสูงสุดในไทย)"
      },
      {
        "label": "One Bangkok Retail (Parade & STOREYS)",
        "size": "พื้นที่เช่า 160,000 m²"
      },
      {
        "label": "พื้นที่สวนและศิลปะสาธารณะ",
        "size": "50 ไร่ (Open Space & Art Loop)"
      }
    ],
    "transport": [
      {
        "name": "MRT ลุมพินี (ทางออกเชื่อมเข้าโครงการ)",
        "dist": "50 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "สวนลุมพินี",
        "kind": "Park",
        "color": "#10B981",
        "lat": 13.7314,
        "lon": 100.5417,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "bldg-centralworld",
    "name": "เซ็นทรัลเวิลด์ (CentralWorld)",
    "category": "ไลฟ์สไตล์เดสติเนชันใจกลางราชประสงค์",
    "categoryColor": "#DC2626",
    "type": "building",
    "brandId": "building",
    "brandName": "Central Pattana (CPN)",
    "badgeType": "brand",
    "badgeBg": "#B91C1C",
    "color": "#B91C1C",
    "image": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · ศูนย์การค้าใหญ่ติดอันดับโลก (830,000 m²)",
    "district": "ปทุมวัน",
    "location": "999/9 ถนนพระรามที่ 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ",
    "lat": 13.7472,
    "lon": 100.5392,
    "height": 186,
    "floors": 55,
    "developer": "เซ็นทรัลพัฒนา (CPN)",
    "developerSite": "https://www.centralworld.co.th/",
    "desc": "ศูนย์การค้าใจกลางราชประสงค์ที่มีพื้นที่ขนาดใหญ่ที่สุดแห่งหนึ่งของโลก รวมแฟลกชิปสโตร์ระดับโลก Apple Central World, Shake Shack, Kinokuniya, ลานสเก็ตน้ำแข็ง, โซน Groove และลานหน้าเซ็นทรัลเวิลด์ที่เป็นเวทีจัดงานเคานต์ดาวน์ระดับโลก 'Times Square of Asia'",
    "footprint": [
      [
        100.53855,
        13.746732
      ],
      [
        100.53985,
        13.746732
      ],
      [
        100.53985,
        13.747668
      ],
      [
        100.53855,
        13.747668
      ],
      [
        100.53855,
        13.746732
      ]
    ],
    "parts": [
      {
        "name": "CentralWorld Base & Platform",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.53875,
            13.746876
          ],
          [
            100.53965,
            13.746876
          ],
          [
            100.53965,
            13.747524
          ],
          [
            100.53875,
            13.747524
          ],
          [
            100.53875,
            13.746876
          ]
        ]
      },
      {
        "name": "CentralWorld Main Structure",
        "color": "#991B1B",
        "height": 164,
        "min_height": 18,
        "footprint": [
          [
            100.5389,
            13.746984
          ],
          [
            100.5395,
            13.746984
          ],
          [
            100.5395,
            13.747416
          ],
          [
            100.5389,
            13.747416
          ],
          [
            100.5389,
            13.746984
          ]
        ]
      },
      {
        "name": "CentralWorld Crown / Roof",
        "color": "#F87171",
        "height": 186,
        "min_height": 164,
        "footprint": [
          [
            100.53902,
            13.74707
          ],
          [
            100.53938,
            13.74707
          ],
          [
            100.53938,
            13.74733
          ],
          [
            100.53902,
            13.74733
          ],
          [
            100.53902,
            13.74707
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "พื้นที่ศูนย์การค้ารวม",
        "size": "830,000 m² (ร้านค้ากว่า 500 ร้าน)"
      },
      {
        "label": "อาคาร the offices at centralwOrld",
        "size": "สูง 45 ชั้น สำนักงานเกรด A"
      },
      {
        "label": "โรงแรมเซ็นทารา แกรนด์ฯ",
        "size": "55 ชั้น พร้อมห้องพัก 505 ห้อง"
      }
    ],
    "transport": [
      {
        "name": "BTS ชิดลม (Skywalk เชื่อมตรง)",
        "dist": "250 m",
        "type": "bts"
      },
      {
        "name": "BTS สยาม (Skywalk เชื่อมตรง)",
        "dist": "400 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ศาลท้าวมหาพรหม เอราวัณ",
        "kind": "Culture",
        "color": "#F59E0B",
        "lat": 13.7443,
        "lon": 100.5404,
        "dist": "200 m"
      }
    ]
  },
  {
    "id": "bldg-siam-paragon",
    "name": "สยามพารากอน (Siam Paragon)",
    "category": "เวิลด์คลาสช็อปปิ้งเดสติเนชัน",
    "categoryColor": "#1E3A8A",
    "type": "building",
    "brandId": "building",
    "brandName": "Siam Piwat & The Mall Group",
    "badgeType": "brand",
    "badgeBg": "#1E3A8A",
    "color": "#1E3A8A",
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · ลักชัวรีแบรนด์ & SEA LIFE Bangkok",
    "district": "ปทุมวัน",
    "location": "991 ถนนพระรามที่ 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ",
    "lat": 13.7461,
    "lon": 100.5347,
    "height": 65,
    "floors": 8,
    "developer": "บริษัท สยามพิวรรธน์ จำกัด & เดอะมอลล์ กรุ๊ป",
    "developerSite": "https://www.siamparagon.co.th/",
    "desc": "ศูนย์การค้าลักชัวรีระดับตำนานใจกลางสยาม รวมแบรนด์แฟชั่นระดับไฮเอนด์ Hermès, Chanel, Louis Vuitton, Rolex โชว์รูมซูเปอร์คาร์ Ferrari, Rolls-Royce, พิพิธภัณฑ์สัตว์น้ำ SEA LIFE Bangkok Ocean World ใต้ดินที่ใหญ่ที่สุดในเอเชียตะวันออกเฉียงใต้ และกูร์เมต์มาร์เก็ต",
    "footprint": [
      [
        100.5341,
        13.745668
      ],
      [
        100.5353,
        13.745668
      ],
      [
        100.5353,
        13.746532
      ],
      [
        100.5341,
        13.746532
      ],
      [
        100.5341,
        13.745668
      ]
    ],
    "parts": [
      {
        "name": "Siam Paragon Base & Platform",
        "color": "#1E293B",
        "height": 12,
        "min_height": 0,
        "footprint": [
          [
            100.53425,
            13.745776
          ],
          [
            100.53515,
            13.745776
          ],
          [
            100.53515,
            13.746424
          ],
          [
            100.53425,
            13.746424
          ],
          [
            100.53425,
            13.745776
          ]
        ]
      },
      {
        "name": "Siam Paragon Main Structure",
        "color": "#1E3A8A",
        "height": 57,
        "min_height": 12,
        "footprint": [
          [
            100.5344,
            13.745884
          ],
          [
            100.535,
            13.745884
          ],
          [
            100.535,
            13.746316
          ],
          [
            100.5344,
            13.746316
          ],
          [
            100.5344,
            13.745884
          ]
        ]
      },
      {
        "name": "Siam Paragon Crown / Roof",
        "color": "#60A5FA",
        "height": 65,
        "min_height": 57,
        "footprint": [
          [
            100.53452,
            13.74597
          ],
          [
            100.53488,
            13.74597
          ],
          [
            100.53488,
            13.74623
          ],
          [
            100.53452,
            13.74623
          ],
          [
            100.53452,
            13.74597
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "พื้นที่โครงการรวม",
        "size": "500,000 m²"
      },
      {
        "label": "SEA LIFE Bangkok Ocean World",
        "size": "อควาเรียมใจกลางเมืองชั้น B1-B2"
      },
      {
        "label": "Paragon Cineplex & IMAX",
        "size": "16 โรงภาพยนตร์ดิจิทัลเลเซอร์"
      }
    ],
    "transport": [
      {
        "name": "BTS สยาม (เชื่อมตรงสถานี Interchange)",
        "dist": "0 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "สยามเซ็นเตอร์ & สยามดิสคัฟเวอรี",
        "kind": "Mall",
        "color": "#06B6D4",
        "lat": 13.7465,
        "lon": 100.532,
        "dist": "150 m"
      },
      {
        "name": "วัดปทุมวนารามราชวรวิหาร",
        "kind": "Temple",
        "color": "#F59E0B",
        "lat": 13.747,
        "lon": 100.5365,
        "dist": "180 m"
      }
    ]
  },
  {
    "id": "bldg-baiyoke-tower",
    "name": "ตึกใบหยก 2 (Baiyoke Tower II)",
    "category": "ตำนานตึกสูงระฟ้า 85 ชั้น & ดาดฟ้าหมุน",
    "categoryColor": "#475569",
    "type": "building",
    "brandId": "building",
    "brandName": "Baiyoke Group",
    "badgeType": "brand",
    "badgeBg": "#334155",
    "color": "#334155",
    "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · ดาดฟ้าหมุน 360° ชั้น 84 (฿400–฿990)",
    "district": "ราชเทวี",
    "location": "222 ถนนราชปรารภ แขวงถนนพญาไท เขตราชเทวี กรุงเทพฯ (ย่านประตูน้ำ)",
    "lat": 13.7543,
    "lon": 100.5404,
    "height": 304,
    "floors": 85,
    "developer": "กลุ่มใบหยก (เสร็จสมบูรณ์ พ.ศ. 2540)",
    "developerSite": "https://baiyokesky.baiyokehotel.com/",
    "desc": "อดีตตึกที่สูงที่สุดในประเทศไทยเป็นเวลานานเกือบ 20 ปี ด้วยความสูง 304 เมตร (รวมเสาอากาศ 328 เมตร) เป็นที่ตั้งของโรงแรมใบหยกสกาย ห้องอาหารบุฟเฟต์ซีฟู้ดลอยฟ้าชั้นสูง และจุดชมวิวดาดฟ้าหมุนรอบตัวเอง 360 องศา ณ ชั้น 84 มองเห็นทางด่วนและผังเมืองกรุงเทพฯ ได้สุดสายตา",
    "footprint": [
      [
        100.53995,
        13.753976
      ],
      [
        100.54085,
        13.753976
      ],
      [
        100.54085,
        13.754624
      ],
      [
        100.53995,
        13.754624
      ],
      [
        100.53995,
        13.753976
      ]
    ],
    "parts": [
      {
        "name": "ตึกใบหยก 2 Base & Platform",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.53995,
            13.753976
          ],
          [
            100.54085,
            13.753976
          ],
          [
            100.54085,
            13.754624
          ],
          [
            100.53995,
            13.754624
          ],
          [
            100.53995,
            13.753976
          ]
        ]
      },
      {
        "name": "ตึกใบหยก 2 Main Structure",
        "color": "#1E293B",
        "height": 268,
        "min_height": 18,
        "footprint": [
          [
            100.5401,
            13.754084
          ],
          [
            100.5407,
            13.754084
          ],
          [
            100.5407,
            13.754516
          ],
          [
            100.5401,
            13.754516
          ],
          [
            100.5401,
            13.754084
          ]
        ]
      },
      {
        "name": "ตึกใบหยก 2 Crown / Roof",
        "color": "#94A3B8",
        "height": 304,
        "min_height": 268,
        "footprint": [
          [
            100.54022,
            13.75417
          ],
          [
            100.54058,
            13.75417
          ],
          [
            100.54058,
            13.75443
          ],
          [
            100.54022,
            13.75443
          ],
          [
            100.54022,
            13.75417
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ดาดฟ้าหมุน 360° ชั้น 84",
        "size": "จุดชมวิวหมุนกลางแจ้ง"
      },
      {
        "label": "บุฟเฟต์นานาชาติ & ซีฟู้ด Baiyoke Sky",
        "size": "ชั้น 76, 78, 79, 81, 82"
      },
      {
        "label": "โรงแรม Baiyoke Sky Hotel",
        "size": "ห้องพัก 673 ห้อง"
      }
    ],
    "transport": [
      {
        "name": "ARL ราชปรารภ (Airport Rail Link)",
        "dist": "200 m",
        "type": "mrt"
      },
      {
        "name": "BTS พญาไท",
        "dist": "1.1 km",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ตลาดประตูน้ำ ค้าส่งเสื้อผ้า",
        "kind": "Shopping",
        "color": "#EC4899",
        "lat": 13.751,
        "lon": 100.5405,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "bldg-parliament",
    "name": "สัปปายะสภาสถาน (รัฐสภาไทย)",
    "category": "สถาปัตยกรรมรัฐสภาไทยริมแม่น้ำเจ้าพระยา",
    "categoryColor": "#B45309",
    "type": "building",
    "brandId": "building",
    "brandName": "อาคารรัฐสภาแห่งชาติ",
    "badgeType": "brand",
    "badgeBg": "#92400E",
    "color": "#92400E",
    "image": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · อาคารรัฐสภาใหญ่ที่สุดในโลก (424,000 m²)",
    "district": "ดุสิต",
    "location": "1111 ถนนสามเสน แขวงถนนนครไชยศรี เขตดุสิต กรุงเทพฯ (เกียกกาย)",
    "lat": 13.7963,
    "lon": 100.5186,
    "height": 135,
    "floors": 11,
    "developer": "สำนักงานเลขาธิการสภาผู้แทนราษฎร",
    "developerSite": "https://www.parliament.go.th/",
    "desc": "อาคารรัฐสภาที่มีพื้นที่ใช้สอยใหญ่เป็นอันดับหนึ่งของโลก (424,000 ตร.ม.) ตั้งตระหง่านริมแม่น้ำเจ้าพระยา ออกแบบโดยเน้นคติไตรภูมิและสัจธรรมแห่งพุทธสถาปัตยกรรม ใจกลางประดิษฐาน 'ยอดเจดีย์ทองคำ' สูงตระหง่าน สื่อถึงความร่มเย็นและความยุติธรรมแห่งนิติบัญญัติไทย",
    "footprint": [
      [
        100.51785,
        13.79576
      ],
      [
        100.51935,
        13.79576
      ],
      [
        100.51935,
        13.79684
      ],
      [
        100.51785,
        13.79684
      ],
      [
        100.51785,
        13.79576
      ]
    ],
    "parts": [
      {
        "name": "รัฐสภาไทย Base & Platform",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.51815,
            13.795976
          ],
          [
            100.51905,
            13.795976
          ],
          [
            100.51905,
            13.796624
          ],
          [
            100.51815,
            13.796624
          ],
          [
            100.51815,
            13.795976
          ]
        ]
      },
      {
        "name": "รัฐสภาไทย Main Structure",
        "color": "#78350F",
        "height": 119,
        "min_height": 18,
        "footprint": [
          [
            100.5183,
            13.796084
          ],
          [
            100.5189,
            13.796084
          ],
          [
            100.5189,
            13.796516
          ],
          [
            100.5183,
            13.796516
          ],
          [
            100.5183,
            13.796084
          ]
        ]
      },
      {
        "name": "รัฐสภาไทย Crown / Roof",
        "color": "#F59E0B",
        "height": 135,
        "min_height": 119,
        "footprint": [
          [
            100.51842,
            13.79617
          ],
          [
            100.51878,
            13.79617
          ],
          [
            100.51878,
            13.79643
          ],
          [
            100.51842,
            13.79643
          ],
          [
            100.51842,
            13.79617
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ห้องประชุมพระสุริยัน (สภาผู้แทนราษฎร)",
        "size": "รองรับ 800 ที่นั่ง"
      },
      {
        "label": "ห้องประชุมพระจันทรา (วุฒิสภา)",
        "size": "รองรับ 300 ที่นั่ง"
      },
      {
        "label": "พิพิธภัณฑ์ประชาธิปไตย & ลานประชาชนริมน้ำ",
        "size": "พื้นที่ศึกษาประวัติศาสตร์"
      }
    ],
    "transport": [
      {
        "name": "MRT บางโพ (สายสีน้ำเงิน)",
        "dist": "900 m",
        "type": "mrt"
      },
      {
        "name": "ท่าเรือเกียกกาย (เรือด่วนเจ้าพระยา)",
        "dist": "250 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "สะพานพระราม 7",
        "kind": "Bridge",
        "color": "#6B7280",
        "lat": 13.815,
        "lon": 100.5125,
        "dist": "2.0 km"
      }
    ]
  },
  {
    "id": "transit-siam-station",
    "name": "BTS สถานีสยาม (Siam Interchange)",
    "category": "ศูนย์กลางเชื่อมต่อ BTS สุขุมวิท & สีลม",
    "categoryColor": "#059669",
    "type": "transit",
    "brandId": "transit",
    "brandName": "BTS SkyTrain",
    "badgeType": "brand",
    "badgeBg": "#10B981",
    "color": "#10B981",
    "image": "https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "🚊 CEN · ค่าโดยสาร ฿17–฿62 (Interchange 2 สาย)",
    "district": "ปทุมวัน",
    "location": "ถนนพระรามที่ 1 หน้าศูนย์การค้าสยามพารากอน เขตปทุมวัน กรุงเทพฯ",
    "lat": 13.7456,
    "lon": 100.5348,
    "height": 32,
    "floors": 3,
    "developer": "บริษัท ระบบขนส่งมวลชนกรุงเทพ จำกัด (มหาชน)",
    "developerSite": "https://www.bts.co.th/",
    "desc": "สถานีศูนย์กลางระบบรถไฟฟ้าบีทีเอสที่มีผู้โดยสารหนาแน่นที่สุดในประเทศไทย เป็นสถานีชุมทางแบบ Cross-Platform Interchange สองชั้น เชื่อมต่อระหว่างสายสุขุมวิท (คูคต - เคหะฯ) และสายสีลม (สนามกีฬาแห่งชาติ - บางหว้า) พร้อมทางเดินลอยฟ้า Skywalk เชื่อมต่อไปยังสยามพารากอน สยามสแควร์วัน สยามเซ็นเตอร์ และเซ็นทรัลเวิลด์",
    "footprint": [
      [
        100.5343,
        13.74524
      ],
      [
        100.5353,
        13.74524
      ],
      [
        100.5353,
        13.74596
      ],
      [
        100.5343,
        13.74596
      ],
      [
        100.5343,
        13.74524
      ]
    ],
    "parts": [
      {
        "name": "BTS สยาม Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.53435,
            13.745276
          ],
          [
            100.53525,
            13.745276
          ],
          [
            100.53525,
            13.745924
          ],
          [
            100.53435,
            13.745924
          ],
          [
            100.53435,
            13.745276
          ]
        ]
      },
      {
        "name": "BTS สยาม Main Structure",
        "color": "#059669",
        "height": 28,
        "min_height": 8,
        "footprint": [
          [
            100.5345,
            13.745384
          ],
          [
            100.5351,
            13.745384
          ],
          [
            100.5351,
            13.745816
          ],
          [
            100.5345,
            13.745816
          ],
          [
            100.5345,
            13.745384
          ]
        ]
      },
      {
        "name": "BTS สยาม Crown / Roof",
        "color": "#34D399",
        "height": 32,
        "min_height": 28,
        "footprint": [
          [
            100.53462,
            13.74547
          ],
          [
            100.53498,
            13.74547
          ],
          [
            100.53498,
            13.74573
          ],
          [
            100.53462,
            13.74573
          ],
          [
            100.53462,
            13.74547
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ชานชาลาชั้น 2 (Platform Level 2)",
        "size": "สายสุขุมวิทมุ่งหน้าเคหะฯ / สายสีลมมุ่งหน้าบางหว้า"
      },
      {
        "label": "ชานชาลาชั้น 3 (Platform Level 3)",
        "size": "สายสุขุมวิทมุ่งหน้าคูคต / สายสีลมมุ่งหน้าสนามกีฬาฯ"
      },
      {
        "label": "บัตรโดยสารที่รองรับ",
        "size": "Rabbit Card, Single Journey, บัตรเครดิต/เดบิต EMV"
      }
    ],
    "transport": [
      {
        "name": "BTS สายสุขุมวิท (N24 คูคต - E23 เคหะฯ)",
        "dist": "0 m",
        "type": "bts"
      },
      {
        "name": "BTS สายสีลม (W1 สนามกีฬา - S12 บางหว้า)",
        "dist": "0 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "สยามพารากอน",
        "kind": "Mall",
        "color": "#1E3A8A",
        "lat": 13.7461,
        "lon": 100.5347,
        "dist": "50 m"
      },
      {
        "name": "สยามสแควร์วัน",
        "kind": "Mall",
        "color": "#EC4899",
        "lat": 13.7448,
        "lon": 100.5345,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "transit-asok-station",
    "name": "BTS อโศก / MRT สุขุมวิท (Asok Interchange)",
    "category": "ฮับเชื่อมต่อใจกลางย่านธุรกิจ & ออฟฟิศ",
    "categoryColor": "#0284C7",
    "type": "transit",
    "brandId": "transit",
    "brandName": "BTS & MRT Interchange",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0284C7",
    "image": "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "🚊 E4 / BL22 · เชื่อม BTS สายสีเขียว & MRT สายสีน้ำเงิน",
    "district": "วัฒนา",
    "location": "สี่แยกอโศกมนตรี ถนนสุขุมวิท แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ",
    "lat": 13.7371,
    "lon": 100.5604,
    "height": 30,
    "floors": 3,
    "developer": "BTS & BEM (Bangkok Expressway and Metro)",
    "developerSite": "https://www.bemplc.co.th/",
    "desc": "ฮับเชื่อมต่อการเดินทางที่สำคัญที่สุดบนถนนสุขุมวิท จุดบรรจบระหว่าง BTS สถานีอโศก (สายสีเขียว) และ MRT สถานีสุขุมวิท (สายสีน้ำเงิน) เชื่อมตรงเข้าสู่ห้างเทอร์มินอล 21 อาคารอินเตอร์เชนจ์ 21 และเอ็กซ์เชนจ์ ทาวเวอร์ สะดวกสบายสำหรับคนทำงานออฟฟิศและนักท่องเที่ยว",
    "footprint": [
      [
        100.5599,
        13.73674
      ],
      [
        100.5609,
        13.73674
      ],
      [
        100.5609,
        13.73746
      ],
      [
        100.5599,
        13.73746
      ],
      [
        100.5599,
        13.73674
      ]
    ],
    "parts": [
      {
        "name": "อโศก-สุขุมวิท Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.55995,
            13.736776
          ],
          [
            100.56085,
            13.736776
          ],
          [
            100.56085,
            13.737424
          ],
          [
            100.55995,
            13.737424
          ],
          [
            100.55995,
            13.736776
          ]
        ]
      },
      {
        "name": "อโศก-สุขุมวิท Main Structure",
        "color": "#0284C7",
        "height": 26,
        "min_height": 8,
        "footprint": [
          [
            100.5601,
            13.736884
          ],
          [
            100.5607,
            13.736884
          ],
          [
            100.5607,
            13.737316
          ],
          [
            100.5601,
            13.737316
          ],
          [
            100.5601,
            13.736884
          ]
        ]
      },
      {
        "name": "อโศก-สุขุมวิท Crown / Roof",
        "color": "#38BDF8",
        "height": 30,
        "min_height": 26,
        "footprint": [
          [
            100.56022,
            13.73697
          ],
          [
            100.56058,
            13.73697
          ],
          [
            100.56058,
            13.73723
          ],
          [
            100.56022,
            13.73723
          ],
          [
            100.56022,
            13.73697
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "BTS อโศก (E4)",
        "size": "สถานียกระดับเหนือถนนสุขุมวิท"
      },
      {
        "label": "MRT สุขุมวิท (BL22)",
        "size": "สถานีใต้ดินเชื่อมต่อทางเดินบันไดเลื่อน"
      },
      {
        "label": "ทางเชื่อม Terminal 21 Asok",
        "size": "เชื่อมตรงจากทางออก BTS และ MRT"
      }
    ],
    "transport": [
      {
        "name": "BTS สายสุขุมวิท",
        "dist": "0 m",
        "type": "bts"
      },
      {
        "name": "MRT สายสีน้ำเงิน (เฉลิมรัชมงคล)",
        "dist": "50 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เทอร์มินอล 21 อโศก",
        "kind": "Mall",
        "color": "#F59E0B",
        "lat": 13.738,
        "lon": 100.5605,
        "dist": "50 m"
      },
      {
        "name": "สวนเบญจกิติ",
        "kind": "Park",
        "color": "#10B981",
        "lat": 13.731,
        "lon": 100.5585,
        "dist": "650 m"
      }
    ]
  },
  {
    "id": "transit-saladaeng-station",
    "name": "BTS ศาลาแดง / MRT สีลม (Silom Interchange)",
    "category": "ฮับการเงิน CBD & สวนลุมพินี",
    "categoryColor": "#16A34A",
    "type": "transit",
    "brandId": "transit",
    "brandName": "BTS สีลม & MRT สีลม",
    "badgeType": "brand",
    "badgeBg": "#15803D",
    "color": "#15803D",
    "image": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "🚊 S2 / BL26 · เชื่อม BTS สายสีลม & MRT สีลม",
    "district": "บางรัก",
    "location": "ถนนสีลม - ถนนพระราม 4 แขวงสีลม เขตบางรัก กรุงเทพฯ",
    "lat": 13.7288,
    "lon": 100.5342,
    "height": 28,
    "floors": 3,
    "developer": "BTS & BEM",
    "developerSite": "https://www.bts.co.th/",
    "desc": "ชุมทางหลักของย่านธุรกิจวอลล์สตรีทเมืองไทย (สีลม-สาทร) มีสะพาน Skywalk ลอยฟ้าเชื่อมระหว่าง BTS สถานีศาลาแดง และ MRT สถานีสีลม หน้าทางเข้าสวนลุมพินีและโรงพยาบาลจุฬาลงกรณ์ เดินทางสะดวกสู่ตึก Park Silom, Silom Complex, ธนิยะพลาซ่า และซอยพัฒน์พงศ์",
    "footprint": [
      [
        100.53375,
        13.728476
      ],
      [
        100.53465,
        13.728476
      ],
      [
        100.53465,
        13.729124
      ],
      [
        100.53375,
        13.729124
      ],
      [
        100.53375,
        13.728476
      ]
    ],
    "parts": [
      {
        "name": "ศาลาแดง-สีลม Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.53375,
            13.728476
          ],
          [
            100.53465,
            13.728476
          ],
          [
            100.53465,
            13.729124
          ],
          [
            100.53375,
            13.729124
          ],
          [
            100.53375,
            13.728476
          ]
        ]
      },
      {
        "name": "ศาลาแดง-สีลม Main Structure",
        "color": "#15803D",
        "height": 25,
        "min_height": 8,
        "footprint": [
          [
            100.5339,
            13.728584
          ],
          [
            100.5345,
            13.728584
          ],
          [
            100.5345,
            13.729016
          ],
          [
            100.5339,
            13.729016
          ],
          [
            100.5339,
            13.728584
          ]
        ]
      },
      {
        "name": "ศาลาแดง-สีลม Crown / Roof",
        "color": "#4ADE80",
        "height": 28,
        "min_height": 25,
        "footprint": [
          [
            100.53402,
            13.72867
          ],
          [
            100.53438,
            13.72867
          ],
          [
            100.53438,
            13.72893
          ],
          [
            100.53402,
            13.72893
          ],
          [
            100.53402,
            13.72867
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "BTS ศาลาแดง (S2)",
        "size": "สายสีลม (สนามกีฬาฯ - บางหว้า)"
      },
      {
        "label": "MRT สีลม (BL26)",
        "size": "สายสีน้ำเงิน พร้อมทางเดินเข้าสวนลุมพินี"
      },
      {
        "label": "ทางเชื่อม Silom Complex",
        "size": "เข้าสู่ห้างและซูเปอร์มาร์เก็ตชั้น 2"
      }
    ],
    "transport": [
      {
        "name": "BTS สายสีลม",
        "dist": "0 m",
        "type": "bts"
      },
      {
        "name": "MRT สายสีน้ำเงิน",
        "dist": "80 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ดุสิต เซ็นทรัล พาร์ค (กำลังก่อสร้าง)",
        "kind": "Mixed-Use",
        "color": "#6366F1",
        "lat": 13.729,
        "lon": 100.536,
        "dist": "150 m"
      },
      {
        "name": "สวนลุมพินี (ประตูสีลม)",
        "kind": "Park",
        "color": "#10B981",
        "lat": 13.7295,
        "lon": 100.537,
        "dist": "120 m"
      }
    ]
  },
  {
    "id": "transit-krungthep-aphiwat",
    "name": "สถานีกลางกรุงเทพอภิวัฒน์ (Grand Station)",
    "category": "ศูนย์กลางระบบรางที่ใหญ่ที่สุดในอาเซียน",
    "categoryColor": "#991B1B",
    "type": "transit",
    "brandId": "transit",
    "brandName": "การรถไฟแห่งประเทศไทย (SRT)",
    "badgeType": "brand",
    "badgeBg": "#991B1B",
    "color": "#991B1B",
    "image": "https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "🚊 รถไฟทางไกลทั่วประเทศ & รถไฟฟ้าชานเมืองสายสีแดง",
    "district": "จตุจักร",
    "location": "ถนนเทอดดำริ แขวงจตุจักร เขตจตุจักร กรุงเทพฯ (บางซื่อ)",
    "lat": 13.8035,
    "lon": 100.5398,
    "height": 45,
    "floors": 4,
    "developer": "การรถไฟแห่งประเทศไทย (SRT)",
    "developerSite": "https://www.railway.co.th/",
    "desc": "ฮับการคมนาคมทางรางที่ใหญ่และทันสมัยที่สุดในภูมิภาคอาเซียน (พื้นที่ใช้สอยกว่า 274,000 ตร.ม.) ศูนย์กลางขบวนรถไฟทางไกลทุกสายของประเทศไทย รถไฟฟ้าชานเมืองสายสีแดง (รังสิต - ตลิ่งชัน) เชื่อมต่อใต้ดินกับ MRT สายสีน้ำเงิน สถานีบางซื่อ และเตรียมรองรับรถไฟความเร็วสูงเชื่อม 3 สนามบินในอนาคต",
    "footprint": [
      [
        100.53895,
        13.802888
      ],
      [
        100.54065,
        13.802888
      ],
      [
        100.54065,
        13.804112
      ],
      [
        100.53895,
        13.804112
      ],
      [
        100.53895,
        13.802888
      ]
    ],
    "parts": [
      {
        "name": "กรุงเทพอภิวัฒน์ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.53935,
            13.803176
          ],
          [
            100.54025,
            13.803176
          ],
          [
            100.54025,
            13.803824
          ],
          [
            100.53935,
            13.803824
          ],
          [
            100.53935,
            13.803176
          ]
        ]
      },
      {
        "name": "กรุงเทพอภิวัฒน์ Main Structure",
        "color": "#991B1B",
        "height": 40,
        "min_height": 8,
        "footprint": [
          [
            100.5395,
            13.803284
          ],
          [
            100.5401,
            13.803284
          ],
          [
            100.5401,
            13.803716
          ],
          [
            100.5395,
            13.803716
          ],
          [
            100.5395,
            13.803284
          ]
        ]
      },
      {
        "name": "กรุงเทพอภิวัฒน์ Crown / Roof",
        "color": "#F87171",
        "height": 45,
        "min_height": 40,
        "footprint": [
          [
            100.53962,
            13.80337
          ],
          [
            100.53998,
            13.80337
          ],
          [
            100.53998,
            13.80363
          ],
          [
            100.53962,
            13.80363
          ],
          [
            100.53962,
            13.80337
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ชานชาลารถไฟทางไกลชั้น 2",
        "size": "สายเหนือ, อีสาน, ใต้ รวม 12 ชานชาลา"
      },
      {
        "label": "ชานชาลารถไฟฟ้าสายสีแดง",
        "size": "สายสีแดงเข้ม (รังสิต) & สีแดงอ่อน (ตลิ่งชัน)"
      },
      {
        "label": "MRT บางซื่อ (BL11)",
        "size": "ชั้นใต้ดินเชื่อมต่อทางเดินปรับอากาศ"
      }
    ],
    "transport": [
      {
        "name": "รถไฟฟ้าสายสีแดงเข้ม & สีแดงอ่อน",
        "dist": "0 m",
        "type": "bts"
      },
      {
        "name": "MRT บางซื่อ (สายสีน้ำเงิน)",
        "dist": "0 m (ชั้นใต้ดิน)",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เอสซีจี สำนักงานใหญ่ (SCG HQ)",
        "kind": "Corporate",
        "color": "#DC2626",
        "lat": 13.804,
        "lon": 100.535,
        "dist": "400 m"
      }
    ]
  },
  {
    "id": "transit-sanam-chai",
    "name": "MRT สถานีสนามไชย (Sanam Chai)",
    "category": "สถานีรถไฟฟ้าใต้ดินที่สวยที่สุดในประเทศไทย",
    "categoryColor": "#B45309",
    "type": "transit",
    "brandId": "transit",
    "brandName": "MRT สายสีน้ำเงิน",
    "badgeType": "brand",
    "badgeBg": "#B45309",
    "color": "#B45309",
    "image": "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&w=600&q=80",
    "rating": 4.9,
    "priceRange": "🚊 BL31 · สถาปัตยกรรมท้องพระโรงสมัยรัตนโกสินทร์",
    "district": "พระนคร",
    "location": "ถนนสนามไชย แขวงพระบรมมหาราชวัง เขตพระนคร กรุงเทพฯ",
    "lat": 13.7442,
    "lon": 100.4942,
    "height": 25,
    "floors": 3,
    "developer": "รฟม. (การรถไฟฟ้าขนส่งมวลชนแห่งประเทศไทย)",
    "developerSite": "https://www.mrta.co.th/",
    "desc": "สถานีรถไฟฟ้าใต้ดินเพียงแห่งเดียวที่ตั้งอยู่ใจกลางเกาะรัตนโกสินทร์ ออกแบบโดย รศ.ดร.ภิญโญ สุวรรณคีรี ศิลปินแห่งชาติ จำลองสถาปัตยกรรมท้องพระโรงสมัยรัตนโกสินทร์ตอนต้น เสาสีแดงชาด ปิดทองคำเปลว เพดานลายฉลุประณีต เป็นประตูสู่มิวเซียมสยาม วัดโพธิ์ และพระบรมมหาราชวัง",
    "footprint": [
      [
        100.49375,
        13.743876
      ],
      [
        100.49465,
        13.743876
      ],
      [
        100.49465,
        13.744524
      ],
      [
        100.49375,
        13.744524
      ],
      [
        100.49375,
        13.743876
      ]
    ],
    "parts": [
      {
        "name": "MRT สนามไชย Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.49375,
            13.743876
          ],
          [
            100.49465,
            13.743876
          ],
          [
            100.49465,
            13.744524
          ],
          [
            100.49375,
            13.744524
          ],
          [
            100.49375,
            13.743876
          ]
        ]
      },
      {
        "name": "MRT สนามไชย Main Structure",
        "color": "#B45309",
        "height": 22,
        "min_height": 8,
        "footprint": [
          [
            100.4939,
            13.743984
          ],
          [
            100.4945,
            13.743984
          ],
          [
            100.4945,
            13.744416
          ],
          [
            100.4939,
            13.744416
          ],
          [
            100.4939,
            13.743984
          ]
        ]
      },
      {
        "name": "MRT สนามไชย Crown / Roof",
        "color": "#FBBF24",
        "height": 25,
        "min_height": 22,
        "footprint": [
          [
            100.49402,
            13.74407
          ],
          [
            100.49438,
            13.74407
          ],
          [
            100.49438,
            13.74433
          ],
          [
            100.49402,
            13.74433
          ],
          [
            100.49402,
            13.74407
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ทางออก 1 (มิวเซียมสยาม)",
        "size": "โผล่ขึ้นใจกลางสนามหญ้ามิวเซียมสยาม"
      },
      {
        "label": "ทางออก 2 (โรงเรียนวัดราชบพิธ)",
        "size": "ถนนสนามไชย"
      },
      {
        "label": "ทางออก 3 (คลองคูเมืองเดิม)",
        "size": "ท่าเรือราชินี & ปากคลองตลาด"
      }
    ],
    "transport": [
      {
        "name": "MRT สายสีน้ำเงิน (ท่าพระ - หลักสอง)",
        "dist": "0 m",
        "type": "mrt"
      },
      {
        "name": "ท่าเรือราชินี (เรือด่วนเจ้าพระยา)",
        "dist": "200 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "มิวเซียมสยาม (Museum Siam)",
        "kind": "Museum",
        "color": "#6366F1",
        "lat": 13.7442,
        "lon": 100.4942,
        "dist": "10 m"
      },
      {
        "name": "ปากคลองตลาด แหล่งดอกไม้สด",
        "kind": "Market",
        "color": "#EC4899",
        "lat": 13.741,
        "lon": 100.496,
        "dist": "350 m"
      }
    ]
  },
  {
    "id": "transit-phayathai-station",
    "name": "BTS / ARL สถานีพญาไท (Phaya Thai)",
    "category": "ฮับเชื่อมต่อแอร์พอร์ต เรล ลิงก์ สู่สุวรรณภูมิ",
    "categoryColor": "#7C3AED",
    "type": "transit",
    "brandId": "transit",
    "brandName": "BTS & Airport Rail Link",
    "badgeType": "brand",
    "badgeBg": "#7C3AED",
    "color": "#7C3AED",
    "image": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "🚊 N2 / A8 · เชื่อมแอร์พอร์ตลิงก์ตรงสู่สนามบินสุวรรณภูมิ (26 นาที)",
    "district": "ราชเทวี",
    "location": "ถนนพญาไท แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ",
    "lat": 13.7568,
    "lon": 100.5342,
    "height": 35,
    "floors": 4,
    "developer": "BTS & รถไฟความเร็วสูงสายตะวันออกเชื่อมสามสนามบิน",
    "developerSite": "https://www.srtet.co.th/",
    "desc": "สถานีศูนย์กลางการเดินทางของนักเดินทางนานาชาติ จุดเชื่อมต่อระหว่าง BTS สถานีพญาไท (สายสุขุมวิท) และ Airport Rail Link สถานีพญาไท สามารถนั่งรถไฟฟ้าแอร์พอร์ตลิงก์ตรงเข้าสู่สนามบินสุวรรณภูมิได้ภายใน 26 นาที มี Skywalk เชื่อมเข้าสู่ตึก Unicorn Phayathai โรงแรมและ Co-working Space",
    "footprint": [
      [
        100.5337,
        13.75644
      ],
      [
        100.5347,
        13.75644
      ],
      [
        100.5347,
        13.75716
      ],
      [
        100.5337,
        13.75716
      ],
      [
        100.5337,
        13.75644
      ]
    ],
    "parts": [
      {
        "name": "พญาไท-ARL Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.53375,
            13.756476
          ],
          [
            100.53465,
            13.756476
          ],
          [
            100.53465,
            13.757124
          ],
          [
            100.53375,
            13.757124
          ],
          [
            100.53375,
            13.756476
          ]
        ]
      },
      {
        "name": "พญาไท-ARL Main Structure",
        "color": "#7C3AED",
        "height": 31,
        "min_height": 8,
        "footprint": [
          [
            100.5339,
            13.756584
          ],
          [
            100.5345,
            13.756584
          ],
          [
            100.5345,
            13.757016
          ],
          [
            100.5339,
            13.757016
          ],
          [
            100.5339,
            13.756584
          ]
        ]
      },
      {
        "name": "พญาไท-ARL Crown / Roof",
        "color": "#A78BFA",
        "height": 35,
        "min_height": 31,
        "footprint": [
          [
            100.53402,
            13.75667
          ],
          [
            100.53438,
            13.75667
          ],
          [
            100.53438,
            13.75693
          ],
          [
            100.53402,
            13.75693
          ],
          [
            100.53402,
            13.75667
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "BTS พญาไท (N2)",
        "size": "สายสุขุมวิท"
      },
      {
        "label": "Airport Rail Link พญาไท (A8)",
        "size": "ต้นทางสู่สนามบินสุวรรณภูมิ (฿45)"
      },
      {
        "label": "ทางเชื่อม One Phayathai & Unicorn",
        "size": "โรงแรมและไลฟ์สไตล์มอลล์"
      }
    ],
    "transport": [
      {
        "name": "BTS สายสุขุมวิท",
        "dist": "0 m",
        "type": "bts"
      },
      {
        "name": "Airport Rail Link (ARL)",
        "dist": "0 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "อาคารวรรณสรณ์ (อุ๊แลนด์)",
        "kind": "Education",
        "color": "#F59E0B",
        "lat": 13.758,
        "lon": 100.5348,
        "dist": "150 m"
      },
      {
        "name": "อนุสาวรีย์ชัยสมรภูมิ",
        "kind": "Landmark",
        "color": "#DC2626",
        "lat": 13.7645,
        "lon": 100.537,
        "dist": "850 m"
      }
    ]
  },
  {
    "id": "food-here-hai",
    "name": "เฮียให้ ข้าวผัดโคตรปู (Here Hai)",
    "category": "ข้าวผัดโคตรปู มิชลิน บิบ กูร์มองด์",
    "categoryColor": "#EA580C",
    "type": "food",
    "brandId": "food",
    "brandName": "มิชลิน บิบ กูร์มองด์",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#EA580C",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · ข้าวผัดโคตรปู & กั้งทอดกระเทียม (฿380–฿990)",
    "district": "วัฒนา",
    "location": "112/1 ซอยสุขุมวิท 63 (ระหว่างเอกมัย 10-12) แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ",
    "lat": 13.7312,
    "lon": 100.5847,
    "height": 18,
    "floors": 2,
    "developer": "เฮียให้ (Here Hai Seafood) · Michelin Bib Gourmand 5 ปีซ้อน",
    "developerSite": "https://guide.michelin.com/th/th/bangkok-region/bangkok/restaurant/here-hai",
    "desc": "สวรรค์ของคนรักเนื้อปูและซีฟู้ดสดจากสุราษฎร์ธานี เมนูสร้างชื่อระดับตำนานคือ 'ข้าวผัดโคตรปู' ข้าวร่วนหอมกลิ่นกระทะไหม้อัดแน่นด้วยกรรเชียงปูก้อนยักษ์แบบพูนจาน กั้งทอดกระเทียมพริกไทยกรอบนอกนุ่มใน และหอยเชลล์ผัดกะเพราพริกสดแท้",
    "footprint": [
      [
        100.58435,
        13.730948
      ],
      [
        100.58505,
        13.730948
      ],
      [
        100.58505,
        13.731452
      ],
      [
        100.58435,
        13.731452
      ],
      [
        100.58435,
        13.730948
      ]
    ],
    "parts": [
      {
        "name": "เฮียให้ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.58425,
            13.730876
          ],
          [
            100.58515,
            13.730876
          ],
          [
            100.58515,
            13.731524
          ],
          [
            100.58425,
            13.731524
          ],
          [
            100.58425,
            13.730876
          ]
        ]
      },
      {
        "name": "เฮียให้ Main Structure",
        "color": "#EA580C",
        "height": 16,
        "min_height": 8,
        "footprint": [
          [
            100.5844,
            13.730984
          ],
          [
            100.585,
            13.730984
          ],
          [
            100.585,
            13.731416
          ],
          [
            100.5844,
            13.731416
          ],
          [
            100.5844,
            13.730984
          ]
        ]
      },
      {
        "name": "เฮียให้ Crown / Roof",
        "color": "#F59E0B",
        "height": 18,
        "min_height": 16,
        "footprint": [
          [
            100.58452,
            13.73107
          ],
          [
            100.58488,
            13.73107
          ],
          [
            100.58488,
            13.73133
          ],
          [
            100.58452,
            13.73133
          ],
          [
            100.58452,
            13.73107
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ข้าวผัดโคตรปู (จานกลาง/จานโคตร)",
        "size": "฿380 / ฿990 (ปูก้อนยักษ์เต็มจาน)"
      },
      {
        "label": "กั้งแก้วทอดกระเทียมพริกไทย",
        "size": "฿380"
      },
      {
        "label": "ไข่ข้นปูกรรเชียงล้นทะลัก",
        "size": "฿380"
      },
      {
        "label": "หอยเชลล์ผัดพริกขี้หนูสวน",
        "size": "฿320"
      }
    ],
    "transport": [
      {
        "name": "BTS เอกมัย (ทางออก 1)",
        "dist": "850 m (เดิน 10 นาที)",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ดองกิ มอลล์ ทองหล่อ (DONKI)",
        "kind": "Mall",
        "color": "#F59E0B",
        "lat": 13.7345,
        "lon": 100.5845,
        "dist": "350 m"
      },
      {
        "name": "วัฒนาพานิช ก๋วยเตี๋ยวเนื้อ",
        "kind": "Food",
        "color": "#78350F",
        "lat": 13.7375,
        "lon": 100.5878,
        "dist": "750 m"
      }
    ]
  },
  {
    "id": "food-nueng-nom-nua",
    "name": "หนึ่ง นม นัว บรรทัดทอง",
    "category": "ขนมปังอบกรอบ & ดิปนมสดภูเก็ต",
    "categoryColor": "#F59E0B",
    "type": "food",
    "brandId": "food",
    "brandName": "บรรทัดทอง ฮิต",
    "badgeType": "brand",
    "badgeBg": "#D97706",
    "color": "#D97706",
    "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · โชคุปังอบกรอบดิปสังขยา/นมข้น (฿45–฿120)",
    "district": "ปทุมวัน",
    "location": "1473 ถนนบรรทัดทอง แขวงวังใหม่ เขตปทุมวัน กรุงเทพฯ",
    "lat": 13.7408,
    "lon": 100.523,
    "height": 18,
    "floors": 3,
    "developer": "หนึ่ง นม นัว (ต้นตำรับจากภูเก็ต)",
    "developerSite": "https://www.facebook.com/nuengnomnua",
    "desc": "ร้านของหวานและนมสดคิวยาวอันดับหนึ่งบนถนนบรรทัดทอง เสิร์ฟขนมปังโชคุปังโฮมเมดย่างเตาถ่านผิวกรอบนอกนุ่มฉ่ำใน ดิปกับซอสสังขยาใบเตย สังขยาชาไทย ฮอกไกโดมิลค์ หรือลาวาไข่เค็ม ทานคู่กับนมสดตุ๋นอุณหภูมิเฉพาะที่หอมมันนัวไม่เหมือนใคร",
    "footprint": [
      [
        100.52265,
        13.740548
      ],
      [
        100.52335,
        13.740548
      ],
      [
        100.52335,
        13.741052
      ],
      [
        100.52265,
        13.741052
      ],
      [
        100.52265,
        13.740548
      ]
    ],
    "parts": [
      {
        "name": "หนึ่ง นม นัว Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.52255,
            13.740476
          ],
          [
            100.52345,
            13.740476
          ],
          [
            100.52345,
            13.741124
          ],
          [
            100.52255,
            13.741124
          ],
          [
            100.52255,
            13.740476
          ]
        ]
      },
      {
        "name": "หนึ่ง นม นัว Main Structure",
        "color": "#D97706",
        "height": 16,
        "min_height": 8,
        "footprint": [
          [
            100.5227,
            13.740584
          ],
          [
            100.5233,
            13.740584
          ],
          [
            100.5233,
            13.741016
          ],
          [
            100.5227,
            13.741016
          ],
          [
            100.5227,
            13.740584
          ]
        ]
      },
      {
        "name": "หนึ่ง นม นัว Crown / Roof",
        "color": "#FDE047",
        "height": 18,
        "min_height": 16,
        "footprint": [
          [
            100.52282,
            13.74067
          ],
          [
            100.52318,
            13.74067
          ],
          [
            100.52318,
            13.74093
          ],
          [
            100.52282,
            13.74093
          ],
          [
            100.52282,
            13.74067
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ขนมปังอบกรอบ + ดิป 1 รสชาติ",
        "size": "฿45 – ฿55"
      },
      {
        "label": "เซ็ตขนมปังถาดรวมดิป 4 ซอส",
        "size": "฿120"
      },
      {
        "label": "นมสดสเลอปี้เกล็ดหิมะนัว",
        "size": "฿55"
      },
      {
        "label": "นมสดเย็นเกรดพรีเมียม",
        "size": "฿45"
      }
    ],
    "transport": [
      {
        "name": "BTS สนามกีฬาแห่งชาติ",
        "dist": "700 m",
        "type": "bts"
      },
      {
        "name": "MRT หัวลำโพง",
        "dist": "800 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เจ๊โอว ข้าวต้มเป็ด",
        "kind": "Food",
        "color": "#DC2626",
        "lat": 13.7431,
        "lon": 100.5222,
        "dist": "250 m"
      },
      {
        "name": "อุทยาน 100 ปี จุฬาฯ",
        "kind": "Park",
        "color": "#10B981",
        "lat": 13.7392,
        "lon": 100.5235,
        "dist": "180 m"
      }
    ]
  },
  {
    "id": "food-sarinthip-talat-phlu",
    "name": "สรินทร์ทิพย์ ขนมเบื้องไทยตลาดพลู",
    "category": "ขนมเบื้องโบราณ 110 ปี สี่ชั่วอายุคน",
    "categoryColor": "#CA8A04",
    "type": "food",
    "brandId": "food",
    "brandName": "ตำนานตลาดพลู",
    "badgeType": "brand",
    "badgeBg": "#CA8A04",
    "color": "#CA8A04",
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · ขนมเบื้องไทยสูตรโบราณใส่ไข่ (฿15–฿50)",
    "district": "ธนบุรี",
    "location": "ใต้สะพานตลาดพลู ถนนเทอดไท แขวงตลาดพลู เขตธนบุรี กรุงเทพฯ",
    "lat": 13.7196,
    "lon": 100.4782,
    "height": 18,
    "floors": 2,
    "developer": "สรินทร์ทิพย์ (สืบทอดสูตรโบราณตั้งแต่สมัย รัชกาลที่ ๕)",
    "developerSite": "https://www.facebook.com/sarinthiptalatphlu/",
    "desc": "ตำนานขนมเบื้องไทยโบราณอายุกว่าศตวรรษแห่งย่านตลาดพลู แป้งถั่วทองผสมข้าวเจ้าบางกรอบหอมเตาถ่าน ไส้หวานมะพร้าวแก้วเชื่อมทองหยอดฝอยทอง และไส้เค็มกุ้งทะเลผัดพริกไทยรากผักชี มีทั้งแบบธรรมดาและแบบใส่ไข่เป็ดเคี่ยวเยิ้มกรอบอร่อยลงตัว",
    "footprint": [
      [
        100.47785,
        13.719348
      ],
      [
        100.47855,
        13.719348
      ],
      [
        100.47855,
        13.719852
      ],
      [
        100.47785,
        13.719852
      ],
      [
        100.47785,
        13.719348
      ]
    ],
    "parts": [
      {
        "name": "สรินทร์ทิพย์ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.47775,
            13.719276
          ],
          [
            100.47865,
            13.719276
          ],
          [
            100.47865,
            13.719924
          ],
          [
            100.47775,
            13.719924
          ],
          [
            100.47775,
            13.719276
          ]
        ]
      },
      {
        "name": "สรินทร์ทิพย์ Main Structure",
        "color": "#CA8A04",
        "height": 16,
        "min_height": 8,
        "footprint": [
          [
            100.4779,
            13.719384
          ],
          [
            100.4785,
            13.719384
          ],
          [
            100.4785,
            13.719816
          ],
          [
            100.4779,
            13.719816
          ],
          [
            100.4779,
            13.719384
          ]
        ]
      },
      {
        "name": "สรินทร์ทิพย์ Crown / Roof",
        "color": "#FACC15",
        "height": 18,
        "min_height": 16,
        "footprint": [
          [
            100.47802,
            13.71947
          ],
          [
            100.47838,
            13.71947
          ],
          [
            100.47838,
            13.71973
          ],
          [
            100.47802,
            13.71973
          ],
          [
            100.47802,
            13.71947
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ขนมเบื้องโบราณใส่ไข่ (ไส้หวาน/เค็ม)",
        "size": "฿20 / ชิ้น"
      },
      {
        "label": "ขนมเบื้องแผ่นใหญ่พิเศษทรงเครื่อง",
        "size": "฿50 / กล่อง"
      },
      {
        "label": "ชุดรวมกล่องใหญ่ 10 ชิ้น",
        "size": "฿150"
      }
    ],
    "transport": [
      {
        "name": "BTS ตลาดพลู (ทางออก 2)",
        "dist": "650 m",
        "type": "bts"
      },
      {
        "name": "SRT สถานีรถไฟตลาดพลู (สายวงเวียนใหญ่-มหาชัย)",
        "dist": "50 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "กุยช่ายตลาดพลู กวนอา",
        "kind": "Food",
        "color": "#16A34A",
        "lat": 13.719,
        "lon": 100.4785,
        "dist": "80 m"
      },
      {
        "name": "วัดอินทารามวรวิหาร",
        "kind": "Culture",
        "color": "#6366F1",
        "lat": 13.7225,
        "lon": 100.482,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "food-somtum-der",
    "name": "ส้มตำเด้อ ศาลาแดง (Somtum Der)",
    "category": "อีสานแท้รสแซ่บ มิชลิน บิบ กูร์มองด์",
    "categoryColor": "#DC2626",
    "type": "food",
    "brandId": "food",
    "brandName": "มิชลิน บิบ กูร์มองด์",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#DC2626",
    "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · ตำซั่วสกลนคร & สะโพกไก่ทอด (฿95–฿250)",
    "district": "บางรัก",
    "location": "5/5 ซอยศาลาแดง ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ",
    "lat": 13.7278,
    "lon": 100.5348,
    "height": 20,
    "floors": 3,
    "developer": "ส้มตำเด้อ (ขยายสาขาไปถึงนิวยอร์กและโตเกียว)",
    "developerSite": "https://somtumder.com/",
    "desc": "ร้านอาหารอีสานสไตล์โมเดิร์นที่ยังคงรสชาติต้นตำรับดั้งเดิมอย่างเคร่งครัด ได้รับรางวัล Michelin Bib Gourmand ทั้งในกรุงเทพฯ และมหานครนิวยอร์ก น้ำปลาร้าต้มสมุนไพรหอมลึก ไฮไลท์คือตำซั่วสกลนครใส่แคบหมูกรอบ ตำปลาดุกฟู และสะโพกไก่ทอดกรอบสูตรลับเด้อ",
    "footprint": [
      [
        100.53445,
        13.727548
      ],
      [
        100.53515,
        13.727548
      ],
      [
        100.53515,
        13.728052
      ],
      [
        100.53445,
        13.728052
      ],
      [
        100.53445,
        13.727548
      ]
    ],
    "parts": [
      {
        "name": "ส้มตำเด้อ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.53435,
            13.727476
          ],
          [
            100.53525,
            13.727476
          ],
          [
            100.53525,
            13.728124
          ],
          [
            100.53435,
            13.728124
          ],
          [
            100.53435,
            13.727476
          ]
        ]
      },
      {
        "name": "ส้มตำเด้อ Main Structure",
        "color": "#DC2626",
        "height": 18,
        "min_height": 8,
        "footprint": [
          [
            100.5345,
            13.727584
          ],
          [
            100.5351,
            13.727584
          ],
          [
            100.5351,
            13.728016
          ],
          [
            100.5345,
            13.728016
          ],
          [
            100.5345,
            13.727584
          ]
        ]
      },
      {
        "name": "ส้มตำเด้อ Crown / Roof",
        "color": "#F87171",
        "height": 20,
        "min_height": 18,
        "footprint": [
          [
            100.53462,
            13.72767
          ],
          [
            100.53498,
            13.72767
          ],
          [
            100.53498,
            13.72793
          ],
          [
            100.53462,
            13.72793
          ],
          [
            100.53462,
            13.72767
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ตำซั่วสกลนคร (สูตรปลาร้าหอม)",
        "size": "฿95"
      },
      {
        "label": "สะโพกไก่ทอดกรอบเด๊อ",
        "size": "฿120"
      },
      {
        "label": "ลาบหมูคั่วพริกแห้ง",
        "size": "฿110"
      },
      {
        "label": "ต้มแซ่บกระดูกอ่อนซดคล่องคอ",
        "size": "฿140"
      }
    ],
    "transport": [
      {
        "name": "BTS ศาลาแดง (ทางออก 2)",
        "dist": "180 m",
        "type": "bts"
      },
      {
        "name": "MRT สีลม (ทางออก 2)",
        "dist": "220 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "สีลม คอมเพล็กซ์ (Silom Complex)",
        "kind": "Mall",
        "color": "#3B82F6",
        "lat": 13.7285,
        "lon": 100.5345,
        "dist": "100 m"
      },
      {
        "name": "สวนลุมพินี",
        "kind": "Park",
        "color": "#10B981",
        "lat": 13.7295,
        "lon": 100.537,
        "dist": "250 m"
      }
    ]
  },
  {
    "id": "tour-wat-saket",
    "name": "วัดสระเกศ (ภูเขาทอง / Golden Mount)",
    "category": "พระบรมบรรพต เจดีย์สีทอง 360° ใจกลางเมือง",
    "categoryColor": "#EAB308",
    "type": "travel",
    "brandId": "travel",
    "brandName": "มรดกประวัติศาสตร์",
    "badgeType": "brand",
    "badgeBg": "#CA8A04",
    "color": "#CA8A04",
    "image": "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · บันไดวน 344 ขั้น ชมวิว 360° (ไทยฟรี/ต่างชาติ ฿50)",
    "district": "ป้อมปราบศัตรูพ่าย",
    "location": "344 ถนนบริพัตร แขวงบ้านบาตร เขตป้อมปราบศัตรูพ่าย กรุงเทพฯ",
    "lat": 13.7538,
    "lon": 100.5066,
    "height": 77,
    "floors": 5,
    "developer": "พระบรมราชจักรีวงศ์ (สร้างในรัชกาลที่ ๓ - รัชกาลที่ ๕)",
    "developerSite": "https://www.watsaket.com/",
    "desc": "พระบรมบรรพต หรือภูเขาทอง ภูเขาจำลองที่สร้างด้วยแรงศรัทธาสูง 77 เมตร ยอดบนประดิษฐานพระเจดีย์สีทองอร่ามบรรจุพระบรมสารีริกธาตุจากอินเดีย ทางเดินบันไดวน 344 ขั้นล้อมรอบด้วยต้นไม้ร่มรื่น ระฆังโบราณ และจุดชมวิวมุมสูง 360 องศาเห็นกรุงรัตนโกสินทร์และอนุสาวรีย์ประชาธิปไตย",
    "footprint": [
      [
        100.506,
        13.753368
      ],
      [
        100.5072,
        13.753368
      ],
      [
        100.5072,
        13.754232
      ],
      [
        100.506,
        13.754232
      ],
      [
        100.506,
        13.753368
      ]
    ],
    "parts": [
      {
        "name": "ภูเขาทอง Base & Platform",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            100.50615,
            13.753476
          ],
          [
            100.50705,
            13.753476
          ],
          [
            100.50705,
            13.754124
          ],
          [
            100.50615,
            13.754124
          ],
          [
            100.50615,
            13.753476
          ]
        ]
      },
      {
        "name": "ภูเขาทอง Main Structure",
        "color": "#CA8A04",
        "height": 68,
        "min_height": 14,
        "footprint": [
          [
            100.5063,
            13.753584
          ],
          [
            100.5069,
            13.753584
          ],
          [
            100.5069,
            13.754016
          ],
          [
            100.5063,
            13.754016
          ],
          [
            100.5063,
            13.753584
          ]
        ]
      },
      {
        "name": "ภูเขาทอง Crown / Roof",
        "color": "#FDE047",
        "height": 77,
        "min_height": 68,
        "footprint": [
          [
            100.50642,
            13.75367
          ],
          [
            100.50678,
            13.75367
          ],
          [
            100.50678,
            13.75393
          ],
          [
            100.50642,
            13.75393
          ],
          [
            100.50642,
            13.75367
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "เวลาเปิดทำการ",
        "size": "07:00 – 19:00 น. (ทุกวัน)"
      },
      {
        "label": "อัตราค่าขึ้นชมภูเขาทอง",
        "size": "คนไทยฟรี / ต่างชาติ 50 บาท"
      },
      {
        "label": "งานเทศกาลนมัสการพระบรมสารีริกธาตุ",
        "size": "งานวัดภูเขาทองและพิธีห่มผ้าแดงประจำปี (เดือน 12)"
      }
    ],
    "transport": [
      {
        "name": "ท่าเรือผ่านฟ้าลีลาศ (คลองแสนแสบ)",
        "dist": "300 m",
        "type": "boat"
      },
      {
        "name": "MRT สามยอด",
        "dist": "950 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เจ๊ไฝ & ทิพย์สมัย ผัดไทย",
        "kind": "Food",
        "color": "#EA580C",
        "lat": 13.7525,
        "lon": 100.5048,
        "dist": "350 m"
      },
      {
        "name": "โลหะปราสาท วัดราชนัดดาราม",
        "kind": "Culture",
        "color": "#F59E0B",
        "lat": 13.7551,
        "lon": 100.5042,
        "dist": "250 m"
      }
    ]
  },
  {
    "id": "tour-talat-noi",
    "name": "ตลาดน้อย เจริญกรุง (Talat Noi)",
    "category": "ชุมชนจีนโบราณ สตรีทอาร์ต & คาเฟ่ริมน้ำ",
    "categoryColor": "#DC2626",
    "type": "travel",
    "brandId": "travel",
    "brandName": "เฮอริเทจ & สตรีทอาร์ต",
    "badgeType": "brand",
    "badgeBg": "#DC2626",
    "color": "#DC2626",
    "image": "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · คฤหาสน์โซวเฮงไถ่ 200 ปี & อะไหล่เซียงกง (เข้าฟรี)",
    "district": "สัมพันธวงศ์",
    "location": "ซอยเจริญกรุง 22 - 32 แขวงตลาดน้อย เขตสัมพันธวงศ์ กรุงเทพฯ",
    "lat": 13.7345,
    "lon": 100.5135,
    "height": 20,
    "floors": 2,
    "developer": "ชุมชนวัฒนธรรมเก่าแก่แห่งแรกของกรุงรัตนโกสินทร์",
    "developerSite": "https://www.tourismthailand.org/",
    "desc": "ย่านประวัติศาสตร์ริมแม่น้ำเจ้าพระยาที่ผสานมนต์เสน่ห์ชุมชนจีนฮกเกี้ยนโบราณกับคอมมูนิตี้ศิลปะสมัยใหม่ เดินชมสตรีทอาร์ตรูปวิถีชีวิต คฤหาสน์เก๋งจีนโบราณโซวเฮงไถ่อายุกว่า 200 ปีที่มีสระดำน้ำกลางลานหิน ซุ้มประตูอะไหล่รถยนต์เซียงกง และคาเฟ่วินเทจริมฝั่งน้ำ",
    "footprint": [
      [
        100.513,
        13.73414
      ],
      [
        100.514,
        13.73414
      ],
      [
        100.514,
        13.73486
      ],
      [
        100.513,
        13.73486
      ],
      [
        100.513,
        13.73414
      ]
    ],
    "parts": [
      {
        "name": "ตลาดน้อย Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.51305,
            13.734176
          ],
          [
            100.51395,
            13.734176
          ],
          [
            100.51395,
            13.734824
          ],
          [
            100.51305,
            13.734824
          ],
          [
            100.51305,
            13.734176
          ]
        ]
      },
      {
        "name": "ตลาดน้อย Main Structure",
        "color": "#DC2626",
        "height": 18,
        "min_height": 8,
        "footprint": [
          [
            100.5132,
            13.734284
          ],
          [
            100.5138,
            13.734284
          ],
          [
            100.5138,
            13.734716
          ],
          [
            100.5132,
            13.734716
          ],
          [
            100.5132,
            13.734284
          ]
        ]
      },
      {
        "name": "ตลาดน้อย Crown / Roof",
        "color": "#F87171",
        "height": 20,
        "min_height": 18,
        "footprint": [
          [
            100.51332,
            13.73437
          ],
          [
            100.51368,
            13.73437
          ],
          [
            100.51368,
            13.73463
          ],
          [
            100.51332,
            13.73463
          ],
          [
            100.51332,
            13.73437
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ไฮไลท์จุดเช็คอิน",
        "size": "คฤหาสน์โซวเฮงไถ่, รถเต่าโบราณสตรีทอาร์ต, ศาลเจ้าโจวซือกง"
      },
      {
        "label": "คาเฟ่ริมน้ำยอดนิยม",
        "size": "Mother Roaster, Hong Sieng Kong, บ้านริมน้ำ"
      },
      {
        "label": "ค่าเข้าชม",
        "size": "ฟรี (คฤหาสน์โซวเฮงไถ่อุดหนุนเครื่องดื่ม)"
      }
    ],
    "transport": [
      {
        "name": "MRT หัวลำโพง (ทางออก 1)",
        "dist": "650 m",
        "type": "mrt"
      },
      {
        "name": "ท่าเรือกรมเจ้าท่า (เรือด่วนเจ้าพระยา)",
        "dist": "200 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ริเวอร์ ซิตี้ แบงค็อก (River City)",
        "kind": "Art",
        "color": "#6366F1",
        "lat": 13.73,
        "lon": 100.514,
        "dist": "350 m"
      },
      {
        "name": "เยาวราช ถนนสายมังกร",
        "kind": "Food",
        "color": "#EA580C",
        "lat": 13.7415,
        "lon": 100.5085,
        "dist": "750 m"
      }
    ]
  },
  {
    "id": "tour-bacc",
    "name": "หอศิลปวัฒนธรรมแห่งกรุงเทพฯ (BACC)",
    "category": "ศูนย์กลางศิลปะร่วมสมัย & สถาปัตยกรรมวนก้นหอย",
    "categoryColor": "#4F46E5",
    "type": "travel",
    "brandId": "travel",
    "brandName": "หอศิลป์ กทม.",
    "badgeType": "brand",
    "badgeBg": "#4338CA",
    "color": "#4338CA",
    "image": "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · แกลเลอรี 9 ชั้น นิทรรศการระดับโลก (เข้าชมฟรี)",
    "district": "ปทุมวัน",
    "location": "939 ถนนพระราม 1 แขวงวังใหม่ เขตปทุมวัน กรุงเทพฯ (แยกปทุมวัน)",
    "lat": 13.7468,
    "lon": 100.5305,
    "height": 48,
    "floors": 9,
    "developer": "มูลนิธิหอศิลปวัฒนธรรมแห่งกรุงเทพมหานคร / กทม.",
    "developerSite": "https://www.bacc.or.th/",
    "desc": "ศูนย์กลางศิลปวัฒนธรรมร่วมสมัยใจกลางกรุงเทพฯ สถาปัตยกรรมทรงกระบอกสีขาวอันโดดเด่น มีทางเดินลาดวนก้นหอยเปิดรับแสงธรรมชาติจากสกายไลท์ด้านบน มีนิทรรศการศิลปะ ภาพถ่าย ประติมากรรมระดับชาติและสากลหมุนเวียนให้ชมฟรี ร้านหนังสือศิลปะ คาเฟ่ดริปกาแฟ และร้านคราฟต์ดีไซน์เนอร์",
    "footprint": [
      [
        100.52995,
        13.746404
      ],
      [
        100.53105,
        13.746404
      ],
      [
        100.53105,
        13.747196
      ],
      [
        100.52995,
        13.747196
      ],
      [
        100.52995,
        13.746404
      ]
    ],
    "parts": [
      {
        "name": "BACC หอศิลป์ Base & Platform",
        "color": "#1E293B",
        "height": 9,
        "min_height": 0,
        "footprint": [
          [
            100.53005,
            13.746476
          ],
          [
            100.53095,
            13.746476
          ],
          [
            100.53095,
            13.747124
          ],
          [
            100.53005,
            13.747124
          ],
          [
            100.53005,
            13.746476
          ]
        ]
      },
      {
        "name": "BACC หอศิลป์ Main Structure",
        "color": "#4338CA",
        "height": 42,
        "min_height": 9,
        "footprint": [
          [
            100.5302,
            13.746584
          ],
          [
            100.5308,
            13.746584
          ],
          [
            100.5308,
            13.747016
          ],
          [
            100.5302,
            13.747016
          ],
          [
            100.5302,
            13.746584
          ]
        ]
      },
      {
        "name": "BACC หอศิลป์ Crown / Roof",
        "color": "#818CF8",
        "height": 48,
        "min_height": 42,
        "footprint": [
          [
            100.53032,
            13.74667
          ],
          [
            100.53068,
            13.74667
          ],
          [
            100.53068,
            13.74693
          ],
          [
            100.53032,
            13.74693
          ],
          [
            100.53032,
            13.74667
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "เวลาเปิดทำการ",
        "size": "10:00 – 20:00 น. (ปิดทุกวันจันทร์ เข้าชมฟรี)"
      },
      {
        "label": "ห้องนิทรรศการหลัก (Main Gallery)",
        "size": "ชั้น 7, 8, 9 (นิทรรศการระดับนานาชาติ)"
      },
      {
        "label": "อาร์ตช็อป & คาเฟ่ดริป",
        "size": "ชั้น 1 - 4 (ร้านหนังสือ, กาแฟ Gallery Drip)"
      }
    ],
    "transport": [
      {
        "name": "BTS สนามกีฬาแห่งชาติ (ทางออก 3 เชื่อมเข้าหอศิลป์)",
        "dist": "0 m",
        "type": "bts"
      },
      {
        "name": "BTS สยาม (เดินเชื่อม Skywalk)",
        "dist": "350 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เอ็มบีเค เซ็นเตอร์ (MBK Center)",
        "kind": "Mall",
        "color": "#F59E0B",
        "lat": 13.7445,
        "lon": 100.53,
        "dist": "100 m"
      },
      {
        "name": "สยามดิสคัฟเวอรี",
        "kind": "Mall",
        "color": "#06B6D4",
        "lat": 13.7465,
        "lon": 100.532,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "bldg-emsphere",
    "name": "เอ็มสเฟียร์ (The EmSphere)",
    "category": "เมกะไลฟ์สไตล์มอลล์แห่งอนาคต & UOB LIVE",
    "categoryColor": "#0284C7",
    "type": "building",
    "brandId": "building",
    "brandName": "The Mall Group (EM DISTRICT)",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0284C7",
    "image": "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · Emsphere Diner & UOB LIVE Arena (200,000 m²)",
    "district": "คลองเตย",
    "location": "628 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ (พร้อมพงษ์)",
    "lat": 13.7328,
    "lon": 100.567,
    "height": 75,
    "floors": 10,
    "developer": "เดอะมอลล์ กรุ๊ป (The Mall Group - จิ๊กซอว์ชิ้นสุดท้ายของ EM DISTRICT)",
    "developerSite": "https://emsphere.co.th/",
    "desc": "ศูนย์การค้าระดับโลกแห่งใหม่ใจกลางสุขุมวิท ภายใต้แนวคิด Future Retail โดดเด่นด้วยดีไซน์ Industrial Loft เผยโครงสร้างเหล็กเท่ทันสมัย รวม 'EM WONDER' แหล่งแฮงก์เอาต์และไนท์ไลฟ์, 'EM DINING' ร้านอาหารเปิดถึงดึก, 'IKEA Sukhumvit' อิเกียซิตี้สโตร์แห่งแรกของไทย และ 'UOB LIVE' คอนเสิร์ตฮอลล์ระดับโลกความจุ 6,000 ที่นั่ง",
    "footprint": [
      [
        100.5664,
        13.732368
      ],
      [
        100.5676,
        13.732368
      ],
      [
        100.5676,
        13.733232
      ],
      [
        100.5664,
        13.733232
      ],
      [
        100.5664,
        13.732368
      ]
    ],
    "parts": [
      {
        "name": "The EmSphere Base & Platform",
        "color": "#1E293B",
        "height": 14,
        "min_height": 0,
        "footprint": [
          [
            100.56655,
            13.732476
          ],
          [
            100.56745,
            13.732476
          ],
          [
            100.56745,
            13.733124
          ],
          [
            100.56655,
            13.733124
          ],
          [
            100.56655,
            13.732476
          ]
        ]
      },
      {
        "name": "The EmSphere Main Structure",
        "color": "#0F172A",
        "height": 66,
        "min_height": 14,
        "footprint": [
          [
            100.5667,
            13.732584
          ],
          [
            100.5673,
            13.732584
          ],
          [
            100.5673,
            13.733016
          ],
          [
            100.5667,
            13.733016
          ],
          [
            100.5667,
            13.732584
          ]
        ]
      },
      {
        "name": "The EmSphere Crown / Roof",
        "color": "#38BDF8",
        "height": 75,
        "min_height": 66,
        "footprint": [
          [
            100.56682,
            13.73267
          ],
          [
            100.56718,
            13.73267
          ],
          [
            100.56718,
            13.73293
          ],
          [
            100.56682,
            13.73293
          ],
          [
            100.56682,
            13.73267
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "UOB LIVE Hall",
        "size": "ฮอลล์คอนเสิร์ตมาตรฐานระดับโลก 6,000 คน"
      },
      {
        "label": "IKEA City Sukhumvit",
        "size": "อิเกียใจกลางเมืองชั้น 3 เต็มพื้นที่ 12,000 m²"
      },
      {
        "label": "EM MARKET & DINING",
        "size": "ร้านอาหารชั้นนำกว่า 200 ร้านค้าเปิดบริการถึงดึก"
      }
    ],
    "transport": [
      {
        "name": "BTS พร้อมพงษ์ (เดินเชื่อม Skywalk เข้าชั้น M)",
        "dist": "200 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เอ็มโพเรียม & เอ็มควอเทียร์ (Emporium / EmQuartier)",
        "kind": "Mall",
        "color": "#10B981",
        "lat": 13.7305,
        "lon": 100.5695,
        "dist": "250 m"
      },
      {
        "name": "อุทยานเบญจสิริ",
        "kind": "Park",
        "color": "#059669",
        "lat": 13.7315,
        "lon": 100.568,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "bldg-samyan-mitrtown",
    "name": "สามย่านมิตรทาวน์ (Samyan Mitrtown)",
    "category": "มิกซ์ยูส 24 ชั่วโมง & อุโมงค์เชื่อมมิตรสุดชิค",
    "categoryColor": "#059669",
    "type": "building",
    "brandId": "building",
    "brandName": "Frasers Property Thailand",
    "badgeType": "brand",
    "badgeBg": "#059669",
    "color": "#059669",
    "image": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · โซนเปิด 24 ชั่วโมง & อุโมงค์ใต้ดินเชื่อมมิตร (222,000 m²)",
    "district": "ปทุมวัน",
    "location": "944 ถนนพระราม 4 แขวงวังใหม่ เขตปทุมวัน กรุงเทพฯ (แยกสามย่าน)",
    "lat": 13.7335,
    "lon": 100.5284,
    "height": 142,
    "floors": 33,
    "developer": "เฟรเซอร์ส พร็อพเพอร์ตี้ (ประเทศไทย)",
    "developerSite": "https://www.samyan-mitrtown.com/",
    "desc": "โครงการมิกซ์ยูสขวัญใจนักเรียน นักศึกษา และคนนอนดึก ภายใต้แนวคิด 'คลังแห่งอาหารและการเรียนรู้' มีโซน 24 ชั่วโมงเปิดบริการร้านอาหาร Big C Foodplace คาเฟ่ และ Co-working Space ตลอดคืน พร้อม 'อุโมงค์เชื่อมมิตร' อุโมงค์ทางเดินใต้ดินล้ำยุคพื้นกระจกโปร่งใสที่เชื่อมตรงจาก MRT สถานีสามย่าน",
    "footprint": [
      [
        100.5278,
        13.733068
      ],
      [
        100.529,
        13.733068
      ],
      [
        100.529,
        13.733932
      ],
      [
        100.5278,
        13.733932
      ],
      [
        100.5278,
        13.733068
      ]
    ],
    "parts": [
      {
        "name": "สามย่านมิตรทาวน์ Base & Platform",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.52795,
            13.733176
          ],
          [
            100.52885,
            13.733176
          ],
          [
            100.52885,
            13.733824
          ],
          [
            100.52795,
            13.733824
          ],
          [
            100.52795,
            13.733176
          ]
        ]
      },
      {
        "name": "สามย่านมิตรทาวน์ Main Structure",
        "color": "#0F766E",
        "height": 125,
        "min_height": 18,
        "footprint": [
          [
            100.5281,
            13.733284
          ],
          [
            100.5287,
            13.733284
          ],
          [
            100.5287,
            13.733716
          ],
          [
            100.5281,
            13.733716
          ],
          [
            100.5281,
            13.733284
          ]
        ]
      },
      {
        "name": "สามย่านมิตรทาวน์ Crown / Roof",
        "color": "#2DD4BF",
        "height": 142,
        "min_height": 125,
        "footprint": [
          [
            100.52822,
            13.73337
          ],
          [
            100.52858,
            13.73337
          ],
          [
            100.52858,
            13.73363
          ],
          [
            100.52822,
            13.73363
          ],
          [
            100.52822,
            13.73337
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "โซน 24 ชั่วโมง (24-Hour Zone)",
        "size": "Big C, Starbucks, KFC, Too Fast To Sleep, Co-working"
      },
      {
        "label": "มิตรทาวน์ ฮอลล์ (Mitrtown Hall)",
        "size": "พื้นที่จัดอีเวนต์ 5,000 m²"
      },
      {
        "label": "Triple Y Hotel & Residence",
        "size": "โรงแรมและคอนโดมิเนียม Leasehold"
      }
    ],
    "transport": [
      {
        "name": "MRT สามย่าน (อุโมงค์ใต้ดินเชื่อมตรงเข้าโครงการ)",
        "dist": "0 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "จุฬาลงกรณ์มหาวิทยาลัย",
        "kind": "Education",
        "color": "#EC4899",
        "lat": 13.738,
        "lon": 100.53,
        "dist": "200 m"
      },
      {
        "name": "วัดหัวลำโพง พระอารามหลวง",
        "kind": "Temple",
        "color": "#F59E0B",
        "lat": 13.7315,
        "lon": 100.5295,
        "dist": "150 m"
      }
    ]
  },
  {
    "id": "transit-saphan-taksin",
    "name": "BTS สะพานตากสิน / ท่าเรือสาทร (Sathorn Pier)",
    "category": "ศูนย์กลางเชื่อมต่อระบบรางและเรือด่วนเจ้าพระยา",
    "categoryColor": "#0284C7",
    "type": "transit",
    "brandId": "transit",
    "brandName": "BTS สายสีลม & ท่าเรือสาทร",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0284C7",
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "🚊 S6 · ฮับเชื่อมต่อเรือด่วนเจ้าพระยา & Shuttle Boat ไอคอนสยาม / เอเชียทีค",
    "district": "บางรัก",
    "location": "เชิงสะพานสมเด็จพระเจ้าตากสินมหาราช ถนนสาทรใต้ เขตบางรัก กรุงเทพฯ",
    "lat": 13.7188,
    "lon": 100.514,
    "height": 25,
    "floors": 2,
    "developer": "BTS & กรมเจ้าท่า",
    "developerSite": "https://www.bts.co.th/",
    "desc": "ชุมทางการคมนาคมที่สำคัญที่สุดริมแม่น้ำเจ้าพระยา จุดเชื่อมต่อระหว่าง BTS สถานีสะพานตากสิน (สายสีลม) และท่าเรือสาทร (เซ็นทรัลเพียร์) มีเรือด่วนเจ้าพระยาทุกสาย (ธงส้ม, ธงเหลือง, ธงเขียว, ธงทอง) และเรือรับส่ง Shuttle Boat ฟรีไปยังไอคอนสยาม (ICONSIAM) และเอเชียทีค เดอะ ริเวอร์ฟร้อนท์",
    "footprint": [
      [
        100.51355,
        13.718476
      ],
      [
        100.51445,
        13.718476
      ],
      [
        100.51445,
        13.719124
      ],
      [
        100.51355,
        13.719124
      ],
      [
        100.51355,
        13.718476
      ]
    ],
    "parts": [
      {
        "name": "สะพานตากสิน-สาทร Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.51355,
            13.718476
          ],
          [
            100.51445,
            13.718476
          ],
          [
            100.51445,
            13.719124
          ],
          [
            100.51355,
            13.719124
          ],
          [
            100.51355,
            13.718476
          ]
        ]
      },
      {
        "name": "สะพานตากสิน-สาทร Main Structure",
        "color": "#0284C7",
        "height": 22,
        "min_height": 8,
        "footprint": [
          [
            100.5137,
            13.718584
          ],
          [
            100.5143,
            13.718584
          ],
          [
            100.5143,
            13.719016
          ],
          [
            100.5137,
            13.719016
          ],
          [
            100.5137,
            13.718584
          ]
        ]
      },
      {
        "name": "สะพานตากสิน-สาทร Crown / Roof",
        "color": "#38BDF8",
        "height": 25,
        "min_height": 22,
        "footprint": [
          [
            100.51382,
            13.71867
          ],
          [
            100.51418,
            13.71867
          ],
          [
            100.51418,
            13.71893
          ],
          [
            100.51382,
            13.71893
          ],
          [
            100.51382,
            13.71867
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "BTS สถานีสะพานตากสิน (S6)",
        "size": "สายสีลมมุ่งหน้าบางหว้า หรือ สนามกีฬาแห่งชาติ"
      },
      {
        "label": "ท่าเรือสาทร (Sathorn Pier)",
        "size": "เรือด่วนเจ้าพระยาไปนนทบุรี - ปากเกร็ด"
      },
      {
        "label": "Shuttle Boat ฟรี",
        "size": "เรือรับส่งไป ICONSIAM (ทุก 10 นาที) & ASIATIQUE"
      }
    ],
    "transport": [
      {
        "name": "BTS สายสีลม (S6)",
        "dist": "0 m",
        "type": "bts"
      },
      {
        "name": "ท่าเรือสาทร (เรือด่วนเจ้าพระยา & เรือข้ามฟาก)",
        "dist": "30 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ไอคอนสยาม (ICONSIAM - ข้ามฝั่งแม่น้ำ)",
        "kind": "Mall",
        "color": "#CA8A04",
        "lat": 13.7267,
        "lon": 100.5108,
        "dist": "นั่งเรือ 5 นาที"
      },
      {
        "name": "โรงแรมแชงกรี-ลา กรุงเทพฯ",
        "kind": "Hotel",
        "color": "#6366F1",
        "lat": 13.7202,
        "lon": 100.5135,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "transit-tao-poon-station",
    "name": "MRT เตาปูน (Tao Poon Interchange)",
    "category": "ชุมทางเชื่อมต่อ MRT สายสีน้ำเงิน & รถไฟฟ้าสายสีม่วง",
    "categoryColor": "#7C3AED",
    "type": "transit",
    "brandId": "transit",
    "brandName": "MRT Blue Line & Purple Line",
    "badgeType": "brand",
    "badgeBg": "#7C3AED",
    "color": "#7C3AED",
    "image": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "🚊 BL10 / PP16 · ชุมทางสายสีน้ำเงิน (วงกลมเมือง) & สีม่วง (คลองบางไผ่-นนทบุรี)",
    "district": "บางซื่อ",
    "location": "สี่แยกเตาปูน ถนนกรุงเทพฯ-นนทบุรี แขวงบางซื่อ เขตบางซื่อ กรุงเทพฯ",
    "lat": 13.8062,
    "lon": 100.53,
    "height": 36,
    "floors": 4,
    "developer": "รฟม. & BEM (Bangkok Expressway and Metro)",
    "developerSite": "https://www.bemplc.co.th/",
    "desc": "สถานีชุมทางลอยฟ้าขนาดใหญ่ 4 ชั้น จุดเปลี่ยนถ่ายการเดินทางระหว่าง MRT สายสีน้ำเงิน (เฉลิมรัชมงคล วงกลมรอบกรุงเทพฯ) และ MRT รถไฟฟ้าสายสีม่วง (ฉลองรัชมงคล มุ่งหน้านนทบุรี-คลองบางไผ่) เชื่อมต่อด้วยบันไดเลื่อนภายในอาคารสถานี สะดวกสบายไม่ต้องออกจากระบบ",
    "footprint": [
      [
        100.5295,
        13.80584
      ],
      [
        100.5305,
        13.80584
      ],
      [
        100.5305,
        13.80656
      ],
      [
        100.5295,
        13.80656
      ],
      [
        100.5295,
        13.80584
      ]
    ],
    "parts": [
      {
        "name": "MRT เตาปูน Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.52955,
            13.805876
          ],
          [
            100.53045,
            13.805876
          ],
          [
            100.53045,
            13.806524
          ],
          [
            100.52955,
            13.806524
          ],
          [
            100.52955,
            13.805876
          ]
        ]
      },
      {
        "name": "MRT เตาปูน Main Structure",
        "color": "#7C3AED",
        "height": 32,
        "min_height": 8,
        "footprint": [
          [
            100.5297,
            13.805984
          ],
          [
            100.5303,
            13.805984
          ],
          [
            100.5303,
            13.806416
          ],
          [
            100.5297,
            13.806416
          ],
          [
            100.5297,
            13.805984
          ]
        ]
      },
      {
        "name": "MRT เตาปูน Crown / Roof",
        "color": "#C084FC",
        "height": 36,
        "min_height": 32,
        "footprint": [
          [
            100.52982,
            13.80607
          ],
          [
            100.53018,
            13.80607
          ],
          [
            100.53018,
            13.80633
          ],
          [
            100.52982,
            13.80633
          ],
          [
            100.52982,
            13.80607
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ชานชาลาชั้น 3 (MRT สายสีน้ำเงิน BL10)",
        "size": "มุ่งหน้าท่าพระ - หัวลำโพง - บางซื่อ"
      },
      {
        "label": "ชานชาลาชั้น 4 (MRT สายสีม่วง PP16)",
        "size": "ต้นทางสู่บางใหญ่ - คลองบางไผ่ จ.นนทบุรี"
      },
      {
        "label": "ทางเชื่อมเกตเวย์ แอท บางซื่อ",
        "size": "Skywalk เชื่อมศูนย์การค้า Gateway at Bangsue"
      }
    ],
    "transport": [
      {
        "name": "MRT สายสีน้ำเงิน (BL10)",
        "dist": "0 m",
        "type": "mrt"
      },
      {
        "name": "MRT สายสีม่วง (PP16)",
        "dist": "0 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เกตเวย์ แอท บางซื่อ (Gateway at Bangsue)",
        "kind": "Mall",
        "color": "#F59E0B",
        "lat": 13.805,
        "lon": 100.5255,
        "dist": "450 m"
      },
      {
        "name": "ตลาดเตาปูน แหล่งของกินโบราณ",
        "kind": "Market",
        "color": "#16A34A",
        "lat": 13.807,
        "lon": 100.531,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "port-suvarnabhumi-airport",
    "name": "ท่าอากาศยานสุวรรณภูมิ (Suvarnabhumi Airport - BKK)",
    "category": "ท่าอากาศยานนานาชาติ & ศูนย์กลางการบินระดับโลก",
    "categoryColor": "#0284C7",
    "type": "airport",
    "brandId": "airport",
    "brandName": "ท่าอากาศยานไทย (AOT)",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0284C7",
    "image": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "✈️ BKK · ศูนย์กลางการบินระดับโลก (ผู้โดยสาร 65 ล้านคน/ปี)",
    "district": "บางพลี สมุทรปราการ",
    "location": "999 หมู่ 1 ตำบลหนองปรือ อำเภอบางพลี จังหวัดสมุทรปราการ",
    "lat": 13.69,
    "lon": 100.7501,
    "height": 68,
    "floors": 7,
    "developer": "บริษัท ท่าอากาศยานไทย จำกัด (มหาชน) - AOT",
    "developerSite": "https://suvarnabhumi.airportthai.co.th/",
    "desc": "ท่าอากาศยานนานาชาติหลักของประเทศไทยและฮับการบินชั้นนำแห่งเอเชียตะวันออกเฉียงใต้ โดดเด่นด้วยอาคารผู้โดยสารเดี่ยวขนาดใหญ่ที่สุดติดอันดับโลก (563,000 ตร.ม.) สถาปัตยกรรมโครงสร้างเหล็กและหลังคาผ้าใบโปร่งแสง อาคารเทียบเครื่องบินรอง SAT-1 เชื่อมต่อด้วยรถไฟไร้คนขับ APM ใต้ดิน พร้อมรันเวย์ 3 เส้นทาง และแอร์พอร์ต เรล ลิงก์ เชื่อมสู่ใจกลางเมือง",
    "footprint": [
      [
        100.74915,
        13.689316
      ],
      [
        100.75105,
        13.689316
      ],
      [
        100.75105,
        13.690684
      ],
      [
        100.74915,
        13.690684
      ],
      [
        100.74915,
        13.689316
      ]
    ],
    "parts": [
      {
        "name": "สุวรรณภูมิ Base & Platform",
        "color": "#1E293B",
        "height": 12,
        "min_height": 0,
        "footprint": [
          [
            100.74955,
            13.689604
          ],
          [
            100.75065,
            13.689604
          ],
          [
            100.75065,
            13.690396
          ],
          [
            100.74955,
            13.690396
          ],
          [
            100.74955,
            13.689604
          ]
        ]
      },
      {
        "name": "สุวรรณภูมิ Main Structure",
        "color": "#0F172A",
        "height": 60,
        "min_height": 12,
        "footprint": [
          [
            100.74972,
            13.689726
          ],
          [
            100.75048,
            13.689726
          ],
          [
            100.75048,
            13.690274
          ],
          [
            100.74972,
            13.690274
          ],
          [
            100.74972,
            13.689726
          ]
        ]
      },
      {
        "name": "สุวรรณภูมิ Crown / Roof",
        "color": "#38BDF8",
        "height": 68,
        "min_height": 60,
        "footprint": [
          [
            100.74988,
            13.689842
          ],
          [
            100.75032,
            13.689842
          ],
          [
            100.75032,
            13.690158
          ],
          [
            100.74988,
            13.690158
          ],
          [
            100.74988,
            13.689842
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Main Terminal (อาคารผู้โดยสารหลัก)",
        "size": "พื้นที่ 563,000 m² (ชั้น 1-4)"
      },
      {
        "label": "SAT-1 (อาคารเทียบเครื่องบินรอง)",
        "size": "28 หลุมจอดประชิดอาคาร เชื่อมต่อรถไฟฟ้า APM"
      },
      {
        "label": "หอบังคับการบินสุวรรณภูมิ",
        "size": "สูง 132 เมตร (สูงติดอันดับโลก)"
      },
      {
        "label": "Airport Rail Link (ARL)",
        "size": "สถานีสุวรรณภูมิตั้งอยู่ชั้นใต้ดิน B"
      }
    ],
    "transport": [
      {
        "name": "Airport Rail Link สุวรรณภูมิ (ARL A1)",
        "dist": "0 m (ชั้นใต้ดินอาคาร)",
        "type": "mrt"
      },
      {
        "name": "ทางพิเศษบูรพาวิถี & มอเตอร์เวย์กรุงเทพฯ-ชลบุรี",
        "dist": "เชื่อมตรงสนามบิน",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เซ็นทรัล วิลเลจ เอาต์เล็ต (Central Village)",
        "kind": "Outlet",
        "color": "#F59E0B",
        "lat": 13.648,
        "lon": 100.742,
        "dist": "4.5 km"
      },
      {
        "name": "เมกาบางนา (Mega Bangna)",
        "kind": "Mall",
        "color": "#2563EB",
        "lat": 13.6465,
        "lon": 100.6805,
        "dist": "10 km"
      }
    ]
  },
  {
    "id": "port-donmueang-airport",
    "name": "ท่าอากาศยานดอนเมือง (Don Mueang Airport - DMK)",
    "category": "ท่าอากาศยานนานาชาติ & ฮับสายการบิน Low-Cost",
    "categoryColor": "#0369A1",
    "type": "airport",
    "brandId": "airport",
    "brandName": "ท่าอากาศยานไทย (AOT)",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#0369A1",
    "image": "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "✈️ DMK · ฮับสายการบินต้นทุนต่ำที่เก่าแก่ที่สุดในเอเชีย",
    "district": "ดอนเมือง กรุงเทพฯ",
    "location": "222 ถนนวิภาวดีรังสิต แขวงสนามบิน เขตดอนเมือง กรุงเทพฯ",
    "lat": 13.9126,
    "lon": 100.6067,
    "height": 45,
    "floors": 4,
    "developer": "บริษัท ท่าอากาศยานไทย จำกัด (มหาชน) - AOT",
    "developerSite": "https://donmueang.airportthai.co.th/",
    "desc": "หนึ่งในท่าอากาศยานเชิงพาณิชย์ที่เก่าแก่ที่สุดในโลก (เปิดดำเนินการตั้งแต่ พ.ศ. 2457) ปัจจุบันเป็นศูนย์กลางการบินสายการบินต้นทุนต่ำ (Low-Cost Carrier) ที่ใหญ่ที่สุดในเอเชียตะวันออกเฉียงใต้ รองรับเที่ยวบินภายในประเทศและระหว่างประเทศในภูมิภาค มีทางเดิน Skywalk ปรับอากาศเชื่อมต่อตรงเข้าสู่สถานีรถไฟฟ้าชานเมืองสายสีแดง (สถานีดอนเมือง)",
    "footprint": [
      [
        100.60585,
        13.911988
      ],
      [
        100.60755,
        13.911988
      ],
      [
        100.60755,
        13.913212
      ],
      [
        100.60585,
        13.913212
      ],
      [
        100.60585,
        13.911988
      ]
    ],
    "parts": [
      {
        "name": "ดอนเมือง Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.60615,
            13.912204
          ],
          [
            100.60725,
            13.912204
          ],
          [
            100.60725,
            13.912996
          ],
          [
            100.60615,
            13.912996
          ],
          [
            100.60615,
            13.912204
          ]
        ]
      },
      {
        "name": "ดอนเมือง Main Structure",
        "color": "#0F172A",
        "height": 40,
        "min_height": 8,
        "footprint": [
          [
            100.60632,
            13.912326
          ],
          [
            100.60708,
            13.912326
          ],
          [
            100.60708,
            13.912874
          ],
          [
            100.60632,
            13.912874
          ],
          [
            100.60632,
            13.912326
          ]
        ]
      },
      {
        "name": "ดอนเมือง Crown / Roof",
        "color": "#60A5FA",
        "height": 45,
        "min_height": 40,
        "footprint": [
          [
            100.60648,
            13.912442
          ],
          [
            100.60692,
            13.912442
          ],
          [
            100.60692,
            13.912758
          ],
          [
            100.60648,
            13.912758
          ],
          [
            100.60648,
            13.912442
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Terminal 1 (อาคารระหว่างประเทศ)",
        "size": "เที่ยวบินข้ามประเทศในเอเชีย"
      },
      {
        "label": "Terminal 2 (อาคารในประเทศ)",
        "size": "เที่ยวบินสู่ทั่วทุกภูมิภาคในไทย"
      },
      {
        "label": "Skywalk เชื่อมรถไฟฟ้าสายสีแดง",
        "size": "ทางเดินเชื่อมปรับอากาศข้ามถนนวิภาวดี"
      }
    ],
    "transport": [
      {
        "name": "รถไฟฟ้าสายสีแดง สถานีดอนเมือง (RN08)",
        "dist": "เชื่อมตรง Skywalk 50 m",
        "type": "mrt"
      },
      {
        "name": "ดอนเมืองโทลล์เวย์ (ทางยกระดับอุตราภิมุข)",
        "dist": "ทางลาดเชื่อมเข้าอาคารผู้โดยสาร",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "กองทัพอากาศ & พิพิธภัณฑ์กองทัพอากาศ",
        "kind": "Museum",
        "color": "#6366F1",
        "lat": 13.9215,
        "lon": 100.619,
        "dist": "1.8 km"
      },
      {
        "name": "ฟิวเจอร์พาร์ค รังสิต",
        "kind": "Mall",
        "color": "#DC2626",
        "lat": 13.9892,
        "lon": 100.6178,
        "dist": "8.5 km"
      }
    ]
  },
  {
    "id": "port-klongtoey",
    "name": "ท่าเรือกรุงเทพ (ท่าเรือคลองเตย / Bangkok Port)",
    "category": "ท่าเรือขนส่งสินค้าระหว่างประเทศริมแม่น้ำเจ้าพระยา",
    "categoryColor": "#0D9488",
    "type": "port",
    "brandId": "port",
    "brandName": "การท่าเรือแห่งประเทศไทย (PAT)",
    "badgeType": "brand",
    "badgeBg": "#0D9488",
    "color": "#0D9488",
    "image": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "🚢 PAT · ศูนย์กลางตู้คอนเทนเนอร์ 1.5 ล้าน TEU/ปี",
    "district": "คลองเตย กรุงเทพฯ",
    "location": "444 ถนนท่าเรือ แขวงคลองเตย เขตคลองเตย กรุงเทพฯ",
    "lat": 13.7082,
    "lon": 100.575,
    "height": 55,
    "floors": 3,
    "developer": "การท่าเรือแห่งประเทศไทย (Port Authority of Thailand)",
    "developerSite": "https://www.bangkokport.co.th/",
    "desc": "ท่าเรือพาณิชย์หลักของเมืองหลวงบนโค้งน้ำเจ้าพระยาตอนล่าง ขนถ่ายสินค้าตู้คอนเทนเนอร์และสินค้าทั่วไปทางทะเลระหว่างประเทศ มีเครนปั้นจั่นยกตู้สินค้าริมเขื่อนเทียบเรือความยาวกว่า 2 กิโลเมตร มีลานกองตู้คอนเทนเนอร์และคลังสินค้าทัณฑ์บนขนาดใหญ่ เป็นฟันเฟืองโลจิสติกส์การส่งออกและนำเข้าที่สำคัญที่สุดของกรุงเทพมหานคร",
    "footprint": [
      [
        100.57415,
        13.707588
      ],
      [
        100.57585,
        13.707588
      ],
      [
        100.57585,
        13.708812
      ],
      [
        100.57415,
        13.708812
      ],
      [
        100.57415,
        13.707588
      ]
    ],
    "parts": [
      {
        "name": "ท่าเรือคลองเตย Base & Platform",
        "color": "#1E293B",
        "height": 10,
        "min_height": 0,
        "footprint": [
          [
            100.57445,
            13.707804
          ],
          [
            100.57555,
            13.707804
          ],
          [
            100.57555,
            13.708596
          ],
          [
            100.57445,
            13.708596
          ],
          [
            100.57445,
            13.707804
          ]
        ]
      },
      {
        "name": "ท่าเรือคลองเตย Main Structure",
        "color": "#134E4A",
        "height": 48,
        "min_height": 10,
        "footprint": [
          [
            100.57462,
            13.707926
          ],
          [
            100.57538,
            13.707926
          ],
          [
            100.57538,
            13.708474
          ],
          [
            100.57462,
            13.708474
          ],
          [
            100.57462,
            13.707926
          ]
        ]
      },
      {
        "name": "ท่าเรือคลองเตย Crown / Roof",
        "color": "#2DD4BF",
        "height": 55,
        "min_height": 48,
        "footprint": [
          [
            100.57478,
            13.708042
          ],
          [
            100.57522,
            13.708042
          ],
          [
            100.57522,
            13.708358
          ],
          [
            100.57478,
            13.708358
          ],
          [
            100.57478,
            13.708042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "เขื่อนเทียบเรือตู้สินค้าฝั่งตะวันออก",
        "size": "ความยาวหน้าท่า 1,528 เมตร"
      },
      {
        "label": "เขื่อนเทียบเรือสินค้าฝั่งตะวันตก",
        "size": "ความยาวหน้าท่า 1,000 เมตร"
      },
      {
        "label": "ลานกองตู้คอนเทนเนอร์ (Container Yard)",
        "size": "รองรับกว่า 1.5 ล้าน TEU/ปี"
      }
    ],
    "transport": [
      {
        "name": "ทางพิเศษเฉลิมมหานคร (ด่านท่าเรือ)",
        "dist": "0 m",
        "type": "car"
      },
      {
        "name": "MRT คลองเตย / MRT ศูนย์สิริกิติ์",
        "dist": "2.2 km",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "อาคารการท่าเรือแห่งประเทศไทย",
        "kind": "Govt",
        "color": "#0F766E",
        "lat": 13.712,
        "lon": 100.572,
        "dist": "500 m"
      }
    ]
  },
  {
    "id": "port-sathorn-pier",
    "name": "ท่าเรือสาทร (Sathorn Central Pier - ท่าเรือกลาง)",
    "category": "ฮับคมนาคมทางน้ำแม่น้ำเจ้าพระยา & เชื่อม BTS",
    "categoryColor": "#0284C7",
    "type": "port",
    "brandId": "port",
    "brandName": "เรือด่วนเจ้าพระยา & กรมเจ้าท่า",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0284C7",
    "image": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "🚢 ท่าเรือกลาง · เชื่อมต่อ BTS สะพานตากสิน (0 ม.)",
    "district": "บางรัก กรุงเทพฯ",
    "location": "เชิงสะพานสมเด็จพระเจ้าตากสิน ถนนสาทรใต้ แขวงยานนาวา สาทร กรุงเทพฯ",
    "lat": 13.7185,
    "lon": 100.5132,
    "height": 20,
    "floors": 2,
    "developer": "กรมเจ้าท่า & บริษัท เรือด่วนเจ้าพระยา จำกัด",
    "developerSite": "https://www.chaophrayaexpressboat.com/",
    "desc": "ท่าเรือศูนย์กลาง (Central Pier) ของระบบคมนาคมทางน้ำในแม่น้ำเจ้าพระยา จุดเชื่อมต่อระหว่างเรือด่วนเจ้าพระยาทุกสาย (ธงส้ม, ธงเหลือง, ธงเขียว, ธงทอง) กับรถไฟฟ้า BTS สถานีสะพานตากสิน (สายสีลม) มีบริการเรือรับส่งฟรี (Shuttle Boat) ไปยังไอคอนสยาม และเอเชียทีค เดอะ ริเวอร์ฟร้อนท์",
    "footprint": [
      [
        100.51275,
        13.718176
      ],
      [
        100.51365,
        13.718176
      ],
      [
        100.51365,
        13.718824
      ],
      [
        100.51275,
        13.718824
      ],
      [
        100.51275,
        13.718176
      ]
    ],
    "parts": [
      {
        "name": "ท่าเรือสาทร Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.51265,
            13.718104
          ],
          [
            100.51375,
            13.718104
          ],
          [
            100.51375,
            13.718896
          ],
          [
            100.51265,
            13.718896
          ],
          [
            100.51265,
            13.718104
          ]
        ]
      },
      {
        "name": "ท่าเรือสาทร Main Structure",
        "color": "#0369A1",
        "height": 18,
        "min_height": 8,
        "footprint": [
          [
            100.51282,
            13.718226
          ],
          [
            100.51358,
            13.718226
          ],
          [
            100.51358,
            13.718774
          ],
          [
            100.51282,
            13.718774
          ],
          [
            100.51282,
            13.718226
          ]
        ]
      },
      {
        "name": "ท่าเรือสาทร Crown / Roof",
        "color": "#38BDF8",
        "height": 20,
        "min_height": 18,
        "footprint": [
          [
            100.51298,
            13.718342
          ],
          [
            100.51342,
            13.718342
          ],
          [
            100.51342,
            13.718658
          ],
          [
            100.51298,
            13.718658
          ],
          [
            100.51298,
            13.718342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "เรือด่วนเจ้าพระยาธงส้ม (นนทบุรี - วัดราชสิงขร)",
        "size": "ค่าโดยสาร ฿16 ตลอดสาย"
      },
      {
        "label": "Shuttle Boat ICONSIAM (ฟรี)",
        "size": "ออกทุก 10 นาที (ใช้เวลา 5 นาที)"
      },
      {
        "label": "Shuttle Boat ASIATIQUE (ฟรี)",
        "size": "บริการช่วงเย็น 16:00 - 23:00 น."
      }
    ],
    "transport": [
      {
        "name": "BTS สะพานตากสิน (ทางออก 2 เชื่อมทางเดินสู่ท่าเรือ)",
        "dist": "0 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "โรงแรมแชงกรี-ลา กรุงเทพฯ",
        "kind": "Hotel",
        "color": "#6366F1",
        "lat": 13.7202,
        "lon": 100.5135,
        "dist": "80 m"
      },
      {
        "name": "ไอคอนสยาม (ICONSIAM ฝั่งธนบุรี)",
        "kind": "Mall",
        "color": "#CA8A04",
        "lat": 13.7267,
        "lon": 100.5108,
        "dist": "นั่งเรือ 5 นาที"
      }
    ]
  },
  {
    "id": "port-wanglang-pier",
    "name": "ท่าวังหลัง & พรานนก (Wang Lang Pier)",
    "category": "ท่าเรือข้ามฟากประวัติศาสตร์ & แหล่งสตรีทฟู้ดวังหลัง",
    "categoryColor": "#D97706",
    "type": "port",
    "brandId": "port",
    "brandName": "เรือข้ามฟากเจ้าพระยา",
    "badgeType": "brand",
    "badgeBg": "#D97706",
    "color": "#D97706",
    "image": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "🚢 ข้ามฟากวังหลัง-ท่าพระจันทร์/ท่าช้าง (฿4.50) · หน้า รพ.ศิริราช",
    "district": "บางกอกน้อย กรุงเทพฯ",
    "location": "ถนนอรุณอมรินทร์ แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ",
    "lat": 13.7558,
    "lon": 100.4878,
    "height": 20,
    "floors": 2,
    "developer": "กรมเจ้าท่า / ท่าวังหลังมาร์เก็ต",
    "developerSite": "https://www.bangkoktourist.com/",
    "desc": "ท่าเรือข้ามฟากริมแม่น้ำเจ้าพระยาฝั่งธนบุรีที่มีผู้โดยสารหนาแน่นที่สุด เชื่อมตรงระหว่างโรงพยาบาลศิริราชกับฝั่งพระนคร (ท่าพระจันทร์และท่าช้าง) ทางเดินขึ้นจากท่าเรือเชื่อมตรงเข้าสู่ 'ตลาดวังหลัง' ตลาดของกินและแฟชั่นขวัญใจนักศึกษา แพทย์ พยาบาล และนักท่องเที่ยว",
    "footprint": [
      [
        100.48735,
        13.755476
      ],
      [
        100.48825,
        13.755476
      ],
      [
        100.48825,
        13.756124
      ],
      [
        100.48735,
        13.756124
      ],
      [
        100.48735,
        13.755476
      ]
    ],
    "parts": [
      {
        "name": "ท่าวังหลัง Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.48725,
            13.755404
          ],
          [
            100.48835,
            13.755404
          ],
          [
            100.48835,
            13.756196
          ],
          [
            100.48725,
            13.756196
          ],
          [
            100.48725,
            13.755404
          ]
        ]
      },
      {
        "name": "ท่าวังหลัง Main Structure",
        "color": "#B45309",
        "height": 18,
        "min_height": 8,
        "footprint": [
          [
            100.48742,
            13.755526
          ],
          [
            100.48818,
            13.755526
          ],
          [
            100.48818,
            13.756074
          ],
          [
            100.48742,
            13.756074
          ],
          [
            100.48742,
            13.755526
          ]
        ]
      },
      {
        "name": "ท่าวังหลัง Crown / Roof",
        "color": "#FBBF24",
        "height": 20,
        "min_height": 18,
        "footprint": [
          [
            100.48758,
            13.755642
          ],
          [
            100.48802,
            13.755642
          ],
          [
            100.48802,
            13.755958
          ],
          [
            100.48758,
            13.755958
          ],
          [
            100.48758,
            13.755642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "เรือข้ามฟากวังหลัง - ท่าพระจันทร์ (ธรรมศาสตร์)",
        "size": "ค่าโดยสาร ฿4.50"
      },
      {
        "label": "เรือข้ามฟากวังหลัง - ท่าช้าง (พระบรมมหาราชวัง)",
        "size": "ค่าโดยสาร ฿4.50"
      },
      {
        "label": "เรือด่วนเจ้าพระยาท่าพรานนก",
        "size": "เรือธงส้ม / ธงทอง"
      }
    ],
    "transport": [
      {
        "name": "โรงพยาบาลศิริราช & ศิริราช ปิยมหาราชการุณย์",
        "dist": "50 m",
        "type": "car"
      },
      {
        "name": "MRT บางขุนนนท์ / MRT ไฟฉาย",
        "dist": "1.8 km",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ตลาดวังหลัง แหล่งของกินในตำนาน",
        "kind": "Food",
        "color": "#EA580C",
        "lat": 13.7555,
        "lon": 100.487,
        "dist": "10 m"
      },
      {
        "name": "พิพิธภัณฑ์การแพทย์ศิริราช",
        "kind": "Museum",
        "color": "#6366F1",
        "lat": 13.758,
        "lon": 100.4855,
        "dist": "300 m"
      }
    ]
  },
  {
    "id": "port-tha-maharaj",
    "name": "ท่ามหาราช (Tha Maharaj Pier & Riverside Mall)",
    "category": "ท่าเรือคอมมูนิตี้มอลล์ริมน้ำ & ประตูสู่เกาะรัตนโกสินทร์",
    "categoryColor": "#4F46E5",
    "type": "port",
    "brandId": "port",
    "brandName": "สุภัทรา ริเวอร์ มาร์เก็ต",
    "badgeType": "brand",
    "badgeBg": "#4338CA",
    "color": "#4338CA",
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · จุดต่อเรือท่องเที่ยว Hop-On Hop-Off & คาเฟ่ริมน้ำ",
    "district": "พระนคร กรุงเทพฯ",
    "location": "1/11 ตรอกมหาธาตุ ถนนมหาราช แขวงพระบรมมหาราชวัง เขตพระนคร กรุงเทพฯ",
    "lat": 13.7551,
    "lon": 100.4896,
    "height": 22,
    "floors": 3,
    "developer": "กลุ่มบริษัท สุภัทรา จำกัด (Supatra Real Estate)",
    "developerSite": "https://www.thamaharaj.com/",
    "desc": "คอมมูนิตี้มอลล์ริมแม่น้ำเจ้าพระยาแห่งเดียวบนเกาะรัตนโกสินทร์ รีโนเวทจากตึกแถวโบราณริมน้ำให้กลายเป็นโอเอซิสริมเจ้าพระยา มีจุดจอดเรือท่องเที่ยว Hop-On Hop-Off Chao Phraya Tourist Boat คาเฟ่ ร้านอาหารวิวแม่น้ำ ลานกิจกรรมกลางแจ้งริมน้ำ และทางเดินเชื่อมไปยัง ม.ศิลปากร วังท่าพระ และ ม.ธรรมศาสตร์ ท่าพระจันทร์",
    "footprint": [
      [
        100.48915,
        13.754776
      ],
      [
        100.49005,
        13.754776
      ],
      [
        100.49005,
        13.755424
      ],
      [
        100.48915,
        13.755424
      ],
      [
        100.48915,
        13.754776
      ]
    ],
    "parts": [
      {
        "name": "ท่ามหาราช Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.48905,
            13.754704
          ],
          [
            100.49015,
            13.754704
          ],
          [
            100.49015,
            13.755496
          ],
          [
            100.48905,
            13.755496
          ],
          [
            100.48905,
            13.754704
          ]
        ]
      },
      {
        "name": "ท่ามหาราช Main Structure",
        "color": "#3730A3",
        "height": 19,
        "min_height": 8,
        "footprint": [
          [
            100.48922,
            13.754826
          ],
          [
            100.48998,
            13.754826
          ],
          [
            100.48998,
            13.755374
          ],
          [
            100.48922,
            13.755374
          ],
          [
            100.48922,
            13.754826
          ]
        ]
      },
      {
        "name": "ท่ามหาราช Crown / Roof",
        "color": "#818CF8",
        "height": 22,
        "min_height": 19,
        "footprint": [
          [
            100.48938,
            13.754942
          ],
          [
            100.48982,
            13.754942
          ],
          [
            100.48982,
            13.755258
          ],
          [
            100.48938,
            13.755258
          ],
          [
            100.48938,
            13.754942
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Chao Phraya Tourist Boat (Blue Flag)",
        "size": "บัตร One-day River Pass ไม่จำกัดเที่ยว"
      },
      {
        "label": "ร้านอาหารริมน้ำวิวคุ้งน้ำศิริราช",
        "size": "ร้านอาหารไทย, ซีฟู้ด, คาเฟ่ Gram, Starbucks"
      },
      {
        "label": "เรือข้ามฟาก ท่ามหาราช - วังหลัง",
        "size": "ค่าโดยสาร ฿4.50"
      }
    ],
    "transport": [
      {
        "name": "เรือท่องเที่ยวแม่น้ำเจ้าพระยา (CTB)",
        "dist": "0 m",
        "type": "boat"
      },
      {
        "name": "MRT สนามไชย",
        "dist": "1.2 km",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "มหาวิทยาลัยศิลปากร (วังท่าพระ)",
        "kind": "Education",
        "color": "#EC4899",
        "lat": 13.7535,
        "lon": 100.4905,
        "dist": "150 m"
      },
      {
        "name": "วัดมหาธาตุยุวราชรังสฤษฎิ์",
        "kind": "Temple",
        "color": "#F59E0B",
        "lat": 13.7545,
        "lon": 100.4915,
        "dist": "100 m"
      }
    ]
  },
  {
    "id": "port-tha-tien",
    "name": "ท่าเตียน (Tha Tien Pier)",
    "category": "ท่าเรือข้ามฟากหน้าวัดโพธิ์ สู่พระปรางค์วัดอรุณฯ",
    "categoryColor": "#7C3AED",
    "type": "port",
    "brandId": "port",
    "brandName": "ท่าเรือข้ามฟากแม่น้ำเจ้าพระยา",
    "badgeType": "brand",
    "badgeBg": "#7C3AED",
    "color": "#7C3AED",
    "image": "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "🚢 เรือข้ามฟากท่าเตียน-วัดอรุณฯ (฿5) · วิวพระอาทิตย์ตกริมน้ำ",
    "district": "พระนคร กรุงเทพฯ",
    "location": "ถนนมหาราช แขวงพระบรมมหาราชวัง เขตพระนคร กรุงเทพฯ",
    "lat": 13.7455,
    "lon": 100.4905,
    "height": 18,
    "floors": 2,
    "developer": "กรมเจ้าท่า / กรุงเทพมหานคร",
    "developerSite": "https://www.tourismthailand.org/",
    "desc": "ท่าเรือข้ามฟากที่มีทัศนียภาพงดงามที่สุดแห่งหนึ่งในกรุงเทพฯ ตั้งอยู่ตรงข้ามพระปรางค์วัดอรุณราชวราราม มีเรือข้ามฟากข้ามฝั่งไปยังวัดอรุณฯ ในราคา 5 บาท รอบบริเวณท่าเตียนเรียงรายด้วยอาคารตึกแถวโบราณสถาปัตยกรรมยุคเรอเนสซองส์ ร้านอาหารและรูฟท็อปบาร์ชมวิวพระอาทิตย์ตกริมแม่น้ำเจ้าพระยา",
    "footprint": [
      [
        100.49005,
        13.745176
      ],
      [
        100.49095,
        13.745176
      ],
      [
        100.49095,
        13.745824
      ],
      [
        100.49005,
        13.745824
      ],
      [
        100.49005,
        13.745176
      ]
    ],
    "parts": [
      {
        "name": "ท่าเตียน Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.48995,
            13.745104
          ],
          [
            100.49105,
            13.745104
          ],
          [
            100.49105,
            13.745896
          ],
          [
            100.48995,
            13.745896
          ],
          [
            100.48995,
            13.745104
          ]
        ]
      },
      {
        "name": "ท่าเตียน Main Structure",
        "color": "#6D28D9",
        "height": 16,
        "min_height": 8,
        "footprint": [
          [
            100.49012,
            13.745226
          ],
          [
            100.49088,
            13.745226
          ],
          [
            100.49088,
            13.745774
          ],
          [
            100.49012,
            13.745774
          ],
          [
            100.49012,
            13.745226
          ]
        ]
      },
      {
        "name": "ท่าเตียน Crown / Roof",
        "color": "#C084FC",
        "height": 18,
        "min_height": 16,
        "footprint": [
          [
            100.49028,
            13.745342
          ],
          [
            100.49072,
            13.745342
          ],
          [
            100.49072,
            13.745658
          ],
          [
            100.49028,
            13.745658
          ],
          [
            100.49028,
            13.745342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "เรือข้ามฟากท่าเตียน - ท่าวัดอรุณฯ",
        "size": "ค่าโดยสาร ฿5 (ออกทุก 5 นาที)"
      },
      {
        "label": "รูฟท็อปบาร์วิววัดอรุณฯ (Sala Rattanakosin, View ARUN)",
        "size": "จุดชมวิวพระอาทิตย์ตกยอดนิยม"
      },
      {
        "label": "วัดโพธิ์ (วัดพระเชตุพนฯ)",
        "size": "เดินเพียง 150 เมตรจากหน้าท่าเรือ"
      }
    ],
    "transport": [
      {
        "name": "MRT สนามไชย (ทางออก 1 มิวเซียมสยาม)",
        "dist": "350 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "วัดโพธิ์ (พระนอนองค์ใหญ่)",
        "kind": "Temple",
        "color": "#059669",
        "lat": 13.7465,
        "lon": 100.4933,
        "dist": "150 m"
      },
      {
        "name": "วัดอรุณราชวราราม (ข้ามฟาก)",
        "kind": "Temple",
        "color": "#7C3AED",
        "lat": 13.7437,
        "lon": 100.4888,
        "dist": "นั่งเรือ 3 นาที"
      }
    ]
  },
  {
    "id": "port-paknam",
    "name": "ท่าเรือปากน้ำ สมุทรปราการ (Pak Nam Pier)",
    "category": "ท่าเรือข้ามฟากปากอ่าวไทย เชื่อมพระสมุทรเจดีย์",
    "categoryColor": "#059669",
    "type": "port",
    "brandId": "port",
    "brandName": "เทศบาลนครสมุทรปราการ",
    "badgeType": "brand",
    "badgeBg": "#059669",
    "color": "#059669",
    "image": "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "🚢 เรือข้ามฟากปากน้ำ - พระสมุทรเจดีย์ (฿5.50) & วิวปากอ่าวไทย",
    "district": "เมืองสมุทรปราการ",
    "location": "ถนนประโคนชัย ตำบลปากน้ำ อำเภอเมืองสมุทรปราการ จังหวัดสมุทรปราการ",
    "lat": 13.5975,
    "lon": 100.5955,
    "height": 25,
    "floors": 2,
    "developer": "เทศบาลนครสมุทรปราการ / กรมเจ้าท่า",
    "developerSite": "https://www.samutprakan.go.th/",
    "desc": "ท่าเรือข้ามฟากประวัติศาสตร์บริเวณปากแม่น้ำเจ้าพระยาก่อนไหลลงสู่อ่าวไทย จุดข้ามฟากระหว่างตัวเมืองสมุทรปราการกับฝั่งพระสมุทรเจดีย์ รองรับทั้งผู้โดยสารและรถจักรยานยนต์ ใกล้ตลาดสดปากน้ำแหล่งค้าส่งอาหารทะเลสดจากอ่าวไทย และหอชมเมืองสมุทรปราการ",
    "footprint": [
      [
        100.595,
        13.59714
      ],
      [
        100.596,
        13.59714
      ],
      [
        100.596,
        13.59786
      ],
      [
        100.595,
        13.59786
      ],
      [
        100.595,
        13.59714
      ]
    ],
    "parts": [
      {
        "name": "ท่าเรือปากน้ำ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.59495,
            13.597104
          ],
          [
            100.59605,
            13.597104
          ],
          [
            100.59605,
            13.597896
          ],
          [
            100.59495,
            13.597896
          ],
          [
            100.59495,
            13.597104
          ]
        ]
      },
      {
        "name": "ท่าเรือปากน้ำ Main Structure",
        "color": "#065F46",
        "height": 22,
        "min_height": 8,
        "footprint": [
          [
            100.59512,
            13.597226
          ],
          [
            100.59588,
            13.597226
          ],
          [
            100.59588,
            13.597774
          ],
          [
            100.59512,
            13.597774
          ],
          [
            100.59512,
            13.597226
          ]
        ]
      },
      {
        "name": "ท่าเรือปากน้ำ Crown / Roof",
        "color": "#34D399",
        "height": 25,
        "min_height": 22,
        "footprint": [
          [
            100.59528,
            13.597342
          ],
          [
            100.59572,
            13.597342
          ],
          [
            100.59572,
            13.597658
          ],
          [
            100.59528,
            13.597658
          ],
          [
            100.59528,
            13.597342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "เรือข้ามฟากปากน้ำ - พระสมุทรเจดีย์",
        "size": "คนละ ฿5.50 / รถจักรยานยนต์ ฿10"
      },
      {
        "label": "ตลาดสดปากน้ำ ตลาดอาหารทะเลสด",
        "size": "กุ้ง หอย ปู ปลา สดจากเรือประมงปากอ่าว"
      },
      {
        "label": "หอชมเมืองสมุทรปราการ (Park & Tower)",
        "size": "จุดชมวิวมุมสูง 360 องศาปากอ่าวไทย"
      }
    ],
    "transport": [
      {
        "name": "BTS สถานีปากน้ำ (สายสุขุมวิท E19)",
        "dist": "450 m",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "พระสมุทรเจดีย์ (เจดีย์กลางน้ำเดิม)",
        "kind": "Temple",
        "color": "#F59E0B",
        "lat": 13.5995,
        "lon": 100.584,
        "dist": "ข้ามเรือ 5 นาที"
      }
    ]
  },
  {
    "id": "outer-impact-muangthong",
    "name": "อิมแพ็ค เมืองทองธานี (IMPACT Muang Thong Thani)",
    "category": "ศูนย์แสดงสินค้าและการประชุมใหญ่ที่สุดในประเทศไทย",
    "categoryColor": "#EA580C",
    "type": "outer",
    "brandId": "building",
    "brandName": "IMPACT Exhibition Management",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#EA580C",
    "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · อิมแพ็ค อารีน่า & ชาเลนเจอร์ฮอลล์ (พื้นที่กว่า 140,000 m²)",
    "district": "ปากเกร็ด นนทบุรี",
    "location": "ตำบลบ้านใหม่ อำเภอปากเกร็ด จังหวัดนนทบุรี",
    "lat": 13.9115,
    "lon": 100.5485,
    "height": 45,
    "floors": 4,
    "developer": "บางกอกแลนด์ (Bangkok Land PCL)",
    "developerSite": "https://www.impact.co.th/",
    "desc": "ศูนย์การประชุมและแสดงสินค้าที่ใหญ่ที่สุดในเอเชียตะวันออกเฉียงใต้ ครอบคลุมพื้นที่ใช้สอยกว่า 140,000 ตร.ม. โดดเด่นด้วย IMPACT Challenger ฮอลล์ไร้เสาขนาดใหญ่ที่สุดในโลก, IMPACT Arena สถานที่จัดคอนเสิร์ตศิลปินระดับโลก, ศูนย์แสดงสินค้า Exhibition Center, ทะเลสาบเมืองทองธานี พร้อมส่วนต่อขยายรถไฟฟ้าสายสีชมพูวิ่งตรงเข้าสู่ใจกลางโครงการ",
    "footprint": [
      [
        100.54765,
        13.910888
      ],
      [
        100.54935,
        13.910888
      ],
      [
        100.54935,
        13.912112
      ],
      [
        100.54765,
        13.912112
      ],
      [
        100.54765,
        13.910888
      ]
    ],
    "parts": [
      {
        "name": "อิมแพ็ค เมืองทองธานี Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.54795,
            13.911104
          ],
          [
            100.54905,
            13.911104
          ],
          [
            100.54905,
            13.911896
          ],
          [
            100.54795,
            13.911896
          ],
          [
            100.54795,
            13.911104
          ]
        ]
      },
      {
        "name": "อิมแพ็ค เมืองทองธานี Main Structure",
        "color": "#C2410C",
        "height": 40,
        "min_height": 8,
        "footprint": [
          [
            100.54812,
            13.911226
          ],
          [
            100.54888,
            13.911226
          ],
          [
            100.54888,
            13.911774
          ],
          [
            100.54812,
            13.911774
          ],
          [
            100.54812,
            13.911226
          ]
        ]
      },
      {
        "name": "อิมแพ็ค เมืองทองธานี Crown / Roof",
        "color": "#FB923C",
        "height": 45,
        "min_height": 40,
        "footprint": [
          [
            100.54828,
            13.911342
          ],
          [
            100.54872,
            13.911342
          ],
          [
            100.54872,
            13.911658
          ],
          [
            100.54828,
            13.911658
          ],
          [
            100.54828,
            13.911342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "IMPACT Challenger",
        "size": "ฮอลล์ไร้เสา 60,000 m² ไร้เสากั้นสายตา"
      },
      {
        "label": "IMPACT Arena",
        "size": "ความจุ 12,000 ที่นั่ง สำหรับคอนเสิร์ตและกีฬา"
      },
      {
        "label": "IMPACT Forum & Exhibition Centers",
        "size": "ฮอลล์ 1 - 12 จัดงานแฟร์ระดับโลก"
      },
      {
        "label": "รถไฟฟ้าสายสีชมพู ส่วนต่อขยาย",
        "size": "สถานีอิมแพ็ค ชาเลนเจอร์ & ทะเลสาบเมืองทอง"
      }
    ],
    "transport": [
      {
        "name": "MRT สายสีชมพู (สถานีเมืองทองธานี / ส่วนต่อขยาย)",
        "dist": "0 m",
        "type": "mrt"
      },
      {
        "name": "ทางด่วนอุดรรัถยา (ทางด่วนสายบางปะอิน-ปากเกร็ด)",
        "dist": "ทางลงเชื่อมตรงเข้าโครงการ",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "คอสโม บาซาร์ & เอาต์เล็ต สแควร์",
        "kind": "Mall",
        "color": "#3B82F6",
        "lat": 13.9135,
        "lon": 100.544,
        "dist": "300 m"
      }
    ]
  },
  {
    "id": "outer-mega-bangna",
    "name": "เมกาบางนา & อิเกีย (Mega Bangna & IKEA)",
    "category": "ศูนย์การค้าแนวราบใหญ่ที่สุดในเอเชียตะวันออกเฉียงใต้",
    "categoryColor": "#2563EB",
    "type": "outer",
    "brandId": "building",
    "brandName": "Siam Future & Ikano",
    "badgeType": "brand",
    "badgeBg": "#1D4ED8",
    "color": "#1D4ED8",
    "image": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80",
    "rating": 4.9,
    "priceRange": "⭐ 4.9 · แหล่งช็อปปิ้ง 400,000 m² & Mega Park พื้นที่สีเขียว",
    "district": "บางพลี สมุทรปราการ",
    "location": "39 หมู่ที่ 6 ถนนบางนา-ตราด กม.8 ตำบลบางแก้ว อำเภอบางพลี จังหวัดสมุทรปราการ",
    "lat": 13.6465,
    "lon": 100.6805,
    "height": 40,
    "floors": 3,
    "developer": "สยามฟิวเจอร์ ดีเวลอปเมนท์ & อิคาโน่ รีเทล (Ikano)",
    "developerSite": "https://www.mega-bangna.com/",
    "desc": "ศูนย์การค้าแนวราบระดับภูมิภาค (Super Regional Mall) ขนาดใหญ่ที่สุดในเอเชียตะวันออกเฉียงใต้ บนพื้นที่กว่า 400 ไร่ รวมร้านค้ากว่า 900 ร้านค้า มี IKEA Bangna สโตร์เฟอร์นิเจอร์สัญชาติสวีเดนแห่งแรกในไทย โซน Mega FoodWalk ร้านอาหารเปิดโล่งสองชั้น และ Mega Park สวนสาธารณะร่มรื่นกว่า 7 ไร่",
    "footprint": [
      [
        100.67955,
        13.645816
      ],
      [
        100.68145,
        13.645816
      ],
      [
        100.68145,
        13.647184
      ],
      [
        100.67955,
        13.647184
      ],
      [
        100.67955,
        13.645816
      ]
    ],
    "parts": [
      {
        "name": "เมกาบางนา Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.67995,
            13.646104
          ],
          [
            100.68105,
            13.646104
          ],
          [
            100.68105,
            13.646896
          ],
          [
            100.67995,
            13.646896
          ],
          [
            100.67995,
            13.646104
          ]
        ]
      },
      {
        "name": "เมกาบางนา Main Structure",
        "color": "#1E3A8A",
        "height": 35,
        "min_height": 8,
        "footprint": [
          [
            100.68012,
            13.646226
          ],
          [
            100.68088,
            13.646226
          ],
          [
            100.68088,
            13.646774
          ],
          [
            100.68012,
            13.646774
          ],
          [
            100.68012,
            13.646226
          ]
        ]
      },
      {
        "name": "เมกาบางนา Crown / Roof",
        "color": "#60A5FA",
        "height": 40,
        "min_height": 35,
        "footprint": [
          [
            100.68028,
            13.646342
          ],
          [
            100.68072,
            13.646342
          ],
          [
            100.68072,
            13.646658
          ],
          [
            100.68028,
            13.646658
          ],
          [
            100.68028,
            13.646342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "IKEA Bangna (อิเกีย บางนา)",
        "size": "สโตร์เฟอร์นิเจอร์ 43,000 m² พร้อมร้านอาหารสวีดิช"
      },
      {
        "label": "Mega FoodWalk & Stream Walk",
        "size": "ร้านอาหารชั้นนำกว่า 160 ร้านค้าในบรรยากาศธารน้ำ"
      },
      {
        "label": "Mega Park",
        "size": "สวนสาธารณะ 7 ไร่ ลู่วิ่งออกกำลังกาย Pet-Friendly"
      }
    ],
    "transport": [
      {
        "name": "Shuttle Bus ฟรี BTS อุดมสุข - เมกาบางนา",
        "dist": "มีรถรับส่งทุก 15 นาที",
        "type": "bts"
      },
      {
        "name": "ถนนบางนา-ตราด กม.8 & วงแหวนกาญจนาภิเษก",
        "dist": "0 m",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เซ็นทรัล วิลเลจ เอาต์เล็ต",
        "kind": "Outlet",
        "color": "#F59E0B",
        "lat": 13.648,
        "lon": 100.742,
        "dist": "6.5 km"
      }
    ]
  },
  {
    "id": "outer-future-park-rangsit",
    "name": "ฟิวเจอร์พาร์ค & สเปลล์ รังสิต (Future Park & Zpell)",
    "category": "มหาอาณาจักรการค้ารังสิต & ฮับการเดินทางกรุงเทพฯ ตอนเหนือ",
    "categoryColor": "#DC2626",
    "type": "outer",
    "brandId": "building",
    "brandName": "รังสิตพลาซ่า (Rangsit Plaza)",
    "badgeType": "brand",
    "badgeBg": "#B91C1C",
    "color": "#B91C1C",
    "image": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · พื้นที่ค้าปลีกกว่า 600,000 m² & ลานสกีหิมะ Ski365",
    "district": "ธัญบุรี ปทุมธานี",
    "location": "94 ถนนพหลโยธิน ตำบลประชาธิปัตย์ อำเภอธัญบุรี จังหวัดปทุมธานี",
    "lat": 13.9892,
    "lon": 100.6178,
    "height": 45,
    "floors": 5,
    "developer": "บริษัท รังสิตพลาซ่า จำกัด",
    "developerSite": "https://www.futurepark.co.th/",
    "desc": "ศูนย์การค้าที่มีพื้นที่ขนาดใหญ่ที่สุดแห่งหนึ่งในเอเชียตะวันออกเฉียงใต้ (กว่า 600,000 ตร.ม.) แลนด์มาร์กสำคัญแห่งกรุงเทพฯ ตอนเหนือ รวมศูนย์การค้าฟิวเจอร์พาร์ค และ Zpell ศูนย์รวมไลฟ์สไตล์ระดับพรีเมียม สกีในร่ม Ski365 ลานไอซ์สเก็ต และ Future Park Station ฮับสถานีรถตู้โดยสารปรับอากาศเชื่อมต่อสู่ภาคกลาง เหนือ และอีสาน",
    "footprint": [
      [
        100.61685,
        13.988516
      ],
      [
        100.61875,
        13.988516
      ],
      [
        100.61875,
        13.989884
      ],
      [
        100.61685,
        13.989884
      ],
      [
        100.61685,
        13.988516
      ]
    ],
    "parts": [
      {
        "name": "ฟิวเจอร์พาร์ค รังสิต Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.61725,
            13.988804
          ],
          [
            100.61835,
            13.988804
          ],
          [
            100.61835,
            13.989596
          ],
          [
            100.61725,
            13.989596
          ],
          [
            100.61725,
            13.988804
          ]
        ]
      },
      {
        "name": "ฟิวเจอร์พาร์ค รังสิต Main Structure",
        "color": "#991B1B",
        "height": 40,
        "min_height": 8,
        "footprint": [
          [
            100.61742,
            13.988926
          ],
          [
            100.61818,
            13.988926
          ],
          [
            100.61818,
            13.989474
          ],
          [
            100.61742,
            13.989474
          ],
          [
            100.61742,
            13.988926
          ]
        ]
      },
      {
        "name": "ฟิวเจอร์พาร์ค รังสิต Crown / Roof",
        "color": "#F87171",
        "height": 45,
        "min_height": 40,
        "footprint": [
          [
            100.61758,
            13.989042
          ],
          [
            100.61802,
            13.989042
          ],
          [
            100.61802,
            13.989358
          ],
          [
            100.61758,
            13.989358
          ],
          [
            100.61758,
            13.989042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Zpell Lifestyle Shopping Complex",
        "size": "ลักชัวรีแบรนด์ & ร้านอาหารกูร์เมต์"
      },
      {
        "label": "Ski365 & The Rink Ice Arena",
        "size": "ลานสกีหิมะจำลองและลานไอซ์สเก็ตมาตรฐาน"
      },
      {
        "label": "Future Park Station (ฮับรถตู้)",
        "size": "สถานีรถตู้โดยสารกว่า 60 สายเชื่อมทุกภูมิภาค"
      }
    ],
    "transport": [
      {
        "name": "SRT รถไฟฟ้าสายสีแดง สถานีรังสิต",
        "dist": "2.0 km (ต่อสองแถว 5 นาที)",
        "type": "mrt"
      },
      {
        "name": "ถนนพหลโยธิน & ทางยกระดับอุตราภิมุข (ดอนเมืองโทลล์เวย์)",
        "dist": "0 m",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "มหาวิทยาลัยรังสิต",
        "kind": "Education",
        "color": "#EC4899",
        "lat": 13.965,
        "lon": 100.588,
        "dist": "4.0 km"
      },
      {
        "name": "มหาวิทยาลัยกรุงเทพ (รังสิต)",
        "kind": "Education",
        "color": "#8B5CF6",
        "lat": 14.038,
        "lon": 100.614,
        "dist": "5.5 km"
      }
    ]
  },
  {
    "id": "outer-central-westgate",
    "name": "เซ็นทรัล เวสต์เกต & อิเกีย บางใหญ่ (Central Westgate)",
    "category": "ซูเปอร์รีจินัลมอลล์ ประตูสู่ภาคตะวันตก & มอเตอร์เวย์ M81",
    "categoryColor": "#B91C1C",
    "type": "outer",
    "brandId": "building",
    "brandName": "Central Pattana (CPN)",
    "badgeType": "brand",
    "badgeBg": "#991B1B",
    "color": "#991B1B",
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · มอลล์ยักษ์ 500,000 m² & IKEA บางใหญ่",
    "district": "บางใหญ่ นนทบุรี",
    "location": "199, 199/1-2 หมู่ 6 ถนนกาญจนาภิเษก ตำบลเสาธงหิน อำเภอบางใหญ่ จังหวัดนนทบุรี",
    "lat": 13.876,
    "lon": 100.4115,
    "height": 50,
    "floors": 5,
    "developer": "บริษัท เซ็นทรัลพัฒนา จำกัด (มหาชน) - CPN",
    "developerSite": "https://www.centralwestgate.com/",
    "desc": "ซูเปอร์รีจินัลมอลล์ที่ใหญ่ที่สุดของกรุงเทพฯ ฝั่งตะวันตกและจังหวัดนนทบุรี (พื้นที่กว่า 500,000 ตร.ม.) จุดบรรจบของระบบคมนาคมขนาดใหญ่ ทั้งรถไฟฟ้าสายสีม่วง ทางด่วน และจุดเริ่มต้นมอเตอร์เวย์สาย M81 (บางใหญ่-กาญจนบุรี) ภายในมี IKEA บางใหญ่ สโตร์อิเกียขนาดใหญ่ 50,000 ตร.ม. พร้อม Westgate Cineplex และร้านค้าชั้นนำกว่า 500 ร้าน",
    "footprint": [
      [
        100.4106,
        13.875352
      ],
      [
        100.4124,
        13.875352
      ],
      [
        100.4124,
        13.876648
      ],
      [
        100.4106,
        13.876648
      ],
      [
        100.4106,
        13.875352
      ]
    ],
    "parts": [
      {
        "name": "เซ็นทรัล เวสต์เกต Base & Platform",
        "color": "#1E293B",
        "height": 9,
        "min_height": 0,
        "footprint": [
          [
            100.41095,
            13.875604
          ],
          [
            100.41205,
            13.875604
          ],
          [
            100.41205,
            13.876396
          ],
          [
            100.41095,
            13.876396
          ],
          [
            100.41095,
            13.875604
          ]
        ]
      },
      {
        "name": "เซ็นทรัล เวสต์เกต Main Structure",
        "color": "#831843",
        "height": 44,
        "min_height": 9,
        "footprint": [
          [
            100.41112,
            13.875726
          ],
          [
            100.41188,
            13.875726
          ],
          [
            100.41188,
            13.876274
          ],
          [
            100.41112,
            13.876274
          ],
          [
            100.41112,
            13.875726
          ]
        ]
      },
      {
        "name": "เซ็นทรัล เวสต์เกต Crown / Roof",
        "color": "#F472B6",
        "height": 50,
        "min_height": 44,
        "footprint": [
          [
            100.41128,
            13.875842
          ],
          [
            100.41172,
            13.875842
          ],
          [
            100.41172,
            13.876158
          ],
          [
            100.41128,
            13.876158
          ],
          [
            100.41128,
            13.875842
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "IKEA Bang Yai (อิเกีย บางใหญ่)",
        "size": "สโตร์อิเกียขนาดใหญ่ 50,000 m²"
      },
      {
        "label": "Westgate Hall & Event Arena",
        "size": "ฮอลล์จัดนิทรรศการและการประชุมคอนเสิร์ต"
      },
      {
        "label": "Skywalk MRT ตลาดบางใหญ่",
        "size": "สะพานเชื่อมปรับอากาศเข้าตัวห้างชั้น 2 (0 ม.)"
      }
    ],
    "transport": [
      {
        "name": "MRT ตลาดบางใหญ่ (สายสีม่วง PP02)",
        "dist": "0 m (ทางเชื่อม Skywalk)",
        "type": "mrt"
      },
      {
        "name": "มอเตอร์เวย์สาย M81 (บางใหญ่ - กาญจนบุรี)",
        "dist": "จุดเริ่มต้นด่านเก็บเงิน",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ตลาดบางใหญ่ & บางใหญ่ไนท์พลาซ่า",
        "kind": "Market",
        "color": "#10B981",
        "lat": 13.878,
        "lon": 100.41,
        "dist": "200 m"
      }
    ]
  },
  {
    "id": "outer-ancient-city",
    "name": "เมืองโบราณ สมุทรปราการ (The Ancient City)",
    "category": "พิพิธภัณฑ์กลางแจ้งใหญ่ที่สุดในโลก รูปทรงด้ามขวานสยาม",
    "categoryColor": "#D97706",
    "type": "outer",
    "brandId": "travel",
    "brandName": "เมืองโบราณ กรุ๊ป",
    "badgeType": "brand",
    "badgeBg": "#B45309",
    "color": "#B45309",
    "image": "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · จำลองสถาปัตยกรรม 77 จังหวัด บนพื้นที่กว่า 800 ไร่",
    "district": "เมืองสมุทรปราการ",
    "location": "296/1 หมู่ 7 ถนนสุขุมวิท ตำบลบางปูใหม่ อำเภอเมืองสมุทรปราการ จังหวัดสมุทรปราการ",
    "lat": 13.5395,
    "lon": 100.6235,
    "height": 45,
    "floors": 3,
    "developer": "คุณเล็ก วิริยะพันธุ์ (ผู้สร้างปราสาทสัจธรรม และพิพิธภัณฑ์ช้างเอราวัณ)",
    "developerSite": "https://www.muangboranmuseum.com/",
    "desc": "พิพิธภัณฑ์เอกชนกลางแจ้งที่ใหญ่ที่สุดในโลก ผังพื้นที่ถูกสร้างตามรูปทรงแผนที่ประเทศไทยกว่า 800 ไร่ รวบรวมและจำลองโบราณสถาน สถาปัตยกรรม วัง วิหาร พระพุทธรูป และหมู่บ้านเรือนไทยตามประวัติศาสตร์สยามทุกยุคสมัย เช่น พระที่นั่งสรรเพชญมหาปราสาท เขาพระวิหาร และตลาดโบราณ สามารถขับรถกอล์ฟหรือปั่นจักรยานเที่ยวชมได้ตลอดวัน",
    "footprint": [
      [
        100.62255,
        13.538816
      ],
      [
        100.62445,
        13.538816
      ],
      [
        100.62445,
        13.540184
      ],
      [
        100.62255,
        13.540184
      ],
      [
        100.62255,
        13.538816
      ]
    ],
    "parts": [
      {
        "name": "เมืองโบราณ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.62295,
            13.539104
          ],
          [
            100.62405,
            13.539104
          ],
          [
            100.62405,
            13.539896
          ],
          [
            100.62295,
            13.539896
          ],
          [
            100.62295,
            13.539104
          ]
        ]
      },
      {
        "name": "เมืองโบราณ Main Structure",
        "color": "#78350F",
        "height": 40,
        "min_height": 8,
        "footprint": [
          [
            100.62312,
            13.539226
          ],
          [
            100.62388,
            13.539226
          ],
          [
            100.62388,
            13.539774
          ],
          [
            100.62312,
            13.539774
          ],
          [
            100.62312,
            13.539226
          ]
        ]
      },
      {
        "name": "เมืองโบราณ Crown / Roof",
        "color": "#F59E0B",
        "height": 45,
        "min_height": 40,
        "footprint": [
          [
            100.62328,
            13.539342
          ],
          [
            100.62372,
            13.539342
          ],
          [
            100.62372,
            13.539658
          ],
          [
            100.62328,
            13.539658
          ],
          [
            100.62328,
            13.539342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "พระที่นั่งสรรเพชญมหาปราสาทจำลอง",
        "size": "จำลองสถาปัตยกรรมอยุธยาแท้หลังถูกทำลาย"
      },
      {
        "label": "เขาพระวิหาร & ปราสาทหินพนมรุ้ง",
        "size": "สร้างบนภูเขาจำลองสูง 54 เมตร"
      },
      {
        "label": "บริการรถกอล์ฟ & จักรยานเช่า",
        "size": "รถกอล์ฟไฟฟ้า 4-6 ที่นั่ง ขับชมรอบเมืองโบราณ"
      }
    ],
    "transport": [
      {
        "name": "BTS สถานีเคหะฯ (สายสุขุมวิท E23)",
        "dist": "3.5 km (ต่อรถสองแถว 5 นาที)",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "สถานตากอากาศบางปู",
        "kind": "Travel",
        "color": "#0284C7",
        "lat": 13.5185,
        "lon": 100.6558,
        "dist": "4.0 km"
      }
    ]
  },
  {
    "id": "outer-bangpu",
    "name": "สถานตากอากาศบางปู & สะพานสุขตา",
    "category": "จุดชมนกนางนวลอพยพริมอ่าวไทย & ชมพระอาทิตย์ตกทะเล",
    "categoryColor": "#0284C7",
    "type": "outer",
    "brandId": "travel",
    "brandName": "กรมพลาธิการทหารบก",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#0369A1",
    "image": "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · นกนางนวลอพยพกว่า 20,000 ตัว (พ.ย.-เม.ย.) เข้าฟรี",
    "district": "เมืองสมุทรปราการ",
    "location": "164 ถนนสุขุมวิท กม.37 ตำบลบางปูใหม่ อำเภอเมืองสมุทรปราการ จังหวัดสมุทรปราการ",
    "lat": 13.5185,
    "lon": 100.6558,
    "height": 15,
    "floors": 1,
    "developer": "กองทัพบก / กรมพลาธิการทหารบก",
    "developerSite": "https://www.tourismthailand.org/",
    "desc": "สถานที่พักผ่อนตากอากาศริมทะเลอ่าวไทยที่ใกล้กรุงเทพฯ ที่สุด โดดเด่นด้วย 'สะพานสุขตา' สะพานคอนกรีตทอดยาวลงสู่ทะเล 500 เมตร ในช่วงฤดูหนาว (พฤศจิกายน - เมษายน) จะมีฝูงนกนางนวลอพยพหนีความหนาวจากไซบีเรียกว่า 20,000 ตัว มาบินโฉบรับอาหารจากมือนักท่องเที่ยว เป็นจุดชมพระอาทิตย์ตกดินริมทะเลที่โรแมนติกอย่างยิ่ง",
    "footprint": [
      [
        100.65505,
        13.51796
      ],
      [
        100.65655,
        13.51796
      ],
      [
        100.65655,
        13.51904
      ],
      [
        100.65505,
        13.51904
      ],
      [
        100.65505,
        13.51796
      ]
    ],
    "parts": [
      {
        "name": "บางปู Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.65525,
            13.518104
          ],
          [
            100.65635,
            13.518104
          ],
          [
            100.65635,
            13.518896
          ],
          [
            100.65525,
            13.518896
          ],
          [
            100.65525,
            13.518104
          ]
        ]
      },
      {
        "name": "บางปู Main Structure",
        "color": "#0C4A6E",
        "height": 13,
        "min_height": 8,
        "footprint": [
          [
            100.65542,
            13.518226
          ],
          [
            100.65618,
            13.518226
          ],
          [
            100.65618,
            13.518774
          ],
          [
            100.65542,
            13.518774
          ],
          [
            100.65542,
            13.518226
          ]
        ]
      },
      {
        "name": "บางปู Crown / Roof",
        "color": "#38BDF8",
        "height": 15,
        "min_height": 13,
        "footprint": [
          [
            100.65558,
            13.518342
          ],
          [
            100.65602,
            13.518342
          ],
          [
            100.65602,
            13.518658
          ],
          [
            100.65558,
            13.518658
          ],
          [
            100.65558,
            13.518342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "สะพานสุขตา & จุดให้อาหารนกนางนวล",
        "size": "ความยาวสะพาน 500 เมตรสู่ทะเล"
      },
      {
        "label": "ศาลาสุขใจ ร้านอาหารทะเลริมน้ำ",
        "size": "อาหารทะเลสด & ลานเต้นรำลีลาศทุกวันเสาร์"
      },
      {
        "label": "ศูนย์ศึกษาธรรมชาติกองทัพบก (บางปู)",
        "size": "ป่าชายเลนและนกน้ำกว่า 200 ชนิด"
      }
    ],
    "transport": [
      {
        "name": "BTS สถานีเคหะฯ",
        "dist": "7.5 km (ต่อรถสองแถวสาย 36 หน้าสถานี)",
        "type": "bts"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เมืองโบราณ สมุทรปราการ",
        "kind": "Travel",
        "color": "#D97706",
        "lat": 13.5395,
        "lon": 100.6235,
        "dist": "4.0 km"
      }
    ]
  },
  {
    "id": "outer-safari-world",
    "name": "ซาฟารีเวิลด์ กรุงเทพฯ (Safari World)",
    "category": "สวนสัตว์เปิดและมารีนปาร์คที่ใหญ่ที่สุดในประเทศไทย",
    "categoryColor": "#059669",
    "type": "outer",
    "brandId": "travel",
    "brandName": "Safari World PCL",
    "badgeType": "brand",
    "badgeBg": "#047857",
    "color": "#047857",
    "image": "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · ขับรถท่องซาฟารีแอฟริกา & ให้อาหารยีราฟ 200 ตัว",
    "district": "คลองสามวา กรุงเทพฯ",
    "location": "99 ถนนปัญญาอินทรา แขวงสามวาตะวันตก เขตคลองสามวา กรุงเทพฯ",
    "lat": 13.8645,
    "lon": 100.7042,
    "height": 25,
    "floors": 2,
    "developer": "บริษัท ซาฟารีเวิลด์ จำกัด (มหาชน)",
    "developerSite": "https://www.safariworld.com/",
    "desc": "อาณาจักรสวนสัตว์เปิดและธีมปาร์คระดับเวิลด์คลาสบนพื้นที่กว่า 450 ไร่ แบ่งเป็นสองโซนหลัก: ซาฟารีปาร์ค (Safari Park) สวนสัตว์เปิดระยะทาง 8 กิโลเมตร ให้ขับรถส่วนตัวหรือนั่งโค้ชชมฝูงสิงโต เสือ ยีราฟ และม้าลายในถิ่นอาศัยธรรมชาติ และมารีนปาร์ค (Marine Park) ชมโชว์โลมาแสนรู้, สิงโตทะเล, อูรังอุตัง และระเบียงให้อาหารฝูงยีราฟกว่า 200 ตัวอย่างใกล้ชิด",
    "footprint": [
      [
        100.70335,
        13.863888
      ],
      [
        100.70505,
        13.863888
      ],
      [
        100.70505,
        13.865112
      ],
      [
        100.70335,
        13.865112
      ],
      [
        100.70335,
        13.863888
      ]
    ],
    "parts": [
      {
        "name": "ซาฟารีเวิลด์ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.70365,
            13.864104
          ],
          [
            100.70475,
            13.864104
          ],
          [
            100.70475,
            13.864896
          ],
          [
            100.70365,
            13.864896
          ],
          [
            100.70365,
            13.864104
          ]
        ]
      },
      {
        "name": "ซาฟารีเวิลด์ Main Structure",
        "color": "#064E3B",
        "height": 22,
        "min_height": 8,
        "footprint": [
          [
            100.70382,
            13.864226
          ],
          [
            100.70458,
            13.864226
          ],
          [
            100.70458,
            13.864774
          ],
          [
            100.70382,
            13.864774
          ],
          [
            100.70382,
            13.864226
          ]
        ]
      },
      {
        "name": "ซาฟารีเวิลด์ Crown / Roof",
        "color": "#34D399",
        "height": 25,
        "min_height": 22,
        "footprint": [
          [
            100.70398,
            13.864342
          ],
          [
            100.70442,
            13.864342
          ],
          [
            100.70442,
            13.864658
          ],
          [
            100.70398,
            13.864658
          ],
          [
            100.70398,
            13.864342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Safari Park (สวนสัตว์เปิด)",
        "size": "ขับรถชมสัตว์ป่าแอฟริกา ระยะทาง 8 กม."
      },
      {
        "label": "Giraffe Feeding Terrace",
        "size": "ระเบียงป้อนกล้วยฝูงยีราฟกว่า 200 ตัว"
      },
      {
        "label": "Dolphin & Marine Shows",
        "size": "การแสดงโลมาและสิงโตทะเลระดับสากล"
      }
    ],
    "transport": [
      {
        "name": "MRT สายสีชมพู สถานีคู้บอน (PK23)",
        "dist": "6.0 km (ต่อรถแท็กซี่ 10 นาที)",
        "type": "mrt"
      },
      {
        "name": "ถนนรามอินทรา & ถนนปัญญาอินทรา",
        "dist": "0 m",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "สนามกอล์ฟปัญญาอินทรา",
        "kind": "Sport",
        "color": "#10B981",
        "lat": 13.858,
        "lon": 100.688,
        "dist": "1.8 km"
      }
    ]
  },
  {
    "id": "outer-siam-amazing-park",
    "name": "สยามอะเมซิ่งพาร์ค (Siam Amazing Park สวนสยาม)",
    "category": "ทะเลเทียมที่ใหญ่ที่สุดในโลก Guinness World Records",
    "categoryColor": "#0284C7",
    "type": "outer",
    "brandId": "travel",
    "brandName": "อมรพันธ์นคร กรุ๊ป",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#0369A1",
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · ทะเลกรุงเทพฯ สไลเดอร์สายรุ้ง 7 สี & รถไฟเหาะตีลังกา",
    "district": "คันนายาว กรุงเทพฯ",
    "location": "203 ถนนสวนสยาม แขวงคันนายาว เขตคันนายาว กรุงเทพฯ",
    "lat": 13.8055,
    "lon": 100.6935,
    "height": 42,
    "floors": 3,
    "developer": "กลุ่มสยามพาร์คซิตี้ (สวนสยาม ทะเล-กรุงเทพฯ ก่อตั้ง พ.ศ. 2523)",
    "developerSite": "https://www.siamamazingpark.com/",
    "desc": "สวนสนุกและสวนน้ำระดับตำนานของเมืองไทย ครองสถิติทะเลเทียมที่ใหญ่ที่สุดในโลก (Guinness World Records) ด้วยพื้นที่กว่า 13,600 ตร.ม. พร้อมสไลเดอร์สายรุ้ง 7 สีความสูง 54 ฟุต และเครื่องเล่นระดับโลกในโซน Adventure World เช่น Vortex รถไฟเหาะตีลังกาเกลียวสว่าน และ Boomerang รถไฟเหาะถอยหลังตีลังกา",
    "footprint": [
      [
        100.69265,
        13.804888
      ],
      [
        100.69435,
        13.804888
      ],
      [
        100.69435,
        13.806112
      ],
      [
        100.69265,
        13.806112
      ],
      [
        100.69265,
        13.804888
      ]
    ],
    "parts": [
      {
        "name": "สยามอะเมซิ่งพาร์ค Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.69295,
            13.805104
          ],
          [
            100.69405,
            13.805104
          ],
          [
            100.69405,
            13.805896
          ],
          [
            100.69295,
            13.805896
          ],
          [
            100.69295,
            13.805104
          ]
        ]
      },
      {
        "name": "สยามอะเมซิ่งพาร์ค Main Structure",
        "color": "#075985",
        "height": 37,
        "min_height": 8,
        "footprint": [
          [
            100.69312,
            13.805226
          ],
          [
            100.69388,
            13.805226
          ],
          [
            100.69388,
            13.805774
          ],
          [
            100.69312,
            13.805774
          ],
          [
            100.69312,
            13.805226
          ]
        ]
      },
      {
        "name": "สยามอะเมซิ่งพาร์ค Crown / Roof",
        "color": "#38BDF8",
        "height": 42,
        "min_height": 37,
        "footprint": [
          [
            100.69328,
            13.805342
          ],
          [
            100.69372,
            13.805342
          ],
          [
            100.69372,
            13.805658
          ],
          [
            100.69328,
            13.805658
          ],
          [
            100.69328,
            13.805342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ทะเลเทียมใหญ่ที่สุดในโลก (Wave Pool)",
        "size": "พื้นที่ 13,600 m² คลื่นจำลองและหาดทรายขาว"
      },
      {
        "label": "Rainbow Slide (สไลเดอร์สายรุ้ง 7 สี)",
        "size": "สไลเดอร์ความสูง 54 ฟุต"
      },
      {
        "label": "Vortex & Boomerang Coasters",
        "size": "รถไฟเหาะตีลังการะดับโลก"
      }
    ],
    "transport": [
      {
        "name": "MRT สายสีชมพู สถานีนพรัตน์ (PK26)",
        "dist": "1.2 km (ทางออก 2 ต่อรถ 5 นาที)",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "โรงพยาบาลนพรัตนราชธานี",
        "kind": "Health",
        "color": "#10B981",
        "lat": 13.818,
        "lon": 100.689,
        "dist": "1.5 km"
      },
      {
        "name": "แฟชั่นไอส์แลนด์ & เดอะ พรอมานาด",
        "kind": "Mall",
        "color": "#EC4899",
        "lat": 13.826,
        "lon": 100.676,
        "dist": "2.8 km"
      }
    ]
  },
  {
    "id": "outer-klong-lat-mayom",
    "name": "ตลาดน้ำคลองลัดมะยม (Klong Lat Mayom Floating Market)",
    "category": "ตลาดน้ำวิถีชีวิตริมคลองชานเมือง & เรือพายโบราณ",
    "categoryColor": "#15803D",
    "type": "outer",
    "brandId": "travel",
    "brandName": "วิสาหกิจชุมชนคลองลัดมะยม",
    "badgeType": "brand",
    "badgeBg": "#166534",
    "color": "#166534",
    "image": "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · สตรีทฟู้ดริมน้ำ กุ้งเผา ปลาช่อนเผา & ล่องเรือพาย (เข้าฟรี)",
    "district": "ตลิ่งชัน กรุงเทพฯ",
    "location": "ถนนบางระมาด แขวงบางระมาด เขตตลิ่งชัน กรุงเทพฯ",
    "lat": 13.762,
    "lon": 100.4155,
    "height": 18,
    "floors": 2,
    "developer": "ชุมชนคลองลัดมะยม / คุณชวน ชูจันทร์",
    "developerSite": "https://www.tourismthailand.org/",
    "desc": "ตลาดน้ำเชิงอนุรักษ์วิถีชีวิตริมคลองฝั่งธนบุรีชานเมืองกรุงเทพฯ แบ่งออกเป็น 7 โซนเชื่อมต่อด้วยสะพานไม้ข้ามคลอง รวมร้านอาหารไทยพื้นบ้าน อาหารทะเลสด กุ้งเผา ปลาช่อนเผาเกลือ ขนมไทยโบราณ และมีบริการล่องเรือหางยาวและเรือพายชมสวนผลไม้ สวนกล้วยไม้ และวัดเก่าแก่ริมคลอง",
    "footprint": [
      [
        100.41495,
        13.761604
      ],
      [
        100.41605,
        13.761604
      ],
      [
        100.41605,
        13.762396
      ],
      [
        100.41495,
        13.762396
      ],
      [
        100.41495,
        13.761604
      ]
    ],
    "parts": [
      {
        "name": "ตลาดน้ำคลองลัดมะยม Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.41495,
            13.761604
          ],
          [
            100.41605,
            13.761604
          ],
          [
            100.41605,
            13.762396
          ],
          [
            100.41495,
            13.762396
          ],
          [
            100.41495,
            13.761604
          ]
        ]
      },
      {
        "name": "ตลาดน้ำคลองลัดมะยม Main Structure",
        "color": "#14532D",
        "height": 16,
        "min_height": 8,
        "footprint": [
          [
            100.41512,
            13.761726
          ],
          [
            100.41588,
            13.761726
          ],
          [
            100.41588,
            13.762274
          ],
          [
            100.41512,
            13.762274
          ],
          [
            100.41512,
            13.761726
          ]
        ]
      },
      {
        "name": "ตลาดน้ำคลองลัดมะยม Crown / Roof",
        "color": "#4ADE80",
        "height": 18,
        "min_height": 16,
        "footprint": [
          [
            100.41528,
            13.761842
          ],
          [
            100.41572,
            13.761842
          ],
          [
            100.41572,
            13.762158
          ],
          [
            100.41528,
            13.762158
          ],
          [
            100.41528,
            13.761842
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "โซนร้านอาหารริมคลอง 7 โซน",
        "size": "กุ้งแม่น้ำเผา, ปลาช่อนเผา, ผัดไทย, ก๋วยเตี๋ยวเรือ"
      },
      {
        "label": "บริการล่องเรือพายและเรือยนต์",
        "size": "฿20 - ฿100 (ล่องเรือชมวิถีชีวิตสวนผลไม้และวัด)"
      },
      {
        "label": "ตลาดต้นไม้และผลิตภัณฑ์ชุมชน",
        "size": "พืชผักสวนครัวอินทรีย์และหัตถกรรมพื้นบ้าน"
      }
    ],
    "transport": [
      {
        "name": "MRT สถานีบางขุนนนท์ / MRT ไฟฉาย",
        "dist": "6.5 km (ต่อรถสองแถวหรือแท็กซี่ 10 นาที)",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เดอะ เซอร์เคิล ราชพฤกษ์ (The Circle Ratchapruk)",
        "kind": "Mall",
        "color": "#F59E0B",
        "lat": 13.771,
        "lon": 100.444,
        "dist": "3.2 km"
      }
    ]
  },
  {
    "id": "outer-chocolate-ville",
    "name": "ช็อคโกแลต วิลล์ (Chocolate Ville)",
    "category": "หมู่บ้านเทพนิยายยุโรป & ไดน์นิ่งแลนด์มาร์กริมทะเลสาบ",
    "categoryColor": "#7C3AED",
    "type": "outer",
    "brandId": "travel",
    "brandName": "Wine I Love You Group",
    "badgeType": "brand",
    "badgeBg": "#6D28D9",
    "color": "#6D28D9",
    "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · เมืองยุโรป กังหันลมโบราณ & แสงไฟยามค่ำคืน (คูปอง ฿120)",
    "district": "คันนายาว กรุงเทพฯ",
    "location": "351 ถนนประเสริฐมนูกิจ (เกษตร-นวมินทร์ กม.11) แขวงรามอินทรา เขตคันนายาว กรุงเทพฯ",
    "lat": 13.8115,
    "lon": 100.664,
    "height": 30,
    "floors": 3,
    "developer": "Wine I Love You Group",
    "developerSite": "https://www.facebook.com/chocolateville/",
    "desc": "แลนด์มาร์กไดน์นิ่งและถ่ายภาพสไตล์ยุโรปกลางแจ้งที่โด่งดังที่สุดในกรุงเทพฯ ตกแต่งในธีมหมู่บ้านชนบทยุโรปวินเทจ มีกังหันลมฮอลแลนด์ ประภาคารสูง สะพานไม้ริมคลอง บ้านต้นไม้ และเรือกอนโดลา ในช่วงเทศกาลจะประดับไฟนีออนระยิบระยับ มีโชว์ปล่อยหิมะ และโชว์พาเหรดเรือแฟนตาซีบนสายน้ำ",
    "footprint": [
      [
        100.66345,
        13.811104
      ],
      [
        100.66455,
        13.811104
      ],
      [
        100.66455,
        13.811896
      ],
      [
        100.66345,
        13.811896
      ],
      [
        100.66345,
        13.811104
      ]
    ],
    "parts": [
      {
        "name": "ช็อคโกแลต วิลล์ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.66345,
            13.811104
          ],
          [
            100.66455,
            13.811104
          ],
          [
            100.66455,
            13.811896
          ],
          [
            100.66345,
            13.811896
          ],
          [
            100.66345,
            13.811104
          ]
        ]
      },
      {
        "name": "ช็อคโกแลต วิลล์ Main Structure",
        "color": "#4C1D95",
        "height": 26,
        "min_height": 8,
        "footprint": [
          [
            100.66362,
            13.811226
          ],
          [
            100.66438,
            13.811226
          ],
          [
            100.66438,
            13.811774
          ],
          [
            100.66362,
            13.811774
          ],
          [
            100.66362,
            13.811226
          ]
        ]
      },
      {
        "name": "ช็อคโกแลต วิลล์ Crown / Roof",
        "color": "#A78BFA",
        "height": 30,
        "min_height": 26,
        "footprint": [
          [
            100.66378,
            13.811342
          ],
          [
            100.66422,
            13.811342
          ],
          [
            100.66422,
            13.811658
          ],
          [
            100.66378,
            13.811658
          ],
          [
            100.66378,
            13.811342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "บัตรเข้าชม (นำไปแลกอาหาร/ไอศกรีมได้)",
        "size": "฿120 / ท่าน (วันหยุด ฿150)"
      },
      {
        "label": "ร้านอาหารนานาชาติริมทะเลสาบ",
        "size": "ซี่โครงหมูบาร์บีคิว, พิซซ่าเตาถ่าน, ไวน์และเครื่องดื่ม"
      },
      {
        "label": "การแสดง Snow Show & Boat Parade",
        "size": "โชว์หิมะและพาเหรดหมีมาสคอตทุกเย็น"
      }
    ],
    "transport": [
      {
        "name": "MRT สายสีชมพู สถานีคู้บอน / รามอินทรา กม.9",
        "dist": "3.8 km",
        "type": "mrt"
      },
      {
        "name": "ถนนประเสริฐมนูกิจ (เกษตร-นวมินทร์)",
        "dist": "0 m",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "แฟชั่นไอส์แลนด์ (Fashion Island)",
        "kind": "Mall",
        "color": "#EC4899",
        "lat": 13.826,
        "lon": 100.676,
        "dist": "2.5 km"
      }
    ]
  },
  {
    "id": "bangkae-the-mall",
    "name": "เดอะมอลล์ไลฟ์สโตร์ บางแค (The Mall Lifestore Bangkae)",
    "category": "เมกาช็อปปิ้งมอลล์ & ไลฟ์สไตล์เดสติเนชันฝั่งธนฯ",
    "categoryColor": "#DC2626",
    "type": "building",
    "brandId": "building",
    "brandName": "The Mall Group",
    "badgeType": "brand",
    "badgeBg": "#B91C1C",
    "color": "#B91C1C",
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · Skywalk เชื่อมตรง MRT หลักสอง (พื้นที่ 300,000 m²)",
    "district": "บางแค กรุงเทพฯ",
    "location": "518 ถนนเพชรเกษม แขวงบางแคเหนือ เขตบางแค กรุงเทพฯ",
    "lat": 13.7126,
    "lon": 100.4068,
    "height": 52,
    "floors": 5,
    "developer": "เดอะมอลล์ กรุ๊ป (The Mall Group)",
    "developerSite": "https://themalllifestore.themall.co.th/branch/bangkae",
    "desc": "ศูนย์การค้าแลนด์มาร์กที่ใหญ่ที่สุดในย่านบางแค-เพชรเกษม รีโนเวทใหม่หมดจดสู่ 'The Mall Lifestore Bangkae' ผสานธรรมชาติและความทันสมัย มี Gourmet Market ขนาดใหญ่, Mega HarborLand สนามเด็กเล่นในร่ม, โรงภาพยนตร์ SF Cinema, สวนน้ำ Harbor Island Water Park พร้อม Skywalk เชื่อมต่อตรงจากสถานีรถไฟฟ้า MRT หลักสอง เข้าสู่ชั้น M",
    "footprint": [
      [
        100.40595,
        13.711988
      ],
      [
        100.40765,
        13.711988
      ],
      [
        100.40765,
        13.713212
      ],
      [
        100.40595,
        13.713212
      ],
      [
        100.40595,
        13.711988
      ]
    ],
    "parts": [
      {
        "name": "เดอะมอลล์ บางแค Base & Platform",
        "color": "#1E293B",
        "height": 9,
        "min_height": 0,
        "footprint": [
          [
            100.40625,
            13.712204
          ],
          [
            100.40735,
            13.712204
          ],
          [
            100.40735,
            13.712996
          ],
          [
            100.40625,
            13.712996
          ],
          [
            100.40625,
            13.712204
          ]
        ]
      },
      {
        "name": "เดอะมอลล์ บางแค Main Structure",
        "color": "#991B1B",
        "height": 46,
        "min_height": 9,
        "footprint": [
          [
            100.40642,
            13.712326
          ],
          [
            100.40718,
            13.712326
          ],
          [
            100.40718,
            13.712874
          ],
          [
            100.40642,
            13.712874
          ],
          [
            100.40642,
            13.712326
          ]
        ]
      },
      {
        "name": "เดอะมอลล์ บางแค Crown / Roof",
        "color": "#F87171",
        "height": 52,
        "min_height": 46,
        "footprint": [
          [
            100.40658,
            13.712442
          ],
          [
            100.40702,
            13.712442
          ],
          [
            100.40702,
            13.712758
          ],
          [
            100.40658,
            13.712758
          ],
          [
            100.40658,
            13.712442
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Gourmet Market & Dining Garden",
        "size": "ซูเปอร์มาร์เก็ตและร้านอาหารชั้นนำกว่า 200 ร้านค้า"
      },
      {
        "label": "Mega HarborLand Bangkae",
        "size": "สนามเด็กเล่นในร่มมาตรฐานยุโรปใหญ่ที่สุดในฝั่งธนฯ"
      },
      {
        "label": "SF Cinema & Water Park",
        "size": "8 โรงภาพยนตร์ดิจิทัล และสวนน้ำดาดฟ้าลอยฟ้า"
      }
    ],
    "transport": [
      {
        "name": "MRT สถานีหลักสอง (ทางออก 4 เชื่อมตรง Skywalk)",
        "dist": "0 m",
        "type": "mrt"
      },
      {
        "name": "ถนนกาญจนาภิเษก (วงแหวนรอบนอกตะวันตก)",
        "dist": "200 m",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ตลาดบางแค",
        "kind": "Market",
        "color": "#16A34A",
        "lat": 13.7115,
        "lon": 100.4215,
        "dist": "1.4 km"
      }
    ]
  },
  {
    "id": "bangkae-seacon",
    "name": "ซีคอน บางแค (Seacon Bangkae)",
    "category": "ศูนย์การค้า & เอนเตอร์เทนเมนต์คอมเพล็กซ์ครบวงจร",
    "categoryColor": "#0284C7",
    "type": "building",
    "brandId": "building",
    "brandName": "Seacon Development",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#0369A1",
    "image": "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · Mega Harborland, DONKI & ซีคอนฮอลล์ (300,000 m²)",
    "district": "ภาษีเจริญ / บางแค",
    "location": "607 ถนนเพชรเกษม แขวงบางหว้า เขตภาษีเจริญ กรุงเทพฯ (เยื้องบางแค)",
    "lat": 13.7128,
    "lon": 100.4328,
    "height": 48,
    "floors": 5,
    "developer": "บริษัท ซีคอน ดีเวลลอปเมนท์ จำกัด (มหาชน)",
    "developerSite": "https://www.seaconbangkae.com/",
    "desc": "ศูนย์การค้าครบวงจรขนาดใหญ่บนถนนเพชรเกษม รวม Don Don Donki สโตร์ญี่ปุ่นยอดนิยม, Mega HarborLand, โรงภาพยนตร์ Grand EGV, Tops Supermarket, และ Seacon Hall ฮอลล์จัดงานอีเวนต์ คอนเสิร์ต และงานแฟร์ขนาดใหญ่ มีสะพานทางเดิน Skywalk ลอยฟ้าปรับอากาศเชื่อมตรงจาก MRT สถานีภาษีเจริญ",
    "footprint": [
      [
        100.43195,
        13.712188
      ],
      [
        100.43365,
        13.712188
      ],
      [
        100.43365,
        13.713412
      ],
      [
        100.43195,
        13.713412
      ],
      [
        100.43195,
        13.712188
      ]
    ],
    "parts": [
      {
        "name": "ซีคอน บางแค Base & Platform",
        "color": "#1E293B",
        "height": 9,
        "min_height": 0,
        "footprint": [
          [
            100.43225,
            13.712404
          ],
          [
            100.43335,
            13.712404
          ],
          [
            100.43335,
            13.713196
          ],
          [
            100.43225,
            13.713196
          ],
          [
            100.43225,
            13.712404
          ]
        ]
      },
      {
        "name": "ซีคอน บางแค Main Structure",
        "color": "#0F172A",
        "height": 42,
        "min_height": 9,
        "footprint": [
          [
            100.43242,
            13.712526
          ],
          [
            100.43318,
            13.712526
          ],
          [
            100.43318,
            13.713074
          ],
          [
            100.43242,
            13.713074
          ],
          [
            100.43242,
            13.712526
          ]
        ]
      },
      {
        "name": "ซีคอน บางแค Crown / Roof",
        "color": "#38BDF8",
        "height": 48,
        "min_height": 42,
        "footprint": [
          [
            100.43258,
            13.712642
          ],
          [
            100.43302,
            13.712642
          ],
          [
            100.43302,
            13.712958
          ],
          [
            100.43258,
            13.712958
          ],
          [
            100.43258,
            13.712642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "DON DON DONKI Seacon Bangkae",
        "size": "ดองกิสาขาใหญ่แห่งแรกของฝั่งธนบุรี"
      },
      {
        "label": "Mega HarborLand & Yoyo Land",
        "size": "สวนสนุกและสนามเด็กเล่นในร่มชั้น 4"
      },
      {
        "label": "Grand EGV Seacon Bangkae",
        "size": "10 โรงภาพยนตร์มาตรฐานเมเจอร์"
      }
    ],
    "transport": [
      {
        "name": "MRT สถานีภาษีเจริญ (Skywalk เชื่อมตรงเข้าห้าง)",
        "dist": "0 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "โรงพยาบาลเกษมราษฎร์ บางแค",
        "kind": "Health",
        "color": "#10B981",
        "lat": 13.7122,
        "lon": 100.4015,
        "dist": "3.0 km"
      }
    ]
  },
  {
    "id": "bangkae-victoria-gardens",
    "name": "วิคตอเรีย การ์เด้นส์ (Victoria Gardens เพชรเกษม 69)",
    "category": "คอมมูนิตี้มอลล์สไตล์ยุโรป & Foodland 24 ชั่วโมง",
    "categoryColor": "#059669",
    "type": "building",
    "brandId": "building",
    "brandName": "Victoria Gardens",
    "badgeType": "brand",
    "badgeBg": "#059669",
    "color": "#059669",
    "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · ฟู้ดแลนด์ 24 ชม. & แหล่งแฮงก์เอาต์ครอบครัวบางแค",
    "district": "บางแค กรุงเทพฯ",
    "location": "ถนนเพชรเกษม แขวงหลักสอง เขตบางแค กรุงเทพฯ (ปากซอยเพชรเกษม 69)",
    "lat": 13.7092,
    "lon": 100.3785,
    "height": 25,
    "floors": 3,
    "developer": "สินธรณี พร็อพเพอร์ตี้",
    "developerSite": "https://www.victoria-gardens.net/",
    "desc": "คอมมูนิตี้มอลล์เปิดโล่งแห่งแรกบนถนนเพชรเกษม-บางแค ออกแบบด้วยสถาปัตยกรรมสไตล์วิกตอเรียนยุโรปคลาสสิก โดดเด่นด้วยหอนาฬิกาโบราณ สวนน้ำพุ มีซูเปอร์มาร์เก็ต Foodland เปิดตลอด 24 ชั่วโมง พร้อมร้านอาหาร ถูกและดี, Starbucks Drive Thru, สถาบันกวดวิชา และคลินิกสุขภาพความงาม",
    "footprint": [
      [
        100.3779,
        13.708768
      ],
      [
        100.3791,
        13.708768
      ],
      [
        100.3791,
        13.709632
      ],
      [
        100.3779,
        13.709632
      ],
      [
        100.3779,
        13.708768
      ]
    ],
    "parts": [
      {
        "name": "วิคตอเรีย การ์เด้นส์ Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.37795,
            13.708804
          ],
          [
            100.37905,
            13.708804
          ],
          [
            100.37905,
            13.709596
          ],
          [
            100.37795,
            13.709596
          ],
          [
            100.37795,
            13.708804
          ]
        ]
      },
      {
        "name": "วิคตอเรีย การ์เด้นส์ Main Structure",
        "color": "#065F46",
        "height": 22,
        "min_height": 8,
        "footprint": [
          [
            100.37812,
            13.708926
          ],
          [
            100.37888,
            13.708926
          ],
          [
            100.37888,
            13.709474
          ],
          [
            100.37812,
            13.709474
          ],
          [
            100.37812,
            13.708926
          ]
        ]
      },
      {
        "name": "วิคตอเรีย การ์เด้นส์ Crown / Roof",
        "color": "#34D399",
        "height": 25,
        "min_height": 22,
        "footprint": [
          [
            100.37828,
            13.709042
          ],
          [
            100.37872,
            13.709042
          ],
          [
            100.37872,
            13.709358
          ],
          [
            100.37828,
            13.709358
          ],
          [
            100.37828,
            13.709042
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Foodland Supermarket",
        "size": "เปิดบริการ 24 ชั่วโมง พร้อมร้านอาหารถูกและดี"
      },
      {
        "label": "โซนร้านอาหาร & คาเฟ่เอาต์ดอร์",
        "size": "Starbucks Drive-Thru, ชาบู, ขนมหวาน"
      },
      {
        "label": "สถาบันเสริมทักษะและสุขภาพ",
        "size": "Kumon, คลินิกทันตกรรม, ฟิตเนส"
      }
    ],
    "transport": [
      {
        "name": "MRT สถานีหลักสอง",
        "dist": "2.8 km (มีรถเมล์ผ่านทุกสาย)",
        "type": "mrt"
      },
      {
        "name": "ถนนเพชรเกษม ซอย 69 (คลองขวาง)",
        "dist": "0 m",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เดอะมอลล์ไลฟ์สโตร์ บางแค",
        "kind": "Mall",
        "color": "#DC2626",
        "lat": 13.7126,
        "lon": 100.4068,
        "dist": "2.8 km"
      }
    ]
  },
  {
    "id": "bangkae-mrt-laksong",
    "name": "MRT สถานีหลักสอง (Lak Song Station - BL38)",
    "category": "สถานีปลายทาง MRT สายสีน้ำเงิน & อาคารจอดแล้วจร 2 อาคาร",
    "categoryColor": "#0284C7",
    "type": "transit",
    "brandId": "transit",
    "brandName": "MRT สายสีน้ำเงิน (BEM)",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0284C7",
    "image": "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "🚊 BL38 · ชานชาลา 2 ฝั่ง & อาคารจอดแล้วจร 1,000 คัน",
    "district": "บางแค กรุงเทพฯ",
    "location": "ถนนเพชรเกษม หน้าศูนย์การค้าเดอะมอลล์บางแค เขตบางแค กรุงเทพฯ",
    "lat": 13.7118,
    "lon": 100.4072,
    "height": 32,
    "floors": 3,
    "developer": "รฟม. (การรถไฟฟ้าขนส่งมวลชนแห่งประเทศไทย)",
    "developerSite": "https://www.bemplc.co.th/",
    "desc": "สถานีปลายทางฝั่งตะวันตกของรถไฟฟ้ามหานคร สายเฉลิมรัชมงคล (สายสีน้ำเงิน) เชื่อมต่อตรงเข้าสู่เดอะมอลล์ไลฟ์สโตร์ บางแค ด้วย Skywalk ลอยฟ้า โดดเด่นด้วยอาคารจอดแล้วจร (Park and Ride) 2 อาคาร สูง 10 ชั้น และ 8 ชั้น รองรับรถยนต์ได้มากกว่า 1,000 คัน เป็นจุดเปลี่ยนถ่ายการเดินทางที่สำคัญของคนฝั่งธนฯ และพุทธมณฑล",
    "footprint": [
      [
        100.40665,
        13.711404
      ],
      [
        100.40775,
        13.711404
      ],
      [
        100.40775,
        13.712196
      ],
      [
        100.40665,
        13.712196
      ],
      [
        100.40665,
        13.711404
      ]
    ],
    "parts": [
      {
        "name": "MRT หลักสอง Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.40665,
            13.711404
          ],
          [
            100.40775,
            13.711404
          ],
          [
            100.40775,
            13.712196
          ],
          [
            100.40665,
            13.712196
          ],
          [
            100.40665,
            13.711404
          ]
        ]
      },
      {
        "name": "MRT หลักสอง Main Structure",
        "color": "#0369A1",
        "height": 28,
        "min_height": 8,
        "footprint": [
          [
            100.40682,
            13.711526
          ],
          [
            100.40758,
            13.711526
          ],
          [
            100.40758,
            13.712074
          ],
          [
            100.40682,
            13.712074
          ],
          [
            100.40682,
            13.711526
          ]
        ]
      },
      {
        "name": "MRT หลักสอง Crown / Roof",
        "color": "#38BDF8",
        "height": 32,
        "min_height": 28,
        "footprint": [
          [
            100.40698,
            13.711642
          ],
          [
            100.40742,
            13.711642
          ],
          [
            100.40742,
            13.711958
          ],
          [
            100.40698,
            13.711958
          ],
          [
            100.40698,
            13.711642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ชานชาลาชั้น 3 (Platform)",
        "size": "ต้นทางสายสีน้ำเงินมุ่งหน้าหัวลำโพง - บางซื่อ - ท่าพระ"
      },
      {
        "label": "อาคารจอดแล้วจร 2 อาคาร (Park & Ride)",
        "size": "ความจุรวม 1,000 คัน พร้อมทางเดินเชื่อมสถานี"
      },
      {
        "label": "ทางออก 4 (Skywalk เดอะมอลล์)",
        "size": "เชื่อมตรงเข้าชั้น M เดอะมอลล์ บางแค"
      }
    ],
    "transport": [
      {
        "name": "MRT สายสีน้ำเงิน (BL38 หลักสอง)",
        "dist": "0 m",
        "type": "mrt"
      },
      {
        "name": "ถนนเพชรเกษม & วงแหวนกาญจนาภิเษก",
        "dist": "0 m",
        "type": "car"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "เดอะมอลล์ไลฟ์สโตร์ บางแค",
        "kind": "Mall",
        "color": "#DC2626",
        "lat": 13.7126,
        "lon": 100.4068,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "bangkae-mrt-bangkae",
    "name": "MRT สถานีบางแค (Bang Khae Station - BL37)",
    "category": "สถานีใจกลางชุมชนบางแค & ทางออกเชื่อมตลาดบางแค",
    "categoryColor": "#0284C7",
    "type": "transit",
    "brandId": "transit",
    "brandName": "MRT สายสีน้ำเงิน (BEM)",
    "badgeType": "brand",
    "badgeBg": "#0284C7",
    "color": "#0284C7",
    "image": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "🚊 BL37 · ทางออก 2 หน้าตลาดบางแค & ท่าเรือคลองภาษีเจริญ",
    "district": "บางแค กรุงเทพฯ",
    "location": "ถนนเพชรเกษม หน้าตลาดบางแค แขวงบางแค เขตบางแค กรุงเทพฯ",
    "lat": 13.7125,
    "lon": 100.4208,
    "height": 28,
    "floors": 3,
    "developer": "รฟม. & BEM",
    "developerSite": "https://www.bemplc.co.th/",
    "desc": "สถานียกระดับใจกลางย่านการค้าและชุมชนบางแค ตั้งอยู่บนถนนเพชรเกษม หน้าตลาดบางแค ทางออกที่ 2 บันไดเลื่อนลงสู่หน้าทางเข้าตลาดสดบางแค สะดวกสบายในการจับจ่ายซื้อของกินสตรีทฟู้ดและของสด มีทางเดินเท้าเชื่อมต่อไปยังท่าเรือเกษตร-บางแค คลองภาษีเจริญ",
    "footprint": [
      [
        100.4203,
        13.71214
      ],
      [
        100.4213,
        13.71214
      ],
      [
        100.4213,
        13.71286
      ],
      [
        100.4203,
        13.71286
      ],
      [
        100.4203,
        13.71214
      ]
    ],
    "parts": [
      {
        "name": "MRT บางแค Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.42025,
            13.712104
          ],
          [
            100.42135,
            13.712104
          ],
          [
            100.42135,
            13.712896
          ],
          [
            100.42025,
            13.712896
          ],
          [
            100.42025,
            13.712104
          ]
        ]
      },
      {
        "name": "MRT บางแค Main Structure",
        "color": "#0284C7",
        "height": 25,
        "min_height": 8,
        "footprint": [
          [
            100.42042,
            13.712226
          ],
          [
            100.42118,
            13.712226
          ],
          [
            100.42118,
            13.712774
          ],
          [
            100.42042,
            13.712774
          ],
          [
            100.42042,
            13.712226
          ]
        ]
      },
      {
        "name": "MRT บางแค Crown / Roof",
        "color": "#60A5FA",
        "height": 28,
        "min_height": 25,
        "footprint": [
          [
            100.42058,
            13.712342
          ],
          [
            100.42102,
            13.712342
          ],
          [
            100.42102,
            13.712658
          ],
          [
            100.42058,
            13.712658
          ],
          [
            100.42058,
            13.712342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ทางออก 1 (ซอยเพชรเกษม 62/3)",
        "size": "มุ่งหน้าคอนโดและอาคารพาณิชย์"
      },
      {
        "label": "ทางออก 2 (ตลาดบางแค)",
        "size": "ลงสู่หน้าตลาดบางแคและท่าเรือคลองภาษีเจริญ"
      },
      {
        "label": "ทางออก 3-4 (เพชรเกษมขาเข้า)",
        "size": "เชื่อมซอยเพชรเกษม 37 สู่เพชรเกษมพลาซ่า"
      }
    ],
    "transport": [
      {
        "name": "MRT สายสีน้ำเงิน (BL37)",
        "dist": "0 m",
        "type": "mrt"
      },
      {
        "name": "ท่าเรือเกษตร-บางแค (คลองภาษีเจริญ)",
        "dist": "250 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ตลาดบางแค",
        "kind": "Market",
        "color": "#16A34A",
        "lat": 13.7115,
        "lon": 100.4215,
        "dist": "30 m"
      },
      {
        "name": "ร้านข้าวมันไก่นายลิ่มซัง",
        "kind": "Food",
        "color": "#EA580C",
        "lat": 13.712,
        "lon": 100.418,
        "dist": "250 m"
      }
    ]
  },
  {
    "id": "bangkae-bangwa-interchange",
    "name": "BTS / MRT สถานีบางหว้า (Bang Wa Interchange)",
    "category": "ฮับเชื่อมต่อ 3 ระบบ (BTS สายสีลม x MRT สายสีน้ำเงิน x เรือ)",
    "categoryColor": "#16A34A",
    "type": "transit",
    "brandId": "transit",
    "brandName": "BTS สีลม & MRT สีน้ำเงิน",
    "badgeType": "brand",
    "badgeBg": "#15803D",
    "color": "#15803D",
    "image": "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "🚊 S12 / BL34 · ฮับเชื่อมต่อใหญ่ที่สุดของฝั่งธนฯ",
    "district": "ภาษีเจริญ กรุงเทพฯ (ประตูสู่บางแค)",
    "location": "สี่แยกเพชรเกษม-ราชพฤกษ์ แขวงปากคลองภาษีเจริญ เขตภาษีเจริญ กรุงเทพฯ",
    "lat": 13.7208,
    "lon": 100.4578,
    "height": 36,
    "floors": 4,
    "developer": "BTS & BEM & กทม.",
    "developerSite": "https://www.bts.co.th/",
    "desc": "ชุมทางการเดินทางที่สำคัญที่สุดของฝั่งธนบุรี จุดตัดข้ามระบบระหว่าง BTS สถานีบางหว้า (สถานีปลายทางสายสีลม) และ MRT สถานีบางหว้า (สายสีน้ำเงิน) เชื่อมต่อด้วย Skywalk ลอยฟ้าขนาดใหญ่ และมีทางเดินลงสู่ 'ท่าเรือบางหว้า' จุดเริ่มต้นเรือโดยสารคลองภาษีเจริญ มุ่งหน้าสู่เพชรเกษม-บางแค",
    "footprint": [
      [
        100.4572,
        13.720368
      ],
      [
        100.4584,
        13.720368
      ],
      [
        100.4584,
        13.721232
      ],
      [
        100.4572,
        13.721232
      ],
      [
        100.4572,
        13.720368
      ]
    ],
    "parts": [
      {
        "name": "บางหว้า Interchange Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.45725,
            13.720404
          ],
          [
            100.45835,
            13.720404
          ],
          [
            100.45835,
            13.721196
          ],
          [
            100.45725,
            13.721196
          ],
          [
            100.45725,
            13.720404
          ]
        ]
      },
      {
        "name": "บางหว้า Interchange Main Structure",
        "color": "#15803D",
        "height": 32,
        "min_height": 8,
        "footprint": [
          [
            100.45742,
            13.720526
          ],
          [
            100.45818,
            13.720526
          ],
          [
            100.45818,
            13.721074
          ],
          [
            100.45742,
            13.721074
          ],
          [
            100.45742,
            13.720526
          ]
        ]
      },
      {
        "name": "บางหว้า Interchange Crown / Roof",
        "color": "#4ADE80",
        "height": 36,
        "min_height": 32,
        "footprint": [
          [
            100.45758,
            13.720642
          ],
          [
            100.45802,
            13.720642
          ],
          [
            100.45802,
            13.720958
          ],
          [
            100.45758,
            13.720958
          ],
          [
            100.45758,
            13.720642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "BTS สถานีบางหว้า (S12)",
        "size": "ต้นทางสายสีลมมุ่งหน้าสาทร - สีลม - สยาม (20 นาที)"
      },
      {
        "label": "MRT สถานีบางหว้า (BL34)",
        "size": "สายสีน้ำเงินมุ่งหน้าท่าพระ / บางแค-หลักสอง"
      },
      {
        "label": "ท่าเรือบางหว้า (คลองภาษีเจริญ)",
        "size": "บริการเรือโดยสารไปเพชรเกษม 69"
      }
    ],
    "transport": [
      {
        "name": "BTS สายสีลม (S12)",
        "dist": "0 m",
        "type": "bts"
      },
      {
        "name": "MRT สายสีน้ำเงิน (BL34)",
        "dist": "0 m (Skywalk เชื่อมต่อ)",
        "type": "mrt"
      },
      {
        "name": "ท่าเรือบางหว้า คลองภาษีเจริญ",
        "dist": "80 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "มหาวิทยาลัยสยาม (Siam University)",
        "kind": "Education",
        "color": "#EC4899",
        "lat": 13.719,
        "lon": 100.453,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "bangkae-market",
    "name": "ตลาดบางแค (Bang Khae Market)",
    "category": "ตลาดสดและสตรีทฟู้ดในตำนานที่ใหญ่ที่สุดในฝั่งธนฯ",
    "categoryColor": "#EA580C",
    "type": "travel",
    "brandId": "travel",
    "brandName": "ตลาดสดตำนานฝั่งธนฯ",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#EA580C",
    "image": "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · ของกินสตรีทฟู้ด ผักผลไม้สด & ค้าส่ง 24 ชั่วโมง",
    "district": "บางแค กรุงเทพฯ",
    "location": "ซอยเพชรเกษม 66/1 ถนนเพชรเกษม แขวงบางแค เขตบางแค กรุงเทพฯ",
    "lat": 13.7115,
    "lon": 100.4215,
    "height": 18,
    "floors": 2,
    "developer": "ตลาดบางแค (เปิดบริการมานานกว่า 60 ปี)",
    "developerSite": "https://www.tourismthailand.org/",
    "desc": "ตลาดสดและแหล่งของกินที่ใหญ่และคึกคักที่สุดในย่านฝั่งธนบุรี เปิดบริการทั้งกลางวันและกลางคืน มีทั้งโซนตลาดสดขายส่งผัก ผลไม้ อาหารทะเล และโซนสตรีทฟู้ดขึ้นชื่อ ข้าวเหนียวมูนมะม่วง กวยจั๊บน้ำใส ก๋วยเตี๋ยวต้มยำโบราณ ขนมหวานไทย และหมูสะเต๊ะรสเด็ด หน้าตลาดติดสถานีรถไฟฟ้า MRT บางแค",
    "footprint": [
      [
        100.42085,
        13.711032
      ],
      [
        100.42215,
        13.711032
      ],
      [
        100.42215,
        13.711968
      ],
      [
        100.42085,
        13.711968
      ],
      [
        100.42085,
        13.711032
      ]
    ],
    "parts": [
      {
        "name": "ตลาดบางแค Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.42095,
            13.711104
          ],
          [
            100.42205,
            13.711104
          ],
          [
            100.42205,
            13.711896
          ],
          [
            100.42095,
            13.711896
          ],
          [
            100.42095,
            13.711104
          ]
        ]
      },
      {
        "name": "ตลาดบางแค Main Structure",
        "color": "#C2410C",
        "height": 16,
        "min_height": 8,
        "footprint": [
          [
            100.42112,
            13.711226
          ],
          [
            100.42188,
            13.711226
          ],
          [
            100.42188,
            13.711774
          ],
          [
            100.42112,
            13.711774
          ],
          [
            100.42112,
            13.711226
          ]
        ]
      },
      {
        "name": "ตลาดบางแค Crown / Roof",
        "color": "#FB923C",
        "height": 18,
        "min_height": 16,
        "footprint": [
          [
            100.42128,
            13.711342
          ],
          [
            100.42172,
            13.711342
          ],
          [
            100.42172,
            13.711658
          ],
          [
            100.42128,
            13.711658
          ],
          [
            100.42128,
            13.711342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "โซนสตรีทฟู้ด & ขนมไทยโบราณ",
        "size": "เปิดตั้งแต่เช้ามืดถึงดึก ข้าวเหนียวมูน, น้ำเต้าหู้, หมูปิ้ง"
      },
      {
        "label": "โซนตลาดสดค้าส่ง 24 ชม.",
        "size": "ผักสด ผลไม้ตามฤดูกาล ซีฟู้ดส่งตรงจากมหาชัย"
      },
      {
        "label": "เพชรเกษมพลาซ่า",
        "size": "เสื้อผ้าแฟชั่นและของใช้เบ็ดเตล็ด"
      }
    ],
    "transport": [
      {
        "name": "MRT สถานีบางแค (ทางออก 2 โผล่หน้าตลาด)",
        "dist": "20 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "วัดนิมมานรดี",
        "kind": "Temple",
        "color": "#F59E0B",
        "lat": 13.7085,
        "lon": 100.423,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "bangkae-wat-nimmanoradee",
    "name": "วัดนิมมานรดี & ตลาดน้ำวัดนิมมานรดี",
    "category": "พระอารามหลวงรัตนโกสินทร์ & วิถีชีวิตริมคลองภาษีเจริญ",
    "categoryColor": "#F59E0B",
    "type": "travel",
    "brandId": "travel",
    "brandName": "พระอารามหลวงชั้นตรี",
    "badgeType": "brand",
    "badgeBg": "#D97706",
    "color": "#D97706",
    "image": "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · หลวงพ่อเกศจำปาศรี & ตลาดน้ำเรือนไม้โบราณ (เข้าฟรี)",
    "district": "ภาษีเจริญ / บางแค",
    "location": "32 หมู่ 5 ซอยเพชรเกษม 39 แขวงบางหว้า ริมคลองภาษีเจริญ กรุงเทพฯ",
    "lat": 13.7085,
    "lon": 100.423,
    "height": 35,
    "floors": 2,
    "developer": "พระอารามหลวง (สร้างขึ้นในสมัยต้นกรุงรัตนโกสินทร์ พ.ศ. 2350)",
    "developerSite": "https://www.watnimmanoradee.org/",
    "desc": "วัดโบราณริมคลองภาษีเจริญสร้างขึ้นในสมัยรัชกาลที่ ๑ ประดิษฐาน 'หลวงพ่อเกศจำปาศรี' พระพุทธรูปทองสำริดปางมารวิชัยศิลปะอู่ทองที่ชาวบางแคเคารพศรัทธา ด้านหน้าวัดริมคลองเป็นที่ตั้งของ 'ตลาดน้ำวัดนิมมานรดี' ตลาดโบราณเรือนแถวไม้ริมน้ำยาวกว่า 100 เมตร สัมผัสวิถีชีวิตชาวสวนคลองภาษีเจริญและขนมโบราณ",
    "footprint": [
      [
        100.4224,
        13.708068
      ],
      [
        100.4236,
        13.708068
      ],
      [
        100.4236,
        13.708932
      ],
      [
        100.4224,
        13.708932
      ],
      [
        100.4224,
        13.708068
      ]
    ],
    "parts": [
      {
        "name": "วัดนิมมานรดี Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.42245,
            13.708104
          ],
          [
            100.42355,
            13.708104
          ],
          [
            100.42355,
            13.708896
          ],
          [
            100.42245,
            13.708896
          ],
          [
            100.42245,
            13.708104
          ]
        ]
      },
      {
        "name": "วัดนิมมานรดี Main Structure",
        "color": "#B45309",
        "height": 31,
        "min_height": 8,
        "footprint": [
          [
            100.42262,
            13.708226
          ],
          [
            100.42338,
            13.708226
          ],
          [
            100.42338,
            13.708774
          ],
          [
            100.42262,
            13.708774
          ],
          [
            100.42262,
            13.708226
          ]
        ]
      },
      {
        "name": "วัดนิมมานรดี Crown / Roof",
        "color": "#FDE047",
        "height": 35,
        "min_height": 31,
        "footprint": [
          [
            100.42278,
            13.708342
          ],
          [
            100.42322,
            13.708342
          ],
          [
            100.42322,
            13.708658
          ],
          [
            100.42278,
            13.708658
          ],
          [
            100.42278,
            13.708342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "หลวงพ่อเกศจำปาศรี (พระอุโบสถ)",
        "size": "พระพุทธรูปศักดิ์สิทธิ์ประจำวัดอายุกว่า 200 ปี"
      },
      {
        "label": "ตลาดน้ำวัดนิมมานรดี",
        "size": "เรือนแถวไม้โบราณริมคลองภาษีเจริญ ขนมไทย ก๋วยเตี๋ยวเรือ"
      },
      {
        "label": "ท่าเทียบเรือโดยสารคลองภาษีเจริญ",
        "size": "นั่งเรือชมวิถีชีวิตสวนผลไม้และชุมชนริมน้ำ"
      }
    ],
    "transport": [
      {
        "name": "MRT สถานีบางแค",
        "dist": "650 m (เดินลัดผ่านตลาดบางแค)",
        "type": "mrt"
      },
      {
        "name": "ท่าเรือวัดนิมมานรดี (เรือโดยสารคลองภาษีเจริญ)",
        "dist": "0 m",
        "type": "boat"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ตลาดบางแค",
        "kind": "Market",
        "color": "#EA580C",
        "lat": 13.7115,
        "lon": 100.4215,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "food-limsang-bangkae",
    "name": "ข้าวมันไก่นายลิ่มซัง บางแค",
    "category": "ข้าวมันไก่ตอนสูตรลับในตำนาน ขวัญใจคนบางแค",
    "categoryColor": "#EA580C",
    "type": "food",
    "brandId": "food",
    "brandName": "ตำนานบางแค",
    "badgeType": "brand",
    "badgeBg": "#EA580C",
    "color": "#EA580C",
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    "rating": 4.7,
    "priceRange": "⭐ 4.7 · ข้าวมันไก่ตอนเนื้อน่องนุ่มฉ่ำ (฿50–฿120)",
    "district": "บางแค กรุงเทพฯ",
    "location": "ริมถนนเพชรเกษม (ระหว่างเพชรเกษม 64-66) แขวงบางแค เขตบางแค กรุงเทพฯ",
    "lat": 13.712,
    "lon": 100.418,
    "height": 18,
    "floors": 2,
    "developer": "นายลิ่มซัง (สูตรดั้งเดิมกว่า 40 ปี)",
    "developerSite": "https://www.facebook.com/limsangbangkae",
    "desc": "ร้านข้าวมันไก่ระดับตำนานแห่งย่านบางแคที่เปิดขายมานานหลายทศวรรษ ข้าวหุงได้เม็ดสวยหอมมันกระเทียม เนื้อไก่ตอนต้มสุกกำลังดีเนื้อฉ่ำนุ่ม หนังกรุบเด้ง ไม่ตบแบน น้ำจิ้มเต้าเจี้ยวปรุงรสสูตรเด็ดพริกขิงเข้มข้น และน้ำซุปมะนาวดองซดคล่องคอ",
    "footprint": [
      [
        100.41765,
        13.711748
      ],
      [
        100.41835,
        13.711748
      ],
      [
        100.41835,
        13.712252
      ],
      [
        100.41765,
        13.712252
      ],
      [
        100.41765,
        13.711748
      ]
    ],
    "parts": [
      {
        "name": "นายลิ่มซัง บางแค Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.41745,
            13.711604
          ],
          [
            100.41855,
            13.711604
          ],
          [
            100.41855,
            13.712396
          ],
          [
            100.41745,
            13.712396
          ],
          [
            100.41745,
            13.711604
          ]
        ]
      },
      {
        "name": "นายลิ่มซัง บางแค Main Structure",
        "color": "#EA580C",
        "height": 16,
        "min_height": 8,
        "footprint": [
          [
            100.41762,
            13.711726
          ],
          [
            100.41838,
            13.711726
          ],
          [
            100.41838,
            13.712274
          ],
          [
            100.41762,
            13.712274
          ],
          [
            100.41762,
            13.711726
          ]
        ]
      },
      {
        "name": "นายลิ่มซัง บางแค Crown / Roof",
        "color": "#F59E0B",
        "height": 18,
        "min_height": 16,
        "footprint": [
          [
            100.41778,
            13.711842
          ],
          [
            100.41822,
            13.711842
          ],
          [
            100.41822,
            13.712158
          ],
          [
            100.41778,
            13.712158
          ],
          [
            100.41778,
            13.711842
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ข้าวมันไก่ตอนเนื้อน่องสะโพก",
        "size": "฿50 / ฿60 (เนื้อฉ่ำแน่น)"
      },
      {
        "label": "เนื้อไก่สับจานเดี่ยว (เล็ก/ใหญ่)",
        "size": "฿120 / ฿180"
      },
      {
        "label": "ซุปเป็ดตุ๋นฟักมะนาวดอง",
        "size": "฿60"
      }
    ],
    "transport": [
      {
        "name": "MRT สถานีบางแค (ทางออก 2)",
        "dist": "250 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ตลาดบางแค",
        "kind": "Market",
        "color": "#16A34A",
        "lat": 13.7115,
        "lon": 100.4215,
        "dist": "250 m"
      }
    ]
  },
  {
    "id": "food-chuahaseng-bangkae",
    "name": "ห่านพะโล้ฉั่วฮะเส็ง (เพชรเกษม-บางแค)",
    "category": "ห่านพะโล้สูตรแต้จิ๋วโบราณในตำนานฝั่งธนฯ",
    "categoryColor": "#78350F",
    "type": "food",
    "brandId": "food",
    "brandName": "มิชลิน & ตำนาน 80 ปี",
    "badgeType": "brand",
    "badgeBg": "#78350F",
    "color": "#78350F",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    "rating": 4.8,
    "priceRange": "⭐ 4.8 · ห่านพะโล้เนื้อนุ่มน้ำพะโล้หอมยาจีน (฿180–฿800)",
    "district": "บางแค กรุงเทพฯ",
    "location": "ริมถนนเพชรเกษม แขวงบางหว้า/บางแค เขตภาษีเจริญ กรุงเทพฯ",
    "lat": 13.7135,
    "lon": 100.4285,
    "height": 20,
    "floors": 2,
    "developer": "ฉั่วฮะเส็ง (สืบทอดสูตรพะโล้แต้จิ๋วโบราณตั้งแต่ท่าดินแดง)",
    "developerSite": "https://www.facebook.com/chuahaseng/",
    "desc": "ตำนานห่านพะโล้คู่เมืองหลวงที่สืบทอดสูตรแต้จิ๋วแท้มานานกว่า 80 ปี เนื้อห่านคัดไซส์พิเศษเคี่ยวในน้ำพะโล้เครื่องยาจีนสูตรลับจนเนื้อนุ่มละมุนลิ้น ไร้กลิ่นสาบ หนังบางนุ่ม เครื่องในต้มเปื่อย เลือดห่านนุ่มละลาย ทานคู่น้ำส้มพริกเหลืองดองสูตรเด็ด",
    "footprint": [
      [
        100.42815,
        13.713248
      ],
      [
        100.42885,
        13.713248
      ],
      [
        100.42885,
        13.713752
      ],
      [
        100.42815,
        13.713752
      ],
      [
        100.42815,
        13.713248
      ]
    ],
    "parts": [
      {
        "name": "ฉั่วฮะเส็ง บางแค Base & Platform",
        "color": "#1E293B",
        "height": 8,
        "min_height": 0,
        "footprint": [
          [
            100.42795,
            13.713104
          ],
          [
            100.42905,
            13.713104
          ],
          [
            100.42905,
            13.713896
          ],
          [
            100.42795,
            13.713896
          ],
          [
            100.42795,
            13.713104
          ]
        ]
      },
      {
        "name": "ฉั่วฮะเส็ง บางแค Main Structure",
        "color": "#78350F",
        "height": 18,
        "min_height": 8,
        "footprint": [
          [
            100.42812,
            13.713226
          ],
          [
            100.42888,
            13.713226
          ],
          [
            100.42888,
            13.713774
          ],
          [
            100.42812,
            13.713774
          ],
          [
            100.42812,
            13.713226
          ]
        ]
      },
      {
        "name": "ฉั่วฮะเส็ง บางแค Crown / Roof",
        "color": "#B45309",
        "height": 20,
        "min_height": 18,
        "footprint": [
          [
            100.42828,
            13.713342
          ],
          [
            100.42872,
            13.713342
          ],
          [
            100.42872,
            13.713658
          ],
          [
            100.42828,
            13.713658
          ],
          [
            100.42828,
            13.713342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "ห่านพะโล้จานเล็ก/จานกลาง",
        "size": "฿180 / ฿350"
      },
      {
        "label": "ห่านพะโล้ครึ่งตัว/ทั้งตัว",
        "size": "฿450 / ฿850"
      },
      {
        "label": "แกงจืดเกี้ยมฉ่ายกระดูกหมูอ่อน",
        "size": "฿80"
      }
    ],
    "transport": [
      {
        "name": "MRT สถานีภาษีเจริญ",
        "dist": "450 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ซีคอน บางแค",
        "kind": "Mall",
        "color": "#0284C7",
        "lat": 13.7128,
        "lon": 100.4328,
        "dist": "450 m"
      }
    ]
  },
  {
    "id": "condo-parkland-phetkasem56",
    "name": "เดอะ พาร์คแลนด์ เพชรเกษม 56 (The Parkland)",
    "category": "คอนโดมิเนียม High-Rise วิวเมือง & สวนส่วนกลางยักษ์",
    "categoryColor": "#0284C7",
    "type": "condo",
    "brandId": "other",
    "brandName": "Narai Property",
    "badgeType": "brand",
    "badgeBg": "#0369A1",
    "color": "#0369A1",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "priceRange": "฿2.3M - ฿5.5M (MRT ภาษีเจริญ 40 ม.)",
    "district": "ภาษีเจริญ/บางแค",
    "location": "ถนนเพชรเกษม แขวงบางหว้า กรุงเทพฯ (ตรงข้ามซีคอน บางแค)",
    "lat": 13.7138,
    "lon": 100.432,
    "height": 105,
    "floors": 32,
    "units": 2047,
    "unitsPerFloor": 24,
    "parking": 1024,
    "parkingRatio": "50%",
    "landRai": 13.3,
    "facilitiesM2": 5000,
    "developer": "บริษัท นารายณ์พร็อพเพอตี้ จำกัด",
    "developerSite": "https://www.naraiproperty.com/",
    "desc": "โครงการคอนโดมิเนียม High-Rise 3 อาคาร (ทาวเวอร์ A 32 ชั้น, ทาวเวอร์ B 31 ชั้น, ทาวเวอร์ C 29 ชั้น) บนเนื้อที่ใหญ่กว่า 13 ไร่ โดดเด่นด้วยสวนส่วนกลางขนาดใหญ่กว่า 3 ไร่ สระว่ายน้ำระบบเกลือ 2 สระ ฟิตเนส 2 ชั้น ซาวน่า เว็กซี่การ์เด้น และทางเชื่อมตรงเข้าสู่ MRT สถานีภาษีเจริญ และซีคอน บางแค",
    "footprint": [
      [
        100.43135,
        13.713332
      ],
      [
        100.43265,
        13.713332
      ],
      [
        100.43265,
        13.714268
      ],
      [
        100.43135,
        13.714268
      ],
      [
        100.43135,
        13.713332
      ]
    ],
    "parts": [
      {
        "name": "The Parkland 56 Base & Platform",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.43145,
            13.713404
          ],
          [
            100.43255,
            13.713404
          ],
          [
            100.43255,
            13.714196
          ],
          [
            100.43145,
            13.714196
          ],
          [
            100.43145,
            13.713404
          ]
        ]
      },
      {
        "name": "The Parkland 56 Main Structure",
        "color": "#1E3A8A",
        "height": 92,
        "min_height": 18,
        "footprint": [
          [
            100.43162,
            13.713526
          ],
          [
            100.43238,
            13.713526
          ],
          [
            100.43238,
            13.714074
          ],
          [
            100.43162,
            13.714074
          ],
          [
            100.43162,
            13.713526
          ]
        ]
      },
      {
        "name": "The Parkland 56 Crown / Roof",
        "color": "#60A5FA",
        "height": 105,
        "min_height": 92,
        "footprint": [
          [
            100.43178,
            13.713642
          ],
          [
            100.43222,
            13.713642
          ],
          [
            100.43222,
            13.713958
          ],
          [
            100.43178,
            13.713958
          ],
          [
            100.43178,
            13.713642
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "Studio",
        "size": "25.0 – 25.5 m²"
      },
      {
        "label": "1 Bedroom",
        "size": "26.5 – 37.5 m²"
      },
      {
        "label": "2 Bedroom",
        "size": "48.5 – 62.0 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT ภาษีเจริญ",
        "dist": "40 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ซีคอน บางแค (ตรงข้ามโครงการ)",
        "kind": "Mall",
        "color": "#0284C7",
        "lat": 13.7128,
        "lon": 100.4328,
        "dist": "50 m"
      }
    ]
  },
  {
    "id": "condo-base-phetkasem",
    "name": "เดอะ เบส เพชรเกษม (THE BASE Phetkasem)",
    "category": "คอนโดมิเนียม High-Rise สไตล์โมเดิร์น & 2 นาทีถึง MRT",
    "categoryColor": "#DC2626",
    "type": "condo",
    "brandId": "sansiri",
    "brandName": "Sansiri (แสนสิริ)",
    "badgeType": "brand",
    "badgeLetter": "S",
    "badgeBg": "#DC2626",
    "color": "#DC2626",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "priceRange": "฿2.2M - ฿4.8M (MRT เพชรเกษม 48 120 ม.)",
    "district": "ภาษีเจริญ/บางแค",
    "location": "ซอยเพชรเกษม 48 ถนนเพชรเกษม แขวงบางหว้า เขตภาษีเจริญ กรุงเทพฯ",
    "lat": 13.7145,
    "lon": 100.443,
    "height": 98,
    "floors": 30,
    "units": 640,
    "unitsPerFloor": 22,
    "parking": 236,
    "parkingRatio": "37%",
    "landRai": 3.2,
    "facilitiesM2": 2400,
    "developer": "แสนสิริ (Sansiri PCL)",
    "developerSite": "https://www.sansiri.com/condominium/thebase-phetkasem/",
    "desc": "คอนโดมิเนียม High-Rise 30 ชั้น ภายใต้แบรนด์ THE BASE จากแสนสิริ บนถนนเพชรเกษม ห่างจากสถานีรถไฟฟ้า MRT เพชรเกษม 48 เพียง 120 เมตร โดดเด่นด้วยสระว่ายน้ำ Panorama View ยาว 40 เมตร, ฟิตเนส 2 ชั้น 270 องศา, Sky Lounge, สวนส่วนกลางริมคลองภาษีเจริญ และมีเรือ Shuttle Boat บริการ",
    "footprint": [
      [
        100.44245,
        13.714104
      ],
      [
        100.44355,
        13.714104
      ],
      [
        100.44355,
        13.714896
      ],
      [
        100.44245,
        13.714896
      ],
      [
        100.44245,
        13.714104
      ]
    ],
    "parts": [
      {
        "name": "THE BASE เพชรเกษม Base & Platform",
        "color": "#1E293B",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [
            100.44245,
            13.714104
          ],
          [
            100.44355,
            13.714104
          ],
          [
            100.44355,
            13.714896
          ],
          [
            100.44245,
            13.714896
          ],
          [
            100.44245,
            13.714104
          ]
        ]
      },
      {
        "name": "THE BASE เพชรเกษม Main Structure",
        "color": "#991B1B",
        "height": 86,
        "min_height": 18,
        "footprint": [
          [
            100.44262,
            13.714226
          ],
          [
            100.44338,
            13.714226
          ],
          [
            100.44338,
            13.714774
          ],
          [
            100.44262,
            13.714774
          ],
          [
            100.44262,
            13.714226
          ]
        ]
      },
      {
        "name": "THE BASE เพชรเกษม Crown / Roof",
        "color": "#F87171",
        "height": 98,
        "min_height": 86,
        "footprint": [
          [
            100.44278,
            13.714342
          ],
          [
            100.44322,
            13.714342
          ],
          [
            100.44322,
            13.714658
          ],
          [
            100.44278,
            13.714658
          ],
          [
            100.44278,
            13.714342
          ]
        ]
      }
    ],
    "unitTypes": [
      {
        "label": "1 Bedroom",
        "size": "23.0 – 32.5 m²"
      },
      {
        "label": "2 Bedroom",
        "size": "44.0 – 52.2 m²"
      }
    ],
    "transport": [
      {
        "name": "MRT เพชรเกษม 48",
        "dist": "120 m",
        "type": "mrt"
      }
    ],
    "nearbyPOIs": [
      {
        "name": "ซีคอน บางแค",
        "kind": "Mall",
        "color": "#0284C7",
        "lat": 13.7128,
        "lon": 100.4328,
        "dist": "1.1 km"
      }
    ]
  }
];

  function buildLandmarksGeoJSON() {
    var polygonFeatures = [];
    var pointFeatures = [];

    LANDMARKS.forEach(function(lm) {
      if (lm.parts && lm.parts.length) {
        lm.parts.forEach(function(part, pIdx) {
          polygonFeatures.push({
            type: "Feature",
            id: lm.id + "-part-" + pIdx,
            properties: {
              id: lm.id,
              name: lm.name,
              category: lm.category,
              categoryColor: lm.categoryColor,
              type: lm.type || "condo",
              brandId: lm.brandId || "other",
              brandName: lm.brandName || lm.developer,
              partName: part.name || lm.name,
              color: part.color || lm.color,
              height: part.height !== undefined ? part.height : lm.height,
              min_height: part.min_height || 0
            },
            geometry: {
              type: "Polygon",
              coordinates: [part.footprint]
            }
          });
        });
      } else if (lm.footprint) {
        polygonFeatures.push({
          type: "Feature",
          id: lm.id,
          properties: {
            id: lm.id,
            name: lm.name,
            type: lm.type || "condo",
            brandId: lm.brandId || "other",
            brandName: lm.brandName || lm.developer,
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
            min_height: 0,
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
      }

      pointFeatures.push({
        type: "Feature",
        id: lm.id + "-pt",
        properties: {
          id: lm.id,
          name: lm.name,
          type: lm.type || "condo",
          category: lm.category,
          categoryColor: lm.categoryColor,
          brandId: lm.brandId || "other",
          brandName: lm.brandName || lm.developer,
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
