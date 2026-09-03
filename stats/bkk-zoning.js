/**
 * bkk-zoning.js
 * ชั้นแผนที่ + แผงข้อมูล "ผังสี กทม. & วิเคราะห์ FAR / OSR" สำหรับ bkk-city.html
 *
 * ออกแบบเป็นโมดูลแยกตามสถาปัตยกรรมเดียวกับ bkk-datacenter.js
 * - window.BKK_ZONING.mount(map, STATE) เรียกหลังแผนที่พร้อม
 * - รองรับการเรียกซ้ำเมื่อสลับธีม Day/Dark/Sunset
 */
(function() {
  "use strict";

  var map = null, uiReady = false, visible = true, view = "list", currentZoneId = null, filterCat = "all";

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function ico(n) { return '<svg class="mdico"><use href="#i-' + n + '"></use></svg>'; }
  function num(v) { return v == null || isNaN(v) ? "–" : Number(v).toLocaleString("en-US", { maximumFractionDigits: 1 }); }
  function DATA() { return window.BKK_ZONING_DATA; }

  /* ---------------------------------------------------------------- สไตล์ */
  function injectCSS() {
    if ($("#znxStyle")) return;
    var css = document.createElement("style");
    css.id = "znxStyle";
    css.textContent = [
      "#znxPanel{position:absolute;right:0;top:0;bottom:0;width:440px;max-width:100%;",
      "  background:var(--card-bg);border-left:1px solid var(--card-border);z-index:41;",
      "  box-shadow:-12px 0 40px rgba(0,0,0,.15);display:flex;flex-direction:column;",
      "  transform:translateX(100%);transition:transform .3s cubic-bezier(.16,1,.3,1);",
      "  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}",
      "#znxPanel.open{transform:translateX(0)}",
      "@media(max-width:900px){#znxPanel{width:100%}}",
      ".znx-head{padding:16px 18px 12px;border-bottom:1px solid var(--card-border);flex:none;position:relative}",
      ".znx-head h3{margin:0 0 2px;font-size:16px;font-weight:800;color:var(--text-main);letter-spacing:-.01em;display:flex;align-items:center;gap:8px}",
      ".znx-head p{margin:0;font-size:11.5px;color:var(--text-sub);line-height:1.5}",
      ".znx-x{position:absolute;top:12px;right:14px;width:28px;height:28px;border:0;border-radius:8px;",
      "  background:var(--accent-soft);color:var(--text-main);font-size:16px;line-height:1;cursor:pointer}",
      ".znx-tabs{display:flex;gap:5px;padding:10px 18px 0;flex:none;overflow-x:auto}",
      ".znx-tab{flex:1;min-width:max-content;padding:7px 10px;border:1px solid var(--card-border);border-radius:9px;background:none;",
      "  font-family:inherit;font-size:12px;font-weight:700;color:var(--text-muted);cursor:pointer;white-space:nowrap}",
      ".znx-tab.on{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}",
      ".znx-body{flex:1;overflow-y:auto;padding:14px 18px 26px}",
      ".znx-cats{display:flex;gap:5px;margin-bottom:12px;overflow-x:auto;padding-bottom:2px}",
      ".znx-cat-btn{padding:4px 9px;font-size:11px;font-weight:700;border-radius:999px;border:1px solid var(--card-border);",
      "  background:none;color:var(--text-muted);cursor:pointer;white-space:nowrap}",
      ".znx-cat-btn.on{background:var(--text-main);color:var(--bg-page);border-color:var(--text-main)}",
      ".znx-item{width:100%;text-align:left;display:block;padding:12px 13px;margin-bottom:8px;cursor:pointer;",
      "  border:1px solid var(--card-border);border-left-width:5px;border-radius:10px;background:none;font-family:inherit;transition:all .15s ease}",
      ".znx-item:hover{background:var(--accent-soft);transform:translateX(2px)}",
      ".znx-item-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}",
      ".znx-badge{font-size:11px;font-weight:800;color:#fff;padding:2px 7px;border-radius:6px;letter-spacing:.02em}",
      ".znx-far-tag{font-size:11px;font-weight:800;color:var(--accent);background:var(--accent-soft);padding:2px 7px;border-radius:6px}",
      ".znx-item-title{font-size:13.5px;font-weight:700;color:var(--text-main);margin-bottom:3px;line-height:1.4}",
      ".znx-item-desc{font-size:11.5px;color:var(--text-sub);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
      ".znx-back{display:inline-flex;align-items:center;gap:4px;background:none;border:0;color:var(--accent);font-size:12px;font-weight:700;cursor:pointer;padding:0;margin-bottom:12px}",
      ".znx-detail-box{border:1px solid var(--card-border);border-radius:12px;padding:14px;margin-bottom:12px;background:rgba(255,255,255,0.02)}",
      ".znx-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}",
      ".znx-grid-cell{border:1px solid var(--card-border);border-radius:9px;padding:10px 11px;background:var(--accent-soft)}",
      ".znx-cell-k{font-size:10.5px;font-weight:700;color:var(--text-sub);text-transform:uppercase;margin-bottom:2px}",
      ".znx-cell-v{font-size:17px;font-weight:800;color:var(--text-main)}",
      ".znx-cell-u{font-size:11px;color:var(--text-muted);font-weight:600;margin-left:3px}",
      ".znx-sim-card{border:1px solid var(--card-border);border-radius:12px;padding:16px;margin-bottom:14px;background:var(--accent-soft)}",
      ".znx-sim-title{font-size:13.5px;font-weight:800;color:var(--text-main);margin-bottom:10px;display:flex;align-items:center;gap:6px}",
      ".znx-input-row{display:flex;gap:6px;margin-bottom:10px}",
      ".znx-input-col{flex:1}",
      ".znx-input-col label{display:block;font-size:11px;font-weight:600;color:var(--text-sub);margin-bottom:3px}",
      ".znx-input-col input,.znx-input-col select{width:100%;padding:7px 8px;border:1px solid var(--card-border);border-radius:8px;",
      "  background:var(--card-bg);color:var(--text-main);font-size:13px;font-family:inherit;font-weight:700}",
      ".znx-checkbox-grp{margin:10px 0}",
      ".znx-check-item{display:flex;align-items:flex-start;gap:7px;margin-bottom:6px;font-size:11.5px;color:var(--text-muted);cursor:pointer}",
      ".znx-check-item input{margin-top:2px;cursor:pointer}",
      ".znx-res-box{border:1px solid var(--accent);border-radius:10px;padding:12px;background:var(--card-bg);margin-top:10px}",
      ".znx-res-row{display:flex;justify-content:space-between;align-items:baseline;padding:4px 0;border-bottom:1px dashed var(--card-border);font-size:12px}",
      ".znx-res-row:last-child{border-bottom:0;padding-top:6px;font-weight:800}",
      ".znx-res-val{font-weight:800;color:var(--accent);font-size:14px}",
      ".znx-rule-card{border:1px solid var(--card-border);border-radius:10px;padding:12px;margin-bottom:9px;background:none}",
      ".znx-rule-card h4{margin:0 0 4px;font-size:12.5px;font-weight:800;color:var(--text-main);display:flex;align-items:center;gap:6px}",
      ".znx-rule-card p{margin:0;font-size:11.5px;color:var(--text-muted);line-height:1.6}"
    ].join("");
    document.head.appendChild(css);
  }

  /* ------------------------------------------------------- ชั้นบนแผนที่ */
  function addLayers() {
    var D = DATA();
    if (!map || !D) return;

    if (!map.getSource("bkk-zoning-src")) map.addSource("bkk-zoning-src", { type: "geojson", data: D.polygons });
    if (!map.getSource("bkk-zoning-pts")) map.addSource("bkk-zoning-pts", { type: "geojson", data: D.points });

    // 1. Fill Layer
    if (!map.getLayer("bkk-zoning-fill")) {
      map.addLayer({
        id: "bkk-zoning-fill",
        type: "fill",
        source: "bkk-zoning-src",
        minzoom: 8.5,
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": [
            "interpolate", ["linear"], ["zoom"],
            9, 0.25,
            13, 0.32,
            16, 0.18
          ]
        }
      });

      map.on("click", "bkk-zoning-fill", function(e) {
        if (e.features && e.features.length) openZone(e.features[0].properties.id);
      });
      map.on("mouseenter", "bkk-zoning-fill", function() { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "bkk-zoning-fill", function() { map.getCanvas().style.cursor = ""; });
    }

    // 2. Outline Layer
    if (!map.getLayer("bkk-zoning-line")) {
      map.addLayer({
        id: "bkk-zoning-line",
        type: "line",
        source: "bkk-zoning-src",
        minzoom: 8.5,
        paint: {
          "line-color": ["get", "color"],
          "line-width": [
            "interpolate", ["linear"], ["zoom"],
            9, 1.2,
            14, 2.2
          ],
          "line-opacity": 0.8
        }
      });
    }

    // 3. Label Layer
    if (!map.getLayer("bkk-zoning-label")) {
      map.addLayer({
        id: "bkk-zoning-label",
        type: "symbol",
        source: "bkk-zoning-pts",
        minzoom: 11,
        layout: {
          "text-field": ["get", "code"],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 11, 10.5, 14, 13.5],
          "text-allow-overlap": false
        },
        paint: {
          "text-color": "#FFFFFF",
          "text-halo-color": ["get", "color"],
          "text-halo-width": 2.2
        }
      });
      map.on("click", "bkk-zoning-label", function(e) {
        if (e.features && e.features.length) openZone(e.features[0].properties.id);
      });
    }

    applyVisibility();
  }

  function applyVisibility() {
    ["bkk-zoning-fill", "bkk-zoning-line", "bkk-zoning-label"].forEach(function(id) {
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
    if (bar && !$("#chipZoning")) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip active";
      chip.id = "chipZoning";
      chip.title = "ผังสี กทม. — กดเพื่อเปิดแผงวิเคราะห์ FAR / OSR และศักยภาพที่ดิน";
      chip.innerHTML = '<span>' + ico("map-pin") + ' ผังสี กทม.</span><span class="chip-count">' +
        D.zones.length + ' โซน</span>';
      chip.addEventListener("click", function() { openPanel("list"); });
      bar.insertBefore(chip, bar.children[2] || null);
    }

    // 2) ปุ่มเปิด/ปิดชั้นในเมนูซ้าย
    var menu = $("#leftMenu");
    if (menu && !$("#btnZoningToggle")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "menu-btn active";
      btn.id = "btnZoningToggle";
      btn.title = "เปิด/ปิดชั้นผังสี กทม.";
      btn.innerHTML = '<span>' + ico("layers") + '</span><span class="label-text"> ผังสี กทม.</span>';
      btn.addEventListener("click", function() {
        visible = !visible;
        btn.classList.toggle("active", visible);
        var c = $("#chipZoning"); if (c) c.classList.toggle("active", visible);
        applyVisibility();
      });
      menu.appendChild(btn);
    }

    // 3) แผงเลื่อนด้านขวา
    if (!$("#znxPanel")) {
      var stage = $(".stage") || document.body;
      var p = document.createElement("div");
      p.id = "znxPanel";
      p.innerHTML =
        '<div class="znx-head">' +
          '<h3>' + ico("map-pin") + ' ผังสี กทม. & FAR/OSR Intel</h3>' +
          '<p>ผังเมืองรวมกรุงเทพมหานคร · สิทธิประโยชน์อาคารสูงและ FAR Bonus</p>' +
          '<button type="button" class="znx-x" id="znxClose">×</button>' +
        '</div>' +
        '<div class="znx-tabs">' +
          '<button type="button" class="znx-tab on" data-view="list">ผัง 22 โซน</button>' +
          '<button type="button" class="znx-tab" data-view="simulator">คำนวณ FAR</button>' +
          '<button type="button" class="znx-tab" data-view="rules">กฎเกณฑ์ผังเมือง</button>' +
        '</div>' +
        '<div class="znx-body" id="znxBody"></div>';
      stage.appendChild(p);

      $("#znxClose").addEventListener("click", closePanel);
      Array.prototype.forEach.call(p.querySelectorAll(".znx-tab"), function(t) {
        t.addEventListener("click", function() { openPanel(t.getAttribute("data-view")); });
      });
    }

    uiReady = true;
  }

  function setTabs(v) {
    Array.prototype.forEach.call(document.querySelectorAll(".znx-tab"), function(t) {
      t.classList.toggle("on", t.getAttribute("data-view") === v);
    });
  }

  function openPanel(v) {
    if (!uiReady) buildUI();
    view = v || "list";
    setTabs(view);
    render();
    var el = $("#znxPanel"); if (el) el.classList.add("open");
    var pd = $("#projectDrawer"); if (pd) pd.classList.remove("open");
    var dc = $("#dcxPanel"); if (dc) dc.classList.remove("open");
  }

  function closePanel() {
    var el = $("#znxPanel"); if (el) el.classList.remove("open");
    currentZoneId = null;
  }

  function openZone(id) {
    currentZoneId = id;
    openPanel("detail");
    var D = DATA();
    var z = D.zones.find(function(item) { return item.id === id; });
    if (z && map) {
      map.flyTo({ center: z.center, zoom: Math.max(map.getZoom(), 13.5), duration: 1200 });
    }
  }

  /* ------------------------------------------------------------- Renderers */
  function render() {
    var body = $("#znxBody");
    if (!body) return;
    if (view === "detail" && currentZoneId) {
      body.innerHTML = htmlDetail(currentZoneId);
      bindDetailEvents();
    } else if (view === "simulator") {
      body.innerHTML = htmlSimulator();
      bindSimEvents();
    } else if (view === "rules") {
      body.innerHTML = htmlRules();
    } else {
      body.innerHTML = htmlList();
      bindListEvents();
    }
  }

  function htmlList() {
    var D = DATA();
    var cats = [
      { id: "all", label: "ทั้งหมด (" + D.zones.length + ")" },
      { id: "commercial", label: "พาณิชยกรรม (แดง)" },
      { id: "residential_high", label: "คอนโดหนาแน่น (น้ำตาล)" },
      { id: "residential_med", label: "ที่อยู่อาศัย (ส้ม)" },
      { id: "residential_low", label: "ชานเมือง (เหลือง)" },
      { id: "industrial", label: "อุตสาหกรรม (ม่วง)" },
      { id: "rural_conservation", label: "เกษตร/ฟลัดเวย์ (เขียว)" },
      { id: "government", label: "ราชการ (น้ำเงิน)" }
    ];

    var catButtons = cats.map(function(c) {
      var on = c.id === filterCat ? " on" : "";
      return '<button type="button" class="znx-cat-btn' + on + '" data-cat="' + c.id + '">' + c.label + '</button>';
    }).join("");

    var filtered = D.zones.filter(function(z) {
      return filterCat === "all" || z.category === filterCat;
    });

    var items = filtered.map(function(z) {
      return '<button type="button" class="znx-item" data-id="' + z.id + '" style="border-left-color:' + z.color + '">' +
        '<div class="znx-item-top">' +
          '<span class="znx-badge" style="background:' + z.color + '">' + z.code + '</span>' +
          '<span class="znx-far-tag">FAR ' + z.far + (typeof z.far === "number" ? " : 1" : "") + '</span>' +
        '</div>' +
        '<div class="znx-item-title">' + z.title + '</div>' +
        '<div class="znx-item-desc">' + z.desc + '</div>' +
      '</button>';
    }).join("");

    return '<div class="znx-cats">' + catButtons + '</div>' + items;
  }

  function bindListEvents() {
    $$(".znx-cat-btn").forEach(function(b) {
      b.addEventListener("click", function() {
        filterCat = b.getAttribute("data-cat");
        render();
      });
    });

    $$(".znx-item").forEach(function(el) {
      el.addEventListener("click", function() {
        openZone(el.getAttribute("data-id"));
      });
    });
  }

  function htmlDetail(id) {
    var D = DATA();
    var z = D.zones.find(function(item) { return item.id === id; });
    if (!z) return '<p>ไม่พบข้อมูลโซน</p>';

    var cat = D.categories[z.category] || {};

    return '<button type="button" class="znx-back" id="znxBack">‹ กลับไปรายการโซนทั้งหมด</button>' +
      '<div class="znx-detail-box" style="border-left:5px solid ' + z.color + '">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
          '<span class="znx-badge" style="background:' + z.color + ';font-size:12px;padding:3px 9px;">' + z.code + ' · ' + (cat.name || "") + '</span>' +
        '</div>' +
        '<h3 style="margin:6px 0 6px;font-size:17px;color:var(--text-main);">' + z.title + '</h3>' +
        '<p style="margin:0 0 10px;font-size:12px;color:var(--text-muted);line-height:1.6;">' + z.desc + '</p>' +
        '<div class="znx-grid">' +
          '<div class="znx-grid-cell"><div class="znx-cell-k">FAR (อัตราส่วนอาคาร/ดิน)</div><div class="znx-cell-v">' + z.far + (typeof z.far === "number" ? '<span class="znx-cell-u">เท่า</span>' : "") + '</div></div>' +
          '<div class="znx-grid-cell"><div class="znx-cell-k">OSR (พื้นที่ว่างขั้นต่ำ)</div><div class="znx-cell-v">' + z.osr + (typeof z.osr === "number" ? '<span class="znx-cell-u">%</span>' : "") + '</div></div>' +
        '</div>' +
        '<div style="font-size:12px;line-height:1.6;color:var(--text-main);margin-bottom:8px;">' +
          '<b>ข้อกำหนดความสูง:</b> ' + z.maxHeightNote +
        '</div>' +
        (z.landmarks ? '<div style="font-size:11.5px;color:var(--text-sub);line-height:1.5;"><b>แลนด์มาร์กสำคัญในโซน:</b> ' + z.landmarks + '</div>' : '') +
      '</div>' +
      '<button type="button" class="menu-btn active" id="btnLaunchSim" style="width:100%;justify-content:center;margin-top:6px;">' +
        ico("calculator") + ' คำนวณพื้นที่ก่อสร้างบนแปลงที่ดินนี้' +
      '</button>';
  }

  function bindDetailEvents() {
    var b = $("#znxBack"); if (b) b.addEventListener("click", function() { view = "list"; render(); });
    var simBtn = $("#btnLaunchSim");
    if (simBtn) simBtn.addEventListener("click", function() {
      view = "simulator";
      setTabs("simulator");
      render();
    });
  }

  /* ----------------------------------------------------------- FAR Simulator */
  function htmlSimulator() {
    var D = DATA();
    var defaultZone = currentZoneId
      ? D.zones.find(function(z) { return z.id === currentZoneId; })
      : D.zones[0];

    var options = D.zones.map(function(z) {
      var sel = (defaultZone && defaultZone.id === z.id) ? " selected" : "";
      return '<option value="' + z.id + '"' + sel + '>' + z.code + ' — ' + z.title + ' (FAR ' + z.far + ')</option>';
    }).join("");

    return '<div class="znx-sim-card">' +
      '<div class="znx-sim-title">' + ico("calculator") + ' เครื่องคำนวณศักยภาพที่ดิน (FAR Simulator)</div>' +
      '<div class="znx-input-col" style="margin-bottom:10px;">' +
        '<label>เลือกโซนผังสี</label>' +
        '<select id="simZoneSelect">' + options + '</select>' +
      '</div>' +
      '<div class="znx-input-row">' +
        '<div class="znx-input-col">' +
          '<label>ไร่</label>' +
          '<input type="number" id="simRai" min="0" value="2" step="1">' +
        '</div>' +
        '<div class="znx-input-col">' +
          '<label>งาน</label>' +
          '<input type="number" id="simNgan" min="0" max="3" value="0" step="1">' +
        '</div>' +
        '<div class="znx-input-col">' +
          '<label>ตร.วา</label>' +
          '<input type="number" id="simWah" min="0" max="99" value="0" step="1">' +
        '</div>' +
      '</div>' +
      '<div class="znx-checkbox-grp">' +
        '<label style="display:block;font-size:11px;font-weight:700;color:var(--text-sub);margin-bottom:5px;">สิทธิประโยชน์โบนัส FAR (Bonus Rules):</label>' +
        '<label class="znx-check-item"><input type="checkbox" id="chkBonusTOD" checked> <span>ใกล้สถานีรถไฟฟ้า ≤ 500 ม. (TOD +20%)</span></label>' +
        '<label class="znx-check-item"><input type="checkbox" id="chkBonusPublic"> <span>จัดลานพื้นที่โล่งสาธารณะระดับดิน (+20%)</span></label>' +
        '<label class="znx-check-item"><input type="checkbox" id="chkBonusGreen"> <span>อาคารเขียวอนุรักษ์พลังงาน LEED/TREES (+10%)</span></label>' +
        '<label class="znx-check-item"><input type="checkbox" id="chkBonusWater"> <span>บ่อหน่วงน้ำฝนแก้มลิงในอาคาร (+10%)</span></label>' +
      '</div>' +
      '<div class="znx-res-box" id="simResultBox"></div>' +
    '</div>';
  }

  function bindSimEvents() {
    function recalc() {
      var D = DATA();
      var zid = $("#simZoneSelect").value;
      var z = D.zones.find(function(item) { return item.id === zid; });
      if (!z) return;

      var rai = parseFloat($("#simRai").value) || 0;
      var ngan = parseFloat($("#simNgan").value) || 0;
      var wah = parseFloat($("#simWah").value) || 0;

      var totalWah = (rai * 400) + (ngan * 100) + wah;
      var totalM2 = totalWah * 4; // 1 ตร.ว. = 4 ตร.ม.

      var baseFar = typeof z.far === "number" ? z.far : 5.0;
      var baseOsr = typeof z.osr === "number" ? z.osr : 5.0;

      var bonusPct = 0;
      if ($("#chkBonusTOD").checked) bonusPct += 20;
      if ($("#chkBonusPublic").checked) bonusPct += 20;
      if ($("#chkBonusGreen").checked) bonusPct += 10;
      if ($("#chkBonusWater").checked) bonusPct += 10;
      bonusPct = Math.min(bonusPct, 20); // กฎหมายผังเมืองกำหนดโบนัสรวมสูงสุดไม่เกิน 20%

      var effectiveFar = baseFar * (1 + bonusPct / 100);
      var maxGFA = totalM2 * effectiveFar;
      var minOpenSpace = totalM2 * (baseOsr / 100);
      var footprintM2 = totalM2 - minOpenSpace;
      var estFloors = footprintM2 > 0 ? Math.ceil(maxGFA / (footprintM2 * 0.75)) : 1;

      $("#simResultBox").innerHTML =
        '<div class="znx-res-row"><span>ขนาดที่ดินรวม:</span><span class="znx-res-val">' + num(totalWah) + ' ตร.ว. (' + num(totalM2) + ' ตร.ม.)</span></div>' +
        '<div class="znx-res-row"><span>FAR ปกติ / โบนัส:</span><span class="znx-res-val">' + baseFar + ' → <b>' + effectiveFar.toFixed(2) + '</b> (+' + bonusPct + '%)</span></div>' +
        '<div class="znx-res-row"><span>พื้นที่ก่อสร้างสูงสุด (Max GFA):</span><span class="znx-res-val" style="color:#10B981;font-size:15.5px;">' + num(maxGFA) + ' ตร.ม.</span></div>' +
        '<div class="znx-res-row"><span>พื้นที่ว่างเปิดโล่งขั้นต่ำ (OSR):</span><span class="znx-res-val">' + num(minOpenSpace) + ' ตร.ม. (' + baseOsr + '%)</span></div>' +
        '<div class="znx-res-row"><span>ประมาณการความสูงสูงสุด:</span><span class="znx-res-val" style="color:var(--accent);">≈ ' + estFloors + ' ชั้น</span></div>';
    }

    ["simZoneSelect", "simRai", "simNgan", "simWah", "chkBonusTOD", "chkBonusPublic", "chkBonusGreen", "chkBonusWater"].forEach(function(id) {
      var el = $("#" + id);
      if (el) {
        el.addEventListener("input", recalc);
        el.addEventListener("change", recalc);
      }
    });

    recalc();
  }

  function htmlRules() {
    var D = DATA();
    var rules = D.bonusRules.map(function(r) {
      return '<div class="znx-rule-card">' +
        '<h4>' + ico(r.icon) + ' ' + r.name + ' <span class="znx-far-tag">+' + r.maxBonusPercent + '%</span></h4>' +
        '<p>' + r.desc + '</p>' +
      '</div>';
    }).join("");

    return '<div class="znx-detail-box">' +
      '<h3 style="margin:0 0 6px;font-size:14px;color:var(--text-main);">' + ico("book-open") + ' ความรู้ผังเมืองกรุงเทพมหานคร</h3>' +
      '<p style="margin:0 0 8px;font-size:12px;color:var(--text-muted);line-height:1.6;">' +
        '<b>FAR (Floor Area Ratio):</b> สัดส่วนพื้นที่อาคารรวมต่อพื้นที่ดิน เช่น ที่ดิน 1,000 ตร.ม. ในโซน FAR 10.0 จะสามารถสร้างพื้นที่อาคารรวมได้สูงสุด 10,000 ตร.ม.<br><br>' +
        '<b>OSR (Open Space Ratio):</b> สัดส่วนพื้นที่ว่างที่ต้องเปิดโล่งปราศจากหลังคาคลุมต่อพื้นที่อาคารรวม เพื่อสุขอนามัย สิ่งแวดล้อม และระบายน้ำ' +
      '</p>' +
    '</div>' +
    '<h4 style="margin:14px 0 8px;font-size:13px;color:var(--text-main);">สิทธิประโยชน์โบนัส FAR (กทม. ข้อ 4)</h4>' +
    rules +
    '<div style="margin-top:14px;padding:10px;border-radius:8px;background:var(--accent-soft);font-size:11.5px;color:var(--text-sub);line-height:1.6;">' +
      '📌 <b>หมายเหตุ:</b> การคำนวณเป็นไปตามผังเมืองรวมกรุงเทพมหานครฉบับปัจจุบัน ทั้งนี้การก่อสร้างจริงต้องเป็นไปตาม พ.ร.บ.ควบคุมอาคาร และการประเมินผลกระทบสิ่งแวดล้อม (EIA)' +
    '</div>';
  }

  /* ----------------------------------------------------------------- API */
  window.BKK_ZONING = {
    mount: function(m) {
      map = m;
      addLayers();
      if (!uiReady) buildUI();
    },
    open: openPanel,
    openZone: openZone,
    toggle: function(v) {
      if (typeof v === "boolean") visible = v;
      else visible = !visible;
      applyVisibility();
    },
    getMap: function() { return map; }
  };
})();
