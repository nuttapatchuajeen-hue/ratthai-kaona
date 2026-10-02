/**
 * bkk-bldg-legend.js
 * ปุ่ม "สีตึก" มุมล่างซ้ายของ bkk-city.html (ข้างปุ่ม "การเดินทาง") — บอกว่าสีของตึก/พื้นที่บนแผนที่หมายถึงอะไร
 *
 * - แสดงเฉพาะแถวของชั้นที่เปิดอยู่จริงในตอนนั้น (อ่าน visibility ของชั้น MapLibre) — เปิด/ปิดชั้นแล้วการ์ดอัปเดตเอง
 * - สีอ่านจากข้อมูลชุดเดียวกับที่ชั้นใช้วาด (BKK_ZONING_DATA.categories, BKK_DATACENTERS.tone) จะได้ไม่เพี้ยนกัน
 * - window.BKK_BLDG_LEGEND.mount(map) เรียกทุกครั้งที่ style โหลดใหม่ (สลับธีม) — สร้าง UI ครั้งเดียว
 */
(function () {
  "use strict";

  var LS_OPEN = "bkk-bldg-legend-open";

  /* สีตึกทั่วไปตามธีม — ต้องตรงกับ bldgColor ใน addMapLayers() ของ bkk-city.html */
  var BLDG = {
    dark: ["#141d27", "#1e293b", "#334155"],
    sunset: ["#3A2A22", "#6E4434", "#A35C3E"],
    light: ["#E2E8F0", "#CBD5E1", "#94A3B8"]
  };
  /* ตึกสำนักงาน — ตรงกับ ashton-towers-3d (interpolate ตามจำนวนบริษัท 0/1/3/8) */
  var OFFICE = "linear-gradient(90deg,#E2E8F0 0%,#CBD5E1 12%,#EDA340 37%,#B85A3F 100%)";
  var PROJECT = "linear-gradient(90deg,#38BDF8 0 20%,#10B981 20% 40%,#F59E0B 40% 60%,#C2410C 60% 80%,#7C3AED 80%)";
  var EMBASSY = "#7A6BA8";

  var CSS =
    "#bldgLegendPill{left:20px;bottom:24px;padding:8px 14px;border-radius:var(--radius-pill);display:flex;align-items:center;gap:8px;" +
    "  cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;color:var(--text-main);user-select:none;transition:border-color .2s,transform .2s}" +
    "#bldgLegendPill:hover{border-color:var(--accent);transform:translateY(-1px)}" +
    "#bldgLegendPill .bl-dots{display:inline-flex;gap:2px}" +
    "#bldgLegendPill .bl-dots i{width:7px;height:12px;border-radius:2px;display:block}" +
    "#bldgLegendPill[aria-expanded=\"true\"]{border-color:var(--accent)}" +
    "#bldgLegend{left:20px;bottom:70px;width:300px;max-width:calc(100% - 40px);max-height:calc(100% - 200px);overflow:auto;padding:12px 14px 10px;" +
    "  font-size:12px;line-height:1.45;color:var(--text-main);z-index:24;display:none}" +
    "#bldgLegend.open{display:block}" +
    "#bldgLegend .bl-h{display:flex;align-items:center;gap:6px;font-weight:800;font-size:13px;margin-bottom:8px}" +
    "#bldgLegend .bl-x{margin-left:auto;border:0;background:transparent;color:var(--text-muted);font-size:17px;line-height:1;cursor:pointer;padding:0 2px}" +
    "#bldgLegend .bl-x:hover{color:var(--text-main)}" +
    "#bldgLegend .bl-row{display:grid;grid-template-columns:38px 1fr;gap:2px 10px;padding:7px 0;border-top:1px solid var(--card-border)}" +
    "#bldgLegend .bl-sw{grid-row:span 2;align-self:center;height:16px;border-radius:4px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}" +
    "#bldgLegend .bl-sw.out{background:transparent!important;box-shadow:none;border:2px solid " + EMBASSY + "}" +
    "#bldgLegend .bl-t{font-weight:700}" +
    "#bldgLegend .bl-d{color:var(--text-muted);font-size:11px}" +
    "#bldgLegend .bl-keys{grid-column:2;display:flex;flex-wrap:wrap;gap:3px 10px;margin-top:3px;font-size:10.5px;color:var(--text-muted)}" +
    "#bldgLegend .bl-keys span{display:inline-flex;align-items:center;gap:4px}" +
    "#bldgLegend .bl-keys i{width:9px;height:9px;border-radius:2px;display:block}" +
    "#bldgLegend .bl-empty{color:var(--text-muted);font-size:11.5px;padding:6px 0;border-top:1px solid var(--card-border)}" +
    "@media (max-width:768px){#bldgLegendPill{padding:7px 11px;font-size:12px}#bldgLegend{left:12px;max-width:calc(100% - 24px)}}";

  var map = null, built = false, pill = null, card = null, timer = 0;

  function $(s, r) { return (r || document).querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function theme() {
    var t = document.documentElement.getAttribute("data-theme");
    return BLDG[t] ? t : "light";
  }
  function shown(ids) {
    if (!map) return false;
    return ids.some(function (id) {
      try { return !!map.getLayer(id) && map.getLayoutProperty(id, "visibility") !== "none"; } catch (e) { return false; }
    });
  }
  function keys(list) {
    return '<div class="bl-keys">' + list.map(function (k) {
      return '<span><i style="background:' + k[0] + '"></i>' + k[1] + '</span>';
    }).join("") + '</div>';
  }

  function rows() {
    var out = [], b = BLDG[theme()];
    if (shown(["city-buildings-3d"])) out.push({
      sw: "linear-gradient(90deg," + b.join(",") + ")", t: "ตึกทั่วไป",
      d: "สีเข้ม → อ่อน ตามความสูง · เห็นเมื่อซูมเข้าใกล้"
    });
    if (shown(["landmarks-model", "landmarks-osm-3d"])) out.push({
      sw: PROJECT, t: "ตึกโครงการ & แลนด์มาร์ก",
      d: "สีตามแต่ละโครงการ ไม่ได้แบ่งเป็นหมวด · กดที่ตึกเพื่อดูข้อมูล"
    });
    if (shown(["ashton-towers-3d"])) out.push({
      sw: OFFICE, t: "ตึกสำนักงาน",
      d: "ยิ่งมีบริษัทเช่ามาก ยิ่งออกส้ม-แดง (ไม่มี → 8 บริษัทขึ้นไป)"
    });
    var dc = window.BKK_DATACENTERS && window.BKK_DATACENTERS.tone;
    if (dc && shown(["bkk-dc-model"])) out.push({
      sw: "linear-gradient(90deg," + dc.live.hall + " 0 25%," + dc.colo.hall + " 25% 50%," + dc.build.hall + " 50% 75%," + dc.hold.hall + " 75%)",
      t: "ศูนย์ข้อมูล (Data Center)", d: "สีตามสถานะโครงการ",
      keys: ["live", "colo", "build", "hold"].map(function (k) { return [dc[k].hall, dc[k].label]; })
    });
    if (shown(["ashton-emb-plots-fill"])) out.push({
      sw: "", out: true, t: "ที่ดินสถานทูต", d: "กรอบสีม่วงรอบแปลงที่ดิน"
    });
    var zc = window.BKK_ZONING_DATA && window.BKK_ZONING_DATA.categories;
    if (zc && shown(["bkk-zoning-fill"])) {
      var ks = Object.keys(zc).map(function (k) { return [zc[k].color, zc[k].name.replace(/^ที่ดินประเภท/, "")]; });
      out.push({
        sw: "linear-gradient(90deg," + ks.map(function (k, i) {
          return k[0] + " " + (i * 100 / ks.length).toFixed(0) + "% " + ((i + 1) * 100 / ks.length).toFixed(0) + "%";
        }).join(",") + ")",
        t: "ผังเมืองรวม กทม. (ผังสี)", d: "สีพื้นตามประเภทการใช้ที่ดิน", keys: ks
      });
    }
    return out;
  }

  function render() {
    if (!card || !card.classList.contains("open")) return;
    var list = rows();
    card.innerHTML = '<div class="bl-h">' + ico("building-2") + ' สีบนแผนที่หมายถึงอะไร' +
      '<button type="button" class="bl-x" title="ปิด" aria-label="ปิดคำอธิบายสี">×</button></div>' +
      (list.length ? list.map(function (r) {
        return '<div class="bl-row"><span class="bl-sw' + (r.out ? " out" : "") + '" style="background:' + r.sw + '"></span>' +
          '<span class="bl-t">' + r.t + '</span><span class="bl-d">' + r.d + '</span>' + (r.keys ? keys(r.keys) : "") + '</div>';
      }).join("") : '<div class="bl-empty">ตอนนี้ไม่มีชั้นตึกหรือพื้นที่สีเปิดอยู่</div>');
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(render, 120); }

  function place() {
    var ga = $("#btnGettingAround");
    if (!pill) return;
    var left = 20;
    if (ga && ga.offsetParent && getComputedStyle(ga).display !== "none") {
      left = ga.offsetLeft + ga.offsetWidth + 8;
      pill.style.bottom = (ga.offsetParent.clientHeight - ga.offsetTop - ga.offsetHeight) + "px";
    }
    pill.style.left = left + "px";
    if (card) {
      card.style.left = (ga && ga.offsetParent ? ga.offsetLeft : 20) + "px";
      card.style.bottom = (parseFloat(pill.style.bottom || "24") + pill.offsetHeight + 8) + "px";
    }
  }

  function setOpen(open) {
    card.classList.toggle("open", open);
    pill.setAttribute("aria-expanded", String(open));
    lsSet(LS_OPEN, open ? "1" : "0");
    if (open) { place(); render(); }
  }

  function build() {
    if (built) return;
    built = true;
    var stage = $(".stage") || document.body;
    var st = document.createElement("style");
    st.id = "bldgLegendStyle";
    st.textContent = CSS;
    document.head.appendChild(st);

    pill = document.createElement("button");
    pill.type = "button";
    pill.id = "bldgLegendPill";
    pill.className = "glass-card";
    pill.title = "สีของตึกและพื้นที่บนแผนที่หมายถึงอะไร";
    pill.setAttribute("aria-expanded", "false");
    pill.setAttribute("aria-controls", "bldgLegend");
    pill.innerHTML = '<span class="bl-dots"><i style="background:#38BDF8"></i><i style="background:#EDA340"></i><i style="background:#B85A3F"></i></span><span>สีตึก</span>';
    stage.appendChild(pill);

    card = document.createElement("div");
    card.id = "bldgLegend";
    card.className = "glass-card";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-label", "คำอธิบายสีบนแผนที่");
    stage.appendChild(card);

    pill.addEventListener("click", function () { setOpen(!card.classList.contains("open")); });
    card.addEventListener("click", function (e) { if (e.target.closest(".bl-x")) setOpen(false); });
    window.addEventListener("resize", place);
    /* ปุ่ม "การเดินทาง" เปลี่ยนความกว้างตามฟอนต์ที่โหลดทีหลัง → วางใหม่อีกรอบ */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    place();
    if (lsGet(LS_OPEN) === "1") setOpen(true);
  }

  function mount(m) {
    /* mount ถูกเรียกซ้ำทุกครั้งที่สลับธีม (แผนที่ตัวเดิม) — ผูก event ครั้งเดียวต่อแผนที่ */
    if (m !== map) {
      /* เปิด/ปิดชั้นใดก็ตาม = setLayoutProperty → styledata */
      m.on("styledata", schedule);
    }
    map = m;
    build();
    place();
    schedule();
  }

  window.BKK_BLDG_LEGEND = { mount: mount, refresh: schedule };
})();
