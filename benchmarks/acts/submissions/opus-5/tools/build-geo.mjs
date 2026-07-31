// Turns the bundled reference data into the four files the page draws from.
//
//   js/data-land.js       land outlines, and the lakes inside them
//   js/data-provinces.js  approximate province regions
//   js/data-routes.js     one polyline per leg of every journey in Acts
//   js/data-labels.js     ancient names, from the region-label file
//
// Run:  node tools/build-geo.mjs            (add --report to list stray basins)
//
// Nothing here runs in the browser. The page loads only the generated files.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  makeGrid, burnLines, flood, traceRegion, ringToLonLat, signedArea,
  simplify, smooth, km, pathKm, round, LON0, LAT0, LON1, LAT1
} from "./lib/grid.mjs";
import { LEGS, EXTRA_PLACES, SEA_MARKS } from "./legs.mjs";
import { PROVINCES, DISTRICTS, WATER_SEEDS } from "./provinces.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const MAPDATA = join(HERE, "..", "..", "..", "mapdata");
const OUT = join(HERE, "..", "js");
const REPORT = process.argv.includes("--report");

const read = (f) => JSON.parse(readFileSync(join(MAPDATA, f), "utf8"));
const coastline = read("coastline.geojson");
const borders = read("province-borders.geojson");
const roadsGeo = read("roads.geojson");
const regionLabels = read("region-labels.geojson");
const placeFile = read("acts-places.json");

const PLACE = new Map();
for (const p of placeFile.places) PLACE.set(p.acts_name, [p.lon, p.lat]);

const log = (...a) => console.log(...a);
const t0 = Date.now();
const stamp = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;

// ---------------------------------------------------------------- water ----
// One grid, fine enough that a ship can thread the Strait of Messina: the
// narrows there are about three kilometres, and at a coarser step the strait
// closes and the voyage to Puteoli sails the long way round Sicily.
const FINE = makeGrid(0.01);
const coastMask = new Uint8Array(FINE.n);
burnLines(FINE, coastline.features, coastMask, 1);
log(`[${stamp()}] fine grid ${FINE.W}x${FINE.H}, coast cells ${coastMask.reduce((a, v) => a + v, 0)}`);

/**
 * Flood the seas from the seed list, checking each one before accepting it.
 *
 * A seed that lands a few hundred metres inland does not fail loudly — it
 * floods the whole of Eurasia, and every step after it quietly works on
 * nonsense. So each seed is grown on its own and rejected if it swallows a
 * continent.
 */
function floodWater(grid, coast, verbose) {
  const out = new Uint8Array(grid.n);
  const scratch = new Uint8Array(grid.n);
  const blocked = (p) => coast[p] === 1;
  for (const [lon, lat, name] of WATER_SEEDS) {
    const p = grid.at(lon, lat);
    if (p < 0 || coast[p] || out[p]) continue;
    scratch.fill(0);
    const r = flood(grid, p, blocked, scratch, 1);
    if (r.n > grid.n * 0.35) {
      if (verbose) log(`  ! seed "${name}" flooded ${r.n} cells — a landmass, not a sea; ignored`);
      continue;
    }
    for (let i = 0; i < grid.n; i++) if (scratch[i]) out[i] = 1;
    if (verbose) log(`    water: ${name.padEnd(18)} ${r.n} cells`);
  }
  return out;
}

const blockedByCoast = (p) => coastMask[p] === 1;
const water = floodWater(FINE, coastMask, true);
const waterCells = water.reduce((a, v) => a + v, 0);
log(`[${stamp()}] water cells ${waterCells} (${((100 * waterCells) / FINE.n).toFixed(1)}% of grid)`);

