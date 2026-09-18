/**
 * bkk-landmark-icons.js
 * ภาพวาดสถานที่สำคัญ 26 แห่งบนแผนที่ "กรุงเทพฯ ทะลุมิติ" — หน้าตาแบบแผนที่ Google (ภาพสี + ขอบขาว + ชื่อใต้ภาพ)
 * ภาพทุกภาพวาดใหม่ในไฟล์นี้เป็น SVG ไม่ได้ใช้ภาพของ Google · พิกัดจาก OpenStreetMap (Nominatim) 17 ก.ย. 2569
 *
 * ใช้งาน: window.BKK_LANDMARK_ICONS.mount(map) หลังแผนที่พร้อม — เรียกซ้ำได้ทุกครั้งที่สลับธีม
 *         สวิตช์ #toggleLandmarkIcons ในแผง Ashton เปิด/ปิดชั้นนี้
 */
(function () {
  "use strict";

  // g = กลุ่ม (temple / mall / monument / transit / park) · mall ซ่อนตั้งแต่ระดับ 12 เพราะหมุดห้างร้านรับช่วงต่อ
  var LM = [
    { id: "watarun",      th: "วัดอรุณราชวราราม",          en: "Wat Arun",                        g: "temple",   lo: 100.488514, la: 13.743898 },
    { id: "grandpalace",  th: "วัดพระแก้ว · พระบรมมหาราชวัง", en: "Wat Phra Kaew & Grand Palace",   g: "temple",   lo: 100.492659, la: 13.751497 },
    { id: "watpho",       th: "วัดโพธิ์",                   en: "Wat Pho",                         g: "temple",   lo: 100.492738, la: 13.746346 },
    { id: "goldenmount",  th: "ภูเขาทอง วัดสระเกศ",          en: "Golden Mount (Wat Saket)",        g: "temple",   lo: 100.506694, la: 13.753849 },
    { id: "watbencha",    th: "วัดเบญจมบพิตร",              en: "Wat Benchamabophit",              g: "temple",   lo: 100.513807, la: 13.766175 },
    { id: "giantswing",   th: "เสาชิงช้า",                  en: "Giant Swing",                     g: "temple",   lo: 100.501278, la: 13.751814 },
    { id: "asiatique",    th: "เอเชียทีค",                  en: "Asiatique The Riverfront",        g: "tourism",  lo: 100.502714, la: 13.704157 },
    { id: "iconsiam",     th: "ไอคอนสยาม",                 en: "ICONSIAM",                        g: "mall",     lo: 100.510294, la: 13.726823 },
    { id: "centralworld", th: "เซ็นทรัลเวิลด์",              en: "centralwOrld",                    g: "mall",     lo: 100.539041, la: 13.746577 },
    { id: "paragon",      th: "สยามพารากอน",               en: "Siam Paragon",                    g: "mall",     lo: 100.534954, la: 13.746778 },
    { id: "mbk",          th: "เอ็ม บี เค เซ็นเตอร์",         en: "MBK Center",                      g: "mall",     lo: 100.529916, la: 13.744715 },
    { id: "chatuchak",    th: "ตลาดนัดจตุจักร",              en: "Chatuchak Weekend Market",        g: "tourism",  lo: 100.551123, la: 13.800265 },
    { id: "chinatowngate",th: "ซุ้มประตูเยาวราช",            en: "Chinatown Gate (Odeon Circle)",   g: "tourism",  lo: 100.513093, la: 13.737180 },
    { id: "democracy",    th: "อนุสาวรีย์ประชาธิปไตย",        en: "Democracy Monument",              g: "monument", lo: 100.501841, la: 13.756666 },
    { id: "victory",      th: "อนุสาวรีย์ชัยสมรภูมิ",         en: "Victory Monument",                g: "monument", lo: 100.538286, la: 13.764931 },
    { id: "mahanakhon",   th: "คิง เพาเวอร์ มหานคร",         en: "King Power Mahanakhon",           g: "monument", lo: 100.528223, la: 13.723407 },
    { id: "parliament",   th: "สัปปายะสภาสถาน",             en: "Sappaya-Sapasathan (Parliament)", g: "monument", lo: 100.517327, la: 13.795969 },
    { id: "rama8",        th: "สะพานพระราม 8",              en: "Rama VIII Bridge",                g: "monument", lo: 100.496747, la: 13.769181 },
    { id: "bacc",         th: "หอศิลปกรุงเทพฯ",             en: "Bangkok Art and Culture Centre",  g: "monument", lo: 100.530263, la: 13.746778 },
    { id: "suvarnabhumi", th: "ท่าอากาศยานสุวรรณภูมิ",        en: "Suvarnabhumi Airport",            g: "transit",  lo: 100.751084, la: 13.691619 },
    { id: "donmueang",    th: "ท่าอากาศยานดอนเมือง",         en: "Don Mueang Airport",              g: "transit",  lo: 100.603531, la: 13.912221 },
    { id: "aphiwat",      th: "สถานีกลางกรุงเทพอภิวัฒน์",     en: "Krung Thep Aphiwat Central Terminal", g: "transit", lo: 100.541865, la: 13.803976 },
    { id: "hualamphong",  th: "สถานีหัวลำโพง",              en: "Hua Lamphong Station",            g: "transit",  lo: 100.517003, la: 13.740669 },
    { id: "lumphini",     th: "สวนลุมพินี",                 en: "Lumphini Park",                   g: "park",     lo: 100.541538, la: 13.730600 },
    { id: "benjakitti",   th: "สวนป่าเบญจกิติ",              en: "Benchakitti Forest Park",         g: "park",     lo: 100.554764, la: 13.729082 },
    { id: "stadium",      th: "สนามศุภชลาศัย",              en: "Suphachalasai Stadium",           g: "park",     lo: 100.525653, la: 13.745394 }
  ];
  var GROUP_TH = { temple: "วัดและพระราชวัง", tourism: "ที่เที่ยว", mall: "ห้าง", monument: "อนุสาวรีย์และตึกสำคัญ", transit: "สนามบินและสถานี", park: "สวนและสนามกีฬา" };

  /* ── ภาพวาด 48×48 (ฐานภาพอยู่ขอบล่าง = จุดยึดบนแผนที่) ───────────────── */
  var GOLD = "#E8B33A", GOLD_D = "#C9971F", CREAM = "#F4E7C8", CREAM_D = "#DCC89C",
      RED = "#C62828", ROOF = "#D9573B", GREEN = "#3F8F5A", GLASS = "#7FB2F0", GLASS_D = "#4F86D6",
      STONE = "#B0BEC5", STONE_D = "#78909C", LEAF = "#43A047", LEAF_D = "#2E7D32", WATER = "#4FC3F7";

  function planeSVG(x, y, s, fill) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ') rotate(-16)">' +
      '<rect x="-15" y="-2" width="30" height="4" rx="2" fill="' + fill + '"/>' +
      '<path d="M-3 -1.5 L5 -11 L8 -11 L4 -1.5Z M-3 1.5 L5 11 L8 11 L4 1.5Z" fill="' + fill + '"/>' +
      '<path d="M-13 -1.5 L-16 -7 L-13.5 -7 L-9 -1.5Z" fill="' + fill + '"/></g>';
  }

  var SVG = {
    watarun:
      '<rect x="5" y="39" width="38" height="5" rx="1" fill="' + CREAM_D + '"/>' +
      '<path d="M8 39 L9.8 29 L11.5 23 L13.2 29 L15 39Z" fill="' + CREAM + '"/>' +
      '<path d="M33 39 L34.8 29 L36.5 23 L38.2 29 L40 39Z" fill="' + CREAM + '"/>' +
      '<path d="M24 2 L25.6 9 L27.2 17 L28.8 27 L31 39 H17 L19.2 27 L20.8 17 L22.4 9Z" fill="' + CREAM + '"/>' +
      '<path d="M22.4 9h3.2 M20.8 17h6.4 M19.9 22h8.2 M19.2 27h9.6 M18.2 33h11.6" stroke="' + CREAM_D + '" stroke-width="1.2"/>' +
      '<circle cx="22" cy="19.5" r=".9" fill="#E57373"/><circle cx="26" cy="19.5" r=".9" fill="#4FA3E0"/>' +
      '<circle cx="21" cy="24.5" r=".9" fill="#4FA3E0"/><circle cx="24" cy="24.5" r=".9" fill="#81C784"/><circle cx="27" cy="24.5" r=".9" fill="#E57373"/>' +
      '<circle cx="21" cy="30" r=".9" fill="#E57373"/><circle cx="24" cy="30" r=".9" fill="#FFB74D"/><circle cx="27" cy="30" r=".9" fill="#4FA3E0"/>' +
      '<path d="M24 0.5 V4" stroke="' + GOLD_D + '" stroke-width="1.2"/>',

    grandpalace:
      '<rect x="8" y="31" width="32" height="12" fill="#FAF6EC"/>' +
      '<path d="M12 33v8 M16 33v8 M32 33v8 M36 33v8" stroke="' + CREAM_D + '" stroke-width="1.2"/>' +
      '<rect x="21" y="34" width="6" height="9" rx="3" fill="' + GOLD + '"/>' +
      '<path d="M3 32 L24 17 L45 32Z" fill="' + ROOF + '"/><path d="M9 32 L24 21 L39 32Z" fill="' + GREEN + '"/>' +
      '<path d="M9 24 L24 11 L39 24Z" fill="' + ROOF + '"/><path d="M14 24 L24 15 L34 24Z" fill="' + GREEN + '"/>' +
      '<path d="M3 32 q-1.5-3 1-4.5 M45 32 q1.5-3-1-4.5 M9 24 q-1.5-3 1-4 M39 24 q1.5-3-1-4" stroke="' + GOLD + '" stroke-width="1.4" fill="none"/>' +
      '<path d="M21.5 12.5 L24 1 L26.5 12.5Z" fill="' + GOLD + '"/><rect x="20.5" y="11.5" width="7" height="2" fill="' + GOLD_D + '"/>',

    watpho:
      '<rect x="2" y="38" width="44" height="5" rx="1" fill="#A1887F"/>' +
      '<rect x="3" y="28" width="8" height="10" rx="2.5" fill="' + ROOF + '"/>' +
      '<path d="M8 38 C8 31 13 29 19 29.5 L38 30 C42.5 30 45 32 45 35 L45 38Z" fill="' + GOLD + '"/>' +
      '<circle cx="10.5" cy="25.5" r="4.6" fill="' + GOLD + '"/><path d="M8.6 21.6 L10.5 15 L12.4 21.6Z" fill="' + GOLD_D + '"/>' +
      '<path d="M18 33.5 H40 M22 36 H43" stroke="' + GOLD_D + '" stroke-width="1"/>' +
      '<path d="M41 30.5 q3-4 4.5-1" stroke="' + GOLD_D + '" stroke-width="1.2" fill="none"/>',

    goldenmount:
      '<path d="M1 44 C7 34 13 27.5 24 27.5 C35 27.5 41 34 47 44Z" fill="#6DAE5B"/>' +
      '<circle cx="11" cy="38" r="2.6" fill="' + LEAF_D + '"/><circle cx="18" cy="34" r="2.4" fill="' + LEAF_D + '"/>' +
      '<circle cx="31" cy="34" r="2.4" fill="' + LEAF_D + '"/><circle cx="38" cy="38.5" r="2.6" fill="' + LEAF_D + '"/>' +
      '<rect x="14" y="26" width="20" height="3" fill="#FAF6EC"/><rect x="16" y="23.5" width="16" height="3" fill="' + GOLD_D + '"/>' +
      '<path d="M18 24 C18 17.5 21 15 24 15 C27 15 30 17.5 30 24Z" fill="' + GOLD + '"/>' +
      '<path d="M22.4 15.5 L24 3 L25.6 15.5Z" fill="' + GOLD + '"/><path d="M21.5 11h5 M22.2 8h3.6" stroke="' + GOLD_D + '" stroke-width="1"/>',

    watbencha:
      '<rect x="8" y="30" width="32" height="13" fill="#FFFFFF" stroke="#CFD8DC" stroke-width=".8"/>' +
      '<rect x="12" y="33" width="3" height="6" rx="1.5" fill="' + GOLD + '"/><rect x="33" y="33" width="3" height="6" rx="1.5" fill="' + GOLD + '"/>' +
      '<rect x="21" y="33" width="6" height="10" rx="3" fill="#8D6E63"/>' +
      '<path d="M3 31 L24 16 L45 31Z" fill="' + RED + '"/><path d="M11 31 L24 21.5 L37 31Z" fill="#FFFFFF" stroke="' + GOLD + '" stroke-width="1"/>' +
      '<path d="M10 22 L24 9 L38 22Z" fill="' + RED + '"/><path d="M16 22 L24 14.5 L32 22Z" fill="#FFFFFF" stroke="' + GOLD + '" stroke-width="1"/>' +
      '<path d="M3 31 q-1.5-3 1-4.5 M45 31 q1.5-3-1-4.5 M24 9 V4" stroke="' + GOLD + '" stroke-width="1.4" fill="none"/>',

    giantswing:
      '<rect x="7" y="41" width="34" height="3" rx="1" fill="#9E9E9E"/>' +
      '<rect x="12.5" y="9" width="3.6" height="32" fill="' + RED + '"/><rect x="31.9" y="9" width="3.6" height="32" fill="' + RED + '"/>' +
      '<path d="M8 10 H40 L37.5 5.5 H10.5Z" fill="' + RED + '"/>' +
      '<path d="M10.5 5.5 Q24 -1.5 37.5 5.5" stroke="' + GOLD + '" stroke-width="1.6" fill="none"/>' +
      '<rect x="12.5" y="29" width="23" height="2.2" fill="#8E1B1B"/>' +
      '<path d="M16 14 L20 10 M32 14 L28 10" stroke="#8E1B1B" stroke-width="1.4"/>',

    asiatique:
      '<rect x="9" y="41.5" width="30" height="2.6" rx="1" fill="#546E7A"/>' +
      '<path d="M24 20 L14.5 42 M24 20 L33.5 42" stroke="#546E7A" stroke-width="2.4" stroke-linecap="round"/>' +
      '<circle cx="24" cy="20" r="15" fill="none" stroke="#1E88E5" stroke-width="2.2"/>' +
      '<path d="M24 5 V35 M9 20 H39 M13.4 9.4 L34.6 30.6 M34.6 9.4 L13.4 30.6" stroke="#90CAF9" stroke-width="1"/>' +
      '<circle cx="24" cy="20" r="2.4" fill="#1E88E5"/>' +
      '<circle cx="24" cy="5" r="2.1" fill="#E53935"/><circle cx="39" cy="20" r="2.1" fill="#FDD835"/><circle cx="24" cy="35" r="2.1" fill="#43A047"/><circle cx="9" cy="20" r="2.1" fill="#FB8C00"/>' +
      '<circle cx="34.6" cy="9.4" r="2.1" fill="#8E24AA"/><circle cx="34.6" cy="30.6" r="2.1" fill="#E53935"/><circle cx="13.4" cy="30.6" r="2.1" fill="#FDD835"/><circle cx="13.4" cy="9.4" r="2.1" fill="#43A047"/>',

    iconsiam:
      '<path d="M13 42 V13 L18.5 5.5 V42Z" fill="' + GLASS + '"/><path d="M18.5 42 V5.5 L24 13 V42Z" fill="' + GLASS_D + '"/>' +
      '<path d="M25 42 V19 L30.5 12.5 V42Z" fill="' + GLASS + '"/><path d="M30.5 42 V12.5 L36 19 V42Z" fill="' + GLASS_D + '"/>' +
      '<path d="M14.5 18h3 M14.5 23h3 M14.5 28h3 M26.5 24h3 M26.5 29h3" stroke="#FFFFFF" stroke-width=".9" opacity=".8"/>' +
      '<path d="M2 44 C9 33 17 36 24 38 C31 40 39 33 46 35.5 V44Z" fill="' + GOLD + '"/>' +
      '<path d="M2 44 C9 37 17 39 24 41 C31 43 39 38 46 39.5 V44Z" fill="' + GOLD_D + '"/>',

    centralworld:
      '<rect x="28" y="5" width="11" height="34" rx="1" fill="#607D8B"/>' +
      '<path d="M30 9h7 M30 13h7 M30 17h7 M30 21h7 M30 25h7" stroke="#B0BEC5" stroke-width="1.2"/>' +
      '<rect x="4" y="22" width="32" height="21" rx="1.5" fill="#4FA3E0"/>' +
      '<path d="M4 27 H36 M4 32 H36 M4 37 H36" stroke="#FFFFFF" stroke-width=".8" opacity=".7"/>' +
      '<rect x="13" y="25.5" width="14" height="13" rx="2" fill="#FFFFFF"/>' +
      '<path d="M15.5 29 H24.5 L23.5 36 H16.5Z" fill="#E53935"/><path d="M17.8 29 C17.8 26.6 22.2 26.6 22.2 29" stroke="#E53935" stroke-width="1.2" fill="none"/>',

    paragon:
      '<path d="M3 43 V27 C10 18 38 18 45 27 V43Z" fill="' + GLASS + '"/>' +
      '<path d="M3 27 C10 18 38 18 45 27" stroke="' + GOLD + '" stroke-width="2" fill="none"/>' +
      '<path d="M10 22.5 V43 M17 20.5 V43 M24 20 V43 M31 20.5 V43 M38 22.5 V43" stroke="#FFFFFF" stroke-width=".9" opacity=".75"/>' +
      '<path d="M3 32 C12 28 36 28 45 32" stroke="#FFFFFF" stroke-width=".9" fill="none" opacity=".75"/>' +
      '<rect x="17" y="36" width="14" height="7" rx="1" fill="#37474F"/><rect x="15" y="34.5" width="18" height="2" fill="' + GOLD + '"/>',

    mbk:
      '<rect x="3" y="14" width="42" height="29" rx="1.5" fill="#90A4AE"/>' +
      '<rect x="3" y="14" width="42" height="6" rx="1.5" fill="#2E9D5B"/>' +
      '<rect x="3" y="24" width="42" height="3" fill="#607D8B"/><rect x="3" y="31" width="42" height="3" fill="#607D8B"/>' +
      '<path d="M9 16.5h30" stroke="#FFFFFF" stroke-width="1.4"/>' +
      '<rect x="18" y="37" width="12" height="6" fill="#37474F"/>',

    chatuchak:
      '<path d="M2 43 L6.5 35.5 L11 43Z" fill="#E57373"/><path d="M9 43 L13.5 36.5 L18 43Z" fill="#FFB74D"/>' +
      '<path d="M30 43 L34.5 36.5 L39 43Z" fill="#4FC3F7"/><path d="M37 43 L41.5 35.5 L46 43Z" fill="#81C784"/>' +
      '<path d="M19.5 43 V17 H28.5 V43Z" fill="#8D6E63"/><path d="M21.5 22h5 M21.5 27h5 M21.5 32h5" stroke="#6D4C41" stroke-width="1"/>' +
      '<circle cx="24" cy="15" r="5.6" fill="#FFFFFF" stroke="#5D4037" stroke-width="1.6"/>' +
      '<path d="M24 15 V11.8 M24 15 L26.4 16.4" stroke="#37474F" stroke-width="1.2" stroke-linecap="round"/>' +
      '<path d="M17.5 10.5 L24 2.5 L30.5 10.5Z" fill="' + RED + '"/>',

    chinatowngate:
      '<rect x="7" y="41.5" width="34" height="2.6" rx="1" fill="#9E9E9E"/>' +
      '<rect x="10.5" y="19" width="4.5" height="23" fill="' + RED + '"/><rect x="33" y="19" width="4.5" height="23" fill="' + RED + '"/>' +
      '<rect x="15" y="23" width="18" height="3.5" fill="' + RED + '"/>' +
      '<rect x="9" y="17.5" width="30" height="4.5" fill="' + GOLD + '"/><rect x="19.5" y="18.3" width="9" height="2.9" fill="' + RED + '"/>' +
      '<path d="M3 18 H45 L41 12.5 H7Z" fill="' + LEAF_D + '"/>' +
      '<path d="M3 18 q-1.6-3.2 1.6-4.6 M45 18 q1.6-3.2-1.6-4.6" stroke="' + GOLD + '" stroke-width="1.5" fill="none"/>' +
      '<path d="M12 12.5 H36 L33 7 H15Z" fill="' + LEAF_D + '"/><circle cx="24" cy="5.5" r="1.8" fill="' + GOLD + '"/>',

    democracy:
      '<rect x="2" y="41" width="44" height="3" rx="1" fill="#BCAAA4"/>' +
      '<path d="M14 41 L16 19 L19 19 L19.5 41Z" fill="' + CREAM_D + '"/><path d="M34 41 L32 19 L29 19 L28.5 41Z" fill="' + CREAM_D + '"/>' +
      '<path d="M5 41 L8.5 12 L13.5 12 L12.5 41Z" fill="' + CREAM + '"/><path d="M43 41 L39.5 12 L34.5 12 L35.5 41Z" fill="' + CREAM + '"/>' +
      '<rect x="19.5" y="25" width="9" height="16" fill="' + CREAM + '"/>' +
      '<path d="M19.5 25 Q24 17 28.5 25Z" fill="' + GOLD + '"/>' +
      '<rect x="21.3" y="15.3" width="5.4" height="3" rx=".6" fill="' + GOLD + '"/><rect x="22" y="36" width="4" height="5" fill="#A1887F"/>',

    victory:
      '<ellipse cx="24" cy="42.5" rx="21" ry="2.8" fill="#6DAE5B"/>' +
      '<path d="M13 42 L15.5 35 H32.5 L35 42Z" fill="#8D8D8D"/>' +
      '<rect x="17" y="36.5" width="2" height="4" fill="#455A64"/><rect x="23" y="36.5" width="2" height="4" fill="#455A64"/><rect x="29" y="36.5" width="2" height="4" fill="#455A64"/>' +
      '<path d="M22 35.5 L22.6 11 L24 2 L25.4 11 L26 35.5Z" fill="' + STONE + '"/>' +
      '<path d="M22 35.5 L18.6 29 L22.3 19Z" fill="' + STONE_D + '"/><path d="M26 35.5 L29.4 29 L25.7 19Z" fill="' + STONE_D + '"/>',

    mahanakhon:
      '<path d="M16.5 44 V3 H31.5 V44Z" fill="#A9CDF0"/><path d="M24 3 V44" stroke="#FFFFFF" stroke-width=".7" opacity=".7"/>' +
      '<rect x="16.5" y="7" width="4.5" height="3.2" fill="#5C6B7A"/><rect x="27" y="11" width="4.5" height="3.2" fill="#5C6B7A"/>' +
      '<rect x="16.5" y="16" width="4.5" height="3.2" fill="#5C6B7A"/><rect x="27" y="20.5" width="4.5" height="3.2" fill="#5C6B7A"/>' +
      '<rect x="16.5" y="25.5" width="4.5" height="3.2" fill="#5C6B7A"/><rect x="27" y="30" width="4.5" height="3.2" fill="#5C6B7A"/>' +
      '<rect x="16.5" y="34.5" width="4.5" height="3.2" fill="#5C6B7A"/>' +
      '<path d="M18 13h12 M18 22.5h12 M18 32h12" stroke="#7FA6CC" stroke-width=".8"/>',

    parliament:
      '<rect x="2" y="36" width="44" height="7.5" fill="#D7CCC8"/>' +
      '<path d="M6 38v4 M10 38v4 M14 38v4 M34 38v4 M38 38v4 M42 38v4" stroke="#A1887F" stroke-width="1.1"/>' +
      '<rect x="20" y="38" width="8" height="5.5" fill="#8D6E63"/>' +
      '<path d="M9.5 36.5 L24 8 L38.5 36.5Z" fill="' + GOLD + '"/>' +
      '<path d="M12.6 30.5h22.8 M16 24h16 M19.3 17.5h9.4" stroke="' + GOLD_D + '" stroke-width="1.3"/>' +
      '<path d="M22.8 9.5 L24 1.5 L25.2 9.5Z" fill="' + GOLD + '"/>',

    rama8:
      '<path d="M2 40 q3-2 6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 V45 H2Z" fill="' + WATER + '"/>' +
      '<path d="M24 7 L3 31.5 M24 9.5 L8 31.5 M24 12 L13 31.5 M24 7 L45 31.5 M24 9.5 L40 31.5 M24 12 L35 31.5" stroke="#F2C94C" stroke-width=".9"/>' +
      '<rect x="1" y="31" width="46" height="3.4" rx="1" fill="#78909C"/>' +
      '<path d="M24 3 L21.5 14 L16 41 H19.6 L24 22.5 L28.4 41 H32 L26.5 14Z" fill="#F2C94C"/>',

    bacc:
      '<path d="M8 14 V43 H40 V14Z" fill="#ECEFF1"/>' +
      '<ellipse cx="24" cy="14" rx="16" ry="4.2" fill="#CFD8DC"/>' +
      '<path d="M8 22 C8 26.2 40 26.2 40 22 M8 30 C8 34.2 40 34.2 40 30" stroke="#B0BEC5" stroke-width="1.1" fill="none"/>' +
      '<path d="M17 27 H31 V43 H17Z" fill="' + GLASS + '"/><path d="M24 27 V43" stroke="#FFFFFF" stroke-width=".8"/>' +
      '<path d="M8 43 H40" stroke="#90A4AE" stroke-width="1.2"/>',

    suvarnabhumi:
      '<path d="M2 35 C11 26.5 37 26.5 46 35 V43 H2Z" fill="' + STONE + '"/>' +
      '<path d="M8 31 V35 M16 28.6 V35 M24 28 V35 M32 28.6 V35 M40 31 V35" stroke="' + STONE_D + '" stroke-width="1"/>' +
      '<rect x="4" y="35" width="40" height="8" fill="' + GLASS + '"/><path d="M4 39 H44" stroke="#FFFFFF" stroke-width=".8"/>' +
      planeSVG(23, 14, 1, "#1E88E5"),

    donmueang:
      '<rect x="3" y="34" width="27" height="9" fill="#CFD8DC"/><rect x="5" y="36.5" width="23" height="3" fill="' + GLASS + '"/>' +
      '<rect x="32" y="19" width="4.5" height="24" fill="#90A4AE"/>' +
      '<path d="M28.5 14 H40 L38.6 19.5 H29.9Z" fill="#4FA3E0"/><rect x="31" y="10.5" width="6.5" height="3.5" fill="#607D8B"/>' +
      '<path d="M34.25 10.5 V7" stroke="#607D8B" stroke-width="1"/>' +
      planeSVG(14, 17, .75, "#1E88E5"),

    aphiwat:
      '<path d="M2 37 V27 C2 18.5 46 18.5 46 27 V37Z" fill="' + STONE + '"/>' +
      '<path d="M2 27 C2 18.5 46 18.5 46 27" stroke="' + STONE_D + '" stroke-width="1.6" fill="none"/>' +
      '<path d="M8 22.5 L12 30 L16 21 L20 30 L24 20.5 L28 30 L32 21 L36 30 L40 22.5" stroke="#FFFFFF" stroke-width=".9" fill="none" opacity=".8"/>' +
      '<rect x="4" y="36" width="40" height="7.5" rx="3.5" fill="#E53935"/>' +
      '<path d="M8 39 h5 M15 39 h5 M22 39 h5 M29 39 h5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="36.5" y="37.5" width="5.5" height="3" rx="1.5" fill="#263238"/>',

    hualamphong:
      '<rect x="1.5" y="28" width="8" height="15" fill="' + CREAM_D + '"/><rect x="38.5" y="28" width="8" height="15" fill="' + CREAM_D + '"/>' +
      '<path d="M7 43 V22 C7 11.5 41 11.5 41 22 V43Z" fill="' + CREAM + '"/>' +
      '<path d="M13 35 V24 C13 16.5 35 16.5 35 24 V35Z" fill="#8D6E63"/>' +
      '<path d="M18.5 18.4 V35 M24 17 V35 M29.5 18.4 V35 M13 26 H35 M13 30.5 H35" stroke="' + CREAM + '" stroke-width=".9"/>' +
      '<circle cx="24" cy="11.5" r="2.4" fill="#FFFFFF" stroke="#8D6E63" stroke-width="1"/>' +
      '<rect x="12" y="36" width="24" height="7" fill="' + CREAM_D + '"/><path d="M16 37v6 M20 37v6 M28 37v6 M32 37v6" stroke="' + CREAM + '" stroke-width="1.2"/>',

    lumphini:
      '<ellipse cx="25" cy="39" rx="21" ry="5" fill="' + WATER + '"/>' +
      '<path d="M14 39 C18 37.5 22 37.5 26 39" stroke="#FFFFFF" stroke-width=".9" fill="none" opacity=".8"/>' +
      '<rect x="11.8" y="27" width="2.4" height="9" fill="#6D4C41"/><circle cx="13" cy="21.5" r="8.5" fill="' + LEAF + '"/>' +
      '<rect x="29.8" y="23" width="2.6" height="12" fill="#6D4C41"/><circle cx="31" cy="16" r="10.5" fill="' + LEAF_D + '"/>' +
      '<circle cx="27.5" cy="13" r="3" fill="' + LEAF + '" opacity=".7"/><circle cx="10.5" cy="19" r="2.4" fill="#66BB6A" opacity=".8"/>',

    benjakitti:
      '<path d="M2 43 C8 38.5 16 38.5 24 40.5 C32 42.5 40 38.5 46 40.5 V45 H2Z" fill="' + WATER + '"/>' +
      '<path d="M8 37 L10 31 M11 37 L11.5 30 M36 37 L37 30.5 M39 37 L38.5 31" stroke="#7CB342" stroke-width="1.3" stroke-linecap="round"/>' +
      '<path d="M16 27 L20.5 12 L25 27Z" fill="' + LEAF_D + '"/><path d="M24 27 L29.5 8 L35 27Z" fill="' + LEAF + '"/>' +
      '<path d="M6 27 L10 16 L14 27Z" fill="' + LEAF + '"/>' +
      '<rect x="2" y="30.5" width="44" height="2.6" rx="1" fill="#A1887F"/>' +
      '<path d="M7 33v5 M17 33v5 M27 33v5 M37 33v5" stroke="#8D6E63" stroke-width="1.4"/>',

    stadium:
      '<path d="M5.5 29 V9 M42.5 29 V9" stroke="' + STONE_D + '" stroke-width="1.6"/>' +
      '<rect x="3" y="6.5" width="5.5" height="3.4" rx=".8" fill="#FFF59D" stroke="' + STONE_D + '" stroke-width=".8"/>' +
      '<rect x="39.5" y="6.5" width="5.5" height="3.4" rx=".8" fill="#FFF59D" stroke="' + STONE_D + '" stroke-width=".8"/>' +
      '<ellipse cx="24" cy="32" rx="22" ry="11.5" fill="' + STONE + '"/>' +
      '<ellipse cx="24" cy="31" rx="17" ry="8" fill="#1E88E5"/>' +
      '<ellipse cx="24" cy="30.5" rx="13" ry="5.4" fill="#E64A19"/>' +
      '<ellipse cx="24" cy="30.5" rx="10" ry="3.8" fill="' + LEAF + '"/>' +
      '<path d="M24 26.7 V34.3" stroke="#FFFFFF" stroke-width=".8"/>'
  };

  /* ── วาดลง canvas: ขอบขาวแบบสติกเกอร์ + เงาจาง ๆ แล้ว addImage ────────── */
  var S = 2, BOX = 48, PAD = 3;
  var images = {};          // id -> ImageData
  var ready = null;

  function drawOne(id) {
    return new Promise(function (done) {
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="' + BOX * S + '" height="' + BOX * S + '">' + SVG[id] + '</svg>';
      var img = new Image();
      img.onload = function () {
        var W = (BOX + PAD * 2) * S;
        // เงา/ขอบต้องมีภาพเงาดำล้วนก่อน
        var sil = document.createElement("canvas");
        sil.width = BOX * S; sil.height = BOX * S;
        var sc = sil.getContext("2d");
        sc.drawImage(img, 0, 0);
        sc.globalCompositeOperation = "source-in";
        sc.fillStyle = "#FFFFFF";
        sc.fillRect(0, 0, sil.width, sil.height);

        var cv = document.createElement("canvas");
        cv.width = W; cv.height = W;
        var c = cv.getContext("2d");
        var o = PAD * S, r = 1.6 * S;
        c.shadowColor = "rgba(0,0,0,0.35)";
        c.shadowBlur = 3 * S;
        c.shadowOffsetY = 1 * S;
        c.drawImage(sil, o, o + 1);
        c.shadowColor = "transparent";
        for (var k = 0; k < 16; k++) {
          var a = k / 16 * Math.PI * 2;
          c.drawImage(sil, o + Math.cos(a) * r, o + Math.sin(a) * r);
        }
        c.drawImage(img, o, o);
        done({ id: id, data: c.getImageData(0, 0, W, W) });
      };
      img.onerror = function () { done({ id: id, data: null }); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }

  function prepare() {
    if (ready) return ready;
    ready = Promise.all(LM.map(function (l) { return drawOne(l.id); })).then(function (rs) {
      rs.forEach(function (r) { if (r.data) images["lmk-" + r.id] = r.data; });
    });
    return ready;
  }

  function geojson() {
    return {
      type: "FeatureCollection",
      features: LM.filter(function (l) { return images["lmk-" + l.id]; }).map(function (l) {
        return { type: "Feature", geometry: { type: "Point", coordinates: [l.lo, l.la] },
                 properties: { id: l.id, ic: "lmk-" + l.id, th: l.th, g: l.g } };
      })
    };
  }

  var visible = true, wired = false, popup = null, curMap = null;

  function theme() { return document.documentElement.getAttribute("data-theme") || "dark"; }

  // ป๊อปอัปของ MapLibre มีพื้นขาวตายตัว แต่ตัวอักษรรับสีอ่อนของธีมมืดมา → อ่านไม่ออก ใช้ตัวแปรธีมของหน้าแทน
  function injectCSS() {
    if (document.getElementById("lmkPopupStyle")) return;
    var css = document.createElement("style");
    css.id = "lmkPopupStyle";
    css.textContent = [
      ".lmk-popup .maplibregl-popup-content{background:var(--card-bg);color:var(--text-main);",
      "  border:1px solid var(--card-border);border-radius:12px;padding:10px 36px 11px 13px;",
      "  box-shadow:0 10px 28px rgba(0,0,0,.3);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);font-family:inherit}",
      ".lmk-popup .lmk-en{font-size:11px;color:var(--text-muted);margin-top:2px}",
      ".lmk-popup .lmk-g{font-size:10.5px;font-weight:700;color:var(--accent);margin-top:5px}",
      ".lmk-popup .maplibregl-popup-close-button{top:7px;right:7px;width:22px;height:22px;padding:0;border:0;",
      "  border-radius:6px;background:var(--accent-soft);color:var(--text-main);font-size:15px;line-height:22px}",
      ".lmk-popup.maplibregl-popup-anchor-bottom .maplibregl-popup-tip,",
      ".lmk-popup.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip,",
      ".lmk-popup.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip{border-top-color:var(--card-bg)}",
      ".lmk-popup.maplibregl-popup-anchor-top .maplibregl-popup-tip,",
      ".lmk-popup.maplibregl-popup-anchor-top-left .maplibregl-popup-tip,",
      ".lmk-popup.maplibregl-popup-anchor-top-right .maplibregl-popup-tip{border-bottom-color:var(--card-bg)}",
      ".lmk-popup.maplibregl-popup-anchor-left .maplibregl-popup-tip{border-right-color:var(--card-bg)}",
      ".lmk-popup.maplibregl-popup-anchor-right .maplibregl-popup-tip{border-left-color:var(--card-bg)}"
    ].join("\n");
    document.head.appendChild(css);
  }

  function mount(map) {
    curMap = map;
    injectCSS();
    prepare().then(function () {
      try {
        Object.keys(images).forEach(function (id) {
          if (!map.hasImage(id)) map.addImage(id, images[id], { pixelRatio: S });
        });
        if (!map.getSource("lmk-src")) map.addSource("lmk-src", { type: "geojson", data: geojson() });
        if (!map.getLayer("lmk-icons")) {
          var light = theme() === "light";
          map.addLayer({
            id: "lmk-icons", type: "symbol", source: "lmk-src", minzoom: 9.5,
            layout: {
              visibility: visible ? "visible" : "none",
              "icon-image": ["get", "ic"],
              "icon-anchor": "bottom",
              "icon-size": ["interpolate", ["linear"], ["zoom"], 9.5, 0.55, 12, 0.75, 15, 0.95, 17, 1.1],
              "icon-padding": 0,
              "symbol-sort-key": 0,
              "text-field": ["step", ["zoom"], "", 11, ["get", "th"]],
              "text-font": ["Noto Sans Bold"],
              "text-size": ["interpolate", ["linear"], ["zoom"], 11, 10.5, 15, 12.5],
              "text-anchor": "top",
              "text-offset": [0, 0.15],
              "text-max-width": 8,
              "text-optional": true
            },
            paint: {
              // ห้างมีหมุดโลโก้ของตัวเองตั้งแต่ระดับ 12 — ซ่อนภาพห้างตรงนั้น ไม่ให้ซ้อนกัน
              "icon-opacity": ["step", ["zoom"], 1, 12, ["case", ["==", ["get", "g"], "mall"], 0, 1]],
              "text-opacity": ["step", ["zoom"], 1, 12, ["case", ["==", ["get", "g"], "mall"], 0, 1]],
              "text-color": light ? "#7C2D12" : "#FDE68A",
              "text-halo-color": light ? "rgba(255,255,255,0.95)" : "rgba(15,23,42,0.92)",
              "text-halo-width": 1.7
            }
          });
        }
      } catch (e) {
        console.warn("landmark icons:", e);
        return;
      }

      if (wired) return;
      wired = true;
      map.on("click", "lmk-icons", function (e) {
        var f = e.features && e.features[0];
        if (!f) return;
        if (map.getZoom() >= 12 && f.properties.g === "mall") return;   // ซ่อนอยู่ — ให้หมุดห้างรับไป
        var l = LM.filter(function (x) { return x.id === f.properties.id; })[0];
        if (!l) return;
        if (popup) popup.remove();
        popup = new maplibregl.Popup({ offset: 12, closeButton: true, className: "lmk-popup" })
          .setLngLat([l.lo, l.la])
          .setHTML('<div style="font-family:inherit;min-width:160px"><b style="font-size:13px">' + l.th + '</b>' +
                   '<div class="lmk-en">' + l.en + '</div>' +
                   '<div class="lmk-g">' + (GROUP_TH[l.g] || "") + '</div></div>')
          .addTo(map);
        if (map.isMoving()) map.stop();
        map.flyTo({ center: [l.lo, l.la], zoom: Math.max(map.getZoom(), 15.8), pitch: 55, duration: 1600 });
      });
      map.on("mouseenter", "lmk-icons", function () { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "lmk-icons", function () { map.getCanvas().style.cursor = ""; });
    });
  }

  function setVisible(on) {
    visible = !!on;
    var map = curMap;
    if (map && map.getLayer("lmk-icons")) map.setLayoutProperty("lmk-icons", "visibility", visible ? "visible" : "none");
    if (!visible && popup) { popup.remove(); popup = null; }
  }

  // กรอบบนจอของภาพที่กำลังแสดง — หน้าแผนที่ใช้กันหมุด DOM ไม่ให้ทับภาพสถานที่ (หมุด DOM อยู่เหนือ canvas เสมอ)
  function screenRects(map) {
    map = map || curMap;
    if (!map || !visible || !map.getLayer("lmk-icons")) return [];
    var z = map.getZoom();
    if (z < 9.5) return [];
    var size = 54 * (z < 12 ? 0.55 + (z - 9.5) * 0.08 : z < 15 ? 0.75 + (z - 12) * 0.0667 : 0.95);
    var out = [];
    LM.forEach(function (l) {
      if (l.g === "mall" && z >= 12) return;
      var pt = map.project([l.lo, l.la]);
      out.push({ l: pt.x - size / 2, r: pt.x + size / 2, t: pt.y - size, b: pt.y + (z >= 11 ? 16 : 2) });
    });
    return out;
  }

  function bindToggle() {
    var cb = document.getElementById("toggleLandmarkIcons");
    if (!cb || cb._lmkBound) return;
    cb._lmkBound = true;
    cb.checked = visible;
    cb.addEventListener("change", function () { setVisible(cb.checked); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindToggle);
  else bindToggle();

  window.BKK_LANDMARK_ICONS = { mount: mount, setVisible: setVisible, screenRects: screenRects, list: LM, svg: SVG };
})();
