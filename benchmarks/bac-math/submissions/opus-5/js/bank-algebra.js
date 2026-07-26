// Subiectul I, items 2, 3 and 4: functions, equations, probability.

(function (global) {
  "use strict";

  const BAC = (global.BAC = global.BAC || {});
  const { Frac, F, looksTidy, isSquare, M, ml, range } = BAC.core;
  const { num, part } = BAC.bankHelpers;

  const fx = (body, name = "f", arg = "x") =>
    M.row(M.mi(name), M.mo(":"), M.REALS, M.mo("→"), M.REALS, M.mo(","),
      M.call(name, M.mi(arg)), M.mo("="), body);

  /* ====================================================================== */
  /*  functions — Subiectul I.2                                             */
  /* ====================================================================== */

  const functions = {
    id: "functions",
    name: "Functions",
    blurb: "First-degree functions, then quadratics: vertex, Viète, discriminant.",
    slot: "I.2",
    levels: {
      1: [linearEval, linearZero],
      2: [linearSolve, linearRelation],
      3: [linearSelfReferential, linearFixedPoint, linearIntercepts],
      4: [quadVertex, quadViete, quadEqualRoots],
      5: [quadRootsCondition, quadTangentLine, quadMaxPower]
    }
  };

  // L1 · evaluate a first-degree function.
  function linearEval(rng) {
    const a = rng.nz(-9, 9);
    const b = rng.nz(-12, 12);
    const k = rng.nz(-6, 6);
    const value = a * k + b;
    return {
      shape: "linear-eval",
      prompt: `The function ${ml(fx(M.linear(a, b)))} is given. Calculate ${ml(M.call("f", M.num(k)))}.`,
      parts: [
        part(`What is ${ml(M.row(M.num(a), M.mo(M.CDOT), M.paren(M.num(k))))}?`, 2, num(a * k), `${a}·(${k}) = ${a * k}`),
        part(`Now ${ml(M.call("f", M.num(k)))}.`, 3, num(value), `${ml(M.eq(M.call("f", M.num(k)), M.num(value)))}`)
      ],
      solution: [
        `Substitute x = ${k}: f(${k}) = ${a}·(${k}) ${b < 0 ? "−" : "+"} ${Math.abs(b)}.`,
        `That is ${a * k} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${value}.`
      ],
      selfCheck: () => a * k + b === value ? null : "linear-eval mismatch"
    };
  }

  // L1 · where does it cross zero.
  function linearZero(rng) {
    const a = rng.pick([2, 3, 4, 5, 6, -2, -3, -4]);
    const root = rng.nz(-8, 8);
    const b = -a * root;
    return {
      shape: "linear-zero",
      prompt: `The function ${ml(fx(M.linear(a, b)))} is given. Find the real number ${ml(M.mi("a"))} for which ${ml(M.eq(M.call("f", M.mi("a")), M.mn(0)))}.`,
      parts: [
        part(`Writing ${ml(M.eq(M.call("f", M.mi("a")), M.mn(0)))} gives ${ml(M.eq(M.row(M.num(a), M.mi("a")), M.mi("t")))}. What is ${ml(M.mi("t"))}?`,
          2, num(-b), `${ml(M.eq(M.row(M.num(a), M.mi("a")), M.num(-b)))}`),
        part(`Now ${ml(M.mi("a"))}.`, 3, num(root), `${ml(M.eq(M.mi("a"), M.num(root)))}`)
      ],
      solution: [
        `f(a) = 0 means ${a}a ${b < 0 ? "−" : "+"} ${Math.abs(b)} = 0.`,
        `So ${a}a = ${-b} and a = ${root}.`
      ],
      selfCheck: () => a * root + b === 0 ? null : "linear-zero mismatch"
    };
  }

  // L2 · f(m) = k.
  function linearSolve(rng) {
    const a = rng.pick([2, 3, 4, 5, 6, -2, -3, -5]);
    const b = rng.nz(-12, 12);
    const m = rng.nz(-8, 8);
    const k = a * m + b;
    return {
      shape: "linear-solve",
      prompt: `The function ${ml(fx(M.linear(a, b)))} is given. Find the real number ${ml(M.mi("m"))} for which ${ml(M.eq(M.call("f", M.mi("m")), M.num(k)))}.`,
      parts: [
        part(`The equation is ${ml(M.eq(M.row(M.num(a), M.mi("m"), M.mo(b < 0 ? M.MINUS : "+"), M.mn(Math.abs(b))), M.num(k)))}. What is ${ml(M.row(M.num(a), M.mi("m")))}?`,
          2, num(k - b), `${ml(M.eq(M.row(M.num(a), M.mi("m")), M.num(k - b)))}`),
        part(`Now ${ml(M.mi("m"))}.`, 3, num(m), `${ml(M.eq(M.mi("m"), M.num(m)))}`)
      ],
      solution: [
        `f(m) = ${a}m ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${k}.`,
        `${a}m = ${k - b}, so m = ${m}.`
      ],
      selfCheck: () => a * m + b === k ? null : "linear-solve mismatch"
    };
  }

  // L2 · a relation between three values. Corpus: 2025 specială I.2.
  function linearRelation(rng) {
    const a = rng.pick([2, 3, 4, 5, -2, -3]);
    const b = rng.nz(-9, 9);
    const [p, q] = rng.sample(range(0, 5), 2);
    const r = p + q;
    const f = (t) => a * t + b;
    const total = f(p) + f(q);
    return {
      shape: "linear-relation",
      prompt: `The function ${ml(fx(M.linear(a, b)))} is given. Calculate ${ml(M.row(M.call("f", M.mn(p)), M.mo("+"), M.call("f", M.mn(q))))}, and say what ${ml(M.call("f", M.mn(r)))} is.`,
      parts: [
        part(`What is ${ml(M.row(M.call("f", M.mn(p)), M.mo("+"), M.call("f", M.mn(q))))}?`, 3, num(total),
          `${ml(M.eq(M.call("f", M.mn(p)), M.num(f(p))))}, ${ml(M.eq(M.call("f", M.mn(q)), M.num(f(q))))}, sum ${total}`),
        part(`And ${ml(M.call("f", M.mn(r)))}?`, 2, num(f(r)), `${ml(M.eq(M.call("f", M.mn(r)), M.num(f(r))))}`)
      ],
      solution: [
        `f(${p}) = ${f(p)} and f(${q}) = ${f(q)}, so the sum is ${total}.`,
        `f(${r}) = ${f(r)}. They differ by ${b}: adding two values of a first-degree function adds the constant term twice, which is why f(${p}) + f(${q}) ≠ f(${r}) unless ${b} = 0.`
      ],
      selfCheck: () => f(p) + f(q) === total ? null : "linear-relation mismatch"
    };
  }

  // L3 · f(k) = a + f(0). Corpus: 2025 iunie I.2 — the unknown is on both sides.
  function linearSelfReferential(rng) {
    const a = rng.pick([2, 3, 4, 5, 6, 7, -3, -4]);
    const b = rng.nz(-9, 9);
    const k = rng.int(2, 5);
    const answer = a * k;                 // f(k) − f(0) = a·k
    return {
      shape: "linear-self",
      prompt: `The function ${ml(fx(M.linear(a, b)))} is given. Find the real number ${ml(M.mi("a"))} for which ${ml(M.eq(M.call("f", M.mn(k)), M.row(M.mi("a"), M.mo("+"), M.call("f", M.mn(0)))))}.`,
      parts: [
        part(`What are ${ml(M.call("f", M.mn(k)))} and ${ml(M.call("f", M.mn(0)))}? Give ${ml(M.call("f", M.mn(k)))}.`,
          2, num(a * k + b), `${ml(M.eq(M.call("f", M.mn(k)), M.num(a * k + b)))} and ${ml(M.eq(M.call("f", M.mn(0)), M.num(b)))}`),
        part(`Now ${ml(M.mi("a"))}.`, 3, num(answer), `${ml(M.eq(M.mi("a"), M.num(answer)))}`)
      ],
      solution: [
        `f(${k}) = ${a * k + b} and f(0) = ${b}.`,
        `The equation is ${a * k + b} = a + ${b}, so a = ${a * k + b} − ${b} = ${answer}.`,
        `The letter a in the question is not the coefficient of x — read the question, not the pattern.`
      ],
      selfCheck: () => (a * k + b) - b === answer ? null : "linear-self mismatch"
    };
  }

  // L3 · f(a) = a. Corpus: 2026 model I.2.
  function linearFixedPoint(rng) {
    const a = rng.pick([3, 4, 5, 6, -2, -3, -4]);
    if (a === 1) return null;
    const root = rng.nz(-6, 6);
    const b = root * (1 - a);            // a·root + b = root
    if (b === 0 || Math.abs(b) > 40) return null;
    return {
      shape: "linear-fixed",
      prompt: `The function ${ml(fx(M.linear(a, b)))} is given. Find the real number ${ml(M.mi("a"))} for which ${ml(M.eq(M.call("f", M.mi("a")), M.mi("a")))}.`,
      parts: [
        part(`Gathering the ${ml(M.mi("a"))} terms gives ${ml(M.eq(M.row(M.num(a - 1), M.mi("a")), M.mi("t")))}. What is ${ml(M.mi("t"))}?`,
          2, num(-b), `${ml(M.eq(M.row(M.num(a - 1), M.mi("a")), M.num(-b)))}`),
        part(`Now ${ml(M.mi("a"))}.`, 3, num(root), `${ml(M.eq(M.mi("a"), M.num(root)))}`)
      ],
      solution: [
        `f(a) = a means ${a}a ${b < 0 ? "−" : "+"} ${Math.abs(b)} = a.`,
        `Move the a across: ${a - 1}a = ${-b}, so a = ${root}.`
      ],
      selfCheck: () => a * root + b === root ? null : "linear-fixed mismatch"
    };
  }

  // L3 · where the graph meets the axes.
  function linearIntercepts(rng) {
    const a = rng.pick([2, 3, 4, 5, -2, -3, -4, -5]);
    const root = rng.nz(-8, 8);
    const b = -a * root;
    return {
      shape: "linear-intercepts",
      prompt: `The graph of ${ml(fx(M.linear(a, b)))} crosses the axes at two points. Find where.`,
      parts: [
        part(`Where does it cross ${ml(M.mi("Oy"))}? Give the ${ml(M.mi("y"))} value.`, 2, num(b),
          `${ml(M.eq(M.call("f", M.mn(0)), M.num(b)))}, so the point is ${ml(M.row(M.mo("("), M.mn(0), M.mo(","), M.num(b), M.mo(")")))}`),
        part(`Where does it cross ${ml(M.mi("Ox"))}? Give the ${ml(M.mi("x"))} value.`, 3, num(root),
          `${ml(M.eq(M.call("f", M.mi("x")), M.mn(0)))} gives ${ml(M.eq(M.mi("x"), M.num(root)))}`)
      ],
      solution: [
        `On Oy, x = 0: f(0) = ${b}, so the point is (0, ${b}).`,
        `On Ox, y = 0: ${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = 0, so x = ${root} and the point is (${root}, 0).`
      ],
      selfCheck: () => a * root + b === 0 ? null : "intercepts mismatch"
    };
  }

  // L4 · the vertex of a parabola.
  function quadVertex(rng) {
    const a = rng.pick([1, 1, 1, 2, -1, -2]);
    const xv = rng.pick([-3, -2, -1, 1, 2, 3, F(1, 2).value, F(-1, 2).value, F(3, 2).value]);
    const b = Math.round(-2 * a * xv);
    if (!Number.isInteger(b)) return null;
    const c = rng.int(-8, 8);
    const yv = a * xv * xv + b * xv + c;
    if (!looksTidy(F(Math.round(yv * 4), 4), { denoms: [1, 2, 4] })) return null;
    return {
      shape: "quad-vertex",
      prompt: `The function ${ml(fx(M.poly([[a, 2], [b, 1], [c, 0]])))} is given. Find the coordinates of the vertex of its graph.`,
      parts: [
        part(`What is the ${ml(M.mi("x"))} coordinate of the vertex?`, 3, num(xv),
          `${ml(M.eq(M.sub(M.mi("x"), M.mi("V")), M.frac(M.row(M.mo(M.MINUS), M.mi("b")), M.row(M.mn(2), M.mi("a"))), M.num(F(Math.round(xv * 2), 2))))}`),
        part(`And the ${ml(M.mi("y"))} coordinate?`, 2, num(yv),
          `${ml(M.eq(M.sub(M.mi("y"), M.mi("V")), M.num(F(Math.round(yv * 4), 4))))}`)
      ],
      solution: [
        `The vertex sits at x = −b/(2a) = ${-b}/(${2 * a}) = ${xv}.`,
        `Substituting: y = ${a === 1 ? "" : a + "·"}(${xv})² ${b < 0 ? "−" : "+"} ${Math.abs(b)}·(${xv}) ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${yv}.`,
        `Since a = ${a} is ${a > 0 ? "positive, this is the minimum" : "negative, this is the maximum"}.`
      ],
      selfCheck: () => Math.abs(a * xv * xv + b * xv + c - yv) < 1e-9 ? null : "vertex mismatch"
    };
  }

  // L4 · Viète for a quadratic.
  function quadViete(rng) {
    const r1 = rng.nz(-7, 7);
    const r2 = rng.nz(-7, 7);
    if (r1 === r2) return null;
    const b = -(r1 + r2);
    const c = r1 * r2;
    const sum = r1 + r2;
    const squares = r1 * r1 + r2 * r2;
    return {
      shape: "quad-viete",
      prompt: `The equation ${ml(M.eq(M.poly([[1, 2], [b, 1], [c, 0]]), M.mn(0)))} has roots ${ml(M.sub(M.mi("x"), M.mn(1)))} and ${ml(M.sub(M.mi("x"), M.mn(2)))}. Find ${ml(M.row(M.sup(M.sub(M.mi("x"), M.mn(1)), M.mn(2)), M.mo("+"), M.sup(M.sub(M.mi("x"), M.mn(2)), M.mn(2))))} without solving it.`,
      parts: [
        part(`What is ${ml(M.row(M.sub(M.mi("x"), M.mn(1)), M.mo("+"), M.sub(M.mi("x"), M.mn(2))))}?`, 2, num(sum),
          `${ml(M.eq(M.row(M.sub(M.mi("x"), M.mn(1)), M.mo("+"), M.sub(M.mi("x"), M.mn(2))), M.num(sum)))}`),
        part(`Now ${ml(M.row(M.sup(M.sub(M.mi("x"), M.mn(1)), M.mn(2)), M.mo("+"), M.sup(M.sub(M.mi("x"), M.mn(2)), M.mn(2))))}.`,
          3, num(squares), `${ml(M.eq(M.row(M.sup(M.sub(M.mi("x"), M.mn(1)), M.mn(2)), M.mo("+"), M.sup(M.sub(M.mi("x"), M.mn(2)), M.mn(2))), M.num(squares)))}`)
      ],
      solution: [
        `Viète: x₁ + x₂ = −b/a = ${sum} and x₁x₂ = c/a = ${c}.`,
        `x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂ = ${sum}² − 2·(${c}) = ${sum * sum} − ${2 * c} = ${squares}.`,
        `That identity is the whole trick — it turns a question about the roots into arithmetic on the coefficients.`
      ],
      selfCheck: () => r1 * r1 + r2 * r2 === squares && r1 + r2 === sum ? null : "viete mismatch"
    };
  }

  // L4 · find m so that the quadratic has a repeated root.
  function quadEqualRoots(rng) {
    const root = rng.nz(-5, 5);
    const a = rng.pick([1, 1, 2]);
    // a(x − root)² = ax² − 2a·root·x + a·root²  ⇒  b = −2a·root, c = a·root²
    const b = -2 * a * root;
    const c = a * root * root;
    return {
      shape: "quad-equal-roots",
      prompt: `Find the real number ${ml(M.mi("m"))} for which ${ml(M.eq(M.row(M.poly([[a, 2], [b, 1]]), M.mo("+"), M.mi("m")), M.mn(0)))} has two equal real roots, and give that root.`,
      parts: [
        part(`What is ${ml(M.mi("m"))}?`, 3, num(c),
          `${ml(M.eq(M.mi("Δ"), M.mn(0)))} gives ${ml(M.eq(M.mi("m"), M.num(c)))}`),
        part(`What is the repeated root?`, 2, num(root), `${ml(M.eq(M.sub(M.mi("x"), M.mn(1)), M.sub(M.mi("x"), M.mn(2)), M.num(root)))}`)
      ],
      solution: [
        `Two equal roots means Δ = b² − 4ac = 0.`,
        `Here Δ = (${b})² − 4·${a}·m = ${b * b} − ${4 * a}m = 0, so m = ${c}.`,
        `The repeated root is x = −b/(2a) = ${-b}/${2 * a} = ${root}.`
      ],
      selfCheck: () => b * b - 4 * a * c === 0 ? null : "equal-roots mismatch"
    };
  }

  // L5 · a condition on both roots at once — above anything in the corpus.
  function quadRootsCondition(rng) {
    const p = rng.nz(-8, 8);                          // x1·x2 = p
    const m = rng.int(2, 9);                          // x1 + x2 = −m … answer
    const target = m * m - 2 * p;                     // x1² + x2²
    if (m * m - 4 * p < 0) return null;               // must have real roots
    if (Math.abs(target) > 120) return null;
    return {
      shape: "quad-roots-condition",
      prompt: `The equation ${ml(M.eq(M.row(M.sup(M.mi("x"), M.mn(2)), M.mo("+"), M.mi("m"), M.mi("x"), M.mo(p < 0 ? M.MINUS : "+"), M.mn(Math.abs(p))), M.mn(0)))} has real roots ${ml(M.sub(M.mi("x"), M.mn(1)))} and ${ml(M.sub(M.mi("x"), M.mn(2)))} with ${ml(M.eq(M.row(M.sup(M.sub(M.mi("x"), M.mn(1)), M.mn(2)), M.mo("+"), M.sup(M.sub(M.mi("x"), M.mn(2)), M.mn(2))), M.num(target)))}. Find the positive value of ${ml(M.mi("m"))}.`,
      parts: [
        part(`Write ${ml(M.row(M.sup(M.sub(M.mi("x"), M.mn(1)), M.mn(2)), M.mo("+"), M.sup(M.sub(M.mi("x"), M.mn(2)), M.mn(2))))} in terms of ${ml(M.mi("m"))}: it equals ${ml(M.row(M.sup(M.mi("m"), M.mn(2)), M.mo(M.MINUS), M.mi("t")))}. What is ${ml(M.mi("t"))}?`,
          3, num(2 * p), `${ml(M.eq(M.mi("t"), M.row(M.mn(2), M.sub(M.mi("x"), M.mn(1)), M.sub(M.mi("x"), M.mn(2))), M.num(2 * p)))}`),
        part(`Now the positive ${ml(M.mi("m"))}.`, 2, num(m), `${ml(M.eq(M.mi("m"), M.num(m)))}`)
      ],
      solution: [
        `Viète gives x₁ + x₂ = −m and x₁x₂ = ${p}.`,
        `x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂ = m² − ${2 * p}.`,
        `Setting that equal to ${target}: m² = ${target + 2 * p} = ${m * m}, so m = ${m} (taking the positive value).`
      ],
      selfCheck: () => m * m - 2 * p === target ? null : "roots-condition mismatch"
    };
  }

  // L5 · a line touching a parabola.
  function quadTangentLine(rng) {
    // x² + bx + c = mx + n has a double root  ⇔  (b − m)² = 4(c − n)
    const b = rng.int(-4, 4);
    const c = rng.int(-6, 6);
    const half = rng.nz(-4, 4);           // (b − m)/2
    const m = b - 2 * half;
    const n = c - half * half;
    const touchX = -half;
    return {
      shape: "quad-tangent-line",
      prompt: `The line ${ml(M.eq(M.mi("y"), M.linear(m, n)))} touches the parabola ${ml(M.eq(M.mi("y"), M.poly([[1, 2], [b, 1], [c, 0]])))} at exactly one point. Find that point's ${ml(M.mi("x"))} coordinate, and check the discriminant is zero.`,
      parts: [
        part(`Setting them equal gives ${ml(M.eq(M.row(M.sup(M.mi("x"), M.mn(2)), M.mo("+"), M.num(b - m), M.mi("x"), M.mo("+"), M.num(c - n)), M.mn(0)))}. What is its discriminant?`,
          3, num(0), `${ml(M.eq(M.mi("Δ"), M.mn(0)))}`),
        part(`What is the ${ml(M.mi("x"))} coordinate of the point of contact?`, 2, num(touchX),
          `${ml(M.eq(M.mi("x"), M.num(touchX)))}`)
      ],
      solution: [
        `Where they meet, x² ${b < 0 ? "−" : "+"} ${Math.abs(b)}x ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${m}x ${n < 0 ? "−" : "+"} ${Math.abs(n)}.`,
        `Rearranged: x² ${b - m < 0 ? "−" : "+"} ${Math.abs(b - m)}x ${c - n < 0 ? "−" : "+"} ${Math.abs(c - n)} = 0.`,
        `Δ = (${b - m})² − 4·${c - n} = ${(b - m) * (b - m)} − ${4 * (c - n)} = 0, which is exactly what "touches at one point" means.`,
        `The double root is x = −(${b - m})/2 = ${touchX}.`
      ],
      selfCheck: () => (b - m) * (b - m) - 4 * (c - n) === 0 ? null : "tangent-line mismatch"
    };
  }

  // L5 · maximum of a quadratic, in the student's own trade.
  function quadMaxPower(rng) {
    // P(I) = E·I − R·I², maximum at I = E/(2R).
    const R = rng.pick([1, 2, 4, 5]);
    const bestCurrent = rng.pick([1, 2, 3, 4, 5]);
    const E = 2 * R * bestCurrent;
    const maxPower = E * bestCurrent - R * bestCurrent * bestCurrent;
    return {
      shape: "quad-max-power",
      prompt: `A source of ${ml(M.row(M.mn(E), M.mi("V")))} with internal resistance ${ml(M.row(M.mn(R), M.mi("Ω")))} delivers power ${ml(M.eq(M.call("P", M.mi("I")), M.poly([[-R, 2], [E, 1]], "I")))} watts at a current of ${ml(M.mi("I"))} amps. Find the current that gives the most power, and that power.`,
      parts: [
        part(`At what current ${ml(M.mi("I"))} is the power greatest?`, 3, num(bestCurrent),
          `${ml(M.eq(M.mi("I"), M.frac(M.row(M.mo(M.MINUS), M.mi("b")), M.row(M.mn(2), M.mi("a"))), M.num(bestCurrent)))} A`),
        part(`What is that power, in watts?`, 2, num(maxPower), `${maxPower} W`)
      ],
      solution: [
        `P is a quadratic in I with a = −${R} &lt; 0, so its graph is a parabola opening downwards and the vertex is the maximum.`,
        `I = −b/(2a) = −${E}/(2·(−${R})) = ${bestCurrent} A.`,
        `P(${bestCurrent}) = ${E}·${bestCurrent} − ${R}·${bestCurrent}² = ${maxPower} W.`,
        `This is the maximum power transfer result: it happens when the load resistance equals the internal resistance.`
      ],
      selfCheck: () => {
        const test = (i) => E * i - R * i * i;
        return test(bestCurrent) >= test(bestCurrent + 0.1) && test(bestCurrent) >= test(bestCurrent - 0.1)
          ? null : "max-power mismatch";
      }
    };
  }

  /* ====================================================================== */
  /*  equations — Subiectul I.3                                             */
  /* ====================================================================== */

  const equations = {
    id: "equations",
    name: "Exponential, log and root equations",
    blurb: "Solving with the same base, with logarithms, and under a square root.",
    slot: "I.3",
    levels: {
      1: [expSimple, logSimple, expReciprocal],
      2: [expShift, radicalSimple],
      3: [expBothSides, logLinear],
      4: [radicalWithX, logQuadratic],
      5: [expSubstitution, logTwoTerms, expSquaredBase]
    }
  };

  // L1 · a^x = a^k.
  function expSimple(rng) {
    const base = rng.pick([2, 3, 4, 5, 6, 7, 10]);
    const k = rng.int(2, base === 2 ? 8 : base <= 4 ? 5 : 3);
    const value = Math.pow(base, k);
    if (value > 100000) return null;
    return {
      shape: "exp-simple",
      prompt: `Solve ${ml(M.eq(M.sup(M.mn(base), M.mi("x")), M.mn(value)))} over the real numbers.`,
      parts: [
        part(`Write ${ml(M.mn(value))} as a power of ${ml(M.mn(base))}: what is the exponent?`, 2, num(k),
          `${ml(M.eq(M.mn(value), M.sup(M.mn(base), M.mn(k))))}`),
        part(`Now ${ml(M.mi("x"))}.`, 3, num(k), `${ml(M.eq(M.mi("x"), M.num(k)))}`)
      ],
      solution: [
        `${value} = ${base}<sup>${k}</sup>, so the equation is ${base}<sup>x</sup> = ${base}<sup>${k}</sup>.`,
        `The exponential function is one-to-one, so the exponents must match: x = ${k}.`
      ],
      selfCheck: () => Math.pow(base, k) === value ? null : "exp-simple mismatch"
    };
  }

  // L1 · a^x = 1/a^k, where the answer is negative.
  function expReciprocal(rng) {
    const base = rng.pick([2, 3, 4, 5, 10]);
    const k = rng.int(1, base === 2 ? 6 : 4);
    const value = Math.pow(base, k);
    return {
      shape: "exp-reciprocal",
      prompt: `Solve ${ml(M.eq(M.sup(M.mn(base), M.mi("x")), M.frac(M.mn(1), M.mn(value))))} over the real numbers.`,
      parts: [
        part(`Write ${ml(M.frac(M.mn(1), M.mn(value)))} as a power of ${ml(M.mn(base))}: what is the exponent?`,
          3, num(-k), `${ml(M.eq(M.frac(M.mn(1), M.mn(value)), M.sup(M.mn(base), M.num(-k))))}`),
        part(`Now ${ml(M.mi("x"))}.`, 2, num(-k), `${ml(M.eq(M.mi("x"), M.num(-k)))}`)
      ],
      solution: [
        `1/a<sup>k</sup> = a<sup>−k</sup>, and ${value} = ${base}<sup>${k}</sup>, so the right-hand side is ${base}<sup>−${k}</sup>.`,
        `Equal bases means equal exponents: x = ${-k}.`,
        `A negative exponent means "one over" — it never means a negative answer to the power itself.`
      ],
      selfCheck: () => Math.abs(Math.pow(base, -k) - 1 / value) < 1e-12 ? null : "exp-reciprocal mismatch"
    };
  }

  // L1 · log_a x = k.
  function logSimple(rng) {
    const base = rng.pick([2, 3, 4, 5, 10]);
    const k = rng.int(2, base === 2 ? 6 : 4);
    const value = Math.pow(base, k);
    if (value > 100000) return null;
    const logML = base === 10 ? M.lg(M.mi("x")) : M.log(base, M.mi("x"));
    return {
      shape: "log-simple",
      prompt: `Solve ${ml(M.eq(logML, M.mn(k)))} over the real numbers.`,
      parts: [
        part(`Rewriting without the logarithm gives ${ml(M.eq(M.mi("x"), M.sup(M.mn(base), M.mi("t"))))}. What is ${ml(M.mi("t"))}?`,
          2, num(k), `${ml(M.eq(M.mi("t"), M.num(k)))}`),
        part(`Now ${ml(M.mi("x"))}.`, 3, num(value), `${ml(M.eq(M.mi("x"), M.num(value)))}`)
      ],
      solution: [
        `log<sub>${base}</sub> x = ${k} means x = ${base}<sup>${k}</sup>.`,
        `So x = ${value}, and it is positive, so it is allowed.`
      ],
      selfCheck: () => Math.pow(base, k) === value ? null : "log-simple mismatch"
    };
  }

  // L2 · a^(x+c) = a^k.
  function expShift(rng) {
    const base = rng.pick([2, 3, 5]);
    const c = rng.nz(-3, 4);
    const k = rng.int(2, 5);
    const x = k - c;
    const value = Math.pow(base, k);
    if (value > 3000) return null;
    return {
      shape: "exp-shift",
      prompt: `Solve ${ml(M.eq(M.sup(M.mn(base), M.row(M.mi("x"), M.mo(c < 0 ? M.MINUS : "+"), M.mn(Math.abs(c)))), M.mn(value)))} over the real numbers.`,
      parts: [
        part(`Both sides as powers of ${ml(M.mn(base))}: what exponent is on the right?`, 2, num(k),
          `${ml(M.eq(M.mn(value), M.sup(M.mn(base), M.mn(k))))}`),
        part(`Now ${ml(M.mi("x"))}.`, 3, num(x), `${ml(M.eq(M.mi("x"), M.num(x)))}`)
      ],
      solution: [
        `${value} = ${base}<sup>${k}</sup>, so x ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${k}.`,
        `x = ${x}.`
      ],
      selfCheck: () => Math.pow(base, x + c) === value ? null : "exp-shift mismatch"
    };
  }

  // L2 · √(ax + b) = c. Corpus: 2024 v1, 2025 august, 2025 model I.3.
  function radicalSimple(rng) {
    const a = rng.pick([2, 3, 4, 5, -3, -2]);
    const c = rng.int(1, 6);
    const x = rng.nz(-5, 8);
    const b = c * c - a * x;
    if (Math.abs(b) > 40) return null;
    return {
      shape: "radical-simple",
      prompt: `Solve ${ml(M.eq(M.sqrt(M.linear(a, b)), M.mn(c)))} over the real numbers.`,
      parts: [
        part(`Squaring both sides gives ${ml(M.eq(M.linear(a, b), M.mi("t")))}. What is ${ml(M.mi("t"))}?`,
          3, num(c * c), `${ml(M.eq(M.mi("t"), M.mn(c * c)))}`),
        part(`Now ${ml(M.mi("x"))}.`, 2, num(x), `${ml(M.eq(M.mi("x"), M.num(x)))}`)
      ],
      solution: [
        `Square both sides: ${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${c * c}.`,
        `${a}x = ${c * c - b}, so x = ${x}.`,
        `Check it is allowed: the right-hand side ${c} is positive and the inside works out to ${c * c} ≥ 0. ✓`
      ],
      selfCheck: () => Math.abs(Math.sqrt(a * x + b) - c) < 1e-9 ? null : "radical-simple mismatch"
    };
  }

  // L3 · a^(px) = a^(q−x). Corpus: 2025 iunie I.3, 2024 model I.3.
  function expBothSides(rng) {
    const base = rng.pick([2, 3, 5, 7]);
    const p = rng.pick([2, 3]);
    const q = rng.int(2, 9);
    const x = F(q, p + 1);
    if (!looksTidy(x, { denoms: [1, 2, 3, 4] })) return null;
    return {
      shape: "exp-both-sides",
      prompt: `Solve ${ml(M.eq(M.sup(M.mn(base), M.row(M.mn(p), M.mi("x"))), M.sup(M.mn(base), M.row(M.mn(q), M.mo(M.MINUS), M.mi("x")))))} over the real numbers.`,
      parts: [
        part(`Equate the exponents. What does the equation become? Give the value of ${ml(M.row(M.mn(p + 1), M.mi("x")))}.`,
          3, num(q), `${ml(M.eq(M.row(M.mn(p), M.mi("x")), M.row(M.mn(q), M.mo(M.MINUS), M.mi("x"))))}, so ${ml(M.eq(M.row(M.mn(p + 1), M.mi("x")), M.mn(q)))}`),
        part(`Now ${ml(M.mi("x"))}.`, 2, num(x), `${ml(M.eq(M.mi("x"), M.num(x)))}`)
      ],
      solution: [
        `Same base on both sides, so the exponents are equal: ${p}x = ${q} − x.`,
        `${p + 1}x = ${q}, so x = ${ml(M.num(x))}.`
      ],
      selfCheck: () => Math.abs(p * x.value - (q - x.value)) < 1e-9 ? null : "exp-both mismatch"
    };
  }

  // L3 · lg(ax + b) = 1, or log_2 of a linear expression.
  function logLinear(rng) {
    const base = rng.pick([2, 3, 10]);
    const k = base === 10 ? 1 : rng.int(2, 3);
    const target = Math.pow(base, k);
    const a = rng.pick([2, 3, 4, 5]);
    const x = rng.int(1, 12);
    const b = target - a * x;
    if (Math.abs(b) > 30) return null;
    const logML = base === 10 ? M.lg(M.paren(M.linear(a, b))) : M.log(base, M.paren(M.linear(a, b)));
    return {
      shape: "log-linear",
      prompt: `Solve ${ml(M.eq(logML, M.mn(k)))} over the real numbers.`,
      parts: [
        part(`Removing the logarithm gives ${ml(M.eq(M.linear(a, b), M.mi("t")))}. What is ${ml(M.mi("t"))}?`,
          3, num(target), `${ml(M.eq(M.mi("t"), M.sup(M.mn(base), M.mn(k)), M.mn(target)))}`),
        part(`Now ${ml(M.mi("x"))}.`, 2, num(x), `${ml(M.eq(M.mi("x"), M.num(x)))}`)
      ],
      solution: [
        `${base === 10 ? "lg" : "log<sub>" + base + "</sub>"} A = ${k} means A = ${base}<sup>${k}</sup> = ${target}.`,
        `So ${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${target}, giving x = ${x}.`,
        `Check the inside is positive: ${a}·${x} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${target} > 0. ✓`
      ],
      selfCheck: () => a * x + b === target ? null : "log-linear mismatch"
    };
  }

  // L4 · √(ax + b) = x — squaring makes a second root that must be thrown away.
  // Corpus: 2026 model I.3.
  function radicalWithX(rng) {
    // (x − r)(x − s) = x² − ax − b with r > 0 the keeper and s < 0 rejected.
    const r = rng.int(2, 9);
    const s = rng.int(-6, -1);
    const a = r + s;
    const b = -r * s;
    if (a === 0) return null;
    if (a * r + b !== r * r) return null;
    return {
      shape: "radical-with-x",
      prompt: `Solve ${ml(M.eq(M.sqrt(M.linear(a, b)), M.mi("x")))} over the real numbers.`,
      parts: [
        part(`Squaring gives a quadratic with two roots. What is the sum of those two roots?`, 3, num(a),
          `${ml(M.eq(M.row(M.sup(M.mi("x"), M.mn(2)), M.mo(M.MINUS), M.num(a), M.mi("x"), M.mo(M.MINUS), M.num(b)), M.mn(0)))} — the roots are ${r} and ${s}, summing to ${a}`),
        part(`Only one of them solves the original equation. Which?`, 2, num(r),
          `${ml(M.eq(M.mi("x"), M.num(r)))}; ${ml(M.eq(M.mi("x"), M.num(s)))} is rejected`)
      ],
      solution: [
        `Square both sides: ${a < 0 ? "" : ""}${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = x², so x² − ${a}x − ${b} = 0.`,
        `Its roots are x = ${r} and x = ${s}.`,
        `A square root is never negative, so the right-hand side x must satisfy x ≥ 0. That rules out x = ${s}.`,
        `Check x = ${r}: √(${a}·${r} ${b < 0 ? "−" : "+"} ${Math.abs(b)}) = √${r * r} = ${r}. ✓`,
        `The 2p at the end of the barem is for the rejection, not for the algebra.`
      ],
      selfCheck: () => {
        const roots = [r, s];
        const valid = roots.filter((t) => t >= 0 && Math.abs(a * t + b - t * t) < 1e-9);
        return valid.length === 1 && valid[0] === r ? null : "radical-with-x mismatch";
      }
    };
  }

  // L4 · log(x² − bx) = k. Corpus: 2026 simulare I.3.
  //
  // Both roots survive the domain check here — the inside equals the same
  // positive number at each — and that is the point: you cannot know that
  // without doing the check, and the barem pays for doing it.
  function logQuadratic(rng) {
    const base = rng.pick([2, 3, 10]);
    const k = base === 10 ? 1 : rng.int(2, base === 2 ? 5 : 3);
    const product = Math.pow(base, k);
    const factors = [];
    for (let r = 1; r <= product; r += 1) {
      if (product % r === 0) factors.push([r, -product / r]);
    }
    const [r, s] = rng.pick(factors);
    if (r === -s) return null;                    // b = 0 reads oddly
    const b = r + s;
    const inside = M.poly([[1, 2], [-b, 1]]);
    const logML = base === 10 ? M.lg(M.paren(inside)) : M.log(base, M.paren(inside));
    const roots = [r, s].sort((u, v) => u - v);
    return {
      shape: "log-quadratic",
      prompt: `Solve ${ml(M.eq(logML, M.mn(k)))} over the real numbers.`,
      parts: [
        part(`Removing the logarithm gives ${ml(M.eq(inside, M.mi("t")))}. What is ${ml(M.mi("t"))}?`,
          3, num(product), `${ml(M.eq(M.mi("t"), M.sup(M.mn(base), M.mn(k)), M.mn(product)))}`),
        part(`Now the solutions, separated by a comma.`, 2, { type: "set", values: roots },
          `${ml(M.eq(M.mi("x"), M.num(roots[0])))} and ${ml(M.eq(M.mi("x"), M.num(roots[1])))}`)
      ],
      solution: [
        `${base === 10 ? "lg" : "log<sub>" + base + "</sub>"} A = ${k} means A = ${base}<sup>${k}</sup> = ${product}.`,
        `So x² ${-b < 0 ? "−" : "+"} ${Math.abs(b)}x − ${product} = 0, with roots x = ${roots[0]} and x = ${roots[1]}.`,
        `Now check the domain, which is the part the barem pays for: a logarithm needs a positive argument, and at *both* roots the inside is exactly ${product} > 0. So both are genuine solutions.`,
        `Do not assume the negative root dies. Here it does not — you have to look.`
      ],
      selfCheck: () => r * r - b * r === product && s * s - b * s === product ? null : "log-quadratic mismatch"
    };
  }

  // L5 · the same substitution, written with the squared base: 9^x = (3^x)².
  function expSquaredBase(rng) {
    const root = rng.pick([2, 3, 5]);
    const base = root * root;
    const i = rng.int(0, 3);
    const j = rng.int(0, 3);
    if (i === j) return null;
    const t1 = Math.pow(root, i);
    const t2 = Math.pow(root, j);
    const k = t1 + t2;
    const m = t1 * t2;
    const roots = [i, j].sort((a, b) => a - b);
    return {
      shape: "exp-squared-base",
      prompt: `Solve ${ml(M.eq(M.row(M.sup(M.mn(base), M.mi("x")), M.mo(M.MINUS), M.mn(k), M.mo(M.CDOT), M.sup(M.mn(root), M.mi("x")), M.mo("+"), M.mn(m)), M.mn(0)))} over the real numbers.`,
      parts: [
        part(`Why is ${ml(M.sup(M.mn(base), M.mi("x")))} the square of ${ml(M.sup(M.mn(root), M.mi("x")))}? Give ${ml(M.mi("t"))} in ${ml(M.eq(M.sup(M.mn(base), M.mi("x")), M.sup(M.mi("t"), M.mn(2))))} when ${ml(M.eq(M.mi("x"), M.mn(1)))}.`,
          3, num(root), `${ml(M.eq(M.mn(base), M.sup(M.mn(root), M.mn(2))))}, so ${ml(M.eq(M.sup(M.mn(base), M.mi("x")), M.sup(M.paren(M.sup(M.mn(root), M.mi("x"))), M.mn(2))))}`),
        part(`Now the solutions for ${ml(M.mi("x"))}, separated by a comma.`, 2,
          { type: "set", values: roots }, `${ml(M.eq(M.mi("x"), M.mn(roots[0])))} and ${ml(M.eq(M.mi("x"), M.mn(roots[1])))}`)
      ],
      solution: [
        `${base} = ${root}², so ${base}<sup>x</sup> = (${root}²)<sup>x</sup> = (${root}<sup>x</sup>)².`,
        `Put t = ${root}<sup>x</sup>: the equation becomes t² − ${k}t + ${m} = 0, with roots t = ${t1} and t = ${t2}.`,
        `${root}<sup>x</sup> = ${t1} gives x = ${i}; ${root}<sup>x</sup> = ${t2} gives x = ${j}.`,
        `Recognising one base as a power of the other is the whole difficulty — after that it is a quadratic.`
      ],
      selfCheck: () => {
        const test = (x) => Math.pow(base, x) - k * Math.pow(root, x) + m;
        return Math.abs(test(i)) < 1e-9 && Math.abs(test(j)) < 1e-9 ? null : "exp-squared-base mismatch";
      }
    };
  }

  // L5 · substitution: a^(2x) − k·a^x + m = 0.
  function expSubstitution(rng) {
    const base = rng.pick([2, 3, 5]);
    const i = rng.int(0, 4);
    const j = rng.int(0, 4);
    if (i === j) return null;
    if (Math.pow(base, Math.max(i, j)) > 1000) return null;
    const t1 = Math.pow(base, i);
    const t2 = Math.pow(base, j);
    const k = t1 + t2;
    const m = t1 * t2;
    const roots = [i, j].sort((a, b) => a - b);
    return {
      shape: "exp-substitution",
      prompt: `Solve ${ml(M.eq(M.row(M.sup(M.mn(base), M.row(M.mn(2), M.mi("x"))), M.mo(M.MINUS), M.mn(k), M.mo(M.CDOT), M.sup(M.mn(base), M.mi("x")), M.mo("+"), M.mn(m)), M.mn(0)))} over the real numbers.`,
      parts: [
        part(`Put ${ml(M.eq(M.mi("t"), M.sup(M.mn(base), M.mi("x"))))}. The equation becomes ${ml(M.eq(M.row(M.sup(M.mi("t"), M.mn(2)), M.mo(M.MINUS), M.mn(k), M.mi("t"), M.mo("+"), M.mn(m)), M.mn(0)))}. What is the larger root ${ml(M.mi("t"))}?`,
          3, num(Math.max(t1, t2)), `${ml(M.eq(M.mi("t"), M.mn(Math.max(t1, t2))))} and ${ml(M.eq(M.mi("t"), M.mn(Math.min(t1, t2))))}`),
        part(`Now the solutions for ${ml(M.mi("x"))} — give both, separated by a comma.`, 2,
          { type: "set", values: roots }, `${ml(M.eq(M.mi("x"), M.mn(roots[0])))} and ${ml(M.eq(M.mi("x"), M.mn(roots[1])))}`)
      ],
      solution: [
        `${base}<sup>2x</sup> is (${base}<sup>x</sup>)², so with t = ${base}<sup>x</sup> the equation is t² − ${k}t + ${m} = 0.`,
        `Its roots are t = ${t1} and t = ${t2}. Both are positive, so both give a solution — a negative t would have to be thrown away, because ${base}<sup>x</sup> is always positive.`,
        `${base}<sup>x</sup> = ${t1} gives x = ${i}; ${base}<sup>x</sup> = ${t2} gives x = ${j}.`
      ],
      selfCheck: () => {
        const test = (x) => Math.pow(base, 2 * x) - k * Math.pow(base, x) + m;
        return Math.abs(test(i)) < 1e-9 && Math.abs(test(j)) < 1e-9 ? null : "exp-substitution mismatch";
      }
    };
  }

  // L5 · log_a x + log_a (x − c) = k.
  function logTwoTerms(rng) {
    const base = rng.pick([2, 3, 5]);
    const k = rng.int(1, base === 2 ? 5 : 3);
    const product = Math.pow(base, k);
    // x(x − c) = product with integer roots.
    const candidates = [];
    for (let x = 2; x <= 30; x += 1) {
      if (product % x === 0) {
        const c = x - product / x;
        if (c > 0 && c <= 12) candidates.push({ x, c });
      }
    }
    if (!candidates.length) return null;
    const { x, c } = rng.pick(candidates);
    const rejected = -(x - c);
    const logOf = (arg) => M.log(base, arg);
    return {
      shape: "log-two-terms",
      prompt: `Solve ${ml(M.eq(M.row(logOf(M.mi("x")), M.mo("+"), logOf(M.paren(M.linear(1, -c)))), M.mn(k)))} over the real numbers.`,
      parts: [
        part(`Combining the two logarithms gives ${ml(M.eq(M.row(M.mi("x"), M.paren(M.linear(1, -c))), M.mi("t")))}. What is ${ml(M.mi("t"))}?`,
          3, num(product), `${ml(M.eq(M.mi("t"), M.sup(M.mn(base), M.mn(k)), M.mn(product)))}`),
        part(`Only one root is allowed. What is ${ml(M.mi("x"))}?`, 2, num(x), `${ml(M.eq(M.mi("x"), M.num(x)))}`)
      ],
      solution: [
        `log A + log B = log(AB), so log<sub>${base}</sub>[x(x − ${c})] = ${k} and x(x − ${c}) = ${base}<sup>${k}</sup> = ${product}.`,
        `x² − ${c}x − ${product} = 0 has roots x = ${x} and x = ${rejected}.`,
        `Both logarithms need a positive argument, so x > 0 *and* x > ${c}. That leaves only x = ${x}.`,
        `Finding the domain before you start is faster than checking afterwards, and it is what the barem rewards.`
      ],
      selfCheck: () => x * (x - c) === product && x > c ? null : "log-two-terms mismatch"
    };
  }

  /* ====================================================================== */
  /*  probability — Subiectul I.4                                           */
  /* ====================================================================== */

  const probability = {
    id: "probability",
    name: "Probability and counting",
    blurb: "Favourable cases over possible cases, and the counting formulas.",
    slot: "I.4",
    levels: {
      1: [probParity, probThreshold],
      2: [probInequality, probMultiple],
      3: [probDigitSum, probSquare],
      4: [probProductMultiple, combinationEquation],
      5: [probTwoConditions, probChooseTwo]
    }
  };

  const setML = (values) =>
    M.row(M.mi("A"), M.mo("="), M.mo("{"), ...values.flatMap((v, i) => i ? [M.mo(","), M.mn(v)] : [M.mn(v)]), M.mo("}"));

  function probabilityItem(rng, { values, test, describe, shape, hint }) {
    const favourable = values.filter(test);
    if (!favourable.length || favourable.length === values.length) return null;
    const p = F(favourable.length, values.length);
    return {
      shape,
      prompt: `A number ${ml(M.mi("n"))} is chosen at random from the set ${ml(setML(values))}. Find the probability that ${describe}.`,
      parts: [
        part(`How many of the ${values.length} numbers meet that condition?`, 2, num(favourable.length),
          `${favourable.length} favourable case${favourable.length === 1 ? "" : "s"}: ${favourable.join(", ")}`),
        part(`Now the probability.`, 3, num(p),
          `${ml(M.eq(M.mi("p"), M.frac(M.mn(favourable.length), M.mn(values.length)),
            ...(p.d === values.length ? [] : [M.num(p)])))}`)
      ],
      solution: [
        `There are ${values.length} numbers to choose from, so ${values.length} possible cases.`,
        `The favourable ones are ${favourable.join(", ")} — ${favourable.length} of them.${hint ? " " + hint : ""}`,
        `p = favourable / possible = ${favourable.length}/${values.length} = ${ml(M.num(p))}.`
      ],
      selfCheck: () => favourable.length === values.filter(test).length ? null : "probability mismatch"
    };
  }

  // L1 · even or odd.
  function probParity(rng) {
    const start = rng.int(0, 12);
    const count = rng.pick([8, 9, 10, 12]);
    const values = range(start, start + count - 1);
    const wantEven = rng.bool();
    return probabilityItem(rng, {
      shape: "prob-parity",
      values,
      test: (n) => (wantEven ? n % 2 === 0 : n % 2 !== 0),
      describe: `it is ${wantEven ? "even" : "odd"}`
    });
  }

  // L1 · bigger than a threshold.
  function probThreshold(rng) {
    const start = rng.int(1, 8);
    const count = rng.pick([8, 10, 12]);
    const values = range(start, start + count - 1);
    const threshold = rng.int(start + 1, start + count - 2);
    return probabilityItem(rng, {
      shape: "prob-threshold",
      values,
      test: (n) => n > threshold,
      describe: `it is greater than ${threshold}`
    });
  }

  // L2 · an inequality to solve first. Corpus: 2025 iunie I.4.
  function probInequality(rng) {
    const values = range(0, 9);
    const a = rng.int(3, 9);
    const b = rng.int(10, 60);
    const test = (n) => a * n > b;
    return probabilityItem(rng, {
      shape: "prob-inequality",
      values,
      test,
      describe: `it satisfies ${ml(M.gt(M.row(M.mn(a), M.mi("n")), M.mn(b)))}`,
      hint: `The condition is n > ${(b / a).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}.`
    });
  }

  // L2 · a multiple of k.
  function probMultiple(rng) {
    const start = rng.pick([1, 10, 11, 20]);
    const count = rng.pick([10, 12, 15]);
    const values = range(start, start + count - 1);
    const k = rng.pick([2, 3, 4, 5]);
    return probabilityItem(rng, {
      shape: "prob-multiple",
      values,
      test: (n) => n % k === 0,
      describe: `it is a multiple of ${k}`
    });
  }

  // L3 · digit sum. Corpus: 2024 v1 I.4.
  function probDigitSum(rng) {
    const start = rng.pick([10, 11, 20, 21, 30]);
    const values = range(start, start + rng.pick([9, 10, 11]));
    const target = rng.int(3, 11);
    const digitSum = (n) => String(n).split("").reduce((sum, d) => sum + Number(d), 0);
    return probabilityItem(rng, {
      shape: "prob-digit-sum",
      values,
      test: (n) => digitSum(n) === target,
      describe: `the sum of its digits is ${target}`
    });
  }

  // L3 · a perfect square.
  function probSquare(rng) {
    const start = rng.pick([1, 2, 5, 10]);
    const values = range(start, start + rng.pick([11, 14, 19]));
    return probabilityItem(rng, {
      shape: "prob-square",
      values,
      test: (n) => isSquare(n),
      describe: `it is a perfect square`
    });
  }

  // L4 · n(n+1) is a multiple of k. Corpus: 2026 model I.4.
  function probProductMultiple(rng) {
    const start = rng.pick([1, 2, 3]);
    const values = range(start, start + rng.pick([7, 8, 9, 11]));
    const k = rng.pick([4, 6, 10, 12]);
    return probabilityItem(rng, {
      shape: "prob-product-multiple",
      values,
      test: (n) => (n * (n + 1)) % k === 0,
      describe: `the number ${ml(M.row(M.mi("n"), M.paren(M.row(M.mi("n"), M.mo("+"), M.mn(1)))))} is a multiple of ${k}`,
      hint: `Work out n(n+1) for each n rather than looking for a pattern — with ten numbers it is quicker.`
    });
  }

  // L4 · C(n,2) = k solved for n. Corpus: 2025 aprilie simulare II.
  function combinationEquation(rng) {
    const n = rng.int(4, 14);
    const value = n * (n - 1) / 2;
    const combML = M.subsup(M.mi("C"), M.mi("n"), M.mn(2));
    return {
      shape: "combination-equation",
      prompt: `Find the natural number ${ml(M.mi("n"))}, ${ml(M.ge(M.mi("n"), M.mn(2)))}, for which ${ml(M.eq(combML, M.mn(value)))}.`,
      parts: [
        part(`Write ${ml(combML)} out: it equals ${ml(M.frac(M.row(M.mi("n"), M.paren(M.row(M.mi("n"), M.mo(M.MINUS), M.mn(1)))), M.mn(2)))}. What is ${ml(M.row(M.mi("n"), M.paren(M.row(M.mi("n"), M.mo(M.MINUS), M.mn(1)))))}?`,
          3, num(2 * value), `${ml(M.eq(M.row(M.mi("n"), M.paren(M.row(M.mi("n"), M.mo(M.MINUS), M.mn(1)))), M.mn(2 * value)))}`),
        part(`Now ${ml(M.mi("n"))}.`, 2, num(n), `${ml(M.eq(M.mi("n"), M.num(n)))}`)
      ],
      solution: [
        `C(n,2) = n!/(2!(n−2)!) = n(n−1)/2.`,
        `So n(n−1) = ${2 * value}. Two consecutive numbers multiplying to ${2 * value}: n = ${n}.`,
        `Solving the quadratic n² − n − ${2 * value} = 0 gives n = ${n} and n = ${1 - n}; only a natural number is allowed.`
      ],
      selfCheck: () => n * (n - 1) / 2 === value ? null : "combination mismatch"
    };
  }

  // L5 · two conditions at once.
  function probTwoConditions(rng) {
    const start = rng.pick([1, 2, 10]);
    const values = range(start, start + rng.pick([11, 14, 19]));
    const k = rng.pick([2, 3, 4]);
    const threshold = values[Math.floor(values.length / 3)];
    return probabilityItem(rng, {
      shape: "prob-two-conditions",
      values,
      test: (n) => n % k === 0 && n > threshold,
      describe: `it is a multiple of ${k} and greater than ${threshold}`,
      hint: `Both conditions have to hold — count the multiples of ${k} first, then drop the ones that are too small.`
    });
  }

  // L5 · choosing two at once, which needs combinations.
  function probChooseTwo(rng) {
    const total = rng.int(5, 9);
    const special = rng.int(2, total - 2);
    const choose2 = (n) => n * (n - 1) / 2;
    const favourable = choose2(special);
    const possible = choose2(total);
    const p = F(favourable, possible);
    const kind = rng.pick(["red", "working", "even-numbered"]);
    const noun = kind === "red" ? "red balls" : kind === "working" ? "working fuses" : "even-numbered tickets";
    return {
      shape: "prob-choose-two",
      prompt: `A box holds ${total} items, of which ${special} are ${noun}. Two are taken out together, at random. Find the probability that both are ${noun}.`,
      parts: [
        part(`How many ways are there to take two items from ${total}?`, 3, num(possible),
          `${ml(M.eq(M.subsup(M.mi("C"), M.mn(total), M.mn(2)), M.mn(possible)))}`),
        part(`Now the probability that both are ${noun}.`, 2, num(p),
          `${ml(M.eq(M.mi("p"), M.frac(M.mn(favourable), M.mn(possible)), M.num(p)))}`)
      ],
      solution: [
        `Order does not matter, so count combinations: C(${total},2) = ${total}·${total - 1}/2 = ${possible} possible pairs.`,
        `Favourable pairs come from the ${special} ${noun}: C(${special},2) = ${special}·${special - 1}/2 = ${favourable}.`,
        `p = ${favourable}/${possible} = ${ml(M.num(p))}.`
      ],
      selfCheck: () => choose2(special) === favourable && choose2(total) === possible ? null : "choose-two mismatch"
    };
  }

  BAC.bankAlgebra = [functions, equations, probability];
})(typeof window !== "undefined" ? window : globalThis);