if (REPORT) {
  // Anything still unclaimed and enclosed is either a lake nobody seeded or a
  // gulf the simplification pinched shut. List the big ones so they can be named.
  const seen = new Uint8Array(FINE.n);
  const found = [];
  for (let p = 0; p < FINE.n; p++) {
    if (coastMask[p] || water[p] || seen[p]) continue;
    const r = flood(FINE, p, blockedByCoast, seen, 1);
    if (r.n > 150 && r.n < 60000) {
      const x = p % FINE.W, y = (p / FINE.W) | 0;
      found.push([r.n, FINE.lonAt(x).toFixed(2), FINE.latAt(y).toFixed(2)]);
    }
  }
  found.sort((a, b) => b[0] - a[0]);
  log("\nunclassified enclosed basins (cells, lon, lat):");
  for (const f of found.slice(0, 50)) log("   ", f.join("  "));
  log("");
}

// ----------------------------------------------------------------- land ----
const landRings = traceRegion(FINE, (p) => water[p] !== 1);
log(`[${stamp()}] traced ${landRings.length} rings`);

const MIN_CELLS = 12;
const outlines = [];
const lakes = [];
for (const ring of landRings) {
  const area = Math.abs(signedArea(ring));
  if (area < MIN_CELLS) continue;
  const ll = simplify(ringToLonLat(FINE, ring), 0.008);
  if (ll.length < 4) continue;
  (signedArea(ring) < 0 ? outlines : lakes).push(round(ll, 3));
}
outlines.sort((a, b) => b.length - a.length);
log(`[${stamp()}] land: ${outlines.length} outlines, ${lakes.length} lakes, ` +
  `${outlines.reduce((a, r) => a + r.length, 0) + lakes.reduce((a, r) => a + r.length, 0)} points`);

// ------------------------------------------------------------ provinces ----
// A coarser grid: these are approximate regions by intent, and a soft edge is
// more honest than a crisp one drawn from borders dated a century and a half
// after the events.
const PG = makeGrid(0.02);
const pgCoast = new Uint8Array(PG.n);
burnLines(PG, coastline.features, pgCoast, 1);
const pgWater = floodWater(PG, pgCoast, false);
const pgBorder = new Uint8Array(PG.n);
burnLines(PG, borders.features, pgBorder, 1);

const CELL_KM = 0.02 * 111.32;
const TOLL = 55;                       // cost of stepping over a mapped border
const CAP = Math.round(260 / CELL_KM); // how far a province may reach from an anchor
const owner = new Int32Array(PG.n).fill(-1);
const cost = new Int32Array(PG.n).fill(0x7fffffff);
const buckets = Array.from({ length: CAP + TOLL + 2 }, () => []);

const passable = (p) => pgWater[p] !== 1 && pgCoast[p] !== 1;
PROVINCES.forEach((prov, idx) => {
  for (const [lon, lat] of prov.anchors) {
    const p = PG.at(lon, lat);
    if (p < 0) { log(`  ! anchor off grid: ${prov.id} ${lon},${lat}`); continue; }
    if (!passable(p)) {                      // anchors sit in ports; nudge inland
      let moved = false;
      for (let r = 1; r <= 4 && !moved; r++)
        for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [0, -r], [r, r], [-r, -r], [r, -r], [-r, r]]) {
          const q = p + dy * PG.W + dx;
          if (q >= 0 && q < PG.n && passable(q)) { seed(q, idx); moved = true; break; }
        }
      if (!moved) log(`  ! anchor stuck in water: ${prov.id} ${lon},${lat}`);
    } else seed(p, idx);
  }
});
function seed(p, idx) {
  if (cost[p] === 0) return;
  cost[p] = 0;
  owner[p] = idx;
  buckets[0].push(p);
}

for (let c = 0; c <= CAP; c++) {
  const bucket = buckets[c];
  for (let i = 0; i < bucket.length; i++) {
    const p = bucket[i];
    if (cost[p] !== c) continue;
    const x = p % PG.W, y = (p / PG.W) | 0;
    for (const q of [x > 0 ? p - 1 : -1, x < PG.W - 1 ? p + 1 : -1,
      y > 0 ? p - PG.W : -1, y < PG.H - 1 ? p + PG.W : -1]) {
      if (q < 0 || !passable(q)) continue;
      const nc = c + 1 + (pgBorder[q] ? TOLL : 0);
      if (nc > CAP || nc >= cost[q]) continue;
      cost[q] = nc;
      owner[q] = owner[p];
      buckets[nc].push(q);
    }
  }
  buckets[c].length = 0;
}
log(`[${stamp()}] provinces grown; ${owner.reduce((a, v) => a + (v >= 0 ? 1 : 0), 0)} land cells claimed`);

