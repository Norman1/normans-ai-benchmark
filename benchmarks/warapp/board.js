// SVG board renderer, ported from the old ai-benchmark spectator.
//
// The geometry file is rendering data only — territory outlines, bonus badges,
// sea routes. The engine never derives rules, adjacency, or bonuses from it,
// and that separation is worth preserving.

export const GEOMETRY_URL = "./assets/medium-earth-geometry.json";

let geometryPromise = null;
export function loadGeometry() {
  geometryPromise ??= fetch(GEOMETRY_URL, { cache: "force-cache" }).then((r) => r.json());
  return geometryPromise;
}

export function svg(tagName, attributes = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  for (const [key, value] of Object.entries(attributes)) {
    node.setAttribute(key, String(value));
  }
  return node;
}

/**
 * Build the static board once. Returns handles the frame renderer mutates —
 * rebuilding 131 paths per frame would be visibly slow.
 */
export function buildBoard(root, map, geometry) {
  const viewBox = geometry.viewBox ?? { width: 1000, height: 580 };
  root.setAttribute("viewBox", `0 0 ${viewBox.width} ${viewBox.height}`);
  root.replaceChildren();

  const sea = svg("rect", { x: 0, y: 0, width: viewBox.width, height: viewBox.height, class: "sea" });
  const routeLayer = svg("g", { class: "route-layer" });
  const territoryLayer = svg("g", { class: "territory-layer" });
  const bonusLayer = svg("g", { class: "bonus-layer" });
  const labelLayer = svg("g", { class: "label-layer" });
  root.append(sea, routeLayer, territoryLayer, bonusLayer, labelLayer);

  const geometryById = new Map(geometry.territories.map((territory) => [territory.id, territory]));
  const territories = new Map();

  for (const territory of map.territories) {
    const shape = geometryById.get(territory.id);
    if (!shape) continue;

    const path = svg("path", { d: shape.path, class: "territory", "data-id": territory.id });
    if (territory.color) path.style.stroke = territory.color;
    territoryLayer.append(path);

    const point = shape.label ?? { x: 0, y: 0 };
    const label = svg("text", { x: point.x, y: point.y, class: "army-label", "data-id": territory.id });
    labelLayer.append(label);

    territories.set(territory.id, { ...territory, path, label, labelPoint: point });
  }

  drawRoutes(map, geometry, territories, routeLayer);
  drawBonusMarkers(map, geometry, bonusLayer);

  return { territories, viewBox };
}

function drawRoutes(map, geometry, territories, layer) {
  if (geometry.routes?.length) {
    for (const route of geometry.routes) {
      layer.append(svg("path", { d: route.path, class: "route" }));
    }
    return;
  }
  for (const [fromId, toId] of map.routeEdges ?? []) {
    const from = territories.get(fromId);
    const to = territories.get(toId);
    if (!from || !to) continue;
    layer.append(svg("line", {
      x1: from.labelPoint.x, y1: from.labelPoint.y,
      x2: to.labelPoint.x, y2: to.labelPoint.y,
      class: "route"
    }));
  }
}

function drawBonusMarkers(map, geometry, layer) {
  const bonusById = new Map(map.bonuses.map((bonus) => [bonus.id, bonus]));
  for (const marker of geometry.bonusLinks ?? []) {
    const bonus = bonusById.get(marker.id);
    if (!bonus) continue;
    const path = svg("path", { d: marker.path, class: "bonus-marker" });
    if (bonus.color) path.style.fill = bonus.color;
    const text = svg("text", {
      x: marker.label.x,
      y: marker.label.y + 0.8,
      class: "bonus-marker-text"
    });
    text.textContent = String(bonus.value);
    layer.append(path, text);
  }
}

/**
 * Paint one replay frame. `frame.territories` is an object keyed by territory
 * id: { owner, armies }. No fog, so this is simply the whole board.
 */
export function renderFrame(board, frame) {
  if (!frame) return;

  for (const [id, node] of board.territories) {
    const state = frame.territories[id];
    node.path.classList.toggle("p0", state?.owner === 0);
    node.path.classList.toggle("p1", state?.owner === 1);
    node.label.textContent = state?.armies != null ? String(state.armies) : "";
  }
}
