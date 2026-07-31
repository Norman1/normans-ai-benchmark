// State, timeline, panels.
//
// One rule shapes most of this file: what you can do depends on where the
// slider is. The action bar under the story is rebuilt on every step, and at
// Pentecost it offers the homelands, inside a journey it offers to follow it,
// off Cauda it offers to show how the drift line was worked out.

(function (ATLAS) {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  function boot() {
    const missing = ["land", "provinces", "routes", "labels", "roads", "narrative", "places"]
      .filter((k) => !ATLAS[k]);
    if (missing.length) {
      document.body.innerHTML =
        `<p style="padding:2rem;font:16px Georgia,serif">Data failed to load: ${missing.join(", ")}.</p>`;
      return;
    }

    // ------------------------------------------------------------- places --
    const raw = (window.ACTS_MAPDATA && window.ACTS_MAPDATA.places
      && window.ACTS_MAPDATA.places.places) || [];
    // Places that name a stretch of country rather than a spot on it. The
    // gazetteer gives them a representative point, which is fine for a card and
    // wrong for a pin — the map draws these as regions instead, and only shows
    // a marker when the story is actually pointing at one.
    const AREAS = new Set(["Crete", "Cyprus"]);
    const byName = Object.create(null);
    const placeList = [];
    for (const p of raw) {
      const entry = {
        name: p.acts_name, lon: p.lon, lat: p.lat,
        kind: /region|province/.test(p.feature_types || "") || AREAS.has(p.acts_name)
          ? "region" : "place",
        pleiades: p.pleiades_id, uri: p.uri, blurb: p.description,
        title: p.pleiades_title
      };
      byName[entry.name] = entry;
      placeList.push(entry);
    }
    for (const x of ATLAS.routes.extraPlaces) {
      if (byName[x.name]) continue;
      const entry = { name: x.name, lon: x.lon, lat: x.lat, kind: "place", approx: x.approx, note: x.note };
      byName[entry.name] = entry;
      placeList.push(entry);
    }
    // Water Acts names — the Syrtis shoals, the Adria — are somewhere the map
    // can move to and something you can read about, but they are not stops, so
    // they get an entry without a pin.
    for (const s of ATLAS.routes.seaMarks) {
      if (byName[s.name]) continue;
      byName[s.name] = { name: s.name, lon: s.lon, lat: s.lat, kind: "water", note: s.note };
    }

    const narrative = ATLAS.narrative;
    const episodes = narrative.episodes;

    // A place is "major" if the book stops there; those keep their labels when
    // the whole Mediterranean is in view.
    const major = new Set();
    for (const e of episodes) for (const n of e.at || []) major.add(n);
    for (const leg of ATLAS.routes.legs) { major.add(leg.from); major.add(leg.to); }
    for (const p of placeList) p.major = major.has(p.name);

    // Which province each place falls in, so the map can lift the right region.
    const provinceOf = Object.create(null);
    for (const p of placeList) {
      for (const prov of ATLAS.provinces.provinces) {
        if (prov.rings.some((r) => pointInRing(p.lon, p.lat, r))) { provinceOf[p.name] = prov.id; break; }
      }
    }
    function pointInRing(x, y, ring) {
      let inside = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    }

    const legById = new Map(ATLAS.routes.legs.map((l) => [l.id, l]));

    // Cumulative state per episode, worked out once.
    const cumulative = [];
    {
      const visited = new Set();
      const legs = [];
      const spreadPlaces = new Set();
      const spreadRegions = new Set();
      const reachLog = [];
      for (let i = 0; i < episodes.length; i++) {
        const e = episodes[i];
        for (const n of e.at || []) visited.add(n);
        if (e.reach) {
          for (const n of e.reach.places || []) spreadPlaces.add(n);
          for (const r of e.reach.regions || []) spreadRegions.add(r);
          reachLog.push({ i, ...e.reach });
        }
        cumulative.push({
          visited: new Set(visited),
          doneLegs: legs.slice(),
          spreadPlaces: new Set(spreadPlaces),
          spreadRegions: new Set(spreadRegions),
          reachLog: reachLog.slice()
        });
        for (const id of e.legs || []) if (!legs.includes(id)) legs.push(id);
      }
    }

    // --------------------------------------------------------------- DOM --
    const canvas = $("#map");
    const map = ATLAS.createMap(canvas, {
      land: ATLAS.land, provinces: ATLAS.provinces, routes: ATLAS.routes,
      labels: ATLAS.labels, roads: ATLAS.roads,
      herod: (window.ACTS_MAPDATA || {}).herodsKingdom,
      byName, placeList
    });

    const state = {
      index: 0,
      layers: { provinces: true, roads: true, spread: false, labels: true, herod: false },
      showNations: false,
      atNames: new Set(),
      visited: new Set(),
      doneLegs: [],
      liveLegs: [],
      spreadPlaces: new Set(),
      spreadRegions: new Set(),
      activeProvinces: new Set(),
      marker: null,
      following: null
    };

    // ------------------------------------------------------------ camera --
    let anim = null;
    function flyTo(target, ms) {
      const from = { lon: map.view.lon, lat: map.view.lat, zoom: map.view.zoom };
      const t0 = performance.now();
      const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // A hidden tab gets no animation frames at all, so an eased flight would
      // freeze halfway and stay there. Jump instead.
      const dur = ms == null ? 750 : ms;
      if (dur <= 0 || reduce || document.hidden) {
        Object.assign(map.view, target);
        render();
        return;
      }
      anim = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        const k = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        map.view.lon = from.lon + (target.lon - from.lon) * k;
        map.view.lat = from.lat + (target.lat - from.lat) * k;
        map.view.zoom = Math.exp(Math.log(from.zoom) + (Math.log(target.zoom) - Math.log(from.zoom)) * k);
        if (t >= 1) anim = null;
      };
      kick();
    }

    let frame = null;
    function kick() {
      if (frame) return;
      frame = requestAnimationFrame(function step(now) {
        frame = null;
        if (anim) anim(now);
        if (follow) follow(now);
        render();
        if (anim || follow) kick();
      });
    }

    function render() { map.draw(state); }

    // ---------------------------------------------------------- episodes --
    function focusBox(e) {
      let box = null;
      for (const id of e.legs || []) {
        const leg = legById.get(id);
        if (!leg) continue;
        const b = map.boxOf(leg.points);
        box = box ? map.growBox(box, b) : b;
      }
      for (const n of e.at || []) {
        const p = byName[n];
        if (!p) continue;
        const b = { w: p.lon - 0.6, e: p.lon + 0.6, s: p.lat - 0.4, n: p.lat + 0.4 };
        box = box ? map.growBox(box, b) : b;
      }
      return box || { w: 12, e: 40, s: 30, n: 42 };
    }

    function setIndex(i, opts) {
      const o = opts || {};
      state.index = Math.max(0, Math.min(episodes.length - 1, i));
      const e = episodes[state.index];
      const cum = cumulative[state.index];
      state.atNames = new Set(e.at || []);
      state.visited = cum.visited;
      state.doneLegs = cum.doneLegs;
      state.liveLegs = (e.legs || []).slice();
      state.spreadPlaces = cum.spreadPlaces;
      state.spreadRegions = cum.spreadRegions;
      state.activeProvinces = new Set();
      for (const n of state.atNames) if (provinceOf[n]) state.activeProvinces.add(provinceOf[n]);
      // The homelands overlay only means anything at Pentecost, so it goes away
      // when you move on. Herod's kingdom is a layer the reader controls and is
      // left alone.
      state.showNations = false;
      state.marker = null;
      if (!o.keepView) flyTo(map.fit(focusBox(e), 110), o.instant ? 0 : 750);
      renderPanel();
      renderTimeline();
      render();
    }

    // ------------------------------------------------------------- panel --
    const panel = $("#story");
    const actionBar = $("#actions");
    const noteBox = $("#note");

    function renderPanel() {
      const e = episodes[state.index];
      const section = narrative.sections.find((s) => s.id === e.s);
      panel.innerHTML = "";

      const head = el("div", "story-head");
      head.append(el("div", "kicker", `${section ? section.title : ""} · ${e.ch}`));
      head.append(el("h2", null, e.title));
      panel.append(head);
      panel.append(el("p", "story-text", e.text));

      if ((e.at || []).length) {
        const row = el("div", "chips");
        row.append(el("span", "chips-label", "Places"));
        for (const n of e.at) {
          const b = el("button", "chip", n);
          b.addEventListener("click", () => openCard(n));
          row.append(b);
        }
        panel.append(row);
      }

      const legs = (e.legs || []).map((id) => legById.get(id)).filter(Boolean);
      if (legs.length) {
        const list = el("div", "legs");
        for (const leg of legs) list.append(legRow(leg));
        panel.append(list);
      }

      if (state.layers.spread) panel.append(spreadLog());

      renderActions(e);
      noteBox.hidden = true;
      noteBox.innerHTML = "";
    }

    // Every reach the book has reported so far, in the order it reported it —
    // which is the only honest way to build a spread overlay.
    function spreadLog() {
      const box = el("div", "spread-log");
      box.append(el("h5", null, "Reached, in order"));
      const log = cumulative[state.index].reachLog;
      if (!log.length) {
        box.append(el("p", "spread-empty", "Nothing yet — the book has not said so."));
        return box;
      }
      const list = el("ol", "spread-list");
      for (const r of log) {
        const names = [...(r.places || []),
          ...(r.regions || []).map((id) => regionName(id))].join(", ");
        const li = el("li");
        li.append(el("b", null, names));
        if (r.by) li.append(el("span", "by", ` — ${r.by}`));
        if (r.note) li.append(el("span", "why", r.note));
        list.append(li);
      }
      box.append(list);
      return box;
    }
    const regionName = (id) => {
      const p = ATLAS.provinces.provinces.find((x) => x.id === id);
      if (!p) return id;
      return p.name.charAt(0) + p.name.slice(1).toLowerCase();
    };

    function legRow(leg) {
      const row = el("button", "leg");
      row.append(el("span", `leg-mode leg-${leg.kind || leg.mode}`,
        leg.kind === "attempted" ? "refused" : leg.kind === "onfoot" ? "on foot" : leg.mode));
      const body = el("span", "leg-body");
      body.append(el("span", "leg-title", `${leg.from} → ${leg.to}`));
      body.append(el("span", "leg-sub", `${leg.km} km · ${ATLAS.evidenceText[leg.evidence].label.toLowerCase()}`));
      row.append(body);
      row.addEventListener("click", () => showLeg(leg));
      return row;
    }

    function showLeg(leg) {
      const ev = ATLAS.evidenceText[leg.evidence];
      noteBox.hidden = false;
      noteBox.innerHTML = "";
      noteBox.append(el("h4", null, `${leg.from} → ${leg.to}`));
      if (leg.note) noteBox.append(el("p", null, leg.note));
      const meta = el("dl", "meta");
      addMeta(meta, "Mode", leg.kind === "attempted" ? "attempted, not taken"
        : leg.kind === "onfoot" ? "on foot" : leg.mode === "sea" ? "by sea" : "by land");
      addMeta(meta, "Distance", `${leg.km} km drawn (${leg.straightKm} km direct)`);
      addMeta(meta, ev.label, ev.blurb);
      addMeta(meta, "Drawn", ATLAS.drawnText[leg.drawn] || "");
      if (leg.portUnnamed)
        addMeta(meta, "Port", "Acts does not name the harbour at one end; the line runs from the town to the nearest water.");
      noteBox.append(meta);
      const close = el("button", "note-close", "×");
      close.addEventListener("click", () => { noteBox.hidden = true; });
      noteBox.append(close);
    }

    function addMeta(dl, k, v) {
      if (!v) return;
      dl.append(el("dt", null, k));
      dl.append(el("dd", null, v));
    }

    // ------------------------------------------------------------ actions --
    function renderActions(e) {
      actionBar.innerHTML = "";
      const a = e.act;
      if (!a) {
        actionBar.append(el("span", "act-hint", "Drag the map, scroll to zoom, click any place."));
        return;
      }
      const btn = el("button", "act", a.label);
      btn.addEventListener("click", () => runAction(a));
      actionBar.append(btn);
    }

    function runAction(a) {
      if (a.type === "journey") return startFollow(a.journey);
      if (a.type === "nations") {
        state.showNations = !state.showNations;
        if (state.showNations) flyTo(map.fit({ w: 11, e: 43, s: 29, n: 43 }, 70), 700);
        infoNote("The fifteen homelands",
          "Acts lists where the Pentecost crowd had travelled from, and the list is a claim about reach: Jews and converts from one end of the known world to the other, in one square. Three of the fifteen — Parthia, Media and Elam — lie east of anything this map covers, so they are drawn as arrows at the edge rather than moved somewhere they are not.");
        return kick();
      }
      if (a.type === "herod") {
        state.layers.herod = !state.layers.herod;
        syncToggles();
        if (state.layers.herod) flyTo(map.fit({ w: 33.5, e: 37.5, s: 30.5, n: 34.2 }, 80), 700);
        infoNote("Herod Agrippa's kingdom",
          "For three years Agrippa the First ruled a territory as large as his grandfather's — Judaea, Samaria, Galilee and the land east of the Jordan — the last time anything like it was in one pair of hands. The outline is the bundled kingdom file; treat it as the shape of the claim rather than a surveyed border.");
        return kick();
      }
      if (a.type === "spread") {
        state.layers.spread = true;
        syncToggles();
        renderPanel();
        infoNote("How the message travelled",
          "The overlay only ever shows what the book has already reported by this point in the story, in the order it reports it. Where Acts names a region rather than a town — Phoenicia, Cyprus, the Judaean countryside — the overlay shades the region instead of inventing a pin.");
        return kick();
      }
      if (a.type === "blocked") {
        flyTo(map.fit({ w: 25.5, e: 33.5, s: 36.2, n: 41.5 }, 80), 700);
        infoNote("Two directions refused",
          "Acts records two closed doors in a single paragraph and explains neither. Both are drawn to where they were heading and stopped short. The first, into Asia, is the odd one: it is the province Paul will later spend three years in.");
        return;
      }
      if (a.type === "compare") {
        const ship = legById.get("j3-assos-ship"), foot = legById.get("j3-assos-foot");
        infoNote("The ship and the walk",
          `The ship had to round Cape Lectum: ${ship.km} km of sailing. The road across the neck of the Troad is ${foot.km} km. Paul sent the ship ahead and walked, having arranged it that way in advance, and Acts never says why — which is exactly why it is worth drawing both lines.`);
        flyTo(map.fit({ w: 25.6, e: 27.0, s: 39.1, n: 40.1 }, 70), 700);
        return;
      }
      if (a.type === "drift") {
        const leg = legById.get("v-drift");
        const knots = (leg.km / 14 / 24 / 1.852).toFixed(1);
        infoNote("How this line was worked out",
          `Acts gives a wind, a direction of flight, and a count of days, and then a landfall. From Cauda to the bay on Malta is ${leg.km} km on this map. Fourteen days of drifting covers that at about ${knots} knots, which is what a hull under bare poles does in a gale. The bearing works out at roughly 280 degrees — just north of due west, which is where a north-easter would push a ship that could not steer. The line is drawn as a reconstruction, and marked as one: nobody aboard knew where they were.`);
        flyTo(map.fit({ w: 13, e: 26, s: 32.5, n: 37.5 }, 80), 700);
        return;
      }
    }

    function infoNote(title, text) {
      noteBox.hidden = false;
      noteBox.innerHTML = "";
      noteBox.append(el("h4", null, title));
      noteBox.append(el("p", null, text));
      const close = el("button", "note-close", "×");
      close.addEventListener("click", () => { noteBox.hidden = true; });
      noteBox.append(close);
    }

    // ------------------------------------------------------------- follow --
    let follow = null;
    function startFollow(journeyId) {
      const journey = ATLAS.journeys[journeyId];
      if (!journey) return;
      if (follow) { stopFollow(); return; }
      const set = new Set(journey.legs);
      const steps = [];
      for (let i = 0; i < episodes.length; i++) {
        const legs = (episodes[i].legs || []).filter((id) => set.has(id));
        if (legs.length) steps.push({ i, legs });
      }
      if (!steps.length) return;

      let stepIndex = -1;
      let path = null, total = 0, startedAt = 0, duration = 0;
      nextStep(performance.now());

      function nextStep(now) {
        stepIndex++;
        if (stepIndex >= steps.length) { stopFollow(); return; }
        const step = steps[stepIndex];
        setIndex(step.i, { keepView: true });
        state.liveLegs = step.legs.slice();
        path = [];
        for (const id of step.legs) {
          const leg = legById.get(id);
          if (leg && leg.kind !== "attempted") path = path.concat(leg.points);
        }
        if (path.length < 2) path = (legById.get(step.legs[0]) || { points: [] }).points.slice();
        total = 0;
        const acc = [0];
        for (let k = 1; k < path.length; k++) {
          total += Math.hypot(path[k][0] - path[k - 1][0], path[k][1] - path[k - 1][1]);
          acc.push(total);
        }
        path.acc = acc;
        startedAt = now;
        duration = Math.max(1300, Math.min(4200, total * 260));
        const box = map.boxOf(path);
        flyTo(map.fit(box, 130), 620);
      }

      follow = (now) => {
        const t = Math.min(1, (now - startedAt) / duration);
        const want = t * total;
        let k = 1;
        while (k < path.acc.length - 1 && path.acc[k] < want) k++;
        const seg = path.acc[k] - path.acc[k - 1] || 1;
        const f = (want - path.acc[k - 1]) / seg;
        state.marker = {
          lon: path[k - 1][0] + (path[k][0] - path[k - 1][0]) * f,
          lat: path[k - 1][1] + (path[k][1] - path[k - 1][1]) * f
        };
        renderTimeline();
        if (t >= 1) nextStep(now);
      };
      $("#follow-stop").hidden = false;
      kick();
    }

    function stopFollow() {
      follow = null;
      state.marker = null;
      $("#follow-stop").hidden = true;
      setIndex(state.index);
    }
    $("#follow-stop").addEventListener("click", stopFollow);

    // ----------------------------------------------------------- timeline --
    const slider = $("#slider");
    const ticks = $("#ticks");
    const readout = $("#readout");
    slider.max = String(episodes.length - 1);

    function buildTicks() {
      ticks.innerHTML = "";
      for (const s of narrative.sections) {
        const first = episodes.findIndex((e) => e.s === s.id);
        const count = episodes.filter((e) => e.s === s.id).length;
        if (first < 0) continue;
        const b = el("button", "tick");
        b.style.flexGrow = String(count);
        b.title = `Acts ${s.chapters}`;
        b.append(el("span", "tick-label", s.title));
        b.dataset.first = String(first);
        b.dataset.id = s.id;
        b.addEventListener("click", () => setIndex(first));
        ticks.append(b);
      }
    }

    function renderTimeline() {
      slider.value = String(state.index);
      const e = episodes[state.index];
      readout.textContent = `${state.index + 1} / ${episodes.length} · ${e.ch}`;
      for (const t of ticks.children) t.classList.toggle("on", t.dataset.id === e.s);
    }

    slider.addEventListener("input", () => {
      if (follow) stopFollow();
      setIndex(Number(slider.value));
    });

    $("#prev").addEventListener("click", () => setIndex(state.index - 1));
    $("#next").addEventListener("click", () => setIndex(state.index + 1));

    document.addEventListener("keydown", (ev) => {
      if (ev.target.tagName === "INPUT" && ev.target !== slider) return;
      if (ev.key === "ArrowLeft") { setIndex(state.index - 1); ev.preventDefault(); }
      if (ev.key === "ArrowRight") { setIndex(state.index + 1); ev.preventDefault(); }
      if (ev.key === "Escape") closeCard();
    });

    // ------------------------------------------------------------- layers --
    function syncToggles() {
      for (const input of document.querySelectorAll("[data-layer]"))
        input.checked = !!state.layers[input.dataset.layer];
    }
    for (const input of document.querySelectorAll("[data-layer]")) {
      input.addEventListener("change", () => {
        state.layers[input.dataset.layer] = input.checked;
        if (input.dataset.layer === "spread") renderPanel();
        render();
      });
    }

    // Everywhere the book has been so far, in one view.
    $("#whole").addEventListener("click", () => {
      let box = { w: 11, e: 40, s: 30, n: 42 };
      for (const id of state.doneLegs.concat(state.liveLegs)) {
        const leg = legById.get(id);
        if (leg) box = map.growBox(box, map.boxOf(leg.points));
      }
      flyTo(map.fit(box, 60), 700);
    });

    // --------------------------------------------------------- place card --
    const card = $("#card");
    function openCard(name) {
      const p = byName[name];
      const written = ATLAS.places[name];
      if (!p && !written) return;
      card.innerHTML = "";
      const close = el("button", "card-close", "×");
      close.addEventListener("click", closeCard);
      card.append(close);
      card.append(el("h3", null, name));

      const bits = [];
      if (written && written.ch) bits.push(written.ch);
      if (written && written.modern) bits.push(`today ${written.modern}`);
      if (bits.length) card.append(el("div", "card-meta", bits.join(" · ")));

      if (written) {
        card.append(el("h5", null, "What it was"));
        card.append(el("p", null, written.was));
        card.append(el("h5", null, "What happens here"));
        card.append(el("p", null, written.acts));
      } else if (p && p.blurb) {
        card.append(el("h5", null, "From the gazetteer"));
        card.append(el("p", null, p.blurb));
      }

      if (p) {
        const foot = el("div", "card-foot");
        if (p.approx || (written && written.approx))
          foot.append(el("p", "warn", (p.note ||
            "This place is not in the bundled coordinate set; its position here is approximate and is marked as such.")));
        else if (p.kind === "water")
          foot.append(el("p", null, "A stretch of sea, not a landfall — nothing is pinned here."));
        else if (p.pleiades)
          foot.append(el("p", null, `Coordinates ${p.lat.toFixed(3)}, ${p.lon.toFixed(3)} — Pleiades ${p.pleiades}.`));
        const jump = el("button", "card-jump", "Centre the map here");
        jump.addEventListener("click", () => {
          flyTo({ lon: p.lon, lat: p.lat, zoom: Math.max(map.view.zoom, 70) }, 650);
        });
        foot.append(jump);
        card.append(foot);
      }
      card.hidden = false;
    }
    function closeCard() { card.hidden = true; }
    $("#card").addEventListener("click", (ev) => ev.stopPropagation());

    // ---------------------------------------------------- map interaction --
    let drag = null;
    canvas.addEventListener("pointerdown", (ev) => {
      canvas.setPointerCapture(ev.pointerId);
      drag = { x: ev.offsetX, y: ev.offsetY, lon: map.view.lon, lat: map.view.lat, moved: 0 };
    });
    canvas.addEventListener("pointermove", (ev) => {
      if (!drag) return;
      const dx = ev.offsetX - drag.x, dy = ev.offsetY - drag.y;
      drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
      map.view.lon = drag.lon - dx / map.view.zoom;
      map.view.lat = ATLAS.geo.mercLat(ATLAS.geo.mercY(drag.lat) + dy / map.view.zoom);
      clampView();
      render();
    });
    canvas.addEventListener("pointerup", (ev) => {
      const wasDrag = drag && drag.moved > 4;
      drag = null;
      if (wasDrag) return;
      const hit = map.pick(ev.offsetX, ev.offsetY);
      if (hit) openCard(hit.name);
    });
    canvas.addEventListener("pointercancel", () => { drag = null; });
    canvas.addEventListener("wheel", (ev) => {
      ev.preventDefault();
      const before = { lon: map.view.lonAt(ev.offsetX), lat: map.view.latAt(ev.offsetY) };
      const k = Math.exp(-ev.deltaY * 0.0016);
      map.view.zoom = Math.max(14, Math.min(600, map.view.zoom * k));
      // Keep the point under the cursor where it was.
      map.view.lon += before.lon - map.view.lonAt(ev.offsetX);
      const dy = ATLAS.geo.mercY(before.lat) - ATLAS.geo.mercY(map.view.latAt(ev.offsetY));
      map.view.lat = ATLAS.geo.mercLat(ATLAS.geo.mercY(map.view.lat) + dy);
      clampView();
      render();
    }, { passive: false });

    // The reference data covers one rectangle of the world; there is nothing to
    // see outside it, so the view stays inside it.
    function clampView() {
      map.view.lat = Math.max(27, Math.min(47, map.view.lat));
      map.view.lon = Math.max(6, Math.min(44, map.view.lon));
    }

    // ---------------------------------------------------------------- go --
    window.addEventListener("resize", () => { map.resize(); setIndex(state.index, { instant: true }); });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) return;
      render();
      if (follow) kick();     // animation frames stop entirely while hidden
    });
    map.resize();
    buildTicks();
    syncToggles();
    setIndex(0, { instant: true });

    // The legend and the about panel are static; wire their disclosure.
    for (const btn of document.querySelectorAll("[data-panel]")) {
      btn.addEventListener("click", () => {
        const target = document.getElementById(btn.dataset.panel);
        const open = target.hasAttribute("hidden");
        for (const p of document.querySelectorAll(".sheet")) p.hidden = true;
        target.hidden = !open;
      });
    }
    for (const btn of document.querySelectorAll(".sheet-close"))
      btn.addEventListener("click", () => { btn.closest(".sheet").hidden = true; });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.ACTS_ATLAS = window.ACTS_ATLAS || {});