const provinceOut = PROVINCES.map((prov, idx) => {
  const rings = traceRegion(PG, (p) => owner[p] === idx)
    .filter((r) => Math.abs(signedArea(r)) >= 20)
    .map((r) => {
      const simplified = simplify(ringToLonLat(PG, r), 0.035);
      return round(smooth(simplified, 2), 3);
    })
    .filter((r) => r.length >= 6);
  rings.sort((a, b) => b.length - a.length);
  return {
    id: prov.id, name: prov.name, tone: prov.tone,
    client: prov.client ?? false, outside: prov.outside ?? false,
    rings
  };
});
for (const p of provinceOut)
  log(`    ${p.id.padEnd(13)} ${String(p.rings.length).padStart(2)} part(s), ` +
    `${p.rings.reduce((a, r) => a + r.length, 0)} pts`);

// ------------------------------------------------------------- sea route ----
// A* over water cells. The ship never crosses land because it cannot: the grid
// will not let it.
const searchG = new Float64Array(FINE.n);
const searchPrev = new Int32Array(FINE.n);
const searchGen = new Int32Array(FINE.n);
const searchClosed = new Int32Array(FINE.n);
let generation = 0;

function snapToWater(lon, lat, maxKm = 45) {
  const cx = Math.round(FINE.gx(lon)), cy = Math.round(FINE.gy(lat));
  const maxR = Math.ceil(maxKm / (0.01 * 111));
  for (let r = 0; r <= maxR; r++) {
    let best = -1, bestD = Infinity;
    for (let dx = -r; dx <= r; dx++)
      for (let dy = -r; dy <= r; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = cx + dx, y = cy + dy;
        if (x < 0 || x >= FINE.W || y < 0 || y >= FINE.H) continue;
        const p = y * FINE.W + x;
        if (water[p] !== 1) continue;
        const d = Math.hypot(dx, dy);
        if (d < bestD) { bestD = d; best = p; }
      }
    if (best >= 0) return { p: best, km: bestD * 0.01 * 111 };
  }
  return null;
}

const DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];

function astar(start, goal) {
  const gen = ++generation;
  const gxg = goal % FINE.W, gyg = (goal / FINE.W) | 0;
  // Keep the search in a box around the leg; nothing in Acts needs a detour
  // wider than this, and it keeps the whole build under a minute.
  const sxs = start % FINE.W, sys = (start / FINE.W) | 0;
  const pad = Math.max(180, Math.round(Math.hypot(gxg - sxs, gyg - sys) * 0.55));
  const bx0 = Math.min(sxs, gxg) - pad, bx1 = Math.max(sxs, gxg) + pad;
  const by0 = Math.min(sys, gyg) - pad, by1 = Math.max(sys, gyg) + pad;

  // Parallel arrays rather than tuples: this heap sees millions of pushes.
  const hf = [], hp = [];
  const push = (f, p) => {
    hf.push(f); hp.push(p);
    let i = hf.length - 1;
    while (i > 0) {
      const par = (i - 1) >> 1;
      if (hf[par] <= hf[i]) break;
      [hf[par], hf[i]] = [hf[i], hf[par]];
      [hp[par], hp[i]] = [hp[i], hp[par]];
      i = par;
    }
  };
  const pop = () => {
    const top = hp[0], lf = hf.pop(), lp = hp.pop();
    if (hf.length) {
      hf[0] = lf; hp[0] = lp;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < hf.length && hf[l] < hf[m]) m = l;
        if (r < hf.length && hf[r] < hf[m]) m = r;
        if (m === i) break;
        [hf[m], hf[i]] = [hf[i], hf[m]];
        [hp[m], hp[i]] = [hp[i], hp[m]];
        i = m;
      }
    }
    return top;
  };

  searchG[start] = 0;
  searchGen[start] = gen;
  searchPrev[start] = -1;
  push(Math.hypot(gxg - sxs, gyg - sys), start);
  while (hf.length) {
    const p = pop();
    if (searchClosed[p] === gen) continue;  // stale heap entry
    searchClosed[p] = gen;
    if (p === goal) break;
    const x = p % FINE.W, y = (p / FINE.W) | 0;
    for (const [dx, dy, w] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (nx < bx0 || nx > bx1 || ny < by0 || ny > by1) continue;
      if (nx < 0 || nx >= FINE.W || ny < 0 || ny >= FINE.H) continue;
      const np = ny * FINE.W + nx;
      if (water[np] !== 1 || searchClosed[np] === gen) continue;
      const ng = searchG[p] + w;
      if (searchGen[np] === gen && ng >= searchG[np]) continue;
      searchGen[np] = gen;
      searchG[np] = ng;
      searchPrev[np] = p;
      push(ng + Math.hypot(gxg - nx, gyg - ny), np);
    }
  }
  if (searchGen[goal] !== gen) return null;
  const cells = [];
  for (let p = goal; p >= 0; p = searchPrev[p]) cells.push(p);
  cells.reverse();
  return cells;
}

