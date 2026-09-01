/**
 * bkk-landmarks-data.js
 * ข้อมูลแลนด์มาร์ก เมกะโปรเจกต์ และคอนโดมิเนียมระดับลักชัวรีทั่วกรุงเทพฯ (Bangkok Real Estate & Project Intelligence)
 * รองรับโมเดล 3D แยกชิ้นส่วนสถาปัตยกรรม (Multi-part Tiered 3D) และโลโก้แบรนด์ผู้พัฒนา (Developer Brand Badges)
 */
(function(root) {
  "use strict";

  var LANDMARKS = [
  {
    "id": "romm-convent",
    "name": "ROMM CONVENT",
    "brandId": "proud",
    "brandName": "PROUD REAL ESTATE",
    "category": "Condominium",
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
    "location": "Bangkok (Soi Convent, Silom-Sathorn)",
    "lat": 13.72438,
    "lon": 100.53435,
    "desc": "คอนโดมิเนียมระดับลักชัวรีใจกลางซอยคอนแวนต์ เชื่อมต่อถนนสีลมและสาทร โดดเด่นด้วยแนวคิด Live. Well. Life พัฒนาร่วมกับ รพ. BNH และ The Aspen Tree เพื่อการอยู่อาศัยที่ส่งเสริมสุขภาพอย่างสมบูรณ์แบบ",
    "footprint": [
      [100.53426, 13.72420],
      [100.53455, 13.72433],
      [100.53444, 13.72456],
      [100.53415, 13.72443],
      [100.53426, 13.72420]
    ],
    "parts": [
      {
        "name": "Lobby & Wellness Courtyard Podium",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [100.5340, 13.7240],
          [100.5347, 13.7240],
          [100.5347, 13.7247],
          [100.5340, 13.7247],
          [100.5340, 13.7240]
        ]
      },
      {
        "name": "Main Residential Tower (Fl 6-28)",
        "color": "#243B55",
        "height": 118,
        "min_height": 22,
        "footprint": [
          [100.53415, 13.72415],
          [100.53455, 13.72415],
          [100.53455, 13.72455],
          [100.53415, 13.72455],
          [100.53415, 13.72415]
        ]
      },
      {
        "name": "Rooftop Sky Wellness & Penthouse Crown (Fl 29-32)",
        "color": "#D48344",
        "height": 135,
        "min_height": 118,
        "footprint": [
          [100.53422, 13.72422],
          [100.53448, 13.72422],
          [100.53448, 13.72448],
          [100.53422, 13.72448],
          [100.53422, 13.72422]
        ]
      }
    ],
    "unitTypes": [
      { "label": "1 Bedroom Deluxe", "size": "34.50 – 51.50 m²" },
      { "label": "2 Bedrooms", "size": "96.95 m²" },
      { "label": "2 Bedrooms Plus", "size": "118.00 m²" },
      { "label": "3 Bedrooms & Penthouse", "size": "147.00 – 468.00 m²" }
    ],
    "transport": [
      { "name": "BTS Sala Daeng (S2)", "dist": "500 m", "type": "bts" },
      { "name": "MRT Silom (BL26)", "dist": "550 m", "type": "mrt" },
      { "name": "BTS Chong Nonsi (S3)", "dist": "650 m", "type": "bts" }
    ],
    "nearbyPOIs": [
      { "name": "BNH Hospital", "kind": "Hospital", "color": "#DC2626", "lat": 13.7238, "lon": 100.5350, "dist": "50 m" },
      { "name": "Silom Complex", "kind": "Shopping", "color": "#059669", "lat": 13.7285, "lon": 100.5345, "dist": "450 m" }
    ]
  },
  {
    "id": "ashton-silom",
    "name": "Ashton Silom",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "Super Luxury Condominium",
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
    "location": "Silom Road (Near Silom Soi 12), Bang Rak",
    "lat": 13.7248,
    "lon": 100.5268,
    "desc": "คอนโดมิเนียม Super Luxury ดีไซน์โดดเด่นติดถนนสีลม สูง 48 ชั้น สถาปัตยกรรมแบบ Neo Industrial และ Alfresco Living พื้นที่ส่วนกลางสระว่ายน้ำลอยฟ้า Cloud Pool วิวโค้งแม่น้ำและมหานคร",
    "footprint": [
      [100.5264, 13.7244],
      [100.5272, 13.7244],
      [100.5272, 13.7252],
      [100.5264, 13.7252],
      [100.5264, 13.7244]
    ],
    "parts": [
      {
        "name": "Ashton Podium & Garden Lobby",
        "color": "#0F172A",
        "height": 28,
        "min_height": 0,
        "footprint": [
          [100.5263, 13.7243],
          [100.5273, 13.7243],
          [100.5273, 13.7253],
          [100.5263, 13.7253],
          [100.5263, 13.7243]
        ]
      },
      {
        "name": "Main Skyscraper Tower (Fl 8-44)",
        "color": "#0284C7",
        "height": 155,
        "min_height": 28,
        "footprint": [
          [100.5265, 13.7245],
          [100.5271, 13.7245],
          [100.5271, 13.7251],
          [100.5265, 13.7251],
          [100.5265, 13.7245]
        ]
      },
      {
        "name": "Cloud Pool & Sky Lounge Crown (Fl 45-48)",
        "color": "#38BDF8",
        "height": 180,
        "min_height": 155,
        "footprint": [
          [100.5266, 13.7246],
          [100.5270, 13.7246],
          [100.5270, 13.7250],
          [100.5266, 13.7250],
          [100.5266, 13.7246]
        ]
      }
    ],
    "unitTypes": [
      { "label": "1 Bedroom", "size": "31.00 – 49.50 m²" },
      { "label": "2 Bedrooms", "size": "71.50 – 86.50 m²" }
    ],
    "transport": [
      { "name": "BTS ช่องนนทรี (S3)", "dist": "350 m", "type": "bts" },
      { "name": "MRT สีลม (BL26)", "dist": "1.1 km", "type": "mrt" }
    ],
    "nearbyPOIs": [
      { "name": "Mahanakhon CUBE", "kind": "Dining", "color": "#D97706", "lat": 13.7239, "lon": 100.5286, "dist": "300 m" }
    ]
  },
  {
    "id": "ashton-chula-silom",
    "name": "Ashton Chula-Silom",
    "brandId": "ananda",
    "brandName": "Ananda Development",
    "category": "Luxury High-Rise Condominium",
    "categoryColor": "#0284C7",
    "developer": "Ananda Development",
    "developerSite": "https://www.ananda.co.th/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
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
    "location": "Rama IV Road (Sam Yan Intersection)",
    "lat": 13.7312,
    "lon": 100.5305,
    "desc": "ไอคอนิกคอนโดมิเนียมสูง 56 ชั้น ทำเลศักยภาพหัวมุมถนนพระราม 4 และพญาไท ตรงข้ามจามจุรีสแควร์และสามย่านมิตรทาวน์ โดดเด่นด้วยสระว่ายน้ำโอลิมปิกลอยฟ้าวิวพาโนรามา",
    "footprint": [
      [100.5298, 13.7306],
      [100.5312, 13.7306],
      [100.5312, 13.7318],
      [100.5298, 13.7318],
      [100.5298, 13.7306]
    ],
    "parts": [
      {
        "name": "Sam Yan Commercial Podium",
        "color": "#0F172A",
        "height": 32,
        "min_height": 0,
        "footprint": [
          [100.5298, 13.7306],
          [100.5312, 13.7306],
          [100.5312, 13.7318],
          [100.5298, 13.7318],
          [100.5298, 13.7306]
        ]
      },
      {
        "name": "Ashton Chula Main Tower (Fl 8-48)",
        "color": "#1E3A8A",
        "height": 175,
        "min_height": 32,
        "footprint": [
          [100.5301, 13.7308],
          [100.5309, 13.7308],
          [100.5309, 13.7316],
          [100.5301, 13.7316],
          [100.5301, 13.7308]
        ]
      },
      {
        "name": "Panoramic Sky Pool & Social Club (Fl 49-56)",
        "color": "#38BDF8",
        "height": 204,
        "min_height": 175,
        "footprint": [
          [100.5303, 13.7310],
          [100.5307, 13.7310],
          [100.5307, 13.7314],
          [100.5303, 13.7314],
          [100.5303, 13.7310]
        ]
      }
    ],
    "unitTypes": [
      { "label": "Studio", "size": "24.50 – 26.00 m²" },
      { "label": "1 Bedroom", "size": "30.50 – 34.50 m²" },
      { "label": "2 Bedrooms", "size": "55.00 – 66.00 m²" }
    ],
    "transport": [
      { "name": "MRT สามย่าน (BL27)", "dist": "180 m", "type": "mrt" },
      { "name": "BTS ศาลาแดง (S2)", "dist": "550 m", "type": "bts" }
    ],
    "nearbyPOIs": [
      { "name": "Samyan Mitrtown", "kind": "Mall", "color": "#059669", "lat": 13.7335, "lon": 100.5285, "dist": "250 m" },
      { "name": "Chulalongkorn University", "kind": "Education", "color": "#EC4899", "lat": 13.7365, "lon": 100.5320, "dist": "400 m" }
    ]
  },
  {
    "id": "dusit-central-park",
    "name": "Dusit Central Park",
    "brandId": "cpn",
    "brandName": "Dusit Thani & CPN",
    "category": "Super Luxury Mixed-Use",
    "categoryColor": "#C59B27",
    "developer": "Dusit Thani & Central Pattana (CPN)",
    "developerSite": "https://dusitcentralpark.com/",
    "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
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
    "location": "Corner of Silom & Rama IV (Opposite Lumphini Park)",
    "lat": 13.7283,
    "lon": 100.5375,
    "desc": "อัครโครงการมิกซ์ยูสระดับเวิลด์คลาสหัวมุมถนนสีลม-พระราม 4 ประกอบด้วย โรงแรม Dusit Thani Bangkok, ที่พักอาศัยระดับอัลตราลักชัวรี Dusit Residences & Dusit Parkside, อาคารสำนักงาน Central Park Offices และศูนย์การค้า Central Park พร้อมสวนลอยฟ้าขนาด 7 ไร่",
    "footprint": [
      [100.53719, 13.72814],
      [100.53772, 13.72803],
      [100.53781, 13.72846],
      [100.53728, 13.72857],
      [100.53719, 13.72814]
    ],
    "parts": [
      {
        "name": "Central Park 7-Rai Rooftop Park & Retail Podium",
        "color": "#15803D",
        "height": 38,
        "min_height": 0,
        "footprint": [
          [100.5368, 13.7278],
          [100.5382, 13.7278],
          [100.5382, 13.7288],
          [100.5368, 13.7288],
          [100.5368, 13.7278]
        ]
      },
      {
        "name": "Dusit Thani Hotel with Historic Golden Spire (160m)",
        "color": "#EAB308",
        "height": 160,
        "min_height": 38,
        "footprint": [
          [100.5369, 13.7283],
          [100.5376, 13.7283],
          [100.5376, 13.7288],
          [100.5369, 13.7288],
          [100.5369, 13.7283]
        ]
      },
      {
        "name": "Central Park Offices (245m)",
        "color": "#334155",
        "height": 245,
        "min_height": 38,
        "footprint": [
          [100.5377, 13.7283],
          [100.5382, 13.7283],
          [100.5382, 13.7288],
          [100.5377, 13.7288],
          [100.5377, 13.7283]
        ]
      },
      {
        "name": "Dusit Residences (299m)",
        "color": "#B86B43",
        "height": 299,
        "min_height": 38,
        "footprint": [
          [100.5372, 13.7278],
          [100.5380, 13.7278],
          [100.5380, 13.7282],
          [100.5372, 13.7282],
          [100.5372, 13.7278]
        ]
      }
    ],
    "unitTypes": [
      { "label": "Dusit Parkside (1-2 Beds)", "size": "55.00 – 115.00 m²" },
      { "label": "Dusit Residences (2-4 Beds)", "size": "120.00 – 260.00 m²" },
      { "label": "Penthouse & Crown Residences", "size": "350.00 – 750.00 m²" }
    ],
    "transport": [
      { "name": "BTS Sala Daeng (S2)", "dist": "Direct Link (0 m)", "type": "bts" },
      { "name": "MRT Silom (BL26)", "dist": "Direct Link (0 m)", "type": "mrt" },
      { "name": "Lumphini Park Connection", "dist": "50 m", "type": "park" }
    ],
    "nearbyPOIs": [
      { "name": "Lumphini Park", "kind": "Park", "color": "#16A34A", "lat": 13.731, "lon": 100.541, "dist": "50 m" },
      { "name": "Chulalongkorn Hospital", "kind": "Hospital", "color": "#DC2626", "lat": 13.732, "lon": 100.536, "dist": "150 m" }
    ]
  },
  {
    "id": "one-bangkok",
    "name": "Signature Tower (One Bangkok)",
    "brandId": "tcc",
    "brandName": "Frasers Property & TCC",
    "category": "Supertall Mixed-Use",
    "categoryColor": "#B86B43",
    "developer": "Frasers Property & TCC Assets",
    "developerSite": "https://www.onebangkok.com/",
    "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
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
    "location": "Rama IV Road & Wireless Road Intersection",
    "lat": 13.7275,
    "lon": 100.5472,
    "desc": "อภิมหาโครงการเมืองต้นแบบมิกซ์ยูสที่ใหญ่ที่สุดใจกลางกรุงเทพฯ พร้อมอาคาร Signature Tower สูง 436 เมตร (1 ใน 10 อาคารที่สูงที่สุดในอาเซียน), โรงแรม The Ritz-Carlton Bangkok, Andaz One Bangkok, และพื้นที่รีเทลกว่า 160,000 ตร.ม.",
    "footprint": [
      [100.54699, 13.72717],
      [100.54756, 13.72735],
      [100.54741, 13.72783],
      [100.54684, 13.72765],
      [100.54699, 13.72717]
    ],
    "parts": [
      {
        "name": "One Bangkok Retail & Public Realm Podium",
        "color": "#334155",
        "height": 35,
        "min_height": 0,
        "footprint": [
          [100.5440, 13.7250],
          [100.5495, 13.7250],
          [100.5495, 13.7290],
          [100.5440, 13.7290],
          [100.5440, 13.7250]
        ]
      },
      {
        "name": "Signature Tower Section 1 (Supertall Base)",
        "color": "#1E3A8A",
        "height": 160,
        "min_height": 35,
        "footprint": [
          [100.5464, 13.7264],
          [100.5478, 13.7264],
          [100.5478, 13.7278],
          [100.5464, 13.7278],
          [100.5464, 13.7264]
        ]
      },
      {
        "name": "Signature Tower Section 2 (Mid-rise Glass Tier)",
        "color": "#2563EB",
        "height": 290,
        "min_height": 160,
        "footprint": [
          [100.5466, 13.7266],
          [100.5476, 13.7266],
          [100.5476, 13.7276],
          [100.5466, 13.7276],
          [100.5466, 13.7266]
        ]
      },
      {
        "name": "Signature Tower Crown Pinnacle (436m Supertall Spire)",
        "color": "#60A5FA",
        "height": 436,
        "min_height": 290,
        "footprint": [
          [100.5468, 13.7268],
          [100.5474, 13.7268],
          [100.5474, 13.7274],
          [100.5468, 13.7274],
          [100.5468, 13.7268]
        ]
      },
      {
        "name": "The Ritz-Carlton & Tower 2 (215m)",
        "color": "#B45309",
        "height": 215,
        "min_height": 35,
        "footprint": [
          [100.5448, 13.7256],
          [100.5460, 13.7256],
          [100.5460, 13.7268],
          [100.5448, 13.7268],
          [100.5448, 13.7256]
        ]
      },
      {
        "name": "One Bangkok Office Tower 3 (180m)",
        "color": "#475569",
        "height": 180,
        "min_height": 35,
        "footprint": [
          [100.5480, 13.7272],
          [100.5492, 13.7272],
          [100.5492, 13.7285],
          [100.5480, 13.7285],
          [100.5480, 13.7272]
        ]
      }
    ],
    "unitTypes": [
      { "label": "The Residences at One Bangkok", "size": "130.00 – 480.00 m²" },
      { "label": "Super Luxury Penthouses", "size": "600.00 – 1,200.00 m²" }
    ],
    "transport": [
      { "name": "MRT Lumphini (BL25)", "dist": "Direct Underground (0 m)", "type": "mrt" },
      { "name": "Chalerm Maha Nakhon Expressway", "dist": "Direct Access", "type": "toll" }
    ],
    "nearbyPOIs": [
      { "name": "Lumphini Park East Gate", "kind": "Park", "color": "#16A34A", "lat": 13.7295, "lon": 100.544, "dist": "100 m" }
    ]
  },
  {
    "id": "supalai-icon",
    "name": "Supalai Icon Sathorn",
    "brandId": "supalai",
    "brandName": "Supalai",
    "category": "Super Luxury Mixed-Use & Condo",
    "categoryColor": "#C2703C",
    "developer": "Supalai PLC",
    "developerSite": "https://www.supalai.com/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
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
    "location": "South Sathorn Road (Former Australian Embassy)",
    "lat": 13.72309,
    "lon": 100.53796,
    "desc": "โครงการระดับ Iconic Landmark บนถนนสาทรใต้ บนที่ดินสถานทูตออสเตรเลียเดิม โดดเด่นด้วยคอนโดมิเนียมหรู อาคารสำนักงานเกรด A และโซนรีเทลระดับพรีเมียม",
    "footprint": [
      [100.53769, 13.72296],
      [100.53812, 13.72285],
      [100.53822, 13.72322],
      [100.53780, 13.72333],
      [100.53769, 13.72296]
    ],
    "parts": [
      {
        "name": "Sathorn Lifestyle Retail & Commercial Podium",
        "color": "#0F172A",
        "height": 32,
        "min_height": 0,
        "footprint": [
          [100.5375, 13.7227],
          [100.5385, 13.7227],
          [100.5385, 13.7235],
          [100.5375, 13.7235],
          [100.5375, 13.7227]
        ]
      },
      {
        "name": "Main Luxury Residential Tower (Fl 7-45)",
        "color": "#9A3412",
        "height": 170,
        "min_height": 32,
        "footprint": [
          [100.5378, 13.7229],
          [100.5383, 13.7229],
          [100.5383, 13.7233],
          [100.5378, 13.7233],
          [100.5378, 13.7229]
        ]
      },
      {
        "name": "Sky Residences & Crown Spire (Fl 46-56)",
        "color": "#D97706",
        "height": 212,
        "min_height": 170,
        "footprint": [
          [100.5379, 13.7230],
          [100.5382, 13.7230],
          [100.5382, 13.7232],
          [100.5379, 13.7232],
          [100.5379, 13.7230]
        ]
      }
    ],
    "unitTypes": [
      { "label": "1 Bedroom", "size": "42.00 – 61.00 m²" },
      { "label": "2 Bedrooms", "size": "65.00 – 98.00 m²" },
      { "label": "3-4 Bedrooms Duplex", "size": "185.00 – 350.00 m²" }
    ],
    "transport": [
      { "name": "BTS ช่องนนทรี (S3)", "dist": "800 m", "type": "bts" },
      { "name": "BRT สาทร", "dist": "650 m", "type": "bus" },
      { "name": "MRT ลุมพินี (BL25)", "dist": "850 m", "type": "mrt" }
    ],
    "nearbyPOIs": [
      { "name": "Banyan Tree Bangkok", "kind": "Hotel", "color": "#7C3AED", "lat": 13.7235, "lon": 100.5395, "dist": "150 m" }
    ]
  },
  {
    "id": "mahanakhon",
    "name": "King Power Mahanakhon",
    "brandId": "kingpower",
    "brandName": "King Power",
    "category": "Supertall Skyscraper & Residences",
    "categoryColor": "#7C3AED",
    "developer": "King Power & Pace Development",
    "developerSite": "https://kingpowermahanakhon.co.th/",
    "image": "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80",
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
    "location": "Narathiwas Rajanagarindra Rd (Chong Nonsi)",
    "lat": 13.7236,
    "lon": 100.5283,
    "desc": "ตึกระฟ้าสัญลักษณ์รูปทรงพิกเซล 3D สถาปัตยกรรมระดับโลกโดย Ole Scheeren ประกอบด้วย The Ritz-Carlton Residences, The Standard Hotel Bangkok และจุดชมวิวพื้นกระจก Mahanakhon SkyWalk",
    "footprint": [
      [100.52821, 13.72333],
      [100.52858, 13.72354],
      [100.52839, 13.72387],
      [100.52802, 13.72366],
      [100.52821, 13.72333]
    ],
    "parts": [
      {
        "name": "Mahanakhon CUBE Retail Podium",
        "color": "#0F172A",
        "height": 32,
        "min_height": 0,
        "footprint": [
          [100.5284, 13.7228],
          [100.5298, 13.7228],
          [100.5298, 13.7234],
          [100.5284, 13.7234],
          [100.5284, 13.7228]
        ]
      },
      {
        "name": "Mahanakhon Main Tower Trunk",
        "color": "#1E293B",
        "height": 314,
        "min_height": 30,
        "footprint": [
          [100.5280, 13.7233],
          [100.5288, 13.7233],
          [100.5288, 13.7240],
          [100.5280, 13.7240],
          [100.5280, 13.7233]
        ]
      },
      {
        "name": "Pixel Cutout Spiral Tier 1",
        "color": "#0284C7",
        "height": 150,
        "min_height": 110,
        "footprint": [
          [100.5277, 13.7231],
          [100.5283, 13.7231],
          [100.5283, 13.7236],
          [100.5277, 13.7236],
          [100.5277, 13.7231]
        ]
      },
      {
        "name": "Pixel Cutout Spiral Tier 2",
        "color": "#38BDF8",
        "height": 240,
        "min_height": 195,
        "footprint": [
          [100.5285, 13.7236],
          [100.5291, 13.7236],
          [100.5291, 13.7242],
          [100.5285, 13.7242],
          [100.5285, 13.7236]
        ]
      },
      {
        "name": "Mahanakhon SkyWalk Glass Balcony Peak (314m)",
        "color": "#00E5FF",
        "height": 314,
        "min_height": 298,
        "footprint": [
          [100.5282, 13.7234],
          [100.5288, 13.7234],
          [100.5288, 13.7238],
          [100.5282, 13.7238],
          [100.5282, 13.7234]
        ]
      }
    ],
    "unitTypes": [
      { "label": "2 Bedrooms Residences", "size": "120.00 – 160.00 m²" },
      { "label": "3-4 Bedrooms Sky Residences", "size": "220.00 – 380.00 m²" },
      { "label": "The Custom Penthouse", "size": "850.00 m²" }
    ],
    "transport": [
      { "name": "BTS Chong Nonsi (S3)", "dist": "Direct Skybridge (0 m)", "type": "bts" },
      { "name": "BRT Sathorn", "dist": "150 m", "type": "bus" }
    ],
    "nearbyPOIs": [
      { "name": "Mahanakhon CUBE", "kind": "Dining", "color": "#D97706", "lat": 13.7239, "lon": 100.5286, "dist": "30 m" }
    ]
  },
  {
    "id": "iconsiam",
    "name": "ICONSIAM & Magnolias Waterfront",
    "brandId": "siampiwat",
    "brandName": "Siam Piwat & MQDC",
    "category": "Mega Luxury Retail & Residences",
    "categoryColor": "#C59B27",
    "developer": "Siam Piwat, MQDC, CP Group",
    "developerSite": "https://www.iconsiam.com/",
    "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
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
    "priceRange": "฿18M – ฿200M+",
    "district": "คลองสาน",
    "location": "Charoen Nakhon Road (Chao Phraya Riverfront)",
    "lat": 13.7267,
    "lon": 100.5105,
    "desc": "อภิมหาโครงการเมืองริมแม่น้ำเจ้าพระยา พร้อมอาคาร Magnolias Waterfront Residences (สูง 318 เมตร) และ The Residences at Mandarin Oriental Bangkok",
    "footprint": [
      [100.51044, 13.72637],
      [100.51084, 13.72670],
      [100.51056, 13.72703],
      [100.51016, 13.72670],
      [100.51044, 13.72637]
    ],
    "parts": [
      {
        "name": "ICONSIAM Crystal Retail & River Park",
        "color": "#C59B27",
        "height": 45,
        "min_height": 0,
        "footprint": [
          [100.5085, 13.7252],
          [100.5115, 13.7252],
          [100.5115, 13.7278],
          [100.5085, 13.7278],
          [100.5085, 13.7252]
        ]
      },
      {
        "name": "Magnolias Waterfront Residences (318m Supertall)",
        "color": "#0284C7",
        "height": 318,
        "min_height": 45,
        "footprint": [
          [100.5098, 13.7268],
          [100.5110, 13.7268],
          [100.5110, 13.7278],
          [100.5098, 13.7278],
          [100.5098, 13.7268]
        ]
      },
      {
        "name": "The Residences at Mandarin Oriental (269m)",
        "color": "#D97706",
        "height": 269,
        "min_height": 45,
        "footprint": [
          [100.5090, 13.7255],
          [100.5102, 13.7255],
          [100.5102, 13.7265],
          [100.5090, 13.7265],
          [100.5090, 13.7255]
        ]
      }
    ],
    "unitTypes": [
      { "label": "1-2 Bedrooms Waterfront", "size": "60.00 – 125.00 m²" },
      { "label": "Mandarin Oriental Residences", "size": "130.00 – 380.00 m²" }
    ],
    "transport": [
      { "name": "BTS Charoen Nakhon (G2)", "dist": "Direct Link (0 m)", "type": "bts" },
      { "name": "ICONSIAM Pier", "dist": "Direct Express Boat (0 m)", "type": "boat" }
    ],
    "nearbyPOIs": [
      { "name": "Chao Phraya Riverfront Park", "kind": "Park", "color": "#0284C7", "lat": 13.7275, "lon": 100.5115, "dist": "50 m" }
    ]
  },
  {
    "id": "98-wireless",
    "name": "98 Wireless",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "Ultra Luxury Flagship Condominium",
    "categoryColor": "#15803D",
    "developer": "Sansiri PLC",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
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
    "location": "Wireless Road (Near US Embassy), Pathum Wan",
    "lat": 13.7380,
    "lon": 100.5478,
    "desc": "แฟลกชิปคอนโดมิเนียมระดับ The Best Comes as Standard หนึ่งในคอนโดที่แพงและหรูหราที่สุดในประเทศไทย สถาปัตยกรรมคลาสสิกสไตล์ Beaux-Arts ตกแต่งด้วยหินอ่อน Moleanos และเฟอร์นิเจอร์ Ralph Lauren Home",
    "footprint": [
      [100.5472, 13.7375],
      [100.5484, 13.7375],
      [100.5484, 13.7385],
      [100.5472, 13.7385],
      [100.5472, 13.7375]
    ],
    "parts": [
      {
        "name": "Classic Beaux-Arts Grand Podium",
        "color": "#E2E8F0",
        "height": 20,
        "min_height": 0,
        "footprint": [
          [100.5472, 13.7375],
          [100.5484, 13.7375],
          [100.5484, 13.7385],
          [100.5472, 13.7385],
          [100.5472, 13.7375]
        ]
      },
      {
        "name": "Limestone Residence Tower",
        "color": "#D4AF37",
        "height": 88,
        "min_height": 20,
        "footprint": [
          [100.5474, 13.7377],
          [100.5482, 13.7377],
          [100.5482, 13.7383],
          [100.5474, 13.7383],
          [100.5474, 13.7377]
        ]
      },
      {
        "name": "Penthouse Grand Chandelier Crown",
        "color": "#FBBF24",
        "height": 105,
        "min_height": 88,
        "footprint": [
          [100.5475, 13.7378],
          [100.5481, 13.7378],
          [100.5481, 13.7382],
          [100.5475, 13.7382],
          [100.5475, 13.7378]
        ]
      }
    ],
    "unitTypes": [
      { "label": "2 Bedrooms", "size": "120.00 – 145.00 m²" },
      { "label": "3 Bedrooms", "size": "230.00 – 290.00 m²" },
      { "label": "Super Penthouse", "size": "948.00 m²" }
    ],
    "transport": [
      { "name": "BTS เพลินจิต (E2)", "dist": "350 m", "type": "bts" },
      { "name": "BTS ชิดลม (E1)", "dist": "650 m", "type": "bts" }
    ],
    "nearbyPOIs": [
      { "name": "US Embassy", "kind": "Embassy", "color": "#0284C7", "lat": 13.7360, "lon": 100.5485, "dist": "150 m" }
    ]
  },
  {
    "id": "the-monument-thonglo",
    "name": "The Monument Thong Lo",
    "brandId": "sansiri",
    "brandName": "Sansiri",
    "category": "Ultra Luxury High-Rise",
    "categoryColor": "#15803D",
    "developer": "Sansiri PLC",
    "developerSite": "https://www.sansiri.com/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#14532D",
    "color": "#166534",
    "height": 177,
    "floors": 45,
    "units": 127,
    "unitsPerFloor": 4,
    "parking": 192,
    "parkingRatio": "151%",
    "landRai": 2.00,
    "facilitiesM2": "1,000 m² Dog Park & Iconic Pool",
    "priceRange": "฿35M – ฿120M",
    "district": "วัฒนา",
    "location": "Main Thong Lo Road (Sukhumvit 55)",
    "lat": 13.7410,
    "lon": 100.5840,
    "desc": "คอนโดมิเนียมระดับลักชัวรีใจกลางทองหล่อ ออกแบบภายใต้แนวคิด Luxury is Space ยูนิตขนาดใหญ่พิเศษ พร้อมสระว่ายน้ำประติมากรรมหิน Alabaster และสวนร่มรื่นกว่า 1,000 ตร.ม.",
    "footprint": [
      [100.5835, 13.7405],
      [100.5845, 13.7405],
      [100.5845, 13.7415],
      [100.5835, 13.7415],
      [100.5835, 13.7405]
    ],
    "parts": [
      {
        "name": "Thong Lo Garden & Lobby Podium",
        "color": "#064E3B",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [100.5835, 13.7405],
          [100.5845, 13.7405],
          [100.5845, 13.7415],
          [100.5835, 13.7415],
          [100.5835, 13.7405]
        ]
      },
      {
        "name": "Monolithic Glass Tower",
        "color": "#047857",
        "height": 150,
        "min_height": 25,
        "footprint": [
          [100.5837, 13.7407],
          [100.5843, 13.7407],
          [100.5843, 13.7413],
          [100.5837, 13.7413],
          [100.5837, 13.7407]
        ]
      },
      {
        "name": "Sky Penthouse Tier (Fl 41-45)",
        "color": "#10B981",
        "height": 177,
        "min_height": 150,
        "footprint": [
          [100.5838, 13.7408],
          [100.5842, 13.7408],
          [100.5842, 13.7412],
          [100.5838, 13.7412],
          [100.5838, 13.7408]
        ]
      }
    ],
    "unitTypes": [
      { "label": "2 Bedrooms", "size": "124.25 – 125.25 m²" },
      { "label": "3 Bedrooms", "size": "230.75 – 231.75 m²" },
      { "label": "Penthouse", "size": "508.00 – 662.00 m²" }
    ],
    "transport": [
      { "name": "BTS ทองหล่อ (E6)", "dist": "1.2 km", "type": "bts" },
      { "name": "ทองหล่อ Shuttle Bus", "dist": "0 m", "type": "bus" }
    ],
    "nearbyPOIs": [
      { "name": "The Commons Thong Lo", "kind": "Lifestyle", "color": "#EA580C", "lat": 13.7350, "lon": 100.5820, "dist": "650 m" }
    ]
  },
  {
    "id": "park-origin-thonglor",
    "name": "Park Origin Thonglor",
    "brandId": "origin",
    "brandName": "Origin Property",
    "category": "Super Luxury Multi-Tower",
    "categoryColor": "#EA580C",
    "developer": "Origin Property & Nomura Real Estate",
    "developerSite": "https://www.origin.co.th/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#C2410C",
    "color": "#EA580C",
    "height": 220,
    "floors": 59,
    "units": 1182,
    "unitsPerFloor": 12,
    "parking": 640,
    "parkingRatio": "54%",
    "landRai": 5.30,
    "facilitiesM2": "2-Rai Green Park & Sky Facilities",
    "priceRange": "฿12M – ฿48M",
    "district": "วัฒนา",
    "location": "Thong Lo Soi 10 (Arena 10 Old Site)",
    "lat": 13.7335,
    "lon": 100.5835,
    "desc": "เมกะโปรเจกต์คอนโดมิเนียมระดับแฟลกชิปใจกลางทองหล่อ ซอย 10 ประกอบด้วย 3 ทาวเวอร์สูงเสียดฟ้า ออกแบบผสานสวนป่ากว่า 2 ไร่ พร้อมส่วนกลางเชื่อมต่อ 3 อาคารระดับเวิลด์คลาส",
    "footprint": [
      [100.5825, 13.7325],
      [100.5845, 13.7325],
      [100.5845, 13.7345],
      [100.5825, 13.7345],
      [100.5825, 13.7325]
    ],
    "parts": [
      {
        "name": "Arena 10 Lifestyle & Forest Base",
        "color": "#065F46",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [100.5825, 13.7325],
          [100.5845, 13.7325],
          [100.5845, 13.7345],
          [100.5825, 13.7345],
          [100.5825, 13.7325]
        ]
      },
      {
        "name": "Tower A (39 Fl, 150m)",
        "color": "#C2410C",
        "height": 150,
        "min_height": 25,
        "footprint": [
          [100.5827, 13.7327],
          [100.5833, 13.7327],
          [100.5833, 13.7333],
          [100.5827, 13.7333],
          [100.5827, 13.7327]
        ]
      },
      {
        "name": "Tower B (53 Fl, 195m)",
        "color": "#EA580C",
        "height": 195,
        "min_height": 25,
        "footprint": [
          [100.5836, 13.7330],
          [100.5843, 13.7330],
          [100.5843, 13.7338],
          [100.5836, 13.7338],
          [100.5836, 13.7330]
        ]
      },
      {
        "name": "Tower C Supertall Peak (59 Fl, 220m)",
        "color": "#FB923C",
        "height": 220,
        "min_height": 25,
        "footprint": [
          [100.5828, 13.7337],
          [100.5835, 13.7337],
          [100.5835, 13.7344],
          [100.5828, 13.7344],
          [100.5828, 13.7337]
        ]
      }
    ],
    "unitTypes": [
      { "label": "1 Bedroom", "size": "30.00 – 36.00 m²" },
      { "label": "2 Bedrooms", "size": "45.00 – 68.00 m²" },
      { "label": "Duo Space", "size": "32.50 – 55.00 m²" }
    ],
    "transport": [
      { "name": "BTS ทองหล่อ (E6)", "dist": "1.1 km", "type": "bts" },
      { "name": "BTS เอกมัย (E7)", "dist": "1.3 km", "type": "bts" }
    ],
    "nearbyPOIs": [
      { "name": "Donki Mall Thonglor", "kind": "Shopping", "color": "#059669", "lat": 13.7328, "lon": 100.5840, "dist": "100 m" }
    ]
  },
  {
    "id": "rhythm-ekkamai",
    "name": "Rhythm Ekkamai Estate",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "Luxury Condominium",
    "categoryColor": "#DC2626",
    "developer": "AP Thailand & Mitsubishi Estate",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
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
    "location": "Ekkamai Soi 1 (Sukhumvit 63)",
    "lat": 13.7275,
    "lon": 100.5865,
    "desc": "คอนโดมิเนียมสไตล์บ้านในเมือง 'Feel Like Home' จาก AP Thailand ใจกลางเอกมัย พร้อมพื้นที่ส่วนกลางยกชั้นลอยฟ้า Triplex Sky Facilities และ Floating Garden ร่มรื่น",
    "footprint": [
      [100.5858, 13.7268],
      [100.5872, 13.7268],
      [100.5872, 13.7282],
      [100.5858, 13.7282],
      [100.5858, 13.7268]
    ],
    "parts": [
      {
        "name": "Ekkamai Grand Lobby Base",
        "color": "#1E293B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [100.5858, 13.7268],
          [100.5872, 13.7268],
          [100.5872, 13.7282],
          [100.5858, 13.7282],
          [100.5858, 13.7268]
        ]
      },
      {
        "name": "Main Tower Body (Fl 7-28)",
        "color": "#DC2626",
        "height": 110,
        "min_height": 22,
        "footprint": [
          [100.5861, 13.7271],
          [100.5869, 13.7271],
          [100.5869, 13.7279],
          [100.5861, 13.7279],
          [100.5861, 13.7271]
        ]
      },
      {
        "name": "Triplex Sky Pool Crown (Fl 29-32)",
        "color": "#F87171",
        "height": 130,
        "min_height": 110,
        "footprint": [
          [100.5862, 13.7272],
          [100.5868, 13.7272],
          [100.5868, 13.7278],
          [100.5862, 13.7278],
          [100.5862, 13.7272]
        ]
      }
    ],
    "unitTypes": [
      { "label": "1 Bedroom", "size": "35.00 m²" },
      { "label": "1 Bedroom Plus", "size": "39.50 – 40.00 m²" },
      { "label": "2 Bedrooms", "size": "74.50 – 87.00 m²" }
    ],
    "transport": [
      { "name": "BTS เอกมัย (E7)", "dist": "750 m", "type": "bts" },
      { "name": "BTS ทองหล่อ (E6)", "dist": "1.2 km", "type": "bts" }
    ],
    "nearbyPOIs": [
      { "name": "Gateway Ekamai", "kind": "Mall", "color": "#059669", "lat": 13.7190, "lon": 100.5850, "dist": "800 m" }
    ]
  },
  {
    "id": "life-asoke-hype",
    "name": "Life Asoke Hype",
    "brandId": "ap",
    "brandName": "AP Thailand",
    "category": "Urban Lifestyle Condominium",
    "categoryColor": "#DC2626",
    "developer": "AP Thailand & Mitsubishi Estate",
    "developerSite": "https://www.apthai.com/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#991B1B",
    "color": "#991B1B",
    "height": 155,
    "floors": 40,
    "units": 1253,
    "unitsPerFloor": 34,
    "parking": 530,
    "parkingRatio": "42%",
    "landRai": 5.00,
    "facilitiesM2": "Hover Bay Pool & Sky Mirage Lounge",
    "priceRange": "฿4.2M – ฿14M",
    "district": "ราชเทวี",
    "location": "Asoke-Din Daeng Rd (Rama 9 New CBD)",
    "lat": 13.7545,
    "lon": 100.5630,
    "desc": "คอนโดมิเนียมดีไซน์สุดล้ำ 'The Hype of New CBD' ทำเลเชื่อมต่ออโศกและพระราม 9 ใกล้ MRT พระราม 9 และ ARL มักกะสัน พร้อมพื้นที่ส่วนกลางดีไซน์ Eclectic Art ผสานเทคโนโลยี",
    "footprint": [
      [100.5620, 13.7535],
      [100.5640, 13.7535],
      [100.5640, 13.7555],
      [100.5620, 13.7555],
      [100.5620, 13.7535]
    ],
    "parts": [
      {
        "name": "Podium & Co-Working Garden",
        "color": "#1E293B",
        "height": 28,
        "min_height": 0,
        "footprint": [
          [100.5620, 13.7535],
          [100.5640, 13.7535],
          [100.5640, 13.7555],
          [100.5620, 13.7555],
          [100.5620, 13.7535]
        ]
      },
      {
        "name": "Life Asoke Main Tower (Fl 8-36)",
        "color": "#B91C1C",
        "height": 135,
        "min_height": 28,
        "footprint": [
          [100.5623, 13.7538],
          [100.5637, 13.7538],
          [100.5637, 13.7552],
          [100.5623, 13.7552],
          [100.5623, 13.7538]
        ]
      },
      {
        "name": "Hover Bay Mirage Pool (Fl 37-40)",
        "color": "#EF4444",
        "height": 155,
        "min_height": 135,
        "footprint": [
          [100.5625, 13.7540],
          [100.5635, 13.7540],
          [100.5635, 13.7550],
          [100.5625, 13.7550],
          [100.5625, 13.7540]
        ]
      }
    ],
    "unitTypes": [
      { "label": "Studio", "size": "25.50 m²" },
      { "label": "1 Bedroom", "size": "32.00 m²" },
      { "label": "2 Bedrooms", "size": "58.50 – 64.00 m²" }
    ],
    "transport": [
      { "name": "MRT พระราม 9 (BL20)", "dist": "300 m", "type": "mrt" },
      { "name": "ARL มักกะสัน (A6)", "dist": "600 m", "type": "bts" }
    ],
    "nearbyPOIs": [
      { "name": "Central Rama 9", "kind": "Mall", "color": "#059669", "lat": 13.7580, "lon": 100.5660, "dist": "450 m" }
    ]
  },
  {
    "id": "noble-ploenchit",
    "name": "Noble Ploenchit",
    "brandId": "noble",
    "brandName": "Noble Development",
    "category": "Ultra Luxury Minimalist High-Rise",
    "categoryColor": "#000000",
    "developer": "Noble Development",
    "developerSite": "https://www.noblehome.com/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#000000",
    "color": "#1E293B",
    "height": 190,
    "floors": 51,
    "units": 1444,
    "unitsPerFloor": 10,
    "parking": 1000,
    "parkingRatio": "70%",
    "landRai": 9.00,
    "facilitiesM2": "4-Rai Sky Garden & Private Lift",
    "priceRange": "฿14M – ฿65M",
    "district": "ปทุมวัน",
    "location": "Ploenchit Road (Direct Skywalk to BTS)",
    "lat": 13.7430,
    "lon": 100.5485,
    "desc": "คอนโดมิเนียมระดับอัลตร้าลักชัวรีใจกลางเพลินจิต สถาปัตยกรรมแบบ Minimalist พร้อมลิฟต์ส่วนตัวทุกยูนิต เชื่อมต่อตรงสู่สถานีรถไฟฟ้า BTS เพลินจิตด้วย Skywalk ส่วนตัว และสวนสีเขียวกว่า 4 ไร่",
    "footprint": [
      [100.5475, 13.7420],
      [100.5495, 13.7420],
      [100.5495, 13.7440],
      [100.5475, 13.7440],
      [100.5475, 13.7420]
    ],
    "parts": [
      {
        "name": "Noble Minimalist Podium & Skywalk Hub",
        "color": "#0F172A",
        "height": 24,
        "min_height": 0,
        "footprint": [
          [100.5475, 13.7420],
          [100.5495, 13.7420],
          [100.5495, 13.7440],
          [100.5475, 13.7440],
          [100.5475, 13.7420]
        ]
      },
      {
        "name": "Tower A (14 Fl, 65m)",
        "color": "#334155",
        "height": 65,
        "min_height": 24,
        "footprint": [
          [100.5477, 13.7422],
          [100.5483, 13.7422],
          [100.5483, 13.7428],
          [100.5477, 13.7428],
          [100.5477, 13.7422]
        ]
      },
      {
        "name": "Tower B (51 Fl, 190m)",
        "color": "#1E293B",
        "height": 190,
        "min_height": 24,
        "footprint": [
          [100.5485, 13.7428],
          [100.5493, 13.7428],
          [100.5493, 13.7438],
          [100.5485, 13.7438],
          [100.5485, 13.7428]
        ]
      }
    ],
    "unitTypes": [
      { "label": "1 Bedroom", "size": "44.00 – 62.00 m²" },
      { "label": "2 Bedrooms", "size": "70.00 – 115.00 m²" },
      { "label": "Penthouse", "size": "140.00 – 190.00 m²" }
    ],
    "transport": [
      { "name": "BTS เพลินจิต (E2)", "dist": "Direct Skybridge (0 m)", "type": "bts" },
      { "name": "ทางด่วนเฉลิมมหานคร", "dist": "300 m", "type": "toll" }
    ],
    "nearbyPOIs": [
      { "name": "Central Embassy", "kind": "Mall", "color": "#7C3AED", "lat": 13.7442, "lon": 100.5465, "dist": "150 m" }
    ]
  },
  {
    "id": "28-chidlom",
    "name": "28 Chidlom",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "Ultra Luxury Jewel-box High-Rise",
    "categoryColor": "#C2703C",
    "developer": "SC ASSET",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1E3A8A",
    "color": "#C2703C",
    "height": 182,
    "floors": 47,
    "units": 425,
    "unitsPerFloor": 8,
    "parking": 358,
    "parkingRatio": "84%",
    "landRai": 3.00,
    "facilitiesM2": "Courtyard Greenery & Jewel Box Sky Pool",
    "priceRange": "฿16M – ฿60M",
    "district": "ปทุมวัน",
    "location": "Chidlom Road (250m to BTS Chidlom)",
    "lat": 13.7460,
    "lon": 100.5435,
    "desc": "คอนโดมิเนียมระดับ Limited Collection โดย SC Asset บนถนนชิดลม ออกแบบภายใต้แนวคิด 'Jewel Box' กล่องอัญมณีกระจกใสผสานคอร์ทยาร์ดสีเขียวใจกลางเมือง",
    "footprint": [
      [100.5428, 13.7452],
      [100.5442, 13.7452],
      [100.5442, 13.7468],
      [100.5428, 13.7468],
      [100.5428, 13.7452]
    ],
    "parts": [
      {
        "name": "The Villa Podium & Courtyard",
        "color": "#064E3B",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [100.5428, 13.7452],
          [100.5442, 13.7452],
          [100.5442, 13.7468],
          [100.5428, 13.7468],
          [100.5428, 13.7452]
        ]
      },
      {
        "name": "The Tower Main Skyscraper (Fl 8-40)",
        "color": "#C2703C",
        "height": 155,
        "min_height": 22,
        "footprint": [
          [100.5432, 13.7455],
          [100.5439, 13.7455],
          [100.5439, 13.7465],
          [100.5432, 13.7465],
          [100.5432, 13.7455]
        ]
      },
      {
        "name": "Jewel Box Sky Pool & Fitness (Fl 41-47)",
        "color": "#F59E0B",
        "height": 182,
        "min_height": 155,
        "footprint": [
          [100.5433, 13.7457],
          [100.5438, 13.7457],
          [100.5438, 13.7463],
          [100.5433, 13.7463],
          [100.5433, 13.7457]
        ]
      }
    ],
    "unitTypes": [
      { "label": "1 Bedroom", "size": "40.00 – 50.00 m²" },
      { "label": "2 Bedrooms", "size": "70.00 – 90.00 m²" },
      { "label": "3 Bedrooms & Penthouse", "size": "120.00 – 190.00 m²" }
    ],
    "transport": [
      { "name": "BTS ชิดลม (E1)", "dist": "250 m", "type": "bts" },
      { "name": "BTS เพลินจิต (E2)", "dist": "600 m", "type": "bts" }
    ],
    "nearbyPOIs": [
      { "name": "Central Chidlom", "kind": "Mall", "color": "#059669", "lat": 13.7441, "lon": 100.5432, "dist": "200 m" }
    ]
  },
  {
    "id": "doubletree-silom",
    "name": "DoubleTree by Hilton Bangkok Silom",
    "brandId": "hilton",
    "brandName": "Hilton",
    "category": "Hotel",
    "categoryColor": "#D97706",
    "developer": "Hilton Hotels & Resorts",
    "developerSite": "https://www.hilton.com/",
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#78350F",
    "color": "#B86B43",
    "height": 98,
    "floors": 28,
    "units": 250,
    "district": "บางรัก",
    "location": "Surawong / Silom Road",
    "lat": 13.7268,
    "lon": 100.5292,
    "desc": "โรงแรมระดับ 4 ดาวใจกลางย่านธุรกิจสีลม-สุรวงศ์ พร้อมสิ่งอำนวยความสะดวกครบครัน",
    "footprint": [
      [100.52907, 13.72662],
      [100.52939, 13.72671],
      [100.52932, 13.72697],
      [100.52900, 13.72688],
      [100.52907, 13.72662]
    ],
    "parts": [
      {
        "name": "Lobby & Dining Podium",
        "color": "#1E293B",
        "height": 24,
        "min_height": 0,
        "footprint": [
          [100.5289, 13.7265],
          [100.5295, 13.7265],
          [100.5295, 13.7271],
          [100.5289, 13.7271],
          [100.5289, 13.7265]
        ]
      },
      {
        "name": "DoubleTree Guest Tower (Fl 7-28)",
        "color": "#B86B43",
        "height": 98,
        "min_height": 24,
        "footprint": [
          [100.5290, 13.7266],
          [100.5294, 13.7266],
          [100.5294, 13.7270],
          [100.5290, 13.7270],
          [100.5290, 13.7266]
        ]
      }
    ],
    "unitTypes": [],
    "transport": [
      { "name": "BTS Chong Nonsi (S3)", "dist": "450 m", "type": "bts" }
    ],
    "nearbyPOIs": []
  },
  {
    "id": "bdms-wellness",
    "name": "BDMS Wellness Langsuan",
    "brandId": "bdms",
    "brandName": "BDMS",
    "category": "Healthcare & Wellness Hub",
    "categoryColor": "#1F4E79",
    "developer": "Bangkok Dusit Medical Services (BDMS)",
    "developerSite": "https://www.bdmswellness.com/",
    "image": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
    "badgeBg": "#1F4E79",
    "color": "#1F4E79",
    "height": 85,
    "floors": 26,
    "district": "ปทุมวัน",
    "location": "Langsuan Road & Wireless Road",
    "lat": 13.73441,
    "lon": 100.54227,
    "desc": "ศูนย์ดูแลสุขภาพ เวชศาสตร์ชะลอวัย และป้องกันโรคระดับพรีเมียมใจกลางย่านหลังสวน",
    "footprint": [
      [100.54210, 13.73422],
      [100.54248, 13.73429],
      [100.54243, 13.73459],
      [100.54205, 13.73452],
      [100.54210, 13.73422]
    ],
    "parts": [
      {
        "name": "Medical Clinic & Biophilic Green Terrace",
        "color": "#047857",
        "height": 22,
        "min_height": 0,
        "footprint": [
          [100.5419, 13.7341],
          [100.5426, 13.7341],
          [100.5426, 13.7347],
          [100.5419, 13.7347],
          [100.5419, 13.7341]
        ]
      },
      {
        "name": "BDMS Executive Wellness Tower",
        "color": "#0284C7",
        "height": 85,
        "min_height": 22,
        "footprint": [
          [100.5421, 13.7343],
          [100.5425, 13.7343],
          [100.5425, 13.7346],
          [100.5421, 13.7346],
          [100.5421, 13.7343]
        ]
      }
    ],
    "unitTypes": [],
    "transport": [
      { "name": "BTS Chit Lom (E1)", "dist": "700 m", "type": "bts" },
      { "name": "BTS Ratchadamri (S1)", "dist": "650 m", "type": "bts" }
    ],
    "nearbyPOIs": []
  },
  {
    "id": "sc-residences",
    "name": "SC residences (Saladaeng One)",
    "brandId": "sc",
    "brandName": "SC ASSET",
    "category": "Super Luxury Residences",
    "categoryColor": "#C2703C",
    "developer": "SC ASSET",
    "developerSite": "https://www.scasset.com/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "badgeType": "brand",
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
      [100.54253, 13.72629],
      [100.54286, 13.72641],
      [100.54276, 13.72666],
      [100.54243, 13.72654],
      [100.54253, 13.72629]
    ],
    "parts": [
      {
        "name": "Saladaeng One White Marble Podium",
        "color": "#F1F5F9",
        "height": 26,
        "min_height": 0,
        "footprint": [
          [100.5423, 13.7261],
          [100.5430, 13.7261],
          [100.5430, 13.7268],
          [100.5423, 13.7268],
          [100.5423, 13.7261]
        ]
      },
      {
        "name": "Main Luxury Tower Facing Lumphini Park",
        "color": "#C2703C",
        "height": 145,
        "min_height": 26,
        "footprint": [
          [100.5424, 13.7263],
          [100.5428, 13.7263],
          [100.5428, 13.7267],
          [100.5424, 13.7267],
          [100.5424, 13.7263]
        ]
      }
    ],
    "unitTypes": [],
    "transport": [
      { "name": "MRT Lumphini (BL25)", "dist": "350 m", "type": "mrt" }
    ],
    "nearbyPOIs": []
  },
  {
    "id": "sappaya-sapasathan",
    "name": "สัปปายะสภาสถาน (The National Assembly)",
    "brandId": "govt",
    "brandName": "รัฐสภาไทย",
    "category": "National Government Hub",
    "categoryColor": "#EAB308",
    "developer": "รัฐสภาไทย / The Parliament of Thailand",
    "developerSite": "https://www.parliament.go.th/",
    "image": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80",
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
    "location": "Kiak Kai, Samsen Rd, Dusit, Bangkok",
    "lat": 13.7963,
    "lon": 100.5186,
    "desc": "อาคารรัฐสภาไทยแห่งใหม่ริมแม่น้ำเจ้าพระยา ออกแบบด้วยสถาปัตยกรรมไทยร่วมสมัยตามคติเขาพระสุเมรุ เป็นศูนย์กลางฝ่ายนิติบัญญัติของประเทศและอาคารรัฐสภาที่ใหญ่ที่สุดแห่งหนึ่งของโลก",
    "footprint": [
      [100.5170, 13.7946],
      [100.5204, 13.7946],
      [100.5204, 13.7982],
      [100.5170, 13.7982],
      [100.5170, 13.7946]
    ],
    "parts": [
      {
        "name": "Riverside Plaza & Lower Promenade",
        "color": "#CBD5E1",
        "height": 6,
        "min_height": 0,
        "footprint": [
          [100.5162, 13.7946],
          [100.5174, 13.7946],
          [100.5174, 13.7982],
          [100.5162, 13.7982],
          [100.5162, 13.7946]
        ]
      },
      {
        "name": "Main Parliamentary Complex Base (11 Floors)",
        "color": "#D5CAB6",
        "height": 28,
        "min_height": 0,
        "footprint": [
          [100.5172, 13.7944],
          [100.5204, 13.7944],
          [100.5204, 13.7982],
          [100.5172, 13.7982],
          [100.5172, 13.7944]
        ]
      },
      {
        "name": "South Wing - Suryan Chamber (สภาผู้แทนราษฎร)",
        "color": "#C2410C",
        "height": 46,
        "min_height": 26,
        "footprint": [
          [100.5178, 13.7946],
          [100.5198, 13.7946],
          [100.5202, 13.7952],
          [100.5198, 13.7958],
          [100.5178, 13.7958],
          [100.5174, 13.7952],
          [100.5178, 13.7946]
        ]
      },
      {
        "name": "North Wing - Chandra Chamber (วุฒิสภา)",
        "color": "#B45309",
        "height": 46,
        "min_height": 26,
        "footprint": [
          [100.5178, 13.7968],
          [100.5198, 13.7968],
          [100.5202, 13.7974],
          [100.5198, 13.7980],
          [100.5178, 13.7980],
          [100.5174, 13.7974],
          [100.5178, 13.7968]
        ]
      },
      {
        "name": "Central Mount Meru Hall Base (ฐานมณฑปเขาพระสุเมรุ)",
        "color": "#D97706",
        "height": 58,
        "min_height": 28,
        "footprint": [
          [100.5180, 13.7957],
          [100.5196, 13.7957],
          [100.5196, 13.7969],
          [100.5180, 13.7969],
          [100.5180, 13.7957]
        ]
      },
      {
        "name": "Golden Spire Tier 1 (ยอดมณฑปเจดีย์ทองคำ)",
        "color": "#F59E0B",
        "height": 92,
        "min_height": 58,
        "footprint": [
          [100.5183, 13.7960],
          [100.5193, 13.7960],
          [100.5193, 13.7966],
          [100.5183, 13.7966],
          [100.5183, 13.7960]
        ]
      },
      {
        "name": "Golden Spire Peak (ยอดเจดีย์ทองคำ 134m)",
        "color": "#FDE047",
        "height": 134,
        "min_height": 92,
        "footprint": [
          [100.5185, 13.7961],
          [100.5191, 13.7961],
          [100.5191, 13.7965],
          [100.5185, 13.7965],
          [100.5185, 13.7961]
        ]
      },
      {
        "name": "Samsen Forecourt Gateway",
        "color": "#E2E8F0",
        "height": 16,
        "min_height": 0,
        "footprint": [
          [100.5204, 13.7957],
          [100.5212, 13.7957],
          [100.5212, 13.7969],
          [100.5204, 13.7969],
          [100.5204, 13.7957]
        ]
      }
    ],
    "unitTypes": [
      { "label": "ห้องประชุมสุริยัน (สภาผู้แทนราษฎร)", "size": "800 ที่นั่ง" },
      { "label": "ห้องประชุมจันทรา (วุฒิสภา)", "size": "300 ที่นั่ง" },
      { "label": "พิพิธภัณฑ์ประชาธิปไตย", "size": "3,500 m²" }
    ],
    "transport": [
      { "name": "MRT บางโพ (BL09)", "dist": "850 m", "type": "mrt" },
      { "name": "ท่าเรือเกียกกาย (Sappaya Pier)", "dist": "150 m", "type": "boat" },
      { "name": "MRT เตาปูน (BL10/PP16)", "dist": "1.8 km", "type": "mrt" }
    ],
    "nearbyPOIs": [
      { "name": "Chao Phraya Riverfront", "kind": "River", "color": "#0284C7", "lat": 13.7960, "lon": 100.5170, "dist": "100 m" }
    ]
  },
  {
    "id": "the-forestias",
    "name": "The Forestias (MQDC)",
    "brandId": "mqdc",
    "brandName": "MQDC",
    "category": "Forest City Mixed-Use",
    "categoryColor": "#10B981",
    "developer": "MQDC (Magnolia Quality Development)",
    "developerSite": "https://mqdc.com/our-business/theme-project/theforestias",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
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
    "location": "Bang Na-Trat KM 7, Bangkok",
    "lat": 13.6582,
    "lon": 100.6720,
    "desc": "โครงการมิกซ์ยูสเมืองในป่าแห่งแรกของโลก พื้นที่กว่า 398 ไร่ พร้อมผืนป่าขนาด 30 ไร่ใจกลางโครงการ รวมที่อยู่อาศัยระดับ Ultra Luxury: Six Senses Residences, Mulberry Grove, The Aspen Tree และ Whizdom",
    "footprint": [
      [100.6700, 13.6565],
      [100.6745, 13.6565],
      [100.6745, 13.6605],
      [100.6700, 13.6605],
      [100.6700, 13.6565]
    ],
    "parts": [
      {
        "name": "30-Rai Central Forest Biosphere Canopy",
        "color": "#047857",
        "height": 18,
        "min_height": 0,
        "footprint": [
          [100.6695, 13.6560],
          [100.6750, 13.6560],
          [100.6750, 13.6610],
          [100.6695, 13.6610],
          [100.6695, 13.6560]
        ]
      },
      {
        "name": "Six Senses & Mulberry Grove Luxury Villas",
        "color": "#78350F",
        "height": 40,
        "min_height": 0,
        "footprint": [
          [100.6700, 13.6565],
          [100.6722, 13.6565],
          [100.6722, 13.6585],
          [100.6700, 13.6585],
          [100.6700, 13.6565]
        ]
      },
      {
        "name": "Whizdom Forest Condominium Towers (180m)",
        "color": "#10B981",
        "height": 180,
        "min_height": 18,
        "footprint": [
          [100.6725, 13.6585],
          [100.6745, 13.6585],
          [100.6745, 13.6605],
          [100.6725, 13.6605],
          [100.6725, 13.6585]
        ]
      },
      {
        "name": "The Aspen Tree Wellness Tower (120m)",
        "color": "#059669",
        "height": 120,
        "min_height": 18,
        "footprint": [
          [100.6725, 13.6565],
          [100.6745, 13.6565],
          [100.6745, 13.6582],
          [100.6725, 13.6582],
          [100.6725, 13.6565]
        ]
      }
    ],
    "unitTypes": [
      { "label": "Whizdom Condominium", "size": "34 – 150 m²" },
      { "label": "Mulberry Grove Villas", "size": "1,000 – 1,700 m²" },
      { "label": "Six Senses Residences", "size": "790 – 1,400 m²" },
      { "label": "The Aspen Tree (Wellness)", "size": "83 – 250 m²" }
    ],
    "transport": [
      { "name": "MRT ศรีเอี่ยม (YL17)", "dist": "1.9 km", "type": "mrt" },
      { "name": "BTS บางนา (E13)", "dist": "6.5 km", "type": "bts" }
    ],
    "nearbyPOIs": [
      { "name": "Mega Bangna", "kind": "Shopping", "color": "#059669", "lat": 13.6465, "lon": 100.6805, "dist": "1.5 km" }
    ]
  },
  {
    "id": "em-district",
    "name": "The EM District (EmSphere / EmQuartier)",
    "brandId": "themall",
    "brandName": "The Mall Group",
    "category": "World Retail & Entertainment",
    "categoryColor": "#EC4899",
    "developer": "The Mall Group",
    "developerSite": "https://emsphere.co.th/",
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
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
    "location": "Sukhumvit Rd, Phrom Phong, Bangkok",
    "lat": 13.7315,
    "lon": 100.5695,
    "desc": "ย่านการค้าและบันเทิงระดับโลกใจกลางสุขุมวิท ประกอบด้วย Emporium, EmQuartier และ EmSphere พร้อม UOB Live Arena ความจุ 6,000 ที่นั่ง และ IKEA City Store",
    "footprint": [
      [100.5678, 13.7298],
      [100.5712, 13.7298],
      [100.5712, 13.7332],
      [100.5678, 13.7332],
      [100.5678, 13.7298]
    ],
    "parts": [
      {
        "name": "EmSphere Retail Podium & Glass Dome",
        "color": "#DB2777",
        "height": 42,
        "min_height": 0,
        "footprint": [
          [100.5678, 13.7298],
          [100.5712, 13.7298],
          [100.5712, 13.7332],
          [100.5678, 13.7332],
          [100.5678, 13.7298]
        ]
      },
      {
        "name": "UOB Live Arena & Sphere Hall",
        "color": "#9D174D",
        "height": 75,
        "min_height": 40,
        "footprint": [
          [100.5682, 13.7318],
          [100.5702, 13.7318],
          [100.5702, 13.7330],
          [100.5682, 13.7330],
          [100.5682, 13.7318]
        ]
      },
      {
        "name": "Bhiraj Tower Skyscraper (165m)",
        "color": "#0284C7",
        "height": 165,
        "min_height": 40,
        "footprint": [
          [100.5695, 13.7302],
          [100.5708, 13.7302],
          [100.5708, 13.7315],
          [100.5695, 13.7315],
          [100.5695, 13.7302]
        ]
      }
    ],
    "unitTypes": [
      { "label": "EmSphere Retail & Dining", "size": "200,000 m²" },
      { "label": "UOB Live Arena", "size": "6,000 Seats" },
      { "label": "IKEA Sukhumvit", "size": "12,000 m²" }
    ],
    "transport": [
      { "name": "BTS พร้อมพงษ์ (E5) Skywalk Direct", "dist": "50 m", "type": "bts" },
      { "name": "MRT สุขุมวิท (BL22)", "dist": "1.1 km", "type": "mrt" }
    ],
    "nearbyPOIs": [
      { "name": "Benjasiri Park", "kind": "Park", "color": "#059669", "lat": 13.7305, "lon": 100.5678, "dist": "50 m" }
    ]
  },
  {
    "id": "central-embassy",
    "name": "Central Embassy & Ploenchit",
    "brandId": "cpn",
    "brandName": "Central Group",
    "category": "Ultra-Luxury Retail & Hotel",
    "categoryColor": "#8B5CF6",
    "developer": "Central Group",
    "developerSite": "https://www.centralembassy.com/",
    "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
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
    "location": "Ploenchit Rd, Pathum Wan, Bangkok",
    "lat": 13.7442,
    "lon": 100.5465,
    "desc": "แลนด์มาร์กอัลตร้าลักชัวรีรูปทรงอินฟินิตี้บนที่ดินสถานทูตอังกฤษเดิม รวมแฟลกชิปสโตร์ระดับไฮเอนด์ ศูนย์รวมศิลปะ OPEN HOUSE และโรงแรม 6 ดาว Park Hyatt Bangkok",
    "footprint": [
      [100.5452, 13.7432],
      [100.5480, 13.7432],
      [100.5480, 13.7455],
      [100.5452, 13.7455],
      [100.5452, 13.7432]
    ],
    "parts": [
      {
        "name": "Central Embassy Infinity Loop Retail Base",
        "color": "#E2E8F0",
        "height": 35,
        "min_height": 0,
        "footprint": [
          [100.5452, 13.7432],
          [100.5480, 13.7432],
          [100.5480, 13.7455],
          [100.5452, 13.7455],
          [100.5452, 13.7432]
        ]
      },
      {
        "name": "Park Hyatt Bangkok Hotel Tower (154m)",
        "color": "#7C3AED",
        "height": 154,
        "min_height": 35,
        "footprint": [
          [100.5458, 13.7436],
          [100.5472, 13.7436],
          [100.5472, 13.7448],
          [100.5458, 13.7448],
          [100.5458, 13.7436]
        ]
      }
    ],
    "unitTypes": [
      { "label": "Park Hyatt Bangkok Hotel", "size": "222 Rooms" },
      { "label": "OPEN HOUSE Art & Books", "size": "4,600 m²" }
    ],
    "transport": [
      { "name": "BTS เพลินจิต (E2) Skybridge", "dist": "100 m", "type": "bts" },
      { "name": "BTS ชิดลม (E1)", "dist": "350 m", "type": "bts" }
    ],
    "nearbyPOIs": [
      { "name": "Central Chidlom", "kind": "Shopping", "color": "#059669", "lat": 13.7441, "lon": 100.5432, "dist": "300 m" }
    ]
  },
  {
    "id": "krungthep-aphiwat",
    "name": "สถานีกลางกรุงเทพอภิวัฒน์ (Grand Central)",
    "brandId": "govt",
    "brandName": "SRT การรถไฟฯ",
    "category": "National Transit Megahub",
    "categoryColor": "#0284C7",
    "developer": "การรถไฟแห่งประเทศไทย (SRT)",
    "developerSite": "https://www.railway.co.th/",
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
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
    "location": "Bang Sue, Chatuchak, Bangkok",
    "lat": 13.8035,
    "lon": 100.5398,
    "desc": "ศูนย์กลางการขนส่งระบบรางที่ใหญ่ที่สุดในเอเชียตะวันออกเฉียงใต้ 24 ชานชาลา รองรับรถไฟทางไกล รถไฟชานเมืองสายสีแดง รถไฟฟ้าความเร็วสูงเชื่อม 3 สนามบิน และรถไฟฟ้า MRT สายสีน้ำเงิน",
    "footprint": [
      [100.5370, 13.7995],
      [100.5425, 13.7995],
      [100.5425, 13.8075],
      [100.5370, 13.8075],
      [100.5370, 13.7995]
    ],
    "parts": [
      {
        "name": "24-Platform Vaulted Roof Terminal Hall",
        "color": "#0284C7",
        "height": 42,
        "min_height": 0,
        "footprint": [
          [100.5370, 13.7995],
          [100.5425, 13.7995],
          [100.5425, 13.8075],
          [100.5370, 13.8075],
          [100.5370, 13.7995]
        ]
      },
      {
        "name": "Central Transit Clock Tower & Office Atrium (95m)",
        "color": "#0369A1",
        "height": 95,
        "min_height": 42,
        "footprint": [
          [100.5390, 13.8025],
          [100.5406, 13.8025],
          [100.5406, 13.8045],
          [100.5390, 13.8045],
          [100.5390, 13.8025]
        ]
      }
    ],
    "unitTypes": [
      { "label": "ชานชาลารถไฟทางไกล & ชานเมือง (24 ชานชาลา)", "size": "274,192 m²" }
    ],
    "transport": [
      { "name": "SRT สายสีแดงเข้ม / สีแดงอ่อน", "dist": "0 m", "type": "bts" },
      { "name": "MRT บางซื่อ (BL11)", "dist": "50 m", "type": "mrt" }
    ],
    "nearbyPOIs": [
      { "name": "Chatuchak Weekend Market", "kind": "Market", "color": "#D97706", "lat": 13.7995, "lon": 100.5505, "dist": "1.2 km" }
    ]
  },
  {
    "id": "true-digital-park",
    "name": "True Digital Park (TDPK)",
    "brandId": "mqdc",
    "brandName": "MQDC & True",
    "category": "Tech & Innovation Campus",
    "categoryColor": "#F97316",
    "developer": "MQDC & True Corporation",
    "developerSite": "https://www.truedigitalpark.com/",
    "image": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
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
    "location": "Sukhumvit 101, Punnawithi, Bangkok",
    "lat": 13.6872,
    "lon": 100.6110,
    "desc": "ศูนย์กลางเทคและสตาร์ทอัพที่ใหญ่ที่สุดในเอเชียตะวันออกเฉียงใต้ พื้นที่มิกซ์ยูสผสาน Co-working, สถาบันบ่มเพาะธุรกิจดิจิทัล 101 True Digital Park Retail และคอนโดมิเนียม Whizdom 101",
    "footprint": [
      [100.6092, 13.6855],
      [100.6128, 13.6855],
      [100.6128, 13.6892],
      [100.6092, 13.6892],
      [100.6092, 13.6855]
    ],
    "parts": [
      {
        "name": "101 The Third Place Lifestyle Open-Air Base",
        "color": "#EA580C",
        "height": 25,
        "min_height": 0,
        "footprint": [
          [100.6092, 13.6855],
          [100.6128, 13.6855],
          [100.6128, 13.6892],
          [100.6092, 13.6892],
          [100.6092, 13.6855]
        ]
      },
      {
        "name": "Tech Startup Campus & Innovation Hall",
        "color": "#F97316",
        "height": 65,
        "min_height": 25,
        "footprint": [
          [100.6100, 13.6860],
          [100.6120, 13.6860],
          [100.6120, 13.6878],
          [100.6100, 13.6878],
          [100.6100, 13.6860]
        ]
      },
      {
        "name": "Whizdom 101 Connect & Inspire Tower (125m)",
        "color": "#0284C7",
        "height": 125,
        "min_height": 25,
        "footprint": [
          [100.6102, 13.6878],
          [100.6118, 13.6878],
          [100.6118, 13.6890],
          [100.6102, 13.6890],
          [100.6102, 13.6878]
        ]
      }
    ],
    "unitTypes": [
      { "label": "Tech Startup & VC Campus", "size": "77,000 m²" },
      { "label": "101 The Third Place Retail", "size": "40,000 m²" }
    ],
    "transport": [
      { "name": "BTS ปุณณวิถี (E11) Skywalk", "dist": "250 m", "type": "bts" },
      { "name": "BTS อุดมสุข (E12)", "dist": "650 m", "type": "bts" }
    ],
    "nearbyPOIs": [
      { "name": "101 The Third Place", "kind": "Mall", "color": "#059669", "lat": 13.6870, "lon": 100.6105, "dist": "50 m" }
    ]
  }
];

  function buildLandmarksGeoJSON() {
    var polygonFeatures = [];
    var pointFeatures = [];

    LANDMARKS.forEach(function(lm) {
      if (lm.parts && lm.parts.length > 0) {
        lm.parts.forEach(function(part, pIdx) {
          polygonFeatures.push({
            type: "Feature",
            id: lm.id + "-part-" + pIdx,
            properties: {
              id: lm.id,
              name: lm.name,
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
