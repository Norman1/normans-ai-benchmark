// Subiectul I, items 1 and 4: number work, progressions, percentages.
//
// Every generator is a function of a seeded Rng that returns a whole item —
// prompt, the parts the barem would mark, and the worked steps. The answers
// are computed from the same parameters that built the question, so a wrong
// worked solution would have to survive the generator being wrong about its
// own arithmetic, which the headless checker re-derives independently.

(function (global) {
  "use strict";

  const BAC = (global.BAC = global.BAC || {});
  const { Frac, F, looksTidy, isSquare, simplifySurd, M, ml } = BAC.core;

  /* --- shared shorthands ------------------------------------------------ */

  const num = (value) => ({ type: "number", value: value instanceof Frac ? value.value : value });
  const part = (ask, points, answer, mark, extra = {}) => ({ ask, points, answer, mark, ...extra });
  const fracML = (f) => M.num(f);

  BAC.bankHelpers = { num, part, fracML };

  /* ====================================================================== */
  /*  numbers — Subiectul I.1                                               */
  /* ====================================================================== */

  const numbers = {
    id: "numbers",
    name: "Numbers and fractions",
    blurb: "Fractions, decimals, powers, roots and logarithm arithmetic.",
    slot: "I.1",
    levels: {
      1: [fracSum, fracOfWhole, decimalChain],
      2: [fracBracket, powerRoot, fracMixed],
      3: [fracTwoBrackets, surdProduct, decimalFracMix],
      4: [surdConjugate, surdCollapse, surdSquare],
      5: [rationalise, logArithmetic, rationalPower]
    }
  };

  // L1 · a/b + c/d, chosen so the answer reduces.
  function fracSum(rng) {
    const b = rng.pick([2, 3, 4, 5, 6]);
    const d = rng.pick([2, 3, 4, 5, 6, 8, 10]);
    if (b === d) return null;
    const a = rng.int(1, b - 1);
    const c = rng.int(1, d - 1);
    const sum = F(a, b).add(F(c, d));
    if (!looksTidy(sum, { denoms: [1, 2, 3, 4, 5, 6, 8, 10, 12] })) return null;
    const lcd = (b * d) / BAC.core.gcd(b, d);

    const expr = ml(M.row(fracML(F(a, b)), M.mo("+"), fracML(F(c, d))));
    return {
      shape: "frac-sum",
      prompt: `Work out ${expr}.`,
      parts: [
        part(`What is the lowest common denominator of ${ml(fracML(F(a, b)))} and ${ml(fracML(F(c, d)))}?`,
          2, num(lcd), `common denominator ${lcd}`),
        part(`Now the value of the sum.`, 3, num(sum), `the sum is ${ml(fracML(sum))}`)
      ],
      solution: [
        `Put both fractions over ${lcd}: ${ml(M.eq(M.row(fracML(F(a, b)), M.mo("+"), fracML(F(c, d))),
          M.row(fracML(F(a * (lcd / b), lcd)), M.mo("+"), fracML(F(c * (lcd / d), lcd)))))}.`,
        `Add the numerators: ${ml(M.eq(fracML(F(a * (lcd / b) + c * (lcd / d), lcd)), fracML(sum)))}.`
      ],
      selfCheck: () => Math.abs(a / b + c / d - sum.value) < 1e-12 ? null : "sum mismatch"
    };
  }

  // L1 · k · a/b, landing on a whole number.
  function fracOfWhole(rng) {
    const b = rng.pick([2, 3, 4, 5, 6, 8]);
    const a = rng.int(1, b - 1);
    const multiple = rng.int(2, 9);
    const k = b * multiple;
    const result = k * a / b;
    if (result > 90) return null;

    const expr = ml(M.row(M.mn(k), M.mo(M.CDOT), fracML(F(a, b))));
    return {
      shape: "frac-of-whole",
      prompt: `Work out ${expr}.`,
      parts: [
        part(`What is ${ml(M.row(M.mn(k), M.mo("÷"), M.mn(b)))}?`, 2, num(multiple), `${k} : ${b} = ${multiple}`),
        part(`Now the value of the product.`, 3, num(result), `the product is ${result}`)
      ],
      solution: [
        `Divide first, then multiply — it keeps the numbers small: ${ml(M.eq(
          M.row(M.mn(k), M.mo(M.CDOT), fracML(F(a, b))), M.row(M.mn(multiple), M.mo(M.CDOT), M.mn(a))))}.`,
        `That gives ${result}.`
      ],
      selfCheck: () => k * a / b === result ? null : "product mismatch"
    };
  }

  // L1 · k(p − q) + r on one decimal place. Corpus: 2025 august I.1.
  function decimalChain(rng) {
    const k = rng.int(2, 9);
    const p = rng.int(3, 9) / 10;
    const q = rng.int(1, 2) / 10;
    const inner = Math.round((p - q) * 10) / 10;
    const rest = rng.int(1, 9) / 10;
    const total = Math.round((k * inner + rest) * 100) / 100;
    if (!Number.isInteger(total * 2)) return null;

    const dec = (v) => M.mn(String(v).replace(".", ","));
    const expr = ml(M.row(M.mn(k), M.mo(M.CDOT), M.paren(M.row(dec(p), M.mo(M.MINUS), dec(q))),
      M.mo("+"), dec(rest)));
    return {
      shape: "decimal-chain",
      prompt: `Work out ${expr}.`,
      parts: [
        part(`What is the bracket worth?`, 3, num(inner), `${p} − ${q} = ${inner}`.replace(/\./g, ",")),
        part(`Now the whole expression.`, 2, num(total), `the value is ${String(total).replace(".", ",")}`)
      ],
      solution: [
        `Brackets first: ${String(p).replace(".", ",")} − ${String(q).replace(".", ",")} = ${String(inner).replace(".", ",")}.`,
        `Then ${k} · ${String(inner).replace(".", ",")} + ${String(rest).replace(".", ",")} = ${String(total).replace(".", ",")}.`
      ],
      selfCheck: () => Math.abs(k * (p - q) + rest - total) < 1e-9 ? null : "decimal mismatch"
    };
  }

  // L2 · a/b + c(1 − d/e). Corpus: 2024 model I.1, 2026 model I.1.
  function fracBracket(rng) {
    const e = rng.pick([3, 4, 5, 6, 8]);
    const d = rng.int(1, e - 1);
    const c = rng.int(2, 6);
    const b = rng.pick([2, 3, 4, 5, 6, 8]);
    const a = rng.int(1, b - 1);
    const inner = F(1, 1).sub(F(d, e));
    const total = F(a, b).add(inner.mul(c));
    if (!looksTidy(total, { denoms: [1, 2, 3, 4] })) return null;

    const expr = ml(M.row(fracML(F(a, b)), M.mo("+"), M.mn(c), M.mo(M.CDOT),
      M.paren(M.row(M.mn(1), M.mo(M.MINUS), fracML(F(d, e))))));
    return {
      shape: "frac-bracket",
      prompt: `Work out ${expr}.`,
      parts: [
        part(`What is the bracket worth?`, 3, num(inner), `${ml(M.eq(M.row(M.mn(1), M.mo(M.MINUS), fracML(F(d, e))), fracML(inner)))}`),
        part(`Now the whole expression.`, 2, num(total), `the value is ${ml(fracML(total))}`)
      ],
      solution: [
        `Inside the bracket: ${ml(M.eq(M.row(M.mn(1), M.mo(M.MINUS), fracML(F(d, e))), fracML(inner)))}.`,
        `Multiply: ${ml(M.eq(M.row(M.mn(c), M.mo(M.CDOT), fracML(inner)), fracML(inner.mul(c))))}.`,
        `Add: ${ml(M.eq(M.row(fracML(F(a, b)), M.mo("+"), fracML(inner.mul(c))), fracML(total)))}.`
      ],
      selfCheck: () => Math.abs(a / b + c * (1 - d / e) - total.value) < 1e-12 ? null : "bracket mismatch"
    };
  }

  // L2 · powers and a square root of a perfect square.
  function powerRoot(rng) {
    const base = rng.pick([2, 3, 4, 5]);
    const power = base === 2 ? rng.int(3, 5) : rng.int(2, 3);
    const root = rng.pick([4, 9, 16, 25, 36, 49, 64, 81, 100]);
    const sign = rng.sign();
    const value = Math.pow(base, power) + sign * Math.sqrt(root);
    if (value < 0 || value > 200) return null;

    const expr = ml(M.row(M.sup(M.mn(base), M.mn(power)), M.mo(sign < 0 ? M.MINUS : "+"), M.sqrt(M.mn(root))));
    return {
      shape: "power-root",
      prompt: `Work out ${expr}.`,
      parts: [
        part(`What is ${ml(M.sup(M.mn(base), M.mn(power)))}?`, 2, num(Math.pow(base, power)),
          `${base}<sup>${power}</sup> = ${Math.pow(base, power)}`),
        part(`Now the whole expression.`, 3, num(value), `the value is ${value}`)
      ],
      solution: [
        `${base}<sup>${power}</sup> = ${Math.pow(base, power)} and √${root} = ${Math.sqrt(root)}.`,
        `So the expression is ${Math.pow(base, power)} ${sign < 0 ? "−" : "+"} ${Math.sqrt(root)} = ${value}.`
      ],
      selfCheck: () => Math.pow(base, power) + sign * Math.sqrt(root) === value ? null : "power mismatch"
    };
  }

  // L2 · a/b · c/d + e/f.
  function fracMixed(rng) {
    const b = rng.pick([2, 3, 4, 5]);
    const d = rng.pick([2, 3, 4, 5]);
    const a = rng.int(1, b);
    const c = rng.int(1, d);
    const f = rng.pick([2, 3, 4, 6]);
    const g = rng.int(1, f - 1);
    const product = F(a, b).mul(F(c, d));
    const total = product.add(F(g, f));
    if (!looksTidy(total, { denoms: [1, 2, 3, 4, 5, 6] })) return null;
    if (product.d === 1 && product.n === 0) return null;

    const expr = ml(M.row(fracML(F(a, b)), M.mo(M.CDOT), fracML(F(c, d)), M.mo("+"), fracML(F(g, f))));
    return {
      shape: "frac-mixed",
      prompt: `Work out ${expr}.`,
      parts: [
        part(`What is the product ${ml(M.row(fracML(F(a, b)), M.mo(M.CDOT), fracML(F(c, d))))}?`,
          3, num(product), `the product is ${ml(fracML(product))}`),
        part(`Now the whole expression.`, 2, num(total), `the value is ${ml(fracML(total))}`)
      ],
      solution: [
        `Multiply across: ${ml(M.eq(M.row(fracML(F(a, b)), M.mo(M.CDOT), fracML(F(c, d))), fracML(product)))}.`,
        `Then add: ${ml(M.eq(M.row(fracML(product), M.mo("+"), fracML(F(g, f))), fracML(total)))}.`
      ],
      selfCheck: () => Math.abs((a / b) * (c / d) + g / f - total.value) < 1e-12 ? null : "mixed mismatch"
    };
  }

  // L3 · a/b + c(d/e − f/g). Corpus: 2025 iunie I.1 — the classic.
  function fracTwoBrackets(rng) {
    const e = rng.pick([2, 3, 4, 5]);
    const g = rng.pick([3, 4, 5, 6, 10]);
    if (e === g) return null;
    const d = rng.int(1, e - 1);
    const f = rng.int(1, g - 1);
    const inner = F(d, e).sub(F(f, g));
    if (inner.value <= 0) return null;
    const c = rng.int(2, 6);
    const b = rng.pick([2, 4, 5, 10]);
    const a = rng.int(1, b - 1);
    const total = F(a, b).add(inner.mul(c));
    if (!looksTidy(total, { denoms: [1, 2, 4, 5] })) return null;

    const expr = ml(M.row(fracML(F(a, b)), M.mo("+"), M.mn(c), M.mo(M.CDOT),
      M.paren(M.row(fracML(F(d, e)), M.mo(M.MINUS), fracML(F(f, g))))));
    return {
      shape: "frac-two-brackets",
      prompt: `Show that ${expr} is equal to ${ml(fracML(total))}.`,
      parts: [
        part(`What is the bracket worth?`, 3,
          num(inner), `${ml(M.eq(M.row(fracML(F(d, e)), M.mo(M.MINUS), fracML(F(f, g))), fracML(inner)))}`),
        part(`Now the whole expression.`, 2, num(total), `the value is ${ml(fracML(total))}`)
      ],
      solution: [
        `The bracket first — common denominator ${(e * g) / BAC.core.gcd(e, g)}: ${ml(M.eq(
          M.row(fracML(F(d, e)), M.mo(M.MINUS), fracML(F(f, g))), fracML(inner)))}.`,
        `Multiply by ${c}: ${ml(fracML(inner.mul(c)))}.`,
        `Add ${ml(fracML(F(a, b)))}: ${ml(fracML(total))}.`
      ],
      selfCheck: () => Math.abs(a / b + c * (d / e - f / g) - total.value) < 1e-12 ? null : "two-bracket mismatch"
    };
  }

  // L3 · √a·√b ± c where ab is a perfect square.
  function surdProduct(rng) {
    const root = rng.int(2, 9);
    const square = root * root;
    const a = rng.pick([2, 3, 5, 6, 8].filter((k) => square % k === 0));
    if (!a) return null;
    const b = square / a;
    if (a === 1 || b === 1 || a === b) return null;
    const c = rng.int(1, 12);
    const sign = rng.sign();
    const value = root + sign * c;
    if (value <= 0) return null;

    const expr = ml(M.row(M.sqrt(M.mn(a)), M.mo(M.CDOT), M.sqrt(M.mn(b)),
      M.mo(sign < 0 ? M.MINUS : "+"), M.mn(c)));
    return {
      shape: "surd-product",
      prompt: `Work out ${expr}.`,
      parts: [
        part(`What is ${ml(M.row(M.sqrt(M.mn(a)), M.mo(M.CDOT), M.sqrt(M.mn(b))))}?`, 3, num(root),
          `${ml(M.eq(M.row(M.sqrt(M.mn(a)), M.mo(M.CDOT), M.sqrt(M.mn(b))), M.sqrt(M.mn(square)), M.mn(root)))}`),
        part(`Now the whole expression.`, 2, num(value), `the value is ${value}`)
      ],
      solution: [
        `√${a} · √${b} = √${a * b} = ${root}.`,
        `So the expression is ${root} ${sign < 0 ? "−" : "+"} ${c} = ${value}.`
      ],
      selfCheck: () => Math.abs(Math.sqrt(a) * Math.sqrt(b) + sign * c - value) < 1e-9 ? null : "surd mismatch"
    };
  }

  // L3 · decimals and fractions in the same expression.
  function decimalFracMix(rng) {
    const dec = rng.pick([0.25, 0.5, 0.75, 0.2, 0.4, 1.5, 2.5]);
    const b = rng.pick([2, 4, 5, 8, 10]);
    const a = rng.int(1, b - 1);
    const k = rng.int(2, 6);
    const total = F(Math.round(dec * 100), 100).add(F(a * k, b));
    if (!looksTidy(total, { denoms: [1, 2, 4] })) return null;

    const decML = M.mn(String(dec).replace(".", ","));
    const expr = ml(M.row(decML, M.mo("+"), M.mn(k), M.mo(M.CDOT), fracML(F(a, b))));
    return {
      shape: "decimal-frac",
      prompt: `Work out ${expr}.`,
      parts: [
        part(`What is ${ml(M.row(M.mn(k), M.mo(M.CDOT), fracML(F(a, b))))}?`, 3, num(F(a * k, b)),
          `${ml(M.eq(M.row(M.mn(k), M.mo(M.CDOT), fracML(F(a, b))), fracML(F(a * k, b))))}`),
        part(`Now the whole expression.`, 2, num(total), `the value is ${ml(fracML(total))}`)
      ],
      solution: [
        `${k} · ${ml(fracML(F(a, b)))} = ${ml(fracML(F(a * k, b)))}.`,
        `Write ${String(dec).replace(".", ",")} as ${ml(fracML(F(Math.round(dec * 100), 100)))} and add: ${ml(fracML(total))}.`
      ],
      selfCheck: () => Math.abs(dec + (k * a) / b - total.value) < 1e-12 ? null : "decimal-frac mismatch"
    };
  }

  // L4 · (a√k + b)(a√k − b) — the difference of two squares kills the surd.
  function surdConjugate(rng) {
    const k = rng.pick([2, 3, 5, 6, 7, 10]);
    const a = rng.int(1, 4);
    const b = rng.int(1, 9);
    const value = a * a * k - b * b;
    if (value === 0) return null;

    const left = M.row(a === 1 ? "" : M.mn(a), M.sqrt(M.mn(k)), M.mo("+"), M.mn(b));
    const right = M.row(a === 1 ? "" : M.mn(a), M.sqrt(M.mn(k)), M.mo(M.MINUS), M.mn(b));
    const expr = ml(M.row(M.paren(left), M.paren(right)));
    return {
      shape: "surd-conjugate",
      prompt: `Show that ${expr} is an integer, and find it.`,
      parts: [
        part(`What is ${ml(M.sup(M.paren(M.row(a === 1 ? "" : M.mn(a), M.sqrt(M.mn(k)))), M.mn(2)))}?`,
          3, num(a * a * k), `${ml(M.eq(M.sup(M.paren(M.row(a === 1 ? "" : M.mn(a), M.sqrt(M.mn(k)))), M.mn(2)), M.mn(a * a * k)))}`),
        part(`Now the value of the product.`, 2, num(value), `the product is ${value}`)
      ],
      solution: [
        `This is (u − v)(u + v) = u² − v² with u = ${a === 1 ? "" : a}√${k} and v = ${b}.`,
        `u² = ${a === 1 ? "" : a + "² · "}${k} = ${a * a * k} and v² = ${b * b}.`,
        `So the product is ${a * a * k} − ${b * b} = ${value}. The surd cancels, which is the whole point of multiplying by the conjugate.`
      ],
      selfCheck: () => {
        const lhs = (a * Math.sqrt(k) + b) * (a * Math.sqrt(k) - b);
        return Math.abs(lhs - value) < 1e-9 ? null : "conjugate mismatch";
      }
    };
  }

  // L4 · c(p√k − q√k)·√k + r → integer. Corpus: 2025 model I.1.
  function surdCollapse(rng) {
    const k = rng.pick([2, 3, 5]);
    const p = rng.int(2, 6);
    const q = rng.int(1, p - 1);
    const c = rng.int(2, 5);
    const r = rng.int(1, 12);
    const value = c * (p - q) * k + r;
    if (value > 120) return null;
    const surdText = (n) => (n === 1 ? `√${k}` : `${n}√${k}`);

    const expr = ml(M.row(M.mn(c), M.mo(M.CDOT),
      M.paren(M.row(M.surd(p, k), M.mo(M.MINUS), M.surd(q, k))),
      M.mo(M.CDOT), M.sqrt(M.mn(k)), M.mo("+"), M.mn(r)));
    return {
      shape: "surd-collapse",
      prompt: `Show that ${expr} is equal to ${ml(M.mn(value))}.`,
      parts: [
        part(`What is the bracket worth, as a multiple of ${ml(M.sqrt(M.mn(k)))}?`, 3,
          num(p - q), `${ml(M.eq(M.row(M.surd(p, k), M.mo(M.MINUS), M.surd(q, k)), M.surd(p - q, k)))} — so the coefficient is ${p - q}`),
        part(`Now the whole expression.`, 2, num(value), `the value is ${value}`)
      ],
      solution: [
        `√${k} is a common factor inside the bracket: ${surdText(p)} − ${surdText(q)} = ${surdText(p - q)}.`,
        `Then ${c} · ${surdText(p - q)} · √${k} = ${c * (p - q)} · ${k} = ${c * (p - q) * k}, because √${k} · √${k} = ${k}.`,
        `Adding ${r} gives ${value}.`
      ],
      selfCheck: () => {
        const lhs = c * (p * Math.sqrt(k) - q * Math.sqrt(k)) * Math.sqrt(k) + r;
        return Math.abs(lhs - value) < 1e-9 ? null : "collapse mismatch";
      }
    };
  }

  // L4 · (a + √b)² − 2a√b.
  function surdSquare(rng) {
    const b = rng.pick([2, 3, 5, 6, 7, 10, 11]);
    const a = rng.int(1, 6);
    const value = a * a + b;

    const expr = ml(M.row(M.sup(M.paren(M.row(M.mn(a), M.mo("+"), M.sqrt(M.mn(b)))), M.mn(2)),
      M.mo(M.MINUS), M.mn(2 * a), M.sqrt(M.mn(b))));
    return {
      shape: "surd-square",
      prompt: `Show that ${expr} is an integer, and find it.`,
      parts: [
        part(`Expanding the square gives ${ml(M.row(M.mn(a * a), M.mo("+"), M.mn(2 * a), M.sqrt(M.mn(b)),
          M.mo("+"), M.mi("t")))}. What is ${ml(M.mi("t"))}?`, 3, num(b),
          `${ml(M.eq(M.sup(M.paren(M.sqrt(M.mn(b))), M.mn(2)), M.mn(b)))}`),
        part(`Now the value of the whole expression.`, 2, num(value), `the value is ${value}`)
      ],
      solution: [
        `(${a} + √${b})² = ${a}² + 2·${a}·√${b} + (√${b})² = ${a * a} + ${2 * a}√${b} + ${b}.`,
        `Subtracting ${2 * a}√${b} removes the surd and leaves ${a * a} + ${b} = ${value}.`
      ],
      selfCheck: () => {
        const lhs = Math.pow(a + Math.sqrt(b), 2) - 2 * a * Math.sqrt(b);
        return Math.abs(lhs - value) < 1e-9 ? null : "square mismatch";
      }
    };
  }

  // L5 · rationalising a denominator — above the exam, inside the syllabus.
  function rationalise(rng) {
    // Square-free, so the surds in the answer are already in lowest form —
    // √12 + √7 would be a wrong-looking answer even though it is right.
    const SQUARE_FREE = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];
    const a = rng.pick(SQUARE_FREE);
    const b = rng.pick(SQUARE_FREE);
    if (a <= b) return null;
    const diff = a - b;
    const k = rng.int(1, 4) * diff;
    const factor = k / diff;

    const value = k / (Math.sqrt(a) - Math.sqrt(b));
    const expr = ml(M.frac(M.mn(k), M.row(M.sqrt(M.mn(a)), M.mo(M.MINUS), M.sqrt(M.mn(b)))));
    return {
      shape: "rationalise",
      prompt: `Write ${expr} without a root in the denominator.`,
      parts: [
        part(`Multiplying top and bottom by ${ml(M.row(M.sqrt(M.mn(a)), M.mo("+"), M.sqrt(M.mn(b))))} makes the denominator a whole number. Which one?`,
          3, num(diff), `${ml(M.eq(M.row(M.paren(M.row(M.sqrt(M.mn(a)), M.mo(M.MINUS), M.sqrt(M.mn(b)))),
            M.paren(M.row(M.sqrt(M.mn(a)), M.mo("+"), M.sqrt(M.mn(b))))), M.mn(diff)))}`),
        part(`Now write the value of the whole fraction.`, 2, num(value),
          `${ml(M.row(M.mn(factor === 1 ? "" : factor), M.paren(M.row(M.sqrt(M.mn(a)), M.mo("+"), M.sqrt(M.mn(b))))))}`,
          { placeholder: "for example 2(√5+√3)" })
      ],
      solution: [
        `Multiply above and below by the conjugate ${ml(M.row(M.sqrt(M.mn(a)), M.mo("+"), M.sqrt(M.mn(b))))}.`,
        `The denominator becomes (√${a})² − (√${b})² = ${a} − ${b} = ${diff}.`,
        `So the fraction is ${ml(M.frac(M.row(M.mn(k), M.paren(M.row(M.sqrt(M.mn(a)), M.mo("+"), M.sqrt(M.mn(b))))), M.mn(diff)))} = ${ml(M.row(factor === 1 ? "" : M.mn(factor), M.paren(M.row(M.sqrt(M.mn(a)), M.mo("+"), M.sqrt(M.mn(b))))))}.`
      ],
      selfCheck: () => Math.abs(factor * (Math.sqrt(a) + Math.sqrt(b)) - value) < 1e-9 ? null : "rationalise mismatch"
    };
  }

  // L5 · logarithm arithmetic — grade X, and the exam never sets it directly.
  function logArithmetic(rng) {
    const base = rng.pick([2, 3, 5]);
    const power = rng.int(2, base === 2 ? 6 : 4);
    const second = rng.pick([2, 3, 10]);
    const secondPower = rng.int(2, second === 10 ? 3 : 4);
    const sign = rng.sign();
    const value = power + sign * secondPower;
    if (base === second) return null;

    const firstML = M.log(base, M.mn(Math.pow(base, power)));
    const secondML = second === 10
      ? M.lg(M.mn(Math.pow(10, secondPower)))
      : M.log(second, M.mn(Math.pow(second, secondPower)));
    const expr = ml(M.row(firstML, M.mo(sign < 0 ? M.MINUS : "+"), secondML));
    return {
      shape: "log-arith",
      prompt: `Work out ${expr}.`,
      parts: [
        part(`What is ${ml(firstML)}?`, 3, num(power),
          `${ml(M.eq(firstML, M.mn(power)))}, because ${base}<sup>${power}</sup> = ${Math.pow(base, power)}`),
        part(`Now the whole expression.`, 2, num(value), `the value is ${value}`)
      ],
      solution: [
        `log<sub>a</sub> a<sup>n</sup> = n. Here ${Math.pow(base, power)} = ${base}<sup>${power}</sup>, so the first log is ${power}.`,
        `${second === 10 ? "lg" : "log<sub>" + second + "</sub>"} ${Math.pow(second, secondPower)} = ${secondPower}.`,
        `So the expression is ${power} ${sign < 0 ? "−" : "+"} ${secondPower} = ${value}.`
      ],
      selfCheck: () => power + sign * secondPower === value ? null : "log mismatch"
    };
  }

  // L5 · powers with rational exponents.
  function rationalPower(rng) {
    const options = [
      { base: 8, exp: F(2, 3), value: 4 }, { base: 27, exp: F(2, 3), value: 9 },
      { base: 16, exp: F(3, 4), value: 8 }, { base: 32, exp: F(2, 5), value: 4 },
      { base: 81, exp: F(3, 4), value: 27 }, { base: 4, exp: F(3, 2), value: 8 },
      { base: 9, exp: F(3, 2), value: 27 }, { base: 64, exp: F(2, 3), value: 16 },
      { base: 25, exp: F(3, 2), value: 125 }, { base: 8, exp: F(4, 3), value: 16 }
    ];
    const first = rng.pick(options);
    const root = rng.pick([4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144]);
    const sign = rng.sign();
    const value = first.value + sign * Math.sqrt(root);
    if (value <= 0) return null;

    const expr = ml(M.row(M.sup(M.mn(first.base), fracML(first.exp)),
      M.mo(sign < 0 ? M.MINUS : "+"), M.sqrt(M.mn(root))));
    return {
      shape: "rational-power",
      prompt: `Work out ${expr}.`,
      parts: [
        part(`What is ${ml(M.sup(M.mn(first.base), fracML(first.exp)))}?`, 3, num(first.value),
          `${ml(M.eq(M.sup(M.mn(first.base), fracML(first.exp)), M.mn(first.value)))}`),
        part(`Now the whole expression.`, 2, num(value), `the value is ${value}`)
      ],
      solution: [
        `a<sup>m/n</sup> is the n-th root of a<sup>m</sup>. Here ${first.base}<sup>${first.exp}</sup> = ${first.value}.`,
        `√${root} = ${Math.sqrt(root)}, so the expression is ${first.value} ${sign < 0 ? "−" : "+"} ${Math.sqrt(root)} = ${value}.`
      ],
      selfCheck: () => Math.abs(Math.pow(first.base, first.exp.value) - first.value) < 1e-9 ? null : "rational power mismatch"
    };
  }

  /* ====================================================================== */
  /*  progressions — Subiectul I.1 (alternate)                              */
  /* ====================================================================== */

  const progressions = {
    id: "progressions",
    name: "Progressions",
    blurb: "Arithmetic and geometric sequences: terms, common differences, sums.",
    slot: "I.1",
    levels: {
      1: [apNext, gpNext],
      2: [apTerm, gpTerm, apMissing],
      3: [apSum, apFromTwo, gpRatio],
      4: [apFindN, threeInAp, gpSum],
      5: [apTwoConditions, apGpMix, apSumRange]
    }
  };

  const seqML = (letter) => M.row(M.paren(M.sub(M.mi(letter), M.mi("n"))), M.sub(M.mi("n"), M.row(M.mo("≥"), M.mn(1))));
  const termML = (letter, index) => M.sub(M.mi(letter), M.mn(index));

  // L1 · a1 and a2 given, find a3. Corpus: 2025 specială I.1.
  function apNext(rng) {
    const a1 = rng.int(-8, 12);
    const r = rng.nz(-7, 9);
    const a2 = a1 + r;
    const a3 = a2 + r;
    return {
      shape: "ap-next",
      prompt: `In the arithmetic progression ${ml(seqML("a"))} you are told that ${ml(M.eq(termML("a", 1), M.num(a1)))} and ${ml(M.eq(termML("a", 2), M.num(a2)))}. Find ${ml(termML("a", 3))}.`,
      parts: [
        part(`What is the common difference ${ml(M.mi("r"))}?`, 2, num(r),
          `${ml(M.eq(M.mi("r"), M.row(termML("a", 2), M.mo(M.MINUS), termML("a", 1)), M.num(r)))}`),
        part(`Now ${ml(termML("a", 3))}.`, 3, num(a3), `${ml(M.eq(termML("a", 3), M.row(termML("a", 2), M.mo("+"), M.mi("r")), M.num(a3)))}`)
      ],
      solution: [
        `In an arithmetic progression every step adds the same r, so r = a₂ − a₁ = ${a2} − ${a1} = ${r}.`,
        `Then a₃ = a₂ + r = ${a2} + (${r}) = ${a3}.`
      ],
      selfCheck: () => a1 + 2 * r === a3 ? null : "ap-next mismatch"
    };
  }

  // L1 · b1 and b2 given, find b3.
  function gpNext(rng) {
    const b1 = rng.pick([1, 2, 3, 4, 5, 6, 10]) * rng.sign();
    const q = rng.pick([2, 3, 4, 5, -2, -3]);
    const b2 = b1 * q;
    const b3 = b2 * q;
    if (Math.abs(b3) > 400) return null;
    return {
      shape: "gp-next",
      prompt: `In the geometric progression ${ml(seqML("b"))} you are told that ${ml(M.eq(termML("b", 1), M.num(b1)))} and ${ml(M.eq(termML("b", 2), M.num(b2)))}. Find ${ml(termML("b", 3))}.`,
      parts: [
        part(`What is the common ratio ${ml(M.mi("q"))}?`, 2, num(q),
          `${ml(M.eq(M.mi("q"), M.frac(termML("b", 2), termML("b", 1)), M.num(q)))}`),
        part(`Now ${ml(termML("b", 3))}.`, 3, num(b3), `${ml(M.eq(termML("b", 3), M.row(termML("b", 2), M.mo(M.CDOT), M.mi("q")), M.num(b3)))}`)
      ],
      solution: [
        `In a geometric progression every step multiplies by the same q, so q = b₂ : b₁ = ${b2} : ${b1} = ${q}.`,
        `Then b₃ = b₂ · q = ${b2} · (${q}) = ${b3}.`
      ],
      selfCheck: () => b1 * q * q === b3 ? null : "gp-next mismatch"
    };
  }

  // L2 · a1 and r given, find a_n.
  function apTerm(rng) {
    const a1 = rng.int(-6, 14);
    const r = rng.nz(-6, 8);
    const n = rng.int(5, 15);
    const an = a1 + (n - 1) * r;
    if (Math.abs(an) > 150) return null;
    return {
      shape: "ap-term",
      prompt: `An arithmetic progression has ${ml(M.eq(termML("a", 1), M.num(a1)))} and common difference ${ml(M.eq(M.mi("r"), M.num(r)))}. Find ${ml(M.sub(M.mi("a"), M.mn(n)))}.`,
      parts: [
        part(`How many times is ${ml(M.mi("r"))} added to reach the ${n}th term?`, 2, num(n - 1),
          `${ml(M.eq(M.sub(M.mi("a"), M.mi("n")), M.row(termML("a", 1), M.mo("+"), M.paren(M.row(M.mi("n"), M.mo(M.MINUS), M.mn(1))), M.mi("r"))))}, so ${n} − 1 = ${n - 1} times`),
        part(`Now ${ml(M.sub(M.mi("a"), M.mn(n)))}.`, 3, num(an), `${ml(M.eq(M.sub(M.mi("a"), M.mn(n)), M.num(an)))}`)
      ],
      solution: [
        `aₙ = a₁ + (n − 1)r.`,
        `a<sub>${n}</sub> = ${a1} + ${n - 1}·(${r}) = ${an}.`
      ],
      selfCheck: () => a1 + (n - 1) * r === an ? null : "ap-term mismatch"
    };
  }

  // L2 · b1 and q given, find b_n.
  function gpTerm(rng) {
    const b1 = rng.int(1, 6) * rng.sign();
    const q = rng.pick([2, 3, -2]);
    const n = rng.int(4, 7);
    const bn = b1 * Math.pow(q, n - 1);
    if (Math.abs(bn) > 2000) return null;
    return {
      shape: "gp-term",
      prompt: `A geometric progression has ${ml(M.eq(termML("b", 1), M.num(b1)))} and common ratio ${ml(M.eq(M.mi("q"), M.num(q)))}. Find ${ml(M.sub(M.mi("b"), M.mn(n)))}.`,
      parts: [
        part(`What power of ${ml(M.mi("q"))} appears in ${ml(M.sub(M.mi("b"), M.mn(n)))}?`, 2, num(n - 1),
          `${ml(M.eq(M.sub(M.mi("b"), M.mi("n")), M.row(termML("b", 1), M.mo(M.CDOT), M.sup(M.mi("q"), M.row(M.mi("n"), M.mo(M.MINUS), M.mn(1))))))}, so the power is ${n - 1}`),
        part(`Now ${ml(M.sub(M.mi("b"), M.mn(n)))}.`, 3, num(bn), `${ml(M.eq(M.sub(M.mi("b"), M.mn(n)), M.num(bn)))}`)
      ],
      solution: [
        `bₙ = b₁ · q<sup>n−1</sup>.`,
        `b<sub>${n}</sub> = ${b1} · (${q})<sup>${n - 1}</sup> = ${bn}.`
      ],
      selfCheck: () => b1 * Math.pow(q, n - 1) === bn ? null : "gp-term mismatch"
    };
  }

  // L2 · a middle term missing.
  function apMissing(rng) {
    const a1 = rng.int(-10, 15);
    const r = rng.nz(-8, 9);
    const gapIndex = rng.int(2, 4);
    const terms = [0, 1, 2, 3, 4].map((k) => a1 + k * r);
    const shown = terms.map((t, i) => (i === gapIndex ? "…" : t));
    const answer = terms[gapIndex];
    return {
      shape: "ap-missing",
      prompt: `The first five terms of an arithmetic progression are ${shown.join(", ")}. Find the missing one.`,
      parts: [
        part(`What is the common difference?`, 2, num(r), `each step adds ${r}`),
        part(`What is the missing term?`, 3, num(answer), `the missing term is ${answer}`)
      ],
      solution: [
        `Two neighbouring known terms differ by ${Math.abs(r)}·1, so r = ${r}.`,
        `The missing term is ${gapIndex === 0 ? "" : terms[gapIndex - 1] + " + (" + r + ")"} = ${answer}.`
      ],
      selfCheck: () => terms[gapIndex] === answer ? null : "ap-missing mismatch"
    };
  }

  // L3 · sum of the first n terms.
  function apSum(rng) {
    const a1 = rng.int(1, 12);
    const r = rng.int(1, 7);
    const n = rng.pick([6, 8, 10, 12, 15, 20]);
    const an = a1 + (n - 1) * r;
    const sum = (a1 + an) * n / 2;
    if (!Number.isInteger(sum) || sum > 3000) return null;
    return {
      shape: "ap-sum",
      prompt: `An arithmetic progression has ${ml(M.eq(termML("a", 1), M.num(a1)))} and ${ml(M.eq(M.mi("r"), M.num(r)))}. Find the sum of the first ${n} terms.`,
      parts: [
        part(`What is ${ml(M.sub(M.mi("a"), M.mn(n)))}?`, 2, num(an), `${ml(M.eq(M.sub(M.mi("a"), M.mn(n)), M.num(an)))}`),
        part(`Now ${ml(M.sub(M.mi("S"), M.mn(n)))}.`, 3, num(sum),
          `${ml(M.eq(M.sub(M.mi("S"), M.mn(n)), M.frac(M.row(M.paren(M.row(termML("a", 1), M.mo("+"), M.sub(M.mi("a"), M.mi("n")))), M.mi("n")), M.mn(2)), M.num(sum)))}`)
      ],
      solution: [
        `a<sub>${n}</sub> = ${a1} + ${n - 1}·${r} = ${an}.`,
        `Sₙ = (a₁ + aₙ)·n / 2 = (${a1} + ${an})·${n} / 2 = ${sum}.`
      ],
      selfCheck: () => {
        let total = 0;
        for (let k = 0; k < n; k += 1) total += a1 + k * r;
        return total === sum ? null : "ap-sum mismatch";
      }
    };
  }

  // L3 · two non-consecutive terms given.
  function apFromTwo(rng) {
    const r = rng.nz(-6, 8);
    const a1 = rng.int(-8, 12);
    const i = rng.int(2, 4);
    const j = i + rng.int(2, 5);
    const ai = a1 + (i - 1) * r;
    const aj = a1 + (j - 1) * r;
    if (Math.abs(aj) > 120) return null;
    return {
      shape: "ap-from-two",
      prompt: `In an arithmetic progression ${ml(M.eq(M.sub(M.mi("a"), M.mn(i)), M.num(ai)))} and ${ml(M.eq(M.sub(M.mi("a"), M.mn(j)), M.num(aj)))}. Find ${ml(termML("a", 1))}.`,
      parts: [
        part(`What is the common difference?`, 3, num(r),
          `${ml(M.eq(M.sub(M.mi("a"), M.mn(j)), M.row(M.sub(M.mi("a"), M.mn(i)), M.mo("+"), M.mn(j - i), M.mi("r"))))}, so ${ml(M.eq(M.mi("r"), M.num(r)))}`),
        part(`Now ${ml(termML("a", 1))}.`, 2, num(a1), `${ml(M.eq(termML("a", 1), M.num(a1)))}`)
      ],
      solution: [
        `Going from term ${i} to term ${j} is ${j - i} steps, so ${j - i}r = ${aj} − ${ai} = ${aj - ai}, giving r = ${r}.`,
        `Then a₁ = a<sub>${i}</sub> − ${i - 1}r = ${ai} − ${i - 1}·(${r}) = ${a1}.`
      ],
      selfCheck: () => a1 + (j - 1) * r === aj ? null : "ap-from-two mismatch"
    };
  }

  // L3 · ratio of a geometric progression from two terms.
  function gpRatio(rng) {
    const b1 = rng.int(1, 5);
    const q = rng.pick([2, 3, 4, 5]);
    const n = rng.pick([3, 4, 5]);
    const bn = b1 * Math.pow(q, n - 1);
    if (bn > 2500) return null;
    return {
      shape: "gp-ratio",
      prompt: `A geometric progression of positive terms has ${ml(M.eq(termML("b", 1), M.num(b1)))} and ${ml(M.eq(M.sub(M.mi("b"), M.mn(n)), M.num(bn)))}. Find the common ratio.`,
      parts: [
        part(`What is ${ml(M.sup(M.mi("q"), M.mn(n - 1)))}?`, 3, num(Math.pow(q, n - 1)),
          `${ml(M.eq(M.sup(M.mi("q"), M.mn(n - 1)), M.frac(M.sub(M.mi("b"), M.mn(n)), termML("b", 1)), M.mn(Math.pow(q, n - 1))))}`),
        part(`Now ${ml(M.mi("q"))}.`, 2, num(q), `${ml(M.eq(M.mi("q"), M.num(q)))}`)
      ],
      solution: [
        `bₙ = b₁q<sup>n−1</sup>, so q<sup>${n - 1}</sup> = ${bn} : ${b1} = ${Math.pow(q, n - 1)}.`,
        `The terms are positive, so q = ${q}.`
      ],
      selfCheck: () => b1 * Math.pow(q, n - 1) === bn ? null : "gp-ratio mismatch"
    };
  }

  // L4 · the sum is given, find how many terms.
  function apFindN(rng) {
    const a1 = rng.int(1, 8);
    const r = rng.int(1, 6);
    const n = rng.int(5, 20);
    const an = a1 + (n - 1) * r;
    const sum = (a1 + an) * n / 2;
    if (!Number.isInteger(sum)) return null;
    // The quadratic must have exactly one positive integer root, which it does
    // by construction; keep the numbers inside what a person will attempt.
    if (sum > 2000) return null;
    return {
      shape: "ap-find-n",
      prompt: `An arithmetic progression has ${ml(M.eq(termML("a", 1), M.num(a1)))} and ${ml(M.eq(M.mi("r"), M.num(r)))}. The sum of the first ${ml(M.mi("n"))} terms is ${ml(M.num(sum))}. Find ${ml(M.mi("n"))}.`,
      parts: [
        part(`How many terms are there?`, 3, num(n),
          `${ml(M.eq(M.sub(M.mi("S"), M.mi("n")), M.num(sum)))} gives ${ml(M.eq(M.mi("n"), M.num(n)))}`),
        part(`What is the last of them, ${ml(M.sub(M.mi("a"), M.mi("n")))}?`, 2, num(an),
          `${ml(M.eq(M.sub(M.mi("a"), M.mn(n)), M.num(an)))}`)
      ],
      solution: [
        `Sₙ = [2a₁ + (n − 1)r]·n / 2 = [${2 * a1} + ${r}(n − 1)]·n / 2 = ${sum}.`,
        `That is ${r}n² + ${2 * a1 - r}n − ${2 * sum} = 0, whose positive integer root is n = ${n}.`,
        `Then a<sub>${n}</sub> = ${a1} + ${n - 1}·${r} = ${an}.`
      ],
      selfCheck: () => {
        let total = 0;
        for (let k = 0; k < n; k += 1) total += a1 + k * r;
        return total === sum ? null : "ap-find-n mismatch";
      }
    };
  }

  // L4 · three numbers in arithmetic progression.
  function threeInAp(rng) {
    const middle = rng.int(3, 20);
    const gap = rng.int(2, 9);
    const first = middle - gap;
    const third = middle + gap;
    const sum = first + middle + third;
    return {
      shape: "three-in-ap",
      prompt: `The numbers ${ml(M.num(first))}, ${ml(M.mi("x"))} and ${ml(M.num(third))} are three consecutive terms of an arithmetic progression. Find ${ml(M.mi("x"))}, then their sum.`,
      parts: [
        part(`What is ${ml(M.mi("x"))}?`, 3, num(middle),
          `${ml(M.eq(M.mn(2), M.mi("x"), M.row(M.num(first), M.mo("+"), M.num(third))))}, so ${ml(M.eq(M.mi("x"), M.num(middle)))}`),
        part(`What is the sum of the three?`, 2, num(sum), `the sum is ${sum}`)
      ],
      solution: [
        `Consecutive terms of an arithmetic progression satisfy 2x = ${first} + ${third}, so x = ${middle}.`,
        `Their sum is ${first} + ${middle} + ${third} = ${sum}. Notice it is 3x — the middle term is the average.`
      ],
      selfCheck: () => 2 * middle === first + third && sum === 3 * middle ? null : "three-in-ap mismatch"
    };
  }

  // L4 · sum of a geometric progression.
  function gpSum(rng) {
    const b1 = rng.int(1, 5);
    const q = rng.pick([2, 3]);
    const n = rng.int(4, q === 2 ? 8 : 6);
    const sum = b1 * (Math.pow(q, n) - 1) / (q - 1);
    if (sum > 5000) return null;
    return {
      shape: "gp-sum",
      prompt: `A geometric progression has ${ml(M.eq(termML("b", 1), M.num(b1)))} and ${ml(M.eq(M.mi("q"), M.num(q)))}. Find the sum of the first ${n} terms.`,
      parts: [
        part(`What is ${ml(M.sup(M.mn(q), M.mn(n)))}?`, 2, num(Math.pow(q, n)), `${q}<sup>${n}</sup> = ${Math.pow(q, n)}`),
        part(`Now the sum.`, 3, num(sum),
          `${ml(M.eq(M.sub(M.mi("S"), M.mn(n)), M.row(termML("b", 1), M.frac(M.row(M.sup(M.mi("q"), M.mi("n")), M.mo(M.MINUS), M.mn(1)), M.row(M.mi("q"), M.mo(M.MINUS), M.mn(1)))), M.num(sum)))}`)
      ],
      solution: [
        `Sₙ = b₁(qⁿ − 1)/(q − 1) = ${b1}(${q}<sup>${n}</sup> − 1)/${q - 1}.`,
        `${q}<sup>${n}</sup> = ${Math.pow(q, n)}, so Sₙ = ${b1}·${Math.pow(q, n) - 1}/${q - 1} = ${sum}.`
      ],
      selfCheck: () => {
        let total = 0;
        for (let k = 0; k < n; k += 1) total += b1 * Math.pow(q, k);
        return total === sum ? null : "gp-sum mismatch";
      }
    };
  }

  // L5 · two conditions, solve for a1 and r together.
  function apTwoConditions(rng) {
    const a1 = rng.int(-8, 12);
    const r = rng.nz(-6, 8);
    const i = rng.int(2, 5);
    const j = rng.int(6, 10);
    const term = (k) => a1 + (k - 1) * r;
    const sumTwo = term(i) + term(j);
    const single = term(rng.int(3, 7));
    const k = rng.int(3, 7);
    const target = term(k);
    if (Math.abs(sumTwo) > 200) return null;
    // The two conditions must be independent, or r cannot be recovered.
    if (i + j - 2 - 2 * (k - 1) === 0) return null;
    return {
      shape: "ap-two-conditions",
      prompt: `In an arithmetic progression ${ml(M.eq(M.row(M.sub(M.mi("a"), M.mn(i)), M.mo("+"), M.sub(M.mi("a"), M.mn(j))), M.num(sumTwo)))} and ${ml(M.eq(M.sub(M.mi("a"), M.mn(k)), M.num(target)))}. Find the common difference, then ${ml(termML("a", 1))}.`,
      parts: [
        part(`What is ${ml(M.mi("r"))}?`, 3, num(r), `${ml(M.eq(M.mi("r"), M.num(r)))}`),
        part(`Now ${ml(termML("a", 1))}.`, 2, num(a1), `${ml(M.eq(termML("a", 1), M.num(a1)))}`)
      ],
      solution: [
        `Write both conditions in terms of a₁ and r: a₁ + ${i - 1}r + a₁ + ${j - 1}r = ${sumTwo}, and a₁ + ${k - 1}r = ${target}.`,
        `That is 2a₁ + ${i + j - 2}r = ${BAC.core.T(sumTwo)} and a₁ + ${k - 1}r = ${BAC.core.T(target)}. Subtracting twice the second from the first gives ${BAC.core.coef(i + j - 2 - 2 * (k - 1), "r")} = ${BAC.core.T(sumTwo - 2 * target)}, so r = ${BAC.core.T(r)}.`,
        `Then a₁ = ${BAC.core.T(target)} − ${k - 1}·${BAC.core.Tp(r)} = ${BAC.core.T(a1)}.`
      ],
      selfCheck: () => {
        const denominator = i + j - 2 - 2 * (k - 1);
        if (denominator === 0) return "degenerate system";
        return (sumTwo - 2 * target) / denominator === r ? null : "ap-two-conditions mismatch";
      }
    };
  }

  // L5 · terms of an arithmetic progression that also sit in a geometric one.
  function apGpMix(rng) {
    // a1, a1+r, a1+3r geometric  ⇒  (a1+r)² = a1(a1+3r)  ⇒  r² = a1 r  ⇒  a1 = r.
    const r = rng.nz(2, 9);
    const a1 = r;
    const check = (a1 + r) * (a1 + r) === a1 * (a1 + 3 * r);
    if (!check) return null;
    const q = (a1 + r) / a1;
    return {
      shape: "ap-gp-mix",
      prompt: `In an arithmetic progression with common difference ${ml(M.eq(M.mi("r"), M.num(r)))}, the terms ${ml(termML("a", 1))}, ${ml(termML("a", 2))} and ${ml(termML("a", 4))} form a geometric progression. Find ${ml(termML("a", 1))}.`,
      parts: [
        part(`What is ${ml(termML("a", 1))}?`, 3, num(a1),
          `${ml(M.eq(M.sup(M.sub(M.mi("a"), M.mn(2)), M.mn(2)), M.row(M.sub(M.mi("a"), M.mn(1)), M.sub(M.mi("a"), M.mn(4)))))} gives ${ml(M.eq(termML("a", 1), M.num(a1)))}`),
        part(`What is the ratio of that geometric progression?`, 2, num(q), `the ratio is ${q}`)
      ],
      solution: [
        `Three numbers are in geometric progression when the middle one squared is the product of the outer two: a₂² = a₁·a₄.`,
        `With a₂ = a₁ + ${r} and a₄ = a₁ + ${3 * r}: (a₁ + ${r})² = a₁(a₁ + ${3 * r}).`,
        `Expanding, a₁² + ${2 * r}a₁ + ${r * r} = a₁² + ${3 * r}a₁, so ${r}a₁ = ${r * r} and a₁ = ${a1}.`,
        `Then the three terms are ${a1}, ${a1 + r}, ${a1 + 3 * r} and the ratio is ${q}.`
      ],
      selfCheck: () => (a1 + r) * (a1 + r) === a1 * (a1 + 3 * r) ? null : "ap-gp-mix mismatch"
    };
  }

  // L5 · sum of a run of terms in the middle of a progression.
  function apSumRange(rng) {
    const a1 = rng.int(1, 10);
    const r = rng.int(1, 6);
    const from = rng.int(3, 8);
    const to = from + rng.int(3, 8);
    const term = (k) => a1 + (k - 1) * r;
    const count = to - from + 1;
    const sum = (term(from) + term(to)) * count / 2;
    if (!Number.isInteger(sum) || sum > 2000) return null;
    return {
      shape: "ap-sum-range",
      prompt: `An arithmetic progression has ${ml(M.eq(termML("a", 1), M.num(a1)))} and ${ml(M.eq(M.mi("r"), M.num(r)))}. Find ${ml(M.row(M.sub(M.mi("a"), M.mn(from)), M.mo("+"), M.sub(M.mi("a"), M.mn(from + 1)), M.mo("+"), M.mo("…"), M.mo("+"), M.sub(M.mi("a"), M.mn(to))))}.`,
      parts: [
        part(`How many terms are being added?`, 2, num(count), `${to} − ${from} + 1 = ${count} terms`),
        part(`What is their sum?`, 3, num(sum), `the sum is ${sum}`)
      ],
      solution: [
        `a<sub>${from}</sub> = ${term(from)} and a<sub>${to}</sub> = ${term(to)}.`,
        `There are ${to} − ${from} + 1 = ${count} terms, and the same "first plus last, times how many, over two" works on any run: (${term(from)} + ${term(to)})·${count}/2 = ${sum}.`
      ],
      selfCheck: () => {
        let total = 0;
        for (let k = from; k <= to; k += 1) total += term(k);
        return total === sum ? null : "ap-sum-range mismatch";
      }
    };
  }

  /* ====================================================================== */
  /*  percentages — Subiectul I.4 (alternate)                               */
  /* ====================================================================== */

  const percentages = {
    id: "percentages",
    name: "Percentages",
    blurb: "Discounts, mark-ups, working backwards to the original price.",
    slot: "I.4",
    levels: {
      1: [percentOf, percentWhich],
      2: [afterChange, howMuchChange],
      3: [beforeChange, beforeChangeRise],
      4: [twoChanges, findRate],
      5: [twoChangesReverse, compoundInterest]
    }
  };

  const lei = (value) => `${value} lei`;

  // L1 · p% of N.
  function percentOf(rng) {
    const p = rng.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]);
    const base = rng.int(2, 40) * 20;
    const value = base * p / 100;
    if (!Number.isInteger(value)) return null;
    return {
      shape: "percent-of",
      prompt: `Find ${ml(M.row(M.mn(p), M.mo("%")))} of ${lei(base)}.`,
      parts: [
        part(`What is ${ml(M.row(M.mn(1), M.mo("%")))} of ${lei(base)}?`, 2, num(base / 100), `1% is ${base / 100} lei`),
        part(`Now ${ml(M.row(M.mn(p), M.mo("%")))} of it.`, 3, num(value), `${p}% is ${value} lei`)
      ],
      solution: [
        `1% of ${base} is ${base}/100 = ${base / 100}.`,
        `So ${p}% is ${p} · ${base / 100} = ${value} lei.`
      ],
      selfCheck: () => base * p / 100 === value ? null : "percent-of mismatch"
    };
  }

  // L1 · what percentage is A of B.
  function percentWhich(rng) {
    const p = rng.pick([10, 20, 25, 40, 50, 60, 75, 80]);
    const base = rng.int(2, 30) * 20;
    const value = base * p / 100;
    if (!Number.isInteger(value)) return null;
    return {
      shape: "percent-which",
      prompt: `What percentage of ${lei(base)} is ${lei(value)}?`,
      parts: [
        part(`Write it as a fraction of the whole: what is ${ml(M.frac(M.mn(value), M.mn(base)))}?`, 2,
          num(F(value, base)), `${ml(M.eq(M.frac(M.mn(value), M.mn(base)), M.num(F(value, base))))}`),
        part(`Now as a percentage (just the number).`, 3, { type: "percent", value: p }, `${p}%`)
      ],
      solution: [
        `${value}/${base} = ${(value / base).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}.`,
        `Multiply by 100: ${p}%.`
      ],
      selfCheck: () => value / base * 100 === p ? null : "percent-which mismatch"
    };
  }

  // L2 · price after a rise or a discount.
  function afterChange(rng) {
    const rise = rng.bool();
    const p = rng.pick([10, 15, 20, 25, 30, 40, 50, 60]);
    const base = rng.int(2, 40) * 20;
    const change = base * p / 100;
    if (!Number.isInteger(change)) return null;
    const after = rise ? base + change : base - change;
    return {
      shape: "after-change",
      prompt: `An item costs ${lei(base)}. Find its price after ${rise ? "a rise" : "a discount"} of ${ml(M.row(M.mn(p), M.mo("%")))}.`,
      parts: [
        part(`How many lei is the ${rise ? "rise" : "discount"}?`, 2, num(change), `${p}% of ${base} is ${change} lei`),
        part(`What is the new price?`, 3, num(after), `the new price is ${after} lei`)
      ],
      solution: [
        `${p}% of ${base} is ${p}·${base}/100 = ${change} lei.`,
        `The new price is ${base} ${rise ? "+" : "−"} ${change} = ${after} lei.`,
        `Faster: ${rise ? 100 + p : 100 - p}% of ${base} = ${after}.`
      ],
      selfCheck: () => (rise ? base + change : base - change) === after ? null : "after-change mismatch"
    };
  }

  // L2 · how much was the change, in lei.
  function howMuchChange(rng) {
    const p = rng.pick([10, 20, 25, 30, 50]);
    const base = rng.int(3, 30) * 40;
    const change = base * p / 100;
    const after = base - change;
    if (!Number.isInteger(change)) return null;
    return {
      shape: "how-much-change",
      prompt: `A price falls from ${lei(base)} to ${lei(after)}. By how many lei did it fall, and what fraction of the original is that?`,
      parts: [
        part(`By how many lei?`, 2, num(change), `${base} − ${after} = ${change} lei`),
        part(`What fraction of the original is that?`, 3, num(F(change, base)),
          `${ml(M.eq(M.frac(M.mn(change), M.mn(base)), M.num(F(change, base))))}`)
      ],
      solution: [
        `The fall is ${base} − ${after} = ${change} lei.`,
        `As a fraction of the original that is ${change}/${base} = ${ml(M.num(F(change, base)))}, which is ${p}%.`
      ],
      selfCheck: () => base - after === change ? null : "how-much-change mismatch"
    };
  }

  // L3 · the exam's own shape: the price *before*. Corpus: 2025 august I.4.
  function beforeChange(rng) {
    const p = rng.pick([10, 20, 25, 30, 40, 50, 60]);
    const original = rng.int(2, 40) * 20;
    const after = original * (100 - p) / 100;
    if (!Number.isInteger(after)) return null;
    return {
      shape: "before-discount",
      prompt: `After a discount of ${ml(M.row(M.mn(p), M.mo("%")))} an item costs ${lei(after)}. Find its price before the discount.`,
      parts: [
        part(`The new price is what percentage of the old one?`, 3, { type: "percent", value: 100 - p },
          `${100 - p}% of the original`),
        part(`So what was the original price?`, 2, num(original), `the original price was ${original} lei`)
      ],
      solution: [
        `A discount of ${p}% leaves ${100 - p}% of the price standing.`,
        `So ${100 - p}% of x is ${after}, that is ${(100 - p) / 100}·x = ${after}.`,
        `x = ${after} · 100 / ${100 - p} = ${original} lei.`,
        `Check: ${p}% of ${original} is ${original - after}, and ${original} − ${original - after} = ${after}. ✓`
      ],
      selfCheck: () => original * (100 - p) / 100 === after ? null : "before-discount mismatch"
    };
  }

  // L3 · the same, after a rise. Corpus: 2026 simulare I.4.
  function beforeChangeRise(rng) {
    const p = rng.pick([10, 15, 20, 25, 50, 60, 75]);
    const original = rng.int(2, 40) * 20;
    const after = original * (100 + p) / 100;
    if (!Number.isInteger(after)) return null;
    return {
      shape: "before-rise",
      prompt: `After a rise of ${ml(M.row(M.mn(p), M.mo("%")))} a product costs ${lei(after)}. Find its price before the rise.`,
      parts: [
        part(`The new price is what percentage of the old one?`, 3, { type: "percent", value: 100 + p },
          `${100 + p}% of the original`),
        part(`So what was the original price?`, 2, num(original), `the original price was ${original} lei`)
      ],
      solution: [
        `A rise of ${p}% makes the price ${100 + p}% of what it was.`,
        `So ${(100 + p) / 100}·x = ${after}, giving x = ${after}·100/${100 + p} = ${original} lei.`,
        `The trap is taking ${p}% of ${after} instead — that would give ${after - after * p / 100}, which is wrong, because the percentage is of the *old* price.`
      ],
      selfCheck: () => original * (100 + p) / 100 === after ? null : "before-rise mismatch"
    };
  }

  // L4 · two changes one after the other.
  function twoChanges(rng) {
    const p = rng.pick([10, 20, 25, 50]);
    const q = rng.pick([10, 20, 25, 40, 50]);
    const base = rng.int(2, 20) * 100;
    const middle = base * (100 + p) / 100;
    const final = middle * (100 - q) / 100;
    if (!Number.isInteger(middle) || !Number.isInteger(final)) return null;
    return {
      shape: "two-changes",
      prompt: `A price of ${lei(base)} rises by ${ml(M.row(M.mn(p), M.mo("%")))} and is then discounted by ${ml(M.row(M.mn(q), M.mo("%")))}. Find the final price.`,
      parts: [
        part(`What is the price after the rise?`, 2, num(middle), `${base} · ${(100 + p) / 100} = ${middle} lei`),
        part(`And after the discount?`, 3, num(final), `${middle} · ${(100 - q) / 100} = ${final} lei`)
      ],
      solution: [
        `After the rise: ${100 + p}% of ${base} = ${middle} lei.`,
        `After the discount: ${100 - q}% of ${middle} = ${final} lei.`,
        `The two do not cancel, because the second percentage is taken from the larger price. The overall factor is ${(100 + p) / 100} · ${(100 - q) / 100} = ${(middle / base) * (final / middle)}.`
      ],
      selfCheck: () => Math.abs(base * (100 + p) / 100 * (100 - q) / 100 - final) < 1e-9 ? null : "two-changes mismatch"
    };
  }

  // L4 · find the percentage from before and after.
  function findRate(rng) {
    const p = rng.pick([10, 20, 25, 30, 40, 50, 60, 75, 80]);
    const fall = rng.bool();
    const base = rng.int(2, 30) * 20;
    const after = fall ? base * (100 - p) / 100 : base * (100 + p) / 100;
    if (!Number.isInteger(after)) return null;
    const change = Math.abs(base - after);
    return {
      shape: "find-rate",
      prompt: `A price ${fall ? "falls" : "rises"} from ${lei(base)} to ${lei(after)}. By what percentage did it ${fall ? "fall" : "rise"}?`,
      parts: [
        part(`By how many lei did it change?`, 2, num(change), `|${after} − ${base}| = ${change} lei`),
        part(`What percentage of the original is that?`, 3, { type: "percent", value: p }, `${p}%`)
      ],
      solution: [
        `The change is ${change} lei.`,
        `A percentage change is always measured against the *original*: ${change}/${base} = ${p / 100}, so ${p}%.`
      ],
      selfCheck: () => Math.abs(change / base * 100 - p) < 1e-9 ? null : "find-rate mismatch"
    };
  }

  // L5 · two changes, working backwards.
  function twoChangesReverse(rng) {
    const p = rng.pick([20, 25, 50]);
    const q = rng.pick([10, 20, 25, 40, 50]);
    const base = rng.int(2, 16) * 100;
    const middle = base * (100 + p) / 100;
    const final = middle * (100 - q) / 100;
    if (!Number.isInteger(middle) || !Number.isInteger(final)) return null;
    return {
      shape: "two-changes-reverse",
      prompt: `A price rose by ${ml(M.row(M.mn(p), M.mo("%")))}, was then discounted by ${ml(M.row(M.mn(q), M.mo("%")))}, and now stands at ${lei(final)}. Find the price before either change.`,
      parts: [
        part(`What was the price after the rise, before the discount?`, 3, num(middle),
          `${final} · 100/${100 - q} = ${middle} lei`),
        part(`And before the rise?`, 2, num(base), `${middle} · 100/${100 + p} = ${base} lei`)
      ],
      solution: [
        `Undo the last change first. The discount left ${100 - q}%, so the price before it was ${final}·100/${100 - q} = ${middle} lei.`,
        `The rise made it ${100 + p}%, so before it the price was ${middle}·100/${100 + p} = ${base} lei.`,
        `Check forwards: ${base} → ${middle} → ${final}. ✓`
      ],
      selfCheck: () => Math.abs(base * (100 + p) / 100 * (100 - q) / 100 - final) < 1e-9 ? null : "reverse mismatch"
    };
  }

  // L5 · compound interest over two years.
  function compoundInterest(rng) {
    const p = rng.pick([10, 20, 25, 50]);
    const base = rng.int(2, 20) * 100;
    const year1 = base * (100 + p) / 100;
    const year2 = year1 * (100 + p) / 100;
    if (!Number.isInteger(year1) || !Number.isInteger(year2)) return null;
    return {
      shape: "compound-interest",
      prompt: `${lei(base)} is deposited at ${ml(M.row(M.mn(p), M.mo("%")))} a year, with the interest left in the account. How much is in the account after two years?`,
      parts: [
        part(`How much is there after one year?`, 2, num(year1), `${base} · ${(100 + p) / 100} = ${year1} lei`),
        part(`And after the second year?`, 3, num(year2), `${year1} · ${(100 + p) / 100} = ${year2} lei`)
      ],
      solution: [
        `After one year: ${base} · ${(100 + p) / 100} = ${year1} lei.`,
        `The second year's interest is charged on ${year1}, not on ${base}: ${year1} · ${(100 + p) / 100} = ${year2} lei.`,
        `In one step that is ${base} · ${(100 + p) / 100}² = ${year2} lei. Simple interest would have given only ${base + 2 * base * p / 100}.`
      ],
      selfCheck: () => Math.abs(base * Math.pow((100 + p) / 100, 2) - year2) < 1e-9 ? null : "compound mismatch"
    };
  }

  BAC.bankNumbers = [numbers, progressions, percentages];
})(typeof window !== "undefined" ? window : globalThis);