/** Is every cell on the straight line between two cells water? */
function clearWater(p0, p1) {
  const x0 = p0 % FINE.W, y0 = (p0 / FINE.W) | 0;
  const x1 = p1 % FINE.W, y1 = (p1 / FINE.W) | 0;
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let s = 1; s < steps; s++) {
    const x = Math.round(x0 + ((x1 - x0) * s) / steps);
    const y = Math.round(y0 + ((y1 - y0) * s) / steps);
    if (water[y * FINE.W + x] !== 1) return false;
  }
  return true;
}

/**
 * Pull the string taut.
 *
 * A* on a square grid can only move in eight directions, so an open-sea
 * crossing comes out as a dogleg — straight west, then a diagonal, then west
 * again. Dropping every point that can be skipped without the line touching
 * land turns that back into the run a ship would actually make, while leaving
 * the detail where the coast is doing the steering.
 */
function pullTaut(cells) {
  if (cells.length < 3) return cells.slice();
  const out = [cells[0]];
  let anchor = 0;
  for (let j = 2; j < cells.length; j++) {
    if (clearWater(cells[anchor], cells[j])) continue;
    out.push(cells[j - 1]);
    anchor = j - 1;
  }
  out.push(cells[cells.length - 1]);
  return out;
}

function seaRoute(a, b, via = []) {
  const stops = [a, ...via, b];
  const snaps = stops.map(([lon, lat]) => snapToWater(lon, lat));
  if (snaps.some((s) => !s)) return null;
  let cells = [];
  for (let i = 1; i < snaps.length; i++) {
    const seg = astar(snaps[i - 1].p, snaps[i].p);
    if (!seg) return null;
    cells = cells.length ? cells.concat(seg.slice(1)) : seg;
  }
  const taut = pullTaut(cells);
  const points = taut.map((p) => [FINE.lonAt(p % FINE.W), FINE.latAt((p / FINE.W) | 0)]);
  return {
    points: smooth(simplify(points, 0.01), 1, false),
    offshore: [snaps[0].km, snaps[snaps.length - 1].km]
  };
}

// ------------------------------------------------------------ land route ----
// The road file is patchy: Attica and the Peloponnese have no roads in it at
// all. So a land leg follows the mapped roads only when the result is credible,
// and says so in the data when it does not.
const SNAP = 0.004;
const rnIndex = new Map();
const rnodes = [];
const radj = [];
function rnodeAt(p) {
  const k = `${Math.round(p[0] / SNAP)},${Math.round(p[1] / SNAP)}`;
  let i = rnIndex.get(k);
  if (i === undefined) {
    i = rnodes.length;
    rnodes.push([p[0], p[1]]);
    radj.push([]);
    rnIndex.set(k, i);
  }
  return i;
}
for (const f of roadsGeo.features)
  for (const line of f.geometry.coordinates)
    for (let i = 1; i < line.length; i++) {
      const a = rnodeAt(line[i - 1]), b = rnodeAt(line[i]);
      if (a === b) continue;
      const d = km(rnodes[a], rnodes[b]);
      radj[a].push([b, d, 0]);
      radj[b].push([a, d, 0]);
    }

