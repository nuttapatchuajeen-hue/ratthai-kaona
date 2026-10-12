// ชุดคำแปล (bundle) — แต่ละชุดคือไฟล์ i18n/en/<ชื่อ>.js
// ui   = ชุดที่หน้าโหลดเองตอนเปิด (ระบุใน data-dicts ของ <script src="js/i18n.js">) — common โหลดทุกหน้า
// data = ไฟล์ข้อมูลที่หน้าโหลดทีหลัง → ระบบดึงชุดของมันเองตาม _manifest.js (ชุดชื่อ d-<โฟลเดอร์>-<ไฟล์>)
//        ไฟล์ที่อยู่ใน group จะรวมเป็นชุดเดียว (เช่น รูปร่างเขตเลือกตั้งทุกจังหวัด)
module.exports = {
  ui: {
    common: [
      "js/ai-chat.js", "js/cookie-consent.js", "js/disclaimer.js", "js/global-search.js", "js/data-notice.js",
      "js/preloader.js", "js/icons.js", "js/mapzoom.js", "js/parallax.js", "js/theme-toggle-drag.js",
      "js/hub-nav.js", "js/cyber-audio.js", "js/cyber-sfx.js", "js/cyber-effects.js", "js/cursor-glow.js"
    ],
    hub: ["hub/*.html", "hub/js/*.js"],
    election: [
      "election/index.html", "election/bangkok.html", "election/committees.html", "election/credits.html",
      "election/demo-intro-youtube.html", "election/parliament.html", "election/partylist.html",
      "election/referendum.html", "election/reveal.html", "election/standings.html", "election/timeline.html",
      "election/nav.js", "election/intro.js", "election/intro-seats.js", "election/intro-youtube.js",
      "election/intro-music.js", "election/glow.js", "election/year-switch.js", "election/index-geo.js",
      "election/bangkok-geo.js", "election/timeline-data.js", "election/intro-data.js", "election/referendum-data.js",
      "election/bkk-history.js", "election/bkk-years.js", "election/bkk-oldyear.js", "election/index-oldyear.js"
    ],
    cabinet: ["cabinet/index.html"],
    structure: ["structure.html", "structure-detail.js", "js/structure-*.js"],
    "structure-data": ["structure-data.js", "structure-deep.js"],
    stats: ["stats/index.html", "stats/tax-simulator.html", "stats/tax-simulator.js", "stats/th-map.js"],
    explore: [
      "stats/explore.html", "stats/explore-data.js", "stats/climate-map.js", "stats/co2-map.js",
      "stats/tsunami-sim.js", "stats/bh3d.js", "stats/enso-sst.js", "stats/bkk-districts.js", "stats/bkk-metrics.js",
      "stats/paleo-drift.js", "stats/ai-how.js", "stats/ai-how-2.js", "stats/ai-how-3.js", "stats/ai-how-data.js"
    ],
    bkkcity: [
      "stats/bkk-city.html", "stats/bkk-datacenter.js", "stats/bkk-zoning.js", "stats/bkk-brand-logos.js",
      "stats/bkk-landmark-icons.js", "stats/bkk-3d-host.js", "stats/bkk-elevated.js", "stats/bkk-traffic.js",
      "stats/bkk-rail3d.js", "stats/bkk-airport3d.js", "stats/bkk-port3d.js", "stats/bkk-bus3d.js", "stats/bkk-flood.js",
      "stats/bkk-rivers.js", "stats/bkk-fuel.js", "stats/bkk-ev.js", "stats/bkk-nature.js", "stats/bkk-dam.js",
      "stats/bkk-warn.js", "stats/bkk-cctv.js", "stats/bkk-quake.js", "stats/bkk-landslide.js", "stats/bkk-air.js",
      "stats/bkk-emergency.js", "stats/bkk-floodsim-extra.js", "stats/bkk-sealevel.js", "stats/bkk-floodsim.js",
      "stats/bkk-landmarks3d.js", "stats/bkk-shadow.js", "stats/bkk-menu-cats.js", "stats/bkk-bldg-legend.js",
      "stats/bkk-aircraft-models.js", "stats/bkk-train-models.js", "stats/bkk-fuel-logos.js", "stats/landmarks3d/manifest.js"
    ],
    // solar-atlas/ มีโหมดอังกฤษในตัวเอง (S.lang ใน app.js ผูกกับ md-lang แล้ว) — ไม่ต้องแปลซ้ำ
    solar: ["stats/orrery.html"],
    misc: ["404.html", "index.html"]
  },
  data: [
    "election/detail-*.js", "election/year-*.js", "election/parliament-*.js", "election/partylist-*.js",
    "election/standings-*.js", "election/bkk-25*.js", "election/bkk-gov-profiles.js", "election/bkk-photos*.js",
    "election/partylist-profiles.js", "election/index-photos.js", "election/zone-areas.js", "election/index-data.js",
    "election/bangkok-data.js", "election/parliament-data.js", "election/district-shapes/*.js",
    "stats/bkk-*-data.js", "stats/bkk-slide-safe.js", "stats/bkk-districts-geo.js"
  ],
  groups: {
    "election/district-shapes/": "d-election-shapes"
  }
};
