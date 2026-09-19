/**
 * bkk-aircraft-models.js
 * แบบจำลองเครื่องบินของชั้นสนามบิน 3 มิติ (bkk-airport3d.js) — สร้างรูปทรงเองในโค้ด ไม่โหลดไฟล์โมเดล
 *
 *   - 8 ตระกูล (class): ลำตัวแคบ · ลำตัวกว้างสองเครื่องยนต์ · 747 · A380 · ใบพัด · เจ็ตภูมิภาค · เจ็ตธุรกิจ · เฮลิคอปเตอร์
 *     ขนาดต่อแบบ (A321 = A320 ยืด) ใช้สเกลทั้งลำจากตาราง TYPES
 *   - ลายสายการบิน: ทุกจุดมี "ช่องสี" (slot) 0 = สีกลาง (ปีก กระจก ล้อ) · 1 = ลำตัว · 2 = หาง · 3 = ท้อง · 4 = เครื่องยนต์ · 5 = ฐานล้อ
 *     สีจริงต่อลำส่งผ่าน InstancedBufferAttribute (cBody cTail cBelly cEng) แล้วเลือกใน shader → เครื่องบินทุกลำของตระกูลเดียวกัน = 1 draw call
 *   - ฐานล้อ (slot 5) พับเก็บได้ต่อลำ (attribute gear = 0) · ไฮไลต์ตอนชี้/เลือก (attribute hl)
 *
 * หน่วย: เมตร · แกน: x = หัวเครื่อง, y = ปีกซ้าย, z = ขึ้น · z = 0 คือพื้นใต้ล้อ · x = 0 กึ่งกลางลำตัว
 *
 * ⚠ สัดส่วนเป็นค่าประมาณจากข้อมูลผู้ผลิตที่เปิดเผย · สีสายการบินเป็นสีหลักของลาย ไม่ใช่ลายจริงทั้งลำ และไม่วาดโลโก้
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ ตระกูล
     L ยาว · S ปีกกว้าง · R รัศมีลำตัว · hh ความสูงลำตัว/R (A380 สองชั้น) · zc ความสูงแกนลำตัวจากพื้น
     wing: x0 ขอบหน้าปีกที่โคน (จากกึ่งกลางลำ) · cr/ck/ct คอร์ดโคน/หักมุม/ปลาย · kink ตำแหน่งหักมุม (สัดส่วนครึ่งปีก)
           sw มุมลู่ปีก · dh มุมยกปีก · wl ปลายปีก (sharklet/winglet สูง ม., 0 = ปลายเรียว) · hi = ปีกสูง
     eng: [ระยะจากแกน, ...] · er รัศมี · el ยาว · ex ยื่นหน้าขอบปีก · rear = ติดท้าย · prop = ใบพัด
     fin: สูง ราก ปลาย ลู่ · tail: ครึ่งช่วงหางระดับ ราก ปลาย ลู่ · tt = หางรูปตัว T */
  var CLASSES = {
    narrow:   { L: 37.6, S: 35.8, R: 1.98, hh: 1.04, zc: 3.95,
      wing: { x0: 3.4, cr: 6.9, ck: 4.4, ct: 1.55, kink: 0.34, sw: 27, dh: 5.5, wl: 2.3 },
      eng: [5.75], er: 1.08, el: 4.6, ex: 2.6, pyl: 0.55,
      fin: { h: 6.1, cr: 5.6, ct: 2.0, sw: 36 }, tail: { b: 6.2, cr: 3.5, ct: 1.2, sw: 30 }, gearM: 3.8 },
    wide:     { L: 63.7, S: 60.9, R: 2.97, hh: 1.03, zc: 5.75,
      wing: { x0: 9.0, cr: 13.2, ck: 7.6, ct: 2.4, kink: 0.32, sw: 30, dh: 5.8, wl: 0 },
      eng: [9.6], er: 1.72, el: 7.2, ex: 3.8, pyl: 0.8,
      fin: { h: 9.4, cr: 9.6, ct: 3.2, sw: 42 }, tail: { b: 10.8, cr: 6.2, ct: 2.0, sw: 33 }, gearM: 5.9 },
    b747:     { L: 70.7, S: 64.4, R: 3.25, hh: 1.03, zc: 6.0, hump: 0.3,
      wing: { x0: 7.5, cr: 14.8, ck: 8.4, ct: 3.8, kink: 0.33, sw: 37.5, dh: 7, wl: 1.8 },
      eng: [11.9, 21.1], er: 1.35, el: 5.4, ex: 3.5, pyl: 0.7,
      fin: { h: 10.2, cr: 10.8, ct: 3.4, sw: 45 }, tail: { b: 11.0, cr: 6.8, ct: 2.1, sw: 36 }, gearM: 6.2 },
    a380:     { L: 72.7, S: 79.8, R: 3.57, hh: 1.18, zc: 6.9,
      wing: { x0: 8.5, cr: 17.8, ck: 10.0, ct: 4.0, kink: 0.36, sw: 33.5, dh: 5.6, wl: 2.2 },
      eng: [14.2, 25.2], er: 1.5, el: 6.2, ex: 3.4, pyl: 0.8,
      fin: { h: 12.4, cr: 12.4, ct: 4.2, sw: 42 }, tail: { b: 15.2, cr: 8.2, ct: 2.8, sw: 34 }, gearM: 7.0 },
    turboprop:{ L: 27.2, S: 27.1, R: 1.4, hh: 1.0, zc: 2.45, hi: true,
      wing: { x0: 1.6, cr: 2.6, ck: 2.4, ct: 1.3, kink: 0.35, sw: 3, dh: 0, wl: 0 },
      eng: [4.1], er: 0.62, el: 4.6, ex: 2.0, prop: 1.97,
      fin: { h: 4.6, cr: 4.4, ct: 2.0, sw: 38 }, tail: { b: 3.7, cr: 1.9, ct: 1.1, sw: 12 }, tt: true, gearM: 2.3 },
    regional: { L: 38.7, S: 28.7, R: 1.52, hh: 1.03, zc: 3.1,
      wing: { x0: 3.4, cr: 5.4, ck: 3.8, ct: 1.3, kink: 0.34, sw: 25, dh: 5, wl: 1.6 },
      eng: [4.3], er: 0.85, el: 3.8, ex: 2.1, pyl: 0.4,
      fin: { h: 5.4, cr: 5.0, ct: 1.9, sw: 38 }, tail: { b: 5.2, cr: 2.8, ct: 1.0, sw: 30 }, gearM: 3.0 },
    bizjet:   { L: 20.5, S: 19.4, R: 1.12, hh: 1.03, zc: 1.95,
      wing: { x0: 1.2, cr: 3.9, ck: 2.8, ct: 1.0, kink: 0.3, sw: 28, dh: 3, wl: 1.3 },
      eng: [], rear: { y: 1.75, x: -5.6, z: 0.55 }, er: 0.55, el: 3.4, ex: 0,
      fin: { h: 3.4, cr: 3.4, ct: 2.0, sw: 45 }, tail: { b: 3.6, cr: 1.9, ct: 0.9, sw: 32 }, tt: true, gearM: 1.8 },
    heli:     { L: 13.5, S: 0, R: 1.05, hh: 1.1, zc: 1.55, heli: true, rotor: 6.4,
      wing: null, eng: [], er: 0, el: 0, ex: 0,
      fin: { h: 2.2, cr: 1.6, ct: 0.9, sw: 30 }, tail: { b: 1.4, cr: 0.8, ct: 0.5, sw: 10 }, gearM: 0 }
  };

  /* แบบเครื่องบิน (รหัส ICAO) → [ตระกูล, ยาว, ชื่อเต็ม] · ความยาวใช้คำนวณสเกลทั้งลำ */
  var TYPES = {
    A319: ["narrow", 33.8, "Airbus A319"], A19N: ["narrow", 33.8, "Airbus A319neo"],
    A320: ["narrow", 37.6, "Airbus A320"], A20N: ["narrow", 37.6, "Airbus A320neo"],
    A321: ["narrow", 44.5, "Airbus A321"], A21N: ["narrow", 44.5, "Airbus A321neo"],
    B737: ["narrow", 33.6, "Boeing 737-700"], B738: ["narrow", 39.5, "Boeing 737-800"], B739: ["narrow", 42.1, "Boeing 737-900"],
    B37M: ["narrow", 35.6, "Boeing 737 MAX 7"], B38M: ["narrow", 39.5, "Boeing 737 MAX 8"], B39M: ["narrow", 42.2, "Boeing 737 MAX 9"],
    B752: ["narrow", 47.3, "Boeing 757-200"], BCS3: ["narrow", 38.7, "Airbus A220-300"],
    A332: ["wide", 58.8, "Airbus A330-200"], A333: ["wide", 63.7, "Airbus A330-300"], A339: ["wide", 63.7, "Airbus A330-900neo"],
    A359: ["wide", 66.8, "Airbus A350-900"], A35K: ["wide", 73.8, "Airbus A350-1000"],
    B762: ["wide", 48.5, "Boeing 767-200"], B763: ["wide", 54.9, "Boeing 767-300"], B764: ["wide", 61.4, "Boeing 767-400"],
    B772: ["wide", 63.7, "Boeing 777-200"], B77L: ["wide", 63.7, "Boeing 777-200LR/F"], B773: ["wide", 73.9, "Boeing 777-300"],
    B77W: ["wide", 73.9, "Boeing 777-300ER"], B778: ["wide", 70.9, "Boeing 777-8"], B779: ["wide", 76.7, "Boeing 777-9"],
    B788: ["wide", 56.7, "Boeing 787-8"], B789: ["wide", 62.8, "Boeing 787-9"], B78X: ["wide", 68.3, "Boeing 787-10"],
    MD11: ["wide", 61.6, "McDonnell Douglas MD-11"],
    B744: ["b747", 70.7, "Boeing 747-400"], B748: ["b747", 76.3, "Boeing 747-8"], B74F: ["b747", 70.7, "Boeing 747F"],
    A388: ["a380", 72.7, "Airbus A380-800"],
    AT72: ["turboprop", 27.2, "ATR 72"], AT75: ["turboprop", 27.2, "ATR 72-500"], AT76: ["turboprop", 27.2, "ATR 72-600"],
    AT43: ["turboprop", 22.7, "ATR 42"], AT45: ["turboprop", 22.7, "ATR 42-500"], DH8D: ["turboprop", 32.8, "De Havilland Dash 8-400"],
    E190: ["regional", 36.2, "Embraer E190"], E195: ["regional", 38.7, "Embraer E195"], E290: ["regional", 36.3, "Embraer E190-E2"],
    E295: ["regional", 41.5, "Embraer E195-E2"], CRJ9: ["regional", 36.2, "Bombardier CRJ900"], SU95: ["regional", 29.9, "Sukhoi Superjet 100"],
    C68A: ["bizjet", 19.4, "Cessna Citation Latitude"], GLF6: ["bizjet", 30.4, "Gulfstream G650"], GLEX: ["bizjet", 30.3, "Bombardier Global Express"],
    GL7T: ["bizjet", 33.8, "Bombardier Global 7500"], FA7X: ["bizjet", 23.2, "Dassault Falcon 7X"], CL35: ["bizjet", 20.9, "Bombardier Challenger 350"],
    E55P: ["bizjet", 15.6, "Embraer Phenom 300"], LJ45: ["bizjet", 17.7, "Learjet 45"], GLF5: ["bizjet", 29.4, "Gulfstream G550"],
    A139: ["heli", 13.8, "AgustaWestland AW139"], EC35: ["heli", 12.2, "Airbus H135"], S76: ["heli", 16.0, "Sikorsky S-76"], B412: ["heli", 17.1, "Bell 412"]
  };
  // จัดหมวดตามหมวดหมู่ ADS-B เมื่อไม่รู้แบบ
  var CATEGORY = { A1: ["bizjet", 15], A2: ["regional", 30], A3: ["narrow", 37.6], A4: ["narrow", 47], A5: ["wide", 64], A6: ["narrow", 37.6], A7: ["heli", 13] };

  /* สายการบิน (รหัส ICAO ในเลขเที่ยวบิน) → [ชื่อ, ลำตัว, หาง, ท้อง, เครื่องยนต์] */
  var W = "#f4f6f8", G = "#c9ced4", GR = "#9aa3ad";
  var AIRLINES = {
    THA: ["การบินไทย", W, "#5c2d91", GR, "#5c2d91"], THD: ["ไทยสมายล์", W, "#6a2c8e", G, "#e0a526"],
    AIQ: ["ไทยแอร์เอเชีย", W, "#e2231a", "#e2231a", "#e2231a"], TAX: ["ไทยแอร์เอเชีย เอ็กซ์", W, "#e2231a", "#e2231a", "#e2231a"],
    AXM: ["แอร์เอเชีย (มาเลเซีย)", W, "#e2231a", "#e2231a", "#e2231a"], XAX: ["แอร์เอเชีย เอ็กซ์", W, "#e2231a", "#e2231a", "#e2231a"],
    TLM: ["ไทยไลอ้อนแอร์", W, "#d71920", G, W], NOK: ["นกแอร์", "#ffd200", "#ffd200", "#ffd200", "#ffd200"],
    TVJ: ["ไทยเวียตเจ็ท", W, "#e8262a", "#e8262a", "#f7c600"], VJC: ["เวียตเจ็ทแอร์", W, "#e8262a", "#e8262a", "#f7c600"],
    BKP: ["บางกอกแอร์เวย์ส", W, "#1b5fae", "#7ac142", "#1b5fae"], TGW: ["สกู๊ต", W, "#ffd300", G, "#ffd300"],
    SIA: ["สิงคโปร์แอร์ไลน์", W, "#1d2d5c", G, "#1d2d5c"], CPA: ["คาเธ่ย์แปซิฟิค", W, "#006564", G, GR],
    EVA: ["อีวีเอแอร์", W, "#00614a", "#00614a", "#f0a51a"], CAL: ["ไชน่าแอร์ไลน์", W, "#e26d9f", "#1f4e8c", "#1f4e8c"],
    UAE: ["เอมิเรตส์", W, "#d71921", G, W], QTR: ["กาตาร์แอร์เวย์ส", W, "#5c0632", G, "#5c0632"],
    ETD: ["เอทิฮัด", "#e9dfcf", "#b8905a", "#c9b79c", "#b8905a"], THY: ["เตอร์กิชแอร์ไลน์", W, "#c8102e", G, "#c8102e"],
    KAL: ["โคเรียนแอร์", "#a8cfe6", "#1b3f8f", G, "#a8cfe6"], AAR: ["เอเชียน่า", W, "#b8905a", "#6d6f71", "#6d6f71"],
    JAL: ["เจแปนแอร์ไลน์", W, W, G, "#3a3a3a"], ANA: ["ออล นิปปอน", W, "#1a3a8c", "#1a3a8c", "#1a3a8c"],
    CES: ["ไชน่าอีสเทิร์น", W, "#c8102e", "#1b3f8f", "#1b3f8f"], CSN: ["ไชน่าเซาเทิร์น", W, "#0b72b5", G, "#0b72b5"],
    CCA: ["แอร์ไชน่า", W, W, G, "#c8102e"], HVN: ["เวียดนามแอร์ไลน์", W, "#00627a", G, "#00627a"],
    MAS: ["มาเลเซียแอร์ไลน์", W, "#1b3f8f", G, W], GIA: ["การูด้าอินโดนีเซีย", W, "#0b6f88", G, W],
    AIC: ["แอร์อินเดีย", W, "#c8102e", "#b8905a", "#c8102e"], IGO: ["อินดิโก", "#1a2c6b", "#1a2c6b", "#1a2c6b", "#1a2c6b"],
    QFA: ["แควนตัส", W, "#e0001b", G, GR], BAW: ["บริติชแอร์เวย์", W, "#1b2f6b", "#1b2f6b", GR],
    DLH: ["ลุฟท์ฮันซา", W, "#0a1d3d", G, "#0a1d3d"], AFR: ["แอร์ฟรานซ์", W, W, G, GR], KLM: ["เคแอลเอ็ม", "#00a1de", "#00a1de", "#00a1de", "#00a1de"],
    FIN: ["ฟินน์แอร์", W, W, G, "#0b1560"], SWR: ["สวิส", W, "#d52b1e", G, GR], ELY: ["เอลอัล", W, "#1b3f8f", G, GR],
    PAL: ["ฟิลิปปินส์แอร์ไลน์", W, "#1b3f8f", G, GR], CEB: ["เซบูแปซิฟิก", W, "#ffd100", G, "#ffd100"],
    MMA: ["เมียนมาร์แอร์เวย์", W, "#c8102e", G, GR], LAO: ["ลาวแอร์ไลน์", W, "#1b3f8f", G, "#c8102e"],
    KME: ["แคมโบเดีย แองกอร์", W, "#1b3f8f", G, GR], RBA: ["รอยัลบรูไน", W, "#f2c200", G, GR],
    ALK: ["ศรีลังกันแอร์ไลน์", W, "#1b3f8f", G, "#c8102e"], BBC: ["ไบมานบังคลาเทศ", W, "#006a4e", G, "#c8102e"],
    PIA: ["พีไอเอ", W, "#006a4e", G, GR], OMA: ["โอมานแอร์", W, "#b8905a", G, GR], GFA: ["กัลฟ์แอร์", W, "#b8905a", G, GR],
    SVA: ["ซาอุดีอาระเบียน", W, "#0a5a9c", G, GR], ETH: ["เอธิโอเปียนแอร์ไลน์", W, "#1f8a3b", G, GR],
    AFL: ["แอโรฟลอต", W, "#1b3f8f", G, GR], UZB: ["อุซเบกิสถานแอร์เวย์", W, "#1b5fae", G, GR],
    CXA: ["เซียะเหมินแอร์ไลน์", W, "#0b72b5", G, "#0b72b5"], CSZ: ["เซินเจิ้นแอร์ไลน์", W, "#c8102e", G, "#c8102e"],
    CHH: ["ไหหนานแอร์ไลน์", W, "#c8102e", G, "#c8102e"], CDG: ["ชานตงแอร์ไลน์", W, "#1b3f8f", G, "#c8102e"],
    SJX: ["สตาร์ลักซ์", W, "#b8905a", "#2b2b2b", "#2b2b2b"], JJA: ["เชจูแอร์", W, "#ff6a13", G, "#ff6a13"],
    TWB: ["ทีเวย์", W, "#d0021b", G, GR], JNA: ["จินแอร์", W, "#1c9a9e", G, GR], APJ: ["พีชเอวิเอชั่น", W, "#d8328e", G, "#d8328e"],
    FDX: ["เฟดเอ็กซ์", W, "#4d148c", G, GR], UPS: ["ยูพีเอส", "#351c15", "#351c15", "#351c15", GR], DHK: ["ดีเอชแอล", "#ffcc00", "#ffcc00", "#ffcc00", "#ffcc00"],
    GTI: ["แอตลาสแอร์", W, "#1b3f8f", G, GR], CLX: ["คาร์โกลักซ์", W, "#c8102e", G, GR], KZR: ["แอร์อัสตานา", W, "#b8905a", G, GR],
    RTAF: ["กองทัพอากาศ", "#8a9aa8", "#8a9aa8", "#8a9aa8", "#8a9aa8"]
  };
  var GENERIC = ["ไม่ทราบสายการบิน", W, "#7d8793", G, GR];

  function hex(c) { c = String(c).replace("#", ""); return [parseInt(c.slice(0, 2), 16) / 255, parseInt(c.slice(2, 4), 16) / 255, parseInt(c.slice(4, 6), 16) / 255]; }

  function typeInfo(t, cat) {
    var k = String(t || "").toUpperCase();
    if (TYPES[k]) return { cls: TYPES[k][0], L: TYPES[k][1], name: TYPES[k][2], code: k, known: true };
    var c = CATEGORY[cat];
    if (c) return { cls: c[0], L: c[1], name: k || "ไม่ทราบแบบ", code: k, known: false };
    return { cls: "narrow", L: 37.6, name: k || "ไม่ทราบแบบ", code: k, known: false };
  }
  function airlineOf(callsign, reg) {
    var cs = String(callsign || "").trim().toUpperCase(), m = /^([A-Z]{3})\d/.exec(cs);
    if (m && AIRLINES[m[1]]) return { code: m[1], a: AIRLINES[m[1]] };
    if (/^HS-/.test(reg || "") && /^(RTAF|L|TG)/.test(cs)) return { code: "", a: GENERIC };
    return { code: m ? m[1] : "", a: GENERIC };
  }
  function scaleOf(info) { return info.L / CLASSES[info.cls].L; }

  /* ------------------------------------------------------------ ตัวสร้างเรขา */
  function GB() { this.p = []; this.c = []; this.s = []; this.i = []; }
  GB.prototype.v = function (x, y, z, col, slot) { this.p.push(x, y, z); this.c.push(col[0], col[1], col[2]); this.s.push(slot); return this.p.length / 3 - 1; };
  GB.prototype.tri = function (a, b, c) { this.i.push(a, b, c); };
  GB.prototype.quad = function (a, b, c, d) { this.i.push(a, b, c, a, c, d); };

  var WHITE = [1, 1, 1], DARK = [0.13, 0.15, 0.18], GLASS = [0.1, 0.13, 0.17], METAL = [0.62, 0.65, 0.69],
    WING = [0.74, 0.77, 0.8], TYRE = [0.1, 0.1, 0.11], STRUT = [0.55, 0.57, 0.6], INTAKE = [0.16, 0.17, 0.19];

  /* ลำตัว: วงหน้าตัดตามแนวยาว — หัวทรงโค้ง (ogive) ช่วงตรง และหางเชิดขึ้น */
  function fuselage(B, C, seg) {
    var L = C.L, R = C.R, x0 = L / 2, nose = 2.3 * R, tail = 3.4 * R;
    var st = [];
    var nN = 7, nT = 7, i, u;
    for (i = 0; i <= nN; i++) {                         // หัว
      u = i / nN;
      var e = Math.sqrt(1 - Math.pow(1 - u, 2.1));
      st.push({ x: x0 - nose * (1 - Math.cos(u * Math.PI / 2)) * 1.0 - (i ? 0 : 0), r: Math.max(0.04, e), zc: -0.22 * R * Math.pow(1 - u, 2), hh: 1 });
    }
    st.forEach(function (s, k) { s.x = x0 - nose * Math.pow(k / nN, 1.5); });
    var bodyEnd = -x0 + tail;
    var mids = C.heli ? 1 : 4;
    for (i = 1; i <= mids; i++) st.push({ x: (x0 - nose) + ((bodyEnd) - (x0 - nose)) * i / mids, r: 1, zc: 0, hh: 1 });
    for (i = 1; i <= nT; i++) {                         // หางเชิด
      u = i / nT;
      var top = 1 - 0.18 * u, bot = -1 + 1.62 * Math.pow(u, 1.25);
      if (C.heli) { top = 1 - 0.75 * u; bot = -1 + 1.55 * u; }
      st.push({ x: bodyEnd - tail * u, r: Math.max(0.1, 1 - 0.86 * u), zc: (top + bot) / 2 * R, hh: (top - bot) / 2, tailU: u });
    }
    var rings = [];
    st.forEach(function (s) {
      var ring = [];
      for (var k = 0; k <= seg; k++) {
        var th = -Math.PI / 2 + k / seg * Math.PI * 2;    // เริ่มใต้ท้อง วนผ่านข้างซ้าย ขึ้นหลังคา
        var cy = Math.cos(th), sz = Math.sin(th);
        var hw = R * s.r, hh = R * C.hh * (s.tailU != null ? s.hh / 1 : s.r);
        if (s.tailU != null) hh = R * s.hh;
        var z = C.zc + s.zc + hh * sz;
        if (C.hump && s.x > x0 - L * 0.36 && s.x < x0 - nose * 0.4 && sz > 0) {
          var hu = Math.min(1, (s.x - (x0 - L * 0.36)) / (L * 0.08));
          z += C.hump * R * hu * Math.pow(sz, 0.6) * 1.2;
        }
        ring.push([s.x, hw * cy, z, sz]);
      }
      rings.push(ring);
    });
    for (var r = 0; r < rings.length - 1; r++) {
      for (var k2 = 0; k2 < seg; k2++) {
        var a = rings[r][k2], b = rings[r][k2 + 1], c = rings[r + 1][k2 + 1], d = rings[r + 1][k2];
        var sm = (a[3] + b[3]) / 2, slot = sm < -0.42 ? 3 : 1;
        var col = WHITE;
        var ia = B.v(a[0], a[1], a[2], col, slot), ib = B.v(b[0], b[1], b[2], col, slot),
          ic = B.v(c[0], c[1], c[2], col, slot), id = B.v(d[0], d[1], d[2], col, slot);
        B.quad(ia, id, ic, ib);
      }
    }
    // ปลายหัว/ปลายหาง ปิดด้วยพัด
    [0, rings.length - 1].forEach(function (ri) {
      var ring = rings[ri], cx = 0, cz = 0;
      ring.forEach(function (p) { cx += p[0]; cz += p[2]; });
      cx /= ring.length; cz /= ring.length;
      var ic = B.v(cx + (ri ? -0.05 : 0.05), 0, cz, WHITE, 1);
      for (var k = 0; k < seg; k++) {
        var p = ring[k], q = ring[k + 1];
        var ip = B.v(p[0], p[1], p[2], WHITE, 1), iq = B.v(q[0], q[1], q[2], WHITE, 1);
        if (ri) B.tri(ic, iq, ip); else B.tri(ic, ip, iq);
      }
    });
    return { nose: nose, tail: tail, bodyEnd: bodyEnd };
  }

  /* แผ่นบางมีความหนา (ปีก หาง ครีบ): ขอบหน้า a→b, คอร์ดตามแกน −x, ความหนา th ตั้งฉากกับระนาบ */
  function plate(B, lead, trail, th, col, slot, up) {
    // lead/trail = อาร์เรย์จุดขอบหน้า/ขอบหลังตามแนว span เท่ากัน · up = เวกเตอร์ความหนา
    var n = lead.length, top = [], bot = [], midT = [], midB = [], k;
    for (k = 0; k < n; k++) {
      var L = lead[k], Tr = trail[k], t = th[k];
      var mx = L[0] + (Tr[0] - L[0]) * 0.35, my = L[1] + (Tr[1] - L[1]) * 0.35, mz = L[2] + (Tr[2] - L[2]) * 0.35;
      top.push(B.v(L[0], L[1], L[2], col, slot));
      midT.push(B.v(mx + up[0] * t * 0.6, my + up[1] * t * 0.6, mz + up[2] * t * 0.6, col, slot));
      midB.push(B.v(mx - up[0] * t * 0.4, my - up[1] * t * 0.4, mz - up[2] * t * 0.4, col, slot));
      bot.push(B.v(Tr[0], Tr[1], Tr[2], col, slot));
    }
    for (k = 0; k < n - 1; k++) {
      B.quad(top[k], top[k + 1], midT[k + 1], midT[k]);
      B.quad(midT[k], midT[k + 1], bot[k + 1], bot[k]);
      B.quad(bot[k], bot[k + 1], midB[k + 1], midB[k]);
      B.quad(midB[k], midB[k + 1], top[k + 1], top[k]);
    }
    // ปิดปลาย
    k = n - 1;
    B.quad(top[k], midT[k], bot[k], midB[k]);
    B.quad(top[0], midB[0], bot[0], midT[0]);
  }

  function wings(B, C) {
    var w = C.wing, half = C.S / 2, R = C.R;
    var yRoot = R * 0.55, sw = Math.tan(w.sw * Math.PI / 180), dh = Math.tan(w.dh * Math.PI / 180);
    var zRoot = C.hi ? C.zc + R * 0.82 : C.zc - R * 0.55;
    var info = { yRoot: yRoot, zRoot: zRoot, sw: sw, dh: dh, half: half };
    [1, -1].forEach(function (sgn) {
      var ys = [yRoot, yRoot + (half - yRoot) * w.kink, half - (w.wl ? 0.3 : 0)], ch = [w.cr, w.ck, w.ct];
      var lead = [], trail = [], th = [];
      ys.forEach(function (y, k) {
        var xl = w.x0 - (y - yRoot) * sw, z = zRoot + (y - yRoot) * dh;
        lead.push([xl, sgn * y, z]);
        trail.push([xl - ch[k], sgn * y, z]);
        th.push(ch[k] * (k === 0 ? 0.13 : 0.1));
      });
      if (sgn < 0) { plateMirror(B, lead, trail, th, WING, 0); } else plate(B, lead, trail, th, WING, 0, [0, 0, 1]);
      if (w.wl) {                                   // sharklet/winglet
        var tl = lead[2], tt = trail[2], hgt = w.wl;
        var l2 = [[tl[0] - 0.2, tl[1], tl[2]], [tl[0] - w.ct * 0.75, sgn * (half + 0.15), tl[2] + hgt]];
        var t2 = [[tt[0], tt[1], tt[2]], [tt[0] - 0.25, sgn * (half + 0.15), tt[2] + hgt]];
        plateSide(B, l2, t2, 0.12, 2);
      }
    });
    return info;
  }
  // ปีกซ้าย-ขวาใช้ฟังก์ชันเดียวกัน แต่ต้องกลับทิศหน้าให้ด้านนอกหันออก
  function plateMirror(B, lead, trail, th, col, slot) {
    var i0 = B.i.length;
    plate(B, lead, trail, th, col, slot, [0, 0, 1]);
    for (var i = i0; i < B.i.length; i += 3) { var t = B.i[i + 1]; B.i[i + 1] = B.i[i + 2]; B.i[i + 2] = t; }
  }
  // แผ่นตั้ง (ครีบ, winglet): ความหนาไปทางแกน y
  function plateSide(B, lead, trail, thk, slot) {
    var n = lead.length, L = [], R2 = [], k;
    for (k = 0; k < n; k++) {
      var a = lead[k], b = trail[k];
      L.push([B.v(a[0], a[1], a[2], WHITE, slot), B.v(b[0], b[1], b[2], WHITE, slot)]);
      var mx = a[0] + (b[0] - a[0]) * 0.35, mz = a[2] + (b[2] - a[2]) * 0.35, my = a[1] + (b[1] - a[1]) * 0.35;
      var t = thk * (1 - 0.5 * k / Math.max(1, n - 1));
      R2.push([B.v(mx, my + t, mz, WHITE, slot), B.v(mx, my - t, mz, WHITE, slot)]);
    }
    for (k = 0; k < n - 1; k++) {
      // ด้าน +y: หน้า → กลาง+ → หลัง
      B.quad(L[k][0], R2[k][0], R2[k + 1][0], L[k + 1][0]);
      B.quad(R2[k][0], L[k][1], L[k + 1][1], R2[k + 1][0]);
      // ด้าน −y
      B.quad(L[k][0], L[k + 1][0], R2[k + 1][1], R2[k][1]);
      B.quad(R2[k][1], R2[k + 1][1], L[k + 1][1], L[k][1]);
    }
    k = n - 1;
    B.quad(L[k][0], R2[k][0], L[k][1], R2[k][1]);
  }

  function tailSurfaces(B, C, f) {
    var R = C.R, x0 = C.L / 2, xt = -x0 + f.tail * 0.95;
    var fin = C.fin, tl = C.tail;
    var zTop = C.zc + R * 0.82;
    // ครีบหาง (ตั้ง)
    var sw = Math.tan(fin.sw * Math.PI / 180);
    var xr = xt + fin.cr * 0.55;
    var lead = [[xr, 0, zTop - 0.3], [xr - fin.h * sw, 0, zTop + fin.h]];
    var trail = [[xr - fin.cr, 0, zTop - 0.2], [xr - fin.h * sw - fin.ct, 0, zTop + fin.h]];
    plateSide(B, lead, trail, Math.max(0.12, fin.cr * 0.05), 2);
    // หางระดับ
    var swh = Math.tan(tl.sw * Math.PI / 180);
    var zh = C.tt ? zTop + fin.h * 0.97 : C.zc + R * 0.1;
    var xh = C.tt ? xr - fin.h * sw + 0.2 : xt + tl.cr * 0.3;
    [1, -1].forEach(function (sgn) {
      var ld = [[xh, sgn * (C.tt ? 0.05 : R * 0.45), zh], [xh - tl.b * swh, sgn * tl.b, zh + tl.b * 0.07]];
      var tr = [[xh - tl.cr, ld[0][1], zh], [xh - tl.b * swh - tl.ct, sgn * tl.b, zh + tl.b * 0.07]];
      if (sgn < 0) plateMirror(B, ld, tr, [tl.cr * 0.1, tl.ct * 0.1], WHITE, 1);
      else plate(B, ld, tr, [tl.cr * 0.1, tl.ct * 0.1], WHITE, 1, [0, 0, 1]);
    });
  }

  /* ทรงกระบอกตามแกน x (เครื่องยนต์ ยาง แกนล้อ) */
  function cyl(B, cx, cy, cz, r0, r1, len, n, col, slot, capFront, capCol, axis) {
    var a = [], b = [], k;
    for (k = 0; k <= n; k++) {
      var t = k / n * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      if (axis === "y") {
        a.push(B.v(cx + r0 * c, cy + len / 2, cz + r0 * s, col, slot));
        b.push(B.v(cx + r1 * c, cy - len / 2, cz + r1 * s, col, slot));
      } else if (axis === "z") {
        a.push(B.v(cx + r0 * c, cy + r0 * s, cz + len, col, slot));
        b.push(B.v(cx + r1 * c, cy + r1 * s, cz, col, slot));
      } else {
        a.push(B.v(cx + len / 2, cy + r0 * c, cz + r0 * s, col, slot));
        b.push(B.v(cx - len / 2, cy + r1 * c, cz + r1 * s, col, slot));
      }
    }
    for (k = 0; k < n; k++) B.quad(a[k], b[k], b[k + 1], a[k + 1]);
    if (capFront) {
      var ic = axis === "y" ? B.v(cx, cy + len / 2, cz, capCol, 0) : axis === "z" ? B.v(cx, cy, cz + len, capCol, 0) : B.v(cx + len / 2 - r0 * 0.25, cy, cz, capCol, 0);
      var ring = [];
      for (k = 0; k <= n; k++) {
        var t2 = k / n * Math.PI * 2;
        ring.push(axis === "y" ? B.v(cx + r0 * Math.cos(t2), cy + len / 2, cz + r0 * Math.sin(t2), capCol, 0) :
          axis === "z" ? B.v(cx + r0 * Math.cos(t2), cy + r0 * Math.sin(t2), cz + len, capCol, 0) :
          B.v(cx + len / 2, cy + r0 * Math.cos(t2), cz + r0 * Math.sin(t2), capCol, 0));
      }
      for (k = 0; k < n; k++) B.tri(ic, ring[k + 1], ring[k]);
    }
  }
  function box(B, x0, x1, y0, y1, z0, z1, col, slot) {
    var v = [];
    [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]].forEach(function (p) { v.push(B.v(p[0], p[1], p[2], col, slot)); });
    B.quad(v[0], v[3], v[2], v[1]); B.quad(v[4], v[5], v[6], v[7]);
    B.quad(v[0], v[1], v[5], v[4]); B.quad(v[1], v[2], v[6], v[5]); B.quad(v[2], v[3], v[7], v[6]); B.quad(v[3], v[0], v[4], v[7]);
  }

  function engines(B, C, wi) {
    var n = 12;
    C.eng.forEach(function (ye) {
      [1, -1].forEach(function (sgn) {
        var xl = C.wing.x0 - (ye - wi.yRoot) * wi.sw, zw = wi.zRoot + (ye - wi.yRoot) * wi.dh;
        var cx = xl + C.ex - C.el / 2, cz = C.hi ? zw - C.er * 0.2 : zw - C.er - (C.pyl || 0.4) * 0.6;
        if (C.prop) {
          cyl(B, cx, sgn * ye, cz, C.er, C.er * 0.55, C.el, 10, WHITE, 4, true, INTAKE);
          // ใบพัด: จานบาง ๆ สีเข้มโปร่ง (แทนใบพัดหมุน)
          cyl(B, cx + C.el / 2 + 0.25, sgn * ye, cz, C.prop, C.prop, 0.06, 16, [0.28, 0.3, 0.33], 0, true, [0.22, 0.24, 0.27]);
          return;
        }
        cyl(B, cx, sgn * ye, cz, C.er, C.er * 0.72, C.el, n, WHITE, 4, true, INTAKE);
        cyl(B, cx - C.el / 2 - C.el * 0.12, sgn * ye, cz, C.er * 0.55, C.er * 0.18, C.el * 0.25, 8, METAL, 0, false);
        // เสายึดเครื่อง (pylon)
        var pz0 = cz + C.er * 0.8, pz1 = zw + 0.1;
        box(B, cx - C.el * 0.45, cx + C.el * 0.35, sgn * ye - 0.18, sgn * ye + 0.18, pz0, pz1, WING, 0);
      });
    });
    if (C.rear) {
      [1, -1].forEach(function (sgn) {
        var cx = C.rear.x, cz = C.zc + C.rear.z;
        cyl(B, cx, sgn * C.rear.y, cz, C.er, C.er * 0.7, C.el, 10, WHITE, 4, true, INTAKE);
        box(B, cx - 1.0, cx + 0.8, sgn > 0 ? C.R * 0.6 : -C.rear.y + C.er * 0.7, sgn > 0 ? C.rear.y - C.er * 0.7 : -C.R * 0.6, cz - 0.12, cz + 0.12, WING, 0);
      });
    }
  }

  /* หน้าต่างผู้โดยสาร (แถบเข้ม) + กระจกห้องนักบิน */
  function windows(B, C, f) {
    var R = C.R, x0 = C.L / 2;
    var xa = x0 - f.nose - 0.6, xb = f.bodyEnd + 1.2;
    var decks = C.hh > 1.1 ? [0.28, 0.72] : [0.3];
    decks.forEach(function (dz) {
      var z = C.zc + R * C.hh * dz;
      if (C.hump && dz > 0.5) return;
      [1, -1].forEach(function (sgn) {
        var ang = Math.asin(Math.min(0.95, dz * C.hh / C.hh)), y = sgn * (R * Math.cos(ang) + 0.02), h = Math.max(0.2, R * 0.13);
        var a = B.v(xa, y, z - h / 2, DARK, 0), b = B.v(xb, y, z - h / 2, DARK, 0), c = B.v(xb, y, z + h / 2, DARK, 0), d = B.v(xa, y, z + h / 2, DARK, 0);
        if (sgn > 0) B.quad(a, b, c, d); else B.quad(a, d, c, b);
      });
    });
    if (C.hump) {
      var zH = C.zc + R * 1.12;
      [1, -1].forEach(function (sgn) {
        var y = sgn * (R * 0.72), h = R * 0.1, xa2 = x0 - f.nose - 0.8, xb2 = x0 - C.L * 0.33;
        var a = B.v(xa2, y, zH - h / 2, DARK, 0), b = B.v(xb2, y, zH - h / 2, DARK, 0), c = B.v(xb2, y, zH + h / 2, DARK, 0), d = B.v(xa2, y, zH + h / 2, DARK, 0);
        if (sgn > 0) B.quad(a, b, c, d); else B.quad(a, d, c, b);
      });
    }
    // กระจกหน้า: แถบคาดรอบจมูกด้านบน
    var xc = x0 - f.nose * 0.62, zc2 = C.zc + R * (C.hh > 1.1 ? 0.62 : 0.34) - 0.22 * R * Math.pow(0.4, 2);
    var hwc = R * 0.78;
    var p = [B.v(xc + f.nose * 0.24, hwc * 0.72, zc2 - R * 0.05, GLASS, 0), B.v(xc + f.nose * 0.24, -hwc * 0.72, zc2 - R * 0.05, GLASS, 0),
      B.v(xc - f.nose * 0.05, -hwc * 1.02, zc2 + R * 0.16, GLASS, 0), B.v(xc - f.nose * 0.05, hwc * 1.02, zc2 + R * 0.16, GLASS, 0)];
    B.quad(p[0], p[3], p[2], p[1]);
  }

  /* ฐานล้อ (slot 5 — ซ่อนได้เมื่อพับเก็บ) */
  function gear(B, C, wi) {
    if (!C.gearM) {
      if (C.heli) {                                   // สกีเฮลิคอปเตอร์
        [1, -1].forEach(function (s) { box(B, -2.2, 2.4, s * 1.1 - 0.06, s * 1.1 + 0.06, 0, 0.1, STRUT, 5); });
      }
      return;
    }
    var R = C.R, x0 = C.L / 2, zBot = C.zc - R;
    var tr = Math.max(0.35, R * 0.21);
    // ล้อหน้า
    var xn = x0 - 2.6 * R;
    box(B, xn - 0.1, xn + 0.1, -0.1, 0.1, tr, zBot + 0.2, STRUT, 5);
    cyl(B, xn, 0, tr, tr, tr, 0.9, 8, TYRE, 5, false, null, "y");
    // ล้อหลัก (ใต้โคนปีก)
    var xm = C.wing ? C.wing.x0 - C.wing.cr * 0.72 : -1, ym = C.gearM;
    var bogies = C.cls === "a380" || C.cls === "b747" ? [[ym * 0.62, 0], [ym * 1.0, 0.4], [ym * 0.25, -1.2]] : [[ym, 0]];
    bogies.forEach(function (bg) {
      [1, -1].forEach(function (sgn) {
        var y = sgn * bg[0], xx = xm + bg[1];
        var zTop = C.hi ? C.zc - R * 0.6 : wi.zRoot + (bg[0] - wi.yRoot) * wi.dh;
        box(B, xx - 0.12, xx + 0.12, y - 0.12, y + 0.12, tr, zTop, STRUT, 5);
        var axles = C.cls === "narrow" || C.cls === "regional" || C.cls === "turboprop" || C.cls === "bizjet" ? [0] : [0.8, -0.8];
        if (C.cls === "wide" && ym > 5) axles = [1.2, 0, -1.2];
        axles.forEach(function (dx) { cyl(B, xx + dx, y, tr * 1.25, tr * 1.25, tr * 1.25, 1.05, 8, TYRE, 5, false, null, "y"); });
      });
    });
  }

  function heliParts(B, C) {
    var z = C.zc + C.R * 1.2;
    cyl(B, 0.4, 0, z, 0.18, 0.18, 0.7, 6, STRUT, 0, false, null, "z");
    cyl(B, 0.4, 0, z + 0.7, C.rotor, C.rotor, 0.05, 20, [0.3, 0.32, 0.35], 0, true, [0.25, 0.27, 0.3], "z");
    // บูมหาง
    box(B, -C.L / 2 + 0.6, -C.L / 2 + 5.4, -0.25, 0.25, C.zc + 0.2, C.zc + 0.75, WHITE, 1);
  }

  function buildGeometry(T, cls) {
    var C = CLASSES[cls];
    C.cls = cls;
    var B = new GB();
    var f = fuselage(B, C, cls === "heli" ? 10 : 14);
    var wi = C.wing ? wings(B, C) : { yRoot: 0, zRoot: C.zc, sw: 0, dh: 0 };
    tailSurfaces(B, C, f);
    engines(B, C, wi);
    if (!C.heli) windows(B, C, f);
    else heliParts(B, C);
    gear(B, C, wi);
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(B.p, 3));
    g.setAttribute("color", new T.Float32BufferAttribute(B.c, 3));
    g.setAttribute("slot", new T.Float32BufferAttribute(B.s, 1));
    g.setIndex(B.i);
    g.computeBoundingSphere();
    return g;
  }

  /* วัสดุ: เลือกสีตามช่อง (slot) ต่อจุด + สีต่อลำ (instanced) · ซ่อนฐานล้อ · ไฮไลต์ */
  function makeMaterial(T) {
    var m = new T.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 38, specular: 0x333333 });
    m.onBeforeCompile = function (sh) {
      sh.uniforms.hlColor = m.userData.hlColor;
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float slot;\nattribute vec3 cBody;\nattribute vec3 cTail;\nattribute vec3 cBelly;\nattribute vec3 cEng;\nattribute float gear;\nattribute float hl;\nuniform vec3 hlColor;")
        .replace("#include <begin_vertex>", "vec3 transformed = vec3( position );\nif ( slot > 4.5 && gear < 0.5 ) transformed = vec3( 0.0 );")
        .replace("#include <color_vertex>",
          "vColor = color;\n" +
          "if ( slot > 0.5 && slot < 1.5 ) vColor *= cBody;\n" +
          "else if ( slot > 1.5 && slot < 2.5 ) vColor *= cTail;\n" +
          "else if ( slot > 2.5 && slot < 3.5 ) vColor *= cBelly;\n" +
          "else if ( slot > 3.5 && slot < 4.5 ) vColor *= cEng;\n" +
          "vColor = mix( vColor, hlColor, hl * 0.62 );");
    };
    m.userData.hlColor = { value: new T.Color("#00E5FF") };
    return m;
  }

  window.BKK_AIRCRAFT = {
    CLASSES: CLASSES,
    TYPES: TYPES,
    AIRLINES: AIRLINES,
    GENERIC: GENERIC,
    hex: hex,
    typeInfo: typeInfo,
    airlineOf: airlineOf,
    scaleOf: scaleOf,
    geometry: buildGeometry,
    material: makeMaterial
  };
})();
