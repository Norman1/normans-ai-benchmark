// Subiectul III: differential and integral calculus.
//
// Every item here carries a numeric self-check — the declared derivative is
// compared against a central difference, and the declared integral against
// Simpson's rule on the same interval. A generator that got its calculus wrong
// fails `node tools/verify.mjs` rather than reaching a student.

(function (global) {
  "use strict";

  const BAC = (global.BAC = global.BAC || {});
  const { Frac, F, looksTidy, M, ml } = BAC.core;
  const { num, part } = BAC.bankHelpers;

  /* --- numeric checks --------------------------------------------------- */

  const derivativeAt = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);

  function simpson(f, a, b, n = 2000) {
    const steps = n % 2 ? n + 1 : n;
    const h = (b - a) / steps;
    let total = f(a) + f(b);
    for (let i = 1; i < steps; i += 1) {
      total += f(a + i * h) * (i % 2 ? 4 : 2);
    }
    return total * h / 3;
  }

  const closeTo = (a, b, tolerance = 1e-4) =>
    Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(b));

  const domainML = (body) => body;
  const openInterval = (lo, hi) => M.row(M.mo("("), lo, M.mo(","), hi, M.mo(")"));
  const POSITIVES = openInterval(M.mn(0), M.INF);

  const defineOn = (domain, body, name = "f") =>
    M.row(M.mi(name), M.mo(":"), domain, M.mo("→"), M.REALS, M.mo(","),
      M.call(name, M.mi("x")), M.mo("="), body);

  const expML = (body) => M.sup(M.e, body);

  /* ====================================================================== */
  /*  derivatives — Subiectul III.1                                         */
  /* ====================================================================== */

  const derivatives = {
    id: "derivatives",
    name: "Derivatives",
    blurb: "Differentiating, tangents, asymptotes, monotonicity and extrema.",
    slot: "III.1",
    levels: {
      1: [polyDerivative, polyDerivativeValue],
      2: [quotientDerivative, expDerivative, lnDerivative],
      3: [tangentLine, horizontalAsymptote, derivativeAsLimit],
      4: [monotonicityCubic, boundOnInterval, convexity],
      5: [parameterExtremum, globalMinimum, lhospital]
    }
  };

  // L1 · differentiate a polynomial.
  function polyDerivative(rng) {
    const a = rng.nz(-4, 5), b = rng.nz(-6, 6), c = rng.nz(-8, 8), d = rng.int(-9, 9);
    const f = (x) => a * x ** 3 + b * x * x + c * x + d;
    const fp = (x) => 3 * a * x * x + 2 * b * x + c;
    const k = rng.nz(-3, 3);
    return {
      shape: "poly-derivative",
      prompt: `The function ${ml(defineOn(M.REALS, M.poly([[a, 3], [b, 2], [c, 1], [d, 0]])))} is given. Find ${ml(M.call("f", M.mi("x"), true))}, then ${ml(M.call("f", M.num(k), true))}.`,
      parts: [
        part(`What is ${ml(M.call("f", M.mi("x"), true))}?`, 3,
          { type: "expr", fn: fp, typed: `${3 * a}x^2+${2 * b}x+${c}`.replace(/\+-/g, "-") },
          `${ml(M.eq(M.call("f", M.mi("x"), true), M.poly([[3 * a, 2], [2 * b, 1], [c, 0]])))}`,
          { placeholder: "for example 3x^2-4x+1" }),
        part(`Now ${ml(M.call("f", M.num(k), true))}.`, 2, num(fp(k)), `${ml(M.eq(M.call("f", M.num(k), true), M.num(fp(k))))}`)
      ],
      solution: [
        `Differentiate term by term: (x<sup>n</sup>)′ = n·x<sup>n−1</sup>, and the constant disappears.`,
        `f′(x) = ${3 * a}x² ${2 * b < 0 ? "−" : "+"} ${Math.abs(2 * b)}x ${c < 0 ? "−" : "+"} ${Math.abs(c)}.`,
        `f′(${k}) = ${fp(k)}.`
      ],
      selfCheck: () => closeTo(derivativeAt(f, 1.3), fp(1.3)) ? null : "poly derivative mismatch"
    };
  }

  // L1 · the value of a derivative at a point.
  function polyDerivativeValue(rng) {
    const a = rng.nz(-5, 6), b = rng.nz(-7, 7), c = rng.int(-9, 9);
    const f = (x) => a * x * x + b * x + c;
    const fp = (x) => 2 * a * x + b;
    const k = rng.nz(-4, 4);
    return {
      shape: "poly-derivative-value",
      prompt: `The function ${ml(defineOn(M.REALS, M.poly([[a, 2], [b, 1], [c, 0]])))} is given. Calculate ${ml(M.call("f", M.num(k), true))}.`,
      parts: [
        part(`What is the derivative of ${ml(M.poly([[a, 2]]))}?`, 2,
          { type: "expr", fn: (x) => 2 * a * x, typed: `${2 * a}x` }, `${ml(M.eq(M.row(M.mo("("), M.poly([[a, 2]]), M.mo(")"), M.mo("′")), M.poly([[2 * a, 1]])))}`,
          { placeholder: "for example 6x" }),
        part(`Now ${ml(M.call("f", M.num(k), true))}.`, 3, num(fp(k)), `${ml(M.eq(M.call("f", M.num(k), true), M.num(fp(k))))}`)
      ],
      solution: [
        `f′(x) = ${2 * a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}.`,
        `f′(${k}) = ${2 * a}·(${k}) ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${fp(k)}.`
      ],
      selfCheck: () => closeTo(derivativeAt(f, k), fp(k)) ? null : "derivative value mismatch"
    };
  }

  // L2 · the quotient rule. Corpus: the a) part of most papers.
  function quotientDerivative(rng) {
    const a = rng.nz(-6, 6);
    const b = rng.nz(-9, 9);
    const d = rng.nz(-5, 5);
    const numerator = a * d - b;                   // f'(x) = (ad − b)/(x + d)²
    if (numerator === 0) return null;
    const f = (x) => (a * x + b) / (x + d);
    const fp = (x) => numerator / (x + d) ** 2;
    const domain = d >= 0
      ? openInterval(M.num(-d), M.INF)
      : openInterval(M.num(-d), M.INF);
    return {
      shape: "quotient-derivative",
      prompt: `The function ${ml(defineOn(domain, M.frac(M.linear(a, b), M.linear(1, d))))} is given. Show that ${ml(M.eq(M.call("f", M.mi("x"), true), M.frac(M.mi("k"), M.sup(M.paren(M.linear(1, d)), M.mn(2)))))} and find ${ml(M.mi("k"))}.`,
      parts: [
        part(`What is ${ml(M.mi("k"))}?`, 3, num(numerator),
          `${ml(M.eq(M.call("f", M.mi("x"), true), M.frac(M.num(numerator), M.sup(M.paren(M.linear(1, d)), M.mn(2)))))}`),
        part(`Now ${ml(M.call("f", M.num(1 - d), true))}.`, 2, num(numerator),
          `${ml(M.eq(M.call("f", M.num(1 - d), true), M.num(numerator)))}`)
      ],
      solution: [
        `Quotient rule: (u/v)′ = (u′v − uv′)/v².`,
        `u = ${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} so u′ = ${a}; v = x ${d < 0 ? "−" : "+"} ${Math.abs(d)} so v′ = 1.`,
        `f′(x) = [${a}(x ${d < 0 ? "−" : "+"} ${Math.abs(d)}) − (${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)})]/(x ${d < 0 ? "−" : "+"} ${Math.abs(d)})² = ${numerator}/(x ${d < 0 ? "−" : "+"} ${Math.abs(d)})².`,
        `The x terms in the numerator always cancel for this shape — if they do not, check the signs.`
      ],
      selfCheck: () => closeTo(derivativeAt(f, 1 - d + 0.7), fp(1 - d + 0.7)) ? null : "quotient derivative mismatch"
    };
  }

  // L2 · a quotient with e^x. Corpus: 2025 iunie III.1.a).
  function expDerivative(rng) {
    const b = rng.nz(-6, 6);
    const f = (x) => (x + b) / Math.exp(x);
    const k = 1 - b;                               // f'(x) = (1 − b − x)/e^x
    const fp = (x) => (k - x) / Math.exp(x);
    return {
      shape: "exp-derivative",
      prompt: `The function ${ml(defineOn(M.REALS, M.frac(M.linear(1, b), expML(M.mi("x")))))} is given. Show that ${ml(M.eq(M.call("f", M.mi("x"), true), M.frac(M.row(M.mi("k"), M.mo(M.MINUS), M.mi("x")), expML(M.mi("x")))))} and find ${ml(M.mi("k"))}.`,
      parts: [
        part(`What is ${ml(M.mi("k"))}?`, 3, num(k),
          `${ml(M.eq(M.call("f", M.mi("x"), true), M.frac(M.row(M.num(k), M.mo(M.MINUS), M.mi("x")), expML(M.mi("x")))))}`),
        part(`Now ${ml(M.call("f", M.mn(0), true))}.`, 2, num(k), `${ml(M.eq(M.call("f", M.mn(0), true), M.num(k)))}`)
      ],
      solution: [
        `Quotient rule with u = x ${b < 0 ? "−" : "+"} ${Math.abs(b)} and v = e<sup>x</sup>, remembering (e<sup>x</sup>)′ = e<sup>x</sup>.`,
        `f′(x) = [1·e<sup>x</sup> − (x ${b < 0 ? "−" : "+"} ${Math.abs(b)})e<sup>x</sup>]/(e<sup>x</sup>)².`,
        `Cancel one e<sup>x</sup> top and bottom: f′(x) = (1 − x ${-b < 0 ? "−" : "+"} ${Math.abs(b)})/e<sup>x</sup> = (${k} − x)/e<sup>x</sup>.`
      ],
      selfCheck: () => closeTo(derivativeAt(f, 0.8), fp(0.8)) ? null : "exp derivative mismatch"
    };
  }

  // L2 · x − a·ln x. Corpus: 2024 v1 III.1.a).
  function lnDerivative(rng) {
    const a = rng.int(2, 6);
    const f = (x) => x - a * Math.log(x);
    const fp = (x) => (x - a) / x;
    return {
      shape: "ln-derivative",
      prompt: `The function ${ml(defineOn(POSITIVES, M.row(M.mi("x"), M.mo(M.MINUS), M.mn(a), M.ln(M.mi("x")))))} is given. Show that ${ml(M.eq(M.call("f", M.mi("x"), true), M.frac(M.row(M.mi("x"), M.mo(M.MINUS), M.mi("k")), M.mi("x"))))} and find ${ml(M.mi("k"))}.`,
      parts: [
        part(`What is ${ml(M.mi("k"))}?`, 3, num(a),
          `${ml(M.eq(M.call("f", M.mi("x"), true), M.row(M.mn(1), M.mo(M.MINUS), M.frac(M.mn(a), M.mi("x"))), M.frac(M.row(M.mi("x"), M.mo(M.MINUS), M.mn(a)), M.mi("x"))))}`),
        part(`Now ${ml(M.call("f", M.mn(1), true))}.`, 2, num(1 - a), `${ml(M.eq(M.call("f", M.mn(1), true), M.num(1 - a)))}`)
      ],
      solution: [
        `(ln x)′ = 1/x, so f′(x) = 1 − ${a}/x.`,
        `Over a common denominator that is (x − ${a})/x.`,
        `f′(1) = 1 − ${a} = ${1 - a}.`
      ],
      selfCheck: () => closeTo(derivativeAt(f, 2.3), fp(2.3)) ? null : "ln derivative mismatch"
    };
  }

  // L3 · the tangent line. Corpus: the b) part of most papers.
  function tangentLine(rng) {
    const a = rng.nz(-3, 4), b = rng.nz(-6, 6), c = rng.int(-8, 8);
    const x0 = rng.int(-2, 3);
    const f = (x) => a * x * x + b * x + c;
    const fp = (x) => 2 * a * x + b;
    const slope = fp(x0);
    const value = f(x0);
    const intercept = value - slope * x0;
    if (Math.abs(intercept) > 60) return null;
    const line = (x) => slope * x + intercept;
    return {
      shape: "tangent-line",
      prompt: `The function ${ml(defineOn(M.REALS, M.poly([[a, 2], [b, 1], [c, 0]])))} is given. Find the equation of the tangent to its graph at the point of abscissa ${ml(M.eq(M.mi("x"), M.num(x0)))}.`,
      parts: [
        part(`What is ${ml(M.call("f", M.num(x0), true))}?`, 2, num(slope), `${ml(M.eq(M.call("f", M.num(x0), true), M.num(slope)))} and ${ml(M.eq(M.call("f", M.num(x0)), M.num(value)))}`),
        part(`Now the equation of the tangent.`, 3,
          { type: "expr", fn: line, typed: `${slope}x+${intercept}`.replace(/\+-/g, "-") },
          `${ml(M.eq(M.mi("y"), M.linear(slope, intercept)))}`, { placeholder: "for example y = 3x - 2" })
      ],
      solution: [
        `The tangent at x = ${x0} is y − f(${x0}) = f′(${x0})(x − ${x0}).`,
        `f(${x0}) = ${value} and f′(x) = ${2 * a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}, so f′(${x0}) = ${slope}.`,
        `y = ${slope}(x − ${x0}) + ${value}, that is y = ${slope}x ${intercept < 0 ? "−" : "+"} ${Math.abs(intercept)}.`
      ],
      selfCheck: () => closeTo(derivativeAt(f, x0), slope) && closeTo(line(x0), f(x0))
        ? null : "tangent mismatch"
    };
  }

  // L3 · a horizontal asymptote. Corpus: 2024 model III.1.b), 2025 specială III.1.b).
  function horizontalAsymptote(rng) {
    const a = rng.nz(-6, 8);
    const c = rng.pick([1, 2, 3, 4]);
    const b = rng.nz(-9, 9);
    const d = rng.nz(-5, 5);
    const limit = F(a, c);
    if (!looksTidy(limit, { denoms: [1, 2, 3, 4] })) return null;
    const f = (x) => (a * x + b) / (c * x + d);
    return {
      shape: "horizontal-asymptote",
      prompt: `The function ${ml(defineOn(openInterval(M.num(-d / c), M.INF), M.frac(M.linear(a, b), M.linear(c, d))))} is given. Find the equation of its horizontal asymptote towards ${ml(M.row(M.mo("+"), M.INF))}.`,
      parts: [
        part(`What is ${ml(M.lim("x", M.row(M.mo("+"), M.INF), M.call("f", M.mi("x"))))}?`, 3, num(limit),
          `${ml(M.eq(M.lim("x", M.row(M.mo("+"), M.INF), M.call("f", M.mi("x"))), M.num(limit)))}`),
        part(`So what is the equation of the asymptote?`, 2,
          { type: "expr", fn: () => limit.value, typed: `${limit.n}/${limit.d}` },
          `${ml(M.eq(M.mi("y"), M.num(limit)))}`, { placeholder: "for example y = 4" })
      ],
      solution: [
        `For a ratio of two first-degree expressions, divide top and bottom by x.`,
        `f(x) = (${BAC.core.T(a)} ${b < 0 ? "−" : "+"} ${Math.abs(b)}/x) / (${c} ${d < 0 ? "−" : "+"} ${Math.abs(d)}/x), and both ${Math.abs(b)}/x and ${Math.abs(d)}/x go to 0.`,
        `The limit is ${BAC.core.T(a)}/${c} = ${ml(M.num(limit))}, so the asymptote is y = ${ml(M.num(limit))} — the ratio of the leading coefficients.`
      ],
      selfCheck: () => closeTo(f(1e7), limit.value, 1e-3) ? null : "asymptote mismatch"
    };
  }

  // L3 · the limit definition of the derivative. Corpus: 2025 aprilie simulare III.1.b).
  function derivativeAsLimit(rng) {
    const a = rng.nz(-4, 5), b = rng.nz(-7, 7), c = rng.int(-6, 6);
    const x0 = rng.nz(-3, 3);
    const f = (x) => a * x * x + b * x + c;
    const fp = (x) => 2 * a * x + b;
    return {
      shape: "derivative-as-limit",
      prompt: `The function ${ml(defineOn(M.REALS, M.poly([[a, 2], [b, 1], [c, 0]])))} is given. Calculate ${ml(M.lim("x", M.num(x0), M.frac(M.row(M.call("f", M.mi("x")), M.mo(M.MINUS), M.call("f", M.num(x0))), M.row(M.mi("x"), M.mo(x0 < 0 ? "+" : M.MINUS), M.mn(Math.abs(x0))))))}.`,
      parts: [
        part(`This limit is a derivative at a point. At which point?`, 2, num(x0), `${ml(M.eq(M.mi("x"), M.num(x0)))}`),
        part(`Now the value of the limit.`, 3, num(fp(x0)), `${ml(M.eq(M.call("f", M.num(x0), true), M.num(fp(x0))))}`)
      ],
      solution: [
        `By definition f′(x₀) = lim<sub>x→x₀</sub> [f(x) − f(x₀)]/(x − x₀), so this limit is f′(${x0}).`,
        `f′(x) = ${2 * a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}, so the limit is ${fp(x0)}.`,
        `Substituting directly would give 0/0 — recognising the definition avoids the work entirely.`
      ],
      selfCheck: () => {
        const h = 1e-6;
        const approx = (f(x0 + h) - f(x0)) / h;
        return closeTo(approx, fp(x0), 1e-3) ? null : "limit definition mismatch";
      }
    };
  }

  // L4 · monotonicity and extrema of a cubic. Corpus: 2026 simulare III.1.c).
  function monotonicityCubic(rng) {
    const k = rng.int(1, 5);
    const a = rng.pick([1, 2]);
    // f(x) = a(x³ − 3k²x)  ⇒  f′ = 3a(x² − k²), turning points at ±k.
    const f = (x) => a * (x ** 3 - 3 * k * k * x);
    const fp = (x) => 3 * a * (x * x - k * k);
    const localMax = f(-k);
    return {
      shape: "monotonicity-cubic",
      prompt: `The function ${ml(defineOn(M.REALS, M.poly([[a, 3], [-3 * a * k * k, 1]])))} is given. Find where its graph turns, and the value at the local maximum.`,
      parts: [
        part(`Solving ${ml(M.eq(M.call("f", M.mi("x"), true), M.mn(0)))} gives two values. What is the positive one?`,
          3, num(k), `${ml(M.eq(M.call("f", M.mi("x"), true), M.poly([[3 * a, 2], [-3 * a * k * k, 0]])))}, so ${ml(M.row(M.mi("x"), M.mo("="), M.mo("±", 'rspace="0"'), M.mn(k)))}`),
        part(`What is the local maximum value of ${ml(M.mi("f"))}?`, 2, num(localMax),
          `${ml(M.eq(M.call("f", M.num(-k)), M.num(localMax)))}`)
      ],
      solution: [
        `f′(x) = ${3 * a}x² − ${3 * a * k * k} = ${3 * a}(x² − ${k * k}), which is zero at x = −${k} and x = ${k}.`,
        `f′ is positive outside [−${k}, ${k}] and negative inside, so f rises to x = −${k}, falls, then rises again.`,
        `The local maximum is therefore at x = −${k}: f(−${k}) = ${localMax}. The local minimum is f(${k}) = ${f(k)}.`
      ],
      selfCheck: () => {
        const nearMax = f(-k) >= f(-k + 0.1) && f(-k) >= f(-k - 0.1);
        return closeTo(derivativeAt(f, -k), 0, 1e-3) && nearMax ? null : "monotonicity mismatch";
      }
    };
  }

  // L4 · bounding a function on an interval. Corpus: 2025 august III.1.c).
  function boundOnInterval(rng) {
    const a = rng.int(1, 5);
    const b = 2 * a;                               // f(x) = ax² + b/x, minimum at x = 1
    const upper = rng.pick([2, 3, 4]);
    const f = (x) => a * x * x + b / x;
    const minimum = a + b;
    const atUpper = a * upper * upper + b / upper;
    if (!Number.isInteger(atUpper)) return null;
    return {
      shape: "bound-on-interval",
      prompt: `The function ${ml(defineOn(POSITIVES, M.row(M.poly([[a, 2]]), M.mo("+"), M.frac(M.mn(b), M.mi("x")))))} is given. Find its smallest value on ${ml(M.interval(M.mn(1), M.mn(upper), false, false))}, and its value at the right-hand end.`,
      parts: [
        part(`Where is the minimum? Give the ${ml(M.mi("x"))}.`, 3, num(1),
          `${ml(M.eq(M.call("f", M.mi("x"), true), M.row(M.mn(2 * a), M.mi("x"), M.mo(M.MINUS), M.frac(M.mn(b), M.sup(M.mi("x"), M.mn(2))))))} is zero at ${ml(M.eq(M.mi("x"), M.mn(1)))}`),
        part(`What is ${ml(M.call("f", M.num(upper)))}?`, 2, num(atUpper), `${ml(M.eq(M.call("f", M.num(upper)), M.num(atUpper)))}`)
      ],
      solution: [
        `f′(x) = ${2 * a}x − ${b}/x² = (${2 * a}x³ − ${b})/x², which is zero when x³ = ${b}/${2 * a} = 1, that is x = 1.`,
        `f′ is negative before 1 and positive after, so x = 1 is a minimum: f(1) = ${a} + ${b} = ${minimum}.`,
        `At the other end f(${upper}) = ${a}·${upper * upper} + ${b}/${upper} = ${atUpper}.`,
        `So on [1, ${upper}] the values run from ${minimum} up to ${atUpper} — which is exactly how the exam asks you to prove a two-sided inequality.`
      ],
      selfCheck: () => {
        const samples = [1, 1.3, 2, upper];
        const allAbove = samples.every((x) => f(x) >= minimum - 1e-9);
        return closeTo(derivativeAt(f, 1), 0, 1e-3) && allAbove ? null : "bound mismatch";
      }
    };
  }

  // L4 · convexity from the second derivative. Corpus: 2025 model III.1.c).
  function convexity(rng) {
    const c = rng.int(1, 5);
    const a = rng.nz(1, 6);
    const b = rng.nz(-9, 9);
    const first = a * (-c) - b;                    // f′ = (−ac − b)/(x − c)²
    if (first >= 0) return null;                   // want f″ > 0 on (c, ∞)
    const second = -2 * first;
    const f = (x) => (a * x + b) / (x - c);
    const fpp = (x) => second / (x - c) ** 3;
    return {
      shape: "convexity",
      prompt: `The function ${ml(defineOn(openInterval(M.mn(c), M.INF), M.frac(M.linear(a, b), M.linear(1, -c))))} is given. Show that it is convex, by finding ${ml(M.mi("k"))} in ${ml(M.eq(M.row(M.call("f", M.mi("x"), true), M.mo("′")), M.frac(M.mi("k"), M.sup(M.paren(M.linear(1, -c)), M.mn(3)))))}.`,
      parts: [
        part(`First, ${ml(M.eq(M.call("f", M.mi("x"), true), M.frac(M.mi("t"), M.sup(M.paren(M.linear(1, -c)), M.mn(2)))))}. What is ${ml(M.mi("t"))}?`,
          3, num(first), `${ml(M.eq(M.mi("t"), M.num(first)))}`),
        part(`Now ${ml(M.mi("k"))}.`, 2, num(second), `${ml(M.eq(M.mi("k"), M.num(second)))}, which is positive, so ${ml(M.mi("f"))} is convex`)
      ],
      solution: [
        `f′(x) = [${a}(x − ${c}) − (${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)})]/(x − ${c})² = ${first}/(x − ${c})².`,
        `Differentiating again: f″(x) = ${first}·[−2(x − ${c})]/(x − ${c})⁴ = ${second}/(x − ${c})³.`,
        `On (${c}, ∞) the bracket (x − ${c}) is positive, so f″(x) > 0 and the graph is convex.`,
        `Convex means f″ ≥ 0 — "holds water". The sign of the numerator alone decides it here.`
      ],
      selfCheck: () => {
        const x = c + 1.7;
        const numericSecond = (f(x + 1e-3) - 2 * f(x) + f(x - 1e-3)) / 1e-6;
        return closeTo(numericSecond, fpp(x), 1e-2) && second > 0 ? null : "convexity mismatch";
      }
    };
  }

  // L5 · a parameter that puts the extremum where you want it.
  function parameterExtremum(rng) {
    const x0 = rng.nz(-3, 3);
    const b = rng.nz(-9, 9);
    // f(x) = x³ + a x² + b x, f′(x0) = 0  ⇒  a = −(3x0² + b)/(2x0)
    const a = F(-(3 * x0 * x0 + b), 2 * x0);
    if (!looksTidy(a, { denoms: [1, 2, 3, 4, 6] })) return null;
    const f = (x) => x ** 3 + a.value * x * x + b * x;
    const value = f(x0);
    if (!looksTidy(F(Math.round(value * 12), 12), { denoms: [1, 2, 3, 4, 6, 12] })) return null;
    return {
      shape: "parameter-extremum",
      prompt: `The function ${ml(defineOn(M.REALS, M.row(M.sup(M.mi("x"), M.mn(3)), M.mo("+"), M.mi("a"), M.sup(M.mi("x"), M.mn(2)), M.mo(b < 0 ? M.MINUS : "+"), M.mn(Math.abs(b)), M.mi("x"))))} is given, where ${ml(M.mi("a"))} is a real number. Find ${ml(M.mi("a"))} so that ${ml(M.mi("f"))} has an extremum at ${ml(M.eq(M.mi("x"), M.num(x0)))}.`,
      parts: [
        part(`What condition must hold at an extremum? Give the value of ${ml(M.call("f", M.num(x0), true))}.`,
          3, num(0), `${ml(M.eq(M.call("f", M.num(x0), true), M.mn(0)))}`),
        part(`Now ${ml(M.mi("a"))}.`, 2, num(a), `${ml(M.eq(M.mi("a"), M.num(a)))}`)
      ],
      solution: [
        `At an extremum of a differentiable function the derivative is zero.`,
        `f′(x) = 3x² + 2ax ${b < 0 ? "−" : "+"} ${Math.abs(b)}, so f′(${x0}) = ${3 * x0 * x0} + ${2 * x0}a ${b < 0 ? "−" : "+"} ${Math.abs(b)} = 0.`,
        `${2 * x0}a = ${-(3 * x0 * x0 + b)}, giving a = ${ml(M.num(a))}.`,
        `Strictly, f′ = 0 only makes x₀ a *candidate*; here the derivative does change sign, so it really is an extremum.`
      ],
      selfCheck: () => closeTo(derivativeAt(f, x0), 0, 1e-3) ? null : "parameter extremum mismatch"
    };
  }

  // L5 · a global minimum on (0, ∞), which is how inequalities get proved.
  function globalMinimum(rng) {
    const root = rng.int(2, 7);
    const a = root * root;                        // f(x) = x + a/x, minimum 2√a at x = √a
    const f = (x) => x + a / x;
    const minimum = 2 * root;
    return {
      shape: "global-minimum",
      prompt: `The function ${ml(defineOn(POSITIVES, M.row(M.mi("x"), M.mo("+"), M.frac(M.mn(a), M.mi("x")))))} is given. Show that ${ml(M.ge(M.call("f", M.mi("x")), M.mn(minimum)))} for every ${ml(M.gt(M.mi("x"), M.mn(0)))}.`,
      parts: [
        part(`Where is the minimum? Give the ${ml(M.mi("x"))}.`, 3, num(root),
          `${ml(M.eq(M.call("f", M.mi("x"), true), M.row(M.mn(1), M.mo(M.MINUS), M.frac(M.mn(a), M.sup(M.mi("x"), M.mn(2))))))} is zero at ${ml(M.eq(M.mi("x"), M.mn(root)))}`),
        part(`What is the minimum value?`, 2, num(minimum), `${ml(M.eq(M.call("f", M.mn(root)), M.mn(minimum)))}`)
      ],
      solution: [
        `f′(x) = 1 − ${a}/x² = (x² − ${a})/x². On (0, ∞) this is zero only at x = ${root}.`,
        `f′ &lt; 0 for x &lt; ${root} and f′ &gt; 0 for x &gt; ${root}, so f falls then rises: x = ${root} is a global minimum.`,
        `f(${root}) = ${root} + ${a}/${root} = ${minimum}, so f(x) ≥ ${minimum} everywhere on (0, ∞).`,
        `Proving an inequality by finding the extreme value is the standard Subiectul III.1.c) move.`
      ],
      selfCheck: () => {
        const samples = [0.4, 1, root, root + 2, 20];
        return samples.every((x) => f(x) >= minimum - 1e-9) && closeTo(f(root), minimum)
          ? null : "global minimum mismatch";
      }
    };
  }

  // L5 · l'Hospital on a 0/0 limit.
  function lhospital(rng) {
    const n = rng.int(2, 4);
    const x0 = rng.pick([1, 2]);
    const k = Math.pow(x0, n);
    const f = (x) => (x ** n - k) / (x - x0);
    const limit = n * Math.pow(x0, n - 1);
    return {
      shape: "lhospital",
      prompt: `Calculate ${ml(M.lim("x", M.num(x0), M.frac(M.row(M.sup(M.mi("x"), M.mn(n)), M.mo(M.MINUS), M.mn(k)), M.row(M.mi("x"), M.mo(M.MINUS), M.mn(x0)))))}.`,
      parts: [
        part(`Substituting ${ml(M.eq(M.mi("x"), M.num(x0)))} gives ${ml(M.frac(M.mn(0), M.mn(0)))}. What is the derivative of the numerator?`,
          3, { type: "expr", fn: (x) => n * x ** (n - 1), typed: `${n}x^${n - 1}` },
          `${ml(M.eq(M.row(M.mo("("), M.sup(M.mi("x"), M.mn(n)), M.mo(M.MINUS), M.mn(k), M.mo(")"), M.mo("′")), M.row(M.mn(n), M.sup(M.mi("x"), M.mn(n - 1)))))}`,
          { placeholder: "for example 3x^2" }),
        part(`Now the limit.`, 2, num(limit), `the limit is ${limit}`)
      ],
      solution: [
        `Both top and bottom go to 0, so l'Hospital applies: differentiate each separately.`,
        `Top: ${n}x<sup>${n - 1}</sup>. Bottom: 1.`,
        `The limit is ${n}·${x0}<sup>${n - 1}</sup> = ${limit}.`,
        `This is also f′(${x0}) for f(x) = x<sup>${n}</sup> — the same answer by the definition of the derivative.`
      ],
      selfCheck: () => closeTo(f(x0 + 1e-6), limit, 1e-3) ? null : "lhospital mismatch"
    };
  }

  /* ====================================================================== */
  /*  integrals — Subiectul III.2                                           */
  /* ====================================================================== */

  const integrals = {
    id: "integrals",
    name: "Integrals",
    blurb: "Antiderivatives, definite integrals, areas and volumes.",
    slot: "III.2",
    levels: {
      1: [polyIntegral, linearIntegral],
      2: [differenceIntegral, antiderivativeSimple],
      3: [logIntegral, antiderivativeCondition],
      4: [solveForLimit, areaUnderCurve, volumeOfRevolution],
      5: [byPartsExp, byPartsLog, areaBetween]
    }
  };

  const integralOf = (lo, hi, body) => M.integral(M.num(lo), M.num(hi), body);

  // L1 · a polynomial over [0, n].
  function polyIntegral(rng) {
    const a = rng.pick([3, 6, 9, 12]);
    const b = rng.pick([2, 4, 6, 8, -2, -4]);
    const c = rng.int(-5, 5);
    const n = rng.int(1, 3);
    const value = a * n ** 3 / 3 + b * n * n / 2 + c * n;
    if (!Number.isInteger(value) || Math.abs(value) > 200) return null;
    return {
      shape: "poly-integral",
      prompt: `Calculate ${ml(integralOf(0, n, M.paren(M.poly([[a, 2], [b, 1], [c, 0]]))))}.`,
      parts: [
        part(`What is an antiderivative of ${ml(M.poly([[a, 2], [b, 1], [c, 0]]))}?`, 3,
          { type: "expr", fn: (x) => a * x ** 3 / 3 + b * x * x / 2 + c * x, typed: `${a / 3}x^3+${b / 2}x^2+${c}x`.replace(/\+-/g, "-") },
          `${ml(M.poly([[a / 3, 3], [b / 2, 2], [c, 1]]))}`, { placeholder: "for example x^3+2x^2-x" }),
        part(`Now the value of the integral.`, 2, num(value), `the integral is ${value}`)
      ],
      solution: [
        `Integrate term by term: x<sup>n</sup> becomes x<sup>n+1</sup>/(n+1).`,
        `An antiderivative is F(x) = ${a / 3}x³ ${b / 2 < 0 ? "−" : "+"} ${Math.abs(b / 2)}x² ${c < 0 ? "−" : "+"} ${Math.abs(c)}x.`,
        `The integral is F(${n}) − F(0) = ${value} − 0 = ${value}.`
      ],
      selfCheck: () => closeTo(simpson((x) => a * x * x + b * x + c, 0, n), value) ? null : "poly integral mismatch"
    };
  }

  // L1 · a first-degree integrand.
  function linearIntegral(rng) {
    const a = rng.pick([2, 4, 6, -2, -4]);
    const b = rng.int(-6, 6);
    const lo = rng.int(0, 2);
    const hi = lo + rng.int(1, 3);
    const value = a * (hi * hi - lo * lo) / 2 + b * (hi - lo);
    if (!Number.isInteger(value)) return null;
    return {
      shape: "linear-integral",
      prompt: `Calculate ${ml(integralOf(lo, hi, M.paren(M.linear(a, b))))}.`,
      parts: [
        part(`What is an antiderivative of ${ml(M.linear(a, b))}?`, 2,
          { type: "expr", fn: (x) => a * x * x / 2 + b * x, typed: `${a / 2}x^2+${b}x`.replace(/\+-/g, "-") },
          `${ml(M.poly([[a / 2, 2], [b, 1]]))}`, { placeholder: "for example x^2+3x" }),
        part(`Now the value of the integral.`, 3, num(value), `the integral is ${value}`)
      ],
      solution: [
        `F(x) = ${a / 2}x² ${b < 0 ? "−" : "+"} ${Math.abs(b)}x.`,
        `The integral is F(${hi}) − F(${lo}) = ${a / 2 * hi * hi + b * hi} − ${a / 2 * lo * lo + b * lo} = ${value}.`
      ],
      selfCheck: () => closeTo(simpson((x) => a * x + b, lo, hi), value) ? null : "linear integral mismatch"
    };
  }

  // L2 · subtract most of the integrand away first. Corpus: every III.2.a).
  function differenceIntegral(rng) {
    const p = rng.pick([2, 4, 6, 8, -2, -4]);
    const q = rng.int(-6, 8);
    const r = rng.int(-8, 8);
    const n = rng.int(1, 3);
    const value = p * n * n / 2 + q * n;
    if (!Number.isInteger(value)) return null;
    const fBody = M.poly([[1, 2], [p, 1], [q, 0]]);
    const subtracted = M.poly([[1, 2], [0, 1], [-r, 0]]);
    return {
      shape: "difference-integral",
      prompt: `The function ${ml(defineOn(M.REALS, fBody))} is given. Calculate ${ml(integralOf(0, n, M.paren(M.row(M.call("f", M.mi("x")), M.mo(M.MINUS), M.sup(M.mi("x"), M.mn(2))))))}.`,
      parts: [
        part(`What is ${ml(M.row(M.call("f", M.mi("x")), M.mo(M.MINUS), M.sup(M.mi("x"), M.mn(2))))}?`, 3,
          { type: "expr", fn: (x) => p * x + q, typed: `${p}x+${q}`.replace(/\+-/g, "-") },
          `${ml(M.linear(p, q))}`, { placeholder: "for example 4x-1" }),
        part(`Now the value of the integral.`, 2, num(value), `the integral is ${value}`)
      ],
      solution: [
        `f(x) − x² = ${p}x ${q < 0 ? "−" : "+"} ${Math.abs(q)} — the awkward part cancels, which is the whole point of how the question is set.`,
        `An antiderivative is ${p / 2}x² ${q < 0 ? "−" : "+"} ${Math.abs(q)}x.`,
        `Between 0 and ${n} that gives ${value}.`
      ],
      selfCheck: () => closeTo(simpson((x) => p * x + q, 0, n), value) ? null : "difference integral mismatch"
    };
  }

  // L2 · a straightforward antiderivative.
  function antiderivativeSimple(rng) {
    const a = rng.pick([2, 3, 4, 6]);
    const b = rng.int(-5, 5);
    const k = rng.int(-6, 6);
    const F = (x) => a * x * x / 2 + b * x;
    return {
      shape: "antiderivative-simple",
      prompt: `Find the antiderivative ${ml(M.mi("F"))} of ${ml(defineOn(M.REALS, M.linear(a, b)))} for which ${ml(M.eq(M.call("F", M.mn(0)), M.num(k)))}.`,
      parts: [
        part(`What is the general antiderivative, apart from the constant?`, 3,
          { type: "expr", fn: F, typed: `${a / 2}x^2+${b}x`.replace(/\+-/g, "-") },
          `${ml(M.poly([[a / 2, 2], [b, 1]]))}`, { placeholder: "for example x^2+3x" }),
        part(`What is the constant?`, 2, num(k), `${ml(M.eq(M.mi("C"), M.num(k)))}`)
      ],
      solution: [
        `Every antiderivative is F(x) = ${a / 2}x² ${b < 0 ? "−" : "+"} ${Math.abs(b)}x + C.`,
        `F(0) = C, and we need F(0) = ${k}, so C = ${k}.`,
        `F(x) = ${a / 2}x² ${b < 0 ? "−" : "+"} ${Math.abs(b)}x ${k < 0 ? "−" : "+"} ${Math.abs(k)}.`
      ],
      selfCheck: () => closeTo(derivativeAt(F, 1.4), a * 1.4 + b) ? null : "antiderivative mismatch"
    };
  }

  // L3 · an integral that produces a logarithm. Corpus: every III.2.b).
  function logIntegral(rng) {
    const k = rng.pick([1, 2, 3, 4, 5, 8]);
    const ratio = rng.pick([2, 3, 4, 5, 9]);
    const upperSquared = k * (ratio - 1);
    const n = Math.sqrt(upperSquared);
    if (!Number.isInteger(n) || n < 1 || n > 12) return null;
    const f = (x) => (2 * x) / (x * x + k);
    return {
      shape: "log-integral",
      prompt: `Show that ${ml(integralOf(0, n, M.frac(M.row(M.mn(2), M.mi("x")), M.row(M.sup(M.mi("x"), M.mn(2)), M.mo("+"), M.mn(k)))))} is equal to ${ml(M.ln(M.mi("t")))}, and find ${ml(M.mi("t"))}.`,
      parts: [
        part(`The top is the derivative of the bottom. What is the bottom worth at ${ml(M.eq(M.mi("x"), M.mn(n)))}?`,
          3, num(n * n + k), `${ml(M.eq(M.row(M.sup(M.mn(n), M.mn(2)), M.mo("+"), M.mn(k)), M.mn(n * n + k)))}`),
        part(`Now ${ml(M.mi("t"))}.`, 2, num(ratio), `${ml(M.eq(M.mi("t"), M.num(ratio)))}`)
      ],
      solution: [
        `The numerator 2x is exactly the derivative of x² + ${k}, so the integrand is u′/u and integrates to ln u.`,
        `∫ = ln(x² + ${k}) between 0 and ${n} = ln ${n * n + k} − ln ${k}.`,
        `ln ${n * n + k} − ln ${k} = ln(${n * n + k}/${k}) = ln ${ratio}.`,
        `Spotting u′/u is what turns this from a hard integral into a one-liner.`
      ],
      selfCheck: () => closeTo(simpson(f, 0, n), Math.log(ratio)) ? null : "log integral mismatch"
    };
  }

  // L3 · an antiderivative through a given point. Corpus: 2026 simulare III.2.b).
  function antiderivativeCondition(rng) {
    const a = rng.pick([3, 6, 9]);
    const b = rng.pick([2, 4, 6, -2, -4]);
    const c = rng.int(-5, 5);
    const x0 = rng.int(1, 3);
    const target = rng.int(-10, 20);
    const base = (x) => a * x ** 3 / 3 + b * x * x / 2 + c * x;
    const constant = target - base(x0);
    if (!Number.isInteger(constant) || Math.abs(constant) > 200) return null;
    const F = (x) => base(x) + constant;
    return {
      shape: "antiderivative-condition",
      prompt: `Find the antiderivative ${ml(M.mi("F"))} of ${ml(defineOn(M.REALS, M.poly([[a, 2], [b, 1], [c, 0]])))} for which ${ml(M.eq(M.call("F", M.num(x0)), M.num(target)))}.`,
      parts: [
        part(`Ignoring the constant, what is the antiderivative at ${ml(M.eq(M.mi("x"), M.num(x0)))}?`,
          3, num(base(x0)), `${ml(M.eq(M.mi("F"), M.row(M.poly([[a / 3, 3], [b / 2, 2], [c, 1]]), M.mo("+"), M.mi("C"))))} gives ${base(x0)} + C`),
        part(`Now the constant ${ml(M.mi("C"))}.`, 2, num(constant), `${ml(M.eq(M.mi("C"), M.num(constant)))}`)
      ],
      solution: [
        `F(x) = ${a / 3}x³ ${b / 2 < 0 ? "−" : "+"} ${Math.abs(b / 2)}x² ${c < 0 ? "−" : "+"} ${Math.abs(c)}x + C.`,
        `F(${x0}) = ${base(x0)} + C = ${target}, so C = ${constant}.`,
        `The condition is what picks one antiderivative out of the infinitely many.`
      ],
      selfCheck: () => closeTo(F(x0), target) && closeTo(derivativeAt(F, 1.7), a * 1.7 * 1.7 + b * 1.7 + c)
        ? null : "antiderivative condition mismatch"
    };
  }

  // L4 · the upper limit is the unknown. Corpus: 2025 iunie III.2.c).
  function solveForLimit(rng) {
    const p = rng.pick([2, 4, 6]);
    const q = rng.int(-4, 6);
    const a = rng.int(1, 5);
    const value = p * a * a / 2 + q * a;
    if (!Number.isInteger(value)) return null;
    // The quadratic (p/2)t² + qt − value = 0 must have exactly one positive
    // root, and the other one should be presentable when it is quoted.
    const other = F(-2 * value, p * a);
    if (other.value >= 0) return null;
    if (!looksTidy(other, { denoms: [1, 2, 3, 4, 5, 6] })) return null;
    return {
      shape: "solve-for-limit",
      prompt: `Find ${ml(M.in(M.mi("a"), openInterval(M.mn(0), M.INF)))} for which ${ml(M.eq(M.integral(M.mn(0), M.mi("a"), M.paren(M.linear(p, q))), M.num(value)))}.`,
      parts: [
        part(`Work out the integral in terms of ${ml(M.mi("a"))}. What is the coefficient of ${ml(M.sup(M.mi("a"), M.mn(2)))}?`,
          3, num(p / 2), `${ml(M.eq(M.integral(M.mn(0), M.mi("a"), M.paren(M.linear(p, q))), M.poly([[p / 2, 2], [q, 1]], "a")))}`),
        part(`Now ${ml(M.mi("a"))}.`, 2, num(a), `${ml(M.eq(M.mi("a"), M.num(a)))}`)
      ],
      solution: [
        `∫₀^a (${BAC.core.coef(p, "x")} ${q < 0 ? "−" : "+"} ${Math.abs(q)}) dx = ${BAC.core.coef(p / 2, "a²")} ${q < 0 ? "−" : "+"} ${Math.abs(q)}a.`,
        `Setting that equal to ${value}: ${BAC.core.coef(p / 2, "a²")} ${q < 0 ? "−" : "+"} ${Math.abs(q)}a − ${value} = 0.`,
        `The roots are a = ${a} and a = ${ml(M.num(other))}; only a = ${a} is positive, as required.`
      ],
      selfCheck: () => closeTo(simpson((x) => p * x + q, 0, a), value) ? null : "solve-for-limit mismatch"
    };
  }

  // L4 · the area under a curve.
  function areaUnderCurve(rng) {
    const a = rng.pick([3, 6]);
    const b = rng.int(0, 6);
    const c = rng.int(0, 6);
    const lo = rng.int(1, 2);
    const hi = lo + rng.int(1, 3);
    const area = a * (hi ** 3 - lo ** 3) / 3 + b * (hi * hi - lo * lo) / 2 + c * (hi - lo);
    if (!Number.isInteger(area) || area > 300) return null;
    return {
      shape: "area-under-curve",
      prompt: `The function ${ml(defineOn(M.REALS, M.poly([[a, 2], [b, 1], [c, 0]])))} is given, and it is positive on ${ml(M.interval(M.num(lo), M.num(hi), false, false))}. Find the area between its graph, the axis ${ml(M.mi("Ox"))} and the lines ${ml(M.eq(M.mi("x"), M.num(lo)))} and ${ml(M.eq(M.mi("x"), M.num(hi)))}.`,
      parts: [
        part(`Which integral gives the area? Give its value at the upper limit, ${ml(M.call("F", M.num(hi)))}, taking ${ml(M.eq(M.call("F", M.mn(0)), M.mn(0)))}.`,
          3, num(a * hi ** 3 / 3 + b * hi * hi / 2 + c * hi),
          `${ml(M.eq(M.call("F", M.mi("x")), M.poly([[a / 3, 3], [b / 2, 2], [c, 1]])))}`),
        part(`Now the area.`, 2, num(area), `the area is ${area}`)
      ],
      solution: [
        `Where f is positive, the area between the graph and Ox is ∫ f(x) dx over the interval.`,
        `F(x) = ${BAC.core.coef(a / 3, "x³")}${b === 0 ? "" : (b / 2 < 0 ? " − " : " + ") + BAC.core.coef(Math.abs(b / 2), "x²")}${c === 0 ? "" : (c < 0 ? " − " : " + ") + BAC.core.coef(Math.abs(c), "x")}.`,
        `Area = F(${hi}) − F(${lo}) = ${area}.`
      ],
      selfCheck: () => closeTo(simpson((x) => a * x * x + b * x + c, lo, hi), area) ? null : "area mismatch"
    };
  }

  // L4 · a volume of revolution, reported as a coefficient. Corpus: 2025 specială III.2.c).
  function volumeOfRevolution(rng) {
    const k = rng.int(2, 9);
    const c = rng.int(1, 4);
    const ratio = rng.pick([2, 3, 4]);
    const lo = 0;
    const hi = c * (ratio - 1);
    if (hi < 1 || hi > 20) return null;
    // g(x) = √(k/(x + c)) ⇒ V = π∫ k/(x+c) dx = πk·ln((hi+c)/c) = πk ln ratio
    const g = (x) => Math.sqrt(k / (x + c));
    return {
      shape: "volume-of-revolution",
      prompt: `The function ${ml(defineOn(M.bracket(M.row(M.mn(lo), M.mo(","), M.mn(hi))), M.sqrt(M.frac(M.mn(k), M.linear(1, c))), "g"))} is given. Its graph is rotated about ${ml(M.mi("Ox"))}. The volume of the solid is ${ml(M.row(M.mi("a"), M.pi, M.ln(M.mn(ratio))))}. Find ${ml(M.mi("a"))}.`,
      parts: [
        part(`What is ${ml(M.sup(M.call("g", M.mi("x")), M.mn(2)))}?`, 3,
          { type: "expr", fn: (x) => k / (x + c), typed: `${k}/(x+${c})` },
          `${ml(M.eq(M.sup(M.call("g", M.mi("x")), M.mn(2)), M.frac(M.mn(k), M.linear(1, c))))}`,
          { placeholder: "for example 5/(x+2)" }),
        part(`Now ${ml(M.mi("a"))}.`, 2, num(k), `${ml(M.eq(M.mi("a"), M.mn(k)))}`)
      ],
      solution: [
        `V = π∫ g²(x) dx over [${lo}, ${hi}], and g²(x) = ${k}/(x + ${c}).`,
        `∫ ${k}/(x + ${c}) dx = ${k}·ln(x + ${c}), so V = π·${k}·[ln ${hi + c} − ln ${c}] = π·${k}·ln ${ratio}.`,
        `So a = ${k}. Squaring first is what makes the root disappear — that is why volume questions are set with a square root in them.`
      ],
      selfCheck: () => {
        const volume = Math.PI * simpson((x) => g(x) ** 2, lo, hi);
        return closeTo(volume, k * Math.PI * Math.log(ratio), 1e-3) ? null : "volume mismatch";
      }
    };
  }

  // L5 · integration by parts with an exponential.
  function byPartsExp(rng) {
    const n = rng.int(1, 3);
    const a = rng.int(1, 5);
    const f = (x) => a * x * Math.exp(x);
    // ∫₀ⁿ a·x e^x dx = a[(n − 1)e^n + 1]
    const value = a * (Math.exp(n) * (n - 1) + 1);
    const typedAnswer = n === 1 ? `${a}` : `${a * (n - 1)}e^${n}+${a}`;
    return {
      shape: "by-parts-exp",
      prompt: `Calculate ${ml(integralOf(0, n, M.row(a === 1 ? "" : M.mn(a), M.mi("x"), expML(M.mi("x")))))}.`,
      parts: [
        part(`Integrating by parts with ${ml(M.eq(M.mi("u"), M.mi("x")))}, what is an antiderivative of ${ml(M.row(M.mi("x"), expML(M.mi("x"))))}?`,
          3, { type: "expr", fn: (x) => (x - 1) * Math.exp(x), typed: "(x-1)e^x", samples: [0.4, 1.2, 2.1] },
          `${ml(M.row(M.paren(M.linear(1, -1)), expML(M.mi("x"))))}`, { placeholder: "for example (x-1)e^x" }),
        part(`Now the value of the integral.`, 2, num(value),
          `${ml(M.row(...(n === 1 ? [M.mn(a)] : [M.mn(a * (n - 1)), M.sup(M.e, M.mn(n)), M.mo("+"), M.mn(a)])))}`,
          { placeholder: "for example 2e^3+1" })
      ],
      solution: [
        `By parts: ∫ u v′ = uv − ∫ u′ v, with u = x and v′ = e<sup>x</sup>.`,
        `∫ x e<sup>x</sup> dx = x e<sup>x</sup> − ∫ e<sup>x</sup> dx = (x − 1)e<sup>x</sup>.`,
        `Between 0 and ${n}: (${n} − 1)e<sup>${n}</sup> − (0 − 1)e<sup>0</sup> = ${n === 1 ? "1" : `${n - 1}e<sup>${n}</sup> + 1`}.`,
        `Multiplying by ${a}: ${typedAnswer.replace(/e\^(\d+)/, "e<sup>$1</sup>")}.`,
        `Choosing u = x is what makes the second integral easier — the other way round makes it worse.`
      ],
      selfCheck: () => closeTo(simpson(f, 0, n), value) ? null : "by parts exp mismatch"
    };
  }

  // L5 · integration by parts with a logarithm.
  function byPartsLog(rng) {
    const a = rng.int(1, 6);
    const b = rng.int(-4, 6);
    const f = (x) => a * Math.log(x) + b;
    // ∫₁^e (a ln x + b) dx = a·[x ln x − x]₁^e + b(e − 1) = a + b(e − 1)
    const value = a + b * (Math.E - 1);
    const body = b === 0
      ? M.row(a === 1 ? "" : M.mn(a), M.ln(M.mi("x")))
      : M.row(a === 1 ? "" : M.mn(a), M.ln(M.mi("x")), M.mo(b < 0 ? M.MINUS : "+"), M.mn(Math.abs(b)));
    return {
      shape: "by-parts-log",
      prompt: `Calculate ${ml(M.integral(M.mn(1), M.e, M.paren(body)))}.`,
      parts: [
        part(`What is an antiderivative of ${ml(M.ln(M.mi("x")))}?`, 3,
          { type: "expr", fn: (x) => x * Math.log(x) - x, typed: "x*ln(x)-x", samples: [1.3, 2.2, 3.1] },
          `${ml(M.row(M.mi("x"), M.ln(M.mi("x")), M.mo(M.MINUS), M.mi("x")))}`, { placeholder: "for example x*ln(x)-x" }),
        part(`Now the value of the integral.`, 2, num(value),
          `${ml(b === 0 ? M.mn(a) : M.row(M.mn(a), M.mo(b < 0 ? M.MINUS : "+"), M.mn(Math.abs(b)), M.paren(M.row(M.e, M.mo(M.MINUS), M.mn(1)))))}`,
          { placeholder: "for example 3+2(e-1)" })
      ],
      solution: [
        `Write ln x as 1·ln x and integrate by parts with u = ln x, v′ = 1.`,
        `∫ ln x dx = x ln x − ∫ x·(1/x) dx = x ln x − x.`,
        `Between 1 and e: (e·1 − e) − (0 − 1) = 1, so the ln part contributes ${a}.`,
        b === 0 ? `The integral is ${a}.` : `The constant contributes ${b}(e − 1), so the total is ${a} ${b < 0 ? "−" : "+"} ${Math.abs(b)}(e − 1).`,
        `ln e = 1 and ln 1 = 0 — those two values are what make the answer come out clean.`
      ],
      selfCheck: () => closeTo(simpson(f, 1, Math.E), value) ? null : "by parts log mismatch"
    };
  }

  // L5 · the area between two curves.
  function areaBetween(rng) {
    const r = rng.int(-4, 5);
    const s = r + rng.int(1, 5);
    // f(x) = x², g(x) = (r + s)x − rs meet at r and s; area = (s − r)³/6
    const gap = s - r;
    const area = F(gap ** 3, 6);
    if (!looksTidy(area, { denoms: [1, 2, 3, 6] })) return null;
    const b = r + s;
    const c = -r * s;
    return {
      shape: "area-between",
      prompt: `Find the area enclosed between the graphs of ${ml(defineOn(M.REALS, M.sup(M.mi("x"), M.mn(2))))} and ${ml(defineOn(M.REALS, M.linear(b, c), "g"))}.`,
      parts: [
        part(`Where do the two graphs meet? Give the larger ${ml(M.mi("x"))}.`, 3, num(s),
          `${ml(M.eq(M.mi("x"), M.num(r)))} and ${ml(M.eq(M.mi("x"), M.num(s)))}`),
        part(`Now the area.`, 2, num(area), `the area is ${ml(M.num(area))}`)
      ],
      solution: [
        `They meet where x² = ${b}x ${c < 0 ? "−" : "+"} ${Math.abs(c)}, that is x² − ${b}x ${-c < 0 ? "−" : "+"} ${Math.abs(c)} = 0, so x = ${r} and x = ${s}.`,
        `Between them the line is above the parabola, so the area is ∫ (g − f) dx from ${r} to ${s}.`,
        `g(x) − f(x) = −(x − ${r})(x − ${s}), and the integral works out to (${s} − ${r})³/6 = ${ml(M.num(area))}.`
      ],
      selfCheck: () => {
        const difference = (x) => (b * x + c) - x * x;
        return closeTo(simpson(difference, r, s), area.value) ? null : "area between mismatch";
      }
    };
  }

  BAC.bankAnalysis = [derivatives, integrals];
})(typeof window !== "undefined" ? window : globalThis);
