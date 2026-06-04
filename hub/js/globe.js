/* ──────────────────────────────────────────────────────────────
   Hero rotating wireframe-dotted globe (vanilla JS + D3)
   Adapted from a React/D3 component → themed cyan for รัฐไทยก้าวหน้า.
   Decorative background: auto-rotates, pointer-events disabled
   (never steals the page scroll), graceful if data fails to load.
   ────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  const canvas = document.getElementById("hero-globe");
  if (!canvas || typeof d3 === "undefined") return;
  const context = canvas.getContext("2d");
  if (!context) return;

  const CYAN = "0,229,255";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0, height = 0, radius = 0, dpr = 1;
  let projection, path;
  const rotation = [0, -12];           // start tilted a touch
  const rotationSpeed = reduceMotion ? 0 : 0.16;
  const allDots = [];
  let landFeatures = null;
  let timer = null;
  let autoRotate = !reduceMotion;
  let dragging = false;

  /* ── geometry helpers (point-in-polygon land sampling) ── */
  function pointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  function pointInFeature(point, feature) {
    const g = feature.geometry;
    if (g.type === "Polygon") {
      if (!pointInPolygon(point, g.coordinates[0])) return false;
      for (let i = 1; i < g.coordinates.length; i++) if (pointInPolygon(point, g.coordinates[i])) return false;
      return true;
    }
    if (g.type === "MultiPolygon") {
      for (const poly of g.coordinates) {
        if (pointInPolygon(point, poly[0])) {
          let inHole = false;
          for (let i = 1; i < poly.length; i++) if (pointInPolygon(point, poly[i])) { inHole = true; break; }
          if (!inHole) return true;
        }
      }
    }
    return false;
  }

  function buildDots(feature, spacing) {
    const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature);
    const step = spacing * 0.08;
    for (let lng = minLng; lng <= maxLng; lng += step) {
      for (let lat = minLat; lat <= maxLat; lat += step) {
        if (pointInFeature([lng, lat], feature)) allDots.push({ lng, lat });
      }
    }
  }

  /* ── sizing (sphere occupies the right side of the hero) ── */
  function setSize() {
    const vw = window.innerWidth;
    const base = vw <= 768
      ? Math.min(vw * 0.92, 440)
      : Math.min(vw * 0.46, 620);
    width = base;
    height = base;
    radius = base / 2.15;
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    projection = d3.geoOrthographic()
      .scale(radius)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .rotate(rotation);
    path = d3.geoPath().projection(projection).context(context);
  }

  /* ── draw ── */
  function render() {
    context.clearRect(0, 0, width, height);
    const cx = width / 2, cy = height / 2, r = projection.scale();

    // glassy ocean sphere
    const ocean = context.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
    ocean.addColorStop(0, "rgba(8,26,38,0.55)");
    ocean.addColorStop(1, "rgba(2,8,14,0.30)");
    context.beginPath();
    context.arc(cx, cy, r, 0, 2 * Math.PI);
    context.fillStyle = ocean;
    context.fill();

    // glowing rim
    context.save();
    context.shadowColor = "rgba(" + CYAN + ",0.55)";
    context.shadowBlur = 22;
    context.strokeStyle = "rgba(" + CYAN + ",0.5)";
    context.lineWidth = 1.4;
    context.stroke();
    context.restore();

    if (!landFeatures) return;

    // graticule
    context.beginPath();
    path(d3.geoGraticule()());
    context.strokeStyle = "rgba(" + CYAN + ",0.14)";
    context.lineWidth = 0.6;
    context.stroke();

    // land outlines
    context.beginPath();
    landFeatures.features.forEach((f) => path(f));
    context.strokeStyle = "rgba(" + CYAN + ",0.38)";
    context.lineWidth = 0.9;
    context.stroke();

    // halftone dots — only the visible (front) hemisphere
    const center = [-rotation[0], -rotation[1]];
    context.fillStyle = "rgba(125,233,255,0.5)";
    for (let i = 0; i < allDots.length; i++) {
      const d = allDots[i];
      if (d3.geoDistance([d.lng, d.lat], center) > Math.PI / 2) continue; // back side
      const p = projection([d.lng, d.lat]);
      if (!p) continue;
      context.beginPath();
      context.arc(p[0], p[1], 1.05, 0, 2 * Math.PI);
      context.fill();
    }
  }

  function tick() {
    if (!autoRotate) return;
    rotation[0] += rotationSpeed;
    projection.rotate(rotation);
    render();
  }

  /* ── drag to rotate (pointer = mouse + touch) ── */
  function setupDrag() {
    let lastX = 0, lastY = 0;
    const SENS = 0.42;
    canvas.style.cursor = "grab";

    canvas.addEventListener("pointerdown", function (e) {
      dragging = true;
      autoRotate = false;
      lastX = e.clientX; lastY = e.clientY;
      canvas.classList.add("dragging");
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    });

    canvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      rotation[0] += dx * SENS;
      rotation[1] = Math.max(-90, Math.min(90, rotation[1] - dy * SENS));
      projection.rotate(rotation);
      render();
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      canvas.classList.remove("dragging");
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      if (!reduceMotion) setTimeout(function () { autoRotate = true; }, 1500);
    }
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
  }

  /* ── data load: local first, remote fallback ── */
  function loadLand() {
    const REMOTE = "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json";
    return fetch("data/land-110m.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .catch(() => fetch(REMOTE).then((r) => (r.ok ? r.json() : Promise.reject())));
  }

  /* ── init ── */
  setSize();
  render(); // show sphere immediately while land loads
  setupDrag();

  loadLand()
    .then((geo) => {
      landFeatures = geo;
      geo.features.forEach((f) => buildDots(f, 18));
      render();
      if (reduceMotion) return;            // static globe, no spin
      timer = d3.timer(tick);
    })
    .catch(() => {
      // keep the bare glowing sphere; never break the hero
    });

  // responsive
  let rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { setSize(); render(); }, 150);
  });
})();
