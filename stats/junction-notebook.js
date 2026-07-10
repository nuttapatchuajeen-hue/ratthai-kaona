function _1(md){return(
md`# Jones Act Waiver Shipping Dashboard
## Documenting domestic cargo movements under the March 17, 2026-August 16, 2026 waiver`
)}

function _2(md){return(
md`This is the main feature of Cato's Jones Act Waiver Tracker:<br>[https://www.cato.org/jones-act-waiver-tracker](https://www.cato.org/jones-act-waiver-tracker)`
)}

function _3(md){return(
md`- Latest [MARAD data](https://www.maritime.dot.gov/ports/domestic-shipping/domestic-shipping)
- EIA [foreign imports](https://www.eia.gov/dnav/pet/pet_move_imp_dc_R10-Z00_mbbl_a.htm), [US domestic](https://www.eia.gov/dnav/pet/pet_move_tb_dc_R30-R10_mbbl_a.htm), [Puerto Rico](https://www.eia.gov/dnav/pet/pet_move_expc_dc_nus-npz_mbbl_a.htm)`
)}

async function _dashboard(style,compile,html,stats,FileAttachment,cargoLegend,ResizeObserver,invalidation,sources,regionStats)
{
  if (!document.querySelector("style[data-stkdash-style]")) {
    const styleClone = style.cloneNode(true);
    styleClone.setAttribute("data-stkdash-style", "");
    document.head.appendChild(styleClone);
  }

  if (!compile) {
    const placeholder = html`<div class="stkdash__placeholder">Attach cells to see in dashboard</div>`;
    placeholder.value = null;
    return placeholder;
  }

  const container = html`<div class="stkdash"></div>`;
  const grid = html`<div class="stkdash__grid"></div>`;
  container.appendChild(grid);

  // Stats band, spanning the full width above the route/shipment titles.
  // appendChild moves the node out of its own notebook display container.
  if (typeof stats !== "undefined" && stats) {
    const statsWrap = document.createElement("div");
    statsWrap.className = "stkdash__cell stkdash__cell--stats";
    statsWrap.appendChild(stats);
    grid.appendChild(statsWrap);
  }

  // compile.cells is [globeRoutes, timeline, routeList] (array order from the
  // compile cell). Map each to its named grid slot rather than relying on
  // visual order, so the CSS grid-template-areas control the layout.
  const [globeEl, timelineEl, routeListEl] = compile.cells;
  const slots = [
    { el: globeEl,     cls: "stkdash__cell--globe",     title: "Routes" },
    { el: timelineEl,  cls: "stkdash__cell--timeline",  title: null },
    { el: routeListEl, cls: "stkdash__cell--routelist", title: "Shipments" },
  ];

  // appendChild MOVES the node, so the notebook's own display container for
  // that cell ends up empty.
  for (const { el, cls, title } of slots) {
    if (!el) continue;
    const wrap = document.createElement("div");
    wrap.className = "stkdash__cell " + cls;
    if (title) {
      const h = document.createElement("div");
      h.className = "stkdash__title";
      h.textContent = title;
      wrap.appendChild(h);
    }
    wrap.appendChild(el);
    grid.appendChild(wrap);
  }

  // --- Cato logo ---------------------------------------------------------
  // Pin the logo to the bottom-right of the MAP itself. Like the legend, the
  // "Routes" title lives at the top of the globe *cell*, so we re-parent into
  // globeEl (the map wrapper, which sits below the title) and position it
  // absolutely there. pointer-events:none keeps it decorative so it never
  // intercepts map interaction. The bottom-right corner avoids the legend,
  // which (in wide mode) overlays the top-right.
  if (globeEl) {
    if (!globeEl.style.position) globeEl.style.position = "relative";
    const logo = await FileAttachment("Cato_Institute.svg").image();
    Object.assign(logo.style, {
      position: "absolute",
      bottom: "8px",
      right: "8px",
      left: "auto",
      top: "auto",
      width: "60px",       // adjust to taste
      height: "auto",
      opacity: "1",
      margin: "0",
      pointerEvents: "none",
      zIndex: "25",        // above the globe / its zoom hint (z-index 20)
    });
    globeEl.appendChild(logo);
  }

  // --- Cargo legend ------------------------------------------------------
  // Narrow: a normal grid cell (grid-area: legend) -> its own full-width row
  //   between the stats and the globe. Handled purely by the `style` cell.
  // Wide  : overlay the MAP's top-right corner. The "Routes" title lives at
  //   the top of the globe *cell*, so a grid-area overlay aligns to the title,
  //   not the map (the legend sticks up above the map). To pin it to the map
  //   itself we re-parent the legend into globeEl (the map wrapper, which
  //   sits below the title) and position it absolutely there.
  if (typeof cargoLegend !== "undefined" && cargoLegend) {
    const legendWrap = document.createElement("div");
    legendWrap.className = "stkdash__cell stkdash__cell--legend";
    legendWrap.appendChild(cargoLegend);
    grid.appendChild(legendWrap); // narrow default

    const WIDE_MIN = 1000; // mirrors the @container (min-width: 1000px) rule
    let mode = null;

    function setWide() {
      if (mode === "wide" || !globeEl) return;
      mode = "wide";
      if (!globeEl.style.position) globeEl.style.position = "relative";
      if (legendWrap.parentNode !== globeEl) globeEl.appendChild(legendWrap);
      Object.assign(legendWrap.style, {
        position: "absolute",
        top: "8px",
        right: "8px",
        left: "auto",
        bottom: "auto",
        width: "auto",
        maxWidth: "240px",  // keep it single-column, as before
        margin: "0",
        zIndex: "30",       // above the globe (its zoom hint is z-index 20)
        pointerEvents: "auto",
      });
    }

    function setNarrow() {
      if (mode === "narrow") return;
      mode = "narrow";
      if (legendWrap.parentNode !== grid) grid.appendChild(legendWrap);
      legendWrap.removeAttribute("style"); // hand styling back to grid-area CSS
    }

    function sync(w) {
      if (w >= WIDE_MIN) setWide(); else setNarrow();
    }

    // Mirror the container query by watching the .stkdash container's inline
    // size (container queries measure the container's content-box width).
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver((entries) => {
        for (const e of entries) sync(e.contentRect.width);
      });
      ro.observe(container);
      if (typeof invalidation !== "undefined") invalidation.then(() => ro.disconnect());
    }
    // First pass once attached (RO may not fire before initial paint).
    requestAnimationFrame(() => sync(container.clientWidth || 0));
  }

  // --- Sources line ------------------------------------------------------
  // Full-width credit row pinned to the BOTTOM in both layouts. There's no
  // grid-template-areas slot for it (that lives in the `style` cell), so we
  // span every column with grid-column: 1 / -1. Because all the named areas
  // already occupy their columns, auto-placement drops this into a new
  // implicit row beneath them — i.e. the bottom — regardless of column count.
  // text-align:center on the inner node keeps the single line centered.
  if (typeof sources !== "undefined" && sources) {
    const sourceWrap = document.createElement("div");
    sourceWrap.className = "stkdash__cell stkdash__cell--source";
    sourceWrap.style.gridColumn = "1 / -1";
    sourceWrap.appendChild(sources);
    grid.appendChild(sourceWrap);
  }

  // --- Region stats section ----------------------------------------------
  // Full-width block placed BELOW the sources line. Same mechanism as
  // `sources`: no grid-template-areas slot, so grid-column: 1 / -1 spans
  // every column and auto-placement drops it into a new implicit row.
  // Because it is appended AFTER `sources`, that row sits beneath the
  // credits. regionStats is a DOM node, so appendChild moves it out of its
  // own notebook display container (like the other cells above).
  if (typeof regionStats !== "undefined" && regionStats) {
    const regionStatsWrap = document.createElement("div");
    regionStatsWrap.className = "stkdash__cell stkdash__cell--regionstats";
    regionStatsWrap.style.gridColumn = "1 / -1";
    regionStatsWrap.style.marginTop = "24px";   // breathing room below the sources line
    regionStatsWrap.appendChild(regionStats);
    grid.appendChild(regionStatsWrap);
  }

  container.value = null;
  return container;
}


function _5(md){return(
md`----------------`
)}

function _6(md){return(
md`## Building Metro Style Edge Bundling`
)}

function _7(md){return(
md`### Prep Classification`
)}

function _8(md){return(
md`To make this chart work, we need to create a hierarchical edge bundled network, and then space the routes in each bundle so they can be counted. Let's start by classifying the basic types of connections in the network.`
)}

async function _9(FileAttachment,md){return(
md`Ships can travel over 3 basic types of spokes between waypoints:
- **\`links\`** are rivers. These bundles should be center justified
- **\`edges\`** are coastlines. These bundles should start on the coastline and then extend into the area so it doesn't look like route go through land.
- **\`areas\`** are oceans or lakes. These should also be center justified

Using the first letter of these 3 spoke types, we can classify 6 path junctions. The order of the letters does not matter:

<img src="${await FileAttachment("image.png").url()}" width="600">`
)}

function _10(md){return(
md`### Multi-way Junction`
)}

function _config()
{
  const size = 600;
  const center = size / 2;
  const radius = size * 0.36;
  const nodeLabelOffset = 28;
  const strokeWidth = 3;
  const bundleSpacing = strokeWidth * 3;
  const minGap = 20 * Math.PI / 180;

  // 10 nodes clockwise from top
  const nodeTypes = [
    "link", "edge", "area", "edge", "link",
    "edge", "area", "area", "edge", "link"
  ];
  const n = nodeTypes.length;

  // Contiguous node ranges connected directly (not through junction)
  const areaSegments = [[1, 2, 3], [5, 6, 7, 8]];
  const segmentOfNode = new Array(n).fill(null);
  areaSegments.forEach((seg, i) => seg.forEach(node => (segmentOfNode[node] = i)));

  // CMY scheme — keyed both orderings since classify() sorts alphabetically
  const pathColors = {
    ll: "#b36db0",
    le: "#ff725c", el: "#ff725c",
    la: "#4269d0", al: "#4269d0",
    ee: "#efb118",
    ea: "#3ca951", ae: "#3ca951",
    aa: "#29cce2",
  };
  const typeColors = {
    link: "#b36db0",
    edge: "#efb118",
    area: "#29cce2",
  };

  const typeLetter = (t) => t[0];
  const classify = (a, b) =>
    [typeLetter(nodeTypes[a]), typeLetter(nodeTypes[b])].sort().join("");

  // All unordered pairs, excluding intra-segment pairs
  const paths = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (segmentOfNode[i] !== null && segmentOfNode[i] === segmentOfNode[j]) continue;
      paths.push({ a: i, b: j, klass: classify(i, j) });
    }
  }
  paths.forEach((p, idx) => { p.id = idx; });

  return {
    size, center, radius, nodeLabelOffset, strokeWidth, bundleSpacing, minGap,
    nodeTypes, n, areaSegments, segmentOfNode,
    pathColors, typeColors,
    typeLetter, classify, paths
  };
}


function _buildBundleOrders(){return(
function(halfSegments, options = {}) {
  const groups = new Map();
  for (const hs of halfSegments) {
    if (!groups.has(hs.spokeId)) groups.set(hs.spokeId, []);
    groups.get(hs.spokeId).push(hs);
  }

  const ranks = new Map();
  for (const [spokeId, list] of groups) {
    const spokeAngle = list[0].spokeAngle;

    list.forEach(hs => {
      let d = hs.otherAngle - spokeAngle;
      while (d <= 0) d += 2 * Math.PI;
      while (d > 2 * Math.PI) d -= 2 * Math.PI;
      hs._delta = d;
    });
    list.sort((u, v) => u._delta - v._delta);

    const m = list.length;
    const shift = options.shift ? options.shift(spokeId, m) : 0;

    list.forEach((hs, k) => {
      ranks.set(hs.key, (m - 1) / 2 - k + shift);
    });
  }

  return ranks;
}
)}

function _buildStraightPath(){return(
function(p, nodeAngles, getBundleRank, opts) {
  const { center, radius, bundleSpacing } = opts;

  const aA = nodeAngles[p.a], aB = nodeAngles[p.b];
  const A = { x: center + radius * Math.cos(aA), y: center + radius * Math.sin(aA) };
  const B = { x: center + radius * Math.cos(aB), y: center + radius * Math.sin(aB) };

  const dirA = { x: Math.cos(aA), y: Math.sin(aA) };
  const perpA = { x: -dirA.y, y: dirA.x };
  const dirB = { x: Math.cos(aB), y: Math.sin(aB) };
  const perpB = { x: -dirB.y, y: dirB.x };

  const offA = getBundleRank(p.id, p.a) * bundleSpacing;
  const offB = getBundleRank(p.id, p.b) * bundleSpacing;

  const endA = { x: A.x + perpA.x * offA, y: A.y + perpA.y * offA };
  const endB = { x: B.x + perpB.x * offB, y: B.y + perpB.y * offB };

  // Intersection of the two offset spoke-parallel lines
  const rhsX = perpB.x * offB - perpA.x * offA;
  const rhsY = perpB.y * offB - perpA.y * offA;
  const det = dirA.x * (-dirB.y) - dirA.y * (-dirB.x);
  const parallel = Math.abs(det) < 1e-6;
  let cx = 0, cy = 0, cornerDist = Infinity;
  if (!parallel) {
    const tC = (rhsX * (-dirB.y) - rhsY * (-dirB.x)) / det;
    cx = center + perpA.x * offA + tC * dirA.x;
    cy = center + perpA.y * offA + tC * dirA.y;
    cornerDist = Math.hypot(cx - center, cy - center);
  }

  let p0, p1, p2, p3;
  if (!parallel && cornerDist <= radius) {
    // Single sharp corner (degenerate cubic)
    const c = { x: cx, y: cy };
    p0 = c; p1 = c; p2 = c; p3 = c;
  } else {
    // Antipodal-ish: short spoke-parallel jog between two corners
    const jog = bundleSpacing;
    const cA = { x: center + dirA.x * jog + perpA.x * offA, y: center + dirA.y * jog + perpA.y * offA };
    const cB = { x: center + dirB.x * jog + perpB.x * offB, y: center + dirB.y * jog + perpB.y * offB };
    p0 = cA; p1 = cA; p2 = cB; p3 = cB;
  }

  return `M ${endA.x} ${endA.y} L ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y} L ${endB.x} ${endB.y}`;
}
)}

function _buildCurvedPath(){return(
function(p, nodeAngles, getBundleRank, jr, opts) {
  const { center, radius, bundleSpacing } = opts;

  const aA = nodeAngles[p.a], aB = nodeAngles[p.b];
  const A = { x: center + radius * Math.cos(aA), y: center + radius * Math.sin(aA) };
  const B = { x: center + radius * Math.cos(aB), y: center + radius * Math.sin(aB) };

  const dirA = { x: Math.cos(aA), y: Math.sin(aA) };
  const perpA = { x: -dirA.y, y: dirA.x };
  const dirB = { x: Math.cos(aB), y: Math.sin(aB) };
  const perpB = { x: -dirB.y, y: dirB.x };

  const offA = getBundleRank(p.id, p.a) * bundleSpacing;
  const offB = getBundleRank(p.id, p.b) * bundleSpacing;

  const endA = { x: A.x + perpA.x * offA, y: A.y + perpA.y * offA };
  const endB = { x: B.x + perpB.x * offB, y: B.y + perpB.y * offB };

  // Offset-line intersection
  const rhsX = perpB.x * offB - perpA.x * offA;
  const rhsY = perpB.y * offB - perpA.y * offA;
  const det = dirA.x * (-dirB.y) - dirA.y * (-dirB.x);
  const parallel = Math.abs(det) < 1e-6;
  let cx = 0, cy = 0, cornerDist = Infinity, tC = 0, sC = 0;
  if (!parallel) {
    tC = (rhsX * (-dirB.y) - rhsY * (-dirB.x)) / det;
    sC = (dirA.x * rhsY - dirA.y * rhsX) / det;
    cx = center + perpA.x * offA + tC * dirA.x;
    cy = center + perpA.y * offA + tC * dirA.y;
    cornerDist = Math.hypot(cx - center, cy - center);
  }

  let p0, p1, p2, p3;
  const cornerInFront = !parallel && tC > 0 && sC > 0;
  const sharpCorner = cornerInFront && cornerDist > jr;

  if (sharpCorner) {
    const c = { x: cx, y: cy };
    p0 = c; p1 = c; p2 = c; p3 = c;
  } else {
    // P0, P3 = where each offset line crosses the jr circle on the spoke side.
    // Cubic-Bezier approximation of arc tangent to both endpoint tangents.
    const tA = Math.sqrt(Math.max(0, jr * jr - offA * offA));
    const tB = Math.sqrt(Math.max(0, jr * jr - offB * offB));
    p0 = { x: center + dirA.x * tA + perpA.x * offA, y: center + dirA.y * tA + perpA.y * offA };
    p3 = { x: center + dirB.x * tB + perpB.x * offB, y: center + dirB.y * tB + perpB.y * offB };

    // beta = angle between tangents at P0 and P3
    const cosBeta = -dirA.x * dirB.x - dirA.y * dirB.y;
    const beta = Math.acos(Math.max(-1, Math.min(1, cosBeta)));
    const chord = Math.hypot(p3.x - p0.x, p3.y - p0.y);
    const cb4 = Math.cos(beta / 4);
    // Clamp so P1, P2 stay inside the jr circle
    let ctrlDist = Math.min(chord / (3 * cb4 * cb4), 2 * tA, 2 * tB);
    p1 = { x: p0.x - dirA.x * ctrlDist, y: p0.y - dirA.y * ctrlDist };
    p2 = { x: p3.x - dirB.x * ctrlDist, y: p3.y - dirB.y * ctrlDist };
  }

  return `M ${endA.x} ${endA.y} L ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y} L ${endB.x} ${endB.y}`;
}
)}

function _15(md){return(
md`First, let's test a 10 way intersection between a mix of \`link\`, \`edge\` and \`area\` spokes. The link classes are the 6 combinations of two spoke types.

- Click legend items to show or hide. Double click to only show that path type.
- Drag the spoke indexes to test different angles.
- Try straight and curved line generators, and also adjust the radius around the junction the lines start to curve`
)}

function _junction1(config,buildBundleOrders,buildCurvedPath,buildStraightPath,html,d3)
{
  const {
    size, center, radius, nodeLabelOffset, strokeWidth, bundleSpacing, minGap,
    nodeTypes, n, areaSegments, segmentOfNode,
    pathColors, typeColors, paths
  } = config;

  const opts = { center, radius, bundleSpacing };

  // --- Mutable state ---
  const nodeAngles = Array.from({ length: n }, (_, i) => -Math.PI / 2 + (i / n) * 2 * Math.PI);
  const cwOrder = Array.from({ length: n }, (_, i) => i);
  const cwPos = new Array(n);
  cwOrder.forEach((idx, pos) => cwPos[idx] = pos);

  const hiddenClasses = new Set();
  let curvedMode = true;
  let hoveredPath = null, hoveredNode = null, hoveredClass = null;
  let draggingNode = null, draggingHalf = null;   // draggingHalf: { pathId, side }

  // Per-node ordered list of half-segment keys. Preserves user reorderings
  // across hide/show and across re-renders; new halves get inserted at the
  // angle-derived position via buildBundleOrders.
  // Map<nodeIndex, Array<{ pathId, side }>>
  const spokeOrders = new Map();
  for (let i = 0; i < n; i++) spokeOrders.set(i, []);

  // Bundle justification: an edge spoke bordering an area on one side only
  // pushes its entire bundle into the area side (no entries centered on the
  // edge itself). Returns the rank offset to add to a centered position.
  function shiftFor(spokeId, count) {
    if (count <= 0) return 0;
    if (nodeTypes[spokeId] !== "edge") return 0;
    const cwIsArea = segmentOfNode[(spokeId + 1) % n] !== null;
    const ccwIsArea = segmentOfNode[(spokeId - 1 + n) % n] !== null;
    if (cwIsArea && !ccwIsArea) return (count - 1) / 2;
    if (ccwIsArea && !cwIsArea) return -(count - 1) / 2;
    return 0;
  }

  // The angle-based rank computation (for inserting new halves into the
  // ordered list; ignores justification — that's applied at display time).
  function angleRanks() {
    const halfSegments = [];
    paths.forEach(p => {
      if (hiddenClasses.has(p.klass)) return;
      halfSegments.push({
        key: `${p.id}-a`,
        spokeId: p.a,
        spokeAngle: nodeAngles[p.a],
        otherAngle: nodeAngles[p.b],
      });
      halfSegments.push({
        key: `${p.id}-b`,
        spokeId: p.b,
        spokeAngle: nodeAngles[p.b],
        otherAngle: nodeAngles[p.a],
      });
    });
    return buildBundleOrders(halfSegments);
  }

  // Sync each spoke's ordered list with current visible halves. Existing
  // entries keep their relative order; missing halves are inserted at their
  // angle-derived rank position.
  function syncSpokeOrders() {
    // Build desired set of (nodeIndex, halfKey) pairs.
    const desired = new Map();   // nodeIndex -> Set of "pathId-side"
    for (let i = 0; i < n; i++) desired.set(i, new Set());
    paths.forEach(p => {
      if (hiddenClasses.has(p.klass)) return;
      desired.get(p.a).add(`${p.id}-a`);
      desired.get(p.b).add(`${p.id}-b`);
    });

    // Remove gone entries from each spoke.
    let needFullRebuild = false;
    for (let i = 0; i < n; i++) {
      const arr = spokeOrders.get(i);
      const dset = desired.get(i);
      const kept = arr.filter(e => dset.has(`${e.pathId}-${e.side}`));
      spokeOrders.set(i, kept);
      // Detect if any spoke is missing entries (will need angle-based insertion).
      if (kept.length !== dset.size) needFullRebuild = true;
    }

    if (!needFullRebuild) return;

    // For any spoke with missing entries, compute angle ranks and insert
    // missing halves at their angle-sorted positions among existing ones.
    const ranksMap = angleRanks();
    for (let i = 0; i < n; i++) {
      const arr = spokeOrders.get(i);
      const dset = desired.get(i);
      const present = new Set(arr.map(e => `${e.pathId}-${e.side}`));
      const missing = [...dset].filter(k => !present.has(k));
      if (missing.length === 0) continue;

      // Each entry in the spoke gets a "score": existing entries use their
      // current position; missing entries use their angle-derived rank.
      // Then sort all by score.
      const scored = [
        ...arr.map((e, idx) => ({ entry: e, score: idx - (arr.length - 1) / 2 })),
        ...missing.map(k => {
          const [pid, side] = k.split("-");
          return { entry: { pathId: +pid, side }, score: ranksMap.get(k) ?? 0 };
        }),
      ];
      scored.sort((u, v) => u.score - v.score);
      spokeOrders.set(i, scored.map(s => s.entry));
    }
  }

  syncSpokeOrders();

  // Rank for a half = centered position in its spoke's list, plus the
  // edge-near-area justification shift.
  function rankOf(pathId, side, nodeIdx) {
    const arr = spokeOrders.get(nodeIdx);
    const idx = arr.findIndex(e => e.pathId === pathId && e.side === side);
    if (idx < 0) return 0;
    return idx - (arr.length - 1) / 2 + shiftFor(nodeIdx, arr.length);
  }

  const getBundleRank = (pathId, nodeIndex) => {
    const path = paths[pathId];
    if (!path) return 0;
    const side = path.a === nodeIndex ? "a" : "b";
    return rankOf(pathId, side, nodeIndex);
  };

  // --- Junction radius ---
  // Curved mode renders paths through a JR-radius circle around center. The
  // slider exposes the actual JR; bounds depend on current bundle sizes.
  const jrMax = radius * 0.85;
  const jrMin = radius * 0.35;
  const jrCap = 9;
  function currentMaxBundle() {
    let m = 0;
    for (let i = 0; i < n; i++) m = Math.max(m, spokeOrders.get(i).length);
    return m;
  }
  function computeJrBounds() {
    let maxOff = 0;
    for (let i = 0; i < n; i++) {
      const arr = spokeOrders.get(i);
      const shift = shiftFor(i, arr.length);
      for (let k = 0; k < arr.length; k++) {
        const r = k - (arr.length - 1) / 2 + shift;
        maxOff = Math.max(maxOff, Math.abs(r) * bundleSpacing);
      }
    }
    const mb = currentMaxBundle();
    const t = (Math.min(Math.max(mb, 1), jrCap) - 1) / (jrCap - 1);
    const upper = jrMin + (jrMax - jrMin) * t;
    const lower = maxOff + 12;   // safety floor: offsets must fit inside JR
    return { lower: Math.min(lower, upper), upper };
  }
  let jrBounds = computeJrBounds();
  let jr = jrBounds.upper;          // initial: max
  let lastMaxBundle = currentMaxBundle();
  function reclampJr() {
    const mb = currentMaxBundle();
    if (lastMaxBundle > 0 && mb > 0 && mb !== lastMaxBundle) {
      jr = jr * (mb / lastMaxBundle);
    }
    lastMaxBundle = mb;
    jrBounds = computeJrBounds();
    jr = Math.max(jrBounds.lower, Math.min(jrBounds.upper, jr));
  }

  const buildPathD = (p) =>
    curvedMode
      ? buildCurvedPath(p, nodeAngles, getBundleRank, jr, opts)
      : buildStraightPath(p, nodeAngles, getBundleRank, opts);

  // --- DOM scaffolding ---
  const wrapper = html`<div style="width:100%;max-width:${size}px;font-family:ui-monospace,'SF Mono',Menlo,monospace;position:relative;"></div>`;

  // Toolbar: left = reset-order button + status; right = straight/curved radios.
  // The JR slider sits in an absolutely-positioned row anchored to the
  // wrapper, so when curved mode is active it overlays the top of the chart
  // (visually under the radios) without changing the toolbar's height or
  // the chart's vertical position.
  const toolbar = html`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;font-size:12px;color:#555;"></div>`;
  const btnStyle = "padding:4px 10px;font:inherit;font-size:12px;cursor:pointer;border:1px solid #888;background:#fff;border-radius:4px;";
  const leftGroup = html`<div style="display:flex;align-items:center;gap:8px;"></div>`;
  const resetBtn = html`<button style="${btnStyle}">reset order</button>`;
  leftGroup.appendChild(resetBtn);

  const radioRow = html`<div style="display:flex;align-items:center;gap:12px;"></div>`;
  const radioLabelStyle = "display:inline-flex;align-items:center;gap:4px;cursor:pointer;user-select:none;";
  const radioStraight = html`<label style="${radioLabelStyle}"><input type="radio" name="chart-mode" value="straight"> straight</label>`;
  const radioCurved = html`<label style="${radioLabelStyle}"><input type="radio" name="chart-mode" value="curved" checked> curved</label>`;
  radioRow.appendChild(radioStraight);
  radioRow.appendChild(radioCurved);

  toolbar.appendChild(leftGroup);
  toolbar.appendChild(radioRow);
  wrapper.appendChild(toolbar);

  // Slider overlay: positioned relative to the wrapper, sitting just below
  // the toolbar's bottom edge. Custom SVG matches the snapRouteChart slider:
  // light grey track (#ddd) + medium grey thumb (#888).
  const sliderWidth = 100;
  const sliderRow = html`<div style="position:absolute;top:24px;right:0;display:flex;align-items:center;pointer-events:none;"></div>`;
  const sliderSvg = d3.select(sliderRow).append("svg")
    .attr("width", sliderWidth + 12)
    .attr("height", 14)
    .style("display", "block")
    .style("pointer-events", "auto")
    .style("overflow", "visible");
  const sliderTrackX0 = 6;
  const sliderTrackX1 = sliderTrackX0 + sliderWidth;
  sliderSvg.append("rect")
    .attr("x", sliderTrackX0).attr("y", 5)
    .attr("width", sliderWidth).attr("height", 4)
    .attr("rx", 2).attr("fill", "#ddd");
  const sliderThumb = sliderSvg.append("circle")
    .attr("cy", 7).attr("r", 6).attr("fill", "#888")
    .style("cursor", "pointer");
  wrapper.appendChild(sliderRow);

  // Chart container.
  const container = html`<div style="width:100%;aspect-ratio:1/1;"></div>`;
  wrapper.appendChild(container);
  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${size} ${size}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%").style("height", "100%").style("display", "block");

  // --- Wedges ---
  // Wedge outer radius matches the handle-center radius so the shaded area
  // stops at the middle of each spoke handle (rather than extending past it).
  const wedgeOuter = radius + nodeLabelOffset;
  function wedgeD(seg) {
    const a0 = nodeAngles[seg[0]];
    const a1 = nodeAngles[seg[seg.length - 1]];
    const p0 = { x: center + wedgeOuter * Math.cos(a0), y: center + wedgeOuter * Math.sin(a0) };
    const p1 = { x: center + wedgeOuter * Math.cos(a1), y: center + wedgeOuter * Math.sin(a1) };
    const span = ((a1 - a0) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const largeArc = span > Math.PI ? 1 : 0;
    return `M ${center} ${center} L ${p0.x} ${p0.y} A ${wedgeOuter} ${wedgeOuter} 0 ${largeArc} 1 ${p1.x} ${p1.y} Z`;
  }
  const wedgeSel = svg.append("g").selectAll("path").data(areaSegments).join("path")
    .attr("fill", "#f2f2f2").attr("d", wedgeD);

  // Thin grey spokes from link/edge handles to the junction center. Drawn
  // after wedges (so they sit on top of the area fill) but before paths
  // (so colored paths remain visually dominant). Area-node spokes are
  // omitted — those rays sit inside the wedges and would clutter them.
  const spokeNodeIdxs = Array.from({ length: n }, (_, i) => i)
    .filter(i => nodeTypes[i] !== "area");
  const spokeSel = svg.append("g").selectAll("line")
    .data(spokeNodeIdxs).join("line")
    .attr("stroke", "#888").attr("stroke-width", 1);
  function placeSpokes() {
    spokeSel
      .attr("x1", center).attr("y1", center)
      .attr("x2", i => center + (radius + nodeLabelOffset) * Math.cos(nodeAngles[i]))
      .attr("y2", i => center + (radius + nodeLabelOffset) * Math.sin(nodeAngles[i]));
  }
  placeSpokes();

  const pathSel = svg.append("g").attr("fill", "none").selectAll("path")
    .data(paths).join("path")
    .attr("d", buildPathD)
    .attr("stroke", d => pathColors[d.klass])
    .attr("stroke-width", strokeWidth)
    .attr("stroke-linecap", "round").attr("stroke-linejoin", "round")
    .style("transition", "opacity 0.12s linear")
    .style("pointer-events", "none");

  // Helper: nearer node of a path to a given point.
  function nearerSide(path, pt) {
    const ap = { x: center + radius * Math.cos(nodeAngles[path.a]), y: center + radius * Math.sin(nodeAngles[path.a]) };
    const bp = { x: center + radius * Math.cos(nodeAngles[path.b]), y: center + radius * Math.sin(nodeAngles[path.b]) };
    const da = (pt.x - ap.x) ** 2 + (pt.y - ap.y) ** 2;
    const db = (pt.x - bp.x) ** 2 + (pt.y - bp.y) ** 2;
    return da < db ? "a" : "b";
  }

  const hitSel = svg.append("g").attr("fill", "none").selectAll("path")
    .data(paths).join("path")
    .attr("d", buildPathD)
    .attr("stroke", "transparent")
    .attr("stroke-width", bundleSpacing)
    .attr("stroke-linecap", "round").attr("stroke-linejoin", "round")
    .style("cursor", "grab")
    .on("mouseover", (event, d) => {
      if (draggingNode === null && draggingHalf === null) { hoveredPath = d.id; applyState(); }
    })
    .on("mouseout", () => {
      if (draggingNode === null && draggingHalf === null) { hoveredPath = null; applyState(); }
    });

  // --- Drag-to-reorder on path halves ---
  let reorderState = null;

  hitSel.call(d3.drag()
    .on("start", function(event, d) {
      // SVG-local cursor for figuring out which side is nearer.
      const [px, py] = d3.pointer(event, svg.node());
      const side = nearerSide(d, { x: px, y: py });
      const nodeIdx = side === "a" ? d.a : d.b;
      const spokeAngle = nodeAngles[nodeIdx];
      // Perpendicular to the spoke direction (rotate 90° CCW in screen coords).
      const dirX = Math.cos(spokeAngle), dirY = Math.sin(spokeAngle);
      reorderState = {
        pathId: d.id,
        side,
        nodeIdx,
        perpX: -dirY,
        perpY:  dirX,
        baseline: { x: event.x, y: event.y },
      };
      draggingHalf = { pathId: d.id, side };
      d3.select(this).style("cursor", "grabbing");
      applyState();
    })
    .on("drag", function(event) {
      if (!reorderState) return;
      const dx = event.x - reorderState.baseline.x;
      const dy = event.y - reorderState.baseline.y;
      const proj = dx * reorderState.perpX + dy * reorderState.perpY;
      const targetDelta = Math.round(proj / bundleSpacing);
      if (targetDelta === 0) return;

      const arr = spokeOrders.get(reorderState.nodeIdx);
      const idx = arr.findIndex(e => e.pathId === reorderState.pathId && e.side === reorderState.side);
      if (idx < 0) return;
      let curIdx = idx;
      let swaps = 0;
      while (swaps !== targetDelta) {
        const dir = swaps < targetDelta ? 1 : -1;
        const ni = curIdx + dir;
        if (ni < 0 || ni >= arr.length) break;
        const tmp = arr[curIdx]; arr[curIdx] = arr[ni]; arr[ni] = tmp;
        curIdx = ni;
        swaps += dir;
      }
      if (swaps !== 0) {
        reorderState.baseline = { x: event.x, y: event.y };
        refreshGeometry();
      }
    })
    .on("end", function() {
      if (reorderState) d3.select(this).style("cursor", "grab");
      reorderState = null;
      draggingHalf = null;
      applyState();
    }));

  // --- Node labels ---
  const nodeLabelRadius = 13;
  function labelPos(i) {
    const a = nodeAngles[i];
    return { x: center + (radius + nodeLabelOffset) * Math.cos(a),
             y: center + (radius + nodeLabelOffset) * Math.sin(a) };
  }
  const labelSel = svg.append("g").selectAll("g")
    .data(Array.from({ length: n }, (_, i) => ({ i })))
    .join(enter => {
      const g = enter.append("g").style("cursor", "grab");
      g.append("circle").attr("r", nodeLabelRadius)
        .attr("fill", d => typeColors[nodeTypes[d.i]]);
      g.append("text")
        .attr("text-anchor", "middle").attr("dominant-baseline", "central")
        .attr("font-size", 18).attr("font-weight", 700)
        .attr("fill", "#fff")
        .text(d => d.i);
      return g;
    })
    .on("mouseover", (event, d) => {
      if (draggingNode === null && draggingHalf === null) { hoveredNode = d.i; applyState(); }
    })
    .on("mouseout", () => {
      if (draggingNode === null && draggingHalf === null) { hoveredNode = null; applyState(); }
    });

  function placeLabels() {
    labelSel.each(function(d) {
      const p = labelPos(d.i);
      d3.select(this).select("circle").attr("cx", p.x).attr("cy", p.y);
      d3.select(this).select("text").attr("x", p.x).attr("y", p.y);
    });
  }
  placeLabels();

  // --- Dragging node labels with cascading push ---
  const wrapAngle = (a) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  function applyDragDelta(draggedIdx, deltaAngle) {
    if (Math.abs(deltaAngle) < 1e-9) return;
    const sign = deltaAngle > 0 ? 1 : -1;
    let remaining = Math.abs(deltaAngle);
    let curr = draggedIdx;
    let safety = n + 2;
    while (remaining > 1e-9 && safety-- > 0) {
      const nextPos = (cwPos[curr] + sign + n) % n;
      const next = cwOrder[nextPos];
      const gap = sign > 0
        ? ((nodeAngles[next] - nodeAngles[curr]) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
        : ((nodeAngles[curr] - nodeAngles[next]) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const available = gap - minGap;
      if (remaining <= available) {
        nodeAngles[curr] = wrapAngle(nodeAngles[curr] + sign * remaining);
        remaining = 0;
      } else {
        nodeAngles[curr] = wrapAngle(nodeAngles[next] - sign * minGap);
        remaining -= Math.max(0, available);
        curr = next;
      }
    }
  }

  function refreshGeometry() {
    syncSpokeOrders();
    reclampJr();
    updateSliderThumb();
    pathSel.attr("d", buildPathD);
    hitSel.attr("d", buildPathD);
    wedgeSel.attr("d", wedgeD);
    placeSpokes();
    placeLabels();
  }

  labelSel.call(d3.drag()
    .on("start", function(event, d) {
      d3.select(this).style("cursor", "grabbing");
      draggingNode = d.i;
      applyState();
    })
    .on("drag", function(event, d) {
      const newAngle = Math.atan2(event.y - center, event.x - center);
      let delta = newAngle - nodeAngles[d.i];
      while (delta > Math.PI) delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;
      applyDragDelta(d.i, delta);
      refreshGeometry();
    })
    .on("end", function() {
      d3.select(this).style("cursor", "grab");
      draggingNode = null;
      hoveredPath = hoveredNode = hoveredClass = null;
      applyState();
    }));

  // --- Legend ---
  const legendItems = [
    { key: "ll" }, { key: "le" }, { key: "la" },
    { key: "ee" }, { key: "ea" }, { key: "aa" }
  ];
  const legend = svg.append("g").attr("transform", `translate(16, 20)`)
    .style("user-select", "none")
    .style("-webkit-user-select", "none");
  legendItems.forEach((item, idx) => {
    let clickTimer = null;
    const row = legend.append("g")
      .attr("transform", `translate(0, ${idx * 22})`)
      .style("cursor", "pointer")
      .on("click", () => {
        if (clickTimer !== null) return;
        clickTimer = setTimeout(() => {
          clickTimer = null;
          const k = item.key;
          const alt = k[0] === k[1] ? k : k[1] + k[0];
          if (hiddenClasses.has(k)) { hiddenClasses.delete(k); hiddenClasses.delete(alt); }
          else { hiddenClasses.add(k); hiddenClasses.add(alt); }
          applyHiddenChanged();
        }, 220);
      })
      .on("dblclick", () => {
        if (clickTimer !== null) { clearTimeout(clickTimer); clickTimer = null; }
        const k = item.key;
        const allKeys = legendItems.flatMap(it => {
          const a = it.key, b = a[0] === a[1] ? a : a[1] + a[0];
          return [a, b];
        });
        const thisKeys = k[0] === k[1] ? [k] : [k, k[1] + k[0]];
        const othersHidden = legendItems.every(it => it.key === k || hiddenClasses.has(it.key));
        hiddenClasses.clear();
        if (!othersHidden) {
          allKeys.forEach(kk => { if (!thisKeys.includes(kk)) hiddenClasses.add(kk); });
        }
        applyHiddenChanged();
      })
      .on("mouseover", () => { hoveredClass = item.key; applyState(); })
      .on("mouseout", () => { hoveredClass = null; applyState(); });

    row.append("rect").attr("x", -4).attr("y", -11).attr("width", 70).attr("height", 22).attr("fill", "transparent");
    row.append("line")
      .attr("x1", 0).attr("y1", 0).attr("x2", 26).attr("y2", 0)
      .attr("stroke", pathColors[item.key]).attr("stroke-width", 3).attr("stroke-linecap", "round")
      .attr("class", "legend-line");
    row.append("text")
      .attr("x", 34).attr("y", 0).attr("dominant-baseline", "central")
      .attr("font-size", 13).attr("fill", "#333").text(item.key)
      .attr("class", "legend-text");
    row.attr("data-key", item.key);
  });

  // --- Toolbar wiring: radio buttons + slider ---
  // Slider maps thumb cx ↔ jr against the dynamic [lower, upper] from
  // jrBounds. Bounds shift as bundle sizes change, so updateSliderThumb()
  // re-derives the thumb position each render to keep it in sync.
  function jrToThumbX(value) {
    const { lower, upper } = jrBounds;
    if (upper - lower < 1e-6) return sliderTrackX1;
    const t = (value - lower) / (upper - lower);
    return sliderTrackX0 + t * sliderWidth;
  }
  function thumbXToJr(x) {
    const { lower, upper } = jrBounds;
    const cx = Math.max(sliderTrackX0, Math.min(sliderTrackX1, x));
    const t = (cx - sliderTrackX0) / sliderWidth;
    return lower + t * (upper - lower);
  }
  function updateSliderThumb() {
    sliderThumb.attr("cx", jrToThumbX(jr));
    sliderRow.style.display = curvedMode ? "" : "none";
  }
  sliderSvg.call(d3.drag()
    .on("start drag", function(event) {
      const [x] = d3.pointer(event, sliderSvg.node());
      jr = thumbXToJr(x);
      sliderThumb.attr("cx", jrToThumbX(jr));
      // Live re-render of curved paths (no transition for responsiveness).
      pathSel.filter(p => !hiddenClasses.has(p.klass)).attr("d", buildPathD);
      hitSel.filter(p => !hiddenClasses.has(p.klass)).attr("d", buildPathD);
    }));
  updateSliderThumb();

  function updateRadios() {
    radioStraight.querySelector("input").checked = !curvedMode;
    radioCurved.querySelector("input").checked = curvedMode;
    sliderRow.style.display = curvedMode ? "" : "none";
  }
  radioStraight.querySelector("input").addEventListener("change", () => {
    if (radioStraight.querySelector("input").checked) {
      curvedMode = false;
      updateRadios();
      refreshGeometryAnimated();
    }
  });
  radioCurved.querySelector("input").addEventListener("change", () => {
    if (radioCurved.querySelector("input").checked) {
      curvedMode = true;
      updateRadios();
      refreshGeometryAnimated();
    }
  });
  updateRadios();

  // --- Toolbar wiring: reset-order button ---
  // Clears spoke orderings; syncSpokeOrders refills from angles.
  resetBtn.addEventListener("click", () => {
    for (let i = 0; i < n; i++) spokeOrders.set(i, []);
    refreshGeometryAnimated();
  });

  function refreshGeometryAnimated() {
    syncSpokeOrders();
    reclampJr();
    updateSliderThumb();
    const t = d3.transition().duration(250).ease(d3.easeCubicInOut);
    pathSel.filter(p => !hiddenClasses.has(p.klass)).transition(t).attr("d", buildPathD);
    hitSel.filter(p => !hiddenClasses.has(p.klass)).transition(t).attr("d", buildPathD);
    wedgeSel.transition(t).attr("d", wedgeD);
  }

  const classMatchesKey = (klass, key) =>
    klass.split("").sort().join("") === key.split("").sort().join("");

  function isPathActive(p) {
    if (draggingNode !== null) return p.a === draggingNode || p.b === draggingNode;
    if (draggingHalf !== null) return p.id === draggingHalf.pathId;
    if (hoveredPath !== null) return p.id === hoveredPath;
    if (hoveredNode !== null) return p.a === hoveredNode || p.b === hoveredNode;
    if (hoveredClass !== null) return classMatchesKey(p.klass, hoveredClass);
    return null;
  }

  function applyState() {
    pathSel.each(function(p) {
      const hidden = hiddenClasses.has(p.klass);
      const active = isPathActive(p);
      d3.select(this).style("opacity", hidden ? 0 : (active === null || active ? 1 : 0.3));
    });
    hitSel.attr("pointer-events", p => hiddenClasses.has(p.klass) ? "none" : null);

    if (hoveredPath !== null || hoveredNode !== null || hoveredClass !== null || draggingNode !== null || draggingHalf !== null) {
      pathSel.filter(p => !hiddenClasses.has(p.klass) && isPathActive(p) === true)
        .each(function() { this.parentNode.appendChild(this); });
    }

    legend.selectAll("g[data-key]").each(function() {
      const off = hiddenClasses.has(d3.select(this).attr("data-key"));
      d3.select(this).select(".legend-text").attr("fill", off ? "#bbb" : "#333");
      d3.select(this).select(".legend-line").style("opacity", off ? 0.25 : 1);
    });
  }

  function applyHiddenChanged() {
    syncSpokeOrders();
    reclampJr();
    updateSliderThumb();
    const t = d3.transition().duration(250).ease(d3.easeCubicInOut);
    pathSel.filter(p => !hiddenClasses.has(p.klass)).transition(t).attr("d", buildPathD);
    hitSel.filter(p => !hiddenClasses.has(p.klass)).transition(t).attr("d", buildPathD);
    applyState();
  }

  applyState();
  return wrapper;
}


function _17(md){return(
md`From this 10 way junction, I can confirm that ordering lines by the angle they leave the junction is the best policy, and the curved line join is easier to read than the straight line joins.`
)}

function _18(md){return(
md`### Coastline Junction`
)}

function _19(md){return(
md`For a complex junction with 0 or 2+ area sections, the clearest rule is to order the paths based on the angle they exit the junction. Single area junctions are different, because the \`le\` and \`ee\` paths should be on the inside edge, \`ea\` in the middle, and \`aa\` on the outside of concave corners. The following chart explores different cases for the central junction.`
)}

function _junction2(config,html,d3,orderBundle)
{
  // Paste a saved state (an array of { a: {x,y}, b: {x,y} } objects) here
  // to start the chart with those paths. Leave as null for an empty start.
  // The "save state" button at the top produces a string you can paste here.
  const initialState = [
    { a: { x: 235, y: 24.9 }, b: { x: 199, y: 131.9 } },
    { a: { x: 249, y: 73.9 }, b: { x: 204, y: 174.9 } },
    { a: { x: 346, y: 102.9 }, b: { x: 407, y: 142.9 } },
    { a: { x: 426, y: 104.9 }, b: { x: 163, y: 126.9 } },
    { a: { x: 474, y: 90.9 }, b: { x: 34, y: 225.9 } },
    { a: { x: 541, y: 68.9 }, b: { x: 37, y: 372.9 } },
    { a: { x: 153, y: 90.9 }, b: { x: 575, y: 449.9 } },
    { a: { x: 107, y: 88.9 }, b: { x: 578, y: 374.9 } },
    { a: { x: 34, y: 159.9 }, b: { x: 578, y: 229.9 } },
    { a: { x: 573, y: 282.9 }, b: { x: 27, y: 279.9 } },
    { a: { x: 338, y: 8 }, b: { x: 399, y: 575.9 } },
    { a: { x: 360, y: 37.9 }, b: { x: 573, y: 327.9 } },
    { a: { x: 251, y: 110.9 }, b: { x: 42, y: 558.9 } }
  ];

  const { pathColors } = config;

  // --- Layout ---
  const size = 600;
  const pad = 75;
  const sq = size - 2 * pad;
  const TL = { x: pad,        y: pad };
  const TR = { x: pad + sq,   y: pad };
  const BL = { x: pad,        y: pad + sq };
  const BR = { x: pad + sq,   y: pad + sq };
  const J  = { x: pad + sq/2, y: pad + sq/2 };
  const TM = { x: pad + sq/2, y: pad - sq/2 };

  const segments = [
    { kind: "edge", p: TL, q: J,  name: "TL-J"  },
    { kind: "edge", p: J,  q: TR, name: "J-TR"  },
    { kind: "edge", p: TL, q: BL, name: "TL-BL" },
    { kind: "edge", p: BL, q: BR, name: "BL-BR" },
    { kind: "edge", p: BR, q: TR, name: "BR-TR" },
    { kind: "link", p: J,  q: TM, name: "J-TM"  },
  ];

  const areaPoly = [TL, J, TR, BR, BL];
  const jIncident = new Set(segments.filter(s => s.p === J || s.q === J));
  const bundleSpacing = 9;

  // --- Geometry helpers (defined early; perp orientation uses pointInPoly) ---
  const projectOnSegment = (p, a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return { x: a.x + t * dx, y: a.y + t * dy, t };
  };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const samePt = (a, b) => Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6;

  function pointInPoly(p, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect = ((yi > p.y) !== (yj > p.y)) &&
        (p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function segmentStaysInside(a, b, poly, samples = 11) {
    for (let i = 1; i <= samples; i++) {
      const t = i / (samples + 1);
      const p = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
      if (!pointInPoly(p, poly)) return false;
    }
    return true;
  }

  // Per-segment unit perp. Edges point INTO the area (tested via pointInPoly
  // — the centroid test is degenerate when the centroid lies on the edge's
  // line, which happens for J-incident edges in this symmetric layout).
  // Links use an arbitrary side; their ranks are signed/centered.
  function unitPerp(seg) {
    const dx = seg.q.x - seg.p.x, dy = seg.q.y - seg.p.y;
    const len = Math.hypot(dx, dy) || 1;
    let px = -dy / len, py = dx / len;
    if (seg.kind === "edge") {
      const mx = (seg.p.x + seg.q.x) / 2, my = (seg.p.y + seg.q.y) / 2;
      if (!pointInPoly({ x: mx + px, y: my + py }, areaPoly)) {
        px = -px; py = -py;
      }
    }
    return { x: px, y: py };
  }
  segments.forEach(s => { s.perp = unitPerp(s); });

  // Resolved point. `anchor` is where the dot sits (cursor position).
  // `pt` is the navigation-mesh entry: anchor for area; snap for outside.
  function resolvePoint(p) {
    if (pointInPoly(p, areaPoly)) return { type: "area", anchor: p, pt: p };
    let best = null;
    for (const seg of segments) {
      const proj = projectOnSegment(p, seg.p, seg.q);
      const d = dist(p, proj);
      if (!best || d < best.d) best = { d, pt: proj, seg };
    }
    return { type: best.seg.kind, anchor: p, pt: best.pt, seg: best.seg };
  }

  function routePath(a, b) {
    if (a.seg && a.seg === b.seg) {
      const k = a.type[0];
      return { viaJ: false, klass: k + k };
    }
    const usesArea = a.type !== "link" && b.type !== "link";
    if (usesArea && segmentStaysInside(a.pt, b.pt, areaPoly)) {
      return { viaJ: false, klass: "aa" };
    }
    const halfType = (res) => (res.seg && jIncident.has(res.seg)) ? res.seg.kind[0] : "a";
    const klass = [halfType(a), halfType(b)].sort().join("");
    return { viaJ: true, klass };
  }

  // --- DOM scaffolding ---
  const wrapper = html`<div style="width:100%;max-width:${size}px;font-family:ui-monospace,'SF Mono',Menlo,monospace;"></div>`;

  // Toolbar: left = save/clear buttons; right = straight/curved radios.
  // The JR slider sits in an absolutely-positioned row anchored to the
  // wrapper, so when curved mode is active it overlays the top of the chart
  // (visually under the radios) without changing the toolbar's height or
  // the chart's vertical position.
  const toolbar = html`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;font-size:12px;color:#555;"></div>`;
  const btnStyle = "padding:4px 10px;font:inherit;font-size:12px;cursor:pointer;border:1px solid #888;background:#fff;border-radius:4px;";
  const leftGroup = html`<div style="display:flex;align-items:center;gap:8px;"></div>`;
  const saveBtn = html`<button style="${btnStyle}">save state</button>`;
  const clearBtn = html`<button style="${btnStyle}">clear</button>`;
  const toolbarStatus = html`<span></span>`;
  leftGroup.appendChild(saveBtn);
  leftGroup.appendChild(clearBtn);
  leftGroup.appendChild(toolbarStatus);

  const radioRow = html`<div style="display:flex;align-items:center;gap:12px;"></div>`;
  const radioLabelStyle = "display:inline-flex;align-items:center;gap:4px;cursor:pointer;user-select:none;";
  const radioStraight = html`<label style="${radioLabelStyle}"><input type="radio" name="snap-mode" value="straight"> straight</label>`;
  const radioCurved = html`<label style="${radioLabelStyle}"><input type="radio" name="snap-mode" value="curved" checked> curved</label>`;
  radioRow.appendChild(radioStraight);
  radioRow.appendChild(radioCurved);

  toolbar.appendChild(leftGroup);
  toolbar.appendChild(radioRow);
  wrapper.appendChild(toolbar);

  // Slider overlay: positioned relative to the wrapper, sitting just below
  // the toolbar's bottom edge. The wrapper needs position:relative for this
  // to anchor correctly. Custom SVG matches the old look: light grey track
  // (#ddd) + medium grey thumb (#888).
  wrapper.style.position = "relative";
  const sliderWidth = 100;
  const sliderRow = html`<div style="position:absolute;top:24px;right:0;display:flex;align-items:center;pointer-events:none;"></div>`;
  const sliderSvg = d3.select(sliderRow).append("svg")
    .attr("width", sliderWidth + 12)
    .attr("height", 14)
    .style("display", "block")
    .style("pointer-events", "auto")
    .style("overflow", "visible");
  // Track sits with right edge at the svg's right, leaving room for the thumb.
  const sliderTrackX0 = 6;
  const sliderTrackX1 = sliderTrackX0 + sliderWidth;
  sliderSvg.append("rect")
    .attr("x", sliderTrackX0).attr("y", 5)
    .attr("width", sliderWidth).attr("height", 4)
    .attr("rx", 2).attr("fill", "#ddd");
  const sliderThumb = sliderSvg.append("circle")
    .attr("cy", 7).attr("r", 6).attr("fill", "#888")
    .style("cursor", "pointer");
  wrapper.appendChild(sliderRow);

  const container = html`<div style="width:100%;aspect-ratio:1/1;cursor:crosshair;"></div>`;
  wrapper.appendChild(container);
  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${size} ${size}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%").style("height", "100%").style("display", "block");

  svg.append("polygon")
    .attr("points", areaPoly.map(p => `${p.x},${p.y}`).join(" "))
    .attr("fill", "#f2f2f2");

  svg.append("g")
    .selectAll("line")
    .data(segments)
    .join("line")
    .attr("x1", d => d.p.x).attr("y1", d => d.p.y)
    .attr("x2", d => d.q.x).attr("y2", d => d.q.y)
    .attr("stroke", "#888").attr("stroke-width", 1);

  svg.append("circle")
    .attr("cx", J.x).attr("cy", J.y).attr("r", 3)
    .attr("fill", "#888");

  const hit = svg.append("rect")
    .attr("x", 0).attr("y", 0).attr("width", size).attr("height", size)
    .attr("fill", "transparent");

  const pathLayer  = svg.append("g").attr("fill", "none");
  const hitLayer   = svg.append("g").attr("fill", "none");
  const markerLayer = svg.append("g");

  // --- Path state ---
  let nextId = 0;
  const paths = [];
  if (Array.isArray(initialState)) {
    for (const entry of initialState) {
      if (!entry || !entry.a || !entry.b) continue;
      paths.push({
        id: nextId++,
        rawA: { x: +entry.a.x, y: +entry.a.y },
        rawB: { x: +entry.b.x, y: +entry.b.y },
      });
    }
  }
  // segOrders[seg] = { bundle: [...members], riders: [...outer riders] }
  // - bundle: ee/le halves that own a slot in the bundle (index = rank).
  // - riders: ae halves arriving from the area; they stack one per slot
  //   starting at rank bundle.length. Riders do NOT count toward the
  //   bundle's perp spacing — bundle members keep their original ranks
  //   regardless of how many riders sit outside them, and the aa-corner
  //   placement excludes riders too.
  const segOrders = new Map();
  segments.forEach(s => segOrders.set(s, { bundle: [], riders: [] }));

  let curvedMode = true;
  // JR controls the bezier region around J in curved mode. Bounds depend on
  // the largest current per-segment offset (the safety floor) so the path's
  // offset lines actually cross the JR circle.
  const jrMax = 150;
  const jrMin = 30;
  function jrBounds() {
    let maxOff = 0;
    for (const seg of segments) {
      const { bundle, riders } = segOrders.get(seg);
      const bundleCount = bundle.length;
      if (bundleCount === 0 && riders.length === 0) continue;
      // Largest absolute rank on this segment. Each rider occupies its own
      // slot starting at bundleCount; the outermost rider sits at
      // bundleCount + riders.length - 1.
      let maxRank;
      if (seg.kind === "link") {
        maxRank = (bundleCount - 1) / 2;
      } else {
        maxRank = bundleCount - 1;
        if (riders.length > 0) maxRank = Math.max(maxRank, bundleCount + riders.length - 1);
      }
      maxOff = Math.max(maxOff, Math.abs(maxRank) * bundleSpacing);
    }
    const lower = Math.max(jrMin, maxOff + 12);
    return { lower: Math.min(lower, jrMax), upper: jrMax };
  }
  let jr = jrMax;        // initial: max
  function reclampJr() {
    const { lower, upper } = jrBounds();
    jr = Math.max(lower, Math.min(upper, jr));
  }

  const svgPoint = (event) => {
    const [x, y] = d3.pointer(event, svg.node());
    return { x, y };
  };
  const endpointR = 8;
  const clampPt = (p) => ({
    x: Math.max(endpointR, Math.min(size - endpointR, p.x)),
    y: Math.max(endpointR, Math.min(size - endpointR, p.y)),
  });

  function computePath(p) {
    const a = resolvePoint(p.rawA);
    const b = resolvePoint(p.rawB);
    const route = routePath(a, b);
    return { ...p, a, b, route, color: pathColors[route.klass] };
  }

  // Classify each half of a 2-segment via-J path:
  //   - "bundle": the half travels along a J-incident segment (ee/le sides,
  //               or same-segment "both" entries). Gets a real bundle slot.
  //   - "rider":  the half is an ea-style arrival — the incident side of an
  //               ea path coming from the area. Rides at outer+1, stacked.
  // Non-incident halves of via-J paths don't appear in segOrders at all.
  //
  // aa paths are excluded entirely: their corner sits along the bisector
  // (via maxIncidentEdgeIndex) and they don't snap to any edge, so they
  // never need a slot on any segment. The skip is at the path level so
  // they don't even count toward rider stacks.
  function syncSegOrders(computed) {
    // For each segment: bundle members and riders desired this frame.
    const desiredBundle = new Map();
    const desiredRiders = new Map();
    segments.forEach(s => {
      desiredBundle.set(s, new Map());
      desiredRiders.set(s, new Map());
    });

    computed.forEach(cp => {
      // aa paths don't participate in edge bundle indexing at all — both
      // halves are in the area, the path bends at the bisector corner,
      // and there's no snap on any segment to push other paths around.
      if (cp.route.klass === "aa") return;

      // Same-segment path: ONE bundle slot, not two.
      if (cp.a.seg && cp.a.seg === cp.b.seg) {
        desiredBundle.get(cp.a.seg).set(`${cp.id}-both`, {
          cp, side: "both", other: cp.b.pt,
        });
        return;
      }

      // Multi-segment paths.
      const aInc = cp.a.seg && jIncident.has(cp.a.seg);
      const bInc = cp.b.seg && jIncident.has(cp.b.seg);

      for (const side of ["a", "b"]) {
        const res  = side === "a" ? cp.a : cp.b;
        const oth  = side === "a" ? cp.b : cp.a;
        if (!res.seg) continue;
        if (!jIncident.has(res.seg)) continue; // non-incident: no slot
        const key = `${cp.id}-${side}`;
        const entry = {
          cp, side, other: oth.pt,
        };
        // If the OTHER half is non-incident (area), this is the ea-style
        // incident side — it should ride the outside of the bundle, not
        // own a slot. The rider concept only applies to edges, though:
        // the link sits outside the area and has a centered bundle, so an
        // la path's link half is a regular bundle member.
        const otherInc = side === "a" ? bInc : aInc;
        if (!otherInc && res.seg.kind === "edge") {
          desiredRiders.get(res.seg).set(key, entry);
        } else {
          desiredBundle.get(res.seg).set(key, entry);
        }
      }
    });

    // For each segment: rebuild bundle order via the priority resolver if
    // membership changed (or no prior order exists); otherwise keep the
    // existing order so drag-reorders stay sticky.
    // Process incident edges first, then the link, so rule 1 (no-cross)
    // sees earlier bundles when looking up the other segment. This is a
    // single-pass approximation — works well in practice for this layout.
    const processOrder = [
      ...segments.filter(s => s.kind === "edge" && jIncident.has(s)),
      ...segments.filter(s => s.kind === "link"),
      ...segments.filter(s => s.kind === "edge" && !jIncident.has(s)),
    ];

    // Helper for ctx.bundleOf — look up another segment's bundle order.
    // CRITICAL: only return bundles that have been (re)computed THIS FRAME.
    // Reading the previous frame's bundle would create a feedback loop where
    // rule 1 perpetuates whatever bootstrap order arose, drowning out the
    // lower-priority rules' attempts to reorganize. By only seeing neighbors
    // already processed this frame, rule 1 acts as a one-way consistency
    // pass: the first segment processed decides via local rules; later
    // segments enforce non-crossing against earlier ones.
    const processedThisFrame = new Set();
    const bundleOf = (otherSeg) => {
      if (!processedThisFrame.has(otherSeg)) return null;
      const o = segOrders.get(otherSeg);
      return o ? o.bundle : null;
    };

    for (const seg of processOrder) {
      const wantB = desiredBundle.get(seg);
      const wantR = desiredRiders.get(seg);

      // BUNDLE and RIDERS go through the same priority-rule pipeline. The
      // only difference is which pool they're in (which the rules don't
      // see — they treat the half-segments the same way). Riders stack at
      // bundle.length + riderIdx (handled in segRankOf).
      const orderOpts = {
        J, segments, areaPoly, bundleOf, jIncident,
      };
      const newBundle = wantB.size === 0
        ? []
        : orderBundle([...wantB.values()], seg, orderOpts);
      const newRiders = wantR.size === 0
        ? []
        : orderBundle([...wantR.values()], seg, orderOpts);

      segOrders.set(seg, { bundle: newBundle, riders: newRiders });
      processedThisFrame.add(seg);
    }
  }

  // link: center-justified; edge: justified into area.
  // Bundle members get their index as the rank. Riders (snap-endpoint paths
  // whose other half is in the area — they cross the edge at the snap point
  // and head straight to the area, never traveling along the edge) each
  // get their own slot, stacking outward from the bundle starting at
  // bundle.length. Riders don't count toward perp spacing for paths that
  // travel along the edge (e.g., aa-corner placement excludes them); the
  // bundle's perp positions stay computed off `bundle.length` alone.
  // For same-segment paths, both sides share the "both" entry's rank.
  function segRankOf(pathId, side, seg) {
    if (!seg) return 0;
    const { bundle, riders } = segOrders.get(seg);
    let idx = bundle.findIndex(e => e.pathId === pathId && e.side === side);
    if (idx < 0) idx = bundle.findIndex(e => e.pathId === pathId && e.side === "both");
    if (idx >= 0) {
      if (seg.kind === "link") return idx - (bundle.length - 1) / 2;
      return idx;
    }
    // Rider? Each rider stacks at its own slot past the bundle.
    const riderIdx = riders.findIndex(e => e.pathId === pathId && e.side === side);
    if (riderIdx >= 0) return bundle.length + riderIdx;
    return 0;
  }

  // Offset endpoint at a snap point: snap_pt + perp * rank * spacing.
  function offsetAtSnap(res, pathId, side) {
    if (!res.seg) return res.pt;
    const r = segRankOf(pathId, side, res.seg);
    return {
      x: res.pt.x + res.seg.perp.x * r * bundleSpacing,
      y: res.pt.y + res.seg.perp.y * r * bundleSpacing,
    };
  }

  // Intersection of two parametric lines; returns null when ~parallel.
  function intersect(p1, d1, p2, d2) {
    const det = d1.x * (-d2.y) - d1.y * (-d2.x);
    if (Math.abs(det) < 1e-6) return null;
    const rhsX = p2.x - p1.x, rhsY = p2.y - p1.y;
    const t = (rhsX * (-d2.y) - rhsY * (-d2.x)) / det;
    return { x: p1.x + t * d1.x, y: p1.y + t * d1.y };
  }

  // Inward-pointing angle bisector at J between the two J-incident EDGES
  // (excluding the link). Computed once: layout is static.
  const aaBisector = (() => {
    const incidentEdges = segments.filter(s => s.kind === "edge" && jIncident.has(s));
    let bx = 0, by = 0;
    for (const seg of incidentEdges) {
      const otherEnd = seg.p === J ? seg.q : seg.p;
      const ox = otherEnd.x - J.x, oy = otherEnd.y - J.y;
      const len = Math.hypot(ox, oy) || 1;
      bx -= ox / len;   // negate: into the area
      by -= oy / len;
    }
    const blen = Math.hypot(bx, by) || 1;
    return { x: bx / blen, y: by / blen };
  })();

  // Largest bundle index used on either J-incident edge. The aa corner sits
  // at this slot so it lines up with the outermost edge-bundle path.
  // Riders (ea paths crossing an edge) are excluded: they shouldn't push the
  // aa corner outward, since they don't affect the corner's adjacent edges.
  function maxIncidentEdgeIndex() {
    let m = 0;
    for (const seg of segments) {
      if (seg.kind !== "edge" || !jIncident.has(seg)) continue;
      const { bundle } = segOrders.get(seg);
      m = Math.max(m, bundle.length - 1);
    }
    return Math.max(0, m);
  }

  // Single corner where a 2-segment path bends.
  //   aa (both non-incident): J shifted into the area along the bisector
  //                           by the max edge rank, so it sits at the same
  //                           offset as the outermost edge-attached path.
  //   ee/le (both incident):  intersection of the two parallel-shifted lines.
  //   ea/la (one of each):    J shifted by the incident side's perpendicular
  //                           offset — the incident offset line continues
  //                           parallel to the segment until it's "level"
  //                           with J, then the non-incident side meets it.
  function cornerFor(cp) {
    const aInc = cp.a.seg && jIncident.has(cp.a.seg);
    const bInc = cp.b.seg && jIncident.has(cp.b.seg);
    if (!aInc && !bInc) {
      const k = maxIncidentEdgeIndex();
      return {
        x: J.x + aaBisector.x * k * bundleSpacing,
        y: J.y + aaBisector.y * k * bundleSpacing,
      };
    }
    if (aInc !== bInc) {
      const res = aInc ? cp.a : cp.b;
      const side = aInc ? "a" : "b";
      const r = segRankOf(cp.id, side, res.seg);
      return {
        x: J.x + res.seg.perp.x * r * bundleSpacing,
        y: J.y + res.seg.perp.y * r * bundleSpacing,
      };
    }
    const oA = offsetAtSnap(cp.a, cp.id, "a");
    const oB = offsetAtSnap(cp.b, cp.id, "b");
    const dA = { x: J.x - cp.a.pt.x, y: J.y - cp.a.pt.y };
    const dB = { x: J.x - cp.b.pt.x, y: J.y - cp.b.pt.y };
    const lenA = Math.hypot(dA.x, dA.y) || 1;
    const lenB = Math.hypot(dB.x, dB.y) || 1;
    dA.x /= lenA; dA.y /= lenA;
    dB.x /= lenB; dB.y /= lenB;
    return intersect(oA, dA, oB, dB) || J;
  }

  // For curved mode: bezier across a JR circle centered at the corner. Line
  // directions come from each side's geometry toward the corner.
  function bezierFor(cp) {
    const aInc = cp.a.seg && jIncident.has(cp.a.seg);
    const bInc = cp.b.seg && jIncident.has(cp.b.seg);
    // ee/le bezier sits at J; aa/ea/la bezier sits at the path's corner.
    const center = (aInc && bInc) ? J : cornerFor(cp);

    const oA = offsetAtSnap(cp.a, cp.id, "a");
    const oB = offsetAtSnap(cp.b, cp.id, "b");

    // Direction for each side: incident sides go along the segment (toward J,
    // which is also along the offset line); non-incident sides head straight
    // at the bezier center.
    function dirOf(res, offsetPt, isInc) {
      const ref = isInc ? res.pt : offsetPt;
      const target = isInc ? J : center;
      const d = { x: target.x - ref.x, y: target.y - ref.y };
      const len = Math.hypot(d.x, d.y) || 1;
      return { x: d.x / len, y: d.y / len };
    }
    const dA = dirOf(cp.a, oA, aInc);
    const dB = dirOf(cp.b, oB, bInc);

    // Cap JR so each offset_snap sits at or outside the JR circle.
    const halfA = Math.hypot(oA.x - center.x, oA.y - center.y);
    const halfB = Math.hypot(oB.x - center.x, oB.y - center.y);
    const effJr = Math.min(jr, halfA, halfB);

    // Solve |O + t*d - center|² = effJr² for each side; pick the entry crossing.
    function entry(o, d) {
      const ux = o.x - center.x, uy = o.y - center.y;
      const udd = ux * d.x + uy * d.y;
      const disc = udd * udd - (ux * ux + uy * uy) + effJr * effJr;
      if (disc < 0) return null;
      const root = Math.sqrt(disc);
      const t1 = -udd - root, t2 = -udd + root;
      const t = t1 >= -1e-6 ? Math.max(0, t1) : (t2 > 0 ? t2 : 0);
      return { pt: { x: o.x + t * d.x, y: o.y + t * d.y }, t };
    }
    const eA = entry(oA, dA);
    const eB = entry(oB, dB);
    if (!eA || !eB) return null;

    const P0 = eA.pt, P3 = eB.pt;
    const cosBeta = -dA.x * dB.x - dA.y * dB.y;
    const beta = Math.acos(Math.max(-1, Math.min(1, cosBeta)));
    const chord = Math.hypot(P3.x - P0.x, P3.y - P0.y);
    const cb4 = Math.cos(beta / 4);
    // Clamp ctrlDist so the bezier handles stay inside the JR circle.
    const vA = { x: P0.x - center.x, y: P0.y - center.y };
    const vB = { x: P3.x - center.x, y: P3.y - center.y };
    const projA = Math.abs(vA.x * dA.x + vA.y * dA.y);
    const projB = Math.abs(vB.x * dB.x + vB.y * dB.y);
    const ctrlDist = Math.min(chord / (3 * cb4 * cb4), 2 * projA, 2 * projB);
    const P1 = { x: P0.x + dA.x * ctrlDist, y: P0.y + dA.y * ctrlDist };
    const P2 = { x: P3.x + dB.x * ctrlDist, y: P3.y + dB.y * ctrlDist };
    return { P0, P1, P2, P3 };
  }

  // Build the visible path d-string. Uses straight corner in straight mode;
  // bezier across the JR circle in curved mode.
  function buildD(cp) {
    const oA = offsetAtSnap(cp.a, cp.id, "a");
    const oB = offsetAtSnap(cp.b, cp.id, "b");
    const parts = [`M ${cp.a.anchor.x} ${cp.a.anchor.y}`];
    if (!samePt(cp.a.anchor, oA)) parts.push(`L ${oA.x} ${oA.y}`);
    if (cp.route.viaJ) {
      const bez = curvedMode ? bezierFor(cp) : null;
      if (bez) {
        parts.push(`L ${bez.P0.x} ${bez.P0.y}`);
        parts.push(`C ${bez.P1.x} ${bez.P1.y} ${bez.P2.x} ${bez.P2.y} ${bez.P3.x} ${bez.P3.y}`);
      } else {
        const c = cornerFor(cp);
        parts.push(`L ${c.x} ${c.y}`);
      }
    }
    if (!samePt(cp.b.anchor, oB)) parts.push(`L ${oB.x} ${oB.y}`);
    parts.push(`L ${cp.b.anchor.x} ${cp.b.anchor.y}`);
    return parts.join(" ");
  }

  function waypointsFor(cp) {
    // Used by hit-area splitting; always uses the straight corner regardless
    // of mode (hit strokes are wide enough that the curve mismatch is invisible).
    const oA = offsetAtSnap(cp.a, cp.id, "a");
    const oB = offsetAtSnap(cp.b, cp.id, "b");
    const wp = [cp.a.anchor];
    if (!samePt(cp.a.anchor, oA)) wp.push(oA);
    if (cp.route.viaJ) wp.push(cornerFor(cp));
    if (!samePt(cp.b.anchor, oB)) wp.push(oB);
    wp.push(cp.b.anchor);
    return wp;
  }

  function joinWaypoints(wp) {
    const out = [wp[0]];
    for (let i = 1; i < wp.length; i++) {
      if (!samePt(out[out.length - 1], wp[i])) out.push(wp[i]);
    }
    return out.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  }

  // Per-half d-strings for hit areas. 2-segment paths split at the corner.
  function buildHalfDs(cp) {
    const oA = offsetAtSnap(cp.a, cp.id, "a");
    const oB = offsetAtSnap(cp.b, cp.id, "b");
    if (!cp.route.viaJ) {
      return [{ side: "whole", d: joinWaypoints(waypointsFor(cp)) }];
    }
    const corner = cornerFor(cp);
    const wpA = [cp.a.anchor];
    if (!samePt(cp.a.anchor, oA)) wpA.push(oA);
    wpA.push(corner);
    const wpB = [corner];
    if (!samePt(cp.b.anchor, oB)) wpB.push(oB);
    wpB.push(cp.b.anchor);
    return [
      { side: "a", d: joinWaypoints(wpA), seg: cp.a.seg },
      { side: "b", d: joinWaypoints(wpB), seg: cp.b.seg },
    ];
  }

  function render() {
    const computed = paths.map(computePath);
    syncSegOrders(computed);
    reclampJr();
    updateSliderInput();

    pathLayer.selectAll("path")
      .data(computed, d => d.id)
      .join("path")
      .attr("d", buildD)
      .attr("stroke", d => d.color)
      .attr("stroke-width", 4)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .style("pointer-events", "none");

    const halves = computed.flatMap(cp =>
      buildHalfDs(cp).map(h => ({ ...h, id: cp.id, color: cp.color, cp }))
    );

    hitLayer.selectAll("path")
      .data(halves, d => `${d.id}-${d.side}`)
      .join("path")
      .attr("d", d => d.d)
      .attr("stroke", "transparent")
      .attr("stroke-width", 14)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .style("cursor", "pointer")
      .on("dblclick", function(event, d) {
        event.stopPropagation();
        const idx = paths.findIndex(p => p.id === d.id);
        if (idx >= 0) {
          paths.splice(idx, 1);
          render();
        }
      });

    const endpoints = computed.flatMap(d => [
      { id: d.id, end: "a", pt: d.a.anchor, color: d.color },
      { id: d.id, end: "b", pt: d.b.anchor, color: d.color },
    ]);
    markerLayer.selectAll("circle.endpoint")
      .data(endpoints, d => `${d.id}-${d.end}`)
      .join("circle")
      .attr("class", "endpoint")
      .attr("cx", d => d.pt.x).attr("cy", d => d.pt.y)
      .attr("r", endpointR)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff").attr("stroke-width", 1.5)
      .style("cursor", "grab")
      .call(d3.drag()
        .on("start", function(event) {
          event.sourceEvent.stopPropagation();
          d3.select(this).style("cursor", "grabbing");
        })
        .on("drag", function(event, datum) {
          const p = clampPt(svgPoint(event));
          const path = paths.find(pp => pp.id === datum.id);
          if (!path) return;
          if (datum.end === "a") path.rawA = p; else path.rawB = p;
          render();
        })
        .on("end", function() {
          d3.select(this).style("cursor", "grab");
        }));

    // Numeric path-ID labels on top of each endpoint dot. Pointer-events
    // off so the label doesn't intercept drag — the underlying circle
    // still receives the mousedown.
    markerLayer.selectAll("text.endpoint-label")
      .data(endpoints, d => `${d.id}-${d.end}`)
      .join("text")
      .attr("class", "endpoint-label")
      .attr("x", d => d.pt.x).attr("y", d => d.pt.y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", 9)
      .attr("font-weight", 700)
      .attr("fill", "#fff")
      .style("pointer-events", "none")
      .style("user-select", "none")
      .text(d => d.id);
  }

  // Drafting: drag on empty space to create a new path.
  let draft = null, draftStart = null;
  hit.call(d3.drag()
    .on("start", function(event) {
      draftStart = clampPt(svgPoint(event));
      draft = { id: nextId++, rawA: draftStart, rawB: draftStart };
      paths.push(draft);
      render();
    })
    .on("drag", function(event) {
      if (!draft) return;
      draft.rawB = clampPt(svgPoint(event));
      render();
    })
    .on("end", function(event) {
      if (!draft) return;
      const p = clampPt(svgPoint(event));
      if (dist(draftStart, p) < 3) {
        const idx = paths.indexOf(draft);
        if (idx >= 0) paths.splice(idx, 1);
      } else {
        draft.rawB = p;
      }
      draft = null;
      draftStart = null;
      render();
    }));

  // --- Toolbar wiring: radio buttons + slider ---
  // Slider maps thumb cx ↔ jr against the dynamic [lower, upper] from
  // jrBounds(). Bounds shift as paths come and go, so updateSliderInput()
  // re-derives the thumb position each render to keep it in sync.
  // Map jr ↔ thumb cx. Track runs from sliderTrackX0 to sliderTrackX1.
  function jrToThumbX(value) {
    const { lower, upper } = jrBounds();
    if (upper - lower < 1e-6) return sliderTrackX1;
    return sliderTrackX0 + ((value - lower) / (upper - lower)) * sliderWidth;
  }
  function thumbXToJr(x) {
    const { lower, upper } = jrBounds();
    const cx = Math.max(sliderTrackX0, Math.min(sliderTrackX1, x));
    return lower + ((cx - sliderTrackX0) / sliderWidth) * (upper - lower);
  }
  function updateSliderInput() {
    sliderThumb.attr("cx", jrToThumbX(jr));
    sliderRow.style.display = curvedMode ? "" : "none";
  }
  sliderSvg.call(d3.drag()
    .on("start drag", function(event) {
      const [x] = d3.pointer(event, sliderSvg.node());
      jr = thumbXToJr(x);
      sliderThumb.attr("cx", jrToThumbX(jr));
      pathLayer.selectAll("path").attr("d", buildD);
    }));

  function updateRadios() {
    radioStraight.querySelector("input").checked = !curvedMode;
    radioCurved.querySelector("input").checked = curvedMode;
    sliderRow.style.display = curvedMode ? "" : "none";
  }
  radioStraight.querySelector("input").addEventListener("change", () => {
    if (radioStraight.querySelector("input").checked) {
      curvedMode = false;
      updateRadios();
      render();
    }
  });
  radioCurved.querySelector("input").addEventListener("change", () => {
    if (radioCurved.querySelector("input").checked) {
      curvedMode = true;
      updateRadios();
      render();
    }
  });
  updateRadios();

  // --- Toolbar wiring: save/clear buttons ---
  // "save state" copies a compact JSON list of { a, b } anchor pairs that
  // can be pasted directly into the `initialState` const at the top of
  // this cell. "clear" wipes all paths and re-renders.
  function serializeState() {
    const round = (n) => Math.round(n * 10) / 10;
    const items = paths.map(p =>
      `  { a: { x: ${round(p.rawA.x)}, y: ${round(p.rawA.y)} }, b: { x: ${round(p.rawB.x)}, y: ${round(p.rawB.y)} } }`
    );
    return items.length ? `[\n${items.join(",\n")}\n]` : `[]`;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // Clipboard API failed (insecure context, no permission); fall back.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (_) {}
      document.body.removeChild(ta);
      return ok;
    }
  }

  saveBtn.addEventListener("click", async () => {
    const ok = await copyText(serializeState());
    toolbarStatus.textContent = ok
      ? `copied ${paths.length} path${paths.length === 1 ? "" : "s"}`
      : "copy failed";
    setTimeout(() => { toolbarStatus.textContent = ""; }, 1500);
  });

  clearBtn.addEventListener("click", () => {
    paths.length = 0;
    nextId = 0;
    render();
    toolbarStatus.textContent = "cleared";
    setTimeout(() => { toolbarStatus.textContent = ""; }, 1500);
  });

  // Initial render so initialState (if any) shows up immediately.
  render();

  return wrapper;
}


function _bundlePriorities(){return(
(() => {

  // --- shared helpers ---

  const signedDelta = (d) => {
    while (d <= -Math.PI) d += 2 * Math.PI;
    while (d >   Math.PI) d -= 2 * Math.PI;
    return d;
  };

  // Returns -1, 0, or +1 for sin(signed exit delta) — used by rule 2 to
  // classify which half of the bundle a path belongs in.
  const signOfSin = (p) => {
    const d = signedDelta((p.otherAngle ?? 0) - (p.spokeAngle ?? 0));
    const s = Math.sin(d);
    return s > 0 ? 1 : s < 0 ? -1 : 0;
  };

  const cross = (a, b) => a.x * b.y - a.y * b.x;

  const inwardOf = (s, J) => {
    const farEnd = s.p === J ? s.q : s.p;
    const dx = J.x - farEnd.x, dy = J.y - farEnd.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  };

  return [

    // Rule 1: Two paths sharing a pair of segments never cross at J.
    //
    // For each pair of paths whose other-half is on the SAME other segment,
    // propagate the order from that other segment to this one. The mapping
    // depends on bend geometry: +perp on segA and segB may be on the same
    // side relative to the bundle's travel direction (no inversion), or on
    // opposite sides (inversion). See sign(perp × travelDir).
    {
      name: "no_cross_at_shared_waypoint",
      constraints(paths, ctx) {
        const { seg, J, bundleOf } = ctx;
        if (!seg || !J || !bundleOf) return [];

        const sideHere = Math.sign(cross(seg.perp, inwardOf(seg, J)));

        // Group paths by their other-seg.
        const byOther = new Map();
        for (const p of paths) {
          if (!p.otherSeg) continue;
          let group = byOther.get(p.otherSeg);
          if (!group) { group = []; byOther.set(p.otherSeg, group); }
          group.push(p);
        }

        const out = [];
        for (const [otherSeg, group] of byOther) {
          if (group.length < 2) continue;
          const otherOrder = bundleOf(otherSeg);
          if (!otherOrder) continue;

          // (pathId, side) -> idx lookup, built once per otherSeg.
          const idxLookup = new Map();
          for (let i = 0; i < otherOrder.length; i++) {
            const e = otherOrder[i];
            idxLookup.set(`${e.pathId}-${e.side}`, i);
          }
          const idxFor = (p) => {
            let i = idxLookup.get(`${p.pathId}-${p.otherSide}`);
            if (i === undefined) i = idxLookup.get(`${p.pathId}-both`);
            return i;
          };

          // For the other segment, the path travels OUTWARD (away from J).
          const outwardOther = inwardOf(otherSeg, J);
          outwardOther.x = -outwardOther.x;
          outwardOther.y = -outwardOther.y;
          const sideOther = Math.sign(cross(otherSeg.perp, outwardOther));
          const invert = sideHere !== sideOther;

          for (let i = 0; i < group.length; i++) {
            const A = group[i];
            const aIdx = idxFor(A);
            if (aIdx === undefined) continue;
            for (let j = i + 1; j < group.length; j++) {
              const B = group[j];
              const bIdx = idxFor(B);
              if (bIdx === undefined) continue;
              const aOuterOther = aIdx > bIdx;
              const aOuterHere = invert ? !aOuterOther : aOuterOther;
              if (aOuterHere) out.push({ outer: A.key, inner: B.key });
              else            out.push({ outer: B.key, inner: A.key });
            }
          }
        }
        return out;
      },
    },

    // Rule 2: Class outerness on LINK bundles.
    //
    // Edge-bound paths (other half on another J-incident segment, i.e.
    // `le`/`el`) frame the bundle at its extremes; area-bound paths
    // (`la`/`al`, including those snapped to a non-J-incident segment) sit
    // in the middle.
    //
    // Per side: on the +perp half (sin > 0), edge-bound paths are MORE
    // +perp (higher rank) than area-bound. On the -perp half (sin < 0),
    // edge-bound paths are MORE -perp (lower rank). Opposite-side pairs
    // are left to rule 3.
    //
    // Inert on edges: edge bundles only carry `ee`/`le` members (riders
    // and aa-corners use separate slot machinery), so partitioning into
    // edge-bound vs area-bound is degenerate.
    {
      name: "class_outerness",
      constraints(paths, ctx) {
        if (!ctx.seg || ctx.seg.kind !== "link") return [];
        const jIncident = ctx.jIncident;

        const edgePos = [], edgeNeg = [], areaPos = [], areaNeg = [];
        for (const p of paths) {
          const s = signOfSin(p);
          if (s === 0) continue;
          const edge = !!p.otherSeg && jIncident.has(p.otherSeg);
          if (edge) (s > 0 ? edgePos : edgeNeg).push(p);
          else      (s > 0 ? areaPos : areaNeg).push(p);
        }

        const out = [];
        for (const E of edgePos) for (const A of areaPos) {
          out.push({ outer: E.key, inner: A.key });
        }
        for (const A of areaNeg) for (const E of edgeNeg) {
          out.push({ outer: A.key, inner: E.key });
        }
        return out;
      },
    },

    // Rule 3: Angular sort — bundle order matches the order paths split
    // off at J.
    //
    // For each path on this seg, project its exit direction at J onto the
    // bundle's perp axis (link) or take |signed delta| (edge, one-sided).
    // Emit a chain of outer→inner constraints in that order; the resolver's
    // transitive closure gives the full ordering, so we don't emit the
    // O(n²) pairwise set.
    {
      name: "angular_split_order",
      constraints(paths, ctx) {
        if (paths.length < 2) return [];
        const isLink = ctx.seg && ctx.seg.kind === "link";

        const keyVal = new Map();
        for (const p of paths) {
          const d = signedDelta((p.otherAngle ?? 0) - (p.spokeAngle ?? 0));
          keyVal.set(p, isLink ? Math.sin(d) : Math.abs(d));
        }

        const sorted = paths.slice().sort(
          (u, v) => keyVal.get(v) - keyVal.get(u)
        );
        const out = new Array(sorted.length - 1);
        for (let i = 0; i < sorted.length - 1; i++) {
          out[i] = { outer: sorted[i].key, inner: sorted[i + 1].key };
        }
        return out;
      },
    },

    // Rule 4: Snap-endpoint paths (user-placed dot terminates ON this
    // segment) sit OUTER of any non-snap (transit) members.
    //
    // Edge only — on the link, all anchors snap to the link (the link
    // extends outside the area), so the partition is degenerate.
    {
      name: "snap_endpoint_outside",
      constraints(paths, ctx) {
        if (!ctx.seg || ctx.seg.kind === "link") return [];
        const snaps = [], rest = [];
        for (const p of paths) (p.isSnapEndpoint ? snaps : rest).push(p);
        if (snaps.length === 0 || rest.length === 0) return [];
        const out = new Array(snaps.length * rest.length);
        let k = 0;
        for (const S of snaps) for (const R of rest) {
          out[k++] = { outer: S.key, inner: R.key };
        }
        return out;
      },
    },

    // Rule 5: Snap-endpoint paths sort by their endpoint's signed perp
    // projection on this segment. Higher projection → +perp side → outer
    // slot. Emit as a chain (sort descending, link adjacent).
    //
    // Edge only — link ordering is fully determined by exit direction
    // (rule 3); the dot's offset from the link line is incidental.
    {
      name: "snap_endpoint_side",
      constraints(paths, ctx) {
        const seg = ctx.seg;
        if (!seg || seg.kind === "link") return [];

        const snaps = [];
        for (const p of paths) {
          if (!p.isSnapEndpoint || !p.endpointPos) continue;
          const dx = p.endpointPos.x - seg.p.x;
          const dy = p.endpointPos.y - seg.p.y;
          snaps.push({ p, proj: dx * seg.perp.x + dy * seg.perp.y });
        }
        if (snaps.length < 2) return [];

        snaps.sort((a, b) => b.proj - a.proj);
        const out = [];
        for (let i = 0; i < snaps.length - 1; i++) {
          if (snaps[i].proj > snaps[i + 1].proj + 1e-6) {
            out.push({ outer: snaps[i].p.key, inner: snaps[i + 1].p.key });
          }
        }
        return out;
      },
    },

  ];
})()
)}

function _resolveBundleOrder(){return(
function(halfSegments, rules, ctx = {}) {
  const m = halfSegments.length;
  const ranks = new Map();
  if (m === 0) return ranks;
  if (m === 1) {
    ranks.set(halfSegments[0].key, 0);
    return ranks;
  }

  // adj[outer] = Set of inner-keys reachable via direct edge.
  // revAdj[inner] = Set of outer-keys with direct edges to inner.
  const adj = new Map();
  const revAdj = new Map();
  for (const h of halfSegments) {
    adj.set(h.key, new Set());
    revAdj.set(h.key, new Set());
  }

  // Cycle detection: adding outer -> inner creates a cycle iff `outer` is
  // already reachable from `inner` along existing edges.
  function wouldCycle(outer, inner) {
    if (outer === inner) return true;
    const stack = [inner];
    const seen = new Set();
    seen.add(inner);
    while (stack.length) {
      const n = stack.pop();
      if (n === outer) return true;
      const next = adj.get(n);
      if (!next) continue;
      for (const nx of next) {
        if (!seen.has(nx)) {
          seen.add(nx);
          stack.push(nx);
        }
      }
    }
    return false;
  }

  function addEdge(outer, inner) {
    const a = adj.get(outer);
    if (!a) return false;
    if (a.has(inner)) return true;
    if (wouldCycle(outer, inner)) return false;
    a.add(inner);
    revAdj.get(inner).add(outer);
    return true;
  }

  // Apply rules in priority order.
  for (const rule of rules) {
    const cs = rule.constraints(halfSegments, ctx);
    for (const c of cs) {
      if (c && c.outer !== c.inner) addEdge(c.outer, c.inner);
    }
  }

  // Tiebreaker: matches rule 3's convention so the "default" ordering when
  // the partial order leaves siblings unconstrained is the angular sort.
  //   - LINK: largest sin(signed delta) → +perp end first.
  //   - EDGE: largest |signed delta| → outer slot first (gentler bend).
  const isLink = ctx.seg && ctx.seg.kind === "link";
  const tieKey = new Map();
  for (const p of halfSegments) {
    let d = (p.otherAngle ?? 0) - (p.spokeAngle ?? 0);
    while (d <= -Math.PI) d += 2 * Math.PI;
    while (d >   Math.PI) d -= 2 * Math.PI;
    tieKey.set(p.key, isLink ? Math.sin(d) : Math.abs(d));
  }
  const tieBetter = (a, b) => tieKey.get(b) - tieKey.get(a); // descending

  // Kahn's algorithm. Keep `ready` as an array; on each iteration find the
  // largest-tieKey element with a single linear scan instead of a full sort.
  // For typical bundle sizes (≤20) this is faster than repeated sort calls
  // and faster than maintaining a binary heap.
  const inDeg = new Map();
  const ready = [];
  for (const p of halfSegments) {
    const d = revAdj.get(p.key).size;
    inDeg.set(p.key, d);
    if (d === 0) ready.push(p.key);
  }

  const sorted = [];
  while (ready.length) {
    // Find argmax of tieKey in ready (single linear scan).
    let bestIdx = 0;
    for (let i = 1; i < ready.length; i++) {
      if (tieBetter(ready[i], ready[bestIdx]) < 0) bestIdx = i;
    }
    const next = ready[bestIdx];
    // O(1) remove: swap with last, then pop.
    ready[bestIdx] = ready[ready.length - 1];
    ready.pop();

    sorted.push(next);
    for (const child of adj.get(next)) {
      const d = inDeg.get(child) - 1;
      inDeg.set(child, d);
      if (d === 0) ready.push(child);
    }
  }

  // Safety: if a cycle slipped through (it shouldn't, given wouldCycle),
  // append the remainder in tieKey order.
  if (sorted.length < m) {
    const placed = new Set(sorted);
    const rest = halfSegments
      .filter(p => !placed.has(p.key))
      .sort((a, b) => tieKey.get(b.key) - tieKey.get(a.key))
      .map(p => p.key);
    sorted.push(...rest);
  }

  // Position 0 → highest rank; position m-1 → lowest.
  const mid = (m - 1) / 2;
  for (let i = 0; i < sorted.length; i++) {
    ranks.set(sorted[i], mid - i);
  }
  return ranks;
}
)}

function _orderBundle(resolveBundleOrder,bundlePriorities){return(
(() => {

  // Build the half-segment object the priority rules consume. Only fields
  // rules actually read are populated.
  const buildHalfSegment = (cp, side, other, seg, spokeAngle, J, jIncident) => {
    const res = side === "b" ? cp.b : cp.a;
    const oth = side === "b" ? cp.a : cp.b;

    // Outgoing direction at J:
    //   - other half on a different J-incident segment: spoke angle of
    //     that segment (the direction the path heads after bending at J);
    //   - other half on the same segment (no J bend): snap-to-other;
    //   - otherwise (area or non-J-incident segment): angle from J to
    //     oth.pt (independent of this seg's snap location).
    let otherAngle;
    if (oth.seg && jIncident.has(oth.seg) && oth.seg !== seg) {
      const otherFarEnd = oth.seg.p === J ? oth.seg.q : oth.seg.p;
      otherAngle = Math.atan2(otherFarEnd.y - J.y, otherFarEnd.x - J.x);
    } else if (oth.seg === seg) {
      otherAngle = Math.atan2(other.y - res.pt.y, other.x - res.pt.x);
    } else {
      otherAngle = Math.atan2(other.y - J.y, other.x - J.x);
    }

    const isSnapEndpoint = res.type !== "area";

    return {
      key: `${cp.id}-${side}`,
      pathId: cp.id,
      side,
      otherSeg: oth.seg || null,
      otherSide: side === "a" ? "b" : side === "b" ? "a" : "both",
      spokeAngle,
      otherAngle,
      isSnapEndpoint,
      endpointPos: isSnapEndpoint ? res.anchor : null,
      pathClass: cp.route.klass,
    };
  };

  return function orderBundle(members, seg, options) {
    if (!members || members.length === 0) return [];
    const { J, segments, areaPoly, bundleOf, jIncident } = options;

    const farEnd = seg.p === J ? seg.q : seg.p;
    const spokeAngle = Math.atan2(farEnd.y - J.y, farEnd.x - J.x);

    const halfSegments = members.map(({ cp, side, other }) =>
      buildHalfSegment(cp, side, other, seg, spokeAngle, J, jIncident)
    );

    const ranks = resolveBundleOrder(halfSegments, bundlePriorities, {
      seg, segments, J, areaPoly, bundleOf, jIncident,
    });

    halfSegments.sort((u, v) => ranks.get(u.key) - ranks.get(v.key));
    return halfSegments.map(hs => ({ pathId: hs.pathId, side: hs.side }));
  };
})()
)}

function _24(md){return(
md`Priorities in strictly lexicographical order:

1. **Shared-waypoint non-crossing.**<br>
   When two paths share both J-incident segments (so they bend through
   J together), their order on one segment determines their order on
   the other. Whether the perp side stays the same or flips across the
   bend is decided by the geometry of the two segments.

2. **Link bundles separate by class.**<br>
   On the link, \`le\`/\`el\` paths (those that bend at J onto another
   J-incident segment) frame the bundle at its two extremes; \`la\`/\`al\`
   paths (those that continue into the area) sit in the middle. Within
   each +perp / -perp half, edge-bound paths are more extreme than
   area-bound paths. (Inert on edges.)

3. **Angular split order.**<br>
   Paths sort by the direction they leave J:
   - on a link, by sin(signed delta from spoke) — projecting the exit
     direction onto the perp axis, so paths exiting near the spoke axis
     sit in the middle of the bundle and paths exiting perpendicular to
     the spoke sit at the extremes;
   - on an edge, by |signed delta from spoke| — gentler bends outside,
     sharper bends inside.

4. **Snap-endpoint paths sit on the outside of the bundle.**<br>
   Edges only. A path whose user-placed endpoint terminates on this
   segment is OUTER of any "transit" path passing through.

5. **Snap-endpoint paths sort by endpoint's signed perp projection.**<br>
   Edges only. Higher projection (further +perp) → outer slot. Decides
   the order among multiple snap endpoints on the same segment.`
)}

function _25(md){return(
md`## Build Navigation Mesh`
)}

function _26(md){return(
md`### Hierarchical network of paths through common waypoints`
)}

function _27(md){return(
md`For flexible shipping routes, we need a nav mesh. Links can route shipping land, river and canal traffic, and areas can route traffic through the gulf and ocean areas.`
)}

function _geometry()
{
  // Project (px, py) onto segment ab.
  // Returns { t, fx, fy, d2, len2 } where t is clamped to [0, 1].
  function projectToSegment(px, py, a, b) {
    const vx = b.x - a.x, vy = b.y - a.y;
    const len2 = vx * vx + vy * vy;
    if (len2 < 1e-12) {
      const dx = a.x - px, dy = a.y - py;
      return { t: 0, fx: a.x, fy: a.y, d2: dx * dx + dy * dy, len2: 0 };
    }
    let t = ((px - a.x) * vx + (py - a.y) * vy) / len2;
    t = Math.max(0, Math.min(1, t));
    const fx = a.x + t * vx, fy = a.y + t * vy;
    const dx = fx - px, dy = fy - py;
    return { t, fx, fy, d2: dx * dx + dy * dy, len2 };
  }

  // Strict-interior crossing of segments p1->p2 and p3->p4.
  // Returns { t, u, x, y } where 0 < t < 1 and 0 < u < 1, else null.
  function segmentIntersection(p1, p2, p3, p4, eps = 1e-6) {
    const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-12) return null;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    if (t <= eps || t >= 1 - eps || u <= eps || u >= 1 - eps) return null;
    return { t, u, x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
  }

  // Ray-casting point-in-ring test. `ring` is an array of {x, y}.
  function pointInRing(x, y, ring) {
    let inside = false;
    const n = ring.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = ring[i].x, yi = ring[i].y;
      const xj = ring[j].x, yj = ring[j].y;
      const intersects =
        ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-12) + xi);
      if (intersects) inside = !inside;
    }
    return inside;
  }

  // Signed area of a ring of {x, y}. Negative = CW in screen coords (y down).
  function signedArea(ring) {
    let s = 0;
    for (let i = 0; i < ring.length; i++) {
      const p1 = ring[i];
      const p2 = ring[(i + 1) % ring.length];
      s += (p2.x - p1.x) * (p2.y + p1.y);
    }
    return s / 2;
  }

  // Canonical key for a ring of comparable ids (handles rotation + reversal).
  function canonicalRingKey(ringIds) {
    const n = ringIds.length;
    let minIdx = 0;
    for (let i = 1; i < n; i++) if (ringIds[i] < ringIds[minIdx]) minIdx = i;
    const forward = [], backward = [];
    for (let i = 0; i < n; i++) {
      forward.push(ringIds[(minIdx + i) % n]);
      backward.push(ringIds[(minIdx - i + n) % n]);
    }
    const f = forward.join(",");
    const b = backward.join(",");
    return f < b ? f : b;
  }

  // Pick a small-offset point strictly inside a ring of {x, y}.
  // Tries perpendicular offsets of each edge midpoint until one lands inside.
  function interiorPointOfRing(ring, probe = 0.5) {
    const n = ring.length;
    for (let i = 0; i < n; i++) {
      const a = ring[i], b = ring[(i + 1) % n];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const p1 = { x: mx + nx * probe, y: my + ny * probe };
      const p2 = { x: mx - nx * probe, y: my - ny * probe };
      if (pointInRing(p1.x, p1.y, ring)) return p1;
      if (pointInRing(p2.x, p2.y, ring)) return p2;
    }
    return null;
  }

  return {
    projectToSegment,
    segmentIntersection,
    pointInRing,
    signedArea,
    canonicalRingKey,
    interiorPointOfRing
  };
}


function _buildNavMesh(geometry){return(
function buildNavMesh(points, links, disabledFaceKeys = new Set()) {
  const { projectToSegment, segmentIntersection, pointInRing,
          signedArea, canonicalRingKey, interiorPointOfRing } = geometry;

  // ---------- Step 1: derived graph (split crossings with virtual points) ----------
  const derivedPoints = points.map(p => ({
    id: "u" + p.id, x: p.x, y: p.y, virtual: false, userId: p.id
  }));
  const virtualPoints = [];
  let vCounter = 0;

  function getOrCreateVirtual(x, y) {
    for (const vp of virtualPoints) {
      if (Math.abs(vp.x - x) < 1e-3 && Math.abs(vp.y - y) < 1e-3) return vp.id;
    }
    for (const up of derivedPoints) {
      if (!up.virtual && Math.abs(up.x - x) < 1e-3 && Math.abs(up.y - y) < 1e-3) {
        return up.id;
      }
    }
    const id = "v" + (vCounter++);
    virtualPoints.push({ id, x, y });
    return id;
  }

  const linkSplits = new Map();
  links.forEach(l => linkSplits.set(l.id, []));

  for (let i = 0; i < links.length; i++) {
    const li = links[i];
    const pi1 = points.find(p => p.id === li.a);
    const pi2 = points.find(p => p.id === li.b);
    if (!pi1 || !pi2) continue;
    for (let j = i + 1; j < links.length; j++) {
      const lj = links[j];
      if (lj.a === li.a || lj.a === li.b || lj.b === li.a || lj.b === li.b) continue;
      const pj1 = points.find(p => p.id === lj.a);
      const pj2 = points.find(p => p.id === lj.b);
      if (!pj1 || !pj2) continue;
      const x = segmentIntersection(pi1, pi2, pj1, pj2);
      if (!x) continue;
      const vid = getOrCreateVirtual(x.x, x.y);
      if (vid.startsWith("v") && !derivedPoints.find(p => p.id === vid)) {
        derivedPoints.push({ id: vid, x: x.x, y: x.y, virtual: true });
      }
      linkSplits.get(li.id).push({ t: x.t, id: vid });
      linkSplits.get(lj.id).push({ t: x.u, id: vid });
    }
  }

  const derivedLinks = [];
  let dlIdCounter = 0;
  const EPS = 1e-6;
  links.forEach(l => {
    const splits = (linkSplits.get(l.id) || []).slice().sort((a, b) => a.t - b.t);
    const sequence = ["u" + l.a];
    let lastT = 0;
    splits.forEach(s => {
      if (s.t - lastT < EPS) return;
      sequence.push(s.id);
      lastT = s.t;
    });
    sequence.push("u" + l.b);
    for (let i = 0; i < sequence.length - 1; i++) {
      const a = sequence[i], b = sequence[i + 1];
      if (a === b) continue;
      derivedLinks.push({ id: "d" + (dlIdCounter++), a, b, sourceLinkId: l.id });
    }
  });

  const derivedPointById = new Map();
  derivedPoints.forEach(p => derivedPointById.set(p.id, p));
  const dPointById = id => derivedPointById.get(id);

  // ---------- Step 2: planar face traversal ----------
  const neighbors = new Map();
  derivedPoints.forEach(p => neighbors.set(p.id, []));
  derivedLinks.forEach(l => {
    if (!neighbors.has(l.a)) neighbors.set(l.a, []);
    if (!neighbors.has(l.b)) neighbors.set(l.b, []);
    neighbors.get(l.a).push(l.b);
    neighbors.get(l.b).push(l.a);
  });

  const sortedNeighbors = new Map();
  neighbors.forEach((nbrs, nid) => {
    const p = dPointById(nid);
    if (!p) { sortedNeighbors.set(nid, []); return; }
    const arr = nbrs.slice();
    const angles = new Map();
    arr.forEach(n => {
      const np = dPointById(n);
      if (np) angles.set(n, Math.atan2(np.y - p.y, np.x - p.x));
    });
    arr.sort((x, y) => angles.get(x) - angles.get(y));
    sortedNeighbors.set(nid, arr);
  });

  function nextHalfEdge(from, to) {
    const nbrs = sortedNeighbors.get(to);
    if (!nbrs || nbrs.length === 0) return null;
    const idx = nbrs.indexOf(from);
    if (idx === -1) return null;
    return nbrs[(idx - 1 + nbrs.length) % nbrs.length];
  }

  function ringToXY(ring) {
    return ring.map(id => {
      const p = dPointById(id);
      return p ? { x: p.x, y: p.y } : null;
    }).filter(Boolean);
  }

  const visited = new Set();
  const allFaces = [];
  derivedLinks.forEach(l => {
    [[l.a, l.b], [l.b, l.a]].forEach(([from, to]) => {
      if (visited.has(from + "->" + to)) return;
      const ring = [];
      let curFrom = from, curTo = to;
      let safety = 0, closed = false;
      while (safety++ < 2000) {
        visited.add(curFrom + "->" + curTo);
        ring.push(curFrom);
        const nxt = nextHalfEdge(curFrom, curTo);
        if (nxt == null) break;
        if (curTo === from && nxt === to) { closed = true; break; }
        curFrom = curTo;
        curTo = nxt;
      }
      if (closed && ring.length >= 3) allFaces.push({ ring });
    });
  });

  // Keep only bounded (CW in screen coords = negative signed area)
  const bounded = allFaces.filter(f => signedArea(ringToXY(f.ring)) < 0);

  // Dedupe by canonical ring key
  const seen = new Set();
  const faces = [];
  bounded.forEach(f => {
    const key = canonicalRingKey(f.ring);
    if (seen.has(key)) return;
    seen.add(key);
    faces.push({ ring: f.ring, key });
  });

  // Interior point per face
  faces.forEach(f => {
    f.interiorPoint = interiorPointOfRing(ringToXY(f.ring));
  });

  // Depth + isArea via ring-nesting
  faces.forEach(f => {
    const p = f.interiorPoint;
    if (!p) { f.depth = -1; f.isArea = false; return; }
    let depth = 0;
    for (const other of faces) {
      if (other === f) continue;
      if (pointInRing(p.x, p.y, ringToXY(other.ring))) depth++;
    }
    f.depth = depth;
    f.isArea = (depth % 2) === 0;
  });

  // Stable key (user point IDs along ring), disabled flag, filled flag
  faces.forEach(f => {
    const userIds = new Set();
    f.ring.forEach(pid => {
      const dp = dPointById(pid);
      if (dp && !dp.virtual && dp.userId != null) userIds.add(dp.userId);
    });
    f.stableKey = [...userIds].sort((a, b) => a - b).join(",") + ":" + f.ring.length;
    f.disabled = disabledFaceKeys.has(f.stableKey);
    f.filled = f.isArea && !f.disabled;
  });

  // Parent face (deepest containing face)
  faces.forEach((f, fi) => {
    if (!f.interiorPoint) { f.parentFaceIdx = -1; return; }
    let bestIdx = -1, bestDepth = -1;
    for (let j = 0; j < faces.length; j++) {
      if (j === fi) continue;
      if (!pointInRing(f.interiorPoint.x, f.interiorPoint.y, ringToXY(faces[j].ring))) continue;
      if (faces[j].depth > bestDepth) { bestDepth = faces[j].depth; bestIdx = j; }
    }
    f.parentFaceIdx = bestIdx;
  });

  // ---------- Step 3: deepest-face-wins walkability test ----------
  function pointInsideAnyFace(x, y) {
    let bestIdx = -1, bestDepth = -1;
    for (let i = 0; i < faces.length; i++) {
      const f = faces[i];
      if (!pointInRing(x, y, ringToXY(f.ring))) continue;
      if (f.depth > bestDepth) { bestDepth = f.depth; bestIdx = i; }
    }
    if (bestIdx === -1) return false;
    return faces[bestIdx].filled === true;
  }

  // ---------- Step 4: clusters (face groups by shared edges + hole containment) ----------
  function edgeKeyU(a, b) { return a < b ? a + "|" + b : b + "|" + a; }
  const edgeToFaces = new Map();
  faces.forEach((f, fi) => {
    const r = f.ring;
    for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[(i + 1) % r.length];
      const k = edgeKeyU(a, b);
      if (!edgeToFaces.has(k)) edgeToFaces.set(k, []);
      edgeToFaces.get(k).push(fi);
    }
  });

  const parent = faces.map((_, i) => i);
  function find(i) { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; }
  function union(i, j) { const ri = find(i), rj = find(j); if (ri !== rj) parent[ri] = rj; }
  edgeToFaces.forEach(list => {
    for (let i = 1; i < list.length; i++) union(list[0], list[i]);
  });
  faces.forEach((f, fi) => {
    if (f.isArea || !f.interiorPoint) return;
    const p = f.interiorPoint;
    for (let j = 0; j < faces.length; j++) {
      if (j === fi) continue;
      const af = faces[j];
      if (!af.isArea) continue;
      if (pointInRing(p.x, p.y, ringToXY(af.ring))) { union(fi, j); break; }
    }
  });

  const clusterMap = new Map();
  faces.forEach((_, i) => {
    const r = find(i);
    if (!clusterMap.has(r)) clusterMap.set(r, []);
    clusterMap.get(r).push(i);
  });

  const clusters = [];
  clusterMap.forEach((faceIdxs, root) => {
    const rings = [];
    const clusterFaces = [];
    faceIdxs.forEach(fi => {
      const face = faces[fi];
      const parentFilled = face.parentFaceIdx === -1
        ? false
        : faces[face.parentFaceIdx].filled;
      if (face.filled !== parentFilled) rings.push(face.ring);
      clusterFaces.push({
        faceIdx: fi,
        stableKey: face.stableKey,
        interiorPoint: face.interiorPoint,
        isArea: face.isArea,
        disabled: face.disabled,
        ring: face.ring,
      });
    });
    clusters.push({
      rings,
      faces: clusterFaces,
      key: "c" + root + ":" + clusterFaces.map(cf => cf.stableKey).sort().join("__"),
    });
  });

  // ---------- Step 5: interior edges (both sides walkable at midpoint) ----------
  const interiorEdges = new Set();
  const PROBE = 0.5;
  derivedLinks.forEach(l => {
    const pa = dPointById(l.a), pb = dPointById(l.b);
    if (!pa || !pb) return;
    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2;
    const dx = pb.x - pa.x, dy = pb.y - pa.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    if (pointInsideAnyFace(mx + nx * PROBE, my + ny * PROBE) &&
        pointInsideAnyFace(mx - nx * PROBE, my - ny * PROBE)) {
      interiorEdges.add(edgeKeyU(l.a, l.b));
    }
  });

  return {
    derivedPoints,
    derivedLinks,
    dPointById,
    faces,
    clusters,
    interiorEdges,
    pointInsideAnyFace,
    edgeKeyU,
    ringToXY,
  };
}
)}

function _pathfinding(geometry)
{
  const { projectToSegment, pointInRing } = geometry;

  const euclideanDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const CORE_GRAPH = Symbol.for("pathfinding.coreGraph");
  const SPATIAL_INDEX = Symbol.for("pathfinding.spatialIndex");
  const WAYPOINT_CACHE = Symbol.for("pathfinding.waypointCache");

  // Tolerance for "snap landed at a mesh vertex". Matches the classifier's
  // VERTEX_SNAP_TOL — when changed, consider updating downstream code too.
  const VERTEX_SNAP_TOL = 0.5;
  const VERTEX_SNAP_TOL2 = VERTEX_SNAP_TOL * VERTEX_SNAP_TOL;

  // Same quantization the classifier and decision graph use, so synthetic
  // ids generated here align with downstream key schemes when needed.
  const POS_QUANTUM = 10;
  function posKey(x, y) {
    return Math.round(x * POS_QUANTUM) + "," + Math.round(y * POS_QUANTUM);
  }

  // ---- Spatial grid index ----
  // Built per mesh, attached via SPATIAL_INDEX symbol. Grid cells are
  // square in mesh (Mercator-pixel) space.
  function buildSpatialIndex(mesh) {
    const links = mesh.derivedLinks;
    const faces = mesh.faces;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of mesh.derivedPoints) {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    }
    if (!isFinite(minX)) {
      return { empty: true };
    }
    const pad = Math.max((maxX - minX), (maxY - minY)) * 0.01 + 1;
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;

    const targetCells = Math.max(4, Math.min(64, Math.round(Math.sqrt(links.length))));
    const cellSize = Math.max(
      (maxX - minX) / targetCells,
      (maxY - minY) / targetCells,
      1e-6
    );
    const nx = Math.max(1, Math.ceil((maxX - minX) / cellSize));
    const ny = Math.max(1, Math.ceil((maxY - minY) / cellSize));

    function cellXY(x, y) {
      const ix = Math.max(0, Math.min(nx - 1, Math.floor((x - minX) / cellSize)));
      const iy = Math.max(0, Math.min(ny - 1, Math.floor((y - minY) / cellSize)));
      return [ix, iy];
    }

    const linkCells = new Array(nx * ny);
    const faceCells = new Array(nx * ny);
    for (let i = 0; i < nx * ny; i++) {
      linkCells[i] = null;
      faceCells[i] = null;
    }

    for (let li = 0; li < links.length; li++) {
      const l = links[li];
      const a = mesh.dPointById(l.a), b = mesh.dPointById(l.b);
      if (!a || !b) continue;
      const [ax, ay] = cellXY(a.x, a.y);
      const [bx, by] = cellXY(b.x, b.y);
      const lo_x = Math.min(ax, bx), hi_x = Math.max(ax, bx);
      const lo_y = Math.min(ay, by), hi_y = Math.max(ay, by);
      for (let cy = lo_y; cy <= hi_y; cy++) {
        for (let cx = lo_x; cx <= hi_x; cx++) {
          const k = cy * nx + cx;
          if (!linkCells[k]) linkCells[k] = [];
          linkCells[k].push(li);
        }
      }
    }

    for (let fi = 0; fi < faces.length; fi++) {
      const f = faces[fi];
      let fxmin = Infinity, fymin = Infinity, fxmax = -Infinity, fymax = -Infinity;
      for (const pid of f.ring) {
        const dp = mesh.dPointById(pid);
        if (!dp) continue;
        if (dp.x < fxmin) fxmin = dp.x; if (dp.x > fxmax) fxmax = dp.x;
        if (dp.y < fymin) fymin = dp.y; if (dp.y > fymax) fymax = dp.y;
      }
      if (!isFinite(fxmin)) continue;
      const [lx, ly] = cellXY(fxmin, fymin);
      const [hx, hy] = cellXY(fxmax, fymax);
      for (let cy = ly; cy <= hy; cy++) {
        for (let cx = lx; cx <= hx; cx++) {
          const k = cy * nx + cx;
          if (!faceCells[k]) faceCells[k] = [];
          faceCells[k].push(fi);
        }
      }
    }

    const linkEndpoints = new Array(links.length);
    for (let li = 0; li < links.length; li++) {
      const l = links[li];
      const a = mesh.dPointById(l.a), b = mesh.dPointById(l.b);
      if (!a || !b) { linkEndpoints[li] = null; continue; }
      linkEndpoints[li] = { ax: a.x, ay: a.y, bx: b.x, by: b.y };
    }

    const faceRings = new Array(faces.length);
    for (let fi = 0; fi < faces.length; fi++) {
      faceRings[fi] = mesh.ringToXY(faces[fi].ring);
    }

    return {
      empty: false,
      nx, ny, minX, minY, cellSize,
      linkCells, faceCells,
      linkEndpoints, faceRings,
      cellXY,
    };
  }

  function getSpatialIndex(mesh) {
    if (mesh[SPATIAL_INDEX]) return mesh[SPATIAL_INDEX];
    const idx = buildSpatialIndex(mesh);
    mesh[SPATIAL_INDEX] = idx;
    return idx;
  }

  function linksNearSegment(idx, p1, p2, out) {
    out.clear();
    if (idx.empty) return null;
    const { nx, ny, minX, minY, cellSize, linkCells } = idx;
    const ax = Math.max(0, Math.min(nx - 1, Math.floor((p1.x - minX) / cellSize)));
    const ay = Math.max(0, Math.min(ny - 1, Math.floor((p1.y - minY) / cellSize)));
    const bx = Math.max(0, Math.min(nx - 1, Math.floor((p2.x - minX) / cellSize)));
    const by = Math.max(0, Math.min(ny - 1, Math.floor((p2.y - minY) / cellSize)));
    const lo_x = Math.min(ax, bx), hi_x = Math.max(ax, bx);
    const lo_y = Math.min(ay, by), hi_y = Math.max(ay, by);
    for (let cy = lo_y; cy <= hi_y; cy++) {
      for (let cx = lo_x; cx <= hi_x; cx++) {
        const bucket = linkCells[cy * nx + cx];
        if (!bucket) continue;
        for (let k = 0; k < bucket.length; k++) out.add(bucket[k]);
      }
    }
    return out;
  }

  const _linkScratch = new Set();

  function pointInWalkableArea(x, y, mesh, idx) {
    if (idx.empty) return mesh.pointInsideAnyFace(x, y);
    const { nx, ny, minX, minY, cellSize, faceCells, faceRings } = idx;
    const ix = Math.max(0, Math.min(nx - 1, Math.floor((x - minX) / cellSize)));
    const iy = Math.max(0, Math.min(ny - 1, Math.floor((y - minY) / cellSize)));
    const bucket = faceCells[iy * nx + ix];
    if (!bucket) return false;
    let bestDepth = -1, bestFilled = false;
    for (let k = 0; k < bucket.length; k++) {
      const fi = bucket[k];
      const f = mesh.faces[fi];
      if (!pointInRing(x, y, faceRings[fi])) continue;
      if (f.depth > bestDepth) {
        bestDepth = f.depth;
        bestFilled = f.filled === true;
      }
    }
    return bestFilled;
  }

  // Find the nearest derived mesh vertex to (x, y), within VERTEX_SNAP_TOL.
  function nearestDerivedVertexId(x, y, mesh) {
    let bestId = null, bestD2 = VERTEX_SNAP_TOL2;
    for (const dp of mesh.derivedPoints) {
      const dx = dp.x - x, dy = dp.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 <= bestD2) { bestD2 = d2; bestId = dp.id; }
    }
    return bestId;
  }

  // ---- Snap (unchanged behavior) ----
  function snapToNavmesh(x, y, mesh) {
    const idx = getSpatialIndex(mesh);
    if (pointInWalkableArea(x, y, mesh, idx)) {
      return { x, y, vertexId: nearestDerivedVertexId(x, y, mesh), onLinkId: null };
    }
    let best = null, bestD2 = Infinity, bestVertexId = null, bestLinkId = null;
    for (const p of mesh.derivedPoints) {
      const dx = p.x - x, dy = p.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = { x: p.x, y: p.y };
        bestVertexId = p.id;
        bestLinkId = null;
      }
    }
    for (const l of mesh.derivedLinks) {
      const a = mesh.dPointById(l.a), b = mesh.dPointById(l.b);
      if (!a || !b) continue;
      const r = projectToSegment(x, y, a, b);
      if (r.len2 === 0) continue;
      if (r.d2 < bestD2) {
        bestD2 = r.d2;
        best = { x: r.fx, y: r.fy };
        const da = (r.fx - a.x) * (r.fx - a.x) + (r.fy - a.y) * (r.fy - a.y);
        const db = (r.fx - b.x) * (r.fx - b.x) + (r.fy - b.y) * (r.fy - b.y);
        if (da <= VERTEX_SNAP_TOL2) {
          bestVertexId = l.a;
          bestLinkId = null;
        } else if (db <= VERTEX_SNAP_TOL2) {
          bestVertexId = l.b;
          bestLinkId = null;
        } else {
          bestVertexId = null;
          bestLinkId = l.id;
        }
      }
    }
    if (!best) return { x, y, vertexId: null, onLinkId: null };
    return { x: best.x, y: best.y, vertexId: bestVertexId, onLinkId: bestLinkId };
  }

  function pointOnAnyLinkIndexed(x, y, mesh, idx, tol = 0.5) {
    if (idx.empty) {
      const t2 = tol * tol;
      for (const l of mesh.derivedLinks) {
        const a = mesh.dPointById(l.a), b = mesh.dPointById(l.b);
        if (!a || !b) continue;
        const r = projectToSegment(x, y, a, b);
        if (r.len2 === 0) continue;
        if (r.d2 <= t2) return true;
      }
      return false;
    }
    const { nx, ny, minX, minY, cellSize, linkCells, linkEndpoints } = idx;
    const ix = Math.max(0, Math.min(nx - 1, Math.floor((x - minX) / cellSize)));
    const iy = Math.max(0, Math.min(ny - 1, Math.floor((y - minY) / cellSize)));
    const bucket = linkCells[iy * nx + ix];
    if (!bucket) return false;
    const t2 = tol * tol;
    for (let k = 0; k < bucket.length; k++) {
      const le = linkEndpoints[bucket[k]];
      if (!le) continue;
      const r = projectToSegment(x, y, { x: le.ax, y: le.ay }, { x: le.bx, y: le.by });
      if (r.len2 === 0) continue;
      if (r.d2 <= t2) return true;
    }
    return false;
  }

  function isWalkable(p1, p2, mesh) {
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    if (Math.hypot(dx, dy) < 1e-9) return true;
    const idx = getSpatialIndex(mesh);
    linksNearSegment(idx, p1, p2, _linkScratch);

    const ts = [0, 1];
    const EPS = 1e-9;
    if (idx.empty) {
      for (const l of mesh.derivedLinks) {
        const a = mesh.dPointById(l.a), b = mesh.dPointById(l.b);
        if (!a || !b) continue;
        const denom = (p1.x - p2.x) * (a.y - b.y) - (p1.y - p2.y) * (a.x - b.x);
        if (Math.abs(denom) < 1e-12) continue;
        const t = ((p1.x - a.x) * (a.y - b.y) - (p1.y - a.y) * (a.x - b.x)) / denom;
        const u = -((p1.x - p2.x) * (p1.y - a.y) - (p1.y - p2.y) * (p1.x - a.x)) / denom;
        if (t > -EPS && t < 1 + EPS && u > -EPS && u < 1 + EPS) {
          ts.push(Math.max(0, Math.min(1, t)));
        }
      }
    } else {
      const { linkEndpoints } = idx;
      for (const li of _linkScratch) {
        const le = linkEndpoints[li];
        if (!le) continue;
        const denom = (p1.x - p2.x) * (le.ay - le.by) - (p1.y - p2.y) * (le.ax - le.bx);
        if (Math.abs(denom) < 1e-12) continue;
        const t = ((p1.x - le.ax) * (le.ay - le.by) - (p1.y - le.ay) * (le.ax - le.bx)) / denom;
        const u = -((p1.x - p2.x) * (p1.y - le.ay) - (p1.y - p2.y) * (p1.x - le.ax)) / denom;
        if (t > -EPS && t < 1 + EPS && u > -EPS && u < 1 + EPS) {
          ts.push(Math.max(0, Math.min(1, t)));
        }
      }
    }
    ts.sort((a, b) => a - b);

    for (let i = 0; i < ts.length - 1; i++) {
      if (ts[i + 1] - ts[i] < 1e-6) continue;
      const tm = (ts[i] + ts[i + 1]) / 2;
      const mx = p1.x + tm * dx;
      const my = p1.y + tm * dy;
      if (pointInWalkableArea(mx, my, mesh, idx)) continue;
      if (pointOnAnyLinkIndexed(mx, my, mesh, idx)) continue;
      return false;
    }
    return true;
  }

  // Build the symmetric weighted adjacency (`to` is a CORE index, not
  // node-space) from a walkable-pairs table. Factored out so we can
  // also AUGMENT a stale cached graph that predates this field —
  // Symbol.for(...) is a global registry, so a mesh decorated by an
  // older version of this cell can hand back a cached graph without
  // adjBase.
  function buildAdjBase(corePts, walkable) {
    const m = corePts.length;
    const adjBase = Array.from({ length: m }, () => []);
    for (let i = 0; i < m; i++) {
      const row = walkable[i];
      for (let k = 0; k < row.length; k++) {
        const j = row[k];
        const w = euclideanDistance(corePts[i], corePts[j]);
        adjBase[i].push({ to: j, w });
        adjBase[j].push({ to: i, w });
      }
    }
    return adjBase;
  }

  function getCoreGraph(mesh) {
    const cached = mesh[CORE_GRAPH];
    if (cached) {
      // Stale cache from a previous cell version: has corePts/walkable
      // but no adjBase. Augment in place rather than rebuilding the
      // (expensive) visibility table.
      if (!cached.adjBase && cached.corePts && cached.walkable) {
        cached.adjBase = buildAdjBase(cached.corePts, cached.walkable);
      }
      if (cached.adjBase) return cached;
      // Unrecognized shape — fall through and rebuild from scratch.
    }
    getSpatialIndex(mesh);
    // Keep derived-point ids on corePts so reconstructed paths can carry them.
    const corePts = mesh.derivedPoints.map(p => ({ x: p.x, y: p.y, id: p.id }));
    const m = corePts.length;
    const walkable = new Array(m);
    for (let i = 0; i < m; i++) {
      const row = [];
      for (let j = i + 1; j < m; j++) {
        if (isWalkable(corePts[i], corePts[j], mesh)) row.push(j);
      }
      walkable[i] = row;
    }
    const adjBase = buildAdjBase(corePts, walkable);
    const graph = { corePts, walkable, adjBase };
    mesh[CORE_GRAPH] = graph;
    return graph;
  }

  // ---- Binary min-heap of [dist, nodeIdx] with lazy deletion ----
  function heapPush(h, d, v) {
    h.push([d, v]);
    let i = h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (h[p][0] <= h[i][0]) break;
      const t = h[p]; h[p] = h[i]; h[i] = t;
      i = p;
    }
  }
  function heapPop(h) {
    const top = h[0];
    const last = h.pop();
    if (h.length) {
      h[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let s = i;
        if (l < h.length && h[l][0] < h[s][0]) s = l;
        if (r < h.length && h[r][0] < h[s][0]) s = r;
        if (s === i) break;
        const t = h[s]; h[s] = h[i]; h[i] = t;
        i = s;
      }
    }
    return top;
  }

  // shortestPathOnMesh takes p1/p2 with optional ids (caller can supply
  // synthesized ids for the snap landings). Returns an array of
  // { x, y, id, onLinkId } waypoints, in order from p1 to p2.
  //
  // Node index space: 0 = p1, 1 = p2, i+2 = corePts[i].
  function shortestPathOnMesh(p1, p2, mesh, distance = euclideanDistance) {
    const graph = getCoreGraph(mesh);
    const { corePts, adjBase } = graph;
    const m = corePts.length;
    const n = m + 2;
    const custom = distance !== euclideanDistance;

    // Endpoint connections. These per-call visibility tests (2m
    // isWalkable calls) are the remaining per-route cost — the core
    // graph itself is cached.
    const startEdges = [];                        // from node 0
    const endW = new Float64Array(m).fill(-1);    // core i -> weight to node 1
    for (let i = 0; i < m; i++) {
      if (isWalkable(p1, corePts[i], mesh)) {
        startEdges.push({ to: i + 2, w: distance(p1, corePts[i]) });
      }
      if (isWalkable(p2, corePts[i], mesh)) {
        endW[i] = distance(p2, corePts[i]);
      }
    }
    const directW = isWalkable(p1, p2, mesh) ? distance(p1, p2) : null;

    const dist = new Float64Array(n).fill(Infinity);
    const prev = new Int32Array(n).fill(-1);
    const seen = new Uint8Array(n);
    const heap = [];
    dist[0] = 0;
    heapPush(heap, 0, 0);

    while (heap.length) {
      const [d, u] = heapPop(heap);
      if (seen[u]) continue;
      seen[u] = 1;
      if (u === 1) break; // early exit at target

      if (u === 0) {
        for (const e of startEdges) {
          if (seen[e.to]) continue;
          const nd = d + e.w;
          if (nd < dist[e.to]) { dist[e.to] = nd; prev[e.to] = 0; heapPush(heap, nd, e.to); }
        }
        if (directW != null && !seen[1] && d + directW < dist[1]) {
          dist[1] = d + directW; prev[1] = 0; heapPush(heap, dist[1], 1);
        }
      } else {
        const i = u - 2;
        const nbrs = adjBase[i];
        for (let k = 0; k < nbrs.length; k++) {
          const nb = nbrs[k];
          const to = nb.to + 2;
          if (seen[to]) continue;
          const w = custom ? distance(corePts[i], corePts[nb.to]) : nb.w;
          const nd = d + w;
          if (nd < dist[to]) { dist[to] = nd; prev[to] = u; heapPush(heap, nd, to); }
        }
        if (endW[i] >= 0 && !seen[1]) {
          const nd = d + endW[i];
          if (nd < dist[1]) { dist[1] = nd; prev[1] = u; heapPush(heap, nd, 1); }
        }
      }
    }

    if (dist[1] === Infinity) {
      return [
        { x: p1.x, y: p1.y, id: p1.id, onLinkId: p1.onLinkId || null },
        { x: p2.x, y: p2.y, id: p2.id, onLinkId: p2.onLinkId || null },
      ];
    }
    // Reconstruct path with ids attached. p1/p2 may have onLinkId set
    // (mid-link snap landings); mesh vertices are never "on a link".
    const path = [];
    for (let cur = 1; cur !== -1; cur = prev[cur]) {
      if (cur === 0)      path.push({ x: p1.x, y: p1.y, id: p1.id, onLinkId: p1.onLinkId || null });
      else if (cur === 1) path.push({ x: p2.x, y: p2.y, id: p2.id, onLinkId: p2.onLinkId || null });
      else {
        const cp = corePts[cur - 2];
        path.push({ x: cp.x, y: cp.y, id: cp.id, onLinkId: null });
      }
    }
    path.reverse();
    return path;
  }

  // routeWaypoints returns the full polyline as [{x, y, id, onLinkId}, ...].
  // Semantics unchanged. NEW: memoized per mesh (default distance only).
  // The returned array is shared between callers — treat it as immutable.
  function routeWaypoints(start, end, mesh, distance = euclideanDistance) {
    let cache = null, cacheKey = null;
    if (distance === euclideanDistance) {
      cache = mesh[WAYPOINT_CACHE];
      if (!cache) { cache = new Map(); mesh[WAYPOINT_CACHE] = cache; }
      cacheKey = start.x + "," + start.y + "|" + end.x + "," + end.y;
      const hit = cache.get(cacheKey);
      if (hit) return hit;
    }

    const s = snapToNavmesh(start.x, start.y, mesh);
    const e = snapToNavmesh(end.x, end.y, mesh);
    const sId = s.vertexId != null ? s.vertexId : ("snap:" + posKey(s.x, s.y));
    const eId = e.vertexId != null ? e.vertexId : ("snap:" + posKey(e.x, e.y));
    const sOnLink = s.vertexId != null ? null : s.onLinkId;
    const eOnLink = e.vertexId != null ? null : e.onLinkId;
    const middle = shortestPathOnMesh(
      { x: s.x, y: s.y, id: sId, onLinkId: sOnLink },
      { x: e.x, y: e.y, id: eId, onLinkId: eOnLink },
      mesh, distance
    );
    const startWp = {
      x: start.x, y: start.y,
      id: "endpoint:" + posKey(start.x, start.y),
      onLinkId: null,
    };
    const endWp = {
      x: end.x, y: end.y,
      id: "endpoint:" + posKey(end.x, end.y),
      onLinkId: null,
    };
    const pts = [startWp, ...middle, endWp];
    const cleaned = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const prev = cleaned[cleaned.length - 1];
      if (Math.hypot(pts[i].x - prev.x, pts[i].y - prev.y) > 0.01) cleaned.push(pts[i]);
    }
    if (cache) cache.set(cacheKey, cleaned);
    return cleaned;
  }

  return { snapToNavmesh, isWalkable, shortestPathOnMesh, routeWaypoints };
}


function _buildDecisionGraph(){return(
function buildDecisionGraph(mesh, userLinks, routes, pathfinding, geometry) {
  const POINT_ON_LINK_TOL = 0.75;
  const POINT_ON_SEG_TOL = 0.75;
  const T_EPS = 1e-3;

  function linkContainsPoint(link, x, y) {
    const a = mesh.dPointById(link.a), b = mesh.dPointById(link.b);
    if (!a || !b) return false;
    const r = geometry.projectToSegment(x, y, a, b);
    if (r.len2 === 0) return false;
    return r.d2 <= POINT_ON_LINK_TOL * POINT_ON_LINK_TOL;
  }

  // Per-userLink endpoint cache (for t-parameterization along the
  // authored link).
  const endpointsCache = new Map();
  function endpointsFor(linkKey) {
    if (endpointsCache.has(linkKey)) return endpointsCache.get(linkKey);
    const sid = Number(linkKey.slice(3)); // strip "lk:"
    const ul = userLinks.find(l => l.id === sid);
    let ep = null;
    if (ul) {
      const a = mesh.derivedPoints.find(p => !p.virtual && p.userId === ul.a);
      const b = mesh.derivedPoints.find(p => !p.virtual && p.userId === ul.b);
      if (a && b) ep = { a, b };
    }
    endpointsCache.set(linkKey, ep);
    return ep;
  }
  function tOnUserLink(x, y, endpoints) {
    return geometry.projectToSegment(x, y, endpoints.a, endpoints.b).t;
  }

  function segmentBundleKey(p1, p2, segUid) {
    for (const l of mesh.derivedLinks) {
      if (linkContainsPoint(l, p1.x, p1.y) && linkContainsPoint(l, p2.x, p2.y)) {
        return "lk:" + (l.sourceLinkId != null ? l.sourceLinkId : l.id);
      }
    }
    return "off:" + segUid;
  }

  // Per route, capture waypoints + per-segment link key + per-segment
  // parameterization range against the user link.
  const perRoute = routes.map((route, ri) => {
    const pts = pathfinding.routeWaypoints(route.start, route.end, mesh);
    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const key = segmentBundleKey(pts[i], pts[i + 1], ri + ":" + i);
      let tA = 0, tB = 0, linkId = null;
      if (key.startsWith("lk:")) {
        const ep = endpointsFor(key);
        if (ep) {
          linkId = key;
          tA = tOnUserLink(pts[i].x, pts[i].y, ep);
          tB = tOnUserLink(pts[i + 1].x, pts[i + 1].y, ep);
          if (tA > tB) { const t = tA; tA = tB; tB = t; }
        }
      }
      segs.push({ key, linkId, tA, tB });
    }
    return { pts, segs };
  });

  function routeCoversPointOnLink(routeIdx, linkKey, t) {
    const r = perRoute[routeIdx];
    for (const s of r.segs) {
      if (s.linkId !== linkKey) continue;
      if (t >= s.tA - T_EPS && t <= s.tB + T_EPS) return true;
    }
    return false;
  }

  // ---- Pass 1: collect markers by unified incident-edge rule ----
  const markers = [];
  const seenXY = new Set();
  const posId = (p) => Math.round(p.x * 10) + "," + Math.round(p.y * 10);

  // Track which (route, waypointIdx) pairs touch each waypoint id.
  // Using waypoint.id directly avoids proximity matching.
  const touchesAt = new Map(); // wpId -> [{ ri, i }]
  perRoute.forEach((r, ri) => {
    const seenForRoute = new Set();
    for (let i = 0; i < r.pts.length; i++) {
      const wp = r.pts[i];
      if (!wp.id) continue;
      // Only treat mesh-vertex waypoints as "shared" nodes — snaps and
      // endpoints are route-specific even if at the same position.
      if (!(wp.id[0] === "u" || wp.id[0] === "v")) continue;
      if (seenForRoute.has(wp.id)) continue;
      seenForRoute.add(wp.id);
      if (!touchesAt.has(wp.id)) touchesAt.set(wp.id, []);
      touchesAt.get(wp.id).push({ ri, i });
    }
  });

  function routesOnLinkAt(linkId, x, y) {
    const ep = endpointsFor(linkId);
    if (!ep) return [];
    const tp = tOnUserLink(x, y, ep);
    const ids = [];
    for (let rj = 0; rj < perRoute.length; rj++) {
      if (routeCoversPointOnLink(rj, linkId, tp)) ids.push(rj);
    }
    return ids;
  }
  function setKey(ids) { return ids.slice().sort((a, b) => a - b).join(","); }

  function incidentEdgeSetsAtVertex(wpId, x, y) {
    const touches = touchesAt.get(wpId) || [];
    const linkIds = new Set();
    const offMeshEdges = new Map(); // farPosId -> Set of routeIdx
    touches.forEach(({ ri, i }) => {
      const r = perRoute[ri];
      const inSeg = i > 0 ? r.segs[i - 1] : null;
      const outSeg = i < r.pts.length - 1 ? r.segs[i] : null;
      if (inSeg) {
        if (inSeg.linkId) linkIds.add(inSeg.linkId);
        else {
          const farKey = posId(r.pts[i - 1]);
          if (!offMeshEdges.has(farKey)) offMeshEdges.set(farKey, new Set());
          offMeshEdges.get(farKey).add(ri);
        }
      }
      if (outSeg) {
        if (outSeg.linkId) linkIds.add(outSeg.linkId);
        else {
          const farKey = posId(r.pts[i + 1]);
          if (!offMeshEdges.has(farKey)) offMeshEdges.set(farKey, new Set());
          offMeshEdges.get(farKey).add(ri);
        }
      }
    });
    const sets = [];
    linkIds.forEach(lid => sets.push(setKey(routesOnLinkAt(lid, x, y))));
    offMeshEdges.forEach(routeSet => sets.push(setKey([...routeSet])));
    return sets;
  }
  function incidentEdgeSetsAtMidLink(p, inSeg, outSeg, routeIdx) {
    const sets = [];
    if (inSeg) {
      if (inSeg.linkId) sets.push(setKey(routesOnLinkAt(inSeg.linkId, p.x, p.y)));
      else sets.push(String(routeIdx));
    }
    if (outSeg) {
      if (outSeg.linkId) sets.push(setKey(routesOnLinkAt(outSeg.linkId, p.x, p.y)));
      else sets.push(String(routeIdx));
    }
    return sets;
  }
  function isDecisionPoint(sets) {
    if (sets.length === 2 && sets[0] === sets[1]) return false;
    return true;
  }

  perRoute.forEach((r, ri) => {
    if (r.pts.length < 2) return;
    for (let i = 1; i < r.pts.length - 1; i++) {
      const p = r.pts[i];
      const isMeshVertex = p.id && (p.id[0] === "u" || p.id[0] === "v");
      const sets = isMeshVertex
        ? incidentEdgeSetsAtVertex(p.id, p.x, p.y)
        : incidentEdgeSetsAtMidLink(p, r.segs[i - 1], r.segs[i], ri);
      if (!isDecisionPoint(sets)) continue;
      const xyKey = posId(p);
      if (seenXY.has(xyKey)) continue;
      seenXY.add(xyKey);
      // Markers carry both the position-based key (for backward
      // compatibility with downstream code that aggregates by position)
      // and the waypoint id (preferred identity).
      markers.push({ key: xyKey, id: p.id, x: p.x, y: p.y });
    }
  });

  // ---- Pass 2: per-route ordered marker visits ----
  function pointOnSegment(mx, my, p1, p2) {
    const r = geometry.projectToSegment(mx, my, p1, p2);
    return r.len2 > 0 && r.d2 <= POINT_ON_SEG_TOL * POINT_ON_SEG_TOL ? r.t : -1;
  }
  const routeVisits = perRoute.map(({ pts }) => {
    if (pts.length < 2) return [];
    const hits = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i], p2 = pts[i + 1];
      const onThisSeg = [];
      for (const m of markers) {
        const t = pointOnSegment(m.x, m.y, p1, p2);
        if (t === -1) continue;
        if (t < -0.001 || t > 1.001) continue;
        onThisSeg.push({ t, m });
      }
      onThisSeg.sort((a, b) => a.t - b.t);
      for (const { m } of onThisSeg) {
        if (hits.length && hits[hits.length - 1].key === m.key) continue;
        hits.push({ key: m.key, id: m.id, x: m.x, y: m.y });
      }
    }
    return hits;
  });

  // ---- Pass 3: aggregate undirected edges ----
  function parseColor(c) {
    if (typeof c !== "string") return null;
    if (c.startsWith("#")) {
      const h = c.slice(1);
      if (h.length === 3) {
        return { r: parseInt(h[0] + h[0], 16), g: parseInt(h[1] + h[1], 16), b: parseInt(h[2] + h[2], 16) };
      }
      if (h.length === 6) {
        return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
      }
    }
    return null;
  }
  function blendColors(colors) {
    const parsed = colors.map(parseColor).filter(Boolean);
    if (parsed.length === 0) return "#000";
    let r = 0, g = 0, b = 0;
    parsed.forEach(c => { r += c.r; g += c.g; b += c.b; });
    r = Math.round(r / parsed.length);
    g = Math.round(g / parsed.length);
    b = Math.round(b / parsed.length);
    const hex = n => n.toString(16).padStart(2, "0");
    return "#" + hex(r) + hex(g) + hex(b);
  }
  const routeColors = routes.map(r => r.color);
  const edgeMap = new Map();
  routeVisits.forEach((visits, ri) => {
    for (let i = 0; i < visits.length - 1; i++) {
      const a = visits[i], b = visits[i + 1];
      const [k1, p1, k2, p2] = a.key < b.key
        ? [a.key, a, b.key, b]
        : [b.key, b, a.key, a];
      const key = k1 + "||" + k2;
      let e = edgeMap.get(key);
      if (!e) {
        e = {
          key, endpointKeys: [k1, k2],
          x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
          routeIndices: [],
        };
        edgeMap.set(key, e);
      }
      e.routeIndices.push(ri);
    }
  });
  const edges = [...edgeMap.values()].map(e => ({
    key: e.key,
    endpointKeys: e.endpointKeys,
    x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2,
    routeIndices: e.routeIndices,
    routeCount: e.routeIndices.length,
    blendedColor: blendColors(e.routeIndices.map(i => routeColors[i])),
  }));

  // ---- Pass 4: per-route endpoint connectors ----
  const endpointConnectors = [];
  routes.forEach((route, ri) => {
    const visits = routeVisits[ri];
    if (!visits || visits.length === 0) {
      endpointConnectors.push({
        routeId: route.id, kind: "direct",
        x1: route.start.x, y1: route.start.y,
        x2: route.end.x,   y2: route.end.y,
        color: route.color,
      });
      return;
    }
    const first = visits[0];
    const last = visits[visits.length - 1];
    endpointConnectors.push({
      routeId: route.id, kind: "start",
      x1: route.start.x, y1: route.start.y,
      x2: first.x,       y2: first.y,
      color: route.color,
    });
    endpointConnectors.push({
      routeId: route.id, kind: "end",
      x1: last.x,        y1: last.y,
      x2: route.end.x,   y2: route.end.y,
      color: route.color,
    });
  });

  return { markers, routeVisits, routeColors, edges, endpointConnectors };
}
)}

function _buildJunctionClassification(){return(
function buildJunctionClassification(
  mesh, routes, decisionGraph, pathfinding, geometry
) {
  // ---- Mesh-side lookups ----
  const linkByEndpointPair = new Map();
  function endpointPairKey(a, b) { return a < b ? a + "|" + b : b + "|" + a; }
  for (const l of mesh.derivedLinks) {
    linkByEndpointPair.set(endpointPairKey(l.a, l.b), l);
  }
  function findDerivedLinkBetween(idA, idB) {
    return linkByEndpointPair.get(endpointPairKey(idA, idB)) || null;
  }

  // Set of derived-link ids that are interior edges of an area face
  // (coastlines). Anything else is a "river" link.
  const areaEdgeLinkIds = new Set();
  for (const f of mesh.faces) {
    if (!f.isArea) continue;
    const ring = f.ring;
    for (let i = 0; i < ring.length; i++) {
      const l = findDerivedLinkBetween(ring[i], ring[(i + 1) % ring.length]);
      if (l) areaEdgeLinkIds.add(l.id);
    }
  }

  // Derived links indexed by id (for snap onLinkId lookups).
  const linkById = new Map();
  for (const l of mesh.derivedLinks) linkById.set(l.id, l);

  function isMeshVertexId(id) {
    return typeof id === "string" && (id[0] === "u" || id[0] === "v");
  }
  function isSnapId(id) {
    return typeof id === "string" && id.startsWith("snap:");
  }
  function isEndpointId(id) {
    return typeof id === "string" && id.startsWith("endpoint:");
  }

  // Classify the spoke between two consecutive waypoints A and B.
  //   - Both mesh vertices connected by a derived link: link/edge.
  //   - Snap + mesh vertex where the vertex is an endpoint of the
  //     snap's onLinkId: link/edge along that link.
  //   - Two snaps on the same onLinkId: link/edge along that link.
  //   - Endpoint (raw route start/end) + snap-on-linkL: link/edge
  //     along L (the route entered the network via that link).
  //   - Endpoint + mesh vertex: classified as link, or "edge" when the
  //     vertex's incident links include an area-edge (the route
  //     effectively entered along a coastline).
  //   - Two endpoints: "area" (degenerate direct connector).
  //   - Otherwise: "area".
  function classifySpoke(A, B) {
    let linkId = null;
    if (isMeshVertexId(A.id) && isMeshVertexId(B.id)) {
      const l = findDerivedLinkBetween(A.id, B.id);
      if (l) linkId = l.id;
    } else if (isSnapId(A.id) && isMeshVertexId(B.id)) {
      if (A.onLinkId != null) {
        const l = linkById.get(A.onLinkId);
        if (l && (l.a === B.id || l.b === B.id)) linkId = l.id;
      }
    } else if (isMeshVertexId(A.id) && isSnapId(B.id)) {
      if (B.onLinkId != null) {
        const l = linkById.get(B.onLinkId);
        if (l && (l.a === A.id || l.b === A.id)) linkId = l.id;
      }
    } else if (isSnapId(A.id) && isSnapId(B.id)) {
      if (A.onLinkId != null && A.onLinkId === B.onLinkId) {
        linkId = A.onLinkId;
      }
    } else if (isEndpointId(A.id) && (isSnapId(B.id) || isMeshVertexId(B.id))) {
      if (isSnapId(B.id) && B.onLinkId != null) {
        linkId = B.onLinkId;
      } else if (isMeshVertexId(B.id)) {
        const anyAreaEdge = mesh.derivedLinks.some(
          ll => (ll.a === B.id || ll.b === B.id) && areaEdgeLinkIds.has(ll.id)
        );
        return anyAreaEdge ? "edge" : "link";
      }
    } else if ((isSnapId(A.id) || isMeshVertexId(A.id)) && isEndpointId(B.id)) {
      if (isSnapId(A.id) && A.onLinkId != null) {
        linkId = A.onLinkId;
      } else if (isMeshVertexId(A.id)) {
        const anyAreaEdge = mesh.derivedLinks.some(
          ll => (ll.a === A.id || ll.b === A.id) && areaEdgeLinkIds.has(ll.id)
        );
        return anyAreaEdge ? "edge" : "link";
      }
    } else if (isEndpointId(A.id) && isEndpointId(B.id)) {
      return "area";
    }
    if (linkId != null) {
      return areaEdgeLinkIds.has(linkId) ? "edge" : "link";
    }
    return "area";
  }

  // ---- Junction set construction (by id) ----
  const junctionByKey = new Map();
  function ensureJunction(id, x, y, presetType) {
    let j = junctionByKey.get(id);
    if (!j) {
      j = {
        key: id, x, y,
        type: null,
        areaCount: 0,
        spokes: [],
        _presetType: presetType || null,
      };
      junctionByKey.set(id, j);
    } else if (presetType && !j._presetType) {
      j._presetType = presetType;
    }
    return j;
  }

  // 1) Decision-graph markers (must carry .id).
  for (const m of decisionGraph.markers) {
    const id = m.id || m.key;
    ensureJunction(id, m.x, m.y);
  }

  // 2) Snap landings + pass-through mesh vertices any route uses.
  //    Raw "endpoint:..." waypoints are NOT junctions — they're off-mesh.
  const perRoute = routes.map(route => {
    const pts = pathfinding.routeWaypoints(route.start, route.end, mesh);
    return { pts };
  });

  perRoute.forEach(({ pts }) => {
    for (const wp of pts) {
      if (isEndpointId(wp.id)) continue;
      if (isSnapId(wp.id)) {
        ensureJunction(wp.id, wp.x, wp.y, "snap");
      } else if (isMeshVertexId(wp.id)) {
        ensureJunction(wp.id, wp.x, wp.y);
      }
    }
  });

  // ---- Spoke extraction ----
  routes.forEach((route, ri) => {
    const { pts } = perRoute[ri];
    if (pts.length < 2) return;

    for (let i = 0; i < pts.length - 1; i++) {
      const A = pts[i], B = pts[i + 1];
      const aIsEndpoint = isEndpointId(A.id);
      const bIsEndpoint = isEndpointId(B.id);
      // Per-route endpoint pseudo-keys for spoke far-references.
      const aKind = i === 0 ? "start" : "end";
      const bKind = i + 1 === pts.length - 1 ? "end" : "start";
      const aFar = aIsEndpoint ? ("endpoint:" + route.id + ":" + aKind) : A.id;
      const bFar = bIsEndpoint ? ("endpoint:" + route.id + ":" + bKind) : B.id;

      const spokeType = classifySpoke(A, B);

      function recordSpoke(atJunction, fk) {
        if (!atJunction) return;
        let existing = atJunction.spokes.find(
          s => s.farKey === fk && s.spokeType === spokeType
        );
        if (!existing) {
          existing = { farKey: fk, spokeType, routeIds: [] };
          atJunction.spokes.push(existing);
        }
        if (existing.routeIds.indexOf(route.id) === -1) {
          existing.routeIds.push(route.id);
        }
      }

      const aJunction = aIsEndpoint ? null : junctionByKey.get(A.id);
      const bJunction = bIsEndpoint ? null : junctionByKey.get(B.id);
      if (aJunction) recordSpoke(aJunction, bFar);
      if (bJunction) recordSpoke(bJunction, aFar);
    }
  });

  // ---- Classification ----
  function areaFaceCountAt(pointId) {
    let n = 0;
    for (const f of mesh.faces) {
      if (!f.isArea) continue;
      if (f.ring.indexOf(pointId) !== -1) n++;
    }
    return n;
  }

  for (const j of junctionByKey.values()) {
    if (j._presetType === "snap") {
      j.type = "snap";
      j.areaCount = 0;
      continue;
    }
    if (isMeshVertexId(j.key)) {
      j.areaCount = areaFaceCountAt(j.key);
    } else {
      j.areaCount = 0;
    }
    if (j.areaCount === 1) j.type = "coastline";
    else                   j.type = "multiway";
  }

  const junctions = [];
  for (const j of junctionByKey.values()) {
    delete j._presetType;
    junctions.push(j);
  }

  return { junctions, junctionByKey };
}
)}

function _combinedPathNetwork(){return(
function combinedPathNetwork(mesh, routes, pathfinding) {
  // Identify a derived link by either endpoint pair (for vertex/vertex
  // segments) or by id (for snap-bearing segments).
  const linkById = new Map();
  for (const l of mesh.derivedLinks) linkById.set(l.id, l);

  function endpointPairKey(a, b) { return a < b ? a + "|" + b : b + "|" + a; }
  const linkByEndpointPair = new Map();
  for (const l of mesh.derivedLinks) {
    linkByEndpointPair.set(endpointPairKey(l.a, l.b), l);
  }

  function isMeshVertexId(id) { return typeof id === "string" && (id[0] === "u" || id[0] === "v"); }
  function isSnapId(id)       { return typeof id === "string" && id.startsWith("snap:"); }
  function isEndpointId(id)   { return typeof id === "string" && id.startsWith("endpoint:"); }

  // Visual-CCW perpendicular for a source→target direction in SCREEN
  // coordinates (y grows downward). For direction (dx, dy), the
  // visual-CCW perpendicular is (dy, -dx) — i.e., the side you'd see
  // on your left if you walked from source to target.
  function visualCCWPerp(dx, dy) {
    const len = Math.hypot(dx, dy) || 1;
    return { px: dy / len, py: -dx / len };
  }

  // Set of derived-link ids that are interior edges of an ENABLED area
  // face (a coastline bordering walkable area). Anything else — links
  // in open mesh, or rings that bound only disabled (non-walkable)
  // faces — is a "river" link, classified as "link".
  //
  // For each area-edge link, record `areaSide`: +1 if the walkable
  // area lies on the CCW (visual-left) side of the link's
  // source→target vector (link.a → link.b), -1 if on the CW
  // (visual-right) side, 0 if undetermined. Used downstream to shift
  // bundle offsets onto the area side so the strand at the
  // open-water edge of the bundle sits directly on the link and the
  // rest of the bundle extends into the area.
  //
  // ----------------------------------------------------------------
  // Disabled faces.
  //
  // A face may carry `f.disabled = true`, marking it not-walkable
  // even though `f.isArea` is true. Such a face does NOT contribute
  // its ring edges as area-edges: a link that only borders disabled
  // faces is a "link" (river), not an "edge" (coastline), because
  // there's no walkable area adjacent to it. A link that borders one
  // enabled and one disabled face still counts as an area-edge (the
  // enabled side is its walkable side).
  //
  // ----------------------------------------------------------------
  // Method: per-edge LOCAL probe.
  //
  // A global probe (face centroid, interiorPoint, etc.) is unreliable
  // — for a non-convex face, the global probe lies on different sides
  // of different edges, even though the polygon's interior is always
  // on ONE locally-consistent side of each edge. (Example: a face
  // shaped like a 'C' has its centroid outside several of its own
  // edges' "interior" sides.)
  //
  // Instead, for each candidate area-edge link, step a small distance
  // off the edge's midpoint in BOTH perpendicular directions and ask
  // whether that point lies inside an ENABLED area face. The walkable
  // side IS the area side. Then read which side that is relative to
  // the link's stored source→target vector to set areaSide.

  // Find the face containing (x, y), or null. Uses ring-containment
  // with the deepest hit (innermost face). Returns the face object
  // regardless of disabled status — callers should check `disabled`
  // themselves when they need walkability rather than just geometric
  // containment.
  function faceAt(x, y) {
    let bestIdx = -1, bestDepth = -1;
    for (let i = 0; i < mesh.faces.length; i++) {
      const f = mesh.faces[i];
      const ring = f.ring;
      // Inline ray-cast point-in-polygon over the ring's coordinates.
      let inside = false;
      const n = ring.length;
      let prev = mesh.dPointById(ring[n - 1]);
      for (let j = 0; j < n; j++) {
        const curr = mesh.dPointById(ring[j]);
        if (!prev || !curr) { prev = curr; continue; }
        const yiAbove = curr.y > y, yjAbove = prev.y > y;
        if (yiAbove !== yjAbove) {
          const xCross = (prev.x - curr.x) * (y - curr.y) / (prev.y - curr.y) + curr.x;
          if (x < xCross) inside = !inside;
        }
        prev = curr;
      }
      if (!inside) continue;
      const depth = (typeof f.depth === "number") ? f.depth : 0;
      if (depth > bestDepth) { bestDepth = depth; bestIdx = i; }
    }
    return bestIdx === -1 ? null : mesh.faces[bestIdx];
  }
  function isWalkableAt(x, y) {
    const f = faceAt(x, y);
    return !!(f && f.isArea && !f.disabled);
  }

  const areaEdgeLinkIds = new Set();
  const areaSideByLinkId = new Map();
  // First identify which links border at least one ENABLED area face.
  for (const f of mesh.faces) {
    if (!f.isArea || f.disabled) continue;
    const ring = f.ring;
    for (let i = 0; i < ring.length; i++) {
      const aId = ring[i], bId = ring[(i + 1) % ring.length];
      const L = linkByEndpointPair.get(endpointPairKey(aId, bId));
      if (L) areaEdgeLinkIds.add(L.id);
    }
  }
  // Then determine the area side per area-edge link via local probe.
  // Use the disabled-aware walkability test so a link bordering one
  // enabled and one disabled face resolves to areaSide pointing into
  // the enabled side (rather than tying at "both walkable").
  const PROBE_OFFSET = 1.0;
  for (const linkId of areaEdgeLinkIds) {
    const L = linkById.get(linkId);
    if (!L) continue;
    const La = mesh.dPointById(L.a), Lb = mesh.dPointById(L.b);
    if (!La || !Lb) continue;
    const dx = Lb.x - La.x, dy = Lb.y - La.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-9) continue;
    // Visual-CCW unit perpendicular: (dy, -dx)/len.
    const ccwX =  dy / len, ccwY = -dx / len;
    // Edge midpoint.
    const mx = (La.x + Lb.x) / 2, my = (La.y + Lb.y) / 2;
    // Probe both sides — walkable means "inside an enabled area face".
    const pCCWx = mx + ccwX * PROBE_OFFSET, pCCWy = my + ccwY * PROBE_OFFSET;
    const pCWx  = mx - ccwX * PROBE_OFFSET, pCWy  = my - ccwY * PROBE_OFFSET;
    const inCCW = isWalkableAt(pCCWx, pCCWy);
    const inCW  = isWalkableAt(pCWx,  pCWy);
    let side = 0;
    if (inCCW && !inCW)      side = +1;  // walkable on CCW side
    else if (inCW && !inCCW) side = -1;  // walkable on CW side
    // If both sides are walkable (interior link between two enabled
    // area faces) or neither is (link surrounded by disabled or open
    // mesh on both sides), leave side = 0 so the bundle uses the
    // centered default.
    if (side !== 0) areaSideByLinkId.set(linkId, side);
  }

  // Classify the spoke (segment) between two waypoints by what kind of
  // mesh structure it travels along:
  //   "link"  — along a derived link that ISN'T an area-face edge (river)
  //   "edge"  — along a derived link that IS an area-face edge (coastline)
  //   "area"  — through walkable area interior (no shared link)
  // An endpoint-to-anything segment classifies by the snap/vertex side:
  //   endpoint → snap-on-linkL  ⇒ link/edge along L
  //   endpoint → vertex         ⇒ "link" by default, "edge" if any
  //                                incident link of the vertex is an
  //                                area-face edge
  function spokeTypeFor(A, B) {
    let linkId = null;
    if (isMeshVertexId(A.id) && isMeshVertexId(B.id)) {
      const L = linkByEndpointPair.get(endpointPairKey(A.id, B.id));
      if (L) linkId = L.id;
    } else if (isSnapId(A.id) && isMeshVertexId(B.id) && A.onLinkId != null) {
      const L = linkById.get(A.onLinkId);
      if (L && (L.a === B.id || L.b === B.id)) linkId = L.id;
    } else if (isMeshVertexId(A.id) && isSnapId(B.id) && B.onLinkId != null) {
      const L = linkById.get(B.onLinkId);
      if (L && (L.a === A.id || L.b === A.id)) linkId = L.id;
    } else if (isSnapId(A.id) && isSnapId(B.id) &&
               A.onLinkId != null && A.onLinkId === B.onLinkId) {
      linkId = A.onLinkId;
    } else if (isEndpointId(A.id) || isEndpointId(B.id)) {
      // Off-mesh connectors from a route's raw endpoint to its first
      // on-mesh waypoint (vertex or snap) don't lie ALONG any specific
      // mesh link — the connector cuts across open space to reach the
      // mesh. Treat them as "link" spokes regardless of whether the
      // attached snap/vertex happens to sit on a coastline (area-edge)
      // link. An endpoint-to-endpoint pair (degenerate) stays "area".
      if (isEndpointId(A.id) && isEndpointId(B.id)) return "area";
      return "link";
    }
    if (linkId != null) {
      return areaEdgeLinkIds.has(linkId) ? "edge" : "link";
    }
    return "area";
  }

  // Returns the derived link the waypoint is on, given context — i.e.,
  // when the waypoint is a mesh vertex, we need to know "on which link"
  // to compute t. The caller passes the candidate link.
  // Returns t in [0, 1] for the waypoint's position along link L
  // measured from L.a (t=0) to L.b (t=1), or null if the waypoint
  // is not on L.
  function tOnLink(wp, L) {
    if (isMeshVertexId(wp.id)) {
      if (wp.id === L.a) return 0;
      if (wp.id === L.b) return 1;
      return null;
    }
    if (isSnapId(wp.id) && wp.onLinkId === L.id) {
      // Project the snap's coordinates onto L to get t.
      const a = mesh.dPointById(L.a), b = mesh.dPointById(L.b);
      if (!a || !b) return null;
      const dx = b.x - a.x, dy = b.y - a.y;
      const len2 = dx*dx + dy*dy;
      if (len2 < 1e-12) return null;
      const t = ((wp.x - a.x) * dx + (wp.y - a.y) * dy) / len2;
      return t;
    }
    return null;
  }

  // For a segment (A, B), determine the derived link it follows (if any).
  // Returns { link, tA, tB } or null. Note tA / tB are measured from
  // link.a (source) — if a path traverses the link from b→a, tA will
  // be greater than tB, and downstream code must respect that.
  function segmentOnLink(A, B) {
    // Both vertices connected by a derived link
    if (isMeshVertexId(A.id) && isMeshVertexId(B.id)) {
      const L = linkByEndpointPair.get(endpointPairKey(A.id, B.id));
      if (!L) return null;
      return { link: L, tA: tOnLink(A, L), tB: tOnLink(B, L) };
    }
    // Snap + vertex
    if (isSnapId(A.id) && isMeshVertexId(B.id) && A.onLinkId != null) {
      const L = linkById.get(A.onLinkId);
      if (!L) return null;
      if (B.id !== L.a && B.id !== L.b) return null;
      return { link: L, tA: tOnLink(A, L), tB: tOnLink(B, L) };
    }
    if (isMeshVertexId(A.id) && isSnapId(B.id) && B.onLinkId != null) {
      const L = linkById.get(B.onLinkId);
      if (!L) return null;
      if (A.id !== L.a && A.id !== L.b) return null;
      return { link: L, tA: tOnLink(A, L), tB: tOnLink(B, L) };
    }
    // Two snaps on the same link
    if (isSnapId(A.id) && isSnapId(B.id) &&
        A.onLinkId != null && A.onLinkId === B.onLinkId) {
      const L = linkById.get(A.onLinkId);
      if (!L) return null;
      return { link: L, tA: tOnLink(A, L), tB: tOnLink(B, L) };
    }
    // Endpoint-to-anything (off-mesh segment) — not splicable.
    return null;
  }

  // ---- Step 1: route each path independently ----
  const rawPaths = routes.map((route, ri) => {
    const pts = pathfinding.routeWaypoints(route.start, route.end, mesh);
    return { route, routeIdx: ri, pts };
  });

  // ---- Step 2: collect all snap waypoints by their link ----
  // snapsByLink: Map<linkId, [{ id, x, y, onLinkId, t, ownerRouteIdx }, ...]>
  // t is measured from link.a (the link's source) toward link.b.
  const snapsByLink = new Map();
  rawPaths.forEach(({ pts, routeIdx }) => {
    for (const wp of pts) {
      if (!isSnapId(wp.id) || wp.onLinkId == null) continue;
      const L = linkById.get(wp.onLinkId);
      if (!L) continue;
      const t = tOnLink(wp, L);
      if (t === null) continue;
      if (!snapsByLink.has(wp.onLinkId)) snapsByLink.set(wp.onLinkId, []);
      // Dedupe by snap id (the same snap may appear in multiple paths
      // if two paths happen to land at the exact same projected point).
      const list = snapsByLink.get(wp.onLinkId);
      if (!list.some(s => s.id === wp.id)) {
        list.push({
          id: wp.id, x: wp.x, y: wp.y, onLinkId: wp.onLinkId,
          t, ownerRouteIdx: routeIdx,
        });
      }
    }
  });

  // ---- Step 3: splice — for each path's segment, insert any node
  // (mesh vertex or another path's snap) that lies geometrically on the
  // segment, in travel-direction order.
  //
  // Two categories of nodes get spliced:
  //   (a) Snap points from any path whose onLinkId matches a derived
  //       link the segment travels along, with t strictly inside the
  //       segment's span on that link.
  //   (b) Mesh vertices that are geometrically collinear with the
  //       segment AND lie strictly between A and B on the segment's
  //       straight-line interpolation. This handles cases where the
  //       Dijkstra visibility-graph hop skips over a vertex that the
  //       straight-line path actually crosses (e.g., a snap on link
  //       d0 connecting directly to a snap on link d1 across their
  //       shared endpoint vertex u2). ----
  const ON_SEG_TOL = 0.5;

  // Pre-collect all snaps (across all paths) keyed by link, plus all
  // mesh-vertex positions for the collinearity test.
  const allMeshVertices = mesh.derivedPoints.map(p => ({
    id: p.id, x: p.x, y: p.y,
  }));

  function nodesOnSegment(A, B) {
    // Returns an ordered list of { id, x, y, onLinkId, t } where t is
    // the fractional position along the segment (0 at A, 1 at B), for
    // every node strictly between A and B.
    const dx = B.x - A.x, dy = B.y - A.y;
    const segLen2 = dx*dx + dy*dy;
    if (segLen2 < 1e-9) return [];
    const out = [];
    const seenIds = new Set([A.id, B.id]);

    // (a) Snap-point splicing — only when the segment lies on a single
    // derived link. This preserves the "same-link" semantics requested
    // earlier (snaps don't bleed across links).
    const seg = segmentOnLink(A, B);
    if (seg && seg.tA !== null && seg.tB !== null) {
      const candidates = snapsByLink.get(seg.link.id) || [];
      const tLoLink = Math.min(seg.tA, seg.tB);
      const tHiLink = Math.max(seg.tA, seg.tB);
      const T_EPS = 1e-6;
      for (const s of candidates) {
        if (seenIds.has(s.id)) continue;
        if (s.t <= tLoLink + T_EPS || s.t >= tHiLink - T_EPS) continue;
        // Convert link-t to segment-t (fractional position along A→B).
        const segT = (s.t - seg.tA) / (seg.tB - seg.tA);
        out.push({ id: s.id, x: s.x, y: s.y, onLinkId: s.onLinkId, t: segT });
        seenIds.add(s.id);
      }
    }

    // (b) Mesh-vertex splicing — any vertex collinear with A→B that
    // lies strictly between them gets included. We use a perpendicular-
    // distance tolerance + interpolation parameter in (0, 1).
    for (const v of allMeshVertices) {
      if (seenIds.has(v.id)) continue;
      // Parameterize V along A→B: projT = ((V-A) · (B-A)) / |B-A|².
      const px = v.x - A.x, py = v.y - A.y;
      const projT = (px*dx + py*dy) / segLen2;
      if (projT <= 1e-6 || projT >= 1 - 1e-6) continue;
      // Perpendicular distance squared from V to the segment line.
      const projX = A.x + projT*dx, projY = A.y + projT*dy;
      const perp2 = (v.x - projX)**2 + (v.y - projY)**2;
      if (perp2 > ON_SEG_TOL * ON_SEG_TOL) continue;
      out.push({ id: v.id, x: v.x, y: v.y, onLinkId: null, t: projT });
      seenIds.add(v.id);
    }

    out.sort((a, b) => a.t - b.t);
    return out;
  }

  const paths = rawPaths.map(({ route, routeIdx, pts }) => {
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const A = pts[i], B = pts[i + 1];
      const inside = nodesOnSegment(A, B);
      for (const n of inside) {
        out.push({ id: n.id, x: n.x, y: n.y, onLinkId: n.onLinkId });
      }
      out.push(B);
    }
    return {
      routeId: route.id,
      routeIdx,
      color: route.color,
      waypoints: out,
    };
  });

  // ---- Step 4: build nodes map and edges aggregate ----
  const nodes = new Map();
  function ensureNode(wp) {
    if (nodes.has(wp.id)) return;
    let kind;
    if (isMeshVertexId(wp.id))    kind = "vertex";
    else if (isSnapId(wp.id))     kind = "snap";
    else if (isEndpointId(wp.id)) kind = "endpoint";
    else                          kind = "unknown";
    nodes.set(wp.id, {
      id: wp.id, x: wp.x, y: wp.y, kind,
      onLinkId: wp.onLinkId != null ? wp.onLinkId : null,
    });
  }
  function edgeKey(a, b) { return a < b ? a + "||" + b : b + "||" + a; }
  const edges = new Map();

  paths.forEach(({ waypoints, routeIdx }) => {
    for (const wp of waypoints) ensureNode(wp);
    for (let i = 0; i < waypoints.length - 1; i++) {
      const A = waypoints[i], B = waypoints[i + 1];
      const a = A.id, b = B.id;
      const k = edgeKey(a, b);
      let e = edges.get(k);
      if (!e) {
        e = {
          a: a < b ? a : b,
          b: a < b ? b : a,
          routeIdxs: [],
          spokeType: spokeTypeFor(A, B),
        };
        edges.set(k, e);
      }
      if (!e.routeIdxs.includes(routeIdx)) e.routeIdxs.push(routeIdx);
    }
  });

  // ---- Step 5: bundle layout ----
  //
  // Each edge belongs to a "group". All edges in a group share a
  // single bundle layout (so a route's offset is visually continuous
  // across snap-induced sub-segments of the same underlying link).
  //
  // Group key derivation:
  //   - Vertex↔vertex along a derived link: group = "link:<linkId>"
  //   - Snap↔vertex where vertex is an endpoint of snap.onLinkId:
  //     group = "link:<linkId>"
  //   - Snap↔snap on the same onLinkId: group = "link:<linkId>"
  //   - Anything else (area crossings, endpoint connectors, etc.):
  //     each edge is its own group, keyed "edge:<edgeKey>".
  //
  // Within each group:
  //   - The canonical perpendicular is the visual-CCW perpendicular of
  //     the underlying link's source→target vector (link.a → link.b)
  //     for link groups, or of the edge's stored a→b direction for
  //     standalone edge groups.
  //   - Offsets are signed scalars along that perpendicular: positive
  //     pushes a strand to the CCW (visual-left) side, negative to CW.
  //   - For non-edge groups (rivers, area crossings): offsets are
  //     centered, k - (n-1)/2 where k indexes the sorted route list.
  //   - For edge groups (links bounding an area face): the bundle is
  //     shifted entirely onto the AREA side. One strand sits at offset
  //     0 (directly on the link), the rest step into the area. Sign
  //     matches `areaSide`: areaSide = +1 (area on CCW side) → offsets
  //     0, +1, +2, …; areaSide = -1 (area on CW side) → 0, -1, -2, ….
  function nodeOnLinkAsEndpoint(nodeId, link) {
    return link && (link.a === nodeId || link.b === nodeId);
  }
  function groupKeyForEdge(e) {
    const A = nodes.get(e.a), B = nodes.get(e.b);
    if (!A || !B) return "edge:" + e.a + "||" + e.b;
    // vertex + vertex
    if (A.kind === "vertex" && B.kind === "vertex") {
      const L = linkByEndpointPair.get(endpointPairKey(A.id, B.id));
      if (L) return "link:" + L.id;
    }
    // snap + vertex (vertex is link endpoint)
    if (A.kind === "snap" && B.kind === "vertex" && A.onLinkId != null) {
      const L = linkById.get(A.onLinkId);
      if (nodeOnLinkAsEndpoint(B.id, L)) return "link:" + L.id;
    }
    if (A.kind === "vertex" && B.kind === "snap" && B.onLinkId != null) {
      const L = linkById.get(B.onLinkId);
      if (nodeOnLinkAsEndpoint(A.id, L)) return "link:" + L.id;
    }
    // two snaps on the same link
    if (A.kind === "snap" && B.kind === "snap" &&
        A.onLinkId != null && A.onLinkId === B.onLinkId) {
      return "link:" + A.onLinkId;
    }
    // Anything else (endpoint+anything, two unrelated snaps, etc.):
    // each edge is its own group.
    return "edge:" + e.a + "||" + e.b;
  }

  // Aggregate routes by group.
  const routesByGroup = new Map();
  const groupKeyByEdgeKey = new Map();
  for (const [ek, e] of edges) {
    const gk = groupKeyForEdge(e);
    groupKeyByEdgeKey.set(ek, gk);
    let g = routesByGroup.get(gk);
    if (!g) { g = new Set(); routesByGroup.set(gk, g); }
    for (const ri of e.routeIdxs) g.add(ri);
  }

  // Build per-group layouts and visual-CCW perpendiculars.
  const groupLayouts = new Map(); // gk -> Map<routeIdx, number>
  const groupPerp    = new Map(); // gk -> { px, py }
  for (const [gk, routeSet] of routesByGroup) {
    const sorted = [...routeSet].sort((a, b) => a - b);
    const n = sorted.length;

    // Decide layout style: centered by default; shifted to the area
    // side for area-edge link groups. areaSide records which side
    // the walkable area is on relative to source→target (CCW or CW),
    // and we push strands INTO that side so the bundle's open-water
    // edge sits flush on the link.
    let areaSide = 0;
    if (gk.startsWith("link:")) {
      const linkId = gk.slice("link:".length);
      if (areaEdgeLinkIds.has(linkId) && areaSideByLinkId.has(linkId)) {
        areaSide = areaSideByLinkId.get(linkId);
      }
    }
    const layout = new Map();
    if (areaSide === +1) {
      // Walkable area is on the CCW (visual-left) side of source→target.
      // Push strands into CCW (positive offsets): 0, +1, +2, ….
      // ordering[0] = at offset 0 = on link (smallest stored offset).
      for (let k = 0; k < n; k++) layout.set(sorted[k], +k);
    } else if (areaSide === -1) {
      // Walkable area is on the CW (visual-right) side. Push into CW
      // (negative offsets). To keep the SAME meaning for ordering[k]
      // — namely, ordering[0] = smallest stored offset (most CW) — we
      // assign offsets -(n-1), -(n-2), …, -1, 0 so ordering[0] sits
      // deepest in the area and ordering[n-1] sits on the link.
      //
      // Visually identical to "0, -1, -2, …" (one strand on the link,
      // rest in the area); the only change is the meaning of "first
      // in ordering" is now consistent across all areaSide values:
      // ordering[0] is always the most-CW strand in stored frame.
      for (let k = 0; k < n; k++) layout.set(sorted[k], k - (n - 1));
    } else {
      // Centered (default) — no area-edge constraint, so the bundle
      // sits symmetrically across the link. ordering[0] at the most
      // negative (CW) end.
      for (let k = 0; k < n; k++) layout.set(sorted[k], k - (n - 1) / 2);
    }
    groupLayouts.set(gk, layout);

    // Visual-CCW perpendicular for this group, anchored on the
    // underlying link's source→target direction.
    let dirX = 0, dirY = 0;
    if (gk.startsWith("link:")) {
      const L = linkById.get(gk.slice("link:".length));
      const A = L && mesh.dPointById(L.a);
      const B = L && mesh.dPointById(L.b);
      if (A && B) { dirX = B.x - A.x; dirY = B.y - A.y; }
    }
    if (dirX === 0 && dirY === 0) {
      // Fallback (standalone edge group, or link lookup failed):
      // use the edge's own a→b direction. e.a < e.b lexicographically,
      // which gives a deterministic — if arbitrary — source→target.
      let sampleEdge = null;
      for (const [ek, e] of edges) {
        if (groupKeyByEdgeKey.get(ek) === gk) { sampleEdge = e; break; }
      }
      if (sampleEdge) {
        const A = nodes.get(sampleEdge.a), B = nodes.get(sampleEdge.b);
        if (A && B) { dirX = B.x - A.x; dirY = B.y - A.y; }
      }
    }
    groupPerp.set(gk, visualCCWPerp(dirX, dirY));
  }
  for (const [ek, e] of edges) {
    e.routeIdxs.sort((x, y) => x - y);
    const gk = groupKeyByEdgeKey.get(ek);
    const layout = groupLayouts.get(gk);
    const perp   = groupPerp.get(gk);
    e.groupKey = gk;
    e.bundleOffsetByRoute = new Map();
    for (const ri of e.routeIdxs) {
      if (layout.has(ri)) e.bundleOffsetByRoute.set(ri, layout.get(ri));
    }
    e.bundlePerpX = perp ? perp.px : 0;
    e.bundlePerpY = perp ? perp.py : 0;
  }

  // Group summary for downstream callers (e.g. an optimizer rewriting
  // bundle orderings). Each entry covers all edges sharing a single
  // bundle layout — keyed by the same `groupKey` set on each edge.
  // perpX/perpY is the visual-CCW perpendicular; areaSide records
  // which side of the link's source→target vector the walkable area
  // lies on (+1 = CCW, -1 = CW, 0 = undetermined / not an area-edge
  // link).
  const linkGroups = new Map();
  for (const [gk, routeSet] of routesByGroup) {
    const edgeKeys = [];
    for (const [ek, e] of edges) {
      if (e.groupKey === gk) edgeKeys.push(ek);
    }
    let areaSide = 0;
    if (gk.startsWith("link:")) {
      const linkId = gk.slice("link:".length);
      if (areaEdgeLinkIds.has(linkId) && areaSideByLinkId.has(linkId)) {
        areaSide = areaSideByLinkId.get(linkId);
      }
    }
    const perp = groupPerp.get(gk) || { px: 0, py: 0 };
    linkGroups.set(gk, {
      groupKey: gk,
      edgeKeys,
      routeUnion: [...routeSet].sort((a, b) => a - b),
      areaSide,
      perpX: perp.px,
      perpY: perp.py,
      isEdgeGroup: gk.startsWith("link:") &&
                   areaEdgeLinkIds.has(gk.slice("link:".length)),
    });
  }

  return { paths, nodes, edges, linkGroups };
}
)}

function _classifyPathNodes(){return(
function classifyPathNodes(network) {
  const { paths, nodes, edges } = network;

  function edgeKey(a, b) { return a < b ? a + "||" + b : b + "||" + a; }
  function spokeTypeBetween(idA, idB) {
    const e = edges.get(edgeKey(idA, idB));
    return e ? e.spokeType : "area";
  }
  // Two-letter pair key, sorted alphabetically (so "edge,area" and
  // "area,edge" both yield "ae"). The single letters happen to be
  // unambiguous: link/edge/area → l/e/a.
  function pairKeyOf(typeA, typeB) {
    const letters = [typeA, typeB].map(t => t[0]).sort();
    return letters[0] + letters[1];
  }

  // ---- Per-node aggregation (with spoke types) ----
  // adjByNode: Map<nodeId, Map<farId, { routeIdxs: Set, spokeType }>>
  // touchesByNode: Map<nodeId, Map<routeIdx, "interior" | "terminus">>
  const adjByNode = new Map();
  const touchesByNode = new Map();

  function recordAdj(nodeId, farId, routeIdx) {
    let m = adjByNode.get(nodeId);
    if (!m) { m = new Map(); adjByNode.set(nodeId, m); }
    let entry = m.get(farId);
    if (!entry) {
      entry = { routeIdxs: new Set(), spokeType: spokeTypeBetween(nodeId, farId) };
      m.set(farId, entry);
    }
    entry.routeIdxs.add(routeIdx);
  }
  function recordTouch(nodeId, routeIdx, kind) {
    let m = touchesByNode.get(nodeId);
    if (!m) { m = new Map(); touchesByNode.set(nodeId, m); }
    if (m.get(routeIdx) !== "interior") m.set(routeIdx, kind);
  }

  paths.forEach(({ waypoints, routeIdx }) => {
    for (let i = 0; i < waypoints.length; i++) {
      const cur = waypoints[i];
      const prev = i > 0 ? waypoints[i - 1] : null;
      const next = i < waypoints.length - 1 ? waypoints[i + 1] : null;
      const kind = (prev && next) ? "interior" : "terminus";
      recordTouch(cur.id, routeIdx, kind);
      if (prev) recordAdj(cur.id, prev.id, routeIdx);
      if (next) recordAdj(cur.id, next.id, routeIdx);
    }
  });

  // ---- Classify each non-endpoint node ----
  const classified = [];
  for (const [id, node] of nodes) {
    if (node.kind === "endpoint") continue;

    const adj = adjByNode.get(id) || new Map();
    const touches = touchesByNode.get(id) || new Map();
    // Each spoke gets an angle measured from this junction toward its
    // far node, computed with standard atan2(dy, dx) so the value is in
    // (-π, π]. Spokes are sorted ascending by angle to give a stable
    // radial ordering (counterclockwise in math coordinates / clockwise
    // in SVG screen coordinates where y grows downward).
    const spokes = [...adj.entries()].map(([farId, entry]) => {
      const far = nodes.get(farId);
      const dx = far ? far.x - node.x : 0;
      const dy = far ? far.y - node.y : 0;
      return {
        farId,
        spokeType: entry.spokeType,
        routeIdxs: [...entry.routeIdxs].sort((a, b) => a - b),
        angle: Math.atan2(dy, dx),
      };
    });
    spokes.sort((a, b) => a.angle - b.angle);

    let classification, reason;
    if (spokes.length === 0) {
      classification = "decision";
      reason = "no spokes recorded";
    } else if (spokes.length !== 2) {
      classification = "decision";
      reason = spokes.length >= 3
        ? "3+ spokes (branching junction)"
        : "1 spoke (path terminus on mesh)";
    } else {
      let anyTerminus = false;
      for (const [, t] of touches) if (t === "terminus") { anyTerminus = true; break; }
      if (anyTerminus) {
        classification = "decision";
        reason = "path terminates here";
      } else {
        const [s1, s2] = spokes;
        const set1 = new Set(s1.routeIdxs), set2 = new Set(s2.routeIdxs);
        let identical = set1.size === set2.size;
        if (identical) for (const r of set1) if (!set2.has(r)) { identical = false; break; }
        if (!identical) {
          classification = "decision";
          reason = "spoke route-sets differ";
        } else {
          classification = "parallel";
          reason = "all paths pass through both spokes";
        }
      }
    }

    classified.push({
      id, x: node.x, y: node.y, kind: node.kind,
      spokes, classification, reason,
    });
  }

  // ---- Per-path-traversal junction-pair classification ----
  // For each path and each waypoint along it, compute the spoke types
  // on either side. At a terminus waypoint with only one neighbor,
  // both in/out types are the single available spoke's type — yielding
  // a self-pair key like "ll" / "ee" / "aa".
  const pathTraversals = paths.map(p => {
    const wps = p.waypoints;
    // Precompute segment types: segType[i] is the type of segment
    // wps[i] → wps[i+1]. Length = wps.length - 1.
    const segType = new Array(Math.max(0, wps.length - 1));
    for (let i = 0; i < wps.length - 1; i++) {
      segType[i] = spokeTypeBetween(wps[i].id, wps[i + 1].id);
    }
    const wpInfo = wps.map((wp, i) => {
      const inT  = i > 0                ? segType[i - 1] : (segType[0] || "area");
      const outT = i < wps.length - 1   ? segType[i]     : (segType[segType.length - 1] || "area");
      return {
        id: wp.id,
        inSpokeType:  inT,
        outSpokeType: outT,
        pairKey: pairKeyOf(inT, outT),
      };
    });
    return {
      routeId: p.routeId,
      routeIdx: p.routeIdx,
      waypoints: wpInfo,
    };
  });

  const decisions = classified.filter(n => n.classification === "decision");
  const parallels = classified.filter(n => n.classification === "parallel");
  return { nodes: classified, decisions, parallels, pathTraversals };
}
)}

function _35(md){return(
md`------------`
)}

function _36(md){return(
md`### Optimize bundle order`
)}

function _makeParallel(){return(
function makeParallel(network, classified) {
  const { edges, linkGroups } = network;
  const classifiedNodes = classified.nodes;

  // Index classified nodes by id.
  const nodeById = new Map();
  for (const n of classifiedNodes) nodeById.set(n.id, n);

  function isParallel(node) {
    return node && node.classification === "parallel" && node.spokes.length === 2;
  }

  function twinSpoke(node, spoke) {
    if (!isParallel(node)) return null;
    return node.spokes[0] === spoke ? node.spokes[1] : node.spokes[0];
  }

  function spokeAt(node, farId) {
    if (!node) return null;
    for (const sp of node.spokes) if (sp.farId === farId) return sp;
    return null;
  }

  function edgeKeyFor(idA, idB) {
    return idA < idB ? idA + "||" + idB : idB + "||" + idA;
  }

  function wrapPi(a) {
    while (a >  Math.PI) a -= 2 * Math.PI;
    while (a <= -Math.PI) a += 2 * Math.PI;
    return a;
  }

  // ---- Step 1: enumerate sub-bundle chains (unchanged) ----
  const chains = [];
  const seenChainKeys = new Set();

  function findCoherentOutSpoke(node, R, incomingFromId) {
    if (!node || !node.spokes) return null;
    let unanimousSpoke = null;
    for (const r of R) {
      let routeOutSpoke = null;
      for (const s of node.spokes) {
        if (s.farId === incomingFromId) continue;
        if (s.routeIdxs.indexOf(r) === -1) continue;
        routeOutSpoke = s;
        break;
      }
      if (!routeOutSpoke) return null;
      if (unanimousSpoke === null) unanimousSpoke = routeOutSpoke;
      else if (unanimousSpoke !== routeOutSpoke) return null;
    }
    return unanimousSpoke;
  }

  function walkOneDirection(fromId, toId, R) {
    const walkNodes = [toId];
    const walkEdges = [];
    let prevId = fromId;
    let curId  = toId;
    while (true) {
      const cur = nodeById.get(curId);
      if (!cur) break;
      const outSpoke = findCoherentOutSpoke(cur, R, prevId);
      if (!outSpoke) break;
      const nextId = outSpoke.farId;
      walkNodes.push(nextId);
      walkEdges.push(edgeKeyFor(curId, nextId));
      prevId = curId;
      curId = nextId;
    }
    return { walkNodes, walkEdges };
  }

  function chainKey(chainEdges, R) {
    const eks = chainEdges.slice().sort();
    const rs  = R.slice().sort((a, b) => a - b);
    return eks.join(",") + "|" + rs.join(",");
  }

  for (const startNode of classifiedNodes) {
    for (const startSpoke of startNode.spokes) {
      const R0 = startSpoke.routeIdxs;
      if (R0.length < 2) continue;

      const farId = startSpoke.farId;
      const ek0 = edgeKeyFor(startNode.id, farId);

      const fwd = walkOneDirection(startNode.id, farId, R0);
      const back = walkOneDirection(farId, startNode.id, R0);

      const nodes = [];
      const edgeList = [];
      for (let i = back.walkNodes.length - 1; i > 0; i--) {
        nodes.push(back.walkNodes[i]);
      }
      for (let i = back.walkEdges.length - 1; i >= 0; i--) {
        edgeList.push(back.walkEdges[i]);
      }
      nodes.push(startNode.id);
      nodes.push(farId);
      edgeList.push(ek0);
      for (let i = 1; i < fwd.walkNodes.length; i++) {
        nodes.push(fwd.walkNodes[i]);
      }
      for (const ek of fwd.walkEdges) edgeList.push(ek);

      const key = chainKey(edgeList, R0);
      if (seenChainKeys.has(key)) continue;
      seenChainKeys.add(key);

      chains.push({ nodes, edges: edgeList, routeIdxs: R0.slice() });
    }
  }

  // ---- Frame conversion helpers (unchanged) ----
  function chainForwardSign(network, fromId, toId, edge) {
    const A = network.nodes.get(fromId);
    const B = network.nodes.get(toId);
    if (!A || !B) return +1;
    const dx = B.x - A.x, dy = B.y - A.y;
    const dot = dy * edge.bundlePerpX + (-dx) * edge.bundlePerpY;
    return dot >= 0 ? +1 : -1;
  }
  function storedOrderForEdge(network, fromId, toId, edge, X) {
    const s = chainForwardSign(network, fromId, toId, edge);
    return s === +1 ? X.slice() : X.slice().reverse();
  }

  const result = new Map();

  // Chain processing order: peripheral to center (route count ASC),
  // then edge count DESC, then first-node id. Unchanged.
  const sortedChains = chains.slice().sort((a, b) => {
    const dRoutes = a.routeIdxs.length - b.routeIdxs.length;
    if (dRoutes !== 0) return dRoutes;
    const dEdges = b.edges.length - a.edges.length;
    if (dEdges !== 0) return dEdges;
    return String(a.nodes[0]).localeCompare(String(b.nodes[0]));
  });

  // Per-route deflection info at a junction spoke (unchanged).
  function routeDeflectionsAtSpoke(node, spoke) {
    const others = node && node.spokes ? node.spokes.filter(s => s !== spoke) : [];
    const map = new Map();
    if (!spoke) return map;
    for (const r of spoke.routeIdxs) {
      let nextSpoke = null;
      for (const os of others) {
        if (os.routeIdxs.indexOf(r) !== -1) { nextSpoke = os; break; }
      }
      const defl = nextSpoke ? wrapPi(nextSpoke.angle - spoke.angle) : 0;
      const disp = Math.sin(defl);
      map.set(r, { otherSpoke: nextSpoke, defl, disp });
    }
    return map;
  }

  // The spoke at nodeId that route r ARRIVES from (excluding the chain
  // edge toward otherChainNodeId). Unchanged.
  function routeArrivingSpokeAt(nodeId, otherChainNodeId, routeIdx) {
    const n = nodeById.get(nodeId);
    if (!n || !n.spokes) return null;
    for (const sp of n.spokes) {
      if (sp.farId === otherChainNodeId) continue;
      if (sp.routeIdxs.indexOf(routeIdx) !== -1) return sp;
    }
    return null;
  }

  const chainsOut = [];

  for (const chain of sortedChains) {
    if (chain.routeIdxs.length === 0) continue;
    const lastIdx = chain.nodes.length - 1;

    // ---- Step 1: build units by (birthSpoke, deathSpoke) partition ----
    const startNode0 = nodeById.get(chain.nodes[0]);
    const startSpoke0 = startNode0 ? spokeAt(startNode0, chain.nodes[1]) : null;
    const deflByRoute = startNode0 && startSpoke0
      ? routeDeflectionsAtSpoke(startNode0, startSpoke0)
      : new Map();

    const deathNodeId = chain.nodes[lastIdx];
    const deathAdjId  = chain.nodes[lastIdx - 1];
    const deathNode = nodeById.get(deathNodeId);
    const deathOutSpoke = deathNode ? spokeAt(deathNode, deathAdjId) : null;

    // Partition chain routes by the PAIR of spokes they use at the
    // chain's two ends. Spoke object identity keyed via a local id map.
    const spokeIds = new Map();
    let spokeSeq = 0;
    function spokeIdOf(s) {
      if (s == null) return "x";
      let id = spokeIds.get(s);
      if (!id) { id = "s" + (spokeSeq++); spokeIds.set(s, id); }
      return id;
    }
    const classByKey = new Map(); // "birthId|deathId" -> { birthSpoke, deathSpoke, routes }
    for (const r of chain.routeIdxs) {
      const info = deflByRoute.get(r);
      const birthSpoke = info ? info.otherSpoke : null;
      const deathSpoke = routeArrivingSpokeAt(deathNodeId, deathAdjId, r);
      const key = spokeIdOf(birthSpoke) + "|" + spokeIdOf(deathSpoke);
      let cls = classByKey.get(key);
      if (!cls) {
        cls = { birthSpoke, deathSpoke, routes: [] };
        classByKey.set(key, cls);
      }
      cls.routes.push(r);
    }

    // Internal order for a class: anchor edge from a smaller chain if
    // one exists (hierarchical inheritance), else birth-displacement
    // fallback. Unchanged logic, applied per refined class.
    function internalOrderForClass(classRoutes) {
      if (classRoutes.length <= 1) return classRoutes.slice();
      const classSet = new Set(classRoutes);
      for (let i = 0; i < chain.edges.length; i++) {
        const e = edges.get(chain.edges[i]);
        if (!e || !e.groupKey) continue;
        const existing = result.get(e.groupKey);
        if (!existing) continue;
        const filtered = existing.filter(ri => classSet.has(ri));
        if (filtered.length < 2) continue;
        const s = chainForwardSign(network, chain.nodes[i], chain.nodes[i + 1], e);
        return s === +1 ? filtered.slice() : filtered.slice().reverse();
      }
      const sorted = classRoutes.slice().sort((a, b) => {
        const da = deflByRoute.get(a);
        const db = deflByRoute.get(b);
        const dispA = da ? da.disp : 0;
        const dispB = db ? db.disp : 0;
        if (dispB !== dispA) return dispB - dispA;
        return a - b;
      });
      return sorted;
    }

    // Build units. Each carries exact birth/death spokes and both
    // lateral displacements (forward frames):
    //   disp      — sin(defl) at birth; forward-CW sorts DESC.
    //   deathDisp — sin(defl) at death; forward-CW sorts ASC.
    const units = [];
    for (const cls of classByKey.values()) {
      const info = deflByRoute.get(cls.routes[0]);
      const birthDisp = (cls.birthSpoke && info) ? info.disp : 0;
      let deathDisp = 0;
      if (deathOutSpoke && cls.deathSpoke) {
        deathDisp = Math.sin(wrapPi(cls.deathSpoke.angle - deathOutSpoke.angle));
      }
      units.push({
        routes: internalOrderForClass(cls.routes),
        isCluster: cls.routes.length >= 2,
        disp: birthDisp,
        deathDisp,
        birthSpoke: cls.birthSpoke,
        deathSpoke: cls.deathSpoke,
      });
    }

    // Sort units: birth forward-CW (disp DESC); units tied at birth
    // (same birth spoke) order by death forward-CW (deathDisp ASC) so
    // a diverging sub-group sits on the side of the bundle it exits
    // toward; final tie by min route index for determinism.
    units.sort((a, b) => {
      if (b.disp !== a.disp) return b.disp - a.disp;
      if (a.deathDisp !== b.deathDisp) return a.deathDisp - b.deathDisp;
      return Math.min(...a.routes) - Math.min(...b.routes);
    });

    // X is the flattened unit order in forward-CW.
    let X = [];
    for (const u of units) X = X.concat(u.routes);

    // Record the chain (with its units) for the output.
    chainsOut.push({
      nodes: chain.nodes.slice(),
      edges: chain.edges.slice(),
      routeIdxs: chain.routeIdxs.slice(),
      units: units,
      birthNode: chain.nodes[0],
      deathNode: chain.nodes[lastIdx],
    });

    // ---- Step 2: walk each edge of the chain and convert to stored ----
    const assignedGroups = new Set();
    for (let i = 0; i < chain.edges.length; i++) {
      const e = edges.get(chain.edges[i]);
      if (!e || !e.groupKey) continue;
      if (assignedGroups.has(e.groupKey)) continue;
      assignedGroups.add(e.groupKey);

      const fromId = chain.nodes[i];
      const toId   = chain.nodes[i + 1];
      let storedOrder = storedOrderForEdge(network, fromId, toId, e, X);

      const group = linkGroups && linkGroups.get(e.groupKey);
      const routeUnion = group && group.routeUnion ? group.routeUnion : storedOrder.slice();
      const inGroup = new Set(routeUnion);
      storedOrder = storedOrder.filter(ri => inGroup.has(ri));

      // Merge with any existing group order. AUTHORITY: the CURRENT
      // chain wins the relative order of the routes it carries.
      // Chains are processed smallest→largest, so the largest chain
      // covering a group — the one that actually sees the bundle's
      // divergences and arranged its units accordingly — has the final
      // say. (The previous "existing wins" rule inverted this: by the
      // time the big chain wrote, every route had already been placed
      // by smaller sub-chains in arbitrary relative positions, and the
      // big chain's arrangement was discarded entirely.) Sub-chain
      // INTERNAL orders are not lost: they were folded into this
      // chain's X via anchor inheritance. Routes present in `existing`
      // but NOT in this chain keep their old neighbors: walk
      // `existing` with a cursor into `storedOrder`; shared routes are
      // emitted in storedOrder's order (with catch-up), existing-only
      // routes are emitted in place.
      const existing = result.get(e.groupKey);
      if (existing) {
        const posIdx = new Map();
        for (let k = 0; k < storedOrder.length; k++) posIdx.set(storedOrder[k], k);
        const merged = [];
        let cursor = 0; // next index in storedOrder not yet emitted
        for (const r of existing) {
          if (posIdx.has(r)) {
            const idx = posIdx.get(r);
            if (idx < cursor) continue; // already emitted via catch-up
            while (cursor < idx) {
              merged.push(storedOrder[cursor]);
              cursor++;
            }
            merged.push(r);
            cursor = idx + 1;
          } else {
            merged.push(r);
          }
        }
        while (cursor < storedOrder.length) {
          merged.push(storedOrder[cursor]);
          cursor++;
        }
        result.set(e.groupKey, merged);
      } else {
        result.set(e.groupKey, storedOrder);
      }
    }
  }

  // Final safety net: append routes present in a group's routeUnion but
  // not placed by any chain. Unchanged.
  if (linkGroups) {
    for (const [gk, group] of linkGroups) {
      const existing = result.get(gk);
      if (!existing) continue;
      const existingSet = new Set(existing);
      let extended = false;
      for (const ri of group.routeUnion) {
        if (!existingSet.has(ri)) {
          existing.push(ri);
          existingSet.add(ri);
          extended = true;
        }
      }
      if (extended) result.set(gk, existing);
    }
  }

  return { orderings: result, chains: chainsOut };
}
)}

function _arrangeCrossings(){return(
function arrangeCrossings(network, classified, parallelOut) {
  const { edges, linkGroups } = network;
  const classifiedNodes = classified.nodes;
  const chains = parallelOut.chains.map(c => ({
    ...c,
    units: c.units.map(u => ({ ...u, routes: u.routes.slice() })),
  }));

  const nodeById = new Map();
  for (const n of classifiedNodes) nodeById.set(n.id, n);

  function spokeAt(node, farId) {
    if (!node) return null;
    for (const sp of node.spokes) if (sp.farId === farId) return sp;
    return null;
  }

  function wrapPi(a) {
    while (a >  Math.PI) a -= 2 * Math.PI;
    while (a <= -Math.PI) a += 2 * Math.PI;
    return a;
  }

  // Edge sign — same as makeParallel.
  function chainForwardSign(fromId, toId, edge) {
    const A = network.nodes.get(fromId);
    const B = network.nodes.get(toId);
    if (!A || !B) return +1;
    const dx = B.x - A.x, dy = B.y - A.y;
    const dot = dy * edge.bundlePerpX + (-dx) * edge.bundlePerpY;
    return dot >= 0 ? +1 : -1;
  }
  function storedOrderForEdge(fromId, toId, edge, X) {
    const s = chainForwardSign(fromId, toId, edge);
    return s === +1 ? X.slice() : X.slice().reverse();
  }

  // ---- End preference: forward-frame lateral key + spoke angle ----
  //
  //   f     — Map<unit, forward-frame lateral key>. The forward-CW unit
  //           order at this end sorts f DESCENDING. Birth end (looking
  //           outward = forward): f = sin(defl). Death end (looking
  //           outward = backward, so CW there is reversed): f = -sin(defl).
  //   angle — Map<unit, absolute spoke angle at this end, or null when
  //           the unit terminates here>.
  //
  // Units with EQUAL f at an end share a spoke there — they arrive or
  // depart bundled, so their relative order causes no crossing AT THIS
  // END (any needed crossing between them belongs to the neighboring
  // chain and is decided there).
  function endPreference(endNodeId, adjNodeId, units, endIsBirth) {
    const endNode = nodeById.get(endNodeId);
    const outgoingSpoke = endNode ? spokeAt(endNode, adjNodeId) : null;
    if (!endNode || !outgoingSpoke) {
      return { ok: false, f: null, angle: null };
    }
    const f = new Map();
    const angle = new Map();
    for (const u of units) {
      const spoke = endIsBirth ? u.birthSpoke : u.deathSpoke;
      const defl = spoke ? wrapPi(spoke.angle - outgoingSpoke.angle) : 0;
      const disp = Math.sin(defl);
      f.set(u, endIsBirth ? disp : -disp);
      angle.set(u, spoke ? spoke.angle : null);
    }
    return { ok: true, f, angle };
  }

  // Shallowness weight of a crossing between two units diverging onto
  // spokes at angles aU, aV. |sin| folds automatically: perpendicular
  // spokes → cheap; parallel OR antiparallel spokes → expensive
  // (glancing crossing either way). Unknown angle (terminating unit)
  // → full weight, conservatively.
  const W_MIN = 0.15;
  function crossWeight(aU, aV) {
    if (aU == null || aV == null) return 1;
    return W_MIN + (1 - W_MIN) * (1 - Math.abs(Math.sin(aU - aV)));
  }

  // Route-pair weight: a crossing between two UNITS is |u|×|v| actual
  // STRAND crossings. Weighting by this makes small-group divergence
  // from a large bundle the dominant term — a 2-route unit inverted
  // against a 28-route unit costs 56 strand crossings, which outweighs
  // any shuffling among small units at the same decision point. So a
  // few routes breaking off a big bundle always get pushed to the
  // bundle edge on their divergence side; the angle preference only
  // arbitrates among options with similar strand counts.
  function pairW(u, v) {
    return u.routes.length * v.routes.length;
  }

  // Weighted crossings the order O produces at one end. A pair (u, v)
  // crosses at this end iff their lateral keys DIFFER there and O
  // places the lower-f unit first (forward-CW = f descending). Equal-f
  // pairs (same spoke) are free at this end.
  const F_EPS = 1e-9;
  function endCost(O, pref) {
    if (!pref || !pref.ok) return 0;
    let cost = 0;
    for (let i = 0; i < O.length; i++) {
      for (let j = i + 1; j < O.length; j++) {
        if (pref.f.get(O[i]) < pref.f.get(O[j]) - F_EPS) {
          cost += crossWeight(pref.angle.get(O[i]), pref.angle.get(O[j])) *
                  pairW(O[i], O[j]);
        }
      }
    }
    return cost;
  }
  function totalCost(O, birth, death) {
    return endCost(O, birth) + endCost(O, death);
  }

  // Sort units by one end's forward-CW preference, tie-breaking by the
  // OTHER end's preference (so units sharing a spoke at the primary
  // end line up for their divergence at the secondary end), then by
  // min route index for determinism.
  function sortUnitsBy(units, primary, secondary) {
    return units.slice().sort((a, b) => {
      const dp = primary.f.get(b) - primary.f.get(a);
      if (Math.abs(dp) > F_EPS) return dp;
      if (secondary && secondary.ok) {
        const ds = secondary.f.get(b) - secondary.f.get(a);
        if (Math.abs(ds) > F_EPS) return ds;
      }
      return Math.min(...a.routes) - Math.min(...b.routes);
    });
  }

  function sameOrder(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  // Exact search over unit permutations (units are atomic — any
  // permutation is legal). 6! = 720, each scored in O(k²): trivial.
  const MAX_EXACT_UNITS = 6;
  function bestPermutation(units, birth, death, seedOrder, seedCost) {
    let best = seedOrder, bestCost = seedCost;
    const arr = units.slice();
    const k = arr.length;
    const used = new Array(k).fill(false);
    const cur = new Array(k);
    (function rec(depth) {
      if (depth === k) {
        const c = totalCost(cur, birth, death);
        if (c < bestCost - 1e-12) { bestCost = c; best = cur.slice(); }
        return;
      }
      for (let i = 0; i < k; i++) {
        if (used[i]) continue;
        used[i] = true;
        cur[depth] = arr[i];
        rec(depth + 1);
        used[i] = false;
      }
    })(0);
    return best;
  }

  // Local improvement for chains too large for the exact search:
  // repeated adjacent transpositions, keeping any swap that lowers the
  // total cost, until a pass makes no progress. With route-pair
  // weighted costs this reliably slides a small diverging unit from
  // the middle of a large bundle out to its correct edge, since every
  // step toward the edge removes |small|×|neighbor| strand crossings.
  function localImprove(order, birth, death) {
    const O = order.slice();
    let cost = totalCost(O, birth, death);
    const MAX_PASSES = 12;
    for (let p = 0; p < MAX_PASSES; p++) {
      let improved = false;
      for (let i = 0; i < O.length - 1; i++) {
        const a = O[i], b = O[i + 1];
        O[i] = b; O[i + 1] = a;
        const c = totalCost(O, birth, death);
        if (c < cost - 1e-12) { cost = c; improved = true; }
        else { O[i] = a; O[i + 1] = b; }
      }
      if (!improved) break;
    }
    return O;
  }

  // Direction-canonical key for an order of units, used ONLY to break
  // exact cost ties. The cost itself is symmetric under reversing the
  // chain's traversal direction (both ends are summed, in consistently
  // flipped frames), but a naive "ties → birth" rule would let the
  // arbitrary orientation the chain enumeration happened to pick leak
  // into the result. Comparing each candidate by min(sequence,
  // reversed sequence) removes that dependence.
  function seqKey(O) {
    const f = O.map(u => Math.min(...u.routes)).join(",");
    const r = O.slice().reverse().map(u => Math.min(...u.routes)).join(",");
    return f < r ? f : r;
  }

  // Decide a chain's TOP-LEVEL unit order.
  function chooseUnitOrder(chain) {
    const lastIdx = chain.nodes.length - 1;
    if (lastIdx < 1 || chain.units.length < 2) return chain.units.slice();
    const birth = endPreference(chain.nodes[0], chain.nodes[1], chain.units, true);
    const death = endPreference(chain.nodes[lastIdx], chain.nodes[lastIdx - 1], chain.units, false);

    if (!birth.ok && !death.ok) return chain.units.slice();
    if (!death.ok) return sortUnitsBy(chain.units, birth, null);
    if (!birth.ok) return sortUnitsBy(chain.units, death, null);

    const candBirth = sortUnitsBy(chain.units, birth, death);
    const candDeath = sortUnitsBy(chain.units, death, birth);
    if (sameOrder(candBirth, candDeath)) return candBirth;

    // Seed with the cheaper of the two end preferences; exact ties are
    // broken direction-agnostically (see seqKey).
    const cb = totalCost(candBirth, birth, death);
    const cd = totalCost(candDeath, birth, death);
    let seed, seedCost;
    if (cb < cd - 1e-12)      { seed = candBirth; seedCost = cb; }
    else if (cd < cb - 1e-12) { seed = candDeath; seedCost = cd; }
    else {
      seed = seqKey(candBirth) <= seqKey(candDeath) ? candBirth : candDeath;
      seedCost = cb;
    }

    if (chain.units.length <= MAX_EXACT_UNITS) {
      return bestPermutation(chain.units, birth, death, seed, seedCost);
    }
    return localImprove(seed, birth, death);
  }

  // Sort chains by route count ASC, then edges DESC, then node id for
  // determinism (same as makeParallel).
  function sortChains(arr) {
    return arr.slice().sort((a, b) => {
      const dR = a.routeIdxs.length - b.routeIdxs.length;
      if (dR !== 0) return dR;
      const dE = b.edges.length - a.edges.length;
      if (dE !== 0) return dE;
      return String(a.nodes[0]).localeCompare(String(b.nodes[0]));
    });
  }

  // Build the per-group orderings from the current units configuration.
  // Same per-edge propagation + merge insertion logic as makeParallel.
  function buildOrderings() {
    const result = new Map();
    const sortedChains = sortChains(chains);
    for (const chain of sortedChains) {
      if (chain.routeIdxs.length === 0) continue;
      // Flatten units to X (forward-CW).
      let X = [];
      for (const u of chain.units) X = X.concat(u.routes);

      const assignedGroups = new Set();
      for (let i = 0; i < chain.edges.length; i++) {
        const e = edges.get(chain.edges[i]);
        if (!e || !e.groupKey) continue;
        if (assignedGroups.has(e.groupKey)) continue;
        assignedGroups.add(e.groupKey);

        const fromId = chain.nodes[i];
        const toId = chain.nodes[i + 1];
        let storedOrder = storedOrderForEdge(fromId, toId, e, X);
        // Filter to group's routeUnion.
        const group = linkGroups && linkGroups.get(e.groupKey);
        const routeUnion = group && group.routeUnion ? group.routeUnion : storedOrder.slice();
        const inGroup = new Set(routeUnion);
        storedOrder = storedOrder.filter(ri => inGroup.has(ri));

        // Merge with any existing group order. AUTHORITY: the CURRENT
        // chain wins the relative order of the routes it carries.
        // Chains are processed smallest→largest, so the largest chain
        // covering a group — the one that saw the divergence and
        // arranged its units (divergers to the edge) — has the final
        // say. The previous "existing wins" rule inverted this: by the
        // time the big chain wrote, every route had already been
        // placed by smaller sub-chains in arbitrary relative
        // positions, and the big chain's arrangement was discarded.
        // Sub-chain INTERNAL orders survive via anchor inheritance
        // into X. Routes in `existing` but NOT in this chain keep
        // their old neighbors: walk `existing` with a cursor into
        // `storedOrder`; shared routes emit in storedOrder's order
        // (with catch-up), existing-only routes emit in place.
        const existing = result.get(e.groupKey);
        if (existing) {
          const posIdx = new Map();
          for (let k = 0; k < storedOrder.length; k++) posIdx.set(storedOrder[k], k);
          const merged = [];
          let cursor = 0; // next index in storedOrder not yet emitted
          for (const r of existing) {
            if (posIdx.has(r)) {
              const idx = posIdx.get(r);
              if (idx < cursor) continue; // already emitted via catch-up
              while (cursor < idx) {
                merged.push(storedOrder[cursor]);
                cursor++;
              }
              merged.push(r);
              cursor = idx + 1;
            } else {
              merged.push(r);
            }
          }
          while (cursor < storedOrder.length) {
            merged.push(storedOrder[cursor]);
            cursor++;
          }
          result.set(e.groupKey, merged);
        } else {
          result.set(e.groupKey, storedOrder);
        }
      }
    }
    // Safety net: append routes in routeUnion not yet placed.
    if (linkGroups) {
      for (const [gk, group] of linkGroups) {
        const existing = result.get(gk);
        if (!existing) continue;
        const existingSet = new Set(existing);
        let extended = false;
        for (const ri of group.routeUnion) {
          if (!existingSet.has(ri)) {
            existing.push(ri);
            existingSet.add(ri);
            extended = true;
          }
        }
        if (extended) result.set(gk, existing);
      }
    }
    return result;
  }

  // For a chain, re-derive its sub-cluster's INTERNAL order from the
  // current orderings — when a smaller chain's order changes (due to
  // its own arrangement), a larger chain that has it as a sub-cluster
  // needs the updated internal order.
  function refreshSubClustersFromOrderings(orderings) {
    for (const chain of chains) {
      const chainRouteSet = new Set(chain.routeIdxs);
      for (let i = 0; i < chain.edges.length; i++) {
        const e = edges.get(chain.edges[i]);
        if (!e || !e.groupKey) continue;
        const existing = orderings.get(e.groupKey);
        if (!existing) continue;
        const filtered = existing.filter(ri => chainRouteSet.has(ri));
        let clusterUnit = null;
        for (const u of chain.units) if (u.isCluster) { clusterUnit = u; break; }
        if (!clusterUnit) break;
        const clusterSet = new Set(clusterUnit.routes);
        const s = chainForwardSign(chain.nodes[i], chain.nodes[i + 1], e);
        const filteredFwdCW = s === +1 ? filtered.slice() : filtered.slice().reverse();
        const newClusterRoutes = filteredFwdCW.filter(r => clusterSet.has(r));
        if (newClusterRoutes.length === clusterUnit.routes.length) {
          clusterUnit.routes = newClusterRoutes;
        }
        break;
      }
    }
  }

  // Iterate to fixed point (same loop structure as before).
  const MAX_ITERS = 6;
  let orderings = parallelOut.orderings;
  for (let iter = 0; iter < MAX_ITERS; iter++) {
    let anyChange = false;
    for (const chain of chains) {
      const chosen = chooseUnitOrder(chain);
      let differ = false;
      if (chosen.length !== chain.units.length) {
        differ = true;
      } else {
        for (let k = 0; k < chosen.length; k++) {
          if (chosen[k] !== chain.units[k]) { differ = true; break; }
        }
      }
      if (differ) {
        chain.units = chosen.slice();
        anyChange = true;
      }
    }
    orderings = buildOrderings();
    refreshSubClustersFromOrderings(orderings);
    if (!anyChange) break;
  }

  return orderings;
}
)}

function _enforceParallelChainConsistency(){return(
function enforceParallelChainConsistency(network, classified, orderings) {
  if (!orderings || orderings.size === 0) return orderings;
  if (!network || !network.edges || !network.linkGroups) return orderings;

  const edgeKey = (a, b) => a < b ? a + "||" + b : b + "||" + a;

  // -------------------------------------------------------------------
  // Step 1: collect links between adjacent groups, with the set of
  // routes co-traversing each pair. Walk every path's waypoint triples
  // directly — every interior waypoint counts, decision or parallel.
  // -------------------------------------------------------------------
  const links = new Map(); // canon "gkA|gkB" -> { a, b, sign, shared:Set }

  for (const p of network.paths) {
    const wps = p.waypoints;
    if (!wps || wps.length < 3) continue;
    for (let i = 1; i < wps.length - 1; i++) {
      const prev = wps[i - 1], cur = wps[i], next = wps[i + 1];
      const eIn  = network.edges.get(edgeKey(prev.id, cur.id));
      const eOut = network.edges.get(edgeKey(cur.id, next.id));
      if (!eIn || !eOut) continue;
      const gkIn = eIn.groupKey, gkOut = eOut.groupKey;
      if (!gkIn || !gkOut || gkIn === gkOut) continue;
      const dot = eIn.bundlePerpX * eOut.bundlePerpX +
                  eIn.bundlePerpY * eOut.bundlePerpY;
      if (Math.abs(dot) < 1e-9) continue; // near-perpendicular frames: sign undefined
      const sign = dot >= 0 ? +1 : -1;
      const canon = gkIn < gkOut ? gkIn + "|" + gkOut : gkOut + "|" + gkIn;
      let L = links.get(canon);
      if (!L) {
        L = {
          a: gkIn < gkOut ? gkIn : gkOut,
          b: gkIn < gkOut ? gkOut : gkIn,
          sign,
          shared: new Set(),
        };
        links.set(canon, L);
      }
      L.shared.add(p.routeIdx);
    }
  }

  // Adjacency over groups.
  const adjacency = new Map(); // gk -> [{ neighbor, sign, shared }]
  function addAdj(gk, entry) {
    let arr = adjacency.get(gk);
    if (!arr) { arr = []; adjacency.set(gk, arr); }
    arr.push(entry);
  }
  for (const L of links.values()) {
    addAdj(L.a, { neighbor: L.b, sign: L.sign, shared: L.shared });
    addAdj(L.b, { neighbor: L.a, sign: L.sign, shared: L.shared });
  }
  // Ensure every group with an ordering appears (isolated ones too).
  for (const gk of orderings.keys()) {
    if (!adjacency.has(gk)) adjacency.set(gk, []);
  }

  // -------------------------------------------------------------------
  // Step 2: connected components.
  // -------------------------------------------------------------------
  const compOf = new Map();
  const components = [];
  for (const gk of adjacency.keys()) {
    if (compOf.has(gk)) continue;
    const idx = components.length;
    const members = [];
    const stack = [gk];
    compOf.set(gk, idx);
    while (stack.length) {
      const cur = stack.pop();
      members.push(cur);
      for (const { neighbor } of (adjacency.get(cur) || [])) {
        if (!compOf.has(neighbor)) {
          compOf.set(neighbor, idx);
          stack.push(neighbor);
        }
      }
    }
    components.push(members);
  }

  function unionSize(gk) {
    const g = network.linkGroups.get(gk);
    return g && g.routeUnion ? g.routeUnion.length : 0;
  }

  // -------------------------------------------------------------------
  // Step 3: BFS tree propagation of shared-suborder constraints.
  //
  // For a tree edge parent → child with sign s and shared set S:
  //   target = parentOrder filtered to S; reversed when s = -1
  //            (stored(gkB) equals stored(gkA) when s = +1, else its
  //             reverse, for the same forward-CW arrangement).
  //   childOrder' = childOrder with the routes of S permuted within
  //                 their existing slot positions to follow `target`.
  // Everything else in the child (its own divergers, singletons, other
  // sub-bundles) keeps its slot.
  // -------------------------------------------------------------------
  function conformChild(childGk, parentGk, sign, shared) {
    const parentOrder = orderings.get(parentGk);
    if (!parentOrder || parentOrder.length < 2) return;
    const childGrp = network.linkGroups.get(childGk);
    const childUnion = childGrp && childGrp.routeUnion ? childGrp.routeUnion : null;
    let childOrder = orderings.get(childGk);
    if (!childOrder) {
      if (!childUnion) return;
      childOrder = childUnion.slice().sort((a, b) => a - b);
    } else {
      childOrder = childOrder.slice();
    }
    const childSet = new Set(childOrder);
    // Effective shared set: co-traversing routes present in BOTH orders.
    const parentSet = new Set(parentOrder);
    const S = new Set();
    for (const r of shared) {
      if (childSet.has(r) && parentSet.has(r)) S.add(r);
    }
    if (S.size < 2) {
      orderings.set(childGk, childOrder);
      return;
    }
    // Target sequence in the child's stored frame.
    let target = parentOrder.filter(r => S.has(r));
    if (sign === -1) target = target.reverse();
    // Rewrite the child's shared slots in target order.
    let k = 0;
    for (let i = 0; i < childOrder.length; i++) {
      if (S.has(childOrder[i])) childOrder[i] = target[k++];
    }
    orderings.set(childGk, childOrder);
  }

  for (const members of components) {
    if (members.length < 2) continue;
    // Root: largest routeUnion, tie-break by groupKey for determinism.
    let root = members[0];
    for (const gk of members) {
      const d = unionSize(gk) - unionSize(root);
      if (d > 0 || (d === 0 && gk < root)) root = gk;
    }
    // BFS from root; conform each child to its tree parent.
    const visited = new Set([root]);
    const queue = [root];
    while (queue.length) {
      const parent = queue.shift();
      const nbrs = (adjacency.get(parent) || [])
        .slice()
        // Deterministic child order: bigger groups first, then key —
        // so the most constrained neighbors inherit directly from the
        // closest-to-root authority.
        .sort((x, y) => {
          const d = unionSize(y.neighbor) - unionSize(x.neighbor);
          if (d !== 0) return d;
          return x.neighbor < y.neighbor ? -1 : x.neighbor > y.neighbor ? 1 : 0;
        });
      for (const { neighbor, sign, shared } of nbrs) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        conformChild(neighbor, parent, sign, shared);
        queue.push(neighbor);
      }
    }
  }

  return orderings;
}
)}

function _optimizeIndex(makeParallel,arrangeCrossings,enforceParallelChainConsistency){return(
function optimizeIndex(network, classified) {
  const MAX_ITERS = 8;
  const SPACING = 1; // unitless layout slots; ordering + rank only

  function orderingsEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.size !== b.size) return false;
    for (const [k, v] of a) {
      const w = b.get(k);
      if (!w || w.length !== v.length) return false;
      for (let i = 0; i < v.length; i++) if (v[i] !== w[i]) return false;
    }
    return true;
  }

  function slotOffset(k, n, areaSide) {
    if (areaSide === +1) return +k;
    if (areaSide === -1) return k - (n - 1);
    return k - (n - 1) / 2;
  }

  // Write per-group layouts to network.edges.bundleOffsetByRoute.
  //
  //   compact = false — group-global slots (each route keeps one slot
  //     across the whole group). Used during iterations so makeParallel
  //     sees stable ranks when seeding.
  //   compact = true — per-edge contiguous slots in the group's order
  //     (the gap fix). Used once, at the end.
  function applyOrderingsToNetwork(orderings, compact) {
    const linkGroups = network.linkGroups;
    if (!linkGroups || !orderings || orderings.size === 0) return;
    for (const [gk, ord] of orderings) {
      const group = linkGroups.get(gk);
      if (!group) continue;
      const inGroup = new Set(group.routeUnion);
      const filtered = (Array.isArray(ord) ? ord : []).filter(r => inGroup.has(r));
      for (const r of group.routeUnion) if (!filtered.includes(r)) filtered.push(r);

      if (!compact) {
        const n = filtered.length;
        const layout = new Map();
        for (let k = 0; k < n; k++) {
          layout.set(filtered[k], slotOffset(k, n, group.areaSide) * SPACING);
        }
        for (const ek of group.edgeKeys) {
          const e = network.edges.get(ek);
          if (!e) continue;
          e.bundleOffsetByRoute = new Map();
          for (const ri of e.routeIdxs) {
            if (layout.has(ri)) e.bundleOffsetByRoute.set(ri, layout.get(ri));
          }
        }
      } else {
        // Per-edge compaction: same relative order, contiguous slots.
        for (const ek of group.edgeKeys) {
          const e = network.edges.get(ek);
          if (!e) continue;
          const onEdge = new Set(e.routeIdxs);
          const seq = filtered.filter(r => onEdge.has(r));
          const n = seq.length;
          e.bundleOffsetByRoute = new Map();
          for (let k = 0; k < n; k++) {
            e.bundleOffsetByRoute.set(seq[k], slotOffset(k, n, group.areaSide) * SPACING);
          }
        }
      }
    }
  }

  // --- Iterate makeParallel + arrangeCrossings to a fixed point ---
  let orderings = null;
  for (let iter = 0; iter < MAX_ITERS; iter++) {
    const parallelOut = makeParallel(network, classified);
    const next = arrangeCrossings(network, classified, parallelOut);
    if (orderingsEqual(orderings, next)) { orderings = next; break; }
    orderings = next;
    applyOrderingsToNetwork(orderings, false);
  }
  if (!orderings) orderings = new Map();

  // --- Global parallel-chain consistency pass ---
  // Guarantees a single forward-CW arrangement along every maximal
  // parallel chain (no crossings between shared waypoints). Idempotent.
  enforceParallelChainConsistency(network, classified, orderings);

  // --- Final application: gap-free per-edge offsets ---
  applyOrderingsToNetwork(orderings, true);

  return orderings;
}
)}

function _alignRoutes(){return(
function alignRoutes(network, classified, orderings, configNavMesh) {
  const SPACING = configNavMesh.bundle.spacing;
  const out = new Map();

  function edgeKey(a, b) { return a < b ? a + "||" + b : b + "||" + a; }

  function offsetForRouteOnEdge(e, routeIdx) {
    if (!e || !e.bundleOffsetByRoute) return null;
    const v = e.bundleOffsetByRoute.get(routeIdx);
    return v == null ? null : v;
  }

  function getClassifiedNode(nodeId) {
    if (!classified) return null;
    if (classified.nodes instanceof Map) return classified.nodes.get(nodeId);
    if (Array.isArray(classified.nodes)) return classified.nodes.find(n => n.id === nodeId) || null;
    if (classified instanceof Map) return classified.get(nodeId);
    return classified[nodeId] || null;
  }

  // Edge spokes incident to each node.
  const edgeSpokesAtNode = new Map();
  for (const [, e] of network.edges) {
    if (e.spokeType !== "edge") continue;
    if (!edgeSpokesAtNode.has(e.a)) edgeSpokesAtNode.set(e.a, []);
    if (!edgeSpokesAtNode.has(e.b)) edgeSpokesAtNode.set(e.b, []);
    edgeSpokesAtNode.get(e.a).push(e);
    edgeSpokesAtNode.get(e.b).push(e);
  }

  function edgeMaxOffsetAt(e) {
    let maxAbs = 0, signOf = +1;
    if (!e.bundleOffsetByRoute) return { maxAbs, signOf };
    for (const off of e.bundleOffsetByRoute.values()) {
      if (off == null) continue;
      const a = Math.abs(off);
      if (a > maxAbs) {
        maxAbs = a;
        signOf = off >= 0 ? +1 : -1;
      }
    }
    return { maxAbs, signOf };
  }

  function applyEaShift(areaSeg, edgeSeg, J, areaOtherId) {
    const segKey = edgeKey(areaOtherId, J.id);
    const outKey = segKey + "@" + J.id;
    if (out.has(outKey)) return;

    const paX = areaSeg.bundlePerpX, paY = areaSeg.bundlePerpY;
    const peX = edgeSeg.bundlePerpX, peY = edgeSeg.bundlePerpY;
    const dot = peX * paX + peY * paY;
    if (Math.abs(dot) < 1e-9) return;
    const sign = dot >= 0 ? +1 : -1;

    const shiftByRoute = new Map();
    for (const r of (areaSeg.routeIdxs || [])) {
      const oNon  = offsetForRouteOnEdge(areaSeg, r);
      const oEdge = offsetForRouteOnEdge(edgeSeg, r);
      if (oNon == null || oEdge == null) continue;
      const target = oEdge * sign;
      const t = (target - oNon) * SPACING;
      shiftByRoute.set(r, { x: t * paX, y: t * paY });
    }
    out.set(outKey, { segmentKey: segKey, jNodeId: J.id, shiftByRoute });
  }

  // Identical recipe to applyEaShift but the LINK side is the one
  // that shifts. The edge cluster stays anchored at the coastline;
  // each route's link-side offset is biased to equal its edge-side
  // offset (in the edge frame, sign-corrected through the perp dot).
  function applyElShift(linkSeg, edgeSeg, J, linkOtherId) {
    const segKey = edgeKey(linkOtherId, J.id);
    const outKey = segKey + "@" + J.id;
    if (out.has(outKey)) return;

    const plX = linkSeg.bundlePerpX, plY = linkSeg.bundlePerpY;
    const peX = edgeSeg.bundlePerpX, peY = edgeSeg.bundlePerpY;
    const dot = peX * plX + peY * plY;
    if (Math.abs(dot) < 1e-9) return;
    const sign = dot >= 0 ? +1 : -1;

    const shiftByRoute = new Map();
    for (const r of (linkSeg.routeIdxs || [])) {
      const oLink = offsetForRouteOnEdge(linkSeg, r);
      const oEdge = offsetForRouteOnEdge(edgeSeg, r);
      if (oLink == null || oEdge == null) continue;
      const target = oEdge * sign;
      const t = (target - oLink) * SPACING;
      shiftByRoute.set(r, { x: t * plX, y: t * plY });
    }
    out.set(outKey, { segmentKey: segKey, jNodeId: J.id, shiftByRoute });
  }

  // Common aa shift writer. startOffset is the offset (in stored
  // bundle units) given to the rank-0 route; subsequent routes get
  // startOffset + 1, startOffset + 2, .... Multiplied by areaSign
  // to flip onto the into-area side of bundlePerp_area. Returns
  // true if applied.
  function applyAaShiftWithDir(areaSeg, J, areaOtherId, areaSign, startOffset) {
    const segKey = edgeKey(areaOtherId, J.id);
    const outKey = segKey + "@" + J.id;
    if (out.has(outKey)) return false;

    const paX = areaSeg.bundlePerpX, paY = areaSeg.bundlePerpY;

    const entries = (areaSeg.routeIdxs || [])
      .map(r => [r, offsetForRouteOnEdge(areaSeg, r)])
      .filter(([, o]) => o != null);
    entries.sort((x, y) => (x[1] * areaSign) - (y[1] * areaSign));

    const shiftByRoute = new Map();
    entries.forEach(([r, oNon], k) => {
      const target = (startOffset + k) * areaSign;
      const t = (target - oNon) * SPACING;
      shiftByRoute.set(r, { x: t * paX, y: t * paY });
    });
    out.set(outKey, { segmentKey: segKey, jNodeId: J.id, shiftByRoute });
    return true;
  }

  // aa-with-edges: derive intoAreaAtJ from the edge spokes at J.
  function applyAaShiftFromEdges(areaSeg, J, areaOtherId) {
    const edgesAtJ = edgeSpokesAtNode.get(J.id);
    if (!edgesAtJ || edgesAtJ.length === 0) return false;

    let iaX = 0, iaY = 0, maxEdgeIdx = 0;
    for (const e of edgesAtJ) {
      const { maxAbs, signOf } = edgeMaxOffsetAt(e);
      if (maxAbs > maxEdgeIdx) maxEdgeIdx = maxAbs;
      iaX += e.bundlePerpX * signOf;
      iaY += e.bundlePerpY * signOf;
    }
    if (Math.hypot(iaX, iaY) < 1e-9) return false;
    const paX = areaSeg.bundlePerpX, paY = areaSeg.bundlePerpY;
    const projAreaIntoArea = paX * iaX + paY * iaY;
    if (Math.abs(projAreaIntoArea) < 1e-9) return false;
    const areaSign = projAreaIntoArea >= 0 ? +1 : -1;
    // Edge cluster occupies offsets 0..maxEdgeIdx on the area side
    // already; area cluster starts one past that to keep them
    // visually adjacent without overlap.
    return applyAaShiftWithDir(areaSeg, J, areaOtherId, areaSign, maxEdgeIdx + 1); // changed for curved lines
  }

  // aa type-2 (pure-area parallel): no edges at J. Derive
  // intoAreaAtJ from the two area spokes' exterior bisector — area
  // wraps around the concave point on the smaller-angle side, so
  // the area bulk is on the larger-angle (exterior bisector) side.
  function applyAaShiftPureType2(areaSeg, J, areaOtherId) {
    const jNode = getClassifiedNode(J.id);
    if (!jNode || jNode.classification !== "parallel") return false;
    if (!jNode.spokes || jNode.spokes.length !== 2) return false;

    // Skip if J has any edge spokes (those go through applyAaShiftFromEdges).
    const edgesAtJ = edgeSpokesAtNode.get(J.id);
    if (edgesAtJ && edgesAtJ.length > 0) return false;

    // Outward unit vectors along the two area spokes from J. Use
    // node positions (the classifier's angle field is the spoke
    // direction from J, but node positions are unambiguous and
    // don't depend on the angle's sign convention).
    const spokeDirs = [];
    for (const s of jNode.spokes) {
      const far = network.nodes.get(s.farId);
      if (!far) continue;
      const dx = far.x - J.x, dy = far.y - J.y;
      const len = Math.hypot(dx, dy);
      if (len < 1e-9) continue;
      spokeDirs.push({ x: dx / len, y: dy / len });
    }
    if (spokeDirs.length !== 2) return false;

    // Exterior bisector = -(s1 + s2). If s1 + s2 ≈ 0 (the spokes are
    // exactly antiparallel — no bend, straight through), the
    // exterior bisector is undefined; skip.
    const sumX = spokeDirs[0].x + spokeDirs[1].x;
    const sumY = spokeDirs[0].y + spokeDirs[1].y;
    const sumLen = Math.hypot(sumX, sumY);
    if (sumLen < 1e-6) return false;
    const iaX = -sumX / sumLen;
    const iaY = -sumY / sumLen;

    const paX = areaSeg.bundlePerpX, paY = areaSeg.bundlePerpY;
    const dot = paX * iaX + paY * iaY;
    if (Math.abs(dot) < 1e-9) return false;
    const areaSign = dot >= 0 ? +1 : -1;
    // No edges to clear at J; rank-0 route sits ON the area spoke
    // (offset 0), the rest step into the area side.
    return applyAaShiftWithDir(areaSeg, J, areaOtherId, areaSign, 0);
  }

  // Gate for the el bias: J must be a parallel junction with exactly
  // two spokes, one of each type, and no third spoke of any kind.
  // Returns true when this is the right place to fire applyElShift.
  function isElGateAt(J, segAJ, segJB) {
    const types = new Set([segAJ.spokeType, segJB.spokeType]);
    if (!(types.has("edge") && types.has("link") && types.size === 2)) return false;
    const jNode = getClassifiedNode(J.id);
    if (!jNode || jNode.classification !== "parallel") return false;
    if (!jNode.spokes || jNode.spokes.length !== 2) return false;
    // (The classifier's parallel classification already implies the
    // two spokes carry the same route set, so we don't need to check
    // route memberships explicitly.)
    return true;
  }

  for (const p of network.paths) {
    const wps = p.waypoints;
    if (!wps || wps.length < 3) continue;
    for (let i = 0; i < wps.length - 2; i++) {
      const A = wps[i], J = wps[i + 1], B = wps[i + 2];
      const segAJ = network.edges.get(edgeKey(A.id, J.id));
      const segJB = network.edges.get(edgeKey(J.id, B.id));
      if (!segAJ || !segJB) continue;

      const ta = segAJ.spokeType, tb = segJB.spokeType;
      if (ta === "area" && tb === "edge") {
        applyEaShift(segAJ, segJB, J, A.id);
      } else if (ta === "edge" && tb === "area") {
        applyEaShift(segJB, segAJ, J, B.id);
      } else if (ta === "area" && tb === "area") {
        // Try edge-anchored aa first; if J has no edge spokes, fall
        // back to pure type-2 (exterior bisector of the two spokes).
        if (!applyAaShiftFromEdges(segAJ, J, A.id)) {
          applyAaShiftPureType2(segAJ, J, A.id);
        }
        if (!applyAaShiftFromEdges(segJB, J, B.id)) {
          applyAaShiftPureType2(segJB, J, B.id);
        }
      } else if (ta === "edge" && tb === "link") {
        // The link is segJB (J → B). Shift it at its J-end.
        if (isElGateAt(J, segAJ, segJB)) {
          applyElShift(segJB, segAJ, J, B.id);
        }
      } else if (ta === "link" && tb === "edge") {
        // The link is segAJ (A → J). Shift it at its J-end.
        if (isElGateAt(J, segAJ, segJB)) {
          applyElShift(segAJ, segJB, J, A.id);
        }
      }
    }
  }

  return out;
}
)}

function _42(md){return(
md`### Create curved segments`
)}

function _buildCurvedCorner(){return(
function(posInW, dirIn, posOutW, dirOut, centerW, jr, maxBackIn, maxFwdOut) {
  if (jr <= 0) return null;

  // Axial reach is jr on both sides.
  const tIn  = jr;
  const sOut = jr;

  // Segment-length caps (preventing curve overshoot past the adjacent
  // waypoint). The caller is responsible for clamping jr against
  // spoke lengths beforehand; these are a final guard.
  const capIn  = (typeof maxBackIn === "number" && isFinite(maxBackIn)) ? maxBackIn : Infinity;
  const capOut = (typeof maxFwdOut === "number" && isFinite(maxFwdOut)) ? maxFwdOut : Infinity;
  if (tIn  > capIn  + 1e-6) return null;
  if (sOut > capOut + 1e-6) return null;

  // Angle between spokes.
  const cosBeta = dirIn.x * dirOut.x + dirIn.y * dirOut.y;
  const beta = Math.acos(Math.max(-1, Math.min(1, cosBeta)));
  if (beta < 1e-3) return null;             // effectively straight
  if (beta > Math.PI - 1e-3) return null;   // ~180° U-turn

  // Offset-line intersection (the "sharp corner"), computed FIRST so
  // the fold test can run before any control points are built.
  let corner = null;
  let tC = 0, vC = 0;
  const det = dirIn.x * dirOut.y - dirIn.y * dirOut.x;
  if (Math.abs(det) >= 1e-6) {
    const rhsX = posOutW.x - posInW.x;
    const rhsY = posOutW.y - posInW.y;
    tC = (rhsX * dirOut.y - rhsY * dirOut.x) / det;
    corner = { x: posInW.x + tC * dirIn.x, y: posInW.y + tC * dirIn.y };
    vC = (corner.x - posOutW.x) * dirOut.x + (corner.y - posOutW.y) * dirOut.y;

    // FOLD TEST: the fillet exists only if P0 (at -jr on the in-rail)
    // clears the corner and P3 (at +jr on the out-rail) clears it on
    // the other side — with a PROPORTIONAL margin. A curve whose
    // endpoints only barely straddle the rails' intersection still
    // produces a slightly folded bezier (a micro-loop the polyline
    // cleanup then trims into a corner-cutting chord), so marginal
    // cases pinch cleanly instead.
    const FOLD_MARGIN = Math.max(1e-6, 0.15 * jr);
    if (jr + tC <= FOLD_MARGIN || jr - vC <= FOLD_MARGIN) {
      return {
        P0: { x: corner.x, y: corner.y },
        P1: { x: corner.x, y: corner.y },
        P2: { x: corner.x, y: corner.y },
        P3: { x: corner.x, y: corner.y },
        corner,
        pinched: true,
      };
    }
  }

  // P0 = posInW backed off by tIn along -dirIn (strand's perpendicular
  // offset preserved). P3 = posOutW forward sOut along +dirOut.
  const P0 = { x: posInW.x  - dirIn.x  * tIn,  y: posInW.y  - dirIn.y  * tIn  };
  const P3 = { x: posOutW.x + dirOut.x * sOut, y: posOutW.y + dirOut.y * sOut };

  // Cubic bezier handle length. Chord-based formula — same as the
  // circular-arc approximation, but valid for any smooth curve
  // between P0 and P3 with the given tangents.
  const chord = Math.hypot(P3.x - P0.x, P3.y - P0.y);
  const cb4 = Math.cos(beta / 4);
  const handleCap = 2 * Math.min(tIn, sOut);
  const h = Math.min(chord / (3 * cb4 * cb4), handleCap);
  const P1 = { x: P0.x + dirIn.x  * h, y: P0.y + dirIn.y  * h };
  const P2 = { x: P3.x - dirOut.x * h, y: P3.y - dirOut.y * h };

  return { P0, P1, P2, P3, corner };
}
)}

function _routeCurvedSegments(buildCurvedCorner){return(
function(wps, posAt, isEndpoint, jrAt) {
  const n = wps.length;
  if (n < 2) return [];

  // Raw drawn endpoints for each segment (with offset + shift applied):
  //   segEnd[i] = { atA, atB } where atA = pos at wp[i] on segment i,
  //   atB = pos at wp[i+1] on segment i.
  const segEnd = new Array(n - 1);
  for (let i = 0; i < n - 1; i++) {
    segEnd[i] = { atA: posAt(i, i + 1), atB: posAt(i + 1, i) };
  }

  // Build a curve at each interior waypoint wp[i] (1 ≤ i ≤ n-2),
  // using the un-offset wp[i] as the arc center.
  const curveAt = new Array(n);
  for (let i = 1; i < n - 1; i++) {
    if (isEndpoint(wps[i])) { curveAt[i] = null; continue; }

    const jrHere = jrAt(wps[i]);
    if (!(jrHere > 0)) { curveAt[i] = null; continue; }

    const inA     = segEnd[i - 1].atA; // far end of in-segment (wp[i-1] side)
    const posInW  = segEnd[i - 1].atB; // near end of in-segment (wp[i] side)
    const posOutW = segEnd[i].atA;     // near end of out-segment (wp[i] side)
    const outB    = segEnd[i].atB;     // far end of out-segment (wp[i+1] side)

    // Direction along segment (i-1, i) pointing TOWARD wp[i].
    let dx = posInW.x - inA.x, dy = posInW.y - inA.y;
    let segInLen = Math.hypot(dx, dy);
    if (segInLen < 1e-9) { curveAt[i] = null; continue; }
    const dirIn = { x: dx / segInLen, y: dy / segInLen };

    // Direction along segment (i, i+1) pointing AWAY from wp[i].
    dx = outB.x - posOutW.x; dy = outB.y - posOutW.y;
    let segOutLen = Math.hypot(dx, dy);
    if (segOutLen < 1e-9) { curveAt[i] = null; continue; }
    const dirOut = { x: dx / segOutLen, y: dy / segOutLen };

    // Safety caps: curve never extends past the far waypoint of the
    // adjacent segment. (The caller is responsible for clamping jr
    // against spoke lengths to prevent adjacent curves on a shared
    // segment from overlapping; these caps are just a final guard
    // against off-by-a-shift edge cases.)
    curveAt[i] = buildCurvedCorner(
      posInW, dirIn, posOutW, dirOut,
      { x: wps[i].x, y: wps[i].y }, // un-offset junction center
      jrHere, segInLen, segOutLen
    );
  }

  // Emit pieces. For each segment i:
  //   start  = curve at wp[i].P3   (if curveAt[i] exists) else segEnd[i].atA
  //   end    = curve at wp[i+1].P0 (if curveAt[i+1] exists) else segEnd[i].atB
  // Emit the line piece, then if curveAt[i+1] exists and i+1 is interior,
  // emit the curve piece tagged with the OUTGOING segment (i+1).
  const out = [];
  for (let i = 0; i < n - 1; i++) {
    const cIn  = curveAt[i];     // curve at wp[i]
    const cOut = curveAt[i + 1]; // curve at wp[i+1]
    const start = cIn  ? cIn.P3  : segEnd[i].atA;
    const end   = cOut ? cOut.P0 : segEnd[i].atB;
    out.push({
      kind: "line",
      segIdx: i,
      x1: start.x, y1: start.y,
      x2: end.x,   y2: end.y,
    });
    if (cOut) {
      out.push({
        kind: "curve",
        segIdx: i + 1,
        wpIndex: i + 1,
        x1: cOut.P0.x, y1: cOut.P0.y,
        c1x: cOut.P1.x, c1y: cOut.P1.y,
        c2x: cOut.P2.x, c2y: cOut.P2.y,
        x2: cOut.P3.x, y2: cOut.P3.y,
      });
    }
  }
  return out;
}
)}

function _configNavMesh(d3){return(
{
  navMesh: {
    pointFill:           "rgba(0, 0, 0, 0.15)",
    virtualPointFill:    "#fafafa",
    virtualPointStroke:  "rgba(0, 0, 0, 0.15)",
    virtualPointStrokeWidth: 1.5,
    linkStroke:          "rgba(0, 0, 0, 0.15)",
    linkStrokeWidth:     1,
    polygonFill:         "rgba(0, 0, 0, 0.05)",
    bisectorStroke:      "rgba(0, 0, 0, 0.15)",
    bisectorStrokeWidth: 1.5,
    disabledMarkerStroke: "#000",
    disabledMarkerStrokeWidth: 2,
    routePointStroke:    "#fff",
    routePointStrokeWidth: 1,
  },

  route: {
    strokeWidth: 4,
    junctionRadius: 40
  },

  palette: {
    routeColors: (typeof d3 !== "undefined" && d3.schemeObservable10)
      ? d3.schemeObservable10.filter(c =>
          c.toLowerCase() !== "#4269d0" &&
          c.toLowerCase() !== "#97bbf5"
        )
      : ["#4269d0","#efb118","#ff725c","#6cc5b0","#3ca951","#ff8ab7","#a463f2","#97bbf5","#9c6b4e","#9498a0"],

    spokes: {
      link: "#b36db0",
      edge: "#efb118",
      area: "#29cce2",
    },

    junctionPairs: {
      aa: "#29cce2",
      ee: "#efb118",
      ll: "#b36db0",
      ae: "#3ca951",
      al: "#4269d0",
      el: "#ff725c",
    },
  },

  junction: {
    baseRadius:     4,
    perRouteBump:   2,
    hitRadiusPadding: 2,
    decisionStroke:        "#e0162b",
    decisionStrokeWidth:   2,
    parallelStroke:        "#000",
    parallelStrokeWidth:   1,
  },

  bundle: {
    strandWidth: 4,
    spacing:     6,
  },
}
)}

function _chartNavMesh(d3,configNavMesh,geometry,pathfinding,alignRoutes,routeCurvedSegments,buildNavMesh,combinedPathNetwork,classifyPathNodes,optimizeIndex,invalidation)
{
  const initialState = {
  points: [
    { id: 0, x: 85.1, y: 254.5 },
    { id: 1, x: 220.1, y: 484.5 },
    { id: 2, x: 364.1, y: 243.5 },
    { id: 3, x: 487.1, y: 516.5 },
    { id: 4, x: 619.1, y: 237.5 },
    { id: 5, x: 796.1, y: 350.5 },
    { id: 6, x: 612.1, y: 75.5 },
    { id: 7, x: 485.1, y: 351.5 },
    { id: 8, x: 364.1, y: 72.5 },
    { id: 9, x: 213.1, y: 369.5 }
  ],
  links: [
    { id: 0, a: 0, b: 1 },
    { id: 1, a: 1, b: 2 },
    { id: 2, a: 2, b: 3 },
    { id: 3, a: 3, b: 4 },
    { id: 4, a: 4, b: 5 },
    { id: 5, a: 5, b: 6 },
    { id: 6, a: 6, b: 7 },
    { id: 7, a: 7, b: 8 },
    { id: 8, a: 8, b: 9 },
    { id: 9, a: 9, b: 0 }
  ],
  disabledFaceKeys: [],
  routes: [
    { id: 0, color: "#efb118", start: { x: 853.1, y: 384.5 }, end: { x: 46.1, y: 150.5 } },
    { id: 1, color: "#ff725c", start: { x: 28.1, y: 209.5 }, end: { x: 865.1, y: 464.5 } },
    { id: 2, color: "#6cc5b0", start: { x: 859.1, y: 357.5 }, end: { x: 13.1, y: 243.5 } },
    { id: 3, color: "#3ca951", start: { x: 553.1, y: 154.5 }, end: { x: 449.1, y: 164.5 } },
    { id: 4, color: "#ff8ab7", start: { x: 526.1, y: 192.5 }, end: { x: 466.1, y: 229.5 } }
  ]
}

  const width = 900;
  const height = 600;

  const container = d3.create("div")
    .style("font", "13px -apple-system, BlinkMacSystemFont, sans-serif")
    .style("font-family", "ui-monospace, 'SF Mono', Menlo, monospace")
    .style("position", "relative");

  const controls = container.append("div")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "space-between")
    .style("gap", "8px")
    .style("width", width + "px")
    .style("box-sizing", "border-box")
    .style("margin-bottom", "8px")
    .style("font-size", "12px")
    .style("color", "#555");

  const leftGroup = controls.append("div")
    .style("display", "flex").style("align-items", "center").style("gap", "8px");
  const btnStyle =
    "padding:4px 10px;font:inherit;font-size:12px;cursor:pointer;" +
    "border:1px solid #888;background:#fff;border-radius:4px;";
  const saveBtn  = leftGroup.append("button").attr("style", btnStyle).text("save state");
  const clearBtn = leftGroup.append("button").attr("style", btnStyle).text("clear");
  const toolbarStatus = leftGroup.append("span");

  const rightGroup = controls.append("div")
    .style("display", "flex").style("align-items", "center").style("gap", "12px");

  const labelStyle =
    "display:inline-flex;align-items:center;gap:4px;cursor:pointer;user-select:none;";

  const colorLabel = rightGroup.append("label").attr("style", labelStyle);
  colorLabel.append("span").text("color");
  const colorSelect = colorLabel.append("select")
    .attr("class", "color-mode")
    .style("font", "inherit").style("font-size", "12px").style("padding", "2px 4px");
  colorSelect.append("option").attr("value", "paths").text("paths");
  colorSelect.append("option").attr("value", "spokes").text("spokes");
  colorSelect.append("option").attr("value", "junctions").text("junctions");

  // Junction radius for curved corners — sourced directly from config.
  const jr = configNavMesh.route.junctionRadius;

  const modeName = "navmesh-mode-" + Math.random().toString(36).slice(2);
  const navLabel = rightGroup.append("label").attr("style", labelStyle)
    .style("margin-left", "38px");
  navLabel.append("input")
    .attr("type", "radio").attr("name", modeName)
    .attr("value", "navmesh").property("checked", true).style("margin", "0");
  navLabel.append("span").text("Nav mesh");
  const routesLabel = rightGroup.append("label").attr("style", labelStyle);
  routesLabel.append("input")
    .attr("type", "radio").attr("name", modeName)
    .attr("value", "routes").style("margin", "0");
  routesLabel.append("span").text("Routes");

  const svg = container.append("svg")
    .attr("width", width).attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("border", "1px solid #ccc").style("background", "#fafafa").style("display", "block");

  const junctionStatus = container.append("div")
    .style("width", width + "px").style("box-sizing", "border-box")
    .style("margin-top", "8px").style("padding", "6px 8px")
    .style("font-size", "12px").style("font-variant-numeric", "tabular-nums")
    .style("color", "#333").style("min-height", "80px")
    .style("border", "1px solid #ddd").style("background", "#fff").style("border-radius", "3px");

  svg.append("style").text(`
    .point { fill: ${configNavMesh.navMesh.pointFill}; cursor: pointer; }
    .point.virtual { fill: ${configNavMesh.navMesh.virtualPointFill}; stroke: ${configNavMesh.navMesh.virtualPointStroke}; stroke-width: ${configNavMesh.navMesh.virtualPointStrokeWidth}; cursor: default; }
    .link { stroke: ${configNavMesh.navMesh.linkStroke}; stroke-width: ${configNavMesh.navMesh.linkStrokeWidth}; fill: none; cursor: pointer; }
    .link.interior { stroke-dasharray: 4 4; }
    .polygon { fill: ${configNavMesh.navMesh.polygonFill}; stroke: none; pointer-events: none; }
    .bisector { stroke: ${configNavMesh.navMesh.bisectorStroke}; stroke-width: ${configNavMesh.navMesh.bisectorStrokeWidth}; fill: none; pointer-events: none; }
    .pending-line { stroke-dasharray: 4 4; fill: none; pointer-events: none; }
    .route { stroke-width: ${configNavMesh.route.strokeWidth}; fill: none; cursor: pointer; }
    .route-point { cursor: pointer; stroke: ${configNavMesh.navMesh.routePointStroke}; stroke-width: ${configNavMesh.navMesh.routePointStrokeWidth}; }
    .disabled-marker { cursor: pointer; }
    .disabled-marker-hit { fill: transparent; }
    .disabled-marker-x { fill: none; stroke: ${configNavMesh.navMesh.disabledMarkerStroke}; stroke-width: ${configNavMesh.navMesh.disabledMarkerStrokeWidth}; stroke-linecap: round; pointer-events: none; }
    .junction-marker { fill: none; pointer-events: none; }
    .junction-marker.decision { stroke: ${configNavMesh.junction.decisionStroke}; }
    .junction-marker.parallel { stroke: ${configNavMesh.junction.parallelStroke}; }
    .junction-hit { fill: transparent; stroke: none; pointer-events: all; cursor: pointer; }
  `);

  // ---- State ----
  const ROUTE_PALETTE = configNavMesh.palette.routeColors;

  let mode = "navmesh";
  let pointIdCounter = 0, linkIdCounter = 0, routeIdCounter = 0;
  const points = [], links = [], routes = [];
  const disabledFaces = new Set();
  let pendingLink = null, pendingRoute = null, routeDrag = null;
  let suppressNextClick = false;
  let pathColorMode = "paths";
  let optimizedOrderings = new Map();
  let mousePos = null, mesh = null;

  if (initialState && typeof initialState === "object") {
    if (Array.isArray(initialState.points)) {
      for (const p of initialState.points) {
        if (p == null) continue;
        points.push({ id: +p.id, x: +p.x, y: +p.y });
        if (+p.id + 1 > pointIdCounter) pointIdCounter = +p.id + 1;
      }
    }
    if (Array.isArray(initialState.links)) {
      for (const l of initialState.links) {
        if (l == null) continue;
        links.push({ id: +l.id, a: +l.a, b: +l.b });
        if (+l.id + 1 > linkIdCounter) linkIdCounter = +l.id + 1;
      }
    }
    if (Array.isArray(initialState.disabledFaceKeys)) {
      for (const k of initialState.disabledFaceKeys) disabledFaces.add(k);
    }
    if (Array.isArray(initialState.routes)) {
      for (const r of initialState.routes) {
        if (r == null || !r.start || !r.end) continue;
        const id = +r.id;
        routes.push({
          id, color: r.color || ROUTE_PALETTE[id % ROUTE_PALETTE.length],
          start: { x: +r.start.x, y: +r.start.y },
          end:   { x: +r.end.x,   y: +r.end.y },
        });
        if (id + 1 > routeIdCounter) routeIdCounter = id + 1;
      }
    }
  }

  const DRAG_THRESHOLD = 3;

  // ---- Layers ----
  const polyLayer = svg.append("g").attr("class", "polygons");
  const bisectorLayer = svg.append("g").attr("class", "bisectors");
  const linkLayer = svg.append("g").attr("class", "links");
  const routeLayer = svg.append("g").attr("class", "routes");
  const pendingLayer = svg.append("g").attr("class", "pending");
  const junctionLayer = svg.append("g").attr("class", "junctions");
  const virtualPointLayer = svg.append("g").attr("class", "virtual-points");
  const disabledMarkerLayer = svg.append("g").attr("class", "disabled-markers");
  const pointLayer = svg.append("g").attr("class", "points");
  const routePointLayer = svg.append("g").attr("class", "route-points");

  // ---- Event handlers ----
  svg.on("mousemove", function (event) {
    mousePos = d3.pointer(event, svg.node());
    if (mode === "routes" && routeDrag && !routeDrag.moved) {
      const dx = mousePos[0] - routeDrag.downX;
      const dy = mousePos[1] - routeDrag.downY;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        routeDrag.moved = true;
        pendingRoute = { id: routeDrag.id, color: routeDrag.color, start: routeDrag.start };
      }
    }
    if (pendingLink || pendingRoute) renderPending();
  });

  svg.on("contextmenu", function (event) {
    event.preventDefault();
    if (mode === "navmesh" && pendingLink) { pendingLink = null; renderAll(); return; }
    if (mode === "routes" && pendingRoute) {
      if (pendingRoute.id === routeIdCounter - 1) routeIdCounter--;
      pendingRoute = null; routeDrag = null; renderAll(); return;
    }
    const [x, y] = d3.pointer(event, svg.node());
    const face = fillableFaceAt(x, y);
    if (face) { disabledFaces.add(face.stableKey); renderAll(); }
  });

  svg.on("mousedown", function (event) {
    if (mode !== "routes") return;
    if (event.target !== svg.node()) return;
    if (event.button !== 0) return;
    const [x, y] = d3.pointer(event, svg.node());
    if (pendingRoute) return;
    const id = routeIdCounter++;
    routeDrag = { id, color: ROUTE_PALETTE[id % ROUTE_PALETTE.length],
      start: { x, y }, downX: x, downY: y, moved: false };
  });

  function handleMouseUp(event) {
    if (mode !== "routes" || !routeDrag) return;
    if (routeDrag.moved) {
      const end = mousePos ? { x: mousePos[0], y: mousePos[1] }
                           : { x: routeDrag.start.x, y: routeDrag.start.y };
      routes.push({ id: routeDrag.id, color: routeDrag.color, start: routeDrag.start, end });
      pendingRoute = null; routeDrag = null; suppressNextClick = true; renderAll();
    } else { routeDrag = null; }
  }
  window.addEventListener("mouseup", handleMouseUp);

  svg.on("click", function (event) {
    if (suppressNextClick) { suppressNextClick = false; return; }
    if (event.target !== svg.node()) return;
    const [x, y] = d3.pointer(event, svg.node());
    if (mode === "navmesh") {
      const id = addPoint(x, y);
      if (pendingLink) {
        const a = pendingLink.startId;
        if (a !== id && !linkExists(a, id)) links.push({ id: linkIdCounter++, a, b: id });
      }
      pendingLink = { startId: id };
      renderAll(); return;
    }
    if (mode === "routes") {
      if (!pendingRoute) {
        const id = routeIdCounter++;
        pendingRoute = { id, color: ROUTE_PALETTE[id % ROUTE_PALETTE.length], start: { x, y } };
      } else {
        routes.push({ id: pendingRoute.id, color: pendingRoute.color,
          start: pendingRoute.start, end: { x, y } });
        pendingRoute = null;
      }
      renderAll();
    }
  });

  container.node().addEventListener("change", function (ev) {
    if (!ev.target) return;
    const tag = ev.target.tagName;
    if (tag !== "INPUT" && tag !== "SELECT") return;
    if (ev.target.type === "radio") {
      mode = ev.target.value;
      pendingLink = null;
      if (pendingRoute && pendingRoute.id === routeIdCounter - 1) routeIdCounter--;
      pendingRoute = null;
      if (routeDrag && routeDrag.id === routeIdCounter - 1) routeIdCounter--;
      routeDrag = null;
      renderAll();
    } else if (ev.target.tagName === "SELECT" && ev.target.classList.contains("color-mode")) {
      pathColorMode = ev.target.value;
      renderAll();
    }
  });

  // ---- State helpers ----
  function addPoint(x, y) {
    const id = pointIdCounter++; points.push({ id, x, y }); return id;
  }
  function removePoint(id) {
    const idx = points.findIndex(p => p.id === id);
    if (idx === -1) return;
    points.splice(idx, 1);
    for (let i = links.length - 1; i >= 0; i--) {
      if (links[i].a === id || links[i].b === id) links.splice(i, 1);
    }
    if (pendingLink && pendingLink.startId === id) pendingLink = null;
  }
  function pointById(id) { return points.find(p => p.id === id); }
  function linkExists(a, b) {
    return links.some(l => (l.a === a && l.b === b) || (l.a === b && l.b === a));
  }

  function fillableFaceAt(x, y) {
    if (!mesh) return null;
    let bestIdx = -1, bestDepth = -1;
    for (let i = 0; i < mesh.faces.length; i++) {
      const f = mesh.faces[i];
      if (!geometry.pointInRing(x, y, mesh.ringToXY(f.ring))) continue;
      if (f.depth > bestDepth) { bestDepth = f.depth; bestIdx = i; }
    }
    if (bestIdx === -1) return null;
    const f = mesh.faces[bestIdx];
    return (f.isArea && !f.disabled) ? f : null;
  }

  // ---- Render helpers ----
  function dataJoin(parent, tag, cls, data, dataKey, init, update) {
    const sel = parent.selectAll(tag + "." + cls).data(data, dataKey);
    const entered = sel.enter().append(tag).attr("class", cls);
    if (init) init(entered);
    const merged = entered.merge(sel);
    if (update) update(merged);
    sel.exit().remove();
    return merged;
  }

  function ringPath(ringIds) {
    const pts = ringIds.map(id => mesh.dPointById(id)).filter(Boolean);
    if (pts.length < 3) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`;
    return d + " Z";
  }
  function clusterPath(rings) { return rings.map(ringPath).filter(Boolean).join(" "); }
  function linkLineCoords(l) {
    const pa = mesh.dPointById(l.a), pb = mesh.dPointById(l.b);
    if (!pa || !pb) return null;
    return { x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y };
  }
  function routePath(route) {
    const pts = pathfinding.routeWaypoints(route.start, route.end, mesh);
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`;
    return d;
  }

  const BISECTOR_LEN = 30;
  function polygonCornerBisectors() {
    const segs = [], seen = new Set();
    const PROBE = 1.0;
    mesh.faces.forEach((f, faceIdx) => {
      const ring = f.ring, n = ring.length;
      for (let i = 0; i < n; i++) {
        const v = mesh.dPointById(ring[i]);
        const prev = mesh.dPointById(ring[(i - 1 + n) % n]);
        const next = mesh.dPointById(ring[(i + 1) % n]);
        if (!v || !prev || !next) continue;
        const ax = prev.x - v.x, ay = prev.y - v.y;
        const bx = next.x - v.x, by = next.y - v.y;
        const aL = Math.hypot(ax, ay) || 1;
        const bL = Math.hypot(bx, by) || 1;
        let cx = ax / aL + bx / bL, cy = ay / aL + by / bL;
        let cL = Math.hypot(cx, cy);
        if (cL < 1e-6) { cx = -ay / aL; cy = ax / aL; cL = 1; }
        cx /= cL; cy /= cL;
        const in1 = mesh.pointInsideAnyFace(v.x + cx * PROBE, v.y + cy * PROBE);
        const in2 = mesh.pointInsideAnyFace(v.x - cx * PROBE, v.y - cy * PROBE);
        let dirX, dirY;
        if (in1 && !in2) { dirX = cx; dirY = cy; }
        else if (in2 && !in1) { dirX = -cx; dirY = -cy; }
        else continue;
        const key = "face|" + faceIdx + "|" + ring[i];
        if (seen.has(key)) continue;
        seen.add(key);
        segs.push({ key, x1: v.x, y1: v.y,
          x2: v.x + dirX * BISECTOR_LEN, y2: v.y + dirY * BISECTOR_LEN });
      }
    });
    return segs;
  }
  function junctionBisectors() {
    const polygonPointIds = new Set();
    mesh.faces.forEach(f => f.ring.forEach(pid => polygonPointIds.add(pid)));
    const adjByPoint = new Map();
    mesh.derivedLinks.forEach(l => {
      const a = mesh.dPointById(l.a), b = mesh.dPointById(l.b);
      if (!a || !b) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      if (!adjByPoint.has(l.a)) adjByPoint.set(l.a, []);
      adjByPoint.get(l.a).push({ x: ux, y: uy });
      if (!adjByPoint.has(l.b)) adjByPoint.set(l.b, []);
      adjByPoint.get(l.b).push({ x: -ux, y: -uy });
    });
    const segs = [], HALF = BISECTOR_LEN / 2;
    adjByPoint.forEach((dirs, pid) => {
      if (polygonPointIds.has(pid)) return;
      const p = mesh.dPointById(pid);
      if (!p || dirs.length < 2) return;
      const angles = dirs.map(d => Math.atan2(d.y, d.x)).sort((a, b) => a - b);
      if (dirs.length === 2) {
        const mid = (angles[0] + angles[1]) / 2;
        const ux = Math.cos(mid), uy = Math.sin(mid);
        segs.push({ key: "pt|" + pid,
          x1: p.x - ux * HALF, y1: p.y - uy * HALF,
          x2: p.x + ux * HALF, y2: p.y + uy * HALF });
      } else {
        for (let i = 0; i < angles.length; i++) {
          const a1 = angles[i], a2 = angles[(i + 1) % angles.length];
          let span = a2 - a1; if (span < 0) span += Math.PI * 2;
          const mid = a1 + span / 2;
          const ux = Math.cos(mid), uy = Math.sin(mid);
          segs.push({ key: "pt|" + pid + "|" + i,
            x1: p.x, y1: p.y,
            x2: p.x + ux * BISECTOR_LEN, y2: p.y + uy * BISECTOR_LEN });
        }
      }
    });
    return segs;
  }

  // ---- Renderers ----
  function renderPolygons() {
    const drawable = mesh.clusters.filter(c => c.rings.length > 0);
    dataJoin(polyLayer, "path", "polygon", drawable, d => d.key,
      sel => sel.attr("fill-rule", "evenodd"),
      sel => sel.attr("d", d => clusterPath(d.rings)));
  }
  function renderBisectors() {
    const segs = [...polygonCornerBisectors(), ...junctionBisectors()];
    dataJoin(bisectorLayer, "line", "bisector", segs, d => d.key, null,
      sel => sel.attr("x1", d => d.x1).attr("y1", d => d.y1)
        .attr("x2", d => d.x2).attr("y2", d => d.y2));
  }
  function renderLinks() {
    dataJoin(linkLayer, "line", "link", mesh.derivedLinks, d => d.id,
      sel => sel.on("dblclick", function (event, d) {
        event.stopPropagation();
        if (mode !== "navmesh") return;
        const idx = links.findIndex(l => l.id === d.sourceLinkId);
        if (idx !== -1) links.splice(idx, 1);
        renderAll();
      }),
      sel => sel.classed("interior", d => mesh.interiorEdges.has(mesh.edgeKeyU(d.a, d.b)))
        .each(function (d) {
          const c = linkLineCoords(d);
          if (!c) return;
          d3.select(this).attr("x1", c.x1).attr("y1", c.y1).attr("x2", c.x2).attr("y2", c.y2);
        }));
  }

  const SPOKE_COLORS         = configNavMesh.palette.spokes;
  const JUNCTION_PAIR_COLORS = configNavMesh.palette.junctionPairs;

  function renderRoutes(network, classified) {
    const edgeKey = (a, b) => a < b ? a + "||" + b : b + "||" + a;
    const traversalByRouteIdx = new Map();
    if (classified && classified.pathTraversals) {
      for (const t of classified.pathTraversals) traversalByRouteIdx.set(t.routeIdx, t);
    }
    const SPACING = configNavMesh.bundle.spacing;
    const isEndpoint = (wp) => typeof wp.id === "string" && wp.id.startsWith("endpoint:");

    function bundleOffset(A, B, routeIdx) {
      const e = network.edges.get(edgeKey(A.id, B.id));
      if (!e || !e.bundleOffsetByRoute) return { ox: 0, oy: 0 };
      const frac = e.bundleOffsetByRoute.get(routeIdx);
      if (frac == null || frac === 0) return { ox: 0, oy: 0 };
      const off = frac * SPACING;
      return { ox: e.bundlePerpX * off, oy: e.bundlePerpY * off };
    }

    const alignment = alignRoutes(network, classified, optimizedOrderings, configNavMesh);

    function bundleShiftAtEnd(segA, segB, endpointId, routeIdx) {
      const segKey = edgeKey(segA.id, segB.id);
      const entry = alignment.get(segKey + "@" + endpointId);
      if (!entry) return { sx: 0, sy: 0 };
      const v = entry.shiftByRoute.get(routeIdx);
      if (!v) return { sx: 0, sy: 0 };
      return { sx: v.x, sy: v.y };
    }

    function endpointPos(wp, otherWp, adjWp, routeIdx) {
      if (isEndpoint(wp)) return { x: wp.x, y: wp.y };
      if (otherWp && isEndpoint(otherWp) && adjWp) {
        const { ox, oy } = bundleOffset(wp, adjWp, routeIdx);
        const sh = bundleShiftAtEnd(wp, adjWp, wp.id, routeIdx);
        return { x: wp.x + ox + sh.sx, y: wp.y + oy + sh.sy };
      }
      const { ox, oy } = bundleOffset(wp, otherWp, routeIdx);
      const sh = bundleShiftAtEnd(wp, otherWp, wp.id, routeIdx);
      return { x: wp.x + ox + sh.sx, y: wp.y + oy + sh.sy };
    }

    const data = network.paths.map(p => ({
      routeId: p.routeId,
      routeIdx: p.routeIdx,
      route: routes[p.routeIdx],
      waypoints: p.waypoints,
    }));
    const gSel = routeLayer.selectAll("g.route-segments").data(data, d => d.routeId);
    const gEntered = gSel.enter().append("g")
      .attr("class", "route-segments")
      .on("dblclick", function (event, d) {
        event.stopPropagation();
        if (mode !== "routes") return;
        const idx = routes.findIndex(r => r.id === d.routeId);
        if (idx !== -1) routes.splice(idx, 1);
        renderAll();
      });
    const gMerged = gEntered.merge(gSel);
    gSel.exit().remove();

    // Build the snap-id set once (used by per-route filtering below).
    const snapIds = new Set();
    for (const n of classified.nodes) {
      if (n.kind === "snap") snapIds.add(n.id);
    }

    gMerged.each(function (d) {
      const wps = d.waypoints;
      const trav = traversalByRouteIdx.get(d.routeIdx);

      // Filter snap nodes that are interior pass-throughs FOR THIS
      // ROUTE — i.e., snap nodes that this route's endpoint didn't
      // create. (A snap node is "this route's own" iff a neighbor in
      // wps is one of this route's endpoint waypoints.) Other routes'
      // snap points should pass through transparently, without
      // creating a junction or limiting the radius of nearby vertex
      // junctions.
      const filteredIdx = [];
      for (let i = 0; i < wps.length; i++) {
        const isInteriorSnap =
          i > 0 && i < wps.length - 1 &&
          snapIds.has(wps[i].id) &&
          !isEndpoint(wps[i - 1]) &&
          !isEndpoint(wps[i + 1]);
        if (!isInteriorSnap) filteredIdx.push(i);
      }
      const filteredWps = filteredIdx.map(i => wps[i]);

      // Per-waypoint effective junction radius. For each interior
      // waypoint in filteredWps, the curve must fit within the segments
      // on either side. The available budget on each side is HALF the
      // segment length when the adjacent waypoint also has a curve
      // (so the two curves can share the segment without overlapping),
      // and the FULL segment length when the adjacent waypoint is an
      // endpoint (no opposing curve to share with).
      //
      // For vertex junctions on this route, "segment length" between
      // filtered neighbors is the centerline distance — when the path
      // crosses snap chains (snaps filtered out), the chain is
      // collinear so this is just the direct Euclidean distance.
      const filteredJrCaps = new Array(filteredWps.length);
      for (let i = 1; i < filteredWps.length - 1; i++) {
        const wp = filteredWps[i];
        if (isEndpoint(wp)) { filteredJrCaps[i] = jr; continue; }
        const prev = filteredWps[i - 1];
        const next = filteredWps[i + 1];
        const lenBack = Math.hypot(wp.x - prev.x, wp.y - prev.y);
        const lenFwd  = Math.hypot(wp.x - next.x, wp.y - next.y);
        // Halve only if the adjacent waypoint will ALSO take a curve.
        // Endpoints don't curve; everything else (vertex or kept snap) does.
        const capBack = isEndpoint(prev) ? lenBack : 0.5 * lenBack;
        const capFwd  = isEndpoint(next) ? lenFwd  : 0.5 * lenFwd;
        filteredJrCaps[i] = Math.min(jr, capBack, capFwd);
      }
      const filteredWpToIndex = new Map();
      filteredWps.forEach((w, i) => filteredWpToIndex.set(w, i));
      function jrAt(wp) {
        const i = filteredWpToIndex.get(wp);
        if (i == null) return jr;
        const c = filteredJrCaps[i];
        return c == null ? jr : c;
      }

      // posAt(i, j) returns the drawn endpoint of filteredWps[i] on the
      // segment toward filteredWps[j]. The offset/shift come from the
      // ORIGINAL sub-edge adjacent to wps[origI] in the wps array,
      // which (for filtered segments spanning a snap chain) is the
      // first sub-edge of the chain on the origI side.
      function posAt(i, j) {
        const origI = filteredIdx[i];
        const origJ = filteredIdx[j];
        const step = origJ > origI ? 1 : -1;
        const neighborIdx = origI + step;     // adjacent in original wps
        const adjIdx      = origI - step;     // on the far side of origI
        const adj = (adjIdx >= 0 && adjIdx < wps.length) ? wps[adjIdx] : null;
        return endpointPos(wps[origI], wps[neighborIdx], adj, d.routeIdx);
      }

      // Get all renderable pieces (straight lines + curves) for this route.
      const pieces = routeCurvedSegments(filteredWps, posAt, isEndpoint, jrAt);

      // Helper: map a filtered index back to its position in the
      // original wps array (used for downstream lookups like
      // bundle/spoke type and traversal pairKey).
      const origIdxOf = (fi) => filteredIdx[fi];

      // Build draw items. Each item is a single <path> element with its
      // own color. For paths/spokes mode, each piece becomes one item.
      // For junctions mode, straight pieces split at midpoint into two
      // half-items; curves stay as one item colored by the corner's
      // pairKey.
      // Each item carries `origA` and `origB`: the original-wps index
      // pair for the FIRST sub-edge of this collapsed segment (used
      // for edge lookups, color, and the mouseover handler). For
      // curves, segIdx refers to the OUTGOING segment at the curve's
      // junction, so origA/origB describe that outgoing segment.
      const items = [];
      for (let k = 0; k < pieces.length; k++) {
        const pc = pieces[k];
        const origA = origIdxOf(pc.segIdx);
        const stepFwd = origIdxOf(pc.segIdx + 1) > origA ? 1 : -1;
        const origB = origA + stepFwd;
        if (pc.kind === "curve") {
          let stroke;
          if (pathColorMode === "junctions") {
            const origCorner = origIdxOf(pc.wpIndex);
            const pk = trav && trav.waypoints[origCorner] && trav.waypoints[origCorner].pairKey;
            stroke = JUNCTION_PAIR_COLORS[pk] || "#000";
          } else if (pathColorMode === "spokes") {
            const A = wps[origA], B = wps[origB];
            const e = network.edges.get(edgeKey(A.id, B.id));
            stroke = SPOKE_COLORS[e ? e.spokeType : "area"] || "#000";
          } else {
            stroke = d.route ? d.route.color : "#000";
          }
          items.push({
            key: d.routeId + ":p" + k,
            origA, origB,
            stroke,
            d: `M ${pc.x1} ${pc.y1} C ${pc.c1x} ${pc.c1y} ${pc.c2x} ${pc.c2y} ${pc.x2} ${pc.y2}`,
          });
        } else {
          // Straight line piece.
          const { x1, y1, x2, y2 } = pc;
          if (pathColorMode === "junctions" && trav) {
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            const pkA = trav.waypoints[origA] && trav.waypoints[origA].pairKey;
            const pkB = trav.waypoints[origB] && trav.waypoints[origB].pairKey;
            const colorA = JUNCTION_PAIR_COLORS[pkA] || "#000";
            const colorB = JUNCTION_PAIR_COLORS[pkB] || "#000";
            items.push({
              key: d.routeId + ":p" + k + ":a",
              origA, origB, stroke: colorA,
              d: `M ${x1} ${y1} L ${mx} ${my}`,
            });
            items.push({
              key: d.routeId + ":p" + k + ":b",
              origA, origB, stroke: colorB,
              d: `M ${mx} ${my} L ${x2} ${y2}`,
            });
          } else {
            let stroke;
            if (pathColorMode === "spokes") {
              const A = wps[origA], B = wps[origB];
              const e = network.edges.get(edgeKey(A.id, B.id));
              stroke = SPOKE_COLORS[e ? e.spokeType : "area"] || "#000";
            } else {
              stroke = d.route ? d.route.color : "#000";
            }
            items.push({
              key: d.routeId + ":p" + k,
              origA, origB, stroke,
              d: `M ${x1} ${y1} L ${x2} ${y2}`,
            });
          }
        }
      }

      const lines = d3.select(this).selectAll("path.route-seg").data(items, s => s.key);
      lines.enter().append("path")
        .attr("class", "route-seg route")
        .attr("fill", "none")
        .attr("stroke-linecap", "butt")
        .merge(lines)
        .attr("d", s => s.d)
        .attr("stroke", s => s.stroke)
        .attr("stroke-width", configNavMesh.bundle.strandWidth)
        .on("mouseover", function (event, s) {
          const A = wps[s.origA], B = wps[s.origB];
          const e = network.edges.get(edgeKey(A.id, B.id));
          let spokeType = null;
          let cw = [];
          if (e && e.bundleOffsetByRoute) {
            spokeType = e.spokeType;
            const dx = B.x - A.x, dy = B.y - A.y;
            const dot = dy * e.bundlePerpX + (-dx) * e.bundlePerpY;
            const aligned = dot >= 0;
            const entries = e.routeIdxs
              .map(ri => [ri, e.bundleOffsetByRoute.get(ri)])
              .filter(([, off]) => off != null)
              .sort((x, y) => aligned ? x[1] - y[1] : y[1] - x[1]);
            cw = entries.map(([ri]) => routes[ri] ? routes[ri].id : ri);
          }
          junctionStatus.text(`route ${d.routeId}, ${spokeType || "?"}, [${cw.join(",")}]`);
        })
        .on("mouseout", function () { junctionStatus.text(""); });
      lines.exit().remove();
    });
  }

  function buildJunctionLabels(classified) {
    const labels = new Map();
    const parallels = [], decisions = [];
    for (const n of classified.nodes) {
      if (n.classification === "parallel") parallels.push(n.id);
      else if (n.classification === "decision") decisions.push(n.id);
    }
    parallels.sort(); decisions.sort();
    parallels.forEach((id, i) => labels.set(id, "p" + i));
    decisions.forEach((id, i) => labels.set(id, "d" + i));
    return labels;
  }

  function formatJunctionStatus(node, network, labels) {
    if (!node) return "";
    const label = labels && labels.get(node.id);
    const labelPrefix = label ? label + " · " : "";
    const type = node.classification === "decision" ? "decision waypoint" : "parallel waypoint";
    if (!node.spokes || node.spokes.length === 0) return labelPrefix + type;
    const edges = network && network.edges;
    const nodes = network && network.nodes;
    function ekey(a, b) { return a < b ? a + "||" + b : b + "||" + a; }
    function routesCwForSpoke(s) {
      if (!edges) return null;
      const e = edges.get(ekey(node.id, s.farId));
      if (!e || !e.bundleOffsetByRoute) return null;
      const entries = e.routeIdxs
        .map(ri => [ri, e.bundleOffsetByRoute.get(ri)])
        .filter(([, off]) => off != null);
      const far = nodes && nodes.get(s.farId);
      let storedAlignsWithOutward = true;
      if (far) {
        const dx = far.x - node.x, dy = far.y - node.y;
        const dot = dy * e.bundlePerpX + (-dx) * e.bundlePerpY;
        storedAlignsWithOutward = dot >= 0;
      }
      entries.sort((x, y) => storedAlignsWithOutward ? x[1] - y[1] : y[1] - x[1]);
      return entries.map(([ri]) => routes[ri] ? routes[ri].id : ri);
    }
    const spokeLines = node.spokes.map(s => {
      const deg = Math.round(s.angle * 180 / Math.PI);
      const cw = routesCwForSpoke(s);
      const cwStr = cw && cw.length ? "[" + cw.join(",") + "]" : "[]";
      return `${s.spokeType} ${deg}° ${cwStr}`;
    });
    return labelPrefix + type + " · " + spokeLines.join(", ");
  }

  function renderJunctions(classifiedNodes, mesh, network, labels) {
    const BASE_R         = configNavMesh.junction.baseRadius;
    const PER_ROUTE_BUMP = configNavMesh.junction.perRouteBump;
    const radiusFor = (n) => {
      let maxRoutesPerSpoke = 0;
      for (const s of n.spokes) {
        if (s.routeIdxs.length > maxRoutesPerSpoke) maxRoutesPerSpoke = s.routeIdxs.length;
      }
      return BASE_R + maxRoutesPerSpoke * PER_ROUTE_BUMP;
    };
    function areaFaceCountAt(pointId) {
      let n = 0;
      for (const f of mesh.faces) {
        if (!f.isArea) continue;
        if (f.ring.indexOf(pointId) !== -1) n++;
      }
      return n;
    }
    function shapeFor(node) {
      if (node.kind === "snap") return "snap";
      if (node.kind === "vertex") return areaFaceCountAt(node.id) === 1 ? "coastline" : "multiway";
      return "multiway";
    }
    function markerPath(shape, cx, cy, r) {
      if (shape === "snap") {
        return `M ${cx - r} ${cy - r} L ${cx + r} ${cy - r} L ${cx + r} ${cy + r} L ${cx - r} ${cy + r} Z`;
      }
      if (shape === "coastline") {
        const tr = r * 1.15, h = tr * Math.sqrt(3);
        const top = { x: cx, y: cy - (2 / 3) * h };
        const bl  = { x: cx - tr, y: cy + (1 / 3) * h };
        const br  = { x: cx + tr, y: cy + (1 / 3) * h };
        return `M ${top.x} ${top.y} L ${br.x} ${br.y} L ${bl.x} ${bl.y} Z`;
      }
      return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
    }

    const data = classifiedNodes.map(n => ({
      key: n.id, x: n.x, y: n.y, node: n,
      isDecision: n.classification === "decision",
      r: radiusFor(n), shape: shapeFor(n),
    }));

    const HIT_R_PADDING = configNavMesh.junction.hitRadiusPadding;
    dataJoin(junctionLayer, "circle", "junction-hit", data, d => d.key, null,
      sel => sel
        .attr("cx", d => d.x).attr("cy", d => d.y)
        .attr("r", d => d.r + HIT_R_PADDING)
        .on("mouseover", function (event, d) {
          junctionStatus.text(formatJunctionStatus(d.node, network, labels));
        })
        .on("mouseout", function () { junctionStatus.text(""); }));

    dataJoin(junctionLayer, "path", "junction-marker", data, d => d.key, sel => sel,
      sel => sel
        .classed("decision", d => d.isDecision)
        .classed("parallel", d => !d.isDecision)
        .attr("stroke-width", d => d.isDecision
          ? configNavMesh.junction.decisionStrokeWidth
          : configNavMesh.junction.parallelStrokeWidth)
        .attr("d", d => markerPath(d.shape, d.x, d.y, d.r)));
  }

  function renderRoutePoints() {
    const eps = [];
    routes.forEach(r => {
      eps.push({ routeId: r.id, kind: "start", x: r.start.x, y: r.start.y, color: r.color });
      eps.push({ routeId: r.id, kind: "end", x: r.end.x, y: r.end.y, color: r.color });
    });
    const routePointDrag = d3.drag()
      .on("start", function () { d3.select(this).raise(); })
      .on("drag", function (event, d) {
        const route = routes.find(r => r.id === d.routeId);
        if (!route) return;
        const target = d.kind === "start" ? route.start : route.end;
        target.x = event.x; target.y = event.y;
        d.x = event.x; d.y = event.y;
        d3.select(this).attr("cx", event.x).attr("cy", event.y);
        renderAll();
      });
    dataJoin(routePointLayer, "circle", "route-point", eps, d => d.routeId + "-" + d.kind,
      sel => sel.attr("class", d => "route-point " + d.kind).attr("r", 8)
        .on("dblclick", function (event, d) {
          event.stopPropagation();
          const idx = routes.findIndex(r => r.id === d.routeId);
          if (idx !== -1) routes.splice(idx, 1);
          renderAll();
        }).call(routePointDrag),
      sel => sel.attr("fill", d => d.color).attr("cx", d => d.x).attr("cy", d => d.y));
  }
  function renderVirtualPoints() {
    const vps = mesh.derivedPoints.filter(p => p.virtual);
    dataJoin(virtualPointLayer, "circle", "virtual", vps, d => d.id,
      sel => sel.attr("class", "point virtual").attr("r", 5).style("pointer-events", "none"),
      sel => sel.attr("cx", d => d.x).attr("cy", d => d.y));
  }
  function renderDisabledMarkers() {
    const disabledList = [];
    mesh.clusters.forEach(c => {
      c.faces.forEach(cf => {
        if (cf.disabled && cf.isArea && cf.interiorPoint) {
          disabledList.push({ stableKey: cf.stableKey,
            x: cf.interiorPoint.x, y: cf.interiorPoint.y });
        }
      });
    });
    const ARM = 7, HIT_R = 14;
    function xPath(d) {
      return `M ${d.x - ARM} ${d.y - ARM} L ${d.x + ARM} ${d.y + ARM} ` +
             `M ${d.x + ARM} ${d.y - ARM} L ${d.x - ARM} ${d.y + ARM}`;
    }
    const sel = disabledMarkerLayer.selectAll("g.disabled-marker").data(disabledList, d => d.stableKey);
    const entered = sel.enter().append("g").attr("class", "disabled-marker")
      .on("dblclick", function (event, d) {
        event.stopPropagation();
        disabledFaces.delete(d.stableKey);
        renderAll();
      });
    entered.append("circle").attr("class", "disabled-marker-hit");
    entered.append("path").attr("class", "disabled-marker-x");
    const merged = entered.merge(sel);
    merged.select("circle.disabled-marker-hit")
      .attr("cx", d => d.x).attr("cy", d => d.y).attr("r", HIT_R);
    merged.select("path.disabled-marker-x").attr("d", xPath);
    sel.exit().remove();
  }
  function renderPoints(junctionByVertexId, network, labels) {
    const pointDrag = d3.drag()
      .filter(event => !event.button)
      .on("start", function (event, d) {
        d3.select(this).raise();
        d._dragMoved = false;
        d._dragStartX = d.x; d._dragStartY = d.y;
      })
      .on("drag", function (event, d) {
        d.x = event.x; d.y = event.y;
        if (Math.hypot(d.x - d._dragStartX, d.y - d._dragStartY) > 2) d._dragMoved = true;
        d3.select(this).attr("cx", d.x).attr("cy", d.y);
        renderAll();
      })
      .on("end", function (event, d) {
        if (d._dragMoved) { d._lastDragEndedAt = Date.now(); return; }
        if (mode !== "navmesh") return;
        if (!pendingLink) pendingLink = { startId: d.id };
        else {
          const a = pendingLink.startId, b = d.id;
          if (a !== b && !linkExists(a, b)) links.push({ id: linkIdCounter++, a, b });
          pendingLink = null;
        }
        renderAll();
      });
    dataJoin(pointLayer, "circle", "point", points, d => d.id,
      sel => sel.attr("r", 6)
        .on("dblclick", function (event, d) {
          event.stopPropagation();
          if (mode !== "navmesh") return;
          if (d._lastDragEndedAt && Date.now() - d._lastDragEndedAt < 300) return;
          removePoint(d.id); renderAll();
        }).call(pointDrag),
      sel => sel.attr("cx", d => d.x).attr("cy", d => d.y)
        .on("mouseover", function (event, d) {
          const node = junctionByVertexId && junctionByVertexId.get("u" + d.id);
          if (node) junctionStatus.text(formatJunctionStatus(node, network, labels));
        })
        .on("mouseout", function (event, d) {
          const node = junctionByVertexId && junctionByVertexId.get("u" + d.id);
          if (node) junctionStatus.text("");
        }));
  }
  function renderPending() {
    pendingLayer.selectAll("*").remove();
    if (pendingLink && mousePos) {
      const sp = pointById(pendingLink.startId);
      if (sp) {
        pendingLayer.append("line").attr("class", "pending-line")
          .attr("stroke", "rgba(0, 0, 0, 0.15)").attr("stroke-width", 1)
          .attr("x1", sp.x).attr("y1", sp.y)
          .attr("x2", mousePos[0]).attr("y2", mousePos[1]);
      }
    }
    if (pendingRoute && mousePos) {
      pendingLayer.append("path").attr("class", "pending-line")
        .attr("stroke", pendingRoute.color).attr("stroke-width", configNavMesh.route.strokeWidth).attr("fill", "none")
        .attr("d", routePath({ start: pendingRoute.start,
          end: { x: mousePos[0], y: mousePos[1] } }));
    }
  }

  function applyOptimizedOrderings(network) {
    if (!optimizedOrderings || optimizedOrderings.size === 0) return;
    const linkGroups = network.linkGroups;
    if (!linkGroups) return;
    for (const [gk, entry] of optimizedOrderings) {
      const group = linkGroups.get(gk);
      if (!group) continue;
      const ordering = Array.isArray(entry) ? entry : [];
      const inGroup = new Set(group.routeUnion);
      const filtered = ordering.filter(r => inGroup.has(r));
      for (const r of group.routeUnion) {
        if (!filtered.includes(r)) filtered.push(r);
      }
      const n = filtered.length;
      const layout = new Map();
      for (let k = 0; k < n; k++) {
        let off;
        if (group.areaSide === +1)      off = +k;
        else if (group.areaSide === -1) off = k - (n - 1);
        else                            off = k - (n - 1) / 2;
        layout.set(filtered[k], off);
      }
      for (const ek of group.edgeKeys) {
        const e = network.edges.get(ek);
        if (!e) continue;
        e.bundleOffsetByRoute = new Map();
        for (const ri of e.routeIdxs) {
          if (layout.has(ri)) e.bundleOffsetByRoute.set(ri, layout.get(ri));
        }
      }
    }
  }

  function renderAll() {
    mesh = buildNavMesh(points, links, disabledFaces);
    const liveKeys = new Set(mesh.faces.map(f => f.stableKey));
    [...disabledFaces].forEach(k => { if (!liveKeys.has(k)) disabledFaces.delete(k); });

    renderPolygons();
    renderBisectors();
    renderLinks();

    const network = combinedPathNetwork(mesh, routes, pathfinding);
    const classified = classifyPathNodes(network);
    // Optimization runs as its own step on the freshly-routed network,
    // then its results are applied back as bundle offsets.
    optimizedOrderings = optimizeIndex(network, classified);
    applyOptimizedOrderings(network);
    const labels = buildJunctionLabels(classified);

    renderRoutes(network, classified);
    renderJunctions(classified.nodes, mesh, network, labels);

    const junctionByVertexId = new Map();
    for (const n of classified.nodes) {
      if (n.kind === "vertex") junctionByVertexId.set(n.id, n);
    }

    renderRoutePoints();
    renderVirtualPoints();
    renderDisabledMarkers();
    renderPoints(junctionByVertexId, network, labels);
    renderPending();
  }

  if (typeof invalidation !== "undefined") {
    invalidation.then(() => window.removeEventListener("mouseup", handleMouseUp));
  }

  // ---- Toolbar wiring ----
  function serializeState() {
    const round = (n) => Math.round(n * 10) / 10;
    const pointLines = points.map(p =>
      `    { id: ${p.id}, x: ${round(p.x)}, y: ${round(p.y)} }`);
    const linkLines = links.map(l =>
      `    { id: ${l.id}, a: ${l.a}, b: ${l.b} }`);
    const disabledLines = [...disabledFaces].map(k => `    ${JSON.stringify(k)}`);
    const routeLines = routes.map(r =>
      `    { id: ${r.id}, color: ${JSON.stringify(r.color)}, ` +
      `start: { x: ${round(r.start.x)}, y: ${round(r.start.y)} }, ` +
      `end: { x: ${round(r.end.x)}, y: ${round(r.end.y)} } }`);
    const block = (label, lines) => lines.length
      ? `  ${label}: [\n${lines.join(",\n")}\n  ]`
      : `  ${label}: []`;
    return "{\n" + [
      block("points", pointLines),
      block("links", linkLines),
      block("disabledFaceKeys", disabledLines),
      block("routes", routeLines),
    ].join(",\n") + "\n}";
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (_) {}
      document.body.removeChild(ta);
      return ok;
    }
  }

  function flashStatus(text) {
    toolbarStatus.text(text);
    setTimeout(() => { toolbarStatus.text(""); }, 1500);
  }

  saveBtn.on("click", async () => {
    const ok = await copyText(serializeState());
    flashStatus(ok
      ? `copied ${points.length}p · ${links.length}l · ${routes.length}r`
      : "copy failed");
  });

  clearBtn.on("click", () => {
    points.length = 0; links.length = 0; routes.length = 0;
    disabledFaces.clear();
    pointIdCounter = 0; linkIdCounter = 0; routeIdCounter = 0;
    pendingLink = null; pendingRoute = null; routeDrag = null;
    renderAll(); flashStatus("cleared");
  });

  renderAll();
  return container.node();
}


function _47(md){return(
md`This cell let's you test out different simple combinations that might be encountered on the map. I have since modified the nav mesh function to optimize the actual map data, breaking some of the preferred optimal behavior. I might return to this and see if it can be perfected in both cases, but for now, it works on the map`
)}

function _48(md){return(
md`## Link Google Sheet Tabs`
)}

function _49(md){return(
md`For easy data management, I've created a google sheet. Upload the new lines from each report, and fill out the start point, end point and cargo type.`
)}

function _loadSheetTab(d3)
{
  const SHEET_ID = "1P6MDZYvjLlH5xu8YibvniiCjv9Fkm1tVSRCrpIL8lKo";

  // Returns an async function that fetches one tab of the sheet as
  // parsed CSV rows. Pass the tab's gid (the integer in the URL after
  // `gid=` when you're viewing that tab in Google Sheets).
  return async function loadSheetTab(gid) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Sheet fetch failed (gid=${gid}): ${res.status} ${res.statusText}`);
    }
    const text = await res.text();
    if (text.trim().startsWith("<")) {
      throw new Error(
        `Sheet gid=${gid} returned HTML, not CSV. ` +
        "Share the sheet with 'Anyone with the link' viewer access."
      );
    }
    return d3.csvParse(text, d3.autoType);
  };
}


function _voyageSheet(loadSheetTab){return(
loadSheetTab(0)
)}

function _portSheet(loadSheetTab){return(
loadSheetTab(303773657)
)}

function _cargoSheet(loadSheetTab){return(
loadSheetTab(875797326)
)}

function _vesselSheet(loadSheetTab){return(
loadSheetTab(2082212222)
)}

function _historical(loadSheetTab){return(
loadSheetTab(769815512)
)}

function _56(md){return(
md`## Globe Nav Mesh`
)}

function _57(md){return(
md`Let's load geographic data
- Natural Earth for 50m geojson
- Army Core of Engineers data on waterway networks and nodes`
)}

function _countries(FileAttachment){return(
FileAttachment("americas_countries_50m.geojson").json()
)}

function _states(FileAttachment){return(
FileAttachment("us_states_territories_50m.geojson").json()
)}

function _lakes(FileAttachment){return(
FileAttachment("americas_lakes.geojson").json()
)}

function _rivers(FileAttachment){return(
FileAttachment("americas_rivers (4).geojson").json()
)}

function _waterway_networks(FileAttachment){return(
FileAttachment("Waterway_Networks_4704106664473752717.geojson").json()
)}

async function _waterway_networks_simplified(require,waterway_networks)
{
  const topoServer = await require("topojson-server@3");
  const topoClient = await require("topojson-client@3");
  const topoSimplify = await require("topojson-simplify@3");

  let topo = topoServer.topology({ ww: waterway_networks });

  topo = topoSimplify.presimplify(topo);

  topo = topoSimplify.simplify(topo, .0001);

  // 4) Back to GeoJSON for the rest of the notebook to consume unchanged.
  return topoClient.feature(topo, topo.objects.ww);
}


function _waterway_networks_nodes(FileAttachment){return(
FileAttachment("Waterway_Networks_-1399073374797790963.geojson").json()
)}

function _65(md){return(
md`With this, we can trace a simplified navigation mesh over the waterway network (green). After editing the mesh, click the \`save nav mesh\` button, and paste that data into \`dataNavMesh\`, overwriting the entire cell.`
)}

function _dataNavMesh(){return(
{
  points: [
    { id: 3, lon: -125.6035, lat: 39.95376 },
    { id: 5, lon: -125.03519, lat: 46.2153 },
    { id: 6, lon: -125.72649, lat: 48.70828 },
    { id: 7, lon: -133.40932, lat: 51.71275 },
    { id: 11, lon: -146.01016, lat: 59.86108 },
    { id: 12, lon: -149.31076, lat: 59.02679 },
    { id: 14, lon: -151.88861, lat: 56.9363 },
    { id: 17, lon: -105.44968, lat: 18.03525 },
    { id: 21, lon: -159.73758, lat: 16.2024 },
    { id: 22, lon: -164.12922, lat: 21.27937 },
    { id: 23, lon: -155.47401, lat: 18.47098 },
    { id: 24, lon: -154.45942, lat: 19.90861 },
    { id: 25, lon: -155.20539, lat: 20.60003 },
    { id: 26, lon: -156.02397, lat: 20.29314 },
    { id: 27, lon: -156.64496, lat: 19.77889 },
    { id: 28, lon: -156.44101, lat: 18.95203 },
    { id: 29, lon: -156.39164, lat: 20.40635 },
    { id: 30, lon: -155.68313, lat: 20.75944 },
    { id: 31, lon: -156.35731, lat: 21.24627 },
    { id: 32, lon: -156.77304, lat: 20.94285 },
    { id: 33, lon: -157.4017, lat: 21.01204 },
    { id: 34, lon: -157.32589, lat: 21.27402 },
    { id: 35, lon: -156.57912, lat: 21.20263 },
    { id: 36, lon: -156.87396, lat: 20.98672 },
    { id: 37, lon: -157.46594, lat: 21.46371 },
    { id: 38, lon: -157.89809, lat: 21.98307 },
    { id: 39, lon: -158.69903, lat: 21.78672 },
    { id: 40, lon: -157.97352, lat: 21.05478 },
    { id: 41, lon: -157.7348, lat: 21.07077 },
    { id: 42, lon: -159.72496, lat: 21.82393 },
    { id: 43, lon: -159.24779, lat: 21.7327 },
    { id: 44, lon: -159.18969, lat: 22.29208 },
    { id: 45, lon: -159.93266, lat: 22.30794 },
    { id: 46, lon: -160.35363, lat: 21.72237 },
    { id: 47, lon: -159.92128, lat: 21.84059 },
    { id: 48, lon: -160.04701, lat: 22.07248 },
    { id: 49, lon: -160.34027, lat: 22.01985 },
    { id: 50, lon: -160.06606, lat: 21.97222 },
    { id: 51, lon: -160.2348, lat: 21.85588 },
    { id: 52, lon: -159.64693, lat: 21.93385 },
    { id: 53, lon: -159.32823, lat: 21.97425 },
    { id: 57, lon: -122.96397, lat: 46.23186 },
    { id: 58, lon: -122.04299, lat: 45.63332 },
    { id: 59, lon: -118.99126, lat: 45.92606 },
    { id: 60, lon: -117.47877, lat: 46.69482 },
    { id: 61, lon: -123.31789, lat: 48.21221 },
    { id: 75, lon: -96.71158, lat: 26.05525 },
    { id: 78, lon: -91.5957, lat: 29.2347 },
    { id: 79, lon: -90.08333, lat: 28.34321 },
    { id: 80, lon: -89.23179, lat: 29.17973 },
    { id: 81, lon: -90.22662, lat: 29.88379 },
    { id: 82, lon: -91.11325, lat: 30.19214 },
    { id: 83, lon: -91.74144, lat: 31.14989 },
    { id: 84, lon: -93.08502, lat: 31.6701 },
    { id: 85, lon: -93.93725, lat: 33.33202 },
    { id: 86, lon: -92.19547, lat: 33.06713 },
    { id: 87, lon: -93.05134, lat: 34.05188 },
    { id: 88, lon: -90.92396, lat: 32.3646 },
    { id: 89, lon: -90.22958, lat: 33.49621 },
    { id: 90, lon: -91.15319, lat: 33.81468 },
    { id: 91, lon: -93.32471, lat: 35.42235 },
    { id: 92, lon: -94.84806, lat: 35.38531 },
    { id: 93, lon: -95.88864, lat: 36.41926 },
    { id: 94, lon: -91.43696, lat: 35.53082 },
    { id: 95, lon: -92.59594, lat: 36.36114 },
    { id: 96, lon: -90.95706, lat: 36.2182 },
    { id: 97, lon: -90.00607, lat: 35.27012 },
    { id: 98, lon: -89.17462, lat: 37.06928 },
    { id: 99, lon: -90.38681, lat: 38.80563 },
    { id: 100, lon: -91.56432, lat: 40.14654 },
    { id: 101, lon: -90.2519, lat: 42.47285 },
    { id: 102, lon: -93.50363, lat: 45.40654 },
    { id: 103, lon: -94.6707, lat: 39.17493 },
    { id: 104, lon: -97.07638, lat: 42.79614 },
    { id: 105, lon: -89.29888, lat: 41.23519 },
    { id: 106, lon: -87.60481, lat: 41.83141 },
    { id: 107, lon: -87.78647, lat: 43.30899 },
    { id: 108, lon: -86.86562, lat: 45.49244 },
    { id: 109, lon: -88.46709, lat: 44.05251 },
    { id: 110, lon: -87.10525, lat: 45.58714 },
    { id: 111, lon: -85.68934, lat: 45.88771 },
    { id: 112, lon: -85.11129, lat: 45.83424 },
    { id: 113, lon: -86.19755, lat: 44.87202 },
    { id: 114, lon: -86.72561, lat: 43.65703 },
    { id: 115, lon: -86.33799, lat: 42.61213 },
    { id: 116, lon: -87.18573, lat: 41.85269 },
    { id: 117, lon: -88.80548, lat: 28.97889 },
    { id: 118, lon: -88.03595, lat: 30.09613 },
    { id: 119, lon: -86.44218, lat: 30.12423 },
    { id: 120, lon: -85.08015, lat: 29.37559 },
    { id: 121, lon: -83.4167, lat: 28.89596 },
    { id: 122, lon: -83.377, lat: 27.58417 },
    { id: 123, lon: -82.54972, lat: 24.14965 },
    { id: 128, lon: -80.12212, lat: 30.66045 },
    { id: 129, lon: -79.90485, lat: 31.8105 },
    { id: 130, lon: -74.67144, lat: 35.11129 },
    { id: 131, lon: -75.49956, lat: 37.00874 },
    { id: 132, lon: -74.54959, lat: 38.25733 },
    { id: 133, lon: -73.32129, lat: 40.14296 },
    { id: 134, lon: -71.75166, lat: 40.90344 },
    { id: 141, lon: -85.51398, lat: 22.02128 },
    { id: 155, lon: -67.47529, lat: 17.74859 },
    { id: 156, lon: -67.48803, lat: 18.806 },
    { id: 157, lon: -65.59775, lat: 18.65424 },
    { id: 158, lon: -65.08593, lat: 18.22652 },
    { id: 159, lon: -65.78205, lat: 17.63897 },
    { id: 182, lon: -79.44973, lat: 27.10805 },
    { id: 184, lon: -70.66755, lat: 42.35521 },
    { id: 185, lon: -69.66234, lat: 43.32664 },
    { id: 186, lon: -67.19413, lat: 44.31154 },
    { id: 189, lon: -58.8012, lat: 45.91163 },
    { id: 190, lon: -60.34759, lat: 47.26337 },
    { id: 191, lon: -62.12275, lat: 46.6105 },
    { id: 192, lon: -64.34039, lat: 47.29273 },
    { id: 193, lon: -63.38269, lat: 48.981 },
    { id: 194, lon: -65.51336, lat: 49.82446 },
    { id: 195, lon: -68.60791, lat: 48.73747 },
    { id: 196, lon: -70.91753, lat: 46.79216 },
    { id: 197, lon: -74.75931, lat: 45.02744 },
    { id: 198, lon: -76.51736, lat: 44.00891 },
    { id: 199, lon: -120.3939, lat: 47.40526 },
    { id: 200, lon: -119.68758, lat: 48.14121 },
    { id: 201, lon: -118.32791, lat: 47.87091 },
    { id: 202, lon: -118.08825, lat: 48.6221 },
    { id: 204, lon: -84.94329, lat: 46.81456 },
    { id: 205, lon: -86.02986, lat: 46.77486 },
    { id: 206, lon: -86.51049, lat: 46.61012 },
    { id: 207, lon: -87.59577, lat: 46.91641 },
    { id: 208, lon: -87.4705, lat: 47.45243 },
    { id: 209, lon: -88.04853, lat: 47.57111 },
    { id: 210, lon: -90.45483, lat: 46.65467 },
    { id: 211, lon: -90.3416, lat: 47.28707 },
    { id: 212, lon: -90.84992, lat: 47.23591 },
    { id: 213, lon: -90.85488, lat: 47.42886 },
    { id: 214, lon: -89.32999, lat: 47.98341 },
    { id: 215, lon: -87.89188, lat: 48.55781 },
    { id: 216, lon: -86.56822, lat: 48.55747 },
    { id: 217, lon: -86.13765, lat: 47.69466 },
    { id: 218, lon: -85.13951, lat: 47.44311 },
    { id: 219, lon: -92.02772, lat: 46.71258 },
    { id: 220, lon: -88.525, lat: 48.18503 },
    { id: 221, lon: -89.20355, lat: 47.92847 },
    { id: 222, lon: -89.172, lat: 47.80508 },
    { id: 223, lon: -88.61329, lat: 48.04172 },
    { id: 224, lon: -87.75366, lat: 37.79389 },
    { id: 225, lon: -86.12778, lat: 37.14628 },
    { id: 226, lon: -85.19052, lat: 38.62676 },
    { id: 227, lon: -82.96997, lat: 38.65528 },
    { id: 228, lon: -83.98896, lat: 37.43206 },
    { id: 229, lon: -82.21757, lat: 38.61452 },
    { id: 230, lon: -87.89003, lat: 31.5287 },
    { id: 231, lon: -88.00254, lat: 32.41338 },
    { id: 232, lon: -88.23304, lat: 34.98491 },
    { id: 233, lon: -88.20737, lat: 36.74759 },
    { id: 237, lon: -86.19352, lat: 34.48326 },
    { id: 238, lon: -83.9447, lat: 36.07598 },
    { id: 239, lon: -86.54305, lat: 36.13759 },
    { id: 240, lon: -84.47706, lat: 36.94847 },
    { id: 241, lon: -81.85049, lat: 37.3755 },
    { id: 242, lon: -81.06653, lat: 37.99818 },
    { id: 243, lon: -79.50653, lat: 41.04425 },
    { id: 247, lon: -76.18502, lat: 37.06396 },
    { id: 248, lon: -76.38134, lat: 39.24949 },
    { id: 249, lon: -75.59494, lat: 39.61808 },
    { id: 250, lon: -74.73604, lat: 40.13945 },
    { id: 251, lon: -72.10436, lat: 41.27056 },
    { id: 252, lon: -73.59225, lat: 40.97141 },
    { id: 253, lon: -74.05152, lat: 40.61002 },
    { id: 254, lon: 145.11949, lat: 13.66315 },
    { id: 255, lon: 128.60606, lat: 26.4465 },
    { id: 256, lon: 164.27159, lat: 24.6132 },
    { id: 257, lon: -178.86227, lat: 27.86053 },
    { id: 258, lon: -170.59769, lat: -14.91495 },
    { id: 259, lon: -174.53117, lat: -4.09281 },
    { id: 260, lon: -179.01308, lat: 12.00761 },
    { id: 267, lon: -84.39363, lat: 45.83123 },
    { id: 268, lon: -83.0501, lat: 45.18311 },
    { id: 269, lon: -83.29107, lat: 44.12757 },
    { id: 270, lon: -82.72231, lat: 44.19132 },
    { id: 271, lon: -82.36683, lat: 43.13074 },
    { id: 272, lon: -81.85024, lat: 43.76497 },
    { id: 273, lon: -81.58615, lat: 44.45728 },
    { id: 274, lon: -81.93703, lat: 45.36855 },
    { id: 275, lon: -83.81707, lat: 45.85475 },
    { id: 276, lon: -83.95332, lat: 43.41707 },
    { id: 277, lon: -79.32847, lat: 42.56769 },
    { id: 278, lon: -81.72596, lat: 41.54306 },
    { id: 279, lon: -82.6993, lat: 41.66938 },
    { id: 280, lon: -81.15775, lat: 42.56143 },
    { id: 281, lon: -80.27172, lat: 42.45497 },
    { id: 282, lon: -79.25165, lat: 42.83445 },
    { id: 283, lon: -83.18182, lat: 42.16113 },
    { id: 284, lon: -82.45368, lat: 42.67581 },
    { id: 286, lon: -73.68678, lat: 42.77176 },
    { id: 287, lon: -73.21139, lat: 44.98234 },
    { id: 288, lon: -79.24217, lat: 43.27676 },
    { id: 289, lon: -78.32882, lat: 43.46848 },
    { id: 290, lon: -76.62957, lat: 43.49759 },
    { id: 291, lon: -78.87598, lat: 43.77813 },
    { id: 292, lon: -79.33236, lat: 43.55656 },
    { id: 295, lon: -81.30783, lat: 45.43419 },
    { id: 296, lon: -80.1536, lat: 44.47144 },
    { id: 297, lon: -81.59384, lat: 45.91213 },
    { id: 298, lon: -84.02291, lat: 46.1502 },
    { id: 299, lon: -89.1944, lat: 30.16447 },
    { id: 300, lon: -90.31775, lat: 30.3035 },
    { id: 301, lon: -92.33678, lat: 48.33782 },
    { id: 302, lon: -95.20915, lat: 49.06219 },
    { id: 303, lon: -99.17784, lat: 47.64904 },
    { id: 304, lon: -99.99162, lat: 43.94186 },
    { id: 305, lon: -101.84024, lat: 47.87795 },
    { id: 306, lon: -110.12605, lat: 47.79351 },
    { id: 310, lon: -94.56375, lat: 13.16771 },
    { id: 311, lon: -90.86363, lat: 8.54683 },
    { id: 314, lon: -137.5822, lat: 57.02767 },
    { id: 319, lon: -96.60313, lat: 27.83926 },
    { id: 322, lon: -79.16598, lat: 12.34725 },
    { id: 331, lon: -74.02481, lat: 21.77327 },
    { id: 332, lon: -72.15202, lat: 20.86628 },
    { id: 333, lon: -73.85704, lat: 19.91573 },
    { id: 334, lon: -65.26105, lat: 42.86959 },
    { id: 338, lon: -79.60907, lat: 24.45248 },
    { id: 339, lon: -84.33737, lat: 4.80281 },
    { id: 340, lon: -80.01167, lat: 5.77149 },
    { id: 344, lon: -118.30964, lat: 33.53366 },
    { id: 345, lon: -121.17206, lat: 34.3499 },
    { id: 346, lon: -123.00352, lat: 37.55384 },
    { id: 347, lon: -115.97211, lat: 27.51519 },
    { id: 348, lon: -77.41559, lat: 27.01261 },
    { id: 349, lon: -79.22348, lat: 26.71697 },
    { id: 350, lon: -76.79894, lat: 25.78545 },
    { id: 351, lon: -152.3836, lat: 59.14584 },
    { id: 352, lon: -151.44698, lat: 60.76324 },
    { id: 353, lon: -149.87751, lat: 61.22352 },
    { id: 354, lon: -151.88714, lat: 60.91749 },
    { id: 355, lon: -153.20918, lat: 59.01966 },
    { id: 356, lon: -151.46736, lat: 57.8887 },
    { id: 360, lon: -126.59693, lat: 31.1161 },
    { id: 361, lon: -148.19162, lat: 26.21278 },
    { id: 362, lon: -160.85028, lat: 28.61525 },
    { id: 365, lon: -71.41057, lat: 41.12642 },
    { id: 366, lon: -68.81643, lat: 40.50235 },
    { id: 367, lon: -69.89832, lat: 42.12777 },
    { id: 368, lon: -111.03468, lat: 15.27473 },
    { id: 369, lon: -146.81813, lat: 16.14072 }
  ],
  links: [
    { id: 6, a: 5, b: 6 },
    { id: 7, a: 6, b: 7 },
    { id: 12, a: 11, b: 12 },
    { id: 22, a: 21, b: 22 },
    { id: 24, a: 23, b: 24 },
    { id: 25, a: 24, b: 25 },
    { id: 26, a: 25, b: 26 },
    { id: 27, a: 26, b: 27 },
    { id: 28, a: 27, b: 28 },
    { id: 29, a: 28, b: 23 },
    { id: 30, a: 29, b: 30 },
    { id: 31, a: 30, b: 31 },
    { id: 32, a: 31, b: 32 },
    { id: 33, a: 32, b: 29 },
    { id: 34, a: 33, b: 34 },
    { id: 35, a: 34, b: 35 },
    { id: 36, a: 35, b: 36 },
    { id: 37, a: 36, b: 33 },
    { id: 38, a: 37, b: 38 },
    { id: 39, a: 38, b: 39 },
    { id: 40, a: 39, b: 40 },
    { id: 41, a: 40, b: 41 },
    { id: 42, a: 41, b: 37 },
    { id: 43, a: 42, b: 43 },
    { id: 44, a: 43, b: 44 },
    { id: 45, a: 44, b: 45 },
    { id: 46, a: 45, b: 42 },
    { id: 47, a: 46, b: 47 },
    { id: 48, a: 47, b: 48 },
    { id: 49, a: 48, b: 49 },
    { id: 50, a: 49, b: 46 },
    { id: 51, a: 50, b: 47 },
    { id: 52, a: 51, b: 46 },
    { id: 53, a: 42, b: 52 },
    { id: 54, a: 53, b: 43 },
    { id: 59, a: 5, b: 57 },
    { id: 60, a: 57, b: 58 },
    { id: 61, a: 58, b: 59 },
    { id: 62, a: 59, b: 60 },
    { id: 63, a: 6, b: 61 },
    { id: 81, a: 78, b: 79 },
    { id: 82, a: 80, b: 81 },
    { id: 83, a: 81, b: 82 },
    { id: 84, a: 82, b: 83 },
    { id: 85, a: 83, b: 84 },
    { id: 86, a: 84, b: 85 },
    { id: 87, a: 83, b: 86 },
    { id: 88, a: 86, b: 87 },
    { id: 89, a: 83, b: 88 },
    { id: 90, a: 88, b: 89 },
    { id: 91, a: 88, b: 90 },
    { id: 92, a: 90, b: 91 },
    { id: 93, a: 91, b: 92 },
    { id: 94, a: 92, b: 93 },
    { id: 95, a: 90, b: 94 },
    { id: 96, a: 94, b: 95 },
    { id: 97, a: 94, b: 96 },
    { id: 98, a: 90, b: 97 },
    { id: 99, a: 97, b: 98 },
    { id: 100, a: 98, b: 99 },
    { id: 101, a: 99, b: 100 },
    { id: 102, a: 100, b: 101 },
    { id: 103, a: 101, b: 102 },
    { id: 104, a: 99, b: 103 },
    { id: 105, a: 103, b: 104 },
    { id: 106, a: 99, b: 105 },
    { id: 107, a: 105, b: 106 },
    { id: 108, a: 106, b: 107 },
    { id: 109, a: 107, b: 108 },
    { id: 110, a: 108, b: 109 },
    { id: 111, a: 109, b: 110 },
    { id: 112, a: 110, b: 111 },
    { id: 113, a: 111, b: 112 },
    { id: 114, a: 112, b: 113 },
    { id: 115, a: 113, b: 114 },
    { id: 116, a: 114, b: 115 },
    { id: 117, a: 115, b: 116 },
    { id: 118, a: 116, b: 106 },
    { id: 119, a: 79, b: 117 },
    { id: 120, a: 117, b: 118 },
    { id: 121, a: 118, b: 119 },
    { id: 122, a: 119, b: 120 },
    { id: 123, a: 120, b: 121 },
    { id: 124, a: 121, b: 122 },
    { id: 125, a: 122, b: 123 },
    { id: 131, a: 128, b: 129 },
    { id: 132, a: 129, b: 130 },
    { id: 133, a: 130, b: 131 },
    { id: 134, a: 131, b: 132 },
    { id: 135, a: 132, b: 133 },
    { id: 136, a: 133, b: 134 },
    { id: 158, a: 155, b: 156 },
    { id: 159, a: 156, b: 157 },
    { id: 160, a: 157, b: 158 },
    { id: 161, a: 158, b: 159 },
    { id: 162, a: 159, b: 155 },
    { id: 188, a: 184, b: 185 },
    { id: 189, a: 185, b: 186 },
    { id: 194, a: 189, b: 190 },
    { id: 195, a: 190, b: 191 },
    { id: 196, a: 191, b: 192 },
    { id: 197, a: 192, b: 193 },
    { id: 198, a: 193, b: 194 },
    { id: 199, a: 194, b: 195 },
    { id: 200, a: 195, b: 196 },
    { id: 201, a: 196, b: 197 },
    { id: 202, a: 197, b: 198 },
    { id: 203, a: 59, b: 199 },
    { id: 204, a: 199, b: 200 },
    { id: 205, a: 200, b: 201 },
    { id: 206, a: 201, b: 202 },
    { id: 208, a: 204, b: 205 },
    { id: 209, a: 205, b: 206 },
    { id: 210, a: 206, b: 207 },
    { id: 211, a: 207, b: 208 },
    { id: 212, a: 208, b: 209 },
    { id: 213, a: 209, b: 210 },
    { id: 214, a: 210, b: 211 },
    { id: 215, a: 211, b: 212 },
    { id: 216, a: 212, b: 213 },
    { id: 217, a: 213, b: 214 },
    { id: 218, a: 214, b: 215 },
    { id: 219, a: 215, b: 216 },
    { id: 220, a: 216, b: 217 },
    { id: 221, a: 217, b: 218 },
    { id: 222, a: 218, b: 204 },
    { id: 223, a: 219, b: 212 },
    { id: 224, a: 220, b: 221 },
    { id: 225, a: 221, b: 222 },
    { id: 226, a: 222, b: 223 },
    { id: 227, a: 223, b: 220 },
    { id: 228, a: 98, b: 224 },
    { id: 229, a: 224, b: 225 },
    { id: 230, a: 224, b: 226 },
    { id: 231, a: 226, b: 227 },
    { id: 232, a: 226, b: 228 },
    { id: 233, a: 227, b: 229 },
    { id: 234, a: 118, b: 230 },
    { id: 235, a: 230, b: 231 },
    { id: 236, a: 231, b: 232 },
    { id: 237, a: 232, b: 233 },
    { id: 238, a: 233, b: 98 },
    { id: 241, a: 232, b: 237 },
    { id: 242, a: 237, b: 238 },
    { id: 243, a: 233, b: 239 },
    { id: 244, a: 239, b: 240 },
    { id: 245, a: 227, b: 241 },
    { id: 246, a: 229, b: 242 },
    { id: 247, a: 229, b: 243 },
    { id: 252, a: 141, b: 75 },
    { id: 255, a: 128, b: 182 },
    { id: 256, a: 131, b: 247 },
    { id: 257, a: 247, b: 248 },
    { id: 258, a: 132, b: 249 },
    { id: 259, a: 249, b: 250 },
    { id: 260, a: 134, b: 251 },
    { id: 261, a: 251, b: 252 },
    { id: 262, a: 133, b: 253 },
    { id: 263, a: 22, b: 254 },
    { id: 264, a: 254, b: 255 },
    { id: 265, a: 256, b: 254 },
    { id: 266, a: 257, b: 22 },
    { id: 267, a: 258, b: 21 },
    { id: 268, a: 259, b: 21 },
    { id: 269, a: 260, b: 22 },
    { id: 278, a: 267, b: 268 },
    { id: 279, a: 268, b: 269 },
    { id: 280, a: 269, b: 270 },
    { id: 281, a: 270, b: 271 },
    { id: 282, a: 271, b: 272 },
    { id: 283, a: 272, b: 273 },
    { id: 284, a: 273, b: 274 },
    { id: 285, a: 274, b: 275 },
    { id: 286, a: 275, b: 267 },
    { id: 287, a: 276, b: 269 },
    { id: 288, a: 277, b: 278 },
    { id: 289, a: 278, b: 279 },
    { id: 290, a: 279, b: 280 },
    { id: 291, a: 280, b: 281 },
    { id: 292, a: 281, b: 282 },
    { id: 293, a: 282, b: 277 },
    { id: 294, a: 279, b: 283 },
    { id: 295, a: 283, b: 284 },
    { id: 296, a: 284, b: 271 },
    { id: 298, a: 252, b: 253 },
    { id: 299, a: 253, b: 286 },
    { id: 300, a: 286, b: 287 },
    { id: 301, a: 288, b: 289 },
    { id: 302, a: 289, b: 290 },
    { id: 303, a: 290, b: 198 },
    { id: 304, a: 198, b: 291 },
    { id: 305, a: 291, b: 292 },
    { id: 306, a: 292, b: 288 },
    { id: 307, a: 290, b: 286 },
    { id: 308, a: 282, b: 288 },
    { id: 309, a: 274, b: 295 },
    { id: 310, a: 295, b: 296 },
    { id: 311, a: 295, b: 297 },
    { id: 312, a: 297, b: 298 },
    { id: 313, a: 298, b: 204 },
    { id: 314, a: 112, b: 267 },
    { id: 315, a: 275, b: 298 },
    { id: 316, a: 117, b: 80 },
    { id: 317, a: 117, b: 299 },
    { id: 318, a: 299, b: 300 },
    { id: 319, a: 299, b: 118 },
    { id: 320, a: 82, b: 78 },
    { id: 321, a: 214, b: 301 },
    { id: 322, a: 301, b: 302 },
    { id: 323, a: 104, b: 303 },
    { id: 324, a: 104, b: 304 },
    { id: 325, a: 304, b: 305 },
    { id: 326, a: 305, b: 306 },
    { id: 335, a: 310, b: 311 },
    { id: 343, a: 11, b: 314 },
    { id: 344, a: 314, b: 7 },
    { id: 351, a: 319, b: 78 },
    { id: 355, a: 3, b: 5 },
    { id: 364, a: 17, b: 310 },
    { id: 367, a: 331, b: 332 },
    { id: 368, a: 332, b: 156 },
    { id: 369, a: 322, b: 333 },
    { id: 370, a: 333, b: 332 },
    { id: 371, a: 331, b: 333 },
    { id: 372, a: 141, b: 322 },
    { id: 373, a: 322, b: 155 },
    { id: 374, a: 186, b: 334 },
    { id: 375, a: 334, b: 189 },
    { id: 376, a: 157, b: 334 },
    { id: 382, a: 123, b: 141 },
    { id: 383, a: 123, b: 338 },
    { id: 384, a: 338, b: 182 },
    { id: 385, a: 338, b: 331 },
    { id: 387, a: 75, b: 319 },
    { id: 388, a: 311, b: 339 },
    { id: 389, a: 339, b: 340 },
    { id: 390, a: 340, b: 322 },
    { id: 393, a: 344, b: 345 },
    { id: 394, a: 345, b: 346 },
    { id: 395, a: 346, b: 3 },
    { id: 396, a: 344, b: 347 },
    { id: 398, a: 348, b: 349 },
    { id: 399, a: 349, b: 350 },
    { id: 400, a: 350, b: 348 },
    { id: 401, a: 12, b: 351 },
    { id: 402, a: 351, b: 352 },
    { id: 403, a: 352, b: 353 },
    { id: 404, a: 353, b: 354 },
    { id: 405, a: 354, b: 355 },
    { id: 406, a: 355, b: 356 },
    { id: 407, a: 356, b: 14 },
    { id: 408, a: 347, b: 17 },
    { id: 413, a: 14, b: 360 },
    { id: 416, a: 361, b: 362 },
    { id: 417, a: 362, b: 22 },
    { id: 425, a: 362, b: 14 },
    { id: 426, a: 360, b: 361 },
    { id: 427, a: 134, b: 365 },
    { id: 428, a: 365, b: 366 },
    { id: 429, a: 366, b: 367 },
    { id: 430, a: 367, b: 184 },
    { id: 432, a: 360, b: 368 },
    { id: 433, a: 368, b: 311 },
    { id: 435, a: 361, b: 369 },
    { id: 436, a: 369, b: 21 },
    { id: 439, a: 248, b: 249 },
    { id: 440, a: 339, b: 369 }
  ],
  disabledFaceKeys: [
    "133,134,251,252,253:5",
    "274,275,295,297,298:5",
    "117,118,299:3",
    "80,81,82,83,88,89,90,97,98,117,118,230,231,232,233,299,300:19",
    "78,79,80,81,82,117:6",
    "155,156,157,158,159:5",
    "331,332,333:3",
    "155,156,322,332,333:5",
    "123,141,322,331,333,338:6",
    "14,360,361,362:4",
    "134,184,185,186,189,190,191,192,193,194,195,196,197,198,251,252,253,286,287,290,334,365,366,367:25",
    "131,132,247,248,249:5",
    "98,99,105,106,112,113,114,115,116,118,119,120,121,122,123,128,129,130,131,132,133,182,224,225,226,227,228,229,230,231,232,233,237,238,239,240,241,242,243,247,248,249,250,253,267,268,269,270,271,276,277,278,279,282,283,284,286,288,289,290,338:76",
    "311,339,360,361,368,369:6"
  ]
}
)}

function _globeNavMesh(dataNavMesh,htl,d3,countries,waterway_networks_simplified,waterway_networks_nodes,rivers,lakes,buildNavMesh,geometry,pathfinding,AbortController,ResizeObserver,MutationObserver)
{
  // ---- Optional saved nav mesh data ----
  // Paste a saved state into a separate cell named `dataNavMesh` to load
  // points/links/disabled faces on startup. The "save nav mesh" button copies
  // a `dataNavMesh = (...)` assignment ready to paste into that cell.
  const initialNavMesh = (typeof dataNavMesh !== "undefined" && dataNavMesh) || null;

  // Holder lets measureContainerWidth read the wrapper without TDZ access.
  const wrapperRef = { el: null };

  function measureContainerWidth() {
    if (wrapperRef.el && wrapperRef.el.isConnected) {
      const w = wrapperRef.el.parentElement && wrapperRef.el.parentElement.clientWidth;
      if (w && w > 0) return w;
    }
    const bodyW = document.body && document.body.clientWidth;
    if (bodyW && bodyW > 0) return bodyW;
    return 700;
  }

  const HEIGHT = 600;
  let width = measureContainerWidth();
  let height = HEIGHT;

  // ---- Container + toolbar ----
  const wrapper = htl.html`<div style="width: 100%; font: 13px ui-monospace, 'SF Mono', Menlo, monospace;">`;
  wrapperRef.el = wrapper;

  const btnStyle =
    "padding:4px 10px;font:inherit;font-size:12px;cursor:pointer;" +
    "border:1px solid #888;background:#fff;border-radius:4px;";
  const labelStyle =
    "display:inline-flex;align-items:center;gap:4px;cursor:pointer;user-select:none;font-size:12px;color:#555;";

  const toolbar = htl.html`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;box-sizing:border-box;margin-bottom:8px;font-size:12px;color:#555;"></div>`;
  const leftGroup = htl.html`<div style="display:flex;align-items:center;gap:8px;"></div>`;
  const rightGroup = htl.html`<div style="display:flex;align-items:center;gap:12px;"></div>`;
  toolbar.appendChild(leftGroup);
  toolbar.appendChild(rightGroup);

  const saveBtn = htl.html`<button style=${btnStyle}>save nav mesh</button>`;
  const clearBtn = htl.html`<button style=${btnStyle}>clear</button>`;
  const toolbarStatus = htl.html`<span></span>`;
  leftGroup.appendChild(saveBtn);
  leftGroup.appendChild(clearBtn);
  leftGroup.appendChild(toolbarStatus);

  const modeName = "globe-navmesh-mode-" + Math.random().toString(36).slice(2);
  const navmeshRadio = htl.html`<input type="radio" name=${modeName} value="navmesh" checked style="margin:0">`;
  const routesRadio  = htl.html`<input type="radio" name=${modeName} value="routes" style="margin:0">`;
  const navmeshLabel = htl.html`<label style=${labelStyle}>${navmeshRadio}<span>Nav mesh</span></label>`;
  const routesLabel  = htl.html`<label style=${labelStyle}>${routesRadio}<span>Routes</span></label>`;
  rightGroup.appendChild(navmeshLabel);
  rightGroup.appendChild(routesLabel);

  wrapper.appendChild(toolbar);

  // ---- Map container (canvas + overlay SVG stacked) ----
  const mapContainer = htl.html`<div style="position: relative; width: 100%; height: ${height}px;">`;
  wrapper.appendChild(mapContainer);

  const dpr = window.devicePixelRatio || 1;
  const canvas = htl.html`<canvas
    width=${width * dpr}
    height=${height * dpr}
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block;"
  >`;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  mapContainer.appendChild(canvas);

  const overlay = d3.select(mapContainer).append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("position", "absolute")
    .style("top", "0")
    .style("left", "0")
    .style("width", "100%")
    .style("height", "100%");

  overlay.append("style").text(`
    .nm-polygon { fill: rgba(0, 0, 0, 0.08); stroke: none; pointer-events: none; }
    .nm-point { fill: rgba(0, 0, 0, 0.55); stroke: #fff; stroke-width: 1.5; cursor: pointer; }
    .nm-point.virtual { fill: #fafafa; stroke: rgba(0,0,0,0.35); stroke-width: 1.2; pointer-events: none; }
    .nm-link  { stroke: rgba(0, 0, 0, 0.55); stroke-width: 1.5; fill: none; cursor: pointer; }
    .nm-link.interior { stroke-dasharray: 4 4; }
    .nm-pending { stroke-dasharray: 4 4; fill: none; pointer-events: none; }
    .nm-route { stroke-width: 3; fill: none; cursor: pointer; }
    .nm-route-point { cursor: pointer; stroke: #fff; stroke-width: 1.5; }
    .nm-disabled-marker { cursor: pointer; }
    .nm-disabled-marker-hit { fill: transparent; }
    .nm-disabled-marker-x { fill: none; stroke: #000; stroke-width: 2;
                            stroke-linecap: round; pointer-events: none; }
  `);

  // Transparent capture rect: owns globe drag/zoom + click-to-place.
  const bgCapture = overlay.append("rect")
    .attr("x", 0).attr("y", 0)
    .attr("width", width).attr("height", height)
    .attr("fill", "transparent")
    .style("cursor", "grab");

  const polyLayer            = overlay.append("g").attr("class", "polygons");
  const linkLayer            = overlay.append("g").attr("class", "links");
  const routeLayer           = overlay.append("g").attr("class", "routes");
  const pendingLayer         = overlay.append("g").attr("class", "pending");
  const virtualPointLayer    = overlay.append("g").attr("class", "virtual-points");
  const disabledMarkerLayer  = overlay.append("g").attr("class", "disabled-markers");
  const pointLayer           = overlay.append("g").attr("class", "points");
  const routePointLayer      = overlay.append("g").attr("class", "route-points");

  // ---- Land data ----
  const otherLand = {
    type: "FeatureCollection",
    features: countries.features.filter(d => d.properties.kind === "other_land")
  };
  const usLand = {
    type: "FeatureCollection",
    features: countries.features.filter(d => d.properties.kind === "us")
  };

  // ---- Projection ----
  function computeBaseScale(w, h) { return Math.min(w, h) / 2 - 4; }
  let initialScale = computeBaseScale(width, height);
  const projection = d3.geoOrthographic()
    .scale(initialScale)
    .translate([width / 2, height / 2])
    .rotate([98, -39, 0])
    .clipAngle(90);

  const pathCanvas = d3.geoPath(projection, ctx);
  const geoPathSvg = d3.geoPath(projection);

  // ---- Vec3 helpers ----
  function lonLatToVec3([lon, lat]) {
    const lambda = lon * Math.PI / 180;
    const phi = lat * Math.PI / 180;
    const cosPhi = Math.cos(phi);
    return [cosPhi * Math.cos(lambda), cosPhi * Math.sin(lambda), Math.sin(phi)];
  }
  function vec3Dot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
  function vec3Normalize(v) {
    const len = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0]/len, v[1]/len, v[2]/len];
  }
  function geometryVertices(g) {
    if (!g || !g.coordinates) return null;
    switch (g.type) {
      case "Point": return [g.coordinates];
      case "LineString":
      case "MultiPoint": return g.coordinates;
      case "MultiLineString":
      case "Polygon": return g.coordinates.flat();
      case "MultiPolygon": return g.coordinates.flat(2);
      default: return null;
    }
  }

  // ---- Waterway visibility culling via bounding caps ----
  const waterwayMeta = [];
  for (const feature of waterway_networks_simplified.features) {
    const coords = geometryVertices(feature.geometry);
    if (!coords || coords.length === 0) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const c of coords) {
      const v = lonLatToVec3(c);
      sx += v[0]; sy += v[1]; sz += v[2]; n++;
    }
    const centroid = vec3Normalize([sx/n, sy/n, sz/n]);
    let minDot = 1;
    for (const c of coords) {
      const d = vec3Dot(lonLatToVec3(c), centroid);
      if (d < minDot) minDot = d;
    }
    waterwayMeta.push({ feature, centroid, radiusCos: minDot - 0.001 });
  }

  const nodeMeta = [];
  for (const feature of waterway_networks_nodes.features) {
    const coords = feature.geometry && feature.geometry.coordinates;
    if (!coords) continue;
    nodeMeta.push({ lonLat: coords, vec: lonLatToVec3(coords) });
  }

  function getVisibleWaterways() {
    const r = projection.rotate();
    const viewCenter = lonLatToVec3([-r[0], -r[1]]);
    const visible = [];
    for (const m of waterwayMeta) {
      if (vec3Dot(m.centroid, viewCenter) > -m.radiusCos) visible.push(m.feature);
    }
    return { type: "FeatureCollection", features: visible };
  }

  function graticuleStep(scale) {
    const zoomRatio = scale / initialScale;
    if (zoomRatio < 1.5) return 30;
    if (zoomRatio < 3) return 15;
    if (zoomRatio < 6) return 10;
    if (zoomRatio < 12) return 5;
    if (zoomRatio < 25) return 2;
    return 1;
  }

  // ---- Canvas render ----
  function renderCanvas(includeWaterways) {
    const r = projection.scale();
    const cx = width / 2, cy = height / 2;
    const step = graticuleStep(r);
    const graticule = d3.geoGraticule().step([step, step])();

    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = "#c4d8dd";
    ctx.fill();

    ctx.beginPath();
    pathCanvas(graticule);
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    pathCanvas(otherLand);
    ctx.fillStyle = "#e8e6df";
    ctx.fill();

    ctx.beginPath();
    pathCanvas(usLand);
    ctx.fillStyle = "#e8e6df";
    ctx.fill();
    ctx.beginPath();
    pathCanvas(usLand);
    ctx.strokeStyle = "rgba(68,68,68,0.25)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    pathCanvas(graticule);
    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    pathCanvas(rivers);
    ctx.strokeStyle = "#c4d8dd";
    ctx.lineWidth = 1.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.beginPath();
    pathCanvas(lakes);
    ctx.fillStyle = "#c4d8dd";
    ctx.fill();

    if (includeWaterways) {
      const zoomRatio = projection.scale() / initialScale;
      if (zoomRatio >= 0.9) {
        const visible = getVisibleWaterways();
        ctx.beginPath();
        pathCanvas(visible);
        ctx.strokeStyle = "rgba(34, 221, 85, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();

        const r2 = projection.rotate();
        const viewCenter = lonLatToVec3([-r2[0], -r2[1]]);
        const nodeRadius = 2.5;
        ctx.fillStyle = "#22dd55";
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 0.5;
        for (const node of nodeMeta) {
          if (vec3Dot(node.vec, viewCenter) <= 0) continue;
          const p = projection(node.lonLat);
          if (!p) continue;
          ctx.beginPath();
          ctx.arc(p[0], p[1], nodeRadius, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        }
      }
    }
  }

  // ---- Nav mesh state ----
  // Points and route endpoints stored as {lon, lat} so they stick to the globe.
  const ROUTE_PALETTE = (d3.schemeObservable10 || d3.schemeTableau10 || d3.schemeCategory10)
    .filter(c => {
      const lc = c.toLowerCase();
      return lc !== "#4269d0" && lc !== "#97bbf5";
    });

  let mode = "navmesh";
  let pointIdCounter = 0;
  let linkIdCounter = 0;
  let routeIdCounter = 0;
  const navPoints = []; // { id, lon, lat }
  const navLinks  = []; // { id, a, b }
  const routes    = []; // { id, color, start:{lon,lat}, end:{lon,lat} }
  const disabledFaces = new Set();
  let pendingLink = null;
  let pendingRoute = null;
  let mousePos = null;
  let mesh = null;        // result of buildNavMesh on current points/links
  let meshDirty = true;   // true → mesh needs a rebuild on next non-drag render
  let isPointDragging = false; // suppresses mesh rebuild + route render mid-drag

  // Cache of route waypoints keyed by [route.id, mesh identity]. We only
  // need to re-pathfind a route when (a) the mesh changes or (b) one of
  // the route's endpoints moves. Globe drag/zoom changes neither, so a
  // single WeakMap-style cache slashes the cost of those gestures from
  // O(routes × visibility-graph-build) to zero.
  const routeWaypointCache = new WeakMap(); // mesh → Map<routeId, {start, end, waypoints}>

  if (initialNavMesh && typeof initialNavMesh === "object") {
    if (Array.isArray(initialNavMesh.points)) {
      for (const p of initialNavMesh.points) {
        if (p == null) continue;
        navPoints.push({ id: +p.id, lon: +p.lon, lat: +p.lat });
        if (+p.id + 1 > pointIdCounter) pointIdCounter = +p.id + 1;
      }
    }
    if (Array.isArray(initialNavMesh.links)) {
      for (const l of initialNavMesh.links) {
        if (l == null) continue;
        navLinks.push({ id: +l.id, a: +l.a, b: +l.b });
        if (+l.id + 1 > linkIdCounter) linkIdCounter = +l.id + 1;
      }
    }
    if (Array.isArray(initialNavMesh.disabledFaceKeys)) {
      for (const k of initialNavMesh.disabledFaceKeys) disabledFaces.add(k);
    }
  }

  function pointById(id) { return navPoints.find(p => p.id === id); }
  function linkExists(a, b) {
    return navLinks.some(l => (l.a === a && l.b === b) || (l.a === b && l.b === a));
  }
  function removePoint(id) {
    const idx = navPoints.findIndex(p => p.id === id);
    if (idx === -1) return;
    navPoints.splice(idx, 1);
    for (let i = navLinks.length - 1; i >= 0; i--) {
      if (navLinks[i].a === id || navLinks[i].b === id) navLinks.splice(i, 1);
    }
    if (pendingLink && pendingLink.startId === id) pendingLink = null;
    meshDirty = true;
  }

  // ---- Mercator projection for planar pathfinding ----
  // We use Mercator (rotated so the seam sits over the Atlantic at ~20°E)
  // so the US west coast and the Pacific islands stay contiguous on one
  // side of the seam. Mercator is conformal, has straightforward
  // continuous coords, and works cleanly with the existing 2D pathfinding
  // and buildNavMesh code.
  //
  // Trade-offs:
  //   - Heavy area distortion at high latitudes (irrelevant for shipping
  //     routes between US ports and Pacific islands).
  //   - Pixel distance != true distance, so we feed pathfinding an
  //     explicit geodesic distance function for edge weights.
  //   - Standard Web Mercator ±85.05° latitude limit; points beyond that
  //     can't be projected and are skipped.
  //
  // Seam offset: d3.geoMercator's default seam is at ±180°. Rotating the
  // projection by SEAM_OFFSET shifts the seam east by that many degrees;
  // SEAM_OFFSET = -160 puts the seam at lon ≈ +20° (Atlantic), so US +
  // Pacific islands all live on the same side.
  const SEAM_OFFSET = -160;

  function makeMercator() {
    const proj = d3.geoMercator()
      .scale(1000)
      .translate([0, 0])
      .rotate([SEAM_OFFSET, 0, 0]);
    const forward = (lonLat) => proj(lonLat);    // [lon,lat] → [x,y] or null
    const inverse = (xy)     => proj.invert(xy); // [x,y]     → [lon,lat]
    return { forward, inverse, proj };
  }

  // Single shared instance — Mercator doesn't depend on the nav points.
  const mercator = makeMercator();

  // Geodesic (great-circle) distance between two 2D Mercator points,
  // returned in radians of arc on the unit sphere. Used by pathfinding to
  // weight visibility-graph edges so the shortest path is shortest on the
  // sphere, not shortest in pixel space.
  function geodesicDistance(a, b) {
    const aLL = mercator.inverse([a.x, a.y]);
    const bLL = mercator.inverse([b.x, b.y]);
    if (!aLL || !bLL) return Math.hypot(a.x - b.x, a.y - b.y);
    const va = lonLatToVec3(aLL);
    const vb = lonLatToVec3(bLL);
    const d = Math.max(-1, Math.min(1, vec3Dot(va, vb)));
    return Math.acos(d);
  }

  // ---- Build navmesh in Mercator space ----
  function rebuildMesh() {
    if (navPoints.length === 0) {
      mesh = null;
      return;
    }
    const pts2d = [];
    for (const p of navPoints) {
      const xy = mercator.forward([p.lon, p.lat]);
      if (!xy) continue;
      pts2d.push({ id: p.id, x: xy[0], y: xy[1] });
    }
    mesh = buildNavMesh(pts2d, navLinks, disabledFaces);

    // Pre-compute lon/lat for every derived point ONCE per rebuild. The
    // renderers project these to screen each frame; without this cache,
    // they'd run mercator.invert() for every point on every redraw.
    // User points: copy from navPoints. Virtual points: invert their xy.
    const navByUserKey = new Map(navPoints.map(p => ["u" + p.id, p]));
    for (const dp of mesh.derivedPoints) {
      const np = navByUserKey.get(dp.id);
      if (np) {
        dp.lon = np.lon;
        dp.lat = np.lat;
      } else {
        const ll = mercator.inverse([dp.x, dp.y]);
        if (ll) { dp.lon = ll[0]; dp.lat = ll[1]; }
      }
    }
    // Same for face interior points (used by disabled-X markers).
    for (const f of mesh.faces) {
      if (!f.interiorPoint) continue;
      const ll = mercator.inverse([f.interiorPoint.x, f.interiorPoint.y]);
      if (ll) {
        f.interiorPoint.lon = ll[0];
        f.interiorPoint.lat = ll[1];
      }
    }

    // GC disabled keys for faces that no longer exist.
    const liveKeys = new Set(mesh.faces.map(f => f.stableKey));
    [...disabledFaces].forEach(k => { if (!liveKeys.has(k)) disabledFaces.delete(k); });
  }

  // ---- Visibility / projection helpers ----
  function viewCenterVec() {
    const r = projection.rotate();
    return lonLatToVec3([-r[0], -r[1]]);
  }
  function isVisible(lonLat) {
    return vec3Dot(lonLatToVec3(lonLat), viewCenterVec()) > 0;
  }
  function projectLL(lonLat) {
    if (!isVisible(lonLat)) return null;
    return projection(lonLat);
  }
  function invertXY(x, y) {
    const cx = width / 2, cy = height / 2;
    if (Math.hypot(x - cx, y - cy) > projection.scale()) return null;
    return projection.invert([x, y]);
  }
  // Mercator xy → lon/lat (for projecting mesh points back onto the globe)
  function mercToLL(x, y) {
    return mercator.inverse([x, y]);
  }

  // ---- Mouse plumbing ----
  const CLICK_THRESHOLD = 4;

  // Pending renders (mousemove during link/route placement) get throttled
  // to rAF — mousemove can fire hundreds of times per second and each
  // pending-route render runs full pathfinding.
  let pendingRenderFrame = null;
  function schedulePendingRender() {
    if (pendingRenderFrame !== null) return;
    pendingRenderFrame = requestAnimationFrame(() => {
      pendingRenderFrame = null;
      renderPending();
    });
  }

  mapContainer.addEventListener("mousemove", (event) => {
    const rect = mapContainer.getBoundingClientRect();
    mousePos = [event.clientX - rect.left, event.clientY - rect.top];
    if (pendingLink || pendingRoute) schedulePendingRender();
  });

  mapContainer.addEventListener("contextmenu", (event) => {
    if (mode === "navmesh" && pendingLink) {
      event.preventDefault();
      pendingLink = null;
      renderOverlay();
      return;
    }
    if (mode === "routes" && pendingRoute) {
      event.preventDefault();
      if (pendingRoute.id === routeIdCounter - 1) routeIdCounter--;
      pendingRoute = null; pendingRouteCache = null;
      renderOverlay();
      return;
    }
    // Right-click inside a fillable face → disable it.
    const rect = mapContainer.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    const ll = invertXY(x, y);
    if (!ll || !mesh) return;
    const sxy = mercator.forward(ll);
    if (!sxy) return;
    const face = fillableFaceAt(sxy[0], sxy[1]);
    if (face) {
      event.preventDefault();
      disabledFaces.add(face.stableKey);
      meshDirty = true;
      renderOverlay();
    }
  });

  function fillableFaceAt(sx, sy) {
    if (!mesh) return null;
    let bestIdx = -1, bestDepth = -1;
    for (let i = 0; i < mesh.faces.length; i++) {
      const f = mesh.faces[i];
      if (!geometry.pointInRing(sx, sy, mesh.ringToXY(f.ring))) continue;
      if (f.depth > bestDepth) { bestDepth = f.depth; bestIdx = i; }
    }
    if (bestIdx === -1) return null;
    const f = mesh.faces[bestIdx];
    return (f.isArea && !f.disabled) ? f : null;
  }

  function handleBackgroundClick(x, y) {
    const lonLat = invertXY(x, y);
    if (!lonLat) return;

    if (mode === "navmesh") {
      const id = pointIdCounter++;
      navPoints.push({ id, lon: lonLat[0], lat: lonLat[1] });
      if (pendingLink) {
        const a = pendingLink.startId;
        if (a !== id && !linkExists(a, id)) navLinks.push({ id: linkIdCounter++, a, b: id });
      }
      pendingLink = { startId: id };
      meshDirty = true;
      renderOverlay();
      return;
    }
    if (mode === "routes") {
      if (!pendingRoute) {
        const id = routeIdCounter++;
        pendingRoute = {
          id,
          color: ROUTE_PALETTE[id % ROUTE_PALETTE.length],
          start: { lon: lonLat[0], lat: lonLat[1] }
        };
      } else {
        routes.push({
          id: pendingRoute.id,
          color: pendingRoute.color,
          start: pendingRoute.start,
          end: { lon: lonLat[0], lat: lonLat[1] }
        });
        pendingRoute = null; pendingRouteCache = null;
      }
      renderOverlay();
    }
  }

  function handlePointClick(d) {
    if (mode !== "navmesh") return;
    if (!pendingLink) {
      pendingLink = { startId: d.id };
    } else {
      const a = pendingLink.startId, b = d.id;
      if (a !== b && !linkExists(a, b)) {
        navLinks.push({ id: linkIdCounter++, a, b });
        meshDirty = true;
      }
      pendingLink = null;
    }
    renderOverlay();
  }

  toolbar.addEventListener("change", (ev) => {
    if (!ev.target || ev.target.tagName !== "INPUT" || ev.target.type !== "radio") return;
    mode = ev.target.value;
    pendingLink = null;
    if (pendingRoute && pendingRoute.id === routeIdCounter - 1) routeIdCounter--;
    pendingRoute = null; pendingRouteCache = null;
    renderOverlay();
  });

  // ---- Overlay renderers ----
  function dataJoin(parent, tag, cls, data, dataKey, init, update) {
    const sel = parent.selectAll(tag + "." + cls).data(data, dataKey);
    const entered = sel.enter().append(tag).attr("class", cls);
    if (init) init(entered);
    const merged = entered.merge(sel);
    if (update) update(merged);
    sel.exit().remove();
    return merged;
  }

  // Great-circle path between two lon/lat points (clipped at the horizon
  // by d3.geoPath's clipAngle).
  function greatCirclePath(aLL, bLL) {
    return geoPathSvg({
      type: "LineString",
      coordinates: [[aLL.lon, aLL.lat], [bLL.lon, bLL.lat]]
    }) || "";
  }

  // Convert a ring of Mercator ids into a list of lon/lat coordinates,
  // ready to feed into d3.geoPath as a Polygon/LineString.
  function ringToLonLat(ringIds) {
    if (!mesh) return null;
    const coords = [];
    for (const pid of ringIds) {
      const dp = mesh.dPointById(pid);
      if (!dp || dp.lon == null) return null;
      coords.push([dp.lon, dp.lat]);
    }
    return coords;
  }

  function clusterToGeoPolygon(cluster) {
    // Each cluster has 0+ rings (outer + holes). d3.geoPath with the orthographic
    // projection's clipAngle handles back-of-globe clipping.
    const rings = [];
    for (const ring of cluster.rings) {
      const lls = ringToLonLat(ring);
      if (!lls || lls.length < 3) continue;
      // Close the ring
      const closed = lls.slice();
      const f = closed[0], l = closed[closed.length - 1];
      if (f[0] !== l[0] || f[1] !== l[1]) closed.push([f[0], f[1]]);
      rings.push(closed);
    }
    if (rings.length === 0) return null;
    return { type: "Polygon", coordinates: rings };
  }

  function renderPolygons() {
    if (!mesh) {
      polyLayer.selectAll("*").remove();
      return;
    }
    const data = mesh.clusters
      .map(c => ({ key: c.key, geo: clusterToGeoPolygon(c) }))
      .filter(d => d.geo);
    dataJoin(polyLayer, "path", "nm-polygon",
      data, d => d.key,
      sel => sel.attr("fill-rule", "evenodd"),
      sel => sel.attr("d", d => geoPathSvg(d.geo) || "")
    );
  }

  // Two batched paths instead of N individual <path> elements: one for
  // solid (boundary/external) links, one for interior (dashed) links.
  // d3.geoPath handles a MultiLineString with one projection setup, so
  // we get O(links) work for the projection itself but only O(1) DOM
  // mutations. At ~310 links this saves a lot of DOM churn per frame.
  // Note: this removes the per-link dblclick handler — link deletion
  // now happens implicitly via point deletion.
  function renderLinks() {
    if (!mesh) {
      linkLayer.selectAll("*").remove();
      return;
    }
    const solidCoords = [];   // array of [[lon,lat],[lon,lat]] segments
    const interiorCoords = [];
    for (const dl of mesh.derivedLinks) {
      const a = mesh.dPointById(dl.a), b = mesh.dPointById(dl.b);
      if (!a || !b || a.lon == null || b.lon == null) continue;
      const aVis = isVisibleVec(a);
      const bVis = isVisibleVec(b);
      if (!aVis && !bVis) continue; // both behind the globe — skip
      const seg = [[a.lon, a.lat], [b.lon, b.lat]];
      if (mesh.interiorEdges.has(mesh.edgeKeyU(dl.a, dl.b))) interiorCoords.push(seg);
      else solidCoords.push(seg);
    }

    // Ensure exactly two child paths exist (create on first call, reuse after).
    let solid = linkLayer.select("path.nm-link.solid");
    if (solid.empty()) solid = linkLayer.append("path").attr("class", "nm-link solid");
    let dashed = linkLayer.select("path.nm-link.interior");
    if (dashed.empty()) dashed = linkLayer.append("path").attr("class", "nm-link interior");

    solid.attr("d", solidCoords.length
      ? geoPathSvg({ type: "MultiLineString", coordinates: solidCoords }) || ""
      : "");
    dashed.attr("d", interiorCoords.length
      ? geoPathSvg({ type: "MultiLineString", coordinates: interiorCoords }) || ""
      : "");
  }

  // Visibility test that uses a cached unit-sphere vector on the derived
  // point object instead of recomputing lonLatToVec3 every call.
  function isVisibleVec(dp) {
    if (!dp.vec) dp.vec = lonLatToVec3([dp.lon, dp.lat]);
    return vec3Dot(dp.vec, _frameViewCenter) > 0;
  }
  let _frameViewCenter = [1, 0, 0]; // recomputed in renderOverlay

  function renderVirtualPoints() {
    if (!mesh) {
      virtualPointLayer.selectAll("*").remove();
      return;
    }
    const vps = mesh.derivedPoints
      .filter(p => p.virtual)
      .map(p => {
        if (p.lon == null) return null;
        const ll = [p.lon, p.lat];
        if (!isVisible(ll)) return null;
        const xy = projection(ll);
        if (!xy) return null;
        return { id: p.id, x: xy[0], y: xy[1] };
      })
      .filter(Boolean);
    dataJoin(virtualPointLayer, "circle", "nm-point virtual",
      vps, d => d.id,
      sel => sel.attr("class", "nm-point virtual").attr("r", 4),
      sel => sel.attr("cx", d => d.x).attr("cy", d => d.y)
    );
  }

  function renderDisabledMarkers() {
    if (!mesh) {
      disabledMarkerLayer.selectAll("*").remove();
      return;
    }
    const list = [];
    mesh.faces.forEach(f => {
      if (!(f.disabled && f.isArea && f.interiorPoint)) return;
      if (f.interiorPoint.lon == null) return;
      const ll = [f.interiorPoint.lon, f.interiorPoint.lat];
      if (!isVisible(ll)) return;
      const xy = projection(ll);
      if (!xy) return;
      list.push({ stableKey: f.stableKey, x: xy[0], y: xy[1] });
    });
    const ARM = 7, HIT_R = 14;
    function xPath(d) {
      return `M ${d.x - ARM} ${d.y - ARM} L ${d.x + ARM} ${d.y + ARM} ` +
             `M ${d.x + ARM} ${d.y - ARM} L ${d.x - ARM} ${d.y + ARM}`;
    }
    const sel = disabledMarkerLayer.selectAll("g.nm-disabled-marker")
      .data(list, d => d.stableKey);
    const entered = sel.enter().append("g")
      .attr("class", "nm-disabled-marker")
      .on("dblclick", function (event, d) {
        event.stopPropagation();
        event.preventDefault();
        disabledFaces.delete(d.stableKey);
        meshDirty = true;
        renderOverlay();
      });
    entered.append("circle").attr("class", "nm-disabled-marker-hit");
    entered.append("path").attr("class", "nm-disabled-marker-x");
    const merged = entered.merge(sel);
    merged.select("circle.nm-disabled-marker-hit")
      .attr("cx", d => d.x).attr("cy", d => d.y).attr("r", HIT_R);
    merged.select("path.nm-disabled-marker-x").attr("d", xPath);
    sel.exit().remove();
  }

  // ---- Pathfinding ----
  // Delegates to the pathfinding cell, which operates in 2D planar space.
  // We project lon/lat endpoints into Mercator coords (the same space the
  // mesh was built in), call pathfinding.routeWaypoints, and project the
  // resulting waypoints back to lon/lat for great-circle rendering.
  //
  // Distance metric: Euclidean (the pathfinding cell's default). Mercator
  // distorts distance heavily near the poles, but the regional spread of
  // shipping routes between US ports and Pacific islands is well-behaved
  // enough that Euclidean produces the same path choices as true geodesic
  // ordering. The geodesicDistance helper below stays available as a hook
  // if a future region needs it.
  //
  // pathfinding handles:
  //   - snapping off-mesh endpoints to the nearest vertex OR edge,
  //   - visibility-graph shortest path so routes cut straight through
  //     walkable areas instead of zig-zagging vertex-to-vertex,
  //   - caching the core graph on the mesh object for fast re-routing.
  function routeWaypoints(start, end) {
    if (!mesh || navPoints.length === 0) {
      return [start, end];
    }
    const sStart = mercator.forward([start.lon, start.lat]);
    const sEnd   = mercator.forward([end.lon,   end.lat]);
    if (!sStart || !sEnd) return [start, end];

    const sStartPt = { x: sStart[0], y: sStart[1] };
    const sEndPt   = { x: sEnd[0],   y: sEnd[1] };
    const middle = pathfinding.routeWaypoints(sStartPt, sEndPt, mesh);

    // pathfinding returns [start, ...intermediate, end] in Mercator coords.
    // We re-attach the original lon/lat endpoints (preserving exact
    // placement instead of round-tripping through Mercator → lon/lat).
    const out = [start];
    for (let i = 1; i < middle.length - 1; i++) {
      const ll = mercToLL(middle[i].x, middle[i].y);
      if (!ll) continue;
      out.push({ lon: ll[0], lat: ll[1] });
    }
    out.push(end);
    return out;
  }

  // Cached variant: looks up waypoints by (mesh, route.id) and recomputes
  // only when the cache misses or the route's endpoints have moved.
  function cachedRouteWaypoints(route) {
    if (!mesh) return routeWaypoints(route.start, route.end);
    let perMesh = routeWaypointCache.get(mesh);
    if (!perMesh) {
      perMesh = new Map();
      routeWaypointCache.set(mesh, perMesh);
    }
    const cached = perMesh.get(route.id);
    if (cached
        && cached.startLon === route.start.lon && cached.startLat === route.start.lat
        && cached.endLon   === route.end.lon   && cached.endLat   === route.end.lat) {
      return cached.waypoints;
    }
    const waypoints = routeWaypoints(route.start, route.end);
    perMesh.set(route.id, {
      startLon: route.start.lon, startLat: route.start.lat,
      endLon:   route.end.lon,   endLat:   route.end.lat,
      waypoints,
    });
    return waypoints;
  }

  // Memoize the in-flight pending route to short-circuit redundant
  // pathfinding when the cursor barely moves between renders. The cache
  // is invalidated when (a) the mesh changes (object identity), (b) the
  // pendingRoute's start changes (new placement gesture), or (c) the end
  // moves more than a small lat/lon threshold.
  let pendingRouteCache = null;
  const PENDING_QUANTIZE = 0.05; // ~5 km at the equator
  function pendingRouteWaypoints(start, end) {
    if (pendingRouteCache
        && pendingRouteCache.mesh === mesh
        && pendingRouteCache.startLon === start.lon
        && pendingRouteCache.startLat === start.lat
        && Math.abs(pendingRouteCache.endLon - end.lon) < PENDING_QUANTIZE
        && Math.abs(pendingRouteCache.endLat - end.lat) < PENDING_QUANTIZE) {
      return pendingRouteCache.waypoints;
    }
    const waypoints = routeWaypoints(start, end);
    pendingRouteCache = {
      mesh,
      startLon: start.lon, startLat: start.lat,
      endLon: end.lon, endLat: end.lat,
      waypoints,
    };
    return waypoints;
  }

  function routePathString(route) {
    // Saved routes have a stable id and go through the mesh-keyed cache.
    // Pending routes (drawn while the user is placing a new one) have no
    // id, so they fall back to the live compute.
    const waypoints = (route.id != null)
      ? cachedRouteWaypoints(route)
      : routeWaypoints(route.start, route.end);
    const coords = waypoints.map(w => [w.lon, w.lat]);
    return geoPathSvg({ type: "LineString", coordinates: coords }) || "";
  }

  // Background queue: when the mesh is rebuilt, all routes' waypoint
  // caches miss. Computing all of them on the same frame freezes the UI
  // for a noticeable beat at large mesh sizes. Instead, queue route ids
  // and process one per animation frame so the user sees the mesh update
  // instantly and the routes "fill in" smoothly.
  let routeQueue = [];
  let routeQueueFrame = null;

  function enqueueAllRouteRecomputes() {
    routeQueue = routes.map(r => r.id);
    if (routeQueueFrame === null) routeQueueFrame = requestAnimationFrame(drainRouteQueue);
  }

  function drainRouteQueue() {
    routeQueueFrame = null;
    if (routeQueue.length === 0) return;
    const id = routeQueue.shift();
    const route = routes.find(r => r.id === id);
    if (route) {
      const d = routePathString(route);
      routeLayer.selectAll("path.nm-route")
        .filter(rd => rd.id === id)
        .attr("d", d);
    }
    if (routeQueue.length > 0) {
      routeQueueFrame = requestAnimationFrame(drainRouteQueue);
    }
  }

  // Check whether a route already has cached waypoints for the current mesh.
  function routeHasCachedWaypoints(route) {
    if (!mesh) return false;
    const perMesh = routeWaypointCache.get(mesh);
    if (!perMesh) return false;
    const cached = perMesh.get(route.id);
    return !!(cached
      && cached.startLon === route.start.lon && cached.startLat === route.start.lat
      && cached.endLon   === route.end.lon   && cached.endLat   === route.end.lat);
  }

  function renderRoutes() {
    // Two-pass: first render every route with cached `d` if available
    // (cheap); collect uncached routes; if any are uncached and there's
    // more than 1 of them, queue background recomputation.
    const stale = [];
    dataJoin(routeLayer, "path", "nm-route",
      routes, d => d.id,
      sel => sel.on("dblclick", function (event, d) {
        event.stopPropagation();
        event.preventDefault();
        const idx = routes.findIndex(r => r.id === d.id);
        if (idx !== -1) routes.splice(idx, 1);
        renderOverlay();
      }),
      sel => sel
        .attr("stroke", d => d.color)
        .attr("d", function (d) {
          if (routeHasCachedWaypoints(d)) {
            return routePathString(d);
          }
          // Cache miss → defer
          stale.push(d.id);
          // Return existing attribute or empty (so paths don't disappear
          // mid-recompute — D3 leaves the prior attr in place if we don't
          // set it, but since we're inside .attr("d", ...) we must return
          // something. Reading the current DOM attr lets the path stay
          // visible at its last-known shape until the queue updates it.)
          return d3.select(this).attr("d") || "";
        })
    );
    // If only one route is stale, do it inline — no point queuing a single
    // item. If many, batch them across frames.
    if (stale.length === 1) {
      const route = routes.find(r => r.id === stale[0]);
      if (route) {
        const d = routePathString(route);
        routeLayer.selectAll("path.nm-route")
          .filter(rd => rd.id === route.id)
          .attr("d", d);
      }
    } else if (stale.length > 1) {
      routeQueue = stale;
      if (routeQueueFrame === null) routeQueueFrame = requestAnimationFrame(drainRouteQueue);
    }
  }

  function renderPoints() {
    const pointDrag = d3.drag()
      .filter(event => !event.button)
      .on("start", function (event, d) {
        d3.select(this).raise();
        d._dragMoved = false;
        isPointDragging = true;
      })
      .on("drag", function (event, d) {
        const ll = invertXY(event.x, event.y);
        if (!ll) return;
        d.lon = ll[0]; d.lat = ll[1];
        d._dragMoved = true;
        renderOverlay();
      })
      .on("end", function (event, d) {
        isPointDragging = false;
        if (d._dragMoved) {
          // Point moved → mesh topology might have changed (e.g., dragged
          // through a link). Mark dirty so the deferred render does a full
          // rebuild before painting.
          meshDirty = true;
        }
        // Full rebuild (if dirty) + route re-render now that the drag is done.
        renderOverlay();
        if (d._dragMoved) {
          d._lastDragEndedAt = Date.now();
          return;
        }
        handlePointClick(d);
      });

    const visible = navPoints.filter(p => isVisible([p.lon, p.lat]));
    dataJoin(pointLayer, "circle", "nm-point",
      visible, d => d.id,
      sel => sel
        .attr("r", 5)
        .on("dblclick", function (event, d) {
          event.stopPropagation();
          event.preventDefault();
          if (mode !== "navmesh") return;
          if (d._lastDragEndedAt && Date.now() - d._lastDragEndedAt < 300) return;
          removePoint(d.id);
          renderOverlay();
        })
        .call(pointDrag),
      sel => sel.each(function (d) {
        const xy = projectLL([d.lon, d.lat]);
        if (!xy) return;
        d3.select(this).attr("cx", xy[0]).attr("cy", xy[1]);
      })
    );
  }

  function renderRoutePoints() {
    const eps = [];
    routes.forEach(r => {
      eps.push({ routeId: r.id, kind: "start", lon: r.start.lon, lat: r.start.lat, color: r.color });
      eps.push({ routeId: r.id, kind: "end",   lon: r.end.lon,   lat: r.end.lat,   color: r.color });
    });
    const visible = eps.filter(d => isVisible([d.lon, d.lat]));

    const routePointDrag = d3.drag()
      .on("start", function () {
        d3.select(this).raise();
        isPointDragging = true;
      })
      .on("drag", function (event, d) {
        const ll = invertXY(event.x, event.y);
        if (!ll) return;
        const route = routes.find(r => r.id === d.routeId);
        if (!route) return;
        const target = d.kind === "start" ? route.start : route.end;
        target.lon = ll[0]; target.lat = ll[1];
        d.lon = ll[0]; d.lat = ll[1];
        // Only re-render the dragged route + its endpoint so we stay fast.
        // The other routes don't change and don't need re-pathfinding.
        renderOverlayDuringRouteDrag(route);
      })
      .on("end", function () {
        isPointDragging = false;
        renderOverlay();
      });

    dataJoin(routePointLayer, "circle", "nm-route-point",
      visible, d => d.routeId + "-" + d.kind,
      sel => sel
        .attr("r", 7)
        .on("dblclick", function (event, d) {
          event.stopPropagation();
          event.preventDefault();
          const idx = routes.findIndex(r => r.id === d.routeId);
          if (idx !== -1) routes.splice(idx, 1);
          renderOverlay();
        })
        .call(routePointDrag),
      sel => sel
        .attr("fill", d => d.color)
        .each(function (d) {
          const xy = projectLL([d.lon, d.lat]);
          if (!xy) return;
          d3.select(this).attr("cx", xy[0]).attr("cy", xy[1]);
        })
    );
  }

  function renderPending() {
    pendingLayer.selectAll("*").remove();
    if (pendingLink && mousePos) {
      const sp = pointById(pendingLink.startId);
      if (!sp) return;
      const ll = invertXY(mousePos[0], mousePos[1]);
      if (!ll) return;
      const d = greatCirclePath(
        { lon: sp.lon, lat: sp.lat },
        { lon: ll[0],  lat: ll[1] }
      );
      if (d) {
        pendingLayer.append("path")
          .attr("class", "nm-pending")
          .attr("stroke", "rgba(0,0,0,0.55)")
          .attr("stroke-width", 1.5)
          .attr("d", d);
      }
    }
    if (pendingRoute && mousePos) {
      const ll = invertXY(mousePos[0], mousePos[1]);
      if (!ll) return;
      const waypoints = pendingRouteWaypoints(
        pendingRoute.start,
        { lon: ll[0], lat: ll[1] }
      );
      const coords = waypoints.map(w => [w.lon, w.lat]);
      const d = geoPathSvg({ type: "LineString", coordinates: coords }) || "";
      if (d) {
        pendingLayer.append("path")
          .attr("class", "nm-pending")
          .attr("stroke", pendingRoute.color)
          .attr("stroke-width", 3)
          .attr("d", d);
      }
    }
  }

  function renderOverlay() {
    // Cache the view center vec once per frame; renderers reuse it
    // instead of recomputing for every point visibility test.
    const r = projection.rotate();
    _frameViewCenter = lonLatToVec3([-r[0], -r[1]]);

    // During an active point drag we skip the expensive bits:
    //   - mesh rebuild (buildNavMesh is O(L²) for crossings),
    //   - route pathfinding (rebuilds visibility graph against a fresh mesh).
    // We still re-project points/links/routes using the stale mesh so the
    // visuals stay consistent. When the drag ends, the .on("end") handler
    // calls renderOverlay() again with the flag cleared, doing a full
    // rebuild once.
    if (isPointDragging) {
      patchMeshFromNavPoints();
      renderPolygons();
      renderLinks();
      renderVirtualPoints();
      renderDisabledMarkers();
      renderPoints();
      renderRoutePoints();
      renderPending();
      return;
    }

    // Globe drag/zoom: the mesh hasn't changed, but the orthographic
    // projection has. Skip the mesh rebuild AND the route pathfinding
    // (cached waypoints stay valid since mesh identity is unchanged).
    // We only re-project everything to screen.
    if (isDragging || isZooming) {
      renderPolygons();
      renderLinks();
      renderRoutes();
      renderVirtualPoints();
      renderDisabledMarkers();
      renderPoints();
      renderRoutePoints();
      renderPending();
      return;
    }

    // Full render path. The mesh is rebuilt only when something has
    // changed since the last rebuild — point add/remove, link add/remove,
    // face disable/enable, or a point drag finishing. Mode toggles and
    // route edits don't dirty the mesh.
    if (meshDirty) {
      rebuildMesh();
      meshDirty = false;
    }
    renderPolygons();
    renderLinks();
    renderRoutes();
    renderVirtualPoints();
    renderDisabledMarkers();
    renderPoints();
    renderRoutePoints();
    renderPending();
  }

  // Cheap drag-time mesh patch: re-project every user nav point through
  // Mercator into the existing mesh.derivedPoints. Virtual points (link
  // crossings) keep their old positions — they'll be regenerated on the
  // next full rebuild at drag end.
  function patchMeshFromNavPoints() {
    if (!mesh) return;
    for (const p of navPoints) {
      const dp = mesh.dPointById("u" + p.id);
      if (!dp) continue;
      const xy = mercator.forward([p.lon, p.lat]);
      if (!xy) continue;
      dp.x = xy[0];
      dp.y = xy[1];
      // Keep cached lon/lat + unit-sphere vec in sync — renderers read these.
      dp.lon = p.lon;
      dp.lat = p.lat;
      dp.vec = null; // force isVisibleVec to recompute next frame
    }
  }

  // When only a single route endpoint moves, the mesh is unchanged. We can
  // update just that route's path string and its endpoint marker, and skip
  // every other render step.
  function renderOverlayDuringRouteDrag(route) {
    routeLayer.selectAll("path.nm-route")
      .filter(d => d.id === route.id)
      .attr("d", routePathString(route));
    routePointLayer.selectAll("circle.nm-route-point")
      .filter(d => d.routeId === route.id)
      .each(function (d) {
        const xy = projectLL([d.lon, d.lat]);
        if (!xy) return;
        d3.select(this).attr("cx", xy[0]).attr("cy", xy[1]);
      });
  }

  // ---- Interaction state for globe drag/zoom ----
  let pendingFrame = null;
  let isDragging = false;
  let isZooming = false;
  let zoomEndTimer = null;

  function interacting() { return isDragging || isZooming; }
  function cancelPendingRender() {
    if (pendingFrame !== null) {
      cancelAnimationFrame(pendingFrame);
      pendingFrame = null;
    }
  }
  function scheduleRender() {
    if (pendingFrame !== null) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = null;
      renderCanvas(!interacting());
      renderOverlay();
    });
  }

  // ---- Resize handling ----
  function applyResize() {
    const newWidth = measureContainerWidth();
    if (!newWidth || newWidth <= 0) return;
    if (newWidth === width) return;

    const oldRatio = projection.scale() / initialScale;
    width = newWidth;
    height = HEIGHT;

    const cdpr = window.devicePixelRatio || 1;
    canvas.width = width * cdpr;
    canvas.height = height * cdpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(cdpr, cdpr);

    overlay
      .attr("width", width).attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);
    bgCapture.attr("width", width).attr("height", height);

    initialScale = computeBaseScale(width, height);
    projection.translate([width / 2, height / 2]).scale(initialScale * oldRatio);

    cancelPendingRender();
    renderCanvas(!interacting());
    renderOverlay();
  }

  renderCanvas(true);
  renderOverlay();

  // ---- Drag on bgCapture: rotate globe + click-to-place ----
  let bgDragMoved = false;
  let bgDragStart = null;
  const bgDrag = d3.drag()
    .on("start", (event) => {
      bgDragMoved = false;
      bgDragStart = [event.x, event.y];
      bgCapture.style("cursor", "grabbing");
    })
    .on("drag", (event) => {
      if (!bgDragMoved) {
        const dx = event.x - bgDragStart[0];
        const dy = event.y - bgDragStart[1];
        if (Math.hypot(dx, dy) > CLICK_THRESHOLD) bgDragMoved = true;
      }
      if (!bgDragMoved) return;
      if (!isDragging) {
        isDragging = true;
        cancelPendingRender();
        clearTimeout(zoomEndTimer);
        renderCanvas(false);
      }
      const rotate = projection.rotate();
      const k = 75 / projection.scale();
      projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k, rotate[2]]);
      scheduleRender();
    })
    .on("end", () => {
      bgCapture.style("cursor", "grab");
      if (isDragging) {
        isDragging = false;
        if (!isZooming) scheduleRender();
      } else if (!bgDragMoved && bgDragStart) {
        handleBackgroundClick(bgDragStart[0], bgDragStart[1]);
      }
      bgDragStart = null;
    });
  bgCapture.call(bgDrag);

  // ---- Wheel to zoom ----
  overlay.node().addEventListener("wheel", (event) => {
    event.preventDefault();
    const factor = Math.exp(-event.deltaY * 0.001);
    const newScale = Math.max(initialScale * 0.5, Math.min(initialScale * 200, projection.scale() * factor));
    projection.scale(newScale);
    if (!isZooming) { isZooming = true; cancelPendingRender(); }
    scheduleRender();
    clearTimeout(zoomEndTimer);
    zoomEndTimer = setTimeout(() => {
      isZooming = false;
      if (!isDragging) scheduleRender();
    }, 120);
  }, { passive: false });

  // ---- Toolbar wiring: save / clear ----
  function serializeNavMesh() {
    const round5 = (n) => Math.round(n * 100000) / 100000;
    const pointLines = navPoints.map(p =>
      `    { id: ${p.id}, lon: ${round5(p.lon)}, lat: ${round5(p.lat)} }`
    );
    const linkLines = navLinks.map(l =>
      `    { id: ${l.id}, a: ${l.a}, b: ${l.b} }`
    );
    const disabledLines = [...disabledFaces].map(k => `    ${JSON.stringify(k)}`);
    const block = (label, lines) => lines.length
      ? `  ${label}: [\n${lines.join(",\n")}\n  ]`
      : `  ${label}: []`;
    return "dataNavMesh = ({\n" + [
      block("points", pointLines),
      block("links",  linkLines),
      block("disabledFaceKeys", disabledLines),
    ].join(",\n") + "\n})";
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (_) {}
      document.body.removeChild(ta);
      return ok;
    }
  }

  function flashStatus(text) {
    toolbarStatus.textContent = text;
    setTimeout(() => { toolbarStatus.textContent = ""; }, 1500);
  }

  saveBtn.addEventListener("click", async () => {
    const ok = await copyText(serializeNavMesh());
    flashStatus(ok
      ? `copied ${navPoints.length}p · ${navLinks.length}l · ${disabledFaces.size}d`
      : "copy failed");
  });

  clearBtn.addEventListener("click", () => {
    navPoints.length = 0;
    navLinks.length = 0;
    routes.length = 0;
    disabledFaces.clear();
    pointIdCounter = 0;
    linkIdCounter = 0;
    routeIdCounter = 0;
    pendingLink = null;
    pendingRoute = null; pendingRouteCache = null;
    meshDirty = true;
    renderOverlay();
    flashStatus("cleared");
  });

  // ---- Resize observer (rAF-debounced) ----
  const resizeAbort = new AbortController();
  let resizeFrame = null;
  function scheduleResize() {
    if (resizeFrame !== null) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;
      applyResize();
    });
  }

  let resizeObserver = null;
  setTimeout(() => {
    applyResize();
    const target = wrapper.parentElement || document.body;
    if (typeof ResizeObserver !== "undefined" && target) {
      resizeObserver = new ResizeObserver(() => scheduleResize());
      resizeObserver.observe(target);
    } else {
      window.addEventListener("resize", scheduleResize, { signal: resizeAbort.signal });
    }
  }, 0);

  const detachObserver = new MutationObserver(() => {
    if (!document.body.contains(wrapper)) {
      resizeAbort.abort();
      if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
      detachObserver.disconnect();
    }
  });
  setTimeout(() => {
    if (document.body.contains(wrapper)) {
      detachObserver.observe(document.body, { childList: true, subtree: true });
    }
  }, 0);

  return wrapper;
}


function _68(md){return(
md`## Route Voyages`
)}

function _69(md){return(
md`The data from each tab of the google sheets needs to be integrated into data we can use.`
)}

function _70(md){return(
md`Since shipping is limited to US, we can define a camera range, which will also restrict the paths enough that we don't need to clip paths on the other side of the globe.`
)}

function _cameraRange(){return(
{
  minLon: -150,
  maxLon: -65,   
  minLat: 7,
  maxLat: 62,

  initialLon: -100,
  initialLat: 38,
  initialZoom: 1.9,
  minZoom: 1.8,
  maxZoom: 20,
}
)}

function _72(md){return(
md`We can create a basic chart with the nav mesh, raw routes, and waypoint classification to spot any issues with the current nav mesh routing.`
)}

function _globe(htl,d3,countries,navMesh,combinedPathNetwork,pathfinding,classifyPathNodes,globeRoutesHelpers,dataRoute,cameraRange,dataNavMesh,buildNavMesh,rivers,lakes,AbortController,ResizeObserver,MutationObserver)
{
  // Holder lets measureContainerWidth read the wrapper without TDZ access.
  const wrapperRef = { el: null };

  function measureContainerWidth() {
    if (wrapperRef.el && wrapperRef.el.isConnected) {
      const w = wrapperRef.el.parentElement && wrapperRef.el.parentElement.clientWidth;
      if (w && w > 0) return w;
    }
    const bodyW = document.body && document.body.clientWidth;
    if (bodyW && bodyW > 0) return bodyW;
    return 700;
  }

  const HEIGHT = 600;
  let width = measureContainerWidth();
  let height = HEIGHT;

  // ---- Container ----
  const wrapper = htl.html`<div style="width: 100%; font: 13px ui-monospace, 'SF Mono', Menlo, monospace;">`;
  wrapperRef.el = wrapper;

  // ---- Map container (canvas + overlay SVG stacked) ----
  const mapContainer = htl.html`<div style="position: relative; width: 100%; height: ${height}px;">`;
  wrapper.appendChild(mapContainer);

  // Two DPR levels: full quality when idle, dropped during drag/zoom.
  // 1.0 during interaction gives smooth 60fps on retina displays where
  // we'd otherwise be rendering 4x the pixels.
  const FULL_DPR = window.devicePixelRatio || 1;
  const DRAG_DPR = 1;
  let currentDpr = FULL_DPR;

  const canvas = htl.html`<canvas
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block;"
  >`;
  const ctx = canvas.getContext("2d");
  mapContainer.appendChild(canvas);

  function setCanvasDpr(dpr) {
    currentDpr = dpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  setCanvasDpr(FULL_DPR);

  const overlay = d3.select(mapContainer).append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("position", "absolute")
    .style("top", "0")
    .style("left", "0")
    .style("width", "100%")
    .style("height", "100%");

  // Transparent capture rect: owns globe drag/zoom.
  const bgCapture = overlay.append("rect")
    .attr("x", 0).attr("y", 0)
    .attr("width", width).attr("height", height)
    .attr("fill", "transparent")
    .style("cursor", "grab");

  // Nav mesh layer — sits visually above the canvas-rendered geography
  // but below the routes layer. Same pointer-events:none rule so the
  // globe stays draggable.
  const navmeshLayer = overlay.append("g")
    .attr("class", "navmesh")
    .style("pointer-events", "none");

  // Routes layer — sits visually above the canvas-rendered geography.
  // pointer-events:none so all clicks/drags pass through to bgCapture
  // and the globe stays draggable from anywhere in the viewport.
  // Children: <path> for each route + two <circle>s for endpoints.
  const routesLayer = overlay.append("g")
    .attr("class", "routes")
    .style("pointer-events", "none");

  // Junctions layer — on top of routes, so the classification markers
  // (square/circle/triangle) are visible over the path lines.
  const junctionsLayer = overlay.append("g")
    .attr("class", "junctions")
    .style("pointer-events", "none");

  // ---- Land data + simplified versions for drag ----
  const otherLand = {
    type: "FeatureCollection",
    features: countries.features.filter(d => d.properties.kind === "other_land")
  };
  const usLand = {
    type: "FeatureCollection",
    features: countries.features.filter(d => d.properties.kind === "us")
  };

  // ---- Routes ----
  // Each route renders as a polyline tracing the RAW waypoints from
  // pathfinding through the nav mesh — NO bundle offsets, NO index
  // spacing, NO corner curves. All routes that share a corridor will
  // overlap on top of each other. That's intentional here; this cell
  // is for inspecting the underlying mesh-routed paths.
  //
  // Pipeline (mirrors globeRoutes but stops after combinedPathNetwork):
  //   1. Build pipelineRoutes from dataRoute endpoints in Mercator space
  //   2. combinedPathNetwork(...) finds each route's waypoint chain
  //   3. classifyPathNodes(...) classifies each node (snap/vertex/etc
  //      and parallel-vs-decision) for the junction markers
  //   4. For each path, inverse-project waypoints to lon/lat
  //   5. Per frame, project lon/lat through orthographic
  //
  // Fallback: if the routing pipeline isn't available, fall back to
  // straight pixel-space lines between endpoints (the original cell
  // behavior).
  const ENDPOINT_R = 3.5;
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Junction marker styling. Since routes here are raw (no bundling
  // or indexed spacing), all markers are the same size regardless of
  // how many routes pass through a node — bumping by route count
  // would imply a layout density that doesn't exist on this cell.
  const J_BASE_R         = 8;
  const J_DECISION_LW    = 2;
  const J_PARALLEL_LW    = 1;
  const J_DECISION_COLOR = "#e0162b";
  const J_PARALLEL_COLOR = "#000000";
  const CLUSTER_MERGE_DIST = 8;

  const haveMesh =
    typeof navMesh !== "undefined" && navMesh && navMesh.mesh && navMesh.mercator;
  const havePipeline =
    typeof combinedPathNetwork === "function" &&
    typeof pathfinding === "object";
  const haveClassify = typeof classifyPathNodes === "function";
  const haveCluster  =
    typeof globeRoutesHelpers === "object" &&
    globeRoutesHelpers &&
    typeof globeRoutesHelpers.clusterChain === "function";

  // routes: array of { lonlats: [[lon,lat],...], color, path, c1, c2 }.
  // lonlats is null when fallback mode is in use; in that case lonStart
  // and lonEnd carry the two endpoints for a straight projection line.
  const routes = [];
  // junctions: array of { lonlat: [lon,lat], shape, isDecision, r, path }.
  const junctions = [];

  if (typeof dataRoute !== "undefined" && Array.isArray(dataRoute)) {
    if (haveMesh && havePipeline) {
      // Build pipelineRoutes in Mercator space (matching globeRoutes).
      const merc = navMesh.mercator;
      const pipelineRoutes = [];
      const meta = []; // parallel array of { color, lonStart, lonEnd }
      for (let i = 0; i < dataRoute.length; i++) {
        const d = dataRoute[i];
        if (d == null) continue;
        if (d.load_lon == null || d.load_lat == null) continue;
        if (d.unload_lon == null || d.unload_lat == null) continue;
        const loadLL   = [+d.load_lon,   +d.load_lat];
        const unloadLL = [+d.unload_lon, +d.unload_lat];
        const s = merc.forward(loadLL);
        const e = merc.forward(unloadLL);
        if (!s || !e) continue;
        pipelineRoutes.push({
          id: i,
          color: d.color || "#ffffff",
          start: { x: s[0], y: s[1] },
          end:   { x: e[0], y: e[1] },
        });
        meta.push({
          color: d.color || "#ffffff",
          lonStart: loadLL,
          lonEnd:   unloadLL,
        });
      }
      const network = combinedPathNetwork(navMesh.mesh, pipelineRoutes, pathfinding);
      // network.paths is one entry per pipelineRoutes id, each with
      // .waypoints (Mercator-space). Inverse-project each waypoint to
      // lon/lat once at setup; per-frame just runs the orthographic
      // projection over the cached lon/lat list.
      for (let k = 0; k < pipelineRoutes.length; k++) {
        const pr = pipelineRoutes[k];
        const m  = meta[k];
        const p = network.paths.find(pp => pp.routeId === pr.id);
        const wps = p && Array.isArray(p.waypoints) ? p.waypoints : null;
        const lonlats = [];
        if (wps && wps.length) {
          for (const wp of wps) {
            const ll = merc.inverse([wp.x, wp.y]);
            if (ll) lonlats.push([ll[0], ll[1]]);
          }
        }
        // If for some reason this route produced no waypoints, fall
        // back to a straight start→end pair so it still renders.
        if (lonlats.length < 2) {
          lonlats.length = 0;
          lonlats.push(m.lonStart, m.lonEnd);
        }
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("stroke", m.color);
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("fill", "none");
        const c1 = document.createElementNS(SVG_NS, "circle");
        const c2 = document.createElementNS(SVG_NS, "circle");
        for (const c of [c1, c2]) {
          c.setAttribute("r", ENDPOINT_R);
          c.setAttribute("fill", m.color);
        }
        routes.push({
          lonlats,
          lonStart: m.lonStart,
          lonEnd:   m.lonEnd,
          color: m.color,
          path, c1, c2,
        });
      }

      // ---- Junction classification + markers ----
      // Run classifyPathNodes (same pipeline globeRoutes uses) to get
      // each node's kind (snap/vertex/endpoint) and classification
      // (parallel/decision). We DON'T run optimizeIndex/alignRoutes
      // since those are for bundle layout, which this cell deliberately
      // skips.
      //
      // Adjacent snap waypoints along a route's chain are merged into
      // a single cluster marker, matching globeRoutes — without this
      // the snap chains would appear as overlapping rows of squares.
      if (haveClassify) {
        const classified = classifyPathNodes(network);
        const mesh = navMesh.mesh;

        function areaFaceCountAt(pointId) {
          let n = 0;
          for (const f of mesh.faces) {
            if (!f.isArea) continue;
            if (f.ring.indexOf(pointId) !== -1) n++;
          }
          return n;
        }
        function shapeFor(node) {
          if (node.kind === "snap") return "snap";
          if (node.kind === "vertex") return areaFaceCountAt(node.id) === 1 ? "coastline" : "multiway";
          return "multiway";
        }

        // Build cluster groups so consecutive snap waypoints in any
        // route's filtered chain collapse to a single marker. Mirrors
        // the globeRoutes logic but only the parts needed for markers
        // (no curve building).
        const snapIds = new Set();
        for (const n of classified.nodes) {
          if (n.kind === "snap") snapIds.add(n.id);
        }
        const isEndpoint = (wp) =>
          typeof wp.id === "string" && wp.id.startsWith("endpoint:");

        const clusterByCanonicalId = new Map();
        const clusterCanonicalBySnapId = new Map();
        if (haveCluster) {
          for (const pipeRoute of pipelineRoutes) {
            const p = network.paths.find(pp => pp.routeId === pipeRoute.id);
            if (!p) continue;
            const wps = p.waypoints;
            const filteredIdx = [];
            for (let i = 0; i < wps.length; i++) {
              const isInteriorSnap =
                i > 0 && i < wps.length - 1 &&
                snapIds.has(wps[i].id) &&
                !isEndpoint(wps[i - 1]) &&
                !isEndpoint(wps[i + 1]);
              if (!isInteriorSnap) filteredIdx.push(i);
            }
            const { chainWps } = globeRoutesHelpers.clusterChain(
              filteredIdx, wps, snapIds, CLUSTER_MERGE_DIST
            );
            for (const cw of chainWps) {
              if (!cw._clusterIds) continue;
              const canId = cw._clusterIds[0];
              let entry = clusterByCanonicalId.get(canId);
              if (!entry) {
                let span = 0;
                for (const mbr of cw._clusterMembers) {
                  const d = Math.hypot(mbr.x - cw.x, mbr.y - cw.y);
                  if (d > span) span = d;
                }
                entry = {
                  ids: new Set(cw._clusterIds),
                  centroid: { x: cw.x, y: cw.y },
                  span,
                };
                clusterByCanonicalId.set(canId, entry);
              } else {
                for (const id of cw._clusterIds) entry.ids.add(id);
              }
            }
          }
          for (const [canId, entry] of clusterByCanonicalId) {
            for (const id of entry.ids) clusterCanonicalBySnapId.set(id, canId);
          }
        }

        // Emit one marker entry per node, skipping non-canonical
        // cluster members (those get hidden under the canonical one).
        // Marker radius is the constant J_BASE_R — no per-route bumps,
        // since the underlying paths aren't indexed/spaced here. For
        // clustered snaps we still need to ensure the square spans
        // the merged geometric extent, so we use max(base, span+base).
        for (const node of classified.nodes) {
          if (node.kind === "endpoint") continue;
          const canId = clusterCanonicalBySnapId.get(node.id);
          let mx, my, r, shape, isDecision;
          if (canId != null) {
            if (canId !== node.id) continue; // non-canonical: skip
            const cluster = clusterByCanonicalId.get(canId);
            mx = cluster.centroid.x;
            my = cluster.centroid.y;
            shape = "snap";
            isDecision = node.classification === "decision";
            r = Math.max(J_BASE_R, cluster.span + J_BASE_R);
          } else {
            mx = node.x; my = node.y;
            shape = shapeFor(node);
            isDecision = node.classification === "decision";
            r = J_BASE_R;
          }
          const ll = merc.inverse([mx, my]);
          if (!ll) continue;
          const path = document.createElementNS(SVG_NS, "path");
          path.setAttribute("fill", "none");
          path.setAttribute("stroke", isDecision ? J_DECISION_COLOR : J_PARALLEL_COLOR);
          path.setAttribute("stroke-width", String(isDecision ? J_DECISION_LW : J_PARALLEL_LW));
          junctions.push({
            lonlat: [ll[0], ll[1]],
            shape, isDecision, r,
            path,
          });
        }
      }
    } else {
      // Fallback: original straight pixel-space lines.
      for (let i = 0; i < dataRoute.length; i++) {
        const d = dataRoute[i];
        if (d == null) continue;
        if (d.load_lon == null || d.load_lat == null) continue;
        if (d.unload_lon == null || d.unload_lat == null) continue;
        const color = d.color || "#ffffff";
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("fill", "none");
        const c1 = document.createElementNS(SVG_NS, "circle");
        const c2 = document.createElementNS(SVG_NS, "circle");
        for (const c of [c1, c2]) {
          c.setAttribute("r", ENDPOINT_R);
          c.setAttribute("fill", color);
        }
        routes.push({
          lonlats: null,
          lonStart: [+d.load_lon,   +d.load_lat],
          lonEnd:   [+d.unload_lon, +d.unload_lat],
          color,
          path, c1, c2,
        });
      }
    }
  }

  // Attach all route elements to the DOM once. Paths first, then
  // circles, so endpoints sit visually on top of the lines they cap.
  const routesNode = routesLayer.node();
  for (const r of routes) routesNode.appendChild(r.path);
  for (const r of routes) {
    routesNode.appendChild(r.c1);
    routesNode.appendChild(r.c2);
  }
  const junctionsNode = junctionsLayer.node();
  for (const j of junctions) junctionsNode.appendChild(j.path);

  // ---- Legend ----
  // Floats in the top-left of the map container. Uses inline SVG for
  // the marker swatches so they match the on-globe rendering exactly:
  // same J_BASE_R radius, same shape construction, same stroke colors
  // and widths. pointer-events:none so it doesn't intercept drags.
  function makeSwatch(shape, color, lineWidth) {
    const size = J_BASE_R * 2 + 4;
    const cx = size / 2, cy = size / 2, r = J_BASE_R;
    const svgNS = SVG_NS;
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.style.display = "block";
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", color);
    p.setAttribute("stroke-width", String(lineWidth));
    let d;
    if (shape === "snap") {
      d = `M ${cx - r} ${cy - r} L ${cx + r} ${cy - r} ` +
          `L ${cx + r} ${cy + r} L ${cx - r} ${cy + r} Z`;
    } else if (shape === "coastline") {
      const tr = r * 1.15, h = tr * Math.sqrt(3);
      d = `M ${cx} ${cy - (2/3)*h} ` +
          `L ${cx + tr} ${cy + (1/3)*h} ` +
          `L ${cx - tr} ${cy + (1/3)*h} Z`;
    } else {
      d = `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2*r} 0 ` +
          `a ${r} ${r} 0 1 0 ${-2*r} 0 Z`;
    }
    p.setAttribute("d", d);
    svg.appendChild(p);
    return svg;
  }
  function makeLegendRow(swatch, label) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "8px";
    row.style.lineHeight = "1";
    row.appendChild(swatch);
    const span = document.createElement("span");
    span.textContent = label;
    row.appendChild(span);
    return row;
  }
  function makeSectionHeader(text) {
    const h = document.createElement("div");
    h.textContent = text;
    h.style.fontSize = "10px";
    h.style.opacity = "0.55";
    h.style.textTransform = "uppercase";
    h.style.letterSpacing = "0.05em";
    h.style.marginTop = "4px";
    return h;
  }
  const legend = document.createElement("div");
  legend.style.position = "absolute";
  legend.style.top = "8px";
  legend.style.left = "8px";
  legend.style.padding = "8px 10px";
  legend.style.background = "rgba(255,255,255,0.85)";
  legend.style.border = "1px solid rgba(0,0,0,0.1)";
  legend.style.borderRadius = "4px";
  legend.style.font = "11px ui-monospace, 'SF Mono', Menlo, monospace";
  legend.style.color = "#222";
  legend.style.pointerEvents = "none";
  legend.style.display = "flex";
  legend.style.flexDirection = "column";
  legend.style.gap = "4px";
  legend.style.zIndex = "10";

  // Shape rows use parallel color so the row is "about" the shape, not
  // the color. Color section uses a circle as a neutral indicator.
  const shapeHeader = makeSectionHeader("Shape");
  shapeHeader.style.marginTop = "0";
  legend.appendChild(shapeHeader);
  legend.appendChild(makeLegendRow(makeSwatch("multiway",  J_PARALLEL_COLOR, J_PARALLEL_LW), "Multi-way"));
  legend.appendChild(makeLegendRow(makeSwatch("coastline", J_PARALLEL_COLOR, J_PARALLEL_LW), "Coastline"));
  legend.appendChild(makeLegendRow(makeSwatch("snap",      J_PARALLEL_COLOR, J_PARALLEL_LW), "Snap"));
  legend.appendChild(makeSectionHeader("Classification"));
  legend.appendChild(makeLegendRow(makeSwatch("multiway", J_PARALLEL_COLOR, J_PARALLEL_LW), "Parallel"));
  legend.appendChild(makeLegendRow(makeSwatch("multiway", J_DECISION_COLOR, J_DECISION_LW), "Decision"));
  mapContainer.appendChild(legend);

  function buildRouteD(r) {
    if (r.lonlats && r.lonlats.length >= 2) {
      const parts = [];
      let inRun = false;
      for (const ll of r.lonlats) {
        const p = projection(ll);
        if (!p) { inRun = false; continue; }
        parts.push(inRun ? "L" : "M", p[0].toFixed(2), p[1].toFixed(2));
        inRun = true;
      }
      return parts.length ? parts.join(" ") : "";
    }
    // Fallback path: straight line between endpoints.
    const p1 = projection(r.lonStart);
    const p2 = projection(r.lonEnd);
    if (!p1 || !p2) return "";
    return `M ${p1[0].toFixed(2)} ${p1[1].toFixed(2)} L ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }

  function renderRoutes() {
    for (const r of routes) {
      r.path.setAttribute("d", buildRouteD(r));
      const p1 = projection(r.lonStart);
      const p2 = projection(r.lonEnd);
      if (p1) { r.c1.setAttribute("cx", p1[0]); r.c1.setAttribute("cy", p1[1]); r.c1.removeAttribute("display"); }
      else    { r.c1.setAttribute("display", "none"); }
      if (p2) { r.c2.setAttribute("cx", p2[0]); r.c2.setAttribute("cy", p2[1]); r.c2.removeAttribute("display"); }
      else    { r.c2.setAttribute("display", "none"); }
    }
  }

  function renderJunctions() {
    for (const j of junctions) {
      const p = projection(j.lonlat);
      if (!p) { j.path.setAttribute("display", "none"); continue; }
      j.path.removeAttribute("display");
      const cx = p[0], cy = p[1], r = j.r;
      if (j.shape === "snap") {
        // Square
        j.path.setAttribute("d",
          `M ${cx - r} ${cy - r} L ${cx + r} ${cy - r} ` +
          `L ${cx + r} ${cy + r} L ${cx - r} ${cy + r} Z`);
      } else if (j.shape === "coastline") {
        // Triangle
        const tr = r * 1.15, h = tr * Math.sqrt(3);
        j.path.setAttribute("d",
          `M ${cx} ${cy - (2/3)*h} ` +
          `L ${cx + tr} ${cy + (1/3)*h} ` +
          `L ${cx - tr} ${cy + (1/3)*h} Z`);
      } else {
        // Circle
        j.path.setAttribute("d",
          `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2*r} 0 ` +
          `a ${r} ${r} 0 1 0 ${-2*r} 0 Z`);
      }
    }
  }

  // ---- Projection ----
  function computeBaseScale(w, h) { return Math.min(w, h) / 2 - 4; }
  let initialScale = computeBaseScale(width, height);

  // Initial camera position and zoom come from the cameraRange cell.
  // initialZoom is a multiplier of the natural full-globe scale.
  // Falls back to a reasonable default if cameraRange isn't defined.
  const _cr = (typeof cameraRange !== "undefined" && cameraRange) || null;
  const startRotate = _cr
    ? [-_cr.initialLon, -_cr.initialLat, 0]
    : [98, -39, 0];
  const startScale = _cr
    ? initialScale * (_cr.initialZoom || 1)
    : initialScale;

  const projection = d3.geoOrthographic()
    .scale(startScale)
    .translate([width / 2, height / 2])
    .rotate(startRotate)
    .clipAngle(90);

  // Path generator for the projection. clipAngle(90) handles hemisphere
  // clipping correctly (filled polys spanning the visible edge would
  // otherwise smear across the back of the globe).
  const pathClipped = d3.geoPath(projection, ctx);
  // SVG variant of the same projection — produces path strings instead
  // of drawing into a canvas context. Used by the nav mesh layer.
  const pathClippedSvg = d3.geoPath(projection);

  function graticuleStep(scale) {
    const zoomRatio = scale / initialScale;
    if (zoomRatio < 1.5) return 30;
    if (zoomRatio < 3) return 15;
    if (zoomRatio < 6) return 10;
    if (zoomRatio < 12) return 5;
    if (zoomRatio < 25) return 2;
    return 1;
  }

  // Graticule cache — keyed by step. Rebuilding every frame was wasted
  // work since the step only changes on zoom.
  const graticuleCache = new Map();
  function getGraticule(step) {
    let g = graticuleCache.get(step);
    if (!g) {
      g = d3.geoGraticule().step([step, step])();
      graticuleCache.set(step, g);
    }
    return g;
  }

  // ---- Nav mesh ----
  // Loads from the optional `dataNavMesh` cell (points + links + disabled
  // face keys). The mesh is built in Mercator space (matching the original
  // chartNavMesh editor's convention), then each derived point's xy is
  // converted back to lon/lat for projection through the orthographic
  // globe projection.
  //
  // What's drawn:
  //   - Faces (walkable polygons) as a low-alpha fill cluster
  //   - Mesh links: solid for boundary edges, dashed for interior edges
  // We omit the editor-only elements (user/virtual point dots, disabled
  // face X markers) since you just want to see the mesh.
  //
  // Local variable renamed to navMeshLocal so it doesn't shadow the
  // global `navMesh` cell that the routing pipeline above relies on.
  const navMeshData = (typeof dataNavMesh !== "undefined" && dataNavMesh) || null;
  const SEAM_OFFSET = -160; // matches the editor's Mercator seam (Atlantic)
  const navMercator = d3.geoMercator()
    .scale(1000)
    .translate([0, 0])
    .rotate([SEAM_OFFSET, 0, 0]);

  let navMeshLocal = null;
  // SVG element refs, built once. clusterPaths[i] corresponds to
  // navMeshLocal.clusters[i]; the two link path strings get updated each frame.
  let navMeshClusterPaths = [];
  let navMeshSolidPath = null;
  let navMeshDashedPath = null;

  function buildNavMeshFromData() {
    if (!navMeshData
        || typeof buildNavMesh !== "function"
        || !Array.isArray(navMeshData.points)
        || !Array.isArray(navMeshData.links)) {
      return;
    }
    const disabled = new Set(
      Array.isArray(navMeshData.disabledFaceKeys) ? navMeshData.disabledFaceKeys : []
    );
    // Convert lon/lat user points to Mercator xy for buildNavMesh.
    const pts2d = [];
    for (const p of navMeshData.points) {
      const xy = navMercator([+p.lon, +p.lat]);
      if (!xy) continue;
      pts2d.push({ id: +p.id, x: xy[0], y: xy[1] });
    }
    const links = navMeshData.links.map(l => ({ id: +l.id, a: +l.a, b: +l.b }));
    navMeshLocal = buildNavMesh(pts2d, links, disabled);

    // Cache lon/lat back on every derived point so the per-frame render
    // doesn't have to invert Mercator on each point each time. For user
    // points we already know the lon/lat — copy it directly. For virtual
    // points (link crossings) we invert their Mercator xy.
    const userByKey = new Map(navMeshData.points.map(p => ["u" + p.id, p]));
    for (const dp of navMeshLocal.derivedPoints) {
      const userPt = userByKey.get(dp.id);
      if (userPt) {
        dp.lon = +userPt.lon;
        dp.lat = +userPt.lat;
      } else {
        const ll = navMercator.invert([dp.x, dp.y]);
        if (ll) { dp.lon = ll[0]; dp.lat = ll[1]; }
      }
    }
  }

  function setupNavMeshSvg() {
    if (!navMeshLocal) return;
    const node = navmeshLayer.node();
    // Water-blue palette — distinct from the ocean's pale #c4d8dd while
    // staying in the water family. Fill and stroke share the same hue;
    // fill is translucent, stroke is opaque.
    const FILL_COLOR   = "rgba(28, 65, 165, 0.08)";
    const STROKE_COLOR = "rgba(28, 65, 165, 0.85)";

    // Cluster fills (one path per cluster — d3.geoPath produces compound
    // path strings for outer-plus-holes via fill-rule:evenodd).
    for (const c of navMeshLocal.clusters) {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("fill", FILL_COLOR);
      p.setAttribute("fill-rule", "evenodd");
      p.setAttribute("stroke", "none");
      node.appendChild(p);
      navMeshClusterPaths.push(p);
    }
    // Two batched link paths (solid + dashed) — matches the editor's
    // optimization of one stroke call per category instead of per link.
    navMeshSolidPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    navMeshSolidPath.setAttribute("fill", "none");
    navMeshSolidPath.setAttribute("stroke", STROKE_COLOR);
    navMeshSolidPath.setAttribute("stroke-width", "1.5");
    node.appendChild(navMeshSolidPath);

    navMeshDashedPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    navMeshDashedPath.setAttribute("fill", "none");
    navMeshDashedPath.setAttribute("stroke", STROKE_COLOR);
    navMeshDashedPath.setAttribute("stroke-width", "1.5");
    navMeshDashedPath.setAttribute("stroke-dasharray", "4 4");
    node.appendChild(navMeshDashedPath);
  }

  function ringToLonLatCoords(ringIds) {
    const coords = [];
    for (const pid of ringIds) {
      const dp = navMeshLocal.dPointById(pid);
      if (!dp || dp.lon == null) return null;
      coords.push([dp.lon, dp.lat]);
    }
    return coords;
  }
  function clusterToGeoPolygon(cluster) {
    const rings = [];
    for (const ring of cluster.rings) {
      const lls = ringToLonLatCoords(ring);
      if (!lls || lls.length < 3) continue;
      // Close the ring
      const f = lls[0], l = lls[lls.length - 1];
      if (f[0] !== l[0] || f[1] !== l[1]) lls.push([f[0], f[1]]);
      rings.push(lls);
    }
    return rings.length ? { type: "Polygon", coordinates: rings } : null;
  }

  function renderNavMesh() {
    if (!navMeshLocal) return;
    // Polygons (clusters)
    for (let i = 0; i < navMeshLocal.clusters.length; i++) {
      const geo = clusterToGeoPolygon(navMeshLocal.clusters[i]);
      navMeshClusterPaths[i].setAttribute("d", geo ? (pathClippedSvg(geo) || "") : "");
    }
    // Links — collect into MultiLineStrings per category, then one path each.
    const solidCoords = [];
    const dashedCoords = [];
    for (const dl of navMeshLocal.derivedLinks) {
      const a = navMeshLocal.dPointById(dl.a);
      const b = navMeshLocal.dPointById(dl.b);
      if (!a || !b || a.lon == null || b.lon == null) continue;
      const seg = [[a.lon, a.lat], [b.lon, b.lat]];
      if (navMeshLocal.interiorEdges.has(navMeshLocal.edgeKeyU(dl.a, dl.b))) {
        dashedCoords.push(seg);
      } else {
        solidCoords.push(seg);
      }
    }
    navMeshSolidPath.setAttribute("d",
      solidCoords.length
        ? pathClippedSvg({ type: "MultiLineString", coordinates: solidCoords }) || ""
        : ""
    );
    navMeshDashedPath.setAttribute("d",
      dashedCoords.length
        ? pathClippedSvg({ type: "MultiLineString", coordinates: dashedCoords }) || ""
        : ""
    );
  }

  buildNavMeshFromData();
  setupNavMeshSvg();

  // ---- Canvas render ----
  function renderCanvas() {
    const r = projection.scale();
    const cx = width / 2, cy = height / 2;
    const step = graticuleStep(r);
    const graticule = getGraticule(step);

    ctx.clearRect(0, 0, width, height);

    // Globe disc (ocean color)
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = "#c4d8dd";
    ctx.fill();

    // Graticule (clipped path — correct hemisphere clipping).
    ctx.beginPath();
    pathClipped(graticule);
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    pathClipped(otherLand);
    ctx.fillStyle = "#e8e6df";
    ctx.fill();

    ctx.beginPath();
    pathClipped(usLand);
    ctx.fillStyle = "#e8e6df";
    ctx.fill();
    ctx.beginPath();
    pathClipped(usLand);
    ctx.strokeStyle = "rgba(68,68,68,0.25)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Second graticule pass — overlays the land at low alpha so gridlines
    // show through countries as well as the ocean.
    ctx.beginPath();
    pathClipped(graticule);
    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    pathClipped(rivers);
    ctx.strokeStyle = "#c4d8dd";
    ctx.lineWidth = 1.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.beginPath();
    pathClipped(lakes);
    ctx.fillStyle = "#c4d8dd";
    ctx.fill();

    // Routes are rendered as an SVG layer (see renderRoutes()).
  }

  // ---- Interaction state for globe drag/zoom ----
  let pendingFrame = null;
  let isDragging = false;
  let isZooming = false;
  let zoomEndTimer = null;

  function interacting() { return isDragging || isZooming; }

  function cancelPendingRender() {
    if (pendingFrame !== null) {
      cancelAnimationFrame(pendingFrame);
      pendingFrame = null;
    }
  }
  function renderAll() {
    renderCanvas();
    renderNavMesh();
    renderRoutes();
    renderJunctions();
  }
  function scheduleRender() {
    if (pendingFrame !== null) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = null;
      renderAll();
    });
  }

  function enterInteraction() {
    if (currentDpr !== DRAG_DPR) {
      setCanvasDpr(DRAG_DPR);
      // setCanvasDpr clears the canvas (changing canvas.width/height
      // resets to transparent). Repaint synchronously so the user
      // never sees a blank canvas between mousedown and mousemove.
      renderAll();
    }
  }
  function exitInteractionIfIdle() {
    if (!interacting() && currentDpr !== FULL_DPR) {
      setCanvasDpr(FULL_DPR);
      renderAll();
    }
  }

  // ---- Resize handling ----
  function applyResize() {
    const newWidth = measureContainerWidth();
    if (!newWidth || newWidth <= 0) return;
    if (newWidth === width) return;

    const oldRatio = projection.scale() / initialScale;
    width = newWidth;
    height = HEIGHT;

    setCanvasDpr(currentDpr); // re-applies width/height at current dpr

    overlay
      .attr("width", width).attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);
    bgCapture.attr("width", width).attr("height", height);

    initialScale = computeBaseScale(width, height);
    projection.translate([width / 2, height / 2]).scale(initialScale * oldRatio);

    cancelPendingRender();
    renderAll();
  }

  renderAll();

  // Pan clamp bounds derived from cameraRange. The projection's
  // rotate[0] is the negation of the view-center longitude and
  // rotate[1] is the negation of the view-center latitude, so we
  // clamp rotate[0] into [-maxLon, -minLon] and rotate[1] into
  // [-maxLat, -minLat] to keep the view center within the box.
  const panClamp = (typeof cameraRange !== "undefined" && cameraRange)
    ? {
        lonMin: -cameraRange.maxLon, lonMax: -cameraRange.minLon,
        latMin: -cameraRange.maxLat, latMax: -cameraRange.minLat,
      }
    : null;
  function clampRotation(rot) {
    if (!panClamp) return rot;
    const r0 = Math.max(panClamp.lonMin, Math.min(panClamp.lonMax, rot[0]));
    const r1 = Math.max(panClamp.latMin, Math.min(panClamp.latMax, rot[1]));
    return [r0, r1, rot[2]];
  }

  // ---- Drag on bgCapture: rotate globe ----
  const bgDrag = d3.drag()
    .on("start", () => {
      bgCapture.style("cursor", "grabbing");
      isDragging = true;
      cancelPendingRender();
      clearTimeout(zoomEndTimer);
      enterInteraction();
    })
    .on("drag", (event) => {
      const rotate = projection.rotate();
      const k = 75 / projection.scale();
      projection.rotate(clampRotation([
        rotate[0] + event.dx * k,
        rotate[1] - event.dy * k,
        rotate[2],
      ]));
      scheduleRender();
    })
    .on("end", () => {
      bgCapture.style("cursor", "grab");
      isDragging = false;
      if (!isZooming) {
        exitInteractionIfIdle();
      }
    });
  bgCapture.call(bgDrag);

  // ---- Wheel to zoom ----
  // Bounds come from cameraRange.minZoom and cameraRange.maxZoom if
  // defined, else fall back to 0.5× and 200×.
  const minZoomMultiplier = (_cr && _cr.minZoom) || 0.5;
  const maxZoomMultiplier = (_cr && _cr.maxZoom) || 200;
  overlay.node().addEventListener("wheel", (event) => {
    event.preventDefault();
    const factor = Math.exp(-event.deltaY * 0.001);
    const newScale = Math.max(
      initialScale * minZoomMultiplier,
      Math.min(initialScale * maxZoomMultiplier, projection.scale() * factor)
    );
    projection.scale(newScale);
    if (!isZooming) {
      isZooming = true;
      cancelPendingRender();
      enterInteraction();
    }
    scheduleRender();
    clearTimeout(zoomEndTimer);
    zoomEndTimer = setTimeout(() => {
      isZooming = false;
      if (!isDragging) exitInteractionIfIdle();
    }, 120);
  }, { passive: false });

  // ---- Resize observer (rAF-debounced) ----
  const resizeAbort = new AbortController();
  let resizeFrame = null;
  function scheduleResize() {
    if (resizeFrame !== null) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;
      applyResize();
    });
  }

  let resizeObserver = null;
  setTimeout(() => {
    applyResize();
    const target = wrapper.parentElement || document.body;
    if (typeof ResizeObserver !== "undefined" && target) {
      resizeObserver = new ResizeObserver(() => scheduleResize());
      resizeObserver.observe(target);
    } else {
      window.addEventListener("resize", scheduleResize, { signal: resizeAbort.signal });
    }
  }, 0);

  const detachObserver = new MutationObserver(() => {
    if (!document.body.contains(wrapper)) {
      resizeAbort.abort();
      if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
      detachObserver.disconnect();
    }
  });
  setTimeout(() => {
    if (document.body.contains(wrapper)) {
      detachObserver.observe(document.body, { childList: true, subtree: true });
    }
  }, 0);

  return wrapper;
}


function _dataRoute(portSheet,cargoSheet,d3,voyageSheet)
{
  // ---- existing lookup tables -------------------------------------------
  // Build O(1) lookup tables once instead of scanning the arrays per row.
  // Defensive .trim() on both sides — sheet data often has trailing spaces.
  const portByName = new Map();
  for (const p of portSheet) {
    if (p && p.port_name) {
      portByName.set(String(p.port_name).trim(), p);
    }
  }
  const colorByCargo = new Map();
  for (const c of cargoSheet) {
    const name = c && c["Cargo Types"];
    if (name) {
      colorByCargo.set(String(name).trim(), c.Color);
    }
  }

  const DEFAULT_COLOR = "#ffffff";

  // ---- date parsers (unchanged) -----------------------------------------
  // Take the first / last "M/D/YYYY" found in a string.
  // Handles ranges like "4/13/2026 - 4/15/2026" or "4/16/2026 / 4/22/2026".
  const dateParse = d3.timeParse("%m/%d/%Y");
  const parseFirst = (s) => {
    const m = String(s ?? "").match(/\d{1,2}\/\d{1,2}\/\d{4}/g);
    return m ? dateParse(m[0]) : null;
  };
  const parseLast = (s) => {
    const m = String(s ?? "").match(/\d{1,2}\/\d{1,2}\/\d{4}/g);
    return m ? dateParse(m[m.length - 1]) : null;
  };

  // ---- numeric parser for barrels ---------------------------------------
  // Sheet values often arrive as strings like "1,234" or "12,000 bbl".
  // Strips everything but digits / dot / minus, then coerces to Number.
  // (Drop this and use v.barrels directly if you want the raw value.)
  const parseNumber = (s) => {
    if (s == null || s === "") return null;
    const n = Number(String(s).replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  // Mirror of routeList.hasValue — treats sheet sentinels as empty.
  const hasValue = (s) => {
    if (s == null) return false;
    const t = String(s).trim().toLowerCase();
    if (!t) return false;
    return !["n/a", "na", "not applicable", "none", "—", "-",
             "pending response", "pending", "tbd", "unknown"].includes(t);
  };

  // ---- 50-state lookup --------------------------------------------------
  // Full state (and DC) name -> 2-letter code. This is the self-contained
  // "lookup list of the 50 states" used to resolve spelled-out states; it
  // replaces the dependency on globeRoutesHelpers.stateNameToCode.
  const STATE_NAME_TO_CODE = {
    "alabama":"AL","alaska":"AK","arizona":"AZ","arkansas":"AR","california":"CA",
    "colorado":"CO","connecticut":"CT","delaware":"DE","florida":"FL","georgia":"GA",
    "hawaii":"HI","idaho":"ID","illinois":"IL","indiana":"IN","iowa":"IA",
    "kansas":"KS","kentucky":"KY","louisiana":"LA","maine":"ME","maryland":"MD",
    "massachusetts":"MA","michigan":"MI","minnesota":"MN","mississippi":"MS",
    "missouri":"MO","montana":"MT","nebraska":"NE","nevada":"NV",
    "new hampshire":"NH","new jersey":"NJ","new mexico":"NM","new york":"NY",
    "north carolina":"NC","north dakota":"ND","ohio":"OH","oklahoma":"OK",
    "oregon":"OR","pennsylvania":"PA","rhode island":"RI","south carolina":"SC",
    "south dakota":"SD","tennessee":"TN","texas":"TX","utah":"UT","vermont":"VT",
    "virginia":"VA","washington":"WA","west virginia":"WV","wisconsin":"WI",
    "wyoming":"WY","district of columbia":"DC","washington dc":"DC",
    "washington, d.c.":"DC",
  };

  // ---- US territory lookup ----------------------------------------------
  // Territories are NOT part of any PADD, so they're kept out of PADD_BY_CODE
  // below (paddOf still returns null for them). But we DO want to resolve them
  // so endpoints like Puerto Rico aren't silently dropped as "no state" — they
  // get a 2-letter code (PR/VI/GU/…) plus a human-readable region name, which
  // is what the trade charts key on to build the "Puerto Rico" series.
  const TERRITORY_NAME_TO_CODE = {
    "puerto rico":"PR",
    "u.s. virgin islands":"VI","us virgin islands":"VI","virgin islands":"VI",
    "guam":"GU","american samoa":"AS",
    "northern mariana islands":"MP","commonwealth of the northern mariana islands":"MP",
  };
  const TERRITORY_CODES = new Set(Object.values(TERRITORY_NAME_TO_CODE)); // PR, VI, GU, AS, MP
  const TERRITORY_NAME_BY_CODE = {
    PR: "Puerto Rico", VI: "U.S. Virgin Islands", GU: "Guam",
    AS: "American Samoa", MP: "Northern Mariana Islands",
  };

  // ---- code -> PADD classification --------------------------------------
  // PADD = Petroleum Administration for Defense District (EIA regions).
  // Keyed by 2-letter code. Codes not present (territories like PR/VI/GU,
  // foreign ports) resolve to null.
  const PADD_BY_CODE = new Map();
  const addCodes = (padd, codes) => { for (const c of codes) PADD_BY_CODE.set(c, padd); };
  addCodes(1, ["CT","DE","FL","GA","ME","MD","MA","NH","NJ","NY","NC","PA","RI","SC","VT","VA","WV","DC"]); // East Coast
  addCodes(2, ["IL","IN","IA","KS","KY","MI","MN","MO","NE","ND","OH","OK","SD","TN","WI"]);                // Midwest
  addCodes(3, ["AL","AR","LA","MS","NM","TX"]);                                                              // Gulf Coast
  addCodes(4, ["CO","ID","MT","UT","WY"]);                                                                   // Rocky Mountain
  addCodes(5, ["AK","AZ","CA","HI","NV","OR","WA"]);                                                         // West Coast

  const VALID_CODES = new Set(PADD_BY_CODE.keys());

  // ---- code -> PADD 1 sub-district --------------------------------------
  // EIA splits PADD 1 (East Coast) into three sub-districts. Keyed by
  // 2-letter code; only PADD 1 states resolve, everything else -> null.
  const PADD1_SUB_BY_CODE = new Map();
  const addSub = (sub, codes) => { for (const c of codes) PADD1_SUB_BY_CODE.set(c, sub); };
  addSub("1A", ["CT","ME","MA","NH","RI","VT"]);          // New England
  addSub("1B", ["DE","DC","MD","NJ","NY","PA"]);          // Central Atlantic
  addSub("1C", ["FL","GA","NC","SC","VA","WV"]);          // Lower Atlantic

  // ---- combined name/code resolution (states + territories) -------------
  // stateFromPort resolves against both states and territories. PADD lookups
  // above are unchanged, so territories still yield a null numeric PADD.
  const NAME_TO_CODE = { ...STATE_NAME_TO_CODE, ...TERRITORY_NAME_TO_CODE };
  const CODE_SET = new Set([...VALID_CODES, ...TERRITORY_CODES]);
  // Names, longest first, for greedy whole-name matching in step (c).
  const NAMES_BY_LEN = Object.keys(NAME_TO_CODE).sort((a, b) => b.length - a.length);

  // ---- state / territory parser -----------------------------------------
  // Parse a US 2-letter code (state OR territory) from a single point/port
  // string. The point fields are normalized as "City ST" or "City, ST"
  // (e.g. "Carteret NJ", "Port of Charleston, SC", "San Juan, PR"), so step
  // (a) is the main path; (b) and (c) catch comma- or spelled-out variants.
  const stateFromPort = (port) => {
    if (!hasValue(port)) return null;
    const str = String(port).trim();

    // (a) Trailing 2-letter code preceded by a comma OR whitespace.
    //     "Carteret NJ" -> NJ, "San Juan, PR" -> PR.
    const tail = str.match(/[,\s]\s*([A-Za-z]{2})\.?\s*$/);
    if (tail && CODE_SET.has(tail[1].toUpperCase())) {
      return tail[1].toUpperCase();
    }

    // (b) Comma pieces, from the end: a valid 2-letter code or a
    //     spelled-out name. "Carteret, New Jersey" -> NJ, "Yabucoa, Puerto Rico" -> PR.
    const pieces = str.split(",").map(s => s.trim()).filter(Boolean);
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      if (/^[A-Za-z]{2}$/.test(p) && CODE_SET.has(p.toUpperCase())) {
        return p.toUpperCase();
      }
      const named = NAME_TO_CODE[p.toLowerCase()];
      if (named) return named;
    }

    // (c) Spelled-out name anywhere, no comma needed
    //     (e.g. "Carteret New Jersey", "Port of San Juan Puerto Rico").
    //     Longest names first, word-bounded.
    const low = ` ${str.toLowerCase().replace(/[^a-z]+/g, " ").trim()} `;
    for (const name of NAMES_BY_LEN) {
      if (low.includes(` ${name} `)) return NAME_TO_CODE[name];
    }

    return null;
  };

  // A point field may hold several ports joined by " / " (matching how
  // routeList splits them). Return the state of the first port that resolves.
  const stateOfEndpoint = (portField) => {
    if (!hasValue(portField)) return null;
    for (const piece of String(portField).split(" / ")) {
      const code = stateFromPort(piece.trim());
      if (code) return code;
    }
    return null;
  };

  const paddOf = (code) => (code && PADD_BY_CODE.has(code)) ? PADD_BY_CODE.get(code) : null;
  // PADD 1 sub-district ("1A"/"1B"/"1C") for a state code, else null.
  const padd1SubOf = (code) => (code && PADD1_SUB_BY_CODE.has(code)) ? PADD1_SUB_BY_CODE.get(code) : null;
  // Human-readable region name for non-PADD US territories (e.g. "Puerto Rico"),
  // else null. This is what the trade charts use to assemble the territory series.
  const regionOf = (code) => (code && TERRITORY_NAME_BY_CODE[code]) ? TERRITORY_NAME_BY_CODE[code] : null;

  // ---- build rows -------------------------------------------------------
  return voyageSheet.map(v => {
    const loadKey   = v.load_point   ? String(v.load_point).trim()   : null;
    const unloadKey = v.unload_point ? String(v.unload_point).trim() : null;
    const cargoKey  = v.cargo_type   ? String(v.cargo_type).trim()   : null;

    const loadPort   = loadKey   ? portByName.get(loadKey)   : null;
    const unloadPort = unloadKey ? portByName.get(unloadKey) : null;
    const cargoColor = cargoKey  ? colorByCargo.get(cargoKey) : null;

    const loadState   = stateOfEndpoint(v.load_point);
    const unloadState = stateOfEndpoint(v.unload_point);

    return {
      ...v,
      load_lon:   loadPort   ? loadPort.longitude   : null,
      load_lat:   loadPort   ? loadPort.latitude    : null,
      unload_lon: unloadPort ? unloadPort.longitude : null,
      unload_lat: unloadPort ? unloadPort.latitude  : null,
      color: cargoColor || DEFAULT_COLOR,
      start: parseFirst(v.load_date),
      end:   parseLast(v.unload_date),
      // When this record was reported/submitted — the best in-data proxy for
      // when the dataset was last released. Parsed to a Date for comparison.
      reported_submit: parseLast(v.reported_submit_date),

      // ---- NEW properties ----
      barrels:      parseNumber(v.barrels ?? v.total_barrels),
      load_state:   loadState,        // resolved 2-letter code, incl. territories (or null)
      unload_state: unloadState,
      load_PADD:    paddOf(loadState),
      unload_PADD:  paddOf(unloadState),
      // PADD 1 sub-district ("1A"/"1B"/"1C") for East Coast endpoints, else null.
      // Numeric *_PADD above is unchanged (still 1 for any PADD 1 state, null for
      // territories & foreign ports).
      load_PADD_sub:   padd1SubOf(loadState),
      unload_PADD_sub: padd1SubOf(unloadState),
      // Region name for non-PADD US territories ("Puerto Rico", "U.S. Virgin
      // Islands", …), else null. Lets downstream charts pick out PR voyages even
      // though PR has no numeric PADD.
      load_region:   regionOf(loadState),
      unload_region: regionOf(unloadState),
    };
  });
}


function _dataPorts(dataRoute)
{
  const STATE_CODES = new Set([
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
    "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
    "VA","WA","WV","WI","WY","DC","PR","VI","GU","AS","MP",
  ]);

  const STATE_NAMES = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
    "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
    "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
    "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
    "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
    "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
    "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV",
    "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
    "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK",
    "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC",
    "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT",
    "vermont": "VT", "virginia": "VA", "washington": "WA", "west virginia": "WV",
    "wisconsin": "WI", "wyoming": "WY",
    "district of columbia": "DC", "washington, d.c.": "DC", "washington dc": "DC",
    "puerto rico": "PR",
    "u.s. virgin islands": "VI", "us virgin islands": "VI", "virgin islands": "VI",
    "guam": "GU",
    "american samoa": "AS",
    "northern mariana islands": "MP",
    "commonwealth of the northern mariana islands": "MP",
  };

  const extractStateCode = (portName) => {
    if (!portName) return null;
    const s = String(portName).trim();
    if (!s) return null;
    const lastComma = s.lastIndexOf(",");
    const tail = (lastComma >= 0 ? s.slice(lastComma + 1) : s).trim();
    const m = tail.match(/^([A-Za-z]{2})[^A-Za-z]*$/);
    if (m) {
      const code = m[1].toUpperCase();
      if (STATE_CODES.has(code)) return code;
    }
    const lower = tail.toLowerCase().replace(/[^a-z .]/g, "").trim();
    return STATE_NAMES[lower] || null;
  };

  const normalizeCity = (city) =>
    String(city ?? "")
      .toLowerCase()
      .replace(/\./g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const cityOf = (portString) => {
    if (!portString) return "";
    const s = String(portString).trim();
    const lastComma = s.lastIndexOf(",");
    return normalizeCity(lastComma >= 0 ? s.slice(0, lastComma) : s);
  };

  const splitPortString = (s) => {
    if (!s) return [];
    return String(s)
      .split(/[\/\n]+/)
      .map(part => part.trim())
      .filter(part => part.length > 0);
  };

  const pickPortNameForPoint = (point, portString) => {
    const pointCity = cityOf(point);
    const parts = splitPortString(portString);
    if (parts.length === 0) return null;
    if (pointCity) {
      for (const part of parts) {
        if (cityOf(part) === pointCity) return part;
      }
    }
    return parts[0];
  };

  const byPoint = new Map();

  const visitPort = (point, portString, lon, lat) => {
    if (!point) return;
    const pointKey = String(point).trim();
    if (!pointKey) return;
    const picked = pickPortNameForPoint(pointKey, portString);
    const candidateName = picked || pointKey;
    const candidateState = extractStateCode(candidateName) || extractStateCode(pointKey);

    const existing = byPoint.get(pointKey);
    if (!existing) {
      const lonN = +lon, latN = +lat;
      if (!isFinite(lonN) || !isFinite(latN)) return;
      byPoint.set(pointKey, {
        port_point: pointKey,
        port_name: candidateName,
        longitude: lonN,
        latitude: latN,
        state: candidateState,
      });
      return;
    }

    if (existing.state == null && candidateState != null) {
      existing.port_name = candidateName;
      existing.state = candidateState;
    }
  };

  for (const v of dataRoute) {
    if (v == null) continue;
    visitPort(v.load_point,   v.load_port,   v.load_lon,   v.load_lat);
    visitPort(v.unload_point, v.unload_port, v.unload_lon, v.unload_lat);
  }

  return Array.from(byPoint.values());
}


function _76(d3,dataRoute){return(
d3.sum( dataRoute, e => e.barrels)
)}

function _77(md){return(
md`## Routes`
)}

async function _fonts(FileAttachment,invalidation)
{
  const [symbolsUrl, interUrl, interItalicUrl] = await Promise.all([
    FileAttachment("NotoSansSymbols2-Regular.ttf").url(),
    FileAttachment("Inter-VariableFont_opsz,wght.ttf").url(),
    FileAttachment("Inter-Italic-VariableFont_opsz,wght.ttf").url()
  ]);

  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-family: "Inter";
      src: url("${interUrl}") format("truetype-variations");
      font-weight: 100 900;
      font-style: normal;
      font-display: block;
    }
    @font-face {
      font-family: "Inter";
      src: url("${interItalicUrl}") format("truetype-variations");
      font-weight: 100 900;
      font-style: italic;
      font-display: block;
    }

    @font-face {
      font-family: "Noto Symbols 2";
      src: url("${symbolsUrl}") format("truetype");
      font-weight: 100 900;
      font-style: normal;
      font-display: block;
    }
    @font-face {
      font-family: "Noto Symbols 2";
      src: url("${symbolsUrl}") format("truetype");
      font-weight: 100 900;
      font-style: italic;
      font-display: block;
    }
  `;
  document.head.appendChild(style);

  await Promise.all([
    document.fonts.load(`16px "Inter"`),
    document.fonts.load(`bold 16px "Inter"`),
    document.fonts.load(`italic 16px "Inter"`),
    document.fonts.load(`16px "Noto Symbols 2"`, "🡢 → ⟶ 🠂 ⬆ ★ ⬟ 🟊 ◯"),
    document.fonts.load(`bold 16px "Noto Symbols 2"`, "🡢"),
    document.fonts.load(`italic 16px "Noto Symbols 2"`, "🡢")
  ]);

  invalidation.then(() => style.remove());

  return "Inter, Noto Symbols 2 loaded";
}


function _navMesh(dataNavMesh,buildNavMesh,d3)
{
  // Build the navmesh once at page load from the saved dataNavMesh cell.
  // Returned object exposes:
  //   mesh       — result of buildNavMesh(points, links, disabledFaceKeys)
  //   mercator   — { forward(lonLat), inverse(xy), proj }
  //   mercToLL   — convenience: mercator-xy → [lon,lat]
  // Consumers (routedRoutes, globeRoutes) share this so we never rebuild.

  if (typeof dataNavMesh === "undefined" || !dataNavMesh) {
    return { mesh: null, mercator: null, mercToLL: null };
  }
  if (typeof buildNavMesh !== "function") {
    throw new Error("navMesh: buildNavMesh() is not defined in this notebook");
  }

  // Same seam convention the editor uses — keeps US west coast + Pacific
  // islands on one continuous side of the Mercator plane.
  const SEAM_OFFSET = -160;
  const proj = d3.geoMercator()
    .scale(1000)
    .translate([0, 0])
    .rotate([SEAM_OFFSET, 0, 0]);

  const mercator = {
    forward: (lonLat) => proj(lonLat),
    inverse: (xy)     => proj.invert(xy),
    proj,
  };
  const mercToLL = (x, y) => proj.invert([x, y]);

  const pointsIn = Array.isArray(dataNavMesh.points) ? dataNavMesh.points : [];
  const linksIn  = Array.isArray(dataNavMesh.links)  ? dataNavMesh.links  : [];
  const disabled = new Set(
    Array.isArray(dataNavMesh.disabledFaceKeys) ? dataNavMesh.disabledFaceKeys : []
  );

  // Project every user point into Mercator space — buildNavMesh works in 2D.
  const pts2d = [];
  for (const p of pointsIn) {
    if (p == null) continue;
    const xy = mercator.forward([+p.lon, +p.lat]);
    if (!xy) continue;
    pts2d.push({ id: +p.id, x: xy[0], y: xy[1] });
  }
  const links = linksIn.map(l => ({ id: +l.id, a: +l.a, b: +l.b }));

  const mesh = buildNavMesh(pts2d, links, disabled);

  // Pre-attach lon/lat to every derived point. The map renderer reads
  // these per frame; without the cache it would mercator.invert() each
  // point on every redraw.
  const userByKey = new Map(pointsIn.map(p => ["u" + p.id, p]));
  for (const dp of mesh.derivedPoints) {
    const up = userByKey.get(dp.id);
    if (up) {
      dp.lon = +up.lon;
      dp.lat = +up.lat;
    } else {
      const ll = mercator.inverse([dp.x, dp.y]);
      if (ll) { dp.lon = ll[0]; dp.lat = ll[1]; }
    }
  }

  return { mesh, mercator, mercToLL };
}


function _routes(dataRoute,navMesh,configGlobe,pathfinding,geometry)
{

  if (typeof dataRoute === "undefined" || !Array.isArray(dataRoute)) return [];

  const { mesh, mercator, mercToLL } = navMesh;
  const haveMesh = !!(mesh && mercator);

  const _cfg = (typeof configGlobe !== "undefined" && configGlobe) || {};
  const MERC_UNITS_PER_SAMPLE = _cfg.mercUnitsPerSample ?? 8;
  const MAX_SAMPLES_PER_SEG   = _cfg.maxSamplesPerSeg   ?? 64;
  function densifySegment(ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy);
    const n = Math.min(MAX_SAMPLES_PER_SEG, Math.max(0, Math.floor(len / MERC_UNITS_PER_SAMPLE)));
    if (n === 0) return [];
    const out = [];
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1);
      const ll = mercToLL(ax + dx * t, ay + dy * t);
      if (ll) out.push([ll[0], ll[1]]);
    }
    return out;
  }

  const SNAP_TOL = 0.5;
  const SNAP_TOL2 = SNAP_TOL * SNAP_TOL;

  const BIN_SIZE = Math.max(SNAP_TOL * 2, 4);
  const meshBins = new Map();
  function binKey(bx, by) { return bx + "," + by; }
  if (haveMesh) {
    for (const dp of mesh.derivedPoints) {
      if (dp.lon == null) continue;
      const bx = Math.floor(dp.x / BIN_SIZE);
      const by = Math.floor(dp.y / BIN_SIZE);
      const k = binKey(bx, by);
      let arr = meshBins.get(k);
      if (!arr) { arr = []; meshBins.set(k, arr); }
      arr.push(dp);
    }
  }
  function snapToVertex(mx, my) {
    if (!haveMesh) return null;
    const bx = Math.floor(mx / BIN_SIZE);
    const by = Math.floor(my / BIN_SIZE);
    let best = null, bestD2 = SNAP_TOL2;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const arr = meshBins.get(binKey(bx + dx, by + dy));
        if (!arr) continue;
        for (const dp of arr) {
          const ex = dp.x - mx, ey = dp.y - my;
          const d2 = ex * ex + ey * ey;
          if (d2 <= bestD2) { bestD2 = d2; best = dp; }
        }
      }
    }
    return best;
  }

  function straightResult(row) {

    let waypoints;
    if (haveMesh) {
      const sStart = mercator.forward([row.load_lon,   row.load_lat]);
      const sEnd   = mercator.forward([row.unload_lon, row.unload_lat]);
      if (sStart && sEnd) {
        const extras = densifySegment(sStart[0], sStart[1], sEnd[0], sEnd[1]);
        waypoints = [
          [row.load_lon, row.load_lat],
          ...extras,
          [row.unload_lon, row.unload_lat],
        ];
      }
    }
    if (!waypoints) {
      waypoints = [
        [row.load_lon,   row.load_lat],
        [row.unload_lon, row.unload_lat],
      ];
    }
    const chordIdx  = waypoints.map(() => 0);
    const junctions = [
      { lon: row.load_lon,   lat: row.load_lat,   vertexId: null },
      { lon: row.unload_lon, lat: row.unload_lat, vertexId: null },
    ];
    return { waypoints, chordIdx, junctions };
  }

  function routedResult(row) {
    if (!haveMesh) return straightResult(row);
    const sStart = mercator.forward([row.load_lon,   row.load_lat]);
    const sEnd   = mercator.forward([row.unload_lon, row.unload_lat]);
    if (!sStart || !sEnd) return straightResult(row);

    let middle;
    try {
      middle = pathfinding.routeWaypoints(
        { x: sStart[0], y: sStart[1] },
        { x: sEnd[0],   y: sEnd[1]   },
        mesh
      );
    } catch (err) {
      return straightResult(row);
    }
    if (!Array.isArray(middle) || middle.length < 2) return straightResult(row);

    const waypoints = [[row.load_lon, row.load_lat]];
    const chordIdx  = [0];
    const junctions = [
      { lon: row.load_lon, lat: row.load_lat, vertexId: null },
    ];
    for (let i = 0; i < middle.length - 1; i++) {
      const a = middle[i];
      const b = middle[i + 1];

      const extras = densifySegment(a.x, a.y, b.x, b.y);
      for (const ll of extras) {
        waypoints.push(ll);
        chordIdx.push(i);
      }

      if (i < middle.length - 2) {
        const dp = snapToVertex(b.x, b.y);
        if (dp && dp.lon != null) {
          waypoints.push([dp.lon, dp.lat]);
          chordIdx.push(i + 1);
          junctions.push({ lon: dp.lon, lat: dp.lat, vertexId: dp.id });
        } else {

          const ll = mercToLL(b.x, b.y);
          if (ll) {
            waypoints.push([ll[0], ll[1]]);
            chordIdx.push(i + 1);
            junctions.push({ lon: ll[0], lat: ll[1], vertexId: null });
          }
        }
      }
    }

    waypoints.push([row.unload_lon, row.unload_lat]);
    chordIdx.push(middle.length - 2);
    junctions.push({ lon: row.unload_lon, lat: row.unload_lat, vertexId: null });
    return { waypoints, chordIdx, junctions };
  }

  const out = [];
  for (const row of dataRoute) {
    if (row == null) continue;
    if (row.load_lon == null || row.load_lat == null
        || row.unload_lon == null || row.unload_lat == null) continue;
    const { waypoints, chordIdx, junctions } = routedResult(row);
    out.push({ ...row, waypoints, chordIdx, junctions });
  }

  function junctionKey(j) {
    if (j.vertexId != null) return "v:" + j.vertexId;

    const round = n => Math.round(n * 10000) / 10000;
    return "p:" + round(j.lon) + "," + round(j.lat);
  }

  for (const r of out) {
    for (const j of r.junctions) j.key = junctionKey(j);
  }

  const touchesByKey = new Map();
  out.forEach((r, ri) => {
    const n = r.junctions.length;
    for (let ji = 1; ji < n - 1; ji++) {
      const j = r.junctions[ji];
      let arr = touchesByKey.get(j.key);
      if (!arr) { arr = []; touchesByKey.set(j.key, arr); }
      arr.push({ ri, ji });
    }
  });

  function chordPairKey(r, ji) {
    const prev = ji > 0 ? r.junctions[ji - 1].key : "<start>";
    const next = ji < r.junctions.length - 1 ? r.junctions[ji + 1].key : "<end>";
    return prev < next ? prev + "||" + next : next + "||" + prev;
  }

  const decisionPoints = [];
  touchesByKey.forEach((touches, key) => {
    if (touches.length < 2) return;
    const groups = new Set();
    for (const { ri, ji } of touches) {
      groups.add(chordPairKey(out[ri], ji));
    }
    if (groups.size <= 1) return;

    const first = touches[0];
    const j = out[first.ri].junctions[first.ji];
    decisionPoints.push({
      key,
      lon: j.lon,
      lat: j.lat,
      routeCount: touches.length,
    });
  });

  out.decisionPoints = decisionPoints;

  function setMercXY(j) {
    if (j._mx != null) return;
    if (haveMesh) {
      const xy = mercator.forward([j.lon, j.lat]);
      if (xy) { j._mx = xy[0]; j._my = xy[1]; return; }
    }
    j._mx = null; j._my = null;
  }
  for (const r of out) for (const j of r.junctions) setMercXY(j);

  function unitMercDir(from, to) {
    if (from._mx == null || to._mx == null) return null;
    const dx = to._mx - from._mx, dy = to._my - from._my;
    const len = Math.hypot(dx, dy);
    if (len < 1e-9) return null;
    return { x: dx / len, y: dy / len };
  }

  function edgeKeyU(a, b) { return a < b ? a + "|" + b : b + "|" + a; }
  const neighborsByVertex = new Map();
  const edgeIncidence = new Map();

  if (haveMesh) {

    for (const dl of mesh.derivedLinks) {
      const a = mesh.dPointById(dl.a);
      const b = mesh.dPointById(dl.b);
      if (!a || !b) continue;
      let arrA = neighborsByVertex.get(a.id);
      if (!arrA) { arrA = new Map(); neighborsByVertex.set(a.id, arrA); }
      arrA.set(b.id, b);
      let arrB = neighborsByVertex.get(b.id);
      if (!arrB) { arrB = new Map(); neighborsByVertex.set(b.id, arrB); }
      arrB.set(a.id, a);
    }

    for (const f of mesh.faces) {
      const ring = f.ring;
      if (!ring || ring.length < 2) continue;
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];
        const k = edgeKeyU(a, b);
        let arr = edgeIncidence.get(k);
        if (!arr) { arr = []; edgeIncidence.set(k, arr); }
        arr.push(f);
      }
    }
  }

  function spokeWalkability(vId, wId) {
    const faces = edgeIncidence.get(edgeKeyU(vId, wId)) || [];
    const walkableFaces = faces.filter(f => f.isArea && !f.disabled);
    return { walkable: walkableFaces.length, walkableFaces };
  }

  function justificationShift(spokeDir, V, W, walkableFaces, memberCount) {
    if (memberCount < 1) return 0;
    if (walkableFaces.length !== 1) return 0;
    const face = walkableFaces[0];

    const mx = (V._mx + W._mx) / 2, my = (V._my + W._my) / 2;
    const perpX = -spokeDir.y, perpY = spokeDir.x;
    const spokeLen = Math.hypot(W._mx - V._mx, W._my - V._my);
    const PROBE = Math.min(0.05 * spokeLen, 2);
    const probeXY = { x: mx + perpX * PROBE, y: my + perpY * PROBE };

    const ringXY = mesh.ringToXY(face.ring);
    let plusInside;
    if (typeof geometry !== "undefined" && geometry && typeof geometry.pointInRing === "function") {
      plusInside = geometry.pointInRing(probeXY.x, probeXY.y, ringXY);
    } else {

      let inside = false;
      for (let i = 0, j = ringXY.length - 1; i < ringXY.length; j = i++) {
        const xi = ringXY[i].x, yi = ringXY[i].y;
        const xj = ringXY[j].x, yj = ringXY[j].y;
        const intersect = ((yi > probeXY.y) !== (yj > probeXY.y)) &&
          (probeXY.x < (xj - xi) * (probeXY.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      plusInside = inside;
    }
    const half = (memberCount - 1) / 2;
    return plusInside ? half : -half;
  }

  const ranksByDecision = new Map();
  for (const dp of decisionPoints) {
    const touches = touchesByKey.get(dp.key);
    if (!touches) continue;

    const V = out[touches[0].ri].junctions[touches[0].ji];
    if (V.vertexId == null) continue;

    const neighbors = neighborsByVertex.get(V.vertexId);
    const spokesByKey = new Map();
    if (neighbors) {
      neighbors.forEach((W, wId) => {
        const Wmx = W.x, Wmy = W.y;
        const dx = Wmx - V._mx, dy = Wmy - V._my;
        const len = Math.hypot(dx, dy);
        if (len < 1e-9) return;
        const spokeDir = { x: dx / len, y: dy / len };
        const { walkable, walkableFaces } = spokeWalkability(V.vertexId, wId);

        let kind;
        if (walkable === 0)      kind = "link";
        else if (walkable === 1) kind = "edge";
        else                     kind = "interior";
        spokesByKey.set("v:" + wId, {
          kind,
          neighborKey: "v:" + wId,
          neighborMx: Wmx, neighborMy: Wmy,
          spokeDir,
          walkable,
          walkableFaces,
          members: [],
        });
      });
    }

    const junctionWalkableFaces = new Set();
    spokesByKey.forEach(sp => {
      if (!sp.walkableFaces) return;
      for (const f of sp.walkableFaces) junctionWalkableFaces.add(f);
    });
    const junctionAllowsEdgeJustification = (junctionWalkableFaces.size === 1);

    function ensureSpoke(neighborJunc) {
      const key = neighborJunc.key;
      let sp = spokesByKey.get(key);
      if (sp) return sp;

      const dirM = unitMercDir(V, neighborJunc);
      if (!dirM) return null;
      sp = {
        kind: "area",
        neighborKey: key,

        neighborMx: neighborJunc._mx,
        neighborMy: neighborJunc._my,
        spokeDir: dirM,
        walkable: 0,
        walkableFaces: [],
        members: [],
      };
      spokesByKey.set(key, sp);
      return sp;
    }

    for (const { ri, ji } of touches) {
      const r = out[ri];
      const J = r.junctions;
      const prev = J[ji - 1];
      const next = J[ji + 1];
      if (!prev || !next) continue;

      const dirPrev = unitMercDir(V, prev);
      const dirNext = unitMercDir(V, next);
      if (!dirPrev || !dirNext) continue;

      const spIn = ensureSpoke(prev);
      if (spIn) spIn.members.push({ ri, ji, chordSide: "inbound",  otherDir: dirNext });

      const spOut = ensureSpoke(next);
      if (spOut) spOut.members.push({ ri, ji, chordSide: "outbound", otherDir: dirPrev });
    }

    spokesByKey.forEach((sp) => {
      if (sp.members.length === 0) return;

      const { spokeDir } = sp;
      for (const m of sp.members) {

        const dot   = spokeDir.x * m.otherDir.x + spokeDir.y * m.otherDir.y;
        const cross = spokeDir.x * m.otherDir.y - spokeDir.y * m.otherDir.x;
        let a = Math.atan2(cross, dot);
        if (a <= 0) a += 2 * Math.PI;
        m._sortAngle = a;

        const r = out[m.ri];
        const J = r.junctions;
        const otherJ = (m.chordSide === "inbound") ? J[m.ji + 1] : J[m.ji - 1];
        m._otherSpokeKey = otherJ ? otherJ.key : null;
      }
      sp.members.sort((u, v) => u._sortAngle - v._sortAngle);

      const mc = sp.members.length;

      const W = { _mx: sp.neighborMx, _my: sp.neighborMy };

      sp.shift = (junctionAllowsEdgeJustification && sp.kind === "edge")
        ? justificationShift(spokeDir, V, W, sp.walkableFaces, mc)
        : 0;
    });

    ranksByDecision.set(dp.key, spokesByKey);
  }

  // Annotate each junction with structural spoke kinds (link/edge/
  // interior/area). These come from the navmesh's walkability analysis
  // and are independent of the rank magnitudes. The renderer uses
  // these to classify chord types for corner-shape decisions, instead
  // of inferring kind from rank magnitudes (which can be misleading
  // when the fix-up loop scales ranks across bundles).
  for (const r of out) {
    const J = r.junctions;
    if (!J || J.length < 1) continue;
    for (let ji = 0; ji < J.length; ji++) {
      const j = J[ji];
      // Default: no structural kind known (endpoints, or junctions
      // that aren't decision points and so weren't analyzed).
      j.inboundSpokeKind = null;
      j.outboundSpokeKind = null;

      // For interior junctions, look up the spoke kinds via
      // ranksByDecision (keyed by junction key). If this junction
      // isn't a decision point, skip; the renderer will fall back
      // to its rank-threshold-based classification.
      if (ji === 0 || ji === J.length - 1) continue;
      const spokes = ranksByDecision.get(j.key);
      if (!spokes) continue;

      // Inbound spoke: the spoke at this junction whose neighbor is
      // the previous junction along the route.
      const prev = J[ji - 1];
      if (prev && prev.key) {
        const sp = spokes.get(prev.key);
        if (sp) j.inboundSpokeKind = sp.kind;
      }
      // Outbound spoke: the spoke whose neighbor is the next junction.
      const next = J[ji + 1];
      if (next && next.key) {
        const sp = spokes.get(next.key);
        if (sp) j.outboundSpokeKind = sp.kind;
      }
    }
  }

  for (const r of out) {
    for (const j of r.junctions) {
      j.inboundDirMerc  = null;
      j.outboundDirMerc = null;
    }
    const J = r.junctions;
    if (J.length >= 2) {
      J[0].outboundDirMerc = unitMercDir(J[0], J[1]);
      J[J.length - 1].inboundDirMerc = unitMercDir(J[J.length - 1], J[J.length - 2]);
    }
    for (let ji = 1; ji < J.length - 1; ji++) {
      J[ji].inboundDirMerc  = unitMercDir(J[ji], J[ji - 1]);
      J[ji].outboundDirMerc = unitMercDir(J[ji], J[ji + 1]);
    }
  }

  function chordKeyU(a, b) { return a < b ? a + "||" + b : b + "||" + a; }

  const chords = new Map();
  for (let ri = 0; ri < out.length; ri++) {
    const r = out[ri];
    const J = r.junctions;
    if (!J || J.length < 2) continue;
    for (let i = 0; i < J.length - 1; i++) {
      const a = J[i], b = J[i + 1];
      if (!a.key || !b.key) continue;
      const swap = !(a.key < b.key);
      const keyA = swap ? b.key : a.key;
      const keyB = swap ? a.key : b.key;
      const jA   = swap ? i + 1 : i;
      const jB   = swap ? i     : i + 1;

      const dirA = swap ? J[i + 1].inboundDirMerc : J[i].outboundDirMerc;
      const dirB = swap ? J[i].outboundDirMerc    : J[i + 1].inboundDirMerc;
      if (!dirA || !dirB) continue;
      const cKey = chordKeyU(a.key, b.key);
      let c = chords.get(cKey);
      if (!c) {
        c = { key: cKey, keyA, keyB, members: new Map() };
        chords.set(cKey, c);
      }
      c.members.set(ri, { ri, juncIdxA: jA, juncIdxB: jB, dirA, dirB });
    }
  }

  const chordsAtJunction = new Map();
  for (const c of chords.values()) {
    for (const jk of [c.keyA, c.keyB]) {
      let arr = chordsAtJunction.get(jk);
      if (!arr) { arr = new Set(); chordsAtJunction.set(jk, arr); }
      arr.add(c);
    }
  }
  const routeChordSeq = [];
  for (let ri = 0; ri < out.length; ri++) {
    const J = out[ri].junctions;
    const seq = [];
    if (J && J.length >= 2) {
      for (let i = 0; i < J.length - 1; i++) {
        seq.push(chords.get(chordKeyU(J[i].key, J[i + 1].key)) || null);
      }
    }
    routeChordSeq.push(seq);
  }

  function adjacentChord(chord, ri, endpointKey) {
    const m = chord.members.get(ri);
    if (!m) return null;
    const jAtEndpoint = (endpointKey === chord.keyA) ? m.juncIdxA : m.juncIdxB;
    const jOther      = (endpointKey === chord.keyA) ? m.juncIdxB : m.juncIdxA;
    const seq = routeChordSeq[ri];

    const thisIdx = Math.min(jAtEndpoint, jOther);
    const adjIdx  = (jOther > jAtEndpoint) ? thisIdx - 1 : thisIdx + 1;
    if (adjIdx < 0 || adjIdx >= seq.length) return null;
    return seq[adjIdx];
  }

  function spokeAtForChord(chord, epKey) {
    const spokes = ranksByDecision.get(epKey);
    if (!spokes) return null;
    const otherKey = (epKey === chord.keyA) ? chord.keyB : chord.keyA;
    return spokes.get(otherKey) || null;
  }

  function chordsInvert(d1, d2) { return (d1.x * d2.x + d1.y * d2.y) < 0; }

  const chordList = [...chords.values()].sort(
    (a, b) => b.members.size - a.members.size
  );
  const processed = new Set();
  const chordOrders = new Map();

  function chordNeighbors(chord) {
    const result = new Set();
    for (const ep of [chord.keyA, chord.keyB]) {
      const at = chordsAtJunction.get(ep);
      if (!at) continue;
      for (const other of at) {
        if (other === chord) continue;

        let shared = false;
        for (const ri of chord.members.keys()) {
          if (other.members.has(ri)) { shared = true; break; }
        }
        if (shared) result.add(other);
      }
    }
    return result;
  }

  let nextSeedIdx = 0;
  const queue = [];
  function seedQueue() {
    while (nextSeedIdx < chordList.length) {
      const c = chordList[nextSeedIdx++];
      if (!processed.has(c)) { queue.push(c); return true; }
    }
    return false;
  }
  seedQueue();
  while (queue.length > 0 || seedQueue()) {
    const chord = queue.shift();
    if (processed.has(chord)) continue;
    chordOrders.set(chord.key, solveChord(chord));
    processed.add(chord);
    for (const n of chordNeighbors(chord)) {
      if (!processed.has(n)) queue.push(n);
    }
  }

  function solveChord(chord) {
    const memberRids = [...chord.members.keys()];
    if (memberRids.length < 2) return memberRids.slice();

    const adj = new Map();
    const revAdj = new Map();
    for (const rid of memberRids) {
      adj.set(rid, new Set());
      revAdj.set(rid, new Set());
    }
    function wouldCycle(outer, inner) {
      if (outer === inner) return true;
      const stack = [inner];
      const seen = new Set([inner]);
      while (stack.length) {
        const n = stack.pop();
        if (n === outer) return true;
        for (const nx of adj.get(n)) {
          if (!seen.has(nx)) { seen.add(nx); stack.push(nx); }
        }
      }
      return false;
    }
    function tryAddEdge(outer, inner) {
      if (outer === inner) return;
      const a = adj.get(outer);
      if (!a || a.has(inner)) return;
      if (wouldCycle(outer, inner)) return;
      a.add(inner);
      revAdj.get(inner).add(outer);
    }

    for (const epKey of [chord.keyA, chord.keyB]) {
      const at = chordsAtJunction.get(epKey);
      if (!at) continue;
      for (const adjChord of at) {
        if (adjChord === chord || !processed.has(adjChord)) continue;
        const adjOrder = chordOrders.get(adjChord.key);
        if (!adjOrder) continue;
        const adjPosByRid = new Map();
        for (let i = 0; i < adjOrder.length; i++) adjPosByRid.set(adjOrder[i], i);

        const sharedAtV = [];
        for (const ri of chord.members.keys()) {
          if (!adjChord.members.has(ri)) continue;
          if (adjacentChord(chord, ri, epKey) === adjChord) sharedAtV.push(ri);
        }
        if (sharedAtV.length < 2) continue;

        const repRid = sharedAtV[0];
        const dHere = (epKey === chord.keyA)
          ? chord.members.get(repRid).dirA
          : chord.members.get(repRid).dirB;
        const dAdj  = (epKey === adjChord.keyA)
          ? adjChord.members.get(repRid).dirA
          : adjChord.members.get(repRid).dirB;
        if (!dHere || !dAdj) continue;
        const invert = chordsInvert(dHere, dAdj);

        const adjVisKeyB   = (epKey === adjChord.keyB);
        const chordVisKeyB = (epKey === chord.keyB);

        for (let i = 0; i < sharedAtV.length; i++) {
          const ri1 = sharedAtV[i];
          const p1 = adjPosByRid.get(ri1);
          if (p1 === undefined) continue;
          for (let j = i + 1; j < sharedAtV.length; j++) {
            const ri2 = sharedAtV[j];
            const p2 = adjPosByRid.get(ri2);
            if (p2 === undefined) continue;

            let ri1OuterAtVOnAdj = (p1 > p2);

            if (adjVisKeyB) ri1OuterAtVOnAdj = !ri1OuterAtVOnAdj;

            let ri1OuterAtVOnChord = invert ? !ri1OuterAtVOnAdj : ri1OuterAtVOnAdj;

            let ri1OuterInChord = chordVisKeyB ? !ri1OuterAtVOnChord : ri1OuterAtVOnChord;

            if (ri1OuterInChord) tryAddEdge(ri1, ri2);
            else                 tryAddEdge(ri2, ri1);
          }
        }
      }
    }

    function emitClassOuternessAtEndpoint(epKey) {
      const spokeHere = spokeAtForChord(chord, epKey);
      if (!spokeHere || spokeHere.kind !== "link") return;

      const spokesAtV = ranksByDecision.get(epKey);
      if (!spokesAtV) return;

      const edgePos = [], edgeNeg = [], areaPos = [], areaNeg = [];
      for (const m of spokeHere.members) {
        if (!chord.members.has(m.ri)) continue;
        const otherSpoke = m._otherSpokeKey ? spokesAtV.get(m._otherSpokeKey) : null;
        const otherKind = otherSpoke ? otherSpoke.kind : null;

        const edgeBound = (otherKind === "edge" || otherKind === "interior");
        const sin = Math.sin(m._sortAngle);
        if (sin > 0)      (edgeBound ? edgePos : areaPos).push(m.ri);
        else if (sin < 0) (edgeBound ? edgeNeg : areaNeg).push(m.ri);

      }

      const vIsKeyB = (epKey === chord.keyB);
      function emitOuterAtV(outerRid, innerRid) {
        if (vIsKeyB) tryAddEdge(innerRid, outerRid);
        else         tryAddEdge(outerRid, innerRid);
      }

      for (const e of edgePos) for (const a of areaPos) emitOuterAtV(e, a);

      for (const a of areaNeg) for (const e of edgeNeg) emitOuterAtV(a, e);
    }
    emitClassOuternessAtEndpoint(chord.keyA);
    emitClassOuternessAtEndpoint(chord.keyB);

    function emitAngularAtEndpoint(epKey) {
      const sp = spokeAtForChord(chord, epKey);
      if (!sp || sp.members.length < 2) return;

      const flip = (epKey === chord.keyB);
      const ordered = flip ? sp.members.slice().reverse() : sp.members;

      const filtered = ordered.filter(m => chord.members.has(m.ri));
      for (let i = 0; i < filtered.length - 1; i++) {
        tryAddEdge(filtered[i].ri, filtered[i + 1].ri);
      }
    }
    emitAngularAtEndpoint(chord.keyA);
    emitAngularAtEndpoint(chord.keyB);

    const tieKey = new Map();
    for (const rid of memberRids) {
      let sum = 0, n = 0;
      for (const epKey of [chord.keyA, chord.keyB]) {
        const sp = spokeAtForChord(chord, epKey);
        if (!sp) continue;
        const m = sp.members.find(x => x.ri === rid);
        if (!m || m._sortAngle == null) continue;

        const contribution = (epKey === chord.keyA)
          ? (2 * Math.PI - m._sortAngle)
          : m._sortAngle;
        sum += contribution; n++;
      }
      tieKey.set(rid, n > 0 ? sum / n : 0);
    }

    const inDeg = new Map();
    const ready = [];
    for (const rid of memberRids) {
      const d = revAdj.get(rid).size;
      inDeg.set(rid, d);
      if (d === 0) ready.push(rid);
    }
    const sorted = [];
    while (ready.length > 0) {
      let bestIdx = 0;
      for (let i = 1; i < ready.length; i++) {
        if ((tieKey.get(ready[i]) || 0) > (tieKey.get(ready[bestIdx]) || 0)) {
          bestIdx = i;
        }
      }
      const next = ready[bestIdx];
      ready[bestIdx] = ready[ready.length - 1];
      ready.pop();
      sorted.push(next);
      for (const child of adj.get(next)) {
        const d = inDeg.get(child) - 1;
        inDeg.set(child, d);
        if (d === 0) ready.push(child);
      }
    }

    if (sorted.length < memberRids.length) {
      const placed = new Set(sorted);
      sorted.push(...memberRids
        .filter(rid => !placed.has(rid))
        .sort((a, b) => (tieKey.get(b) || 0) - (tieKey.get(a) || 0)));
    }

    sorted.reverse();
    return sorted;
  }

  for (const r of out) {
    for (const j of r.junctions) {
      j.inboundRank  = 0;
      j.outboundRank = 0;
    }
  }

  function shiftAtSpoke(vKey, neighborKey) {
    const spokes = ranksByDecision.get(vKey);
    if (!spokes) return 0;
    const sp = spokes.get(neighborKey);
    return sp ? (sp.shift || 0) : 0;
  }

  chords.forEach((chord) => {
    const order = chordOrders.get(chord.key);
    if (!order) return;
    const m = order.length;
    const half = (m - 1) / 2;
    for (let pos = 0; pos < m; pos++) {
      const ri = order[pos];
      const rankKA = pos - half;
      const member = chord.members.get(ri);
      if (!member) continue;
      const jA = out[ri].junctions[member.juncIdxA];
      const jB = out[ri].junctions[member.juncIdxB];

      const aIsOutbound = member.juncIdxA < member.juncIdxB;
      const shiftA = shiftAtSpoke(chord.keyA, chord.keyB);
      const shiftB = shiftAtSpoke(chord.keyB, chord.keyA);
      if (aIsOutbound) {
        jA.outboundRank = rankKA   + shiftA;
        jB.inboundRank  = -rankKA  + shiftB;
      } else {
        jA.inboundRank  = rankKA   + shiftA;
        jB.outboundRank = -rankKA  + shiftB;
      }
    }
  });

  // Fix-up loop: when a route's chord bundle size changes across a
  // junction, the smaller-bundle side ends up with a chord-solver rank
  // that doesn't reflect the route's role in the larger bundle. We
  // re-derive the smaller side's rank from the larger side's, using a
  // turn-aware sign factor.
  //
  // Sign factor (turnFactor): for a route to stay on the same physical
  // screen side across a junction:
  //
  //   - STRAIGHT continuation (dot ≈ -1): factor = -1.
  //     Same chord perp on both sides; sign-convention flip in
  //     a.offEnd vs b.offStart requires opposite-sign ranks.
  //
  //   - SLIGHT turn (dot ≈ -0.5): factor ≈ dot itself.
  //     Perps mostly opposite, dotPN's negative captures the sign.
  //
  //   - ~90° TURN (dot ≈ 0): factor needs NEGATIVE sign.
  //     Perps perpendicular, magnitude near zero, but the SIGN must
  //     be negative to keep "outside of turn stays outside" of the
  //     bend (verified for both left and right 90° turns). dotPN at
  //     near-90° is sign-ambiguous — clamp to NEGATIVE.
  //
  //   - U-TURN-ISH (dot > +0.5): factor = dot (POSITIVE).
  //     The route is reversing direction; positive factor keeps the
  //     route on the same side.
  const SIGN_RELIABLE_THRESHOLD = 0.5;
  function turnFactor(inDir, outDir) {
    if (!inDir || !outDir) return -1;
    const dotPN = inDir.x * outDir.x + inDir.y * outDir.y;
    if (dotPN <= -SIGN_RELIABLE_THRESHOLD) return dotPN;        // straight-ish
    if (dotPN >=  SIGN_RELIABLE_THRESHOLD) return dotPN;        // U-turn-ish
    return -Math.abs(dotPN);                                    // ~90° zone
  }

  for (let ri = 0; ri < out.length; ri++) {
    const r = out[ri];
    const J = r.junctions;
    if (!J || J.length < 3) continue;
    const seq = routeChordSeq[ri];
    if (!seq) continue;
    for (let ji = 1; ji < J.length - 1; ji++) {
      const cIn  = seq[ji - 1];
      const cOut = seq[ji];
      if (!cIn || !cOut) continue;
      const mIn  = cIn.members.size;
      const mOut = cOut.members.size;
      if (mIn === mOut) continue;
      const j = J[ji];

      const factor = turnFactor(j.inboundDirMerc, j.outboundDirMerc);

      if (mIn > mOut) {
        j.outboundRank = (j.inboundRank || 0) * factor;
      } else {
        j.inboundRank = (j.outboundRank || 0) * factor;
      }
    }
  }

  for (const r of out) {
    const J = r.junctions;
    if (!J || J.length < 1) continue;
    J[0].outboundRank = 0;
    J[0].inboundRank  = 0;
    J[J.length - 1].outboundRank = 0;
    J[J.length - 1].inboundRank  = 0;
  }

  for (const r of out) for (const j of r.junctions) {
    delete j._mx; delete j._my;
  }

  return out;
}


function _globeRoutesHelpers(buildCurvedCorner,d3){return(
{

  spacingForScale(scale, initialScale, bundleSpacing, zoomSpacingFactor) {
    const z = scale / initialScale;
    return bundleSpacing * ((1 - zoomSpacingFactor) / z + zoomSpacingFactor);
  },
  cleanSelfIntersections(pts, window) {
    function segIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
      const rx = bx - ax, ry = by - ay;
      const sx2 = dx - cx, sy2 = dy - cy;
      const denom = rx * sy2 - ry * sx2;
      if (Math.abs(denom) < 1e-9) return null;
      const t = ((cx - ax) * sy2 - (cy - ay) * sx2) / denom;
      const u = ((cx - ax) * ry  - (cy - ay) * rx ) / denom;
      const EPS = 1e-6;
      if (t <= EPS || t >= 1 - EPS) return null;
      if (u <= EPS || u >= 1 - EPS) return null;
      return { x: ax + t * rx, y: ay + t * ry };
    }
    function onePass(pts, window) {
      const m = pts.length;
      if (m < 4) return pts;
      for (let i = 0; i < m - 3; i++) {
        const jMax = Math.min(m - 2, i + window);
        for (let j = jMax; j >= i + 2; j--) {
          const hit = segIntersect(
            pts[i].x,     pts[i].y,     pts[i + 1].x, pts[i + 1].y,
            pts[j].x,     pts[j].y,     pts[j + 1].x, pts[j + 1].y
          );
          if (hit) {
            const spliced = pts.slice(0, i + 1);
            spliced.push({ x: hit.x, y: hit.y });
            for (let k = j + 1; k < m; k++) spliced.push(pts[k]);
            return spliced;
          }
        }
      }
      return pts;
    }
    let arr = pts;
    const MAX_PASSES = 16;
    for (let pass = 0; pass < MAX_PASSES; pass++) {
      const next = onePass(arr, window);
      if (next === arr) return arr;
      arr = next;
    }
    return arr;
  },

  // Self-intersection cleanup + densification of long Mercator
  // segments, so straight runs follow the globe's curvature under the
  // orthographic projection instead of rendering as screen chords that
  // swing with rotation. Lerp is linear in Mercator (matching the
  // mesh's straight-in-Mercator links); "long" is measured in
  // great-circle degrees. Curve samples are already dense and pass
  // through untouched.
  dnsClean(pts, win, mercator) {
    const cleaned = this.cleanSelfIntersections(pts, win);
    if (!mercator || cleaned.length < 2) return cleaned;
    const MAX_DEG = 4;   // subdivide segments longer than this (great-circle °)
    const MAX_SUB = 32;  // cap inserted points per segment
    const D2R = Math.PI / 180;
    function llOf(p) {
      const ll = mercator.inverse([p.x, p.y]);
      return ll && isFinite(ll[0]) && isFinite(ll[1]) ? ll : null;
    }
    function gcDeg(a, b) {
      const f1 = a[1] * D2R, f2 = b[1] * D2R;
      const dF = (b[1] - a[1]) * D2R, dL = (b[0] - a[0]) * D2R;
      const s = Math.sin(dF / 2) ** 2 +
        Math.cos(f1) * Math.cos(f2) * Math.sin(dL / 2) ** 2;
      return 2 * Math.asin(Math.min(1, Math.sqrt(s))) / D2R;
    }
    const out = [cleaned[0]];
    let llA = llOf(cleaned[0]);
    for (let i = 1; i < cleaned.length; i++) {
      const a = cleaned[i - 1], b = cleaned[i];
      const llB = llOf(b);
      if (llA && llB) {
        const d = gcDeg(llA, llB);
        if (d > MAX_DEG) {
          const c = Math.min(MAX_SUB, Math.ceil(d / MAX_DEG) - 1);
          for (let j = 1; j <= c; j++) {
            const t = j / (c + 1);
            out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
          }
        }
      }
      out.push(b);
      llA = llB;
    }
    return out;
  },

  // Builds one strand's drawable pieces (lines + rounded-corner
  // cubics). Replaces the bldPcs previously inlined in globeRoutes.
  //
  // FIX vs the inline version: the junction-radius caps (cpAt) are
  // computed from UNOFFSET chain-waypoint distances, but a strand in a
  // wide bundle is drawn at an offset — around a corner, the inner
  // strand's drawn segment between two junctions can be far shorter
  // than the unoffset one. Each corner fit its own radius against the
  // drawn segment, but two ADJACENT corners could together exceed it:
  // corner A's curve exited past corner B's entry and the connecting
  // "line" piece ran backwards (overshoot, straight line back, then
  // continue). Now radii are (a) clamped to the drawn lengths of both
  // adjacent segments — so tight corners shrink instead of being
  // dropped — and (b) pair-scaled per segment so the two reaches
  // always fit within it. Radii only shrink, so one forward pass
  // satisfies every segment.
  //
  // segBudget (optional): (aWp, bWp) → number|undefined. A COMMON
  // per-segment length budget, typically the minimum drawn length of
  // that segment across ALL strands of the bundle. When provided, the
  // clamp and pair-fit passes use min(own drawn length, budget), so
  // every strand at a junction computes the IDENTICAL fitted radius.
  // That is what keeps the ribbon concentric: the axial corner model
  // is exactly width-preserving only when jr is common to all strands
  // (their curve start/end points then align axially). Without a
  // common budget, inner strands (shorter drawn segments) got smaller
  // radii than outer strands, opening gaps in the ribbon around
  // corners.
  bldPcs(chainWps, posAt, jrForStrand, segBudget) {
    const isEP = (wp) => typeof wp.id === "string" && wp.id.startsWith("endpoint:");
    const n = chainWps.length;
    if (n < 2) return [];
    const segEnd = new Array(n - 1);
    const segLen = new Float64Array(n - 1);
    const avail  = new Float64Array(n - 1);
    for (let i = 0; i < n - 1; i++) {
      const atA = posAt(i, i + 1), atB = posAt(i + 1, i);
      segEnd[i] = { atA, atB };
      segLen[i] = Math.hypot(atB.x - atA.x, atB.y - atA.y);
      const bud = segBudget ? segBudget(chainWps[i], chainWps[i + 1]) : undefined;
      avail[i] = (bud != null && isFinite(bud)) ? Math.min(segLen[i], bud) : segLen[i];
    }
    // Degenerate-segment detection: a strand on the inside of two
    // close bends can have a drawn middle segment that is near-zero or
    // REVERSED relative to the centerline (its offset endpoints have
    // crossed). Such a strand cannot traverse that segment: rendering
    // it faithfully draws a backtrack loop, which the downstream
    // self-intersection cleanup then splices into a chord that
    // shortcuts the corner (gap in the ribbon + crossing neighbors).
    // Instead, the strand's two flanking corners collapse into a
    // single pinch at the intersection of the flanking rails — one
    // clean sharp corner where its neighbors take two curves.
    const degSeg = new Set();
    for (let i = 1; i < n - 2; i++) {
      if (isEP(chainWps[i]) || isEP(chainWps[i + 1])) continue;
      const cdx = chainWps[i + 1].x - chainWps[i].x;
      const cdy = chainWps[i + 1].y - chainWps[i].y;
      const ddx = segEnd[i].atB.x - segEnd[i].atA.x;
      const ddy = segEnd[i].atB.y - segEnd[i].atA.y;
      if (cdx * ddx + cdy * ddy <= 1e-9 || segLen[i] < 1e-6) degSeg.add(i);
    }
    // Pass 1: desired radius per interior corner, clamped to caps AND
    // to the COMMON available lengths of both adjacent segments.
    // Corners flanking a degenerate segment are skipped here — they
    // are replaced with a shared pinch after pass 3.
    const jrW = new Float64Array(n);
    for (let i = 1; i < n - 1; i++) {
      const wp = chainWps[i];
      if (isEP(wp)) continue;
      if (degSeg.has(i) || degSeg.has(i - 1)) continue;
      if (segLen[i - 1] < 1e-9 || segLen[i] < 1e-9) continue;
      const { jr, capIn, capOut } = jrForStrand(
        wp, chainWps[i - 1], chainWps[i + 1],
        segEnd[i - 1].atB, segEnd[i].atA
      );
      jrW[i] = Math.max(0, Math.min(jr, capIn, capOut, avail[i - 1], avail[i]));
    }
    // Pass 2: pair-fit — two corners sharing a segment must fit inside
    // its COMMON budget together (same scale factor for every strand,
    // so alignment is preserved).
    for (let i = 0; i < n - 1; i++) {
      const sum = jrW[i] + jrW[i + 1];
      if (sum > avail[i] && sum > 1e-9) {
        const s = avail[i] / sum;
        jrW[i] *= s;
        jrW[i + 1] *= s;
      }
    }
    // Pass 3: build the corner curves with fitted radii.
    const curveAt = new Array(n);
    for (let i = 1; i < n - 1; i++) {
      const jr = jrW[i];
      if (!(jr > 1e-9)) { curveAt[i] = null; continue; }
      const inA     = segEnd[i - 1].atA;
      const posInW  = segEnd[i - 1].atB;
      const posOutW = segEnd[i].atA;
      const outB    = segEnd[i].atB;
      const dirIn = {
        x: (posInW.x - inA.x) / segLen[i - 1],
        y: (posInW.y - inA.y) / segLen[i - 1],
      };
      const dirOut = {
        x: (outB.x - posOutW.x) / segLen[i],
        y: (outB.y - posOutW.y) / segLen[i],
      };
      const centerW = { x: chainWps[i].x, y: chainWps[i].y };
      this.diagCheck(posInW, dirIn, posOutW, dirOut, centerW, jr, segLen[i - 1], segLen[i]);
      curveAt[i] = buildCurvedCorner(
        posInW, dirIn, posOutW, dirOut, centerW, jr, segLen[i - 1], segLen[i]
      );
    }
    // Collapse corners flanking degenerate segments into a shared
    // pinch at the intersection of the flanking rails (midpoint
    // fallback when the rails are near-parallel or the intersection is
    // implausibly far). Continuity is guaranteed for ANY pinch point:
    // both corners share it, and the degenerate segment renders as a
    // zero-length piece through it.
    for (const i of degSeg) {
      if (i - 1 < 0 || i + 1 >= n - 1) continue;
      const a1 = segEnd[i - 1].atA, p1 = segEnd[i - 1].atB;
      const p2 = segEnd[i + 1].atA, b2 = segEnd[i + 1].atB;
      let X = null;
      const l1 = Math.hypot(p1.x - a1.x, p1.y - a1.y);
      const l2 = Math.hypot(b2.x - p2.x, b2.y - p2.y);
      if (l1 > 1e-9 && l2 > 1e-9) {
        const d1x = (p1.x - a1.x) / l1, d1y = (p1.y - a1.y) / l1;
        const d2x = (b2.x - p2.x) / l2, d2y = (b2.y - p2.y) / l2;
        const det = d1x * d2y - d1y * d2x;
        if (Math.abs(det) > 1e-9) {
          const rx = p2.x - p1.x, ry = p2.y - p1.y;
          const u = (rx * d2y - ry * d2x) / det; // along d1 from p1
          if (u > -0.5 * l1 && u < l1 + l2) {
            X = { x: p1.x + u * d1x, y: p1.y + u * d1y };
          }
        }
      }
      if (!X) X = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const mk = () => ({ x: X.x, y: X.y });
      curveAt[i]     = { P0: mk(), P1: mk(), P2: mk(), P3: mk(), corner: mk(), pinched: true };
      curveAt[i + 1] = { P0: mk(), P1: mk(), P2: mk(), P3: mk(), corner: mk(), pinched: true };
    }
    // Emit pieces — with a CONTINUITY GUARANTEE. Whenever a corner has
    // no curve (radius scaled to zero on a very short segment, or a
    // degenerate near-U-turn on an inner strand whose short middle
    // segment reverses direction between two close bends), the
    // in-segment ends at the strand's offset endpoint on the in-rail
    // and the out-segment starts at its endpoint on the out-rail — two
    // DIFFERENT points. The polyline assembly downstream only pushes
    // each line piece's end point (assuming continuity), so such a gap
    // used to render as a silent chord from the in-rail endpoint to
    // the END of the next segment — a strand visibly "jumping" the
    // turn. Now an explicit rail-transfer connector line is inserted
    // at any discontinuity, so a curveless corner draws as a sharp but
    // faithful corner and the polyline can never skip a turn.
    const pieces = [];
    let prevEnd = null;
    const C_EPS = 1e-7;
    for (let i = 0; i < n - 1; i++) {
      const cIn  = curveAt[i];
      const cOut = curveAt[i + 1];
      const start = cIn  ? cIn.P3  : segEnd[i].atA;
      const end   = cOut ? cOut.P0 : segEnd[i].atB;
      if (prevEnd &&
          (Math.abs(prevEnd.x - start.x) > C_EPS ||
           Math.abs(prevEnd.y - start.y) > C_EPS)) {
        pieces.push({
          kind: "line", segIdx: i,
          x1: prevEnd.x, y1: prevEnd.y, x2: start.x, y2: start.y,
        });
      }
      pieces.push({ kind: "line", segIdx: i, x1: start.x, y1: start.y, x2: end.x, y2: end.y });
      prevEnd = end;
      if (cOut) {
        pieces.push({
          kind: "curve", segIdx: i + 1, wpIndex: i + 1,
          x1: cOut.P0.x, y1: cOut.P0.y,
          c1x: cOut.P1.x, c1y: cOut.P1.y,
          c2x: cOut.P2.x, c2y: cOut.P2.y,
          x2: cOut.P3.x, y2: cOut.P3.y,
        });
        prevEnd = { x: cOut.P3.x, y: cOut.P3.y };
      }
    }
    return pieces;
  },

  clusterChain(filteredIdx, wps, snapIds, clusterMergeDist) {
    const filteredWps = filteredIdx.map(i => wps[i]);
    const chainWps = [];
    const chainOrigIdxs = [];
    let i = 0;
    while (i < filteredWps.length) {
      const wpI = filteredWps[i];
      if (i > 0 && i < filteredWps.length - 1 &&
          snapIds.has(wpI.id) &&
          wpI.onLinkId != null) {
        let j = i;
        while (j + 1 < filteredWps.length - 1 &&
               snapIds.has(filteredWps[j + 1].id) &&
               filteredWps[j + 1].onLinkId === wpI.onLinkId &&
               Math.hypot(
                 filteredWps[j + 1].x - filteredWps[j].x,
                 filteredWps[j + 1].y - filteredWps[j].y
               ) <= clusterMergeDist) {
          j++;
        }
        if (j > i) {
          let sx = 0, sy = 0;
          const clusterIds = [];
          const origIdxs = [];
          for (let k = i; k <= j; k++) {
            sx += filteredWps[k].x;
            sy += filteredWps[k].y;
            clusterIds.push(filteredWps[k].id);
            origIdxs.push(filteredIdx[k]);
          }
          const n = j - i + 1;
          chainWps.push({
            id: filteredWps[i].id,
            x: sx / n,
            y: sy / n,
            kind: "snap",
            onLinkId: wpI.onLinkId,
            _clusterIds: clusterIds,
            _clusterMembers: filteredWps.slice(i, j + 1),
          });
          chainOrigIdxs.push(origIdxs);
          i = j + 1;
          continue;
        }
      }
      chainWps.push(wpI);
      chainOrigIdxs.push([filteredIdx[i]]);
      i++;
    }
    return { chainWps, chainOrigIdxs };
  },

  computeStateLabelPoint(feature, precision) {
    function ringArea(ring) {
      let sum = 0;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        sum += (ring[j][0] - ring[i][0]) * (ring[i][1] + ring[j][1]);
      }
      return sum / 2;
    }
    function pointToSegmentDistSq(x, y, ax, ay, bx, by) {
      let dx = bx - ax, dy = by - ay;
      if (dx !== 0 || dy !== 0) {
        const t = ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy);
        if (t > 1) { ax = bx; ay = by; }
        else if (t > 0) { ax += dx * t; ay += dy * t; }
      }
      dx = x - ax; dy = y - ay;
      return dx * dx + dy * dy;
    }
    function pointToPolygonDist(x, y, polygon) {
      let inside = false;
      let minSq = Infinity;
      for (const ring of polygon) {
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const ax = ring[i][0], ay = ring[i][1];
          const bx = ring[j][0], by = ring[j][1];
          if (((ay > y) !== (by > y)) && (x < (bx - ax) * (y - ay) / (by - ay) + ax)) inside = !inside;
          const dSq = pointToSegmentDistSq(x, y, ax, ay, bx, by);
          if (dSq < minSq) minSq = dSq;
        }
      }
      const d = minSq === 0 ? 0 : Math.sqrt(minSq);
      return inside ? d : -d;
    }
    function cellRanked(x, y, h, polygon) {
      const d = pointToPolygonDist(x, y, polygon);
      return { x, y, h, d, max: d + h * Math.SQRT2 };
    }
    function polylabel(polygon, precision) {
      if (!polygon || polygon.length === 0 || polygon[0].length === 0) return null;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of polygon[0]) {
        if (p[0] < minX) minX = p[0];
        if (p[0] > maxX) maxX = p[0];
        if (p[1] < minY) minY = p[1];
        if (p[1] > maxY) maxY = p[1];
      }
      const w = maxX - minX, h = maxY - minY;
      const cellSize = Math.min(w, h);
      if (cellSize === 0) return [minX, minY];
      const cellHalf = cellSize / 2;
      const queue = [];
      function enqueue(c) {
        let lo = 0, hi = queue.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (queue[mid].max > c.max) lo = mid + 1; else hi = mid;
        }
        queue.splice(lo, 0, c);
      }
      function dequeue() { return queue.shift(); }
      for (let x = minX; x < maxX; x += cellSize) {
        for (let y = minY; y < maxY; y += cellSize) {
          enqueue(cellRanked(x + cellHalf, y + cellHalf, cellHalf, polygon));
        }
      }
      let best = cellRanked(minX + w / 2, minY + h / 2, 0, polygon);
      let cx = 0, cy = 0, ringWeight = 0;
      for (let i = 0, len = polygon[0].length, j = len - 1; i < len; j = i++) {
        const a = polygon[0][i], b = polygon[0][j];
        const f = a[0] * b[1] - b[0] * a[1];
        cx += (a[0] + b[0]) * f;
        cy += (a[1] + b[1]) * f;
        ringWeight += f * 3;
      }
      if (ringWeight !== 0) {
        const centroidCell = cellRanked(cx / ringWeight, cy / ringWeight, 0, polygon);
        if (centroidCell.d > best.d) best = centroidCell;
      }
      const prec = precision ?? Math.max(w, h) / 200;
      while (queue.length) {
        const c = dequeue();
        if (c.d > best.d) best = c;
        if (c.max - best.d <= prec) continue;
        const half = c.h / 2;
        enqueue(cellRanked(c.x - half, c.y - half, half, polygon));
        enqueue(cellRanked(c.x + half, c.y - half, half, polygon));
        enqueue(cellRanked(c.x - half, c.y + half, half, polygon));
        enqueue(cellRanked(c.x + half, c.y + half, half, polygon));
      }
      return [best.x, best.y];
    }
    function largestPolygon(feature) {
      const g = feature && feature.geometry;
      if (!g) return null;
      if (g.type === "Polygon") return g.coordinates;
      if (g.type === "MultiPolygon") {
        let best = null, bestArea = -Infinity;
        for (const poly of g.coordinates) {
          const a = Math.abs(ringArea(poly[0]));
          if (a > bestArea) { bestArea = a; best = poly; }
        }
        return best;
      }
      return null;
    }
    const poly = largestPolygon(feature);
    if (!poly) return null;
    return polylabel(poly, precision ?? 0.05);
  },

  stateNameToCode: {
    "alabama":"AL","alaska":"AK","arizona":"AZ","arkansas":"AR","california":"CA",
    "colorado":"CO","connecticut":"CT","delaware":"DE","florida":"FL","georgia":"GA",
    "hawaii":"HI","idaho":"ID","illinois":"IL","indiana":"IN","iowa":"IA",
    "kansas":"KS","kentucky":"KY","louisiana":"LA","maine":"ME","maryland":"MD",
    "massachusetts":"MA","michigan":"MI","minnesota":"MN","mississippi":"MS",
    "missouri":"MO","montana":"MT","nebraska":"NE","nevada":"NV","new hampshire":"NH",
    "new jersey":"NJ","new mexico":"NM","new york":"NY","north carolina":"NC",
    "north dakota":"ND","ohio":"OH","oklahoma":"OK","oregon":"OR","pennsylvania":"PA",
    "rhode island":"RI","south carolina":"SC","south dakota":"SD","tennessee":"TN",
    "texas":"TX","utah":"UT","vermont":"VT","virginia":"VA","washington":"WA",
    "west virginia":"WV","wisconsin":"WI","wyoming":"WY",
    "district of columbia":"DC","puerto rico":"PR","u.s. virgin islands":"VI",
    "us virgin islands":"VI","virgin islands":"VI","guam":"GU","american samoa":"AS",
    "northern mariana islands":"MP","bahamas":"BS",
  },

  featureStateCode(f) {
    const dict = this.stateNameToCode;
    const codeSet = new Set(Object.values(dict));
    if (!f) return null;
    const props = f.properties || {};
    const candidates = [
      props.postal, props.STUSPS, props.stusps, props.iso_3166_2,
      props.code, props.state_code, props.abbr, props.abbreviation,
      props.state, props.STATE, props.NAME, props.name,
    ];
    for (const c of candidates) {
      if (!c) continue;
      const s = String(c).trim();
      if (s.length === 2) {
        const up = s.toUpperCase();
        if (codeSet.has(up)) return up;
      }
      const tail = s.includes("-") ? s.split("-").pop() : s;
      if (tail && tail.length === 2) {
        const up = tail.toUpperCase();
        if (codeSet.has(up)) return up;
      }
      const named = dict[s.toLowerCase()];
      if (named) return named;
    }
    return null;
  },

  evalCubic(x1, y1, c1x, c1y, c2x, c2y, x2, y2, t) {
    const mt = 1 - t;
    const b0 = mt * mt * mt;
    const b1 = 3 * mt * mt * t;
    const b2 = 3 * mt * t * t;
    const b3 = t * t * t;
    return {
      x: b0 * x1 + b1 * c1x + b2 * c2x + b3 * x2,
      y: b0 * y1 + b1 * c1y + b2 * c2y + b3 * y2,
    };
  },

  pointSegDistSq(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    let t = 0;
    if (lenSq > 0) {
      t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
      if (t < 0) t = 0; else if (t > 1) t = 1;
    }
    const qx = ax + t * dx, qy = ay + t * dy;
    const ex = px - qx, ey = py - qy;
    return ex * ex + ey * ey;
  },

  easeInOutCubic(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  sameKeys(a, b) {
    if (!a) return b.size === 0;
    if (a.size !== b.size) return false;
    for (const k of b) if (!a.has(k)) return false;
    return true;
  },

  zoomAroundPoint(prj, sx, sy, newScale, clampRot) {
    const before = prj.invert ? prj.invert([sx, sy]) : null;
    prj.scale(newScale);
    if (!before || !isFinite(before[0]) || !isFinite(before[1])) return;
    for (let iter = 0; iter < 4; iter++) {
      const p = prj([before[0], before[1]]);
      if (!p) break;
      const dx = sx - p[0], dy = sy - p[1];
      if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) break;
      const rot = prj.rotate();
      const k = 180 / Math.PI / prj.scale();
      let next = [rot[0] + dx * k, rot[1] - dy * k, rot[2]];
      if (clampRot) next = clampRot(next);
      prj.rotate(next);
    }
  },

  clampEl(obEl, x, y, w, h, cw, ch) {
    if (!obEl) return { x, y };
    const lw = obEl.offsetWidth, lh = obEl.offsetHeight;
    if (!lw || !lh) return { x, y };
    const lx = obEl.offsetLeft, ly = obEl.offsetTop;
    const m = 4;
    const lLeft = lx - m, lRight = lx + lw + m;
    const lTop = ly - m, lBot = ly + lh + m;
    if (x + w > lLeft && x < lRight && y + h > lTop && y < lBot) {
      const cx = lLeft - w;
      if (cx >= 2) return { x: cx, y };
      const cy = lBot;
      if (cy + h <= ch - 2) return { x, y: cy };
      return { x: cx < 2 ? 2 : cx, y };
    }
    return { x, y };
  },

  focusInfo(hit, ctx) {
    if (!hit) return null;
    const keysFrom = (reSet) => {
      const ks = new Set();
      if (reSet && ctx.rArr) {
        for (const re of reSet) {
          const rec = ctx.rArr[re.routeIndex];
          const k = rec ? ctx.routeKey(rec) : null;
          if (k != null) ks.add(k);
        }
      }
      return ks;
    };
    if (hit.port) {
      const p = hit.port;
      return {
        type: "port", name: p.name || "Port", portIndex: p.portIndex,
        keys: keysFrom(ctx.rByP && ctx.rByP.get(p.portIndex)),
      };
    }
    if (hit.state) {
      const s = hit.state;
      const props = (s.feature && s.feature.properties) || {};
      return {
        type: "state", name: props.name || props.NAME || s.code, code: s.code,
        keys: keysFrom(ctx.rByS && ctx.rByS.get(s.code)),
      };
    }
    return null;
  },

  focusRouteSet(focus, rByP, rByS) {
    if (!focus) return null;
    if (focus.type === "port") return (rByP && rByP.get(focus.portIndex)) || new Set();
    if (focus.type === "state") return (rByS && rByS.get(focus.code)) || new Set();
    return null;
  },

  applyOptimizedOrderings(network, orderings) {
    if (!orderings || orderings.size === 0) return;
    const linkGroups = network.linkGroups;
    if (!linkGroups) return;
    for (const [gk, entry] of orderings) {
      const group = linkGroups.get(gk);
      if (!group) continue;
      const ordering = Array.isArray(entry) ? entry : [];
      const inGroup = new Set(group.routeUnion);
      const filtered = ordering.filter(r => inGroup.has(r));
      for (const r of group.routeUnion) if (!filtered.includes(r)) filtered.push(r);
      const n = filtered.length;
      const layout = new Map();
      for (let k = 0; k < n; k++) {
        let off;
        if (group.areaSide === +1)      off = +k;
        else if (group.areaSide === -1) off = k - (n - 1);
        else                            off = k - (n - 1) / 2;
        layout.set(filtered[k], off);
      }
      for (const ek of group.edgeKeys) {
        const e = network.edges.get(ek);
        if (!e) continue;
        e.bundleOffsetByRoute = new Map();
        for (const ri of e.routeIdxs) {
          if (layout.has(ri)) e.bundleOffsetByRoute.set(ri, layout.get(ri));
        }
      }
    }
  },

  makeTooltipEl(parent, cfg) {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.top = "0";
    el.style.left = "0";
    el.style.pointerEvents = "none";
    el.style.background = cfg.background;
    el.style.color = cfg.color;
    el.style.fontSize = cfg.fontSize + "px";
    el.style.padding = cfg.padding;
    el.style.borderRadius = cfg.borderRadius + "px";
    if (cfg.maxWidth != null) {
      el.style.maxWidth = cfg.maxWidth + "px";
      el.style.whiteSpace = "normal";
      el.style.overflowWrap = "break-word";
    } else {
      el.style.whiteSpace = "nowrap";
    }
    el.style.lineHeight = "1.35";
    el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";
    el.style.display = "none";
    el.style.zIndex = String(cfg.zIndex ?? 10);
    if (cfg.fontFamily) el.style.fontFamily = cfg.fontFamily;
    parent.appendChild(el);
    return el;
  },

  arrowSym(svg) {
    let el;
    if (svg) {
      el = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      el.setAttribute("font-family", `"Noto Symbols 2", sans-serif`);
    } else {
      el = document.createElement("span");
      el.style.fontFamily = `"Noto Symbols 2", sans-serif`;
    }
    el.textContent = "🡢";
    return el;
  },

  makeZoomControl(parent, fontFamily, hintText, onScrub) {
    const HW = 5, HH = 12;
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "position:absolute; inset:0; display:flex; align-items:flex-start;" +
      "justify-content:center; padding-top:8px; pointer-events:none; z-index:20;";
    const col = document.createElement("div");
    col.style.cssText =
      "display:inline-flex; flex-direction:column; align-items:stretch;" +
      "gap:6px; pointer-events:none;";
    const hint = document.createElement("div");
    hint.textContent = hintText;
    hint.style.cssText =
      "background:rgba(255,255,255,0.92); padding:5px 8px; border-radius:4px;" +
      "box-shadow:0 2px 6px rgba(0,0,0,0.18); font-size:11px; color:#555;" +
      "text-align:center; white-space:nowrap; pointer-events:none;";
    hint.style.fontFamily = fontFamily;
    col.appendChild(hint);
    const box = document.createElement("div");
    box.style.cssText =
      `position:relative; width:100%; height:${HH}px;` +
      "pointer-events:auto; cursor:pointer; touch-action:none;";
    const track = document.createElement("div");
    track.style.cssText =
      "position:absolute; left:0; right:0; top:50%; transform:translateY(-50%);" +
      "height:2px; background:#fff; border-radius:1px;" +
      "box-shadow:0 1px 3px rgba(0,0,0,0.35);";
    const handle = document.createElement("div");
    handle.style.cssText =
      `position:absolute; top:50%; transform:translateY(-50%);` +
      `width:${HW}px; height:${HH}px; background:#fff;` +
      "border-radius:2px; box-shadow:0 1px 2px 0.5px rgba(0,0,0,0.5);";
    box.appendChild(track);
    box.appendChild(handle);
    col.appendChild(box);
    wrap.appendChild(col);
    parent.appendChild(wrap);
    const tAt = (clientX) => {
      const r = box.getBoundingClientRect();
      return r.width ? (clientX - r.left) / r.width : 0;
    };
    let sliding = false;
    box.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      sliding = true;
      try { box.setPointerCapture(e.pointerId); } catch (_) {}
      onScrub(tAt(e.clientX));
    });
    box.addEventListener("pointermove", (e) => {
      if (sliding) onScrub(tAt(e.clientX));
    });
    const end = (e) => {
      sliding = false;
      try { box.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    box.addEventListener("pointerup", end);
    box.addEventListener("pointercancel", end);
    return {
      hintEl: hint,
      setHandle(t) {
        const c = t < 0 ? 0 : t > 1 ? 1 : t;
        handle.style.left = `calc(${c} * (100% - ${HW}px))`;
      },
    };
  },

  setupPinchZoom(node, opts) {
    const pts = new Map();
    let active = false, suppress = false, startDist = 0, startScale = 1;
    const dist = () => {
      const a = [...pts.values()];
      return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
    };
    const mid = () => {
      const a = [...pts.values()];
      return { x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 };
    };
    function down(e) {
      if (e.pointerType !== "touch") return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        active = true;
        suppress = true;
        startDist = dist();
        startScale = opts.getScale();
      }
    }
    function move(e) {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (active && pts.size >= 2 && startDist > 0) {
        e.preventDefault();
        const d = dist();
        if (d > 0) {
          const m = mid();
          const c = opts.toCanvas(m.x, m.y);
          opts.zoomTo(startScale * (d / startDist), c.x, c.y);
        }
      }
    }
    function up(e) {
      if (!pts.delete(e.pointerId)) return;
      if (pts.size < 2) active = false;
      if (pts.size === 0) suppress = false;
    }
    node.addEventListener("pointerdown", down, { capture: true });
    node.addEventListener("pointermove", move, { capture: true, passive: false });
    node.addEventListener("pointerup", up, { capture: true });
    node.addEventListener("pointercancel", up, { capture: true });
    return {
      count: () => pts.size,
      isPinching: () => active,
      isSuppressed: () => suppress,
    };
  },

  setTooltipLines(el, portName, dateStr, symbolKind, symbolOnLeft, fromCode, toCode) {
    el.textContent = "";

    function cap1(s) {
      const str = String(s);
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
    }

    function fillSplit(div, s) {
      const parts = String(s).split("/");
      for (let i = 0; i < parts.length; i++) {
        const seg = (i === 0 ? parts[i] : parts[i].replace(/^\s+/, ""));
        const text = (i < parts.length - 1) ? seg + "/" : seg;
        if (i > 0) div.appendChild(document.createElement("br"));
        div.appendChild(document.createTextNode(text));
      }
    }
    const line1 = document.createElement("div");
    if (portName) fillSplit(line1, cap1(portName));
    el.appendChild(line1);

    const markerKind =
      (symbolKind === "departure" || symbolKind === "arrival") ? symbolKind : null;
    if (dateStr || markerKind) {
      const line2 = document.createElement("div");
      line2.style.fontStyle = "italic";
      line2.style.opacity = "0.85";
      line2.style.display = "flex";
      line2.style.alignItems = "center";
      line2.style.justifyContent = "space-between";
      line2.style.gap = "0.4em";
      const dateNode = document.createElement("span");
      dateNode.textContent = dateStr ? cap1(dateStr) : "";
      let markerNode = null;
      if (markerKind) {
        markerNode = document.createElement("span");
        markerNode.style.fontStyle = "normal";
        markerNode.style.flex = "0 0 auto";
        const fc = fromCode || "", tc = toCode || "";
        if (markerKind === "departure") {
          if (fc) markerNode.appendChild(document.createTextNode(fc));
          markerNode.appendChild(this.arrowSym(false));
        } else {
          markerNode.appendChild(this.arrowSym(false));
          if (tc) markerNode.appendChild(document.createTextNode(tc));
        }
      }
      if (symbolOnLeft) {
        if (markerNode) line2.appendChild(markerNode);
        line2.appendChild(dateNode);
      } else {
        line2.appendChild(dateNode);
        if (markerNode) line2.appendChild(markerNode);
      }
      el.appendChild(line2);
    }
  },

  llKey(lon, lat) {
    return Math.round(lon * 1e4) + "|" + Math.round(lat * 1e4);
  },

  computeBaseScale(w, h, globeInset) {
    return Math.min(w, h) / 2 - globeInset;
  },

  measureContainerWidth(wrapperRef, fallback) {
    const el = wrapperRef && wrapperRef.el;
    if (el && el.isConnected) {
      // Measure the wrapper's OWN content-box width (clientWidth). This is the
      // box that the canvas and SVG both fill at width:100%, so sizing the
      // canvas to it keeps the two layers aligned no matter how the element is
      // embedded. A parent-based measurement breaks under host padding,
      // scrollbars, or intermediate runtime wrapper divs, where the parent's
      // width no longer equals the wrapper's rendered width. clientWidth is the
      // untransformed layout width, which is exactly how width:100% resolves
      // (and, unlike getBoundingClientRect(), it ignores any CSS transform on
      // an ancestor — so a scaled embed still lines up).
      if (el.clientWidth > 0) return el.clientWidth;
      const p = el.parentElement;
      if (p && p.clientWidth > 0) return p.clientWidth;
    }
    const bodyW = document.body && document.body.clientWidth;
    if (bodyW && bodyW > 0) return bodyW;
    return fallback ?? 700;
  },

  pointerToCanvas(event, overlayNode, width, heightPx) {
    const rect = overlayNode.getBoundingClientRect();
    if (!(rect.width > 0) || !(rect.height > 0)) {
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    const s = Math.min(rect.width / width, rect.height / heightPx);
    const offX = (rect.width - width * s) / 2;
    const offY = (rect.height - heightPx * s) / 2;
    return {
      x: (event.clientX - rect.left - offX) / s,
      y: (event.clientY - rect.top - offY) / s,
    };
  },

  makeStateLabel(stateEntry, parent, fontSize, fill) {
    const svgNs = "http://www.w3.org/2000/svg";
    const t = document.createElementNS(svgNs, "text");
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dominant-baseline", "central");
    t.setAttribute("font-size", String(fontSize));
    t.setAttribute("fill", fill);
    t.setAttribute("stroke", "white");
    t.setAttribute("stroke-width", "4");
    t.setAttribute("stroke-linejoin", "round");
    t.setAttribute("paint-order", "stroke fill");
    t.setAttribute("pointer-events", "none");
    t.setAttribute("display", "none");
    t.textContent = stateEntry.code;
    parent.appendChild(t);
    return t;
  },

  buildLookupTables(portEntries, routeEntries, routes) {
    const routesByPortIdx     = new Map();
    const routesByStateCode   = new Map();
    const portsByRouteEntry   = new Map();
    const portsByStateCode    = new Map();
    const portByIdx           = new Map();
    const routesInByStateCode  = new Map();
    const routesOutByStateCode = new Map();
    for (const pe of portEntries) {
      portByIdx.set(pe.portIndex, pe);
      if (pe.stateCode) {
        let set = portsByStateCode.get(pe.stateCode);
        if (!set) { set = new Set(); portsByStateCode.set(pe.stateCode, set); }
        set.add(pe);
      }
    }
    if (Array.isArray(routes)) {
      const llKey = this.llKey;
      const portByLLKey = new Map();
      for (const pe of portEntries) {
        portByLLKey.set(llKey(pe.lonlat[0], pe.lonlat[1]), pe.portIndex);
      }
      function addRouteForPort(portIdx, entry) {
        let set = routesByPortIdx.get(portIdx);
        if (!set) { set = new Set(); routesByPortIdx.set(portIdx, set); }
        set.add(entry);
      }
      function addRouteForState(stateCode, entry) {
        if (!stateCode) return;
        let set = routesByStateCode.get(stateCode);
        if (!set) { set = new Set(); routesByStateCode.set(stateCode, set); }
        set.add(entry);
      }
      function addPortForRoute(routeEntry, portEntry) {
        let set = portsByRouteEntry.get(routeEntry);
        if (!set) { set = new Set(); portsByRouteEntry.set(routeEntry, set); }
        set.add(portEntry);
      }
      function addDirected(map, stateCode, entry) {
        if (!stateCode) return;
        let set = map.get(stateCode);
        if (!set) { set = new Set(); map.set(stateCode, set); }
        set.add(entry);
      }
      for (const re of routeEntries) {
        const ri = re.routeIndex;
        const r = (ri != null) ? routes[ri] : null;
        if (!r) continue;
        const startIdx = portByLLKey.get(llKey(+r.load_lon,   +r.load_lat));
        const endIdx   = portByLLKey.get(llKey(+r.unload_lon, +r.unload_lat));
        if (startIdx != null) {
          const sp = portByIdx.get(startIdx);
          addRouteForPort(startIdx, re);
          if (sp) {
            addPortForRoute(re, sp);
            if (sp.stateCode) {
              addRouteForState(sp.stateCode, re);
              addDirected(routesOutByStateCode, sp.stateCode, re);
            }
          }
        }
        if (endIdx != null) {
          const ep = portByIdx.get(endIdx);
          addRouteForPort(endIdx, re);
          if (ep) {
            addPortForRoute(re, ep);
            if (ep.stateCode) {
              addRouteForState(ep.stateCode, re);
              addDirected(routesInByStateCode, ep.stateCode, re);
            }
          }
        }
      }
    }
    return {
      routesByPortIdx, routesByStateCode,
      portsByRouteEntry, portsByStateCode, portByIdx,
      routesInByStateCode, routesOutByStateCode,
    };
  },

  computePreviousPaths(port, route, state, routesByPortIdx, routesByStateCode) {
    if (port) return routesByPortIdx.get(port.portIndex) ?? new Set();
    if (route) { const s = new Set(); s.add(route); return s; }
    if (state) return routesByStateCode.get(state.code) ?? new Set();
    return new Set();
  },

  computePreviousPorts(port, route, state, paths, portsByRouteEntry, portsByStateCode) {
    const s = new Set();
    if (paths && paths.size) {
      for (const re of paths) {
        const endpoints = portsByRouteEntry.get(re);
        if (endpoints) for (const pe of endpoints) s.add(pe);
      }
    }
    if (port) s.add(port);
    if (state) {
      const ps = portsByStateCode.get(state.code);
      if (ps) for (const pe of ps) s.add(pe);
    }
    return s;
  },

  classifyRouteEndpoints(routeEntry, routes, portsByRouteEntry) {
    const ri = routeEntry.routeIndex;
    const r = (ri != null && Array.isArray(routes)) ? routes[ri] : null;
    if (!r) return { route: null, loadPe: null, unloadPe: null };
    const endpoints = portsByRouteEntry.get(routeEntry);
    if (!endpoints || endpoints.size === 0) return { route: r, loadPe: null, unloadPe: null };
    const eps = 1e-3;
    let loadPe = null, unloadPe = null;
    for (const pe of endpoints) {
      const [lon, lat] = pe.lonlat;
      if (Math.abs(lon - r.load_lon)   < eps && Math.abs(lat - r.load_lat)   < eps) loadPe   = pe;
      if (Math.abs(lon - r.unload_lon) < eps && Math.abs(lat - r.unload_lat) < eps) unloadPe = pe;
    }
    if (!loadPe || !unloadPe) {
      const list = [...endpoints];
      if (!loadPe)   loadPe   = list[0] ?? null;
      if (!unloadPe) unloadPe = list[1] ?? list[0] ?? null;
    }
    return { route: r, loadPe, unloadPe };
  },

  buildGraticuleProvider(graticuleSteps) {
    const cache = new Map();
    return {
      stepFor(scale, initialScale) {
        const zoomRatio = scale / initialScale;
        for (const entry of graticuleSteps) {
          if (zoomRatio < entry.maxZoomRatio) return entry.step;
        }
        return graticuleSteps[graticuleSteps.length - 1].step;
      },
      getGraticule(step) {
        let g = cache.get(step);
        if (!g) { g = d3.geoGraticule().step([step, step])(); cache.set(step, g); }
        return g;
      },
    };
  },

  routeMidpoint(r) {
    const pts = r && r.screenPts;
    const runs = r && r.screenRuns;
    if (!pts || !runs || runs.length === 0) return null;
    let total = 0;
    for (const [rs, re] of runs) {
      const s = rs * 2, e = re * 2;
      for (let i = s; i < e - 2; i += 2) {
        const dx = pts[i + 2] - pts[i];
        const dy = pts[i + 3] - pts[i + 1];
        total += Math.hypot(dx, dy);
      }
    }
    if (total <= 0) {
      const [rs, re] = runs[0];
      const s = rs * 2, e = re * 2;
      if (e - s >= 2) return { x: pts[s], y: pts[s + 1] };
      return null;
    }
    let remaining = total / 2;
    for (const [rs, re] of runs) {
      const s = rs * 2, e = re * 2;
      for (let i = s; i < e - 2; i += 2) {
        const ax = pts[i],     ay = pts[i + 1];
        const bx = pts[i + 2], by = pts[i + 3];
        const dx = bx - ax, dy = by - ay;
        const len = Math.hypot(dx, dy);
        if (len <= 0) continue;
        if (remaining <= len) {
          const t = remaining / len;
          return { x: ax + dx * t, y: ay + dy * t };
        }
        remaining -= len;
      }
    }
    const [rs, re] = runs[runs.length - 1];
    const e = re * 2;
    return { x: pts[e - 2], y: pts[e - 1] };
  },

  formatPortTT(portEntry, routes, hiddenTypes) {
    const frag = document.createDocumentFragment();

    const nameRaw = portEntry && portEntry.name != null
      ? String(portEntry.name).trim() : "";
    if (nameRaw) {
      const nameLine = document.createElement("div");
      nameLine.textContent = nameRaw.charAt(0).toUpperCase() + nameRaw.slice(1);
      nameLine.style.fontWeight = "600";
      frag.appendChild(nameLine);
    }

    if (Array.isArray(routes) && routes.length > 0 && portEntry) {
      const [plon, plat] = portEntry.lonlat;
      const eps = 1e-3;
      const buckets = new Map();
      for (const r of routes) {
        if (!r) continue;
        const ct = r.cargo_type;
        if (!ct) continue;
        let b = buckets.get(ct);
        if (!b) {
          b = { color: r.color || null, inCount: 0, outCount: 0 };
          buckets.set(ct, b);
        }
        if (!b.color && r.color) b.color = r.color;
        const isUnload =
          Math.abs((+r.unload_lon) - plon) < eps &&
          Math.abs((+r.unload_lat) - plat) < eps;
        const isLoad =
          Math.abs((+r.load_lon)   - plon) < eps &&
          Math.abs((+r.load_lat)   - plat) < eps;
        if (isUnload) b.inCount++;
        if (isLoad)   b.outCount++;
      }
      if (buckets.size > 0) {
        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "auto auto auto auto";
        grid.style.columnGap = "6px";
        grid.style.rowGap = "2px";
        grid.style.alignItems = "center";
        grid.style.marginTop = "4px";

        const stateCode = portEntry && portEntry.stateCode
          ? String(portEntry.stateCode).toUpperCase() : "";
        const sortedTypes = Array.from(buckets.keys()).sort((a, b) =>
          String(a).toLowerCase().localeCompare(String(b).toLowerCase())
        );
        for (const ct of sortedTypes) {
          const { color, inCount, outCount } = buckets.get(ct);
          const isHidden = !!(hiddenTypes && hiddenTypes.has(ct));
          const rowOp = isHidden ? "0.35" : "";

          const cell1 = document.createElement("div");
          cell1.style.display = "flex";
          cell1.style.alignItems = "center";
          cell1.style.gap = "5px";
          cell1.style.whiteSpace = "nowrap";
          if (rowOp) cell1.style.opacity = rowOp;
          const dot = document.createElement("span");
          dot.style.display = "inline-block";
          dot.style.flex = "0 0 auto";
          dot.style.width = "8px";
          dot.style.height = "8px";
          dot.style.borderRadius = "50%";
          dot.style.background = color || "#888";
          cell1.appendChild(dot);
          const label = document.createElement("span");
          const ctStr = String(ct);
          label.textContent = ctStr.charAt(0).toUpperCase() + ctStr.slice(1) + ":";
          label.style.whiteSpace = "normal";
          label.style.overflowWrap = "break-word";
          label.style.maxWidth = "8.5em";
          cell1.appendChild(label);
          grid.appendChild(cell1);

          const cell2 = document.createElement("div");
          cell2.style.textAlign = "right";
          cell2.style.whiteSpace = "nowrap";
          if (rowOp) cell2.style.opacity = rowOp;
          if (inCount > 0) {
            cell2.appendChild(document.createTextNode(inCount + " "));
            cell2.appendChild(this.arrowSym(false));
          }
          grid.appendChild(cell2);

          const cell3 = document.createElement("div");
          cell3.style.textAlign = "center";
          cell3.style.whiteSpace = "nowrap";
          if (rowOp) cell3.style.opacity = rowOp;
          cell3.textContent = stateCode;
          grid.appendChild(cell3);

          const cell4 = document.createElement("div");
          cell4.style.textAlign = "left";
          cell4.style.whiteSpace = "nowrap";
          if (rowOp) cell4.style.opacity = rowOp;
          if (outCount > 0) {
            cell4.appendChild(this.arrowSym(false));
            cell4.appendChild(document.createTextNode(" " + outCount));
          }
          grid.appendChild(cell4);
        }
        frag.appendChild(grid);
      }
    }
    return frag.childNodes.length > 0 ? frag : null;
  },

  diagCheck(posInW, dirIn, posOutW, dirOut, centerW, jr, maxBackIn, maxFwdOut) {
    if (jr <= 0) return { reason: "jr-zero" };
    const ux = posInW.x - centerW.x, uy = posInW.y - centerW.y;
    const vx = posOutW.x - centerW.x, vy = posOutW.y - centerW.y;
    const uLen = Math.hypot(ux, uy);
    const vLen = Math.hypot(vx, vy);
    const tIn = jr, sOut = jr;
    const capIn  = isFinite(maxBackIn) ? maxBackIn : Infinity;
    const capOut = isFinite(maxFwdOut) ? maxFwdOut : Infinity;
    if (tIn  > capIn  + 1e-6) return { reason: "back-cap-exceeded", uLen, vLen, tIn, sOut, capIn, capOut };
    if (sOut > capOut + 1e-6) return { reason: "fwd-cap-exceeded",  uLen, vLen, tIn, sOut, capIn, capOut };
    const cosBeta = dirIn.x * dirOut.x + dirIn.y * dirOut.y;
    const beta = Math.acos(Math.max(-1, Math.min(1, cosBeta)));
    if (beta < 1e-3)            return { reason: "angle-zero", uLen, vLen, tIn, sOut, beta, capIn, capOut };
    if (beta > Math.PI - 1e-3)  return { reason: "angle-180",  uLen, vLen, tIn, sOut, beta, capIn, capOut };
    return { reason: null, uLen, vLen, tIn, sOut, beta, capIn, capOut };
  },

  orderRoutesByCargo(routeEntries, cargoTypeByEntry, routesNode) {
    const NO_CARGO = "\u0000";
    const cat = (re) => {
      const c = cargoTypeByEntry.get(re);
      return c != null ? c : NO_CARGO;
    };
    const counts = new Map();
    for (const re of routeEntries) {
      const k = cat(re);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const ordered = [...routeEntries].sort((a, b) => {
      const ka = cat(a), kb = cat(b);
      const ca = counts.get(ka), cb = counts.get(kb);
      if (cb !== ca) return cb - ca;
      if (ka !== kb) return ka < kb ? -1 : 1;
      return a.routeIndex - b.routeIndex;
    });
    for (const re of ordered) routesNode.appendChild(re.path);
  },

  makeHoverArrows(routesNode) {
    const NS = "http://www.w3.org/2000/svg";
    function mk() {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("fill", "none");
      p.setAttribute("stroke-linecap",  "round");
      p.setAttribute("stroke-linejoin", "round");
      p.setAttribute("display", "none");
      p.setAttribute("pointer-events", "none");
      routesNode.appendChild(p);
      return p;
    }
    return { start: mk(), end: mk() };
  },

  makePortHoverArrows(routesNode) {
    return { pool: [], routesNode };
  },

  updatePortHoverArrows(state, items, opts) {
    const NS = "http://www.w3.org/2000/svg";
    const { pool, routesNode } = state;
    const list = (items && items.length) ? items : [];

    while (pool.length < list.length) {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("fill", "none");
      p.setAttribute("stroke-linecap",  "round");
      p.setAttribute("stroke-linejoin", "round");
      p.setAttribute("display", "none");
      p.setAttribute("pointer-events", "none");
      routesNode.appendChild(p);
      pool.push(p);
    }
    const defaultColor = opts && opts.defaultColor;
    for (let i = 0; i < list.length; i++) {
      const { routeEntry, fromStart, portRadius } = list[i];
      const color = (routeEntry && routeEntry.color) || defaultColor;
      this.renderRouteArrow(pool[i], routeEntry, fromStart, routesNode, {
        color,
        strokeWidth: opts.strokeWidth,
        inset:     opts.inset,
        armLen:    opts.armLen,
        halfAngle: opts.halfAngle,
        portRadius: portRadius ?? 0,
      });
    }

    for (let i = list.length; i < pool.length; i++) {
      pool[i].setAttribute("display", "none");
    }
  },

  renderRouteArrow(el, route, fromStart, routesNode, opts) {
    if (!el) return;
    if (!route || !route.screenPts || !route.screenRuns) {
      el.setAttribute("display", "none");
      return;
    }
    const portRadius = opts.portRadius ?? 0;
    const inset    = (opts.inset ?? 22) + portRadius;
    const armLen   = opts.armLen   ?? 12;
    const halfAng  = opts.halfAngle ?? (Math.PI / 6);
    const color    = opts.color;
    const sw       = String(opts.strokeWidth);

    function walk(pts, runs, fs, dist) {
      if (!runs || runs.length === 0 || dist <= 0) return null;
      const [runS, runE] = fs ? runs[0] : runs[runs.length - 1];
      const s = runS * 2, e = runE * 2;
      if (e - s < 4) return null;
      let remaining = dist;
      if (fs) {
        for (let i = s; i < e - 2; i += 2) {
          const ax = pts[i],     ay = pts[i + 1];
          const bx = pts[i + 2], by = pts[i + 3];
          const dx = bx - ax, dy = by - ay;
          const len = Math.hypot(dx, dy);
          if (len <= 0) continue;
          if (remaining <= len) {
            const t = remaining / len;
            return { x: ax + dx * t, y: ay + dy * t, dx: dx / len, dy: dy / len };
          }
          remaining -= len;
        }
      } else {
        for (let i = e - 4; i >= s; i -= 2) {
          const ax = pts[i],     ay = pts[i + 1];
          const bx = pts[i + 2], by = pts[i + 3];
          const dx = bx - ax, dy = by - ay;
          const len = Math.hypot(dx, dy);
          if (len <= 0) continue;
          if (remaining <= len) {
            const t = remaining / len;
            return { x: bx - dx * t, y: by - dy * t, dx: dx / len, dy: dy / len };
          }
          remaining -= len;
        }
      }
      return null;
    }
    const BACK_FRAC = 2 / 3;
    const tip = walk(route.screenPts, route.screenRuns, fromStart, inset);
    if (!tip) { el.setAttribute("display", "none"); return; }
    const backDist = fromStart
      ? (inset - BACK_FRAC * armLen)
      : (inset + BACK_FRAC * armLen);
    const back = walk(route.screenPts, route.screenRuns, fromStart, backDist);
    let dx = tip.dx, dy = tip.dy;
    if (back) {
      const cx = tip.x - back.x;
      const cy = tip.y - back.y;
      const m = Math.hypot(cx, cy);
      if (m > 1e-6) { dx = cx / m; dy = cy / m; }
    }

    const c = Math.cos(halfAng), si = Math.sin(halfAng);
    const a1x = (-dx * c + dy * si) * armLen;
    const a1y = (-dx * si - dy * c) * armLen;
    const a2x = (-dx * c - dy * si) * armLen;
    const a2y = ( dx * si - dy * c) * armLen;
    const d =
      `M ${(tip.x + a1x).toFixed(2)} ${(tip.y + a1y).toFixed(2)} ` +
      `L ${tip.x.toFixed(2)} ${tip.y.toFixed(2)} ` +
      `L ${(tip.x + a2x).toFixed(2)} ${(tip.y + a2y).toFixed(2)}`;
    el.setAttribute("d", d);
    el.setAttribute("stroke", color);
    el.setAttribute("stroke-width", sw);
    el.removeAttribute("display");
    if (routesNode) routesNode.appendChild(el);
  },

  updateHoverArrows(arrows, route, routesNode, opts) {
    const a = arrows;
    if (!route) {
      a.start.setAttribute("display", "none");
      a.end  .setAttribute("display", "none");
      return;
    }
    this.renderRouteArrow(a.start, route, true,  routesNode,
      { ...opts, portRadius: opts.startRadius ?? 0 });
    this.renderRouteArrow(a.end,   route, false, routesNode,
      { ...opts, portRadius: opts.endRadius ?? 0 });
  },

  buildJunctionDump(clickedNode, ctx) {
    const {
      network, classified, orderings,
      mercator, mesh,
      pipelineRoutes, routeChains,
      filteredSetByRouteIdx, diagByRouteIdx,
      desiredJrById, wpById,
      clusterCanonicalBySnapId, clusterByCanonicalId,
      config,
    } = ctx;
    const edgeKey2 = (a, b) => a < b ? a + "||" + b : b + "||" + a;
    function areaFaceCountAt(pointId) {
      let n = 0;
      for (const f of mesh.faces) {
        if (!f.isArea) continue;
        if (f.ring.indexOf(pointId) !== -1) n++;
      }
      return n;
    }
    function nodeShape(node) {
      if (!node) return null;
      if (node.kind === "snap") return "snap";
      if (node.kind === "vertex") return areaFaceCountAt(node.id) === 1 ? "coastline" : "multiway";
      return "multiway";
    }
    function edgeGroupInfo(eA, eB) {
      const ek = edgeKey2(eA, eB);
      const e = network.edges.get(ek);
      if (!e) return null;
      const gk = e.groupKey || null;
      const grp = gk && network.linkGroups ? network.linkGroups.get(gk) : null;
      const ord = gk ? orderings.get(gk) : null;
      return {
        edgeKey: ek, spokeType: e.spokeType, groupKey: gk,
        areaSide: grp ? grp.areaSide : null,
        isEdgeGroup: grp ? grp.isEdgeGroup : null,
        bundlePerpX: e.bundlePerpX, bundlePerpY: e.bundlePerpY,
        routeIdxsOnEdge: e.routeIdxs ? e.routeIdxs.slice() : [],
        routeUnion: grp ? grp.routeUnion.slice() : null,
        optimizedOrdering: ord ? ord.slice() : null,
        bundleOffsetByRoute: e.bundleOffsetByRoute ? [...e.bundleOffsetByRoute.entries()] : [],
      };
    }

    const clickedTrav = classified.pathTraversals;
    const clusterCanId = clusterCanonicalBySnapId.get(clickedNode.id);
    const clusterMembers = clusterCanId
      ? clusterByCanonicalId.get(clusterCanId).ids
      : new Set([clickedNode.id]);
    const touching = [];
    for (const p of network.paths) {
      let hit = false;
      for (const wp of p.waypoints) {
        if (clusterMembers.has(wp.id)) { hit = true; break; }
      }
      if (hit) touching.push(p);
    }

    const routesOut = touching.map(p => {
      const wps = p.waypoints;
      const trav = clickedTrav.find(t => t.routeIdx === p.routeIdx);
      const filteredSet = filteredSetByRouteIdx.get(p.routeIdx) || new Set();
      const orig = pipelineRoutes.find(pr => pr.id === p.routeId);
      const routeDiag = diagByRouteIdx.get(p.routeIdx) || new Map();
      const rc = routeChains.find(r => r.routeIdx === p.routeIdx);
      const rawIdxToChainCi = new Map();
      if (rc) {
        for (let ci = 0; ci < rc.chainOrigIdxs.length; ci++) {
          for (const oi of rc.chainOrigIdxs[ci]) rawIdxToChainCi.set(oi, ci);
        }
      }
      const wpRows = wps.map((wp, i) => {
        const prev = i > 0 ? wps[i - 1] : null;
        const next = i < wps.length - 1 ? wps[i + 1] : null;
        const eIn  = prev ? network.edges.get(edgeKey2(prev.id, wp.id)) : null;
        const eOut = next ? network.edges.get(edgeKey2(wp.id, next.id)) : null;
        const ll = mercator.inverse([wp.x, wp.y]);
        const tinfo = trav && trav.waypoints[i] ? trav.waypoints[i] : null;
        const ci = rawIdxToChainCi.get(i);
        const cornerDiag = ci != null ? routeDiag.get(ci) : null;
        return {
          i, id: wp.id, kind: classified.nodes.find(n => n.id === wp.id)?.kind ?? null,
          mx: +wp.x.toFixed(2), my: +wp.y.toFixed(2),
          lon: ll ? +ll[0].toFixed(4) : null, lat: ll ? +ll[1].toFixed(4) : null,
          onLinkId: wp.onLinkId ?? null,
          inSpokeType:  tinfo ? tinfo.inSpokeType  : null,
          outSpokeType: tinfo ? tinfo.outSpokeType : null,
          pairKey:      tinfo ? tinfo.pairKey      : null,
          bundleOffsetIn:  eIn  && eIn.bundleOffsetByRoute  ? (eIn.bundleOffsetByRoute.get(p.routeIdx)  ?? null) : null,
          bundleOffsetOut: eOut && eOut.bundleOffsetByRoute ? (eOut.bundleOffsetByRoute.get(p.routeIdx) ?? null) : null,
          bundlePerpIn:  eIn  ? [+eIn.bundlePerpX.toFixed(3),  +eIn.bundlePerpY.toFixed(3)]  : null,
          bundlePerpOut: eOut ? [+eOut.bundlePerpX.toFixed(3), +eOut.bundlePerpY.toFixed(3)] : null,
          groupKeyIn:  eIn  ? eIn.groupKey  : null,
          groupKeyOut: eOut ? eOut.groupKey : null,
          areaSideIn:  eIn  && eIn.groupKey  && network.linkGroups ? (network.linkGroups.get(eIn.groupKey)?.areaSide  ?? null) : null,
          areaSideOut: eOut && eOut.groupKey && network.linkGroups ? (network.linkGroups.get(eOut.groupKey)?.areaSide ?? null) : null,
          isFiltered: !filteredSet.has(i),
          isClickedJunction: clusterMembers.has(wp.id),
          corner: cornerDiag || null,
        };
      });
      return {
        routeIdx: p.routeIdx, routeId: p.routeId, color: orig ? orig.color : null,
        from: orig ? [+orig.start.x.toFixed(2), +orig.start.y.toFixed(2)] : null,
        to:   orig ? [+orig.end.x.toFixed(2),   +orig.end.y.toFixed(2)]   : null,
        waypoints: wpRows,
      };
    });

    const cornerSummary = { ok: 0, rejected: 0, skipped: 0, byReason: {}, routes: [] };
    for (const rOut of routesOut) {
      const wpRow = rOut.waypoints.find(w => w.isClickedJunction);
      const cd = wpRow ? wpRow.corner : null;
      const status = cd ? cd.status : "no-data";
      if (status === "ok")            cornerSummary.ok++;
      else if (status === "rejected") cornerSummary.rejected++;
      else                            cornerSummary.skipped++;
      const reasonKey = cd ? (cd.reason ?? "ok") : "no-data";
      cornerSummary.byReason[reasonKey] = (cornerSummary.byReason[reasonKey] || 0) + 1;
      cornerSummary.routes.push({
        routeIdx: rOut.routeIdx, color: rOut.color,
        status, reason: cd ? cd.reason : null,
        jr:              cd ? cd.jr              : null,
        junctionJr:      cd ? cd.junctionJr      : null,
        strandJrDesired: cd ? cd.strandJrDesired : null,
        uLen:   cd ? cd.uLen   : null,
        vLen:   cd ? cd.vLen   : null,
        tIn:    cd ? cd.tIn    : null,
        sOut:   cd ? cd.sOut   : null,
        beta:   cd ? cd.beta   : null,
        capIn:  cd ? cd.capIn  : null,
        capOut: cd ? cd.capOut : null,
      });
    }

    const incidentGroups = [];
    const seenGroupKeys = new Set();
    for (const sp of clickedNode.spokes) {
      const gi = edgeGroupInfo(clickedNode.id, sp.farKey);
      if (gi && gi.groupKey && !seenGroupKeys.has(gi.groupKey)) {
        seenGroupKeys.add(gi.groupKey);
        incidentGroups.push({
          farKey: sp.farKey,
          angleDeg: +(sp.angle * 180 / Math.PI).toFixed(1),
          ...gi,
        });
      }
    }
    const ll = mercator.inverse([clickedNode.x, clickedNode.y]);
    const wKey = clusterCanId ?? clickedNode.id;
    return {
      clicked: {
        id: clickedNode.id,
        clusterCanonicalId: clusterCanId ?? null,
        clusterMembers: clusterCanId ? [...clusterMembers] : null,
        kind: clickedNode.kind, classification: clickedNode.classification,
        shape: nodeShape(clickedNode),
        areaFaceCount: clickedNode.kind === "vertex" ? areaFaceCountAt(clickedNode.id) : 0,
        mx: +clickedNode.x.toFixed(2), my: +clickedNode.y.toFixed(2),
        lon: ll ? +ll[0].toFixed(4) : null, lat: ll ? +ll[1].toFixed(4) : null,
        jrDesired: desiredJrById.get(wKey) ?? 0,
        maxStrandDist: wpById.get(wKey)?.maxDist ?? 0,
        cornerSummary,
        spokes: clickedNode.spokes.map(s => ({
          farKey: s.farKey, spokeType: s.spokeType,
          angleDeg: +(s.angle * 180 / Math.PI).toFixed(1),
          routeIdxs: s.routeIdxs.slice(),
        })),
        incidentGroups,
      },
      routes: routesOut,
      config,
    };
  },
  buildRouteD(r, projection, mercator) {
    const norm = (dx, dy) => {
      const L = Math.hypot(dx, dy);
      return L > 1e-9 ? [dx / L, dy / L] : [0, 0];
    };

    // -------- primary: render pieces as beziers --------
    if (r.pieces && mercator) {
      const HF = 1 / 3;   // link handle length, as a fraction of the chord
      const EPS = 1e-3;   // arc-tangent probe distance (fraction of the link)
      const SAMP = 6;     // hit-test samples emitted per cubic

      const pm = (mx, my) => {
        const ll = mercator.inverse([mx, my]);
        return ll ? projection(ll) : null;
      };

      const parts = [];
      const screenPts = [];
      const runs = [];
      let inRun = false, runStart = 0;
      const openRun = () => { if (!inRun) { runStart = screenPts.length / 2; inRun = true; } };
      const closeRun = () => { if (inRun) { runs.push([runStart, screenPts.length / 2]); inRun = false; } };
      const addPt = (x, y) => { openRun(); screenPts.push(x, y); };

      let started = false, penX = 0, penY = 0;

      for (let i = 0; i < r.pieces.length; i++) {
        const pc = r.pieces[i];
        let s, c1, c2, e;

        if (pc.kind === "line") {
          s = pm(pc.x1, pc.y1);
          e = pm(pc.x2, pc.y2);
          if (!s || !e) { closeRun(); started = false; continue; }
          const dx = pc.x2 - pc.x1, dy = pc.y2 - pc.y1;
          const sll = mercator.inverse([pc.x1 + dx * EPS,        pc.y1 + dy * EPS]);
          const ell = mercator.inverse([pc.x1 + dx * (1 - EPS),  pc.y1 + dy * (1 - EPS)]);
          const pS = sll && projection(sll);
          const pE = ell && projection(ell);
          const tS = pS ? norm(pS[0] - s[0], pS[1] - s[1]) : norm(e[0] - s[0], e[1] - s[1]);
          const tE = pE ? norm(e[0] - pE[0], e[1] - pE[1]) : norm(e[0] - s[0], e[1] - s[1]);
          const L = Math.hypot(e[0] - s[0], e[1] - s[1]) * HF;
          c1 = [s[0] + tS[0] * L, s[1] + tS[1] * L];
          c2 = [e[0] - tE[0] * L, e[1] - tE[1] * L];
        } else if (pc.kind === "curve") {
          s  = pm(pc.x1,  pc.y1);
          c1 = pm(pc.c1x, pc.c1y);
          c2 = pm(pc.c2x, pc.c2y);
          e  = pm(pc.x2,  pc.y2);
          if (!s || !c1 || !c2 || !e) { closeRun(); started = false; continue; }
        } else {
          continue;
        }

        // Pieces are continuous, so this only fires at the first piece or after
        // the path has dipped behind the globe.
        if (!started || Math.hypot(penX - s[0], penY - s[1]) > 0.5) {
          closeRun();
          parts.push("M", s[0].toFixed(2), s[1].toFixed(2));
          addPt(s[0], s[1]);
          started = true;
        }

        parts.push(
          "C",
          c1[0].toFixed(2), c1[1].toFixed(2),
          c2[0].toFixed(2), c2[1].toFixed(2),
          e[0].toFixed(2),  e[1].toFixed(2),
        );

        for (let k = 1; k <= SAMP; k++) {
          const t = k / SAMP;
          const pt = this.evalCubic(s[0], s[1], c1[0], c1[1], c2[0], c2[1], e[0], e[1], t);
          addPt(pt.x, pt.y);
        }

        penX = e[0]; penY = e[1];
      }

      closeRun();
      r.screenPts = screenPts;
      r.screenRuns = runs;
      return parts.length ? parts.join(" ") : "";
    }

    // -------- fallback: dense mercator polyline (previous behaviour) --------
    if (r.merc && mercator) {
      const arr = r.merc;
      const n = arr.length / 2;
      const parts = [];
      const screenPts = [];
      const runs = [];
      let inRun = false, runStart = 0, pen = false;
      for (let i = 0; i < n; i++) {
        const ll = mercator.inverse([arr[i * 2], arr[i * 2 + 1]]);
        const p = ll ? projection(ll) : null;
        if (!p) {
          if (inRun) { runs.push([runStart, screenPts.length / 2]); inRun = false; }
          pen = false;
          continue;
        }
        if (!inRun) { runStart = screenPts.length / 2; inRun = true; }
        screenPts.push(p[0], p[1]);
        parts.push(pen ? "L" : "M", p[0].toFixed(2), p[1].toFixed(2));
        pen = true;
      }
      if (inRun) runs.push([runStart, screenPts.length / 2]);
      r.screenPts = screenPts;
      r.screenRuns = runs;
      return parts.length ? parts.join(" ") : "";
    }

    r.screenPts = [];
    r.screenRuns = [];
    return "";
  }

}
)}

function _configGlobe(){return(
{
  // ---- Geometry ----
  height:     800,
  globeInset: 4,

  // ---- Route styling ----
  routeWidth:        1.35,
  routeSpacing:      2.5,
  endpointRadius:    3.5,
  defaultRouteColor: "#ffffff",
  zoomSpacingFactor: .3,

  // ---- Port styling ----
  portRadius:        3,
  portFill:          "#ffffff",
  portStroke:        "#000000",
  portStrokeWidth:   0.75,

  junctionRadius:             50,
  junctionRadiusMargin:       8,
  junctionMinLineFrac:        0.05,
  junctionEndpointFreeFrac:   0.05,

  // ---- Junction markers ----
  showJunctionMarkers:        false,

  // ---- Snap clustering ----
  clusterMergeDistance:       8,

  // ---- Route sampling (setup-time, Mercator-space) ----
  setupCurveSamples:          16,
  selfIntersectMergeWindow:   64,

  // ---- Map colors / strokes / graticule ----
  oceanColor:          "#b7ced4",
  landColor:           "#eceae4",
  usBorderColor:       "rgba(68,68,68,0.25)",
  graticuleOceanColor: "rgba(0,0,0,0.08)",
  graticuleLandColor:  "rgba(0,0,0,0.05)",

  // ---- State fill (for states referenced by dataPorts) ----
  stateFillColor:      "white",
  stateFillOpacity:    0.3,
  stateHoverOpacity:   0.8,

  // ---- Hover highlight ----
  hoverPortRadius:           10,
  hoverRouteRadius:          5,
  hoverPortFill:             "yellow",
  hoverPortStrokeWidth:      3,
  hoverRouteStrokeMultiplier: 1.5,
  hoverStateStroke:          "rgba(68,68,68,1)",
  hoverStateStrokeWidth:     0.5,
  hoverStateLabelFontSize:   14,
  hoverStateLabelFontWeight: "bold",

  // ---- Route tooltip ----
  tooltipBackground:         "#ffffff",
  tooltipColor:              "#000000",
  tooltipFontSize:           12,
  tooltipPadding:            "6px 8px",
  tooltipBorderRadius:       4,
  tooltipOffsetX:            12,
  tooltipOffsetY:            15,
  tooltipMaxWidth:           220,

  // ---- Hover fade (non-highlighted routes dim while hovering persists) ----
  hoverFadeRiseRate:         1,
  hoverFadeFallRate:         0.5,
  hoverFadeOpacity:          0.15,

  graticuleLineWidth: 0.5,
  usBorderLineWidth:  0.5,
  riversLineWidth:    1.2,

  graticuleSteps: [
    { maxZoomRatio: 1.5,      step: 30 },
    { maxZoomRatio: 3,        step: 15 },
    { maxZoomRatio: 6,        step: 10 },
    { maxZoomRatio: 12,       step:  5 },
    { maxZoomRatio: 25,       step:  2 },
    { maxZoomRatio: Infinity, step:  1 },
  ],

  // ---- DPR / interaction ----
  fullDpr:               null,
  dragDpr:               1,
  dragRotationSpeed:     75,
  wheelZoomSensitivity:  0.001,
  zoomEndDebounceMs:     120,
}
)}

function _83(md){return(
md`## Panels`
)}

function _dashboardHelpers()
{
  // Stable, content-derived key for a route. Cells use this to identify
  // the same logical voyage even when they receive different object
  // references (e.g. routes vs dataRoute may not share identity).
  const routeKey = (v) => {
    if (!v) return null;
    return [
      v.name ?? "",
      v.load_date ?? "",
      v.unload_date ?? "",
      v.load_port ?? "",
      v.unload_port ?? "",
    ].join("|");
  };

  // Inject shared tag styles once. Re-running this cell replaces the
  // style block to pick up edits.
  const STYLE_ID = "dashboard-tag-styles";
  document.getElementById(STYLE_ID)?.remove();
  const styleEl = document.createElement("style");
  styleEl.id = STYLE_ID;
  styleEl.textContent = `
    .tag-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 4px 4px 10px;
      border: 1px solid #888;
      border-radius: 999px;
      background: #fff;
      font: 12px/1.4 "Inter", sans-serif;
      color: #444;
      cursor: default;
    }
    .tag-pill__label { white-space: nowrap; }
    .tag-pill__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      padding: 0;
      border: none;
      background: transparent;
      color: #666;
      cursor: pointer;
      line-height: 0;
    }
    .tag-pill__close:hover { color: #222; }
    .tag-pill__close svg { width: 9px; height: 9px; display: block; }
    .tag-pill--clickable { cursor: pointer; }
    .tag-pill--clickable:hover { background: #fafafa; }
  `;
  document.head.appendChild(styleEl);

  // Build a tag element. Options:
  //   label    — string shown inside the pill
  //   onClose  — if provided, an X button is rendered; called on click
  //   onClick  — if provided, the whole pill is clickable
  const tag = ({ label, onClose, onClick } = {}) => {
    const el = document.createElement("span");
    el.className = "tag-pill";
    if (onClick) el.classList.add("tag-pill--clickable");

    const labelEl = document.createElement("span");
    labelEl.className = "tag-pill__label";
    labelEl.textContent = label ?? "";
    el.appendChild(labelEl);

    if (onClose) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag-pill__close";
      btn.setAttribute("aria-label", "Remove filter");
      btn.innerHTML = `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M 1 1 L 9 9 M 9 1 L 1 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
      </svg>`;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        onClose();
      });
      el.appendChild(btn);
    }

    if (onClick) el.addEventListener("click", onClick);

    return el;
  };

  return { routeKey, tag };
}


function _85(md){return(
md`Select show cells in notebook if you want to move them from the dashboard at the top to here`
)}

function _attachCell(html)
{
  const form = html`<form style="font-family: system-ui, -apple-system, sans-serif; font-size: 14px; padding: 6px 0;">
    <label style="margin-right: 16px;">
      <input type="radio" name="attach" value="true" checked> Attach to dashboard
    </label>
    <label>
      <input type="radio" name="attach" value="false" > Show cells in notebook
    </label>
  </form>`;
  const update = () => {
    form.value = form.elements.attach.value === "true";
    form.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  };
  form.addEventListener("change", update);
  update();
  return form;
}


function _stats(attachCell,configGlobe,dataRoute,d3,IntersectionObserver,invalidation)
{
  attachCell;
  const modern = false; // true = new segment design, false = original
  const speed = 20;
  const tailCount = 30;
  const DIGIT_PX = 60;

  const PANEL_BG = `color-mix(in srgb, ${configGlobe.oceanColor} 80%, #ffffff)`;
  const SEG_GRADIENT_TOP = "#655394";
  const SEG_GRADIENT_BOTTOM = "#5346b7";
  const SEG_OFF_COLOR = "#506d54";
  const SEG_OFF_OPACITY = 0.07;
  const SHADOW_COLOR = "#0a1a4f"; // dark blue
  const SHADOW_OPACITY = 0.2;
  const SHADOW_DX_PX = 1;
  const SHADOW_DY_PX = 7;
  const SHADOW_BLUR_PX = 5;
  const jonesActSuspended = new Date(2026, 2, 18);
  const msPerDay = 86400000;
  const daysSinceJonesAct = Math.max(
    0,
    Math.floor((Date.now() - jonesActSuspended.getTime()) / msPerDay)
  );

  // reported_submit may arrive as a Date (older rows) or as a raw string in
  // either "M/D/YYYY" or "M/D/YY" form (newer rows). Parse both, mapping
  // 2-digit years to 2000+ and tolerating stray surrounding whitespace.
  const parseSubmit = (raw) => {
    if (raw instanceof Date) return isNaN(raw) ? null : raw;
    if (raw == null) return null;
    const m = String(raw).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
    if (!m) return null;
    const year = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    const dt = new Date(year, +m[1] - 1, +m[2]);
    return isNaN(dt) ? null : dt;
  };

  let latestSubmit = null;
  for (const v of dataRoute) {
    const d = parseSubmit(v && v.reported_submit);
    if (d && (!latestSubmit || d > latestSubmit)) latestSubmit = d;
  }
  const asOfDate = latestSubmit
    ? d3.timeFormat("%b %-d, %Y")(latestSubmit)
    : "";

  const totalVoyages = dataRoute.length;

  // Some voyages list multiple vessels in one `name` field, separated by
  // either " / " (a slash padded with whitespace) or a line break. Each vessel
  // name itself contains a slash ("M/V ..."), so we only split on slashes that
  // are surrounded by whitespace — never on the slash inside "M/V".
  const splitVessels = (raw) =>
    String(raw == null ? "" : raw)
      .split(/\s+\/\s+|[\r\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const vesselSet = new Set();
  for (const v of dataRoute) {
    if (!v || !v.name) continue;
    for (const name of splitVessels(v.name)) vesselSet.add(name);
  }
  const uniqueVessels = vesselSet.size;

  const cargoSet = new Set();
  for (const v of dataRoute) {
    const c = v && v.cargo_type ? String(v.cargo_type).trim() : "";
    if (c) cargoSet.add(c);
  }
  const uniqueCargoTypes = cargoSet.size;

  const WEST = -115, EAST = -100;
  const isWest = (lon) => lon != null && lon <= WEST;
  const isEast = (lon) => lon != null && lon >= EAST;
  let panamaCount = 0;
  for (const v of dataRoute) {
    if (!v) continue;
    const a = v.load_lon, b = v.unload_lon;
    if ((isWest(a) && isEast(b)) || (isEast(a) && isWest(b))) panamaCount++;
  }

  // Sum the barrels across every voyage, then express the total with the
  // largest magnitude word (thousand/million/billion/trillion) that keeps the
  // displayed number to at most three digits. e.g. 12,600,000 -> "13" + "Million".
  let totalBarrels = 0;
  for (const v of dataRoute) {
    const b = v ? Number(v.barrels) : NaN;
    if (Number.isFinite(b)) totalBarrels += b;
  }

  const BARREL_MAGNITUDES = [
    { value: 1e12, word: "Trillion" },
    { value: 1e9, word: "Billion" },
    { value: 1e6, word: "Million" },
    { value: 1e3, word: "Thousand" }
  ];

  // Pick the largest magnitude that the total reaches; default to "Thousand".
  let barrelTier = BARREL_MAGNITUDES.length - 1;
  for (let i = 0; i < BARREL_MAGNITUDES.length; i++) {
    if (totalBarrels >= BARREL_MAGNITUDES[i].value) {
      barrelTier = i;
      break;
    }
  }
  let barrelDisplay = Math.round(totalBarrels / BARREL_MAGNITUDES[barrelTier].value);
  // Guard against rounding up into a 4th digit (e.g. 999.7M -> 1000); promote a tier.
  if (barrelDisplay >= 1000 && barrelTier > 0) {
    barrelTier -= 1;
    barrelDisplay = Math.round(totalBarrels / BARREL_MAGNITUDES[barrelTier].value);
  }
  const barrelWord = BARREL_MAGNITUDES[barrelTier].word;
  const barrelExact = Math.round(totalBarrels).toLocaleString("en-US");

  const items = [
    { value: String(totalVoyages), label: "Total voyages", bold: "voyages", date: asOfDate },
    { value: String(uniqueVessels), label: "Unique vessels", bold: "vessels" },
    { value: String(panamaCount), label: "Via the Panama Canal", bold: "Panama Canal" },
    { value: String(daysSinceJonesAct), label: "Days since the Jones Act was suspended", bold: "Days" },
    { value: String(uniqueCargoTypes), label: "Cargo categories", bold: "Cargo" },
    { value: String(barrelDisplay), label: `${barrelWord} barrels shipped (${barrelExact})`, bold: `${barrelWord} barrels` }
  ];

  const DW = 60, DH = 100;
  const SEG_PATH_MODERN = {
    a: "M46.76,2.97l-4.23,17.28c-1.53-2.66-4.48-4.47-7.86-4.47h-9.35c-4.68,0-8.53,3.47-8.94,7.88L.42,20.01C2.58,8.65,12.93,0,25.33,0h9.35c4.37,0,8.49,1.07,12.09,2.97Z",
    b: "M60,24.44v9.02c0,5.72-2.05,10.99-5.47,15.16-2.97-3.06-6.7-5.44-10.9-6.86v-18.03s4.83-19.78,4.83-19.78c6.94,4.36,11.54,11.92,11.54,20.49Z",
    c: "M60,66.55v9.02c0,8.63-4.66,16.23-11.68,20.57l-4.75-19.41.06-18.48c4.19-1.41,7.92-3.79,10.9-6.86,3.42,4.17,5.47,9.44,5.47,15.15Z",
    d: "M46.62,97.11c-3.56,1.85-7.63,2.89-11.94,2.89h-9.35c-12.26,0-22.51-8.44-24.83-19.62l15.94-3.63c.6,4.22,4.36,7.48,8.89,7.48h9.35c3.3,0,6.18-1.72,7.74-4.28l4.2,17.16Z",
    e: "M16.35,58.24v16.65L.19,78.58c-.13-.99-.19-12.04-.19-12.04,0-5.72,2.05-10.98,5.47-15.15,2.97,3.06,6.69,5.44,10.88,6.85Z",
    f: "M16.35,25.52v16.24c-4.19,1.41-7.91,3.79-10.88,6.85-3.42-4.17-5.47-9.44-5.47-15.16,0,0,.05-10.77.14-11.63l16.21,3.7Z",
    g: "M53.29,50c-4.71,4.97-11.56,7.91-18.62,7.89,0,0-9.35,0-9.35,0-7.06.03-13.91-2.92-18.62-7.89,4.7-4.97,11.56-7.91,18.62-7.89,0,0,9.35,0,9.35,0,7.05-.03,13.91,2.93,18.62,7.89Z"
  };
  const SEG_PATH_CLASSIC = {
    a: "M22.44,11.97h23.55l5.42-10.96c-1.63-.65-3.37-1.02-5.16-1.02h-25.19c-2.62,0-5.07.72-7.16,1.98l8.55,9.99Z",
    b: "M54.24,2.54l-6.51,13.16-2.61,26.01,5.73,6.69h5.73s3.36-33.42,3.36-33.42c.38-3.82-.89-7.65-3.49-10.5-.67-.73-1.41-1.38-2.2-1.94Z",
    c: "M50.69,51.6l-7.17,6-2.9,28.88,5.3,11.65c3.67-2.14,6.26-5.91,6.71-10.4l3.63-36.12h-5.57Z",
    d: "M37.8,88.03H13.75c-.16,0-.31-.02-.44-.06l-8.81,8.48c2.52,2.27,5.82,3.55,9.25,3.55h25.19c1.4,0,2.75-.21,4.03-.6l-5.18-11.37Z",
    e: "M3.42,51.6L.07,85.01c-.32,3.2.53,6.39,2.33,9.01l9.85-9.49,2.64-26.34-5.17-6.61H3.42Z",
    f: "M9.8,48.4l6.83-7.51,2.75-27.42s.01-.07.02-.11L11.36,3.96c-2.19,2.16-3.66,5.05-3.99,8.32l-3.63,36.12h6.06Z",
    g: "M42.86,44.01L18.13,44.01L12.61,50.08L17.23,55.99L40.45,55.99L47.82,49.81L42.86,44.01Z"
  };
  const SEG_PATH = modern ? SEG_PATH_MODERN : SEG_PATH_CLASSIC;

  const SEG_ORDER = ["a", "b", "c", "d", "e", "f", "g"];
  const DIGIT_SEG = {
    "0": "abcdef", "1": "bc",     "2": "abdeg",   "3": "abcdg",
    "4": "bcfg",   "5": "acdfg",  "6": "acdefg",  "7": "abc",
    "8": "abcdefg","9": "abcdfg"
  };

  const PAD_PX = 8;
  const SCALE = DIGIT_PX / DH;
  const PAD = PAD_PX / SCALE;
  const DIGIT_GAP = 8;

  // One screen pixel expressed in viewBox units, matching how the other
  // pixel-denominated values in this cell are converted.
  const SEG_STROKE_W = 1.25 / SCALE;

  const digitsOf = (v) => String(Math.max(0, Math.round(Number(v) || 0))).length;
  const PANEL_SLOTS = Math.max(3, ...items.map((it) => digitsOf(it.value)));
  const PANEL_W = 2 * PAD + PANEL_SLOTS * DW + (PANEL_SLOTS - 1) * DIGIT_GAP;
  const PANEL_H = DH + 2 * PAD;
  const PANEL_PX_W = PANEL_W * SCALE;

  const makeDisplay = (value) => {
    const target = Math.max(0, Math.round(Number(value) || 0));
    const slots = Math.max(1, String(target).length);

    const svg = d3.create("svg")
      .attr("viewBox", `0 0 ${PANEL_W} ${PANEL_H}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("display", "block")
      .style("width", "100%")
      .style("height", "auto");

    const SH_DY = 2 + 3 / SCALE, SH_BLUR = 1.4 + 1 / SCALE, SH_COLOR = SHADOW_COLOR, SH_OP = 0.22;
    const defs = svg.append("defs");

    const gradId = "lcdgrad-" + Math.random().toString(36).slice(2, 9);
    const grad = defs.append("linearGradient").attr("id", gradId)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", DH);
    grad.append("stop").attr("offset", "0%").attr("stop-color", SEG_GRADIENT_TOP);
    grad.append("stop").attr("offset", "100%").attr("stop-color", SEG_GRADIENT_BOTTOM);

    const fid = "lcdsh-" + Math.random().toString(36).slice(2, 9);
    defs.append("filter").attr("id", fid)
      .attr("filterUnits", "userSpaceOnUse")
      .attr("x", -40).attr("y", -40).attr("width", DW + 80).attr("height", DH + 80)
      .append("feDropShadow")
        .attr("dx", SHADOW_DX_PX / SCALE).attr("dy", SHADOW_DY_PX / SCALE)
        .attr("stdDeviation", SHADOW_BLUR_PX / SCALE)
        .attr("flood-color", SHADOW_COLOR).attr("flood-opacity", SHADOW_OPACITY);

    const iid = "lcdinner-" + Math.random().toString(36).slice(2, 9);
    const inner = defs.append("filter").attr("id", iid)
      .attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
    inner.append("feOffset").attr("in", "SourceAlpha").attr("dx", 0).attr("dy", SH_DY);
    inner.append("feGaussianBlur").attr("stdDeviation", SH_BLUR).attr("result", "blur");
    inner.append("feComposite")
      .attr("operator", "out").attr("in", "SourceGraphic").attr("in2", "blur").attr("result", "inverse");
    inner.append("feFlood").attr("flood-color", SH_COLOR).attr("flood-opacity", SH_OP).attr("result", "color");
    inner.append("feComposite")
      .attr("operator", "in").attr("in", "color").attr("in2", "inverse").attr("result", "shadow");
    inner.append("feComposite").attr("operator", "over").attr("in", "shadow").attr("in2", "SourceGraphic");

    svg.append("rect")
      .attr("x", 0).attr("y", 0).attr("width", PANEL_W).attr("height", PANEL_H)
      .attr("rx", 2.5 / SCALE).attr("fill", PANEL_BG)
      .attr("filter", `url(#${iid})`);

    const groupW = slots * DW + (slots - 1) * DIGIT_GAP;
    const startX = (PANEL_W - groupW) / 2;

    const litPaths = [];
    for (let i = 0; i < slots; i++) {
      const gx = startX + i * (DW + DIGIT_GAP);
      const slot = svg.append("g").attr("transform", `translate(${gx},${PAD})`);

      const ghost = slot.append("g");
      SEG_ORDER.forEach((s) =>
        ghost.append("path").attr("d", SEG_PATH[s])
          .attr("fill", SEG_OFF_COLOR).attr("fill-opacity", SEG_OFF_OPACITY)
      );

      // The lit segments carry a 1px stroke painted with the same gradient as
      // the fill. stroke-width / stroke-linejoin are set once on the group and
      // inherited; the paint is toggled per-segment in setValue().
      const on = slot.append("g")
        .attr("filter", `url(#${fid})`)
        .attr("stroke-width", SEG_STROKE_W)
        .attr("stroke-linejoin", "round");
      const segs = {};
      SEG_ORDER.forEach((s) => {
        segs[s] = on.append("path").attr("d", SEG_PATH[s])
          .attr("fill", "none").attr("stroke", "none");
      });
      litPaths.push(segs);
    }

    const setValue = (v) => {
      const str = String(Math.max(0, Math.round(v)))
        .padStart(slots, "0").slice(-slots);
      for (let i = 0; i < slots; i++) {
        const lit = DIGIT_SEG[str[i]] || "";
        SEG_ORDER.forEach((s) => {
          const paint = lit.includes(s) ? `url(#${gradId})` : "none";
          litPaths[i][s].attr("fill", paint).attr("stroke", paint);
        });
      }
    };

    setValue(target);
    return { node: svg.node(), setValue, target };
  };

  const root = d3.create("div").attr("class", "stkstats")
    .style("display", "flex").style("flex-wrap", "wrap")
    .style("justify-content", "center").style("gap", "30px")
    .style("box-sizing", "border-box").style("width", "100%").style("padding", "0");

  const observers = [];

  items.forEach((it) => {
    const box = root.append("div")
      .style("flex", "0 0 auto")
      .style("width", PANEL_PX_W + "px")
      .style("box-sizing", "content-box")
      .style("text-align", "center")
      .style("background", "#fff")
      .style("border", "none")
      .style("border-radius", "0")
      .style("padding", "0")
      .style("position", "relative");

    const disp = makeDisplay(it.value);
    box.append("div")
      .style("display", "flex").style("justify-content", "center")
      .node().appendChild(disp.node);

    const desc = box.append("div")
      .style("font", '400 12px "Inter", sans-serif')
      .style("color", "#000")
      .style("padding", "6px 8px 8px")
      .style("line-height", "1.3");
    const idx = it.bold ? it.label.indexOf(it.bold) : -1;
    if (idx === -1) {
      desc.append("span").text(it.label);
    } else {
      if (idx > 0) desc.append("span").text(it.label.slice(0, idx));
      desc.append("span").style("font-weight", "700").text(it.bold);
      const rest = it.label.slice(idx + it.bold.length);
      if (rest) desc.append("span").text(rest);
    }
    if (it.date) {
      desc.append("span").text(" as of ");
      desc.append("span").style("white-space", "nowrap").text(it.date);
    }

    const sentinel = (pos) =>
      box.append("div")
        .style("position", "absolute").style(pos, "0").style("left", "0")
        .style("width", "1px").style("height", "1px").node();
    const topS = sentinel("top");
    const botS = sentinel("bottom");

    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      const target = disp.target;

      const tailUnits = Math.min(tailCount, target);
      const linearUnits = target - tailUnits;
      const linDur = speed * linearUnits;
      const quadDur = 2 * tailUnits * speed;
      const total = linDur + quadDur;

      disp.setValue(0);
      d3.select(disp.node).interrupt();
      d3.select(disp.node).transition()
        .duration(total).ease(d3.easeLinear)
        .tween("count", () => (tt) => {
          const elapsed = tt * total;
          const v = elapsed <= linDur
            ? elapsed / speed
            : linearUnits + tailUnits * d3.easeQuadOut((elapsed - linDur) / quadDur);
          disp.setValue(v);
        })
        .on("end", () => disp.setValue(target));
    };

    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        play();
        io.disconnect();
      }
    }, { threshold: 0 });
    io.observe(topS);
    io.observe(botS);
    observers.push(io);
  });

  invalidation.then(() => {
    observers.forEach((o) => o.disconnect());
    d3.select(root.node()).selectAll("svg").interrupt();
  });

  return root.node();
}


function _cargoLegend(attachCell,fonts,dashboardHelpers,configGlobe,routes,html,state,invalidation)
{
  attachCell; fonts;
  const { tag } = dashboardHelpers;
  const defaultRouteColor = configGlobe.defaultRouteColor;
  const fontFamily = `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

  function makeCargoLegend(parent, types, opts) {
    const o = opts || {};
    const hidden = new Set();
    const rows = [];

    // 3-significant-figure formatter with thousand/million/billion/trillion
    // suffixes. 6519 -> "6.52K", 317178 -> "317K", 12_345_678 -> "12.3M".
    function fmtBarrels(n) {
      if (n == null || !isFinite(n)) return "";
      const sign = n < 0 ? "-" : "";
      let abs = Math.abs(n);
      const units = ["", "K", "M", "B", "T"];
      let tier = 0;
      while (abs >= 1000 && tier < units.length - 1) { abs /= 1000; tier++; }
      let r = Number(abs.toPrecision(3));
      if (r >= 1000 && tier < units.length - 1) {   // 999.6 -> 1000 -> bump tier
        r = Number((r / 1000).toPrecision(3));
        tier++;
      }
      return sign + r + units[tier];
    }

    // Voyage glyph: 🡲 — a heavy rightwards arrow. U+1F872 (heavy wide-headed
    // rightwards barb arrow, bold sibling of the U+1F862 used elsewhere),
    // rendered in Noto Symbols 2 at normal weight (symbol glyphs can't be
    // CSS-bolded — that only produces faux-bold smear). Swap ARROW if your
    // font's heavy rightwards arrow sits at a different codepoint.
    const ARROW = "🡲";
    function notoGlyph(ch, emScale) {
      const s = document.createElement("span");
      s.style.fontFamily = `"Noto Symbols 2", sans-serif`;
      s.style.fontWeight = "normal";
      if (emScale) s.style.fontSize = emScale + "em";
      s.textContent = ch;
      return s;
    }
    function voyageGlyph() {
      const a = notoGlyph(ARROW);
      a.style.display = "inline-block";          // so the transform applies
      a.style.transform = "translateX(-4px)";    // nudge left 4px (visual only)
      return a;
    }

    // --- Measure text so each column is exactly as wide as its widest member.
    const fam = o.fontFamily || `ui-sans-serif, system-ui, sans-serif`;
    const bodyFont  = `12px ${fam}`;
    const boldFont  = `700 12px ${fam}`;
    const _mctx = document.createElement("canvas").getContext("2d");
    const measure = (text, font) => { _mctx.font = font; return _mctx.measureText(String(text)).width; };

    const tArr = types || [];
    const cap1 = (s) => { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); };

    const PAD = 4; // ~2px breathing room per side
    // Size the voyage track to the COUNT NUMBERS only (floor: one digit). The
    // ●🡲● header glyph is allowed to overflow this track — it stays centered via
    // text-align:center on the header cell — so it never widens the column.
    let countW = measure("0", bodyFont);
    let labelW = measure("Cargo types", boldFont);
    let bblW   = measure("Barrels", boldFont);
    for (const t of tArr) {
      countW = Math.max(countW, measure(t.count != null ? String(t.count) : "", bodyFont));
      labelW = Math.max(labelW, measure(cap1(t.type), bodyFont));
      bblW   = Math.max(bblW,   measure(fmtBarrels(t.barrels), bodyFont));
    }
    countW = Math.ceil(countW) + PAD;
    labelW = Math.ceil(labelW) + PAD;
    bblW   = Math.ceil(bblW)   + PAD;

    const DOT_W = 10;
    const GAP_PX = 6;
    const GRID_GAP = GAP_PX + "px";
    // Column order: dot, voyage count, cargo label, barrels.
    const GRID_COLS = `${DOT_W}px ${countW}px ${labelW}px ${bblW}px`;
    const rowWidthPx = DOT_W + countW + labelW + bblW + 3 * GAP_PX;

    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.top = o.top || "8px";
    el.style.right = o.right || "8px";
    el.style.background = "rgba(255,255,255,0.92)";
    el.style.padding = "6px 8px";
    el.style.borderRadius = "4px";
    el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.18)";
    el.style.fontSize = "12px";
    el.style.lineHeight = "1.35";
    el.style.userSelect = "none";
    el.style.zIndex = "20";
    el.style.color = "#000";
    if (o.fontFamily) el.style.fontFamily = o.fontFamily;

    // --- Centered column-header row (replaces the old "Cargo types" title) ---
    const header = document.createElement("div");
    header.style.position = "relative";
    header.style.display = "grid";
    header.style.gridTemplateColumns = GRID_COLS;
    header.style.columnGap = GRID_GAP;
    header.style.alignItems = "center";
    header.style.fontWeight = "700";
    header.style.marginBottom = "4px";

    header.appendChild(document.createElement("span")); // empty slot over dots

    // Re-order the row elements to match the current `rows` array order. Rows
    // sit either directly in `el` or (when wrapped) in the multi-column wrapper;
    // either way they share the header's parent, so we just slot each row in
    // right after the header, in order. The header stays pinned first and any
    // footer (help block) is left untouched.
    function applyOrder() {
      const parent = header.parentNode;
      if (!parent) return;
      let anchor = header;
      for (const r of rows) {
        if (anchor.nextSibling !== r.rowEl) parent.insertBefore(r.rowEl, anchor.nextSibling);
        anchor = r.rowEl;
      }
    }
    const byName = (a, b) =>
      String(a.type).toLowerCase().localeCompare(String(b.type).toLowerCase());
    function sortBy(key) {
      if (key === "voyage")       rows.sort((a, b) => (b.count - a.count) || byName(a, b));
      else if (key === "barrels") rows.sort((a, b) => (b.barrels - a.barrels) || byName(a, b));
      else                        rows.sort(byName); // cargo: A -> Z
      applyOrder();
    }

    const hVoyage = document.createElement("span");
    hVoyage.style.textAlign = "center";
    hVoyage.style.cursor = "pointer";
    hVoyage.title = "Sort by voyages (descending)";
    hVoyage.appendChild(voyageGlyph());
    hVoyage.addEventListener("click", () => sortBy("voyage"));
    header.appendChild(hVoyage);

    const hCargo = document.createElement("span");
    hCargo.style.textAlign = "left";
    hCargo.style.cursor = "pointer";
    hCargo.title = "Sort by cargo type (A–Z)";
    hCargo.textContent = "Cargo types";
    hCargo.addEventListener("click", () => sortBy("cargo"));
    header.appendChild(hCargo);

    const hBarrels = document.createElement("span");
    hBarrels.style.textAlign = "right";
    hBarrels.style.cursor = "pointer";
    hBarrels.title = "Sort by barrels (descending)";
    hBarrels.textContent = "Barrels";
    hBarrels.addEventListener("click", () => sortBy("barrels"));
    header.appendChild(hBarrels);

    function clearAll() {
      if (hidden.size === 0) return;
      hidden.clear();
      for (const r of rows) refreshRow(r);
      refreshClear();
      notify();
      emitHoverFromCurrent();
    }

    // The Clear tag is created here but positioned/attached in the footer below
    // (see the help block) so it lives alongside the click/double-click notes.
    let clearTag = null;
    if (typeof o.tag === "function") {
      clearTag = o.tag({ label: "Clear", onClose: clearAll, onClick: clearAll });
    }
    el.appendChild(header);

    function refreshClear() {
      if (clearTag) clearTag.style.display = hidden.size > 0 ? "" : "none";
    }

    function refreshRow(r) {
      const isHidden = hidden.has(r.type);
      const dimmed = isHidden ||
        (spotlight !== null && r.type !== spotlight);
      r.rowEl.style.opacity = dimmed ? "0.35" : "1";
      r.rowEl.style.textDecoration = isHidden ? "line-through" : "";
    }
    let spotlight = null;
    let hoveredType = null;
    function setSpotlight(type) {
      const t = type || null;
      if (t === spotlight) return;
      spotlight = t;
      for (const r of rows) refreshRow(r);
    }
    function notify() {
      if (typeof o.onChange === "function") o.onChange(new Set(hidden));
    }
    function emitHoverFromCurrent() {
      if (typeof o.onHover !== "function") return;
      if (hoveredType && !hidden.has(hoveredType)) o.onHover(hoveredType);
      else                                          o.onHover(null);
    }
    function setHidden(next) {
      const nextSet = next instanceof Set ? next : new Set(next || []);
      if (nextSet.size === hidden.size) {
        let same = true;
        for (const t of nextSet) if (!hidden.has(t)) { same = false; break; }
        if (same) return;
      }
      hidden.clear();
      for (const t of nextSet) hidden.add(t);
      for (const r of rows) refreshRow(r);
      refreshClear();
    }
    function toggleOne(type) {
      if (hidden.has(type)) hidden.delete(type);
      else                  hidden.add(type);
      for (const r of rows) refreshRow(r);
      refreshClear();
      notify();
      emitHoverFromCurrent();
    }
    function soloOrRestore(type) {
      const allTypes = rows.map(r => r.type);
      const visibleNow = allTypes.filter(t => !hidden.has(t));
      const isAlreadySolo = visibleNow.length === 1 && visibleNow[0] === type;
      hidden.clear();
      if (!isAlreadySolo) {
        for (const t of allTypes) if (t !== type) hidden.add(t);
      }
      for (const r of rows) refreshRow(r);
      refreshClear();
      notify();
      emitHoverFromCurrent();
    }

    for (const t of tArr) {
      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns = GRID_COLS;
      row.style.columnGap = GRID_GAP;
      row.style.alignItems = "center";
      row.style.padding = "2px 0";
      row.style.cursor = "pointer";

      // 1) color dot
      const dot = document.createElement("span");
      dot.style.display = "inline-block";
      dot.style.width = "10px";
      dot.style.height = "10px";
      dot.style.borderRadius = "50%";
      dot.style.background = t.color || "#888";
      row.appendChild(dot);

      // 2) voyage count
      const cnt = document.createElement("span");
      cnt.textContent = t.count != null ? String(t.count) : "";
      cnt.style.textAlign = "right";
      cnt.style.fontVariantNumeric = "tabular-nums";
      row.appendChild(cnt);

      // 3) cargo label
      const label = document.createElement("span");
      label.textContent = cap1(t.type);
      row.appendChild(label);

      // 4) total barrels
      const bbl = document.createElement("span");
      bbl.textContent = fmtBarrels(t.barrels);
      bbl.style.textAlign = "right";
      bbl.style.fontVariantNumeric = "tabular-nums";
      row.appendChild(bbl);

      const entry = {
        type: t.type, count: t.count || 0, barrels: t.barrels || 0,
        rowEl: row, dotEl: dot, labelEl: label,
      };
      rows.push(entry);

      let clickTimer = null;
      row.addEventListener("click", () => {
        if (clickTimer) clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
          clickTimer = null;
          toggleOne(t.type);
        }, 220);
      });
      row.addEventListener("dblclick", () => {
        if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
        soloOrRestore(t.type);
      });

      row.addEventListener("mouseenter", () => {
        hoveredType = t.type;
        if (hidden.has(t.type)) return;
        if (typeof o.onHover === "function") o.onHover(t.type);
      });
      row.addEventListener("mouseleave", () => {
        hoveredType = null;
        if (typeof o.onHover === "function") o.onHover(null);
      });
      el.appendChild(row);
    }

    const help = document.createElement("div");
    help.style.position = "relative";              // anchor for the Clear tag
    help.style.marginTop = "6px";
    help.style.paddingTop = "5px";
    help.style.borderTop = "1px solid rgba(0,0,0,0.12)";
    help.style.fontSize = "11px";
    help.style.color = "#666";
    help.style.lineHeight = "1.3";
    const help1 = document.createElement("div");
    help1.textContent = "Click to toggle categories";
    const help2 = document.createElement("div");
    help2.textContent = "Double-click to isolate";
    help.appendChild(help1);
    help.appendChild(help2);

    // Clear tag lives in the footer now: right-aligned and vertically centered
    // within the help block (position:relative above is its containing block).
    if (clearTag) {
      clearTag.style.position = "absolute";
      clearTag.style.top = "50%";
      clearTag.style.right = "-5px";                          // +5px to the right
      clearTag.style.transform = "translateY(calc(-50% + 3px))"; // +3px down
      help.appendChild(clearTag);
    }
    el.appendChild(help);

    refreshClear();
    parent.appendChild(el);
    return {
      el, hidden, setSpotlight, setHidden,
      headerEl: header,
      rowEls: rows.map(r => r.rowEl),
      rowWidthPx,
    };
  }

  // --- Build the cargo-type list (color, voyage count, total barrels). ---
  // Count and barrels are summed over routes with valid endpoints, matching
  // what the globe draws.
  const routesArr = (typeof routes !== "undefined" && Array.isArray(routes)) ? routes : [];
  const validCoords = (r) =>
    r && isFinite(+r.load_lon) && isFinite(+r.load_lat) &&
    isFinite(+r.unload_lon) && isFinite(+r.unload_lat);

  const colorByType = new Map();
  const countByType = new Map();
  const barrelsByType = new Map();
  for (const r of routesArr) {
    if (!r || !r.cargo_type) continue;
    const ct = r.cargo_type;
    if (!colorByType.has(ct)) colorByType.set(ct, r.color || defaultRouteColor);
    if (validCoords(r)) {
      countByType.set(ct, (countByType.get(ct) || 0) + 1);
      const b = +r.barrels;
      if (isFinite(b)) barrelsByType.set(ct, (barrelsByType.get(ct) || 0) + b);
    }
  }
  const types = Array.from(colorByType, ([type, color]) => ({
    type, color,
    count: countByType.get(type) || 0,
    barrels: barrelsByType.get(type) || 0,
  })).sort((a, b) =>
    b.count !== a.count
      ? b.count - a.count
      : String(a.type).toLowerCase().localeCompare(String(b.type).toLowerCase())
  );

  const container = html`<div style="position:relative; width:100%; font-family:${fontFamily}; font-size:12px;"></div>`;

  if (types.length === 0) {
    container.value = null;
    return container;
  }

  let hidden        = state.hiddenCargo instanceof Set ? new Set(state.hiddenCargo) : new Set();
  let lastHidden    = state.hiddenCargo;
  let lastSpotlight = state.spotlightCargo;

  const cLeg = makeCargoLegend(container, types, {
    fontFamily,
    tag,
    onChange: (hiddenSet) => {
      hidden = hiddenSet instanceof Set ? new Set(hiddenSet) : new Set();
      const payload = new Set(hidden);
      lastHidden = payload;
      state.update({ hiddenCargo: payload });
    },
    onHover: (cargoType) => {
      const ct = (cargoType && !hidden.has(cargoType)) ? cargoType : null;
      cLeg.setSpotlight(ct);
      state.update({ hoveredCargo: ct });
    },
  });

  // Pull the legend back into normal flow so the cell grows to contain it.
  cLeg.el.style.position = "static";
  cLeg.el.style.top = "auto";
  cLeg.el.style.right = "auto";

  // --- Flow the header + rows into balanced side-by-side columns -------------
  // colWidth is the legend's natural (measured) row width, so each multi-column
  // column is exactly one row wide: a narrow slot shows one column with the
  // header on top, a wide slot fits several. The HEADER is flowed in FIRST so
  // it appears once, atop the first column, sharing that column's widths.
  const colWidth = cLeg.rowWidthPx || 200;
  const headerEl = cLeg.headerEl;
  const dataRowEls = cLeg.rowEls;
  if (dataRowEls.length > 1) {
    const colWrap = document.createElement("div");
    colWrap.style.columnWidth = colWidth + "px";
    colWrap.style.columnGap = "18px";
    cLeg.el.insertBefore(colWrap, headerEl);
    for (const r of [headerEl, ...dataRowEls]) {
      r.style.breakInside = "avoid";
      r.style.webkitColumnBreakInside = "avoid";
      colWrap.appendChild(r);
    }
  }

  if (cLeg.setHidden && hidden.size) cLeg.setHidden(hidden);

  const unsub = state.subscribe((st) => {
    if (st.hiddenCargo !== lastHidden) {
      lastHidden = st.hiddenCargo;
      hidden = st.hiddenCargo instanceof Set ? new Set(st.hiddenCargo) : new Set();
      if (cLeg.setHidden) cLeg.setHidden(hidden);
    }
    if (st.spotlightCargo !== lastSpotlight) {
      lastSpotlight = st.spotlightCargo;
      cLeg.setSpotlight(st.spotlightCargo || null);
    }
  });
  invalidation.then(unsub);

  container.value = null;
  return container;
}


function _globeRoutes(attachCell,fonts,state,dashboardHelpers,configNavMesh,configGlobe,globeRoutesHelpers,htl,d3,countries,navMesh,combinedPathNetwork,classifyPathNodes,optimizeIndex,alignRoutes,buildCurvedCorner,pathfinding,routes,dataPorts,states,cameraRange,rivers,lakes,SVGGeometryElement,invalidation,AbortController,ResizeObserver)
{
 attachCell; fonts; state;
 const { routeKey, tag } = dashboardHelpers;
 const _cfgNav = (typeof configNavMesh !== "undefined" && configNavMesh) || {};
 const {
  height,
  globeInset,
  routeWidth,
  defaultRouteColor,
  portRadius:        portR,
  portFill,
  portStroke,
  portStrokeWidth:   portStrokeLw,
  setupCurveSamples: sCS,
  selfIntersectMergeWindow: siMW,
  oceanColor,
  landColor,
  usBorderColor,
  graticuleOceanColor: gOC,
  graticuleLandColor:  gLC,
  stateFillColor,
  stateFillOpacity,
  stateHoverOpacity,
  graticuleLineWidth: graticuleLw,
  usBorderLineWidth:  usBorderLw,
  riversLineWidth:    riversLw,
  graticuleSteps,
  dragDpr,
  dragRotationSpeed,
  wheelZoomSensitivity,
  zoomEndDebounceMs,
  routeSpacing:             bundleSpacing,
  junctionRadius:           junctionRCap,
  junctionMinLineFrac:      jrMinLineFrac,
  junctionEndpointFreeFrac: jrEndpointFreeFrac,
  clusterMergeDistance:     clusterMergeDist,
  hoverPortRadius:  hPR,
  hoverRouteRadius: hRR,
  hoverPortFill,
  hoverPortStrokeWidth: hPSW,
  hoverRouteStrokeMultiplier,
  hoverStateStroke,
  hoverStateStrokeWidth:    hSSW,
  hoverStateLabelFontSize:  hSLfs,
  hoverStateLabelFontWeight: hSLfw,
  hoverFadeRiseRate: hfRise,
  hoverFadeFallRate: hfFall,
  hoverFadeOpacity:  hfOp,
  tooltipBackground,
  tooltipColor,
  tooltipFontSize,
  tooltipPadding,
  tooltipBorderRadius,
  tooltipOffsetX: tox,
  tooltipOffsetY: toy,
  tooltipMaxWidth,
 } = configGlobe;
 const fullDpr = configGlobe.fullDpr ?? (window.devicePixelRatio || 1);
 const zoomSpacingFactor = configGlobe.zoomSpacingFactor ?? 0;
 let cDpr = fullDpr;
 const H = globeRoutesHelpers;
 const fontFamily = `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
 const wrR = { el: null };
 let width = H.measureContainerWidth(wrR);
 let Hpx = height;
 let fitW = 0, fitH = 0;
 const wrapper = htl.html`<div style="width: 100%; font-family: ${fontFamily}; font-size: 13px;">`;
 wrR.el = wrapper;
 const mc = htl.html`<div style="position: relative; width: 100%; height: ${Hpx}px;">`;
 wrapper.appendChild(mc);
 mc.style.touchAction = "pan-y";
 let canvas = htl.html`<canvas style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block;">`;
 let ctx = canvas.getContext("2d");
 mc.appendChild(canvas);
 function syncCanvas() {
  const dpr = cDpr;
  const r = canvas.getBoundingClientRect();
  const bw = r.width || canvas.clientWidth || mc.clientWidth || width;
  const bh = r.height || canvas.clientHeight || mc.clientHeight || Hpx;
  fitW = bw; fitH = bh;
  const cw = Math.max(1, Math.round(bw * dpr));
  const chh = Math.max(1, Math.round(bh * dpr));
  if (canvas.width !== cw) canvas.width = cw;
  if (canvas.height !== chh) canvas.height = chh;
  const s = Math.min(bw / width, bh / Hpx);
  const tx = (bw - width * s) / 2;
  const ty = (bh - Hpx * s) / 2;
  ctx.setTransform(s * dpr, 0, 0, s * dpr, tx * dpr, ty * dpr);
 }
 function setDpr(dpr) {
  cDpr = dpr;
  syncCanvas();
 }
 setDpr(fullDpr);
 const ov = d3.select(mc).append("svg")
  .attr("width", width).attr("height", Hpx)
  .attr("viewBox", `0 0 ${width} ${Hpx}`)
  .style("position", "absolute").style("top", "0").style("left", "0")
  .style("width", "100%").style("height", "100%")
  .style("font-family", fontFamily).style("touch-action", "pan-y");
 const bgC = ov.append("rect")
  .attr("x", 0).attr("y", 0).attr("width", width).attr("height", Hpx)
  .attr("fill", "transparent").style("cursor", "grab");
 const sL      = ov.append("g").attr("class", "states").style("pointer-events", "none");
 const rL      = ov.append("g").attr("class", "routes").style("pointer-events", "none");
 const pL       = ov.append("g").attr("class", "ports").style("pointer-events", "none");
 const slL = ov.append("g").attr("class", "state-labels")
  .style("pointer-events", "none")
  .style("font-family", fontFamily);
 {
  const _slStyle = document.createElementNS("http://www.w3.org/2000/svg", "style");
  _slStyle.textContent = ".state-labels, .state-labels * { pointer-events: none !important; }";
  slL.node().appendChild(_slStyle);
 }
 const _tipCfg = {
  background: tooltipBackground, color: tooltipColor,
  fontSize: tooltipFontSize, padding: tooltipPadding,
  borderRadius: tooltipBorderRadius,
  maxWidth: tooltipMaxWidth,
  fontFamily,
 };
 const tts = H.makeTooltipEl(mc, _tipCfg);
 const tte   = H.makeTooltipEl(mc, _tipCfg);
 const ttm = H.makeTooltipEl(mc, _tipCfg);
 const ttp = H.makeTooltipEl(mc, _tipCfg);
 tts.style.fontFamily = fontFamily;
 tte.style.fontFamily   = fontFamily;
 ttm.style.fontFamily   = fontFamily;
 ttp.style.fontFamily   = fontFamily;
 ttm.style.color = "#fff";
 ttm.style.textAlign = "center";
 const zoomCtl = H.makeZoomControl(mc, fontFamily, "Zoom: Pinch, or hold Ctrl or drag and scroll", (t) => setZoomFromT(t));
 const zoomHintTag = tag({
  label: "Zoom: Pinch, or hold Ctrl or drag and scroll",
  onClose: dismissZoomHint,
  onClick: dismissZoomHint,
 });
 function dismissZoomHint() {
  const container = zoomHintTag.parentNode;
  if (container) {
   const w = container.offsetWidth;
   if (w > 0) {
    container.style.boxSizing = "border-box";
    container.style.width = w + "px";
   }
   container.removeChild(zoomHintTag);
  }
  zoomCtl.hintEl = null;
 }
 {
  const _origHint = zoomCtl.hintEl;
  zoomHintTag.style.pointerEvents = "auto";
  if (_origHint && _origHint.parentNode) {
   _origHint.parentNode.replaceChild(zoomHintTag, _origHint);
  } else {
   mc.appendChild(zoomHintTag);
  }
  zoomCtl.hintEl = zoomHintTag;
 }
 const focusTag = tag({
  label: "Focus",
  onClose: () => state.update({ focus: null }),
  onClick: () => state.update({ focus: null }),
 });
 const focusTagLabel = focusTag.querySelector(".tag-pill__label");
 focusTag.style.cssText +=
  ";position:absolute; z-index:9; pointer-events:auto; display:none;" +
  "box-shadow:0 2px 6px rgba(0,0,0,0.18);";
 mc.appendChild(focusTag);
 let focusSet = null;
 let focusEntry = null;
 const otherLand = { type: "FeatureCollection", features: countries.features.filter(d => d.properties.kind === "other_land") };
 const usLand    = { type: "FeatureCollection", features: countries.features.filter(d => d.properties.kind === "us") };
 const svgNs = "http://www.w3.org/2000/svg";
 const featureStateCode = (f) => H.featureStateCode(f);
 const hM =
  typeof navMesh !== "undefined" && navMesh && navMesh.mesh && navMesh.mercator;
 const hP =
  typeof combinedPathNetwork === "function" &&
  typeof classifyPathNodes  === "function" &&
  typeof optimizeIndex      === "function" &&
  typeof alignRoutes        === "function" &&
  typeof buildCurvedCorner  === "function" &&
  typeof pathfinding        === "object";
 let mercator = null;
 if (hM) mercator = navMesh.mercator;
 const rEs = [];
 const pEs = [];
 const sEs = [];
 const evalCubic = H.evalCubic;
 let _sbsR = null;
 if (hM && hP && Array.isArray(routes)) {
  const pRs = [];
  for (let i = 0; i < routes.length; i++) {
   const r = routes[i];
   if (r == null) continue;
   const loadLL   = [+r.load_lon,   +r.load_lat];
   const unloadLL = [+r.unload_lon, +r.unload_lat];
   if (!isFinite(loadLL[0]) || !isFinite(loadLL[1])) continue;
   if (!isFinite(unloadLL[0]) || !isFinite(unloadLL[1])) continue;
   const s = mercator.forward(loadLL);
   const e = mercator.forward(unloadLL);
   if (!s || !e) continue;
   const id = i;
   const color = r.color || defaultRouteColor;
   pRs.push({
    id, color,
    start: { x: s[0], y: s[1] },
    end:   { x: e[0], y: e[1] },
   });
  }
  const network    = combinedPathNetwork(navMesh.mesh, pRs, pathfinding);
  const cls = classifyPathNodes(network);
  const ords  = optimizeIndex(network, cls);
  H.applyOptimizedOrderings(network, ords);
  const algn  = alignRoutes(network, cls, ords, _cfgNav);
  const edgeKey = (a, b) => a < b ? a + "||" + b : b + "||" + a;
  const isEP = (wp) => typeof wp.id === "string" && wp.id.startsWith("endpoint:");
  let cbSp = bundleSpacing;
  let csScl  = 1;
  function bOff(A, B, routeIdx) {
   const e = network.edges.get(edgeKey(A.id, B.id));
   if (!e || !e.bundleOffsetByRoute) return { ox: 0, oy: 0 };
   const frac = e.bundleOffsetByRoute.get(routeIdx);
   if (frac == null || frac === 0) return { ox: 0, oy: 0 };
   const off = frac * cbSp;
   return { ox: e.bundlePerpX * off, oy: e.bundlePerpY * off };
  }
  function bShft(segA, segB, endpointId, routeIdx) {
   const segKey = edgeKey(segA.id, segB.id);
   const entry = algn.get(segKey + "@" + endpointId);
   if (!entry) return { sx: 0, sy: 0 };
   const v = entry.shiftByRoute.get(routeIdx);
   if (!v) return { sx: 0, sy: 0 };
   return { sx: v.x * csScl, sy: v.y * csScl };
  }
  const mLC = 5;
  const _latCorrectionCache = new Map();
  function lcAt(wp) {
   const cacheKey = wp.id;
   const cached = _latCorrectionCache.get(cacheKey);
   if (cached !== undefined) return cached;
   const ll = mercator.inverse([wp.x, wp.y]);
   let f = 1;
   if (ll && isFinite(ll[1])) {
    const c = Math.cos(ll[1] * Math.PI / 180);
    if (c > 1e-6) f = Math.min(mLC, 1 / c);
    else f = mLC;
   }
   _latCorrectionCache.set(cacheKey, f);
   return f;
  }
  function epPos(wp, otherWp, adjWp, routeIdx) {
   if (isEP(wp)) return { x: wp.x, y: wp.y };
   const latK = lcAt(wp);
   if (otherWp && isEP(otherWp) && adjWp) {
    const { ox, oy } = bOff(wp, adjWp, routeIdx);
    const sh = bShft(wp, adjWp, wp.id, routeIdx);
    return {
     x: wp.x + (ox + sh.sx) * latK,
     y: wp.y + (oy + sh.sy) * latK,
    };
   }
   const { ox, oy } = bOff(wp, otherWp, routeIdx);
   const sh = bShft(wp, otherWp, wp.id, routeIdx);
   return {
    x: wp.x + (ox + sh.sx) * latK,
    y: wp.y + (oy + sh.sy) * latK,
   };
  }
  const snapI = new Set();
  for (const n of cls.nodes) {
   if (n.kind === "snap") snapI.add(n.id);
  }
  const bfbr = new Map();
  for (const pipeRoute of pRs) {
   const p = network.paths.find(pp => pp.routeId === pipeRoute.id);
   if (!p) continue;
   const wps = p.waypoints;
   const filteredIdx = [];
   for (let i = 0; i < wps.length; i++) {
    const isInteriorSnap =
     i > 0 && i < wps.length - 1 &&
     snapI.has(wps[i].id) &&
     !isEP(wps[i - 1]) &&
     !isEP(wps[i + 1]);
    if (!isInteriorSnap) filteredIdx.push(i);
   }
   bfbr.set(p.routeIdx, { p, filteredIdx, wps });
  }
  const rcs = [];
  for (const [routeIdx, base] of bfbr) {
   const { chainWps, chainOrigIdxs } = H.clusterChain(
    base.filteredIdx, base.wps, snapI, clusterMergeDist
   );
   rcs.push({
    routeIdx,
    p: base.p,
    wps: base.wps,
    filteredIdx: base.filteredIdx,
    chainWps,
    chainOrigIdxs,
   });
  }
  const cbci = new Map();
  for (const rc of rcs) {
   for (const cw of rc.chainWps) {
    if (!cw._clusterIds) continue;
    const canId = cw._clusterIds[0];
    let entry = cbci.get(canId);
    if (!entry) {
     let span = 0;
     for (const m of cw._clusterMembers) {
      const d = Math.hypot(m.x - cw.x, m.y - cw.y);
      if (d > span) span = d;
     }
     entry = {
      ids: new Set(cw._clusterIds),
      centroid: { x: cw.x, y: cw.y },
      span,
     };
     cbci.set(canId, entry);
    } else {
     for (const id of cw._clusterIds) entry.ids.add(id);
    }
   }
  }
  function ckey(wp) {
   if (wp._clusterIds) return wp._clusterIds[0];
   return wp.id;
  }
  const wpsB = new Map();
  for (const rc of rcs) {
   for (let ci = 0; ci < rc.chainWps.length; ci++) {
    const wp = rc.chainWps[ci];
    if (isEP(wp)) continue;
    const key = ckey(wp);
    if (!wpsB.has(key)) wpsB.set(key, { wp, maxDist: 0 });
   }
  }
  const djrB = new Map();
  for (const [id, rec] of wpsB) {
   djrB.set(id, junctionRCap * lcAt(rec.wp));
  }
  const cpBws = new Map();
  const sArb = new Set();
  function sCap(wpKey, segKey, cap) {
   cpBws.set(wpKey + "|" + segKey, cap);
  }
  function gCap(wpKey, segKey) {
   return cpBws.get(wpKey + "|" + segKey);
  }
  for (const rc of rcs) {
   const cw = rc.chainWps;
   for (let ci = 0; ci < cw.length - 1; ci++) {
    const a = cw[ci], b = cw[ci + 1];
    const aKey = ckey(a), bKey = ckey(b);
    const segKey = aKey < bKey ? aKey + "||" + bKey : bKey + "||" + aKey;
    if (sArb.has(segKey)) continue;
    sArb.add(segKey);
    const segLen = Math.hypot(b.x - a.x, b.y - a.y);
    if (segLen <= 0) {
     if (!isEP(a)) sCap(aKey, segKey, 0);
     if (!isEP(b)) sCap(bKey, segKey, 0);
     continue;
    }
    const aIsEnd = isEP(a);
    const bIsEnd = isEP(b);
    if (aIsEnd && bIsEnd) continue;
    if (aIsEnd && !bIsEnd) {
     const cap = Math.min(djrB.get(bKey) ?? 0, segLen * (1 - jrEndpointFreeFrac));
     sCap(bKey, segKey, Math.max(0, cap));
     continue;
    }
    if (!aIsEnd && bIsEnd) {
     const cap = Math.min(djrB.get(aKey) ?? 0, segLen * (1 - jrEndpointFreeFrac));
     sCap(aKey, segKey, Math.max(0, cap));
     continue;
    }
    const wantA = djrB.get(aKey) ?? 0;
    const wantB = djrB.get(bKey) ?? 0;
    const usable = segLen * (1 - jrMinLineFrac);
    if (wantA + wantB <= usable) {
     sCap(aKey, segKey, wantA);
     sCap(bKey, segKey, wantB);
    } else if (wantA + wantB <= 1e-9) {
     sCap(aKey, segKey, 0);
     sCap(bKey, segKey, 0);
    } else {
     const scale = usable / (wantA + wantB);
     sCap(aKey, segKey, wantA * scale);
     sCap(bKey, segKey, wantB * scale);
    }
   }
  }
  function cpAt(wp, otherWp) {
   const wKey = ckey(wp);
   const oKey = ckey(otherWp);
   const segKey = wKey < oKey ? wKey + "||" + oKey : oKey + "||" + wKey;
   return gCap(wKey, segKey) ?? 0;
  }
  const reByI = new Map();
  function rbRG() {
   for (const rc of rcs) {
    const { routeIdx, wps, chainWps, chainOrigIdxs } = rc;
    const posChain = [];
    for (let ci = 0; ci < chainWps.length; ci++) {
     const chainWp = chainWps[ci];
     const origIdxs = chainOrigIdxs[ci];
     const firstOrig = origIdxs[0];
     const lastOrig  = origIdxs[origIdxs.length - 1];
     let left = null;
     const leftCi = ci - 1;
     if (leftCi >= 0) {
      const leftOrigIdxs = chainOrigIdxs[leftCi];
      const leftLast = leftOrigIdxs[leftOrigIdxs.length - 1];
      const step = leftLast > firstOrig ? 1 : -1;
      const neighborOrigIdx = firstOrig - step;
      if (neighborOrigIdx >= 0 && neighborOrigIdx < wps.length) {
       const adjOrigIdx = firstOrig + step;
       const adj = (adjOrigIdx >= 0 && adjOrigIdx < wps.length) ? wps[adjOrigIdx] : null;
       const rawPos = epPos(wps[firstOrig], wps[neighborOrigIdx], adj, routeIdx);
       if (origIdxs.length === 1) {
        left = rawPos;
       } else {
        const dx = chainWp.x - wps[firstOrig].x;
        const dy = chainWp.y - wps[firstOrig].y;
        left = { x: rawPos.x + dx, y: rawPos.y + dy };
       }
      }
     }
     let right = null;
     const rightCi = ci + 1;
     if (rightCi < chainWps.length) {
      const rightOrigIdxs = chainOrigIdxs[rightCi];
      const rightFirst = rightOrigIdxs[0];
      const step = rightFirst > lastOrig ? 1 : -1;
      const neighborOrigIdx = lastOrig + step;
      if (neighborOrigIdx >= 0 && neighborOrigIdx < wps.length) {
       const adjOrigIdx = lastOrig - step;
       const adj = (adjOrigIdx >= 0 && adjOrigIdx < wps.length) ? wps[adjOrigIdx] : null;
       const rawPos = epPos(wps[lastOrig], wps[neighborOrigIdx], adj, routeIdx);
       if (origIdxs.length === 1) {
        right = rawPos;
       } else {
        const dx = chainWp.x - wps[lastOrig].x;
        const dy = chainWp.y - wps[lastOrig].y;
        right = { x: rawPos.x + dx, y: rawPos.y + dy };
       }
      }
     }
     posChain.push({ left, right });
    }
    rc.posChain = posChain;
   }
   const mSL = new Map();
   for (const rc of rcs) {
    const cw = rc.chainWps, pc = rc.posChain;
    for (let ci = 0; ci < cw.length - 1; ci++) {
     const a = cw[ci], b = cw[ci + 1];
     const pa = pc[ci].right ?? a;
     const pb = pc[ci + 1].left ?? b;
     const len = Math.hypot(pb.x - pa.x, pb.y - pa.y);
     const aK = ckey(a), bK = ckey(b);
     const sk = aK < bK ? aK + "||" + bK : bK + "||" + aK;
     const cur = mSL.get(sk);
     if (cur === undefined || len < cur) mSL.set(sk, len);
    }
   }
   function segBudget(aWp, bWp) {
    const aK = ckey(aWp), bK = ckey(bWp);
    return mSL.get(aK < bK ? aK + "||" + bK : bK + "||" + aK);
   }
   for (const rc of rcs) {
    const { routeIdx, chainWps, posChain } = rc;
    const pipeRoute = pRs.find(pr => pr.id === rc.p.routeId);
    function posAt(i, j) {
     const pos = posChain[i];
     if (j > i) return pos.right ?? { x: chainWps[i].x, y: chainWps[i].y };
     return pos.left ?? { x: chainWps[i].x, y: chainWps[i].y };
    }
    function jrForStrand(wp, prevWp, nextWp, posInW, posOutW) {
     const wKey = ckey(wp);
     const junctionJr = wpsB.has(wKey) ? (djrB.get(wKey) ?? 0) : 0;
     const capIn  = cpAt(wp, prevWp);
     const capOut = cpAt(wp, nextWp);
     const latK = lcAt(wp);
     let jr = junctionJr * csScl;
     jr = Math.min(jr, junctionRCap * latK * csScl, capIn, capOut);
     return { jr: Math.max(0, jr), capIn, capOut };
    }
    const pieces = H.bldPcs(chainWps, posAt, jrForStrand, segBudget);
    const mercPts = [];
    for (let pi = 0; pi < pieces.length; pi++) {
     const pc = pieces[pi];
     if (pc.kind === "line") {
      if (pi === 0) mercPts.push({ x: pc.x1, y: pc.y1 });
      mercPts.push({ x: pc.x2, y: pc.y2 });
     } else if (pc.kind === "curve") {
      const nSamp = sCS;
      const startK = pi === 0 ? 0 : 1;
      for (let k = startK; k <= nSamp; k++) {
       const t = k / nSamp;
       const pt = evalCubic(pc.x1, pc.y1, pc.c1x, pc.c1y, pc.c2x, pc.c2y, pc.x2, pc.y2, t);
       mercPts.push(pt);
      }
     }
    }
    const cleaned = H.dnsClean(mercPts, siMW, mercator);
    const merc = new Float64Array(cleaned.length * 2);
    for (let k = 0; k < cleaned.length; k++) {
     merc[k * 2    ] = cleaned[k].x;
     merc[k * 2 + 1] = cleaned[k].y;
    }
    let entry = reByI.get(routeIdx);
    if (!entry) {
     const path = document.createElementNS(svgNs, "path");
     path.setAttribute("stroke", pipeRoute.color);
     path.setAttribute("stroke-width", String(routeWidth));
     path.setAttribute("stroke-linecap", "round");
     path.setAttribute("stroke-linejoin", "round");
     path.setAttribute("fill", "none");
     entry = { color: pipeRoute.color, merc, pieces, path, routeIndex: pipeRoute.id };
     rEs.push(entry);
     reByI.set(routeIdx, entry);
    } else {
     entry.merc = merc;
     entry.pieces = pieces;
    }
   }
  }
  rbRG();
  _sbsR = (newSpacing) => {
   const eps = 1e-3;
   if (Math.abs(newSpacing - cbSp) < eps) return;
   cbSp = newSpacing;
   csScl  = newSpacing / bundleSpacing;
   rbRG();
  };
 } else {
  if (Array.isArray(routes)) {
   for (let i = 0; i < routes.length; i++) {
    const r = routes[i];
    if (r == null) continue;
    const lonStart = [+r.load_lon,   +r.load_lat];
    const lonEnd   = [+r.unload_lon, +r.unload_lat];
    if (!isFinite(lonStart[0]) || !isFinite(lonEnd[0])) continue;
    const color = r.color || defaultRouteColor;
    const path = document.createElementNS(svgNs, "path");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", String(routeWidth));
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("fill", "none");
    rEs.push({ color, lonStart, lonEnd, merc: null, path, routeIndex: i });
   }
  }
 }
 if (typeof dataPorts !== "undefined" && Array.isArray(dataPorts)) {
  const haveRoutes = (typeof routes !== "undefined" && Array.isArray(routes));
  const eps = 1e-3;
  function portNameFromRoutes(lon, lat) {
   if (!haveRoutes) return null;
   for (const r of routes) {
    if (!r) continue;
    if (Math.abs((+r.load_lon)   - lon) < eps &&
      Math.abs((+r.load_lat)   - lat) < eps) return r.load_port || null;
    if (Math.abs((+r.unload_lon) - lon) < eps &&
      Math.abs((+r.unload_lat) - lat) < eps) return r.unload_port || null;
   }
   return null;
  }
  for (let i = 0; i < dataPorts.length; i++) {
   const p = dataPorts[i];
   if (!p) continue;
   const lon = +p.longitude, lat = +p.latitude;
   if (!isFinite(lon) || !isFinite(lat)) continue;
   const circle = document.createElementNS(svgNs, "circle");
   const renderedR = portR + portStrokeLw / 2;
   circle.setAttribute("r", String(renderedR));
   circle.setAttribute("fill", portFill);
   circle.setAttribute("stroke", portStroke);
   circle.setAttribute("stroke-width", String(portStrokeLw));
   const stateCode = p.state ? String(p.state).toUpperCase() : null;
   const name = p.name || p.port_name || p.portName || portNameFromRoutes(lon, lat);
   pEs.push({ lonlat: [lon, lat], circle, portIndex: i, stateCode, name });
  }
 }
 const sUsePoly = new Set([
  "FL", "LA", "ID", "MI", "WV", "MD", "OK", "TN", "TX", "DE", "NJ",
 ]);
 if (typeof states !== "undefined" && states && Array.isArray(states.features) &&
   typeof dataPorts !== "undefined" && Array.isArray(dataPorts)) {
  const neededCodes = new Set();
  for (const p of dataPorts) {
   if (p && p.state) neededCodes.add(String(p.state).toUpperCase());
  }
  for (const f of states.features) {
   const code = featureStateCode(f);
   if (!code || !neededCodes.has(code)) continue;
   const path = document.createElementNS(svgNs, "path");
   path.setAttribute("fill", stateFillColor);
   path.setAttribute("fill-opacity", String(stateFillOpacity));
   path.setAttribute("stroke", "none");
   path.setAttribute("stroke-linejoin", "round");
   const centroidLonLat = d3.geoCentroid(f);
   const polylabelLonLat = H.computeStateLabelPoint(f);
   sEs.push({ feature: f, code, path, centroidLonLat, polylabelLonLat });
  }
 }
 const sN = sL.node();
 for (const s of sEs) sN.appendChild(s.path);
 const rN = rL.node();
 for (const r of rEs) rN.appendChild(r.path);
 const slN = slL.node();
 const pN = pL.node();
 for (const p of pEs) pN.appendChild(p.circle);
 let hct = new Set();
 let mCargo = null;
 const ctRE = new Map();
 const reByCargo = new Map();
 {
  const routesArr = (typeof routes !== "undefined" && Array.isArray(routes))
   ? routes : null;
  if (routesArr) {
   for (const re of rEs) {
    const rec = routesArr[re.routeIndex];
    const ct = rec && rec.cargo_type;
    if (!ct) continue;
    ctRE.set(re, ct);
    let s = reByCargo.get(ct);
    if (!s) { s = new Set(); reByCargo.set(ct, s); }
    s.add(re);
   }
  }
 }
 H.orderRoutesByCargo(rEs, ctRE, rN);
 function fActive() {
  return (hct && hct.size > 0) ||
      !!(state.loadRange || state.dischargeRange) ||
      !!focusSet;
 }
 function pfh(p) {
  if (!fActive()) return false;
  const reSet = rByP && rByP.get(p.portIndex);
  if (!reSet || reSet.size === 0) return false;
  for (const re of reSet) {
   if (rShown(re)) return false;
  }
  return true;
 }
 function sfh(s) {
  if (!fActive()) return false;
  const portSet = pByS && pByS.get(s.code);
  if (!portSet || portSet.size === 0) return false;
  for (const pe of portSet) {
   if (!pfh(pe)) return false;
  }
  return true;
 }
 function asv() {
  for (const s of sEs) {
   if (sfh(s)) s.path.setAttribute("opacity", "0");
   else                     s.path.removeAttribute("opacity");
  }
 }
 function ashf() {
  const active = new Set();
  if (hvSt) {
   active.add(hvSt.code);
   for (const pe of prvPo) {
    if (pe.stateCode) active.add(pe.stateCode);
   }
  }
  for (const s of sEs) {
   const op = active.has(s.code) ? stateHoverOpacity : stateFillOpacity;
   s.path.setAttribute("fill-opacity", String(op));
  }
 }
 const hAr = H.makeHoverArrows(rN);
 function rha() {
  let startRadius = 0, endRadius = 0;
  if (hr) {
   const { loadPe, unloadPe } = H.classifyRouteEndpoints(
    hr, typeof routes !== "undefined" ? routes : null, pByR
   );
   if (loadPe)   startRadius = (loadPe.baseR   ?? portR) + portStrokeLw;
   if (unloadPe) endRadius   = (unloadPe.baseR ?? portR) + portStrokeLw;
  }
  H.updateHoverArrows(hAr, hr, rN, {
   color: (hr && hr.color) || defaultRouteColor,
   strokeWidth: routeWidth * hoverRouteStrokeMultiplier,
   startRadius,
   endRadius,
  });
 }
 const pAr = H.makePortHoverArrows(rN);
 function rpa() {
  if (!hvPort || !rByP) {
   H.updatePortHoverArrows(pAr, null, {});
   return;
  }
  const reSet = rByP.get(hvPort.portIndex);
  const routesArr = (typeof routes !== "undefined" && Array.isArray(routes))
   ? routes : null;
  const items = [];
  if (reSet && routesArr) {
   const [hlon, hlat] = hvPort.lonlat;
   const eps = 1e-3;
   for (const re of reSet) {
    const r = routesArr[re.routeIndex];
    if (!r) continue;
    if (!rShown(re)) continue;
    const isLoad =
     Math.abs((+r.load_lon)   - hlon) < eps &&
     Math.abs((+r.load_lat)   - hlat) < eps;
    const isUnload =
     Math.abs((+r.unload_lon) - hlon) < eps &&
     Math.abs((+r.unload_lat) - hlat) < eps;
    let fromStart = null;
    if (isLoad && !isUnload)        fromStart = false;
    else if (isUnload && !isLoad)   fromStart = true;
    if (fromStart === null) continue;
    const { loadPe, unloadPe } = H.classifyRouteEndpoints(re, routesArr, pByR);
    const arrowPe = fromStart ? loadPe : unloadPe;
    const portRadius = ((arrowPe && arrowPe.baseR) ?? portR) + portStrokeLw;
    items.push({ routeEntry: re, fromStart, portRadius });
   }
  }
  H.updatePortHoverArrows(pAr, items, {
   strokeWidth: routeWidth,
   defaultColor: defaultRouteColor,
  });
 }
 let iScl = H.computeBaseScale(width, Hpx, globeInset);
 const _cr = (typeof cameraRange !== "undefined" && cameraRange) || null;
 const sRot = _cr ? [-_cr.initialLon, -_cr.initialLat, 0] : [98, -39, 0];
 const sScl  = _cr ? iScl * (_cr.initialZoom || 1) : iScl;
 const prj = d3.geoOrthographic()
  .scale(sScl).translate([width / 2, Hpx / 2])
  .rotate(sRot).clipAngle(90);
 let pthClp = d3.geoPath(prj, ctx);
 const pthSvg = d3.geoPath(prj);
 const gProv = H.buildGraticuleProvider(graticuleSteps);
 function rRts() {
  for (const r of rEs) {
   r.path.setAttribute("d", H.buildRouteD(r, prj, mercator));
  }
  rha();
  rpa();
 }
 function rPts() {
  for (const p of pEs) {
   const proj = prj(p.lonlat);
   if (proj) {
    p.circle.setAttribute("cx", proj[0]);
    p.circle.setAttribute("cy", proj[1]);
    p.circle.removeAttribute("display");
    p.screenX = proj[0];
    p.screenY = proj[1];
    p.visible = true;
   } else {
    p.circle.setAttribute("display", "none");
    p.visible = false;
   }
  }
  posTTs();
  posFocusTag();
  ensureFocusTip();
  posTTp();
 }
 let hvPort = null;
 let hr = null;
 let hvSt = null;
 let hvCargo = null;
 const seByC = new Map();
 for (const s of sEs) seByC.set(s.code, s);
 let visL = new Set();
 function rSts() {
  for (const s of sEs) {
   const d = pthSvg(s.feature);
   if (d) {
    s.path.setAttribute("d", d);
    s.path.removeAttribute("display");
    s.visible = true;
   } else {
    s.path.setAttribute("display", "none");
    s.visible = false;
   }
  }
  if (visL.size) {
   for (const code of visL) {
    const s = seByC.get(code);
    if (!s) continue;
    const ok = posLbl(s);
    if (!ok) s.label.setAttribute("display", "none");
    else s.label.removeAttribute("display");
   }
  }
 }
 function rCv() {
  const rad = prj.scale();
  const cx = width / 2, cy = Hpx / 2;
  const step = gProv.stepFor(rad, iScl);
  const graticule = gProv.getGraticule(step);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI);
  ctx.fillStyle = oceanColor; ctx.fill();
  ctx.beginPath(); pthClp(graticule);
  ctx.strokeStyle = gOC; ctx.lineWidth = graticuleLw; ctx.stroke();
  ctx.beginPath(); pthClp(otherLand); ctx.fillStyle = landColor; ctx.fill();
  ctx.beginPath(); pthClp(usLand); ctx.fillStyle = landColor; ctx.fill();
  ctx.beginPath(); pthClp(usLand);
  ctx.strokeStyle = usBorderColor; ctx.lineWidth = usBorderLw; ctx.stroke();
  ctx.beginPath(); pthClp(graticule);
  ctx.strokeStyle = gLC; ctx.lineWidth = graticuleLw; ctx.stroke();
  ctx.beginPath(); pthClp(rivers);
  ctx.strokeStyle = oceanColor; ctx.lineWidth = riversLw;
  ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
  ctx.beginPath(); pthClp(lakes); ctx.fillStyle = oceanColor; ctx.fill();
 }
 let penF = null;
 let isDrag = false;
 let isZoom = false;
 let zET = null;
 function interact() { return isDrag || isZoom; }
 function canPR() { if (penF !== null) { cancelAnimationFrame(penF); penF = null; } }
 function rAll() { rCv(); rSts(); rRts(); rPts(); }
 function schR() {
  if (penF !== null) return;
  penF = requestAnimationFrame(() => { penF = null; rAll(); });
 }
 function entI() { if (cDpr !== dragDpr) { setDpr(dragDpr); rAll(); } }
 function exitI() { if (!interact() && cDpr !== fullDpr) { setDpr(fullDpr); rAll(); } }
 const rzT = 0.02;
 let lrbScl = iScl;
 function mrbb() {
  if (!_sbsR) return;
  const s = prj.scale();
  const ratio = s / lrbScl;
  if (Math.abs(ratio - 1) < rzT) return;
  _sbsR(H.spacingForScale(s, iScl, bundleSpacing, zoomSpacingFactor));
  lrbScl = s;
 }
 function rebuildCanvas() {
  const fresh = htl.html`<canvas style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block;">`;
  if (canvas && canvas.parentNode) canvas.parentNode.replaceChild(fresh, canvas);
  else mc.insertBefore(fresh, mc.firstChild);
  canvas = fresh;
  ctx = canvas.getContext("2d");
  pthClp = d3.geoPath(prj, ctx);
  setDpr(cDpr);
 }
 function render() {
  const w = Math.round(H.measureContainerWidth(wrR));
  const h = Math.round(mc.clientHeight) || height;
  if (!w || w <= 0) return;
  const oldRatio = iScl ? (prj.scale() / iScl) : 1;
  width = w; Hpx = h;
  ov.attr("width", width).attr("height", Hpx).attr("viewBox", `0 0 ${width} ${Hpx}`);
  bgC.attr("width", width).attr("height", Hpx);
  iScl = H.computeBaseScale(width, Hpx, globeInset);
  prj.translate([width / 2, Hpx / 2]).scale(iScl * oldRatio);
  lrbScl = iScl;
  if (_sbsR) {
   _sbsR(H.spacingForScale(prj.scale(), iScl, bundleSpacing, zoomSpacingFactor));
  }
  canPR();
  syncCanvas();
  rAll();
 }
 if (_sbsR) {
  const s = prj.scale();
  if (Math.abs(s / iScl - 1) > rzT) {
   _sbsR(H.spacingForScale(s, iScl, bundleSpacing, zoomSpacingFactor));
   lrbScl = s;
  }
 }
 rAll();
 const pClmp = _cr ? { lonMin: -_cr.maxLon, lonMax: -_cr.minLon, latMin: -_cr.maxLat, latMax: -_cr.minLat } : null;
 function clmpRot(rot) {
  if (!pClmp) return rot;
  return [
   Math.max(pClmp.lonMin, Math.min(pClmp.lonMax, rot[0])),
   Math.max(pClmp.latMin, Math.min(pClmp.latMax, rot[1])),
   rot[2],
  ];
 }
 let didPan = false;
 const bgDrag = d3.drag()
  .filter((event) => !event.button && event.pointerType !== "touch" && !event.touches)
  .on("start", (event) => {
   bgC.style("cursor", "grabbing");
   isDrag = true;
   didPan = false;
   canPR();
   clearTimeout(zET);
   entI();
   lmx = event.x;
   lmy = event.y;
   lmV = true;
  })
  .on("drag", (event) => {
   didPan = true;
   lmx = event.x;
   lmy = event.y;
   lmV = true;
   const rotate = prj.rotate();
   const k = dragRotationSpeed / prj.scale();
   prj.rotate(clmpRot([rotate[0] + event.dx * k, rotate[1] - event.dy * k, rotate[2]]));
   schR();
  })
  .on("end", () => {
   bgC.style("cursor", "grab");
   isDrag = false;
   if (!isZoom) exitI();
   reHv();
  });
 bgC.call(bgDrag);
 bgC.on("touchstart.drag", null).on("touchmove.drag", null).on("touchend.drag touchcancel.drag", null);
 bgC.style("touch-action", "pan-y");
 ov.node().addEventListener("contextmenu", (event) => event.preventDefault());
 const {
  routesByPortIdx: rByP,
  routesByStateCode: rByS,
  portsByRouteEntry: pByR,
  portsByStateCode: pByS,
  portByIdx: pByI,
  routesInByStateCode: rInS,
  routesOutByStateCode: rOutS,
 } = H.buildLookupTables(pEs, rEs, typeof routes !== "undefined" ? routes : null);
 const rArr = (typeof routes !== "undefined" && Array.isArray(routes)) ? routes : null;
 const reByK = new Map();
 if (rArr) {
  for (const re of rEs) {
   const rec = rArr[re.routeIndex];
   const k = rec ? routeKey(rec) : null;
   if (k != null && !reByK.has(k)) reByK.set(k, re);
  }
 }
 const pMs = (s) => Date.parse(String(s == null ? "" : s).split(" / ")[0]);
 function dOK(re) {
  const lr = state.loadRange, dr = state.dischargeRange;
  if (!lr && !dr) return true;
  const rec = rArr ? rArr[re.routeIndex] : null;
  if (!rec) return true;
  if (lr) {
   const t = pMs(rec.load_date);
   if (!(t >= +lr[0] && t <= +lr[1])) return false;
  }
  if (dr) {
   const t = pMs(rec.unload_date);
   if (!(t >= +dr[0] && t <= +dr[1])) return false;
  }
  return true;
 }
 function rShown(re) {
  if (focusSet && !focusSet.has(re)) return false;
  if (hct && hct.size) {
   const ct = ctRE.get(re);
   if (ct && hct.has(ct)) return false;
  }
  return dOK(re);
 }
 for (const p of pEs) {
  const reSet = rByP.get(p.portIndex);
  const count = reSet ? reSet.size : 0;
  p.baseR = Math.max(portR, 2 * Math.sqrt(count));
  p.circle.setAttribute("r", String(p.baseR + portStrokeLw / 2));
 }
 for (const p of [...pEs].sort((a, b) => (b.baseR || 0) - (a.baseR || 0))) {
  pN.appendChild(p.circle);
 }
 const pointSegDistSq = H.pointSegDistSq;
 function findHv(mx, my) {
  const portMaxSq = hPR * hPR;
  let bestPort = null, bestPortSq = Infinity;
  for (const p of pEs) {
   if (!p.visible) continue;
   if (pfh(p)) continue;
   const dx = mx - p.screenX, dy = my - p.screenY;
   const dSq = dx * dx + dy * dy;
   if (dSq <= portMaxSq && dSq < bestPortSq) { bestPortSq = dSq; bestPort = p; }
  }
  if (bestPort) return { port: bestPort, route: null, state: null };
  const routeMaxSq = hRR * hRR;
  let bestRoute = null, bestRouteSq = Infinity;
  for (const r of rEs) {
   if (!rShown(r)) continue;
   const pts = r.screenPts;
   const runs = r.screenRuns;
   if (!pts || !runs) continue;
   for (const [start, end] of runs) {
    for (let i = start; i < end - 1; i++) {
     const ax = pts[i * 2],     ay = pts[i * 2 + 1];
     const bx = pts[i * 2 + 2], by = pts[i * 2 + 3];
     const dSq = pointSegDistSq(mx, my, ax, ay, bx, by);
     if (dSq <= routeMaxSq && dSq < bestRouteSq) { bestRouteSq = dSq; bestRoute = r; }
    }
   }
  }
  if (bestRoute) return { port: null, route: bestRoute, state: null };
  let hitState = null;
  if (typeof SVGGeometryElement !== "undefined") {
   const svgNode = ov.node();
   const pt = svgNode.createSVGPoint();
   pt.x = mx; pt.y = my;
   for (const s of sEs) {
    if (!s.visible) continue;
    if (sfh(s)) continue;
    try {
     if (s.path.isPointInFill && s.path.isPointInFill(pt)) { hitState = s; break; }
    } catch (e) {}
   }
  }
  if (hitState) return { port: null, route: null, state: hitState };
  return { port: null, route: null, state: null };
 }
 let fLin = 0;
 let fAn = false;
 let fLts = 0;
 let prvP = new Set();
 let prvPo = new Set();
 let laE = -1;
 let laPS = null;
 let laPoS = null;
 const easeInOutCubic = H.easeInOutCubic;
 function appFade(force) {
  const eased = easeInOutCubic(fLin);
  if (
   !force &&
   eased === laE &&
   prvP === laPS &&
   prvPo === laPoS
  ) return;
  const dimmed = 1 - (1 - hfOp) * eased;
  const noHighlight = prvP.size === 0 && prvPo.size === 0;
  function routeVis(re) {
   return rShown(re) ? 1 : 0;
  }
  function portVis(p) {
   return pfh(p) ? 0 : 1;
  }
  if (noHighlight) {
   for (const r of rEs) {
    const op = dimmed * routeVis(r);
    if (op >= 1 - 1e-6) r.path.removeAttribute("opacity");
    else                r.path.setAttribute("opacity", op.toFixed(3));
   }
   for (const p of pEs) {
    const op = dimmed * portVis(p);
    if (op >= 1 - 1e-6) p.circle.removeAttribute("opacity");
    else                p.circle.setAttribute("opacity", op.toFixed(3));
   }
  } else {
   for (const r of rEs) {
    const baseOp = prvP.has(r) ? 1 : dimmed;
    const op = baseOp * routeVis(r);
    if (op >= 1 - 1e-6) r.path.removeAttribute("opacity");
    else                r.path.setAttribute("opacity", op.toFixed(3));
   }
   for (const p of pEs) {
    const baseOp = prvPo.has(p) ? 1 : dimmed;
    const op = baseOp * portVis(p);
    if (op >= 1 - 1e-6) p.circle.removeAttribute("opacity");
    else                p.circle.setAttribute("opacity", op.toFixed(3));
   }
  }
  laE = eased;
  laPS = prvP;
  laPoS = prvPo;
 }
 function anyHv() { return !!(hvPort || hr || hvSt || hvCargo); }
 function fTick(ts) {
  if (!fAn) return;
  const dt = fLts ? Math.min(0.1, (ts - fLts) / 1000) : 0;
  fLts = ts;
  const rising = anyHv();
  const rate = rising ? hfRise : -hfFall;
  fLin += rate * dt;
  if (fLin < 0) fLin = 0;
  if (fLin > 1) fLin = 1;
  appFade(false);
  if ((rising && fLin >= 1) || (!rising && fLin <= 0)) {
   fAn = false;
   fLts = 0;
   if (!rising) {
    let cleared = false;
    if (prvP.size > 0) { prvP = new Set(); cleared = true; }
    if (prvPo.size > 0) { prvPo = new Set(); cleared = true; }
    if (cleared) appFade(true);
   }
   return;
  }
  requestAnimationFrame(fTick);
 }
 function ensFA() {
  if (fAn) return;
  const rising = anyHv();
  if (rising && fLin >= 1) return;
  if (!rising && fLin <= 0) return;
  fAn = true;
  fLts = 0;
  requestAnimationFrame(fTick);
 }
 for (const s of sEs) {
  s.label = H.makeStateLabel(s, slN, hSLfs, hoverStateStroke);
  s.label.setAttribute("font-family", fontFamily);
  s._labelMode = "plain";
 }
 function lblPlain(s) {
  if (s._labelMode === "plain") return;
  s.label.textContent = s.code;
  s._labelMode = "plain";
 }
 function lblCounts(s, inCount, outCount) {
  if (s._labelMode === "counts" &&
    s._labelInCount === inCount &&
    s._labelOutCount === outCount) {
   return;
  }
  s.label.textContent = "";
  if (inCount > 0) {
   s.label.appendChild(document.createTextNode(String(inCount) + " "));
   s.label.appendChild(H.arrowSym(true));
   s.label.appendChild(document.createTextNode(" "));
  }
  s.label.appendChild(document.createTextNode(s.code));
  if (outCount > 0) {
   s.label.appendChild(document.createTextNode(" "));
   s.label.appendChild(H.arrowSym(true));
   s.label.appendChild(document.createTextNode(" " + String(outCount)));
  }
  s._labelMode = "counts";
  s._labelInCount = inCount;
  s._labelOutCount = outCount;
 }
 function posLbl(sEnt) {
  const usePolylabel = sUsePoly.has(sEnt.code);
  const ll = usePolylabel
   ? (sEnt.polylabelLonLat ?? sEnt.centroidLonLat)
   : (sEnt.centroidLonLat  ?? sEnt.polylabelLonLat);
  let c = ll ? prj(ll) : null;
  if (!c) c = pthSvg.centroid(sEnt.feature);
  if (!c || !isFinite(c[0]) || !isFinite(c[1])) return false;
  sEnt.label.setAttribute("x", c[0].toFixed(2));
  sEnt.label.setAttribute("y", c[1].toFixed(2));
  return true;
 }
 function updLbls() {
  const next = new Set();
  if (hvPort || hr || hvSt) {
   for (const pe of prvPo) {
    if (pe.stateCode && seByC.has(pe.stateCode)) next.add(pe.stateCode);
   }
   if (hvSt && seByC.has(hvSt.code)) next.add(hvSt.code);
  }
  for (const code of visL) {
   if (!next.has(code)) {
    const s = seByC.get(code);
    if (s) {
     s.label.setAttribute("display", "none");
     lblPlain(s);
    }
   }
  }
  for (const code of next) {
   const s = seByC.get(code);
   if (!s) continue;
   const ok = posLbl(s);
   if (!ok) { s.label.setAttribute("display", "none"); continue; }
   const isHovered = (hvSt && hvSt.code === code);
   s.label.setAttribute(
    "font-weight",
    isHovered ? String(hSLfw) : "normal"
   );
   s.label.setAttribute("stroke", isHovered ? hoverPortFill : "white");
   if (isHovered) {
    const inSet  = rInS.get(code);
    const outSet = rOutS.get(code);
    const inCount  = inSet  ? inSet.size  : 0;
    const outCount = outSet ? outSet.size : 0;
    lblCounts(s, inCount, outCount);
   } else {
    lblPlain(s);
   }
   s.label.removeAttribute("display");
   slN.appendChild(s.label);
  }
  visL = next;
 }
 function appHv(nextPort, nextRoute, nextState, nextCargo) {
  if (hvPort && hvPort !== nextPort) {
   hvPort.circle.setAttribute("fill", portFill);
   hvPort.circle.setAttribute("stroke-width", String(portStrokeLw));
   hvPort.circle.setAttribute("r", String((hvPort.baseR ?? portR) + portStrokeLw / 2));
  }
  if (hr && hr !== nextRoute) {
   hr.path.setAttribute("stroke-width", String(routeWidth));
  }
  if (hvSt && hvSt !== nextState) {
   hvSt.path.setAttribute("stroke", "none");
   hvSt.path.removeAttribute("stroke-width");
  }
  const nextCargoNorm = nextCargo || null;
  if (hvCargo && hvCargo !== nextCargoNorm) {
   const oldSet = reByCargo.get(hvCargo);
   if (oldSet) {
    for (const re of oldSet) re.path.setAttribute("stroke-width", String(routeWidth));
   }
  }
  if (nextPort && nextPort !== hvPort) {
   nextPort.circle.setAttribute("fill", hoverPortFill);
   nextPort.circle.setAttribute("stroke-width", String(hPSW));
   nextPort.circle.setAttribute("r", String((nextPort.baseR ?? portR) + hPSW / 2));
   pN.appendChild(nextPort.circle);
  }
  if (nextRoute && nextRoute !== hr) {
   nextRoute.path.setAttribute("stroke-width", String(routeWidth * hoverRouteStrokeMultiplier));
   rN.appendChild(nextRoute.path);
  }
  if (nextState && nextState !== hvSt) {
   nextState.path.setAttribute("stroke", hoverStateStroke);
   const sw = (nextState === focusEntry) ? 2 : hSSW;
   nextState.path.setAttribute("stroke-width", String(sw));
   sN.appendChild(nextState.path);
  }
  if (nextCargoNorm && nextCargoNorm !== hvCargo) {
   const newSet = reByCargo.get(nextCargoNorm);
   if (newSet) {
    const sw = String(routeWidth * hoverRouteStrokeMultiplier);
    for (const re of newSet) re.path.setAttribute("stroke-width", sw);
   }
  }
  const prevHovered = anyHv();
  hvPort = nextPort;
  hr = nextRoute;
  hvSt = nextState;
  hvCargo = nextCargo || null;
  const nowHovered = anyHv();
  if (nowHovered) {
   let newRoutes, newPorts;
   if (hvCargo && !nextPort && !nextRoute && !nextState) {
    newRoutes = reByCargo.get(hvCargo) || new Set();
    newPorts = H.computePreviousPorts(null, null, null, newRoutes, pByR, pByS);
   } else {
    newRoutes = H.computePreviousPaths(nextPort, nextRoute, nextState, rByP, rByS);
    newPorts  = H.computePreviousPorts(nextPort, nextRoute, nextState, newRoutes, pByR, pByS);
   }
   let changed = false;
   if (newRoutes !== prvP) { prvP = newRoutes; changed = true; }
   if (newPorts  !== prvPo) { prvPo = newPorts;  changed = true; }
   for (const re of prvP) rN.appendChild(re.path);
   for (const pe of prvPo) pN.appendChild(pe.circle);
   if (nextRoute) rN.appendChild(nextRoute.path);
   if (nextPort)  pN.appendChild(nextPort.circle);
   if (changed) appFade(true);
  }
  updLbls();
  ashf();
  if (nextRoute) showTTs(nextRoute);
  else hideTTs();
  if (nextPort) showTTp(nextPort);
  else hideTTp();
  rha();
  rpa();
  if (prevHovered !== nowHovered || (fLin > 0 && fLin < 1)) {
   if (extA) {
    fAn = false;
    fLts = 0;
    fLin = nowHovered ? 1 : 0;
    if (!nowHovered) {
     if (prvP.size > 0) prvP = new Set();
     if (prvPo.size > 0) prvPo = new Set();
    }
    appFade(true);
   } else {
    ensFA();
   }
  }
  syncH();
  styleFocusState();
 }
 function posFocusTag() {
  if (!state.focus || !focusEntry) { focusTag.style.display = "none"; return; }
  const cw = mc.clientWidth || 1, ch = mc.clientHeight || 1;
  const sx = cw / width, sy = ch / Hpx;
  let px, y;
  if (focusEntry.portIndex != null) {
   if (focusEntry.visible === false) { focusTag.style.display = "none"; return; }
   focusTag.style.display = "";
   const th = focusTag.offsetHeight || 0;
   px = focusEntry.screenX * sx;
   const py = focusEntry.screenY * sy;
   y = py - toy - th;
  } else if (focusEntry.label) {
   focusTag.style.display = "";
   const b = focusEntry.label.getBBox ? focusEntry.label.getBBox() : null;
   const th = focusTag.offsetHeight || 0;
   px = (b ? b.x + b.width / 2 : 0) * sx;
   const labelTop = (b ? b.y : 0) * sy;
   y = labelTop - th - 6;
  } else { focusTag.style.display = "none"; return; }
  const tw = focusTag.offsetWidth || 0;
  const tagH = focusTag.offsetHeight || 0;
  let x = px - tw / 2;
  if (x + tw > cw - 2) x = cw - tw - 2;
  if (x < 2) x = 2;
  if (y < 2) y = 2;
  const lg = legendObEl();
  if (lg) ({ x, y } = H.clampEl(lg, x, y, tw, tagH, cw, ch));
  focusTag.style.transform = `translate(${x}px, ${y}px)`;
 }
 let stickyFocus = false;
 function ensureFocusTip() {
  if (!focusEntry || focusEntry.portIndex == null) return;
  if (focusEntry.visible === false) return;
  if (hvPort === focusEntry && !hr && !hvSt) {
   if (ttp.style.display === "none" || ttPortEntry !== focusEntry) showTTp(focusEntry);
  }
 }
 function clrHv() {
  if (focusEntry) {
   stickyFocus = true;
   if (focusEntry.portIndex != null) appHv(focusEntry, null, null);
   else appHv(null, null, focusEntry);
   stickyFocus = false;
  } else {
   appHv(null, null, null, null);
  }
 }
 let lastFocusStatePath = null;
 function styleFocusState() {
  const cur = (focusEntry && focusEntry.portIndex == null) ? focusEntry : null;
  if (lastFocusStatePath && (!cur || cur.path !== lastFocusStatePath)) {
   const prev = lastFocusStatePath;
   if (hvSt && hvSt.path === prev) {
    prev.setAttribute("stroke", hoverStateStroke);
    prev.setAttribute("stroke-width", String(hSSW));
   } else {
    prev.setAttribute("stroke", "none");
    prev.removeAttribute("stroke-width");
   }
   lastFocusStatePath = null;
  }
  if (cur && cur.path) {
   cur.path.setAttribute("stroke", hoverStateStroke);
   cur.path.setAttribute("stroke-width", "2");
   lastFocusStatePath = cur.path;
  }
 }
 let mHov = null;
 let mHovKind = null;
 let extA = false;
 function syncH() {
  if (extA) return;
  const next = new Set();
  if (!stickyFocus && anyHv() && rArr) {
   for (const re of prvP) {
    const rec = rArr[re.routeIndex];
    const k = rec ? routeKey(rec) : null;
    if (k != null) next.add(k);
   }
  }
  const kind = stickyFocus ? null
   : (hr ? "route" : hvPort ? "port" : hvSt ? "state" : hvCargo ? "cargo" : null);
  if (H.sameKeys(mHov, next) && kind === mHovKind) return;
  mHov = next;
  mHovKind = kind;
  state.update({ hoveredRoutes: next, hoverKind: kind });
 }
 let ttlPe = null;
 let ttuPe = null;
 let ttlSym = null;
 let ttuSym = null;
 let ttCR = null;
 let ttFC = null;
 let ttTC   = null;
 let ttRouteEntry = null;
 let ttPortEntry = null;
 const usCen = [-98.5, 39.5];
 function ttSide(pe) {
  if (!pe) return 0;
  const c = prj(usCen);
  if (!c || !isFinite(c[0])) return 0;
  return (pe.screenX < c[0]) ? +1 : -1;
 }
 function legendObEl() {

  const lg = wrapper.querySelector(".stkdash__cell--legend");
  return lg && lg.offsetParent ? lg : null;
 }
 function clampObs(x, y, w, h, cw, ch) {
  if (zoomCtl.hintEl) ({ x, y } = H.clampEl(zoomCtl.hintEl, x, y, w, h, cw, ch));
  const lg = legendObEl();
  if (lg) ({ x, y } = H.clampEl(lg, x, y, w, h, cw, ch));
  return { x, y };
 }
 function posTT(el, pe, fallbackSign) {
  if (!pe) { el.style.display = "none"; return; }
  const cw = mc.clientWidth  || 1;
  const ch = mc.clientHeight || 1;
  const sx = cw / width;
  const sy = ch / Hpx;
  const px = pe.screenX * sx;
  const py = pe.screenY * sy;
  let sign = ttSide(pe);
  if (sign === 0) sign = fallbackSign;
  const prevSign = +(el.dataset.symbolSide || 0);
  const symbolKind = el.dataset.symbolKind || null;
  if (symbolKind && ttCR && prevSign !== sign) {
   const isLoad = (el === tts);
   const portName = isLoad ? ttCR.load_port : ttCR.unload_port;
   const dateStr  = isLoad ? ttCR.load_date : ttCR.unload_date;
   H.setTooltipLines(el, portName, dateStr, symbolKind, sign < 0,
            ttFC, ttTC);
   el.dataset.symbolSide = String(sign);
  }
  el.style.textAlign = (sign > 0) ? "left" : "right";
  const tipW = el.offsetWidth  || 0;
  const tipH = el.offsetHeight || 0;
  let x = (sign > 0)
   ? px - tox
   : px + tox - tipW;
  let y = py - toy - tipH;
  if (x + tipW > cw - 2) x = cw - tipW - 2;
  if (x < 2)             x = 2;
  if (y < 2)             y = 2;
  if (y + tipH > ch - 2) y = ch - tipH - 2;
  ({ x, y } = clampObs(x, y, tipW, tipH, cw, ch));
  el.style.transform = `translate(${x}px, ${y}px)`;
 }
 function posTTs() {
  if (tts.style.display === "none" &&
    tte.style.display === "none" &&
    ttm.style.display === "none") return;
  posTT(tts, ttlPe,   -1);
  posTT(tte,   ttuPe, +1);
  const loadY   = ttlPe   ? ttlPe.screenY   : -Infinity;
  const unloadY = ttuPe ? ttuPe.screenY : -Infinity;
  if (loadY >= unloadY) {
   tts.style.zIndex = "11";
   tte.style.zIndex   = "10";
  } else {
   tts.style.zIndex = "10";
   tte.style.zIndex   = "11";
  }
  posTTm();
  sepTT();
 }
 function sepTT() {
  const cw = mc.clientWidth  || 1;
  const ch = mc.clientHeight || 1;
  const mr = mc.getBoundingClientRect();
  function rectOf(el) {
   if (el.style.display === "none") return null;
   const r = el.getBoundingClientRect();
   return { el, x: r.left - mr.left, y: r.top - mr.top, w: r.width, h: r.height };
  }
  const items = [rectOf(tts), rectOf(tte), rectOf(ttm)].filter(Boolean);
  if (items.length < 2) return;
  for (const it of items) {
   it.icx = it.x + it.w / 2;
   it.icy = it.y + it.h / 2;
  }
  function clamp(it) {
   if (it.x + it.w > cw - 2) it.x = cw - it.w - 2;
   if (it.x < 2)             it.x = 2;
   if (it.y + it.h > ch - 2) it.y = ch - it.h - 2;
   if (it.y < 2)             it.y = 2;
  }
  const MAX_ITERS = 8;
  for (let iter = 0; iter < MAX_ITERS; iter++) {
   let moved = false;
   for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
     const a = items[i], b = items[j];
     const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
     const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
     if (overlapX <= 0 || overlapY <= 0) continue;
     if (overlapX < overlapY) {
      const push = overlapX / 2 + 0.5;
      if (a.icx <= b.icx) { a.x -= push; b.x += push; }
      else                { a.x += push; b.x -= push; }
     } else {
      const push = overlapY / 2 + 0.5;
      if (a.icy <= b.icy) { a.y -= push; b.y += push; }
      else                { a.y += push; b.y -= push; }
     }
     moved = true;
    }
   }
   for (const it of items) clamp(it);
   if (!moved) break;
  }
  for (const it of items) {
   ({ x: it.x, y: it.y } = clampObs(it.x, it.y, it.w, it.h, cw, ch));
   it.el.style.transform = `translate(${it.x}px, ${it.y}px)`;
  }
 }
 function posTTm() {
  if (ttm.style.display === "none") return;
  if (!ttRouteEntry || !lmV) { ttm.style.display = "none"; return; }
  const cw = mc.clientWidth  || 1;
  const ch = mc.clientHeight || 1;
  const sx = cw / width;
  const sy = ch / Hpx;
  const px = lmx * sx;
  const py = lmy * sy;
  const tipW = ttm.offsetWidth  || 0;
  const tipH = ttm.offsetHeight || 0;
  let outX = 0, outY = 0;
  const c = prj(usCen);
  if (c && isFinite(c[0]) && isFinite(c[1])) {
   const cxp = c[0] * sx, cyp = c[1] * sy;
   const vx = px - cxp, vy = py - cyp;
   const m = Math.hypot(vx, vy);
   if (m > 1e-3) { outX = vx / m; outY = vy / m; }
  }
  let x, y;
  if (outX === 0 && outY === 0) {
   x = px + tox;
   y = py + toy;
  } else {
   x = px + outX * tox;
   y = py + outY * toy;
   if (outX < 0) x -= tipW;
   if (outY < 0) y -= tipH;
  }
  if (x + tipW > cw - 2) x = cw - tipW - 2;
  if (x < 2)             x = 2;
  if (y + tipH > ch - 2) y = ch - tipH - 2;
  if (y < 2)             y = 2;
  ({ x, y } = clampObs(x, y, tipW, tipH, cw, ch));
  ttm.style.transform = `translate(${x}px, ${y}px)`;
  ttm.style.zIndex = "12";
 }
 function fcl(route) {
  ttm.textContent = "";
  function isMissing(s) {
   if (s == null) return true;
   const t = String(s).trim().toLowerCase();
   return !t || ["n/a", "na", "not applicable", "none", "—", "-"].includes(t);
  }
  let any = false;
  if (!isMissing(route.cargo_description)) {
   const raw = String(route.cargo_description).trim();
   const d = document.createElement("div");
   d.textContent = raw.charAt(0).toUpperCase() + raw.slice(1);
   ttm.appendChild(d);
   any = true;
  }
  if (!isMissing(route.cargo_quantity)) {
   const raw = String(route.cargo_quantity).trim();
   const d = document.createElement("div");
   d.textContent = raw.charAt(0).toUpperCase() + raw.slice(1);
   ttm.appendChild(d);
   any = true;
  }
  return any;
 }
 function showTTs(rEnt) {
  const { route, loadPe, unloadPe } = H.classifyRouteEndpoints(
   rEnt, typeof routes !== "undefined" ? routes : null, pByR
  );
  if (!route) { hideTTs(); return; }
  ttCR = route;
  ttRouteEntry = rEnt;
  ttlPe   = loadPe;
  ttuPe = unloadPe;
  ttFC = loadPe   && loadPe.stateCode   ? loadPe.stateCode   : "";
  ttTC   = unloadPe && unloadPe.stateCode ? unloadPe.stateCode : "";
  ttlSym = "departure";
  ttuSym = "arrival";
  if (loadPe) {
   let sign = ttSide(loadPe);
   if (sign === 0) sign = -1;
   tts.dataset.symbolSide = String(sign);
   tts.dataset.symbolKind = ttlSym;
   H.setTooltipLines(tts, route.load_port, route.load_date,
            ttlSym, sign < 0,
            ttFC, ttTC);
   tts.style.display = "block";
  } else {
   tts.style.display = "none";
  }
  if (unloadPe) {
   let sign = ttSide(unloadPe);
   if (sign === 0) sign = +1;
   tte.dataset.symbolSide = String(sign);
   tte.dataset.symbolKind = ttuSym;
   H.setTooltipLines(tte, route.unload_port, route.unload_date,
            ttuSym, sign < 0,
            ttFC, ttTC);
   tte.style.display = "block";
  } else {
   tte.style.display = "none";
  }
  if (fcl(route)) {
   ttm.style.background = rEnt.color || defaultRouteColor;
   ttm.style.display = "block";
  } else {
   ttm.style.display = "none";
  }
  posTTs();
 }
 function hideTTs() {
  tts.style.display = "none";
  tte.style.display   = "none";
  ttm.style.display = "none";
  ttlPe = null;
  ttuPe = null;
  ttlSym = null;
  ttuSym = null;
  ttCR = null;
  ttFC = null;
  ttTC   = null;
  ttRouteEntry = null;
  delete tts.dataset.symbolSide;
  delete tte.dataset.symbolSide;
  delete tts.dataset.symbolKind;
  delete tte.dataset.symbolKind;
 }
 function showTTp(pe) {
  ttPortEntry = pe;
  const routesArr = (typeof routes !== "undefined" && Array.isArray(routes))
   ? routes : null;
  const recs = [];
  if (pe && routesArr && rByP) {
   const reSet = rByP.get(pe.portIndex);
   if (reSet) {
    for (const re of reSet) {
     const r = routesArr[re.routeIndex];
     if (r) recs.push(r);
    }
   }
  }
  const frag = H.formatPortTT(pe, recs, hct);
  if (!frag) { hideTTp(); return; }
  ttp.textContent = "";
  ttp.appendChild(frag);
  ttp.style.display = "block";
  posTTp();
 }
 function hideTTp() {
  ttp.style.display = "none";
  ttPortEntry = null;
 }
 function posTTp() {
  if (ttp.style.display === "none") return;
  if (!ttPortEntry || !ttPortEntry.visible) { ttp.style.display = "none"; return; }
  const cw = mc.clientWidth  || 1;
  const ch = mc.clientHeight || 1;
  const sx = cw / width;
  const sy = ch / Hpx;
  const px = ttPortEntry.screenX * sx;
  const py = ttPortEntry.screenY * sy;
  const tipW = ttp.offsetWidth  || 0;
  const tipH = ttp.offsetHeight || 0;
  const tagGap = (ttPortEntry === focusEntry && focusEntry && focusEntry.portIndex != null
   && focusTag.style.display !== "none")
   ? (focusTag.offsetHeight || 0) + 4 : 0;
  let x = px - tipW / 2;
  let y = py - toy - tagGap - tipH;
  if (x + tipW > cw - 2) x = cw - tipW - 2;
  if (x < 2)             x = 2;
  if (y < 2)             y = 2;
  if (y + tipH > ch - 2) y = ch - tipH - 2;
  ({ x, y } = clampObs(x, y, tipW, tipH, cw, ch));
  ttp.style.transform = `translate(${x}px, ${y}px)`;
 }
 let lmx = null;
 let lmy = null;
 let lmV = false;
 function onPM(event) {
  const { x: mx, y: my } = H.pointerToCanvas(event, ov.node(), width, Hpx);
  lmx = mx;
  lmy = my;
  lmV = true;
  if (isDrag || isZoom) return;
  const { port, route, state } = findHv(mx, my);
  bgC.style("cursor", (port || route || state) ? "pointer" : "grab");
  if (!port && !route && !state) clrHv();
  else appHv(port, route, state);
 }
 function reHv() {
  if (!lmV || interact()) return;
  const { port, route, state } = findHv(lmx, lmy);
  if (!port && !route && !state) clrHv();
  else appHv(port, route, state);
 }
 ov.node().addEventListener("mousemove", onPM);
 ov.node().addEventListener("mouseleave", () => {
  if (isDrag || isZoom) return;
  lmV = false;
  clrHv();
 });
 ov.node().addEventListener("click", (event) => {
  if (didPan) return;
  const { x: mx, y: my } = H.pointerToCanvas(event, ov.node(), width, Hpx);
  const hit = findHv(mx, my);
  if (hit.route && !hit.port && !hit.state) {
   const rec = rArr ? rArr[hit.route.routeIndex] : null;
   const k = rec ? routeKey(rec) : null;
   if (k != null) state.update({ activatedRoute: k, activatedAt: Date.now() });
   return;
  }
  const f = H.focusInfo(hit, { rByP, rByS, rArr, routeKey });
  if (f) {
   state.update({ focus: f });
  } else if (!hit.port && !hit.route && !hit.state && state.focus) {
   state.update({ focus: null });
  }
 });
 const minZM = (_cr && _cr.minZoom) || 0.5;
 const maxZM = (_cr && _cr.maxZoom) || 200;
 function setZoomScale(newScale, anchor) {
  const clamped = Math.max(iScl * minZM, Math.min(iScl * maxZM, newScale));
  if (anchor) {
   H.zoomAroundPoint(prj, anchor.x, anchor.y, clamped, clmpRot);
  } else {
   prj.scale(clamped);
  }
  if (!isZoom) { isZoom = true; canPR(); entI(); }
  schR();
  updateZoomSlider();
  clearTimeout(zET);
  zET = setTimeout(() => {
   isZoom = false;
   mrbb();
   schR();
   if (!isDrag) exitI();
   reHv();
  }, zoomEndDebounceMs);
 }
 function updateZoomSlider() {
  zoomCtl.setHandle((prj.scale() / iScl - minZM) / (maxZM - minZM));
 }
 function setZoomFromT(t) {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  setZoomScale(iScl * (minZM + c * (maxZM - minZM)));
 }
 updateZoomSlider();
 ov.node().addEventListener("wheel", (event) => {
  if (!event.ctrlKey && !isDrag) return;
  event.preventDefault();
  const { x: mx, y: my } = H.pointerToCanvas(event, ov.node(), width, Hpx);
  lmx = mx;
  lmy = my;
  lmV = true;
  setZoomScale(prj.scale() * Math.exp(-event.deltaY * wheelZoomSensitivity), { x: mx, y: my });
 }, { passive: false });
 const ovN = ov.node();
 ovN.addEventListener("gesturestart", (e) => e.preventDefault());
 ovN.addEventListener("gesturechange", (e) => e.preventDefault());
 const tHint = htl.html`<div style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); padding:8px 14px; border-radius:18px; background:rgba(17,17,17,0.82); color:#fff; font-family:${fontFamily}; font-size:13px; font-weight:500; pointer-events:none; opacity:0; transition:opacity 0.18s ease; z-index:20; white-space:nowrap;">Use two fingers to move the map</div>`;
 mc.appendChild(tHint);
 let tHintT = null;
 function showTHint() {
  tHint.style.opacity = "1";
  clearTimeout(tHintT);
  tHintT = setTimeout(() => { tHint.style.opacity = "0"; }, 1400);
 }
 function hideTHint() { clearTimeout(tHintT); tHint.style.opacity = "0"; }
 let tActive = false;
 let tPx = 0, tPy = 0, tDist = 0;
 let t1x = 0, t1y = 0, t1Moved = false;
 function tCentroid(touches) {
  const a = touches[0], b = touches[1];
  const cx = (a.clientX + b.clientX) / 2;
  const cy = (a.clientY + b.clientY) / 2;
  return H.pointerToCanvas({ clientX: cx, clientY: cy }, ovN, width, Hpx);
 }
 function tDistOf(touches) {
  const a = touches[0], b = touches[1];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
 }
 function tBegin(touches) {
  const c = tCentroid(touches);
  tPx = c.x; tPy = c.y; tDist = tDistOf(touches);
  tActive = true;
  isDrag = true;
  didPan = false;
  canPR();
  clearTimeout(zET);
  entI();
  lmx = c.x; lmy = c.y; lmV = true;
  hideTHint();
 }
 ovN.addEventListener("touchstart", (event) => {
  if (event.touches.length >= 2) {
   tBegin(event.touches);
  } else if (event.touches.length === 1) {
   didPan = false;
   t1x = event.touches[0].clientX;
   t1y = event.touches[0].clientY;
   t1Moved = false;
  }
 }, { passive: true });
 ovN.addEventListener("touchmove", (event) => {
  if (event.touches.length >= 2) {
   if (!tActive) tBegin(event.touches);
   event.preventDefault();
   const c = tCentroid(event.touches);
   const d = tDistOf(event.touches);
   const ddx = c.x - tPx;
   const ddy = c.y - tPy;
   if (ddx || ddy) {
    didPan = true;
    const rot = prj.rotate();
    const k = dragRotationSpeed / prj.scale();
    prj.rotate(clmpRot([rot[0] + ddx * k, rot[1] - ddy * k, rot[2]]));
    lmx = c.x; lmy = c.y; lmV = true;
   }
   if (d > 0 && tDist > 0 && Math.abs(d - tDist) > 0.01) {
    setZoomScale(prj.scale() * (d / tDist), { x: c.x, y: c.y });
   } else if (ddx || ddy) {
    schR();
   }
   tPx = c.x; tPy = c.y; tDist = d;
  } else if (event.touches.length === 1 && !tActive) {
   const dx = event.touches[0].clientX - t1x;
   const dy = event.touches[0].clientY - t1y;
   if (!t1Moved && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
    t1Moved = true;
    if (Math.abs(dx) > Math.abs(dy)) showTHint();
   }
  }
 }, { passive: false });
 function tEnd(event) {
  if (event.touches.length < 2 && tActive) {
   tActive = false;
   isDrag = false;
   if (!isZoom) exitI();
   reHv();
  }
  if (event.touches.length === 0) t1Moved = false;
 }
 ovN.addEventListener("touchend", tEnd, { passive: true });
 ovN.addEventListener("touchcancel", tEnd, { passive: true });
 function adf() {
  const hoveredRouteHidden = hr && !rShown(hr);
  const hoveredPortHidden  = hvPort && pfh(hvPort);
  const hoveredStateHidden = hvSt && sfh(hvSt);
  if (hoveredRouteHidden || hoveredPortHidden || hoveredStateHidden) {
   appHv(null, null, null, null);
  } else if (hvPort) {
   showTTp(hvPort);
   rpa();
  }
  asv();
  appFade(true);
 }
 let lsHov = undefined;
 let lsLoad = state.loadRange;
 let lsDisc = state.dischargeRange;
 let lsCargo = state.hiddenCargo;
 let lsHovCargo = state.hoveredCargo;
 let lsFocus = state.focus;
 const _unsub = state.subscribe((st) => {
  if (st.hoveredRoutes !== lsHov) {
   lsHov = st.hoveredRoutes;
   if (st.hoveredRoutes !== mHov) {
    const set = st.hoveredRoutes;
    let re = null;
    if (set && set.size) {
     for (const k of set) {
      const m = reByK.get(k);
      if (m) { re = m; break; }
     }
    }
    extA = true;
    appHv(null, re, null);
    mHov = st.hoveredRoutes instanceof Set ? st.hoveredRoutes : new Set();
    extA = false;
   }
  }
  if (st.hiddenCargo !== lsCargo) {
   lsCargo = st.hiddenCargo;
   if (st.hiddenCargo !== mCargo) {
    const next = st.hiddenCargo instanceof Set ? st.hiddenCargo : new Set();
    hct = new Set(next);
    adf();
   }
  }
  if (st.hoveredCargo !== lsHovCargo) {
   lsHovCargo = st.hoveredCargo;
   const ct = (st.hoveredCargo && !(hct && hct.has(st.hoveredCargo)))
    ? st.hoveredCargo : null;
   appHv(null, null, null, ct);
   fLin = ct ? 1 : 0;
   fAn = false;
   appFade(true);
  }
  if (st.loadRange !== lsLoad || st.dischargeRange !== lsDisc) {
   lsLoad = st.loadRange;
   lsDisc = st.dischargeRange;
   adf();
  }
  if (st.focus !== lsFocus) {
   lsFocus = st.focus;
   focusSet = st.focus ? H.focusRouteSet(st.focus, rByP, rByS) : null;
   if (st.focus && st.focus.type === "port") {
    focusEntry = pEs.find(p => p.portIndex === st.focus.portIndex) || null;
   } else if (st.focus && st.focus.type === "state") {
    focusEntry = seByC.get(st.focus.code) || null;
   } else {
    focusEntry = null;
   }
   if (focusTagLabel) {
    focusTagLabel.textContent =
     st.focus && st.focus.name ? `Focus ${st.focus.name}` : "Focus";
   }
   adf();
   clrHv();
   posFocusTag();
   posTTp();
  }
 });
 invalidation.then(_unsub);
 adf();
 const rzAb = new AbortController();
 let rzF = null;
 function schRz() { if (rzF !== null) return; rzF = requestAnimationFrame(() => { rzF = null; render(); }); }
 let rzObs = null;
 let szRAF = null;
 setTimeout(() => {
  render();
  if (typeof ResizeObserver !== "undefined") {
   rzObs = new ResizeObserver(() => schRz());
   rzObs.observe(mc);
   rzObs.observe(wrapper);
  }
  window.addEventListener("resize", schRz, { signal: rzAb.signal });
  window.addEventListener("orientationchange", schRz, { signal: rzAb.signal });
  if (window.visualViewport) {
   window.visualViewport.addEventListener("resize", schRz, { signal: rzAb.signal });
  }
  const watchLoop = () => {
   const r = canvas.getBoundingClientRect();
   const bw = r.width, bh = r.height;
   if (bw > 1 && bh > 1) {
    const wantW = Math.max(1, Math.round(bw * cDpr));
    const wantH = Math.max(1, Math.round(bh * cDpr));
    if (Math.round(bw) !== Math.round(fitW) ||
        Math.round(bh) !== Math.round(fitH) ||
        canvas.width !== wantW || canvas.height !== wantH) {
     render();
    }
   }
   szRAF = requestAnimationFrame(watchLoop);
  };
  szRAF = requestAnimationFrame(watchLoop);
 }, 0);
 invalidation.then(() => {
  rzAb.abort();
  if (rzObs) { rzObs.disconnect(); rzObs = null; }
  if (szRAF) { cancelAnimationFrame(szRAF); szRAF = null; }
 });
 return wrapper;
}


function _timeline(attachCell,state,dashboardHelpers,dataRoute,d3,width,configGlobe,invalidation)
{
  attachCell;
  state;
  const { routeKey } = dashboardHelpers;

  // Reuse the same data the beeswarm uses.
  const voyages = dataRoute
    .filter(d => d.start && d.end && d.end >= d.start)
    .map((d, i) => ({ ...d, _id: i }))
    .sort((a, b) => a.start - b.start);

  // --- Canvas (uses Observable's auto-injected `width`) ---
  const height = 200;

  // --- Layout constants ---
  const dotRadius = 4;
  const lineStrokeWidth = 1;
  const edgePad = 20;                  // left/right content inset — lines the
                                       // timeline text up with the left of the
                                       // route-list arrow (row edge 12px + ~8px
                                       // for the arrow's inset within its column)
  const marginLeft = edgePad;
  const marginRight = edgePad;
  const labelFontSize = 12;            // matches .route-list summary font
  const monthAxisHeight = 18;          // a touch taller for the larger month labels
  const textToStackGap = 6;            // gap between caption/date-text and dots
  const windowEdgeToTextGap = 4;       // gap between window edge and text glyph

  // --- Time scale ---
  const [minDate, maxDate] = d3.extent(voyages.flatMap(v => [v.start, v.end]));
  const xTime = d3.scaleTime()
    .domain([minDate, maxDate])
    .range([marginLeft + dotRadius, width - marginRight - dotRadius]);

  // --- Stack offsets for same-day voyages on each row ---
  // For each row, group voyages by day key; within a group, assign each
  // voyage a vertical offset so dots stack touching (no gap), centered
  // on the row's baseline. We compute these up here (rather than at the
  // point of rendering) so we can incorporate the resulting stack
  // heights into the row centerline positions.
  const dayKey = d => d3.timeDay.floor(d).getTime();

  function computeOffsets(getDate) {
    const groups = d3.group(voyages, d => dayKey(getDate(d)));
    const offsets = new Map();
    for (const [, group] of groups) {
      const n = group.length;
      group.forEach((v, i) => {
        offsets.set(v._id, (i - (n - 1) / 2) * 2 * dotRadius);
      });
    }
    return offsets;
  }

  const topOffsets = computeOffsets(d => d.start);
  const botOffsets = computeOffsets(d => d.end);

  const maxStackHeight = (offsets) => {
    let mn = 0, mx = 0;
    for (const v of offsets.values()) {
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    return (mx - mn) + 2 * dotRadius;
  };
  const topStackH = maxStackHeight(topOffsets);
  const botStackH = maxStackHeight(botOffsets);

  // Layout, top-down:
  //   y=0  ──────────────────────── (top window top edge)
  //        windowEdgeToTextGap
  //        Top text band (caption + date-range, on same y-line)
  //        textToStackGap
  //        Top dot stack
  //   ... diagonals ...
  //        Bottom dot stack
  //        textToStackGap
  //        Bottom text band (caption + date-range)
  //        windowEdgeToTextGap
  //   y=height-monthAxisHeight ─── (bottom window bottom edge / axis top)
  //
  // Each text band's baseline sits one ascender-height below the window
  // edge it's nearest. We approximate ascender height as labelFontSize - 1.
  const topTextBaselineY = windowEdgeToTextGap + (labelFontSize - 1);
  const botTextBaselineY = (height - monthAxisHeight) - windowEdgeToTextGap - 2;
  // (the -2 accounts for descender depth so it doesn't clip the window edge)

  // Stack edges (closest to the text band):
  const topStackTop = topTextBaselineY + 2 + textToStackGap;        // +2 for descender clearance
  const botStackBot = botTextBaselineY - (labelFontSize - 1) - textToStackGap;

  const yTop = topStackTop + topStackH / 2;
  const yBottom = botStackBot - botStackH / 2;

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .style("background", `color-mix(in srgb, ${configGlobe.oceanColor} 35%, #ffffff)`)
    .style("font", `${labelFontSize}px Inter, sans-serif`)
    .style("user-select", "none");

  // --- Row captions ---
  // Captions share their baseline with the date-range text — both sit
  // inside the brush window for that row.
  const topCaption = svg.append("text")
    .attr("x", marginLeft)
    .attr("y", topTextBaselineY)
    .attr("font-family", "Inter, sans-serif")
    .attr("font-size", labelFontSize)
    .attr("font-weight", 400)
    .attr("fill", "#333")
    .text("Load date");

  const botCaption = svg.append("text")
    .attr("x", marginLeft)
    .attr("y", botTextBaselineY)
    .attr("font-family", "Inter, sans-serif")
    .attr("font-size", labelFontSize)
    .attr("font-weight", 400)
    .attr("fill", "#333")
    .text("Discharge date");

  // Bold "Date Filter" label, vertically centered between the two caption
  // rows, aligned to the left margin.
  svg.append("text")
    .attr("x", marginLeft)
    .attr("y", (topTextBaselineY + botTextBaselineY) / 2)
    .attr("dominant-baseline", "middle")
    .attr("font-family", "Inter, sans-serif")
    .attr("font-size", 20)
    .attr("font-weight", 700)
    .attr("fill", "#333")
    .text("Date Filter");

  // Brush styling — shared between the selection rect outline and the
  // range-text fill so they read as one unit.
  const brushBlue = "#1f77b4";

  // Date-range readouts: shown above the brush, centered on the scrub
  // window. Positioned (and visibility-toggled) inside applySelection so
  // they track the brush; clamped to avoid overlapping the captions.
  // Each row's text shares its baseline with the row's caption.
  const topRangeText = svg.append("text")
    .attr("y", topTextBaselineY)
    .attr("text-anchor", "middle")
    .attr("font-family", "Inter, sans-serif")
    .attr("font-size", labelFontSize)
    .attr("font-weight", 500)
    .attr("fill", brushBlue);

  const botRangeText = svg.append("text")
    .attr("y", botTextBaselineY)
    .attr("text-anchor", "middle")
    .attr("font-family", "Inter, sans-serif")
    .attr("font-size", labelFontSize)
    .attr("font-weight", 500)
    .attr("fill", brushBlue);

  // Approximate caption widths (px) — used to clamp the range text so it
  // doesn't overlap the caption. `getComputedTextLength` is unreliable
  // for detached SVGs, so estimate from glyph counts at 12px/600 Inter
  // (~7px/char average, plus a small buffer).
  const topCaptionRight = marginLeft + 66;          // "Load date" + buffer
  const botCaptionRight = marginLeft + 102;         // "Discharge date" + buffer
  const captionToRangeGap = 8;

  // Format a pixel selection as a date range using the inverted time scale.
  const fmtPxRange = (pxSel) => {
    if (!pxSel) return "";
    const f = d3.timeFormat("%b %-d");
    const a = f(xTime.invert(pxSel[0]));
    // Display only: show the end date as one day earlier, so an
    // exclusive upper boundary like Jun 1 reads as May 31. The
    // underlying selection/state is unchanged.
    const b = f(new Date(+xTime.invert(pxSel[1]) - 864e5));
    // Single-day range collapses to just the one date.
    return a === b ? a : `${a} – ${b}`;
  };

  // Approximate text width for clamping; ~6.8px/char at 12px Inter regular.
  const estTextWidth = s => s.length * 6.8;

  // --- Bottom axis: month dividers + 3-letter labels ---
  const monthStarts = d3.timeMonth.range(
    d3.timeMonth.floor(minDate),
    d3.timeMonth.offset(d3.timeMonth.floor(maxDate), 1)
  );

  const axisY = height - monthAxisHeight;
  const axisGroup = svg.append("g").attr("transform", `translate(0,${axisY})`);

  // Only draw month dividers that fall within the data range — so the
  // leftmost month line only appears if data starts exactly on day 1.
  const visibleMonthLines = monthStarts.filter(d => d >= minDate && d <= maxDate);

  axisGroup.selectAll("line.tick")
    .data(visibleMonthLines)
    .join("line")
      .attr("class", "tick")
      .attr("x1", d => xTime(d))
      .attr("x2", d => xTime(d))
      .attr("y1", 0)
      .attr("y2", monthAxisHeight)
      .attr("stroke", "#ddd")
      .attr("shape-rendering", "crispEdges");

  axisGroup.selectAll("text.month")
    .data(monthStarts)
    .join("text")
      .attr("class", "month")
      .attr("x", d => {
        const next = d3.timeMonth.offset(d, 1);
        const lo = Math.max(+d, +minDate);
        const hi = Math.min(+next, +maxDate);
        return (xTime(lo) + xTime(hi)) / 2;
      })
      .attr("y", monthAxisHeight / 2)
      .attr("dominant-baseline", "central")
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif")
      .attr("fill", "#333")
      .text(d => d3.timeFormat("%b")(d));

  // --- Diagonal connector lines ---
  const linesG = svg.append("g");
  const lines = linesG.selectAll("line")
    .data(voyages, d => d._id)
    .join("line")
      .attr("x1", d => xTime(d.start))
      .attr("y1", d => yTop + topOffsets.get(d._id))
      .attr("x2", d => xTime(d.end))
      .attr("y2", d => yBottom + botOffsets.get(d._id))
      .attr("stroke", d => d.color);

  // --- Top row dots ---
  const topDots = svg.append("g").selectAll("circle")
    .data(voyages, d => d._id)
    .join("circle")
      .attr("cx", d => xTime(d.start))
      .attr("cy", d => yTop + topOffsets.get(d._id))
      .attr("r", dotRadius)
      .attr("fill", d => d.color);
  topDots.append("title")
    .text(d => `${d.name}\nLoad: ${d3.timeFormat("%b %d, %Y")(d.start)}\nDischarge: ${d3.timeFormat("%b %d, %Y")(d.end)}\n${d.load_port} → ${d.unload_port}`);

  // --- Bottom row markers: arrowheads tangent to each connector line,
  // pointing in the load -> discharge direction (replaces the discharge
  // dots). An equilateral triangle drawn pointing +x in local space (its
  // centroid at the origin), then rotated to the line's angle. ---
  const aR = dotRadius * 1.5;            // circumradius (centroid-centered)
  const aY = aR * 0.8660254;             // sin(60deg) * R
  const ARROW_PATH = `M ${aR} 0 L ${-aR / 2} ${aY} L ${-aR / 2} ${-aY} Z`;
  const arrowTransform = (d) => {
    const x1 = xTime(d.start), y1 = yTop + topOffsets.get(d._id);
    const x2 = xTime(d.end),   y2 = yBottom + botOffsets.get(d._id);
    const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    return `translate(${x2},${y2}) rotate(${ang})`;
  };
  const botDots = svg.append("g").selectAll("path")
    .data(voyages, d => d._id)
    .join("path")
      .attr("d", ARROW_PATH)
      .attr("transform", arrowTransform)
      .attr("fill", d => d.color);
  botDots.append("title")
    .text(d => `${d.name}\nLoad: ${d3.timeFormat("%b %d, %Y")(d.start)}\nDischarge: ${d3.timeFormat("%b %d, %Y")(d.end)}\n${d.load_port} → ${d.unload_port}`);

  // --- Brushes ---
  // Selection state is just the raw pixel range [px0, px1] from d3-brush
  // (or null when there is no selection).
  let topSel = null;
  let botSel = null;

  // Convert a pixel selection to a [Date, Date] range for publishing to
  // shared state. Returns null when the selection is null.
  const pxSelToDateRange = (sel) => {
    if (!sel) return null;
    return [xTime.invert(sel[0]), xTime.invert(sel[1])];
  };

  // Selection-driven opacity styling. Hovered routes get a thicker
  // stroke and full opacity; non-hovered items get their selection-
  // driven baseline (visible if in-range, dim if filtered out).
  // No fade animation — hover is a snap.
  const HOVER_STROKE_WIDTH = 3;
  const LINE_OP_SELECTED = 0.85;
  const LINE_OP_UNSEL    = 0.08;
  const DOT_OP_SELECTED  = 1;
  const DOT_OP_UNSEL     = 0.12;
  // When a hover is active, non-hovered (but still in-range) routes dim so the
  // hovered one(s) stand out. Applied as a snap, matching the globe.
  const LINE_OP_HOVER_DIM = 0.13;
  const DOT_OP_HOVER_DIM  = 0.15;

  const isSelected = (d) => {
    // Cargo filter shared from the globe legend.
    const hc = state.hiddenCargo;
    if (hc && hc.size && d.cargo_type && hc.has(d.cargo_type)) return false;
    // Focus filter (port/state) shared from the globe.
    const focus = state.focus;
    if (focus && focus.keys instanceof Set && !focus.keys.has(routeKey(d))) return false;
    const inPxRange = (px, sel) => !sel || (px >= sel[0] && px <= sel[1]);
    return inPxRange(xTime(d.start), topSel) && inPxRange(xTime(d.end), botSel);
  };
  // Only relevant when BOTH date filters are active: a route whose load dot
  // (circle) is outside the load window AND whose discharge marker (triangle)
  // is outside the discharge window is entirely unrelated to the current
  // selection, so its connector line is hidden completely rather than just
  // dimmed. Requires both windows to exist — with only one filter applied a
  // route can't be "outside both".
  const bothEndpointsOutside = (d) => {
    if (!topSel || !botSel) return false;
    const loadPx = xTime(d.start), discPx = xTime(d.end);
    const loadIn = loadPx >= topSel[0] && loadPx <= topSel[1];
    const discIn = discPx >= botSel[0] && discPx <= botSel[1];
    return !loadIn && !discIn;
  };
  // A route only counts as "hovered" if it also passes the current
  // selection filter — emphasizing a filtered-out route would be
  // confusing, since it's visually faded into the background.
  const isHovered = (d) => {
    if (!isSelected(d)) return false;
    const hs = state.hoveredRoutes;
    if (!hs || hs.size === 0) return false;
    return hs.has(routeKey(d));
  };

  // Set while the cursor is over a timeline route (i.e. a hover that
  // originated in THIS cell). Declared up here because applyStyles, called
  // during initial render below, reads it.
  let hoveredVoyage = null;

  function applyStyles() {
    const hs = state.hoveredRoutes;
    const hovering = !!(hs && hs.size > 0);
    // Dim the non-hovered routes only when the highlight comes from another
    // cell. Hovering a route within the timeline itself just bolds that one
    // route and leaves the rest at full opacity.
    const external = hovering && !hoveredVoyage;
    // Only individual route hovers thicken the stroke; port/state/cargo
    // hovers keep the matched routes at full opacity but don't bold them.
    const boldKind = state.hoverKind === "route";
    const lineOp = (d) => {
      if (bothEndpointsOutside(d)) return 0;
      if (!isSelected(d)) return LINE_OP_UNSEL;
      if (external) return isHovered(d) ? LINE_OP_SELECTED : LINE_OP_HOVER_DIM;
      return LINE_OP_SELECTED;
    };
    const dotOp = (d) => {
      if (!isSelected(d)) return DOT_OP_UNSEL;
      if (external) return isHovered(d) ? DOT_OP_SELECTED : DOT_OP_HOVER_DIM;
      return DOT_OP_SELECTED;
    };

    topDots.attr("opacity", dotOp);
    botDots.attr("opacity", dotOp);
    lines
      .attr("opacity", lineOp)
      .attr("stroke-width", d => (boldKind && isHovered(d)) ? HOVER_STROKE_WIDTH : lineStrokeWidth);
    // Bring highlighted lines to the front (so a bold stroke isn't covered,
    // and full-opacity routes sit above the dimmed ones).
    lines.filter(d => isHovered(d)).raise();
  }

  const applySelection = ({ publish = true } = {}) => {
    applyStyles();

    // Position range text: centered on the brush midpoint, with 2px
    // padding between the text and the brush window edges, then clamped
    // against the caption on the left and the pill on the right. Hide
    // entirely if there is no selection.
    const windowEdgePad = 2;
    const placeRangeText = (textSel, sel, captionRight) => {
      const label = sel ? fmtPxRange(sel) : "";
      textSel.text(label);
      if (!sel) {
        textSel.style("display", "none");
        return;
      }
      const w = estTextWidth(label);
      const halfW = w / 2;
      const midPx = (sel[0] + sel[1]) / 2;

      // Outer clamps (chart-level limits)
      const rightLimit = (width - edgePad) - pillW - captionToRangeGap;
      const leftLimit = captionRight + captionToRangeGap;
      const outerMinCx = leftLimit + halfW;
      const outerMaxCx = rightLimit - halfW;

      // Inner clamps (keep text inside the brush window with 2px padding)
      const winLeft = sel[0] + windowEdgePad;
      const winRight = sel[1] - windowEdgePad;
      const innerMinCx = winLeft + halfW;
      const innerMaxCx = winRight - halfW;

      const fitsInWindow = innerMinCx <= innerMaxCx;
      const minCx = fitsInWindow ? Math.max(outerMinCx, innerMinCx) : outerMinCx;
      const maxCx = fitsInWindow ? Math.min(outerMaxCx, innerMaxCx) : outerMaxCx;
      const cx = Math.min(Math.max(midPx, minCx), Math.max(maxCx, minCx));
      textSel
        .attr("x", cx)
        .style("display", null);
    };

    placeRangeText(topRangeText, topSel, topCaptionRight);
    placeRangeText(botRangeText, botSel, botCaptionRight);

    clearBtn.style("display", (topSel || botSel) ? null : "none");

    // Publish the converted date ranges to shared state. Only call
    // update() if a range actually changed, since update() notifies all
    // subscribers and we don't want to thrash on identical writes.
    // Skip publishing entirely when invoked as part of a programmatic
    // brush sync (publish: false) — in that case the state is already
    // authoritative and re-publishing would race with the in-flight
    // sync (overwriting the other brush's range with a stale value).
    if (publish) {
      const newLoad = pxSelToDateRange(topSel);
      const newDisc = pxSelToDateRange(botSel);
      const sameRange = (a, b) =>
        (a == null && b == null) ||
        (a != null && b != null && +a[0] === +b[0] && +a[1] === +b[1]);
      if (!sameRange(newLoad, state.loadRange) ||
          !sameRange(newDisc, state.dischargeRange)) {
        state.update({ loadRange: newLoad, dischargeRange: newDisc });
      }
    }
  };

  function makeRowBrush(topY, bottomY, onChange) {
    const brush = d3.brushX()
      .extent([
        // Let the brush reach the chart edges, not just the data range —
        // dragging to an edge selects a little past the first/last date
        // (the time scale extrapolates), which is intended.
        [0, topY],
        [width, bottomY]
      ])
      .on("start", (event) => {
        // User started dragging/creating a brush window: drop any active
        // hover so the chart instantly shows all in-range routes.
        if (event.sourceEvent) clearHoverForBrush();
      })
      .on("brush end", (event) => {
        onChange(event.selection);
        // Programmatic brush moves (event.sourceEvent === null) are
        // already reflecting state — don't publish back, or we race
        // with an in-flight multi-brush sync.
        applySelection({ publish: !!event.sourceEvent });
      });

    const g = svg.append("g").attr("class", "brush").call(brush);

    g.select(".overlay").attr("cursor", "crosshair");
    g.select(".selection")
      .attr("fill", brushBlue)
      .attr("fill-opacity", 0.12)
      .attr("stroke", brushBlue)
      .attr("stroke-opacity", 0.7);

    return { brush, g };
  }

  // Brush extents per row. The window wraps the caption+date-range text
  // band on one side and the dot stack on the other.
  const rangeTextBandTop = 0;                            // top window starts at SVG top
  const rangeTextBandBot = height - monthAxisHeight;     // bottom window ends at axis

  // Compute per-row outer bounds for dots
  const topRowDotTop = yTop - topStackH / 2 - dotRadius;
  const topRowDotBot = yTop + topStackH / 2 + dotRadius;
  const botRowDotTop = yBottom - botStackH / 2 - dotRadius;
  const botRowDotBot = yBottom + botStackH / 2 + dotRadius;

  const topBrush = makeRowBrush(
    rangeTextBandTop,              // extend up over the date-range text
    topRowDotBot + 2,
    sel => topSel = sel
  );
  const botBrush = makeRowBrush(
    botRowDotTop - 2,
    rangeTextBandBot - 1,          // extend down over the date-range text
    sel => botSel = sel
  );

  // --- Clear pill button, top-right ---
  // Sized to match the chart's label font (labelFontSize = 12). Height
  // is label + vertical padding; X glyph and label estimates scale
  // off labelFontSize so the pill stays balanced if the font changes.
  const pillFontSize = labelFontSize;
  const pillH = pillFontSize + 10;          // ~22 at 12px font
  const pillPadX = 11;                       // horizontal padding inside the pill
  const labelText = "Clear";
  const xMarkSize = Math.round(pillFontSize * 0.72);  // ✕ size, ~9 at 12px font
  const gapBetween = pillPadX;   // equal to pillPadX so left+right of ✕ are visually balanced
  // Estimate label width (getComputedTextLength is unreliable for detached
  // SVGs). Inter at 12/600 measures ~6.5px/char average for "Clear".
  const labelWidthEstimate = labelText.length * 6.5;

  // Anchor at top-right; we'll translate after sizing.
  const clearBtn = svg.append("g")
    .attr("class", "clear-btn")
    .attr("cursor", "pointer")
    .style("display", "none")
    .on("click", () => {
      // Publish the cleared state — the subscriber will sync both
      // brushes via brush.move(null). Doing it locally without
      // publishing would leave state out of sync, and the next
      // state.update from anywhere else would re-sync the brushes
      // back to the stale ranges.
      state.update({ loadRange: null, dischargeRange: null });
    });

  // Background pill (rx = half height for full pill shape)
  const xMarkCx = pillPadX + labelWidthEstimate + gapBetween + xMarkSize / 2;
  const pillW = xMarkCx + xMarkSize / 2 + pillPadX;

  clearBtn.append("rect")
    .attr("x", 0).attr("y", 0)
    .attr("width", pillW)
    .attr("height", pillH)
    .attr("rx", pillH / 2)
    .attr("ry", pillH / 2)
    .attr("fill", "#fff")
    .attr("stroke", "#888")
    .attr("stroke-width", 1);

  // "Clear" label
  clearBtn.append("text")
    .attr("x", pillPadX)
    .attr("y", pillH / 2)
    .attr("dominant-baseline", "central")
    .attr("font-family", "Inter, sans-serif")
    .attr("font-size", pillFontSize)
    .attr("font-weight", 600)
    .attr("fill", "#444")
    .text(labelText);

  // ✕ glyph
  clearBtn.append("path")
    .attr("d", `M ${xMarkCx - xMarkSize / 2} ${pillH / 2 - xMarkSize / 2} L ${xMarkCx + xMarkSize / 2} ${pillH / 2 + xMarkSize / 2} M ${xMarkCx + xMarkSize / 2} ${pillH / 2 - xMarkSize / 2} L ${xMarkCx - xMarkSize / 2} ${pillH / 2 + xMarkSize / 2}`)
    .attr("stroke", "#666")
    .attr("stroke-width", 1.6)
    .attr("stroke-linecap", "round")
    .attr("fill", "none");

  // Position pill at top-right, edgePad from the right edge (so it lines up
  // with the right-hand content inset), 2px from the top.
  clearBtn.attr("transform", `translate(${width - pillW - edgePad}, 2)`);

  clearBtn.append("title").text("Clear selection");

  // The brushes were appended after the captions/range text/pill, so
  // they currently sit on top in document order — which means the
  // brush's overlay would cover them. Raise these above the brush layer
  // so they remain visible and clickable.
  topCaption.raise();
  botCaption.raise();
  topRangeText.raise();
  botRangeText.raise();
  clearBtn.raise();

  // Make text non-interactive so it doesn't intercept brush drag events.
  topCaption.attr("pointer-events", "none");
  botCaption.attr("pointer-events", "none");
  topRangeText.attr("pointer-events", "none");
  botRangeText.attr("pointer-events", "none");

  applySelection();

  // --- Hover: hit-test the diagonal lines, publish to state.hoveredRoutes ---
  // Distance² from point (px,py) to segment (ax,ay)–(bx,by).
  const HOVER_HIT_THRESHOLD_SQ = 6 * 6;  // 6px tolerance
  function distSqToSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) {
      const ex = px - ax, ey = py - ay;
      return ex * ex + ey * ey;
    }
    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx, cy = ay + t * dy;
    const ex = px - cx, ey = py - cy;
    return ex * ex + ey * ey;
  }
  // Precompute each voyage's endpoint coords so the hit test is cheap.
  const voyageEndpoints = voyages.map(d => ({
    voyage: d,
    x1: xTime(d.start), y1: yTop + topOffsets.get(d._id),
    x2: xTime(d.end),   y2: yBottom + botOffsets.get(d._id),
  }));

  // Convert client (mouse) coords to SVG viewBox coords. The SVG uses a
  // viewBox of (0,0,width,height) and the rendered size may differ, so
  // we scale manually rather than using getBoundingClientRect alone.
  function clientToSvg(event) {
    const rect = svg.node().getBoundingClientRect();
    const sx = width  / rect.width;
    const sy = height / rect.height;
    return {
      x: (event.clientX - rect.left) * sx,
      y: (event.clientY - rect.top)  * sy,
    };
  }

  // The most recent Set this cell sent to state.hoveredRoutes. Used by
  // the subscriber to detect whether an incoming change originated here
  // (animate) or from another cell (snap).
  let myLastHoverSet = null;
  function publishHover(voyage) {
    if (voyage === hoveredVoyage) return;
    hoveredVoyage = voyage;
    const key = voyage ? routeKey(voyage) : null;
    const next = new Set();
    if (key) next.add(key);
    myLastHoverSet = next;
    state.update({ hoveredRoutes: next, hoverKind: key ? "route" : null });
    applyStyles();
  }

  // Clear any active hover (from this cell or another) and restyle so all
  // in-range routes show at full opacity. Used when a brush gesture begins,
  // since the line hit-test is suppressed while a button is held and would
  // otherwise leave a stale highlight stuck during the drag.
  function clearHoverForBrush() {
    const hs = state.hoveredRoutes;
    if (!hoveredVoyage && !(hs && hs.size > 0)) return;
    hoveredVoyage = null;
    const empty = new Set();
    myLastHoverSet = empty;
    state.update({ hoveredRoutes: empty, hoverKind: null });
    applyStyles();
  }

  svg.node().addEventListener("mousemove", (event) => {
    // Don't hit-test while a mouse button is held — that's a brush drag.
    if (event.buttons !== 0) return;
    const { x: mx, y: my } = clientToSvg(event);
    let best = null, bestSq = HOVER_HIT_THRESHOLD_SQ;
    for (const ep of voyageEndpoints) {
      // Skip filtered-out routes: hovering them would be a no-op
      // visually, and we don't want to publish a hover for a line that
      // the chart is rendering as dimmed.
      if (!isSelected(ep.voyage)) continue;
      const dSq = distSqToSeg(mx, my, ep.x1, ep.y1, ep.x2, ep.y2);
      if (dSq < bestSq) { bestSq = dSq; best = ep.voyage; }
    }
    publishHover(best);
  });
  svg.node().addEventListener("mouseleave", () => publishHover(null));

  // Single-click a line: open + scroll to that route in the route list.
  // Hit-tests selected (visible) lines only, mirroring hover.
  svg.node().addEventListener("click", (event) => {
    const { x: mx, y: my } = clientToSvg(event);
    let best = null, bestSq = HOVER_HIT_THRESHOLD_SQ;
    for (const ep of voyageEndpoints) {
      if (!isSelected(ep.voyage)) continue;
      const dSq = distSqToSeg(mx, my, ep.x1, ep.y1, ep.x2, ep.y2);
      if (dSq < bestSq) { bestSq = dSq; best = ep.voyage; }
    }
    if (!best) return;
    const k = routeKey(best);
    if (k != null) state.update({ activatedRoute: k, activatedAt: Date.now() });
  });

  // Double-click a line: set both date ranges to a ±0.49 day window
  // centered on the route's load_date / unload_date. The 0.49 day
  // half-width (~11h 45m) is narrow enough that adjacent days at
  // midnight fall outside the window, so only the target day is
  // highlighted — not the next one. Hit-tests ALL lines (not just
  // selected ones), so a faded-out line can be brought back into focus.
  const HALF_WINDOW_MS = 0.49 * 24 * 60 * 60 * 1000;
  const windowAround = (date) => [
    new Date(+date - HALF_WINDOW_MS),
    new Date(+date + HALF_WINDOW_MS),
  ];
  svg.node().addEventListener("dblclick", (event) => {
    const { x: mx, y: my } = clientToSvg(event);
    let best = null, bestSq = HOVER_HIT_THRESHOLD_SQ;
    for (const ep of voyageEndpoints) {
      const dSq = distSqToSeg(mx, my, ep.x1, ep.y1, ep.x2, ep.y2);
      if (dSq < bestSq) { bestSq = dSq; best = ep.voyage; }
    }
    if (!best) return;
    event.preventDefault();
    event.stopPropagation();
    const newLoad = windowAround(best.start);
    const newDisc = windowAround(best.end);
    // Move both brushes locally first so the windows appear immediately
    // and unconditionally, then publish to state for the other cells.
    // Programmatic brush.move calls have sourceEvent === null, so the
    // brush handler's `publish: false` branch runs — no feedback loop.
    topBrush.g.call(topBrush.brush.move, dateRangeToPxSel(newLoad));
    botBrush.g.call(botBrush.brush.move, dateRangeToPxSel(newDisc));
    state.update({ loadRange: newLoad, dischargeRange: newDisc });
  });

  // React to external state changes: if another cell clears or sets a
  // range, sync the brushes to match. Skip when the incoming value is
  // already what the brush shows (the common case: state changes that
  // originated from our own applySelection call).
  const dateRangeMatchesPxSel = (range, pxSel) => {
    if (!range && !pxSel) return true;
    if (!range || !pxSel) return false;
    return +range[0] === +xTime.invert(pxSel[0]) &&
           +range[1] === +xTime.invert(pxSel[1]);
  };
  const dateRangeToPxSel = (range) => {
    if (!range) return null;
    return [xTime(range[0]), xTime(range[1])];
  };
  let lastHoveredRoutes = undefined;
  let lastHiddenCargo = undefined;
  let lastFocus = undefined;
  const unsubscribe = state.subscribe((s) => {
    if (!dateRangeMatchesPxSel(s.loadRange, topSel)) {
      topBrush.g.call(topBrush.brush.move, dateRangeToPxSel(s.loadRange));
    }
    if (!dateRangeMatchesPxSel(s.dischargeRange, botSel)) {
      botBrush.g.call(botBrush.brush.move, dateRangeToPxSel(s.dischargeRange));
    }
    if (s.hiddenCargo !== lastHiddenCargo || s.focus !== lastFocus) {
      lastHiddenCargo = s.hiddenCargo;
      lastFocus = s.focus;
      applyStyles();
    }
    if (s.hoveredRoutes !== lastHoveredRoutes) {
      lastHoveredRoutes = s.hoveredRoutes;
      // If the change came from another cell (not our own publishHover),
      // re-style to reflect the new hover. Our own publishes already
      // called applyStyles synchronously, so skip the redundant call.
      if (s.hoveredRoutes !== myLastHoverSet) {
        applyStyles();
      }
    }
  });
  invalidation.then(unsubscribe);

  return svg.node();
}


function _routeList(attachCell,state,dashboardHelpers,globeRoutesHelpers,routes,html,configGlobe,flag,d3,getComputedStyle,invalidation)
{
  attachCell;
  state;
  const { tag, routeKey } = dashboardHelpers;

  const width = 400;
  const CARGO_PILL_MAX_CHARS = 17;
  // Left inset of the row content — the chevron column starts here.
  const LEFT_PAD = 12;
  // The chevron glyph is centered inside an 18px-wide column and rotated
  // -135deg, so its visible left edge sits ~8px inside that column (i.e.
  // ~8px to the right of LEFT_PAD). Pad the Filters/Sort header bars to
  // that spot so their text lines up with the left of the arrow rather
  // than with the row's padding edge.
  const HEADER_PAD = LEFT_PAD + 8;   // ~= 20px, aligned to the chevron glyph

  const hasValue = (s) => {
    if (s == null) return false;
    const t = String(s).trim().toLowerCase();
    if (!t) return false;
    return !["n/a", "na", "not applicable", "none", "—", "-",
             "pending response", "pending", "tbd", "unknown"].includes(t);
  };

  // Black or white text based on background luminance (WCAG sRGB).
  const textOn = (hex) => {
    if (!hex) return "#000";
    const m = String(hex).trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return "#000";
    let h = m[1];
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const lin = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    return L > 0.5 ? "#000" : "#fff";
  };

  // Split a string on " / " (space-slash-space) into multiple lines.
  // Internal slashes like "12/25/2024" are left alone.
  const breakOnSlash = (s) => {
    if (s == null) return "—";
    const str = String(s);
    const parts = str.split(" / ");
    if (parts.length === 1) return str;
    const frag = document.createDocumentFragment();
    parts.forEach((part, i) => {
      if (i > 0) frag.appendChild(document.createElement("br"));
      frag.appendChild(document.createTextNode(part));
    });
    return frag;
  };

  const parseDate = (s) => {
    if (!hasValue(s)) return -Infinity;
    const t = Date.parse(String(s).split(" / ")[0]);
    return Number.isNaN(t) ? -Infinity : t;
  };

  // Parse a US 2-letter state code from a port string. Checks: trailing
  // ", XX", any 2-letter piece, or a spelled-out state name.
  const _nameToCode = (typeof globeRoutesHelpers !== "undefined"
                       && globeRoutesHelpers
                       && globeRoutesHelpers.stateNameToCode) || {};
  const _validCodes = new Set(Object.values(_nameToCode));
  const stateFromPort = (port) => {
    if (!hasValue(port)) return null;
    const str = String(port).trim();
    const tail = str.match(/,\s*([A-Z]{2})\s*$/);
    if (tail && (_validCodes.size === 0 || _validCodes.has(tail[1]))) {
      return tail[1];
    }
    const pieces = str.split(",").map(s => s.trim()).filter(Boolean);
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      if (/^[A-Za-z]{2}$/.test(p)) {
        const up = p.toUpperCase();
        if (_validCodes.size === 0 || _validCodes.has(up)) return up;
      }
      const named = _nameToCode[p.toLowerCase()];
      if (named) return named;
    }
    return null;
  };

  const portsOfRoute = (v, which = "both") => {
    const out = [];
    const fields = [];
    if (which === "load"   || which === "both") fields.push(v.load_port);
    if (which === "unload" || which === "both") fields.push(v.unload_port);
    for (const field of fields) {
      if (!hasValue(field)) continue;
      for (const p of String(field).split(" / ")) {
        const port = p.trim();
        if (!port) continue;
        out.push({ port, state: stateFromPort(port) });
      }
    }
    return out;
  };

  const cargoOfRoute = (v) => hasValue(v.cargo_type) ? String(v.cargo_type).trim() : null;

  const shortenDate = (s) => {
    if (!hasValue(s)) return s;
    return String(s)
      .replace(/\b(\d{2})(\d{2})-(\d{2})-(\d{2})\b/g, "$2-$3-$4")
      .replace(/(\d{1,2}\/\d{1,2}\/)(\d{2})(\d{2})\b/g, "$1$3")
      .replace(/(,\s*)(\d{2})(\d{2})\b/g, "$1$3");
  };

  const formatDate = (d) => {
    if (!(d instanceof Date) || isNaN(d.getTime())) return "—";
    const m  = d.getUTCMonth() + 1;
    const dd = d.getUTCDate();
    const yy = d.getUTCFullYear() % 100;
    return `${m}/${dd}/${String(yy).padStart(2, "0")}`;
  };

  const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const ordinalSuffix = (n) => {
    const v = n % 100;
    if (v >= 11 && v <= 13) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };
  const formatDateLong = (d) => {
    if (!(d instanceof Date) || isNaN(d.getTime())) return null;
    const y = d.getUTCFullYear();
    if (y < 2000 || y >= 2100) return null;
    const month = MONTH_NAMES[d.getUTCMonth()];
    const day = d.getUTCDate();
    return `${month} ${day}${ordinalSuffix(day)} ${y}`;
  };

  const parseDateLoose = (s) => {
    if (!hasValue(s)) return null;
    const t = Date.parse(String(s).trim());
    if (Number.isNaN(t)) return null;
    const d = new Date(t);
    const y = d.getUTCFullYear();
    if (y < 2000 || y >= 2100) return null;
    return d;
  };
  // Hyphen = continuous range ("April 13-15th"). Space-slash-space =
  // two distinct events ("April 16th and 22nd"). Spaces around the
  // slash prevent splitting "4/5/2026" on its internal slashes.
  const RANGE_SEP_DASH_RE  = /\s*[-–—]\s*/;
  const RANGE_SEP_SLASH_RE = /\s+\/\s+/;
  const formatDateRangeLong = (str, fallbackDate) => {
    if (hasValue(str)) {
      const trimmed = String(str).trim();
      let parts = null, joiner = null;
      if (RANGE_SEP_SLASH_RE.test(trimmed)) {
        parts = trimmed.split(RANGE_SEP_SLASH_RE);
        joiner = "and";
      } else if (RANGE_SEP_DASH_RE.test(trimmed)) {
        parts = trimmed.split(RANGE_SEP_DASH_RE);
        joiner = "range";
      }
      if (parts) {
        const cleaned = parts.map(s => s.trim()).filter(Boolean);
        if (cleaned.length >= 2) {
          const d1 = parseDateLoose(cleaned[0]);
          const d2 = parseDateLoose(cleaned[cleaned.length - 1]);
          if (d1 && d2) return renderTwoDates(d1, d2, joiner);
          if (d1) return formatDateLong(d1);
          if (d2) return formatDateLong(d2);
        }
      }
    }
    return formatDateLong(fallbackDate);
  };
  function renderTwoDates(d1, d2, joiner) {
    const m1 = d1.getUTCMonth(), m2 = d2.getUTCMonth();
    const y1 = d1.getUTCFullYear(), y2 = d2.getUTCFullYear();
    const day1 = d1.getUTCDate(), day2 = d2.getUTCDate();
    if (joiner === "range") {
      if (y1 === y2 && m1 === m2) {
        return `${MONTH_NAMES[m1]} ${day1}-${day2}${ordinalSuffix(day2)} ${y1}`;
      }
      if (y1 === y2) {
        return `${MONTH_NAMES[m1]} ${day1}${ordinalSuffix(day1)}` +
               ` - ${MONTH_NAMES[m2]} ${day2}${ordinalSuffix(day2)} ${y1}`;
      }
      return `${formatDateLong(d1)} - ${formatDateLong(d2)}`;
    }
    if (y1 === y2 && m1 === m2) {
      return `${MONTH_NAMES[m1]} ${day1}${ordinalSuffix(day1)}` +
             ` and ${day2}${ordinalSuffix(day2)} ${y1}`;
    }
    if (y1 === y2) {
      return `${MONTH_NAMES[m1]} ${day1}${ordinalSuffix(day1)}` +
             ` and ${MONTH_NAMES[m2]} ${day2}${ordinalSuffix(day2)} ${y1}`;
    }
    return `${formatDateLong(d1)} and ${formatDateLong(d2)}`;
  }

  const stateOfEndpoint = (portField) => {
    for (const { state } of portsOfRoute({ load_port: portField, unload_port: null }, "load")) {
      if (state) return state;
    }
    return null;
  };

  // Plausible date range; years outside this are treated as missing.
  const PLAUSIBLE_MIN = Date.UTC(2000, 0, 1);
  const PLAUSIBLE_MAX = Date.UTC(2100, 0, 1);
  const plausible = (t) =>
    Number.isFinite(t) && t >= PLAUSIBLE_MIN && t < PLAUSIBLE_MAX;
  const startMillis = (v) => {
    if (v.start instanceof Date && !isNaN(v.start.getTime())) {
      const t = v.start.getTime();
      if (plausible(t)) return t;
    }
    return parseDate(v.load_date);
  };
  const endMillis = (v) => {
    if (v.end instanceof Date && !isNaN(v.end.getTime())) {
      const t = v.end.getTime();
      if (plausible(t)) return t;
    }
    return parseDate(v.unload_date);
  };

  // Filter against state ranges + the shared cargo filter. A route passes
  // when its cargo type isn't hidden and both its load and discharge dates
  // fall inside their range (or the range is null).
  const filterRoutes = () => {
    const loadRange = state.loadRange;
    const discRange = state.dischargeRange;
    const hiddenCargo = state.hiddenCargo;
    const cargoActive = hiddenCargo && hiddenCargo.size > 0;
    const focus = state.focus;
    const focusKeys = focus && focus.keys instanceof Set ? focus.keys : null;
    if (!loadRange && !discRange && !cargoActive && !focusKeys) return routes.slice();
    const lo1 = loadRange ? +loadRange[0] : null;
    const hi1 = loadRange ? +loadRange[1] : null;
    const lo2 = discRange ? +discRange[0] : null;
    const hi2 = discRange ? +discRange[1] : null;
    return routes.filter(v => {
      if (focusKeys && !focusKeys.has(routeKey(v))) return false;
      if (cargoActive) {
        const ct = cargoOfRoute(v);
        if (ct && hiddenCargo.has(ct)) return false;
      }
      if (loadRange) {
        const t = startMillis(v);
        if (!plausible(t) || t < lo1 || t > hi1) return false;
      }
      if (discRange) {
        const t = endMillis(v);
        if (!plausible(t) || t < lo2 || t > hi2) return false;
      }
      return true;
    });
  };

  // Date sorts ascending, others descending. Missing dates always sort last.
  const sortRoutes = (key, rowsIn) => {
    const rows = rowsIn.slice();
    const cmpDateAsc = (da, db) => {
      const aMissing = da === -Infinity, bMissing = db === -Infinity;
      if (aMissing && bMissing) return 0;
      if (aMissing) return 1;
      if (bMissing) return -1;
      return da - db;
    };
    if (key === "start") {
      rows.sort((a, b) => cmpDateAsc(startMillis(a), startMillis(b)));
      return rows;
    }
    if (key === "end") {
      rows.sort((a, b) => cmpDateAsc(endMillis(a), endMillis(b)));
      return rows;
    }
    if (key === "cargo") {
      const counts = new Map();
      for (const v of rows) {
        const c = cargoOfRoute(v);
        if (c == null) continue;
        counts.set(c, (counts.get(c) || 0) + 1);
      }
      rows.sort((a, b) => {
        const ca = cargoOfRoute(a), cb = cargoOfRoute(b);
        const na = ca == null ? -1 : (counts.get(ca) || 0);
        const nb = cb == null ? -1 : (counts.get(cb) || 0);
        if (nb !== na) return nb - na;
        if (ca !== cb) return (ca || "").localeCompare(cb || "");
        return startMillis(b) - startMillis(a);
      });
      return rows;
    }
    if (key === "state") {
      // Rank each route by the count of its most-trafficked state.
      const statesByRoute = new Map();
      const counts = new Map();
      for (const v of rows) {
        const set = new Set();
        for (const { state } of portsOfRoute(v, "both")) {
          if (state) set.add(state);
        }
        statesByRoute.set(v, set);
        for (const s of set) counts.set(s, (counts.get(s) || 0) + 1);
      }
      rows.stateCounts = counts;
      const anchorByRoute = new Map();
      for (const v of rows) {
        const set = statesByRoute.get(v);
        let best = null, bestCount = -1;
        for (const s of set) {
          const c = counts.get(s) || 0;
          if (c > bestCount || (c === bestCount && (best == null || s < best))) {
            best = s; bestCount = c;
          }
        }
        anchorByRoute.set(v, { state: best, count: best == null ? -1 : bestCount });
      }
      rows.sort((a, b) => {
        const aa = anchorByRoute.get(a), bb = anchorByRoute.get(b);
        if (aa.state == null && bb.state != null) return 1;
        if (bb.state == null && aa.state != null) return -1;
        if (bb.count !== aa.count) return bb.count - aa.count;
        if (aa.state !== bb.state) {
          return String(aa.state || "").localeCompare(String(bb.state || ""));
        }
        return startMillis(b) - startMillis(a);
      });
      return rows;
    }
    if (key === "departure" || key === "entry") {
      const which = key === "departure" ? "load" : "unload";
      const expanded = [];
      for (const v of rows) {
        const seen = new Set();
        for (const { port } of portsOfRoute(v, which)) {
          if (!port) continue;
          if (seen.has(port)) continue;
          seen.add(port);
          expanded.push({ row: v, port, groupKey: port });
        }
        if (seen.size === 0) {
          expanded.push({ row: v, port: null, groupKey: null });
        }
      }
      const counts = new Map();
      for (const e of expanded) {
        counts.set(e.groupKey, (counts.get(e.groupKey) || 0) + 1);
      }
      expanded.sort((a, b) => {
        if (a.groupKey == null && b.groupKey != null) return 1;
        if (b.groupKey == null && a.groupKey != null) return -1;
        const ca = counts.get(a.groupKey) || 0;
        const cb = counts.get(b.groupKey) || 0;
        if (cb !== ca) return cb - ca;
        if (a.groupKey !== b.groupKey) {
          return String(a.groupKey || "").localeCompare(String(b.groupKey || ""));
        }
        if (key === "entry") {
          return endMillis(b.row) - endMillis(a.row);
        } else {
          return startMillis(b.row) - startMillis(a.row);
        }
      });
      return expanded.map(e => e.row);
    }
    return rows;
  };

  const container = html`<div class="route-list" style="width:${width}px; max-width:100%; height:${configGlobe.height}px"></div>`;

  const style = html`<style>
    .route-list {
      font: 12px/1.4 "Inter", sans-serif;
      color: #222;
      container-type: inline-size;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    /* Filter + sort bars stay fixed at the top; the rows area scrolls. */
    .route-list .filters,
    .route-list .toolbar {
      flex: 0 0 auto;
    }
    .route-list .rows {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      /* Reserve the scrollbar's space whether or not it's visible, so rows
         don't shift horizontally when the scrollbar appears/disappears.
         scrollbar-gutter handles modern browsers; the padding is a fallback
         that's removed when the gutter is supported. */
      scrollbar-gutter: stable;
      padding-right: 8px;
      /* Ocean-colored scrollbar (Firefox / standards). */
      scrollbar-color: ${configGlobe.oceanColor} transparent;
    }
    /* WebKit/Blink: color the thumb, track, and the up/down arrow buttons. */
    .route-list .rows::-webkit-scrollbar {
      width: 14px;
    }
    .route-list .rows::-webkit-scrollbar-track {
      background: transparent;
    }
    .route-list .rows::-webkit-scrollbar-thumb {
      background: ${configGlobe.oceanColor};
      border-radius: 7px;
      border: 3px solid transparent;
      background-clip: padding-box;
    }
    .route-list .rows::-webkit-scrollbar-button {
      background: ${configGlobe.oceanColor};
      height: 14px;
    }
    .route-list .rows::-webkit-scrollbar-button:vertical:decrement {
      /* up arrow */
      clip-path: polygon(50% 30%, 80% 70%, 20% 70%);
    }
    .route-list .rows::-webkit-scrollbar-button:vertical:increment {
      /* down arrow */
      clip-path: polygon(20% 30%, 80% 30%, 50% 70%);
    }
    @supports (scrollbar-gutter: stable) {
      .route-list .rows { padding-right: 0; }
    }
    .route-list .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 0 8px ${HEADER_PAD}px;
    }
    .route-list .toolbar label {
      color: #555;
      font-size: 12px;
    }
    .route-list .toolbar select {
      font: inherit;
      padding: 3px 6px;
      border: 1px solid #d4d4d4;
      border-radius: 3px;
      background: #fff;
    }
    .route-list .toolbar .sort-dir {
      /* Square toggle sized to the select's height (24px). Uses the same
         Noto Symbols 2 wide-headed arrow as the port arrow in the rows. */
      box-sizing: border-box;
      width: 24px;
      height: 24px;
      padding: 0;
      border: 1px solid #d4d4d4;
      border-radius: 3px;
      background: #fff;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      color: #000;
      font-family: "Noto Symbols 2", sans-serif;
      font-size: 14px;
    }
    .route-list .toolbar .sort-dir:hover { background: #f5f5f5; }
    .route-list .toolbar .sort-dir-glyph {
      display: inline-block;
      line-height: 1;
    }
    .route-list .filters {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      padding: 0 0 8px ${HEADER_PAD}px;
    }
    .route-list .filters > label {
      color: #555;
      font-size: 12px;
    }
    .route-list .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .route-list .filter-tags:empty::before {
      content: "None";
      color: #aaa;
      font-style: italic;
      font-size: 12px;
    }
    .route-list .filter-status {
      color: #888;
      font-size: 12px;
      font-style: italic;
      margin-left: auto;
      margin-right: 5px;
    }

    .route-list .row {
      display: contents;
    }
    .route-list .row.hidden {
      display: none;
    }
    .route-list .row-summary {
      padding: 8px 0 8px ${LEFT_PAD}px;
      border-bottom: 1px solid #ececec;
      cursor: pointer;
      user-select: none;
      display: grid;
      grid-template-columns: subgrid;
      grid-column: 1 / -1;
      column-gap: 16px;
      row-gap: 4px;
      align-items: baseline;
      order: var(--row-order, 0);
    }
    .route-list .row.open .row-summary { border-bottom: none; padding-bottom: 0; }
    .route-list .row-details {
      grid-column: 1 / -1;
      box-sizing: border-box;
      width: 0;
      min-width: 100%;
      order: var(--row-order, 0);
    }
    /* Hover stripe: 3px colored bar at the left edge of the row,
       present on both summary and details (when shown). Implemented
       as absolutely positioned pseudo-elements so it doesn't affect
       layout. When the row is open, the summary stripe extends 6px
       below to bridge the margin gap above the details panel. */
    .route-list .row-summary,
    .route-list .row-details {
      position: relative;
    }
    .route-list .row.hovered .row-summary::before,
    .route-list .row.hovered .row-details::before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 3px;
      background: var(--hover-stripe-color, transparent);
      pointer-events: none;
    }
    .route-list .row.hovered.open .row-summary::before {
      bottom: -6px;
    }
    /* Activation flash: a brief fill (25% category color + 75% white) that
       fades in then out across the row summary to point out the row that was
       clicked elsewhere and scrolled into view. */
    .route-list .row-summary::after {
      content: "";
      position: absolute;
      inset: 0;
      background: var(--flash-color, transparent);
      opacity: 0;
      pointer-events: none;
      z-index: -1;
    }
    .route-list .row.flash .row-summary::after {
      animation: route-row-flash 0.9s ease-in-out;
    }
    /* The details panel has its own opaque background, so an underlay can't
       show through; flash its background-color directly instead. */
    .route-list .row.flash.open .row-details {
      animation: route-row-flash-bg 0.9s ease-in-out;
    }
    /* When open, extend the flash 6px below the summary to bridge the margin
       gap above the details panel (same bridge the hover stripe uses), so the
       flash doesn't leave an uncovered white strip there. */
    .route-list .row.open .row-summary::after {
      bottom: -6px;
    }
    @keyframes route-row-flash {
      0%   { opacity: 0; }
      35%  { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes route-row-flash-bg {
      0%   { background-color: #fbfbfb; }
      35%  { background-color: var(--flash-color, #fbfbfb); }
      100% { background-color: #fbfbfb; }
    }

    .route-list .rows {
      display: grid;
      column-gap: 16px;
      border-top: 1px solid #ececec;
      grid-template-columns: auto 1fr;
      grid-auto-rows: min-content;
      align-content: start;
    }
    @container (min-width: 260px) {
      .route-list .rows {
        grid-template-columns: auto auto auto 1fr;
      }
    }
    @container (min-width: 400px) {
      .route-list .rows {
        grid-template-columns: auto auto auto auto 1fr;
      }
    }

    .route-list .row-summary > .chevron { grid-column: 1; align-self: center; }
    .route-list .row-summary > .vessel,
    .route-list .row-summary > .load,
    .route-list .row-summary > .unload {
      grid-column: 1;
    }

    @container (min-width: 260px) {
      .route-list .row-summary > .chevron {
        grid-column: 1; grid-row: 1 / span 2;
      }
      .route-list .row-summary > .vessel { grid-column: 2 / span 2; grid-row: 1; }
      .route-list .row-summary > .load   { grid-column: 2; grid-row: 2; }
      .route-list .row-summary > .unload { grid-column: 3; grid-row: 2; }
    }
    @container (min-width: 400px) {
      .route-list .row-summary > .chevron {
        grid-column: 1; grid-row: 1;
      }
      .route-list .row-summary > .vessel { grid-column: 2; grid-row: 1; }
      .route-list .row-summary > .load   { grid-column: 3; grid-row: 1; }
      .route-list .row-summary > .unload { grid-column: 4; grid-row: 1; }
    }

    .route-list .cell-group {
      display: inline-flex;
      align-items: baseline;
      gap: 8px;
      white-space: nowrap;
      min-width: 0;
    }
    .route-list .cell-group.vessel { align-items: center; }

    .route-list .chevron {
      transition: transform 0.15s ease;
      line-height: 0;
      width: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transform: rotate(-135deg);
    }
    .route-list .chevron svg {
      display: inline-block;
      vertical-align: middle;
      width: 8px;
      height: 8px;
      stroke: #555;
      stroke-width: 1.5;
      stroke-linecap: square;
      fill: none;
    }
    .route-list .row.open .chevron {
      transform: rotate(-45deg);
    }

    .route-list .flag-cell {
      line-height: 0;
    }
    .route-list .flag-cell > span:first-child > svg {
      height: 19px;
      width: auto;
      display: block;
    }

    .route-list .date {
      font-weight: 400;
    }

    .route-list .state-code {
      font-weight: 400;
      letter-spacing: 0.02em;
    }

    .route-list .pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 400;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      vertical-align: middle;
    }
    .route-list .arrow {
      color: #000;
      font-size: 14px;
      text-align: center;
      line-height: 1;
      font-family: "Noto Symbols 2", sans-serif;
    }

    .route-list .empty-msg {
      grid-column: 1 / -1;
      padding: 16px 0;
      color: #888;
      font-style: italic;
      font-size: 12px;
    }

    .route-list.sort-start .load-date,
    .route-list.sort-end   .unload-date,
    .route-list.sort-state .state-code.emph {
      font-weight: 800;
    }
    .route-list.sort-cargo .pill {
      font-weight: 800;
    }

    .route-list .row-details { display: none; }
    .route-list .row.open .row-details {
      display: block;
      background: #fbfbfb;
      padding: 12px 12px 12px ${HEADER_PAD}px;
      margin: 6px 0 0 0;
      border-radius: 2px;
      box-shadow:
        inset 0 4px 6px -4px rgba(0, 0, 0, 0.18),
        inset 0 -2px 4px -3px rgba(0, 0, 0, 0.10);
    }
    .route-list .row-details p {
      max-width: none;
      width: auto;
      margin: 0 0 4px;
    }
    .route-list .row-details p:last-child { margin-bottom: 0; }
    .route-list .row-details .label {
      color: #5a5a5a;
      font-style: italic;
      font-weight: 300;
    }
    .route-list .row-details .value {
      font-weight: 600;
    }
    .route-list .row-details .vessel-name {
      font-weight: 700;
    }
    .route-list .row-details .description {
      color: #5a5a5a;
      font-style: italic;
      font-weight: 300;
      margin-top: 8px;
      font-size: 12px;
    }
  </style>`;
  container.appendChild(style);

  const filtersBar = html`<div class="filters">
    <label>Filters:</label>
    <div class="filter-tags"></div>
  </div>`;
  container.appendChild(filtersBar);
  const filterTagsEl = filtersBar.querySelector(".filter-tags");

  const toolbar = html`<div class="toolbar">
    <label for="sort-select">Sort:</label>
    <select id="sort-select">
      <option value="start">Loading date</option>
      <option value="end">Discharge date</option>
      <option value="cargo">Cargo (by most common)</option>
    </select>
    <button id="sort-dir" class="sort-dir" type="button" aria-label="Sort ascending" title="Ascending — click for descending"><span class="sort-dir-glyph">🡡</span></button>
    <span class="filter-status"></span>
  </div>`;
  container.appendChild(toolbar);
  const filterStatusEl = toolbar.querySelector(".filter-status");

  const listEl = html`<div class="rows"></div>`;
  container.appendChild(listEl);

  // While drag-scrolling, freeze the row hover selection (don't let rows
  // passing under the cursor change it); re-evaluate once the drag ends.
  let dragScrolling = false;
  // Find the route row under a viewport point and publish its hover (or
  // clear if none). Used to re-evaluate hover after a drag finishes.
  function reevaluateHoverAt(clientX, clientY) {
    const el = document.elementFromPoint(clientX, clientY);
    let node = el, found = null;
    while (node && node !== listEl) {
      if (node.classList && node.classList.contains("row-summary")) { found = node; break; }
      if (node.classList && node.classList.contains("row-details")) { found = node; break; }
      node = node.parentElement;
    }
    if (found && found.__routeRef) publishHoveredRoute(found.__routeRef);
    else publishHoveredRoute(null);
  }

  // Click-and-drag to scroll the list vertically (in addition to the wheel).
  // A small movement threshold distinguishes a click (which expands a row)
  // from a drag (which scrolls and suppresses the row click).
  {
    const DRAG_THRESHOLD = 5; // px before a press becomes a drag or selection
    let down = false, dragging = false, textSelecting = false;
    let startX = 0, startY = 0, startScroll = 0, pid = null;
    let lastX = 0, lastY = 0;
    listEl.addEventListener("pointerdown", (e) => {
      // Ignore non-primary buttons and presses on interactive controls.
      if (e.button !== 0) return;
      down = true; dragging = false;
      // A double/triple-click selects a word/paragraph; a follow-up drag is
      // meant to extend that text selection, so never drag-scroll in that
      // case — commit to text selection immediately.
      textSelecting = e.detail >= 2;
      startX = e.clientX; startY = e.clientY;
      startScroll = listEl.scrollTop; pid = e.pointerId;
      lastX = e.clientX; lastY = e.clientY;
      // Freeze hover immediately on press and lock it to the pressed row, so a
      // stray mousemove onto an adjacent row before the threshold can't change
      // the selection. Unfrozen on click / text-select, or re-evaluated on
      // drag end.
      dragScrolling = !textSelecting;
      reevaluateHoverAt(e.clientX, e.clientY);
    });
    listEl.addEventListener("pointermove", (e) => {
      if (!down) return;
      lastX = e.clientX; lastY = e.clientY;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // Once committed to text selection, never start a drag — let the native
      // selection proceed.
      if (textSelecting) return;
      if (!dragging) {
        const adx = Math.abs(dx), ady = Math.abs(dy);
        if (adx < DRAG_THRESHOLD && ady < DRAG_THRESHOLD) return;
        // Direction decides intent: more horizontal => the user is selecting
        // text, so don't drag-scroll; more vertical => drag-scroll.
        if (adx > ady) {
          textSelecting = true;
          dragScrolling = false; // allow normal hover; native selection runs
          return;
        }
        dragging = true;
        listEl.style.cursor = "grabbing";
        listEl.style.userSelect = "none";
        try { listEl.setPointerCapture(pid); } catch (err) {}
      }
      listEl.scrollTop = startScroll - dy;
    });
    const endDrag = (e) => {
      down = false;
      listEl.style.cursor = "";
      listEl.style.userSelect = "";
      try { if (pid != null) listEl.releasePointerCapture(pid); } catch (err) {}
      pid = null;
      // Re-evaluate the hover for whatever row is now under the cursor, then
      // unfreeze. (Runs for a completed drag, a plain click, or text select.)
      dragScrolling = false;
      const cx = (e && e.clientX != null) ? e.clientX : lastX;
      const cy = (e && e.clientY != null) ? e.clientY : lastY;
      reevaluateHoverAt(cx, cy);
      // Leave `dragging`/`textSelecting` true until the click is swallowed
      // below, then reset.
      if (dragging || textSelecting) {
        setTimeout(() => { dragging = false; textSelecting = false; }, 0);
      }
    };
    listEl.addEventListener("pointerup", endDrag);
    listEl.addEventListener("pointercancel", endDrag);
    // Swallow the click that follows a drag or text selection so it doesn't
    // expand a row.
    listEl.addEventListener("click", (e) => {
      if (dragging || textSelecting) { e.stopPropagation(); e.preventDefault(); }
    }, true);
  }

  // Helpers for building detail lines that smoothly handle missing values.
  const val = (s) => hasValue(s) ? String(s) : "—";
  const cap = (s) => {
    const str = String(s);
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
  };

  // Truncate at whole-word boundary. Returns "" if first word > maxChars.
  const truncateAtWord = (s, maxChars) => {
    const str = String(s);
    if (str.length <= maxChars) return str;
    const cut = str.slice(0, maxChars);
    const lastSpace = cut.lastIndexOf(" ");
    if (lastSpace <= 0) return "";
    return cut.slice(0, lastSpace).trimEnd();
  };

  // Build rows once on mount; renderRows just reorders and shows/hides.
  // Details prose is built lazily on first open.

  const routeMeta = new Map();
  for (const v of routes) {
    const loadState   = stateOfEndpoint(v.load_port);
    const unloadState = stateOfEndpoint(v.unload_port);
    routeMeta.set(v, { loadState, unloadState });
  }

  const rowsByRoute = new Map();

  function buildSummaryRow(v) {
    const bg = v.color || "#ffffff";
    const pillTextColor = textOn(bg);
    const { loadState, unloadState } = routeMeta.get(v);

    const cargoFull = v.cargo_type || "";
    const cargoShort = cargoFull
      ? (truncateAtWord(cargoFull, CARGO_PILL_MAX_CHARS) || "—")
      : "—";

    const startOK = v.start instanceof Date && !isNaN(v.start.getTime())
      && v.start.getUTCFullYear() >= 2000
      && v.start.getUTCFullYear() < 2100;
    const endOK = v.end instanceof Date && !isNaN(v.end.getTime())
      && v.end.getUTCFullYear() >= 2000
      && v.end.getUTCFullYear() < 2100;
    const loadDateText   = startOK ? formatDate(v.start) : shortenDate(v.load_date);
    const unloadDateText = endOK   ? formatDate(v.end)   : shortenDate(v.unload_date);

    const el = html`<div class="row" style="--hover-stripe-color: ${bg}; --flash-color: color-mix(in srgb, ${bg} 25%, #ffffff);">
      <div class="row-summary">
        <span class="chevron"><svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><path d="M 2 1 L 2 8 L 9 8" /></svg></span>
        <span class="cell-group vessel">
          <span class="flag-cell">${v.flag ? flag(v.flag, 26) : ""}</span>
          <span class="pill" style="background:${bg}; color:${pillTextColor}" title="${cargoFull}">${cargoShort}</span>
        </span>
        <span class="cell-group load">
          <span class="state-code">${loadState || "—"}</span>
          <span class="date load-date">${breakOnSlash(loadDateText)}</span>
          <span class="arrow">🡢</span>
        </span>
        <span class="cell-group unload">
          <span class="state-code">${unloadState || "—"}</span>
          <span class="date unload-date">${breakOnSlash(unloadDateText)}</span>
        </span>
      </div>
      <div class="row-details"></div>
    </div>`;

    const summary = el.querySelector(".row-summary");
    const detailsEl = el.querySelector(".row-details");
    const [loadStateEl, unloadStateEl] = el.querySelectorAll(".state-code");

    summary.addEventListener("click", () => {
      const entry = rowsByRoute.get(v);
      ensureDetails(entry);
      el.classList.toggle("open");
    });

    // Hover: attach to both summary and details so the stripe persists
    // when the user moves between them (.row uses display:contents, so
    // we can't attach to it directly — there's no box to hit-test).
    // On leave, check relatedTarget: if it's the row's other child, the
    // pointer hasn't actually left the row. While drag-scrolling, hover is
    // frozen (rows passing under the cursor don't change the selection).
    const onEnter = () => { if (!dragScrolling) publishHoveredRoute(v); };
    const onLeave = (e) => {
      if (dragScrolling) return;
      const to = e.relatedTarget;
      if (to && (summary.contains(to) || detailsEl.contains(to))) return;
      publishHoveredRoute(null);
    };
    summary.__routeRef = v;
    detailsEl.__routeRef = v;
    summary.addEventListener("mouseenter", onEnter);
    summary.addEventListener("mouseleave", onLeave);
    detailsEl.addEventListener("mouseenter", onEnter);
    detailsEl.addEventListener("mouseleave", onLeave);

    return { el, summary, detailsEl, loadStateEl, unloadStateEl, detailsBuilt: false, route: v };
  }

  // Build a row's detail section on first open (lazy).
  function ensureDetails(entry) {
    if (!entry || entry.detailsBuilt) return;
    buildDetails(entry.route, entry.detailsEl);
    entry.detailsBuilt = true;
  }

  function buildDetails(v, details) {
    // "M/V Foo operated by Bar"
    if (hasValue(v.name) || hasValue(v.owner)) {
      const p = document.createElement("p");
      if (hasValue(v.name)) {
        const n = document.createElement("span");
        n.className = "vessel-name";
        n.textContent = v.name;
        p.appendChild(n);
      }
      if (hasValue(v.owner)) {
        const lab = document.createElement("span");
        lab.className = "label";
        lab.textContent = hasValue(v.name) ? " operated by " : "Operated by ";
        p.appendChild(lab);
        const valEl = document.createElement("span");
        valEl.className = "value";
        valEl.textContent = v.owner;
        p.appendChild(valEl);
      }
      details.appendChild(p);
    }

    // "carrying 300,000 barrels of X"
    if (hasValue(v.cargo_description) || hasValue(v.cargo_quantity)) {
      const p = document.createElement("p");
      const lab = document.createElement("span");
      lab.className = "label";
      lab.textContent = "carrying ";
      p.appendChild(lab);
      if (hasValue(v.cargo_quantity)) {
        const valEl = document.createElement("span");
        valEl.className = "value";
        valEl.textContent = v.cargo_quantity;
        p.appendChild(valEl);
        if (hasValue(v.cargo_description)) {
          const of = document.createElement("span");
          of.className = "label";
          of.textContent = " of ";
          p.appendChild(of);
          const descEl = document.createElement("span");
          descEl.className = "value";
          descEl.textContent = v.cargo_description;
          p.appendChild(descEl);
        }
      } else if (hasValue(v.cargo_description)) {
        const descEl = document.createElement("span");
        descEl.className = "value";
        descEl.textContent = v.cargo_description;
        p.appendChild(descEl);
      }
      details.appendChild(p);
    }

    // "loaded at FAC in PORT on DATE and discharged at FAC in PORT on DATE".
    // Slash-separated fields (with matching counts) become sub-clauses joined
    // by "and". Single-event hyphen ranges (e.g. "4/13 - 4/15") render as
    // "April 13-15th 2026" — kept as one event.
    const splitSlash = (s) => hasValue(s)
      ? String(s).split(" / ").map(t => t.trim()).filter(Boolean)
      : [];
    function buildHalf(verb, facility, port, dateStr, fallbackDate) {
      const facs   = splitSlash(facility);
      const ports  = splitSlash(port);
      const dates  = hasValue(dateStr) && RANGE_SEP_SLASH_RE.test(dateStr)
        ? String(dateStr).split(RANGE_SEP_SLASH_RE).map(t => t.trim()).filter(Boolean)
        : [];
      const counts = [facs.length, ports.length, dates.length].filter(n => n >= 2);
      const allMatch = counts.length > 0 && counts.every(n => n === counts[0]);
      const n = allMatch ? counts[0] : 1;

      const subEvents = [];
      for (let i = 0; i < n; i++) {
        const f = facs.length >= 2 ? facs[i] : facility;
        const p = ports.length >= 2 ? ports[i] : port;
        const d = (dates.length >= 2)
          ? formatDateRangeLong(dates[i], null)
          : formatDateRangeLong(dateStr, fallbackDate);
        if (!hasValue(f) && !hasValue(p) && !d) continue;
        subEvents.push({ f, p, d });
      }
      if (subEvents.length === 0) return null;

      const parts = [{ kind: "label", text: verb + " " }];
      subEvents.forEach((ev, i) => {
        const hasF = hasValue(ev.f);
        const hasP = hasValue(ev.p);
        const hasD = !!ev.d;
        if (i > 0) parts.push({ kind: "label", text: " and " });
        if (hasF) {
          if (i === 0) parts.push({ kind: "label", text: "at " });
          parts.push({ kind: "value", text: ev.f });
          if (hasP) {
            parts.push({ kind: "label", text: " in " });
            parts.push({ kind: "value", text: ev.p });
          }
        } else if (hasP) {
          if (i === 0) parts.push({ kind: "label", text: "in " });
          parts.push({ kind: "value", text: ev.p });
        }
        if (hasD) {
          if (i === 0) {
            parts.push({ kind: "label", text: (hasF || hasP) ? " on " : "on " });
          } else {
            parts.push({ kind: "label", text: " " });
          }
          parts.push({ kind: "value", text: ev.d });
        }
      });
      return parts;
    }
    const left  = buildHalf("loaded",     v.load_facility,   v.load_port,
                            v.load_date,   v.start);
    const right = buildHalf("discharged", v.unload_facility, v.unload_port,
                            v.unload_date, v.end);
    if (left || right) {
      const p = document.createElement("p");
      const appendParts = (parts, capitalize) => {
        if (!parts) return;
        const arr = capitalize
          ? [{ ...parts[0], text: cap(parts[0].text) }, ...parts.slice(1)]
          : parts;
        for (const piece of arr) {
          const s = document.createElement("span");
          s.className = piece.kind;
          s.textContent = piece.text;
          p.appendChild(s);
        }
      };
      if (left && right) {
        appendParts(left, false);
        const conj = document.createElement("span");
        conj.className = "label";
        conj.textContent = " and ";
        p.appendChild(conj);
        appendParts(right, false);
      } else {
        appendParts(left || right, true);
      }
      details.appendChild(p);
    }

    if (hasValue(v.explanation)) {
      const p = document.createElement("p");
      p.className = "description";
      p.textContent = v.explanation;
      details.appendChild(p);
    }
  }

  // Build all rows once. Use a fragment so we do a single DOM append.
  const initialFrag = document.createDocumentFragment();
  for (const v of routes) {
    const entry = buildSummaryRow(v);
    rowsByRoute.set(v, entry);
    initialFrag.appendChild(entry.el);
  }
  listEl.appendChild(initialFrag);

  const emptyMsg = document.createElement("div");
  emptyMsg.className = "empty-msg";
  emptyMsg.style.display = "none";
  listEl.appendChild(emptyMsg);

  // Format a [Date, Date] range as "Mar 5 – Apr 12".
  const fmtRangeLabel = (range) => {
    const f = d3.timeFormat("%b %-d");
    const a = f(range[0]);
    // Display only: show the end date as one day earlier, so an
    // exclusive upper boundary like Jun 1 reads as May 31. The
    // underlying filter range is unchanged.
    const b = f(new Date(+range[1] - 864e5));
    // Single-day range collapses to just the one date.
    return a === b ? a : `${a} – ${b}`;
  };

  // Render the filter tags row. Called from renderRows so it stays in
  // sync with the rest of the UI.
  function renderFilterTags() {
    filterTagsEl.innerHTML = "";
    if (state.loadRange) {
      filterTagsEl.appendChild(tag({
        label: `Load: ${fmtRangeLabel(state.loadRange)}`,
        onClose: () => state.update({ loadRange: null })
      }));
    }
    if (state.dischargeRange) {
      filterTagsEl.appendChild(tag({
        label: `Discharge: ${fmtRangeLabel(state.dischargeRange)}`,
        onClose: () => state.update({ dischargeRange: null })
      }));
    }
    if (state.hiddenCargo && state.hiddenCargo.size > 0) {
      filterTagsEl.appendChild(tag({
        label: "Legend filter",
        onClose: () => state.update({ hiddenCargo: new Set() })
      }));
    }
    if (state.focus && state.focus.name) {
      const clearFocus = () => state.update({ focus: null });
      filterTagsEl.appendChild(tag({
        label: `Focus ${state.focus.name}`,
        onClose: clearFocus,
        onClick: clearFocus
      }));
    }
  }

  function renderRows(sortKey) {
    container.className = container.className
      .replace(/\bsort-\S+/g, "").trim();
    container.classList.add("route-list", "sort-" + sortKey);

    renderFilterTags();

    const filtered = filterRoutes();
    const rows = sortRoutes(sortKey, filtered);
    // Descending simply reverses whatever order the current sort produced.
    if (sortDir === "desc") rows.reverse();
    const stateCounts = (sortKey === "state" && rows.stateCounts) || null;
    const visibleSet = new Set(rows);

    const anyFilter = state.loadRange || state.dischargeRange ||
      (state.hiddenCargo && state.hiddenCargo.size > 0) || !!state.focus;
    filterStatusEl.textContent = anyFilter
      ? `${rows.length} of ${routes.length} voyages`
      : "";

    if (rows.length === 0) {
      emptyMsg.textContent = anyFilter
        ? "No voyages match the selected filters."
        : "No voyages.";
      emptyMsg.style.display = "";
      for (const { el } of rowsByRoute.values()) {
        el.classList.add("hidden");
      }
      return;
    }
    emptyMsg.style.display = "none";

    rows.forEach((v, i) => {
      const entry = rowsByRoute.get(v);
      entry.el.classList.remove("hidden");
      entry.el.style.setProperty("--row-order", i);

      // State-sort emphasis: bold whichever state code (load/unload) has
      // more total voyages. Always toggle off when not sorting by state.
      const { loadState, unloadState } = routeMeta.get(v);
      let loadEmph = false, unloadEmph = false;
      if (stateCounts) {
        const cl = loadState   ? (stateCounts.get(loadState)   || 0) : -1;
        const cu = unloadState ? (stateCounts.get(unloadState) || 0) : -1;
        if (cl >= 0 && cu >= 0) {
          if (cl > cu)      loadEmph = true;
          else if (cu > cl) unloadEmph = true;
          else { loadEmph = true; unloadEmph = true; }
        } else if (cl >= 0) {
          loadEmph = true;
        } else if (cu >= 0) {
          unloadEmph = true;
        }
      }
      entry.loadStateEl.classList.toggle("emph", loadEmph);
      entry.unloadStateEl.classList.toggle("emph", unloadEmph);
    });

    for (const [v, entry] of rowsByRoute) {
      if (!visibleSet.has(v)) entry.el.classList.add("hidden");
    }
  }

  const select = toolbar.querySelector("#sort-select");
  select.addEventListener("change", () => renderRows(select.value));

  // Sort direction. Ascending by default (up arrow); clicking flips to
  // descending (down arrow) and reverses the current ordering. The arrows
  // are the up/down siblings of the wide-headed port arrow used in the rows.
  const sortDirBtn = toolbar.querySelector("#sort-dir");
  const sortDirGlyph = sortDirBtn.querySelector(".sort-dir-glyph");
  const ARROW_UP = "🡡";
  const ARROW_DOWN = "🡣";

  // These wide-headed barb arrows sit high within their line box, so plain
  // flex centering leaves them looking too high. Measure the glyph's actual
  // ink box (in whatever font actually renders) and nudge it vertically so
  // the ink — not the line box — is centered in the button.
  function centerSortGlyph() {
    const cs = getComputedStyle(sortDirGlyph);
    if (!cs.fontSize) return; // not laid out yet
    const canvas = centerSortGlyph._canvas ||
      (centerSortGlyph._canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");
    ctx.font = `${cs.fontSize} ${cs.fontFamily}`;
    const m = ctx.measureText(sortDirGlyph.textContent);
    const vals = [
      m.actualBoundingBoxAscent, m.actualBoundingBoxDescent,
      m.fontBoundingBoxAscent, m.fontBoundingBoxDescent,
    ];
    if (vals.some(v => typeof v !== "number" || !isFinite(v))) return;
    const [ABA, ABD, FBA, FBD] = vals;
    const dy = ((ABA - ABD) - (FBA - FBD)) / 2;
    sortDirGlyph.style.transform = `translateY(${dy.toFixed(2)}px)`;
  }
  // Center after the cell mounts (getComputedStyle needs it attached), and
  // again once any late-loading fonts settle.
  requestAnimationFrame(centerSortGlyph);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(centerSortGlyph).catch(() => {});
  }

  let sortDir = "asc";
  sortDirBtn.addEventListener("click", () => {
    sortDir = sortDir === "asc" ? "desc" : "asc";
    const asc = sortDir === "asc";
    sortDirGlyph.textContent = asc ? ARROW_UP : ARROW_DOWN;
    centerSortGlyph();
    sortDirBtn.title = asc
      ? "Ascending — click for descending"
      : "Descending — click for ascending";
    sortDirBtn.setAttribute("aria-label", asc ? "Sort ascending" : "Sort descending");
    renderRows(select.value);
  });

  // Reverse lookup: routeKey -> route object. Built once.
  const routeByKey = new Map();
  for (const v of routes) {
    const k = routeKey(v);
    if (k != null) routeByKey.set(k, v);
  }

  // Publish a single hovered route to shared state. Replaces this cell's
  // contribution wholesale (this cell owns at most one hovered route at
  // a time). Passing null clears.
  let myHoveredRoute = null;
  function publishHoveredRoute(v) {
    if (v === myHoveredRoute) return;
    myHoveredRoute = v;
    const next = new Set();
    if (v) {
      const k = routeKey(v);
      if (k != null) next.add(k);
    }
    state.update({ hoveredRoutes: next, hoverKind: v ? "route" : null });
  }

  // Toggle .hovered class on rows whose routeKey is in the set.
  let lastHoveredSet = null;
  function applyHoverHighlights(hovered) {
    const next = hovered instanceof Set ? hovered : new Set();
    if (lastHoveredSet) {
      for (const k of lastHoveredSet) {
        if (next.has(k)) continue;
        const v = routeByKey.get(k);
        const entry = v && rowsByRoute.get(v);
        if (entry) entry.el.classList.remove("hovered");
      }
    }
    for (const k of next) {
      const v = routeByKey.get(k);
      const entry = v && rowsByRoute.get(v);
      if (entry) entry.el.classList.add("hovered");
    }
    lastHoveredSet = next;
  }

  // Open a route's row and scroll it as close to the top of the scroll
  // area as the remaining scroll range allows (so it lands at the top when
  // there's room, otherwise scrolls to the bottom). Triggered when a route
  // is clicked on the globe or timeline. If the route is filtered out of the
  // current list, there's nothing to open.
  function activateRoute(k) {
    if (k == null) return;
    const v = routeByKey.get(k);
    const entry = v && rowsByRoute.get(v);
    if (!entry || entry.el.classList.contains("hidden")) return;
    ensureDetails(entry);
    entry.el.classList.add("open");
    // After the open expands the row (next frame), scroll it to the top,
    // then flash it once the scroll settles.
    requestAnimationFrame(() => {
      // The row uses display:contents, so measure its first child (summary).
      const rowRect = entry.summary.getBoundingClientRect();
      const listRect = listEl.getBoundingClientRect();
      const delta = rowRect.top - listRect.top; // px from list top to row top
      const maxScroll = listEl.scrollHeight - listEl.clientHeight;
      const target = Math.max(0, Math.min(listEl.scrollTop + delta, maxScroll));
      const needsScroll = Math.abs(target - listEl.scrollTop) > 1;
      // Flash once the scroll finishes. Prefer the scrollend event; fall back
      // to a timeout (covers no-op scrolls and browsers without scrollend).
      let done = false;
      const fire = () => { if (done) return; done = true; flashRow(entry); };
      if (needsScroll && "onscrollend" in listEl) {
        listEl.addEventListener("scrollend", fire, { once: true });
        setTimeout(fire, 700); // safety net if scrollend never fires
      } else {
        setTimeout(fire, needsScroll ? 450 : 0);
      }
      if (typeof listEl.scrollTo === "function") {
        listEl.scrollTo({ top: target, behavior: "smooth" });
      } else {
        listEl.scrollTop = target;
        fire();
      }
    });
  }

  // Briefly flash a row's summary fill to draw the eye after it scrolls in.
  // Re-arm the animation by removing the class, forcing reflow, re-adding.
  function flashRow(entry) {
    const el = entry.el;
    const summary = el.querySelector(".row-summary");
    el.classList.remove("flash");
    if (summary) void summary.offsetWidth; // force reflow to re-arm animation
    el.classList.add("flash");
    if (summary) summary.addEventListener(
      "animationend", () => el.classList.remove("flash"), { once: true });
  }

  // Subscribe to state changes; first fire renders, subsequent fires dedupe.
  let hasRendered = false;
  let lastLoadRange = undefined;
  let lastDiscRange = undefined;
  let lastHiddenCargo = undefined;
  let lastHoveredRoutes = undefined;
  let lastFocus = undefined;
  let lastActivatedAt = undefined;
  const unsubscribe = state.subscribe((s) => {
    if (!hasRendered ||
        s.loadRange !== lastLoadRange ||
        s.dischargeRange !== lastDiscRange ||
        s.hiddenCargo !== lastHiddenCargo ||
        s.focus !== lastFocus) {
      hasRendered = true;
      lastLoadRange = s.loadRange;
      lastDiscRange = s.dischargeRange;
      lastHiddenCargo = s.hiddenCargo;
      lastFocus = s.focus;
      renderRows(select.value);
    }
    if (s.hoveredRoutes !== lastHoveredRoutes) {
      lastHoveredRoutes = s.hoveredRoutes;
      applyHoverHighlights(s.hoveredRoutes);
    }
    // Route clicked on another cell: open + scroll it to the top. activatedAt
    // changes even when the same route is clicked again, so it re-triggers.
    if (s.activatedAt !== lastActivatedAt) {
      lastActivatedAt = s.activatedAt;
      if (s.activatedRoute != null) activateRoute(s.activatedRoute);
    }
  });
  invalidation.then(unsubscribe);

  return container;
}


function _sources(attachCell)
{
  attachCell;
  const root = document.createElement("div");
  root.className = "stksources";
  root.style.cssText = "font: 400 12px 'Inter', sans-serif; color: #000; text-align: left; box-sizing: border-box; width: 100%; max-width: 700px; margin: 0 auto; padding: 6px 0 8px 0; line-height: 1.3;";

  const link = (parent, href, text) => {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.cssText = "color: #000; font-weight: 400; text-decoration: underline;";
    a.textContent = text;
    parent.appendChild(a);
  };

  const span = (parent, text, extraStyle) => {
    const s = document.createElement("span");
    if (extraStyle) s.style.cssText = extraStyle;
    s.textContent = text;
    parent.appendChild(s);
  };

  const srcList = [
    { label: "MARAD 2026",        href: "https://www.maritime.dot.gov/ports/domestic-shipping/domestic-shipping" },
    { label: "USACE 2025",        href: "https://geospatial-usace.opendata.arcgis.com/maps/ace7645d305647448a84492a3b909d48/about" },
    { label: "Natural Earth 2022",href: "https://github.com/nvkelso/natural-earth-vector" }
  ];

  span(root, "Sources: ", "font-weight: 400;");

  srcList.forEach((s, i) => {
    const m = s.label.match(/^(.*?)(\d{4})\s*$/);
    if (m) {
      span(root, m[1]);
      link(root, s.href, m[2]);
    } else {
      link(root, s.href, s.label);
    }
    span(root, i < srcList.length - 1 ? "; " : ". ");
  });

  span(root, "Made with ");
  link(root, "https://observablehq.com/d/3a87558830e6537f", "Observable Notebooks");

  return root;
}


function _regionStats(attachCell,dataRoute,d3,cargoSheet,routes,jonesActBarrels,windowStats,historicalMapped,states,html,width,ResizeObserver,invalidation)
{
  attachCell;
  const YEAR0 = 2015, YEAR1 = 2025;     // historical window (11 years)
  const PROJ_YEAR = 2026;               // trend extrapolated to here, then bends right
  const FLOW = "movement";              // "movement" (domestic) | "import" | "both"
  const H = 360;
  const MIN_CHART_W = 650;              // min width of EACH chart (text wraps below this) — widened for 12px x-axis labels
  const GAP = 24;                       // flex gap between the chart and its text

  const LABEL_SIZE = 12;                // one font size for all in-chart text
  const TITLE_SIZE = 20;                // chart title (PADD line, weight 700) + the matching "+X%" callout
  const LEGEND_SIZE = 12;               // color-legend text + the on-graph hover category badge (kept in sync)
  const LABEL_DY   = 5;                 // px a label sits above its gridline / mark
  const DESC_SIZE  = 14;                // description body text: per-region write-ups + the intro summary paragraph.
                                        // The inline cargo circles (and their click-padding) scale proportionally
                                        // from this — 12px dot / 5px pad at the 18px baseline. Tweak here.

  const TERRITORY_NAME_TO_CODE = {
    "puerto rico":"PR",
    "u.s. virgin islands":"VI","us virgin islands":"VI","virgin islands":"VI",
    "guam":"GU","american samoa":"AS",
    "northern mariana islands":"MP","commonwealth of the northern mariana islands":"MP",
  };
  const TERRITORY_CODES = new Set(Object.values(TERRITORY_NAME_TO_CODE));
  const toTerritoryCode = v => {
    if (v == null) return null;
    const s = String(v).trim();
    if (TERRITORY_CODES.has(s.toUpperCase())) return s.toUpperCase();
    return TERRITORY_NAME_TO_CODE[s.toLowerCase()] || null;
  };

  const PR_RE = /puerto\s*rico|^\s*pr\s*$/i;
  const isPRvoyage = d => [d.unload_PADD, d.unload_PADD_sub, d.unload_region, d.unload_country]
    .some(v => PR_RE.test(String(v ?? "")));

  const jonesActSuspended = new Date(2026, 2, 18);   // 2026-03-18
  const parseSubmit = raw => {
    if (raw instanceof Date) return isNaN(raw) ? null : raw;
    if (raw == null) return null;
    const m = String(raw).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
    if (!m) return null;
    const yr = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    const dt = new Date(yr, +m[1] - 1, +m[2]);
    return isNaN(dt) ? null : dt;
  };
  let latestSubmit = null;
  for (const v of dataRoute) {
    const d = parseSubmit(v && v.reported_submit);
    if (d && (!latestSubmit || d > latestSubmit)) latestSubmit = d;
  }
  const waiverDays = latestSubmit
    ? Math.max(0, Math.floor((latestSubmit.getTime() - jonesActSuspended.getTime()) / 86400000))
    : null;
  const COLUMN_LABEL = waiverDays != null
    ? `Inter-PADD barrels shipped under the Jones Act waiver after ${waiverDays} days`
    : "Inter-PADD barrels shipped under the Jones Act waiver";

  const fmt = d3.format(",");
  const siFix = { k: "K", G: "B" };
  const fmtAxis = n => d3.format("~s")(n).replace(/[kG]/, m => siFix[m]);
  const fmtSig3 = n => d3.format(".3~s")(n).replace(/[kG]/, m => siFix[m]);
  const fontFamily = `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
  const THOUSAND = 1000;                 // historicalMapped value_mbbl is in thousand bbl
  const dayMs = 86400000;

  const flowOK = (ft, domFlow = "movement") =>
    FLOW === "import"   ? ft === "import" :
    FLOW === "movement" ? ft === domFlow :
                          (ft === "import" || ft === domFlow);

  const colorOf = new Map(cargoSheet.map(d => [d["Cargo Types"], d.Color]));
  const cargoOrder = cargoSheet.map(d => d["Cargo Types"]);

  const NUM_WORD = { k: "thousand", M: "million", G: "billion", T: "trillion", P: "quadrillion" };
  const fmtBarrels = n => {
    if (n == null || !isFinite(n)) return "\u2014";
    if (Math.abs(n) < 1000) return d3.format(".3~r")(n);
    const s = d3.format(".3s")(n);
    const suf = s.slice(-1);
    return NUM_WORD[suf] ? s.slice(0, -1) + " " + NUM_WORD[suf] : s;
  };
  const fmtPct = n => {
    if (n == null || !isFinite(n)) return "\u2014";
    return Math.abs(n) < 1 ? +n.toFixed(1) : Math.round(n);
  };
  const fmtMillionsNum = n => (n == null || !isFinite(n)) ? "\u2014" : d3.format(".3r")(n / 1e6);

  const CARGO_ALIAS = { "renewable diesel": "Renewable fuel" };  // per request; text stays "renewable diesel"
  const descRouteColor = new Map();
  for (const r of routes) {
    const c = r && r.cargo_type && String(r.cargo_type).trim();
    if (c && r.color && !descRouteColor.has(c)) descRouteColor.set(c, r.color);
  }
  const descJAColor = new Map();
  for (const v of jonesActBarrels.voyages) if (v && v.cargo && !descJAColor.has(v.cargo)) descJAColor.set(v.cargo, v.color);
  const allCargoCats = new Set([...colorOf.keys(), ...descJAColor.keys(), ...descRouteColor.keys()]);
  const chipColor = c => colorOf.get(c) || descJAColor.get(c) || descRouteColor.get(c) || "#bbb";
  const matchCat = s => {
    const t = String(s).trim().toLowerCase();
    for (const c of allCargoCats) if (c.toLowerCase() === t) return c;
    for (const c of allCargoCats) if (c.toLowerCase().includes(t) || t.includes(c.toLowerCase())) return c;
    return null;
  };
  const resolveCargo = label => {
    const lc = String(label).trim().toLowerCase();
    if (CARGO_ALIAS[lc]) {
      const viaAlias = matchCat(CARGO_ALIAS[lc]);
      if (viaAlias) return viaAlias;
    }
    return matchCat(label) || label;
  };

  const matchActive = (active, c) =>
    active == null ? true : (Array.isArray(active) ? active.includes(c) : active === c);

  const olsFit = pts => {
    const mx = d3.mean(pts, p => p.year), my = d3.mean(pts, p => p.value);
    let num = 0, den = 0;
    for (const p of pts) { num += (p.year - mx) * (p.value - my); den += (p.year - mx) ** 2; }
    const m = den ? num / den : 0;
    return { slope: m, intercept: my - m * mx };
  };
  const fitTrend = pts => {
    try {
      const s = windowStats(pts, { unit: "bbl", valueFmt: fmtAxis, x0: YEAR1 });
      if (s && Number.isFinite(s.slopeSen) && Number.isFinite(s.intercept)) return { slope: s.slopeSen, intercept: s.intercept };
    } catch (e) {  }
    return olsFit(pts);
  };
  const computeStats = cfg => {
    const domFlow = cfg.domesticFlow || "movement";
    const years = d3.range(YEAR0, YEAR1 + 1);
    const tot = new Map(years.map(y => [y, 0]));
    for (const d of historicalMapped) {
      if (!flowOK(d.flow_type, domFlow)) continue;
      const yr = +d.year; if (yr < YEAR0 || yr > YEAR1) continue;
      const w = cfg.histWeight(d); if (!(w > 0)) continue;
      tot.set(yr, tot.get(yr) + (+d.value_mbbl) * THOUSAND * w);
    }
    const totByYear = years.map(y => ({ year: y, value: tot.get(y) }));
    const trendFrom = cfg.trendFromYear || YEAR0;
    const fit = fitTrend(totByYear.filter(p => p.year >= trendFrom));
    const trend2026 = fit.intercept + fit.slope * PROJ_YEAR;
    const vR = jonesActBarrels.voyages.filter(d => cfg.routeMatch(d.raw));
    const colByCargo = d3.rollup(vR, g => d3.sum(g, d => d.bbl), d => d.cargo);
    const colTotal = d3.sum([...colByCargo.values()]);
    const pctBaseline = trend2026 > 0 ? (colTotal / trend2026) * 100 : NaN;
    const pos = totByYear.filter(p => p.value > 0).map(p => p.value);
    const histLo = pos.length ? d3.min(pos) : NaN;
    const histHi = pos.length ? d3.max(pos) : NaN;
    return { colByCargo, colTotal, trend2026, pctBaseline, histLo, histHi, totByYear };
  };
  const histCargoSum = (cfg, catName, y0, y1) => {
    const domFlow = cfg.domesticFlow || "movement";
    let s = 0;
    for (const d of historicalMapped) {
      if (!flowOK(d.flow_type, domFlow)) continue;
      if (catName && d.cargo_type !== catName) continue;
      const yr = +d.year; if (yr < y0 || yr > y1) continue;
      const w = cfg.histWeight(d); if (w > 0) s += (+d.value_mbbl) * THOUSAND * w;
    }
    return s;
  };

  const SUBZONE_SHARE = 1 / 3;
  const SPLIT_IMPORTS = true;
  const subHistWeight = sub => d =>
    d.end_padd === "PADD " + sub ? 1 :
    d.end_padd === "PADD 1"      ? (d.flow_type === "import" ? (SPLIT_IMPORTS ? SUBZONE_SHARE : 0) : SUBZONE_SHARE) : 0;

  const REGIONS = [
    {
      title: "PADD 5: West Coast",
      states: ["AZ", "CA", "NV", "OR", "WA"],
      histWeight:  d => d.end_padd === "PADD 5" ? 1 : 0,
      routeMatch:  d => +d.unload_PADD === 5,
    },
    {
      title: "Puerto Rico",
      states: ["PR"],
      histWeight:  d => toTerritoryCode(d.end_padd) === "PR" ? 1 : 0,
      routeMatch:  d => isPRvoyage(d),
      domesticFlow: "export_to_pr",
    },
    {
      title: "PADD 3: Gulf Coast",
      states: ["AL", "AR", "LA", "MS", "NM", "TX"],
      histWeight:  d => d.end_padd === "PADD 3" ? 1 : 0,
      routeMatch:  d => +d.unload_PADD === 3,
      trendFromYear: 2016,   // 2015 is an outlier; fit the trend on 2016–2025 only
    },
    {
      title: "PADD 1A: New England",
      states: ["CT", "ME", "MA", "NH", "RI", "VT"],
      histWeight:  subHistWeight("1A"),
      routeMatch:  d => d.unload_PADD_sub === "1A",
    },
    {
      title: "PADD 1B: Central Atlantic",
      states: ["DE", "DC", "MD", "NJ", "NY", "PA"],
      histWeight:  subHistWeight("1B"),
      routeMatch:  d => d.unload_PADD_sub === "1B",
    },
    {
      title: "PADD 1C: Lower Atlantic",
      states: ["FL", "GA", "NC", "SC", "VA", "WV"],
      histWeight:  subHistWeight("1C"),
      routeMatch:  d => d.unload_PADD_sub === "1C",
    },
  ];

  const MAP_W = 96, MAP_H = 54, MAP_GAP = 10, MAP_PAD = 2;   // box at the top-left of each chart
  const MAP_GREY = "#c9c9c9";                                // states outside the region
  const MAP_EXCLUDE = new Set(["AK", "HI", "GU", "AS", "MP", "VI"]);
  let mainlandPaths = [];
  let prPaths = [];
  if (typeof states !== "undefined" && states && states.features) {
    const usable = states.features.filter(f => f.properties && !MAP_EXCLUDE.has(f.properties.postal));

    const mainFeatures = usable.filter(f => f.properties.postal !== "PR");
    const mainProj = d3.geoAlbers().fitSize([MAP_W, MAP_H], { type: "FeatureCollection", features: mainFeatures });
    const mainPath = d3.geoPath(mainProj);
    mainlandPaths = mainFeatures.map(f => ({ postal: f.properties.postal, d: mainPath(f) })).filter(p => p.d);

    const prFeat = usable.find(f => f.properties.postal === "PR");
    if (prFeat) {
      const flNW = { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [-87.63, 31.0] } };
      const prProj = d3.geoAlbers().fitSize([MAP_W, MAP_H], { type: "FeatureCollection", features: [flNW, prFeat] });
      const prGeo = d3.geoPath(prProj);
      prPaths = usable.map(f => ({ postal: f.properties.postal, d: prGeo(f) })).filter(p => p.d);
    }
  }

  const measureText = (() => {
    let ctx = null;
    try { ctx = document.createElement("canvas").getContext("2d"); } catch (e) {  }
    return (text, font, perChar = 7) =>
      ctx ? (ctx.font = font, ctx.measureText(String(text)).width) : String(text).length * perChar;
  })();

  function buildChart(cfg, chartWidth) {
    const domFlow = cfg.domesticFlow || "movement";

    const years = d3.range(YEAR0, YEAR1 + 1);
    const histRows = historicalMapped
      .filter(d => flowOK(d.flow_type, domFlow) && +d.year >= YEAR0 && +d.year <= YEAR1)
      .map(d => ({ row: d, w: cfg.histWeight(d) }))
      .filter(d => d.w > 0);

    const vR = jonesActBarrels.voyages.filter(d => cfg.routeMatch(d.raw));

    const colByCargo = d3.rollup(vR, g => d3.sum(g, d => d.bbl), d => d.cargo);
    const routeColor = new Map(vR.map(d => [d.cargo, d.color]));

    const presentHist = new Set(histRows.filter(d => +d.row.value_mbbl > 0).map(d => d.row.cargo_type));
    const presentCol  = new Set(colByCargo.keys());
    const present     = new Set([...presentHist, ...presentCol]);
    const keys = [
      ...cargoOrder.filter(c => present.has(c)),
      ...[...present].filter(c => !cargoOrder.includes(c))
    ];
    const colorFor = c => colorOf.get(c) || routeColor.get(c) || "#bbb";

    const W = chartWidth || MIN_CHART_W;   // fill the chart cell (rendered at this exact pixel width)

    if (!keys.length)
      return { node: html`<div style="font:13px ${fontFamily};color:#a00;width:${W}px;">
        No data for <b>${cfg.title}</b> (${FLOW} flow, ${YEAR0}–${YEAR1}).</div>`, apply: () => {} };

    const areaRows = years.map(y => { const o = { year: y }; for (const k of keys) o[k] = 0; return o; });
    const rowByYear = new Map(areaRows.map(r => [r.year, r]));
    for (const { row: d, w } of histRows) {
      const r = rowByYear.get(+d.year);
      if (r && d.cargo_type in r) r[d.cargo_type] += +d.value_mbbl * THOUSAND * w;
    }

    const colRow = Object.fromEntries(keys.map(k => [k, colByCargo.get(k) || 0]));
    const colTotal = d3.sum(keys, k => colRow[k]);

    const totByYear = years.map(y => ({ year: y, value: d3.sum(keys, k => rowByYear.get(y)[k]) }));
    const trendFrom = cfg.trendFromYear || YEAR0;
    const fitPoints = totByYear.filter(p => p.year >= trendFrom);
    const ols = pts => {
      const n = pts.length, mx = d3.mean(pts, p => p.year), my = d3.mean(pts, p => p.value);
      let num = 0, den = 0;
      for (const p of pts) { num += (p.year - mx) * (p.value - my); den += (p.year - mx) ** 2; }
      const m = den ? num / den : 0;
      return { slopeSen: m, intercept: my - m * mx };
    };
    let slope = null, intercept = null;
    try {
      const s = windowStats(fitPoints, { unit: "bbl", valueFmt: fmtAxis, x0: YEAR1 });
      if (s && Number.isFinite(s.slopeSen) && Number.isFinite(s.intercept)) { slope = s.slopeSen; intercept = s.intercept; }
    } catch (e) {  }
    if (slope == null) { const o = ols(fitPoints); slope = o.slopeSen; intercept = o.intercept; }
    const yAt = yr => intercept + slope * yr;
    const trend2026 = yAt(PROJ_YEAR);

    const margin = { top: 64, right: 58, bottom: 74, left: 37 };
    const headerMidY = -margin.top + MAP_PAD + MAP_H / 2;
    const titleY = headerMidY - 5;
    const subY   = headerMidY + 9;
    const iw = Math.max(120, W - margin.left - margin.right);
    const ih = H - margin.top - margin.bottom;

    const xPad     = 0.5;
    const areaR    = YEAR1 + xPad;
    const colLeft  = PROJ_YEAR + 2.0;
    const colRight = colLeft + 1;
    const colMid   = (colLeft + colRight) / 2;
    const xMin = YEAR0 - xPad;
    const xMax = colRight + 0.5;
    const x = d3.scaleLinear().domain([xMin, xMax]).range([0, iw]);

    const maxArea = d3.max(totByYear, d => d.value) || 0;
    let yMax = Math.max(maxArea, colTotal, Number.isFinite(trend2026) ? trend2026 : 0, 1);
    let y = d3.scaleLinear().domain([0, yMax]).nice().range([ih, 0]);
    const firstBar = totByYear.length ? totByYear[0].value : 0;
    for (let i = 0; i < 8; i++) {
      const topVis = d3.max(y.ticks(5).filter(d => y(d) >= LABEL_DY + 10));
      if (topVis == null || topVis > firstBar) break;
      yMax *= 1.12;
      y = d3.scaleLinear().domain([0, yMax]).nice().range([ih, 0]);
    }

    const svg = d3.create("svg")
      .attr("width", W).attr("height", H)
      .attr("viewBox", `0 0 ${W} ${H}`)
      .style("font-family", fontFamily)
      .style("overflow", "visible");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const yAxisG = g.append("g")
      .attr("pointer-events", "none")                     // gridlines never intercept bar hovers
      .call(d3.axisLeft(y).ticks(5).tickFormat(fmtAxis).tickSize(-iw))
      .call(s => s.select(".domain").remove());
    yAxisG.selectAll(".tick line")
      .attr("x1", -margin.left)
      .attr("x2", iw)
      .attr("stroke", "#eee");
    yAxisG.selectAll(".tick text")
      .attr("x", -margin.left)
      .attr("y", -LABEL_DY)
      .attr("dy", null)
      .attr("text-anchor", "start")
      .attr("fill", "#1a1714")
      .attr("font-size", LABEL_SIZE)
      .attr("display", d => y(d) < LABEL_DY + 10 ? "none" : null);
    const topShownTick = d3.max(y.ticks(5).filter(d => y(d) >= LABEL_DY + 10));
    yAxisG.selectAll(".tick text")
      .text(d => fmtAxis(d) + (d === topShownTick ? " bbl" : ""));

    const yearTick = yr => (yr === YEAR0 || yr === PROJ_YEAR)
      ? String(yr)
      : "\u2019" + String(yr).slice(-2);
    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).tickValues([...years, PROJ_YEAR]).tickFormat(yearTick).tickSizeOuter(0))
      .call(s => s.select(".domain").attr("stroke", "#ccc"))
      .call(s => s.selectAll("text").attr("fill", "#1a1714").attr("font-size", LABEL_SIZE));
    const projLab = g.append("text")
      .attr("text-anchor", "middle").attr("font-size", LABEL_SIZE).attr("fill", "#1a1714");
    ["projected", "linear", "trend"].forEach((w, i) => {
      projLab.append("tspan").attr("x", x(PROJ_YEAR)).attr("y", ih + 29 + i * 13).text(w);
    });

    const byDesc = totals => keys.slice().sort((a, b) => (totals[b] || 0) - (totals[a] || 0));
    const areaTotalByCargo = Object.fromEntries(keys.map(k => [k, d3.sum(years, yy => rowByYear.get(yy)[k])]));
    const areaStackKeys = byDesc(areaTotalByCargo);
    const colStackKeys  = byDesc(colRow);

    const edgePx = b => Math.round(x(b));

    const sep = g.append("g").attr("fill", "#fff").attr("shape-rendering", "crispEdges");
    for (let i = 0; i < years.length - 1; i++) {
      const sx  = edgePx(years[i] + 0.5);
      const top = Math.max(totByYear[i].value, totByYear[i + 1].value);
      sep.append("rect")
        .attr("x", sx).attr("width", 1)
        .attr("y", y(top)).attr("height", Math.max(0, y(0) - y(top)));
    }

    const areaRects = [];
    years.forEach((yr, i) => {
      const row = rowByYear.get(yr);
      const x0 = edgePx(yr - 0.5) + (i === 0 ? 0 : 1);
      const x1 = edgePx(yr + 0.5);
      let yAcc = 0;
      for (const k of areaStackKeys) {
        const v = row[k] || 0;
        if (v > 0) areaRects.push({ cargo: k, year: yr, x0, x1, y0: yAcc, y1: yAcc + v });
        yAcc += v;
      }
    });

    const areaSel = g.append("g").selectAll("rect.area").data(areaRects).join("rect")
      .attr("class", "area")
      .attr("x", d => d.x0)
      .attr("width", d => Math.max(0, d.x1 - d.x0))
      .attr("y", d => y(d.y1))
      .attr("height", d => Math.max(0, y(d.y0) - y(d.y1)))
      .attr("fill", d => colorFor(d.cargo))
      .attr("fill-opacity", d => d.year < trendFrom ? 0.3 : 1)
      .attr("shape-rendering", "crispEdges")
      .on("mouseover", (event, d) => setHover(d.cargo, true))
      .on("mouseout", () => setHover(null, true));

    const cx0 = x(colLeft), cx1 = x(colRight);
    let acc = 0;
    const colSegs = colStackKeys.map(k => {
      const y0 = acc; acc += colRow[k] || 0; const y1 = acc;
      return { cargo: k, y0, y1 };
    }).filter(s => s.y1 - s.y0 > 0);

    const colSel = g.append("g").selectAll("rect.col").data(colSegs).join("rect")
      .attr("class", "col")
      .attr("x", cx0)
      .attr("width", Math.max(0, cx1 - cx0))
      .attr("y", d => y(d.y1))
      .attr("height", d => Math.max(0, y(d.y0) - y(d.y1)))
      .attr("fill", d => colorFor(d.cargo))
      .attr("stroke", d => colorFor(d.cargo)).attr("stroke-width", 0.2)
      .on("mouseover", (event, d) => setHover(d.cargo, true))
      .on("mouseout", () => setHover(null, true));

    const trendLine = d3.line().x(d => x(d.yr)).y(d => y(d.v));
    g.append("path").datum([{ yr: trendFrom, v: yAt(trendFrom) }, { yr: PROJ_YEAR, v: trend2026 }])
      .attr("fill", "none").attr("stroke", "#000").attr("stroke-width", 1.8).attr("opacity", 0.95)
      .attr("pointer-events", "none")                     // trend line never intercepts bar hovers
      .attr("d", trendLine);
    g.append("path").datum([{ yr: PROJ_YEAR, v: trend2026 }, { yr: xMax, v: trend2026 }])
      .attr("fill", "none").attr("stroke", "#000").attr("stroke-width", 1.8).attr("opacity", 0.95)
      .attr("stroke-dasharray", "2,3").attr("stroke-linecap", "round")
      .attr("pointer-events", "none")
      .attr("d", trendLine);
    g.append("circle").attr("cx", x(PROJ_YEAR)).attr("cy", y(trend2026)).attr("r", 2.6).attr("fill", "#000")
      .attr("pointer-events", "none");

    const regionStates = new Set(cfg.states || []);
    const isPRmap = regionStates.has("PR");
    const locatorPaths = isPRmap ? prPaths : mainlandPaths;
    const titleX = locatorPaths.length ? (-margin.left + MAP_W + MAP_GAP) : -margin.left;
    if (locatorPaths.length) {
      const mapG = g.append("g").attr("transform", `translate(${-margin.left},${-margin.top + MAP_PAD})`);
      if (isPRmap) {
        const clipId = "prmap-" + Math.random().toString(36).slice(2);
        mapG.append("clipPath").attr("id", clipId)
          .append("rect").attr("width", MAP_W).attr("height", MAP_H);
        mapG.attr("clip-path", `url(#${clipId})`);
      }
      mapG.selectAll("path.locator").data(locatorPaths).join("path")
        .attr("class", "locator")
        .attr("d", d => d.d)
        .attr("fill", d => regionStates.has(d.postal) ? "#000" : MAP_GREY);
    }
    const [paddLine, regionName] = cfg.title.includes(":")
      ? cfg.title.split(/:\s*/, 2)
      : [cfg.title, ""];
    g.append("text").attr("x", titleX).attr("y", titleY)
      .attr("fill", "#000").attr("font-size", TITLE_SIZE).attr("font-weight", 700)
      .text(paddLine);
    if (regionName)
      g.append("text").attr("x", titleX).attr("y", subY)
        .attr("fill", "#1a1714").attr("font-size", LABEL_SIZE)
        .text(regionName);

    const wrap = (str, maxChars) => {
      const words = str.split(/\s+/); const lines = []; let cur = "";
      for (const w of words) {
        if (!cur) cur = w;
        else if ((cur + " " + w).length <= maxChars) cur += " " + w;
        else { lines.push(cur); cur = w; }
      }
      if (cur) lines.push(cur);
      return lines;
    };
    const capLines = wrap(COLUMN_LABEL, 18);
    const capTop = ih + 18, capLineH = 13;
    const cap = g.append("text")
      .attr("text-anchor", "middle").attr("font-size", LABEL_SIZE).attr("fill", "#1a1714");
    capLines.forEach((ln, i) => {
      cap.append("tspan").attr("x", x(colMid)).attr("y", capTop + i * capLineH).text(ln);
    });

    const pctRaw = (Number.isFinite(trend2026) && trend2026 > 0 && colTotal > 0)
      ? (colTotal / trend2026) * 100
      : null;
    // title %: whole number at >=10%, nearest 0.1% below 10% — tweak the 10 threshold here
    const pctOfTrend = pctRaw == null ? null
      : (pctRaw >= 10 ? Math.round(pctRaw) : Math.round(pctRaw * 10) / 10);
    if (pctOfTrend != null) {
      g.append("text")
        .attr("x", x(colMid)).attr("y", titleY).attr("text-anchor", "middle")
        .attr("fill", "#1a1714").attr("font-size", TITLE_SIZE).attr("font-weight", 700)
        .text(`+${pctOfTrend}%`);
      const addMsg = wrap("so far, in addition to normal shipments", 22);
      const addSel = g.append("text")
        .attr("text-anchor", "middle").attr("font-size", LABEL_SIZE).attr("fill", "#1a1714");
      addMsg.forEach((ln, i) => {
        addSel.append("tspan").attr("x", x(colMid)).attr("y", subY + i * 13).text(ln);
      });
    }

    const lastCapY = capTop + (capLines.length - 1) * capLineH;
    const areaMid = (xMin + areaR) / 2;
    g.append("text")
      .attr("x", x(areaMid)).attr("y", lastCapY).attr("text-anchor", "middle")
      .attr("font-size", LABEL_SIZE).attr("fill", "#1a1714").text("Annual inter-PADD receipts");

    const front = g.append("g").attr("pointer-events", "none");
    const haloNum = sel => sel
      .attr("fill", "#1a1714").attr("stroke", "#fff").attr("stroke-width", 3)
      .attr("stroke-linejoin", "round").attr("paint-order", "stroke");

    front.selectAll("text.ytot").data(totByYear.filter(d => d.year >= trendFrom)).join("text")
      .attr("class", "ytot")
      .attr("x", d => x(d.year)).attr("y", d => Math.max(8, y(d.value) - LABEL_DY))
      .attr("text-anchor", "middle").attr("font-size", LABEL_SIZE)
      .call(haloNum)
      .text(d => fmtSig3(d.value));

    front.append("text")
      .attr("x", x(PROJ_YEAR)).attr("y", Math.max(8, y(trend2026) - LABEL_DY)).attr("dx", -10)
      .attr("text-anchor", "start").attr("font-size", LABEL_SIZE).attr("font-weight", 700)
      .call(haloNum)
      .text(fmtSig3(trend2026));

    front.append("text")
      .attr("x", x(colMid)).attr("y", Math.max(8, y(colTotal) - LABEL_DY))
      .attr("text-anchor", "middle").attr("font-size", LABEL_SIZE).attr("font-weight", 700)
      .call(haloNum)
      .text(fmtSig3(colTotal));

    const hoverLabels = g.append("g").attr("pointer-events", "none");
    const haloFill = sel => sel
      .attr("stroke", "#fff").attr("stroke-width", 3)
      .attr("stroke-linejoin", "round").attr("paint-order", "stroke");

    const areaValData = areaRects.filter(d => d.year >= trendFrom && (d.y1 - d.y0) > 0);
    const areaValSel = hoverLabels.selectAll("text.aval").data(areaValData).join("text")
      .attr("class", "aval")
      .attr("x", d => (d.x0 + d.x1) / 2)
      .attr("y", d => (y(d.y1) + y(d.y0)) / 2)
      .attr("text-anchor", "middle").attr("dominant-baseline", "central")
      .attr("font-size", LABEL_SIZE).attr("font-weight", 700)
      .attr("display", "none")
      .call(haloFill)
      .attr("fill", d => colorFor(d.cargo))
      .text(d => fmtSig3(d.y1 - d.y0));

    const colValSel = hoverLabels.selectAll("text.cval").data(colSegs).join("text")
      .attr("class", "cval")
      .attr("x", (cx0 + cx1) / 2)
      .attr("y", d => (y(d.y1) + y(d.y0)) / 2)
      .attr("text-anchor", "middle").attr("dominant-baseline", "central")
      .attr("font-size", LABEL_SIZE).attr("font-weight", 700)
      .attr("display", "none")
      .call(haloFill)
      .attr("fill", d => colorFor(d.cargo))
      .text(d => fmtSig3(d.y1 - d.y0));

    const indY = subY + 13;
    const indicatorG = g.append("g").attr("pointer-events", "none").attr("display", "none");
    const indCircle = indicatorG.append("circle").attr("cy", indY);
    const indText = indicatorG.append("text")
      .attr("y", indY).attr("dominant-baseline", "central").attr("fill", "#1a1714");
    const updateIndicator = cargo => {
      const fontPx = LEGEND_SIZE, r = 5, gap = 6;
      indText.attr("font-size", fontPx).text(cargo);
      const tw = measureText(cargo, `${fontPx}px ${fontFamily}`);
      const startX = iw / 2 - (r * 2 + gap + tw) / 2;
      indCircle.attr("cx", startX + r).attr("r", r).attr("fill", colorFor(cargo));
      indText.attr("x", startX + r * 2 + gap);
    };

    const baseAreaOp = d => (d.year < trendFrom ? 0.3 : 1);
    const apply = state => {
      const active = state.cargo;
      const fromChart = state.fromChart;
      const dim = c => (active == null || c === active) ? 1 : 0.3;
      areaSel.attr("fill-opacity", d => baseAreaOp(d) * dim(d.cargo));
      colSel.attr("fill-opacity", d => dim(d.cargo)).attr("stroke-opacity", d => dim(d.cargo));
      front.attr("display", active == null ? null : "none");
      areaValSel.attr("display", d => (active != null && d.cargo === active) ? null : "none");
      colValSel.attr("display", d => (active != null && d.cargo === active) ? null : "none");
      if (active != null && fromChart) { indicatorG.attr("display", null); updateIndicator(active); }
      else indicatorG.attr("display", "none");
    };

    return { node: html`<div style="font-family:${fontFamily};">${svg.node()}</div>`, apply };
  }

  const legendRouteColor = new Map();
  for (const d of routes) {
    const c = (d.cargo_type && String(d.cargo_type).trim()) || "Unknown";
    if (d.color && !legendRouteColor.has(c)) legendRouteColor.set(c, d.color);
  }
  const legendColorFor = c => colorOf.get(c) || legendRouteColor.get(c) || "#bbb";

  const presentCargo = (() => {
    const present = new Set();
    for (const cfg of REGIONS) {
      const domFlow = cfg.domesticFlow || "movement";
      for (const d of historicalMapped) {
        if (flowOK(d.flow_type, domFlow) && +d.year >= YEAR0 && +d.year <= YEAR1
            && cfg.histWeight(d) > 0 && +d.value_mbbl > 0) present.add(d.cargo_type);
      }
      for (const v of jonesActBarrels.voyages) {
        if (cfg.routeMatch(v.raw)) present.add(v.cargo);
      }
    }
    return present;
  })();

  const legendValidCoords = r =>
    r && isFinite(+r.load_lon) && isFinite(+r.load_lat) &&
    isFinite(+r.unload_lon) && isFinite(+r.unload_lat);
  const legendCountByType = new Map();
  for (const r of routes) {
    if (!r || !r.cargo_type) continue;
    const ct = String(r.cargo_type).trim() || "Unknown";
    if (legendValidCoords(r)) legendCountByType.set(ct, (legendCountByType.get(ct) || 0) + 1);
  }
  const legendKeys = [...presentCargo].sort((a, b) => {
    const ca = legendCountByType.get(a) || 0, cb = legendCountByType.get(b) || 0;
    return cb !== ca
      ? cb - ca
      : String(a).toLowerCase().localeCompare(String(b).toLowerCase());
  });

  function buildLegend(keys) {
    const wrap = document.createElement("div");
    Object.assign(wrap.style, {
      display: "flex", flexWrap: "wrap", alignItems: "center",
      columnGap: "18px", rowGap: "8px",
      fontFamily, fontSize: LEGEND_SIZE + "px", color: "#1a1714",
      lineHeight: "1.5", margin: "0 0 14px 0",
    });
    const refs = [];
    for (const c of keys) {
      const item = document.createElement("div");
      Object.assign(item.style, {
        display: "inline-flex", alignItems: "center", gap: "6px",
        whiteSpace: "nowrap", fontFamily, fontSize: LEGEND_SIZE + "px",
        cursor: "default", transition: "opacity 80ms linear",
      });

      const dot = document.createElement("span");
      Object.assign(dot.style, {
        width: "11px", height: "11px", borderRadius: "50%", flex: "0 0 auto",
        background: legendColorFor(c), boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
      });

      const label = document.createElement("span");
      label.textContent = c;
      Object.assign(label.style, { fontFamily, fontSize: LEGEND_SIZE + "px" });

      item.append(dot, label);
      item.addEventListener("mouseenter", () => setHover(c, false));
      refs.push({ cargo: c, item });
      wrap.append(item);
    }
    wrap.addEventListener("mouseleave", () => setHover(null, false));

    const apply = state => {
      const active = state.cargo;
      for (const { cargo, item } of refs)
        item.style.opacity = (active == null || cargo === active) ? "1" : "0.3";
    };
    return { el: wrap, apply };
  }

  let hover = { cargo: null, fromChart: false };
  let legendApply = () => {};
  let chipApplies = [];
  function setHover(cargo, fromChart) {
    if (hover.cargo === cargo && hover.fromChart === fromChart) return;
    hover = { cargo, fromChart };
    for (const c of cells) if (c.apply) c.apply(hover);
    legendApply(hover);
    for (const fn of chipApplies) fn(hover);
  }

  const TEXT_MIN_W   = 280;                                 // text needs at least this much to sit beside the chart
  const CHART_FRACTION = 0.5;                               // when side by side, the chart takes ~this share of the row

  const Tx = s => ({ t: "text", s });
  const Nm = v => ({ t: "num", v });
  const Cg = (label, cat) => ({ t: "chip", label, cat });
  const Ot = label => ({ t: "other", label });
  const Lk = (label, href) => ({ t: "link", label, href });   // inline hyperlink

  const DESCRIBE = {
    "PADD 5: West Coast": (s, cfg) => {
      // --- "last N years" of jet fuel the waiver total now exceeds ---
      const jetCat = resolveCargo("jet fuel");          // jet-fuel category key (matches historical + waiver data)
      const waiverJet = s.colByCargo.get(jetCat) || 0;  // jet-fuel barrels shipped under the waiver
      const JET_HIST_MIN_YEAR = 1980;                   // earliest year with data — tweak if history extends further back
      let jetCum = 0, jetSpanStart = JET_HIST_MIN_YEAR; // fallback start: waiver beats every year back to JET_HIST_MIN_YEAR
      // walk backward from the latest year; sporadic/zero years leave the running total flat
      for (let yr = YEAR1; yr >= JET_HIST_MIN_YEAR; yr--) {
        jetCum += histCargoSum(cfg, jetCat, yr, yr);    // running combined total, newest year first
        if (jetCum > waiverJet) { jetSpanStart = yr + 1; break; }  // first year the total tops the waiver → span begins next year
      }
      const jetYears = Math.max(0, YEAR1 - jetSpanStart + 1);      // number of most-recent years the waiver total exceeds combined
      return [
        Tx("So far, "),
        Nm(fmtBarrels(s.colTotal)),
        Tx(" barrels of petroleum products were shipped to the West Coast in the Jones Act waiver\u2019s first "),
        Nm(waiverDays),
        Tx(" days, an amount nearly "),
        Nm(fmtPct(s.pctBaseline)),
        Tx(" percent more than what the linear trend projects for the entire year. Beyond these volumes, the product mix is equally striking. While historical shipments to PADD 5 have been overwhelmingly dominated by "),
        Cg("renewable diesel", resolveCargo("renewable diesel")),
        Tx(", waiver shipments have been far more diverse, spanning "),
        Cg("gasoline", resolveCargo("gasoline")),
        Tx(", "),
        Cg("crude oil", resolveCargo("crude oil")),
        Tx(", "),
        Cg("jet fuel", jetCat),
        Tx(", and "),
        Ot("other products"),
        Tx(". More "),
        Cg("jet fuel", jetCat),
        Tx(" has been sent to the West Coast from other PADDs under the waiver than in the last "),
        Nm(jetYears),  // calculated value → rendered underlined like the others
        Tx(" years combined."),
      ];
    },

    "Puerto Rico": (s, cfg) => {
      const propaneCat = resolveCargo("propane");
      const jaPropane = s.colByCargo.get(propaneCat) || 0;
      const histPropane = histCargoSum(cfg, propaneCat, 2004, 2025);
      const propanePctMore = histPropane > 0 ? (jaPropane / histPropane - 1) * 100 : NaN;
      return [
        Tx("The waiver has delivered "),
        Nm(fmtBarrels(s.colTotal)),
        Tx(" barrels to Puerto Rico in its first "),
        Nm(waiverDays),
        Tx(" days, which is "),
        Nm(fmtPct(s.pctBaseline)),
        Tx(" percent above the annualized baseline and well on pace to exceed any prior full-year total. Of particular note are the "),
        Cg("propane", propaneCat),
        Tx(" volumes transported under the waiver. In the waiver\u2019s first "),
        Nm(waiverDays),
        Tx(" days, approximately "),
        Nm(fmtPct(propanePctMore)),
        Tx(" percent more propane was transported to Puerto Rico from the US mainland than the combined total transported between 2004-25."),
      ];
    },

    "PADD 3: Gulf Coast": () => [
      Tx("As the country\u2019s major refining hub, PADD 3 exports far more oil and petroleum products to other parts of the country than it receives. Yet even here, the waiver has proven helpful with shipments currently well above trend."),
    ],

    "PADD 1A: New England": (s) => [
      Tx("New England's waiver numbers are particularly notable given the region's chronic dependence on foreign fuel imports. The "),
      Nm(fmtBarrels(s.colTotal)),
      Tx(" barrels shipped under the waiver in "),
      Nm(waiverDays),
      Tx(" days, consisting almost entirely of "),
      Cg("gasoline", resolveCargo("gasoline")),
      Tx(" and "),
      Cg("diesel", resolveCargo("diesel")),
      Tx(", represent a "),
      Nm(fmtPct(s.pctBaseline)),
      Tx(" percent premium over the already-low projected annual baseline. This is easily the largest percentage increase among all PADDs."),
    ],

    "PADD 1B: Central Atlantic": (s) => [
      Tx("The Central Atlantic receives "),
      Nm(fmtBarrels(s.histLo)),
      Tx("\u2013"),
      Nm(fmtBarrels(s.histHi)),
      Tx(" barrels annually in normal times, so the waiver's "),
      Nm(fmtBarrels(s.colTotal)),
      Tx(" barrels represent a more modest "),
      Nm(fmtPct(s.pctBaseline)),
      Tx(" percent addition. The product mix under the waiver is dominated by "),
      Cg("crude oil", resolveCargo("crude oil")),
      Tx(" from Texas, thus validating a "),
      Lk("2017 admission from a Jones Act tanker executive", "https://www.ft.com/content/b1ea86dc-ade6-11e7-aab9-abaa44b1e130?syn-25a6b1a6=1"),
      Tx(" that if the law did not exist, more oil would flow from Texas to the East Coast."),
    ],

    "PADD 1C: Lower Atlantic": (s) => [
      Tx("With annual receipts in the "),
      Nm(fmtMillionsNum(s.histLo)),
      Tx("\u2013"),
      Nm(fmtMillionsNum(s.histHi)),
      Tx(" million barrel range, the Lower Atlantic dwarfs every other destination of Jones Act-compliant energy shipments, making the waiver's "),
      Nm(fmtBarrels(s.colTotal)),
      Tx(" barrels just "),
      Nm(fmtPct(s.pctBaseline)),
      Tx(" percent above the projected baseline. The chart nonetheless illustrates how dominant gasoline is in this corridor, largely due to the region\u2019s lack of refineries and Florida\u2019s lack of pipeline connections to Gulf Coast refineries. The waiver activity, while small in relative terms, adds an additional layer atop an already robust flow."),
    ],
  };

  function makeChip(circles, label, opts = {}) {
    const { underline = true, wrap = false } = opts;
    // circle + click-padding scale with the description text size.
    // Baseline ratios at DESC_SIZE = 18: 12px dot, 5px pad (marginLeft mirrors the pad).
    const dotPx = Math.max(1, Math.round(DESC_SIZE * 12 / 18));
    const padPx = Math.max(0, Math.round(DESC_SIZE * 5 / 18));
    const chip = document.createElement("span");
    Object.assign(chip.style, { whiteSpace: wrap ? "normal" : "nowrap", cursor: "default" });
    const refs = [];
    for (const { cat, color } of circles) {
      const hit = document.createElement("span");
      Object.assign(hit.style, {
        display: "inline-block", verticalAlign: "middle", lineHeight: "0",
        padding: padPx + "px",
        marginLeft: -padPx + "px",
        marginRight: "0px",
        cursor: "default",
      });
      const dot = document.createElement("span");
      Object.assign(dot.style, {
        display: "inline-block", width: dotPx + "px", height: dotPx + "px", borderRadius: "50%",
        background: color,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)", transition: "opacity 80ms linear",
      });
      hit.appendChild(dot);
      hit.addEventListener("mouseenter", () => setHover(cat, true));
      hit.addEventListener("mouseleave", () => setHover(null, false));
      chip.appendChild(hit);
      refs.push({ cat, el: dot });
    }
    const name = document.createElement("span");
    name.textContent = label;
    Object.assign(name.style, {
      textDecoration: underline ? "underline" : "none",
      whiteSpace: wrap ? "normal" : "nowrap",
      verticalAlign: "baseline", transition: "opacity 80ms linear",
    });
    if (circles.length === 1) {
      const cat = circles[0].cat;
      name.addEventListener("mouseenter", () => setHover(cat, true));
      name.addEventListener("mouseleave", () => setHover(null, false));
      refs.push({ cat, el: name });
    }
    chip.appendChild(name);
    return { el: chip, refs };
  }

  function buildDescription(cfg) {
    const wrap = document.createElement("div");
    Object.assign(wrap.style, { fontFamily, fontSize: DESC_SIZE + "px", lineHeight: "1.7", color: "#1a1714" });
    const segFn = DESCRIBE[cfg.title];
    if (!segFn) { wrap.textContent = "\u2014"; return { el: wrap, apply: () => {} }; }

    const stats = computeStats(cfg);
    const segs = segFn(stats, cfg);
    const named = new Set(segs.filter(x => x && x.t === "chip").map(x => x.cat));
    const chipRefs = [];

    for (const seg of segs) {
      if (typeof seg === "string") { wrap.appendChild(document.createTextNode(seg)); continue; }
      if (seg.t === "text") {
        wrap.appendChild(document.createTextNode(seg.s));
      } else if (seg.t === "num") {
        const sp = document.createElement("span");
        sp.textContent = String(seg.v);
        sp.style.textDecoration = "underline";
        sp.style.whiteSpace = "nowrap";
        wrap.appendChild(sp);
      } else if (seg.t === "chip") {
        const { el, refs } = makeChip([{ cat: seg.cat, color: chipColor(seg.cat) }], seg.label);
        wrap.appendChild(el); chipRefs.push(...refs);
      } else if (seg.t === "link") {
        const a = document.createElement("a");
        a.href = seg.href; a.target = "_blank"; a.rel = "noopener noreferrer";
        a.textContent = seg.label;
        // link styling — tweak color / weight here
        Object.assign(a.style, { color: "#c64d2d", fontWeight: "700", textDecoration: "none" });
        wrap.appendChild(a);
      } else if (seg.t === "other") {
        const circles = [...stats.colByCargo.entries()]
          .filter(([c, v]) => v > 0 && !named.has(c))
          .sort((a, b) => b[1] - a[1])
          .map(([c]) => ({ cat: c, color: chipColor(c) }));
        const { el, refs } = makeChip(circles, seg.label, { underline: false, wrap: true });
        wrap.appendChild(el); chipRefs.push(...refs);
      }
    }

    const apply = state => {
      const active = state.cargo;
      for (const { cat, el } of chipRefs) el.style.opacity = (active == null || cat === active) ? "1" : "0.3";
    };
    return { el: wrap, apply };
  }

  const COL_GAP = 56;                                     // horizontal gap between the two side-by-side chart+description units — tweak here
  const ROW_GAP = 28;                                      // vertical gap between rows / around separators
  // Layout tiers by available width (widest first):
  //   A: two charts side by side, each with its description below   (>= TWO_CHART_MIN)
  //   B: one chart beside its description                           (>= CHART_TEXT_MIN)
  //   C: one chart with its description below                       (fallback)
  const TWO_CHART_MIN  = MIN_CHART_W * 2 + COL_GAP;        // tier A: room for two charts side by side
  const CHART_TEXT_MIN = MIN_CHART_W + GAP + TEXT_MIN_W;   // tier B: room for a chart beside its text
  let regionsExpanded = false;

  const stack = html`<div style="display:flex;flex-wrap:wrap;column-gap:${COL_GAP}px;row-gap:${ROW_GAP}px;font-family:${fontFamily};"></div>`;
  const rowSeps = [];
  const cells = REGIONS.map((cfg, idx) => {
    if (idx > 0) {
      const sep = document.createElement("div");
      Object.assign(sep.style, { borderTop: "1px solid #ddd", flex: "0 0 100%", width: "100%" });
      stack.append(sep);
      rowSeps.push(sep);
    }
    const row       = html`<div style="display:flex;gap:${GAP}px;align-items:flex-start;"></div>`;
    const chartCell = html`<div style="flex:0 0 auto;min-width:0;"></div>`;
    const desc      = buildDescription(cfg);
    const textCell  = desc.el;
    chipApplies.push(desc.apply);
    row.append(chartCell, textCell);
    stack.append(row);
    return { cfg, row, chartCell, textCell, w: 0 };
  });

  const layout = () => {
    const cw = Math.floor(stack.clientWidth || (typeof width === "number" ? width : 1000));

    // pick the widest display tier that fits
    const tierA = cw >= TWO_CHART_MIN;                                 // two charts side by side, description below each
    const tierB = !tierA && cw >= CHART_TEXT_MIN;                      // one chart beside its description
    const twoCol = tierA;                                             // only tier A uses two columns
    // collapsed shows one grid row: a pair (tier A) or a single region (tiers B/C)
    const shown = regionsExpanded ? cells.length : (twoCol ? 2 : 1);
    const cellW = twoCol ? Math.floor((cw - COL_GAP) / 2) : cw;        // each region's cell width

    cells.forEach((c, i) => {
      c.row.style.display = i < shown ? "flex" : "none";
      c.row.style.flex = "0 0 auto";
      c.row.style.width = cellW + "px";
      let chartW;
      if (tierB) {                                                    // chart + text side by side within the cell
        const available = cellW - GAP;
        chartW = Math.max(MIN_CHART_W, Math.round(available * CHART_FRACTION));
        if (available - chartW < TEXT_MIN_W) chartW = available - TEXT_MIN_W;
        chartW = Math.floor(chartW);
        c.row.style.flexDirection = "row";
        c.chartCell.style.width = chartW + "px";
        c.textCell.style.flex = "1 1 0";
        c.textCell.style.width = "auto";
      } else {                                                        // tiers A & C: chart on top, text below
        chartW = cellW;
        c.row.style.flexDirection = "column";
        c.chartCell.style.width = chartW + "px";
        c.textCell.style.flex = "0 0 auto";
        c.textCell.style.width = "100%";
      }
      if (chartW > 0 && chartW !== c.w) {
        c.w = chartW;
        const r = buildChart(c.cfg, chartW);
        c.chartCell.replaceChildren(r.node);
        c.apply = r.apply;
        c.apply(hover);
      }
    });

    // separators are full-width (force a wrap). 1-col: a divider before every shown region.
    // 2-col: only before regions that start a new grid row (even index), so pairs stay together.
    rowSeps.forEach((sep, k) => {
      const beforeIdx = k + 1;
      const show = (beforeIdx < shown) && (twoCol ? beforeIdx % 2 === 0 : true);
      sep.style.display = show ? "block" : "none";
    });
  };
  const ro = new ResizeObserver(layout);
  ro.observe(stack);
  if (typeof invalidation !== "undefined") invalidation.then(() => ro.disconnect());
  requestAnimationFrame(layout);

  const out = document.createElement("div");
  // max-width must clear TWO_CHART_MIN + the 50px horizontal padding so tier A can trigger;
  // the extra ~100px lets the two charts breathe a little above their minimum size — tweak here
  Object.assign(out.style, { fontFamily, maxWidth: (TWO_CHART_MIN + 150) + "px", margin: "0 auto", padding: "0 20px", boxSizing: "border-box", textAlign: "left" });

  const sectionTitle = document.createElement("div");
  sectionTitle.textContent = "Comparing Jones Act waiver shipments between US regions to the historical trend";
  Object.assign(sectionTitle.style, { fontFamily, fontWeight: "700", fontSize: "20px", color: "#000", margin: "0 0 8px 0" });
  out.append(sectionTitle);

  const summary = document.createElement("p");
  summary.textContent = "In most regions, waiver shipments already meet or exceed the projected baseline. Arriving on top of normal volumes, they reveal unmet demand and a domestic shipping industry the Jones Act kept from forming.";
  // summary shares the description body size so the two stay visually in sync; decouple here if you want it independent
  Object.assign(summary.style, { fontFamily, fontSize: DESC_SIZE + "px", lineHeight: "1.7", color: "#1a1714", margin: "0 0 16px 0" });
  out.append(summary);

  if (legendKeys.length) {
    const lg = buildLegend(legendKeys);
    legendApply = lg.apply;
    const cargoTitle = document.createElement("span");
    cargoTitle.textContent = "Cargo types";
    Object.assign(cargoTitle.style, { fontFamily, fontWeight: "700", fontSize: LEGEND_SIZE + "px", color: "#000" });
    lg.el.prepend(cargoTitle);
    out.append(lg.el);
  }
  out.append(stack);

  const moreToggle = document.createElement("div");
  Object.assign(moreToggle.style, {
    display: "flex", alignItems: "center", gap: "8px",
    cursor: "pointer", userSelect: "none",
    fontFamily, fontWeight: "400", fontSize: "14px", lineHeight: "1.7", color: "#1a1714",
    borderTop: "1px solid #ddd", padding: "14px 0 0 0", margin: "24px 0 0 0",
  });
  const moreChevron = document.createElement("span");
  Object.assign(moreChevron.style, {
    width: "14px", display: "inline-flex", alignItems: "center", justifyContent: "center",
    lineHeight: "0", transition: "transform 0.15s ease",
  });
  moreChevron.innerHTML = `<svg viewBox="0 0 10 10" style="width:8px;height:8px;stroke:#555;stroke-width:1.5;stroke-linecap:square;fill:none;"><path d="M 2 1 L 2 8 L 9 8"/></svg>`;
  const moreLabel = document.createElement("span");
  moreToggle.append(moreLabel, moreChevron);
  const applyExpand = () => {
    moreLabel.textContent = regionsExpanded ? "Collapse" : "Expand to see more PADDs";
    moreChevron.style.transform = regionsExpanded ? "rotate(135deg)" : "rotate(-45deg)";   // up when expanded, down when collapsed
    layout();
  };
  moreToggle.addEventListener("click", () => { regionsExpanded = !regionsExpanded; applyExpand(); });
  applyExpand();
  out.append(moreToggle);

  const footer = document.createElement("div");
  Object.assign(footer.style, { maxWidth: "700px", margin: "0 auto", textAlign: "left" });
  out.append(footer);

  const sources = document.createElement("div");
  sources.style.cssText = "font: 400 12px 'Inter', sans-serif; color: #1a1714; text-align: left; box-sizing: border-box; width: 100%; padding: 6px 0 8px 0; line-height: 1.3; margin: 24px 0 0 0;";
  const srcLink = (parent, href, text) => {
    const a = document.createElement("a");
    a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.style.cssText = "color: #1a1714; font-weight: 400; text-decoration: underline;";
    a.textContent = text; parent.appendChild(a);
  };
  const srcSpan = (parent, text) => {
    const s = document.createElement("span"); s.textContent = text; parent.appendChild(s);
  };
  srcSpan(sources, "Sources: EIA US domestic ");
  srcLink(sources, "https://www.eia.gov/dnav/pet/pet_move_tb_dc_R30-R10_mbbl_a.htm", "2025");
  srcSpan(sources, ", Puerto Rico ");
  srcLink(sources, "https://www.eia.gov/dnav/pet/pet_move_expc_dc_nus-npz_mbbl_a.htm", "2025");
  srcSpan(sources, "; MARAD ");
  srcLink(sources, "https://www.maritime.dot.gov/ports/domestic-shipping/domestic-shipping", "2026");
  footer.append(sources);

  const note = document.createElement("p");
  note.textContent = "Note: PADD = Petroleum Administration Defense Districts. Both the historical (EIA) and Jones Act waiver shipments (MARAD) are between PADDs, and exclude shipments within each PADD. Because these annual volumes swing widely, the 2026 trend is projected with a Theil\u2013Sen estimator, which resists outliers.";
  Object.assign(note.style, { fontFamily, fontSize: "12px", lineHeight: "1.6", color: "#1a1714", width: "100%", margin: "4px 0 0 0" });
  footer.append(note);

  return out;
}


function _flags(FileAttachment){return(
FileAttachment("country-flags (1).json").json()
)}

function _flag(html,flags){return(
function flag(input, width = 32) {
  if (!input) return html`<span></span>`;

  // Handle "A / B / C / ..." multi-flag strings by rendering every flag
  // inside one box, each clipped to its own region:
  //   • exactly 2 flags  -> the original corner-to-corner diagonal split
  //   • 3 or more flags  -> equal pie wedges radiating from the centre
  if (input.includes("/")) {
    const parts = input.split("/").map(s => s.trim()).filter(Boolean);

    if (parts.length === 0) return html`<span></span>`;
    if (parts.length === 1) return flag(parts[0], width); // single flag

    const aspect = 4 / 3;            // flag svgs are 4:3
    const height = width / aspect;
    const n = parts.length;
    const cx = width / 2;
    const cy = height / 2;

    // unique-ish prefix so multiple compound flags on the page don't
    // share clip-path ids
    const uid = "flag-clip-" + Math.random().toString(36).slice(2, 9);

    // Build the clip region (an SVG path "d" string) and the white divider
    // line(s) for each flag.
    let regions; // string[] of path "d"
    let seps;    // [x1, y1, x2, y2][]

    if (n === 2) {
      // Preserve the original look: one diagonal from bottom-left corner
      // (0, H) to top-right corner (W, 0). First flag = bottom-left
      // triangle, second flag = top-right triangle.
      regions = [
        `M 0 0 L 0 ${height} L ${width} ${height} Z`, // bottom-left half
        `M 0 0 L ${width} 0 L ${width} ${height} Z`    // top-right half
      ];
      seps = [[0, 0, width, height]];
    } else {
      // Three or more: equal-angle wedges from the centre, starting at the
      // top (12 o'clock) and going clockwise. R overshoots the box so each
      // wedge always reaches the edges; the svg viewport clips the excess.
      const R = (width + height) * 2;
      const step = (Math.PI * 2) / n;
      const start = -Math.PI / 2;
      regions = [];
      seps = [];
      for (let i = 0; i < n; i++) {
        const a0 = start + i * step;
        const a1 = start + (i + 1) * step;
        const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
        const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
        regions.push(`M ${cx} ${cy} L ${x0} ${y0} L ${x1} ${y1} Z`);
        seps.push([cx, cy, x0, y0]); // one divider per wedge boundary
      }
    }

    // Build the SVG with the DOM API so the SVG/XHTML namespaces are always
    // correct regardless of how many layers there are.
    const SVG = "http://www.w3.org/2000/svg";
    const XHTML = "http://www.w3.org/1999/xhtml";
    const svgEl = (tag, attrs = {}) => {
      const el = document.createElementNS(SVG, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      return el;
    };

    const span = document.createElement("span");
    span.setAttribute(
      "style",
      `display:inline-block;position:relative;width:${width}px;height:${height}px;vertical-align:middle;margin:0 2px`
    );

    const svg = svgEl("svg", {
      viewBox: `0 0 ${width} ${height}`,
      width: width,
      height: height
    });
    svg.setAttribute("style", "position:absolute;inset:0;overflow:hidden");

    const defs = svgEl("defs");
    svg.appendChild(defs);

    // One clipPath + one clipped foreignObject per flag.
    regions.forEach((d, i) => {
      const clip = svgEl("clipPath", { id: `${uid}-${i}` });
      clip.appendChild(svgEl("path", { d }));
      defs.appendChild(clip);

      const fo = svgEl("foreignObject", {
        x: 0,
        y: 0,
        width: width,
        height: height,
        "clip-path": `url(#${uid}-${i})`
      });
      const div = document.createElementNS(XHTML, "div");
      div.setAttribute(
        "style",
        `width:${width}px;height:${height}px;overflow:hidden`
      );
      div.appendChild(flag(parts[i], width)); // recurse for each single flag
      fo.appendChild(div);
      svg.appendChild(fo);
    });

    // White separator line(s), drawn last so they sit on top.
    seps.forEach(([x1, y1, x2, y2]) => {
      svg.appendChild(
        svgEl("line", {
          x1, y1, x2, y2,
          stroke: "white",
          "stroke-width": 2
        })
      );
    });

    span.appendChild(svg);
    return span;
  }

  const key = input.toLowerCase().trim().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();

  // Try as a 2-letter code first, then as a name
  const code = (key.length === 2 && flags.flags[key]) ? key : flags.names[key];
  const svg = code && flags.flags[code];

  if (!svg) return html`<span style="font-size:${width * 0.4}px;color:#999" title="unknown: ${input}">?</span>`;

  return html`<span style="display:inline-block;width:${width}px;vertical-align:middle;margin:0 2px">${svg}</span>`;
}
)}

function _96(flag){return(
flag("Norway / Marshall Islands", 40)
)}

function _97(md){return(
md`## Dashboard`
)}

function _stateDefaults(){return(
{

  // Initial state. Used as-is on first load, and as the fallback
  // floor that saved values merge on top of on subsequent loads.
  defaults: {},

  // Keys from `defaults` to save in localStorage. Plain objects merge
  // subkey-by-subkey on load (saved wins); other types replace outright.
  persistedKeys: [],

}
)}

function _state(localStorage,stateDefaults){return(
((defaults, persistedKeys) => {
  const storagePrefix = (() => {
    try {
      const path = new URL(document.baseURI).pathname.substring(1).replace(/\//g, "-");
      return `notebook-${path}-state-`;
    } catch (e) {
      return "notebook-state-";
    }
  })();

  const isPlainObject = (v) =>
    v !== null && typeof v === "object" && !Array.isArray(v);

  const s = {
    ...defaults,
    persistedKeys,

    // Discrete channel: committed state changes. Listeners get the state object.
    _listeners: new Set(),
    subscribe(fn) {
      this._listeners.add(fn);
      return () => this._listeners.delete(fn);
    },
    _notifyDiscrete() {
      // Snapshot so a listener that unsubscribes during dispatch doesn't perturb iteration.
      [...this._listeners].forEach(fn => fn(this));
    },

    // Live channel: high-frequency in-flight values (e.g. tween progress).
    // Bypasses update() to avoid persistence + full re-renders 60×/sec.
    live: { from: null, to: null, progress: 0 },
    _liveListeners: new Set(),
    subscribeLive(fn) {
      this._liveListeners.add(fn);
      return () => this._liveListeners.delete(fn);
    },
    notifyLive() {
      [...this._liveListeners].forEach(fn => fn(this.live));
    },

    _storageKey(key) {
      return storagePrefix + key;
    },

    _loadKey(key) {
      let raw;
      try { raw = localStorage.getItem(this._storageKey(key)); } catch (e) { return; }
      if (raw == null) return;

      let saved;
      try {
        saved = JSON.parse(raw);
      } catch (e) {
        try { localStorage.removeItem(this._storageKey(key)); } catch (_) {}
        return;
      }

      const current = this[key];
      if (isPlainObject(saved) && isPlainObject(current)) {
        this[key] = { ...current, ...saved };
      } else {
        this[key] = saved;
      }
    },

    _saveKey(key) {
      try {
        localStorage.setItem(this._storageKey(key), JSON.stringify(this[key]));
      } catch (e) { /* quota / unavailable — keep in-memory state correct */ }
    },

    // Console helper: wipe all persisted keys for this notebook.
    resetPersisted() {
      for (const key of this.persistedKeys) {
        try { localStorage.removeItem(this._storageKey(key)); } catch (_) {}
      }
    },

    // Revert in-memory state to defaults, clear persisted storage,
    // and notify subscribers so every UI re-syncs.
    reset() {
      this.resetPersisted();
      Object.assign(this, defaults);
      this.live = { from: this.chartType, to: this.chartType, progress: 0 };
      this._notifyDiscrete();
      this.notifyLive();
    },

    update(patch) {
      Object.assign(this, patch);
      for (const key of Object.keys(patch)) {
        if (this.persistedKeys.includes(key)) this._saveKey(key);
      }
      this._notifyDiscrete();
    },
  };

  for (const key of s.persistedKeys) s._loadKey(key);
  s.live = { from: s.chartType, to: s.chartType, progress: 0 };

  return s;
})(stateDefaults.defaults, stateDefaults.persistedKeys)
)}

function _compile(attachCell,globeRoutes,timeline,routeList){return(
attachCell ? {
  cells: [
    globeRoutes,
    timeline,
    routeList
  ]
} : null
)}

function _style(html){return(
html`<style>
  /* The dashboard is a container so its width drives the responsive layout
     (no JS needed — container queries re-evaluate on width change). */
  .stkdash {
    width: 100%;
    container-type: inline-size;
    box-sizing: border-box;
  }

  /* Default (narrow): everything stacked in one column. The cargo legend
     gets its own full-width row between the stats and the globe. */
  .stkdash__grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-areas:
      "stats"
      "legend"
      "globe"
      "timeline"
      "routelist";
    gap: 0;
    align-items: start;
  }

  .stkdash__cell--stats     { grid-area: stats; }
  .stkdash__cell--legend    { grid-area: legend; margin-bottom: 8px; }
  .stkdash__cell--globe     { grid-area: globe; }
  .stkdash__cell--timeline  { grid-area: timeline; }
  .stkdash__cell--routelist { grid-area: routelist; }

  /* Wide (>= 1000px): route list (400px) on the left, globe on the right of
     the first row; timeline spans the full width on the second row. Stats
     span the full width above everything. */
  @container (min-width: 1000px) {
    .stkdash__grid {
      grid-template-columns: 400px 1fr;
      grid-template-areas:
        "stats     stats"
        "routelist globe"
        "timeline  timeline";
    }

    /* The legend is no longer its own row here. It shares the globe area and
       pins to the top-right corner, overlaying the map with a small margin —
       like the old in-globe legend. Grid items honor z-index, so it paints
       above the globe (whose internal zoom hint sits at z-index 20). */
    .stkdash__cell--legend {
      grid-area: globe;
      justify-self: end;
      align-self: start;
      margin: 8px;
      max-width: 240px;   /* keeps it single-column, as before */
      z-index: 30;
      pointer-events: auto;
    }
  }

  .stkdash__cell {
    min-width: 0;
    display: block;
  }

  .stkdash__title {
    text-align: center;
    font: 700 20px "Inter", sans-serif;
    color: #333;
    margin: 0 0 8px;
  }

  .stkdash__cell--stats {
    margin-bottom: 16px;
  }

  .stkdash__placeholder {
    font-style: italic;
    color: #666;
    padding: 12px 0;
  }
</style>`
)}

async function _routesByStateTable()
{
  const SHEET_ID = "1P6MDZYvjLlH5xu8YibvniiCjv9Fkm1tVSRCrpIL8lKo";
  const GID = 0;
  const PAD = 24; // left/right padding (px) on the table

  // ---- fetch ----
  const res = await fetch(
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  if (text.trim().startsWith("<"))
    throw new Error("Sheet returned HTML, not CSV — set sharing to 'Anyone with the link'.");

  // ---- minimal CSV parser (quoted fields, embedded commas + newlines) ----
  function parseCSV(str) {
    const rows = []; let row = [], f = "", q = false;
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (q) { if (c === '"') { if (str[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\r") { /* skip */ }
      else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
      else f += c;
    }
    if (f.length || row.length) { row.push(f); rows.push(row); }
    const h = rows.shift().map(x => x.trim());
    return rows
      .filter(r => r.length > 1 || (r.length === 1 && r[0].trim() !== ""))
      .map(r => Object.fromEntries(h.map((k, i) => [k, r[i] ?? ""])));
  }

  // ---- state + port extraction ----
  const STATES = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado",
  "Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana",
  "Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma",
  "Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee",
  "Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
  "District of Columbia","Puerto Rico","Guam","Bahamas"];
  const STSET = new Set(STATES);
  const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

  // earliest known state name in the field (handles "A / B" + trailing junk)
  const deriveState = (field) => {
    const s = norm(field);
    let best = null, bp = Infinity, bl = 0;
    for (const st of STATES) {
      const i = s.indexOf(st);
      if (i !== -1 && (i < bp || (i === bp && st.length > bl))) { best = st; bp = i; bl = st.length; }
    }
    return best;
  };
  // canonical "City, State" for the primary (first) port of an endpoint
  const portCanon = (field) => {
    const state = deriveState(field);
    let seg = norm(field).split(" / ")[0].split(" via ")[0].replace(/\s*\(.*$/, "").trim();
    let parts = seg.split(",").map(p => p.trim()).filter(Boolean);
    if (parts.length && STSET.has(parts[parts.length - 1])) parts = parts.slice(0, -1);
    const city = parts.join(", ").trim();
    return { state, label: (city || state || seg) };
  };

  // ---- aggregate ----
  // State rows: route crosses the state line => import for the arrival state,
  // export for the departure state; same state => intra.
  // Port rows: a route arriving at a port => import there, departing => export,
  // loaded & discharged at the same port => intra.
  const states = new Map();
  const portsByState = new Map();
  const es = (s) => { if (!states.has(s)) states.set(s, { state: s, import: 0, export: 0, intra: 0 }); return states.get(s); };
  const ep = (s, p) => {
    if (!portsByState.has(s)) portsByState.set(s, new Map());
    const m = portsByState.get(s);
    if (!m.has(p)) m.set(p, { label: p, import: 0, export: 0, intra: 0 });
    return m.get(p);
  };
  for (const r of parseCSV(text)) {
    const L = portCanon(r.load_port), U = portCanon(r.unload_port);
    if (!L.state || !U.state) continue;
    if (L.state === U.state) es(L.state).intra++;
    else { es(L.state).export++; es(U.state).import++; }
    if (L.label === U.label && L.state === U.state) ep(L.state, L.label).intra++;
    else { ep(L.state, L.label).export++; ep(U.state, U.label).import++; }
  }
  const total = (d) => d.import + d.export + d.intra;
  const byTotal = (a, b) => total(b) - total(a) || a.label.localeCompare(b.label);
  const stateRows = [...states.values()]
    .sort((a, b) => total(b) - total(a) || a.state.localeCompare(b.state));

  // Size the name column to the widest label across ALL rows — including
  // ports inside collapsed states — so the table width is fixed and doesn't
  // shift when states expand/collapse. Measured with the actual font.
  let nameW = 120;
  try { await document.fonts.ready; } catch (e) {}
  {
    const ctx = document.createElement("canvas").getContext("2d");
    const m = (t, w) => { ctx.font = `${w} 18px Inter, system-ui, sans-serif`; return ctx.measureText(String(t)).width; };
    nameW = m("State / port", 400);
    nameW = Math.max(nameW, m("Total", 600));
    for (const s of stateRows) {
      nameW = Math.max(nameW, 22 + m(s.state, 600));            // chevron + gap
      for (const p of portsByState.get(s.state).values())
        nameW = Math.max(nameW, 42 + m(p.label, 400));          // port indent
    }
    nameW = Math.ceil(nameW) + 6;                                // small buffer
  }
  const tableW = nameW + 3 * 76 + 3 * 8 + 2 * PAD;              // cols + gaps + padding

  // ---- render ----
  const root = document.createElement("div");
  root.className = "srt";
  root.style.setProperty("--nameW", nameW + "px");
  root.style.setProperty("--tableW", tableW + "px");
  root.innerHTML = `<style>
    .srt { font: 18px/1.4 "Inter", system-ui, sans-serif; color: #222; width: var(--tableW, fit-content); max-width: 100%; box-sizing: border-box; padding: 0; }
    .srt .srt-head, .srt .srt-state, .srt .srt-port {
      display: grid; grid-template-columns: var(--nameW, 1fr) 76px 76px 76px; column-gap: 8px; align-items: center;
    }
    .srt .srt-head {
      color: #555; padding: 0 ${PAD}px 6px; border-bottom: 2px solid #999;
    }
    .srt .srt-head .n, .srt .num { text-align: right; font-variant-numeric: tabular-nums; padding-right: 6px; }
    .srt .srt-head .n { font-weight: 700; }
    .srt .srt-group { position: relative; }
    .srt .srt-state {
      cursor: pointer; user-select: none; padding: 7px ${PAD}px; border-bottom: 1px solid #ececec;
    }
    .srt .srt-group.open .srt-state { border-bottom: none; }
    .srt .name { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
    .srt .chevron { width: 14px; display: inline-flex; align-items: center; justify-content: center;
      line-height: 0; transition: transform 0.15s ease; transform: rotate(-135deg); }
    .srt .chevron svg { width: 8px; height: 8px; stroke: #555; stroke-width: 1.5;
      stroke-linecap: square; fill: none; }
    .srt .srt-group.open .chevron { transform: rotate(-45deg); }
    .srt .st-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .srt .srt-ports {
      display: none; background: #fbfbfb; margin: 6px 0; border-radius: 2px; padding: 6px 0;
      box-shadow: inset 0 4px 6px -4px rgba(0,0,0,0.18), inset 0 -2px 4px -3px rgba(0,0,0,0.10);
    }
    .srt .srt-group.open .srt-ports { display: block; }
    .srt .srt-port { padding: 3px ${PAD}px; }
    .srt .srt-port .name { padding-left: 42px; }
    .srt .srt-port .p-name { color: #444; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .srt .zero { color: #cfcfcf; }
    .srt .srt-foot {
      display: grid; grid-template-columns: var(--nameW, 1fr) 76px 76px 76px; column-gap: 8px;
      font-weight: 600; padding: 7px ${PAD}px 0; border-top: 2px solid #999;
    }
    .srt .srt-foot .num { text-align: right; font-variant-numeric: tabular-nums; }
  </style>`;

  const head = document.createElement("div");
  head.className = "srt-head";
  head.innerHTML = `<span>State / port</span><span class="n">Import</span><span class="n">Export</span><span class="n">Intra</span>`;
  root.appendChild(head);

  const num = (v) => `<span class="num${v === 0 ? " zero" : ""}">${v}</span>`;
  const chevronSVG = `<span class="chevron"><svg viewBox="0 0 10 10"><path d="M 2 1 L 2 8 L 9 8"/></svg></span>`;

  const rowsWrap = document.createElement("div");
  rowsWrap.className = "srt-rows";

  for (const s of stateRows) {
    const group = document.createElement("div");
    group.className = "srt-group";

    const header = document.createElement("div");
    header.className = "srt-state";
    header.innerHTML =
      `<span class="name">${chevronSVG}<span class="st-name">${s.state}</span></span>` +
      num(s.import) + num(s.export) + num(s.intra);

    const ports = document.createElement("div");
    ports.className = "srt-ports";
    const plist = [...portsByState.get(s.state).values()].sort(byTotal);
    ports.innerHTML = plist.map(p =>
      `<div class="srt-port"><span class="name"><span class="p-name">${p.label}</span></span>` +
      num(p.import) + num(p.export) + num(p.intra) + `</div>`
    ).join("");

    header.addEventListener("click", () => group.classList.toggle("open"));
    group.appendChild(header);
    group.appendChild(ports);
    rowsWrap.appendChild(group);
  }
  root.appendChild(rowsWrap);

  const sum = (k) => stateRows.reduce((t, d) => t + d[k], 0);
  const foot = document.createElement("div");
  foot.className = "srt-foot";
  foot.innerHTML = `<span>Total</span>` +
    `<span class="num">${sum("import")}</span><span class="num">${sum("export")}</span><span class="num">${sum("intra")}</span>`;
  root.appendChild(foot);

  return root;
}


function _103(md){return(
md`------------------
## Key Insights`
)}

function _104(md){return(
md`Conversion formula: \`bbl = (MT × 1000) ÷ (density_kg_per_m³ × 0.1589873)\`
 
| Product | Basis / Density | Factor (bbl per metric ton) | Sources |
|---|---|---|---|
| Anhydrous ammonia | Liquid (refrigerated), 682.6 kg/m³; 1 bbl = 0.1589873 m³ | 9.2145 | [density (aqua-calc)](https://www.aqua-calc.com/calculate/weight-to-volume/substance/liquid-blank-ammonia) · [barrel definition (EIA)](https://www.eia.gov/totalenergy/data/monthly/pdf/sec12_19.pdf) |
| Petroleum coke (not calcined) | 5.0 bbl per short ton × 1.10231 short ton/MT | 5.5116 | [EIA / U.S. Bureau of Mines](https://www.eia.gov/totalenergy/data/monthly/pdf/mer_a_doc.pdf) |
| Distillate & residual fuel oils | Heavy fuel oil (UN: 6.62; GlobalShift: 6.7) | 6.7 | [UN Energy Statistics Yearbook](https://unstats.un.org/unsd/energy/yearbook/2014/09ii.pdf) · [GlobalShift](https://www.globalshift.co.uk/conv.html) |
| Monoammonium phosphate (MAP) | Granular solid (bulk), 1000 kg/m³; 1 bbl = 0.1589873 m³ | 6.2898 | [density – loose 961 / tapped 1105 kg/m³ (Nutrien)](https://products.nutrien.com/docs/1980) · [barrel definition (EIA)](https://www.eia.gov/totalenergy/data/monthly/pdf/sec12_19.pdf) |
 
*Note: ammonia uses refrigerated-liquid density (~682.6 kg/m³ → 9.2145 bbl/MT). At ambient/pressurized density (~604 kg/m³) the factor is ~10.41 bbl/MT. Petroleum coke is a solid, so its barrel figure is a volume-equivalent and approximate. MAP is also a solid, so its barrel figure is a volume-equivalent based on bulk density; at loose bulk density (961 kg/m³) the factor is ~6.5451 bbl/MT and at tapped/settled density (1105 kg/m³) it is ~5.6922 bbl/MT, with 1000 kg/m³ (6.2898) as the commonly cited midpoint.*`
)}

function _105(md){return(
md`### Map from EIA -> MARAD derived categories`
)}

function _mappingTree(cargoSheet,d3,historicalMapped,width)
{
  const fontFamily = `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
  const colorOf = new Map(cargoSheet.map(d => [d["Cargo Types"], d.Color]));
  const cargoTypes = cargoSheet.map(d => d["Cargo Types"]);

  // cargo_type -> sorted list of distinct EIA categories actually present in the data
  const byCargo = d3.rollup(
    historicalMapped,
    v => Array.from(new Set(v.map(d => d.eia_category))).sort(d3.ascending),
    d => d.cargo_type
  );

  const hasEia = ct => (byCargo.get(ct) || []).length > 0;
  const orderedCargo = [...cargoTypes.filter(hasEia), ...cargoTypes.filter(ct => !hasEia(ct))];

  const data = {
    name: "root",
    children: orderedCargo.map(ct => {
      const kids = byCargo.get(ct) || [];
      return {
        name: ct,
        color: colorOf.get(ct) || "#888",
        children: kids.length ? kids.map(e => ({ name: e })) : [{ name: "(no EIA source)", none: true }]
      };
    })
  };

  const root = d3.hierarchy(data);
  const leaves = root.leaves().length;

  const rowH = 17;
  const margin = { top: 22, right: 250, bottom: 14, left: 180 };
  const innerH = Math.max(1, leaves) * rowH;
  const innerW = Math.max(140, Math.min(width, 500) - margin.left - margin.right);
  const W = innerW + margin.left + margin.right;
  const H = innerH + margin.top + margin.bottom;

  // cluster gives nice vertical centroids; override horizontal so cargo sits hard left, EIA hard right
  d3.cluster().size([innerH, innerW])(root);
  root.each(d => { d.y = d.depth === 1 ? 0 : innerW; });

  const cargoColor = d => (d.depth === 1 ? d.data : d.parent.data).color || "#888";

  const svg = d3.create("svg")
    .attr("width", W).attr("height", H)
    .attr("viewBox", `0 0 ${W} ${H}`).style("max-width", "100%")
    .style("font-family", fontFamily).style("font-size", "12px");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // column headers
  g.append("text").attr("x", -7).attr("y", -10).attr("text-anchor", "end")
    .attr("fill", "#999").attr("font-size", 10).style("letter-spacing", ".04em")
    .text("MARAD Derived Categories");
  g.append("text").attr("x", innerW + 7).attr("y", -10).attr("text-anchor", "start")
    .attr("fill", "#999").attr("font-size", 10).style("letter-spacing", ".04em")
    .text("EIA RAW Categories");

  // links (skip the hidden root -> cargo links)
  const link = d3.linkHorizontal().x(d => d.y).y(d => d.x);
  g.append("g").attr("fill", "none")
    .selectAll("path")
    .data(root.links().filter(l => l.source.depth >= 1))
    .join("path")
    .attr("d", link)
    .attr("stroke", d => cargoColor(d.target))
    .attr("stroke-width", 1.4)
    .attr("stroke-opacity", 0.85)
    .attr("stroke-dasharray", d => d.target.data.none ? "2,3" : null);

  // nodes (depth >= 1; root hidden)
  const node = g.append("g")
    .selectAll("g")
    .data(root.descendants().filter(d => d.depth >= 1))
    .join("g")
    .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle").attr("r", d => d.data.none ? 0 : 3).attr("fill", cargoColor);

  node.append("text")
    .attr("dy", "0.32em")
    .attr("x", d => d.children ? -7 : 7)
    .attr("text-anchor", d => d.children ? "end" : "start")
    .attr("fill", cargoColor)
    .attr("font-weight", d => d.depth === 1 ? 600 : 400)
    .style("font-style", d => d.data.none ? "italic" : "normal")
    .style("opacity", d => d.data.none ? 0.5 : 1)
    .text(d => d.data.name);

  return svg.node();
}


function _107(md){return(
md`From the time line, we see a steady ramp up in both voyages and floating stock.`
)}

function _historicalMapped(historical)
{
  const categoryMap = {
    "Crude Oil": "Crude oil",
    "Finished Motor Gasoline": "Gasoline",
    "Gasoline Blending Components": "Gasoline",
    "Aviation Gasoline": "Gasoline",
    "Aviation Gasoline Blending Components": "Other petroleum products",
    "Kerosene-Type Jet Fuel": "Jet fuel / SPK",
    "Kerosene": "Other petroleum products",
    "Distillate Fuel Oil": "Diesel / ULSD",
    "Residual Fuel Oil": "Fuel oil",
    "Petrochemical Feedstocks": "Other petroleum products",
    "Special Naphthas": "Naphtha",
    "Lubricants": "Other petroleum products",
    "Waxes": "Other petroleum products",
    "Petroleum Coke": "Petroleum coke",
    "Asphalt and Road Oil": "Bitumen / Asphalt",
    "Miscellaneous Petroleum Products": "Other petroleum products",
    "Unfinished Oils": "Vacuum gas oil",
    "Propane": "Propane",
    "Propane and Propylene": "Propane",
    "Fuel Ethanol": "Ethanol",
    "Biodiesel": "Renewable fuels",
    "Renewable Diesel Fuel": "Renewable fuels",
    "Other Biofuels": "Renewable fuels",
    "MTBE": "Other petroleum products",
    "Other Oxygenates": "Other petroleum products",
    "Other Hydrocarbon Gas Liquids (derived)": "Other petroleum products",
    "Other Liquids excl. Biofuels (derived)": "Other petroleum products",
    "Unallocated (derived)": "Other petroleum products"
  };

  return historical.map(d => ({
    ...d,
    cargo_type: categoryMap[d.eia_category] ?? "UNMAPPED"
  }));
}


function _windowStats(d3)
{
  // ---- numeric primitives ---------------------------------------------------
  const SQRT2 = Math.SQRT2;
  function erf(x) { // Abramowitz & Stegun 7.1.26 (~1e-7)
    const t = 1 / (1 + 0.3275911 * Math.abs(x));
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return x >= 0 ? y : -y;
  }
  const normCdf = x => 0.5 * (1 + erf(x / SQRT2));
  function normInv(p) { // Acklam's rational approximation
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const plow = 0.02425, phigh = 1 - plow;
    let q, r;
    if (p < plow) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p <= phigh) { q = p - 0.5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  function logGamma(x) { // Lanczos
    const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
    x -= 1; let a = c[0]; const t = x + g + 0.5;
    for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  function betacf(x, a, b) {
    const MAXIT = 300, EPS = 3e-12, FPMIN = 1e-300;
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN; d = 1 / d; let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d;
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }
  function regIncBeta(x, a, b) { // regularized incomplete beta I_x(a,b)
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const front = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? front * betacf(x, a, b) / a : 1 - front * betacf(1 - x, b, a) / b;
  }
  function studentTcdf(t, df) {
    const x = df / (df + t * t);
    const ib = 0.5 * regIncBeta(x, df / 2, 0.5);
    return t > 0 ? 1 - ib : ib;
  }
  function studentTinv(p, df) { // bisection on the monotone CDF
    if (df <= 0) return NaN;
    let lo = -1e4, hi = 1e4;
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; (studentTcdf(mid, df) < p) ? lo = mid : hi = mid; }
    return (lo + hi) / 2;
  }
  // Mann–Kendall S over an ordered value array
  const mkScore = arr => { let s = 0; for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) s += Math.sign(arr[j] - arr[i]); return s; };
  // visit all permutations (iterative Heap's algorithm), including the initial order
  function eachPermutation(src, cb) {
    const a = src.slice(), c = new Array(a.length).fill(0);
    cb(a); let i = 0;
    while (i < a.length) {
      if (c[i] < i) { const j = i % 2 === 0 ? 0 : c[i]; [a[i], a[j]] = [a[j], a[i]]; cb(a); c[i]++; i = 0; }
      else { c[i] = 0; i++; }
    }
  }

  // ---- reporting / formatting ----------------------------------------------
  function decorate(r, opts) {
    // NEW: safe defaults so a chart can call the band API unconditionally on ANY
    // return path (empty / single-year / n<4) without throwing.
    if (typeof r.predictionBandAt !== "function") r.predictionBandAt = () => null;
    if (!Array.isArray(r.predictionBand)) r.predictionBand = [];
    if (r.flatBand === undefined) r.flatBand = null;

    const unit = opts.unit || "units";
    const vf = opts.valueFmt || d3.format("~s");
    const signed = v => (v < 0 ? "\u2212" : "+") + vf(Math.abs(v));
    const pct1 = v => (v < 0 ? "\u2212" : "+") + Math.abs(v).toFixed(1);
    const L = [];
    if (!r.ok || r.n < 1) L.push("Empty window \u2014 no statistics.");
    else if (r.n < 2) L.push(`n=1 \u2014 single value ${vf(r.mean)} ${unit}`);
    else if (r.n < 4) {
      L.push(`n=${r.n} \u2014 too few for a trend test`);
      L.push(`mean ${vf(r.mean)} ${unit} \u00b7 median ${vf(r.median)}`);
    } else {
      L.push(`Theil\u2013Sen ${signed(r.slopeSen)} ${unit}/yr (${pct1(r.slopePctPerYr)}%/yr)`);
      L.push(`95% slope CI [${signed(r.slopeCI[0])}, ${signed(r.slopeCI[1])}]`);
      L.push(`Mann\u2013Kendall p=${r.mkP.toFixed(3)} \u00b7 n=${r.n}`);
      L.push(r.slopeCIspansZero
        ? `CI spans 0 \u2014 direction unresolved at n=${r.n}`
        : `\u0394\u2248${pct1(r.materialityFraction * 100)}% over window`);
    }
    r.headlineLines = L;
    r.headline = L.join(" \u00b7 ");
    r.summaryHTML = buildSummary(r, opts);
    return r;
  }
  function buildSummary(r, opts) {
    const unit = opts.unit || "units";
    const f = d3.format(",.0f"), f2 = d3.format(",.3~r"), pf = d3.format("+.2f");
    if (!r.ok || r.n < 1) return `<div style="font:12px ui-sans-serif,system-ui,sans-serif;color:#a00;">Empty window \u2014 no statistics.</div>`;
    const rows = [];
    rows.push(`<b>n = ${r.n}</b>${r.message ? ` &nbsp;<span style="color:#888;">${r.message}</span>` : ""}`);
    rows.push(`Mean ${f(r.mean)} ${unit}${r.meanCI ? ` &nbsp;95% CI [${f(r.meanCI[0])}, ${f(r.meanCI[1])}]` : ""} &nbsp;\u00b7&nbsp; Median ${f(r.median)}`);
    if (r.n >= 4) {
      rows.push(`Theil\u2013Sen slope <b>${f2(r.slopeSen)}</b> ${unit}/yr (${pf(r.slopePctPerYr)}%/yr) &nbsp;95% CI [${f2(r.slopeCI[0])}, ${f2(r.slopeCI[1])}]`);
      rows.push(`OLS slope ${f2(r.slopeOLS)} ${unit}/yr <span style="color:#888;">(for contrast only)</span>`);
      rows.push(`Mann\u2013Kendall S=${r.mkS}, p=${r.mkP.toFixed(4)} <span style="color:#888;">(${r.mkMethod})</span>`);
      rows.push(`Implied change over window \u2248 ${d3.format("+.1%")(r.materialityFraction)} of the mean <span style="color:#888;">(practical, not just statistical, significance)</span>`);
      const pi = r.projAtX0.predInterval;
      rows.push(`Projection @ ${r.projAtX0.x0}: flat ${f(r.projAtX0.flat)} \u00b7 sloped ${f(r.projAtX0.sloped)} ${unit}; interval [${f(pi.lower)}, ${f(pi.upper)}] <span style="color:#888;">(${pi.method})</span>`);
      const d = r.diagnostics;
      rows.push(`<span style="color:#888;">Diagnostics:</span> OLS\u2212Sen gap ${f2(d.olsSenGap.abs)} (${d3.format("+.0%")(d.olsSenGap.rel)}); most-influential year <b>${d.mostInfluentialYear.year}</b>${d.mostInfluentialYear.flipsSign ? ' <span style="color:#a00;">(removal flips slope sign)</span>' : ""}; lag-1 r\u2081=${f2(d.r1)}${d.r1Flag ? " \u26a0" : ""}; mean\u2212median ${f2(d.meanMedianGap.abs)}${d.leverageFlag ? ' &nbsp;<span style="color:#a60;">[leverage flag \u2192 robust projection path]</span>' : ""}`);
      rows.push(`<span style="color:#a60;">${r.powerCaveat}</span>`);
      r.assumptions.forEach(a => rows.push(`<span style="color:#888;">\u2022 ${a}</span>`));
    }
    return `<div style="font:12px/1.55 ui-sans-serif,system-ui,sans-serif;">${rows.map(x => `<div>${x}</div>`).join("")}</div>`;
  }

  // ---- main ------------------------------------------------------------------
  function computeWindowStats(rawPoints, opts = {}) {
    const conf = opts.conf ?? 0.95;
    const alpha = 1 - conf;

    // Step 0 — extraction & guards
    let pts = (rawPoints || [])
      .filter(p => p && Number.isFinite(+p.year) && Number.isFinite(+p.value))
      .map(p => ({ year: +p.year, value: +p.value }));
    const dedup = new Map(); for (const p of pts.sort((a, b) => a.year - b.year)) dedup.set(p.year, p);
    pts = [...dedup.values()].sort((a, b) => a.year - b.year);
    const n = pts.length;
    const ys = pts.map(p => p.value), xs = pts.map(p => p.year);
    const base = { n, points: pts, conf, ok: true };

    if (n < 1) return decorate({ ...base, ok: false, message: "Empty window." }, opts);
    if (n < 2) return decorate({ ...base, mean: ys[0], median: ys[0], message: "Single year \u2014 no spread or trend." }, opts);

    // Step 1 — central tendency
    const m = d3.mean(ys), med = d3.median(ys);
    const sd = d3.deviation(ys);                 // sample SD (n\u22121)
    const seMean = sd / Math.sqrt(n);
    const meanCI = [m - studentTinv(1 - alpha / 2, n - 1) * seMean, m + studentTinv(1 - alpha / 2, n - 1) * seMean];
    const meanMedianGap = { abs: m - med, rel: m !== 0 ? (m - med) / m : NaN };

    if (n < 4) return decorate({ ...base, mean: m, median: med, sd, seMean, meanCI, diagnostics: { meanMedianGap }, message: `n=${n} \u2014 central tendency only (below Mann\u2013Kendall minimum).` }, opts);

    // Step 2 — slopes (Theil\u2013Sen primary, OLS for contrast)
    const pairSlopes = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const dx = xs[j] - xs[i]; if (dx !== 0) pairSlopes.push((ys[j] - ys[i]) / dx); }
    const slopeSen = d3.median(pairSlopes);
    const xbar = d3.mean(xs), ybar = d3.mean(ys);
    let Sxx = 0, Sxy = 0; for (let i = 0; i < n; i++) { Sxx += (xs[i] - xbar) ** 2; Sxy += (xs[i] - xbar) * (ys[i] - ybar); }
    const slopeOLS = Sxx > 0 ? Sxy / Sxx : 0, olsIntercept = ybar - slopeOLS * xbar;
    const slopePctPerYr = m !== 0 ? slopeSen / m * 100 : NaN;
    const b0 = d3.median(pts.map(p => p.value - slopeSen * p.year)); // robust intercept

    // Step 3 — Mann\u2013Kendall S, tie-corrected variance, n-branched p-value
    const S = mkScore(ys);
    const counts = new Map(); for (const v of ys) counts.set(v, (counts.get(v) || 0) + 1);
    let tieSum = 0; for (const t of counts.values()) if (t > 1) tieSum += t * (t - 1) * (2 * t + 5);
    const varS = (n * (n - 1) * (2 * n + 5) - tieSum) / 18;

    let mkP, mkMethod;
    if (n <= 10) {
      const absObs = Math.abs(S); let count = 0, total = 0;
      if (n <= 8) {
        eachPermutation(ys, a => { total++; if (Math.abs(mkScore(a)) >= absObs) count++; });
        mkMethod = `permutation (exact, ${total.toLocaleString()} orderings)`;
      } else {
        const a = ys.slice(); total = 10000;
        for (let r = 0; r < total; r++) { for (let i = a.length - 1; i > 0; i--) { const k = (Math.random() * (i + 1)) | 0;[a[i], a[k]] = [a[k], a[i]]; } if (Math.abs(mkScore(a)) >= absObs) count++; }
        mkMethod = "permutation (10,000 random)";
      }
      mkP = count / total;
    } else {
      const z = varS > 0 ? (S - Math.sign(S)) / Math.sqrt(varS) : 0;
      mkP = 2 * (1 - normCdf(Math.abs(z)));
      mkMethod = "normal approximation (continuity-corrected)";
    }

    // Step 4 — distribution-free slope CI (Gilbert rank method)
    const Np = pairSlopes.length;
    const C = normInv(1 - alpha / 2) * Math.sqrt(Math.max(varS, 0));
    const sorted = pairSlopes.slice().sort((a, b) => a - b);
    const rankVal = rank => {
      const r = Math.min(Math.max(rank, 1), Np), lo = Math.floor(r), hi = Math.ceil(r), frac = r - lo;
      return sorted[lo - 1] + frac * (sorted[hi - 1] - sorted[lo - 1]);
    };
    const M1 = (Np - C) / 2, M2 = (Np + C) / 2;
    const slopeCI = [rankVal(M1), rankVal(M2 + 1)].sort((a, b) => a - b);
    const slopeCIspansZero = slopeCI[0] < 0 && slopeCI[1] > 0;

    // Step 7 — diagnostics (needed before the projection's leverage decision)
    let mostInf = { year: null, slopeWithout: NaN, deltaSlope: 0, flipsSign: false };
    for (let k = 0; k < n; k++) {
      const sl = [];
      for (let i = 0; i < n; i++) { if (i === k) continue; for (let j = i + 1; j < n; j++) { if (j === k) continue; const dx = xs[j] - xs[i]; if (dx !== 0) sl.push((ys[j] - ys[i]) / dx); } }
      if (!sl.length) continue;
      const s2 = d3.median(sl);
      if (Math.abs(s2 - slopeSen) >= Math.abs(mostInf.deltaSlope))
        mostInf = { year: xs[k], slopeWithout: s2, deltaSlope: s2 - slopeSen, flipsSign: slopeSen !== 0 && Math.sign(s2) !== Math.sign(slopeSen) };
    }
    const olsSenGap = { abs: slopeOLS - slopeSen, rel: slopeSen !== 0 ? (slopeOLS - slopeSen) / Math.abs(slopeSen) : (slopeOLS === 0 ? 0 : Infinity) };
    let num = 0, den = 0; for (let i = 0; i < n; i++) den += (ys[i] - ybar) ** 2; for (let i = 1; i < n; i++) num += (ys[i] - ybar) * (ys[i - 1] - ybar);
    const r1 = den > 0 ? num / den : 0, r1Flag = Math.abs(r1) > 2 / Math.sqrt(n);
    const signsDiffer = slopeSen !== 0 && slopeOLS !== 0 && Math.sign(slopeOLS) !== Math.sign(slopeSen);
    const leverageFlag = signsDiffer || mostInf.flipsSign || Math.abs(olsSenGap.rel) > 0.5;

    // Step 5 — materiality (practical vs statistical significance)
    const span = xs[n - 1] - xs[0];
    const materialityFraction = m !== 0 ? slopeSen * span / m : NaN;

    // Step 6 — forward projection + prediction BAND (both benchmarks; widening interval)
    // IMPORTANT: x is in the SAME units the line was fit in (YEARS). When overlaying on a
    // daily/date axis, call these with fractional-year x and map the returned
    // center/lower/upper onto the date axis for plotting. Do NOT recompute Sxx in days.
    const x0 = Number.isFinite(opts.x0) ? +opts.x0 : xs[n - 1];
    const flatProj = m, slopedProj = b0 + slopeSen * x0;

    // optional floor (e.g. 0 for barrels). null \u2192 no clamp \u2192 existing outputs unchanged.
    const clampMin = Number.isFinite(opts.clampMin) ? +opts.clampMin : null;
    const clamp = v => (clampMin === null ? v : Math.max(v, clampMin));

    // bandAt(x): trend prediction band at x. Same branch (parametric vs robust) as the
    // single-point interval below, so the band passes exactly through projAtX0.predInterval.
    let bandAt;
    if (!leverageFlag) {
      let sse = 0; for (let i = 0; i < n; i++) sse += (ys[i] - (olsIntercept + slopeOLS * xs[i])) ** 2;
      const sRes = Math.sqrt(sse / (n - 2));
      const tCrit = studentTinv(1 - alpha / 2, n - 2);
      bandAt = x => {
        const center = olsIntercept + slopeOLS * x;
        const hw = tCrit * sRes * Math.sqrt(1 + 1 / n + (x - xbar) ** 2 / Sxx);
        return { x, center: clamp(center), lower: clamp(center - hw), upper: clamp(center + hw), method: "parametric (OLS prediction interval)" };
      };
    } else {
      bandAt = x => {
        const center = b0 + slopeSen * x;
        const lever = x - xbar, dLo = (slopeCI[0] - slopeSen) * lever, dHi = (slopeCI[1] - slopeSen) * lever;
        return { x, center: clamp(center), lower: clamp(center + Math.min(dLo, dHi)), upper: clamp(center + Math.max(dLo, dHi)), method: "robust (Sen slope-CI at lever arm)" };
      };
    }

    // single-point interval kept shape-identical (no extra keys) for existing callers
    const _p0 = bandAt(x0);
    const predInterval = { center: _p0.center, lower: _p0.lower, upper: _p0.upper, method: _p0.method };

    // flat-benchmark prediction band: constant width around the MEAN (df = n\u22121),
    // for when a chart draws the flat benchmark (mean) instead of the sloped line.
    const _hwFlat = studentTinv(1 - alpha / 2, n - 1) * sd * Math.sqrt(1 + 1 / n);
    const flatBand = { center: clamp(m), lower: clamp(m - _hwFlat), upper: clamp(m + _hwFlat), halfWidth: _hwFlat, method: "flat prediction interval (mean \u00b1 t\u00b7s\u00b7\u221a(1+1/n))" };

    // precomputed envelope (convenience). Override with opts.bandX (explicit YEARS) or
    // opts.bandRange=[lo,hi] (YEARS) + opts.bandSteps; defaults to window start \u2192 x0.
    const predictionBand = (() => {
      if (Array.isArray(opts.bandX) && opts.bandX.length) return opts.bandX.filter(Number.isFinite).map(bandAt);
      let lo, hi;
      if (Array.isArray(opts.bandRange) && opts.bandRange.length === 2) { [lo, hi] = opts.bandRange.map(Number); }
      else { lo = Math.min(xs[0], x0); hi = Math.max(xs[n - 1], x0); }
      const steps = Number.isInteger(opts.bandSteps) && opts.bandSteps > 1 ? opts.bandSteps : 64;
      if (!(hi > lo)) return [bandAt(lo)];
      const out = []; for (let i = 0; i < steps; i++) out.push(bandAt(lo + (hi - lo) * i / (steps - 1)));
      return out;
    })();

    const powerCaveat = `n=${n}: ` + (
      n < 8 ? "very low power \u2014 a non-significant Mann\u2013Kendall result means the window cannot distinguish a real trend from flatness, not that the lane is flat."
        : n < 15 ? "limited power \u2014 read a non-significant result as inconclusive, not 'flat'."
          : "moderate power \u2014 still treat borderline p-values as inconclusive at annual resolution.");

    const assumptions = [
      "Sloped benchmark assumes the historical trajectory would have continued into the projection period absent any intervention \u2014 an unverifiable counterfactual (parallel-trends-style) assumption.",
      "Annual resolution only; no within-year structure is implied or interpolated."
    ];
    if (r1Flag) assumptions.push("Lag-1 autocorrelation flagged: the Mann\u2013Kendall p-value may be anticonservative; a Hamed\u2013Rao modified variance is the refinement (reported as a diagnostic, not auto-applied).");

    return decorate({
      ...base,
      mean: m, median: med, sd, seMean, meanCI,
      slopeSen, slopeOLS, slopePctPerYr, slopeCI, intercept: b0, olsIntercept,
      mkS: S, mkP, mkMethod, varS,
      projAtX0: { x0, flat: flatProj, sloped: slopedProj, predInterval },
      materialityFraction, slopeCIspansZero,
      diagnostics: { olsSenGap, mostInfluentialYear: mostInf, r1, r1Flag, meanMedianGap, leverageFlag },
      assumptions, powerCaveat,
      // --- ADDED: prediction band (purely additive; no existing field is changed) ---
      predictionBandAt: bandAt,   // (xInYears) -> { x, center, lower, upper, method }
      predictionBand,             // precomputed envelope across opts grid / default range
      flatBand                    // constant-width prediction band around the mean
    }, opts);
  }

  return computeWindowStats;
}


function _110(md){return(
md`### Historical annual data from EIA between PADDs`
)}

function _comparisonChart(d3,cargoSheet,historicalMapped,width,html,windowStats)
{
  const fmt = d3.format(",");
  // K=thousand, M=million, B=billion, T=trillion (remap d3's lowercase k and giga G)
  const siFix = { k: "K", G: "B" };
  const fmtAxis = n => d3.format("~s")(n).replace(/[kG]/, m => siFix[m]);
  const fontFamily = `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
  const brushBlue = "#1f77b4";

  const THOUSAND = 1000;                                  // thousand bbl -> bbl
  const daysInYear = y => ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) ? 366 : 365;

  const colorOf = new Map(cargoSheet.map(d => [d["Cargo Types"], d.Color]));
  const cargoOrder = cargoSheet.map(d => d["Cargo Types"]);

  // mainland coast PADDs (used for US Coast totals + the base filter); PR is added
  // separately so it can be selected on its own but never folded into US Coast.
  const mainlandPadds = ["PADD 1", "PADD 1A", "PADD 1B", "PADD 1C", "PADD 3", "PADD 5"];
  const padds = [...mainlandPadds, "Puerto Rico"];
  const flowTypes = ["import", "movement", "export_to_pr"];
  const base = historicalMapped.filter(d =>
    flowTypes.includes(d.flow_type) &&
    padds.includes(d.end_padd)
  );

  const present = new Set(base.filter(d => +d.value_mbbl > 0).map(d => d.cargo_type));
  const keys = cargoOrder.filter(c => present.has(c));

  const years = Array.from(new Set(base.map(d => +d.year))).sort((a, b) => a - b);
  const yearExtent = d3.extent(years);

  // ---- PADD 1 subregion attribution ---------------------------------------
  // For a single-subzone view, flows recorded against bare "PADD 1" (which have no
  // subzone breakdown) are divided evenly across the three subzones:
  //   - PADD 5 -> 1 domestic movements  (per request)
  //   - foreign imports into PADD 1      (only when SPLIT_IMPORTS is true)
  // 1A + 1B + 1C therefore reconstructs the "PADD 1: East Coast" totals exactly.
  const SUBZONE_SHARE = 1 / 3;
  const SPLIT_IMPORTS = true;   // false -> a lone subzone shows no foreign imports
  const EAST = ["PADD 1", "PADD 1A", "PADD 1B", "PADD 1C"];

  // contribution multiplier for one subzone view, given a row's end_padd + flow
  const subzoneWeight = (sub, ep, flow) =>
    ep === sub      ? 1 :                                  // PADD 3 -> this subzone (real data)
    ep === "PADD 1" ? (flow === "import" ? (SPLIT_IMPORTS ? SUBZONE_SHARE : 0) : SUBZONE_SHARE)
                    : 0;                                   // movement here = PADD 5 -> 1

  // each zone -> weight(end_padd, flow): how much of a row counts toward this zone.
  // A zone may also override importFlow / domesticFlow (the flow_type feeding each
  // panel; defaults "import" / "movement") and the two panel labels.
  const zones = {
    "PADD 1: East Coast":        { weight: ep => EAST.includes(ep) ? 1 : 0 },
    "PADD 1A: New England":      { weight: (ep, f) => subzoneWeight("PADD 1A", ep, f) },
    "PADD 1B: Central Atlantic": { weight: (ep, f) => subzoneWeight("PADD 1B", ep, f) },
    "PADD 1C: Lower Atlantic":   { weight: (ep, f) => subzoneWeight("PADD 1C", ep, f) },
    "PADD 3: Gulf Coast":        { weight: ep => ep === "PADD 3" ? 1 : 0 },
    "PADD 5: West Coast":        { weight: ep => ep === "PADD 5" ? 1 : 0 },
    "US Coast":                  { weight: ep => mainlandPadds.includes(ep) ? 1 : 0 },
    "Puerto Rico":               {
      weight: ep => ep === "Puerto Rico" ? 1 : 0,
      importFlow: "import",            // foreign imports arriving directly into PR (if any)
      domesticFlow: "export_to_pr",    // shipments from the U.S. mainland to PR
      importLabel: "Foreign imports into Puerto Rico",
      domesticLabel: "Shipments from U.S. mainland"
    }
  };

  function buildRows(flow, zone) {
    const m = new Map(years.map(y => [y, Object.fromEntries(keys.map(k => [k, 0]))]));
    for (const d of base) {
      if (d.flow_type !== flow) continue;
      const w = zone.weight(d.end_padd, flow);
      if (!w) continue;
      const row = m.get(+d.year);
      if (row && d.cargo_type in row) row[d.cargo_type] += +d.value_mbbl * w;
    }
    return years.map(y => ({ year: y, ...m.get(y) }));   // values still in THOUSAND bbl
  }
  const sumBy = rows => {
    const o = Object.fromEntries(keys.map(k => [k, 0]));
    for (const r of rows) for (const k of keys) o[k] += r[k];
    return o;
  };
  const extendEdges = rows => rows.length
    ? [{ ...rows[0], year: yearExtent[0] - xPad }, ...rows, { ...rows[rows.length - 1], year: yearExtent[1] + xPad }]
    : rows;

  // ---- unit / display-mode state ------------------------------------------
  let mode = "daily";                  // "daily" | "annual"  (set from modeSelect in render)
  let unitLabel = "Barrels per day";
  let aggLabel = "Avg barrels/day";

  const convYear = (thousandVal, year) =>
    thousandVal * THOUSAND / (mode === "daily" ? daysInYear(year) : 1);
  const toDisplayRows = rows => rows.map(r => {
    const o = { year: r.year };
    for (const k of keys) o[k] = convYear(r[k] || 0, r.year);
    return o;
  });

  const legendW = 260;
  const plotW = Math.max(320, width - legendW - 24);
  const H = 220, margin = { top: 30, right: 14, bottom: 22, left: 34 };
  const iw = plotW - margin.left - margin.right;
  const ih = H - margin.top - margin.bottom;
  const xPad = 0.5;
  const x = d3.scaleLinear().domain([yearExtent[0] - xPad, yearExtent[1] + xPad]).range([0, iw]);
  const seriesMax = s => d3.max(s.length ? s[s.length - 1] : [], d => d[1]) || 1;
  // whole years inside a snapped brush selection [px0, px1]
  const brushedYearRange = sel => [
    Math.ceil(x.invert(sel[0]) + 1e-6),
    Math.floor(x.invert(sel[1]) - 1e-6)
  ];

  let sortCol = "mov", sortDir = "desc";   // default: Domestic descending
  const hidden = new Set();
  let legendRows = [];
  let clickTimer = null;
  let clipId = 0;
  let timeSel = null;                      // brushed pixel range [x0,x1] (or null)
  let areaApply = () => {};                // pushes timeSel into both area charts (dimming)
  let trendApply = () => {};               // recomputes + draws the trend overlay

  function orderKeys(imp, mov) {
    const asc =
      sortCol === "imp" ? keys.slice().sort((a, b) => imp[a] - imp[b]) :
      sortCol === "cargo" ? keys.slice().sort((a, b) => a.localeCompare(b)) :
      keys.slice().sort((a, b) => mov[a] - mov[b]);
    return sortDir === "desc" ? asc.reverse() : asc;
  }
  function clickSort(col) {
    if (sortCol === col) sortDir = sortDir === "asc" ? "desc" : "asc";
    else { sortCol = col; sortDir = col === "cargo" ? "asc" : "desc"; }
    render();
  }
  function toggleHide(k) { hidden.has(k) ? hidden.delete(k) : hidden.add(k); render(); }
  function isolateOrReset(k) {
    const visible = keys.filter(x => !hidden.has(x));
    hidden.clear();
    if (!(visible.length === 1 && visible[0] === k))
      for (const x of keys) if (x !== k) hidden.add(x);
    render();
  }

  function highlight(key) {
    for (const slot of [importSlot, moveSlot])
      for (const p of slot.querySelectorAll("path.area"))
        p.style.opacity = (key === null || p.dataset.cargo === key) ? 1 : 0.3;
    for (const { key: k, el, off } of legendRows)
      el.style.opacity = key === null ? (off ? 0.4 : 1) : (k === key ? 1 : 0.3);
  }

  function drawChart(series, yMax) {
    const id = ++clipId;
    const y = d3.scaleLinear().domain([0, yMax]).nice().range([ih, 0]);
    const area = d3.area().x(d => x(d.data.year)).y0(d => y(d[0])).y1(d => y(d[1])).curve(d3.curveStep);
    const svg = d3.create("svg")
      .attr("width", plotW).attr("height", H)
      .attr("viewBox", `0 0 ${plotW} ${H}`).style("max-width", "100%").style("overflow", "visible")
      .on("mouseleave", () => highlight(null));
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(fmtAxis).tickSize(-iw))
      .call(s => s.select(".domain").remove())
      .call(s => s.selectAll(".tick line").attr("stroke", "#eee"))
      .call(s => s.selectAll("text").attr("fill", "#777").attr("font-size", 10));
    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")))
      .call(s => s.select(".domain").attr("stroke", "#ccc"))
      .call(s => s.selectAll("text").attr("fill", "#777").attr("font-size", 10));

    const defs = svg.append("defs");
    const midRect = defs.append("clipPath").attr("id", `clipMid-${id}`)
      .append("rect").attr("x", 0).attr("y", 0).attr("width", iw).attr("height", ih);
    const outClip = defs.append("clipPath").attr("id", `clipOut-${id}`);
    const outL = outClip.append("rect").attr("x", 0).attr("y", 0).attr("width", 0).attr("height", ih);
    const outR = outClip.append("rect").attr("x", iw).attr("y", 0).attr("width", 0).attr("height", ih);
    defs.append("clipPath").attr("id", `clipPlot-${id}`)
      .append("rect").attr("x", 0).attr("y", 0).attr("width", iw).attr("height", ih);

    const layer = (clip, op) => {
      const gl = g.append("g").attr("clip-path", `url(#${clip})`).attr("opacity", op);
      gl.selectAll("path.area").data(series).join("path")
        .attr("class", "area").attr("data-cargo", d => d.key)
        .attr("fill", d => colorOf.get(d.key) || "#ccc")
        .attr("stroke", d => colorOf.get(d.key)).attr("stroke-width", 0.2)
        .attr("d", area)
        .on("mouseover", (event, d) => highlight(d.key));
      return gl;
    };
    layer(`clipMid-${id}`, 1);    // selected (middle)
    layer(`clipOut-${id}`, 0.3);  // unselected (left + right)

    g.append("text")
      .attr("x", 0).attr("y", -16).attr("text-anchor", "start")
      .attr("fill", "#999").attr("font-size", 10).text(unitLabel);

    // trend overlay (drawn on top; lines clipped to plot, conclusion text unclipped)
    const plotClip = `url(#clipPlot-${id})`;
    const overlay = g.append("g").attr("class", "trend-overlay").style("pointer-events", "none");

    function applySel(sel) {
      if (!sel) {
        midRect.attr("x", 0).attr("width", iw);
        outL.attr("x", 0).attr("width", 0);
        outR.attr("x", iw).attr("width", 0);
      } else {
        const x0 = Math.max(0, Math.min(iw, sel[0])), x1 = Math.max(0, Math.min(iw, sel[1]));
        midRect.attr("x", x0).attr("width", Math.max(0, x1 - x0));
        outL.attr("x", 0).attr("width", Math.max(0, x0));
        outR.attr("x", x1).attr("width", Math.max(0, iw - x1));
      }
    }

    function drawTrend(stats) {
      overlay.selectAll("*").remove();
      if (!stats) return;
      const pts = stats.points || [];
      if (stats.n >= 2 && pts.length >= 2) {
        const yr0 = pts[0].year, yr1 = pts[pts.length - 1].year;
        const lineG = overlay.append("g").attr("clip-path", plotClip);
        if (Number.isFinite(stats.mean))
          lineG.append("line")
            .attr("x1", x(yr0)).attr("x2", x(yr1)).attr("y1", y(stats.mean)).attr("y2", y(stats.mean))
            .attr("stroke", "#333").attr("stroke-width", 1).attr("stroke-dasharray", "2,3").attr("opacity", 0.85);
        if (stats.n >= 4 && Number.isFinite(stats.slopeSen)) {
          const yAt = yr => stats.intercept + stats.slopeSen * yr;
          lineG.append("line")
            .attr("x1", x(yr0)).attr("x2", x(yr1)).attr("y1", y(yAt(yr0))).attr("y2", y(yAt(yr1)))
            .attr("stroke", "#111").attr("stroke-width", 1.8).attr("opacity", 0.95);
        }
        // exponential (log-linear) fit, sampled as a smooth curve across the window.
        // Uses windowStats' expTrend (Theil-Sen-in-log) projection; only drawn when the
        // fit is valid (all in-window totals > 0 and enough points).
        if (stats.n >= 4 && stats.expTrend && stats.expTrend.ok) {
          const projAt = typeof stats.expTrend.projAt === "function"
            ? stats.expTrend.projAt
            : (yr => Math.exp(stats.expTrend.interceptLogSen + stats.expTrend.slopeLogSen * yr));
          const STEPS = 48;
          const expData = d3.range(STEPS + 1)
            .map(i => { const yr = yr0 + (yr1 - yr0) * (i / STEPS); return { yr, v: projAt(yr) }; })
            .filter(d => Number.isFinite(d.v));
          if (expData.length >= 2)
            lineG.append("path")
              .datum(expData)
              .attr("fill", "none").attr("stroke", "#2b6cb0").attr("stroke-width", 1.8).attr("opacity", 0.95)
              .attr("d", d3.line().x(d => x(d.yr)).y(d => y(d.v)));
        }
      }
      const L = stats.headlineLines || [];
      if (L.length) {
        const vc = stats.slopeCIspansZero === undefined ? "#444" : (stats.slopeCIspansZero ? "#9a6700" : "#1f7a3d");
        const tg = overlay.append("g").attr("transform", `translate(${iw - 4},-41)`);
        L.forEach((ln, i) => {
          tg.append("text").attr("x", 0).attr("y", i * 12).attr("text-anchor", "end")
            .attr("font-family", fontFamily).attr("font-size", 9.5)
            .attr("fill", i === L.length - 1 ? vc : "#444")
            .style("paint-order", "stroke").attr("stroke", "#fff").attr("stroke-width", 3).attr("stroke-linejoin", "round")
            .text(ln);
        });
      }
    }

    return { node: svg.node(), applySel, drawTrend };
  }

  function buildLineGraph(importDisp, moveDisp, vis) {
    const lineH = 104;
    const m = { top: 14, right: margin.right, bottom: 18, left: margin.left };
    const liw = plotW - m.left - m.right;
    const lih = lineH - m.top - m.bottom;
    const totalByYear = rows => extendEdges(rows).map(r => ({ year: r.year, v: d3.sum(vis, k => r[k] || 0) }));
    const impTot = totalByYear(importDisp), movTot = totalByYear(moveDisp);
    const yMax = d3.max([...impTot, ...movTot], d => d.v) || 1;
    const yL = d3.scaleLinear().domain([0, yMax]).nice().range([lih, 0]);

    const IMP_C = "#444", DOM_C = "#e07b39";
    const svg = d3.create("svg")
      .attr("width", plotW).attr("height", lineH)
      .attr("viewBox", `0 0 ${plotW} ${lineH}`).style("max-width", "100%")
      .style("font-family", fontFamily);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);
    g.append("g")
      .call(d3.axisLeft(yL).ticks(3).tickFormat(fmtAxis).tickSize(-liw))
      .call(s => s.select(".domain").remove())
      .call(s => s.selectAll(".tick line").attr("stroke", "#eee"))
      .call(s => s.selectAll("text").attr("fill", "#777").attr("font-size", 10));
    g.append("g").attr("transform", `translate(0,${lih})`)
      .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")))
      .call(s => s.select(".domain").attr("stroke", "#ccc"))
      .call(s => s.selectAll("text").attr("fill", "#777").attr("font-size", 10));

    const lineGen = d3.line().x(d => x(d.year)).y(d => yL(d.v));
    g.append("path").datum(impTot).attr("fill", "none").attr("stroke", IMP_C).attr("stroke-width", 1.6).attr("d", lineGen);
    g.append("path").datum(movTot).attr("fill", "none").attr("stroke", DOM_C).attr("stroke-width", 1.6).attr("d", lineGen);

    const leg = g.append("g").attr("transform", `translate(${liw},0)`);
    [[lineImpLegend, IMP_C, 0], [lineDomLegend, DOM_C, 13]].forEach(([t, c, dy]) => {
      leg.append("line").attr("x1", -52).attr("x2", -42).attr("y1", dy + 4).attr("y2", dy + 4).attr("stroke", c).attr("stroke-width", 2);
      leg.append("text").attr("x", -38).attr("y", dy + 4).attr("dy", "0.32em").attr("fill", c).attr("font-size", 10).text(t);
    });
    g.append("text").attr("x", 0).attr("y", -3).attr("text-anchor", "start")
      .attr("fill", "#999").attr("font-size", 10).text(unitLabel);

    const snapBoundary = px => {
      const lo = yearExtent[0] - xPad, hi = yearExtent[1] + xPad;
      return Math.max(lo, Math.min(hi, Math.round(x.invert(px) - 0.5) + 0.5));
    };
    const applyLive = (event) => { timeSel = event.selection; areaApply(timeSel); trendApply(true); };
    const brush = d3.brushX().extent([[0, 0], [liw, lih]])
      .on("start brush", applyLive)            // live preview (dimming); trend hidden mid-drag
      .on("end", (event) => {
        if (!event.sourceEvent) return;        // programmatic move already applied
        const sel = event.selection;
        if (!sel) { timeSel = null; areaApply(null); trendApply(false); return; }
        let b0 = snapBoundary(sel[0]), b1 = snapBoundary(sel[1]);
        if (b1 < b0) [b0, b1] = [b1, b0];
        if (b0 === b1) { if (b1 < yearExtent[1] + xPad) b1 += 1; else b0 -= 1; }
        timeSel = [x(b0), x(b1)];
        brushG.call(brush.move, timeSel);      // snap to whole years
        areaApply(timeSel);
        trendApply(false);                     // compute + draw stats on the snapped window
      });
    const brushG = g.append("g").attr("class", "brush").call(brush);
    brushG.select(".overlay").attr("cursor", "crosshair");
    brushG.select(".selection")
      .attr("fill", brushBlue).attr("fill-opacity", 0.12)
      .attr("stroke", brushBlue).attr("stroke-opacity", 0.7);
    if (timeSel) brushG.call(brush.move, timeSel);

    lineSlot.replaceChildren(svg.node());
  }

  function buildLegend(order, imp, mov) {
    legendRows = [];
    const visible = order.filter(k => !hidden.has(k));
    const tImp = d3.sum(visible, k => imp[k]), tMov = d3.sum(visible, k => mov[k]);
    const numCell = "padding-left:12px;text-align:right;white-space:nowrap;vertical-align:top;font-variant-numeric:tabular-nums;";
    const num = v => html`<td style="${numCell}">${fmt(Math.round(v))}</td>`;
    const mark = c => sortCol === c ? (sortDir === "asc" ? " \u25B2" : " \u25BC") : "";
    const hStyle = "padding-left:12px;text-align:right;white-space:nowrap;font-weight:600;cursor:pointer;user-select:none;";

    const hCargo = html`<th style="text-align:left;font-weight:600;cursor:pointer;user-select:none;">Cargo${mark("cargo")}</th>`;
    const hImp = html`<th style="${hStyle}">${legendImpLabel}${mark("imp")}</th>`;
    const hMov = html`<th style="${hStyle}">${legendDomLabel}${mark("mov")}</th>`;
    hCargo.onclick = () => clickSort("cargo");
    hImp.onclick = () => clickSort("imp");
    hMov.onclick = () => clickSort("mov");

    const rows = order.map(k => {
      const off = hidden.has(k);
      const tr = html`<tr style="cursor:pointer;user-select:none;transition:opacity .1s;">
        <td style="vertical-align:top;padding:1px 0;">
          <div style="display:flex;align-items:flex-start;gap:6px;">
            <span style="flex:0 0 auto;width:10px;height:10px;margin-top:3px;background:${colorOf.get(k)};border-radius:2px;"></span>
            <span style="flex:1 1 auto;${off ? "text-decoration:line-through;" : ""}">${k}</span>
          </div>
        </td>
        ${num(imp[k])}${num(mov[k])}
      </tr>`;
      tr.onmouseenter = () => highlight(off ? null : k);
      tr.onmouseleave = () => highlight(null);
      tr.onclick = () => {
        if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
        clickTimer = setTimeout(() => { clickTimer = null; toggleHide(k); }, 220);
      };
      tr.ondblclick = () => {
        if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
        isolateOrReset(k);
      };
      legendRows.push({ key: k, el: tr, off });
      return tr;
    });

    return html`<div style="font:11px/1.35 ${fontFamily};">
      <div style="color:#999;margin-bottom:4px;">${aggLabel} · click header to sort · click row to hide · double-click to isolate</div>
      <table style="border-collapse:collapse;width:100%;">
        <thead><tr style="color:#888;">${hCargo}${hImp}${hMov}</tr></thead>
        <tbody>
          ${rows}
          <tr style="font-weight:600;border-top:1px solid #ddd;">
            <td style="text-align:left;vertical-align:top;padding-top:2px;">Total</td>${num(tImp)}${num(tMov)}
          </tr>
        </tbody>
      </table>
    </div>`;
  }

  const lab = t => html`<div style="font:600 11px ${fontFamily};color:#444;margin:0 0 2px ${margin.left}px;">${t}</div>`;
  // mutable panel-title elements (text is refreshed per region in render)
  const importLab = lab("Foreign imports");
  const moveLab = lab("Domestic inter-PADD receipts");
  // line-graph + legend header labels, also refreshed per region in render
  let lineImpLegend = "Imports", lineDomLegend = "Domestic";
  let legendImpLabel = "Imports", legendDomLabel = "Domestic";

  const select = html`<select style="font:12px ${fontFamily};padding:3px 6px;">
    ${Object.keys(zones).map(z => html`<option>${z}</option>`)}
  </select>`;
  select.value = "US Coast";
  const modeSelect = html`<select style="font:12px ${fontFamily};padding:3px 6px;">
    ${["Daily average", "Annual average"].map(o => html`<option>${o}</option>`)}
  </select>`;
  modeSelect.value = "Daily average";
  const matchBox = html`<input type="checkbox" style="margin:0;">`;
  const ctlLabel = "font:12px " + fontFamily + ";color:#444;display:flex;align-items:center;gap:5px;";
  const controls = html`<div style="display:flex;gap:18px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
    <label style="${ctlLabel}">Region ${select}</label>
    <label style="${ctlLabel}">Show ${modeSelect}</label>
    <label style="${ctlLabel}cursor:pointer;">${matchBox} Match y-scales</label>
  </div>`;
  const importSlot = html`<div></div>`, moveSlot = html`<div></div>`,
        lineSlot = html`<div></div>`, legendSlot = html`<div></div>`;

  function render() {
    mode = modeSelect.value === "Daily average" ? "daily" : "annual";
    unitLabel = mode === "daily" ? "Barrels per day" : "Barrels";
    aggLabel  = mode === "daily" ? "Avg barrels/day" : "Total barrels";

    const zone = zones[select.value];
    const importFlow = zone.importFlow ?? "import";
    const domesticFlow = zone.domesticFlow ?? "movement";

    // refresh panel / legend titles for the selected region
    importLab.textContent = zone.importLabel ?? "Foreign imports";
    moveLab.textContent   = zone.domesticLabel ?? "Domestic inter-PADD receipts";
    lineImpLegend = legendImpLabel = "Imports";
    lineDomLegend = legendDomLabel = (domesticFlow === "export_to_pr") ? "From mainland" : "Domestic";

    const importRows = buildRows(importFlow, zone);   // THOUSAND bbl, per year
    const moveRows = buildRows(domesticFlow, zone);

    // legend totals in display units (annual: total bbl; daily: total bbl / total days)
    const impRaw = sumBy(importRows), movRaw = sumBy(moveRows);
    const legendDiv = mode === "daily" ? d3.sum(years, daysInYear) : 1;
    const imp = Object.fromEntries(keys.map(k => [k, impRaw[k] * THOUSAND / legendDiv]));
    const mov = Object.fromEntries(keys.map(k => [k, movRaw[k] * THOUSAND / legendDiv]));

    const order = orderKeys(imp, mov);
    const visibleOrder = order.filter(k => !hidden.has(k));

    const importDisp = toDisplayRows(importRows);
    const moveDisp = toDisplayRows(moveRows);
    const stack = d3.stack().keys(visibleOrder.slice().reverse());
    const impSeries = stack(extendEdges(importDisp)), movSeries = stack(extendEdges(moveDisp));
    const impMax = seriesMax(impSeries), movMax = seriesMax(movSeries);
    const shared = matchBox.checked ? Math.max(impMax, movMax) : null;
    const importChart = drawChart(impSeries, shared ?? impMax);
    const moveChart = drawChart(movSeries, shared ?? movMax);
    importSlot.replaceChildren(importChart.node);
    moveSlot.replaceChildren(moveChart.node);
    areaApply = (s) => { importChart.applySel(s); moveChart.applySel(s); };
    legendSlot.replaceChildren(buildLegend(order, imp, mov));
    highlight(null);
    buildLineGraph(importDisp, moveDisp, visibleOrder);

    // ---- trend overlay: run windowStats on the brushed window of each total ----
    const totImp = new Map(importDisp.map(r => [r.year, d3.sum(visibleOrder, k => r[k] || 0)]));
    const totMov = new Map(moveDisp.map(r => [r.year, d3.sum(visibleOrder, k => r[k] || 0)]));
    const statOpts = { unit: mode === "daily" ? "bbl/day" : "bbl", valueFmt: fmtAxis };
    trendApply = (live) => {
      if (!timeSel || live) { importChart.drawTrend(null); moveChart.drawTrend(null); return; }
      const [a, b] = brushedYearRange(timeSel);
      const yrs = years.filter(y => y >= a && y <= b);
      const toPts = mp => yrs.map(y => ({ year: y, value: mp.get(y) })).filter(p => Number.isFinite(p.value));
      importChart.drawTrend(windowStats(toPts(totImp), { ...statOpts, x0: b }));
      moveChart.drawTrend(windowStats(toPts(totMov), { ...statOpts, x0: b }));
    };

    areaApply(timeSel);   // reflect current brush dimming
    trendApply(false);    // draw stats for the current window (if any)
  }
  select.onchange = render;
  modeSelect.onchange = render;
  matchBox.onchange = render;
  render();

  return html`<div style="font-family:${fontFamily};">
    ${controls}
    <div style="display:grid;grid-template-columns:1fr ${legendW}px;gap:16px;align-items:start;">
      <div>
        ${importLab}${importSlot}
        ${moveLab}${moveSlot}
        ${lab("Totals \u2014 brush to highlight a span & fit a trend")}${lineSlot}
      </div>
      <div>${legendSlot}</div>
    </div>
  </div>`;
}


function _112(md){return(
md`### Timeline since waiver`
)}

function _timelineBeeswarm(attachCell,state,dataRoute,d3,width,invalidation)
{
  attachCell;
  state;

  // Keep only voyages with valid date pairs, sorted by start.
  const voyages = dataRoute
    .filter(d => d.start && d.end && d.end >= d.start)
    .map(d => ({ ...d }))
    .sort((a, b) => a.start - b.start);

  // Plausible date range; values outside are treated as missing.
  const PLAUSIBLE_MIN = Date.UTC(2000, 0, 1);
  const PLAUSIBLE_MAX = Date.UTC(2100, 0, 1);
  const plausible = (t) =>
    Number.isFinite(t) && t >= PLAUSIBLE_MIN && t < PLAUSIBLE_MAX;

  // A voyage is "selected" when its start falls in loadRange and its end
  // in dischargeRange. Null range = pass that side.
  const inSelection = (v) => {
    const loadRange = state.loadRange;
    const discRange = state.dischargeRange;
    if (!loadRange && !discRange) return true;
    if (loadRange) {
      const t = v.start instanceof Date ? v.start.getTime() : NaN;
      if (!plausible(t) || t < +loadRange[0] || t > +loadRange[1]) return false;
    }
    if (discRange) {
      const t = v.end instanceof Date ? v.end.getTime() : NaN;
      if (!plausible(t) || t < +discRange[0] || t > +discRange[1]) return false;
    }
    return true;
  };

  // --- Layout constants ---
  const laneWidth = 10;
  const strokeWidth = 6;
  const capRadius = strokeWidth / 2;
  const startDotRadius = strokeWidth / 2;
  const visualGap = 2;
  const marginTop = 20;
  const marginBottom = 40;
  const marginLeft = 30;
  const marginRight = 30;

  const dayMs = 1000 * 60 * 60 * 24;
  const _minDate = d3.min(voyages, v => v.start);
  const _maxDate = d3.max(voyages, v => v.end);
  const _totalDays = Math.max(1, Math.ceil((_maxDate - _minDate) / dayMs));
  const pxPerDay = (width - marginLeft - marginRight) / _totalDays;

  const paddingPx = 2 * capRadius + visualGap;
  const paddingMs = (paddingPx / pxPerDay) * dayMs;

  // Lane packing — first-fit over start-sorted intervals (lane 0 is the
  // bottom-most lane). We pack in start order, but break ties between voyages
  // that start on the SAME date by END descending, so the LONGER voyage is
  // placed first and therefore claims the lower (nearer-the-bottom) lane,
  // with the shorter ones stacking above it.
  //
  // This only reshuffles which lane each voyage occupies — it does NOT change
  // the stacking profile or add lanes: first-fit over start-sorted intervals
  // always uses the minimum number of lanes (= the maximum simultaneous
  // overlap), and that minimum is independent of how same-start ties break.
  //
  // Packing runs over a SEPARATE ordering so the `voyages` array (and
  // everything downstream that reads it — colors, bar totals, draw order)
  // stays start-sorted. The within-lane invariant still holds: same-start
  // voyages overlap and so never share a lane, leaving each lane's voyages
  // strictly increasing in both start and end, so storing the last-placed
  // end is still the correct "lane becomes free" marker.
  const lanes = [];
  const packOrder = voyages
    .slice()
    .sort((a, b) => (a.start - b.start) || (b.end - a.end));
  for (const v of packOrder) {
    let lane = lanes.findIndex(endDate => v.start - endDate >= paddingMs);
    if (lane === -1) {
      lane = lanes.length;
      lanes.push(v.end);
    } else {
      lanes[lane] = v.end;
    }
    v.lane = lane;
  }
  const laneCount = lanes.length;

  // --- Scales ---
  const [minDate, maxDate] = d3.extent(voyages.flatMap(v => [v.start, v.end]));

  // --- Two-chart vertical layout -----------------------------------------
  // Top: the existing beeswarm. Bottom: a 200px stacked stepped-area chart
  // sharing the SAME x (time) scale, so columns line up. The day/month axis
  // sits between the two charts; barGap adds clear separation below it.
  const barChartHeight = 200;   // second chart height
  const barGap = 50;            // separation between the beeswarm and the area chart
  const barBottomPad = 5;       // room below the baseline so the "0" label isn't clipped
  const topHeight = marginTop + marginBottom + laneCount * laneWidth + strokeWidth;
  const height = topHeight + barGap + barChartHeight + barBottomPad;

  const xTime = d3.scaleTime().domain([minDate, maxDate]).range([marginLeft, width - marginRight]);
  // Beeswarm lanes are measured from the bottom of the TOP section now.
  const yLane = lane => topHeight - marginBottom - strokeWidth / 2 - lane * laneWidth;

  // Match the reference chart's typography exactly.
  const fontFamily = `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .style("font", `10px ${fontFamily}`);  // axis ticks inherit 10px Inter

  // Transparent backdrop so the svg reliably receives mouse moves everywhere.
  svg.append("rect")
    .attr("x", 0).attr("y", 0).attr("width", width).attr("height", height)
    .attr("fill", "transparent");

  // --- Hierarchical axis: days / months / year ---
  const axisY = topHeight - marginBottom;
  const minDayPx = 22;
  const dayStride = Math.max(1, Math.ceil(minDayPx / pxPerDay));

  const monthStartsAll = d3.timeMonth.range(
    d3.timeMonth.floor(minDate),
    d3.timeMonth.offset(d3.timeMonth.floor(maxDate), 1)
  );

  // Month grid lines, drawn behind voyages (top section only).
  svg.append("g")
      .attr("stroke", "#e5e5e5")
      .attr("stroke-width", 1)
      .attr("shape-rendering", "crispEdges")
    .selectAll("line")
    .data(monthStartsAll.filter(d => d >= minDate && d <= maxDate))
    .join("line")
      .attr("x1", d => xTime(d))
      .attr("x2", d => xTime(d))
      .attr("y1", marginTop)
      .attr("y2", axisY);

  const shownDays = [];
  for (const mStart of monthStartsAll) {
    const mEnd = d3.timeMonth.offset(mStart, 1);
    for (let day = mStart; day < mEnd; day = d3.timeDay.offset(day, dayStride)) {
      const daysUntilNextMonth = Math.round((mEnd - day) / dayMs);
      if (day > mStart && daysUntilNextMonth < dayStride) continue;
      if (day >= d3.timeDay.floor(minDate) && day <= maxDate) {
        shownDays.push(day);
      }
    }
  }

  const dayAxis = svg.append("g")
    .attr("transform", `translate(0,${axisY})`);

  dayAxis.selectAll("line.tick")
    .data(shownDays)
    .join("line")
      .attr("class", "tick")
      .attr("x1", d => xTime(d))
      .attr("x2", d => xTime(d))
      .attr("y1", 0)
      .attr("y2", 4)
      .attr("stroke", "#999");

  dayAxis.selectAll("text.day")
    .data(shownDays)
    .join("text")
      .attr("class", "day")
      .attr("x", d => xTime(d))
      .attr("y", 16)
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .text(d => d3.timeFormat("%-d")(d));

  const monthStarts = d3.timeMonth.range(
    d3.timeMonth.floor(minDate),
    d3.timeMonth.offset(d3.timeMonth.floor(maxDate), 1)
  );

  const monthAxis = svg.append("g")
    .attr("transform", `translate(0,${axisY + 22})`);

  monthAxis.selectAll("line.tick")
    .data(monthStarts)
    .join("line")
      .attr("class", "tick")
      .attr("x1", d => xTime(d3.max([d, minDate])))
      .attr("x2", d => xTime(d3.max([d, minDate])))
      .attr("y1", 0)
      .attr("y2", marginBottom - 22)
      .attr("stroke", "#bbb")
      .attr("shape-rendering", "crispEdges");

  const monthTextSel = monthAxis.selectAll("text.month")
    .data(monthStarts)
    .join("text")
      .attr("class", "month")
      .attr("x", d => {
        const next = d3.timeMonth.offset(d, 1);
        const lo = Math.max(+d, +minDate);
        const hi = Math.min(+next, +maxDate);
        return (xTime(lo) + xTime(hi)) / 2;
      })
      .attr("y", 14)
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .text((d, i) => {
        const next = d3.timeMonth.offset(d, 1);
        const lo = Math.max(+d, +minDate);
        const hi = Math.min(+next, +maxDate);
        const availPx = xTime(hi) - xTime(lo);
        const isFirstOfYear = i === 0 || d.getFullYear() !== monthStarts[i - 1].getFullYear();
        const year = d.getFullYear();
        const fullName = d3.timeFormat("%B")(d);
        const shortName = d3.timeFormat("%b")(d);
        const fits = s => s.length * 6.5 + 8 <= availPx;
        if (isFirstOfYear) {
          if (fits(`${fullName} ${year}`)) return `${fullName} ${year}`;
          if (fits(`${shortName} ${year}`)) return `${shortName} ${year}`;
          return `${shortName} '${String(year).slice(-2)}`;
        }
        return fits(fullName) ? fullName : shortName;
      });

  // =======================================================================
  // SECOND CHART: daily STACKED STEPPED AREA of barrels in transit by cargo
  // type. "In transit on day D" means floor(start) <= D <= floor(end).
  // Shares xTime, so day columns align vertically with the beeswarm above.
  // =======================================================================
  const barAreaTop  = topHeight + barGap;            // top of the 200px band
  const barBaseline = barAreaTop + barChartHeight;   // areas grow up from here
  const barTopPad   = 12;                            // headroom above the peak

  // Cargo type -> color (first occurrence wins; matches the line colors).
  const cargoColor = new Map();
  for (const v of voyages) {
    const ct = (v.cargo_type && String(v.cargo_type).trim()) || "Unknown";
    if (!cargoColor.has(ct)) cargoColor.set(ct, v.color || "#999999");
  }
  // Canonical cargo key for a voyage (matches the cargoColor map keys).
  const cargoOf = (v) => (v.cargo_type && String(v.cargo_type).trim()) || "Unknown";

  // One bucket per calendar day across the domain.
  const dayList = d3.timeDay.range(
    d3.timeDay.floor(minDate),
    d3.timeDay.offset(d3.timeDay.floor(maxDate), 1)
  );
  const dayIndex = new Map(dayList.map((d, i) => [+d, i]));
  const perDay = dayList.map(() => new Map());  // dayIdx -> Map(cargoType -> barrels)
  const typeTotals = new Map();

  for (const v of voyages) {
    const bbl = +v.barrels || 0;                // barrels added upstream in dataRoute
    if (!bbl) continue;
    const ct = (v.cargo_type && String(v.cargo_type).trim()) || "Unknown";
    const last = d3.timeDay.floor(v.end);
    for (let day = d3.timeDay.floor(v.start); day <= last; day = d3.timeDay.offset(day, 1)) {
      const idx = dayIndex.get(+day);
      if (idx == null) continue;
      perDay[idx].set(ct, (perDay[idx].get(ct) || 0) + bbl);
      typeTotals.set(ct, (typeTotals.get(ct) || 0) + bbl);
    }
  }

  const maxDailyTotal = d3.max(perDay, m => d3.sum(m.values())) || 1;
  // Largest-volume cargo sits at the bottom of each stack.
  const stackOrder = [...cargoColor.keys()]
    .sort((a, b) => (typeTotals.get(b) || 0) - (typeTotals.get(a) || 0));

  const yBar = d3.scaleLinear()
    .domain([0, maxDailyTotal]).nice()
    .range([barBaseline, barAreaTop + barTopPad]);

  const xLo = xTime.range()[0];
  const xHi = xTime.range()[1];

  // Clip the area + highlight to the plot's x-range so the stepped edges of
  // the first/last day can't spill into the margins.
  const clipId = "barclip-" + Math.random().toString(36).slice(2);
  svg.append("clipPath").attr("id", clipId)
    .append("rect")
      .attr("x", xLo).attr("y", barAreaTop - 2)
      .attr("width", xHi - xLo).attr("height", (barBaseline - barAreaTop) + 4);

  // Light barrels axis for the bar chart.
  const barAxis = svg.append("g");
  barAxis.selectAll("line.bargrid")
    .data(yBar.ticks(3))
    .join("line")
      .attr("x1", marginLeft).attr("x2", width - marginRight)
      .attr("y1", d => yBar(d)).attr("y2", d => yBar(d))
      .attr("stroke", "#eee").attr("shape-rendering", "crispEdges");
  barAxis.selectAll("text.barlabel")
    .data(yBar.ticks(3))
    .join("text")
      .attr("x", marginLeft - 4).attr("y", d => yBar(d))
      .attr("text-anchor", "end").attr("dominant-baseline", "middle")
      .attr("fill", "#999").attr("font-size", 10)
      .text(d => d3.format("~s")(d));
  const barCaption = svg.append("text")
      .attr("x", 0).attr("y", barAreaTop - 6)
      .attr("font-size", 11);
  barCaption.append("tspan")
      .attr("font-weight", 700).attr("fill", "#555")
      .text("Floating stock");
  barCaption.append("tspan")
      .attr("font-weight", 400).attr("fill", "#999")
      .text(": barrels being transported at any given time");

  // Center each day's step on its date tick. curveStepAfter holds a value
  // from the plotted x-position rightward to the next point, so plotting each
  // day half a day EARLIER makes the resulting block straddle the tick (its
  // center lands on xTime(day)) instead of starting at it.
  const halfDayMs = dayMs / 2;

  // Stepped stacked area. d3.stack over per-day rows; curveStepAfter makes
  // each day a flat step. A trailing sentinel row gives the final day its
  // full width (it isn't drawn itself — it just terminates the last step).
  const rows = dayList.map((day, i) => {
    const o = { day };
    for (const ct of stackOrder) o[ct] = perDay[i].get(ct) || 0;
    return o;
  });
  if (rows.length) {
    const sentinel = { day: d3.timeDay.offset(rows[rows.length - 1].day, 1) };
    for (const ct of stackOrder) sentinel[ct] = 0;
    rows.push(sentinel);
  }
  const series = d3.stack().keys(stackOrder)(rows);
  const areaGen = d3.area()
    .x(d => xTime(new Date(+d.data.day - halfDayMs)))  // shift left half a day to center on the tick
    .y0(d => yBar(d[0]))
    .y1(d => yBar(d[1]))
    .curve(d3.curveStepAfter);

  const AREA_OPACITY_IDLE  = 0.85;  // when not hovering
  const AREA_OPACITY_FADED = 0.3;   // faded back so the hovered day stands out
  const areaG = svg.append("g")
      .attr("clip-path", `url(#${clipId})`)
      .attr("opacity", AREA_OPACITY_IDLE);
  const areaPathSel = areaG.selectAll("path")
    .data(series)
    .join("path")
      .attr("fill", s => cargoColor.get(s.key))
      .attr("d", areaGen);
  areaPathSel.append("title").text(s => s.key);

  // Day-baseline.
  svg.append("line")
    .attr("x1", xLo).attr("x2", xHi)
    .attr("y1", barBaseline).attr("y2", barBaseline)
    .attr("stroke", "#ccc").attr("shape-rendering", "crispEdges");

  // Group that holds the highlighted day's column (rebuilt on hover).
  const highlightG = svg.append("g")
    .attr("clip-path", `url(#${clipId})`)
    .attr("pointer-events", "none");

  // Voyage range lines — kept and cached for opacity updates.
  const lineSel = svg.append("g")
      .attr("stroke-width", strokeWidth)
      .attr("stroke-linecap", "round")
    .selectAll("line")
    .data(voyages)
    .join("line")
      .attr("x1", d => xTime(d.start))
      .attr("x2", d => xTime(d.end))
      .attr("y1", d => yLane(d.lane))
      .attr("y2", d => yLane(d.lane))
      .attr("stroke", d => d.color)
      .attr("opacity", 0.2);

  // Start-date circles — also cached.
  const dotSel = svg.append("g")
    .selectAll("circle")
    .data(voyages)
    .join("circle")
      .attr("cx", d => xTime(d.start))
      .attr("cy", d => yLane(d.lane))
      .attr("r", startDotRadius)
      .attr("fill", d => d.color)
      .attr("opacity", 1);
  dotSel.append("title")
    .text(d => `${d.name}\n${d.flag}\n${d3.timeFormat("%b %d, %Y")(d.start)} → ${d3.timeFormat("%b %d, %Y")(d.end)}\n${d.load_port} → ${d.unload_port}`);

  const LINE_OPACITY_SELECTED   = 0.2;
  const LINE_OPACITY_UNSELECTED = 0.04;
  const DOT_OPACITY_SELECTED    = 1;
  const DOT_OPACITY_UNSELECTED  = 0.12;

  // Scrub state. hoverDay is a snapped (day-floored) Date, or null.
  let hoverDay = null;
  // Legend-hover state: a cargo key, or null. Mutually exclusive with hoverDay.
  let hoverCargo = null;
  let legendRowSel = null;   // assigned when the legend is built
  let legendNode = null;     // the legend <g>, used to gate the scrub handler
  const dayFloorMin = d3.timeDay.floor(minDate);
  const dayFloorMax = d3.timeDay.floor(maxDate);
  // x of the snapped day's start boundary. Voyage start/end parse to local
  // midnight, so each range cap sits exactly on a day boundary — anchoring
  // dots/guide here makes a dot land precisely on a route's start cap on its
  // first day and its end cap on its last day (instead of half a day inside).
  const dayX = (day) =>
    Math.max(xLo, Math.min(xTime(day), xHi));
  // A route is "in transit" on a day if that day overlaps [start, end] at
  // day granularity — identical to how the stacked totals are bucketed.
  const spansDay = (v, day) =>
    +d3.timeDay.floor(v.start) <= +day && +day <= +d3.timeDay.floor(v.end);

  const LINE_DIM_FACTOR = 0.3;   // extra fade on lines NOT in transit while hovering a day
  const CARGO_DIM_FACTOR = 0.12; // fade non-matching lines/dots when a legend cargo is hovered
  const CARGO_AREA_DIM   = 0.12; // and the non-matching area bands

  function renderLines() {
    const day = hoverDay, cargo = hoverCargo;
    lineSel.attr("opacity", d => {
      const base = inSelection(d) ? LINE_OPACITY_SELECTED : LINE_OPACITY_UNSELECTED;
      if (cargo != null) return cargoOf(d) === cargo ? base : base * CARGO_DIM_FACTOR;
      if (!day) return base;
      return spansDay(d, day) ? base : base * LINE_DIM_FACTOR;
    });
  }

  function renderDots() {
    const day = hoverDay, cargo = hoverCargo;
    dotSel
      .attr("cx", d => {
        if (cargo != null || !day) return xTime(d.start);
        if (!spansDay(d, day)) return xTime(d.start);
        // Ride along the line to the day's boundary, clamped to the line ends.
        return Math.max(xTime(d.start), Math.min(dayX(day), xTime(d.end)));
      })
      .attr("opacity", d => {
        const base = inSelection(d) ? DOT_OPACITY_SELECTED : DOT_OPACITY_UNSELECTED;
        if (cargo != null) return cargoOf(d) === cargo ? base : base * CARGO_DIM_FACTOR;
        if (!day) return base;
        return spansDay(d, day) ? base : 0;  // hide routes not in transit
      });
  }

  function applyFilter() {
    renderLines();
    renderDots();
  }

  // Legend hover: emphasize one cargo type across lines, dots, and area bands.
  // Mutually exclusive with the day-scrub; entering cargo mode clears any day.
  function setHoverCargo(cargo) {
    hoverCargo = cargo;
    if (cargo != null && hoverDay) setHover(null);
    if (cargo == null) {
      if (areaPathSel) areaPathSel.attr("opacity", 1);
      areaG.attr("opacity", hoverDay ? AREA_OPACITY_FADED : AREA_OPACITY_IDLE);
    } else {
      areaG.attr("opacity", AREA_OPACITY_IDLE);
      if (areaPathSel) areaPathSel.attr("opacity", s => s.key === cargo ? 1 : CARGO_AREA_DIM);
    }
    if (legendRowSel)
      legendRowSel.attr("opacity", d => cargo == null ? 1 : (d.key === cargo ? 1 : 0.35));
    renderLines();
    renderDots();
  }

  // Dashed guide + a small date/volume label that track the snapped day.
  // The guide stops at the axis so it doesn't run through the area below.
  const guide = svg.append("line")
      .attr("y1", marginTop)
      .attr("y2", axisY)
      .attr("stroke", "#666")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("shape-rendering", "crispEdges")
      .attr("opacity", 0)
      .attr("pointer-events", "none");
  // Label above the beeswarm: number of active (in-transit) routes.
  const guideLabel = svg.append("text")
      .attr("y", marginTop - 7)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", "#333")
      .attr("pointer-events", "none")
      .attr("opacity", 0);

  // Label on the area: total barrels in transit that day. A thin white halo
  // keeps it legible over the colored area.
  const barrelsLabel = svg.append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("font-weight", 600)
      .attr("fill", "#222")
      .attr("stroke", "#fff").attr("stroke-width", 3)
      .attr("stroke-linejoin", "round").attr("paint-order", "stroke")
      .attr("pointer-events", "none")
      .attr("opacity", 0);

  // The hovered day's number, bold with a thick white halo, drawn on top of
  // the regular (possibly strided) day axis. paint-order:stroke keeps the
  // black glyphs in front of the 5px white stroke.
  const dayHiLabel = svg.append("text")
      .attr("y", axisY + 16)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("font-weight", 700)
      .attr("fill", "#000")
      .attr("stroke", "#fff").attr("stroke-width", 5)
      .attr("stroke-linejoin", "round").attr("paint-order", "stroke")
      .attr("pointer-events", "none")
      .attr("opacity", 0);

  // 3 significant figures with K / M / B suffixes (d3 SI uses k / M / G).
  const fmtBarrels = (n) => d3.format(".3s")(n).replace(/G$/, "B").replace(/k$/, "K");

  // Draw (or clear) the highlighted day's stacked column: full-opacity
  // segments plus an outline, so it reads as a "bar" lifted out of the area.
  function highlightDay(day) {
    highlightG.selectAll("*").remove();
    if (!day) return;
    const idx = dayIndex.get(+day);
    const m = idx == null ? null : perDay[idx];
    if (!m || !m.size) return;

    // Center the column on the tick, matching the half-day-shifted area.
    const x0 = xTime(new Date(+day - halfDayMs));
    const x1 = xTime(new Date(+day + halfDayMs));
    const w = Math.max(1, x1 - x0);

    let cum = 0;
    for (const ct of stackOrder) {
      const val = m.get(ct) || 0;
      if (!val) continue;
      highlightG.append("rect")
        .attr("x", x0).attr("width", w)
        .attr("y", yBar(cum + val))
        .attr("height", Math.max(0, yBar(cum) - yBar(cum + val)))
        .attr("fill", cargoColor.get(ct));
      cum += val;
    }
  }

  function setHover(day) {
    hoverDay = day;
    if (!day) {
      areaG.attr("opacity", AREA_OPACITY_IDLE);
      guide.attr("opacity", 0);
      guideLabel.attr("opacity", 0);
      barrelsLabel.attr("opacity", 0);
      dayHiLabel.attr("opacity", 0);
      monthTextSel.attr("font-weight", null);
      highlightDay(null);
      renderLines();
      renderDots();
      return;
    }
    areaG.attr("opacity", AREA_OPACITY_FADED);
    const cx = dayX(day);

    const idx = dayIndex.get(+day);
    const total = idx == null ? 0 : d3.sum(perDay[idx].values());
    let active = 0, maxLane = 0;
    for (const v of voyages)
      if (spansDay(v, day)) { active++; if (v.lane > maxLane) maxLane = v.lane; }
    const labelX = Math.max(xLo + 24, Math.min(cx, xHi - 24));

    // The guide's top tracks the top of the beeswarm cluster at this day, so
    // on the sparse left edge the count label rides low (well below the title)
    // and only climbs toward the top where the distribution is tall.
    const guideTopY = Math.max(marginTop, yLane(maxLane) - laneWidth * 1.5);
    guide.attr("x1", cx).attr("x2", cx).attr("y1", guideTopY).attr("opacity", 1);

    // Upper chart: active route count only, just above the guide's top.
    guideLabel
      .attr("x", labelX)
      .attr("y", guideTopY - 5)
      .attr("opacity", 1)
      .text(`${active} ${active === 1 ? "route" : "routes"}`);

    // Lower chart: total barrels, just above the highlighted column.
    barrelsLabel
      .attr("x", labelX)
      .attr("y", Math.max(barAreaTop + 8, yBar(total) - 5))
      .attr("opacity", 1)
      .text(`${total ? fmtBarrels(total) : "0"} bbl`);

    // Day axis: bold, white-haloed current day on top of the normal ticks.
    dayHiLabel
      .attr("x", xTime(day))
      .attr("opacity", 1)
      .text(d3.timeFormat("%-d")(day));

    // Month axis: bold the month containing the hovered day.
    const curMonth = +d3.timeMonth.floor(day);
    monthTextSel.attr("font-weight", d => +d === curMonth ? 700 : null);

    highlightDay(day);
    renderLines();
    renderDots();
  }

  // Hovering EITHER chart snaps to a day and highlights it. Listening on the
  // svg root (rather than an overlay) keeps the dots' native tooltips alive.
  svg.on("mousemove", (event) => {
    // Over the legend: don't scrub — the legend rows drive their own highlight.
    if (legendNode && legendNode.contains(event.target)) {
      if (hoverDay) setHover(null);
      return;
    }
    const [mx, my] = d3.pointer(event, svg.node());
    if (mx < xLo || mx > xHi || my < marginTop || my > barBaseline) {
      if (hoverDay) setHover(null);
      if (hoverCargo != null) setHoverCargo(null);
      return;
    }
    if (hoverCargo != null) setHoverCargo(null);
    const cx = Math.max(xLo, Math.min(mx, xHi));
    let day = d3.timeDay.floor(xTime.invert(cx));
    if (+day < +dayFloorMin) day = dayFloorMin;
    if (+day > +dayFloorMax) day = dayFloorMax;
    if (!hoverDay || +hoverDay !== +day) setHover(day);
  });
  svg.on("mouseleave", () => { setHover(null); setHoverCargo(null); });
  svg.style("cursor", "crosshair");

  // Subscribe to state changes; dedupe by range identity so unrelated
  // state.update() calls don't re-apply opacities.
  let hasApplied = false;
  let lastLoadRange = undefined;
  let lastDiscRange = undefined;
  const unsubscribe = state.subscribe((s) => {
    if (hasApplied &&
        s.loadRange === lastLoadRange &&
        s.dischargeRange === lastDiscRange) {
      return;
    }
    hasApplied = true;
    lastLoadRange = s.loadRange;
    lastDiscRange = s.dischargeRange;
    applyFilter();
  });
  invalidation.then(unsubscribe);

  // ---- Title for the top chart ------------------------------------------
  const topCaption = svg.append("text")
      .attr("x", 0).attr("y", 12).attr("font-size", 11);
  topCaption.append("tspan").attr("font-weight", 700).attr("fill", "#555")
      .text("Voyage timeline");
  topCaption.append("tspan").attr("font-weight", 400).attr("fill", "#999")
      .text(": each line is one voyage, from load to discharge");

  // ---- Top-left legend: total barrels transported per cargo type --------
  // One value column (totals over the whole span), filling the empty upper
  // left. Hovering a row emphasizes that cargo across the timeline + area.
  {
    const items = [...cargoColor.keys()]
      .map(k => ({
        key: k,
        color: cargoColor.get(k),
        total: d3.sum(voyages, v => cargoOf(v) === k ? (+v.barrels || 0) : 0)
      }))
      .sort((a, b) => b.total - a.total);
    const grand = d3.sum(items, d => d.total);

    const rowH = 15, sw = 10;
    const legX = 0;
    const nameLeft = legX + sw + 6;
    // SVG getBBox isn't available before the node is attached, so approximate
    // text widths and place the right-aligned value column clear of the
    // longest name (plus the widest number). Ample empty space to the right.
    const charW = 7.3;  // ~per-char width at 11px Inter, for column spacing
    const numStr = d => d.total ? fmtBarrels(d.total) : "0";
    const maxNameW = (d3.max(items, d => d.key.length) || 0) * charW;
    const maxNumW = Math.max(
      d3.max(items, d => numStr(d).length) || 0,
      fmtBarrels(grand).length
    ) * charW;
    const colGap = 18;
    const valX = nameLeft + maxNameW + colGap + maxNumW;  // right edge of numbers
    const headerY = marginTop + 10;
    const firstRowY = headerY + 16;
    const totalY = firstRowY + items.length * rowH + 4;

    const legendG = svg.append("g");
    legendNode = legendG.node();

    // Translucent backing so the totals stay legible over any faint lines.
    legendG.append("rect")
      .attr("x", legX).attr("y", marginTop + 2)
      .attr("width", valX + 8).attr("height", (totalY + 6) - (marginTop + 2))
      .attr("rx", 4).attr("fill", "#fff").attr("fill-opacity", 0.72);

    legendG.append("text")
      .attr("x", legX).attr("y", headerY)
      .attr("font-size", 11).attr("fill", "#999")
      .text("Total barrels transported");

    legendRowSel = legendG.selectAll("g.lrow")
      .data(items)
      .join("g")
        .attr("class", "lrow")
        .attr("transform", (d, i) => `translate(0,${firstRowY + i * rowH})`);
    legendRowSel.append("rect")               // hit area
      .attr("x", legX).attr("y", -rowH + 3)
      .attr("width", valX + 8).attr("height", rowH)
      .attr("fill", "transparent");
    legendRowSel.append("rect")               // color swatch
      .attr("x", legX).attr("y", -sw + 1)
      .attr("width", sw).attr("height", sw).attr("rx", 2)
      .attr("fill", d => d.color);
    legendRowSel.append("text")
      .attr("x", nameLeft).attr("y", 0)
      .attr("font-size", 11).attr("fill", "#333")
      .text(d => d.key);
    legendRowSel.append("text")
      .attr("x", valX).attr("y", 0).attr("text-anchor", "end")
      .attr("font-size", 11).attr("fill", "#333")
      .style("font-variant-numeric", "tabular-nums")
      .text(d => d.total ? fmtBarrels(d.total) : "0");
    legendRowSel
      .on("mouseenter", (event, d) => setHoverCargo(d.key))
      .on("mouseleave", () => setHoverCargo(null));

    // Grand-total row.
    const gt = legendG.append("g").attr("transform", `translate(0,${totalY})`);
    gt.append("line")
      .attr("x1", legX).attr("x2", valX).attr("y1", -rowH + 3).attr("y2", -rowH + 3)
      .attr("stroke", "#ddd");
    gt.append("text")
      .attr("x", legX).attr("y", 0)
      .attr("font-size", 11).attr("font-weight", 600).attr("fill", "#555")
      .text("Total");
    gt.append("text")
      .attr("x", valX).attr("y", 0).attr("text-anchor", "end")
      .attr("font-size", 11).attr("font-weight", 600).attr("fill", "#555")
      .style("font-variant-numeric", "tabular-nums")
      .text(fmtBarrels(grand));
  }

  return svg.node();
}


function _114(md){return(
md`EIA is measured by load date`
)}

function _115(md){return(
md`### Kernel smoothed shipping by PADD
Shipping frequency vs the projection interval of the historical data from the last decade`
)}

function _jonesActBarrels(routes,d3)
{
  // ==========================================================================
  // THE FILTER  (option, default true)
  //   true  -> drop voyages that LOAD and DISCHARGE in the SAME top-level PADD
  //            (intra-PADD), so the set matches EIA, which only tracks movements
  //            BETWEEN PADDs.
  //   false -> keep every voyage discharging at a port in the PADD, whatever its
  //            origin (all shipments to ports within the PADD).
  //
  // (If you'd rather drive this from a UI checkbox, replace the line below with a
  //  separate cell:  viewof FILTER_INTRA_PADD = Inputs.toggle({label:"Drop intra-PADD",
  //  value:true})  and delete this const — the rest of the cell is unchanged.)
  // ==========================================================================
  const FILTER_INTRA_PADD = true;

  // ---- load timestamp (same logic the chart cells used) --------------------
  const loadTime = d =>
    d.start instanceof Date                                            ? +d.start
    : (d.start != null && Number.isFinite(+new Date(d.start)))         ? +new Date(d.start)
    : (d.load_date != null && Number.isFinite(+new Date(d.load_date))) ? +new Date(d.load_date)
    : NaN;

  // ---- Puerto Rico detection (mirrors the chart cells) ---------------------
  const PR_RE = /puerto\s*rico|^\s*pr\s*$/i;
  const isPRvoyage = d => [d.unload_PADD, d.unload_PADD_sub, d.unload_region, d.unload_country]
    .some(v => PR_RE.test(String(v ?? "")));
  // PR on the LOAD side too, so a PR -> PR move is recognised as same-PADD.
  const isPRload = d => [d.load_PADD, d.load_PADD_sub, d.load_region, d.load_country]
    .some(v => PR_RE.test(String(v ?? "")));

  // ---- top-level PADD bucket (1 / 3 / 5 / "PR" / null) for each end of a voyage
  // EIA tracks movements between top-level PADDs, so "same PADD" is judged at the
  // 1/3/5 level: a 1B -> 1C move is intra-PADD (both PADD 1).
  const unloadPaddOf = d => {
    if (isPRvoyage(d)) return "PR";
    const n = +d.unload_PADD;
    return Number.isFinite(n) ? n : null;
  };

  // >>> EDIT HERE if your routes builder stores the origin PADD elsewhere. <<<
  // This mirrors unload_PADD on the load side. If your dataRoute cell doesn't carry an
  // origin PADD yet, add one there, OR swap this for a load_lon/load_lat -> PADD lookup.
  // Returning null marks the origin "unknown" -> the voyage is treated as inter-PADD
  // (KEPT), so a missing field can never silently empty the charts.
  const loadPaddOf = d => {
    if (isPRload(d)) return "PR";
    const n = +d.load_PADD;
    return Number.isFinite(n) ? n : null;
  };

  const isSamePadd = d => {
    const a = loadPaddOf(d), b = unloadPaddOf(d);
    return a != null && b != null && a === b;
  };

  // ---- normalize + filter every route into a clean voyage record -----------
  let missingLoadPadd = 0;
  const voyages = routes
    .map(d => {
      const lp = loadPaddOf(d);
      if (lp == null) missingLoadPadd++;
      return {
        t:        loadTime(d),
        bbl:      +d.barrels || +d.total_barrels || 0,
        cargo:    (d.cargo_type && String(d.cargo_type).trim()) || "Unknown",
        color:    d.color || null,
        padd:     Number.isFinite(+d.unload_PADD) ? +d.unload_PADD : null, // 1/3/5 (NaN-> null for PR)
        sub:      d.unload_PADD_sub || null,                                // "1A"/"1B"/"1C"
        isPR:     isPRvoyage(d),
        loadPadd: lp,                  // top-level origin bucket (1/3/5/"PR"/null)
        samePadd: isSamePadd(d),       // load & discharge in the same top-level PADD?
        raw:      d                    // original route row (regionStats matches on this)
      };
    })
    // base validity: real load date, positive volume, a known discharge region
    .filter(d => Number.isFinite(d.t) && d.bbl > 0 && (Number.isFinite(d.padd) || d.isPR))
    // the intra-PADD filter
    .filter(d => !(FILTER_INTRA_PADD && d.samePadd));

  if (FILTER_INTRA_PADD && missingLoadPadd > 0)
    console.warn(`[jonesActBarrels] ${missingLoadPadd} voyage(s) have no resolvable load ` +
      `PADD; they are KEPT (treated as inter-PADD). Wire up loadPaddOf() if that's wrong.`);

  // ---- the requested roll-up: sum of barrels in each cargo category --------
  const sumByCargo = d3.rollup(voyages, v => d3.sum(v, d => d.bbl), d => d.cargo);
  const totalBarrels = d3.sum(voyages, d => d.bbl);
  // same thing as a sorted array, handy for inspecting the cell's value
  const byCargoTable = [...sumByCargo.entries()]
    .map(([cargo, bbl]) => ({ cargo, bbl }))
    .sort((a, b) => b.bbl - a.bbl);

  return {
    FILTER_INTRA_PADD,
    voyages,        // filtered, normalized per-voyage records — what the charts iterate
    sumByCargo,     // Map<cargo, total bbl>  ("sum of barrels in each category")
    byCargoTable,   // same, as a sorted [{cargo, bbl}] array
    totalBarrels,
    // helpers, exposed so chart cells don't redefine them
    loadTime, isPRvoyage, unloadPaddOf, loadPaddOf, isSamePadd
  };
}


function _kernelTrendChart(routes,d3,html,width,historicalMapped,windowStats)
{
  const chartHeight = 500;                  // KDE chart height (px)

  const VOYAGES = routes;                   // swap to dataRoute if that's your voyage cell

  const fontFamily = `'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
  const fmt = d3.format(",");
  const siFix = { k: "K", G: "B" };       // remap d3's lowercase k / giga G
  const fmtAxis = n => d3.format("~s")(n).replace(/[kG]/, m => siFix[m]);
  const dayMs = 86400000;
  const THOUSAND = 1000;                   // historicalMapped is in THOUSAND bbl
  const daysInYear = y => ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) ? 366 : 365;

  // ---- PADD 1 subregion handling (mirrors comparisonChart) ------------------
  // PADD 3 -> 1 is reported per subzone (end_padd "PADD 1A"/"1B"/"1C"). Flows with
  // no subzone breakdown stay on bare "PADD 1" (PADD 5 -> 1 movements + foreign
  // imports) and are split evenly across the subzones for a single-subzone view.
  // Voyages (the KDE) are classified exactly, by discharge state (unload_PADD_sub).
  const SUBZONE_SHARE = 1 / 3;
  const SPLIT_IMPORTS = true;             // include 1/3 of PADD 1 imports per subzone
  const EAST = ["PADD 1", "PADD 1A", "PADD 1B", "PADD 1C"];
  const subHistWeight = sub => (ep, ft) =>
    ep === "PADD " + sub ? 1 :                            // PADD 3 -> this subzone (real)
    ep === "PADD 1"      ? (ft === "import" ? (SPLIT_IMPORTS ? SUBZONE_SHARE : 0) : SUBZONE_SHARE)
                         : 0;                             // movement here = PADD 5 -> 1

  // ---- Puerto Rico detection ------------------------------------------------
  // PR isn't a numbered PADD, so a voyage's `unload_PADD` is non-numeric and the
  // `Number.isFinite(padd)` filter below would drop it. Detect PR from the discharge
  // fields instead (adjust the field list if your routes builder names PR differently).
  const PR_RE = /puerto\s*rico|^\s*pr\s*$/i;
  const isPRvoyage = d => [d.unload_PADD, d.unload_PADD_sub, d.unload_region, d.unload_country]
    .some(v => PR_RE.test(String(v ?? "")));

  // ---- intra-PADD detection (mirrors jonesActBarrels) -----------------------
  // "Same PADD" is judged at the top level (1/3/5): a 1B -> 1C move counts as
  // intra-PADD, matching how EIA reports PADD-to-PADD flows. Mainland -> PR shipments
  // are never intra-PADD. The "Filter intra-PADD" checkbox below uses isSamePadd().
  // >>> EDIT loadPaddOf if your routes builder stores the origin PADD elsewhere. <<<
  // It mirrors unload_PADD on the load side; returning null means "origin unknown",
  // and an unknown-origin voyage is treated as inter-PADD (KEPT) so the filter can
  // never silently empty the chart.
  const isPRload = d => [d.load_PADD, d.load_PADD_sub, d.load_region, d.load_country]
    .some(v => PR_RE.test(String(v ?? "")));
  const unloadPaddOf = d => { if (isPRvoyage(d)) return "PR"; const n = +d.unload_PADD; return Number.isFinite(n) ? n : null; };
  const loadPaddOf   = d => { if (isPRload(d))   return "PR"; const n = +d.load_PADD;   return Number.isFinite(n) ? n : null; };
  const isSamePadd   = d => { const a = loadPaddOf(d), b = unloadPaddOf(d); return a != null && b != null && a === b; };

  // region zones.
  //   vmatch(v): voyage discharge filter; v = { padd:<numeric>, sub:"1A"/"1B"/"1C"|null, isPR }
  //   hist(end_padd, flow_type): weight on historicalMapped rows for the trend band
  //   domesticFlow: flow_type that counts as "Domestic" (PR ships arrive as export_to_pr)
  const zones = {
    "PADD 1: East Coast":        { vmatch: v => v.padd === 1,              hist: ep => EAST.includes(ep) ? 1 : 0 },
    "PADD 1A: New England":      { vmatch: v => v.sub === "1A",            hist: subHistWeight("1A") },
    "PADD 1B: Central Atlantic": { vmatch: v => v.sub === "1B",            hist: subHistWeight("1B") },
    "PADD 1C: Lower Atlantic":   { vmatch: v => v.sub === "1C",            hist: subHistWeight("1C") },
    "PADD 3: Gulf Coast":        { vmatch: v => v.padd === 3,              hist: ep => ep === "PADD 3" ? 1 : 0 },
    "PADD 5: West Coast":        { vmatch: v => v.padd === 5,              hist: ep => ep === "PADD 5" ? 1 : 0 },
    "US Coast":                  { vmatch: v => [1, 3, 5].includes(v.padd), hist: ep => EAST.includes(ep) || ep === "PADD 3" || ep === "PADD 5" ? 1 : 0 },
    "Puerto Rico":               { vmatch: v => v.isPR,                    hist: ep => ep === "Puerto Rico" ? 1 : 0, domesticFlow: "export_to_pr" }
  };

  // recover each voyage's load time as epoch-ms
  const loadTime = d =>
    d.start instanceof Date              ? +d.start
    : (d.start != null && Number.isFinite(+new Date(d.start)))         ? +new Date(d.start)
    : (d.load_date != null && Number.isFinite(+new Date(d.load_date))) ? +new Date(d.load_date)
    : NaN;

  // ---- fixed x-domain: the "US Coast" (PADD 1/3/5) load-date span -----------
  // The time axis is normalized to this span for EVERY region, so a region whose
  // own loadings don't reach the very start/end of the US-Coast window is still
  // drawn on that full axis (its curve just tapers to ~0 where it has no voyages).
  // NOTE: the axis span is intentionally NOT affected by the intra-PADD checkbox,
  // so the time axis stays put when you toggle the filter.
  const usCoastDays = VOYAGES
    .map(d => ({ padd: +d.unload_PADD, t: loadTime(d), bbl: +d.barrels || +d.total_barrels || 0 }))
    .filter(d => Number.isFinite(d.t) && d.bbl > 0 && [1, 3, 5].includes(d.padd))
    .map(d => d.t / dayMs);
  const xLo = d3.min(usCoastDays);
  const xHi = d3.max(usCoastDays);

  // ---- kernels (normalized to integrate to 1 over their support) ------------
  const kernels = {
    Epanechnikov: u => (Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0),
    Triangular:   u => (Math.abs(u) <= 1 ? 1 - Math.abs(u) : 0),
    Uniform:      u => (Math.abs(u) <= 1 ? 0.5 : 0),
    Quartic:      u => (Math.abs(u) <= 1 ? (15 / 16) * (1 - u * u) ** 2 : 0),
    Triweight:    u => (Math.abs(u) <= 1 ? (35 / 32) * (1 - u * u) ** 3 : 0),
    Tricube:      u => (Math.abs(u) <= 1 ? (70 / 81) * (1 - Math.abs(u) ** 3) ** 3 : 0),
    Cosine:       u => (Math.abs(u) <= 1 ? (Math.PI / 4) * Math.cos((Math.PI / 2) * u) : 0)
  };

  // ---- controls -------------------------------------------------------------
  const inputStyle = `font:12px ${fontFamily};padding:6px 10px;border:1px solid #d0d0d0;`
    + `border-radius:6px;background:#fff;color:#333;`;
  const ctlLabel = `font:12px ${fontFamily};color:#444;display:flex;align-items:center;gap:8px;`;

  const mkSelect = options => html`<select style="${inputStyle}">
    ${options.map(o => html`<option>${o}</option>`)}
  </select>`;

  const regionSelect = mkSelect(Object.keys(zones));
  regionSelect.value = "US Coast";

  const kernelSelect = mkSelect(Object.keys(kernels));
  kernelSelect.value = "Quartic";

  const bwInput = html`<input type="number" min="1" max="150" step="1" value="14" style="${inputStyle}">`;
  bwInput.style.setProperty("width", "80px", "important");
  bwInput.style.setProperty("box-sizing", "border-box", "important");
  const bwRange = html`<input type="range" min="1" max="150" step="1" value="14"
    style="width:220px;vertical-align:middle;accent-color:#555;">`;

  const flowSelect = mkSelect(["Imports", "Domestic", "Imports + Domestic"]);
  flowSelect.value = "Domestic";

  // intra-PADD filter: checked by default (matches jonesActBarrels' FILTER_INTRA_PADD).
  // Change `checked` to start unfiltered.
  const intraBox = html`<input type="checkbox" checked style="margin:0;cursor:pointer;width:15px;height:15px;accent-color:#555;">`;

  const controls = html`<div style="display:flex;gap:24px;align-items:center;margin-bottom:16px;flex-wrap:wrap;">
    <label style="${ctlLabel}">Region ${regionSelect}</label>
    <label style="${ctlLabel}">Kernel ${kernelSelect}</label>
    <label style="${ctlLabel}">Bandwidth (days) ${bwInput} ${bwRange}</label>
    <label style="${ctlLabel}">Historical flow ${flowSelect}</label>
    <label style="${ctlLabel}cursor:pointer;">${intraBox} Filter intra-PADD shipments</label>
  </div>`;

  const kdeSlot   = html`<div></div>`;

  const empty = msg => {
    const d = html`<div style="font:18px ${fontFamily};color:#a00;padding:18px 0 18px 46px;">${msg}</div>`;
    return d;
  };

  function buildKDE(zone, trend) {
    const H = chartHeight, m = { top: 34, right: 16, bottom: 40, left: 46 };
    const iw = Math.max(320, width) - m.left - m.right;
    const ih = H - m.top - m.bottom;

    const filterIntra = intraBox.checked;   // KDE uses inter-PADD only; intra-PADD marks become Xs

    // ALL voyages discharging in this region — the marks below the axis show every one.
    // region select filters by discharge PADD / subzone; grouping below is by cargo, weighted by barrels
    const vsAll = VOYAGES
      .map(d => ({
        padd: +d.unload_PADD,
        sub: d.unload_PADD_sub || null,
        isPR: isPRvoyage(d),
        samePadd: isSamePadd(d),
        t: loadTime(d),
        bbl: +d.barrels || +d.total_barrels || 0,
        cargo: (d.cargo_type && String(d.cargo_type).trim()) || "Unknown",
        color: d.color || null
      }))
      .filter(d => Number.isFinite(d.t) && (Number.isFinite(d.padd) || d.isPR) &&
                   zone.vmatch(d) && d.bbl > 0);
    if (!vsAll.length) return empty("No voyages with a valid load date & volume in the selected region.");

    // The KDE / curve / hover use only the KEPT voyages (intra-PADD dropped when the
    // filter is on). The marks below the axis still show vsAll: kept voyages as circles,
    // dropped intra-PADD voyages as Xs.
    const vs = filterIntra ? vsAll.filter(d => !d.samePadd) : vsAll;

    const h = Math.max(0.5, +bwInput.value || 7);          // bandwidth, in days
    const K = kernels[kernelSelect.value] || kernels.Epanechnikov;
    const toDay = t => t / dayMs;

    const xsDay = vs.map(v => toDay(v.t));
    // x-domain fixed to the US Coast span (computed once, above) so every region
    // shares the same time axis; fall back to this region's own span if the
    // US-Coast window is somehow empty.
    const lo = Number.isFinite(xLo) ? xLo : d3.min(xsDay);
    const hiBase = Number.isFinite(xHi) ? xHi : d3.max(xsDay);
    const hi = hiBase > lo ? hiBase : lo + 1;

    // cargo category -> color, covering EVERY region voyage so dropped-but-shown Xs
    // still get their colour. First occurrence wins; matches the voyage colors.
    const cargoColor = new Map();
    for (const v of vsAll) if (!cargoColor.has(v.cargo)) cargoColor.set(v.cargo, v.color || "#999999");

    // group the KEPT voyages by cargo; stack the largest-volume cargo at the bottom
    const totalByCargo = d3.rollup(vs, g => d3.sum(g, v => v.bbl), v => v.cargo);
    const order = [...totalByCargo.keys()]
      .sort((a, b) => (totalByCargo.get(b) || 0) - (totalByCargo.get(a) || 0));
    const byCargo = new Map(order.map(c =>
      [c, vs.filter(v => v.cargo === c).map(v => ({ x: toDay(v.t), w: v.bbl }))]));

    // BARREL intensity (barrels/day): (1/h) * sum_i barrels_i * K((x - x_i)/h)
    const intensity = (pts, gx) => {
      let s = 0;
      for (const p of pts) s += p.w * K((gx - p.x) / h);
      return s / h;
    };

    const Ngrid = 260;
    const grid = d3.range(Ngrid).map(i => lo + (hi - lo) * i / (Ngrid - 1));
    const rows = grid.map(gx => {
      const o = { gx };
      for (const c of order) o[c] = intensity(byCargo.get(c), gx);
      return o;
    });
    const series = d3.stack().keys(order)(rows);
    const kdeMax = d3.max(series, s => d3.max(s, d => d[1])) || 1;

    // prediction band sampled on this date axis (years anchored mid-December), folded into y-domain
    const bandAt = trend && trend.stats && typeof trend.stats.predictionBandAt === "function"
      ? trend.stats.predictionBandAt : null;
    const bandPts = bandAt
      ? grid.map(gx => {
          const b = bandAt(dateToYear(gx * dayMs));
          return b && Number.isFinite(b.lower) && Number.isFinite(b.upper)
            ? { gx, lower: b.lower, upper: b.upper, center: b.center } : null;
        }).filter(Boolean)
      : [];
    const bandMax = d3.max(bandPts, b => b.upper) || 0;
    const yMax = Math.max(kdeMax, bandMax);

    const x = d3.scaleTime().domain([new Date(lo * dayMs), new Date(hi * dayMs)]).range([0, iw]);
    // y-scale: pin the tallest value (yMax) exactly TOP_PAD px below the top of the plot.
    // We drop .nice() here on purpose: .nice() extends the domain past yMax, which would
    // leave the true peak an unpredictable distance below the top. With a plain [0, yMax]
    // domain mapped to range top = TOP_PAD, yMax lands precisely at TOP_PAD px, and d3 still
    // chooses clean tick *values* across [0, yMax] (they just won't extend past the data).
    const TOP_PAD = 50;
    const y = d3.scaleLinear().domain([0, yMax]).range([ih, TOP_PAD]);

    const svg = d3.create("svg")
      .attr("width", iw + m.left + m.right).attr("height", H)
      .attr("viewBox", `0 0 ${iw + m.left + m.right} ${H}`)
      .style("max-width", "100%").style("font-family", fontFamily).style("overflow", "visible");
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(fmtAxis).tickSize(-iw))
      .call(s => s.select(".domain").remove())
      .call(s => s.selectAll(".tick line").attr("stroke", "#eee"))
      .call(s => s.selectAll("text").attr("fill", "#777").attr("font-size", 10));
    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b %Y")))
      .call(s => s.select(".domain").attr("stroke", "#ccc"))
      .call(s => s.selectAll("text").attr("fill", "#777").attr("font-size", 10));
    g.append("text").attr("x", 0).attr("y", -14).attr("fill", "#999").attr("font-size", 18)
      .text(`Barrels loaded / day · ${kernelSelect.value} kernel, h = ${h} d${filterIntra ? " · inter-PADD only" : ""}`);

    const area = d3.area()
      .x(d => x(new Date(d.data.gx * dayMs)))
      .y0(d => y(d[0])).y1(d => y(d[1]))
      .curve(d3.curveLinear);

    g.selectAll("path.kde").data(series).join("path")
      .attr("class", "kde")
      .attr("fill", s => cargoColor.get(s.key) || "#bbb")
      .attr("fill-opacity", 0.8)
      .attr("d", area)
      .append("title").text(s => s.key);

    // smoothed contour on each band's upper edge
    g.selectAll("path.kdeline").data(series).join("path")
      .attr("class", "kdeline").attr("fill", "none")
      .attr("stroke", s => cargoColor.get(s.key) || "#888").attr("stroke-width", 1.2)
      .attr("d", s => d3.line()
        .x(d => x(new Date(d.data.gx * dayMs)))
        .y(d => y(d[1]))
        .curve(d3.curveLinear)(s));

    // category marks below the x-axis: area ∝ barrels, each load-date stack centered.
    // Every region voyage gets a mark. A voyage is drawn as an X only when it was
    // filtered out of the KDE (intra-PADD + the filter is on); kept voyages stay circles.
    const dotMaxR = 7, dotGap = 1.5, dotsTopY = ih + 22, kernelH = 56;
    const rScale = d3.scaleSqrt().domain([0, d3.max(vsAll, v => v.bbl) || 1]).range([0, dotMaxR]);
    const byDay = d3.group(vsAll, v => +d3.timeDay.floor(new Date(v.t)));
    const dayStacks = [...byDay].map(([day, list]) => {
      const dots = list.map(v => ({
        r: rScale(v.bbl),
        color: cargoColor.get(v.cargo) || "#999",
        isX: filterIntra && v.samePadd        // dropped from the KDE -> shown as an X
      })).sort((a, b) => b.r - a.r);
      const height = d3.sum(dots, d => 2 * d.r) + dotGap * Math.max(0, dots.length - 1);
      return { day, dots, height };
    });
    const maxHalf = (d3.max(dayStacks, s => s.height) || 0) / 2;
    const centerY = dotsTopY + maxHalf;       // common centerline; tallest stack tops at dotsTopY
    const dotG = g.append("g");
    for (const s of dayStacks) {
      const cx = x(new Date(+s.day + dayMs / 2));   // center on the middle of the day
      let cy = centerY - s.height / 2;         // top of this day's centered stack
      for (const d of s.dots) {
        cy += d.r;
        if (d.isX) {
          // X mark: two crossing strokes spanning the same ±r box a circle would fill
          const a = d.r;
          dotG.append("path")
            .attr("transform", `translate(${cx},${cy})`)
            .attr("d", `M${-a},${-a}L${a},${a}M${-a},${a}L${a},${-a}`)
            .attr("fill", "none")
            .attr("stroke", d.color)
            .attr("stroke-width", Math.max(1, d.r * 0.55))
            .attr("stroke-linecap", "round");
        } else {
          dotG.append("circle")
            .attr("cx", cx).attr("cy", cy).attr("r", d.r)
            .attr("fill", d.color).attr("stroke", "#fff").attr("stroke-width", 0.5);
        }
        cy += d.r + dotGap;
      }
    }
    const dotsBottom = centerY + maxHalf;
    // grow the svg downward if the stacked marks need more room than the margin
    const svgH = Math.max(H, m.top + Math.max(dotsBottom, dotsTopY + kernelH) + 6);
    svg.attr("height", svgH).attr("viewBox", `0 0 ${iw + m.left + m.right} ${svgH}`);

    // prediction band: black fill at 10% opacity (normal blend mode), with the
    // mean (band center / central prediction) as a thin solid black line.
    // No upper/lower edge lines.
    if (bandPts.length >= 2) {
      const bx = b => x(new Date(b.gx * dayMs));
      const bandG = g.append("g");
      bandG.append("path").datum(bandPts)
        .attr("fill", "#000").attr("fill-opacity", 0.1).attr("stroke", "none")
        .attr("d", d3.area().x(bx).y0(b => y(b.lower)).y1(b => y(b.upper)).curve(d3.curveLinear));
      bandG.append("path").datum(bandPts)
        .attr("fill", "none").attr("stroke", "#000").attr("stroke-width", 0.75)
        .attr("d", d3.line().x(bx).y(b => y(b.center)).curve(d3.curveLinear));
    }

    // hover: a fixed-height, band-styled kernel bump over the dots below the axis,
    // plus a black dot that rides the top of the distribution and reports bbl/day
    const totalAt = gx => d3.sum(order, c => intensity(byCargo.get(c), gx));
    const K0 = K(0) || 1;
    const kSamples = d3.range(-1, 1.0001, 2 / 48);
    const kernelG = g.append("g")
      .style("mix-blend-mode", "multiply").attr("opacity", 0).attr("pointer-events", "none");
    const kernelArea = kernelG.append("path")
      .attr("fill", "#c4d8dd").attr("fill-opacity", 1)
      .attr("stroke", "#85adc8").attr("stroke-width", 1).attr("stroke-linejoin", "round");
    const hoverDot = g.append("circle")
      .attr("r", 4).attr("fill", "#000").attr("stroke", "#fff").attr("stroke-width", 1.5)
      .attr("opacity", 0).attr("pointer-events", "none");
    const hoverLab = g.append("text")
      .attr("text-anchor", "middle").attr("font-size", 10).attr("font-weight", 600)
      .attr("fill", "#000").attr("stroke", "#fff").attr("stroke-width", 3)
      .attr("paint-order", "stroke").attr("stroke-linejoin", "round")
      .attr("opacity", 0).attr("pointer-events", "none");
    const hoverDate = g.append("text")
      .attr("y", ih + 16).attr("text-anchor", "middle").attr("font-size", 10).attr("font-weight", 700)
      .attr("fill", "#000").attr("stroke", "#fff").attr("stroke-width", 4)
      .attr("paint-order", "stroke").attr("stroke-linejoin", "round")
      .attr("opacity", 0).attr("pointer-events", "none");
    const hoverTick = g.append("line")
      .attr("y1", ih).attr("y2", ih + 6)
      .attr("stroke", "#000").attr("stroke-width", 1.5)
      .attr("opacity", 0).attr("pointer-events", "none");
    g.append("rect").attr("width", iw).attr("height", ih).attr("fill", "transparent")
      .on("mousemove", (event) => {
        let gx = toDay(x.invert(d3.pointer(event)[0]));
        gx = Math.max(lo, Math.min(hi, gx));
        const total = totalAt(gx);
        const date = new Date(gx * dayMs);
        const px = x(date), py = y(total);
        // fixed-height kernel bump over the dots, peaking just below the x-axis
        const kBaseY = dotsTopY + kernelH;
        const kpts = kSamples.map(u => `${x(new Date((gx + u * h) * dayMs))},${kBaseY - kernelH * K(u) / K0}`);
        kernelArea.attr("d", `M${x(new Date((gx - h) * dayMs))},${kBaseY}L${kpts.join("L")}L${x(new Date((gx + h) * dayMs))},${kBaseY}Z`);
        kernelG.attr("opacity", 1);
        hoverDot.attr("cx", px).attr("cy", py).attr("opacity", 1);
        hoverTick.attr("x1", px).attr("x2", px).attr("opacity", 1);
        hoverLab.attr("x", Math.max(40, Math.min(iw - 40, px))).attr("y", py - 9).attr("opacity", 1)
          .text(`${fmt(Math.round(total))} bbl/day`);
        hoverDate.attr("x", Math.max(40, Math.min(iw - 40, px))).attr("opacity", 1)
          .text(d3.timeFormat("%b %-d, %Y")(date));
      })
      .on("mouseleave", () => {
        kernelG.attr("opacity", 0); hoverDot.attr("opacity", 0); hoverLab.attr("opacity", 0);
        hoverDate.attr("opacity", 0); hoverTick.attr("opacity", 0);
      });

    return svg.node();
  }

  // Shared computation: annual region totals (expressed as bbl/day) -> windowStats.
  function computeTrend(zone) {
    const flow = flowSelect.value;
    const domFlow = zone.domesticFlow || "movement";       // PR's "domestic" = export_to_pr
    const flowOK = ft =>
      flow === "Imports"  ? ft === "import" :
      flow === "Domestic" ? ft === domFlow :
                            (ft === "import" || ft === domFlow);
    const w = d => zone.hist(d.end_padd, d.flow_type);     // subzone-aware weight
    const byYear = d3.rollup(
      historicalMapped.filter(d => flowOK(d.flow_type) && w(d) > 0),
      v => d3.sum(v, d => +d.value_mbbl * w(d)) * THOUSAND,  // thousand bbl -> bbl/yr
      d => +d.year
    );
    const WIN = [2015, 2025];                                // last ~10 years only
    const points = [...byYear.entries()]
      .map(([year, value]) => ({ year, value: value / daysInYear(year) }))  // bbl/yr -> bbl/day
      .filter(p => Number.isFinite(p.year) && Number.isFinite(p.value) &&
                   p.year >= WIN[0] && p.year <= WIN[1])
      .sort((a, b) => a.year - b.year);
    if (!points.length) return null;
    const lastYear = points[points.length - 1].year;
    const x0 = lastYear + 1;                                  // project one year ahead
    const stats = windowStats(points, {
      unit: "bbl/day", valueFmt: fmtAxis, clampMin: 0,        // daily-average rate, never < 0
      x0, bandRange: [points[0].year, x0], bandSteps: 96
    });
    return { flow, points, lastYear, x0, stats };
  }

  // map a calendar instant to the fractional "year" windowStats was fit on (Dec anchor)
  const yearAnchorMs = yr => Date.UTC(yr, 11, 15);
  const dateToYear = ms => {
    let Y = new Date(ms).getUTCFullYear();
    if (ms < yearAnchorMs(Y)) Y -= 1;
    const a = yearAnchorMs(Y), b = yearAnchorMs(Y + 1);
    return Y + (ms - a) / (b - a);
  };


  // ---- render / wire up -----------------------------------------------------
  function render() {
    const z = zones[regionSelect.value];
    const trend = computeTrend(z);         // still feeds the band overlay on the KDE
    kdeSlot.replaceChildren(buildKDE(z, trend));
  }
  regionSelect.onchange = render;
  kernelSelect.onchange = render;
  flowSelect.onchange = render;
  intraBox.onchange = render;
  bwInput.oninput = () => { bwRange.value = bwInput.value; render(); };
  bwRange.oninput = () => { bwInput.value = bwRange.value; render(); };
  render();

  return html`<div style="font-family:${fontFamily};">
    ${controls}
    ${kdeSlot}
  </div>`;
}


function _118(md){return(
md`- This is good analysis but too complex for the dashboard, but maybe a future blog post
- Florida has an established gas, diesel and jet fuel shipping because there is no pipelines through it. Disaggregating PADD 1A (New England), 2B (Central Atlantic) and 3C (Lower Atlantic) will help isolate this outlying effect.`
)}

function _119(md){return(
md`### Stacked kernel area, Quadratic kernel with 2 week window`
)}

function _kernelSmallMultiples(d3,historicalMapped,windowStats,jonesActBarrels,html,ResizeObserver,invalidation)
{
  // ============================================================
  // CONFIG — tweak everything here
  // ============================================================
  const CHART_HEIGHT     = 300;          // px, total height of each small multiple
  const MIN_WIDTH        = 150;          // px, min width before wrapping
  const GRID_GAP         = 5;           // px, gap between charts
  const KERNEL_NAME      = "Quartic";    // kernel
  const BANDWIDTH        = 14;           // days
  const FLOW             = "Domestic";   // "Imports" | "Domestic" | "Imports + Domestic"
  const REGION_KEYS      = [5, 3, "1A", "1B", "1C", "PR"];  // chart order, left to right (no US Coast)
  const WIN              = [2015, 2025]; // historical trend window (years)
  const AREA_COLOR       = "#4682b4";    // steel blue KDE fill (total mode)
  const AREA_OPACITY     = 0.85;
  const BAND_COLOR       = "#000";       // projection upper-bound line
  const BAND_WIDTH       = 0.75;         // px
  const Y_TICKS          = 4;            // gridline / y-label count
  const NGRID            = 260;          // KDE sample resolution
  const DEFAULT_Y_MODE   = "same";       // "same" | "independent"
  const DEFAULT_SERIES   = "categories"; // "total" | "categories"
  const TITLE_SIZE       = 18;           // px
  const TEXT_SIZE        = 12;           // px (axis numbers, labels, controls)
  const margin           = { top: 50, right: 6, bottom: 32, left: 0 };

  const fontFamily = `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

  // ============================================================
  // helpers (ported from the original cell)
  // ============================================================
  const dayMs = 86400000;
  const THOUSAND = 1000;
  const fmt = d3.format(",");
  const siFix = { k: "K", G: "B" };
  const fmtAxis = n => d3.format("~s")(n).replace(/[kG]/, m => siFix[m]);
  const fmtSig3 = n => d3.format(".3~s")(n).replace(/[kG]/, m => siFix[m]);  // 3 sig figs, axis suffixes
  const fmtDate = d3.timeFormat("%b %-d");
  const daysInYear = yr => ((yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0) ? 366 : 365;

  const kernels = {
    Epanechnikov: u => (Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0),
    Triangular:   u => (Math.abs(u) <= 1 ? 1 - Math.abs(u) : 0),
    Uniform:      u => (Math.abs(u) <= 1 ? 0.5 : 0),
    Quartic:      u => (Math.abs(u) <= 1 ? (15 / 16) * (1 - u * u) ** 2 : 0),
    Triweight:    u => (Math.abs(u) <= 1 ? (35 / 32) * (1 - u * u) ** 3 : 0),
    Tricube:      u => (Math.abs(u) <= 1 ? (70 / 81) * (1 - Math.abs(u) ** 3) ** 3 : 0),
    Cosine:       u => (Math.abs(u) <= 1 ? (Math.PI / 4) * Math.cos((Math.PI / 2) * u) : 0)
  };
  const K = kernels[KERNEL_NAME] || kernels.Quartic;
  const h = Math.max(0.5, BANDWIDTH);

  // ---- PADD 1 subregion handling for the HISTORICAL trend band --------------
  // (Voyage classification + the intra-PADD filter now live in jonesActBarrels; this
  // only weights historicalMapped rows for the projection band.)
  const SUBZONE_SHARE = 1 / 3;
  const SPLIT_IMPORTS = true;
  const EAST = ["PADD 1", "PADD 1A", "PADD 1B", "PADD 1C"];
  const subHistWeight = sub => (ep, ft) =>
    ep === "PADD " + sub ? 1 :
    ep === "PADD 1"      ? (ft === "import" ? (SPLIT_IMPORTS ? SUBZONE_SHARE : 0) : SUBZONE_SHARE) : 0;

  // region specs: key -> { label, vmatch(voyage), hist(end_padd, flow_type), domesticFlow? }
  // vmatch runs on the normalized voyage records from jonesActBarrels: { padd, sub, isPR }.
  // PR's mainland traffic arrives as flow_type "export_to_pr" rather than "movement".
  const REGION_SPECS = {
    1:    { key: 1,    label: "East Coast",       vmatch: v => v.padd === 1,   hist: ep => EAST.includes(ep) ? 1 : 0 },
    "1A": { key: "1A", label: "New England",      vmatch: v => v.sub === "1A", hist: subHistWeight("1A") },
    "1B": { key: "1B", label: "Central Atlantic", vmatch: v => v.sub === "1B", hist: subHistWeight("1B") },
    "1C": { key: "1C", label: "Lower Atlantic",   vmatch: v => v.sub === "1C", hist: subHistWeight("1C") },
    3:    { key: 3,    label: "Gulf Coast",       vmatch: v => v.padd === 3,   hist: ep => ep === "PADD 3" ? 1 : 0 },
    5:    { key: 5,    label: "West Coast",       vmatch: v => v.padd === 5,   hist: ep => ep === "PADD 5" ? 1 : 0 },
    "PR": { key: "PR", label: "Puerto Rico",      vmatch: v => v.isPR,         hist: ep => ep === "Puerto Rico" ? 1 : 0, domesticFlow: "export_to_pr" }
  };
  const REGIONS = REGION_KEYS.map(k => REGION_SPECS[k]).filter(Boolean);

  // calendar instant -> fractional year the trend band was fit on (mid-Dec anchor)
  const yearAnchorMs = yr => Date.UTC(yr, 11, 15);
  const dateToYear = ms => {
    let Y = new Date(ms).getUTCFullYear();
    if (ms < yearAnchorMs(Y)) Y -= 1;
    const a = yearAnchorMs(Y), b = yearAnchorMs(Y + 1);
    return Y + (ms - a) / (b - a);
  };

  // historical annual region totals (bbl/day) -> windowStats (for the projection band)
  function computeTrend(histWeight, domFlow = "movement") {
    const flowOK = ft =>
      FLOW === "Imports"  ? ft === "import" :
      FLOW === "Domestic" ? ft === domFlow :
                            (ft === "import" || ft === domFlow);
    const w = d => histWeight(d.end_padd, d.flow_type);
    const byYear = d3.rollup(
      historicalMapped.filter(d => flowOK(d.flow_type) && w(d) > 0),
      v => d3.sum(v, d => +d.value_mbbl * w(d)) * THOUSAND,  // thousand bbl -> bbl/yr
      d => +d.year
    );
    const points = [...byYear.entries()]
      .map(([year, value]) => ({ year, value: value / daysInYear(year) }))  // bbl/yr -> bbl/day
      .filter(p => Number.isFinite(p.year) && Number.isFinite(p.value) &&
                   p.year >= WIN[0] && p.year <= WIN[1])
      .sort((a, b) => a.year - b.year);
    if (!points.length) return null;
    const lastYear = points[points.length - 1].year;
    const x0 = lastYear + 1;                                  // project one year ahead
    const stats = windowStats(points, {
      unit: "bbl/day", valueFmt: fmtAxis, clampMin: 0,
      x0, bandRange: [points[0].year, x0], bandSteps: 96
    });
    return { points, lastYear, x0, stats };
  }

  // ============================================================
  // precompute per-region series (independent of pixel width)
  // ============================================================
  // voyages come pre-filtered from jonesActBarrels (validity + intra-PADD option);
  // here we just pick the ones that discharge in this region.
  const voyagesFor = R => jonesActBarrels.voyages.filter(v => R.vmatch(v));

  const allVs = REGIONS.flatMap(voyagesFor);
  if (!allVs.length)
    return html`<div style="font:13px ${fontFamily};color:#a00;">No voyages with a valid load date & volume in ${REGIONS.map(r => r.label).join(", ")}.</div>`;

  // SHARED x-domain across every chart, from the combined load-date span
  const xsDay = allVs.map(v => v.t / dayMs);
  const lo = d3.min(xsDay), hiRaw = d3.max(xsDay);
  const hi = hiRaw > lo ? hiRaw : lo + 1;
  const xDomain = [new Date(lo * dayMs), new Date(hi * dayMs)];

  const gridX = d3.range(NGRID).map(i => lo + (hi - lo) * i / (NGRID - 1));

  // intensity (bbl/day) at gx for a list of {x, bbl}
  const intensity = (pts, gx) => { let s = 0; for (const v of pts) s += v.bbl * K((gx - v.x) / h); return s / h; };

  const regions = REGIONS.map(R => {
    const vs = voyagesFor(R).map(v => ({ x: v.t / dayMs, bbl: v.bbl, cargo: v.cargo, color: v.color }));
    const trend = computeTrend(R.hist, R.domesticFlow);

    // total KDE intensity (all categories combined)
    const kde = gridX.map(gx => ({ gx, y: intensity(vs, gx) }));

    // per-cargo stacked series (largest-volume cargo at the base) — for "categories" mode
    const cargoColor = new Map();
    for (const v of vs) if (!cargoColor.has(v.cargo)) cargoColor.set(v.cargo, v.color || "#999999");
    const totalByCargo = d3.rollup(vs, g => d3.sum(g, v => v.bbl), v => v.cargo);
    const order = [...cargoColor.keys()].sort((a, b) => (totalByCargo.get(b) || 0) - (totalByCargo.get(a) || 0));
    const byCargo = new Map(order.map(c => [c, vs.filter(v => v.cargo === c)]));
    const rows = gridX.map(gx => {
      const o = { gx };
      for (const c of order) o[c] = intensity(byCargo.get(c), gx);
      return o;
    });
    const series = order.length ? d3.stack().keys(order)(rows) : [];

    // projection upper bound sampled on the same date grid
    const bandAt = trend && trend.stats && typeof trend.stats.predictionBandAt === "function"
      ? trend.stats.predictionBandAt : null;
    const band = bandAt
      ? gridX.map(gx => {
          const b = bandAt(dateToYear(gx * dayMs));
          return b && Number.isFinite(b.upper)
            ? { gx, lower: Number.isFinite(b.lower) ? b.lower : 0, upper: b.upper, center: b.center } : null;
        }).filter(Boolean)
      : [];

    // The projection band can raise the y-axis only when its peak stays within 2x the
    // data peak. Beyond that (e.g. PADD 1C, whose historical trend sits far above the
    // actual loadings) it would dwarf the data and, in "Same" mode, skew every other
    // chart. When it's that far off-scale we don't plot the line at all — instead we
    // note its average (first & last point of the x-range; the line is ~linear) at top.
    const kdeMax = d3.max(kde, d => d.y) || 0;
    const bandMax = d3.max(band, b => b.upper) || 0;
    const bandShown = band.length >= 2 && bandMax < 2 * kdeMax;
    const bandAvg = band.length >= 2 ? (band[0].center + band[band.length - 1].center) / 2 : null;
    const yMax = Math.max(kdeMax, bandShown ? bandMax : 0, 1);

    const totalAt = gx => intensity(vs, gx);

    return { padd: R.key, label: R.label, kde, series, order, cargoColor, band, bandShown, bandAvg, yMax, totalAt };
  });

  const globalYMax = d3.max(regions, r => r.yMax) || 1;

  // ============================================================
  // linked hover: any chart broadcasts the date to all charts
  // ============================================================
  const charts = [];                                   // filled below
  const broadcast = gx => {
    const g = Math.max(lo, Math.min(hi, gx));
    for (const c of charts) if (c.setHover) c.setHover(g);
  };
  const broadcastClear = () => { for (const c of charts) if (c.clearHover) c.clearHover(); };

  // ============================================================
  // one SVG for a region at a given pixel width + y-domain + series mode
  // ============================================================
  function buildChart(c, pxWidth, yMax, seriesMode) {
    const r = c.region;
    const W = Math.max(MIN_WIDTH, pxWidth);
    const H = CHART_HEIGHT;
    const m = margin;
    const iw = Math.max(10, W - m.left - m.right);
    const ih = H - m.top - m.bottom;

    const x = d3.scaleTime().domain(xDomain).range([0, iw]);
    const y = d3.scaleLinear().domain([0, yMax]).nice().range([ih, 0]);
    const yticks = y.ticks(Y_TICKS);

    const svg = d3.create("svg")
      .attr("width", W).attr("height", H)
      .attr("viewBox", `0 0 ${W} ${H}`)
      .style("display", "block")
      .style("font-family", fontFamily)
      .style("overflow", "visible");
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    // horizontal gridlines (full width — no left gutter)
    g.append("g").selectAll("line").data(yticks).join("line")
      .attr("x1", 0).attr("x2", iw)
      .attr("y1", d => y(d)).attr("y2", d => y(d))
      .attr("stroke", "#eee");

    // x axis — monthly ticks, 3-letter month labels, thinned to fit
    const xAxis = g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b")).tickSizeOuter(0));
    xAxis.select(".domain").attr("stroke", "#ccc");
    xAxis.selectAll(".tick line").attr("stroke", "#ccc");
    // center each month label within its month: midway between the 1st of the month
    // (its tick) and the 1st of the next month.
    xAxis.selectAll("text").attr("fill", "#888").attr("font-size", TEXT_SIZE)
      .attr("text-anchor", "middle").attr("x", 0)
      .attr("dx", d => (x(d3.timeMonth.offset(d, 1)) - x(d)) / 2);
    const labels = xAxis.selectAll(".tick text");
    const every = Math.max(1, Math.ceil(labels.size() / Math.max(1, Math.floor(iw / 42))));
    // only label months that fully fall within the data range — the partial first/last
    // months stay unlabelled so their centered label can't overflow into the neighbour
    // (the partial months are still readable via the hover date below)
    const loMs = lo * dayMs, hiMs = hi * dayMs;
    const isFullMonth = d => (+d >= loMs) && (+d3.timeMonth.offset(d, 1) <= hiMs);
    labels.attr("opacity", (d, i) => (isFullMonth(d) && i % every === 0 ? 1 : 0));

    // ---- the fill: total area OR stacked categories --------------------------
    if (seriesMode === "categories" && r.series.length) {
      const stackArea = d3.area()
        .x(d => x(new Date(d.data.gx * dayMs)))
        .y0(d => y(d[0])).y1(d => y(d[1])).curve(d3.curveLinear);
      g.selectAll("path.cat").data(r.series).join("path").attr("class", "cat")
        .attr("fill", s => r.cargoColor.get(s.key) || "#bbb")
        .attr("fill-opacity", AREA_OPACITY).attr("stroke", "none")
        .attr("d", stackArea)
        .append("title").text(s => s.key);
      g.selectAll("path.catline").data(r.series).join("path").attr("class", "catline")
        .attr("fill", "none").attr("stroke", s => r.cargoColor.get(s.key) || "#888").attr("stroke-width", 0.8)
        .attr("d", s => d3.line().x(d => x(new Date(d.data.gx * dayMs))).y(d => y(d[1])).curve(d3.curveLinear)(s));
    } else {
      g.append("path").datum(r.kde)
        .attr("fill", AREA_COLOR).attr("fill-opacity", AREA_OPACITY).attr("stroke", "none")
        .attr("d", d3.area()
          .x(d => x(new Date(d.gx * dayMs)))
          .y0(y(0)).y1(d => y(d.y))
          .curve(d3.curveLinear));
    }

    // y numbers (haloed) — drawn before the band so the shaded projection sits on top
    g.append("g").selectAll("text").data(yticks.filter(d => d > 0)).join("text")
      .attr("x", 0).attr("y", d => y(d)).attr("dy", "-2.5")
      .attr("text-anchor", "start").attr("font-size", TEXT_SIZE).attr("font-weight", 600)
      .attr("fill", "#555").attr("stroke", "#fff").attr("stroke-width", 3)
      .attr("paint-order", "stroke").attr("stroke-linejoin", "round")
      .text(d => fmtAxis(d));

    // projection upper bound — black line, but only when it's on-scale (< 2x the data
    // peak). When shown, label it above the line's center (no arrow). When it sits far
    // above the data we omit the line and note its average at the top with an up arrow.
    if (r.bandShown) {
      const mid = r.band[Math.floor(r.band.length / 2)];
      g.append("text")
        .attr("x", x(new Date(mid.gx * dayMs)))
        .attr("y", Math.max(10, y(mid.center) - 5))
        .attr("text-anchor", "middle")
        .attr("fill", BAND_COLOR).attr("font-size", TEXT_SIZE).attr("font-weight", 400)
        .attr("stroke", "#fff").attr("stroke-width", 3).attr("paint-order", "stroke").attr("stroke-linejoin", "round")
        .text(fmtSig3(r.bandAvg));
      g.append("path").datum(r.band)
        .attr("fill", "#000").attr("fill-opacity", 0.1).attr("stroke", "none")
        .attr("d", d3.area()
          .x(b => x(new Date(b.gx * dayMs)))
          .y0(b => y(b.lower)).y1(b => y(b.upper))
          .curve(d3.curveLinear));
      g.append("path").datum(r.band)
        .attr("fill", "none").attr("stroke", BAND_COLOR).attr("stroke-width", BAND_WIDTH)
        .attr("d", d3.line()
          .x(b => x(new Date(b.gx * dayMs)))
          .y(b => y(b.center))
          .curve(d3.curveLinear));
    } else if (r.bandAvg != null) {
      // trend is off the top of the range: arrow+value pinned at the very top of the
      // plot (kept just inside so it doesn't overflow), with a caption beneath it
      g.append("text")
        .attr("x", iw / 2).attr("y", 11).attr("text-anchor", "middle")
        .attr("fill", BAND_COLOR).attr("font-size", TEXT_SIZE).attr("font-weight", 400)
        .attr("stroke", "#fff").attr("stroke-width", 3).attr("paint-order", "stroke").attr("stroke-linejoin", "round")
        .text(`\u2191 ${fmtSig3(r.bandAvg)}`);
      g.append("text")
        .attr("x", iw / 2).attr("y", 24).attr("text-anchor", "middle")
        .attr("fill", "#888").attr("font-size", TEXT_SIZE).attr("font-weight", 400)
        .attr("stroke", "#fff").attr("stroke-width", 3).attr("paint-order", "stroke").attr("stroke-linejoin", "round")
        .text("Trend projection");
    }

    // titles
    g.append("text").attr("x", 0).attr("y", -32)
      .attr("fill", "#333").attr("font-size", TITLE_SIZE).attr("font-weight", 700)
      .text(r.label);
    g.append("text").attr("x", 0).attr("y", -16).attr("text-anchor", "start")
      .attr("fill", "#aaa").attr("font-size", TEXT_SIZE)
      .text("bbl loaded / day");

    // ---- linked hover overlay (driven by broadcast) -------------------------
    const hoverG = g.append("g").attr("pointer-events", "none").attr("opacity", 0);
    const hLine = hoverG.append("line").attr("y1", 0).attr("y2", ih)
      .attr("stroke", "#000").attr("stroke-width", 0.75).attr("stroke-dasharray", "3 2");
    const hTick = hoverG.append("line").attr("y1", ih).attr("y2", ih + 5).attr("stroke", "#000").attr("stroke-width", 1);
    const hDot = hoverG.append("circle").attr("r", 4).attr("fill", "#000").attr("stroke", "#fff").attr("stroke-width", 1.5);
    const hLab = hoverG.append("text").attr("text-anchor", "middle")
      .attr("font-size", TEXT_SIZE).attr("font-weight", 700).attr("fill", "#000")
      .attr("stroke", "#fff").attr("stroke-width", 3.5).attr("paint-order", "stroke").attr("stroke-linejoin", "round");
    const hDate = hoverG.append("text").attr("y", ih + 9).attr("dy", "0.71em").attr("text-anchor", "middle")
      .attr("font-size", TEXT_SIZE).attr("font-weight", 700).attr("fill", "#000")
      .attr("stroke", "#fff").attr("stroke-width", 4).attr("paint-order", "stroke").attr("stroke-linejoin", "round");

    c.setHover = gx => {
      const px = x(new Date(gx * dayMs));
      if (px < -1 || px > iw + 1) { hoverG.attr("opacity", 0); return; }
      const val = r.totalAt(gx);
      const py = y(val);
      hLine.attr("x1", px).attr("x2", px);
      hTick.attr("x1", px).attr("x2", px);
      hDot.attr("cx", px).attr("cy", py);
      // set the text first, then clamp each label's center by its own half-width so it
      // can slide to the chart edges without the actual text overflowing
      hLab.attr("y", Math.max(11, py - 10)).text(`${fmt(Math.round(val))} bbl/day`);
      hDate.text(fmtDate(new Date(gx * dayMs)));
      const edgeX = sel => {
        const half = sel.node().getComputedTextLength() / 2 + 2;   // +2 for the halo
        return Math.max(half, Math.min(iw - half, px));
      };
      hLab.attr("x", edgeX(hLab));
      hDate.attr("x", edgeX(hDate));
      hoverG.attr("opacity", 1);
    };
    c.clearHover = () => hoverG.attr("opacity", 0);

    // capture rect on top — covers the full plot area; broadcasts to all charts
    g.append("rect").attr("x", 0).attr("y", 0).attr("width", iw).attr("height", H - m.top)
      .attr("fill", "transparent")
      .on("mousemove", event => {
        const mx = Math.max(0, Math.min(iw, d3.pointer(event)[0]));
        broadcast(+x.invert(mx) / dayMs);
      })
      .on("mouseleave", broadcastClear);

    return svg.node();
  }

  // ============================================================
  // display mode (fixed — radio controls removed)
  // ============================================================
  const yMode = DEFAULT_Y_MODE;        // "same"
  const seriesMode = DEFAULT_SERIES;   // "categories"
  const yMaxFor = r => (yMode === "same" ? globalYMax : r.yMax);

  // CSS grid (not raw flex) so wrapped rows keep EQUAL column widths:
  // auto-fit + minmax(MIN_WIDTH, 1fr) => fill the row, wrap below MIN_WIDTH,
  // and a lone wrapped chart still gets exactly one column's width.
  const gridEl = html`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(${MIN_WIDTH}px,1fr));gap:${GRID_GAP}px;align-items:start;"></div>`;

  regions.forEach(r => {
    const cell = html`<div style="min-width:0;overflow:visible;"></div>`;
    gridEl.append(cell);
    charts.push({ region: r, cell, w: MIN_WIDTH });
  });

  const drawAt = (c, w) => { c.w = w; c.cell.replaceChildren(buildChart(c, w, yMaxFor(c.region), seriesMode)); };

  const ro = new ResizeObserver(entries => {
    for (const e of entries) {
      const w = e.contentRect.width;
      const c = charts.find(ch => ch.cell === e.target);
      if (c && w > 0) drawAt(c, w);
    }
  });
  charts.forEach(c => ro.observe(c.cell));
  if (typeof invalidation !== "undefined") invalidation.then(() => ro.disconnect());

  // first paint (ResizeObserver also fires on attach with the real width)
  requestAnimationFrame(() => charts.forEach(c => drawAt(c, c.cell.clientWidth || MIN_WIDTH)));

  const root = html`<div>
    ${gridEl}
  </div>`;
  root.style.setProperty("font-family", fontFamily);
  return root;
}


function _121(md){return(
md`### Stacked histogram, monthly binned`
)}

function _histogramSmallMultiples(d3,historicalMapped,windowStats,jonesActBarrels,html,ResizeObserver,invalidation)
{
  // ============================================================
  // CONFIG
  // ============================================================
  const CHART_HEIGHT   = 300;          // px, total height of each small multiple
  const MIN_WIDTH      = 150;          // px, min width before wrapping
  const GRID_GAP       = 5;           // px, gap between charts
  const FLOW           = "Domestic";   // "Imports" | "Domestic" | "Imports + Domestic"
  const REGION_KEYS    = [5, 3, "1A", "1B", "1C", "PR"];  // chart order, left to right
  const WIN            = [2015, 2025]; // historical trend window (years)
  const AREA_OPACITY   = 0.85;         // bar fill opacity
  const BAND_COLOR     = "#000";       // trend line / label color
  const BAND_WIDTH     = 0.75;         // px
  const Y_TICKS        = 4;            // gridline / y-label count
  const NGRID          = 260;          // trend-line sample resolution
  const DEFAULT_Y_MODE = "same";       // "same" | "independent"
  const BAR_GAP        = 1;            // px gap between monthly bars
  const TITLE_SIZE     = 18;           // px
  const TEXT_SIZE      = 12;           // px
  const margin         = { top: 50, right: 6, bottom: 32, left: 0 };

  const fontFamily = `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

  // ============================================================
  // helpers
  // ============================================================
  const dayMs = 86400000;
  const THOUSAND = 1000;
  const fmt = d3.format(",");
  const siFix = { k: "K", G: "B" };
  const fmtAxis = n => d3.format("~s")(n).replace(/[kG]/, m => siFix[m]);
  const fmtSig3 = n => d3.format(".3~s")(n).replace(/[kG]/, m => siFix[m]);  // 3 sig figs, axis suffixes
  const monthFmt = d3.timeFormat("%b");
  const daysInYear = yr => ((yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0) ? 366 : 365;

  // ---- PADD 1 subregion handling for the HISTORICAL trend band --------------
  // (Voyage classification + the intra-PADD filter now live in jonesActBarrels; this
  // only weights historicalMapped rows for the projection band.)
  const SUBZONE_SHARE = 1 / 3;
  const SPLIT_IMPORTS = true;
  const EAST = ["PADD 1", "PADD 1A", "PADD 1B", "PADD 1C"];
  const subHistWeight = sub => (ep, ft) =>
    ep === "PADD " + sub ? 1 :
    ep === "PADD 1"      ? (ft === "import" ? (SPLIT_IMPORTS ? SUBZONE_SHARE : 0) : SUBZONE_SHARE) : 0;

  // region specs. vmatch runs on the normalized voyage records from jonesActBarrels:
  // { padd, sub, isPR }. PR's mainland traffic arrives as flow_type "export_to_pr".
  const REGION_SPECS = {
    1:    { key: 1,    label: "East Coast",       vmatch: v => v.padd === 1,   hist: ep => EAST.includes(ep) ? 1 : 0 },
    "1A": { key: "1A", label: "New England",      vmatch: v => v.sub === "1A", hist: subHistWeight("1A") },
    "1B": { key: "1B", label: "Central Atlantic", vmatch: v => v.sub === "1B", hist: subHistWeight("1B") },
    "1C": { key: "1C", label: "Lower Atlantic",   vmatch: v => v.sub === "1C", hist: subHistWeight("1C") },
    3:    { key: 3,    label: "Gulf Coast",       vmatch: v => v.padd === 3,   hist: ep => ep === "PADD 3" ? 1 : 0 },
    5:    { key: 5,    label: "West Coast",       vmatch: v => v.padd === 5,   hist: ep => ep === "PADD 5" ? 1 : 0 },
    "PR": { key: "PR", label: "Puerto Rico",      vmatch: v => v.isPR,         hist: ep => ep === "Puerto Rico" ? 1 : 0, domesticFlow: "export_to_pr" }
  };
  const REGIONS = REGION_KEYS.map(k => REGION_SPECS[k]).filter(Boolean);

  // calendar instant -> fractional year the trend band was fit on (mid-Dec anchor)
  const yearAnchorMs = yr => Date.UTC(yr, 11, 15);
  const dateToYear = ms => {
    let Y = new Date(ms).getUTCFullYear();
    if (ms < yearAnchorMs(Y)) Y -= 1;
    const a = yearAnchorMs(Y), b = yearAnchorMs(Y + 1);
    return Y + (ms - a) / (b - a);
  };

  // historical annual region totals (bbl/day) -> windowStats (for the projection band)
  function computeTrend(histWeight, domFlow = "movement") {
    const flowOK = ft =>
      FLOW === "Imports"  ? ft === "import" :
      FLOW === "Domestic" ? ft === domFlow :
                            (ft === "import" || ft === domFlow);
    const w = d => histWeight(d.end_padd, d.flow_type);
    const byYear = d3.rollup(
      historicalMapped.filter(d => flowOK(d.flow_type) && w(d) > 0),
      v => d3.sum(v, d => +d.value_mbbl * w(d)) * THOUSAND,  // thousand bbl -> bbl/yr
      d => +d.year
    );
    const points = [...byYear.entries()]
      .map(([year, value]) => ({ year, value: value / daysInYear(year) }))  // bbl/yr -> bbl/day
      .filter(p => Number.isFinite(p.year) && Number.isFinite(p.value) &&
                   p.year >= WIN[0] && p.year <= WIN[1])
      .sort((a, b) => a.year - b.year);
    if (!points.length) return null;
    const lastYear = points[points.length - 1].year;
    const x0 = lastYear + 1;
    const stats = windowStats(points, {
      unit: "bbl/day", valueFmt: fmtAxis, clampMin: 0,
      x0, bandRange: [points[0].year, x0], bandSteps: 96
    });
    return { points, lastYear, x0, stats };
  }

  // ============================================================
  // precompute per-region series (independent of pixel width)
  // ============================================================
  // voyages come pre-filtered from jonesActBarrels (validity + intra-PADD option);
  // here we just pick the ones that discharge in this region.
  const voyagesFor = R => jonesActBarrels.voyages.filter(v => R.vmatch(v));

  const allVs = REGIONS.flatMap(voyagesFor);
  if (!allVs.length)
    return html`<div style="font:13px ${fontFamily};color:#a00;">No voyages with a valid load date & volume in ${REGIONS.map(r => r.label).join(", ")}.</div>`;

  // shared monthly bins; x-domain spans the data range [lo, hi] (matches the KDE small
  // multiples) so month labels aren't over-thinned, and the first/last bars cover only
  // the days the data actually spans.
  const xsDay = allVs.map(v => v.t / dayMs);
  const lo = d3.min(xsDay), hiRaw = d3.max(xsDay);
  const hi = hiRaw > lo ? hiRaw : lo + 1;
  const loMs = lo * dayMs, hiMs = hi * dayMs;
  const firstMonth = d3.timeMonth.floor(new Date(loMs));
  const lastMonth  = d3.timeMonth.floor(new Date(hiMs));
  const months = d3.timeMonths(firstMonth, d3.timeMonth.offset(lastMonth, 1));  // inclusive of last
  const monthIndex = new Map(months.map((d, i) => [+d, i]));
  const xDomain = [new Date(loMs), new Date(hiMs)];
  const monthStartMs = ms => +d3.timeMonth.floor(new Date(ms));

  // covered [start, end] ms of a month, clamped to the data range (full month for
  // interior months; the partial slice for the first & last months)
  const monthSpan = mStart => [Math.max(+mStart, loMs), Math.min(+d3.timeMonth.offset(mStart, 1), hiMs)];
  // days of that covered slice — used as the bbl/day denominator
  const monthSpanDays = mStart => { const [a, b] = monthSpan(mStart); return Math.max(1, (b - a) / dayMs); };

  // fine sample grid (in "days") across [lo, hi], for the smooth trend line
  const gridX = d3.range(NGRID).map(i => lo + (hi - lo) * i / (NGRID - 1));

  const regions = REGIONS.map(R => {
    const vs = voyagesFor(R);
    const trend = computeTrend(R.hist, R.domesticFlow);

    // cargo colors + stacking order (largest total at the base)
    const cargoColor = new Map();
    for (const v of vs) if (!cargoColor.has(v.cargo)) cargoColor.set(v.cargo, v.color || "#999999");
    const totalByCargo = d3.rollup(vs, g => d3.sum(g, v => v.bbl), v => v.cargo);
    const order = [...cargoColor.keys()].sort((a, b) => (totalByCargo.get(b) || 0) - (totalByCargo.get(a) || 0));

    // monthly bins: barrels per month per cargo -> bbl/day (÷ days in that month)
    const rowsByMonth = months.map(d => { const o = { month: d }; for (const c of order) o[c] = 0; return o; });
    for (const v of vs) {
      const mi = monthIndex.get(monthStartMs(v.t));
      if (mi == null) continue;
      rowsByMonth[mi][v.cargo] += v.bbl;
    }
    for (const row of rowsByMonth) {
      const dim = monthSpanDays(row.month);
      for (const c of order) row[c] = row[c] / dim;
    }
    const series = order.length ? d3.stack().keys(order)(rowsByMonth) : [];
    const monthTotal = rowsByMonth.map(row => d3.sum(order, c => row[c]));
    const barMax = d3.max(monthTotal) || 0;

    // trend band sampled across the (month-aligned) date range
    const bandAt = trend && trend.stats && typeof trend.stats.predictionBandAt === "function"
      ? trend.stats.predictionBandAt : null;
    const band = bandAt
      ? gridX.map(gx => {
          const b = bandAt(dateToYear(gx * dayMs));
          return b && Number.isFinite(b.upper)
            ? { gx, lower: Number.isFinite(b.lower) ? b.lower : 0, upper: b.upper, center: b.center } : null;
        }).filter(Boolean)
      : [];
    const bandMax = d3.max(band, b => b.upper) || 0;
    const bandShown = band.length >= 2 && bandMax < 2 * barMax;
    const bandAvg = band.length >= 2 ? (band[0].center + band[band.length - 1].center) / 2 : null;
    const yMax = Math.max(barMax, bandShown ? bandMax : 0, 1);

    return { padd: R.key, label: R.label, series, order, cargoColor, monthTotal, band, bandShown, bandAvg, yMax };
  });

  const globalYMax = d3.max(regions, r => r.yMax) || 1;

  // ============================================================
  // linked hover: any chart broadcasts the hovered month index to all charts
  // ============================================================
  const charts = [];
  const broadcast = mi => { for (const c of charts) if (c.setHover) c.setHover(mi); };

  // ============================================================
  // display mode (fixed: same y-scale, stacked categories)
  // ============================================================
  const yMode = DEFAULT_Y_MODE;
  const yMaxFor = r => (yMode === "same" ? globalYMax : r.yMax);

  // ============================================================
  // one SVG for a region at a given pixel width + y-domain
  // ============================================================
  function buildChart(c, pxWidth, yMax) {
    const r = c.region;
    const W = Math.max(MIN_WIDTH, pxWidth);
    const H = CHART_HEIGHT;
    const m = margin;
    const iw = Math.max(10, W - m.left - m.right);
    const ih = H - m.top - m.bottom;

    const x = d3.scaleTime().domain(xDomain).range([0, iw]);
    const y = d3.scaleLinear().domain([0, yMax]).nice().range([ih, 0]);
    const yticks = y.ticks(Y_TICKS);
    const monthW = d => x(d3.timeMonth.offset(d, 1)) - x(d);

    const svg = d3.create("svg")
      .attr("width", W).attr("height", H)
      .attr("viewBox", `0 0 ${W} ${H}`)
      .style("display", "block")
      .style("font-family", fontFamily)
      .style("overflow", "visible");
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    // horizontal gridlines (full width — no left gutter)
    g.append("g").selectAll("line").data(yticks).join("line")
      .attr("x1", 0).attr("x2", iw)
      .attr("y1", d => y(d)).attr("y2", d => y(d))
      .attr("stroke", "#eee");

    // x axis — monthly ticks; 3-letter labels centered within each month, thinned to fit
    const xAxis = g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b")).tickSizeOuter(0));
    xAxis.select(".domain").remove();                       // no x-axis baseline
    xAxis.selectAll(".tick line").attr("stroke", "#ccc");
    // center each month label within its month
    xAxis.selectAll("text").attr("fill", "#888").attr("font-size", TEXT_SIZE)
      .attr("text-anchor", "middle").attr("x", 0).attr("dx", d => monthW(d) / 2);
    const labels = xAxis.selectAll(".tick text");
    const every = Math.max(1, Math.ceil(labels.size() / Math.max(1, Math.floor(iw / 42))));
    // only label months that fully fall within the data range — partial first/last
    // months stay unlabelled (so their centered label can't overflow), but are still
    // revealed on hover (bold, below)
    const isFullMonth = d => { const [a, b] = monthSpan(d); return a === +d && b === +d3.timeMonth.offset(d, 1); };
    const baseOpacity = (d, i) => (isFullMonth(d) && i % every === 0 ? 1 : 0);
    labels.attr("opacity", baseOpacity);

    // ---- stacked monthly bars -----------------------------------------------
    const bars = [];
    r.series.forEach(layer => layer.forEach((seg, i) => {
      if (!(seg[1] - seg[0] > 0)) return;
      bars.push({ cargo: layer.key, mi: i, month: seg.data.month, y0: seg[0], y1: seg[1] });
    }));
    const barSel = g.append("g").selectAll("rect.bar").data(bars).join("rect")
      .attr("class", "bar")
      .attr("x", d => x(new Date(monthSpan(d.month)[0])) + BAR_GAP / 2)
      .attr("width", d => { const [a, b] = monthSpan(d.month); return Math.max(0, (x(new Date(b)) - x(new Date(a))) - BAR_GAP); })
      .attr("y", d => y(d.y1))
      .attr("height", d => Math.max(0, y(d.y0) - y(d.y1)))
      .attr("fill", d => r.cargoColor.get(d.cargo) || "#bbb")
      .attr("fill-opacity", AREA_OPACITY);

    // y numbers (haloed) — drawn before the band so the shaded projection sits on top
    g.append("g").selectAll("text").data(yticks.filter(d => d > 0)).join("text")
      .attr("x", 0).attr("y", d => y(d)).attr("dy", "-2.5")
      .attr("text-anchor", "start").attr("font-size", TEXT_SIZE).attr("font-weight", 600)
      .attr("fill", "#555").attr("stroke", "#fff").attr("stroke-width", 3)
      .attr("paint-order", "stroke").attr("stroke-linejoin", "round")
      .text(d => fmtAxis(d));

    // ---- historical trend (same rules as the KDE small multiples) -----------
    if (r.bandShown) {
      const mid = r.band[Math.floor(r.band.length / 2)];
      g.append("text")
        .attr("x", x(new Date(mid.gx * dayMs))).attr("y", Math.max(10, y(mid.center) - 5))
        .attr("text-anchor", "middle")
        .attr("fill", BAND_COLOR).attr("font-size", TEXT_SIZE).attr("font-weight", 400)
        .attr("stroke", "#fff").attr("stroke-width", 3).attr("paint-order", "stroke").attr("stroke-linejoin", "round")
        .text(fmtSig3(r.bandAvg));
      g.append("path").datum(r.band)
        .attr("fill", "#000").attr("fill-opacity", 0.1).attr("stroke", "none")
        .attr("d", d3.area().x(b => x(new Date(b.gx * dayMs))).y0(b => y(b.lower)).y1(b => y(b.upper)).curve(d3.curveLinear));
      g.append("path").datum(r.band)
        .attr("fill", "none").attr("stroke", BAND_COLOR).attr("stroke-width", BAND_WIDTH)
        .attr("d", d3.line().x(b => x(new Date(b.gx * dayMs))).y(b => y(b.center)).curve(d3.curveLinear));
    } else if (r.bandAvg != null) {
      // trend is off the top of the range: arrow+value pinned at the very top of the
      // plot (kept just inside so it doesn't overflow), with a caption beneath it
      g.append("text")
        .attr("x", iw / 2).attr("y", 11).attr("text-anchor", "middle")
        .attr("fill", BAND_COLOR).attr("font-size", TEXT_SIZE).attr("font-weight", 400)
        .attr("stroke", "#fff").attr("stroke-width", 3).attr("paint-order", "stroke").attr("stroke-linejoin", "round")
        .text(`\u2191 ${fmtSig3(r.bandAvg)}`);
      g.append("text")
        .attr("x", iw / 2).attr("y", 24).attr("text-anchor", "middle")
        .attr("fill", "#888").attr("font-size", TEXT_SIZE).attr("font-weight", 400)
        .attr("stroke", "#fff").attr("stroke-width", 3).attr("paint-order", "stroke").attr("stroke-linejoin", "round")
        .text("Trend projection");
    }

    // titles
    g.append("text").attr("x", 0).attr("y", -32)
      .attr("fill", "#333").attr("font-size", TITLE_SIZE).attr("font-weight", 700)
      .text(r.label);
    g.append("text").attr("x", 0).attr("y", -16).attr("text-anchor", "start")
      .attr("fill", "#aaa").attr("font-size", TEXT_SIZE)
      .text("bbl loaded / day");

    // ---- hover: bold 3-letter month (incl. partial edge months) + avg above bar --
    const avgText = g.append("text").attr("text-anchor", "middle")
      .attr("font-size", TEXT_SIZE).attr("font-weight", 700).attr("fill", "#000")
      .attr("stroke", "#fff").attr("stroke-width", 3.5).attr("paint-order", "stroke").attr("stroke-linejoin", "round")
      .attr("opacity", 0).attr("pointer-events", "none");
    const hMonth = g.append("text").attr("text-anchor", "middle")
      .attr("y", ih + 9).attr("dy", "0.71em")
      .attr("font-size", TEXT_SIZE).attr("font-weight", 700).attr("fill", "#333")
      .attr("stroke", "#fff").attr("stroke-width", 3).attr("paint-order", "stroke").attr("stroke-linejoin", "round")
      .attr("opacity", 0).attr("pointer-events", "none");

    c.setHover = mi => {
      barSel.attr("fill-opacity", d => (mi == null || d.mi === mi ? AREA_OPACITY : 0.3));
      // hide the hovered month's static label — hMonth (bold) stands in for it
      labels.attr("opacity", (d, i) => (mi != null && monthIndex.get(+d) === mi ? 0 : baseOpacity(d, i)));
      if (mi == null) { hMonth.attr("opacity", 0); avgText.attr("opacity", 0); return; }
      const d = months[mi];
      const [sa, sb] = monthSpan(d);
      const cx = (x(new Date(sa)) + x(new Date(sb))) / 2;
      const clampX = sel => {
        const half = sel.node().getComputedTextLength() / 2 + 2;   // keep text (+halo) inside
        return Math.max(half, Math.min(iw - half, cx));
      };
      hMonth.text(monthFmt(d)).attr("opacity", 1);
      hMonth.attr("x", clampX(hMonth));
      if (r.monthTotal[mi] > 0) {
        const val = r.monthTotal[mi];
        avgText.text(fmt(Math.round(val))).attr("y", Math.max(10, y(val) - 6)).attr("opacity", 1);
        avgText.attr("x", clampX(avgText));
      } else {
        avgText.attr("opacity", 0);
      }
    };
    c.clearHover = () => c.setHover(null);

    // capture rect on top — find which month the cursor is in, broadcast to all charts
    g.append("rect").attr("x", 0).attr("y", 0).attr("width", iw).attr("height", H - m.top)
      .attr("fill", "transparent")
      .on("mousemove", event => {
        const mx = Math.max(0, Math.min(iw, d3.pointer(event)[0]));
        const mi = monthIndex.get(+d3.timeMonth.floor(x.invert(mx)));
        broadcast(mi == null ? null : mi);
      })
      .on("mouseleave", () => broadcast(null));

    return svg.node();
  }

  // ============================================================
  // grid + responsive rendering
  // ============================================================
  const gridEl = html`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(${MIN_WIDTH}px,1fr));gap:${GRID_GAP}px;align-items:start;"></div>`;

  regions.forEach(r => {
    const cell = html`<div style="min-width:0;overflow:visible;"></div>`;
    gridEl.append(cell);
    charts.push({ region: r, cell, w: MIN_WIDTH });
  });

  const drawAt = (c, w) => { c.w = w; c.cell.replaceChildren(buildChart(c, w, yMaxFor(c.region))); };

  const ro = new ResizeObserver(entries => {
    for (const e of entries) {
      const w = e.contentRect.width;
      const c = charts.find(ch => ch.cell === e.target);
      if (c && w > 0) drawAt(c, w);
    }
  });
  charts.forEach(c => ro.observe(c.cell));
  if (typeof invalidation !== "undefined") invalidation.then(() => ro.disconnect());

  // first paint (ResizeObserver also fires on attach with the real width)
  requestAnimationFrame(() => charts.forEach(c => drawAt(c, c.cell.clientWidth || MIN_WIDTH)));

  const root = html`<div>
    ${gridEl}
  </div>`;
  root.style.setProperty("font-family", fontFamily);
  return root;
}


function _123(md){return(
md`### Hierarchical shipping flows`
)}

function _flows(d3,dataRoute)
{
  // d3 is already available in the notebook

  // ---------- config ----------
  const W = 1200, H = 800;
  const margin = { top: 20, right: 170, bottom: 20, left: 170 }; // left/right gutters hold the block labels
  const nodeWidth = 10;
  const portGap = 3, stateGap = 8, districtGap = 22;
  const bend = 0.5;            // bezier handle length as fraction of dx (~ sine-wave S-curve)
  const fillOpacity = 0.55;

  const OBS10 = d3.schemeObservable10 ||
    ["#4269d0","#efb118","#ff725c","#6cc5b0","#3ca951","#ff8ab7","#a463f2","#97bbf5","#9c6b4e","#9498a0"];
  const districtOrder = ["1A","1B","1C","PR","VI","BS","3","5","2"]; // top->bottom (Midwest last)
  const distRank = new Map(districtOrder.map((d,i)=>[d,i]));
  const rankOf = d => distRank.has(d) ? distRank.get(d) : 99;

  // ---------- state -> district (PADD, with PADD 1 split into 1A/1B/1C) ----------
  const NE  = new Set(["CT","ME","MA","NH","RI","VT"]);   // 1A New England
  const MID = new Set(["DE","DC","MD","NJ","NY","PA"]);   // 1B Central Atlantic
  const LOW = new Set(["FL","GA","NC","SC","VA","WV"]);   // 1C Lower Atlantic
  const STATE_PADD = {};
  [["1",["CT","ME","MA","NH","RI","VT","DE","DC","MD","NJ","NY","PA","FL","GA","NC","SC","VA","WV"]],
   ["2",["IL","IN","IA","KS","KY","MI","MN","MO","NE","ND","OH","OK","SD","TN","WI"]],
   ["3",["AL","AR","LA","MS","NM","TX"]],
   ["4",["CO","ID","MT","UT","WY"]],
   ["5",["AK","AZ","CA","HI","NV","OR","WA"]]].forEach(([p,arr])=>arr.forEach(s=>STATE_PADD[s]=p));
  const districtKey = (padd, state, text) => {
    const st=(state||"").toString().toUpperCase().trim(), tx=(text||"").toString();
    if (st==="PR"||/puerto\s*rico/i.test(tx)) return "PR";
    if (st==="VI"||/virgin\s*islands/i.test(tx)) return "VI";
    if (st==="BS"||st==="BA"||/bahamas/i.test(tx)) return "BS";
    let p=String(padd??"").replace(/[^0-9]/g,""); if(!p) p=STATE_PADD[st]||"";
    if (p==="1"){ if(NE.has(st))return "1A"; if(MID.has(st))return "1B"; if(LOW.has(st))return "1C"; return "1C"; }
    return p||"?";
  };

  const PADD_NAME = {
    "1A":"New England","1B":"Central Atlantic","1C":"Lower Atlantic","2":"Midwest",
    "3":"Gulf Coast","4":"Rocky Mountain","5":"West Coast","PR":"Puerto Rico","VI":"Virgin Islands","BS":"Bahamas"
  };
  const STATE_NAME = {
    AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",
    DC:"District of Columbia",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",
    KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",
    MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",
    NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",
    SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",
    WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",PR:"Puerto Rico",VI:"Virgin Islands",BS:"Bahamas",GU:"Guam"
  };
  const portDisplay = name => name.replace(/,\s*[A-Za-z][A-Za-z .]*$/, "");   // drop trailing state on ports
  const fmtBarrels  = v => d3.format(".3~s")(v).replace("k","K").replace("G","B"); // 3 sig figs, K/M/B/T

  // ---------- prepass: normalize records once + gather full hierarchy for coloring ----------
  const statesByPadd = new Map(), portsByState = new Map();
  const addH = (dist,state,port) => {
    let a=statesByPadd.get(dist); if(!a){a=new Set();statesByPadd.set(dist,a);} a.add(state);
    const ks=dist+"|"+state; let b=portsByState.get(ks); if(!b){b=new Set();portsByState.set(ks,b);} b.add(port);
  };
  const recs = [];
  for (const r of dataRoute) {
    const b = +String(r.barrels).replace(/[, ]/g,""); if(!b||!isFinite(b)||b<=0) continue;
    const lPort=(r.load_point||r.load_port||"load?").toString().trim();
    const uPort=(r.unload_point||r.unload_port||"unload?").toString().trim();
    const lState=(r.load_state||"").toString().toUpperCase().trim();
    const uState=(r.unload_state||"").toString().toUpperCase().trim();
    const lDist=districtKey(r.load_PADD,lState,lPort), uDist=districtKey(r.unload_PADD,uState,uPort);
    const lStateKey=lState||lDist, uStateKey=uState||uDist;
    recs.push({b,lPort,uPort,lStateKey,uStateKey,lDist,uDist});
    addH(lDist,lStateKey,lPort); addH(uDist,uStateKey,uPort);
  }
  const stateIdx=new Map(), portIdx=new Map();
  for (const [d,set] of statesByPadd) [...set].sort(d3.ascending).forEach((s,i)=>stateIdx.set(d+"|"+s,i));
  for (const [ks,set] of portsByState) [...set].sort(d3.ascending).forEach((p,j)=>portIdx.set(ks+"|"+p,j));

  // ---------- color hierarchy ----------
  // PADD = palette color. Below a level with >1 sibling, blend 66% parent + 34% a *different* palette accent,
  // giving each sibling a distinct shade inside its parent's family. Port blends state (66/34) then PADD (66/34).
  const palIdx    = d => { const i=districtOrder.indexOf(d); return i>=0?i:0; };
  const paddColor = d => OBS10[palIdx(d)%OBS10.length];
  const otherIdx  = (skip,i) => { let x=(skip+1+i)%OBS10.length; if(x===skip)x=(x+1)%OBS10.length; return x; };
  const mix       = (a,b,t) => d3.interpolateRgb(a,b)(t);   // (1-t)*a + t*b
  const stateColor = (d,s) => {
    const set=statesByPadd.get(d), pc=paddColor(d);
    if(!set||set.size<=1) return pc;
    return mix(pc, OBS10[otherIdx(palIdx(d), stateIdx.get(d+"|"+s)||0)], 0.34);
  };
  const portColor = (d,s,p) => {
    const set=portsByState.get(d+"|"+s), sc=stateColor(d,s);
    if(!set||set.size<=1) return sc;
    const blend = mix(sc, OBS10[otherIdx(palIdx(d), portIdx.get(d+"|"+s+"|"+p)||0)], 0.34); // 66% state + 34% accent
    return mix(paddColor(d), blend, 0.34);                                                   // 66% PADD  + 34% blend
  };
  const colorAt = (level,d,s,p) => level==="padd"?paddColor(d): level==="state"?stateColor(d,s):portColor(d,s,p);

  // ---------- build the chart for a given set of levels ----------
  const ribbonPath = (sx,sy0,sy1,tx,ty0,ty1) => { const cx=(tx-sx)*bend;
    return `M${sx},${sy0}C${sx+cx},${sy0} ${tx-cx},${ty0} ${tx},${ty0}L${tx},${ty1}C${tx-cx},${ty1} ${sx+cx},${sy1} ${sx},${sy1}Z`; };

  function buildChart(levels) {
    const loadOrder  = ["port","state","padd"].filter(l=>levels[l]);
    const dischOrder = ["padd","state","port"].filter(l=>levels[l]);
    const nLoad = loadOrder.length, nCols = nLoad + dischOrder.length;
    const centerLevel = levels.padd ? "padd" : levels.state ? "state" : "port"; // coarsest level shown drives all colours

    const svg = d3.create("svg").attr("viewBox",[0,0,W,H]).attr("width",W).attr("height",H)
      .attr("style","max-width:100%;height:auto;");
    if (nCols === 0) return svg.node();

    const nodes = new Map();
    const getNode = (col,name,meta) => { const id=col+"\u0001"+name; let n=nodes.get(id);
      if(!n){ n=Object.assign({id,col,name,value:0},meta); nodes.set(id,n); } return n; };
    const links = new Map();
    // links are split by loading-colour group so a colour can be drawn as one continuous ribbon through each bar
    const addLink = (source,target,value,layer,fill,ckey) => { const key=source.id+">"+target.id+">"+ckey.join("\u0001");
      let l=links.get(key); if(!l){ l={source,target,value:0,layer,fill,ckey}; links.set(key,l); } l.value+=value; return l; };
    const threads = [];
    const ckeyOf = r => centerLevel==="padd" ? [rankOf(r.lDist)]
                      : centerLevel==="state" ? [rankOf(r.lDist), r.lStateKey]
                      : [rankOf(r.lDist), r.lStateKey, r.lPort];

    const loadSpec = (lvl,r)=> lvl==="port"?{name:r.lPort,meta:{level:"port",dist:r.lDist,state:r.lStateKey,port:r.lPort}}
                            : lvl==="state"?{name:r.lStateKey,meta:{level:"state",dist:r.lDist,state:r.lStateKey}}
                            : {name:r.lDist,meta:{level:"padd",dist:r.lDist}};
    const dischSpec = (lvl,r)=> lvl==="port"?{name:r.uPort,meta:{level:"port",dist:r.uDist,state:r.uStateKey,port:r.uPort}}
                             : lvl==="state"?{name:r.uStateKey,meta:{level:"state",dist:r.uDist,state:r.uStateKey}}
                             : {name:r.uDist,meta:{level:"padd",dist:r.uDist}};

    for (const r of recs) {
      const recColor = colorAt(centerLevel, r.lDist, r.lStateKey, r.lPort); // colour by center (coarsest shown) level
      const ck = ckeyOf(r);
      const seq = [];
      loadOrder.forEach((lvl,i)=>{ const s=loadSpec(lvl,r);  seq.push(getNode(i,       s.name,{...s.meta,distRank:rankOf(s.meta.dist)})); });
      dischOrder.forEach((lvl,i)=>{ const s=dischSpec(lvl,r); seq.push(getNode(nLoad+i, s.name,{...s.meta,distRank:rankOf(s.meta.dist)})); });
      const lks=[]; for(let i=0;i<seq.length-1;i++) lks.push(addLink(seq[i],seq[i+1],r.b,i,recColor,ck));
      threads.push({ barrels:r.b, color:recColor, nodes:seq, links:lks,
        key:[rankOf(r.lDist), r.lStateKey, r.lPort, rankOf(r.uDist), r.uStateKey, r.uPort] });
    }

    const nodeArr=[...nodes.values()], linkArr=[...links.values()];
    const inSum=new Map(), outSum=new Map();
    for (const l of linkArr){ outSum.set(l.source.id,(outSum.get(l.source.id)||0)+l.value);
                              inSum.set(l.target.id,(inSum.get(l.target.id)||0)+l.value); }
    for (const n of nodeArr){ n.value=(n.col===0)?(outSum.get(n.id)||0):(inSum.get(n.id)||0);
                              n.fill=colorAt(centerLevel,n.dist,n.state,n.port); }

    // layout: stack columns, then align higher levels to the range of the level below
    const cmp=(a,b)=>(a.distRank-b.distRank)||d3.ascending(a.state||"",b.state||"")||d3.ascending(a.port||"",b.port||"")||d3.ascending(a.name,b.name);
    const gapBetween=(p,c)=> p.dist!==c.dist?districtGap:(p.state||"")!==(c.state||"")?stateGap:portGap;
    const colNodes=d3.groups(nodeArr,n=>n.col).sort((a,b)=>a[0]-b[0]);
    let maxPad=0; const padOf=new Map();
    for (const [c,arr] of colNodes){ arr.sort(cmp); let pad=0; for(let i=1;i<arr.length;i++)pad+=gapBetween(arr[i-1],arr[i]); padOf.set(c,pad); maxPad=Math.max(maxPad,pad); }
    const total=d3.sum(colNodes.find(d=>d[0]===0)[1],n=>n.value);
    const innerH=H-margin.top-margin.bottom, innerW=W-margin.left-margin.right;
    const k=(innerH-maxPad)/total;
    const xFor = nCols>1 ? c=>margin.left+c*(innerW-nodeWidth)/(nCols-1) : ()=>margin.left+(innerW-nodeWidth)/2;
    for (const [c,arr] of colNodes){ const colH=total*k+padOf.get(c); let y=margin.top+(innerH-colH)/2;
      for (let i=0;i<arr.length;i++){ if(i>0)y+=gapBetween(arr[i-1],arr[i]); const n=arr[i]; n.x=xFor(c); n.y=y; n.h=n.value*k; y+=n.h; } }

    const inNbr=new Map(),outNbr=new Map();
    const pushN=(m,key,v)=>{ let s=m.get(key); if(!s){s=new Set();m.set(key,s);} s.add(v); };
    for (const l of linkArr){ pushN(inNbr,l.target.id,l.source); pushN(outNbr,l.source.id,l.target); }
    const childrenOf=n=>[...((n.col<nLoad?inNbr:outNbr).get(n.id)||[])];
    const centerOn=arr=>{ for(const n of arr){ const kids=childrenOf(n); if(!kids.length)continue;
      const top=d3.min(kids,c=>c.y), bot=d3.max(kids,c=>c.y+c.h); n.y=(top+bot)/2-n.h/2; } };
    const byCol=new Map(colNodes);
    for (let c=1;c<nLoad;c++) centerOn(byCol.get(c));
    for (let c=nCols-2;c>=nLoad;c--) centerOn(byCol.get(c));

    // ribbon bands: load half + centre by neighbour; discharge half by loading COLOUR first, so each colour
    // enters and leaves every discharge bar at the same position (a continuous colour path through the bars)
    const cmpCKey=(a,b)=>{ for(let i=0;i<a.length;i++){ const d=typeof a[i]==="number"?a[i]-b[i]:d3.ascending(a[i],b[i]); if(d)return d; } return 0; };
    for (const [,ls] of d3.group(linkArr,l=>l.source.id)){
      const disch=ls[0].source.col>=nLoad;
      ls.sort(disch ? (a,b)=>cmpCKey(a.ckey,b.ckey)||(a.target.y-b.target.y) : (a,b)=>a.target.y-b.target.y);
      let y=ls[0].source.y; for(const l of ls){ l.sy0=y; y+=l.value*k; l.sy1=y; } }
    for (const [,ls] of d3.group(linkArr,l=>l.target.id)){
      const disch=ls[0].target.col>=nLoad;
      ls.sort(disch ? (a,b)=>cmpCKey(a.ckey,b.ckey)||(a.source.y-b.source.y) : (a,b)=>a.source.y-b.source.y);
      let y=ls[0].target.y; for(const l of ls){ l.ty0=y; y+=l.value*k; l.ty1=y; } }

    // subdivide each link band among its records, ordered by load hierarchy (keeps stacked slots consistent)
    const cmpKey=(a,b)=>{ for(let i=0;i<a.length;i++){ const d=typeof a[i]==="number"?a[i]-b[i]:d3.ascending(a[i],b[i]); if(d)return d; } return 0; };
    const linkThreads=new Map();
    for (const t of threads) for (const l of t.links){ let a=linkThreads.get(l); if(!a){a=[];linkThreads.set(l,a);} a.push(t); }
    for (const [l,ts] of linkThreads){ ts.sort((a,b)=>cmpKey(a.key,b.key)); let sy=l.sy0, ty=l.ty0;
      for (const t of ts){ const w=t.barrels*k; (t.out??={})[l.source.id]=[sy,sy+w]; sy+=w; (t.in??={})[l.target.id]=[ty,ty+w]; ty+=w; } }
    const nodeThreads=new Map();
    for (const t of threads) for (const nn of t.nodes){ let a=nodeThreads.get(nn.id); if(!a){a=[];nodeThreads.set(nn.id,a);} a.push(t); }

    // draw: base ribbons — one summed ribbon per connection & loading colour (links are colour-split)
    const linkSel=svg.append("g").selectAll("path").data(linkArr).join("path")
      .attr("d",l=>ribbonPath(l.source.x+nodeWidth, l.sy0,l.sy1, l.target.x, l.ty0,l.ty1))
      .attr("fill",l=>l.fill).attr("fill-opacity",fillOpacity).attr("stroke","none");
    const nodeSel=svg.append("g").selectAll("rect").data(nodeArr).join("rect")
      .attr("x",n=>n.x).attr("y",n=>n.y).attr("width",nodeWidth).attr("height",n=>Math.max(0,n.h))
      .attr("fill",n=>n.fill).style("cursor","pointer");
    const overlay=svg.append("g").attr("pointer-events","none");

    svg.append("g").attr("font-family","sans-serif").attr("font-size",9).attr("fill","#111")
       .attr("stroke","#fff").attr("stroke-width",2.5).attr("paint-order","stroke").attr("stroke-linejoin","round")
      .selectAll("text").data(nodeArr).join("text")
       .attr("x",n=>n.col<nLoad?n.x-4:n.x+nodeWidth+4).attr("y",n=>n.y+n.h/2)
       .attr("text-anchor",n=>n.col<nLoad?"end":"start").attr("dominant-baseline","middle")
       .each(function(n){ const sel=d3.select(this); const x=n.col<nLoad?n.x-4:n.x+nodeWidth+4;
         if(n.level==="padd"){ sel.append("tspan").attr("x",x).attr("dy","-0.5em").text(PADD_NAME[n.name]||n.name);
           sel.append("tspan").attr("x",x).attr("dy","1.15em").attr("font-size",8).attr("fill","#555").text(fmtBarrels(n.value)); }
         else sel.text(n.level==="port" ? portDisplay(n.name) : (STATE_NAME[n.name]||n.name)); });

    // hover a bar: build ONE aggregated, crossing-free tree from that bar's perspective.
    // A single bar's flow is always a tree, so parallel connections are summed into one ribbon each and
    // every bar is drawn as a clean segment anchored on the face nearest the hovered bar (no internal twist).
    nodeSel
      .on("mouseenter",(event,X)=>{
        const R=nodeThreads.get(X.id)||[];
        linkSel.attr("fill-opacity",0.05); nodeSel.attr("fill-opacity",0.2);
        overlay.selectAll("*").remove();
        if(!R.length) return;

        const nodeById=new Map(), nodeW=new Map(), edgeW=new Map(), edgeRecs=new Map();
        for (const t of R){
          for (const n of t.nodes){ nodeById.set(n.id,n); nodeW.set(n.id,(nodeW.get(n.id)||0)+t.barrels); }
          for (const l of t.links){ const key=l.source.id+">"+l.target.id;
            edgeW.set(key,(edgeW.get(key)||0)+t.barrels);
            let a=edgeRecs.get(key); if(!a){a=[];edgeRecs.set(key,a);} a.push(t); }
        }
        // per edge: loading-colour groups, ordered by load hierarchy to match the base colour order
        const edgeGroups=new Map();
        for (const [key,ts] of edgeRecs){ ts.sort((a,b)=>cmpKey(a.key,b.key));
          const g=[]; let i=0; while(i<ts.length){ const c=ts[i].color; let w=0,j=i; while(j<ts.length&&ts[j].color===c){ w+=ts[j].barrels; j++; } g.push({c,w}); i=j; }
          edgeGroups.set(key,g); }
        const adj=new Map(); const addA=(a,o,side)=>{ let x=adj.get(a); if(!x){x=[];adj.set(a,x);} x.push({other:o,side}); };
        for (const key of edgeW.keys()){ const i=key.indexOf(">"), a=key.slice(0,i), b=key.slice(i+1); addA(a,b,"right"); addA(b,a,"left"); }

        // BFS from the hovered bar: give each node its parent + which side the parent sits on
        const parent=new Map(); const order=[]; const seen=new Set([X.id]); const q=[X.id];
        while(q.length){ const id=q.shift(); order.push(id);
          for (const nb of (adj.get(id)||[])) if(!seen.has(nb.other)){ seen.add(nb.other); parent.set(nb.other,{pid:id,side:nb.side}); q.push(nb.other); } }

        // clean band per node: hovered bar = full; others = contiguous chunk on the near face, sized to its flow
        const band=new Map(); band.set(X.id,[X.y, X.y+X.h]);
        for (const id of order){ if(id===X.id) continue;
          const nearLeft = parent.get(id).side==="right";      // node sits right of parent -> near face is its left
          let minStart=Infinity;
          for (const t of R){ const s=nearLeft?t.in[id]:t.out[id]; if(s && s[0]<minStart) minStart=s[0]; }
          band.set(id,[minStart, minStart + nodeW.get(id)*k]);
        }

        // GLOBAL loading-colour order (matches the base layout's colour-first discharge stacking).
        // Used to group discharge faces by colour so the same colour lands in the same band on both sides.
        const colorMinKey=new Map();
        for (const t of R){ const c=t.color; const cur=colorMinKey.get(c);
          if(!cur || cmpKey(t.key,cur)<0) colorMinKey.set(c,t.key); }
        const colorRank=new Map(
          [...colorMinKey.entries()].sort((a,b)=>cmpKey(a[1],b[1])).map((e,i)=>[e[0],i]));
        const rankColor = c => colorRank.has(c) ? colorRank.get(c) : 1e9;

        // ribbons: subdivide each node's band among children. Discharge nodes (col >= nLoad) group each face
        // by loading COLOUR (then child position) so a colour enters and leaves at the same band on both faces
        // — no twist inside the bar, matching the base diagram. Loading nodes keep the child-block order.
        const ribs=[];
        for (const id of order){ const N=nodeById.get(id); const ny0=band.get(id)[0];
          const kids=(adj.get(id)||[]).filter(nb=>(parent.get(nb.other)||{}).pid===id);
          const start=cid=>band.get(cid)[0];
          const disch = N.col>=nLoad;
          for (const dir of ["right","left"]){
            const ks=kids.filter(nb=>nb.side===dir).map(nb=>nb.other).sort((a,b)=>start(a)-start(b));
            if(!ks.length) continue;

            if(disch){
              // gather one piece per (child, colour) then order the whole face by colour, then child position
              const pieces=[];
              for (const cid of ks){ const ekey = dir==="right" ? id+">"+cid : cid+">"+id;
                const groups = edgeGroups.get(ekey) || [{c:nodeById.get(cid).fill, w:nodeW.get(cid)}];
                for (const g of groups) pieces.push({cid,c:g.c,w:g.w}); }
              pieces.sort((a,b)=> (rankColor(a.c)-rankColor(b.c)) || (start(a.cid)-start(b.cid)) );
              let sc=ny0;                                             // parent-face cursor (top -> bottom, by colour)
              const cc=new Map(ks.map(cid=>[cid, band.get(cid)[0]])); // per-child near-face cursor (stays colour-ordered)
              for (const p of pieces){ const C=nodeById.get(p.cid); const h=p.w*k; const c0=cc.get(p.cid);
                ribs.push(dir==="right"
                  ? { d:ribbonPath(N.x+nodeWidth, sc,sc+h, C.x, c0,c0+h), c:p.c }
                  : { d:ribbonPath(C.x+nodeWidth, c0,c0+h, N.x, sc,sc+h), c:p.c });
                sc+=h; cc.set(p.cid, c0+h);
              }
            } else {
              // loading node: original child-block stacking (unchanged)
              let cur=ny0;
              for (const cid of ks){ const C=nodeById.get(cid), cb=band.get(cid);
                const ekey = dir==="right" ? id+">"+cid : cid+">"+id;
                const groups = edgeGroups.get(ekey) || [{c:C.fill, w:nodeW.get(cid)}];
                let sc=cur, cc=cb[0];
                for (const g of groups){ const h=g.w*k;
                  ribs.push(dir==="right"
                    ? { d:ribbonPath(N.x+nodeWidth, sc,sc+h, C.x, cc,cc+h), c:g.c }
                    : { d:ribbonPath(C.x+nodeWidth, cc,cc+h, N.x, sc,sc+h), c:g.c });
                  sc+=h; cc+=h;
                }
                cur+=nodeW.get(cid)*k;
              }
            }
          }
        }
        overlay.append("g").selectAll("path").data(ribs).join("path")
          .attr("d",d=>d.d).attr("fill",d=>d.c).attr("fill-opacity",fillOpacity).attr("stroke","none");
        overlay.append("g").selectAll("rect").data(order.map(id=>({n:nodeById.get(id),b:band.get(id)}))).join("rect")
          .attr("x",d=>d.n.x).attr("y",d=>d.b[0]).attr("width",nodeWidth).attr("height",d=>Math.max(0,d.b[1]-d.b[0])).attr("fill",d=>d.n.fill);
      })
      .on("mouseleave",()=>{ linkSel.attr("fill-opacity",fillOpacity); nodeSel.attr("fill-opacity",1); overlay.selectAll("*").remove(); });

    return svg.node();
  }

  // ---------- checkbox controls + (re)draw ----------
  const state = { port:true, state:true, padd:true };
  const container = d3.create("div").style("font","12px sans-serif");
  const bar = container.append("div").style("display","flex").style("gap","16px").style("margin","0 0 8px 2px");
  const holder = container.append("div");
  const redraw = () => { holder.selectAll("*").remove(); holder.node().appendChild(buildChart(state)); };
  [["port","Port"],["state","State"],["padd","PADD"]].forEach(([key,label])=>{
    const l = bar.append("label").style("display","inline-flex").style("align-items","center").style("gap","4px").style("cursor","pointer");
    l.append("input").attr("type","checkbox").property("checked",true)
      .on("change", function(){ state[key]=this.checked; redraw(); });
    l.append("span").text(label);
  });
  redraw();
  return container.node();
}


export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([
    ["americas_lakes.geojson", {url: "https://static.observableusercontent.com/files/c045e7ad03a5f9a57a7b99b0bfa63687875a3d77b9423effb76cf62014c1eb15aa9f508a0bab8962d2efc92271ad8340000c3cea305e23318f1c19f26027a909", mimeType: "application/geo+json"}],
    ["Waterway_Networks_4704106664473752717.geojson", {url: "https://static.observableusercontent.com/files/53eb636c5c7f0965eec44567dab28f2a4ea17707680a1bc7ee2b7dca281926a305f6fbe8c2f0a99de911f438b1cb9b6ecc042f568930bdc35b9ff63664863140", mimeType: "application/geo+json"}],
    ["Waterway_Networks_-1399073374797790963.geojson", {url: "https://static.observableusercontent.com/files/4850ecd1d8fb0a6a9cec998cc5ea9eb18f0610a2db0706ca68209f6a29aebfa3a926a064cdcca1c1a76bc516813cee03a82c66be8d6bfb35c4947c81294ac389", mimeType: "application/geo+json"}],
    ["americas_rivers (4).geojson", {url: "https://static.observableusercontent.com/files/5dae206d2575eacbeda82972d296d9117efa9209f080ef87830a423995299c23d35d6b4aa58f05d4de7553f394ffa87fb5346f5954571ad59329410c2af45889", mimeType: "application/geo+json"}],
    ["americas_countries_50m.geojson", {url: "https://static.observableusercontent.com/files/ac0617bd2bd6bc4b57a052ba6676859e914cbd22bcbcc64c2f54ad16c4182bd4db8ec811d155e546b0821a3198fd4fcbc93180ec96e2e96c8ef008706acb6990", mimeType: "application/geo+json"}],
    ["country-flags (1).json", {url: "https://static.observableusercontent.com/files/7897ea9af052f40c85459165534cdcd0364da6be5d19b9468a02d1d4ff2579432f554209ff7ae663530788492a7ad691344101e455f256146206477e35a182fe", mimeType: "application/json"}],
    ["us_states_territories_50m.geojson", {url: "https://static.observableusercontent.com/files/d404d20e4a4e4da14d40121b198a0b0833835345a94115ac4040035060a7cd6b155f8bff51173120f69d33e1f71b55bd94f617f07f3f9b320de16f7480006e7a", mimeType: "application/geo+json"}],
    ["NotoSansSymbols2-Regular.ttf", {url: "https://static.observableusercontent.com/files/ef5cb4aed2bfedb7c78f1624b4cc5c5c21058b8d90e6e160809e45df9daee12486443f3db523707ddc282e293fb19741f03c92ab0d61f6bb28e74ff9218d2da9", mimeType: "font/ttf"}],
    ["Inter-VariableFont_opsz,wght.ttf", {url: "https://static.observableusercontent.com/files/1c296518a437cb9b670caa747774c91e808c4d2153a17a6af7a70e2aba3af57b551af0a38b4221c35380451f31092024ec3a0a61e400f1e131f33be376f72eaf", mimeType: "font/ttf"}],
    ["Inter-Italic-VariableFont_opsz,wght.ttf", {url: "https://static.observableusercontent.com/files/6926f0f372961afdf4e45e6fe77021930d772eb57b6f2aa1bdd6b0738d3dd94437f8c894f3ed46db1b9cc653b4e73a4b83b2ade562f53eb21e550b285cdc561f", mimeType: "font/ttf"}],
    ["image.png", {url: "https://static.observableusercontent.com/files/2fe236e5d112b8f4beb8494413a83f17d0e15f8234e35ce03fcf40e8f43cfc66005e9b9eb08027025b4664b36348658b37eef1aece7a02a8cad73d047ab672b9", mimeType: "image/png"}],
    ["Cato_Institute.svg", {url: "https://static.observableusercontent.com/files/dd07ab0372138b3328890b935aa52e43b0ad3e44f004c56aadf537603493489cd5d9e57a647c7d3ec0e40ce7736c057831f37938cbf498610af94c0b415c16ff", mimeType: "image/svg+xml"}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer()).define(["md"], _3);
  main.variable(observer("viewof dashboard")).define("viewof dashboard", ["style","compile","html","stats","FileAttachment","cargoLegend","ResizeObserver","invalidation","sources","regionStats"], _dashboard);
  main.variable(observer("dashboard")).define("dashboard", ["Generators", "viewof dashboard"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], _5);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer()).define(["md"], _7);
  main.variable(observer()).define(["md"], _8);
  main.variable(observer()).define(["FileAttachment","md"], _9);
  main.variable(observer()).define(["md"], _10);
  main.variable(observer("config")).define("config", _config);
  main.variable(observer("buildBundleOrders")).define("buildBundleOrders", _buildBundleOrders);
  main.variable(observer("buildStraightPath")).define("buildStraightPath", _buildStraightPath);
  main.variable(observer("buildCurvedPath")).define("buildCurvedPath", _buildCurvedPath);
  main.variable(observer()).define(["md"], _15);
  main.variable(observer("junction1")).define("junction1", ["config","buildBundleOrders","buildCurvedPath","buildStraightPath","html","d3"], _junction1);
  main.variable(observer()).define(["md"], _17);
  main.variable(observer()).define(["md"], _18);
  main.variable(observer()).define(["md"], _19);
  main.variable(observer("junction2")).define("junction2", ["config","html","d3","orderBundle"], _junction2);
  main.variable(observer("bundlePriorities")).define("bundlePriorities", _bundlePriorities);
  main.variable(observer("resolveBundleOrder")).define("resolveBundleOrder", _resolveBundleOrder);
  main.variable(observer("orderBundle")).define("orderBundle", ["resolveBundleOrder","bundlePriorities"], _orderBundle);
  main.variable(observer()).define(["md"], _24);
  main.variable(observer()).define(["md"], _25);
  main.variable(observer()).define(["md"], _26);
  main.variable(observer()).define(["md"], _27);
  main.variable(observer("geometry")).define("geometry", _geometry);
  main.variable(observer("buildNavMesh")).define("buildNavMesh", ["geometry"], _buildNavMesh);
  main.variable(observer("pathfinding")).define("pathfinding", ["geometry"], _pathfinding);
  main.variable(observer("buildDecisionGraph")).define("buildDecisionGraph", _buildDecisionGraph);
  main.variable(observer("buildJunctionClassification")).define("buildJunctionClassification", _buildJunctionClassification);
  main.variable(observer("combinedPathNetwork")).define("combinedPathNetwork", _combinedPathNetwork);
  main.variable(observer("classifyPathNodes")).define("classifyPathNodes", _classifyPathNodes);
  main.variable(observer()).define(["md"], _35);
  main.variable(observer()).define(["md"], _36);
  main.variable(observer("makeParallel")).define("makeParallel", _makeParallel);
  main.variable(observer("arrangeCrossings")).define("arrangeCrossings", _arrangeCrossings);
  main.variable(observer("enforceParallelChainConsistency")).define("enforceParallelChainConsistency", _enforceParallelChainConsistency);
  main.variable(observer("optimizeIndex")).define("optimizeIndex", ["makeParallel","arrangeCrossings","enforceParallelChainConsistency"], _optimizeIndex);
  main.variable(observer("alignRoutes")).define("alignRoutes", _alignRoutes);
  main.variable(observer()).define(["md"], _42);
  main.variable(observer("buildCurvedCorner")).define("buildCurvedCorner", _buildCurvedCorner);
  main.variable(observer("routeCurvedSegments")).define("routeCurvedSegments", ["buildCurvedCorner"], _routeCurvedSegments);
  main.variable(observer("configNavMesh")).define("configNavMesh", ["d3"], _configNavMesh);
  main.variable(observer("chartNavMesh")).define("chartNavMesh", ["d3","configNavMesh","geometry","pathfinding","alignRoutes","routeCurvedSegments","buildNavMesh","combinedPathNetwork","classifyPathNodes","optimizeIndex","invalidation"], _chartNavMesh);
  main.variable(observer()).define(["md"], _47);
  main.variable(observer()).define(["md"], _48);
  main.variable(observer()).define(["md"], _49);
  main.variable(observer("loadSheetTab")).define("loadSheetTab", ["d3"], _loadSheetTab);
  main.variable(observer("voyageSheet")).define("voyageSheet", ["loadSheetTab"], _voyageSheet);
  main.variable(observer("portSheet")).define("portSheet", ["loadSheetTab"], _portSheet);
  main.variable(observer("cargoSheet")).define("cargoSheet", ["loadSheetTab"], _cargoSheet);
  main.variable(observer("vesselSheet")).define("vesselSheet", ["loadSheetTab"], _vesselSheet);
  main.variable(observer("historical")).define("historical", ["loadSheetTab"], _historical);
  main.variable(observer()).define(["md"], _56);
  main.variable(observer()).define(["md"], _57);
  main.variable(observer("countries")).define("countries", ["FileAttachment"], _countries);
  main.variable(observer("states")).define("states", ["FileAttachment"], _states);
  main.variable(observer("lakes")).define("lakes", ["FileAttachment"], _lakes);
  main.variable(observer("rivers")).define("rivers", ["FileAttachment"], _rivers);
  main.variable(observer("waterway_networks")).define("waterway_networks", ["FileAttachment"], _waterway_networks);
  main.variable(observer("waterway_networks_simplified")).define("waterway_networks_simplified", ["require","waterway_networks"], _waterway_networks_simplified);
  main.variable(observer("waterway_networks_nodes")).define("waterway_networks_nodes", ["FileAttachment"], _waterway_networks_nodes);
  main.variable(observer()).define(["md"], _65);
  main.variable(observer("dataNavMesh")).define("dataNavMesh", _dataNavMesh);
  main.variable(observer("globeNavMesh")).define("globeNavMesh", ["dataNavMesh","htl","d3","countries","waterway_networks_simplified","waterway_networks_nodes","rivers","lakes","buildNavMesh","geometry","pathfinding","AbortController","ResizeObserver","MutationObserver"], _globeNavMesh);
  main.variable(observer()).define(["md"], _68);
  main.variable(observer()).define(["md"], _69);
  main.variable(observer()).define(["md"], _70);
  main.variable(observer("cameraRange")).define("cameraRange", _cameraRange);
  main.variable(observer()).define(["md"], _72);
  main.variable(observer("globe")).define("globe", ["htl","d3","countries","navMesh","combinedPathNetwork","pathfinding","classifyPathNodes","globeRoutesHelpers","dataRoute","cameraRange","dataNavMesh","buildNavMesh","rivers","lakes","AbortController","ResizeObserver","MutationObserver"], _globe);
  main.variable(observer("dataRoute")).define("dataRoute", ["portSheet","cargoSheet","d3","voyageSheet"], _dataRoute);
  main.variable(observer("dataPorts")).define("dataPorts", ["dataRoute"], _dataPorts);
  main.variable(observer()).define(["d3","dataRoute"], _76);
  main.variable(observer()).define(["md"], _77);
  main.variable(observer("fonts")).define("fonts", ["FileAttachment","invalidation"], _fonts);
  main.variable(observer("navMesh")).define("navMesh", ["dataNavMesh","buildNavMesh","d3"], _navMesh);
  main.variable(observer("routes")).define("routes", ["dataRoute","navMesh","configGlobe","pathfinding","geometry"], _routes);
  main.variable(observer("globeRoutesHelpers")).define("globeRoutesHelpers", ["buildCurvedCorner","d3"], _globeRoutesHelpers);
  main.variable(observer("configGlobe")).define("configGlobe", _configGlobe);
  main.variable(observer()).define(["md"], _83);
  main.variable(observer("dashboardHelpers")).define("dashboardHelpers", _dashboardHelpers);
  main.variable(observer()).define(["md"], _85);
  main.variable(observer("viewof attachCell")).define("viewof attachCell", ["html"], _attachCell);
  main.variable(observer("attachCell")).define("attachCell", ["Generators", "viewof attachCell"], (G, _) => G.input(_));
  main.variable(observer("stats")).define("stats", ["attachCell","configGlobe","dataRoute","d3","IntersectionObserver","invalidation"], _stats);
  main.variable(observer("cargoLegend")).define("cargoLegend", ["attachCell","fonts","dashboardHelpers","configGlobe","routes","html","state","invalidation"], _cargoLegend);
  main.variable(observer("globeRoutes")).define("globeRoutes", ["attachCell","fonts","state","dashboardHelpers","configNavMesh","configGlobe","globeRoutesHelpers","htl","d3","countries","navMesh","combinedPathNetwork","classifyPathNodes","optimizeIndex","alignRoutes","buildCurvedCorner","pathfinding","routes","dataPorts","states","cameraRange","rivers","lakes","SVGGeometryElement","invalidation","AbortController","ResizeObserver"], _globeRoutes);
  main.variable(observer("timeline")).define("timeline", ["attachCell","state","dashboardHelpers","dataRoute","d3","width","configGlobe","invalidation"], _timeline);
  main.variable(observer("routeList")).define("routeList", ["attachCell","state","dashboardHelpers","globeRoutesHelpers","routes","html","configGlobe","flag","d3","getComputedStyle","invalidation"], _routeList);
  main.variable(observer("sources")).define("sources", ["attachCell"], _sources);
  main.variable(observer("regionStats")).define("regionStats", ["attachCell","dataRoute","d3","cargoSheet","routes","jonesActBarrels","windowStats","historicalMapped","states","html","width","ResizeObserver","invalidation"], _regionStats);
  main.variable(observer("flags")).define("flags", ["FileAttachment"], _flags);
  main.variable(observer("flag")).define("flag", ["html","flags"], _flag);
  main.variable(observer()).define(["flag"], _96);
  main.variable(observer()).define(["md"], _97);
  main.variable(observer("stateDefaults")).define("stateDefaults", _stateDefaults);
  main.variable(observer("state")).define("state", ["localStorage","stateDefaults"], _state);
  main.variable(observer("compile")).define("compile", ["attachCell","globeRoutes","timeline","routeList"], _compile);
  main.variable(observer("style")).define("style", ["html"], _style);
  main.variable(observer("routesByStateTable")).define("routesByStateTable", _routesByStateTable);
  main.variable(observer()).define(["md"], _103);
  main.variable(observer()).define(["md"], _104);
  main.variable(observer()).define(["md"], _105);
  main.variable(observer("mappingTree")).define("mappingTree", ["cargoSheet","d3","historicalMapped","width"], _mappingTree);
  main.variable(observer()).define(["md"], _107);
  main.variable(observer("historicalMapped")).define("historicalMapped", ["historical"], _historicalMapped);
  main.variable(observer("windowStats")).define("windowStats", ["d3"], _windowStats);
  main.variable(observer()).define(["md"], _110);
  main.variable(observer("comparisonChart")).define("comparisonChart", ["d3","cargoSheet","historicalMapped","width","html","windowStats"], _comparisonChart);
  main.variable(observer()).define(["md"], _112);
  main.variable(observer("timelineBeeswarm")).define("timelineBeeswarm", ["attachCell","state","dataRoute","d3","width","invalidation"], _timelineBeeswarm);
  main.variable(observer()).define(["md"], _114);
  main.variable(observer()).define(["md"], _115);
  main.variable(observer("jonesActBarrels")).define("jonesActBarrels", ["routes","d3"], _jonesActBarrels);
  main.variable(observer("kernelTrendChart")).define("kernelTrendChart", ["routes","d3","html","width","historicalMapped","windowStats"], _kernelTrendChart);
  main.variable(observer()).define(["md"], _118);
  main.variable(observer()).define(["md"], _119);
  main.variable(observer("kernelSmallMultiples")).define("kernelSmallMultiples", ["d3","historicalMapped","windowStats","jonesActBarrels","html","ResizeObserver","invalidation"], _kernelSmallMultiples);
  main.variable(observer()).define(["md"], _121);
  main.variable(observer("histogramSmallMultiples")).define("histogramSmallMultiples", ["d3","historicalMapped","windowStats","jonesActBarrels","html","ResizeObserver","invalidation"], _histogramSmallMultiples);
  main.variable(observer()).define(["md"], _123);
  main.variable(observer("flows")).define("flows", ["d3","dataRoute"], _flows);
  return main;
}
