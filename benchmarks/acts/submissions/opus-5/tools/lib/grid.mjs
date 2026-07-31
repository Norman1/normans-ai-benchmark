// A raster over the world of Acts, and the handful of operations the map needs
// from it: burn lines into it, flood a region, trace a region's outline.
//
// Everything downstream — the land outline, the province regions, the sea
// tracks the ships follow — comes out of this one grid. Working in cells is
// what makes those three problems the same problem.

export const LON0 = 5, LAT0 = 26, LON1 = 45, LAT1 = 48;

export function makeGrid(step) {
  const W = Math.round((LON1 - LON0) / step);
  const H = Math.round((LAT1 - LAT0) / step);
  return {
    step, W, H, n: W * H,
    gx: (lon) => (lon - LON0) / step,
    gy: (lat) => (LAT1 - lat) / step,
    lonAt: (x) => LON0 + x * step,
    latAt: (y) => LAT1 - y * step,
    at(lon, lat) {
      const x = Math.round((lon - LON0) / step);
      const y = Math.round((LAT1 - lat) / step);
      if (x < 0 || x >= W || y < 0 || y >= H) return -1;
      return y * W + x;
    }
  };
}

/** Burn every segment of a GeoJSON MultiLineString set into `mask` as `flag`. */
export function burnLines(grid, features, mask, flag) {
  const { W, H, gx, gy } = grid;
  for (const f of features) {
    const parts = f.geometry.type === "MultiLineString"
      ? f.geometry.coordinates
      : f.geometry.type === "Polygon" ? f.geometry.coordinates : [f.geometry.coordinates];
    for (const line of parts) {
      for (let i = 1; i < line.length; i++) {
        const x0 = gx(line[i - 1][0]), y0 = gy(line[i - 1][1]);
        const x1 = gx(line[i][0]), y1 = gy(line[i][1]);
        // Two samples per cell: a line may never skip a cell, or the flood
        // leaks through the gap and a province quietly swallows a continent.
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2));
        for (let s = 0; s <= n; s++) {
          const x = Math.round(x0 + ((x1 - x0) * s) / n);
          const y = Math.round(y0 + ((y1 - y0) * s) / n);
          if (x >= 0 && x < W && y >= 0 && y < H) mask[y * W + x] |= flag;
        }
      }
    }
  }
}

/** 4-connected flood from `seed` across cells where `blocked(p)` is false. */
export function flood(grid, seed, blocked, out, mark, cap = Infinity) {
  const { W, H, n } = grid;
  if (seed < 0 || blocked(seed) || out[seed]) return { ok: false, n: 0 };
  const q = new Int32Array(n);
  let head = 0, tail = 0, count = 0;
  q[tail++] = seed;
  out[seed] = mark;
  while (head < tail) {
    const p = q[head++];
    if (++count > cap) return { ok: false, n: count, overflow: true };
    const x = p % W, y = (p / W) | 0;
    if (x > 0) push(p - 1);
    if (x < W - 1) push(p + 1);
    if (y > 0) push(p - W);
    if (y < H - 1) push(p + W);
  }
  function push(p) {
    if (out[p] || blocked(p)) return;
    out[p] = mark;
    q[tail++] = p;
  }
  return { ok: true, n: count };
}

/**
 * Trace the outline of every connected patch where `member(p)` holds.
 *
 * Every edge between a member cell and a non-member neighbour is emitted as a
 * directed segment, oriented consistently around the patch; chaining those
 * segments head-to-tail yields closed rings. Outer rings come out with negative
 * signed area and holes with positive, so the caller can tell them apart.
 *
 * Rings are in grid-corner coordinates; convert with `ringToLonLat`.
 */
