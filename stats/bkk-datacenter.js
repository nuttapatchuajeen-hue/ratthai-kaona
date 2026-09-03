/**
 * bkk-datacenter.js
 * ชั้นแผนที่ + แผงข้อมูล "ศูนย์ข้อมูล (Data Center) ในกรุงเทพฯ" สำหรับ bkk-city.html
 *
 * ออกแบบให้เป็นโมดูลแยก แตะไฟล์หลักน้อยที่สุด — bkk-city.html เรียก
 * window.BKK_DC.mount(map, STATE) หนึ่งบรรทัดหลังจากแผนที่พร้อม (STATE.ready)
 * mount() ถูกเรียกซ้ำได้ทุกครั้งที่สลับธีม (style.load ล้างเลเยอร์ทิ้ง) — ปลอดภัย
 */
(function() {
  "use strict";

  var map = null, uiReady = false, visible = true, view = "list", currentId = null;

  function $(s, r) { return (r || document).querySelector(s); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function num(v) { return v == null ? "–" : Number(v).toLocaleString("en-US"); }
  function DATA() { return window.BKK_DATACENTERS; }

  /* ---------------------------------------------------------------- สไตล์ */
  function injectCSS() {
    if ($("#dcxStyle")) return;
    var css = document.createElement("style");
    css.id = "dcxStyle";
    css.textContent = [
      "#dcxPanel{position:absolute;right:0;top:0;bottom:0;width:420px;max-width:100%;",
      "  background:var(--card-bg);border-left:1px solid var(--card-border);z-index:41;",
      "  box-shadow:-12px 0 40px rgba(0,0,0,.15);display:flex;flex-direction:column;",
      "  transform:translateX(100%);transition:transform .3s cubic-bezier(.16,1,.3,1);",
      "  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}",
      "#dcxPanel.open{transform:translateX(0)}",
      "@media(max-width:900px){#dcxPanel{width:100%}}",
      ".dcx-head{padding:16px 18px 12px;border-bottom:1px solid var(--card-border);flex:none}",
      ".dcx-head h3{margin:0 0 2px;font-size:15.5px;font-weight:800;color:var(--text-main);letter-spacing:-.01em}",
      ".dcx-head p{margin:0;font-size:11.5px;color:var(--text-sub);line-height:1.5}",
      ".dcx-x{position:absolute;top:12px;right:14px;width:28px;height:28px;border:0;border-radius:8px;",
      "  background:var(--accent-soft);color:var(--text-main);font-size:16px;line-height:1;cursor:pointer}",
      ".dcx-tabs{display:flex;gap:6px;padding:10px 18px 0}",
      ".dcx-tab{flex:1;padding:7px 10px;border:1px solid var(--card-border);border-radius:9px;background:none;",
      "  font-family:inherit;font-size:12px;font-weight:700;color:var(--text-muted);cursor:pointer}",
      ".dcx-tab.on{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}",
      ".dcx-body{flex:1;overflow-y:auto;padding:14px 18px 26px}",
      ".dcx-item{width:100%;text-align:left;display:block;padding:11px 12px;margin-bottom:8px;cursor:pointer;",
      "  border:1px solid var(--card-border);border-left-width:4px;border-radius:10px;background:none;font-family:inherit}",
      ".dcx-item:hover{background:var(--accent-soft)}",
      ".dcx-item b{display:block;font-size:13px;color:var(--text-main);margin-bottom:3px}",
      ".dcx-item span{font-size:11px;color:var(--text-muted)}",
      ".dcx-pill{display:inline-block;padding:1px 7px;border-radius:999px;font-size:10px;font-weight:800;color:#fff}",
      ".dcx-fact{border:1px solid var(--card-border);border-radius:11px;padding:12px 13px;margin-bottom:9px}",
      ".dcx-fact .t{display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:800;color:var(--text-muted);",
      "  text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px}",
      ".dcx-fact .h{font-size:19px;font-weight:800;color:var(--text-main);letter-spacing:-.02em;margin-bottom:6px}",
      ".dcx-fact .b{font-size:12px;line-height:1.65;color:var(--text-muted)}",
      ".dcx-fact .s{margin-top:7px;padding-top:7px;border-top:1px dashed var(--card-border);font-size:11px;color:var(--text-sub)}",
      ".dcx-fact.warn{border-left:4px solid #F59E0B}.dcx-fact.bad{border-left:4px solid #EF4444}",
      ".dcx-fact.ok{border-left:4px solid #10B981}",
      ".dcx-bar{display:flex;align-items:center;gap:8px;margin-bottom:5px;font-size:11.5px;color:var(--text-muted)}",
      ".dcx-bar i{width:62px;flex:none;font-style:normal;text-align:right}",
      ".dcx-bar u{flex:1;height:9px;border-radius:5px;background:var(--accent-soft);text-decoration:none;overflow:hidden;display:block}",
      ".dcx-bar u b{display:block;height:100%;border-radius:5px;background:var(--accent)}",
      ".dcx-bar em{width:18px;flex:none;font-style:normal;font-weight:800;color:var(--text-main);text-align:right}",
      ".dcx-h4{margin:16px 0 8px;font-size:12px;font-weight:800;color:var(--text-main);text-transform:uppercase;letter-spacing:.05em}",
      ".dcx-tl{border-left:2px solid var(--card-border);padding-left:12px;margin-left:4px}",
      ".dcx-tl div{margin-bottom:9px;font-size:11.5px;line-height:1.6;color:var(--text-muted)}",
      ".dcx-tl b{display:block;color:var(--text-main);font-size:11px;letter-spacing:.02em}",
      ".dcx-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 12px}",
      ".dcx-cell{border:1px solid var(--card-border);border-radius:9px;padding:8px 10px}",
      ".dcx-cell i{display:block;font-style:normal;font-size:10px;font-weight:700;color:var(--text-sub);",
      "  text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px}",
      ".dcx-cell b{font-size:14.5px;color:var(--text-main)}.dcx-cell b small{font-size:10.5px;color:var(--text-sub);font-weight:600}",
      ".dcx-note{border:1px dashed var(--card-border);border-radius:9px;padding:10px 11px;margin:10px 0;",
      "  font-size:11.5px;line-height:1.65;color:var(--text-muted)}",
      ".dcx-src{font-size:11px;line-height:1.9;color:var(--text-sub)}",
      ".dcx-src a{color:var(--accent);text-decoration:none}.dcx-src a:hover{text-decoration:underline}",
      ".dcx-back{border:0;background:none;font-family:inherit;font-size:11.5px;font-weight:700;color:var(--accent);",
      "  cursor:pointer;padding:0 0 10px}",
      ".dcx-legend{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}",
      ".dcx-legend span{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;color:var(--text-muted)}",
      ".dcx-legend i{width:9px;height:9px;border-radius:3px;display:block}"
    ].join("");
    document.head.appendChild(css);
  }

  /* ------------------------------------------------------- ชั้นบนแผนที่ */
  function addLayers() {
    var D = DATA();
    if (!map || !D) return;

    if (!map.getSource("bkk-dc-3d")) map.addSource("bkk-dc-3d", { type: "geojson", data: D.polygons });
    if (!map.getSource("bkk-dc-pts")) map.addSource("bkk-dc-pts", { type: "geojson", data: D.points });

    if (!map.getLayer("bkk-dc-model")) {
      map.addLayer({
        id: "bkk-dc-model",
        type: "fill-extrusion",
        source: "bkk-dc-3d",
        minzoom: 12.5,
        paint: {
          "fill-extrusion-color": ["get", "color"],
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["coalesce", ["get", "min_height"], 0],
          "fill-extrusion-opacity": ["interpolate", ["linear"], ["zoom"], 12.5, 0, 13.6, 0.94],
          "fill-extrusion-vertical-gradient": true
        }
      });
      map.on("click", "bkk-dc-model", function(e) {
        if (e.features && e.features.length) openDC(e.features[0].properties.id);
      });
      map.on("mouseenter", "bkk-dc-model", function() { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "bkk-dc-model", function() { map.getCanvas().style.cursor = ""; });
    }

    if (!map.getLayer("bkk-dc-glow")) {
      map.addLayer({
        id: "bkk-dc-glow",
        type: "circle",
        source: "bkk-dc-pts",
        minzoom: 9.5,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 14, 13, 17, 22],
          "circle-color": ["get", "chip"],
          "circle-opacity": 0.22,
          "circle-stroke-width": 2,
          "circle-stroke-color": ["get", "chip"],
          "circle-stroke-opacity": 0.85
        }
      });
      map.on("click", "bkk-dc-glow", function(e) {
        if (e.features && e.features.length) openDC(e.features[0].properties.id);
      });
      map.on("mouseenter", "bkk-dc-glow", function() { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "bkk-dc-glow", function() { map.getCanvas().style.cursor = ""; });
    }

    if (!map.getLayer("bkk-dc-label")) {
      map.addLayer({
        id: "bkk-dc-label",
        type: "symbol",
        source: "bkk-dc-pts",
        minzoom: 12.2,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 12.2, 10, 16, 12.5],
          "text-offset": [0, 1.6],
          "text-anchor": "top",
          "text-allow-overlap": false
        },
        paint: {
          "text-color": ["get", "chip"],
          "text-halo-color": "rgba(255,255,255,.92)",
          "text-halo-width": 1.7
        }
      });
    }

    applyVisibility();
  }

  function applyVisibility() {
    ["bkk-dc-model", "bkk-dc-glow", "bkk-dc-label"].forEach(function(id) {
      if (map && map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
    });
  }

  /* -------------------------------------------------------------- แผงข้อมูล */
  function buildUI() {
    var D = DATA();
    if (!D) return;
    injectCSS();

    // 1) ชิปในแถบตัวกรองด้านบน
    var bar = $(".filter-bar");
    if (bar && !$("#chipDataCenters")) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip active";
      chip.id = "chipDataCenters";
      chip.title = "ศูนย์ข้อมูล (Data Center) ในกรุงเทพฯ — กดค้างที่ปุ่มเพื่อเปิด/ปิดชั้น";
      chip.innerHTML = '<span>' + ico("building-2") + ' ศูนย์ข้อมูล</span><span class="chip-count">' +
        D.rawList.length + '</span>';
      chip.addEventListener("click", function() { openPanel("list"); });
      bar.insertBefore(chip, bar.children[3] || null);
    }

    // 2) ปุ่มเปิด/ปิดชั้นในเมนูซ้าย
    var menu = $("#leftMenu");
    if (menu && !$("#btnDataCentersToggle")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "menu-btn active";
      btn.id = "btnDataCentersToggle";
      btn.title = "เปิด/ปิดชั้นศูนย์ข้อมูล";
      btn.innerHTML = '<span>' + ico("layers") + '</span><span class="label-text"> ศูนย์ข้อมูล</span>';
      btn.addEventListener("click", function() {
        visible = !visible;
        btn.classList.toggle("active", visible);
        var c = $("#chipDataCenters"); if (c) c.classList.toggle("active", visible);
        applyVisibility();
      });
      menu.appendChild(btn);
    }

    // 3) แผงเลื่อนด้านขวา
    if (!$("#dcxPanel")) {
      var stage = $(".stage") || document.body;
      var p = document.createElement("div");
      p.id = "dcxPanel";
      p.innerHTML =
        '<div class="dcx-head">' +
          '<h3>' + ico("building-2") + ' ศูนย์ข้อมูลในกรุงเทพฯ</h3>' +
          '<p>ที่ตั้งจริงจาก PeeringDB · ผลกระทบจาก กฟน. กปน. และ JustPow · ปรับปรุง ' +
          D.impact.updated + '</p>' +
          '<button type="button" class="dcx-x" id="dcxClose">×</button>' +
        '</div>' +
        '<div class="dcx-tabs">' +
          '<button type="button" class="dcx-tab on" data-view="list">อาคาร ' + D.rawList.length + ' แห่ง</button>' +
          '<button type="button" class="dcx-tab" data-view="impact">ผลกระทบจริง</button>' +
        '</div>' +
        '<div class="dcx-body" id="dcxBody"></div>';
      stage.appendChild(p);

      $("#dcxClose").addEventListener("click", closePanel);
      Array.prototype.forEach.call(p.querySelectorAll(".dcx-tab"), function(t) {
        t.addEventListener("click", function() { openPanel(t.getAttribute("data-view")); });
      });
    }

    uiReady = true;
  }

  function setTabs(v) {
    Array.prototype.forEach.call(document.querySelectorAll(".dcx-tab"), function(t) {
      t.classList.toggle("on", t.getAttribute("data-view") === v);
    });
  }

  function openPanel(v) {
    if (!uiReady) buildUI();
    view = v || "list";
    setTabs(view);
    render();
    var el = $("#dcxPanel"); if (el) el.classList.add("open");
    var pd = $("#projectDrawer"); if (pd) pd.classList.remove("open");  // ไม่ให้ซ้อนกับลิ้นชักโครงการ
  }

  function closePanel() {
    var el = $("#dcxPanel"); if (el) el.classList.remove("open");
  }

  function openDC(id) {
    currentId = id;
    view = "detail";
    if (!uiReady) buildUI();
    setTabs("list");
    render();
    var el = $("#dcxPanel"); if (el) el.classList.add("open");
    var pd = $("#projectDrawer"); if (pd) pd.classList.remove("open");

    var dc = DATA().rawList.filter(function(d) { return d.id === id; })[0];
    if (dc && map) {
      map.flyTo({
        center: [dc.lon, dc.lat],
        zoom: Math.max(map.getZoom(), 16.3),
        pitch: 62,
        bearing: 28,
        offset: [window.innerWidth > 900 ? -180 : 0, 0],
        duration: 1800,
        essential: true
      });
    }
  }

  /* ------------------------------------------------------------- เรนเดอร์ */
  function render() {
    var body = $("#dcxBody");
    if (!body) return;
    if (view === "impact") body.innerHTML = htmlImpact();
    else if (view === "detail") body.innerHTML = htmlDetail();
    else body.innerHTML = htmlList();

    Array.prototype.forEach.call(body.querySelectorAll("[data-dc]"), function(el) {
      el.addEventListener("click", function() { openDC(el.getAttribute("data-dc")); });
    });
    var back = body.querySelector("#dcxBack");
    if (back) back.addEventListener("click", function() { openPanel("list"); });
  }

  function htmlList() {
    var D = DATA(), T = D.tone;
    var legend = '<div class="dcx-legend">' +
      ["live", "build", "hold", "colo"].map(function(k) {
        return '<span><i style="background:' + T[k].chip + '"></i>' + T[k].label + '</span>';
      }).join("") + '</div>';

    var items = D.rawList.map(function(d) {
      var t = T[d.status === "live" && d.kind === "colo" ? "colo" : d.status];
      var mw = d.itLoadMW ? d.itLoadMW + (d.itLoadMaxMW && d.itLoadMaxMW !== d.itLoadMW ? "–" + d.itLoadMaxMW : "") + " MW" : "ไม่เปิดเผยความจุ";
      return '<button type="button" class="dcx-item" data-dc="' + d.id + '" style="border-left-color:' + t.chip + '">' +
        '<b>' + d.name + '</b>' +
        '<span>เขต' + d.district + ' · ' + mw + '</span><br>' +
        '<span class="dcx-pill" style="background:' + t.chip + ';margin-top:5px;">' + t.label + '</span>' +
        '</button>';
    }).join("");

    return legend + items +
      '<div class="dcx-note">' + ico("triangle-alert") + ' รูปทรงอาคารบนแผนที่เป็น <b>มวลอาคารจำลอง</b> วางบนพิกัดจริง ' +
      'ยกเว้น Telehouse ที่ใช้รอยอาคารจริงจาก OpenStreetMap — รายละเอียดที่มาระบุไว้ในการ์ดของแต่ละหลัง</div>';
  }

  function htmlDetail() {
    var D = DATA();
    var d = D.rawList.filter(function(x) { return x.id === currentId; })[0];
    if (!d) return htmlList();
    var t = D.tone[d.status === "live" && d.kind === "colo" ? "colo" : d.status];

    function cell(label, val, unit) {
      return '<div class="dcx-cell"><i>' + label + '</i><b>' + val +
        (unit ? ' <small>' + unit + '</small>' : "") + '</b></div>';
    }

    var mw = d.itLoadMW
      ? d.itLoadMW + (d.itLoadMaxMW && d.itLoadMaxMW !== d.itLoadMW ? "–" + d.itLoadMaxMW : "")
      : "ไม่เปิดเผย";

    return '<button type="button" class="dcx-back" id="dcxBack">‹ กลับไปรายชื่อทั้งหมด</button>' +
      '<span class="dcx-pill" style="background:' + t.chip + '">' + t.label + '</span>' +
      '<h3 style="margin:8px 0 3px;font-size:17px;color:var(--text-main);">' + d.name + '</h3>' +
      '<p style="margin:0 0 4px;font-size:11.5px;color:var(--text-muted);">' + d.location + '</p>' +
      '<p style="margin:0;font-size:11.5px;color:var(--text-sub);">ผู้ให้บริการ: ' + d.operator + '</p>' +
      '<div class="dcx-grid">' +
        cell("IT LOAD", mw, d.itLoadMW ? "MW" : "") +
        cell("ชั้น / ความสูง", d.floors + " ชั้น", "≈" + d.height + " ม.") +
        cell("พื้นที่ใช้สอย", d.gfaM2 ? num(d.gfaM2) : "–", d.gfaM2 ? "ตร.ม." : "") +
        cell("ดีเซลสำรอง", d.dieselLitres ? num(d.dieselLitres) : "–", d.dieselLitres ? "ลิตร" : "") +
      '</div>' +
      '<p style="font-size:12.5px;line-height:1.75;color:var(--text-muted);margin:0 0 10px;">' + d.desc + '</p>' +
      '<div class="dcx-note">' + ico("triangle-alert") + ' <b>ผลกระทบ:</b> ' + d.impactNote + '</div>' +
      '<div class="dcx-note">' + ico("map-pin") + ' <b>รอยอาคาร:</b> ' + d.footprintSource + '</div>' +
      '<div class="dcx-h4">ที่มา</div>' +
      '<div class="dcx-src">' + d.sources.map(function(s) {
        return '› <a href="' + s.url + '" target="_blank" rel="noopener">' + s.label + '</a>';
      }).join("<br>") + '</div>';
  }

  function htmlImpact() {
    var I = DATA().impact;
    var maxN = I.districts[0].n;

    var facts = I.facts.map(function(f) {
      return '<div class="dcx-fact ' + f.tone + '">' +
        '<div class="t">' + ico(f.icon) + ' ' + f.title + '</div>' +
        '<div class="h">' + f.headline + '</div>' +
        '<div class="b">' + f.body + '</div>' +
        (f.sub ? '<div class="s">' + f.sub + '</div>' : "") +
        '</div>';
    }).join("");

    var bars = I.districts.map(function(d) {
      return '<div class="dcx-bar"><i>' + d.name + '</i><u><b style="width:' +
        Math.round(d.n / maxN * 100) + '%"></b></u><em>' + d.n + '</em></div>';
    }).join("");

    var tl = I.timeline.map(function(t) {
      return '<div><b>' + t.date + '</b>' + t.text + '</div>';
    }).join("");

    return '<div class="dcx-fact ok">' +
        '<div class="t">' + ico("building-2") + ' ภาพรวมกรุงเทพฯ</div>' +
        '<div class="h">' + I.projects.total + ' โครงการ</div>' +
        '<div class="b">เปิดใช้งานแล้ว ' + I.projects.live + ' · อยู่ระหว่างก่อสร้าง ' + I.projects.building +
        ' · อยู่ในแผน ' + I.projects.planned + '</div>' +
        '<div class="s">' + I.projects.source + '</div>' +
      '</div>' +
      '<div class="dcx-h4">กระจุกตัวรายเขต</div>' + bars +
      '<div class="dcx-h4">ผลกระทบที่วัดได้</div>' + facts +
      '<div class="dcx-h4">ลำดับเหตุการณ์</div><div class="dcx-tl">' + tl + '</div>' +
      '<div class="dcx-note">' + ico("shield-alert") + ' ' + I.caveat + '</div>' +
      '<div class="dcx-h4">ที่มาทั้งหมด</div>' +
      '<div class="dcx-src">' + I.sources.map(function(s) {
        return '› <a href="' + s.url + '" target="_blank" rel="noopener">' + s.label + '</a>';
      }).join("<br>") + '</div>';
  }

  /* ----------------------------------------------------------------- API */
  window.BKK_DC = {
    mount: function(m) {
      map = m;
      addLayers();                 // เรียกซ้ำได้ — style.load ล้างเลเยอร์ทุกครั้งที่สลับธีม
      if (!uiReady) buildUI();
    },
    open: openPanel,
    openDC: openDC,
    getMap: function() { return map; }
  };
})();
