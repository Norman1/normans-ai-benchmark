// Subiectul I, items 5 and 6: analytic geometry and trigonometry.

(function (global) {
  "use strict";

  const BAC = (global.BAC = global.BAC || {});
  const { Frac, F, looksTidy, isSquare, M, ml } = BAC.core;
  const { num, part } = BAC.bankHelpers;

  const pointML = (name, x, y) =>
    M.row(M.mi(name), M.mo("(", 'stretchy="false"'), M.num(x), M.mo(","), M.num(y), M.mo(")", 'stretchy="false"'));
  const segML = (a, b) => `<mover><mrow><mi>${a}</mi><mi>${b}</mi></mrow><mo>&#xAF;</mo></mover>`;
  const lenML = (a, b) => M.row(M.mi(a), M.mi(b));
  const vecML = (a, b) => `<mover><mrow><mi>${a}</mi><mi>${b}</mi></mrow><mo stretchy="true">→</mo></mover>`;

  const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15],
    [12, 16, 20], [7, 24, 25], [20, 21, 29], [10, 24, 26], [4, 3, 5], [8, 6, 10], [12, 5, 13]];

  const dist = (ax, ay, bx, by) => Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);

  /* ====================================================================== */
  /*  geometry — Subiectul I.5                                              */
  /* ====================================================================== */

  const geometry = {
    id: "geometry",
    name: "Analytic geometry",
    blurb: "Points, distances, midpoints, vectors, collinearity and slopes.",
    slot: "I.5",
    levels: {
      1: [distanceBetween, midpointOf],
      2: [isoscelesCheck, findEndpoint],
      3: [ratioOfLengths, medianLength, vectorCoords],
      4: [collinearCheck, perpendicularCheck, triangleArea],
      5: [paramCollinear, paramPerpendicular, fourthVertex]
    }
  };

  // L1 · the distance between two points, chosen from a Pythagorean triple.
  function distanceBetween(rng) {
    const [dx, dy, d] = rng.pick(TRIPLES);
    const ax = rng.int(-6, 6);
    const ay = rng.int(-6, 6);
    const sx = rng.sign();
    const sy = rng.sign();
    const bx = ax + sx * dx;
    const by = ay + sy * dy;
    return {
      shape: "distance",
      prompt: `In the cartesian frame ${ml(M.mi("xOy"))} the points ${ml(pointML("A", ax, ay))} and ${ml(pointML("B", bx, by))} are given. Find ${ml(lenML("A", "B"))}.`,
      parts: [
        part(`What is ${ml(M.row(M.sup(M.paren(M.row(M.sub(M.mi("x"), M.mi("B")), M.mo(M.MINUS), M.sub(M.mi("x"), M.mi("A")))), M.mn(2)), M.mo("+"), M.sup(M.paren(M.row(M.sub(M.mi("y"), M.mi("B")), M.mo(M.MINUS), M.sub(M.mi("y"), M.mi("A")))), M.mn(2))))}?`,
          2, num(d * d), `${dx * dx} + ${dy * dy} = ${d * d}`),
        part(`Now ${ml(lenML("A", "B"))}.`, 3, num(d), `${ml(M.eq(lenML("A", "B"), M.mn(d)))}`)
      ],
      solution: [
        `AB = √[(x_B − x_A)² + (y_B − y_A)²].`,
        `Differences: ${bx} − (${ax}) = ${bx - ax} and ${by} − (${ay}) = ${by - ay}.`,
        `AB = √(${(bx - ax) ** 2} + ${(by - ay) ** 2}) = √${d * d} = ${d}.`
      ],
      selfCheck: () => Math.abs(dist(ax, ay, bx, by) - d) < 1e-9 ? null : "distance mismatch"
    };
  }

  // L1 · the midpoint.
  function midpointOf(rng) {
    const mx = rng.int(-6, 8);
    const my = rng.int(-6, 8);
    const dx = rng.nz(-6, 6);
    const dy = rng.nz(-6, 6);
    const ax = mx - dx, ay = my - dy, bx = mx + dx, by = my + dy;
    return {
      shape: "midpoint",
      prompt: `In the cartesian frame ${ml(M.mi("xOy"))} the points ${ml(pointML("A", ax, ay))} and ${ml(pointML("B", bx, by))} are given. Find the coordinates of ${ml(M.mi("M"))}, the midpoint of ${ml(segML("A", "B"))}.`,
      parts: [
        part(`What is the ${ml(M.mi("x"))} coordinate of ${ml(M.mi("M"))}?`, 2, num(mx),
          `${ml(M.eq(M.sub(M.mi("x"), M.mi("M")), M.frac(M.row(M.num(ax), M.mo("+"), M.num(bx)), M.mn(2)), M.num(mx)))}`),
        part(`And the ${ml(M.mi("y"))} coordinate?`, 3, num(my),
          `${ml(M.eq(M.sub(M.mi("y"), M.mi("M")), M.frac(M.row(M.num(ay), M.mo("+"), M.num(by)), M.mn(2)), M.num(my)))}`)
      ],
      solution: [
        `The midpoint is the average of the coordinates: M((x_A + x_B)/2, (y_A + y_B)/2).`,
        `x_M = (${ax} + ${bx})/2 = ${mx}, y_M = (${ay} + ${by})/2 = ${my}.`
      ],
      selfCheck: () => (ax + bx) / 2 === mx && (ay + by) / 2 === my ? null : "midpoint mismatch"
    };
  }

  // L2 · show a triangle is isosceles. Corpus: 2025 model I.5, 2025 specială I.5.
  function isoscelesCheck(rng) {
    const ax = rng.int(-4, 6);
    const ay = rng.int(-4, 6);
    const [dx, dy] = rng.pick([[3, 4], [1, 4], [2, 3], [1, 2], [3, 1], [4, 5], [2, 5]]);
    // B and C put the same distance from A, by swapping the offsets.
    const bx = ax + dx, by = ay + dy;
    const cx = ax + dy, cy = ay + dx;
    if (bx === cx && by === cy) return null;
    const squared = dx * dx + dy * dy;
    return {
      shape: "isosceles",
      prompt: `In the cartesian frame ${ml(M.mi("xOy"))} the points ${ml(pointML("A", ax, ay))}, ${ml(pointML("B", bx, by))} and ${ml(pointML("C", cx, cy))} are given. Show that triangle ${ml(M.row(M.mi("A"), M.mi("B"), M.mi("C")))} is isosceles.`,
      parts: [
        part(`What is ${ml(M.sup(lenML("A", "B"), M.mn(2)))}?`, 3, num(squared), `${ml(M.eq(M.sup(lenML("A", "B"), M.mn(2)), M.mn(squared)))}`),
        part(`And ${ml(M.sup(lenML("A", "C"), M.mn(2)))}?`, 2, num(squared),
          `${ml(M.eq(M.sup(lenML("A", "C"), M.mn(2)), M.mn(squared)))}, so ${ml(M.eq(lenML("A", "B"), lenML("A", "C")))}`)
      ],
      solution: [
        `AB² = (${bx} − ${ax})² + (${by} − ${ay})² = ${dx * dx} + ${dy * dy} = ${squared}.`,
        `AC² = (${cx} − ${ax})² + (${cy} − ${ay})² = ${dy * dy} + ${dx * dx} = ${squared}.`,
        `AB = AC = √${squared}, so the triangle is isosceles. Comparing the squares is enough — no need to take the roots at all.`
      ],
      selfCheck: () => Math.abs(dist(ax, ay, bx, by) - dist(ax, ay, cx, cy)) < 1e-9 ? null : "isosceles mismatch"
    };
  }

  // L2 · the other endpoint from a midpoint. Corpus: 2024 model I.5, 2025 august I.5.
  function findEndpoint(rng) {
    const ax = rng.int(-8, 8);
    const ay = rng.int(-8, 8);
    const mx = rng.int(-8, 8);
    const my = rng.int(-8, 8);
    if (ax === mx && ay === my) return null;
    const bx = 2 * mx - ax;
    const by = 2 * my - ay;
    return {
      shape: "find-endpoint",
      prompt: `In the cartesian frame ${ml(M.mi("xOy"))} the points ${ml(pointML("A", ax, ay))} and ${ml(pointML("B", bx, by))} are given, and ${ml(M.mi("C"))} is such that ${ml(M.mi("B"))} is the midpoint of ${ml(segML("A", "C"))}. Find the coordinates of ${ml(M.mi("C"))}.`,
      parts: [
        part(`What is the ${ml(M.mi("x"))} coordinate of ${ml(M.mi("C"))}?`, 3, num(2 * bx - ax),
          `${ml(M.eq(M.sub(M.mi("x"), M.mi("C")), M.row(M.mn(2), M.sub(M.mi("x"), M.mi("B")), M.mo(M.MINUS), M.sub(M.mi("x"), M.mi("A"))), M.num(2 * bx - ax)))}`),
        part(`And the ${ml(M.mi("y"))} coordinate?`, 2, num(2 * by - ay),
          `${ml(M.eq(M.sub(M.mi("y"), M.mi("C")), M.num(2 * by - ay)))}`)
      ],
      solution: [
        `B is the midpoint, so x_B = (x_A + x_C)/2 and y_B = (y_A + y_C)/2.`,
        `Rearranged: x_C = 2x_B − x_A = 2·${bx} − ${ax} = ${2 * bx - ax}, y_C = 2·${by} − ${ay} = ${2 * by - ay}.`,
        `The midpoint formula runs backwards just as easily as forwards — that is all this question is testing.`
      ],
      selfCheck: () => (ax + (2 * bx - ax)) / 2 === bx ? null : "endpoint mismatch"
    };
  }

  // L3 · one length as a multiple of another. Corpus: 2025 iunie I.5.
  function ratioOfLengths(rng) {
    const k = rng.int(2, 6);
    const ax = rng.int(-5, 5);
    const ay = rng.int(-5, 5);
    const [ux, uy] = rng.pick([[0, 1], [1, 0], [3, 4], [4, 3], [0, 2], [2, 0]]);
    const base = Math.sqrt(ux * ux + uy * uy);
    const bx = ax + ux, by = ay + uy;
    const cx = bx + k * ux, cy = by + k * uy;
    if (!Number.isInteger(base * k)) return null;
    return {
      shape: "ratio-of-lengths",
      prompt: `In the cartesian frame ${ml(M.mi("xOy"))} the points ${ml(pointML("A", ax, ay))}, ${ml(pointML("B", bx, by))} and ${ml(pointML("C", cx, cy))} are given. Find the real number ${ml(M.mi("a"))} for which ${ml(M.eq(lenML("B", "C"), M.row(M.mi("a"), M.mo(M.CDOT), lenML("A", "B"))))}.`,
      parts: [
        part(`What is ${ml(lenML("B", "C"))}?`, 2, num(base * k), `${ml(M.eq(lenML("B", "C"), M.mn(base * k)))}`),
        part(`Now ${ml(M.mi("a"))}.`, 3, num(k), `${ml(M.eq(lenML("A", "B"), M.mn(base)))}, so ${ml(M.eq(M.mi("a"), M.mn(k)))}`)
      ],
      solution: [
        `AB = √(${ux}² + ${uy}²) = ${base}.`,
        `BC = √(${k * ux}² + ${k * uy}²) = ${base * k}.`,
        `BC = a·AB gives ${base * k} = a·${base}, so a = ${k}.`
      ],
      selfCheck: () => Math.abs(dist(bx, by, cx, cy) - k * dist(ax, ay, bx, by)) < 1e-9 ? null : "ratio mismatch"
    };
  }

  // L3 · length from the origin to a midpoint. Corpus: 2026 simulare I.5.
  function medianLength(rng) {
    const [dx, dy, d] = rng.pick(TRIPLES.filter(([a, b]) => a % 2 === 0 || b % 2 === 0));
    const mx = dx, my = dy;
    const ex = rng.int(-4, 4) * 2;
    const ey = rng.int(-4, 4) * 2;
    const dxPoint = 2 * mx - ex;
    const dyPoint = 2 * my - ey;
    return {
      shape: "median-length",
      prompt: `In the cartesian frame ${ml(M.mi("xOy"))} the points ${ml(pointML("D", dxPoint, dyPoint))} and ${ml(pointML("E", ex, ey))} are given, and ${ml(M.mi("M"))} is the midpoint of ${ml(segML("D", "E"))}. Find ${ml(lenML("O", "M"))}.`,
      parts: [
        part(`What are the coordinates of ${ml(M.mi("M"))}? Give ${ml(M.sub(M.mi("x"), M.mi("M")))}.`, 2, num(mx),
          `${ml(M.row(M.mi("M"), M.mo("("), M.num(mx), M.mo(","), M.num(my), M.mo(")")))}`),
        part(`Now ${ml(lenML("O", "M"))}.`, 3, num(d), `${ml(M.eq(lenML("O", "M"), M.mn(d)))}`)
      ],
      solution: [
        `M is the midpoint: x_M = (${dxPoint} + ${ex})/2 = ${mx}, y_M = (${dyPoint} + ${ey})/2 = ${my}.`,
        `O is the origin (0,0), so OM = √(${mx}² + ${my}²) = √${mx * mx + my * my} = ${d}.`
      ],
      selfCheck: () => Math.abs(Math.sqrt(mx * mx + my * my) - d) < 1e-9 ? null : "median mismatch"
    };
  }

  // L3 · the coordinates of a vector.
  function vectorCoords(rng) {
    const ax = rng.int(-7, 7), ay = rng.int(-7, 7);
    const bx = rng.int(-7, 7), by = rng.int(-7, 7);
    if (ax === bx && ay === by) return null;
    const vx = bx - ax, vy = by - ay;
    const length = Math.sqrt(vx * vx + vy * vy);
    if (!Number.isInteger(length)) return null;
    return {
      shape: "vector-coords",
      prompt: `In the cartesian frame ${ml(M.mi("xOy"))} the points ${ml(pointML("A", ax, ay))} and ${ml(pointML("B", bx, by))} are given. Write ${ml(vecML("A", "B"))} in coordinates and find its length.`,
      parts: [
        part(`${ml(vecML("A", "B"))} has coordinates ${ml(M.row(M.mo("("), M.mi("p"), M.mo(","), M.mi("q"), M.mo(")")))}. Give ${ml(M.mi("p"))} and ${ml(M.mi("q"))}, separated by a comma.`,
          3, { type: "pair", values: [vx, vy] },
          `${ml(M.eq(vecML("A", "B"), M.row(M.mo("("), M.num(vx), M.mo(","), M.num(vy), M.mo(")"))))}`),
        part(`What is its length?`, 2, num(length), `${ml(M.eq(M.abs(vecML("A", "B")), M.mn(length)))}`)
      ],
      solution: [
        `A vector from A to B has coordinates (x_B − x_A, y_B − y_A) = (${vx}, ${vy}).`,
        `Its length is √(${vx}² + ${vy}²) = √${vx * vx + vy * vy} = ${length}.`
      ],
      selfCheck: () => Math.abs(Math.hypot(vx, vy) - length) < 1e-9 ? null : "vector mismatch"
    };
  }

  // L4 · are three points collinear?
  function collinearCheck(rng) {
    const ax = rng.int(-6, 4), ay = rng.int(-6, 4);
    const dx = rng.nz(1, 4), dy = rng.nz(-4, 4);
    const k = rng.int(2, 4);
    const bx = ax + dx, by = ay + dy;
    const cx = ax + k * dx, cy = ay + k * dy;
    const slope = F(dy, dx);
    return {
      shape: "collinear",
      prompt: `In the cartesian frame ${ml(M.mi("xOy"))} the points ${ml(pointML("A", ax, ay))}, ${ml(pointML("B", bx, by))} and ${ml(pointML("C", cx, cy))} are given. Show that they lie on one line.`,
      parts: [
        part(`What is the slope ${ml(M.sub(M.mi("m"), M.row(M.mi("A"), M.mi("B"))))}?`, 3, num(slope),
          `${ml(M.eq(M.sub(M.mi("m"), M.row(M.mi("A"), M.mi("B"))), M.frac(M.row(M.sub(M.mi("y"), M.mi("B")), M.mo(M.MINUS), M.sub(M.mi("y"), M.mi("A"))), M.row(M.sub(M.mi("x"), M.mi("B")), M.mo(M.MINUS), M.sub(M.mi("x"), M.mi("A")))), M.num(slope)))}`),
        part(`And ${ml(M.sub(M.mi("m"), M.row(M.mi("A"), M.mi("C"))))}?`, 2, num(slope),
          `the same, ${ml(M.num(slope))} — equal slopes through a shared point means one line`)
      ],
      solution: [
        `m_AB = (${by} − ${ay})/(${bx} − ${ax}) = ${dy}/${dx} = ${ml(M.num(slope))}.`,
        `m_AC = (${cy} − ${ay})/(${cx} − ${ax}) = ${k * dy}/${k * dx} = ${ml(M.num(slope))}.`,
        `The two lines have the same slope and share the point A, so A, B and C are collinear.`,
        `The determinant test does the same job in one line: |x_A y_A 1; x_B y_B 1; x_C y_C 1| = 0.`
      ],
      selfCheck: () => Math.abs((by - ay) * (cx - ax) - (cy - ay) * (bx - ax)) < 1e-9 ? null : "collinear mismatch"
    };
  }

  // L4 · perpendicular by slopes. Corpus: 2025 aprilie simulare I.5.
  function perpendicularCheck(rng) {
    const ax = rng.int(-5, 5), ay = rng.int(-5, 5);
    const [p, q] = rng.pick([[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, 1], [3, 4], [4, 3]]);
    const bx = ax + p, by = ay + q;
    const cx = rng.int(-5, 5), cy = rng.int(-5, 5);
    const dx2 = cx - q, dy2 = cy + p;                // direction (−q, p) ⊥ (p, q)
    if (cx === dx2 && cy === dy2) return null;
    const m1 = F(q, p);
    const m2 = F(p, -q);
    return {
      shape: "perpendicular",
      prompt: `In the cartesian frame ${ml(M.mi("xOy"))} the points ${ml(pointML("A", ax, ay))}, ${ml(pointML("B", bx, by))}, ${ml(pointML("C", cx, cy))} and ${ml(pointML("D", dx2, dy2))} are given. Show that ${ml(M.row(M.mi("A"), M.mi("B")))} and ${ml(M.row(M.mi("C"), M.mi("D")))} are perpendicular.`,
      parts: [
        part(`What is the slope of ${ml(M.row(M.mi("A"), M.mi("B")))}?`, 2, num(m1), `${ml(M.eq(M.sub(M.mi("m"), M.row(M.mi("A"), M.mi("B"))), M.num(m1)))}`),
        part(`What is the product of the two slopes?`, 3, num(-1),
          `${ml(M.eq(M.row(M.sub(M.mi("m"), M.row(M.mi("A"), M.mi("B"))), M.mo(M.CDOT), M.sub(M.mi("m"), M.row(M.mi("C"), M.mi("D")))), M.mn(-1)))}`)
      ],
      solution: [
        `m_AB = ${q}/${p} = ${ml(M.num(m1))} and m_CD = ${p}/(−${q}) = ${ml(M.num(m2))}.`,
        `Their product is ${ml(M.num(m1))} · ${ml(M.num(m2))} = −1.`,
        `Two lines are perpendicular exactly when the product of their slopes is −1 (neither being vertical).`
      ],
      selfCheck: () => Math.abs(m1.value * m2.value + 1) < 1e-9 ? null : "perpendicular mismatch"
    };
  }

  // L4 · the area of a triangle from coordinates.
  function triangleArea(rng) {
    const ax = rng.int(-5, 5), ay = rng.int(-5, 5);
    const bx = rng.int(-6, 6), by = rng.int(-6, 6);
    const cx = rng.int(-6, 6), cy = rng.int(-6, 6);
    const twice = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (twice === 0) return null;
    const area = F(Math.abs(twice), 2);
    if (Math.abs(twice) > 80) return null;
    return {
      shape: "triangle-area",
      prompt: `In the cartesian frame ${ml(M.mi("xOy"))} the points ${ml(pointML("A", ax, ay))}, ${ml(pointML("B", bx, by))} and ${ml(pointML("C", cx, cy))} are given. Find the area of triangle ${ml(M.row(M.mi("A"), M.mi("B"), M.mi("C")))}.`,
      parts: [
        part(`What is the determinant ${ml(M.detBars([[M.num(ax), M.num(ay), M.mn(1)], [M.num(bx), M.num(by), M.mn(1)], [M.num(cx), M.num(cy), M.mn(1)]]))}?`,
          3, num(twice), `the determinant is ${twice}`),
        part(`Now the area.`, 2, num(area), `${ml(M.eq(M.sub(M.mi("A"), M.row(M.mi("A"), M.mi("B"), M.mi("C"))), M.num(area)))}`)
      ],
      solution: [
        `Put the coordinates in a 3×3 determinant with a column of ones: Δ = ${twice}.`,
        `The area is |Δ|/2 = ${Math.abs(twice)}/2 = ${ml(M.num(area))}.`,
        `If the determinant had come out 0 the three points would be collinear — same calculation, two different questions.`
      ],
      selfCheck: () => {
        const shoelace = Math.abs(ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) / 2;
        return Math.abs(shoelace - area.value) < 1e-9 ? null : "area mismatch";
      }
    };
  }

  // L5 · find the parameter that makes three points collinear.
  function paramCollinear(rng) {
    const ax = rng.int(-5, 3), ay = rng.int(-5, 3);
    const dx = rng.nz(1, 3), dy = rng.nz(-4, 4);
    const bx = ax + dx, by = ay + dy;
    const k = rng.int(2, 4);
    const cx = ax + k * dx;
    const cy = ay + k * dy;                        // the value m must take
    return {
      shape: "param-collinear",
      prompt: `In the cartesian frame ${ml(M.mi("xOy"))} the points ${ml(pointML("A", ax, ay))}, ${ml(pointML("B", bx, by))} and ${ml(M.row(M.mi("C"), M.mo("("), M.num(cx), M.mo(","), M.mi("m"), M.mo(")")))} are given. Find the real number ${ml(M.mi("m"))} for which the three points are collinear.`,
      parts: [
        part(`What is the slope of ${ml(M.row(M.mi("A"), M.mi("B")))}?`, 3, num(F(dy, dx)),
          `${ml(M.eq(M.sub(M.mi("m"), M.row(M.mi("A"), M.mi("B"))), M.num(F(dy, dx))))}`),
        part(`Now ${ml(M.mi("m"))}.`, 2, num(cy), `${ml(M.eq(M.mi("m"), M.num(cy)))}`)
      ],
      solution: [
        `Collinear means the slope from A to C equals the slope from A to B.`,
        `m<sub>AB</sub> = ${ml(M.num(F(dy, dx)))}. From A to C the run is ${cx} − ${BAC.core.Tp(ax)} = ${k * dx}, so the rise must be ${k * dx}·${ml(M.num(F(dy, dx)))} = ${BAC.core.T(k * dy)}.`,
        `m = ${BAC.core.T(ay)} + ${BAC.core.Tp(k * dy)} = ${BAC.core.T(cy)}.`
      ],
      selfCheck: () => Math.abs((by - ay) * (cx - ax) - (cy - ay) * (bx - ax)) < 1e-9 ? null : "param-collinear mismatch"
    };
  }

  // L5 · find the parameter making two lines perpendicular.
  function paramPerpendicular(rng) {
    const m1n = rng.nz(-4, 4);
    const m1d = rng.int(1, 4);
    const slope1 = F(m1n, m1d);
    const slope2 = F(-m1d, m1n);
    const ax = rng.int(-5, 5), ay = rng.int(-5, 5);
    const run = rng.pick([1, 2, 3, 4]).valueOf() * Math.abs(m1n);
    const cx = rng.int(-5, 5), cy = rng.int(-5, 5);
    const dxRun = Math.abs(m1n) * rng.int(1, 3);
    const dyRise = slope2.value * dxRun;
    if (!Number.isInteger(dyRise)) return null;
    const bx = ax + m1d, by = ay + m1n;
    const dx2 = cx + dxRun;
    const dy2 = cy + dyRise;
    return {
      shape: "param-perpendicular",
      prompt: `In the cartesian frame ${ml(M.mi("xOy"))} the line through ${ml(pointML("A", ax, ay))} and ${ml(pointML("B", bx, by))} is perpendicular to the line through ${ml(pointML("C", cx, cy))} and ${ml(M.row(M.mi("D"), M.mo("("), M.num(dx2), M.mo(","), M.mi("m"), M.mo(")")))}. Find ${ml(M.mi("m"))}.`,
      parts: [
        part(`What slope must ${ml(M.row(M.mi("C"), M.mi("D")))} have?`, 3, num(slope2),
          `${ml(M.eq(M.sub(M.mi("m"), M.row(M.mi("C"), M.mi("D"))), M.frac(M.mn(-1), M.sub(M.mi("m"), M.row(M.mi("A"), M.mi("B")))), M.num(slope2)))}`),
        part(`Now ${ml(M.mi("m"))}.`, 2, num(dy2), `${ml(M.eq(M.mi("m"), M.num(dy2)))}`)
      ],
      solution: [
        `m_AB = ${m1n}/${m1d} = ${ml(M.num(slope1))}.`,
        `Perpendicular lines have slopes multiplying to −1, so m_CD = −1/(${ml(M.num(slope1))}) = ${ml(M.num(slope2))}.`,
        `From C to D the run is ${dxRun}, so the rise is ${dxRun}·${ml(M.num(slope2))} = ${dyRise}, and m = ${cy} + (${dyRise}) = ${dy2}.`
      ],
      selfCheck: () => Math.abs(slope1.value * slope2.value + 1) < 1e-9 && dy2 - cy === dyRise
        ? null : "param-perpendicular mismatch"
    };
  }

  // L5 · complete a parallelogram.
  function fourthVertex(rng) {
    const ax = rng.int(-6, 4), ay = rng.int(-6, 4);
    const bx = rng.int(-6, 6), by = rng.int(-6, 6);
    const cx = rng.int(-6, 6), cy = rng.int(-6, 6);
    if ((bx - ax) * (cy - ay) - (cx - ax) * (by - ay) === 0) return null;
    const dx = ax + cx - bx;
    const dy = ay + cy - by;
    return {
      shape: "fourth-vertex",
      prompt: `In the cartesian frame ${ml(M.mi("xOy"))} the points ${ml(pointML("A", ax, ay))}, ${ml(pointML("B", bx, by))} and ${ml(pointML("C", cx, cy))} are given. Find ${ml(M.mi("D"))} so that ${ml(M.row(M.mi("A"), M.mi("B"), M.mi("C"), M.mi("D")))} is a parallelogram.`,
      parts: [
        part(`The diagonals of a parallelogram share a midpoint. What is the ${ml(M.mi("x"))} coordinate of the midpoint of ${ml(segML("A", "C"))}?`,
          3, num(F(ax + cx, 2)), `${ml(M.eq(M.sub(M.mi("x"), M.mi("O")), M.num(F(ax + cx, 2))))}`),
        part(`Now the coordinates of ${ml(M.mi("D"))}, separated by a comma.`, 2,
          { type: "pair", values: [dx, dy] },
          `${ml(M.row(M.mi("D"), M.mo("("), M.num(dx), M.mo(","), M.num(dy), M.mo(")")))}`)
      ],
      solution: [
        `In parallelogram ABCD the diagonals AC and BD cut each other in half, so they have the same midpoint.`,
        `Midpoint of AC: ((${ax} + ${cx})/2, (${ay} + ${cy})/2).`,
        `That must equal the midpoint of BD, so x_D = ${ax} + ${cx} − ${bx} = ${dx} and y_D = ${ay} + ${cy} − ${by} = ${dy}.`,
        `Same thing in vectors: AD = BC.`
      ],
      selfCheck: () => (ax + cx) === (bx + dx) && (ay + cy) === (by + dy) ? null : "fourth-vertex mismatch"
    };
  }

  /* ====================================================================== */
  /*  trigonometry — Subiectul I.6                                          */
  /* ====================================================================== */

  const trigonometry = {
    id: "trigonometry",
    name: "Trigonometry",
    blurb: "Right triangles, the special angles, and the sine and cosine rules.",
    slot: "I.6",
    levels: {
      1: [specialValue, hypotenuse],
      2: [trigExpression, missingLeg],
      3: [ratioTriangle, trigSquares],
      4: [angleGiven, altitudeToHypotenuse, medianToHypotenuse],
      5: [cosineRule, sineRule, quadrantReduction, angleFromSides]
    }
  };

  const SPECIAL = {
    "sin 30°": F(1, 2), "cos 60°": F(1, 2), "sin 90°": F(1, 1), "cos 0°": F(1, 1),
    "sin 0°": F(0, 1), "cos 90°": F(0, 1), "tg 45°": F(1, 1), "sin 45°": null,
    "cos 45°": null, "sin 60°": null, "cos 30°": null
  };

  const trigML = (name, angle) => M.row(M.mi(name), M.mo("⁡"), M.deg(angle));

  // L1 · the value of one special ratio.
  function specialValue(rng) {
    const options = [
      { text: trigML("sin", 30), value: F(1, 2), why: "sin 30° = 1/2" },
      { text: trigML("cos", 60), value: F(1, 2), why: "cos 60° = 1/2" },
      { text: trigML("sin", 90), value: F(1, 1), why: "sin 90° = 1" },
      { text: trigML("cos", 0), value: F(1, 1), why: "cos 0° = 1" },
      { text: trigML("tg", 45), value: F(1, 1), why: "tg 45° = 1" },
      { text: trigML("sin", 0), value: F(0, 1), why: "sin 0° = 0" },
      { text: trigML("cos", 90), value: F(0, 1), why: "cos 90° = 0" }
    ];
    const [first, second] = rng.sample(options, 2);
    const sign = rng.sign();
    const total = sign < 0 ? first.value.sub(second.value) : first.value.add(second.value);
    return {
      shape: "special-value",
      prompt: `Work out ${ml(M.row(first.text, M.mo(sign < 0 ? M.MINUS : "+"), second.text))}.`,
      parts: [
        part(`What is ${ml(first.text)}?`, 2, num(first.value), first.why),
        part(`Now the whole expression.`, 3, num(total), `the value is ${ml(M.num(total))}`)
      ],
      solution: [`${first.why}, ${second.why}.`, `So the expression is ${ml(M.num(total))}.`],
      selfCheck: () => Math.abs((sign < 0 ? first.value.value - second.value.value : first.value.value + second.value.value) - total.value) < 1e-12
        ? null : "special-value mismatch"
    };
  }

  // L1 · the hypotenuse of a right triangle.
  function hypotenuse(rng) {
    const [a, b, c] = rng.pick(TRIPLES);
    return {
      shape: "hypotenuse",
      prompt: `Triangle ${ml(M.row(M.mi("A"), M.mi("B"), M.mi("C")))} is right-angled at ${ml(M.mi("A"))}, with ${ml(M.eq(lenML("A", "B"), M.mn(a)))} and ${ml(M.eq(lenML("A", "C"), M.mn(b)))}. Find ${ml(lenML("B", "C"))}.`,
      parts: [
        part(`What is ${ml(M.sup(lenML("B", "C"), M.mn(2)))}?`, 2, num(c * c), `${a}² + ${b}² = ${c * c}`),
        part(`Now ${ml(lenML("B", "C"))}.`, 3, num(c), `${ml(M.eq(lenML("B", "C"), M.mn(c)))}`)
      ],
      solution: [
        `Pythagoras: BC² = AB² + AC² = ${a * a} + ${b * b} = ${c * c}.`,
        `BC = √${c * c} = ${c}.`
      ],
      selfCheck: () => a * a + b * b === c * c ? null : "hypotenuse mismatch"
    };
  }

  // L2 · an expression in the special angles. Corpus: every paper's I.6.
  function trigExpression(rng) {
    const terms = [
      { text: trigML("sin", 30), value: F(1, 2) },
      { text: trigML("cos", 60), value: F(1, 2) },
      { text: trigML("tg", 45), value: F(1, 1) },
      { text: trigML("sin", 90), value: F(1, 1) },
      { text: trigML("cos", 0), value: F(1, 1) }
    ];
    const [first, second] = rng.sample(terms, 2);
    const k1 = rng.int(2, 6);
    const k2 = rng.int(1, 5);
    const sign = rng.sign();
    const total = first.value.mul(k1)[sign < 0 ? "sub" : "add"](second.value.mul(k2));
    if (!looksTidy(total, { denoms: [1, 2] })) return null;
    return {
      shape: "trig-expression",
      prompt: `Show that ${ml(M.row(M.mn(k1), first.text, M.mo(sign < 0 ? M.MINUS : "+"), M.mn(k2), second.text))} is equal to ${ml(M.num(total))}.`,
      parts: [
        part(`What is ${ml(M.row(M.mn(k1), first.text))}?`, 2, num(first.value.mul(k1)),
          `${ml(M.eq(M.row(M.mn(k1), first.text), M.num(first.value.mul(k1))))}`),
        part(`Now the whole expression.`, 3, num(total), `the value is ${ml(M.num(total))}`)
      ],
      solution: [
        `Replace each ratio by its value, then do the arithmetic.`,
        `${k1}·${ml(M.num(first.value))} ${sign < 0 ? "−" : "+"} ${k2}·${ml(M.num(second.value))} = ${ml(M.num(total))}.`
      ],
      selfCheck: () => {
        const expected = k1 * first.value.value + sign * k2 * second.value.value;
        return Math.abs(expected - total.value) < 1e-12 ? null : "trig-expression mismatch";
      }
    };
  }

  // L2 · the other leg.
  function missingLeg(rng) {
    const [a, b, c] = rng.pick(TRIPLES);
    return {
      shape: "missing-leg",
      prompt: `Triangle ${ml(M.row(M.mi("M"), M.mi("N"), M.mi("P")))} is right-angled at ${ml(M.mi("M"))}, with ${ml(M.eq(lenML("N", "P"), M.mn(c)))} and ${ml(M.eq(lenML("M", "N"), M.mn(a)))}. Find ${ml(lenML("M", "P"))}.`,
      parts: [
        part(`What is ${ml(M.sup(lenML("M", "P"), M.mn(2)))}?`, 3, num(b * b), `${c * c} − ${a * a} = ${b * b}`),
        part(`Now ${ml(lenML("M", "P"))}.`, 2, num(b), `${ml(M.eq(lenML("M", "P"), M.mn(b)))}`)
      ],
      solution: [
        `NP is the hypotenuse, so MP² = NP² − MN² = ${c * c} − ${a * a} = ${b * b}.`,
        `MP = ${b}.`
      ],
      selfCheck: () => c * c - a * a === b * b ? null : "missing-leg mismatch"
    };
  }

  // L3 · legs in a given ratio. Corpus: 2025 iunie I.6, 2026 model I.6.
  function ratioTriangle(rng) {
    const k = rng.int(2, 5);
    const shortLeg = rng.int(1, 6);
    const longLeg = k * shortLeg;
    const area = F(shortLeg * longLeg, 2);
    const hyp2 = shortLeg * shortLeg + longLeg * longLeg;
    const [outside, inside] = BAC.core.simplifySurd(hyp2);
    const askArea = rng.bool();
    if (!askArea && inside === 1) return null;
    return {
      shape: "ratio-triangle",
      prompt: `Triangle ${ml(M.row(M.mi("M"), M.mi("N"), M.mi("P")))} is right-angled at ${ml(M.mi("M"))}, with ${ml(M.eq(lenML("M", "N"), M.row(M.mn(k), M.mo(M.CDOT), lenML("M", "P"))))} and ${ml(M.eq(lenML("M", "N"), M.mn(longLeg)))}. Find ${askArea ? `the area of the triangle` : ml(lenML("N", "P"))}.`,
      parts: [
        part(`What is ${ml(lenML("M", "P"))}?`, 2, num(shortLeg), `${ml(M.eq(lenML("M", "P"), M.mn(shortLeg)))}`),
        askArea
          ? part(`Now the area.`, 3, num(area), `${ml(M.eq(M.sub(M.mi("A"), M.row(M.mi("M"), M.mi("N"), M.mi("P"))), M.num(area)))}`)
          : part(`Now ${ml(lenML("N", "P"))}.`, 3, num(Math.sqrt(hyp2)), `${ml(M.eq(lenML("N", "P"), M.surd(outside, inside)))}`)
      ],
      solution: [
        `MN = ${k}·MP and MN = ${longLeg}, so MP = ${longLeg}/${k} = ${shortLeg}.`,
        askArea
          ? `The legs of a right triangle are its base and height, so the area is MN·MP/2 = ${longLeg}·${shortLeg}/2 = ${ml(M.num(area))}.`
          : `NP² = ${longLeg}² + ${shortLeg}² = ${hyp2}, so NP = √${hyp2} = ${ml(M.surd(outside, inside))}.`
      ],
      selfCheck: () => k * shortLeg === longLeg ? null : "ratio-triangle mismatch"
    };
  }

  // L3 · squares of the special ratios. Corpus: 2025 august I.6.
  function trigSquares(rng) {
    const options = [
      { text: trigML("sin", 60), square: F(3, 4), why: "(sin 60°)² = (√3/2)² = 3/4" },
      { text: trigML("cos", 30), square: F(3, 4), why: "(cos 30°)² = (√3/2)² = 3/4" },
      { text: trigML("sin", 45), square: F(1, 2), why: "(sin 45°)² = (√2/2)² = 1/2" },
      { text: trigML("cos", 45), square: F(1, 2), why: "(cos 45°)² = (√2/2)² = 1/2" }
    ];
    const chosen = rng.pick(options);
    const k = rng.pick([2, 4, 6, 8]);
    const extra = rng.pick([
      { text: trigML("sin", 30), value: F(1, 2), why: "sin 30° = 1/2" },
      { text: trigML("cos", 60), value: F(1, 2), why: "cos 60° = 1/2" },
      { text: trigML("tg", 45), value: F(1, 1), why: "tg 45° = 1" }
    ]);
    const kExtra = rng.int(1, 5);
    const sign = rng.sign();
    const total = chosen.square.mul(k)[sign < 0 ? "sub" : "add"](extra.value.mul(kExtra));
    if (!looksTidy(total, { denoms: [1, 2] })) return null;
    return {
      shape: "trig-squares",
      prompt: `Show that ${ml(M.row(M.mn(k), M.sup(M.paren(chosen.text), M.mn(2)), M.mo(sign < 0 ? M.MINUS : "+"), M.mn(kExtra), extra.text))} is equal to ${ml(M.num(total))}.`,
      parts: [
        part(`What is ${ml(M.sup(M.paren(chosen.text), M.mn(2)))}?`, 3, num(chosen.square), chosen.why),
        part(`Now the whole expression.`, 2, num(total), `the value is ${ml(M.num(total))}`)
      ],
      solution: [
        `${chosen.why}.`,
        `${extra.why}.`,
        `${k}·${ml(M.num(chosen.square))} ${sign < 0 ? "−" : "+"} ${kExtra}·${ml(M.num(extra.value))} = ${ml(M.num(total))}.`,
        `Squaring first is what keeps the surd out of the arithmetic.`
      ],
      selfCheck: () => {
        const expected = k * chosen.square.value + sign * kExtra * extra.value.value;
        return Math.abs(expected - total.value) < 1e-12 ? null : "trig-squares mismatch";
      }
    };
  }

  // L4 · a right triangle with a 30°, 45° or 60° angle. Corpus: 2025 model I.6.
  //
  // The right angle is at A, so AB and AC are the legs and BC the hypotenuse,
  // and the angle at C sits between AC and BC. Each case below is chosen so
  // the answer is an integer or a clean surd — never a decimal.
  function angleGiven(rng) {
    const k = rng.int(2, 12);
    const CASES = [
      { angle: 60, ratio: "cos", from: "AC", to: "BC", given: k, answer: 2 * k,
        value: F(1, 2), valueML: () => M.num(F(1, 2)), formula: ["AC", "BC"] },
      { angle: 60, ratio: "tg", from: "AC", to: "AB", given: k, answer: k * Math.sqrt(3),
        value: Math.sqrt(3), valueML: () => M.sqrt(M.mn(3)), formula: ["AB", "AC"] },
      { angle: 60, ratio: "sin", from: "BC", to: "AB", given: 2 * k, answer: k * Math.sqrt(3),
        value: Math.sqrt(3) / 2, valueML: () => M.frac(M.sqrt(M.mn(3)), M.mn(2)), formula: ["AB", "BC"] },
      { angle: 30, ratio: "sin", from: "BC", to: "AB", given: 2 * k, answer: k,
        value: F(1, 2), valueML: () => M.num(F(1, 2)), formula: ["AB", "BC"] },
      { angle: 30, ratio: "cos", from: "BC", to: "AC", given: 2 * k, answer: k * Math.sqrt(3),
        value: Math.sqrt(3) / 2, valueML: () => M.frac(M.sqrt(M.mn(3)), M.mn(2)), formula: ["AC", "BC"] },
      { angle: 45, ratio: "tg", from: "AC", to: "AB", given: k, answer: k,
        value: 1, valueML: () => M.mn(1), formula: ["AB", "AC"] },
      { angle: 45, ratio: "cos", from: "AC", to: "BC", given: k, answer: k * Math.sqrt(2),
        value: Math.sqrt(2) / 2, valueML: () => M.frac(M.sqrt(M.mn(2)), M.mn(2)), formula: ["AC", "BC"] }
    ];
    const c = rng.pick(CASES);
    const numeric = c.value instanceof Frac ? c.value.value : c.value;
    const [top, bottom] = c.formula;
    const ratioML = M.eq(
      M.row(M.mi(c.ratio), M.mo("⁡"), M.mi("C")),
      M.frac(lenML(top[0], top[1]), lenML(bottom[0], bottom[1])),
      c.valueML()
    );
    const answerML = Number.isInteger(c.answer) ? M.mn(c.answer)
      : M.row(M.mn(k), M.sqrt(M.mn(Math.round((c.answer / k) ** 2))));
    return {
      shape: "angle-given",
      prompt: `Triangle ${ml(M.row(M.mi("A"), M.mi("B"), M.mi("C")))} is right-angled at ${ml(M.mi("A"))}, with ${ml(M.eq(lenML(c.from[0], c.from[1]), M.mn(c.given)))} and the angle at ${ml(M.mi("C"))} equal to ${ml(M.deg(c.angle))}. Find ${ml(lenML(c.to[0], c.to[1]))}.`,
      parts: [
        part(`Which ratio links ${ml(lenML(c.from[0], c.from[1]))}, ${ml(lenML(c.to[0], c.to[1]))} and the angle at ${ml(M.mi("C"))}? Give its value.`,
          3, num(numeric), `${ml(ratioML)}`, { placeholder: "for example 1/2 or √3/2" }),
        part(`Now ${ml(lenML(c.to[0], c.to[1]))}.`, 2, num(c.answer), `${ml(M.eq(lenML(c.to[0], c.to[1]), answerML))}`)
      ],
      solution: [
        `The right angle is at A, so BC is the hypotenuse and AB, AC are the legs. Seen from C, AC is the adjacent leg and AB the opposite one.`,
        `That makes ${c.ratio} C = ${top}/${bottom}, and ${c.ratio} ${c.angle}° = ${ml(c.valueML())}.`,
        `Substituting ${c.from} = ${c.given} gives ${c.to} = ${Number.isInteger(c.answer) ? c.answer : `${k}√${Math.round((c.answer / k) ** 2)}`}.`
      ],
      selfCheck: () => {
        const rad = c.angle * Math.PI / 180;
        const expected = c.ratio === "sin" ? Math.sin(rad) : c.ratio === "cos" ? Math.cos(rad) : Math.tan(rad);
        const consistent = Math.abs(expected - numeric) < 1e-9;
        const derived = c.ratio === "tg"
          ? Math.abs((c.formula[0] === c.to ? c.answer / c.given : c.given / c.answer) - numeric) < 1e-9
          : Math.abs((c.formula[0] === c.to ? c.answer / c.given : c.given / c.answer) - numeric) < 1e-9;
        return consistent && derived ? null : "angle-given mismatch";
      }
    };
  }

  // L4 · the altitude from the right angle. Corpus: 2026 simulare I.6.
  function altitudeToHypotenuse(rng) {
    const scale = rng.int(1, 6);
    const [ba, bb, bc] = rng.pick(TRIPLES);
    const [a, b, c] = [ba * scale, bb * scale, bc * scale];
    const altitude = F(a * b, c);
    if (!looksTidy(altitude, { denoms: [1, 2, 4, 5, 10, 20, 25] })) return null;
    return {
      shape: "altitude-hypotenuse",
      prompt: `Triangle ${ml(M.row(M.mi("A"), M.mi("B"), M.mi("C")))} is right-angled at ${ml(M.mi("A"))}, with ${ml(M.eq(lenML("A", "B"), M.mn(a)))} and ${ml(M.eq(lenML("A", "C"), M.mn(b)))}. Find the length of the altitude from ${ml(M.mi("A"))}.`,
      parts: [
        part(`What is ${ml(lenML("B", "C"))}?`, 2, num(c), `${ml(M.eq(lenML("B", "C"), M.mn(c)))}`),
        part(`Now the altitude.`, 3, num(altitude),
          `${ml(M.eq(M.sub(M.mi("h"), M.mi("A")), M.frac(M.row(lenML("A", "B"), M.mo(M.CDOT), lenML("A", "C")), lenML("B", "C")), M.num(altitude)))}`)
      ],
      solution: [
        `BC = √(${a}² + ${b}²) = ${c}.`,
        `The area can be worked out two ways: AB·AC/2 and BC·h/2. Setting them equal, h = AB·AC/BC = ${a}·${b}/${c} = ${ml(M.num(altitude))}.`,
        `That "same area, two ways" trick is the standard route to any altitude.`
      ],
      selfCheck: () => Math.abs(a * b / c - altitude.value) < 1e-12 ? null : "altitude mismatch"
    };
  }

  // L4 · the median to the hypotenuse. Corpus: 2024 v1 I.6.
  function medianToHypotenuse(rng) {
    const scale = rng.int(1, 5);
    const [ba, bb] = rng.pick(TRIPLES.filter(([p]) => p % 2 === 0));
    const [a, b] = [ba * scale, bb * scale];
    if (a % 2 !== 0) return null;
    const halfA = a / 2;
    const cm2 = halfA * halfA + b * b;
    const cm = Math.sqrt(cm2);
    // Integers and clean surds both look like the paper; awkward roots do not.
    const [outside, inside] = BAC.core.simplifySurd(cm2);
    if (!Number.isInteger(cm) && (inside > 15 || outside === 1)) return null;
    return {
      shape: "median-hypotenuse",
      prompt: `Triangle ${ml(M.row(M.mi("A"), M.mi("B"), M.mi("C")))} is right-angled at ${ml(M.mi("A"))}, with ${ml(M.eq(lenML("A", "B"), M.mn(a)))} and ${ml(M.eq(lenML("A", "C"), M.mn(b)))}. ${ml(M.mi("M"))} is the midpoint of ${ml(segML("A", "B"))}. Find ${ml(lenML("C", "M"))}.`,
      parts: [
        part(`What is ${ml(lenML("A", "M"))}?`, 2, num(halfA), `${ml(M.eq(lenML("A", "M"), M.mn(halfA)))}`),
        part(`Now ${ml(lenML("C", "M"))}.`, 3, num(cm), `${ml(M.eq(lenML("C", "M"), M.surd(outside, inside)))}`)
      ],
      solution: [
        `M is the midpoint of AB, so AM = ${a}/2 = ${halfA}.`,
        `Triangle AMC still has its right angle at A, so CM² = AM² + AC² = ${halfA * halfA} + ${b * b} = ${cm2}.`,
        `CM = √${cm2} = ${ml(M.surd(outside, inside))}.`
      ],
      selfCheck: () => Math.abs(halfA * halfA + b * b - cm * cm) < 1e-9
        && Math.abs(outside * Math.sqrt(inside) - cm) < 1e-9 ? null : "median-hypotenuse mismatch"
    };
  }

  // Integer triangles with a 60° or 120° angle at A, so that the third side
  // comes out whole. Found once, at load, rather than written out by hand.
  const INTEGER_TRIANGLES = (() => {
    const sixty = [];
    const oneTwenty = [];
    for (let a = 2; a <= 30; a += 1) {
      for (let b = a; b <= 30; b += 1) {
        const sixtySquared = a * a + b * b - a * b;
        const oneTwentySquared = a * a + b * b + a * b;
        if (Number.isInteger(Math.sqrt(sixtySquared)) && a !== b) {
          sixty.push([a, b, Math.sqrt(sixtySquared)]);
        }
        if (Number.isInteger(Math.sqrt(oneTwentySquared))) {
          oneTwenty.push([a, b, Math.sqrt(oneTwentySquared)]);
        }
      }
    }
    return { sixty, oneTwenty };
  })();

  // L5 · the cosine rule with a 60° or 120° angle — above the corpus, in the syllabus.
  function cosineRule(rng) {
    const useSixty = rng.bool();
    const pool = useSixty ? INTEGER_TRIANGLES.sixty : INTEGER_TRIANGLES.oneTwenty;
    const [first, second, c] = rng.pick(pool);
    const [a, b] = rng.bool() ? [first, second] : [second, first];
    const angle = useSixty ? 60 : 120;
    const cosValue = useSixty ? F(1, 2) : F(-1, 2);
    const c2 = a * a + b * b - 2 * a * b * cosValue.value;
    return {
      shape: "cosine-rule",
      prompt: `In triangle ${ml(M.row(M.mi("A"), M.mi("B"), M.mi("C")))}, ${ml(M.eq(lenML("A", "B"), M.mn(a)))}, ${ml(M.eq(lenML("A", "C"), M.mn(b)))} and the angle at ${ml(M.mi("A"))} is ${ml(M.deg(angle))}. Find ${ml(lenML("B", "C"))}.`,
      parts: [
        part(`What is ${ml(M.sup(lenML("B", "C"), M.mn(2)))}?`, 3, num(c2),
          `${ml(M.eq(M.sup(lenML("B", "C"), M.mn(2)), M.mn(c2)))}`),
        part(`Now ${ml(lenML("B", "C"))}.`, 2, num(c), `${ml(M.eq(lenML("B", "C"), M.mn(c)))}`)
      ],
      solution: [
        `Cosine rule: BC² = AB² + AC² − 2·AB·AC·cos A.`,
        `cos ${angle}° = ${ml(M.num(cosValue))}, so BC² = ${a * a} + ${b * b} − 2·${a}·${b}·(${ml(M.num(cosValue))}) = ${c2}.`,
        `BC = √${c2} = ${c}.`,
        `With a 120° angle the cosine is negative, so the last term *adds* — that sign is where the marks go.`
      ],
      selfCheck: () => Math.abs(c2 - c * c) < 1e-9 ? null : "cosine-rule mismatch"
    };
  }

  // L5 · the cosine rule run backwards: three sides, find the angle.
  function angleFromSides(rng) {
    const useSixty = rng.bool();
    const pool = useSixty ? INTEGER_TRIANGLES.sixty : INTEGER_TRIANGLES.oneTwenty;
    const [first, second, c] = rng.pick(pool);
    const [a, b] = rng.bool() ? [first, second] : [second, first];
    const angle = useSixty ? 60 : 120;
    const cosValue = useSixty ? F(1, 2) : F(-1, 2);
    return {
      shape: "angle-from-sides",
      prompt: `In triangle ${ml(M.row(M.mi("A"), M.mi("B"), M.mi("C")))}, ${ml(M.eq(lenML("A", "B"), M.mn(a)))}, ${ml(M.eq(lenML("A", "C"), M.mn(b)))} and ${ml(M.eq(lenML("B", "C"), M.mn(c)))}. Find the measure of the angle at ${ml(M.mi("A"))}, in degrees.`,
      parts: [
        part(`What is ${ml(M.row(M.mi("cos"), M.mo("⁡"), M.mi("A")))}?`, 3, num(cosValue),
          `${ml(M.eq(M.row(M.mi("cos"), M.mo("⁡"), M.mi("A")), M.frac(M.row(M.sup(lenML("A", "B"), M.mn(2)), M.mo("+"), M.sup(lenML("A", "C"), M.mn(2)), M.mo(M.MINUS), M.sup(lenML("B", "C"), M.mn(2))), M.row(M.mn(2), M.mo(M.CDOT), lenML("A", "B"), M.mo(M.CDOT), lenML("A", "C"))), M.num(cosValue)))}`),
        part(`So what is the angle, in degrees?`, 2, num(angle), `${ml(M.deg(angle))}`)
      ],
      solution: [
        `Rearrange the cosine rule: cos A = (AB² + AC² − BC²)/(2·AB·AC).`,
        `= (${a * a} + ${b * b} − ${c * c})/(2·${a}·${b}) = ${a * a + b * b - c * c}/${2 * a * b} = ${ml(M.num(cosValue))}.`,
        `The angle whose cosine is ${ml(M.num(cosValue))} is ${angle}°.`,
        `A negative cosine means an obtuse angle — the sign alone tells you which side of 90° you are on, before any arithmetic.`
      ],
      selfCheck: () => Math.abs((a * a + b * b - c * c) / (2 * a * b) - cosValue.value) < 1e-9
        ? null : "angle-from-sides mismatch"
    };
  }

  // L5 · the sine rule.
  function sineRule(rng) {
    const angle = rng.pick([30, 90]);
    const side = rng.int(2, 12) * (angle === 30 ? 1 : 1);
    const sinValue = angle === 30 ? F(1, 2) : F(1, 1);
    const diameter = side / sinValue.value;
    const radius = diameter / 2;
    if (!Number.isInteger(radius * 2)) return null;
    return {
      shape: "sine-rule",
      prompt: `In triangle ${ml(M.row(M.mi("A"), M.mi("B"), M.mi("C")))} the angle at ${ml(M.mi("A"))} is ${ml(M.deg(angle))} and ${ml(M.eq(lenML("B", "C"), M.mn(side)))}. Find the radius ${ml(M.mi("R"))} of its circumscribed circle.`,
      parts: [
        part(`What is ${ml(M.frac(lenML("B", "C"), M.row(M.mi("sin"), M.mo("⁡"), M.mi("A"))))}?`, 3, num(diameter),
          `${ml(M.eq(M.frac(lenML("B", "C"), M.row(M.mi("sin"), M.mo("⁡"), M.mi("A"))), M.mn(diameter)))}`),
        part(`Now ${ml(M.mi("R"))}.`, 2, num(radius), `${ml(M.eq(M.mi("R"), M.num(F(side, 2 * sinValue.value))))}`)
      ],
      solution: [
        `Sine rule: BC / sin A = 2R.`,
        `sin ${angle}° = ${ml(M.num(sinValue))}, so BC / sin A = ${side} / ${ml(M.num(sinValue))} = ${diameter} = 2R.`,
        `R = ${radius}.`
      ],
      selfCheck: () => Math.abs(side / sinValue.value - 2 * radius) < 1e-9 ? null : "sine-rule mismatch"
    };
  }

  // L5 · reduction to the first quadrant. Corpus: 2025 aprilie simulare I.6.
  function quadrantReduction(rng) {
    const angle = rng.pick([20, 25, 35, 40, 50, 55, 65, 70, 80]);
    const useSin = rng.bool();
    const supplement = 180 - angle;
    return {
      shape: "quadrant-reduction",
      prompt: `Show that ${ml(M.row(M.sup(M.paren(trigML("sin", angle)), M.mn(2)), M.mo("+"), M.sup(M.paren(trigML("cos", angle)), M.mn(2)), M.mo("+"), trigML("sin", supplement), M.mo(M.MINUS), trigML("sin", angle)))} is equal to ${ml(M.mn(1))}.`,
      parts: [
        part(`What is ${ml(M.row(M.sup(M.paren(trigML("sin", angle)), M.mn(2)), M.mo("+"), M.sup(M.paren(trigML("cos", angle)), M.mn(2))))}?`,
          3, num(1), `${ml(M.eq(M.row(M.sup(M.mi("sin"), M.mn(2)), M.mi("x"), M.mo("+"), M.sup(M.mi("cos"), M.mn(2)), M.mi("x")), M.mn(1)))} for every angle`),
        part(`What is ${ml(M.row(trigML("sin", supplement), M.mo(M.MINUS), trigML("sin", angle)))}?`, 2, num(0),
          `${ml(M.eq(trigML("sin", supplement), trigML("sin", angle)))}, so the difference is 0`)
      ],
      solution: [
        `sin²x + cos²x = 1 holds for every angle — that is the fundamental identity, and it is worth 3p on its own.`,
        `${supplement}° = 180° − ${angle}°, and sin(180° − x) = sin x, so sin ${supplement}° = sin ${angle}° and the last two terms cancel.`,
        `Total: 1 + 0 = 1.`
      ],
      selfCheck: () => {
        const rad = (d) => d * Math.PI / 180;
        const total = Math.sin(rad(angle)) ** 2 + Math.cos(rad(angle)) ** 2
          + Math.sin(rad(supplement)) - Math.sin(rad(angle));
        return Math.abs(total - 1) < 1e-9 ? null : "reduction mismatch";
      }
    };
  }

  BAC.bankGeometry = [geometry, trigonometry];
})(typeof window !== "undefined" ? window : globalThis);