export function traceRegion(grid, member) {
  const { W, H } = grid;
  const isMember = (x, y) => x >= 0 && x < W && y >= 0 && y < H && member(y * W + x);
  const V = W + 1;
  const vid = (x, y) => y * V + x;

  // start vertex -> list of end vertices
  const out = new Map();
  const addEdge = (ax, ay, bx, by) => {
    const a = vid(ax, ay);
    const list = out.get(a);
    if (list) list.push(vid(bx, by));
    else out.set(a, [vid(bx, by)]);
  };

  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!isMember(x, y)) continue;
      if (!isMember(x, y - 1)) addEdge(x + 1, y, x, y);         // top,    -x
      if (!isMember(x - 1, y)) addEdge(x, y, x, y + 1);         // left,   +y
      if (!isMember(x, y + 1)) addEdge(x, y + 1, x + 1, y + 1); // bottom, +x
      if (!isMember(x + 1, y)) addEdge(x + 1, y + 1, x + 1, y); // right,  -y
    }

  const rings = [];
  for (const [start] of out) {
    while (out.get(start)?.length) {
      const ring = [];
      let cur = start;
      let prev = -1;
      for (;;) {
        const options = out.get(cur);
        if (!options || !options.length) break;
        const next = options.length === 1 ? options.pop() : takeSharpest(options, prev, cur);
        if (!out.get(cur).length) out.delete(cur);
        ring.push([cur % V, (cur / V) | 0]);
        prev = cur;
        cur = next;
        if (cur === start) break;
      }
      if (ring.length >= 4) {
        ring.push([start % V, (start / V) | 0]);
        rings.push(ring);
      }
    }
  }
  return rings;

  // Where two patches touch at a corner, four edges meet at one vertex. Taking
  // the sharpest available turn keeps each ring simple instead of stitching the
  // two patches into a figure-eight.
  function takeSharpest(options, prev, cur) {
    const dir = (a, b) => [(b % V) - (a % V), ((b / V) | 0) - ((a / V) | 0)];
    const [ix, iy] = prev < 0 ? [1, 0] : dir(prev, cur);
    let best = 0, bestScore = Infinity;
    options.forEach((next, i) => {
      const [ox, oy] = dir(cur, next);
      // cross < 0 is a right turn in screen coordinates; prefer the hardest one
      const cross = ix * oy - iy * ox;
      const dot = ix * ox + iy * oy;
      const score = Math.atan2(cross, dot);
      if (score < bestScore) { bestScore = score; best = i; }
    });
    return options.splice(best, 1)[0];
  }
}

export function ringToLonLat(grid, ring) {
  const { step } = grid;
  return ring.map(([x, y]) => [LON0 + x * step, LAT1 - y * step]);
}

export function signedArea(ring) {
  let a = 0;
  for (let i = 1; i < ring.length; i++) a += ring[i - 1][0] * ring[i][1] - ring[i][0] * ring[i - 1][1];
  return a / 2;
}

/** Douglas-Peucker, in degrees. */
export function simplify(points, tol) {
  if (points.length < 3) return points.slice();
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let far = -1, maxD = tol;
    const [ax, ay] = points[a], [bx, by] = points[b];
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy);
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i];
      const d = len === 0
        ? Math.hypot(px - ax, py - ay)
        : Math.abs(dy * px - dx * py + bx * ay - by * ax) / len;
      if (d > maxD) { maxD = d; far = i; }
    }
    if (far > 0) {
      keep[far] = 1;
      stack.push([a, far], [far, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/**
 * Chaikin corner-cutting: turns a staircase into something drawn by hand.
 *
 * A closed ring is expected to repeat its first point at the end, so in both
 * cases the segments are simply every consecutive pair.
 */
export function smooth(points, passes = 2, closed = true) {
  let pts = points;
  for (let k = 0; k < passes; k++) {
    if (pts.length < 3) return pts.slice();
    const out = [];
    if (!closed) out.push(pts[0]);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    if (closed) out.push(out[0]);
    else out.push(pts[pts.length - 1]);
    pts = out;
  }
  return pts;
}

const R = 6371;
const rad = (d) => (d * Math.PI) / 180;
export function km(a, b) {
  const dLat = rad(b[1] - a[1]);
  const dLon = rad(b[0] - a[0]) * Math.cos(rad((a[1] + b[1]) / 2));
  return Math.hypot(dLat, dLon) * R;
}
export function pathKm(points) {
  let t = 0;
  for (let i = 1; i < points.length; i++) t += km(points[i - 1], points[i]);
  return t;
}
export const round = (points, dp = 3) =>
  points.map(([a, b]) => [Number(a.toFixed(dp)), Number(b.toFixed(dp))]);
