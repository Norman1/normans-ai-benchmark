// The map: a Mercator projection, a canvas, and the drawing order that makes an
// ancient map legible — water, land, provinces, roads, then the journeys on top.
//
// Everything is drawn from data. The page ships no image files; even the
// parchment is generated in code at start-up.

(function (ATLAS) {
  "use strict";

  // ------------------------------------------------------------ projection --
  const RAD = Math.PI / 180;
  // In degree units, so that x and y share one scale: zoom is pixels per degree
  // of longitude, and a degree of latitude is correspondingly taller.
  const mercY = (lat) =>
    Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * RAD) / 2)) / RAD;
  const mercLat = (y) => (2 * Math.atan(Math.exp(y * RAD)) - Math.PI / 2) / RAD;

  function makeView() {
    return {
      lon: 26.5, lat: 37.0, zoom: 22,   // zoom is pixels per degree of longitude
      w: 800, h: 600,
      x(lon) { return this.w / 2 + (lon - this.lon) * this.zoom; },
      y(lat) { return this.h / 2 - (mercY(lat) - mercY(this.lat)) * this.zoom; },
      lonAt(px) { return this.lon + (px - this.w / 2) / this.zoom; },
      latAt(py) { return mercLat(mercY(this.lat) - (py - this.h / 2) / this.zoom); },
      span() { return this.w / this.zoom; },   // degrees of longitude in view
      bounds() {
        return {
          w: this.lonAt(-60), e: this.lonAt(this.w + 60),
          s: this.latAt(this.h + 60), n: this.latAt(-60)
        };
      }
    };
  }

  function boxOf(points) {
    let w = Infinity, e = -Infinity, s = Infinity, n = -Infinity;
    for (const p of points) {
      if (p[0] < w) w = p[0];
      if (p[0] > e) e = p[0];
      if (p[1] < s) s = p[1];
      if (p[1] > n) n = p[1];
    }
    return { w, e, s, n };
  }

  function growBox(box, other) {
    return {
      w: Math.min(box.w, other.w), e: Math.max(box.e, other.e),
      s: Math.min(box.s, other.s), n: Math.max(box.n, other.n)
    };
  }

  /**
   * Centre and zoom that fit a lon/lat box.
   *
   * A minimum span matters here: a scene that happens in one town would
   * otherwise zoom to the street, and the whole point of the map is the country
   * around the place.
   */
  function fitTo(view, box, padPx) {
    const pad = padPx == null ? 100 : padPx;
    const dx = Math.max(3.2, box.e - box.w);
    const dy = Math.max(2.4, Math.abs(mercY(box.n) - mercY(box.s)));
    return {
      lon: (box.w + box.e) / 2,
      lat: (box.n + box.s) / 2,
      zoom: Math.max(8, Math.min(150,
        Math.min((view.w - pad * 2) / dx, (view.h - pad * 2) / dy)))
    };
  }

  // ------------------------------------------------------------- parchment --
  function makeParchment(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, w);
    c.height = Math.max(1, h);
    const g = c.getContext("2d");
    g.fillStyle = "#efe3c9";
    g.fillRect(0, 0, c.width, c.height);
    const img = g.getImageData(0, 0, c.width, c.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 16;
      d[i] += n;
      d[i + 1] += n * 0.88;
      d[i + 2] += n * 0.7;
    }
    g.putImageData(img, 0, 0);
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * c.width, y = Math.random() * c.height;
      const r = 60 + Math.random() * 280;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      const a = 0.018 + Math.random() * 0.032;
      grad.addColorStop(0, `rgba(148,112,62,${a})`);
      grad.addColorStop(1, "rgba(148,112,62,0)");
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    return c;
  }

  // --------------------------------------------------------------- palette --
  const C = {
    sea: "#b7c9cc",
    lake: "#a6babe",
    land: "#efe3c9",
    coast: "#6d5b43",
    roadMinor: "#c0a985",
    roadMajor: "#ab8f68",
    ink: "#463726",
    live: "#a3301c",
    liveSoft: "#8e2a18",
    past: "#8a745a",
    refused: "#87763f",
    halo: "rgba(239,227,201,0.92)"
  };

  // Province washes: distinct enough to separate, muted enough that the
  // journeys stay the loudest thing on the map.
  const TONES = [
    "#c2704f", "#7d8f4e", "#8a6ea8", "#4e8b8f", "#b08a3d", "#9c5570",
    "#5f7fb0", "#7a9c5a", "#a86a4a", "#6d6fa0", "#a89040", "#59907c",
    "#96604f", "#8d8a4c", "#6a86a4", "#a1704f", "#7f9a63", "#9b6a86",
    "#7c7c7c"
  ];

  // The window the bundled reference data was clipped to.
  const DATA = { w: 5, e: 45, s: 26, n: 48 };

  const boxHits = (bb, b) => !(bb.e < b.w || bb.w > b.e || bb.n < b.s || bb.s > b.n);
  const cacheBoxes = (list) => list.map((pts) => ({ pts, bb: boxOf(pts) }));

  // ---------------------------------------------------------------- labels --
  function makeLabeller(g) {
    const placed = [];
    return {
      reset() { placed.length = 0; },
      put(text, x, y, opts) {
        const o = opts || {};
        g.font = o.font || "13px Georgia, 'Times New Roman', serif";
        const w = g.measureText(text).width;
        const h = o.size || 13;
        const box = { x: x - w / 2 - 3, y: y - h / 2 - 2, w: w + 6, h: h + 4 };
        if (!o.force) {
          for (const p of placed)
            if (!(box.x + box.w < p.x || box.x > p.x + p.w ||
                  box.y + box.h < p.y || box.y > p.y + p.h)) return false;
        }
        placed.push(box);
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.lineJoin = "round";
        g.lineWidth = o.haloWidth || 3.5;
        g.strokeStyle = o.halo || C.halo;
        g.strokeText(text, x, y);
        g.fillStyle = o.color || C.ink;
        g.fillText(text, x, y);
        return true;
      }
    };
  }

  const spaced = (s) => s.split("").join(" ");

  // ----------------------------------------------------------------- Atlas --
  ATLAS.createMap = function (canvas, data) {
    const g = canvas.getContext("2d");
    const view = makeView();
    const labeller = makeLabeller(g);
    let parchment = null;
    let dpr = 1;

    const landBoxes = cacheBoxes(data.land.outlines);
    const lakeBoxes = cacheBoxes(data.land.lakes);
    const roadMajor = cacheBoxes(data.roads.major);
    const roadMinor = cacheBoxes(data.roads.minor);
    const legBoxes = new Map();
    for (const leg of data.routes.legs) legBoxes.set(leg.id, boxOf(leg.points));
    const legById = new Map(data.routes.legs.map((l) => [l.id, l]));

    const provinceParts = data.provinces.provinces.map((p) => ({
      p,
      rings: p.rings.map((r) => ({ pts: r, bb: boxOf(r) })),
      label: p.rings.length ? centreOf(p.rings[0]) : null
    }));

    // Rough visual centre: the widest horizontal span of the ring, which keeps
    // a name like MACEDONIA off the sea better than a bounding-box middle.
    function centreOf(ring) {
      const b = boxOf(ring);
      const midLat = (b.s + b.n) / 2;
      let best = null, bestW = -1;
      for (let step = -2; step <= 2; step++) {
        const lat = midLat + step * (b.n - b.s) / 8;
        const xs = [];
        for (let i = 1; i < ring.length; i++) {
          const a = ring[i - 1], c = ring[i];
          if ((a[1] - lat) * (c[1] - lat) > 0) continue;
          const t = (lat - a[1]) / ((c[1] - a[1]) || 1e-9);
          xs.push(a[0] + t * (c[0] - a[0]));
        }
        xs.sort((m, n) => m - n);
        for (let i = 0; i + 1 < xs.length; i += 2) {
          const wdt = xs[i + 1] - xs[i];
          if (wdt > bestW) { bestW = wdt; best = [(xs[i] + xs[i + 1]) / 2, lat]; }
        }
      }
      return best || [(b.w + b.e) / 2, midLat];
    }

    let herodRings = null;
    function getHerodRings() {
      if (!herodRings) {
        herodRings = [];
        const fc = data.herod;
        if (fc && fc.features)
          for (const f of fc.features)
            for (const ring of f.geometry.coordinates) herodRings.push(ring);
      }
      return herodRings;
    }

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      view.w = Math.max(200, Math.round(rect.width));
      view.h = Math.max(200, Math.round(rect.height));
      canvas.width = Math.round(view.w * dpr);
      canvas.height = Math.round(view.h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      parchment = makeParchment(view.w, view.h);
    }

    function trace(pts) {
      let started = false;
      let lx = NaN, ly = NaN;
      const last = pts.length - 1;
      for (let i = 0; i <= last; i++) {
        const x = view.x(pts[i][0]);
        const y = view.y(pts[i][1]);
        if (started && i !== last && Math.abs(x - lx) < 0.6 && Math.abs(y - ly) < 0.6) continue;
        if (started) g.lineTo(x, y); else { g.moveTo(x, y); started = true; }
        lx = x; ly = y;
      }
      return started;
    }

    // ------------------------------------------------------------ drawing --
    function draw(state) {
      const b = view.bounds();
      g.setTransform(dpr, 0, 0, dpr, 0, 0);

      g.fillStyle = C.sea;
      g.fillRect(0, 0, view.w, view.h);

      // The land, as one path. Building it once lets it serve three purposes:
      // the shore band that bleeds into the water, the fill, and the clip that
      // keeps the paper grain off the sea.
      g.beginPath();
      for (const l of landBoxes) if (boxHits(l.bb, b)) { trace(l.pts); g.closePath(); }

      g.save();
      g.strokeStyle = "rgba(255,255,255,0.34)";
      g.lineWidth = Math.max(6, Math.min(26, view.zoom * 0.35));
      g.lineJoin = "round";
      g.stroke();
      g.restore();

      g.fillStyle = C.land;
      g.fill();

      if (parchment) {
        g.save();
        g.clip();
        g.globalAlpha = 0.92;
        g.drawImage(parchment, 0, 0);
        g.restore();
      }

      g.fillStyle = C.lake;
      g.beginPath();
      for (const l of lakeBoxes) if (boxHits(l.bb, b)) { trace(l.pts); g.closePath(); }
      g.fill();

      if (state.layers.provinces) drawProvinces(b, state);
      if (state.layers.roads) drawRoads(b);
      drawCoast(b);
      if (state.layers.herod) drawHerod(b);
      if (state.layers.spread) drawSpread(b, state);

      drawRoutes(b, state);
      if (state.showNations) drawNationArcs();

      labeller.reset();
      drawPlaces(b, state);
      if (state.showNations) drawNationLabels();
      if (state.layers.labels) drawNames(b, state);
      drawFrame();
      drawScaleBar();
    }

    function drawProvinces(b, state) {
      g.save();
      for (const part of provinceParts) {
        const active = state.activeProvinces.has(part.p.id);
        const tone = TONES[part.p.tone % TONES.length];
        g.beginPath();
        let any = false;
        for (const r of part.rings) if (boxHits(r.bb, b)) { trace(r.pts); g.closePath(); any = true; }
        if (!any) continue;
        g.globalAlpha = part.p.outside ? 0.12 : active ? 0.44 : 0.23;
        g.fillStyle = tone;
        g.fill();
        g.globalAlpha = part.p.outside ? 0.22 : active ? 0.7 : 0.42;
        g.lineWidth = active ? 1.8 : 1;
        g.strokeStyle = tone;
        g.stroke();
      }
      g.restore();
    }

    function drawRoads(b) {
      const span = view.span();
      g.save();
      g.lineCap = "round";
      if (span < 26) {
        g.strokeStyle = C.roadMinor;
        g.globalAlpha = 0.55;
        g.lineWidth = 0.7;
        g.beginPath();
        for (const r of roadMinor) if (boxHits(r.bb, b)) trace(r.pts);
        g.stroke();
      }
      g.strokeStyle = C.roadMajor;
      g.globalAlpha = span < 26 ? 0.7 : 0.45;
      g.lineWidth = span < 12 ? 1.2 : 0.85;
      g.beginPath();
      for (const r of roadMajor) if (boxHits(r.bb, b)) trace(r.pts);
      g.stroke();
      g.restore();
    }

    function drawCoast(b) {
      g.save();
      g.strokeStyle = C.coast;
      g.globalAlpha = 0.78;
      g.lineWidth = view.span() < 10 ? 1.4 : 1;
      g.lineJoin = "round";
      g.beginPath();
      for (const l of landBoxes) if (boxHits(l.bb, b)) { trace(l.pts); g.closePath(); }
      for (const l of lakeBoxes) if (boxHits(l.bb, b)) { trace(l.pts); g.closePath(); }
      g.stroke();
      g.restore();
    }

    function drawHerod(b) {
      const rings = getHerodRings();
      if (!rings.length) return;
      g.save();
      g.beginPath();
      for (const ring of rings) { trace(ring); g.closePath(); }
      g.globalAlpha = 0.2;
      g.fillStyle = "#8a5a2a";
      g.fill();
      g.globalAlpha = 0.85;
      g.lineWidth = 1.6;
      g.setLineDash([6, 4]);
      g.strokeStyle = "#7a4a1e";
      g.stroke();
      g.restore();
    }

    // ------------------------------------------------------------- routes --
    function drawRoutes(b, state) {
      const paint = (ids, live) => {
        for (const id of ids) {
          const leg = legById.get(id);
          if (!leg || !boxHits(legBoxes.get(id), b)) continue;
          const attempted = leg.kind === "attempted";
          g.save();
          g.lineCap = "round";
          g.lineJoin = "round";

          if (live && !attempted) {
            g.strokeStyle = "rgba(243,234,213,0.8)";
            g.lineWidth = 7;
            g.setLineDash([]);
            g.beginPath();
            trace(leg.points);
            g.stroke();
          }

          g.globalAlpha = live ? 1 : 0.58;
          g.strokeStyle = live ? (attempted ? C.refused : C.live) : C.past;
          g.lineWidth = live ? (attempted ? 2.2 : 3.2) : 2;
          if (attempted) g.setLineDash([3, 6]);
          else if (leg.kind === "drift") g.setLineDash([1.5, 5]);
          else if (leg.kind === "onfoot") g.setLineDash([10, 4, 2, 4]);
          else if (leg.mode === "sea") g.setLineDash(live ? [10, 6] : [6, 5]);
          else g.setLineDash([]);
          g.beginPath();
          trace(leg.points);
          g.stroke();

          if (attempted && live) drawStopBar(leg);
          g.restore();
        }
      };
      paint(state.doneLegs, false);
      paint(state.liveLegs, true);
      if (state.marker) drawMarker(state.marker);
    }

    // A stop bar at the far end of a refused direction, so the map says "not
    // this way" rather than "they went here".
    function drawStopBar(leg) {
      const pts = leg.points;
      const a = pts[pts.length - 2], c = pts[pts.length - 1];
      const x1 = view.x(c[0]), y1 = view.y(c[1]);
      const ang = Math.atan2(y1 - view.y(a[1]), x1 - view.x(a[0]));
      g.save();
      g.setLineDash([]);
      g.translate(x1, y1);
      g.rotate(ang);
      g.strokeStyle = "#8a5a3a";
      g.lineWidth = 2.6;
      g.lineCap = "butt";
      g.beginPath();
      g.moveTo(-1, -9); g.lineTo(-1, 9);
      g.moveTo(-7, -6); g.lineTo(-7, 6);
      g.stroke();
      g.restore();
    }

    function drawMarker(m) {
      const x = view.x(m.lon), y = view.y(m.lat);
      g.save();
      g.beginPath();
      g.arc(x, y, 9, 0, Math.PI * 2);
      g.fillStyle = "rgba(163,48,28,0.18)";
      g.fill();
      g.beginPath();
      g.arc(x, y, 4.2, 0, Math.PI * 2);
      g.fillStyle = C.live;
      g.fill();
      g.lineWidth = 1.6;
      g.strokeStyle = "#f4ecd8";
      g.stroke();
      g.restore();
    }

    // ------------------------------------------------------------- spread --
    // Where the message has got to, at this point in the book and no further.
    // Towns get rings; a region Acts describes only in the plural — Phoenicia,
    // Cyprus, the Judaean countryside — gets shaded instead of given a pin it
    // does not have.
    function drawSpread(b, state) {
      g.save();
      for (const id of state.spreadRegions) {
        const part = provinceParts.find((e) => e.p.id === id);
        if (!part) continue;
        g.beginPath();
        let any = false;
        for (const r of part.rings) if (boxHits(r.bb, b)) { trace(r.pts); g.closePath(); any = true; }
        if (!any) continue;
        g.globalAlpha = 0.12;
        g.fillStyle = C.live;
        g.fill();
        g.globalAlpha = 0.55;
        g.setLineDash([7, 5]);
        g.lineWidth = 1.6;
        g.strokeStyle = C.live;
        g.stroke();
        g.setLineDash([]);
      }
      for (const name of state.spreadPlaces) {
        const p = data.byName[name];
        if (!p || p.lon < b.w || p.lon > b.e || p.lat < b.s || p.lat > b.n) continue;
        const x = view.x(p.lon), y = view.y(p.lat);
        const grad = g.createRadialGradient(x, y, 2, x, y, 22);
        grad.addColorStop(0, "rgba(176,58,34,0.5)");
        grad.addColorStop(0.55, "rgba(176,58,34,0.16)");
        grad.addColorStop(1, "rgba(176,58,34,0)");
        g.globalAlpha = 1;
        g.fillStyle = grad;
        g.beginPath();
        g.arc(x, y, 22, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 0.75;
        g.lineWidth = 1.3;
        g.strokeStyle = "rgba(140,40,22,0.8)";
        for (const r of [8.5, 15]) {
          g.beginPath();
          g.arc(x, y, r, 0, Math.PI * 2);
          g.stroke();
        }
      }
      g.restore();
    }

    // The Pentecost list, including the three homelands beyond the map's east
    // edge, which get an arrow rather than being moved somewhere they are not.
    const nationAt = (n) =>
      [n.offMap ? Math.min(view.w - 62, view.x(DATA.e) - 14) : view.x(n.lon), view.y(n.lat)];

    function drawNationArcs() {
      const home = data.byName["Jerusalem"];
      if (!home) return;
      const hx = view.x(home.lon), hy = view.y(home.lat);
      g.save();
      g.strokeStyle = "#7a5a2a";
      g.globalAlpha = 0.62;
      g.lineWidth = 1.3;
      g.setLineDash([4, 4]);
      for (const n of ATLAS.pentecost) {
        const [x, y] = nationAt(n);
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo((x + hx) / 2, (y + hy) / 2 - Math.abs(x - hx) * 0.14, hx, hy);
        g.stroke();
      }
      g.setLineDash([]);
      g.globalAlpha = 1;
      for (const n of ATLAS.pentecost) {
        const [x, y] = nationAt(n);
        g.beginPath();
        g.arc(x, y, 3.2, 0, Math.PI * 2);
        g.fillStyle = "#7a5a2a";
        g.fill();
      }
      g.restore();
    }

    // Placed after the towns, and yielding to them: at Pentecost the label that
    // matters most is Jerusalem, and it should not be pushed off by a homeland
    // whose dot happens to land on top of it.
    function drawNationLabels() {
      for (const n of ATLAS.pentecost) {
        const [x, y] = nationAt(n);
        labeller.put(n.name + (n.offMap ? " →" : ""), x, y - 12, {
          font: "600 12px Georgia, serif", color: "#6b4a20", size: 12
        });
      }
    }

    // ------------------------------------------------------------- places --
    function drawPlaces(b, state) {
      const span = view.span();
      const shown = [];
      for (const p of data.placeList) {
        if (p.lon < b.w || p.lon > b.e || p.lat < b.s || p.lat > b.n) continue;
        const rank = state.atNames.has(p.name) ? 0 : state.visited.has(p.name) ? 1 : 2;
        // A region already has its name written across the country it covers.
        // Only pin one when the story is pointing at it.
        if (p.kind === "region" && rank !== 0) continue;
        if (rank === 2 && (span > 30 || (span > 16 && !p.major))) continue;
        shown.push({ p, rank });
      }
      shown.sort((a, c) => a.rank - c.rank);

      for (const { p, rank } of shown) {
        const x = view.x(p.lon), y = view.y(p.lat);
        g.save();
        if (rank === 0) {
          g.beginPath();
          g.arc(x, y, 10, 0, Math.PI * 2);
          g.fillStyle = "rgba(163,48,28,0.15)";
          g.fill();
        }
        g.beginPath();
        if (p.kind === "region") {
          const r = 3.4;
          g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y);
          g.closePath();
        } else {
          g.arc(x, y, rank === 0 ? 4.6 : rank === 1 ? 3.4 : 2.4, 0, Math.PI * 2);
        }
        g.fillStyle = rank === 0 ? C.live : rank === 1 ? "#5d4a33" : "#8b7a5f";
        g.fill();
        g.lineWidth = 1.2;
        g.strokeStyle = "rgba(244,236,216,0.9)";
        g.stroke();
        g.restore();
      }

      // Drawn in rank order, so where two names land on top of each other — the
      // Mount of Olives sits within a kilometre of Jerusalem — the one the story
      // is about wins and the other is dropped rather than overprinted.
      for (const { p, rank } of shown) {
        if (rank === 2 && span > 11) continue;
        labeller.put(p.name, view.x(p.lon), view.y(p.lat) - (rank === 0 ? 16 : 11), {
          font: rank === 0
            ? "600 14.5px Georgia, 'Times New Roman', serif"
            : "12.5px Georgia, 'Times New Roman', serif",
          color: rank === 0 ? C.liveSoft : C.ink,
          size: rank === 0 ? 14.5 : 12.5
        });
      }
    }

    function drawNames(b, state) {
      const span = view.span();
      for (const part of provinceParts) {
        if (!part.label) continue;
        const [lon, lat] = part.label;
        if (lon < b.w || lon > b.e || lat < b.s || lat > b.n) continue;
        const active = state.activeProvinces.has(part.p.id);
        labeller.put(spaced(part.p.name), view.x(lon), view.y(lat), {
          font: `${span < 16 ? "15px" : "13px"} Georgia, 'Times New Roman', serif`,
          color: active ? "#7c3a1c" : "rgba(92,71,45,0.8)",
          size: 15, halo: "rgba(239,227,201,0.5)", haloWidth: 4
        });
      }
      if (span < 26)
        for (const d of data.provinces.districts) {
          if (d.lon < b.w || d.lon > b.e || d.lat < b.s || d.lat > b.n) continue;
          labeller.put(d.name, view.x(d.lon), view.y(d.lat), {
            font: "italic 12px Georgia, 'Times New Roman', serif",
            color: "rgba(104,82,54,0.78)", size: 12, halo: "rgba(239,227,201,0.45)", haloWidth: 3
          });
        }
      for (const s of data.routes.seaMarks) {
        if (s.lon < b.w || s.lon > b.e || s.lat < b.s || s.lat > b.n) continue;
        labeller.put(spaced(s.name.toUpperCase()), view.x(s.lon), view.y(s.lat), {
          font: `${span < 18 ? "12.5px" : "11px"} Georgia, 'Times New Roman', serif`,
          color: s.kind === "hazard" ? "rgba(146,72,40,0.9)" : "rgba(72,100,108,0.85)",
          size: 12.5, halo: "rgba(183,201,204,0.5)", haloWidth: 4
        });
      }
      if (span < 20)
        for (const l of data.labels.islands) {
          if (l.lon < b.w || l.lon > b.e || l.lat < b.s || l.lat > b.n) continue;
          labeller.put(l.text, view.x(l.lon), view.y(l.lat), {
            font: "italic 11.5px Georgia, 'Times New Roman', serif",
            color: "rgba(104,82,54,0.72)", size: 11.5
          });
        }
    }

    // The reference data covers one rectangle of the world and stops. Rather
    // than let empty sea run off to the horizon, the plate has an edge.
    function drawFrame() {
      const x0 = view.x(DATA.w), x1 = view.x(DATA.e);
      const y0 = view.y(DATA.n), y1 = view.y(DATA.s);
      g.save();
      g.fillStyle = "#e3d8bc";
      if (y0 > 0) g.fillRect(0, 0, view.w, y0);
      if (y1 < view.h) g.fillRect(0, y1, view.w, view.h - y1);
      if (x0 > 0) g.fillRect(0, 0, x0, view.h);
      if (x1 < view.w) g.fillRect(x1, 0, view.w - x1, view.h);
      g.strokeStyle = "rgba(84,66,44,0.5)";
      g.lineWidth = 1.4;
      g.setLineDash([]);
      g.strokeRect(x0, y0, x1 - x0, y1 - y0);
      g.restore();
    }

    function drawScaleBar() {
      const kmPerPx = (111.32 * Math.cos(view.lat * RAD)) / view.zoom;
      let pick = 1000;
      for (const t of [25, 50, 100, 200, 500, 1000]) if (t / kmPerPx < 160) pick = t;
      const px = pick / kmPerPx;
      const x0 = 20, y0 = view.h - 22;
      g.save();
      g.strokeStyle = "rgba(70,55,38,0.75)";
      g.fillStyle = "rgba(70,55,38,0.85)";
      g.lineWidth = 1.3;
      g.setLineDash([]);
      g.beginPath();
      g.moveTo(x0, y0 - 5); g.lineTo(x0, y0); g.lineTo(x0 + px, y0); g.lineTo(x0 + px, y0 - 5);
      g.stroke();
      g.font = "11px Georgia, serif";
      g.textAlign = "left";
      g.textBaseline = "bottom";
      g.fillText(`${pick} km`, x0, y0 - 7);
      g.restore();
    }

    // ------------------------------------------------------------- picking --
    function pick(px, py) {
      let best = null, bestD = 20;
      for (const p of data.placeList) {
        const d = Math.hypot(view.x(p.lon) - px, view.y(p.lat) - py);
        if (d < bestD) { bestD = d; best = p; }
      }
      return best;
    }

    return {
      view, resize, draw, pick,
      fit: (box, pad) => fitTo(view, box, pad),
      boxOf, growBox
    };
  };

  ATLAS.geo = { mercY, mercLat, boxOf, growBox, fitTo };
})(window.ACTS_ATLAS = window.ACTS_ATLAS || {});