const RCELL = 0.25;
const rgrid = new Map();
rnodes.forEach((p, i) => {
  const k = `${Math.floor(p[0] / RCELL)},${Math.floor(p[1] / RCELL)}`;
  const list = rgrid.get(k);
  if (list) list.push(i); else rgrid.set(k, [i]);
});
const rnear = (p, radiusDeg) => {
  const out = [];
  const cx = Math.floor(p[0] / RCELL), cy = Math.floor(p[1] / RCELL);
  const span = Math.ceil(radiusDeg / RCELL);
  for (let x = cx - span; x <= cx + span; x++)
    for (let y = cy - span; y <= cy + span; y++)
      for (const i of rgrid.get(`${x},${y}`) ?? []) out.push(i);
  return out;
};

// The survey is broken into 921 fragments, and a road that stops at a river and
// resumes on the far bank is a gap in the record, not a road that never existed.
// So every short gap gets a join, costed at two and a half times its length so
// the router still prefers real pavement. Joining only enough to make the graph
// connected is not enough — one arbitrary chain leaves a route from Antioch to
// Tarsus going the long way round Anatolia.
{
  const comp = new Int32Array(rnodes.length).fill(-1);
  let c = 0;
  for (let s = 0; s < rnodes.length; s++) {
    if (comp[s] >= 0) continue;
    const st = [s];
    comp[s] = c;
    while (st.length) {
      const x = st.pop();
      for (const [y] of radj[x]) if (comp[y] < 0) { comp[y] = c; st.push(y); }
    }
    c++;
  }

  const NEAR_DEG = 0.14;   // about 15 km
  const PER_NODE = 4;
  let joins = 0;
  const joinEdge = (i, j, d) => {
    radj[i].push([j, d * 2.5, 1]);
    radj[j].push([i, d * 2.5, 1]);
    joins++;
  };
  for (let i = 0; i < rnodes.length; i++) {
    const already = new Set(radj[i].map(([y]) => y));
    const cand = [];
    for (const j of rnear(rnodes[i], NEAR_DEG)) {
      if (j <= i || already.has(j)) continue;
      const d = km(rnodes[i], rnodes[j]);
      if (d <= NEAR_DEG * 111) cand.push([d, j]);
    }
    cand.sort((a, b) => a[0] - b[0]);
    for (const [d, j] of cand.slice(0, PER_NODE)) joinEdge(i, j, d);
  }

  // Whatever is still an island after that gets one long join, so no leg fails
  // outright for want of a link.
  const parent = Int32Array.from({ length: c }, (_, i) => i);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const far = [];
  for (let i = 0; i < rnodes.length; i++)
    for (const j of rnear(rnodes[i], 0.45)) {
      if (j <= i || comp[i] === comp[j]) continue;
      far.push([km(rnodes[i], rnodes[j]), i, j]);
    }
  far.sort((a, b) => a[0] - b[0]);
  let bridges = 0;
  for (const [d, i, j] of far) {
    const a = find(comp[i]), b = find(comp[j]);
    if (a === b) continue;
    parent[a] = b;
    joinEdge(i, j, d);
    bridges++;
  }
  log(`[${stamp()}] road graph: ${rnodes.length} nodes, ${c} fragments, ` +
    `${joins - bridges} short joins, ${bridges} bridges`);
}

function nearestRoadNode(p) {
  let best = -1, bestD = Infinity;
  for (let r = 0.2; r <= 2 && best < 0; r *= 2)
    for (const i of rnear(p, r)) {
      const d = km(rnodes[i], p);
      if (d < bestD) { bestD = d; best = i; }
    }
  return { i: best, km: bestD };
}

