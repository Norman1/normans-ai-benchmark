// Reading what the student typed.
//
// The barem's first rule is "any correct method earns full marks", and the
// spirit of that applies to notation too: 1/2 and 0,5 and 2/4 are the same
// answer, and a trainer that marks one of them wrong is teaching the student
// something false about the exam.
//
// So input is parsed into a number (or an interval, or a set, or a function of
// x) and compared numerically. The parser handles fractions, surds, π, e, ln,
// powers, implicit multiplication, the Romanian decimal comma, and a trailing
// "lei" or "%" — everything this student is likely to type.

(function (global) {
  "use strict";

  const BAC = (global.BAC = global.BAC || {});
  const EPS = 1e-9;

  /* --- Tokeniser -------------------------------------------------------- */

  const CONSTANTS = { pi: Math.PI, "π": Math.PI, e: Math.E };
  const FUNCTIONS = {
    sqrt: Math.sqrt, "√": Math.sqrt, rad: Math.sqrt, radical: Math.sqrt,
    cbrt: Math.cbrt,
    ln: Math.log,
    lg: (v) => Math.log10(v),
    log: (v) => Math.log10(v),
    abs: Math.abs
  };

  function normalise(text) {
    return String(text)
      .replace(/[−–—]/g, "-")       // minus sign, dashes
      .replace(/[×·∙⋅]/g, "*") // × · ∙ ⋅
      .replace(/÷/g, "/")
      .replace(/∞/g, "inf")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenize(input) {
    const tokens = [];
    let i = 0;
    const src = input.toLowerCase();
    while (i < src.length) {
      const ch = src[i];
      if (ch === " ") { i += 1; continue; }
      if (/[0-9.]/.test(ch)) {
        let j = i;
        while (j < src.length && /[0-9.]/.test(src[j])) j += 1;
        tokens.push({ type: "num", value: parseFloat(src.slice(i, j)) });
        i = j;
        continue;
      }
      if (/[a-z√π]/.test(ch)) {
        let j = i;
        while (j < src.length && /[a-z]/.test(src[j])) j += 1;
        if (j === i) j = i + 1;                       // a single √ or π
        tokens.push({ type: "name", value: src.slice(i, j) });
        i = j;
        continue;
      }
      if ("+-*/^()|".includes(ch)) { tokens.push({ type: ch }); i += 1; continue; }
      throw new Error(`I could not read “${ch}”`);
    }
    return tokens;
  }

  /* --- Parser ----------------------------------------------------------- */
  //
  // Recursive descent over: expr → term → power → unary → primary, with
  // implicit multiplication so 2√10, 3π and 2(x+1) all work.

  function parseExpression(tokens, vars) {
    let pos = 0;
    const peek = () => tokens[pos];
    const eat = (type) => {
      if (!tokens[pos] || tokens[pos].type !== type) throw new Error("unexpected end");
      return tokens[pos++];
    };

    function expr() {
      let value = term();
      while (peek() && (peek().type === "+" || peek().type === "-")) {
        const op = tokens[pos++].type;
        const rhs = term();
        value = op === "+" ? value + rhs : value - rhs;
      }
      return value;
    }

    // What may follow a value as an implicit multiplication: 2√10, 3π, 2(x+1).
    // "|" is deliberately absent — it both opens and closes, so treating it as
    // a fresh factor would read |−7| as |·(−7)·| and never find its closing bar.
    function startsPrimary() {
      const token = peek();
      if (!token) return false;
      return token.type === "num" || token.type === "name" || token.type === "(";
    }

    function term() {
      let value = power();
      for (;;) {
        const token = peek();
        if (!token) break;
        if (token.type === "*" || token.type === "/") {
          pos += 1;
          const rhs = power();
          value = token.type === "*" ? value * rhs : value / rhs;
        } else if (startsPrimary()) {
          value *= power();                            // implicit multiplication
        } else break;
      }
      return value;
    }

    function power() {
      const base = unary();
      if (peek() && peek().type === "^") {
        pos += 1;
        return Math.pow(base, power());                // right-associative
      }
      return base;
    }

    function unary() {
      if (peek() && peek().type === "-") { pos += 1; return -unary(); }
      if (peek() && peek().type === "+") { pos += 1; return unary(); }
      return primary();
    }

    function primary() {
      const token = peek();
      if (!token) throw new Error("the expression stops early");
      if (token.type === "num") { pos += 1; return token.value; }
      if (token.type === "(") {
        pos += 1;
        const value = expr();
        eat(")");
        return value;
      }
      if (token.type === "|") {
        pos += 1;
        const value = expr();
        eat("|");
        return Math.abs(value);
      }
      if (token.type === "name") {
        const name = token.value;
        pos += 1;
        if (Object.prototype.hasOwnProperty.call(FUNCTIONS, name)) {
          // √ and ln bind tighter than × : ln 3 x means (ln 3)·x
          const arg = peek() && peek().type === "(" ? (pos += 1, (() => { const v = expr(); eat(")"); return v; })())
            : power();
          return FUNCTIONS[name](arg);
        }
        if (Object.prototype.hasOwnProperty.call(CONSTANTS, name)) return CONSTANTS[name];
        if (Object.prototype.hasOwnProperty.call(vars, name)) return vars[name];
        throw new Error(`I do not know “${name}”`);
      }
      throw new Error("I could not read that");
    }

    const value = expr();
    if (pos < tokens.length) throw new Error("there is something extra at the end");
    return value;
  }

  /** Evaluate a typed expression, optionally with variables bound. */
  function evaluate(text, vars = {}) {
    let clean = normalise(text);
    clean = clean.replace(/\b(de\s+)?lei\b/gi, "").replace(/%$/, "").trim();
    if (!clean) throw new Error("empty");
    // Romanian decimal comma, but only when it is clearly a decimal point.
    if (/^-?\s*\d+,\d+$/.test(clean)) clean = clean.replace(",", ".");
    return parseExpression(tokenize(clean), vars);
  }

  const near = (a, b) => {
    if (a === b) return true;                    // covers ±∞ at an interval end
    return Number.isFinite(a) && Number.isFinite(b)
      && Math.abs(a - b) <= EPS * Math.max(1, Math.abs(a), Math.abs(b));
  };

  /* --- Checkers per answer type ---------------------------------------- */

  function stripLead(text) {
    // "y = 3x - 2", "x = 5", "a = 12", "F(x) = ..." → the right-hand side.
    return String(text).replace(/^\s*[a-zA-Z]\s*(\([a-zA-Z]\))?\s*=\s*/, "").trim();
  }

  function splitList(text) {
    return String(text)
      .replace(/[{}]/g, "")
      .replace(/\band\b|\bși\b|\bsi\b/gi, ",")
      .replace(/;/g, ",")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }

  const CHECKERS = {
    /** A single number: 12, 1/2, 0,5, 2√10, ln 3, 3π. */
    number(input, spec) {
      const value = evaluate(input);
      return near(value, spec.value);
    },

    /** A percentage: accepts "20" and "20%". */
    percent(input, spec) {
      return near(evaluate(input), spec.value);
    },

    /** A function of x, compared at sample points: tangents, antiderivatives. */
    expr(input, spec) {
      const body = stripLead(input);
      const samples = spec.samples ?? [0.37, 1.61, 2.24];
      return samples.every((x) => near(evaluate(body, { x }), spec.fn(x)));
    },

    /** An interval or union of intervals. */
    interval(input, spec) {
      const parsed = parseIntervals(input);
      const wanted = spec.parts;
      if (parsed.length !== wanted.length) return false;
      return wanted.every((want, index) => {
        const got = parsed[index];
        return near(got.lo, want.lo) && near(got.hi, want.hi)
          && got.openLo === want.openLo && got.openHi === want.openHi;
      });
    },

    /** An unordered set of numbers: {-1, 4/5}. */
    set(input, spec) {
      const parts = splitList(input).map((part) => evaluate(part));
      if (parts.length !== spec.values.length) return false;
      const remaining = spec.values.slice();
      return parts.every((value) => {
        const index = remaining.findIndex((want) => near(value, want));
        if (index < 0) return false;
        remaining.splice(index, 1);
        return true;
      });
    },

    /** An ordered pair: coordinates. Accepts "(3,4)", "3,4", "a=3, b=4". */
    pair(input, spec) {
      const parts = splitList(String(input).replace(/[()]/g, "").replace(/[a-zA-Z]\s*=/g, ""));
      if (parts.length !== 2) return false;
      return near(evaluate(parts[0]), spec.values[0]) && near(evaluate(parts[1]), spec.values[1]);
    },

    /** One of a fixed list — rendered as buttons, so the value is exact. */
    choice(input, spec) {
      return String(input).trim() === String(spec.value).trim();
    }
  };

  function parseIntervals(input) {
    const clean = normalise(input)
      .replace(/^x\s*(∈|in|apartine)\s*/i, "")
      .replace(/\bU\b/g, "∪")
      .replace(/\bunion\b/gi, "∪");
    return clean.split(/[∪]/).map((chunk) => {
      const match = chunk.trim().match(/^([\[\(])(.+?)[,;](.+?)([\]\)])$/);
      if (!match) throw new Error("write it as an interval, for example [-3,1]");
      const [, open, loText, hiText, close] = match;
      const readEnd = (text) => {
        const t = text.trim().toLowerCase();
        if (/^-\s*inf/.test(t)) return -Infinity;
        if (/^\+?\s*inf/.test(t)) return Infinity;
        return evaluate(t);
      };
      const lo = readEnd(loText);
      const hi = readEnd(hiText);
      return {
        lo, hi,
        openLo: open === "(" || !Number.isFinite(lo),
        openHi: close === ")" || !Number.isFinite(hi)
      };
    });
  }

  /**
   * Mark one typed answer against its spec.
   * Returns { ok, error } — `error` explains a parse failure, never a wrong
   * answer, because "you wrote 7 and it is 8" is the feedback's job.
   */
  function check(input, spec) {
    if (input == null || String(input).trim() === "") return { ok: false, empty: true };
    const checker = CHECKERS[spec.type] || CHECKERS.number;
    try {
      return { ok: Boolean(checker(input, spec)) };
    } catch (error) {
      return { ok: false, error: error.message || "I could not read that" };
    }
  }

  BAC.answer = { check, evaluate, near, parseIntervals, normalise };
})(typeof window !== "undefined" ? window : globalThis);
