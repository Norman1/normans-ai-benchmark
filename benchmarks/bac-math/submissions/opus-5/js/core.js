// Core: seeded RNG, exact rationals, and the MathML builders every question is
// written in.
//
// Two things here are load-bearing for the whole trainer.
//
// `Rng` is seeded and deterministic, so a question is fully identified by
// (topic, level, seed). That is what makes the bank testable: the headless
// checker in tools/ walks thousands of seeds and re-derives every answer, and
// it sees exactly what the browser would render.
//
// `Frac` is exact rational arithmetic. Bac answers are tidy — 1/2, 5, 2√10 —
// and the fastest way to produce a question whose answer is *not* tidy is to
// let floating point decide. Generators do their arithmetic in Frac and reject
// a parameter draw whose answer fails `looksTidy`.

(function (global) {
  "use strict";

  const BAC = (global.BAC = global.BAC || {});

  /* --- Seeded RNG ------------------------------------------------------- */

  class Rng {
    constructor(seed) {
      this.state = (seed >>> 0) || 0x9e3779b9;
      // Warm up: consecutive small seeds otherwise start off correlated, and
      // exam papers draw ten questions from ten consecutive seeds.
      for (let i = 0; i < 8; i += 1) this.next();
    }

    next() {
      let x = this.state;
      x ^= x << 13; x >>>= 0;
      x ^= x >> 17;
      x ^= x << 5; x >>>= 0;
      this.state = x;
      return x / 4294967296;
    }

    /** Integer in [lo, hi] inclusive. */
    int(lo, hi) {
      return lo + Math.floor(this.next() * (hi - lo + 1));
    }

    /** Non-zero integer in [lo, hi], skipping 0. */
    nz(lo, hi) {
      let value = 0;
      while (value === 0) value = this.int(lo, hi);
      return value;
    }

    pick(list) {
      return list[Math.floor(this.next() * list.length)];
    }

    /** n distinct members of `list`, order randomised. */
    sample(list, n) {
      const pool = list.slice();
      const out = [];
      while (out.length < n && pool.length) {
        out.push(pool.splice(Math.floor(this.next() * pool.length), 1)[0]);
      }
      return out;
    }

    shuffle(list) {
      const out = list.slice();
      for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(this.next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    }

    bool(p = 0.5) {
      return this.next() < p;
    }

    sign() {
      return this.next() < 0.5 ? -1 : 1;
    }
  }

  /* --- Exact rationals -------------------------------------------------- */

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }

  class Frac {
    constructor(n, d = 1) {
      if (d === 0) throw new Error("Frac: zero denominator");
      if (d < 0) { n = -n; d = -d; }
      const g = gcd(n, d);
      this.n = n / g;
      this.d = d / g;
    }

    static of(value) {
      return value instanceof Frac ? value : new Frac(value, 1);
    }

    add(other) { const o = Frac.of(other); return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(other) { const o = Frac.of(other); return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(other) { const o = Frac.of(other); return new Frac(this.n * o.n, this.d * o.d); }
    div(other) { const o = Frac.of(other); return new Frac(this.n * o.d, this.d * o.n); }
    neg() { return new Frac(-this.n, this.d); }
    get value() { return this.n / this.d; }
    get isInt() { return this.d === 1; }
    get sign() { return Math.sign(this.n); }
    abs() { return new Frac(Math.abs(this.n), this.d); }
    eq(other) { const o = Frac.of(other); return this.n === o.n && this.d === o.d; }
    toString() { return this.d === 1 ? String(this.n) : `${this.n}/${this.d}`; }
  }

  const F = (n, d) => new Frac(n, d);

  /* --- Tidiness --------------------------------------------------------- */

  // The trap the brief names: random parameters produce x = 8/17 and √47.3,
  // and a student can smell that instantly. Real Bac answers are small
  // integers, halves, quarters, fifths — because the examiner chose the
  // numbers so they would be. Generators call this and redraw when it fails.
  function looksTidy(frac, options = {}) {
    const f = Frac.of(frac);
    const maxNum = options.maxNum ?? 200;
    const denoms = options.denoms ?? [1, 2, 3, 4, 5, 6, 8, 10];
    if (!Number.isFinite(f.value)) return false;
    if (Math.abs(f.n) > maxNum) return false;
    return denoms.includes(f.d);
  }

  /** Retry a generator body until it produces something, or give up loudly. */
  function attempt(rng, build, tries = 400) {
    for (let i = 0; i < tries; i += 1) {
      const result = build(rng, i);
      if (result) return result;
    }
    throw new Error("generator exhausted its attempts");
  }

  const isSquare = (n) => n >= 0 && Number.isInteger(Math.sqrt(n));

  /** √n as [outside, inside]: 72 → [6, 2] meaning 6√2. inside 1 means integer. */
  function simplifySurd(n) {
    let outside = 1;
    let inside = n;
    for (let k = 2; k * k <= inside; k += 1) {
      while (inside % (k * k) === 0) { inside /= k * k; outside *= k; }
    }
    return [outside, inside];
  }

  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  /* --- MathML ----------------------------------------------------------- */
  //
  // Rendered by the browser itself. No library, no font files, no network —
  // and it is real typesetting, so a fraction inside an integral inside a
  // matrix looks like the paper rather than like ASCII art.

  const mo = (op, attrs = "") => `<mo${attrs ? " " + attrs : ""}>${op}</mo>`;
  const mi = (name) => `<mi>${name}</mi>`;
  const mn = (value) => `<mn>${value}</mn>`;
  const row = (...parts) => `<mrow>${parts.join("")}</mrow>`;

  const MINUS = "−";   // U+2212 MINUS SIGN, not a hyphen
  const CDOT = "⋅";

  /** A signed number, using a real minus sign. */
  function numML(value) {
    const v = Frac.of(value);
    if (v.d !== 1) {
      const body = `<mfrac>${mn(Math.abs(v.n))}${mn(v.d)}</mfrac>`;
      return v.n < 0 ? row(mo(MINUS), body) : body;
    }
    return v.n < 0 ? row(mo(MINUS), mn(Math.abs(v.n))) : mn(v.n);
  }

  /** Bare magnitude, no sign — for building your own sign chains. */
  function magML(value) {
    const v = Frac.of(value).abs();
    return v.d === 1 ? mn(v.n) : `<mfrac>${mn(v.n)}${mn(v.d)}</mfrac>`;
  }

  const M = {
    MINUS,
    CDOT,
    mo, mi, mn, row,
    num: numML,
    mag: magML,

    /** Wrap a body as a display-inline formula. */
    inline: (body) => `<math display="inline">${body}</math>`,
    block: (body) => `<math display="block">${body}</math>`,

    frac: (a, b) => `<mfrac>${row(a)}${row(b)}</mfrac>`,
    sqrt: (a) => `<msqrt>${row(a)}</msqrt>`,
    cbrt: (a) => `<mroot>${row(a)}${mn(3)}</mroot>`,
    sup: (a, b) => `<msup>${row(a)}${row(b)}</msup>`,
    sub: (a, b) => `<msub>${row(a)}${row(b)}</msub>`,
    subsup: (a, b, c) => `<msubsup>${row(a)}${row(b)}${row(c)}</msubsup>`,

    /** Parenthesised group with stretchy brackets. */
    paren: (body) => row(mo("(", 'stretchy="true"'), row(body), mo(")", 'stretchy="true"')),
    bracket: (body) => row(mo("["), row(body), mo("]")),
    abs: (body) => row(mo("|"), row(body), mo("|")),

    /** A surd written tidily: [3, 2] → 3√2, [3, 1] → 3, [1, 2] → √2. */
    surd(outside, inside) {
      if (inside === 1) return numML(outside);
      if (outside === 1) return M.sqrt(mn(inside));
      if (outside === -1) return row(mo(MINUS), M.sqrt(mn(inside)));
      return row(numML(outside), M.sqrt(mn(inside)));
    },

    /** Bracketed matrix. rows is a 2-D array of MathML strings. */
    matrix(rows) {
      const body = rows
        .map((r) => `<mtr>${r.map((cell) => `<mtd>${row(cell)}</mtd>`).join("")}</mtr>`)
        .join("");
      return row(
        mo("(", 'stretchy="true" symmetric="true"'),
        `<mtable columnspacing="0.9em" rowspacing="0.35em">${body}</mtable>`,
        mo(")", 'stretchy="true" symmetric="true"')
      );
    },

    /** Determinant bars. */
    detBars(rows) {
      const body = rows
        .map((r) => `<mtr>${r.map((cell) => `<mtd>${row(cell)}</mtd>`).join("")}</mtr>`)
        .join("");
      return row(
        mo("|", 'stretchy="true" symmetric="true"'),
        `<mtable columnspacing="0.9em" rowspacing="0.35em">${body}</mtable>`,
        mo("|", 'stretchy="true" symmetric="true"')
      );
    },

    /** ∫ with limits, an integrand, and dx. */
    integral(lo, hi, body, variable = "x") {
      return row(
        `<msubsup><mo largeop="true" stretchy="false">∫</mo>${row(lo)}${row(hi)}</msubsup>`,
        row(body),
        mo(" d", 'lspace="0.15em" rspace="0"'),
        mi(variable)
      );
    },

    /** Indefinite integral. */
    antiderivative: (body, variable = "x") =>
      row(mo("∫", 'largeop="true" stretchy="false"'), row(body), mo(" d"), mi(variable)),

    lim: (variable, to, body) =>
      row(
        `<munder><mo movablelimits="false">lim</mo>${row(mi(variable), mo("→"), to)}</munder>`,
        row(body)
      ),

    /** f(x), g(2), f'(x) — a named function applied to something. */
    call: (name, arg, prime = false) =>
      row(mi(name), prime ? mo("′", 'lspace="0" rspace="0"') : "", M.paren(arg)),

    /** Function-definition line: f : ℝ → ℝ, f(x) = … */
    define(name, domain, codomain, body, arg = "x") {
      return row(
        mi(name), mo(":"), domain, mo("→"), codomain, mo(","),
        M.call(name, mi(arg)), mo("="), row(body)
      );
    },

    REALS: `<mi mathvariant="double-struck">R</mi>`,
    NATURALS: `<mi mathvariant="double-struck">N</mi>`,
    INTEGERS: `<mi mathvariant="double-struck">Z</mi>`,
    INF: `<mi>∞</mi>`,

    /** Open/closed interval with real endpoints already rendered. */
    interval: (lo, hi, openLo = true, openHi = true) =>
      row(mo(openLo ? "(" : "["), lo, mo(","), hi, mo(openHi ? ")" : "]")),

    /**
     * A polynomial from [coefficient, power] pairs, tidied the way a person
     * writes it: leading + dropped, 1x → x, x^1 → x, x^0 → the number, and
     * zero coefficients omitted entirely.
     */
    poly(terms, variable = "x") {
      const live = terms.filter(([c]) => !Frac.of(c).eq(F(0, 1)));
      if (!live.length) return mn(0);
      const parts = [];
      live.forEach(([coef, power], index) => {
        const c = Frac.of(coef);
        const neg = c.sign < 0;
        const mag = c.abs();
        if (index === 0) { if (neg) parts.push(mo(MINUS)); }
        else parts.push(mo(neg ? MINUS : "+"));

        const showCoef = !(mag.eq(F(1, 1)) && power !== 0);
        if (showCoef) parts.push(magML(mag));
        if (power === 0) { /* number only */ }
        else if (power === 1) parts.push(mi(variable));
        else parts.push(M.sup(mi(variable), mn(power)));
      });
      return row(...parts);
    },

    /** Same idea but for an arbitrary list of already-rendered signed terms. */
    sum(terms) {
      const parts = [];
      terms.forEach(({ sign, body }, index) => {
        if (index === 0) { if (sign < 0) parts.push(mo(MINUS)); }
        else parts.push(mo(sign < 0 ? MINUS : "+"));
        parts.push(body);
      });
      return row(...parts);
    },

    /** a·x + b with a and b integers, rendered like an examiner would. */
    linear: (a, b, variable = "x") => M.poly([[a, 1], [b, 0]], variable),

    eq: (...parts) => row(...parts.flatMap((p, i) => (i ? [mo("="), p] : [p]))),
    ge: (a, b) => row(a, mo("≥"), b),
    le: (a, b) => row(a, mo("≤"), b),
    // Escaped, or the browser's HTML parser eats the rest of the formula.
    lt: (a, b) => row(a, mo("&lt;"), b),
    gt: (a, b) => row(a, mo("&gt;"), b),
    ne: (a, b) => row(a, mo("≠"), b),
    times: (a, b) => row(a, mo(CDOT), b),
    plus: (a, b) => row(a, mo("+"), b),
    minus: (a, b) => row(a, mo(MINUS), b),
    in: (a, b) => row(a, mo("∈"), b),

    /** log with a base, and the two named logs the syllabus uses. */
    log: (base, arg) => row(M.sub(mi("log"), mn(base)), mo("⁡"), arg),
    lg: (arg) => row(mi("lg"), mo("⁡"), arg),
    ln: (arg) => row(mi("ln"), mo("⁡"), arg),

    trig: (name, arg) => row(mi(name), mo("⁡"), arg),
    deg: (value) => row(mn(value), mo("°", 'lspace="0"')),
    e: `<mi>e</mi>`,
    pi: `<mi>π</mi>`,
  };

  /** Convenience: whole formula as inline math in one call. */
  const ml = (body) => M.inline(body);

  /**
   * A number as it should read inside a sentence: a real minus sign, and
   * bracketed when it is negative and follows an operator.
   */
  const T = (value) => String(value).replace(/^-/, MINUS);
  const Tp = (value) => (Number(value) < 0 ? `(${T(value)})` : String(value));

  /** "3x" but "x" when the coefficient is 1 and "−x" when it is −1. */
  const coef = (value, symbol) => {
    if (value === 1) return symbol;
    if (value === -1) return `${MINUS}${symbol}`;
    return `${T(value)}${symbol}`;
  };

  BAC.core = { Rng, Frac, F, gcd, looksTidy, attempt, isSquare, simplifySurd, range, M, ml, T, Tp, coef };
})(typeof window !== "undefined" ? window : globalThis);