function roadRoute(a, b) {
  const s = nearestRoadNode(a), g = nearestRoadNode(b);
  if (s.i < 0 || g.i < 0) return null;
  const dist = new Float64Array(rnodes.length).fill(Infinity);
  const prev = new Int32Array(rnodes.length).fill(-1);
  const viaJoin = new Float64Array(rnodes.length);
  dist[s.i] = 0;
  const heap = [[0, s.i]];
  const pushH = (v) => {
    heap.push(v);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const popH = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, x] = popH();
    if (d > dist[x]) continue;
    if (x === g.i) break;
    for (const [y, w, isJoin] of radj[x]) {
      const nd = d + w;
      if (nd >= dist[y]) continue;
      dist[y] = nd;
      prev[y] = x;
      viaJoin[y] = Math.max(viaJoin[x], isJoin ? w / 3 : 0);
      pushH([nd, y]);
    }
  }
  if (!Number.isFinite(dist[g.i])) return null;
  const path = [];
  for (let x = g.i; x >= 0; x = prev[x]) path.push(rnodes[x]);
  path.reverse();
  return {
    points: [a, ...path, b],
    length: pathKm(path),
    snap: Math.max(s.km, g.km),
    longestJoin: viaJoin[g.i]
  };
}

/** A gentle arc, for a leg the road data cannot support. */
function arc(a, b, bow = 0.09) {
  const out = [];
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const cx = mx - dy * bow, cy = my + dx * bow;
  for (let t = 0; t <= 1.0001; t += 1 / 24) {
    const u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * cx + t * t * b[0], u * u * a[1] + 2 * u * t * cy + t * t * b[1]]);
  }
  return out;
}

// ------------------------------------------------------------------ legs ----
const coordOf = (name) => {
  if (PLACE.has(name)) return PLACE.get(name);
  const extra = EXTRA_PLACES.find((e) => e.name === name);
  if (extra) return [extra.lon, extra.lat];
  if (name === "Salmone") return SALMONE;
  throw new Error(`unknown place in a leg: ${name}`);
};

// Cape Salmone is the north-east corner of Crete, and Acts steers by it. Rather
// than guess a coordinate, take the easternmost point of Crete's own outline.
const SALMONE = (() => {
  const crete = outlines
    .filter((r) => r.some(([lon, lat]) => lon > 23 && lon < 27 && lat > 34.5 && lat < 36))
    .sort((a, b) => b.length - a.length)[0];
  let best = crete[0];
  for (const p of crete) if (p[0] > best[0]) best = p;
  return [Number(best[0].toFixed(3)), Number(best[1].toFixed(3))];
})();
log(`[${stamp()}] Salmone taken from the coastline: ${SALMONE.join(", ")}`);

const routeOut = [];
const notes = [];
for (const leg of LEGS) {
  const a = coordOf(leg.from), b = coordOf(leg.to);
  const straight = km(a, b);
  const entry = {
    id: leg.id, from: leg.from, to: leg.to, mode: leg.mode,
    evidence: leg.evidence, kind: leg.kind ?? null, note: leg.note ?? ""
  };

  if (leg.mode === "sea") {
    const r = seaRoute(a, b, leg.via ?? []);
    if (!r) {
      notes.push(`${leg.id}: no sea route found, drew an arc`);
      entry.points = round(arc(a, b, 0.05));
      entry.drawn = "arc";
    } else {
      const pts = r.points.slice();
      // Both ends of a sea leg are drawn from the town to the water it used.
      pts.unshift(a);
      pts.push(b);
      entry.points = round(pts);
      entry.drawn = "sailed";
      entry.offshore = r.offshore.map((v) => Number(v.toFixed(1)));
      if (Math.max(...r.offshore) > 14) entry.portUnnamed = true;
    }
  } else {
    const r = roadRoute(a, b);
    const credible = r && r.length / straight < 1.75 && r.snap < 22 && r.longestJoin < 18;
    if (credible) {
      entry.points = round(simplify(r.points, 0.006));
      entry.drawn = "road";
    } else {
      entry.points = round(arc(a, b, 0.055));
      entry.drawn = "direct";
      notes.push(
        `${leg.id}: direct (${r ? `road ${r.length.toFixed(0)}km vs ${straight.toFixed(0)}km straight, ` +
          `snap ${r.snap.toFixed(0)}km, join ${r.longestJoin.toFixed(0)}km` : "no road route"})`
      );
    }
  }
  entry.km = Math.round(pathKm(entry.points));
  entry.straightKm = Math.round(straight);
  routeOut.push(entry);
}
log(`[${stamp()}] ${routeOut.length} legs; ` +
  `${routeOut.filter((l) => l.drawn === "road").length} on mapped roads, ` +
  `${routeOut.filter((l) => l.drawn === "direct").length} drawn direct, ` +
  `${routeOut.filter((l) => l.drawn === "sailed").length} sailed`);
for (const n of notes) log(`    - ${n}`);

// ---------------------------------------------------------------- labels ----
// The label file is a grab bag of 1834 features: tribes, mountains, islets. Pull
// out the seas and the districts a reader of Acts actually needs, and keep the
// title exactly as the source has it.
const WANT_LABELS = new Set([
  "Creta Ins.", "Cyprus (island)", "Melita/Malta (island)", "Rhodos Ins.", "Samos Ins.",
  "Chios Ins.", "Lesbos Ins.", "Cyclades Inss.", "Sporades Inss.", "Taurus M.", "Tauros M."
]);
const labelOut = [];
for (const f of regionLabels.features) {
  const title = f.properties.TITLE;
  if (!WANT_LABELS.has(title)) continue;
  const line = f.geometry.coordinates[0];
  const mid = line[Math.floor(line.length / 2)];
  if (mid[0] < LON0 || mid[0] > LON1 || mid[1] < LAT0 || mid[1] > LAT1) continue;
  labelOut.push({ text: title.split("/")[0].replace(/ Ins+\.$/, ""), lon: +mid[0].toFixed(3), lat: +mid[1].toFixed(3), kind: "island" });
}

// ----------------------------------------------------------------- roads ----
// Kept for texture under everything else: this is the network the journeys
// actually used, and a first-century map without it reads as empty country.
const roadOut = { major: [], minor: [] };
for (const f of roadsGeo.features) {
  const major = f.properties.Major_or_M === "1";
  for (const line of f.geometry.coordinates) {
    const s = simplify(line, 0.02);
    if (s.length >= 2) roadOut[major ? "major" : "minor"].push(round(s, 2));
  }
}
log(`[${stamp()}] roads: ${roadOut.major.length} major, ${roadOut.minor.length} minor lines`);

// ------------------------------------------------------------------ emit ----
mkdirSync(OUT, { recursive: true });
const header = (what) =>
  `// Generated by tools/build-geo.mjs from benchmarks/acts/mapdata. Do not edit.\n` +
  `// ${what}\n` +
  `(window.ACTS_ATLAS = window.ACTS_ATLAS || {}).`;

const write = (file, key, what, value) => {
  const body = `${header(what)}${key} =\n${JSON.stringify(value)};\n`;
  writeFileSync(join(OUT, file), body);
  log(`    ${file.padEnd(20)} ${(body.length / 1024).toFixed(0)} KB`);
};

write("data-land.js", "land", "Land outlines and enclosed water, traced from the ancient coastline.",
  { outlines, lakes });
write("data-provinces.js", "provinces", "Approximate province regions; see tools/provinces.mjs.",
  { provinces: provinceOut, districts: DISTRICTS });
write("data-routes.js", "routes", "One polyline per leg; see tools/legs.mjs for the sources.",
  { legs: routeOut, extraPlaces: [...EXTRA_PLACES, { name: "Salmone", lon: SALMONE[0], lat: SALMONE[1], approx: false, note: "Taken as the easternmost point of Crete in the bundled coastline." }], seaMarks: SEA_MARKS });
write("data-labels.js", "labels", "Ancient names lifted from region-labels.geojson.",
  { islands: labelOut });
write("data-roads.js", "roads", "The Roman road network, simplified for drawing.", roadOut);

log(`[${stamp()}] done`);
